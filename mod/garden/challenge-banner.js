// Paint each threat illustration once; the deck is redrawn after every selection.
const drawGardenTyrant=(()=>{
  const panels=new Map();
  function paint(tier){
    const w=1100,h=185,night=tier===2;
    const canvas=document.createElement('canvas');canvas.width=w*1.4;canvas.height=h*1.4;
    const g=canvas.getContext('2d');g.scale(1.4,1.4);
    const line=(d,ink,width)=>{g.strokeStyle=ink;g.lineWidth=width;g.stroke(new Path2D(d));};
    const fill=(d,ink)=>{g.fillStyle=ink;g.fill(new Path2D(d));};
    function gradient(x,y,u,v,...stops){
      const c=g.createLinearGradient(x,y,u,v);stops.forEach((s,i)=>c.addColorStop(i/(stops.length-1),s));return c;
    }
    let seed=78;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    g.fillStyle=gradient(0,0,0,h,...(night?['#171224','#382337','#925455']:['#201a20','#4d3234','#a06b5a']));g.fillRect(0,0,w,h);
    const x=662,y=65,r=52;
    const haze=g.createRadialGradient(x,y,15,x,y,170);haze.addColorStop(0,night?'#c46fa168':'#db977e8a');haze.addColorStop(1,'#d8927c00');g.fillStyle=haze;g.fillRect(x-170,0,340,h);
    g.save();g.beginPath();g.arc(x,y,r,0,2*Math.PI);g.clip();
    g.fillStyle=gradient(0,10,0,122,...(night?['#f5c7ac','#de647a','#6e2b54']:['#f1d6aa','#e2a278','#ab6b65']));g.fillRect(x-r,y-r,r*2,r*2);
    for(let i=0;i<420;i++){const px=x-r+rnd()*2*r,py=y-r+rnd()*2*r;g.fillStyle=i%4?'#442d461b':'#ffe1c932';g.fillRect(px,py,rnd()*7+.5,rnd()*2+.4);}
    if(night){g.fillStyle='#211a28';g.beginPath();g.arc(x+8,y-8,r-8,0,2*Math.PI);g.fill();}
    g.restore();
    for(const [base,amp,color] of [[152,26,'#51353e'],[165,30,'#322630'],[183,25,'#231e28']]){
      let d='M0 190';for(let i=0;i<=w+24;i+=22)d+=' L'+i+' '+(base-rnd()*amp);
      fill(d+' L1124 190Z',color);
    }
    for(let i=0;i<19;i++){const ox=440+rnd()*600,oy=126+rnd()*38,s=.25+rnd()*.52;
      g.save();g.translate(ox,oy);g.scale(s,s);fill('M-12 20V-12L-15 -12 -5 -21 -3 -46 0 -23 4 -23 5 -52 8 -22 16 -14 13 -12 13 20Z','#2d232c');g.restore();}
    // Beaten metal owl mask in front of the eclipsed moon.
    g.save();g.translate(x,y+37);g.scale(.86,.86);
    const eye=night?'#ffb5c8':'#ffe2a1',rim=night?'#b897b1':'#ba9b85';
    for(const sign of [-1,1]){
      g.save();g.scale(sign,1);
      fill('M-1 75 -28 54 -46 54 -40 45 -65 38 -53 32 -79 18 -64 14 -84 -5 -65 -7 -91 -42 -58 -28 -71 -71 -38 -48 -9 -36 4 -11Z',gradient(-70,-60,0,69,'#453744','#201b28','#110f19'));
      line('M-67 -65 -40 -42 -20 -34 -3 -15 M-87 -39 -62 -22 -44 -12 M-69 4 -48 13 -33 12',rim,1.35);
      fill('M-62 -36 -36 -27 -5 -9 -12 2 -30 -3 -47 -14Z',gradient(-61,-35,-12,3,'#a88282','#67525f','#352936'));
      fill('M-51 -14 Q-27 -16 -9 4 Q-34 12 -51 -14Z','#0f1119');
      fill('M-45 -10 Q-27 -11 -15 1 Q-30 4 -45 -10Z',eye);
      fill('M-30 -8 -25 -6 -26 0 -29 0Z','#3b1e29');
      for(let i=0;i<5;i++){const dx=-43+i*6,dy=4+i*3;line('M'+dx+' '+dy+' q7 12 19 17 l-5 8',i%2?'#55404c':'#785664',1.1);}
      line('M-61 20 -38 33 -21 35 M-49 42 -25 49 -9 60',night?'#91606e':'#856760',1.5);
      g.restore();
    }
    fill('M-9 0 0 -9 9 0 0 20Z',gradient(-9,-6,9,11,'#c1a28f','#7a5960','#3e3541'));
    line('M0 -5 0 16','#e0ba9f',1);
    g.restore();
    g.fillStyle=gradient(0,0,w,0,'#1a161ce8','#1b171e85','#241e2500','#18141dcc');g.fillRect(0,0,w,h);
    return canvas;
  }
  return (canvas,tier)=>{
    if(!panels.has(tier))panels.set(tier,paint(tier));
    const drawn=panels.get(tier);canvas.width=drawn.width;canvas.height=drawn.height;
    canvas.getContext('2d').drawImage(drawn,0,0);
  };
})();

