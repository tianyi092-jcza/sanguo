/* PoC v4：从三国志/晋书/通鉴抽取（人物，职官，地点），范围：荆州刺史/牧 + 长沙/南郡/江夏太守
 * P1 动词+mention+地名+职官；P2 地名+职官+后跟人名；P3 人名+领/拜/除/授+地名+职官
 * 用法：node scripts/extract-offices-poc.mjs
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
const names = [...name2id.keys()].sort((a, b) => b.length - a.length);

const PLACES = [
  { id: '荊州', kind: 'zhou', offices: ['刺史', '牧'] },
  { id: '長沙', placeId: '長沙郡', kind: 'jun', offices: ['太守'] },
  { id: '南郡', kind: 'jun', offices: ['太守'] },
  { id: '江夏', placeId: '江夏郡', kind: 'jun', offices: ['太守'] },
];
const placeByBare = new Map(PLACES.map(pl => [pl.id, pl]));
const barePat = PLACES.map(p => p.id).sort((a, b) => b.length - a.length).join('|');
const VERBS = '拜|除|遷|轉|徙|出為|為|領|行|署|表(?!乃|遂|即|便)|以|授'; // 表后跟乃/遂/即/便是主语（表乃…），非动词
const officePat = new RegExp(`(${VERBS})([^，。；：、]{0,8}?)(${barePat})(太守|刺史|牧)(?!事|伯)`, 'g');
const afterPat = new RegExp(`(${barePat})(太守|刺史|牧)(?!事|伯)([^，。；：、]{1,10})`, 'g');
const preVerbPat = new RegExp(`([\u4e00-\u9fff]{1,4})(領|拜|除|授|為)(${barePat})(太守|刺史|牧)(?!事|伯)`, 'g'); // X為南郡太守：被任命者在動詞前
const outWeiPat = new RegExp(`出([^，。；：、？！。]{1,6})為(${barePat})(太守|刺史|牧)(?!事|伯)`, 'g'); // 乃出長子琦為江夏太守

const FUNC1 = new Set('所其之為以乃遂因既已而則者也矣乎哉焉耳及與于於自從向對將欲當應宜可得'.split(''));
const KINSHIP = ['長子', '次子', '幼子', '長男', '從子', '從弟', '宗人', '族子', '子', '弟', '兄', '父', '妻', '甥', '婿'];
const TITLES = ['大將軍', '將軍', '郎將', '校尉', '中郎將', '中郎', '刺史', '太守', '州牧', '丞相', '尚書', '侍中', '僕射', '都督', '都尉', '司馬', '從事', '主簿', '別駕', '治中', '長史', '太尉', '司徒', '司空', '御史', '黃門', '給事', '諫議', '議郎', '博士', '太常', '宗正', '衛尉', '廷尉', '大鴻臚', '少府', '侯', '王', '帝', '公', '牧'];
const TITLE1 = new Set(['侯', '王', '帝', '公', '牧']); // 单字头衔：只否决整个候选就是它的情况
function hasTitle(s) {
  if (TITLE1.has(s)) return true;
  return TITLES.some(t => t.length > 1 && s.includes(t));
}
const VERB1 = new Set('斬殺討擊攻破擒執收遣命使拜除授封賜率領鎮守戍伐征平定安撫慰勞賞罰黜陟舉辟召奉將從救迎往赴距開叛城麤'.split('')); // 切片首字/扩展位不能是动词
const BOUNDARY = new Set('等、，。，；：卒薨奔討攻擊破救迎往至率領遣使詣降叛斬殺走退還入出鎮守代為字曰云謂與及以因遂乃即便亦復又再將欲當上表坐繫收執擒誅貶免死病所奉距'.split(''));
const SINGLE_CHAR = { '琦': '劉琦' }; // 單字指代：語料中琦幾乎都是劉琦
const ADVERB1 = new Set('初頃既已遂乃因復又再皆悉俱並亦仍猶尚方始終每常數輒便即就纔才乍暫漸稍略頗甚極殊尤益愈更重複屢頻累迭交互相共咸盡遍滿充具'.split('')); // 單字副詞：初為X太守的"初"不是人名
const POS1 = new Set('上下先後今此彼其我吾汝爾卿朕孤臣'.split(''));
const ALIAS = { '先主': '劉備', '武烈': '孫堅', '曹公': '曹操' };

// 年号解析
const NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
function parseNum(s) {
  if (s === '元') return 1;
  let v = 0, tmp = 0;
  for (const ch of s) {
    if (ch === '十') { tmp = tmp || 1; v += tmp * 10; tmp = 0; }
    else if (NUM[ch]) tmp = NUM[ch];
  }
  return v + tmp;
}
const nhSrc = Object.keys(NIANHAO).sort((a, b) => b.length - a.length).join('|');
const nhPat = new RegExp(`(${nhSrc})(元|[一二三四五六七八九十]+)年`, 'g');
function extractYear(text, beforeIdx) {
  const sub = text.slice(0, beforeIdx);
  let m, last = null;
  nhPat.lastIndex = 0;
  while ((m = nhPat.exec(sub))) last = m;
  if (!last) return null;
  const n = parseNum(last[2]);
  for (const c of NIANHAO[last[1]]) {
    const y = c.start + n - 1;
    if (y >= 180 && y <= 270) return { year: y, label: `${last[1]}${last[2]}年` };
  }
  const c0 = NIANHAO[last[1]][0];
  return { year: c0.start + n - 1, label: `${last[1]}${last[2]}年` };
}

function expandSingleChar(ch, fileText, nearIdx) {
  const re = new RegExp(`([\u4e00-\u9fff])${ch}`, 'g');
  let m, best = null;
  while ((m = re.exec(fileText))) {
    if (FUNC1.has(m[1]) || m[1] === '史' || m[1] === '守' || m[1] === '刺') continue;
    if (m.index >= nearIdx - 2) continue; // 排除与匹配点重叠（如"表琦"的表）
    const cand = m[1] + ch;
    const d = Math.abs(m.index - nearIdx);
    if (!best || d < best.d) best = { nm: cand, d };
  }
  return best ? { nm: best.nm, id: name2id.get(best.nm) || null } : null;
}
function dispName(nm, id) { return id && id2name.get(id) ? id2name.get(id) : nm; } // 字一律显示本名
function findLastName(text) {
  let best = null;
  for (const nm of names) {
    if (nm.length < 2) continue;
    const i = text.lastIndexOf(nm);
    if (i >= 0 && (!best || i > best.i || (i === best.i && nm.length > best.nm.length))) best = { i, nm: dispName(nm, name2id.get(nm)), id: name2id.get(nm) };
  }
  return best;
}
function findFirstName(text) {
  let best = null;
  for (const nm of names) {
    if (nm.length < 2) continue;
    const i = text.indexOf(nm);
    if (i >= 0 && (!best || i < best.i)) best = { i, nm: dispName(nm, name2id.get(nm)), id: name2id.get(nm) };
  }
  return best;
}
function cleanMention(mention) {
  let m = mention.replace(/(為|以|之|其|領|行)$/, '');
  const zi = m.indexOf('字');
  if (zi > 0) {
    let left = m.slice(0, zi).replace(/(大|小)?(將軍|校尉|中郎將|刺史|太守|牧|相|尹|侯|王|都督|都尉|司馬|尚書|侍中|令|丞|尉|掾|屬|長史|主簿|別駕)$/, '');
    left = left.replace(/^[\u4e00-\u9fff]+?(郡|州|縣|國|都)/, '');
    if (left.length >= 2 && left.length <= 4) return left;
  }
  return m;
}
const id2name = new Map(data.per.map(p => [p.id, p.n]));
function looksLikeName(s) {
  if (!/^[〇\u4e00-\u9fff]+$/.test(s)) return false; // 纯汉字
  if (s.length < 2 || s.length > 4) return false;
  if (KINSHIP.some(k => s.includes(k))) return false;
  if (hasTitle(s)) return false;
  if (POS1.has(s[0])) return false;
  if (/[時所其為以乃遂因既已而則者也矣乎哉焉耳事日及]/.test(s)) return false;
  if (s.includes('之') && !s.endsWith('之')) return false; // 之只允许在末尾（王騰之）
  return true;
}
function aliasHit(s) {
  for (const [k, v] of Object.entries(ALIAS)) if (s.includes(k)) return { nm: v, id: name2id.get(v) };
  return null;
}
// P2：职官后跟的人名
function resolveAfter(after, fileText, nearIdx) {
  after = (after || '').replace(/^[，。；：、？！。\s　]+/, '');
  if (!after || VERB1.has(after[0])) return null; // 动词开头（如斬冉/奉上/將死）：直接丢弃
  for (const nm of names) {
    if (nm.length >= 2 && after.startsWith(nm)) return { nm: dispName(nm, name2id.get(nm)), id: name2id.get(nm) };
  }
  // 行/領/兼/署/以 开头：职官后跟衔称，人名在后面（如 行建威中郎將周瑜）
  if (/^(行|領|兼|署|以)/.test(after)) {
    const f = findFirstName(after);
    if (f) return f;
    return null;
  }
  let best = null;
  for (const len of [2, 3, 4]) {
    const cand = after.slice(0, len);
    if (cand.length !== len || !looksLikeName(cand)) continue;
    if ([...cand].slice(2).some(ch => VERB1.has(ch))) continue; // 扩展位不能是动词（桓豁救之≠人名）
    const nx = after[len];
    const rest = after.slice(len);
    if (nx === undefined || BOUNDARY.has(nx) || TITLES.some(t => t.length > 1 && rest.startsWith(t))) best = { nm: cand, id: null }; // 取最长合法（傅羣主簿 -> 傅羣）
  }
  if (best) return best;
  const ff = findFirstName(after); // 册文体（高陽鄉侯臣吳壹）：人名不在开头
  if (ff) return ff;
  const chm = after.match(/^([\u4e00-\u9fff])/);
  if (chm && !FUNC1.has(chm[1])) {
    if (SINGLE_CHAR[chm[1]]) return { nm: SINGLE_CHAR[chm[1]], id: name2id.get(SINGLE_CHAR[chm[1]]) || null };
    return expandSingleChar(chm[1], fileText, nearIdx);
  }
  return null;
}
function resolveMention(mention, fileText, nearIdx, sectionPerson) {
  const m = cleanMention(mention);
  if (!m) return 'EMPTY'; // 動詞與地名之間無字：由調用方按動詞類型處理
  return resolveMentionCore(m, fileText, nearIdx, sectionPerson);
}
function resolveMentionCore(m, fileText, nearIdx, sectionPerson) {
  m = m.replace(/^(長子|次子|幼子|長男|從子|從弟)/, ''); // 長子琦 -> 琦
  if (!m) return null;
  if (m.includes('時')) return null;
  if (m.length === 1) {
    if (FUNC1.has(m)) return 'AFTER';
    if (SINGLE_CHAR[m]) return { nm: SINGLE_CHAR[m], id: name2id.get(SINGLE_CHAR[m]) || null };
    if (sectionPerson && sectionPerson.nm.endsWith(m)) return sectionPerson;
    return expandSingleChar(m, fileText, nearIdx) || 'DROP';
  }
  // 名单内人名/别名：长后缀优先（如 劉表大將文聘 -> 文聘）
  for (let L = m.length; L >= 2; L--) {
    const suf = m.slice(-L);
    const hit = findLastName(suf) || aliasHit(suf);
    if (hit) return hit;
  }
  const al = aliasHit(m);
  if (al) return al;
  if (hasTitle(m)) return 'BEFORE';
  // 名单外原文：短后缀优先（如 吳人蘇代 -> 蘇代）
  for (let L = 2; L <= m.length; L++) {
    const suf = m.slice(-L);
    if (looksLikeName(suf)) return { nm: suf, id: null };
  }
  return 'AFTER';
}
function sentenceOf(text, idx) {
  const parts = text.split(/(?<=[。！？；])/);
  let pos = 0;
  for (const s of parts) {
    if (idx >= pos && idx < pos + s.length) return s.slice(0, 200);
    pos += s.length;
  }
  return text.slice(Math.max(0, idx - 60), idx + 60);
}
const results = [];
const seen = new Set();
function addHit(place, office, person, year, yearLabel, quote, source, pat) {
  if (!person) return;
  if (year !== null && (year < 184 || year > 265)) return;
  const nm = person.nm.replace(/麋/g, '糜').replace(/叡/g, '睿'); // 異體字歸一
  const pkey = person.id || ('raw:' + nm);
  const key = `${place.placeId || place.id}|${office}|${pkey}`;
  const ev = { quote, source: source.corpus, pat, year, yearLabel };
  if (seen.has(key)) { results.find(r => r.key === key).evidence.push(ev); return; }
  seen.add(key);
  results.push({ key, place: place.placeId || place.id, kind: place.kind, office, personId: person.id, person: nm, evidence: [ev] });
}
function nearestBefore(text, idx, maxBack = 80) {
  return findLastName(text.slice(Math.max(0, idx - maxBack), idx));
}
function scanText(text, fileText, source, sectionPerson, yearOverride) {
  officePat.lastIndex = 0;
  let m;
  const p1Ranges = []; // P1 已命中的匹配区间，P3 不再重复认领
  while ((m = officePat.exec(text))) {
    const [full, verb, mention, bare, office] = m;
    const place = placeByBare.get(bare);
    if (!place || !place.offices.includes(office)) continue;
    const r = resolveMention(mention, fileText, m.index, sectionPerson);
    let person = null;
    if (r === null || r === 'DROP') continue;
    else if (r === 'EMPTY') {
      // 動詞與地名之間無字
      if (verb === '以') continue; // 以為X牧＝"以為"，非任命
      if (verb === '為') {
        // 周瑜為南郡太守：被任命者緊貼在前，交給 P3；擢為長沙太守：擢是動詞，P1 繼續猜
        const who4 = text.slice(Math.max(0, m.index - 4), m.index);
        let q = null;
        for (let L = Math.min(4, who4.length); L >= 2 && !q; L--) q = findLastName(who4.slice(-L)) || aliasHit(who4.slice(-L));
        if (!q) for (let L = 2; L <= who4.length && !q; L++) { const suf = who4.slice(-L); if (looksLikeName(suf)) q = { nm: suf }; }
        if (q) continue;
      }
      if (verb === '為' && /出[^，。；：、？！。]{1,6}$/.test(text.slice(0, m.index))) continue; // 乃出長子琦為江夏太守：P4 處理
      const afterRaw = text.slice(m.index + full.length, m.index + full.length + 12);
      if (!/^[，。；：、？！。\s　]/.test(afterRaw)) {
        person = resolveAfter(afterRaw, fileText, m.index); // 領江夏太守周瑜 / 領南郡太守史郃
        if (person) { /* AFTER 命中 */ }
        else if (['領', '拜', '除', '授'].includes(verb)) continue; // P3 會處理
        else person = nearestBefore(text, m.index);
      } else if (['領', '拜', '除', '授'].includes(verb)) continue; // 吳人蘇代領長沙太守：P3 處理
      else person = aliasHit(text.slice(Math.max(0, m.index - 12), m.index)) || nearestBefore(text, m.index); // 李勝出為荊州刺史 / 糜芳…為南郡太守（先試別名如先主）
    }
    else if (r === 'AFTER') person = resolveAfter(text.slice(m.index + full.length, m.index + full.length + 10), fileText, m.index) || sectionPerson;
    else if (r === 'BEFORE') person = nearestBefore(text, m.index) || sectionPerson;
    else person = r;
    if (!person) continue;
    const yo = extractYear(text, m.index) || yearOverride;
    p1Ranges.push([m.index, m.index + full.length]);
    addHit(place, office, person, yo?.year ?? null, yo?.label ?? null, sentenceOf(text, m.index), source, 'P1');
  }
  afterPat.lastIndex = 0;
  while ((m = afterPat.exec(text))) {
    const [full, bare, office, after] = m;
    const place = placeByBare.get(bare);
    if (!place || !place.offices.includes(office)) continue;
    const before = text.slice(Math.max(0, m.index - 10), m.index);
    if (new RegExp(`(${VERBS})[^，。；：、]{0,8}$`).test(before)) continue;
    const person = resolveAfter(after, fileText, m.index);
    if (!person) continue;
    const yo = extractYear(text, m.index) || yearOverride;
    addHit(place, office, person, yo?.year ?? null, yo?.label ?? null, sentenceOf(text, m.index), source, 'P2');
  }
  preVerbPat.lastIndex = 0;
  while ((m = preVerbPat.exec(text))) {
    const [full, who, verb, bare, office] = m;
    const place = placeByBare.get(bare);
    if (!place || !place.offices.includes(office)) continue;
    if (m.index > 0 && text[m.index - 1] === '代') continue;
    const verbPos = m.index + who.length;
    if (verb === '為' && who.endsWith('出')) continue; // 出為：P1 已處理
    if (verb === '為' && p1Ranges.some(([s, e]) => verbPos >= s && verbPos < e)) continue; // P1 已命中同一動詞
    const who2 = who.replace(/^(因|乃|遂|即|便|既|已|而|則|亦|復|又|再)+/, '');
    let person = null;
    if (!who2) {
      person = nearestBefore(text, m.index) || sectionPerson; // 因領南郡太守：被任命者在前
    } else if (who2.includes('自')) {
      // 自與領江夏太守周瑜：被任命者在職官後
      const afterRaw = text.slice(m.index + full.length, m.index + full.length + 12);
      if (!/^[，。；：、？！。\s　]/.test(afterRaw)) person = resolveAfter(afterRaw, fileText, m.index);
      if (!person) continue;
    } else {
      for (let L = who2.length; L >= 2 && !person; L--) {
        const suf = who2.slice(-L);
        person = findLastName(suf) || aliasHit(suf);
      }
      if (!person && who2.length === 1 && !FUNC1.has(who2)) {
        if (ADVERB1.has(who2)) { /* 初為江夏太守：初是副詞，被任命者不可考，丟棄 */ }
        else {
          const ex = expandSingleChar(who2, fileText, m.index);
          if (ex && ex.id) person = ex; // 單字擴展只認 471 名單內（備->劉備），不認不猜
        }
      }
      if (!person) {
        for (let L = 2; L <= who2.length && !person; L++) {
          const suf = who2.slice(-L);
          if (looksLikeName(suf)) person = { nm: suf, id: null };
        }
      }
      if (!person) {
        // 被任命者在職官後（權及領南郡太守史郃）
        const afterRaw = text.slice(m.index + full.length, m.index + full.length + 12);
        if (!/^[，。；：、？！。\s　]/.test(afterRaw)) person = resolveAfter(afterRaw, fileText, m.index);
      }
    }
    if (!person) continue;
    const yo = extractYear(text, m.index) || yearOverride;
    addHit(place, office, person, yo?.year ?? null, yo?.label ?? null, sentenceOf(text, m.index), source, 'P3');
  }
  // P4: 出X為 + 地名 + 职官（乃出長子琦為江夏太守）
  outWeiPat.lastIndex = 0;
  while ((m = outWeiPat.exec(text))) {
    const [full, g1, bare, office] = m;
    const place = placeByBare.get(bare);
    if (!place || !place.offices.includes(office)) continue;
    const r = resolveMentionCore(g1, fileText, m.index, sectionPerson);
    if (r === null || r === 'DROP' || r === 'EMPTY' || r === 'AFTER' || r === 'BEFORE') continue;
    const yo = extractYear(text, m.index) || yearOverride;
    addHit(place, office, r, yo?.year ?? null, yo?.label ?? null, sentenceOf(text, m.index), source, 'P4');
  }
}

