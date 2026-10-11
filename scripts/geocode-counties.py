#!/usr/bin/env python3
"""Batch-geocode sanguo counties that lack coordinates via OSM Nominatim.

Worklist: data/original.json -> cty entries with no `lat` and a solid `mod`
(mod present, no '不詳', not starting with '約當今'; vague 約當今/unknown
entries are deliberately left coordinate-less per the user's quality bar).

State: data/county-geocode-results.json, keyed by cty index, flushed after
every request. Resume-safe and idempotent: --chunk N processes up to N
unfinished entries per invocation (Nominatim policy: max 1 req/s, we use
~1.2s spacing).

--apply: QA + wire accepted coords into data/original.json (lon/lat) and
write data/county-geocode-review.json {applied, flagged} for human review.
--dry-apply: report QA decisions without writing.

QA rule (fail-safe: reject -> flagged, never applied):
  1. non-empty Nominatim response
  2. country_code == 'cn'
  3. normalized province part of `mod` appears in normalized display_name
  4. normalized locality core of `mod` (len>=2) appears in normalized
     display_name
Normalization maps common traditional place-name variants to simplified.
"""
import argparse, json, os, sys, time, urllib.parse, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGINAL = os.path.join(REPO, 'data', 'original.json')
RESULTS = os.path.join(REPO, 'data', 'county-geocode-results.json')
REVIEW = os.path.join(REPO, 'data', 'county-geocode-review.json')

UA = 'sanguo-junxian-geocoder (https://sanguo.720108.xyz)'
NOMINATIM = 'https://nominatim.openstreetmap.org/search'
MAX_ATTEMPTS = 3
SLEEP_S = 1.2

# traditional -> simplified for common place-name characters
VARIANTS = {
    '縣': '县', '區': '区', '鎮': '镇', '鄉': '乡', '廣': '广', '東': '东',
    '門': '门', '陽': '阳', '陰': '阴', '寧': '宁', '慶': '庆', '龍': '龙',
    '鳳': '凤', '華': '华', '義': '义', '豐': '丰', '樂': '乐', '開': '开',
    '關': '关', '邊': '边', '達': '达', '遠': '远', '運': '运', '選': '选',
    '鐵': '铁', '銀': '银', '銅': '铜', '錫': '锡', '鹽': '盐', '漢': '汉',
    '澤': '泽', '濟': '济', '濱': '滨', '遼': '辽', '雲': '云', '貴': '贵',
    '贛': '赣', '隴': '陇', '陝': '陕', '晉': '晋', '魯': '鲁', '齊': '齐',
    '吳': '吴', '韓': '韩', '趙': '赵', '陳': '陈', '鄭': '郑', '許': '许',
    '鄧': '邓', '獻': '献', '寶': '宝', '貝': '贝', '萬': '万', '幹': '干',
    '餘': '余', '鬱': '郁', '麗': '丽', '龜': '龟', '齋': '斋', '廠': '厂',
    '蘭': '兰', '興': '兴', '衛': '卫', '禮': '礼', '義': '义', '壽': '寿',
    '遷': '迁', '還': '还', '過': '过', '進': '进', '遠': '远', '連': '连',
    '郵': '邮', '鄴': '邺', '鄆': '郓', '鄲': '郸', '鄠': '户', '鄖': '郧',
    '鄱': '鄱', '酈': '郦', '酇': '赞', '釐': '厘', '鍾': '钟', '鎬': '镐',
    '鎮': '镇', '長': '长', '閿': '阌', '闔': '阖', '陘': '陉', '險': '险',    '隘': '隘', '隨': '随', '隱': '隐', '雙': '双', '雜': '杂', '雞': '鸡',
    '難': '难', '靈': '灵', '靜': '静', '順': '顺', '須': '须', '頓': '顿',
    '預': '预', '頴': '颍', '頭': '头', '館': '馆', '馬': '马', '馮': '冯',
    '駱': '骆', '高': '高', '魚': '鱼', '魯': '鲁', '麥': '麦', '黃': '黄',
    '點': '点', '黨': '党', '壺': '壶',
}
PROV3 = {'黑龍江', '內蒙古', '新疆', '西藏', '寧夏', '廣西', '香港', '澳門', '臺灣'}
SUFFIX = set('縣市區鎮鄉旗州府衛所里堡集都城關寨村店鎮')

def norm(s):
    return ''.join(VARIANTS.get(ch, ch) for ch in s)

def load_original():
    with open(ORIGINAL, encoding='utf-8') as f:
        return json.load(f)

