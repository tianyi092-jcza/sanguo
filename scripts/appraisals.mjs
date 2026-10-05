import fs from 'node:fs';

function mergeRanges(ranges){
  const merged=[];
  for(const range of [...ranges].sort((a,b)=>a.start-b.start||a.end-b.end)){
    const previous=merged.at(-1);
    if(previous&&range.start<=previous.end)previous.end=Math.max(previous.end,range.end);
    else merged.push({...range});
  }
  return merged;
}

export function loadAppraisals(docs,normalize,traditional){
  const rules=JSON.parse(fs.readFileSync('data/appraisal-rules.json','utf8'));
  if(rules.chapters.length!==65)throw new Error('All 65 Sanguozhi appraisals must be reviewed.');
  const sourceMap=new Map(docs.map(d=>[d.id,d])),byName=new Map(),chapters={},targets=new Set();
  const seen=new Set();let separatedAnnotations=0,annotatedChapters=0;
  for(const chapter of rules.chapters){
    if(seen.has(chapter.source)||!chapter.reviewed)throw new Error('Duplicate or unreviewed appraisal: '+chapter.source);
    seen.add(chapter.source);
    const source=JSON.parse(fs.readFileSync('data/appraisal-sources/'+chapter.source+'.json','utf8'));
    const cached=sourceMap.get(chapter.source)?.paragraphs.find(p=>p.startsWith('評曰'));
    if(!cached||normalize(cached)!==normalize(source.rawParagraph))throw new Error('Appraisal source differs from the primary cache: '+chapter.source);
    let restored=normalize(source.rawParagraph);
    for(const note of source.removedAnnotations){
      const n=normalize(note),at=restored.indexOf(n);
      if(at<0)throw new Error('Missing annotation evidence: '+chapter.source);
      restored=restored.slice(0,at)+restored.slice(at+n.length);
    }
    if(restored!==normalize(source.body)||!source.body.startsWith('評曰：')||source.body.includes('臣松之'))throw new Error('Invalid Chen Shou text/annotation separation: '+chapter.source);
    separatedAnnotations+=source.removedAnnotations.length;
    if(source.removedAnnotations.length)annotatedChapters++;
    const body=source.body.slice(3),covered=new Uint8Array(body.length),members=new Map();
    for(const part of chapter.parts){
      const ranges=part.fragments.map(fragment=>{
        const start=fragment.start?body.indexOf(fragment.start):0;
        const end=fragment.endBefore?body.indexOf(fragment.endBefore,start):body.length;
        if(start<0||end<=start)throw new Error('Invalid appraisal boundary: '+chapter.source+' '+JSON.stringify(fragment));
        covered.fill(1,start,end);return {start,end};
      });
      for(const name of part.people){
        const key=normalize(name);targets.add(traditional(name));
        let member=members.get(key);
        if(!member){member={ranges:[],shared:new Set(),notes:new Set(),kind:'individual',identitySources:null};members.set(key,member);}
        member.ranges.push(...ranges);
        for(const other of part.people)if(normalize(other)!==key)member.shared.add(traditional(other));
        if(part.note)member.notes.add(part.note);
        if(part.kind==='chapter')member.kind='chapter';
        if(part.identitySources?.[name])member.identitySources=part.identitySources[name];
      }
    }
    if(covered.some(value=>!value))throw new Error('Unreviewed text in appraisal: '+chapter.source);
    chapters[chapter.source]={source:chapter.source,quote:source.body,author:'陳壽',reviewed:true,notesExcluded:source.removedAnnotations.length};
    for(const [name,member]of members){
      const ranges=mergeRanges(member.ranges),fragments=ranges.map(r=>body.slice(r.start,r.end));
      const full=ranges.length===1&&ranges[0].start===0&&ranges[0].end===body.length;
      const entry={source:chapter.source,author:'陳壽',quote:'評曰：'+fragments.join('……'),fragments,
        kind:member.kind==='chapter'?'chapter':member.shared.size?'shared':'individual',sharedWith:[...member.shared],note:[...member.notes].join(' '),full,
        ...(member.identitySources?{identitySources:member.identitySources}:{})};
      if(!byName.has(name))byName.set(name,[]);byName.get(name).push(entry);
    }
  }
  for(let n=1;n<=65;n++)if(!seen.has('a04-'+String(n).padStart(3,'0')))throw new Error('Missing appraisal chapter '+n);
  return {byName,chapters,targets,stats:{chaptersReviewed:seen.size,annotatedChapters,separatedAnnotations}};
}

export function appraisalsFor(catalog,person,primarySource,normalize){
  return (catalog.byName.get(normalize(person.n))||[])
    .filter(a=>!a.identitySources||a.identitySources.includes(primarySource))
    .map(({identitySources,...entry})=>entry)
    .sort((a,b)=>(b.source===primarySource)-(a.source===primarySource)||a.source.localeCompare(b.source));
}
