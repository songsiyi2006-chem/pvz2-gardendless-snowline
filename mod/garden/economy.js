const gardenBaseStats = (() => {
  const stages = Array.from({length:7}, (_,rank) => Object.freeze({
    damage: 1 + rank * .05,
    attackSpeed: 1 + rank * .05,
    health: 1 + rank,
  }));
  return rank => stages[Number.isInteger(rank) && rank >= 0 && rank <= 6 ? rank : 0];
})();

const gardenEconomy = (() => {
  const prices = Object.freeze([6, 10, 16, 24, 34, 46]);
  const rewards = Object.freeze([3, 5, 8, 12]);
  const field = "gardendlessGreenhouseV1";
  const sessions = new WeakMap();
  let notify = () => {};
  const owner = () => window.System?.get("chunks:///_virtual/PlayerProperties.ts")?.AllPlayerProperties;
  const profile = () => {
    const game = owner();
    return game?.allPlayers?.includes(game.currentPlayer) ? game.currentPlayer : null;
  };
  const validNumber = n => Number.isSafeInteger(n) && n >= 0;
  // Legacy profiles already paid for each recorded rank. Derive the total once
  // per immutable save snapshot, then carry it forward in the purchase itself.
  const inferred = new WeakMap();
  function layers(value) {
    if (validNumber(value.trainingLayers)) return value.trainingLayers;
    if (!inferred.has(value)) {
      let total = 0;
      for (const [id, rank] of Object.entries(value.ranks)) {
        if (id !== 'imitater' && gardenPlantIds.has(id) && Number.isInteger(rank) && rank > 0 && rank <= 6) total += rank;
      }
      inferred.set(value, total);
    }
    return inferred.get(value);
  }
  function trainingCount(player=profile()) {
    return player?.[field] ? layers(read(player)) : 0;
  }
  function mode(id) {
    const index=profile()?.[field]?.modes?.[id];
    return index===1 || index===2 ? index : 0;
  }
  function chooseMode(id, index) {
    const p=profile();
    if (!p || !gardenPlantIds.has(id) || rank(id)!==6 || !Number.isInteger(index) || index<0 || index>2) return false;
    const old=read(p);
    if(mode(id)===index)return true;
    return commit(p,{...old,modes:{...old.modes,[id]:index}});
  }
  function mastery(id,index,p=profile()){
    if(!p||id==='imitater'||!gardenPlantIds.has(id)||!owns(p,id)||intrinsicRank(p,id)!==6||!Number.isInteger(index)||index<0||index>2)return 0;
    const n=read(p).modeMastery?.[id]?.[index];
    return Number.isInteger(n)&&n>=1&&n<=4?n:0;
  }
  let buyingMastery=false;
  function buyMastery(id,index,expected,p=profile()){
    if(buyingMastery||p!==profile()||!p||id==='imitater'||!gardenPlantIds.has(id)||!owns(p,id)||intrinsicRank(p,id)!==6||
        !Number.isInteger(index)||index<0||index>2||!Number.isInteger(expected)||expected<0||expected>=gardenModeMastery.price.length||mastery(id,index,p)!==expected)return false;
    buyingMastery=true;
    try{
      const old=read(p),all=old.modeMastery||{},slot={...all[id],[index]:expected+1};
      return gardenChallengeRewards.spendTraining(gardenModeMastery.price[expected],{...old,modeMastery:{...all,[id]:slot}},p);
    }finally{buyingMastery=false;}
  }
  function read(player) {
    const value = player?.[field];
    if (!value) return {points: 0, ranks: {}};
    if (!validNumber(value.points) || !value.ranks || typeof value.ranks !== "object") {
      throw new Error("温室存档数据异常");
    }
    if (Object.hasOwn(value.ranks, "imitater") && profile() === player) {
      const {imitater: oldRank, ...ranks} = value.ranks;
      const paid = Number.isInteger(oldRank) && oldRank >= 1 && oldRank <= prices.length;
      const refund = paid ? prices.slice(0,oldRank).reduce((sum,price)=>sum+price,0) : 0;
      if (!validNumber(value.points + refund)) throw new Error("升阶点数超出存档上限");
      const migrated = {...value,points:value.points+refund,ranks};
      if (commit(player,migrated)) {
        if (refund) notify("模仿者升阶点已退回","+"+refund+" 点 · 余额 "+migrated.points);
        return migrated;
      }
    }
    return value;
  }
  function intrinsicRank(player, id) {
    const n = read(player).ranks[id];
    return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
  }
  function owns(player, id) {
    const plants=player?.plantProps;
    return (plants?.[id]?.progress ?? plants?.[gardenNativeIds.get(id)]?.progress ?? 0) > 0;
  }
  function rank(id) {
    const p = profile();
    return p && id !== "imitater" && owns(p, id) ? intrinsicRank(p, id) : 0;
  }
  function commit(p, value) {
    const game = owner();
    if (game?.currentPlayer !== p || !game.allPlayers.includes(p)) return false;
    const old = p[field];
    p[field] = value;
    try { game.savePP(); }
    catch (error) {
      if (old === undefined) delete p[field]; else p[field] = old;
      throw error;
    }
    return true;
  }
  function buy(id, expectedRank) {
    const p = profile();
    if (!p || id === "imitater" || !gardenPlantIds.has(id) || !owns(p,id)) return false;
    const old = read(p);
    const r = intrinsicRank(p, id);
    const cost = prices[r];
    if (r !== expectedRank || r === 6 || old.points < cost) return false;
    const total=layers(old)+1;
    if(!validNumber(total)) return false;
    return commit(p, {...old, points: old.points - cost, trainingLayers:total, ranks: {...old.ranks, [id]: r + 1}});
  }
  function trainAgain(id, expectedLayers) {
    const p=profile();
    if (!p || !gardenPlantIds.has(id) || rank(id)!==6) return false;
    const old=read(p), count=layers(old),cost=prices[5];
    if (count!==expectedLayers || !validNumber(count+1) || old.points<cost) return false;
    return commit(p,{...old,points:old.points-cost,trainingLayers:count+1});
  }
  // Native gameStart is reached after the level's difficulty and identity have been resolved.
  function canChallenge(play) {
    return !!play && !!profile() && !owner().practiceProfile && !play.sandBoxModeOn && !play.GitHubLevelName;
  }
  function start(level, play, player) {
    sessions.delete(level);
    const difficulty = level.difficulty - 3;
    if (!canChallenge(play) || player !== profile() || !Number.isInteger(difficulty) || rewards[difficulty] === undefined) return;
    const challenge = difficulty === 3 && gardenChallenge.active(level);
    if (!challenge && !play.thisLevelsID?.some(id => gardenLevelIds.has(id))) return;
    sessions.set(level, {player, difficulty, challenge});
  }
  function win(level) {
    const run = sessions.get(level);
    if (!run || run.player !== profile() || level.gameLost || !level.gameStarted) return;
    const old = read(run.player);
    const amount = rewards[run.difficulty];
    if(run.challenge){
      const prize=gardenChallengeRewards.settle(level,run.player,amount*5,run);
      if(prize){sessions.delete(level);notify(prize.title,prize.detail);}
      return;
    }
    if (!validNumber(old.points + amount)) return;
    if (commit(run.player, {...old, points: old.points + amount})) {
      sessions.delete(level);
      notify("通关  +" + amount + " 升阶点", "难度 " + ["Ⅰ","Ⅱ","Ⅲ","Ⅳ"][run.difficulty] + " · 余额 " + (old.points + amount));
    }
  }
  function saveSimulationDefaults(p,settings){
    return !!p&&p===profile()&&commit(p,{...read(p),simulationDefaults:gardenChallenge.simulationSettings(settings)});
  }
  return Object.freeze({prices, rewards, profile, rank, owns, buy, trainAgain, read, start, win, trainingCount, mode, chooseMode, mastery, buyMastery, saveSimulationDefaults,canChallenge, onNotice(fn) { notify = fn; }});
})();

const gardenTrainingSpeed = .005;
function gardenEffectiveStats(rank, code, previewMode) {
  const personal=gardenBaseStats(rank);
  const layers=gardenEconomy.trainingCount();
  const id=(typeof forms!=='undefined' && forms.get(code)) || code;
  const stance=rank===6 && id ? gardenModes.speedFactor(id,previewMode??gardenChallenge.equippedMode(id)??gardenEconomy.mode(id)) : 1;
  const recon=typeof gardenPlantCritical!=='undefined'&&gardenPlantCritical.recon();
  const talent=typeof gardenTalents!=='undefined'?gardenTalents.bonuses():null;
  const actionSpeed=(personal.attackSpeed+layers*gardenTrainingSpeed)*(recon?1.15:1)*(talent?.speed??1);
  return {damage:personal.damage,actionSpeed,attackSpeed:actionSpeed*stance,health:(personal.health+layers*.03)*(talent?.health??1),critChance:(recon ? .17 : .05)+(talent?.crit??0),critMultiplier:1.5+(talent?.critPower??0)};
}
