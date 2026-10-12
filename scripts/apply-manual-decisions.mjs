// 应用用户 2026-10-12 人工核对 190 条的决定（重做版，带核验）
// 1. 明确弃掉 8 条；2. 9 条保留二十四史原样；3. 其余待审项换维基候选；4. 36 个多条组去重（p0196 未在确认清单，保留）
// 用法：node scripts/apply-manual-decisions.mjs [--dry-run]
import fs from 'node:fs';

const ROOT = '/home/hatch/workspace/sanguo';
const DRY = process.argv.includes('--dry-run');

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
const cache = {};
function texts(src) {
  if (!(src in cache)) {
    const f = `${ROOT}/data/ws-cache/${src}.json`;
    cache[src] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  }
  return cache[src];
}
function bestCandidate(quote, src) {
  const ts = texts(src);
  if (!ts) return null;
  let bi = -1, bs = 0;
  for (let i = 0; i < ts.length; i++) {
    const s = similarity(quote, ts[i]);
    if (s > bs) { bs = s; bi = i; }
  }
  return bi < 0 ? null : { text: ts[bi], score: bs };
}
const srcOf = it => { let s = it.source; return Array.isArray(s) ? s[0] : s; };

const history = JSON.parse(fs.readFileSync(`${ROOT}/data/history.json`, 'utf8'));
const P = history.people;
const review = JSON.parse(fs.readFileSync(`${ROOT}/data/migrate-review-batch.json`, 'utf8'));
const scoreOf = {}; // pid|field|src|quotePrefix -> score
for (const r of review) {
  if (r.reason) continue;
  const p = P[r.pid]; if (!p) continue;
  for (const it of (p[r.field] || [])) {
    if (srcOf(it) === r.src) {
      const k = `${r.pid}|${r.field}|${r.src}|${(it.quote||'').slice(0,30)}`;
      scoreOf[k] = parseFloat(r.score);
    }
  }
}
const getScore = (pid, field, src, it) => {
  const k = `${pid}|${field}|${src}|${(it.quote||'').slice(0,30)}`;
  if (k in scoreOf) return scoreOf[k];
  if (it.wsMigrated) return 0.95;
  return 0;
};

let nDiscard = 0, nReplace = 0, nDedupe = 0;
const log = [];

// ---------- 1. 明确弃掉 8 条 ----------
const discards = [
  ['p0014', 'affiliations', 'a05-003', null],
  ['p0018', 'affiliations', 'a04-009', '……淵為蜀所害'],  // 0.16 那条
  ['p0068', 'affiliations', 'a04-028', null],
  ['p0069', 'affiliations', 'a04-028', null],
  ['p0070', 'affiliations', 'a05-001', null],  // 3 条全弃
  ['p0083', 'affiliations', 'a04-029', null],
];
for (const [pid, field, src, prefix] of discards) {
  const arr = P[pid]?.[field] || [];
  const keep = [];
  for (const it of arr) {
    if (srcOf(it) === src && (!prefix || (it.quote||'').startsWith(prefix))) {
      nDiscard++;
      log.push(`弃 ${pid} ${field} ${src} ${(it.quote||'').slice(0,24)}`);
    } else keep.push(it);
  }
  P[pid][field] = keep;
}

// ---------- 2. 去重（36 组，p0196 保留待定夺）+ p0094 取一 ----------
// p0094 保留原样：去重但不换维基
const DEDUPE_GROUPS = [
  ['p0094','affiliations','a04-008', true],
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
const KEEP_ORIGINAL = new Set([
  'p0071|affiliations|a05-002', 'p0072|affiliations|a05-002',
  'p0073|affiliations|a05-037',
  'p0075|affiliations|a04-016', 'p0075|hanOffices|a04-016',
]);
const deduped = new Set(); // pid|field|src -> kept item ref info

for (const [pid, field, src, keepOriginal] of DEDUPE_GROUPS) {
  const arr = P[pid]?.[field] || [];
  const idxs = [];
  arr.forEach((it, i) => { if (srcOf(it) === src) idxs.push(i); });
  if (idxs.length <= 1) { log.push(`去重跳过 ${pid} ${field} ${src}: 仅 ${idxs.length} 条`); continue; }
  // 选保留项：分数最高（review 分数 / 已迁移 0.95），并列取原 idx 最小
  let bestIdx = idxs[0], bestScore = -1;
  for (const i of idxs) {
    const s = getScore(pid, field, src, arr[i]);
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  }
  const keep = [];
  arr.forEach((it, i) => {
    if (idxs.includes(i) && i !== bestIdx) {
      nDedupe++;
    } else keep.push(it);
  });
  P[pid][field] = keep;
  deduped.add(`${pid}|${field}|${src}`);
  log.push(`去重 ${pid} ${field} ${src}: ${idxs.length}→1（保留原idx ${bestIdx}，${keepOriginal ? '原文' : '维基'}）`);
}

// ---------- 3. 其余待审项：换维基候选 ----------
// 保留原样的：KEEP_ORIGINAL + p0094 组；已弃的已删；去重组已处理（保留项换维基除 p0094）
const reviewKeys = new Set(review.filter(r => !r.reason).map(r => `${r.pid}|${r.field}|${r.src}`));
for (const r of review) {
  if (r.reason) continue;
  const key = `${r.pid}|${r.field}|${r.src}`;
  if (KEEP_ORIGINAL.has(key)) continue;                    // 保留二十四史
  if (key === 'p0094|affiliations|a04-008') continue;      // p0094 保留原文
  const arr = P[r.pid]?.[r.field] || [];
  for (const it of arr) {
    if (srcOf(it) !== r.src) continue;
    if (it.wsMigrated) continue;                          // 已迁移
    const c = bestCandidate(it.quote, r.src);
    if (!c) { log.push(`无候选保留原文 ${key}`); continue; }
    it.quote = c.text;
    it.wsMigrated = true;
    it.wsSource = r.src;
    nReplace++;
  }
}

console.log(`弃 ${nDiscard} 条，去重 ${nDedupe} 条，换维基 ${nReplace} 条`);
if (!DRY) {
  fs.writeFileSync(`${ROOT}/data/history.json`, JSON.stringify(history, null, 1));
  console.log('已写盘');
} else {
  console.log('dry-run，未写盘');
}
// 抽查输出
for (const l of log.slice(0, 12)) console.log(' ', l);
console.log(`...（共 ${log.length} 条日志）`);
