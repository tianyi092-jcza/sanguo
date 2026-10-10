async (page) => {
  const errors=[],calls={sessions:0,viewports:0,tiles:0,sdk:0};
  page.on('pageerror',error=>errors.push(error.message));
  let mode='ok';
  const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
  const image='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#294139"/><path d="M0 128H256M128 0V256" stroke="#688173"/><text x="20" y="40" fill="#d3dccf">TEST TILE · NO IMAGERY</text></svg>';
  await page.route('https://tile.googleapis.com/**',async route=>{
    const req=route.request(),url=req.url(),path=url.split('?')[0].replace('https://tile.googleapis.com','');
    const parameter=name=>decodeURIComponent((url.match(new RegExp('[?&]'+name+'=([^&]*)'))||[])[1]||'');
    if(parameter('key')!=='test-browser-key'){await route.abort();throw Error('Refusing a real Google request during mock testing');}
    if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:cors});return;}
    if(path==='/v1/createSession'){
      calls.sessions++;
      const body=req.postDataJSON();
      if(body.mapType!=='satellite'||body.layerTypes!==undefined||body.overlay!==undefined)throw Error('Satellite request contains unwanted road or label layers');
      if(mode==='slow-session')await page.waitForTimeout(300);
      await route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({session:'test-session-'+calls.sessions,expiry:String(Math.floor(Date.now()/1000)+3600),tileWidth:256,tileHeight:256,imageFormat:'png'})});return;
    }
    if(path==='/tile/v1/viewport'){
      calls.viewports++;
      if(mode==='network-error'){await route.abort('failed');return;}
      if(mode==='auth-error'){await route.fulfill({status:403,headers:cors,contentType:'application/json',body:'{"error":{"status":"PERMISSION_DENIED"}}'});return;}
      for(const p of ['zoom','north','south','west','east'])if(!Number.isFinite(Number(parameter(p))))throw Error('Invalid viewport bound');
      await route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify({copyright:'TEST imagery attribution',maxZoomRects:[{north:90,south:-90,east:180,west:-180,maxZoom:mode==='unavailable'?2:22}]})});return;
    }
    if(path.startsWith('/v1/2dtiles/')){
      calls.tiles++;
      if(!parameter('session'))throw Error('Tile missing session');
      await route.fulfill({status:200,headers:cors,contentType:'image/svg+xml',body:image});return;
    }
    await route.abort();throw Error('Unexpected Map Tiles endpoint');
  });
  await page.route('https://maps.googleapis.com/**',async route=>{calls.sdk++;await route.abort();});
  await page.route('https://*.autonavi.com/**',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:image}));
  const open=async()=>{
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(()=>{googleSatellite.config.apiKey='';configureGoogleMapOption();});
  };
  const enable=async()=>page.evaluate(()=>{googleSatellite.config.apiKey='test-browser-key';configureGoogleMapOption();});
  const ready=async()=>page.waitForFunction(()=>document.querySelector('#googleMapTiles').dataset.state==='ready');
  await page.setViewportSize({width:1440,height:960});await open();
  if(!await page.locator('#baseSel option[value="google"]').isDisabled()||calls.sessions)throw Error('Google called or enabled without key');
  await page.evaluate(()=>{document.querySelector('#baseSel').value='google';renderMap();});
  if(!(await page.locator('#mapTileStatus').innerText()).includes('尚未啟用')||calls.sessions)throw Error('Missing-key guard failed');
  await page.selectOption('#baseSel','demo');await enable();await page.selectOption('#baseSel','google');await ready();
  if(calls.sessions!==1||calls.viewports!==1||calls.tiles<1||calls.sdk)throw Error('Wrong Map Tiles initialization');
  if(!(await page.locator('#googleCopyright').innerText()).includes('TEST imagery attribution'))throw Error('Copyright missing');
  if(await page.locator('#ovSvg circle').count()<50)throw Error('History overlay missing');
  const beforeFilter={...calls};
  await page.selectOption('#periodSel','c2');await page.locator('#showCounty').check();
  await page.waitForTimeout(220);
  if(calls.sessions!==beforeFilter.sessions||calls.viewports!==beforeFilter.viewports||calls.tiles!==beforeFilter.tiles)throw Error('History filters refetched satellite tiles');
  await page.locator('#zin').click();await ready();
  if(calls.sessions!==1||await page.evaluate(()=>googleSatellite.frame.z)!==6)throw Error('Session reuse or zoom failed');
  const point=await page.evaluate(()=>{
    const p=DATA.cmd.find(c=>c.seat.includes('洛陽'))||DATA.cmd.find(c=>c.imp===2);
    gotoPlace(p.lon,p.lat,()=>showPanel(p));return {lon:p.lon,lat:p.lat,name:p.n};
  });await ready();
  const position=await page.evaluate(p=>{
    const frame=googleSatellite.frame;return {point:googleScreenPoint(p.lon,p.lat,frame),width:frame.width,height:frame.height,z:frame.z,coordinates:onlineMapCoordinates(116.4,39.9,'google')};
  },point);
  if(position.z!==9||position.coordinates[0]!==116.4||Math.abs(position.point[0]-position.width/2)>.01||Math.abs(position.point[1]-position.height/2)>.01)throw Error('WGS-84 place alignment failed');
  if(!(await page.locator('#mapPanel').innerText()).includes(point.name))throw Error('Place details missing');
  await page.evaluate(()=>{document.querySelector('#mapPanel').style.display='none';});
  const before=await page.evaluate(()=>({...view})),box=await page.locator('#mapWrap').boundingBox();
  await page.mouse.move(box.x+box.width*.58,box.y+box.height*.54);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.58+96,box.y+box.height*.54+48,{steps:8});await page.mouse.up();
  await page.waitForFunction(p=>view.lon!==p.lon&&view.lat!==p.lat,before);await ready();
  const after=await page.evaluate(()=>({...view})),scale=256*2**before.z;
  const y=(.5-Math.log(Math.tan(Math.PI/4+before.lat*Math.PI/360))/(2*Math.PI))*scale;
  const expectedLat=Math.atan(Math.sinh(Math.PI*(1-2*(y-48)/scale)))*180/Math.PI;
  if(Math.abs(after.lon-(before.lon-96/scale*360))>1e-7||Math.abs(after.lat-expectedLat)>1e-7)throw Error('Dragging lost movement or added a GCJ offset');
  const existingSessions=calls.sessions;
  await page.evaluate(()=>{googleSatellite.session.expiry=Date.now()-1;});
  await page.locator('#zin').click();await ready();
  if(calls.sessions!==existingSessions+1)throw Error('Expired session not renewed');
  await page.selectOption('#baseSel','asat');
  if(await page.locator('#mapAttribution').isVisible()||await page.locator('#googleMapTiles').isVisible())throw Error('Google layer not hidden after switch');
  const drift=await page.evaluate(()=>{const p={...view};for(let i=0;i<100;i++)panOnlineMap(0,0);return Math.max(Math.abs(view.lon-p.lon),Math.abs(view.lat-p.lat));});
  if(drift>1e-7)throw Error('Amap panning accumulates coordinate drift');
  await page.selectOption('#baseSel','google');await ready();
  await page.getByText('人物列傳',{exact:true}).click();
  if(await page.locator('#googleMapTiles').isVisible())throw Error('Google layer remains visible in other views');
  await page.getByText('疆域地圖',{exact:true}).click();await ready();
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>googleSatellite.frame.width===390);await ready();
  const mobile=await page.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,layer:document.querySelector('#googleMapTiles').clientWidth,overlay:document.querySelector('#ovSvg').clientWidth,attribution:document.querySelector('#mapAttribution').getBoundingClientRect().width}));
  if(mobile.body>mobile.width+1||mobile.layer!==mobile.overlay||mobile.attribution>mobile.width)throw Error('Mobile layout overflow');
  await page.screenshot({path:'output/playwright/google-satellite-layout-test.png'});
  await page.setViewportSize({width:1440,height:960});
  mode='slow-session';await open();await enable();await page.selectOption('#baseSel','google');
  await page.waitForFunction(()=>!!googleSatellite.pendingSession);await page.selectOption('#baseSel','demo');
  await page.waitForFunction(()=>!!googleSatellite.session);
  if(await page.locator('#googleMapTiles').isVisible()||await page.locator('#mapAttribution').isVisible())throw Error('Late session response changed current basemap');
  mode='ok';await page.selectOption('#baseSel','google');await ready();
  mode='network-error';await page.locator('#zin').click();
  await page.waitForFunction(()=>document.querySelector('#googleMapTiles').dataset.state==='error');
  mode='ok';await page.locator('#retryGoogle').click();await ready();
  mode='unavailable';await page.locator('#zin').click();
  await page.waitForFunction(()=>document.querySelector('#googleMapTiles').dataset.state==='unavailable');
  if(await page.locator('#googleMapTiles img').count())throw Error('Requested tiles without coverage');
  mode='auth-error';await page.locator('#zout').click();
  await page.waitForFunction(()=>googleSatellite.errorStatus===403);
  if(!(await page.locator('#mapTileStatus').innerText()).includes('授權未通過'))throw Error('Permission error not explained');
  await page.locator('#useAmapSatellite').click();
  if(await page.locator('#baseSel').inputValue()!=='asat'||await page.locator('#mapTileStatus').isVisible())throw Error('Fallback failed');
  if(errors.length||calls.sdk)throw Error('Unexpected page errors or SDK requests');
  await page.unroute('https://tile.googleapis.com/**');await page.unroute('https://maps.googleapis.com/**');await page.unroute('https://*.autonavi.com/**');
  await page.goto('http://127.0.0.1:4173/');
  return {api:'Map Tiles API, mocked only',pureSatellite:true,errors,calls,mobile,checks:'key guard, no roads/labels, session reuse and expiry, attribution, coverage, WGS-84, pan/zoom, filters, place jump, async switch, network retry, auth fallback and mobile passed'};
}
