#!/usr/bin/env python3
# 从 sidneyluo 抓每人的本传全文，存入 D1 biographies 表（高效版：预抓65卷）
import json, re, urllib.request, time, os

NAME_TRAD = 'data/name-trad.json' if os.path.exists('data/name-trad.json') else '/tmp/name-trad.json'

def _d1_token():
    import os as _os
    t = _os.environ.get("CLOUDFLARE_D1_TOKEN")
    if not t:
        for _p in (_os.path.expanduser("~/.config/sanguo/cloudflare-d1-token"),
                   "/tmp/d1_token.txt"):
            if _os.path.exists(_p):
                t = open(_p).read().strip()
                if t:
                    break
    if not t:
        raise SystemExit("缺少 Cloudflare D1 token：请设置环境变量 CLOUDFLARE_D1_TOKEN，或写入 ~/.config/sanguo/cloudflare-d1-token")
    return t
TOKEN = _d1_token()
ACCT = "7cf57c12af6006a749d4df3c773dce90"
DB = "87e119a3-1c8e-4f45-b7cb-5d44f0ad0ef3"
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCT}/d1/database/{DB}/query"

def api(sql, params=None):
    payload = {"sql": sql}
    if params: payload["params"] = params
    data = json.dumps(payload).encode()
    req = urllib.request.Request(URL, data=data, headers={
        "Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

with open('data/original.json', encoding='utf-8') as f:
    d = json.load(f)
pers = [p for p in d['per'] if p['n'] != '貂蝉']
with open(NAME_TRAD, encoding='utf-8') as f:
    name_trad = json.load(f)
print(f"共 {len(pers)} 人", flush=True)

# 已有本传的跳过
r = api("SELECT person_id FROM biographies;")
have = set(row['person_id'] for row in r['result'][0]['results'])
print(f"已有 {len(have)} 篇", flush=True)

# 整卷即一人本传（纪/传无独立标题行，正文紧随卷标题行之后）：人名(简体) -> (卷号, 传名)
SINGLE_BIO = {
    '曹操': ('001', '武帝紀'),
    '曹丕': ('002', '文帝紀'),
    '曹叡': ('003', '明帝紀'),
    '刘备': ('032', '先主傳'),
    '刘禅': ('033', '後主傳'),
    '孙权': ('047', '吳主傳'),
}

# 页尾导航杂行（卷末）：去掉
TAIL_CHROME = re.compile(r'Footer\(\);|三國志目錄|^[上下]卷$')

def get_vol(num):
    url = f"http://www.sidneyluo.net/a/a04/{num}.html"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode('utf-8', errors='ignore')
    m = re.search(r'<body[^>]*>(.*?)</body>', html, re.S)
    body = m.group(1) if m else html
    body = re.sub(r'<br\s*/?>', '\n', body)
    body = re.sub(r'</p\s*>', '\n', body)
    text = re.sub(r'<[^>]+>', '', body)
    return [ln.strip() for ln in text.split('\n') if ln.strip()]

# 预抓65卷
print("抓65卷...", flush=True)
vols = {}
for n in range(1, 66):
    num = f"{n:03d}"
    try:
        vols[num] = get_vol(num)
    except Exception as e:
        print(f"卷{num}失败: {e}", flush=True)
    time.sleep(0.1)
print(f"抓到 {len(vols)} 卷", flush=True)

# 为每卷建传记索引：传名 -> (起始行, 结束行)
# sidneyluo格式：传名独占一行（如"周瑜傳"），正文从下一行开始（如"周瑜字公瑾..."）
def build_bio_index(lines):
    idx = []  # (bio_name, start_line_of_text)
    for i, ln in enumerate(lines):
        clean = re.sub(r'\s+', '', ln)
        # 传名独占一行：2-6个字+傳，且行内没有其他内容
        m = re.fullmatch(r'([一-鿿]{2,6}傳)', clean)
        if m:
            # 下一行应是正文（以人名+字开头，或至少不是另一个传名）
            idx.append((m.group(1), i+1))
    out = {}
    for k in range(len(idx)):
        name, s = idx[k]
        e = idx[k+1][1]-1 if k+1 < len(idx) else len(lines)
        if name not in out:
            out[name] = (s, e)
    return out

vol_bio = {num: build_bio_index(lines) for num, lines in vols.items()}

def extract_single_bio(lines):
    """整卷单传：找卷标题行（以"卷"开头），正文从下一行起，去掉卷末导航杂行"""
    ti = next((i for i, ln in enumerate(lines)
               if re.sub(r'\s+', '', ln).startswith('卷')), None)
    body = lines[ti+1:] if ti is not None else lines
    while body and TAIL_CHROME.search(body[-1]):
        body.pop()
    return '\n'.join(body).strip()

done = 0
for idx, p in enumerate(pers):
    pid = f"p{idx+1:04d}"
    if pid in have:
        continue
    name = p['n']
    name_t = name_trad.get(name, name)
    found = None
    # 整卷单传（纪/先主傳/後主傳/吳主傳）：无独立标题行，正文紧随卷标题行
    if name in SINGLE_BIO:
        num, bio_name = SINGLE_BIO[name]
        full = extract_single_bio(vols.get(num, []))
        if full:
            found = (f'a04-{num}', bio_name, full)
        else:
            print(f"{pid} {name}: 整卷正文为空，跳过", flush=True)
    else:
        bio_name = name_t + '傳'
        # 找傳（传名独占一行）
        for num, bidx in vol_bio.items():
            if bio_name in bidx:
                s, e = bidx[bio_name]
                full = '\n'.join(vols[num][s:e])
                found = (f'a04-{num}', bio_name, full)
                break
    if not found:
        print(f"{pid} {name}: 未定位到本传", flush=True)
        continue
    if found:
        vol, bn, full = found
        if len(full) > 90000:
            print(f"{pid} {name}: 太长跳过", flush=True)
            continue
        try:
            api("INSERT INTO biographies (person_id, volume, bio_name, full_text) VALUES (?,?,?,?);",
                params=[pid, vol, bn, full])
            done += 1
            if done % 20 == 0:
                print(f"已存 {done} 篇...", flush=True)
        except Exception as e:
            print(f"{pid} {name}: 失败 {e}", flush=True)

print(f"共存入 {done} 篇本传", flush=True)
