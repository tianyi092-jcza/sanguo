// 三国志本传全文批量接入（rollout worker）。
// 用法：node scripts/rollout-wikisource.mjs [每轮卷数，默认2]
// 幂等：已接入（data/wikisource.json 有记录）或在 skip 表中的人物跳过。
// 每轮只做抓取+解析+wikisource.json；embed / bio-links / build 由 cron 后续步骤做。
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
import { fetchChapter, listHeaders, extractSection, parseWikitext, buildEntry} from './fetch-wikisource.mjs';

// 文库章节标题为繁体，人名库为简体：匹配标题前转繁体（简繁同形人名不受影响）
const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });
// 异体字归一（人名简转繁后与文库标题用字不一致，如 勳/勛、既/旣、群/羣）
// 取自 sanguo-retrieval-poc/retrieve.py _VARIANT_PAIRS，另补文库实测到的 勳/勛、既/旣
const VARIANT_PAIRS = [
  ['為','爲'],['眾','衆'],['於','于'],['歷','曆'],['案','桉'],
  ['算','筭'],['強','彊'],['賓','賙'],['勖','勗'],['修','脩'],
  ['衛','衞'],['群','羣'],['饑','飢'],['劍','劔'],['掃','埽'],
  ['藉','籍'],['答','荅'],['跡','迹'],['諡','謚'],['克','剋'],
  ['皋','臯'],['協','叶'],['博','愽'],['床','牀'],
  ['勳','勛'],['既','旣'],
];
const VARIANT_MAP = {};
for (const [a,b] of VARIANT_PAIRS) { VARIANT_MAP[a]=a; VARIANT_MAP[b]=a; }
const normVariant = s => [...s].map(c => VARIANT_MAP[c] || c).join('');

const DB = 'data/wikisource.json';
const SKIP = 'data/wikisource-skip.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 无章节标题的卷：仅这些明确的主体人物取整卷，其余一律跳过（事见非传）。
// 多主体无标题卷（如三少帝纪 a04-004、刘二牧传 a04-031）暂不自动处理，靠文库标题匹配或人工。
const HEADERLESS_SUBJECTS = {
  'a04-002': ['曹丕'],
  'a04-003': ['曹叡'],
  'a04-032': ['刘备'],
  'a04-033': ['刘禅'],
  'a04-035': ['诸葛亮'],
  'a04-047': ['孙权'],
  'a04-058': ['陆逊'],
};

function cjkToNum(s) {
const d = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9};
if (/^\d+$/.test(s)) return +s;
if (s === '十') return 10;
let m = s.match(/^([一二三四五六七八九])十([一二三四五六七八九])?$/);
if (m) return d[m[1]] * 10 + (m[2]? d[m[2]]: 0);
m = s.match(/^十([一二三四五六七八九])$/);
if (m) return 10 + d[m[1]];
return d[s] || 0;
}
function bioSrcOf(ps) {
const s = String(ps || '');
let m = s.match(/魏书([一二三四五六七八九十\d]+)/);
if (m) return 'a04-' + String(cjkToNum(m[1])).padStart(3, '0');
m = s.match(/蜀书([一二三四五六七八九十\d]+)/);
if (m) return 'a04-' + String(cjkToNum(m[1]) + 30).padStart(3, '0');
m = s.match(/吴书([一二三四五六七八九十\d]+)/);
if (m) return 'a04-' + String(cjkToNum(m[1]) + 45).padStart(3, '0');
return '';
}
const normText = s => String(s || '').replace(/<[^>]*>/g, '').replace(/[\s　，。；：、「」『』！？…—·〈〉《》「」（）()\[\]、]/g, '');

// 解析后校验：wikitext 标记泄漏（{{ }}、onlyinclude、模板参数名）则拒收
function hasLeakage(paragraphs) {
  return paragraphs.some(p => p.segs.some(s => /\{\{|\}\}|onlyinclude|noinclude/.test(s.h)));
}

// 语料标题段（「張遼傳」）定位本传段落范围；附传（无独立标题）用本传首句锚定到所在标题区间
function bioRange(corpusTexts, personName, bioFirstNorm) {
const titles = [];
corpusTexts.forEach((t, i) => { if (/^.{1,6}傳$/.test(t.trim())) titles.push({ title: t.trim(), idx: i});});
if (!titles.length) return null;
let ti = titles.findIndex(t => t.title.includes(personName));
if (ti < 0 && bioFirstNorm) {
const anchor = bioFirstNorm.slice(0, 30);
const hit = corpusTexts.findIndex(t => anchor && normText(t).includes(anchor));
if (hit >= 0) ti = titles.findIndex((t, k) => hit > t.idx && (k + 1 >= titles.length || hit < titles[k + 1].idx));
}
if (ti < 0) return null;
return [titles[ti].idx + 1, (ti + 1 < titles.length? titles[ti + 1].idx: corpusTexts.length) - 1];
}

