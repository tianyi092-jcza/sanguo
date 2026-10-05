import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
const convert=OpenCC.Converter({from:'cn',to:'t'});
const sourceFiles=fs.readdirSync('data/sources').filter(x=>x.endsWith('.json'));
const docs=sourceFiles.map(x=>JSON.parse(fs.readFileSync('data/sources/'+x,'utf8')));
for(const rawName of process.argv.slice(2)){
 const name=convert(rawName);
 const matches=docs.flatMap(d=>d.paragraphs.map((p,i)=>({p,i,d}))).filter(x=>x.p.includes(name+'字')||x.p.includes(name+'，字'));
 console.log('\nPERSON '+name);
 for(const {p,i,d} of matches.slice(0,2))console.log(d.id+' paragraph '+i+'\n'+p.slice(0,5000));
}
