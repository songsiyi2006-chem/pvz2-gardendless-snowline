// The catalogue, geometry, target choice and timing are shared by the UI and combat.
const gardenModes = (() => {
  const MODE_DATA = "peashooter 豆列齐射/line/dart 跳荚点名/chain/mark 破壳狙击/focus/crack\nsunflower 蜂群授粉/harvest/sun 晨光病房/rescue/mend 日斑灼印/bounty/ember\nwallnut 护城壳阵/relay/ward 碎壳钉床/trap/pierce 坚果担架/cover/mend\npotatomine 十字爆芯/cross/blast 延时雷床/field/burntrail 定向穿甲/line/crack\ncabbagepult 弹跳菜芯/chain/dart 高抛破营/back/blast 菜叶封路/field/stagger\nbloomerang 双翼截线/flank/slice 折返回镖/back/pierce 回旋收割/cull/execute\niceburg 冻结方阵/shell/freeze 地下冰床/field/slow 脆冰追索/chain/shatter\nbonkchoy 隔山打牛/line/shove 寸劲碎甲/focus/crack 护卫拳套/escort/stagger\nrepeater 双列掩护/flank/dart 双膛点杀/focus/pierce 跳豆引爆/chain/burst\nmegagatling 转管扫巷/fan/dart 热机穿心/line/burntrail 链齿碎盔/focus/crack\nscaredyshroom 退路烟幕/trap/spore 远哨冷箭/back/pierce 菌伞藏身/cover/ward\nfumeshroom 菌雾截面/net/spore 肺泡连染/chain/venom 空囊推浪/line/shove\ngravebuster 墓园金窖/harvest/sun 遗址苗床/field/spore 石刻护符/relay/guard\npumpkin 瓤内暖房/relay/mend 破甲南瓜钉/trap/crack 金瓤急救/rescue/ward\npvine 结荚补给/relay/haste 豌豆光栅/line/beam 蔓间跳针/chain/dart\nfloawerPot 空中缆绳/rescue/ward 悬盆截击/net/dart 空投花圃/yield/sun\nfirepeashooter 凝焰贯穿/line/ember 燃壳追火/chain/burntrail 热浪壕沟/field/ember\nthreepeater 三路破口/fan/crack 交叉火力/cross/dart 侧翼瞄准/flank/mark\nprimalpeashooter 巨砾冲阵/line/shove 石核破甲/focus/crack 碎石滩头/trap/stagger\nxshot 四角回旋/flank/slice 纵轴封锁/net/dart 螺旋猎手/cull/pierce\nhomingthistle 追踪倒刺/focus/pierce 折返刺网/chain/mark 后排针雨/back/dart\nstarfruit 星轨交叉/cross/beam 星链导电/chain/spark 陨星集束/focus/burst\nshootingstarfruit 天顶落星/net/blast 双落点/back/burst 流星航道/field/mark\nlilypad 浮叶渡桥/relay/haste 水面救生/rescue/ward 水纹拦网/trap/slow\nsunshroom 菌盖梯田/harvest/sun 三潮孢光/yield/sun 夜光回收/bounty/spore\ntwinsunflower 双瓣储光/yield/sun 共生温床/cover/haste 金葵猎赏/bounty/beam\ndragonbruit 果籽火幕/fan/ember 炽芯轰鸣/shell/blast 熔壳猎手/focus/burntrail\nmoonflower 新月潮汐/relay/haste 月食虹吸/escort/drain 月华花田/harvest/sun\nsnowpea 整列霜线/line/slow 冰晶折返/chain/shatter 冰路栅栏/trap/freeze\nlightningreed 逐级电弧/chain/spark 接地电网/field/stagger 雷电钻盔/focus/crack\nkernelpult 奶油栅栏/net/butter 玉米爆花/shell/burst 粒仓接济/cover/haste\nmeteorflower 流星群坑/field/blast 燃星狙击/back/ember 陨核断甲/focus/crack\nspringbean 弹板夹道/trap/shove 弹簧纵队/line/shove 双侧弹弓/flank/stagger\numbrellaleaf 伞翼护阵/cover/ward 侧风伞骨/flank/shove 旋伞飞刃/cross/slice\nmelonpult 瓜瓤扩散/shell/blast 瓜籽跳弹/chain/dart 重瓜压阵/focus/stagger\nwintermelon 寒瓜冻床/field/freeze 碎冰瓜籽/chain/shatter 雪瓜门闩/net/slow\nblover 狭道强风/line/shove 十字风剪/cross/slice 风眼停驻/field/stagger\nspikeweed 道钉封锁/line/pierce 钩刺陷阱/trap/slow 放血针脚/cull/venom\nspikerock 岩刃齿列/net/crack 钢齿破靴/trap/pierce 锥石震裂/cross/blast\nchomper 双向嚼击/flank/drain 嘴边陷坑/trap/execute 反哺根系/escort/pierce\nglaciershroom 大陆冰架/net/freeze 雪崩裂隙/cross/shatter 冰穴滞留/field/slow\nprimalwallnut 盾墙回顶/line/shove 岩盖掩体/relay/guard 重砾沼沟/trap/stagger\nbuttercup 飞溅奶油/shell/butter 奶油脚印/field/slow 黄油救护/escort/butter\nbanana 碉堡穿针/focus/crack 香蕉散射/fan/blast 弹坑雷达/field/mark\nmissiletoe 极地双标/back/freeze 冰锥竖井/net/pierce 飞雪裂头/shell/shatter\ncherry_bomb 双核殉爆/chain/blast 樱桃火墙/line/ember 坠樱禁区/field/burst\ndoomshroom 菌云余震/field/blast 地心钻孔/focus/pierce 毁灭断层/cross/crack\ncranjelly 果冻围堰/net/slow 酸莓浸泡/field/venom 潮汐弹颤/shell/shove\ntorchwood 长明烽火/relay/haste 炭道红线/line/ember 火屑复燃/field/burntrail\njalapeno 火龙横贯/line/burntrail 辣籽散落/field/ember 双翼焦线/flank/ember\npuffshroom 菌丝连片/chain/spore 袖珍伏兵/trap/venom 孢雾哨点/cover/ward\ngloomvine 暗蔓回输/relay/mend 影织阻网/net/slow 寄生回响/escort/drain\nvamporcini 血菌缝合/escort/drain 菌伞血宴/shell/drain 残血嗅踪/cull/execute\nprimalpotatomine 三角雷簇/fan/blast 史前雷床/field/crack 嵌甲爆芯/focus/blast\ncactus 刺林列阵/net/pierce 地下刺阱/trap/crack 贯空飞针/back/dart\npowerlily 莲房调频/cover/haste 莲心庇护/rescue/ward 生机溢光/yield/sun\ncoconutcannon 椰壳破城/focus/crack 散片轰滩/shell/blast 双舷炮位/flank/blast\npeapod 五荚贯巷/line/burst 活荚连跳/chain/dart 菌圃伴射/relay/haste\nsnapdragon 龙息扇面/fan/ember 灰烬地毯/field/burntrail 齿间熔甲/focus/crack\ngatling 四管交火/cross/dart 高转穿甲/focus/pierce 横扫护航/escort/burst\nsplitpea 后方保险/back/pierce 双向夹击/flank/dart 分瓣反跳/chain/burst\nchilibean 豆气疫链/chain/venom 胀气雷区/trap/stagger 营养回收/bounty/spore\ntallnut 城垛罩护/relay/ward 高墙救援/rescue/guard 坚壳撞角/line/shove\nhurrikale 暴风修枝/cross/shove 冷锋走廊/line/slow 气旋驻留/field/stagger\nstallia 花粉减速带/field/slow 花瓣缠足/shell/stagger 香气救护/cover/cleanse\nelectricpeashooter 豆荚电网/net/spark 逐级放电/chain/spark 电荷终结/cull/beam\nsquash 跳石压阵/shell/blast 二次踏地/field/stagger 独力摧甲/focus/crack\ngloomshroom 同心毒幕/field/spore 菌孔十字/cross/venom 腐殖收割/cull/drain\nmagnifyinggrass 聚焦切面/focus/beam 棱面分光/fan/beam 光能回款/bounty/pierce\ncelerystalker 伏芹回刺/trap/pierce 双翼背袭/flank/slice 嫩芯收割/cull/execute\nsapfling 树脂池塘/field/slow 黏胶列阵/net/butter 琥珀追印/chain/mark\nparsnip 双钳包抄/flank/slice 钳齿断甲/focus/crack 护甲钳卫/escort/shove\nexplodeonut 炸壳路障/trap/blast 壳片十字/cross/pierce 坚果救护/rescue/guard\ngrapeshot 葡萄跳火/chain/burst 葡萄弹幕/fan/blast 果汁引信/field/burntrail\nplantern 透雾光栅/net/mark 灯芯聚焦/focus/beam 巡夜守灯/rescue/ward\npeach 桃露满园/cover/mend 桃核急方/rescue/cleanse 桃枝春晖/relay/haste\njackolantern 烛芯灼穿/line/burntrail 燃灯结界/field/ember 炉心回暖/cover/cleanse\ndandelion 顺风播种/back/dart 绒球中继/chain/mark 花伞掩护/cover/ward\nchardguard 菜柄路闸/trap/shove 叶扇侧击/flank/shove 护苗菜棚/relay/guard\nhypnoshroom 梦孢接触/chain/butter 梦游回廊/field/stagger 梦境安抚/cover/cleanse\nelectriccurrant 横向电闸/net/spark 电弧折线/chain/beam 边路电击/flank/stagger\nescaperoot 树根接应/rescue/guard 撤离通道/relay/haste 空根地雷/trap/blast\nshadowshroom 墨孢接力/chain/spore 毒影地毯/field/venom 暗墨回春/escort/drain\nmagnetshroom 磁针钻甲/focus/crack 极靴弹片/shell/pierce 磁滞横栏/net/stagger\nturnip 白根楔阵/trap/shove 萝卜担架/rescue/mend 楔形突击/line/pierce\nempea 串联短路/chain/stagger 脉冲截面/net/spark 过载熔盔/focus/crack\ncitron 聚能穿舰/line/beam 余电连锁/chain/spark 脉冲弹坑/field/blast\nlaser_bean 爆炸激光/laser/explosion 三线激光/laser/triple 极快激光/laser/rapid\nsolartomato 番茄电池/harvest/sun 红光催收/bounty/stagger 阳焰筛网/net/ember\npowerplant_alpha 甲纹前哨/relay/guard 甲纹雷域/trap/spark 甲纹急援/rescue/ward\npowerplant_beta 乙纹时钟/cover/haste 乙纹虹路/line/beam 乙纹光窖/yield/sun\npowerplant_gamma 丙纹温床/cover/mend 丙纹返流/escort/drain 丙纹荆环/cross/pierce\npowerplant_delta 丁纹庇护/relay/ward 丁纹狭道/line/stagger 丁纹救场/rescue/haste\npowerplant_epsilon 戊纹集光/harvest/sun 戊纹赏格/bounty/beam 戊纹隔离/net/freeze\nholonut 影盾救场/rescue/ward 折光壁垒/line/beam 散影反击/shell/burst\npowerplant 五色共生/cover/haste 母线分叉/fan/beam 土壤蓄电/field/spark\nmarigold 花圃分红/harvest/sun 金盏三收/yield/sun 金铃义诊/cover/mend\napplemortar 果核三角/fan/stagger 苹果围轰/shell/blast 重果破甲/focus/crack\nredstinger 绯针贯列/line/pierce 红蕊掩体/rescue/ward 三瓣急射/fan/dart\nskyshooter 侧风机炮/flank/dart 制空俯冲/back/burst 航线导标/net/mark\nsunbean 豆壳悬赏/bounty/pierce 金豆散播/harvest/sun 豆芽晨露/cover/mend\npeanut 花生垛口/relay/guard 双孔弹道/flank/dart 硬壳起爆/trap/burst\ntanglekelp 锚网收紧/net/stagger 沉船拖带/chain/shove 暗潮绞索/trap/pierce\nbowlingbulb 球道中线/line/shove 撞柱跳球/chain/burst 横排全倒/net/stagger\nguacodile 鳄群夹击/flank/slice 鳄口撕甲/focus/crack 潜水伏咬/trap/execute\nghostpepper 鬼火游链/chain/burntrail 幽焰余温/field/ember 灯影收魂/bounty/drain\nsweetpotato 香薯屏障/relay/guard 甜香诱阵/field/slow 糖衣急救/rescue/mend\npepperpult 胡椒扇射/fan/ember 暖棚护理/cover/cleanse 椒籽留火/field/burntrail\nhotpotato 解冻热敷/cover/cleanse 薯皮蓄热/relay/haste 热斑熔层/field/ember\nstunion 连环泪腺/chain/stagger 辛雾栅栏/net/slow 洋葱爆心/shell/burst\ngoldleaf 金叶井田/harvest/sun 分期光票/yield/sun 金叶契印/bounty/mark\nakee 多段弹跳/chain/dart 甲叶钻头/focus/pierce 后排开枝/back/burst\nendurian 榴壳钉墙/trap/pierce 榴刺矩阵/cross/crack 榴房掩护/relay/guard\ntoadstool 蟾舌悬赏/bounty/drain 金舌救生/escort/pierce 蟾口连吞/cull/execute\nlavaguava 地热蓄火/field/burntrail 火山横剖/net/ember 炽心裂甲/focus/crack\nphatbeet 低频震场/shell/stagger 节拍音轨/line/shove 共振返拍/cover/haste\nstrawburst 熟莓重炮/focus/blast 草莓散浆/shell/burst 酸汁禁道/field/slow\nthymewarp 时间停摆/net/stagger 时针回拨/line/shove 逆时急救/rescue/cleanse\nseashroom 潮床熏染/field/spore 潮沟菌索/chain/venom 珊瑚护帘/relay/guard\ngarlic 蒜瓣侧拨/flank/shove 蒜香熏阵/field/stagger 蒜苗护佑/cover/ward\nelectricblueberry 定点雷云/focus/spark 游云传导/chain/spark 雷柱截面/net/beam\nsporeshroom 孢群互传/chain/spore 落孢菌田/field/venom 菌落收割/cull/execute\nintensivecarrot 术后回访/rescue/mend 胡萝卜输液/relay/haste 无菌苗床/cover/cleanse\nprimalsunflower 琥珀储藏/harvest/sun 原野日潮/yield/sun 巨葵护航/escort/ember\nmoonbean 月弧两翼/flank/slow 月蚀光柱/line/beam 月潮反哺/escort/drain\ncoldsnapdragon 双翼霜息/flank/freeze 冰鳞裂响/shell/shatter 霜牙门廊/trap/slow\nnightshade 暗叶割阵/cross/slice 夜刺穿心/focus/pierce 暮影收割/cull/execute\ndusklobber 暮色三抛/fan/burst 暗果播场/field/spore 黄昏点名/back/mark\ngrimrose 玫瑰暗井/trap/drain 墨根反哺/escort/pierce 死线剪花/cull/execute\ngoldbloom 金粉连放/yield/sun 聚光花圃/harvest/sun 赏金花蜜/bounty/ember\nbloominghearts 心瓣飞链/chain/mark 花心反哺/escort/pierce 同心援护/rescue/mend\nshrinkingviolet 微缩禁区/field/slow 紫罗兰收割/cull/execute 迷你绊索/chain/stagger\nhotdate 蜜枣焦坑/trap/burntrail 糖焰包围/shell/ember 蜜甲守望/rescue/guard\nfiregourd 火油葫芦/field/burntrail 细口焰枪/line/ember 葫芦爆胆/shell/blast\nbambooshoot 竹节穿巷/line/pierce 竹根伏击/trap/slice 竹笋连弹/chain/dart\nsnowdrop 雪幕竖帘/net/slow 晶滴裂阵/chain/shatter 雪盏护芽/rescue/ward\nlychee 荔核蓄雷/focus/spark 荔枝电链/chain/beam 果壳电场/field/stagger\nperfumeshroom 花香慢雾/field/slow 催眠香链/chain/butter 香氛净房/cover/cleanse\nsolarsage 日冕收成/bounty/beam 光圈疗养/cover/mend 逐次献光/yield/sun\nbamboozle 竹筒暗栓/trap/stagger 空竹连锁/chain/burst 乱竹截线/net/pierce\ncantaloupe 甜瓜破城/focus/crack 金瓤交叉/cross/burst 熟瓜金库/bounty/blast\niceweed 冰钉狭径/line/slow 断冰伏阵/trap/shatter 冻土寒床/field/freeze\npinkstarfruit 天使援手/rescue/mend 星翼飞斩/flank/slice 五角祈愿/cover/ward\nicebloom 永冻截面/net/freeze 冰花三绽/field/shatter 雪帽庇护/cover/guard\nzoybeanpod 豆腐护送/escort/mark 豆荚供给/relay/haste 绿营防线/trap/stagger\npyrevine 寄焰护罩/relay/guard 藤火燃床/field/burntrail 藤芯热枪/line/ember\nshinevine 藤间集光/harvest/sun 光袋接济/relay/haste 晶藤悬赏/bounty/beam\natombomb_seedling 逐核裂变/chain/blast 临界火区/field/burntrail 垂直爆压/net/crack\nhollyknight 冬青盾墙/relay/guard 骑士冲锋/line/shove 叶矛侧击/flank/pierce\naloe 全圃换药/cover/cleanse 急诊芦荟/rescue/mend 绿胶壁垒/relay/ward\ncaulipower 脑波接力/chain/stagger 突触静场/field/butter 精神汲取/escort/drain\ngumnut 胶层横坝/net/slow 树胶伏网/trap/stagger 胶果弹回/chain/shove\nreinforcemint 防务走廊/relay/guard 临阵护符/rescue/ward 坚阵反击/field/pierce\nenlightenmint 黎明花海/harvest/sun 三次日出/yield/sun 光明抚育/cover/haste\nwintermint 极夜冰原/field/freeze 冰棱连击/chain/shatter 冷锋隔断/net/slow\nspearmint 连排荆枪/line/pierce 荆棘捕夹/trap/crack 枪尖收割/cull/execute\nappeasemint 弹道同步/fan/dart 豆射中继/relay/haste 排火校准/net/mark\nenforcemint 擂台围困/shell/stagger 护拳出击/escort/shove 拳锋碎甲/focus/crack\npeppermint 热辣焰带/line/ember 椒灰复燃/field/burntrail 滚焰跳籽/chain/blast\nbombardmint 弹仓连锁/chain/blast 预置弹坑/trap/burst 爆压断面/net/crack\nconcealmint 暗笼密布/field/drain 影卫接应/rescue/ward 暗刃收割/cull/pierce\nailmint 疫点传递/chain/spore 腐毒积层/field/venom 毒发清场/cull/shatterPoison\nenchantmint 迷梦光圈/shell/butter 法杖点名/focus/beam 魔法照护/cover/cleanse\nfilamint 跨距电弧/chain/spark 回路接地/net/stagger 强流刺穿/line/beam\ncontainmint 减速路堤/field/slow 止步电闸/net/stagger 阻敌回推/line/shove\narmamint 三角齐射/fan/blast 高抛标定/back/mark 弹坑禁行/field/burst\nseashooter 潮线连珠/line/dart 漩涡跳豆/chain/shove 潮池回弹/field/burst\nshadowpeashooter 影束穿心/line/pierce 蔓底暗猎/trap/drain 追魂暗荚/cull/execute\nmurkadamia 黑胶蓄池/field/slow 暗壳回输/escort/drain 果盾救援/rescue/guard\nnoctarine 暮雾孢田/field/spore 油桃引燃/shell/burntrail 夜香暗赏/bounty/venom\nsnappea 掘地猎口/trap/execute 跳豆反击/chain/dart 双颚输血/escort/drain\nasparagus 飞行编队/flank/pierce 对地俯射/back/blast 护航机翼/escort/dart\npineapple 旋盾挡拆/relay/guard 菠萝转刃/cross/slice 回旋冲浪/line/shove\nanthurium 红掌电门/net/spark 双极夹击/flank/beam 离子停摆/field/stagger\nbulbkekengi 灯芯连燃/chain/burntrail 灯笼热壕/field/ember 鬼灯引航/back/mark\nloquat 枇杷涡眼/shell/shove 潮旋驻地/field/slow 汲水回甘/escort/drain\npeacommando 突击排火/line/dart 弹跳侧攻/chain/burst 深入破甲/back/crack\nwasabiwhip 辣鞭穿列/line/ember 回鞭两侧/flank/slice 芥末伏击/trap/burntrail\npoisonpeashooter 毒腺串联/chain/venom 黏豆遗毒/field/spore 终末溶甲/cull/shatterPoison\ndarkmatterdragonfruit 暗核切面/net/beam 蜷缩星云/field/slow 质量汲取/escort/drain\nmirrornut 镜壁反射/line/beam 分光盾列/flank/mark 镜面庇护/relay/ward\ninferno 地狱热柱/net/ember 炽流推浪/line/shove 留焰结界/field/burntrail\nslingpea 散荚齐抛/fan/dart 豆荚跳抛/chain/burst 点射远垒/back/pierce\nchillypepper 霜焰走廊/line/freeze 辣冰碎心/focus/shatter 残霜警戒/field/slow\nwitchhazel 金缕连咒/chain/butter 月镰收割/cull/execute 女巫秘药/rescue/cleanse\nblastberry 莓藤伴射/relay/haste 蔓果雷阵/trap/blast 莓籽群爆/shell/burst\nturkeypult 火鸡前卫/escort/stagger 投鸟侧翼/flank/dart 行军补给/relay/mend\nstickybombrice 米团黏阵/field/butter 飘米散爆/shell/blast 三线米炮/fan/burst\nlotorpedo 鱼雷航道/line/blast 声呐弹跳/chain/mark 双管潜射/flank/pierce\naquavine 潮藤救护/rescue/ward 水脉传能/relay/haste 海沟绞索/trap/shove\nbuduhboom 水珠连爆/chain/blast 玉露溃流/cross/shove 爆浆余池/field/slow";
  const routes = {
    line:'贯穿本行前方最多六敌',
    fan:'从本行和相邻两行各选一名前方敌人',
    flank:'分别攻击上下相邻行中最靠近房屋的一敌',
    cross:'以近处敌人为中心，攻击与它同排或同列、两格内最多五敌',
    shell:'以三行内最密集的敌人为中心，攻击周围一格内最多四敌',
    net:'锁定三行内敌人最密集的一列，攻击该列各行最多五敌',
    chain:'从近敌起跳，每隔 0.35 秒跳向两格内另一敌，最多四段',
    focus:'锁定三行内体力最高者，在 0、0.8、1.6 秒各出手一次；目标倒下后转移火力',
    back:'锁定三行最后方的两敌，先击后一名，1 秒后折返攻击另一名',
    field:'在三行内敌群密集处留下 3 秒阵地，立即及每隔 1.5 秒攻击范围一格内最多三敌',
    trap:'守候脚下两格 6 秒，首敌进入后引发伏击，波及它周围一格内最多三敌',
    cull:'先攻三行内体力比例最低的一敌；若该目标死亡，立刻转攻下一敌，最多连续三名',
    cover:'为周围两格内生命比例最低的三株植物提供支援',
    relay:'沿本行向后接力，照顾同格与后方最多三株友军；同格优先宿主',
    rescue:'守望周围两格 6 秒，优先救助生命比例最低的受伤友株；2 秒后再次回访',
    escort:'打击三行最靠近房屋的一敌，同时为周围两格最需要照顾的友株恢复其最大生命的 5%',
    harvest:'按周围两格的友株数收成，基础 25 阳光，每株另加 10 点，最多计五株。产量受伤害加成影响。',
    yield:'从原格立即及 2、4 秒后各结出 20 点阳光。产量受伤害加成影响。',
    bounty:'瞄准三行内生命比例最低的一敌；3 秒内击杀它，另收获 65 点阳光。产量受伤害加成影响。'
  };
  const effects = {
    mark:'测距标记并放大后续升阶直伤',dart:'种针打击',slice:'割伤，残血目标受到额外伤害',
    pierce:'穿甲打击',beam:'射线伤害',ember:'火焰伤害',shatter:'对着凉或冻结者造成更高伤害',
    shatterPoison:'对中毒者造成更高伤害',execute:'对体力低于三分之一的目标追加伤害',
    crack:'优先破坏护甲',burst:'弹片溅射',blast:'爆炸溅射',spark:'附带一次近距离电弧传导',
    venom:'施加持续伤害的毒素',spore:'施加可传染孢毒',burntrail:'立即灼烧并在 1.5 秒后再次灼烧',
    stagger:'短暂眩晕',butter:'以黄油固定目标',slow:'施加寒冷减速',freeze:'冻结',
    shove:'击退',drain:'穿甲吸血',mend:'治疗并额外恢复受益者 5% 最大生命',
    ward:'短时无敌',guard:'闪光护盾',haste:'缩短受益者的原生攻击冷却',cleanse:'驱散部分眩晕和音箱干扰并治疗'
  };
  const laser = {
    explosion:'每发普通激光在本行首个命中点引爆。爆心周围一格内的敌人再受一次相当于本发激光的爆炸伤害。',
    triple:'每次普通射击同时贯穿本行和上下相邻行；只要三行任一行有可击中的僵尸或墓碑即可开火，每行均造成完整普通激光伤害。',
    rapid:'普通激光射速额外提高 500%，即原射速的 6 倍。此倍率与升阶、全园攻速相乘。'
  };
  const entries = new Map();
  for(const line of MODE_DATA.trim().split('\n')){
    const [id,...encoded]=line.trim().split(/\s+/);
    const options=encoded.map(item=>{
      const [name,route,effect]=item.split('/');
      const detail=effects[effect];
      const description=route==='laser'?laser[effect]:'随本株升阶主招发动。'+routes[route]+(detail?(route==='bounty'?'攻击效果为':'，效果为')+detail+'。':'');
      return Object.freeze({name,route,effect,description});
    });
    entries.set(id,Object.freeze(options));
  }
  const options=id=>entries.get(id)||[];
  function speedFactor(id,index){return id==='laser_bean'&&index===2?6:1;}
  function cast(option,env){
    if(!option||option.route==='laser')return;
    const {loc}=env;
    const {route,effect}=option;
    const foes=()=>env.foes().filter(a=>env.live(a));
    const allies=()=>env.allies().filter(a=>env.live(a));
    const coord=a=>({r:env.row(a),c:env.col(a)});
    const dx=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.c-b.c));
    const dist=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
    const near=(z,at=loc)=>dist(at,coord(z));
    const byNear=(a,b)=>near(a)-near(b)||env.col(a)-env.col(b)||env.row(a)-env.row(b);
    const three=()=>foes().filter(z=>Math.abs(env.row(z)-loc.r)<=1);
    const friendly=()=>allies().filter(z=>dx(loc,coord(z))<=2);
    const weakest=(a,b)=>env.ratio(a)-env.ratio(b)||byNear(a,b);
    const urgent=()=>friendly().filter(z=>z.health<z.toughness).sort(weakest);
    const act=(target,power=1,place=loc)=>{
      if(!target||!env.live(target))return;
      if(effect==='mend')target.heal(.05*target.toughness);
      env.effect(effect,target,power,place);
    };
    const groupAnchor=()=>{
      const available=three();let best=null,score=-Infinity;
      for(const z of available){
        const pos=coord(z),value=env.density(z)*1024-near(z);
        if(value>score){score=value;best=pos;}
      }
      return best||loc;
    };
    const zone=(at,max,power)=>{
      const hits=foes().filter(z=>dx(at,coord(z))<=1).sort((a,b)=>near(a,at)-near(b,at)||byNear(a,b));
      for(const z of hits.slice(0,max))act(z,power,env.tile(at)||loc);
    };
    switch(route){
      case 'line':{
        const line=foes().filter(z=>env.row(z)===loc.r&&env.col(z)>=loc.c).sort(byNear);
        line.slice(0,6).forEach(z=>act(z,.93));break;
      }
      case 'fan':case 'flank':{
        const all=foes();
        for(const r of (route==='fan'?[loc.r,loc.r-1,loc.r+1]:[loc.r-1,loc.r+1])){
          const z=all.filter(z=>env.row(z)===r&&(route==='flank'||env.col(z)>=loc.c)).sort((a,b)=>env.col(a)-env.col(b))[0];
          act(z,route==='flank'?1.22:1);
        }
        break;
      }
      case 'cross':{
        const z=three().sort(byNear)[0];if(!z)break;const at=coord(z);
        foes().filter(b=>(env.row(b)===at.r||env.col(b)===at.c)&&dx(at,coord(b))<=2)
          .sort((a,b)=>near(a,at)-near(b,at)).slice(0,5).forEach(b=>act(b,.98));break;
      }
      case 'shell':zone(groupAnchor(),4,1.15);break;
      case 'net':{
        const counts=new Map();for(const z of three())counts.set(env.col(z),(counts.get(env.col(z))||0)+1);
        const best=Array.from(counts).sort((a,b)=>b[1]-a[1]||Math.abs(a[0]-loc.c)-Math.abs(b[0]-loc.c))[0];
        if(best)foes().filter(z=>env.col(z)===best[0]).sort(byNear).slice(0,5).forEach(z=>act(z,1));break;
      }
      case 'chain':{
        const used=new Map();let from=loc;
        function jump(n){
          const z=(n===0?three():foes().filter(b=>dx(coord(b),from)<=2)).filter(b=>!used.has(b)||used.get(b)!==env.generation(b))
            .sort((a,b)=>near(a,from)-near(b,from)||byNear(a,b))[0];
          if(!z)return;
          used.set(z,env.generation(z));const point=coord(z);act(z,1.30-n*.13,env.tile(from)||loc);from=point;
          if(n<3)env.after(.35,()=>jump(n+1));
        }
        jump(0);break;
      }
      case 'focus':{
        let target,identity;
        const shoot=()=>{
          const pool=three();
          if(!target||env.generation(target)!==identity||!pool.includes(target)){target=pool.sort((a,b)=>b.health-a.health||byNear(a,b))[0];identity=target&&env.generation(target);}
          act(target,1.10);
        };
        shoot();env.after(.8,shoot);env.after(1.6,shoot);break;
      }
      case 'back':{
        const list=three().sort((a,b)=>env.col(b)-env.col(a)||byNear(a,b));
        const second=list[1],identity=second&&env.generation(second);act(list[0],1.55);
        if(second)env.after(1,()=>{if(identity===env.generation(second)&&three().includes(second))act(second,1.55);});break;
      }
      case 'field':{
        const at=groupAnchor(),pulse=()=>zone(at,3,.78);env.beacon(at);
        pulse();env.after(1.5,pulse);env.after(3,pulse);break;
      }
      case 'trap':{
        const expires=env.time()+6;env.beacon(loc);
        const watch=()=>{const z=foes().filter(z=>dx(loc,coord(z))<=2).sort(byNear)[0];
          if(z)zone(coord(z),3,1.65);else if(env.time()<expires)env.after(.25,watch);};
        watch();break;
      }
      case 'cull':{
        const used=new Set();
        for(let n=0;n<3;n++){
          const target=three().filter(z=>!used.has(z)).sort(weakest)[0];if(!target)break;
          used.add(target);act(target,1.85);if(env.live(target)&&target.health>0)break;
        }
        break;
      }
      case 'cover':friendly().sort(weakest).slice(0,3).forEach(z=>act(z,1.15));break;
      case 'relay':allies().filter(z=>env.row(z)===loc.r&&env.col(z)<=loc.c)
        .sort((a,b)=>env.col(b)-env.col(a)||Number(a===env.body)-Number(b===env.body))
        .slice(0,3).forEach(z=>act(z,1.35));break;
      case 'rescue':{
        const expiry=env.time()+6;
        const watch=()=>{
          const z=urgent()[0];
          if(!z){if(env.time()<expiry)env.after(.5,watch);return;}
          const identity=env.generation(z);act(z,1.65);
          env.after(2,()=>{if(env.generation(z)===identity&&friendly().includes(z))act(z,1);});
        };
        watch();break;
      }
      case 'escort':{
        const z=three().sort((a,b)=>env.col(a)-env.col(b)||byNear(a,b))[0];
        if(!z)break;act(z,1.35);
        const friend=urgent()[0];if(friend){friend.heal(.05*friend.toughness);env.flash('mend',friend);}
        break;
      }
      case 'harvest':env.sun(25+10*Math.min(5,friendly().length));break;
      case 'yield':env.sun(20);env.after(2,()=>env.sun(20));env.after(4,()=>env.sun(20));break;
      case 'bounty':{
        const target=three().sort(weakest)[0];if(!target)break;
        const identity=env.generation(target),ends=env.time()+3;
        let claimed=false;
        const pay=()=>{if(!claimed&&env.time()<=ends){claimed=true;env.sun(65);}};
        env.onKilled?.(target,pay,3);
        act(target,1.5);
        const claim=()=>{
          if(claimed||env.generation(target)!==identity)return;
          if(target.dead||target.health<=0){pay();return;}
          if(env.time()<ends)env.after(.25,claim);
        };
        claim();break;
      }
    }
  }
  return Object.freeze({options,speedFactor,cast});
})();

