import fs from 'node:fs';

// The reviewed records are evidence for membership, independently of whether
// a complete, dated tenure can be reconstructed.
export function applyAffiliations(data,people,docMap,normalize,excerpt,audit){
 const review=JSON.parse(fs.readFileSync('data/affiliation-review.json','utf8'));
 const metadata=JSON.parse(fs.readFileSync('data/affiliation-metadata.json','utf8'));
 const canonical={dongzhuo:'dong',lijue:'licui',liuyao:'liuyou'};
 const byId=new Map(data.per.map(p=>[p.id,p]));
 for(const p of data.per){
  const h=people[p.id];
  h.affiliations=[...h.segments,...h.unplaced].filter(s=>s.faction!=='unknown').map(s=>({...s,relation:'service'}));
 }
 const seen=new Set();
 for(const row of review){
  const p=byId.get(row.id),h=people[row.id];
  if(!p||normalize(p.n)!==normalize(row.name)||seen.has(row.id))throw Error('Invalid reviewed identity: '+row.id);
  seen.add(row.id);h.affiliationReviewed=true;h.reviewNote=row.note;
  h.affiliations=row.affiliations.map(a=>{
   const text=docMap[a.source]?.paragraphs[a.paragraph];
   if(!text||!normalize(text).includes(normalize(a.query))||!text.includes(a.quote))throw Error('Invalid affiliation anchor: '+p.n+' '+a.faction);
   return {...a,faction:canonical[a.faction]||a.faction,relation:metadata.relations[p.n]?.[a.faction]||'service',quote:excerpt(text,a.query,1500)};
  });
  const reading=h.affiliations[0];
  if(reading)h.reading={source:reading.source,quote:reading.quote,kind:'reviewed'};
 }
 for(const p of data.per){
  const h=people[p.id];h.hanOffices=[];
  if(!h.reading&&h.affiliations[0])h.reading={source:h.affiliations[0].source,quote:h.affiliations[0].quote,kind:'curated'};
  for(const a of metadata.hanOffices[p.n]||[]){
   const d=docMap[a.source],matches=d?.paragraphs.filter(t=>normalize(t).includes(normalize(a.query)))||[];
   if(matches.length!==1)throw Error('Ambiguous Han office anchor: '+p.n+' '+a.query);
   h.hanOffices.push({...a,quote:excerpt(matches[0],a.query,1500)});
  }
 }
 audit.affiliations={reviewed:seen.size,peopleWithAffiliations:Object.values(people).filter(h=>h.affiliations.length).length,
  withHanOffices:Object.values(people).filter(h=>h.hanOffices.length).length};
}
