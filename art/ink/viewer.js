(()=>{'use strict';
const links=[...document.querySelectorAll('.art-link')],dialog=document.querySelector('dialog');
if(!dialog||!links.length||!dialog.showModal)return;
const image=dialog.querySelector('.viewer-image img'),prev=dialog.querySelector('.previous'),next=dialog.querySelector('.next');
let index=0,opener=null,overflow='',pushed=false,closingFromHistory=false;
const key=i=>'#view='+encodeURIComponent(links[i].closest('figure')?.id||String(i));
function show(n,updateHash=false){index=Math.max(0,Math.min(links.length-1,n));const a=links[index];image.src=a.getAttribute('href');image.alt=a.dataset.alt||a.dataset.title||'';dialog.querySelector('.viewer-caption h2').textContent=a.dataset.title||'';dialog.querySelector('.viewer-caption p').textContent=a.dataset.note||'';dialog.querySelector('.viewer-count').textContent=`${index+1} / ${links.length}`;prev.disabled=index===0;next.disabled=index===links.length-1;if(updateHash)history.replaceState(history.state,'',key(index));}
function open(n,fromHistory=false){opener=links[n];if(!dialog.open){overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';}show(n);if(!fromHistory){history.pushState({inkViewer:true},'',key(n));pushed=true;}}
function readHash(){if(!location.hash.startsWith('#view='))return -1;const id=decodeURIComponent(location.hash.slice(6));return links.findIndex(a=>a.closest('figure')?.id===id);}
links.forEach((a,n)=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();open(n);}));
function close(){if(pushed&&location.hash.startsWith('#view=')){history.back();}else{if(location.hash.startsWith('#view='))history.replaceState(history.state,'','#'+(links[index].closest('figure')?.id||'top'));dialog.close();}}
dialog.querySelector('.viewer-close').addEventListener('click',close);
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;opener?.focus({preventScroll:true});pushed=false;});
prev.addEventListener('click',()=>show(index-1,true));next.addEventListener('click',()=>show(index+1,true));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&index<links.length-1){e.preventDefault();show(index+1,true);}if(e.key==='ArrowLeft'&&index>0){e.preventDefault();show(index-1,true);}});
addEventListener('popstate',()=>{const n=readHash();if(n>=0)open(n,true);else if(dialog.open)dialog.close();});
const first=readHash();if(first>=0)open(first,true);
})();
