// All figures are board cells, game seconds and plant health points.
const gardenTitanRockets = (() => {
  const entries = [
    {id:'blast', name:'高爆', light:'#ffd596', main:'#ff9853', dark:'#913e34'},
    {id:'frost', name:'液氮', light:'#dcfbff', main:'#68e2ff', dark:'#217098'},
    {id:'venom', name:'神经毒素', light:'#e7faaa', main:'#9bd65a', dark:'#496842'},
    {id:'ember', name:'燃烧', light:'#ffeeb4', main:'#ff665b', dark:'#972e4e'}
  ];
  const lookup = name => window.System.get('chunks:///_virtual/'+name+'.ts');
  const tau = 2*Math.PI;
  const battles = new WeakMap(), frames = new Map();
  const validPlant = p => p?.node?.activeInHierarchy && !p.dead && p.health>0 && !p.invincible && !p.fooding &&
    p.damagable!==false && p.plantInLnC?.isInLawn?.();
  const plants = () => lookup('CharacterManager').PlantPool.pool().filter(validPlant);
  const cell = p => ({r:p.plantInLnC.lIndex,c:p.plantInLnC.cIndex});
  const gap = (a,b) => Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
  const damage = (p,n) => {if(validPlant(p))p.dealDamage(n*gardenChallenge.modifiers.damage,0);};
  const destroy = node => {if(node?.isValid)node.destroy();};
  const fx = () => gardenFxSettings.enabled;
  const disabled = z => z.hypnotized || z.freeze>0 || z.stunned>0 || z.butterStun>0 || z.knockBackTween?.running;

  function path(g,d,fill,stroke,width=2) {
    const shape=new Path2D(d);
    if(fill){g.fillStyle=fill;g.fill(shape);}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(shape);}
  }
  function oval(g,x,y,a,b,fill,stroke,width=2){
    g.beginPath();g.ellipse(x,y,a,b,0,0,tau);
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function gradient(g,x,y,u,v,colors){
    const fill=g.createLinearGradient(x,y,u,v);
    colors.forEach((c,i)=>fill.addColorStop(i/(colors.length-1),c));return fill;
  }
  function emblem(g,id,stroke){
    const shapes={
      blast:'M0 -11 L3 -4 10 -7 6 0 12 3 4 5 1 12 -3 5 -10 8 -6 0 -12 -3 -4 -4Z',
      frost:'M0 -12V12 M-10 -6 10 6 M-10 6 10 -6 M-4 -9 0 -6 4 -9 M-4 9 0 6 4 9',
      venom:'M0 -11 C-2 -6 -8 -1 -8 4 A8 8 0 0 0 8 4 C8 0 3 -7 0 -11Z M-4 3 Q-3 7 0 7',
      ember:'M-6 10 Q-13 5 -7 -3 L-5 1 Q-3 -4 0 -13 3 -6 4 -3 L7 -6 Q15 4 6 10 Q7 4 1 1 2 7 -2 10Z'
    };
    path(g,shapes[id],id==='blast'?stroke:null,stroke,1.9);
  }
  function drawPack(g){
    const dark='#142632',rim='#91a9aa';
    const housing=gradient(g,-50,-56,41,50,['#b2c5bf','#465c68','#1a2b3e','#536169']);
    path(g,'M-47 -36 L-24 -56 22 -49 48 -24 53 22 36 48 5 55 -38 37 -49 12Z',housing,dark,4);
    path(g,'M21 -48 48 -23 52 21 35 47 27 28 32 11Z','#263947',rim,1.8);
    path(g,'M-27 28 17 29 29 43 7 52 -23 40Z','#283b45',dark,2);
    for(let i=0;i<6;i++){
      const x=31+i*2.2,y=-19+i*6;
      path(g,'M'+x+' '+y+'l9 5 -1 4 -9 -5Z','#101e29','#718281',1);
    }
    for(let i=0;i<4;i++){
      const paint=entries[i],x=-27+(i%2)*25+Math.floor(i/2)*8,y=-29+Math.floor(i/2)*24+(i%2)*4;
      g.save();g.translate(x,y);g.rotate(-.27);
      const shell=gradient(g,-12,-12,14,12,['#9daaa7','#536b78','#253a4d','#56636a']);
      path(g,'M-12 -10 -5 -17 23 -9 29 8 17 17 -12 9Z',shell,dark,2.6);
      path(g,'M-4 -15 17 -9 22 -4 1 -10Z','#b5c7bc',null);
      oval(g,-7,-2,13.4,11.7,'#425564',dark,2.4);oval(g,-7,-2,10.3,8.9,'#182431','#cad3bd',1.7);
      oval(g,-7,-2,7.4,6.05,paint.dark,null);oval(g,-7,-2,4.5,3.5,paint.main,null);
      oval(g,-8,-3,2.1,1.6,paint.light,null);g.restore();
    }
    path(g,'M-44 17 -36 14 5 30 4 37 -4 39 -39 25Z','#566c74','#24323c',2.5);
    for(let i=0;i<4;i++){
      const x=-31+i*7,y=20+i*2.9; path(g,'M'+x+' '+y+'l4 1.3 -2 4 -4 -1.4Z',i===2?'#f7d993':'#eba753',null);
    }
    for(const [x,y] of [[-31,34],[6,45],[37,21],[23,-35]])
      {oval(g,x,y,2.5,2.2,'#9baca9',dark,1.4);path(g,'M'+(x-1)+' '+(y+1)+'l2 -2',null,'#263847',1);}
  }
  function drawSprite(g,kind,paint){
    g.lineJoin='round';g.lineCap='round';
    if(kind==='pack'){drawPack(g);return;}
    if(kind==='shell'){
      path(g,'M-38 -3 -54 -10 -47 -2 -61 1 -47 6 -55 11 -34 5Z',paint.main,null);
      path(g,'M-35 -3 -49 0 -36 3Z',paint.light,null);
      path(g,'M-31 -6 -40 -14 -28 -13 -17 -8 Q4 -16 21 -9 L41 0 22 10 Q3 14 -18 8 L-30 13 -39 13 -32 6Z',
        gradient(g,0,-13,0,13,['#d1e1db','#728a96','#263b51',paint.dark]),'#1a2936',2.7);
      path(g,'M13 -10 Q20 -1 13 10 L20 9 Q26 0 20 -9Z',paint.main,paint.dark,1.4);
      path(g,'M-17 -8 Q-2 -13 12 -9',null,paint.light,2.1);
      g.scale(.6,.6);emblem(g,paint.id,paint.light);
    }else if(kind==='reticle'){
      oval(g,0,0,48,46,paint.dark+'40','#152835',3);oval(g,0,0,48,46,null,paint.main,2);
      for(let i=0;i<4;i++){
        g.save();g.rotate(i*tau/4);
        path(g,'M-17 -51 -10 -55 10 -55 17 -51 M0 -48V-33',null,paint.light,3);g.restore();
      }
      oval(g,0,0,18,18,'#182f37ca',paint.main,1.8);emblem(g,paint.id,paint.light);
    }else{
      const bloom=g.createRadialGradient(0,0,3,0,0,57);
      bloom.addColorStop(0,paint.light);bloom.addColorStop(.35,paint.main+'a8');bloom.addColorStop(1,paint.main+'00');
      oval(g,0,0,58,57,bloom,null);
      if(paint.id==='frost'){
        for(let i=0;i<9;i++){
          g.save();g.rotate(i*tau/9+.11*Math.sin(i*7));
          const length=34+(i*13%25);
          path(g,'M-4 -9 -7 -24 -1 -'+length+' 6 -23 4 -8Z',paint.main,paint.light,1.2);
          path(g,'M-1 -'+length+' 0 -15 5 -23Z',paint.dark,null);
          path(g,'M9 -30 12 -38 16 -34 13 -27Z',paint.light,null);g.restore();
        }
      }else if(paint.id==='venom'){
        for(let i=0;i<12;i++){
          const angle=i*tau/12,dist=23+(i*7%19),r=7+i*5%9,x=Math.cos(angle)*dist,y=Math.sin(angle)*dist;
          const cloud=g.createRadialGradient(x-2,y-3,1,x,y,r);
          cloud.addColorStop(0,paint.light+'dd');cloud.addColorStop(.65,paint.main+'bc');cloud.addColorStop(1,paint.dark+'45');
          oval(g,x,y,r,r*.88,cloud,paint.main+'95',1.2);oval(g,x-2,y-r*.48,r*.28,r*.12,paint.light,null);
        }
      }else if(paint.id==='ember'){
        for(let i=0;i<9;i++){
          g.save();g.rotate(i*tau/9);
          const length=41+(i*11%17);
          path(g,'M-8 -8 Q-19 -26 -3 -38 Q-6 -29 -1 -27 Q7 -40 3 -'+length+' Q19 -38 12 -23 Q16 -27 17 -30 Q20 -17 8 -9Z',
            gradient(g,0,-8,0,-length,[paint.light,paint.main,paint.dark]),null);g.restore();
        }
      }else{
        for(let i=0;i<11;i++){
          g.save();g.rotate(i*tau/11);const reach=34+(i*17%24);
          path(g,'M-4 -10 -6 -26 -1 -'+reach+' 1 -33 6 -27 4 -13Z',i%2?paint.main:paint.light,paint.dark,1.1);
          path(g,'M5 -44 10 -53 12 -50 10 -42Z',paint.light,null);g.restore();
        }
        oval(g,0,0,42,37,null,paint.light+'ad',1.9);
      }
      oval(g,0,0,18,15,paint.main,paint.light,1.7);oval(g,-2,-2,11,8,paint.light,null);
    }
  }
  function sprite(s,parent,kind,paint,w,h){
    if(!parent?.isValid)return null;
    const key=kind==='pack'?kind:kind+paint.id,cc=s.cc;
    if(!frames.has(key)){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
      const g=canvas.getContext('2d');g.translate(128,128);g.scale(1.98,1.98);drawSprite(g,kind,paint);
      const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);
      const frame=new cc.SpriteFrame();frame.texture=texture;frames.set(key,frame);
    }
    const n=new cc.Node('SnowlineTitan/'+key);n.layer=parent.layer;n.setParent(parent);
    const image=n.addComponent(cc.Sprite);image.sizeMode=cc.Sprite.SizeMode.CUSTOM;image.spriteFrame=frames.get(key);
    n.getComponent(cc.UITransform).setContentSize(w,h);return n;
  }
  function board(s){
    if(s.board?.node.isValid)return s.board;
    const sq=lookup('Square').Square,parent=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;
    const a=sq.getLnC(0,0)?.plantPoint,b=sq.getLnC(0,1)?.plantPoint,c=sq.getLnC(1,0)?.plantPoint;
    if(!parent?.isValid||!a||!b||!c)return null;
    const node=new s.cc.Node('SnowlineTitan/Volley');node.setParent(parent);node.layer=parent.layer;
    const local=p=>node.inverseTransformPoint(new s.cc.Vec3(),p.worldPosition);
    const o=local(a),col=local(b),row=local(c),w=Math.abs(col.x-o.x),h=Math.abs(row.y-o.y);
    return s.board={node,w,h,position(r,c,up=0){return [o.x+c*(col.x-o.x)+r*(row.x-o.x),o.y+c*(col.y-o.y)+r*(row.y-o.y)+up*h,0];}};
  }
  function attachPack(s,z){
    const base=z.db?.node,arm=z.db?.armature?.(),armor=base?.getChildByName('SnowlineTitan');
    if(!armor?.isValid||!arm)return null;
    const find=names=>names.map(name=>arm.getBone(name)).find(Boolean);
    const head=find(['head','Head','HEAD','head_root','head_main']);
    const chest=find(['body','Body','BODY','torso','chest','body_main','upperBody','body_root']);
    const shoulder=find(['arm_here','arm_upper_here','arm_upper_R','armRight','arm_upper_near']);
    const node=sprite(s,armor,'pack',null,1,1);
    // Render the cradle over the rear pauldron, with the faceplate and shield in front.
    node.setSiblingIndex(1);
    return {node,ui:node.getComponent(s.cc.UITransform),head,chest,shoulder};
  }
  function pose(job,z,dt){
    const pack=job.pack;if(!pack?.node.isValid)return;
    const head=pack.head?.globalTransformMatrix,chest=pack.chest?.globalTransformMatrix,arm=pack.shoulder?.globalTransformMatrix;
    const hx=head?.tx??z.armorSocket?.position?.x??-22,hy=head?.ty??z.armorSocket?.position?.y??205;
    const cx=chest?.tx??hx+30,cy=chest?.ty??hy-80;
    const d=Math.max(1.25,Math.min(2.15,Math.hypot(cx-hx,hy-cy)/65));
    const shoulderX=(cx+(arm?.tx??hx+34*d))*.5,shoulderY=(cy+(arm?.ty??hy-26*d))*.5;
    const width=136*d;
    if(Math.abs(pack.ui.width-width)>.25)pack.ui.setContentSize(width,width);
    job.kick=Math.max(0,job.kick-dt*4.2);
    const x=Math.max(hx+92*d,shoulderX+54*d),y=hy+(shoulderY-hy)*.18+30*d;
    pack.node.setPosition(x+job.kick*7*d,y-job.kick*5*d,0);
    pack.node.angle=8+job.kick*6;
  }
  function mark(s,target,paint){
    const art=board(s);if(!art)return null;
    const n=sprite(s,art.node,'reticle',paint,art.w*1.01,art.h*.79);
    n.setPosition(...art.position(target.r,target.c));return n;
  }
  function aim(s,z,job){
    const priority=new Map(),scores=new Map();
    for(const p of plants()){
      const pos=cell(p),key=pos.r*64+pos.c,{role,score}=gardenChallengeMortar.assess(p);
      if(!scores.has(key)||score>scores.get(key)){
        priority.set(key,{pos,priority:role==='output'});scores.set(key,score);
      }
    }
    const cells=[...priority.entries()].sort(([a],[b])=>scores.get(b)-scores.get(a)||Math.abs(priority.get(a).pos.r-z.lIndex)-Math.abs(priority.get(b).pos.r-z.lIndex));
    if(!cells.length)return false;
    const chosen=cells.slice(0,4);
    for(let i=0;i<4;i++){
      const paint=entries[(job.sequence+i)%4],where=chosen[i%chosen.length][1],target={...where.pos};
      job.queue.push({paint,target,priority:where.priority,mark:mark(s,target,paint)});
    }
    job.sequence=(job.sequence+1)%4;job.delay=1.65;return true;
  }
  function blast(s,shot){
    const {target,paint}=shot;
    for(const p of plants()){
      const d=gap(cell(p),target);
      if(d>1)continue;
      switch(paint.id){
        case 'blast':damage(p,d===0?122:46);break;
        case 'frost':
          damage(p,d===0?57:24);
          if(validPlant(p))p.plantCDScaleSetter(d===0?2.25:1.55,d===0?3.8:2.2);
          break;
        case 'venom':
          damage(p,d===0?43:18);
          if(validPlant(p)){
            const old=s.poison.get(p);
            const same=old&&old.life===p._gardenCombatStats&&old.cell===p.plantInLnC;
            s.poison.set(p,{cell:p.plantInLnC,life:p._gardenCombatStats,pulses:4,
              next:same?old.next:1,damage:same?Math.max(old.damage,d===0?28:12):(d===0?28:12)});
          }
          break;
        case 'ember':damage(p,d===0?67:25);break;
      }
    }
    if(paint.id==='ember'){
      const key=target.r*64+target.c,existing=s.fires.get(key);
      s.fires.set(key,{target,pulses:5,next:existing?.next??.8,mark:existing?.mark??mark(s,target,paint)});
    }
    const a=s.board;
    if(fx()&&a?.node.isValid){
      const node=sprite(s,a.node,'burst',paint,a.w*2.3,a.h*2.1);
      node.setPosition(...a.position(target.r,target.c,.22));s.bursts.push({node,opacity:node.addComponent(s.cc.UIOpacity),age:0});
    }
  }
  function launch(s,z,job){
    const pending=job.queue.shift(),a=board(s),target=pending.target;
    const origin={r:z.lIndex,c:z.inLnC?.cIndex??z.cIndex??target.c+3};
    const shell={...pending,origin,position:{...origin,height:1.6},progress:0,elapsed:0,duration:1.25+Math.min(9,gap(origin,target))*.065,
      sprite:a?sprite(s,a.node,'shell',pending.paint,a.w*.83,a.h*.63):null};
    s.shells.add(shell);gardenInterceptors.track(s.level,shell);
    job.kick=1;job.delay=job.queue.length ? .28 : 6.8;
  }
  function advanceShell(s,shell,dt){
    shell.elapsed+=dt;const t=Math.min(1,shell.elapsed/shell.duration),a=s.board,old=shell.position;
    const height=(1-t)*1.65+4*t*(1-t)*1.12;
    const u=Math.min(1,(t-shell.progress)/Math.max(.00001,1-shell.progress));
    shell.position={r:old.r+(shell.target.r-old.r)*u,c:old.c+(shell.target.c-old.c)*u,height};
    shell.progress=t;
    const stopped=gardenInterceptors.step(s.level,shell,t);
    if(stopped||t===1){
      destroy(shell.sprite);destroy(shell.mark);s.shells.delete(shell);
      if(!stopped)blast(s,shell);
      return;
    }
    if(a?.node.isValid&&shell.sprite?.isValid){
      const p=shell.position,n=a.position(p.r,p.c,p.height),o=a.position(old.r,old.c,old.height);
      shell.sprite.setPosition(...n);shell.sprite.angle=Math.atan2(n[1]-o[1],n[0]-o[0])*180/Math.PI;
      shell.mark?.setPosition(...a.position(shell.target.r,shell.target.c));
    }
  }
  function burnAndPoison(s,dt){
    for(const [p,status] of s.poison){
      if(!validPlant(p)||p.plantInLnC!==status.cell||p._gardenCombatStats!==status.life){s.poison.delete(p);continue;}
      status.next-=dt;
      while(status.next<=1e-6&&status.pulses>0){damage(p,status.damage);status.pulses--;status.next+=1;}
      if(!status.pulses)s.poison.delete(p);
    }
    for(const [key,fire] of s.fires){
      fire.next-=dt;
      while(fire.next<=1e-6&&fire.pulses>0){
        for(const p of plants()){const distance=gap(cell(p),fire.target);if(distance<=1)damage(p,distance===0?28:9);}
        fire.pulses--;fire.next+=.8;
      }
      if(!fire.pulses){destroy(fire.mark);s.fires.delete(key);}
    }
    for(let i=s.bursts.length-1;i>=0;i--){
      const b=s.bursts[i];b.age+=dt;const t=b.age/.42;
      if(t>=1||!fx()){destroy(b.node);s.bursts.splice(i,1);continue;}
      b.node.setScale(.58+t*.62,.58+t*.62,1);b.opacity.opacity=Math.round(255*(1-t*t));
    }
  }
  function dropQueue(job){for(const shot of job.queue)destroy(shot.mark);job.queue.length=0;}
  function clear(s){
    for(const job of s.jobs.values()){destroy(job.pack?.node);dropQueue(job);}
    s.jobs.clear();s.shells.clear();s.poison.clear();s.fires.clear();s.bursts.length=0;destroy(s.board?.node);battles.delete(s.level);
  }
  function tick(level,dt,titans){
    let s=battles.get(level);
    if(!gardenChallenge.active(level)||level.gameWon||level.gameLost||level.gameOver){if(s)clear(s);return;}
    if(!level.gaming||!(dt>0)||lookup('UI').UIInGame.component?.paused)return;
    if(!s){
      const cc=window.System.get(window.System.resolve('cc'));
      s={level,cc,jobs:new Map(),shells:new Set(),poison:new Map(),fires:new Map(),bursts:[],board:null};
      battles.set(level,s);cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,()=>clear(s));
    }
    const live=new Set(titans);
    for(const [z,job] of s.jobs)if(!live.has(z)){dropQueue(job);destroy(job.pack?.node);s.jobs.delete(z);}
    burnAndPoison(s,dt);
    for(const shell of s.shells)advanceShell(s,shell,dt);
    for(const z of live){
      if(z.hypnotized||z.dead||!z.node?.activeInHierarchy)continue;
      let job=s.jobs.get(z);
      if(!job){job={delay:2.8+(z.lIndex%3)*.65,kick:0,sequence:0,queue:[],pack:null};s.jobs.set(z,job);}
      if(!job.pack)job.pack=attachPack(s,z);
      pose(job,z,dt);
      if(disabled(z)){
        if(job.queue.length){dropQueue(job);job.delay=2.4;}
        continue;
      }
      job.delay-=dt;
      if(job.delay>1e-6)continue;
      if(job.queue.length){launch(s,z,job);continue;}
      if(!aim(s,z,job))job.delay=.55;
    }
  }
  return Object.freeze({tick});
})();
