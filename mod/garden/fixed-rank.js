// Classify the level's actual modules before its first preplanted plant spawns.
// Never use the chooser's current visibility: it is hidden in all running games.
const gardenFixed = (() => {
  const rifts = new Set(/*RIFT_LEVEL_IDS*/[]);
  const levels = new WeakMap(), sunRules=new WeakMap(), heavyChoices=new WeakMap();
  const knownProducers=new Set('sunflower twinsunflower sunshroom primalsunflower moonflower shinevine goldbloom solartomato goldleaf sunbean moonbean solarsage toadstool enlightenmint'.split(' '));
  function producesSun(id){
    if(knownProducers.has(id)||id==='marigold')return true;
    const native=window.System?.get?.('chunks:///_virtual/Plants.ts')?.plants?.sunProducers;
    return !!(native?.includes(id)||gardenCompatible.get(id)?.sunProducer);
  }
  function equipment(level,saved){
    if(!sunRules.get(level))return saved;
    const support=saved.filter(id=>!['sniper','prism','rotary','bombard','airwing'].includes(id));
    const heavy=heavyChoices.has(level)?heavyChoices.get(level):'sniper';
    return heavy?[...support,heavy]:support;
  }
  function chooseHeavy(level,id){
    if(!sunRules.get(level)||level.gameStarted||!['sniper','prism','rotary','bombard',null].includes(id))return false;
    if(id&&id!=='sniper'&&!gardenArmory.inventory().owned.includes(id))return false;
    heavyChoices.set(level,id);return true;
  }
  function prepare(level, play, definition, resolver) {
    const objects = ref => resolver.getObjectsByRTID(ref, null, level.currentLevelObjects);
    let seedBank, conveyor = false,lastStand=false;
    const given=[];
    const parents = new Set();
    function read(refs) {
      for (const ref of refs || []) {
        if (typeof ref !== 'string' || parents.has(ref)) continue;
        parents.add(ref);
        for (const entry of objects(ref)) {
          const data = entry.objdata;
          switch (entry.objclass) {
            case 'SeedBankProperties': seedBank = data; break;
            case 'ConveyorSeedBankProperties': conveyor = true; break;
            case 'LastStandMinigameProperties': lastStand=true;break;
            case 'InitialPlantProperties': for(const p of data?.InitialPlantPlacements||[])given.push(p.TypeName);break;
            case 'ProtectThePlantChallengeProperties': for(const p of data?.Plants||[])given.push(p.PlantType);break;
            case 'VaseBreakerPresetProperties': for(const p of data?.Vases||[])given.push(p.PlantTypeName);break;
            case 'StarChallengeModuleProperties': read(data?.Challenges?.[0]); break;
          }
        }
        parents.delete(ref);
      }
    }
    read(definition?.Modules);
    // Some authored levels open a chooser but lock the whole preset, or only
    // allow a player to pick one of several immutable challenge decks.
    const preset = new Set((seedBank?.PresetPlantList || []).map(row => row.PlantType).filter(Boolean));
    const allow = Array.isArray(seedBank?.PlantIncludeList)
      ? new Set([...seedBank.PlantIncludeList, ...preset]) : null;
    const slots = Math.min(8, Number(seedBank?.OverrideSeedSlotsCount) > 0
      ? Number(seedBank.OverrideSeedSlotsCount) : (play.BaseSeedSlotcount || 6));
    const locked = seedBank?.CardDecks?.ChallengingLocked || preset.size >= slots ||
      (allow !== null && allow.size <= slots);
    const forced = play.thisLevelsID?.some(id => rifts.has(id)) || conveyor ||
      seedBank?.SelectionMethod !== 'chooser' || locked;
    levels.set(level, !!forced);
    const native=typeof window!=='undefined'&&window.System?.get?.('chunks:///_virtual/Plants.ts')?.plants?.sunProducers||[];
    const producers=new Set([...native,...knownProducers]),hasSun=list=>list.some(id=>producers.has(id));
    // Spawned and preset plants remain usable even when the chooser bans their seeds.
    for(const e of level.currentLevelObjects||[])if(e.objclass==='SpawnPlantsWaveActionProps')
      for(const p of e.objdata?.Plants||[])given.push(p.TypeName);
    const blocked=new Set([...(seedBank?.PlantExcludeList||[]),...(seedBank?.PlantBlackList||[])]);
    const bansSun=String(seedBank?.ExcludeListSunProducers)==='true'||!!seedBank?.PlantBlackList?.length;
    const menus=seedBank?.CardDecks?.ChallengingLocked?
      (seedBank.CardDecks.Challenging||[]).flatMap(d=>d.Plants||[]):[];
    const selectable=seedBank?.SelectionMethod==='chooser'&&!locked&&!bansSun&&
      [...(allow||producers)].some(id=>producers.has(id)&&!blocked.has(id));
    const canProduce=hasSun([...given,...preset,...menus])||selectable||
      (seedBank?.SelectionMethod==='chooser'&&allow&&!seedBank?.CardDecks?.ChallengingLocked&&!bansSun&&
       preset.size<slots&&[...allow].some(id=>producers.has(id)&&!blocked.has(id)));
    sunRules.set(level,conveyor||lastStand||!canProduce);
  }
  function inLevel() {
    const system = window.System;
    const level = system?.get('chunks:///_virtual/levelController.ts')?.LevelPlay?.component;
    if (!level || levels.get(level) !== true) return false;
    const scene = system.get(system.resolve('cc'))?.director?.getScene();
    return scene?.name === 'inGameScene' && level.node?.scene === scene;
  }
  return {prepare,inLevel,equipment,chooseHeavy,producesSun,noSunProduction:level=>sunRules.get(level)===true};
})();

function gardenBattleRank(id) {
  id=gardenCompatible.code(id);
  return gardenChallenge.rank(id) ?? (gardenFixed.inLevel() ? 5 : gardenEconomy.rank(id));
}
