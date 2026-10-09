# -*- coding: utf-8 -*-
"""portrait-batch-04 staging: plan entries + import-jobs.json + state updates (pre-import)."""
import json, datetime

ROOT = '/home/hatch/workspace/sanguo/'
TMP = ROOT + 'tmp/portrait-batch-04/'

P113_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Xu You (許攸), male strategist of late Eastern Han, adviser first to Yuan Shao then to Cao Cao. Primary source: Records of the Three Kingdoms, Wei book vol. 1 (a04-001): 「紹謀臣許攸貪財，紹不能足，來奔，因說公擊瓊等」 — he defected to Cao Cao before the Battle of Guandu and urged the night raid on Wuchao (烏巢); the Cao Man Zhuan adds 「公聞攸來，跣出迎之」. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion. Give him a sharp, self-assured adviser's bearing, plain dark cross-collar scholar's robe with a modest black cloth cap over tied hair — he is a civil strategist, NOT a general: no helmet, no armor, no weapon. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P114_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Ma Teng (馬騰), male military general and Xiliang warlord, father of Ma Chao, late Eastern Han. Primary source: Records of the Three Kingdoms, Shu book vol. 6 (a04-036), citing Dian Lüe (典略): 「騰為人長八尺餘，身體洪大，面鼻雄異，而性賢厚，人多敬之」 — tall (over eight chi), large-bodied, with a bold distinctive face and nose, by nature generous and kind. Career: rose with Bian Zhang and Han Sui in the west, made General Who Pacifies the West (征西將軍), later General of the Van (前將軍), enfeoffed Marquis of Huaili. Depict a powerfully built, dignified northwestern commander with a strong bold nose as the one recorded trait; do not invent other ethnic or facial specifics. Give him a Han-dynasty military helmet and polished iron armor over a cross-collared robe. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P115_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Han Sui (韓遂), male military warlord of Jincheng in the northwest, late Eastern Han. Primary source: Records of the Three Kingdoms, Shu book vol. 6 (a04-036): 「漢朝以遂為鎮西將軍，遣還金城」 — appointed General Who Guards the West; Dian Lüe records his later years in Huangzhong, betrayed by his son-in-law Yan Xing: 「丈夫困厄，禍起婚姻乎！」 No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a weathered veteran commander's bearing, lean resolute face, Han-dynasty military helmet, polished iron armor over a cross-collared robe. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P122_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Meng Huo (孟獲), male chieftain of the southern tribes (南中), Shu Han era. Primary source: Records of the Three Kingdoms, Shu book vol. 5 (a04-035), citing Han Jin Chunqiu (漢晉春秋): 「聞孟獲者，為夷、漢所服，募生致之」 — a leader respected by both Yi and Han peoples, whom Zhuge Liang captured and released seven times (七縱七禽) during the southern campaign. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion. Depict a proud tribal chieftain in simple period southern tribal garb with modest local ornament — NOT Han military helmet or armor, NOT Han scholar robes; no fantasy or anachronistic costume. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

NOW_UTC = datetime.datetime.now(datetime.timezone.utc).isoformat()

