function evidenceHTML(s){
  return `<article class="evidence-card"><h3>${esc(s.label||factionInfo(s.faction).label)} <span class="evidence-badge">${s.affiliationCertainty==='exact'?'統屬確定 · ':''}${precisionText[s.precision]||'年代未定'}</span></h3><div>${esc(spanLabel(s))}</div>${s.note?`<small>${esc(s.note)}</small>`:''}${s.quote?`<blockquote>${esc(s.quote)}</blockquote>`:''}<div>${sourceLink(s.source)}</div>${(s.references||[]).map(sourceLink).join(' · ')}</article>`;
}
function personFactsHTML(h){
  if(!h.facts?.length)return '';
  return `<section class="person-facts"><h3>生平考據</h3>${h.facts.map(f=>`<details><summary><b>${esc(f.label)}</b><span>${esc(f.value)}</span><i>${f.precision==='exact'?'明載':'推定／相參'}</i></summary><blockquote>${esc(f.quote)}</blockquote>${sourceLink(f.source)}</details>`).join('')}</section>`;
}
function lifeVariantsHTML(h){
 const review=h.secondReview,variants=['birth','death'].flatMap(kind=>(review?.conclusions?.[kind]?.variants||[]).map(v=>({kind,...v})));
 if(!variants.length)return '';
 return `<section class="person-facts"><h3>生卒異說</h3>${variants.map(v=>`<details><summary><b>${v.kind==='birth'?'生年':'卒年'}異說</b><span>${esc(v.value)}</span><i>異說</i></summary><p>${esc(v.note)}</p>${(v.evidence||[]).map(id=>{const e=review.evidence[id];return e?`<blockquote>${esc(e.quote)}</blockquote><small>${esc(e.citation)}</small>`:'';}).join('')}</details>`).join('')}</section>`;
}
function affiliationEvidenceHTML(h){
 const all=affiliationsOf(h);
 if(!all.length)return '<span class="empty">尚無足夠證據確認實際歸屬。</span>';
 return `<div class="person-affiliation-overview">${esc(affiliationSummary(h))}${officeSummary(h)?`<small>（${esc(officeSummary(h))}）</small>`:''}</div>${h.reviewNote?`<p class="source-audit-note">${esc(h.reviewNote)}</p>`:''}<div class="affiliation-evidence">${all.map(a=>{
  const isRelation=a.relation!=='leader'&&a.relation!=='service'&&!!relationText[a.relation];
  const explanation=a.relation==='leader'?'本人自領該勢力；與合作關係及漢末名義官爵分列。':isRelation?relationText[a.relation]+'關係；不等同正式軍政任官。':'';
  return `<details><summary>${esc(affiliationLabel(a))}<span>${a.start!=null?esc(spanLabel(a)):isRelation?'關係有據 · 完整起訖未定':'統屬有據 · 完整起訖未定'}</span></summary>${explanation?`<p>${esc(explanation)}</p>`:''}<blockquote>${esc(a.quote)}</blockquote>${sourceLink(a.source)}</details>`;
 }).join('')}</div>`;
}
function hanOfficesHTML(h){
 if(!h.hanOffices?.length)return '';
 return `<section class="person-facts"><h3>漢末官爵 · 與實際統屬分列</h3>${h.hanOffices.map(o=>`<details><summary><b>${esc(o.title)}</b><span>${esc(o.issuer)}</span><i>${esc(o.status==='appointed-not-served'?'未就任':o.period||'年代待考')}</i></summary><p>${o.status==='appointed-not-served'?'有徵授記載，但本傳明言未就任。':o.kind==='lord'?'此為漢末劉備所授，不記作漢獻帝詔封。':'官爵屬漢朝名義，不能單憑官名推定本人軍隊歸屬。'}${o.note?' '+esc(o.note):''}</p><blockquote>${esc(o.quote)}</blockquote>${sourceLink(o.source)}</details>`).join('')}</section>`;
}
function chenAppraisalsHTML(h){
  if(!h.appraisals?.length)return '<span class="empty">已核對《三國志》卷末評曰，未見直接評及本人的句段或適用的合傳總評。</span>';
  return h.appraisals.map(a=>{
    const scope=a.kind==='chapter'?'本卷合傳總評':a.kind==='shared'?'共同評語 · '+a.sharedWith.map(esc).join('、'):'本人相關評語';
    const whole=HISTORY.appraisalChapters[a.source];
    return `<article class="chen-appraisal" data-appraisal-source="${esc(a.source)}"><div class="src">${scope}</div><blockquote>${esc(a.quote)}</blockquote>${a.note?`<small>${esc(a.note)}</small>`:''}<div class="src">${sourceLink(a.source)}</div>${!a.full&&whole?`<details><summary>本卷評曰全文</summary><blockquote>${esc(whole.quote)}</blockquote></details>`:''}</article>`;
  }).join('');
}
const sourceExcerptOrder=[
  ['sanguozhi','三國志'],['houhanshu','後漢書'],['huayang','華陽國志'],['jinshu','晉書']
];
function attachPeiNotes(mains,peis){
  const bySrc={};
  mains.forEach(m=>{(bySrc[m.source]=bySrc[m.source]||[]).push(m);});
  const attached=new Map(),orphans=[];
  for(const pe of peis){
    const cands=bySrc[pe.source]||[];
    const before=cands.filter(m=>m.paragraph<=pe.paragraph);
    let target=before.length?before.reduce((a,b)=>b.paragraph>=a.paragraph?b:a):null;
    if(!target){
      const after=cands.filter(m=>m.paragraph>pe.paragraph).sort((a,b)=>a.paragraph-b.paragraph);
      target=after.length?after[0]:null;
    }
    if(target){
      if(!attached.has(target.id))attached.set(target.id,[]);
      attached.get(target.id).push(pe);
    }else orphans.push(pe);
  }
  return {attached,orphans};
}
function peiTagHTML(label,tipHTML){
  return `<span class="pei-tag" tabindex="0">${label}<span class="pei-tiptext" hidden>${tipHTML}</span></span>`;
}
function peiNotesHTML(list){
  return `<span class="pei-group">${list.map(pei=>peiTagHTML('裴注',`<div class="pei-tip-citation">${esc(pei.citation)}</div><div>${esc(pei.quote)}</div>`)).join('')}</span>`;
}
// 裴注标记：sidneyluo 文本中的注文引子
const PEI_MARKERS=['臣松之案','臣松之以為','臣松之謂','臣松之云','魏略曰','吳書曰','孫盛曰','魚豢曰','王沈魏書曰','習鑿齒曰','干寶曰','孫盛魏氏春秋曰','魏氏春秋曰','江表傳曰','吳錄曰','九州春秋曰','典略曰','傅子曰','世語曰','漢晉春秋曰'];
// 把 quote 按裴注标记切分成 segs：[{t:'main',h},{t:'pei',h}]
function parsePeiSegs(quote){
  if(!quote||typeof quote!=='string')return null;
  const segs=[];
  // 按句子切分，判断每句是否为裴注
  const sentences=quote.split(/(?<=[。！？])/);
  let buf='',bufIsPei=false;
  const flush=()=>{if(buf){segs.push({t:bufIsPei?'pei':'main',h:esc(buf)});buf='';}};
  for(const s of sentences){
    const t=s.trim();
    if(!t)continue;
    const isPei=PEI_MARKERS.some(m=>t.startsWith(m));
    if(isPei!==bufIsPei&&buf){flush();}
    bufIsPei=isPei;
    buf+=s;
  }
  flush();
  // 如果全是 main（无裴注），返回 null 用原文渲染
  if(segs.length===1&&segs[0].t==='main')return null;
  return segs.length?segs:null;
}
let peiTipEl=null,peiDocBound=false;
function showPeiTip(anchor){
  hidePeiTip();
  const src=anchor.querySelector('.pei-tiptext');
  if(!src||!src.textContent)return;
  peiTipEl=document.createElement('div');
  peiTipEl.className='pei-tip';
  peiTipEl._tag=anchor;
  const closeBtn=document.createElement('button');
  closeBtn.type='button';
  closeBtn.className='pei-tip-close';
  closeBtn.setAttribute('aria-label','關閉');
  closeBtn.textContent='✕';
  closeBtn.addEventListener('click',e=>{e.stopPropagation();hidePeiTip();});
  peiTipEl.appendChild(closeBtn);
  const body=document.createElement('div');
  body.className='pei-tip-body';
  body.innerHTML=src.innerHTML;
  peiTipEl.appendChild(body);
  peiTipEl.addEventListener('click',e=>e.stopPropagation());
  document.body.appendChild(peiTipEl);
  const r=anchor.getBoundingClientRect(),pad=8;
  let top=r.bottom+pad,left=r.left;
  const tw=peiTipEl.offsetWidth,th=peiTipEl.offsetHeight;
  if(top+th>window.innerHeight-pad)top=Math.max(pad,r.top-th-pad);
  if(left+tw>window.innerWidth-pad)left=Math.max(pad,window.innerWidth-tw-pad);
  peiTipEl.style.top=top+'px';
  peiTipEl.style.left=left+'px';
}
function hidePeiTip(){if(peiTipEl){peiTipEl.remove();peiTipEl=null;}}
function togglePeiTip(tag){
  if(peiTipEl&&peiTipEl._tag===tag)hidePeiTip();
  else showPeiTip(tag);
}
function activatePeiTags(){
  $('#modal').querySelectorAll('.pei-tag').forEach(tag=>{
    if(tag.dataset.peiBound)return;
    tag.dataset.peiBound='1';
    tag.addEventListener('click',e=>{e.stopPropagation();togglePeiTip(tag);});
    tag.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();togglePeiTip(tag);}
    });
  });
  const modal=$('#modal');
  const body=modal.querySelector('.person-modal-body');
  if(body&&!body.dataset.peiScrollBound){
    body.dataset.peiScrollBound='1';
    body.addEventListener('scroll',hidePeiTip,{passive:true});
  }
  if(!peiDocBound){
    peiDocBound=true;
    document.addEventListener('click',hidePeiTip);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePeiTip();});
  }
}
function cjkToNum(s){
  const d={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
  s=String(s||'').trim();
  if(/^\d+$/.test(s))return +s;
  if(s==='十')return 10;
  let m=s.match(/^([一二三四五六七八九])十([一二三四五六七八九])?$/);
  if(m)return d[m[1]]*10+(m[2]?d[m[2]]:0);
  m=s.match(/^十([一二三四五六七八九])$/);
  if(m)return 10+d[m[1]];
  return d[s]||0;
}
function biographySourceId(p){
  const s=String(p.s||'');
  let m=s.match(/魏書([一二三四五六七八九十\d]+)/);
  if(m)return 'a04-'+String(cjkToNum(m[1])).padStart(3,'0');
  m=s.match(/後漢書[·・]?卷?([一二三四五六七八九十\d]+)/);
  if(m)return 'a03-'+String(cjkToNum(m[1])).padStart(3,'0');
  m=s.match(/晉書[·・]?卷?([一二三四五六七八九十\d]+)/);
  if(m)return 'a05-'+String(cjkToNum(m[1])).padStart(3,'0');
  m=s.match(/華陽國志[·・]?卷?([一二三四五六七八九十\d]+)/);
  if(m)return 'a06-'+String(cjkToNum(m[1])).padStart(3,'0');
  return '';
}
function biographySourceLine(p){
  const id=biographySourceId(p);
  return id?`<span style="flex-basis:100%">依據：${sourceLink(id)}</span>`:'';
}
function citationGroups(items){
  const groups=[];
  for(const item of items){
    const g=groups.find(g=>g.citation===item.citation);
    if(g){g.items.push(item);if(item.provisional)g.provisional=true;}
    else groups.push({citation:item.citation,items:[item],provisional:!!item.provisional});
  }
  return groups;
}
// 摘录删除功能开关：已禁用（2026-10-25 用户要求）。置 true 可恢复×按钮与 DELETE 删除。
const EXCERPT_DELETE_ENABLED=false;
function excerptCardsHTML(groups,p,work,attached){
  return groups.map((g,gi)=>{
    const quoteId=`source-quote-${p.id}-${work}-${gi}`;
    // 引用加原文链接（sidneyluo），方便看上下文
    const src0=g.items[0]?.source||'';
    const m=src0.match(/^(a0[345])-(\d+[a-z]*)/);
    const srcLink=m?` <a href="http://www.sidneyluo.net/a/${m[1]}/${m[2]}.html" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#999">原文</a>`:'';
    return `<article class="source-excerpt"><div class="source-citation">${esc(g.citation)}${srcLink}</div>${g.provisional?'<small>此段尚待正文、注文與本人身分的二次復核。</small>':''}${g.items.map((item,ii)=>{
      let body;
      if(item.segs&&item.segs.length){
        let html='',i=0;
        const segs=item.segs;
        while(i<segs.length){
          if(segs[i].t==='pei'){
            let j=i;
            while(j<segs.length&&segs[j].t==='pei')j++;
            html+=`<span class="pei-group">${segs.slice(i,j).map(s=>peiTagHTML('裴注',s.h)).join('')}</span>`;
            i=j;
          }else{html+=segs[i].h;i++;}
        }
        body=html;
      }else{
        // 无 segs 时，尝试从 sidneyluo 文本解析裴注
        const parsed=parsePeiSegs(item.quote);
        if(parsed){
          let html='',i=0;
          while(i<parsed.length){
            if(parsed[i].t==='pei'){
              let j=i;
              while(j<parsed.length&&parsed[j].t==='pei')j++;
              html+=`<span class="pei-group">${parsed.slice(i,j).map(s=>peiTagHTML('裴注',s.h)).join('')}</span>`;
              i=j;
            }else{html+=parsed[i].h;i++;}
          }
          body=html;
        }else{body=esc(item.quote);}
      }
      const delId=`${p.id}|${work}|${item.id||ii}|${esc(g.citation)}`;
      const excerptId=item.id||'';
      return `<div class="excerpt-wrap" data-del-id="${esc(delId)}" style="position:relative">${EXCERPT_DELETE_ENABLED?`<button type="button" class="excerpt-del" data-del-id="${esc(delId)}" data-excerpt-id="${esc(excerptId)}" title="删除此条（误摘）" style="position:absolute;top:2px;right:4px;border:none;background:transparent;color:#999;font-size:16px;cursor:pointer;padding:2px 6px;z-index:5">×</button>`:''}<blockquote${ii?'':' id="'+quoteId+'"'}>${body}</blockquote></div>${item.bioPara!=null?`<button type="button" class="bio-link" data-bio-jump="bio-p-${p.id}-${item.bioPara}" data-pid="${p.id}">本传亦载</button>`:''}${attached&&attached.has(item.id)?peiNotesHTML(attached.get(item.id)):''}`;
    }).join('')}<button type="button" class="source-expand" aria-expanded="false" aria-controls="${quoteId}">展開全文</button></article>`;
  }).join('');
}
// 二 · 晉書：有摘錄者占位懒加载，无摘錄者显示空态（与通鉴同模式）
function jinshuSectionHTML(p){
  const vols=(typeof JS_INDEX!=='undefined'&&JS_INDEX[p.id])||null;
  if(vols&&vols.length)return `<div data-js-person="${p.id}"><span class="empty">晉書摘錄載入中…</span></div>`;
  return '<span class="empty">未收錄與本人相關的晉書記載。</span>';
}
// 三 · 資治通鑑：有摘錄者占位懒加载，无摘錄者显示空态
function tongjianSectionHTML(p){
  const vols=(typeof TJ_INDEX!=='undefined'&&TJ_INDEX[p.id])||null;
  if(vols&&vols.length)return `<div data-tj-person="${p.id}"><span class="empty">通鑑摘錄載入中…</span></div>`;
  return '<span class="empty">未收錄與本人相關的通鑑記載。</span>';
}
// 新三段式：一三國志（含裴注）/二晉書/三資治通鑑
function newExcerptsHTML(excerpts,p){
  const mains=excerpts.filter(x=>x.work!=='peizhu');
  let otherMains, attached, orphans;
  // 本传去重已在 loadExcerpts 按 bio_name 完成，此处不再过滤
  otherMains=mains;
  ({attached,orphans}=attachPeiNotes(otherMains,excerpts.filter(x=>x.work==='peizhu')));
  let html=`<section class="source-work"><h4>一 · 三國志（含裴注）</h4>`;
  // 本传全文：从 sidneyluo 按需加载
  html+=`<div data-sl-bio="${p.id}"><span class="empty">本傳全文載入中…</span></div>`;
  const taGroups=citationGroups(otherMains.filter(m=>m.work==='sanguozhi'));
  if(taGroups.length){
    html+=`<div class="src" style="margin:14px 0 4px">以下為本傳以外諸傳記所載：</div>`;
    html+=excerptCardsHTML(taGroups,p,'sanguozhi',attached);
  }
  html+=`</section>`;
  // 晉書改与通鉴同模式：语料管线按卷懒加载（见 loadJinshu），不再渲染 D1 零散条目
  html+=`<section class="source-work"><h4>二 · 晉書</h4>${jinshuSectionHTML(p)}</section>`;
  html+=`<section class="source-work"><h4>三 · 資治通鑑</h4>${tongjianSectionHTML(p)}</section>`;
  if(orphans.length)html+=`<section class="source-work"><h4>附 · 裴注</h4><article class="source-excerpt"><div class="source-citation">所注正文未收錄</div>${peiNotesHTML(orphans)}</article></section>`;
  return html;
}
function personSourceExcerptsHTML(h,p){
  let excerpts=h.sourceExcerpts;
  if(!excerpts){
    excerpts=[];
    if(h.reading){
      const source=h.reading.source,work=source?.startsWith('a04-')?'sanguozhi':source?.startsWith('a03-')?'houhanshu':source?.startsWith('a05-')?'jinshu':null;
      if(work)excerpts.push({work,quote:h.reading.quote,citation:HISTORY.sources[source]?.title||source,provisional:work==='sanguozhi'});
    }
    excerpts.push(...(h.verifiedPeiExcerpts||[]));
  }
  return newExcerptsHTML(excerpts,p);
}
// 通鑑摘錄懒加载：单文件离线版读内嵌数据，dist 版按卷 fetch
let tjDataCache=null;
function tjData(){
  if(tjDataCache)return tjDataCache;
  const el=document.getElementById('tj-data');
  tjDataCache=el?JSON.parse(el.textContent):{};
  return tjDataCache;
}
const tjPromises={};
function tongjianHTML(excerpts,p){
  const byYear=new Map();
  for(const e of excerpts){
    if(!byYear.has(e.yearLabel))byYear.set(e.yearLabel,{ceYear:e.ceYear,items:[]});
    byYear.get(e.yearLabel).items.push(e);
  }
  const years=[...byYear.keys()].sort((a,b)=>byYear.get(a).ceYear-byYear.get(b).ceYear);
  return years.map(yl=>{
    const items=byYear.get(yl).items;
    const quoteId=`source-quote-${p.id}-tongjian-${yl}`;
    return `<article class="source-excerpt"><div class="source-citation">《資治通鑑》${esc(yl)}</div>`+
      items.map((item,ii)=>`<blockquote${ii?'':' id="'+quoteId+'"'}>${item.html}</blockquote>`+
        (item.bioPara!=null?`<button type="button" class="bio-link" data-bio-jump="bio-p-${p.id}-${item.bioPara}" data-pid="${p.id}">本传亦载</button>`:'')
      ).join('')+
      `<button type="button" class="source-expand" aria-expanded="false" aria-controls="${quoteId}">展開全文</button></article>`;
  }).join('');
}
async function loadTongjian(p){
  const vols=(typeof TJ_INDEX!=='undefined'&&TJ_INDEX[p.id])||null;
  const slot=document.querySelector(`[data-tj-person="${p.id}"]`);
  if(!vols||!vols.length||!slot||slot.dataset.tjLoaded)return tjPromises[p.id];
  slot.dataset.tjLoaded='1';
  tjPromises[p.id]=(async()=>{
    try{
      let excerpts=tjData()[p.id];
      if(!excerpts){
        excerpts=[];
        for(const vol of vols){
          const r=await fetch('tongjian/'+vol+'.json');
          if(!r.ok)throw new Error('HTTP '+r.status);
          const j=await r.json();
          excerpts.push(...j.segments.filter(s=>s.pid===p.id));
        }
        excerpts.sort((a,b)=>a.ceYear-b.ceYear||(a.id<b.id?-1:1));
      }
      if(!document.body.contains(slot))return;
      const tmp=document.createElement('div');
      tmp.innerHTML=tongjianHTML(excerpts,p);
      if(tmp.firstElementChild)slot.replaceWith(...tmp.childNodes);
      else slot.innerHTML='<span class="empty">未收錄與本人相關的通鑑記載。</span>';
      activateSourceExcerpts();
    }catch(err){
      if(document.body.contains(slot))slot.innerHTML='<span class="empty">通鑑摘錄載入失敗，請稍後再試。</span>';
    }
  })();
  return tjPromises[p.id];
}
// 晉書摘錄懒加载：与通鉴同模式（单文件版读内嵌 js-data，dist 版按卷 fetch）
let jsDataCache=null;
function jsData(){
  if(jsDataCache)return jsDataCache;
  const el=document.getElementById('js-data');
  jsDataCache=el?JSON.parse(el.textContent):{};
  return jsDataCache;
}
const jsPromises={};
function jinshuHTML(excerpts,p){
  const byVol=new Map();
  for(const e of excerpts){
    if(!byVol.has(e.citation))byVol.set(e.citation,[]);
    byVol.get(e.citation).push(e);
  }
  return [...byVol.entries()].map(([citation,items])=>{
    const quoteId=`source-quote-${p.id}-jinshu-${items[0].vol}`;
    return `<article class="source-excerpt"><div class="source-citation">${esc(citation)}</div>`+
      items.map((item,ii)=>`<blockquote${ii?'':' id="'+quoteId+'"'}>${item.html}</blockquote>`+
        (item.bioPara!=null?`<button type="button" class="bio-link" data-bio-jump="bio-p-${p.id}-${item.bioPara}" data-pid="${p.id}">本传亦载</button>`:'')
      ).join('')+
      `<button type="button" class="source-expand" aria-expanded="false" aria-controls="${quoteId}">展開全文</button></article>`;
  }).join('');
}
async function loadJinshu(p){
  const vols=(typeof JS_INDEX!=='undefined'&&JS_INDEX[p.id])||null;
  const slot=document.querySelector(`[data-js-person="${p.id}"]`);
  if(!vols||!vols.length||!slot||slot.dataset.jsLoaded)return jsPromises[p.id];
  slot.dataset.jsLoaded='1';
  jsPromises[p.id]=(async()=>{
    try{
      let excerpts=jsData()[p.id];
      if(!excerpts){
        excerpts=[];
        for(const vol of vols){
          const r=await fetch('jinshu/'+vol+'.json');
          if(!r.ok)throw new Error('HTTP '+r.status);
          const j=await r.json();
          excerpts.push(...j.segments.filter(s=>s.pid===p.id));
        }
        excerpts.sort((a,b)=>(a.vol<b.vol?-1:a.vol>b.vol?1:(a.id<b.id?-1:1)));
      }
      if(!document.body.contains(slot))return;
      const tmp=document.createElement('div');
      tmp.innerHTML=jinshuHTML(excerpts,p);
      if(tmp.firstElementChild)slot.replaceWith(...tmp.childNodes);
      else slot.innerHTML='<span class="empty">未收錄與本人相關的晉書記載。</span>';
      activateSourceExcerpts();
    }catch(err){
      if(document.body.contains(slot))slot.innerHTML='<span class="empty">晉書摘錄載入失敗，請稍後再試。</span>';
    }
  })();
  return jsPromises[p.id];
}
// 「本传亦载」跳转：展开本传卡片并滚动到对应段落；本传尚未载入时先等待加载
document.addEventListener('click',e=>{
  const link=e.target.closest('[data-bio-jump]');
  if(!link)return;
  e.preventDefault();
  const done=()=>{
    const target=document.getElementById(link.dataset.bioJump);
    if(!target)return false;
    const card=target.closest('.source-excerpt');
    if(card&&!card.classList.contains('expanded')){
      card.classList.add('expanded');
      const btn=card.querySelector('.source-expand');
      if(btn){btn.textContent='收起';btn.setAttribute('aria-expanded','true');}
    }
    target.scrollIntoView({behavior:'smooth',block:'center'});
    target.classList.add('bio-hit');
    setTimeout(()=>target.classList.remove('bio-hit'),2200);
    return true;
  };
  if(done())return;
  const pid=link.dataset.pid;
  const person=(typeof DATA!=='undefined'&&(DATA.per||[]).find(x=>x.id===pid))||{id:pid};
  Promise.resolve(loadSidneyluoBio(person)).then(()=>setTimeout(done,80));
});
// 摘录删除按钮：右上角×，直接调 DELETE /api/excerpts/:id 真删（已由 EXCERPT_DELETE_ENABLED 禁用）
document.addEventListener('click',async e=>{
  if(!EXCERPT_DELETE_ENABLED)return;
  const btn=e.target.closest('.excerpt-del');
  if(!btn)return;
  e.preventDefault();e.stopPropagation();
  const delId=btn.dataset.delId;
  // delId 格式：pid|work|itemId|citation，需解析出真正的 excerpt id
  // 实际存储的 id 在 data-excerpt-id 属性
  const excerptId=btn.dataset.excerptId;
  if(!excerptId){alert('无法删除：缺少摘录ID');return;}
  if(!confirm('确定删除此条摘录？（误摘，如"淮南王允"非"王允"）\n删除后即时生效，不可撤销。'))return;
  try{
    const r=await fetch('/api/excerpts/'+encodeURIComponent(excerptId),{method:'DELETE'});
    const j=await r.json();
    if(!r.ok)throw new Error(j.error||('HTTP '+r.status));
    if(j.deleted>0){
      const wrap=btn.closest('.excerpt-wrap');
      if(wrap)wrap.style.display='none';
    }else{
      alert('删除失败：未找到该摘录');
    }
  }catch(err){
    alert('删除失败：'+err.message+'\n（可能是 D1 未配置，回退到本地标记模式）');
    // 回退：localStorage 标记
    try{
      const key='sanguo-excerpt-deletions';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      if(!arr.includes(delId)){arr.push(delId);localStorage.setItem(key,JSON.stringify(arr));}
    }catch(_){}
    const wrap=btn.closest('.excerpt-wrap');
    if(wrap)wrap.style.display='none';
  }
});
// 导出已删除摘录ID（在控制台运行 copy(exportExcerptDeletions())）
window.exportExcerptDeletions=function(){
  try{
    const arr=JSON.parse(localStorage.getItem('sanguo-excerpt-deletions')||'[]');
    return JSON.stringify(arr,null,1);
  }catch(_){return '[]';}
};
window.clearExcerptDeletions=function(){
  try{localStorage.removeItem('sanguo-excerpt-deletions');}catch(_){}
  document.querySelectorAll('.excerpt-wrap').forEach(w=>w.style.display='');
};
function activateSourceExcerpts(){
  // 应用已删除的摘录（localStorage）
  let deletedIds=[];
  try{deletedIds=JSON.parse(localStorage.getItem('sanguo-excerpt-deletions')||'[]');}catch(_){}
  if(deletedIds.length){
    $('#modal').querySelectorAll('.excerpt-wrap').forEach(w=>{
      if(deletedIds.includes(w.dataset.delId))w.style.display='none';
    });
  }
  $('#modal').querySelectorAll('.source-excerpt').forEach(card=>{
    const targets=[...card.querySelectorAll('blockquote')];
    const bio=card.querySelector('.biography-text');
    if(bio)targets.push(bio);
    const button=card.querySelector('.source-expand');
    if(!button)return;
    button.hidden=!targets.some(q=>q.scrollHeight>q.clientHeight+1);
  button.onclick=()=>{
   const expanded=card.classList.toggle('expanded');
   button.textContent=expanded?'收起':'展開全文';
   button.setAttribute('aria-expanded',String(expanded));
  };
 });
}
function activateModal(title){const mask=$('#mask'),modal=$('#modal');modal.classList.toggle('person-modal',!!modal.querySelector('.person-modal-body'));mask.style.display='flex';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.setAttribute('aria-label',title);modal.scrollTop=0;const body=modal.querySelector('.person-modal-body');if(body)body.scrollTop=0;$('#mClose').onclick=closeModal;$('#mClose').focus();hideTimelineTooltip();}
function openTenure(p,index){
  const h=historyOf(p),s=h.segments[index];
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><h2>${esc(p.n)} · ${esc(s.label||factionInfo(s.faction).label)}</h2><div class="meta">${esc(chronologyLabel(h))}</div>${evidenceHTML(s)}<p class="source-audit-note">色帶表示史料可支持的統屬經歷。虛線表示推定或不確定的時間邊界；不以出生年代替任職起年，不以失載視為一直在任。</p><button class="btn" id="viewFullPerson">人物詳情</button>`;
  activateModal(p.n+'統屬記載');$('#viewFullPerson').onclick=()=>openPerson(p);
}
function openPerson(p){
  const h=historyOf(p);
  const portrait=PORTRAITS.people[p.id],appearance=portrait?.appearance||p.m;
  const modernPlace=(p.p&&PLACE_MODERN[p.p.replace(/（[^）]*）/g,'')])||'今：不詳';
  const sec=(title,body,empty)=>`<div class="sec"><h3>${title}</h3><div class="body">${body||`<span class="empty">${empty}</span>`}</div></div>`;
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><div class="person-intro">${portraitHTML(p)}<div class="person-intro-text"><h2>${esc(p.n)}${p.z?`<span class="zi">字${esc(p.z)}</span>`:''}</h2><div class="meta"><span>${esc(lifeLabel(p))}</span><span>${esc(chronologyLabel(h))}</span><span style="flex-basis:100%">籍貫：${esc(p.p||'待考')}</span><span style="flex-basis:100%">${esc(modernPlace)}</span>${biographySourceLine(p)}</div></div></div>
    <div class="person-modal-body" tabindex="0" aria-label="人物資料，可捲動">
    ${h.overview?sec('生平提要',esc(h.overview)):''}
    ${lifeVariantsHTML(h)}
    ${personFactsHTML(h)}
    ${sec('一 · 實際統屬',affiliationEvidenceHTML(h))}
    ${hanOfficesHTML(h)}
    ${sec('二 · 史料摘錄',`<div data-excerpts="${p.id}"><span class="empty">摘錄載入中…</span></div>`,'相關原文尚待核對，本頁不補寫傳記。')}
    ${sec('三 · 相貌與服飾記載',appearance?esc(appearance)+(portrait?.appearanceSource?'<div class="src">'+sourceLink(portrait.appearanceSource)+'</div>':''):'','未收錄已核對的記載；不據演義補寫。')}
    ${sec('四 · 陳壽評曰',chenAppraisalsHTML(h))}
    <p class="source-audit-note">「歸屬不詳」表示證據不足；「無勢力」只用於有記載支持的未仕、退居或獨立活動。生卒、繫年存在推定或異說時，依條目說明閱讀。原始資料已另存備份。</p></div>`;
  activateModal(p.n+'人物資料');
  activateSourceExcerpts();
  activatePeiTags();
  loadTongjian(p);
  loadJinshu(p);
  loadExcerpts(p,h);
}
// 本传全文：从 /api/biography/:pid 取 sidneyluo 全文
async function loadSidneyluoBio(p){
  const slot=document.querySelector(`[data-sl-bio="${p.id}"]`);
  if(!slot||slot.dataset.loaded)return;
  slot.dataset.loaded='1';
  try{
    const r=await fetch('/api/biography/'+p.id);
    if(!r.ok)throw new Error('HTTP '+r.status);
    const bio=await r.json();
    if(!document.body.contains(slot))return;
    // 裴注解析
    const segs=parsePeiSegs(bio.full_text)||[{t:'main',h:esc(bio.full_text)}];
    // 裴注标签跟在正文段内，不单独成行
    let html='',i=0,pi=0;
    while(i<segs.length){
      if(segs[i].t==='pei'){
        let j=i;
        while(j<segs.length&&segs[j].t==='pei')j++;
        const tag=`<span class="pei-group">${segs.slice(i,j).map(s=>peiTagHTML('裴注',s.h)).join('')}</span>`;
        // 追加到上一个段落内；若开头即裴注，则独立成段
        if(html.endsWith('</p>')){
          html=html.slice(0,-4)+tag+'</p>';
        }else{
          html+=`<p id="bio-p-${p.id}-${pi}">${tag}</p>`;pi++;
        }
        i=j;
      }else{html+=`<p id="bio-p-${p.id}-${pi}">${segs[i].h}</p>`;pi++;i++;}
    }
    const tmp=document.createElement('div');
    tmp.innerHTML=`<article class="source-excerpt biography-full"><div class="source-citation">${esc(bio.bio_name)} · 全文</div><div class="src">底本：sidneyluo.net <a href="http://www.sidneyluo.net/a/${bio.volume.slice(0,3)}/${bio.volume.slice(4)}.html" target="_blank" rel="noopener noreferrer">《三國志》${esc(bio.volume)}</a>（原文照錄；注文以「裴注」標籤呈現，懸停查看）</div><div class="biography-text">${html}</div><button type="button" class="source-expand" aria-expanded="false">展開全文</button></article>`;
    if(tmp.firstElementChild)slot.replaceWith(tmp.firstElementChild);
    else slot.innerHTML='<span class="empty">本傳全文載入失敗。</span>';
    activateSourceExcerpts();
    activatePeiTags();
  }catch(err){
    if(document.body.contains(slot))slot.innerHTML='<span class="empty">（無三國志本傳）</span>';
  }
}
// 摘录动态加载：优先调 /api/excerpts/:pid（D1），失败回退静态 h.sourceExcerpts
async function loadExcerpts(p,h){
  const slot=document.querySelector(`[data-excerpts="${p.id}"]`);
  if(!slot||slot.dataset.loaded)return;
  slot.dataset.loaded='1';
  let excerpts=null, ownBio=null;
  try{
    const [er, br] = await Promise.all([
      fetch('/api/excerpts/'+p.id).catch(()=>null),
      fetch('/api/biography/'+p.id).catch(()=>null),
    ]);
    if(er && er.ok){ excerpts=await er.json(); }
    if(br && br.ok){ ownBio=await br.json(); }
  }catch(_){}
  if(!excerpts){
    // 回退：静态数据
    excerpts=h.sourceExcerpts||[];
    if(h.reading){
      const source=h.reading.source,work=source?.startsWith('a04-')?'sanguozhi':source?.startsWith('a03-')?'houhanshu':source?.startsWith('a05-')?'jinshu':null;
      if(work)excerpts=[{work,quote:h.reading.quote,citation:HISTORY.sources[source]?.title||source,provisional:work==='sanguozhi'},...excerpts];
    }
    excerpts=[...excerpts,...(h.verifiedPeiExcerpts||[])];
  }
  // 本传已有全文展示，从他传摘录里去掉本传条目，避免重复
  if(ownBio && ownBio.bio_name){
    excerpts = excerpts.filter(m => !(m.work==='sanguozhi' && m.bio===ownBio.bio_name));
  }
  if(!document.body.contains(slot))return;
  const tmp=document.createElement('div');
  tmp.innerHTML=newExcerptsHTML(excerpts,p);
  // newExcerptsHTML 返回三節（三國志/晉書/通鑑），須全數插入；只取 firstElementChild 會丟掉晉書與通鑑節（比照 loadTongjian 的修法）
  if(tmp.firstElementChild)slot.replaceWith(...tmp.childNodes);
  else slot.innerHTML='<span class="empty">未收錄與本人相關的記載。</span>';
  activateSourceExcerpts();
  activatePeiTags();
  // 摘录渲染完后，槽位已存在，再加载本传全文、晉書与通鉴摘录
  loadSidneyluoBio(p);
  loadTongjian(p);
  loadJinshu(p);
}
function portraitHTML(p){
 const entry=PORTRAITS.people[p.id];
 const gender=entry?.gender||PORTRAITS.gender[p.id]||'unknown';
 const file=entry?.file||PORTRAITS.fallback[gender]||PORTRAITS.fallback.unknown;
 return `<figure class="person-portrait"><img src="${esc(file)}" alt="${esc(p.n)}${entry?.file?'藝術示意像':'匿名輪廓'}" width="120" height="120" loading="lazy" decoding="async"><figcaption>${entry?.file?'藝術示意 · 非傳世肖像':entry?.status==='pending'?'畫像製作中 · 暫用輪廓':entry?.status==='insufficient'?'記載簡略 · 匿名輪廓':'資料待核 · 暫用輪廓'}</figcaption></figure>`;
}
function openEventCluster(events){
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><h2>${Math.min(...events.map(e=>e.y))}—${Math.max(...events.map(e=>e.y))} 年記事</h2><div class="meta">共 ${events.length} 件 · 點選查看詳情</div>${events.map((ev,i)=>`<button class="event-list-item" data-event-index="${i}" style="display:block;text-align:left;width:100%;background:#faf5e6;border:1px solid #c8b586;color:#1c1a15;border-radius:5px;padding:13px;margin:8px 0;cursor:pointer"><span style="color:#7a5c2e;margin-right:12px">${ev.y}</span>${esc(ev.n)}</button>`).join('')}`;
  activateModal('年份事件列表');$('#modal').querySelectorAll('[data-event-index]').forEach(b=>b.onclick=()=>openEvent(events[+b.dataset.eventIndex]));
}
