"""Preserve main text separately from Pei's quotations for conservative date indexing."""
import concurrent.futures,json,urllib.request
from pathlib import Path
from lxml import html
root=Path(__file__).resolve().parents[1]
def fetch(key):
 p=root/'data/sources'/f'{key}.json';d=json.loads(p.read_text(encoding='utf-8'))
 raw=urllib.request.urlopen(d['url'],timeout=25).read().decode('utf-8');doc=html.fromstring(raw)
 paragraphs=[]
 for e in doc.xpath('//p'):
  for annotation in e.xpath('.//span[contains(@class,"style7")]'):annotation.drop_tree()
  text=e.text_content().strip()
  if text:paragraphs.append(text)
 d['mainParagraphs']=paragraphs;p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8');return key
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 print(list(pool.map(fetch,['a04-001','a04-002','a04-003','a04-004','a04-032','a04-033','a04-047','a04-048','a05-003'])))
