// 由 data/sources 的《晉書》语料（a05）构建分段语料 data/jinshu/segments.json。
// 选源规则（与 reextract-mentions-sidneyluo 一致）：优先正文版 a05-NNN.json，
// 无正文版时用 a05-NNN-ahcb.json；忽略 -full 等备用抓取。
// 底本说明：sidneyluo（漢川草廬）晉書仅上线卷1–19（该站目录实测止于卷十九），
// 卷20–130 在该站无页面，沿用库内 ahcb 四库全书本补全（专案既定做法，见 fetch-ahcb-corpora.py）。
// 每段一段：{id: js-<卷>-<序>, vol, source, citation, text, html}；citation 为卷题级
// 《晉書·卷X‧…》（与通鉴按年节标题同级粒度）。
import fs from 'node:fs';

const SRC_DIR = 'data/sources';
const files = fs.readdirSync(SRC_DIR);
const byVol = new Map();
for (let v = 1; v <= 130; v++) {
  const key = String(v).padStart(3, '0');
  const plain = `a05-${key}.json`;
  const ahcb = `a05-${key}-ahcb.json`;
  if (files.includes(plain)) byVol.set(key, plain);
  else if (files.includes(ahcb)) byVol.set(key, ahcb);
  else throw new Error(`晉書卷${key} 无语料文件`);
}

function citationOf(title) {
  let t = title.replace(/^二十四史-/, '').replace(/^晉書-/, '');
  t = t.replace(/・/g, '‧');
  return `《晉書·${t}》`;
}

const out = {};
let tot = 0, fromSidneyluo = 0;
for (const [vol, fname] of [...byVol.entries()].sort()) {
  const rec = JSON.parse(fs.readFileSync(`${SRC_DIR}/${fname}`, 'utf8'));
  const citation = citationOf(rec.title);
  if (rec.url && rec.url.includes('sidneyluo.net')) fromSidneyluo++;
  const segments = rec.paragraphs.map((p, i) => ({
    id: `js-${vol}-${String(i + 1).padStart(3, '0')}`,
    vol,
    source: rec.id,
    citation,
    html: p,
    text: p,
  }));
  out[vol] = { page: rec.title, url: rec.url, segments };
  tot += segments.length;
}
fs.mkdirSync('data/jinshu', { recursive: true });
fs.writeFileSync('data/jinshu/segments.json', JSON.stringify(out, null, 1));
console.log(`OK: data/jinshu/segments.json（130 卷，共 ${tot} 段；其中 sidneyluo 底本 ${fromSidneyluo} 卷，ahcb 补全 ${130 - fromSidneyluo} 卷）`);
