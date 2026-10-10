// 解析《資治通鑑》卷059–081 wikitext，按年分段。
// 用法：node scripts/parse-tongjian.mjs
// 输入 data/tongjian/raw/<vol>.txt；输出 data/tongjian/segments.json：
// { <vol>: { page, url, segments: [{id, vol, yearKey, yearLabel, ceYear, era, eraYear, html, text}]}}
// 年标题格式多变（=== ===/== ==/纯文本行），统一按"含公元/西元"判定；==校刊記== 丢弃。
import fs from 'node:fs';
import path from 'node:path';
import { extractBalanced, splitTopLevel, inline} from './fetch-wikisource.mjs';
import { NIANHAO} from '/home/hatch/workspace/sanguo-retrieval-poc/time_table.mjs';

const RAW_DIR = 'data/tongjian/raw';
const OUT = 'data/tongjian/segments.json';
const enc = s => encodeURIComponent(String(s).replace(/ /g, '_'));

// 中文数字 -> int（处理"二〇六""二六五""二十""十一年""元"）
const D = { '〇': 0, '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9};
function hanNum(s) {
if (s === '元') return 1;
if (/^[〇零一二三四五六七八九]+$/.test(s)) return parseInt([...s].map(c => D[c]).join(''), 10);
let n = 0, tmp = 0;
for (const c of s) {
if (c === '十') { tmp = tmp || 1; n += tmp * 10; tmp = 0;}
else if (c === '百') { tmp = tmp || 1; n += tmp * 100; tmp = 0;}
else if (D[c]!= null) tmp = D[c];
}
return n + tmp;
}

const ERA_KEYS = Object.keys(NIANHAO).sort((a, b) => b.length - a.length);

// 从标题前缀解析 年號+年數，如 "孝獻皇帝庚建安十一年" -> {era:'建安', n:11}
// "中平五年" -> {era:'中平', n:5}
function parseEra(prefix) {
let best = null;
for (const k of ERA_KEYS) {
const i = prefix.lastIndexOf(k);
if (i >= 0 && (!best || i > best.i)) best = { k, i};
}
if (!best) return null;
const rest = prefix.slice(best.i + best.k.length);
const m = rest.match(/^([元一二三四五六七八九十百〇零]+)年/);
if (!m) return null;
return { era: best.k, n: hanNum(m[1]), eraYearHan: m[1]};
}

// 年标题行判定：含公元/西元，且为 ==/=== 标题或短行纯文本
function parseYearHeader(line) {
const t = line.trim();
if (!/(公元|西元)/.test(t)) return null;
const isTitle = /^={2,3}.*={2,3}$/.test(t);
const isPlain =!t.startsWith('=') && t.length < 80 && /[年]\s*[（(]/.test(t);
if (!isTitle &&!isPlain) return null;
// 显式公元年
const ym = t.match(/(公元|西元)([0-9〇零一二三四五六七八九十百]+)年/);
if (!ym) return null;
const ceYear = /^[0-9]+$/.test(ym[2])? parseInt(ym[2], 10): hanNum(ym[2]);
// 年號+年數：取第一个（或{{*}}前的）括号之前的部分
let prefix = t.replace(/^=+/, '').replace(/=+$/, '').trim();
prefix = prefix.split('{{')[0].split('（')[0].split('(')[0];
// YL 模板：{{YL|建安十四年}}
const yl = t.match(/\{\{YL\|([^}]+)\}\}/);
if (yl) prefix = yl[1];
const era = parseEra(prefix);
return { ceYear, era, raw: t};
}

// 通鑑正文 inline：{{*|…}} 年号小字注按通用 templateHTML 行内保留；
// {{僻字|字|释}} 取首字（通用逻辑会误取末段"释"）
function tjInline(s) {
s = s.replace(/\{\{僻字\|([^}|]+)(?:\|[^}]*)?\}\}/g, '$1');
return inline(s);
}

function splitParagraphs(wt) {
const parts = [];
let cur = '', depth = 0, i = 0;
while (i < wt.length) {
if (wt.startsWith('{{', i)) { depth++; cur += '{{'; i += 2; continue;}
if (wt.startsWith('}}', i)) { if (depth > 0) depth--; cur += '}}'; i += 2; continue;}
const m = /^\n{2,}/.exec(wt.slice(i));
if (m && depth === 0) { parts.push(cur); cur = ''; i += m[0].length; continue;}
cur += wt[i]; i++;
}
parts.push(cur);
return parts;
}

