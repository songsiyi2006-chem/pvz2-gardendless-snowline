// Painted fittings for the workshop portraits and the actual lawn sprites.
// Coordinates follow the original mount, so optics, petals and flywheels stay seated on it.
const gardenEquipmentTierArt=(()=>{
  const jade=['#246659','#65cead','#dcffcd'], gold=['#925434','#eab468','#fff4bc'];
  const coral=['#8a3d49','#ed876e','#ffe7aa'], blue=['#345e85','#7ccedc','#e2fff4'];
  const orchid=['#684f88','#ba9ad1','#fff1da'], edge='#243d3d';
  const isSupply=new Set(['reservoir','dew','orchard','relay','bounty']);
  const isCare=new Set(['infirmary','rain','shell','detox','tempo']);
  const isTerrain=new Set(['frost','wind','mire','tripwire']);
  const isArray=new Set(['arc','shard','roost','flare','mycelium']);
  function kit(g){
    const k=gardenEquipmentEngraving.tools(g);
    const paint=(c,y0,y1)=>k.gradient(0,y0,0,y1,[[0,c[2]],[.28,c[1]],[.74,c[0]],[1,c[1]]]);
    function petal(x,y,angle,s,c){
      k.transform(x,y,angle,s,s,()=>{
        k.path('M0 1 C-4 -2 -9 -12 -7 -24 Q-4 -34 0 -39 Q2 -29 5 -24 Q11 -10 2 0Z',paint(c,-38,2),edge,1.35);
        k.path('M.1 -36 Q-5 -20 -1 -4 L1 -1 Q4 -17 .1 -36Z',c[0],null);
        k.line('M0 -36 Q-2 -20 .5 -1 M-3 -12 l-3 -5 M2 -19 l3 -6',c[2],.8);
        k.ell(.7,-4,1.5,1.2,'#e9c787',edge,.43);
      });
    }
    function jewel(x,y,r,c){
      k.transform(x,y,0,r,r,()=>{
        k.path('M0 -1.35 L.84 -.34 L.68 .62 L0 1.13 L-.75 .49 L-.8 -.46Z',c[1],edge,.15);
        k.path('M0 -1.29 L-.16 -.28 L0 1.05 L-.71 .48 L-.76 -.45Z',c[2],null);
        k.path('M.8 -.33 L.64 .59 L0 1.05 L-.16 -.28Z',c[0],null);
        k.line('M-.74 -.43 L-.16 -.28 L.79 -.33 M-.13 -.26 L-.01 .95',c[2],.072);
      });
    }
    function band(d){k.path(d,k.brass(-22,3),edge,.95);}
    function core(x,y,r,c){
      k.ell(x,y,r*1.12,r*1.11,k.brass(y-r,y+r),edge,1);
      k.ell(x,y,r*.87,r*.85,'#274b49',c[2],.6);
      k.lens(x,y,r*.71,r*.68,...c);
    }
    return {...k,paint,petal,jewel,band,core};
  }
  function sniper(k,t){
    const {transform:T,path,line,band,petal,core,stud,jewel,enamel}=k;
    T(-2,-12,-.15,1,1,()=>{
      // A leaf spring braces the underslung rail. The upper sight remains legible.
      path('M-13 6 Q-1 10 7 4 L32 -5 L46 -5 L39 -1 L9 10 L-2 13 L-14 11Z',enamel(-6,14),edge,1.1);
      line('M-10 8 Q-2 10 7 7 L38 -3','#edcc8b',1.2);
      band('M27 -16 l5 -.6 1 11 -5 1Z');stud(30,-7,.85);
      petal(-30,-3,-1.08,.55,jade);
      if(t>=3){
        petal(-29,-11,-.70,.79,jade);
        path('M-18 -23 L-15 -33 L0 -37 L12 -34 L11 -29 L-3 -27 L-5 -21Z',enamel(-38,-20),edge,1.2);
        path('M-20 -34 L-1 -38 L13 -35 L13 -30 L-6 -28 L-20 -29Z',k.paint(gold,-38,-28),edge,1.05);
        path('M-18 -33 L-11 -35 L-9 -29 L-15 -28Z',enamel(-36,-28),edge,.65);
        k.ell(11,-32.6,4.5,5.4,k.brass(-38,-27),edge,1.1);k.lens(11.7,-32.6,2.8,3.75,...jade);
        line('M-16 -31 L-4 -34','#bfe5be',.9);
      }
      if(t>=4){
        petal(-31,-7,-1.53,.83,jade);
        path('M42 -16 Q54 -16 58 -23 L63 -22 L61 -17 L54 -12 L45 -9Z',k.paint(jade,-24,-8),edge,1.1);
        path('M44 -7 L55 -9 L60 -5 L66 -6 Q61 -1 57 -1 L47 -3Z',k.paint(jade,-9,0),edge,1);
        jewel(61,-13,5,jade);core(-9,3,6.7,jade);
      }
    });
  }
  function rotary(k,t){
    const {transform:T,path,line,petal,band,core,stud,ell}=k;
    T(-2,-12,-.2,1,1,()=>{
      // Ribbed reserve drum, external radiator, then a braced five-port nose.
      ell(-29,3,11.3,9.4,k.enamel(-6,13),edge,1.35);
      T(-29,3,-.12,1,.83,()=>{k.ring(0,0,8.5);core(0,0,4.1,gold);});
      band('M-32 6 Q-23 13 -19 5 L-16 7 Q-24 17 -34 10Z');
      if(t>=3){
        for(const [x,y,a,s] of [[-33,-9,-.64,.62],[-26,-12,-.42,.69],[-19,-14,-.23,.67]])
          petal(x,y,a,s,coral);
        band('M-37 -9 Q-29 -17 -14 -19 L-12 -16 L-33 -4Z');
        for(const x of [-30,-23,-17])stud(x,-11-(x+30)*.36,.9);
      }
      if(t>=4){
        path('M35 -23 L45 -23 L51 -18 L53 -1 L49 7 L40 8 L37 4 L39 -6Z',k.enamel(-24,9),edge,1.5);
        for(const [x,y] of [[46,-18],[49,-12],[50,-5],[47,2]]){
          ell(x,y,1.75,2.65,k.brass(y-3,y+3),edge,.7);ell(x+.05,y,1.05,1.5,'#ffe0a1','#a65041',.5);
        }
        path('M43 -22 Q52 -23 61 -17 L65 -12 L63 -10 Q56 -15 50 -14 L45 -16Z',k.paint(coral,-23,-10),edge,1.05);
        path('M44 6 Q53 5 61 -2 L65 -2 L61 4 L52 9 L45 10Z',k.paint(coral,-2,10),edge,1.05);
        ell(60,-7.4,3.75,6.3,k.paint(gold,-14,-1),edge,.95);k.lens(60.6,-7.6,2.5,4.55,...coral);
        line('M38 -22 Q45 -19 45 -13 M43 4 l4 -1','#91d9bc',1);
        core(-28,3,5.8,coral);petal(-33,2,-1.67,.60,gold);
      }
    });
  }
  function bombard(k,t){
    const {transform:T,path,band,petal,core,stud,line,ell}=k;
    T(-2,-12,-.50,1,1,()=>{
      // A bayonet lug and recoil rails, followed by the petalled siege crown.
      path('M-37 2 L-27 4 L9 3 L18 8 L14 12 L-21 12 L-35 10Z',k.enamel(2,14),edge,1.35);
      line('M-31 7 L-20 9 L11 8','#f1c48d',1.25);
      band('M-14 -3 L-6 -7 L4 -4 L2 1 L-8 4Z');stud(-5,-2,1.15);
      if(t>=3){
        petal(-23,-12,-1.05,.84,coral);petal(-21,-10,-1.55,.83,gold);
        path('M-30 -9 C-39 -19 -36 -26 -28 -29 L-21 -24 L-20 -13Z',k.paint(coral,-29,-9),edge,1.2);
        path('M-30 -26 L-23 -23 L-22 -17 L-27 -14Z',k.enamel(-26,-14),edge,.75);
        line('M-32 -22 l4 9','#ffe7a3',1.15);core(-12,5,7.9,coral);
      }
      if(t>=4){
        path('M23 -20 C29 -29 37 -32 47 -29 L46 -24 L38 -22 L31 -13Z',k.paint(coral,-31,-12),edge,1.2);
        path('M28 4 Q39 12 51 2 Q50 12 38 16 L25 9Z',k.paint(coral,1,16),edge,1.2);
        line('M28 -20 Q35 -28 43 -27 M33 8 Q40 10 47 6','#ffe3ad',1);
        ell(49.6,-9,7.1,16.4,k.brass(-26,8),edge,1.2);k.lens(50,-9,5.35,13.1,...coral);
        line('M50 -20 Q47 -13 50 -2','#fff4c2',1.0);
        for(const [x,y] of [[30,-23],[34,-25],[39,-26]])stud(x,y,.9);
      }
    });
  }
  function prism(k,t){
    const {transform:T,path,line,petal,jewel,core,ell}=k;
    for(const sign of [-1,1])T(0,0,0,sign,1,()=>{
      path('M10 16 C19 12 27 3 28 -10 L32 -14 L33 -4 Q31 10 18 20Z',k.enamel(-15,20),edge,1.2);
      line('M14 16 Q29 8 30 -8','#edd29c',1.1);
      petal(23,8,.73,.64,blue);
      if(t>=3){
        petal(29,-2,.42,.96,blue);
        path('M30 -2 Q41 -16 39 -33 L42 -39 L45 -31 Q44 -10 33 3Z',k.brass(-40,3),edge,1.2);
        jewel(41,-34,3.8,blue);
      }
      if(t>=4){
        path('M18 -4 Q30 -22 37 -45 L39 -43 Q33 -19 23 -2Z',k.paint(jade,-45,0),edge,.95);
        jewel(31,-41,9.2,blue);k.stud(29,0,1);
      }
    });
    if(t>=3){ell(0,-25,27,5.3,null,'#eacb8e',1.05);line('M-24 -23 Q-3 -15 22 -22','#fff2bd',.68);}
    if(t>=4){jewel(-.2,-40,12.4,jade);core(0,6,8.1,blue); }
  }
  function terrace(k,id,t){
    const c=isSupply.has(id)?gold:isCare.has(id)?coral:isTerrain.has(id)?jade:orchid;
    const family=isSupply.has(id)?0:isCare.has(id)?1:isTerrain.has(id)?2:3;
    const sideY=(id==='mire'||id==='tripwire'||id==='mycelium'||id==='roost')?24:19;
    function side(sign){
      k.transform(0,sideY,0,sign,1,()=>{
        k.path('M19 1 Q25 5 32 -1 L32 -8 L36 -13 L38 -5 Q40 7 31 10 Q23 11 18 7Z',k.enamel(-13,12),edge,1.1);
        k.line('M22 7 Q34 10 36 0','#e8cb91',.9);
        if(family===0){
          k.path('M29 -5 Q22 -16 30 -26 Q34 -29 37 -28 Q39 -18 36 -9 L33 -4Z',k.paint(c,-27,-4),edge,1);
          k.line('M30 -8 Q34 -15 35 -24','#fff2b8',.95);k.ell(33,-5,4.5,1.6,k.brass(-7,-3),edge,.62);
        }else if(family===1){
          k.path('M27 -3 L27 -14 Q26 -18 30 -21 L30 -25 L35 -25 L35 -20 Q40 -16 38 -12 L36 -3Z',k.paint(c,-25,0),edge,1);
          k.line('M29 -6 L30 -15 M31 -24 L35 -24','#fff0d9',1.1);k.band('M28 -7 l10 -1 -.9 3 -9.5 1Z');
        }else if(family===2){
          k.petal(33,-3,.60,.67,c);k.petal(30,-3,.19,.50,jade);k.stud(32,-2,2.2);
        }else{
          k.line('M33 -3 Q31 -13 30 -20',edge,3.3);k.line('M32 -4 L31 -18','#e1bd87',1.6);
          k.jewel(31,-21,5.6,c);k.ell(31,-13,4,1.5,k.brass(-16,-11),edge,.6);
        }
        if(t>=4){k.petal(35,1,1.22,.56,c);k.stud(32,3,1.4);}
      });
    }
    side(-1);
    if(t>=3)side(1);
    if(t>=4){
      k.transform(0,sideY+5,0,1,1,()=>{
        k.path('M-31 1 Q-23 3 -16 5 Q-4 2 0 -2 Q8 4 17 5 Q24 4 32 0 L28 5 Q12 13 0 12 Q-15 13 -29 6Z',k.enamel(-2,13),edge,1.2);
        k.line('M-26 5 Q-13 11 -4 8 M4 8 Q14 10 26 4','#e7c793',.9);
        if(family===0)k.core(0,5,5.5,c);
        else if(family===1){for(const a of [-1.03,-.5,0,.5,1.03])k.petal(0,6,a,.24,c);k.core(0,6,3.8,gold);}
        else if(family===2){k.petal(-3,7,-1.05,.33,c);k.petal(3,7,1.05,.33,c);k.jewel(0,4,4.0,gold);}
        else{k.jewel(0,4,5.7,c);k.ell(0,4,9,2.8,null,'#ebd1a3',.79);}
      });
    }
  }
  function fifthMount(k,id,form){
    const {transform:T,path,line,ell,core,stud,petal,jewel}=k;
    // The broad rear brackets sit on the original roof, behind the forward lens.
    for(const sign of [-1,1])T(sign*28,19,0,sign,1,()=>{
      path('M-4 3 L4 -8 L10 -7 L20 2 L16 6 L9 4 L6 .5 L1 9 L-4 8Z',k.enamel(-8,9),edge,1.15);
      line('M-1 6 L4 -4 L9 -4 L16 2','#edcf84',1.05);stud(6,-2,1.45);
    });
    if(id==='sniper'){
      T(-1,-12,-.15,1,1,()=>{
        if(form==='mk14'){
          path('M-31 -1 C-28 -13 -21 -18 -11 -15 L-13 -8 Q-23 -6 -23 1Z',k.brass(-17,2),edge,1.2);
          ['#ffd253','#a7efff','#509bff','#ed8cf5','#edf993','#b9dd76'].forEach((c,i)=>{
            T(-27+i*2.9,-2-Math.sin((i+.6)*Math.PI/7)*8,-.48+i*.10,1,1,()=>{
              path('M-1.7 2 v-4 l1.7 -2.6 1.7 2.6 v4Z',c,edge,.65);
            });
          });
        }else{
          path('M-25 -16 L-20 -33 L-6 -43 L10 -42 L17 -36 L13 -29 L-6 -30 L-14 -21 L-16 -12Z',k.enamel(-43,-10),edge,1.3);
          ell(10,-37,7.5,5.8,k.brass(-43,-31),edge,.9);k.lens(11,-37,5,4,...blue);
          for(const y of [-17,-3]){path('M36 '+y+' l20 -3 10 1 1 2 -12 2 -19 1Z',k.paint(blue,y-4,y+4),edge,.9);}
          line('M-15 -32 L-4 -38 L5 -38',blue[2],1);
        }
      });
    }else if(id==='rotary'){
      T(-2,-12,-.20,1,1,()=>{
        for(let j=0;j<4;j++){T(-25+j*5,-17-j%2*3,.08,1,1,()=>{
          path('M-3 3 L-5 -8 L-4 -18 Q-1 -23 1 -22 L3 -12 L3 2Z',k.paint(coral,-22,4),edge,1.0);
          line('M-2 -16 L-.5 -7',coral[2],.85);});}
        for(const y of [-19,-11,-3,4]){ell(60,y,4.4,2.8,k.brass(y-4,y+4),edge,.85);ell(61,y,2.7,1.5,'#493a37',gold[1],.6);}
        core(-30,4,8.8,coral);core(-30,4,4.5,gold);
      });
    }else if(id==='bombard'){
      T(-2,-12,-.50,1,1,()=>{
        for(const sign of [-1,1])T(31,-9,0,1,sign,()=>{
          path('M-10 -8 C-1 -11 9 -14 20 -25 L29 -31 L26 -19 L20 -10 L6 -5Z',k.paint(coral,-29,-3),edge,1.25);
          line('M-2 -8 Q14 -12 25 -25',gold[2],1.2);
        });
        for(const x of [-32,-22]){ell(x,3.5,5,8.4,k.brass(-5,12),edge,.9);k.lens(x,3,3.1,5.5,...coral);}
      });
    }else if(id==='prism'){
      for(const sign of [-1,1])T(0,0,0,sign,1,()=>{
        path('M22 13 Q45 -4 50 -29 L54 -34 L55 -23 Q50 4 28 17Z',k.enamel(-33,18),edge,1.22);
        jewel(51,-32,8.1,orchid);jewel(42,-22,5.3,blue);
      });
      ell(0,-35,36,5.5,null,gold[1],1);jewel(0,-47,13.5,blue);jewel(0,-55,5.3,gold);
    }
  }
  // The paired sockets are painted in perspective: the far component is smaller
  // and the near bezel casts a dark lip across the glass.
  function optic(k,x,y,a,s,c){
    k.transform(x,y,a,s,s,()=>{
      k.path('M-10 -4 Q-10 -9 -4 -10 L5 -10 L12 -5 L12 5 L3 10 L-6 8 L-11 4Z',k.paint(c,-10,10),edge,1.4);
      k.ell(7,-.4,6.8,8.1,k.brass(-9,9),edge,1.1);
      k.ell(7.7,-.4,5.1,6.4,'#173e48',null);k.lens(8.1,-.5,4.1,5.4,...c);
      k.line('M-8 -5 L-4 -8 L2 -8',c[2],1.12);k.stud(-6,3,1);
    });
  }
  function watchMount(k,t,form){
    const high=t===7,c=form==='mk14'?orchid:blue;
    k.path('M-40 23 L-45 12 L-43 -15 L-39 -29 L-33 -30 L-34 -13 L-31 8 L-24 17Z',k.enamel(-31,23),edge,1.5);
    k.line('M-39 14 L-40 -12 L-36 -26',gold[1],1.4);
    k.transform(-37,-29,-.14,1,1,()=>{
      k.path('M-12 1 Q-10 -11 -1 -17 L8 -20 L7 -14 Q1 -7 0 4 L-4 8Z',k.paint(c,-20,9),edge,1.3);
      optic(k,1,-8,.07,.88,c);
    });
    k.core(-38,11,6.7,c);
    if(high){
      k.path('M-47 15 Q-63 7 -64 -7 L-62 -22 L-58 -27 L-56 -20 L-57 -9 Q-55 2 -44 6Z',k.enamel(-27,15),edge,1.5);
      k.line('M-59 -17 L-60 -7 Q-58 4 -49 8',c[2],1.1);
      optic(k,-59,-21,-.28,.78,jade);
      k.transform(17,-37,-.12,1,1,()=>{
        k.path('M-14 9 L-13 -1 L15 -6 L24 -4 L24 2 L-1 7 L-4 10Z',k.paint(c,-7,10),edge,1.3);
        k.line('M-10 0 L14 -4',gold[2],1.05);k.core(18,-1,3.5,c);
      });
    }
    if(form==='mk14'){
      k.transform(-15,0,-.19,1,1,()=>{
        k.path('M-9 -4 L3 -8 L13 -5 L11 9 L3 18 L-9 17 L-13 11Z',k.enamel(-8,18),edge,1.4);
        const colors=['#f4c865','#a1deee','#669ae9','#cd92ed','#eaea93','#a6d28e'];
        for(let i=0;i<6;i++)k.transform(-8+i*3,8-i*.7,.17,1,1,()=>{
          k.path('M-1.4 3 V-4 L0 -6 L1.4 -4 V3Z',colors[i],edge,.55);
        });
        k.line('M-9 12 L8 8',gold[1],1.05);
      });
    }else{
      k.transform(0,-13,-.15,1,1,()=>{
        k.path('M3 -13 L41 -20 L62 -17 L65 -11 L42 -10 L7 -4Z',k.enamel(-20,-4),edge,1.1);
        k.line('M8 -12 L40 -18 L55 -16 M12 -8 L41 -13',blue[2],.88);
        optic(k,56,-14,0,.45,blue);
      });
    }
  }
  function spinMount(k,t,ap){
    const c=ap?blue:coral,high=t===7;
    k.transform(-2,-12,-.20,1,1,()=>{
      if(ap){
        k.path('M-12 -15 L5 -23 L36 -24 L57 -21 L63 -16 L62 -1 L54 6 L32 7 L5 4 L-9 9 L-18 3Z',k.enamel(-24,9),edge,1.6);
        k.path('M-4 -12 L9 -17 L41 -19 L58 -15 L55 -11 L18 -9 L3 -4Z',k.paint(blue,-20,-4),edge,1.05);
        k.path('M6 -2 L48 -8 L56 -6 L51 -2 L8 2Z',k.brass(-8,3),edge,.8);
        for(const x of [11,20,29])k.line('M'+x+' -14 l3 -2',blue[2],1.15);
        k.ell(59,-8,6.7,11.6,k.brass(-20,4),edge,1.1);
        k.ell(60,-8,4.7,9.1,'#233943',edge,.8);
        k.path('M58 -15 L62 -13 L63 -8 L60 -.5 L58 -2 L59 -8Z',k.paint(blue,-15,0),null);
        k.core(-18,-2,8.7,blue);k.jewel(-18,-2,4.9,orchid);
      }else{
        k.path('M-40 -15 L-43 -25 L-39 -34 L-32 -39 L-24 -37 L-20 -31 L-21 -20 L-31 -12Z',k.paint(coral,-39,-12),edge,1.3);
        k.ell(-30,-28,8,9.8,k.brass(-39,-17),edge,1);
        for(const [x,y] of [[-32,-31],[-27,-29],[-31,-25]])k.ell(x,y,1.7,2.4,'#623440',gold[1],.6);
        k.core(-28,5,8.7,coral);
      }
      if(t>=6){
        k.path('M-21 3 Q-15 9 1 7 L31 3 L43 5 L32 10 L0 15 Q-17 15 -27 8Z',k.paint(c,-1,16),edge,1.5);
        k.line('M-22 7 Q-10 13 2 11 L30 6',gold[2],1);
        optic(k,-34,-16,-.25,.83,c);
      }
      if(high){
        k.path('M-38 8 C-52 9 -63 2 -65 -8 L-62 -25 L-57 -35 L-53 -33 L-51 -20 L-47 -10 L-36 -5Z',k.enamel(-35,10),edge,1.4);
        k.path('M-60 -23 L-56 -30 L-54 -19 L-47 -6 L-50 -6 L-58 -15Z',k.paint(c,-32,-5),edge,.9);
        k.line('M-59 -10 Q-55 -1 -44 2',gold[1],1.25);
        optic(k,-49,-17,-.31,.59,c);k.stud(-57,-6,1.45);
        if(ap){
          k.path('M-19 -16 L-20 -25 Q-14 -41 7 -43 L13 -42 L10 -37 L1 -32 L-6 -20Z',k.paint(blue,-43,-15),edge,1.35);
          k.line('M-14 -23 Q-6 -35 6 -39',blue[2],1.1);k.jewel(-12,-23,3.6,orchid);
        }else{
          k.path('M-11 -18 L-10 -26 L2 -38 Q10 -42 19 -39 L24 -35 L22 -27 L10 -21 L3 -14Z',k.paint(coral,-42,-13),edge,1.4);
          k.ell(16,-32,7.3,6.4,k.brass(-39,-25),edge,1.1);
          for(const [x,y] of [[14,-34],[18,-33],[16,-30]])k.ell(x,y,1.35,1.6,'#513d37',gold[1],.46);
          k.line('M-6 -25 L3 -34 L7 -35',gold[2],1.2);
        }
      }
    });
  }
  function siegeMount(k,t){
    const high=t===7;
    k.transform(-1,-13,-.50,1,1,()=>{
      for(const [x,y,a,size] of [[-24,-14,-.26,.84],[-20,14,.32,.93]]){
        k.transform(x,y,a,size,size,()=>{
          k.path('M-14 -6 Q-8 -12 6 -12 L24 -11 L31 -6 L31 4 L24 8 L-5 8 L-15 4Z',k.paint(coral,-12,8),edge,1.55);
          k.path('M-12 -4 L-3 -8 L13 -8 L6 -3 L-11 2Z',k.brass(-8,2),edge,.8);
          k.ell(26,-1,5.8,9,k.brass(-10,8),edge,1);k.lens(27,-1,3.6,6.2,...coral);
        });
      }
      k.path('M20 -23 Q29 -32 39 -34 L48 -33 L46 -28 Q34 -25 29 -19Z',k.paint(coral,-34,-18),edge,1.25);
      k.line('M27 -24 Q36 -31 43 -31',gold[2],1.1);
    });
    if(high){
      k.path('M-36 18 L-52 9 L-61 -8 L-65 -28 L-60 -39 L-55 -36 L-52 -19 L-44 -12 L-34 -8Z',k.enamel(-39,19),edge,1.6);
      k.path('M-60 -27 L-58 -33 L-56 -20 L-49 -12 L-51 -9 L-58 -15Z',k.paint(coral,-34,-9),edge,.95);
      k.path('M-43 12 L-53 19 L-60 29 L-65 29 L-60 13 L-48 2Z',k.brass(2,30),edge,1.2);
      k.core(-48,2,7.4,coral);k.line('M-53 -5 l9 12 M-44 -5 l-8 12',gold[2],1.1);
      k.transform(9,19,-.1,1,1,()=>{k.path('M-6 -7 L7 -9 L18 2 L24 13 L20 16 L12 8 L4 4 L-7 4Z',k.enamel(-9,16),edge,1.25);k.stud(4,-2,2);});
    }
  }
  function mirrorMount(k,t){
    const high=t===7,glass=high?orchid:blue;
    for(const side of [-1,1])k.transform(0,0,0,side,1,()=>{
      k.path('M14 16 Q35 12 46 -5 L50 -30 L49 -42 L54 -50 L59 -44 L59 -23 Q59 5 37 17 L19 22Z',k.enamel(-50,23),edge,1.5);
      k.line('M24 17 Q48 8 53 -10 L56 -37',gold[1],1.45);
      k.transform(53,-39,side<0?-.18:.15,.83,1.0,()=>{
        k.path('M0 -14 L8 -6 L7 7 L0 14 L-7 5 L-7 -7Z',k.brass(-14,14),edge,1.1);k.jewel(0,-.5,8.1,glass);
      });
      if(high){
        k.path('M33 13 Q50 13 59 4 L64 -10 L68 -14 L70 -8 L66 7 Q56 21 37 20Z',k.paint(orchid,-14,21),edge,1.35);
        k.jewel(65,-10,6.9,blue);k.core(39,13,3.5,orchid);
      }
    });
    k.transform(0,-31,high?-.19:.14,1,1,()=>{
      k.ell(0,0,high?47:43,high?22:14,null,'#3b4f57',3.3);
      k.ell(0,0,high?47:43,high?22:14,null,gold[1],1.45);
      k.line(high?'M-41 10 Q-31 24 3 22':'M-36 8 Q-23 16 3 14',gold[2],1.3);
    });
    k.jewel(0,-38,high?17:14,glass);k.core(0,7,9,glass);
    if(high){k.jewel(-18,-53,5.5,blue);k.jewel(20,-54,5.2,jade);}
  }
  function fifthStation(k,id){
    function pair(fn){for(const sign of [-1,1])k.transform(0,0,0,sign,1,()=>fn(sign));}
    function tube(x,y,c){
      k.transform(x,y,0,1,1,()=>{k.path('M-5 -7 Q0 -11 5 -7 L5 4 Q0 8 -5 4Z',k.paint(c,-9,7),edge,1);
        k.ell(0,-6,5,2.2,k.brass(-9,-4),edge,.8);k.line('M-2 -3 v6',c[2],.85);});
    }
    function coil(x,y,c){for(let i=0;i<4;i++)k.ell(x,y-i*2.6,5.6-i*.55,1.75,k.paint(c,y-i*2.6-2,y-i*2.6+2),edge,.65);k.jewel(x,y-11,2.9,c);}
    function glassDrop(x,y,c){k.transform(x,y,0,1,1,()=>{k.path('M0 -10 Q2 -5 5 0 Q7 7 0 8 Q-8 7 -5 0Z',k.paint(c,-10,8),edge,1);k.line('M-2.5 1 Q-4 4 -1 5',c[2],1.1);});}
    function fork(x,y,c){k.transform(x,y,0,1,1,()=>{k.path('M-5 -15 L-3 -16 L-2 -6 Q0 -2 2 -6 L3 -16 L5 -15 L5 -4 L1 0 L1 7 L-1 7 L-1 0 L-5 -4Z',k.paint(c,-16,7),edge,.9);});}
    function wing(x,y,sign,c){k.transform(x,y,0,sign,1,()=>{for(const [ang,s] of [[.57,.60],[1.02,.57],[1.43,.48]])k.petal(0,0,ang,s,c);k.stud(0,-1,2);});}
    switch(id){
      case 'reservoir':pair(()=>{tube(30,7,blue);k.core(35,1,5.2,gold);});k.line('M-29 1 Q0 18 27 4',gold[1],1.8);break;
      case 'dew':pair(()=>{wing(27,-14,1,blue);glassDrop(37,-14,blue);});break;
      case 'orchard':k.line('M8 2 Q19 -4 25 -14',jade[0],2.6);for(const [x,y,r] of [[21,-12,5],[30,-13,5],[26,-5,4]])k.core(x,y,r,jade);k.petal(25,-17,.8,.27,gold);break;
      case 'relay':for(const [x,y] of [[-24,2],[0,-12],[24,2]])coil(x,y,blue);break;
      case 'bounty':pair(()=>{k.line('M19 -12 Q29 -18 34 -12 L35 -5',gold[1],1.65);k.path('M32 -4 Q34 -11 37 -4 L40 2 L29 2Z',k.paint(gold,-8,3),edge,.9);k.stud(35,4,1.45);});break;
      case 'infirmary':pair(()=>{wing(24,6,1,jade);tube(26,6,coral);k.line('M23 5 h6 M26 2 v6',coral[2],1.25);});break;
      case 'rain':pair(()=>{k.path('M20 -22 Q33 -35 42 -20 L40 -17 Q31 -23 23 -17Z',k.paint(blue,-33,-16),edge,1.1);glassDrop(35,-7,blue);});break;
      case 'shell':pair(()=>{for(let j=0;j<4;j++)k.petal(24,6,.12+j*.39,.47+j*.035,coral);k.core(22,8,4.2,blue);});break;
      case 'detox':pair(()=>{tube(27,3,jade);for(const [x,y] of [[25,-1],[28,1],[26,4]])k.ell(x,y,.85,.85,jade[2]);});break;
      case 'tempo':pair(()=>{fork(29,-4,gold);fork(20,-1,blue);});break;
      case 'frost':pair(()=>{for(const [x,y,sz] of [[25,-4,8],[33,0,6],[39,3,4]])k.jewel(x,y,sz,blue);});break;
      case 'wind':pair(()=>{k.transform(31,-3,.2,1,1,()=>{for(let i=0;i<3;i++)k.petal(0,0,i*2.094,.30,jade);k.stud(0,0,2.15);});});break;
      case 'mire':pair(()=>{tube(30,4,gold);glassDrop(39,13,gold);});break;
      case 'tripwire':pair(()=>{k.path('M22 7 L25 -16 L28 -21 L31 -15 L28 4 L32 7Z',k.paint(jade,-21,7),edge,1.1);k.stud(27,-8,1.6);});k.line('M-27 -10 Q0 1 27 -10',gold[2],.85);break;
      case 'arc':pair(()=>{coil(31,-3,orchid);k.line('M31 -16 l-5 -3 3 -3 -5 -3',blue[2],.85);});break;
      case 'shard':for(const [x,y] of [[25,-6],[31,-10],[37,-6],[31,-2]])k.jewel(x,y,3.85,gold);wing(27,3,1,orchid);break;
      case 'roost':pair(()=>wing(22,-10,1,blue));k.path('M-6 8 L0 13 L7 7 L4 19 L0 16 L-4 19Z',k.paint(gold,8,19),edge,.9);break;
      case 'flare':k.ell(0,-22,21,12,null,gold[1],1.2);for(let j=0;j<7;j++){const a=(j-3)*.42;k.jewel(Math.sin(a)*22,-24-Math.cos(a)*11,2.8,gold);}break;
      case 'mycelium':pair(()=>{k.line('M7 15 Q13 2 24 7 T38 -5',jade[1],1.6);for(const [x,y,sz] of [[17,8,2.8],[29,5,3.2],[37,-4,4]])k.core(x,y,sz,orchid);});break;
    }
  }
  function ground(g,tier){
    const t=Math.min(5,Math.floor(tier||1));
    if(t<2)return;
    const k=kit(g);
    g.save();
    for(let i=0;i<8;i++){
      const x=-118+i*32, y=21+(i%2)*4;
      k.transform(x,y,0,1,1,()=>{
        k.path('M-3 0 Q2 -8 10 -17 L17 -21 Q14 -9 2 3Z',k.paint(jade,-21,3),edge,1.6);
        k.line('M0 0 Q7 -9 14 -18','#d3e8ae',1.1);
        if(t>=3){
          k.transform(0,0,-.18,1,1,()=>{
            k.path('M-1 1 L-4 -19 L-8 -18 L-7 -28 L-11 -41 Q-1 -33 1 -23 L3 -18 L1 -15 L5 -1Z',k.paint(gold,-39,2),edge,1.45);
            k.line('M-9 -35 Q-4 -26 1 -5','#fff0ae',1.1);
          });
        }
        if(t>=4&&i%2===0){
          k.petal(0,2,-.79,.49,coral);k.petal(1,3,.56,.44,coral);
          k.core(1,1,5.0,coral);
        }
        if(t===5&&i%2===1){k.petal(0,2,-.41,.70,orchid);k.petal(2,3,.30,.56,jade);k.jewel(0,-14,4.6,gold);}
      });
    }
    if(t>=4){
      k.line('M-128 30 Q-111 15 -97 23 T-65 23 T-33 23 T-1 23 T31 23 T63 23 T95 23 T128 23','#543e32',3.4);
      k.line('M-128 29 Q-111 14 -97 22 T-65 22 T-33 22 T-1 22 T31 22 T63 22 T95 22 T128 22','#e9b66f',1.35);
    }
    g.restore();
  }
  function draw(g,id,tier,form='mk14'){
    const t=Math.min(7,Math.floor(tier||1));
    if(t<2)return;
    g.save();g.lineCap='round';g.lineJoin='round';
    const k=kit(g);
    if(id==='sniper'){
      sniper(k,t>=6?3:t);
      if(t>=5&&form==='mk14'){
        k.transform(-2,-12,-.15,1,1,()=>{
          k.path('M-21 6 Q-10 3 -2 7 L-5 19 L-15 21 L-24 15Z',k.enamel(2,22),edge,1.2);
          for(let i=0;i<4;i++)k.line('M'+(-19+i*3.4)+' 8 l-2 7',i%2?'#87dfce':'#eac587',1.4);
          k.path('M3 -10 L47 -17 L58 -15 L57 -6 L13 -1Z',k.enamel(-18,1),edge,1.05);
          for(let x=15;x<=43;x+=7){k.path('M'+x+' -10 l5 -.8 -1 3 -5 .8Z','#1b464e',edge,.55);k.line('M'+x+' -7 l3 -.6','#8ae2d5',.65);}
          k.jewel(-15,7,3.5,blue);k.petal(-17,7,-1.87,.34,blue);
        });
      }
    }
    else if(id==='rotary')rotary(k,form==='ap'&&t>=5?2:t);
    else if(id==='bombard')bombard(k,t>=6?3:t);
    else if(id==='prism')prism(k,t>=6?2:t);
    else if(id==='thorns'){
      k.transform(0,11,0,.36,.53,()=>ground(g,t));
    }else if(isSupply.has(id)||isCare.has(id)||isTerrain.has(id)||isArray.has(id))terrace(k,id,t);
    if(t>=6){
      if(id==='sniper')watchMount(k,t,form);
      else if(id==='rotary')spinMount(k,t,form==='ap');
      else if(id==='bombard')siegeMount(k,t);
      else if(id==='prism')mirrorMount(k,t);
    }else if(t===5&&id==='rotary'&&form==='ap')spinMount(k,t,true);
    else if(t===5){
      if(['sniper','rotary','bombard','prism'].includes(id))fifthMount(k,id,form);
      else if(id!=='thorns')fifthStation(k,id);
    }
    g.restore();
  }
  return Object.freeze({draw,ground});
})();
