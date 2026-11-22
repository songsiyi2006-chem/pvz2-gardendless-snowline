// Air impacts share four painted flipbooks. A whole billowing burst costs one Sprite.
const gardenAirImpactArt=(()=>{
  const sheets=new Map(),types=['guided','cluster','ember','fortress'],count=18,size=216,tau=2*Math.PI;
  let queued=false;
  const clamp=t=>Math.max(0,Math.min(1,t));
  const ease=t=>1-Math.pow(1-clamp(t),3);
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const ramp=(t,start,end)=>clamp((t-start)/(end-start));
  const noise=n=>{const a=Math.sin(n*78.233+13.71)*43758.5453;return a-Math.floor(a);};
  const colors={
    guided:{edge:'#389b9f',rim:'#cafff5',outer:'#61bbb0',hot:'#f5ffd3',ash:'#5d8991',deep:'#385a62'},
    cluster:{edge:'#de9a50',rim:'#fff0a7',outer:'#d67a44',hot:'#ffe896',ash:'#897b68',deep:'#685953'},
    ember:{edge:'#d56a3d',rim:'#ffcca1',outer:'#d65c37',hot:'#ffeb94',ash:'#9c6956',deep:'#754e4c'},
    fortress:{edge:'#bc8c51',rim:'#ffe4a0',outer:'#ce783d',hot:'#fff1aa',ash:'#968c77',deep:'#635e59'}
  };
  function oval(g,x,y,rx,ry,fill,stroke,width=1){
    if(rx<=0||ry<=0)return;g.beginPath();g.ellipse(x,y,rx,ry,0,0,tau);
    if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function tint(g,x,y,r,inner,outer){
    const q=g.createRadialGradient(x-r*.22,y-r*.32,r*.04,x,y,r);
    q.addColorStop(0,inner);q.addColorStop(.73,outer);q.addColorStop(1,outer+'00');return q;
  }
  function glow(g,x,y,r,c,opacity){
    if(r<=0||opacity<=0)return;g.save();g.globalAlpha*=clamp(opacity);
    const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,c+'ca');q.addColorStop(.39,c+'78');q.addColorStop(1,c+'00');
    g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.restore();
  }
  function stroke(g,color,width,draw){
    g.strokeStyle=color;g.lineWidth=width;g.beginPath();draw();g.stroke();
  }
  function smoke(g,x,y,r,c,t,seed){
    const fade=(1-smooth(ramp(t,.50,1)))*smooth(ramp(t,.11,.33));
    if(!fade||r<1)return;g.save();g.globalAlpha*=fade*.80;
    for(let i=0;i<6;i++){
      const a=(i+.10)*tau/6,rr=r*(.49+.16*noise(seed+i)),cx=x+Math.cos(a)*r*.43,cy=y+Math.sin(a)*r*.29;
      oval(g,cx,cy,rr,rr*.86,tint(g,cx,cy,rr,c.ash,c.deep));
      if(i>1&&i<5){g.save();g.globalAlpha*=.55;
        stroke(g,c.rim,Math.max(1,rr*.10),()=>g.arc(cx,cy,rr*.65,3.61,4.71));g.restore();}
    }g.restore();
  }
  function billow(g,x,y,r,c,t,seed){
    const fade=1-smooth(ramp(t,.44,.84));if(!fade||r<1)return;g.save();g.globalAlpha*=fade;
    const shape=(x,y,k,inner,outer)=>{
      const a=g.createRadialGradient(x-k*.21,y-k*.33,.1,x,y,k*1.04);
      a.addColorStop(0,inner);a.addColorStop(.52,inner);a.addColorStop(.80,outer);a.addColorStop(1,outer+'00');return a;};
    for(let i=0;i<7;i++){
      const a=tau*(i+.12)/7,k=r*(.43+.13*noise(seed+i)),cx=x+r*.47*Math.cos(a),cy=y+r*.36*Math.sin(a);
      oval(g,cx,cy,k,k*.92,shape(cx,cy,k,c.hot,c.outer));
    }
    oval(g,x,y,r*.57,r*.53,shape(x,y,r*.62,'#fff5ba',c.hot));g.restore();
  }
  function ground(g,c,t,kind){
    const broad=kind==='fortress',teal=kind==='guided',progress=ramp(t,teal?.16:.04,.86);
    if(progress<=0||progress>=1)return;const v=ease(progress),rx=(broad?89:teal?92:74)*v+3,ry=rx*(broad?.27:.33);
    g.save();g.globalAlpha=(1-smooth(ramp(progress,.36,1)))*.91;
    oval(g,0,0,rx,ry,null,c.deep,Math.max(.6,(1-v)*5+1.5));
    oval(g,0,-1,rx*.98,ry*.98,null,c.edge,2.7);
    for(const [a,b] of [[.12,1.45],[1.63,2.54],[3.04,4.34],[4.57,5.95]]){
      stroke(g,c.rim,2.8*(1-progress)+.54,()=>g.ellipse(0,-1,rx,ry,0,a,b));}
    if(teal||broad){g.globalAlpha*=.7;oval(g,0,0,rx*.79,ry*.77,null,c.rim,1.8);}
    g.restore();
  }
  function grit(g,c,t,kind){
    const u=ramp(t,.12,.91);if(!u||u>=1)return;
    const many=kind==='fortress'?15:kind==='cluster'?8:11;
    g.save();g.globalAlpha=1-smooth(ramp(u,.53,1));g.lineCap='round';
    for(let i=0;i<many;i++){
      const a=tau*(i+.2)/many,n=noise(33+i+many),reach=32+46*n,spread=.32+.68*u;
      const x=Math.cos(a)*reach*spread,y=Math.sin(a)*reach*.27*spread-4*u*(1-u)*(19+42*noise(i+14));
      const dx=Math.cos(a)*reach*.68,dy=Math.sin(a)*reach*.18-4*(1-2*u)*(19+42*noise(i+14));
      g.save();g.translate(x,y);g.rotate(Math.atan2(dy,dx));
      const tail=4+7*n;
      const q=g.createLinearGradient(-tail,0,2,0);q.addColorStop(0,c.outer+'00');q.addColorStop(.65,c.edge);q.addColorStop(1,c.rim);
      g.fillStyle=q;g.beginPath();g.moveTo(-tail,0);g.quadraticCurveTo(1,-2.4-n,2,0);g.quadraticCurveTo(1,2+n,-tail,0);g.fill();
      oval(g,1,-.2,1.5+n,1.1,c.rim);g.restore();
    }g.restore();
  }
  function plume(g,x,y,w,h,bend,color,tip,opacity){
    if(h<.1||opacity<=0)return;g.save();g.translate(x,y);g.globalAlpha*=clamp(opacity);
    const q=g.createLinearGradient(0,0,bend,-h);q.addColorStop(0,color);q.addColorStop(.65,tip);q.addColorStop(1,tip+'28');
    g.fillStyle=q;g.beginPath();g.moveTo(-w,0);g.bezierCurveTo(-w*1.4,-h*.25,bend-w,-h*.53,bend,-h);
    g.bezierCurveTo(bend+w*.28,-h*.65,w*.42,-h*.35,w*.95,-h*.28);g.quadraticCurveTo(w*1.32,-h*.10,w,0);
    g.closePath();g.fill();g.restore();
  }
  function guided(g,c,t){
    const inrush=1-ramp(t,0,.24);
    if(inrush>0){g.save();g.globalAlpha=.22+.7*(1-inrush);
      for(let i=0;i<4;i++){g.rotate(Math.PI/2);stroke(g,c.rim,1.8,()=>{g.moveTo(12+44*inrush,-12*inrush);g.quadraticCurveTo(16+19*inrush,-8,3,-3);});}g.restore();}
    const grow=ease(ramp(t,.10,.46)),lift=28*smooth(ramp(t,.32,1));
    ground(g,c,t,'guided');smoke(g,6,-11-lift,23*grow,c,t,3);grit(g,c,t,'guided');
    const vent=grow*(1-smooth(ramp(t,.29,.61)));
    for(const [x,h,b] of [[-9,33,-23],[0,69,3],[10,39,23]])plume(g,x*grow,-4,4.5*grow,h*vent,b*vent,'#48a6ad','#d5ffed',vent);
    glow(g,0,-9,46*grow,c.rim,.65*(1-ramp(t,.20,.72)));
    billow(g,-2,-8-lift*.4,29*grow,c,t,2);
    const spike=(1-smooth(ramp(t,.26,.60)))*smooth(ramp(t,.08,.21));
    if(spike>0){g.save();g.globalAlpha=spike*.9;
      g.fillStyle='#e7fff4';g.beginPath();g.moveTo(-3,0);g.quadraticCurveTo(1,-18,-1,-58*spike);g.quadraticCurveTo(6,-23,3,1);g.fill();g.restore();}
  }
  function cluster(g,c,t){
    const u=ease(ramp(t,.02,.39));ground(g,c,t,'cluster');
    smoke(g,6+6*t,-8-24*t,23*u,c,t,11);grit(g,c,t,'cluster');
    const jets=u*(1-smooth(ramp(t,.24,.65)));
    for(const [x,h,b] of [[-5,29,-38],[4,45,19],[4,49,-20],[6,27,43]])plume(g,x*u,-3,3.3*u,h*jets,b*jets,'#d46532','#ffe79a',jets);
    for(const [x,y,n] of [[-16,-4,1],[14,-6,2],[-2,-14,3]]){
      const h=(7+5*n)*Math.sin(clamp((t+.03*n)/.7)*Math.PI);
      billow(g,x*u,y*u-h,17*u,c,t,7*n);}
    glow(g,0,-5,26*u,c.hot,.37*(1-t));
  }
  function ember(g,c,t){
    ground(g,c,t,'ember');const f=.18+.82*ease(ramp(t,.01,.34));smoke(g,7,-15-37*t,28*f,c,t,27);
    glow(g,0,-3,23,c.hot,.84*(1-ramp(t,.02,.18)));grit(g,c,t,'ember');
    const burn=(1-smooth(ramp(t,.40,.92)))*f;
    g.save();g.globalAlpha=burn;
    for(let i=0;i<7;i++){
      const x=(i-3)*8,h=(27+52*noise(i+11))*f*(.93+.07*Math.sin(t*11+i)),bend=8*Math.sin(i*.8+t*9)+(i-3)*2;
      plume(g,x,2,7.3+2*noise(i),h,bend,'#f69e38','#ee623c',.94);
      plume(g,x,-1,3.3,h*.67,bend*.55,'#fff6a9','#ffbb51',.90);
    }g.restore();
    billow(g,-3,-5-8*t,15*f,c,t,27);
  }
  function fortress(g,c,t){
    const v=ease(ramp(t,.01,.41));ground(g,c,t,'fortress');
    // Three offset lobes develop at different heights. Wide floor rings stay readable below the smoke.
    smoke(g,-18-8*t,-13-21*t,30*v,c,t,51);smoke(g,17+8*t,-17-25*t,28*v,c,t,27);
    smoke(g,4+9*t,-23-51*t,39*v,c,t,17);grit(g,c,t,'fortress');
    const height=v*(1-smooth(ramp(t,.32,.76)));
    for(const [x,h,bend] of [[-18,42,-17],[-7,67,-6],[5,78,10],[16,53,18]])plume(g,x*v,-7,7*v,h*height,bend*height,'#e66d29','#ffc477',height);
    for(const [x,y,k,seed] of [[-17,-9,23,13],[17,-14,20,19],[2,-23,26,7]]){
      billow(g,x*v,y*v-12*Math.sin(t*Math.PI),k*v,c,t,seed);}
    glow(g,-1,-3,38*v,c.hot,.45*(1-ramp(t,.18,.58)));
  }
  const paint={guided,cluster,ember,fortress};
  function draw(g,type,t){
    const c=colors[type];if(!c)return;
    g.save();g.lineCap='round';g.lineJoin='round';paint[type](g,c,clamp(t));g.restore();
  }
  function bake(cc,type){
    const cached=sheets.get(type);if(cached)return cached;
    const cols=6,canvas=document.createElement('canvas');canvas.width=size*cols;canvas.height=size*3;
    const g=canvas.getContext('2d');for(let i=0;i<count;i++){
      const x=(i%cols)*size,y=Math.floor(i/cols)*size;
      g.save();g.beginPath();g.rect(x,y,size,size);g.clip();g.translate(x+size*.50,y+size*.72);g.scale(1.074,1.074);
      draw(g,type,(i+.35)/count);g.restore();}
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);
    const row=Array.from({length:count},(_,i)=>{const f=new cc.SpriteFrame();f.texture=texture;f.rect=new cc.Rect(i%cols*size,Math.floor(i/cols)*size,size,size);
      if(cc.Size)f.originalSize=new cc.Size(size,size);f.packable=false;f.addRef?.();return f;});
    sheets.set(type,row);return row;
  }
  function warm(cc){
    if(queued)return;queued=true;let i=0;
    const idle=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:950}):setTimeout(fn,18);
    const next=()=>{if(i>=types.length)return;bake(cc,types[i++]);if(i<types.length)idle(next);};idle(next);
  }
  return Object.freeze({draw,bake,warm});
})();
