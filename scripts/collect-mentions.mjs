// 为无三国志本传的 124 人收集他传/裴注/晋书提及：
// 在 retrieval 语料（full_corpus.jsonl）中按姓名（繁体）+ 字检索 a04（三國志）/a05（晉書）段落，
// 输出 data/mentions.json，供 build 时并入 h.sourceExcerpts。
// 用法: node scripts/collect-mentions.mjs [pid1 pid2 ...]（无参数则跑全部 124 人）
import fs from 'node:fs';
import readline from 'node:readline';
import * as OpenCC from 'opencc-js';

const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });
const ROOT = '/home/hatch/workspace/sanguo';
const CORPUS = '/home/hatch/workspace/sanguo-retrieval-poc/full_corpus.jsonl';

const orig = JSON.parse(fs.readFileSync(`${ROOT}/data/original.json`, 'utf8'));
// 人物顺序与 makeHistory（前端）一致：先滤除貂蝉，否则 p0128 之后全部错位
const perList = orig.per.filter(p => p.n !== '貂蝉');
const skip = JSON.parse(fs.readFileSync(`${ROOT}/data/wikisource-skip.json`, 'utf8'));
const sources = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8')).sources;

const onlyPids = new Set(process.argv.slice(2));
const pids = Object.keys(skip).filter(pid => !onlyPids.size || onlyPids.has(pid));

// 载入语料：只取 a04（三国志）/a05（晋书），跳过 -ahcb（优先正文版）
const segs = [];
const file = readline.createInterface({ input: fs.createReadStream(CORPUS), crlfDelay: Infinity });
for await (const line of file) {
  if (!line.trim()) continue;
  const o = JSON.parse(line);
  if (!/^a0[45]-/.test(o.file)) continue;
  if (o.file.includes('-ahcb')) continue;
  segs.push(o);
}
console.log(`语料段落: ${segs.length}（a04/a05，非ahcb）`);

// 从 source title 生成简引，如 "二十四史-三國志-卷七‧魏書七 呂布張邈臧洪傳第七" -> "《三國志·魏書七》"
function makeCitation(sourceId) {
  const t = sources[sourceId]?.title || sourceId;
  let m = t.match(/三國志-卷[^‧]*‧([^\s　]+)/);
  if (m) return `《三國志·${m[1]}》`;
  m = t.match(/晉書-卷(\d+)/);
  if (m) return `《晉書·卷${m[1]}》`;
  return `《${t}》`;
}

const out = { schemaVersion: 1, people: [] };
for (const pid of pids) {
  const idx = parseInt(pid.slice(1)) - 1;
  const per = perList[idx];
  if (!per) { console.log(`SKIP ${pid}: 无per记录`); continue; }
  const nameTrad = toTrad(per.n);
  // 晋前人物（卒<265）：晋书命中多为重名误伤，只收三国志；晋及以后/未知卒年：三国志+晋书
  const death = per.d;
  const includeJinshu = !death || death >= 265;
  // 检索：姓名必含；排除纯目录/标题式极短段（<20字）
  const hits = [];
  for (const s of segs) {
    if (!s.text.includes(nameTrad)) continue;
    if (s.text.length < 20) continue;
    const srcId = s.file.replace(/\.json$/, '');
    const isJinshu = srcId.startsWith('a05-');
    if (isJinshu && !includeJinshu) continue;
    const work = isJinshu ? 'jinshu' : 'sanguozhi';
    // 消歧：排除"王允之"（后接"之"为更长人名）；若一段内有多个"王允"，只要有一个不是"王允之"就保留
    let hasGood = false;
    let pos = -1;
    while ((pos = s.text.indexOf(nameTrad, pos + 1)) >= 0) {
      const after = s.text[pos + nameTrad.length];
      if (after !== '之') { hasGood = true; break; }
    }
    if (!hasGood) continue;
    hits.push({
      id: `${pid}-m${String(hits.length + 1).padStart(3, '0')}`,
      work,
      source: srcId,
      paragraph: s.idx,
      citation: makeCitation(srcId),
      quote: s.text,
      display: true,
    });
  }
  // 去重：同一 source+paragraph 只留一条；文本完全相同的只留一条
  const seen = new Set(), deduped = [];
  for (const h of hits) {
    const k1 = `${h.source}:${h.paragraph}`;
    const k2 = h.quote;
    if (seen.has(k1) || seen.has(k2)) continue;
    seen.add(k1); seen.add(k2);
    deduped.push(h);
  }
  // 重编号
  deduped.forEach((h, i) => h.id = `${pid}-m${String(i + 1).padStart(3, '0')}`);
  out.people.push({ id: pid, name: per.n, excerpts: deduped });
  console.log(`${pid} ${per.n}: ${deduped.length} 条`);
}

fs.writeFileSync(`${ROOT}/data/mentions.json`, JSON.stringify(out, null, 1) + '\n');
console.log(`写入 data/mentions.json，共 ${out.people.length} 人`);
