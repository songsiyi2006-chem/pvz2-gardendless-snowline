const gardenChallenge = (() => {
  const openingSeconds=17;
  const prepared = new WeakMap(), sessions = new WeakMap(), noCarry = new WeakSet(), definitions = new WeakMap();
  const get = key => window.System?.get('chunks:///_virtual/' + key + '.ts');
  const play = () => get('levelController')?.LevelPlay;
  const bank = () => get('Cards')?.Cards.component;
  const owner = () => get('PlayerProperties')?.AllPlayerProperties?.currentPlayer;
  let pending = null, changing = false;
  const pools = [
    ['sunflower','twinsunflower','sunshroom','primalsunflower','moonflower'],
    ['peashooter','cabbagepult','repeater','redstinger','snowpea','kernelpult'],
    ['bonkchoy','snapdragon','wasabiwhip','parsnip','phatbeet','endurian'],
    ['laser_bean','citron','melonpult','bowlingbulb','electricpeashooter','applemortar','slingpea'],
    ['lightningreed','bloomerang','threepeater','starfruit','homingthistle','primalpeashooter','spikeweed'],
    ['wallnut','tallnut','primalwallnut','holonut','chardguard','peanut','mirrornut'],
    ['potatomine','squash','jalapeno','cherry_bomb','grapeshot','stunion','hurrikale','icebloom'],
  ];
  function hash(text) {
    let value = 2166136261;
    for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
    return value >>> 0;
  }
  function sameScene(level) {
    if (!level || level !== play()?.component) return false;
    const system = window.System;
    const scene = system.get(system.resolve('cc'))?.director.getScene();
    return scene?.name === 'inGameScene' && scene === level.node?.scene;
  }
  const key = controller => JSON.stringify([controller.thisLevelsID,controller.GitHubLevelName || '']);
  function definition(level, controller, original) {
    const restore = pending?.player === owner() && pending?.key === key(controller);
    const value = restore ? (definitions.get(pending.source) || original) : original;
    definitions.set(level,value);
    return value;
  }
  const active = (level=play()?.component) => !!level && sessions.has(level) && sameScene(level);
  const pregame = l => sameScene(l) && !l.rocked && !l.gameStarted && !play().letsRocked;
  const eligible = () => {
    const l = play()?.component;
    return pregame(l) && l.difficulty === 6 && owner()?.difficulty === 3 && !gardenFixed.inLevel() && !!bank()?.laid &&
      !!bank()?.seedChooser?.node.activeInHierarchy;
  };
  const canConfigure = () => !changing && active() && pregame(play()?.component);
  const multiplier=n=>Number.isInteger(n)&&n>=1&&n<=5;
  function simulationSettings(raw){
    const base=multiplier(raw?.base)?raw.base:2,plants={};
    for(const id of Object.keys(raw?.plants||{}).sort()){
      const n=raw.plants[id];
      if(id!=='imitater'&&gardenPlantIds.has(id)&&multiplier(n))plants[id]=n;
    }
    return {enabled:raw?.enabled===true,base,plants};
  }
  function mapSimulation(){return simulationSettings(owner()?.gardendlessGreenhouseV1?.simulationDefaults);}
  function draftSimulation(){return simulationSettings(record()?.simulation??mapSimulation());}
  function simulationValue(settings,id,deck){
    if(!settings?.enabled||!deck?.includes(id))return 1;
    if(id==='imitater')id=deck[deck.indexOf(id)-1];
    return settings.plants[id]??settings.base;
  }
  function simulation(id){
    const l=play()?.component,s=l&&sessions.get(l);
    return s?.simulation?.enabled&&sameScene(l)?simulationValue(s.simulation,id,s.deck):1;
  }
  function plantedDeck(level, controller, definition, resolver) {
    let seed = {}, tide = false;
    const seen = new Set();
    function read(refs) {
      for (const ref of refs || []) {
        if (seen.has(ref)) continue;
        seen.add(ref);
        for (const entry of resolver.getObjectsByRTID(ref,null,level.currentLevelObjects)) {
          if (entry.objclass === 'SeedBankProperties') seed = entry.objdata || {};
          if (/Tide|Tidal|WaterGrid|PoolStage|BeachStage/.test(entry.objclass)) tide = true;
          if (entry.objclass === 'StarChallengeModuleProperties') read(entry.objdata?.Challenges?.[0]);
        }
      }
    }
    read(definition?.Modules);
    const ids = [], included = seed.PlantIncludeList, excludes = new Set([...(seed.PlantExcludeList || []),...(seed.PlantBlackList || [])]);
    const append = id => {
      if (gardenPlantIds.has(id) && !gardenCompatible.numeric(id) && id !== 'imitater' && !ids.includes(id) && ids.length < 7) ids.push(id);
    };
    for (const plant of seed.PresetPlantList || []) append(plant.PlantType);
    const permitted = id => !excludes.has(id) && (!included?.length || included.includes(id)) &&
      (!(seed.ExcludeListSunProducers === true || seed.ExcludeListSunProducers === 'true') || !pools[0].includes(id));
    if ((tide || controller.thisLevelsID?.some(id=>/^beach\d/.test(id))) && permitted('lilypad')) append('lilypad');
    const signature = key(controller);
    pools.forEach((group,index) => {
      const valid = group.filter(id=>permitted(id) && !ids.includes(id));
      if (valid.length) append(valid[hash(signature + '/' + index) % valid.length]);
    });
    for (const id of [...(included || []), ...pools.flat()]) if (permitted(id)) append(id);
    for (const id of pools.flat()) append(id);
    return Object.freeze(ids);
  }
  function prepare(level, controller, definition, resolver) {
    const deck = plantedDeck(level, controller, definition, resolver);
    const next = pending;
    pending = null;
    const record = {baseDeck:deck,deck,extras:[],key:key(controller), replay:false, modes:Object.create(null),flagsSeen:new Set()};
    record.training=defaultTraining(deck);
    record.simulation=mapSimulation();
    prepared.set(level, record);
    if (!next || next.player !== owner() || next.key !== record.key) return;
    record.replay = next.replay;
    if(next.simulation)record.simulation=simulationSettings(next.simulation);
    record.regularCards = next.regularCards;
    record.requested = next.enabled;
    if(validTraining(deck,next.training))record.training={...next.training};
    if(next.enabled)applyExtras(record,next.extras);
    record.modes = {...next.modes};
    if (record.requested && level.difficulty === 6 && !gardenFixed.inLevel()) sessions.set(level,record);
  }
  function generated(level,controller,definition,resolver) {
    const record = prepared.get(level);
    if (!record) return;
    record.baseDeck=plantedDeck(level,controller,definition,resolver);
    if(!validTraining(record.baseDeck,record.training))record.training=defaultTraining(record.baseDeck);
    applyExtras(record,record.extras);
    if (record.requested && level.difficulty===6 && !gardenFixed.inLevel()) sessions.set(level,record);
    else sessions.delete(level);
  }
  function deck() { return [...(prepared.get(play()?.component)?.deck || [])]; }
  const record=()=>prepared.get(play()?.component);
  function extraOptions(rec=record()){
    gardenCompatible.refresh();
    return rec?gardenCatalogue.filter(p=>!rec.baseDeck.includes(p.id)&&gardenEconomy.owns(owner(),p.id)).map(p=>p.id):[];
  }
  function validExtras(rec,ids){
    if(!Array.isArray(ids))return false;
    if(!ids.length)return true;
    const options=extraOptions(rec);
    return ids.length<=2&&new Set(ids).size===ids.length&&ids.every(id=>options.includes(id));
  }
  function applyExtras(rec,ids){
    rec.extras=validExtras(rec,ids)?[...ids]:[];
    rec.deck=Object.freeze([...rec.baseDeck,...rec.extras]);
  }
  const defaultTraining=ids=>Object.fromEntries(ids.map((id,i)=>[id,i<4?1:i<6?3:4]));
  function rollTactics(){
    const r=record();
    if(!r||!(eligible()||canConfigure()))return null;
    const shuffled=[...r.baseDeck],modes={};
    for(let i=shuffled.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    for(const id of shuffled)modes[id]=Math.floor(Math.random()*gardenModes.options(id).length);
    return {training:defaultTraining(shuffled),modes};
  }
  function validTraining(ids,allocation){
    if(!allocation||ids.length!==7)return false;
    const levels=ids.map(id=>allocation[id]);
    return levels.filter(n=>n===1).length===4&&levels.filter(n=>n===3).length===2&&levels.filter(n=>n===4).length===1;
  }
  function training(){
    const r=record();return r?{...(r.training||defaultTraining(r.baseDeck))}:{};
  }
  function setTraining(allocation){
    if(!canConfigure())return false;
    const r=record();
    if(!validTraining(r.baseDeck,allocation))return false;
    r.training=Object.fromEntries(r.baseDeck.map(id=>[id,allocation[id]]));return true;
  }
  function mastery(id,index){
    if(!active())return null;
    const r=record();
    if(!r?.baseDeck.includes(id))return null;
    return index===mode(id)?r.training[id]:0;
  }
  function rank(id){
    if(!active()||!gardenPlantIds.has(id))return null;
    return gardenCompatible.numeric(id)||sessions.get(play().component).extras.includes(id)?gardenEconomy.rank(id):6;
  }
  // CardUIUpper reads both overlay nodes in its onLoad, as soon as its slot is parented.
  function extendOverlay(){
    const sys=window.System,cc=sys.get(sys.resolve('cc')),upper=cc.find('Canvas/UIInGameUpper/CardsUpper');
    if(!upper)return;
    for(const prefix of ['','Key']){
      if(upper.getChildByName(prefix+'8'))continue;
      const template=upper.getChildByName(prefix+'7');
      if(template){const node=cc.instantiate(template);node.name=prefix+'8';node.parent=upper;}
    }
  }
  function mode(id) {
    const value = sessions.get(play()?.component)?.modes[id] ?? owner()?.gardendlessGreenhouseV1?.modes?.[id];
    return value === 1 || value === 2 ? value : 0;
  }
  function setMode(id, index) {
    if (!canConfigure() || gardenCompatible.numeric(id) || !deck().includes(id) || rank(id)!==6 || ![0,1,2].includes(index)) return false;
    sessions.get(play().component).modes[id] = index;
    if (typeof gardenCombatStats !== 'undefined') gardenCombatStats.refreshMode(id);
    return true;
  }
  function remember(level) {
    if (!active(level) || noCarry.has(level) || owner()?.difficulty !== 3 || get('KeyListener')?.KeyListener?.screenColorTweening) return;
    const s = sessions.get(level);
    pending = {key:s.key, player:owner(),extras:[...s.extras],training:{...s.training},simulation:simulationSettings(s.simulation), modes:{...s.modes}, regularCards:s.regularCards, enabled:true,replay:true,source:level};
  }
  function restoreCards(level,cards) {
    const record=prepared.get(level);
    if (active(level) || !record?.regularCards) return false;
    const ids=record.regularCards;
    delete record.regularCards;
    cards.addCardByPlantTypeArrayFromSeedbank(ids);
    return true;
  }
  let difficultyEditLevel;
  function difficultyEdited() {
    const l=play()?.component;
    if(pregame(l) && !gardenFixed.inLevel()) difficultyEditLevel=l;
  }
  function settingsClosed() {
    const l=difficultyEditLevel;
    difficultyEditLevel=null;
    if (!l || !pregame(l) || l.difficulty===owner()?.difficulty+3) return;
    setTimeout(()=>{if(pregame(l)) toggle(false,true).catch(console.error);},0);
  }
  async function toggle(on, refresh=false,extras=[],allocation=null,simulationOverride=null) {
    const prev = play()?.component;
    if (changing || (refresh ? !pregame(prev) : on ? !eligible() || active() : !canConfigure())) return false;
    const rec = prepared.get(prev);
    if (!rec || on&&(!validExtras(rec,extras)||allocation&&!validTraining(rec.baseDeck,allocation)||prev.difficulty!==6||gardenFixed.inLevel())) return false;
    changing = true;
    noCarry.add(prev);
    const regularCards=active(prev) ? rec.regularCards : [...(bank()?.CurrentPlantTypes || [])];
    pending = {key:rec.key, player:owner(),extras:[...extras],training:{...(allocation||rec.training)},simulation:simulationSettings(simulationOverride??rec.simulation), modes:{...rec.modes},regularCards,enabled:on, replay:true,source:prev};
    try {
      await get('UI').UIInGame.restart();
      const deadline = Date.now()+90000;
      while (Date.now() < deadline) {
        const level = play()?.component, c = bank();
        if (level !== prev && sameScene(level) && prepared.has(level)) {
          if (active(level) !== on) return false;
          if (c?.laid && c.shown && c.gameStartButton?.node?.activeInHierarchy &&
              (!on || c.CFs?.length === prepared.get(level).deck.length)) return true;
        }
        await new Promise(resolve=>setTimeout(resolve,80));
      }
      return false;
    } finally {
      if (pending?.source === prev) pending = null;
      changing = false;
    }
  }
  function seedBank(level, config) {
    if (!active(level)) return config;
    const deck = sessions.get(level).deck;
    return {...config,SelectionMethod:'chooser',PlantIncludeList:[...deck],PresetPlantList:deck.map(PlantType=>({PlantType})),
      PlantExcludeList:[],PlantBlackList:[],OverrideSeedSlotsCount:deck.length,UnlockAll:true,
      CardDecks:{ChallengingLocked:true,SuppressChallengingHugeWaveGems:true}};
  }
  function beforeChooser(level, controller, cards) {
    if (!active(level)) return;
    const s = sessions.get(level);
    level.UnlockAll = true;
    level.ExcludePlantList = [];
    level.ExcludeListSunProducers = false;
    level.presetSeedToChoose = [...s.deck];
    level.CardDeck_ChallengingLocked = true;
    cards.plantsCanBeChosen = [...s.deck];
    cards.overrideSeedSlotsCount = s.deck.length;
    if(s.extras.length)extendOverlay();
    controller.chooseCardMode = true;
    controller.letsRocked = false;
    if (s.originalMap) return;
    const manager = level.waveManagerProps;
    const waves = manager.Waves || [], original = waves.length;
    const authoredInterval=Math.max(1,manager.FlagWaveInterval||1);
    const interval=Math.max(1,Math.floor(authoredInterval*.8));
    const oldMinimum=(Math.ceil((original+Math.max(2,Math.ceil(original*.5)))/authoredInterval)+2)*authoredInterval;
    const normal=original?Math.ceil(Math.max(original*2.75,oldMinimum)/interval)*interval:0;
    const total = s.extras.length?Math.ceil(normal*1.5):normal;
    // Front-load authored groups before the first flag. Keep the original finale
    // on the last wave, and map every authored event exactly once.
    const openingEvents=Math.max(0,Math.min(original-1,Math.ceil(interval*.7)));
    const eventsBy = step => original===1?Number(step>0):step < interval ? Math.ceil(step*openingEvents/interval) :
      openingEvents + Math.floor((step-interval)*(original-openingEvents)/(total-interval));
    const expanded = [], originalMap = [];
    for (let i=0;i<total;i++) {
      const before = eventsBy(i), after = eventsBy(i+1);
      const alias = 'GardenChallengeSurge'+i;
      if(after>before) originalMap[after-1]=i;
      level.currentLevelObjects.push({aliases:[alias],objclass:'GardenChallengeSurge',objdata:{index:i}});
      expanded.push([...(after>before ? waves[after-1] : []),'RTID('+alias+'@CurrentLevel)']);
    }
    manager.Waves = expanded;
    s.originalMap=originalMap;
    const end = value => {
      if(!original || !Number.isInteger(value))return value;
      const index=(value%original + original)%original;
      return originalMap[index];
    };
    for(const scheduler of level.levelSchedulers) scheduler.EndingWave=end(scheduler.EndingWave);
    for(const entry of level.currentLevelObjects) {
      if(entry.objclass==='WaveSchedulerProps' && Number.isInteger(entry.objdata?.EndingWave))
        entry.objdata={...entry.objdata,EndingWave:end(entry.objdata.EndingWave)};
    }
    manager.WaveCount = total;
    manager.FlagWaveInterval = interval;
    manager.ZombieCountdownFirstWaveSecs=openingSeconds;
  }
  function flags(level){return sessions.get(level)?.flagsSeen.size||0;}
  function acceptWave(level,index,isFlag){
    const s=sessions.get(level);
    if(!s||!isFlag||!level.waveManagerProps.Waves[index]||s.flagsSeen.has(index))return;
    s.flagsSeen.add(index);
    if(s.flagsSeen.size===1)s.firstFlagIndex=index;
    if(s.flagsSeen.size===2){
      const m=level.waveManagerProps;
      m.MinNextWaveHealthPercentage=Math.max(m.MinNextWaveHealthPercentage,.67);
      m.MaxNextWaveHealthPercentage=Math.max(m.MaxNextWaveHealthPercentage,.80);
    }
  }
  function waveDelay(level,seconds,healthGate){
    if(!sessions.has(level)||seconds===0)return seconds;
    const n=flags(level);
    if(!n)return healthGate?Math.max(4,seconds*.85):seconds*.74;
    if(n===1)return healthGate?Math.max(3,seconds*.72):seconds*.62;
    return seconds*(healthGate?.50:.48);
  }
  function jump(level,data) {
    const map=sessions.get(level)?.originalMap;
    if(!map?.length)return data;
    const from=map.indexOf(level.currentWave-1)+1;
    const relative=from+data.DeltaWaveIndex;
    const original=Number.isInteger(relative) && relative>=0 && relative<map.length ? relative : data.TargetWaveIndex;
    return {...data,DeltaWaveIndex:NaN,TargetWaveIndex:Number.isInteger(original) && original>=0 && original<map.length ? (original===0 ? 0 : map[original-1]+1) : NaN};
  }
  async function reinforce(level, index) {
    if (!active(level)) return;
    const square = get('Square').Square, lanes = level.onlyLanesForRandomSpawn?.length ? level.onlyLanesForRandomSpawn : [0,1,2,3,4];
    const n=flags(level);
    if(!n)return;
    const sinceFirst=Math.max(0,index-sessions.get(level).firstFlagIndex);
    const interval=level.waveManagerProps.FlagWaveInterval;
    const beat=(index+1)%interval;
    const requested=n===1 ? Math.min(5,2+Math.floor(sinceFirst/2)) :
      Math.min(17,7+2*Math.min(3,n-2)+(beat===0?4:beat%3));
    // Native scripted enemies enter as authored. Reinforcements yield room if
    // a previous attack is still on the lawn, then resume as lanes are cleared.
    const activeHostiles=get('CharacterManager').ZombiePool.pool().filter(z=>
      z.node?.activeInHierarchy && !z.hypnotized && z.health>0 && z.isAlive() && z.isInLawn()).length;
    const fieldLimit=n===1?15:Math.min(36,22+4*(n-2));
    const count=Math.min(requested,Math.max(0,fieldLimit-activeHostiles));
    const jobs = [];
    for(let i=0;i<count;i++) {
      const row = lanes[(index*3+i)%lanes.length];
      let tile = square.getLnC(row,8), style;
      if (!tile) continue;
      if (tile.isSkyOrSea()) {
        // On the airship and pirate deck, give grounded reinforcements a real landing tile.
        let column=7;
        while(column>=0 && tile?.isSkyOrSea()) tile=square.getLnC(row,column--);
        if(!tile || tile.isSkyOrSea()) continue;
        style=get('LnC').LnCSpawnZombieStyleEnum.dirtspawn;
      }
      const yeti = n===1 ? i===0&&sinceFirst%4===0 : i===0||i===3&&index%2===1;
      const type = yeti ? 'treasureyeti' : (typeof gardenWorldVeterans!=='undefined'&&gardenWorldVeterans.reinforcement(level,index,i,tile)) || ['lawn','lawn_armor1','lawn_armor2'][(i+index)%3];
      jobs.push(tile.SpawnZombieByZombieType(type,style,false,.5,.7,{gardenEventYeti:yeti},true,false,false)
        .then(bodies=>{
          if (!active(level)) return;
          for(const body of bodies || []) {
            if (!body?.node?.isValid) continue;
            body.judgeInLnC();
            level.registerZombieInThisWave(body);
          }
        }).catch(error=>{if(active(level)) throw error;}));
    }
    await Promise.all(jobs);
  }
  const unscaled = new WeakMap();
  const standard=Object.freeze({speed:1.6,damage:3,health:5}),reinforced=Object.freeze({speed:1.92,damage:6,health:7.5});
  const isReinforced=level=>!!(level&&sessions.get(level)?.extras.length);
  const profileModifiers=useExtras=>useExtras?reinforced:standard;
  const factors=()=>profileModifiers(isReinforced(play()?.component));
  const modifiers=Object.freeze({get speed(){return factors().speed},get damage(){return factors().damage},get health(){return factors().health}});
  const routeSpeed=body=>(body._gardenChallengeHostile&&!body.hypnotized?modifiers.speed:1)*(body.objdata?.GardenShieldguard?.5:1);
  const hurt = k => /Damage|DPS/.test(k) &&
    !/Interval|Duration|Delay|Time|Factor|Scale|Mult|Percent|Pct|Chance|Threshold|Reflect|Receives|Accumulated|Cap|Limit|Radius|Range|Count|Type|Immune|Trigger|Reduction/.test(k);
  function statFactor(k) {
    if (/^(?:Toughness|MaxToughness|ImpToughness|BugToughness|BalloonToughness|PonchoToughness|ShieldToughness|NewspaperHealth)$/.test(k)) return modifiers.health;
    if (/(?:Walk|Run|Rush)SPS(?:Varience|Variance)?$/.test(k)||k==='BuggedSPS'||k==='FlyingSpeed'||k==='WalksTowardsAirRaidPlantYSPS') return modifiers.speed;
    return hurt(k) ? modifiers.damage : 1;
  }
  function resetBody(body, options) {
    for (const [sheet, originals] of unscaled.get(body)?.entries || []) Object.assign(sheet,originals);
    unscaled.delete(body);
    body._gardenChallengeHostile = active() && !options?.gardenAlly;
    body._gardenEventYeti = body._gardenChallengeHostile && !!options?.gardenEventYeti;
  }
  function stats(body, raw, sheet) {
    if (!body._gardenChallengeHostile) return raw;
    const result = {...raw}, originals = {};
    for (const key of new Set([...Object.keys(raw), ...Object.keys(sheet)])) {
      const factor = statFactor(key), n = raw[key] ?? sheet[key];
      if (factor === 1 || !Number.isFinite(n)) continue;
      if (key in sheet) originals[key] = sheet[key];
      result[key] = n*factor;
    }
    if (!unscaled.has(body)) unscaled.set(body,{enabled:true,entries:[]});
    unscaled.get(body).entries.push([sheet,originals,result]);
    return result;
  }
  function allegianceStats(body,friendly){
    const layers=unscaled.get(body),on=!friendly;
    if(!body._gardenChallengeHostile||!layers||layers.enabled===on)return;
    const oldMax=body.toughness,health=body.health,scale=f=>on?f:1/f;
    layers.enabled=on;
    const sheets=new Set(layers.entries.flatMap(([sheet,,result])=>[sheet,result]));
    for(const sheet of sheets)for(const key of Object.keys(sheet)){
      const value=sheet[key],factor=statFactor(key);
      if(factor!==1&&Number.isFinite(value))sheet[key]=value*scale(factor);
    }
    if(oldMax>0&&Number.isFinite(health)&&Number.isFinite(body.toughness))body.health=health/oldMax*body.toughness;
    if(Number.isFinite(body.randomWalkSpeedRate))body.randomWalkSpeedRate*=scale(modifiers.speed);
    if(body.walkRouteBufferDistance&&Number.isFinite(body.walkSPSAtRoute))body.walkSPSAtRoute*=scale(modifiers.speed);
    for(const key of ['balloonHealth','paperHealth','ponchoHealth','plateHealth','ImpHealth','ImpToughness'])
      if(Number.isFinite(body[key])&&body[key]>0)body[key]*=scale(modifiers.health);
    for(const armor of body.armors||[])if(armor.health>0)armor.health*=scale(modifiers.health);
  }
  let projectileOwner = false;
  function launch(body, next, receiver, method, ...args) {
    const last = projectileOwner;
    projectileOwner = !!body?._gardenChallengeHostile && !body.hypnotized;
    try { return next(body,receiver,method,...args); }
    finally { projectileOwner = last; }
  }
  function projectile(raw, defaults, hostile) {
    if (!hostile) return raw;
    function scaled(sheet) {
      const result = {...sheet};
      for (const [k,v] of Object.entries(sheet)) {
        if (Number.isFinite(v) && hurt(k)) result[k] = v*modifiers.damage;
        else if (Array.isArray(v) && /splash|poison/i.test(k)) result[k]=v.map(o=>o && typeof o === 'object' ? scaled(o) : o);
      }
      return result;
    }
    const injected = scaled(raw);
    for(const [k,v] of Object.entries(defaults || {})) if (injected[k] == null && hurt(k) && Number.isFinite(v)) injected[k]=v*modifiers.damage;
    return injected;
  }
  return {active,flags,acceptWave,waveDelay,openingSeconds,modifiers,profileModifiers,isReinforced,routeSpeed,allegianceStats,eligible,canConfigure,deck,mode,setMode,
    baseDeck:()=>[...(record()?.baseDeck||[])],extras:()=>[...(record()?.extras||[])],extraOptions:()=>extraOptions(),
    enable:(extras=[],allocation=null,settings=null)=>active()?canConfigure()&&toggle(true,true,extras,allocation,settings):toggle(true,false,extras,allocation,settings),
    simulation,simulationValue,simulationSettings,mapSimulation,draftSimulation,
    mastery,training,setTraining,validTraining,rollTactics,disable:()=>toggle(false),remember,prepare,definition,
    resetBody,stats,launch,projectile,restoreCards,jump,generated,difficultyEdited,settingsClosed,
    clearPending(){pending=null;difficultyEditLevel=null;},get projectileOwner(){return projectileOwner;},
    rank,equippedMode:id=>rank(id)===6 ? mode(id) : null,
    replay:l=>!!prepared.get(l)?.replay,seedBank,beforeChooser,reinforce,
    hasCard:(l,id)=>sessions.get(l)?.deck.includes(id) === true};
})();
