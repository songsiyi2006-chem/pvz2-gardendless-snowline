const gardenChallengeHybrids=(()=>{
  const sessions=new WeakMap(), identities=new WeakMap(), births=new WeakMap(), listeners=new Set(),waveJudges=new WeakSet();
  const originals=['melon','gatling','prism'];
  const baseHp={melon:840,gatling:780,prism:660};
  const mod=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  const roster=()=>typeof gardenHybridRoster==='undefined'?null:gardenHybridRoster;
  const troopers=()=>typeof gardenChallengeTroopers==='undefined'?null:gardenChallengeTroopers;
  const mortar=()=>typeof gardenChallengeMortar==='undefined'?null:gardenChallengeMortar;
  const registries=()=>[roster(),troopers(),mortar()].filter(Boolean);
  const opensAt=kind=>['prism','eliteguard','mortar'].includes(kind)?2:1;
  const firstFlag=['shieldguard','plant','plant','shieldguard','plant',null];
  const secondFlag=['mortar','prism','eliteguard','plant','shieldguard','plant','mortar','plant','shieldguard','plant','eliteguard',null];
  const laterFlags=['eliteguard','plant','mortar','plant','shieldguard','plant','mortar','shieldguard','eliteguard','plant','shieldguard',null];
  const fieldCaps={shieldguard:3,eliteguard:2,mortar:2};
  const ordinaryRun=l=>typeof gardenAdventureFourth!=='undefined'&&gardenAdventureFourth.run(l);
  const onField=s=>s.ordinary?ordinaryRun(s.level)===s.ordinary:gardenChallenge.active(s.level);
  const shuffle=items=>{
    for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
    return items;
  };
  function baseProps(raw,options,body){
    if(body){
      if(options?.gardenHybridTicket)births.set(body,options.gardenHybridTicket);
      else births.delete(body);
    }
    const kind=options?.gardenHybrid;
    if(!kind||!raw)return raw;
    const level=mod('levelController').LevelPlay.component,ordinary=options?.gardenOrdinary&&ordinaryRun(level);
    if(!ordinary&&(!gardenChallenge.active(level)||gardenChallenge.flags(level)<opensAt(kind)))return raw;
    const plant=roster()?.entries.find(e=>e.kind===kind),unit=plant||troopers()?.entries.find(e=>e.kind===kind)||mortar()?.entries.find(e=>e.kind===kind);
    if(!unit&&!originals.includes(kind))return raw;
    const hp=Math.max(raw.Toughness||190,baseHp[kind]??unit?.toughness??260);
    const base=plant||originals.includes(kind)?hp*1.8:hp;
    const props={...raw,Toughness:Math.max(raw.Toughness||1,Math.round(base*(ordinary?ordinary.tier.hp:1)))};
    if(kind==='shieldguard'||kind==='eliteguard'){
      props.GardenShieldguard=true;props.GardenEliteGuard=kind==='eliteguard';
      props.WalkSPS=(raw.WalkSPS??.185)*.5;props.WalkSPSVarience=(raw.WalkSPSVarience??.012)*.5;
    }
    return props;
  }
  function alivePlant(p){
    return !!p?.node?.activeInHierarchy && !p.dead && p.health>0 && !p.invincible && !p.fooding &&
      !!p.plantInLnC?.isInLawn?.() && p.damagable!==false;
  }
  const cell=p=>({r:p?.plantInLnC?.lIndex??p?.lIndex,c:p?.plantInLnC?.cIndex??p?.inLnC?.cIndex??p?.cIndex});
  const at=(r,c)=>mod('Square').Square.getLnC(r,c);
  const allPlants=()=>mod('CharacterManager').PlantPool.pool().filter(alivePlant);
  const enemies=()=>mod('CharacterManager').ZombiePool.pool().filter(z=>z.node?.activeInHierarchy&&!z.hypnotized&&z.isAlive()&&z.isInLawn());
  function targets(z,rows=1){
    return allPlants().filter(p=>Math.abs(cell(p).r-z.lIndex)<=rows && p.worldPositionX<=z.worldPositionX+6)
      .sort((a,b)=>Math.abs(cell(a).r-z.lIndex)-Math.abs(cell(b).r-z.lIndex)||b.worldPositionX-a.worldPositionX);
  }
  function hit(p,baseDamage){
    if(!alivePlant(p) || !(baseDamage>0) || !Number.isFinite(baseDamage))return 0;
    const before=p.health;
    // Native bites and zombie projectiles already use their scaled properties. These independent abilities
    // call the plant receiver directly, so apply the same challenge multiplier exactly once.
    const local=ordinaryRun(mod('levelController').LevelPlay.component);
    p.dealDamage(baseDamage*(local?local.tier.damage:gardenChallenge.modifiers.damage),0);
    return Math.max(0,before-p.health);
  }
  function sunlight(){return mod('SunCount')?.SunCount?.component;}
  function sunTake(n,overdraft=false){
    const bank=sunlight(), before=Number(bank?.CurrentValue);
    if(!Number.isFinite(before)||!Number.isFinite(n)||n<=0)return 0;
    const paid=overdraft?n:Math.min(Math.max(0,before),n);
    if(paid>0)bank.SunDec(paid,true,false,overdraft);
    return Math.max(0,before-bank.CurrentValue);
  }
  function sunGive(n){const bank=sunlight();if(bank&&Number.isFinite(n)&&n>0)bank.SunAdd(n);}
  function emit(type,r,extra={}){
    if(!listeners.size)return;
    const event={type,z:r.z,kind:r.kind,phase:r.phase,stage:r.stage,target:r.target,aim:r.aim,
      spent:r.spent,index:r.index,rage:r.rage,duration:r.duration,...extra};
    // Behavior deadlines use the attacker's clock; the art samples real game seconds.
    event.duration/=r.attackRate;
    if(Number.isFinite(event.scheduledAt))event.scheduledAt/=r.attackRate;
    for(const listener of listeners)listener(event);
  }
  function phase(r,name,seconds,target=null,extra={}){
    r.phase=name;r.duration=seconds;r.left=seconds;r.progress=0;r.target=target;r.aim=target?cell(target):null;
    r.targetLife=target?._gardenCombatStats || target;r.row=r.z.lIndex;r.lastX=r.z.worldPositionX;
    Object.assign(r,extra);
  }
  function recover(r,cooldown){
    r.phase='recovery';r.cooldown=cooldown;r.left=0;r.duration=0;r.progress=0;
    r.target=null;r.targetLife=null;r.aim=null;r.spent=0;r.stage=0;r.index=0;r.gatlingVolley=null;
  }
  function setup(level){
    if(sessions.has(level))return sessions.get(level);
    const behaviors=new Map();
    for(const registry of registries())for(const e of registry.entries||[])if(e.kind&&!originals.includes(e.kind))behaviors.set(e.kind,registry);
    const order=shuffle(['melon','gatling',...behaviors.keys()]);
    const ordinary=ordinaryRun(level);
    const s={level,order,ordinary,members:new Map(),seen:new Set(),flags:0,clock:0,next:Infinity,sent:0,
      inFlight:null,closing:false,lastKind:null,failures:new Map(),behaviors};
    if(ordinary){
      const plants=shuffle(['cabbage','medic','butter','chain','bulwark','apple','coconut']);
      const hard=shuffle(['melon','gatling','prism']);
      s.localPlan=[];
      for(let i=0;i<ordinary.tier.pairs;i++){
        s.localPlan.push(ordinary.d===3&&i===ordinary.tier.pairs-1?hard[0]:plants[i],'mortar');
      }
      s.next=0;
    }
    s.api={level,targets,allPlants,alivePlant,cell,at,hit,emit,phase,recover,sunTake,sunGive,enemies};
    const unsubscribe=gardenChallengeArmor.subscribe((z,name)=>{
      const r=s.members.get(z);if(name==='shield'&&r)emit('break',r,{part:'shield'});
    });
    const cc=window.System.get(window.System.resolve('cc'));
    cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,unsubscribe);
    sessions.set(level,s);return s;
  }
  function state(z){
    const r=identities.get(z);
    if(!r||!z.node?.activeInHierarchy||z.dead||z.hypnotized||!onField(r.run))return null;
    return r;
  }
  function cancel(r,code){
    if(r.phase==='idle'||r.phase==='recovery')return;
    if(r.kind==='prism'&&r.phase==='drain'&&r.spent>0 && onField(r.run)){
      sunGive(r.spent);
    }
    if(r.kind==='prism')r.prismDeadline=null;
    r.run.behaviors.get(r.kind)?.cancel?.(r.z,r,r.run.api);
    emit('cancel',r,{reason:code});recover(r,2.4);
  }
  function release(z){
    const r=identities.get(z);if(!r)return;
    cancel(r,'removed');emit('remove',r);
    identities.delete(z);r.run.members.delete(z);delete z._gardenHybridKind;
  }
  function allegiance(z,friendly){
    const r=identities.get(z);if(!r)return;
    if(friendly){cancel(r,'allegiance');emit('remove',r);}
    else {recover(r,2.4);emit('spawn',r);}
  }
  function phaseFlags(s){
    const flags=gardenChallenge.flags(s.level);
    if(flags<=s.flags||s.closing)return;
    s.flags=flags;s.sent=0;
    // Each genuine flag starts a fresh interval. A skipped wave creates no debt.
    s.next=s.clock+(flags===1?1.8:2.2);
  }
  function wave(level){
    if(gardenChallenge.active(level))phaseFlags(setup(level));
  }
  async function spawn(s,kind,ticket){
    const square=mod('Square').Square,last=square.ColumnCount-1;
    const allowed=(s.level.onlyLanesForRandomSpawn||[]).filter(r=>square.getLnC(r,last));
    const lanes=allowed.length?allowed:Array.from({length:square.LaneCount},(_,i)=>i);
    const land=lanes.filter(r=>{const tile=square.getLnC(r,last);return tile&&!tile.isSkyOrSea();});
    const pool=land.length?land:lanes, row=pool[Math.floor(Math.random()*pool.length)];
    const tile=square.getLnC(row,last);
    if(!tile||s.closing||!onField(s))return false;
    const carrier=land.length ? (s.failures.get(kind)>0?'tutorial':'lawn') : 'future_jetpack';
    const bodies=await tile.SpawnZombieByZombieType(carrier,undefined,false,.5,0,{gardenHybrid:kind,gardenHybridTicket:ticket,gardenOrdinary:!!s.ordinary},true,false,false);
    const z=bodies?.[0];
    if(!z?.node?.activeInHierarchy||z.dead||births.get(z)!==ticket)return false;
    if(s.closing||!onField(s)||s.level.gameWon||s.level.gameLost){
      // A prefab can finish loading after a script/cutscene already won. Return
      // solely this request's unregistered actor to its pool without a kill/drop.
      mod('NodePools').destroyPooly(z.node);return false;
    }
    if(!s.ordinary&&!gardenChallengeArmor.state(z))return false;
    const isPlant=originals.includes(kind)||s.behaviors.get(kind)===roster();
    const attackRate=!s.ordinary&&isPlant?2**gardenChallenge.activeTyrant(s.level):1;
    const r={kind,z,run:s,attackRate,phase:'idle',progress:0,target:null,aim:null,spent:0,index:0,rage:false,stage:0,left:0,duration:0,
      cooldown:kind==='prism'||kind==='gatling'?0:1.1+(s.seen.size%3)*.45,cycles:0};
    release(z);z._gardenHybridKind=kind;identities.set(z,r);s.members.set(z,r);s.seen.add(kind);s.lastKind=kind;
    // Native lane spacing can accumulate many cells while the regular surge is loading.
    // Introduce the elite at the visible right-hand approach, leaving the native swimmer/flight locomotion intact.
    const edge=tile.plantPoint?.worldPosition?.x;
    if(Number.isFinite(edge))z.worldPositionX=Math.min(z.worldPositionX,edge+square.SquareWidth*.85);
    z.judgeInLnC();s.level.registerZombieInThisWave(z);emit('spawn',r,{carrier});
    return true;
  }
  function send(s,kind,delay){
    const ticket={};s.inFlight=ticket;
    const flags=s.flags;s.next=s.clock+delay;
    const failed=()=>s.failures.set(kind,(s.failures.get(kind)||0)+1);
    spawn(s,kind,ticket).then(ok=>{
      if(ok){if(s.flags===flags)s.sent++;s.failures.delete(kind);}
      else if(!s.closing)failed();
    }).catch(error=>{failed();if(onField(s))console.error('[Garden hybrid]',kind,error);})
      .finally(()=>{if(s.inFlight===ticket)s.inFlight=null;});
  }
  function ordinaryDispatch(s){
    const tier=s.ordinary.tier,kind=s.localPlan[s.sent];
    if(!kind||livingReinforcements(s)>=tier.cap)return;
    const waves=s.level.waveManagerProps?.Waves?.length||0;
    const waveDue=waves>0&&s.level.currentWave>=Math.min(waves,Math.ceil(waves*(s.sent+1)/(s.localPlan.length+1)));
    if(!waveDue&&s.clock<tier.lead+s.sent*tier.gap)return;
    // Spaced even when an authored jump skips many wave numbers. Scripted
    // victory always wins a race against an asynchronous prefab load.
    send(s,kind,Math.max(3,tier.gap*.34));
  }
  function dispatch(s){
    if(s.closing||s.inFlight||s.clock<s.next)return;
    if(s.ordinary){ordinaryDispatch(s);return;}
    if(!s.flags)return;
    const first=s.flags===1,second=s.flags===2;
    if(s.sent>=(first?6:second?s.order.length+9:18)||livingReinforcements(s)>=(first?3:second?7:9))return;
    const counts={};
    for(const [z,r] of s.members)if(z.node?.activeInHierarchy&&!z.hypnotized&&z.isAlive())counts[r.kind]=(counts[r.kind]||0)+1;
    const open=(first?s.order.filter(k=>opensAt(k)===1):[...s.order,'prism']).filter(k=>(counts[k]||0)<(fieldCaps[k]??Infinity));
    if(!open.length)return;
    const unseen=open.filter(k=>!s.seen.has(k));
    const varied=open.filter(k=>k!==s.lastKind);
    const pool=unseen.length?unseen:varied.length?varied:open;
    // Repeated asset failures yield to other eligible species. A single failure
    // retries later on the fallback carrier, without blocking a level objective.
    const failures=k=>s.failures.get(k)||0;
    let kind=pool.reduce((best,k)=>failures(k)<failures(best)?k:best,pool[0]);
    if(!unseen.length&&pool.length)kind=pool[Math.floor(Math.random()*pool.length)];
    const slots=first?firstFlag:second?secondFlag:laterFlags;
    const preferred=slots[s.sent%slots.length];
    if(preferred==='plant'){
      const isPlant=k=>originals.includes(k)||s.behaviors.get(k)===roster();
      const plants=pool.filter(isPlant),fallback=open.filter(isPlant);
      if(plants.length)kind=plants[Math.floor(Math.random()*plants.length)];
      else if(fallback.length)kind=fallback[Math.floor(Math.random()*fallback.length)];
    }else if(preferred&&open.includes(preferred)&&!failures(preferred))kind=preferred;
    if(!kind)return;
    send(s,kind,first?5.3:second?3.2:2.6);
  }
  function judgeWaves(level){
    waveJudges.add(level);
    try{return level.judgeVictory();}finally{waveJudges.delete(level);}
  }
  function livingReinforcements(s){
    let count=0;
    for(const [z] of s.members)if(z.node?.activeInHierarchy&&!z.hypnotized&&z.isAlive())count++;
    return count;
  }
  function holdVictory(level){
    if(!level?.gameStarted||level.gameWon||level.gameLost)return false;
    if(!gardenChallenge.active(level)&&!sessions.has(level))return false;
    const s=setup(level);
    s.closing=true;
    // Native wave objectives re-evaluate after living actors die. Timed and
    // scripted victories complete immediately and keep their original rewards.
    return waveJudges.has(level)&&livingReinforcements(s)>0;
  }
  function usableTarget(r){
    return alivePlant(r.target) && (r.target._gardenCombatStats||r.target)===r.targetLife &&
      r.target.plantInLnC.lIndex===r.aim?.r && r.target.plantInLnC.cIndex===r.aim?.c;
  }
  function center(z){
    const list=targets(z,4),set=new Set(list.map(p=>cell(p).r*16+cell(p).c));
    function density(p){const {r,c}=cell(p);return [0,1,-1,16,-16].reduce((n,k)=>n+Number(set.has(r*16+c+k)),0);}
    return list.sort((a,b)=>density(b)-density(a))[0];
  }
  function prismAttack(r){
    const now=r.run.clock*r.attackRate;
    if(r.phase==='idle'||r.phase==='recovery'){
      if(r.cooldown>0)return;
      const p=targets(r.z,4)[0]||allPlants()[0];
      if(!p){r.cooldown=.14;r.prismDeadline=null;return;}
      r.prismDeadline??=now+1.6;r.cycles++;
      phase(r,'windup',Math.max(.01,r.prismDeadline-now-.46),p);
      emit('windup',r);return;
    }
    if(!usableTarget(r)){cancel(r,'target lost');return;}
    if(r.phase==='windup'&&now>=r.prismDeadline-.46){
      const spent=sunTake(60,true);
      phase(r,'drain',Math.max(.01,r.prismDeadline-now-.13),r.target,{spent});
      emit('drain',r,{source:'sunBank'});return;
    }
    if(r.phase==='drain'&&now>=r.prismDeadline-.13){
      phase(r,'flight',Math.max(.01,r.prismDeadline-now),r.target,{spent:r.spent});emit('launch',r);return;
    }
    if(r.phase==='flight'&&now+1e-8>=r.prismDeadline){
      hit(r.target,124);emit('shot',r);
      do{r.prismDeadline+=1.6;}while(r.prismDeadline<=now);
      recover(r,0);
    }
  }
  function firePeas(r){
    const v=r.gatlingVolley,now=r.run.clock*r.attackRate,count=r.rage?10:6,cadence=r.rage?.045:.075;
    if(r.phase==='windup'){
      const stage=r.progress>=.78?3:r.progress>=.43?2:1;
      if(stage!==r.stage){r.stage=stage;emit('charge',r);}
      if(now+1e-8<v.next)return;
      phase(r,'burst',cadence*(count-1),r.target);
    }
    // Emit events in simulation-time order. At 4× multiple rounds can fall in a frame.
    for(;;){
      const landing=v.flights[0],launch=v.fired<count?v.next:Infinity;
      if(landing&&landing.at<=launch&&landing.at<=now+1e-8){
        v.flights.shift();const {target,life,aim,index,at}=landing;
        if(alivePlant(target)&&(target._gardenCombatStats||target)===life&&
           cell(target).r===aim.r&&cell(target).c===aim.c)hit(target,r.rage?46:34);
        emit('shot',r,{target,aim,index,scheduledAt:at});continue;
      }
      if(launch>now+1e-8)break;
      const candidates=targets(r.z,r.rage?2:1);
      const target=(r.rage&&v.fired%3===2?candidates.find(p=>cell(p).r!==r.z.lIndex):null)||candidates[0];
      if(!target){v.fired=count;continue;}
      const aim=cell(target),duration=.13+Math.min(8,Math.abs(aim.c-cell(r.z).c))*.028;
      const index=++v.fired;r.index=index;r.target=target;r.aim=aim;
      emit('launch',r,{target,aim,index,duration,scheduledAt:launch});
      v.flights.push({target,life:target._gardenCombatStats||target,aim,index,at:launch+duration});
      v.flights.sort((a,b)=>a.at-b.at);v.next+=cadence;
    }
    if(v.fired>=count&&!v.flights.length)recover(r,r.rage?.76:1.15);
  }
  function attack(r){
    const z=r.z;
    if(r.kind==='prism'){prismAttack(r);return;}
    if(r.phase==='idle'||r.phase==='recovery'){
      if(r.cooldown>0)return;
      r.rage=r.kind==='gatling'&&(z.health<=z.toughness*.60||r.cycles%3===2);
      const p=r.kind==='melon'?center(z):targets(z,r.rage?2:1)[0];
      if(!p){r.cooldown=.32;return;}
      r.cycles++;r.index=0;r.stage=1;r.spent=0;
      const delay=r.kind==='melon'?.78:r.rage?.15:.27;
      phase(r,'windup',delay,p);
      if(r.kind==='gatling')r.gatlingVolley={next:r.run.clock*r.attackRate+delay,fired:0,flights:[]};
      emit('windup',r);return;
    }
    if(r.kind==='gatling'){firePeas(r);return;}
    if(r.left>1e-7)return;
    if(r.kind==='melon'){
      if(r.phase==='windup'){
        const aim=r.aim,p=r.target;
        phase(r,'flight',.80,p,{aim});emit('launch',r);return;
      }
      const aim=r.aim,affected=[],hitTiles=new Set();
      for(const p of allPlants()){
        const t=cell(p),d=Math.abs(t.r-aim.r)+Math.abs(t.c-aim.c),key=t.r*16+t.c;
        if(d>2||hitTiles.has(key))continue;
        hitTiles.add(key);affected.push(p);hit(p,d===0?160:d===1?98:54);
        at(t.r,t.c)?.setPlantChillCD(d===0?4.6:d===1?3:1.6);
        if(d===0&&alivePlant(p))p.setStun(1.25);
      }
      emit('impact',r,{center:aim,affected});recover(r,3.0);return;
    }
  }
  function tick(level,dt){
    if(!level||!level.gameStarted||!level.gaming||level.gameWon||level.gameLost||level.gameOver||mod('UI')?.UIInGame?.component?.paused||!(dt>0))return;
    if(!gardenChallenge.active(level)&&!ordinaryRun(level))return;
    const s=setup(level);if(!s.ordinary)phaseFlags(s);s.clock+=dt;
    mortar()?.tick?.(level,dt,s.api);
    dispatch(s);
    for(const [z,r] of s.members){
      if(!z.node?.activeInHierarchy||z.dead){release(z);continue;}
      if(z.hypnotized||!z.isAlive()||!z.isInLawn()){cancel(r,'off lawn');continue;}
      const disabled=z.stunned>0||z.freeze>0||z.butterStun>0||z.knockBackTween?.running||z.changeLaneTween?.running||z.fallingInSky||z.blew;
      const moved=r.phase!=='idle'&&r.phase!=='recovery'&&(r.row!==z.lIndex || z.worldPositionX-r.lastX>mod('Square').Square.SquareWidth*.33);
      r.lastX=z.worldPositionX;
      if(disabled||moved){cancel(r,'interrupted');continue;}
      const actionDt=dt*r.attackRate;
      r.cooldown=Math.max(0,r.cooldown-actionDt);r.left=Math.max(0,r.left-actionDt);r.progress=r.duration?1-r.left/r.duration:0;
      if(originals.includes(r.kind))attack(r);else s.behaviors.get(r.kind)?.cycle?.(z,r,actionDt,s.api);
    }
  }
  function coverage(level){const s=sessions.get(level);return s?{seen:[...s.seen],planned:s.localPlan|| (s.flags>=2?[...s.order,'prism']:s.flags?s.order.filter(k=>opensAt(k)===1):[]),sent:s.sent,pending:Number(!!s.inFlight),flags:s.flags}:null;}
  return Object.freeze({tick,wave,state,baseProps,judgeWaves,holdVictory,isWaveVictory:level=>waveJudges.has(level),release,allegiance,coverage,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}});
})();
