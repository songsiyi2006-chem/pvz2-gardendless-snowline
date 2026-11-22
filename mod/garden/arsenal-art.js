// Painted once on transparent canvases. Battles animate sprites in lawn space,
// so the large silhouettes, silhouettes' contact shadows and tracers follow the game's camera.
const gardenArsenalArt=(()=>{
  const frames=new Map(),pi=Math.PI,tau=2*pi;
  const palettes={amber:['#78382e','#fc8b49','#ffdb7c','#fff6c7'],mint:['#174d4b','#38cfa3','#acf4c2','#f4ffdc'],
    ice:['#284b77','#6ccaf5','#c8f7ff','#ffffff'],rose:['#772753','#ce4381','#ffacb3','#fff4d1'],
    lilac:['#403a76','#9395ef','#d3c3ff','#fff5fc'],sky:['#194453','#42c9e0','#bcfcff','#fff8cc'],
    yellow:['#832e1a','#ff902d','#ffce4c','#fffbd3'],blue:['#22388a','#377dff','#74d6ff','#f3fdff'],
    purple:['#501562','#b546dd','#f59cf5','#fff1e4'],electric:['#304b6b','#72cfea','#e7f552','#ffffec'],
    toxin:['#344a30','#72a93c','#bbec65','#f5ffba'],sear:['#74253b','#f35f35','#ffb04a','#fff3c8']};
  function pigment(g,p,x=0,y=0,r=80){
    const f=g.createRadialGradient(x-r*.3,y-r*.38,1,x,y,r);
    f.addColorStop(0,p[3]);f.addColorStop(.25,p[2]);f.addColorStop(.60,p[1]);f.addColorStop(1,p[0]);return f;
  }
  function poly(g,pts,fill,stroke,w=2){
    g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);
    g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke();}
  }
  function trace(g,pts,color,w=2){
    g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);g.strokeStyle=color;g.lineWidth=w;g.stroke();
  }
  function oval(g,x,y,rx,ry,color,stroke,w=2){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,tau);if(color){g.fillStyle=color;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke();}
  }
  function metal(g,y1,y2,colors){
    const c=g.createLinearGradient(0,y1,0,y2);colors.forEach((x,i)=>c.addColorStop(i/(colors.length-1),x));return c;
  }
  function haze(g,x,y,r,color){
    const c=g.createRadialGradient(x,y,0,x,y,r);c.addColorStop(0,color+'a0');c.addColorStop(.35,color+'58');c.addColorStop(1,color+'00');
    oval(g,x,y,r,r,c);
  }
  function leaf(g,x,y,w,h,angle,p){
    g.save();g.translate(x,y);g.rotate(angle);
    g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-w,-h*.22,-w*.63,-h*.74,0,-h);g.bezierCurveTo(w*.68,-h*.61,w,-h*.23,0,0);
    g.fillStyle=metal(g,-h,0,[p[2],p[1],p[0]]);g.fill();g.strokeStyle='#173832';g.lineWidth=2;g.stroke();
    trace(g,[[0,-3],[0,-h*.82]],p[2],1.4);for(let i=1;i<=3;i++)trace(g,[[0,-h*i*.17],[w*.43,-h*(i*.17+.15)]],p[1],1.1);g.restore();
  }
  function bezel(g,x,y,n,p){
    oval(g,x,y,n,n,'#203d3d','#f9dc98',2);
    oval(g,x,y,n*.72,n*.72,pigment(g,p,x,y,n*.76));
    oval(g,x-n*.21,y-n*.31,n*.2,n*.12,'#fffbe1');
  }
  function battlement(g,id,tier,form){
    g.save();g.translate(0,13);g.scale(1.76,1.76);
    gardenEquipmentEngraving.mount(g,id);if(tier>1)gardenEquipmentTierArt.draw(g,id,tier,form);g.restore();
  }
  function thornStrip(g){
    const p=palettes.mint;
    for(let i=0;i<8;i++){
      const x=-127+i*32;
      trace(g,[[x-1,37],[x+8,17],[x+21,33],[x+33,17]],'#253c32',7);
      trace(g,[[x-1,34],[x+8,16],[x+20,26],[x+33,16]],'#90ac65',2.6);
      poly(g,[[x+7,23],[x+2,-34-(i%3)*12],[x+16,18]],'#477a55','#abc483',2);
      poly(g,[[x+2,-34-(i%3)*12],[x+9,0],[x+8,12]],'#d9d492');
      if(i%2===0){poly(g,[[x+21,29],[x+28,-16],[x+27,19]],'#72994e','#a2b97b',1.6);oval(g,x+11,15,3,4,'#dfb16e');}
    }
  }
  function reticle(g,p){
    haze(g,0,0,105,p[1]);
    for(const [rad,linewidth] of [[82,2.5],[71,1],[38,1.5]]){g.lineWidth=linewidth;g.strokeStyle=p[2];
      for(let n=0;n<4;n++){g.beginPath();g.arc(0,0,rad,n*pi/2+.10,n*pi/2+1.25);g.stroke();}}
    for(let n=0;n<32;n++){g.save();g.rotate(tau*n/32);trace(g,[[0,-77],[0,-(n%4===0?93:82)]],n%4===0?p[3]:p[1],n%4===0?3:1.2);g.restore();}
    for(let n=0;n<4;n++){g.save();g.rotate(n*pi/2);poly(g,[[0,-54],[-5,-63],[5,-63]],p[2]);trace(g,[[0,-28],[0,-12]],p[3],2);g.restore();}
    oval(g,0,0,5,5,p[3]);
  }
  function bloom(g,p){
    haze(g,0,0,120,p[1]);
    for(let i=0;i<15;i++){const a=tau*i/15,dl=55+((i*37)%50);g.save();g.rotate(a);
      poly(g,[[-5,-13],[-11,-34],[1,-dl],[8,-41],[5,-21]],p[1]+'bb');
      poly(g,[[-3,-15],[0,-dl*.83],[5,-29]],p[2]);g.restore();}
    for(let i=0;i<8;i++){g.save();g.rotate(tau*i/8+.11);
      poly(g,[[0,-12],[-9,-28],[-3,-47],[0,-54],[7,-28]],p[2]);g.restore();}
    oval(g,0,0,17,17,pigment(g,p,0,0,20));haze(g,0,0,30,p[3]);
  }
  function ring(g,p){
    for(const [r,w,a] of [[90,3,'b0'],[80,2,'85'],[68,1,'65']])oval(g,0,0,r,r,null,p[2]+a,w);
    for(let j=0;j<20;j++){const t=tau*j/20;g.save();g.rotate(t);trace(g,[[0,-86],[0,j%4?-91:-102]],p[j%4?1:3],j%4?1.7:3);g.restore();}
  }
  function spray(g,p){
    for(let i=0;i<29;i++){
      const a=tau*(i*.6180339887%1),r=40+i*2.45;
      g.save();g.rotate(a);poly(g,[[0,-r-6],[-2.4,-r],[0,-r+7],[2.5,-r]],p[i%3+1]);g.restore();
    }
  }
  function peonyCloud(g){
    const shadows=[[0,20,51],[-44,8,26],[45,9,30],[-27,-16,39],[29,-22,35],[0,-39,40]];
    for(const [x,y,r] of shadows){
      const fog=g.createRadialGradient(x-6,y-9,1,x,y,r);
      fog.addColorStop(0,'#ffe1abdf');fog.addColorStop(.34,'#ffb870cc');fog.addColorStop(.62,'#c87967ab');
      fog.addColorStop(.83,'#76546c8f');fog.addColorStop(1,'#5a496200');oval(g,x,y,r,r,fog);
      g.beginPath();g.ellipse(x-1,y,r*.74,r*.64,-.32,pi*1.05,pi*1.68);
      g.lineWidth=1.8;g.strokeStyle='#ffe5a5bd';g.stroke();
    }
    for(let i=0;i<10;i++){
      const a=tau*i/10,dx=Math.cos(a),dy=Math.sin(a);
      g.save();g.translate(55*dx,40*dy);g.rotate(a+.6);poly(g,[[-3,0],[0,-9],[4,0],[0,6]],'#cb946caa','#ffe2a68e',1);g.restore();
    }
  }
  function glyph(g,kind,p){
    haze(g,0,0,67,p[1]);
    for(let i=0;i<3;i++){g.save();g.rotate(i*tau/3);leaf(g,0,-4,12,40,-.25,p);g.restore();}
    if(kind==='frost'){for(let i=0;i<6;i++){g.save();g.rotate(i*pi/3);
      trace(g,[[0,-5],[0,-56]],p[2],4);
      for(const n of [22,38]){trace(g,[[-9,-n-8],[0,-n],[9,-n-8]],p[2],3);}g.restore();}}
    else if(kind==='shield'){poly(g,[[0,-54],[33,-40],[29,6],[0,43],[-30,7],[-33,-40]],p[1]+'66',p[2],3);}
    else if(kind==='heal'||kind==='rain')poly(g,[[-6,-28],[6,-28],[6,-8],[26,-8],[26,4],[6,4],[6,23],[-6,23],[-6,4],[-25,4],[-25,-8],[-6,-8]],p[3]);
    else if(kind==='spore'){for(let i=0;i<8;i++)oval(g,Math.cos(i*pi/4)*43,Math.sin(i*pi/4)*39,4+i%3,4,p[2]);}
  }
  function round(g,p){
    poly(g,[[-69,0],[-27,-9],[21,-11],[69,0],[19,12],[-24,11]],p[0],p[2],2);
    poly(g,[[-38,-7],[19,-8],[62,0],[8,1]],p[3]);poly(g,[[-32,1],[14,3],[23,8],[-20,8]],p[1]);
    poly(g,[[-22,6],[-56,19],[-45,4]],p[2]);poly(g,[[-22,-6],[-56,-19],[-45,-4]],p[1]);
  }
  function wisp(g,p,x,y,angle,size){
    g.save();g.translate(x,y);g.rotate(angle);g.scale(size,size);
    const silhouette=new Path2D('M-8 10 C-30 -6 -13 -29 -5 -42 C-6 -27 -3 -23 2 -25 Q9 -32 10 -50 C28 -20 22 -7 13 4 L5 14Z');
    g.fillStyle=metal(g,-51,14,[p[1]+'aa',p[2],p[1],p[0]+'99']);g.fill(silhouette);
    const heart=new Path2D('M-4 7 Q-13 -6 -3 -23 Q-5 -13 0 -15 L7 -27 Q14 -8 2 8Z');
    g.fillStyle=p[3];g.fill(heart);g.restore();
  }
  function imprint(g,kind,p){
    haze(g,0,3,70,p[0]);haze(g,0,0,54,p[1]);
    if(kind==='ice'){
      for(let i=0;i<6;i++){g.save();g.rotate(i*pi/3+.12);
        poly(g,[[-7,-13],[-10,-37],[0,-89],[9,-39],[5,-18]],p[1]+'bb',p[2],1.5);
        poly(g,[[0,-85],[0,-37],[7,-39]],p[3]);trace(g,[[-20,-56],[0,-39],[19,-55]],p[2],3);g.restore();}
    }else if(kind==='electric'){
      for(let i=0;i<4;i++){g.save();g.rotate(pi*i/2+.17);const zig=[[0,0],[-14,-21],[4,-38],[-4,-43],[18,-68],[9,-94]];
        trace(g,zig,p[1]+'cc',9);trace(g,zig,p[3],3);trace(g,[[4,-38],[27,-40],[35,-58]],p[2],2.3);g.restore();}
    }else if(kind==='toxin'){
      for(const [x,y,r] of [[-29,-22,22],[18,-38,15],[34,6,21],[-5,14,27],[49,-48,6],[-43,22,9]]){
        oval(g,x,y,r,r*.94,p[0]+'8e',p[1],2);oval(g,x-1,y-2,r*.80,r*.74,pigment(g,p,x,y,r));
        oval(g,x-r*.29,y-r*.45,r*.23,2.3,p[3]);}
    }else if(kind==='blue'){
      for(let i=0;i<3;i++)wisp(g,p,-20+i*18,9+i*7,.77+i*.08,1.18-i*.16);
      for(let j=0;j<2;j++){g.save();g.translate(24+j*17,0);g.rotate(.38);oval(g,0,0,12,34,null,p[2],2.6-j*.6);g.restore();}
    }else if(kind==='purple'){
      wisp(g,p,-3,1,-.24,1.6);wisp(g,p,2,2,pi+.28,1.49);
      for(const sign of [-1,1]){g.save();g.scale(1,sign);trace(g,[[0,-8],[12,-30],[8,-42],[19,-58]],p[2],2.4);g.restore();}
    }else{
      for(const [x,y,angle,s] of [[-16,5,-.89,.98],[0,10,.17,1.50],[14,7,.95,1.04]])wisp(g,p,x,y,angle,s);
      for(let i=0;i<7;i++){const a=i*tau/7;oval(g,Math.cos(a)*44,Math.sin(a)*41,2.1,4.5,p[2]);}
    }
  }
  function slash(g,p){
    for(const mirror of [-1,1]){g.save();g.scale(1,mirror);
      const outer=new Path2D('M-117 69 Q-28 31 39 -32 Q65 -57 106 -76 Q64 -37 47 -18 Q-7 33 -88 59Z');
      g.fillStyle=metal(g,-75,68,[p[1]+'33',p[2],p[3],p[1]+'80']);g.fill(outer);
      g.strokeStyle=p[2];g.lineWidth=1.35;g.stroke(outer);
      trace(g,[[-52,37],[-15,16],[24,-13],[61,-47]],p[3],2);g.restore();}
    haze(g,0,0,20,p[3]);
  }
  function bladeEdge(g,p){
    // Both edges of the broad blade carry the splash. The cutting edge stays white
    // and the wider transparent serrations show the area beside the diagonal.
    g.fillStyle=metal(g,-73,58,[p[1]+'00',p[2]+'69',p[3]+'aa',p[1]+'3f',p[0]+'00']);
    g.fill(new Path2D('M-124 2 Q-90 -64 -29 -69 L-44 -48 Q9 -73 70 -53 L50 -34 Q95 -42 122 -11 Q50 -24 -4 4 Q-74 34 -124 22Z'));
    const edge=new Path2D('M-124 12 Q-45 -42 35 -25 Q80 -19 122 -7 Q63 -8 21 -10 Q-33 -17 -92 21 L-125 21Z');
    g.fillStyle=metal(g,-33,25,[p[1]+'a8',p[2],p[3],p[2]+'89']);g.fill(edge);
    g.save();g.scale(1,-1);for(const [x,y,s] of [[-61,24,9],[-6,25,7],[47,15,5]]){
      poly(g,[[x,y],[x+s,y+13],[x+s+12,y+15],[x+8,y+1]],p[2]+'b7');}g.restore();
  }
  function rotaryGlyph(g,name,p){
    if(name==='rotary-fan'){
      const hot=g.createLinearGradient(-122,0,120,0);
      hot.addColorStop(0,'#fff6cf');hot.addColorStop(.22,'#ffe78f');hot.addColorStop(.53,'#ff9b3de0');hot.addColorStop(1,'#e84d2520');
      for(const [angle,size] of [[-.47,.73],[.44,.68],[-.25,.91],[.23,.88],[.02,1]]){
        g.save();g.translate(-112,0);g.rotate(angle);g.scale(size,size);
        const jet=new Path2D('M0 0 Q36 -11 64 -25 Q55 -14 63 -13 Q108 -30 156 -25 L143 -15 Q168 -13 223 -24 Q185 3 143 8 L158 12 Q100 18 52 8 Q23 14 0 0Z');
        g.fillStyle=hot;g.fill(jet);trace(g,[[3,0],[42,-3],[107,-14]],'#fff3ba',3);g.restore();
      }
      oval(g,-107,0,12,15,'#fff9d4','#ffc56d',2);
    }else if(name==='rotary-wave'){
      for(let i=0;i<14;i++){
        const a=i*tau/14,span=(i%3===0?.35:.24);
        g.beginPath();g.arc(0,0,103+(i%3)*2,a,a+span);g.lineWidth=i%3===0?5:3;g.strokeStyle=p[2];g.stroke();
        g.beginPath();g.arc(0,0,93,a+.04,a+span+.045);g.lineWidth=1.7;g.strokeStyle=p[3];g.stroke();
        g.save();g.rotate(a);poly(g,[[93,-3],[113,-1],[98,3],[86,2]],p[1]+'bd');g.restore();
      }
    }else if(name==='rotary-spall'){
      for(let i=0;i<12;i++){
        const angle=(i*.083+(i%3)*.014)*tau,length=68+(i*29)%47;
        g.save();g.rotate(angle);
        trace(g,[[length-31,2],[length-11,0],[length,-2]],p[1]+'95',2);
        poly(g,[[length-5,1],[length+6,-4],[length+12,-3],[length+3,2]],p[2],p[0],1.5);
        trace(g,[[length-2,0],[length+6,-3]],p[3],1.3);g.restore();
      }
    }else{
      const edge=new Path2D('M-127 14 Q-68 -13 -17 -11 L8 -15 L1 -9 Q56 -14 126 -15 Q68 -1 16 9 L28 4 Q-18 15 -72 18 L-58 12 Q-98 19 -127 14Z');
      g.fillStyle=metal(g,-18,20,[p[1],p[2],p[3],p[2],p[0]]);g.fill(edge);
      trace(g,[[-118,12],[-75,4],[-31,-4],[22,-7],[66,-11],[119,-14]],p[3],3.3);
      trace(g,[[-91,20],[-48,15],[-14,16],[9,11]],p[1]+'a0',2);
    }
  }
  function precisionGlyph(g,name,p){
    if(name==='blast-radius'){
      const shape=new Path2D('M-109 0 Q-98 -29 -69 -61 Q-36 -93 0 -112 Q37 -93 70 -61 Q99 -28 109 0 Q99 29 70 61 Q33 94 0 112 Q-37 92 -70 61 Q-99 29 -109 0Z');
      g.fillStyle=metal(g,-113,112,[p[2]+'18',p[1]+'26',p[2]+'0b']);g.fill(shape);
      for(const [width,color] of [[6,p[1]+'65'],[2,p[3]+'db']]){g.lineWidth=width;g.strokeStyle=color;g.stroke(shape);}
      for(let i=0;i<4;i++){g.save();g.rotate(i*pi/2);
        poly(g,[[-8,-100],[0,-116],[8,-100],[0,-105]],p[2]);g.restore();}
    }else if(name==='blade-edge')bladeEdge(g,p);
    else if(name==='flying-shard'){
      poly(g,[[-105,20],[-67,-10],[50,-17],[111,-4],[20,23],[-41,29]],p[0],p[2],2.3);
      poly(g,[[-94,16],[-60,-8],[48,-15],[105,-4],[-12,3]],p[2]);
      poly(g,[[-12,3],[105,-4],[20,20],[-38,26]],p[1]);trace(g,[[-60,-8],[40,-14],[99,-5]],p[3],3);
    }else if(name==='flying-blade'){
      const shell=new Path2D('M-110 27 Q-61 -54 62 -47 L108 -24 L67 -20 Q27 -18 -2 1 Q-49 28 -110 27Z');
      g.fillStyle=metal(g,-50,28,[p[0],p[1],p[3],p[2]]);g.fill(shell);g.lineWidth=2;g.strokeStyle=p[2];g.stroke(shell);
      g.beginPath();g.moveTo(-90,17);g.quadraticCurveTo(-33,-31,70,-34);g.strokeStyle=p[3];g.lineWidth=2.6;g.stroke();
    }else if(name==='fire-link'||name==='jump-link'){
      const path=new Path2D(name==='fire-link'?'M-123 6 Q-90 -35 -62 -26 T-10 9 Q15 37 51 12 T123 -3':'M-123 3 Q-72 -47 -27 -13 L-8 1 Q13 15 32 3 L56 -12 Q83 -26 123 -4');
      for(const [width,color] of [[18,p[1]+'62'],[7,p[2]],[2.5,p[3]]]){g.strokeStyle=color;g.lineWidth=width;g.stroke(path);}
      if(name==='fire-link'){for(const [x,y,b] of [[-70,-20,.40],[24,18,.31],[69,7,.27]])wisp(g,p,x,y,.8,b);}
      else for(const [x,y] of [[-68,-17],[13,7],[72,-10]])poly(g,[[x-9,y+2],[x,y-5],[x+12,y-7],[x+2,y+4]],p[2]);
    }else{
      for(let i=0;i<4;i++){g.save();g.rotate(i*pi/2);
        g.beginPath();g.arc(0,0,65,.18,.99);g.lineWidth=5;g.strokeStyle=p[2];g.stroke();
        poly(g,[[-3,-20],[0,-69],[5,-32],[3,-13]],p[3]);g.restore();}
      haze(g,0,0,35,p[1]);oval(g,0,0,8,8,p[3]);
    }
  }
  function texture(cc,name,palette,tier,form){
    const key=name+'/'+palette+'/'+tier+'/'+form;if(frames.has(key))return frames.get(key);
    const cv=document.createElement('canvas');cv.width=cv.height=name==='house'?440:240;
    const g=cv.getContext('2d');g.translate(cv.width/2,cv.height/2);g.scale(cv.width/256,cv.width/256);g.lineCap='round';g.lineJoin='round';
    const p=palettes[palette]||palettes.mint;
    if(name==='house')battlement(g,palette,tier,form);
    else if(name==='thorns'){thornStrip(g);if(tier>1)gardenEquipmentTierArt.ground(g,tier);}
    else if(['rotary-fan','rotary-wave','rotary-spall','rotary-edge'].includes(name))rotaryGlyph(g,name,p);
    else if(name==='cinders'){
      for(let i=0;i<22;i++){
        const angle=i*2.4,r=13+(i*17)%59,x=Math.cos(angle)*r,y=Math.sin(angle)*r*.58-i*1.2;
        g.save();g.translate(x,y);g.rotate(i*.79);
        poly(g,[[-6,0],[-3,-8],[4,-5],[6,1],[0,4]],i%4?'#474140d9':'#da713ee8',i%4?'#93877a':'#f9c988',1.3);g.restore();
      }
    }else if(name==='target')reticle(g,p);
    else if(name==='bloom')bloom(g,p);
    else if(name==='ring')ring(g,p);
    else if(name==='spray')spray(g,p);
    else if(name==='plume')peonyCloud(g);
    else if(name==='round')round(g,p);
    else if(name==='cartridge')imprint(g,palette,p);
    else if(name==='cleave')slash(g,p);
    else if(['blast-radius','blade-edge','flying-shard','flying-blade','fire-link','jump-link','contact-light'].includes(name))precisionGlyph(g,name,p);
    else if(name==='skip'){
      for(const [x,y,v] of [[-30,19,36],[-8,16,44],[20,8,20]]){trace(g,[[x,y],[x+v,y-17]],p[2],2.8);oval(g,x+v+3,y-20,2,2,p[3]);}
      g.beginPath();g.ellipse(3,23,43,11,0,.3,pi*1.2);g.strokeStyle=p[1]+'ae';g.lineWidth=2;g.stroke();
    }
    else if(name==='rail'){
      const grad=g.createLinearGradient(0,-60,0,60);
      for(const [t,c] of [[0,p[1]+'00'],[.27,p[1]+'40'],[.46,p[2]+'ee'],[.50,p[3]],[.54,p[2]+'f0'],[.73,p[1]+'48'],[1,p[1]+'00']])grad.addColorStop(t,c);
      poly(g,[[-128,0],[-85,-60],[111,-34],[128,0],[103,38],[-88,60]],grad);
    }else if(name==='bolt'){
      const pts=[[-125,0],[-77,11],[-47,-9],[-29,7],[-11,-12],[18,10],[37,3],[58,-11],[86,4],[123,0]];
      trace(g,pts,p[0]+'90',22);trace(g,pts,p[1],9);trace(g,pts,p[3],3.8);
    }else glyph(g,name,p);
    const tex=new cc.Texture2D();tex.image=new cc.ImageAsset(cv);
    const frame=new cc.SpriteFrame();frame.texture=tex;frame.packable=false;frame.addRef();frames.set(key,frame);return frame;
  }
  function reset(s){
    const a=s.art;if(!a)return;
    if(a.root?.isValid)a.root.destroy();s.art=null;
  }
  function make(a,name,palette,at,w,h,angle=0,alpha=255,tier=1,form=''){
    const cc=a.cc,n=new cc.Node('Arsenal/'+name+'/'+palette);
    n.setParent(a.root);n.layer=a.root.layer;n.setPosition(at.x,at.y,0);n.angle=angle;
    const sprite=n.addComponent(cc.Sprite);sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame=texture(cc,name,palette,tier,form);
    n.getComponent(cc.UITransform).setContentSize(w,h);
    const opacity=n.addComponent(cc.UIOpacity);opacity.opacity=alpha;
    return {n,opacity};
  }
  function view(s){
    if(s.art?.root?.isValid)return s.art;
    const sq=s.square,cc=window.System.get(window.System.resolve('cc'));
    const tile=(r,c)=>sq.getLnC(r,c)?.plantPoint;
    const parent=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;
    if(!parent?.isValid||!tile(0,0)?.isValid||!tile(0,1)?.isValid||!tile(1,0)?.isValid)return null;
    const root=new cc.Node('GardenArsenal/Emplacements');root.setParent(parent);root.layer=parent.layer;
    const local=node=>root.inverseTransformPoint(new cc.Vec3(),node.worldPosition);
    const zero=local(tile(0,0)),right=local(tile(0,1)),down=local(tile(1,0));
    const w=right.x-zero.x,h=Math.abs(down.y-zero.y);
    if(!(w>0&&h>0)){root.destroy();return null;}
    const a=s.art={root,cc,w,h,items:[],
      at:(p,rise=0)=>({x:zero.x+(right.x-zero.x)*p.c+(down.x-zero.x)*p.r,y:zero.y+(right.y-zero.y)*p.c+(down.y-zero.y)*p.r+rise*h})};
    const heavy=['sniper','prism','rotary','bombard'].find(id=>s.gear.has(id));
    if(s.gear.has('thorns')){
      for(let r=0;r<sq.LaneCount;r++)for(let i=0;i<3;i++){
        const start=i*sq.ColumnCount/3,end=(i+1)*sq.ColumnCount/3;
        make(a,'thorns','mint',a.at({r,c:(start+end-1)/2},-.14),w*(end-start),h*.61,0,195,s.levels.thorns);
      }
    }
    a.home=a.at({r:s.home.r-.53,c:-2.82},.45);
    a.muzzle={x:a.home.x+w*.74,y:a.home.y+h*.12};
    if(heavy)make(a,'house',heavy,a.home,w*2.24,h*1.92,0,255,s.levels[heavy],s.specs[heavy].form);
    return a;
  }
  function track(a,name,palette,at,w,h,life,animate,priority=false){
    if(a.items.length>=88){
      if(!priority)return;
      const i=a.items.findIndex(i=>!i.priority);if(i<0)return;
      a.items.splice(i,1)[0].n.destroy();
    }
    const e=make(a,name,palette,at,w,h);
    Object.assign(e,{age:0,life,animate,priority});a.items.push(e);animate(e,0);
  }
  function scale(e,x,y=x){e.n.setScale(x,y,1);}
  function fade(e,n){e.opacity.opacity=Math.round(Math.max(0,Math.min(1,n))*255);}
  function pulse(a,at,kind,pal,w,h,life,start,end,spin=0,alpha=1,priority=false){
    track(a,kind,pal,at,w,h,life,(e,t)=>{
      scale(e,start+(end-start)*Math.sin(t*pi*.5));e.n.angle=t*spin;
      fade(e,alpha*(1-t*t));
    },priority);
  }
  function tracer(a,src,dst,pal,w,life,kind='rail'){
    const dx=dst.x-src.x,dy=dst.y-src.y,length=Math.hypot(dx,dy);
    if(length<1)return;
    const mid={x:(src.x+dst.x)/2,y:(src.y+dst.y)/2};
    track(a,kind,pal,mid,length,w,life,(e,t)=>{e.n.angle=Math.atan2(dy,dx)*180/pi;scale(e,1,1-t*.7);fade(e,1-t);},true);
  }
  function missile(a,src,dst,pal,life,arc,width){
    track(a,'round',pal,src,width,width*.70,life,(e,t)=>{
      const dx=dst.x-src.x,dy=dst.y-src.y;
      const y=src.y+dy*t+4*arc*t*(1-t);
      e.n.setPosition(src.x+dx*t,y,0);e.n.angle=Math.atan2(dy+4*arc*(1-2*t),dx)*180/pi;fade(e,1-.2*t);
    },true);
  }
  function impact(a,at,pal,radius,major=false){
    if(major){
      track(a,'plume',pal,at,radius*1.22,radius*1.13,1.05,(e,t)=>{
        e.n.setPosition(at.x,at.y+radius*(.02+.22*t),0);
        scale(e,.28+Math.sin(t*pi*.5)*.82);fade(e,Math.min(1,t*10)*(1-t)*.92);
      },true);
    }
    pulse(a,at,'bloom',pal,radius,radius,major?.64:.30,.25,1,major?16:-8,1,major);
    pulse(a,at,'ring',pal,radius*1.12,radius*.66,major?.83:.35,.12,1.15,-15,.92,major);
    pulse(a,at,'spray',pal,radius*1.12,radius,major?.96:.40,.22,1.30,8,.92);
    if(major){
      for(const [x,y,v] of [[-.22,.18,.54],[.24,.22,.48],[.06,.42,.42]]){
        const p={x:at.x+x*radius,y:at.y+y*radius};
        pulse(a,p,'bloom',pal,radius*v,radius*v,.56,.18,1.03,18,.83);
      }
    }
  }
  function precisionWave(a,center,end,pal,w,h){
    const dx=end.x-center.x,dy=end.y-center.y,length=Math.hypot(dx,dy);
    if(length<1)return;
    const angle=Math.atan2(dy,dx)*180/pi,mid={x:(center.x+end.x)/2,y:(center.y+end.y)/2};
    track(a,'blade-edge',pal,mid,length,h*.78,.48,(e,t)=>{
      e.n.angle=angle;scale(e,.95+.05*t,.68+.47*Math.sin(t*pi));fade(e,(1-t*t)*.94);
    },true);
    pulse(a,end,'contact-light',pal,w*.52,h*.56,.35,.2,.91,-12,.77);
  }
  function precisionLink(a,kind,src,dst){
    const shard=kind==='precision-fragment',blade=kind==='precision-blade',echo=kind==='precision-echo';
    const edge=shard||blade,pal=shard?'yellow':blade?'ice':echo?'sear':'purple';
    const dx=dst.x-src.x,dy=dst.y-src.y,length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
    const flight=Math.max(.10,Math.min(.22,.086+length/a.w*.037));
    if(length>.05*a.w){
      const middle={x:(src.x+dst.x)/2,y:(src.y+dst.y)/2};
      if(edge){
        const bump=Math.min(a.h*(blade?.36:.21),length*.14);
        tracer(a,src,dst,pal,a.h*(shard?.15:.18),flight+.07);
        track(a,blade?'flying-blade':'flying-shard',pal,src,a.w*(blade?.83:.67),a.h*(blade?.53:.43),flight,(e,t)=>{
          e.n.setPosition(src.x+dx*t,src.y+dy*t+4*bump*t*(1-t),0);
          e.n.angle=Math.atan2(dy+4*bump*(1-2*t),dx)*180/pi;fade(e,.98-.18*t);
        },true);
      }else{
        track(a,echo?'fire-link':'jump-link',pal,middle,length,a.h*(echo?.73:.94),flight+.17,(e,t)=>{
          e.n.angle=angle*180/pi;scale(e,1,.70+.38*Math.sin(pi*t));fade(e,(1-t*t)*.98);
        },true);
      }
    }
    const glow=flight+.28;
    track(a,'contact-light',pal,dst,a.w*(edge?.82:1.03),a.h*(edge?.81:1.00),glow,(e,t)=>{
      const u=(t*glow-flight*.72)/(glow-flight*.72);
      if(u<=0){fade(e,0);return;}
      scale(e,.24+.87*Math.sin(u*pi/2));e.n.angle=(blade||!edge?-18:15)*u;fade(e,(1-u*u)*.96);
    },true);
  }
  const support={thorn:['mint','thorn'],spore:['lilac','spore'],rain:['mint','rain'],heal:['mint','heal'],shield:['sky','shield'],shard:['amber','shard'],roost:['ice','roost'],wind:['ice','wind'],frost:['ice','frost'],growth:['mint','heal'],sun:['amber','sun'],flare:['amber','bloom']};
  function emit(s,kind,p,q){
    if(!gardenFxSettings.enabled)return;
    const a=view(s);if(!a)return;
    const w=a.w,h=a.h,at=a.at(p,.20),dest=q?a.at(q,.22):at;
    const mixed=/^mk14-(hit|miss)-(yellow|ice|blue|purple|electric|toxin)$/.exec(kind);
    if(mixed){
      const [,result,pal]=mixed,landed=result==='hit';
      tracer(a,a.muzzle,at,pal,w*(landed?.14:.083),landed?.145:.11,pal==='electric'?'bolt':'rail');
      if(landed){
        pulse(a,at,'cartridge',pal,w*(pal==='purple'?1.50:1.35),h*(pal==='purple'?2.40:1.55),.39,.50,1.05,0,.98,true);
        if(pal==='blue'||pal==='yellow')pulse(a,at,'ring',pal,w*(pal==='blue'?.68:1.05),h*.48,.27,.25,1,6,.74);
      }else pulse(a,at,'skip',pal,w*.82,h*.59,.24,.55,.97,0,.75);
      return;
    }
    switch(kind){
      case 'intercept_firefly':
        tracer(a,a.muzzle,dest,'mint',w*.14,.23);pulse(a,dest,'shard','mint',w,h,.42,.25,1.4,76);break;
      case 'intercept_dome':
        pulse(a,at,'shield','sky',w*3.4,h*3,.68,.2,1.18);pulse(a,dest,'ring','ice',w*1.1,h*.75,.35,.35,1.2);break;
      case 'intercept_mirror':
        tracer(a,at,dest,'lilac',w*.13,.46);pulse(a,dest,'target','lilac',w*1.42,h*.85,.62,.5,1.12,46);break;
      case 'precision-pierce':{
        const start=q?at:a.muzzle,target=q?dest:at,dx=target.x-start.x,dy=target.y-start.y,len=Math.hypot(dx,dy)||1;
        const end={x:target.x+w*.9*dx/len,y:target.y+w*.9*dy/len};
        tracer(a,start,end,'sky',h*.36,.31);tracer(a,start,end,'ice',h*.075,.40);
        for(const u of [.62,.88])pulse(a,{x:start.x+(target.x-start.x)*u,y:start.y+(target.y-start.y)*u},'ring','sky',w*.28,h*.65,.32,.26,1.16,7,.91);
        pulse(a,target,'spray','ice',w*1.12,h*.42,.36,.34,1,0);break;
      }
      case 'precision-burst':
        pulse(a,a.at(p,.06),'blast-radius','yellow',w*7.05,h*4.72,.69,.18,1.02,0,.78,true);
        pulse(a,a.at(p,.07),'rotary-spall','amber',w*4.62,h*2.95,.46,.24,1.01,-4,.84,true);
        impact(a,at,'yellow',w*1.62);pulse(a,at,'ring','rose',w*3.18,h*2.16,.58,.19,1.07,-6,.82,true);
        pulse(a,at,'cartridge','yellow',w*1.36,h*1.42,.49,.42,1.08,4,.95);break;
      case 'precision-cleave':{
        for(const [r,c] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
          const rows=r>0?s.square.MaxLaneIndex-p.r+.45:p.r+.45,cols=c>0?s.square.MaxColumnIndex-p.c+.45:p.c+.45;
          const reach=Math.max(0,Math.min(3.12,rows,cols));
          precisionWave(a,at,a.at({r:p.r+r*reach,c:p.c+c*reach},.2),'purple',w,h);
        }
        pulse(a,at,'cleave','ice',w*1.54,h*1.49,.33,.41,1.07,0,.96,true);
        pulse(a,at,'spray','ice',w*1.35,h*.99,.36,.18,1.18,-10,.90);break;
      }
      case 'precision-fragment':case 'precision-echo':case 'precision-blade':case 'precision-chain':
        if(q){
          precisionLink(a,kind,at,dest);
          if(kind==='precision-chain'||kind==='precision-echo')pulse(a,a.at(q,.05),'ring',kind==='precision-chain'?'ice':'sear',w*2.9,h*2.7,.42,.18,1.02,-8,.74);
        }break;
      case 'mk14-hit':case 'mk14-miss':{
        tracer(a,a.muzzle,at,'sky',w*.14,.12);
        pulse(a,a.muzzle,'bloom','mint',w*.47,h*.35,.13,.3,.85,14);
        if(kind==='mk14-hit')impact(a,at,'sky',w*.60);
        break;
      }
      case 'sniper':{
        tracer(a,a.muzzle,at,'mint',w*.32,.30);
        pulse(a,a.muzzle,'bloom','mint',w*.87,w*.69,.21,.35,1,22);
        pulse(a,at,'target','mint',w*1.32,h*.92,.48,1.22,.70,-25,.95,true);
        impact(a,at,'mint',w*1.06);break;
      }
      case 'rotary':{
        const dx=at.x-a.muzzle.x,dy=at.y-a.muzzle.y,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx)*180/pi;
        const pos={x:a.muzzle.x+w*.62*dx/len,y:a.muzzle.y+w*.62*dy/len};
        track(a,'rotary-fan','amber',pos,w*1.5,h*1.02,.21,(e,t)=>{e.n.angle=angle;scale(e,1+.17*t,.70+.28*Math.sin(pi*t));fade(e,.90*(1-t*t));},true);
        tracer(a,a.muzzle,at,'amber',w*.17,.16);
        pulse(a,at,'cartridge','yellow',w*.93,h*1.14,.26,.52,1.04,12,.89);break;
      }
      case 'rotary-ap':
        tracer(a,a.muzzle,at,'ice',w*.12,.17);tracer(a,a.muzzle,at,'mint',w*.044,.23);
        if(q){tracer(a,at,dest,'ice',w*.085,.17);pulse(a,dest,'flying-shard','ice',w*.27,h*.33,.15,.2,.8,59,.79,true);}
        pulse(a,at,'flying-shard','mint',w*.44,h*.54,.19,.24,1.06,42,.99,true);break;
      case 'rotary-blast':
        pulse(a,a.at(p,.03),'rotary-wave','sear',w*3.15,h*3.15,.52,.22,1.02,5,.88,true);
        track(a,'rotary-wave','amber',a.at(p,.03),w*2.95,h*2.95,.62,(e,t)=>{
          const u=Math.max(0,(t-.19)/.81);scale(e,.25+.76*Math.sin(u*pi*.5));fade(e,t<.19?0:(1-u)*.75);});
        pulse(a,at,'rotary-spall','amber',w*2.96,h*2.85,.49,.21,1.03,-7,.96,true);
        pulse(a,at,'cartridge','yellow',w*1.30,h*1.50,.36,.36,1.03,12,.93,true);break;
      case 'rotary-cleave':{
        for(const sign of [-1,1]){
          const extent=d=>Math.min(2.12,d>0?s.square.MaxLaneIndex-p.r+.35:p.r+.35,d*sign>0?s.square.MaxColumnIndex-p.c+.35:p.c+.35);
          const lo=extent(-1),hi=extent(1),src=a.at({r:p.r-lo,c:p.c-sign*lo},.18),end=a.at({r:p.r+hi,c:p.c+sign*hi},.18);
          const dx=end.x-src.x,dy=end.y-src.y,length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/pi,mid={x:(src.x+end.x)/2,y:(src.y+end.y)/2};
          track(a,'rotary-edge','sear',mid,length,h*1.86,.41,(e,t)=>{e.n.angle=angle;scale(e,.90+.10*Math.sin(t*pi*.5),.74+.28*Math.sin(t*pi));fade(e,.95*(1-t*t));},true);
          track(a,'rotary-edge','amber',mid,length*.97,h*1.34,.57,(e,t)=>{
            const u=Math.max(0,(t-.23)/.77);e.n.angle=angle;e.n.setPosition(mid.x,mid.y-h*.1*u,0);scale(e,1-u*.08,.95-.52*u);fade(e,t<.23?0:(1-u)*.60);});
        }
        pulse(a,at,'cleave','ice',w*1.04,h*1.22,.27,.36,1.08,0,.96,true);break;
      }
      case 'rotary-column':{
        const top=a.at({r:Math.max(0,p.r-2),c:p.c},.2),bottom=a.at({r:Math.min(s.square.MaxLaneIndex,p.r+2),c:p.c},.2);
        tracer(a,top,bottom,'amber',w*.31,.34);tracer(a,top,bottom,'ice',w*.07,.25);break;
      }
      case 'rotary-drill':
        tracer(a,a.muzzle,at,'mint',h*.12,.23);pulse(a,at,'flying-shard','ice',w*.82,h*1.1,.24,.46,1.1,58,.98,true);break;
      case 'rotary-intercept':
        pulse(a,a.at(p,.04),'target','rose',w*1.68,h*1.2,.39,1.17,.74,-32,.9,true);break;
      case 'target':
        pulse(a,a.at(p,.02),'target','rose',w*3.40,h*2.10,1.06,.84,1,-65,1,true);break;
      case 'shell':{
        const from={x:at.x-w*2.85,y:at.y+h*2.80};
        tracer(a,from,at,'rose',w*.13,.68);
        missile(a,from,at,'rose',.63,h*.42,w*.88);break;
      }
      case 'bombard':case 'bombard-heavy':{
        const heavy=kind==='bombard-heavy';
        impact(a,at,heavy?'rose':'amber',w*(heavy?3.8:2.9),true);
        pulse(a,a.at(p,.03),'blast-radius','amber',w*(heavy?8.75:6.8),h*4.7,.68,.22,1.00,0,.62,true);
        break;
      }
      case 'bombard-satellite':
        impact(a,at,'ice',w*1.6);pulse(a,at,'ring','amber',w*3,h*2.8,.43,.35,1,0,.72);break;
      case 'bombard-echo':
        pulse(a,a.at(p,.01),'ring','amber',w*6.45,h*4.4,.46,.32,1,0,.48);break;
      case 'bombard-curtain':{
        for(let c=p.c;c<=q.c;c++){
          const from=a.at({r:p.r,c},.03),to=a.at({r:q.r,c},.03);
          tracer(a,from,to,'sear',w*.53,.8,'fire-link');
        }
        break;
      }
      case 'bombard-seal':
        for(const dr of [-1,1])for(const dc of [-1,1]){
          const span=Math.min(2,dr<0?p.r:s.square.MaxLaneIndex-p.r,dc<0?p.c:s.square.MaxColumnIndex-p.c);
          if(span)tracer(a,at,a.at({r:p.r+dr*span,c:p.c+dc*span},.03),'yellow',w*.27,.74,'fire-link');
        }
        break;
      case 'spin':pulse(a,a.muzzle,'target','amber',w*1.38,h*.92,.56,.35,1.10,120);break;
      case 'prism':
        tracer(a,a.muzzle,at,'sky',w*.28,.42);tracer(a,at,dest,'sky',h*.72,.58);
        pulse(a,a.muzzle,'bloom','sky',w*1.2,h*1.1,.5,.3,1,25);impact(a,dest,'sky',w*1.34);break;
      case 'prism-fold':case 'prism-lock':{
        const lock=kind==='prism-lock',pal=lock?'purple':'ice';
        tracer(a,at,dest,pal,h*(lock?.54:.30),lock?.54:.34);
        if(lock)tracer(a,at,dest,'ice',h*.105,.45);
        pulse(a,dest,'contact-light',pal,w*.69,h*.69,.33,.18,1,12,.87);
        break;
      }
      case 'rotary-ash':
        pulse(a,at,'cinders','sear',w*1.1,h*1.46,.85,.45,1.35,-10,.91);break;
      case 'watch-line':
        tracer(a,at,dest,'mint',h*.10,.42);
        pulse(a,dest,'target','mint',w*.88,h*.71,.72,1.20,.61,-32,.85,true);break;
      case 'tempo':case 'arc':
        tracer(a,at,dest,kind==='arc'?'lilac':'mint',h*.35,.38,kind==='arc'?'bolt':'rail');
        pulse(a,dest,'ring',kind==='arc'?'lilac':'mint',w,h*.60,.48,.15,1,-35);break;
      case 'mire':
        pulse(a,a.at(p,-.05),'target','amber',w*1.20,h*.60,5,.86,1.02,20,.69);break;
      default:{
        const [pal,glyph]=support[kind]||['mint','ring'];
        const r=kind==='flare'?w*2.4:kind==='frost'?w*1.95:w*1.10;
        pulse(a,at,glyph,pal,r,r*.92,.68,.4,1,kind==='frost'?25:8,.95);
        pulse(a,a.at(p,.03),'ring',pal,r,r*.60,.78,.25,1.08,12,.85);
      }
    }
  }
  function step(s,dt){
    const a=view(s);if(!a)return;
    let at=0;
    for(const item of a.items){
      item.age+=dt;
      if(!item.n.isValid||item.age>=item.life){if(item.n.isValid)item.n.destroy();continue;}
      item.animate(item,item.age/item.life);a.items[at++]=item;
    }
    a.items.length=at;
  }
  return Object.freeze({emit,step,reset});
})();
