const gardenRotaryAdvanced=Object.freeze({
  rounds:Object.freeze([480,552,624,720,960,960,960]),
  spec(base,level){
    const seventh=level===7,strength=seventh?148:144;
    const siege='每六轮重组一次弹芯。主弹对中心的命中和额外穿甲弹合为 150% 穿甲伤害，改打相邻行、前后三列内护甲最厚的敌人。范围内没有护甲时照常射击。';
    return Object.freeze({...base,level,strength,activeCost:1000,duration:30,
      frequency:'每秒 32 轮 · 30 秒 960 轮',power:'每轮 '+strength+' 点 · 爆心 '+Math.round(strength*.9)+' · 刃心 '+Math.round(strength*1.2),
      mechanic:(seventh? siege+' 每三轮从原弹列调一轮拦截房前四列最靠近房屋的异行目标。中心敌人每 3 秒最多被击退 0.35 格并眩晕 0.5 秒一次。':siege+' 保留五阶的高爆、爆斩与同列上下两格的两目标追击。')+' 两种弹型首台 1000 阳光，每台加价 250，每 25 秒回落 50，最低 1000。'});
  },
  loadout(base,level,form){
    const tier=level>5?this.spec(base,level):base;
    if(form!=='ap')return Object.freeze({...tier,form:'he',duration:30,activeCost:1000});
    const strength=[360,375,390][level-5],activeCost=1000;
    const behavior=level===7?'优先拦截房前四列最靠屋的目标。前线无人时，转为搜寻重甲。':level===6?'优先锁定领先敌人后三列以内护甲最厚的目标。':'锁定最靠近房屋的敌人。';
    const follow=Object.freeze(level===5?[.60]:level===6?[.65,.35]:[.72,.42]),reach=level===7?4:3;
    return Object.freeze({...tier,form:'ap',strength,duration:30,activeCost,follow,reach,
      frequency:'每秒 64 发 · 30 秒 1920 发',power:'单发 '+strength+' 点 · 同排最多 '+(follow.length+1)+' 个目标',
      mechanic:behavior+' 每发命中后可沿同排向后穿 '+reach+' 格，依次保留 '+follow.map(v=>Math.round(v*100)+'%').join('、')+' 威力。每穿过一面完整重盾，后续伤害再减半。能打穿铁网门、头盔和背心。原生铁桶、报纸及西部披风铁板按穿体伤害的两倍磨损。无溅射。开局报价 '+activeCost+' 阳光，每部署一台报价增加 250，每 25 秒回落 50，最低 1000。'});
  }
});
