/**
 * ecpay-config.test.mjs — 綠界環境設定閘門的測試
 *
 * 守的不變式：**正式模式下絕不能用沙盒憑證處理真實付款**。
 * 原本的 ecpayEnv() 四個值都有沙盒 fallback，secrets 掉了會安靜地把真客戶
 * 送到測試商店（測試卡付得過 → 訂單 paid → VIP 免費開通），整條路不噴錯。
 *
 * 先證明它抓得到已知缺陷（前 5 條就是那些缺陷），再相信它的乾淨報告。
 *
 * 執行：node ecpay-config.test.mjs
 */
import { resolveEcpay, _internal } from './supabase/functions/_shared/ecpay-config.mjs';

const T = _internal.TEST;
const LIVE = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
const STAGE = _internal.STAGE_URL;
const env = (o) => (k) => o[k];

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('  FAIL: ' + msg); } };
const throws = (fn, re, msg) => {
  try { fn(); fail++; console.log('  FAIL: ' + msg + '（應該要 throw，卻通過了）'); }
  catch (e) { if (re.test(e.message)) pass++; else { fail++; console.log(`  FAIL: ${msg}（訊息不符：${e.message}）`); } }
};

// ── 1) live 模式缺任何一個值都要炸，不准 fallback ──
for (const miss of ['ECPAY_MERCHANT_ID', 'ECPAY_HASH_KEY', 'ECPAY_HASH_IV', 'ECPAY_ACTION_URL']) {
  const full = {
    ECPAY_MODE: 'live', ECPAY_MERCHANT_ID: '3011111',
    ECPAY_HASH_KEY: 'realkeyrealkey12', ECPAY_HASH_IV: 'realivrealiv1234',
    ECPAY_ACTION_URL: LIVE
  };
  delete full[miss];
  throws(() => resolveEcpay(env(full)), new RegExp(miss), `live 缺 ${miss} 要 throw`);
}

// ── 2) live 模式用測試憑證要炸（就算四個都填齊）──
throws(() => resolveEcpay(env({
  ECPAY_MODE: 'live', ECPAY_MERCHANT_ID: T.merchantId,
  ECPAY_HASH_KEY: T.hashKey, ECPAY_HASH_IV: T.hashIV, ECPAY_ACTION_URL: LIVE
})), /公開測試憑證/, 'live 用綠界公開測試憑證要 throw');

throws(() => resolveEcpay(env({
  ECPAY_MODE: 'live', ECPAY_MERCHANT_ID: '3011111',
  ECPAY_HASH_KEY: T.hashKey, ECPAY_HASH_IV: 'realivrealiv1234', ECPAY_ACTION_URL: LIVE
})), /公開測試憑證/, 'live 只要有一個值是測試憑證就要 throw');

// ── 3) live 模式指到沙盒站台要炸 ──
throws(() => resolveEcpay(env({
  ECPAY_MODE: 'live', ECPAY_MERCHANT_ID: '3011111',
  ECPAY_HASH_KEY: 'realkeyrealkey12', ECPAY_HASH_IV: 'realivrealiv1234', ECPAY_ACTION_URL: STAGE
})), /不是正式站台/, 'live 指到 payment-stage 要 throw');

// ── 4) sandbox 模式指到正式站台要炸（拿測試章打真金流）──
throws(() => resolveEcpay(env({ ECPAY_ACTION_URL: LIVE })), /sandbox 卻指向正式站台/, 'sandbox 指到正式站台要 throw');

// ── 5) 正常路徑 ──
{
  const c = resolveEcpay(env({}));
  ok(c.mode === 'sandbox', '沒設 ECPAY_MODE 預設 sandbox');
  ok(c.merchantId === T.merchantId && c.hashKey === T.hashKey && c.hashIV === T.hashIV, 'sandbox 沒設就用官方公開測試憑證');
  ok(c.actionUrl === STAGE, 'sandbox 預設用 payment-stage');
}
{
  const c = resolveEcpay(env({
    ECPAY_MODE: 'live', ECPAY_MERCHANT_ID: '3011111',
    ECPAY_HASH_KEY: 'realkeyrealkey12', ECPAY_HASH_IV: 'realivrealiv1234', ECPAY_ACTION_URL: LIVE
  }));
  ok(c.mode === 'live' && c.merchantId === '3011111' && c.actionUrl === LIVE, 'live 設定齊全就照用');
}
{
  const c = resolveEcpay(env({ ECPAY_MODE: 'LIVE', ECPAY_MERCHANT_ID: '3011111',
    ECPAY_HASH_KEY: 'realkeyrealkey12', ECPAY_HASH_IV: 'realivrealiv1234', ECPAY_ACTION_URL: LIVE }));
  ok(c.mode === 'live', 'ECPAY_MODE 大小寫不敏感');
}
// sandbox 可以自帶測試商店以外的憑證（例如廠商給的測試帳號）
{
  const c = resolveEcpay(env({ ECPAY_MERCHANT_ID: '2000933', ECPAY_ACTION_URL: STAGE }));
  ok(c.merchantId === '2000933' && c.mode === 'sandbox', 'sandbox 可用自訂測試商店代號');
}

console.log(`\n${fail ? 'FAIL' : 'OK'}：${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
