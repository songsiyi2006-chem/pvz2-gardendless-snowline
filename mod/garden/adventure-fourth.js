// Ordinary encounters retain the authored victory conditions, including timed
// and puzzle objectives. Only the legacy IV couriers need the ground-wave filter.
const gardenAdventureFourth=(()=>{
  const runs=new WeakMap();
  const world=/^(?:egypt|pirate|cowboy|kongfu|future|dark|beach|iceage|lostcity|sky|eighties|dino|modern)\d+$/;
  const scripted=/Zomboss|Beghouled|VaseBreaker|BowlingMinigame|CowboyMinigame|SkyMiniGame|CamelMinigame|CannonMinigame|AirRaidZombieWinCondition|JumpToWave|LoseGameWaveAction/i;
  const get=n=>window.System.get('chunks:///_virtual/'+n+'.ts');
  const play=()=>get('levelController').LevelPlay;
  const parts=Object.freeze({
    helmet:{max:300,reduction:.22,blast:.30},vest:{max:450,reduction:.30,blast:.40},door:{max:650,reduction:.55,blast:0}
  });
  const tiers=Object.freeze([
    {armored:6,pairs:1,hp:.38,damage:.30,lead:23,gap:22,cap:1},
    {armored:12,pairs:2,hp:.50,damage:.45,lead:20,gap:19,cap:2},
    {armored:20,pairs:3,hp:.65,damage:.65,lead:17,gap:16,cap:2},
    {armored:30,pairs:4,hp:.82,damage:.85,lead:14,gap:13,cap:3}
  ].map(Object.freeze));
  function couriers(level,controller){
    const definition=level.levelDefinition,modules=definition?.Modules||[],objects=level.currentLevelObjects;
    if(!world.test(controller.thisLevelsID?.[0]||'')||controller.GitHubLevelName||!Array.isArray(objects)||
       level.isDangerroom||level.isDangerroomMiniGame||level.isVasebreaker||level.isCowboyMinigame||
       !modules.some(r=>/ZombiesDeadWinCon@/.test(r))||modules.some(r=>scripted.test(r))||
       objects.some(x=>scripted.test(x.objclass)||scripted.test(x.aliases?.join(' '))))return [];
    const count=level.waveManagerProps?.Waves?.length||0;
    if(count<3)return [];
    return count>=16?[Math.floor(count*.4),Math.floor(count*.75)]:[Math.floor(count*.55)];
  }
  function run(level){
    if(!level||level.gameWon||level.gameLost||level.gameOver||gardenChallenge.active(level))return null;
    const controller=play();
    if(controller.component!==level||level.node?.scene?.name!=='inGameScene')return null;
    if(!runs.has(level)){
      const selected=get('PlayerProperties').AllPlayerProperties.currentPlayer?.difficulty;
      const d=Number.isInteger(level.difficulty)&&level.difficulty>=3&&level.difficulty<=6?level.difficulty-3:Math.max(0,Math.min(3,selected||0));
      runs.set(level,{d,tier:tiers[d],credit:50,issued:0,sent:new Set()});
    }
    return runs.get(level);
  }
  function kit(z,options,preview){
    const l=play().component;
    if(preview||!l?.gameStarted||options?.gardenAlly)return null;
    const r=run(l);if(!r)return null;
    r.credit+=r.tier.armored;
    if(r.credit<100)return null;
    r.credit-=100;r.issued++;
    return r.d===3&&r.issued%5===0?['helmet','vest','door']:['helmet','vest'];
  }
  function addCourier(level,index,events){
    if(!Array.isArray(events)||index<1)return events;
    const r=run(level);
    if(!r||r.d!==3)return events;
    r.schedule??=couriers(level,play());
    if(!r.schedule.includes(index)||r.sent.has(index))return events;
    const square=get('Square').Square,last=square.ColumnCount-1;
    const rows=level.onlyLanesForRandomSpawn?.length?level.onlyLanesForRandomSpawn:Array.from({length:square.LaneCount},(_,i)=>i);
    let best=-1,lanes=[];
    for(const row of rows){
      let column=-1;
      for(let i=0;i<=last;i++){
        const tile=square.getLnC(row,i);
        if(!tile||tile.isSkyOrSea())break;
        column=i;
      }
      if(column<3||column<best)continue;
      if(column>best){best=column;lanes=[];}
      lanes.push(row);
    }
    if(!lanes.length)return events;
    const alias='GardenAdventureYeti'+index,unit={Type:'RTID(treasureyeti@ZombieTypes)',Row:lanes[index%lanes.length]+1};
    if(best<last)unit.Column=best+1;
    level.currentLevelObjects.push({aliases:[alias],objclass:'SpawnZombiesJitteredWaveActionProps',objdata:{SkipZombieView:true,Zombies:[unit]}});
    r.sent.add(index);
    return [...events,'RTID('+alias+'@CurrentLevel)'];
  }
  return Object.freeze({kit,parts,addCourier,run,tiers});
})();