function drawGardenSnow(canvas){
  const w=1100,h=180,c=canvas.getContext('2d');canvas.width=w*1.4;canvas.height=h*1.4;c.scale(1.4,1.4);
  const grad=(x,y,xx,yy,stops)=>{const g=c.createLinearGradient(x,y,xx,yy);stops.forEach((v,i)=>g.addColorStop(i/(stops.length-1),v));return g};
  const shape=(d,fill,stroke)=>{const p=new Path2D(d);c.fillStyle=fill;c.fill(p);if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke(p)}};
  c.fillStyle=grad(0,0,w,h,['#16353d','#37636a','#284651']);c.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){c.beginPath();c.moveTo(160+i*32,0);c.bezierCurveTo(460,-15+i*11,530,118-i*10,825+i*14,-20);c.strokeStyle='#a9ebca12';c.lineWidth=7+i*3;c.stroke();}
  let seed=43;const rnd=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
  for(let i=0;i<160;i++){const x=rnd()*w,y=rnd()*h,r=.35+rnd()*1.1;c.fillStyle='#e1ede58c';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  for(const [y,f,col] of [[125,81,'#618789'],[148,61,'#496e71'],[171,36,'#365a60']]){
    let d='M0 190';for(let x=0;x<w+70;x+=35){const yy=y-rnd()*f;d+=' L'+x+' '+yy;}shape(d+' L1160 195Z',col);
  }
  // A lantern-bearing yeti silhouette follows the ridge between the field notes and threat readout.
  c.save();c.translate(679,129);c.scale(.68,.68);
  shape('M-55 48 L-49 22 -55 15 -43 0 -45 -10 -37 -22 -31 -45 -18 -58 -5 -63 -1 -72 7 -67 15 -73 19 -62 33 -55 39 -41 45 -34 52 -30 65 -9 78 -7 79 1 70 10 56 5 45 -4 42 14 48 36 45 49 27 53 23 45 25 27 14 17 1 24 -6 48 -17 52 -36 50 -37 43 -28 32 -25 14 -33 17 -43 43Z',grad(-35,-65,46,52,['#d2e4d5','#83a9a7','#52767b']),'#36595f');
  shape('M-17 -40 Q-4 -59 19 -48 L20 -35 13 -23 -6 -25 -15 -30Z','#45666b');
  for(const x of [-4,10]){c.fillStyle='#f6dfa8';c.beginPath();c.ellipse(x,-39,2.9,3.7,0,0,7);c.fill()}
  for(const [x,y] of [[-34,-21],[-25,-26],[-15,1],[24,-9],[32,8],[-20,22]])shape('M'+x+' '+y+' l4 10 4 -13 -1 7Z','#e4eee07d');
  c.strokeStyle='#e3d3a4';c.lineWidth=2;c.beginPath();c.arc(75,6,6,Math.PI,0);c.stroke();
  shape('M68 6 h14 l-2 12 -5 4 -5 -5Z','#e5b877','#314b51');
  c.restore();c.fillStyle=grad(0,0,w,0,['#183438eb','#17383a87','#193d3d00','#16333855']);c.fillRect(0,0,w,h);
}

