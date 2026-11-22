// All equipment illustrations are drawn at the destination density, from shared brass,
// glass and foliage materials. Every silhouette also appears in the inventory thumbnails.
function drawGardenEquipment(canvas,item,mini=false,tier=1,form='mk14'){
  if(item.id==='airwing')return gardenAirArt.draw(canvas,mini,tier);
  const w=mini?156:920,h=mini?124:430,ctx=canvas.getContext('2d');
  canvas.width=w;canvas.height=h;
  const palettes={'火力':['#f9db99','#f8ab68','#a74630'],'地形':['#dcf1a0','#9bd694','#34816e'],'养护':['#ffe1ba','#e89799','#92638b'],'补给':['#fff3bd','#f0c267','#b27a49'],'阵列':['#ccfff2','#85d8e3','#3a889b']};
  const pigments={dew:['#e6ffed','#85d9d4','#397c93'],rain:['#e4fff0','#92cdc0','#587e92'],mire:['#fff0a2','#df9e49','#805047'],mycelium:['#f8e6ff','#cf9dcd','#71719d'],shell:['#ffdecf','#e5a3ab','#85738f'],tripwire:['#fcdfac','#d6a369','#508578'],frost:['#e8ffff','#9ed9eb','#577dab'],arc:['#e3daff','#aca8e6','#6970a3'],roost:['#d3f6ed','#77b5bb','#467182'],shard:['#ffe4a0','#d7a04c','#a36349'],wind:['#e1f5dc','#8ec0a8','#557d8f']};
  const [light,accent,deep]=pigments[item.id]||palettes[item.category]||palettes['阵列'];
  const ink='#122e34',brass='#d7a76e',green='#67ad96';
  const grad=(x,y,x2,y2,stops)=>{const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach((v,i)=>g.addColorStop(i/(stops.length-1),v));return g};
  const ellipse=(x,y,rx,ry,fill,stroke,width=1)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,2*Math.PI);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
  const stroke=(d,c=ink,weight=2)=>{ctx.strokeStyle=c;ctx.lineWidth=weight;ctx.stroke(new Path2D(d))};
  const fill=(d,c,edge=ink,width=2.4)=>{const p=new Path2D(d);ctx.fillStyle=c;ctx.fill(p);if(edge){ctx.lineWidth=width;ctx.strokeStyle=edge;ctx.stroke(p)}};
  const move=(x,y,k,angle,fn)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(k,k);fn();ctx.restore()};
  const glow=(x,y,r,c)=>{const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,c);g.addColorStop(1,c.slice(0,7)+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)};
  const metal=()=>grad(-30,-45,20,35,['#d2edcd','#95b9a6','#61968b','#3d706b','#2a5453','#6d9485']);
  const gold=()=>grad(-18,-45,24,20,['#fff0be','#e5c990','#c89d69','#f0cea0','#9b7051','#775946']);
  const glass=()=>grad(-24,-45,23,30,[light,accent,deep]);
  const leaf=(x,y,k,angle=0,c=green)=>move(x,y,k,angle,()=>{
    fill('M0 0 Q-21 -6 -18 -29 Q1 -28 0 0Z',grad(-18,-29,1,1,['#cae5a8',c,'#367563']),ink,1.6);
    stroke('M-1 -1 Q-7 -15 -16 -25 M-4 -7 l-8 -3 M-8 -14 l-7 -2 M-7 -12 l1 -9','#d6e8b8',1.05);
  });
  const coil=(x,y,n)=>{for(let i=0;i<n;i++){ellipse(x,y-i*4,13,4,gold(),ink,1.3);stroke('M'+(x-9)+' '+(y-i*4)+' q6 2 13 0','#f3db9f',.9)}};
  const jewel=(x,y,r)=>{glow(x,y,r*2.1,accent+'66');fill('M'+x+' '+(y-r)+' l'+(.72*r)+' '+(.65*r)+' l'+(-.1*r)+' '+(.75*r)+' l'+(-.62*r)+' '+(.6*r)+' l'+(-.65*r)+' '+(-.64*r)+' l'+(-.1*r)+' '+(-.76*r)+'Z',glass(),ink,1.6);stroke('M'+x+' '+(y-r+2)+' l-2 '+(r*.83)+' l'+(r*.45)+' '+(r*.24),light,1.3)};
  const bolt=(x,y)=>{ellipse(x,y,2.8,2.8,brass,ink,.9);stroke('M'+(x-1)+' '+(y+1)+' l2 -2','#795440',.8)};
  const orb=(x,y,r)=>{const g=ctx.createRadialGradient(x-r*.36,y-r*.46,r*.03,x,y,r);g.addColorStop(0,'#fff9d6');g.addColorStop(.23,light);g.addColorStop(.58,accent);g.addColorStop(1,deep);ellipse(x,y,r,r,g,ink,2);ellipse(x-r*.32,y-r*.41,r*.20,r*.10,'#ffffffa0');};
  const pedestal=()=>{fill('M-31 25 L-20 8 L19 8 L32 24 L32 31 Q0 42 -31 31Z',metal());ellipse(0,25,31,9,'#758f75',ink,1.5);ellipse(0,24,22,5,'#344f49','#debf85',1.3);
    stroke('M-29 30 Q0 40 29 30','#ddc894',1.05);for(const x of [-22,-12,12,22])ellipse(x,32.5-(Math.abs(x)-12)*.12,.85,.8,'#ebd0a0','#5a6354',.35);};
  const pole=()=>{pedestal();fill('M-8 21 L-5 -26 L6 -27 L9 22 Q0 27 -8 21Z',metal());coil(0,17,3);};
  const can=(x,y,r,height)=>{fill('M'+(x-r)+' '+y+' v'+(-height)+' q'+r+' -10 '+(r*2)+' 0 v'+height+' q'+(-r)+' 12 '+(-r*2)+' 0Z',metal());ellipse(x,y-height,r,5,gold(),ink);bolt(x,y-4);};
  const cogs=(x,y,r)=>move(x,y,1,0,()=>{for(let i=0;i<10;i++)move(0,0,1,i*Math.PI/5,()=>fill('M-4 -'+(r-4)+' v-7 h8 v7Z',brass,ink,1.3));ellipse(0,0,r,r,gold(),ink,2);ellipse(0,0,r*.48,r*.48,'#315346',ink,2);bolt(0,0)});
  const wing=(x,y,k,a)=>move(x,y,k,a,()=>{fill('M0 0 C-15 -2 -34 -9 -47 -31 C-27 -28 -3 -23 0 0Z',glass());for(let i=0;i<3;i++)stroke('M-2 -2 Q-'+(12+i*5)+' -'+(6+i*3)+' -'+(25+i*7)+' -'+(14+i*6),light,1)});
  ctx.lineJoin='round';ctx.lineCap='round';
  if(!mini){
    ctx.fillStyle=grad(0,0,w,h,['#132f35','#255257','#193e43']);ctx.fillRect(0,0,w,h);
    glow(w*.54,h*.46,h*.84,accent+'42');
    // Foliage in the glass casts a diffuse silhouette, far behind the artifact.
    for(const [x,y,k,a] of [[-35,390,2.1,.38],[900,380,1.45,-.35]]){
      move(x,y,k,a,()=>{
        stroke('M0 85 C52 8 57 -86 43 -174','#abc9a21a',1.3);
        for(let j=0;j<8;j++){const py=47-j*26,px=40+13*Math.sin(j*.43);
          for(const sign of [-1,1])move(px,py,1,sign*.65,()=>fill('M0 0 Q-14 -9 -7 -32 Q4 -26 0 0Z','#90c0a21b',null));}
      });
    }
    const shaft=ctx.createLinearGradient(w*.1,0,w*.61,h*.57);shaft.addColorStop(0,'#e9e3bd1d');shaft.addColorStop(.5,'#d1e0c105');shaft.addColorStop(1,'#e0ecd200');
    fill('M26 0 H290 L610 430 H420Z',shaft,null);
    let n=97;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<170;i++){const x=random()*w,y=random()*h;ellipse(x,y,.6+random()*.85,.8,'#dcead83b')}
    ctx.save();ctx.translate(w*.53,h*.86);ctx.scale(1,.30);
    for(let n=-12;n<13;n++){stroke('M'+(n*80-900)+' -900 l1800 1800','#a6d1b31d',2);stroke('M'+(n*80+900)+' -900 l-1800 1800','#a6d1b31d',2)}
    for(const r of [222,237,300])ellipse(0,0,r,r,null,'#b0d5b257',2);
    for(let i=0;i<80;i++)move(0,0,1,i*Math.PI/40,()=>stroke('M228 0 h'+(i%5?5:13),i%5?'#afccac46':'#ecd5a78c',2));
    ctx.restore();
    // Sparse translucent contours keep the silhouette clear against the plate.
    ctx.save();ctx.translate(w*.52,h*.57);
    for(const [radius,a,b] of [[158,3.52,4.74],[158,5.05,5.75],[170,.26,1.13],[170,2.19,3.16]]){
      ctx.beginPath();ctx.arc(0,0,radius,a,b);ctx.strokeStyle='#b2d2bc3b';ctx.lineWidth=1.4;ctx.stroke();
      ellipse(Math.cos(a)*radius,Math.sin(a)*radius,2.5,2.5,'#f2d6a1a0');
    }
    ctx.restore();
    for(const [x,y,sx,sy] of [[26,25,1,1],[w-26,25,-1,1],[26,h-25,1,-1],[w-26,h-25,-1,-1]])stroke('M'+x+' '+(y+13*sy)+' v'+(-13*sy)+' h'+(18*sx),'#bbceaf84',1.4);
    ctx.translate(w*.52,h*.60);ctx.scale(3.85,3.85);
  }else{ctx.translate(w/2,h*.62);ctx.scale(1.03,1.03)}
  for(const [rad,opacity] of [[57,'19'],[48,'26'],[36,'38']])ellipse(0,38,rad,rad*.14,'#112d32'+opacity);
  if(item.slot==='heavy'){
    if(item.id==='bombard'&&tier===5){ctx.translate(0,1.5);ctx.scale(.94,.94);}
    gardenEquipmentEngraving.mount(ctx,item.id);if(tier>1)gardenEquipmentTierArt.draw(ctx,item.id,tier,form);return;
  }
  switch(item.id){
    case 'intercept_firefly':{
      pedestal();coil(0,15,4);
      for(const [x,y,k,a] of [[-17,-9,.56,-.4],[16,-22,.61,.3],[1,-35,.74,-.05]]){
        move(x,y,k,a,()=>{wing(-2,0,.55,-.12);move(1,1,1,0,()=>{ctx.scale(-1,1);wing(0,0,.52,-.09)});
          ellipse(0,1,5,10,gold(),ink,1.3);orb(0,8,5);stroke('M-2 -7 l-4 -6 M2 -7 l4 -6',brass,1.2);});
      }
      for(let i=0;i<tier;i++)ellipse(-14+7*i,18,1.8,1.2,light);break;
    }
    case 'intercept_dome':{
      pedestal();coil(0,18,4);orb(0,0,8);
      fill('M-36 3 C-34 -47 30 -55 38 2 Q5 23 -36 3Z',grad(-32,-39,32,15,['#c2ffeeaa','#61d7d794','#35788570']),light,1.6);
      for(const x of [-29,-13,11,28])stroke('M0 -34 Q'+x+' -27 '+x+' 7','#d1fef3ae',1.1);
      stroke('M-31 -14 Q0 1 32 -14 M-22 -25 Q0 -16 23 -24',light,.8);
      for(const x of [-33,33]){can(x,10,4,12);bolt(x,2);}break;
    }
    case 'intercept_mirror':{
      pedestal();for(const [x,y,k] of [[-17,1,.75],[15,-11,1]]){
        move(x,y,k,0,()=>{stroke('M0 25 V-6',brass,3.3);fill('M0 -41 L17 -16 L1 7 L-14 -15Z',grad(-14,-40,17,6,['#ffedf6','#bcb4ed','#666dac']),brass,2.4);
          stroke('M0 -38 L-3 -15 L1 4 M-13 -15 L-3 -15 L15 -16','#e0feff',1.3);});}
      for(let i=0;i<tier;i++)stroke('M'+(-17+i*7)+' 21 l3 -2',light,1.2);break;
    }
    case 'thorns':case 'tripwire':case 'mire':case 'mycelium':{
      fill('M-51 13 L-3 -3 L51 12 L9 33Z',grad(0,-4,0,33,['#97b182','#40675c']));fill('M-51 13 L9 33 L51 12 L50 19 L9 40 L-51 21Z',metal());
      if(item.id==='thorns'){for(const [x,y,k] of [[-24,16,.82],[-8,10,.72],[13,19,.9],[26,12,.61],[2,27,.61]])move(x,y,k,0,()=>{fill('M-8 2 Q-12 -6 -5 -15 Q1 -25 -4 -36 Q15 -22 4 -7 L8 3Z',glass());leaf(1,-3,.44,1.5)});}
      if(item.id==='tripwire'){for(const x of [-33,32]){can(x,15,7,34);jewel(x,-23,7)}stroke('M-31 -18 Q-8 -3 31 -18',light,2.1);stroke('M-31 -11 Q-8 4 31 -12',brass,1.4);}
      if(item.id==='mire'){for(const [x,y,k] of [[-16,11,15],[6,17,20],[24,10,12]]){ellipse(x,y,k,k*.37,'#c99044','#e7bc75',1.5);orb(x-4,y-5,k*.29)}leaf(21,5,.75,.5);}
      if(item.id==='mycelium'){for(const [x,y,k] of [[-22,12,.8],[0,21,1.25],[21,11,.78]])move(x,y,k,0,()=>{fill('M-4 1 Q0 -8 -1 -18 L4 -18 Q3 -7 7 -1Z',gold());fill('M-17 -17 Q-4 -43 9 -32 Q17 -26 20 -18 Q4 -10 -17 -17Z',glass());ellipse(-3,-26,3,1.7,light);ellipse(7,-23,2,1.6,light)})}
      break;}
    case 'reservoir':pedestal();fill('M-28 -22 Q-32 -5 -27 16 Q0 32 28 16 L28 -24Z',glass());ellipse(0,-23,28,8,gold(),ink,2);ellipse(0,-23,20,4,'#e4e8a1');for(const x of [-20,0,21])stroke('M'+x+' -16 v30',brass,2.5);leaf(-17,-24,.68,-.4);orb(10,-36,8);break;
    case 'dew':pole();stroke('M-28 -36 Q0 1 28 -36','#c5e6d3',5);stroke('M-28 -36 Q0 -19 28 -36',brass,2);jewel(0,-42,12);for(const x of [-18,18])ellipse(x,-16,2.5,4,light);break;
    case 'orchard':for(const x of [-21,20])stroke('M'+x+' -16 L'+(x/3)+' 22',brass,1.8);orb(0,-29,26);stroke('M0 -54 Q-24 -30 -1 -4 M1 -54 Q21 -29 0 -4',brass,1.6);fill('M-12 12 l25 0 -4 15 -17 0Z',gold());leaf(4,-46,.55,1.35);break;
    case 'relay':pedestal();for(const [x,y,k] of [[-19,12,.7],[18,14,.72],[0,18,1]])move(x,y,k,0,()=>{can(0,0,10,36);jewel(0,-44,11);coil(0,-2,2)});break;
    case 'bounty':case 'wind':pole();if(item.id==='bounty'){stroke('M-29 -30 Q0 -50 30 -30',brass,3);for(const [x,dy] of [[-22,7],[0,-3],[22,4]]){stroke('M'+x+' -33 v16',light,1.4);move(x,dy,1,0,()=>{fill('M-8 -9 Q-8 -24 0 -24 Q8 -24 8 -10 L11 -6 Q0 -1 -11 -6Z',gold());orb(0,-4,2.7)})}}else{fill('M-39 -31 l19 -10 1 6 37 0 0 -8 23 12 -23 11 0 -9 -37 0 -1 6Z',glass());stroke('M-19 0 Q-36 4 -42 -5 M16 -11 Q30 -6 41 -15',light,1.5)}break;
    case 'infirmary':case 'detox':case 'shell':{
      pedestal();if(item.id==='infirmary'){fill('M-28 -19 L24 -22 L30 11 L-25 16Z',metal());stroke('M-10 -21 v-8 q8 -7 17 -1 v7',brass,3);fill('M-5 -14 h8 v8 h8 v7 h-8 v8 h-8 v-8 h-8 v-7 h8Z',light);leaf(18,-21,.52,.8)}
      else if(item.id==='detox'){for(const x of [-15,13]){can(x,13,10,36);fill('M'+(x-8)+' -18 h16 v24 h-16Z',glass());coil(x,-22,2);}stroke('M-15 -31 Q-16 -44 0 -44 Q11 -44 13 -30',brass,3);}
      else{fill('M-34 12 Q-42 -14 -25 -29 Q-4 -50 19 -35 Q37 -21 32 12 Q10 23 -34 12Z',glass());for(const x of [-27,-14,2,16,27])stroke('M0 10 Q'+x+' -10 '+x+' -26',light,1);orb(0,9,11)}
      break;}
    case 'rain':pedestal();fill('M-28 10 L-28 -11 L-7 -33 L23 -29 L33 -6 L33 12Z',glass());stroke('M-28 -11 L16 -8 L23 -29 M16 -8 V14 M-5 -30 L-5 12',brass,2);leaf(-2,11,.65,.1);for(const x of [2,12,22])stroke('M'+x+' -18 l-2 6',light,1);break;
    case 'tempo':pole();cogs(-5,-23,23);cogs(16,-5,12);stroke('M-5 -23 L-5 -40 M-5 -23 l12 4',ink,2);break;
    case 'frost':pole();move(0,-27,1,0,()=>{for(let i=0;i<6;i++)move(0,0,1,i*Math.PI/3,()=>{stroke('M0 0 V-25 M0 -13 L-7 -20 M0 -16 L7 -23',light,2.5)});jewel(0,0,9)});break;
    case 'arc':pedestal();for(const x of [-21,20]){can(x,14,8,22);coil(x,-9,3);orb(x,-28,7)}stroke('M-18 -32 l11 -10 -2 11 11 -5 -2 9 16 -4',light,2.4);break;
    case 'shard':pole();for(const [x,y] of [[0,-38],[-13,-31],[13,-31],[-13,-16],[13,-16],[0,-9],[0,-24]])move(x,y,1,0,()=>{fill('M0 -9 l8 4.5 v9 l-8 4.5 -8 -4.5 v-9Z',gold());ellipse(0,0,4,3,deep,ink,.8)});break;
    case 'roost':for(const [x,y,k] of [[-7,-14,.8],[16,-33,.66]])move(x,y,k,0,()=>{wing(0,0,.86,-.12);wing(3,0,.7,1.6);fill('M-13 4 Q4 -7 14 -6 L23 -3 L13 0 Q3 13 -13 4Z',metal())});for(let i=0;i<4;i++)ellipse(0,24+i*3,28-i*3,6,gold(),ink,1.3);break;
    case 'flare':pole();for(let i=0;i<8;i++)move(0,-31,1,i*Math.PI/4,()=>fill('M-2 -15 L0 -28 L3 -15Z',gold(),ink,1));orb(0,-31,14);break;
  }
  gardenEquipmentDetail(ctx,item.id);
  if(tier>1)gardenEquipmentTierArt.draw(ctx,item.id,tier);
}

