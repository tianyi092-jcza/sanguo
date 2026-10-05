function eraYearLabel(year){
  const era=ERA_CALENDAR.eras.find(e=>year>=e.start&&year<=e.end);
  if(!era)return String(year);
  const n=year-era.start+1,digits='零一二三四五六七八九';
  const ordinal=n===1?'元':n<10?digits[n]:n<20?'十'+(n%10?digits[n%10]:''):digits[Math.floor(n/10)]+'十'+(n%10?digits[n%10]:'');
  return `${year}·${era.name}${ordinal}年`;
}
function eraYearDescription(year){
  const era=ERA_CALENDAR.eras.find(e=>year>=e.start&&year<=e.end);
  return `${eraYearLabel(year)}（${era?.dynasty||''}） · ${ERA_CALENDAR.policy}${ERA_CALENDAR.changes[year]?' '+ERA_CALENDAR.changes[year]:''}`;
}
