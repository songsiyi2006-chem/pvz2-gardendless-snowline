// These numbers drive both the workshop preview and the battle operators.
// II–IV retain the mechanisms learned on earlier levels.
const gardenEquipmentUpgrades=(()=>{
  const each=v=>'每 '+v+' 秒',damage=v=>v+' 点伤害',heal=v=>'恢复 '+v+' 点生命',sun=v=>v+' 阳光';
  const opening=v=>v?'开局＋每 '+v+' 秒':'每关开局',wave=v=>v?'新波次＋每 '+v+' 秒':'每个新波次';
  const attack=(interval,power,mechanics,f=each,p=damage)=>({interval,power,mechanics,f,p});
  const table={
    sniper:attack([5,4.5,4,3.5],[260,295,335,385],['永久架在屋脊，零阳光自动狙击最前敌人。','穿甲弹贯穿至同行的第二只敌人，追加 50% 伤害。','命中主目标时覆霜，使其减速 1.8 秒。','副瞄具同时狙击另一行最靠近房屋的敌人，造成 60% 伤害。']),
    thorns:attack([1,.9,.8,.7],[12,15,18,22],['地面荆刺持续伤害所有着地的敌人。','房前最后三列的荆刺加深，造成额外 35% 伤害。','每第三次刺击缠住敌腿，使其减速 0.85 秒。','每次缠足时释放毒素，接下来 3 秒每秒造成 8 点伤害。']),
    rotary:attack([0,0,0,0],[75,84,93,105],['两种弹型首台 1000 阳光，每部署一台报价增加 250，每 25 秒回落 50，最低 1000。每轮直击一名，3×3 内最多两名旁敌各受 24%。每四轮引爆，中心追加 90%，最多三名旁敌各受 45%。每八轮爆斩，中心追加 120%，双对角两格内最多两名旁敌各受 75%。','弹群覆盖与爆斩保留。每轮对中心一只额外打出 50% 威力的穿甲弹。','每第五轮眩晕主目标和最多两名擦弹目标 0.45 秒。','每第八轮向镜像行追加一次扫射，仅击中落点前后一列内的一名敌人，造成 30% 伤害。'],(_,i)=>'平均每秒 '+[16,18.4,20.8,24][i]+' 轮 · 30 秒 '+gardenRotaryAdvanced.rounds[i]+' 轮',v=>'每轮 '+v+' 点 · 爆心 '+Math.round(v*.9)+' · 刃心 '+Math.round(v*1.2)),
    bombard:attack([0,0,0,0],[26000,31500,38000,44500],['每组固定消耗 3000 阳光。首发立即轰击五行七列，后续每 0.64 秒重选敌群。炮弹越过重盾；空场预瞄中路第七列。','命中时仍带甲的敌人额外承受 55% 穿甲伤害，并后退 0.22 格。','每发落点 0.65 秒后再次震荡，五行七列内追加 35% 伤害。','末发升级为重型弹，主爆炸威力达 150%，覆盖五行九列。'],(_,i)=>'每组 '+[5,6,7,8][i]+' 发 · 3000 阳光',v=>'主爆 '+v+' 点 / 发'),
    prism:attack([5,4.2,3.5,2.9],[800,1120,1540,2100],['无需阳光。塔顶自动追踪最密集的一行，用穿甲光束扫完整行。','第二面棱镜同时扫过第二密集行，造成主束 70% 的穿甲伤害。','主束冷凝敌人 2.2 秒；0.45 秒后主行回光，对当时位于这一行的敌人追加 40% 穿甲伤害。','光轴在主行最密集的一格弯折，向该格整列同时送出 80% 威力的穿甲光束。'],each,v=>'主束 '+v+' 点 · 零阳光'),
    reservoir:attack([0,42,35,28],[100,140,180,220],['开局直接把储备阳光注入账户。','导入循环水路，每次补注 25 阳光。','补注时若账户低于 200 阳光，再补 25。','开场后每逢新一波敌人，立刻增压补入 20 阳光。'],opening,(v,i)=>'开局 '+v+(i?' · 循环 '+[0,25,35,45][i]:'')+' 阳光'),
    dew:attack([16,14,12,10],[30,36,43,50],['凝成一颗可收集的日光露珠。','每凝露两次，另落下一颗 15 阳光的小露珠。','凝露时为落点周围一格内的植物恢复 20 点生命。','账户低于 250 阳光时，凝露额外产生一颗 25 阳光露珠。'],each,sun),
    orchard:attack([0,28,24,20],[25,35,45,55],['每次波次更替产下一枚阳光果。','波次间也会结出小果，产量为整果的一半，向上取整。','每触发第三次波次收获，额外掉下一枚整果。','波次收获时，为后方两列植物授粉 2.5 秒，攻击冷却缩至 80%。'],wave,v=>'整果 '+v+' 阳光'),
    relay:attack([45,40,35,30],[0,20,35,50],['补一格叶绿素。储格已满时保留充能。','每次放电带来 20 阳光，绿叶已满时也会释放阳光。','每第三次放电多补一格叶绿素，有空格才装入。','每格因储满而溢出的叶绿素，另转为 50 阳光。'],each,(v,i)=>(i>=2?'1–2':'1')+' 格叶绿素'+(v?' · '+v+' 阳光':'')),
    bounty:attack([6,5,4,3],[35,42,50,60],['累计击败敌人，风铃在倒下的位置结算一笔阳光。','护甲类僵尸与带护具的僵尸可累计两次击败。','每次结算同时为生命比例最低的受伤植物恢复 30 点。','每第三笔赏金再掉一颗半额阳光。'],v=>'每 '+v+' 次击败',sun),
    infirmary:attack([5,4.5,4,3.5],[80,96,115,138],['优先治疗生命比例最低的受伤植物。','同一行另一株最虚弱的植物获得 50% 治疗。','主目标治疗前生命低于 35% 时，获得 1 秒保护。','1.25 秒后回访主目标，再恢复本次治疗量的 50%。'],each,heal),
    rain:attack([16,14,12,10],[40,50,62,75],['为全场每一株受伤植物降下暖雨。','2 秒后露水回流，原先受雨的植物再获得 25% 治疗。','首轮暖雨洗去受伤植物的眩晕和音箱干扰。','生命低于 40% 的受雨植物获得 1.25 秒保护。'],each,heal),
    shell:attack([20,17,14,11],[25,30,35,40],['为低生命植物回血，并在救治时提供保护。','同一行距离最近的另一株植物也获得半时长保护。','1.5 秒后补治主目标，恢复其最大生命的 10%。','救治时将主目标周围一格的敌人推离 0.5 格。'],each,(v,i)=>'低于 '+[30,35,40,45][i]+'% 触发 · 回 '+v+'% · 保护 '+[2,2.25,2.5,3][i]+' 秒'),
    detox:attack([6,5,4,3],[20,28,38,50],['清除眩晕及音箱干扰，同时恢复生命。','每株被净化的植物另获 1 秒保护。','净化使其攻击冷却缩至 80%，持续 2 秒。','净化后的余露治疗周围一格的其他植物，恢复半额生命，每轮每株一次。'],each,(v,i)=>['3','4','5','全场'][i]+' 株 · 每株恢复 '+v),
    tempo:attack([9,8,7,6],[70,65,60,55],['逐行轮转，加快下一行有植物防线的原生行动。','节拍起奏时，主行每株植物恢复 15 点生命。','下方相邻行也得到 2 秒弱节拍，攻击冷却缩至 85%。','主行最靠前的植物获得 1.5 秒保护。'],each,(v,i)=>'冷却缩至 '+v+'% · 持续 '+[3,3.5,4,4.5][i]+' 秒'),
    frost:attack([9,8,7,6],[1.4,1.65,1.95,2.25],['以敌群中心为圆心冻结周围一格。','内环冰晶同时造成 25 点寒冰伤害。','外缘扩至周围两格，内环以外的敌人减速 1.5 秒。','0.85 秒后中心格再次结冰，使其间的敌人冻结 1.1 秒。'],each,v=>'冻结 '+v+' 秒'),
    wind:attack([12,10.5,9,7.5],[.6,.75,.9,1.05],['挑选最靠近房屋的敌人并向后推动。','风舵转向时令被选中的敌人眩晕 0.55 秒。','飞行目标会额外后退 0.35 格。','向每个目标的后方一格释放风爆，对该格及上下相邻行造成 65 点伤害，同轮只结算一次。'],each,(v,i)=>[3,3,4,5][i]+' 个目标 · 后退 '+v+' 格'),
    mire:attack([7,6.4,5.8,5.2],[.7,.85,1,1.15],['在敌群中心布置胶池，每半秒为池内敌人刷新减速。','胶质带有腐蚀性，池内每次刷新同时造成 5 点伤害。','胶池向房屋方向漫延一列。','胶池干涸时形成琥珀壳，覆盖格内的敌人眩晕 1 秒。'],each,(v,i)=>'减速 '+v+' 秒 · 胶池 '+[5,5.5,6,6.5][i]+' 秒'),
    tripwire:attack([18,16,14,12],[2,2.3,2.6,3],['每行独立布设，房前最后两列有敌人时触发。','接触绊索的敌人同时受到 36 点电伤。','延伸感应丝，房前三列均可触发和拦截。','触发时沿上下相邻行传出半时长眩晕，覆盖相同的房前三列。'],v=>'每行重设 '+v+' 秒',v=>'眩晕 '+v+' 秒'),
    arc:attack([8,7,6,5],[90,104,119,136],['从最前方目标起跳，以两格为距离寻找下一个导体。','增加第四个跳点，伤害衰减至首击的 38%。','首个被击中的敌人眩晕 0.6 秒。','每个跳点在 0.25 秒后二次放电，追加该段伤害的 35%。'],each,(v,i)=>'首击 '+v+' 点 · '+(i?4:3)+' 段电击'),
    shard:attack([8,7,6,5],[85,100,118,140],['向最前的三只带原生护甲或挑战护具的敌人发射穿甲蜂针。','蜂针破片溅向周围一格的其他敌人，造成 30% 伤害。','每只主目标减速 1.4 秒。','蜂群可锁定五个目标；0.6 秒后，对仍带甲的每只主目标再造成 50% 穿甲伤害。']),
    roost:attack([5,4.5,4,3.5],[140,160,185,215],['优先拦截最靠近房屋的两只飞行敌人。','燕翼留下寒流，命中的飞行敌人减速 1.4 秒。','巡空燕可拦截三个目标，并对其下方同行相邻格的地面敌人造成 45% 溅射伤害。','天空无敌人时改为俯冲地面，向最靠近房屋的一只敌人造成 50% 伤害。']),
    flare:attack([0,30,25,20],[60,72,86,100],['每个新波次首次出现敌人时，全场释放一次晨星闪光。','波次间定时发出微光，对全场敌人造成 50% 伤害。','波次主闪光令全场命中者减速 1 秒。','波次主闪光后 1 秒再次照亮全场，造成 35% 伤害。'],wave,damage),
    mycelium:attack([10,9,8,7],[18,23,29,36],['对最多三只未感染的敌人播种星孢。','孢子着床时额外造成 18 点伤害。','每轮播种 1 秒后可再感染邻近的一个目标，孢毒每秒伤害减半。','每轮同时引爆最多两个既有感染灶，各造成两倍每秒毒伤的即时伤害。'],each,(v,i)=>'每秒 '+v+' 点 · 持续 '+[4,4.5,5,5.5][i]+' 秒')
  };
  const returns={
    reservoir:['每次注水','日光射流','sun',1,'splash',[0,20,30,42]],
    dew:['每次凝露','聚光灼点','sun',1,'splash',[0,16,24,34]],
    orchard:['每轮收获','弹射果核','thorn',0,'',[0,18,27,38]],
    relay:['每次放电','逸散电弧','arc',2,'electric',[0,32,46,62]],
    bounty:['每笔赏金','铜铃震荡','flare',0,'splash',[0,25,36,50]],
    infirmary:['每次主诊','花针反刺','shard',0,'pierce',[0,18,27,38]],
    rain:['每轮首阵暖雨','水锤','rain',0,'splash',[0,26,39,54]],
    shell:['每次救治','贝壳反振','shard',0,'splash',[0,32,46,65]],
    detox:['每次净化','净露酸滴','spore',0,'',[0,16,25,36]],
    tempo:['每次主行起奏','共鸣音波','tempo',0,'splash',[0,20,30,43]]
  };
  const controlDamage={frost:[0,25,34,45],wind:[0,18,27,40],mire:[0,5,7,10],tripwire:[0,36,46,60]};
  const tiers={};
  for(const [id,d] of Object.entries(table))tiers[id]=d.interval.map((interval,i)=>{
    const response=returns[id],responsePower=response?.[5][i]||0,contact=controlDamage[id]?.[i]||0;
    let mechanic=d.mechanics[i],power=d.p(d.power[i],i);
    if(responsePower){power+=' · '+response[1]+' '+responsePower+' 点';
      mechanic+=response[0]+'对离触发点最近的敌人造成 '+responsePower+' 点'+response[1]+'伤害。';}
    if(contact){power+=' · 接触伤害 '+contact+' 点';
      if(id==='wind'&&i===1)mechanic+='阵风命中时附加冲击伤害。';}
    return Object.freeze({id,level:i+1,interval,strength:d.power[i],frequency:d.f(interval,i),power,mechanic,
      responsePower,responseFx:response?.[2],element:response?.[3],kind:response?.[4],contact});
  });
  function barrage(level){
    const shells=[5,6,7,8,10][level-1],spacing=.64,echo=level>=3?.65:0;
    const duration=Math.round(((shells-1)*spacing+(level===5?3:echo))*100)/100;
    return {shells,spacing,echo,duration,activeCost:3000};
  }
  tiers.bombard=tiers.bombard.map(q=>Object.freeze({...q,...barrage(q.level)}));
  const precision=Object.freeze({...tiers.sniper[3],level:5,form:'precision',accuracy:1,strength:1155,secondaryTotal:3200,secondaryPerTarget:720,power:'直击 1155 点 · 每发附伤最多 3200 点',
    mechanic:'主弹直击 1155 点，同排贯穿 809 点，副瞄具跨行直击 693 点。爆炸横跨七列五行的椭圆，爆斩沿双对角延伸三格。四枚飞片、三枚裂刃从爆心散开，闪爆最多两跳，爆斩最多三跳，最远延伸到爆心外 5.5 格。副伤受盾墙掩护，每发护甲结算前最多 3200 点，单体最多 720 点。直击与贯穿另计。'});
  const mk14=Object.freeze({...tiers.sniper[3],level:5,form:'mk14',accuracy:.72,interval:tiers.sniper[3].interval/26,strength:115,
    frequency:'每 0.135 秒 · 射速 +2500%',power:'单发 115 点 · 72% 命中',
    mechanic:'每组六发随机排列。黄火溅射，寒冰减速并可凝冻结霜目标，蓝火破甲，紫火灼烧邻行，电弧最多跳跃两次。毒素复用毒液射手的叠毒与减速。命中时贯穿一名后敌，并追击一名跨行目标。'});
  function spec(id,level,form='mk14'){
    if(id==='airwing')return gardenAirWing.spec(level);
    if(id.startsWith('intercept_'))return gardenInterceptors.spec(id,level);
    if(!tiers[id])return null;
    if(Number(level)>=5){
      const base=id==='sniper'?(form==='precision'?precision:mk14):gardenEquipmentApex.spec(id,tiers[id][3]);
      const advanced=Math.min(7,Math.floor(Number(level)));
      if(id==='rotary')return gardenRotaryAdvanced.loadout(base,advanced,form);
      if(advanced>=6){
        if(id==='sniper')return gardenSniperWatch.spec(base,advanced);
        if(id==='bombard'||id==='prism')return gardenFireSupportAdvanced.spec(base,advanced);
      }
      return base;
    }
    return tiers[id][Math.max(0,Math.min(3,(Math.floor(Number(level))||1)-1))];
  }
  return Object.freeze({maxLevel:7,spec,preview:spec,barrage});
})();
