#!/usr/bin/env node
// D1 摘录 × 删除自动同步：把用户在弹窗点 × 真删的摘录记入版本库 ledger，
// 使未来任何重导（generate-d1-import.mjs）都不会把已删摘录复活。
//
// 原理：D1 是 live 库，Worker 的 DELETE /api/excerpts/:id 直接删行、不留痕。
// 本脚本定期把 D1 现存 id 快照与版本库基线比对：基线有、D1 无、且不在
// ledger 中的 id，即视为用户 × 删除，自动追加到 data/excerpt-deletions.json。
//
// 用法：
//   node scripts/sync-excerpt-deletions.mjs --check   只报告，不写文件
//   node scripts/sync-excerpt-deletions.mjs --sync    更新 ledger + 快照（需人工/调用方再 git commit）
//
// 安全阀：
//  - 一次发现的新删除超过 100 条，或缺失超过基线 10%，视为重导进行中或基线
//    错误，直接中止、不写任何文件（防把一次 DROP TABLE 误判成用户删除）。
//  - D1 不可达时只告警、不写文件，调用方可继续用本地 ledger。
//  - 只追加 ledger、只更新快照；从不删 D1 数据，从不改 mentions.json。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';

const ROOT = new URL('..', import.meta.url).pathname;
const LEDGER = path.join(ROOT, 'data/excerpt-deletions.json');
const SNAPSHOT = path.join(ROOT, 'data/d1-excerpt-ids.json');
const MENTIONS = path.join(ROOT, 'data/mentions.json');
const IMPORT_SQL = path.join(ROOT, 'data/d1-import.sql');

const ACCT = '7cf57c12af6006a749d4df3c773dce90';
const DB = '87e119a3-1c8e-4f45-b7cb-5d44f0ad0ef3';
const MAX_NEW_DELETIONS = 100;   // 单次新删除上限，超限中止
const MAX_MISSING_RATIO = 0.10;  // 缺失超基线 10% 中止

function d1Token() {
  if (process.env.CLOUDFLARE_D1_TOKEN) return process.env.CLOUDFLARE_D1_TOKEN.trim();
  for (const p of [path.join(os.homedir(), '.config/sanguo/cloudflare-d1-token'), '/tmp/d1_token.txt']) {
    try {
      const t = fs.readFileSync(p, 'utf-8').trim();
      if (t) return t;
    } catch { /* ignore */ }
  }
  return null;
}

function d1Query(sql) {
  const token = d1Token();
  if (!token) throw new Error('缺少 Cloudflare D1 token（CLOUDFLARE_D1_TOKEN 或 ~/.config/sanguo/cloudflare-d1-token）');
  const payload = JSON.stringify({ sql });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${ACCT}/d1/database/${DB}/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 120000,
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          if (!j.success) return reject(new Error('D1 API 返回失败: ' + body.slice(0, 300)));
          resolve(j.result[0].results || []);
        } catch (e) { reject(new Error('D1 响应解析失败: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('D1 请求超时')); });
    req.write(payload);
    req.end();
  });
}

export async function fetchLiveIds() {
  const rows = await d1Query('SELECT id FROM excerpts;');
  return new Set(rows.map((r) => r.id));
}

export function readLedger() {
  try {
    const j = JSON.parse(fs.readFileSync(LEDGER, 'utf-8'));
    return { ledger: j, ids: new Set((j.deletions || []).map((d) => d.id)) };
  } catch {
    return { ledger: null, ids: new Set() };
  }
}

export function readSnapshot() {
  const j = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf-8'));
  return { meta: j, ids: new Set(j.ids || []) };
}

// 从本地数据源建立 id -> {person_id, citation} 映射（用于给新删条目补出处）
export function buildInfoMap() {
  const map = new Map();
  try {
    const m = JSON.parse(fs.readFileSync(MENTIONS, 'utf-8'));
    for (const p of m.people || []) {
      for (const e of p.excerpts || []) map.set(e.id, { person_id: p.id, citation: e.citation || '' });
    }
  } catch { /* mentions.json 缺失则映射为空 */ }
  return map;
}

export function diffDeletions({ liveIds, snapshotIds, ledgerIds }) {
  const missing = [...snapshotIds].filter((id) => !liveIds.has(id));
  const newDeletions = missing.filter((id) => !ledgerIds.has(id));
  const added = [...liveIds].filter((id) => !snapshotIds.has(id));
  return { missing, newDeletions, added };
}

