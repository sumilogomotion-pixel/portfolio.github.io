(() => {
  'use strict';
  const languages = [['ja','日本語'],['en','English'],['es','Español'],['zh-Hans','中文（简体）'],['ko','한국어'],['ar','العربية']];
  const known = new Set(languages.map(x=>x[0]));
  const dictionaries = window.KUTAN_TRANSLATIONS || {};
  const reverse = new Map();
  for (const dictionary of Object.values(dictionaries)) for (const [key,value] of Object.entries(dictionary)) if (key.length>1 && value) reverse.set(value.trim(),key.trim());
  let lang='ja', pending=false, busy=false;
  const textCache=new WeakMap(), attrCache=new WeakMap(), groups=new WeakMap();
  const jp=/[ぁ-んァ-ヶ一-龯]/;
  const canonical=s=>reverse.get(s.trim()) || s.trim();
  const pick=(ja,en,es,zh,ko,ar)=>({ja,en,es,'zh-Hans':zh,ko,ar})[lang];
  const isolate=s=>lang==='ar'?'\u2068'+s+'\u2069':s;
  const amount=(n,type='art')=>pick(n+'作品',`${n} ${type==='moments'?'moment':type==='drawings'?'drawing':'artwork'}${+n===1?'':'s'}`,`${n} ${type==='moments'?'momento':type==='drawings'?'dibujo':'obra'}${+n===1?'':'s'}`,n+(type==='moments'?'个片刻':'幅作品'),type==='moments'?n+'개의 한 장면':n+'점의 작품',`${isolate(n)} ${type==='moments'?'من اللحظات':type==='drawings'?'من الرسومات':'من الأعمال'}`);
  function t(input) {
    if (!input || lang==='ja') return input;
    const source=input.trim(), dict=dictionaries[lang]||{};
    if (Object.hasOwn(dict,source)) return input.replace(source,dict[source]);
    let m;
    const name=s=>dict[canonical(s)] || s;
    const fraction=(a,b)=>isolate(a+' / '+b);
    if ((m=source.match(/^(\d+)つのえ$/))) return amount(m[1],'drawings');
    if ((m=source.match(/^(\d+)のひとこま$/))) return amount(m[1],'moments');
    if ((m=source.match(/^(.+)、(\d+)作品$/))) return name(m[1])+' · '+amount(m[2]);
    if ((m=source.match(/^(.+)、掲載準備中$/))) return name(m[1])+' · '+dict['掲載準備中'];
    if ((m=source.match(/^「(.+)」の作品は掲載準備中です。$/))) return pick(source,`Artworks for ${name(m[1])} are coming soon.`,`Las obras de ${name(m[1])} están en preparación.`,`${name(m[1])}的作品正在准备发布。`,`${name(m[1])}의 작품은 공개 준비 중입니다.`,`أعمال ${name(m[1])} قيد الإعداد للنشر.`);
    if ((m=source.match(/^(.+)の作品｜(\d+) \/ (\d+)$/))) return name(m[1])+' · '+fraction(m[2],m[3]);
    if ((m=source.match(/^(四季のひとたち|四季)｜(\d+) \/ (\d+)$/))) return name(m[1])+' · '+fraction(m[2],m[3]);
    if ((m=source.match(/^四季のひとたち 四季｜(\d+) \/ (\d+) (.+)$/))) return name(m[3])+' · '+name('四季のひとたち')+' · '+fraction(m[1],m[2]);
    if ((m=source.match(/^(.+)の登場する作品を見る$/))) return pick(source,`View artworks featuring ${name(m[1])}`,`Ver obras en las que aparece ${name(m[1])}`,`查看${name(m[1])}登场的作品`,`${name(m[1])}이(가) 등장하는 작품 보기`,`عرض الأعمال التي تظهر فيها شخصية ${name(m[1])}`);
    if ((m=source.match(/^(.+)の原画全体$/))) return pick(source,`${name(m[1])}: full original artwork`,`${name(m[1])}: obra original completa`,`${name(m[1])}的完整原画`,`${name(m[1])}의 원화 전체`,`${name(m[1])}: الرسمة الأصلية كاملة`);
    if ((m=source.match(/^(.+)(を大きくみる|の作品を見る)$/))) return pick(source,`View ${name(m[1])}`,`Ver ${name(m[1])}`,`查看《${name(m[1])}》`,`${name(m[1])} 보기`,`عرض ${name(m[1])}`);
    return input;
  }
  function updateText(node){
    const current=node.nodeValue;
    if (!current.trim()) return;
    let record=textCache.get(node);
    if (!record || current!==record.output) record={source:current,output:current};
    const output=t(record.source);
    record.output=output;textCache.set(node,record);
    if(current!==output)node.nodeValue=output;
  }
  function updateAttribute(el,attribute){
    if(!el.hasAttribute(attribute))return;
    const current=el.getAttribute(attribute);
    let cache=attrCache.get(el);if(!cache){cache={};attrCache.set(el,cache)}
    let record=cache[attribute];
    if(!record || current!==record.output)record={source:current,output:current};
    const output=t(record.source);record.output=output;cache[attribute]=record;
    if(current!==output)el.setAttribute(attribute,output);
  }
  function rewriteLink(el){
    const raw=el.getAttribute('href');
    if(!raw || raw.startsWith('#'))return;
    try{const url=new URL(raw,location.href);if(url.origin!==location.origin || !url.pathname.startsWith('/portfolio.github.io/art/kutan/'))return;url.searchParams.set('lang',lang);const next=url.pathname+url.search+url.hash;if(raw!==next)el.setAttribute('href',next)}catch{}
  }
  function visit(el){
    if(el.nodeType===Node.TEXT_NODE){updateText(el);return}
    if(el.nodeType!==Node.ELEMENT_NODE || ['SCRIPT','STYLE','NOSCRIPT','SVG'].includes(el.tagName)||el.hasAttribute('data-no-translate'))return;
    for(const at of ['alt','title','aria-label','placeholder','content'])updateAttribute(el,at);
    if(el.matches('a[href]'))rewriteLink(el);
    if(el.hasAttribute('data-wordmark'))return;
    if(el.hasAttribute('data-i18n-group')){
      let record=groups.get(el);if(!record){record={html:el.innerHTML,lang:'ja'};groups.set(el,record)}
      if(record.lang!==lang){if(lang==='ja')el.innerHTML=record.html;else el.textContent=t(el.dataset.i18nGroup);record.lang=lang}
      return;
    }
    for(const child of Array.from(el.childNodes))visit(child);
  }
  function refresh(){
    pending=false;if(busy)return;busy=true;observer.disconnect();
    visit(document.head);visit(document.body);
    document.querySelectorAll('[data-lang]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.lang===lang)));
    document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['alt','aria-label','title','content']});
    busy=false;
  }
  const observer=new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(refresh)}});
  const bar=document.createElement('div');bar.className='language-strip';
  const label=document.createElement('span');label.className='language-label';label.textContent='言語';bar.append(label);
  const nav=document.createElement('nav');nav.className='language-nav';nav.setAttribute('aria-label','言語');nav.setAttribute('dir','ltr');
  for(const [code,label] of languages){const a=document.createElement('a');const u=new URL(location.href);u.searchParams.set('lang',code);a.href=u.pathname+u.search+u.hash;a.textContent=label;a.lang=code;a.dir=code==='ar'?'rtl':'ltr';a.dataset.lang=code;a.setAttribute('data-no-translate','');a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const u=new URL(location.href);u.searchParams.set('lang',code);history.pushState({},'',u);setLanguage(code,true)});nav.append(a)}
  bar.append(nav);document.body.prepend(bar);
  const foot=document.createElement('aside');foot.className='translation-note';
  foot.innerHTML='<details><summary>翻訳について</summary><p>日本語原文と翻訳は確認用の草案です。中国語は簡体字です。</p><p>サイト内4ページの文章・作品名・操作案内・代替テキストを翻訳しています。</p><p>原画内の手書き文字、外部のSNS・ショップ・作者サイトは翻訳対象外です。</p><p>固有名の表記と翻訳は、作者と各言語話者による確認前です。</p></details>';
  document.body.append(foot);
  for(const a of document.querySelectorAll('[data-external-original]')){const note=document.createElement('small');note.className='external-language';note.textContent='（外部・日本語）';a.append(note)}
  const announce=document.createElement('p');announce.className='visually-hidden';announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');announce.setAttribute('data-no-translate','');document.body.append(announce);
  function requested(){const q=new URLSearchParams(location.search).get('lang');if(known.has(q))return q;try{const v=localStorage.getItem('kutan.preview.language.v1');if(known.has(v))return v}catch{}return 'ja'}
  function setLanguage(code,notify=false){lang=known.has(code)?code:'ja';try{localStorage.setItem('kutan.preview.language.v1',lang)}catch{}refresh();if(notify)announce.textContent=t('言語を切り替えました。')}
  addEventListener('popstate',()=>setLanguage(requested()));
  setLanguage(requested());
  window.KutanI18n={translate:t,get language(){return lang}};
})();
