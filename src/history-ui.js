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
function peiNotesHTML(list){
  return list.map(pei=>`<div class="pei-note"><div class="pei-citation">${esc(pei.citation)}</div><blockquote>${esc(pei.quote)}</blockquote></div>`).join('');
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
 let number=0;
 const mains=excerpts.filter(x=>x.work!=='peizhu');
 const {attached,orphans}=attachPeiNotes(mains,excerpts.filter(x=>x.work==='peizhu'));
 let body=sourceExcerptOrder.map(([work,title])=>{
  const items=mains.filter(x=>x.work===work);
  if(!items.length)return '';
  const groups=[];
  for(const item of items){
   const g=groups.find(g=>g.citation===item.citation);
   if(g){g.items.push(item);if(item.provisional)g.provisional=true;}
   else groups.push({citation:item.citation,items:[item],provisional:!!item.provisional});
  }
  return `<section class="source-work"><h4>${++number} · ${title}</h4>${groups.map((g,gi)=>{
   const quoteId=`source-quote-${p.id}-${work}-${gi}`;
   return `<article class="source-excerpt"><div class="source-citation">${esc(g.citation)}</div>${g.provisional?'<small>此段尚待正文、注文與本人身分的二次復核。</small>':''}${g.items.map((item,ii)=>`<blockquote${ii?'':' id="'+quoteId+'"'}>${esc(item.quote)}</blockquote>${attached.has(item.id)?peiNotesHTML(attached.get(item.id)):''}`).join('')}<button type="button" class="source-expand" aria-expanded="false" aria-controls="${quoteId}">展開全文</button></article>`;
  }).join('')}</section>`;
 }).join('');
 if(orphans.length)body+=`<section class="source-work"><h4>${++number} · 裴松之注</h4><article class="source-excerpt"><div class="source-citation">所注正文未收錄</div>${peiNotesHTML(orphans)}</article></section>`;
 return body;
}
function activateSourceExcerpts(){
 $('#modal').querySelectorAll('.source-excerpt').forEach(card=>{
  const quotes=[...card.querySelectorAll('blockquote')],button=card.querySelector('.source-expand');
  button.hidden=!quotes.some(q=>q.scrollHeight>q.clientHeight+1);
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
  const h=historyOf(p),all=[...h.segments,...(h.unplaced||[])];
  const portrait=PORTRAITS.people[p.id],appearance=portrait?.appearance||p.m;
  const sec=(title,body,empty)=>`<div class="sec"><h3>${title}</h3><div class="body">${body||`<span class="empty">${empty}</span>`}</div></div>`;
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><div class="person-intro">${portraitHTML(p)}<div class="person-intro-text"><h2>${esc(p.n)}${p.z?`<span class="zi">字${esc(p.z)}</span>`:''}</h2><div class="meta"><span>${esc(lifeLabel(p))}</span><span>${esc(chronologyLabel(h))}</span><span style="flex-basis:100%">籍貫：${esc(p.p||'待考')}</span>${biographySourceLine(p)}</div></div></div>
    <div class="person-modal-body" tabindex="0" aria-label="人物資料，可捲動">
    ${h.overview?sec('生平提要',esc(h.overview)):''}
    ${lifeVariantsHTML(h)}
    ${personFactsHTML(h)}
    ${sec('一 · 實際統屬',affiliationEvidenceHTML(h))}
    ${hanOfficesHTML(h)}
    ${sec('二 · 歷年統屬',all.length?`<div class="biography-sequence">${all.map((s,i)=>`<button type="button" data-tenure="${i}">${esc(s.label||factionInfo(s.faction).label)} ${s.start!=null?(s.openStart?'起年未詳':s.start)+(s.point?'年記載':'—'+(s.openEnd?'迄年未詳':s.end)):'年代未詳'}</button>`).join('')}</div>`:'','統屬履歷尚待整理；已有史料見下方摘錄。未因缺少起年而否定其歸屬，也不以原表總標籤反推整段人生。')}
    ${sec('三 · 史料摘錄',personSourceExcerptsHTML(h,p),'相關原文尚待核對，本頁不補寫傳記。')}
    ${sec('四 · 相貌與服飾記載',appearance?esc(appearance)+(portrait?.appearanceSource?'<div class="src">'+sourceLink(portrait.appearanceSource)+'</div>':''):'','未收錄已核對的記載；不據演義補寫。')}
    ${sec('五 · 陳壽評曰',chenAppraisalsHTML(h))}
    <p class="source-audit-note">「歸屬不詳」表示證據不足；「無勢力」只用於有記載支持的未仕、退居或獨立活動。生卒、繫年存在推定或異說時，依條目說明閱讀。原始資料已另存備份。</p></div>`;
  activateModal(p.n+'人物資料');
  activateSourceExcerpts();
  $('#modal').querySelectorAll('[data-tenure]').forEach(b=>b.onclick=()=>{
    const s=all[+b.dataset.tenure];$('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><h2>${esc(p.n)}</h2>${evidenceHTML(s)}<button class="btn" id="backToPerson">返回人物</button>`;activateModal(p.n+'史料依據');$('#backToPerson').onclick=()=>openPerson(p);
  });
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
