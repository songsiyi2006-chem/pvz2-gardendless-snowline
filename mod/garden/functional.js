// Interpret a plant's combat stats through the resource its native ability actually uses.
const gardenFunctional = (() => {
  const group = text => new Set(text.split(/\s+/));
  const sunPlants = group('sunflower twinsunflower sunshroom primalsunflower moonflower shinevine goldbloom solartomato goldleaf sunbean moonbean solarsage toadstool enlightenmint');
  const arming = group('potatomine primalpotatomine escaperoot');
  const mints = group('reinforcemint enlightenmint wintermint spearmint appeasemint enforcemint peppermint bombardmint concealmint ailmint enchantmint filamint containmint armamint');
  const oneUse = group('potatomine primalpotatomine escaperoot iceburg gravebuster blover cherry_bomb doomshroom cranjelly jalapeno powerlily chilibean hurrikale stallia squash grapeshot hypnoshroom shadowshroom empea solartomato powerplant_alpha powerplant_beta powerplant_gamma powerplant_delta powerplant_epsilon powerplant sunbean tanglekelp hotpotato stunion goldleaf lavaguava thymewarp intensivecarrot moonbean grimrose goldbloom shrinkingviolet hotdate perfumeshroom solarsage icebloom atombomb_seedling gumnut noctarine loquat chillypepper buduhboom');
  const wardens = group('wallnut pumpkin floawerPot lilypad umbrellaleaf primalwallnut tallnut turnip holonut sweetpotato plantern chardguard garlic buttercup mirrornut murkadamia bulbkekengi');
  const healers = group('peach aloe');
  const recruiting = group('zoybeanpod caulipower witchhazel');
  const relays = group('powerlily intensivecarrot hotpotato thymewarp powerplant powerplant_alpha powerplant_beta powerplant_gamma powerplant_delta powerplant_epsilon gravebuster');
  const controls = group('iceburg glaciershroom blover hurrikale stallia stunion empea springbean shrinkingviolet hypnoshroom chilibean gumnut icebloom perfumeshroom chillypepper');
  const timeFields = group('ProduceInterval ProduceIntervalAdditional ProduceCountdownStart ProduceCountdownStartAdditional ProduceInterval_AtNight ProduceIntervalAdditional_AtNight ProduceCountdownStart_AtNight ProduceCountdownStartAdditional_AtNight EnlightenProduceInterval GrowTime0_1 GrowTime1_2 GrowTime0 GrowTime1 GrowTime2 GrowthInterval BustTime WakeTime EatFreezeInterval HeelInterval HealInterval HealingInterval MoveToPosTime TimeBetweenLaneChanges LaneChangeTime DelayBeforeRegenFromDamage DelayBeforeRecoverFromDeath RetractionDelay WarpTime JellyCooldown DetectInterval WaitTimePF');
  const powerFields = group('HealthPerHeal HealthPlantfoodHeal HealHPS SelfQuringHealth HealHPSPlantfood JellyRecoveryHPS BaseGumHealth ZombieGumHealthMult KnockbackDistance KnockBackDistance BounceDistance HypnoedZombieDamageScale FreezeTime FreezeDuration ChillDuration ChillDurationAmbience EatFreezeDuration EatChillDuration StunDuration StunDurationPlantfood ChiliStunDuration PerfumeDuration PerfumeDurationPlantfood ShrinkTime BlowDuration PushDuration DisgustDuration DisgustDurationPlantfood HealthReturns ZombieChillDuration ChanceToTurn');
  const aliases = new Map();
  for (const plant of gardenCatalogue) for (const [code] of plant.variants||[]) aliases.set(code,plant.id);
  const owner = id => aliases.get(id)||id;
  const vitality = id => oneUse.has(owner(id)) || mints.has(owner(id));
  function kind(key) {
    if(timeFields.has(key))return 'attackSpeed';
    if(powerFields.has(key))return 'damage';
    return key==='Lifespan'||key==='Lifetime'?'lifespan':'';
  }
  function summary(raw) {
    const id=owner(raw);
    if(id==='imitater')return '沿用被复制植物的属性换算与六阶模式。';
    const active = id==='marigold'?'攻速缩短产出间隔，伤害增加每枚金币收益与转色概率。黄色形态的阳光同样增产。':
      id==='banana'||id==='missiletoe'?'攻速缩短点射后的重新装填时间，伤害增强每发落弹。':
      id==='bowlingbulb'?'攻速缩短球茎再生间隔，伤害增强滚动弹丸。':
      id==='meteorflower'?'攻速缩短陨石发射后的休整，伤害提高陨石撞击威力。':
      id==='inferno'?'攻速缩短火龙卷生成间隔，伤害提高龙卷接触和卷起敌人的伤害。':
      id==='powerlily'?'伤害增加叶绿素产额，不足一枚的部分在本关累计；攻速加快种包回转。':
      sunPlants.has(id)?'伤害提高每颗阳光的实收值，攻速加快生产或一次性种包回转。':
      arming.has(id)?'攻速缩短出土准备，伤害提高爆炸威力。':
      id==='citron'?'攻速缩短充能时间，伤害提高每枚电浆弹的威力。':
      mints.has(id)?'攻速缩短种包回转，伤害加强登场支援。':
      wardens.has(id)?'攻速加快邻格援护，伤害提高治疗或反击强度。':
      healers.has(id)?'攻速缩短疗程间隔，伤害转为实际治疗量。':
      recruiting.has(id)?'攻速提高转化或生长频率，伤害加强支援打击。':
      id==='gravebuster'?'攻速缩短吞碑时间，伤害转为余击威力。':
      relays.has(id)?'攻速加快种包回转，伤害转为余击威力。':
      controls.has(id)?'伤害加强控制效果或余击，攻速加快休整或种包回转。':
      oneUse.has(id)?'攻速加快再次部署，伤害提高本体攻击或余击。':'';
    return active+(oneUse.has(id)?'生命加成转为种包回转与一次邻行余击，攻速可提前施放与余击。':mints.has(id)?'攻速加快登场，生命加成延长增益覆盖时间。':'');
  }
  function statLabels(raw) {
    const id=owner(raw),labels={};
    if(id==='marigold')Object.assign(labels,{damage:'产出强度',attackSpeed:'产出速度'});
    else if(id==='powerlily')Object.assign(labels,{damage:'叶绿素产额',attackSpeed:'回转速度'});
    else if(['banana','missiletoe','bowlingbulb'].includes(id))Object.assign(labels,{damage:'弹丸威力',attackSpeed:'装填速度'});
    else if(id==='meteorflower'||id==='inferno')Object.assign(labels,{damage:'命中伤害',attackSpeed:'发招速度'});
    else if(sunPlants.has(id))Object.assign(labels,{damage:'单颗阳光',attackSpeed:oneUse.has(id)||mints.has(id)?'回转速度':'产阳速度'});
    else if(arming.has(id))Object.assign(labels,{damage:'爆炸伤害',attackSpeed:'准备速度'});
    else if(id==='citron')Object.assign(labels,{damage:'电浆伤害',attackSpeed:'充能速度'});
    else if(healers.has(id))Object.assign(labels,{damage:'治疗强度',attackSpeed:'治疗速度'});
    else if(wardens.has(id))Object.assign(labels,{damage:'援护强度',attackSpeed:'援护速度'});
    else if(id==='gravebuster')Object.assign(labels,{damage:'余击威力',attackSpeed:'吞碑速度'});
    else if(relays.has(id)||mints.has(id))Object.assign(labels,{damage:'支援强度',attackSpeed:'回转速度'});
    else if(controls.has(id))Object.assign(labels,{damage:'控制强度',attackSpeed:oneUse.has(id)?'回转速度':'休整速度'});
    else if(oneUse.has(id))labels.attackSpeed='回转速度';
    if(oneUse.has(id))labels.health='生命转化';
    if(mints.has(id))labels.health='增益耐力';
    return labels;
  }
  const get = n => globalThis.System?.get('chunks:///_virtual/'+n+'.ts');
  function castAnimation(body,name) {
    return vitality(body.Plant_Type)&&!!name&&
      /spawn|appear|burst|explode|activat|cast|release|produce|food|leap|jump|land|summon|fuse|trigger|transform|sprout|plant|blow|charging/i.test(name);
  }
  function cardTime(base,code) {
    const id=owner(code);
    if(!Number.isFinite(base)||!vitality(id)||!get('levelController')?.LevelPlay?.component)return base;
    const stats=gardenEffectiveStats(gardenBattleRank(id),id);
    return base/(stats.attackSpeed*(oneUse.has(id)?1+.10*(stats.health-1):1));
  }
  function property(value,key,stats,code) {
    if(oneUse.has(owner(code))&&['Toughness','ArmorToughness','MaxToughness'].includes(key))return value;
    if(key==='ChanceToTurn'&&Number.isFinite(value))return Math.min(1,value*stats.damage);
    if(key==='Lifetime'||key==='Lifespan')return Number.isFinite(value)?value*Math.sqrt(stats.health):value;
    return undefined;
  }
  // Each physical pickup retains its denomination, even when the actual reward is 52.5.
  // Tracking pooled sun components separately prevents a sky drop from inheriting a prior flower.
  const denomination=new WeakMap();
  let sunScale=1;
  const simulation=source=>typeof gardenPlantSimulation==='undefined'?1:gardenPlantSimulation.factor(source);
  function sun(source,utility,...args) {
    const previous=sunScale;
    sunScale=(source?._gardenCombatStats?.damage||source?._gardenSunYield||1)*simulation(source);
    try{return utility.produceSun(...args);}finally{sunScale=previous;}
  }
  function resetDrop(drop) {
    if(denomination.has(drop))drop.value=denomination.get(drop);else denomination.set(drop,drop.value);
  }
  function priceDrop(drop,extra=0) {
    resetDrop(drop);drop.value=+((drop.value+extra)*sunScale).toFixed(8);return drop;
  }
  function coin(source,drop) {
    resetDrop(drop);drop.value=+(drop.value*(source._gardenCombatStats?.damage||1)).toFixed(8);return drop;
  }
  const foodCarry=new WeakMap();
  function foodCount(source,base) {
    const level=get('levelController')?.LevelPlay.component;
    if(!level)return base;
    const produced=+(base*(source._gardenCombatStats?.damage||1)+(foodCarry.get(level)||0)).toFixed(8);
    foodCarry.set(level,produced-Math.floor(produced));return Math.floor(produced);
  }
  const reserves=new WeakMap(), units=new WeakMap();
  function living(z){return !!z?.node?.activeInHierarchy&&!z.dead&&!z.displayed&&!z.hypnotized&&!z.invincible&&!!z.isInLawn?.();}
  function hit(z,amount,classes){z.dealDamage(new classes.ZombieDamageDetails(amount,true,false,false,null,0,true));}
  function enqueue(plant,value) {
    const level=get('levelController')?.LevelPlay.component, cm=get('CharacterManager');
    if(!(value>0)||!level||!cm||!plant.plantInLnC)return;
    const r=plant.plantInLnC.lIndex;
    const lead=1.2/(plant._gardenCombatStats?.attackSpeed||1);
    const damage=value*simulation(plant);
    level.scheduleOnce(()=>reserve(level,cm,r,damage),lead);
  }
  function reserve(level,cm,r,value) {
    let state=reserves.get(level);
    if(!state){
      state={lanes:new Map()};reserves.set(level,state);
      state.sweep=()=>{
        if(!state.lanes.size||!level.gameStarted||level.gameWon)return;
        const foes=cm.ZombiePool.pool().filter(living);
        for(const [r,damage] of state.lanes){
          const z=foes.filter(z=>living(z)&&Math.abs(z.lIndex-r)<=1).sort((a,b)=>Math.abs(a.lIndex-r)-Math.abs(b.lIndex-r)||a.cIndex-b.cIndex)[0];
          if(z){state.lanes.delete(r);hit(z,damage,cm);}
        }
        if(!state.lanes.size){level.unschedule(state.sweep);reserves.delete(level);}
      };
      level.schedule(state.sweep,.25);
    }
    state.lanes.set(r,(state.lanes.get(r)||0)+value);
  }
  function reset(body){units.delete(body);}
  function deploy(body) {
    const id=owner(body.Plant_Type),st=body._gardenCombatStats;
    if(!st||body.AlmanacMode||body.displayed||!body.plantInLnC||body.ID===gardenNativeIds.get('imitater'))return;
    const guard=wardens.has(id)||recruiting.has(id);
    if(!guard&&!oneUse.has(id)&&!mints.has(id))return;
    if(st.health===1&&st.damage===1&&st.attackSpeed===1)return;
    let unit=units.get(body);
    if(!unit){
      unit={wait:0};units.set(body,unit);
      if(oneUse.has(id))enqueue(body,30*(st.health-1)*st.damage);
      if(mints.has(id))enqueue(body,200*(st.damage-1));
    }
    return unit;
  }
  function tick(body,dt) {
    const id=owner(body.Plant_Type),st=body._gardenCombatStats;
    if(!(dt>0)||!(wardens.has(id)||recruiting.has(id))||!st||
        (st.damage===1&&st.attackSpeed===1&&st.health===1))return;
    const unit=units.get(body)||deploy(body);if(!unit)return;
    unit.wait-=dt*st.attackSpeed;if(unit.wait>0)return;
    unit.wait=6;
    const cm=get('CharacterManager');if(!cm)return;
    const cell=body.plantInLnC;
    const ally=wardens.has(id)&&cm.PlantPool.pool().filter(p=>p.node?.activeInHierarchy&&!p.dead&&p.plantInLnC&&Math.abs(cell.lIndex-p.plantInLnC.lIndex)<=1&&Math.abs(cell.cIndex-p.plantInLnC.cIndex)<=1&&p.health<p.toughness).sort((a,b)=>a.health/a.toughness-b.health/b.toughness)[0];
    if(ally){ally.heal(35*st.damage);return;}
    const foe=cm.ZombiePool.pool().filter(z=>living(z)&&Math.abs(z.lIndex-cell.lIndex)<=1&&(recruiting.has(id)||Math.abs(z.cIndex-cell.cIndex)<=2)).sort((a,b)=>Math.abs(a.cIndex-cell.cIndex)-Math.abs(b.cIndex-cell.cIndex))[0];
    if(foe)hit(foe,35*st.damage*simulation(body),cm);
  }
  return {kind,property,cardTime,castAnimation,summary,statLabels,reset,deploy,tick,sun,resetDrop,priceDrop,coin,foodCount,
    get sunScale(){return sunScale;}};
})();
