// 从维基文库抓取《後漢書》志第十九-二十三（郡國一至五），解析州郡县层级。
// 用法：node scripts/fetch-junguo-zhi.mjs
import fs from 'node:fs';

const UA = 'sanguo-research/1.0 (tianyi092@gmail.com)';
const API = 'https://zh.wikisource.org/w/api.php';

const VOLUMES = [
  { page: '後漢書/志第十九', name: '郡國一' },
  { page: '後漢書/志第二十', name: '郡國二' },
  { page: '後漢書/志第二十一', name: '郡國三' },
  { page: '後漢書/志第二十二', name: '郡國四' },
  { page: '後漢書/志第二十三', name: '郡國五' },
];

async function fetchVolume(page) {
  const q = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  if (j.error) throw new Error(j.error.info);
  return j.parse.wikitext;
}

for (const v of VOLUMES) {
  try {
    const wt = await fetchVolume(v.page);
    const fn = `data/junguo-zhi-${v.name}.txt`;
    fs.writeFileSync(fn, wt, 'utf-8');
    console.log(`OK ${v.page} (${v.name}): ${wt.length} chars`);
  } catch (e) {
    console.log(`FAIL ${v.page}:`, e.message);
  }
  await new Promise(r => setTimeout(r, 1000));
}
