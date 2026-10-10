/* PoC：从三国志/晋书/通鉴抽取（人物，职官，地点），范围：荆州刺史/牧 + 长沙/南郡/江夏太守
 * 用法：node scripts/extract-offices-poc.mjs
 * 输出：output/offices-poc.json + 控制台样本
 */
import fs from 'node:fs';
import { makeHistory } from './history.mjs';
import { NIANHAO } from '/home/hatch/workspace/sanguo-retrieval-poc/time_table.mjs';

const { data } = makeHistory(JSON.parse(fs.readFileSync('data/original.json', 'utf8')));
const name2id = new Map();
for (const p of data.per) {
  name2id.set(p.n, p.id);
  if (p.z && p.z.length >= 2) name2id.set(p.z, p.id);
}
// 按长度降序，匹配时优先长名
const names = [...name2id.keys()].sort((a, b) => b.length - a.length);

// PoC 地点
const PLACES = [
  { id: '荆州', label: '荆州', kind: 'zhou', offices: ['刺史', '牧'] },
  { id: '长沙郡', label: '长沙郡', kind: 'jun', offices: ['太守'] },
  { id: '南郡', label: '南郡', kind: 'jun', offices: ['太守'] },
  { id: '江夏郡', label: '江夏郡', kind: 'jun', offices: ['太守'] },
];
const placeByBare = new Map();
for (const pl of PLACES) {
  const bare = pl.id.replace(/(郡|州)$/, '');
  placeByBare.set(bare, pl);
  placeByBare.set(pl.id, pl);
}
const bareNames = [...placeByBare.keys()].sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const VERB = '(?:拜|除|遷|轉|徙|出為|為|領|行|署|表|以|授)';
const officePat = new RegExp(`${VERB}([^，。；：、]{0,12}?)(${bareNames})(太守|刺史|牧)`, 'g');

// 年号解析
const NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
function parseNum(s) {
  if (s === '元') return 1;
  let v = 0, tmp = 0;
  for (const ch of s) {
    if (ch === '十') { tmp = tmp || 1; v += tmp * 10; tmp = 0; }
    else if (NUM[ch]) tmp = NUM[ch];
  }
  return v + tmp;
}
const nianhaoNames = Object.keys(NIANHAO).sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const nhPat = new RegExp(`(${nianhaoNames})(元|[一二三四五六七八九十]+)年`, 'g');
function extractYear(text, beforeIdx) {
  const sub = text.slice(0, beforeIdx);
  let m, last = null;
  nhPat.lastIndex = 0;
  while ((m = nhPat.exec(sub))) last = m;
  if (!last) return { year: null, label: null };
  const cands = NIANHAO[last[1]];
  const n = parseNum(last[2]);
  // 优先 180-270 范围内的候选
  let best = null;
  for (const c of cands) {
    const y = c.start + n - 1;
    if (y >= 180 && y <= 270) { best = { year: y, label: `${last[1]}${last[2]}年` }; break; }
  }
  if (!best && cands.length) best = { year: cands[0].start + n - 1, label: `${last[1]}${last[2]}年` };
  return best;
}

function nearestPerson(text, beforeIdx) {
  let best = null;
  for (const nm of names) {
    const i = text.lastIndexOf(nm, beforeIdx - 1);
    if (i >= 0 && (!best || i > best.i)) best = { i, nm, id: name2id.get(nm) };
  }
  return best;
}

function sentenceOf(text, idx) {
  const parts = text.split(/(?<=[。！？；])/);
  let pos = 0;
  for (const s of parts) {
    if (idx >= pos && idx < pos + s.length) return s.slice(0, 160);
    pos += s.length;
  }
  return text.slice(Math.max(0, idx - 60), idx + 60);
}

const results = []; // {place, office, personId, person, year, yearLabel, quote, source}
const seen = new Set();

function addHit(place, office, personId, person, year, yearLabel, quote, source) {
  if (year !== null && (year < 184 || year > 265)) return;
  const key = `${place.id}|${office}|${personId}`;
  if (seen.has(key)) return;
  seen.add(key);
  results.push({ place: place.id, placeLabel: place.label, kind: place.kind, office, personId, person, year, yearLabel, quote, source });
}

function scanText(text, source, sectionPerson) {
  officePat.lastIndex = 0;
  let m;
  while ((m = officePat.exec(text))) {
    const bare = m[2], office = m[3];
    const place = placeByBare.get(bare);
    if (!place || !place.offices.includes(office)) continue;
    // 排除误伤：职官前是"长"等（大长秋）——太守/刺史/牧已限定，跳过"都督"等
    const np = nearestPerson(text, m.index) || sectionPerson;
    if (!np) continue;
    const { year, label } = extractYear(text, m.index);
    addHit(place, office, np.id, np.nm, year, label, sentenceOf(text, m.index), source);
  }
}

// 三国志/晋书语料
const files = fs.readdirSync('data/sources').filter(f => /^a0[45]-.*\.json$/.test(f) && !/-ahcb\.json$/.test(f) && !/-full\.json$/.test(f));
for (const f of files.sort()) {
  const d = JSON.parse(fs.readFileSync('data/sources/' + f, 'utf8'));
  const paras = d.paragraphs || [];
  let sectionPerson = null;
  for (const p of paras) {
    const t = typeof p === 'string' ? p : (p.text || '');
    if (!t) continue;
    const hm = t.match(/^(.{1,8})(傳|紀|志)$/);
    if (hm && !/[，。；：、曰]/g.test(t)) {
      const nm = hm[1];
      sectionPerson = name2id.has(nm) ? { nm, id: name2id.get(nm) } : null;
      continue;
    }
    scanText(t, { corpus: f, title: d.title || '' }, sectionPerson);
  }
}

// 通鉴
const tjSegs = JSON.parse(fs.readFileSync('data/tongjian/segments.json', 'utf8'));
for (const [vol, v] of Object.entries(tjSegs)) {
  for (const s of v.segments) {
    const text = (s.text || '').replace(/<[^>]+>/g, '');
    if (!text) continue;
    officePat.lastIndex = 0;
    let m;
    while ((m = officePat.exec(text))) {
      const bare = m[2], office = m[3];
      const place = placeByBare.get(bare);
      if (!place || !place.offices.includes(office)) continue;
      const np = nearestPerson(text, m.index);
      if (!np) continue;
      const year = s.ceYear || null;
      addHit(place, office, np.id, np.nm, year, year ? `${year}年` : null, sentenceOf(text, m.index), { corpus: `tongjian-${vol}`, segId: s.id, url: v.url });
    }
  }
}

fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/offices-poc.json', JSON.stringify(results, null, 1));
console.log('total hits:', results.length);
// 按地点分组打印
for (const pl of PLACES) {
  const rs = results.filter(r => r.place === pl.id).sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
  console.log(`\n== ${pl.label} (${rs.length}) ==`);
  for (const r of rs) console.log(`  ${r.office}：${r.person} [${r.yearLabel || '不详'}] «${r.quote.slice(0, 70)}» (${r.source.corpus})`);
}
