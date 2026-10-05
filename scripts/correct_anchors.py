"""Editorial corrections after consulting the cached historical texts."""
import json
from pathlib import Path
p=Path('data/curation.json');d=json.loads(p.read_text(encoding='utf-8'))
replacements={
 '霸奔蜀':'故遂奔蜀','建安十三年':'及魏武為丞相','張寶':'角弟寶','張梁':'寶弟梁',
 '江南四郡':'南征四郡','安樂公':'安樂縣公','泰始七年':'太始七年','太祖東征':'曹公東征',
 '亡歸先主':'而奔先主於袁軍','先主稱尊號':'及稱尊號','遂將所領降於魏':'故率將所領降于魏',
 '曹公定漢中':'隨杜濩','延熙十一年':'十一年卒','居東城':'會祖母亡','周瑜薦肅':'瑜因薦肅',
 '孫權統事':'權統事','建安八年':'遜年二十一'
}
for person in d['people']:
 for s in person.get('stages',[])+person.get('unplaced',[]):
  s['query']=replacements.get(s['query'],s['query'])
  if person['name']=='諸葛亮' and s['query']=='章武元年':s['query']='策亮為丞相'
  if person['name']=='陸遜' and s['start']==203:
   person['first']['precision']='inferred';s['note']='據二十一歲入孫權幕府及享年推算，並非本傳明載建安八年。'
  if person['name']=='黃權' and s['start']==200:s['start']=211;s['note']='劉璋欲迎劉備時已有主簿記載。入仕早於此，確切起年未詳。'
  if person['name']=='王平' and s['start']==215:s['note']='隨杜濩、朴胡北遷及後降劉備相參繫年，早期確年未載。'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
