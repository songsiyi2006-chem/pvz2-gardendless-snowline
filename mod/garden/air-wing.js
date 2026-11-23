// The air wing is carried independently from the single ground-heavy slot.
const gardenAirWing=(()=>{
  const fortressPrices=Object.freeze([20000,40000]);
  const fortressUses=new WeakMap();
  const ordinaryF22Used=new WeakSet();
  const types=Object.freeze({
    f22:{name:'F22 长空卫士',cost:5000,duration:Infinity},
    f35:{name:'F35 临时增援',cost:10000,duration:40},
    fortress:{name:'空中堡垒',cost:fortressPrices[0],prices:fortressPrices,duration:60}
  });
  const ignitionDelay=.30;
  const advances=[
    'F22 每秒耗 25 阳光。双炮可压低防护并连锁两次。侦察共享 12 个百分点暴击率和 15% 行动速度。每架供能 F22 另给全园 +2% 伤害、+0.05 暴击倍率、+0.5% 碎甲，上限通常为 5%，噩梦为 12%。F35 三种弹药都能碎甲，燃烧区持续 6 秒。堡垒交替追加制导、钻地与空爆。空爆越过友军盾墙，目标自身护甲仍然有效。噩梦中 F35 和堡垒的投弹间隔再缩短 20%，制导弹可分击两行，空爆可覆盖两片敌群。',
    'F22 每次点射可追击同排第二个目标。',
    'F35 的集束子弹会在爆心两侧各搜索一个敌群。',
    '火区由 6 秒延长至 8 秒。后来走进火区的僵尸也会在下一次灼烧时受伤，F35 离场后余火继续生效。',
    'F22 每四次点射压制一名目标；F35 的制导弹标记重甲，堡垒额外震慑前排。',
    'F35 在制导弹的目标被消灭后会转火另一行，每轮堡垒齐射都可令最靠屋的一行陷入迟滞。',
    'F22 同时跟踪最靠屋和生命最高的目标。F35 在最后一轮追加集束弹；堡垒收队前额外投下一轮全场终幕。'
  ];
  let battle=null;
  const idleAura=Object.freeze({count:0,damage:1,critBonus:0,shred:0});
  function spec(rank){
    const level=Math.max(1,Math.min(7,Math.trunc(rank)||1));
    return {id:'airwing',level,interval:0,strength:1+(level-1)*.025,frequency:'F22 常驻 · F35 40 秒 · 堡垒 60 秒',
      power:'单次伤害 +'+Math.round((level-1)*2.5)+'% · 航空独立装备位',mechanic:advances[level-1]};
  }
  function attach(s,ops){
    const nightmare=!s.ordinary&&typeof gardenChallenge!=='undefined'&&gardenChallenge.activeTyrant?.(s.level)===2;
    battle={s,round:s.level??s,ops,nightmare,flights:[],fires:[],sequence:0,recon:false,aura:idleAura,charging:false};
  }
  function reset(s){
    if(battle?.s!==s)return;
    const had=battle.recon;battle=null;
    if(typeof gardenAirArt!=='undefined')gardenAirArt.reset(s);
    if(typeof gardenAirR4Art!=='undefined')gardenAirR4Art.reset(s);
    if(had&&typeof gardenCombatStats!=='undefined')gardenCombatStats.refreshRecon?.();
  }
  function valid(){return !!battle&&battle.ops.live();}
  function plantAura(){
    return battle&&battle.ops.current()?battle.aura:idleAura;
  }
  function refresh(b){
    if(b.ops.sun().CurrentValue<25)for(const f of b.flights)if(f.type==='f22')f.enabled=false;
    const count=b.flights.reduce((n,f)=>n+(f.type==='f22'&&f.enabled?1:0),0);
    if(count!==b.aura.count)b.aura=count?{count,damage:1+.02*count,critBonus:.05*count,shred:Math.min(b.nightmare?.12:.05,.005*count)}:idleAura;
    const next=count>0;
    if(next!==b.recon){b.recon=next;if(typeof gardenCombatStats!=='undefined')gardenCombatStats.refreshRecon?.();}
  }
  function status(type){
    const profile=types[type];if(!profile||!valid())return null;
    const b=battle,flights=b.flights.filter(f=>f.type===type);
    const forbidden=!!b.s.ordinary&&type!=='f22',used=fortressUses.get(b.round)??0;
    const cost=profile.prices?(profile.prices[used]??null):profile.cost;
    const usesLeft=forbidden?0:b.s.ordinary?Number(!ordinaryF22Used.has(b.round)):profile.prices?profile.prices.length-used:null;
    const reason=forbidden?'仅雪线挑战可用':usesLeft===0?(type==='f22'?'本关 F22 已派出':'本关堡垒次数已用完'):
      b.ops.sun().CurrentValue<cost?'阳光不足':'';
    const level=b.s.specs.airwing.level,ownedLevel=b.s.ownedLevels?.airwing??level;
    return {name:profile.name,cost,usesLeft,forbidden,reason,level,ownedLevel,capped:level<ownedLevel,count:flights.length,powered:flights.filter(f=>f.enabled).length,
      remaining:flights.reduce((n,f)=>Math.max(n,f.duration-f.age),0),available:!reason&&cost!==null&&!b.charging};
  }
  function call(type){
    const state=status(type);if(!state?.available)return false;
    const b=battle,{duration}=types[type];
    b.charging=true;
    try{
      const meter=b.ops.sun();meter.SunDec(state.cost,true,true);
      b.flights.push({id:++b.sequence,type,age:0,duration,enabled:type!=='f22'||meter.CurrentValue>=25,cycles:0,next:0,fuel:0});
      if(type==='f22'&&b.s.ordinary)ordinaryF22Used.add(b.round);
      if(type==='fortress')fortressUses.set(b.round,(fortressUses.get(b.round)??0)+1);
      refresh(b);return true;
    }finally{b.charging=false;}
  }
  function cue(b,kind,where,laneTargets){
    if(typeof gardenWeaponAudio!=='undefined')gardenWeaponAudio.play(b.s,'air-'+kind);
    if(typeof gardenAirArt!=='undefined'&&gardenFxSettings.enabled)gardenAirArt.cue(b.s,kind,where,laneTargets);
  }
  function extraArt(b,f,kind,p,contacts=[]){
    if(typeof gardenAirR4Art!=='undefined')gardenAirR4Art.cue(b.s,kind,p,contacts,f.id);
  }
  function strike(b,z,damage,kind,options={}){
    return b.ops.strike(z,{kind,...options,damage:damage*b.s.specs.airwing.strength});
  }
  function burst(b,position,rows,columns,damage,kind,options,seen=new Set()){
    const contacts=[],o=b.ops;
    for(const z of o.area(b.s,position,rows,columns)){
      if(seen.has(z))continue;
      seen.add(z);
      if(strike(b,z,damage,kind,{...options,area:true,explosive:true}))contacts.push(o.point(z));
    }
    return contacts;
  }
  function strafe(b,f,targets){
    const o=b.ops,q=b.s.specs.airwing,first=targets[0],at=o.point(first);
    const ap=z=>strike(b,z,215,'pierce',{soften:.08});
    ap(first);
    if(q.level>=2){
      const rear=targets.find(z=>z!==first&&o.row(z)===at.r);
      if(rear)strike(b,rear,96,'pierce',{soften:.08});
    }
    if(q.level===7){
      const tough=targets.reduce((a,z)=>z.health>a.health?z:a);
      if(tough!==first)strike(b,tough,128,'pierce',{soften:.08});
    }
    const screen=o.screen(b.s),visited=new Set([first]);
    burst(b,at,1,1,135,'air-frag',{screen});
    const links=[];
    let from=at;
    for(const amount of [83,54]){
      let next=null,best=Infinity;
      for(const z of targets){
        if(visited.has(z)||!o.alive(z))continue;
        const p=o.point(z),d=Math.abs(p.r-from.r)+Math.abs(p.c-from.c);
        if(d<=3&&d<best){best=d;next=z;}
      }
      if(!next||!strike(b,next,amount,'air-frag',{explosive:true,screen}))break;
      visited.add(next);from=o.point(next);links.push(from);
    }
    if(q.level>=5&&f.cycles%4===0)o.stun(first,.30);
    if(typeof gardenWeaponAudio!=='undefined')gardenWeaponAudio.play(b.s,'air-strafe');
    extraArt(b,f,'coax',at,links);
  }
  function f35Salvo(b,f,targets,final){
    const o=b.ops,rank=b.s.specs.airwing.level,screen=o.screen(b.s);
    const kind=final?1:(f.cycles-1)%3,center=o.dense(targets);
    if(kind===0){
      const target=targets.reduce((a,z)=>z.health>a.health?z:a),at=o.point(target);
      const landed=strike(b,target,5100,'air-guided',{explosive:true,screen,wear:1050});
      burst(b,at,1,1,1600,'air-guided',{screen,wear:290},new Set([target]));
      cue(b,'guided',at);if(landed)extraArt(b,f,'f35-guided',at);
      if(rank>=5&&landed)o.chill(target,2);
      if(b.nightmare||(rank>=6&&!o.alive(target))){
        const next=targets.find(z=>o.row(z)!==at.r&&o.alive(z));
        if(next){
          const where=o.point(next);
          const hit=strike(b,next,b.nightmare?3100:2000,'air-guided',{explosive:true,screen,wear:b.nightmare?750:480});
          cue(b,'guided',where);if(hit)extraArt(b,f,'f35-guided',where);
        }
      }
    }else if(kind===1){
      const sites=[center],seen=new Set();
      if(rank>=3)for(const side of [-1,1]){
        const flank=targets.filter(z=>(o.row(z)-center.r)*side>0);
        if(flank.length)sites.push(o.dense(flank));
      }
      for(const p of sites){
        const contacts=burst(b,p,1,2,1750,'air-cluster',{screen,wear:420},seen);
        cue(b,'cluster',p);if(contacts.length)extraArt(b,f,'shatter',p,contacts);
      }
    }else{
      const contacts=burst(b,center,1,1,1450,'air-ember',{screen,wear:300});
      cue(b,'ember',center);if(contacts.length)extraArt(b,f,'shatter',center,contacts);
      const start=b.s.time+ignitionDelay;
      b.fires.push({p:{...center},start,until:start+(rank>=4?8:6),next:start,power:500});
    }
  }
  function fortressSalvo(b,f,targets,all,final){
    const s=b.s,o=b.ops,rank=s.specs.airwing.level;
    const center=targets.length?o.dense(targets):{r:Math.floor(s.square.MaxLaneIndex/2),c:Math.floor(s.square.MaxColumnIndex/2)};
    const screen=o.screen(s),kind='air-fortress';
    const mode=final?2:(f.cycles-1)%3;
    cue(b,'fortress',center,targets.map(o.point));
    for(const z of all)strike(b,z,final?1650:1250,kind,{explosive:true,area:true,screen});
    // The barrage reaches the whole lawn. Its overlapping shell craters add one
    // stronger shock front per victim, including enemies in the adjacent lanes.
    const seen=new Set(),rows=new Set();
    for(const z of targets){
      const row=o.row(z);
      if(rows.has(row))continue;
      rows.add(row);
      burst(b,o.point(z),1,2,420,kind,{screen},seen);
    }
    if(mode===2){
      const overheadHits=new Set();
      const contacts=burst(b,center,2,4,2350,kind,{screen,overhead:true},overheadHits);
      extraArt(b,f,'fort-airburst',center,contacts);
      if(b.nightmare){
        const fringe=targets.filter(z=>!overheadHits.has(z)&&o.alive(z));
        if(fringe.length){
          const wing=o.dense(fringe),hits=burst(b,wing,2,4,2350,kind,{screen,overhead:true},overheadHits);
          extraArt(b,f,'fort-airburst',wing,hits);
        }
      }
    }else if(targets.length){
      const tough=targets.reduce((a,z)=>z.health>a.health?z:a),p=o.point(tough);
      if(mode===0){
        strike(b,tough,4800,kind,{screen,explosive:true,wear:900});
        const contacts=burst(b,p,2,2,1800,kind,{screen,wear:320},new Set([tough]));
        extraArt(b,f,'fort-guided',p,contacts);
      }else{
        strike(b,tough,2900,kind,{screen,explosive:true,wear:6500});
        const contacts=burst(b,p,1,2,1560,kind,{screen,wear:1800},new Set([tough]));
        extraArt(b,f,'fort-bunker',p,contacts);
      }
    }
    const first=targets[0];
    if(rank>=5&&first)o.stun(first,.4);
    if(rank>=6&&first)for(const z of targets)if(o.row(z)===o.row(first))o.chill(z,1.35);
  }
  function volley(b,f,final=false){
    const o=b.ops,targets=o.targets(b.s).sort(o.byHouse);
    const all=f.type==='fortress'?o.targets(b.s,true):targets;
    if(!all.length)return;
    f.cycles++;
    if(f.type==='f22')strafe(b,f,targets);
    else if(f.type==='f35')f35Salvo(b,f,targets,final);
    else fortressSalvo(b,f,targets,all,final);
  }
  function upkeep(b,f,dt){
    const meter=b.ops.sun();
    if(meter.CurrentValue<25){f.enabled=false;return;}
    f.enabled=true;f.fuel+=dt;
    while(f.fuel>=1-1e-7&&meter.CurrentValue>=25){meter.SunDec(25,true,true);f.fuel=Math.max(0,f.fuel-1);}
    f.enabled=meter.CurrentValue>=25;
  }
  function tick(s,dt){
    const b=battle;if(b?.s!==s||!valid())return;
    const rank=s.specs.airwing.level;
    for(const f of b.flights){
      const prior=f.age;f.age=Math.min(f.duration,f.age+dt);
      if(f.type==='f22')upkeep(b,f,dt);
      const period=({f22:.34,f35:2.70,fortress:2})[f.type]*(b.nightmare&&f.type!=='f22'?.8:1)/(1+(rank-1)*.018);
      if(!f.enabled)f.next=f.age;
      else while(f.next<=f.age+1e-7&&f.next<f.duration){volley(b,f);f.next+=period;}
      if(rank===7&&prior<f.duration&&f.age>=f.duration)volley(b,f,true);
    }
    for(const fire of b.fires)while(fire.next<=s.time+1e-7&&fire.next<fire.until-1e-7){
      burst(b,fire.p,1,1,fire.power,'air-burn',{});fire.next++;
    }
    b.fires=b.fires.filter(f=>s.time+1e-7<f.until);
    b.flights=b.flights.filter(f=>f.age<f.duration);
    refresh(b);
    if(typeof gardenAirArt!=='undefined')gardenAirArt.tick(s,dt,b.flights,b.fires);
    if(typeof gardenAirR4Art!=='undefined')gardenAirR4Art.tick(s,dt,b.flights);
  }
  function redraw(){
    if(battle&&battle.ops.current()&&typeof gardenAirArt!=='undefined')gardenAirArt.tick(battle.s,0,battle.flights,battle.fires);
    if(battle&&battle.ops.current()&&typeof gardenAirR4Art!=='undefined')gardenAirR4Art.tick(battle.s,0,battle.flights);
  }
  return Object.freeze({types,spec,attach,reset,status,call,tick,redraw,plantAura,recon:()=>!!battle?.recon&&battle.ops.current(),advances});
})();
