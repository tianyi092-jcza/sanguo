import fs from 'node:fs';
import {normalize} from './history.mjs';
const pending=JSON.parse(fs.readFileSync('output/affiliation-review-pending.json','utf8'));
const docs=Object.fromEntries(fs.readdirSync('data/sources').filter(x=>x.endsWith('.json')).map(f=>{const d=JSON.parse(fs.readFileSync('data/sources/'+f,'utf8'));return [d.id,d];}));
const input=fs.readFileSync(process.argv[2],'utf8');
const target='data/affiliation-review.json';
const result=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):[];
let errors=0;
for(const line of input.trim().split(/\r?\n/)){
 if(!line.trim()||line.startsWith('#'))continue;
 const [name,source,spec,note='']=line.split('|');
 const p=pending.find(p=>normalize(p.name)===normalize(name));
 if(!p){console.log('PERSON NOT IN PENDING '+name);errors++;continue;}
 const affiliations=[];
 for(const item of spec.split(';')){
  const [faction,query,override]=item.split('~');const d=docs[override||source];
  if(faction==='unknown'){affiliations.push({faction,note:query});continue;}
  const matches=d?.paragraphs.map((text,index)=>({text,index})).filter(p=>normalize(p.text).includes(normalize(query)))||[];
  if(matches.length!==1){console.log('MATCH '+name+' '+faction+' '+query+' '+matches.length);errors++;continue;}
  const m=matches[0];const sentences=m.text.split(/(?<=[。])/);let chosen=sentences.find(t=>normalize(t).includes(normalize(query)))||m.text;
  affiliations.push({faction,source:d.id,paragraph:m.index,query,quote:chosen,precision:'unknown',affiliationCertainty:'exact',note:'史料可確認此階段的統屬；任職完整起訖尚未繫年，不繪製推測的連續色帶。'});
  console.log(name+' '+faction+' '+d.id+' P'+m.index+' '+chosen.slice(0,230));
 }
 const row={id:p.id,name:p.name,reviewed:true,affiliations,note};
 const i=result.findIndex(p=>p.id===row.id);if(i<0)result.push(row);else result[i]=row;
}
if(errors)throw Error(errors+' unresolved anchors; file unchanged');
fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');
console.log('Saved '+result.length+' reviewed entries');
