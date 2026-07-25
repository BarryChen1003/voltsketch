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

## 修圖時的規矩

1. **文字帶與圖形帶分離**：說明文字放最底部，方塊不得下探到那條 y。方塊往下移就把畫布 `W(w,h)` / `wrap(w,h)` 的 h 一起加大。
2. **標籤壓到方塊 → 先改 anchor，不要先搬位置**。`anchor:'start'` 讓文字從錨點往右長、`'end'` 往左長；錨點不動＝語意保留（仍在標它該標的東西）。`A()` 支援 `o.anchor`／`o.dx`／`o.dy`。
3. **標籤被自己的線穿過** → 給 `A()` 加 `dy`（垂直挪開），別加 `dx`（會沿線滑動、還是在線上）。
4. **文字超出畫布** → `wrap(w,h,g,{l,t})` 用負 viewBox 原點納入溢出區，元件座標完全不動；或 `W(w,h+n, '<g transform="translate(0,n)">…</g>')`。
5. 改完**一定要重跑上面的實測**，並把 `BUILTIN_VERSION`（knowledge.js）遞增，否則舊 localStorage 快取會蓋住新圖。
