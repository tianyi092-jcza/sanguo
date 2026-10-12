DROP TABLE IF EXISTS excerpts;
CREATE TABLE excerpts (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  work TEXT NOT NULL,
  source TEXT NOT NULL,
  citation TEXT NOT NULL,
  quote TEXT NOT NULL
);
CREATE INDEX idx_excerpts_person ON excerpts(person_id);
                  中山太守全椒侯馬成
                  大司馬廣平侯吳漢
                  河南尹阜成侯王梁
                  左將軍膠東侯賈復
                  琅邪太守祝阿侯陳俊
                  建威大將軍好畤侯耿弇
                  驃騎大將軍參蘧侯杜茂
                  執金吾雍奴侯寇恂
                  積弩將軍昆陽侯傅俊
                  征南大將軍舞陽侯岑彭
                  左曹合肥侯堅鐔
                  征西大將軍陽夏侯馮異
                  上谷太守淮陽侯王霸
                  建義大將軍鬲侯朱祐
                  信都太守阿陵侯任光
                  征虜將軍潁陽侯祭遵
                  豫章太守中水侯李忠
                  驃騎大將軍櫟陽侯景丹
                  右將軍槐里侯萬脩
                  虎牙大將軍安平侯蓋延
                  太常靈壽侯邳彤
                  衞尉安成侯銚期
                  驍騎將軍昌成侯劉植
                  東郡太守東光侯耿純
                  橫野大將軍山桑侯王常
                  城門校尉朗陵侯臧宮
                  大司空固始侯李通
                  捕虜將軍楊虛侯馬武
                  大司空安豐侯竇融
                  驃騎將軍慎侯劉隆
                  太傅宣德侯卓茂');
                    　　開府作牧第一　　　權制第二
                    　　南征第三　　　　　北出第四
                  　　計筭第五　　　　　訓厲第六
                  　　綜覈上第七　　　　綜覈下第八
                  　　雜言上第九　　　　雜言下第十
                  　　貴和第十一　　　　兵要第十二
                  　　傳運第十三　　　　與孫權書第十四
                  　　與諸葛瑾書第十五　與孟達書第十六
                  　　廢李平第十七　　　法檢上第十八
                  　　法檢下第十九　　　科令上第二十
                  　　科令下第二十一　　軍令上第二十二
                  　　軍令中第二十三　　軍令下第二十四
                  　右二十四篇，凡十萬四千一百一十二字。');
                    　　開府作牧第一　　　權制第二
                    　　南征第三　　　　　北出第四
                  　　計筭第五　　　　　訓厲第六
                  　　綜覈上第七　　　　綜覈下第八
                  　　雜言上第九　　　　雜言下第十
                  　　貴和第十一　　　　兵要第十二
                  　　傳運第十三　　　　與孫權書第十四
                  　　與諸葛瑾書第十五　與孟達書第十六
                  　　廢李平第十七　　　法檢上第十八
                  　　法檢下第十九　　　科令上第二十
                  　　科令下第二十一　　軍令上第二十二
                  　　軍令中第二十三　　軍令下第二十四
                  　右二十四篇，凡十萬四千一百一十二字。');
