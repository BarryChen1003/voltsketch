/**
 * schematic-check.js — 線路圖 net 感知檢查引擎（roadmap「線路檢查」核心）
 * 相比 schematic-rules.js（存在性/像素距離檢查），本引擎用 CircuitEngine.computeNets
 * 做真正的電氣連接分析：短路、浮接、LED 限流、I2C 上拉、UART 交叉、去耦、晶振負載…
 * 介面：window.SchematicCheck.run(components, wires) → { errors[], warns[], infos[] }
 *       每項 { msg, comps:[compId] }；ai-checker.js 負責呈現與點擊高亮。
 */
window.SchematicCheck = (function () {
  function pinLabel(c, p) {
    // IC 的 getPins name=腳號 → 由 comp.icPins（circuit-engine icLayout 的來源欄位）找回腳名（SDA/TX/VCC…）
    const defs = (c.type === 'ic') ? (c.icPins || c.pins) : null;
    if (Array.isArray(defs)) {
      const def = defs.find(x => String(x.num) === String(p.name));
      if (def && def.name) return String(def.name);
    }
    return String(p.name);
  }
  const RX = {
    vcc: /^(V\+|VCC\w*|VDD\w*|VIN\w*|VBAT|3V3|5V0?|12V|AVDD|DVDD|VDDIO)$/i,
    gnd: /^(GND\w*|VSS\w*|AGND|DGND|PGND|EPAD?|EP)$/i,
    sda: /SDA/i,
    scl: /SCL/i,
    tx: /(^|[_\-])TXD?\d*$|^TXD?\d*$/i,
    rx: /(^|[_\-])RXD?\d*$|^RXD?\d*$/i
  };

  function run(components, wires) {
    const out = { errors: [], warns: [], infos: [] };
    const eng = window.CircuitEngine;
    if (!eng || !eng.computeNets || !eng.getPins) {
      out.warns.push({ msg: '連接分析引擎未載入，僅基本檢查', comps: [] });
      return out;
    }
    const comps = (components || []).filter(c => c.type !== 'text');
    const { pinNet, connectedPins } = eng.computeNets(comps, wires || []);

    // 建索引：net → 成員腳、comp → 腳清單
    const nets = new Map();
    const pinsOf = new Map();
    comps.forEach(c => {
      const list = [];
      eng.getPins(c).forEach((p, idx) => {
        const key = c.id + ':' + idx;
        const net = pinNet.get(key);
        const ent = { c, idx, pin: p, label: pinLabel(c, p), net, connected: connectedPins.has(key) };
        list.push(ent);
        if (net != null) { if (!nets.has(net)) nets.set(net, []); nets.get(net).push(ent); }
      });
      pinsOf.set(c.id, list);
    });
    const name = c => c.label || c.name || c.type;
    const netEntries = id => nets.get(id) || [];
    const netHasType = (id, t) => netEntries(id).some(e => e.c.type === t);

    // 1) 電源兩端短路
    comps.filter(c => c.type === 'source').forEach(s => {
      const ps = pinsOf.get(s.id);
      if (ps.length === 2 && ps[0].net != null && ps[0].net === ps[1].net)
        out.errors.push({ msg: `${name(s)}：正負極短路（兩端連到同一節點）`, comps: [s.id] });
    });

    // 2) 浮接腳（電源/地腳=錯誤；其餘=警告；IC 常有 NC 亦列警告）
    comps.forEach(c => {
      if (c.type === 'shield') return; // 屏蔽罩單獨規則
      const fl = (pinsOf.get(c.id) || []).filter(e => !e.connected);
      if (!fl.length) return;
      const powerFl = fl.filter(e => RX.vcc.test(e.label) || RX.gnd.test(e.label));
      if (powerFl.length)
        out.errors.push({ msg: `${name(c)}：電源/地腳未接（${powerFl.map(e => e.label).join(', ')}）`, comps: [c.id] });
      const rest = fl.filter(e => powerFl.indexOf(e) < 0);
      if (rest.length)
        out.warns.push({ msg: `${name(c)}：接腳未連線（${rest.map(e => e.label).slice(0, 6).join(', ')}${rest.length > 6 ? '…' : ''}）`, comps: [c.id] });
    });

    // 3) LED 限流電阻（net 級：兩側節點找電阻）
    comps.filter(c => c.type === 'led').forEach(led => {
      const ps = pinsOf.get(led.id);
      if (ps.length < 2 || ps[0].net == null || ps[1].net == null) return;
      const hasR = netHasType(ps[0].net, 'resistor') || netHasType(ps[1].net, 'resistor');
      const touchesSrc = netEntries(ps[0].net).some(e => e.c.type === 'source') || netEntries(ps[1].net).some(e => e.c.type === 'source');
      if (!hasR && touchesSrc)
        out.errors.push({ msg: `${name(led)}：直接跨電源、無限流電阻（請串電阻）`, comps: [led.id] });
      else if (!hasR)
        out.warns.push({ msg: `${name(led)}：兩側節點都沒有電阻，確認限流路徑`, comps: [led.id] });
    });

    // 4) I2C 開汲極缺上拉：SDA/SCL 節點上要有電阻、且電阻另一端摸得到電源
    const seenI2c = new Set();
    comps.filter(c => c.type === 'ic').forEach(ic => {
      (pinsOf.get(ic.id) || []).forEach(e => {
        if (e.net == null) return;
        if (!RX.sda.test(e.label) && !RX.scl.test(e.label)) return;
        if (seenI2c.has(e.net)) return;
        seenI2c.add(e.net);
        const rents = netEntries(e.net).filter(x => x.c.type === 'resistor');
        const pulled = rents.some(r => {
          const other = (pinsOf.get(r.c.id) || []).find(x => x.idx !== r.idx);
          if (!other || other.net == null) return false;
          return netEntries(other.net).some(x =>
            (x.c.type === 'source' && x.pin.name === '+') ||
            (x.c.type === 'ic' && RX.vcc.test(x.label)));
        });
        if (!pulled)
          out.errors.push({ msg: `${e.label}（${name(ic)}）：I2C 開汲極節點缺上拉電阻到電源`, comps: [ic.id] });
      });
    });

    // 5) UART TX/RX 交叉：同 net 出現兩顆 IC 的 TX（或兩顆 RX）＝接反
    nets.forEach(ents => {
      const uniq = arr => Array.from(new Set(arr.map(e => e.c.id)));
      const txs = ents.filter(e => e.c.type === 'ic' && RX.tx.test(e.label));
      const rxs = ents.filter(e => e.c.type === 'ic' && RX.rx.test(e.label));
      if (uniq(txs).length >= 2)
        out.errors.push({ msg: `TX 對 TX：${txs.map(e => `${name(e.c)}.${e.label}`).join(' ↔ ')}（UART 要 TX↔RX 交叉）`, comps: uniq(txs) });
      if (uniq(rxs).length >= 2)
        out.errors.push({ msg: `RX 對 RX：${rxs.map(e => `${name(e.c)}.${e.label}`).join(' ↔ ')}（UART 要 TX↔RX 交叉）`, comps: uniq(rxs) });
    });

    // 6) IC VCC 節點無去耦電容（info）
    comps.filter(c => c.type === 'ic').forEach(ic => {
      const vents = (pinsOf.get(ic.id) || []).filter(e => e.net != null && RX.vcc.test(e.label));
      if (!vents.length) return;
      if (!vents.some(e => netHasType(e.net, 'capacitor')))
        out.infos.push({ msg: `${name(ic)}：VCC 節點沒看到去耦電容（100nF 貼近腳位）`, comps: [ic.id] });
    });

    // 7) 開關/保險絲/電流表直跨電源兩端
    comps.filter(c => ['switch', 'fuse', 'ammeter'].indexOf(c.type) >= 0).forEach(sw => {
      const ps = pinsOf.get(sw.id);
      if (!ps || ps.length < 2 || ps[0].net == null || ps[1].net == null) return;
      comps.filter(c => c.type === 'source').forEach(s => {
        const sp = pinsOf.get(s.id);
        if (sp.length === 2 && sp[0].net != null && sp[1].net != null) {
          const a = [ps[0].net, ps[1].net], b = [sp[0].net, sp[1].net];
          if (a.indexOf(b[0]) >= 0 && a.indexOf(b[1]) >= 0)
            out.errors.push({ msg: `${name(sw)} 直接橫跨 ${name(s)} 兩端${sw.type === 'switch' ? '（閉合即短路）' : '（近零阻抗短路）'}`, comps: [sw.id, s.id] });
        }
      });
    });

    // 8) 屏蔽罩接地耳（info）
    comps.filter(c => c.type === 'shield').forEach(sh => {
      const g = (pinsOf.get(sh.id) || [])[0];
      if (!g || !g.connected)
        out.infos.push({ msg: `${name(sh)}：屏蔽罩接地耳未接地（不接地的屏蔽罩＝天線）`, comps: [sh.id] });
    });

    // 9) 晶振負載電容（info）
    comps.filter(c => c.type === 'xtal').forEach(x => {
      const ps = pinsOf.get(x.id) || [];
      if (!ps.some(e => e.net != null && netHasType(e.net, 'capacitor')))
        out.infos.push({ msg: `${name(x)}：晶振兩側建議各接負載電容 CL 到地`, comps: [x.id] });
    });

    // 10) 基本存在性
    if (!comps.some(c => c.type === 'source')) out.warns.push({ msg: '電路沒有電源', comps: [] });
    if (!comps.some(c => c.type === 'ground')) out.warns.push({ msg: '電路沒有接地參考', comps: [] });

    return out;
  }

  // 報告項點擊 → 高亮元件（ai-checker 產出的 HTML 會呼叫）
  window.__chkSel = function (ids) {
    try {
      if (typeof app !== 'undefined' && app.setSelection && Array.isArray(ids) && ids.length) {
        app.setSelection(ids); app.render();
      }
    } catch (e) { }
  };

  return { run };
})();
