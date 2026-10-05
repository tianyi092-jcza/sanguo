import fs from 'node:fs';
import {makeHistory} from './history.mjs';
const {data,history}=makeHistory(JSON.parse(fs.readFileSync('data/original.json','utf8')));
const existing=fs.existsSync('data/portrait-plan.json')?JSON.parse(fs.readFileSync('data/portrait-plan.json','utf8')):[];
const women=new Set('伏皇后 甄皇后 郭皇后 毛皇后 步夫人 潘皇后 孫魯班 孫魯育 孫夫人 吳皇后 卑彌呼 臺與'.split(' '));
const rulers=new Set('曹操 曹丕 曹叡 曹芳 曹髦 曹奐 劉備 劉禪 孫堅 孫策 孫權 孫亮 孫休 孫皓 司馬懿 司馬師 司馬昭 司馬炎 董卓 呂布 袁紹 袁術 公孫瓚 公孫度 公孫淵 陶謙 劉虞 劉表 劉焉 劉璋 張魯 士燮'.split(' '));
const civil=new Set('荀彧 荀攸 賈詡 郭嘉 程昱 董昭 劉曄 蔣濟 鍾繇 華歆 王朗 陳羣 王粲 陳琳 劉楨 徐幹 應瑒 阮瑀 楊修 丁儀 崔琰 毛玠 高柔 陳震 董允 譙周 郤正 伊籍 簡雍 麋竺 孫乾 劉巴 許靖 秦宓 費禕 蔣琬 法正 龐統 諸葛亮 諸葛瑾 張昭 張紘 顧雍 步騭 嚴畯 程秉 闞澤 薛綜 陸績 虞翻 張溫 駱統 陸瑁 是儀 胡綜 韋昭 華覈 王蕃 樓玄 賀邵 楊彪 蔡邕 禰衡 孔融 鄭玄 司馬朗 杜畿 劉馥 荀爽 何顒 王允 張華 賈充 司馬孚'.split(' '));
const masters=new Set('鄭玄 華佗 管輅'.split(' '));
const plan=data.per.filter(p=>existing.some(x=>x.id===p.id)||history.people[p.id]?.reading?.kind==='biography'||rulers.has(p.n)||women.has(p.n)||history.people[p.id]?.segments.some(s=>!s.point)).map(p=>{
 const h=history.people[p.id],gender=women.has(p.n)?'female':'male';
 const role=gender==='female'?'court woman':masters.has(p.n)?'scholar or physician':rulers.has(p.n)?'political or military leader':civil.has(p.n)?'civil official and scholar':'historical official; follow the primary-source excerpt for civilian versus military dress';
 return {id:p.id,name:p.n,gender,role,source:h.reading?.source||h.segments[0]?.source||null,evidence:h.reading?.quote||h.segments[0]?.quote||p.s,appearance:p.m||'',status:'pending',file:null};
});
const simple=[{id:'anonymous-male',name:'匿名男性',gender:'male'},{id:'anonymous-female',name:'匿名女性',gender:'female'},{id:'anonymous-unknown',name:'性別未詳',gender:'unspecified'}];
const all=[...plan,...simple.map(p=>({...p,anonymous:true,status:'pending'}))].map(p=>{
 const old=existing.find(x=>x.id===p.id);
 if(old&&['generated','insufficient'].includes(old.status))return {...p,status:old.status,file:old.file,prompt:old.prompt,generator:old.generator,reviewNote:old.reviewNote,source:old.source,evidence:old.evidence,role:old.role,appearance:old.appearance,appearanceSource:old.appearanceSource};
 return old?.reviewNote?{...p,source:old.source,evidence:old.evidence,role:old.role,appearance:old.appearance,appearanceSource:old.appearanceSource,reviewNote:old.reviewNote}:p;
});
fs.writeFileSync('data/portrait-plan.json',JSON.stringify(all,null,2));
console.log('Portrait targets',plan.length,'plus',simple.length,'anonymous silhouettes');
