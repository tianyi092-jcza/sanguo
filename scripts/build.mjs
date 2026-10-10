import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {makeHistory,traditional} from './history.mjs';
import {loadMapConfig} from './map-config.mjs';
const read=p=>fs.readFileSync(p,'utf8');
const {data,history,chars,audit}=makeHistory(JSON.parse(read('data/original.json')));
const mapConfig=loadMapConfig();
fs.mkdirSync('output',{recursive:true});fs.writeFileSync('output/data-audit.json',JSON.stringify(audit,null,2));
if(audit.missingAnchors.length){console.error(JSON.stringify(audit.missingAnchors,null,2));throw new Error('Every dated segment must resolve to a source-text anchor.');}
let html=read('src/legacy.html');
html=html.replace('lang="zh-CN"','lang="zh-Hant"').replace('<meta charset="UTF-8">','<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="以三國志及裴松之注為中心，查閱184至280年間的人物統屬、歷史事件與郡國地理。">');
html=html.replace('<title>', '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%275%27 fill=%27%23171e25%27/%3E%3Cpath d=%27M8 9h16M10 16h12M7 23h18%27 stroke=%27%23c8a46b%27 stroke-width=%272%27/%3E%3C/svg%3E">\n<title>');
html=html.replace(/  <section class="view" id="v-tl">[\s\S]*?(?=  <section class="view" id="v-tbl">)/,read('src/timeline.html')+'\n');
let js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
js=js.replace('/* INLINE_DATA */','');
js=js.replace('/* ONLINE_MAPS */',read('src/google-satellite.js'));
js=js.replace(/function gotoPerson\(p\)\{[\s\S]*?(?=\/\* ================= 郡县表)/,'');
js=js.replace(/\/\* ================= 时间轴 ================= \*\/[\s\S]*?(?=\/\* ================= 弹窗)/,read('src/calendar.js')+'\n'+read('src/timeline.js')+'\n');
js=js.replace(/function openPerson\(p\)\{[\s\S]*?(?=function openEvent\()/,read('src/history-ui.js')+'\n');
js=js.replace(/for\(let y=150;y<=286;y\+\+\)/,'for(let y=184;y<=280;y++)');
js=js.replace('const v=$("#q").value.trim(),box=', 'const v=normalizeSearch($("#q").value.trim()),box=');
js=js.replace('i.k.includes(v)','normalizeSearch(i.k).includes(v)').replace('i.k.includes(v)','normalizeSearch(i.k).includes(v)');
js=js.replace('const v=$("#tblQ").value.trim();','const v=normalizeSearch($("#tblQ").value.trim());').replace('c.n.includes(v)||c.seat.includes(v)||c.mod.includes(v)','normalizeSearch(c.n+c.seat+c.mod).includes(v)');
js=js.replace(/act:\(\)=>\{gotoYear\(ev.y\);setTimeout\(\(\)=>\{[\s\S]*?\},700\);\}/,'act:()=>{gotoYear(ev.y);openEvent(ev);}');
js=js.replace(/\$\("#about"\)\.innerHTML=`[\s\S]*?`;/,'$("#about").innerHTML='+JSON.stringify(read('src/about.html'))+';');
// Render the map using one animation frame per drag update, and resize after returning from a hidden view.
js=js.replace('if(curView==="tl") renderTL();','if(curView==="tl") renderTL();\n  if(curView==="map") requestAnimationFrame(renderMap); else googleSatellite.leave();');
js=js.replace('const sc=W/vb.w;','const sc=Math.min(W/vb.w,H/vb.h), ox=(W-vb.w*sc)/2, oy=(H-vb.h*sc)/2;');
js=js.replace('[(mx(lo)-vb.x)*sc,(my(la)-vb.y)*sc]','[ox+(mx(lo)-vb.x)*sc,oy+(my(la)-vb.y)*sc]');
js=js.replace('svg.style.display="block";$("#tiles").innerHTML="";','svg.style.display="block";$("#tiles").innerHTML="";$("#tiles").style.display="none";');
js=js.replace('const tl=$("#tiles");tl.innerHTML="";','const tl=$("#tiles");tl.innerHTML="";tl.style.display="block";');
const portraitPlan=JSON.parse(read('data/portrait-plan.json'));
const portraits={people:{},fallback:{},gender:{}};
for(const p of data.per){if(/皇后|夫人|魯班|魯育|卑彌呼|臺與/.test(p.n))portraits.gender[p.id]='female';else if(p.z)portraits.gender[p.id]='male';}
fs.mkdirSync('dist/assets/portraits',{recursive:true});
for(const p of portraitPlan){
  let file=null;
  if(p.status==='generated'&&p.file&&fs.existsSync('assets/portraits/'+p.file)){
    const bytes=fs.readFileSync('assets/portraits/'+p.file),fp=p.id+'.'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12)+'.webp';
    fs.writeFileSync('assets/portraits/'+fp,bytes);fs.writeFileSync('dist/assets/portraits/'+fp,bytes);file='./assets/portraits/'+fp;
  }
  if(p.anonymous){portraits.fallback[p.gender==='unspecified'?'unknown':p.gender]=file;continue;}
  portraits.people[p.id]={file,gender:p.gender,appearance:p.appearance,source:p.source,appearanceSource:p.appearanceSource,status:p.status};
}
const wsBioPath='data/wikisource.json';
const wsBio=fs.existsSync(wsBioPath)?JSON.parse(read(wsBioPath)):{};
// 本传全文按需加载：每人一篇静态 JSON，首屏只嵌元数据清单
fs.mkdirSync('dist/wikisource',{recursive:true});
const wsManifest={};
for(const pid of Object.keys(wsBio)){
  const {paragraphs,...meta}=wsBio[pid];
  wsManifest[pid]=meta;
  fs.writeFileSync(`dist/wikisource/${pid}.json`,JSON.stringify(wsBio[pid]));
}
// 通鑑摘錄按需加载：每卷一篇静态 JSON（仅含有人物命中的段），首屏只嵌卷索引；单文件版内嵌每人摘錄
const tjSegs=fs.existsSync('data/tongjian/segments.json')?JSON.parse(read('data/tongjian/segments.json')):{};
const tjMatches=fs.existsSync('data/tongjian/matches.json')?JSON.parse(read('data/tongjian/matches.json')):{};
const tjLinks=fs.existsSync('data/tongjian-links.json')?JSON.parse(read('data/tongjian-links.json')):{};
const tjSegById=new Map();
for(const v of Object.values(tjSegs))for(const s of v.segments)tjSegById.set(s.id,s);
const tjSegPids=new Map(); // segId -> [pid]
for(const [pid,ms] of Object.entries(tjMatches))for(const m of ms){
  if(!tjSegPids.has(m.segId))tjSegPids.set(m.segId,[]);
  tjSegPids.get(m.segId).push(pid);
}
fs.mkdirSync('dist/tongjian',{recursive:true});
const tjIndex={},tjPeople={};
for(const [pid,ms] of Object.entries(tjMatches)){
  if(!ms.length)continue;
  const vols=new Set(),exs=[];
  for(const m of ms){
    const s=tjSegById.get(m.segId);
    if(!s)continue;
    vols.add(s.vol);
    const link=tjLinks[pid]?.[m.segId];
    exs.push({id:m.segId,vol:s.vol,yearKey:s.yearKey,yearLabel:s.yearLabel,ceYear:s.ceYear,html:s.html,bioPara:link?.para??null});
  }
  exs.sort((a,b)=>a.ceYear-b.ceYear||(a.id<b.id?-1:1));
  tjPeople[pid]=exs;
  tjIndex[pid]=[...vols].sort();
}
for(const [vol,v] of Object.entries(tjSegs)){
  const segs=[];
  for(const s of v.segments){
    for(const pid of tjSegPids.get(s.id)||[]){
      const link=tjLinks[pid]?.[s.id];
      segs.push({id:s.id,pid,vol:s.vol,yearKey:s.yearKey,yearLabel:s.yearLabel,ceYear:s.ceYear,html:s.html,bioPara:link?.para??null});
    }
  }
  if(segs.length)fs.writeFileSync(`dist/tongjian/${vol}.json`,JSON.stringify({vol,page:v.page,url:v.url,segments:segs}));
}
if(Object.keys(tjLinks).length)fs.writeFileSync('dist/tongjian-links.json',JSON.stringify(tjLinks));
const placeModernPath='data/place-modern.json';
const placeModern=fs.existsSync(placeModernPath)?JSON.parse(read(placeModernPath)):{};
const head=`const DATA=${JSON.stringify(data)};\nconst HISTORY=${JSON.stringify(history)};\nconst PORTRAITS=${JSON.stringify(portraits)};\nconst PLACE_MODERN=${traditional(JSON.stringify(placeModern))};\nconst MAP_CONFIG=${JSON.stringify(mapConfig)};\nconst SEARCH_CHARS=${JSON.stringify(chars)};\nconst WS_BIOGRAPHIES=${JSON.stringify(wsManifest)};\nconst TJ_INDEX=${JSON.stringify(tjIndex)};\nconst normalizeSearch=s=>Array.from(String(s||'')).map(c=>SEARCH_CHARS[c]||c).join('').toLowerCase();\n`;
js=head+'const ERA_CALENDAR='+read('data/calendar-eras.json').trim()+';\n'+traditional(js);
new vm.Script(js);
let css=html.match(/<style>([\s\S]*?)<\/style>/)[1]+'\n'+read('src/timeline.css')+'\n'+read('src/google-satellite.css');
html=html.replace(/<style>[\s\S]*?<\/style>/,'<!-- STYLE -->').replace(/<script>[\s\S]*?<\/script>/,'<!-- SCRIPT -->');
html=traditional(html).replace('人物時間軸','人物列傳');
// Keep the original entry point as a portable, offline-capable artifact.
const standalone=html.replace('<!-- STYLE -->','<style>'+css.replace('./Oswald-Light.woff2','./assets/Oswald-Light.woff2')+'</style>').replace('<!-- SCRIPT -->','<script>'+js.replaceAll('</script','<\\/script')+'</script>');
// 单文件离线版内嵌本传全文数据（dist 版改为按需 fetch）
const standaloneWs=standalone.replace('</body>','<script type="application/json" id="ws-bio-data">'+JSON.stringify(wsBio).replaceAll('</script','<\\/script')+'</script><script type="application/json" id="tj-data">'+JSON.stringify(tjPeople).replaceAll('</script','<\\/script')+'</script></body>');
fs.writeFileSync('三国志_郡国疆域与人物年表.html',standaloneWs);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const fontBytes=fs.readFileSync('assets/Oswald-Light.woff2');
const fontName='Oswald-Light.'+hash(fontBytes)+'.woff2';
// External CSS resolves font URLs from dist/assets; the portable HTML resolves from the root.
css=css.replace('./Oswald-Light.woff2','./'+fontName);
const jname='app.'+hash(js)+'.js',cname='style.'+hash(css)+'.css';
fs.mkdirSync('dist/assets',{recursive:true});
// Remove only generated fingerprinted files in the verified build-output directory.
for(const file of fs.readdirSync('dist/assets'))if(/^(app|style)\.[a-f0-9]{12}\.(js|css)$/.test(file))fs.unlinkSync('dist/assets/'+file);
fs.writeFileSync('dist/assets/'+fontName,fontBytes);
fs.writeFileSync('dist/assets/'+jname,js);fs.writeFileSync('dist/assets/'+cname,css);
fs.writeFileSync('dist/index.html',html.replace('<!-- STYLE -->',`<link rel="stylesheet" href="./assets/${cname}">`).replace('<!-- SCRIPT -->',`<script defer src="./assets/${jname}"></script>`));
fs.writeFileSync('dist/_headers','/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/wikisource/*\n  Cache-Control: public, max-age=3600\n/tongjian/*\n  Cache-Control: public, max-age=3600\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
fs.writeFileSync('data/history.json',JSON.stringify(history,null,2));
fs.writeFileSync('dist/404.html','<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>頁面不存在</title><body><h1>頁面不存在</h1><a href="/">返回三國志資料集</a></body></html>');
console.log(JSON.stringify({people:data.per.length,sourceReadings:audit.withReading,datedPeople:audit.withTimeline,appBytes:Buffer.byteLength(js),entry:'dist/index.html'},null,2));
