// 构建时应用考據引文维基迁移 overrides（data/wikisource-overrides.json）。
// 背景：data/history.json 是构建产物，每次 build 都从源数据重生成，直接改它会被覆盖；
// 迁移与人工决定持久化在此 overrides 文件中，构建时应用到 makeHistory() 的结果上。
// 应用顺序：先 deletions（逐条删首个匹配），后 replacements（替换全部匹配）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FIELDS = ['facts', 'affiliations', 'hanOffices'];
const srcOf = it => { const s = it.source; return Array.isArray(s) ? s[0] : s; };

export function applyWikisourceOverrides(history) {
  const file = path.join(ROOT, 'data', 'wikisource-overrides.json');
  if (!fs.existsSync(file)) return { replaced: 0, deleted: 0, skipped: true };
  const ov = JSON.parse(fs.readFileSync(file, 'utf8'));
  const P = history.people || {};
  let nDel = 0, nRep = 0;
  for (const d of ov.deletions || []) {
    const arr = P[d.pid]?.[d.field];
    if (!arr) continue;
    const i = arr.findIndex(it => srcOf(it) === d.src && it.quote === d.orig);
    if (i >= 0) { arr.splice(i, 1); nDel++; }
  }
  for (const r of ov.replacements || []) {
    const arr = P[r.pid]?.[r.field];
    if (!arr) continue;
    for (const it of arr) {
      if (srcOf(it) === r.src && it.quote === r.orig) {
        it.quote = r.new;
        it.wsMigrated = true;
        it.wsSource = r.wsSource;
        nRep++;
      }
    }
  }
  return { replaced: nRep, deleted: nDel, skipped: false };
}
