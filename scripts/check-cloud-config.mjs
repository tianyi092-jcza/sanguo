import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));
const deployment=JSON.parse(fs.readFileSync('deployment.json','utf8'));
if(config.name!==deployment.worker||config.account_id!==deployment.account_id)throw Error('Worker/account differs from deployment.json');
if(!config.routes?.some(r=>r.custom_domain&&r.pattern===deployment.domain))throw Error('Existing custom domain missing');
if(!process.env.GOOGLE_MAPS_API_KEY?.trim())throw Error('Set GOOGLE_MAPS_API_KEY as a build secret before enabling repository deployment; preserve the existing satellite map.');
console.log('Existing Worker, account, domain and required map build configuration verified.');
