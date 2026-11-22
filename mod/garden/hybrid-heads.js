// These crowns use just the animated parts of the original plant display prefab.
// No Plant component is instantiated, so the rig cannot fire an extra projectile.
const gardenHybridHeads=(()=>{
  const pending=new Map();
  // Contact is the authored frame-event position in the source clip (e.g. Lob,
  // Shoot, Produce). Plants without a contact event use the strongest attack pose.
  const profiles={
    melon:['wintermelon','Lob',20/37],gatling:['megagatling','Shoot',15/26],prism:['magnifyinggrass','Shoot0',.4],
    medic:['twinsunflower','Produce',.575],cabbage:['cabbagepult','Lob',.375],butter:['kernelpult','Lob_Butter',20/37],
    coconut:['coconutcannon','Shoot',.30],chain:['lightningreed','Attack',.45],
    bulwark:['wallnut','Rand12',.58],apple:['applemortar','Shoot',8/15]
  };
  const extra={
    gatling:/^(?:stomach|stem|neck$)/i,medic:/^(?:stem|hand)/i,
    coconut:/^(?:hand|wire)/i,chain:/^stem/i
  };
  const trim=/foot|feet|shade|shadow|^cos\d|^costume|^bottom$|^effect|^eff_|^smokeLoop|^food_(?:fireeffect|light)$|^Particle/i;
  const mod=name=>System.get('chunks:///_virtual/'+name+'.ts');
  function mask(slot){
    // CCSlot rebuilds _visible when the active display, skin or parent bone changes.
    // Its assembler tests this exact flag before submitting the slot's geometry.
    const original=Object.getOwnPropertyDescriptor(slot,'_visible'),owner=slot._armature;
    let value=slot._visible;
    const read=function(){return this._armature===owner?false:value;};
    Object.defineProperty(slot,'_visible',{configurable:true,enumerable:original?.enumerable??true,get:read,set(v){value=v;}});
    return ()=>{
      if(Object.getOwnPropertyDescriptor(slot,'_visible')?.get!==read)return;
      if(original&&'value' in original)Object.defineProperty(slot,'_visible',{...original,value});
      else{delete slot._visible;slot._visible=value;}
    };
  }
  function replaceFace(z){
    const arm=z.db?.armature(),head=arm?.getBone('head')||arm?.getBone('Head')||arm?.getBone('head_root');
    if(!head)return null;
    const onHead=b=>{for(let p=b;p;p=p.parent)if(p===head)return true;return false;};
    const declared=new Set(z.body?.headSlots||[]);
    const slots=arm.getSlots().filter(s=>declared.has(s)||onHead(s.parent)||/^POISONFACE$|_HEAD$|^(?:jaw|hair|teeth|tongue|brow|eye)[_A-Z0-9]/i.test(s.name));
    const b=bounds({getSlots:()=>slots}),m=head.globalTransformMatrix,det=m.a*m.d-m.b*m.c;
    const cx=b?(b.left+b.right)/2:m.tx-13,cy=b?(b.top+b.bottom)/2:m.ty+6;
    const dx=cx-m.tx,dy=cy-m.ty;
    const clean=slots.map(mask);
    return {head,slots,width:b?b.right-b.left:108,height:b?b.top-b.bottom:94,
      x:det?(m.d*dx-m.c*dy)/det:dx,y:det?(-m.b*dx+m.a*dy)/det:dy,angle:Math.atan2(m.b,m.a),
      release(){for(const restore of clean)restore();}};
  }
  function maskDebris(part){
    const cc=System.get(System.resolve('cc')),root=part.node;
    const sprites=[...new Set([root.getComponent(cc.Sprite),...root.getComponentsInChildren(cc.Sprite)].filter(Boolean))];
    const dbs=[...new Set([root.getComponent(cc.dragonBones.ArmatureDisplay),...root.getComponentsInChildren(cc.dragonBones.ArmatureDisplay)].filter(Boolean))];
    const clean=dbs.flatMap(db=>(db.armature()?.getSlots()||[]).map(mask));
    for(const s of sprites){const enabled=s.enabled;s.enabled=false;clean.push(()=>{if(s.isValid)s.enabled=enabled;});}
    return {anchor:dbs[0]?.node||sprites[0]?.node||part.body?.node||part.body||root,
      release(){for(const restore of clean)restore();}};
  }
  async function source(plant){
    const plants=mod('Plants').plants,feature=plants.getPlantEnumWithPropByPlantTypes(plant);
    const path='plants/'+(feature.spf?.RES?.Disabled||plants.getPlantFeature(feature.id).RES.Disabled)+'DIS';
    if(typeof gardenHybridShots!=='undefined'&&gardenHybridShots.loadPlant)return gardenHybridShots.loadPlant(path);
    if(!pending.has(path)){
      const cc=System.get(System.resolve('cc'));
      const load=new Promise((ok,fail)=>cc.resources.load(path,cc.Prefab,(err,p)=>err?fail(err):ok(p)));
      pending.set(path,load);load.then(()=>pending.delete(path),()=>pending.delete(path));
    }
    return pending.get(path);
  }
  function bounds(arm){
    // The Cocos DragonBones renderer stores each vertex as local X,Y,U,V.
    // Fit the remaining visible textures after removing roots and feet.
    let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
    for(const slot of arm.getSlots()){
      const m=slot._matrix,vs=slot._localVertices;
      if(!slot._visible||!slot._displayData||!slot._indices?.length||!m||!vs)continue;
      for(let i=0;i<vs.length;i+=4){
        const x=m.m00*vs[i]+m.m04*vs[i+1]+m.m12,y=m.m01*vs[i]+m.m05*vs[i+1]+m.m13;
        left=Math.min(left,x);right=Math.max(right,x);bottom=Math.min(bottom,y);top=Math.max(top,y);
      }
    }
    return right>left&&top>bottom?{left,right,bottom,top}:null;
  }
  function attach({kind,plant,parent,width,height}){
    const spec=profiles[kind];if(!spec||!parent?.isValid)return null;
    const cc=System.get(System.resolve('cc'));
    const start=kind==='bulwark'?.36:0;
    let node,db,arm,state,clip,idle='Idle',position=0,duration=1,age=0,period=1,contact=spec[2],phase='idle',disposed=false,last;
    function play(name,pos){
      const data=arm?.animation.animations[name];if(!data)return false;
      clip=name;duration=Math.max(.03,data.duration);position=pos;
      state=arm.animation.gotoAndStopByTime(name,Math.min(duration-.001,duration*pos));
      arm.advanceTime(0);return !!state;
    }
    function sample(p){
      // DragonBones returns old states to its pool during skin refresh or
      // pre-destroy. A formerly stopped state can have no action timeline.
      if(!state?._actionTimeline||state._armature!==arm){play(clip,p);return;}
      position=p;state.currentTime=Math.min(duration-.001,Math.max(0,duration*p));arm.advanceTime(0);
    }
    function rest(){
      phase='idle';age=0;play(idle,0);
    }
    function cue(event){
      if(disposed)return;
      if(!node?.isValid||!db?.isValid||!arm?.armatureData||db.armature()!==arm){last=event;return;}
      const type=event.type;
      if(type==='cancel'||type==='remove'){rest();return;}
      if(type==='windup'||(type==='prime'&&phase==='idle')){
        phase='windup';age=0;period=Math.max(.12,event.duration||1);contact=spec[2];play(spec[1],start);return;
      }
      if(!['shot','launch','impact','drain'].includes(type))return;
      // A lobber already recoils on launch. Its distant impact must not cause
      // the head to reload or kick a second time.
      if(type==='impact'&&!(event.index>0)&&phase!=='windup')return;
      if(type==='drain'&&kind==='prism'){
        phase='hold';play('Shoot0',contact);return;
      }
      const action=kind==='stomp'?'FallR':kind==='prism'?'Shoot1':spec[1];
      const frame=kind==='stomp'?3/14:kind==='gatling'?Math.min(19,15+((Math.max(1,event.index||1)-1)%5))/26:contact;
      play(action,frame);phase=kind==='cherry'?'settle':'release';age=0;
    }
    function tick(dt){
      if(!ready||disposed||!(dt>0)||!node?.activeInHierarchy||!db?.isValid||!arm?.armatureData||db.armature()!==arm)return;
      if(phase==='windup'){
        age+=dt;sample(start+Math.min(1,age/period)*(contact-start));return;
      }
      if(phase==='release'){
        const next=position+dt/(kind==='bulwark'?1.18:duration);
        if(next>=1){rest();return;}sample(next);return;
      }
      if(phase==='settle'){
        const next=position-dt/.48;
        if(next<=0){rest();return;}sample(next);return;
      }
      if(phase==='idle')sample((position+dt/duration)%1);
    }
    let ready=false;
    source(plant||spec[0]).then(prefab=>{
      if(disposed||!parent.isValid)return;
      const cls=cc.dragonBones.ArmatureDisplay,src=prefab.data.getComponent(cls)||prefab.data.getComponentInChildren(cls);
      if(!src?.dragonAsset||!src.dragonAtlasAsset)return;
      node=new cc.Node('GardenNativePlantHead');node.layer=parent.layer;node.setParent(parent);
      db=node.addComponent(cls);db.dragonAsset=src.dragonAsset;db.dragonAtlasAsset=src.dragonAtlasAsset;db.armatureName=src.armatureName;db.timeScale=0;
      arm=db.armature();if(!arm)throw Error('Missing plant armature');
      // Only this fresh armature loses its slots. The shared DragonBones data,
      // plant prefab, textures and real plants elsewhere in the level stay intact.
      for(const slot of arm.getSlots())if(trim.test(slot.name)||extra[kind]?.test(slot.name)){
        slot.displayList=[];slot.displayIndex=-1;
      }
      idle=arm.animation.animationNames.includes('Idle')?'Idle':'Idle1';rest();
      const b=bounds(arm);if(!b)throw Error('Empty plant crown');
      const scale=Math.min(width*.76/(b.right-b.left),height*.71/(b.top-b.bottom));
      node.setScale(-scale,scale,1);node.setPosition((b.left+b.right)*scale/2,height*.055-(b.bottom+b.top)*scale/2,0);
      ready=true;if(last){cue(last);last=null;}
    }).catch(error=>{
      arm=null;if(node?.isValid)node.destroy();if(!disposed)console.warn('[Garden] plant head '+kind,error);
    });
    return {get ready(){return ready;},cue,tick,dispose(){disposed=true;ready=false;last=null;arm=null;if(node?.isValid)node.destroy();}};
  }
  return Object.freeze({attach,replaceFace,maskDebris});
})();
