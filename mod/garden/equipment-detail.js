
function gardenEquipmentDetail(g,id){
  const {line,path,ell,stud,ring,feather,lens,brass,enamel,transform:T}=gardenEquipmentEngraving.tools(g);
  const cream='#ffe6a8',mint='#d0ebc5',dark='#315450',gold='#d3a66d',pale='#d9f9f3';
  const gauge=(x,y,r,angle)=>T(x,y,angle,1,1,()=>{
    ring(0,0,r);ell(0,0,r*.78,r*.78,'#f2e7bb','#786d54',.3);
    for(let i=0;i<7;i++)T(0,0,i*Math.PI/5-1.9,1,1,()=>line('M0 '+(-r*.62)+' v'+r*.18,dark,.4));
    line('M0 0 l'+r*.34+' '+(-r*.43),'#b75847',.8);stud(0,0,.65);
  });
  const drop=(x,y,k)=>T(x,y,0,k,k,()=>{path('M0 -6 Q-5 0 -4 2 A4 4 0 0 0 4 2 Q5 0 0 -6Z',enamel(-6,5),dark,.65);line('M-2 0 q-2 3 1 4',pale,.7);});
  const threads=(x,y,n,dx=1.5)=>{for(let i=0;i<n;i++)line('M'+(x+i*dx)+' '+y+' l-.8 3.5',cream,.6);};
  const stars=(positions,shade)=>{for(const [x,y,r] of positions){line('M'+(x-r)+' '+y+' h'+r*2+' M'+x+' '+(y-r*1.55)+' v'+r*3.1,shade,.7);ell(x,y,.55,.55,'#fff8ce');}};
  switch(id){
    case 'reservoir':
      path('M-24 -4 Q-30 -2 -32 6 L-32 14 L-27 16 L-24 12Z',brass(-3,18));line('M-27 8 l-4 3','#ffe6a8',.85);
      path('M-25 -15 Q-20 -9 -21 7 L-23 9Z','#fff8cd5c',null);
      line('M-25 11 Q0 23 25 12','#825f44',1.3);line('M-25 10 Q0 21 25 11',cream,.8);
      gauge(3,1,7,.08);for(const x of [-18,18])stud(x,14,1.2);feather(-18,-25,-.9,.45);drop(15,-33,.65);break;
    case 'dew':
      for(const side of [-1,1])T(side*18,-25,side*.45,side,1,()=>{feather(0,0,.39,.40);line('M2 1 l8 -8',gold,.7);});
      path('M-27 -33 Q-9 -9 0 -9 Q9 -11 26 -34 Q14 -14 0 -6 Q-16 -15 -27 -33Z',enamel(-30,-6),dark,.7);
      for(const x of [-21,-14,-7,7,14,21])line('M'+x+' '+(-28+10*(1-Math.abs(x)/22))+' Q'+(x*.68)+' -12 0 -8',pale,.55);
      for(const [x,y] of [[-25,-33],[25,-34],[-13,-18],[12,-18]])stud(x,y,.7);
      drop(-6,-27,.49);drop(8,-31,.37);stars([[-12,-45,1.4],[10,-48,1]],pale);break;
    case 'orchard':
      path('M-20 -37 Q-15 -47 -8 -48 L-10 -39 Q-17 -31 -15 -22 Q-22 -24 -20 -37Z','#fff5cb77',null);
      for(const s of [-1,1])T(s*9,4,s*.1,1,1,()=>{path('M-2 -2 Q-5 -7 -1 -8 Q5 -6 2 -2 L4 5 Q0 8 -4 5Z',brass(-8,7),dark,.6);});
      for(const a of [-.76,-.38,.38,.76])line('M0 -54 Q'+(a*48)+' -34 '+(a*12)+' -9',cream,.6);
      line('M-24 -25 Q0 -16 25 -25 M-21 -18 Q0 -10 20 -18',gold,.7);
      for(let i=0;i<6;i++)line('M'+(-10+i*3.4)+' 15 l3 8',cream,.75);
      line('M-8 23 l16 -7 M-5 26 l14 -6','#86613a',.7);feather(1,-48,.9,.32);break;
    case 'relay':
      for(const [x,y,k] of [[-19,-5,.72],[18,-5,.72],[0,-4,1]])T(x,y,0,k,k,()=>{
        for(let j=0;j<4;j++){ell(-3+j*2,3,1.2,2.1,j===3?'#769784':'#d3f1aa');}
        line('M-6 -15 v9 M6 -15 v9',cream,.65);});
      line('M-19 -2 Q-15 16 -2 14 M18 2 Q18 15 6 16',gold,1.25);break;
    case 'bounty':
      for(const x of [-25,21]){feather(x,-30,x<0?-1.12:1.15,.31);line('M'+x+' -32 q-1 -5 2 -8',gold,.9);}
      for(const [x,y] of [[-22,-1],[0,-10],[22,-4]]){line('M'+(x-6)+' '+(y-3)+' q6 2 12 -.4',cream,1);ell(x,y+1,1.4,1,'#f5d798');}
      feather(-5,-34,-1.05,.38);feather(8,-32,1.02,.40);line('M-7 18 Q-1 14 6 17',mint,.8);break;
    case 'infirmary':
      line('M-25 -16 l45 -3 M-23 10 l45 -3',mint,.8);for(const [x,y] of [[-22,-13],[21,-16],[-21,8],[22,5]])stud(x,y,1.1);
      path('M11 -18 l5 -.4 2 29 -5 .5Z',brass(-19,11),dark,.6);
      path('M-27 -2 l8 -.5 .4 4 -8 .5Z',brass(-4,5),dark,.5);feather(17,-21,.62,.45);break;
    case 'rain':
      line('M-23 -9 L-8 -26 L6 -25 M-18 -6 L-3 -23 M19 -5 V9 M-22 7 l10 .6',pale,.8);
      for(const [x,y,k] of [[2,-10,.47],[8,0,.42],[20,-15,.43],[-10,-1,.35]])drop(x,y,k);
      for(const [x,y] of [[-26,-10],[15,-8],[22,-26],[30,9]])stud(x,y,.9);feather(-1,10,-.45,.35);break;
    case 'shell':
      for(let j=0;j<9;j++)T(-24+j*6,10-Math.abs(4-j)*.26,0,1,1,()=>{ell(0,0,2,1.55,'#d8c5a5','#957f72',.55);ell(-.45,-.4,.7,.5,'#fff1c8');});
      for(const s of [-1,1])T(s*16,11,s*.42,s,1,()=>feather(0,0,1.3,.4));
      for(const x of [-25,-14,0,12,23])line('M0 10 Q'+x+' -5 '+x+' -24','#f2e1d2',.7);
      for(let j=1;j<4;j++){const y=9-j*7;line('M'+(-28+j*1.2)+' '+y+' Q-7 '+(y+4)+' 0 '+(y+2)+' Q15 '+(y+1)+' '+(29-j)+' '+(y-2),'#bd929443',.75);}
      for(const [x,y] of [[-23,10],[22,9],[-14,-24],[13,-25]])ell(x,y,1.7,1.3,'#ffdec3','#7d6870',.5);break;
    case 'detox':
      for(const x of [-15,13]){line('M'+(x-6)+' -14 v15','#fffadd',.8);for(let i=0;i<4;i++)line('M'+(x+3)+' '+(-13+i*4)+' h3','#8f5862',.7);}
      gauge(-2,-35,5,0);drop(-15,-9,.52);feather(17,-26,.95,.35);break;
    case 'tempo':
      for(let i=0;i<12;i++)T(-5,-23,i*Math.PI/6,1,1,()=>line('M0 -17 v2',i%3?mint:cream,i%3?.7:1.35));
      ell(-5,-23,2.5,2.5,brass(-27,-20),dark,.7);feather(-14,8,-.76,.4);break;
    case 'frost':
      for(let i=0;i<6;i++)T(0,-27,i*Math.PI/3,1,1,()=>{path('M0 -21 L-2 -13 L0 -7 L2 -13Z','#a6dcf1',dark,.38);line('M-.1 -19 V-9',pale,.6);});
      stars([[-23,-43,1.6],[21,-28,1.3],[-16,-11,.8]],pale);break;
    case 'wind':
      T(-28,-31,-.10,1,1,()=>{path('M-10 -1 Q-11 -10 -4 -12 Q-4 -5 0 -4 Q3 -8 9 -9 Q7 -2 2 0 L-1 4Z',enamel(-12,4));line('M-7 -8 L0 -1 6 -6',mint,.7);});
      line('M-12 -28 l1 9 4 7','#d9b876',1.2);path('M-8 -13 q2 -5 5 -4 q2 5 -2 8Z',brass(-17,-8),dark,.6);
      for(let i=0;i<4;i++)line('M'+(-36+i*4)+' '+(-31-i*.9)+' l4 -4',mint,.6);
      ell(-1,-31,3.4,3.4,brass(-36,-27),dark,.7);line('M16 -30 L32 -30',cream,.8);
      line('M-27 -17 Q-40 -10 -32 -7 Q-27 -4 -25 -9 M18 -7 Q24 -1 34 -5',pale,.8);break;
    case 'mire':
      path('M-36 15 C-30 7 -16 9 -13 6 C-1 2 3 11 10 10 Q25 6 34 11 Q43 16 22 20 C12 25 7 26 -1 23 Q-9 19 -16 19 Q-31 21 -36 15Z',brass(4,27),'#906548',.8);
      for(const [x,y,k] of [[-18,13,1],[8,17,.83],[24,12,.64]])T(x,y,0,k,k,()=>{line('M-8 .8 C-13 -2 -5 -5 -1 -4 C6 -4 8 0 3 1.5 C0 3 -6 2 -5 0',cream,.85);lens(0,-3,2.6,2,'#9c603d','#eeb875','#ffecad');});
      for(const [x,y] of [[-24,12],[-12,10],[4,16],[16,18],[21,9],[6,21]]){ell(x,y,2,1.1,'#fff0b4a8');ell(x+3,y-.35,.7,.45,cream);}
      for(const [x,y] of [[-33,19],[-7,28],[27,21]])stud(x,y,.85);break;
    case 'thorns':
      line('M-43 15 C-35 8 -30 23 -22 15 S-9 11 -4 19 S9 23 17 15 S29 12 37 15','#375d49',2.6);
      line('M-42 14 C-34 9 -30 21 -23 14 S-9 12 -4 18 S10 21 16 15 S30 11 36 14','#9db67e',.8);
      for(const [x,y,a] of [[-32,13,-1],[-14,17,.83],[4,22,1.02],[25,12,.82]])feather(x,y,a,.26);
      for(const [x,y,k] of [[-24,16,.82],[-8,10,.72],[13,19,.9],[26,12,.61],[2,27,.61]])T(x,y,0,k,k,()=>{
        line('M-4 0 Q0 -9 -2 -27',cream,1);line('M0 -9 l3 -4 M0 -14 l-3 -3','#40775e',.85);});
      for(const [x,y] of [[-38,15],[-16,20],[10,28],[32,16]])ell(x,y,1.5,1,'#f2c487','#836450',.45);break;
    case 'tripwire':
      for(const x of [-33,32]){gauge(x,1,4.5,.12);threads(x-4,-16,4);stud(x,12,1);}
      for(const t of [.25,.50,.75]){const x=-31+t*62,y=-17+(.5-Math.abs(t-.5))*12;T(x,y,.52,1,1,()=>line('M-1 -2 v3 M1.3 -2 v3',pale,.7));}break;
    case 'arc':
      for(const x of [-21,20]){threads(x-5,3,6,1.85);line('M'+(x-5)+' -30 q-3 -4 2 -6',pale,.85);}
      path('M-3 -1 l8 -6 -3 6 5 -1 -10 8 3 -7Z',cream,dark,.5);
      stars([[-12,-36,1],[8,-37,1.7]],pale);break;
    case 'shard':
      for(const [x,y] of [[0,-38],[-13,-31],[13,-31],[-13,-16],[13,-16],[0,-9],[0,-24]]){
        line('M'+(x-6)+' '+(y-.8)+' l-.2 -3 6 -3.6',cream,.8);ell(x+.5,y+1,1.4,1,'#f0a14e');}
      feather(3,15,1.04,.43);break;
    case 'roost':
      for(let i=0;i<4;i++)line('M'+(-22+i*3)+' '+(24+i*1.3)+' Q'+(-6+i*2)+' '+(12+i)+' '+(20-i)+' '+(25+i),i%2?gold:'#795644',1.1);
      for(const [x,y] of [[-10,22],[0,20],[8,23]])lens(x,y,3.6,2.9,'#517f77','#97bbaa','#e4efce');
      for(const [x,y,k] of [[-7,-14,.8],[16,-33,.66]])T(x,y,0,k,k,()=>{line('M-4 2 Q-21 -6 -31 -18',cream,1);lens(10,-3,1.6,1.6,'#965228','#ffd062','#fff2bd');});
      for(let i=0;i<8;i++)line('M'+(-22+i*5.6)+' 24 l7 5',cream,.7);feather(-14,24,-1.1,.41);break;
    case 'flare':
      for(let i=0;i<8;i++)T(0,-31,i*Math.PI/4,1,1,()=>{line('M0 -24 v5','#ffeead',.8);ell(0,-29,1,1.4,'#ffdf95');});
      ell(0,-31,18,6,null,'#f3c87c',.7);stars([[-24,-46,1.4],[21,-50,1.1]],cream);break;
    case 'mycelium':
      for(const [x,y] of [[-32,17],[-12,25],[13,25],[30,15]]){line('M'+x+' '+y+' q4 -1 7 -6 m-4 4 l.5 -4','#c6d6ab',.8);ell(x+5,y-4,1.2,1,'#e2e7b6');}
      for(const [x,y,k] of [[-22,12,.8],[0,21,1.25],[21,11,.78]])T(x,y,0,k,k,()=>{
        for(let i=0;i<5;i++)line('M'+(-14+i*5.7)+' -17 Q'+(-7+i*2.4)+' -15 1 -14','#ffe0bb',.7);
        for(const [a,b,r] of [[-6,-26,2.1],[5,-29,1.3],[11,-22,1.7],[-12,-21,.8]])ell(a,b,r,r*.62,'#f9e5a5','#b49574',.3);});
      stars([[-30,-19,1.1],[17,-35,1.3],[31,-13,1]],mint);break;
  }
}

