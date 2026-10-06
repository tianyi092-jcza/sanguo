"""Cache the available Han Chuan Cao Lu pages and the full Kanripo Huayang text.

Split Hou Hanshu volumes and the rest of Jin Shu come from fetch-ahcb-corpora.py.
Existing source records are never overwritten.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data' / 'sources'
DEST.mkdir(parents=True, exist_ok=True)


class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.paragraphs = []
        self.in_title = False
        self.parts = None

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True
        elif tag == 'p' and self.parts is None:
            self.parts = []

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'p' and self.parts is not None:
            text = ''.join(self.parts).strip()
            if text:
                self.paragraphs.append(text)
            self.parts = None

    def handle_data(self, text):
        if self.in_title:
            self.title_parts.append(text)
        if self.parts is not None:
            self.parts.append(text)


def fetch_classic(book, number, expected_title):
    key = f'{book}-{number:03}'
    target = DEST / f'{key}.json'
    if target.exists():
        record = json.loads(target.read_text(encoding='utf-8'))
        if record.get('id') != key or not record.get('paragraphs'):
            raise RuntimeError(f'Invalid existing source record: {key}')
        return f'{key} cached'
    url = f'http://www.sidneyluo.net/a/{book}/{number:03}.html'
    request = urllib.request.Request(url, headers={'User-Agent': 'sanguo-atlas-source-cache/1.0'})
    raw = urllib.request.urlopen(request, timeout=30).read()
    parser = PageText()
    parser.feed(raw.decode('utf-8-sig'))
    title = ''.join(parser.title_parts).replace(' - 漢川草廬', '').strip()
    if expected_title not in title or len(parser.paragraphs) < 2:
        raise RuntimeError(f'Unexpected source page {key}: {title!r}, {len(parser.paragraphs)} paragraphs')
    record = {
        'id': key,
        'title': title,
        'url': url,
        'accessed': date.today().isoformat(),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'editionNote': '漢川草廬電子文本；逐卷保存，正文及原有注文依頁面轉錄保留。',
        'paragraphs': parser.paragraphs,
    }
    target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return f'{key} {len(parser.paragraphs)} paragraphs'


def fetch_huayang(number):
    key = f'a06-{number:03}'
    target = DEST / f'{key}.json'
    if target.exists():
        record = json.loads(target.read_text(encoding='utf-8'))
        if record.get('id') != key or not record.get('paragraphs'):
            raise RuntimeError(f'Invalid existing source record: {key}')
        return f'{key} cached'
    url = f'https://raw.githubusercontent.com/kanripo/KR2i0003/master/KR2i0003_{number:03}.txt'
    request = urllib.request.Request(url, headers={'User-Agent': 'sanguo-atlas-source-cache/1.0'})
    raw = urllib.request.urlopen(request, timeout=30).read()
    text = raw.decode('utf-8-sig')
    title_match = re.search(r'^#\+TITLE:\s*(.+)$', text, re.M)
    juan_match = re.search(r'^#\+PROPERTY:\s*JUAN\s+(\d+)', text, re.M)
    base = re.search(r'^#\+PROPERTY:\s*BASEEDITION\s+(.+)$', text, re.M)
    if not title_match or not juan_match or not base or base.group(1).strip() != 'SBCK':
        raise RuntimeError(f'Unexpected Kanripo metadata: {key}')
    page_chunks = re.split(r'<pb:[^>]+>¶?', text)
    pages = []
    for chunk in page_chunks[1:]:
        content = '\n'.join(line.strip().removesuffix('¶') for line in chunk.splitlines() if line.strip())
        if content:
            pages.append(content)
    if not pages:
        raise RuntimeError(f'No page text extracted: {key}')
    juan = int(juan_match.group(1))
    record = {
        'id': key,
        'title': f'華陽國志·序' if juan == 0 else f'華陽國志·卷{juan}',
        'url': url,
        'accessed': date.today().isoformat(),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'editionNote': 'Kanripo KR2i0003，四部叢刊本（SBCK）轉錄；依原書頁面分段，保留原字形、行款與缺字標記，不補標點。',
        'baseEdition': 'SBCK / 四部叢刊',
        'rawTitle': title_match.group(1).strip(),
        'paragraphs': pages,
    }
    target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return f'{key} {len(pages)} page blocks'


jobs = [('a03', n, '後漢書') for n in range(1, 121) if n not in {10, 28, 30, 60}]
jobs += [('a05', n, '晉書') for n in [*range(1,20),34,36,37,39,40,42]]
results = []
errors = []
with ThreadPoolExecutor(max_workers=3) as pool:
    futures = [(job, pool.submit(fetch_classic, *job)) for job in jobs]
    for job, future in futures:
        try:
            results.append(future.result())
        except Exception as error:
            errors.append((job, str(error)))
            print(f'ERROR {job[0]}-{job[1]:03}: {error}', flush=True)
for number in range(0, 13):
    try:
        results.append(fetch_huayang(number))
    except Exception as error:
        errors.append((('a06', number), str(error)))
        print(f'ERROR a06-{number:03}: {error}', flush=True)
print(f'Fetched or verified {len(results)} records; errors={len(errors)}')
for result in results:
    print(result, flush=True)
if errors:
    raise SystemExit(1)
