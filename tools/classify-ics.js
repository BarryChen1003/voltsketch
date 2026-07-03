// 依料號前綴把 IC-spec/*.pdf 粗分類（TI 為主）。輸出 ic-classification.json 供建檔規劃。
// 粗分類，需人工複核。用法：node tools/classify-ics.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'IC-spec');
const files = fs.readdirSync(dir).filter(f => /\.pdf$/i.test(f));

// 規則：[正則, 類別id]。由上而下，先命中先贏。
const rules = [
  [/^dlp/i, 'dlp'],
  [/^(amc|iso|isow|isos|isotmp)/i, 'isolation'],
  [/^(awr|iwr|mmwave)/i, 'rf'],                       // mmWave 雷達
  [/^(cc(13|26|27|32|33|35)|nrf|cyw|efr32|esp|wl18|wilink)/i, 'wireless'],
  [/^(lmx|lmk|cdc|si5|lmkdb)/i, 'clocks'],
  [/^(ads|adc)/i, 'data-converters'],
  [/^(dac)/i, 'data-converters'],
  [/^(afe)/i, 'data-converters'],
  [/^(drv2|drv26)/i, 'audio'],                        // 觸覺驅動
  [/^(pcm|tas|tlv320|tac57|taa|src4|pga2)/i, 'audio'],
  [/^(drv|fan31|mct)/i, 'motor'],
  [/^(sn?74|74|txs|txb|lsf|cd4|sn74)/i, 'logic'],
  [/^(tmag|tmp|hdc|opt|ldc|fdc|drv5|tmcs|lmt|lm35|lm50|ina2|mlx|isotmp)/i, 'sensors'],
  [/^(tca|adg|ts3a|ts5a|mux|hd3ss|sn74cb|ts3l|pi3)/i, 'switch-mux'],
  [/^(tusb|dp83|sn65hvd|sn65|max32|hd3ss|usb|lan|ksz)/i, 'interface'],
  [/^(opa|ina|ths|lmh|lmv|lmp|buf|tlv9|tlv6|tlv7|lm358|lm324|lm339|lmc|ne55|ne5532)/i, 'amplifiers'],
  [/^(tps|tlv7|tlv6|lp|ucc|lmg|lmz|tpsm|bq|lm2|lm3|lm5|lm317|fan|csd|tl431|ref|atl)/i, 'power'],
  [/^(msp|tms320|am3|am6|am2|f28|f29|rm4|tm4|mspm|c29)/i, 'mcu'],
  [/^(ds190|zynq|arm_|atmel|intel|core|fpga|f29p|gpu|nvidia|334661|a100|h100|b200)/i, 'cpu'],
  // 補：非標準前綴 / 非 TI
  [/^(tac5)/i, 'audio'],
  [/^(sn5|sn54|sn55|sn74|cd54)/i, 'logic'],
  [/^pca9306/i, 'switch-mux'],
  [/^(thvd|onet|tdel|dp83|hd3ss|pca|tca|pi4|pi3)/i, 'interface'],
  [/^(mcf|drv8|tmc)/i, 'motor'],
  [/^(qorvo|qpd|ma4p|nx48|x400|aaa3)/i, 'rf'],
  [/^(bd33|fb800|ds1230|ren_|slg|tpm1|eng_cd|040015|108005|112003|am13e)/i, '_misc-non-ti'],
];

const cat = {};
const unmatched = [];
files.forEach(f => {
  const base = f.replace(/\.pdf$/i, '').replace(/\s*\(\d+\)$/, '');   // 去 (1) 重複
  let hit = null;
  for (const [re, id] of rules) { if (re.test(base)) { hit = id; break; } }
  if (!hit) { unmatched.push(base); hit = '_unclassified'; }
  (cat[hit] = cat[hit] || new Set()).add(base);
});

const out = {};
Object.keys(cat).sort().forEach(k => { out[k] = [...cat[k]].sort(); });
fs.writeFileSync(path.join(__dirname, '..', 'ic-classification.json'), JSON.stringify(out, null, 1), 'utf8');

console.log('檔案數(去重後類別內)：');
Object.entries(out).forEach(([k, v]) => console.log('  ', k.padEnd(18), v.length));
console.log('未分類：', (out._unclassified || []).length);
if (out._unclassified) console.log('  ', out._unclassified.slice(0, 40).join(', '));
