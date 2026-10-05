"""Cache public-domain historical texts. Network is used only for this import."""
from pathlib import Path
import concurrent.futures, hashlib, json, urllib.request
from lxml import html

root=Path(__file__).resolve().parents[1]
dest=root/'data/sources'
dest.mkdir(parents=True,exist_ok=True)

def fetch(item):
    book, num=item
    key=f'{book}-{num:03}'
    path=dest/f'{key}.json'
    if path.exists(): return key+' cached'
    url=f'http://www.sidneyluo.net/a/{book}/{num:03}.html'
    try:
        raw=urllib.request.urlopen(url,timeout=25).read()
        doc=html.fromstring(raw.decode('utf-8'))
        paragraphs=[''.join(p.itertext()).strip() for p in doc.xpath('//p')]
        paragraphs=[p for p in paragraphs if p]
        item={'id':key,'title':doc.xpath('string(//title)').replace(' - 漢川草廬',''), 'url':url,
              'accessed':'2026-10-05','sha256':hashlib.sha256(raw).hexdigest(),'paragraphs':paragraphs}
        path.write_text(json.dumps(item,ensure_ascii=False,indent=2),encoding='utf-8')
        return key+' '+str(len(paragraphs))+' paragraphs'
    except Exception as e: return key+' ERROR '+str(e)

items=[('a04',n) for n in range(1,66)]
items += [('a03',n) for n in [8,9,10,53,54,55,56,58,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,80,81,82,83,85,86,87,89,90]]
items += [('a05',n) for n in [1,2,3,34,35,36,37,39,42,43]]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(fetch,items): print(result,flush=True)
