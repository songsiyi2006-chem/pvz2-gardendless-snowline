// Simulation belongs to the plant that created a hit or pickup. Plant stats may
// outlive the body (gold tiles, enlightened zombies, and other delayed producers).
const gardenPlantSimulation=(()=>{
  const owners=new WeakMap(),origins=new WeakMap(),alliedClasses=new WeakMap();
  function remember(stats,code){if(stats&&code)owners.set(stats,code);return stats;}
  function owner(body,fallback){
    return typeof body==='string'?body:body?._gardenSimulationId||body?.Plant_Type||
      (body?._gardenCombatStats&&owners.get(body._gardenCombatStats))||fallback;
  }
  function factor(source){
    const id=owner(source);if(!id||typeof gardenChallenge==='undefined'||!gardenChallenge.simulation)return 1;
    const canonical=(typeof forms!=='undefined'&&forms.get(id))||id;
    return Math.min(5,Math.max(1,Number(gardenChallenge.simulation(canonical))||1));
  }
  function reset(body,code){
    body._gardenSimulationId=null;body._gardenSimulationHP=factor(code);
    origins.set(body,{code});remember(body._gardenCombatStats,code);
  }
  function inherit(body,source){
    const code=owner(source);if(!body||!code)return body;
    if(body._gardenCombatStats){
      const next=factor(code);
      gardenCombatStats.rescaleVitality(body,next/(body._gardenSimulationHP||1));
      body._gardenSimulationHP=next;
    }
    body._gardenSimulationId=code;const ref=origins.get(body);if(ref)ref.code=code;
    remember(body._gardenCombatStats,code);return body;
  }
  function recruit(target,code){if(target&&code)target._gardenAlliedPlantId=factor(code)>1?code:null;}
  function reuseShot(shot,source,code){
    const id=owner(source,code);
    if(shot&&id&&shot._gardenPlantShot){shot._gardenSimulationId=id;}
    else if(shot&&id){
      shot._gardenSimulationId=null;shot._gardenAlliedPlantId=factor(id)>1?id:null;shot._gardenAlliedShot=!!shot._gardenAlliedPlantId;
    }
    return shot;
  }
  function alliedClass(Base,source){
    const code=source?._gardenAlliedPlantId;if(!code||!(source.hypnotized||source._gardenAlliedShot))return Base;
    let table=alliedClasses.get(Base);if(!table){table=new Map();alliedClasses.set(Base,table);}
    if(!table.has(code))table.set(code,class extends Base{constructor(...args){super(...args);this._gardenAlliedSource=code;}});
    return table.get(code);
  }
  return Object.freeze({owner,factor,remember,reset,inherit,recruit,alliedClass,reuseShot,capture:body=>origins.get(body)});
})();
