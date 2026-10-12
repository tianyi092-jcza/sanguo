// 史料摘录重提：sidneyluo.net 底本，全名精确匹配，每命中只取一段
// 原则：宁错过，不摘无关的
// 用法: node scripts/reextract-mentions-sidneyluo.mjs
import fs from 'node:fs';
import readline from 'node:readline';
import * as OpenCC from 'opencc-js';

const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });
const ROOT = '/home/hatch/workspace/sanguo';
const CORPUS = '/home/hatch/workspace/sanguo-retrieval-poc/full_corpus.jsonl';

const orig = JSON.parse(fs.readFileSync(`${ROOT}/data/original.json`, 'utf8'));
const perList = orig.per.filter(p => p.n !== '貂蝉');
const sources = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8')).sources;

// 载入语料：a03（后汉书）/a04（三国志）/a05（晋书），跳过 -ahcb（优先正文版）
console.log('载入语料...');
const segs = [];
const file = readline.createInterface({ input: fs.createReadStream(CORPUS), crlfDelay: Infinity });
for await (const line of file) {
  if (!line.trim()) continue;
  const o = JSON.parse(line);
  if (!/^a0[345]-/.test(o.file)) continue;
  if (o.file.includes('-ahcb')) continue;
  segs.push(o);
}
console.log(`语料段落: ${segs.length}`);

// 建立段落索引：按 file+text 前50字 做键，用于依据引文匹配
const segIndex = new Map();
for (const s of segs) {
  const key = s.file + '|' + s.text.slice(0, 50);
  if (!segIndex.has(key)) segIndex.set(key, s);
}

// 全名精确匹配：名称必须作为完整字符串出现
// 排除单字匹配、部分匹配
function findMentions(nameTrad, text) {
  // 简单的全字符串包含检查
  // 注意：这里不做分词，就是简单的子串匹配，但要求全名完整出现
  return text.includes(nameTrad);
}

// 为每个人提取
const out = { schemaVersion: 1, people: [] };
let totalHits = 0;

for (let idx = 0; idx < perList.length; idx++) {
  const per = perList[idx];
  const pid = `p${String(idx+1).padStart(4,'0')}`;
  const nameTrad = toTrad(per.n);
  
  const hits = [];
  for (const seg of segs) {
    if (findMentions(nameTrad, seg.text)) {
      // 判断 work 类型
      const src = seg.file.replace('.json','').replace('-ahcb','');
      let work = 'sanguozhi';
      if (src.startsWith('a03-')) work = 'houhanshu';
      else if (src.startsWith('a05-')) work = 'jinshu';
      // 裴注判断：如果段落含"裴注"或"注曰"等，标为 peizhu
      // 简化：暂不区分，都按正文处理，由前端显示时判断
      
      hits.push({
        id: `${pid}-${src}-${hits.length}`,
        work,
        source: src,
        citation: makeCitation(seg.file),
        quote: seg.text,  // 只取一段，不扩展
      });
    }
  }
  
  if (hits.length > 0) {
    out.people.push({ id: pid, excerpts: hits });
    totalHits += hits.length;
  }
  
  if ((idx+1) % 50 === 0) {
    console.log(`  进度 ${idx+1}/${perList.length}, 命中 ${totalHits}`);
  }
}

console.log(`完成：${out.people.length} 人有命中，共 ${totalHits} 段`);
fs.writeFileSync(`${ROOT}/data/mentions.json`, JSON.stringify(out, null, 1));
console.log('已写入 data/mentions.json（覆盖旧版）');

function makeCitation(file) {
  // file 如 "a04-028.json" -> 查 sources 表
  const srcId = file.replace('.json','');
  const t = sources[srcId]?.title || srcId;
  // 格式: "二十四史-三國志-卷二十八‧魏書二十八　王毋丘諸葛鄧鍾傳第二十八"
  let m = t.match(/三國志-卷[^‧]*‧([^\s　]+)/);
  if (m) return `《三國志·${m[1]}》`;
  m = t.match(/後漢書-卷([^‧]*)‧/);
  if (m) return `《後漢書·卷${m[1]}》`;
  m = t.match(/晉書-卷([^‧]*)‧/);
  if (m) return `《晉書·卷${m[1]}》`;
  return `《${t}》`;
}
