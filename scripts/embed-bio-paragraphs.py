"""Embed 维基文库本传段落（纯文本），增量写入 data/bio-vectors.npz。

可断点续跑：已存在的人物跳过。只 embed 本传段落（132 段）；
他传侧直接用全库现成段落向量（vectors_all.npy），无需重复 embed。
"""
import json
import os
import re
import sys

import numpy as np
from fastembed import TextEmbedding

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

db = json.load(open("data/wikisource.json", encoding="utf-8"))
out_path = "data/bio-vectors.npz"
done = {}
if os.path.exists(out_path):
    z = np.load(out_path, allow_pickle=True)
    done = {k: z[k] for k in z.files}
    print(f"已载入 {len(done)} 人物向量", flush=True)

todo = [pid for pid in db if pid not in done]
if not todo:
    print("全部完成，无需 embed", flush=True)
    sys.exit(0)

print(f"加载模型，待 embed: {todo}", flush=True)
model = TextEmbedding(
    model_name="jinaai/jina-embeddings-v2-base-zh",
    cache_dir=os.path.expanduser("~/workspace/sanguo-retrieval-poc/model_cache"),
)

for pid in todo:
    paras = []
    for p in db[pid]["paragraphs"]:
        t = "".join(s["h"] for s in p["segs"] if s["t"] == "text")
        t = re.sub(r"<[^>]*>", "", t).strip()
        paras.append(t)
    # 分块 embed，每块落盘一次，防长任务被杀
    CHUNK = 25
    vecs = [None] * len(paras)
    start = 0
    chunk_file = f"data/bio-vectors.{pid}.partial.json"
    if os.path.exists(chunk_file):
        saved = json.load(open(chunk_file))
        for i, v in saved.items():
            vecs[int(i)] = v
        start = max(int(i) for i in saved) + 1
        print(f"{pid}: 断点续跑，自段 {start}", flush=True)
    for s in range(start, len(paras), CHUNK):
        chunk = paras[s:s + CHUNK]
        emb = np.array(list(model.embed(chunk)), dtype=np.float32)
        emb /= np.linalg.norm(emb, axis=1, keepdims=True)
        for k, v in enumerate(emb):
            vecs[s + k] = v.tolist()
        json.dump({str(i): v for i, v in enumerate(vecs) if v is not None},
                  open(chunk_file, "w"))
        print(f"{pid}: 段 {s}-{s + len(chunk) - 1} 完成", flush=True)
    done[pid] = np.array(vecs, dtype=np.float32)
    np.savez(out_path, **done)
    if os.path.exists(chunk_file):
        os.remove(chunk_file)
    print(f"OK {pid}: {len(paras)} 段，已落盘", flush=True)

print("DONE", flush=True)
