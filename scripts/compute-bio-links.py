"""他传段落向量 -> 本传段落向量，余弦相似度取最优。
THRESH=0 只看分布；定阈值后设 BIO_LINK_THRESH 写 data/bio-links.json。
他传侧用全库现成段落向量（vectors_all.npy），本传侧用 data/bio-vectors.npz。
"""
import json
import os

import numpy as np

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
THRESH = float(os.environ.get("BIO_LINK_THRESH", "0.0"))


def norm_src(s):
    return str(s).replace("-ahcb", "").replace("-full", "")


db = json.load(open("data/wikisource.json", encoding="utf-8"))
review = json.load(open("data/person-second-review.json", encoding="utf-8"))
bioz = np.load("data/bio-vectors.npz")
ids = json.load(open(os.path.expanduser("~/workspace/sanguo-retrieval-poc/vec_ids_all.json")))
vecs = np.load(os.path.expanduser("~/workspace/sanguo-retrieval-poc/vectors_all.npy"))
idx = {v: i for i, v in enumerate(ids)}

links = {}
for pid, bio in db.items():
    B = bioz[pid].astype(np.float64)
    row = next((r for r in review["people"] if r["id"] == pid), None)
    if row is None:
        continue
    bio_src = norm_src(bio["bioSource"])
    rng = bio.get("bioParagraphs")

    def in_bio(e):
        if e["work"] != "sanguozhi" or norm_src(e["source"]) != bio_src:
            return False
        if not rng:
            return True
        return rng[0] <= e["paragraph"] <= rng[1]

    out, sims, detail = {}, [], []
    for e in row["excerpts"]:
        if e["work"] != "sanguozhi" or in_bio(e):
            continue
        key = f"{e['source']}.json:{e['paragraph']}"
        if key not in idx:
            continue
        v = vecs[idx[key]].astype(np.float64)
        v /= np.linalg.norm(v)
        srow = B @ v
        j = int(np.argmax(srow))
        sim = float(srow[j])
        sims.append(sim)
        detail.append((sim, e["id"], j))
        if sim >= THRESH:
            out[e["id"]] = {"para": j, "sim": round(sim, 3)}
    links[pid] = (out, sims, detail)
    sims.sort(reverse=True)
    if sims:
        print(f"{pid}: 他传 {len(sims)} 条 max={sims[0]:.3f} "
              f">=0.85:{sum(s >= 0.85 for s in sims)} "
              f">=0.80:{sum(s >= 0.80 for s in sims)} "
              f">=0.75:{sum(s >= 0.75 for s in sims)}")

if THRESH > 0:
    json.dump({pid: out for pid, (out, _, _) in links.items()},
              open("data/bio-links.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("OK: data/bio-links.json")
else:
    # 存明细供抽查
    json.dump({pid: [{"sim": round(s, 3), "id": i, "para": p} for s, i, p in sorted(d, reverse=True)[:15]]
               for pid, (_, _, d) in links.items()},
              open("/tmp/biolink-top.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("top 明细 -> /tmp/biolink-top.json")
