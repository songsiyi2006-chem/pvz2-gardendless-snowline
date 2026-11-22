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
    '开放三种航空呼叫。F22 机炮与侦察同时工作，每架每秒 25 阳光；供能时全园暴击率增加 12 个百分点，行动速度提高 15%，多架共享一份侦察加成。F35 轮投制导弹、集束弹和燃烧弹。燃烧弹落地点周围九格起火 4 秒，落地及此后每秒对格内敌人造成灼伤。堡垒轰炸全场，将各层防具的防爆减伤减半。',
    'F22 每次点射可追击同排第二个目标。',
    'F35 的集束子弹会在爆心两侧各搜索一个敌群。',
    '火区由 4 秒延长至 6 秒。后来走进火区的僵尸也会在下一次灼烧时受伤，F35 离场后余火继续生效。',
    'F22 每四次点射压制一名目标；F35 的制导弹标记重甲，堡垒额外震慑前排。',
    'F35 在制导弹的目标被消灭后会转火另一行，每轮堡垒齐射都可令最靠屋的一行陷入迟滞。',
    'F22 同时跟踪最靠屋和生命最高的目标。F35 在最后一轮追加集束弹；堡垒收队前额外投下一轮全场终幕。'
  ];
  let battle=null;
  function spec(rank){
    const level=Math.max(1,Math.min(7,Math.trunc(rank)||1));
    return {id:'airwing',level,interval:0,strength:1+(level-1)*.025,frequency:'F22 常驻 · F35 40 秒 · 堡垒 60 秒',
      power:'单次伤害 +'+Math.round((level-1)*2.5)+'% · 航空独立装备位',mechanic:advances[level-1]};
  }
  function attach(s,ops){battle={s,round:s.level??s,ops,flights:[],fires:[],sequence:0,recon:false,charging:false};}
  function reset(s){
    if(battle?.s!==s)return;
    const had=battle.recon;battle=null;
    if(typeof gardenAirArt!=='undefined')gardenAirArt.reset(s);
    if(had&&typeof gardenCombatStats!=='undefined')gardenCombatStats.refreshRecon?.();
  }
  function valid(){return !!battle&&battle.ops.live();}
  function refresh(b){
    const next=b.flights.some(f=>f.type==='f22'&&f.enabled);
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
  function volley(b,f,final=false){
    const {s,ops:o}=b,targets=o.targets(s).sort(o.byHouse);
    const areaVictims=f.type==='fortress'?o.targets(s,true):targets;
    if(!areaVictims.length)return;
    const q=s.specs.airwing,rank=q.level,strength=q.strength,first=targets[0];f.cycles++;
    const hit=(z,n,kind='pierce',fire=false)=>o.hit(z,Math.round(n*strength),fire?1:0,kind,false,false,fire);
    const at=first?o.point(first):{r:Math.floor(s.square.MaxLaneIndex/2),c:Math.floor(s.square.MaxColumnIndex/2)};
    if(f.type==='f22'){
      hit(first,185);cue(b,'strafe',at);
      if(rank>=2){const rear=targets.find(z=>z!==first&&o.row(z)===at.r);if(rear)hit(rear,75);}
      if(rank>=5&&f.cycles%4===0)o.stun(first,.30);
      if(rank===7){const tough=targets.reduce((a,z)=>z.health>a.health?z:a);if(tough!==first)hit(tough,102);}
      return;
    }
    if(f.type==='fortress'){
      const amount=final?850:680;
      const impacts=typeof gardenAirArt!=='undefined'&&gardenFxSettings.enabled?targets.map(o.point):undefined;
      cue(b,'fortress',at,impacts);
      for(const z of areaVictims)(o.blastHit||o.hit)(z,Math.round(amount*strength),1,'air-fortress',false,false,true);
      if(rank>=5&&first)o.stun(first,.4);
      if(rank>=6)for(const z of targets)if(o.row(z)===at.r)o.chill(z,1.35);
      return;
    }
    const pattern=final?1:(f.cycles-1)%3,center=o.dense(targets);
    if(pattern===0){
      const target=targets.reduce((a,z)=>z.health>a.health?z:a),p=o.point(target);
      hit(target,2350,'air-guided',true);cue(b,'guided',p);
      if(rank>=5)o.chill(target,2);
      if(rank>=6&&!o.alive(target)){
        const follow=targets.find(z=>o.row(z)!==p.r&&o.alive(z));if(follow){hit(follow,830,'air-guided',true);cue(b,'guided',o.point(follow));}
      }
    }else if(pattern===1){
      const sites=[center];
      if(rank>=3)for(const side of [-1,1]){
        const flank=targets.filter(z=>(o.row(z)-center.r)*side>0);
        if(flank.length)sites.push(o.dense(flank));
      }
      const tagged=new Set();
      for(const p of sites){cue(b,'cluster',p);for(const z of o.area(s,p,1,2))if(!tagged.has(z)){tagged.add(z);(o.blastHit||o.hit)(z,Math.round(780*strength),1,'air-cluster',false,false,true);}}
    }else{
      cue(b,'ember',center);
      const start=s.time+ignitionDelay;
      b.fires.push({p:{...center},start,until:start+(rank>=4?6:4),next:start,power:Math.round(235*strength)});
    }
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
      const period=({f22:.85,f35:3.5,fortress:4.2})[f.type]/(1+(rank-1)*.018);
      if(!f.enabled)f.next=f.age;
      else while(f.next<=f.age+1e-7&&f.next<f.duration){volley(b,f);f.next+=period;}
      if(rank===7&&prior<f.duration&&f.age>=f.duration)volley(b,f,true);
    }
    for(const fire of b.fires)while(fire.next<=Math.min(s.time,fire.until)+1e-7){
      for(const z of b.ops.area(s,fire.p,1,1))(b.ops.blastHit||b.ops.hit)(z,fire.power,1,'air-burn');fire.next++;
    }
    b.fires=b.fires.filter(f=>s.time+1e-7<f.until);
    b.flights=b.flights.filter(f=>f.age<f.duration);
    refresh(b);
    if(typeof gardenAirArt!=='undefined')gardenAirArt.tick(s,dt,b.flights,b.fires);
  }
  function redraw(){
    if(battle&&battle.ops.current()&&typeof gardenAirArt!=='undefined')gardenAirArt.tick(battle.s,0,battle.flights,battle.fires);
  }
  return Object.freeze({types,spec,attach,reset,status,call,tick,redraw,recon:()=>!!battle?.recon&&battle.ops.current(),advances});
})();
