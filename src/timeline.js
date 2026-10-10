/* A single scroll container keeps sticky names and the ruler aligned. Only visible rows are mounted. */
const TL_START=184, TL_END=280, TL_SPAN=97, TL_PAD=16;
const timelineState={scale:20,rows:[],query:'',faction:'all',evidence:'all',mounted:new Map(),raf:0,highlight:null,ready:false,playing:false,year:184,timer:null,cursorTimer:null};
const tlViewport=document.getElementById('timelineViewport');
const tlRows=document.getElementById('timelineRows');
const historyOf=p=>HISTORY.people[p.id]||{first:null,segments:[],unplaced:[]};
const affiliationsOf=h=>h.affiliations||[...h.segments,...(h.unplaced||[])];
const relationText={leader:'自領',family:'家族',royal:'宗室',guest:'賓客',doctor:'召醫',invited:'受邀未明就任',coerced:'被迫隨行',allied:'軍事合作',asylum:'避難依附'};
const portraitFile=p=>{const e=PORTRAITS.people[p.id];const g=e?.gender||PORTRAITS.gender[p.id]||'unknown';return e?.file||PORTRAITS.fallback[g]||PORTRAITS.fallback.unknown||'';};const affiliationLabel=a=>(a.label||factionInfo(a.faction).label)+(relationText[a.relation]?'·'+relationText[a.relation]:'');
function affiliationSummary(h){
  const review=h.secondReview?.conclusions;
  if(review?.primaryFaction){
    const main=factionInfo(review.primaryFaction.faction).label+'·自領';
    const allies=(review.relationships||[]).filter(x=>x.relation==='allied').map(x=>factionInfo(x.faction).label);
    return main+(allies.length?'；合作：'+allies.join('、'):'');
  }
  const labels=affiliationsOf(h).map(affiliationLabel).filter((s,i,a)=>i===0||s!==a[i-1]);return labels.join(' → ')||'歸屬不詳';
}
function officeSummary(h){return (h.hanOffices||[]).map(o=>(o.kind==='lord'?'漢末·'+o.issuer:'東漢')+'：'+o.title).join('；');}
const timelineX=y=>TL_PAD+(y-TL_START)*timelineState.scale;
const timelineWidth=()=>TL_PAD*2+TL_SPAN*timelineState.scale;
const nameWidth=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--name-width'))||236;
const rowHeight=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--row-height'))||58;
const factionInfo=id=>HISTORY.factions[id]||HISTORY.factions.unknown;
const sourceLink=id=>{const s=HISTORY.sources[id];return s?`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`:'來源待考';};
const precisionText={exact:'史料可繫年',inferred:'據史料推定',unknown:'起訖不詳'};
function spanLabel(s){
  if(s.start==null&&s.end==null)return '年代未詳';
  if(s.point)return `${s.start}年有記載`;
  const a=s.openStart?'起年未詳（左界為示意）':`${s.start}年`;
  const b=s.openEnd?'迄年未詳（右界為示意）':`${s.end}年`;
  return `${a} — ${b}`;
}
function chronologyLabel(h){
  if(!h.first)return '首次活動年代待考';
  if(h.first.before)return `${h.first.year}年以前已有記載`;
  if(h.first.to)return `${h.first.year}—${h.first.to}年（推定）`;
  return `${h.first.year}年${h.first.precision==='inferred'?'（推定）':''}始見`;
}
function lifeLabel(p){
  const h=historyOf(p);
  if(h.life)return h.life;
  return '生卒待考';
}
function updateTimelineRows(){
  hideTimelineTooltip();
  const q=normalizeSearch(timelineState.query);
  timelineState.rows=DATA.per.filter(p=>{
    const h=historyOf(p);
    if(h.outside)return false;
    const factions=affiliationsOf(h).map(affiliationLabel);
    if(q&&!normalizeSearch(p.n+' '+(p.z||'')+' '+factions.join(' ')).includes(q))return false;
    if(timelineState.faction!=='all'&&(h.secondReview?.conclusions?.primaryFaction
      ?h.secondReview.conclusions.primaryFaction.faction!==timelineState.faction
      :!affiliationsOf(h).some(s=>s.faction===timelineState.faction)))return false;
    if(timelineState.evidence==='dated'&&!h.segments.length)return false;
    if(timelineState.evidence==='unknown'&&h.first)return false;
    if(timelineState.evidence==='lifespan'&&!(h.birth&&h.death))return false;
    return true;
  }).sort((a,b)=>{
    const ah=historyOf(a).first,bh=historyOf(b).first;
    const ay=ah?.year??Infinity,by=bh?.year??Infinity;
    return ay-by||(ah?.to??ay)-(bh?.to??by)||a.id.localeCompare(b.id);
  });
  tlRows.style.height=Math.max(1,timelineState.rows.length)*rowHeight()+'px';
  const dated=timelineState.rows.filter(p=>historyOf(p).segments.length).length;
  $('#timelineCount').textContent=DATA.per.filter(p=>!historyOf(p).outside).length;
  $('#timelineStatus').textContent=`顯示 ${timelineState.rows.length} 人 · ${dated} 人有可定位記載 · 按已核史料繫年排序`;
  clearMountedRows();
}
function clearMountedRows(){timelineState.mounted.clear();tlRows.replaceChildren();}
function createTimelineRow(p,index){
  const h=historyOf(p),row=document.createElement('div');row.className='timeline-row';row.dataset.id=p.id;row.setAttribute('role','listitem');
  const life=lifeLabel(p);
  const name=document.createElement('button');name.type='button';name.className='person-name';name.title=life;name.setAttribute('aria-label',`${p.n}，${life}，查看人物`);
  name.innerHTML=`<span class="person-number">${String(index+1).padStart(3,'0')}</span>${(()=>{const f=portraitFile(p);return f?`<span class="person-avatar"><img src="${esc(f)}" alt="" loading="lazy" decoding="async"></span>`:'';})()}<span class="person-label"><div><b>${esc(p.n)}</b><span class="courtesy">${esc(p.z||'')}</span></div><small>${esc(life)}</small></span>`;
  name.onclick=()=>openPerson(p);row.append(name);
  const track=document.createElement('div');track.className='row-track';track.style.width=timelineWidth()+'px';
  const step=timelineState.scale<14?5:timelineState.scale<36?2:1;
  track.style.setProperty('--year-step',timelineState.scale*step+'px');
  h.segments.forEach((s,si)=>{
    const start=Math.max(TL_START,s.start),end=Math.min(TL_END+1,s.end+(s.endInclusive?1:0));
    if(end<start||s.start>TL_END||s.end<TL_START)return;
    const f=factionInfo(s.faction),button=document.createElement('button');button.type='button';button.className='tenure '+(s.precision||'inferred')+(s.openStart?' open-start':'')+(s.openEnd?' open-end':'')+(s.point?' point':'');
    const width=Math.max(s.point?8:3,(end-start)*timelineState.scale-2);
    button.style.cssText=`left:${timelineX(start)}px;width:${width}px;--faction:${f.color};--faction-bg:${f.background};`;
    const label=s.label||f.label;
    if(width>42)button.innerHTML=`${s.start<TL_START||s.openStart?'<span class="edge">‹</span>':''}${esc(label)}`;
    button.setAttribute('aria-label',`${p.n}：${label}，${spanLabel(s)}，${precisionText[s.precision]||precisionText.inferred}`);
    button.onclick=()=>openTenure(p,si);
    button.addEventListener('mouseenter',e=>showTimelineTooltip(e,p,s));
    button.addEventListener('mousemove',positionTimelineTooltip);
    button.addEventListener('mouseleave',hideTimelineTooltip);
    button.addEventListener('focus',()=>hideTimelineTooltip());
    track.append(button);
    if(width<70&&!s.point){
      const next=h.segments[si+1],room=next?timelineX(Math.max(184,next.start))-timelineX(end):timelineWidth()-timelineX(end);
      if(room>95){const labelNode=document.createElement('span');labelNode.className='tenure-outside-label';labelNode.style.left=timelineX(end)+6+'px';labelNode.style.color=f.color;labelNode.textContent=label+(s.end===h.death?' · '+s.end+'年卒':'');track.append(labelNode);}
    }
  });
  if(!h.segments.length){
    const note=document.createElement('div');note.className='unplaced-note';
    const labels=[...new Set(affiliationsOf(h).map(affiliationLabel))];
    note.append(document.createTextNode(labels.length?labels.join(' → ')+' · 起訖未詳':(h.reading?'已定位史料 · 活動與統屬待整理':'尚待定位史料 · 活動與統屬待考')));
    const read=document.createElement('button');read.type='button';read.textContent='查看記載';read.onclick=()=>openPerson(p);note.append(read);track.append(note);
  }
  else if(h.unplaced?.length){
    const firstX=Math.min(...h.segments.map(s=>timelineX(Math.max(184,s.start))));
    if(firstX>200){const prior=document.createElement('button');prior.type='button';prior.className='undated-affiliation';prior.style.maxWidth=Math.max(150,firstX-45)+'px';prior.textContent=h.unplaced.map(s=>s.label||factionInfo(s.faction).label).join('／')+' · 早期任職起訖待考';prior.onclick=()=>openPerson(p);track.append(prior);}
  }
  row.append(track);return row;
}
function mountVisibleRows(force=false){
  timelineState.raf=0;if(curView!=='tl')return;
  const rh=rowHeight(),head=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ruler-height'));
  const first=Math.max(0,Math.floor((tlViewport.scrollTop-head)/rh)-5);
  const last=Math.min(timelineState.rows.length,Math.ceil((tlViewport.scrollTop+tlViewport.clientHeight)/rh)+5);
  if(force)clearMountedRows();
  for(const [i,node] of timelineState.mounted){if(i<first||i>=last){node.remove();timelineState.mounted.delete(i);}}
  if(!timelineState.rows.length){if(!tlRows.querySelector('.timeline-empty'))tlRows.innerHTML='<div class="timeline-empty">沒有符合條件的人物。請調整姓名、勢力或記載篩選。</div>';return;}
  for(let i=first;i<last;i++){
    let row=timelineState.mounted.get(i);
    if(!row){row=createTimelineRow(timelineState.rows[i],i);timelineState.mounted.set(i,row);tlRows.append(row);}
    row.style.top=i*rh+'px';row.classList.toggle('is-highlighted',row.dataset.id===timelineState.highlight);
  }
}
function scheduleTimelinePaint(){hideTimelineTooltip();if(!timelineState.raf)timelineState.raf=requestAnimationFrame(()=>mountVisibleRows());}
function renderTimelineRuler(){
  const width=timelineWidth(),scale=timelineState.scale;
  $('#timelineSurface').style.width=nameWidth()+width+'px';$('#timelineRuler').style.width=width+'px';
  $('#zoomValue').textContent=Math.round(scale/20*100)+'%';$('#zoomIn').disabled=scale>=120;$('#zoomOut').disabled=scale<=6;
  const tickStep=[1,2,5,10,20].find(step=>step*scale>=120)||20;
  const years=new Set([184,280]);for(let y=Math.ceil(184/tickStep)*tickStep;y<280;y+=tickStep)years.add(y);
  $('#yearTicks').innerHTML=[...years].sort((a,b)=>a-b).filter(y=>y===184||y===280||((y-184)*scale>150&&(280-y)*scale>150)).map(y=>`<span class="year-tick${y===184?' tick-first':y===280?' tick-last':''}" style="left:${timelineX(y)}px" title="${esc(eraYearDescription(y))}">${eraYearLabel(y)}</span>`).join('');
  const eras=[{a:184,b:190,n:'漢末 · 黃巾起義'},{a:190,b:220,n:'群雄並起'},{a:220,b:265,n:'三國鼎立'},{a:265,b:281,n:'晉興 · 至滅吳統一'}];
  $('#eraBand').innerHTML=eras.map(e=>`<div class="era-period" style="left:${timelineX(e.a)}px;width:${(e.b-e.a)*scale}px" title="${e.n}">${e.n}</div>`).join('');
  const bucketYears=scale<10?6:scale<18?3:1,groups=new Map();
  DATA.ev.filter(e=>e.y>=184&&e.y<=280).forEach(e=>{const key=184+Math.floor((e.y-184)/bucketYears)*bucketYears;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);});
  const lanes=[-Infinity,-Infinity,-Infinity],placed=[];
  for(const [year,events] of [...groups].sort((a,b)=>a[0]-b[0])){
    let w=Math.min(145,Math.max(86,events.length>1?105:events[0].n.length*11+32));
    const x=Math.min(timelineX(year),width-w-4);
    let lane=lanes.findIndex(end=>end+5<=x);
    if(lane<0){const last=placed.at(-1);last.events.push(...events);continue;}
    lanes[lane]=x+w;placed.push({x,w,lane,events:[...events]});
  }
  const track=$('#eventTrack');track.replaceChildren();
  for(const g of placed){
    const a=Math.min(...g.events.map(e=>e.y)),b=Math.max(...g.events.map(e=>e.y));
    const button=document.createElement('button');button.className='event-cluster';button.type='button';
    button.style.cssText=`left:${g.x}px;top:${g.lane*27}px;width:${g.w}px;--event-color:${EVCH[g.events[0].t]};`;
    button.innerHTML=`<span class="event-year">${a===b?a:a+'–'+b}</span><b>${g.events.length===1?esc(g.events[0].n):g.events.length+' 件大事'}</b>`;
    button.title=g.events.map(e=>e.y+' '+e.n).join('\n');button.setAttribute('aria-label',button.title);
    button.onclick=()=>g.events.length===1?openEvent(g.events[0]):openEventCluster(g.events);track.append(button);
  }
}
function renderTL(){
  if(!timelineState.ready){
    const used=new Set(Object.values(HISTORY.people).flatMap(h=>affiliationsOf(h).map(s=>s.faction)));
    const groups={court:'朝廷',regime:'政權',lord:'地方勢力與所領部眾',army:'軍隊集團',status:'其它狀態'};
    for(const [kind,label] of Object.entries(groups)){const group=document.createElement('optgroup');group.label=label;for(const [id,f] of Object.entries(HISTORY.factions)){if(used.has(id)&&(f.kind||'lord')===kind){const o=document.createElement('option');o.value=id;o.textContent=f.label;group.append(o);}}if(group.children.length)$('#factionFilter').append(group);}
    timelineState.ready=true;
  }
  updateTimelineRows();renderTimelineRuler();mountVisibleRows(true);
}
function zoomTimeline(next){
  const center=tlViewport.scrollLeft+Math.max(1,tlViewport.clientWidth-nameWidth())/2;
  const year=TL_START+(center-TL_PAD)/timelineState.scale;
  timelineState.scale=Math.max(6,Math.min(120,next));
  renderTimelineRuler();clearMountedRows();
  tlViewport.scrollLeft=timelineX(year)-Math.max(1,tlViewport.clientWidth-nameWidth())/2;
  mountVisibleRows();if(timelineState.playing)paintYearCursor(timelineState.year,false);
}
function paintYearCursor(year,scroll=true){
  const cursor=$('#timelineCursor');cursor.style.display='block';cursor.style.left=nameWidth()+timelineX(year)+'px';cursor.querySelector('span').textContent=year;
  if(scroll)tlViewport.scrollTo({left:Math.max(0,timelineX(year)-(tlViewport.clientWidth-nameWidth())/2),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function showYearEvents(y){
  const events=DATA.ev.filter(e=>e.y===y);$('#playBox').style.display='block';$('#playTitle').textContent=y+' 年記事';
  const list=$('#playList');list.replaceChildren();
  if(!events.length){list.textContent='本資料集此年未收錄事件。';return;}
  events.forEach(ev=>{const item=document.createElement('div');item.className='play-event';item.setAttribute('role','button');item.tabIndex=0;item.textContent=EVI[ev.t]+' '+ev.n;item.onclick=()=>openEvent(ev);item.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEvent(ev);}};list.append(item);});
}
function gotoYear(y){
  y=Number(y);if(!Number.isInteger(y)||y<184||y>280){$('#goYear').setCustomValidity('請輸入 184 至 280 年');$('#goYear').reportValidity();return;}
  $('#goYear').setCustomValidity('');if(curView!=='tl')document.querySelector('.tab[data-v="tl"]').click();
  clearTimeout(timelineState.cursorTimer);stopPlay(false);paintYearCursor(y);showYearEvents(y);
}
function stopPlay(hide=true){timelineState.playing=false;clearInterval(timelineState.timer);timelineState.timer=null;$('#playBtn').textContent='▶ 巡覽';if(hide)$('#timelineCursor').style.display='none';}
function togglePlay(){
  if(timelineState.playing){stopPlay(false);return;}
  timelineState.playing=true;timelineState.year=184;$('#playBtn').textContent='Ⅱ 暫停';
  const tick=()=>{const y=timelineState.year;paintYearCursor(y);showYearEvents(y);if(y===280){stopPlay(false);return;}timelineState.year++;};
  tick();timelineState.timer=setInterval(tick,650);
}
function gotoPerson(p){
  if(curView!=='tl')document.querySelector('.tab[data-v="tl"]').click();
  $('#personFilter').value='';$('#factionFilter').value='all';$('#evidenceFilter').value='all';
  Object.assign(timelineState,{query:'',faction:'all',evidence:'all',highlight:p.id});renderTL();
  const i=timelineState.rows.findIndex(x=>x.id===p.id);
  if(i>=0){tlViewport.scrollTop=i*rowHeight();const s=historyOf(p).segments[0];if(s)tlViewport.scrollLeft=Math.max(0,timelineX(Math.max(184,s.start))-60);mountVisibleRows();}
  openPerson(p);
}
function showTimelineTooltip(e,p,s){const tip=$('#timelineTooltip'),f=factionInfo(s.faction);tip.innerHTML=`<b>${esc(p.n)} · ${esc(s.label||f.label)}</b>${esc(spanLabel(s))}<small>${precisionText[s.precision]||precisionText.inferred}${s.note?' · '+esc(s.note):''}</small><small>點選查閱史料依據</small>`;tip.hidden=false;positionTimelineTooltip(e);}
function positionTimelineTooltip(e){const tip=$('#timelineTooltip');tip.style.left=Math.max(8,Math.min(e.clientX+14,window.innerWidth-tip.offsetWidth-12))+'px';tip.style.top=Math.max(8,Math.min(e.clientY+16,window.innerHeight-tip.offsetHeight-12))+'px';}
function hideTimelineTooltip(){$('#timelineTooltip').hidden=true;}
tlViewport.addEventListener('scroll',scheduleTimelinePaint,{passive:true});
$('#zoomIn').onclick=()=>zoomTimeline(timelineState.scale*1.5);$('#zoomOut').onclick=()=>zoomTimeline(timelineState.scale/1.5);$('#zoomFit').onclick=()=>{zoomTimeline((tlViewport.clientWidth-nameWidth()-TL_PAD*2-12)/TL_SPAN);tlViewport.scrollLeft=0;};
$('#personFilter').addEventListener('input',e=>{timelineState.query=e.target.value;tlViewport.scrollTop=0;updateTimelineRows();mountVisibleRows();});
$('#factionFilter').onchange=e=>{timelineState.faction=e.target.value;tlViewport.scrollTop=0;updateTimelineRows();mountVisibleRows();};
$('#evidenceFilter').onchange=e=>{timelineState.evidence=e.target.value;tlViewport.scrollTop=0;updateTimelineRows();mountVisibleRows();};
$('#goBtn').onclick=()=>gotoYear($('#goYear').value);$('#goYear').oninput=()=>$('#goYear').setCustomValidity('');$('#goYear').onkeydown=e=>{if(e.key==='Enter')gotoYear(e.target.value);};
$('#playBtn').onclick=togglePlay;$('#closePlay').onclick=()=>{stopPlay();$('#playBox').style.display='none';};
$('#timelineHelp').onclick=()=>document.querySelector('.tab[data-v="about"]').click();
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{hideTimelineTooltip();if(t.dataset.v!=='tl')stopPlay();}));
let timelineResizeFrame=0;new ResizeObserver(()=>{cancelAnimationFrame(timelineResizeFrame);timelineResizeFrame=requestAnimationFrame(()=>{if(curView==='tl'){renderTimelineRuler();tlRows.style.height=timelineState.rows.length*rowHeight()+'px';mountVisibleRows(true);}});}).observe(tlViewport);
