// The workshop and the lawn share the same four painted emplacements.
const gardenEquipmentEngraving=(()=>{
  const outline='#203e3d',light='#ffefb7';
  function tools(g){
    const gradient=(x1,y1,x2,y2,stops)=>{const q=g.createLinearGradient(x1,y1,x2,y2);stops.forEach(([at,c])=>q.addColorStop(at,c));return q;};
    const enamel=(top,bottom)=>gradient(-6,top,4,bottom,[[0,'#e2f4db'],[.12,'#94c4ad'],[.30,'#548d80'],[.51,'#396e68'],[.74,'#1e4d50'],[.94,'#305b56'],[1,'#88afa1']]);
    const brass=(top,bottom)=>gradient(-3,top,3,bottom,[[0,'#fff3c3'],[.14,'#e6bc81'],[.31,'#fbdf9b'],[.5,'#b57d4e'],[.73,'#855a42'],[.89,'#d0a573'],[1,'#ead89c']]);
    const path=(d,fill,edge=outline,weight=1.1)=>{const p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p);}if(edge){g.strokeStyle=edge;g.lineWidth=weight;g.stroke(p);}};
    const line=(d,c,width=.65)=>path(d,null,c,width);
    const ell=(x,y,a,b,paint,border=null,weight=1)=>{g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);if(paint){g.fillStyle=paint;g.fill();}if(border){g.strokeStyle=border;g.lineWidth=weight;g.stroke();}};
    const transform=(x,y,rot,sx,sy,fn)=>{g.save();g.translate(x,y);g.rotate(rot);g.scale(sx,sy);fn();g.restore();};
    const lens=(x,y,a,b,dark,mid,hot)=>{g.save();g.translate(x,y);g.scale(a,b);const f=g.createRadialGradient(-.29,-.37,.02,0,0,1);for(const [t,c] of [[0,'#fffee9'],[.19,hot],[.47,mid],[.8,dark],[1,'#193a42']])f.addColorStop(t,c);ell(0,0,1,1,f);ell(-.27,-.48,.26,.10,'#fff7d6bc');g.restore();};
    const stud=(x,y,r=1.3)=>{ell(x,y+.4,r+.4,r+.4,'#163736');ell(x,y,r,r,brass(y-r,y+r));line('M'+(x-r*.5)+' '+(y+r*.4)+' l'+r+' '+(-r*.8),'#725840',.4);};
    const feather=(x,y,rot,s,style='jade')=>transform(x,y,rot,s,s,()=>{
      const paint=style==='ember'?gradient(-10,-37,5,1,[[0,'#fff3bc'],[.32,'#f1a17b'],[.64,'#a94c4d'],[1,'#693e45']]):enamel(-37,0);
      path('M0 0 C-6 -2 -18 -14 -16 -38 C-8 -34 2 -23 3 -11 Q4 -2 0 0Z',paint);
      line('M0 -1 Q-3 -17 -15 -36 M-4 -12 q-6 -4 -8 -9 M-6 -18 l-6 -6 M-9 -24 l1 -6',style==='ember'?'#ffd39b':'#c6dca7',.6);
    });
    const ring=(x,y,r)=>{for(let i=0;i<12;i++)transform(x,y,i*Math.PI/6,1,1,()=>path('M-1.2 '+(-r+1)+' v-2.1 h2.4 v2.1Z',brass(y-r,y+r),outline,.45));ell(x,y,r,r,brass(y-r,y+r),outline,.65);ell(x,y,r*.77,r*.77,enamel(y-r,y+r),outline,.55);ell(x,y,r*.61,r*.61,null,'#f2cd88',.5);};
    return {gradient,enamel,brass,path,line,ell,transform,lens,stud,feather,ring};
  }
  function mount(g,id){
    const {gradient,enamel,brass,path,line,ell,transform:T,lens,stud,feather,ring}=tools(g);
    const jade=['#1a5857','#58c3ac','#dcffca'],amber=['#813e3b','#f29550','#fff0a2'],ice=['#365981','#75d6f4','#e0fff8'];
    // Cast and contact shadows separate the bevel from the darker turntable.
    ell(-1,35,43,4.5,'#071b2445');ell(0,33,31,3,'#132b3370');
    path('M-43 23 L-34 17 L26 16 L42 23 L41 30 Q37 35 -2 36 Q-31 35 -43 30Z',enamel(17,36),outline,1.45);
    path('M-42 23 Q-7 33 42 23L40 26Q-1 36 -42 26Z',brass(23,31),outline,.55);
    for(const x of [-33,-21,21,33]){line('M'+x+' 29 v2.4','#b2be9b',.7);stud(x,25+2*(1-Math.abs(x/35)),.7);}
    ell(-1,21,34,6.4,brass(15,27),outline,1.1);ell(-1,19.9,29,4.1,'#365956','#e4c998',.7);
    for(const side of [-1,1])T(side*17,20,0,side,1,()=>{
      feather(2,2,.92,.63);feather(6,1,1.48,.51);
      path('M-3 -1 L0 -17 L8 -19 Q13 -16 11 -12 L5 -1Z',brass(-20,0));line('M2 -2 L6 -14','#ffdfaa',.9);
    });
    if(id==='prism'){
      path('M-11 18 L-8 -34 Q0 -39 8 -34 L12 17 Q0 22 -11 18Z',enamel(-34,21));
      for(const s of [-1,1])T(s*7,6,0,s,1,()=>{
        path('M-1 0 C7 -8 22 -21 17 -39 C25 -29 27 -17 17 -5 L7 4Z',brass(-40,4));
        path('M7 -7 C22 -24 18 -33 17 -36',null,'#fff0ae',.95);feather(5,0,.75,.84);
      });
      const crystal=(x,y,k,angle,colors)=>T(x,y,angle,k,k,()=>{
        path('M0 -27 L10 -8 L8 10 L.5 21 L-9 9 L-12 -8Z',colors[1],outline,1);
        path('M0 -27 L-2 -7 L.5 21 L-9 9 L-12 -8Z',gradient(-10,-16,2,12,[[0,colors[2]],[.4,colors[1]],[1,colors[0]]]),null);
        path('M0 -27 L10 -8 L-2 -7Z',colors[2],null);path('M10 -8 L8 10 L.5 21 L-2 -7Z',colors[0],null);
        line('M0 -25 L-2 -7 L.5 18 M-11 -8 l9 1 11 -1',colors[2],.7);
      });
      crystal(-17,-23,.55,-.34,ice);crystal(17,-24,.56,.37,jade);crystal(0,-32,1.12,.03,['#39859b','#71ddd2','#dcfff1']);
      ell(0,-25,24,4.5,null,'#e3b980',1.15);ell(0,-23,23,3.4,null,'#fff1b9',.48);
      ring(0,6,7);lens(0,6,4.4,4.4,...ice);
    }else{
      path('M-17 17 L-16 1 L-7 -10 L8 -11 L17 11 L13 19Z',enamel(-11,20));
      path('M-13 17 L-9 4 L-2 -2 L3 0 L-3 16Z',brass(-6,20));line('M-6 14 l4 -8','#685642',1.2);
      T(-2,-12,id==='bombard'?-.50:id==='sniper'?-.15:-.20,1,1,()=>{
        const body='M-37 -14 Q-34 -21 -20 -24 L-8 -23 L4 -16 L15 -15 L19 -4 L9 7 L-18 11 L-34 7 L-42 -3Z';
        path(body,enamel(-25,13),outline,1.8);
        path('M-36 -13 Q-28 -20 -19 -20 L-6 -18 L5 -13 L-3 -8 L-26 -5Z',enamel(-21,-5),outline,.7);
        line('M-34 -13 Q-26 -18 -17 -18 L-8 -17','#e2e6ba',.95);
        for(let i=0;i<4;i++)line('M'+(-28+i*3)+' -8.5 l2.1 -4.4','#27534f',1.1);
        feather(-29,2,-.72,.63);feather(-31,1,-1.23,.55);
        if(id==='bombard'){
          path('M-10 -15 Q-5 -23 9 -23 L43 -25 L56 -19 L56 2 L43 9 L0 6 Q-7 3 -10 -6Z',enamel(-26,12),outline,1.65);
          // Overlapping calyx lobes and their copper veins run along the ceramic tube.
          for(const [dx,dy,k] of [[-5,1,.84],[7,1,.90],[21,1,.85]]){
            T(dx,dy,0,k,k,()=>{path('M0 -16 Q8 -25 23 -24 Q9 -16 8 -8 L8 2 L1 5 Q-3 -5 0 -16Z',brass(-24,6),outline,.8);line('M2 -14 Q9 -20 17 -22','#fff0ad',.87);line('M2 -10 Q4 -16 8 -18','#947349',.6);});
          }
          path('M30 -25 L43 -29 Q52 -28 56 -23 L56 5 L44 10 L34 8 Q41 -8 30 -25Z',enamel(-29,11));
          ell(49,-9,9.1,19.7,brass(-29,12),outline,1.4);
          ell(50,-9,6.7,15.8,'#27504f',outline,.8);ell(51,-9,5.5,13,'#682f3d','#efc681',.8);
          lens(51.6,-9,3.8,10.2,...amber);line('M47 -24 q3 -1 5 3','#fff5c5',.9);
          for(const [x,y] of [[-26,-9],[-21,-15],[-15,-15]])stud(x,y,.8);
          T(-13,5,.16,1,1,()=>{ring(0,0,8);lens(0,0,4.7,4.7,...amber);});
        }else if(id==='sniper'){
          path('M-2 -12 L53 -17 L67 -15 L67 -9 L1 -2Z',brass(-17,0),outline,1.35);
          for(const x of [9,14,39,44])path('M'+x+' -14 l2.2 -.1 .7 8 -2 .4Z',enamel(-15,-5),outline,.5);
          path('M47 -18 L59 -20 L65 -17 L67 -9 L61 -6 L48 -7Z',enamel(-20,-5));
          ell(65,-13,4,6.8,brass(-21,-6),outline,1);ell(66,-13,2.6,4.9,'#153f43','#edc483',.6);lens(66,-13,1.55,3.35,...jade);
          path('M-24 -23 l3 -5 27 -3 8 4 -2 6 -30 3Z',brass(-32,-17));
          ell(10,-26,4,5,enamel(-32,-20),outline,.8);lens(11,-26,2.7,3.5,...jade);
          path('M-23 -4 Q-12 -16 -4 -14 Q-3 -8 -12 -4 L-21 1Z',brass(-15,2),outline,.7);line('M-20 -2 l11 -8','#fff1b0',.72);
          ring(-8,4,6.2);lens(-8,4,3.45,3.5,...jade);
        }else{
          ell(12,-7,13,18,brass(-26,13),outline,1.25);
          for(const [y,end] of [[-20,42],[-14,54],[-7,61],[0,58],[6,47]]){
            path('M9 '+(y-2.5)+' L'+end+' '+(y-4)+' l4 1 .6 3.8 -4 2 L9 '+(y+2.8)+'Z',enamel(y-4,y+4),outline,.82);
            line('M16 '+(y-1.6)+' l'+(end-19)+' -1.05','#e1dcb2',.73);
            ell(end+.55,y-.5,1.8,3,brass(y-4,y+3),outline,.55);ell(end+1,y-.5,.95,1.85,'#293e40');
          }
          for(const x of [24,36]){path('M'+x+' -25 l3 -.6 3 3 1 28 -3 2 -2 -1Z',brass(-27,10),outline,.7);for(const y of [-17,-8,1])stud(x+3,y,.55);}
          ring(-14,-1,10.5);for(let i=0;i<7;i++)T(-14,-1,i*Math.PI*2/7,1,1,()=>ell(0,-7,1,1.65,'#f4d18d'));lens(-14,-1,4.2,4.2,...amber);
        }
        line('M-33 5 Q-22 10 -14 8','#b5d4aa',.8);
        stud(-29,3);stud(-18,-17);
      });
      ring(-4,10,7);lens(-4,10,3.7,3.7,...(id==='sniper'?jade:amber));
    }
    for(const x of [-13,12])stud(x,17,.85);
  }
  return {mount,tools};
})();
