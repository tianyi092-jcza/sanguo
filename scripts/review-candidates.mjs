import fs from 'node:fs';
import {makeHistory,normalize} from './history.mjs';

const target=process.argv[2];
if(!target)throw Error('Usage: node scripts/review-candidates.mjs <person ID or name>');
const {data}=makeHistory(JSON.parse(fs.readFileSync('data/original.json','utf8')));
const person=data.per.find(p=>p.id===target||normalize(p.n)===normalize(target));
if(!person)throw Error('Unknown person: '+target);
const names=[person.n,person.z&&person.n[0]+'字'+person.z].filter(Boolean).map(normalize);
const byText=new Map();let sourceOccurrences=0;
for(const file of fs.readdirSync('data/sources').filter(f=>f.endsWith('.json'))){
 const doc=JSON.parse(fs.readFileSync('data/sources/'+file,'utf8'));
 for(const [paragraph,text] of doc.paragraphs.entries()){
  const n=normalize(text);
  if(!names.some(name=>n.includes(name)))continue;
  sourceOccurrences++;
  const key=n,record=byText.get(key)||{snippet:'',sources:[]};
  if(!record.snippet){const at=text.indexOf(person.n),start=at>=0?Math.max(0,at-60):0;record.snippet=text.slice(start,start+260);}
  record.sources.push({source:doc.id,title:doc.title,paragraph});byText.set(key,record);
 }
}
const matches=[...byText.values()].map(item=>({...item,sources:item.sources.sort((a,b)=>a.source.localeCompare(b.source))}));
const byWork={};for(const match of matches){const work=match.sources[0].source.slice(0,3);byWork[work]=(byWork[work]||0)+1;}
console.log(JSON.stringify({person:{id:person.id,name:person.n,courtesy:person.z||null},candidateMatches:matches.length,sourceOccurrences,duplicateEditionHits:sourceOccurrences-matches.length,byWork,shown:matches.slice(0,120),truncated:matches.length>120,note:'相同文本的不同電子版已合併顯示；字面命中僅為待核候選。同名、附傳省姓、他傳及裴注層級仍須逐條核對。'},null,2));
