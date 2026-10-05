"""Editorial research batch. All anchors resolve against primary source caches."""
import json
from pathlib import Path

path=Path('data/curation-research.json')
people=json.loads(path.read_text(encoding='utf-8'))
def stage(start,end,faction,query,**kw):
    return dict(start=start,end=end,faction=faction,query=query,precision='inferred',**kw)
def fact(label,value,source,query,precision='exact'):
    return dict(label=label,value=value,source=source,query=query,precision=precision)
def put(name,source,first,life,stages,overview,**kw):
    global people
    people=[p for p in people if p['name']!=name]
    people.append(dict(name=name,source=source,first=first,life=life,stages=stages,overview=overview,**kw))

put('田豐','a04-006',{'year':190,'before':True},'生年不詳—200',[
    stage(190,200,'yuanshao','乃應紹命，以為別駕',openStart=True,endInclusive=True,affiliationCertainty='exact',note='袁紹起義時延請田豐，确切到任年未載；官渡兵敗後被殺。')
], '田豐早年曾任漢侍御史，後棄官歸家。袁紹起義後延請為別駕，參與河北謀議，反對倉促與曹操決戰而被囚，官渡敗後遭袁紹殺害。',death=200,
unplaced=[{'faction':'han','query':'遷侍御史','precision':'unknown','note':'早期漢廷任官有據，具體年月不詳；不因此抹去其後明確的袁紹統屬。'}],
facts=[fact('統屬與職位','袁紹別駕。','a04-006','乃應紹命，以為別駕'),fact('卒年','200年，袁紹官渡敗歸後殺之。','a04-006','紹還，謂左右')])

put('沮授','a04-006',{'year':191,'before':True},'生年不詳—200',[
    stage(189,191,'hanfu','又為韓馥別駕',openStart=True,note='韓馥別駕、騎都尉的任職先後明確，始年不詳。'),
    stage(191,200,'yuanshao','袁紹得兾州，又辟焉',endInclusive=True,affiliationCertainty='exact',note='191年袁紹得冀州後辟用；官渡被俘並不等於轉投曹操。')
], '沮授曾為韓馥別駕，袁紹據冀州後任監軍、奮威將軍。多次提出迎奉天子及持久抗曹之策。官渡敗後被曹軍拘執，仍表示不降，後謀歸袁氏而被殺。',death=200,
facts=[fact('先後統屬','韓馥 → 袁紹。','a04-006','又為韓馥別駕'),fact('被俘不是轉投','裴注引《獻帝傳》記「授不降也，為軍所執耳」。','a04-006','授不降也'),fact('卒年','200年官渡戰後。','a04-006','後謀還袁氏，見殺')])

put('審配','a04-006',{'year':191,'before':True},'生年不詳—204',[
    stage(191,202,'yuanshao','袁紹領兾州，委以腹心之任',affiliationCertainty='exact'),
    stage(202,204,'yuanshang','乃奉尚代紹位',endInclusive=True,affiliationCertainty='exact',note='擁立袁尚，204年守鄴敗後被殺。')
], '袁紹領冀州後重用審配，任治中別駕、總幕府。袁紹死後奉袁尚繼位，留守鄴城。曹操破鄴時被擒，拒降而死。',death=204,
facts=[fact('統屬','先屬袁紹，後擁袁尚，不把袁紹死後仍標作本人在世統領。','a04-006','乃奉尚代紹位'),fact('卒年','204年（建安九年）鄴城陷後被斬。','a04-006','生禽配')])

put('郭圖','a04-006',{'year':195,'before':True},'生年不詳—205',[
    stage(195,202,'yuanshao','紹遣潁川郭圖使焉',openStart=True,affiliationCertainty='exact'),
    stage(202,205,'yuantan','評、圖與譚比',endInclusive=True,affiliationCertainty='exact')
], '郭圖為袁紹謀臣，曾出使獻帝所在的河東。袁紹死後支持袁譚，與審配、逢紀所支持的袁尚對立。205年曹操攻破南皮，郭圖與袁譚同被斬。',death=205,
facts=[fact('轉屬','袁紹 → 袁譚。','a04-006','評、圖與譚比'),fact('卒年與月','205年，建安十年正月，南皮陷落。','a04-006','十年正月，攻拔之，斬譚及圖等')])

put('逢紀','a04-006',{'year':189,'before':True},'生年不詳—約202／203',[
    stage(189,202,'yuanshao','與許攸及紀俱詣兾州',openStart=True,affiliationCertainty='exact'),
    stage(202,203,'yuanshang','尚少與譚兵，而使逢紀從譚',openEnd=True,note='奉袁尚命往袁譚軍，後因索兵不得被袁譚殺害。起訖結合黎陽戰事作範圍推定。')
], '逢紀與袁紹出奔、共事於冀州。袁紹死後與審配支持袁尚。後奉袁尚命隨袁譚軍，因兄弟間的供兵爭執被袁譚所殺；傳文未直接繫日，保留約202—203年的範圍。',
facts=[fact('所屬','先為袁紹謀臣，後支持袁尚。','a04-006','配、紀與尚比'),fact('死亡經過','袁譚求益兵不得，怒殺逢紀；不把受袁尚派遣入譚軍等同自願改投。','a04-006','譚怒，殺紀')])

