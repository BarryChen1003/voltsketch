// plan-dates.test.mjs — 續購日期算法的守衛。
// 跑法：node plan-dates.test.mjs
//
// 這支測的是「使用者付了錢換到幾天」。先證明舊行為（吃掉剩餘天數）是錯的，
// 再證明新行為把它補回來。

import { addMonths, nextExpiry } from './supabase/functions/_shared/plan-dates.mjs';

let pass = 0, fail = 0;
const iso = d => d.toISOString().slice(0, 10);
function eq(name, got, want) {
  if (got === want) { pass++; return; }
  fail++; console.log('  FAIL: ' + name + '  got ' + got + ' want ' + want);
}
function ok(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++; console.log('  FAIL: ' + name + (extra ? '  → ' + extra : ''));
}

// ---- addMonths：月底不要溢位 ----
eq('1/31 + 1 個月 = 2/28（不是 3/2）', iso(addMonths(new Date('2026-01-31T00:00:00Z'), 1)), '2026-02-28');
eq('閏年 1/31 + 1 個月 = 2/29', iso(addMonths(new Date('2024-01-31T00:00:00Z'), 1)), '2024-02-29');
eq('3/31 + 1 個月 = 4/30', iso(addMonths(new Date('2026-03-31T00:00:00Z'), 1)), '2026-04-30');
eq('一般日期照常加', iso(addMonths(new Date('2026-08-18T00:00:00Z'), 1)), '2026-09-18');
eq('加 12 個月跨年', iso(addMonths(new Date('2026-08-18T00:00:00Z'), 12)), '2027-08-18');
eq('加 3 個月', iso(addMonths(new Date('2026-08-18T00:00:00Z'), 3)), '2026-11-18');
eq('加 6 個月', iso(addMonths(new Date('2026-08-18T00:00:00Z'), 6)), '2027-02-18');

// ---- nextExpiry：全新購買 ----
const now = new Date('2026-08-18T00:00:00Z');
eq('沒有舊方案 → 從現在起算', iso(nextExpiry(null, 1, now)), '2026-09-18');
eq('舊方案已過期 → 從現在起算', iso(nextExpiry('2026-07-01T00:00:00Z', 1, now)), '2026-09-18');
eq('空字串當作沒有', iso(nextExpiry('', 1, now)), '2026-09-18');
eq('壞掉的日期字串不要算出 NaN', iso(nextExpiry('not-a-date', 1, now)), '2026-09-18');

// ---- nextExpiry：續購要累加（這是 D-3 的重點）----
{
  // 還剩 20 天（到期日 9/7），再買 1 個月
  const remaining = '2026-09-07T00:00:00Z';
  const got = nextExpiry(remaining, 1, now);
  eq('續購從舊到期日起算，不吃掉剩餘天數', iso(got), '2026-10-07');

  // 對照：舊行為（現在 + 1 個月）會是 9/18，等於少了 19 天
  const oldBehaviour = addMonths(now, 1);
  ok('新行為確實比舊行為晚（證明剩餘天數有被保住）',
    got.getTime() > oldBehaviour.getTime(),
    '新=' + iso(got) + ' 舊=' + iso(oldBehaviour));
  eq('被舊行為吃掉的天數', Math.round((got - oldBehaviour) / 86400000), 19);
}

// ---- 連續續購三次應該線性累加，不是每次重設 ----
{
  let exp = null;
  for (let i = 0; i < 3; i++) exp = nextExpiry(exp, 1, now);
  eq('同一天連買三個月 = 三個月後', iso(exp), '2026-11-18');
}

// ---- 年繳續年繳 ----
{
  const exp1 = nextExpiry(null, 12, now);
  const exp2 = nextExpiry(exp1, 12, now);
  eq('年繳續一年 = 兩年後', iso(exp2), '2028-08-18');
}

// ---- 到期日剛好是現在 → 不算「還有剩」，從現在起算 ----
eq('到期日等於現在 → 從現在起算', iso(nextExpiry(now.toISOString(), 1, now)), '2026-09-18');

console.log('\nplan-dates.test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
