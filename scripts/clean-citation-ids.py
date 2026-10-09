import json
import re
import sys

APPLY = '--apply' in sys.argv
REVIEW = 'data/person-second-review.json'

review = json.load(open(REVIEW))
hist_sources = json.load(open('data/history.json'))['sources']

EID = r'[a-z]{2,}-[a-z0-9]+(?:-[a-z0-9]+)+'
SID = r'a\d\d-\d+(?:-ahcb|-full)?'

id2title = {}
for _entry in review['people']:
    for _x in _entry.get('excerpts', []):
        _c = _x.get('citation', '') or ''
        _m = re.match(r'(《[^》]+》)', _c.strip())
        if _m:
            id2title[_x['id']] = _m.group(1)


def source_title(sid):
    base = re.sub(r'-(ahcb|full)$', '', sid)
    info = hist_sources.get(sid) or hist_sources.get(base)
    if not info:
        return None
    parts = re.split(r'[-・‧]', info['title'])
    book = parts[0]
    if book == '二十四史' and len(parts) > 1:
        book = parts[1]
    chap = parts[-1]
    suffix = '（原文版）' if sid.endswith('-ahcb') else ''
    return '《' + book + '·' + chap + '》' + suffix


def clean(citation):
    c = citation

    def _p1(m):
        st = source_title(m.group(1)) or m.group(1)
        seg = m.group(2) + ('至' + m.group(3) if m.group(3) else '')
        return '與' + st + '第' + seg + '段同文複核'

    c = re.sub(
        r'與\s*(' + SID + r')\s*第([^段]+?)段(?:\.\.\.\s*第([^段]+?)段)?\s*'
        + EID + r'\s*同段原文版複核', _p1, c)

    def _p1b(m):
        st = source_title(m.group(1)) or m.group(1)
        return '與' + st + '第' + m.group(2) + '段同段互證'

    c = re.sub(
        r'與\s*(' + SID + r')\s*第([^段]+?)段\s*' + EID + r'\s*同段互證',
        _p1b, c)
    c = re.sub(r'與後漢書版\s*' + EID + r'\s*同文互證',
               '與《後漢書》所載同文互證', c)
    c = re.sub(r'與(\S{1,10}?)版\s*' + EID + r'\s*同段互證',
               r'與\1版所載同段互證', c)
    c = re.sub(r'與(《[^》]+》)\s*' + EID + r'\s*互證',
               r'與\1所載互證', c)
    c = re.sub(r'與\s*ahcb\s*版\s*(?:' + EID + r'\s*)?及維基文庫原文版\s*(?:'
               + EID + r'\s*)?同段引文互證',
               '與原文版及維基文庫原文版所載同段引文互證', c)
    c = re.sub(r'與\s*ahcb\s*版\s*(?:' + EID + r'\s*)?同段引文互證',
               '與原文版所載同段引文互證', c)
    c = re.sub(r'與(\S{1,10}?)版\s*' + EID + r'\s*(同例|互證)',
               r'與\1版所載\2', c)
    c = re.sub(r'承\s*a\d\d-\d+:(\d+)', r'承同卷第\1段', c)

    def _p3(m):
        inner = re.sub(EID, '', m.group(1)).strip('，；、 ')
        return '（' + inner + '）' if inner else ''

    c = re.sub(r'（([^（）]*' + EID + r'[^（）]*)）', _p3, c)

    unknown = []

    def _p4(m):
        eid = m.group(0)
        if eid in id2title:
            return id2title[eid]
        unknown.append(eid)
        return '【待查:' + eid + '】'

    c = re.sub(EID, _p4, c)

    def _p5(m):
        sid = m.group(0)
        return source_title(sid) or sid

    c = re.sub(SID, _p5, c)
    c = re.sub(r'\s{2,}', ' ', c)
    c = re.sub(r'與\s+《', '與《', c)
    c = re.sub(r'》\s+第', '》第', c)
    c = re.sub(r'引文\s+([同互])', r'引文\1', c)
    c = re.sub(r'版\s+([同所])', r'版\1', c)
    c = re.sub(r'段\s+(?=[\u4e00-\u9fff])', '段', c)
    return c, unknown


def main():
    diffs = []
    all_unknown = set()
    for entry in review['people']:
        for x in entry.get('excerpts', []):
            c = x.get('citation', '') or ''
            if not re.search(EID + r'|' + SID, c):
                continue
            new, unknown = clean(c)
            all_unknown.update(unknown)
            if new != c:
                diffs.append((entry.get('id'), x.get('id'), c, new))
    print('命中条目: %d' % len(diffs))
    for pid, xid, old, new in diffs:
        print('--- %s / %s' % (pid, xid))
        print('  OLD:', old[:230])
        print('  NEW:', new[:230])
    if all_unknown:
        print('\n未知编号（需人工处理）:')
        for u in sorted(all_unknown):
            print('  ', u)
    if APPLY and diffs:
        for entry in review['people']:
            for x in entry.get('excerpts', []):
                c = x.get('citation', '') or ''
                if re.search(EID + r'|' + SID, c):
                    x['citation'], _ = clean(c)
        json.dump(review, open(REVIEW, 'w'), ensure_ascii=False, indent=2)
        print('\n已写回 %s' % REVIEW)
    elif not APPLY:
        print('\n(试运行，未写回；加 --apply 生效)')


main()
