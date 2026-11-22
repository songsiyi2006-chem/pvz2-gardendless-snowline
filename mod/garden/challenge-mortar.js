const gardenChallengeMortar=(()=>{
  const entries=Object.freeze([{kind:'mortar',name:'迫击炮僵尸',toughness:420,
    description:'第二面旗起成组进场，最多两门同时在场。炮手瞄准主力输出，标记落点 1.8 秒后发射，装填 3.2 秒。七株远征的中心伤害为 450，上下左右各 195；自选增援分别为 900 和 390。蓄力时冻结、眩晕、击退或打掉 12% 本体生命可打断。弹体离手后落点固定，可移走植物，也可用拦截装备击落或偏转。'}]);
  const plants=s=>new Set(s.split(' '));
  const producers=plants('sunflower primalsunflower twinsunflower sunshroom moonflower marigold goldleaf goldbloom solarsage shinevine sunbean solartomato enlightenmint');
  const guards=plants('wallnut tallnut primalwallnut holonut mirrornut pumpkin chardguard sweetpotato garlic hotdate gumnut murkadamia');
  const support=plants('iceburg gravebuster blover springbean umbrellaleaf torchwood powerlily hurrikale stallia magnetshroom escaperoot plantern buttercup hotpotato intensivecarrot thymewarp shrinkingviolet perfumeshroom icebloom aloe lilypad floawerpot hollyknight potatomine primalpotatomine jalapeno cherry_bomb atombomb_seedling doomshroom grapeshot hypnoshroom stunion tanglekelp cranjelly squash imitater');
  const artillery=plants('megagatling wintermelon coconutcannon applemortar missiletoe banana citron laser_bean meteorflower electricpeashooter gatling peacommando magnifyinggrass bambooshoot melonpult darkmatterdragonfruit');
  const squads=new WeakMap();
  let nextId=0;
  function assess(p){
    const type=String(p.Plant_Type||'').replace(/^RTID\(([^@]+).*$/i,'$1').toLowerCase();
    const role=guards.has(type)?'guard':producers.has(type)?'economy':support.has(type)||type.endsWith('mint')?'support':'output';
    const n=p.objdataOwn||{},rank=Math.max(0,Math.min(6,Number(p._gardenCombatRank)||0));
    const volley=Math.max(1,Math.min(5,Number(n.PeaCount??n.ProjectilesPerShot)||1));
    const amount=Math.max(0,Number(n.Damage??n.ProjectileDamage??n.AttackDamage)||0);
    const interval=n.ShootInterval??n.AttackInterval??n.ThrowInterval??n.DamageInterval;
    const cadence=Math.max(.3,Number(interval?.Min??interval)||1.5);
    const threat=Math.min(60,9*Math.log2(1+amount*volley/cadence/8));
    const score=({guard:10,economy:55,support:90,output:220})[role]+(artillery.has(type)?42:0)+9*rank+threat;
    return {type,role,score};
  }
  function choose(z,api){
    let best=null;
    for(const p of api.allPlants()){
      const loc=api.cell(p),a=assess(p);
      const tie=Math.abs(loc.r-z.lIndex)*.06+loc.c*.016;
      if(!best||a.score-tie>best.value)best={p,loc,...a,value:a.score-tie};
    }
    return best;
  }
  function session(level){
    let s=squads.get(level);
    if(!s){s={shells:new Set()};squads.set(level,s);}
    return s;
  }
  function art(){return typeof gardenMortarArt==='undefined'?null:gardenMortarArt;}
  function interceptors(){return typeof gardenInterceptors==='undefined'?null:gardenInterceptors;}
  function cycle(z,r,dt,api){
    if(r.phase==='windup'){
      if(z.health<=r.mortarHp-z.toughness*.12){
        art()?.cancel(z);api.emit('cancel',r,{reason:'suppressed'});api.recover(r,2.4);return;
      }
      if(r.left>1e-7)return;
      const origin=api.cell(z),target={...r.aim},distance=Math.hypot(origin.c-target.c,origin.r-target.r);
      const shell={id:++nextId,source:z,origin,target,priority:r.mortarRole==='output',targetType:r.mortarType,
        elapsed:0,duration:1.42+Math.min(9,distance)*.083,progress:0,position:{...origin,height:.7},arcHeight:1.7+distance*.095};
      session(api.level).shells.add(shell);interceptors()?.track(api.level,shell);
      art()?.launch(z,shell);api.emit('launch',r,{shell});api.recover(r,3.2);return;
    }
    if(r.cooldown>0)return;
    const picked=choose(z,api);
    if(!picked){r.cooldown=.45;return;}
    r.cycles++;r.mortarHp=z.health;r.mortarRole=picked.role;r.mortarType=picked.type;
    api.phase(r,'windup',1.8,picked.p);
    art()?.warn(z,r.aim);api.emit('windup',r,{role:picked.role,priority:picked.role==='output'});
  }
  function position(shell,t){
    const to=shell.target,from=shell.origin;
    if(t>=1){shell.position={r:to.r,c:to.c,height:0};return;}
    // If a decoy changes the target in flight, keep this frame's position and
    // ease the remaining travel onto the new tile without a sideways jump.
    const previous=shell.segment;
    if(previous&&(previous.to.r!==to.r||previous.to.c!==to.c)){
      shell.segment={at:shell.progress,from:{r:shell.position.r,c:shell.position.c},to:{...to}};
    }else if(!previous)shell.segment={at:0,from:{...from},to:{...to}};
    const s=shell.segment,u=Math.max(0,Math.min(1,(t-s.at)/Math.max(.001,1-s.at)));
    shell.position={r:s.from.r+(to.r-s.from.r)*u,c:s.from.c+(to.c-s.from.c)*u,
      height:.7*(1-t)+shell.arcHeight*4*t*(1-t)};
  }
  function tick(level,dt,api){
    const s=squads.get(level);if(!s||!(dt>0))return;
    for(const shell of s.shells){
      shell.elapsed+=dt;const t=Math.min(1,shell.elapsed/shell.duration);
      const before=shell.target,oldR=before.r,oldC=before.c;
      position(shell,t);shell.progress=t;
      if(interceptors()?.step(level,shell,t)===true){s.shells.delete(shell);art()?.end(shell,'intercept');continue;}
      if(shell.target.r!==oldR||shell.target.c!==oldC)position(shell,t);
      if(t<1){art()?.flight(shell);continue;}
      s.shells.delete(shell);art()?.end(shell,'impact');
      for(const p of api.allPlants()){
        const at=api.cell(p),d=Math.abs(at.r-shell.target.r)+Math.abs(at.c-shell.target.c);
        if(d<=1)api.hit(p,d===0?150:65);
      }
    }
  }
  function cancel(z){art()?.cancel(z);}
  return Object.freeze({entries,cycle,tick,cancel,assess});
})();
