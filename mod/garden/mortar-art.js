const gardenMortarArt=(()=>{
  let cc=null,layer=null,clock=null;
  const sprites=new Map(),crews=new Map(),shells=new Map(),bursts=[];
  const tau=Math.PI*2;
  function path(g,d,fill,stroke='#30383b',width=3){
    const p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p);}
    if(stroke){g.lineWidth=width;g.strokeStyle=stroke;g.stroke(p);}
  }
  function oval(g,x,y,rx,ry,fill,line,width=2){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,tau);
    if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=width;g.strokeStyle=line;g.stroke();}
  }
  function alloy(g,x1,y1,x2,y2,colors){
    const a=g.createLinearGradient(x1,y1,x2,y2);
    colors.forEach((c,i)=>a.addColorStop(i/(colors.length-1),c));return a;
  }
  function draw(g,id){
    g.lineCap='round';g.lineJoin='round';
    if(id==='pack'){
      path(g,'M-35 2 Q-39 -12 -28 -23 L-6 -36 31 -4 33 32 17 48 -23 40 -35 23Z',alloy(g,-34,-20,28,35,['#e6c786','#99865c','#676449']));
      for(const [x,y] of [[4,4],[16,14],[22,-5]]){
        path(g,`M${x-7} ${y+8} q-4 -13 8 -24 q12 3 12 15 l-6 14Z`,'#929f77');}
      path(g,'M-33 12 Q-29 8 -18 11 L-8 17 -10 34 -28 33 -36 26 Z','#b0905c');
      path(g,'M-31 19 L-24 23 -12 21',null,'#745534',2);
      path(g,'M-25 33 L-7 31 22 -2 30 0 10 35 -7 44 -28 42Z','#4c635b');
      for(const [x,y] of [[-22,31],[-3,34],[18,8]])oval(g,x,y,2.5,2.5,'#f3cf85','#665a45',1.3);
    }else if(id==='launcher'){
      path(g,'M-10 21 L17 30 35 45 31 49 6 39 -3 39 -27 51 -38 48 -31 38Z','#6e735a');
      path(g,'M-4 31 L9 20 21 24 22 30 10 41 -6 39Z','#b4a278');
      const body=alloy(g,-28,-19,15,-37,['#434d4f','#6d8182','#c2c8ab','#5c7471','#48585b']);
      path(g,'M-61 -43 L-33 -64 18 17 Q21 26 14 30 L4 34 Q-1 35 -5 29Z',body);
      path(g,'M-42 -54 L-31 -50 11 16 6 19Z','#d2c9a1',null);
      for(const [x,y] of [[-38,-32],[-19,-3]]){
        g.save();g.translate(x,y);g.rotate(-.57);
        path(g,'M-13 -3 Q0 0 16 -5 L17 0 Q0 7 -13 3Z','#c59850',undefined,2);g.restore();
      }
      g.save();g.translate(-47,-53);g.rotate(-.60);
      oval(g,0,0,21,9,'#a6b2a1','#30393b',3.2);oval(g,0,0,15,5.8,'#384346','#cfc49b',2);g.restore();
      oval(g,8,25,10,7,'#7c8a79','#3c4545',2);oval(g,8,25,3,2,'#d5bc80');
      path(g,'M-12 11 L-23 12 -25 18 -18 22 -9 19Z','#bed7d1');
    }else if(id==='shell'){
      path(g,'M-33 3 L-48 -15 -34 -16 -25 -7 -17 -9 Q7 -21 25 -12 Q41 -6 50 0 38 10 23 15 2 20 -19 11 L-31 8 -43 19 -50 18Z',
        alloy(g,0,-19,0,19,['#f6d385','#b49c64','#7e8d72','#52645f']),undefined,3.6);
      path(g,'M14 -14 Q25 0 14 15 L22 14 Q32 -1 23 -13Z','#e88d4c','#80583e',1.2);
      path(g,'M-20 -8 Q-2 -16 12 -13',null,'#f8df9b',3);
    }else if(id==='mark'){
      oval(g,0,0,53,51,'#e1583926','#522d38',5);oval(g,0,0,53,51,null,'#ff8f66',2.8);
      for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);
        path(g,'M-14 -57 L-4 -57 -1 -50 3 -57 14 -57',null,'#ffe1a0',3.6);
        path(g,'M0 -40 L0 -28',null,'#ff6548',3.4);g.restore();}
      path(g,'M-5 -9 L0 -13 5 -9 2 4 -2 4Z','#ffe4aa','#773f42',1.4);
      oval(g,0,10,3,3,'#ffe4aa','#773f42',1.2);
    }else{
      for(let i=0;i<10;i++){g.save();g.rotate(i*tau/10);
        path(g,'M-3 -20 Q-8 -34 1 -54 L6 -32 4 -19Z',i%3?'#f0ab5d':'#f7d98a','#885341',1.1);g.restore();}
      oval(g,0,0,24,19,'#f2c373','#bb764f',2);oval(g,0,-2,13,10,'#ffe9ab');
    }
  }
  function frame(id){
    if(sprites.has(id))return sprites.get(id);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const g=canvas.getContext('2d');g.translate(128,128);g.scale(1.68,1.68);draw(g,id);
    const tex=new cc.Texture2D();tex.image=new cc.ImageAsset(canvas);
    const f=new cc.SpriteFrame();f.texture=tex;sprites.set(id,f);return f;
  }
  function sprite(parent,name,id,w,h){
    const n=new cc.Node('GardenMortar/'+name);n.setParent(parent);n.layer=parent.layer;
    const img=n.addComponent(cc.Sprite);img.sizeMode=cc.Sprite.SizeMode.CUSTOM;img.spriteFrame=frame(id);
    n.getComponent(cc.UITransform).setContentSize(w,h);return n;
  }
  const get=n=>window.System.get('chunks:///_virtual/'+n+'.ts');
  function install(){
    if(cc)return;cc=window.System.get(window.System.resolve('cc'));
    cc.director.on(cc.Director.EVENT_BEFORE_DRAW,drawFrame);
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,clear);
  }
  function field(){
    if(layer?.root.isValid)return layer;
    const sq=get('Square').Square,base=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;
    if(!base?.isValid)return null;
    const root=new cc.Node('GardenMortar/Field');root.setParent(base);root.layer=base.layer;
    const local=(r,c)=>root.inverseTransformPoint(new cc.Vec3(),sq.getLnC(r,c).plantPoint.worldPosition);
    const o=local(0,0),x=local(0,1),y=local(1,0),w=Math.abs(x.x-o.x),h=Math.abs(y.y-o.y);
    return layer={root,w,h,at:(r,c,up=0)=>({x:o.x+(x.x-o.x)*c+(y.x-o.x)*r,y:o.y+(x.y-o.y)*c+(y.y-o.y)*r+up*h})};
  }
  function set(n,p){n.setPosition(p.x,p.y,0);}
  function destroy(n){if(n?.isValid)n.destroy();}
  function attach(z){
    if(crews.has(z))return crews.get(z);
    const db=z.db,base=db?.node;if(!base?.isValid)return null;
    const bones=db.armature(),body=bones?.getBone('body')||bones?.getBone('torso');
    const head=bones?.getBone('head'),c=body?.globalTransformMatrix,h=head?.globalTransformMatrix;
    const d=c&&h?Math.max(.7,Math.min(2.4,Math.hypot(h.tx-c.tx,h.ty-c.ty)/76)):1;
    const pack=sprite(base,'Pack','pack',145*d,145*d),tube=sprite(base,'Launcher','launcher',164*d,164*d);
    const e={z,body,d,pack,tube,mark:null,windup:false,kick:0};crews.set(z,e);return e;
  }
  function handle(ev){
    install();if(ev.type==='spawn')attach(ev.z);
    if(ev.type==='remove'){const e=crews.get(ev.z);if(e){destroy(e.pack);destroy(e.tube);destroy(e.mark);crews.delete(ev.z);}}
  }
  function cancel(z){const e=crews.get(z);if(e){destroy(e.mark);e.mark=null;e.windup=false;}}
  function warn(z,aim){
    const e=crews.get(z)||attach(z),a=field();if(!e||!a)return;
    cancel(z);e.windup=true;e.stamp=0;e.mark=sprite(a.root,'Target','mark',a.w*1.42,a.h*.84);
    set(e.mark,a.at(aim.r,aim.c));
  }
  function launch(z,s){
    const a=field(),e=crews.get(z);if(!a)return;
    const mark=e?.mark||sprite(a.root,'Target','mark',a.w*1.42,a.h*.84);
    if(e){e.mark=null;e.windup=false;e.kick=1;}
    const projectile=sprite(a.root,'Shell','shell',a.w*.70,a.h*.64);
    shells.set(s,{mark,projectile});flight(s);
  }
  function flight(s){
    const f=shells.get(s),a=layer;if(!f||!a)return;
    const p=a.at(s.position.r,s.position.c,s.position.height);
    const prior=f.at;if(prior&&Math.hypot(p.x-prior.x,p.y-prior.y)>.01)
      f.projectile.angle=Math.atan2(p.y-prior.y,p.x-prior.x)*180/Math.PI;
    f.at=p;set(f.projectile,p);set(f.mark,a.at(s.target.r,s.target.c));
    const scale=.82+.23*s.progress;f.mark.setScale(scale,scale,1);
  }
  function end(s,reason){
    const f=shells.get(s);if(!f)return;
    destroy(f.projectile);destroy(f.mark);shells.delete(s);
    if(reason!=='impact'||!layer||typeof gardenFxSettings!=='undefined'&&!gardenFxSettings.enabled)return;
    const a=layer,n=sprite(a.root,'Impact','impact',a.w*2.4,a.h*1.8);set(n,a.at(s.target.r,s.target.c,.18));
    bursts.push({n,life:0,fade:n.addComponent(cc.UIOpacity)});
  }
  function drawFrame(){
    if(!crews.size&&!shells.size&&!bursts.length)return;
    const level=get('levelController').LevelPlay.component;
    if(!level||level.gameWon||level.gameLost){clear();return;}
    const now=level.gamedTime||0,dt=!clock||!level.gaming||get('UI').UIInGame.component?.paused?0:Math.max(0,Math.min(.4,now-clock));clock=now;
    for(const [z,e] of crews){
      if(z.dead||z.hypnotized||!z.node?.activeInHierarchy){handle({type:'remove',z});continue;}
      const m=e.body?.globalTransformMatrix,d=e.d,x=m?.tx||0,y=m?.ty??95*d;
      e.kick=Math.max(0,e.kick-dt*4.4);e.stamp=(e.stamp||0)+dt;
      e.pack.setPosition(x+27*d,y+1*d,0);e.tube.setPosition(x-17*d+e.kick*10*d,y+11*d-e.kick*6*d,0);
      e.tube.angle=e.windup?Math.min(9,e.stamp*9):2-e.kick*7;
      if(e.mark)e.mark.setScale(.89+.055*Math.sin(e.stamp*10),.89+.055*Math.sin(e.stamp*10),1);
    }
    for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.life+=dt;const t=b.life/.42;
      if(t>=1){destroy(b.n);bursts.splice(i,1);continue;}
      b.n.setScale(.5+t*.6,.5+t*.6,1);b.fade.opacity=Math.round(255*(1-t*t));}
  }
  function clear(){
    for(const e of crews.values()){destroy(e.pack);destroy(e.tube);}
    destroy(layer?.root);crews.clear();shells.clear();bursts.length=0;layer=null;clock=null;
  }
  return Object.freeze({handle,warn,cancel,launch,flight,end});
})();
