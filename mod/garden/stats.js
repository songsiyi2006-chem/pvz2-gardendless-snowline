// Native combat values are copied per spawned plant/projectile. Data loaded from the
// game resources stays at rank zero for enemy shots, other saves, and future pooled uses.
const gardenCombatStats = (() => {
  const defaults = new WeakMap();
  const durability = new Set([
    'Toughness', 'ArmorToughness', 'ShieldToughness', 'JellyToughness',
    'MaxToughness', 'ToughnessPlantfooded'
  ]);
  const attackTimes = new Set((
    'AttackInterval AttackIntervalAdditional ShootInterval ShootIntervalAdditional ' +
    'ShootIntervalSemi ShootIntervalSemiAdditional ThrowInterval ThrowIntervalAdditional ' +
    'ButterThrowInterval NormalAttackInterval ShadowAttackInterval ShineVineShootInterval ' +
    'ShineVineShootIntervalAdditional ProjectileInterval PeaInterval RayInterval RayIntervalAdditional ' +
    'StabInterval ExplosionInterval DamageInterval DirectDamageInterval PlantfoodDamageInterval ' +
    'ChewTime ChewTimePerZombie ChewTimePF ChargeTime ReloadInterval ReloadDuration ' +
    'ReloadingTime RestTime GhostDamageCooldownTime AmmoRefreshTime TornadoInterval ' +
    'RechargeTime ChargingTime BlowRecoverTime AttackCooldownStart AttackCooldownStartAdditional ' +
    'AttackCooldownBetween AttackCooldownBetweenAdditional LeafRespawnCooldown'
  ).split(' '));
  const perHit = k => /Damage|DPS/.test(k) &&
    !/Interval|Duration|Delay|Time|Factor|Scale|Multiplier|Mult$|Percent|Pct|Chance|Threshold|Reflect|Receives|Accumulated|Cap|Limit|Radius|Range|Count|Type|Immune/.test(k);
  let launchingRank = 0,launchingPlant=false,launchingCode=null,reconClock=null;
  function ownedRank(code, nativeId) {
    if (gardenFixed.inLevel()) return 5;
    // A selected Imitater card carries the copied type in the native spawn arguments.
    // A random shell has no concrete target until its animation spawns that target.
    if (code === 'imitater') return 0;
    if (typeof resolve === 'function') return resolve(code,nativeId,false,gardenBattleRank)?.rank ?? gardenBattleRank(code);
    return gardenBattleRank(code);
  }
  function kind(key) {
    if (durability.has(key)) return 'health';
    if (attackTimes.has(key)) return 'attackSpeed';
    return perHit(key) ? 'damage' : '';
  }
  function range(value) {
    return value && typeof value === 'object' && Number.isFinite(value.Min) && Number.isFinite(value.Max);
  }
  function scaleValue(n, key, stats) {
    const field = kind(key);
    if (field === 'attackSpeed' && stats.attackSpeed !== 1 && range(n)) {
      return Object.assign(Object.create(Object.getPrototypeOf(n)),n,{Min:n.Min/stats.attackSpeed,Max:n.Max/stats.attackSpeed});
    }
    if (!field || !Number.isFinite(n)) return n;
    return field === 'attackSpeed' ? n / stats.attackSpeed : n * stats[field];
  }
  function setPlant(body, code, id) {
    const rank = ownedRank(code,id);
    body._gardenCombatRank = rank;
    body._gardenCombatStats = gardenEffectiveStats(rank,code);
    if(typeof gardenPlantSimulation!=='undefined')gardenPlantSimulation.reset(body,code);
    body._gardenFreshBody = true;
  }
  function refreshMode(id) {
    const manager=window.System?.get?.('chunks:///_virtual/CharacterManager.ts')?.PlantPool?.cm;
    for (const body of manager?.plantPool||[]) {
      const code=body.Plant_Type;
      if (body.dead || body._gardenCombatRank!==6 || (forms.get(code)||code)!==id) continue;
      const old=body._gardenCombatStats, next=gardenEffectiveStats(6,code);
      body._gardenCombatStats=next;
      if(typeof gardenPlantSimulation!=='undefined')gardenPlantSimulation.remember(next,gardenPlantSimulation.owner(body));
      if (old && next.attackSpeed!==old.attackSpeed && body.objdata) {
        body._gardenFreshBody=true;
        readPlant(body,body.objdata);
        if (id!=='laser_bean' && Number.isFinite(body.shootCD) && body.shootCD>0) body.shootCD*=old.attackSpeed/next.attackSpeed;
      }
    }
  }
  function refreshRecon(){
    const cm=window.System?.get?.('chunks:///_virtual/CharacterManager.ts')?.PlantPool?.cm;
    for(const body of cm?.plantPool||[]){
      const old=body._gardenCombatStats,props=body._objdataOwn;
      if(!old||!props||body.dead||!body.node?.activeInHierarchy)continue;
      const next=gardenEffectiveStats(body._gardenCombatRank||0,body.Plant_Type);
      if(next.attackSpeed===old.attackSpeed)continue;
      const scale=old.attackSpeed/next.attackSpeed;
      // Rescale only speeds and live clocks. Preserve runtime damage changes,
      // temporary buffs, current health and this plant's position in its cycle.
      for(const key of Object.keys(props))if(kind(key)==='attackSpeed'){
        if(Number.isFinite(props[key]))props[key]*=scale;
        else if(range(props[key]))props[key]=Object.assign(Object.create(Object.getPrototypeOf(props[key])),props[key],{Min:props[key].Min*scale,Max:props[key].Max*scale});
      }
      for(const key of ['shootCD','attackCD','throwCD','produceSunCD','produceCD','chewCD','reloadingCD','chargeCD'])
        if(Number.isFinite(body[key])&&body[key]>0)body[key]*=scale;
      if(reconClock)reconClock(cm,body,scale);
      body._gardenCombatStats=next;
      if(typeof gardenPlantSimulation!=='undefined')gardenPlantSimulation.remember(next,gardenPlantSimulation.owner(body));
    }
  }
  function readPlant(body, input) {
    const props = body._objdataOwn;
    if (!defaults.has(props)) {
      const initial = {};
      for (const key of Object.keys(props)) {
        if ((Number.isFinite(props[key]) || range(props[key])) && kind(key)) initial[key] = props[key];
      }
      defaults.set(props, initial);
    }
    const initial = defaults.get(props);
    const fresh = body._gardenFreshBody;
    body._gardenFreshBody = false;
    const stats = body._gardenCombatStats || gardenBaseStats(0);
    for (const key of Object.getOwnPropertyNames(props)) {
      const raw=input[key]??(fresh?initial[key]:undefined);
      if(raw==null)continue;
      let value=scaleValue(raw,key,stats);
      if(durability.has(key)&&Number.isFinite(value))value*=body._gardenSimulationHP||1;
      props[key]=value;
    }
  }
  function rescaleVitality(body,ratio){
    if(ratio===1)return;
    for(const key of durability)if(Number.isFinite(body._objdataOwn?.[key]))body._objdataOwn[key]*=ratio;
    if(Number.isFinite(body.toughness))body.toughness*=ratio;
    if(Number.isFinite(body.health))body.health*=ratio;
  }
  function attackAnimation(body, control) {
    const factor = body._gardenCombatStats?.attackSpeed;
    if (!factor || factor === 1) return 1;
    const name = control?.db?.armature?.()?.animation?.lastAnimationState?.name || '';
    return /attack|shoot|throw|launch|lob|punch|chew|slap|spit|smash|bite|devour|strike|bonk|zap/i.test(name) ? factor : 1;
  }
  function launch(body,target,method,...args) {
    const previous = launchingRank,previousPlant=launchingPlant,previousCode=launchingCode;
    // A nested native projectile can create fragments using its owner's captured rank.
    launchingRank = body?._gardenCombatRank ?? 0;
    launchingPlant=!!(body?._gardenCombatStats||body?._gardenPlantShot);
    launchingCode=launchingPlant?(body._gardenSimulationId||body.Plant_Type):(body?.hypnotized||body?._gardenAlliedShot)?body._gardenAlliedPlantId:null;
    try { return target[method](...args); }
    finally { launchingRank = previous;launchingPlant=previousPlant;launchingCode=previousCode; }
  }
  function projectile(props, rank, nativeDefaults) {
    if (!rank) return props;
    const factor = gardenBaseStats(rank).damage;
    function copy(obj) {
      const value = {...obj};
      for (const [key,n] of Object.entries(obj)) {
        if (Number.isFinite(n) && perHit(key)) value[key] = n * factor;
        else if (Array.isArray(n) && /splash|poison/i.test(key)) value[key] = n.map(v=>v && typeof v === 'object' ? copy(v) : v);
        else if (n && typeof n === 'object' && /poison/i.test(key)) value[key] = copy(n);
      }
      return value;
    }
    const value=copy(props);
    for (const [key,n] of Object.entries(nativeDefaults || {})) {
      if (value[key] == null && Number.isFinite(n) && perHit(key)) value[key]=n*factor;
    }
    return value;
  }
  function summonShot(body,receiver,method,...args){
    const code=gardenPlantSimulation.owner(body);if(gardenPlantSimulation.factor(code)<=1)return receiver[method](...args);
    const previous=launchingCode,priorPlant=launchingPlant;
    launchingCode=code;launchingPlant=false;
    try{return receiver[method](...args);}finally{launchingCode=previous;launchingPlant=priorPlant;}
  }
  return {setPlant,readPlant,rescaleVitality,attackAnimation,launch,summonShot,projectile,refreshMode,refreshRecon,onReconClock(fn){reconClock=fn;},
    get launchingRank(){return launchingRank},get launchingPlant(){return launchingPlant},get launchingCode(){return launchingCode}};
})();
