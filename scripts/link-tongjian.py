"""通鉴候选段落 -> 人物本传段落向量，余弦相似度取最优。
THRESH=0 只看分布；定阈值后设 TJ_LINK_THRESH 写 data/tongjian-links.json。
候选来自 data/tongjian/matches.json（字符串锚定检索）；
本传侧用现成 data/bio-vectors.npz；通鉴侧用 data/tongjian/vectors.npz。
输出 data/tongjian-links.json 严格镜像 bio-links.json 形状：
  {pid: {segId: {para, sim}}}（仅 sim >= 阈值）。
"""
import json
import os
import sys

import numpy as np

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
THRESH = float(os.environ.get("TJ_LINK_THRESH", "0.0"))

matches = json.load(open("data/tongjian/matches.json", encoding="utf-8"))
bioz = np.load("data/bio-vectors.npz")
tjz = np.load("data/tongjian/vectors.npz")
tj_idx = {k: k for k in tjz.files}  # key 已是 tj_059_001 形式

def seg_key(seg_id):
    return seg_id.replace("-", "_")

links = {}
all_sims = []
tier_sims = {1: [], 2: []}
for pid, ms in matches.items():
    if pid not in bioz:
        continue
    B = bioz[pid].astype(np.float64)
    out = {}
    for m in ms:
        sid = m["segId"]
        k = seg_key(sid)
        if k not in tjz:
            continue
        v = tjz[k].astype(np.float64)
        srow = B @ v
        j = int(np.argmax(srow))
        sim = float(srow[j])
        all_sims.append(sim)
        tier_sims[m["tier"]].append(sim)
        if sim >= THRESH:
            out[sid] = {"para": j, "sim": round(sim, 3)}
    links[pid] = out

def pct(xs, t):
    return sum(x >= t for x in xs) if xs else 0

print(f"候选 {len(all_sims)} 条")
for t in (1, 2):
    xs = sorted(tier_sims[t], reverse=True)
    print(f"tier{t}: n={len(xs)} max={xs[0]:.3f} >=0.85:{pct(xs,0.85)} >=0.80:{pct(xs,0.80)} >=0.75:{pct(xs,0.75)} >=0.60:{pct(xs,0.60)} >=0.55:{pct(xs,0.55)}" if xs else f"tier{t}: n=0")

if THRESH > 0:
    json.dump(links, open("data/tongjian-links.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    n = sum(len(v) for v in links.values())
    print(f"OK: data/tongjian-links.json，{n} 条链接（阈值 {THRESH}）")
else:
    json.dump({"tier1": sorted(tier_sims[1], reverse=True)[:50],
               "tier2": sorted(tier_sims[2], reverse=True)[:50]},
              open("/tmp/tjlink-dist.json", "w", encoding="utf-8"))
    print("分布明细 -> /tmp/tjlink-dist.json")
