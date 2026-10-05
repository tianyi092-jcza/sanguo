"""Import public-domain Jin biographies from the displayed electronic edition.

Modern collator notes (jiaozhusup) are omitted from quoted primary text.
"""
import concurrent.futures,hashlib,json,urllib.request
from pathlib import Path
from lxml import html

root=Path(__file__).resolve().parents[1]
def fetch(n):
    url=f'https://ancient-china-books.github.io/jinshu/OEBPS/Text/{1130+n}.html'
    raw=urllib.request.urlopen(url,timeout=25).read()
    doc=html.fromstring(raw)
    title=doc.xpath('string(//title)')
    for e in doc.xpath('//span[@class="jiaozhusup"]'):e.drop_tree()
    ps=[p.text_content().strip() for p in doc.xpath('//p[@class="em2"]') if p.text_content().strip()]
    if not ps or '晉書' not in title:raise ValueError(f'Unexpected source {n}: {title}')
    record={'id':f'a05-{n:03}','title':title,'url':url,'accessed':'2026-10-05','sha256':hashlib.sha256(raw).hexdigest(),'paragraphs':ps,'editionNote':'電子本正文；未混入現代校勘提示。'}
    (root/f'data/sources/a05-{n:03}.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
    return {'volume':n,'title':title,'paragraphs':len(ps)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for value in pool.map(fetch,[34,36,37,39,40,42]):print(value,flush=True)
