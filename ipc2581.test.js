/**
 * ipc2581.test.js — IPC-2581 與組裝圖驗證（node）
 *
 * IPC-2581 是 XML，所以第一件事是「**它必須是合法的 XML**」——
 * 少跳脫一個 `&` 整份檔就解析不了，而 refdes 與 part 名是使用者輸入的。
 * 這支用一個最小的 well-formed 檢查（標籤配對 ＋ 屬性引號 ＋ 實體跳脫）當守衛。
 *
 * 組裝圖的重點只有一個：**底面那張要鏡射**。不鏡射的話產線會把料貼到左右相反的位置，
 * 而且他們不會懷疑圖。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}

const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};

/**
 * 極小的 well-formed XML 檢查。不做 DTD/Schema 驗證，只查最容易錯的：
 *   1. 開閉標籤配對且巢狀正確
 *   2. 屬性值都有引號
 *   3. 文字與屬性裡沒有未跳脫的 & 與 <
 * 回 null（沒問題）或錯誤字串。
 */
function checkXml(src) {
  const stack = [];
  const tagRe = /<(\/?)([A-Za-z_][\w.-]*)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>|<\?[^>]*\?>|<!--[\s\S]*?-->/g;
  let last = 0, m;
  while ((m = tagRe.exec(src))) {
    // 標籤之間的文字：不可以有裸露的 < 或 &
    const text = src.slice(last, m.index);
    if (/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(text)) return '未跳脫的 & 在文字裡：' + text.trim().slice(0, 40);
    if (text.includes('<')) return '未跳脫的 < 在文字裡';
    last = tagRe.lastIndex;
    if (!m[2]) continue;                                  // 宣告或註解
    const attrs = m[3] || '';
    if (/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(attrs)) return '未跳脫的 & 在屬性裡：' + attrs.trim().slice(0, 40);
    // 屬性一定要 name="value"
    const bare = attrs.replace(/\s+[\w:.-]+\s*=\s*"[^"]*"/g, '').trim();
    if (bare) return '屬性沒有引號或格式不對：' + bare.slice(0, 40);
    if (m[4]) continue;                                   // 自閉標籤
    if (m[1]) {
      if (!stack.length) return '多餘的結束標籤 </' + m[2] + '>';
      const open = stack.pop();
      if (open !== m[2]) return '標籤不配對：<' + open + '> 對到 </' + m[2] + '>';
    } else {
      stack.push(m[2]);
    }
  }
  if (stack.length) return '未關閉的標籤：<' + stack[stack.length - 1] + '>';
  return null;
}

function board() {
  return {
    boardWidth: 40, boardHeight: 30,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [
      {
        ref: 'U1', part: 'SOIC-8', x: -8, y: 2, rot: 0, side: 'top', w: 6, h: 5, h3d: 1.75,
        pads: [
          { num: 1, x: -2.7, y: -1.9, w: 1.5, h: 0.6, shape: 'rect', net: 'VCC', side: 'F' },
          { num: 2, x: -2.7, y: -0.6, w: 1.5, h: 0.6, shape: 'rect', net: 'SDA', side: 'F' },
          { num: 3, x: -2.7, y: 0.6, w: 1.5, h: 0.6, shape: 'rect', net: '', side: 'F' },
          { num: 4, x: -2.7, y: 1.9, w: 1.5, h: 0.6, shape: 'rect', net: 'GND', side: 'F' },
        ],
      },
      {
        // refdes 與 part 名刻意帶 XML 特殊字元
        ref: 'R&1', part: 'RES <0603> "1%"', x: 6, y: 2, rot: 90, side: 'top', w: 2.4, h: 1.4,
        pads: [
          { num: 1, x: -0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'SDA', side: 'F' },
          { num: 2, x: 0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'VCC', side: 'F' },
        ],
      },
      {
        ref: 'D1', part: 'SOD-123', x: 0, y: -8, rot: 0, side: 'bottom', w: 3, h: 1.8,
        pads: [
          { num: 1, x: -1.1, y: 0, w: 1, h: 1, shape: 'rect', net: 'GND', side: 'B' },
          { num: 2, x: 1.1, y: 0, w: 1, h: 1, shape: 'rect', net: 'VCC', side: 'B' },
        ],
      },
    ],
    traces: [{ x1: -5.3, y1: 0.6, x2: 5, y2: 0.6, layer: 'F.Cu', width: 0.25, net: 'SDA' }],
    vias: [{ x: 5, y: 0.6, d: 0.6, od: 0.6, drill: 0.3, net: 'SDA' }],
    userZones: [], keepouts: [], zoneFills: [], teardrops: [],
  };
}

