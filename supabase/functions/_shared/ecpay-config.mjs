/**
 * ecpay-config.mjs — 綠界環境設定的判斷（純函式，Deno 與 node 都能載）
 *
 * 為什麼要獨立成一支：原本 ecpayEnv() 四個值都用 `??` 給沙盒預設，
 * 正式上線後只要 secrets 掉了或變數名打錯，function 不會報錯，
 * 而是**安靜地把真實客戶送到沙盒付款頁**——測試卡付得過、webhook 用沙盒
 * HashKey 驗章也過、訂單標 paid、VIP 免費開通。整條路上沒有一個地方會噴錯。
 *
 * 規則：
 *   ECPAY_MODE=live    → 四個值缺一不可，且 action URL 必須是正式站台；
 *                        用到官方公開測試憑證一律擋下。缺就 throw，不 fallback。
 *   ECPAY_MODE=sandbox → （預設）允許 fallback 到官方公開測試商店，
 *                        但不准把測試憑證配上正式站台。
 *
 * 這支被 ecpay.ts 引用，並由 ecpay-config.test.mjs（node）逐條測試。
 */

// 綠界官方文件公布的公開測試商店（非機密）
const TEST = {
  merchantId: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIV: 'v77hoKGq4kWxNNIS'
};
const STAGE_URL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
const LIVE_HOST = 'payment.ecpay.com.tw';
const STAGE_HOST = 'payment-stage.ecpay.com.tw';

function hostOf(url) {
  const m = String(url || '').match(/^https?:\/\/([^/]+)/);
  return m ? m[1].toLowerCase() : '';
}

/**
 * @param {(k: string) => (string|undefined)} get 取環境變數
 * @returns {{mode:string, merchantId:string, hashKey:string, hashIV:string, actionUrl:string}}
 * @throws {Error} live 模式設定不完整或看起來像沙盒時
 */
function resolveEcpay(get) {
  const mode = (get('ECPAY_MODE') || 'sandbox').toLowerCase();
  const merchantId = get('ECPAY_MERCHANT_ID');
  const hashKey = get('ECPAY_HASH_KEY');
  const hashIV = get('ECPAY_HASH_IV');
  const actionUrl = get('ECPAY_ACTION_URL');

  if (mode === 'live') {
    const missing = [];
    if (!merchantId) missing.push('ECPAY_MERCHANT_ID');
    if (!hashKey) missing.push('ECPAY_HASH_KEY');
    if (!hashIV) missing.push('ECPAY_HASH_IV');
    if (!actionUrl) missing.push('ECPAY_ACTION_URL');
    if (missing.length) {
      throw new Error('ECPAY_MODE=live 但缺少：' + missing.join('、') + '（拒絕以沙盒憑證處理真實付款）');
    }
    if (merchantId === TEST.merchantId || hashKey === TEST.hashKey || hashIV === TEST.hashIV) {
      throw new Error('ECPAY_MODE=live 但用的是綠界公開測試憑證，拒絕啟用');
    }
    if (hostOf(actionUrl) !== LIVE_HOST) {
      throw new Error('ECPAY_MODE=live 但 ECPAY_ACTION_URL 不是正式站台（' + LIVE_HOST + '）');
    }
    return { mode, merchantId, hashKey, hashIV, actionUrl };
  }

  // sandbox：允許 fallback，但不准把測試憑證指到正式站台（那會拿測試章去打真金流）
  const cfg = {
    mode: 'sandbox',
    merchantId: merchantId || TEST.merchantId,
    hashKey: hashKey || TEST.hashKey,
    hashIV: hashIV || TEST.hashIV,
    actionUrl: actionUrl || STAGE_URL
  };
  if (hostOf(cfg.actionUrl) === LIVE_HOST) {
    throw new Error('ECPAY_MODE=sandbox 卻指向正式站台；要收真錢請設 ECPAY_MODE=live 並填正式憑證');
  }
  return cfg;
}

const _internal = { TEST, STAGE_URL, LIVE_HOST, STAGE_HOST, hostOf };

export { resolveEcpay, _internal };
