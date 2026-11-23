const gardenChallengeArmor = (() => {
  const suits=new WeakMap(), resolving=new WeakSet(), listeners=new Set();
  const camouflageDraws=new WeakMap();
  // Randomize one place in each ten-spawn bag. Preview actors never consume a place.
  function drawCamouflage(level){
    let bag=camouflageDraws.get(level);
    if(!bag||bag.next===10){bag={next:0,chosen:Math.floor(Math.random()*10)};camouflageDraws.set(level,bag);}
    return bag.next++===bag.chosen;
  }
  const part=(max,reduction,blastReduction=reduction,extraHealth=0)=>({max,hp:max,reduction,blastReduction,extraHealth});
  // Flat body health is distinct from the destructible plate's wear. It enters
  // the native health maximum used on spawn, healing, and health-percentage AI.
  const spec=(base,scale,reduction,blastReduction,extraHealth)=>Object.freeze({base,scale,reduction,blastReduction,extraHealth});
  const profiles=Object.freeze({
    light:Object.freeze({helmet:spec(1300,2.3,.58,.80,300),vest:spec(2100,3.8,.68,.87,600)}),
    heavy:Object.freeze({helmet:spec(2350,3,.66,.85,600),vest:spec(3550,6,.77,.92,1200)}),
    elite:Object.freeze({helmet:spec(3300,3.8,.73,.90,900),vest:spec(5200,7.4,.84,.95,2100)})
  });
  const plate=(body,s)=>part(Math.round(s.base+body*s.scale),s.reduction,s.blastReduction,s.extraHealth);
  function state(z) {
    if (!z || z.dead || z.hypnotized) return null;
    const suit=suits.get(z);
    if(!suit)return null;
    if(suit.adventureLevel)return suit.adventureLevel===window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component?suit:null;
    return z._gardenChallengeHostile&&gardenChallenge.active()?suit:null;
  }
  function sync(z) {
    if (typeof gardenChallengeArmorArt !== 'undefined') gardenChallengeArmorArt.sync(z);
  }
  function release(z) {
    if(typeof gardenUltimates!=='undefined')gardenUltimates.forgetZombie(z);
    if(!suits.delete(z)) return;
    sync(z);
  }
  function create(z,options,preview=false) {
    release(z);
    if(!z._gardenChallengeHostile || !gardenChallenge.active()){
      if(typeof gardenAdventureFourth==='undefined')return;
      const slots=gardenAdventureFourth.kit(z,options,preview);
      if(!slots)return;
      const l=window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component;
      const suit={adventureLevel:l,helmet:part(0,0),vest:part(0,0),door:null,shield:null,heavy:false,elite:false,
        extraHealth:0,healthOn:!z.hypnotized,revision:0,staggerEnds:0,get stagger(){return Math.max(0,this.staggerEnds-l.gamedTime);}};
      for(const name of slots){
        const profile=gardenAdventureFourth.parts[name];suit[name]=part(profile.max,profile.reduction,profile.blast);
      }
      suits.set(z,suit);return;
    }
    const data=z.objdataOwn || {};
    const bucket=[z.Zombie_Type, ...(data.StartingArmors || [])].some(id=>
      typeof id === 'string' && /(?:bucket|(?:^|_)armor2(?:$|[_@)]))/.test(id.toLowerCase()));
    const guard=!!z.objdata?.GardenShieldguard,elite=!!z.objdata?.GardenEliteGuard,heavy=bucket||guard;
    const body=Math.max(180,Math.min(1100,Number(data.Toughness)||190));
    const level=window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component;
    const profile=elite?profiles.elite:heavy?profiles.heavy:profiles.light,helmet=plate(body,profile.helmet),vest=plate(body,profile.vest);
    const camouflage=!(preview||options?.gardenAlly)&&drawCamouflage(level);
    if(camouflage)for(const plate of [helmet,vest]){
      plate.max=plate.hp=Math.round(plate.max*.7);
      plate.reduction*=.7;plate.blastReduction*=.7;plate.extraHealth=Math.round(plate.extraHealth*.7);
    }
    const s={heavy,elite,camouflage,helmet,vest,extraHealth:helmet.extraHealth+vest.extraHealth,healthOn:!z.hypnotized,
      door:bucket?part(Math.round(700+body*1.6),.52):null,
      shield:guard?(elite?part(48000,.985,.995):part(24000,.96,.985)):null,
      revision:0,staggerEnds:0,
      get stagger(){return Math.max(0,this.staggerEnds-level.gamedTime);}};
    if(typeof gardenTitan!=='undefined')gardenTitan.kit(z,s);
    const tier=gardenChallenge.activeTyrant?.(level)||0;
    if(tier){
      s.penetrationPower=.75**tier;
      s.blastLeak=.8**tier;
      s.extraHealth*=2**tier;
      for(const plate of [s.shield,s.door,s.helmet,s.vest])if(plate){
        plate.blastReduction=Math.min(.999,1-(1-plate.blastReduction)*s.blastLeak);
      }
      if(tier===2){
        s.nightmare=true;
        for(const [name,endurance] of [['helmet',1.75],['vest',2]]){
          const plate=s[name];
          plate.hp=plate.max=Math.round(plate.max*endurance);
          plate.reduction=1-(1-plate.reduction)*.70;
          plate.blastReduction=Math.min(.999,1-(1-plate.blastReduction)*.60);
          plate.breachScale=.60;
        }
      }
    }
    suits.set(z,s);
  }
  function maxHealth(z,base) {
    const s=suits.get(z);return s?.healthOn?base+s.extraHealth:base;
  }
  function ready(z) {
    const s=suits.get(z);if(!s)return;
    const on=!z.hypnotized;
    if(s.healthOn!==on){
      // Native allegianceStats has already restored the row's original body
      // properties. Move to its new maximum without healing or killing the unit.
      const prior=z.toughness,current=z.health;s.healthOn=on;
      if(prior>0&&Number.isFinite(current))z.health=current*z.toughness/prior;
    }
    sync(z);
  }
  function repairVest(z,amount) {
    const s=state(z);
    if(!s || !Number.isFinite(amount) || amount<=0 || s.vest.hp<=0) return 0;
    const restored=Math.min(amount,s.vest.max-s.vest.hp);
    if(restored>0){s.vest.hp+=restored;s.revision++;sync(z);}
    return restored;
  }
  function suppress(z,seconds=3,soften=.12){
    const s=state(z),level=window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component;
    if(!s||!level||!Number.isFinite(seconds)||seconds<=0||!Number.isFinite(soften)||soften<=0)return;
    s.softRate=Math.max(s.softUntil>level.gamedTime?s.softRate:0,Math.min(1,soften));
    s.softUntil=Math.max(s.softUntil||0,level.gamedTime+seconds);
  }
  const piecePower=(s,plate)=>(s.penetrationPower??1)*(plate?.breachScale??1);
  function protectionFactor(z,s,p,power=s.penetrationPower??1){
    const recon=Math.min(s.nightmare?.12:.05,Math.max(0,Number(p._gardenReconShred)||0));
    const level=s.softUntil&&window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component;
    const soft=level&&level.gamedTime<s.softUntil?s.softRate:0;
    const fracture=typeof gardenUltimates!=='undefined'?gardenUltimates.fractureFactor(z):1;
    return (1-(1-fracture)*power)*(1-soft*power)*(1-recon*power);
  }
  // Native armor survivors use the same rider as the drawn plates.
  function penetrationPower(z){return state(z)?.penetrationPower??1;}
  function fracture(z,amount){
    const s=state(z);
    if(!s||!Number.isFinite(amount)||amount<=0)return 0;
    let left=amount,totalWear=0;
    for(const name of ['shield','door','helmet','vest']){
      const plate=s[name];
      if(!plate||plate.hp<=0)continue;
      const efficiency=piecePower(s,plate);
      const removed=Math.min(left*efficiency,plate.hp);
      plate.hp-=removed;totalWear+=removed;left-=removed/efficiency;
      if(plate.hp===0)for(const listener of listeners)listener(z,name);
      if(left<=0)break;
    }
    if(totalWear>0){s.revision++;sync(z);}
    return totalWear;
  }
  // Native direct and splash projectiles share the same damage class; annotate the new per-target packet.
  function tagShot(packet,z,shot,primary,details) {
    if(!suits.has(z)) return;
    if(primary && shot.maxTargetNumber>1)packet._gardenPiercing=true;
    packet._gardenRear = Number(shot.linearVelocity?.x)*(z.reversed?-1:1)<-.01;
    if(!primary) packet._gardenHitKind='splash';
    else if (details.chillDuration>0 || details.freezeDuration>0) packet._gardenHitKind='ice';
    else if (shot.gravity>0 && shot.damage>=40) packet._gardenHitKind='lob';
    if(details.chillDuration>0 || details.freezeDuration>0)packet._gardenCold=true;
  }
  function copyFlags(from,to) {
    if(from._gardenOverhead)to._gardenOverhead=true;
    if(from._gardenPiercing)to._gardenPiercing=true;
    if(from._gardenReconShred)to._gardenReconShred=from._gardenReconShred;
    if(from._gardenBlastBypass)to._gardenBlastBypass=from._gardenBlastBypass;
    if(from._gardenTrueDamage)to._gardenTrueDamage=true;
    if(from._gardenAshDeath)to._gardenAshDeath=true;
    if(from._gardenExplosive)to._gardenExplosive=true;
    if(from._gardenArtillery) to._gardenArtillery=true;
    if(from._gardenBlast) to._gardenBlast=from._gardenBlast;
    if(from._gardenArmorPass) to._gardenArmorPass=true;
    if(from._gardenHitKind) to._gardenHitKind=from._gardenHitKind;
    if(from._gardenRear!==undefined) to._gardenRear=from._gardenRear;
    if(from._gardenCold) to._gardenCold=true;
  }
  function route(z,packet,original) {
    if(packet?._gardenTrueDamage)return original.call(z,packet);
    if(typeof gardenChallengeTroopers!=='undefined' && gardenChallengeTroopers.blocked(z,packet))return z.health;
    const s=state(z);
    if (!s || z.displayed || z.invincible || z.fallingInSky || z.blew || !packet ||
        !(packet.damage>0) || !Number.isFinite(packet.damage) || packet._gardenArmorPass || resolving.has(z))
      return original.call(z,packet);
    if (!(s.shield?.hp>0 || s.door?.hp>0 || s.helmet.hp>0 || s.vest.hp>0)) return original.call(z,packet);
    if(typeof gardenTitan!=='undefined' && gardenTitan.is(z))return gardenTitan.absorb(z,s,packet,original);
    const incoming=packet.damage;
    const fracture=protectionFactor(z,s,packet);
    const power=s.penetrationPower??1;
    const suitPower=piecePower(s,s.vest);
    const suitFracture=suitPower===power?fracture:protectionFactor(z,s,packet,suitPower);
    const blastBypass=Math.min(1,Math.max(0,packet._gardenBlastBypass||0));
    const blastFactor=p=>(packet._gardenHitKind==='air-fortress'?1-.5*p:1)*(1-blastBypass*p);
    const blastProtection=blastFactor(power);
    const rotaryAP=packet._gardenHitKind==='rotary-ap';
    const electric=packet._gardenHitKind==='electric' || packet.damageType===2;
    const piercing=packet._gardenHitKind==='pierce' || packet.armorProtection===false || packet.damageType===4;
    const blastOrigin=typeof gardenChallengeTroopers!=='undefined'?gardenChallengeTroopers.originX?.():undefined;
    const splash=packet._gardenExplosive || packet._gardenHitKind==='splash' || packet.damageType===3 ||
      !!packet._gardenBlast || Number.isFinite(blastOrigin);
    const lob=packet._gardenHitKind==='lob';
    const sourceX=packet._gardenBlast?.x??blastOrigin;
    const dx=Number(packet.damageDirection?.x)||0,face=z.reversed?-1:1;
    const rear=!packet._gardenOverhead&&(packet._gardenRear??(Number.isFinite(sourceX)?(z.worldPositionX-sourceX)*face<-.01:dx?dx*face<-.01:!!z.reversed));
    const brittle=packet._gardenHitKind==='ice' || packet._gardenCold || z.freeze>0 || z.chill>0;
    const wear=brittle?1+.8*power:1;
    let remaining=incoming;
    const broken=[];
    function drain(name,points) {
      const armor=s[name];
      if(!armor || armor.hp<=0 || points<=0) return;
      armor.hp=Math.max(0,armor.hp-points);
      if(armor.hp<1e-6){armor.hp=0;broken.push(name);}
    }
    function intercept(name,rate,explosive=false) {
      const armor=s[name];
      if(!armor || armor.hp<=0 || rate<=0) return;
      const abrasion=wear*(explosive?.65:1);
      const reduction=explosive?armor.blastReduction*blastFactor(suitPower):armor.reduction;
      const blocked=Math.min(remaining*reduction*rate*(name==='door'?fracture:suitFracture),armor.hp/abrasion);
      remaining-=blocked;
      drain(name,blocked*abrasion);
    }
    let leakage=0;
    if(s.shield?.hp>0 && !rear && !packet._gardenArtillery){
      // Incoming damage beyond the plate's remaining capacity continues to the suit.
      const armorRatio=s.shield.reduction;
      const apRatio=armorRatio-(armorRatio-(s.elite?.52:.40))*power;
      const ratio=(splash?s.shield.blastReduction*blastProtection:rotaryAP?apRatio:armorRatio)*fracture;
      const abrasion=splash?(s.elite?.18:.25):rotaryAP?1+5*power:1;
      const handled=Math.min(incoming,s.shield.hp/(ratio*abrasion)),absorbed=handled*ratio;
      drain('shield',absorbed*abrasion);leakage=handled-absorbed;remaining=incoming-handled;
    }
    if (electric) drain('door',remaining*.4*wear*power);
    if(!rear&&!splash&&!lob)intercept('door',piercing||electric?1-power:1);
    intercept('helmet',splash?1:rotaryAP?1-.96*suitPower:piercing||electric?1-.65*suitPower:1,splash);
    intercept('vest',splash?1:rotaryAP?1-.94*suitPower:piercing||electric?1-.55*suitPower:1,splash);
    if(rotaryAP){drain('helmet',remaining*.80*suitPower);drain('vest',remaining*.90*suitPower);drain('door',remaining*.95*power);}
    remaining+=leakage;
    const next=Object.assign(Object.create(Object.getPrototypeOf(packet)),packet,{_damage:remaining,_gardenArmorPass:true});
    s.revision++;
    resolving.add(z);
    try {
      if (broken.length) {
        const seconds=broken.includes('shield') ? .85 : broken.includes('door') ? .75 : broken.includes('vest') ? .38 : .25;
        const level=window.System.get('chunks:///_virtual/levelController.ts').LevelPlay.component;
        s.staggerEnds=level.gamedTime+seconds;
        if(z.node?.activeInHierarchy && z.isAlive())z.setStun(seconds);
        for(const name of broken)for(const listener of listeners)listener(z,name);
      }
      sync(z);
      return original.call(z,next);
    } finally {resolving.delete(z);}
  }
  return Object.freeze({profiles,state,repairVest,suppress,fracture,penetrationPower,piecePower,protectionFactor,create,ready,release,maxHealth,tagShot,copyFlags,route,processing:z=>resolving.has(z),
    subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}});
})();
