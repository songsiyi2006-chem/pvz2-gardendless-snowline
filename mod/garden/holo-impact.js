// Each cell is painted in 128-unit design space with two source pixels per unit.
// Three transparent frames per family share one texture, including the edge gutters.
const gardenHoloSwatches = {
  shot:['#182f20','#55ab38','#c6ff72','#f3ffcf'], cut:['#402c20','#db883d','#ffcc6b','#fff1bc'],
  ray:['#19334f','#4fa6dd','#9eeaff','#e9fcff'], lock:['#423323','#e19a36','#ffd45e','#fff8c1'],
  fire:['#452032','#c94936','#ff994a','#fff3a3'], blast:['#452c2a','#c76130','#ffb652','#fff3aa'],
  frost:['#183457','#4ea1d8','#84eafa','#f2ffff'], spark:['#243352','#588ee5','#86f3f8','#f5ffdb'],
  spore:['#3d2c53','#9a6eb6','#eaaff9','#fff6f9'], bind:['#50312b','#b97943','#f8c46f','#fff5b6'],
  wind:['#123d48','#4a9e99','#9aecce','#e9ffe8'], heal:['#163c2f','#409e62','#a0f4ae','#f2ffd1'],
  shield:['#193745','#358d91','#7de8cc','#e0fff2'], haste:['#49352d','#c18748','#ffcd77','#fff5bc'],
  drain:['#392844','#925790','#ed9abe','#ffecf8'], sun:['#443323','#d89c31','#ffe26d','#fffbd4'],
  seed:['#304026','#7f9a49','#d3ee79','#f6ffbf']
};
let gardenHoloShared;
let gardenHoloDraft;
let gardenHoloWarmScheduled=false;

