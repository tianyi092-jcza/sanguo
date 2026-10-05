import fs from 'node:fs';
import {normalize,traditional} from './history.mjs';
const docs=Object.fromEntries(fs.readdirSync('data/sources').filter(f=>f.endsWith('.json')).map(f=>{const d=JSON.parse(fs.readFileSync('data/sources/'+f));return [d.id,d];}));
const metadata=JSON.parse(fs.readFileSync('data/affiliation-metadata.json','utf8'));
const people=JSON.parse(traditional(fs.readFileSync('data/original.json','utf8'))).per;
for(const line of fs.readFileSync(process.argv[2],'utf8').trim().split(/\r?\n/)){
 if(!line.trim()||line.startsWith('#'))continue;
 const [name,source,query,title,issuer,kind='court']=line.split('|');
 const p=people.find(p=>normalize(p.n)===normalize(name));
 if(!p)throw Error('Unknown person '+name);
 const matches=docs[source]?.paragraphs.filter(t=>normalize(t).includes(normalize(query)))||[];
 if(matches.length!==1)throw Error(name+' has '+matches.length+' matches: '+query);
 metadata.hanOffices[p.n]||=[];
 const a={source,query,title,issuer,kind,period:'220年以前的漢末官爵；不等同實際軍政統屬'};
 const index=metadata.hanOffices[p.n].findIndex(a=>a.title===title);
 if(index<0)metadata.hanOffices[p.n].push(a);else metadata.hanOffices[p.n][index]=a;
 console.log(p.n+' '+title+' '+issuer);
}
fs.writeFileSync('data/affiliation-metadata.json',JSON.stringify(metadata,null,2)+'\n');
