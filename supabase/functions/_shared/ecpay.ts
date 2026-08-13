// _shared/ecpay.ts — 綠界 ECPay 共用工具（CheckMacValue、環境設定）
// CheckMacValue 規則（AioCheckOut V5, SHA256）：
//   1. 參數依 key 排序（不含 CheckMacValue）
//   2. HashKey=...&k1=v1&...&HashIV=...
//   3. .NET UrlEncode（等效：encodeURIComponent 後把 ~ ' 補編碼、%20→+；
//      保留 - _ . ! * ( ) 不編碼 —— encodeURIComponent 本就不編這些）
//   4. 全轉小寫 → SHA256 → 十六進位大寫
import { resolveEcpay } from "./ecpay-config.mjs";

/**
 * 綠界環境設定。判斷邏輯在 ecpay-config.mjs（純函式，由 ecpay-config.test.mjs 測）。
 *
 * ECPAY_MODE=sandbox（預設）才會 fallback 到綠界公開測試商店；
 * ECPAY_MODE=live 缺任何一個值、或用到測試憑證、或 action URL 不是正式站台，
 * 一律 throw——寧可付款流程當場失敗，也不要安靜地把真實客戶送去沙盒付款
 * （測試卡付得過 → 訂單標 paid → VIP 免費開通，而且沒有任何一步會噴錯）。
 */
export function ecpayEnv() {
  return resolveEcpay((k: string) => Deno.env.get(k));
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
