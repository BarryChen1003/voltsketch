// create-order — 建立綠界付款訂單（VoltSketch VIP）
// 部署：supabase functions deploy create-order
// 流程：驗 JWT → 方案/金額「後端型錄」決定（不信前端）→ 寫 orders(pending)
//       → 產綠界 AioCheckOut 參數 + CheckMacValue → 回傳 {action, fields} 給前端組 form POST。
// 安全：service_role 只在此處（寫 orders）；金額不收前端參數。

import { createClient } from "npm:@supabase/supabase-js@2";
import { checkMacValue, ecpayEnv } from "../_shared/ecpay.ts";

// ---- 方案型錄（唯一真相：金額/額度/期限都在後端；價格可調，webhook 的 PLAN_RULES 需同步）----
const PLANS: Record<string, { amount: number; desc: string }> = {
  vip_1m:  { amount: 300,  desc: "VoltSketch VIP 1 個月" },
  vip_3m:  { amount: 750,  desc: "VoltSketch VIP 3 個月" },   // 250/月
  vip_6m:  { amount: 1500, desc: "VoltSketch VIP 6 個月" },   // 250/月
  vip_12m: { amount: 3300, desc: "VoltSketch VIP 12 個月(含面試題庫+PCB)" },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    // 1) 驗使用者
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "not_authenticated" }, 401);

    // 2) 方案（後端型錄）
    const { plan } = await req.json();
    const p = PLANS[plan];
    if (!p) return json({ error: "unknown_plan" }, 400);

    // 3) 建訂單（service_role；client 無 insert 權限）
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const tradeNo = ("VS" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8))
      .toUpperCase().slice(0, 20);
    const { error: insErr } = await admin.from("orders").insert({
      user_id: user.id, trade_no: tradeNo, plan, amount: p.amount, status: "pending",
    });
    if (insErr) return json({ error: "order_insert: " + insErr.message }, 500);

    // 4) 綠界參數
    const env = ecpayEnv();
    const now = new Date(Date.now() + 8 * 3600 * 1000);  // 綠界要台北時間
    const pad = (n: number) => String(n).padStart(2, "0");
    const tradeDate = `${now.getUTCFullYear()}/${pad(now.getUTCMonth() + 1)}/${pad(now.getUTCDate())} ` +
      `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
    const returnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/ecpay-webhook`;

    const fields: Record<string, string> = {
      MerchantID: env.merchantId,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: tradeDate,
      PaymentType: "aio",
      TotalAmount: String(p.amount),
      TradeDesc: p.desc,
      ItemName: p.desc,
      ReturnURL: returnUrl,                       // 綠界 server-to-server 通知
      ClientBackURL: req.headers.get("origin") ?? "",  // 付完返回站上
      ChoosePayment: "ALL",
      EncryptType: "1",
      CustomField1: user.id,                      // 備援對帳（主對帳走 orders 表）
    };
    fields.CheckMacValue = await checkMacValue(fields, env.hashKey, env.hashIV);

    return json({ action: env.actionUrl, fields });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
