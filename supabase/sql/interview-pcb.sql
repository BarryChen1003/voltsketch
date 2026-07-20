-- interview-pcb.sql — PCB Layout 面試題（6 題）併入付費題庫
-- 來源：原本寫死在 pcb.html 右側「📝 PCB Layout 面試題」區塊，該區塊已移除，
--       題目改由 interview_questions 表供應（RLS：interview_paid / admin 才讀得到）。
-- 用法：Supabase Dashboard → SQL Editor → 貼上全部 → Run（跑一次即可；重跑不會重複）。

insert into public.interview_questions (category, category_en, question, answer, question_en, answer_en)
select v.category, v.category_en, v.question, v.answer, v.question_en, v.answer_en
from (values
  ('PCB Layout', 'PCB Layout',
   '電源去耦電容怎麼放？',
   '越靠近 IC 電源腳越好，小容值(0.1µF/1nF)最靠腳、大容值(10µF)稍遠；過孔直接打到電源/地平面，縮短迴路電感。每個電源腳至少一顆。',
   'How should decoupling capacitors be placed?',
   'As close to the IC power pin as possible: the small values (0.1µF/1nF) nearest the pin, the bulk (10µF) slightly further out. Drop vias straight into the power/ground planes to minimise loop inductance. Budget at least one cap per power pin.'),

  ('PCB Layout', 'PCB Layout',
   '高速差分對走線要點？',
   '等長(長度匹配控制 skew)、等距(維持差分阻抗如 90Ω/100Ω)、同層走線、少過孔、避免急轉(用 45° 或弧線)、遠離噪聲源、參考完整地平面。',
   'What matters when routing high-speed differential pairs?',
   'Length-match the pair (skew control), hold constant spacing (keeps the differential impedance, e.g. 90Ω/100Ω), route on one layer, minimise vias, avoid sharp corners (use 45° or arcs), keep away from noise sources, and reference a solid ground plane.'),

  ('PCB Layout', 'PCB Layout',
   '為什麼要完整的地平面（return path）？',
   '高頻回流電流走訊號正下方的地，路徑斷裂(跨分割/挖空)會迫使繞路 → 增大迴路面積、EMI 與串擾。換層時鄰近放回流過孔。',
   'Why does a signal need a continuous ground plane (return path)?',
   'High-frequency return current flows in the plane directly beneath the trace. A break in that plane (a split or cut-out) forces the return to detour, enlarging the loop area and raising EMI and crosstalk. When a signal changes layer, place a stitching via next to it so the return can follow.'),

  ('PCB Layout', 'PCB Layout',
   '開關電源（SW 節點）佈局注意？',
   'SW 節點銅面要小(降 EMI 又要散熱權衡)、高頻迴路(Vin-開關-二極體-Cin)面積最小、輸入電容最靠 IC、回授走線遠離 SW、單點接地。',
   'What are the layout rules around a switching regulator SW node?',
   'Keep the SW copper small (trade EMI against thermal need), make the high-di/dt loop (Vin - switch - diode - Cin) as tight as possible, put the input capacitor closest to the IC, route feedback away from SW, and use a single-point ground for the loop.'),

  ('PCB Layout', 'PCB Layout',
   '四層板疊層怎麼選？',
   '常見 訊號-地-電源-訊號：訊號層緊鄰完整地平面以控阻抗與回流；電源地相鄰形成平面電容；高速線走在靠地的外層或內層 stripline。',
   'How do you choose a 4-layer stackup?',
   'The common choice is signal - ground - power - signal: each signal layer sits next to a solid ground plane for impedance control and a clean return, the adjacent power/ground pair forms plane capacitance, and high-speed nets run on the ground-referenced outer layer or as an inner stripline.'),

  ('PCB Layout', 'PCB Layout',
   'PCB 散熱怎麼處理？',
   '熱源下方加散熱過孔陣列接內層/底層大銅面、加大銅厚與銅面、必要時鋁基板或散熱片、考慮氣流方向、功率元件分散避免熱集中。',
   'How do you handle heat on a PCB?',
   'Put a thermal via array under the hot part tying it to large inner/bottom copper, increase copper weight and pour area, add a metal-core board or heatsink when needed, account for airflow direction, and spread power devices out so the heat does not concentrate.')
) as v(category, category_en, question, answer, question_en, answer_en)
where not exists (
  select 1 from public.interview_questions q where q.question = v.question
);

-- 驗證：應回 6 列
select category, question from public.interview_questions where category = 'PCB Layout' order by id;
