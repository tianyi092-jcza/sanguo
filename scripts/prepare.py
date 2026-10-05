"""Preserve the supplied artifact and extract editable sources once."""
import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
original = root / 'backups' / 'original.html'
original.parent.mkdir(exist_ok=True)
if not original.exists():
    original.write_bytes((root / '三国志_郡国疆域与人物年表.html').read_bytes())
text = original.read_text(encoding='utf-8-sig')
data = json.loads(re.search(r'^const DATA = (.*);$', text, re.M).group(1))
for folder in ['src', 'data', 'data/sources', 'output/playwright']:
    (root / folder).mkdir(exist_ok=True, parents=True)
(root / 'data/original.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(root / 'src/legacy.html').write_text(re.sub(r'^const DATA = .*;$', '/* INLINE_DATA */', text, flags=re.M),encoding='utf-8')
print('Original preserved; extracted', len(data['per']), 'person records.')
