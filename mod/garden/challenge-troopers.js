const gardenChallengeTroopers=(()=>{
  const entries=Object.freeze([
    {kind:'grenadier',name:'掷弹僵尸',toughness:290},
    {kind:'sprayer',name:'冲锋枪僵尸',toughness:260},
    {kind:'shieldguard',name:'重型盾卫僵尸',toughness:1600},
    {kind:'eliteguard',name:'曜纹精英盾卫',toughness:2600},
  ]);
  function within(p,z,squares){
    const width=window.System.get('chunks:///_virtual/Square.ts').Square.SquareWidth;
    return z.worldPositionX-p.worldPositionX<=width*squares;
  }
  function cycle(z,r,dt,api){
    if(r.kind==='shieldguard'||r.kind==='eliteguard')return;
    if(r.phase==='idle'||r.phase==='recovery'){
      if(r.cooldown>0)return;
      const grenade=r.kind==='grenadier';
      const p=api.targets(z,grenade?1:0).find(plant=>within(plant,z,grenade?6:2.8));
      if(!p){r.cooldown=.28;return;}
      r.cycles++;api.phase(r,'windup',grenade?1.25:.83,p,{index:0});
      api.emit('windup',r,{radius:grenade?1:0});return;
    }
    if(r.left>0)return;
    if(r.kind==='grenadier'){
      if(r.phase==='windup'){
        const aim={...r.aim};
        api.phase(r,'flight',.95,null,{aim});api.emit('launch',r,{radius:1});return;
      }
      if(r.phase==='flight'){
        const aim=r.aim;
        api.phase(r,'fuse',.9,null,{aim});api.emit('land',r,{radius:1});return;
      }
      const seen=new Set(),affected=[];
      for(const p of api.allPlants()){
        const {r:row,c}=api.cell(p),d=Math.abs(row-r.aim.r)+Math.abs(c-r.aim.c),k=row*16+c;
        if(d>1||seen.has(k))continue;
        seen.add(k);affected.push(p);api.hit(p,d?24:54);
      }
      api.emit('impact',r,{affected,center:r.aim,radius:1});api.recover(r,8);
      return;
    }
    const p=api.targets(z,0).find(plant=>within(plant,z,2.8));
    if(!p){api.emit('cancel',r,{reason:'out of range'});api.recover(r,2);return;}
    const index=r.index+1;
    api.phase(r,'burst',.20,p,{index});api.hit(p,8);api.emit('shot',r);
    if(index===3)api.recover(r,6.1);
  }
  const get=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  let currentBlast=null;
  function guards(){
    if(!gardenChallenge.active())return [];
    const result=[];
    for(const z of get('CharacterManager').ZombiePool.pool()){
      if(!z.node?.activeInHierarchy||!z.isAlive()||!z.isInLawn()||!(gardenChallengeArmor.state(z)?.shield?.hp>0))continue;
      result.push({z,x:z.worldPositionX,row:z.lIndex,sign:z.reversed?-1:1,elite:gardenChallengeArmor.state(z).elite});
    }
    return result;
  }
  function closest(items,row,from,to){
    const sign=Math.sign(to-from);
    let near=null,dist=Infinity;
    for(const g of items){
      if(g.row!==row||g.sign!==sign)continue;
      const d=(g.x-from)*sign;
      if(d>=-.01&&d<=Math.abs(to-from)+.01&&d<dist){near=g.z;dist=d;}
    }
    return near;
  }
  function firstShield(row,from,to,items){return closest(items||guards(),row,from,to);}
  function snapshot(source,damage){
    if(!gardenChallenge.active())return null;
    const x=source?.worldPositionX??source?.node?.worldPosition?.x;
    if(!Number.isFinite(x))return null;
    const items=guards();return items.length?{x,damage,items}:null;
  }
  function blast(source,native,args){
    const previous=currentBlast;
    const base=Number(args[0])||source.objdataOwn?.Damage||source.objdataOwn?.ExplodeDamage||1800;
    currentBlast=snapshot(source,base);
    try{return native.apply(source,args);}finally{currentBlast=previous;}
  }
  function blocked(z,packet){
    const b=packet?._gardenBlast||currentBlast;
    if(!b||packet?._gardenArtillery||z.hypnotized||!z._gardenChallengeHostile)return false;
    const guard=closest(b.items,z.lIndex,b.x,z.worldPositionX);
    if(guard&&guard!==z)return true;
    const width=get('Square').Square.SquareWidth;
    return b.items.some(g=>g.elite&&g.z!==z&&Math.abs(g.row-z.lIndex)===1&&
      (g.x-b.x)*g.sign>=0&&(z.worldPositionX-g.x)*g.sign>.01&&(z.worldPositionX-g.x)*g.sign<=2*width);
  }
  function direct(z){
    if(!currentBlast||!z._gardenChallengeHostile||z.hypnotized||gardenChallengeArmor.processing(z))return false;
    if(blocked(z,null))return true;
    if(z.dead||!(z.health>0)||!(gardenChallengeArmor.state(z)?.shield?.hp>0))return false;
    const {ZombieDamageDetails,ZombieDamageType}=get('CharacterManager');
    const packet=new ZombieDamageDetails(currentBlast.damage,false,false,false,null,ZombieDamageType.fire,true,true);
    packet._gardenExplosive=true;
    z.dealDamage(packet);return true;
  }
  return Object.freeze({entries,cycle,firstShield,snapshot,blast,blocked,direct,originX:()=>currentBlast?.x,cancel(){}});
})();
