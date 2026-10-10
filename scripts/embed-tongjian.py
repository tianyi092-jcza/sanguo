"""Embed 通鉴段落（纯文本），增量写入 data/tongjian-vectors.npz。

可断点续跑：data/tongjian/embed-progress.json 记录已完成的 segment id。
分块 embed，每块落盘一次，防长任务被杀（VM 约2分钟 SIGKILL）。
模型：jinaai/jina-embeddings-v2-base-zh（与全库向量一致），L2 归一化。
"""
import json
import os
import sys

import numpy as np

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SEGS_FILE = "data/tongjian/segments.json"
OUT_PATH = "data/tongjian/vectors.npz"
PROGRESS_FILE = "data/tongjian/embed-progress.json"
CHUNK = 40

db = json.load(open(SEGS_FILE, encoding="utf-8"))
items = []
for vol in sorted(db.keys()):
    for s in db[vol]["segments"]:
        items.append((s["id"], s["text"]))
print(f"共 {len(items)} 段", flush=True)

done = {}
if os.path.exists(PROGRESS_FILE):
    done = json.load(open(PROGRESS_FILE, encoding="utf-8"))
    print(f"断点续跑：已完成 {len(done)} 段", flush=True)

todo = [(i, t) for i, t in items if i not in done]
if not todo:
    print("全部完成，无需 embed", flush=True)
    sys.exit(0)

print(f"加载模型，待 embed {len(todo)} 段", flush=True)
from fastembed import TextEmbedding
model = TextEmbedding(
    model_name="jinaai/jina-embeddings-v2-base-zh",
    cache_dir=os.path.expanduser("~/workspace/sanguo-retrieval-poc/model_cache"),
)

for s in range(0, len(todo), CHUNK):
    chunk = todo[s:s + CHUNK]
    ids = [i for i, _ in chunk]
    texts = [t for _, t in chunk]
    try:
        emb = np.array(list(model.embed(texts)), dtype=np.float32)
    except Exception as e:
        print(f"embed 失败（段 {s}）：{e}，已落盘进度后退出", flush=True)
        json.dump(done, open(PROGRESS_FILE, "w"))
        sys.exit(2)
    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    norms[norms == 0] = 1
    emb /= norms
    for i, v in zip(ids, emb):
        done[i] = v.tolist()
    json.dump(done, open(PROGRESS_FILE, "w"))
    print(f"段 {s}-{s + len(chunk) - 1} 完成（累计 {len(done)}/{len(items)}）", flush=True)

# 写 npz（key 为 segment id；npz key 不能含特殊字符，tj-059-001 合法）
np.savez(OUT_PATH, **{k.replace("-", "_"): np.array(v, dtype=np.float32) for k, v in done.items()})
print(f"OK: {OUT_PATH}，{len(done)} 段", flush=True)