const DROP_TPL = new Set(['footer', 'Textquality', '!', '北宋作品']);
function dropTopTemplates(s) {
let out = '', i = 0;
while (i < s.length) {
if (s.startsWith('{{', i)) {
const b = extractBalanced(s, i);
if (!b) { out += s.slice(i); break;}
const inner = b.inner;
const bar = inner.indexOf('|');
const name = (bar < 0? inner: inner.slice(0, bar)).trim();
if (DROP_TPL.has(name) || /^header\d*$/i.test(name)) { i = b.end; continue;}
out += s.slice(i, b.end); i = b.end;
} else { out += s[i]; i++;}
}
return out;
}

function stripHtml(s) {
return s.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function parseVol(vol) {
const page = `資治通鑑/卷${vol}`;
let wt = fs.readFileSync(path.join(RAW_DIR, `${vol}.txt`), 'utf8');
wt = wt.replace(/<!--[\s\S]*?-->/g, '');
wt = wt.replace(/<ref>[\s\S]*?<\/ref>/gi, ''); // 校勘注：整段丢弃
wt = dropTopTemplates(wt);
wt = wt.replace(/__TOC__/g, '');
const lines = wt.split('\n');
// 按年切分：先标出年标题行
const sections = [];
let cur = null, inJiaokan = false;
for (const line of lines) {
const t = line.trim();
if (/^==\s*校刊記\s*==$/.test(t)) { inJiaokan = true; if (cur) { sections.push(cur); cur = null;} continue;}
if (inJiaokan) continue;
if (/^\[\[(Category|分類):/i.test(t)) continue;
if (/^【.+】/.test(t) || /^\[\[資治通鑑\]\]/.test(t)) continue;
const yh = parseYearHeader(line);
if (yh) {
if (cur) sections.push(cur);
cur = { year: yh, paras: []};
continue;
}
if (!cur) continue; // 年标题之前的内容丢弃
cur.paras.push(line);
}
if (cur) sections.push(cur);
const segments = [];
let n = 0;
for (const sec of sections) {
const { ceYear, era} = sec.year;
const yearKey = era? `${era.era}${era.eraYearHan}年`: `公元${ceYear}年`;
const yearLabel = era? `${era.era}${era.eraYearHan}年（${ceYear}年）`: `公元${ceYear}年`;
const body = sec.paras.join('\n');
for (const raw of splitParagraphs(body)) {
const para = raw.trim();
if (!para) continue;
if (/^\[\[(Category|分類):/i.test(para)) continue;
if (parseYearHeader(para.split('\n')[0]) && para.split('\n').length === 1) continue;
const html = tjInline(para).trim();
if (!html || stripHtml(html).length < 8) continue;
n++;
segments.push({
id: `tj-${vol}-${String(n).padStart(3, '0')}`,
vol, yearKey, yearLabel, ceYear,
era: era?.era || '', eraYear: era?.n || null,
html, text: stripHtml(html),
});
}
}
return {
page, url: `https://zh.wikisource.org/wiki/${enc(page)}`,
segments,
};
}

function main() {
const vols = [];
for (let v = 59; v <= 81; v++) vols.push(String(v).padStart(3, '0'));
const out = {};
let total = 0, anomalies = [];
for (const vol of vols) {
const r = parseVol(vol);
out[vol] = r;
total += r.segments.length;
// 年號归一化校验
for (const s of r.segments) {
if (s.era && s.eraYear && NIANHAO[s.era]) {
const cands = NIANHAO[s.era];
const ok = cands.some(c => c.start + s.eraYear - 1 === s.ceYear);
if (!ok) anomalies.push(`${s.id} ${s.yearKey} ce=${s.ceYear} 表不符`);
} else if (s.era) {
anomalies.push(`${s.id} ${s.yearKey} 年號「${s.era}」表无此条目`);
}
}
console.log(`卷${vol}：${r.segments.length} 段`);
}
fs.mkdirSync('data/tongjian', { recursive: true});
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`OK: ${OUT}，共 ${total} 段`);
if (anomalies.length) {
console.log(`年號校验异常 ${anomalies.length} 条：`);
for (const a of anomalies.slice(0, 20)) console.log(' ' + a);
} else console.log('年號归一化校验：全部通过');
}

main();
