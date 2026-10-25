// 晉書段落按人检索：字符串锚定（人名/字直命中 + 省称带守卫），方法与 retrieve-tongjian.mjs 一致。
// 用法：node scripts/retrieve-jinshu.mjs
// 输入：data/jinshu/segments.json、data/original.json、data/wikisource.json、data/wikisource-skip.json
// 输出：data/jinshu/matches.json {pid: [{segId, tier}]}
//   tier1: 姓名/字直命中（含长名守卫，如"王允之"不算"王允"）+ 卷作用域别名（谥号，如卷一「宣帝」=司馬懿）
//   tier2: 省称（名单末字），需同卷有姓名/字出现（卷作用域）+ 复合词守卫
// 匹配在归一化文本上进行（异体字归一化仅影响命中判定，展示文本保持原文；
// 于姓经 OpenCC 转写为「於」，另搜「于」形）——与 retrieve-tongjian.mjs 同规。
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';

const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });

const VARIANTS = { '羣': '群', '醜': '丑', '脩': '修', '勛': '勳', '叡': '睿', '卲': '邵', '衞': '衛', '种': '種' };
const normMatch = s => [...s].map(c => VARIANTS[c] || c).join('');
function nameForms(name) {
  const forms = [name];
  if (name.startsWith('於')) forms.push('于' + name.slice(1));
  return forms;
}

const segsDb = JSON.parse(fs.readFileSync('data/jinshu/segments.json', 'utf8'));
for (const v of Object.values(segsDb)) for (const s of v.segments) s.ntext = normMatch(s.text);
const orig = JSON.parse(fs.readFileSync('data/original.json', 'utf8'));

// 全量段表
const segById = new Map();
const segsByVol = new Map(); // vol -> [seg]
for (const [vol, v] of Object.entries(segsDb)) {
  for (const s of v.segments) {
    segById.set(s.id, s);
    if (!segsByVol.has(vol)) segsByVol.set(vol, []);
    segsByVol.get(vol).push(s);
  }
}

// 人物标识（人物顺序与 makeHistory（前端）一致：先滤除貂蝉，否则 p0128 之后全部错位）
const perList = orig.per.filter(p => p.n !== '貂蝉');
const wsDb = JSON.parse(fs.readFileSync('data/wikisource.json', 'utf8'));
const skipDb = JSON.parse(fs.readFileSync('data/wikisource-skip.json', 'utf8'));
const pids = [...new Set([...Object.keys(wsDb), ...Object.keys(skipDb)])];
const people = new Map();
const KNOWN = new Set();
for (const pid of pids) {
  const per = perList[parseInt(pid.slice(1), 10) - 1];
  if (!per) continue;
  const name = normMatch(toTrad(per.n));
  const zi = per.z ? normMatch(toTrad(per.z)) : '';
  people.set(pid, { name, zi, sheng: name.slice(-1) });
  for (const f of nameForms(name)) KNOWN.add(f);
  if (zi) KNOWN.add(zi);
}

// 卷作用域别名：帝纪卷内以谥号指称本紀皇帝（卷一「宣帝」专指司馬懿，卷二「景帝/文帝」分指司馬師/司馬昭）
const VOL_ALIASES = [
  { pid: 'p0070', alias: '宣帝', vols: ['001'] },
  { pid: 'p0071', alias: '景帝', vols: ['002'] },
  { pid: 'p0072', alias: '文帝', vols: ['002'] },
];
const aliasByPid = new Map();
for (const e of VOL_ALIASES) {
  if (!aliasByPid.has(e.pid)) aliasByPid.set(e.pid, []);
  aliasByPid.get(e.pid).push(e);
  KNOWN.add(e.alias);
}
// 全书别名：晉書称魏帝多用「魏+谥号」，字符串本身无歧义，全书作用域
const GLOBAL_ALIASES = [
  { pid: 'p0001', alias: '魏武帝' },
  { pid: 'p0002', alias: '魏文帝' },
  { pid: 'p0011', alias: '魏明帝' },
  { pid: 'p0013', alias: '高貴鄉公' },
];
const globalAliasByPid = new Map();
for (const e of GLOBAL_ALIASES) {
  if (!globalAliasByPid.has(e.pid)) globalAliasByPid.set(e.pid, []);
  globalAliasByPid.get(e.pid).push(e);
  KNOWN.add(e.alias);
}

// 命中排除（与通鉴同规）：「平原王叡」非王睿；「淵與子脩」是公孫脩非曹昂（晉書卷一宣帝紀有公孫淵事）
const HIT_EXCLUDES = [{ pid: 'p0428', before: '平原' }, { pid: 'p0358', before: '淵與' }];
function filterExcluded(seg, pid, positions) {
  let out = positions;
  for (const ex of HIT_EXCLUDES) {
    if (ex.pid !== pid) continue;
    out = out.filter(pos => seg.ntext.slice(pos - ex.before.length, pos) !== ex.before);
  }
  return out;
}

// 长名守卫：name 在 pos 处命中，若 name+后1~2字 构成已知人名，则此次命中无效
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
function nameHit(seg, pid, name) {
  return filterExcluded(seg, pid, nameForms(name).flatMap(f => findHits(seg.ntext, f))).length > 0;
}
function ziHit(seg, pid, zi) {
  return filterExcluded(seg, pid, findHits(seg.ntext, zi)).length > 0;
}

