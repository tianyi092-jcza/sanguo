# -*- coding: utf-8 -*-
"""portrait-batch-05 staging: plan entries + import-jobs.json + review/state updates (pre-import)."""
import json, datetime, os

ROOT = '/home/hatch/workspace/sanguo/'
TMP = ROOT + 'tmp/portrait-batch-05/'

P124_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Shi Hui (士徽), male regional administrator of the far south, son of Shi Xie, late Eastern Han / early Wu. Primary source: Records of the Three Kingdoms, Wu book vol. 4 (a04-049), Shi Xie biography: 「燮子徽自署交阯太守，發宗兵拒良……徽閉門城守……岱起，擁節讀詔書，數徵罪過，左右因反縛以出，即皆伏誅」 — he styled himself Administrator of Jiaozhi (交阯太守), raised clan troops to bar the imperial appointee, shut the city gates against attack, and was executed by Lü Dai on imperial orders. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Depict a middle-aged southern administrator-aristocrat with a calm authoritative bearing, simple dark cloth cap over tied hair, plain dark cross-collared official robe — he is a civil administrator, NOT a battlefield general: no helmet, no armor, no weapon. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P125_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Dong Cheng (董承), male military general of late Eastern Han. Primary sources: Records of the Three Kingdoms, Shu book vol. 2 (a04-032), First Ruler biography: 「獻帝舅車騎將軍董承……辭受帝衣帶中密詔，當誅曹公」 — maternal nephew of Empress Dowager Dong, appointed General of Chariots and Cavalry (車騎將軍); he secretly received Emperor Xian's hidden edict sewn into the imperial belt to kill Cao Cao; Records of the Three Kingdoms, Wei book vol. 1 (a04-001): 「五年春正月，董承等謀泄，皆伏誅」 — the plot leaked and he was executed in the first month of Jian'an 5 (200 CE). No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a resolute conspirator-general's bearing, firm grave expression, Han-dynasty military helmet and polished iron armor over a cross-collared robe, per his rank as a general. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P139_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Mi Zhu (糜竺), male scholar-official and guest-minister of early Shu Han. Primary source: Records of the Three Kingdoms, Shu book vol. 8 (a04-038): 「後徐州牧陶謙辟為別駕從事……笁於是進妹於先主為夫人，奴客二千，金銀貨幣以助軍資……益州旣平，拜為安漢將軍，班在軍師將軍之右。笁雍容敦雅，而幹翮非所長。是以待之以上賓之禮，未嘗有所統御」 — recruited by Tao Qian, he married his sister to Liu Bei and funded his army with two thousand retainers and gold; though later enfeoffed as General Who Pacifies Han (安漢將軍), Chen Shou's appraisal stresses his refined dignity and that he was treated as an honored guest-minister, never commanding troops. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits. Give him a refined, gracious minister's bearing, simple dark cloth cap over tied hair, plain dark cross-collared scholar's robe — he is a civil guest-minister, NOT a general: no helmet, no armor, no weapon. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

P183_PROMPT = """Use case: historical-scene. Asset type: one 120x120 display avatar for a Three Kingdoms historical reference site. The two supplied reference images establish STYLE ONLY: retro 1990s Chinese historical strategy-game pixel portrait; do not copy their characters or facial identities. Create ONE original square head-and-shoulders portrait of Guan Ping (關平), male military officer of Shu Han, son of Guan Yu, late Eastern Han. Primary source: Records of the Three Kingdoms, Shu book vol. 6 (a04-036), Guan Yu biography: 「權遣將逆擊羽，斬羽及子平于臨沮」 — he followed his father through the campaigns and was killed alongside him at Linju in 219 CE. He is Guan Yu's son by birth; do not adopt the Romance of the Three Kingdoms novel's adopted-son story. No verified individual facial description; all ordinary facial details are artistic interpretation, not a historical assertion — do not borrow another figure's recorded traits (do not copy Guan Yu's recorded appearance). Give him a young officer's earnest bearing, Han-dynasty military helmet and iron armor over a cross-collared robe, per his military service. Visibly different face from other project portraits. Tight head and upper shoulders, centered. Style details: coarse hand-placed pixel clusters, crisp low-resolution design, strong dithering, limited ochre/earth palette, near-black olive background. No Ming/Qing hat, fantasy armor, huge crown, theatrical makeup, weapon, text, label, watermark, frame, icon, or overlay. Exactly one person. This is an original artistic depiction, not an authentic surviving likeness."""

