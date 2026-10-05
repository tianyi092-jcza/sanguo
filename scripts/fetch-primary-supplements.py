"""Cache individually selected public-domain primary-source pages."""
from html.parser import HTMLParser
from pathlib import Path
from datetime import date
import sys,json,hashlib,urllib.request

class Paragraphs(HTMLParser):
    def __init__(self):
        super().__init__();self.paragraphs=[];self.parts=None;self.title_parts=[];self.in_title=False
    def handle_starttag(self,tag,attrs):
        if tag=='p': self.parts=[]
        if tag=='title': self.in_title=True
    def handle_endtag(self,tag):
        if tag=='p' and self.parts is not None:
            text=''.join(self.parts).strip()
            if text:self.paragraphs.append(text)
            self.parts=None
        if tag=='title':self.in_title=False
    def handle_data(self,text):
        if self.parts is not None:self.parts.append(text)
        if self.in_title:self.title_parts.append(text)

root=Path(__file__).resolve().parents[1]
for argument in sys.argv[1:]:
    key,_,route=argument.partition('=')
    target=root/'data/sources'/f'{key}.json'
    if target.exists():print(key,'already cached');continue
    book,page=(route.split('/') if route else key.split('-'));url=f'http://www.sidneyluo.net/a/{book}/{page}.html'
    raw=urllib.request.urlopen(url,timeout=25).read()
    parser=Paragraphs();parser.feed(raw.decode('utf-8-sig'))
    title=''.join(parser.title_parts).replace(' - 漢川草廬','').strip()
    if len(parser.paragraphs)<2:raise RuntimeError('No primary text: '+url)
    doc={'id':key,'title':title,'url':url,'accessed':date.today().isoformat(),'sha256':hashlib.sha256(raw).hexdigest(),'paragraphs':parser.paragraphs}
    target.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(key,title,len(parser.paragraphs),'paragraphs')
