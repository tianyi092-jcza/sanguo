// 生成 data/wikisource-overrides.json（考據引文维基迁移 + 2026-10-12 人工核对决定的持久化层）
// 背景：data/history.json 是构建产物（build.mjs 从源数据重生成），直接改它会被构建覆盖。
// 本脚本在 pristine 的 history.json 上执行迁移与人工决定，输出 overrides 文件；
// 构建时由 scripts/wikisource-overrides.mjs 的 applyWikisourceOverrides(history) 应用。
// 用法：node scripts/build-wikisource-overrides.mjs
// 输出：data/wikisource-overrides.json
//   { replacements: [{pid,field,src,orig,new,wsSource}], deletions: [{pid,field,src,orig}] }
//   orig = 原引文全文（精确定位），new = 维基引文全文。应用顺序：先 deletions 后 replacements。
import fs from 'node:fs';
import { parseWikitext } from './fetch-wikisource.mjs';

const ROOT = '/home/hatch/workspace/sanguo';
const CACHE_DIR = `${ROOT}/data/ws-cache`;
const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';

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
const cache = {};
function loadCached(src) {
  if (!(src in cache)) {
    const f = `${CACHE_DIR}/${src}.json`;
    cache[src] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  }
  return cache[src];
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
function bestCandidate(quote, src) {
  const ts = loadCached(src);
  if (!ts) return null;
  let bi = -1, bs = 0;
  for (let i = 0; i < ts.length; i++) {
    const s = similarity(quote, ts[i]);
    if (s > bs) { bs = s; bi = i; }
  }
  return bi < 0 ? null : { text: ts[bi], score: bs };
}

const srcOf = it => { let s = it.source; return Array.isArray(s) ? s[0] : s; };
// 注：appraisals（评曰）不参与迁移——其引文为精心剪辑的 fragments 拼合（check-appraisals.mjs 有硬编码校验），
// 全文替换会破坏其结构。评曰迁移需另立专项（重定 fragments + 更新校验）。
const FIELDS = ['facts', 'affiliations', 'hanOffices'];

// ---------- 用户人工决定（2026-10-12 已核验） ----------
// 用户原话"弃"的 8 条中，仅 p0018-0.16 是真正重复（可安全删除）。
// 其余 7 条实为时间轴 segment（删除会破坏人物时间轴与构建校验），
// 且用户本意多为"不迁移"而非"删除数据"，故改为不迁移、保留原文，并报告待用户复核。
// （p0068/p0069"与人物无关"为上游归属错误，需另修 curation，此处仅标记。）
const DISCARDS = [ // [pid, field, src, quotePrefix|null]，真正删除
  ['p0018', 'affiliations', 'a04-009', '……淵為蜀所害'],
];
const EXCLUDE_FROM_MIGRATION = new Set([ // 不迁移、保留原文（原"弃"单中除 p0018 外的）
  'p0014|affiliations|a05-003',
  'p0068|affiliations|a04-028', 'p0069|affiliations|a04-028',
  'p0070|affiliations|a05-001',
  'p0083|affiliations|a04-029',
]);
const KEEP_ORIGINAL = new Set([ // 保留二十四史原样：不迁移、不替换、不去重
  'p0071|affiliations|a05-002', 'p0072|affiliations|a05-002',
  'p0073|affiliations|a05-037',
  'p0075|affiliations|a04-016', 'p0075|hanOffices|a04-016',
  'p0094|affiliations|a04-008',
]);
const DEDUPE_GROUPS = [ // [pid, field, src]，每组保留 1 条（p0196 未在确认清单，保留；p0094 取一后保留原文）
  ['p0094','affiliations','a04-008'],
  ['p0118','affiliations','a04-008'],['p0127','affiliations','a04-032'],
  ['p0129','affiliations','a04-035'],['p0138','affiliations','a04-038'],
  ['p0147','affiliations','a04-039'],['p0149','affiliations','a04-039'],
  ['p0160','affiliations','a04-041'],['p0161','affiliations','a04-041'],
  ['p0172','affiliations','a04-043'],['p0176','affiliations','a04-044'],
  ['p0182','affiliations','a04-042'],['p0188','affiliations','a04-041'],
  ['p0189','affiliations','a04-041'],['p0191','affiliations','a04-046'],
  ['p0198','affiliations','a04-049'],['p0199','affiliations','a04-049'],
  ['p0200','affiliations','a04-052'],['p0201','affiliations','a04-053'],
  ['p0236','affiliations','a04-057'],['p0241','affiliations','a04-061'],
  ['p0243','affiliations','a04-062'],['p0262','affiliations','a05-034'],
  ['p0263','facts','a05-034'],['p0263','affiliations','a05-034'],
  ['p0269','affiliations','a03-035'],['p0291','affiliations','a03-074'],
  ['p0311','affiliations','a04-049'],['p0345','affiliations','a04-046'],
  ['p0378','affiliations','a05-036-full'],['p0381','affiliations','a04-005'],
  ['p0386','affiliations','a04-051'],['p0410','affiliations','a04-044'],
  ['p0426','affiliations','a03-050-full'],['p0427','affiliations','a04-046'],
  ['p0471','affiliations','a05-003'],
];

const history = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8'));
const P = history.people;

// 预缓存
const needed = new Set();
for (const p of Object.values(P)) for (const f of FIELDS) for (const it of (p[f] || [])) {
  const src = srcOf(it);
  if (it.quote && src && /^a0[345]-/.test(src)) needed.add(src);
}
for (const src of needed) await ensureCached(src);

// 收集条目引用（用于删除标记）
const refs = []; // {pid, field, idx, it}
for (const [pid, p] of Object.entries(P)) for (const f of FIELDS) {
  (p[f] || []).forEach((it, idx) => refs.push({ pid, field: f, idx, it }));
}
const byKey = new Map(refs.map(r => [`${r.pid}|${r.field}|${r.idx}`, r]));
const deleted = new Set(); // ref keys
const replacements = [];   // {pid,field,src,orig,new,wsSource}
const deletions = [];      // {pid,field,src,orig}
const replacedOrigKeys = new Set();

function emitReplacement(pid, field, src, origQuote, newQuote) {
  const k = `${pid}|${field}|${src}|${origQuote}`;
  if (replacedOrigKeys.has(k)) return;
  replacedOrigKeys.add(k);
  replacements.push({ pid, field, src, orig: origQuote, new: newQuote, wsSource: src });
}
function emitDeletion(pid, field, src, origQuote) {
  deletions.push({ pid, field, src, orig: origQuote });
}

// 1. 自动迁移（阈值 0.75）：记录替换
let nAuto = 0;
for (const r of refs) {
  const src = srcOf(r.it);
  if (!r.it.quote || !src || !/^a0[345]-/.test(src)) continue;
  if (KEEP_ORIGINAL.has(`${r.pid}|${r.field}|${src}`)) continue;
  if (EXCLUDE_FROM_MIGRATION.has(`${r.pid}|${r.field}|${src}`)) continue;
  const c = bestCandidate(r.it.quote, src);
  if (c && c.score >= 0.75) {
    emitReplacement(r.pid, r.field, src, r.it.quote, c.text);
    r.migrated = true;
    nAuto++;
  }
}
console.log(`自动迁移 ${nAuto} 条`);

// 2. 弃掉
let nDiscard = 0;
for (const [pid, field, src, prefix] of DISCARDS) {
  for (const r of refs) {
    if (deleted.has(`${r.pid}|${r.field}|${r.idx}`)) continue;
    if (r.pid === pid && r.field === field && srcOf(r.it) === src &&
        (!prefix || (r.it.quote || '').startsWith(prefix))) {
      emitDeletion(pid, field, src, r.it.quote);
      deleted.add(`${r.pid}|${r.field}|${r.idx}`);
      nDiscard++;
    }
  }
}
console.log(`弃 ${nDiscard} 条`);

// 3. 去重：只删除真正重复的条目（迁移后引文完全相同的才算重复）。
//    用户逐条明确指示取一的 p0094 / p0291 按指示执行（即使引文不同），其余组内引文不同的予以保留并报告。
//    p0196 未在用户确认清单中，直接保留。
const EXPLICIT_KEEP_ONE = new Set(['p0094|affiliations|a04-008', 'p0291|affiliations|a03-074']);
let nDedupe = 0;
const keptDistinctGroups = [];
for (const [pid, field, src] of DEDUPE_GROUPS) {
  const group = refs.filter(r =>
    !deleted.has(`${r.pid}|${r.field}|${r.idx}`) &&
    r.pid === pid && r.field === field && srcOf(r.it) === src);
  if (group.length <= 1) continue;
  const gkey = `${pid}|${field}|${src}`;
  // 按原文引文聚类：归一化后完全相同的才算重复（低分候选常误配，不可据此聚类）
  if (EXPLICIT_KEEP_ONE.has(gkey)) {
    // 用户明确指示取一：保留候选分数最高者
    let best = group[0], bestScore = -1;
    for (const r of group) {
      const s = r.migrated ? 0.95 : (bestCandidate(r.it.quote, src)?.score ?? 0);
      if (s > bestScore) { bestScore = s; best = r; }
    }
    for (const r of group) {
      if (r === best) continue;
      emitDeletion(pid, field, src, r.it.quote);
      deleted.add(`${r.pid}|${r.field}|${r.idx}`);
      nDedupe++;
    }
    // 保留项：p0094 保留原文；p0291 换维基（如有候选）
    if (gkey !== 'p0094|affiliations|a04-008' && !best.migrated) {
      const c = bestCandidate(best.it.quote, src);
      if (c) { emitReplacement(pid, field, src, best.it.quote, c.text); best.migrated = true; }
    }
    continue;
  }
  // 按原文引文聚类：归一化后完全相同的才算重复
  const clusters = new Map();
  for (const r of group) {
    const k = norm(r.it.quote);
    if (!clusters.has(k)) clusters.set(k, []);
    clusters.get(k).push(r);
  }
  let groupDel = 0;
  for (const members of clusters.values()) {
    if (members.length <= 1) continue;
    let best = members[0], bestScore = -1;
    for (const r of members) {
      const s = r.migrated ? 0.95 : (bestCandidate(r.it.quote, src)?.score ?? 0);
      if (s > bestScore) { bestScore = s; best = r; }
    }
    for (const r of members) {
      if (r === best) continue;
      emitDeletion(pid, field, src, r.it.quote);
      deleted.add(`${r.pid}|${r.field}|${r.idx}`);
      nDedupe++; groupDel++;
    }
    if (!best.migrated) {
      const c = bestCandidate(best.it.quote, src);
      if (c) { emitReplacement(pid, field, src, best.it.quote, c.text); best.migrated = true; }
    }
  }
  if (groupDel === 0) keptDistinctGroups.push(`${pid} ${field} ${src}（${group.length} 条引文互不相同，全部保留）`);
}
console.log(`去重 ${nDedupe} 条`);
if (keptDistinctGroups.length) {
  console.log(`以下 ${keptDistinctGroups.length} 组引文互不相同，未删除，待用户复核：`);
  for (const g of keptDistinctGroups) console.log('  保留 ' + g);
}

// 4. 其余待审项：换维基候选（有缓存才换）
let nReplace = 0;
for (const r of refs) {
  if (deleted.has(`${r.pid}|${r.field}|${r.idx}`) || r.migrated) continue;
  const src = srcOf(r.it);
  if (!r.it.quote || !src || !/^a0[345]-/.test(src)) continue;
  if (KEEP_ORIGINAL.has(`${r.pid}|${r.field}|${src}`)) continue;
  if (EXCLUDE_FROM_MIGRATION.has(`${r.pid}|${r.field}|${src}`)) continue;
  const c = bestCandidate(r.it.quote, src);
  if (!c || c.score < 0.5) continue; // 低分候选不可靠，需人工确认才替换
  emitReplacement(r.pid, r.field, src, r.it.quote, c.text);
  r.migrated = true;
  nReplace++;
}
console.log(`人工确认替换 ${nReplace} 条`);

const out = {
  version: 1,
  generated: new Date().toISOString(),
  note: '考據引文维基迁移 + 2026-10-12 人工核对决定；构建时按序应用：先 deletions 后 replacements',
  replacements,
  deletions,
};
fs.writeFileSync(`${ROOT}/data/wikisource-overrides.json`, JSON.stringify(out));
console.log(`写入 data/wikisource-overrides.json：替换 ${replacements.length}，删除 ${deletions.length}`);
