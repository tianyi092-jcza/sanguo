import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadAppraisals,appraisalsFor} from './appraisals.mjs';

export function checkAppraisals(data,history,normalize,traditional){
  const chapters=history.appraisalChapters;
  assert.equal(Object.keys(chapters).length,65,'Missing reviewed chapter appraisals');
  for(let n=1;n<=65;n++){
    const source='a04-'+String(n).padStart(3,'0'),chapter=chapters[source];
    assert(chapter?.reviewed&&chapter.quote.startsWith('評曰：'),source+' not reviewed');
    assert(!chapter.quote.includes('臣松之'),source+' contains Pei commentary');
  }
  let peopleWithAppraisals=0,entries=0;
  for(const p of data.per){
    const h=history.people[p.id];
    assert(Array.isArray(h.appraisals),p.n+' lacks appraisal status');
    if(h.appraisals.length)peopleWithAppraisals++;
    for(const a of h.appraisals){
      assert.equal(a.author,'陳壽');assert(history.sources[a.source]);
      assert.equal(a.quote,'評曰：'+a.fragments.join('……'));
      const body=chapters[a.source].quote.slice(3);let cursor=0;
      for(const fragment of a.fragments){const at=body.indexOf(fragment,cursor);assert(at>=0,p.n+' quote not in reviewed author text');cursor=at+fragment.length;}
      entries++;
    }
  }
  const appraisal=name=>{
    const p=data.per.find(p=>normalize(p.n)===normalize(name));assert(p,'Missing person '+name);
    return history.people[p.id].appraisals;
  };
  const cao='評曰：漢末，天下大亂，雄豪並起，而袁紹虎眎四州，彊盛莫敵。太祖運籌演謀，鞭撻宇內，擥申、商之法術，該韓、白之奇策，官方授材，各因其器，矯情任筭，不念舊惡，終能總御皇機，克成洪業者，惟其明略最優也。抑可謂非常之人，超世之傑矣。';
  assert.equal(appraisal('曹操')[0].quote,cao);
  const guan=appraisal('關羽')[0],fei=appraisal('張飛')[0],huang=appraisal('黃忠')[0],zhao=appraisal('趙雲')[0];
  assert.equal(guan.quote,fei.quote);assert(guan.quote.endsWith('理數之常也。'));assert(!guan.quote.includes('馬超'));
  assert.equal(appraisal('馬超')[0].quote,'評曰：馬超阻戎負勇，以覆其族，惜哉！能因窮致泰，不猶愈乎！');
  assert.equal(huang.quote,zhao.quote);assert(huang.quote.startsWith('評曰：黃忠、趙雲'));
  assert(appraisal('曹丕')[0].quote.endsWith('何遠之有哉！'));assert(!appraisal('曹丕')[0].quote.includes('典論'));
  assert.equal(appraisal('荀彧')[0].quote,'評曰：荀彧清秀通雅，有王佐之風，然機鑒先識，未能充其志也。');
  assert(!appraisal('董和')[0].quote.includes('劉巴'));assert(appraisal('董和')[0].quote.includes('皆蜀臣之良'));
  assert.equal(appraisal('郭皇后')[0].kind,'chapter');
  assert.equal(appraisal('曹純')[0].kind,'chapter');assert.equal(appraisal('夏侯霸')[0].kind,'chapter');
  assert.equal(appraisal('馬謖').length,0,'Do not assign Ma Liang appraisal to Ma Su');
  assert.equal(appraisal('司馬炎').length,0,'Do not invent Chen Shou appraisal for a Jin biography');
  assert.equal(appraisal('孫權')[0].source,'a04-047','Main biography appraisal must appear first');
  const docs=fs.readdirSync('data/sources').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('data/sources/'+f,'utf8')));
  const catalog=loadAppraisals(docs,normalize,traditional);
  const wei=appraisalsFor(catalog,{n:'張承'},'a04-011',normalize),wu=appraisalsFor(catalog,{n:'張承'},'a04-052',normalize);
  assert.equal(wei.length,1);assert.equal(wu.length,1);assert.equal(wei[0].source,'a04-011');assert.equal(wu[0].source,'a04-052');
  return {chaptersReviewed:65,peopleWithAppraisals,entries,annotatedChapters:catalog.stats.annotatedChapters,separatedAnnotations:catalog.stats.separatedAnnotations};
}
