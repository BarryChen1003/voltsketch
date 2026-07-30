# 圖字重疊稽核（鐵律：圖跟字絕不能疊）

## 權威檢查：瀏覽器實測

node 版 `svg-overlap-check.js` 是估算（字寬用係數推算、看不到 `<g transform>`），
只適合擋 CI 回歸。**驗收要用瀏覽器實測**——把下面整段貼進 `knowledge.html` 的 console：

```js
(()=>{
const host=document.createElement('div');host.style.cssText='position:absolute;left:-9999px;width:600px';
document.body.appendChild(host);
// getBBox 不含祖先 transform → 用 getCTM 換算回 SVG 使用者座標
const box=(el,root)=>{const b=el.getBBox();const m=el.getCTM(),rm=root.getCTM();
  if(!m||!rm)return b;const t=rm.inverse().multiply(m);
  const p=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]
    .map(([x,y])=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f}));
  const xs=p.map(q=>q.x),ys=p.map(q=>q.y);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};
const ov=(a,b)=>a.x<b.x+b.width-0.5&&a.x+a.width>b.x+0.5&&a.y<b.y+b.height-0.5&&a.y+a.height>b.y+0.5;
const out=[];let cards=0,texts=0;
knowledgeApp.items.forEach(it=>{
  const svg=(it.circuits&&it.circuits[0]&&it.circuits[0].svg)||null;
  if(!svg||!/^<svg/.test(svg.trim()))return;
  cards++;host.innerHTML=svg;
  const root=host.querySelector('svg');if(!root)return;
  const vb=(root.getAttribute('viewBox')||'0 0 400 200').split(/\s+/).map(Number);
  const rects=[...root.querySelectorAll('rect')].map(r=>box(r,root));
  const lines=[...root.querySelectorAll('line')]
    .filter(l=>+(l.getAttribute('stroke-width')||2)>=1.2&&!l.closest('[data-deco]'))
    .map(l=>{const b=box(l,root);return{x:b.x-0.5,y:b.y-0.5,width:Math.max(b.width,1),height:Math.max(b.height,1)};});
  const info=[...root.querySelectorAll('text')].map(t=>({s:t.textContent.trim(),b:box(t,root)})).filter(x=>x.s);
  texts+=info.length;
  // 文字中心落在某方塊內 → 那是該方塊自己的標題，合法
  const inOwn=b=>{const cx=b.x+b.width/2,cy=b.y+b.height/2;
    return rects.some(r=>cx>r.x&&cx<r.x+r.width&&cy>r.y&&cy<r.y+r.height);};
  info.forEach((t,i)=>{const b=t.b;if(inOwn(b))return;let h=null;
    if(b.x<vb[0]-1||b.y<vb[1]-1||b.x+b.width>vb[0]+vb[2]+1||b.y+b.height>vb[1]+vb[3]+1)h='出界';
    if(!h&&rects.some(r=>ov(b,r)))h='壓方塊';
    if(!h&&lines.some(l=>ov(b,l)))h='被線穿';
    if(!h&&info.some((o,j)=>j!==i&&ov(b,o.b)))h='壓文字';
    if(h)out.push(`${it.id}|${t.s.slice(0,14)}|${h}`);});
});
host.remove();
return {卡數:cards,文字數:texts,重疊:out.length,清單:out};
})()
```

## 現況（2026-07-22）

**146 卡 / 1432 個文字 / 重疊 0**（壓方塊 0、被線穿 0、壓文字 0、出界 0）。

## 面試題庫的圖（interview-bank.js）

知識卡那段只掃 `knowledge-circuits2.js`，**面試題的圖不在任何 CI 覆蓋範圍內**。
面試題的圖用 `<path>`/`<polyline>` 畫波形，整體 bbox 會把圖內合法留白也算成障礙 →
下面這版改成**逐段**判定（線段層級），才不會滿screen假陽性。貼進 `interview.html` 的 console：