// 省称复合词守卫（与通鉴同规）
const NOISE_AFTER = new Set(['作', '縱', '纵', '持', '練', '练', '心', '刀', '戈', '力', '衡', '宜', '柄', '術', '术', '謀', '谋', '重', '要', '威', '勢', '势', '利', '束', '守']);
const NOISE_BEFORE = new Set(['情', '節', '节', '操', '具', '完', '防', '準', '准', '設', '设', '齊', '齐', '授', '政', '掌', '大', '操']);
function goodSheng(text, pos) {
  const ch = text[pos];
  const after = text[pos + 1] || '';
  const before = text[pos - 1] || '';
  if (NOISE_AFTER.has(after) || NOISE_BEFORE.has(before)) return false;
  if (ch === '遼' && (before === '度' || ['東', '西', '水', '隧'].includes(after))) return false;
  return true;
}

// 全语料字频（归一化文本，供 tier2 省称字频门槛）
const charFreq = new Map();
for (const seg of segById.values()) {
  for (const ch of seg.ntext) charFreq.set(ch, (charFreq.get(ch) || 0) + 1);
}
const SHENG_FREQ_MAX = 250;

const matches = {};
for (const [pid, { name, zi, sheng }] of people) {
  const hitSegs = new Map();
  // tier1：全段扫描姓名/字
  for (const [sid, seg] of segById) {
    if (nameHit(seg, pid, name) || (zi && ziHit(seg, pid, zi))) hitSegs.set(sid, 1);
  }
  // tier1b：卷作用域别名 + 全书别名
  for (const e of aliasByPid.get(pid) || []) {
    for (const vol of e.vols) {
      for (const seg of segsByVol.get(vol) || []) {
        if (findHits(seg.ntext, normMatch(e.alias)).length) hitSegs.set(seg.id, 1);
      }
    }
  }
  for (const e of globalAliasByPid.get(pid) || []) {
    for (const seg of segById.values()) {
      if (findHits(seg.ntext, normMatch(e.alias)).length) hitSegs.set(seg.id, 1);
    }
  }
  // tier2：省称。作用域 = 同卷且距某个 tier1 段不超过 8 段（卷内可含多篇列传，
  // 全卷作用域太宽；窗口近似通鉴的同年作用域粒度）。
  // 另加字频门槛：省称字在全语料出现 >250 次者多为常用词素（師/尚/平/興…，
  // 如王師、尚書、長平），误伤率过高，禁用其省称（宁错过，不摘无关）。
  const WINDOW = 8;
  const anchorsByVol = new Map(); // vol -> [段序]
  for (const sid of hitSegs.keys()) {
    const s = segById.get(sid);
    if (!anchorsByVol.has(s.vol)) anchorsByVol.set(s.vol, []);
    anchorsByVol.get(s.vol).push(parseInt(sid.slice(-3), 10));
  }
  const SKIP_SHENG = new Set(['后', '遂', '之', '以', '為', '为', '于', '於', '而', '則', '则', '乃', '既', '亦', '皆', '能', '當', '当', '會', '会']);
  if (sheng && sheng.length === 1 && !SKIP_SHENG.has(sheng) && (charFreq.get(sheng) || 0) <= SHENG_FREQ_MAX) {
    for (const [vol, anchors] of anchorsByVol) {
      for (const seg of segsByVol.get(vol)) {
        if (hitSegs.has(seg.id)) continue;
        const idx = parseInt(seg.id.slice(-3), 10);
        if (!anchors.some(a => Math.abs(a - idx) <= WINDOW)) continue;
        let p = -1, ok = false;
        while ((p = seg.ntext.indexOf(sheng, p + 1)) >= 0) {
          if (goodSheng(seg.ntext, p)) { ok = true; break; }
        }
        if (ok) hitSegs.set(seg.id, 2);
      }
    }
  }
  matches[pid] = [...hitSegs.entries()].map(([segId, tier]) => ({ segId, tier }));
}

const totalHits = Object.values(matches).reduce((a, b) => a + b.length, 0);
const withHits = Object.values(matches).filter(a => a.length).length;
const t1 = Object.values(matches).reduce((a, b) => a + b.filter(x => x.tier === 1).length, 0);
console.log(`人物 ${pids.length}，有命中 ${withHits} 人，共 ${totalHits} 条（tier1 ${t1} / tier2 ${totalHits - t1}）`);
fs.mkdirSync('data/jinshu', { recursive: true });
fs.writeFileSync('data/jinshu/matches.json', JSON.stringify(matches, null, 1));
console.log('OK: data/jinshu/matches.json');
const zero = Object.entries(matches).filter(([, v]) => !v.length).map(([k]) => k);
console.log(`零命中 ${zero.length} 人，抽样：${zero.slice(0, 10).join(',')}`);
for (const pid of ['p0070', 'p0071', 'p0072', 'p0073', 'p0074']) {
  console.log(`${pid} 命中 ${(matches[pid] || []).length} 条`);
}
