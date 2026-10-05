// Only paragraph-leading dates in primary annals are indexed. Pei annotations are excluded.
// These are dated mentions, not inferred employment intervals or proof of a lifelong faction.
const epochs={中平:183,初平:189,興平:193,建安:195,延康:219,黃初:219,太和:226,青龍:232,景初:236,正始:239,嘉平:248,正元:253,甘露:255,景元:259,咸熙:263,章武:220,建興:222,延熙:237,景耀:257,炎興:262,黃武:221,黃龍:228,嘉禾:231,赤烏:237,太元:250,神鳳:251,建興吳:251,五鳳:253,太平:255,永安:257,元興:263,甘露吳:264,寶鼎:265,建衡:268,鳳凰:271,天冊:274,天璽:275,天紀:276,泰始:264,咸寧:274,太康:279};
const digits={元:1,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
const cn=s=>s.includes('十')?((digits[s.split('十')[0]]||1)*10+(digits[s.split('十')[1]]||0)):digits[s];
const eraPattern=Object.keys(epochs).filter(k=>!k.endsWith('吳')).join('|');
const full=new RegExp('^('+eraPattern+')([元一二三四五六七八九十]+)年');
const relative=/^([元一二三四五六七八九十]+)年/;
export function indexChronicles(docs,people,normalize){
 const result={};
 for(const doc of docs){
  if(!doc.mainParagraphs)continue;
  let epoch=null,year=null;
  for(const text of doc.mainParagraphs){
   // Normalize variants in the date only; preserve the original text in evidence.
   const head=text.slice(0,18).replaceAll('熈','熙').replaceAll('鳳皇','鳳凰');
   let match=head.match(full);
   if(match){let era=match[1];if(doc.id==='a04-048'&&(era==='建興'||era==='甘露'))era+='吳';epoch=epochs[era];year=epoch+cn(match[2]);}
   else if((match=head.match(relative))&&epoch!=null){year=epoch+cn(match[1]);}
   else continue; // no propagation to undated paragraphs, quotations or retrospective passages
   if(!Number.isInteger(year)||year<184||year>280)continue;
   const normal=normalize(text);
   for(const p of people){
    // Known death dates are only a guard against obvious retrospective mentions, never used to draw membership bars.
    if(p.d&&year>p.d+1)continue;
    const name=normalize(p.n),at=normal.indexOf(name);if(at<0)continue;
    // Avoid ambiguous aliases which are also offices, reign names or common words.
    if(['司隸','平漢','大計','黃龍','浮雲','左校','雷公'].includes(p.n))continue;
    const rawAt=text.indexOf(p.n);if(rawAt<0)continue;
    const lo=Math.max(0,text.lastIndexOf('。',rawAt-1)+1),hi=text.indexOf('。',rawAt);
    const quote=text.slice(lo,hi<0?Math.min(text.length,lo+450):hi+1);
    if(/詔祀故|追祀|追謚|追諡|追封|追贈/.test(quote))continue;
    if(quote.length>650)continue;
    (result[p.id] ||= []).push({year,source:doc.id,quote,dateText:match[0],note:`${doc.title}，${match[0]}條。僅表示此年記事提及本人，不推定任職起訖。`});
   }
  }
 }
 for(const id in result)result[id].sort((a,b)=>a.year-b.year);
 return result;
}