```js
(async()=>{
const src=await (await fetch('/interview-bank.js?t='+Date.now())).text();  // 避開 ?v= 快取
const w={};new Function('window',src)(w);
const host=document.createElement('div');host.style.cssText='position:absolute;left:-9999px;width:700px';document.body.appendChild(host);
const box=(el,root)=>{const b=el.getBBox();const m=el.getCTM(),rm=root.getCTM();if(!m||!rm)return b;
  const t=rm.inverse().multiply(m);const p=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]
    .map(([x,y])=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f}));const xs=p.map(q=>q.x),ys=p.map(q=>q.y);
  return{x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};
const ov=(a,b)=>a.x<b.x+b.width-0.5&&a.x+a.width>b.x+0.5&&a.y<b.y+b.height-0.5&&a.y+a.height>b.y+0.5;
const seg=el=>{const pad=Math.max(+(el.getAttribute('stroke-width')||1.5)/2,0.75),out=[];let pts=[];
 if(el.tagName!=='PATH'){pts=(el.getAttribute('points')||'').trim().split(/\s+/).map(p=>p.split(',').map(Number));
   if(el.tagName==='POLYGON'&&pts.length)pts.push(pts[0]);}
 else{let cx=0,cy=0;(el.getAttribute('d')||'').replace(/([MHVL])\s*([-\d.,\s]*)/g,(_,c,a)=>{
   const n=a.trim().split(/[\s,]+/).filter(s=>s!=='').map(Number);
   if(c==='M'){cx=n[0];cy=n[1];pts.push([cx,cy]);}else if(c==='L'){for(let i=0;i<n.length;i+=2){cx=n[i];cy=n[i+1];pts.push([cx,cy]);}}
   else if(c==='H'){n.forEach(v=>{cx=v;pts.push([cx,cy]);});}else if(c==='V'){n.forEach(v=>{cy=v;pts.push([cx,cy]);});}return'';});}
 for(let i=1;i<pts.length;i++){const[x1,y1]=pts[i-1],[x2,y2]=pts[i];
   out.push({x:Math.min(x1,x2)-pad,y:Math.min(y1,y2)-pad,width:Math.abs(x2-x1)+2*pad,height:Math.abs(y2-y1)+2*pad});}
 return out;};
const out=[];let n=0,texts=0;
w.INTERVIEW_BANK.forEach(q=>['zh','en'].forEach(lang=>{
 const m=q[lang].answer.match(/<svg[\s\S]*?<\/svg>/);if(!m)return;if(lang==='zh')n++;
 host.innerHTML=m[0];const root=host.querySelector('svg');
 const vb=(root.getAttribute('viewBox')||'0 0 520 200').split(/\s+/).map(Number);
 const rects=[...root.querySelectorAll('rect')].map(r=>box(r,root)).filter(r=>!(r.width>=vb[2]-1)); // 排除整張底色
 const st=[];root.querySelectorAll('line').forEach(l=>{if(+(l.getAttribute('stroke-width')||2)<1.2)return;
   const b=box(l,root);st.push({x:b.x-0.5,y:b.y-0.5,width:Math.max(b.width,1),height:Math.max(b.height,1)});});
 root.querySelectorAll('path,polyline,polygon').forEach(el=>seg(el).forEach(s=>st.push(s)));
 const info=[...root.querySelectorAll('text')].map(t=>({s:t.textContent.trim(),b:box(t,root)})).filter(x=>x.s);
 if(lang==='zh')texts+=info.length;
 const inOwn=b=>{const cx=b.x+b.width/2,cy=b.y+b.height/2;return rects.some(r=>cx>r.x&&cx<r.x+r.width&&cy>r.y&&cy<r.y+r.height);};
 info.forEach((t,i)=>{const b=t.b;if(inOwn(b))return;let h=null;
  if(b.x<vb[0]-1||b.y<vb[1]-1||b.x+b.width>vb[0]+vb[2]+1||b.y+b.height>vb[1]+vb[3]+1)h='出界';
  if(!h&&rects.some(r=>ov(b,r)))h='壓方塊';
  if(!h&&st.some(l=>ov(b,l)))h='壓線';
  if(!h&&info.some((o,j)=>j!==i&&ov(b,o.b)))h='壓文字';
  if(h)out.push(`${q.id}.${lang}|${t.s.slice(0,14)}|${h}`);});
}));
host.remove();return{圖數:n,文字數:texts,重疊:out.length,清單:out};})()
```

