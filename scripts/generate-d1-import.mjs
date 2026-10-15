#!/usr/bin/env node
// 生成 D1 导入 SQL：data/mentions.json -> excerpts 表
import fs from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const m = JSON.parse(fs.readFileSync(`${ROOT}/data/mentions.json`, 'utf-8'));

// 人工校对删除 ledger：用户在弹窗点 × 真删的 D1 摘录，重导时必须过滤，
// 否则会把用户已判定的删除复活。删错可从 D1 备份恢复，再从 ledger 移除对应条目。
let deletedIds = new Set();
try {
  const ledger = JSON.parse(fs.readFileSync(`${ROOT}/data/excerpt-deletions.json`, 'utf-8'));
  for (const d of ledger.deletions || []) deletedIds.add(d.id);
} catch { /* ledger 不存在则不过滤 */ }

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

let count = 0, filtered = 0;
for (const p of m.people) {
  for (const e of p.excerpts) {
    if (deletedIds.has(e.id)) { filtered++; continue; } // 用户已真删：重导不得复活
    // 转义单引号，去掉换行（D1 Console 按行解析）
    const esc = s => String(s || '').replace(/'/g, "''").replace(/\r?\n/g, ' ');
    sql += `INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('${esc(e.id)}', '${esc(p.id)}', '${esc(e.work)}', '${esc(e.source)}', '${esc(e.citation)}', '${esc(e.quote)}');\n`;
    count++;
  }
}

fs.writeFileSync(`${ROOT}/data/d1-import.sql`, sql);
console.log(`生成 ${count} 条 INSERT（过滤用户已删 ${filtered} 条），已写入 data/d1-import.sql`);