def load_results():
    if os.path.exists(RESULTS):
        with open(RESULTS, encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_results(r):
    tmp = RESULTS + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(r, f, ensure_ascii=False, indent=1)
    os.replace(tmp, RESULTS)

def is_solid(c):
    mod = c.get('mod')
    if not mod:
        return False
    if '不詳' in mod:
        return False
    if mod.startswith('約當今'):
        return False
    return True

def worklist(cty, results):
    """Indices of solid-mod counties lacking coords and not done/failed-out."""
    out = []
    for i, c in enumerate(cty):
        if c.get('lat'):
            continue
        if not is_solid(c):
            continue
        st = results.get(str(i))
        if st and (st.get('ok') or st.get('attempts', 0) >= MAX_ATTEMPTS):
            continue
        out.append(i)
    return out

def query_for(mod):
    q = mod[1:] if mod.startswith('今') else mod
    return q

def geocode(query):
    params = urllib.parse.urlencode({
        'format': 'jsonv2', 'q': query, 'countrycodes': 'cn',
        'limit': 1, 'addressdetails': 1, 'accept-language': 'zh',
    })
    req = urllib.request.Request(NOMINATIM + '?' + params,
                                 headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)

def split_mod(mod):
    """Return (province, locality_core) from a mod like 今河北涿鹿縣."""
    body = mod[1:] if mod.startswith('今') else mod
    if norm(body[:3]) in {norm(p) for p in PROV3}:
        prov, rest = body[:3], body[3:]
    else:
        prov, rest = body[:2], body[2:]
    if '市' in rest and not rest.endswith('市'):
        # prefecture-level city prefix, e.g. 長治市屯留區 -> 屯留區
        # (a trailing 市 is the county-level suffix itself, e.g. 榆林市)
        rest = rest.split('市')[-1]
    core = rest
    # strip at most ONE county-level admin suffix; 關/鄉/鎮 can be part of
    # the real name (壺關, 武鄉) and must not be stripped
    if core and core[-1] in '縣市區旗州府':
        core = core[:-1]
    return prov, core

def qa_pass(entry, mod, res):
    """Fail-safe QA: all conditions must hold."""
    if not res.get('ok'):
        return False, 'no_result'
    if res.get('country_code') != 'cn':
        return False, 'not_cn'
    prov, core = split_mod(mod)
    dn = norm(res.get('display_name', ''))
    if norm(prov) not in dn:
        return False, 'province_mismatch'
    if len(core) >= 2 and norm(core) not in dn:
        return False, 'locality_mismatch'
    if len(core) < 2 and res.get('osm_type') != 'administrative':
        return False, 'vague_result'
    return True, ''

def run_chunk(n):
    cty = load_original()['cty']
    results = load_results()
    wl = worklist(cty, results)
    todo = wl[:n]
    processed = 0
    for i in todo:
        c = cty[i]
        key = str(i)
        st = results.get(key, {})
        st['attempts'] = st.get('attempts', 0) + 1
        q = query_for(c['mod'])
        try:
            data = geocode(q)
            if data:
                r = data[0]
                st.update({
                    'ok': True, 'lat': float(r['lat']), 'lon': float(r['lon']),
                    'display_name': r.get('display_name', ''),
                    'name': r.get('name', ''), 'osm_type': r.get('osm_type', ''),
                    'country_code': (r.get('address') or {}).get('country_code', ''),
                    'query': q, 'error': '',
                })
            else:
                st.update({'ok': False, 'error': 'empty_response', 'query': q})
        except Exception as e:  # noqa: BLE001 - transient network errors
            st.update({'ok': False, 'error': f'{type(e).__name__}: {e}', 'query': q})
        st['n'] = c['n']
        st['c'] = c['c']
        st['mod'] = c['mod']
        results[key] = st
        save_results(results)
        processed += 1
        time.sleep(SLEEP_S)
    remaining = len(wl) - processed
    print(json.dumps({'processed': processed, 'remaining': remaining,
                      'total_worklist': len(wl)}, ensure_ascii=False))

def run_apply(dry):
    d = load_original()
    cty = d['cty']
    results = load_results()
    applied, flagged = [], []
    for key, st in results.items():
        if not st.get('ok'):
            continue
        i = int(key)
        c = cty[i]
        if c.get('lat'):
            continue  # already has coords (e.g. filled meanwhile)
        ok, reason = qa_pass(st, c['mod'], st)
        rec = {'idx': i, 'n': c['n'], 'c': c['c'], 'mod': c['mod'],
               'lat': st['lat'], 'lon': st['lon'],
               'display_name': st.get('display_name', ''), 'reason': reason}
        if ok:
            applied.append(rec)
            if not dry:
                c['lat'] = st['lat']
                c['lon'] = st['lon']
        else:
            flagged.append(rec)
    # stats on deliberately skipped entries
    n_nocoord = sum(1 for c in cty if not c.get('lat'))
    n_unknown = sum(1 for c in cty if not c.get('lat') and c.get('mod') and '不詳' in c['mod'])
    n_vague = sum(1 for c in cty if not c.get('lat') and (c.get('mod') or '').startswith('約當今'))
    review = {'applied': applied, 'flagged': flagged,
              'stats': {'applied': len(applied), 'flagged': len(flagged),
                        'still_no_coord': n_nocoord if dry else 'recompute',
                        'skipped_unknown_不詳': n_unknown, 'skipped_vague_約當今': n_vague}}
    if not dry:
        with open(ORIGINAL, 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write('\n')
        review['stats']['still_no_coord'] = sum(1 for c in cty if not c.get('lat'))
    with open(REVIEW, 'w', encoding='utf-8') as f:
        json.dump(review, f, ensure_ascii=False, indent=1)
    print(json.dumps({'dry': dry, 'applied': len(applied), 'flagged': len(flagged),
                      'skipped_unknown': n_unknown, 'skipped_vague': n_vague},
                     ensure_ascii=False))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chunk', type=int, default=0)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--dry-apply', action='store_true')
    args = ap.parse_args()
    if args.apply:
        run_apply(dry=False)
    elif args.dry_apply:
        run_apply(dry=True)
    else:
        run_chunk(args.chunk or 60)

if __name__ == '__main__':
    main()
