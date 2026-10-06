import fs from 'node:fs';
import assert from 'node:assert/strict';

const WORK_PREFIX={sanguozhi:'a04-',peizhu:'a04-',houhanshu:'a03-',huayang:'a06-',jinshu:'a05-'};
const WORKS=Object.keys(WORK_PREFIX);

function resolveExcerpt(item,docMap){
 const doc=docMap[item.source],paragraph=doc?.paragraphs[item.paragraph];
 assert(paragraph,`Missing second-review paragraph: ${item.id}`);
 assert(item.source.startsWith(WORK_PREFIX[item.work]||'!'),`Wrong work for ${item.id}`);
 assert(item.citation&&!/https?:\/\//.test(item.citation),`Missing plain-text citation: ${item.id}`);
 if(item.context)assert(paragraph.includes(item.context),`Missing date context: ${item.id}`);
 const start=paragraph.indexOf(item.from);
 assert(start>=0&&paragraph.indexOf(item.from,start+1)<0,`Ambiguous start marker: ${item.id}`);
 const end=paragraph.indexOf(item.through,start);
 assert(end>=start,`Missing end marker: ${item.id}`);
 const quote=paragraph.slice(start,end+item.through.length);
 assert(quote.length>=4,`Short second-review excerpt: ${item.id}`);
 return {id:item.id,work:item.work,source:item.source,paragraph:item.paragraph,citation:item.citation,quote};
}

export function applySecondReviews(data,people,docMap,normalize,audit){
 const review=JSON.parse(fs.readFileSync('data/person-second-review.json','utf8'));
 assert.equal(review.schemaVersion,1);
 const byId=new Map(data.per.map(p=>[p.id,p]));
 const seen=new Set();let complete=0,pilot=0;
 for(const item of review.verifiedLegacyPei||[]){
  const p=byId.get(item.personId);
  assert(p&&normalize(p.n)===normalize(item.name),`Wrong legacy Pei identity: ${item.id}`);
  const excerpt=resolveExcerpt(item,docMap);
  (people[p.id].verifiedPeiExcerpts??=[]).push(excerpt);
 }
 for(const row of review.people){
  const p=byId.get(row.id),h=people[row.id];
  assert(p&&normalize(p.n)===normalize(row.name)&&!seen.has(row.id),`Wrong or duplicate second-review identity: ${row.id}`);
  seen.add(row.id);
  assert(['pilot','complete'].includes(row.status),`Invalid second-review status: ${row.id}`);
  for(const work of WORKS)assert(['checked','in-progress','corpus-missing','corpus-incomplete','not-applicable'].includes(row.coverage?.[work]),`Missing source coverage: ${p.n} ${work}`);
  if(row.status==='complete'){
   assert(WORKS.every(work=>['checked','not-applicable'].includes(row.coverage[work])),`Incomplete source corpus: ${p.n}`);
   complete++;
  }else pilot++;
  const ids=new Set(),excerpts=row.excerpts.map(item=>{
   assert(item.id&&!ids.has(item.id),`Duplicate excerpt: ${item.id}`);ids.add(item.id);
   return {...resolveExcerpt(item,docMap),display:item.display!==false};
  });
  const assertEvidence=claim=>{for(const id of claim.evidence||[])assert(ids.has(id),`Unresolved evidence ${p.n}: ${id}`);};
  for(const kind of ['birth','death']){
   const claim=row.conclusions[kind];
   if(!claim)continue;
   assertEvidence(claim);
   assert(WORKS.includes(claim.preferredSource),`Missing preferred ${kind} source: ${p.n}`);
   assert(claim.evidence?.some(id=>excerpts.find(x=>x.id===id)?.work===claim.preferredSource),`Preferred ${kind} source has no excerpt: ${p.n}`);
   if(kind==='birth'&&claim.year!=null)assert.equal(h.birth,claim.year,`Birth review not applied: ${p.n}`);
   for(const variant of claim.variants||[]){
    assert(variant.value&&variant.note,`Undescribed ${kind} variant: ${p.n}`);
    assertEvidence(variant);
   }
  }
  assertEvidence(row.conclusions.primaryFaction||{});
  for(const relation of row.conclusions.relationships||[])assertEvidence(relation);
  if(row.conclusions.death?.year!=null)assert.equal(h.death,row.conclusions.death.year,`Death review not applied: ${p.n}`);
  const primary=row.conclusions.primaryFaction;
  if(primary){
   assert(h.segments.some(s=>s.faction===primary.faction&&s.start===primary.earliestAttested&&s.end===primary.lastAttested&&!s.point),`Primary timeline not applied: ${p.n}`);
   const affiliation=h.affiliations.find(a=>a.faction===primary.faction);
   assert(affiliation,`Primary affiliation missing: ${p.n}`);
   Object.assign(affiliation,{relation:'leader',start:primary.earliestAttested,end:primary.lastAttested,openStart:!!primary.startUnknown,precision:'inferred',note:primary.note});
   for(const [otherId,other] of Object.entries(people))if(otherId!==p.id){
    for(const segment of other.segments.filter(s=>s.faction===primary.faction&&!s.point)){
     assert(primary.earliestAttested<=segment.start&&primary.lastAttested>=segment.end,`Leader range does not cover follower: ${p.n} / ${otherId}`);
    }
   }
  }
  for(const relation of row.conclusions.relationships||[]){
   const affiliation=h.affiliations.find(a=>a.faction===relation.faction&&a.relation===relation.relation);
   assert(affiliation,`Relationship not applied: ${p.n} ${relation.faction}`);
   const years=relation.attestedYears||[];
   if(years.length)Object.assign(affiliation,{start:Math.min(...years),end:Math.max(...years),point:years.length===1,precision:years.length===1?'exact':'inferred',note:relation.note});
  }
  for(const office of row.conclusions.offices||[]){
   assertEvidence(office);
   if(office.appliedTitle)assert(h.hanOffices.some(item=>item.title===office.appliedTitle),`Reviewed office not surfaced: ${p.n} ${office.appliedTitle}`);
  }
  h.sourceExcerpts=excerpts.filter(x=>x.display);
  h.secondReview={status:row.status,reviewedOn:row.reviewedOn,coverage:row.coverage,conclusions:row.conclusions,evidence:Object.fromEntries(excerpts.map(x=>[x.id,x])),unresolved:row.unresolved||[]};
 }
 audit.secondReview={complete,pilot,unreviewed:data.per.length-seen.size,total:data.per.length};
}
