// ecpay-webhook — 綠界付款結果通知（server-to-server）
// 部署（必須關 JWT 驗證，綠界不會帶 token）：
//   supabase functions deploy ecpay-webhook --no-verify-jwt
//
// 安全鏈（缺一不可）：
//   1. 驗 CheckMacValue（用我方 HashKey/HashIV 重算比對）→ 擋偽造通知。
//      沒驗簽 = 任何人 POST 就能免費變 VIP。
//   2. 對 orders 表核對 trade_no 存在、金額一致、狀態 pending → 擋重放與改價。
//   3. 通過才以 service_role 更新 orders + user_plans。
//   4. 回應本文必須是 "1|OK"，否則綠界會重送。

import { createClient } from "npm:@supabase/supabase-js@2";
import { checkMacValue, ecpayEnv } from "../_shared/ecpay.ts";

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

    // 2) 核對訂單：存在、金額一致、尚未入帳（防重放）
    const { data: order } = await admin.from("orders")
      .select("id, user_id, plan, amount, status")
      .eq("trade_no", params.MerchantTradeNo).maybeSingle();
    if (!order) return text("0|Order Not Found");
    if (String(order.amount) !== String(params.TradeAmt)) return text("0|Amount Mismatch");
    if (order.status === "paid") return text("1|OK");  // 重送通知：冪等

    // 3) 入帳 + 升級
    await admin.from("orders").update({
      status: "paid", ecpay_trade_no: params.TradeNo ?? null, paid_at: new Date().toISOString(),
    }).eq("id", order.id);

    const rule = PLAN_RULES[order.plan] ?? { limit: 30, months: 1, unlockAll: false };
    const expires = new Date();
    expires.setMonth(expires.getMonth() + rule.months);
    await admin.from("user_plans").upsert({
      user_id: order.user_id, plan: order.plan,
      monthly_export_limit: rule.limit,
      plan_expires_at: expires.toISOString(),
      unlock_all: rule.unlockAll,
      updated_at: new Date().toISOString(),
    });

    // 年付全解鎖：同步 profiles 旗標（面試題 RLS / PCB 權限沿用既有機制）
    if (rule.unlockAll) {
      await admin.from("profiles").upsert({
        id: order.user_id, interview_paid: true, pcb_access: true,
      });
    }

    return text("1|OK");
  } catch (e) {
    return text("0|" + String((e as Error)?.message ?? e), 500);
  }
});