NOW_UTC = datetime.datetime.now(datetime.timezone.utc).isoformat()

PEOPLE = [
    dict(
        id='p0124', name='士徽', gender='male',
        role='士燮之子、自署交阯太守', source='a04-049',
        evidence='「燮子徽自署交阯太守，發宗兵拒良……岱起，擁節讀詔書，數徵罪過，左右因反縛以出，即皆伏誅。」（《三國志·吳書四》士燮傳）',
        appearance='',
        prompt=P124_PROMPT,
        gen_file='media-generation-p0124-shihui-0-874c337a-3259-4de3-947b-c57c4baa3a8b.webp',
        reviewNote='《三國志·吳書四》士燮傳：「燮子徽自署交阯太守，發宗兵拒良」，閉門城守，後為呂岱奉詔所誅。地方官（太守），非戰陣將軍，依身份著文士服飾，不戴盔甲。未核得本人五官特徵，不套用他人記載；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0125', name='董承', gender='male',
        role='車騎將軍、衣帶詔謀主', source='a04-032',
        evidence='「獻帝舅車騎將軍董承……辭受帝衣帶中密詔，當誅曹公。」（《三國志·蜀書二》先主傳；裴注：董承，漢靈帝母董太后之姪）《三國志·魏書一》武帝紀：「五年春正月，董承等謀泄，皆伏誅。」',
        appearance='',
        prompt=P125_PROMPT,
        gen_file='media-generation-p0125-dongcheng-0-55dd47a4-4712-4ded-8079-77cf0780902e.webp',
        reviewNote='《三國志·蜀書二》先主傳：獻帝舅車騎將軍董承，辭受帝衣帶中密詔，當誅曹公；建安五年謀泄伏誅。官拜車騎將軍，武將身份，按用戶規則戴頭盔、著甲胄。未核得本人五官特徵；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0139', name='糜竺', gender='male',
        role='蜀漢安漢將軍、上賓文士', source='a04-038',
        evidence='「笁雍容敦雅，而幹翮非所長。是以待之以上賓之禮，未嘗有所統御。」（《三國志·蜀書八》麋竺傳；益州既平拜安漢將軍，班在軍師將軍之右）',
        appearance='',
        prompt=P139_PROMPT,
        gen_file='media-generation-p0139-mizhu-0-d52f617f-8758-4681-b302-103e259b912a.webp',
        reviewNote='《三國志·蜀書八》：糜竺進妹於先主為夫人，奴客二千、金銀貨幣助軍資；益州既平拜安漢將軍。然陳壽評「雍容敦雅，而幹翮非所長」「待之以上賓之禮，未嘗有所統御」，實為文士上賓，依身份著文士服飾，不戴盔甲。未核得本人五官特徵；採普通比例原創藝術示意。',
    ),
    dict(
        id='p0183', name='關平', gender='male',
        role='關羽之子、隨父從軍', source='a04-036',
        evidence='「權遣將逆擊羽，斬羽及子平于臨沮。」（《三國志·蜀書六》關羽傳；建安二十四年遇害）',
        appearance='',
        prompt=P183_PROMPT,
        gen_file='media-generation-p0183-guanping-0-63f44422-c59a-4e4d-9c53-50ed914ea2d3.webp',
        reviewNote='《三國志·蜀書六》關羽傳：「斬羽及子平于臨沮」。關羽之子，隨父軍事活動，建安二十四年遇害；不採小說義子說。隨軍武人身份，按用戶規則戴頭盔、著甲胄。不套用關羽本人五官記載；採普通比例原創藝術示意。',
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
        'publicationVerified': False, 'batch': 'portrait-batch-05',
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
st['batch'] = 'portrait-batch-05'
st['stage'] = 'generated-local'
st['ids'] = [p['id'] for p in PEOPLE]
st['generatedCount'] = 317
st['unlistedPortraitPeople'] = rev['remainingUnreviewedCount']
st['portraitEligibilityReviewComplete'] = rev['portraitEligibilityReviewComplete']
st['note'] = 'portrait-batch-05：士徽(p0124)、董承(p0125)、糜竺(p0139)、關平(p0183)逐人適用性複核通過並生成120×120頭像，本地導入完成未推送；173人名單剩157人待複核。'
st['localChecksPassed'] = True
json.dump(st, open(st_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('state: batch', st['batch'], '| remaining', st['unlistedPortraitPeople'])
