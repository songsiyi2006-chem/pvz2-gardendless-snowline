// Burn sprites live on the lawn's liquid/tile layer, below the native character layers.
const gardenAirFireArt=(()=>{
  const states=new WeakMap(),atlases=new WeakMap();
  const width=112,height=104,steps=16,variants=4,tau=Math.PI*2;
  function random(seed){
    return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  }
  function ellipse(g,x,y,rx,ry,color,rotation=0){
    g.beginPath();g.ellipse(x,y,rx,ry,rotation,0,tau);g.fillStyle=color;g.fill();
  }
  function glow(g,x,y,rx,ry,inside,outer){
    g.save();g.translate(x,y);g.scale(rx,ry);
    const ink=g.createRadialGradient(0,0,0,0,0,1);ink.addColorStop(0,inside);ink.addColorStop(.54,outer);ink.addColorStop(1,'rgba(80,29,16,0)');
    ellipse(g,0,0,1,1,ink);g.restore();
  }
  function coal(g,x,y,r,tilt,heat){
    g.save();g.translate(x,y);g.rotate(tilt);
    const grad=g.createLinearGradient(0,-r*.42,0,r*.5);grad.addColorStop(0,'#815541');grad.addColorStop(.42,'#4a3831');grad.addColorStop(1,'#241f22');
    g.fillStyle=grad;g.beginPath();g.moveTo(-r,0);g.lineTo(-r*.55,-r*.43);g.lineTo(r*.26,-r*.48);
    g.lineTo(r*.94,-r*.1);g.lineTo(r*.78,r*.32);g.lineTo(-r*.42,r*.39);g.closePath();g.fill();
    g.strokeStyle=heat;g.lineWidth=r>.7?1.15:.6;g.lineCap='round';g.beginPath();g.moveTo(-r*.67,-r*.12);
    g.lineTo(-r*.22,-r*.22);g.lineTo(r*.02,-r*.02);g.lineTo(r*.31,-r*.16);g.stroke();g.restore();
  }
  function tongue(g,x,y,w,h,lean,bend){
    g.save();g.translate(x,y);
    const skin=g.createLinearGradient(0,-h,0,1);
    skin.addColorStop(0,'rgba(245,112,49,.84)');skin.addColorStop(.34,'#f3592c');skin.addColorStop(.72,'#ff972d');skin.addColorStop(1,'#df642b');
    g.fillStyle=skin;g.beginPath();g.moveTo(-w*.52,0);
    g.bezierCurveTo(-w*.94,-h*.27,lean-w*.15,-h*.46,lean+bend,-h);
    g.bezierCurveTo(lean+w*.63,-h*.75,w*.35,-h*.42,w*.52,-h*.34);
    g.bezierCurveTo(w*.55,-h*.39,w*.80,-h*.44,w*.74,-h*.57);
    g.bezierCurveTo(w*1.08,-h*.39,w*.94,-h*.10,w*.46,.2);g.quadraticCurveTo(0,h*.09,-w*.52,0);g.fill();
    const honey=g.createLinearGradient(0,-h*.76,0,2);honey.addColorStop(0,'#ffad34');honey.addColorStop(.65,'#ffce64');honey.addColorStop(1,'#ffc052');
    g.fillStyle=honey;g.beginPath();g.moveTo(-w*.37,-.3);g.bezierCurveTo(-w*.58,-h*.22,lean*.68,-h*.28,lean*.75+bend*.44,-h*.74);
    g.bezierCurveTo(lean*.78+w*.39,-h*.51,w*.10,-h*.27,w*.44,-h*.21);g.quadraticCurveTo(w*.54,-h*.09,w*.25,0);g.closePath();g.fill();
    g.fillStyle='#ffe59b';g.beginPath();g.moveTo(-w*.20,-.3);g.quadraticCurveTo(-w*.21,-h*.16,lean*.36,-h*.34);
    g.quadraticCurveTo(w*.12,-h*.09,w*.27,-.2);g.closePath();g.fill();g.restore();
  }
  function design(variant){
    const next=random(0xde34a002+variant*857),n=(lo,hi)=>lo+(hi-lo)*next();
    const seats=[
      [[.16,.71],[.33,.57],[.48,.65],[.57,.39],[.77,.53],[.72,.80]],
      [[.17,.42],[.36,.51],[.63,.35],[.78,.60],[.47,.74],[.74,.83]],
      [[.14,.76],[.30,.67],[.47,.48],[.62,.59],[.78,.44],[.60,.83]],
      [[.22,.38],[.32,.57],[.25,.81],[.49,.69],[.65,.55],[.79,.74]]
    ][variant];
    const hearths=seats.map(([u,v],i)=>({x:(u+n(-.08,.07))*width,y:(v+n(-.045,.045))*height,w:n(3.7,6.5),
      h:n(13,29)*(i===4?1.16:1),phase:n(0,tau),lean:n(-3.5,4.2),fork:next()>.37})).sort((a,b)=>a.y-b.y);
    const coals=Array.from({length:22},()=>({x:n(8,105),y:n(23,95),r:n(2,6),tilt:n(-.48,.5),phase:n(0,tau)}));
    const motes=Array.from({length:7},()=>({h:hearths[Math.floor(next()*6)],u:next(),travel:n(11,24),wind:n(1.6,6),size:n(.58,1.25)}));
    const seams=hearths.slice(1).map((h,i)=>({a:h,b:hearths[i],bend:n(-10,10),phase:n(0,tau)}));
    return {hearths,coals,motes,seams};
  }
  const patterns=Array.from({length:variants},(_,i)=>design(i));
  function drawCell(g,variant,frame){
    const {hearths,coals,motes,seams}=patterns[variant],t=frame/steps*tau;
    glow(g,55,61,65,45,'rgba(80,36,26,.59)','rgba(103,44,26,.39)');
    g.lineJoin='round';g.lineCap='round';
    for(const s of seams){
      const {a,b}=s,dx=b.x-a.x,dy=b.y-a.y,midX=(a.x+b.x)*.5,midY=(a.y+b.y)*.5;
      const vein=new Path2D();vein.moveTo(a.x,a.y);vein.bezierCurveTo(a.x+.23*dx,a.y+.23*dy+s.bend,midX-.12*dx,midY-s.bend*.48,midX,midY);
      vein.quadraticCurveTo(b.x-.20*dx,b.y-.28*dy+s.bend*.65,b.x,b.y);
      g.strokeStyle='rgba(73,36,25,.37)';g.lineWidth=4.1;g.stroke(vein);
      const heat=g.createLinearGradient(a.x,a.y,b.x,b.y);heat.addColorStop(0,'rgba(221,83,33,.77)');heat.addColorStop(.48,'rgba(168,70,43,.17)');heat.addColorStop(1,'rgba(245,100,39,.74)');
      g.strokeStyle=heat;g.lineWidth=2.5;g.stroke(vein);
      g.strokeStyle='rgba(255,154,53,'+(.32+.16*Math.sin(t+s.phase))+')';g.lineWidth=1;g.stroke(vein);
      g.beginPath();g.moveTo(midX,midY);g.quadraticCurveTo(midX-4.8,midY+.3,midX-8.5,midY+4.6);
      g.strokeStyle='rgba(87,45,36,.67)';g.lineWidth=1.35;g.stroke();
    }
    for(const h of hearths){
      glow(g,h.x,h.y+2,h.w*3.8,h.w*1.45,'rgba(94,40,27,.82)','rgba(76,47,33,.38)');
      glow(g,h.x,h.y,h.w*2.8,h.w*.94,'rgba(255,140,57,.61)','rgba(242,88,36,.22)');
    }
    for(const c of coals){const embers=.48+.36*Math.sin(t+c.phase);
      coal(g,c.x,c.y,c.r,c.tilt,'rgba(255,126,52,'+embers+')');}
    for(const v of hearths){
      const wave=Math.sin(t+v.phase),flutter=Math.sin(2*t-v.phase);
      const h=v.h*(.89+.11*wave+.08*flutter),w=v.w*(.94+.12*flutter),l=v.lean+2.25*wave;
      if(v.fork){
        const u=(frame/steps+v.phase/tau)%1,alpha=.13*Math.sin(Math.PI*u);
        glow(g,v.x+3+8*u+wave*2,v.y-h*.58-11*u,6+3*u,5+5*u,'rgba(95,69,62,'+alpha+')','rgba(120,102,81,'+(alpha*.52)+')');
      }
      if(v.fork)tongue(g,v.x-v.w*.87,v.y+.1,w*.60,h*(.62+.08*flutter),l*.5-1.6,-1+1.7*Math.cos(t+v.phase));
      tongue(g,v.x,v.y,w,h,l,3.6*Math.cos(t+v.phase));
      ellipse(g,v.x+1,v.y+.35,w*.67,1.15,'rgba(255,193,80,.73)');
    }
    for(const m of motes){
      const u=(frame/steps+m.u)%1,fade=Math.sin(Math.PI*u),x=m.h.x+u*m.wind+Math.sin(u*tau+m.u)*1.8,y=m.h.y-m.h.h*.41-m.travel*u;
      if(y<2||x<2||x>width-2)continue;
      g.save();g.translate(x,y);g.rotate(.38+u*.6);g.globalAlpha=.80*fade;ellipse(g,0,0,m.size*.66,m.size*1.36,'#ffae41');
      if(m.size>1)ellipse(g,-.13,-.26,.42,.58,'#fff2ae');g.restore();
    }
  }
  function atlas(cc){
    if(atlases.has(cc))return atlases.get(cc);
    const strideX=width+4,strideY=height+4,cols=8,cv=document.createElement('canvas');
    cv.width=cols*strideX;cv.height=variants*steps/cols*strideY;
    const g=cv.getContext('2d'),frames=[];
    for(let variant=0;variant<variants;variant++)for(let i=0;i<steps;i++){
      const id=variant*steps+i,x=id%cols*strideX+2,y=Math.floor(id/cols)*strideY+2;
      g.save();g.translate(x,y);g.beginPath();g.rect(0,0,width,height);g.clip();drawCell(g,variant,i);g.restore();
    }
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(cv);
    for(let i=0;i<variants*steps;i++){
      const f=new cc.SpriteFrame();f.texture=texture;f.rect=new cc.Rect(i%cols*strideX+2,Math.floor(i/cols)*strideY+2,width,height);
      f.packable=false;f.addRef?.();frames.push(f);
    }
    atlases.set(cc,frames);return frames;
  }
  function destroy(n){if(n?.isValid)n.destroy();}
  function clear(s){const old=states.get(s);if(!old)return;for(const r of old.rows.values())destroy(r);states.delete(s);}
  function sync(s,a,fires,dt){
    if(!a?.root?.isValid||!fires?.length||(typeof gardenFxSettings!=='undefined'&&!gardenFxSettings.enabled)){clear(s);return;}
    const time=s.time;
    if(!Number.isFinite(time)){clear(s);return;}
    let v=states.get(s);
    if(v&&v.root!==a.root){clear(s);v=null;}
    if(!v){v={root:a.root,rows:new Map(),tiles:new Map()};states.set(s,v);}
    const live=new Map(),maxRow=s.square.MaxLaneIndex,maxCol=s.square.MaxColumnIndex;
    for(const f of fires){
      if(!f?.p||!Number.isFinite(f.until)||time<f.start||time>=f.until)continue;
      for(let r=Math.max(0,f.p.r-1);r<=Math.min(maxRow,f.p.r+1);r++)for(let c=Math.max(0,f.p.c-1);c<=Math.min(maxCol,f.p.c+1);c++){
        const k=r*(maxCol+1)+c,span=live.get(k);
        if(span){span.count++;span.start=Math.min(span.start,f.start??time);span.end=Math.max(span.end,f.until);}
        else live.set(k,{r,c,start:f.start??time,end:f.until,count:1});
      }
    }
    if(!live.size){clear(s);return;}
    const cc=a.cc,frames=atlas(cc),rows=new Set();
    for(const [k,b] of live){
      let tile=v.tiles.get(k);
      if(!tile){
        const cell=s.square.getLnC(b.r,b.c);
        if(!cell||(typeof cell.isInLawn==='function'&&!cell.isInLawn()))continue;
        const parent=cell.inLane?.tileLiquidLayer||cell.inLane?.tileLayer||a.root;
        let group=v.rows.get(b.r);
        if(!group?.isValid){group=new cc.Node('GardenAir/BurnField');group.setParent(parent);group.layer=parent.layer;
          if(parent===a.root)group.setSiblingIndex?.(0);v.rows.set(b.r,group);}
        const n=new cc.Node('Burn/'+b.r+'/'+b.c);n.setParent(group);n.layer=parent.layer;
        const sprite=n.addComponent(cc.Sprite);sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;
        const trans=n.getComponent(cc.UITransform);trans.setContentSize(a.w,a.h);
        if(parent!==a.root&&cell.plantPoint?.worldPosition)n.setWorldPosition(cell.plantPoint.worldPosition);
        else{const p=a.at(b.r,b.c,0);n.setPosition(p.x,p.y,0);}
        let hash=Math.imul(b.r+19,83492791)^Math.imul(b.c+29,19349663);
        hash=Math.imul(hash^(hash>>>16),0x7feb352d);hash=Math.imul(hash^(hash>>>15),0x846ca68b);hash^=hash>>>16;
        tile={n,sprite,trans,alpha:n.addComponent(cc.UIOpacity),variant:(hash>>>8)%variants,offset:(hash>>>1)%steps,frame:-1};v.tiles.set(k,tile);
      }
      rows.add(b.r);
      const frame=(Math.floor(time*13)+tile.offset)%steps;
      if(frame!==tile.frame){tile.frame=frame;tile.sprite.spriteFrame=frames[tile.variant*steps+frame];}
      const attack=.56+.44*Math.min(1,Math.max(0,(time-b.start)/.18));
      const tail=.34+.66*Math.min(1,(b.end-time)/.45);
      tile.alpha.opacity=Math.round(Math.min(248,215+Math.min(3,b.count-1)*11)*Math.min(attack,tail));
    }
    for(const [key,tile] of v.tiles)if(!live.has(key)){destroy(tile.n);v.tiles.delete(key);}
    for(const [id,group] of v.rows)if(!rows.has(id)){destroy(group);v.rows.delete(id);}
  }
  return Object.freeze({sync,clear});
})();
