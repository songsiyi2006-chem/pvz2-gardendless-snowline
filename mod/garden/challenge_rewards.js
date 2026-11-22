const gardenChallengeRewards = (() => {
  const settled = new WeakSet();
  const greenReserve = new WeakMap();
  const field = 'gardendlessGreenhouseV1';
  const lootTypes = new Set(['sun','coin','gem','plantfood','sprout','ticket']);
  const mod = name => window.System?.get('chunks:///_virtual/'+name+'.ts');
  const owner = () => mod('PlayerProperties')?.AllPlayerProperties;
  const safe = n => Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER;
  const enabled = () => gardenChallenge.active();
  function wallet(p=gardenEconomy.profile()) {
    return {coin:p?.coin??0,gem:p?.gem??0};
  }
  function syncWidget(key,type,player) {
    const c=mod(type)?.[type]?.component;
    if(c?.node?.isValid && c.node.scene===window.System.get(window.System.resolve('cc'))?.director.getScene()){
      c._value=player[key];
      c.shownValue=player[key];
    }
  }
  function save(player,patch) {
    const engine=owner();
    if(!engine || player!==gardenEconomy.profile() || engine.practiceProfile)return false;
    const before={};
    for(const key of Object.keys(patch))before[key]=Object.getOwnPropertyDescriptor(player,key);
    Object.assign(player,patch);
    try {engine.savePP();}
    catch(error){
      for(const [key,descriptor] of Object.entries(before)){
        if(descriptor)Object.defineProperty(player,key,descriptor);
        else delete player[key];
      }
      throw error;
    }
    // Native CoinCount.value/GemCount.value write a second save when assigned.
    // Update their cached counter after the durable bundle transaction instead.
    try {
      if('coin' in patch)syncWidget('coin','CoinCount',player);
      if('gem' in patch)syncWidget('gem','GemCount',player);
      if('worldkey' in patch)syncWidget('worldkey','WorldKeyCount',player);
    }catch(error){console.warn('[Greenhouse] currency display refresh',error);}
    return true;
  }
  function spendGems(price,update,player=gardenEconomy.profile()){
    if(!player||player!==gardenEconomy.profile()||!Number.isSafeInteger(price)||price<0||typeof update!=='function')return false;
    const {gem}=wallet(player);
    if(!safe(gem)||gem<price)return false;
    const next=update(structuredClone(gardenEconomy.read(player)));
    if(!next||typeof next!=='object'||Array.isArray(next))return false;
    return save(player,{gem:gem-price,[field]:next});
  }
  function spendTraining(price,next,player){
    if(!price||!next||player!==gardenEconomy.profile()||!player)return false;
    const {gem,coin}=wallet(player),old=gardenEconomy.read(player);
    if(![price.coin,price.points].every(n=>Number.isSafeInteger(n)&&n>0)||!Number.isSafeInteger(price.gem)||price.gem<0||
        !safe(coin)||!safe(gem)||coin<price.coin||gem<price.gem||old.points<price.points)return false;
    return save(player,{coin:coin-price.coin,gem:gem-price.gem,[field]:{...next,points:old.points-price.points}});
  }
  const sample = list => list[Math.floor(Math.random()*list.length)];
  function settle(level,p,amount,run) {
    if(!run?.challenge||run.difficulty!==3||run.player!==p||settled.has(run)||p!==gardenEconomy.profile()||
        !level?.gameStarted||level.gameLost||!Number.isSafeInteger(amount)||amount<=0)return null;
    const {coin,gem}=wallet(p), old=gardenEconomy.read(p);
    if(!safe(coin)||!safe(gem)||!safe(coin+10000)||!safe(gem+20)||!Number.isSafeInteger(old.points+amount))return null;
    const next={...old,points:old.points+amount}, patch={coin:coin+10000,gem:gem+20,[field]:next};
    const props=p.plantProps||{};
    // Tile Turnip's five coloured cards share the parent plant's native unlock.
    const rootOwned=gardenEconomy.owns(p,'powerplant'), tiles=gardenCatalogue.filter(plan=>plan.id.startsWith('powerplant_'));
    const owns=id=>gardenEconomy.owns(p,id)||(id.startsWith('powerplant_')&&rootOwned);
    const pending=level.levelDefinition?.FirstRewardType==='unlock_plant'?level.levelDefinition.FirstRewardParam:null;
    const locked=gardenCatalogue.filter(plan=>!plan.id.startsWith('powerplant_')&&!owns(plan.id)&&plan.id!==pending);
    let gift;
    if(locked.length){
      const plant=sample(locked);
      const entry=props[plant.id]??props[plant.nativeId]??{};
      patch.plantProps={...props,[plant.id]:{costumes:[],costume:-1,boost:0,tutorialLevel:0,medal:false,...entry,progress:2}};
      gift='获得 '+plant.name;
    }else{
      const total=gardenEconomy.trainingCount(p)+1;
      if(!Number.isSafeInteger(total))return null;
      next.trainingLayers=total;
      const choices=gardenCatalogue.filter(plan=>plan.id!=='imitater'&&owns(plan.id)&&Number(old.ranks[plan.id]||0)<6);
      if(choices.length){
        const plant=sample(choices),rank=Number(old.ranks[plant.id]||0)+1;
        next.ranks={...old.ranks,[plant.id]:rank};
        gift=plant.name+'升至'+rank+'阶 · 全队培养 +1';
      }else gift='全队培养 +1 层';
    }
    if(rootOwned||patch.plantProps?.powerplant?.progress>0){
      const record=patch.plantProps?.powerplant||props.powerplant||props[gardenNativeIds.get('powerplant')];
      for(const plan of tiles)if((props[plan.id]?.progress??props[plan.nativeId]?.progress??0)<=0){
        patch.plantProps||={...props};patch.plantProps[plan.id]=record;
      }
    }
    if(!save(p,patch))return null;
    settled.add(run);
    return {title:'专属挑战通关 · '+gift,detail:'金币 +10000　钻石 +20　升阶点 +'+amount};
  }
  function autoCollect(drop){
    return lootTypes.has(drop.DroppingType)&&enabled();
  }
  function collectGreen(counter){
    if(!enabled()||!counter.full()){counter.plantFoodAdd();return;}
    // A full bank can hold collected leaves in this run until a slot is spent.
    greenReserve.set(counter,(greenReserve.get(counter)||0)+1);
  }
  function refill(counter){
    const count=greenReserve.get(counter)||0;
    if(!count||!enabled()||counter.full())return;
    if(count===1)greenReserve.delete(counter);else greenReserve.set(counter,count-1);
    counter.plantFoodAdd();
  }
  function category(roll){
    return roll<.06?'gem':roll<.13?'gold':roll<.28?'silver':null;
  }
  function yetiWeight(type,weight) {
    return enabled()?weight*(type==='gem'?20:(type==='coin_silver'||type==='coin_gold')?10:1):weight;
  }
  function supplies(zombie,drop) {
    if(!zombie._gardenEventYeti || !enabled() || zombie.hypnotized)return;
    zombie._gardenEventYeti=false;
    drop.dropOneTicket(zombie.worldPosition);
    drop.dropOneSprout(zombie.worldPosition);
  }
  return {wallet,saveBundle:save,spendGems,spendTraining,settle,autoCollect,collectGreen,refill,category,yetiWeight,supplies,enabled};
})();
