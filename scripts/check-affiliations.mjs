import fs from 'node:fs';
import assert from 'node:assert/strict';
export function checkAffiliations(data,history,normalize){
 const reviewed=JSON.parse(fs.readFileSync('data/affiliation-review.json','utf8'));
 const byName=n=>{const p=data.per.find(p=>normalize(p.n)===normalize(n));assert(p,'Missing '+n);return history.people[p.id];};
 assert.equal(reviewed.length,379,'Incomplete manual review');
 for(const p of data.per){
  const h=history.people[p.id];assert(h.affiliations?.length,p.n+' missing actual affiliations');
  for(const a of h.affiliations){assert(history.factions[a.faction],p.n+' invalid faction');assert(history.sources[a.source]&&a.quote?.length>4,p.n+' missing affiliation evidence');}
  for(const o of h.hanOffices){assert(history.sources[o.source]&&o.quote?.length>4,p.n+' missing Han office evidence');assert(o.issuer&&o.title,p.n+' office lacks issuer');}
 }
 for(const row of reviewed)assert(history.people[row.id].affiliationReviewed,row.name+' review not integrated');
 for(const [name,groups] of [['曹洪',['caocao','wei']],['趙雲',['gongsun','liubei','shu']],['公孫瓚',['gongsun']],['李傕',['dong','licui']],['郭汜',['dong','guosi']],['張濟',['dong','zhangji']],['陳宮',['caocao','lvbu']]]){
  const h=byName(name);for(const faction of groups)assert(h.affiliations.some(a=>a.faction===faction),name+' lost '+faction);
 }
 assert(byName('漢獻帝').segments.some(s=>s.faction==='han'&&s.start===189&&s.end===220),'Han court ended too early');
 assert(byName('關羽').hanOffices.some(o=>o.title==='漢壽亭侯'&&o.kind==='court'));
 assert(byName('馬超').hanOffices.some(o=>o.title.startsWith('左將軍')&&o.kind==='lord'));
 assert(!byName('馬超').hanOffices.some(o=>o.title.startsWith('前將軍')),'Incorrect Ma Chao title');
 assert(byName('張苞').affiliations.every(a=>a.relation==='family'),'Zhang Bao treated as military officer');
 assert(byName('華佗').affiliations.some(a=>a.faction==='caocao'&&a.relation==='doctor'));
 assert(byName('盧植').affiliations.some(a=>a.faction==='yuanshao'&&a.relation==='invited'));
 assert(byName('卑彌呼').affiliations.every(a=>a.faction==='wa'),'Diplomatic title replaced actual polity');
 assert(!byName('曹洪').segments.some(s=>s.start===243),'Posthumous commemoration shown as activity');
 for(const name of ['黃龍','大計','司隸','白雀'])assert.equal(byName(name).reading.source,'a03-071',name+' reading uses a common-word match');
 return {reviewed:reviewed.length,withActualAffiliations:data.per.length,withHanOffices:data.per.filter(p=>byName(p.n).hanOffices.length).length};
}
