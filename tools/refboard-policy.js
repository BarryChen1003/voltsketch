/**
 * refboard-policy.js — 公版繞線的「線寬與淨空」政策（refboard-rebuild 與 refboard-fill 共用）
 *
 * 為什麼要抽出來：這段是政策不是演算法。重建與補繞兩支工具如果各留一份，
 * 遲早分岔——而分岔的症狀是「補繞出來的線在重建的板上違規」，兩邊都說自己是對的。
 *
 * 兩個來源都要看，缺一個就會漏：
 *   ConstraintMgr —— net class 的最小線寬與 class 間的淨空矩陣（default|power 0.2、diff|power 0.25）
 *   NetRules      —— pattern → 最小線寬（預設就有 VIN 0.5mm、GND 0.3mm）
 * node 沒有 localStorage，所以 NetRules 在工具裡要自己 load()：只看 ConstraintMgr 的話，
 * 工具說 0 錯、使用者一載入就看到「VIN 有 11 段 < 0.5mm」。
 */
'use strict';

function makePolicy(win, baseClearance) {
  const CM = win.ConstraintMgr || null;
  const cmData = CM ? CM.load() : null;
  const NR = win.NetRules || null;
  const nrData = NR ? NR.load() : null;

  const widthOf = net => {
    const cls = cmData ? CM.classOf(cmData, net || '') : null;
    const minW = cls && cls.phys && cls.phys.minW;
    const nr = nrData ? NR.match(nrData, net || '') : null;
    const nrMin = nr && nr.minW > 0 ? nr.minW : 0;
    return Math.max(0.15, minW || 0, nrMin);
  };

  // 淨空取「這批 net 對板上所有 net」的最嚴值。寬鬆一點會過 PadDrc 但被 cm_e_clear 抓到。
  const clearanceFor = (nets, allNets) => {
    if (!cmData) return baseClearance;
    let need = baseClearance.traceToTrace;
    for (const a of nets) for (const b of allNets) {
      need = Math.max(need, CM.clearanceBetween(cmData, a, b, baseClearance.traceToTrace));
    }
    return Object.assign({}, baseClearance, {
      traceToTrace: need,
      traceToPad: Math.max(baseClearance.traceToPad, need)
    });
  };

  return { widthOf, clearanceFor, cmData };
}

module.exports = { makePolicy };
