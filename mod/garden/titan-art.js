// Layered, hand-drawn armor plates follow the giant's animated bones. All lives
// share one atlas; durability changes swap the illustrated plate, not the rig.
const gardenTitanArt=(()=>{
  const frames=new Map();
  let cc;
  const border='#182028';
  function shape(g,path,fill,edge=border,width=3){
    const p=new Path2D(path);
    if(fill){g.fillStyle=fill;g.fill(p);}
    if(edge){g.strokeStyle=edge;g.lineWidth=width;g.stroke(p);}
  }
  function line(g,path,color,width){shape(g,path,null,color,width);}
  function gloss(g,x,y,dx,dy,colors){
    const grad=g.createLinearGradient(x,y,dx,dy);
    colors.forEach((c,i)=>grad.addColorStop(i/(colors.length-1),c));return grad;
  }
  function pin(g,x,y,r){
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle='#343e4a';g.fill();
    g.lineWidth=1.1;g.strokeStyle='#d4c9a8';g.stroke();
    line(g,'M'+(x-r*.45)+' '+(y+r*.25)+'l'+r*.94+' -'+r*.52,'#171d27',1.6);
  }
  function lamp(g,x,y,r,col){
    const grad=g.createRadialGradient(x,y,.1,x,y,r);
    grad.addColorStop(0,'#f9fff0');grad.addColorStop(.24,col);grad.addColorStop(.5,col+'a0');grad.addColorStop(1,col+'00');
    g.fillStyle=grad;g.fillRect(x-r,y-r,2*r,2*r);
  }
  function steel(g){
    return gloss(g,-50,-80,52,78,['#a8b8b6','#627886','#384759','#2a3444','#53636b','#75817d']);
  }
  function rim(g){return gloss(g,-40,-45,47,58,['#fff0c7','#ac8b63','#594644','#a08763']);}
  function armorFace(g,points){shape(g,points,steel(g),border,3);}
  function shield(g,broken){
    shape(g,'M-48 -89 L17 -98 55 -73 60 44 44 76 3 99 -44 76 -63 49 -65 -54Z',rim(g));
    shape(g,'M-48 -82 L15 -89 45 -69 48 43 36 67 2 87 -37 69 -53 45 -56 -50Z',steel(g));
    shape(g,'M16 -87 L46 -69 51 42 38 66 4 86 13 53 19 26Z','#2e3848');
    shape(g,'M-49 -48 L-38 -68 6 -75 10 17 -6 48 -36 40 -48 24Z',gloss(g,-49,-61,11,51,['#82969e','#506677','#3b4558','#506071']),'#202d38',2);
    line(g,'M-52 -48 l13 -22 46 -7 M-39 58 l37 21 33 -19','#e2d8b6',2);
    for(let i=0;i<4;i++){
      const y=-55+i*23;
      shape(g,'M24 '+y+'l14 6 .5 10 -14 -5Z',i===1?'#bfac74':'#4e5d68',border,1.6);
    }
    shape(g,'M-39 -14 l22 -13 21 11 -2 24 -18 18 -18 -12Z','#2c3c49','#bdab85',2);
    shape(g,'M-33 1 l16 -16 15 8 -10 3 -6 12 -4 -9Z','#e6c877',null);
    line(g,'M-35 9 l15 12 16 -15','#66d0c2',2);
    for(const [x,y] of [[-44,-72],[9,-83],[46,-61],[45,41],[30,65],[-35,61],[-52,39]])pin(g,x,y,3);
    for(let i=0;i<4;i++)shape(g,'M'+(-29+i*9)+' 52 l4 -7 5 2 -4 7Z','#e7bd74',null);
    if(broken)line(g,'M2 -70 l-13 21 7 12 -9 15 M22 55 l-12 -15 4 -12','#c4b5a2',2);
  }
  function torso(g,broken){
    shape(g,'M-63 -47 Q-36 -79 18 -66 L55 -54 70 -19 56 39 23 65 -28 60 -54 37 -71 1Z','#283341');
    for(let i=0;i<4;i++){
      const y=4+i*11;
      shape(g,'M-43 '+y+'q38 -7 87 0l-6 10q-37 -4 -75 0Z',i%2?'#49556a':'#606f78','#26313a',2);
    }
    armorFace(g,'M-47 -56 L-12 -65 0 -41 -8 -11 -34 4 -58 -7 -64 -32Z');
    armorFace(g,'M-8 -61 L23 -65 53 -48 58 -25 40 -9 10 -6 1 -25Z');
    armorFace(g,'M-67 -20 L-76 -30 -72 -49 -53 -63 -34 -60 -30 -50 -45 -30Z');
    armorFace(g,'M28 -64 L49 -68 73 -50 78 -26 66 -14 57 -30 39 -35Z');
    line(g,'M-71 -38 l17 -18 14 -1 M34 -59 l12 -4 20 12 M-48 -47 l27 -10 M7 -54 l16 -5 20 10','#d3dfcc',2.5);
    for(const [x,y,rot] of [[-48,-26,-12],[20,-33,8]]){
      g.save();g.translate(x,y);g.rotate(rot*Math.PI/180);
      shape(g,'M0 0 l22 -2 -2 10 -19 4Z','#202837','#889295',1.6);
      shape(g,'M3 3 l16 -2 -2 5 -13 3Z',gloss(g,0,0,20,6,['#af9dee','#715eab','#bfe0e4']),null);
      g.restore();
    }
    shape(g,'M-43 29 l74 6 7 -8 -1 18 -12 7 -65 -7Z','#333942','#827858',2);
    shape(g,'M-14 32 l17 2 -2 12 -16 -1Z',rim(g),border,2);
    for(const [x,y] of [[-54,-43],[-23,-49],[40,-47],[67,-43],[-51,7],[40,6]])pin(g,x,y,2.6);
    if(broken)line(g,'M-45 -49 l10 8 -4 6 14 9 M38 -9 l-12 -8 -3 -6','#c5beaf',1.7);
  }
  function helm(g,broken){
    const dome='M-66 -11 Q-62 -48 -31 -61 Q1 -78 40 -51 L57 -26 53 6 43 29 20 48 -16 51 -46 35 -61 14Z';
    shape(g,dome,steel(g),border,4);
    shape(g,'M-57 -26 Q-35 -60 5 -58 L-6 -43 -29 -27 -47 -20Z','#9caeb1',null);
    shape(g,'M-47 0 L-20 -14 11 -12 33 -3 38 15 23 34 5 47 -21 44 -44 27Z','#273543','#1a2530',2);
    shape(g,'M-57 -12 L-27 -23 -3 -21 25 -11 16 2 -20 5 -49 15 -60 10Z',gloss(g,-52,-15,19,8,['#0b171e','#213444','#314355','#0c171e']),border,3);
    line(g,'M-52 1 l29 -14 17 0 20 5','#b8e8db',4);
    line(g,'M-51 3 l27 -13 18 0 17 4','#50ead8',2.7);
    lamp(g,-40,-3,9,'#6affea');
    armorFace(g,'M31 -36 L52 -25 57 -4 42 17 26 11 21 -8Z');
    for(let i=0;i<3;i++)line(g,'M'+(32+i*5)+' -19 l2 14','#25323d',2);
    for(let i=0;i<4;i++)line(g,'M'+(-38+i*9)+' '+(22+i*1.2)+'l7 8','#869497',2.8);
    line(g,'M-49 -28 q14 -20 34 -25 M-31 34 l17 10 17 -1','#c8d4c6',2.1);
    pin(g,-45,-20,2.3);pin(g,34,-25,2.7);pin(g,28,20,2.4);
    if(broken)line(g,'M-11 -55 l6 9 -7 8 5 9','#dac2ac',1.9);
  }
  function atlas(){
    if(frames.size)return;
    cc=window.System.get(window.System.resolve('cc'));
    const cell=256,canvas=document.createElement('canvas');canvas.width=cell*3;canvas.height=cell*2;
    const ctx=canvas.getContext('2d');ctx.lineJoin='round';ctx.lineCap='round';
    const entries=[['vest',torso],['helmet',helm],['shield',shield]];
    for(const [i,[name,paint]] of entries.entries())for(let stage=0;stage<2;stage++){
      ctx.save();ctx.translate((i+.5)*cell,(stage+.5)*cell);ctx.scale(1.20,1.20);paint(ctx,stage);ctx.restore();
    }
    const tex=new cc.Texture2D();tex.image=new cc.ImageAsset(canvas);
    for(const [i,[name]] of entries.entries())for(let stage=0;stage<2;stage++){
      const f=new cc.SpriteFrame();f.texture=tex;f.packable=false;f.rect=new cc.Rect(i*cell,stage*cell,cell,cell);
      f.originalSize=new cc.Size(cell,cell);f.addRef();frames.set(name+stage,f);
    }
  }
  function make(z,body){
    const base=z.db?.node,arm=z.db?.armature?.();
    if(!base?.isValid||!arm)return;
    atlas();
    const root=new cc.Node('SnowlineTitan');root.layer=base.layer;root.parent=base;
    const bone=(keys)=>keys.map(k=>arm.getBone(k)).find(Boolean);
    const rig={root,base,head:bone(['head','Head','HEAD','head_root','head_main']),
      chest:bone(['body','Body','BODY','torso','chest','body_main','upperBody','body_root']),
      shoulder:bone(['arm_here','arm_upper_here','arm_upper_R','armRight','arm_upper_near']),parts:{}};
    for(const key of ['vest','helmet','shield']){
      const n=new cc.Node(key);n.layer=root.layer;n.parent=root;
      const pic=n.addComponent(cc.Sprite);pic.sizeMode=cc.Sprite.SizeMode.CUSTOM;
      rig.parts[key]={n,pic,ui:n.getComponent(cc.UITransform),stage:-1};
    }
    body.rig=rig;return rig;
  }
  function release(body){if(body.rig?.root.isValid)body.rig.root.destroy();body.rig=null;}
  function pose(z,body){
    const s=gardenChallengeArmor.state(z);
    if(!s)return;
    let e=body.rig;
    if(!e?.root?.isValid||e.base!==z.db?.node){release(body);e=make(z,body);if(!e)return;}
    const h=e.head?.globalTransformMatrix,c=e.chest?.globalTransformMatrix,sh=e.shoulder?.globalTransformMatrix;
    const hx=h?.tx??z.armorSocket?.position?.x??-22,hy=h?.ty??z.armorSocket?.position?.y??205;
    const cy=c?.ty??hy-80,cx=c?.tx??hx+30;
    const size=Math.max(1.25,Math.min(2.15,Math.hypot(cx-hx,hy-cy)/65));
    const torsoX=(cx+(sh?.tx??hx+34*size))*.5,torsoY=(cy+(sh?.ty??hy-26*size))*.5;
    for(const key of ['vest','helmet','shield']){
      const a=s[key],p=e.parts[key];
      p.n.active=a.hp>0&&(key!=='helmet'||z.haveHead!==false);
      if(!p.n.active)continue;
      const stage=a.hp<a.max*.45?1:0;
      if(p.stage!==stage){p.stage=stage;p.pic.spriteFrame=frames.get(key+stage);}
      let x=torsoX,y=torsoY,w=192*size;
      if(key==='helmet'){x=hx;y=hy+9*size;w=178*size;}
      if(key==='shield'){x=hx-58*size;y=torsoY-31*size;w=198*size;}
      if(Math.abs(p.ui.width-w)>.25)p.ui.setContentSize(w,w);
      p.n.setPosition(x,y,0);
      const lit=body.flash>body.run.clock&&key==='helmet';
      if(p.lit!==lit){p.lit=lit;p.pic.color=lit?new cc.Color(179,255,238):cc.Color.WHITE;}
    }
  }
  return {release,pose};
})();
