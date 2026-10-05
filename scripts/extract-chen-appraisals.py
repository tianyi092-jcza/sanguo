"""Read all 65 chapter appraisals, separating the source edition's Pei-note spans."""
from pathlib import Path
import concurrent.futures, hashlib, json, urllib.request
from html.parser import HTMLParser
from datetime import date

root = Path(__file__).resolve().parents[1]
dest = root / 'data/appraisal-sources'
raw_dest = root / 'output/appraisal-html'
dest.mkdir(parents=True, exist_ok=True)
raw_dest.mkdir(parents=True, exist_ok=True)


class AppraisalParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = []
        self.in_title = False
        self.paragraph = None
        self.span_notes = []
        self.note = []
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True
        if tag == 'p':
            self.paragraph = {'raw': [], 'body': [], 'notes': [], 'spanClasses': set()}
            self.span_notes = []
        elif tag == 'span' and self.paragraph is not None:
            classes = dict(attrs).get('class', '').split()
            self.paragraph['spanClasses'].update(classes)
            parent_note = bool(self.span_notes and self.span_notes[-1])
            is_note = parent_note or 'style7' in classes
            if is_note and not parent_note:
                self.note = []
            self.span_notes.append(is_note)

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'span' and self.paragraph is not None and self.span_notes:
            ended_note = self.span_notes.pop()
            if ended_note and not (self.span_notes and self.span_notes[-1]):
                self.paragraph['notes'].append(''.join(self.note).strip())
        elif tag == 'p' and self.paragraph is not None:
            self.paragraphs.append(self.paragraph)
            self.paragraph = None
            self.span_notes = []

    def handle_data(self, text):
        if self.in_title:
            self.title.append(text)
        if self.paragraph is not None:
            self.paragraph['raw'].append(text)
            if self.span_notes and self.span_notes[-1]:
                self.note.append(text)
            else:
                self.paragraph['body'].append(text)


def extract(number):
    source_id = f'a04-{number:03}'
    url = f'http://www.sidneyluo.net/a/a04/{number:03}.html'
    last_error = None
    for attempt in range(3):
        try:
            raw = urllib.request.urlopen(url, timeout=25).read()
            doc = AppraisalParser()
            doc.feed(raw.decode('utf-8'))
            candidates = [p for p in doc.paragraphs if ''.join(p['raw']).strip().startswith('評曰')]
            if len(candidates) != 1:
                raise ValueError(f'Expected one appraisal, found {len(candidates)}')
            paragraph = candidates[0]
            notes = paragraph['notes']
            body = ''.join(paragraph['body']).strip()
            if not body.startswith('評曰：'):
                raise ValueError('Missing appraisal heading')
            result = {
                'id': source_id,
                'title': ''.join(doc.title).replace(' - 漢川草廬', '').strip(),
                'url': url,
                'sha256': hashlib.sha256(raw).hexdigest(),
                'accessed': date.today().isoformat(),
                'extraction': 'Chapter-final 評曰 paragraph; Pei annotations marked span.style7 excluded.',
                'rawParagraph': ''.join(paragraph['raw']).strip(),
                'body': body,
                'removedAnnotations': notes,
                'spanClasses': sorted(paragraph['spanClasses']),
            }
            (raw_dest / f'{source_id}.html').write_bytes(raw)
            (dest / f'{source_id}.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
            return {'id': source_id, 'notes': len(notes), 'length': len(body)}
        except Exception as error:
            last_error = str(error)
    raise RuntimeError(f'{source_id}: {last_error}')


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(extract, range(1, 66)))
print(json.dumps({'chapters': len(results), 'annotatedChapters': sum(r['notes'] > 0 for r in results), 'results': results}, ensure_ascii=False))
