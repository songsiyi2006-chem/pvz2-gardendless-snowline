// These mechanics run only in the mod runtime. Projectile metadata lives for one pool checkout.
const gardenUltimates=(()=>{
  const ammo=['cherry','arc','violet','plasma','dart'];
  const shots=new WeakMap(), fields=new WeakMap(), fractures=new WeakMap();
  const get=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  const meter=()=>get('SunCount').SunCount.component;
  const play=()=>get('levelController').LevelPlay.component;
  const alive=z=>z?.node?.activeInHierarchy&&!z.dead&&!z.hypnotized&&!z.displayed&&z.isAlive();
  const enemies=()=>get('CharacterManager').ZombiePool.pool().filter(alive);
  let leafTarget=null;
  function feedLeaf(plant){
    const previous=leafTarget;leafTarget=plant;
    try{return plant.food();}finally{leafTarget=previous;}
  }
  function payFood(plant){
    if(plant.Plant_Type!=='megagatling')return true;
    const bank=meter();
    if(!bank||bank.CurrentValue<100&&leafTarget!==plant)return false;
    bank.SunDec(100,true,true,true);
    return true;
  }
  function autoFood(plant,stockChance){
    if(plant.Plant_Type==='megagatling')return meter()?.CurrentValue>=100&&Math.random()<.05;
    return Math.random()<=stockChance;
  }
  function price(card,amount){
    if(card.ca?.free||card._gardenFallingPacket||!Number.isFinite(amount))return amount;
    if(card.Type==='citron')return 600;
    return card.Type==='megagatling'?amount+550:amount;
  }
  // Only the normal Shoot animation dispatches this event. Keep the ordinary
  // projectile and then hand the same actor to the native Plant Food state machine.
  function citronFired(plant){
    if(plant.Plant_Type==='citron'&&plant.plantInLnC&&!plant.displayed&&!plant.AlmanacMode&&
       !plant.dead&&!plant.fooding&&plant.foodable&&Math.random()<.01)return plant.food();
    return false;
  }

  const palette={cherry:['#c72342','#ffe8a6'],arc:['#4096e0','#d8ffff'],violet:['#871daf','#ffadf8'],
    plasma:['#14b4aa','#d2ffe9'],dart:['#358367','#f5fcbd'],orb:['#6d3bac','#b9fff0']};
  let watching=false;
  const drawings=new Set();
  function canvas(parent,name){
    if(!gardenFxSettings.enabled||!parent?.isValid)return null;
    const cc=window.System.get(window.System.resolve('cc'));
    if(!watching){
      watching=true;gardenFxSettings.subscribe(on=>{if(!on)for(const node of [...drawings])if(node.isValid)node.destroy();});
    }
    const node=new cc.Node(name);node.layer=parent.layer;node.parent=parent;
    drawings.add(node);node.once(cc.Node.EventType.NODE_DESTROYED,()=>drawings.delete(node));
    const gfx=node.addComponent(cc.Graphics);
    return {cc,node,gfx,color:(hex,alpha=255)=>{const c=new cc.Color();cc.Color.fromHEX(c,hex);c.a=alpha;return c;}};
  }
  function paintCitron(shot,kind){
    if(kind!=='orb'&&drawings.size>=140)return;
    const a=canvas(shot.body||shot.node,'Snowline round · '+kind);if(!a)return;
    const {gfx:g,node,color}=a,[outer,inner]=palette[kind],size=kind==='orb'?25:8;
    g.fillColor=color(outer,225);g.strokeColor=color(inner,250);g.lineWidth=1.6;
    if(kind==='dart'){
      g.moveTo(-14,0);g.lineTo(-20,-4);g.lineTo(8,-2);g.lineTo(16,0);g.lineTo(8,2);g.lineTo(-20,4);g.close();g.fill();g.stroke();
    }else{
      g.circle(0,0,size);g.fill();g.stroke();
      g.strokeColor=color(inner,170);g.lineWidth=1.3;g.ellipse(0,0,size*1.4,size*.56);g.stroke();
      g.fillColor=color(inner,235);g.circle(size*.26,size*.28,size*.26);g.fill();
    }
    return node;
  }
  function tag(plant,shot,kind){
    if(!shot||!plant?.plantInLnC)return;
    clearShot(shot);
    const scale=plant._gardenCombatStats?.damage||1;
    const mega=plant.Plant_Type==='megagatling';
    shots.set(shot,{kind,owner:plant.Plant_Type,rankScale:scale,seen:new Set(),art:mega?null:paintCitron(shot,kind)});
    if(mega)gardenGatlingAmmo.attach(shot,kind);
  }
  function markVolley(plant,shot){
    if(plant.Plant_Type==='megagatling')tag(plant,shot,ammo[Math.floor(Math.random()*ammo.length)]);
  }
  function markCitron(plant,shot,ultimate){if(plant.Plant_Type==='citron')tag(plant,shot,ultimate?'orb':'dart');}
  function clearShot(shot){
    const old=shots.get(shot);
    if(old?.owner==='megagatling')gardenGatlingAmmo.release(shot);
    if(old?.art?.isValid)old.art.destroy();
    shots.delete(shot);
  }
  function packet(amount,owner,element=0,armor=true){
    const {ZombieDamageDetails}=get('CharacterManager');
    return gardenPlantCritical.mark(new ZombieDamageDetails(amount,armor,false,false,null,element,true,false),owner);
  }
  function nearby(row,x,radius){
    const sw=get('Square').Square.SquareWidth;
    return enemies().filter(z=>Math.hypot(z.lIndex-row,(z.worldPositionX-x)/sw)<=radius);
  }
  function markFracture(z,amount){
    const level=play();if(!level)return;
    // A simultaneous blast gets the current resistance. The fracture benefits subsequent hits.
    fractures.set(z,{level,until:level.gamedTime+5});
    const suit=gardenChallengeArmor.state(z);
    if(suit)for(const piece of ['shield','helmet','vest','door']){
      const p=suit[piece];if(p?.hp>0)p.hp=Math.max(0,p.hp-Math.min(p.max*.12,amount*.20)*gardenChallengeArmor.piecePower(suit,p));
    }
    if(suit){suit.revision++;gardenChallengeArmorArt.sync(z);}
  }
  function fractureFactor(z){
    const f=fractures.get(z);
    return f&&f.level===play()&&f.until>f.level.gamedTime ? .8 : 1;
  }
  function effect(shot,kind,x,y){
    if(kind!=='orb'&&drawings.size>=75)return;
    const a=canvas(shot.inLane?.prjLayer,'Snowline impact · '+kind);if(!a)return;
    const {cc,gfx:g,node,color}=a,[outer,inner]=palette[kind];node.worldPosition=new cc.Vec3(x,y+20,0);
    const big=kind==='orb',size=big?90:24;
    g.strokeColor=color(inner,205);g.lineWidth=big?3:1.5;g.ellipse(0,0,size*1.65,size*.4);g.stroke();
    g.strokeColor=color(outer,220);g.ellipse(0,0,size*1.3,size*.31);g.stroke();
    if(big){
      g.fillColor=color('#835cbd',180);g.moveTo(-15,0);g.bezierCurveTo(-6,30,-10,58,-33,78);
      g.bezierCurveTo(-75,78,-80,104,-53,118);g.bezierCurveTo(-42,144,0,155,30,136);
      g.bezierCurveTo(80,140,89,91,43,82);g.bezierCurveTo(11,72,5,25,16,0);g.close();g.fill();
      for(const [dx,dy,r] of [[-42,102,19],[-18,118,24],[8,120,26],[35,108,20]]){
        g.fillColor=color('#a3efe1',175);g.ellipse(dx,dy,r*1.2,r*.7);g.fill();}
      for(let i=0;i<16;i++){const t=i*Math.PI/8;g.moveTo(Math.cos(t)*69,Math.sin(t)*19);g.lineTo(Math.cos(t)*110,Math.sin(t)*37+9);g.stroke();}
      get('levelController').LevelPlay.shakeScreen(1);
    }else{
      g.fillColor=color(outer,180);
      for(let i=0;i<8;i++){
        const t=i*Math.PI/4;g.moveTo(Math.cos(t)*9,Math.sin(t)*9);g.lineTo(Math.cos(t+.14)*size,Math.sin(t+.14)*size);
        g.lineTo(Math.cos(t+.3)*12,Math.sin(t+.3)*12);g.close();g.fill();
      }
    }
    node.setScale(.45,.45,1);
    const opacity=node.addComponent(cc.UIOpacity);
    cc.tween(node).to(big?.56:.18,{scale:new cc.Vec3(big?1.7:1.2,big?1.7:1.2,1)}).start();
    cc.tween(opacity).delay(big?.29:.06).to(big?.57:.15,{opacity:0}).call(()=>{if(node.isValid)node.destroy();}).start();
  }
  function arcEffect(shot,a,b){
    if(drawings.size>=75)return;
    const art=canvas(shot.inLane?.prjLayer,'Snowline arc');if(!art)return;
    const {node,gfx:g,cc,color}=art;node.worldPosition=new cc.Vec3(a.worldPositionX,a.worldPositionY+40,0);
    const dx=b.worldPositionX-a.worldPositionX,dy=b.worldPositionY-a.worldPositionY;
    g.strokeColor=color('#c5fffd',215);g.lineWidth=2;g.moveTo(0,0);g.lineTo(dx*.37,dy*.37+7);
    g.lineTo(dx*.61,dy*.61-6);g.lineTo(dx,dy);g.stroke();
    cc.tween(node).delay(.13).call(()=>{if(node.isValid)node.destroy();}).start();
  }
  function applyBlast(shot,meta,row,x,y,amount,radius,orb){
    const snap=gardenChallengeTroopers.snapshot({worldPositionX:x-.05},amount);
    for(const z of nearby(row,x,radius)){
      const hit=packet(amount,meta.owner,orb?2:3);
      hit._gardenExplosive=true;hit._gardenBlast=snap;hit._gardenHitKind='splash';
      if(orb)hit._gardenBlastBypass=.30;
      if(gardenChallengeTroopers.blocked(z,hit))continue;
      z.dealDamage(hit);
      if(orb&&alive(z))markFracture(z,amount);
    }
    effect(shot,orb?'orb':'cherry',x,y);
  }
  function impact(shot,target){
    const m=shots.get(shot);if(!m||m.kind==='orb'||m.kind==='dart'||!target)return false;
    const amount=Math.max(1,shot.damage*(shot.damageScale||1)*(shot.havePeaBuff?1.5:1));
    const x=target.worldPositionX,y=target.worldPositionY,row=target.lIndex;
    if(m.kind==='cherry')applyBlast(shot,m,row,x,y,amount*3,1.45,false);
    else if(m.kind==='arc'){
      target.dealDamage(packet(amount*2,m.owner,2));const next=nearby(row,x,1.9).filter(z=>z!==target)
        .sort((a,b)=>Math.abs(a.worldPositionX-x)-Math.abs(b.worldPositionX-x)).slice(0,2);
      for(const z of next){z.dealDamage(packet(amount*1.4,m.owner,2));arcEffect(shot,target,z);}
    }else if(m.kind==='violet'){
      target.dealDamage(packet(amount*3.5,m.owner,1));
      for(const z of nearby(row,x,1.05))if(z!==target)z.dealDamage(packet(amount,m.owner,1));
      effect(shot,'violet',x,y);
    }else{
      target.dealDamage(packet(amount*3,m.owner,2,false));
      effect(shot,'plasma',x,y);
    }
    return true;
  }
  function residue(shot,row,x,y,amount,scale){
    const level=play();if(!level)return;
    let list=fields.get(level);if(!list){list=[];fields.set(level,list);}
    const art=canvas(shot.inLane?.prjLayer,'Snowline ion field'),sw=get('Square').Square.SquareWidth;
    if(art){
      const {node,cc,gfx:g,color}=art;node.worldPosition=new cc.Vec3(x,y+3,0);
      g.fillColor=color('#7049a4',58);g.ellipse(0,0,sw*1.9,sw*.59);g.fill();
      g.strokeColor=color('#87ffe0',170);g.lineWidth=2;g.ellipse(0,0,sw*1.8,sw*.57);g.stroke();
      for(let i=0;i<14;i++){
        const t=i*2.4,r=sw*(.3+(i%7)*.19);g.fillColor=color(i%2?'#ce9fff':'#95f4cc',145);
        g.circle(Math.sin(t)*r,Math.cos(t)*r*.34,2+i%3);g.fill();
      }
    }
    list.push({row,x,amount,scale,remaining:6,at:level.gamedTime+1,art:art?.node});
  }
  function detonate(shot,m,target){
    if(m.detonated)return;
    m.detonated=true;
    const x=target?.worldPositionX??shot.worldPositionX,y=shot.inLane.floorY,row=shot.inLane.LaneIndex;
    const amount=Math.max(4200*m.rankScale,shot.damage*2.4);
    applyBlast(shot,m,row,x,y,amount,3.3,true);
    residue(shot,row,x,y,amount*.025,gardenPlantSimulation.factor('citron'));
    shot.pop();
  }
  function specialFlight(shot){
    const m=shots.get(shot);if(!m||!['dart','orb'].includes(m.kind))return false;
    if(!shot.inLane||shot.dead||shot.popWaiting||!shot.detectEnemyOn)return true;
    const rect=shot.bodyRec(),zombies=shot.inLane.zombiePool().filter(z=>alive(z)&&!m.seen.has(z)&&rect.judgeCrossRec(z.bodyRec));
    if(m.kind==='dart'){
      for(const z of zombies){
        m.seen.add(z);const hit=packet(shot.damage*(shot.damageScale||1)*(m.owner==='citron'?1:3.8),m.owner,4,false);
        hit._gardenHitKind='pierce';hit.setArmorAlsoDamagedWhenNotProtecting(true);z.dealDamage(hit);
        if(m.seen.size>=3){shot.pop();break;}
      }
      if(!zombies.length&&!m.seen.size&&shot.inLane.tombPool(0).some(t=>rect.judgeCrossRec(t.bodyRec)))shot.detectEnemyNormal(0);
      return true;
    }
    const grave=shot.inLane.tombPool(0).find(t=>rect.judgeCrossRec(t.bodyRec));
    if(grave)grave.dealDamage(packet(Math.max(4200*m.rankScale,shot.damage*2.4),m.owner,2));
    const sq=get('Square').Square,right=sq.getLnC(shot.inLane.LaneIndex,sq.MaxColumnIndex);
    if(zombies.length||grave||right&&shot.worldPositionX>=right.node.worldPosition.x)detonate(shot,m,zombies[0]||grave);
    return true;
  }
  function updateFields(){
    const level=play(),list=fields.get(level);
    if(level)gardenGatlingAmmo.tick(level.gamedTime);
    if(!list?.length||!get('levelController').LevelPlay.gaming||get('UI').UIInGame.component?.paused)return;
    for(let i=list.length-1;i>=0;i--){
      const f=list[i];
      while(f.remaining&&level.gamedTime>=f.at){
        for(const z of nearby(f.row,f.x,1.95)){
          const hit=packet(f.amount*f.scale*gardenPlantCritical.aura().damage,'citron',0,false);
          hit._gardenTrueDamage=true;hit._gardenArmorPass=true;hit._gardenCritResolved=true;
          z.defaultDealDamage(hit);
        }
        f.remaining--;f.at++;
      }
      if(!f.remaining){if(f.art?.isValid)f.art.destroy();list.splice(i,1);}
    }
  }
  return {autoFood,feedLeaf,payFood,price,citronFired,markVolley,markCitron,clearShot,impact,specialFlight,fractureFactor,
    forgetZombie:z=>fractures.delete(z),updateFields};
})();
