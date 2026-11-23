const gardenAirArt=(()=>{
  const tau=Math.PI*2,states=new WeakMap(),frames=new Map();
  const outlines={
    f22:'M99 0 L52 -8 33 -15 -7 -61 -30 -67 -22 -33 -52 -28 -70 -43 -85 -43 -78 -20 -90 -15 -93 -5 -82 0 -93 5 -90 15 -78 20 -85 43 -70 43 -52 28 -22 33 -30 67 -7 61 33 15 52 8Z',
    f35:'M95 0 Q73 -9 46 -15 L28 -17 0 -47 -32 -55 -53 -50 -32 -19 -59 -23 -74 -34 -84 -31 -80 -12 -95 -7 -95 7 -80 12 -84 31 -74 34 -59 23 -32 19 -53 50 -32 55 0 47 28 17 46 15 Q73 9 95 0Z',
    fortress:'M101 0 Q97 -13 67 -21 L38 -25 3 -55 -58 -78 -83 -71 -66 -54 -31 -38 -47 -30 -83 -41 -98 -29 -81 -19 -91 -12 -97 -5 -97 5 -91 12 -81 19 -98 29 -83 41 -47 30 -31 38 -66 54 -83 71 -58 78 3 55 38 25 67 21 Q97 13 101 0Z'
  };
  const paints={
    f22:['#1d434e','#627f80','#a8c7bc','#def1d6','#50c6b9','#ffe0a0'],
    f35:['#353c50','#72788b','#a5afb5','#e4e3cb','#c4a5d4','#dbf7f1'],
    fortress:['#383c37','#807e5f','#b4ae79','#ead7a2','#e9ab56','#a3edef']
  };
  function path(g,d,fill,ink=null,w=1){
    const p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p);}if(ink){g.strokeStyle=ink;g.lineWidth=w;g.stroke(p);}
  }
  function ellipse(g,x,y,rx,ry,fill,ink=null,w=1){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,tau);if(fill){g.fillStyle=fill;g.fill();}if(ink){g.strokeStyle=ink;g.lineWidth=w;g.stroke();}
  }
  function grad(g,x,y,xx,yy,...colors){
    const v=g.createLinearGradient(x,y,xx,yy);colors.forEach((c,i)=>v.addColorStop(i/(colors.length-1),c));return v;
  }
  function nozzle(g,x,y,length,p){
    path(g,`M${x+length} ${y-6} Q${x+6} ${y-11} ${x-1} ${y-5} L${x-4} ${y+5} Q${x+9} ${y+10} ${x+length} ${y+6}Z`,grad(g,0,y-9,0,y+8,p[2],p[0],p[1]),p[0],1.6);
    for(let i=0;i<3;i++)path(g,`M${x+2+i*3} ${y-5.2} l-1.5 11`,null,i===0?p[5]:p[2],1.25);
    ellipse(g,x-2,y,2.8,4.2,p[5]);
  }
  function aircraft(g,type,shadow=false,tier=1){
    const p=paints[type],sil=outlines[type];g.lineJoin='round';g.lineCap='round';
    if(shadow){path(g,sil,'#1c3c40');return;}
    path(g,sil,grad(g,-23,-63,10,61,p[2],p[3],p[1],p[2]),p[0],3);
    for(const k of [-1,1]){
      g.save();g.scale(1,k);
      if(type==='f22'){
        path(g,'M36 -12 L-10 -59 -27 -65 -2 -26 -43 -17 -54 -13 12 -9Z',grad(g,-16,-61,3,-8,p[1],p[2],p[0]),p[0],1.3);
        path(g,'M-27 -62 L-13 -56 -4 -47 -14 -48Z',p[4]);path(g,'M-74 -39 L-58 -22 -73 -16 -81 -39Z',p[1],p[0],1.3);
        path(g,'M-55 -11 L-40 -27 -26 -31 -38 -11Z',p[2],p[0],1.2);
        path(g,'M26 -8 L-2 -23 -22 -19 -6 -12Z',p[0]);path(g,'M-27 -32 L-11 -39 -4 -36 M-52 -18 L-29 -21',null,p[3],1.2);
        nozzle(g,-83,-9,33,p);
      }else if(type==='f35'){
        path(g,'M36 -12 L1 -44 -30 -52 -49 -48 -20 -26 0 -15Z',grad(g,-19,-52,10,-8,p[2],p[1],p[0]),p[0],1.3);
        path(g,'M-47 -47 L-32 -51 -18 -46 -30 -43Z',p[4]);path(g,'M-70 -29 L-54 -22 -63 -15 -79 -17 -80 -28Z',p[1],p[0],1.3);
        path(g,'M25 -12 L12 -21 -8 -23 -1 -12Z',p[0]);path(g,'M-23 -16 L-57 -28 -49 -15 -36 -10Z',p[2],p[0],1.3);
        path(g,'M-25 -45 L-4 -38 M-39 -41 L-23 -39',null,p[3],1);
      }else{
        path(g,'M43 -18 L7 -50 -56 -73 -79 -69 -55 -53 -6 -37 -26 -26Z',grad(g,-30,-75,0,-15,p[2],p[1],p[0]),p[0],2);
        path(g,'M-77 -67 L-56 -71 -30 -61 -46 -60Z',p[4]);path(g,'M-57 -35 L-81 -38 -93 -29 -75 -22 -49 -25Z',p[1],p[0],1.7);
        for(const [x,y] of [[-45,-45],[-25,-28]]){
          path(g,`M${x+26} ${y} q-10 -12 -33 -8 l-4 11 q26 9 37 -3Z`,p[2],p[0],1.4);nozzle(g,x-13,y,26,p);}
        for(let j=0;j<4;j++)path(g,`M${-53+j*10} ${-60+j*3.3} l8 3`,null,p[3],1.1);
        ellipse(g,29,-19,6,4,p[0],p[4],1);ellipse(g,30,-20,2.2,1.5,p[5]);
      }
      g.restore();
    }
    if(type==='f35')nozzle(g,-89,0,54,p);
    path(g,type==='fortress'?'M98 0 Q66 -21 25 -19 L-48 -13 -72 -5 -72 5 -48 13 25 19 Q66 21 98 0Z':'M93 0 Q63 -9 30 -8 L-27 -10 -62 -5 -66 0 -61 5 -27 10 30 8 Q63 9 93 0Z',
      grad(g,0,-17,0,18,p[3],p[2],p[1],p[0]),p[0],1.6);
    if(type==='fortress'){
      path(g,'M63 -11 Q85 -8 90 0 83 8 63 11 L47 7 43 -6Z',grad(g,46,-10,81,11,'#e1f3cb','#77b4a5','#30595c'),p[0],2);
      path(g,'M57 -9 L63 9 M70 -10 L74 8 M80 -7 L82 5',null,p[0],2);
      for(let i=0;i<3;i++){const x=-28+i*20;ellipse(g,x,0,7.5,6,p[0],p[4],1.7);ellipse(g,x-.8,-1.3,3,2.5,p[5]);}
    }else{
      const glass=type==='f35'?['#f4e3ca','#bb958e','#66597d']:['#fff0aa','#c5a65c','#597773'];
      path(g,'M54 0 Q42 -8 28 -7 L17 -3 16 3 27 7 Q43 8 54 0Z',grad(g,22,-8,48,8,...glass),p[0],1.7);
      path(g,'M31 -5 Q38 -6 46 -2',null,'#fff3d6',1.2);
      path(g,'M-49 -2 L-19 -3 -8 0 -32 2Z',p[2]);
    }
    // Re-drawn silhouettes after the USAF formation photographs. The cockpit,
    // shoulders and exhausts remain legible when reduced to a dispatch icon.
    if(type==='f22'||type==='f35'){
      const twin=type==='f22';
      for(const side of [-1,1]){
        g.save();g.scale(1,side);
        const skin=twin?'M24 -10 L9 -19 -6 -26 -21 -24 -15 -18 5 -11Z':'M33 -12 L19 -20 1 -26 -7 -24 -1 -18 13 -14Z';
        path(g,skin,grad(g,14,-26,3,-11,'#e0e3d3',p[1],p[0]),p[0],1);
        path(g,twin?'M11 -15 L-7 -22 -20 -22 -14 -18Z':'M25 -16 L7 -23 -4 -23 4 -18Z','#253d46');
        path(g,twin?'M-7 -41 L-13 -53 -24 -62 M-20 -56 L-14 -52':'M-12 -42 L-30 -48 -43 -47 M-25 -43 L-20 -42',null,'#d5d9cd',1.4);
        path(g,twin?'M-34 -14 L-52 -17 -63 -12 -49 -9Z':'M-28 -14 L-42 -17 -48 -13 -36 -10Z','#364954',p[2],.9);
        g.restore();
      }
      if(twin){
        for(const y of [-7,7]){path(g,'M-85 '+(y-3)+' l11 0 -3 6 -10 0Z','#233a42','#aabdb9',1);path(g,'M-85 '+y+' l7 0',null,p[5],1.2);}
      }else{
        ellipse(g,-86,0,4,6,'#26323d','#9a94ab',1.1);ellipse(g,-85,-.4,1.6,3.7,'#dfa575');
      }
      path(g,twin?'M14 -4 Q3 -6 -9 -4 L-20 -2 -4 -1Z':'M15 -6 Q-2 -10 -13 -6 L-23 -2 1 -2Z',grad(g,-8,-7,1,0,p[2],p[1]),p[0],.85);
      path(g,'M23 1 Q32 4 41 1 M58 -1 L82 0',null,p[3],1.15);
    }else path(g,'M57 -.9 L83 0',null,p[3],1.2);
    if(tier>=6)for(const side of [-1,1]){
      g.save();g.scale(1,side);
      const x=type==='fortress'?-49:type==='f35'?-30:-14,y=type==='fortress'?-55:type==='f35'?-43:-48;
      path(g,`M${x-11} ${y+1} q11 -8 27 7 l-6 3 q-9 -7 -21 -7Z`,p[0],p[4],1.45);
      ellipse(g,x+2,y+1,3.5,2,p[5]);if(tier>=7){
        path(g,`M${x-9} ${y+7} l13 2 7 6 -13 -2Z`,p[4],p[0],.9);
        ellipse(g,x+7,y+9,2.4,1.6,'#fff6c9');}
      g.restore();}
  }
  function draw(canvas,mini=false,level=1){
    const w=mini?156:920,h=mini?124:430;canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');
    const place=(type,x,y,s,ang)=>{g.save();g.translate(x,y);g.rotate(ang);g.scale(s,s*.88);
      g.shadowColor='#133432a0';g.shadowBlur=mini?3:11;g.shadowOffsetY=mini?2:13;path(g,outlines[type],'#3e5c55');
      g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';aircraft(g,type,false,level);g.restore();};
    if(mini){place('fortress',68,61,.54,-.45);place('f22',112,91,.29,-.45);place('f35',38,27,.27,-.45);return;}
    g.fillStyle=grad(g,0,0,w,h,'#173c4d','#3e737a','#a2ad8d');g.fillRect(0,0,w,h);
    const sun=g.createRadialGradient(715,100,10,715,100,470);sun.addColorStop(0,'#f1d99885');sun.addColorStop(.45,'#d5d8b032');sun.addColorStop(1,'#abcbb000');g.fillStyle=sun;g.fillRect(0,0,w,h);
    // Below the formation, winding garden beds leave scale cues without labels.
    path(g,'M0 323 Q110 272 210 311 T430 315 T631 275 T920 227 L920 430 0 430Z','#658e8070');
    path(g,'M0 388 Q150 301 321 363 T600 329 T920 286 L920 430 0 430Z','#557f7869');
    for(const [x,y] of [[202,107],[607,296]]){g.save();g.translate(x,y);g.rotate(-.36);
      const vapor=grad(g,-185,0,6,0,'#c9e4cf00','#dce7c738','#e9e9cf7a');
      path(g,'M-188 -5 Q-84 -10 0 -4 Q-80 -4 -185 4Z',vapor);
      path(g,'M-160 14 Q-68 1 -2 6 Q-68 8 -160 18Z',vapor);g.restore();}
    for(let i=0;i<23;i++){
      const x=(i*347+67)%w,y=268+((i*61)%136);
      path(g,`M${x} ${y} q13 -5 28 -4 m4 -1 8 0`,null,'#e2d9a51e',1.3);}
    for(const [x,y,k] of [[75,157,1],[710,338,.9],[280,22,.56]]){
      g.save();g.translate(x,y);g.scale(k,k);path(g,'M-141 19 Q-88 10 -75 -3 Q-43 -22 -15 -9 Q7 -35 51 -23 Q76 -20 87 -10 Q120 -13 145 2 Q116 6 99 7 Q34 6 -15 19Z','#d3e1cb47');g.restore();}
    for(const [x,y,rx] of [[421,325,155],[410,326,103],[174,206,64]])ellipse(g,x,y,rx,rx*.19,null,'#c2dbc15c',.8);
    for(let i=0;i<Math.min(level,7);i++){g.save();g.translate(799+i*13,381);path(g,'M0 0 l6 -7 5 0 -6 7Z',i>=5?'#afe9e1':'#f0d99f');g.restore();}
    place('fortress',467,190,1.85,-.35);place('f22',659,294,1.07,-.38);place('f35',244,103,1.03,-.38);
  }
  function drawBadge(canvas,type){
    canvas.width=152;canvas.height=116;const g=canvas.getContext('2d'),p=paints[type];
    const tilt=type==='fortress'?-.28:type==='f35'?-.61:-.46;
    g.translate(76,58);g.rotate(tilt);
    const scale=type==='fortress'?.67:.72;g.scale(scale,scale*.82);
    // A contrasting rim separates the wings from the muted HUD and lawn.
    path(g,outlines[type],p[1],'#122831',7);path(g,outlines[type],null,p[3],4);
    aircraft(g,type);
  }
  function glyph(g,k){
    const [model,tier]=k.split('@');
    if(outlines[model]){aircraft(g,model,false,Number(tier)||1);return;}if(k.startsWith('s-')){aircraft(g,k.slice(2),true);return;}
    if(k==='tracer'){path(g,'M-96 0 L73 -5 97 0 71 5Z',grad(g,-96,0,96,0,'#f5ab5200','#f8c560','#fff5b8'));return;}
    if(k==='guided'||k==='ember'||k==='cluster'){
      const c=k==='guided'?['#8af1df','#47a9ae','#e4ffea']:k==='ember'?['#ffb177','#da673c','#fff1b4']:['#f7da83','#b78a44','#fff3b5'];
      path(g,'M-68 0 Q-47 -13 -25 -7 L-32 -20 -20 -17 -5 -8 Q23 -19 55 0 Q24 17 -5 8 L-20 17 -32 20 -25 7 Q-51 12 -68 0Z',grad(g,-68,0,55,0,c[0]+'00',c[1],c[2]),'#35454c',1.7);
      path(g,'M0 -5 Q11 -10 28 -6',null,c[2],2.5);return;
    }
    const ember=k==='fire',fort=k==='fort',cluster=k==='scatter',pal=ember?'#fb9860':fort?'#f2d582':cluster?'#f6bd65':'#8fe9df';
    const r=fort?68:54;for(let i=0;i<(fort?12:8);i++){
      g.save();g.rotate(i*tau/(fort?12:8));path(g,`M-5 -17 Q-6 -31 0 -${i%2?r:r*.71} Q5 -28 7 -18Z`,pal,null);g.restore();}
    for(const [rad,a] of [[39,.42],[50,.18]]){g.globalAlpha=a;ellipse(g,0,0,rad,rad,null,pal,3);g.globalAlpha=1;}
    ellipse(g,0,0,22,19,pal);ellipse(g,-2,-3,12,10,'#fff5c3');
  }
  function atlas(cc){
    if(frames.size)return;
    const types=Object.keys(outlines),kinds=[...types,...types.flatMap(k=>[k+'@6',k+'@7']),...types.map(k=>'s-'+k),'tracer','guided','cluster','ember','hit','scatter','fire','fort'];
    const size=256,cols=4,canvas=document.createElement('canvas');canvas.width=size*cols;canvas.height=size*Math.ceil(kinds.length/cols);const g=canvas.getContext('2d');
    kinds.forEach((k,i)=>{g.save();g.translate((i%cols+.5)*size,(Math.floor(i/cols)+.5)*size);g.scale(1.18,1.18);glyph(g,k);g.restore();});
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);
    kinds.forEach((k,i)=>{const f=new cc.SpriteFrame();f.texture=texture;f.rect=new cc.Rect(i%cols*size,Math.floor(i/cols)*size,size,size);frames.set(k,f);});
  }
  function view(s){
    let a=states.get(s);if(a?.root.isValid)return a;
    const sq=s.square,back=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;if(!back?.isValid)return null;
    const cc=window.System.get(window.System.resolve('cc'));atlas(cc);if(detail())gardenAirImpactArt.warm(cc);
    const root=new cc.Node('GardenAir/Wing');root.setParent(back);root.layer=back.layer;
    const local=(r,c)=>root.inverseTransformPoint(new cc.Vec3(),sq.getLnC(r,c).plantPoint.worldPosition);
    const o=local(0,0),x=local(0,1),y=local(1,0),w=Math.abs(x.x-o.x),h=Math.abs(y.y-o.y);
    a={cc,root,w,h,ships:new Map(),fx:[],serial:0,cueKeys:new Set(),clock:()=>s.time,at:(r,c,up=0)=>({x:o.x+c*(x.x-o.x)+r*(y.x-o.x),y:o.y+c*(x.y-o.y)+r*(y.y-o.y)+up*h})};
    states.set(s,a);return a;
  }
  function node(a,name,k,w,h,opacity=255){
    const {cc,root}=a,n=new cc.Node('GardenAir/'+name);n.setParent(root);n.layer=root.layer;
    const sprite=n.addComponent(cc.Sprite);sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;sprite.spriteFrame=typeof k==='string'?frames.get(k):k;
    n.getComponent(cc.UITransform).setContentSize(w,h);const alpha=n.addComponent(cc.UIOpacity);alpha.opacity=opacity;return {n,alpha,sprite};
  }
  function detail(){return typeof gardenFxSettings==='undefined'||gardenFxSettings.enabled;}
  const set=(e,p)=>e.n.setPosition(p.x,p.y,0),destroy=e=>{if(e?.n?.isValid)e.n.destroy();};
  function slot(a,priority){
    if(a.fx.length<32)return true;
    // Prefer keeping a fresh impact over spent smoke, tracers, or distant empty lanes.
    let index=-1,least=Infinity;
    for(let i=0;i<a.fx.length;i++){const e=a.fx[i],score=e.priority-(e.age/e.life)*.8;
      if(score<least){least=score;index=i;}}
    if(index<0||least>=priority)return false;
    destroy(a.fx[index]);a.fx.splice(index,1);return true;
  }
  function fx(a,k,w,h,life,fn,priority=1,frame=k){
    if(!slot(a,priority))return;
    const e=node(a,k,frame,w,h);Object.assign(e,{age:0,life,fn,priority});a.fx.push(e);fn(e,0);return e;
  }
  function flash(a,k,p,w,h,delay=0){
    fx(a,k,w,h,.47+delay,(e,t)=>{const u=Math.max(0,(t*(.47+delay)-delay)/.47);set(e,p);
      e.alpha.opacity=t*(.47+delay)<delay?0:Math.round(248*(1-u*u));e.n.setScale(.25+.85*Math.sin(u*Math.PI/2),.25+.85*Math.sin(u*Math.PI/2),1);});
  }
  function streak(a,k,src,dst,life,arc,width,height,delay=0,priority=1){
    const born=a.clock();
    fx(a,k,width,height,life+delay,(e,progress)=>{
      const elapsed=(Number.isFinite(born)?a.clock()-born:progress*(life+delay))-delay,t=Math.min(1,Math.max(0,elapsed/life)),dx=dst.x-src.x,dy=dst.y-src.y;
      set(e,{x:src.x+dx*t,y:src.y+dy*t+4*t*(1-t)*arc});e.n.angle=Math.atan2(dy+4*(1-2*t)*arc,dx)*180/Math.PI;
      e.alpha.opacity=elapsed<0?0:Math.round(250*(1-.28*t));},priority);
  }
  function impact(a,type,point,scale,delay,life,priority,seed,alpha=255){
    const frames=gardenAirImpactArt.bake(a.cc,type),w=a.w*scale,h=a.h*scale,mirrored=seed%2===1?-1:1,born=a.clock(),keep=delay+life+.08;
    fx(a,'Impact/'+type,w,h,keep,(e,q)=>{
      const elapsed=(Number.isFinite(born)?a.clock()-born:q*keep)-delay,t=Math.min(1,Math.max(0,elapsed/life)),i=Math.min(frames.length-1,Math.floor(t*frames.length));
      if(e.index!==i){e.sprite.spriteFrame=frames[i];e.index=i;}
      set(e,{x:point.x,y:point.y+h*.22});
      e.n.setScale(mirrored,1,1);e.alpha.opacity=elapsed<-.0000001?0:Math.round(alpha*Math.min(1,(1-t)*7));},priority,frames[0]);
  }
  function salvoSites(square,cell,targets,serial){
    const rows=new Map(),out=[];
    for(const p of targets||[]){
      if(!Number.isFinite(p?.r)||!Number.isFinite(p?.c))continue;
      const r=Math.round(p.r),c=Math.round(p.c);if(r<0||r>square.MaxLaneIndex||c<0||c>=square.ColumnCount)continue;
      const hits=rows.get(r)||[];if(!hits.includes(c))hits.push(c);rows.set(r,hits);
    }
    for(let r=0;r<=square.MaxLaneIndex;r++){
      const hits=rows.get(r)?.sort((a,b)=>a-b);
      if(hits?.length){out.push({r,c:hits[0],strong:true});if(hits.at(-1)-hits[0]>=3)out.push({r,c:hits.at(-1),strong:true});}
      else{
        const c=(Math.round(cell.c)+r*3+serial*2)%square.ColumnCount;
        out.push({r,c,strong:!targets?.length});}
    }
    return out;
  }
  function cue(s,kind,cell,laneTargets){
    if(!cell||!detail())return;const a=view(s);if(!a)return;
    if(a.cueTime!==s.time){a.cueTime=s.time;a.cueKeys.clear();}
    const group=kind+'/'+cell.r+'/'+cell.c+(kind==='fortress'&&Array.isArray(laneTargets)?'/'+laneTargets.map(p=>p?.r+','+p?.c).join('|'):'');
    if(a.cueKeys.has(group))return;a.cueKeys.add(group);
    const keys={strafe:'f22',guided:'f35',cluster:'f35',ember:'f35',fortress:'fortress'};
    const unit=[...a.ships.values()].find(v=>v.type===keys[kind]&&v.powered),p=a.at(cell.r,cell.c,.21);
    const src=unit?.pos||a.at(Math.min(s.square.MaxLaneIndex,cell.r+1),cell.c-3,1.60);
    if(kind==='strafe'){
      for(const d of [-.17,.14])streak(a,'tracer',{x:src.x,y:src.y+d*a.h},{x:p.x+d*a.w,y:p.y},.15,0,a.w*.95,a.h*.37);
      flash(a,'hit',p,a.w*1.07,a.h*.85,.05);
    }else if(kind==='guided'||kind==='ember'){
      const ignite=kind==='ember';
      streak(a,kind,src,p,.30,a.h*.49,a.w*.89,a.h*.73,0,2);
      impact(a,kind,a.at(cell.r,cell.c,.03),ignite?2.72:3.17,.30,ignite?.80:.89,4,++a.serial);
    }else if(kind==='cluster'){
      const mid={x:src.x+(p.x-src.x)*.66,y:p.y+a.h*1.23};streak(a,'cluster',src,mid,.17,a.h*.38,a.w*.86,a.h*.7,0,2);
      for(const [r,c,arrival] of [[-.43,-.66,.35],[.39,.13,.47],[-.14,.73,.59]]){
        const dst=a.at(cell.r+r,cell.c+c,.06);
        streak(a,'cluster',mid,dst,arrival-.17,a.h*.45,a.w*.48,a.h*.40,.17,1);
        impact(a,'cluster',dst,1.95,arrival,.72,3,++a.serial);}
    }else if(kind==='fortress'){
      const serial=a.serial++,sites=salvoSites(s.square,cell,laneTargets,serial);
      for(const [i,site] of sites.entries()){
        const dst=a.at(site.r,site.c,.02),delay=.21+i*.075;
        streak(a,'cluster',{x:dst.x-a.w*.58,y:dst.y+a.h*1.6},dst,.21,0,a.w*.65,a.h*.49,delay-.21,1);
        impact(a,'fortress',dst,site.strong?3.82:1.95,delay,site.strong?1.05:.85,site.strong?4:1,i+serial,site.strong?238:99);
      }
    }
  }
  function tick(s,dt,flights,fires=[]){
    if(!flights?.length&&!fires.length&&!states.has(s))return;const a=view(s);if(!a)return;
    if(typeof gardenAirFireArt!=='undefined')gardenAirFireArt.sync(s,a,fires,dt);
    const alive=new Set(),full=detail(),shown={f22:0,f35:0,fortress:0};
    for(const f of flights||[]){
      if(!outlines[f.type]||shown[f.type]>=(full?(f.type==='fortress'?2:3):1))continue;
      const slot=shown[f.type]++;alive.add(f.id);let e=a.ships.get(f.id);
      if(!e){const size=f.type==='fortress'?2.40:f.type==='f35'?1.71:1.56;
        const shadow=node(a,'Shadow/'+f.type,'s-'+f.type,a.w*size,a.w*size*.53,69);
        const rank=s.levels?.airwing||s.specs?.airwing?.level||1,skin=f.type+(rank>=6?'@'+Math.min(rank,7):'');
        const craft=node(a,'Flight/'+f.type,skin,a.w*size,a.w*size*.77);e={type:f.type,shadow,craft};a.ships.set(f.id,e);}
      const age=Math.max(0,f.age||0),fort=f.type==='fortress',op=f.type==='f35',period=fort?18:op?11.8:9.5;
      const phase=(age+(fort?period*.24:op?period*.16:period*.03))/period+slot*.09;
      const half=Math.floor(phase),u=phase-half,sign=half%2?-1:1;
      const c=sign>0?-1.45+u*(s.square.ColumnCount+2):s.square.ColumnCount+.55-u*(s.square.ColumnCount+2);
      const r=(fort?2.25:op?3.2:1.45)+Math.sin(u*Math.PI*2+(half%3))*(fort?.38:.72),rise=fort?1.42:op?1.03:.88;
      const formation=(slot%2?1:-1)*Math.ceil(slot/2)*.45;
      const p=e.pos=a.at(r+formation,c,rise);set(e.craft,p);set(e.shadow,a.at(r+formation+.23,c-.20,.02));e.shadow.n.active=full;
      e.powered=f.enabled!==false;e.craft.alpha.opacity=e.powered?255:142;
      const bank=Math.cos(u*tau+half%3)*(fort?4.3:8);
      e.craft.n.setScale(sign,1,1);e.craft.n.angle=bank*sign;e.shadow.n.angle=bank*sign;e.shadow.n.setScale(sign,1,1);
    }
    for(const [id,e] of a.ships)if(!alive.has(id)){destroy(e.shadow);destroy(e.craft);a.ships.delete(id);}
    for(let i=a.fx.length-1;i>=0;i--){const e=a.fx[i];e.age+=Math.max(0,dt||0);
      if(!full||e.age>=e.life){destroy(e);a.fx.splice(i,1);}else e.fn(e,e.age/e.life);}
  }
  function reset(s){if(typeof gardenAirFireArt!=='undefined')gardenAirFireArt.clear(s);const a=states.get(s);if(a?.root.isValid)a.root.destroy();states.delete(s);}
  return Object.freeze({draw,drawBadge,tick,cue,reset});
})();
