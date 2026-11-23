const gardenTitan=(()=>{
  const quota=6, sessions=new WeakMap(), units=new WeakMap();
  const mod=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  function run(level){
    let s=sessions.get(level);
    if(!s){s={born:0,next:0,clock:0,pending:false,finish:null,live:new Set()};sessions.set(level,s);}
    return s;
  }
  function state(z){return units.get(z);}
  function is(z){return units.has(z);}
  function release(z){
    const body=units.get(z);
    if(!body)return;
    delete z._gardenTitan;
    body.run.live.delete(z);
    gardenTitanArt.release(body);
    units.delete(z);
  }
  function birth(z,options){
    release(z);
    const ticket=options?.gardenTitanTicket;
    if(!ticket||!gardenChallenge.active(ticket.level))return;
    const body={run:run(ticket.level),ticket,apsReady:0,flash:0};
    z._gardenTitan=true;
    units.set(z,body);
  }
  function kit(z,s){
    if(!is(z))return;
    const part=(hp,rate)=>({hp,max:hp,reduction:rate,blastReduction:.99});
    s.heavy=s.elite=true;
    s.shield=part(42000,.89);
    s.helmet=part(9500,.58);
    s.vest=part(17000,.70);
    s.extraHealth=10500;
  }
  function armored(z){
    const s=gardenChallengeArmor.state(z);
    return is(z)&&!!s&&(s.shield.hp+s.helmet.hp+s.vest.hp>0);
  }
  function absorb(z,s,p,original){
    const body=state(z);
    if(!body||!armored(z)||p._gardenTrueDamage)return original.call(z,p);
    const blast=p._gardenExplosive||p._gardenBlast||p._gardenHitKind==='splash'||p.damageType===3||Number.isFinite(gardenChallengeTroopers.originX());
    const pierce=p._gardenPiercing||p._gardenHitKind==='pierce'||p._gardenHitKind==='rotary-ap'||
      p._gardenSimulationId==='laserbean'||p._gardenSimulationId==='fumeshroom'||p.armorProtection===false||p.damageType===4;
    const front=s.shield.hp>0?s.shield:s.vest.hp>0?s.vest:s.helmet;
    const power=gardenChallengeArmor.piecePower(s,front);
    const fracture=gardenChallengeArmor.protectionFactor(z,s,p,power);
    const bypass=blast?Math.max(0,Math.min(1,p._gardenBlastBypass||0))*power:0;
    const piercingRate=1-.01*(front.breachScale??1);
    const rate=(blast?front.blastReduction:pierce?piercingRate:front.reduction)*fracture*(1-bypass);
    let stop=p.damage*rate;
    const now=body.run.clock;
    // The AI visor can spend one countermeasure against a heavy direct shot.
    // Nuclear blasts, piercing rounds and damage-over-time keep their own damage rules.
    if(!blast&&!pierce&&s.helmet.hp>0&&p.damage>=240&&now>=body.apsReady){
      body.apsReady=now+5.5;body.flash=now+.35;stop=p.damage*fracture;
    }
    let wear=stop;
    for(const plate of [s.shield,s.vest,s.helmet]){
      const amount=Math.min(plate.hp,wear);
      plate.hp-=amount;wear-=amount;
      if(wear<=0)break;
    }
    s.revision++;
    const damage=p.damage-stop+wear;
    const next=Object.assign(Object.create(Object.getPrototypeOf(p)),p,{_damage:damage,_gardenArmorPass:true});
    return original.call(z,next);
  }
  function due(s,level){
    if(s.finish)return quota;
    const total=level.waveManagerProps?.Waves?.length||0;
    const fromTime=Math.floor((s.clock-24)/22)+1;
    const fromWave=total?Math.floor((level.currentWave||0)*7/total):0;
    return Math.max(0,Math.min(quota,Math.max(fromWave,fromTime)));
  }
  function landing(level,ordinal){
    const square=mod('Square').Square;
    const rows=level.onlyLanesForRandomSpawn?.length?level.onlyLanesForRandomSpawn:Array.from({length:square.LaneCount},(_,i)=>i);
    const last=square.ColumnCount-1;
    let fallback;
    for(let i=0;i<rows.length;i++){
      const row=rows[(ordinal+i)%rows.length];
      for(let col=last;col>=0;--col){
        const tile=square.getLnC(row,col);
        if(!tile)continue;
        fallback??=tile;
        if(!tile.isSkyOrSea())return {tile,style:col===last?undefined:mod('LnC').LnCSpawnZombieStyleEnum.dirtspawn};
      }
    }
    return fallback?{tile:fallback,style:mod('LnC').LnCSpawnZombieStyleEnum.appear}:null;
  }
  async function deploy(level,s){
    const target=landing(level,s.born);
    if(!target)return;
    const ticket={level};
    const bodies=await target.tile.SpawnZombieByZombieType('tutorial_gargantuar',target.style,false,.5,0,{gardenTitanTicket:ticket},true,false,false);
    for(const z of bodies||[]){
      const body=state(z);
      if(!body||body.ticket!==ticket)continue;
      if(!gardenChallenge.active(level)||level.gameWon||level.gameOver||level.gameLost){
        mod('NodePools').destroyPooly(z.node);continue;
      }
      if(!z.node?.activeInHierarchy||z.dead)continue;
      z.haveImp=false;
      const edge=target.tile.plantPoint?.worldPosition?.x,width=mod('Square').Square.SquareWidth;
      if(Number.isFinite(edge))z.worldPositionX=Math.min(z.worldPositionX,edge+width*.90);
      z.judgeInLnC();level.registerZombieInThisWave(z);
      s.live.add(z);s.born++;
      gardenTitanArt.pose(z,body);
    }
  }
  function holdVictory(level,args){
    if(!gardenChallenge.active(level)||!level.gameStarted||level.gameWon||level.gameLost)return false;
    const s=run(level);
    if(s.born>=quota&&!s.live.size)return false;
    s.finish??={args:Array.from(args),wave:gardenChallengeHybrids.isWaveVictory(level)};
    return true;
  }
  function tick(level,dt){
    if(!gardenChallenge.active(level)||!level?.gameStarted||!(dt>0))return;
    if(level.gameWon||level.gameLost||level.gameOver){
      if(sessions.has(level)&&typeof gardenTitanRockets!=='undefined')gardenTitanRockets.tick(level,dt,[]);
      return;
    }
    const s=run(level);s.clock+=dt;
    for(const z of s.live){
      const body=state(z);
      if(!body||z.dead||z.hypnotized||!z.node?.activeInHierarchy||!z.isAlive()){s.live.delete(z);if(body)gardenTitanArt.release(body);continue;}
      gardenTitanArt.pose(z,body);
    }
    if(typeof gardenTitanRockets!=='undefined')gardenTitanRockets.tick(level,dt,s.live);
    if(s.finish&&s.born>=quota&&!s.live.size&&!s.pending){
      const finish=s.finish;s.finish=null;
      if(finish.wave)gardenChallengeHybrids.judgeWaves(level);else level.victory(...finish.args);
      return;
    }
    if(s.pending||s.clock<s.next||s.born>=due(s,level)||s.clock<gardenChallenge.openingSeconds)return;
    s.pending=true;s.next=s.clock+(s.finish?1:3.4);
    deploy(level,s).catch(err=>{if(gardenChallenge.active(level))console.error('[Snowline titan]',err);})
      .finally(()=>{s.pending=false;});
  }
  return {quota,is,armored,state,release,birth,kit,absorb,holdVictory,tick,
    coverage(level){const s=sessions.get(level);return s?{born:s.born,living:s.live.size,pending:s.pending}:null;}};
})();
