(()=>{'use strict';
const cards=[...document.querySelectorAll('.work-card')],filters=[...document.querySelectorAll('[data-filter]')],status=document.querySelector('.filter-status');
const allowed=new Set(['all','flyer','booklet','package','logo']);
function applyFilter(kind){if(!allowed.has(kind))kind='all';let count=0;for(const card of cards){card.hidden=kind!=='all'&&card.dataset.category!==kind;if(!card.hidden)count++;}for(const button of filters)button.setAttribute('aria-pressed',String(button.dataset.filter===kind));if(status)status.textContent=`${count}件の制作物を表示`;}
function fromLocation(){const url=new URL(location.href);let kind=url.searchParams.get('category')||'all';const hash=decodeURIComponent(url.hash.slice(1));if(hash.startsWith('category-'))kind=hash.slice(9);const card=cards.find(e=>e.id===hash);if(card)kind=card.dataset.category;applyFilter(kind);if(hash.startsWith('category-'))document.getElementById('works')?.scrollIntoView();if(card)requestAnimationFrame(()=>card.scrollIntoView());}
function choose(kind){const url=new URL(location.href);if(kind==='all')url.searchParams.delete('category');else url.searchParams.set('category',kind);url.hash='works';history.pushState(null,'',url.href);applyFilter(kind);}
filters.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.filter)));
document.querySelectorAll('[data-jump-filter]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();choose(a.dataset.jumpFilter);document.getElementById('works')?.scrollIntoView({behavior:'smooth'});}));
addEventListener('popstate',fromLocation);addEventListener('hashchange',fromLocation);fromLocation();
const dialog=document.getElementById('artwork-dialog');if(!dialog?.showModal)return;
const image=document.getElementById('artwork-full'),title=document.getElementById('artwork-title'),original=document.getElementById('artwork-original');let opener=null,oldOverflow='';
document.querySelectorAll('[data-art-title]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();opener=a;oldOverflow=document.body.style.overflow;image.src=a.getAttribute('href');image.alt=a.dataset.artTitle;title.textContent=a.dataset.artTitle;if(original)original.href=a.href;const note=document.getElementById('artwork-note');if(note)note.textContent=a.dataset.artNote||'';dialog.showModal();document.body.style.overflow='hidden';}));
document.getElementById('close-artwork').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
})();
