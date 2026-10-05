function evidenceHTML(s){
  return `<article class="evidence-card"><h3>${esc(s.label||factionInfo(s.faction).label)} <span class="evidence-badge">${s.affiliationCertainty==='exact'?'統屬確定 · ':''}${precisionText[s.precision]||'年代未定'}</span></h3><div>${esc(spanLabel(s))}</div>${s.note?`<small>${esc(s.note)}</small>`:''}${s.quote?`<blockquote>${esc(s.quote)}</blockquote>`:''}<div>${sourceLink(s.source)}</div>${(s.references||[]).map(sourceLink).join(' · ')}</article>`;
}
function personFactsHTML(h){
  if(!h.facts?.length)return '';
  return `<section class="person-facts"><h3>生平考據</h3>${h.facts.map(f=>`<details><summary><b>${esc(f.label)}</b><span>${esc(f.value)}</span><i>${f.precision==='exact'?'明載':'推定／相參'}</i></summary><blockquote>${esc(f.quote)}</blockquote>${sourceLink(f.source)}</details>`).join('')}</section>`;
}
function affiliationEvidenceHTML(h){
 const all=affiliationsOf(h);
 if(!all.length)return '<span class="empty">尚無足夠證據確認實際歸屬。</span>';
 return `<div class="person-affiliation-overview">${esc(affiliationSummary(h))}${officeSummary(h)?`<small>（${esc(officeSummary(h))}）</small>`:''}</div>${h.reviewNote?`<p class="source-audit-note">${esc(h.reviewNote)}</p>`:''}<div class="affiliation-evidence">${all.map(a=>`<details><summary>${esc(affiliationLabel(a))}<span>${a.start!=null?esc(spanLabel(a)):relationText[a.relation]?'關係有據 · 完整起訖未定':'統屬有據 · 完整起訖未定'}</span></summary>${relationText[a.relation]?`<p>${esc(relationText[a.relation])}關係；不等同正式軍政任官。</p>`:''}<blockquote>${esc(a.quote)}</blockquote>${sourceLink(a.source)}</details>`).join('')}</div>`;
}
function hanOfficesHTML(h){
 if(!h.hanOffices?.length)return '';
 return `<section class="person-facts"><h3>漢末官爵 · 與實際統屬分列</h3>${h.hanOffices.map(o=>`<details><summary><b>${esc(o.title)}</b><span>${esc(o.issuer)}</span></summary><p>${o.kind==='lord'?'此為漢末劉備所授，不記作漢獻帝詔封。':'官爵屬漢朝名義，不能單憑官名推定本人軍隊歸屬。'}</p><blockquote>${esc(o.quote)}</blockquote>${sourceLink(o.source)}</details>`).join('')}</section>`;
}
function chenAppraisalsHTML(h){
  if(!h.appraisals?.length)return '<span class="empty">已核對《三國志》卷末評曰，未見直接評及本人的句段或適用的合傳總評。</span>';
  return h.appraisals.map(a=>{
    const scope=a.kind==='chapter'?'本卷合傳總評':a.kind==='shared'?'共同評語 · '+a.sharedWith.map(esc).join('、'):'本人相關評語';
    const whole=HISTORY.appraisalChapters[a.source];
    return `<article class="chen-appraisal" data-appraisal-source="${esc(a.source)}"><div class="src">${scope}</div><blockquote>${esc(a.quote)}</blockquote>${a.note?`<small>${esc(a.note)}</small>`:''}<div class="src">${sourceLink(a.source)}</div>${!a.full&&whole?`<details><summary>本卷評曰全文</summary><blockquote>${esc(whole.quote)}</blockquote></details>`:''}</article>`;
  }).join('');
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
  const content=h.reading;
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><div class="person-intro">${portraitHTML(p)}<div class="person-intro-text"><h2>${esc(p.n)}${p.z?`<span style="font-size:15px;color:#a8a192;margin-left:10px">字${esc(p.z)}</span>`:''}</h2><div class="meta"><span>${esc(lifeLabel(p))}</span><span>${esc(chronologyLabel(h))}</span></div></div></div>
    <div class="person-modal-body" tabindex="0" aria-label="人物資料，可捲動">
    ${sec('一 · 基本資料',`姓名：${esc(p.n)}${p.z?'，字'+esc(p.z):''}<br>生卒：${esc(lifeLabel(p))}<br>籍貫：${esc(p.p||'待考')}<br>原資料索引：${esc(p.s||'待考')}`)}
    ${portraitEvidenceHTML(p)}
    ${h.overview?sec('生平提要',esc(h.overview)):''}
    ${personFactsHTML(h)}
    ${sec('實際統屬',affiliationEvidenceHTML(h))}
    ${hanOfficesHTML(h)}
    ${sec('二 · 歷年統屬',all.length?`<div class="biography-sequence">${all.map((s,i)=>`<button type="button" data-tenure="${i}">${esc(s.label||factionInfo(s.faction).label)} ${s.start!=null?(s.openStart?'起年未詳':s.start)+(s.point?'年記載':'—'+(s.openEnd?'迄年未詳':s.end)):'年代未詳'}</button>`).join('')}</div>`:'','統屬履歷尚待整理；已有史料見下方摘錄。未因缺少起年而否定其歸屬，也不以原表總標籤反推整段人生。')}
    ${content?`<article class="evidence-card"><h3>三 · 史料摘錄</h3><blockquote>${esc(content.quote)}</blockquote>${sourceLink(content.source)}<small>電子文本節錄；裴注所引材料依原文保留，不與陳壽正文混稱。</small></article>`:sec('三 · 史料摘錄','','相關原文尚待核對，本頁不補寫傳記。')}
    ${sec('四 · 相貌與服飾記載',appearance?esc(appearance)+(portrait?.appearanceSource?'<div class="src">'+sourceLink(portrait.appearanceSource)+'</div>':''):'','未收錄已核對的記載；不據演義補寫。')}
    ${sec('五 · 陳壽評曰',chenAppraisalsHTML(h))}
    ${sec('六 · 裴松之注',p.v?esc(p.v):'','未另錄已核對的裴注節選；可由上方史料連結查閱。')}
    <p class="source-audit-note">「歸屬不詳」表示證據不足；「無勢力」只用於有記載支持的未仕、退居或獨立活動。生卒、繫年存在推定或異說時，依條目說明閱讀。原始資料已另存備份。</p></div>`;
  activateModal(p.n+'人物資料');
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
function portraitEvidenceHTML(p){
 const entry=PORTRAITS.people[p.id];
 if(!entry?.file)return `<div class="portrait-basis">${entry?.status==='pending'?'個別畫像正在補繪，暫以輪廓佔位。':entry?.status==='insufficient'?'已核資料尚不足以形成個別形象，採用匿名輪廓。':'個別形象資料尚待核對，暫用輪廓；不表示史書沒有記載。'}</div>`;
 return `<details class="portrait-basis"><summary>畫像依據</summary><p>依據史料所見職業、性別及漢末至魏晉服飾語彙繪製。${entry.appearance?'外貌記載：'+esc(entry.appearance):'尚無已核對的個人外貌描述，面容屬藝術示意，不作史實。'}</p>${entry.source?sourceLink(entry.source):''}${entry.appearanceSource&&entry.appearanceSource!==entry.source?' · '+sourceLink(entry.appearanceSource):''}</details>`;
}
function openEventCluster(events){
  $('#modal').innerHTML=`<button id="mClose" aria-label="關閉">✕</button><h2>${Math.min(...events.map(e=>e.y))}—${Math.max(...events.map(e=>e.y))} 年記事</h2><div class="meta">共 ${events.length} 件 · 點選查看詳情</div>${events.map((ev,i)=>`<button class="event-list-item" data-event-index="${i}" style="display:block;text-align:left;width:100%;background:#222d34;border:1px solid #3b474d;color:#d8d3c6;border-radius:5px;padding:13px;margin:8px 0;cursor:pointer"><span style="color:#b9a079;margin-right:12px">${ev.y}</span>${esc(ev.n)}</button>`).join('')}`;
  activateModal('年份事件列表');$('#modal').querySelectorAll('[data-event-index]').forEach(b=>b.onclick=()=>openEvent(events[+b.dataset.eventIndex]));
}
