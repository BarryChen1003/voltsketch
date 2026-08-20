// pcb-export — 產生 Gerber 打版包（需登入＋PCB 權限）
// 部署：supabase functions deploy pcb-export --use-api
//       （**不要**加 --no-verify-jwt：這支就是要驗身分）
//
// 為什麼要有這支：
//   Gerber 產生器原本是 gerber-export.js，跟著 pcb.html 送給每一個訪客。
//   也就是說任何人不登入就能產出可製造的檔案——PCB 這個付費功能真正的價值
//   （拿去打版的那包東西）等於免費。閘門只是蓋在畫面上的一層 DOM，刪掉就沒了。
//
//   現在產生器只存在於這裡（supabase/ 不會被部署成靜態資產），前端拿不到程式碼。
//   沒有權限的人可以照樣畫板子，但按下匯出會被擋，而且他無法自己重建。
//
//   編輯器本身仍在瀏覽器跑——互動工具搬後端會變慢又貴，而且沒有必要。
//   擋的是「產出」不是「操作」。
//
// 回傳：ZIP 的位元組（application/zip），連同 X-Gerber-Meta 標頭帶回統計與警告。

import { createClient } from "npm:@supabase/supabase-js@2";
import { build, zipStore } from "../_shared/gerber.mjs";

// 只認自家網域（與 create-order 同一套理由）
const ALLOWED_ORIGINS = new Set([
  "https://hardware-ai.org",
  "https://www.hardware-ai.org",
  "http://localhost:8099",
]);
const SITE_URL = "https://hardware-ai.org";

function corsFor(req: Request): Record<string, string> {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(o) ? o : SITE_URL,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Expose-Headers": "X-Gerber-Meta",
    "Vary": "Origin",
  };
}

// 板子狀態的上限：Edge Function 有記憶體與時間限制，而且沒有理由收下 20MB 的 JSON
const MAX_BODY = 4 * 1024 * 1024;

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    // 1) 身分：沒有登入就沒有權限可談
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "not_authenticated" }, 401);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await anon.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "not_authenticated" }, 401);

    // 2) 權限：以 service_role 查，前端傳什麼都不採信。
    //    到期判斷與站台一致——profiles 的旗標是「買過」，user_plans 的到期日才決定「現在還有效」。
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: prof, error: profErr } = await admin
      .from("profiles").select("pcb_access, role").eq("id", user.id).maybeSingle();
    if (profErr) return json({ error: "db_error" }, 500);

    const isAdmin = prof?.role === "admin";
    let allowed = isAdmin;
    if (!allowed && prof?.pcb_access) {
      const { data: plan } = await admin
        .from("user_plans").select("plan_expires_at").eq("user_id", user.id).maybeSingle();
      // 沒有方案列或到期日是 null＝手動授權（白名單），不過期
      const exp = plan?.plan_expires_at ? new Date(plan.plan_expires_at) : null;
      allowed = !exp || exp.getTime() > Date.now();
    }
    if (!allowed) return json({ error: "pcb_access_required" }, 403);

    // 3) 匯出額度：跟其它格式走同一個計數器，額度也擋得住
    const { data: quota, error: qErr } = await anon.rpc("consume_export_quota", { p_export_type: "gerber" });
    if (qErr) return json({ error: "quota_error" }, 500);
    const q = Array.isArray(quota) ? quota[0] : quota;
    if (!q?.allowed) return json({ error: q?.reason || "quota_exceeded" }, 429);

    // 4) 板子狀態
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ error: "board_too_large" }, 413);
    let body: { state?: unknown; baseName?: string };
    try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }
    const state = body?.state as Record<string, unknown> | undefined;
    if (!state || typeof state !== "object") return json({ error: "missing_state" }, 400);

    // padAbs 原本是前端傳進去的方法（綁著 app）。它只是座標運算，
    // 在這裡重算一次，前端就不必把函式序列化過來（也不可能）。
    const padAbs = (comp: any, pad: any) => {
      const th = ((comp?.rot ?? 0) * Math.PI) / 180;
      const c = Math.cos(th), s = Math.sin(th);
      return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c };
    };

    // 5) 產生
    const baseName = String(body.baseName || "hardwareai").replace(/[^\w.-]/g, "_").slice(0, 64);
    const r = build(state, padAbs, baseName);
    const zip = zipStore(r.files.map((f: any) => ({ name: f.name, text: f.text })));

    // 統計與警告走標頭（本體是 ZIP 位元組）。警告是 { k, v }，由前端翻成四語。
    const meta = {
      files: r.files.map((f: any) => f.name),
      drillCounts: r.drillCounts,
      cplCount: r.cplCount,
      ipcRecords: r.ipcRecords,
      warnings: r.warnings,
      remaining: q.remaining,
    };

    return new Response(zip, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseName}-gerber.zip"`,
        // 標頭只能放 ASCII；中文會在 warnings 的 v 裡，所以整包做 base64
        "X-Gerber-Meta": btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(meta)))),
      },
    });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
