// Painted icons occupy the projectile's original transform. Ammo metadata and
// flight stay on commonShot; a single shared atlas serves every active volley.
const gardenGatlingAmmo=(()=>{
  const types=['cherry','arc','violet','plasma','dart'];
  const width=152,height=108,motionFrames=4,cache=new WeakMap(),flying=new Set();
  let atlas=null,phase=-1,serial=0,subscribed=false;
  const engine=()=>window.System.get(window.System.resolve('cc'));
  function shape(g,d,fill,stroke=null,w=2){
    const p=new Path2D(d);
    if(fill){g.fillStyle=fill;g.fill(p);}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke(p);}
  }
  function oval(g,x,y,rx,ry,color,tilt=0){
    g.beginPath();g.ellipse(x,y,rx,ry,tilt,0,Math.PI*2);g.fillStyle=color;g.fill();
  }
  function line(g,d,color,w=2){shape(g,d,null,color,w);}
  function ramp(g,x,y,xx,yy,colors){
    const p=g.createLinearGradient(x,y,xx,yy);
    colors.forEach((color,i)=>p.addColorStop(i/(colors.length-1),color));return p;
  }
  function ball(g,x,y,r,colors){
    const p=g.createRadialGradient(x-r*.39,y-r*.47,r*.02,x,y,r*1.1);
    colors.forEach((c,i)=>p.addColorStop(i/(colors.length-1),c));return p;
  }
  function glow(g,x,y,rx,ry,color){
    g.save();g.translate(x,y);g.scale(rx,ry);
    const p=g.createRadialGradient(0,0,0,0,0,1);
    p.addColorStop(0,'#'+color+'a8');p.addColorStop(.55,'#'+color+'59');p.addColorStop(1,'#'+color+'00');
    oval(g,0,0,1,1,p);g.restore();
  }
  function berry(g,x,y,r,back){
    g.save();g.translate(x,y);g.scale(r/17,r/17);
    shape(g,'M-3 -15 C-17 -22 -24 -7 -19 6 C-16 18 -6 20 1 18 C11 21 23 10 21 -2 C21 -13 14 -21 5 -17 Q2 -14 -3 -15Z',
      ball(g,-1,-1,22,back?['#fff8ba','#fc6351','#cb203e','#611d39']:['#fff6b2','#ff6045','#db2547','#6e1333']),'#4a2332',3);
    shape(g,'M-15 -6 Q-12 -14 -5 -13 Q-3 -10 -9 -8 Q-16 -2 -15 -6Z','#fff1ba');
    line(g,'M-11 11 Q-6 16 2 15','#ff847c',1.7);
    line(g,back?'M-1 -6 l7 2':'M-4 -4 l8 2 M11 -2 l6 -4','#4b2131',2.7);
    if(!back){oval(g,3,1,1.7,3,'#422431');oval(g,13,0,1.6,2.8,'#422431');}
    g.restore();
  }
  function cherry(g,t,lit){
    if(lit){
      glow(g,-5,5,42,29,'ff8053');
      line(g,'M-49 0 Q-39 -2 -29 1 M-48 14 l18 -3','#ffa375',2);
    }
    berry(g,-8,9,13.5,true);berry(g,15,8,17,false);
    const sway=lit?Math.sin(t)*2:0;
    g.save();g.translate(0,sway*.35);
    const stems='M-8 -3 Q-7 -20 3 -28 Q14 -29 14 -8 M2 -27 Q-1 -32 3 -36';
    line(g,stems,'#394827',5);line(g,stems,'#98ad52',2.1);
    shape(g,'M2 -27 Q-10 -43 -28 -32 Q-18 -16 -2 -25Z',ramp(g,-20,-36,0,-20,['#d7ee82','#71ad51','#397d4d']),'#334e39',2.5);
    line(g,'M-23 -32 q12 2 19 7','#e0f08c',1.8);
    g.restore();
  }
  function arc(g,t,lit){
    if(lit){
      glow(g,0,0,46,32,'58afff');
      const j=Math.cos(t)*3;
      const lightning='M-61 '+(-5+j)+' l16 -3 -4 8 18 -4 M-27 -15 l10 -10 6 3 11 -10 9 8 11 -2 M24 4 l17 3 -6 7 9 1 M-27 16 l-10 7 -14 -2';
      line(g,lightning,'#4872d8',4.5);line(g,lightning,'#cbffff',1.9);
    }
    shape(g,'M-17 -5 Q-29 -17 -36 -8 Q-33 4 -18 9 M-19 3 Q-34 5 -32 14 Q-21 17 -13 9',
      ramp(g,-30,-12,-12,12,['#98f5d1','#3d9bac','#22647b']),'#19395c',2.5);
    shape(g,'M-17 -11 Q-10 -24 4 -22 C19 -23 28 -13 29 0 C30 14 18 22 6 22 C-12 24 -24 14 -22 1 Q-22 -4 -17 -11Z',
      ball(g,4,0,25,['#ecfff3','#9bf6d6','#3dc7c6','#3987af','#344b88']),'#223e64',3.2);
    line(g,'M-12 -10 Q-5 -17 2 -16','#f6ffe3',3.7);
    shape(g,'M9 -16 L-2 2 5 1 1 12 17 -6 10 -5 16 -16Z','#fff17c','#437dad',1.5);
    line(g,'M12 17 q10 -2 13 -12','#a3f4ed',2);
  }
  function violet(g,t,lit){
    const flutter=lit?Math.sin(t)*4:0;
    if(lit){glow(g,-3,-1,49,32,'b65aff');oval(g,-49,-13+flutter,4.6,2.4,'#cc93ff',-.4);}
    shape(g,'M-64 '+(-7+flutter)+' Q-47 -11 -36 -6 Q-38 -15 -49 -25 Q-28 -26 -13 -13 Q-17 -23 -18 -30 Q-4 -26 4 -17 C29 -23 40 -5 30 11 Q20 26 0 20 Q-15 21 -39 29 Q-34 21 -28 15 Q-45 18 -55 12 Q-47 9 -44 6 Q-57 4 -64 '+(-7+flutter)+'Z',
      ramp(g,0,-27,12,26,['#e8c1ff','#b25afe','#8a39d7','#59279a','#552450']),'#43264d',3);
    shape(g,'M-45 -13 Q-25 -13 -11 -2 Q-17 -11 -16 -18 C-3 -7 4 -13 11 -12 C29 -13 31 0 24 9 Q18 18 7 14 Q-5 11 -25 19 Q-18 10 -12 9 Q-32 6 -45 -13Z',
      ramp(g,-15,0,24,2,['#cc74ff','#ffaff9','#fff4d9']),null);
    shape(g,'M1 -4 C14 -12 24 -7 24 0 Q23 8 13 9 Q6 7 0 10 L5 3 -2 2Z','#fff4da');
    line(g,'M2 17 q13 5 21 -4','#de8aef',1.8);
  }
  function plasma(g,t,lit){
    if(lit){glow(g,2,0,49,40,'40ffdc');line(g,'M-62 4 q17 3 36 -3 M-49 -8 l15 1','#86eadf',2.5);}
    const tilt=-.56,rx=32,ry=10;
    g.save();g.rotate(tilt);g.beginPath();g.ellipse(0,0,rx,ry,0,Math.PI,Math.PI*2);
    g.lineWidth=3.5;g.strokeStyle='#5b6fca';g.stroke();g.restore();
    oval(g,2,0,23,23,'#183856');
    oval(g,2,0,20.7,20.7,ball(g,3,0,22,['#e3ffdc','#89ffdf','#25bfba','#3656a1','#2a245e']));
    for(let i=0;i<3;i++){
      const angle=t*.3+i*2.094;
      g.save();g.translate(2,0);g.rotate(angle);
      line(g,'M-14 -4 q5 -11 14 -10 q8 1 10 7 q-7 -7 -12 -1 q-2 6 4 8','#c2fff1',1.9);g.restore();
    }
    oval(g,3,-1,6,6,'#e6fff2');oval(g,1,-3,3,2,'#fffed1');
    g.save();g.rotate(tilt);g.beginPath();g.ellipse(0,0,rx,ry,0,0,Math.PI);
    g.lineWidth=3.7;g.strokeStyle='#a2ffdb';g.stroke();oval(g,-rx+1,3,3.4,2.6,'#edffed');g.restore();
  }
  function dart(g,t,lit){
    if(lit){
      glow(g,-11,0,52,16,'85f4ce');
      shape(g,'M-70 0 l27 -3 -6 -3 32 3 -3 6 -26 1 6 -3Z','#a7ffe0');
      line(g,'M-62 9 l26 -4 M-46 -9 l20 4','#adf2ac',1.6);
    }
    shape(g,'M-31 -4 L-40 -17 -24 -15 -8 -4Z M-30 3 L-40 16 -24 14 -9 4Z',
      ramp(g,-29,-18,-25,15,['#d8ef80','#699f53','#336357']),'#314745',2.8);
    line(g,'M-33 -13 l12 6 M-33 13 l12 -6','#c3df85',1.8);
    shape(g,'M-35 -4 L-23 -7 14 -8 43 0 14 7 -23 7 -35 3Z',
      ramp(g,1,-9,2,9,['#fff5b0','#eeb952','#ba7436','#814b36']),'#534738',3.1);
    shape(g,'M12 -7 L43 0 12 4 2 1Z',ramp(g,21,-6,21,6,['#effde2','#bad7b0','#6a9788']),'#50625c',1.7);
    shape(g,'M-27 -5 L-22 -6 -19 6 -24 6Z M-13 -6 L-9 -6 -7 6 -11 6Z','#5c8d72');
    line(g,'M-16 -3 l21 -1 M17 -3 30 -1','#fff3a8',1.7);
  }
  const painters={cherry,arc,violet,plasma,dart};
  function draw(g,kind,frame){
    g.save();g.lineJoin='round';g.lineCap='round';
    painters[kind](g,frame*Math.PI/2,frame<motionFrames);g.restore();
  }
  function frames(cc){
    if(atlas)return atlas;
    const canvas=document.createElement('canvas'),cols=motionFrames+1;
    canvas.width=cols*width;canvas.height=types.length*height;
    const g=canvas.getContext('2d'),out={};
    for(const [r,id] of types.entries())for(let col=0;col<cols;col++){
      g.save();g.translate((col+.5)*width,(r+.5)*height);
      draw(g,id,col);g.restore();
    }
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);
    for(const [r,id] of types.entries()){
      out[id]=[];
      for(let col=0;col<cols;col++){
        const f=new cc.SpriteFrame();f.texture=texture;f.packable=false;
        f.rect=new cc.Rect(col*width,r*height,width,height);f.originalSize=new cc.Size(width,height);f.addRef();
        out[id].push(f);
      }
    }
    atlas=out;return out;
  }
  function show(s){
    if(!s.node.isValid){flying.delete(s);return;}
    const index=gardenFxSettings.enabled?(s.seed+Math.max(phase,0))%motionFrames:motionFrames;
    const frame=atlas[s.kind][index];if(s.pic.spriteFrame!==frame)s.pic.spriteFrame=frame;
  }
  function attach(shot,kind){
    const root=shot.node,db=shot.db;
    if(!root?.isValid||!db?.isValid)return;
    const cc=engine();
    frames(cc);
    if(!subscribed){subscribed=true;gardenFxSettings.subscribe(()=>{for(const s of flying)show(s);});}
    let s=cache.get(shot);
    if(!s?.node.isValid){
      const node=new cc.Node('Gatling ammo');node.layer=root.layer;node.setParent(root);
      const pic=node.addComponent(cc.Sprite);pic.sizeMode=cc.Sprite.SizeMode.CUSTOM;
      s={node,pic,layout:node.getComponent(cc.UITransform)};
      node.once(cc.Node.EventType.NODE_DESTROYED,()=>{flying.delete(s);s.db=null;});
      cache.set(shot,s);
    }
    s.kind=kind;s.seed=serial++%motionFrames;s.node.name='Gatling ammo/'+kind;s.node.layer=root.layer;
    const xs=Math.max(.001,Math.abs(root.worldScale.x)),ys=Math.max(.001,Math.abs(root.worldScale.y));
    const cell=window.System.get('chunks:///_virtual/Square.ts').Square.SquareWidth;
    s.layout.setContentSize(cell*1.08/xs,cell*1.08*height/(width*ys));
    s.db=db;s.wasEnabled=db.enabled;
    s.node.active=true;show(s);
    // Only the original pea's display component is suspended. The projectile,
    // collider, position, shadow, damage and lifetime stay under native control.
    db.enabled=false;flying.add(s);
  }
  function release(shot){
    const s=cache.get(shot);
    if(!s||!flying.delete(s))return;
    if(s.node.isValid)s.node.active=false;
    if(s.db?.isValid)s.db.enabled=s.wasEnabled;
    s.db=null;
  }
  function tick(time){
    const next=Math.floor(time*9)%motionFrames;
    if(next===phase||!flying.size)return;
    phase=next;
    if(gardenFxSettings.enabled)for(const s of flying)show(s);
  }
  return Object.freeze({attach,release,tick});
})();
