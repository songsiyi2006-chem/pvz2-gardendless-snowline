// The living weapons have separate body rigs, crowns and projectiles. All are
// painted into one atlas and follow the same projection as native lawn plants.
const gardenHybridArt=(()=>{
  const frames=new Map(),rigs=new Map(),debris=new Map(),effects=[],tau=Math.PI*2;
  const outline='#203637',ice=['#173d55','#3f95a7','#8bdbdf','#eaffeb'],
    pea=['#324735','#67974b','#a4ca67','#e6ee9f'],crystal=['#473452','#8956a2','#d5a9df','#fff2dc'];
  let cc,board,level,ui,sunBank,layer,installed=false,portrait,extensionTexture,extensionCanvas;
  const entries=new Map();
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const clay=['#603d42','#b66c52','#e7a06f','#fce9ba'],brass=['#364b4c','#6f8c80','#c9ad68','#f5e4a2'],
    cerulean=['#263c51','#4e727f','#a5c0b2','#f0d79c'];
  const colors={melon:ice,gatling:pea,prism:crystal,grenadier:clay,sprayer:brass,shieldguard:cerulean,eliteguard:crystal};
  function path(g,data,fill,stroke=outline,w=3){
    const p=new Path2D(data);if(fill){g.fillStyle=fill;g.fill(p);}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke(p);}
  }
  const stroke=(g,d,c,w=2)=>path(g,d,null,c,w);
  function oval(g,x,y,w,h,fill,border,width=2){
    g.beginPath();g.ellipse(x,y,w,h,0,0,tau);
    if(fill){g.fillStyle=fill;g.fill();}if(border){g.strokeStyle=border;g.lineWidth=width;g.stroke();}
  }
  function linear(g,x,y,a,b,p){const v=g.createLinearGradient(x,y,a,b);p.forEach((c,i)=>v.addColorStop(i/(p.length-1),c));return v;}
  function focus(g,x,y,r,p){
    const grad=g.createRadialGradient(x-r*.32,y-r*.42,r*.04,x,y,r);
    [p[3],p[2],p[1],p[0]].forEach((color,i)=>grad.addColorStop(i/3,color));return grad;
  }
  function leaf(g,x,y,w,h,rad,p,ragged=false){
    g.save();g.translate(x,y);g.rotate(rad);g.scale(w,h);
    const edge=ragged?'M0 0 Q-.58 -.13 -.9 -.43 L-.58 -.42 -.72 -.71 -.44 -.64 -.52 -.85 Q-.20 -.83 0 -1.04 Q.21 -.84 .47 -.8 L.42 -.65 .67 -.72 .56 -.49 .85 -.5 Q.62 -.15 0 0Z':
      'M0 0 Q-.86 -.12 -.77 -.55 Q-.59 -.83 0 -1.05 Q.7 -.83 .81 -.56 Q.92 -.19 0 0Z';
    path(g,edge,linear(g,-.7,-.75,.8,-.2,[p[2],p[1],p[0]]),outline,.057);
    path(g,'M0 -.02 Q-.15 -.51 0 -.99 Q.12 -.75 .45 -.69 L.16 -.63 .50 -.46 .10 -.53 .39 -.32 .02 -.42Z',p[2]+'9a',null);
    stroke(g,'M0 -.04 Q-.04 -.5 0 -.95 M-.04 -.38 Q-.35 -.44 -.49 -.59 M0 -.57 Q.32 -.63 .41 -.74',p[3],.025);g.restore();
  }
  function star(g,x,y,r,color){
    path(g,'M'+x+' '+(y-r)+' q0 '+r+' '+r+' '+r+' q-'+r+' 0 -'+r+' '+r+' q0 -'+r+' -'+r+' -'+r+' q'+r+' 0 '+r+' -'+r+'Z',color,null);
  }
  function flake(g,x,y,r,ink){
    g.save();g.translate(x,y);for(let i=0;i<6;i++){g.rotate(Math.PI/3);
      stroke(g,'M0 -2 L0 -'+r+' M0 -'+r*.59+' l-'+r*.23+' -'+r*.19+' M0 -'+r*.62+' l'+r*.22+' -'+r*.20,ink,Math.max(1,r*.095));}g.restore();
  }
  function melonBall(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-.19);g.scale(s,s);
    const skin='M-55 0 C-57 -28 -35 -48 -3 -49 C32 -53 56 -28 56 0 C55 30 31 47 0 45 C-35 46 -56 27 -55 0Z';
    path(g,skin,focus(g,0,0,59,ice),outline,3.6);
    g.save();g.clip(new Path2D(skin));
    for(const [x1,bend,width] of [[-38,-12,7],[-19,-18,8],[6,-16,7],[30,-12,8],[48,-4,5]]){
      const d='M'+x1+' -48 q'+(bend-3)+' 15 '+bend+' 30 l-3 6 4 6 q0 25 '+(-bend+4)+' 48';
      stroke(g,d,'#377d89',width);stroke(g,d,'#75c4c6',width*.34);
    }
    path(g,'M-58 17 Q-19 45 40 17 L55 10 47 44 -35 54Z','#245c6a48',null);
    stroke(g,'M-39 -18 Q-27 -37 -10 -39 M-5 -39 L4 -39','#e6ffec',3.1);
    flake(g,13,5,17,'#dcfae2');g.restore();
    stroke(g,'M2 -46 Q5 -53 15 -56 Q24 -57 20 -65','#48795c',3);
    oval(g,-36,-16,4,2,'#f3ffed');g.restore();
  }
  function icyRig(g,empty=false){
    const wood=linear(g,-70,-15,66,75,['#d7b77b','#b18055','#765645','#5c5148']);
    // A forked cherrywood throwing arm carries the ice melon; the pale winding
    // and broad leaf sling read separately at the game's smallest camera scale.
    for(const [x,y,w,h,a] of [[11,26,25,62,.23],[29,32,23,66,1.30],[-15,24,15,43,-.82]])leaf(g,x,y,w,h,a,ice,true);
    path(g,'M-25 44 Q-1 19 15 -8 L22 -28 13 -50 24 -52 34 -37 49 -57 58 -48 41 -23 39 -5 Q25 33 -9 61 L-20 59Z',wood,outline,3.8);
    stroke(g,'M-16 49 Q13 23 24 -8 L30 -30 M26 -43 l5 11 M35 -27 l13 -19','#e7c88b',2.8);
    stroke(g,'M-8 49 Q11 30 16 22 M32 -5 l4 -8','#765448',1.7);
    if(!empty)melonBall(g,6,-22,.88);
    for(const a of [-.8,-.32,.35,.9])leaf(g,4,17,10,32,a,ice,true);
    path(g,'M-56 1 Q-58 20 -32 28 Q6 44 43 16 L51 -9 60 -7 55 20 Q15 58 -39 40 Q-66 29 -67 8Z',wood,outline,3.4);
    stroke(g,'M-61 10 Q-57 34 -31 34 M-9 41 Q17 44 39 26','#e7c995',2.6);
    for(const x of [-47,-37,27,36])stroke(g,'M'+x+' '+(x<0?27:31)+' l-4 8 M'+(x+3)+' '+(x<0?28:29)+' l-4 8','#b3ddd3',2.5);
    for(const [x,y,n] of [[-53,27,14],[-42,34,10],[34,31,12]])path(g,'M'+x+' '+y+' l1 '+n+' 5 -'+(n+2)+'Z','#bce6e2','#548a96',1.1);
  }
  function barrel(g,x,y,sz){
    g.save();g.translate(x,y);g.scale(sz,sz);
    const rind=linear(g,0,-26,0,25,['#cecf80','#9ebc63','#659158','#436747']);
    path(g,'M34 -16 Q6 -14 -22 -25 Q-30 -21 -30 -7 L-26 15 Q-6 12 24 17 L39 8Z',rind,outline,2.8);
    stroke(g,'M-17 -18 Q0 -10 22 -9','#d4dc93',2.6);
    g.save();g.translate(-27,-3);g.rotate(-.13);
    oval(g,0,0,13,20,'#9fbf69',outline,2.8);oval(g,-1,0,8.4,13.8,'#334a38','#607e4f',1.6);
    oval(g,-3,-2,4.4,8.5,'#253d32');stroke(g,'M-8 -11 Q-3 -18 2 -15','#e5e7a2',2);g.restore();g.restore();
  }
  function peaRig(g,turn=0){
    const red=['#593b3a','#a65a44','#d68856','#f3bd77'];
    for(const [w,h,a] of [[21,54,.55],[24,79,1.02],[20,70,1.53],[19,51,2.14]])leaf(g,23,10,w,h,a,red,true);
    path(g,'M-13 -43 Q15 -65 43 -44 Q62 -26 48 4 Q38 24 9 23 L-14 14Z',focus(g,17,-20,54,pea),outline,3.5);
    stroke(g,'M4 -43 Q21 -52 33 -45','#e3e6a0',2.8);
    for(const [x,y,r] of [[31,-34,2.2],[38,-31,1.8],[34,-26,1.6],[42,-22,1.8]])oval(g,x,y,r,r,'#6e8d4e');
    path(g,'M-15 -31 Q0 -38 11 -30 Q12 -17 4 -13 Q-9 -18 -15 -31Z','#fcdf89',outline,2.7);
    path(g,'M1 -29 Q9 -31 8 -22 L4 -17 1 -18Z','#3f4935',null);
    stroke(g,'M-17 -31 Q-1 -32 13 -27','#496442',4);
    const sweep=Math.sin(turn*Math.PI/2)*4;
    barrel(g,-10,-8+sweep,.84);barrel(g,-18,11-sweep,.83);barrel(g,-24,-14-sweep,.96);barrel(g,-27,8+sweep,1.02);
    path(g,'M4 12 Q24 9 35 3 L45 13 34 27 12 33 -3 25Z','#8a8451',outline,3);
    for(const [x,y] of [[6,16],[16,14],[26,12]]){oval(g,x,y,5.4,7.3,'#d2b568','#575f43',1.8);oval(g,x+1,y-2,2,2,'#f4d993');}
    leaf(g,14,32,15,41,2.42,pea,true);leaf(g,1,23,12,34,-2.55,pea,true);
  }
  function gem(g,x,y,w,h,rad,p=crystal){
    g.save();g.translate(x,y);g.rotate(rad);g.scale(w,h);
    path(g,'M0 -1 L.62 -.63 .69 -.13 .15 .22 -.45 .03 -.67 -.46Z',p[1],outline,.07);
    path(g,'M0 -1 L.13 -.51 .15 .22 -.20 -.15 -.41 -.49Z',p[2],null);
    path(g,'M0 -1 L.62 -.63 .13 -.51Z',p[3],null);
    path(g,'M.13 -.51 L.62 -.63 .69 -.13 .15 .22Z',p[0]+'a9',null);
    stroke(g,'M0 -.93 L.13 -.51 .15 .12 M-.55 -.45 l.15 -.10',p[3],.038);g.restore();
  }
  function prismRig(g){
    const jade=['#21474d','#4c9375','#b1cb8e','#edebb0'];
    for(const [x,y,w,h,a] of [[4,25,19,68,-.87],[8,25,18,66,.62],[15,28,15,84,1.14],[-8,24,14,57,-1.38]])
      leaf(g,x,y,w,h,a,jade);
    gem(g,22,-8,31,55,.48);gem(g,-22,-4,25,46,-.58);gem(g,1,-10,40,72,-.14);
    path(g,'M-36 0 Q-28 21 -10 22 L6 18 23 20 44 4 40 17 22 33 -3 38 -25 25Z',linear(g,-25,0,18,35,['#d6d4a1','#9ea77c','#847b71']),outline,3);
    path(g,'M-10 17 L3 10 14 20 5 33 -7 29Z','#86845f',outline,2);gem(g,3,23,6.9,9,-.1);
    star(g,-2,-47,5.2,'#fff8dc');
    for(const [x,y,n,a] of [[-25,7,28,-1.55],[4,29,30,2.40],[10,28,33,1.7]])leaf(g,x,y,9,n,a,jade);
  }
  function harness(g,kind){
    const p=colors[kind],leaves=kind==='melon'?ice:kind==='prism'?['#25494d','#5f9376','#afc58a','#f1efbb']:pea;
    for(const [x,y,h,a] of [[-9,-4,48,-1.72],[5,-1,45,-2.40],[22,-4,45,1.45],[25,11,41,2.12]])leaf(g,x,y,13,h,a,leaves,kind!=='prism');
    path(g,'M-36 -20 Q-15 -9 31 2 L36 10 29 16 Q-9 7 -40 -11Z',linear(g,0,-18,0,18,['#c2ad72','#a78a59','#716548']),outline,2.7);
    stroke(g,'M-31 -15 Q-5 -1 23 5','#dccb88',1.7);
    if(kind==='melon'){path(g,'M-14 -6 Q-1 6 12 9 L7 23 -6 23 -19 10Z','#556e6a',outline,2);
      flake(g,-6,10,10,'#c3e7d1');}
    else if(kind==='gatling')for(const [x,y] of [[-18,-6],[-5,0],[8,4],[21,8]]){oval(g,x,y,5,9,'#a1aa58','#3c533d',2);oval(g,x-1,y-4,2.3,2.3,'#e5df89');}
    else{gem(g,0,7,15,14,.42);gem(g,18,15,6,8,.35);}
  }
  function ring(g,kind){
    const p=colors[kind];
    for(const [r,w,c] of [[80,5,outline],[80,2.4,p[2]],[69,1.5,p[1]]]){
      g.strokeStyle=c;g.lineWidth=w;
      for(let j=0;j<6;j++){g.beginPath();g.arc(0,0,r,j*tau/6+.05,j*tau/6+.89);g.stroke();}
    }
    for(let j=0;j<6;j++){g.save();g.rotate(j*tau/6);
      path(g,'M0 -65 l-5 -11 5 -8 5 8Z',p[2],outline,1.7);g.restore();}
    if(kind==='melon')flake(g,0,0,26,p[2]);
    if(kind==='gatling'){for(let i=-1;i<=1;i++)stroke(g,'M-18 '+(i*11)+' l28 0 '+(-6)+' -5',p[2],3);}
    if(kind==='prism'){path(g,'M0 -26 L15 -7 10 10 0 23 -11 7 -15 -8Z',null,p[2],2.7);stroke(g,'M0 -24 L3 -4 0 21',p[2],1.5);}
    if(kind==='grenadier'){oval(g,0,2,16,18,null,p[2],3);stroke(g,'M-4 -16 l3 -7 8 -2 M-20 22 l-5 6 M20 18 l6 4',p[2],2.5);}
    if(kind==='sprayer'){oval(g,0,0,16,16,null,p[2],2);stroke(g,'M-28 0 h18 M10 0 h18 M0 -25 v16 M0 10 v15',p[2],2.2);}
    if(kind==='shieldguard')path(g,'M0 -24 L19 -16 15 9 0 24 -15 9 -19 -16Z',null,p[2],3);
  }
  function fallingIce(g){
    for(let i=0;i<11;i++){const a=tau*i/11,h=37+(i*29)%52;g.save();g.rotate(a);
      path(g,'M-3 -16 l-6 -17 5 -'+(h-32)+' 10 '+(h-27)+' -4 11Z',i%2?ice[1]:ice[2],'#57879b',1.5);
      stroke(g,'M-3 -24 l0 -'+(h-33),ice[3],1.2);g.restore();}
    flake(g,0,0,25,'#e5fffd');
  }
  function beam(g,kind){
    const p=colors[kind],grad=g.createLinearGradient(0,-36,0,36);
    [[0,p[1]+'00'],[.33,p[1]+'80'],[.49,p[2]+'ed'],[.5,p[3]],[.54,p[2]+'e8'],[.73,p[1]+'74'],[1,p[1]+'00']].forEach(([u,c])=>grad.addColorStop(u,c));
    path(g,'M-102 0 L-79 -16 -28 -32 64 -17 102 0 65 15 -31 30 -80 15Z',grad,null);
    stroke(g,'M-95 0 Q-22 -3 98 0',p[3],1.6);
  }
  function seed(g,kind){
    if(kind==='melon'){melonBall(g,0,0,1.32);return;}
    if(kind==='prism'){
      for(let i=0;i<10;i++){g.save();g.rotate(i*tau/10);path(g,'M0 -75 l-8 21 8 5 8 -6Z','#f4c86e','#ba894b',1.5);g.restore();}
      oval(g,0,0,42,42,focus(g,0,0,43,['#bd793e','#eda640','#ffe69c','#fff8cf']),'#c29355',2);
      star(g,-10,-10,12,'#fff5c5');return;
    }
    path(g,'M-64 1 Q-44 -24 -18 -31 Q20 -40 65 0 Q24 36 -16 31 Q-40 25 -64 1Z',focus(g,3,1,61,pea),outline,3);
    stroke(g,'M-10 -22 Q17 -23 30 -15','#f1e89e',3);leaf(g,41,3,7,25,1.40,pea);
  }
  function clayPod(g,x,y,scale){
    g.save();g.translate(x,y);g.scale(scale,scale);g.rotate(-.16);
    path(g,'M-20 -34 Q-12 -44 -13 -51 L3 -55 13 -45 9 -38 Q32 -32 35 -9 Q46 22 19 37 Q-8 53 -34 32 Q-52 13 -40 -10 Q-34 -25 -20 -34Z',focus(g,-2,0,49,clay),outline,3.6);
    path(g,'M-35 -7 Q-14 -3 0 -14 Q19 -21 34 -15 L36 -6 Q19 -10 4 -2 Q-13 9 -38 2Z','#e4bd83','#936b55',1.6);
    stroke(g,'M-29 -19 Q-24 -29 -15 -31 M-32 17 q7 11 19 11','#f4cfa0',3);
    path(g,'M-18 -40 L-21 -48 -11 -49 -11 -58 3 -53 11 -63 17 -58 14 -44 8 -39Z','#708c61',outline,2.7);
    stroke(g,'M-7 -54 l2 10 M9 -54 l-4 9','#bcba80',1.7);
    star(g,12,15,6,'#f4c581');g.restore();
  }
  function grenadierRig(g){
    const fabric=linear(g,-35,-45,38,35,['#e0ac72','#b36d51','#865951','#55434a']);
    path(g,'M-59 -9 Q-55 -43 -24 -51 Q8 -65 42 -43 Q58 -30 57 -2 L42 9 20 4 -13 10 -48 12Z',fabric,outline,3.5);
    path(g,'M-50 -10 Q-26 -24 -3 -21 Q25 -19 49 -25 L54 -13 41 4 Q10 -6 -19 3 L-55 12Z','#728980',outline,2.8);
    stroke(g,'M-37 -32 Q-24 -45 -4 -46 M9 -47 l10 3','#e5b786',2.4);
    for(let i=0;i<4;i++)stroke(g,'M'+(-32+i*11)+' -10 l8 -4',clay[3],1.4);
    path(g,'M22 -24 L37 -27 41 -15 34 -5 23 -10Z','#c8ab79',outline,2.4);
    path(g,'M31 -21 L34 -17 31 -12 28 -16Z','#774f4b',null);
    clayPod(g,47,-14,.44);leaf(g,42,10,10,28,1.44,clay,true);
  }
  function grenadeSatchel(g){
    path(g,'M-42 -24 Q-4 -7 37 7 L34 22 -2 12 -44 -12Z','#7d6851',outline,2.7);
    path(g,'M-32 4 Q0 21 38 14 L31 43 Q7 59 -25 47Z','#a68058',outline,3);
    for(const [x,y] of [[-24,11],[-2,19],[21,19]])clayPod(g,x,y,.33);
    stroke(g,'M-24 36 Q0 48 25 37','#d3b980',3);
  }
  function sprayerRig(g){
    const metal=linear(g,-18,-25,25,32,['#a1b7a3','#6b8e83','#455e5c','#2e4849']);
    path(g,'M-43 -25 Q-41 -45 -12 -54 Q22 -64 44 -48 Q60 -31 53 -5 L38 1 9 -5 -20 3 -49 -3Z',metal,outline,3.5);
    path(g,'M-53 -18 Q-19 -28 22 -21 L52 -28 53 -16 17 -9 -46 -3Z','#6a6957',outline,2.7);
    for(const [x,y,w] of [[-30,-11,16],[-4,-14,15]]){
      g.save();g.translate(x,y);g.rotate(-.12);oval(g,0,0,w,10,'#c09657',outline,2.7);oval(g,0,0,w-3,7,focus(g,0,-1,15,ice),outline,1.5);
      stroke(g,'M-7 -2 l6 -3','#e0efcd',2);g.restore();}
    stroke(g,'M-14 -13 l4 -1','#be9a61',3.2);
    path(g,'M33 -20 Q44 -33 53 -26 Q60 -15 51 -6 L39 -6Z','#7d8063',outline,2.3);
  }
  function carbine(g){
    const shell=linear(g,0,-23,0,27,['#c7c5a0','#92a18b','#617f78','#3d5656']);
    g.save();g.rotate(-.08);
    path(g,'M-29 -17 L-6 -25 27 -26 37 -15 53 -9 51 5 30 6 26 16 -3 17 -17 9 -32 7Z',shell,outline,3.2);
    path(g,'M-29 -13 L-67 -13 -77 -9 -75 6 -26 7Z',shell,outline,3);
    oval(g,-72,-3,7,11,'#bc9a60',outline,2.5);oval(g,-74,-3,3.6,6,'#34484a',outline,1);
    for(const x of [-62,-53,-45])stroke(g,'M'+x+' -10 l3 12','#667764',2.1);
    path(g,'M-4 15 L15 14 24 34 15 44 2 42 -5 26Z','#9a8053',outline,2.8);
    for(const x of [1,6,11])stroke(g,'M'+x+' 20 l6 16','#c9ac76',1.6);
    path(g,'M-3 -25 L5 -32 25 -33 31 -28 28 -24Z','#9a9e78',outline,2.2);
    for(const x of [-15,-5,5])stroke(g,'M'+x+' -10 l7 -1','#d5ce9c',2);
    leaf(g,27,8,10,30,1.64,brass,true);g.restore();
  }
  function sentinelMark(g){
    path(g,'M0 -29 L10 -10 L24 -18 L17 0 L7 8 L0 24 L-7 8 L-18 1 L-25 -17 L-10 -10Z',linear(g,-19,-24,14,19,['#fff2c5','#e8be72','#a8704e']),'#3c3541',2.6);
    path(g,'M0 -20 L6 -4 L0 8 L-6 -4Z','#98e8e4','#405967',1.8);
    stroke(g,'M-18 -12 L-9 0 M18 -12 L9 0','#fff3c2',2.2);
  }
  function shieldPlate(g,stage,elite=false){
    const hull='M-79 -69 Q-79 -84 -65 -91 Q-30 -102 21 -96 L58 -83 Q72 -76 74 -61 L67 64 Q66 77 57 83 L20 98 Q-31 99 -67 88 Q-76 84 -77 74Z';
    const skin=linear(g,-78,-80,74,76,['#c0b895','#858772','#5e675d','#424f4b','#273c3c']);
    path(g,hull,skin,'#172a2a',5);
    path(g,'M-76 -66 Q-76 -82 -64 -86 Q-32 -97 12 -92 L43 -83 34 76 14 89 Q-30 91 -65 80Z',linear(g,-69,-92,39,90,['#a6a68b','#79816f','#657162','#536459']),outline,2.8);
    path(g,'M44 -84 L62 -75 68 -62 61 68 49 78 34 83Z',linear(g,33,0,70,5,['#7a8370','#58675a','#314744']),outline,2.6);
    path(g,'M-67 -84 Q-27 -99 12 -92 L15 -84 Q-28 -90 -67 -76Z','#d0c9a3',null);
    path(g,'M-66 -54 Q-32 -68 14 -61 L34 -56 32 -30 10 -32 Q-29 -37 -66 -25Z','#3d4844','#223333',3);
    path(g,'M-60 -49 Q-28 -59 11 -55 L24 -52 23 -40 10 -42 Q-27 -46 -60 -36Z',linear(g,0,-60,2,-38,['#151e23','#213943','#4e6869']),'#1e2e31',2);
    stroke(g,'M-55 -48 Q-30 -54 -13 -54 M1 -53 l13 2','#9eb1a2',1.8);
    path(g,'M-69 -11 Q-35 -22 12 -16 L29 -11 27 61 12 70 Q-25 75 -65 65Z',linear(g,-65,-23,26,69,['#909780','#6e7969','#516157']),'#4a5a51',2.2);
    stroke(g,'M-60 -6 Q-28 -16 10 -11 M-64 61 Q-26 70 10 64','#a6ad90',2);
    path(g,'M-66 18 l8 -3 -1 24 -8 2Z M-54 15 l4 -1 -1 13 -4 1Z','#cfaf68',null);
    for(const [x,y] of [[-69,-72],[17,-76],[59,-65],[-70,-16],[57,-21],[-69,71],[15,80],[54,67]]){
      oval(g,x,y,3,3.5,'#484f44','#303c36',1.4);stroke(g,'M'+(x-1.5)+' '+(y-.7)+' l2.4 -1','#c4bf9e',1.3);
    }
    path(g,'M-74 69 Q-38 83 15 80 L33 72 33 86 17 94 Q-26 97 -67 85Z','#394c48',outline,2.5);
    stroke(g,'M-65 76 Q-34 86 3 86 M-74 -62 l-1 48 M66 -51 l-4 87','#d1c9a7',1.7);
    if(elite){
      path(g,'M-71 -23 Q-35 -38 12 -29 L34 -23 L30 50 L13 78 L-31 86 L-65 66Z',
        linear(g,-65,-22,25,67,['#a190ac','#69566f','#4d425b','#363949']),'#332d3c',3);
      path(g,'M-70 -23 Q-36 -38 11 -30 L31 -25 L25 -16 L9 -20 Q-37 -27 -66 -15Z',
        linear(g,-66,-30,20,-13,['#f8df96','#a58055','#e7bea1']),outline,2);
      stroke(g,'M-62 -9 L-59 53 L-41 69 M23 -12 L19 47 L5 65','#cbb07f',3.5);
      stroke(g,'M-58 -5 L-56 50 M20 -7 L18 7','#f0d596',1.3);
      g.save();g.translate(-19,23);g.rotate(-.095);g.scale(1.33,1.30);sentinelMark(g);g.restore();
      for(const [x,y] of [[-20,68],[-8,65],[4,61]])path(g,'M'+x+' '+(y-4)+' l3 4 -3 6 -3 -4Z','#a4d8ce','#3c5154',1.3);
    }
    const cut=(d,w)=>{g.save();g.translate(1,1.2);stroke(g,d,'#c2bda0',w+1);g.restore();stroke(g,d,'#303f3a',w);};
    if(stage){cut('M16 -90 l-8 12 3 6 -10 10 2 6',2.9);cut('M-64 42 l12 6 -3 6 13 2',2.4);cut('M5 -51 l-6 5 1 3 -9 5',1.7);}
    if(stage===2){
      g.save();g.globalCompositeOperation='destination-out';
      path(g,'M-90 -105 H-36 L-41 -82 -49 -77 -47 -70 -55 -68 -53 -60 -63 -57 -66 -47 -90 -45Z','#000',null);g.restore();
      stroke(g,'M-41 -82 l-8 5 2 7 -8 2 2 8 -10 3 -3 10','#e1cba2',2.4);
      cut('M4 -45 l-11 10 4 9 -12 11 3 13 -13 11 1 12',3.2);cut('M59 30 l-11 6 -6 13 -10 1',2.6);
    }
  }
  function limbPlate(g,shin){
    const top=shin?-76:-62,bottom=shin?76:65;
    const shell='M-44 '+(top+17)+' Q-31 '+(top-3)+' 4 '+top+' L33 '+(top+8)+' 43 '+(top+27)+' 28 '+(bottom-9)+' 9 '+bottom+' -24 '+(bottom-8)+' -37 '+(bottom-26)+'Z';
    path(g,shell,linear(g,-38,top,38,bottom,['#b4b095','#7c8472','#54645b','#344946']),outline,4.5);
    path(g,'M-36 '+(top+25)+' Q-3 '+(top+4)+' 31 '+(top+17)+' L24 '+(top+39)+' Q-10 '+(top+26)+' -35 '+(top+43)+'Z','#8c927d','#424f46',3);
    for(const y of [-13,15,43])stroke(g,'M-30 '+y+' Q-4 '+(y-8)+' 27 '+(y-2),'#4a584e',3);
    stroke(g,'M-28 '+(top+18)+' Q-11 '+(top+8)+' 7 '+(top+8),'#d0c9a7',3);
    oval(g,26,top+20,3.4,3.4,'#aea887',outline,1.8);
  }
  const drawers=[
    ['melon/crown',icyRig],['gatling/crown',peaRig],['prism/crown',prismRig],
    ...['melon','gatling','prism'].map(k=>[k+'/harness',g=>harness(g,k)]),
    ...['melon','gatling','prism'].map(k=>[k+'/ring',g=>ring(g,k)]),
    ['melon/front',g=>{
      path(g,'M-57 0 L-31 -18 M-57 0 L-31 18 M57 0 L31 -18 M57 0 L31 18',null,'#d8fffa',5.5);
      flake(g,0,0,29,'#9ef0fc');
    }],
    ...['melon','gatling','prism'].map(k=>[k+'/seed',g=>seed(g,k)]),
    ['melon/burst',fallingIce],['gatling/beam',g=>beam(g,'gatling')],['prism/beam',g=>beam(g,'prism')],
    ['prism/bloom',g=>{for(let i=0;i<8;i++){g.save();g.rotate(i*tau/8);gem(g,0,-28,10+i%3*3,41,i%2?.1:-.1);g.restore();}star(g,0,0,27,crystal[3]);}],
    ['grenadier/crown',grenadierRig],['grenadier/harness',grenadeSatchel],['grenadier/seed',g=>clayPod(g,0,4,1.42)],
    ['sprayer/crown',sprayerRig],['sprayer/harness',carbine],['sprayer/beam',g=>beam(g,'sprayer')],
    ['sprayer/seed',g=>{path(g,'M-65 -1 Q-51 -13 -32 -15 L32 -11 64 0 28 15 -40 13Z',linear(g,0,-16,0,16,[brass[3],brass[2],brass[1]]),outline,2);}],
    ['shieldguard/greave',g=>limbPlate(g,true)],['shieldguard/bracer',g=>limbPlate(g,false)],
    ['shieldguard/chip',g=>path(g,'M-67 -26 L-9 -44 54 -20 62 -8 36 0 29 19 3 8 -8 25 -45 32Z',linear(g,-38,-28,31,19,['#a9a88c','#68796a','#354b47']),outline,4)],
    ...[0,1,2].map(i=>['shieldguard/shield'+i,g=>shieldPlate(g,i)]),
    ...[0,1,2].map(i=>['eliteguard/shield'+i,g=>shieldPlate(g,i,true)]),
    ['eliteguard/crest',g=>{g.scale(2.55,2.55);sentinelMark(g);}],
    ...['grenadier','sprayer','shieldguard'].map(k=>[k+'/ring',g=>ring(g,k)]),
    ['melon/crownBase',g=>icyRig(g,true)],
    ['gatling/crownBase',g=>{leaf(g,19,15,17,48,.95,pea,true);leaf(g,12,21,13,36,1.7,pea,true);}],
    ['prism/crownBase',g=>{leaf(g,16,21,11,52,.95,colors.prism);leaf(g,1,25,9,40,-1.35,pea);}],
    ...[1,2,3].map(i=>['gatling/crown'+i,g=>peaRig(g,i)])
  ];
  function blend(hex,to,k){
    const n=parseInt(hex.replace('#',''),16),b=parseInt(to.replace('#',''),16);
    const channel=i=>Math.round((n>>i&255)*(1-k)+(b>>i&255)*k).toString(16).padStart(2,'0');
    return '#'+channel(16)+channel(8)+channel(0);
  }
  function roster(){
    if(entries.size||typeof gardenHybridRoster==='undefined')return;
    const list=gardenHybridRoster.entries;
    for(const e of Array.isArray(list)?list:Object.values(list||{})){
      if(!e?.kind||colors[e.kind])continue;
      entries.set(e.kind,e);const tint=/^#[0-9a-f]{6}$/i.test(e.tint)?e.tint:'#81a574';
      colors[e.kind]=[blend(tint,'#182e35',.62),blend(tint,'#39574d',.22),tint,blend(tint,'#ffedc9',.72)];
    }
  }
  const symbols={
    medic:'M-6 -22 L6 -22 6 -6 22 -6 22 6 6 6 6 21 -6 21 -6 6 -22 6 -22 -6 -6 -6Z',
    cabbage:'M-23 9 Q-26 -8 -11 -15 Q-6 -30 5 -18 Q22 -22 22 -8 Q30 3 19 13 Q-9 29 -23 9Z',
    butter:'M-24 -3 L10 -16 26 -7 24 9 -9 20 -24 12Z',
    coconut:'M-26 6 Q-23 -20 -1 -21 Q22 -21 25 7 Q18 26 -1 21 Q-24 24 -26 6Z',
    flame:'M-17 20 Q-32 5 -12 -13 Q-11 0 -4 -3 Q4 -17 1 -27 Q29 -11 18 13 Q8 30 -3 24Q-18 28 -17 20Z',
    chain:'M4 -28 L-21 6 -3 4 -10 27 25 -10 4 -6 17 -27Z',
    boomerang:'M-24 -17 Q-16 -23 -9 -14 L8 4 25 -9 Q32 -7 27 1 L8 20 Q3 24 -3 19Z',
    star:'M0 -28 L8 -9 28 -8 13 6 16 26 0 16 -17 25 -14 5 -29 -8 -8 -10Z',
    cherry:'M-18 -2 Q-26 -12 -14 -17 Q-2 -22 3 -6 Q16 -11 23 0 Q30 12 15 20 Q3 24 -3 10 Q-16 16 -23 8 Q-26 0 -18 -2Z',
    stomp:'M-23 -1 Q-23 -20 -9 -21 L8 -18 14 -23 21 -9 Q30 6 19 10 L27 18 23 23 10 21 -6 15 -21 20 -28 13 -18 8Z',
    frostbud:'M0 -27 L14 -12 19 5 6 23 -7 23 -21 5 -13 -11Z',
    fume:'M-28 0 Q-25 -14 -8 -14 Q-1 -27 14 -20 Q29 -15 24 -3 Q33 10 19 17 L-14 18 Q-29 15 -28 0Z',
    bulwark:'M0 -25 L25 -17 22 3 Q18 19 0 27 Q-18 19 -23 5 L-25 -17Z',
    chard:'M-5 25 Q-28 23 -23 -6 Q-18 -22 18 -27 Q31 1 13 17 L-1 20Z',
    apple:'M1 -15 Q12 -23 23 -14 Q32 -3 17 18 Q6 28 0 21 Q-12 28 -23 11 Q-37 -11 -18 -17 Q-9 -22 1 -15Z',
    thorn:'M-4 25 L-8 4 -24 0 -10 -8 -14 -24 1 -11 12 -29 12 -10 30 -16 17 1 24 6 8 10Z',
    bass:'M-19 -15 L-6 -20 -7 12 Q-8 23 -20 23 Q-30 24 -28 15 Q-26 7 -16 8 L-15 -7 -5 -11 13 -16 24 -19 24 6 Q22 16 12 18 Q1 20 0 12 Q0 3 14 2 L14 -8 -17 3Z'
  };
  function sigil(g,e,x,y,scale){
    const p=colors[e.kind];g.save();g.translate(x,y);g.scale(scale,scale);
    path(g,symbols[e.kind]||symbols.star,linear(g,-10,-21,12,22,[p[3],p[2],p[1]]),p[0],3);
    const details={cabbage:'M-16 1 Q-2 -9 12 -10 M-8 11 Q-3 1 10 -3',butter:'M-20 -1 L-8 4 21 -6 M-8 4 L-9 15',
      coconut:'M-13 -4 l1 3 M-4 -10 l2 3 M-2 1 l1 3',cherry:'M-11 -15 Q-13 -27 1 -27 Q11 -27 17 -32 M2 -28 l8 16',
      frostbud:'M0 -22 L0 19 M-9 7 L0 2 10 7 M-9 -4 L0 -9 9 -4',chard:'M-8 19 Q-4 3 14 -20 M-3 5 l-9 -4 M3 -4 l9 -4',
      apple:'M0 -14 Q-3 -25 5 -29 M5 -25 Q17 -30 20 -23 Q12 -17 5 -25',bulwark:'M-16 -12 Q0 -15 16 -12 L13 5 0 17',
      stomp:'M-12 -7 l8 2 M2 -6 l9 -3',flame:'M-4 20 Q-14 12 0 1 Q1 10 7 10',fume:'M-17 2 Q-13 -5 -7 -5 M3 -11 Q10 -16 14 -10'};
    if(details[e.kind])stroke(g,details[e.kind],p[0],2.6);g.restore();
  }
  function botanicalCrown(g,e,image,body=true){
    const p=colors[e.kind],device=e.family,hasYoke=['lob','blast','precision'].includes(device),coil=['electric','sonic','control'].includes(device);
    // The fork and coils hold the plant at the cervical joint.
    for(const [x,y,w,h,a] of [[11,21,18,49,1],[23,20,13,61,.58],[-13,24,11,42,-1.3]])leaf(g,x,y,w,h,a,p,hasYoke);
    if(hasYoke){
      path(g,'M-41 38 Q-62 15 -62 -11 L-56 -22 -50 -18 -51 -4 Q-52 16 -31 28 L32 26 Q51 13 53 -7 L61 -14 66 -8 Q69 19 45 36 L-22 55Z',linear(g,-50,-13,50,40,['#efcb83','#a88c63','#756b4c']),outline,3.4);
    }else if(coil){
      for(const [x,ang] of [[-44,-.3],[45,.24]]){g.save();g.translate(x,8);g.rotate(ang);
        path(g,'M-7 17 L-4 -29 4 -33 8 16Z','#718676',outline,2);
        for(let k=0;k<4;k++)oval(g,0,-22+k*7,9,2.6,p[1],p[0],1.3);
        oval(g,0,-32,5.4,5.4,p[3],p[0],2);g.restore();}
    }else{
      leaf(g,-31,18,15,52,-.88,p);leaf(g,30,17,14,50,.90,p);
    }
    const rect=gardenArt.rects[e.plant];
    if(body&&image&&rect){
      const scale=Math.min(136/rect[2],117/rect[3]),w=rect[2]*scale,h=rect[3]*scale;
      g.save();g.translate(-3,-16);g.scale(-1,1);g.shadowColor='#203232';g.shadowOffsetY=2.2;g.shadowBlur=2;
      g.drawImage(image,...rect,-w/2,-h/2,w,h);g.restore();
    }else if(body)sigil(g,e,0,-23,1.65);
    const metal=linear(g,-40,20,40,58,[p[2],p[1],p[0]]);
    const hull=device==='guard'||device==='heal'?'M-47 25 Q-3 44 46 24 L39 48 Q9 70 -26 57 L-40 47Z':
      hasYoke?'M-48 23 L-25 32 29 29 48 20 45 34 23 53 -18 57 -41 44Z':
      'M-44 24 Q-4 35 47 21 L43 34 23 54 -19 59 -40 45Z';
    path(g,hull,metal,outline,3.6);
    stroke(g,'M-38 31 Q-9 43 31 31 M-18 51 l12 3','#d4bd86',2.6);
    for(const x of [-30,24,34])oval(g,x,x===-30?38:x===24?39:34,2.6,2.2,'#d7c798','#5c6754',1.2);
    sigil(g,e,1,43,.42);
  }
  function cultivarRig(g,e){
    const p=colors[e.kind];for(const [x,y,h,a] of [[-5,5,41,-1.54],[13,9,42,2.25],[23,1,37,1.36]])leaf(g,x,y,12,h,a,p);
    path(g,'M-33 -22 L12 0 37 3 37 13 11 14 -35 -9Z',linear(g,-30,-18,32,13,['#d4bb7b','#9d8d62','#5d6452']),outline,2.5);
    stroke(g,'M-25 -15 L10 4','#e4ce92',1.5);
    path(g,'M-19 -7 L2 -12 19 4 15 22 -3 29 -20 14Z',p[1],outline,2.5);sigil(g,e,-2,8,.51);
  }
  function familyRing(g,e){
    const p=colors[e.kind];
    for(const [r,w,color] of [[80,5,outline],[80,2.5,p[2]],[69,1.3,p[1]]]){
      g.strokeStyle=color;g.lineWidth=w;for(let i=0;i<4;i++){g.beginPath();g.arc(0,0,r,i*Math.PI/2+.09,i*Math.PI/2+1.4);g.stroke();}
    }
    for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);path(g,'M0 -63 l-5 -10 5 -8 6 8Z',p[2],p[0],1.5);g.restore();}
    sigil(g,e,0,0,.85);
  }
  function extensions(image){
    if(!entries.size)return;
    const slots=[];
    for(const e of entries.values()){
      slots.push([e.kind+'/crown',g=>botanicalCrown(g,e,image)],[e.kind+'/harness',g=>cultivarRig(g,e)],
        [e.kind+'/ring',g=>familyRing(g,e)],[e.kind+'/crownBase',g=>botanicalCrown(g,e,null,false)],
        [e.kind+'/calyx',g=>calyx(g,e.kind)]);
    }
    const size=192,cols=10,rows=Math.ceil(slots.length/cols);
    const canvas=extensionCanvas||(extensionCanvas=document.createElement('canvas'));canvas.width=size*cols;canvas.height=size*rows;
    const g=canvas.getContext('2d');
    slots.forEach(([,draw],i)=>{g.save();g.translate((i%cols+.5)*size,(Math.floor(i/cols)+.5)*size);g.scale(size/210,size/210);
      g.lineCap=g.lineJoin='round';draw(g);g.restore();});
    if(!extensionTexture)extensionTexture=new cc.Texture2D();extensionTexture.image=new cc.ImageAsset(canvas);
    slots.forEach(([key],i)=>{if(frames.has(key))return;const f=new cc.SpriteFrame();f.texture=extensionTexture;
      f.rect=new cc.Rect(i%cols*size,Math.floor(i/cols)*size,size,size);f.originalSize=new cc.Size(size,size);f.packable=false;f.addRef();frames.set(key,f);});
  }
  function loadPortrait(){
    roster();if(!entries.size||portrait)return;
    portrait=new Image();portrait.onload=()=>{if(extensionTexture)extensions(portrait);};
    portrait.src=gardenArt.src;
  }
  function atlas(){
    if(frames.has('melon/crown'))return;
    for(const k of ['melon','gatling','prism'])drawers.push([k+'/calyx',g=>calyx(g,k)]);
    const size=256,cols=6,canvas=document.createElement('canvas');canvas.width=size*cols;canvas.height=size*Math.ceil(drawers.length/cols);
    const g=canvas.getContext('2d');
    drawers.forEach(([,draw],index)=>{g.save();g.translate((index%cols+.5)*size,(Math.floor(index/cols)+.5)*size);g.scale(size/210,size/210);
      g.lineJoin=g.lineCap='round';draw(g);g.restore();});
    const tex=new cc.Texture2D();tex.image=new cc.ImageAsset(canvas);
    drawers.forEach(([key],i)=>{const f=new cc.SpriteFrame();f.texture=tex;f.rect=new cc.Rect(i%cols*size,Math.floor(i/cols)*size,size,size);
      f.originalSize=new cc.Size(size,size);f.packable=false;f.addRef();frames.set(key,f);});
  }
  function sprite(parent,key,width,height){
    const n=new cc.Node('Hybrid/'+key);n.setParent(parent);n.layer=parent.layer;
    const pic=n.addComponent(cc.Sprite);pic.sizeMode=cc.Sprite.SizeMode.CUSTOM;pic.spriteFrame=frames.get(key);
    n.getComponent(cc.UITransform).setContentSize(width,height);return n;
  }
  function calyx(g,kind){
    const p=colors[kind],ice=kind==='melon'||kind==='frostbud',crystal=kind==='prism'||kind==='chain';
    // A solid calyx joins the actual plant to the collar. Narrow flowers, reeds
    // and crystals keep enough structure to support a complete botanical head.
    const seed=crystal?'M-64 5 L-54 -29 L-32 -51 L-3 -56 L39 -43 L62 -15 L60 15 L35 45 L11 57 L-26 47 L-53 31Z':
      'M-66 2 C-65 -28 -40 -48 -20 -53 Q2 -61 22 -52 C50 -51 68 -27 65 -2 Q62 29 28 46 Q15 54 2 59 Q-9 52 -25 48 C-51 40 -69 25 -66 2Z';
    path(g,seed,linear(g,-41,-51,51,52,[p[2],p[1],p[0]]),outline,3.4);
    if(crystal){
      path(g,'M-53 -28 L-18 -41 L-7 -6 L-27 18 L-48 10Z',p[2]+'9f',null);
      path(g,'M8 -40 L40 -35 L56 -12 L29 18 L3 2Z',p[1],null);
      stroke(g,'M-56 7 L-25 27 L-6 52 M58 7 L30 29 L8 52',p[3],1.7);
    }else{
      for(const [x,s] of [[-42,-1],[29,1]]){g.save();g.translate(x,25);g.scale(s,1);
        path(g,'M-13 18 Q-28 4 -28 -19 Q-17 -27 -3 -35 Q-7 -18 4 -6 Q10 7 -13 18Z',
          linear(g,-26,-34,1,12,[p[2],p[1],p[0]]),p[0],2);
        stroke(g,'M-14 15 Q-17 -3 -9 -22 M-15 3 l-8 -9',ice?p[3]:p[2],1.45);g.restore();}
      stroke(g,'M-46 -25 Q-32 -41 -19 -41 M-11 -45 l6 -1',p[3],2.3);
    }
    for(const [x,y,w,h,a] of [[-19,49,11,48,-.96],[22,46,12,47,.98],[5,56,9,36,.30]])leaf(g,x,y,w,h,a,p,ice);
  }
  function sever(e,part){
    if(!part?.node?.isValid||!e.plant||!e.crown.isValid||e.detached)return;
    const mask=gardenHybridHeads.maskDebris(part),anchor=mask.anchor;
    const holder=new cc.Node('GardenHybrid/DetachedHead');holder.layer=anchor.layer;holder.setParent(anchor);
    for(const n of [e.calyx,e.crown])if(n?.isValid){n.setParent(holder,true);n.setPosition(0,0,0);n.angle=0;}
    const live=e.liveHead;e.liveHead=null;e.detached=true;let done=false;
    const node=part.node;
    function finish(){
      if(done)return;done=true;debris.delete(node);node.off(cc.Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,active);
      mask.release();live?.dispose();if(holder.isValid)holder.destroy();
    }
    function active(){if(!node.activeInHierarchy)finish();}
    debris.set(node,{holder,live,finish});node.on(cc.Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,active);
  }
  function attach(z,kind){
    if(!z?.db?.node?.isValid||!colors[kind])return null;
    let e=rigs.get(z);if(e&&e.kind===kind&&e.root.isValid)return e;
    if(e)detach(z);atlas();
    if(entries.has(kind)&&!frames.has(kind+'/crown'))extensions(portrait?.naturalWidth?portrait:null);
    const base=z.db.node,arm=z.db.armature(),pick=(...ids)=>ids.map(s=>arm?.getBone(s)).find(Boolean);
    const head=pick('head','Head','head_root'),hat=pick('armorSOCKET','armorSocket'),body=pick('body','chest','torso','butt');
    const h=head?.globalTransformMatrix,c=body?.globalTransformMatrix;
    const d=h&&c?clamp(Math.hypot(h.tx-c.tx,h.ty-c.ty)/76,.7,2.4):1;
    const root=new cc.Node('GardenHybrid/'+kind);root.setParent(base);root.layer=base.layer;
    const elite=kind==='eliteguard',guard=kind==='shieldguard'||elite;
    const empty=()=>{const n=new cc.Node();n.setParent(root);n.active=false;return n;};
    const harnessNode=guard?empty():sprite(root,kind+'/harness',149*d,149*d);
    const extent=kind==='gatling'?171:kind==='prism'?168:entries.has(kind)?159:179;
    const crown=guard?empty():sprite(root,kind+'/crown',extent*d,extent*d);
    const limbs=[];
    if(guard)for(const side of ['there','here'])for(const shin of [true,false]){
      const proximal=shin?pick('leg_'+side+'_lower'):pick('armhand_'+side,'arm_'+side+'_lower');
      const distal=shin?pick('foot_'+side+'_root','foot_'+side):pick('hand_'+side);
      if(proximal&&distal){
        const node=sprite(root,'shieldguard/'+(shin?'greave':'bracer'),(shin?67:54)*d,80*d);
        limbs.push({node,n:node,pic:node.getComponent(cc.Sprite),ui:node.getComponent(cc.UITransform),proximal,distal,side,shin});
      }
    }
    const shield=guard?sprite(root,kind+'/shield0',(elite?219:203)*d,(elite?238:226)*d):null;
    const crest=elite?sprite(root,'eliteguard/crest',59*d,59*d):null;
    e={z,kind,root,base,d,head,hat,body,harnessNode,crown,kick:0,shield,crest,limbs,shieldStage:0,elapsed:0,reload:0,shot:0,skin:''};
    if(guard){z._gardenHeavyWear=e;e.grip=limbs.find(l=>!l.shin&&l.side==='here')?.distal;}
    const plant=entries.get(kind)?.plant||{melon:'wintermelon',gatling:'megagatling',prism:'magnifyinggrass'}[kind];
    if(plant){
      e.plant=plant;e.face=gardenHybridHeads.replaceFace(z);
      z._gardenHeadWear=e;
      e.headScale=kind==='chain'||kind==='prism'?1.30:1.27;
      root.setSiblingIndex(0);
      const fw=e.face?.width||110*d,fh=e.face?.height||95*d;
      e.calyx=sprite(root,kind+'/calyx',fw*1.69,fh*1.76);
      e.calyx.setSiblingIndex(crown.getSiblingIndex());
      crown.getComponent(cc.UITransform).setContentSize(fw*1.92,fh*1.93);
      const saved=Object.getOwnPropertyDescriptor(z,'drop'),drop=z.drop;
      const wrapper=function(asset,...args){
        const part=drop.call(this,asset,...args);if(asset===this.zombieHead&&this===z)sever(e,part);return part;
      };
      z.drop=wrapper;e.undoDrop=()=>{if(z.drop===wrapper){if(saved)Object.defineProperty(z,'drop',saved);else delete z.drop;}};
      if(typeof gardenHybridShots!=='undefined')gardenHybridShots.warm?.([kind]);
      e.liveHead=gardenHybridHeads.attach({kind,plant,parent:crown,width:fw*1.61,height:fh*1.72});
    }
    rigs.set(z,e);pose(e,0);return e;
  }
  function seatCaps(e,rise){
    e.z._gardenPlantHelmetRise=rise;
    for(const armor of e.z.armors||[]){
      if(!armor.node?.isValid||!/cone|bucket|helmet/i.test(armor.node.name))continue;
      const socket=e.z.armorParent?.(armor.ID)||e.z.armorSocket;if(!socket?.isValid||armor.node.parent!==socket)continue;
      const seats=e.capSeats||(e.capSeats=new Map());let seat=seats.get(socket);
      if(!seat){seat=new cc.Node('GardenHybrid/HelmetSeat');seat.layer=socket.layer;seat.setParent(socket);seats.set(socket,seat);}
      armor.node.setParent(seat,false);
    }
    if(e.capSeats)for(const [socket,seat] of e.capSeats){
      if(!socket.isValid||!seat.isValid)continue;
      const scale=Math.abs(socket.worldScale.y);
      seat.setPosition(0,rise*(scale>1e-5?Math.abs(e.base.worldScale.y)/scale:1),0);
    }
  }
  function pose(e,dt){
    e.liveHead?.tick?.(dt);
    const h=e.head?.globalTransformMatrix,hat=e.hat?.globalTransformMatrix,c=e.body?.globalTransformMatrix,d=e.d;
    const mask=e.face,m=mask?.head?.globalTransformMatrix;
    const x=m?m.a*mask.x+m.c*mask.y+m.tx:hat?.tx??h?.tx??0,y=m?m.b*mask.x+m.d*mask.y+m.ty:hat?.ty??(h?h.ty+30*d:170*d);
    const bx=c?.tx??x+14*d,by=c?.ty??y-90*d;
    const q=gardenChallengeHybrids.state(e.z),windup=q?.phase==='windup'?clamp(q.progress||0,0,1):0;
    const k=e.kind,station=entries.get(k)?.family;
    const thrower=['melon','cabbage','butter','apple','cherry','coconut','chard','boomerang','grenadier'].includes(k);
    e.elapsed+=dt;e.reload=Math.max(0,e.reload-dt);
    e.kick=Math.max(0,e.kick-dt*5.8);
    if(e.detached){e.harnessNode.setPosition(bx*.62+x*.38,by+(y-by)*.31,0);return;}
    const offset=mask?{x:0,y:0}:{x:4,y:11};
    const load=windup*windup*(3-2*windup),recoil=e.kick*e.kick,back=thrower?11:k==='gatling'||k==='sprayer'?6:3;
    const hop=k==='stomp'&&q?.phase==='flight'?Math.sin(Math.PI*clamp(q.progress||0,0,1))*13:0;
    const release=thrower?(-12*recoil):2.8*recoil;
    const baseTilt=m?(Math.atan2(m.b,m.a)-mask.angle)*180/Math.PI:0;
    const growth=e.headScale||1,lift=(growth-1)*(mask?.height||0)*.47;
    // Grow about the plant's junction with the neck, including while biting or turning.
    const radians=baseTilt*Math.PI/180,cx=x-Math.sin(radians)*lift,cy=y+Math.cos(radians)*lift;
    e.crown.setPosition(cx+(offset.x+back*load+release)*d,cy+(offset.y+(thrower?6:4)*load+hop+Math.sin(e.elapsed*3)*.6)*d,0);
    const tilt=baseTilt+(thrower?-19*load+23*recoil:k==='gatling'||k==='sprayer'?-4*load+9*recoil:station==='sonic'?-9*load+12*recoil:7*load-6*recoil);
    if(Math.abs(e.crown.angle-tilt)>.1)e.crown.angle=tilt;
    if(e.calyx){e.calyx.setPosition(cx,cy,0);e.calyx.setScale(growth,growth,1);e.calyx.angle=baseTilt;seatCaps(e,lift*1.86);}
    const squish=k==='stomp'||k==='bass'?.13:thrower?.045:.029;
    if(!e.liveHead?.ready)e.crown.setScale(growth*(1+squish*load-.045*recoil),growth*(1-squish*load+.06*recoil),1);
    else e.crown.setScale(growth,growth,1);
    const hasNative=!!e.liveHead?.ready;
    const skin=hasNative?k+'/crownBase':k==='melon'&&e.reload>0?'melon/crownBase':k==='gatling'&&e.kick>0&&e.shot%4?'gatling/crown'+(e.shot%4):k+'/crown';
    if(skin!==e.skin&&frames.has(skin)){e.crown.getComponent(cc.Sprite).spriteFrame=frames.get(skin);e.skin=skin;}
    e.harnessNode.setPosition(bx*.62+x*.38+(e.kind==='sprayer'?-16:6)*d,by+(y-by)*.31,0);
    if(e.shield){
      const suit=gardenChallengeArmor.state(e.z),part=suit?.shield;
      if(e.crest){e.crest.active=!!suit;e.crest.setPosition(bx+30*d,by+(y-by)*.32,0);e.crest.angle=baseTilt*.45;}
      for(const limb of e.limbs){
        const p=limb.proximal.globalTransformMatrix,q=limb.distal.globalTransformMatrix;
        const dx=p.tx-q.tx,dy=p.ty-q.ty,len=Math.hypot(dx,dy);
        limb.node.active=!!suit&&suit.vest.hp>0&&len>d*3;
        if(limb.node.active){
          limb.node.setPosition(q.tx+dx*.53,q.ty+dy*.53,0);
          limb.node.angle=Math.atan2(dy,dx)*180/Math.PI-90;
          limb.node.getComponent(cc.UITransform).setContentSize((limb.shin?67:54)*d,len*(limb.shin?1.5:1.7));
        }
      }
      e.shield.active=!!part&&part.hp>0;
      if(e.shield.active){
        const stage=part.hp>part.max*.66?0:part.hp>part.max*.33?1:2;
        if(stage!==e.shieldStage){e.shield.getComponent(cc.Sprite).spriteFrame=frames.get(e.kind+'/shield'+stage);e.shieldStage=stage;}
        const grip=e.grip?.globalTransformMatrix;
        const lean=grip?clamp((grip.tx-bx)*.16,-9*d,9*d):0;
        const swing=grip?clamp((grip.ty-by)*.13,-8*d,8*d):0;
        e.shield.setPosition(x-74*d+lean,by+(y-by)*.22+swing,0);
        e.shield.angle=clamp(lean/d*.7,-6,6);
      }
    }
  }
  function detach(z){
    const e=rigs.get(z);
    if(e&&z._gardenHeavyWear===e)delete z._gardenHeavyWear;
    if(e?.plant){
      if(z._gardenHeadWear===e)delete z._gardenHeadWear;
      if(e.capSeats)for(const [socket,seat] of e.capSeats)if(seat.isValid){
        if(socket.isValid)for(const n of [...seat.children])n.setParent(socket,false);
        seat.destroy();
      }
      delete z._gardenPlantHelmetRise;
    }
    e?.undoDrop?.();e?.face?.release();e?.liveHead?.dispose?.();if(e?.root.isValid)e.root.destroy();rigs.delete(z);
  }
  function field(){
    if(layer?.root.isValid)return layer;
    const tile=(r,c)=>board.getLnC(r,c)?.plantPoint,front=board.getLnC(board.MaxLaneIndex,0)?.inLane?.prjLayer;
    if(!front?.isValid||!tile(0,1)?.isValid||!tile(1,0)?.isValid)return null;
    const root=new cc.Node('GardenHybrid/Effects');root.setParent(front);root.layer=front.layer;
    const local=n=>root.inverseTransformPoint(new cc.Vec3(),n.worldPosition),o=local(tile(0,0)),a=local(tile(0,1)),b=local(tile(1,0));
    layer={root,local,w:Math.abs(a.x-o.x)||68,h:Math.abs(b.y-o.y)||80,at:(r,c)=>({x:o.x+(a.x-o.x)*c+(b.x-o.x)*r,y:o.y+(a.y-o.y)*c+(b.y-o.y)*r})};
    return layer;
  }
  function remove(i){const p=effects[i];p.removed=true;p.native?.dispose?.();if(p.n.isValid)p.n.destroy();effects.splice(i,1);}
  function effect(z,key,w,h,duration,essential,fn,tag){
    if(!essential&&!gardenFxSettings.enabled)return;
    const a=field();if(!a)return;
    if(effects.length>=88){
      const idx=effects.findIndex(s=>!s.essential);if(idx>=0)remove(idx);else if(!essential)return;
    }
    const n=sprite(a.root,key,w,h),e={z,n,alpha:n.addComponent(cc.UIOpacity),duration:Math.max(.05,duration||.25),age:0,essential,fn,tag};
    effects.push(e);fn(e,0);return e;
  }
  const pos=(n,x,y)=>n.setPosition(x,y,0);
  const opacity=(e,f)=>e.alpha.opacity=Math.round(255*clamp(f,0,1));
  function tile(event,a){
    const aim=event.aim||event.center||event.target?.plantInLnC||event.target?.inLnC||{},r=aim.r??aim.lIndex,c=aim.c??aim.cIndex;
    if(Number.isFinite(r)&&Number.isFinite(c))return a.at(r,c);
    const p=event.target?.plantInLnC||event.z.inLnC||{lIndex:2,cIndex:4};
    return a.at(p.lIndex??2,p.cIndex??4);
  }
  function muzzle(e,a){
    const from=e.kind==='sprayer'?e.harnessNode:e.crown,p=a.local(from),s=from.worldScale.x/a.root.worldScale.x*e.d;
    return {x:p.x+(e.kind==='gatling'||e.kind==='sprayer'?-47:e.kind==='melon'?0:-1)*s,y:p.y+(e.kind==='prism'?28:e.kind==='sprayer'?0:17)*Math.abs(s)};
  }
  function ringAt(z,key,dst,w,h,time,essential,warning){
    return effect(z,key,w,h,time,essential,(e,t)=>{
      pos(e.n,dst.x,dst.y);const k=warning?1.13-.2*t:.68+t*.64;e.n.setScale(k,k,1);
      opacity(e,warning?.72+.2*Math.sin(t*Math.PI*3):1-t*t);
    },warning?'warning':'impact');
  }
  function ray(z,key,src,dst,w,time,needed=false){
    const dx=dst.x-src.x,dy=dst.y-src.y,l=Math.hypot(dx,dy);if(l<1)return;
    return effect(z,key,l,w,time,needed,(e,t)=>{
      pos(e.n,(src.x+dst.x)/2,(src.y+dst.y)/2);e.n.angle=Math.atan2(dy,dx)*180/Math.PI;
      e.n.setScale(1,1-.65*t,1);opacity(e,(1-t)*.96);
    },needed?'warning':'ray');
  }
  function flight(z,key,src,dst,w,time,rise,twist=0,needed=false,delay=0){
    return effect(z,key,w,w,time+delay,needed,(e,t)=>{
      const u=clamp((t*(time+delay)-delay)/time,0,1),dx=dst.x-src.x,dy=dst.y-src.y;
      pos(e.n,src.x+dx*u,src.y+dy*u+4*rise*u*(1-u));
      e.n.angle=twist?twist*u:Math.atan2(dy+4*rise*(1-2*u),dx)*180/Math.PI;
      opacity(e,t*(time+delay)<delay?0:1-.13*u);
    },'projectile');
  }
  function stop(z,all){
    for(let i=effects.length-1;i>=0;i--)if(effects[i].z===z&&(all||effects[i].tag==='warning'))remove(i);
  }
  const shootingPlants=new Set(['melon','gatling','prism','cabbage','butter','coconut','apple']);
  function nativeEffect(z,kind,phase,w,h,duration,essential,tag,fn){
    if(typeof gardenHybridShots==='undefined'||!essential&&!gardenFxSettings.enabled)return null;
    const a=field();if(!a)return null;
    if(effects.length>=88){const index=effects.findIndex(s=>!s.essential);if(index>=0)remove(index);else if(!essential)return null;}
    const n=new cc.Node('HybridNative/'+kind+'/'+phase);n.setParent(a.root);n.layer=a.root.layer;
    const args={kind,phase,parent:n,width:w,height:h,duration,sourceZombie:z},handle=gardenHybridShots.spawn(args);
    const e={z,n,native:handle,duration:Math.max(.045,duration),age:0,essential,tag,fn:(e,u)=>{fn(e,u);e.native?.update?.(e.nativeFrame??u);}};
    if(!handle)Promise.resolve(gardenHybridShots.warm?.([kind])).then(()=>{
      if(e.removed||!n.isValid)return;e.native=gardenHybridShots.spawn(args);
      if(e.native)e.fn(e,clamp(e.age/e.duration,0,1));else e.age=e.duration;
    });
    effects.push(e);e.fn(e,0);return e;
  }
  function pgrid(aim,a,rise=0){
    const r=aim?.r??aim?.lIndex,c=aim?.c??aim?.cIndex;if(!Number.isFinite(r)||!Number.isFinite(c))return null;
    const p=a.at(r,c);return {x:p.x,y:p.y+rise*a.h};
  }
  function originalBurst(z,kind,where,w,h,time=.44,phase='impact',essential=false,face=1){
    return nativeEffect(z,kind,phase,w,h,time,essential,phase,(e)=>{pos(e.n,where.x,where.y);e.n.setScale(face,1,1);});
  }
  function originalBeam(z,kind,src,end,a,time,essential,span){
    const dx=end.x-src.x,dy=end.y-src.y,length=Math.hypot(dx,dy);if(length<1)return;
    return nativeEffect(z,kind,'beam',length,a.h*.42,time,essential,'beam',(e,u)=>{
      // The native renderer fits the visible slot extents to a centred rectangle.
      const reach=span?clamp((u-span[0])/(span[1]-span[0]),0,1):1;
      if(span){e.nativeFrame=.97;e.n.setScale(Math.max(.001,reach),1,1);if(e.native)e.native.node.active=reach>.001;}
      pos(e.n,src.x+dx*reach/2,src.y+dy*reach/2);e.n.angle=Math.atan2(dy,dx)*180/Math.PI;
    });
  }
  function projectileId(ev){
    const aim=ev.aim||ev.center||{};
    return String(ev.projectileId??ev.index??0)+'/'+(aim.r??aim.lIndex??'')+'/'+(aim.c??aim.cIndex??'');
  }
  function finishFlight(z,key){
    for(let i=effects.length-1;i>=0;i--){const e=effects[i];if(e.z===z&&e.tag==='original-flight'&&(key===null||e.flightId===key))remove(i);}
  }
  function originalFlight(ev,rig,a,src,end,time,phase='projectile',essential=true){
    const z=rig.z,kind=rig.kind;
    const widths={melon:.82,gatling:.35,cabbage:.55,butter:.55,coconut:.79,boomerang:.57,star:.51,apple:.53,thorn:.46,prism:.60};
    const diam=a.w*(phase==='sun'?.32:widths[kind]||.49);
    const dx=end.x-src.x,dy=end.y-src.y;
    const loft=phase==='sun'?a.h*.60:kind==='melon'?Math.max(a.h*1.2,Math.abs(dx)*.27):
      ['cabbage','butter','apple'].includes(kind)?Math.max(a.h*.78,Math.abs(dx)*.23):kind==='boomerang'?a.h*.32:0;
    const spin=kind==='star'?195:kind==='boomerang'?340:kind==='melon'?102:kind==='apple'?40:kind==='cabbage'?67:0;
    const e=nativeEffect(z,kind,phase,diam,diam,time,essential,'original-flight',(p,u)=>{
      let dest=end;
      if(kind==='thorn'&&ev.target?.plantInLnC&&ev.target.node?.activeInHierarchy)dest=pgrid(ev.target.plantInLnC,a,.27)||dest;
      const x=src.x+(dest.x-src.x)*u,y=src.y+(dest.y-src.y)*u+4*loft*u*(1-u);
      const face=dx<0?-1:1,turn=spin?spin*u*face:Math.atan2((dy+4*loft*(1-2*u))*face,Math.abs(dx))*180/Math.PI;
      pos(p.n,x,y);p.n.setScale(face,1,1);p.n.angle=phase==='sun'?0:turn;
    });
    if(e)e.flightId=projectileId(ev);
  }
  function plantCast(ev,rig,a,src,dst,target,time){
    const {z,kind,type}=ev,entry=entries.get(kind),family=entry?.family,visible=shootingPlants.has(kind);
    const area=kind==='melon'||kind==='coconut';
    const ring=(where,w,h,duration)=>ringAt(z,kind+'/ring',where,a.w*w,a.h*h,duration,true,true);
    const frostFront=(duration,warning)=>{
      const cell=ev.aim||ev.center||ev.target?.plantInLnC;
      const row=cell?.r??cell?.lIndex,col=cell?.c??cell?.cIndex;
      if(!Number.isInteger(row)||!Number.isInteger(col))return;
      for(const [dr,dc] of [[-2,0],[0,-2],[2,0],[0,2]]){
        if(!board.getLnC(row+dr,col+dc)?.isInLawn())continue;
        ringAt(z,'melon/front',a.at(row+dr,col+dc),a.w*.90,a.h*.64,duration,warning,warning);
      }
    };
    if(type==='windup'){
      stop(z,false);ring(dst,kind==='melon'?2.88:area?2.55:1.22,kind==='melon'?2.08:area?1.70:.76,time);
      if(kind==='melon')frostFront(time,true);
      if(kind==='gatling'){
        for(const d of [-.32,.32])ray(z,'gatling/beam',src,{x:dst.x,y:dst.y+a.h*d},a.h*.055,time,true);
      }
      return;
    }
    if(type==='charge'||type==='recovery')return;
    if(type==='drain'&&kind==='prism'){
      stop(z,false);if(!(ev.spent>0))return;
      const bank=sunBank.component?.node,source=bank?.isValid?a.local(bank):a.at(-.86,-1.6);
      const count=gardenFxSettings.enabled?Math.max(2,Math.ceil(ev.spent/18)):1;
      for(let i=0;i<count;i++){const from={x:source.x+(i%2?1:-1)*a.w*.10*i,y:source.y-a.h*.06*i};
        originalFlight(ev,rig,a,from,src,time*(1-i*.045),'sun',i===0);}
      return;
    }
    if(type==='prime'||type==='launch'){
      stop(z,false);rig.kick=1;rig.shot=Number.isFinite(ev.index)?ev.index:rig.shot+1;
      if(kind==='melon')rig.reload=time+.24;
      if(kind==='prism'&&ev.spent>=60){
        const knee={x:src.x+(target.x-src.x)*.39,y:src.y+(target.y-src.y)*.22+a.h*.39};
        originalBeam(z,kind,src,knee,a,time,true,[0,.15]);originalBeam(z,kind,knee,target,a,time,true,[.15,.39]);
        return;
      }
      if(visible){
        const start=pgrid(ev.sourceAim||ev.fromAim,a,.28)||src;
        const end=ev.returnToSource?src:target;
        if(kind==='melon'||kind==='coconut'||kind==='apple')ring(dst,kind==='melon'?2.55:1.42,kind==='melon'?1.7:.88,time);
        const origin=kind==='gatling'?{x:start.x,y:start.y+[-.05,.00,.05,.018][Math.abs(rig.shot)%4]*a.h}:start;
        originalFlight(ev,rig,a,origin,end,time);
      }
      return;
    }
    if(type==='shot'||type==='impact'){
      stop(z,false);finishFlight(z,projectileId(ev));rig.kick=Math.max(rig.kick,.22);
      if(kind==='melon')frostFront(.51,false);
      if(kind==='chain'&&type==='shot'){
        const from=(ev.index||0)>0&&rig.lastChain?rig.lastChain:src;
        originalBeam(z,kind,from,target,a,.24,true);rig.lastChain=target;
      }
      if(type==='impact'&&kind==='chain')rig.lastChain=null;
      if(kind==='medic'||kind==='bulwark'){
        const actual=Array.isArray(ev.affected)&&ev.affected.length?ev.affected:[ev.target||z];
        for(const t of actual){const at=pgrid(t?.plantInLnC||t?.inLnC,a,.23)||dst;originalBurst(z,kind,at,a.w*1.12,a.h*.96,.52,'impact',false);}
        return;
      }
      if(kind!=='chain'||type==='shot'){
        originalBurst(z,kind,target,a.w*(kind==='melon'?1.68:kind==='coconut'?1.5:.70),a.h*(kind==='melon'?1.45:.68),.39,'impact',false);
      }
    }
  }
  function handle(event){
    const {z,kind,type}=event;
    if(kind==='mortar'&&typeof gardenMortarArt!=='undefined'){gardenMortarArt.handle(event);return;}
    if(!z||!colors[kind])return;
    if(type==='remove'){
      stop(z,true);
      // Allegiance and terminal animations stop hostile behavior before the native
      // body leaves the board. Its visual identity remains botanical through both.
      const e=rigs.get(z);
      if(e?.plant&&z.node?.activeInHierarchy&&(z.dead||z.hypnotized||e.detached)){e.liveHead?.cue?.(event);return;}
      detach(z);return;
    }
    if(type==='cancel'){const old=rigs.get(z);old?.liveHead?.cue?.(event);if(old){old.kick=0;old.reload=0;old.lastChain=null;}stop(z,true);return;}
    const e=attach(z,kind);if(!e)return;e.liveHead?.cue?.(event);if(type==='spawn')return;
    const a=field();if(!a)return;
    const src=muzzle(e,a),dst=tile(event,a),time=Math.max(.07,event.duration||.7);
    const body={x:dst.x,y:dst.y+a.h*.28};
    if(entries.has(kind)||['melon','gatling','prism'].includes(kind)){plantCast(event,e,a,src,dst,body,time);return;}
    if(kind==='shieldguard'||kind==='eliteguard'){
      if(type==='break'&&event.part==='shield'){
        const center=e.shield?.isValid?a.local(e.shield):src;if(e.shield)e.shield.active=false;
        ringAt(z,'shieldguard/ring',center,a.w*1.42,a.h*1.12,.45,false,false);
        for(let i=0;i<4;i++){const end={x:center.x+(i-1.5)*a.w*.36,y:center.y-a.h*.38};
          flight(z,'shieldguard/chip',center,end,a.w*.22,.36+i*.04,a.h*.51,140+i*43);}
      }
      return;
    }
    if(kind==='grenadier'||kind==='sprayer'){
      const lob=kind==='grenadier';
      if(type==='windup'){
        stop(z,false);ringAt(z,kind+'/ring',dst,a.w*(lob?2.7:1.05),a.h*(lob?1.83:.7),time,true,true);
        if(!lob)ray(z,'sprayer/beam',src,body,a.h*.10,time,true);
      }else if(type==='launch'&&lob){
        stop(z,false);e.kick=1;ringAt(z,'grenadier/ring',dst,a.w*2.7,a.h*1.83,time,true,true);
        flight(z,'grenadier/seed',src,body,a.w*.62,time,Math.max(a.h*1.1,Math.abs(src.x-dst.x)*.22),250,true);
      }else if(type==='impact'&&lob){
        stop(z,false);ringAt(z,'grenadier/ring',dst,a.w*2.8,a.h*1.88,.63,false,false);
        for(let i=0;i<7;i++){const a0=tau*i/7,end={x:body.x+Math.cos(a0)*a.w*.82,y:dst.y+Math.sin(a0)*a.h*.43};
          flight(z,'grenadier/seed',body,end,a.w*.28,.32+i*.03,a.h*.53,156+i*47);}
      }else if(type==='shot'&&!lob){
        stop(z,false);e.kick=1;ray(z,'sprayer/beam',src,body,a.h*.21,.16);
        flight(z,'sprayer/seed',src,body,a.w*.24,.14,0);ringAt(z,'sprayer/ring',body,a.w*.52,a.h*.41,.19,false,false);
      }
      return;
    }
  }
  let previous=null;
  function draw(){
    if(!rigs.size&&!effects.length&&!debris.size){previous=null;return;}
    const now=level.component?.gamedTime||0,dt=previous===null||!level.gaming||ui.component?.paused?0:clamp(now-previous,0,.55);previous=now;
    for(const [z,e] of rigs){
      const finishing=e.plant&&(z.dead||z.hypnotized||e.detached);
      if(!z.node?.activeInHierarchy||!e.root.isValid||!finishing&&!gardenChallengeHybrids.state(z)){
        stop(z,true);detach(z);continue;
      }
      e.root.active=(e.plant||!z.hypnotized)&&!z.displayedStuck&&z.db.color?.a!==0;pose(e,dt);
    }
    for(const [node,p] of debris)if(!node.activeInHierarchy||!p.holder.isValid)p.finish();else p.live?.tick(dt);
    for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=dt;if(!e.n.isValid||e.age>=e.duration){remove(i);continue;}
      e.fn(e,e.age/e.duration);}
  }
  function clear(){for(const [z] of rigs)detach(z);for(const p of debris.values())p.finish();while(effects.length)remove(effects.length-1);
    if(layer?.root.isValid)layer.root.destroy();layer=null;previous=null;}
  function install(){
    if(installed)return;installed=true;
    const get=n=>window.System.get('chunks:///_virtual/'+n+'.ts');cc=window.System.get(window.System.resolve('cc'));
    board=get('Square').Square;level=get('levelController').LevelPlay;ui=get('UI').UIInGame;sunBank=get('SunCount').SunCount;
    loadPortrait();
    gardenChallengeHybrids.subscribe(handle);cc.director.on(cc.Director.EVENT_BEFORE_DRAW,draw);
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,clear);
    gardenFxSettings.subscribe(enabled=>{if(!enabled)for(let i=effects.length-1;i>=0;i--)if(!effects[i].essential)remove(i);});
  }
  function shieldFace(z){
    const e=rigs.get(z);if(!e?.shield?.activeInHierarchy)return null;
    const tr=e.shield.getComponent(cc.UITransform);
    return Math.min(...[-.36,.33].map(k=>tr.convertToWorldSpaceAR(new cc.Vec3(tr.width*k,0,0)).x));
  }
  return {install,clear,shieldFace,departBody:detach};
})();
