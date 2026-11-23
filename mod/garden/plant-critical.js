// Only packets tagged at a plant launch, skill or native plant damage site may roll.
// A fresh result per native impact lets shared splash packets roll independently.
const gardenPlantCritical=(()=>{
  const classes=new WeakMap();let plantCall=false;
  const recon=()=>typeof gardenAirWing!=='undefined'&&!!gardenAirWing.recon();
  const noAura=Object.freeze({count:0,damage:1,critBonus:0,shred:0});
  const aura=()=>typeof gardenAirWing!=='undefined'&&gardenAirWing.plantAura?gardenAirWing.plantAura():noAura;
  function sourceClass(Base,code){
    if(typeof code!=='string')code=undefined;
    let group=classes.get(Base);if(!group){group=new Map();classes.set(Base,group);}
    if(!group.has(code))group.set(code,class extends Base{constructor(...args){super(...args);mark(this,code);}});
    return group.get(code);
  }
  function copy(a,b){
    if(a._gardenPlantDamage)b._gardenPlantDamage=true;
    if(a._gardenSimulationId)b._gardenSimulationId=a._gardenSimulationId;
    if(a._gardenAlliedSource)b._gardenAlliedSource=a._gardenAlliedSource;
    if(a._gardenCritResolved)b._gardenCritResolved=true;
    if(a._gardenCrit)b._gardenCrit=true;
    if(a._gardenReconShred)b._gardenReconShred=a._gardenReconShred;
  }
  function mark(p,code){p._gardenPlantDamage=true;if(typeof code==='string')p._gardenSimulationId=code;return p;}
  const simulation=code=>typeof gardenPlantSimulation==='undefined'?1:gardenPlantSimulation.factor(code);
  function resolve(victim,packet){
    if(!packet||!(packet._gardenPlantDamage||packet._gardenAlliedSource)||packet._gardenCritResolved||victim.hypnotized||!(packet.damage>0))return packet;
    if(!packet._gardenPlantDamage){
      const factor=simulation(packet._gardenAlliedSource);
      return factor===1?packet:Object.assign(Object.create(Object.getPrototypeOf(packet)),packet,{_damage:packet.damage*factor,_gardenCritResolved:true});
    }
    const talent=typeof gardenTalents!=='undefined'?gardenTalents.bonuses():null,wing=aura();
    const crit=Math.random()<(recon() ? .17 : .05)+(talent?.crit??0);
    const applied=Object.assign(Object.create(Object.getPrototypeOf(packet)),packet,{_gardenCritResolved:true});
    const critical=crit?(typeof gardenCriticalMultiplier==='function'?gardenCriticalMultiplier(gardenEconomy.trainingCount(),talent):1.5+(talent?.critPower??0)):1;
    const factor=simulation(packet._gardenSimulationId||packet._gardenAlliedSource)*(talent?.impact??1)*wing.damage*(crit?critical+wing.critBonus:1);
    if(wing.shred>0)applied._gardenReconShred=wing.shred;
    if(factor!==1)applied._damage=packet.damage*factor;
    if(crit)applied._gardenCrit=true;
    return applied;
  }
  function shared(target,method,...args){
    return sharedFrom(true,target,method,...args);
  }
  function sharedFrom(code,target,method,...args){
    const old=plantCall;plantCall=code||true;
    try{return target[method](...args);}finally{plantCall=old;}
  }
  function poison(z,source,args){
    const factor=typeof source==='string'&&!z.hypnotized?simulation(source):1;
    if(factor!==1)args=[args[0]*factor,...args.slice(1)];
    z.setPoison(...args);
    if(z.poison&&source)z.poison._gardenPlantDamage=true;
  }
  function plantPoison(z,...args){poison(z,true,args);}
  function poisonFrom(code,z,...args){poison(z,code||true,args);}
  function poisonPacket(p,poison){return poison?._gardenPlantDamage?mark(p):p;}
  function stackedPoison(value,plant){return plant?Object.assign(Object.create(Object.getPrototypeOf(value)),value,{_gardenPlantDamage:true,DPS:value.DPS*(typeof plant==='string'?simulation(plant):1)}):value;}
  return Object.freeze({sourceClass,shotClass:(base,shot)=>shot?._gardenPlantShot?sourceClass(base,shot._gardenSimulationId):shot?._gardenAlliedShot?gardenPlantSimulation.alliedClass(base,shot):base,
    commonClass:base=>plantCall?sourceClass(base,plantCall):base,get plantCall(){return plantCall;},mark,resolve,copy,shared,sharedFrom,poison,plantPoison,poisonFrom,poisonPacket,stackedPoison,recon,aura});
})();
