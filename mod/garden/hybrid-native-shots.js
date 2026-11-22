// Draw the original plant's projectile armature, particle or attack pose without instantiating
// commonShot, plant, pickup or collision controllers. The caller owns its flight and simulation clock.
const gardenHybridShots=(()=>{
  const prefabCache=new Map(),loading=new Map(),requests=[];
  let inFlight=0;
  const cc=()=>window.System.get(window.System.resolve('cc'));
  const module=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  const read=(path,field=null,clip=null)=>({path,field,clip});
  const plant=(name,field,clip)=>read('plants/'+name+'PLANT',field,clip);
  const projectile=name=>read('projectiles/'+name+'PRJ');
  const impact=name=>read('projectiles/'+name+'PRJ','PopParticle');
  const p=name=>({projectile:projectile(name),impact:impact(name)});
  const recipes={
    melon:p('MelonWinter0'),gatling:p('Pea0'),cabbage:p('Cabbage0'),butter:p('Butter0'),
    coconut:p('Coconut0'),apple:p('Apple0'),
    prism:{...p('MagGrass0'),beam:plant('MagnifyingGrass','foodRayParPrefab'),sun:read('@sun')},
    medic:{attack:plant('SunflowerTwin',null,'Produce'),impact:read('@sun')},
    chain:{beam:plant('LightningReed','shootPFB'),impact:plant('LightningReed','hitPFB')},
    bulwark:{attack:plant('Wallnut',null,'Food'),impact:plant('Wallnut',null,'Food')},
  };
  // Original particles are authored around different origins. Many use a placeholder UI rectangle.
  // These extents are the union of their visible native slot vertices across the animation.
  const particleBox={
    MelonWinter0PAR:[-152,-204,248,148],Pea0PAR:[-217,-81,35,94],MagGrassPrj0PAR:[-201,-59,121,70],
    Cabbage0PAR:[-104,-133,102,114],Butter0PAR:[-93,-45,52,126],Coconut0PAR:[-437,-262,437,706],
    Boomerang0PAR:[-116,-54,52,54],star0PAR:[-287,-127,133,117],Apple0PAR:[-180,-103,264,275],
    Thistle0PAR:[-48,-48,47,48],SnapDragonAttackPAR:[-628,-189,57,192],lightningReedShootPAR:[-1,-55,2318,55],
    MagGrassFoodRayPAR:[-7,-29,545,29],FumeShootPAR:[-44,-75,681,162],FumeHitPAR:[-108,-69,45,89],
    ChardGuardHandPAR:[-93,-44,267,245],PhatBeetWavePAR:[-242,-239,239,242],
    explosionCherryPAR:[-497,-468,476,505],IcebergLettucePLANT:[-229,-136,240,302],
  };
  function pump(){
    while(requests.length&&inFlight<2){
      const {C,path,resolve}=requests.shift();inFlight++;
      C.resources.load(path,C.Prefab,(error,prefab)=>{
        inFlight--;loading.delete(path);if(prefab)prefabCache.set(path,prefab);resolve(prefab||null);pump();
      });
    }
  }
  function loadPlant(path){
    if(prefabCache.has(path))return Promise.resolve(prefabCache.get(path));
    if(loading.has(path))return loading.get(path);
    const C=cc();if(!C?.resources)return Promise.resolve(null);
    const job=new Promise(resolve=>requests.push({C,path,resolve}));
    loading.set(path,job);pump();return job;
  }
  function warm(kinds=Object.keys(recipes)){
    const paths=new Set();
    for(const k of kinds)for(const r of Object.values(recipes[k]||{}))if(!r.path.startsWith('@'))paths.add(r.path);
    return Promise.all([...paths].map(loadPlant));
  }
  function source(r){
    if(r.path==='@sun')return module('Droppings')?.droppings?.SunMid;
    if(r.path==='@cherry')return module('Particles')?.particle?.explosion?.(true);
    const asset=prefabCache.get(r.path);
    if(!asset){loadPlant(r.path);return null;}
    if(!r.field)return asset;
    const owner=asset.data.components.find(c=>c[r.field]);
    const field=owner?.[r.field];return Array.isArray(field)?field.find(p=>p?.data):field;
  }
  function visual(prefab,C){
    if(!prefab?.data)return null;
    const root=prefab.data,DB=C.dragonBones.ArmatureDisplay;
    const arm=root.getComponent(DB)||root.getComponentsInChildren(DB).find(v=>v.node.active&&v.dragonAsset&&v.dragonAtlasAsset);
    if(arm)return {arm,node:arm.node};
    const sprite=root.getComponent(C.Sprite)||root.getComponentsInChildren(C.Sprite).find(v=>v.enabled&&v.spriteFrame);
    return sprite?{sprite,node:sprite.node}:null;
  }
  function spawn({kind,phase,parent,width,height,duration=1}){
    const r=recipes[kind]?.[phase];if(!r||!parent?.isValid)return null;
    const C=cc(),asset=source(r),v=visual(asset,C);if(!v)return null;
    const host=new C.Node('Hybrid '+kind+' '+phase),drawing=new C.Node('Native '+asset.name);
    host.layer=parent.layer;drawing.layer=parent.layer;host.parent=parent;drawing.parent=host;
    const box=v.node.getComponent(C.UITransform),w=box?.width||100,h=box?.height||100;
    const rect=particleBox[asset.name],rw=rect?rect[2]-rect[0]:w,rh=rect?rect[3]-rect[1]:h;
    const scale=width>0&&height>0?Math.min(width/rw,height/rh):width>0?width/rw:height>0?height/rh:1;
    const stretch=phase==='beam';
    const sx=stretch&&width>0?width/rw:scale,sy=stretch&&height>0?height/rh:scale;
    drawing.setScale(sx,sy,1);
    if(rect)drawing.setPosition(-.5*(rect[0]+rect[2])*sx,-.5*(rect[1]+rect[3])*sy);
    const ui=drawing.addComponent(C.UITransform);ui.setContentSize(w,h);
    if(box)ui.setAnchorPoint(box.anchorPoint);
    let update=()=>{},name=null;
    if(v.arm){
      const src=v.arm,db=drawing.addComponent(C.dragonBones.ArmatureDisplay);
      db.dragonAsset=src.dragonAsset;db.dragonAtlasAsset=src.dragonAtlasAsset;db.armatureName=src.armatureName;
      if(src.customMaterial)db.customMaterial=src.customMaterial;
      if(src.color)db.color=src.color.clone();
      const arm=db.armature(),list=arm?.animation?.animationNames||[];
      name=[r.clip,src.animationName,'Play','Idle','Idle1',list[0]].find(s=>s&&list.includes(s));
      if(name){
        const state=db.playAnimation(name,1),clip=state?.totalTime||duration;
        db.timeScale=0;
        // Native particle scripts normally destroy their owner. Sample just the armature on our own clock.
        if(state){state.stop();update=t=>{state.currentTime=Math.min(.999,Math.max(0,t))*clip;arm.advanceTime(0);};update(0);}
      }
    }else{
      const s=drawing.addComponent(C.Sprite);s.spriteFrame=v.sprite.spriteFrame;s.sizeMode=C.Sprite.SizeMode.CUSTOM;
      if(v.sprite.customMaterial)s.customMaterial=v.sprite.customMaterial;s.color=v.sprite.color.clone();
    }
    return {node:host,update,source:asset.name,clip:name,dispose(){if(host.isValid)host.destroy();}};
  }
  return Object.freeze({spawn,warm,loadPlant});
})();
