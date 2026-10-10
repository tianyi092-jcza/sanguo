// 从中文维基文库抓取《三國志》卷01-65 全文，替换 data/sources/a04-*.json（原为 sidneyluo.net）。
// 用法：node scripts/fetch-wikisource-volumes.mjs [start] [end]
//   如：node scripts/fetch-wikisource-volumes.mjs 1 10  （抓卷01-10）
import fs from 'node:fs';
import crypto from 'node:crypto';

const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';

async function fetchVolume(juan) {
  const juanStr = String(juan).padStart(2, '0');
  const page = `三國志/卷${juanStr}`;
  const q = new URLSearchParams({ action: 'parse', page, prop: 'text', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error.info);
  const html = j.parse.text;
  // 提取 <p> 段落，去掉导航/模板
  const paras = [];
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRe.exec(html))) {
    let t = m[1]
      .replace(/<[^>]+>/g, '')  // 去标签
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    // 跳过导航/分类/空段
    if (!t) continue;
    if (/^(←|→|上一卷|下一卷|目錄)/.test(t)) continue;
    if (t.length < 10) continue; // 太短的可能是标题残留
    paras.push(t);
  }
  const url = `https://zh.wikisource.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`;
  const key = `a04-${String(juan).padStart(3, '0')}`;
  const item = {
    id: key,
    title: j.parse.title,
    url,
    accessed: new Date().toISOString().slice(0, 10),
    sha256: crypto.createHash('sha256').update(html).digest('hex'),
    paragraphs: paras,
  };
  fs.writeFileSync(`data/sources/${key}.json`, JSON.stringify(item, null, 2), 'utf-8');
  return `${key}: ${paras.length} 段`;
}

const start = parseInt(process.argv[2] || '1', 10);
const end = parseInt(process.argv[3] || '65', 10);
for (let j = start; j <= end; j++) {
  try {
    const r = await fetchVolume(j);
    console.log('OK', r);
  } catch (e) {
    console.log('FAIL 卷' + j, e.message);
  }
  // 礼貌延迟
  await new Promise(r => setTimeout(r, 1000));
}
