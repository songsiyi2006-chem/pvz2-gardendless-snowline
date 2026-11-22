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

