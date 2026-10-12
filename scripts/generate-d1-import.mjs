#!/usr/bin/env node
// 生成 D1 导入 SQL：data/mentions.json -> excerpts 表
import fs from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const m = JSON.parse(fs.readFileSync(`${ROOT}/data/mentions.json`, 'utf-8'));

let sql = `-- sanguo excerpts D1 初始化
DROP TABLE IF EXISTS excerpts;
CREATE TABLE excerpts (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  work TEXT NOT NULL,
  source TEXT NOT NULL,
  citation TEXT NOT NULL,
  quote TEXT NOT NULL
);
CREATE INDEX idx_excerpts_person ON excerpts(person_id);
`;

let count = 0;
for (const p of m.people) {
  for (const e of p.excerpts) {
    // 转义单引号，去掉换行（D1 Console 按行解析）
    const esc = s => String(s || '').replace(/'/g, "''").replace(/\r?\n/g, ' ');
    sql += `INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('${esc(e.id)}', '${esc(p.id)}', '${esc(e.work)}', '${esc(e.source)}', '${esc(e.citation)}', '${esc(e.quote)}');\n`;
    count++;
  }
}

fs.writeFileSync(`${ROOT}/data/d1-import.sql`, sql);
console.log(`生成 ${count} 条 INSERT，已写入 data/d1-import.sql`);
