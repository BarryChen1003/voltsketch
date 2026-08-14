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

> 這個「146」是 2026-07-22 當下的快照，之後卡片有增減，別拿它當基準。
> 2026-08-01 實測：加 ROHM 那 7 張之前是 **145**，之後 **152**（線上側欄 14 類加總）。

## 四語版（2026-08-06，圖上的字接上 i18n 之後）

上面那段只掃 `circuits[0]` 且只有中文。圖現在會跟著語言換字，**字寬變、座標不變**，
所以要四語各掃一次，而且要掃每張圖（不只 `[0]`）。與上面那段的兩個差別：

1. 用 `knowledgeApp.localizedCircuits(item, lang)` 取圖，不要直接讀 `item.circuits`
   （那是快取裡的中文版）。
2. `<line>` 用 `x1/y1/x2/y2` 兩個端點經 CTM 換算，**不要用 bbox**——
   第一版拿 bbox 壓成中心線，斜線誤報了 5 筆。

```js
(()=>{
const host=document.createElement('div');host.style.cssText='position:absolute;left:-9999px;width:600px';document.body.appendChild(host);
const box=(el,root)=>{const b=el.getBBox();const m=el.getCTM(),rm=root.getCTM();if(!m||!rm)return b;
 const t=rm.inverse().multiply(m);const p=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]
  .map(([x,y])=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f}));const xs=p.map(q=>q.x),ys=p.map(q=>q.y);
 return{x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};
const pt=(el,root,x,y)=>{const m=el.getCTM(),rm=root.getCTM();const t=rm.inverse().multiply(m);return{x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f};};
const ov=(a,b)=>a.x<b.x+b.width-0.5&&a.x+a.width>b.x+0.5&&a.y<b.y+b.height-0.5&&a.y+a.height>b.y+0.5;
const hitsRect=(x1,y1,x2,y2,r,pad)=>{const rx1=r.x-pad,ry1=r.y-pad,rx2=r.x+r.width+pad,ry2=r.y+r.height+pad;
 if(Math.max(x1,x2)<rx1||Math.min(x1,x2)>rx2||Math.max(y1,y2)<ry1||Math.min(y1,y2)>ry2)return false;
 const dx=x2-x1,dy=y2-y1;let t0=0,t1=1;
 const clip=(p,q)=>{if(p===0)return q>=0;const t=q/p;if(p<0){if(t>t1)return false;if(t>t0)t0=t;}else{if(t<t0)return false;if(t<t1)t1=t;}return true;};
 return clip(-dx,x1-rx1)&&clip(dx,rx2-x1)&&clip(-dy,y1-ry1)&&clip(dy,ry2-y1);};
const res={},out=[];
for(const lang of ['zh','en','ja','ko']){let figs=0,texts=0,bad=0;
 for(const it of knowledgeApp.items){
  (knowledgeApp.localizedCircuits(it,lang)||[]).forEach((c,ci)=>{
   if(!c||!c.svg||!/^<svg/.test(String(c.svg).trim()))return;
   figs++;host.innerHTML=c.svg;const root=host.querySelector('svg');if(!root)return;
   const vb=(root.getAttribute('viewBox')||'0 0 400 200').split(/\s+/).map(Number);
   const rects=[...root.querySelectorAll('rect')].map(r=>box(r,root));
   const segs=[];
   root.querySelectorAll('line').forEach(l=>{const sw=+(l.getAttribute('stroke-width')||2);
    if(sw<1.2||l.closest('[data-deco]'))return;
    const a=pt(l,root,+l.getAttribute('x1'),+l.getAttribute('y1')),b=pt(l,root,+l.getAttribute('x2'),+l.getAttribute('y2'));
    segs.push([a.x,a.y,b.x,b.y,Math.max(sw/2,0.6)]);});
   const info=[...root.querySelectorAll('text')].map(t=>({s:t.textContent.trim(),b:box(t,root)})).filter(x=>x.s);
   texts+=info.length;
   const inOwn=b=>{const cx=b.x+b.width/2,cy=b.y+b.height/2;return rects.some(r=>cx>r.x&&cx<r.x+r.width&&cy>r.y&&cy<r.y+r.height);};
   info.forEach((t,i)=>{const b=t.b;if(inOwn(b))return;let h=null;
    if(b.x<vb[0]-1||b.y<vb[1]-1||b.x+b.width>vb[0]+vb[2]+1||b.y+b.height>vb[1]+vb[3]+1)h='出界';
    if(!h&&rects.some(r=>ov(b,r)))h='壓方塊';
    const sh={x:b.x+0.5,y:b.y+0.5,width:Math.max(b.width-1,0.5),height:Math.max(b.height-1,0.5)};
    if(!h&&segs.some(s=>hitsRect(s[0],s[1],s[2],s[3],sh,s[4])))h='壓線';
    if(!h&&info.some((o,j)=>j!==i&&ov(b,o.b)))h='壓文字';
    if(h){bad++;if(out.length<30)out.push(`${lang}|${it.id}#${ci}|${t.s.slice(0,22)}|${h}`);}});});}
 res[lang]={圖:figs,文字:texts,重疊:bad};}