async function main() {
const maxJuan = parseInt(process.argv[2] || '2', 10);
const orig = JSON.parse(fs.readFileSync('data/original.json', 'utf8'));
const db = fs.existsSync(DB)? JSON.parse(fs.readFileSync(DB, 'utf8')): {};
const skip = fs.existsSync(SKIP)? JSON.parse(fs.readFileSync(SKIP, 'utf8')): {};

// 待处理：有三国志本传、未接入、未跳过，按卷分组
// 人物 ID 必须与 makeHistory（前端）一致：先滤除貂蝉再编号，否则 p0128 之后全部错位
const perList = orig.per.filter(p => p.n !== '貂蝉');
perList.forEach((p, i) => {
const pid = 'p' + String(i + 1).padStart(4, '0');
if (db[pid] || skip[pid]) return;
const src = bioSrcOf(p.s);
if (!src) return;
(byJuan[src] = byJuan[src] || []).push({ pid, n: p.n});
});
const juans = Object.keys(byJuan).sort().slice(0, maxJuan);
if (!juans.length) { console.log('队列已空，无待处理卷'); return;}

let donePersons = 0;
for (const src of juans) {
const juan = String(parseInt(src.slice(4), 10)).padStart(2, '0');
const people = byJuan[src];
console.log(`== 卷${juan}（${src}）：${people.length} 人 ==`);
let wt;
try {
wt = await fetchChapter(juan);
} catch (e) { console.log(` 抓取失败，整卷跳过：${e.message}`); continue;}
const headers = listHeaders(wt);
const corpusFile = `data/sources/${src}.json`;
const corpusTexts = fs.existsSync(corpusFile)
? JSON.parse(fs.readFileSync(corpusFile, 'utf8')).paragraphs: null;
for (const { pid, n} of people) {
if (db[pid]) continue;
try {
if (headers.length) {
const nt = toTrad(n);
const ntN = normVariant(nt);
const h = headers.find(h => h.title === nt || h.title.includes(nt) || normVariant(h.title) === ntN || normVariant(h.title).includes(ntN));
if (!h) throw new Error('无匹配章节（事见非传）');
const secTitle = h.title; // 用文库实际标题切分
const paragraphs = parseWikitext(extractSection(wt, secTitle));
if (!paragraphs.length) throw new Error('解析出 0 段');
if (hasLeakage(paragraphs)) throw new Error('解析泄漏 wikitext 标记，需修解析器');
const firstNorm = normText(paragraphs[0].segs.filter(s => s.t === 'text').map(s => s.h).join(''));
const range = corpusTexts? bioRange(corpusTexts, n, firstNorm): null;
const { entry, noteCount} = buildEntry(pid, juan, n, paragraphs, range);
db[pid] = entry;
donePersons++;
console.log(` OK ${pid} ${n}：${paragraphs.length} 段，${noteCount} 注${range? `，本传段[${range}]`: ''}`);
} else {
const subjects = HEADERLESS_SUBJECTS[src] || [];
if (!subjects.includes(n)) throw new Error('无章节标题且非卷主体（事见非传）');
const paragraphs = parseWikitext(wt);
if (!paragraphs.length) throw new Error('解析出 0 段');
if (hasLeakage(paragraphs)) throw new Error('解析泄漏 wikitext 标记，需修解析器');
const { entry, noteCount} = buildEntry(pid, juan, '', paragraphs, null);
db[pid] = entry;
donePersons++;
console.log(` OK ${pid} ${n}：整卷 ${paragraphs.length} 段，${noteCount} 注`);
}
} catch (e) {
skip[pid] = e.message;
console.log(` SKIP ${pid} ${n}：${e.message}`);
}
}
fs.writeFileSync(DB, JSON.stringify(db, null, 2) + '\n');
fs.writeFileSync(SKIP, JSON.stringify(skip, null, 2) + '\n');
await sleep(2000);
}
console.log(`本轮完成：${juans.length} 卷，${donePersons} 人`);
}

main().catch(e => { console.error(e.message); process.exit(1);});
