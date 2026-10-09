# -*- coding: utf-8 -*-
"""portrait-batch-06 staging: plan entries + import-jobs.json + review/state updates (pre-import)."""
import json, datetime, os

ROOT = '/home/hatch/workspace/sanguo/'
TMP = ROOT + 'tmp/portrait-batch-06/'

P185_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Zhang Bao (張苞), eldest son of Zhang Fei of Shu Han, late Eastern Han. Primary source: Records of the Three Kingdoms, Shu book vol. 6 (a04-036), Zhang Fei biography: 「追謚飛曰桓侯。長子苞，早夭」 — Zhang Fei's eldest son Bao died young; his son Zun served as Imperial Secretary and died with Zhuge Zhan at Mianzhu fighting Deng Ai. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits (do not copy Zhang Fei's recorded appearance). Give him a youthful son-of-a-great-general bearing, Han-dynasty military helmet and iron armor over a cross-collared robe, per his military-family identity. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P186_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Zhuge Shang (諸葛尚), eldest son of Zhuge Zhan of Shu Han, grandson of Zhuge Liang, late Three Kingdoms. Primary source: Records of the Three Kingdoms, Shu book vol. 5 (a04-035), Zhuge Liang biography with Pei Songzhi's commentary citing the Chronicles of Huayang: 「瞻長子尚，與瞻俱沒」 — Shang died together with his father Zhan at Mianzhu; before the battle he sighed: 「父子荷國重恩，不早斬黃皓，以致傾敗，用生何為！」 then rode out against the Wei army and died. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits (do not copy Zhuge Liang's or Zhuge Zhan's recorded appearance). Give him a young officer's earnest, resolute bearing, Han-dynasty military helmet and iron armor over a cross-collared robe, per his military service and death in battle. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P187_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Ma Dai (馬岱), Shu Han military general, kinsman of Ma Chao, late Eastern Han to Three Kingdoms. Primary source: Records of the Three Kingdoms, Shu book vol. 6 (a04-036), Ma Chao biography: 「岱位至平北將軍，進爵陳倉侯」 — he rose to General Who Pacifies the North (平北將軍) and was enfeoffed as Marquis of Chencang (陳倉侯). No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits (do not copy Ma Chao's recorded appearance). Give him a seasoned frontier general's steady bearing, Han-dynasty military helmet and polished iron armor over a cross-collared robe, per his rank as a general. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P189_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Luo Xian (羅憲), Shu Han defender-general of Badong, later Western Jin official, late Three Kingdoms. Primary sources: Records of the Three Kingdoms, Shu book vol. 11 (a04-041): the Later Ruler appointed him adjutant to Yan Yu and then his successor holding Yong'an (永安) — after Chengdu fell he kept order, refused to surrender to Wu, fortified the city, and for six months beat off Wu sieges led by Bu Xie and Lu Kang; Records of the Three Kingdoms, Wu book vol. 3 (a04-048): 「率衆圍蜀巴東守將羅憲」 — Wu armies besieged Shu's Badong defender Luo Xian. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a steadfast siege-commander's resolute bearing, Han-dynasty military helmet and iron armor over a cross-collared robe, per his rank as a general. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

NOW_UTC = datetime.datetime.now(datetime.timezone.utc).isoformat()

PEOPLE = [
    dict(
        id='p0185', name='張苞', gender='male',
        role='張飛之長子、早夭', source='a04-036',
        evidence='「追謚飛曰桓侯。長子苞，早夭。次子紹嗣，官至侍中尚書僕射。苞子遵為尚書，隨諸葛瞻於緜竹，與鄧艾戰，死。」（《三國志·蜀書六》張飛傳）',
        appearance='',
        prompt=P185_PROMPT,
        gen_file='media-generation-portrait-batch-06-p0185-zhangb-0-c188753a-c8cc-4a8b-81a0-d2f55f5ff10d.webp',
        reviewNote='《三國志·蜀書六》張飛傳：「追謚飛曰桓侯。長子苞，早夭。」其子遵為尚書，隨諸葛瞻戰死緜竹。張飛之子，武將之後身份明確，雖早夭無官職記載；按用戶規則戴頭盔、著甲胄。不套用張飛本人五官記載；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0186', name='諸葛尚', gender='male',
        role='諸葛瞻之長子、緜竹戰死', source='a04-035',
        evidence='「瞻長子尚，與瞻俱沒……尚歎曰：『父子荷國重恩，不早斬黃皓，以致傾敗，用生何為！』乃馳赴魏軍而死。」（《三國志·蜀書五》諸葛亮傳裴注引《華陽國志》）',
        appearance='',
        prompt=P186_PROMPT,
        gen_file='media-generation-portrait-batch-06-p0186-zhuges-0-82fd92e1-afd2-4c54-a9cd-3247c1ea3aae.webp',
        reviewNote='《三國志·蜀書五》諸葛亮傳注引《華陽國志》：「瞻長子尚，與瞻俱沒」，臨戰歎「父子荷國重恩……用生何為！」馳赴魏軍而死。緜竹隨父戰死之年輕武人，按用戶規則戴頭盔、著甲胄。不套用諸葛亮、諸葛瞻五官記載；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0187', name='馬岱', gender='male',
        role='蜀漢平北將軍、陳倉侯', source='a04-036',
        evidence='「岱位至平北將軍，進爵陳倉侯。」（《三國志·蜀書六》馬超傳）',
        appearance='',
        prompt=P187_PROMPT,
        gen_file='media-generation-portrait-batch-06-p0187-madai-0-54934b34-40e9-4fc5-ab5c-4c18b3f8f571.webp',
        reviewNote='《三國志·蜀書六》馬超傳：「岱位至平北將軍，進爵陳倉侯。」官拜平北將軍之武將，按用戶規則戴頭盔、著甲胄。未核得本人五官特徵，不套用馬超記載；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0189', name='羅憲', gender='male',
        role='蜀巴東守將、領軍', source='a04-041',
        evidence='「後主拜憲為宇副貳……魏之伐蜀，召宇西還，留宇二千人，令憲守永安城……被攻凡六月日而救援不到。」（《三國志·蜀書十一》）；「二月，鎮軍陸抗……率衆圍蜀巴東守將羅憲。」（《三國志·吳書三》三嗣主傳）',
        appearance='',
        prompt=P189_PROMPT,
        gen_file='media-generation-portrait-batch-06-p0187-madai-0-2797b3a2-68ae-4688-af57-cf2051b9a0bf.webp',
        reviewNote='《三國志·蜀書十一》：後主拜為閻宇副貳、守永安城，成都陷後保城繕甲，拒吳軍步協、陸抗圍攻凡六月，大破之。巴東守將武將身份，按用戶規則戴頭盔、著甲胄。未核得本人五官特徵；採普通比例原創藝術示意。',
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
        'publicationVerified': False, 'batch': 'portrait-batch-06',
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
st['batch'] = 'portrait-batch-06'
st['stage'] = 'generated-local'
st['ids'] = [p['id'] for p in PEOPLE]
st['unlistedPortraitPeople'] = rev['remainingUnreviewedCount']
st['portraitEligibilityReviewComplete'] = rev['portraitEligibilityReviewComplete']
st['note'] = 'portrait-batch-06：張苞(p0185)、諸葛尚(p0186)、馬岱(p0187)、羅憲(p0189)逐人適用性複核通過並生成120×120頭像，本地導入完成未推送；173人名單剩%s人待複核。' % rev['remainingUnreviewedCount']
st['localChecksPassed'] = True
json.dump(st, open(st_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('state: batch', st['batch'], '| remaining', st['unlistedPortraitPeople'])
