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
  const rewardTable=Object.freeze([1,1.5,2].map(weight=>Object.freeze({
    weight,coin:10000*weight,gem:20*weight,points:60*weight
  })));
  const terms=tier=>rewardTable[tier]??rewardTable[0];
  const activeTerms=()=>terms(gardenChallenge.activeTyrant?.()??0);
  function rolledCount(amount,weight,roll=Math.random){
    const exact=amount*weight,base=Math.floor(exact),fraction=exact-base;
    return base+Number(fraction>0&&roll()<fraction);
  }
  const settling=new WeakSet(),rolls=new WeakMap();
  function award(level,p,amount,run){
    const tier=run.tyrantTier??gardenChallenge.activeTyrant?.(level)??0;
    const reward=terms(tier),points=amount*reward.weight;
    const {coin,gem}=wallet(p),old=gardenEconomy.read(p);
    if(!safe(coin)||!safe(gem)||!safe(coin+reward.coin)||!safe(gem+reward.gem)||!Number.isSafeInteger(old.points+points))return null;
    const next={...old,points:old.points+points},patch={coin:coin+reward.coin,gem:gem+reward.gem,[field]:next};
    const props=p.plantProps||{},gifts=[];
    const savedRolls=rolls.get(run)??[];
    rolls.set(run,savedRolls);
    let cursor=0;
    const roll=()=>{
      if(cursor===savedRolls.length)savedRolls.push(Math.random());
      return savedRolls[cursor++];
    };
    const sample=list=>list[Math.floor(roll()*list.length)];
    const pending=level.levelDefinition?.FirstRewardType==='unlock_plant'?level.levelDefinition.FirstRewardParam:null;
    const owned=id=>(patch.plantProps?.[id]?.progress??0)>0||gardenEconomy.owns(p,id);
    const owns=id=>owned(id)||(id.startsWith('powerplant_')&&owned('powerplant'));
    let layers=gardenEconomy.trainingCount(p);
    const count=rolledCount(1,reward.weight,roll);
    for(let i=0;i<count;i++){
      const locked=gardenCatalogue.filter(plan=>!plan.id.startsWith('powerplant_')&&!owns(plan.id)&&plan.id!==pending);
      if(locked.length){
        const plant=sample(locked),entry=props[plant.id]??props[plant.nativeId]??{};
        patch.plantProps??={...props};
        patch.plantProps[plant.id]={costumes:[],costume:-1,boost:0,tutorialLevel:0,medal:false,...entry,progress:2};
        gifts.push('获得 '+plant.name);
      }else{
        if(!Number.isSafeInteger(++layers))return null;
        next.trainingLayers=layers;
        const choices=gardenCatalogue.filter(plan=>plan.id!=='imitater'&&owns(plan.id)&&Number(next.ranks[plan.id]||0)<6);
        if(choices.length){
          const plant=sample(choices),rank=Number(next.ranks[plant.id]||0)+1;
          next.ranks={...next.ranks,[plant.id]:rank};
          gifts.push(plant.name+'升至'+rank+'阶 · 全队培养 +1');
        }else gifts.push('全队培养 +1 层');
      }
    }
    // The stock game stores the five colour variants under their parent turnip.
    if(owned('powerplant')){
      const record=patch.plantProps?.powerplant||props.powerplant||props[gardenNativeIds.get('powerplant')];
      for(const plan of gardenCatalogue)if(plan.id.startsWith('powerplant_')&&!owned(plan.id)){
        patch.plantProps??={...props};patch.plantProps[plan.id]=record;
      }
    }
    if(!save(p,patch))return null;
    settled.add(run);rolls.delete(run);
    const title=['专属挑战','铁血枭雄','铁血枭雄（噩梦）'][tier]??'专属挑战';
    return {title:title+'通关 · '+gifts.join('、'),detail:'金币 +'+reward.coin+'　钻石 +'+reward.gem+'　升阶点 +'+points};
  }
  function settle(level,p,amount,run){
    if(!run?.challenge||run.difficulty!==3||run.player!==p||settled.has(run)||settling.has(run)||p!==gardenEconomy.profile()||
        !level?.gameStarted||level.gameLost||!Number.isSafeInteger(amount)||amount<=0)return null;
    settling.add(run);
    try{return award(level,p,amount,run);}
    finally{settling.delete(run);}
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
    roll/=activeTerms().weight;
    return roll<.06?'gem':roll<.13?'gold':roll<.28?'silver':null;
  }
  function yetiWeight(type,weight) {
    return enabled()?weight*(type==='gem'?20:(type==='coin_silver'||type==='coin_gold')?10:1):weight;
  }
  function supplies(zombie,drop) {
    if(!zombie._gardenEventYeti || !enabled() || zombie.hypnotized)return;
    zombie._gardenEventYeti=false;
    const count=fieldCount(1);
    for(let i=0;i<count;i++){
      drop.dropOneTicket(zombie.worldPosition);
      drop.dropOneSprout(zombie.worldPosition);
    }
  }
  function fieldCount(amount){
    const weight=activeTerms().weight;
    return weight===1?amount:rolledCount(amount,weight);
  }
  return {terms,wallet,saveBundle:save,spendGems,spendTraining,settle,autoCollect,collectGreen,refill,category,yetiWeight,fieldCount,supplies,enabled};
})();
