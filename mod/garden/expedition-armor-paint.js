// Side-front shapes for the zombies' existing head and torso sockets.
// Paths are painted once into the shared atlas; the battle only moves sprites.
const gardenExpeditionArmorPaint=(()=>{
  const ink='#33382c',rim='#464738',thread='#ddd0a0';
  const cache=new Map();
  function path(s){if(!cache.has(s))cache.set(s,new Path2D(s));return cache.get(s);}
  function shape(g,s,fill,stroke=ink,w=2.3){
    const p=path(s);if(fill){g.fillStyle=fill;g.fill(p);}
    if(stroke){g.lineWidth=w;g.strokeStyle=stroke;g.stroke(p);}
  }
  const line=(g,s,c,w)=>shape(g,s,null,c,w);
  function grad(g,x,y,xx,yy,colors){
    const f=g.createLinearGradient(x,y,xx,yy);
    colors.forEach(([at,col])=>f.addColorStop(at,col));return f;
  }
  function dotted(g,s,c,w,step){
    g.save();g.setLineDash(step);line(g,s,c,w);g.restore();
  }
  function plug(g,x,y,r){
    g.save();g.translate(x,y);g.scale(r,r);
    shape(g,'M-1 -.15 Q-.95 -.92 -.28 -1.02 Q.56 -1.15 .94 -.43 Q1.26 .35 .56 .86 Q-.11 1.25 -.75 .72 Q-1.12 .35 -1 -.15Z','#aba584','#35392e',.46);
    line(g,'M-.54 .32 L.42 -.33','#494a39',.38);g.restore();
  }
  // The broad connected patches remain visible after the atlas is reduced to lawn size.
  // Each panel is clipped in its own cloth direction and lit with the same high-left sun.
  const blotches=[
    ['#77805b','M-106 -56 Q-80 -72 -68 -58 Q-60 -47 -46 -52 Q-31 -55 -20 -44 Q-8 -36 1 -42 L15 -38 Q4 -28 -13 -27 Q-28 -31 -36 -24 Q-48 -15 -62 -21 Q-76 -32 -93 -19Z M39 -72 Q64 -56 74 -67 L90 -41 Q71 -25 56 -32 Q52 -43 36 -37 Q24 -33 15 -42 Q30 -49 39 -46Z M-89 27 Q-65 7 -48 15 Q-39 23 -21 18 Q-4 18 12 29 Q18 38 34 34 L24 48 Q9 54 -7 43 Q-26 34 -42 44 Q-57 48 -70 39Z M22 76 Q36 63 49 68 L78 52 91 70 51 92Z'],
    ['#b9aa7d','M-98 -35 Q-86 -43 -72 -37 Q-62 -28 -53 -31 L-46 -25 Q-55 -17 -68 -20 L-88 -12Z M-25 -68 Q-3 -74 13 -61 Q17 -55 30 -56 Q17 -45 3 -50 Q-16 -58 -27 -53 L-41 -55Z M18 -5 Q30 -14 40 -8 Q52 1 68 -6 L82 4 Q70 14 56 10 Q43 7 31 16 L15 15 6 6Z M-59 65 Q-47 54 -31 59 Q-20 69 -3 63 L14 72 Q2 84 -12 80 Q-34 67 -55 79Z'],
    ['#645e43','M-76 -71 Q-57 -75 -51 -65 Q-45 -59 -31 -62 Q-37 -50 -49 -54 Q-62 -59 -70 -54Z M-39 -9 Q-26 -19 -15 -14 Q-5 -7 3 -10 L17 -8 Q11 1 0 1 L-11 -1 Q-21 2 -23 7 L-34 6 -28 0Z M61 -38 Q72 -45 88 -43 L90 -22 76 -16 77 -26 69 -25Z M32 41 Q45 32 55 38 L68 33 65 43 49 49 39 46 31 51 21 49Z M-70 47 L-59 43 -49 47 -38 46 -43 53 -57 54 -63 59Z'],
    ['#d0c394','M-49 -45 Q-42 -48 -34 -44 L-25 -45 -29 -40 -42 -38 -51 -40Z M-1 -26 L8 -28 14 -24 22 -25 17 -20 5 -21 -3 -19Z M37 -62 l9 -4 9 3 -7 4 -11 1Z M-79 0 l10 -3 8 3 13 -2 -5 6 -13 2 -12 -3Z M-17 18 l8 -5 9 3 9 -2 -5 6 -11 1Z M39 24 l9 -5 10 3 9 -1 -3 6 -12 -1 -10 4Z M-14 53 l11 -2 7 4 -8 2 -9 -1Z']
  ];
  function cloth(g,outline,tx,ty,scale=1){
    g.save();g.clip(path(outline));g.translate(tx,ty);g.scale(scale,scale);
    for(const [c,s] of blotches)shape(g,s,c,null);
    g.restore();
  }
  function fray(g,cut){
    // A lit cut edge, an exposed black binding and loose light fibres.
    shape(g,cut,'#393c2f','#716d4e',2.6);
  }
  const shell='M-76 -5 Q-73 -13 -72 -21 C-70 -41 -59 -55 -43 -62 C-28 -71 -9 -73 9 -70 C31 -68 50 -57 59 -45 Q70 -31 69 -10 L71 2 Q66 14 55 18 L45 16 36 22 23 21 15 12 Q5 5 -10 4 L-35 4 Q-49 5 -60 9 L-73 11 -80 6Z';
  function suspension(g,wear){
    shape(g,'M16 0 Q35 4 56 -5 L61 7 53 19 47 29 37 31 31 24 24 14 15 12Z',grad(g,25,2,52,28,[[0,'#817559'],[.55,'#665e46'],[1,'#414637']]),ink,3.2);
    const tab=wear===2?'M38 9 l12 -2 -3 12 -5 3 -5 -6Z':'M37 10 l13 -2 -4 16 -6 3 -6 -7Z';
    shape(g,tab,'#a49a70',rim,1.8);
    line(g,'M39 12 l7 -1 -2 6 -4 1','#3f4234',2.1);
  }
  function sideRail(g,wear){
    const rail='M-8 -11 L4 -20 22 -21 Q34 -22 45 -27 L57 -31 65 -27 67 -19 60 -14 51 -13 48 -4 40 1 26 3 19 -2 2 1 -7 -1Z';
    shape(g,rail,grad(g,1,-29,12,7,[[0,'#c1b18a'],[.36,'#a39875'],[.72,'#79765b'],[1,'#575741']]),ink,3);
    shape(g,'M0 -11 l8 -6 19 -1 17 -5 11 -4 5 3 -4 5 -15 5 -17 3 -17 2 -6 2Z','#555a49','#575b49',1);
    line(g,'M2 -12 l7 -5 17 -1 18 -5 10 -4','#d4c39a',1.8);
    for(const [x,y] of [[12,-14],[19,-15],[26,-16],[33,-18]])line(g,'M'+x+' '+y+' l1.9 4.7','#b0a280',2);
    line(g,'M7 -4 l16 -2 5 4 11 -2 4 -7','#d4c092',1.55);
    plug(g,-2,-6,2.9);plug(g,56,-22,3);
    if(wear===2){
      fray(g,'M29 -4 l6 -6 3 3 7 -5 4 2 -5 11 -13 4Z');
      line(g,'M31 -5 l4 -4 3 3 7 -5','#cfc394',1.7);
    }
  }
  function shroud(g,wear){
    // Three-quarter silhouette of the dark front mounting plate.
    shape(g,'M-53 -46 Q-44 -54 -38 -48 L-34 -40 -38 -30 -40 -20 -54 -16 -64 -18 -62 -28 -57 -34Z','#625c46',ink,2.9);
    shape(g,'M-52 -44 l8 -4 6 5 -1 6 -5 5 -3 10 -10 3 -5 -3 5 -10 5 -5Z','#595c4b','#363c32',1.7);
    shape(g,'M-51 -38 l6 -4 3 4 -4 7 -7 3 -1 -4Z','#262f29','#a59c74',1.3);
    line(g,'M-60 -24 l3 -6 3 -3 M-47 -44 l5 -1','#bab28b',1.8);
    if(wear)line(g,'M-59 -21 l4 -3 2 1','#c9bd91',1.6);
  }
  function helmet(g,stage){
    g.save();g.lineCap=g.lineJoin='round';suspension(g,stage);
    shape(g,shell,'#9f9d72',ink,4.6);cloth(g,shell,-1,-9,1.05);
    shape(g,shell,grad(g,-45,-69,34,22,[[0,'#f9e9bc85'],[.28,'#f9e9bc36'],[.53,'#b9b88a00'],[.79,'#424c385b'],[1,'#30382d96']]),ink,4.6);
    // The seam narrows away from the viewer as the cover turns over the crown.
    line(g,'M-70 -23 Q-60 -48 -42 -57 Q-22 -68 -4 -66','#e5d7aa',2.5);
    line(g,'M-26 -67 C-29 -55 -32 -42 -31 -28 M8 -66 Q32 -51 40 -34','#686b4f',2.1);
    dotted(g,'M-23 -66 Q-29 -48 -27 -33 M12 -65 Q33 -50 39 -38',thread,1.25,[2.2,3.1]);
    shape(g,'M4 -50 Q15 -47 24 -41 L29 -34 24 -29 Q11 -31 -1 -40 L-1 -45Z','#807e5e','#62654c',1.65);
    dotted(g,'M3 -43 Q14 -35 23 -32', '#b8b087',1.3,[2,2]);
    shape(g,'M-74 -8 Q-45 -20 -14 -16 L13 -13 19 -6 13 0 -11 -2 Q-40 -2 -63 7 L-78 9 -81 4Z',grad(g,0,-18,0,8,[[0,'#b6ac80'],[.27,'#c8bc92'],[.43,'#8b8764'],[1,'#575944']]),ink,3.1);
    line(g,'M-76 -2 Q-49 -14 -17 -13','#ede0b2',2.1);
    line(g,'M-68 4 Q-41 -6 -16 -6','#525642',1.8);
    sideRail(g,stage);shroud(g,stage);
    if(stage){
      fray(g,'M-20 -53 l9 -5 9 2 -3 4 6 1 -8 7 -5 -2 -7 4 2 -5 -6 1Z');
      shape(g,'M-16 -51 l7 -4 6 1 -4 6 -5 1Z','#b09c70',null);
      line(g,'M-21 -51 l7 -5 8 -2 M-18 -44 l2 -4 M-3 -46 l5 -2','#e0c99a',1.6);
    }
    if(stage===2){
      fray(g,'M16 -63 Q33 -58 40 -50 L35 -49 39 -42 29 -41 24 -33 18 -37 10 -34 12 -45 6 -45 15 -53Z');
      shape(g,'M15 -56 Q29 -56 33 -51 L31 -45 23 -39 16 -42 13 -46Z','#a28d67',null);
      line(g,'M11 -35 l3 -7 -4 -2 M24 -35 l5 -6 8 -2 M37 -48 l-4 -4','#e8cca0',2);
      line(g,'M-69 -11 l7 2 -3 4 7 -1 M-62 -1 l2 3','#413e31',2.2);
    }
    g.restore();
  }
  function bucket(g,stage){
    g.save();g.lineJoin=g.lineCap='round';g.translate(0,5);suspension(g,stage);
    const lip='M-77 -11 Q-51 -20 -16 -18 L44 -20 63 -22 68 -16 68 -5 53 6 34 12 12 8 Q-21 4 -45 11 L-68 20 -80 18 -83 10Z';
    shape(g,lip,'#99926b',ink,3.8);cloth(g,lip,-14,-4,.74);
    shape(g,lip,grad(g,0,-23,9,19,[[0,'#e2d0a272'],[.42,'#8d8d6a00'],[1,'#333d2e9c']]),ink,3.6);
    line(g,'M-75 -9 Q-48 -17 -13 -16 L29 -16','#dfcf9f',2.1);
    line(g,'M-76 13 Q-40 -2 -12 0','#41483a',2.8);
    g.save();g.translate(2,8);sideRail(g,stage);g.restore();
    shape(g,'M-61 -13 l14 -4 9 2 2 5 -6 4 -16 3 -6 -3Z','#62644d','#3e4537',2.1);
    line(g,'M-57 -11 l8 -3 7 0','#c0b187',1.5);
    if(stage){fray(g,'M-23 -9 l5 -4 11 2 -4 5 -9 2Z');line(g,'M-23 -9 l6 -3 8 1','#ddc79b',1.6);}
    if(stage===2){fray(g,'M-69 -3 l11 -5 -2 5 8 -1 -2 6 5 1 -8 6 -8 1 -8 4Z');line(g,'M-70 -3 l10 -4 -1 5 7 -2','#e0c89b',1.8);}
    g.restore();
  }
  const carrier='M-48 -53 Q-47 -62 -38 -67 L-26 -71 -18 -66 -9 -54 -1 -51 8 -58 16 -69 26 -71 39 -66 45 -56 43 -41 37 -29 Q35 -20 40 -9 L47 7 52 42 Q44 54 28 59 L-17 72 Q-34 73 -46 62 L-54 46 -59 10 -55 -13 -48 -27 -53 -40Z';
  const chest='M-40 -38 Q-20 -40 -8 -44 L17 -44 28 -35 31 -11 35 28 27 42 7 49 -24 55 -42 50 -48 28 -49 0Z';
  function vest(g,stage){
    g.save();g.lineJoin=g.lineCap='round';
    shape(g,carrier,'#969472',ink,4.5);cloth(g,carrier,2,5,.86);
    shape(g,carrier,grad(g,-33,-52,52,56,[[0,'#f5daad5e'],[.33,'#bdc18d00'],[.71,'#52624563'],[1,'#333b2c9c']]),ink,4.4);
    // Foreshortened far shoulder and collar leave the zombie jaw and neck clear.
    shape(g,'M6 -56 L17 -70 28 -70 39 -65 44 -57 39 -45 29 -41 16 -44 12 -50Z','#858666',rim,2.5);
    line(g,'M16 -58 l5 -7 9 1 7 4','#c9be91',2.2);
    shape(g,'M-31 -61 Q-17 -43 -5 -43 Q8 -45 17 -62 L22 -56 Q12 -36 -4 -34 -21 -34 -37 -52Z','#4e5540',rim,2.2);
    shape(g,'M-48 -54 Q-46 -62 -36 -65 L-28 -68 -18 -61 -11 -46 -16 -38 -32 -37 -42 -40Z','#b3a57b',rim,2.7);
    line(g,'M-44 -53 l3 -6 10 -5 6 3 M-39 -45 l14 -4','#e0cfa0',2.1);
    shape(g,'M-39 -44 l15 -6 10 4 -2 9 -13 6 -10 -4Z','#626750',ink,2.2);
    shape(g,'M-34 -43 l9 -4 5 2 -2 4 -9 3Z','#c0b187',null);
    dotted(g,'M-46 -53 l3 -7 11 -5 M20 -62 l6 -4 10 5',thread,1.3,[2,2]);
    // The near face is one broad plate bag; a tapered gusset wraps around the right flank.
    shape(g,'M29 -34 l8 6 -1 12 14 26 3 33 -11 10 -17 7 6 -20 3 -23 -8 -27Z','#686f52',rim,2.55);
    for(const y of [1,11,21])line(g,'M36 '+y+' q6 -2 10 -6','#acab7c',2.5);
    shape(g,chest,'#a3a17a',rim,3);cloth(g,chest,-20,11,.79);
    shape(g,chest,grad(g,-41,-39,29,47,[[0,'#ece0ad70'],[.23,'#cccb990a'],[.72,'#6c74554d'],[1,'#40493477']]),rim,2.8);
    dotted(g,'M-43 18 l-1 -19 8 -31 24 -4 27 -3 7 5 5 22 M22 39 l-16 6 -24 6 -14 -3',thread,1.5,[2.5,2.2]);
    // Hook-and-loop ID field with rounded binding. Three rows of laser-cut webbing sit flush below it.
    shape(g,'M-32 -27 Q-9 -30 12 -31 L18 -28 18 -14 -27 -8 -34 -12Z','#838362','#62664c',2);
    dotted(g,'M-29 -23 l39 -5 4 2 0 7 -40 6Z','#bbb58b',1.2,[2,2]);
    line(g,'M-25 -19 l21 -3 M3 -23 l7 -1','#9a9a74',1.65);
    for(const [x,y] of [[-36,-1],[-33,8],[-30,17]]){
      line(g,'M'+x+' '+y+' q7 1 15 -1 m5 -1 14 -2 m5 -1 12 -2','#50583f',3.1);
      line(g,'M'+(x+1)+' '+(y+1.8)+' l13 -1 m8 -1 10 -1.7 m7 -.7 9 -2','#c0bb8e',1.16);
    }
    // Offset cummerbund, pull tab and a single expanding near-side utility pouch.
    shape(g,'M-51 34 Q-6 43 46 19 L49 32 Q25 48 -18 54 L-47 50Z','#716e52',rim,2.6);
    line(g,'M-46 38 Q-13 44 17 33 M28 30 l14 -6','#b4a87e',1.7);
    shape(g,'M19 19 l13 -3 8 6 -1 20 -9 7 -14 -2 -4 -19Z','#888866','#424a37',2.7);
    shape(g,'M15 18 l16 -4 8 5 -2 8 -12 4 -10 -3Z','#aaa27d',rim,2.1);
    line(g,'M18 20 l13 -3 5 2 M17 33 l2 10 7 2','#d0c098',1.6);
    shape(g,'M-39 29 l8 1 4 8 -4 4 -7 -2 -3 -8Z','#a68655',rim,1.8);
    line(g,'M-36 32 l3 5','#e4bb78',1.9);
    line(g,'M-44 54 Q-36 66 -18 66 L6 60','#b4b38b',2.2);
    if(stage){
      fray(g,'M-15 -17 l10 -5 6 2 -3 5 3 2 -8 6 -6 -2 -5 3 3 -6Z');
      line(g,'M-15 -17 l10 -5 4 1 M-14 -6 l4 -5 M-8 -7 l4 -2','#dac396',1.65);
      line(g,'M23 32 l7 -4 -2 4 6 -2','#d6bf95',1.9);
    }
    if(stage===2){
      fray(g,'M-43 12 l8 3 4 -5 8 4 1 7 8 -1 -1 8 -7 5 2 7 -11 4 -9 -3 -4 4 -6 -10 1 -12Z');
      shape(g,'M-41 22 l7 -3 8 5 -3 6 2 4 -8 3 -5 -4Z','#77725a',null);
      line(g,'M-42 13 l7 3 5 -5 7 3 M-17 26 l-6 7 2 6 -8 4 M-39 41 l-4 4 1 -6','#dec69b',2);
      line(g,'M-41 26 l8 -4 m-8 10 11 -6 M-40 35 l9 -5','#494c40',1.4);
      line(g,'M19 -38 l-2 8 4 -2 -3 6','#54583f',2);
    }
    g.restore();
  }
  // Draw the far crown behind the original leaves and the near shell in front.
  // Its upper boundary follows the curved side panel, rising from the nose to
  // the nape. Both parts tile back to the full silhouette at the same socket.
  const nearShell='M-90 19 L-90 -20 Q-76 -24 -66 -38 Q-62 -51 -53 -56 C-43 -67 -31 -66 -23 -59 Q-18 -55 -10 -55 C1 -53 9 -58 21 -61 Q42 -65 60 -52 L82 -45 85 45 -90 45Z';
  const nearBucket='M-90 31 L-90 0 Q-66 -3 -46 -7 L-17 -6 Q6 -8 18 -17 L62 -22 82 -18 85 49 -90 49Z';
  function coverLayer(g,wear,draw,near,front){
    g.save();
    if(front)g.clip(path(near));
    else{const outside=new Path2D();outside.rect(-104,-104,208,208);outside.addPath(path(near));g.clip(outside,'evenodd');}
    draw(g,wear);g.restore();
  }
  const helmetBack=(g,s)=>coverLayer(g,s,helmet,nearShell,false);
  const helmetFront=(g,s)=>coverLayer(g,s,helmet,nearShell,true);
  const bucketBack=(g,s)=>coverLayer(g,s,bucket,nearBucket,false);
  const bucketFront=(g,s)=>coverLayer(g,s,bucket,nearBucket,true);
  const gunmetal=(g,x,y,xx,yy)=>grad(g,x,y,xx,yy,[[0,'#b6b19a'],[.18,'#989c84'],[.48,'#757a66'],[.72,'#5a6255'],[1,'#444c42']]);
  const lowerFace='M-55 -6 Q-36 -17 -14 -17 L26 -18 54 -11 61 6 59 28 49 40 31 54 6 71 -16 73 Q-36 66 -47 55 L-63 45 -72 28 -69 15 -62 11Z';
  function guardHelmet(g,stage){
    g.save();g.lineJoin=g.lineCap='round';
    // The fictional sealed facepiece curves into the far cheek and wraps
    // under the jaw. The dark face opening is never transparent.
    shape(g,'M-57 -6 L31 -22 59 -10 64 12 57 38 38 53 14 69 -12 76 -32 67 -58 52 -75 30 -75 15Z','#393f35',ink,4.4);
    shape(g,lowerFace,gunmetal(g,-60,-4,42,65),ink,3.7);
    shape(g,'M20 4 Q41 0 57 -9 L58 16 46 35 21 57 6 65 -6 65 3 48 12 39Z','#69735e','#485244',2.45);
    shape(g,'M-74 19 l12 -16 20 -4 6 9 -10 13 -7 2 -8 11 -10 0Z','#979b82',rim,2.7);
    shape(g,'M-66 28 l13 -9 16 9 17 4 4 19 -8 11 -17 -8 -17 -8 -10 -10Z',grad(g,-59,21,-29,62,[[0,'#a7ab90'],[.37,'#868e73'],[1,'#59624f']]),'#495142',2.8);
    line(g,'M-62 29 l8 -6 13 8 11 3 M-50 48 l13 8 9 3','#cfccb0',1.8);
    for(const [x,y] of [[-53,30],[-46,34],[-39,37]])shape(g,'M'+x+' '+y+' l4 2 -4 8 -4 -2Z','#354239','#69745c',1.2);
    shape(g,'M-16 33 l21 -8 17 -16 16 -3 3 9 -8 12 -16 10 -17 19 -8 5 -10 -8Z',gunmetal(g,-12,31,30,60),'#4b5345',2.6);
    line(g,'M-12 35 L4 30 21 14 34 10 M-3 54 l9 -11','#c5c3a3',1.9);
    const aperture='M-75 -8 Q-53 -21 -26 -21 L24 -23 42 -17 46 -5 38 4 14 8 -8 11 -32 9 -49 12 -65 18 -75 13Z';
    shape(g,aperture,'#535849','#2e352d',4.3);
    shape(g,'M-70 -4 Q-48 -17 -24 -17 L25 -19 35 -15 34 -8 23 -4 -8 2 -34 2 -54 7 -67 11 -73 6Z',
      grad(g,-28,-17,-20,12,[[0,'#757d69'],[.23,'#464f46'],[.48,'#303e39'],[.72,'#263631'],[1,'#495c4e']]),'#2d342e',2.6);
    line(g,'M-67 0 Q-49 -10 -27 -12 L4 -14','#919c82',1.65);
    shape(g,'M-46 -10 l13 -4 7 0 -12 10 -15 4Z M-20 -14 l7 -1 -10 9 -5 0Z','#83988465',null);
    line(g,'M-65 10 l18 -7 13 -1 M11 2 l14 -3','#7d826d',2);
    // The larger covered shell and short overhanging brow tie the sentry to the
    // same family of equipment as the regular infantry.
    g.save();g.translate(0,-13);g.scale(1.04,1.05);helmet(g,stage);g.restore();
    shape(g,'M33 -7 l18 -13 13 3 3 11 -5 29 -11 10 -14 -4 -7 -13Z',gunmetal(g,36,-13,64,30),ink,3.2);
    shape(g,'M41 -4 l10 -8 8 2 -3 21 -7 9 -8 -5Z','#6d755c','#485342',2);
    plug(g,50,-3,3.2);plug(g,47,22,2.6);
    if(stage){
      line(g,'M-58 35 l6 3 -1 -4 8 2 M-30 49 l6 -3','#d2ccb0',2.2);
      line(g,'M-27 -9 l5 4 -3 3 6 3','#9baa8e',1.6);
    }
    if(stage===2){
      shape(g,'M-6 44 l9 -10 4 2 7 -6 9 -2 -4 8 3 1 -14 13 -6 -2 -5 7Z','#41493e','#8b9279',2.7);
      line(g,'M-8 45 l10 -12 5 2 7 -6 7 -2','#c6c2a4',1.7);
      line(g,'M-38 -10 l7 5 -4 3 7 5 m-3 -8 7 -4 m-8 4 -9 3','#b4bea2',1.7);
    }
    g.restore();
  }
  function guardVest(g,stage){
    g.save();g.lineJoin=g.lineCap='round';
    // The rear pauldron sits higher and disappears behind the raised neck ring.
    shape(g,'M9 -59 l18 -17 17 2 19 14 7 17 -9 14 -14 4 -16 -9 -15 -1Z',gunmetal(g,22,-71,67,-31),ink,4);
    line(g,'M26 -67 l11 -4 17 10 8 11','#c9c7a6',2.1);
    shape(g,'M-48 -55 Q-50 -68 -36 -77 L-25 -80 -11 -74 1 -64 13 -67 20 -79 34 -74 42 -61 31 -46 5 -40 -26 -40Z','#5f6854',ink,3.5);
    shape(g,'M-33 -72 l13 0 17 11 14 0 10 -9 7 5 -7 17 -17 8 -26 -4Z','#404b40','#343c32',2.5);
    shape(g,'M-50 -4 L42 -14 53 -1 60 43 51 67 36 75 14 70 -5 87 -32 88 -51 76 -63 45Z','#56624d',ink,4.4);
    for(const [x,y,w] of [[-54,48,37],[-21,53,34],[15,46,24],[37,40,14]]){
      const outline='M'+x+' '+y+' l'+w+' -6 4 20 -4 13 -'+(w-8)+' 6 -8 -7Z';
      shape(g,outline,gunmetal(g,x,y,x+w,y+34),ink,2.9);
      line(g,'M'+(x+4)+' '+(y+5)+' l'+(w-8)+' -4 M'+(x+6)+' '+(y+12)+' l'+(w-11)+' -3','#b9b99a',1.8);
    }
    g.save();g.translate(-1,0);g.scale(1.02,.98);vest(g,stage);g.restore();
    shape(g,'M-42 -43 Q-33 -52 -16 -57 L0 -52 16 -59 22 -52 12 -39 -3 -31 -21 -33Z','#8c9276',rim,3.1);
    line(g,'M-36 -43 l18 -9 15 5 16 -7','#d2caa5',2.1);
    const shoulder='M-54 -61 Q-43 -70 -30 -68 L-22 -59 -21 -51 -30 -33 -43 -21 -60 -16 -72 -26 -71 -38Z';
    shape(g,shoulder,'#98977b',ink,4.1);cloth(g,shoulder,-30,-44,.60);
    shape(g,shoulder,grad(g,-60,-65,-39,-20,[[0,'#f3d9a464'],[.4,'#b9b89300'],[1,'#434d3c9e']]),ink,3.8);
    shape(g,'M-69 -38 Q-54 -31 -42 -39 L-32 -49 -25 -50 -24 -43 -39 -26 -59 -19 -70 -25Z','#7c8269','#414b3c',2.8);
    line(g,'M-64 -39 Q-50 -35 -40 -43 M-58 -61 l10 -4 10 1','#d7cda8',2);
    plug(g,-58,-30,3.1);
    shape(g,'M33 -7 l12 -5 10 6 6 28 -4 24 -10 13 -9 -3 4 -15 -3 -21Z','#657058',rim,2.9);
    for(const y of [1,13,25])line(g,'M44 '+y+' l8 -4 4 4','#a4a587',2);
    if(stage){line(g,'M-61 -48 l8 -4 -1 4 6 -2 M46 38 l8 -4','#d6c8a4',2);}
    if(stage===2){
      fray(g,'M-67 -44 l10 -7 8 1 -3 4 7 -2 -2 7 -8 6 -6 1 -3 4 -6 -4Z');
      line(g,'M-67 -44 l11 -7 5 1 M-64 -32 l6 -3 7 -1','#d6c6a0',2);
      line(g,'M-11 73 l8 -2 -4 5 9 -2','#d5c7a8',2);
    }
    g.restore();
  }
  return Object.freeze({helmet,bucket,vest,helmetBack,helmetFront,bucketBack,bucketFront,guardHelmet,guardVest});
})();