put('袁紹','a04-006',{'year':188,'before':True},'生年不詳—202',[
    stage(188,189,'han','稍遷中軍校尉，至司隷',openStart=True),
    stage(189,202,'yuanshao','勃海太守',endInclusive=True,affiliationCertainty='exact',note='出奔後任勃海太守，190年為關東盟主，191年據冀州；按其自身政治軍事集團著色。')
], '袁紹早年在漢廷任職，董卓掌權後出奔。以勃海兵參與關東聯軍，後據冀州，兼并青、幽、并等地。200年官渡戰敗，202年病死。',death=202,
facts=[fact('地方勢力','袁紹本人領導的河北集團，並非固定的「群雄」總標籤。','a04-006','以審配、逢紀統軍事'),fact('卒年','202年（建安七年）。','a04-006','七年，憂死')])

put('袁術','a04-006',{'year':189,'before':True},'生年不詳—199',[
    stage(184,189,'han','後為折衝校尉、虎賁中郎將',openStart=True),
    stage(189,197,'yuanshu','出奔南陽',affiliationCertainty='exact'),
    stage(197,199,'yuanshu','僭號',label='袁術 · 稱帝',endInclusive=True,affiliationCertainty='exact')
], '袁術由漢廷官員出奔南陽，後在淮南建立自己的軍政力量。197年稱帝後眾叛親離，199年失勢而死。南陽、淮南和稱帝階段保留在同一集團的不同時段中。',death=199,
facts=[fact('地方統屬','袁術自領南陽及後來的淮南部眾，孫堅等人的合作、隸屬需逐人記錄。','a04-006','術得據其郡'),fact('稱帝','197年僭號；稱帝不提前套用到早期漢廷任職。','a04-006','僭號')])

put('劉表','a04-006',{'year':190,'before':True},'生年待核—208',[
    stage(190,208,'liubiao','表亦合兵軍襄陽',endInclusive=True,affiliationCertainty='exact',note='荊州牧／刺史為漢官名義，實際形成劉表自己的荊州集團。')
], '劉表出任荊州後，與蒯良、蒯越、蔡瑁等整合地方部眾，以襄陽、江陵為重心。208年曹操南下時病卒，劉琮繼其位。漢官名義與地方軍政集團分開呈現。',death=208,
unplaced=[{'faction':'han','query':'以大將軍掾為北軍中候','precision':'unknown','note':'出鎮前曾在漢廷任官，具体起訖尚未繫年。'}])

put('劉焉','a04-031',{'year':188,'before':True},'生年不詳—194',[
    stage(188,194,'liuyan','領益州牧',endInclusive=True,affiliationCertainty='exact',note='以漢益州牧名義入蜀並掌握地方軍政；此前朝廷任職另列。')
], '劉焉歷仕州郡與漢廷，建議以重臣為州牧後出鎮益州，逐步掌握蜀地。194年卒於成都，州中大吏推其子劉璋繼任。',death=194,
unplaced=[{'faction':'han','query':'歷雒陽令','precision':'unknown','note':'早期任雒陽令、冀州刺史、南陽太守及宗正、太常，年月另待細繫。'}],
facts=[fact('卒年','194年（興平元年）。','a04-031','興平元年，癕疽發背而卒')])

put('劉璋','a04-031',{'year':194,'precision':'exact'},'生卒詳年待考',[
    stage(194,214,'liuzhang','共上璋為益州刺史',affiliationCertainty='exact'),
    stage(214,219,'liubei','荊州',label='劉備 · 受降後遷居',note='益州失守後遷居，與原先獨立領益州的地位不同，不表示仍統領本軍。'),
    stage(219,219,'sunquan','孫權',label='孫權 · 授益州牧',endInclusive=True,openEnd=True,note='孫權取荊州後授益州牧，具體卒年不強定。')
], '劉璋於194年繼領益州，211年迎劉備入蜀，214年成都受圍後投降，被遷至荊州。孫權取得荊州後又授以益州牧。晚期僑居、授官和早期自領益州分開記錄。')

