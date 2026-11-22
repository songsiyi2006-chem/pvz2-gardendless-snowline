// Capture each row before applying an entire laser volley. A shield destroyed
// by that volley still absorbs its ray; the next volley takes a fresh reading.
const gardenLaserShield=(()=>{
  const xof=z=>z?.worldPositionX??z?.worldPosition?.x??z?.node?.worldPosition?.x;
  function capture(plant,rows){
    if(typeof gardenChallengeTroopers==='undefined'||typeof gardenChallengeTroopers.firstShield!=='function'||
      typeof gardenChallenge!=='undefined'&&!gardenChallenge.active())return null;
    const x=plant.beamPoint?.worldPosition?.x??xof(plant);if(!Number.isFinite(x))return null;
    const map=new Map();
    const items=rows.length>1&&gardenChallengeTroopers.snapshot?gardenChallengeTroopers.snapshot(plant,0)?.items||[]:undefined;
    for(const r of rows){
      const shield=gardenChallengeTroopers.firstShield(r,x,x+100000,items),edge=xof(shield);
      if(shield&&Number.isFinite(edge))map.set(r,{shield,x:edge,face:typeof gardenHybridArt!=='undefined'?gardenHybridArt.shieldFace?.(shield)??edge:edge});
    }
    return map.size?map:null;
  }
  function all(plant){
    if(typeof gardenChallenge==='undefined'||!gardenChallenge.active())return null;
    const board=window.System.get('chunks:///_virtual/Square.ts').Square;
    return capture(plant,Array.from({length:board.LaneCount},(_,r)=>r));
  }
  function allows(map,target,r){
    if(!map)return true;
    const wall=map.get(r??target?.lIndex??target?.inLnC?.lIndex);if(!wall||target===wall.shield)return true;
    const x=xof(target);return !Number.isFinite(x)||x<=wall.x+.001;
  }
  function draw(plant,r,map){
    const cut=(map===undefined?capture(plant,[r]):map)?.get(r);if(!cut)return false;
    if(typeof gardenFxSettings!=='undefined'&&!gardenFxSettings.enabled)return true;
    const cc=window.System.get(window.System.resolve('cc')),sq=window.System.get('chunks:///_virtual/Square.ts').Square;
    const cell=sq.getLnC(r,plant.cIndex),home=plant.plantInLnC,base=plant.beamPoint?.worldPosition,parent=cell?.inLane?.prjLayer;
    if(!home?.plantPoint||!base||!parent?.isValid)return true;
    const y=base.y+cell.plantPoint.worldPosition.y-home.plantPoint.worldPosition.y;
    const start=parent.inverseTransformPoint(new cc.Vec3(),new cc.Vec3(base.x,y,0));
    const end=parent.inverseTransformPoint(new cc.Vec3(),new cc.Vec3(Math.max(base.x,cut.face),y,0));
    const length=Math.hypot(end.x-start.x,end.y-start.y);if(length<.1)return true;
    const n=new cc.Node('GardenLaser/ShieldStop');n.setParent(parent);n.layer=parent.layer;n.setPosition(start.x,start.y,0);
    n.angle=Math.atan2(end.y-start.y,end.x-start.x)*180/Math.PI;
    const g=n.addComponent(cc.Graphics),color=(r,g,b,a=255)=>new cc.Color(r,g,b,a);
    for(const [width,fill] of [[10,color(144,225,120,48)],[5.6,color(189,247,126,180)],[2.1,color(255,255,218)]]){
      g.strokeColor=fill;g.lineWidth=width;g.moveTo(0,0);g.lineTo(length,0);g.stroke();
    }
    // All flares point back along the ray and stay on the attacking side.
    for(const [dx,dy] of [[-9,8],[-13,3],[-10,-6],[-5,-9]]){
      g.strokeColor=color(245,251,166,218);g.lineWidth=1.5;g.moveTo(length-.7,0);g.lineTo(Math.max(0,length+dx),dy);g.stroke();
    }
    const fade=n.addComponent(cc.UIOpacity);cc.tween(fade).to(.18,{opacity:0}).call(()=>{if(n.isValid)n.destroy();}).start();
    return true;
  }
  function foodVisibility(plant,hidden){
    if(hidden&&!plant._gardenHiddenFoodSlots){
      const slots=plant.anmControl?.db?.armature()?.getSlots?.().filter(s=>s.childArmature&&s.name.includes('_FS'))||[];
      plant._gardenHiddenFoodSlots=slots.map(s=>[s,s.visible]);for(const [s] of plant._gardenHiddenFoodSlots)s.visible=false;
    }else if(!hidden&&plant._gardenHiddenFoodSlots){
      for(const [s,was] of plant._gardenHiddenFoodSlots)s.visible=was!==false;plant._gardenHiddenFoodSlots=null;
    }
  }
  return {capture,all,allows,draw,foodVisibility};
})();
