import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import sharp from 'sharp';
import {normalize,traditional} from './history.mjs';
import {checkAppraisals} from './check-appraisals.mjs';
import {checkAffiliations} from './check-affiliations.mjs';
const history=JSON.parse(fs.readFileSync('data/history.json','utf8'));
assert.deepEqual(history.range,{start:184,end:280});
let periods=0,points=0;
for(const [id,p] of Object.entries(history.people)){
 for(const s of p.segments){
  assert(Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.start<=s.end,`${id}: invalid dates`);
  assert(history.factions[s.faction],`${id}: unknown faction`);
  assert(history.sources[s.source]&&s.quote?.length>4,`${id}: missing evidence`);
  assert(['exact','inferred','unknown'].includes(s.precision));
  if(s.faction==='jin')assert(s.start>=265,`${id}: Jin before foundation`);
  if(s.faction==='wei')assert(s.start>=220,`${id}: Wei before foundation`);
  if(s.faction==='shu')assert(s.start>=221,`${id}: Shu Han before foundation`);
  if(s.faction==='wu')assert(s.start>=229,`${id}: Wu empire before foundation`);
  if(s.point)points++;else periods++;
 }
}
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('lang="zh-Hant"'));
const file=html.match(/src="\.\/assets\/([^"\s]+\.js)"/)[1];
const js=fs.readFileSync('dist/assets/'+file,'utf8');new vm.Script(js);
const calendar=JSON.parse(fs.readFileSync('data/calendar-eras.json','utf8'));
for(let year=184;year<=280;year++)assert.equal(calendar.eras.filter(e=>year>=e.start&&year<=e.end).length,1,'Calendar coverage '+year);
for(const era of calendar.eras)assert(era.source.startsWith('https://')||fs.existsSync('data/sources/'+era.source+'.json'),'Missing calendar source');
const calendarContext=vm.createContext({ERA_CALENDAR:calendar});
vm.runInContext(fs.readFileSync('src/calendar.js','utf8'),calendarContext);
for(const [year,label] of [[184,'184·中平元年'],[189,'189·中平六年'],[190,'190·初平元年'],[194,'194·興平元年'],[196,'196·建安元年'],[219,'219·建安二十四年'],[220,'220·黃初元年'],[227,'227·太和元年'],[233,'233·青龍元年'],[237,'237·景初元年'],[240,'240·正始元年'],[249,'249·嘉平元年'],[254,'254·正元元年'],[256,'256·甘露元年'],[260,'260·景元元年'],[264,'264·咸熙元年'],[265,'265·泰始元年'],[274,'274·泰始十年'],[275,'275·咸寧元年'],[280,'280·太康元年']])assert.equal(vm.runInContext('eraYearLabel('+year+')',calendarContext),label);
assert(calendarContext.ERA_CALENDAR.changes[220].includes('延康'));
const data=JSON.parse(js.match(/^const DATA=(.*);$/m)[1]);
const appraisalChecks=checkAppraisals(data,history,normalize,traditional);
const affiliationChecks=checkAffiliations(data,history,normalize);
const byName=name=>{const p=data.per.find(p=>normalize(p.n)===normalize(name));assert(p,'Missing person '+name);return history.people[p.id];};
for(const [name,affiliations,death] of [['王允',['han'],192],['顏良',['yuanshao'],200],['文醜',['yuanshao'],200],['孔融',['kongrong','han'],208],['鮑信',['baoxin'],192],['楊奉',['baibo','licui','yangfeng','yuanshu'],197]]){
 const p=byName(name);assert.equal(p.death,death,name+' death year');
 for(const faction of affiliations)assert(p.segments.some(s=>s.faction===faction),name+' lost known affiliation '+faction);
 assert(p.facts?.length>=2,name+' must have evidence for biographical facts');
}
assert.equal(history.factions.kongrong.kind,'lord');assert.equal(history.factions.baibo.kind,'army');
for(const p of Object.values(history.people))for(const f of p.facts||[])assert(history.sources[f.source]&&f.quote?.length>4,'Missing fact evidence');
for(const symbol of ['renderTL','gotoPerson','gotoYear','positionTimelineTooltip','openPerson','renderMap','renderTbl','openEvent'])assert(js.includes('function '+symbol+'('),'Missing '+symbol);
assert(!js.includes('for(let y=150;y<=286;y++)'));
const plan=JSON.parse(fs.readFileSync('data/portrait-plan.json','utf8'));
let avatars=0;for(const p of plan.filter(p=>p.status==='generated')){const info=await sharp('assets/portraits/'+p.file).metadata();assert.equal(info.width,120);assert.equal(info.height,120);if(!p.anonymous){const person=data.per.find(x=>x.id===p.id);assert(person&&normalize(person.n)===normalize(p.name),'Portrait assigned to wrong person: '+p.id);}avatars++;}
console.log(JSON.stringify({people:Object.keys(history.people).length,periods,datedMentions:points,avatars,syntax:'passed',sourceAndRangeChecks:'passed',affiliations:affiliationChecks,appraisals:appraisalChecks},null,2));
