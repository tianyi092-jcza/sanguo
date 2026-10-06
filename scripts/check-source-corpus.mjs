import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

export function checkSourceCorpus(history){
 const manifest=JSON.parse(fs.readFileSync('data/source-corpus-manifest.json','utf8'));
 const expected={sanguozhi:65,houhanshu:130,huayang:13,jinshu:130};
 const requiredIds={
  sanguozhi:Array.from({length:65},(_,i)=>`a04-${String(i+1).padStart(3,'0')}`),
  huayang:Array.from({length:13},(_,i)=>`a06-${String(i).padStart(3,'0')}`),
  jinshu:Array.from({length:130},(_,i)=>`a05-${String(i+1).padStart(3,'0')}-ahcb`),
 };
 const hhsIds=[];
 for(let n=1;n<=120;n++){
  const volume=String(n).padStart(3,'0');
  if([10,28,30,60].includes(n))hhsIds.push(`a03-${volume}a-ahcb`,`a03-${volume}b-ahcb`);
  else hhsIds.push(`a03-${volume}-ahcb`);
 }
 for(const n of ['001b','040b','074b','079b','080b','082b'])hhsIds.push(`a03-${n}-ahcb`);
 requiredIds.houhanshu=hhsIds;
 for(const [work,count] of Object.entries(expected)){
  const entry=manifest.works[work];assert(entry?.complete,`Source corpus incomplete: ${work}`);
  assert.equal(entry.records.length,count,`Wrong source record count: ${work}`);
  assert.equal(entry.recordCount,count,`Wrong manifest count: ${work}`);
  const seen=new Set();
  for(const item of entry.records){
   assert(!seen.has(item.id),`Duplicate corpus source: ${item.id}`);seen.add(item.id);
   const filename=path.join('data','sources',item.id+'.json');assert(fs.existsSync(filename),`Missing corpus source: ${item.id}`);
   const bytes=fs.readFileSync(filename),record=JSON.parse(bytes.toString('utf8'));
   assert.equal(record.id,item.id,`Source ID mismatch: ${item.id}`);
   const canonicalRecord=bytes.toString('utf8').replace(/\r\n/g,'\n');
   assert.equal(crypto.createHash('sha256').update(canonicalRecord,'utf8').digest('hex'),item.recordSha256,`Source record changed since manifest: ${item.id}`);
   assert.equal(record.sha256,item.sha256,`Raw-source hash mismatch: ${item.id}`);
   assert(record.paragraphs?.length>0,`Empty source text: ${item.id}`);
   assert(history.sources[item.id],`Source omitted from history index: ${item.id}`);
  }
  assert.deepEqual([...seen].sort(),requiredIds[work].sort(),`Incomplete or unexpected volume set: ${work}`);
 }
 return {books:Object.fromEntries(Object.entries(manifest.works).map(([name,item])=>[name,item.recordCount]))};
}

if(import.meta.url===`file://${process.argv[1]?.replaceAll('\\','/')}`){
 const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));
 console.log(JSON.stringify(checkSourceCorpus(history),null,2));
}
