async (page) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:960});
 await page.goto('http://127.0.0.1:4173/');
 await page.getByText('人物列傳',{exact:true}).click();
 const cases=[['曹洪','曹操 → 曹魏'],['公孫瓚','公孫瓚'],['趙雲','公孫瓚 → 劉備 → 蜀漢'],['李傕','董卓 → 李傕'],['郭汜','董卓 → 郭汜'],['張濟','董卓 → 張濟'],['陳宮','曹操 → 呂布'],['張苞','劉備·家族'],['華佗','曹操·召醫'],['卑彌呼','倭女王國']];
 const labels={};
 for(const [name,expected] of cases){
  await page.getByRole('searchbox',{name:'篩選時間軸人物'}).fill(name);
  await page.waitForFunction(n=>Array.from(document.querySelectorAll('.person-name b')).some(e=>e.textContent===n),name);
  const row=page.locator('.person-name').filter({has:page.getByText(name,{exact:true})}).first();
  const text=await row.innerText();if(!text.includes(expected))throw Error(name+' missing visible affiliation: '+text);
  await row.click();
  if(!(await page.locator('.person-affiliation-overview').innerText()).includes(expected))throw Error(name+' missing detail affiliation');
  const details=page.locator('.affiliation-evidence details').first();await details.locator('summary').click();
  if((await details.locator('blockquote').innerText()).length<8||!await details.locator('a').getAttribute('href'))throw Error(name+' missing expandable primary evidence');
  const color=await details.locator('a').evaluate(e=>getComputedStyle(e).color);
  if(color!=='rgb(166, 173, 182)')throw Error('Source link is not neutral grey: '+color);
  labels[name]=text;await page.keyboard.press('Escape');
 }
 for(const [name,needle] of [['關羽','漢壽亭侯'],['馬超','漢末·漢中王劉備授：左將軍'],['李傕','池陽侯']]){
  await page.getByRole('searchbox',{name:'篩選時間軸人物'}).fill(name);
  const row=page.locator('.person-name').filter({has:page.getByText(name,{exact:true})}).first();
  if(!(await row.locator('.person-office').innerText()).includes(needle))throw Error(name+' missing office annotation');
 }
 await page.getByRole('searchbox',{name:'篩選時間軸人物'}).fill('');
 await page.locator('#factionFilter').selectOption('gongsun');
 const factionNames=await page.locator('.person-name b').allTextContents();
 if(!factionNames.includes('趙雲')||!factionNames.includes('公孫瓚'))throw Error('Known membership lost in faction filter');
 await page.locator('#factionFilter').selectOption('wa');
 if(!await page.locator('.person-name b').getByText('臺與',{exact:true}).count())throw Error('Undated membership missing from filter');
 await page.locator('#factionFilter').selectOption('all');
 await page.getByRole('searchbox',{name:'篩選時間軸人物'}).fill('漢獻帝');
 if(!await page.locator('.tenure').count())throw Error('Han emperor interval missing');
 await page.locator('.tenure').first().click();
 if(!(await page.locator('#modal').innerText()).includes('220年'))throw Error('Han court cut off before 220');
 const scrollbar=await page.locator('#modal').evaluate(e=>getComputedStyle(e).scrollbarColor);
 if(!scrollbar.includes('101, 112, 125'))throw Error('Custom modal scrollbar absent');
 await page.keyboard.press('Escape');
 await page.getByRole('searchbox',{name:'篩選時間軸人物'}).fill('曹洪');
 await page.screenshot({path:'output/playwright/affiliations-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(150);
 const mobile=await page.evaluate(()=>({body:document.body.scrollWidth,width:innerWidth,row:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--row-height'))}));
 if(mobile.body>mobile.width+1||mobile.row<78)throw Error('Mobile affiliation layout overflow');
 await page.screenshot({path:'output/playwright/affiliations-mobile.png'});
 await page.locator('.person-name').first().click();
 const modal=await page.locator('#modal').evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth}));
 if(modal.scroll>modal.width+1)throw Error('Mobile detail overflow');
 await page.screenshot({path:'output/playwright/affiliations-detail-mobile.png'});
 await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:960});
 if(errors.length)throw Error(errors.join('\n'));
 return {cases:cases.length,labels,factionFilter:'passed',hanEnd:220,sourceColor:'grey',scrollbar,mobile,modal,errors};
}