function gardenHoloPaint(ctx, family, layer) {
  const [dark,mid,light,white]=gardenHoloSwatches[family];
  const TAU=2*Math.PI;
  ctx.save();ctx.translate(64,64);ctx.lineJoin='round';ctx.lineCap='round';
  const path=s=>new Path2D(s);
  const grad=(a,b,x=-19,y=-27,x2=19,y2=28)=>{
    const g=ctx.createLinearGradient(x,y,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;
  };
  function line(s,color=light,width=1.55,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(path(s));ctx.restore();
  }
  function fill(s,paint,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=paint;ctx.fill(path(s));ctx.restore();
  }
  function glass(s,a=mid,b=dark,alpha=.86) {
    const p=path(s);
    ctx.save();ctx.globalAlpha=.88;ctx.strokeStyle=dark;ctx.lineWidth=4.5;ctx.stroke(p);ctx.restore();
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=grad(a,b);ctx.fill(p);ctx.restore();
    ctx.save();ctx.shadowColor=light+'91';ctx.shadowBlur=4;
    line(s,grad(white,mid),2.2);ctx.restore();
  }
  function poly(points){return 'M'+points.map(([x,y])=>x+' '+y).join(' L')+' Z';}
  function facet(points,a=light,b=mid,alpha=.86){fill(poly(points),grad(a,b),alpha);}
  function windowPane(s,alpha=.79){
    ctx.save();ctx.globalCompositeOperation='destination-out';fill(s,'#000',alpha);ctx.restore();
  }
  function oval(x,y,rx,ry,color,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.restore();
  }
  function arc(x,y,rx,ry,a,b,col=light,width=1.45,alpha=.9) {
    ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,a,b);
    ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();ctx.restore();
  }
  function radial(n,fn,offset=0){
    ctx.save();ctx.rotate(offset);
    for(let i=0;i<n;i++){fn(i);ctx.rotate(TAU/n);}
    ctx.restore();
  }
  function glint(x,y,r){
    ctx.save();ctx.translate(x,y);
    fill(poly([[0,-r],[r*.17,-r*.18],[r*.78,0],[r*.17,r*.12],[0,r],[-r*.16,r*.13],[-r*.8,0],[-r*.15,-r*.16]]),white);
    ctx.restore();
  }
  function leaf(x,y,angle,scale=1) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
    const shell='M0 19 C-21 8 -19 -16 1 -32 C20 -14 24 6 0 19 Z';
    glass(shell);fill('M1 -31 C18 -16 21 4 0 18 C5 4 7 -12 1 -31Z',grad(light,mid),.64);
    line('M0 23 Q7 2 1 -27',white,2.1);
    line('M3 8 Q-5 4 -10 -3 M4 2 Q11 -3 14 -10 M4 -4 Q-4 -10 -7 -17 M4 -11 Q9 -15 10 -21',light,1.7);
    ctx.restore();
  }
  function shard(x,y,angle,scale=1) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
    const shell=poly([[0,-33],[11,-12],[8,10],[0,21],[-10,12],[-13,-11]]);
    glass(shell,light,mid,.84);
    facet([[-13,-11],[0,-33],[-3,-8],[-9,9]],white,light,.95);
    facet([[-3,-8],[0,-33],[10,-12],[7,10],[0,20]],mid,dark,.82);
    line('M0 -31 L-3 -8 L0 19 M-12 -11 L-3 -8 L10 -12',white,1.55,.89);
    ctx.restore();
  }
  // The lower glass ply carries a perspective contact reflection. The slits leave
  // the face beneath the projection visible even at the brightest animation frame.
  if(layer===0) {
    const ellipse=ctx.createRadialGradient(0,29,1,0,29,37);
    ellipse.addColorStop(0,mid+'61');ellipse.addColorStop(.6,light+'22');ellipse.addColorStop(1,light+'00');
    ctx.save();ctx.translate(0,20);ctx.scale(1,.25);ctx.translate(0,-29);oval(0,29,39,39,ellipse);ctx.restore();
    arc(0,24,36,9,.10,2.68,dark,4,.8);arc(0,24,36,9,.08,2.62,light,2.1,.9);
    arc(0,24,36,9,3.35,5.88,mid,1.8,.8);
    line('M-36 20 L-40 18 L-33 17 M27 31 L35 30 L39 27',white,1.6,.8);
    // Three separated projections taper toward the caster's ground plane.
    for(const [x,y] of [[-21,-8],[0,-24],[22,-7]]){
      const beam=ctx.createLinearGradient(0,y,0,26);beam.addColorStop(0,light+'00');beam.addColorStop(1,light+'53');
      fill(poly([[x-1.6,y],[x+1.8,y],[x*.67+2.1,24],[x*.67-1.9,24]]),beam);
    }
  } else if(layer===2) {
    // Instruments vary by family. Avoid a common enclosing halo around every silhouette.
    if(['lock','ray','haste','sun'].includes(family)){
      for(const [angle,extent] of [[-.82,.37],[1.88,.58],[3.48,.45]])arc(0,0,39,39,angle,angle+extent,light,1.8);
      for(const a of [-.69,-.54,2.10,2.25,3.59]){ctx.save();ctx.rotate(a);line('M36 0 L41 0',white,1.6);ctx.restore();}
      glint(25,-29,4);
    }else if(['fire','blast','spark','drain'].includes(family)){
      for(const [x,y,a] of [[-27,-12,-.40],[20,-26,.35],[28,5,.65],[-17,25,-1.15]]){
        ctx.save();ctx.translate(x,y);ctx.rotate(a);facet([[-1,3],[-2,-1],[0,-7],[1,-1]],white,light,.96);ctx.restore();
      }
      glint(13,-25,4.1);
    }else if(['frost','shield','cut','shot'].includes(family)){
      for(const [x,y,r] of [[-24,-18,2.3],[21,16,2],[-19,24,1.7]]){
        fill(poly([[x,y-r*1.4],[x+r,y],[x,y+r*1.4],[x-r,y]]),light);
      }
      glint(family==='frost'?3:18,family==='frost'?-29:-21,4.8);
    }else{
      for(const [x,y,r] of [[-25,6,2],[21,-21,2.4],[24,13,1.5],[-19,-22,1.5]]){
        oval(x,y,r,r,light,.9);oval(x-.3,y-.4,r*.45,r*.45,white);
      }
      glint(17,-20,3.8);
    }
    ctx.restore();return;
  } else {
    switch(family) {
      case 'frost':
        shard(-11,7,-.63,.76);shard(12,8,.65,.68);shard(0,-1,.09,1.1);
        windowPane('M2 -22 L9 -12 L7 6 L3 13 L1 -7Z',.72);
        line('M2 -21 L8 -12 L7 2',white,1.15,.79);
        line('M-17 21 L-10 25 L-3 23 M8 23 L16 20',white,1.7);break;
      case 'shield': {
        const outer='M0 -30 Q14 -23 26 -23 L24 2 Q20 20 0 31 Q-20 20 -24 2 L-26 -23 Q-12 -23 0 -30Z';
        glass(outer);facet([[0,-29],[0,29],[-15,16],[-21,3],[-24,-21]],mid,dark,.8);
        windowPane('M-1 -22 L-18 -17 L-16 1 Q-15 11 -1 21Z M2 -21 L18 -17 L16 1 Q14 13 2 21Z',.79);
        line('M0 -24 Q12 -19 20 -19 L18 2 Q15 16 0 24 Q-14 16 -18 2 L-20 -19 Q-8 -20 0 -24Z',light,2.0);
        line('M0 -17 L0 15 M-11 -8 L0 -14 L11 -8 M-9 1 L0 -4 L9 1',white,2.0);
        line('M-25 -21 L-23 0 M0 30 Q14 22 20 11',white,2.4);break;
      }
      case 'heal':
        leaf(-10,6,-.86,.92);leaf(10,-2,.57,.93);
        line('M-1 27 Q-1 13 10 -7 M-1 19 Q-8 11 -18 1',white,2.3);
        // A third, unopened bud rises between the two veined leaves.
        glass('M-1 -8 Q-9 -11 -5 -20 Q1 -18 1 -11Z',white,mid);
        line('M-1 10 Q-2 0 -2 -10',light,1.55);
        break;
      case 'seed':
        leaf(-8,-1,-.84,.62);leaf(8,-6,.64,.79);
        glass('M-17 12 Q-2 9 15 13 Q11 28 -1 30 Q-11 26 -17 12Z');
        line('M-15 14 Q-2 20 12 14 M-3 13 Q-2 3 5 -8',white,2.3);
        line('M-1 22 L-4 26 M3 23 L6 22',light,1.4);break;
      case 'cut':
        ctx.save();ctx.rotate(.78);
        glass('M0 -35 L16 7 L6 2 L4 21 L-4 27 L-6 2 L-16 8Z');
        facet([[0,-34],[-15,7],[-4,1],[0,-11]],white,mid);facet([[0,-32],[1,17],[6,1],[14,6]],mid,dark);
        line('M0 -32 L0 18 M-13 14 L-8 12 M7 9 L12 13 M-4 27 L1 24',white,1.7);
        line('M-8 19 L-7 25 M7 16 L8 22',light,2);ctx.restore();break;
      case 'shot':
        ctx.save();ctx.rotate(-.29);
        // A foreshortened round seed capsule, with a dark umbilical scar on its nose.
        glass('M-18 -11 Q-10 -21 4 -20 C18 -20 29 -10 27 2 C26 16 15 20 1 19 Q-11 19 -20 8 L-23 0Z',light,mid);
        fill('M-21 0 Q-8 -15 8 -15 Q18 -14 22 -10 Q12 -24 -3 -18 Q-13 -18 -21 0Z',grad(white,light),.85);
        windowPane('M-15 3 Q-8 -4 2 -4 L6 8 Q-3 14 -12 10Z',.81);
        line('M-14 3 Q-7 -4 1 -4 M-13 11 Q-6 16 4 15',light,1.65);
        arc(13,-1,9.3,12.7,-1.70,4.30,dark,4,.95);
        arc(13,-1,9.3,12.7,-1.74,.28,white,2.1);
        oval(17,-1,4,6,dark);oval(16,-2,1.9,3.6,mid);
        // Separated velocity notches leave open air around the projectile.
        line('M-31 -7 L-22 -7 M-38 0 L-26 0 M-32 7 L-23 7',light,2.6);
        line('M-30 -7 L-26 -7 M-36 0 L-31 0',white,1.25);
        ctx.restore();break;
      case 'lock':
        radial(4,()=>{
          glass('M-24 -5 L-26 -18 L-18 -26 L-6 -25 L-7 -20 L-16 -19 L-19 -15 L-19 -6Z');
          line('M-24 -15 L-23 -19 L-17 -24',white,1.7);
        });
        arc(0,0,13,13,-1.32,.06,mid,3);arc(0,0,13,13,1.85,3.24,light,3);
        line('M0 -18 L0 -11 M18 0 L11 0 M0 18 L0 11 M-18 0 L-11 0',white,2);
        fill(poly([[0,-3],[3,0],[0,3],[-3,0]]),white);break;
      case 'ray':
        ctx.save();ctx.rotate(.84);
        glass('M0 -33 L8 -12 L6 9 L0 22 L-6 9 L-8 -12Z');
        facet([[0,-32],[-7,-12],[-3,10],[0,18]],white,light);
        line('M0 -28 L1 13 M-12 -16 L-13 5 M12 -21 L14 1 M-3 23 L-3 31 M3 21 L3 27',light,2.2);
        arc(0,-1,18,5,.08,2.87,white,2);arc(0,-1,18,5,3.34,5.8,mid,1.7);ctx.restore();break;
      case 'spark':
        glass('M7 -31 L-23 4 L-6 5 L-14 31 L22 -9 L5 -9 L14 -31Z');
        facet([[7,-30],[-21,3],[-3,1],[5,-10]],white,light);
        line('M-12 26 L1 4 L-2 2 M-23 -7 L-18 -12 L-15 -10 M18 13 L15 22 L21 18',white,1.9);break;
      case 'fire':
        glass('M1 30 C-18 30 -29 12 -19 -5 C-16 -11 -10 -16 -9 -24 C-5 -21 -3 -17 -3 -12 Q8 -24 6 -34 Q23 -20 19 -4 Q26 -5 26 -10 C32 11 20 27 1 30Z');
        fill('M1 24 C-12 22 -15 11 -10 3 Q-8 8 -5 8 Q-3 -2 9 -15 Q6 -3 11 2 Q20 15 1 24Z',grad(white,light),.90);
        line('M1 26 Q-2 18 3 11 M21 -11 Q24 -1 21 4',white,1.6);break;
      case 'blast':
        radial(7,i=>{
          const n=i%2?26:33;
          const s=poly([[-7,-10],[-3,-n],[4,-n+6],[8,-14],[3,-11]]);
          glass(s,light,mid,.9);facet([[-3,-n+1],[-4,-13],[3,-12]],white,light,.72);
        },.15);
        glass('M0 -10 L9 -5 L9 4 L1 10 L-9 5 L-9 -4Z');
        facet([[-8,-4],[0,-9],[4,-3],[-1,3]],white,light);break;
      case 'spore':
        for(const [x,y,r] of [[15,14,8],[-18,14,6],[-8,-1,15],[10,-13,11]]){
          ctx.save();ctx.translate(x,y);const s='M0 '+(-r)+' C'+[r*1.6,-r,r*1.3,r*.78,0,r].join(' ')+' C'+[-r*1.1,r,-r*1.55,-r*.65,0,-r].join(' ')+'Z';
          glass(s,light,mid,.70);oval(-r*.26,-r*.34,r*.26,r*.14,white,.88);
          oval(r*.24,r*.13,r*.13,r*.16,dark,.75);oval(-r*.24,r*.42,r*.12,r*.11,mid,.85);ctx.restore();
        }break;
      case 'bind':
        ctx.save();ctx.rotate(.42);
        for(const y of [-10,9]){
          const s='M-6 '+(y-10)+' Q0 '+(y-14)+' 7 '+(y-9)+' L12 '+(y+1)+' Q15 '+(y+11)+' 6 '+(y+14)+' Q-1 '+(y+17)+' -6 '+(y+9)+' L-11 '+y+' Q-14 '+(y-7)+' -6 '+(y-10)+'Z';
          line(s,dark,9);line(s,grad(white,mid),5.8,.96);line(s,light,1.5);
        }
        line('M-17 -15 L-12 -23 L-8 -21 M16 13 L13 22 L9 20',light,2.3);ctx.restore();break;
      case 'wind':
        for(const [x,y,sc] of [[-4,-11,1],[2,1,.81],[-2,12,.62]]){
          ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
          glass('M-28 7 Q-17 -6 -4 -6 Q18 -3 24 -16 Q28 -2 14 4 Q5 9 -7 6 Q-17 4 -28 7Z',light,mid,.79);
          line('M-19 4 Q-12 -1 -4 -1 Q11 3 18 -4',white,1.5);ctx.restore();
        }break;
      case 'haste':
        ctx.save();ctx.rotate(-.19);
        glass('M-11 -23 L-9 -29 L8 -29 L11 -23 L6 -20 L5 -18 L-5 -18 L-6 -21Z');
        arc(0,3,21,21,0,TAU,dark,7);arc(0,3,21,21,-2.85,1.83,light,4);arc(0,3,21,21,1.96,3.25,mid,4);
        for(const n of [-1.35,-.65,.07,.78,1.49,2.21,2.95]){ctx.save();ctx.translate(0,3);ctx.rotate(n);line('M16 0 L18 0',white,2);ctx.restore();}
        glass('M-3 5 L9 -11 L3 7 L-7 13 Z',white,mid);
        line('M-32 -8 L-23 -8 M-35 -1 L-26 -1 M-32 6 L-25 6',light,2);ctx.restore();break;
      case 'drain':
        glass('M1 -33 C-2 -19 -23 -3 -21 11 C-20 26 -4 33 8 27 C30 16 20 -2 10 -14 Q5 -20 1 -33Z');
        fill('M3 -18 C6 -1 -6 3 -7 16 Q-4 24 6 23 Q20 17 16 7 C20 20 11 28 0 28 C-16 24 -16 13 -9 4Z',grad(light,mid),.88);
        line('M-11 14 Q-14 7 -3 -5 M8 22 Q17 18 16 12',white,1.8);break;
      case 'sun':
        radial(8,i=>{const points=i%2?[[-2,-20],[0,-28],[3,-21]]:[[-4,-21],[0,-33],[5,-20]];
          glass(poly(points),white,mid,.88);});
        glass('M0 -17 L12 -12 L17 0 L12 12 L0 18 L-12 12 L-17 0 L-12 -12Z',white,mid);
        facet([[-16,-1],[-11,-11],[0,-16],[6,-10],[-6,7]],white,light);
        line('M-11 9 L-2 13 L9 9',white,1.65);break;
    }
    // Partially unlit raster rows expose the actual sprite behind the projection.
    // The radial mask preserves the bright outside contours at every zoom level.
    ctx.save();ctx.globalCompositeOperation='destination-out';
    const aperture=ctx.createRadialGradient(0,0,1,0,0,34);
    aperture.addColorStop(0,'#000d');aperture.addColorStop(.62,'#000b');aperture.addColorStop(1,'#0000');
    ctx.fillStyle=aperture;
    for(let y=-30;y<=30;y+=5.6)ctx.fillRect(-32,y,64,1.65);
    ctx.restore();
    // An etched diagonal specular band and fine raster are clipped to the glass.
    ctx.save();ctx.globalCompositeOperation='source-atop';
    const gleam=ctx.createLinearGradient(-20,-20,11,13);
    gleam.addColorStop(0,white+'00');gleam.addColorStop(.48,white+'00');
    gleam.addColorStop(.50,white+'36');gleam.addColorStop(.59,white+'0c');
    gleam.addColorStop(.60,white+'00');gleam.addColorStop(1,white+'00');
    ctx.fillStyle=gleam;ctx.fillRect(-36,-37,72,75);
    for(let y=-34;y<=34;y+=5){ctx.fillStyle=y%2?white+'21':dark+'35';ctx.fillRect(-36,y,72,.75);}
    ctx.restore();
  }
  ctx.restore();
}

