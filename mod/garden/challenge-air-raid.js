// The challenge schedules volleys. The Egyptian Zomboss prefab supplies its
// original aiming reticle, audio, projectile and impact behavior.
const gardenAirRaid=(()=>{
  const battles=new WeakMap();
  const mod=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  const between=(min,max)=>min+Math.random()*(max-min);
  const valid=level=>!!level.node?.isValid && !level.gameLost && !level.gameWon && !level.gameOver && gardenChallenge.active(level);
  const remove=node=>{if(node?.isValid&&node.parent)mod('NodePools').destroyPooly(node);};
  let assets;
  function loadAssets(){
    if(assets)return assets;
    const cc=window.System.get(window.System.resolve('cc'));
    const load=path=>new Promise((resolve,reject)=>cc.resources.load(path,cc.Prefab,(error,asset)=>error?reject(error):resolve(asset)));
    assets=Promise.all([load('zombies/EgyptZombossMechZOMBIE'),load('projectiles/EgyptZombossMissilePRJ')]).then(([prefab])=>{
      const component=mod('EgyptZombossMechZombie').EgyptZombossMechZombie;
      const boss=prefab.data.getComponent(component)||prefab.data.getComponentInChildren(component);
      if(!boss?.targetLocatorPrefab)throw Error('Missing Egyptian Zomboss targeting prefab');
      return boss;
    }).catch(error=>{assets=null;throw error;});
    return assets;
  }
  function clear(s){
    if(s.ended)return;
    s.ended=true;
    for(const [p,mark] of s.flying)if(p.locator===mark)remove(p.node);
    for(const mark of [...s.markers,...s.pending])if(mark.node?.activeInHierarchy&&mark.node.scene===s.level.node?.scene)remove(mark.node);
    s.markers=[];s.pending.clear();s.flying.clear();
  }
  function setup(level){
    const cc=window.System.get(window.System.resolve('cc'));
    const s={level,boss:null,loading:false,retry:0,delay:between(6,10),warning:0,markers:[],pending:new Set(),flying:new Map(),ended:false};
    cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,()=>clear(s));
    battles.set(level,s);return s;
  }
  function choose(s){
    const all=mod('Square').Square.getAllLnC().filter(tile=>tile?.plantPoint?.activeInHierarchy&&tile.isInLawn()&&
      (tile.getAllPlants().some(p=>p.isAlive())||
       !tile.isSkyOrSea()&&!tile.tombstone&&!tile.iceblock&&!tile.octopus&&!(tile.crackleCountdown>0)));
    const pick=list=>list[Math.floor(Math.random()*list.length)];
    const count=Math.min(all.length,Math.random()<.5?2:3),chosen=[];
    if(!count)return chosen;
    const planted=all.filter(cell=>cell.getAllPlants().some(p=>p.isAlive()));
    if(planted.length&&Math.random()<.65)chosen.push(pick(planted));
    while(chosen.length<count){
      const open=all.filter(tile=>!chosen.includes(tile));
      // Allow at most one planted target when an empty cell is available.
      const empty=open.filter(tile=>!planted.includes(tile));
      chosen.push(pick(chosen.length&&empty.length?empty:open));
    }
    return chosen;
  }
  function sound(clip,volume=1){if(clip)mod('SoundRescourses').sounds.playOneShot(clip,volume);}
  function aim(s){
    const cells=choose(s);if(!cells.length)return;
    const driver={targetLocatorPrefab:s.boss.targetLocatorPrefab,targetLocators:[]};
    for(const cell of cells)s.boss.spawnLocatorOnLnC.call(driver,cell);
    s.markers=driver.targetLocators;
    sound(s.boss.worldZombossAimStartSound);
    s.warning=2.4;
  }
  function launch(s){
    const marks=s.markers;
    s.pending=new Set(marks);
    const driver={
      objdataOwn:s.boss.objdataOwn,targetLocators:marks,worldZombossMechPRJDropSounds:s.boss.worldZombossMechPRJDropSounds,
      hypnotized:false,reversed:false,playOneShot:sound,
      dropMissileOnLnC(tile){
        if(s.ended||!valid(s.level))return Promise.reject(new Error('Finished challenge'));
        return s.boss.dropMissileOnLnC.call(this,tile);
      },
      missileMeasure(p){
        const mark=p.locator;
        if(s.ended||!valid(s.level)){
          p.locator=null;remove(p.node);
          if(s.pending.delete(mark)&&mark.node?.activeInHierarchy)remove(mark.node);
          return;
        }
        s.pending.delete(mark);
        s.flying.set(p,mark);
      }
    };
    // dropMissile owns the same locator-to-projectile handoff as a live boss.
    s.boss.dropMissile.call(driver).catch(error=>{
      if(!s.ended)console.warn('[Garden] Zomboss missile volley',error);
      for(const mark of s.pending)if(mark.node?.activeInHierarchy)remove(mark.node);
    }).finally(()=>s.pending.clear());
    s.delay=between(23,36);s.markers=[];
  }
  function tick(level,dt){
    if(!level)return;
    let s=battles.get(level);
    if(!valid(level)){if(s)clear(s);return;}
    const ui=mod('UI');
    if(!(dt>0)||!level.gaming||ui.UIInGame.component?.paused)return;
    if(gardenChallenge.flags(level)<1)return;
    if(!s)s=setup(level);
    if(s.ended)return;
    if(!s.boss){
      if(!s.loading&&(s.retry-=dt)<=0){
        s.loading=true;
        loadAssets().then(b=>{if(!s.ended)s.boss=b;}).catch(error=>{
          if(!s.ended)console.warn('[Garden] Zomboss missile resources',error);
          s.loading=false;s.retry=5;
        });
      }
      return;
    }
    for(const [p,mark] of s.flying)if(!p.node?.activeInHierarchy||p.locator!==mark)s.flying.delete(p);
    if(s.markers.length){
      // Preserve time to react when the player changes simulation speed mid-warning.
      s.warning-=dt/Math.max(1,ui.gamingSpeed||1);
      if(s.warning<=0)launch(s);
    }else if((s.delay-=dt)<=0){
      s.delay=1;aim(s);
    }
  }
  return {tick};
})();
