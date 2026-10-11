// 将 history.json 中 facts/affiliations/hanOffices/appraisals 的引文迁移到维基文库版本。
// 按人整批处理：先抓取全部所需卷缓存，再逐人迁移其全部条目，
// 确保同一人的多条引文在一次中比对，不遗漏条目间联系。
// 用法：
//   node scripts/migrate-history-wikisource.mjs --person=p0126  # 单人
//   node scripts/migrate-history-wikisource.mjs --all           # 全部（分批跑，每批一人）
//   node scripts/migrate-history-wikisource.mjs --fetch-all     # 预抓取全部卷缓存
import fs from 'node:fs';
import { parseWikitext } from './fetch-wikisource.mjs';

const ROOT = '/home/hatch/workspace/sanguo';
const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';
const CACHE_DIR = `${ROOT}/data/ws-cache`;

function parseSource(src) {
  const m = String(src).match(/^a0([345])-(\d+)([ab])?$/);
  if (!m) return null;
  const num = String(parseInt(m[2], 10)).padStart(3, '0');
  const suffix = m[3] === 'a' ? '上' : m[3] === 'b' ? '下' : '';
  if (m[1] === '4') return { page: `三國志/卷${num.slice(1)}`, key: src };
  if (m[1] === '5') return { page: `晉書 (四庫全書本)/卷${num}`, key: src };
  // 后汉书用主版本（非四库本）：後漢書/卷10下
  if (m[1] === '3') return { page: `後漢書/卷${parseInt(m[2],10)}${suffix}`, key: src };
  return null;
}

async function fetchPage(page) {
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`抓取失败 ${page}: ${j.error.info}`);
  return j.parse.wikitext;
}

const norm = s => String(s || '').replace(/[\s，。；：、！？「」『』（）《》〈〉…—·．,.;:!?'"()\[\]]/g, '');

function similarity(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  // 任一为另一子串：好匹配（引文可能截断，维基可能更全或更简）
  if (nb.includes(na) || na.includes(nb)) return 0.95;
  const [short, long] = na.length < nb.length ? [na, nb] : [nb, na];
  let i = 0, matched = 0;
  for (const c of short) {
    const j = long.indexOf(c, i);
    if (j >= 0) { matched++; i = j + 1; }
  }
  return matched / short.length * (short.length / long.length);
}

// 加载已缓存的卷
function loadCachedParas(src) {
  const f = `${CACHE_DIR}/${src}.json`;
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

async function ensureCached(src) {
  if (loadCachedParas(src)) return true;
  const info = parseSource(src);
  if (!info) return false;
  console.log(`  抓取 ${src}...`);
  try {
    const wt = await fetchPage(info.page);
    const paras = parseWikitext(wt);
    // 存两版：segs 分离版（用于精确）和合并文本版（用于匹配二十四史混排引文）
    const texts = paras.map(p => p.segs.map(s => s.h.replace(/<[^>]+>/g, '')).join(''));
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(`${CACHE_DIR}/${src}.json`, JSON.stringify(texts));
    await new Promise(r => setTimeout(r, 800));
    return true;
  } catch (e) {
    console.error(`  失败 ${src}: ${e.message}`);
    return false;
  }
}

// 迁移单人全部条目（按人整批，带全量上下文）
// 即使只迁部分（如三国志+晋书），也列出该人全部条目（含未迁的后汉书），
// 确保每次处理都能检校人物内部资料的关联，不遗漏。
async function migratePerson(pid) {
  const history = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8'));
  const p = history.people[pid];
  if (!p) { console.log(`无 ${pid}`); return; }

  // 该人全部条目（含已迁移的，用于关联检校）
  const allItems = [];
  const todoItems = [];
  for (const field of ['facts', 'affiliations', 'hanOffices', 'appraisals']) {
    for (let i = 0; i < (p[field] || []).length; i++) {
      const it = p[field][i];
      if (!it.quote) continue;
      const src = Array.isArray(it.source) ? it.source[0] : it.source;
      allItems.push({ field, idx: i, src, quote: it.quote.slice(0, 50), migrated: !!it.wsMigrated });
      if (!it.wsMigrated && src && /^a0[345]-/.test(src)) {
        todoItems.push({ field, idx: i, src, quote: it.quote });
      }
    }
  }
  if (!todoItems.length) { console.log(`${pid}: 无待迁移`); return; }

  console.log(`${pid}: 共 ${allItems.length} 条（已迁 ${allItems.length - todoItems.length}，待迁 ${todoItems.length}）`);
  // 列出已迁条目供关联检校
  for (const it of allItems) {
    if (it.migrated) console.log(`  [已迁] ${it.field} ${it.src}: ${it.quote}...`);
  }

  // 确保所需卷已缓存
  const needed = [...new Set(todoItems.map(it => it.src))];
  for (const src of needed) {
    if (!await ensureCached(src)) {
      console.log(`  ${src} 抓取失败，跳过相关条目`);
    }
  }

  // 逐条匹配（同一人的全部条目在一次中处理）
  const review = [];
  let done = 0;
  for (const it of todoItems) {
    const texts = loadCachedParas(it.src);
    if (!texts) { review.push({ ...it, reason: '卷抓取失败' }); continue; }
    let best = -1, bestScore = 0;
    for (let pi = 0; pi < texts.length; pi++) {
      const s = similarity(it.quote, texts[pi]);
      if (s > bestScore) { bestScore = s; best = pi; }
    }
    const entry = history.people[pid][it.field][it.idx];
    if (bestScore >= 0.85) {
      entry.quote = texts[best];
      entry.wsMigrated = true;
      entry.wsSource = it.src;
      done++;
    } else {
      review.push({ ...it, score: bestScore.toFixed(2), quote: it.quote.slice(0, 60) });
    }
  }

  fs.writeFileSync(`${ROOT}/data/history.json`, JSON.stringify(history, null, 1));
  console.log(`${pid}: 迁移 ${done}/${todoItems.length}，待审 ${review.length}`);
  if (review.length) {
    const rf = `${ROOT}/data/migrate-review-${pid}.json`;
    fs.writeFileSync(rf, JSON.stringify(review, null, 1));
    console.log(`  待审写入 ${rf}`);
  }
}

const argPerson = process.argv.find(a => a.startsWith('--person='))?.split('=')[1];
if (argPerson) {
  await migratePerson(argPerson);
} else if (process.argv.includes('--fetch-all')) {
  const history = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8'));
  const srcs = new Set();
  for (const p of Object.values(history.people)) {
    for (const field of ['facts', 'affiliations', 'hanOffices', 'appraisals']) {
      for (const it of (p[field] || [])) {
        if (it.quote && !it.wsMigrated) {
          const src = Array.isArray(it.source) ? it.source[0] : it.source;
          if (src && /^a0[345]-/.test(src)) srcs.add(src);
        }
      }
    }
  }
  console.log(`共 ${srcs.size} 卷需缓存`);
  for (const src of srcs) await ensureCached(src);
  console.log('缓存完成');
} else {
  console.log('用法: --person=pXXXX | --fetch-all');
}