### 現況（2026-07-30 實測）

| 批次 | 題 | 字級 @ viewBox | 重疊 |
|---|---|---|---|
| 批次 1（q7 q12 q17 q19 q26 q27） | 6 | 11px @520 | **0** |
| 重畫（q5 q6 q13） | 3 | 11px @520 | **0** |
| flyback（q28–q32，共用底圖） | 5 | 10px @720 | **0** |
| 批次 3（q1/q4 同圖、q2 q14 q15 q16 q22） | 7 | 11px @520 | **0** |
| 批次 4（q3 q8 q9 q10 q11） | 5 | 11px @520 | **0** |
| 批次 5（q18 q20 q21 q23 q24 q25） | 6 | 11px @520 | **0** |
| **合計** | **32 / 32 題** | — | **0** |

zh + en 兩份一起掃：59 張、927 個文字、重疊 0。
`interview-bank.js` 的 32 題全部有圖；DB 端另有 6 題 PCB 題只存在 `interview-pcb.sql`，尚未補圖。

### 只驗重疊是不夠的（批次 5 的教訓）

q18 的 `tr = 0.8473 x Rp x Cb` 一開始把單位算錯（kΩ × pF 本來就是 ns，卻又乘了 1000），
曲線與兩個標點全部被推到畫布外——**重疊檢查回報乾淨**，因為畫布上幾乎沒東西可疊。
是語意驗證器（斷言 tr(2.2k,100pF)=186ns、標點必須落在該條線上）把它抓出來的。
所以每張圖除了重疊，都要有「這張圖畫的數字/拓樸對不對」的斷言。

### 新圖的硬性規格

- `viewBox` 寬 520（既有 flyback 720 是例外，已補 `width` 屬性讓它用自然寬度顯示）
- 每張 SVG 都要有 `width`/`height` 屬性：CSS 是 `width:auto;max-width:100%`，
  沒有 width 的話 520 的圖會被撐成容器寬度
- `font-size` ≥ 11（flyback 因為密度高用 10）：桌機容器約 730px，兩種寬度都是 1:1 顯示
- 窄螢幕（≤640px）走 `overflow-x:auto` 讓圖自己捲，不縮小字。
  **注意**：`main` 是 flex item 又帶 `margin:0 auto`，媒體查詢裡必須同時歸零
  `margin-left/right` 與 `min-width`，否則整頁會被圖撐寬出現橫向捲軸（踩過）
- 標籤用英文/符號：一張圖同時掛在 zh/en/ja/ko 四個欄位
- 幾何要能被程式驗（工作週期、交點、功率數字…），不是「看起來像」

## 修圖時的規矩

1. **文字帶與圖形帶分離**：說明文字放最底部，方塊不得下探到那條 y。方塊往下移就把畫布 `W(w,h)` / `wrap(w,h)` 的 h 一起加大。
2. **標籤壓到方塊 → 先改 anchor，不要先搬位置**。`anchor:'start'` 讓文字從錨點往右長、`'end'` 往左長；錨點不動＝語意保留（仍在標它該標的東西）。`A()` 支援 `o.anchor`／`o.dx`／`o.dy`。
3. **標籤被自己的線穿過** → 給 `A()` 加 `dy`（垂直挪開），別加 `dx`（會沿線滑動、還是在線上）。
4. **文字超出畫布** → `wrap(w,h,g,{l,t})` 用負 viewBox 原點納入溢出區，元件座標完全不動；或 `W(w,h+n, '<g transform="translate(0,n)">…</g>')`。
5. 改完**一定要重跑上面的實測**，並把 `BUILTIN_VERSION`（knowledge.js）遞增，否則舊 localStorage 快取會蓋住新圖。
