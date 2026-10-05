import fs from 'node:fs';
import {normalize} from './history.mjs';
const pending=JSON.parse(fs.readFileSync('output/affiliation-review-pending.json','utf8'));
const docs=Object.fromEntries(fs.readdirSync('data/sources').filter(x=>x.endsWith('.json')).map(f=>{const d=JSON.parse(fs.readFileSync('data/sources/'+f,'utf8'));return [d.id,d];}));
const start=Number(process.argv[2]||0),end=Number(process.argv[3]||pending.length);
for(const p of pending.slice(start,end)){
 const d=docs[p.h.reading?.source];console.log('\n'+pending.indexOf(p)+' '+p.id+' '+p.name+' '+(d?.id||'null')+' '+p.h.reading?.kind);
 if(!d)continue;
 const q=normalize(p.h.reading.quote.replace(/^……/, '').slice(0,90));
 let i=d.paragraphs.findIndex(s=>normalize(s).includes(q));
 if(i<0)i=d.paragraphs.findIndex(s=>normalize(s).includes(normalize(p.name)));
 if(i<0)continue;
 const text=d.paragraphs[i];console.log('P'+i+': '+text.slice(0,330));
 if(p.h.reading.kind==='biography'){
  for(let j=i;j<Math.min(i+9,d.paragraphs.length);j++){
   const t=d.paragraphs[j];if(j>i&&/^[\p{Script=Han}]{1,7}(字|，字)/u.test(t))break;
   const sentences=t.split(/(?<=[。])/).filter(s=>/太祖|先主|文帝|明帝|後主|孫[權策堅]|劉[表璋焉]|袁紹|建安|建興|黃初|太和|嘉平|降|拜|領|從|辟|仕|封/.test(s));
   console.log('P'+j+' K: '+sentences.map(s=>s.length>170?s.slice(0,170)+'…':s).slice(0,8).join(''));
  }
 }
}