(async () => {
  const ipc = await import('./supabase/functions/_shared/ipc2581.mjs');
  const asm = await import('./supabase/functions/_shared/assembly.mjs');

  // ================= IPC-2581 =================
  // ---- 受控阻抗需求：屬性進了檔，而且沒把 XML 弄壞 ----
  // 帶新元素最容易出的意外是「值裡有引號或 & 就整份檔解析不了」，
  // 所以這裡的 note 刻意放特殊字元，再跑一次 well-formed 檢查。
  {
    const st = board();
    st.netProps = { SDA: { z0: 50, ztol: 7, note: 'route away from "SW" & keep 3W' }, USB_DP: { zdiff: 90, pair: 'USB_DM' } };
    const r = ipc.build(st, padAbs, 'demo');
    const xml = r.files[0].text;
    eq(checkXml(xml), null, 'IPC 阻抗：帶屬性之後仍是 well-formed XML');
    const blockOf = n => {
      const i = xml.indexOf('<LogicalNet name="' + n + '">');
      return i < 0 ? '' : xml.slice(i, xml.indexOf('</LogicalNet>', i));
    };
    ok(blockOf('SDA').indexOf('name="impedanceZ0Ohm" value="50"') > 0, 'IPC 阻抗：Z0 進了對的那條 net');
    ok(blockOf('SDA').indexOf('&amp;') > 0, 'IPC 阻抗：註記裡的 & 有跳脫');
    ok(blockOf('SDA').indexOf('&quot;SW&quot;') > 0, 'IPC 阻抗：註記裡的引號有跳脫');
    ok(blockOf('GND').indexOf('impedance') < 0, 'IPC 阻抗：沒設屬性的 net 不可以憑空長出要求');
    ok(blockOf('USB_DP').indexOf('NOT_ROUTED') > 0, 'IPC 阻抗：有要求但沒繞的 net 要標 NOT_ROUTED');
    const bare = ipc.build(board(), padAbs, 'demo').files[0].text;
    eq(bare.indexOf('impedanceZ0Ohm'), -1, 'IPC 阻抗：完全沒設就完全不寫（空屬性＝告訴板廠沒有要求）');
  }


  {
    const st = board();
    const r = ipc.build(st, padAbs, 'demo');
    eq(r.files.length, 1, '1.1 產出一份 XML');
    const xml = r.files[0].text;

    // 這一條是全部的前提
    const err = checkXml(xml);
    eq(err, null, '1.2 是 well-formed XML' + (err ? '：' + err : ''));

    ok(!/NaN|undefined/.test(xml), '1.3 沒有 NaN / undefined');
    ok(/<IPC-2581 revision="C"/.test(xml), '1.4 宣告 revision C');
    ok(/units="MILLIMETER"/.test(xml), '1.5 單位 mm');

    // 特殊字元一定要跳脫，否則整份檔解析不了
    ok(/refDes="R&amp;1"/.test(xml), '1.6 refdes 的 & 有跳脫');
    ok(/RES &lt;0603&gt; &quot;1%&quot;/.test(xml), '1.7 part 名的 < > " 都有跳脫');
    ok(!/refDes="R&1"/.test(xml), '1.8 沒有留下未跳脫的原文');

    // 層別與疊構
    eq((xml.match(/<Layer /g) || []).length, 3, '1.9 兩層銅 + 板框');
    ok(/layerFunction="CONDUCTOR"/.test(xml), '1.10 銅層功能');
    ok(/layerFunction="BOARD_OUTLINE"/.test(xml), '1.11 板框功能');
    eq((xml.match(/<StackupLayer /g) || []).length, 2, '1.12 疊構兩層');

    // 網表
    const nets = [...xml.matchAll(/<LogicalNet name="([^"]+)"/g)].map(m => m[1]);
    eq(nets, ['GND', 'SDA', 'VCC'], '1.13 網表依字典序（可重現）');
    // U1 第 3 腳沒有 net，不該出現在任何 LogicalNet 裡
    ok(!/componentRef="U1" pin="3"/.test(xml), '1.14 沒接網路的腳不進網表');

    // 元件
    eq((xml.match(/<Component /g) || []).length, 3, '1.15 三顆元件');
    ok(/value="BOTTOM"/.test(xml), '1.16 底面元件標 BOTTOM');
    ok(/mountType="SMT"/.test(xml), '1.17 SMD 標 SMT');

    // 封裝只定義一次
    eq((xml.match(/<Package /g) || []).length, 3, '1.18 三種封裝');

    // BOM
    ok(/<Bom name="demo_bom">/.test(xml), '1.19 有 BOM');
    eq((xml.match(/<BomItem /g) || []).length, 3, '1.20 三筆料');

    // 鑽孔
    ok(/<DrillSpec>/.test(xml), '1.21 有鑽孔規格');
    ok(/<DrillTool name="T1" diameter="0.300000"/.test(xml), '1.22 鑽頭直徑正確');

    eq(r.stats.nets, 3, '1.23 統計 net 數');
    eq(r.stats.components, 3, '1.24 統計元件數');
  }
  {
    // 真圓弧要用 <Arc> 不是折線
    const PcbArc = require('./pcb-arc.js');
    const st = board();
    const arc = PcbArc.fromCenter(0, 0, 5, 0, 0, 5, true);
    st.traces.push({ x1: 5, y1: 0, x2: 0, y2: 5, width: 0.3, layer: 'F.Cu', net: 'ARC', arc });
    const r = ipc.build(st, padAbs, 'arc');
    const xml = r.files[0].text;
    eq(checkXml(xml), null, '2.1 含弧的檔仍然 well-formed');
    eq((xml.match(/<Arc /g) || []).length, 1, '2.2 一段 <Arc>（不是一串 Line）');
    ok(/centerX="0.000000" centerY="0.000000"/.test(xml), '2.3 圓心正確');
    eq(r.stats.arcs, 1, '2.4 統計有算弧');
  }
  {
    // 鋪銅的內孔要變成 <Cutout>
    const st = board();
    st.userZones = [{
      layer: 'F.Cu', net: 'GND', pts: [[-15, -12], [15, -12], [15, 12], [-15, 12]],
      fillPolys: [{
        outer: [[-15, -12], [15, -12], [15, 12], [-15, 12]],
        holes: [[[-2, -2], [2, -2], [2, 2], [-2, 2]], [[6, 6], [8, 6], [8, 8], [6, 8]]],
      }],
    }];
    const r = ipc.build(st, padAbs, 'pour');
    const xml = r.files[0].text;
    eq(checkXml(xml), null, '3.1 含鋪銅的檔仍然 well-formed');
    eq((xml.match(/<Cutout>/g) || []).length, 2, '3.2 兩個內孔變成 Cutout');
    eq(r.stats.cutouts, 2, '3.3 統計有算');
    ok(/geometryUsage="PLANE"/.test(xml), '3.4 鋪銅標成 PLANE');
  }
  {
    const r = ipc.build({ layerStack: [] }, padAbs, 'x');
    eq(r.files, [], '4.1 沒有銅層就不產檔');
    ok(r.warnings.length > 0, '4.2 而且有說明');
  }
  {
    // 可重現
    const a = ipc.build(board(), padAbs, 'r');
    const b = ipc.build(board(), padAbs, 'r');
    eq(a.files[0].text, b.files[0].text, '4.3 連跑兩次位元組相同（沒有時間戳）');
  }

  // ================= 組裝圖 =================
  {
    const st = board();
    const r = asm.build(st, padAbs, 'demo', { dnp: ['R&1'] });
    eq(r.files.length, 3, '5.1 頂面 + 底面 + 放置清單');
    const top = r.files.find(f => /assembly-top\.svg$/.test(f.name));
    const bot = r.files.find(f => /assembly-bottom\.svg$/.test(f.name));
    const csv = r.files.find(f => /placement\.csv$/.test(f.name));
    ok(top && bot && csv, '5.2 三份都在');

    eq(checkXml(top.text), null, '5.3 頂面 SVG 是 well-formed XML');
    eq(checkXml(bot.text), null, '5.4 底面 SVG 是 well-formed XML');
    ok(!/NaN|undefined/.test(top.text + bot.text), '5.5 沒有 NaN');

    // 特殊字元
    ok(/&gt;R&amp;1&lt;|>R&amp;1</.test(top.text), '5.6 refdes 的 & 有跳脫');

    eq(r.stats.top, 2, '5.7 頂面兩顆');
    eq(r.stats.bottom, 1, '5.8 底面一顆');
    eq(r.stats.dnp, 1, '5.9 一顆 DNP');

    // DNP 用虛線框畫，不是實線
    ok(/class="dnp"/.test(top.text), '5.10 DNP 有專屬樣式');
    ok(/stroke-dasharray/.test(top.text), '5.11 而且是虛線');

    // 第 1 腳標記
    ok(/class="pin1"/.test(top.text), '5.12 有第 1 腳標記');
  }
  {
    // 底面必須鏡射——這是整張圖最容易錯、後果最嚴重的一項
    const st = board();
    st.components = [{
      ref: 'D9', part: 'X', x: 10, y: 4, rot: 30, side: 'bottom', w: 3, h: 2,
      pads: [{ num: 1, x: -1, y: 0, w: 1, h: 1, shape: 'rect', net: 'A', side: 'B' }],
    }];
    const r = asm.build(st, padAbs, 'm');
    const bot = r.files.find(f => /bottom\.svg$/.test(f.name));
    // x=10 的元件在底面圖上應該出現在 x=-10
    ok(/translate\(-10,4\)/.test(bot.text), '6.1 底面 x 座標鏡射（10 → −10）');
    // 旋轉方向也要反，否則元件朝錯的方向
    ok(/rotate\(-30\)/.test(bot.text), '6.2 底面旋轉方向也反過來');
    ok(/BOTTOM/.test(bot.text), '6.3 標題標明是底面');
    ok(/mirrored/.test(bot.text), '6.4 而且標明已鏡射');
  }
  {
    // 頂面不可以鏡射
    const st = board();
    st.components = [{
      ref: 'U9', part: 'X', x: 10, y: 4, rot: 30, side: 'top', w: 3, h: 2,
      pads: [{ num: 1, x: -1, y: 0, w: 1, h: 1, shape: 'rect', net: 'A', side: 'F' }],
    }];
    const r = asm.build(st, padAbs, 'm');
    const top = r.files.find(f => /top\.svg$/.test(f.name));
    ok(/translate\(10,4\)/.test(top.text), '6.5 頂面座標不動');
    ok(/rotate\(30\)/.test(top.text), '6.6 頂面旋轉不動');
  }
  {
    // 放置清單
    const st = board();
    const r = asm.build(st, padAbs, 'demo', { dnp: ['U1'] });
    const csv = r.files.find(f => /placement\.csv$/.test(f.name)).text.split('\n');
    ok(/^Designator,Part,Side,MidX\(mm\),MidY\(mm\),Rotation,Populate$/.test(csv[0]), '7.1 表頭');
    const u1 = csv.find(l => l.startsWith('U1,'));
    ok(/,No$/.test(u1), '7.2 DNP 的標 Populate=No');
    const d1 = csv.find(l => l.startsWith('D1,'));
    ok(/,Bottom,/.test(d1), '7.3 底面元件標 Bottom');
    ok(/,Yes$/.test(d1), '7.4 非 DNP 標 Yes');
  }
  {
    // 那一面沒有元件就不出圖——一張空圖只會讓人以為漏了東西
    const st = board();
    st.components = st.components.filter(c => c.side !== 'bottom');
    const r = asm.build(st, padAbs, 'x');
    eq(r.files.some(f => /bottom\.svg$/.test(f.name)), false, '8.1 沒有底面元件就不出底面圖');
    eq(r.files.some(f => /top\.svg$/.test(f.name)), true, '8.2 頂面照出');
  }
  {
    const r = asm.build({ components: [] }, padAbs, 'x');
    eq(r.files, [], '8.3 完全沒有元件就什麼都不出');
    ok(r.warnings.length > 0, '8.4 而且有說明');
  }
  {
    // 極性元件判斷
    eq(asm._isPolarised({ ref: 'D1' }), true, '9.1 D 開頭是極性元件');
    eq(asm._isPolarised({ ref: 'U3' }), true, '9.2 U 開頭（IC 有方向）');
    eq(asm._isPolarised({ ref: 'R1' }), false, '9.3 電阻沒有方向');
    eq(asm._isPolarised({ ref: 'C1', part: 'CAP-ELEC-6.3x5' }), true, '9.4 電解電容靠封裝名認出');
    eq(asm._isPolarised({ ref: 'C1', part: '0603' }), false, '9.5 一般陶瓷電容沒有方向');
  }

  // ---- 疊構：厚度與 Dk 要來自使用者設定，不是寫死的 1.6mm ----
  // 以前不管疊層編輯器設了什麼，都寫 totalFinishedThickness=1.6、每層銅 0.035。
  // 那不是「沒有資料」，是有資料沒送過來——而板廠會照著那個假數字報價與壓合。
  {
    const st = board();
    st.layerStack = [{ id: 'F.Cu', kind: 'copper' }, { id: 'In1.Cu', kind: 'copper' },
                     { id: 'In2.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }];
    st.stackup = { oz: { 'F.Cu': 1, 'In1.Cu': 0.5, 'In2.Cu': 0.5, 'B.Cu': 2 },
                   diel: [{ t: 0.2, er: 4.4 }, { t: 1.0, er: 4.2 }, { t: 0.2, er: 4.4 }] };
    const xml = ipc.build(st, padAbs, 'demo').files[0].text;
    eq(checkXml(xml), null, 'IPC 疊構：帶疊層之後仍是 well-formed XML');
    // 1oz = 0.0348mm；0.5oz 減半、2oz 加倍
    ok(/StackupLayer layerOrGroupRef="F.Cu" thickness="0.034800"/.test(xml), 'IPC 疊構：1oz 銅厚要照算');
    ok(/StackupLayer layerOrGroupRef="In1.Cu" thickness="0.017400"/.test(xml), 'IPC 疊構：0.5oz 要減半');
    ok(/StackupLayer layerOrGroupRef="B.Cu" thickness="0.069600"/.test(xml), 'IPC 疊構：2oz 要加倍');
    // 總厚＝所有銅＋所有介電，不可以再是寫死的 1.6
    ok(/totalFinishedThickness="1.539200"/.test(xml), 'IPC 疊構：總厚要是加總出來的');
    ok(!/totalFinishedThickness="1.600000"/.test(xml), 'IPC 疊構：不可以還留著寫死的 1.6mm');
    // 介電：厚度與 Dk 走 NonstandardAttribute（標準 <Spec>/DIELCORE 的 schema 沒查證到）
    ok(/name="dielectric2ThicknessMm" value="1.000000"/.test(xml), 'IPC 疊構：介電厚度要帶出去');
    ok(/name="dielectric2Dk" value="4.200000"/.test(xml), 'IPC 疊構：Dk 要帶出去');
    ok(xml.indexOf('name="dielectric2Between" value="In1.Cu/In2.Cu"') > 0, 'IPC 疊構：要講清楚夾在哪兩層之間');
    ok(!/DIELCORE|<Spec /.test(xml), 'IPC 疊構：不可以自創沒查證過 schema 的標準元素');
  }

  // ---- 沒帶疊層就要說出來，不可以安靜地用預設值假裝 ----
  {
    const st = board();
    delete st.stackup;
    const r = ipc.build(st, padAbs, 'demo');
    ok(r.warnings.some(w => w.k === 'ipc_w_stackup_default'), 'IPC 疊構：沒帶疊層要警告');
    const st2 = board();
    st2.stackup = { oz: { 'F.Cu': 1, 'B.Cu': 1 }, diel: [{ t: 0.2, er: 4.4 }] };
    ok(!ipc.build(st2, padAbs, 'demo').warnings.some(w => w.k === 'ipc_w_stackup_default'),
      'IPC 疊構：帶了就不該再警告');
  }

  // ---- 組裝圖：有真的 courtyard 線段就畫真的形狀，不是外接矩形 ----
  // L 形、帶缺角的封裝畫成方塊，看圖的人會以為那是「沒資料的佔位」，明明資料就在檔裡。
  {
    const st = board();
    st.components = [Object.assign({}, st.components[0], {
      crtyd: {
        minx: -3, miny: -3, maxx: 3, maxy: 3,
        segs: [{ x1: -3, y1: -3, x2: 3, y2: -3 }, { x1: 3, y1: -3, x2: 3, y2: 0 },
               { x1: 3, y1: 0, x2: 0, y2: 0 }, { x1: 0, y1: 0, x2: 0, y2: 3 },
               { x1: 0, y1: 3, x2: -3, y2: 3 }, { x1: -3, y1: 3, x2: -3, y2: -3 }]
      }
    })];
    const r = asm.sheet(st, padAbs, { side: 'top' });
    ok(/<path class="cy"/.test(r.text), '組裝圖：有線段就畫實際外框');
    ok(!/<rect class="cy"/.test(r.text), '組裝圖：有線段時不可以再畫外接矩形');
    eq(r.stats.courtyardShape, 1, '組裝圖：真形狀要單獨算一格');
    ok(/1 of 1 outlines are the real courtyard shape/.test(r.text), '組裝圖：圖說要寫出幾顆是真形狀');
    // 只有 bbox 的仍然退回矩形，而且算在另一格
    const st2 = board();
    st2.components = [Object.assign({}, st2.components[0], { crtyd: { minx: -3, miny: -3, maxx: 3, maxy: 3 } })];
    const r2 = asm.sheet(st2, padAbs, { side: 'top' });
    ok(/<rect class="cy"/.test(r2.text), '組裝圖：只有 bbox 就畫矩形');
    eq(r2.stats.courtyardShape, 0, '組裝圖：bbox 不算真形狀');
  }

  console.log(`\nipc2581.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
