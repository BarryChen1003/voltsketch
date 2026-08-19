/**
 * ui-i18n.js — 線路圖編輯器（app.js）畫面文字的四語字典
 *
 * 硬規矩 6：畫面上的字一律四語。app.js 原本把提示、DRC 訊息、參數標籤全寫死中文。
 * key 就是中文原文（跟 knowledge-art-i18n.js 同一套做法）：改動最小，查不到就回原文，
 * 不會因為缺一條就讓編輯器爆掉。插值用 {name} 佔位。
 *
 * 覆蓋率由 ui-i18n-check.js 把關（掃 app.js 實際會顯示的中文字串，少一條就紅）。
 *
 * 寫譯文的規矩：
 *   - 訊號名/料號/單位/公式原樣保留（Vgs(th)、Rds(on)、0.1µF、8/20µs）。
 *   - DRC 訊息是給工程師看的，用該語言的業界說法，不要逐字直譯。
 *   - 參數標籤要短：屬性面板欄位窄。
 */
(function () {
  const D = {
    // ── 自訂 IC 的保留機制（需登入）──
    '已建立 {name}（{pins} 腳），並存進元件庫可重複使用': { en: 'Created {name} ({pins} pins) and saved it to your library for reuse', ja: '{name}（{pins} ピン）を作成し、部品ライブラリに保存しました（再利用可）', ko: '{name}({pins}핀)을 만들고 부품 라이브러리에 저장했습니다(재사용 가능)' },
    '自訂 IC 要登入才能保留下來，否則換一張圖就不見了': { en: 'Custom ICs need an account to persist, otherwise they vanish when you open another sheet', ja: 'カスタム IC を保持するにはログインが必要です。ログインしないと別の図面を開いた時点で消えます', ko: '커스텀 IC를 보관하려면 로그인이 필요합니다. 그렇지 않으면 다른 도면을 열면 사라집니다' },
    '要現在登入嗎？登入後建立的 IC 會留在你的元件庫。': { en: 'Sign in now? ICs you create will stay in your library.', ja: '今すぐログインしますか？作成した IC は部品ライブラリに残ります。', ko: '지금 로그인할까요? 만든 IC는 부품 라이브러리에 남습니다.' },
    '存進元件庫失敗：{err}': { en: 'Could not save to the library: {err}', ja: '部品ライブラリへの保存に失敗：{err}', ko: '부품 라이브러리 저장 실패: {err}' },
    '從 datasheet 建 IC 需要登入，這樣抽出來的腳位才留得住': { en: 'Building an IC from a datasheet needs an account, so the pins you extract are kept', ja: 'datasheet から IC を作るにはログインが必要です。抽出したピンを保持するためです', ko: 'datasheet로 IC를 만들려면 로그인이 필요합니다. 추출한 핀을 보관하기 위해서입니다' },

    // ── Net 命名（文字綁到導線）──
    '這條 net 的電壓': { en: 'Voltage of this net', ja: 'この net の電圧', ko: '이 net의 전압' },
    '留空＝不指定。填了之後，同一條 net 出現兩個不同電壓會被線路檢查判為短路。': { en: 'Leave blank to skip. Once set, two different voltages on one net are flagged as a short by the checker.', ja: '空欄なら未指定。入力すると、同じ net に異なる電圧が二つある場合は回路チェックで短絡と判定されます。', ko: '비워두면 미지정. 값을 넣으면 같은 net에 서로 다른 전압이 있을 때 회로 검사가 단락으로 판정합니다.' },
    '那裡沒有導線，請點在線上': { en: 'No wire there. Click on a wire.', ja: 'そこには配線がありません。配線の上をクリックしてください。', ko: '거기에는 배선이 없습니다. 배선 위를 클릭하세요.' },
    '已命名 {n} 段導線為「{name}」': { en: 'Named {n} wire segment(s) "{name}"', ja: '{n} 本の配線を「{name}」と命名しました', ko: '배선 {n}개를 "{name}"(으)로 명명했습니다' },
    '尚未綁定：目前只是純文字註解': { en: 'Not bound yet: this is just a text note for now', ja: '未紐付け：現在は単なるテキスト注記です', ko: '아직 연결 안 됨: 지금은 단순 텍스트 주석입니다' },
    '重新指定 Net': { en: 'Re-assign net', ja: 'net を指定し直す', ko: 'net 다시 지정' },
    '指定 Net（點一條線）': { en: 'Assign net (click a wire)', ja: 'net を指定（配線をクリック）', ko: 'net 지정(배선 클릭)' },
    '取消綁定': { en: 'Unbind', ja: '紐付けを解除', ko: '연결 해제' },
    '已取消綁定，這段文字回到純註解': { en: 'Unbound. This text is a plain note again.', ja: '紐付けを解除しました。このテキストは注記に戻ります。', ko: '연결을 해제했습니다. 이 텍스트는 다시 단순 주석입니다.' },
    '先填文字內容，才知道這條 net 要叫什麼': { en: 'Type the text first, otherwise the net has no name to take', ja: '先にテキストを入力してください。net に付ける名前が決まりません', ko: '먼저 텍스트를 입력하세요. net에 붙일 이름이 없습니다' },
    '點一下要命名的那條線（Esc 取消）': { en: 'Click the wire you want to name (Esc to cancel)', ja: '名前を付けたい配線をクリック（Esc で中止）', ko: '이름을 붙일 배선을 클릭하세요(Esc로 취소)' },

    // ── 雲端 / 專案 ──
    '已載入雲端專案': { en: 'Cloud project loaded', ja: 'クラウドのプロジェクトを読み込みました', ko: '클라우드 프로젝트를 불러왔습니다' },
    '已同步到雲端': { en: 'Synced to cloud', ja: 'クラウドに同期しました', ko: '클라우드에 동기화했습니다' },
    '同步失敗：{err}': { en: 'Sync failed: {err}', ja: '同期に失敗：{err}', ko: '동기화 실패: {err}' },
    '已儲存': { en: 'Saved', ja: '保存しました', ko: '저장했습니다' },
    '匯入成功': { en: 'Import complete', ja: 'インポート完了', ko: '가져오기 완료' },
    '匯入失敗: {err}': { en: 'Import failed: {err}', ja: 'インポート失敗：{err}', ko: '가져오기 실패: {err}' },
    '確定要新建專案？': { en: 'Start a new project?', ja: '新しいプロジェクトを作成しますか？', ko: '새 프로젝트를 시작할까요?' },
    '已載入範例電路': { en: 'Example circuit loaded', ja: 'サンプル回路を読み込みました', ko: '예제 회로를 불러왔습니다' },
    '請先選擇檔案': { en: 'Choose a file first', ja: 'まずファイルを選んでください', ko: '먼저 파일을 선택하세요' },

    // ── IC 元件庫 ──
    '找不到該 IC（{id}）': { en: 'IC not found ({id})', ja: 'IC が見つかりません（{id}）', ko: 'IC를 찾을 수 없습니다({id})' },
    'IC 元件庫尚無資料（到「IC 元件庫」分頁新增）': { en: 'IC library is empty (add parts on the IC Library page)', ja: 'IC ライブラリが空です（「IC ライブラリ」ページで追加）', ko: 'IC 라이브러리가 비었습니다(IC 라이브러리 페이지에서 추가)' },
    '無符合的 IC': { en: 'No matching IC', ja: '該当する IC なし', ko: '일치하는 IC 없음' },
    'IC 已儲存（點庫中卡片即可放上畫布）': { en: 'IC saved (click its card to place it)', ja: 'IC を保存しました（カードをクリックで配置）', ko: 'IC를 저장했습니다(카드를 클릭해 배치)' },
    'IC 已儲存': { en: 'IC saved', ja: 'IC を保存しました', ko: 'IC를 저장했습니다' },
    '此 IC 無 pin 定義': { en: 'This IC has no pin definition', ja: 'この IC にはピン定義がありません', ko: '이 IC에는 핀 정의가 없습니다' },
    '請輸入至少一支 pin': { en: 'Enter at least one pin', ja: 'ピンを 1 本以上入力してください', ko: '핀을 최소 1개 입력하세요' },
    '已放置 {name}（{pins} 腳拆成 {n} 個 unit）': { en: 'Placed {name} ({pins} pins split into {n} units)', ja: '{name} を配置（{pins} ピンを {n} ユニットに分割）', ko: '{name} 배치({pins}핀을 {n}개 유닛으로 분할)' },
    '已放置 {name}': { en: 'Placed {name}', ja: '{name} を配置しました', ko: '{name}을(를) 배치했습니다' },
    '已建立 {name}（{pins} 腳）': { en: 'Created {name} ({pins} pins)', ja: '{name} を作成（{pins} ピン）', ko: '{name} 생성({pins}핀)' },

    // ── PDF 解析 ──
    'PDF 解析器未載入': { en: 'PDF parser not loaded', ja: 'PDF パーサが読み込まれていません', ko: 'PDF 파서가 로드되지 않았습니다' },
    '解析 PDF 中...': { en: 'Parsing PDF…', ja: 'PDF を解析中…', ko: 'PDF 분석 중…' },
    '解析中...': { en: 'Parsing…', ja: '解析中…', ko: '분석 중…' },
    'PDF 解析失敗：{err}': { en: 'PDF parsing failed: {err}', ja: 'PDF の解析に失敗：{err}', ko: 'PDF 분석 실패: {err}' },
    '找到 {n} 個 Pin 定義': { en: 'Found {n} pin definitions', ja: 'ピン定義を {n} 件検出', ko: '핀 정의 {n}개 발견' },
    '抽到 {n} 腳（{pkg}），請對照 datasheet 校正後再建立': { en: 'Extracted {n} pins ({pkg}) — check them against the datasheet before creating', ja: '{n} ピンを抽出しました（{pkg}）。datasheet と照合してから作成してください', ko: '{n}핀을 추출했습니다({pkg}). datasheet와 대조한 뒤 생성하세요' },
    '這份 PDF 找不到腳位表（可能是掃描圖檔版，或版型不認得），請手動輸入': { en: 'No pin table found in this PDF (it may be a scanned image, or a layout we do not recognise) — enter the pins manually', ja: 'この PDF にピン表が見つかりません（スキャン画像版か、対応していないレイアウトです）。手動で入力してください', ko: '이 PDF에서 핀 표를 찾지 못했습니다(스캔 이미지이거나 인식하지 못하는 레이아웃). 직접 입력하세요' },
    '找到腳位表標題，但下面讀不到內容': { en: 'Found the pin-table heading, but no table content under it', ja: 'ピン表の見出しは見つかりましたが、その下の内容が読めません', ko: '핀 표 제목은 찾았지만 그 아래 내용을 읽지 못했습니다' },
    '讀不出哪一欄是腳號、哪一欄是腳名': { en: 'Could not tell which column holds pin numbers and which holds pin names', ja: 'どの列がピン番号でどの列がピン名か判別できません', ko: '어느 열이 핀 번호이고 어느 열이 핀 이름인지 판별하지 못했습니다' },
    '找到腳位表，但一列都認不出來': { en: 'Found the pin table, but could not read a single row', ja: 'ピン表は見つかりましたが、1 行も読み取れませんでした', ko: '핀 표는 찾았지만 한 행도 인식하지 못했습니다' },
    '腳號 {nums} 沒抽到，請對照 datasheet 補上': { en: 'Pins {nums} were not extracted — add them from the datasheet', ja: 'ピン {nums} は抽出できませんでした。datasheet を見て補ってください', ko: '핀 {nums}은(는) 추출하지 못했습니다. datasheet를 보고 추가하세요' },
    '跳過一列看不懂的內容：{text}': { en: 'Skipped a row we could not parse: {text}', ja: '解釈できない行をスキップしました：{text}', ko: '해석할 수 없는 행을 건너뛰었습니다: {text}' },
    '腳名重複得太多，可能整欄抓錯，請逐列對照 datasheet': { en: 'Too many repeated pin names — the wrong column may have been read. Check every row against the datasheet', ja: 'ピン名の重複が多すぎます。列を取り違えている可能性があるため、datasheet と 1 行ずつ照合してください', ko: '핀 이름이 너무 많이 중복됩니다. 열을 잘못 읽었을 수 있으니 datasheet와 한 행씩 대조하세요' },
    '腳名多半只有一兩個字，可能抓到的是 TYPE 欄不是腳名欄': { en: 'Most pin names are only one or two characters — this may be the TYPE column, not the name column', ja: 'ピン名がほぼ 1〜2 文字です。ピン名欄ではなく TYPE 欄を読んでいる可能性があります', ko: '핀 이름이 대부분 한두 글자입니다. 핀 이름 열이 아니라 TYPE 열을 읽었을 수 있습니다' },
    '這份 datasheet 有多個封裝（{all}），目前取 {pkg}，請確認是你要的那個': { en: 'This datasheet covers several packages ({all}); {pkg} was used — check it is the one you want', ja: 'この datasheet は複数パッケージ（{all}）を含みます。現在 {pkg} を使用しています。目的のものか確認してください', ko: '이 datasheet는 여러 패키지({all})를 다룹니다. 현재 {pkg}를 사용했으니 원하는 것인지 확인하세요' },
    'datasheet 寫這顆有 {declared} 腳，只抽到 {got} 腳，剩下的請手動補': { en: 'The datasheet says this part has {declared} pins but only {got} were extracted — add the rest by hand', ja: 'datasheet ではこの品番は {declared} ピンですが、{got} ピンしか抽出できませんでした。残りは手動で追加してください', ko: 'datasheet에는 이 부품이 {declared}핀이라고 되어 있지만 {got}핀만 추출했습니다. 나머지는 직접 추가하세요' },

    // ── 畫布 / 匯出 ──
    'netlist 已複製': { en: 'Netlist copied', ja: 'ネットリストをコピーしました', ko: '넷리스트를 복사했습니다' },
    '複製失敗': { en: 'Copy failed', ja: 'コピーに失敗', ko: '복사 실패' },
    '畫布沒有內容': { en: 'Canvas is empty', ja: 'キャンバスが空です', ko: '캔버스가 비었습니다' },
    '畫布沒有元件': { en: 'No components on canvas', ja: 'キャンバスに部品がありません', ko: '캔버스에 부품이 없습니다' },
    '瀏覽器擋了彈窗': { en: 'Pop-up blocked by the browser', ja: 'ブラウザがポップアップをブロックしました', ko: '브라우저가 팝업을 차단했습니다' },
    '線路圖': { en: 'Schematic', ja: '回路図', ko: '회로도' },
    '元件 {c}・導線 {w}': { en: '{c} parts · {w} wires', ja: '部品 {c}・配線 {w}', ko: '부품 {c}·배선 {w}' },
    '引擎未載入': { en: 'Engine not loaded', ja: 'エンジンが読み込まれていません', ko: '엔진이 로드되지 않았습니다' },
    '⚗ 電晶體 {n} 顆為實驗性匯出（閘/基極自動接，通道端可能需在 Falstad 內微調）：{list}': { en: '⚗ {n} transistors exported experimentally (gate/base auto-wired; channel ends may need tweaking in Falstad): {list}', ja: '⚗ トランジスタ {n} 個は実験的エクスポート（ゲート/ベースは自動接続、チャネル側は Falstad で微調整が必要な場合あり）：{list}', ko: '⚗ 트랜지스터 {n}개는 실험적 내보내기(게이트/베이스 자동 연결, 채널 쪽은 Falstad에서 조정 필요할 수 있음): {list}' },
    '⚠ {n} 個元件未轉換（邏輯閘/雙MOS/OP/DC-DC），已略過：{list}': { en: '⚠ {n} components not converted (logic gates / dual MOS / op-amp / DC-DC) and skipped: {list}', ja: '⚠ {n} 個の部品は未変換（論理ゲート/デュアル MOS/OP アンプ/DC-DC）でスキップ：{list}', ko: '⚠ 부품 {n}개는 변환되지 않아 건너뜀(로직 게이트/듀얼 MOS/OP앰프/DC-DC): {list}' },

    // ── BOM ──
    '畫布沒有可列入 BOM 的元件': { en: 'No components to list in the BOM', ja: 'BOM に載せる部品がありません', ko: 'BOM에 넣을 부품이 없습니다' },
    '沒有元件': { en: 'No components', ja: '部品がありません', ko: '부품이 없습니다' },
    '品項 {kinds} 種・總數 {total}': { en: '{kinds} line items · {total} pcs', ja: '品目 {kinds} 種・合計 {total} 個', ko: '품목 {kinds}종·총 {total}개' },
    'BOM 料表': { en: 'BOM', ja: 'BOM（部品表）', ko: 'BOM(부품표)' },
    '項次': { en: '#', ja: '項番', ko: '번호' },
    '標號': { en: 'Ref', ja: 'リファレンス', ko: '레퍼런스' },
    '數量': { en: 'Qty', ja: '数量', ko: '수량' },
    '類別': { en: 'Type', ja: '種別', ko: '종류' },
    '值': { en: 'Value', ja: '値', ko: '값' },
    '規格': { en: 'Spec', ja: '仕様', ko: '사양' },
    '備註': { en: 'Notes', ja: '備考', ko: '비고' },

    // ── 屬性面板 ──
    '已選 {n} 條導線': { en: '{n} wires selected', ja: '配線 {n} 本を選択', ko: '배선 {n}개 선택' },
    '顏色': { en: 'Color', ja: '色', ko: '색상' },
    '已選取 {n} 個元件': { en: '{n} components selected', ja: '部品 {n} 個を選択', ko: '부품 {n}개 선택' },
    '文字內容': { en: 'Text', ja: 'テキスト', ko: '텍스트' },
    '文字': { en: 'Text', ja: 'テキスト', ko: '텍스트' },
    '其他參數/備註（自由填）': { en: 'Other params / notes (free text)', ja: 'その他パラメータ／備考（自由記入）', ko: '기타 파라미터/비고(자유 입력)' },
    '任何會影響特性的條件...': { en: 'Anything that affects behaviour…', ja: '特性に影響する条件など…', ko: '특성에 영향을 주는 조건 등…' },
    '套用預設規格...': { en: 'Apply a preset…', ja: 'プリセットを適用…', ko: '프리셋 적용…' },
    '先選一個元件': { en: 'Select a component first', ja: 'まず部品を選んでください', ko: '먼저 부품을 선택하세요' },
    '預設名稱（例：10k 0402 1%）': { en: 'Preset name (e.g. 10k 0402 1%)', ja: 'プリセット名（例：10k 0402 1%）', ko: '프리셋 이름(예: 10k 0402 1%)' },
    '已存預設「{name}」': { en: 'Preset "{name}" saved', ja: 'プリセット「{name}」を保存', ko: '프리셋 "{name}" 저장' },
    '套用預設「{name}」': { en: 'Preset "{name}" applied', ja: 'プリセット「{name}」を適用', ko: '프리셋 "{name}" 적용' },
    '先選要刪的預設': { en: 'Select the preset to delete', ja: '削除するプリセットを選んでください', ko: '삭제할 프리셋을 선택하세요' },
    '已刪除預設': { en: 'Preset deleted', ja: 'プリセットを削除しました', ko: '프리셋을 삭제했습니다' },

    // ── 元件類別（BOM/列印用）──
    '比較器': { en: 'Comparator', ja: 'コンパレータ', ko: '비교기' },
    '邏輯閘': { en: 'Logic gate', ja: '論理ゲート', ko: '로직 게이트' },

    // ── 參數標籤（屬性面板；要短）──
    '容差': { en: 'Tolerance', ja: '許容差', ko: '허용오차' },
    '額定功率': { en: 'Power rating', ja: '定格電力', ko: '정격 전력' },
    '溫度係數': { en: 'Temp. coeff.', ja: '温度係数', ko: '온도계수' },
    '耐壓': { en: 'Voltage rating', ja: '耐圧', ko: '내압' },
    '介質': { en: 'Dielectric', ja: '誘電体', ko: '유전체' },
    '電解': { en: 'Electrolytic', ja: '電解', ko: '전해' },
    '鉭': { en: 'Tantalum', ja: 'タンタル', ko: '탄탈' },
    '飽和電流 Isat': { en: 'Isat', ja: '飽和電流 Isat', ko: '포화전류 Isat' },
    '額定電流 Irms': { en: 'Irms', ja: '定格電流 Irms', ko: '정격전류 Irms' },
    '順向壓降 Vf': { en: 'Vf', ja: '順方向電圧 Vf', ko: '순방향 전압 Vf' },
    '順向電流 If': { en: 'If', ja: '順方向電流 If', ko: '순방향 전류 If' },
    '二極體類型': { en: 'Diode type', ja: 'ダイオード種別', ko: '다이오드 종류' },
    '整流': { en: 'Rectifier', ja: '整流', ko: '정류' },
    '蕭特基': { en: 'Schottky', ja: 'ショットキー', ko: '쇼트키' },
    '齊納': { en: 'Zener', ja: 'ツェナー', ko: '제너' },
    '變容': { en: 'Varactor', ja: 'バラクタ', ko: '버랙터' },
    '光電': { en: 'Photodiode', ja: 'フォトダイオード', ko: '포토다이오드' },
    '最大電流': { en: 'Max current', ja: '最大電流', ko: '최대 전류' },
    '逆向耐壓 Vr': { en: 'Vr', ja: '逆耐圧 Vr', ko: '역내압 Vr' },
    '齊納電壓 Vz(齊納)': { en: 'Vz (Zener)', ja: 'ツェナー電圧 Vz', ko: '제너 전압 Vz' },
    '崩潰電壓(TVS)': { en: 'Vbr (TVS)', ja: '降伏電圧（TVS）', ko: '항복 전압(TVS)' },
    '反向恢復 trr': { en: 'trr', ja: '逆回復 trr', ko: '역회복 trr' },
    '開關狀態': { en: 'Switch state', ja: 'スイッチ状態', ko: '스위치 상태' },
    '閾值 Vgs(th)': { en: 'Vgs(th)', ja: 'しきい値 Vgs(th)', ko: '문턱값 Vgs(th)' },
    '導通 Vgs(on)': { en: 'Vgs(on)', ja: 'オン Vgs(on)', ko: '온 Vgs(on)' },
    '閘極電荷 Qg': { en: 'Qg', ja: 'ゲート電荷 Qg', ko: '게이트 전하 Qg' },
    'M1 狀態': { en: 'M1 state', ja: 'M1 状態', ko: 'M1 상태' },
    'M2 狀態': { en: 'M2 state', ja: 'M2 状態', ko: 'M2 상태' },
    '增益 hFE/β': { en: 'hFE/β', ja: '利得 hFE/β', ko: '이득 hFE/β' },
    '供電 Vcc': { en: 'Vcc', ja: '電源 Vcc', ko: '전원 Vcc' },
    '遲滯 Vhys': { en: 'Vhys', ja: 'ヒステリシス Vhys', ko: '히스테리시스 Vhys' },
    '傳播延遲': { en: 'Prop. delay', ja: '伝搬遅延', ko: '전파 지연' },
    '輸出型': { en: 'Output type', ja: '出力形式', ko: '출력 형식' },
    '開漏': { en: 'Open-drain', ja: 'オープンドレイン', ko: '오픈드레인' },
    '推挽': { en: 'Push-pull', ja: 'プッシュプル', ko: '푸시풀' },
    '參考 Vref': { en: 'Vref', ja: '基準 Vref', ko: '기준 Vref' },
    '供電': { en: 'Supply', ja: '電源', ko: '전원' },
    '頻寬 GBW': { en: 'GBW', ja: '帯域 GBW', ko: '대역 GBW' },
    '轉換率 SR': { en: 'Slew rate', ja: 'スルーレート', ko: '슬루레이트' },
    '失調 Vos': { en: 'Vos', ja: 'オフセット Vos', ko: '오프셋 Vos' },
    '偏壓電流 Ib': { en: 'Ib', ja: 'バイアス電流 Ib', ko: '바이어스 전류 Ib' },
    '限流': { en: 'Current limit', ja: '電流制限', ko: '전류 제한' },
    '類型': { en: 'Type', ja: '種別', ko: '종류' },
    '頻率(AC)': { en: 'Freq (AC)', ja: '周波数（AC）', ko: '주파수(AC)' },
    '切換頻率': { en: 'Switching freq', ja: 'スイッチング周波数', ko: '스위칭 주파수' },
    '拓樸': { en: 'Topology', ja: 'トポロジ', ko: '토폴로지' },
    '導通電阻 Ron': { en: 'Ron', ja: 'オン抵抗 Ron', ko: '온저항 Ron' },
    '額定電流': { en: 'Current rating', ja: '定格電流', ko: '정격 전류' },
    '功率': { en: 'Power', ja: '電力', ko: '전력' },
    '額定電壓': { en: 'Voltage rating', ja: '定格電圧', ko: '정격 전압' },
    '分流電阻': { en: 'Shunt', ja: 'シャント抵抗', ko: '션트 저항' },
    '量程': { en: 'Range', ja: 'レンジ', ko: '측정 범위' },
    '輸入阻抗': { en: 'Input impedance', ja: '入力インピーダンス', ko: '입력 임피던스' },
    '方向': { en: 'Direction', ja: '方向', ko: '방향' },
    '雙向': { en: 'Bidirectional', ja: '双方向', ko: '양방향' },
    '單向': { en: 'Unidirectional', ja: '単方向', ko: '단방향' },
    '工作電壓 Vrwm': { en: 'Vrwm', ja: '動作電圧 Vrwm', ko: '동작 전압 Vrwm' },
    '崩潰 Vbr': { en: 'Vbr', ja: '降伏 Vbr', ko: '항복 Vbr' },
    '箝位 Vc': { en: 'Vc', ja: 'クランプ Vc', ko: '클램프 Vc' },
    '峰值電流 Ipp': { en: 'Ipp', ja: 'ピーク電流 Ipp', ko: '피크 전류 Ipp' },
    '結電容': { en: 'Cj', ja: '接合容量', ko: '접합 커패시턴스' },
    '阻抗@100MHz': { en: 'Z @100MHz', ja: 'インピーダンス@100MHz', ko: '임피던스@100MHz' },
    '共模阻抗': { en: 'CM impedance', ja: 'コモンモードインピーダンス', ko: '공통 모드 임피던스' },
    '標稱頻率': { en: 'Nominal freq', ja: '公称周波数', ko: '공칭 주파수' },
    '額定 AC': { en: 'AC rating', ja: '定格 AC', ko: '정격 AC' },
    '額定 DC': { en: 'DC rating', ja: '定格 DC', ko: '정격 DC' },
    '箝位電壓': { en: 'Clamp voltage', ja: 'クランプ電圧', ko: '클램프 전압' },
    '能量': { en: 'Energy', ja: 'エネルギー', ko: '에너지' },
    '直流放電電壓': { en: 'DC sparkover', ja: '直流放電電圧', ko: '직류 방전 전압' },
    '突波電流 8/20µs': { en: 'Isurge 8/20µs', ja: 'サージ電流 8/20µs', ko: '서지 전류 8/20µs' },
    '電容': { en: 'Capacitance', ja: '容量', ko: '커패시턴스' },
    '熔斷特性': { en: 'Blow characteristic', ja: '溶断特性', ko: '용단 특성' },
    '快熔 F': { en: 'Fast F', ja: '速断 F', ko: '속단 F' },
    '慢熔 T': { en: 'Slow T', ja: 'タイムラグ T', ko: '지연형 T' },
    '頻率': { en: 'Frequency', ja: '周波数', ko: '주파수' },
    '負載電容 CL': { en: 'CL', ja: '負荷容量 CL', ko: '부하 용량 CL' },
    '頻率容差': { en: 'Freq tolerance', ja: '周波数許容差', ko: '주파수 허용오차' },
    '備註（罩內分區用）': { en: 'Notes (shield partitioning)', ja: '備考（シールド内の区分け用）', ko: '비고(실드 내 구획용)' },
    '延遲': { en: 'Delay', ja: '遅延', ko: '지연' },
    '料號': { en: 'Part number', ja: '品番', ko: '품번' },

    // ── DRC ──
    '✓ 未發現接線問題': { en: '✓ No wiring problems found', ja: '✓ 配線の問題は見つかりません', ko: '✓ 배선 문제 없음' },
    '電路無接地 (GND)，請加接地符號': { en: 'No ground (GND) in the circuit — add a ground symbol', ja: '回路にグランド（GND）がありません。接地シンボルを追加してください', ko: '회로에 접지(GND)가 없습니다. 접지 심볼을 추가하세요' },
    '無電源（直流電源/DC-DC），主動元件無供電': { en: 'No supply (DC source / DC-DC) — active parts have no power', ja: '電源（直流電源/DC-DC）がなく、能動部品に給電されていません', ko: '전원(DC 소스/DC-DC)이 없어 능동 부품에 전원이 없습니다' },
    '浮接（未接線）': { en: 'Floating (not wired)', ja: '未接続（フローティング）', ko: '미연결(플로팅)' },
    '浮接：開漏訊號需上拉電阻': { en: 'Floating: open-drain signal needs a pull-up', ja: '未接続：オープンドレイン信号にはプルアップが必要', ko: '미연결: 오픈드레인 신호에는 풀업이 필요' },
    '浮接：reset/致能腳建議加上拉電阻': { en: 'Floating: reset/enable pin should have a pull-up', ja: '未接続：reset/enable ピンにはプルアップ推奨', ko: '미연결: reset/enable 핀에는 풀업 권장' },
    '腳{n}': { en: 'pin {n}', ja: 'ピン{n}', ko: '핀{n}' },
    '{ref}.{pin} 電源腳建議加去耦電容（0.1µF 對地）': { en: '{ref}.{pin} supply pin should have a decoupling cap (0.1µF to GND)', ja: '{ref}.{pin} 電源ピンにはデカップリング（0.1µF を GND へ）を推奨', ko: '{ref}.{pin} 전원 핀에는 디커플링 커패시터(0.1µF, GND) 권장' },
    '導線端點懸空 @({x},{y})': { en: 'Wire endpoint dangling @({x},{y})', ja: '配線の端点が浮いています @({x},{y})', ko: '배선 끝점이 떠 있습니다 @({x},{y})' },
    '{ref} 標 ON 但閘極(G)未接電壓，無法導通': { en: '{ref} marked ON but gate (G) has no voltage — cannot turn on', ja: '{ref} は ON ですがゲート(G)に電圧がなく導通しません', ko: '{ref}는 ON이지만 게이트(G)에 전압이 없어 도통하지 않습니다' },
    '{ref} 標 ON 但未填 Vgs(th)/Vgs(on)，無法確認導通': { en: '{ref} marked ON but Vgs(th)/Vgs(on) is blank — cannot confirm', ja: '{ref} は ON ですが Vgs(th)/Vgs(on) 未入力で導通を確認できません', ko: '{ref}는 ON이지만 Vgs(th)/Vgs(on)이 비어 도통을 확인할 수 없습니다' },
    '{ref} Rds(on) 非數值': { en: '{ref} Rds(on) is not a number', ja: '{ref} の Rds(on) が数値ではありません', ko: '{ref}의 Rds(on)이 숫자가 아닙니다' },
    '{ref} M1 標 ON 但 G1 未接電壓': { en: '{ref} M1 marked ON but G1 has no voltage', ja: '{ref} M1 は ON ですが G1 に電圧がありません', ko: '{ref} M1은 ON이지만 G1에 전압이 없습니다' },
    '{ref} M2 標 ON 但 G2 未接電壓': { en: '{ref} M2 marked ON but G2 has no voltage', ja: '{ref} M2 は ON ですが G2 に電圧がありません', ko: '{ref} M2는 ON이지만 G2에 전압이 없습니다' },
    '{ref} 開漏輸出需上拉電阻': { en: '{ref} open-drain output needs a pull-up', ja: '{ref} のオープンドレイン出力にはプルアップが必要', ko: '{ref} 오픈드레인 출력에는 풀업이 필요합니다' },
    '{ref} 未填供電 Vcc': { en: '{ref} has no Vcc', ja: '{ref} の電源 Vcc が未入力', ko: '{ref}의 전원 Vcc가 비었습니다' },
    '{ref} 未填供電電壓': { en: '{ref} has no supply voltage', ja: '{ref} の電源電圧が未入力', ko: '{ref}의 전원 전압이 비었습니다' },
    '{ref} LED 無串聯限流電阻，恐過流燒毀': { en: '{ref} LED has no series resistor — risk of burnout', ja: '{ref} の LED に直列制限抵抗がなく、過電流で焼損の恐れ', ko: '{ref} LED에 직렬 제한 저항이 없어 과전류로 소손될 수 있습니다' },
    '{ref} {topo} 不能升壓 (Vout>Vin)': { en: '{ref} {topo} cannot step up (Vout>Vin)', ja: '{ref} {topo} は昇圧できません（Vout>Vin）', ko: '{ref} {topo}는 승압할 수 없습니다(Vout>Vin)' },
    '{ref} Boost 不能降壓 (Vout<Vin)': { en: '{ref} Boost cannot step down (Vout<Vin)', ja: '{ref} Boost は降圧できません（Vout<Vin）', ko: '{ref} Boost는 강압할 수 없습니다(Vout<Vin)' },
    '{ref} AC 源未填頻率': { en: '{ref} AC source has no frequency', ja: '{ref} AC 源の周波数が未入力', ko: '{ref} AC 소스의 주파수가 비었습니다' },
    '{ref} 為極性電容({diel})，注意極性與耐壓': { en: '{ref} is polarised ({diel}) — mind polarity and voltage rating', ja: '{ref} は有極性コンデンサ（{diel}）。極性と耐圧に注意', ko: '{ref}는 유극성 커패시터({diel}). 극성과 내압에 주의' },
    '(點問題可定位)': { en: '(click an issue to locate it)', ja: '（問題をクリックで該当箇所へ）', ko: '(문제를 클릭하면 해당 위치로)' },

    // ── 模擬結果摘要 ──
    '總電壓': { en: 'Total voltage', ja: '合計電圧', ko: '총 전압' },
    '總電流': { en: 'Total current', ja: '合計電流', ko: '총 전류' },
    '總功率': { en: 'Total power', ja: '合計電力', ko: '총 전력' },
    '活躍元件': { en: 'Active parts', ja: '動作中の部品', ko: '동작 부품' },

    // ── 模擬指引 ──
    '🔍 <b>看環路電流 / FFT(像範例第四張)</b>：': { en: '🔍 <b>Loop current / FFT (like the 4th example)</b>:', ja: '🔍 <b>ループ電流 / FFT（サンプル 4 枚目のように）</b>：', ko: '🔍 <b>루프 전류 / FFT(예시 4번째처럼)</b>:' },
    '① 右鍵<b>電感</b>→「View in New Scope」=輸出環電流(三角波)；': { en: '① Right-click the <b>inductor</b> → "View in New Scope" = output loop current (triangle wave);', ja: '① <b>インダクタ</b>を右クリック →「View in New Scope」＝出力ループ電流（三角波）；', ko: '① <b>인덕터</b> 우클릭 → "View in New Scope" = 출력 루프 전류(삼각파);' },
    '② 右鍵<b>輸入電容 Cin</b>→看 Cin 電流(輸入環,開關切換有突變)；': { en: '② Right-click <b>Cin</b> → its current (input loop, jumps at each switching edge);', ja: '② <b>入力コンデンサ Cin</b> を右クリック → Cin 電流（入力ループ、スイッチング時に急変）；', ko: '② <b>입력 커패시터 Cin</b> 우클릭 → Cin 전류(입력 루프, 스위칭 시 급변);' },
    '③ scope 上右鍵→勾 <b>FFT</b>=看頻譜：輸入環高頻諧波較大→EMI 主因。': { en: '③ Right-click the scope → tick <b>FFT</b> for the spectrum: the input loop has the larger high-frequency content — the main EMI source.', ja: '③ スコープを右クリック → <b>FFT</b> をオンでスペクトル表示：入力ループの高周波成分が大きく、EMI の主因。', ko: '③ 스코프 우클릭 → <b>FFT</b> 체크로 스펙트럼 확인: 입력 루프의 고주파 성분이 커서 EMI 주원인.' },
    "沒有選取任何東西": { en: "Nothing is selected", ja: "何も選択されていません", ko: "선택된 것이 없습니다" },
    "已複製 {n} 項": { en: "Copied {n} item(s)", ja: "{n} 件をコピーしました", ko: "{n}개를 복사했습니다" },
    "剪貼簿是空的": { en: "The clipboard is empty", ja: "クリップボードが空です", ko: "클립보드가 비어 있습니다" },
    "已貼上 {n} 項": { en: "Pasted {n} item(s)", ja: "{n} 件を貼り付けました", ko: "{n}개를 붙여넣었습니다" },
    "鎖色開：新元件與新線都用這個顏色": { en: "Colour locked: new parts and wires use it", ja: "色ロックON：新しい部品と配線はこの色", ko: "색상 고정 ON: 새 부품과 배선에 이 색 적용" },
    "鎖色關：顏色跟著選取的元件走": { en: "Colour unlocked: the box follows the selection", ja: "色ロックOFF：選択した部品の色に追従", ko: "색상 고정 OFF: 선택한 부품 색을 따름" }
  };
  const G = (typeof window !== 'undefined' ? window : globalThis);
  G.UI_I18N = D;
  /** uiT('中文原文', {vars}) — 查不到就回原文；語言跟著 I18N。 */
  G.uiT = function (s, vars) {
    const lang = (G.I18N && G.I18N.lang) || 'zh';
    let out = s;
    if (lang !== 'zh') { const e = D[s]; if (e && e[lang]) out = e[lang]; }
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return out;
  };
})();
