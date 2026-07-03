// _shared/ecpay.ts — 綠界 ECPay 共用工具（CheckMacValue、環境設定）
// CheckMacValue 規則（AioCheckOut V5, SHA256）：
//   1. 參數依 key 排序（不含 CheckMacValue）
//   2. HashKey=...&k1=v1&...&HashIV=...
//   3. .NET UrlEncode（等效：encodeURIComponent 後把 ~ ' 補編碼、%20→+；
//      保留 - _ . ! * ( ) 不編碼 —— encodeURIComponent 本就不編這些）
//   4. 全轉小寫 → SHA256 → 十六進位大寫
export function ecpayEnv() {
  // 正式環境把三個值放 Supabase secrets（supabase secrets set ECPAY_...）。
  // 未設定時 fallback 綠界「公開測試」商店（官方文件公布的 sandbox 憑證，非機密）。
  return {
    merchantId: Deno.env.get("ECPAY_MERCHANT_ID") ?? "2000132",
    hashKey: Deno.env.get("ECPAY_HASH_KEY") ?? "5294y06JbISpM5x9",
    hashIV: Deno.env.get("ECPAY_HASH_IV") ?? "v77hoKGq4kWxNNIS",
    actionUrl: Deno.env.get("ECPAY_ACTION_URL") ??
      "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5", // stage=sandbox；正式換 payment.ecpay.com.tw
  };
}

function dotNetUrlEncode(s: string): string {
  return encodeURIComponent(s)
    .replace(/~/g, "%7e")
    .replace(/'/g, "%27")
    .replace(/%20/g, "+");
}

export async function checkMacValue(
  params: Record<string, string>, hashKey: string, hashIV: string,
): Promise<string> {
  const keys = Object.keys(params)
    .filter((k) => k !== "CheckMacValue")
    .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  const raw = `HashKey=${hashKey}&` +
    keys.map((k) => `${k}=${params[k]}`).join("&") + `&HashIV=${hashIV}`;
  const encoded = dotNetUrlEncode(raw).toLowerCase();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(encoded));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
