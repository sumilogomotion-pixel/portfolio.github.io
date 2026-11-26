(()=>{'use strict';
const links=[...document.querySelectorAll('.art-link')],dialog=document.querySelector('dialog');
if(!dialog||!links.length||!dialog.showModal)return;
const image=dialog.querySelector('.viewer-image img'),prev=dialog.querySelector('.previous'),next=dialog.querySelector('.next');

const catalogue={"work-if02":{"facts":[["制作年","2026年"],["サイズ","25.5 × 36.5 cm"],["画材","墨・厚紙"]],"buys":[["BOOTHで原画を見る","https://booth.pm/en/items/9218173"]],"views":[["顔と細い描線","if02-close-face.webp"],["上部の描線","if02-close-upper.webp"]]},"work-yume-wo-miru":{"facts":[["サイズ","15.8 × 22.7 cm"],["画材","墨・キャンバス"]],"buys":[["BOOTHで原画を見る","https://booth.pm/en/items/9218191"]],"views":[["正面の写真","yume-close-front.webp"],["側面","yume-close-edge.webp"],["「夢」の字","yume-close-letter.webp"],["墨線の細部","yume-close-line.webp"]]},"work-revive":{"facts":[["サイズ","縦31.5 × 横41 × 厚み1.5 cm"],["画材","墨・メディウム・アクリル絵具／キャンバス"]],"buys":[["BASEで原画を見る","https://tentendou.official.ec/items/100325403"]],"views":[["側面","revive-close-edge.webp"],["絵肌の細部","revive-close-relief.webp"]]},"work-shinryu":{"facts":[["サイズ","縦30 × 横24 cm"],["画材","墨・キャンバス"]],"buys":[["BASEで原画を見る","https://tentendou.official.ec/items/86578542"]]},"work-gateway":{"facts":[["画材","墨・ジェルメディウム／キャンバス"]],"buys":[["BASEの作品ページを見る（販売済み）","https://tentendou.official.ec/items/96292861"]]},"work-come-home-with-me":{"facts":[["プリントサイズ","33.3 × 24.2 cm"],["仕様","デジタル作品のキャンバスプリント"],["作中の文字","金色書道液"]],"buys":[["BASEでプリントを見る","https://tentendou.official.ec/items/106648471"]]},"work-karakasa":{"facts":[["画材","墨・紙"]]},"work-futakuchi":{"facts":[["画材","墨・紙"]]},"nekomata":{"facts":[["画材","墨・紙"]]},"karakasa":{"facts":[["画材","墨・紙"]]},"futakuchi":{"facts":[["画材","墨・紙"]]}};
const workId=a=>a.closest('figure,li[id]')?.id;
const make=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el};
function showDetails(a){
 const d=catalogue[workId(a)]||{};
 const facts=dialog.querySelector('.viewer-facts'), tabs=dialog.querySelector('.viewer-tabs'), purchase=dialog.querySelector('.viewer-purchase');
 if(!facts||!tabs||!purchase)return;
 facts.replaceChildren(...(d.facts||[]).flatMap(([k,t])=>[make('dt',k), make('dd',t)]));facts.hidden=!d.facts;
 purchase.replaceChildren(...(d.buys||[]).map(([t,href])=>{const link=make('a',t);link.href=href;return link}));purchase.hidden=!d.buys;
 tabs.replaceChildren();tabs.hidden=!d.views;
 if(d.views){const base=a.href;for(const [i,[label,file]] of [['全体',null],...d.views].entries()){
 const btn=make('button',label);btn.type='button';btn.setAttribute('aria-pressed',String(!i));tabs.append(btn);
 btn.addEventListener('click',()=>{for(const b of tabs.children)b.setAttribute('aria-pressed',String(b===btn));image.src=file?new URL(file,base).href:base;image.alt=a.dataset.title+(file?'・'+label:'');dialog.querySelector('.viewer-caption p').textContent=file?label:(a.dataset.note||'')});
 }}
 dialog.classList.toggle('with-details',Boolean(d.facts||d.views||d.buys));
}

let index=0,opener=null,overflow='',pushed=false,closingFromHistory=false;
const key=i=>'#view='+encodeURIComponent(workId(links[i])||String(i));
function show(n,updateHash=false){index=Math.max(0,Math.min(links.length-1,n));const a=links[index];image.src=a.getAttribute('href');image.alt=a.dataset.alt||a.dataset.title||'';showDetails(a);dialog.querySelector('.viewer-caption h2').textContent=a.dataset.title||'';dialog.querySelector('.viewer-caption p').textContent=a.dataset.note||'';dialog.querySelector('.viewer-count').textContent=`${index+1} / ${links.length}`;prev.disabled=index===0;next.disabled=index===links.length-1;if(updateHash)history.replaceState(history.state,'',key(index));}
function open(n,fromHistory=false){opener=links[n];if(!dialog.open){overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';}show(n);if(!fromHistory){history.pushState({inkViewer:true},'',key(n));pushed=true;}}
function readHash(){if(!location.hash.startsWith('#view='))return -1;const id=decodeURIComponent(location.hash.slice(6));return links.findIndex(a=>workId(a)===id);}
links.forEach((a,n)=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();open(n);}));
function close(){if(pushed&&location.hash.startsWith('#view=')){history.back();}else{if(location.hash.startsWith('#view='))history.replaceState(history.state,'','#'+(workId(links[index])||'top'));dialog.close();}}
dialog.querySelector('.viewer-close').addEventListener('click',close);
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;opener?.focus({preventScroll:true});pushed=false;});
prev.addEventListener('click',()=>show(index-1,true));next.addEventListener('click',()=>show(index+1,true));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&index<links.length-1){e.preventDefault();show(index+1,true);}if(e.key==='ArrowLeft'&&index>0){e.preventDefault();show(index-1,true);}});
addEventListener('popstate',()=>{const n=readHash();if(n>=0)open(n,true);else if(dialog.open)dialog.close();});
const first=readHash();if(first>=0)open(first,true);
})();
