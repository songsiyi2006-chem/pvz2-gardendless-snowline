// All body parts and their three wear states share one transparent texture. The
// sockets below follow DragonBones rather than the zombie's ground rectangle.
const gardenChallengeArmorArt=(()=>{
  const ink='#242c2e',steel='#8ca6ad',light='#e3e8c8',rust='#a86d49';
  const parts=['vest','helmet','door'],styles=['vest','helmet','bucket','door','guardHelmet','guardVest','helmetBack','helmetFront','bucketBack','bucketFront','camouflage'];
  const frames=new Map(),wearers=new Map(),fragments=[];
  let cc,level,ui,installed=false,lastTime=0;
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  function shape(g,path,fill,edge=ink,width=3){
    const p=new Path2D(path);
    if(fill){g.fillStyle=fill;g.fill(p);}
    if(edge){g.lineWidth=width;g.strokeStyle=edge;g.stroke(p);}
  }
  function line(g,path,color,width=2){shape(g,path,null,color,width);}
  function gradient(g,x,y,dx,dy,colors){
    const grad=g.createLinearGradient(x,y,dx,dy);
    for(let i=0;i<colors.length;i++)grad.addColorStop(i/(colors.length-1),colors[i]);
    return grad;
  }
  function bolt(g,x,y,r=3){
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle='#60676a';g.fill();g.strokeStyle=ink;g.lineWidth=1.2;g.stroke();
    line(g,'M'+(x-r*.5)+' '+(y-r*.2)+' l'+r*.84+' '+(-r*.48),light,1.25);
  }
  function scar(g,path,w=3){
    g.save();g.translate(1,1.4);line(g,path,'#d1d1ad',w+1);g.restore();
    line(g,path,'#35404a',w);
  }
  function tear(g,path){
    g.save();g.globalCompositeOperation='destination-out';shape(g,path,'#000',null);g.restore();
  }
  function door(g,n){
    const frame=gradient(g,-50,-90,52,93,['#aeb5a6','#849499','#59696c','#465659','#737c73']);
    const outer='M-42 -91 L35 -83 47 -72 35 83 26 90 -47 81 -54 73 -49 -80Z';
    const mesh='M-37 -78 L29 -71 20 74 -42 67Z';
    shape(g,outer,'#243b3d28',ink,3);g.save();g.clip(new Path2D(mesh));
    const lines=new Path2D();
    for(let x=-190;x<185;x+=18){lines.moveTo(x,-100);lines.lineTo(x+136,100);lines.moveTo(x,-100);lines.lineTo(x-160,100);}
    g.strokeStyle='#162d32';g.lineWidth=3.6;g.stroke(lines);g.save();g.translate(-.8,-1);
    g.strokeStyle='#a0b0a1';g.lineWidth=1.35;g.stroke(lines);g.restore();
    if(n){
      tear(g,n===1?'M0 -37 l13 -8 15 11 -5 13 9 11 -10 9 -11 -5 -13 -13Z':'M-30 -60 l21 -6 17 16 19 -3 14 20 -8 19 3 15 -12 8 -15 -9 -10 3 -17 -19 3 -13Z');
      line(g,n===1?'M0 -33 l8 5 3 6 M18 0 l-6 -7 3 -6':'M-29 -57 l7 10 -3 7 M17 8 l-8 -9 -8 -7 M-20 -21 l6 4 -1 8',steel,2.6);
    }
    g.restore();
    const border=new Path2D(outer+' '+mesh);g.fillStyle=frame;g.fill(border,'evenodd');
    line(g,outer,ink,4);line(g,mesh,'#32464a',2.5);
    line(g,'M-44 -78 l6 -9 67 6 M-51 68 l6 -140 M-43 77 l64 8','#c8d0b9',2.2);
    shape(g,'M-44 25 L28 9 27 17 -45 33Z',frame,'#344549',2.2);
    shape(g,'M-51 -64 l9 0 0 16 -10 -1Z M-54 48 l9 1 0 15 -9 -1Z','#798382',ink,2.5);
    for(const [x,y] of [[-40,-85],[33,-77],[-47,74],[27,82],[-41,29],[25,13],[-45,-57],[-48,56]])bolt(g,x,y,2.7);
    shape(g,'M31 -8 l7 1 -2 24 -8 1 -1 -5 6 -2 1 -13 -5 -1Z','#c3ad76',ink,2.2);
    shape(g,'M-33 -64 l19 2 -1 13 -19 -2Z','#aba58c','#384d4d',2);
    line(g,'M-30 -60 l12 1 M-29 -55 l7 .8','#56615a',1.7);
    if(n){scar(g,'M29 -80 l-4 4 4 5 -3 6',2.2);line(g,'M-48 40 l3 5 -3 4',rust,2);}
    if(n===2){tear(g,'M26 -100 L48 -100 54 -43 39 -42 33 -46 35 -54 29 -51 29 -60 22 -64 27 -74 21 -80Z');
      line(g,'M22 -79 l5 5 -5 10 7 4 0 9 6 -3 -2 8 6 4','#555e5d',3);}
  }
  function splinter(g,index){
    const colors=[['#c7b990','#827d62','#484f43'],['#a8b38b','#6c8265','#3d5449'],['#d5d3af','#879696','#505f65']];
    const p=colors[index];
    if(index===1){
      shape(g,'M-68 -20 L-25 -32 15 -23 65 -31 48 -12 65 -1 45 3 49 13 26 10 -3 25 -55 18Z',p[1],ink,4);
      for(let j=0;j<4;j++)line(g,'M'+(-46+j*7)+' 16 l-10 15',p[0],2);
      line(g,'M-55 -17 Q-9 -23 20 -18',p[0],3);
    }else{
      shape(g,index===2?'M-66 -10 L-42 -27 43 -11 64 9 47 19 -34 7 -55 16Z':'M-59 8 Q-48 -28 5 -30 L50 -20 63 -4 40 0 29 10 10 8 -43 25Z',gradient(g,-10,-20,10,22,p),ink,4);
      line(g,'M-47 -5 Q-16 -23 15 -17',p[0],3);bolt(g,31,-4,4);
    }
  }
  function camouflage(g,n){
    const jacket='M-55 -48 Q-46 -58 -28 -59 L-17 -48 2 -43 19 -58 33 -58 46 -48 59 -26 52 -8 44 -12 48 34 53 57 31 69 15 64 7 72 -17 65 -30 70 -51 63 -54 39 -48 14 -61 20 -68 9 -65 -20Z';
    shape(g,jacket,gradient(g,-60,-56,57,67,['#afbc89','#677e5b','#354e46']),ink,4);
    g.save();g.clip(new Path2D(jacket));
    // Stagger the colored patches across folds so the pattern reads when the actor is tiny.
    const colors=['#344d45','#9daf7c','#445e4d','#c5c59a','#768c62'];
    let seed=137;
    const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    for(let i=0;i<68;i++){
      const x=-76+rand()*135,y=-72+rand()*142,w=10+rand()*24;
      g.save();g.translate(x,y);g.rotate(rand()*.6-.4);g.scale(w/20,w/24);
      shape(g,'M0 0 L8 -3 13 0 20 -2 24 3 17 5 12 4 6 10 -1 7 4 4Z',colors[i%colors.length],null);g.restore();
    }
    g.restore();
    shape(g,'M-34 -55 Q-18 -60 3 -47 L20 -56 34 -55 26 -36 10 -30 -7 -32 -27 -36Z','#425b51','#273e38',2.7);
    line(g,'M-24 -49 Q-3 -35 20 -44 M-47 15 l2 32 -4 12 M40 -10 l-1 43 5 14','#b5be8a',1.6);
    shape(g,'M-30 -25 L-8 -27 -4 -12 -23 -8 -33 -13Z','#314e47','#bcc795',1.7);
    line(g,'M-25 -17 l6 -5 5 3 4 -3','#e6e0ac',2);
    line(g,'M-32 34 Q-3 44 40 25','#344c40',4);
    if(n)scar(g,'M17 7 l-6 8 4 3 -5 8',1.7);
    if(n===2)scar(g,'M-27 19 l7 4 -3 5 8 3',1.5);
  }
  function atlas(){
    if(frames.size)return;
    const cell=224,cv=document.createElement('canvas');cv.width=cell*5;cv.height=cell*9;const g=cv.getContext('2d');
    const slots=[],paint={...gardenExpeditionArmorPaint,door,camouflage};
    for(const [index,style] of styles.entries())for(let stage=0;stage<3;stage++)slots.push([style+stage,index%5,stage+3*Math.floor(index/5),ctx=>paint[style](ctx,stage)]);
    for(const [i,part] of ['helmet','vest','door'].entries())slots.push(['chip'+part,i+1,6,ctx=>splinter(ctx,i)]);
    for(const [,x,y,draw] of slots){g.save();g.translate((x+.5)*cell,(y+.5)*cell);g.scale(cell/208,cell/208);
      g.lineJoin='round';g.lineCap='round';draw(g);g.restore();}
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(cv);
    for(const [key,x,y] of slots){const frame=new cc.SpriteFrame();frame.texture=texture;frame.packable=false;
      frame.rect=new cc.Rect(x*cell,y*cell,cell,cell);frame.originalSize=new cc.Size(cell,cell);frame.addRef();frames.set(key,frame);}
  }
  function sprite(parent,name){
    const n=new cc.Node('ChallengeArmor/'+name);n.setParent(parent);n.layer=parent.layer;
    const pic=n.addComponent(cc.Sprite);pic.sizeMode=cc.Sprite.SizeMode.CUSTOM;
    return {n,pic,ui:n.getComponent(cc.UITransform),key:''};
  }
  function state(z){return gardenChallengeArmor.state(z);}
  function bone(arm,names){
    for(const name of names){const b=arm?.getBone(name);if(b)return b;}
    return null;
  }
  // The first slot is the solid part that actually carries the helmet, including
  // during recoil. The height is the contact line, as a fraction of that part.
  const cuts={
    melon:[/^body$/,.82,.02,1.24],gatling:[/^head$/,.83,-.03,1.52],
    prism:[/^face$/,.80,-.01,1.47],medic:[/^face[LR]$/,.83,0,1.23],
    cabbage:[/^face$/,.84,-.01,1.28],butter:[/^main$/,.90,-.04,1.27],
    coconut:[/^body$/,.84,-.11,1.16],chain:[/^head$/,.71,0,1.44],
    bulwark:[/^body_front$/,.79,.03,1.35],apple:[/^(?:head|hairB|hairM_D|hairM_U)$/,.87,0,1.16]
  };
  const restingPitch={melon:-7,gatling:-3,prism:8,medic:5,cabbage:-5,butter:4,coconut:-7,chain:9,bulwark:-4,apple:5};
  const armFront=/arm|hand|shoulder|sleeve/i,here=/here|_R(?:_|$)|Right/i;
  const faceSlot=/head|jaw|eye|hair|brow|teeth|tongue|poisonface/i;
  const frontLeaf=/^hairR_F$|^mouth|^gunTube/i;
  function spriteSlot(p){
    return {p,_localVertices:[],_indices:[0,1,2,1,3,2],_matrix:new cc.Mat4(),_worldMatrix:new cc.Mat4(),
      _visible:true,_displayData:true,_color:new cc.Color(255,255,255,255),_blendMode:0,
      getTexture(){return this.p.pic.spriteFrame?.texture;}};
  }
  function updateSlot(s,inv){
    const p=s.p,f=p.pic.spriteFrame,r=f.rect,w=p.ui.width,h=p.ui.height,t=f.texture;
    if(s.frame!==f||s.width!==w||s.height!==h){
      const l=r.x/t.width,b=(r.y+r.height)/t.height,u=(r.x+r.width)/t.width,a=r.y/t.height;
      s._localVertices=[-w/2,-h/2,l,b,w/2,-h/2,u,b,-w/2,h/2,l,a,w/2,h/2,u,a];s.frame=f;s.width=w;s.height=h;
    }
    cc.Mat4.multiply(s._matrix,inv,p.n.worldMatrix);
  }
  // Submit clothing between the original DragonBones slots during rendering
  // only. Animation, skin changes, detachable hands and pool cleanup keep their
  // original slot array and untouched body parts throughout their lifetimes.
  function unbind(pass){
    if(pass?.db?.isValid&&pass.db._assembler===pass.layer)pass.db._assembler=pass.original;
  }
  function bind(e,key,db){
    const last=e[key];if(last&&last.db===db&&db?._assembler===last.layer)return;
    unbind(last);e[key]=null;
    const original=db?._assembler;
    if(!original?.updateRenderData||db.isAnimationCached?.())return;
    const layer=Object.create(original),pass={db,layer,original,order:[],inverse:new cc.Mat4()};e[key]=pass;
    layer.updateRenderData=function(component){
      const arm=component._armature,src=arm?._slots;
      if(!src?.length||!e.root.activeInHierarchy)return original.updateRenderData.call(original,component);
      const out=pass.order;out.length=0;
      let coat=-1,back=-1,front=-1;
      const heavy=key==='bodyPass'?e.z._gardenHeavyWear:null;
      if(key==='bodyPass'){
        const torso=src.findIndex(s=>/^body$|^chest$|^torso$|^body_main$/.test(s.name));
        const near=src.findIndex((s,i)=>i>torso&&armFront.test(s.name)&&here.test(s.name));
        const head=src.findIndex((s,i)=>i>torso&&faceSlot.test(s.name));
        coat=torso>=0?torso+1:near>=0?near:Math.ceil(src.length*.55);
        back=head>=0?head:coat;
        front=near>=0?near:src.length;
      }else{
        const kind=e.z._gardenHeadWear?.kind,core=src.findIndex(s=>cuts[kind]?.[0].test(s.name));
        back=Math.max(0,core);
        // Selected near tufts, petals and boomerang blades can pass in front
        // of the brim. Facial slots render naturally as part of the main head.
        front=src.findIndex((s,i)=>i>core&&(kind==='apple'?s.name==='hairR_F':frontLeaf.test(s.name))&&s._visible&&s._displayData);
        if(front<0)front=src.length;
      }
      cc.Mat4.invert(pass.inverse,db.node.worldMatrix);
      function add(piece){
        if(!piece?.n.active||!piece.pic.spriteFrame)return;
        const slot=piece.slot||(piece.slot=spriteSlot(piece));updateSlot(slot,pass.inverse);out.push(slot);
      }
      for(let i=0;i<=src.length;i++){
        if(i===coat)add(e.pieces.vest);
        if(i===back&&(key==='plantPass'||!e.plantPass))add(e.back);
        if(i===front&&(key==='plantPass'||!e.plantPass))add(e.pieces.helmet);
        if(i<src.length){
          if(key==='bodyPass'&&e.guard&&e.pieces.helmet?.n.active&&(e.guardFace?.has(src[i])||faceSlot.test(src[i].name)))continue;
          if(key==='plantPass'&&e.z._gardenHeadWear?.kind==='gatling'&&e.pieces.helmet?.n.active&&/^helmet(?:_|$)/i.test(src[i].name))continue;
          out.push(src[i]);
          if(heavy)for(const l of heavy.limbs){
            if(!l.painter)l.painter=new RegExp('^'+(l.shin?'leg_'+l.side+'_lower':'armhand_'+l.side)+'(?:$|_HAND$)');
            if(l.painter.test(src[i].name))add(l);
          }
        }
      }
      arm._slots=out;
      try{return original.updateRenderData.call(original,component);}
      finally{arm._slots=src;}
    };
    db._assembler=layer;
  }
  function cover(part,host){
    if(!part)return;
    part.pic.enabled=!host;
  }
  function crownFit(e,rig){
    const n=rig?.crown?.getChildByName('GardenNativePlantHead'),db=n?.getComponent(cc.dragonBones.ArmatureDisplay),arm=db?.armature();
    if(!arm||!rig.liveHead?.ready||rig.detached)return null;
    const cut=cuts[rig.kind];if(!cut)return null;
    if(e.crownDb!==db){
      e.crownDb=db;e.solid=arm.getSlots().filter(s=>cut[0].test(s.name));e.relative=new cc.Mat4();e.baseInverse=new cc.Mat4();
      const m=e.solid[0]?._matrix;e.restPitch=m?Math.atan2(m.m01,m.m00):0;
    }
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    for(const s of e.solid){
      const v=s._localVertices,m=s._matrix;if(!s._visible||!s._displayData||!v?.length||!m)continue;
      for(let i=0;i<v.length;i+=4){
        const x=m.m00*v[i]+m.m04*v[i+1]+m.m12,y=m.m01*v[i]+m.m05*v[i+1]+m.m13;
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
    }
    if(x1<=x0||y1<=y0)return null;
    const mat=e.relative;cc.Mat4.invert(e.baseInverse,e.base.worldMatrix);cc.Mat4.multiply(mat,e.baseInverse,n.worldMatrix);
    const x=(x1+x0)/2+(x1-x0)*cut[2],y=y0+(y1-y0)*cut[1];
    const scale=Math.hypot(mat.m00,mat.m01),width=clamp((x1-x0)*scale*cut[3],84*e.size,177*e.size);
    const axis=e.solid[0]._matrix,delta=(Math.atan2(axis.m01,axis.m00)-e.restPitch)*180/Math.PI;
    const crownPitch=restingPitch[rig.kind]-clamp((delta+540)%360-180,-26,26)*.78;
    return {db,x:mat.m00*x+mat.m04*y+mat.m12,y:mat.m01*x+mat.m05*y+mat.m13,width,
      angle:Math.atan2(-mat.m01,-mat.m00)*180/Math.PI+crownPitch};
  }
  function fit(z){
    const arm=z.db?.armature?.(),base=z.db?.node;if(!base?.isValid)return null;
    const helmet=bone(arm,['armorSOCKET','armorSocket','ArmorSocket','helmetSOCKET']);
    const head=bone(arm,['head','Head','HEAD','head_main','head_mid','head_root','head_ROOT']);
    const chest=bone(arm,['body','Body','BODY','torso','chest','body_main','body_root','body_ROOT','upperBody','butt']);
    const eyes=bone(arm,['eyes','poisonSOCKET','poisonSocket','head_jaw']);
    const shoulder=bone(arm,['arm_here','armRoot_here','arm_R','arm_here_root','arm_upper_R','armRight']);
    const farShoulder=bone(arm,['arm_there','armRoot_there','arm_L','arm_there_root','arm_upper_L','armLeft']);
    const h=head?.globalTransformMatrix,t=chest?.globalTransformMatrix;
    const giant=!!z.isGargantuar,large=giant||/yeti/i.test(z.Zombie_Type);
    const len=h&&t?Math.hypot(h.tx-t.tx,h.ty-t.ty):0;
    const size=clamp(len>38?len/76:large?1.55:1,large?1.23:.65,giant?2.65:large?1.8:1.42);
    const root=new cc.Node('ChallengeArmor');root.setParent(base);root.layer=base.layer;
    return {z,base,root,helmet,socket:z.armorSocket,head,chest,eyes,shoulder,farShoulder,size,large,pieces:{},revision:-1,bucket:false,
      headAngle:h?Math.atan2(h.b,h.a):0,guard:!!z.objdata?.GardenShieldguard,guardFace:new Set(z.body?.headSlots||[])};
  }
  function nativeCrest(z){return !!z.armors?.some(a=>a.health>0&&/bucket|cone|helmet/i.test(a.node?.name||''));}
  function display(p,key){if(p.key!==key){p.key=key;p.pic.spriteFrame=frames.get(key);}p.n.active=true;}
  function size(p,w,h){if(p&&(Math.abs(p.ui.width-w)>.15||Math.abs(p.ui.height-h)>.15))p.ui.setContentSize(w,h);}
  function setFrames(e,s){
    e.bucket=nativeCrest(e.z);e.guard=!!(s.shield||e.z.objdata?.GardenShieldguard);
    for(const part of parts){
      const hp=s[part];
      let p=e.pieces[part];
      if((!hp||hp.hp<=0)&&!(part==='vest'&&s.camouflage)){if(p)p.n.active=false;if(part==='helmet'&&e.back)e.back.n.active=false;continue;}
      const stage=hp.hp>hp.max*.66?0:hp.hp>hp.max*.33?1:2;
      if(!p)p=e.pieces[part]=sprite(e.root,part);
      if(part==='helmet'){
        const style=e.guard?'guardHelmet':e.bucket?'bucket':'helmet';
        const split=frames.has(style+'Back'+stage)&&frames.has(style+'Front'+stage);
        display(p,(split?style+'Front':frames.has(style+stage)?style:'helmet')+stage);
        if(split){
          if(!e.back)e.back=sprite(e.root,'helmetBack');display(e.back,style+'Back'+stage);
        }else if(e.back)e.back.n.active=false;
      }else{
        const key=part==='vest'&&s.camouflage?'camouflage':part==='vest'&&e.guard&&frames.has('guardVest'+stage)?'guardVest':part;
        display(p,key+stage);
        if(part==='door')size(p,174*e.size,174*e.size);
      }
    }
    e.revision=s.revision;
  }
  function place(p,x,y,angle){
    if(!p?.n.active)return;
    const n=p.n;
    if(Math.abs(n.position.x-x)>.08||Math.abs(n.position.y-y)>.08)n.setPosition(x,y,0);
    if(Math.abs(n.angle-angle)>.12)n.angle=angle;
  }
  function pose(e){
    const z=e.z,d=e.size;
    const a=e.helmet?.globalTransformMatrix,sock=e.socket?.position,head=e.head?.globalTransformMatrix;
    const eyes=e.eyes?.globalTransformMatrix,body=e.chest?.globalTransformMatrix,shoulder=e.shoulder?.globalTransformMatrix;
    // Body-local Y points upward in this build's DragonBones runtime. Flying
    // animations lift these bones while the plant/ground collision anchor stays put.
    const hx=a?.tx??sock?.x??head?.tx??eyes?.tx??0;
    const hy=a?.ty??sock?.y??(head?head.ty+32*d:eyes?eyes.ty+17*d:z.zombieHeight*2.7);
    const bx=body?.tx??hx+22*d,by=body?.ty??hy-95*d;
    const nx=head?.tx??hx+7*d,ny=head?.ty??hy-28*d;
    const far=e.farShoulder?.globalTransformMatrix;
    const sx=shoulder&&far?(shoulder.tx*.60+far.tx*.40):shoulder?.tx??nx,sy=shoulder&&far?(shoulder.ty+far.ty)*.50:shoulder?.ty??ny;
    const cx=bx+(sx-bx)*.50,cy=by+(sy-by)*.48;
    const tilt=clamp(Math.atan2(bx-sx,Math.max(8*d,sy-by))*180/Math.PI,-38,38);
    const p=e.pieces,rig=z._gardenHeadWear,fit=crownFit(e,rig);
    let hatX=hx-3*d,hatY=hy+11*d,hatW=145*d,hatH=hatW;
    let pitch=head?(Math.atan2(head.b,head.a)-e.headAngle)*180/Math.PI:0;
    pitch=clamp((pitch+540)%360-180,-55,55);
    if(fit){hatX=fit.x;hatY=fit.y;hatW=fit.width;hatH=hatW*.96;pitch=fit.angle;}
    else if(rig&&!rig.detached){hatY+=z._gardenPlantHelmetRise||0;}
    if(e.guard){hatX=hx-2*d;hatY=hy-5*d;hatW=166*d;hatH=185*d;}
    const haveHead=z.haveHead!==false&&!rig?.detached;
    if(p.helmet)p.helmet.n.active=haveHead&&!!(state(z)?.helmet.hp>0);
    if(e.back)e.back.n.active=!!p.helmet?.n.active&&!e.guard;
    size(p.helmet,hatW,hatH);size(e.back,hatW,hatH);
    place(p.helmet,hatX,hatY,pitch);place(e.back,hatX,hatY,pitch);
    const length=Math.hypot(sx-bx,sy-by),span=Math.abs((shoulder?.tx??sx)-(far?.tx??sx));
    const vestW=clamp((e.large?159:e.guard?143:126)*d+span*.13,(e.large?145:112)*d,(e.large?195:155)*d);
    const vestH=clamp(length*1.87,(e.guard?133:110)*d,(e.large?157:139)*d);
    size(p.vest,vestW,vestH);place(p.vest,cx-3*d,cy,tilt);
    place(p.door,nx-46*d,cy-4*d,clamp(tilt*.40,-13,13));
    bind(e,'bodyPass',z.db);bind(e,'plantPass',fit?.db);
    cover(p.vest,e.bodyPass);cover(e.back,e.bodyPass);cover(p.helmet,e.plantPass||e.bodyPass);
    if(e.guard&&z._gardenHeavyWear)for(const l of z._gardenHeavyWear.limbs)cover(l,e.bodyPass);
    if(e.plantPass)e.plantPass.db.markForUpdateRenderData();if(e.bodyPass)e.bodyPass.db.markForUpdateRenderData();
  }
  function forget(z,e){unbind(e.bodyPass);unbind(e.plantPass);if(e.root.isValid)e.root.destroy();wearers.delete(z);}
  function sync(z){
    if(!cc||!z?.node?.isValid)return;
    const s=state(z);let e=wearers.get(z);
    if(!s||z.dead||z.hypnotized){if(e)e.root.active=false;return;}
    if(!s.camouflage&&s.helmet.hp<=0&&s.vest.hp<=0&&!(s.door?.hp>0)){if(e)forget(z,e);return;}
    if(!e||e.base!==z.db?.node||!e.root.isValid||e.suit!==s){
      if(e)forget(z,e);atlas();e=fit(z);if(!e)return;e.suit=s;wearers.set(z,e);
    }
    e.root.active=true;setFrames(e,s);pose(e);
  }
  function removeChip(i){
    const p=fragments[i];if(p.n.isValid)p.n.destroy();fragments.splice(i,1);
  }
  function burst(z,part){
    if(!gardenFxSettings.enabled)return;
    const e=wearers.get(z),p=e?.pieces[part],parent=z.node?.parent;
    if(!p?.n.isValid||!parent?.isValid)return;
    const pos=parent.inverseTransformPoint(new cc.Vec3(),p.n.worldPosition);
    const scale=Math.abs(e.base.worldScale.x/parent.worldScale.x)*e.size;
    // The fixed budget limits simultaneous pieces during mass area hits.
    for(let i=0;i<3&&fragments.length<42;i++){
      const q=sprite(parent,'break/'+part);
      q.pic.spriteFrame=frames.get('chip'+part);q.ui.setContentSize((i?36:76)*scale,(i?35:68)*scale);
      q.n.setPosition(pos.x,pos.y,0);
      const dir=(i===1?1:-1)*(z.node.worldScale.x<0?-1:1);
      fragments.push({n:q.n,opacity:q.n.addComponent(cc.UIOpacity),x:pos.x,y:pos.y,age:0,
        life:.43+i*.09,vx:dir*(58+i*38)*scale,vy:(185-i*20)*scale,gravity:580*scale,spin:dir*(i?480:240)});
    }
  }
  function draw(){
    const now=performance.now(),dt=lastTime?Math.min(.15,(now-lastTime)/1000)*Math.abs(cc.director.gameSpeed||1):0;lastTime=now;
    if(!wearers.size&&!fragments.length)return;
    for(const [z,e] of wearers){
      if(!z.node?.isValid||!e.root.isValid||!z.node.activeInHierarchy||z.dead){forget(z,e);continue;}
      const s=state(z);
      if(z.hypnotized||z.displayedStuck||z.db.color?.a===0||!s){e.root.active=false;continue;}
      if(!e.root.active)e.root.active=true;
      if(e.suit!==s){sync(z);continue;}
      if(s.revision!==e.revision||e.bucket!==nativeCrest(z))setFrames(e,s);pose(e);
    }
    if(!level.gaming||ui.component?.paused)return;
    for(let i=fragments.length-1;i>=0;i--){
      const p=fragments[i];p.age+=dt;
      if(!p.n.isValid||p.age>=p.life){removeChip(i);continue;}
      const t=p.age;p.n.setPosition(p.x+p.vx*t,p.y+p.vy*t-.5*p.gravity*t*t,0);p.n.angle=p.spin*t;
      p.opacity.opacity=255*clamp((p.life-t)/.2,0,1);
    }
  }
  function clear(){for(const [z,e] of wearers)forget(z,e);while(fragments.length)removeChip(fragments.length-1);lastTime=0;}
  function install(){
    if(installed)return;
    const get=n=>window.System.get('chunks:///_virtual/'+n+'.ts');cc=window.System.get(window.System.resolve('cc'));
    level=get('levelController').LevelPlay;ui=get('UI').UIInGame;installed=true;
    gardenChallengeArmor.subscribe(burst);
    cc.director.on(cc.Director.EVENT_BEFORE_DRAW,draw);
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,clear);
    gardenFxSettings.subscribe(on=>{if(!on)while(fragments.length)removeChip(fragments.length-1);});
  }
  return {install,sync,clear};
})();
