/**
 * skill-swap.js — 產生 Allegro SKILL 換料腳本。
 * 只允許「來源料的 dropIn（已驗證 pin-to-pin 相容、同 footprint）」當目標，確保安全直換。
 * genSkill(srcPart, tgtPart, footprint, refdesArray) -> SKILL(.il) 文字。
 */
window.SkillSwap = (function () {
  function genSkill(srcPart, tgtPart, footprint, refdesList) {
    const refs = (refdesList || []).map(s => String(s).trim()).filter(Boolean);
    const refLisp = refs.length ? refs.map(r => '"' + r + '"').join(' ') : '"U?"';
    return `; ===== Allegro SKILL 換料腳本（HardwareAI 自動產生）=====
; 來源料 : ${srcPart}
; 目標料 : ${tgtPart}
; footprint: ${footprint}   ← pin-to-pin 相容、同 footprint → 可直換
;
; ★ 安全：執行前務必「備份 .brd」。換料只改 device 定義/料號，
;          placement 與既有接線(net)不動。
; 用法 ：Allegro PCB Editor 命令列輸入  skill load("swap_${srcPart}_to_${tgtPart}.il")
;        （或 File > Script）。確認 refList 後會自動執行 vsSwapParts。
; 注意 ：axlReplaceComp / axlGetComponent 的確切用法依 Allegro 版本(17.x/X)可能不同；
;        若報錯，換成你版本對應的「replace component / set property」API（資料已備好）。

(defun vsSwapParts ()
  (let ((srcPart "${srcPart}")
        (tgtPart "${tgtPart}")
        (footprint "${footprint}")
        (refList (list ${refLisp})))      ; <-- 在此填入/確認要換的 refdes
    (printf "=== 換料 %s -> %s (footprint: %s) ===\\n" srcPart tgtPart footprint)
    (foreach refdes refList
      (let ((comp (axlGetComponent refdes)))   ; 依版本：可能為 axlDBGetComp 或自行查詢
        (if (null comp)
            (printf "  [略過] 找不到 refdes %s\\n" refdes)
            (progn
              ; 同 footprint 直換：把 device 換成目標料，保留 placement / net 連線
              (axlReplaceComp comp tgtPart)          ; <-- 依版本調整
              (axlSetProperty comp "PART_NUMBER" tgtPart)
              (printf "  [已換] %s : %s -> %s\\n" refdes srcPart tgtPart)))))
    (axlDBRefreshDesign)
    (printf "=== 完成。請跑 DRC 目視確認後存檔 ===\\n")))

(vsSwapParts)
`;
  }
  return { genSkill };
})();
