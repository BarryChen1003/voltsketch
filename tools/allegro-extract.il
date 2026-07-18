; ============================================================
; allegro-extract.il — HardwareAI 板面資料匯出（Allegro SKILL）
; 用途：在 Allegro PCB Editor 內執行，把目前開啟的 .brd 匯出成
;       vs-board-extract JSON（components / pins / nets / vias），
;       給 HardwareAI pcb-viewer.html 讀取（分層/搜尋/找料/換料/co-lay）。
; 用法：
;   1. Allegro 開啟 .brd
;   2. 命令列輸入：  skill load("allegro-extract.il")
;   3. 再輸入：      vsExtract()
;   4. 產出 vsboard.json（在 .brd 同目錄），拖進 HardwareAI「PCB 檢視器」
; 注意：
;   - axl* API 名稱依 Allegro 版本（17.2 / 17.4 / X）可能微調；
;     讀不到的欄位會寫空字串，不會中斷。
;   - 本腳本只「讀」設計，不做任何修改，執行安全。
; ============================================================

(defun vsJsonStr (s)
  ; 簡易 JSON 字串跳脫（雙引號/反斜線）
  (if (null s) ""
    (progn
      (setq s (buildString (parseString s "\\") "\\\\"))
      (setq s (buildString (parseString s "\"") "\\\""))
      s)))

(defun vsExtract ()
  (let ((d (axlDBGetDesign)) out first units nm)
    (unless d (printf "vsExtract: 沒有開啟的設計\n") (return nil))
    (setq units (or d->units "mils"))
    (setq out (outfile "vsboard.json" "w"))
    (fprintf out "{\n\"format\":\"vs-board-extract\",\"version\":1,\n")
    (fprintf out "\"board\":\"%s\",\"units\":\"%s\",\n" (vsJsonStr d->name) units)

    ; ---- components ----
    (fprintf out "\"components\":[\n")
    (setq first t)
    (foreach comp d->components
      (let ((sym comp->symbol) x y rot lay dev)
        (when sym
          (setq x (xCoord sym->xy)) (setq y (yCoord sym->xy))
          (setq rot (or sym->rotation 0.0))
          (setq lay (if sym->isMirrored "BOTTOM" "TOP"))
          (setq dev (if comp->device comp->device->name ""))
          (unless first (fprintf out ",\n")) (setq first nil)
          (fprintf out "{\"refdes\":\"%s\",\"part\":\"%s\",\"footprint\":\"%s\",\"layer\":\"%s\",\"x\":%f,\"y\":%f,\"rot\":%f}"
            (vsJsonStr comp->refdes) (vsJsonStr dev) (vsJsonStr sym->name) lay x y rot))))
    (fprintf out "\n],\n")

    ; ---- pins（含 net 對應）----
    (fprintf out "\"pins\":[\n")
    (setq first t)
    (foreach comp d->components
      (let ((sym comp->symbol))
        (when sym
          (foreach pin sym->pins
            (let ((netn (if pin->net pin->net->name "")) px py)
              (setq px (xCoord pin->xy)) (setq py (yCoord pin->xy))
              (unless first (fprintf out ",\n")) (setq first nil)
              (fprintf out "{\"refdes\":\"%s\",\"pin\":\"%s\",\"net\":\"%s\",\"x\":%f,\"y\":%f}"
                (vsJsonStr comp->refdes) (vsJsonStr pin->name) (vsJsonStr netn) px py))))))
    (fprintf out "\n],\n")

    ; ---- vias ----
    (fprintf out "\"vias\":[\n")
    (setq first t)
    (foreach via d->vias
      (let ((netn (if via->net via->net->name "")) vx vy)
        (setq vx (xCoord via->xy)) (setq vy (yCoord via->xy))
        (unless first (fprintf out ",\n")) (setq first nil)
        (fprintf out "{\"net\":\"%s\",\"x\":%f,\"y\":%f}" (vsJsonStr netn) vx vy)))
    (fprintf out "\n]\n}\n")

    (close out)
    (printf "vsExtract: 已輸出 vsboard.json（components/pins/vias）\n")
    t))

(printf "已載入。執行 vsExtract() 產出 vsboard.json\n")
