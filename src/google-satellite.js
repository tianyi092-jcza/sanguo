// Google Map Tiles API 2D satellite basemap: WGS-84 / Web Mercator.
// Only Amap uses GCJ-02; keep the application view in WGS-84 when panning.
const MAP_TILE_SIZE=256;
const wrapMapLongitude=lon=>((lon+180)%360+360)%360-180;
const mapLatitudeFromPixel=(y,scale)=>Math.atan(Math.sinh(Math.PI*(1-2*y/scale)))*180/Math.PI;
function onlineMapCoordinates(lon,lat,base=$("#baseSel").value){
  return base==="amap"||base==="asat"?w2g(lon,lat):[lon,lat];
}
function amapToWgs(lon,lat){
  let x=lon,y=lat;
  for(let i=0;i<6;i++){
    const g=w2g(x,y),dx=g[0]-lon,dy=g[1]-lat;
    x-=dx;y-=dy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<1e-8)break;
  }
  return [x,y];
}
function panOnlineMap(dx,dy){
  const base=$("#baseSel").value,scale=MAP_TILE_SIZE*2**view.z;
  const p=onlineMapCoordinates(view.lon,view.lat,base);
  const lon=wrapMapLongitude(p[0]-dx/scale*360);
  const lat=Math.max(-75,Math.min(75,mapLatitudeFromPixel(mercY(p[1])*scale-dy,scale)));
  const w=base==="amap"||base==="asat"?amapToWgs(lon,lat):[lon,lat];
  view.lon=wrapMapLongitude(w[0]);view.lat=w[1];
}
let mapRenderFrame=0;
function scheduleMapRender(){
  if(mapRenderFrame)return;
  mapRenderFrame=requestAnimationFrame(()=>{mapRenderFrame=0;if(curView==="map")renderMap();});
}
function googleViewport(v,width,height){
  const scale=MAP_TILE_SIZE*2**v.z;
  const cx=(wrapMapLongitude(v.lon)+180)/360*scale,cy=mercY(v.lat)*scale;
  return {width,height,z:v.z,scale,cx,cy,key:[v.lon,v.lat,v.z,width,height].join("/")};
}
function googleScreenPoint(lon,lat,frame){
  let dx=(wrapMapLongitude(lon)+180)/360*frame.scale-frame.cx;
  if(dx>frame.scale/2)dx-=frame.scale;
  if(dx<-frame.scale/2)dx+=frame.scale;
  return [frame.width/2+dx,frame.height/2+mercY(lat)*frame.scale-frame.cy];
}
function googleViewportBounds(frame){
  const limitLon=x=>Math.max(-179.99999999,Math.min(179.99999999,wrapMapLongitude(x)));
  return {
    north:Math.min(85.05112878,mapLatitudeFromPixel(frame.cy-frame.height/2,frame.scale)),
    south:Math.max(-85.05112878,mapLatitudeFromPixel(frame.cy+frame.height/2,frame.scale)),
    west:frame.width>=frame.scale?-179.99999999:limitLon((frame.cx-frame.width/2)/frame.scale*360-180),
    east:frame.width>=frame.scale?179.99999999:limitLon((frame.cx+frame.width/2)/frame.scale*360-180)
  };
}
function googleTileHasCoverage(x,y,z,rects){
  const n=2**z,west=x/n*360-180,east=(x+1)/n*360-180;
  const north=mapLatitudeFromPixel(y,n),south=mapLatitudeFromPixel(y+1,n);
  return rects.some(r=>r.maxZoom>=z&&r.north>south&&r.south<north&&
    (r.west<=r.east?east>r.west&&west<r.east:east>r.west||west<r.east));
}
async function requestGoogleJson(url,options={},controller=new AbortController()){
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(url,{...options,signal:controller.signal,credentials:"omit",referrerPolicy:"strict-origin-when-cross-origin"});
    if(!response.ok){const error=new Error("Google Map Tiles request failed");error.status=response.status;throw error;}
    return await response.json();
  }finally{clearTimeout(timeout);}
}
class GoogleSatelliteLayer{
  constructor(config){
    this.config=config;this.active=false;this.session=null;this.pendingSession=null;
    this.images=new Map();this.revision=0;this.timer=null;this.viewportController=null;
    this.frame=null;this.requestedKey="";this.fetching=false;this.blocked=false;this.errorStatus=null;
  }
  showStatus(message,retry=false){
    $("#mapTileMessage").textContent=message;$("#retryGoogle").hidden=!retry;$("#mapTileStatus").hidden=false;
  }
  clearImages(){
    for(const record of this.images.values())record.img.remove();
    this.images.clear();
  }
  leave(){
    if(!this.active)return;
    this.active=false;this.revision++;clearTimeout(this.timer);this.viewportController?.abort();
    this.clearImages();this.frame=null;this.requestedKey="";
    $("#googleMapTiles").hidden=true;$("#mapTileStatus").hidden=true;$("#mapAttribution").hidden=true;
    $("#googleCopyright").textContent="";
  }
  async getSession(){
    if(this.session&&this.session.expiry>Date.now()+60000)return this.session;
    if(this.pendingSession)return this.pendingSession;
    const query=new URLSearchParams({key:this.config.apiKey});
    this.pendingSession=requestGoogleJson("https://tile.googleapis.com/v1/createSession?"+query,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({mapType:"satellite",language:this.config.language,region:this.config.region})
    }).then(data=>{
      const expiry=Number(data.expiry)*1000;
      if(typeof data.session!=="string"||!data.session||!Number.isFinite(expiry)||expiry<=Date.now())throw new Error("Invalid Google Maps session");
      this.session={token:data.session,expiry};return this.session;
    }).finally(()=>{this.pendingSession=null;});
    return this.pendingSession;
  }
  position(record,frame){
    record.img.style.left=Math.round(frame.width/2+record.x*MAP_TILE_SIZE-frame.cx)+"px";
    record.img.style.top=Math.round(frame.height/2+record.y*MAP_TILE_SIZE-frame.cy)+"px";
  }
  render(frame){
    if(!this.active){this.active=true;$("#googleMapTiles").replaceChildren();this.images.clear();}
    $("#googleMapTiles").hidden=false;
    if(!this.config.apiKey){
      this.showStatus("Google 衛星圖尚未啟用，請先使用其他底圖。");
      $("#googleMapTiles").dataset.state="unconfigured";return;
    }
    if(frame.key===this.requestedKey)return;
    const previous=this.frame;this.frame=frame;this.requestedKey=frame.key;
    const revision=++this.revision;
    clearTimeout(this.timer);this.viewportController?.abort();
    this.fetching=true;this.blocked=false;this.errorStatus=null;$("#googleMapTiles").dataset.state="loading";
    if(previous&&previous.z!==frame.z)this.clearImages();
    for(const record of this.images.values())this.position(record,frame);
    if(!this.images.size)this.showStatus("正在載入 Google 衛星圖…");
    else $("#mapTileStatus").hidden=true;
    this.timer=setTimeout(()=>this.loadFrame(frame,revision),180);
  }
  async loadFrame(frame,revision){
    try{
      const session=await this.getSession();
      if(!this.active||revision!==this.revision)return;
      const query=new URLSearchParams({key:this.config.apiKey,session:session.token,zoom:String(frame.z)});
      for(const [key,value]of Object.entries(googleViewportBounds(frame)))query.set(key,String(value));
      this.viewportController=new AbortController();
      const metadata=await requestGoogleJson("https://tile.googleapis.com/tile/v1/viewport?"+query,{},this.viewportController);
      if(!this.active||revision!==this.revision)return;
      if(typeof metadata.copyright!=="string"||!metadata.copyright||!Array.isArray(metadata.maxZoomRects))throw new Error("Missing Google Maps attribution");
      $("#googleCopyright").textContent=metadata.copyright;$("#mapAttribution").hidden=false;
      this.fetching=false;this.blocked=false;
      this.drawTiles(frame,session,metadata.maxZoomRects);
    }catch(error){
      if(!this.active||revision!==this.revision)return;
      this.fetching=false;this.blocked=true;this.errorStatus=error.status||0;$("#googleMapTiles").dataset.state="error";
      if(error.status===401||error.status===403)this.session=null;
      const message=error.status===401||error.status===403
        ?"Google 衛星圖授權未通過，請先使用其他底圖。"
        :error.status===429?"Google 衛星圖暫時無法提供服務，可稍後重試或切換底圖。"
        :"Google 衛星圖載入失敗，請檢查連線、重試或切換底圖。";
      this.showStatus(message,true);
    }
  }
  drawTiles(frame,session,rects){
    const n=2**frame.z,keep=new Set();
    const x0=Math.floor((frame.cx-frame.width/2)/MAP_TILE_SIZE),x1=Math.floor((frame.cx+frame.width/2-1)/MAP_TILE_SIZE);
    const y0=Math.max(0,Math.floor((frame.cy-frame.height/2)/MAP_TILE_SIZE)),y1=Math.min(n-1,Math.floor((frame.cy+frame.height/2-1)/MAP_TILE_SIZE));
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
      const requestX=((x%n)+n)%n;
      if(!googleTileHasCoverage(requestX,y,frame.z,rects))continue;
      const id=[session.token,frame.z,x,y].join("/");keep.add(id);
      let record=this.images.get(id);
      if(!record){
        const img=document.createElement("img");
        record={img,x,y,loaded:false,failed:false};this.images.set(id,record);
        img.alt="";img.draggable=false;img.width=MAP_TILE_SIZE;img.height=MAP_TILE_SIZE;
        img.style.cssText="position:absolute;width:256px;height:256px;user-select:none";
        img.onload=()=>{if(this.images.get(id)!==record)return;record.loaded=true;this.updateStatus();};
        img.onerror=()=>{
          if(this.images.get(id)!==record)return;
          // 自动重试一次（应对网络抖动）
          if(!record.retried){
            record.retried=true;
            setTimeout(()=>{ if(this.images.get(id)===record) img.src=img.src; }, 1500);
            return;
          }
          record.failed=true;img.style.visibility="hidden";this.updateStatus();
        };
        const query=new URLSearchParams({session:session.token,key:this.config.apiKey});
        img.src="https://tile.googleapis.com/v1/2dtiles/"+frame.z+"/"+requestX+"/"+y+"?"+query;
        $("#googleMapTiles").appendChild(img);
      }
      this.position(record,frame);
    }
    // Keep only the visible tiles. Browser HTTP caching follows Google's response headers.
    for(const[id,record]of this.images)if(!keep.has(id)){record.img.remove();this.images.delete(id);}
    if(!this.images.size){
      this.blocked=true;$("#googleMapTiles").dataset.state="unavailable";
      this.showStatus("這個範圍沒有此縮放層級的衛星影像，請縮小地圖或切換底圖。");return;
    }
    this.updateStatus();
  }
  updateStatus(){
    if(!this.active||this.fetching||this.blocked)return;
    const records=[...this.images.values()];
    if(records.some(r=>r.failed)){
      $("#googleMapTiles").dataset.state="error";
      this.showStatus("部分 Google 衛星影像載入失敗，可重試或切換底圖。",true);
    }else{
      $("#googleMapTiles").dataset.state=records.every(r=>r.loaded)?"ready":"loading";
      if(records.some(r=>r.loaded))$("#mapTileStatus").hidden=true;
    }
  }
  retry(){this.session=null;this.requestedKey="";this.clearImages();renderMap();}
}
const googleSatellite=new GoogleSatelliteLayer(MAP_CONFIG.googleMaps);
function configureGoogleMapOption(){
  const option=$("#baseSel").querySelector('option[value="google"]');
  option.disabled=!googleSatellite.config.apiKey;
  option.textContent=option.disabled?"底圖：Google 衛星（未啟用）":"底圖：Google 衛星";
}
function renderGoogleSatellite(){
  const wrap=$("#mapWrap"),frame=googleViewport(view,wrap.clientWidth,wrap.clientHeight);
  $("#mapSvg").style.display="none";$("#tiles").style.display="none";
  const overlay=$("#ovSvg");overlay.replaceChildren();
  drawFeatures(overlay,(lon,lat)=>googleScreenPoint(lon,lat,frame));
  googleSatellite.render(frame);
}
configureGoogleMapOption();
$("#retryGoogle").onclick=()=>googleSatellite.retry();
$("#useAmapSatellite").onclick=()=>{$("#baseSel").value="asat";$("#baseSel").dispatchEvent(new Event("change"));};
new ResizeObserver(scheduleMapRender).observe($("#mapWrap"));