const files = fs.readdirSync('data/sources').filter(f => /^a0[45]-.*\.json$/.test(f) && !/-ahcb\.json$/.test(f) && !/-full\.json$/.test(f));
for (const f of files.sort()) {
  const d = JSON.parse(fs.readFileSync('data/sources/' + f, 'utf8'));
  const paras = d.paragraphs || [];
  const fileText = paras.map(p => typeof p === 'string' ? p : (p.text || '')).join('\n');
  let sectionPerson = null;
  for (const p of paras) {
    const t = typeof p === 'string' ? p : (p.text || '');
    if (!t) continue;
    const hm = t.match(/^(.{1,8})(傳|紀|志)$/);
    if (hm && !/[，。；：、曰]/.test(t)) {
      const nm = hm[1];
      sectionPerson = name2id.has(nm) ? { nm, id: name2id.get(nm) } : null;
      continue;
    }
    scanText(t, fileText, { corpus: f }, sectionPerson, null);
  }
}
const tjSegs = JSON.parse(fs.readFileSync('data/tongjian/segments.json', 'utf8'));
for (const [vol, v] of Object.entries(tjSegs)) {
  for (const s of v.segments) {
    const text = (s.text || '').replace(/<[^>]+>/g, '');
    if (!text) continue;
    const yo = s.ceYear ? { year: s.ceYear, label: `${s.ceYear}年` } : null;
    scanText(text, text, { corpus: `tongjian-${vol}` }, null, yo);
  }
}
fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/offices-poc.json', JSON.stringify(results, null, 1));
console.log('total hits:', results.length);
for (const pl of PLACES) {
  const pid = pl.placeId || pl.id;
  const rs = results.filter(r => r.place === pid).sort((a, b) => ((a.evidence[0].year ?? 9999)) - ((b.evidence[0].year ?? 9999)));
  console.log(`\n== ${pid} (${rs.length}) ==`);
  for (const r of rs) {
    const e0 = r.evidence[0];
    console.log(`  ${r.office}：${r.person}${r.personId ? '' : '(名单外)'} [${e0.yearLabel || '不详'}${r.evidence.length > 1 ? `,共${r.evidence.length}条` : ''}] «${e0.quote.slice(0, 90)}» (${e0.source},${e0.pat})`);
  }
}
