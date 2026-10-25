// 解析 sidneyluo《資治通鑑》卷059–081（data/tongjian/raw-sidneyluo/NNN.json）为分段语料。
// 页面自带 <h6> 年标题（如「獻帝建安二年（丁丑、一九七年）」）：按节分年，
// 每 <li> 段落为一个 segment，继承所属年节的 yearLabel/ceYear/era/eraYear。
// 输出 data/tongjian/segments.json（形状与旧维基文库版一致，供 retrieve/embed/build 管线复用）。
// 旧版存档于 data/tongjian/segments.wikisource.json，仅作对照，不再参与构建。
import fs from 'node:fs';
import { NIANHAO } from '/home/hatch/workspace/sanguo-retrieval-poc/time_table.mjs';

const D = { '〇': 0, 'Ｏ': 0, '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
function hanNum(s) {
  if (s === '元') return 1;
  if (/^[〇Ｏ零一二三四五六七八九]+$/.test(s)) return parseInt([...s].map(c => D[c]).join(''), 10);
  let n = 0, tmp = 0;
  for (const c of s) {
    if (c === '十') { tmp = tmp || 1; n += tmp * 10; tmp = 0; }
    else if (c === '百') { tmp = tmp || 1; n += tmp * 100; tmp = 0; }
    else if (D[c] != null) tmp = D[c];
  }
  return n + tmp;
}
const ERA_KEYS = Object.keys(NIANHAO).sort((a, b) => b.length - a.length);

function parseHeading(h) {
  // 「孝獻皇帝建安元年（丙子、一九六年）」/「獻帝建安二年（丁丑、一九七年）」
  const ym = h.match(/[、，]([〇Ｏ零一二三四五六七八九十百]+)年/);
  const ceYear = ym ? hanNum(ym[1]) : null;
  const prefix = h.split('（')[0].split('(')[0];
  let best = null;
  for (const k of ERA_KEYS) {
    const i = prefix.lastIndexOf(k);
    if (i >= 0 && (!best || i > best.i)) best = { k, i };
  }
  if (!best) return { era: null, eraYear: null, eraYearHan: null, ceYear };
  const rest = prefix.slice(best.i + best.k.length);
  const m = rest.match(/^([元一二三四五六七八九十百〇零]+)年/);
  if (!m) return { era: best.k, eraYear: null, eraYearHan: null, ceYear };
  return { era: best.k, eraYearHan: m[1], eraYear: hanNum(m[1]), ceYear };
}

const out = {};
let totSeg = 0, badHead = 0;
const vols = fs.readdirSync('data/tongjian/raw-sidneyluo').filter(f => /^\d{3}\.json$/.test(f)).map(f => f.slice(0, 3)).sort();
for (const vol of vols) {
  const raw = JSON.parse(fs.readFileSync(`data/tongjian/raw-sidneyluo/${vol}.json`, 'utf8'));
  const segments = [];
  let n = 0;
  for (const sec of raw.sections) {
    const y = parseHeading(sec.heading);
    if (!y.era || !y.eraYear || !y.ceYear) { badHead++; console.log(`卷${vol} 标题解析不全：${sec.heading} -> ${JSON.stringify(y)}`); }
    // 交叉校验：年号起始年 + 年数 - 1 应等于标题明示公元年
    if (y.era && y.eraYear && y.ceYear && NIANHAO[y.era]) {
      const ok = NIANHAO[y.era].some(c => c.start + y.eraYear - 1 === y.ceYear);
      if (!ok) console.log(`卷${vol} 年份校验不一致：${sec.heading}（年号推算≠${y.ceYear}）`);
    }
    const yearKey = y.era ? `${y.era}${y.eraYearHan}年` : '';
    const yearLabel = y.ceYear ? `${yearKey}（${y.ceYear}年）` : sec.heading;
    for (const p of sec.paragraphs) {
      n++;
      segments.push({
        id: `tj-${vol}-${String(n).padStart(3, '0')}`,
        vol, yearKey, yearLabel, ceYear: y.ceYear, era: y.era, eraYear: y.eraYear,
        html: p, text: p,
      });
    }
  }
  out[vol] = { page: raw.title, url: raw.url, segments };
  totSeg += segments.length;
  const ys = segments.map(s => s.ceYear).filter(Boolean);
  console.log(`卷${vol}：${raw.sections.length} 年节，${segments.length} 段，年 ${Math.min(...ys)}–${Math.max(...ys)}`);
}
if (badHead) throw new Error(`有 ${badHead} 个年标题解析不全，已中止`);
fs.writeFileSync('data/tongjian/segments.json', JSON.stringify(out, null, 1));
console.log(`OK: data/tongjian/segments.json（共 ${totSeg} 段）`);
