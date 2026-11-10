(() => {
  'use strict';
  const supported=['ja','en','es','zh-Hans','ko','ar'];
  let data=null;
  function valid(item){return item && supported.every(l=>typeof item.title?.[l]==='string' && item.title[l].trim()) && /^https:\/\//.test(item.url||'');}
  function render(){
    if(!data)return;
    const lang=supported.includes(document.documentElement.lang)?document.documentElement.lang:'ja';
    for(const section of ['goods','news']){
      const host=document.getElementById(section+'-list');if(!host)continue;host.replaceChildren();
      const rows=(Array.isArray(data[section])?data[section]:[]).filter(valid);
      for(const item of rows){
        const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.className='update-entry';a.setAttribute('data-no-translate','');a.lang=lang;
        if(typeof item.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(item.date)){
          const day=new Date(item.date+'T12:00:00Z');if(!Number.isNaN(day.getTime())){const time=document.createElement('time');time.dateTime=item.date;time.textContent=new Intl.DateTimeFormat(lang,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(day);a.append(time);}
        }
        const title=document.createElement('h3');title.textContent=item.title[lang];a.append(title);
        if(item.description?.[lang]){const p=document.createElement('p');p.textContent=item.description[lang];a.append(p);}
        host.append(a);
      }
      host.parentElement.querySelector('.empty-update').hidden=rows.length>0;
    }
  }
  const langChanges=new MutationObserver(render);langChanges.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  fetch('/portfolio.github.io/art/kutan/shared/updates.json').then(r=>{if(!r.ok)throw new Error('Content is unavailable');return r.json()}).then(d=>{data=d;render()}).catch(()=>{});
})();