非。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-001-0', 'p0001', 'houhanshu', 'a03-001', '《後漢書·卷一上》', '臣賢案：呼沱河舊在饒陽南，至魏太祖曹操因饒河故瀆決，令北注新溝水，所以今在饒陽縣北。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-008-full-1', 'p0001', 'houhanshu', 'a03-008-full', '《後漢書·卷八》', '樂資山陽公載記曰：「小黃門蹇碩為上軍校尉，虎賁中郎將袁紹為中軍校尉，屯騎校尉鮑鴻為下軍校尉，議郎曹操為典軍校尉，趙融為助軍左校尉，馮芳為助軍右校尉，諫議大夫夏牟為左校尉，淳于瓊為右校尉：凡八校，皆統於蹇碩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-008-2', 'p0001', 'houhanshu', 'a03-008', '《後漢書·卷八》', '樂資山陽公載記曰：「小黃門蹇碩為上軍校尉，虎賁中郎將袁紹為中軍校尉，屯騎校尉鮑鴻為下軍校尉，議郎曹操為典軍校尉，趙融為助軍左校尉，馮芳為助軍右校尉，諫議大夫夏牟為左校尉，淳于瓊為右校尉：凡八校，皆統於蹇碩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-3', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '東郡太守曹操大破黃巾於壽張，降之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-4', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '辛亥，鎮東將軍曹操自領司隷校尉，錄尚書事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-5', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '曹操殺侍中臺崇、尚書馮碩等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-6', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '冬十一月丙戌，曹操自為司空，行車騎將軍事，百官緫己以聽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-7', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '十二月癸酉，曹操擊呂布於徐州，斬之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-8', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '五年春正月，車騎將軍董承、偏將軍王服、越騎校尉种輯受密詔誅曹操，事洩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-9', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '壬午，曹操殺董承等，夷三族。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-10', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '曹操與袁紹戰於官度，裴松之北征記曰：「中牟臺下臨汴水，是為官度，袁紹、曹操壘尚存焉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-11', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '九年秋八月戊寅，曹操大破袁尚，平兾州，自領兾州牧。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-12', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '十年春正月，曹操破袁譚於青州，斬之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-13', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '三月，曹操破高幹於并州，獲之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-14', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '十二年秋八月，曹操大破烏桓於柳城，斬其蹋頓。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-15', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '秋七月，曹操南征劉表。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-16', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '」壬子，曹操殺太中大夫孔融，夷其族。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-17', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '曹操以舟師伐孫權，權將周瑜敗之於烏林、赤壁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-18', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '十六年秋九月庚戌，曹操與韓遂、馬超戰於渭南，遂等大敗，關西平。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-19', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '夏五月丙申，曹操自立為魏公，加九錫。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-20', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '冬十月，曹操遣將夏侯淵討宋建于枹罕，獲之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-21', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '」十一月丁卯，曹操殺皇后伏氏，滅其族及二皇子。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-22', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '秋七月，曹操破漢中，張魯降。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-23', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '二十一年夏四月甲午，曹操自進號魏王。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-24', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '是歲，曹操殺琅邪王熙，國除。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-25', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '二十三年春正月甲子，少府耿紀、丞相司直韋晃起兵誅曹操，不克，夷三族。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-009-26', 'p0001', 'houhanshu', 'a03-009', '《後漢書·卷九》', '二十五年春正月庚子，魏王曹操薨。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-full-27', 'p0001', 'houhanshu', 'a03-010b-full', '《後漢書·卷十下》', '完以政在曹操，自嫌尊戚，乃上印綬，拜中散大夫，尋遷屯騎校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-full-28', 'p0001', 'houhanshu', 'a03-010b-full', '《後漢書·卷十下》', '議郎趙彥甞為帝陳言時策，曹操惡而殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-full-29', 'p0001', 'houhanshu', 'a03-010b-full', '《後漢書·卷十下》', '后自是懷懼，乃與父完書，言曹操殘逼之狀，令密圖之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-30', 'p0001', 'houhanshu', 'a03-010b', '《《後漢書》卷十下·皇后紀第十下（獻帝伏皇后節錄）》', '完以政在曹操，自嫌尊戚，乃上印綬，拜中散大夫，尋遷屯騎校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-31', 'p0001', 'houhanshu', 'a03-010b', '《《後漢書》卷十下·皇后紀第十下（獻帝伏皇后節錄）》', '議郎趙彥甞爲帝陳言時策，曹操惡而殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-010b-32', 'p0001', 'houhanshu', 'a03-010b', '《《後漢書》卷十下·皇后紀第十下（獻帝伏皇后節錄）》', '后自是懷懼，乃與父完書，言曹操殘逼之狀，令密圖之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-019-33', 'p0001', 'houhanshu', 'a03-019', '《後漢書·卷十九》', '後曹操誅耿氏，唯援孫弘存焉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-019-34', 'p0001', 'houhanshu', 'a03-019', '《後漢書·卷十九》', '曾孫紀，少有美名，辟公府，曹操甚敬異之，稍遷少府。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-026-35', 'p0001', 'houhanshu', 'a03-026', '《後漢書·卷二十六》', '曹操殺后，誅伏氏，國除。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-027-36', 'p0001', 'houhanshu', 'a03-027', '《後漢書·卷二十七》', '建安十三年，以辟司空曹操子丕為掾，操怒，奏溫辟臣子弟，選舉不實，免官。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-035-37', 'p0001', 'houhanshu', 'a03-035', '《後漢書·卷三十五》', '時袁紹與曹操相拒於官度，官度，津名也，在今鄭州中牟縣北。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-042-38', 'p0001', 'houhanshu', 'a03-042', '《後漢書·卷四十二》', '初，邈至長安，盛稱東郡太守曹操忠誠於帝，操以此德於邈。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-048-39', 'p0001', 'houhanshu', 'a03-048', '《後漢書·卷四十八》', '應順，將作大匠；子疊，江夏太守；疊生郴，武陵太守；郴生奉，從事中郎；奉生劭，車騎將軍掾；劭弟珣，司空掾；珣子㻛，曹操辟為丞相掾。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-048-40', 'p0001', 'houhanshu', 'a03-048', '《後漢書·卷四十八》', '後拜太常，使持節拜曹操為丞相。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-051-41', 'p0001', 'houhanshu', 'a03-051', '《後漢書·卷五十一》', '初，曹操微時，人莫知者，甞往候玄，玄見而異焉，謂曰：「今天下將亂，安生民者其在君乎！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-054-42', 'p0001', 'houhanshu', 'a03-054', '《後漢書·卷五十四》', '時天子新遷，大會公卿，兖州刺史曹操上殿，見彪色不恱，恐於此圖之，未得讌設，託疾如厠，因出還營。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-054-43', 'p0001', 'houhanshu', 'a03-054', '《後漢書·卷五十四》', '後子脩為曹操所殺，操見彪問曰：「公何瘦之甚？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-054-44', 'p0001', 'houhanshu', 'a03-054', '《後漢書·卷五十四》', '脩字德祖，好學，有俊才，為丞相曹操主簿，典略曰：「脩，建安中舉孝廉，除郎中，丞相請署倉曹屬主簿。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-057-45', 'p0001', 'houhanshu', 'a03-057', '《後漢書·卷五十七》', '吏人詣闕陳訴，耽與議郎曹操上言：「公卿所舉，率黨其私，所謂放鴟梟而囚鸞鳳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-058-46', 'p0001', 'houhanshu', 'a03-058', '《後漢書·卷五十八》', '時曹操圍張超於雍丘，甚危急。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-062-47', 'p0001', 'houhanshu', 'a03-062', '《後漢書·卷六十二》', '初辟鎮東將軍曹操府，遷黃門侍郎。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-064-48', 'p0001', 'houhanshu', 'a03-064', '《後漢書·卷六十四》', '建安中，曹操北討柳城，過涿郡，魏志曰，建安十二年，操北征烏桓，涉鮮卑，討柳城，登白狼山也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-064-49', 'p0001', 'houhanshu', 'a03-064', '《後漢書·卷六十四》', '是時袁紹、曹操與公孫瓚爭兾州，紹及操聞歧至，皆自將兵數百里奉迎，歧深陳天子恩德，宜罷兵安人之道，又移書公孫瓚，為言利害。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-064-50', 'p0001', 'houhanshu', 'a03-064', '《後漢書·卷六十四》', '曹操時為司空，舉以自代。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-066-51', 'p0001', 'houhanshu', 'a03-066', '《後漢書·卷六十六》', '及曹操平荊州，乃辟之，執戩手曰：「恨相見晚。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-067-52', 'p0001', 'houhanshu', 'a03-067', '《後漢書·卷六十七》', '初，曹操微時，瓚異其才，將沒，謂子宣等曰：「時將亂矣，天下英雄無過曹操。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-067-53', 'p0001', 'houhanshu', 'a03-067', '《後漢書·卷六十七》', '初，顒見曹操，歎曰：「漢家將亡，安天下者必此人也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-068-54', 'p0001', 'houhanshu', 'a03-068', '《後漢書·卷六十八》', '讓以輕侮曹操，操殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-068-55', 'p0001', 'houhanshu', 'a03-068', '《後漢書·卷六十八》', '曹操微時，常卑辭厚禮，求為己目。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-069-56', 'p0001', 'houhanshu', 'a03-069', '《後漢書·卷六十九》', '會表卒，曹操定荊州，輔與宗人徙居於鄴，辟丞相府。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-069-57', 'p0001', 'houhanshu', 'a03-069', '《後漢書·卷六十九》', '是時置西園八校尉，以小黃門蹇碩為上軍校尉，虎賁中郎將袁紹為中軍校尉，屯騎都尉鮑鴻為下軍校尉，議郎曹操為典軍校尉，趙融為助軍校尉，淳于瓊為佐軍校尉，又有左右校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-58', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '初，曹操攻屠鄴城，袁氏婦子多見侵略，而操子丕私納袁熙妻甄氏。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-59', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '曹操旣積嫌忌，而郗慮復搆成其罪，遂令丞相軍謀祭酒路粹典略曰：「粹字文蔚，陳留人，少學於蔡邕。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-60', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '或言於曹操，遂盡殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-61', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '魏略曰：「曹操為司空，威德日盛，融故以舊意書疏倨傲，習常責融令改節，融不從之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-62', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '人存謂曹操身在不得篡位也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-63', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '時曹操在東郡，彧聞操有雄略，而度紹終不能定大業。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-070-64', 'p0001', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '將軍本以兖州首事，故能平定山東，曹操初從東郡守鮑信等迎領兖州牧，遂進兵破黃巾等，故能平定山東也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-071-65', 'p0001', 'houhanshu', 'a03-071', '《後漢書·卷七十一》', '會帝遣騎都尉曹操將兵適至，嵩、操與朱儁合兵更戰，大破之，斬首數萬級。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-072-66', 'p0001', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '干亂政事，董承患之，潛召兖州牧曹操。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-072-67', 'p0001', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '」曹操以洛陽殘荒，遂移帝幸許。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-072-68', 'p0001', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '楊奉、韓暹欲要遮車駕，不及，曹操擊之，獻帝春秋曰：「車駕出洛陽，自轘轅而東，楊奉、韓暹引軍追之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-072-69', 'p0001', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '十六年，超與韓遂舉關中背曹操，操擊破之，遂、超敗走，騰坐夷三族。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-072-70', 'p0001', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '曹操因遣夏侯淵擊建，斬之，涼州悉平。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-71', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '鮮于輔將其衆歸曹操，操以輔為度遼將軍，封都亭侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-72', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '閻柔將部曲從曹操擊烏桓，拜護烏桓校尉，封關內侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-73', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '曹操將定兾州，乃率衆詣鄴降，拜平北將軍，封安國亭侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-74', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '初，曹操父嵩避難琅邪，時謙別將守陰平，縣名，屬東海國，故城在今沂州承縣西南。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-75', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '初平四年，曹操擊謙，破彭城傅陽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-76', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '興平元年，曹操復擊謙，略定琅邪、東海諸縣，謙懼不免，欲走歸丹陽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-073-77', 'p0001', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '」及曹操擊謙，徐方不安，融乃將男女萬口、馬三千匹走廣陵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-78', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '樂資山陽公載記曰：「小黃門蹇碩為上軍校尉，虎賁中郎將袁紹為中軍校尉，屯騎校尉鮑鴻為下軍校尉，議郎曹操為典軍校尉，趙融為助軍左校尉，馮芳為助軍右校尉，諫議大夫夏牟為左校尉，淳于瓊為右校尉：凡八人，謂之西園軍，皆統於碩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-79', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '建安元年，曹操迎天子都許，乃下詔書於紹，責以地廣兵多而專自樹黨，不聞勤王之師而但擅相討伐。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-80', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '臣時輒承制，竊比竇融，以議郎曹操權領兖州牧。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-81', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」時曹操自為大將軍，紹恥為之下，大尉位在大將軍上。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-82', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '若不得通，乃表曹操隔我王路，然後進屯黎陽，漸營河南，益作舟舩，繕修器械，分遣精騎，抄其邊鄙，令彼不得安，我取其逸。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-83', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '今以明公之神武，連河朔之強衆，以伐曹操，其埶譬若覆手。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-84', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」 曹操奉迎天子，建宮許都。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-85', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」曹操法令旣行，士卒精練，非公孫瓚坐受圍者也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-86', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」圖等曰：「武王伐紂，不為不義；況兵加曹操，而云無名！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-87', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '五年，左將軍劉備殺徐州刺史車胄，據沛以背曹操。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-88', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '田豐說紹曰：「與公爭天下者，曹操也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-89', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '曹操畏紹過河，乃急擊備，遂破之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-90', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '田豐以旣失前幾，不宜便行，諫紹曰：「曹操旣破劉備，則許下非復空虛。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-91', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '司空曹操祖父騰，故中常侍，與左悺、徐璜並作妖孽，饕餮放橫，傷化虐人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-92', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '乃先遣顏良攻曹操別將劉延於白馬，白馬，縣，屬東郡，今滑州縣也，故城在今縣東。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-93', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」其弟宗曰：「曹操士馬不敵，君何懼焉？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-94', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '曹操遂救劉延，擊顏良斬之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-95', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '紹使劉備、文醜挑戰，曹操又擊破之，斬文醜。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-96', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '」獻帝春秋曰：「紹令軍中各持三尺繩，曹操誠禽，但當縛之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-97', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '許攸進曰：「曹操兵少而悉師拒我，許下餘守埶必空弱。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-98', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '會攸家犯法，審配收繫之，攸不得志，遂奔曹操，而說使襲取淳于瓊等，瓊等時宿在烏巢，烏巢，地名，在滑州酸棗城東。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-99', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '所歷道問者，語之曰：『袁公恐曹操鈔掠後軍，還兵以益備。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-100', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '餘衆偽降，曹操盡阬之，前後所殺八萬人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-074-101', 'p0001', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '官度之敗，審配二子為曹操所禽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-102', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '十三年，曹操自將征荊州，璋乃遣使致敬。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-103', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '十六年，璋聞曹操當遣兵向漢中討張魯，內懷恐懼，松復說璋迎劉備以拒操。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-104', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '明年，曹操破張魯，定漢中。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-105', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '魯自在漢川垂三十年，聞曹操征之，至陽平，周地圖記曰：「襃谷西北有古陽平關。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-106', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '公孫瓚使劉備與術合謀共逼紹，紹與曹操會擊，皆破之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-107', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '黑山餘賊及匈奴於扶羅等佐術，與曹操戰於匡亭，大敗。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-108', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '曹操毒被於東徐，劉表僭亂於南荊，公孫叛逆於朔北，正禮阻兵，劉繇也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-109', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '術又率兵擊陳國，誘殺其王寵及相駱俊，曹操乃自征之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-110', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '曹操雖欲扶衰獎微，安能續絕運，起已滅乎！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-111', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '術因欲北至青州從袁譚，曹操使劉備徼之，不得過，復走還壽春。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-112', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '董卓之亂，與曹操共舉義兵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-113', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '紹旣怨邈，且聞與布厚，乃令曹操殺邈。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-114', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '興平元年，曹操東擊陶謙，令其將武陽人陳宮屯東郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-115', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '曹操聞而引軍擊布，累戰，相持百餘日。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-116', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '昔金元休南至封丘，為曹操所敗。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-117', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '」布亦素怨術，而女已在塗，乃追還絕婚，執胤送許，曹操殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-118', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '陳珪欲使子登詣曹操，布固不許，會使至，拜布為左將軍，布大喜，即聽登行，并令奉章謝恩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-119', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '登見曹操，因陳布勇而無謀，輕於去就，宜早圖之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-120', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '登還，布怒，拔戟斫机曰：「卿父勸吾協同曹操，絕婚公路。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-075-121', 'p0001', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '曹操壍圍之，壅沂、泗以灌其城，三月，上下離心。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-080b-122', 'p0001', 'houhanshu', 'a03-080b', '《後漢書·卷八十下》', '恃才氣，不屈曹操，多輕侮之言。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-080b-123', 'p0001', 'houhanshu', 'a03-080b', '《後漢書·卷八十下》', '融旣愛衡才，數稱述於曹操。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-081-124', 'p0001', 'houhanshu', 'a03-081', '《後漢書·卷八十一》', '曹操聞烈高名，遣徵不至。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-084-125', 'p0001', 'houhanshu', 'a03-084', '《後漢書·卷八十四》', '曹操素與邕善，痛其無嗣，乃遣使者以金璧贖之，而重嫁於祀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-084-126', 'p0001', 'houhanshu', 'a03-084', '《後漢書·卷八十四》', '祀為屯田都尉，犯法當死，文姬詣曹操請之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-089-127', 'p0001', 'houhanshu', 'a03-089', '《後漢書·卷八十九》', '二十一年，單于來朝，曹操因留於鄴，留呼厨泉於鄴，而遣去卑歸平陽，監其五部國。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-090-128', 'p0001', 'houhanshu', 'a03-090', '《後漢書·卷九十》', '會曹操平河北，閻柔率鮮卑、烏桓歸附，操即以柔為校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-090-129', 'p0001', 'houhanshu', 'a03-090', '《後漢書·卷九十》', '建安十二年，曹操自征烏桓，大破蹋頓於柳城，斬之，首虜二十餘萬人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-105-130', 'p0001', 'houhanshu', 'a03-105', '《二十四史-後漢書-志第十五‧五行三》', '袁山松書曰：「曹操專政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-105-131', 'p0001', 'houhanshu', 'a03-105', '《二十四史-後漢書-志第十五‧五行三》', '』時天下尚亂，豪桀並爭：曹操事二袁於河北；孫吳創基於江外；劉表阻亂衆於襄陽，南招零、桂，北割漢川，又以黃祖為爪牙，而祖與孫氏為深讎，兵革歲交。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-105-132', 'p0001', 'houhanshu', 'a03-105', '《二十四史-後漢書-志第十五‧五行三》', '十年，曹操破袁譚於南皮；十一年，走袁尚於遼東。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-105-133', 'p0001', 'houhanshu', 'a03-105', '《二十四史-後漢書-志第十五‧五行三》', '曹操略荊州，逐劉備於當陽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-105-134', 'p0001', 'houhanshu', 'a03-105', '《二十四史-後漢書-志第十五‧五行三》', '十四年，吳破曹操於赤壁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a03-118-135', 'p0001', 'houhanshu', 'a03-118', '《二十四史-後漢書-志第二十八‧百官五》', '犬牙相經，共為嚴國，雖王莽善盜，將何因而敢竊，曹操雄勇，亦安能以得士。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-001-136', 'p0001', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '布騎得太祖而不知是，問曰：「曹操何在？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-001-137', 'p0001', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '布疑有伏，乃相謂曰：「曹操多譎，勿入伏中。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-001-138', 'p0001', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '」公大喜，乃選精銳步騎，皆用袁軍旗幟，銜枚縛馬口，夜從間道出，人抱束薪，所歷道有問者，語之曰：「袁公恐曹操鈔略後軍，遣兵以益備。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-001-139', 'p0001', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '便欲送璽，會曹操斷道。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-006-140', 'p0001', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '天子以紹為太尉，轉為大將軍，封鄴侯，獻帝春秋曰：紹恥班在太祖下，怒曰；「曹操當死數矣，我輒救存之，今乃背恩，挾天子以令我乎！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-006-141', 'p0001', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '司空曹操，祖父騰，故中常侍，與左悺、徐璜並作妖孽，饕餮放橫，傷化虐民。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-006-142', 'p0001', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '仁君度數弘廣，綽然有餘，當以大包小，以優容劣，先除曹操以卒先公之恨，事定之後，乃議曲直之計，不亦善乎！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-006-143', 'p0001', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '曹操欲扶衰拯弱，安能續絕命救已滅乎？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-006-144', 'p0001', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '漢晉春秋曰：王威說劉琮曰：「曹操得將軍旣降，劉備已走，必懈弛無備，輕行單進；若給威奇兵數千，徼之於險，操可獲也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-007-145', 'p0001', 'sanguozhi', 'a04-007', '《三國志·魏書七》', '昔將金元休向兖州，甫詣封部，為曹操逆所拒破，流離迸走，幾至滅亡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-007-146', 'p0001', 'sanguozhi', 'a04-007', '《三國志·魏書七》', '布大喜，復遣使上書於天子曰：「臣本當迎大駕，知曹操忠孝，奉迎都許。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-007-147', 'p0001', 'sanguozhi', 'a04-007', '《三國志·魏書七》', '」陳宮曰：「逆賊曹操，何等明公！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-008-148', 'p0001', 'sanguozhi', 'a04-008', '《三國志·魏書八》', '靈帝紀曰：以虎賁中郎將袁紹為中軍校尉，屯騎校尉鮑鴻為下軍校尉，議郎曹操為典軍校尉，趙融、馮芳為助軍校尉，夏牟、淳于瓊為左右校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-013-149', 'p0001', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '傕、汜等以為「關東欲自立天子，今曹操雖有使命，非其至實」，議留太祖使，拒絕其意。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-026-150', 'p0001', 'sanguozhi', 'a04-026', '《三國志·魏書二十六》', '」忠曰：「我遼東在滄海之東，擁兵百萬，又有扶餘、濊貊之用；當今之勢，彊者為右，曹操獨何得為是也？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-031-151', 'p0001', 'sanguozhi', 'a04-031', '《三國志·蜀書一》', '習鑿齒曰：昔齊桓一矜其功而叛者九國，曹操暫自驕伐而天下三分，皆勤之於數十年之內而棄之於俯仰之頃，豈不惜乎！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-031-152', 'p0001', 'sanguozhi', 'a04-031', '《三國志·蜀書一》', '君子是以知曹操之不能遂兼天下者也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-032-153', 'p0001', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '獻帝春秋曰：孫權欲與備共取蜀，遣使報備曰：「米賊張魯居王巴、漢，為曹操耳目，規圖益州。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-032-154', 'p0001', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '曹操雖有無君之心，而有奉主之名，議者見操失利於赤壁，謂其力屈，無復遠志也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-032-155', 'p0001', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '董卓首難，蕩覆京畿，曹操階禍，竊執天衡；皇后太子鴆殺見害，剥亂天下，殘毀民物。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-032-156', 'p0001', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '惟獨曹操乆未梟除，侵擅國權，恣心極亂。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-032-157', 'p0001', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '今曹操阻兵安忍，戮殺主后，滔天泯夏，罔顧天顯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-033-158', 'p0001', 'sanguozhi', 'a04-033', '《三國志·蜀書三》', '曹操階禍，竊執天衡，殘剥海內，懷無君之心。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-159', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '曹操比於袁紹，則名微而衆寡，然操遂能克紹，以弱為彊者，非惟天時，抑亦人謀也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-160', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '」時權擁軍在柴桑，觀望成敗，亮說權曰：「海內大亂，將軍起兵據有江東，劉豫州亦收衆漢南，與曹操並爭天下。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-161', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '非劉豫州莫可以當曹操者，然豫州新敗之後，安能抗此難乎？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-162', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '曹操之衆遠來疲弊，聞追豫州，輕騎一日一夜行三百餘里，此所謂『彊弩之末，勢不能穿魯縞』者也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-163', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '曹操智計殊絕於人，其用兵也，髣髴孫、吳，然困於南陽，險於烏巢，危於祁連，偪於黎陽，幾敗伯山，殆死潼關，然後偽定一時耳，況臣才弱，而欲以不危而定之，此臣之未解三也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-164', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '曹操五攻昌霸不下，四越巢湖不成，任用李服而李服圖之，委夏侯而夏侯敗亡，先帝每稱操為能，猶有此失，況臣駑下，何能必勝？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-035-165', 'p0001', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '昔先帝敗軍於楚，當此時，曹操拊手，謂天下以定。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-036-166', 'p0001', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '曹操父子，世載其罪，朕用慘怛，疢如疾首。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-036-167', 'p0001', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '雲諫曰：「國賊是曹操，非孫權也，且先滅魏，則吳自服。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-037-168', 'p0001', 'sanguozhi', 'a04-037', '《三國志·蜀書七》', '」備曰：「今指與吾為水火者，曹操也，操以急，吾以寬；操以暴，吾以仁；操以譎，吾以忠；每與操反，事乃可成耳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-037-169', 'p0001', 'sanguozhi', 'a04-037', '《三國志·蜀書七》', '二十二年，正說先主曰：「曹操一舉而降張魯，定漢中，不因此勢以圖巴、蜀，而留夏侯淵、張郃屯守，身遽北還，此非其智不逮而力不足也，必將內有憂偪故耳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-040-170', 'p0001', 'sanguozhi', 'a04-040', '《三國志·蜀書十》', '羕於獄中與諸葛亮書曰：「僕昔有事於諸侯，以為曹操暴虐，孫權無道，振威闇弱，其惟主公有霸王之器，可與興業致治，故乃翻然有輕舉之志。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-040-171', 'p0001', 'sanguozhi', 'a04-040', '《三國志·蜀書十》', '至於內外之言，欲使孟起立功北州，勠力主公，共討曹操耳，寧敢有他志邪？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-040-172', 'p0001', 'sanguozhi', 'a04-040', '《三國志·蜀書十》', '」延對曰：「若曹操舉天下而來，請為大王拒之；偏將十萬之衆至，請為大王吞之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-041-173', 'p0001', 'sanguozhi', 'a04-041', '《三國志·蜀書十一》', '後羣臣議欲推漢中王稱尊號，詩上疏曰：「殿下以曹操父子偪主篡位，故乃羇旅萬里，糾合士衆，將以討賊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-046-174', 'p0001', 'sanguozhi', 'a04-046', '《三國志·吳書一》', '元惡旣斃，幼主東顧，俾保傅宣命，欲令諸軍振旅，然河北通謀黑山，曹操放毒東徐，劉表稱亂南荊，公孫瓚炰烋北幽，劉繇決力江滸，劉備爭盟淮隅，是以未獲承命櫜弓戢戈也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-047-175', 'p0001', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '」泉曰：「曹操父子陵轢漢室，終奪其位。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-047-176', 'p0001', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '其司州之土，以函谷關為界，造為盟曰：「天降喪亂，皇綱失叙，逆臣承釁，劫奪國柄，始於董卓，終於曹操，窮凶極惡，以覆四海，至令九州幅裂，普天無統，民神痛怨，靡所戾止。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-048-177', 'p0001', 'sanguozhi', 'a04-048', '《三國志·吳書三》', '曹操雖功蓋中夏，威震四海，崇詐杖術，征伐無已，民畏其威，而不懷其德也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-178', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '是時劉璋為益州牧，外有張魯寇侵，瑜乃詣京見權曰：「今曹操新折衂，方憂在腹心，未能與將軍道兵相事也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-179', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '臣竊以瑜昔見寵任，入作心膂，出為爪牙，銜命出征，身當矢石，盡節用命，視死如歸，故能摧曹操於烏林，走曹仁於郢都，揚國威德，華夏是震，蠢爾蠻荊，莫不賔服，雖周之方叔，漢之信、布，誠無以尚也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-180', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '權曰：「昔走曹操，拓有荊州，皆是公瑾，常不忘之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-181', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '今之曹操，猶昔項羽，將軍何由得為桓文乎？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-182', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '肅竊料之，漢室不可復興，曹操不可卒除。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-183', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '肅請得奉命弔表二子，并慰勞其軍中用事者，及說備使撫表衆，同心一意，共治曹操，備必喜而從命。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-054-184', 'p0001', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '今旣與曹操為敵，劉備近在公安，邊境密邇，百姓未附，宜得良將以鎮撫之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-055-185', 'p0001', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '寧陳計曰：「今漢祚日微，曹操彌憍，終為篡盜。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-058-186', 'p0001', 'sanguozhi', 'a04-058', '《三國志·吳書十三》', '遜案劒曰：「劉備天下知名，曹操所憚，今在境界，此彊對也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-064-187', 'p0001', 'sanguozhi', 'a04-064', '《三國志·吳書十九》', '今敵政在私門，外內猜隔，兵挫於外，而民怨於內，自曹操以來，彼之亡形未有如今者也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a04-064-188', 'p0001', 'sanguozhi', 'a04-064', '《三國志·吳書十九》', '近者劉景升在荊州，有衆十萬，財穀如山，不及曹操尚微，與之力競，坐觀其彊大，吞滅諸袁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0001-a05-014-189', 'p0001', 'jinshu', 'a05-014', '《晉書·卷十四》', '獻帝建安元年拜曹操為鎮東將軍，封費亭侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-032-0', 'p0002', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '太傅許靖、安漢將軍糜笁、軍師將軍諸葛亮、太常賴恭、光祿勳黃柱、少府王謀等上言：「曹丕篡弒，湮滅漢室，竊據神器，劫迫忠良，酷烈無道。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-035-1', 'p0002', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '章武三年春，先主於永安病篤，召亮於成都，屬以後事，謂亮曰：「君才十倍曹丕，必能安國，終定大事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-035-2', 'p0002', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '然後吳更違盟，關羽毀敗，秭歸蹉跌，曹丕稱帝。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-042-3', 'p0002', 'sanguozhi', 'a04-042', '《三國志·蜀書十二》', '」微自乞老病求歸，亮又與書荅曰：「曹丕篡弒，自立為帝，是猶土龍芻狗之有名也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-047-4', 'p0002', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '權令趙達筭之，曰：「曹丕走矣，雖然，吳衰庚子歲。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-047-5', 'p0002', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '權謂芝曰：「山民作亂，江邊守兵多徹，慮曹丕乘空弄態，而反求和。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-047-6', 'p0002', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '孽臣曹丕遂奪神器，丕子叡繼世作慝，淫名亂制。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-052-7', 'p0002', 'sanguozhi', 'a04-052', '《三國志·吳書七》', '又別咨瑾曰：「近得伯言表，以為曹丕已死，毒亂之民，當望旌瓦解，而更靜然。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-053-8', 'p0002', 'sanguozhi', 'a04-053', '《三國志·吳書八》', '」初，魏文帝即位，權嘗從容問羣臣曰：「曹丕以盛年即位，恐孤不能及之，諸卿以為何如？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-056-9', 'p0002', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '雖曹丕自來，尚不足憂，況仁等邪！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-057-10', 'p0002', 'sanguozhi', 'a04-057', '《三國志·吳書十二》', '後聞曹丕自出淮、泗，故豫勑溫有急便出，而溫悉內諸將，布於深山，被命不至。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0002-a04-058-11', 'p0002', 'sanguozhi', 'a04-058', '《三國志·吳書十三》', '權以問遜，遜與朱然、駱統以為曹丕大合士衆，外託助國討備，內實有姦心，謹決計輒還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0003-a03-018-0', 'p0003', 'houhanshu', 'a03-018', '《後漢書·卷十八》', '」曹植結交篇曰：「利劔鳴手中。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0003-a03-054-1', 'p0003', 'houhanshu', 'a03-054', '《後漢書·卷五十四》', '續漢書曰：「人有白脩與臨淄侯曹植飲醉共載，從司馬門出，謗訕鄢陵侯章。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0003-a03-111-2', 'p0003', 'houhanshu', 'a03-111', '《二十四史-後漢書-志第二十一‧郡國三》', '」曹植禹廟讚曰：「有禹祠，植移于其城，城本名杞城。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0003-a03-115-3', 'p0003', 'houhanshu', 'a03-115', '《二十四史-後漢書-志第二十五‧百官二》', '董卓為東中郎將，盧植為北中郎將，獻帝以曹植為南中郎將。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-0', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '夏四月，進軍臨河，使史渙、曹仁渡河擊之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-1', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '紹使劉備助辟，公使曹仁擊破之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-2', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '於是中軍師王凌、謝亭侯荀攸、前軍師東武亭侯鍾繇、左軍師涼茂、右軍師毛玠、平虜將軍華鄉侯劉勳、建武將軍清苑亭侯劉若、伏波將軍高安侯夏侯惇、揚武將軍都亭侯王忠、奮威將軍樂鄉侯劉展、建忠將軍昌鄉亭侯鮮于輔、奮武將軍安國亭侯程昱、太中大夫都鄉侯賈詡、軍師祭酒千秋亭侯董昭、都亭侯薛洪、南鄉亭侯董蒙、關內侯王粲、傅巽、祭酒王選、袁奐、王朗、張承、任藩、杜襲、中護軍國明亭侯曹洪、中領軍萬歲亭侯韓浩、行驍騎將軍安平亭侯曹仁、領護軍將軍王圖、長史萬潛、謝奐、袁霸等勸進曰：「自古三代，胙臣以土，受命中興，封秩輔佐，皆所以襃功賞德，為國藩衞也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-3', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '三月，王引軍還，留夏侯惇、曹仁、張遼等屯居巢。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-4', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '初，曹仁討關羽，屯樊城，是月使仁圍宛。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-001-5', 'p0005', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '子卿因夜踰城亡出，遂與太守收餘民圍音，會曹仁軍至，共滅之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-002-6', 'p0005', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '夏四月，以車騎將軍曹仁為大將軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-002-7', 'p0005', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '五月，鄭甘復叛，遣曹仁討斬之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-002-8', 'p0005', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '」己卯，以大將軍曹仁為大司馬。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-002-9', 'p0005', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '」丁未，大司馬曹仁薨。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-003-10', 'p0005', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '夏五月壬申，詔祀故大將軍夏侯惇、大司馬曹仁、車騎將軍程昱於太祖廟庭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-004-11', 'p0005', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '征南將軍曹仁討平音，表余行狀，并脩祭醊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-009-12', 'p0005', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹仁字子孝，太祖從弟也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-010-13', 'p0005', 'sanguozhi', 'a04-010', '《三國志·魏書十》', '故曹仁守江陵，敗不旋踵，何撫安之得行，稽服之可期？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-014-14', 'p0005', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '及關羽圍曹仁於樊，孫權遣使辭以「遣兵西上，欲掩取羽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-014-15', 'p0005', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '黃初三年，與大司馬曹仁征吳，濟別襲羨溪。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-017-16', 'p0005', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '關羽圍曹仁於樊，會權稱藩，召遼及諸軍悉還救仁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-017-17', 'p0005', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '復從攻張繡於穰，禽呂布於下邳，別與史渙、曹仁攻眭固於射犬，破斬之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-017-18', 'p0005', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '建安二十四年，太祖在長安，使曹仁討關羽於樊，又遣禁助仁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-017-19', 'p0005', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '又與滿寵討關羽於漢津，與曹仁擊周瑜於江陵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-017-20', 'p0005', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '復遣晃助曹仁討關羽，屯宛。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-018-21', 'p0005', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '劉備與周瑜圍曹仁於江陵，別遣關羽絕北道。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-018-22', 'p0005', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '曹仁自荊州來朝謁，太祖未出，入與褚相見於殿外。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-018-23', 'p0005', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '侯音、衞開等以宛叛，悳將所領與曹仁共攻拔宛，斬音、開，遂南屯樊，討關羽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-019-24', 'p0005', 'sanguozhi', 'a04-019', '《三國志·魏書十九》', '二十四年，曹仁為關羽所圍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-022-25', 'p0005', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '曹仁為關羽所圍，太祖遣徐晃救之，不解。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-023-26', 'p0005', 'sanguozhi', 'a04-023', '《三國志·魏書二十三》', '關羽圍征南將軍曹仁於樊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-026-27', 'p0005', 'sanguozhi', 'a04-026', '《三國志·魏書二十六》', '關羽圍襄陽，寵助征南將軍曹仁屯樊城拒之，而左將軍于禁等軍以霖雨水長為羽所沒。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-032-28', 'p0005', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '曹公遣曹仁將兵擊先主，先主還紹軍，陰欲離紹，乃說紹南連荊州牧劉表。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-032-29', 'p0005', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '時關羽攻曹公將曹仁，禽于禁於樊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-035-30', 'p0005', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '羽圍襄陽，將降曹仁，生獲于禁，當時北邊大小憂懼，孟德身出南陽，樂進、徐晃等為救，圍不即解，故蔣子通言彼時有徙許渡河之計，會國家襲取南郡，羽乃解軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-036-31', 'p0005', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '是歲，羽率衆攻曹仁於樊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-036-32', 'p0005', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '而曹公遣徐晃救曹仁，蜀記曰：羽與晃宿相愛，遙共語，但說平生，不及軍事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-047-33', 'p0005', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '備、瑜等復追至南郡，曹公遂北還，留曹仁、徐晃於江陵，使樂進守襄陽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-047-34', 'p0005', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '二十四年，關羽圍曹仁於襄陽，曹公遣左將軍于禁救之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-047-35', 'p0005', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '曹公且欲使羽與權相持以鬬之，驛傳權書，使曹仁以弩射示羽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-047-36', 'p0005', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '秋九月，魏乃命曹休、張遼、臧霸出洞口，曹仁出濡須，曹真、夏侯尚、張郃、徐晃圍南郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-047-37', 'p0005', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '三月，曹仁遣將軍常彫等，以兵五千，乘油舩，晨渡濡須中州。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-054-38', 'p0005', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '曹公留曹仁等守江陵城，徑自北歸。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-054-39', 'p0005', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '臣竊以瑜昔見寵任，入作心膂，出為爪牙，銜命出征，身當矢石，盡節用命，視死如歸，故能摧曹操於烏林，走曹仁於郢都，揚國威德，華夏是震，蠢爾蠻荊，莫不賔服，雖周之方叔，漢之信、布，誠無以尚也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-054-40', 'p0005', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '是歲，又與周瑜、程普等西破曹公於烏林，圍曹仁於南郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-054-41', 'p0005', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '瑜使甘寧前據夷陵，曹仁分衆攻寧，寧困急，使使請救。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-054-42', 'p0005', 'sanguozhi', 'a04-054', '《三國志·吳書九》', '於是將士形勢自倍，乃渡江立屯，與相攻擊，曹仁退走，遂據南郡，撫定荊州。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-43', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '樂安平定，代太史慈備海昏，與周瑜為左右督，破曹公於烏林，又進攻南郡，走曹仁。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-44', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '後與周瑜、程普拒曹公於赤壁，攻曹仁於南郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-45', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '曹仁出濡須，戰有功，又從攻破曹休，進位裨將軍，黃龍二年卒。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-46', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '攻曹仁於南郡，未拔，寧建計先徑進取夷陵，往即得其城，因入守之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-47', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '曹仁乃令五六千人圍寧。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-055-48', 'p0005', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '權以統為承烈都尉，與周瑜等拒破曹公於烏林，遂攻曹仁，遷為校尉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-056-49', 'p0005', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '黃武元年，魏使大司馬曹仁步騎數萬向濡須，仁欲以兵襲取州上，偽先揚聲，欲東攻羨溪。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-056-50', 'p0005', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '諸君聞曹仁用兵行師，孰與桓邪？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a04-057-51', 'p0005', 'sanguozhi', 'a04-057', '《三國志·吳書十二》', '黃武初，曹仁攻濡須，使別將常雕等襲中洲，統與嚴圭共拒破之，封新陽亭侯，後為濡須督。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a05-001-52', 'p0005', 'jinshu', 'a05-001', '《晉書·卷一》', '及蜀將關羽圍曹仁於樊，于禁等七軍皆沒，脩、方果降羽，而仁圍甚急焉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0005-a05-001-53', 'p0005', 'jinshu', 'a05-001', '《晉書·卷一》', '時曹仁鎮襄陽，請召仁還宛。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-002-0', 'p0006', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '魏書曰：十一月辛未，鎮西將軍曹真命衆將及州郡兵討破叛胡治元多、蘆水、封賞等，斬首五萬餘級，獲生口十萬，羊一百一十一萬口，牛八萬，河西遂平。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-002-1', 'p0006', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '夏五月丙辰，帝疾篤，召中軍大將軍曹真、鎮軍大將軍陳羣、征東大將軍曹休、撫軍大將軍司馬宣王，並受遺詔輔嗣主。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-002-2', 'p0006', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '魏氏春秋曰：明帝將送葬，曹真、陳羣、王朗等以暑熱固諫，乃止。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-003-3', 'p0006', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '十二月，以太尉鍾繇為太傅，征東大將軍曹休為大司馬，中軍大將軍曹真為大將軍，司徒華歆為太尉，司空王朗為司徒，鎮軍大將軍陳羣為司空，撫軍大將軍司馬宣王為驃騎大將軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-003-4', 'p0006', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '遣大將軍曹真都督關右，並進兵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-003-5', 'p0006', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '十二月，諸葛亮圍陳倉，曹真遣將軍費曜等拒之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-003-6', 'p0006', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '癸巳，以大將軍曹真為大司馬，驃騎將軍司馬宣王為大將軍，遼東太守公孫淵為車騎將軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-003-7', 'p0006', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '詔大司馬曹真、大將軍司馬宣王伐蜀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-004-8', 'p0006', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '秋七月，詔祀故大司馬曹真、曹休、征南大將軍夏侯尚、太常桓階、司空陳羣、太傅鍾繇、車騎將軍張郃、左將軍徐晃、前將軍張遼、右將軍樂進、太尉華歆、司徒王朗、驃騎將軍曹洪、征西將軍夏侯淵、後將軍朱靈、文聘、執金吾臧霸、破虜將軍李典、立義將軍龐德、武猛校尉典韋於太祖廟庭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-009-9', 'p0006', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '魏略曰：文帝收洪，時曹真在左右，請之曰：「今誅洪，洪必以真為譖也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-009-10', 'p0006', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹真字子丹，太祖族子也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-009-11', 'p0006', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '範於沛郡，仕次在曹真後。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-009-12', 'p0006', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '干寶晉紀曰：蔣濟以曹真之勳力，不宜絕祀，故以熈為後。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-009-13', 'p0006', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '黃初三年，車駕幸宛，使尚率諸軍與曹真共圍江陵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-013-14', 'p0006', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '太和中，遣曹真從子午道伐蜀，車駕東幸許昌。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-013-15', 'p0006', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '四年，大司馬曹真征蜀，肅上疏曰：「前志有之，『千里饋糧，士有饑色，樵蘇後爨，師不宿飽』，此謂平塗之行軍者也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-013-16', 'p0006', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '聞曹真發已踰月而行裁半谷，治道功夫，戰士悉作。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-014-17', 'p0006', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '文皇帝始召曹真還時，親詔臣以重慮，及至晏駕，陛下即阼，猶有曹休外內之望，賴遭日月，御勒不傾，使各守分職，纖介不間。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-017-18', 'p0006', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '詔郃與曹真討安定盧水胡及東羌，召郃與真並朝許宮，遣南與夏侯尚擊江陵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-021-19', 'p0006', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '」初，曹真、曹休亦與質等俱在渤海游處，時休、真亦以宗親並受爵封，出為列將，而質故為長史。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-021-20', 'p0006', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '時上將軍曹真性肥，中領軍朱鑠性瘦，質召優，使說肥瘦。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-022-21', 'p0006', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '帝寢疾，羣與曹真、司馬宣王等並受遺詔輔政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-022-22', 'p0006', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '明帝即位，進封潁陰侯，增邑五百，并前千三百戶，與征東大將軍曹休、中軍大將軍曹真、撫軍大將軍司馬宣王並開府。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-022-23', 'p0006', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '」太和中，曹真表欲數道伐蜀，從斜谷入。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-023-24', 'p0006', 'sanguozhi', 'a04-023', '《三國志·魏書二十三》', '諸葛亮出秦川，大將軍曹真督諸軍拒亮，徙襲為大將軍軍師，分邑百戶賜兄基爵關內侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-025-25', 'p0006', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '上軍大將軍曹真征朱然于江陵，毗行軍師。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-025-26', 'p0006', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '是時大司馬曹真伐蜀，遇雨不進。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-033-27', 'p0006', 'sanguozhi', 'a04-033', '《三國志·蜀書三》', '八年秋，魏使司馬懿由西城，張郃由子午，曹真由斜谷，斜，余奢反。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-035-28', 'p0006', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '亮初屯陽平，宣帝尚為荊州都督，鎮宛城，至曹真死後，始與亮於關中相抗禦耳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-035-29', 'p0006', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '六年春，揚聲由斜谷道取郿，使趙雲、鄧芝為疑軍，據箕谷，魏大將軍曹真舉衆拒之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-035-30', 'p0006', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '冬，亮復出散關，圍陳倉，曹真拒之，亮糧盡而還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-035-31', 'p0006', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '於是魏大司馬曹真有疾，司馬宣王自荊州入朝，魏明帝曰：「西方事重，非君莫可付者。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-036-32', 'p0006', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '明年，亮出軍，揚聲由斜谷道，曹真遣大衆當之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-040-33', 'p0006', 'sanguozhi', 'a04-040', '《三國志·蜀書十》', '以曹真欲三道向漢川，亮命嚴將二萬人赴漢中。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-047-34', 'p0006', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '秋九月，魏乃命曹休、張遼、臧霸出洞口，曹仁出濡須，曹真、夏侯尚、張郃、徐晃圍南郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-047-35', 'p0006', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '二年春正月，曹真分軍據江陵中州。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-052-36', 'p0006', 'sanguozhi', 'a04-052', '《三國志·吳書七》', '吳錄曰：曹真、夏侯尚等圍朱然於江陵，又分據中州，瑾以大兵為之救援。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-055-37', 'p0006', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '曹真攻南郡，當保東南。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a04-056-38', 'p0006', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '魏遣曹真、夏侯尚、張郃等攻江陵，魏文帝自住宛，為其勢援，連屯圍城。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a05-001-39', 'p0006', 'jinshu', 'a05-001', '《晉書·卷一》', '及天子疾篤，帝與曹真、陳羣等見於崇華殿之南堂，並受顧命輔政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a05-001-40', 'p0006', 'jinshu', 'a05-001', '《晉書·卷一》', '四年，遷大將軍，加大都督、假黃鉞，與曹真伐蜀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0006-a05-001-41', 'p0006', 'jinshu', 'a05-001', '《晉書·卷一》', '蔣濟曰：「曹真之勳，不可以不祀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-003-0', 'p0007', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '以燕王宇為大將軍，甲申免，以武衞將軍曹爽代之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-003-1', 'p0007', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '漢晉春秋曰：帝以燕王宇為大將軍，使與領軍將軍夏侯獻、武衞將軍曹爽、屯騎校尉曹肈、驍騎將軍秦朗等對輔政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-003-2', 'p0007', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '甲申，帝氣微，宇下殿呼曹肈有所議，未還，而帝少間，惟曹爽獨在。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-3', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '大將軍曹爽、太尉司馬宣王輔政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-4', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '五年春二月，詔大將軍曹爽率衆征蜀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-5', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '丙午，大將軍曹爽引軍還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-6', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '司馬宣王謂曹爽曰：「若便令還，必復致寇，宜權留之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-7', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '太傅司馬宣王奏免大將軍曹爽、爽弟中領軍羲、武衞將軍訓、散騎常侍彥官，以侯就第。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-004-8', 'p0007', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '明帝旣不能然，情繫私愛，撫養嬰孩，傳以大器，託付不專，必參枝族，終於曹爽誅夷，齊王替位。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-9', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '霸，正始中為討蜀護軍右將軍，進封愽昌亭侯，素為曹爽所厚。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-10', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '時征西將軍夏侯玄，於霸為從子，而玄於曹爽為外弟。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-11', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '及司馬宣王誅曹爽，遂召玄，玄來東。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-12', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '霸聞曹爽被誅而玄又徵，以為禍必轉相及，心旣內恐；又霸先與雍州刺史郭淮不和，而淮代玄為征西，霸尤不安，故遂奔蜀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-13', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹爽宿與相親，時爽為武衞將軍，數為帝稱其可大用。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-14', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '素與曹爽善，每言於爽，多見從之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-15', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '勝少游京師，雅有才智，與曹爽善。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-16', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '帝崩，曹爽輔政，勝為洛陽令。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-17', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '于時曹爽輔政，以範鄉里老宿，於九卿中特敬之，然不甚親也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-18', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '」　漢晉春秋曰：安定皇甫謐以九年冬夢至洛陽，自廟出，見車騎甚衆，以物呈廟云：「誅大將軍曹爽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-19', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '至正始初，曲合於曹爽，亦以才能，故爽用為散騎侍郎，遷侍中尚書。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-20', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '與曹爽共興駱谷之役，時人譏之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-21', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '密謂韜曰：「玄旣為海內重人，加以當大任，年時方壯而永見廢，又親曹爽外弟，於大將軍有嫌。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-22', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹爽專政，豐依違二公間，無有適莫，故于時有謗書曰：「曹爽之勢熱如湯，太傅父子冷如漿，李豐兄弟如游光。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-23', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '臣松之案：曹爽以正始五年伐蜀，時玄已為關中都督，至十年，爽誅滅後，方還洛耳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-24', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '大將軍曹爽附絹二十匹令交市於吳，經不發書，棄官歸。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-009-25', 'p0007', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '玄以規格局度，世稱其名，然與曹爽中外繾綣；榮位如斯，曾未聞匡弼其非，援致良才。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-013-26', 'p0007', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '大將軍曹爽盛夏興軍伐蜀，蜀拒守，軍不得進。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-013-27', 'p0007', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '時大將軍曹爽專權，任用何晏、鄧颺等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-28', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '曹爽時為選部郎，鄧颺之徒稱之以為伊呂。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-29', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '是時，曹爽專政，丁謐、鄧颺等輕改法度。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-30', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '以隨太傅司馬宣王屯洛水浮橋，誅曹爽等，進封都鄉侯，邑七百戶。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-31', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '世語曰：初，濟隨司馬宣王屯洛水浮橋，濟書與曹爽，言宣王旨「惟免官而已」，爽遂誅滅。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-32', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '其年，帝寢疾，欲以燕王宇為大將軍，及領軍將軍夏侯獻、武衞將軍曹爽、屯騎校尉曹肇、驍騎將軍秦朗共輔政。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-33', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '」帝曰：「曹爽可代宇不？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-34', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '案本傳及諸書並云放、資稱贊曹爽，勸召宣王，魏室之亡，禍基於此。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-014-35', 'p0007', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '」曹爽誅後，復以資為侍中，領中書令。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-020-36', 'p0007', 'sanguozhi', 'a04-020', '《三國志·魏書二十》', '是時天子幼稚，冏兾以此論感悟曹爽，爽不能納。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-021-37', 'p0007', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '曹爽秉政，多違法度，璩為詩以諷焉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-021-38', 'p0007', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '太尉蔣濟聞而辟之，後為尚書郎、曹爽參軍，以疾歸田里。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-021-39', 'p0007', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '時曹爽秉政，何晏為吏部尚書，嘏謂爽弟羲曰：「何平叔外靜而內銛巧，好利，不念務本。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-021-40', 'p0007', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '曹爽誅，為河南尹，傅子曰：河南尹內掌帝都，外統京畿，兼古六鄉六遂之士。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-022-41', 'p0007', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '曹爽輔政，使夏侯玄宣指，欲引臻入守尚書令，及為弟求婚，皆不許。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-022-42', 'p0007', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '時曹爽秉權，將樹其黨，徙毓僕射，以侍中何晏代毓。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-024-43', 'p0007', 'sanguozhi', 'a04-024', '《三國志·魏書二十四》', '太傅司馬宣王奏免曹爽，皇太后詔召柔假節行大將軍事，據爽營。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-024-44', 'p0007', 'sanguozhi', 'a04-024', '《三國志·魏書二十四》', '明帝臨崩之時，以曹爽為大將軍，宜得良佐，於牀下受遺詔，拜禮大將軍長史，加散騎常侍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-024-45', 'p0007', 'sanguozhi', 'a04-024', '《三國志·魏書二十四》', '而曹爽信清河言，下書云：「圖不可用，當參異同。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-024-46', 'p0007', 'sanguozhi', 'a04-024', '《三國志·魏書二十四》', '大將軍曹爽使材官張達斫家屋材，及諸私用之物，觀聞知，皆錄奪以沒官。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-025-47', 'p0007', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '』弟敞為大將軍曹爽參軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-025-48', 'p0007', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '且曹爽與太傅俱受寄託之任，而獨專權勢，行以驕奢，於王室不忠，於人道不直，此舉不過以誅曹爽耳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-027-49', 'p0007', 'sanguozhi', 'a04-027', '《三國志·魏書二十七》', '嘉平初，太傅司馬宣王旣誅曹爽，乃奏愽問大臣得失。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-027-50', 'p0007', 'sanguozhi', 'a04-027', '《三國志·魏書二十七》', '大將軍曹爽請為從事中郎，出為安豐太守。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-027-51', 'p0007', 'sanguozhi', 'a04-027', '《三國志·魏書二十七》', '時曹爽專柄，風化陵遲，基著時要論以切世事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-52', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '司馬宣王旣誅曹爽，進淩為太尉，假節鉞。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-53', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '今曹爽以驕奢失民，何平叔虛而不治，丁、畢、桓、鄧雖並有宿望，皆專競於世。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-54', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '正始中，為曹爽長史，後出為兖州刺史。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-55', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '揚州刺史前將軍文欽，曹爽之邑人也，驍果麄猛，數有戰功，好增虜獲，以徼寵賞，多不見許，怨恨日甚。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-56', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '曹爽以欽鄉里，厚養待之，不治欽事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-57', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '曹爽誅後，進欽為前將軍以安其心，後代諸葛誕為揚州刺史。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-58', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '自曹爽之誅，欽常內懼，與諸葛誕相惡，無所與謀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-59', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '』是時大將軍曹爽專朝政，日縱酒沈醉，會兄侍中毓宴還，言其事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-60', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '時丁謐與晏爭衡，致高邑王黎於曹爽，爽用黎。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-028-61', 'p0007', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '正始十年，曹爽廢，以公事免。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-029-62', 'p0007', 'sanguozhi', 'a04-029', '《三國志·魏書二十九》', '」毓未解輅言，無幾，曹爽等誅，乃覺寤云。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-033-63', 'p0007', 'sanguozhi', 'a04-033', '《三國志·蜀書三》', '七年閏月，魏大將軍曹爽、夏侯玄等向漢中，鎮北大將軍王平拒興勢圍，大將軍費禕督諸軍往赴救，魏軍退。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-033-64', 'p0007', 'sanguozhi', 'a04-033', '《三國志·蜀書三》', '十二年春正月，魏誅大將軍曹爽等，右將軍夏侯霸來降。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-043-65', 'p0007', 'sanguozhi', 'a04-043', '《三國志·蜀書十三》', '七年春，魏大將軍曹爽率步騎十餘萬向漢川，前鋒已在駱谷。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-044-66', 'p0007', 'sanguozhi', 'a04-044', '《三國志·蜀書十四》', '魏遣大將軍曹爽襲蜀時，議者或謂但可守城，不出拒敵，必自引退。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-044-67', 'p0007', 'sanguozhi', 'a04-044', '《三國志·蜀書十四》', '殷基通語曰：司馬懿誅曹爽，禕設甲乙論平其是非。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-044-68', 'p0007', 'sanguozhi', 'a04-044', '《三國志·蜀書十四》', '甲以為曹爽兄弟凡品庸人，苟以宗子枝屬，得蒙顧命之任，而驕奢僭逸，交非其人，私樹朋黨，謀以亂國。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a04-044-69', 'p0007', 'sanguozhi', 'a04-044', '《三國志·蜀書十四》', '及興勢之役，王平捍拒曹爽，皆承此制。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-70', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '」命與大將軍曹爽並受遺詔輔少主。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-71', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '尚書鄧颺、李勝等欲令曹爽建立功名，勸使伐蜀。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-72', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '六年秋八月，曹爽毀中壘中堅營，以兵屬其弟中領軍羲。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-73', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '曹爽曰：「今不能脩守沔南而留百姓，非長策也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-74', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '曹爽用何晏、鄧颺、丁謐之謀，遷太后於永寧宮，專擅朝政，兄弟並典禁兵，多樹親黨，屢改制度。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-75', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '九年春三月，黃門張當私出掖庭才人石英等十一人，與曹爽為伎人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-001-76', 'p0007', 'jinshu', 'a05-001', '《晉書·卷一》', '誅曹爽之際，支黨皆夷及三族，男女無少長，姑姊妹女子之適人者皆殺之，既而竟遷魏鼎云。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-002-77', 'p0007', 'jinshu', 'a05-002', '《晉書·卷二》', '宣帝之將誅曹爽，深謀祕策，獨與帝潛畫，文帝弗之知也，將發夕乃告之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-002-78', 'p0007', 'jinshu', 'a05-002', '《晉書·卷二》', '大將軍曹爽之伐蜀也，以帝為征蜀將軍，副夏侯玄出駱谷，次于興勢。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-002-79', 'p0007', 'jinshu', 'a05-002', '《晉書·卷二》', '及誅曹爽，帥衆衞二宮，以功增邑千戶。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-005-80', 'p0007', 'jinshu', 'a05-005', '《晉書·卷五》', '故能西禽孟達，東舉公孫，內夷曹爽，外襲王淩。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-012-81', 'p0007', 'jinshu', 'a05-012', '《晉書·卷十二》', '是時曹爽專政，丁謐、鄧颺等轉改法度。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-012-82', 'p0007', 'jinshu', 'a05-012', '《晉書·卷十二》', '宣帝奏永寧太后廢曹爽等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-013-83', 'p0007', 'jinshu', 'a05-013', '《晉書·卷十三》', '」嘉平元年，天子謁陵，宣帝奏誅曹爽等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-013-84', 'p0007', 'jinshu', 'a05-013', '《晉書·卷十三》', '」嘉平元年，宣帝誅曹爽兄弟及其黨與，皆夷三族，京師嚴兵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-037-85', 'p0007', 'jinshu', 'a05-037', '《晉書-卷三十七・列傳第七》', '及大將軍曹爽擅權，李勝、何晏、鄧颺等亂政，孚不視庶事，但正身遠害而已。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-039-86', 'p0007', 'jinshu', 'a05-039', '《晉書-卷三十九・列傳第九》', '大將軍曹爽辟爲掾，累遷中書門下侍郎。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-039-87', 'p0007', 'jinshu', 'a05-039', '《晉書-卷三十九・列傳第九》', '時曹爽專權，何晏等欲害太常傅嘏，顗營救得免。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-039-88', 'p0007', 'jinshu', 'a05-039', '《晉書-卷三十九・列傳第九》', '仕魏，辟大將軍曹爽掾，遷中書通事郎。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-040-89', 'p0007', 'jinshu', 'a05-040', '《晉書-卷四十・列傳第十》', '時駿居曹爽故府，在武庫南，聞內有變，召眾官議之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-042-90', 'p0007', 'jinshu', 'a05-042', '《晉書-卷四十二・列傳第十二》', '襲父爵京陵侯，辟大將軍曹爽掾。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0007-a05-042-91', 'p0007', 'jinshu', 'a05-042', '《晉書-卷四十二・列傳第十二》', '楚王瑋將害汝南王亮等也，公孫宏說瑋曰：「昔宣帝廢曹爽，引太尉蔣濟參乘，以增威重。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-002-0', 'p0008', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '夏五月丙辰，帝疾篤，召中軍大將軍曹真、鎮軍大將軍陳羣、征東大將軍曹休、撫軍大將軍司馬宣王，並受遺詔輔嗣主。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-003-1', 'p0008', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '吳將諸葛瑾、張霸等寇襄陽，撫軍大將軍司馬宣王討破之，斬霸，征東大將軍曹休又破其別將於尋陽。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-003-2', 'p0008', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '十二月，以太尉鍾繇為太傅，征東大將軍曹休為大司馬，中軍大將軍曹真為大將軍，司徒華歆為太尉，司空王朗為司徒，鎮軍大將軍陳羣為司空，撫軍大將軍司馬宣王為驃騎大將軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-003-3', 'p0008', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '」秋九月，曹休率諸軍至皖，與吳將陸議戰於石亭，敗績。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-004-4', 'p0008', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '秋七月，詔祀故大司馬曹真、曹休、征南大將軍夏侯尚、太常桓階、司空陳羣、太傅鍾繇、車騎將軍張郃、左將軍徐晃、前將軍張遼、右將軍樂進、太尉華歆、司徒王朗、驃騎將軍曹洪、征西將軍夏侯淵、後將軍朱靈、文聘、執金吾臧霸、破虜將軍李典、立義將軍龐德、武猛校尉典韋於太祖廟庭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-009-5', 'p0008', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹休字文烈，太祖族子也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-013-6', 'p0008', 'sanguozhi', 'a04-013', '《三國志·卷十三‧魏書十三》', '其後征東將軍曹休來朝，時帝方與夏有所咨論，而外啟休到，帝引入。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-014-7', 'p0008', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '三年，征東大將軍曹休臨江在洞浦口，自表：「願將銳卒虎步江南，因敵取資，事必克捷；若其無臣，不須為念。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-014-8', 'p0008', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '大司馬曹休帥軍向皖，濟表以為「深入虜地，與權精兵對，而朱然等在上流，乘休後，臣未見其利也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-014-9', 'p0008', 'sanguozhi', 'a04-014', '《三國志·魏書十四》', '文皇帝始召曹真還時，親詔臣以重慮，及至晏駕，陛下即阼，猶有曹休外內之望，賴遭日月，御勒不傾，使各守分職，纖介不間。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-015-10', 'p0008', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '太和二年，帝使逵督前將軍滿寵、東莞太守胡質等四軍，從西陽直向東關，曹休從皖，司馬宣王從江陵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-015-11', 'p0008', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '今忍其私忿而急彼之憂，冒難犯危而免之於害，使功顯於明君，惠施於百姓，身登於君子之塗，義愧於敵人之心，雖豺虎猶將不覺所復，而況於曹休乎？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-017-12', 'p0008', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '孫權復叛，帝遣遼乘舟，與曹休至海陵，臨江。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-018-13', 'p0008', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '與曹休討吳賊，破呂範於洞浦，徵為執金吾，位特進。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-018-14', 'p0008', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '文帝即位，以曹休都督青、徐，霸謂休曰：「國家未肯聽霸耳！');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-021-15', 'p0008', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '」初，曹真、曹休亦與質等俱在渤海游處，時休、真亦以宗親並受爵封，出為列將，而質故為長史。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-021-16', 'p0008', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '質別傳曰：帝嘗召質及曹休歡會，命郭后出見質等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-022-17', 'p0008', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '明帝即位，進封潁陰侯，增邑五百，并前千三百戶，與征東大將軍曹休、中軍大將軍曹真、撫軍大將軍司馬宣王並開府。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-022-18', 'p0008', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '征軍大將軍曹休表得降賊辭，「孫權已在濡須口」。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-023-19', 'p0008', 'sanguozhi', 'a04-023', '《三國志·魏書二十三》', '孫權寇邊，征東大將軍曹休統五州軍禦之，徵儼為軍師。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-024-20', 'p0008', 'sanguozhi', 'a04-024', '《三國志·魏書二十四》', '從大司馬曹休征吳於夾石，禮諫以為不可深入，不從而敗。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-025-21', 'p0008', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '乆之，太祖遣都護曹洪平下辯，使毗與曹休參之，令曰：「昔高祖貪財好色，而良、平匡其過失。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-026-22', 'p0008', 'sanguozhi', 'a04-026', '《三國志·魏書二十六》', '秋，使曹休從廬江南入合肥，令寵向夏口。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-026-23', 'p0008', 'sanguozhi', 'a04-026', '《三國志·魏書二十六》', '寵上疏曰：「曹休雖明果而希用兵，今所從道，背湖旁江，易進難退，此兵之窪地也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-028-24', 'p0008', 'sanguozhi', 'a04-028', '《三國志·魏書二十八》', '後從曹休征吳，與賊遇於夾石，休軍失利，淩力戰決圍，休得免難。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-035-25', 'p0008', 'sanguozhi', 'a04-035', '《三國志·蜀書五》', '亮聞孫權破曹休，魏兵東下，關中虛弱。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-047-26', 'p0008', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '秋九月，魏乃命曹休、張遼、臧霸出洞口，曹仁出濡須，曹真、夏侯尚、張郃、徐晃圍南郡。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-047-27', 'p0008', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '曹休使臧霸以輕船五百、敢死萬人襲攻徐陵，燒攻城車，殺略數千人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-047-28', 'p0008', 'sanguozhi', 'a04-047', '《三國志·吳書二》', '夏五月，鄱陽太守周魴偽叛，誘魏將曹休。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-051-29', 'p0008', 'sanguozhi', 'a04-051', '《三國志·吳書六》', '江表傳曰：曹休出洞口，呂範率軍禦之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-055-30', 'p0008', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '曹仁出濡須，戰有功，又從攻破曹休，進位裨將軍，黃龍二年卒。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-055-31', 'p0008', 'sanguozhi', 'a04-055', '《三國志·吳書十》', '曹休出洞口，盛與呂範、全琮渡江拒守。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-056-32', 'p0008', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '曹休、張遼、臧霸等來伐，範督徐盛、全琮、孫韶等，以舟師拒休等於洞口。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-056-33', 'p0008', 'sanguozhi', 'a04-056', '《三國志·吳書十一》', '黃武七年，鄱陽太守周魴譎誘魏大司馬曹休，休將步騎十萬至皖城以迎魴。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-057-34', 'p0008', 'sanguozhi', 'a04-057', '《三國志·吳書十二》', '黃武元年，與呂範、賀齊等俱以舟師拒魏將曹休於洞口。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-058-35', 'p0008', 'sanguozhi', 'a04-058', '《三國志·吳書十三》', '七年，權使鄱陽太守周魴譎魏大司馬曹休，休果舉衆入皖，乃召遜假黃鉞，為大都督，逆休。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-058-36', 'p0008', 'sanguozhi', 'a04-058', '《三國志·吳書十三》', '陸機為遜銘曰：魏大司馬曹休侵我北鄙，乃假公黃鉞，統御六師及中軍禁衞而攝行王事，主上執鞭，百司屈膝。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-060-37', 'p0008', 'sanguozhi', 'a04-060', '《三國志·吳書十五》', '黃武初，魏使曹休來伐，齊以道遠後至，因住新市為拒。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-060-38', 'p0008', 'sanguozhi', 'a04-060', '《三國志·吳書十五》', '七年，權到皖，使琮與輔國將軍陸遜擊曹休，破之於石亭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-060-39', 'p0008', 'sanguozhi', 'a04-060', '《三國志·吳書十五》', '被命密求山中舊族名帥為北敵所聞知者，令譎挑魏大司馬揚州牧曹休。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0008-a04-062-40', 'p0008', 'sanguozhi', 'a04-062', '《三國志·吳書十七》', '黃武中，遣儀之皖就將軍劉邵，欲誘致曹休。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a03-074-0', 'p0009', 'houhanshu', 'a03-074', '《後漢書·卷七十四上》', '曹洪以馬與操，得夜遁，又為呂布所敗。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-1', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '太祖將迎天子，諸將或疑，荀彧、程昱勸之，乃遣曹洪將兵西迎，衞將軍董承與袁術將萇奴拒險，洪不得進。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-2', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '公之自舞陰還也，南陽、章陵諸縣復叛為繡，公遣曹洪擊之，不利，還屯葉，數為繡、表所侵。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-3', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '公乃留曹洪守，自將步騎五千人夜往，會明至。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-4', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '」乃使張郃、高覽攻曹洪。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-5', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '夏四月，留曹洪攻鄴，公自將擊楷，破之而還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-6', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '於是中軍師王凌、謝亭侯荀攸、前軍師東武亭侯鍾繇、左軍師涼茂、右軍師毛玠、平虜將軍華鄉侯劉勳、建武將軍清苑亭侯劉若、伏波將軍高安侯夏侯惇、揚武將軍都亭侯王忠、奮威將軍樂鄉侯劉展、建忠將軍昌鄉亭侯鮮于輔、奮武將軍安國亭侯程昱、太中大夫都鄉侯賈詡、軍師祭酒千秋亭侯董昭、都亭侯薛洪、南鄉亭侯董蒙、關內侯王粲、傅巽、祭酒王選、袁奐、王朗、張承、任藩、杜襲、中護軍國明亭侯曹洪、中領軍萬歲亭侯韓浩、行驍騎將軍安平亭侯曹仁、領護軍將軍王圖、長史萬潛、謝奐、袁霸等勸進曰：「自古三代，胙臣以土，受命中興，封秩輔佐，皆所以襃功賞德，為國藩衞也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-7', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '劉備遣張飛、馬超、吳蘭等屯下辯；遣曹洪拒之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-001-8', 'p0009', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '曹洪破吳蘭，斬其將任夔等。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-004-9', 'p0009', 'sanguozhi', 'a04-004', '《三國志·魏書四》', '秋七月，詔祀故大司馬曹真、曹休、征南大將軍夏侯尚、太常桓階、司空陳羣、太傅鍾繇、車騎將軍張郃、左將軍徐晃、前將軍張遼、右將軍樂進、太尉華歆、司徒王朗、驃騎將軍曹洪、征西將軍夏侯淵、後將軍朱靈、文聘、執金吾臧霸、破虜將軍李典、立義將軍龐德、武猛校尉典韋於太祖廟庭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-006-10', 'p0009', 'sanguozhi', 'a04-006', '《三國志·魏書六》', '太祖乃留曹洪守，自將步騎五千候夜潛往攻瓊。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-009-11', 'p0009', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '曹洪字子廉，太祖從弟也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-009-12', 'p0009', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '卞太后謂郭后曰：「令曹洪今日死，吾明日勑帝廢后矣。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-009-13', 'p0009', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '劉備遣將吳蘭屯下辯，太祖遣曹洪征之，以休為騎都尉，參洪軍事。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-009-14', 'p0009', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '太祖自至漢中，拔出諸軍，使真至武都迎曹洪等還屯陳倉。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-010-15', 'p0009', 'sanguozhi', 'a04-010', '《三國志·魏書十》', '驃騎將軍曹洪女有美色，粲於是娉焉，容服帷帳甚麗，專房歡宴。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-012-16', 'p0009', 'sanguozhi', 'a04-012', '《三國志·魏書十二》', '頃之，特進曹洪乳母當，與臨汾公主侍者共事無澗神繫獄。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-015-17', 'p0009', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '其後與曹洪破吳蘭於下辯，又與夏侯淵討宋建，別攻臨洮、狄道，平之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-015-18', 'p0009', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '時曹洪賔客在縣界，徵調不肯如法，沛先撾折其脚，遂殺之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-015-19', 'p0009', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '沛辭去，未到鄴，而軍中豪右曹洪、劉勳等畏沛，各遣家馳騎告子弟，使各自檢勑。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-017-20', 'p0009', 'sanguozhi', 'a04-017', '《三國志·魏書十七》', '與曹洪擊彊賊祝臂，破之，又與史渙擊袁紹運車於故市，功最多，封都亭侯。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-021-21', 'p0009', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '建安中都護曹洪欲使掌書記，瑀終不為屈。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-021-22', 'p0009', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '臣松之案魚氏典略、摯虞文章志並云瑀建安初辭疾避役，不為曹洪屈。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-021-23', 'p0009', 'sanguozhi', 'a04-021', '《三國志·魏書二十一》', '」驃騎將軍曹洪、輕車將軍王忠言：「將軍必欲使上將軍服肥，即自宜為瘦。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-025-24', 'p0009', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '乆之，太祖遣都護曹洪平下辯，使毗與曹休參之，令曰：「昔高祖貪財好色，而良、平匡其過失。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-025-25', 'p0009', 'sanguozhi', 'a04-025', '《三國志·魏書二十五》', '太祖遣都護曹洪禦超等，超等退還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a04-026-26', 'p0009', 'sanguozhi', 'a04-026', '《三國志·魏書二十六》', '時曹洪宗室親貴，有賔客在界，數犯法，寵收治之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0009-a05-013-27', 'p0009', 'jinshu', 'a05-013', '《晉書·卷十三》', '七年正月，驃騎將軍曹洪免為庶人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0010-a04-018-0', 'p0010', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '授聘兵，使與曹純追討劉備於長阪。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0011-a04-044-0', 'p0011', 'sanguozhi', 'a04-044', '《三國志·蜀書十四》', '琬出類拔萃，處羣僚之右，旣無戚容，又無喜色，神守舉止，有如平日，由是衆望漸服，延熈元年，詔琬曰：「寇難未弭，曹叡驕凶，遼東三郡苦其暴虐，遂相糾結，與之離隔。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0012-a04-064-0', 'p0012', 'sanguozhi', 'a04-064', '《三國志·吳書十九》', '夫以曹芳闇劣，而政在私門，彼之臣民，固有離心。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0013-a04-048-0', 'p0013', 'sanguozhi', 'a04-048', '《三國志·吳書三》', '故淮南三叛而腹心不擾，曹髦之死，四方不動，摧堅敵如折枯，蕩異同如反掌，任賢使能，各盡其心，非智勇兼人，孰能如之？');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a03-070-0', 'p0015', 'houhanshu', 'a03-070', '《後漢書·卷七十》', '彧將往，東郡太守夏侯惇等止之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a03-073-1', 'p0015', 'houhanshu', 'a03-073', '《後漢書·卷七十三》', '疇上疏自陳，太祖令夏侯惇喻之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a03-075-2', 'p0015', 'houhanshu', 'a03-075', '《後漢書·卷七十五》', '魏志曰：「夏侯惇字元讓，沛國譙人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-3', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '吳人作曹瞞傳及郭頒世語並云：嵩，夏侯氏之子，夏侯惇之叔父。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-4', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '太祖兵少，乃與夏侯惇等詣揚州募兵，刺史陳溫、丹楊太守周昕與兵四千餘人。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-5', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '」呂布復為袁術使高順攻劉備，公遣夏侯惇救之，不利。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-6', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '於是中軍師王凌、謝亭侯荀攸、前軍師東武亭侯鍾繇、左軍師涼茂、右軍師毛玠、平虜將軍華鄉侯劉勳、建武將軍清苑亭侯劉若、伏波將軍高安侯夏侯惇、揚武將軍都亭侯王忠、奮威將軍樂鄉侯劉展、建忠將軍昌鄉亭侯鮮于輔、奮武將軍安國亭侯程昱、太中大夫都鄉侯賈詡、軍師祭酒千秋亭侯董昭、都亭侯薛洪、南鄉亭侯董蒙、關內侯王粲、傅巽、祭酒王選、袁奐、王朗、張承、任藩、杜襲、中護軍國明亭侯曹洪、中領軍萬歲亭侯韓浩、行驍騎將軍安平亭侯曹仁、領護軍將軍王圖、長史萬潛、謝奐、袁霸等勸進曰：「自古三代，胙臣以土，受命中興，封秩輔佐，皆所以襃功賞德，為國藩衞也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-7', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '三月，王引軍還，留夏侯惇、曹仁、張遼等屯居巢。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-8', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '」　魏氏春秋曰：夏侯惇謂王曰：「天下咸知漢祚已盡，異代方起。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-9', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '」　曹瞞傳及世語並云桓階勸王正位，夏侯惇以為宜先滅蜀，蜀亡則吳服，二方旣定，然後遵舜、禹之軌，王從之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-001-10', 'p0015', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '孫盛評曰：夏侯惇恥為漢官，求受魏印，桓階方惇，有義直之節；考其傳記，世語為妄矣。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-002-11', 'p0015', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '已卯，以前將軍夏侯惇為大將軍。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-002-12', 'p0015', 'sanguozhi', 'a04-002', '《三國志·魏書二》', '庚午，大將軍夏侯惇薨。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-003-13', 'p0015', 'sanguozhi', 'a04-003', '《三國志·魏書三》', '夏五月壬申，詔祀故大將軍夏侯惇、大司馬曹仁、車騎將軍程昱於太祖廟庭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-007-14', 'p0015', 'sanguozhi', 'a04-007', '《三國志·魏書七》', '太祖遣夏侯惇救備，為順所敗。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-008-15', 'p0015', 'sanguozhi', 'a04-008', '《三國志·魏書八》', '武皇帝意沮，便欲拔軍截山而還，遣故大將軍夏侯惇、將軍許褚呼山上兵還。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-009-16', 'p0015', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '夏侯惇字元讓，沛國譙人，夏侯嬰之後也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-009-17', 'p0015', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '夏侯惇聞其名，請與相見，大奇之，使領兵從征伐。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-009-18', 'p0015', 'sanguozhi', 'a04-009', '《三國志·魏書九》', '夏侯惇薨，以休為鎮南將軍，假節都督諸軍事，車駕臨送，上乃下輿執手而別。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-010-19', 'p0015', 'sanguozhi', 'a04-010', '《三國志·魏書十》', '彧知邈為亂，即勒兵設備，馳召東郡太守夏侯惇，而兖州諸城皆應布矣。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-011-20', 'p0015', 'sanguozhi', 'a04-011', '《三國志·魏書十一》', '疇素與夏侯惇善，太祖語惇曰：「且往以情喻之，自從君所言，無告吾意也。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-015-21', 'p0015', 'sanguozhi', 'a04-015', '《三國志·魏書十五》', '建安二十二年，與夏侯惇、臧霸等征吳。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-016-22', 'p0015', 'sanguozhi', 'a04-016', '《三國志·魏書十六》', '太祖遣夏侯惇討之，未至。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-018-23', 'p0015', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '劉表使劉備北侵，至葉，太祖遣典從夏侯惇拒之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-018-24', 'p0015', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '後權乞降，太祖還，留霸與夏侯惇等屯居巢。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-018-25', 'p0015', 'sanguozhi', 'a04-018', '《三國志·魏書十八》', '後屬夏侯惇，數斬首有功，拜司馬。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-022-26', 'p0015', 'sanguozhi', 'a04-022', '《三國志·魏書二十二》', '夏侯惇為陳留太守，舉臻計吏，命婦出宴，臻以為「末世之俗，非禮之正」。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-032-27', 'p0015', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '布遣高順攻之，曹公遣夏侯惇往，不能救，為順所敗，復虜先主妻子送布。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-032-28', 'p0015', 'sanguozhi', 'a04-032', '《三國志·蜀書二》', '使拒夏侯惇、于禁等於博望。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0015-a04-036-29', 'p0015', 'sanguozhi', 'a04-036', '《三國志·蜀書六》', '先是，與夏侯惇戰於博望，生獲夏侯蘭。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0016-a03-009-0', 'p0016', 'houhanshu', 'a03-009', '《後漢書·卷九》', '冬十月，曹操遣將夏侯淵討宋建于枹罕，獲之。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0016-a03-072-1', 'p0016', 'houhanshu', 'a03-072', '《後漢書·卷七十二》', '曹操因遣夏侯淵擊建，斬之，涼州悉平。');
INSERT INTO excerpts (id, person_id, work, source, citation, quote) VALUES ('p0016-a04-001-2', 'p0016', 'sanguozhi', 'a04-001', '《三國志·魏書一》', '太原商曜等以大陵叛，遣夏侯淵、徐晃圍破之。');
