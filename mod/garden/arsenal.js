// Permanent equipment. All cooldowns and durations below use simulation seconds.
const gardenArsenal = (() => {
  const rows = [
    ['airwing','长空卫士与空中堡垒',280,'aviation','航空','以独立航空位支援地面重装。开放 F22、F35 和空中堡垒三种呼叫。'],
    ['intercept_firefly','萤火拦截巢',95,'interceptor','拦截','逐枚释放萤火，在半空击落迫击炮弹。'],
    ['intercept_dome','潮汐穹顶',135,'interceptor','拦截','以短时护幕同时击落多枚进入末段的迫击炮弹。'],
    ['intercept_mirror','折光诱标',115,'interceptor','拦截','重新标记风险较低的落点，诱导迫击炮弹偏航。'],
    ['sniper','屋脊狙击塔',75,'heavy','火力','装备后每关自动架设，无需阳光。每 5 秒狙击最靠近房屋的敌人，造成 260 点穿甲伤害。'],
    ['thorns','荆棘地面',45,'support','地形','在草坪铺开荆条，接触地面的僵尸每秒受到 12 点伤害。'],
    ['rotary','机炮',125,'heavy','火力','两种弹型每关首台 1000 阳光，每台加价 250，最多五台同时开火。一级在 30 秒内打出 480 轮，每四轮引爆一次，每八轮打出双对角爆斩。',1000,0],
    ['bombard','远程炮击支援',155,'heavy','火力','每组固定 3000 阳光。首发立即命中，此后每 0.64 秒追踪敌群，五发各在五行七列内造成 26000 点炮击伤害。可连续呼叫。',3000,0],
    ['prism','棱镜灯塔',110,'heavy','火力','基础光束自动寻找最密集的一行，每 5 秒造成 800 点整行穿甲伤害，无需阳光。升至 VI 阶可额外主动架设折光阵。'],
    ['reservoir','日光蓄水池',35,'support','补给','每关开战时立即获得 100 阳光。'],
    ['dew','凝露天线',64,'support','补给','每 16 秒落下一颗价值 30 点的阳光。'],
    ['orchard','丰收气球',78,'support','补给','每逢新一波敌人出现，落下一颗价值 25 点的阳光。'],
    ['relay','叶绿素中继站',120,'support','补给','每 45 秒补充一格叶绿素。储格已满时等到出现空位再补给。'],
    ['bounty','赏金风铃',58,'support','补给','每累计击败 6 只受监测的僵尸，落下一颗价值 35 点的阳光。'],
    ['infirmary','露珠医务站',44,'support','养护','每 5 秒为生命比例最低的受伤植物恢复 80 点生命。'],
    ['rain','暖雨温箱',82,'support','养护','每 16 秒洒下一轮暖雨，为场上所有受伤植物各恢复 40 点生命。'],
    ['shell','贝壳救生舱',95,'support','养护','当一株植物的生命低于 30% 时触发，恢复其最大生命的 25%，再保护它 2 秒。可每 20 秒触发一次。'],
    ['detox','净露滤芯',47,'support','养护','每 6 秒清除最多三株植物身上的眩晕及音箱干扰，并各恢复 20 点生命。'],
    ['tempo','节拍齿轮',70,'support','养护','每 9 秒沿行轮转，为下一行有植物的防线提供 3 秒加速，使原生攻击冷却缩至 70%。'],
    ['frost','霜环喷口',60,'support','地形','每 9 秒朝敌群中心喷发霜环，使周围一格敌人冻结 1.4 秒。'],
    ['wind','逆风风标',72,'support','地形','每 12 秒把最靠近房屋的三只敌人各向后推 0.6 格。'],
    ['mire','琥珀胶池',54,'support','地形','每 7 秒在最密集的敌群脚下生成一格胶池。经过该格的敌人在 5 秒内持续受到减速。'],
    ['tripwire','缓冲绊索',68,'support','地形','每行有一根绊索。敌人首次进入房前最后两列时，该行近房敌人眩晕 2 秒，18 秒后重新布设。'],
    ['arc','引雷铜线',85,'support','阵列','每 8 秒从最前方敌人开始，在两格内连锁跳跃，最多三段，依次造成 90、65、45 点电伤。'],
    ['shard','碎甲蜂巢',70,'support','阵列','每 8 秒锁定三只护甲僵尸，分别造成 85 点伤害；场上没有护甲目标时保持就绪。'],
    ['roost','巡空燕巢',63,'support','阵列','每 5 秒掠击至多两只空中僵尸，各造成 140 点伤害；没有空中目标时保持就绪。'],
    ['flare','晨星信标',98,'support','阵列','每逢新一波敌人首次入场，晨星对场上所有敌人各造成 60 点伤害。'],
    ['mycelium','星孢菌床',66,'support','阵列','每 10 秒给至多三名未中毒的敌人施加持续 4 秒的孢毒，每秒 18 点伤害。']
  ];
  const catalog=Object.freeze(rows.map(([id,name,cost,slot,category,description,activeCost=0,cooldown=0])=>
    Object.freeze({id,name,cost,slot,category,description,activeCost,cooldown})));
  const byId=new Map(catalog.map(item=>[item.id,item]));
  let lib=null,current=null,installed=false;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const row=u=>u.tombInLnC?.lIndex??u.plantInLnC?.lIndex??u.lIndex;
  const col=u=>u.tombInLnC?.cIndex??u.plantInLnC?.cIndex??u.inLnC?.cIndex??u.cIndex;
  const point=u=>({r:row(u),c:col(u)});
  const live=u=>!!u?.node?.isValid&&u.node.activeInHierarchy&&!u.dead&&!u.displayed&&!u.fallingInSky;
  const enemy=u=>!u?.tombInLnC&&live(u)&&!u.hypnotized&&!u.invincible&&u.isInLawn?.();
  const flying=u=>!!(u.flying||u.currentFlyZombie||u.off_ground);
  const damaged=u=>u.health<u.toughness;
  const byHouse=(a,b)=>a.worldPosition.x-b.worldPosition.x;
  const byHurt=(a,b)=>(a.health/a.toughness)-(b.health/b.toughness);
  const nearby=(u,p,rows=1,cols=1)=>Math.abs(row(u)-p.r)<=rows&&Math.abs(col(u)-p.c)<=cols;
  function foes(s){return (s.manager.zombiePool||[]).filter(enemy);}
  const graveTypes=new Set(['gravestone_tutorial','gravestone_egypt','gravestone_pirate','gravestone_cowboy','gravestone_future',
    'gravestone_dark','gravestoneSunOnDestruction','gravestonePlantfoodOnDestruction','gravestone_iceage','gravestone_lostcity']);
  function hostileGrave(t){
    // Tombs share their native class and pool with surfboards, ice blocks and other grid items.
    // ID is the already-resolved native prefab, including regional aliases and redirections.
    return !!t?.tombInLnC&&t.tombInLnC.tombstone===t&&live(t)&&t.health>0&&!t.hidden&&!t.hypnotized&&!t.ignored&&
      graveTypes.has(lib.tombTypes?.[t.ID]??t.Tomb_Type_Data?.TombstoneBasedOn??t.Tombstone_Type);
  }
  function heavyTarget(t){return t?.tombInLnC?hostileGrave(t):enemy(t);}
  const camouflaged=z=>!!(z&&!z.tombInLnC&&typeof gardenChallengeArmor!=='undefined'&&gardenChallengeArmor.state(z)?.camouflage);
  function heavyTargets(s,includeConcealed=false){
    const list=foes(s);
    return (includeConcealed?list:list.filter(z=>!camouflaged(z))).concat((s.manager.tombPool||[]).filter(hostileGrave));
  }
  function heavyArea(s,p,r,c,blast=false){return heavyTargets(s,blast).filter(t=>nearby(t,p,r,c));}
  function blastArea(s,p,r,c){return heavyArea(s,p,r,c,true);}
  function blastHit(z,amount,...args){hit(z,camouflaged(z)?amount*.2:amount,...args);}
  function plants(s){return (s.manager.plantPool||[]).filter(p=>live(p)&&p.plantInLnC);}
  function area(s,p,r,c){return foes(s).filter(z=>nearby(z,p,r,c));}
  function dense(list,dr=1,dc=1){
    if(!list.length)return null;
    const counts=new Map();
    for(const z of list){const k=row(z)*32+col(z);counts.set(k,(counts.get(k)||0)+1);}
    let best=list[0],score=-1;
    for(const z of list){
      let n=0;for(let r=-dr;r<=dr;r++)for(let c=-dc;c<=dc;c++)n+=counts.get((row(z)+r)*32+col(z)+c)||0;
      if(n>score||n===score&&byHouse(z,best)<0){score=n;best=z;}
    }
    return point(best);
  }
  function liveBattle(){const l=lib?.level.component;return !!l&&lib.level.gaming&&!lib.ui.component?.paused&&l.node?.activeInHierarchy;}
  let ashImpact=null;
  function hit(z,amount,element=0,kind='',artillery=false,ash=false,explosive=ash){
    if(!heavyTarget(z))return;
    const ap=kind==='rotary-ap';
    const packet=new lib.cm.ZombieDamageDetails(amount,kind!=='pierce'&&!ap,false,false,null,element,true,ap);
    if(kind)packet._gardenHitKind=kind;
    if(explosive)packet._gardenExplosive=true;
    if(artillery)packet._gardenArtillery=true;
    if(z.tombInLnC){z.dealDamage(packet);return;}
    if(!ash){z.dealDamage(packet);return;}
    packet._gardenAshDeath=true;
    const last=ashImpact,mark={z,played:false},where=point(z),scene=current;
    ashImpact=mark;
    try{z.dealDamage(packet);}finally{ashImpact=last;}
    // Special actors without a native ash rig keep their scripted death and
    // rewards. Add only the ash plume, after the engine confirms the kill.
    if(z.dead&&!mark.played&&scene&&scene===current&&gardenFxSettings.enabled)gardenArsenalArt.emit(scene,'rotary-ash',where);
  }
  function paint(s,kind,a,b){
    if(typeof gardenWeaponAudio!=='undefined')gardenWeaponAudio.play(s,kind);
    if(gardenFxSettings.enabled)gardenArsenalArt.emit(s,kind,a,b);
  }
  function wait(s,t,run){s.queue.push({at:s.time+t,run});}
  function sun(s,n,p){
    const pos=lib.square.getSquareWorldPosition(p.r,p.c);
    gardenFunctional.sun({_gardenSunYield:n/25},lib.sunflower,25,pos,35,true,false,false);
    paint(s,'sun',p);
  }
  function periodic(s,id,fn){
    const q=s.specs[id];if(!q||q.interval<=0||s.due[id]>s.time)return;
    if(q.form==='mk14'){
      let due=s.due[id]??s.time;
      while(due<=s.time){
        if(fn(q.level,q.strength,q.interval)===false){due=s.time+q.interval;break;}
        due+=q.interval;
      }
      s.due[id]=due;return;
    }
    // Reserve this fire deadline before any on-damage callback can run.
    if(q.form==='precision')s.due[id]=s.time+q.interval;
    const done=fn(id==='sniper'?q.level:Math.min(4,q.level),q.strength,q.interval);
    if(q.level>=5&&done!==false&&cycleApex.has(id))apex(s,id);
    s.due[id]=s.time+(done===false?.35:q.interval);
  }
  function armored(z){
    const fitted=typeof gardenChallengeArmor!=='undefined'&&gardenChallengeArmor.state(z);
    return z.armors?.some(a=>a.health>0)||!!(fitted&&(fitted.helmet.hp>0||fitted.vest.hp>0||fitted.door?.hp>0));
  }
  function stun(z,n){if(enemy(z))z.setStun(Math.max(z.stunned||0,n));}
  function chill(z,n){if(enemy(z))z.setChill(Math.max(z.chill||0,n));}
  function push(z,n){if(enemy(z))z.knockBackBy(new lib.cc.Vec2(n,0),false,.32,false);}
  function heal(p,n){if(live(p)&&damaged(p))p.heal(n);}
  function shield(p,n){if(live(p))p.setCountDownInvincible(Math.max(p.countDownInvincible||0,n));}
  function drop(s,n,col=1){sun(s,n,{r:Math.floor(lib.square.MaxLaneIndex/2),c:col});}
  function deposit(n){lib.sun.component?.SunAdd(n);}
  const cycleApex=new Set(['thorns','prism','dew','relay','infirmary','rain','detox','tempo','frost','wind','mire','arc','shard','roost','mycelium']);
  const apexOperations={foes,plants,hit,paint,wait,area,dense,point,row,col,nearby,byHouse,byHurt,armored,flying,heal,chill,stun,push,shield,enemy,damaged,sun,food:()=>lib.food.component,deposit,feedback};
  const heavyOperations={...apexOperations,foes:heavyTargets,area:heavyArea,enemy:heavyTarget};
  const bombardOperations={...heavyOperations,foes:s=>heavyTargets(s,true),area:blastArea,hit:blastHit};
  function apex(s,id,anchor){if(s.levels[id]>=5)gardenEquipmentApex.trigger(s,id,
    id==='bombard'?bombardOperations:id==='prism'||id==='rotary'?heavyOperations:apexOperations,anchor);}
  function feedback(s,id,p={r:Math.floor(lib.square.MaxLaneIndex/2),c:0}){
    const q=s.specs[id];if(!q?.responsePower)return;
    let best=null,distance=Infinity;
    for(const z of foes(s)){const d=Math.abs(row(z)-p.r)+Math.abs(col(z)-p.c);
      if(d<distance||d===distance&&best&&byHouse(z,best)<0){best=z;distance=d;}}
    if(best){paint(s,q.responseFx,p,point(best));hit(best,q.responsePower,q.element,q.kind);}
  }
  function flare(s,scale,isWave){
    const q=s.specs.flare,list=foes(s);if(!list.length)return false;
    paint(s,'flare',dense(list));
    for(const z of list){hit(z,Math.round(scale*q.strength),1,'splash');if(isWave&&q.level>=3)chill(z,1);}
    if(isWave&&q.level>=4)wait(s,1,()=>flare(s,.35,false));
    if(isWave)apex(s,'flare',dense(list));
    return true;
  }
  function eventWave(s){
    const wave=Number(s.level.currentWave);if(!Number.isFinite(wave)||wave<=s.wave)return;
    const first=s.wave<0;s.wave=wave;
    const q=s.specs.orchard;
    if(q){
      drop(s,q.strength,0);s.harvests++;
      feedback(s,'orchard');
      if(q.level>=3&&s.harvests%3===0)drop(s,q.strength);
      if(q.level>=4)for(const p of plants(s))if(col(p)<=1)p.plantCDScaleSetter(.8,2.5);
      apex(s,'orchard');
    }
    if(!first&&s.levels.reservoir>=4){deposit(20);feedback(s,'reservoir');}
    if(s.specs.flare)s.flare=true;
  }
  const elements=['yellow','ice','blue','purple','electric','toxin'];
  function chamber(s){
    if(!s.ammo?.length){
      s.ammo=elements.slice();s.ammoSeed??=Date.now()>>>0;
      for(let i=s.ammo.length-1;i>0;i--){
        s.ammoSeed=(Math.imul(1664525,s.ammoSeed)+1013904223)>>>0;
        const j=Math.floor(s.ammoSeed/4294967296*(i+1));
        [s.ammo[i],s.ammo[j]]=[s.ammo[j],s.ammo[i]];
      }
    }
    return s.ammo.pop();
  }
  function burstAt(s,z,p,amount,deal){
    const source={worldPositionX:(z.worldPositionX??z.worldPosition.x)-.1};
    const fire=()=>{for(const target of blastArea(s,p,1,1))deal(target,amount);};
    if(typeof gardenChallengeTroopers!=='undefined')gardenChallengeTroopers.blast(source,fire,[amount]);
    else fire();
  }
  const gridDistance=(a,b)=>Math.hypot(a.r-b.r,a.c-b.c);
  function precisionShot(s,z,list,n){
    const aim=point(z),line=list.filter(t=>row(t)===aim.r),reserve=list.find(t=>row(t)!==aim.r);
    const spec=s.specs.sniper,spent=new Map(),scale=spec.secondaryTotal/3200;
    const roof={worldPositionX:lib.square.getSquareWorldPosition(0,0).x};
    const guards=typeof gardenChallengeTroopers!=='undefined'&&gardenChallengeTroopers;
    let left=spec.secondaryTotal;
    // All delayed stages share one ledger. Reserve distinct portions for shock,
    // shrapnel and chains so a crowded blast cannot consume the later stages.
    function stage(share,action){
      if(left<=0)return;
      let budget=Math.round(spec.secondaryTotal*share);
      const shield=guards&&guards.snapshot(roof,0);
      function open(t){
        return heavyTarget(t)&&(spent.get(t)||0)<spec.secondaryPerTarget&&gridDistance(point(t),aim)<=5.5&&
          (!shield||!guards.blocked(t,{_gardenBlast:shield}));
      }
      function strike(t,raw,element,kind){
        if(!open(t))return 0;
        const prior=spent.get(t)||0,amount=Math.min(Math.round(raw*scale),budget,left,spec.secondaryPerTarget-prior);
        if(amount<=0)return 0;
        left-=amount;budget-=amount;spent.set(t,prior+amount);
        blastHit(t,amount,element,kind,false,false,true);
        return amount;
      }
      action(open,strike);
    }
    function around(p,open,range){
      return heavyArea(s,p,Math.ceil(range),Math.ceil(range)).filter(t=>open(t)&&gridDistance(point(t),p)<=range);
    }
    function spread(entries,allowance,strike){
      const occupied=new Set(),front=[],overlap=[];
      for(const entry of entries){
        const key=row(entry.t)*32+col(entry.t);
        (occupied.has(key)?overlap:front).push(entry);occupied.add(key);
      }
      const targets=front.concat(overlap).slice(0,14);
      for(let i=0;i<targets.length;i++){
        const {t,power,element,kind}=targets[i];
        const per=Math.ceil(allowance/(targets.length-i));
        allowance-=strike(t,Math.min(power,per),element,kind)/scale;
      }
    }
    function fragments(blade){
      const count=blade?3:4;
      stage(blade?.12:.16,(open,strike)=>{
        const choices=around(aim,open,3.6).filter(t=>t!==z&&gridDistance(point(t),aim)>0);
        const destinations=[];
        for(let i=0;i<count&&choices.length;i++){
          const separation=t=>Math.min(...[aim,...destinations].map(p=>gridDistance(point(t),p)));
          choices.sort((a,b)=>separation(b)-separation(a)||byHouse(a,b));
          const t=choices.shift(),to=point(t);destinations.push(to);
          paint(s,blade?'precision-blade':'precision-fragment',aim,to);
          strike(t,128,0,blade?'pierce':'splash');
        }
      });
    }
    function chain(p,blade,hop,seen){
      wait(s,blade?.14:.19,()=>{
        const shares=blade?[.064,.048,.038]:[.07,.055];
        let next=null;
        stage(shares[hop],(open,strike)=>{
          const target=around(p,open,2.6).filter(t=>!seen.has(t)&&gridDistance(point(t),p)>.1)
            .sort((a,b)=>gridDistance(point(b),aim)-gridDistance(point(a),aim)||
              gridDistance(point(b),p)-gridDistance(point(a),p)||byHouse(a,b))[0];
          if(!target)return;
          next=point(target);seen.add(target);
          paint(s,blade?'precision-chain':'precision-echo',p,next);
          const raw=blade?[140,105,85][hop]:[150,120][hop];
          strike(target,raw,blade?0:1,blade?'pierce':'splash');
          const nearby=blastArea(s,next,2,2).filter(t=>t!==target&&open(t)&&gridDistance(point(t),next)<=1.5)
            .sort((a,b)=>gridDistance(point(a),next)-gridDistance(point(b),next)||byHouse(a,b));
          for(const t of nearby)strike(t,Math.round(raw*.6),blade?0:1,'splash');
        });
        if(next&&hop+1<shares.length)chain(next,blade,hop+1,seen);
      });
    }
    paint(s,'precision-pierce',{r:aim.r,c:-.6},{r:aim.r,c:lib.square.MaxColumnIndex});
    for(const t of line)hit(t,t===z?n:Math.round(n*.7),0,'pierce');
    if(reserve)hit(reserve,Math.round(n*.6),0,'pierce');
    chill(z,1.8);
    paint(s,'precision-burst',aim);
    stage(.225,(open,strike)=>{
      const wave=blastArea(s,aim,2,3).map(t=>({t,d:((row(t)-aim.r)/2.35)**2+((col(t)-aim.c)/3.5)**2}))
        .filter(({t,d})=>d<=1&&open(t)).sort((a,b)=>a.d-b.d||byHouse(a.t,b.t));
      spread(wave.map(({t,d})=>({t,power:Math.round(405-180*d),element:1,kind:'splash'})),720,strike);
    });
    fragments(false);chain(aim,false,0,new Set([z]));
    wait(s,.18,()=>{
      paint(s,'precision-cleave',aim);
      stage(.22,(open,strike)=>{
        const blades=blastArea(s,aim,3,3).filter(open).map(t=>{
          const dr=Math.abs(row(t)-aim.r),dc=Math.abs(col(t)-aim.c);
          return {t,edge:Math.abs(dr-dc),reach:Math.max(dr,dc)};
        }).filter(t=>t.edge<=1).sort((a,b)=>a.edge-b.edge||b.reach-a.reach||byHouse(a.t,b.t));
        spread(blades.map(({t,edge})=>({t,power:edge?175:350,element:0,kind:edge?'splash':'pierce'})),704,strike);
      });
      fragments(true);chain(aim,true,0,new Set([z]));
    });
  }
  function mixedShot(s,z,list,n){
    const e=chamber(s),p=point(z),type=e==='electric'?2:['yellow','blue','purple'].includes(e)?1:0;
    if(Math.random()>=s.specs.sniper.accuracy){paint(s,'mk14-miss-'+e,{r:p.r+.32,c:p.c+.53});return;}
    paint(s,'mk14-hit-'+e,p);
    const plating=e==='blue'&&armored(z);
    hit(z,n,type,'pierce');
    const rear=list.find(t=>t!==z&&row(t)===p.r),side=list.find(t=>row(t)!==p.r);
    if(rear)hit(rear,Math.round(n*.5),type,'pierce');
    if(side)hit(side,Math.round(n*.6),type,'pierce');
    if(e==='yellow')burstAt(s,z,p,Math.round(n*.25),(t,amount)=>{if(t!==z)blastHit(t,amount,1,'splash');});
    if(e==='ice'&&enemy(z)){if(z.chill>0)z.setFreeze(Math.max(z.freeze||0,.65));chill(z,4);}
    if(plating)hit(z,Math.round(n*.3),1,'pierce');
    if(e==='purple')for(const t of blastArea(s,p,1,1))if(row(t)!==p.r)blastHit(t,Math.round(n*.35),1,'splash');
    if(e==='electric'){
      let last=p;const used=new Set([z]);
      for(const scale of [.5,.3]){
        const next=heavyArea(s,last,1,2).filter(t=>!used.has(t)).sort((a,b)=>
          Math.abs(row(a)-last.r)+Math.abs(col(a)-last.c)-Math.abs(row(b)-last.r)-Math.abs(col(b)-last.c))[0];
        if(!next)break;used.add(next);last=point(next);hit(next,Math.round(n*scale),2,'electric');
      }
    }
    if(e==='toxin'&&enemy(z)&&z.pushPoisonStacked){
      z.pushPoisonStacked(new z.poison.constructor(10,5));
      z.pushSpeedStacked({SpeedMult:.95,Duration:5});
    }
  }
  function auto(s){
    eventWave(s);
    if(s.levels.reservoir===5&&lib.sun.component?.CurrentValue<100&&(s.rescueDue||0)<=s.time){
      s.rescueDue=s.time+35;apex(s,'reservoir');
    }
    if(s.flare&&flare(s,1,true))s.flare=false;
    periodic(s,'flare',()=>flare(s,.5,false));
    periodic(s,'sniper',(lv,n)=>{
      const list=heavyTargets(s).sort(byHouse);
      if(!list.length)return false;
      const z=lv>=6?gardenSniperWatch.acquire(s,list,apexOperations):list[0];
      if(lv>=5){
        if(s.specs.sniper.form==='mk14')mixedShot(s,z,list,n);
        else precisionShot(s,z,list,n);
        return;
      }
      const shoot=(t,scale)=>{if(t){paint(s,'sniper',point(t));hit(t,Math.round(n*scale),0,'pierce');}};
      shoot(z,1);
      if(lv>=2)shoot(list.find(t=>t!==z&&row(t)===row(z)),.5);
      if(lv>=3)chill(z,1.8);
      if(lv>=4)shoot(list.find(t=>row(t)!==row(z)),.6);
    });
    periodic(s,'thorns',(lv,n)=>{
      const ground=foes(s).filter(z=>!flying(z));s.thornPulses++;
      for(const z of ground){
        hit(z,n+(lv>=2&&col(z)<=2?Math.round(n*.35):0));
        if(lv>=3&&s.thornPulses%3===0){chill(z,.85);if(lv===4&&enemy(z))z.setPoison(8,3,true);}
      }
      if(ground.length)paint(s,'thorn',point(ground[s.thornPulses%ground.length]));
    });
    periodic(s,'prism',(lv,n)=>{
      const list=heavyTargets(s);if(!list.length)return false;
      const groups=new Map();for(const z of list){if(!groups.has(row(z)))groups.set(row(z),[]);groups.get(row(z)).push(z);}
      const rank=s.levels.prism,lanes=Array.from(groups.values()).sort((a,b)=>b.length-a.length||row(a[0])-row(b[0]));
      const p=s.prismAnchor=dense(lanes[0],0,0),ratios=rank>=5?[1,.70,.55]:rank>=2?[1,.70]:[1];
      for(let i=0;i<Math.min(lanes.length,ratios.length);i++){
        const r=row(lanes[i][0]);paint(s,i?'prism-fold':'prism',{r,c:0},{r,c:lib.square.MaxColumnIndex});
        for(const z of lanes[i]){
          const clampArmor=i>0&&rank>=6&&supportArmored(z);hit(z,Math.round(n*ratios[i]),4,'pierce');
          if(!i&&rank>=3)chill(z,2.2);if(clampArmor)stun(z,.6);
        }
      }
      if(rank>=3)wait(s,.45,()=>{
        paint(s,'prism-fold',{r:p.r,c:lib.square.MaxColumnIndex},{r:p.r,c:0});
        for(const z of heavyTargets(s))if(row(z)===p.r)hit(z,Math.round(n*.4),4,'pierce');
      });
      if(rank>=4){paint(s,'prism-fold',{r:0,c:p.c},{r:lib.square.MaxLaneIndex,c:p.c});
        for(const z of list)if(col(z)===p.c)hit(z,Math.round(n*.8),4,'pierce');}
      if(rank===7){
        s.prismCycles=(s.prismCycles||0)+1;
        if(s.prismCycles%3===0)prismCross(s,p,Math.round(n*.35));
      }
    });
    periodic(s,'reservoir',(lv)=>{const low=lib.sun.component?.CurrentValue<200,rate=s.levels.reservoir===5?65:[0,25,35,45][lv-1];deposit(rate+(lv>=3&&low?25:0));feedback(s,'reservoir');});
    periodic(s,'orchard',(_,n)=>{drop(s,Math.ceil(n/2));feedback(s,'orchard');});
    periodic(s,'dew',(lv,n)=>{
      const p={r:Math.floor(lib.square.MaxLaneIndex/2),c:1},low=lib.sun.component?.CurrentValue<250;
      sun(s,n,p);s.dewdrops++;feedback(s,'dew',p);
      if(lv>=2&&s.dewdrops%2===0)drop(s,15,2);
      if(lv>=3)for(const t of plants(s))if(nearby(t,p))heal(t,20);
      if(lv===4&&low)drop(s,25,0);
    });
    periodic(s,'relay',(lv,n)=>{
      const counter=lib.food.component;if(!counter||lv===1&&counter.full())return false;
      const pulses=lv>=3&&(s.relayPulses+1)%3===0?2:1;let excess=0;s.relayPulses++;
      for(let i=0;i<pulses;i++){if(counter.full())excess++;else counter.plantFoodAdd();}
      if(lv>=2)drop(s,n+(lv===4?excess*50:0));paint(s,'growth',{r:0,c:0});feedback(s,'relay',{r:0,c:0});
    });
    periodic(s,'infirmary',(lv,n)=>{
      const list=plants(s).filter(damaged).sort(byHurt),p=list[0];if(!p)return false;
      const critical=p.health<p.toughness*.35;heal(p,n);paint(s,'heal',point(p));feedback(s,'infirmary',point(p));
      const other=lv>=2&&list.find(t=>t!==p&&row(t)===row(p));if(other){heal(other,Math.round(n*.5));paint(s,'heal',point(other));}
      if(lv>=3&&critical)shield(p,1);
      if(lv===4)wait(s,1.25,()=>heal(p,Math.round(n*.5)));
    });
    periodic(s,'rain',(lv,n)=>{
      const list=plants(s).filter(damaged);if(!list.length)return false;
      for(const p of list){
        if(lv===4&&p.health<p.toughness*.4)shield(p,1.25);
        if(lv>=3){p.stunned=0;p.boomboxCD=0;}heal(p,n);
      }
      for(const p of list.slice(0,4))paint(s,'rain',point(p));
      feedback(s,'rain',point(list[0]));
      if(lv>=2)wait(s,2,()=>{for(const p of list)heal(p,Math.round(n*.25));});
    });
    periodic(s,'shell',(lv,n)=>{
      const all=plants(s),p=all.filter(p=>p.health<p.toughness*(.25+lv*.05)).sort(byHurt)[0];if(!p)return false;
      const duration=[2,2.25,2.5,3][lv-1];
      heal(p,p.toughness*n/100);shield(p,duration);paint(s,'shield',point(p));feedback(s,'shell',point(p));
      if(lv>=2){const next=all.filter(t=>p!==t&&row(t)===row(p)).sort((a,b)=>Math.abs(col(a)-col(p))-Math.abs(col(b)-col(p)))[0];if(next)shield(next,duration/2);}
      if(lv>=3)wait(s,1.5,()=>heal(p,p.toughness*.1));
      if(lv===4)for(const z of area(s,point(p),1,1))push(z,.5);
      apex(s,'shell',point(p));
    });
    periodic(s,'detox',(lv,n)=>{
      const all=plants(s),list=all.filter(p=>p.stunned>0||p.boomboxCD>0).slice(0,lv===4?Infinity:lv+2);if(!list.length)return false;
      for(const p of list){p.stunned=0;p.boomboxCD=0;heal(p,n);paint(s,'heal',point(p));
        if(lv>=2)shield(p,1);if(lv>=3)p.plantCDScaleSetter(.8,2);}
      if(lv===4)for(const p of all)if(!list.includes(p)&&list.some(t=>nearby(p,point(t))))heal(p,Math.round(n*.5));
      feedback(s,'detox',point(list[0]));
    });
    periodic(s,'tempo',(lv,n)=>{
      const all=plants(s);
      for(let i=1;i<=lib.square.LaneCount;i++){
        const r=(s.tempo+i)%lib.square.LaneCount,list=all.filter(p=>row(p)===r);if(!list.length)continue;
        for(const p of list){p.plantCDScaleSetter(n/100,2.5+lv*.5);if(lv>=2)heal(p,15);}
        if(lv>=3)for(const p of all)if(row(p)===r+1)p.plantCDScaleSetter(.85,2);
        if(lv===4)shield(list.reduce((a,b)=>col(b)>col(a)?b:a),1.5);
        s.tempo=r;paint(s,'tempo',{r,c:0},{r,c:Math.max(...list.map(col))});feedback(s,'tempo',{r,c:0});return;
      }
      return false;
    });
    periodic(s,'frost',(lv,n)=>{
      const p=dense(foes(s));if(!p)return false;
      for(const z of area(s,p,lv>=3?2:1,lv>=3?2:1)){
        if(!nearby(z,p)){chill(z,1.5);continue;}
        z.setFreeze(Math.max(z.freeze||0,n));if(lv>=2)hit(z,s.specs.frost.contact,0,'ice');
      }
      if(lv===4)wait(s,.85,()=>{paint(s,'frost',p);for(const z of area(s,p,0,0))z.setFreeze(Math.max(z.freeze||0,1.1));});
      paint(s,'frost',p);
    });
    periodic(s,'wind',(lv,n)=>{
      const list=foes(s).sort(byHouse).slice(0,[3,3,4,5][lv-1]);if(!list.length)return false;
      const blast=new Set();
      for(const z of list){const p=point(z);if(lv===4)for(const t of area(s,{r:p.r,c:p.c+1},1,0))blast.add(t);
        push(z,n+(lv>=3&&flying(z)?.35:0));if(lv>=2){stun(z,.55);hit(z,s.specs.wind.contact);}paint(s,'wind',p);}
      for(const z of blast)hit(z,65,0,'splash');
    });
    periodic(s,'mire',(lv,n)=>{
      const p=dense(foes(s));if(!p)return false;
      const cells=()=>foes(s).filter(z=>row(z)===p.r&&(col(z)===p.c||lv>=3&&col(z)===p.c-1));
      paint(s,'mire',p);if(lv>=3&&p.c>0)paint(s,'mire',{r:p.r,c:p.c-1});
      const beats=9+lv;
      for(let i=0;i<beats;i++)wait(s,i*.5,()=>{for(const z of cells()){chill(z,n);if(lv>=2)hit(z,s.specs.mire.contact);}});
      if(lv===4)wait(s,beats*.5,()=>{for(const z of cells())stun(z,1);});
    });
    if(s.specs.tripwire&&!(s.wireCheck>s.time)){
      s.wireCheck=s.time+.25;
      const q=s.specs.tripwire,maxCol=q.level>=3?2:1,list=foes(s).filter(z=>col(z)<=maxCol);
      for(let r=0;r<lib.square.LaneCount;r++){
        const targets=list.filter(z=>row(z)===r);if(!targets.length||(s.wires[r]||0)>s.time)continue;
        for(const z of targets){stun(z,q.strength);if(q.level>=2)hit(z,q.contact,2,'electric');}
        if(q.level>=4)for(const z of list)if(Math.abs(row(z)-r)===1)stun(z,q.strength/2);
        apex(s,'tripwire',{r,c:0});
        s.wires[r]=s.time+q.interval;paint(s,'arc',{r,c:0},{r,c:maxCol});
      }
    }
    periodic(s,'arc',(lv,n)=>{
      const pool=foes(s).sort(byHouse);if(!pool.length)return false;
      let origin={r:row(pool[0]),c:0},candidate=pool.shift();
      for(const factor of (lv>=2?[1,.72,.5,.38]:[1,.72,.5])){
        if(!candidate)break;
        const z=candidate,p=point(z),amount=Math.round(n*factor);paint(s,'arc',origin,p);hit(z,amount,2,'electric');origin=p;
        if(factor===1&&lv>=3)stun(z,.6);
        if(lv===4)wait(s,.25,()=>hit(z,Math.round(amount*.35),2,'electric'));
        const next=pool.filter(t=>nearby(t,p,2,2)).sort((a,b)=>Math.abs(row(a)-p.r)+Math.abs(col(a)-p.c)-Math.abs(row(b)-p.r)-Math.abs(col(b)-p.c))[0];
        if(next)pool.splice(pool.indexOf(next),1);candidate=next;
      }
    });
    periodic(s,'shard',(lv,n)=>{
      const list=foes(s).filter(armored).sort(byHouse).slice(0,lv===4?5:3);if(!list.length)return false;
      for(const z of list){
        const p=point(z);paint(s,'shard',p);hit(z,n,0,'pierce');
        if(lv>=2)for(const t of area(s,p,1,1))if(t!==z)hit(t,Math.round(n*.3),0,'splash');
        if(lv>=3)chill(z,1.4);if(lv===4)wait(s,.6,()=>{if(enemy(z)&&armored(z))hit(z,Math.round(n*.5),0,'pierce');});
      }
    });
    periodic(s,'roost',(lv,n)=>{
      const all=foes(s).sort(byHouse),list=all.filter(flying).slice(0,lv>=3?3:2);
      if(!list.length){if(lv<4||!all.length)return false;paint(s,'roost',point(all[0]));hit(all[0],Math.round(n*.5));return;}
      for(const z of list){const p=point(z);paint(s,'roost',p);hit(z,n);if(lv>=2)chill(z,1.4);
        if(lv>=3)for(const t of area(s,p,0,1))if(!flying(t))hit(t,Math.round(n*.45),0,'splash');}
    });
    periodic(s,'mycelium',(lv,n)=>{
      const all=foes(s).sort(byHouse),fresh=all.filter(z=>!z.poisoned).slice(0,3),old=lv===4?all.filter(z=>z.poisoned).slice(0,2):[];
      if(!fresh.length&&!old.length)return false;
      for(const z of old){paint(s,'spore',point(z));hit(z,n*2);}
      const centers=fresh.map(point),duration=3.5+lv*.5;
      for(const z of fresh){paint(s,'spore',point(z));z.setPoison(n,duration,true);if(lv>=2)hit(z,18);}
      if(lv>=3&&centers.length)wait(s,1,()=>{const t=foes(s).find(z=>!z.poisoned&&centers.some(p=>nearby(z,p)));if(t){paint(s,'spore',point(t));t.setPoison(n/2,duration,true);}});
    });
  }
  function deployRotary(s){
    const groups=s.rotaryGroups??=new Map(),previous=groups.get(s.time);
    if(previous)previous.count++;
    else groups.set(s.time,{count:1,fired:0});
    if(!(s.rotarySpinAt>s.time)){paint(s,'spin',s.home);s.rotarySpinAt=s.time+.25;}
  }
  function rotaryArmor(z){
    let hp=0;for(const plate of z.armors||[])hp+=Math.max(0,plate.health||0);
    const suit=typeof gardenChallengeArmor!=='undefined'&&gardenChallengeArmor.state(z);
    if(suit)for(const name of ['helmet','vest','door','shield'])hp+=suit[name]?.hp||0;
    return hp;
  }
  function rotaryAP(s,rounds,level,n){
    const board=z=>heavyTarget(z)&&!camouflaged(z)&&z.health>0&&row(z)>=0&&row(z)<lib.square.LaneCount&&col(z)>=0&&col(z)<=lib.square.MaxColumnIndex;
    const pool=heavyTargets(s).filter(board).sort(byHouse);
    const troopers=typeof gardenChallengeTroopers!=='undefined'&&gardenChallengeTroopers;
    const cellWidth=Math.abs(lib.square.getSquareWorldPosition(0,1).x-lib.square.getSquareWorldPosition(0,0).x);
    const sourceX=lib.square.getSquareWorldPosition(0,0).x-cellWidth;
    const shields=()=>troopers?(troopers.snapshot({worldPositionX:sourceX},n)?.items||[]):[];
    const {reach,follow}=s.specs.rotary,rows=new Map();
    for(const z of pool){
      const lane=row(z);if(!rows.has(lane))rows.set(lane,[]);
      rows.get(lane).push(z);
    }
    let guards=shields();
    function acquire(){
      const first=pool.find(board);if(!first||level===5||level===7&&col(first)<4)return first;
      let best=first,thickness=0;
      for(const z of pool)if(board(z)&&col(z)<=col(first)+3){
        const value=rotaryArmor(z);if(value>thickness){best=z;thickness=value;}
      }
      return best;
    }
    let impact=null,exit=null;
    while(rounds>0){
      if(!board(s.rotaryApTarget))s.rotaryApTarget=acquire();
      const locked=s.rotaryApTarget;if(!locked)break;
      const guard=guards.length&&troopers.firstShield(row(locked),sourceX,locked.worldPosition.x,guards);
      const front=guard&&board(guard)?guard:locked;
      const line=[front],frontX=front.worldPosition.x;
      let previousX=frontX;
      for(const z of rows.get(row(front))){
        const x=z.worldPosition.x;if(x>frontX+reach*cellWidth+.01)break;
        if(x<=previousX+.01||!board(z))continue;
        line.push(z);previousX=x;if(line.length>follow.length)break;
      }
      // Batch only while the same bodies and shields stay on this trajectory.
      // A fatal hit or broken shield changes the path on the following bullet.
      let batch=rounds,transmission=1,hasShield=false;
      const powers=[];
      for(let i=0;i<line.length;i++){
        const z=line[i],power=Math.round(n*(i?follow[i-1]:1)*transmission);
        powers.push(power);batch=Math.min(batch,Math.max(1,Math.floor(z.health/(power*10))));
        const shield=guards.find(g=>g.z===z&&g.sign===1);
        if(shield){
          const hp=gardenChallengeArmor.state(z)?.shield?.hp||0;
          if(hp>0){
            // The bullet that breaks the shield still had to cross it.
            batch=Math.min(batch,Math.max(1,Math.floor(hp/(power*(shield.elite?3.12:2.4)))));
            transmission*=.5;hasShield=true;
          }
        }
      }
      impact=point(front);exit=line.length>1?point(line[line.length-1]):null;
      for(let i=0;i<line.length;i++)hit(line[i],powers[i]*batch,0,'rotary-ap');
      rounds-=batch;
      if(hasShield)guards=shields();
    }
    if(impact&&!(s.rotaryApFxAt>s.time)){
      s.rotaryApFxAt=s.time+.095;paint(s,'rotary-ap',impact,exit);
    }
  }
  function rotaryStep(s){
    const groups=s.rotaryGroups;
    if(!groups?.size)return;
    const {level,strength:n,form}=s.specs.rotary,lanes=lib.square.LaneCount,ap=form==='ap';
    const total=ap?1920:gardenRotaryAdvanced.rounds[level-1],bins=[];
    let pending=0;
    for(const [start,group] of groups){
      const end=Math.min(total,Math.floor((s.time-start)*total/30+.2+1e-8));
      if(end>group.fired){
        pending+=(end-group.fired)*group.count;
        if(!ap)for(let i=group.fired+1;i<=end;i++){
          const lane=(i-1)%lanes,intercept=level>=7&&i%3===0,key=lane+(intercept?lanes:0);
          const b=bins[key]??={lane,intercept,shots:0,blast:0,slash:0,stun:0,mirror:0,column:0,drill:0};
          b.shots+=group.count;
          if(i%4===0)b.blast+=group.count;
          if(i%8===0){b.slash+=group.count;if(level>=4)b.mirror+=group.count;}
          if(level>=3&&i%5===0)b.stun+=group.count;
          if(level>=5&&i%20===0)b.column+=group.count;
          if(level>=6&&i%6===0)b.drill+=group.count;
        }
        group.fired=end;
      }
      if(group.fired===total)groups.delete(start);
    }
    if(!pending)return;
    s.rotaryFired=(s.rotaryFired||0)+pending;
    if(ap){rotaryAP(s,pending,level,n);return;}
    const pool=heavyTargets(s);if(!pool.length)return;
    const spill=heavyTargets(s,true);
    const byLane=Array.from({length:lanes},()=>[]),fire=new Map(),visual={},front=level>=7?pool.filter(z=>col(z)>=0&&col(z)<4).sort(byHouse):[];
    for(const z of pool)byLane[row(z)]?.push(z);
    const normalAims=new Map(),armorScores=new Map();
    function protection(z){
      if(armorScores.has(z))return armorScores.get(z);
      const hp=rotaryArmor(z);
      armorScores.set(z,hp);return hp;
    }
    for(const b of bins){
      if(!b)continue;
      const intercept=b.intercept&&front.find(z=>row(z)!==b.lane);
      let p;
      if(intercept)p=point(intercept);
      else{
        if(!normalAims.has(b.lane))normalAims.set(b.lane,dense(byLane[b.lane].length?byLane[b.lane]:pool));
        p=normalAims.get(b.lane);
      }
      const center=intercept||pool.find(z=>nearby(z,p,0,0));
      let plated=null,best=0;
      if(b.drill)for(const z of pool){
        if(!nearby(z,p,1,3))continue;
        const hp=protection(z);
        if(hp>best||hp>0&&hp===best&&byHouse(z,plated)<0){plated=z;best=hp;}
      }
      const diverted=plated?b.drill:0;
      let mirror=lib.square.MaxLaneIndex-p.r;
      if(mirror===p.r)mirror=(p.r+1)%lanes;
      const distance=z=>(row(z)-p.r)**2+(col(z)-p.c)**2;
      const contacts=spill.filter(z=>z!==center).sort((a,b)=>distance(a)-distance(b)||byHouse(a,b));
      function packet(z){
        let h=fire.get(z);
        if(!h){h={splash:0,pierce:0,blast:0,stun:false,intercept:false};fire.set(z,h);}
        return h;
      }
      const h=packet(center);
      h.splash+=(b.shots-diverted)*n;
      if(level>=2)h.pierce+=(b.shots-diverted)*Math.round(n*.5);
      if(plated)packet(plated).pierce+=diverted*(n+Math.round(n*.5));
      h.blast+=b.blast*Math.round(n*.90);
      h.pierce+=b.slash*Math.round(n*1.20);
      h.stun||=b.stun>0;h.intercept||=Boolean(intercept);
      // An impact has a finite number of fragments. Co-located enemies share
      // the same fragment slots as nearby enemies, including at 4x speed.
      const neighbors=contacts.filter(z=>nearby(z,p,1,1)).slice(0,3);
      for(let i=0;i<neighbors.length;i++){
        const secondary=packet(neighbors[i]);
        if(i<2){secondary.splash+=b.shots*Math.round(n*.24);secondary.stun||=b.stun>0;}
        secondary.blast+=b.blast*Math.round(n*.45);
      }
      if(b.slash){
        const edges=contacts.filter(z=>{
          const dr=Math.abs(row(z)-p.r);return dr>0&&dr<=2&&dr===Math.abs(col(z)-p.c);
        }).slice(0,2);
        for(const z of edges)packet(z).pierce+=b.slash*Math.round(n*.75);
      }
      if(b.mirror){
        const reflected=contacts.find(z=>row(z)===mirror&&Math.abs(col(z)-p.c)<=1);
        if(reflected)packet(reflected).splash+=b.mirror*Math.round(n*.30);
      }
      if(b.column){
        const vertical=contacts.filter(z=>col(z)===p.c&&row(z)!==p.r&&Math.abs(row(z)-p.r)<=2).slice(0,2);
        for(const z of vertical)packet(z).splash+=b.column*Math.round(n*.45);
      }
      visual.shot=p;
      if(b.blast)visual.blast=p;if(b.slash)visual.slash=p;if(b.column)visual.column=p;
      if(plated)visual.drill=point(plated);if(intercept)visual.intercept=p;
    }
    const deliver=()=>{
      for(const [z,h] of fire){
        if(typeof gardenChallengeTroopers!=='undefined'&&gardenChallengeTroopers.blocked(z,null))continue;
        // Preserve the three native damage routes, independent of the fan-out and
        // simultaneous deployments. The entire frame needs at most three packets per victim.
        if(h.splash)blastHit(z,h.splash,0,'splash',false,true);
        if(h.blast)blastHit(z,h.blast,1,'splash',false,true);
        if(h.pierce)blastHit(z,h.pierce,0,'pierce',false,true);
        if(h.stun)stun(z,.45);
        if(h.intercept&&enemy(z)){
          const brakes=s.rotaryBrakes??=new WeakMap();
          if((brakes.get(z)||0)<=s.time){brakes.set(z,s.time+3);push(z,.35);stun(z,.5);}
        }
      }
    };
    if(typeof gardenChallengeTroopers!=='undefined'){
      const origin=lib.square.getSquareWorldPosition(0,0);
      gardenChallengeTroopers.blast({worldPositionX:origin.x},deliver,[n]);
    }else deliver();
    const due=s.rotaryFxDue??={};
    for(const [key,style,gap] of rotaryCues)if(visual[key]&&!(due[key]>s.time)){
      due[key]=s.time+gap;paint(s,style,visual[key]);
    }
  }
  const rotaryCues=[['shot','rotary',.14],['blast','rotary-blast',.32],['slash','rotary-cleave',.36],['column','rotary-column',.46],['drill','rotary-drill',.36],['intercept','rotary-intercept',.52]];
  function supportPaint(s,kind,p,q){
    // Several paid salvos may arrive on the same tile and frame. Render that impact once.
    if(s.supportPaintTime!==s.time){s.supportPaintTime=s.time;s.supportPaintKeys=new Set();}
    const key=[kind,p.r,p.c,q?.r,q?.c].join('/');
    if(s.supportPaintKeys.has(key)||s.supportPaintKeys.size>=16)return;
    s.supportPaintKeys.add(key);paint(s,kind,p,q);
  }
  function supportAim(s){
    return dense(heavyTargets(s),2,3)||{r:Math.floor(s.square.MaxLaneIndex/2),c:Math.min(6,s.square.MaxColumnIndex)};
  }
  function supportArmored(z){
    return armored(z)||(typeof gardenChallengeArmor!=='undefined'&&gardenChallengeArmor.state(z)?.shield?.hp>0);
  }
  function prismCross(s,p,power){
    const sq=s.square;
    for(const slope of [-1,1]){
      const len=sign=>Math.min(2,sign<0?p.r:sq.MaxLaneIndex-p.r,sign*slope<0?p.c:sq.MaxColumnIndex-p.c);
      const a=len(-1),b=len(1);
      supportPaint(s,'prism-fold',{r:p.r-a,c:p.c-a*slope},{r:p.r+b,c:p.c+b*slope});
    }
    for(const z of heavyArea(s,p,2,2))if(Math.abs(row(z)-p.r)===Math.abs(col(z)-p.c))hit(z,power,4,'pierce');
  }
  function prismActive(s){
    const q=s.specs.prism,p=supportAim(s);
    const pulse=()=>{
      const list=heavyTargets(s);
      supportPaint(s,'prism-lock',{r:p.r,c:0},{r:p.r,c:s.square.MaxColumnIndex});
      supportPaint(s,'prism-lock',{r:0,c:p.c},{r:s.square.MaxLaneIndex,c:p.c});
      for(const z of list){
        const inRow=row(z)===p.r,inColumn=col(z)===p.c;
        if(inRow||inColumn)hit(z,Math.round(q.strength*(inRow&&inColumn?1.5:1)),4,'pierce');
      }
      if(q.level===7){
        const outside=list.filter(z=>heavyTarget(z)&&row(z)!==p.r&&col(z)!==p.c),newCenter=dense(outside,1,1);
        if(newCenter)prismCross(s,newCenter,Math.round(q.strength*.7));
      }
    };
    pulse();
    for(let i=1;i<=3;i++)wait(s,i*q.duration/3,pulse);
  }
  function salvo(s,id){
    const {level,strength:n}=s.specs[id],lv=Math.min(4,level);
    if(id==='rotary'){
      deployRotary(s);
      return;
    }
    const q=s.specs.bombard,start=s.time;
    for(let i=0;i<q.shells;i++){
      const at=i*q.spacing,heavy=level>=4&&i===q.shells-1;let p;
      const acquire=()=>{
        p=supportAim(s);
        if(i){supportPaint(s,'target',p);supportPaint(s,'shell',p);}
      };
      const impact=()=>{
        supportPaint(s,heavy?'bombard-heavy':'bombard',p);
        const power=Math.round(n*(heavy?1.5:1));
        for(const z of blastArea(s,p,2,heavy?4:3)){
          const plate=level>=2&&supportArmored(z);
          blastHit(z,power,1,'splash',true);
          if(plate){blastHit(z,Math.round(power*.55),0,'pierce',true);push(z,.22);}
        }
        if(level>=6&&(i+1)%3===0){
          const detached=heavyTargets(s).filter(z=>!nearby(z,p,2,3));
          const flank=dense(detached.filter(supportArmored),1,1)||dense(detached,1,1);
          if(flank){supportPaint(s,'bombard-satellite',flank);
            for(const z of blastArea(s,flank,1,1))blastHit(z,Math.round(n*.55),0,'pierce',true);}
        }
        if(heavy&&level>=5)apex(s,'bombard',{...p,impactAt:start+at});
      };
      if(i){wait(s,at-.26,acquire);wait(s,at,impact);}else{acquire();impact();}
      if(q.echo)wait(s,at+q.echo,()=>{
        supportPaint(s,'bombard-echo',p);
        for(const z of blastArea(s,p,2,3))blastHit(z,Math.round(n*.35),1,'splash',true);
      });
    }
  }
  function status(id){
    const s=current,item=byId.get(id),equipped=!!s?.gear.has(id)&&s.level===lib?.level.component;
    const spec=equipped?s.specs[id]:null;
    const baseCost=spec?.activeCost??item?.activeCost??0;
    let cost=baseCost,discountIn=0;
    if(equipped&&id==='rotary'){
      const period=Math.floor((s.time+1e-8)/25);
      s.rotaryPrice??=baseCost;
      if(period>s.rotaryPricePeriod){
        s.rotaryPrice=Math.max(1000,s.rotaryPrice-50*(period-s.rotaryPricePeriod));
        s.rotaryPricePeriod=period;
      }
      cost=s.rotaryPrice;
      if(cost>1000)discountIn=clamp(25*(period+1)-s.time,0,25);
    }
    let count=0,active=0;
    const deployments=equipped&&s.deployments[id];
    if(deployments)for(const [end,quantity] of deployments){
      if(end<=s.time){deployments.delete(end);continue;}
      count+=quantity;active=Math.max(active,end-s.time);
    }
    const wallet=lib?.sun.component?.CurrentValue??0;
    let reason='';
    if(!equipped)reason='未装备';
    else if(!cost)reason='自动生效';
    else if(!liveBattle()||s.level.gameWon||s.level.gameLost||s.level.gameOver)reason='当前无法部署';
    else if(id==='rotary'&&count>=5)reason='机炮已满 5 台';
    else if(wallet<cost)reason='阳光不足';
    const ownedLevel=equipped?s.ownedLevels[id]:0,level=spec?.level||0;
    return {equipped,available:!reason,remaining:0,active,count,cost,discountIn,level,ownedLevel,capped:level<ownedLevel,form:spec?.form,actionName:spec?.actionName||item?.name,reason};
  }
  function act(id){
    const state=status(id);
    if(!state.available||current.charging)return false;
    const s=current;
    // SunDec runs native level-objective callbacks before updating the balance.
    s.charging=true;
    try{lib.sun.component.SunDec(state.cost,true,true);}finally{s.charging=false;}
    if(id==='rotary')s.rotaryPrice+=250;
    const deployments=s.deployments[id],end=s.time+(id==='rotary'?30:s.specs[id].duration);
    deployments.set(end,(deployments.get(end)||0)+1);
    if(id==='sniper')gardenSniperWatch.deploy(s,heavyOperations);
    else if(id==='prism')prismActive(s);
    else salvo(s,id);
    return true;
  }
  function init(l,m){
    clear();
    const gear=new Set(),ownedLevels={},levels={},specs={};
    const ordinary=typeof gardenChallenge==='undefined'||!gardenChallenge.active(l);
    const saved=gardenArmory.equipped()||[];
    for(const id of typeof gardenFixed==='undefined'?saved:gardenFixed.equipment(l,saved)){
      const item=byId.get(id);if(!item)continue;
      const owned=gardenArmory.level?.(id)||1;
      const heavy=item.slot==='heavy'||item.slot==='aviation';
      const level=ordinary&&heavy?Math.min(4,owned):owned;
      const form=level<5?undefined:id==='sniper'?gardenArmory.sniperForm?.():id==='rotary'?gardenArmory.rotaryForm?.():undefined;
      const q=gardenEquipmentUpgrades.spec(id,level,form);
      gear.add(id);ownedLevels[id]=owned;levels[id]=q.level;specs[id]=q;
    }
    const s=current={manager:m,level:l,ordinary,gear,ownedLevels,levels,specs,time:0,scan:0,tempo:-1,wave:-1,flare:false,kills:0,payouts:0,harvests:0,dewdrops:0,relayPulses:0,thornPulses:0,queue:[],due:{},deployments:{rotary:new Map(),bombard:new Map(),sniper:new Map(),prism:new Map()},rotaryPricePeriod:0,charging:false,wires:[],
      home:{r:Math.floor(lib.square.MaxLaneIndex/2),c:-1}, square:lib.square};
    if([...gear].some(id=>id.startsWith('intercept_')))gardenInterceptors.attach(s,paint);
    if(gear.has('airwing')){
      const inRound=()=>current===s&&lib.level.component===l&&!l.gameWon&&!l.gameLost&&!l.gameOver;
      gardenAirWing.attach(s,{current:inRound,live:()=>inRound()&&liveBattle(),sun:()=>lib.sun.component,targets:heavyTargets,area:blastArea,
        hit,blastHit,point,row,dense,byHouse,stun,chill,alive:heavyTarget});
    }
    if(typeof gardenWeaponAudio!=='undefined')gardenWeaponAudio.prepare(gear);
    // Paid emergency defences are armed immediately; periodic production waits its complete first cycle.
    for(const id of ['dew','relay','infirmary','rain','tempo','thorns','reservoir','orchard','flare'])if(specs[id])s.due[id]=specs[id].interval;
    if(gear.has('reservoir')){deposit(specs.reservoir.strength);feedback(s,'reservoir');}
    return s;
  }
  function clear(){if(current){gardenArsenalArt.reset(current);if(current.gear.has('airwing'))gardenAirWing.reset(current);}current=null;}
  function tick(manager){
    if(!liveBattle()){if(typeof gardenAirRaid!=='undefined')gardenAirRaid.tick(lib.level.component,0);return;}
    if(!lib.clock.runLogic||!lib.square.Square00)return;
    const dt=lib.clock.logicDt;if(!(dt>0&&Number.isFinite(dt)))return;
    const s=current?.level===lib.level.component&&current.manager===manager?current:init(lib.level.component,manager);
    if(typeof gardenWorldVeterans!=='undefined')gardenWorldVeterans.tick(lib.level.component,dt);
    if(typeof gardenChallengeHybrids!=='undefined')gardenChallengeHybrids.tick(lib.level.component,dt);
    if(typeof gardenAirRaid!=='undefined')gardenAirRaid.tick(lib.level.component,dt);
    if(typeof gardenFieldSupport!=='undefined')gardenFieldSupport.tick(lib.level.component,dt);
    if(!s.gear.size)return;
    s.time+=dt;auto(s);if(s.gear.has('rotary'))rotaryStep(s);
    if(s.gear.has('airwing'))gardenAirWing.tick(s,dt);
    const due=s.queue.filter(e=>e.at<=s.time);
    if(due.length){s.queue=s.queue.filter(e=>e.at>s.time);for(const e of due)e.run();}
    if(gardenFxSettings.enabled)gardenArsenalArt.step(s,dt);
  }
  function install(){
    if(installed)return;const get=n=>window.System.get('chunks:///_virtual/'+n+'.ts'),cc=window.System.get(window.System.resolve('cc'));
    lib={cc,tombTypes:get('Tombs')?.TombEnum,level:get('levelController').LevelPlay,clock:get('KeyListener').KeyListener,cm:get('CharacterManager'),square:get('Square').Square,
      ui:get('UI').UIInGame,sun:get('SunCount').SunCount,food:get('PlantFoodCount').PlantFoodCount,sunflower:get('Sunflower').sunflower};
    const cm=lib.cm.CharacterManager.prototype,step=cm.characterManagerUpdate;
    cm.characterManagerUpdate=function(...args){const ret=step.apply(this,args);tick(this);return ret;};
    const zombie=get('Zombie').Zombie.prototype,die=zombie.playDie;
    const ash=zombie.playAsh;
    zombie.playAsh=function(...args){
      const result=ash.apply(this,args);
      if(result&&ashImpact?.z===this)ashImpact.played=true;
      return result;
    };
    zombie.playDie=function(...args){
      const s=current,earn=!!s&&s.gear.has('bounty')&&liveBattle()&&!this.dead&&!this.displayed&&!this.hypnotized&&this.isRealZombie&&args[6]!==false;
      const q=earn&&s.specs.bounty,p=earn?point(this):null;
      const credit=earn&&q.level>=2&&(armored(this)||/armor|bucket|cone/i.test(this.Zombie_Type||''))?2:1;
      const ret=die.apply(this,args);
      if(earn&&this.dead){
        s.kills+=credit;
        if(s.kills>=q.interval){
          s.kills-=q.interval;s.payouts++;sun(s,q.strength,p);
          if(q.level>=3){const plant=plants(s).filter(damaged).sort(byHurt)[0];if(plant)heal(plant,30);}
          if(q.level>=4&&s.payouts%3===0)sun(s,Math.round(q.strength/2),p);
          apex(s,'bounty',p);
          feedback(s,'bounty',p);
        }
      }
      return ret;
    };
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,clear);
    gardenFxSettings.subscribe(enabled=>{
      if(!enabled&&current)gardenArsenalArt.reset(current);
      if(current?.gear.has('airwing'))gardenAirWing.redraw();
    });
    installed=true;
  }
  return Object.freeze({catalog,install,status,act});
})();
