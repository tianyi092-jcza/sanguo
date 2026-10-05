import fs from 'node:fs';
import sharp from 'sharp';
const input=process.argv[2]==='--file'?fs.readFileSync(process.argv[3],'utf8'):process.argv[2];
const jobs=JSON.parse(input);
const plan=JSON.parse(fs.readFileSync('data/portrait-plan.json','utf8'));
for(const job of jobs){
 const item=plan.find(p=>p.id===job.id);if(!item)throw new Error('Unknown portrait '+job.id);
 if(item.status==='generated')throw new Error('Portrait already complete; do not replace '+job.id);
 if(!job.prompt?.trim())throw new Error('Save the full final prompt for '+job.id);
 const file=item.id+'.webp';
 await sharp(job.path).resize(120,120,{fit:'cover',kernel:'nearest'}).webp({lossless:true}).toFile('assets/portraits/'+file);
 item.file=file;item.status='generated';item.prompt=job.prompt;item.generator='built-in imagegen';
}
fs.writeFileSync('data/portrait-plan.json',JSON.stringify(plan,null,2));
console.log(JSON.stringify({imported:jobs.length,complete:plan.filter(x=>x.status==='generated').length,total:plan.length}));
