// ecpay-webhook — 綠界付款結果通知（server-to-server）
// 部署（必須關 JWT 驗證，綠界不會帶 token）：
//   supabase functions deploy ecpay-webhook --no-verify-jwt --use-api
//
// 安全鏈（缺一不可）：
//   1. 驗 CheckMacValue（用我方 HashKey/HashIV 重算比對）→ 擋偽造通知。
//      沒驗簽 = 任何人 POST 就能免費變 VIP。
//   2. 對 orders 表核對 trade_no 存在、金額一致 → 擋改價。
//   3. 條件式 update（只認 pending）搶單 → 同一筆通知重送也只入帳一次。
//   4. 通過才以 service_role 更新 orders + user_plans。
//   5. 回應本文必須是 "1|OK"，否則綠界會重送。
//
// 回應規則（決定綠界會不會重試，所有錯誤處理都繞著它轉）：
//   "1|OK" = 我方確定處理完畢，不用再送。其他 = 請再送一次。
//   所以**任何一步 DB 失敗都不准回 1|OK**：回了就等於說「錢收下、事辦好了」，
//   實際上使用者的 VIP 沒開通，而且沒有第二次機會。

import { createClient } from "npm:@supabase/supabase-js@2";
import { checkMacValue, ecpayEnv } from "../_shared/ecpay.ts";
import { nextExpiry } from "../_shared/plan-dates.mjs";

// 方案規則（需與 create-order 的 PLANS 一致）：額度/月、期限月數、是否全解鎖
const PLAN_RULES: Record<string, { limit: number; months: number; unlockAll: boolean }> = {
  vip_1m:  { limit: 30, months: 1,  unlockAll: false },
  vip_3m:  { limit: 30, months: 3,  unlockAll: false },
  vip_6m:  { limit: 30, months: 6,  unlockAll: false },
  vip_12m: { limit: 30, months: 12, unlockAll: true },  // 12 個月：+面試題庫+PCB 權限
};

Deno.serve(async (req) => {
  const text = (s: string, code = 200) => new Response(s, { status: code });
  try {
    if (req.method !== "POST") return text("0|Method", 405);

    // 綠界以 application/x-www-form-urlencoded POST
    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [k, v] of form.entries()) params[k] = String(v);

    // 1) 驗簽
    const env = ecpayEnv();
    const mac = await checkMacValue(params, env.hashKey, env.hashIV);
    if (mac !== params.CheckMacValue) return text("0|CheckMacValue Error");

    // 付款失敗通知：認掉即可（RtnCode=1 才是成功）
    if (params.RtnCode !== "1") return text("1|OK");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 2) 核對訂單：存在、金額一致
    const { data: order, error: findErr } = await admin.from("orders")
      .select("id, user_id, plan, amount, status")
      .eq("trade_no", params.MerchantTradeNo).maybeSingle();
    if (findErr) return text("0|DB Error: order lookup");    // 查不動 → 讓綠界重送
    if (!order) return text("0|Order Not Found");
    if (String(order.amount) !== String(params.TradeAmt)) return text("0|Amount Mismatch");
    if (order.status === "paid") return text("1|OK");         // 已入帳：重送直接認掉

    // 3) 條件式搶單：只有把 pending 改成 paid 成功的那一次才往下發權益。
    //    綠界重送導致兩個請求同時進來時，第二個影響 0 列 → 認掉。
    //    沒有這道，配上下面的「到期日累加」就會變成重送一次送雙倍期限。
    const { data: claimed, error: claimErr } = await admin.from("orders")
      .update({
        status: "paid",
        ecpay_trade_no: params.TradeNo ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id).eq("status", "pending")
      .select("id");
    if (claimErr) return text("0|DB Error: claim");
    if (!claimed || claimed.length === 0) return text("1|OK");  // 別人搶先處理完了

    // 搶到單之後若失敗，要把訂單放回 pending。否則綠界重送會走到上面的
    // 「已入帳 → 1|OK」而永遠不再嘗試發權益 = 收了錢沒開通。
    const release = async () => {
      await admin.from("orders")
        .update({ status: "pending", paid_at: null })
        .eq("id", order.id);
    };

    // 贊助：只入帳、不發任何權益
    if (order.plan === "sponsor") return text("1|OK");
    // 未知方案：入帳但不升級（安全 fallback——舊版預設發 1 個月 VIP，已移除）
    const rule = PLAN_RULES[order.plan];
    if (!rule) return text("1|OK");

    // 4) 續購累加：從「現在」與「目前到期日」取較晚者起算，不吃掉剩餘天數。
    //    算法在 _shared/plan-dates.mjs，由 plan-dates.test.mjs 顧著（含月底不溢位）。
    const { data: cur, error: curErr } = await admin.from("user_plans")
      .select("plan_expires_at").eq("user_id", order.user_id).maybeSingle();
    if (curErr) { await release(); return text("0|DB Error: plan lookup"); }

    const expires = nextExpiry(cur?.plan_expires_at ?? null, rule.months, new Date());

    const { error: planErr } = await admin.from("user_plans").upsert({
      user_id: order.user_id, plan: order.plan,
      monthly_export_limit: rule.limit,
      plan_expires_at: expires.toISOString(),
      unlock_all: rule.unlockAll,
      updated_at: new Date().toISOString(),
    });
    if (planErr) { await release(); return text("0|DB Error: plan upsert"); }

    // 年付全解鎖：同步 profiles 旗標（面試題 RLS / PCB 權限沿用既有機制）
    if (rule.unlockAll) {
      const { error: profErr } = await admin.from("profiles").upsert({
        id: order.user_id, interview_paid: true, pcb_access: true,
      });
      // 這裡刻意不 release：期限已經寫進 user_plans 了，退回 pending 會讓重送再累加一次。
      // 記進 log，由站主用 owner-unlock.sql 手動補這兩個旗標即可。
      if (profErr) console.error("profiles upsert failed for", order.user_id, profErr.message);
    }

    return text("1|OK");
  } catch (e) {
    return text("0|" + String((e as Error)?.message ?? e), 500);
  }
});
