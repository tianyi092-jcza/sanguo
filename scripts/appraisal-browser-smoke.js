async (page) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:960});
  await page.goto('http://127.0.0.1:4173/');
  const cases=[
    ['曹操','非常之人，超世之傑矣。','a04-001'],
    ['曹丕','古之賢主，何遠之有哉！','a04-002'],
    ['荀彧','未能充其志也。','a04-010'],
    ['荀攸','其良、平之亞與！','a04-010'],
    ['賈詡','其良、平之亞與！','a04-010'],
    ['關羽','理數之常也。','a04-036'],
    ['張飛','理數之常也。','a04-036'],
    ['馬超','能因窮致泰，不猶愈乎！','a04-036'],
    ['黃忠','其灌、滕之徒歟？','a04-036'],
    ['趙雲','其灌、滕之徒歟？','a04-036'],
    ['郭嘉','籌畫所料是其倫也。','a04-014'],
    ['董和','皆蜀臣之良矣。','a04-039'],
    ['孫權','胤嗣廢斃','a04-047'],
    ['郭皇后','魏后妃之家','a04-005'],
    ['曹純','咸有効勞','a04-009'],
    ['夏侯霸','咸有効勞','a04-009'],
    ['韋昭','韋曜篤學好古','a04-065']
  ],seen={};
  for(const [name,needle,source] of cases){
    await page.locator('#q').fill(name);await page.locator('#results .res').first().click();
    const section=page.locator('#modal .sec').filter({has:page.getByRole('heading',{name:'五 · 陳壽評曰',exact:true})});
    const quote=await section.locator('.chen-appraisal > blockquote').first().innerText();
    if(!quote.includes(needle)||!quote.startsWith('評曰：')||quote.includes('臣松之'))throw Error('Invalid appraisal: '+name);
    if(await section.locator('.chen-appraisal').first().getAttribute('data-appraisal-source')!==source)throw Error('Wrong source: '+name);
    const hrefs=await section.locator('a').evaluateAll(a=>a.map(e=>e.href));
    if(!hrefs.some(h=>h.includes('/a04/'+source.slice(-3)+'.html')))throw Error('Source link missing: '+name);
    if(name==='曹丕'&&quote.includes('典論'))throw Error('Pei annotation mixed into Cao Pi appraisal');
    if(name==='荀彧'&&quote.includes('荀攸'))throw Error('Xun Yu appraisal not split');
    if(name==='董和'&&quote.includes('劉巴'))throw Error('Dong He appraisal not split');
    if(['郭皇后','曹純','夏侯霸'].includes(name)&&!(await section.innerText()).includes('本卷合傳總評'))throw Error('Chapter-level scope not stated');
    seen[name]=quote;
    if(name==='關羽'){
      await section.locator('summary').click();
      if(!(await section.locator('details blockquote').innerText()).includes('馬超阻戎負勇'))throw Error('Whole chapter appraisal missing');
    }
    await page.keyboard.press('Escape');
  }
  if(seen['關羽']!==seen['張飛']||seen['黃忠']!==seen['趙雲'])throw Error('Shared appraisals differ');
  if(seen['關羽'].includes('馬超')||seen['馬超'].includes('趙雲'))throw Error('Joint biography not segmented by subject');
  for(const name of ['馬謖','司馬炎']){
    await page.locator('#q').fill(name);await page.locator('#results .res').first().click();
    const section=page.locator('#modal .sec').filter({has:page.getByRole('heading',{name:'五 · 陳壽評曰',exact:true})});
    if(await section.locator('.chen-appraisal').count()||!(await section.innerText()).includes('未見直接評及本人'))throw Error('Invented appraisal: '+name);
    await page.keyboard.press('Escape');
  }
  await page.locator('#q').fill('孫權');await page.locator('#results .res').first().click();
  const multi=page.locator('#modal .sec').filter({has:page.getByRole('heading',{name:'五 · 陳壽評曰',exact:true})});
  if(await multi.locator('.chen-appraisal').count()!==3)throw Error('Related chapter appraisals missing');
  await multi.scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/chen-appraisals-desktop.png'});
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#q').fill('关羽');await page.locator('#results .res').first().click();
  const mobileSection=page.locator('#modal .sec').filter({has:page.getByRole('heading',{name:'五 · 陳壽評曰',exact:true})});
  await mobileSection.scrollIntoViewIfNeeded();
  const mobile=await page.locator('#modal').evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth}));
  if(mobile.scroll>mobile.width+1)throw Error('Appraisal overflows on mobile');
  await page.screenshot({path:'output/playwright/chen-appraisals-mobile.png'});
  await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:960});
  if(errors.length)throw Error(errors.join('\n'));
  return {sampledPeople:cases.length+2,sharedQuotes:true,sourceLinks:true,fullChapterExpansion:true,mobile,errors};
}
