// Seven specialist cultivars join the three headline enemies in every expedition.
const gardenHybridRoster=(()=>{
  const rows=[
    ['medic','双阳花医师','twinsunflower','#edbd55','heal',3.8,.88,'精英 · 吸命救援。花盘锁定植物，抽取 120 点及生命上限的 19.2%，将实得生命分给最多三名伤员，并让他们加速 36% 持续 4 秒。落点空置或受保护时无法吸命。',920],
    ['cabbage','冷帽投手','cabbagepult','#9bc170','lob',3.9,.75,'精英 · 后排围猎。第一发锁定同排最靠屋的一株，压慢行动 2.5 秒。第二发越行追打另一排的后卫。两发锁格，分散后排或在飞行中移开。',810],
    ['butter','黄油玉米兵','kernelpult','#ffd666','control',5,.95,'精英 · 黄油封锁。瞄准密植区，落点植物停手 3.6 秒，周围一格受溅射、行动冷却加倍 4 秒。两排间留空可限制封锁。',840],
    ['coconut','椰壳重炮兵','coconutcannon','#dea171','blast',5.3,1.15,'精英 · 攻城溅射。红点中心受 192 点及生命上限 31.2% 的炮伤，波及前后两格、上下各一行。0.78 秒后原落区余震；眩晕炮手可截断余震。',1250],
    ['chain','电芦接线员','lightningreed','#a7c9ff','electric',4.15,.78,'精英 · 电网过载。闪电沿相邻种植格连打最多五株，伤害逐跳衰减，每株行动冷却延长 70% 持续 2.4 秒。隔开一整格即可断链。',790],
    ['bulwark','坚果甲匠','wallnut','#d5ad73','guard',4.4,.90,'精英 · 破阵护送。替邻排最多三名同伴修补仍完整的背心，让护送队加速 30% 持续 4.2 秒。盾尘命中标记植物及其后方一格，令其行动冷却翻倍 3.2 秒。先击碎背心可阻止修甲。',1450],
    ['apple','三行苹果炮手','applemortar','#ef926e','lob',5,1.00,'精英 · 三行弹幕。依次炮击中心、上行、下行，边路向场内折返。每颗苹果波及本行前后一格，中心昏迷 1.2 秒。可在后两枚落地前打断炮手。',1020],
  ];
  const entries=rows.map(([kind,name,plant,tint,family,cooldown,windup,description,toughness])=>Object.freeze({kind,name,plant,tint,family,cooldown,windup,description,elite:true,toughness}));
  const lookup=new Map(entries.map(v=>[v.kind,v]));
  const pos=(p,api)=>api.cell(p);
  const gap=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.c-b.c));
  const grid=(api,test)=>api.allPlants().filter(p=>api.alivePlant(p)&&test(pos(p,api),p));
  const cell=(a,api)=>grid(api,q=>q.r===a.r&&q.c===a.c);
  const spot=z=>({r:z.lIndex??z.inLnC?.lIndex??0,c:z.inLnC?.cIndex??z.cIndex??8});
  const aliveEnemy=z=>z&&!z.dead&&!z.hypnotized&&z.health>0&&z.node?.activeInHierarchy!==false;
  const adjacent=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
  function squad(z,api){
    const home=spot(z);
    return api.enemies().filter(t=>t!==z&&aliveEnemy(t)&&Math.abs(spot(t).r-home.r)<=1);
  }
  function crowdAim(list,api){
    const counts=new Map(),square=(r,c)=>r*32+c;
    for(const t of list){const p=pos(t,api),key=square(p.r,p.c);counts.set(key,(counts.get(key)||0)+1);}
    let high=-1,best=null;
    for(const t of list){const p=pos(t,api);let n=0;
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)n+=counts.get(square(p.r+dr,p.c+dc))||0;
      if(n>high){best=t;high=n;}}
    return best;
  }
  function mortars(a,api){
    // At an edge, reflect the unplayable flank towards the interior. Never
    // ask the renderer to aim at a nonexistent row on a short/custom board.
    const valid=[a.r-1,a.r+1,a.r-2,a.r+2].filter(r=>r>=0&&api.at(r,a.c)?.isInLawn?.());
    return [a,...valid.slice(0,2).map(r=>({r,c:a.c}))];
  }
  function aimElite(z,r,d,api){
    const list=api.targets(z,6),home=spot(z);let target=list[0];
    if(d.kind==='bulwark'&&!target&&!squad(z,api).length)return false;
    if(!target&&d.kind!=='bulwark')return false;
    if(d.kind==='cabbage'){
      const back=[...list].sort((p,q)=>Math.abs(pos(p,api).r-home.r)-Math.abs(pos(q,api).r-home.r)||pos(p,api).c-pos(q,api).c);
      target=back[0];const first=pos(target,api);
      const reserve=back.find(t=>pos(t,api).r!==first.r)||back.find(t=>pos(t,api).c!==first.c)||target;
      r.volley=[first,pos(reserve,api)];
    }else if(['butter','coconut','apple'].includes(d.kind)){
      target=crowdAim(list,api);if(d.kind==='apple')r.volley=mortars(pos(target,api),api);
    }
    const aim=target?pos(target,api):home;
    api.phase(r,'windup',d.windup,target,{aim});r.beat=0;
    api.emit('windup',r,{family:d.family,tint:d.tint,aim,duration:d.windup});return true;
  }
  function damagePlant(api,p,flat,fraction){
    if(!api.alivePlant(p))return 0;
    // Base flat and maximum-health damage join before the shared attack multiplier.
    return api.hit(p,flat+fraction*Math.max(1,p.toughness||p.health));
  }
  function landElite(z,r,d,api){
    const aim=r.volley?.[r.beat]||r.aim,affected=[],b=r.beat;
    const here=()=>cell(aim,api),around=(test)=>grid(api,test);
    function strike(p,flat,fraction){affected.push(p);return damagePlant(api,p,flat,fraction);}
    function slow(p,factor,secs){if(api.alivePlant(p))p.plantCDScaleSetter(factor,secs);}
    let next=0;
    switch(d.kind){
      case 'medic':{
        const p=here()[0],stolen=p?damagePlant(api,p,40,.064):0;
        if(!(stolen>0))break;
        const allies=squad(z,api).sort((x,y)=>x.health/x.toughness-y.health/y.toughness||spot(x).c-spot(y).c);
        const group=allies.length?allies.slice(0,3):[z];
        // Split the actual drained health; redistribute unused shares from full
        // escorts so a nearly dead frontline unit can consume the remainder.
        let remaining=stolen;
        for(const [i,t] of group.entries()){
          const hp=Math.min(remaining/(group.length-i),Math.max(0,t.toughness-t.health));t.health+=hp;remaining-=hp;
          t.pushSpeedStacked({SpeedMult:1.36,Duration:4});affected.push(t);
        }
        for(const t of group){const hp=Math.min(remaining,Math.max(0,t.toughness-t.health));t.health+=hp;remaining-=hp;}
        break;
      }
      case 'bulwark':{
        const vest=t=>gardenChallengeArmor.state(t)?.vest;
        const need=t=>{const v=vest(t);return v?.hp>0?(v.max-v.hp)/v.max:0;};
        const friends=squad(z,api).sort((x,y)=>need(y)-need(x)||spot(x).c-spot(y).c);
        for(const t of (friends.length?friends.slice(0,3):[z])){
          const v=vest(t);if(v?.hp>0)gardenChallengeArmor.repairVest(t,v.max*.52);
          t.pushSpeedStacked({SpeedMult:1.30,Duration:4.2});affected.push(t);
        }
        for(const p of around(q=>q.r===aim.r&&(q.c===aim.c||q.c===aim.c-1))){
          damagePlant(api,p,26,.03);slow(p,2,3.2);
        }
        break;
      }
      case 'cabbage':
        for(const p of here()){strike(p,b?26:38,b?.048:.072);if(!b)slow(p,1.65,2.5);}
        if(!b)next=.49;break;
      case 'butter':
        for(const p of around(q=>gap(q,aim)<=1)){
          const direct=gap(pos(p,api),aim)===0;
          strike(p,direct?30:18,direct?.036:.022);
          if(direct){if(api.alivePlant(p))p.setStun(3.6);}else slow(p,2,4);
        }
        break;
      case 'coconut':
        for(const p of around(q=>((q.r-aim.r)/1.5)**2+((q.c-aim.c)/2.2)**2<=1)){
          const direct=gap(pos(p,api),aim)===0;
          strike(p,b?14:direct?64:36,b?.03:direct?.104:.044);
        }
        if(!b)next=.78;break;
      case 'chain':{
        let p=here()[0];const used=new Set();
        while(p&&used.size<5){
          const i=used.size,anchor=pos(p,api);
          used.add(p);api.emit('shot',r,{family:d.family,tint:d.tint,target:p,aim:anchor,index:i});
          strike(p,34-i*4,.052-i*.0056);slow(p,1.7,2.4);
          p=around((q,t)=>!used.has(t)&&gap(q,anchor)<=1).sort((x,y)=>adjacent(pos(x,api),anchor)-adjacent(pos(y,api),anchor))[0];
        }
        break;
      }
      case 'apple':
        for(const p of around(q=>q.r===aim.r&&Math.abs(q.c-aim.c)<=1)){
          const direct=gap(pos(p,api),aim)===0;
          strike(p,direct?40:22,direct?.066:.034);if(direct&&api.alivePlant(p))p.setStun(1.2);
        }
        if(b+1<r.volley.length)next=.40;break;
    }
    api.emit('impact',r,{family:d.family,tint:d.tint,aim,index:b,affected});
    if(next){
      r.beat++;const destination=r.volley?.[r.beat]||aim;
      api.phase(r,'burst',next,r.target,{aim:destination});
      if(r.volley)api.emit('launch',r,{family:d.family,tint:d.tint,aim:destination,index:r.beat,duration:next});
    }else{r.volley=null;r.cycles++;api.recover(r,d.cooldown);}
  }
  function eliteCycle(z,r,d,api){
    if(r.phase==='idle'||r.phase==='recovery'){
      if(r.cooldown<=0&&!aimElite(z,r,d,api))r.cooldown=.32;return;
    }
    if(r.left>0)return;
    if(r.phase==='windup'){
      const aim=r.aim,delay=d.kind==='cabbage'||d.kind==='apple'?.68:d.kind==='butter'||d.kind==='coconut'?.53:.25;
      api.phase(r,'flight',delay,r.target,{aim});
      api.emit('launch',r,{family:d.family,tint:d.tint,aim,index:0,duration:delay});return;
    }
    if(r.phase==='flight'||r.phase==='burst')landElite(z,r,d,api);
  }
  function cycle(z,r,dt,api){
    const d=lookup.get(r.kind);
    if(d)eliteCycle(z,r,d,api);
  }
  function cancel(z,r){r.volley=null;r.beat=0;}
  return {entries,cycle,cancel};
})();
