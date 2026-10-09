# -*- coding: utf-8 -*-
"""portrait-batch-07 staging: plan entries + import-jobs.json + review/state updates (pre-import)."""
import json, datetime, os

ROOT = '/home/hatch/workspace/sanguo/'
TMP = ROOT + 'tmp/portrait-batch-07/'

P0204_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Bu Zhi (步騭), courtesy name Zishan, Wu chancellor and senior statesman, late Eastern Han to Three Kingdoms. Primary source: Records of the Three Kingdoms, vol. 52, Wu book 7 (a04-052), Zhang Gu Zhuge Bu biographies: 「步隲字子山，臨淮淮陰人也。」 and 「赤烏九年，代陸遜為丞相，猶誨育門生，手不釋書，被服居處有如儒生。」 — in the ninth year of Chiwu he succeeded Lu Xun as chancellor, still instructing his disciples with a book in hand, his dress and dwelling like those of a Confucian scholar. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a dignified senior minister's composed bearing, Eastern Han to Three Kingdoms scholar-official attire: a dark cross-collared robe and a modest period official cap, no helmet and no armor, per his civil identity. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P0272_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Fu Xie (傅燮, written 傅爕 in the transmitted text), courtesy name Nanrong, Eastern Han famous minister and governor of Hanyang, late Eastern Han. Primary source: Book of the Later Han, vol. 58 (a03-058): 「傅爕字南容，北地靈州人也。……身長八尺，有威容。」 — Fu Xie, courtesy name Nanrong, a man of Lingzhou in Beidi; he was eight chi tall and had a dignified presence. He served as Army Protector clerk (護軍司馬) campaigning with Huangfu Song against the Yellow Turban rebels, then as governor of Hanyang (漢陽太守), and died in battle defending his commandery, posthumously honored as the Steadfast Marquis (壯節侯). Verified appearance evidence: tall stature (身長八尺) and dignified bearing (有威容) — render him tall-framed and solemn; all other ordinary facial details are artistic interpretation, not a historical assertion. Do not borrow another figure's recorded traits. Give him the bearing of a principled Han official, Eastern Han scholar-official attire: a dark cross-collared robe and a modest period official cap, no helmet and no armor, per his civil-official identity as governor. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P0273_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Qiao Xuan (橋玄), courtesy name Gongzu, Eastern Han grand commandant (太尉), late Eastern Han. Primary source: Book of the Later Han, vol. 51 (a03-051): 「橋玄字公祖，梁國睢陽人也。」 and 「光和元年，遷太尉。」 — in the first year of Guanghe he was promoted to Grand Commandant, the highest civil office; he had earlier served as General Who Crosses the Liao (度遼將軍) with the yellow axe, keeping the frontier quiet for three years. Cao Cao's sacrificial text honors him as 「故太尉橋公」. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him an elderly senior statesman's stern, upright bearing (he died at seventy-five, described as uncompromising yet humble), Eastern Han scholar-official attire: a dark cross-collared robe and a modest period official cap, no helmet and no armor, per his defining civil identity as Grand Commandant. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P0275_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Wang Kuang (王匡), courtesy name Gongjie, governor of Henei and member of the anti-Dong Zhuo coalition, late Eastern Han. Primary source: Records of the Three Kingdoms, vol. 1, Wei book 1, Annals of Emperor Wu (a04-001), citing the Heroic Records (英雄記): 「河內太守王匡、英雄記曰：匡字公節，泰山人。輕財好施，以任俠聞。」 — Wang Kuang, courtesy name Gongjie, a man of Taishan, generous with his wealth and known for knight-errantry; he joined the coalition rising against Dong Zhuo: 「同時俱起兵，衆各數萬，推紹為盟主。」 No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a forthright coalition-governor's bearing, Eastern Han scholar-official attire: a dark cross-collared robe and a modest period official cap, no helmet and no armor, per his civil identity as a commandery governor rather than a career general. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

NOW_UTC = datetime.datetime.now(datetime.timezone.utc).isoformat()

