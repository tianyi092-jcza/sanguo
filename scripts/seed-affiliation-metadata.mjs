import fs from 'node:fs';
const path='data/affiliation-metadata.json';
const metadata=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):{relations:{},hanOffices:{}};
const add=(names,factions,relation)=>{for(const name of names.split(' ')){metadata.relations[name]||={};for(const faction of factions.split(' '))metadata.relations[name][faction]=relation;}};
add('華佗','caocao','doctor');add('盧植','yuanshao','invited');add('鄭玄','yuanshao','coerced');
add('張苞 曹衝','liubei caocao','family');add('曹彪 曹袞 曹宇 曹林 曹峻','caocao','family');
add('甄皇后','yuanxi caocao wei','family');add('郭皇后','caocao wei','family');add('毛皇后','wei','family');
add('步夫人 孫魯班 孫魯育','sunquan wu','family');add('潘皇后','wu','family');
add('孫夫人','sunquan liubei','family');add('吳皇后','liuyan liubei shu','family');add('諸葛喬','sunquan','family');
add('禰衡','liubiao huangzu','guest');add('嚴顏','liubei','guest');add('孟光','liuyan liuzhang','guest');add('來敏','liuzhang','guest');add('龐羲','liuyan','guest');
add('楊阜','machao','coerced');add('臧霸','lvbu','allied');add('韓暹','yuanshu lvbu','allied');
add('公孫越','yuanshu','allied');add('衛茲','caocao','allied');add('龔都','liubei','allied');
add('劉闢','yuanshao liubei','allied');add('何儀 何曼 黃邵','yuanshu sunjian','allied');add('壺壽','yudu','allied');
add('楊千萬','machao','asylum');
fs.writeFileSync(path,JSON.stringify(metadata,null,2)+'\n');
const factions=JSON.parse(fs.readFileSync('data/factions.json','utf8'));
const labels=`zhangyang=張楊;litong=李通部眾;zangba=臧霸部眾;liuzong=劉琮;xianyufu=鮮于輔;weikang=韋康;gaogan=高幹;huangzu=黃祖;zhangmiao=張邈;zhangchao=張超;zanghong=臧洪;zhangniujiao=張牛角;zhangyan=張燕;gongsundu=公孫度;gongsunyuan=公孫淵;liudai=劉岱;liuyu=劉虞;yuanxi=袁熙;menghuo=孟獲;shihui=士徽;pangxi=龐羲;ganning=甘寧部眾;wanglang=王朗;wangkuang=王匡;qiaomao=橋瑁;yuanyi=袁遺;kongzhou=孔伷;zerong=笮融;xugong=許貢;zulang=祖郎;yanbaihu=嚴白虎;tadun=蹋頓（烏桓）;kebineng=軻比能（鮮卑）;budugen=步度根（鮮卑）;yufuluo=于夫羅（南匈奴）;huchuquan=呼廚泉（南匈奴）;qianwan=千萬（氐）;gongsunkang=公孫康;gongsungong=公孫恭;wa=倭女王國;goguryeo=高句麗;guosi=郭汜;fanchou=樊稠;yangding=楊定;hanxian=韓暹;hucai=胡才;lile=李樂;hanxuan=韓玄;jinxuan=金旋;zhaofan=趙範;liudu=劉度;liuxun=劉勳;wangsong=王松;liuchong=劉寵（陳國）;zhangzi=張咨;wangrui=王叡;zhaowei=趙韙;yudu=于毒部眾;bairao=白繞部眾;guanhai=管亥部眾;liupi=劉辟部眾;gongdu=龔都部眾;heyi=何儀部眾;heman=何曼部眾;huangshao=黃邵部眾;suigu=眭固部眾;yangfengheishan=楊鳳部眾;huanglong=黃龍部眾;zuoxiao=左校部眾;guodaxian=郭大賢部眾;zuozhizhangba=左髭丈八部眾;yudigen=于氐根部眾;qingniujiao=青牛角部眾;zhangbaiqi=張白騎部眾;liushi=劉石部眾;pinghan=平漢部眾;daji=大計部眾;siliarmy=司隸部眾;yuancheng=緣城部眾;leigong=雷公部眾;fuyun=浮雲部眾;baique=白雀部眾;wulu=五鹿部眾;kuyou=苦唒部眾;luoshi=羅市部眾`;
for(const pair of labels.split(';')){const [id,label]=pair.split('=');if(factions[id])continue;const kind=['wa','goguryeo'].includes(id)?'regime':label.endsWith('部眾')?'army':'lord';factions[id]={label,color:kind==='army'?'#877048':'#637c72',background:kind==='army'?'#ebe1c9':'#dfe8dc',kind};}
fs.writeFileSync('data/factions.json',JSON.stringify(factions,null,2)+'\n');
