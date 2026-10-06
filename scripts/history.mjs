import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
import {indexChronicles} from './chronicle-index.mjs';
import {loadAppraisals,appraisalsFor} from './appraisals.mjs';
import {applyAffiliations} from './affiliations.mjs';
import {applySecondReviews} from './second-review.mjs';
const convertTraditional=OpenCC.Converter({from:'cn',to:'t'});
export const traditional=s=>convertTraditional(s).replace(/於(禁|糜|夫羅|氐根|毒)/g,'于$1').replaceAll('穀道','谷道');
const simplified=OpenCC.Converter({from:'t',to:'cn'});
export const normalize=s=>simplified(s||'').replace(/[\s\p{P}\p{S}]/gu,'').replaceAll('悳','德').replaceAll('兾','冀').replaceAll('衞','卫').replaceAll('旣','既').replaceAll('荅','答').replaceAll('畒','亩');
const aliases={'曹操':'太祖武皇帝','劉備':'先主姓劉','曹丕':'文皇帝諱丕','曹叡':'明皇帝諱叡','曹芳':'齊王諱芳','曹髦':'高貴鄉公諱髦','劉禪':'後主諱禪','司馬炎':'武皇帝諱炎','司馬懿':'宣皇帝諱懿','司馬師':'景皇帝諱師','司馬昭':'文皇帝諱昭','龐德':'龐悳字','韋昭':'韋曜字'};
const nums={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
function number(s){if(s==='十')return 10;if(s.includes('十')){const [a,b]=s.split('十');return (nums[a]||1)*10+(nums[b]||0);}return nums[s];}
function sourceFromLabel(label){const m=label.match(/([魏蜀吳])書([一二三四五六七八九十]+)/);if(!m)return null;return 'a04-'+String(number(m[2])+({魏:0,蜀:30,吳:45}[m[1]])).padStart(3,'0');}
function excerpt(text,query,max=680){
  // Find the exact span in the original after variant normalization, preserving original characters in the excerpt.
  const q=normalize(query);let index=0;
  if(q){const n=normalize(text),at=n.indexOf(q);if(at>=0){let seen=0;for(let i=0;i<text.length;i++){seen+=normalize(text[i]).length;if(seen>=at){index=i;break;}}}}
  let start=Math.max(0,index-100);if(start>0){const stop=text.lastIndexOf('。',index);if(stop>=start)start=stop+1;}
  return (start?'……':'')+text.slice(start,start+max)+(start+max<text.length?'……':'');
}
export function makeHistory(original){
  const docs=fs.readdirSync('data/sources').filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync('data/sources/'+x,'utf8')));
  const sources=Object.fromEntries(docs.map(d=>[d.id,{title:d.title,url:d.url}]));
  const docMap=Object.fromEntries(docs.map(d=>[d.id,d]));
  const appraisalCatalog=loadAppraisals(docs,normalize,traditional);
  const indexed=docs.flatMap(d=>d.paragraphs.map((text,index)=>({text,index,d,norm:normalize(text)})));
  const whole=Object.fromEntries(docs.map(d=>[d.id,indexed.filter(x=>x.d.id===d.id).map(x=>x.norm).join('')]));
  const curation=JSON.parse(fs.readFileSync('data/curation.json','utf8'));
  curation.people.push(...JSON.parse(fs.readFileSync('data/curation-extra.json','utf8')));
  curation.people.push(...JSON.parse(fs.readFileSync('data/curation-research.json','utf8')));
  const people={},audit={missingAnchors:[],unmatched:[],withReading:0,withTimeline:0,removed:['貂蝉（虚构说明条目）']};
  const data=JSON.parse(traditional(JSON.stringify(original)));
  data.per=data.per.filter(p=>p.n!=='貂蟬');
  data.per.push({n:'司馬炎',z:'安世',b:236,d:290,f:'其他',p:'河內溫縣',s:'《晉書·卷三·武帝紀》',g:'',e:'',m:'',c:'',v:''});
  const table=new Map(curation.people.map(x=>[normalize(x.name),x]));
  function getProof(source,query){
    const d=docMap[source];if(!d)return null;
    const q=normalize(query);const p=indexed.find(p=>p.d.id===source&&p.text.length>=12&&p.norm.includes(q));
    return p?{source,quote:excerpt(p.text,query)}:null;
  }
  data.per.forEach((p,i)=>{
    p.id='p'+String(i+1).padStart(4,'0');
    const c=table.get(normalize(p.n)),preferred=c?.source||sourceFromLabel(p.s);
    const name=normalize(p.n),alias=normalize(aliases[p.n]);
    const surname=p.n.match(/^(司馬|諸葛|夏侯|公孫|濮陽|太史|淳于|毌丘|鍾離)/)?.[0]||p.n[0];
    const shortAnchor=normalize(p.n.slice(surname.length)+'字'+(p.z||''));
    const shortMatches=preferred?indexed.filter(x=>x.d.id===preferred&&x.text.length>60&&shortAnchor.length>2&&x.norm.includes(shortAnchor)):[];
    const shortMatch=shortMatches.length===1?shortMatches[0]:null;
    const candidates=indexed.filter(x=>x.norm.includes(name));
    let match=candidates.find(x=>x.text.length>60&&x.d.id===preferred&&(x.norm.startsWith(name+'字')||x.norm.startsWith(name))); 
    if(!match&&alias)match=indexed.find(x=>x.norm.startsWith(alias));
    if(!match&&shortMatch)match=shortMatch;
    match ||= candidates.find(x=>x.text.length>60&&x.norm.startsWith(name+'字'));
    match ||= candidates.find(x=>x.d.id===preferred&&x.text.length>50);
    match ||= candidates.find(x=>x.d.id.startsWith('a04')&&x.text.length>50);
    match ||= candidates.find(x=>x.text.length>50);
    const readingAnchor=match===shortMatch?p.n.slice(surname.length)+'字'+(p.z||''):p.n;
    const h={first:null,segments:[],unplaced:[],reading:match?{source:match.d.id,quote:excerpt(match.text,readingAnchor),kind:match.norm.startsWith(name+'字')||(alias&&match.norm.startsWith(alias))||match===shortMatch?'biography':'mention'}:null};
    if(h.reading)audit.withReading++;else audit.unmatched.push(p.n);
    // Do not carry unverified paraphrases or quotations into the public detail panel.
    const full=(whole[preferred]||'')+(whole[match?.d.id]||'');
    p.g='';p.e='';for(const field of ['m','c','v']){if(!p[field]||!full.includes(normalize(p[field])))p[field]='';}
    if(c){
      h.first=c.first;h.firstNote=c.firstNote||'';h.birth=c.birth||null;h.death=c.death||null;h.life=c.life||'生卒待考';h.outside=!!c.outside;
      if(Object.hasOwn(c,'origin'))p.p=c.origin||'';
      h.overview=c.overview||'';h.facts=[];
      if(c.readingQuery){const proof=getProof(c.source,c.readingQuery);if(proof)h.reading={...proof,kind:'curated'};}
      for(const fact of c.facts||[]){
        const proof=getProof(fact.source||c.source,fact.query);
        if(!proof){audit.missingAnchors.push({name:p.n,source:fact.source||c.source,query:fact.query});continue;}
        h.facts.push({...fact,...proof});delete h.facts.at(-1).query;
      }
      for(const [mode,stages] of [['segments',c.stages||[]],['unplaced',c.unplaced||[]]]){
        for(const stage of stages){
          const proof=getProof(stage.source||c.source,stage.query);
          if(!proof){audit.missingAnchors.push({name:p.n,source:stage.source||c.source,query:stage.query});continue;}
          h[mode].push({...stage,precision:stage.precision||'inferred',...proof});delete h[mode].at(-1).query;
        }
      }
      if(h.segments.length)audit.withTimeline++;
    }
    // Individuals who died before the requested period remain searchable, but are not drawn as living in 184.
    if(['陳蕃','竇武','郭泰'].includes(p.n)){h.outside=true;h.life='卒於184年以前';}
    h.appraisals=appraisalsFor(appraisalCatalog,p,preferred||h.reading?.source,normalize);
    people[p.id]=h;
  });
  const indexedMentions=indexChronicles(docs,data.per,normalize);
  for(const p of data.per){
    const h=people[p.id],mentions=indexedMentions[p.id]||[];h.mentions=mentions.slice(0,12);
    if(!h.first&&mentions.length){const m=mentions[0];h.first={year:m.year,precision:'exact',note:'目前已核本紀中的最早繫年；不等於此前無活動。'};}
    if(!h.segments.length&&mentions.length){
      h.segments=mentions.filter((m,i,all)=>i===0||m.year!==all[i-1].year).slice(0,12).map(m=>({start:m.year,end:m.year,point:true,faction:'unknown',label:'此年有記載 · 統屬待核',precision:'unknown',quote:m.quote,source:m.source,note:m.note}));
      audit.withTimeline++;
    }
  }
  const chars={};for(const ch of new Set(traditional(JSON.stringify(original)))){const s=simplified(ch);if(ch!==s)chars[ch]=s;}
  applyAffiliations(data,people,docMap,normalize,excerpt,audit);
  applySecondReviews(data,people,docMap,normalize,audit);
  audit.withReading=Object.values(people).filter(h=>h.reading).length;
  audit.unmatched=data.per.filter(p=>!people[p.id].reading).map(p=>p.n);
  const representedNames=new Set(data.per.map(p=>normalize(p.n)));
  audit.appraisals={...appraisalCatalog.stats,peopleWithAppraisals:Object.values(people).filter(p=>p.appraisals.length).length,
    noDirectAppraisal:data.per.filter(p=>!people[p.id].appraisals.length).map(p=>p.n),
    unlistedSourceSubjects:[...appraisalCatalog.targets].filter(name=>!representedNames.has(normalize(name)))};
  const history={schemaVersion:1,range:curation.range,factions:JSON.parse(fs.readFileSync('data/factions.json','utf8')),sources,people,appraisalChapters:appraisalCatalog.chapters};
  return {data,history,chars,audit};
}