host.remove();return{res,out};})()
```

### 現況（2026-08-06 Chromium 實測）

**155 張圖 × 4 語 / 每語 1607 個文字 / 四語重疊皆 0。**

翻譯剛上線時是 en 13、ja 15、ko 9（中文 0）——**全部落在 node 版掃不到的範圍**
（`svg-overlap-check` 只掃 `CIRCUITS2` 的 80 張，這些是 `CircuitSVG` 與卡片內嵌 svg）。
多數是「出界」：譯文比中文寬，把字推出畫布。依實測的超出量逐條縮短，共改 39 個欄位後歸零。

## 線路圖編輯器：翻轉後的文字（2026-08-06）

翻轉的元件會跑一段「把字反轉回正向」的補償（`app.js` renderComponents 尾端）。
補償寫錯不會讓畫面壞掉，只會讓字悄悄跑到不該在的位置，所以要用量的。

貼進 `index.html` 的 console（會在畫布上放一顆 IC 再翻）：

```js
(async()=>{
const box=(el,svg)=>{const bb=el.getBBox();const m=el.getCTM(),rm=svg.getCTM();const t=rm.inverse().multiply(m);
  const p=[[bb.x,bb.y],[bb.x+bb.width,bb.y],[bb.x,bb.y+bb.height],[bb.x+bb.width,bb.y+bb.height]]
   .map(([x,y])=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f}));
  const xs=p.map(q=>q.x),ys=p.map(q=>q.y);
  return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};};
const s=document.querySelector('#partSearch');s.value='1G07';s.dispatchEvent(new Event('input',{bubbles:true}));
await new Promise(r=>setTimeout(r,400));
document.querySelectorAll('.component-button').forEach(b=>{if(/1G07/i.test(b.textContent)){app.state.components=[];b.click();}});
await new Promise(r=>setTimeout(r,300));
const c=app.state.components[0];app.setSelection([c.id]);
const measure=()=>{const g=document.querySelector(`[data-id="${c.id}"]`),svg=g.ownerSVGElement;
 const r=box(g.querySelector('rect'),svg),L=r.x,R=r.x+r.w,T=r.y,B=r.y+r.h;
 let cross=0,mir=0;const bs=[];
 [...g.querySelectorAll('text')].forEach(e=>{const b=box(e,svg);bs.push(b);
  if((b.x<L-.5&&b.x+b.w>L+.5)||(b.x<R-.5&&b.x+b.w>R+.5)||(b.y<T-.5&&b.y+b.h>T+.5)||(b.y<B-.5&&b.y+b.h>B+.5))cross++;
  const m=e.getScreenCTM();if(m&&(m.a*m.d-m.b*m.c)<0)mir++;});
 let ov=0;for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i],b=bs[j];
  if(a.x<b.x+b.w-.5&&a.x+a.w>b.x+.5&&a.y<b.y+b.h-.5&&a.y+a.h>b.y+.5)ov++;}
 return{壓框:cross,鏡像字:mir,字壓字:ov};};
