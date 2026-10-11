// history.json 引文维基迁移（全量单次版）
// 一次性处理所有人，内存中计算，单次写盘，避免并发覆盖。
// 异体字归一 + 宽松阈值。
// 用法：node scripts/migrate-history-batch.mjs [--limit N]
import fs from 'node:fs';
import { parseWikitext } from './fetch-wikisource.mjs';

const ROOT = '/home/hatch/workspace/sanguo';
const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';
const CACHE_DIR = `${ROOT}/data/ws-cache`;

// 异体字归一（取自 rollout-wikisource.mjs）
const VARIANT_PAIRS = [
  ['為','爲'],['眾','衆'],['於','于'],['歷','曆'],['案','桉'],
  ['算','筭'],['強','彊'],['賓','賙'],['勖','勗'],['修','脩'],
  ['衛','衞'],['群','羣'],['饑','飢'],['劍','劔'],['掃','埽'],
  ['藉','籍'],['答','荅'],['跡','迹'],['諡','謚'],['克','剋'],
  ['皋','臯'],['協','叶'],['博','愽'],['床','牀'],
  ['勳','勛'],['既','旣'],['潁','颍'],['穎','颍'],
];
const VARIANT_MAP = {};
for (const [a,b] of VARIANT_PAIRS) { VARIANT_MAP[a]=a; VARIANT_MAP[b]=a; }
const normVariant = s => [...String(s)].map(c => VARIANT_MAP[c] || c).join('');

function parseSource(src) {
  const m = String(src).match(/^a0([345])-(\d+)([ab])?$/);
  if (!m) return null;
  const suffix = m[3] === 'a' ? '上' : m[3] === 'b' ? '下' : '';
  if (m[1] === '4') return { page: `三國志/卷${String(parseInt(m[2],10))}`, key: src };
  if (m[1] === '5') return { page: `晉書 (四庫全書本)/卷${String(parseInt(m[2],10)).padStart(3,'0')}`, key: src };
  if (m[1] === '3') return { page: `後漢書/卷${parseInt(m[2],10)}${suffix}`, key: src };
  return null;
}

async function fetchPage(page) {
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`${page}: ${j.error.info}`);
  return j.parse.wikitext;
}

const norm = s => normVariant(String(s||'')).replace(/[\s，。；：、！？「」『』（）《》〈〉…—·．,.;:!?'"()\[\]]/g, '');

function similarity(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  if (nb.includes(na) || na.includes(nb)) return 0.95;
  const [short, long] = na.length < nb.length ? [na, nb] : [nb, na];
  if (short.length < 10) return 0;
  let i = 0, matched = 0;
  for (const c of short) {
    const j = long.indexOf(c, i);
    if (j >= 0) { matched++; i = j + 1; }
  }
  return matched / short.length;
}

function loadCached(src) {
  const f = `${CACHE_DIR}/${src}.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

async function ensureCached(src) {
  if (loadCached(src)) return true;
  const info = parseSource(src);
  if (!info) return false;
  try {
    const wt = await fetchPage(info.page);
    const paras = parseWikitext(wt);
    const texts = paras.map(p => p.segs.map(s => s.h.replace(/<[^>]+>/g, '')).join(''));
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(`${CACHE_DIR}/${src}.json`, JSON.stringify(texts));
    await new Promise(r => setTimeout(r, 600));
    return true;
  } catch (e) {
    console.error(`  抓取失败 ${src}: ${e.message}`);
    return false;
  }
}

const limit = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

const history = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8'));

// 收集全部待迁移
const todo = [];
for (const [pid, p] of Object.entries(history.people)) {
  for (const field of ['facts', 'affiliations', 'hanOffices', 'appraisals']) {
    for (let i = 0; i < (p[field] || []).length; i++) {
      const it = p[field][i];
      if (!it.quote || it.wsMigrated) continue;
      const src = Array.isArray(it.source) ? it.source[0] : it.source;
      if (!src || !/^a0[345]-/.test(src)) continue;
      todo.push({ pid, field, idx: i, src });
    }
  }
  if (limit && todo.length >= limit) break;
}
console.log(`待迁移: ${todo.length} 条`);

// 预缓存所需卷
const needed = [...new Set(todo.map(t => t.src))];
console.log(`需缓存 ${needed.length} 卷...`);
for (const src of needed) await ensureCached(src);

// 逐条匹配（内存中，不写盘）
let done = 0;
const review = [];
for (const t of todo) {
  const texts = loadCached(t.src);
  const quote = history.people[t.pid][t.field][t.idx].quote;
  if (!texts) { review.push({ ...t, reason: '无缓存' }); continue; }
  let best = -1, bestScore = 0;
  for (let pi = 0; pi < texts.length; pi++) {
    const s = similarity(quote, texts[pi]);
    if (s > bestScore) { bestScore = s; best = pi; }
  }
  if (bestScore >= 0.75) {
    history.people[t.pid][t.field][t.idx].quote = texts[best];
    history.people[t.pid][t.field][t.idx].wsMigrated = true;
    history.people[t.pid][t.field][t.idx].wsSource = t.src;
    done++;
  } else {
    review.push({ pid: t.pid, field: t.field, src: t.src, score: bestScore.toFixed(2) });
  }
  if ((done + review.length) % 200 === 0) console.log(`  进度 ${done + review.length}/${todo.length}`);
}

// 单次写盘
fs.writeFileSync(`${ROOT}/data/history.json`, JSON.stringify(history, null, 1));
fs.writeFileSync(`${ROOT}/data/migrate-review-batch.json`, JSON.stringify(review, null, 1));
console.log(`完成：迁移 ${done}/${todo.length}，待审 ${review.length}`);
console.log(`待审清单：data/migrate-review-batch.json`);
