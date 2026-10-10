// 从中文维基文库抓取《資治通鑑》卷059–081 wikitext，存 data/tongjian/raw/<vol>.txt。
// 用法：node scripts/fetch-tongjian.mjs [059] [081]   （缺省全量 059–081；已存在文件跳过）
// 页面命名：資治通鑑/卷NNN（三位零填充），与 fetch-wikisource.mjs 同一 API + UA。
import fs from 'node:fs';
import path from 'node:path';

const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';
const RAW_DIR = 'data/tongjian/raw';

const pad3 = n => String(n).padStart(3, '0');

async function fetchVol(vol) {
  const page = `資治通鑑/卷${vol}`;
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(`${page} 抓取失败：${j.error.info}`);
  return j.parse.wikitext;
}

async function main() {
  const [fromS, toS] = process.argv.slice(2);
  const from = fromS ? parseInt(fromS, 10) : 59;
  const to = toS ? parseInt(toS, 10) : 81;
  fs.mkdirSync(RAW_DIR, { recursive: true });
  let ok = 0, skip = 0;
  for (let v = from; v <= to; v++) {
    const vol = pad3(v);
    const fp = path.join(RAW_DIR, `${vol}.txt`);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 0) { skip++; continue; }
    const wt = await fetchVol(vol);
    fs.writeFileSync(fp, wt);
    ok++;
    console.log(`OK 卷${vol}：${wt.length} 字`);
    await new Promise(r => setTimeout(r, 800)); // 礼貌间隔
  }
  console.log(`完成：抓取 ${ok} 卷，跳过 ${skip} 卷（已存在）`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
