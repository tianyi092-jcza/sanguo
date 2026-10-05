import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const local=fs.existsSync('maps.config.local.json')?JSON.parse(fs.readFileSync('maps.config.local.json','utf8')):{};
const mapKey=local.googleMapsApiKey||'';
let bytes=0;
for(const file of files){
 if(/^(node_modules|output|dist|\.wrangler|\.codex|\.agents|\.aws)\//.test(file)||/^(?:\.env|\.dev\.vars)/.test(file)||file==='maps.config.local.json'||file==='三国志_郡国疆域与人物年表.html')throw Error('Excluded file staged: '+file);
 const abs=path.resolve(root,file);
 if(!abs.startsWith(root+path.sep)||fs.lstatSync(abs).isSymbolicLink())throw Error('Unsafe staged path: '+file);
 const data=fs.readFileSync(abs);bytes+=data.length;
 if(data.length>50*1024*1024)throw Error('Oversized Git file: '+file);
 if(mapKey&&data.includes(Buffer.from(mapKey)))throw Error('Map configuration value found in staged file: '+file);
 if(!/\.(png|webp|jpg|jpeg|gif|woff2)$/i.test(file)&&/(?:AIza[A-Za-z0-9_-]{30,}|gh[opsu]_[A-Za-z0-9]{30,})/.test(data.toString('utf8')))throw Error('Credential-like value in staged file: '+file);
}
console.log(JSON.stringify({files:files.length,bytes,megabytes:Math.round(bytes/1024/1024*100)/100,excludedConfiguration:'passed'}));
