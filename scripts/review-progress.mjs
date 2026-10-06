import fs from 'node:fs';
import {makeHistory} from './history.mjs';

const {data}=makeHistory(JSON.parse(fs.readFileSync('data/original.json','utf8')));
const review=JSON.parse(fs.readFileSync('data/person-second-review.json','utf8'));
const byId=new Map(review.people.map(row=>[row.id,row]));
const unreviewed=data.per.filter(person=>!byId.has(person.id));
const pilot=data.per.filter(person=>byId.get(person.id)?.status==='pilot');
const complete=data.per.filter(person=>byId.get(person.id)?.status==='complete');
const next=(pilot.length?pilot:unreviewed).slice(0,8).map(person=>({id:person.id,name:person.n,status:byId.get(person.id)?.status||'unreviewed'}));
console.log(JSON.stringify({total:data.per.length,complete:complete.length,pilot:pilot.length,unreviewed:unreviewed.length,remaining:data.per.length-complete.length,next},null,2));
