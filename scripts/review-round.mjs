// scripts/review-round.mjs
// 一轮复核的最小工作单：只输出本轮必需的状态（<15KB，<1秒）。
// 定时任务每轮只许运行本脚本 + review-progress.mjs，严禁整读
// data/person-second-review.json（>200KB，会截断并烧掉轮次预算），
// 也不要重读 PERSON_SECOND_REVIEW.md / AGENTS.md 全文。
import fs from 'node:fs';
import {makeHistory} from './history.mjs';

const review = JSON.parse(fs.readFileSync('data/person-second-review.json', 'utf8'));
const people = review.people || [];
const byId = new Map(people.map(row => [row.id, row]));

// 当前人物：pilot 优先，否则取 review 文件中第一个未 complete 的，
// 否则按原库顺序取第一个未复核的人（新起一条记录）。
let current = people.find(p => p.status === 'pilot') || people.find(p => p.status !== 'complete');
let isNew = false;
if (!current) {
  const {data} = makeHistory(JSON.parse(fs.readFileSync('data/original.json', 'utf8')));
  const next = data.per.find(person => !byId.has(person.id));
  if (!next) {
    process.stdout.write(JSON.stringify({done: true, remaining: 0}) + '\n');
    process.exit(0);
  }
  current = {id: next.id, name: next.n, status: 'unreviewed', excerpts: [], exclusions: [], unresolved: []};
  isNew = true;
}

const excerpts = current.excerpts || [];
const exclusions = current.exclusions || [];
const unresolved = current.unresolved || [];

// 已覆盖的（来源:段落）集合：excerpt 与 exclusion 都算，避免重复录入。
const covered = [];
const seen = new Set();
for (const e of [...excerpts, ...exclusions]) {
  if (e.source == null || e.paragraph == null) continue;
  const k = `${e.source}:${e.paragraph}`;
  if (!seen.has(k)) { seen.add(k); covered.push(k); }
}

const out = {
  done: false,
  isNew,
  person: {id: current.id, name: current.name, status: current.status},
  counts: {excerpts: excerpts.length, exclusions: exclusions.length, unresolved: unresolved.length},
  // 本轮目标：unresolved 前 3 条（字符串备忘）；单条卡住可跳过，留给下轮。
  target: unresolved[0] ?? null,
  targets: unresolved.slice(0, 3),
  covered,
  // 新条目字段格式照抄模板（context 可选；citation 纯文本无 URL）。
  templateExcerpt: excerpts[excerpts.length - 1] ?? null,
  templateExclusion: exclusions[exclusions.length - 1] ?? null,
  rule: '本轮新增最多 3 条 excerpt/exclusion（按 targets 顺序逐条处理；单条卡住超过约 3 分钟可跳过，留给下轮；做不完 3 条就提交已做好的部分，不硬凑）；不要打开 data/person-second-review.json、PERSON_SECOND_REVIEW.md、AGENTS.md 全文；校验速查见定时任务正文。'
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
