// Draw the glasshouse and its engraved specimen plate at screen resolution.
function drawGardenPlate(canvas, sprite, row, rank, atlas, rects) {
  const ctx = canvas.getContext("2d");
  const w = 640, h = 230;
  canvas.width = w * 2; canvas.height = h * 2;
  ctx.scale(2,2);
  const grad = (x1,y1,x2,y2, stops) => {
    const g=ctx.createLinearGradient(x1,y1,x2,y2);
    stops.forEach(([at,color])=>g.addColorStop(at,color));
    return g;
  };
  const path = (points,color) => {
    ctx.beginPath();points.forEach(([x,y],i)=>i ? ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
  };
  const oval=(x,y,rx,ry,color,rotation=0)=>{
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  };
  const line=(x,y,xx,yy,color,width=1)=>{
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  };
  const themes = {
    egypt:["#214952","#bf9466","#e4b47d","#a57651"], dark:["#272843","#71648c","#b8a0c5","#645877"],
    ice:["#264957","#83a4aa","#c7e5db","#799e9c"], beach:["#184c56","#85b5a3","#d6d298","#73a299"],
    sky:["#344967","#9da4b3","#f2cc94","#84979d"], future:["#204b50","#6ca79b","#cef0ae","#649387"],
    epic:["#303349","#8f8087","#d5ba9b","#847778"], default:["#194844","#73a38a","#d7cf8c","#759678"]
  };
  const [top,mid,glow,mtn]=themes[row.world]||themes.default;
  ctx.fillStyle=grad(0,0,0,h,[[0,top],[.64,mid],[1,glow]]);ctx.fillRect(0,0,w,h);
  let seed=17;for(const ch of row.id) seed=(Math.imul(seed,31)+ch.charCodeAt(0))>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<66;i++){const x=random()*w,y=random()*145;oval(x,y,.45+random()*.8,.8,"#f5e5ad75")}
  const xSun=460, ySun=66;
  ctx.save();ctx.globalAlpha=.82;oval(xSun,ySun,28,28,glow);
  for(const r of [37,42]){ctx.beginPath();ctx.arc(xSun,ySun,r,0,2*Math.PI);ctx.strokeStyle=glow;ctx.globalAlpha=.27;ctx.lineWidth=.8;ctx.stroke()}
  ctx.restore();
  let ridge=[[0,h],[0,147]];
  for(let x=0;x<=w+12;x+=16)ridge.push([x,137+19*Math.sin(x/61)+14*Math.cos(x/119)+random()*8]);ridge.push([w,h]);path(ridge,mtn);
  if(row.world==="egypt"){
    [[98,172,84],[539,170,45],[500,171,25]].forEach(([x,y,s])=>{path([[x-s,y],[x,y-s*.84],[x+s,y]],"#b29a72");path([[x,y-s*.84],[x+s,y],[x+s*.16,y]],"#917d62")});
  }
  ridge=[[0,h],[0,173]];for(let x=0;x<=w+16;x+=16)ridge.push([x,163+10*Math.cos(x/59)+7*Math.sin(x/32)+random()*4]);ridge.push([w,h]);path(ridge,"#3c685c");
  // Glazing bars follow a continuous arch with thin reflected edges.
  ctx.save();ctx.strokeStyle="#122f34aa";ctx.lineWidth=4;
  for(const x of [-150,66,282,498,714]){
    ctx.beginPath();ctx.moveTo(x+12,h);ctx.lineTo(x+12,78);ctx.quadraticCurveTo(x+12,25,x+154,-21);ctx.stroke();
    line(x+15,78,x+15,h,"#d5ce9770",1);
  }
  ctx.beginPath();ctx.moveTo(0,74);ctx.bezierCurveTo(177,55,425,55,w,74);ctx.strokeStyle="#2a4c47a0";ctx.lineWidth=2;ctx.stroke();ctx.restore();
  function branch(x,y,len,aim,dark) {
    ctx.save();ctx.translate(x,y);ctx.rotate(aim);
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(len*.64,-12,len,-len*.6);
    ctx.lineWidth=2;ctx.strokeStyle=dark;ctx.stroke();
    for(let i=1;i<12;i++){
      const f=i/12, xx=f*len, yy=-len*.55*f*f;
      for(const side of [-1,1]){
        const endX=xx+len*.14*(1-f)+2, endY=yy+side*len*(.22*(1-f)+.03);
        ctx.beginPath();ctx.moveTo(xx,yy);ctx.quadraticCurveTo(endX+9,yy+side*4,endX,endY);ctx.quadraticCurveTo(xx+2,yy+side*5,xx,yy);ctx.fillStyle=dark;ctx.fill();
      }
    }ctx.restore();
  }
  for(const [x,y,l,a] of [[-7,206,137,-.76],[-10,204,117,-.34],[1,224,112,-.12],[635,218,100,-2.3],[650,212,103,-2.7],[649,213,140,-2.02]])branch(x,y,l,a,"#20493f");
  path([[0,204],[110,199],[207,211],[324,202],[432,209],[527,201],[640,196],[640,h],[0,h]],"#1e4037");
  // Brass surveying arcs behind the selected specimen.
  for(let i=0;i<49;i++){
    const a=(i*4+174)*Math.PI/180;
    const r=i%4===0?87:89, R=93;
    line(320+Math.cos(a)*r,119+Math.sin(a)*r,320+Math.cos(a)*R,119+Math.sin(a)*R,"#f4e7b39c",i%4===0?1.3:.7);
  }
  ctx.beginPath();ctx.arc(320,119,84,Math.PI*.95,Math.PI*2.04);ctx.strokeStyle="#e7dfac85";ctx.lineWidth=.9;ctx.stroke();
  oval(320,199,122,17,"#14372f80");oval(320,189,88,14,"#a99d6d");ctx.fillStyle="#58664e";ctx.fillRect(232,183,176,6);oval(320,183,88,14,"#e0d2a0");oval(320,183,77,10,"#a2ac80");
  const entry = rects[row.id];
  if(entry && atlas?.complete && atlas.naturalWidth){
    const [x,y,sw,sh]=entry;
    const stretch=canvas.clientWidth/(canvas.clientHeight || 1)/(w/h);
    ctx.save();ctx.translate(320,112);ctx.scale(1/Math.max(.45,stretch),1);
    const radius=73;
    oval(0,0,radius+2,radius+2,"#314d44");
    oval(0,0,radius,radius,"#cabe8a");
    ctx.beginPath();ctx.arc(0,0,radius-3,0,2*Math.PI);ctx.clip();
    ctx.fillStyle=grad(0,-72,0,73,[[0,"#b4c99c"],[.75,"#dde0ad"],[1,"#bcc18a"]]);ctx.fillRect(-75,-75,150,150);
    for(let i=-72;i<74;i+=12)line(-76,i,76,i,"#f9eed145",.8);
    const scale=Math.max(150/sw,150/sh),dw=sw*scale,dh=sh*scale;
    ctx.shadowColor="#35513c5c";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
    ctx.drawImage(atlas,x,y,sw,sh,-dw/2,77-dh,dw,dh);ctx.restore();
  } else if(sprite?.complete && sprite.naturalWidth) {
    const s=Math.min(172/sprite.naturalWidth,151/sprite.naturalHeight);
    ctx.drawImage(sprite,320-sprite.naturalWidth*s/2,185-sprite.naturalHeight*s,sprite.naturalWidth*s,sprite.naturalHeight*s);
  } else {branch(295,184,87,-1.0,"#56875c");branch(303,186,59,-1.5,"#91b875")}
  for(let i=0;i<rank;i++){const x=320+(i-(rank-1)/2)*14;path([[x,200],[x+3.5,204],[x,208],[x-3.5,204]],"#f1d88f")}
}