put('陶謙','a04-008',{'year':185,'before':True},'約132—194 · 生年待細核',[
    stage(185,188,'han','參車騎將軍張溫軍事',openStart=True),
    stage(188,194,'taoqian','以謙為徐州刺史',endInclusive=True,openStart=True,affiliationCertainty='exact',note='以討徐州黃巾、任刺史至卒年限定地方統治階段，入任確年仍以不同紀傳相參。')
], '陶謙早仕州郡，曾參與張溫西征。後以徐州刺史平黃巾、統領徐州，仍向漢廷進貢並受州牧等官號。194年卒，劉備繼領徐州。',death=194)

put('張繡','a04-008',{'year':192,'before':True},'生年不詳—207',[
    stage(192,196,'zhangji','繡隨濟',openStart=True,affiliationCertainty='exact'),
    stage(196,199,'zhangxiu','繡領其衆，屯宛',affiliationCertainty='exact',note='張濟死後領其部眾；197年曾短暫降曹旋叛，不能視為一開始就長期歸曹。'),
    stage(199,207,'caocao','復以衆降',endInclusive=True,affiliationCertainty='exact')
], '張繡先隨張濟，張濟死後領其部眾屯宛，與劉表聯合。197年短暫降曹而復叛，199年再次率眾降曹，後參與官渡、南皮等戰事，207年從征烏丸途中去世。',death=207,
facts=[fact('早期集團','張濟部眾 → 張繡自領部眾。','a04-008','繡領其衆，屯宛'),fact('卒年','207年征烏丸途中；死因本傳與裴注《魏略》有異說。','a04-008','從征烏丸於柳城')])

put('張魯','a04-008',{'year':191,'before':True},'生卒詳年待考',[
    stage(191,194,'liuyan','以魯為督義司馬',openStart=True,affiliationCertainty='exact'),
    stage(194,215,'zhanglu','魯遂據漢中',affiliationCertainty='exact'),
    stage(215,215,'caocao','鎮南將軍',endInclusive=True,openEnd=True,note='215年歸曹並受官爵，卒年本傳未繫，不任意延長。')
], '張魯受劉焉命進攻漢中，後據巴、漢，以祭酒制度治民，自號師君，形成漢中集團。215年曹操入漢中後率眾歸附，受鎮南將軍等官爵。其政教集團不與黃巾軍混同。')

put('羊祜','a05-034',{'year':249,'before':True},'約221—278 · 生年據享年推定',[
    stage(255,265,'wei','公車徵拜中書侍郎',openStart=True,affiliationCertainty='exact',note='曹爽徵辟未就；司馬昭掌政、高貴鄉公在位時始有中書侍郎等任官記載，不能把未就徵辟當作任職。'),
    stage(265,269,'jin','武帝受禪',affiliationCertainty='exact'),
    stage(269,278,'jin','以祜為都督荊州',endInclusive=True,label='西晉 · 荊州都督',affiliationCertainty='exact',references=['a05-003'])
], '羊祜曾拒曹爽等徵辟，後在曹魏任中書侍郎、黃門郎等。晉代魏後掌內職，269年出鎮荊州，撫納邊民、經營伐吳，278年病篤薦杜預自代。',birth=221,death=278,
facts=[fact('生年','約221年，由278年卒、享年五十八推定。','a05-034','尋卒，時年五十八','inferred'),fact('卒年與月','咸寧四年十一月（278年），武帝紀與本傳相參。','a05-003','征南大將軍羊祜卒'),fact('外貌與服飾記載','本傳載身長七尺三寸、美鬚眉；在軍輕裘緩帶、身不被甲，不宜一律畫成重甲武將。','a05-034','在軍常輕裘緩帶')])

put('杜預','a05-034',{'year':255,'precision':'inferred'},'生年推定 · 卒於太康五年閏月',[
    stage(255,265,'wei','起家拜尚書郎',affiliationCertainty='exact',note='司馬昭繼掌政後起家，後為鍾會鎮西長史。'),
    stage(265,278,'jin','河南尹',affiliationCertainty='exact'),
    stage(278,280,'jin','鎮南大將軍',label='西晉 · 鎮南大將軍',endInclusive=True,affiliationCertainty='exact',note='278年代羊祜鎮荊州，280年參與滅吳；280是視窗終點，不是卒年。')
], '杜預在曹魏起家任尚書郎，隨鍾會伐蜀而倖免於亂。入晉後歷河南尹、度支尚書等職，278年鎮荊州，280年率軍克江陵、參與平吳。兼通經學、法律與軍政，不宜僅作單一武將處理。',
facts=[fact('卒時原紀年','《武帝紀》太康五年十二月後的閏月記杜預卒。保留史書紀月，不將農曆歲末直接等同公曆同年。','a05-003','當陽侯杜預卒'),fact('享年','本傳記六十三；公曆生卒換算須與紀年相參。','a05-034','行次鄧縣而卒，時年六十三'),fact('魏晉轉屬','魏尚書郎、鎮西長史，晉河南尹等官。','a05-034','起家拜尚書郎')])

