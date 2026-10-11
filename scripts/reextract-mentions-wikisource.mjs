// 从维基文库重提他传/晋书摘录，带裴注结构化。
// 输入：data/mentions.json（旧版，语料库来源）
// 输出：data/mentions-ws.json（新版，维基文库来源，segs 带 t:'text'/'pei'）
// 增量：data/mentions-ws-progress.json 记录已处理的 source
// 用法：node scripts/reextract-mentions-wikisource.mjs [--chunk N]
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
import { fetchChapter, parseWikitext } from './fetch-wikisource.mjs';

const toTrad = OpenCC.Converter({ from: 'cn', to: 'tw' });
const ROOT = '/home/hatch/workspace/sanguo';
const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';

const oldMentions = JSON.parse(fs.readFileSync(`${ROOT}/data/mentions.json`, 'utf8'));
const orig = JSON.parse(fs.readFileSync(`${ROOT}/data/original.json`, 'utf8'));
const perList = orig.per.filter(p => p.n !== '貂蝉');

// 进度文件
const PROG = `${ROOT}/data/mentions-ws-progress.json`;
let progress = { done: [], chapters: {} };
if (fs.existsSync(PROG)) progress = JSON.parse(fs.readFileSync(PROG, 'utf8'));

// 输出文件
const OUT = `${ROOT}/data/mentions-ws.json`;
let output = { schemaVersion: 1, people: [] };
if (fs.existsSync(OUT)) output = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const outById = new Map(output.people.map(p => [p.id, p]));

// 收集需要处理的 source -> persons
const sourcePersons = new Map(); // source -> Set<pid>
for (const p of oldMentions.people) {
  for (const e of p.excerpts) {
    if (!sourcePersons.has(e.source)) sourcePersons.set(e.source, new Set());
    sourcePersons.get(e.source).add(p.id);
  }
}

// source 如 a04-001 -> {work:'sanguozhi', juan:'01'}, a05-003 -> {work:'jinshu', juan:'03'}
function parseSource(src) {
  const m = src.match(/^a0([45])-(\d+)$/);
  if (!m) return null;
  return {
    work: m[1] === '4' ? 'sanguozhi' : 'jinshu',
    juan: String(parseInt(m[2], 10)).padStart(2, '0'),
  };
}

async function fetchJinshuChapter(juan) {
  // 晋书用3位卷号：晉書 (四庫全書本)/卷001
  const juan3 = String(parseInt(juan, 10)).padStart(3, '0');
  const page = `晉書 (四庫全書本)/卷${juan3}`;
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`抓取失败 ${page}：${j.error.info}`);
  return j.parse.wikitext;
}

// 获取人物姓名/字（繁体）
function getPersonNames(pid) {
  const idx = parseInt(pid.slice(1), 10) - 1;
  const per = perList[idx];
  if (!per) return [];
  const names = [toTrad(per.n)];
  if (per.z) names.push(toTrad(per.z));
  return names;
}

// 在段落中查找人名（返回匹配的段落索引）
function findParagraphs(paragraphs, names) {
  const hits = [];
  paragraphs.forEach((para, i) => {
    const text = para.segs.map(s => s.h.replace(/<[^>]+>/g, '')).join('');
    for (const name of names) {
      if (name && text.includes(name)) {
        hits.push(i);
        break;
      }
    }
  });
  return hits;
}

const chunk = parseInt(process.argv.find(a => a.startsWith('--chunk='))?.split('=')[1] || '5', 10);
const sources = [...sourcePersons.keys()].filter(s => !progress.done.includes(s));
console.log(`待处理: ${sources.length} 卷，chunk=${chunk}`);

let processed = 0;
for (const src of sources.slice(0, chunk)) {
  const info = parseSource(src);
  if (!info) { progress.done.push(src); continue; }

  console.log(`抓取 ${src} (${info.work} 卷${info.juan})...`);
  let wt;
  try {
    wt = info.work === 'sanguozhi'
      ? await fetchChapter(info.juan)
      : await fetchJinshuChapter(info.juan);
  } catch (e) {
    console.error(`  失败: ${e.message}`);
    continue;
  }

  const paragraphs = parseWikitext(wt);
  console.log(`  解析得 ${paragraphs.length} 段`);

  // 为该卷的每个人查找匹配段落
  for (const pid of sourcePersons.get(src)) {
    const names = getPersonNames(pid);
    const hits = findParagraphs(paragraphs, names);

    if (!outById.has(pid)) {
      const idx = parseInt(pid.slice(1), 10) - 1;
      const per = perList[idx];
      outById.set(pid, { id: pid, name: per.n, excerpts: [] });
      output.people.push(outById.get(pid));
    }
    const person = outById.get(pid);

    for (const pi of hits) {
      const para = paragraphs[pi];
      // 避免重复（同一人同一卷同一段）
      const exists = person.excerpts.some(e => e.source === src && e.paragraph === pi);
      if (exists) continue;

      person.excerpts.push({
        id: `${pid}-ws-${src}-${pi}`,
        work: info.work,
        source: src,
        paragraph: pi,
        citation: info.work === 'sanguozhi'
          ? `《三國志·${getJuanLabel(info.juan)}》`
          : `《晉書·卷${parseInt(info.juan, 10)}》`,
        segs: para.segs, // 带 t:'text'/'pei' 结构
        wsSource: true,
      });
    }
  }

  progress.done.push(src);
  progress.chapters[src] = paragraphs.length;

  // 增量保存
  fs.writeFileSync(PROG, JSON.stringify(progress, null, 1));
  // 按 pid 排序
  output.people.sort((a, b) => a.id < b.id ? -1 : 1);
  fs.writeFileSync(OUT, JSON.stringify(output, null, 1));

  processed++;
  console.log(`  完成 ${src}，已处理 ${processed}/${chunk}`);
  await new Promise(r => setTimeout(r, 1000)); // 礼貌延迟
}

console.log(`本轮完成 ${processed} 卷，剩余 ${sources.length - processed} 卷`);

// 卷标签辅助
function getJuanLabel(juan) {
  const n = parseInt(juan, 10);
  // 简化：直接返回卷号，citation 格式后续可优化
  return `卷${n}`;
}