// 供 generate-d1-import.mjs 在重导前调用：尽力把 D1 新删同步进 ledger。
// 返回 { added, warning }；D1 不可达时 warning 非空、added 为 0，调用方可继续。
export async function refreshLedgerFromD1() {
  const { ledger, ids: ledgerIds } = readLedger();
  const { meta, ids: snapshotIds } = readSnapshot();
  let liveIds;
  try {
    liveIds = await fetchLiveIds();
  } catch (e) {
    return { added: 0, warning: `D1 不可达，用本地 ledger 继续（${e.message}）` };
  }
  const { missing, newDeletions } = diffDeletions({ liveIds, snapshotIds, ledgerIds });
  if (newDeletions.length > MAX_NEW_DELETIONS || missing.length > snapshotIds.size * MAX_MISSING_RATIO) {
    return { added: 0, warning: `缺失 ${missing.length}/${snapshotIds.size} 条（新删 ${newDeletions.length}），触发安全阀：可能正在重导或基线错误，未同步` };
  }
  if (newDeletions.length === 0) {
    writeSnapshot(liveIds, meta);
    return { added: 0, warning: null };
  }
  const info = buildInfoMap();
  const today = new Date().toISOString().slice(0, 10);
  const target = ledger || { _comment: '', deletions: [] };
  for (const id of newDeletions) {
    const m = info.get(id) || {};
    target.deletions.push({
      id,
      person_id: m.person_id || '',
      citation: m.citation || '',
      reason: '用户在弹窗点 × 真删（同步脚本自动记录；判定原因以校对记录为准）',
      decided_by: '用户人工判定',
      deleted_at: today,
      deleted_from: 'D1',
    });
  }
  fs.writeFileSync(LEDGER, JSON.stringify(target, null, 1) + '\n');
  writeSnapshot(liveIds, meta);
  return { added: newDeletions.length, warning: null };
}

function writeSnapshot(liveIds, meta) {
  const out = {
    _comment: 'D1 excerpts 表 id 全量快照，用于 × 删除自动同步的基线比对。由 scripts/sync-excerpt-deletions.mjs 维护，勿手工改。',
    generated_at: new Date().toISOString(),
    baseline_source: meta.baseline_source || '',
    count: liveIds.size,
    ids: [...liveIds].sort(),
  };
  fs.writeFileSync(SNAPSHOT, JSON.stringify(out) + '\n');
}

async function main() {
  const mode = process.argv.includes('--sync') ? 'sync' : 'check';
  const { ids: ledgerIds } = readLedger();
  let snapshotIds, meta;
  try {
    ({ meta, ids: snapshotIds } = readSnapshot());
  } catch (e) {
    console.error(`读快照失败（${SNAPSHOT}）：${e.message}`);
    process.exit(2);
  }
  let liveIds;
  try {
    liveIds = await fetchLiveIds();
  } catch (e) {
    console.error(`D1 读取失败：${e.message}\n未写任何文件。`);
    process.exit(2);
  }
  console.log(`D1 现存 ${liveIds.size} 条；基线 ${snapshotIds.size} 条；ledger 已记 ${ledgerIds.size} 条`);
  const { missing, newDeletions, added } = diffDeletions({ liveIds, snapshotIds, ledgerIds });
  if (newDeletions.length > MAX_NEW_DELETIONS || missing.length > snapshotIds.size * MAX_MISSING_RATIO) {
    console.error(`安全阀触发：缺失 ${missing.length}/${snapshotIds.size}（新删 ${newDeletions.length}）。可能正在重导或基线错误，中止，未写文件。`);
    process.exit(3);
  }
  if (newDeletions.length === 0) {
    console.log(`无新增 × 删除。${added.length > 0 ? `D1 新增 ${added.length} 条（基线已更新）。` : ''}`);
    if (mode === 'sync' && added.length > 0) { writeSnapshot(liveIds, meta); console.log('快照已更新。'); }
    return;
  }
  const info = buildInfoMap();
  console.log(`发现 ${newDeletions.length} 条新增 × 删除：`);
  for (const id of newDeletions) {
    const m = info.get(id) || {};
    console.log(`  - ${id}  ${m.person_id || '?'}  ${m.citation || '(出处未知)'}`);
  }
  if (mode === 'check') { console.log('--check 模式：未写文件。'); return; }
  const { ledger } = readLedger();
  const today = new Date().toISOString().slice(0, 10);
  for (const id of newDeletions) {
    const m = info.get(id) || {};
    ledger.deletions.push({
      id,
      person_id: m.person_id || '',
      citation: m.citation || '',
      reason: '用户在弹窗点 × 真删（同步脚本自动记录；判定原因以校对记录为准）',
      decided_by: '用户人工判定',
      deleted_at: today,
      deleted_from: 'D1',
    });
  }
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1) + '\n');
  writeSnapshot(liveIds, meta);
  console.log(`已追加 ${newDeletions.length} 条到 ledger，快照已更新。请检查后 git commit（不推送）。`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
