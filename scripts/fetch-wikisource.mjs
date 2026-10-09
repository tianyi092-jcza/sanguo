// 从中文维基文库抓取《三國志》某卷 wikitext，解析正文与裴注，写入 data/wikisource.json。
// 用法：node scripts/fetch-wikisource.mjs p0001 01
//   p0001: 人物 id；01: 卷号（零填充两位，对应文库页面「三國志/卷01」）
// 注文在 wikitext 中以 {{*|…}} 包裹；解析为分段结构，正文/注文分离，
// 注文内链（书名等）转为绝对 URL，渲染时以「裴注」标签 + 悬停弹窗呈现。
import fs from 'node:fs';

const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';
const DROP_TEMPLATES = new Set(['header', 'footer', '西晉作品', '另', 'Textquality', '!']);

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

// 删除顶层指定模板（header/footer/许可/顶注等）
function dropTopTemplates(s) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s.startsWith('{{', i)) {
      const b = extractBalanced(s, i);
      if (!b) { out += s.slice(i); break; }
      if (DROP_TEMPLATES.has(templateName(b.inner))) { i = b.end; continue; }
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
  if (!target || target.startsWith('#')) return escHtml(text);
  const hash = target.indexOf('#');
  const page = hash < 0 ? target : target.slice(0, hash);
  const frag = hash < 0 ? '' : target.slice(hash + 1);
  const href = 'https://zh.wikisource.org/wiki/' + enc(page) + (frag ? '#' + enc(frag) : '');
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escHtml(text)}</a>`;
}

function templateHTML(inner) {
  const name = templateName(inner);
  const bar = inner.indexOf('|');
  const rest = bar < 0 ? '' : inner.slice(bar + 1);
  if (name === 'YL' || name === 'ProperNoun') return inline(rest.split('|').pop() || '');
  if (name === 'WavyBookMark') return inline(rest);
  const parts = rest.split('|');
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

function parseWikitext(wt) {
  wt = wt.replace(/<!--[\s\S]*?-->/g, '');
  wt = dropTopTemplates(wt);
  const paragraphs = [];
  for (const raw of wt.split(/\n{2,}/)) {
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

async function main() {
  const [personId, juan] = process.argv.slice(2);
  if (!personId || !juan) { console.error('用法：node scripts/fetch-wikisource.mjs <personId> <卷号，如 01>'); process.exit(1); }
  const page = `三國志/卷${juan}`;
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`抓取失败：${j.error.info}`);
  const paragraphs = parseWikitext(j.parse.wikitext);
  const noteCount = paragraphs.flatMap(p => p.segments ?? p.segs).filter(s => s.t === 'pei').length;
  const file = 'data/wikisource.json';
  const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  db[personId] = {
    personId, page,
    url: `https://zh.wikisource.org/wiki/${enc(page)}`,
    pageLabel: `卷${juan}`,
    fetched: new Date().toISOString().slice(0, 10),
    paragraphs,
  };
  fs.writeFileSync(file, JSON.stringify(db, null, 2) + '\n');
  console.log(`OK: ${page} -> ${file}：${paragraphs.length} 段，${noteCount} 条裴注`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