PEOPLE = [
    dict(
        id='p0204', name='步騭', gender='male',
        role='吳丞相、重臣', source='a04-052',
        evidence='「步隲字子山，臨淮淮陰人也。」；「赤烏九年，代陸遜為丞相，猶誨育門生，手不釋書，被服居處有如儒生。」（《三國志·卷五十二·吳書七》張顧諸葛步傳）',
        appearance='',
        prompt=P0204_PROMPT,
        gen_file='media-generation-portrait-batch-07-p0204-buzhi-0-61a80f36-2690-449d-bce4-eb87069fc5dc.webp',
        reviewNote='《三國志·吳書七》張顧諸葛步傳：步隲字子山，臨淮淮陰人。赤烏九年，代陸遜為丞相，「猶誨育門生，手不釋書，被服居處有如儒生」。吳丞相文臣身份明確。未核得本人五官特徵，不套用他人記載；採普通比例原創藝術示意。依身份著文士服飾，不戴盔甲。',
    ),
    dict(
        id='p0272', name='傅燮', gender='male',
        role='東漢名臣、漢陽太守', source='a03-058',
        evidence='「傅爕字南容，北地靈州人也。……身長八尺，有威容。」；「後為護軍司馬，與左中郎將皇甫嵩俱討賊張角。」；「出為漢陽太守。……臨陣戰歿。謚曰壯節侯。」（《後漢書·卷五十八》，傳本作「傅爕」）',
        appearance='身長八尺，有威容（本人明載）',
        prompt=P0272_PROMPT,
        gen_file='media-generation-portrait-batch-07-p0272-fuxie-0-2a61d2b6-9c72-44d2-b046-75e37824cab2.webp',
        reviewNote='《後漢書·卷五十八》（傳本作「傅爕」）：「傅爕字南容，北地靈州人也。……身長八尺，有威容。」護軍司馬從皇甫嵩討黃巾，後為漢陽太守，守郡臨陣戰歿，謚壯節侯。地方官/名臣身份，依士徽先例著文士服飾，不戴盔甲。只用本人明載特徵（身長八尺、有威容），其餘五官採普通比例藝術示意。',
    ),
    dict(
        id='p0273', name='橋玄', gender='male',
        role='東漢太尉', source='a03-051',
        evidence='「橋玄字公祖，梁國睢陽人也。」；「光和元年，遷太尉。」；「四府舉玄為度遼將軍，假黃鉞……在職三年，邊境安靜。」（《後漢書·卷五十一》）；曹操祭文稱「故太尉橋公」。',
        appearance='',
        prompt=P0273_PROMPT,
        gen_file='media-generation-portrait-batch-07-p0273-qiaoxu-0-f1225c7c-a8f5-469f-91e1-91f6e1a1cccb.webp',
        reviewNote='《後漢書·卷五十一》：橋玄字公祖，梁國睢陽人。光和元年遷太尉；嘗為度遼將軍，假黃鉞，在職三年邊境安靜。曹操祭文稱「故太尉橋公」。以太尉（文官）為定義身份，著文士服飾，不戴盔甲。未核得本人五官特徵；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0275', name='王匡', gender='male',
        role='河內太守、討董聯軍', source='a04-001',
        evidence='「河內太守王匡、英雄記曰：匡字公節，泰山人。輕財好施，以任俠聞。」；「同時俱起兵，衆各數萬，推紹為盟主。」（《三國志·卷一·魏書一》武帝紀引《英雄記》）',
        appearance='',
        prompt=P0275_PROMPT,
        gen_file='media-generation-portrait-batch-07-p0275-wangku-0-8cc0b338-805b-460d-858a-1714cec7b618.webp',
        reviewNote='《三國志·魏書一》武帝紀引《英雄記》：河內太守王匡，字公節，泰山人，「輕財好施，以任俠聞」；初平元年與袁紹等「同時俱起兵，衆各數萬，推紹為盟主」。地方官（太守），非戰陣將軍，依士徽先例著文士服飾，不戴盔甲。未核得本人五官特徵；採普通比例原創藝術示意。',
    ),
]

# 1. portrait-plan.json: append entries with status pending
plan_path = ROOT + 'data/portrait-plan.json'
plan = json.load(open(plan_path, encoding='utf-8'))
have = {it['id'] for it in plan}
for p in PEOPLE:
    assert p['id'] not in have, 'already in plan: ' + p['id']
    plan.append({
        'id': p['id'], 'name': p['name'], 'gender': p['gender'],
        'role': p['role'], 'source': p['source'], 'evidence': p['evidence'],
        'appearance': p['appearance'], 'status': 'pending',
    })
json.dump(plan, open(plan_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(plan_path, 'a').write('\n')
print('plan: appended', len(PEOPLE), 'pending entries; total', len(plan))

# 2. import-jobs.json
jobs = [{'id': p['id'], 'path': TMP + p['gen_file'], 'prompt': p['prompt']} for p in PEOPLE]
for j in jobs:
    assert os.path.exists(j['path']), 'missing generated file: ' + j['path']
json.dump(jobs, open(TMP + 'import-jobs.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('import-jobs.json written:', len(jobs))

# 3. portrait-eligibility-review.json: add entries + counts
rev_path = ROOT + 'data/portrait-eligibility-review.json'
rev = json.load(open(rev_path, encoding='utf-8'))
reviewed_ids = {e['id'] for e in rev['entries']}
for p in PEOPLE:
    assert p['id'] not in reviewed_ids, 'already reviewed: ' + p['id']
    rev['entries'].append({
        'id': p['id'], 'name': p['name'], 'gender': p['gender'],
        'role': p['role'], 'source': p['source'],
        'reviewNote': p['reviewNote'],
        'decision': 'eligible', 'portraitStatus': 'generated',
        'publicationVerified': False, 'batch': 'portrait-batch-07',
        'publicVerifiedAt': NOW_UTC,
    })
rev['reviewedCount'] = len(rev['entries'])
remaining = [x for x in rev['initialUnlisted'] if x['id'] not in {e['id'] for e in rev['entries']}]
rev['remainingUnreviewedCount'] = len(remaining)
rev['portraitEligibilityReviewComplete'] = (len(remaining) == 0)
json.dump(rev, open(rev_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(rev_path, 'a').write('\n')
print('review: reviewedCount', rev['reviewedCount'], '| remaining', rev['remainingUnreviewedCount'])

# 4. portrait-batch-state.json
st_path = ROOT + 'data/portrait-batch-state.json'
st = json.load(open(st_path, encoding='utf-8'))
st['batch'] = 'portrait-batch-07'
st['stage'] = 'generated-local'
st['ids'] = [p['id'] for p in PEOPLE]
st['unlistedPortraitPeople'] = rev['remainingUnreviewedCount']
st['portraitEligibilityReviewComplete'] = rev['portraitEligibilityReviewComplete']
st['note'] = 'portrait-batch-07：步騭(p0204)、傅燮(p0272)、橋玄(p0273)、王匡(p0275)逐人適用性複核通過並生成120×120頭像，本地導入完成未推送；173人名單剩%s人待複核。' % rev['remainingUnreviewedCount']
st['localChecksPassed'] = True
json.dump(st, open(st_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('state: batch', st['batch'], '| remaining', st['unlistedPortraitPeople'])
