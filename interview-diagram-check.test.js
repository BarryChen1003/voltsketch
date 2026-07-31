#!/usr/bin/env node
/**
 * interview-diagram-check.test.js — 證明守衛真的擋得住
 *
 * 「跑起來 0 發現」只證明不誤報，不證明抓得到。
 * 這支把 interview-bank.js 複製一份、故意弄壞，再確認檢查器有抓到；
 * 每個案例都寫明「壞在哪、應該被歸類成什麼」。
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HERE = __dirname;
const BANK = fs.readFileSync(path.join(HERE, 'interview-bank.js'), 'utf8');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ivdiag-'));

let fail = 0;
const run = file => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [path.join(HERE, 'interview-diagram-check.js'), file], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
};
const ok = (name, cond, detail) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!cond) fail++;
};

/** 產生一份「壞掉的」bank 並跑檢查器 */
const mutate = (name, fn) => {
  const src = fn(BANK);
  if (src === BANK) throw new Error('mutation did nothing: ' + name);
  const file = path.join(tmpDir, name + '.js');
  fs.writeFileSync(file, src);
  return run(file);
};

/* 0) 沒動過的 bank 必須通過 —— 沒有這條，下面全部都沒意義 */
{
  const r = run(path.join(HERE, 'interview-bank.js'));
  ok('未改動的 bank 通過', r.code === 0 && /PASS/.test(r.out), r.out.trim().split('\n').pop());
}

/* 1) 把 q19 的 Pd 標籤往左推到那條垂直的散熱箭頭上 */
{
  const r = mutate('overlap-line', s =>
    s.replace('<text x=\\"272\\" y=\\"142\\" fill=\\"#ffc107\\" font-size=\\"11\\">Pd = (5 - 3.3)',
              '<text x=\\"248\\" y=\\"142\\" fill=\\"#ffc107\\" font-size=\\"11\\">Pd = (5 - 3.3)'));
  ok('抓到「文字壓到走線」', r.code === 1 && /壓線/.test(r.out),
    (r.out.match(/OVERLAP.*/) || ['(沒抓到)'])[0].slice(0, 90));
}

/* 2) 把 q14 真值表的一格數字挪到隔壁那格上面 */
{
  const r = mutate('overlap-text', s =>
    s.replace('<text x=\\"195\\" y=\\"100\\" fill=\\"#c8d4ee\\" font-size=\\"12\\" text-anchor=\\"middle\\">0</text>',
              '<text x=\\"258\\" y=\\"100\\" fill=\\"#c8d4ee\\" font-size=\\"12\\" text-anchor=\\"middle\\">0</text>'));
  ok('抓到「文字壓到文字」', r.code === 1 && /壓文字/.test(r.out),
    (r.out.match(/OVERLAP.*/) || ['(沒抓到)'])[0].slice(0, 90));
}

/* 3) 把 q26 的說明列推出畫布右緣 */
{
  const r = mutate('out-of-canvas', s =>
    s.replace('<text x=\\"10\\" y=\\"214\\" fill=\\"#888\\" font-size=\\"11\\">fc = 1/(2*pi*10k*10n)',
              '<text x=\\"400\\" y=\\"214\\" fill=\\"#888\\" font-size=\\"11\\">fc = 1/(2*pi*10k*10n)'));
  ok('抓到「文字出界」', r.code === 1 && /出界/.test(r.out),
    (r.out.match(/OVERLAP.*/) || ['(沒抓到)'])[0].slice(0, 90));
}

/* 4) 字級掉回 8px（手機上會糊掉）
      刻意不綁特定那張圖的文案：改第一個 font-size 就好，圖重畫了測試也不會失效。 */
{
  const r = mutate('tiny-font', s => s.replace('font-size=\\"11\\"', 'font-size=\\"8\\"'));
  ok('抓到「字級太小」', r.code === 1 && /字級 8 </.test(r.out),
    (r.out.match(/SPEC.*/) || ['(沒抓到)'])[0].slice(0, 90));
}

/* 5) 拿掉 svg 的 width 屬性（CSS 靠它決定自然寬度） */
{
  const r = mutate('no-width', s => s.replace(/<svg width=\\"\d+\\" /, '<svg '));
  ok('抓到「svg 缺 width」', r.code === 1 && /缺 width\/height/.test(r.out),
    (r.out.match(/SPEC.*/) || ['(沒抓到)'])[0].slice(0, 90));
}

/* 6) --max 要真的放行（給已知誤報用），但不能無限放行 */
{
  const src = BANK.replace('<text x=\\"272\\" y=\\"142\\" fill=\\"#ffc107\\" font-size=\\"11\\">Pd = (5 - 3.3)',
                           '<text x=\\"248\\" y=\\"142\\" fill=\\"#ffc107\\" font-size=\\"11\\">Pd = (5 - 3.3)');
  const file = path.join(tmpDir, 'max-flag.js');
  fs.writeFileSync(file, src);
  let passed = false, code = null;
  try { execFileSync(process.execPath, [path.join(HERE, 'interview-diagram-check.js'), file, '--max=2'], { encoding: 'utf8' }); passed = true; }
  catch (e) { code = e.status; }
  ok('--max=2 會放行 2 個以內的發現', passed, 'exit=' + (passed ? 0 : code));
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('\ninterview-diagram-check.test: ' + (fail ? fail + ' failed' : 'all passed'));
process.exit(fail ? 1 : 0);