PEOPLE = [
    dict(
        id='p0113', name='許攸', gender='male',
        role='袁紹謀臣、後歸曹操之謀士', source='a04-001',
        evidence='「紹謀臣許攸貪財，紹不能足，來奔，因說公擊瓊等。」（《三國志·魏書一》武帝紀；攸策烏巢之襲）曹瞞傳曰：「公聞攸來，跣出迎之。」',
        appearance='',
        prompt=P113_PROMPT,
        gen_file='media-generation-p0113-xuyou-0-4396362c-fbc5-4e85-b50e-bc82cc6d939f.webp',
        reviewNote='《三國志·魏書一》武帝紀：「紹謀臣許攸貪財，紹不能足，來奔，因說公擊瓊等」；曹瞞傳：「公聞攸來，跣出迎之」。官渡烏巢之謀主。未核得本人五官特徵；採普通比例原創藝術示意。謀士依身份著文士服飾，不戴盔甲。',
    ),
    dict(
        id='p0114', name='馬騰', gender='male',
        role='涼州軍閥、征西將軍→前將軍', source='a04-036',
        evidence='「騰為人長八尺餘，身體洪大，面鼻雄異，而性賢厚，人多敬之。」（《三國志·蜀書六》馬超傳引典略；騰官至征西將軍、前將軍，封槐里侯）',
        appearance='長八尺餘，身體洪大，面鼻雄異（典略）',
        prompt=P114_PROMPT,
        gen_file='media-generation-p0114-mateng-0-1781ce9c-2591-429a-b389-2c8d468ce3bf.webp',
        reviewNote='《三國志·蜀書六》馬超傳引典略：「騰為人長八尺餘，身體洪大，面鼻雄異，而性賢厚，人多敬之」。征西將軍、前將軍，馬超之父。只用馬騰本人記載，不挪用馬超或馬援材料；羌母出身不做為五官依據。面鼻雄異為本人明載特徵，其餘五官採普通比例藝術示意。武將按用戶規則戴頭盔、著甲胄。',
    ),
    dict(
        id='p0115', name='韓遂', gender='male',
        role='金城軍閥、鎮西將軍', source='a04-015',
        evidence='「漢朝以遂為鎮西將軍，遣還金城。」（《三國志·蜀書六》馬超傳）典略曰：韓遂在湟中，其壻閻行欲殺遂以降，夜攻遂，不下。遂歎息曰：「丈夫困厄，禍起婚姻乎！」（《三國志·魏書十五》成公英傳引典略）',
        appearance='',
        prompt=P115_PROMPT,
        gen_file='media-generation-p0115-hansui-0-0c9fa2ad-ba35-4bee-ac55-73cf5f1794da.webp',
        reviewNote='《三國志·蜀書六》馬超傳：「漢朝以遂為鎮西將軍，遣還金城」；《三國志·魏書十五》成公英傳引典略載湟中事：「丈夫困厄，禍起婚姻乎！」。金城軍閥。不套用馬騰之「面鼻雄異」；未核得本人五官特徵，採普通比例原創藝術示意。武將按用戶規則戴頭盔、著甲胄。',
    ),
    dict(
        id='p0122', name='孟獲', gender='male',
        role='南中首領', source='a04-035',
        evidence='「聞孟獲者，為夷、漢所服，募生致之。」（《三國志·蜀書五》諸葛亮傳引漢晉春秋；亮七縱七禽）',
        appearance='',
        prompt=P122_PROMPT,
        gen_file='media-generation-p0122-menghuo-0-c358bb6f-c265-4449-8e54-025ec988c787.webp',
        reviewNote='《三國志·蜀書五》諸葛亮傳引漢晉春秋：「聞孟獲者，為夷、漢所服，募生致之」；七縱七禽。南中首領。非漢人將軍，不著漢式盔甲，採南中首領裝束藝術示意。未核得本人五官特徵；採普通比例原創藝術示意。',
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
for p, j in zip(PEOPLE, jobs):
    import os
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
        'publicationVerified': False, 'batch': 'portrait-batch-04',
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
st['batch'] = 'portrait-batch-04'
st['stage'] = 'generated-local'
st['ids'] = [p['id'] for p in PEOPLE]
st['generatedCount'] = len([x for x in plan if x.get('status') == 'generated']) + len(PEOPLE)
st['unlistedPortraitPeople'] = rev['remainingUnreviewedCount']
st['portraitEligibilityReviewComplete'] = rev['portraitEligibilityReviewComplete']
st['publicVerified'] = False
st['note'] = 'portrait-batch-04：許攸(p0113)、馬騰(p0114)、韓遂(p0115)、孟獲(p0122)逐人適用性複核通過並生成120×120頭像，本地導入完成未推送；173人名單剩161人待複核。'
json.dump(st, open(st_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(st_path, 'a').write('\n')
print('state updated:', st['batch'], st['stage'])
