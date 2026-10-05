import fs from 'node:fs';

// Browser-side Map Tiles API key; keep the user's application restrictions in place.
export function loadMapConfig(){
  const path='maps.config.local.json';
  const local=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):{};
  const apiKey=process.env.GOOGLE_MAPS_API_KEY??local.googleMapsApiKey??'';
  const language=process.env.GOOGLE_MAPS_LANGUAGE??local.googleMapsLanguage??'zh-TW';
  const region=process.env.GOOGLE_MAPS_REGION??local.googleMapsRegion??'CN';
  if(typeof apiKey!=='string'||typeof language!=='string'||typeof region!=='string')throw new Error('Google Maps configuration values must be strings.');
  if(!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(language)||!/^[A-Z]{2}$/.test(region))throw new Error('Google Maps language or region is invalid. See maps.config.example.json.');
  return {googleMaps:{apiKey:apiKey.trim(),language,region}};
}
