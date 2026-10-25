"""晉書命中段落 -> 人物本传段落向量，余弦相似度取最优（方法与 link-tongjian.py 一致）。
段落向量直接复用全库向量 ~/workspace/sanguo-retrieval-poc/vectors_all.npy
（键见 vec_ids_all.json：<source 文件>:<段序>；已核对与当前 data/sources 段落逐字一致），
不另行 embed。本传侧用 data/bio-vectors.npz。
阈值由 JS_LINK_THRESH 指定（缺省 0.80，与 bio-links/通鉴一致）。
输出 data/jinshu-links.json：{pid: {segId: {para, sim}}}（仅 sim >= 阈值）。
"""
import json
import os
import sys

import numpy as np

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
THRESH = float(os.environ.get("JS_LINK_THRESH", "0.80"))
POC = os.path.expanduser("~/workspace/sanguo-retrieval-poc")

matches = json.load(open("data/jinshu/matches.json", encoding="utf-8"))
segs_db = json.load(open("data/jinshu/segments.json", encoding="utf-8"))
seg_src = {}  # segId -> (sourceFile, paraIdx)
for vol, v in segs_db.items():
    for s in v["segments"]:
        seg_src[s["id"]] = (s["source"] + ".json", int(s["id"].split("-")[-1]) - 1)

vec_ids = json.load(open(os.path.join(POC, "vec_ids_all.json"), encoding="utf-8"))
row_of = {k: i for i, k in enumerate(vec_ids)}
vectors = np.load(os.path.join(POC, "vectors_all.npy"))
bioz = np.load("data/bio-vectors.npz")

links = {}
missing = 0
for pid, ms in matches.items():
    if pid not in bioz or not ms:
        continue
    B = bioz[pid].astype(np.float64)
    out = {}
    for m in ms:
        sid = m["segId"]
        src, idx = seg_src[sid]
        key = f"{src}:{idx}"
        if key not in row_of:
            missing += 1
            continue
        v = vectors[row_of[key]].astype(np.float64)
        srow = B @ v
        j = int(np.argmax(srow))
        sim = float(srow[j])
        if sim >= THRESH:
            out[sid] = {"para": j, "sim": round(sim, 3)}
    if out:
        links[pid] = out

total = sum(len(v) for v in links.values())
print(f"links: {total} 条，覆盖 {len(links)} 人（阈值 {THRESH}，缺失向量 {missing}）")
json.dump(links, open("data/jinshu-links.json", "w", encoding="utf-8"), ensure_ascii=False)
print("OK: data/jinshu-links.json")