put('王濬','a05-042',{'year':272,'before':True},'約206—太康六年十二月',[
    stage(272,280,'jin','益州刺史',label='西晉 · 益州／龍驤軍',openStart=True,endInclusive=True,affiliationCertainty='exact',note='早期任河東從事、巴郡及廣漢太守等起訖未詳；至少272年益州活動至280年平吳有據。')
], '王濬早仕州郡，歷巴郡、廣漢太守，後任益州刺史，在蜀造舟備戰。280年率水軍沿江東下，至建業受孫皓降。平吳後仍歷將軍等官，不能在280年截點誤標死亡。',birth=206,
facts=[fact('卒時原紀年','本傳記太康六年卒、時年八十；武帝紀細記十二月庚子。該歲末的公曆換算另註，不把285／286簡化成原文自相矛盾。','a05-042','太康六年卒，時年八十'),fact('月日互證','《晉書·武帝紀》太康六年十二月庚子條。','a05-003','襄陽侯王濬卒'),fact('外貌記載','本傳載「美姿貌」。','a05-042','美姿貌')],
unplaced=[{'faction':'other','label':'早期州郡仕宦','query':'河東從事','precision':'unknown','note':'河東從事、巴郡與廣漢太守等先後有據，尚未將其逐職強定起訖。'}])

put('衛瓘','a05-036',{'year':239,'precision':'inferred'},'約220—291 · 生年據享年推定',[
    stage(239,265,'wei','弱冠為魏尚書郎',openStart=True,affiliationCertainty='exact'),
    stage(265,280,'jin','泰始初，轉征東將軍',endInclusive=True,affiliationCertainty='exact',note='繼續在晉任職，291年被害，不能把視窗280年當作卒年。')
], '衛瓘弱冠任魏尚書郎，後歷侍中、廷尉卿，參與魏滅蜀及處理鄧艾、鍾會事。入晉後歷征東、征北將軍及內朝要職，291年遇害。',birth=220,death=291,
facts=[fact('早期任官','弱冠為魏尚書郎，始年按享年與弱冠約算，統屬魏則有明文。','a05-036','弱冠為魏尚書郎','inferred'),fact('享年','本傳記與子孫同被害，年七十二。','a05-036','時年七十二')])

put('賈充','a05-040',{'year':255,'before':True},'約217—282 · 生年據享年推定',[
    stage(255,265,'wei','從景帝討毌丘儉',openStart=True,affiliationCertainty='exact'),
    stage(265,280,'jin','及受禪，充以建明大命',endInclusive=True,affiliationCertainty='exact')
], '賈充早在魏任尚書郎、黃門侍郎等，參與司馬師、司馬昭軍政，後為晉元勳，典定法律並居中樞。279年伐吳時為大都督，卒於282年。',birth=217,death=282,
facts=[fact('卒年與月','282年，太康三年四月；享年六十六。','a05-040','太康三年四月薨'),fact('魏晉轉屬','265年由晉國衛將軍轉入晉朝車騎將軍、尚書僕射等職。','a05-040','及受禪，充以建明大命')])

put('司馬孚','a05-037',{'year':217,'before':True},'約180—272 · 生年據享年推定',[
    stage(211,220,'caocao','以孚為文學掾',openStart=True,note='先為曹植文學掾，後任太子中庶子；各任職確切起年未詳。'),
    stage(220,265,'wei','奉太子以即位',affiliationCertainty='exact'),
    stage(265,272,'jin','安平王',label='西晉官爵 · 自稱魏臣',endInclusive=True,affiliationCertainty='exact',note='接受晉官爵，但臨終自稱「有魏貞士」，實際官爵與政治自我認同分開註明。')
], '司馬孚先在曹氏府中任職，歷事曹魏，晉代魏後封安平王、位太宰。雖受晉尊寵，仍以魏臣自居，遺令自稱「有魏貞士」。這類情形不能只用一個顏色抹平其政治立場。',birth=180,death=272,
facts=[fact('卒年','272年，泰始八年，享年九十三。','a05-037','泰始八年薨'),fact('身份的兩層含義','實際為晉王公，臨終仍自稱魏臣；色帶記官爵，原文說明政治認同。','a05-037','有魏貞士河內溫縣司馬孚')])

path.write_text(json.dumps(people,ensure_ascii=False,indent=2),encoding='utf-8')
fpath=Path('data/factions.json');factions=json.loads(fpath.read_text(encoding='utf-8'))
for key,label,color,bg in [('yuantan','袁譚','#806588','#e7dcea'),('yuanshang','袁尚','#765783','#e0d4e8'),('zhangji','張濟','#8f6b50','#ebdccb')]:
    factions[key]={'label':label,'color':color,'background':bg,'kind':'lord'}
fpath.write_text(json.dumps(factions,ensure_ascii=False,indent=2),encoding='utf-8')
print('Research records:',len(people))