const o={未翻:measure()};
app.flipSelected('h');await new Promise(r=>setTimeout(r,200));o.水平=measure();
app.flipSelected('v');await new Promise(r=>setTimeout(r,200));o['水平+垂直']=measure();
app.flipSelected('h');await new Promise(r=>setTimeout(r,200));o.垂直=measure();
return o;})()
```

**三個判準都必須是 0**：壓框、鏡像字、字壓字。另外還要驗「真的是鏡射」——
水平翻轉後每個字的中心 x 應該等於 `2 × 元件x − 原本的中心x`，y 不變。

### 修過的坑

- **繞錨點反轉是錯的**：字身在基線上方，垂直鏡射後跑到基線下方，整塊往外位移約一個字高，
  B 側腳號因此從框內跳到框外壓線。改成**繞字的視覺中心**反轉——位置本來就被群組鏡射擺對了，
  補償只該修字形方向。順帶連錨點都不必換。
- **`DOMMatrix` 解析不了 SVG 的 `rotate(deg cx cy)`**（CSS 版只吃單參數，T/B 腳名就是這種）。
  要用 `el.transform.baseVal.consolidate().matrix`。
- **旋轉 90° 的字要換軸補償**：它的區域 x 軸在螢幕上是垂直的，螢幕水平翻轉對它而言是區域 y 翻。

### 現況（2026-08-06 Chromium 實測）

| 元件 | 未翻 | 水平 | 水平+垂直 | 垂直 | 垂直+轉90 | 水平+垂直+轉270 |
|---|---|---|---|---|---|---|
| SN74LVC1G07（11 字） | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |
| ADS112C14（35 字，含 T/B 腳） | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |

（壓框/鏡像字/字壓字）。鏡射對稱性 11/11 個字 x 誤差 0、y 誤差 0。
另掃 resistor/capacitor/diode/led/nmos/pmos/npn/opamp 三種翻轉組合：鏡像字 0。

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
// 線段 vs 矩形真交集（Liang-Barsky）。斜線若用 bbox 當障礙會把整個象限都算進去，
// q18 曾因此誤報三筆；node 版 interview-diagram-check.js 用的也是這個算法。
const hitsRect=(x1,y1,x2,y2,r,pad)=>{const rx1=r.x-pad,ry1=r.y-pad,rx2=r.x+r.width+pad,ry2=r.y+r.height+pad;
 if(Math.max(x1,x2)<rx1||Math.min(x1,x2)>rx2||Math.max(y1,y2)<ry1||Math.min(y1,y2)>ry2)return false;
 const dx=x2-x1,dy=y2-y1;let t0=0,t1=1;
 const clip=(p,q)=>{if(p===0)return q>=0;const t=q/p;if(p<0){if(t>t1)return false;if(t>t0)t0=t;}else{if(t<t0)return false;if(t<t1)t1=t;}return true;};
 return clip(-dx,x1-rx1)&&clip(dx,rx2-x1)&&clip(-dy,y1-ry1)&&clip(dy,ry2-y1);};
// A（圓弧）只取終點：flyback 的變壓器繞組是圓弧，漏了它整段線都不會被算進障礙
const ptsOf=el=>{let pts=[];
 if(el.tagName!=='PATH'){pts=(el.getAttribute('points')||'').trim().split(/\s+/).map(p=>p.split(',').map(Number));
   if(el.tagName==='POLYGON'&&pts.length)pts.push(pts[0]);}
 else{let cx=0,cy=0;(el.getAttribute('d')||'').replace(/([MHVLA])\s*([-\d.,\s]*)/g,(_,c,a)=>{
   const n=a.trim().split(/[\s,]+/).filter(s=>s!=='').map(Number);
   if(c==='M'){cx=n[0];cy=n[1];pts.push([cx,cy]);}else if(c==='L'){for(let i=0;i<n.length;i+=2){cx=n[i];cy=n[i+1];pts.push([cx,cy]);}}
   else if(c==='H'){n.forEach(v=>{cx=v;pts.push([cx,cy]);});}else if(c==='V'){n.forEach(v=>{cy=v;pts.push([cx,cy]);});}
   else if(c==='A'){cx=n[5];cy=n[6];pts.push([cx,cy]);}return'';});}
 return pts;};
const out=[];let n=0,texts=0;
w.INTERVIEW_BANK.forEach(q=>['zh','en'].forEach(lang=>{
 const m=q[lang].answer.match(/<svg[\s\S]*?<\/svg>/);if(!m)return;if(lang==='zh')n++;
 host.innerHTML=m[0];const root=host.querySelector('svg');
 const vb=(root.getAttribute('viewBox')||'0 0 520 200').split(/\s+/).map(Number);
 const rects=[...root.querySelectorAll('rect')].map(r=>box(r,root)).filter(r=>!(r.width>=vb[2]-1)); // 排除整張底色
 const segs=[];root.querySelectorAll('line').forEach(l=>{const sw=+(l.getAttribute('stroke-width')||2);if(sw<1.2)return;
   segs.push([+l.getAttribute('x1'),+l.getAttribute('y1'),+l.getAttribute('x2'),+l.getAttribute('y2'),sw/2]);});
 root.querySelectorAll('path,polyline,polygon').forEach(el=>{if(+(el.getAttribute('stroke-opacity')||1)<0.5)return;  // 半透明高亮不算障礙
   const sw=+(el.getAttribute('stroke-width')||1.5),p=ptsOf(el);
   for(let i=1;i<p.length;i++)segs.push([p[i-1][0],p[i-1][1],p[i][0],p[i][1],Math.max(sw/2,0.75)]);});
 const info=[...root.querySelectorAll('text')].map(t=>({s:t.textContent.trim(),b:box(t,root)})).filter(x=>x.s);
 if(lang==='zh')texts+=info.length;
 const inOwn=b=>{const cx=b.x+b.width/2,cy=b.y+b.height/2;return rects.some(r=>cx>r.x&&cx<r.x+r.width&&cy>r.y&&cy<r.y+r.height);};
 info.forEach((t,i)=>{const b=t.b;if(inOwn(b))return;let h=null;
  if(b.x<vb[0]-1||b.y<vb[1]-1||b.x+b.width>vb[0]+vb[2]+1||b.y+b.height>vb[1]+vb[3]+1)h='出界';
  if(!h&&rects.some(r=>ov(b,r)))h='壓方塊';
  const shrunk={x:b.x+0.5,y:b.y+0.5,width:Math.max(b.width-1,0.5),height:Math.max(b.height-1,0.5)};
  if(!h&&segs.some(s=>hitsRect(s[0],s[1],s[2],s[3],shrunk,s[4])))h='壓線';
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
| 批次 6（PCB q33–q38，其中 2 題與 q21/q23 同圖） | 6 | 11px @520 | **0** |
| **合計** | **38 / 38 題** | — | **0** |

zh + en 兩份一起掃：71 張、1051 個文字、重疊 0。

### 2026-08-01 重測（電路類 B 改用符號庫重畫之後）

同一段 snippet，Chromium 實測 38 題（zh+en 71 張、zh 663 個文字）：**重疊 8**。

| 題 | 文字 | 判定 |
|---|---|---|
| q18（zh/en 各 3） | `300ns limit (F…` / `Rp 2.2k -> tr…` / `Rp 10k -> tr 8…` | 壓線 |
| q26（zh/en 各 1） | `-20dB/dec` | 壓線 |

兩題都還是舊的深色手繪版、不在這輪範圍。把 `git show HEAD:interview-bank.js` 餵同一段
snippet 得到一模一樣的 8 筆，所以是既有的、不是這輪造成的。

**2026-08-01 更正**：這 8 筆多數是 snippet 自己的誤報，不是真的重疊。當時的
snippet 還在用「線段 bbox」當障礙，一條斜線的 bbox 會把整個象限都算成障礙區
（node 版早就改成線段真交集了，所以它是乾淨的）。snippet 換成 slab 法之後重測，
q18 那三筆整組消失，只有 q26 的 `-3dB at fc` 是真的擦邊（1.5px）。詳見下一節。

這輪重畫的 8 題（q6 q8 q11 q19 q21 q25 q33 q36）：**重疊 0**。

### 2026-08-01 收尾（38/38 全部轉成符號庫畫風之後）

**38 題 / zh+en 76 張 / zh 740 個文字 / 重疊 0**（0.5px 門檻、線段真交集）。
node 版 `interview-diagram-check.js` 同樣 0 發現，兩版第一次完全一致。

各批的語意驗證器（不是只驗重疊）：
`verify-batch11` 電路類 B、`verify-batch12` flyback 66 條、
`verify-batch13` 波形 84 條、`verify-batch14` 表格/剖面 62 條。

### 2026-08-01 第三次重測（波形/曲線八題重畫 + snippet 修正之後）

snippet 換成線段真交集之後掃全庫：**38 題 / zh+en 76 張 / zh 731 個文字 / 重疊 0**。

過程中真的抓到兩筆（都在 2px 以下，node 版看不到，所以是 snippet 修好才浮出來的）：

| 題 | 文字 | 距離 | 修法 |
|---|---|---|---|
| q26 | `-3dB at fc` | 離幅頻曲線 1.5px | 標籤上移 6px |
| q28–q32 | `470u`（Cout 值） | 離電容極板 1px | 標籤右移 4px |

判準：**node 版與瀏覽器版對不上時，先確認是哪一版的幾何算錯**，
再決定是修圖還是修檢查器。這次是檢查器（bbox）錯，圖只有兩處是真的要修。

### 2026-08-01 第二次重測（flyback q28–q32 重畫之後）

38 題 / zh+en **76 張**（flyback 那 5 題的 en 欄位原本沒有圖，這輪一起補上）/ zh 708 個文字。
重疊仍是同樣那 8 筆（q18 六筆、q26 兩筆），新畫的 13 題全部 0。

掃描 snippet 要多加一行：flyback 的繞組是 `<path>` 的 `A`（圓弧）指令，
原版 `seg()` 只解析 M/H/V/L，遇到 A 會把弧的終點漏掉。已在這次實測的版本補上
`else if(c==='A'){cx=n[5];cy=n[6];...}`（用弧的終點，凸起的 4.5px 不計入）。

PCB 那 6 題原本只存在 `interview-pcb.sql`，bank.js 沒有 → 前端回填比對不到題幹，永遠補不上圖。
已把它們加進 `interview-bank.js`（q33–q38），**題幹逐字從 SQL 解析**而不是手抄，
所以回填與 SQL 兩條路指到同一列。

### CI 守衛：`interview-diagram-check.js`（2026-07-30 接上）

上面那段瀏覽器 snippet 是權威驗收，但它要人手動貼進 console——沒人跑就等於沒有。
所以另外寫了 node 版接進 CI（`ci.yml` 步驟 2h），擋兩類回歸：

| 類別 | 擋什麼 |
|---|---|
| 規格 | svg 缺 `width`/`height`、viewBox 寬 > 720、字級 < 10 |
| 鐵律 | 文字壓到方塊／走線／別的文字、文字出界 |

node 沒有 DOM，字寬靠內建的字元寬度表推算。表是在瀏覽器實測 1051 個文字節點校正出來的，
校正後「實測/估算」中位數 1.000、範圍 0.928–1.043。

兩個容差是配套的，**別單獨調**：`SAFETY=1.05`（字寬往寬抓）＋ `TOL=2.0`（疊超過 2px 才報）。
為什麼不用瀏覽器版的 0.5px：估算誤差在 11px 字上約 ±1.5px，用 0.5px 會把「刻意留 1–2px 邊距」
的合法排版報成重疊（實測會多出 33 筆誤報）。**驗收仍以瀏覽器實測為準，node 版只擋回歸。**

做這張表時踩的坑：編碼用每字元 3 位數，但粗體 `M` 是 1.005 em → 4 位數 → 整條表往後錯位，
粗體字寬全錯（誤差 3% 變 19%，還誤報 4 筆）。現在改 4 位數，並在載入時檢查長度。

`interview-diagram-check.test.js` 證明它擋得住：把標籤推到線上、推到別的字上、推出畫布、
字級調成 8px、拿掉 svg 的 width——五種壞法都要被抓到，外加「未改動的 bank 必須通過」。
**「跑起來 0 發現」只證明不誤報，不證明抓得到**，這支測試補的就是後者。

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
