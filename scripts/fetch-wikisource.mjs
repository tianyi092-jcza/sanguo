// 从中文维基文库抓取《三國志》某卷 wikitext，解析正文与裴注，写入 data/wikisource.json。
// 用法：node scripts/fetch-wikisource.mjs p0001 01 [章节名]
//   p0001: 人物 id；01: 卷号（零填充两位，对应文库页面「三國志/卷01」）
//   章节名（可选）：卷内多传时按 == 章节名 == 切分，如：node scripts/fetch-wikisource.mjs p0044 17 張遼
// 注文在 wikitext 中以 {{*|…}} 包裹；解析为分段结构，正文/注文分离，
// 注文内链（书名等）转为绝对 URL，渲染时以「裴注」标签 + 点击弹窗呈现。
import fs from 'node:fs';

const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';
const DROP_TEMPLATES = new Set(['footer', '西晉作品', '另', 'Textquality', '!']);
// header/header2 等卷首导航模板一律丢弃
function isDropTemplate(name) {
  return DROP_TEMPLATES.has(name) || /^header\d*$/i.test(name);
}
const escHtml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const enc = s => encodeURIComponent(String(s).replace(/ /g, '_'));

function extractBalanced(s, start) {
  let depth = 0, i = start;
  while (i < s.length) {
    if (s.startsWith('{{', i)) { depth++; i += 2; }
    else if (s.startsWith('}}', i)) { depth--; i += 2; if (depth === 0) return { end: i, inner: s.slice(start + 2, i - 2) }; }
    else i++;
  }
  return null;
}

function templateName(inner) {
  const bar = inner.indexOf('|');
  return (bar < 0 ? inner : inner.slice(0, bar)).trim();
}

// 只在顶层（不在嵌套 {{…}} 内）按 | 切分模板参数
function splitTopLevel(s) {
  const parts = [];
  let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith('{{', i)) { depth++; cur += '{{'; i++; }
    else if (s.startsWith('}}', i)) { depth--; cur += '}}'; i++; }
    else if (s[i] === '|' && depth === 0) { parts.push(cur); cur = ''; }
    else cur += s[i];
  }
  parts.push(cur);
  return parts;
}

// 删除顶层指定模板（header/footer/许可/顶注等）
function dropTopTemplates(s) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s.startsWith('{{', i)) {
      const b = extractBalanced(s, i);
      if (!b) { out += s.slice(i); break; }
      if (isDropTemplate(templateName(b.inner))) { i = b.end; continue; }
      out += s.slice(i, b.end); i = b.end;
    } else { out += s[i]; i++; }
  }
  return out;
}