function gardenHoloDraftAtlas() {
  if(gardenHoloDraft)return gardenHoloDraft;
  const families=Object.keys(gardenHoloSwatches),cell=256,cols=8;
  const atlas=document.createElement('canvas');
  atlas.width=cell*cols;atlas.height=cell*Math.ceil(families.length*3/cols);
  gardenHoloDraft={families,cell,cols,atlas,g:atlas.getContext('2d'),addresses:[]};
  return gardenHoloDraft;
}
function gardenHoloPaintNext(d) {
  const n=d.addresses.length,family=d.families[Math.floor(n/3)],layer=n%3;
  const x=n%d.cols*d.cell,y=Math.floor(n/d.cols)*d.cell,g=d.g;
  g.save();g.translate(x,y);g.scale(2,2);g.beginPath();g.rect(0,0,128,128);g.clip();
  gardenHoloPaint(g,family,layer);g.restore();d.addresses.push({family,layer,x,y});
}
function gardenHoloFrames(cc) {
  if(gardenHoloShared)return gardenHoloShared;
  const draft=gardenHoloDraftAtlas(),cell=draft.cell;
  while(draft.addresses.length<draft.families.length*3)gardenHoloPaintNext(draft);
  const tex=new cc.Texture2D();tex.image=new cc.ImageAsset(draft.atlas);
  const frames=new Map();
  for(const {family,layer,x,y} of draft.addresses){
    const f=new cc.SpriteFrame();f.texture=tex;f.rect=new cc.Rect(x,y,cell,cell);
    f.originalSize=new cc.Size(cell,cell);f.packable=false;f.name='greenhouse-holo-'+family+'-'+layer;f.addRef();
    if(!frames.has(family))frames.set(family,[]);frames.get(family)[layer]=f;
  }
  gardenHoloShared=frames;gardenHoloDraft=null;return frames;
}
function gardenWarmHolo(cc, canWarm=()=>true) {
  if(gardenHoloShared||gardenHoloWarmScheduled||!cc?.Texture2D||!canWarm())return;
  gardenHoloWarmScheduled=true;
  const defer=job=>{
    if(typeof requestIdleCallback==='function')requestIdleCallback(job,{timeout:140});
    else setTimeout(job,16);
  };
  function paintDuringMenu() {
    if(gardenHoloShared||!canWarm()){gardenHoloWarmScheduled=false;return;}
    const draft=gardenHoloDraftAtlas(),end=performance.now()+3;
    if(draft.addresses.length===draft.families.length*3){
      gardenHoloFrames(cc);gardenHoloWarmScheduled=false;return;
    }
    do {gardenHoloPaintNext(draft);}
    while(draft.addresses.length<draft.families.length*3 && performance.now()<end);
    if(canWarm())defer(paintDuringMenu);else gardenHoloWarmScheduled=false;
  }
  defer(paintDuringMenu);
}

