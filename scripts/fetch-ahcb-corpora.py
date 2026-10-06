"""Cache the complete AHCB Hou Hanshu and Jin Shu electronic editions as separate source records."""
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import sys
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data' / 'sources'
DEST.mkdir(parents=True, exist_ok=True)
API = 'https://api.github.com/repos/Ancient-China-Books/{repo}/contents/OEBPS/Text'
RAW = 'https://raw.githubusercontent.com/Ancient-China-Books/{repo}/master/OEBPS/Text/{name}'
WEB = 'https://ancient-china-books.github.io/{repo}/OEBPS/Text/{name}'


class EditionText(HTMLParser):
    def __init__(self, repo):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.title_open = False
        self.paragraphs = []
        self.in_em2 = 0
        self.in_any_p = 0
        self.parts = None
        self.skip_note = 0
        self.repo = repo
        self.include_paragraph = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'title':
            self.title_open = True
        if tag == 'span' and 'jiaozhusup' in (attrs.get('class') or '').split():
            self.skip_note = 1
        elif self.skip_note:
            self.skip_note += 1
        if tag == 'p':
            classes = (attrs.get('class') or '').split()
            if self.parts is None:
                self.parts = []
                self.in_any_p = 1
                self.include_paragraph = ('style11' not in classes) if self.repo == 'houhanshu' else ('em2' in classes)
            elif self.in_any_p:
                self.in_any_p += 1

    def handle_endtag(self, tag):
        if tag == 'title':
            self.title_open = False
        if self.skip_note:
            self.skip_note -= 1
        if tag == 'p' and self.parts is not None:
            self.in_any_p -= 1
            if self.in_any_p <= 0:
                text = ''.join(self.parts).strip()
                if text and self.include_paragraph:
                    self.paragraphs.append(text)
                self.parts = None
                self.in_any_p = 0
                self.include_paragraph = False

    def handle_data(self, text):
        if self.title_open:
            self.title_parts.append(text)
        if self.parts is not None and not self.skip_note:
            self.parts.append(text)


def list_files(repo):
    url = API.format(repo=repo)
    request = urllib.request.Request(url, headers={'User-Agent': 'sanguo-atlas-source-cache/1.0'})
    return [item['name'] for item in json.loads(urllib.request.urlopen(request, timeout=30).read()) if item.get('type') == 'file']


def source_id(repo, filename):
    if repo == 'houhanshu':
        chapter = filename.removesuffix('.htm')
        return f'a03-{chapter}-ahcb'
    if repo == 'jinshu':
        number = int(filename.removesuffix('.html'))
        chapter = number - 1130
        return f'a05-{chapter:03}-ahcb'
    raise ValueError(repo)


def fetch(repo, filename):
    key = source_id(repo, filename)
    target = DEST / f'{key}.json'
    url = WEB.format(repo=repo, name=filename)
    if target.exists():
        existing = json.loads(target.read_text(encoding='utf-8'))
        if existing.get('id') != key or not existing.get('paragraphs'):
            raise RuntimeError(f'Invalid existing AHCB source record: {key}')
        return f'{key} cached'
    raw_url = RAW.format(repo=repo, name=filename)
    request = urllib.request.Request(raw_url, headers={'User-Agent': 'sanguo-atlas-source-cache/1.0'})
    raw = urllib.request.urlopen(request, timeout=30).read()
    parser = EditionText(repo)
    parser.feed(raw.decode('utf-8-sig'))
    title = ''.join(parser.title_parts).strip()
    expected = '後漢書' if repo == 'houhanshu' else '晉書'
    if expected not in title or not parser.paragraphs:
        raise RuntimeError(f'Unexpected or empty edition page {key}: {title!r}, {len(parser.paragraphs)} paragraphs')
    record = {
        'id': key,
        'title': title,
        'url': url,
        'accessed': date.today().isoformat(),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'editionNote': ('Ancient China Books 電子文本；保留范曄正文與李賢注的原刊編排。' if repo == 'houhanshu' else 'Ancient China Books 電子文本；保留正文及古注，剔除明確標示的現代校勘提示。'),
        'paragraphs': parser.paragraphs,
    }
    target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return f'{key} {len(parser.paragraphs)} paragraphs'


def corpus_manifest(books):
    works = {
        'sanguozhi': {'edition': '漢川草廬', 'ids': [f'a04-{n:03}' for n in range(1, 66)]},
        'houhanshu': {'edition': 'Ancient China Books AHCB', 'ids': [source_id('houhanshu', name) for name in sorted(books['houhanshu'])]},
        'huayang': {'edition': 'Kanripo KR2i0003 / 四部叢刊 SBCK', 'ids': [f'a06-{n:03}' for n in range(0, 13)]},
        'jinshu': {'edition': 'Ancient China Books AHCB', 'ids': [source_id('jinshu', name) for name in sorted(books['jinshu'])]},
    }
    for work, info in works.items():
        records = []
        for record_id in info['ids']:
            path = DEST / f'{record_id}.json'
            if not path.exists():
                raise RuntimeError(f'Missing cached {work} source: {record_id}')
            record = json.loads(path.read_text(encoding='utf-8'))
            if record.get('id') != record_id or not record.get('paragraphs'):
                raise RuntimeError(f'Invalid cached {work} source: {record_id}')
            records.append({'id': record_id, 'title': record.get('title'), 'url': record.get('url'), 'sha256': record.get('sha256'), 'recordSha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'paragraphs': len(record['paragraphs'])})
        info['recordCount'] = len(records)
        info['records'] = records
        info['complete'] = True
    path = ROOT / 'data' / 'source-corpus-manifest.json'
    path.write_text(json.dumps({'schemaVersion':1,'generatedOn':date.today().isoformat(),'works':works},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


sample = '--sample' in sys.argv
books = {'houhanshu': ['010a.htm','010b.htm'], 'jinshu': ['1131.html','1164.html']} if sample else {}
if not sample:
    for repo in ('houhanshu','jinshu'):
        files = list_files(repo)
        if repo == 'houhanshu':
            books[repo] = [name for name in files if re.fullmatch(r'\d{3}[a-z]?\.htm', name)]
        else:
            books[repo] = [name for name in files if re.fullmatch(r'\d{4}\.html', name) and 1131 <= int(name[:-5]) <= 1260]

jobs = [(repo, name) for repo, files in books.items() for name in sorted(files)]
results, errors = [], []
with ThreadPoolExecutor(max_workers=6) as pool:
    futures = [(job, pool.submit(fetch, *job)) for job in jobs]
    for job, future in futures:
        try:
            results.append(future.result())
        except Exception as error:
            errors.append((job, str(error)))
            print(f'ERROR {job[0]} {job[1]}: {error}', flush=True)
print(f'Fetched or verified {len(results)} AHCB records; errors={len(errors)}')
for result in results:
    print(result, flush=True)
if errors:
    raise SystemExit(1)
if not sample:
    corpus_manifest(books)
