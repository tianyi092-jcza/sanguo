"""从 sidneyluo（漢川草廬）抓《資治通鑑》卷59–81，存 data/tongjian/raw-sidneyluo/NNN.json。
页面结构：<h6>年标题</h6> + <ul><li>段落</li></ul>；首个 h6 前的 <p> 为卷首说明（intro）。
记录：{id, title, url, accessed, sha256, sections: [{heading, paragraphs}], intro: [...]}
用法：python3 scripts/fetch-tongjian-sidneyluo.py [from] [to]（缺省 59 81；已存在跳过）
"""
import sys
import time
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data' / 'tongjian' / 'raw-sidneyluo'
DEST.mkdir(parents=True, exist_ok=True)


class TongjianPage(HTMLParser):
    """按 h6 年标题分节、li 为段落单位提取正文（li 内可嵌 p）。"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.in_title = False
        self.intro = []
        self.sections = []
        self._mode = None      # 'h6' | 'li' | 'p'
        self._buf = None
        self._li_depth = 0

    def _flush(self):
        if self._buf is None:
            return
        text = ''.join(self._buf).strip()
        if self._mode == 'h6':
            if text:
                self.sections.append({'heading': text, 'paragraphs': []})
        elif text:
            if self.sections:
                self.sections[-1]['paragraphs'].append(text)
            else:
                self.intro.append(text)
        self._buf = None
        self._mode = None

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True
        elif tag == 'h6':
            self._flush()
            self._mode, self._buf = 'h6', []
        elif tag == 'li':
            self._li_depth += 1
            if self._li_depth == 1:
                self._flush()
                self._mode, self._buf = 'li', []
        elif tag == 'p' and self._li_depth == 0 and self._mode is None:
            self._mode, self._buf = 'p', []

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'h6' and self._mode == 'h6':
            self._flush()
        elif tag == 'li':
            if self._li_depth == 1 and self._mode == 'li':
                self._flush()
            self._li_depth = max(0, self._li_depth - 1)
        elif tag == 'p' and self._mode == 'p':
            self._flush()

    def handle_data(self, text):
        if self.in_title:
            self.title_parts.append(text)
        if self._buf is not None:
            self._buf.append(text)


def fetch_vol(n):
    vol = f'{n:03}'
    target = DEST / f'{vol}.json'
    if target.exists():
        return f'{vol} cached'
    url = f'http://www.sidneyluo.net/c/{vol}.html'
    request = urllib.request.Request(url, headers={'User-Agent': 'sanguo-atlas-source-cache/1.0'})
    try:
        raw = urllib.request.urlopen(request, timeout=30).read()
    except Exception:
        # 个别卷服务器提前断连（IncompleteRead），改用 curl 取全页
        import subprocess
        raw = subprocess.run(['curl', '-s', '--max-time', '40', url], capture_output=True, check=True).stdout
    parser = TongjianPage()
    parser.feed(raw.decode('utf-8-sig'))
    parser._flush()
    title = ''.join(parser.title_parts).replace(' - 漢川草廬', '').strip()
    n_paras = sum(len(s['paragraphs']) for s in parser.sections)
    if '資治通鑑' not in title or len(parser.sections) < 2 or n_paras < 10:
        raise RuntimeError(f'Unexpected page {vol}: {title!r}, sections={len(parser.sections)}, paras={n_paras}')
    record = {
        'id': f'tj-{vol}',
        'title': title,
        'url': url,
        'accessed': date.today().isoformat(),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'editionNote': '漢川草廬電子文本；逐卷保存，正文及原有注文依頁面轉錄保留。',
        'intro': parser.intro,
        'sections': parser.sections,
    }
    target.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return f'{vol} {len(parser.sections)} sections, {n_paras} paragraphs'


def main():
    frm = int(sys.argv[1]) if len(sys.argv) > 1 else 59
    to = int(sys.argv[2]) if len(sys.argv) > 2 else 81
    for n in range(frm, to + 1):
        try:
            print(fetch_vol(n), flush=True)
        except Exception as error:
            print(f'ERROR {n:03}: {error}', flush=True)
        time.sleep(0.4)


if __name__ == '__main__':
    main()