function gardenHoloImpact(cc, impactNode, family, rank, rgb, action) {
  const frames=gardenHoloFrames(cc).get(family)||gardenHoloShared.get('shot');
  const size=101+Math.max(0,Math.min(6,rank||0))*2;
  const parts=['HoloDepth','HoloRelief','HoloTrace'].map((name,i)=>{
    const node=new cc.Node(name);node.layer=impactNode.layer;node.setParent(impactNode);
    const sp=node.addComponent(cc.Sprite);sp.sizeMode=cc.Sprite.SizeMode.CUSTOM;sp.spriteFrame=frames[i];
    if(i===1)sp.color=new cc.Color(255,255,255,207);
    node.getComponent(cc.UITransform).setContentSize(size,size);return node;
  });
  const [base,body,trace]=parts;
  const lifts=family==='frost'||family==='seed'||family==='fire';
  const angled=family==='cut'||family==='shot'||family==='ray';
  return function updateGardenHolo(t) {
    const pop=Math.min(1,t/.23), settle=1-Math.pow(1-pop,3);
    const beat=Math.sin(Math.min(1,t/.62)*Math.PI);
    const tail=Math.max(0,(t-.61)/.39);
    base.setScale(.60+.43*settle+tail*.10,.64+.37*settle,1);
    body.setScale(.80+.20*settle+beat*.06, .77+.23*settle+beat*.09,1);
    body.setPosition(angled?(settle-1)*6:0,(settle-1)*5+(lifts?tail*4:0),0);
    body.angle=angled?(-8+8*settle):0;
    trace.setScale(.69+.31*settle+tail*.22,.69+.31*settle+tail*.22,1);
    trace.angle=(family==='lock'||family==='haste')?(-19+26*settle+tail*9):(-4+7*settle);
  };
}
