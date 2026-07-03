// export-gateway — 匯出閘門 Edge Function（VoltSketch）
// 部署：supabase functions deploy export-gateway
// 目前額度核心在 Postgres RPC（consume_export_quota，見 supabase/sql/export-quota.sql），
// 前端可直呼 RPC。本 Function 提供同介面的後端入口，供之後把「檔案生成」搬進來：
// 到時前端只拿到一次性下載結果，改前端 JS 也繞不過額度。
//
// actions:
//   { action: "check-quota",   exportType: "kicad" }
//   { action: "consume-quota", exportType: "kicad" }
//
// 安全：用「請求者的 JWT」建 client → RPC 內 auth.uid() = 該使用者；
//       本檔不用 service_role（額度操作不需要繞 RLS）。

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "not_authenticated" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },  // 以請求者身分執行 → RLS/auth.uid() 正確
    );

    const { action, exportType } = await req.json();
    if (typeof exportType !== "string" || !exportType || exportType.length > 32) {
      return json({ error: "bad_export_type" }, 400);
    }

    if (action === "check-quota") {
      const { data, error } = await supabase.rpc("get_export_quota", { p_export_type: exportType });
      if (error) return json({ error: error.message }, 500);
      return json(Array.isArray(data) ? data[0] : data);
    }
    if (action === "consume-quota") {
      const { data, error } = await supabase.rpc("consume_export_quota", { p_export_type: exportType });
      if (error) return json({ error: error.message }, 500);
      return json(Array.isArray(data) ? data[0] : data);
    }
    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