function linkHTML(inner) {
  if (/^ *([Cc]ategory|分類|File|Image|文件) *:/.test(inner)) return '';
  const bar = inner.indexOf('|');
  const target = (bar < 0 ? inner : inner.slice(0, bar)).trim();
  const text = (bar < 0 ? target : inner.slice(bar + 1)).trim();
  if (!target || target.startsWith('#')) return inline(text);
  const hash = target.indexOf('#');
  const page = hash < 0 ? target : target.slice(0, hash);
  const frag = hash < 0 ? '' : target.slice(hash + 1);
  const href = 'https://zh.wikisource.org/wiki/' + enc(page) + (frag ? '#' + enc(frag) : '');
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${inline(text)}</a>`;
}

function templateHTML(inner) {
  const name = templateName(inner);
  const bar = inner.indexOf('|');
  const rest = bar < 0 ? '' : inner.slice(bar + 1);
  if (name === 'YL' || name === 'ProperNoun') return inline(splitTopLevel(rest).pop() || '');
  if (name === 'WavyBookMark') return inline(rest);
  if (name === 'quote') return inline(rest); // 注文内嵌套的引文模板：保留全文
  const parts = splitTopLevel(rest);
  return inline(parts[parts.length - 1] || '');
}

function inline(s) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s.startsWith('{{', i)) {
      const b = extractBalanced(s, i);
      if (!b) { out += escHtml(s.slice(i)); break; }
      out += templateHTML(b.inner); i = b.end;
    } else if (s.startsWith('[[', i)) {
      const end = s.indexOf(']]', i);
      if (end < 0) { out += escHtml(s.slice(i)); break; }
      out += linkHTML(s.slice(i + 2, end)); i = end + 2;
    } else if (s.startsWith('}}', i)) {
      i += 2; // 游离的 }}（无对应 {{，系文库标记笔误）：丢弃，不入正文
    } else if (s.startsWith('-{', i)) {
      const end = s.indexOf('}-', i);
      if (end < 0) { out += escHtml(s.slice(i)); break; }
      const body = s.slice(i + 2, end);
      out += escHtml(body.includes('|') ? body.split('|').pop() : body); i = end + 2;
    } else { out += escHtml(s[i]); i++; }
  }
  return out;
}

// 把段落切分为 text / pei 片段
function splitNotes(para) {
  const segs = []; let i = 0;
  while (i < para.length) {
    const idx = para.indexOf('{{*|', i);
    if (idx < 0) { const t = para.slice(i).trim(); if (t) segs.push({ t: 'text', s: para.slice(i) }); break; }
    if (idx > i) segs.push({ t: 'text', s: para.slice(i, idx) });
    const b = extractBalanced(para, idx);
    if (!b) { segs.push({ t: 'text', s: para.slice(idx) }); break; }
    let inner = b.inner;
    if (inner.startsWith('*|')) inner = inner.slice(2);
    segs.push({ t: 'pei', s: inner });
    i = b.end;
  }
  return segs;
}

// 跨段 {{quote|…}} 模板（常见于传中书信）：仅在顶层（depth 0）时在切分段落前按平衡括号
// 整体提出、内容独立成段；嵌套在 {{*|…}} 注文里的 quote 不动，交给括号感知切分+templateHTML
function expandQuoteTemplates(wt) {
  let out = '', i = 0, depth = 0;
  while (i < wt.length) {
    if (wt.startsWith('{{quote|', i) && depth === 0) {
      const b = extractBalanced(wt, i);
      if (!b) { out += '{{quote|'; i += 8; continue; }
      out += '\n\n' + b.inner.slice('quote|'.length) + '\n\n';
      i = b.end;
      continue;
    }
    if (wt.startsWith('{{', i)) { depth++; out += '{{'; i += 2; continue; }
    if (wt.startsWith('}}', i)) { if (depth > 0) depth--; out += '}}'; i += 2; continue; }
    out += wt[i]; i++;
  }
  return out;
}

// 括号感知分段：{{…}} 模板内部的空行不切分，避免模板被拦腰切断导致标记泄漏
function splitParagraphs(wt) {
  const parts = [];
  let cur = '', depth = 0, i = 0;
  while (i < wt.length) {
    if (wt.startsWith('{{', i)) { depth++; cur += '{{'; i += 2; continue; }
    if (wt.startsWith('}}', i)) { if (depth > 0) depth--; cur += '}}'; i += 2; continue; }
    const m = /^\n{2,}/.exec(wt.slice(i));
    if (m && depth === 0) { parts.push(cur); cur = ''; i += m[0].length; continue; }
    cur += wt[i]; i++;
  }
  parts.push(cur);
  return parts;
}

function parseWikitext(wt) {
  wt = wt.replace(/<!--[\s\S]*?-->/g, '');
  wt = wt.replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '');
  wt = wt.replace(/<\/?onlyinclude>/gi, '');
  wt = expandQuoteTemplates(wt);
  wt = dropTopTemplates(wt);
  const paragraphs = [];
  for (const raw of splitParagraphs(wt)) {
    const para = raw.trim();
    if (!para) continue;
    if (/^\[\[([Cc]ategory|分類):/.test(para)) continue;
    const segs = splitNotes(para).map(sg => ({ t: sg.t, h: inline(sg.s.trim()) })).filter(sg => sg.h);
    if (segs.length) paragraphs.push({ segs });
  }
  // 纯注段落（段内只有裴注、无正文）并入上一段，避免注标签独占一行
  const merged = [];
  for (const p of paragraphs) {
    if (p.segs.length && p.segs.every(s => s.t === 'pei') && merged.length) {
      merged[merged.length - 1].segs.push(...p.segs);
    } else merged.push(p);
  }
  return merged;
}

// 一卷多传时，按 == 章节名 == 切出单传（不含卷末【評】等章节）
function listHeaders(wt) {
  const re = /^=+\s*(.+?)\s*=+\s*$/gm;
  return [...wt.matchAll(re)].map(m => ({
    title: m[1].replace(/-\{(.+?)\}-/g, '$1').replace(/^=+|=+$/g, '').trim(),
    start: m.index,
    end: m.index + m[0].length,
  }));
}
function extractSection(wt, name) {
  const headers = listHeaders(wt);
  const i = headers.findIndex(h => h.title === name || h.title.includes(name));
  if (i < 0) throw new Error(`未找到章节「${name}」，现有：${headers.map(h => h.title).join('、')}`);
  const from = headers[i].end;
  const to = i + 1 < headers.length ? headers[i + 1].start : wt.length;
  return wt.slice(from, to);
}

async function fetchChapter(juan) {
  const page = `三國志/卷${juan}`;
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`抓取失败：${j.error.info}`);
  return j.parse.wikitext;
}

function buildEntry(personId, juan, section, paragraphs, keepBioParagraphs) {
  const page = `三國志/卷${juan}`;
  const noteCount = paragraphs.flatMap(p => p.segments ?? p.segs).filter(s => s.t === 'pei').length;
  const entry = {
    personId, page, section: section || '',
    bioSource: `a04-${String(juan).padStart(3, '0')}`,
    url: `https://zh.wikisource.org/wiki/${enc(page)}`,
    pageLabel: `卷${juan}` + (section ? `·${section}傳` : ''),
    fetched: new Date().toISOString().slice(0, 10),
    paragraphs,
  };
  if (keepBioParagraphs) entry.bioParagraphs = keepBioParagraphs;
  return { entry, noteCount };
}

export { fetchChapter, listHeaders, extractSection, parseWikitext, buildEntry };

async function main() {
  const [personId, juan, section] = process.argv.slice(2);
  if (!personId || !juan) { console.error('用法：node scripts/fetch-wikisource.mjs <personId> <卷号，如 01> [章节名]'); process.exit(1); }
  const page = `三國志/卷${juan}`;
  let wt = await fetchChapter(juan);
  if (section) wt = extractSection(wt, section);
  const paragraphs = parseWikitext(wt);
  const file = 'data/wikisource.json';
  const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const prev = db[personId];
  const { entry, noteCount } = buildEntry(personId, juan, section, paragraphs, prev?.bioParagraphs);
  db[personId] = entry;
  fs.writeFileSync(file, JSON.stringify(db, null, 2) + '\n');
  console.log(`OK: ${page} -> ${file}：${paragraphs.length} 段，${noteCount} 条裴注`);
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e.message); process.exit(1); });
