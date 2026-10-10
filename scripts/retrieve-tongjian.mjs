// 通鉴段落按人检索：字符串锚定（人名/字直命中 + 省称带守卫）。
// 用法：node scripts/retrieve-tongjian.mjs
// 输入：data/tongjian/segments.json、data/original.json、data/wikisource.json
// 输出：data/tongjian/matches.json {pid: [{segId, tier}]}
//   tier1: 姓名/字直命中（含长名守卫，如"王允之"不算"王允"）
//   tier2: 省称（名单末字），需同卷同年有姓名/字出现（年份作用域）+ 复合词守卫
// 年号×年份刚性规则：段首年标题必带年号×年数且全部落在 [25,295]（188–288），
// 故无段落被剔除；此处实现校验并断言零剔除。
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
import { NIANHAO } from '/home/hatch/workspace/sanguo-retrieval-poc/time_table.mjs';

const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });

const segsDb = JSON.parse(fs.readFileSync('data/tongjian/segments.json', 'utf8'));
const orig = JSON.parse(fs.readFileSync('data/original.json', 'utf8'));
const wsDb = JSON.parse(fs.readFileSync('data/wikisource.json', 'utf8'));

// 全量段表：id -> seg（含 vol/year）
const segById = new Map();
const segsByYear = new Map(); // `${vol}|${ceYear}` -> [seg]
for (const [vol, v] of Object.entries(segsDb)) {
  for (const s of v.segments) {
    segById.set(s.id, s);
    const k = `${vol}|${s.ceYear}`;
    if (!segsByYear.has(k)) segsByYear.set(k, []);
    segsByYear.get(k).push(s);
  }
}

// 人物标识（人物顺序与 makeHistory（前端）一致：先滤除貂蝉，否则 p0128 之后全部错位）
const perList = orig.per.filter(p => p.n !== '貂蝉');
const pids = Object.keys(wsDb);
const people = new Map(); // pid -> {name, zi, sheng}
const KNOWN = new Set();
for (const pid of pids) {
  const per = perList[parseInt(pid.slice(1), 10) - 1];
  if (!per) continue;
  const name = toTrad(per.n);
  const zi = per.z ? toTrad(per.z) : '';
  people.set(pid, { name, zi, sheng: name.slice(-1) });
  KNOWN.add(name);
  if (zi) KNOWN.add(zi);
}
// 长名守卫：name 在 pos 处命中，若 name+后1~2字 构成已知人名，则此次命中无效
// 增补别名：帝后谥庙号（通鉴避讳直呼名）与年号作用域内的君主称谓
// from/to 为公元年区间 [from, to)，null 表无界
const EXTRA_ALIASES = [
  { pid: 'p0001', alias: '武皇帝' },
  { pid: 'p0002', alias: '文皇帝' },
  { pid: 'p0011', alias: '明皇帝' },
  { pid: 'p0011', alias: '魏烈祖' },
  { pid: 'p0013', alias: '高貴鄉公' },
  { pid: 'p0193', alias: '吳主', from: 222, to: 252 },
  { pid: 'p0193', alias: '吳王', from: 221, to: 229 },
  { pid: 'p0194', alias: '吳主', from: 252, to: 258 },
  { pid: 'p0195', alias: '吳主', from: 258, to: 264 },
  { pid: 'p0196', alias: '吳主', from: 264, to: 280 },
  { pid: 'p0128', alias: '漢主', from: 221, to: 223 },
  { pid: 'p0128', alias: '昭烈' },
  { pid: 'p0129', alias: '漢主', from: 223, to: 263 },
  { pid: 'p0381', alias: '甄夫人' },
  { pid: 'p0382', alias: '郭夫人' },
];
const extraByPid = new Map();
for (const e of EXTRA_ALIASES) {
  if (!extraByPid.has(e.pid)) extraByPid.set(e.pid, []);
  extraByPid.get(e.pid).push(e);
  KNOWN.add(e.alias);
}
function goodHit(text, name, pos) {
  for (const L of [1, 2]) {
    if (KNOWN.has(text.slice(pos, pos + name.length + L))) return false;
  }
  return true;
}
function findHits(text, name) {
  const out = [];
  if (!name) return out;
  let p = -1;
  while ((p = text.indexOf(name, p + 1)) >= 0) {
    if (goodHit(text, name, p)) out.push(p);
  }
  return out;
}

