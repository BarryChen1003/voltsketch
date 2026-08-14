// pin-extract.js — 從 datasheet 的 Pin Functions 表抽腳位。
//
// 為什麼重寫：舊的 pdf-parser.js 把整頁文字 join 成一長串再套兩條 regex，
// 表格的欄位結構在 join 的那一刻就沒了。實測結果是 SN74LVC1G07（5 腳）抽出 30 列，
// 內容是 `2025,Texas`、`4,Thermal`、`1,Application` 這種頁尾與章節標題。
//
// 這支改用 pdf.js 給的**座標**：先依 y 分行、行內依 x 排序，再把內容的 x 分群當欄位，
// 依每一群的內容判斷誰是腳號欄、誰是腳名欄（表頭字是置中的，不能拿來當欄位左邊界）。
// 抽不到就明確回 ok:false，不猜、不吐半成品。
//
// 輸入格式（不綁 DOM，node 可直接測）：
//   pages: [ [ [x, y, height, text], ... ], ... ]   每頁一個 item 陣列
// 輸出：
//   { ok, pins:[{num,name,type}], packages:[名稱], packageUsed, page, warnings:[{code,...}] }
// warnings 回代碼不回句子：這支不碰 UI，四語字串由呼叫端（app.js 的 uiT）決定。
(function (root) {
  'use strict';

  var Y_TOL = 2.2;            // 同一行的 y 容差（pt）
  var COL_PAD = 6;            // 欄位左邊界往左放寬，避免數字貼齊得比表頭左一點
  var MAX_NAME_LEN = 24;

  function lines(items) {
    var rows = [];
    items.slice().sort(function (a, b) { return b[1] - a[1] || a[0] - b[0]; })
      .forEach(function (it) {
        var r = rows[rows.length - 1];
        if (r && Math.abs(r.y - it[1]) <= Y_TOL) { r.items.push(it); r.y = (r.y + it[1]) / 2; }
        else rows.push({ y: it[1], items: [it] });
      });
    rows.forEach(function (r) { r.items.sort(function (a, b) { return a[0] - b[0]; }); r.text = r.items.map(function (i) { return i[3]; }).join(' ').replace(/\s+/g, ' ').trim(); });
    return rows;
  }

  // 目錄行（帶點引導線或頁碼）不是表格
  function isToc(t) { return /\.{4,}/.test(t); }

  function findTablePage(pages) {
    for (var i = 0; i < pages.length; i++) {
      var rows = lines(pages[i]);
      var head = -1;
      for (var j = 0; j < rows.length; j++) {
        // 標題不是只有「Pin Functions」一種：ADI 寫「Pin Function Descriptions」，
        // 也有 Terminal Functions / Signal Descriptions。
        if (/(pin|terminal|signal)\s+(function|description)s?/i.test(rows[j].text) && !isToc(rows[j].text)) { head = j; break; }
      }
      if (head < 0) continue;
      // 表頭要看得到 PIN / NAME / NO. / TYPE 其中之一，否則多半是目錄或內文交叉引用。
      // 只認 NAME/NO. 太嚴：LMK1C1102-Q1 那種表頭只寫「PIN TYPE DESCRIPTION」就被漏掉了。
      var hasHeader = rows.slice(head, head + 8).some(function (r) {
        return r.items.some(function (it) { return /^(NAME|NO\.?|PIN|TYPE)$/i.test(it[3].trim()); });
      });
      if (hasHeader) return { page: i, rows: rows, head: head };
    }
    return null;
  }

  // 欄位不能用表頭的 x 切：表頭字是置中的（TYPE 置中在 219.7），
  // 但欄位內容是靠左的（"High-side power" 從 201.2 開始），拿表頭當左邊界會把 TYPE 欄吃進 NAME。
  // 改成用**內容本身**的 x 分群：x 相差超過 GAP 就算另一欄。
  var GAP = 9;

  function clusterX(rows) {
    var xs = [];
    rows.forEach(function (r) { r.items.forEach(function (it) { xs.push(it[0]); }); });
    xs.sort(function (a, b) { return a - b; });
    var cl = [];
    xs.forEach(function (x) {
      var last = cl[cl.length - 1];
      if (last && x - last.max <= GAP) { last.max = x; last.n++; }
      else cl.push({ min: x, max: x, n: 1 });
    });
    return cl;
  }

  function cellsOf(rows, cl) {
    // 每一群收集它的 token，用來判斷這群是腳號欄還是腳名欄
    return cl.map(function (c) {
      var toks = [];
      rows.forEach(function (r) {
        var t = r.items.filter(function (it) { return it[0] >= c.min - 1 && it[0] <= c.max + 1; })
          .map(function (it) { return it[3].trim(); }).join(' ').trim();
        if (t) toks.push(t);
      });
      return toks;
    });
  }

  var NUM_CELL = /^\d{1,3}(\s*,\s*\d{1,3})*$/;
  // DSBGA/BGA 的腳號是球號（A1、B1、C1），不是數字。只有在整份都找不到數字欄時才用它，
  // 否則像 SN74LVC14B 那種「腳名 1A/2Y、腳號 1/2」的表會把腳名欄當成腳號欄。
  var BALL_CELL = /^[A-Z]{1,2}\d{1,2}(\s*,\s*[A-Z]{1,2}\d{1,2})*$/;
  var DASH_CELL = /^[—–-]$/;

  // 回傳 { nameCol, numCols:[群索引], clusters, idKind }；認不出來回 null
  function readColumns(bodyRows) {
    var cl = clusterX(bodyRows);
    if (cl.length < 2) return null;
    var cells = cellsOf(bodyRows, cl);
    return tryColumns(cl, cells, NUM_CELL, 'num') || tryColumns(cl, cells, BALL_CELL, 'ball');
  }

  function tryColumns(cl, cells, ID_CELL, idKind) {
    var score = cells.map(function (toks) {
      if (!toks.length) return { num: 0, name: 0 };
      var num = toks.filter(function (t) { return ID_CELL.test(t) || DASH_CELL.test(t); }).length / toks.length;
      var name = toks.filter(function (t) { return NAME_RE.test(t) && t.length <= MAX_NAME_LEN; }).length / toks.length;
      return { num: num, name: name };
    });
    var isNum = function (i) { return score[i].num >= 0.6 && cells[i].length >= 3; };
    var isName = function (i) { return !isNum(i) && score[i].name >= 0.5 && cells[i].length >= 3; };
    // TYPE / DESCRIPTION 欄是句子：多字、夠長。碰到它就別再往右找腳號欄了，
    // 否則會把描述裡的數字（頁碼、I²C 的上標 2）當成腳號。
    var isSentence = function (i) {
      var long = cells[i].filter(function (t) { return /\s/.test(t) && t.length >= 15; }).length;
      return long / Math.max(1, cells[i].length) >= 0.3;
    };

    var nameCol = -1, numCols = [], k;
    if (isNum(0)) {                       // 版型 A：NO. | NAME | TYPE | DESCRIPTION
      k = 0;
      while (k < cl.length && isNum(k)) numCols.push(k++);
      for (; k < cl.length; k++) { if (isSentence(k)) break; if (isName(k)) { nameCol = k; break; } }
    } else {                              // 版型 B：NAME | 封裝1 | 封裝2 | TYPE | DESCRIPTION
      for (k = 0; k < cl.length; k++) { if (isSentence(k)) break; if (isName(k)) { nameCol = k; break; } }
      // 腳號欄不一定緊鄰腳名欄：ADS112C14 的腳名換行文字自成一群，夾在中間。
      // 所以往右一路找，直到碰到句子欄（TYPE/DESCRIPTION）才停。
      if (nameCol >= 0) for (k = nameCol + 1; k < cl.length; k++) { if (isSentence(k)) break; if (isNum(k)) numCols.push(k); }
    }
    if (nameCol < 0 || !numCols.length) return null;
    return { clusters: cl, nameCol: nameCol, numCols: numCols, idKind: idKind };
  }

  // 表頭那幾行裡，離每個腳號欄最近的字就是封裝名（沒有就叫 NO.）
  function packageLabels(headRows, cols) {
    return cols.numCols.map(function (ci) {
      var c = cols.clusters[ci], best = null, bestD = 1e9;
      headRows.forEach(function (r) {
        r.items.forEach(function (it) {
          var s = it[3].trim();
          if (!s || /^(PIN|TYPE|DESCRIPTION|NAME)$/i.test(s) || /^\(\d+\)$/.test(s)) return;
          var d = Math.abs(it[0] - c.min);
          if (d < bestD) { bestD = d; best = s; }
        });
      });
      return (bestD <= 30 && best) ? best : 'NO.';
    });
  }

  function colOf(x, cols) {
    for (var i = 0; i < cols.clusters.length; i++) {
      var c = cols.clusters[i];
      if (x >= c.min - 1 && x <= c.max + 1) {
        if (i === cols.nameCol) return 'name';
        var k = cols.numCols.indexOf(i);
        return k >= 0 ? 'num' + k : 'other';
      }
    }
    return null;
  }

  // TI 的註腳上標 (1)(2) 基線比內文高一點，會被切成獨立一行，長得很像註腳。
  // 分辨方式：真註腳在 (n) 後面還有內容（"(1) See the Power Supply..."），
  // 上標那行拿掉所有 (n) 之後就空了。第一版沒分這兩者，一遇到就 break，整張表一列都沒讀到。
  function isEndRow(t) {
    if (/copyright ©|submit document feedback|product folder links/i.test(t)) return true;
    if (/^table \d+-\d+\./i.test(t)) return true;              // 下一張表
    if (/^\d+(\.\d+)?\s+[A-Z][a-z]/.test(t)) return true;      // 下一節標題（如「6 Specifications」）
    if (/^\(\d+\)/.test(t)) return t.replace(/\(\d+\)/g, '').trim().length > 0;
    return false;
  }

  // 腳名可以用數字開頭（74 系列的 1A、2Y），但必須含至少一個字母，否則就跟腳號分不開了
  var NAME_RE = /^(?=.*[A-Za-z])[A-Za-z0-9_][A-Za-z0-9_+\-./]*$/;

  function parseRows(rows, cols) {
    var out = [], warnings = [], pendingName = null;
    for (var j = 0; j < rows.length; j++) {
      var r = rows[j];
      var cells = { name: [] };
      cols.numCols.forEach(function (c, i) { cells['num' + i] = []; });
      r.items.forEach(function (it) {
        var id = colOf(it[0], cols);
        if (!id || id === 'other') return;
        (cells[id] = cells[id] || []).push(it[3].trim());
      });
      var name = cells.name.join('').replace(/\s+/g, '');
      var type = '';
      var nums = cols.numCols.map(function (c, i) {
        return (cells['num' + i] || []).join(' ').replace(/\s+/g, ' ').trim();
      });
      var hasNum = nums.some(function (s) { return /\d/.test(s); });
      var hasCell = nums.some(function (s) { return s.length > 0; });

      if (name && !hasNum) {
        // 腳號欄有東西但不是數字（「—」）＝這個封裝沒有這支腳，是完整的一列，不是換行。
        // 第一版沒分這兩種，把 `NC — — —` 當成待接的名稱，下一列就變成 NCOUTA。
        if (hasCell) continue;
        // 名稱換行（AIN4/REFP/ 換行接 GPIO0），或下標（V 換行接 CC）
        if (pendingName) pendingName += name; else pendingName = name;
        continue;
      }
      if (!name && !hasNum) continue;
      if (!name && hasNum && pendingName) { name = pendingName; pendingName = null; }
      if (!name) continue;
      if (pendingName) { name = pendingName + name; pendingName = null; }
      if (!NAME_RE.test(name) || name.length > MAX_NAME_LEN) { warnings.push({ code: 'odd-row', text: r.text.slice(0, 40) }); continue; }
      out.push({ name: name, nums: nums, type: type });
    }
    return { rows: out, warnings: warnings };
  }

  // 一格可能是「4, 14」這種多腳共名 → 展開成多列
  function expand(rowsOut, colIdx, idKind) {
    var re = idKind === 'ball' ? /[A-Z]{1,2}\d{1,2}/g : /\d{1,3}/g;
    var pins = [];
    rowsOut.forEach(function (r) {
      var cell = r.nums[colIdx] || '';
      var found = cell.match(re);
      if (!found) return;                       // 「—」表示這個封裝沒有這支腳
      found.forEach(function (n) { pins.push({ num: n, name: r.name, type: r.type }); });
    });
    if (idKind !== 'ball') pins.sort(function (a, b) { return (+a.num) - (+b.num); });
    return pins;
  }

  // 表頭最後一行（含 NAME / NO.）的 y；表格內容都在它下面
  function headerBottom(rows, head) {
    var y = null;
    for (var j = head; j < Math.min(head + 8, rows.length); j++) {
      if (rows[j].items.some(function (it) { return /^(NAME|NO\.?|PIN|TYPE|DESCRIPTION)$/i.test(it[3].trim()); })) y = rows[j].y;
    }
    return y;
  }

  function bodyBelow(rows, y) {
    var out = [];
    for (var j = 0; j < rows.length; j++) {
      var r = rows[j];
      if (y != null && r.y >= y - Y_TOL) continue;
      if (isEndRow(r.text)) break;
      out.push(r);
    }
    return out;
  }

  // datasheet 在封裝圖旁會寫腳數（"8-Pin SOIC"、"65-pin LGA"、"16-Pin WQFN"）。
  // 只看表格那頁與前一頁，避免抓到別的料號的封裝說明。取最大值：同一頁常同時列多種封裝。
  function declaredPinCount(pages, tablePage) {
    var best = 0;
    [tablePage - 1, tablePage].forEach(function (pi) {
      if (pi < 0 || pi >= pages.length) return;
      var txt = pages[pi].map(function (it) { return it[3]; }).join(' ');
      var m = txt.match(/(\d{1,3})\s*-?\s*pin\b/gi) || [];
      m.forEach(function (s) {
        var n = parseInt(s, 10);
        if (n >= 3 && n <= 300 && n > best) best = n;
      });
    });
    return best;
  }

  function extract(pages, opts) {
    opts = opts || {};
    var found = findTablePage(pages);
    if (!found) return { ok: false, pins: [], packages: [], warnings: [{ code: 'no-table' }] };
    var hb = headerBottom(found.rows, found.head);
    var body = bodyBelow(found.rows, hb);
    if (!body.length) return { ok: false, pins: [], packages: [], warnings: [{ code: 'no-body' }] };

    var cols = readColumns(body);
    if (!cols) return { ok: false, pins: [], packages: [], warnings: [{ code: 'no-columns' }] };
    var parsed = parseRows(body, cols);

    // 表格常常跨好幾頁：CC3300MOD 是 65 腳的 LGA，表格橫跨 4 頁。
    // 只續讀一頁的話會在第 8 腳就停住，而且完全不會有警告——看起來乾淨、其實少了 57 腳。
    // 一路往後讀，直到某一頁用同一組欄位解不出任何一列為止（最多 4 頁）。
    var seen = {};
    parsed.rows.forEach(function (r) { (r.nums.join(' ').match(/\d{1,3}/g) || []).forEach(function (n) { seen[n] = 1; }); });
    for (var pi = found.page + 1; pi < pages.length && pi <= found.page + 4; pi++) {
      var next = lines(pages[pi]).filter(function (r) {
        // 續頁開頭 TI 會重印表格標題與表頭，那不是「表格結束」，要濾掉而不是停在那裡
        if (/www\.ti\.com|submit document feedback|copyright ©|product folder links/i.test(r.text)) return false;
        if (/^table \d+-\d+\./i.test(r.text)) return false;
        return !/^((PIN|NAME|NO\.?|TYPE|DESCRIPTION|STATE|LEVEL)\s*)+$/i.test(r.text);
      });
      var cont = parseRows(bodyBelow(next, null), cols);
      if (!cont.rows.length) break;
      // 續頁的腳號應該是「新的」。大量重複代表這是另一張表，不是同一張的下半部。
      var nums = [], dup = 0;
      cont.rows.forEach(function (r) { (r.nums.join(' ').match(/\d{1,3}/g) || []).forEach(function (n) { nums.push(n); if (seen[n]) dup++; }); });
      if (!nums.length || dup / nums.length > 0.5) break;
      nums.forEach(function (n) { seen[n] = 1; });
      parsed.rows = parsed.rows.concat(cont.rows);
    }

    // 表頭列只能取「表格內容以上」的列，否則第一列資料會被當成封裝名
    // （AMC0200D 曾因此把封裝標成「1」）。
    var headRows = found.rows.slice(found.head, found.head + 8)
      .filter(function (r) { return hb == null || r.y >= hb - Y_TOL; });
    var packages = packageLabels(headRows, cols);
    var want = opts.package ? packages.indexOf(opts.package) : 0;
    if (want < 0) want = 0;
    var pins = expand(parsed.rows, want, cols.idKind);

    var warnings = parsed.warnings.slice();
    if (!pins.length) warnings.push({ code: 'no-rows' });
    // 腳號應該是連號；缺號通常代表某幾列沒抽到，要讓使用者知道。球號（A1/B1）不適用。
    if (pins.length && cols.idKind !== 'ball') {
      var max = Math.max.apply(null, pins.map(function (p) { return +p.num; }));
      var seen = {}; pins.forEach(function (p) { seen[+p.num] = 1; });
      var missing = [];
      for (var i = 1; i <= max; i++) if (!seen[i]) missing.push(i);
      if (missing.length) warnings.push({ code: 'missing', nums: missing.join(', ') });
    }
    // 腳號抽對不代表腳名抽對。拿 183 份真 datasheet 量過：只靠「缺號」警告的話，
    // 有 26 份是「腳號連號、看起來乾淨，但腳名整欄抓錯」——使用者會直接相信。
    // 下面三個訊號就是為了讓那種情況也吵出來。
    if (pins.length >= 4) {
      var names = pins.map(function (p) { return p.name; });
      var uniq = {}; names.forEach(function (n) { uniq[n] = 1; });
      if (Object.keys(uniq).length / names.length < 0.5) warnings.push({ code: 'dup-names' });
      var shortish = names.filter(function (n) { return n.length <= 2; }).length;
      if (shortish / names.length >= 0.4) warnings.push({ code: 'short-names' });
    }
    if (packages.length > 1) warnings.push({ code: 'multi-package', pkg: packages[want], all: packages.join(' / ') });
    // 最後一道對帳：datasheet 自己會在封裝圖旁邊寫「8-Pin SOIC」「65-pin LGA」。
    // 拿它跟抽到的腳數比。少了就一定要吵——CC3300MOD 是 65 腳，表格跨 4 頁，
    // 只抽到前 8 腳而且腳號 1..8 連號，缺號檢查完全看不出問題。
    var declared = declaredPinCount(pages, found.page);
    if (declared && pins.length < declared) warnings.push({ code: 'count-short', got: pins.length, declared: declared });
    return {
      ok: pins.length > 0, pins: pins, packages: packages,
      packageUsed: packages[want], page: found.page + 1, warnings: warnings
    };
  }

  var api = { extract: extract, _lines: lines, _findTablePage: findTablePage, _readColumns: readColumns };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PinExtract = api;
})(typeof window !== 'undefined' ? window : globalThis);
