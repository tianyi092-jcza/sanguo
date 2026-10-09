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
const head=`const DATA=${JSON.stringify(data)};\nconst HISTORY=${JSON.stringify(history)};\nconst PORTRAITS=${JSON.stringify(portraits)};\nconst MAP_CONFIG=${JSON.stringify(mapConfig)};\nconst SEARCH_CHARS=${JSON.stringify(chars)};\nconst WS_BIOGRAPHIES=${JSON.stringify(wsBio)};\nconst normalizeSearch=s=>Array.from(String(s||'')).map(c=>SEARCH_CHARS[c]||c).join('').toLowerCase();\n`;
js=head+'const ERA_CALENDAR='+read('data/calendar-eras.json').trim()+';\n'+traditional(js);
new vm.Script(js);
let css=html.match(/<style>([\s\S]*?)<\/style>/)[1]+'\n'+read('src/timeline.css')+'\n'+read('src/google-satellite.css');
html=html.replace(/<style>[\s\S]*?<\/style>/,'<!-- STYLE -->').replace(/<script>[\s\S]*?<\/script>/,'<!-- SCRIPT -->');
html=traditional(html).replace('人物時間軸','人物流年');
// Keep the original entry point as a portable, offline-capable artifact.
const standalone=html.replace('<!-- STYLE -->','<style>'+css.replace('./Oswald-Light.woff2','./assets/Oswald-Light.woff2')+'</style>').replace('<!-- SCRIPT -->','<script>'+js.replaceAll('</script','<\\/script')+'</script>');
fs.writeFileSync('三国志_郡国疆域与人物年表.html',standalone);
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
fs.writeFileSync('dist/_headers','/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
fs.writeFileSync('data/history.json',JSON.stringify(history,null,2));
fs.writeFileSync('dist/404.html','<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>頁面不存在</title><body><h1>頁面不存在</h1><a href="/">返回三國志資料集</a></body></html>');
console.log(JSON.stringify({people:data.per.length,sourceReadings:audit.withReading,datedPeople:audit.withTimeline,appBytes:Buffer.byteLength(js),entry:'dist/index.html'},null,2));