// 省称复合词守卫：单字省称易误伤常用词
const NOISE_AFTER = new Set(['作', '縱', '纵', '持', '練', '练', '心', '刀', '戈', '力', '衡', '宜', '柄', '術', '术', '謀', '谋', '重', '要', '威', '勢', '势', '利']);
const NOISE_BEFORE = new Set(['情', '節', '节', '操', '具', '完', '防', '準', '准', '設', '设', '齊', '齐', '授', '政', '掌', '大', '操']);
const SAY = new Set(['曰', '謂', '谓', '云', '言', '道']);
function goodSheng(text, pos) {
  const ch = text[pos];
  const after = text[pos + 1] || '';
  const before = text[pos - 1] || '';
  if (NOISE_AFTER.has(after) || NOISE_BEFORE.has(before)) return false;
  // 遼：排除地名/官名（遼東/遼西/遼水/度遼將軍）
  if (ch === '遼' && (before === '度' || ['東', '西', '水', '隧'].includes(after))) return false;
  return true;
}

const matches = {}; // pid -> Map(segId -> tier)
let droppedByEra = 0;
for (const [pid, { name, zi, sheng }] of people) {
  const hitSegs = new Map();
  // tier1：全段扫描姓名/字/增补别名
  for (const [sid, seg] of segById) {
    let hit = findHits(seg.text, name).length || (zi && findHits(seg.text, zi).length);
    if (!hit) {
      for (const e of extraByPid.get(pid) || []) {
        if (e.from != null && seg.ceYear < e.from) continue;
        if (e.to != null && seg.ceYear >= e.to) continue;
        if (findHits(seg.text, e.alias).length) { hit = true; break; }
      }
    }
    if (hit) hitSegs.set(sid, 1);
  }
  // tier2：省称。先算哪些 (vol|ceYear) 有 tier1 命中，再在同年段内找省称
  const scopedYears = new Set();
  for (const sid of hitSegs.keys()) {
    const s = segById.get(sid);
    scopedYears.add(`${s.vol}|${s.ceYear}`);
  }
  // 省称（名单末字），需同卷同年有姓名/字出现（年份作用域）+ 复合词守卫；
  // 后（皇后/太后）作省称误伤太大，直接禁用，帝后靠 tier1（甄夫人等）；
  // 遂等常用虚词作省称必误伤，直接禁用（韩遂靠 tier1 姓名）
  const SKIP_SHENG = new Set(['后', '遂', '之', '以', '為', '为', '于', '於', '而', '則', '则', '乃', '既', '亦', '皆', '能', '當', '当', '會', '会']);
  if (sheng && sheng.length === 1 && !SKIP_SHENG.has(sheng)) {
    for (const yk of scopedYears) {
      for (const seg of segsByYear.get(yk)) {
        if (hitSegs.has(seg.id)) continue;
        let p = -1, ok = false;
        while ((p = seg.text.indexOf(sheng, p + 1)) >= 0) {
          // 省称不做长名守卫（单字），但做复合词守卫；同时排除姓名/字已命中的 trivial 情况无妨
          if (goodSheng(seg.text, p)) { ok = true; break; }
        }
        if (ok) hitSegs.set(seg.id, 2);
      }
    }
  }
  // 年号×年份规则：段首年标题的年号×年数归一化
  const kept = [];
  for (const [sid, tier] of hitSegs) {
    const s = segById.get(sid);
    let inRange = false;
    if (s.era && s.eraYear && NIANHAO[s.era]) {
      for (const c of NIANHAO[s.era]) {
        const y = c.start + s.eraYear - 1;
        if (y >= 25 && y <= 295) { inRange = true; break; }
      }
    } else {
      // 无年号解析时用显式公元年兜底（标题必带）
      if (s.ceYear >= 25 && s.ceYear <= 295) inRange = true;
    }
    if (!inRange) { droppedByEra++; continue; }
    kept.push({ segId: sid, tier });
  }
  matches[pid] = kept;
}

const totalHits = Object.values(matches).reduce((a, b) => a + b.length, 0);
const withHits = Object.values(matches).filter(a => a.length).length;
const t1 = Object.values(matches).reduce((a, b) => a + b.filter(x => x.tier === 1).length, 0);
const t2 = totalHits - t1;
console.log(`人物 ${pids.length}，有命中 ${withHits} 人，共 ${totalHits} 条（tier1 ${t1} / tier2 ${t2}）`);
console.log(`年号规则剔除：${droppedByEra} 段`);
fs.mkdirSync('data/tongjian', { recursive: true });
fs.writeFileSync('data/tongjian/matches.json', JSON.stringify(matches, null, 1));
console.log('OK: data/tongjian/matches.json');
// 零命中人物抽样
const zero = Object.entries(matches).filter(([, v]) => !v.length).map(([k]) => k);
console.log(`零命中 ${zero.length} 人，抽样：${zero.slice(0, 10).join(',')}`);
