import { catalogue } from './catalog.js';

const byName = new Map(catalogue.map(plant => [plant.id, plant]));
const byNumber = new Map(catalogue.map(plant => [plant.nativeId, plant.id]));
const forms = new Map();
for(const plan of catalogue)for(const [code,num] of plan.variants||[]){
  forms.set(code,plan.id);
  if(num!=null)byNumber.set(num,plan.id);
}
const allied = new Set(['wound','nearAlly','laneAlly','behindAlly','rearAlly','smallAlly','host']);
const activeInstalls = new WeakMap();
function resolve(id, nativeId, imitater, getRank) {
  const code=(!id || (imitater&&id==='imitater'))?byNumber.get(nativeId):id;
  if(!code || code==='imitater')return null;
  const owner=forms.get(code)||code;
  const plan=byName.get(owner);
  if(!plan)return null;
  const rank=Math.max(0,Math.min(6,Math.floor(Number(getRank(owner))||0)));
  return rank?{plan,rank}:null;
}
function alive(body) {
  return !!body && !!body.node && body.node.isValid !== false && body.node.activeInHierarchy !== false &&
    !body.dead && !body.displayed && !body.fallingInSky && !body.blew && !body.AlmanacMode;
}
function row(body) { return body.plantInLnC?.lIndex ?? body.lIndex; }
function col(body) { return body.plantInLnC?.cIndex ?? body.cIndex; }
function range(origin, entity) {
  return Math.max(Math.abs(origin.r - row(entity)), Math.abs(origin.c - col(entity)));
}
function ratio(entity) { return entity.health / Math.max(1, entity.toughness || entity.health || 1); }
function iced(entity) { return entity.chill > 0 || entity.freeze > 0 || !!entity.iceblocked; }
function fixedPosition(entity) { return {r: row(entity), c: col(entity)}; }
function pulseDuration(plan, rank) { return plan.cycle * (rank >= 5 ? 0.85 : 1); }
function strength(rank) { return rank >= 5 ? 1.10 : rank >= 2 ? 1.05 : 1; }
function targetList(snapshot, loc, source, kind, marks, now) {
  const friendly = allied.has(kind) || kind === 'home';
  let list = friendly ? snapshot.friends : snapshot.foes;
  const dr = b => Math.abs(row(b) - loc.r);
  const dc = b => col(b) - loc.c;
  const dst = b => Math.abs(dc(b)) + dr(b);
  const broken = b => ratio(b);
  const isMarked = b => (marks.get(b) || 0) > now;
  let score = dst;
  let choose = b => dr(b) <= 1;
  switch (kind) {
    case 'home': case 'host': choose = b => dr(b) === 0 && dc(b) === 0; score = b => (b === source ? 2 : 0) + broken(b);break;
    case 'wound': choose = b => range(loc,b) <= 2; score = broken;break;
    case 'smallAlly': choose = b => range(loc,b) <= 2; score = b => b.toughness || Infinity;break;
    case 'nearAlly': choose = b => range(loc,b) <= 2; score = b => dst(b)+(b===source?20:0);break;
    case 'laneAlly': choose = b => dr(b) === 0; score = b => dst(b)+(b===source?20:0);break;
    case 'rearAlly': case 'behindAlly': choose = b => dr(b) === 0 && dc(b)<0; break;
    case 'lane': choose = b => dr(b) === 0; score = b => col(b);break;
    case 'front': score = b => col(b); break;
    case 'back': score = b => -col(b);break;
    case 'heavy': score = b => -b.health;break;
    case 'weak': score = broken;break;
    case 'gear': score = b => (b.armors?.length?0:50)+dst(b);break;
    case 'cluster': score = b => -(snapshot.density(b)*20)+dst(b);break;
    case 'adjacent': case 'laneOut': choose = b => dr(b)===1; score = kind==='laneOut'? b=>col(b):dst;break;
    case 'diagonal': choose = b => dr(b)===1 && dc(b)>0;break;
    case 'contact': choose = b => dr(b)===0 && Math.abs(dc(b))<=1;break;
    case 'near': choose = b => range(loc,b)<=2;break;
    case 'bite': choose = b => dr(b)===0 && Math.abs(dc(b))<=2;score=b=>(b.isEating?0:10)+dst(b);break;
    case 'behind': choose = b => dr(b)===0 && dc(b)<0 && dc(b)>=-2;break;
    case 'sky': score=b=>(b.flying?0:50)+dst(b);break;
    case 'water': score=b=>(b.inWater?0:50)+dst(b);break;
    case 'cold': score=b=>(iced(b)?0:50)+dst(b);break;
    case 'still': score=b=>((iced(b)||b.stunned>0||b.butterStun>0||b.gummed||b.stickyriced)?0:50)+dst(b);break;
    case 'poisoned': score=b=>(b.poisoned?0:50)+dst(b);break;
    case 'marked': score=b=>(isMarked(b)?0:50)+dst(b);break;
  }
  return list.filter(b => alive(b) && choose(b)).sort((a,b) => score(a)-score(b));
}
function snapshot(manager) {
  const friends = (manager.plantPool || []).filter(p => alive(p) && p.plantInLnC);
  const foes = (manager.zombiePool || []).filter(z => alive(z) && !z.hypnotized && !z.invincible && !!z.isInLawn?.());
  const totals = new Map();
  for (const z of foes) {
    const key = row(z)*100+col(z);
    totals.set(key, (totals.get(key)||0)+1);
  }
  return {friends,foes,density(z) {
    let count = 0;
    for (let r=-1;r<=1;r++) for (let c=-1;c<=1;c++) count += totals.get((row(z)+r)*100+col(z)+c)||0;
    return count;
  }};
}
const mechanismWeight = 2.5;
const visualFamily = {
  mark:'lock', dart:'shot', slice:'cut', pierce:'cut', beam:'ray', ember:'fire', burntrail:'fire',
  shatter:'frost', shatterPoison:'spore', execute:'cut', crack:'blast', burst:'blast', blast:'blast',
  spark:'spark', venom:'spore', spore:'spore', stagger:'bind', butter:'bind', slow:'frost', freeze:'frost',
  shove:'wind', drain:'drain', guardEnemy:'bind', wardEnemy:'bind', mend:'heal', ward:'shield',
  guard:'shield', haste:'haste', cleanse:'heal', sun:'sun', seed:'seed'
};
const fxPalette={
  shot:[133,238,184],cut:[245,169,206],ray:[141,216,255],lock:[255,197,104],
  fire:[255,151,100],blast:[255,184,123],frost:[127,233,255],spark:[133,202,255],
  spore:[209,166,250],bind:[230,186,119],wind:[121,230,207],heal:[143,245,178],
  shield:[123,231,217],haste:[248,210,120],drain:[225,159,214],sun:[255,220,129],seed:[189,241,151]
};
function addFxNode(cc,parent,name){
  const node=new cc.Node(name);node.layer=parent.layer;node.parent=parent;return node;
}
function fxColor(cc,rgb,a){return new cc.Color(rgb[0],rgb[1],rgb[2],a);}
function holoStroke(g,cc,points,rgb,alpha,width,close=false){
  if(points.length<2)return;
  g.strokeColor=fxColor(cc,rgb,alpha);g.lineWidth=width;g.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
  if(close)g.close();g.stroke();
}
function holoFacet(g,cc,points,rgb,alpha){
  g.fillColor=fxColor(cc,rgb,alpha);g.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.close();g.fill();
}
const glassShadow=[25,50,57],glassLight=[232,255,250];
const flightMode={
  shot:'pod',cut:'lance',ray:'prism',lock:'sight',fire:'cinder',blast:'ballistic',frost:'crystal',
  spark:'arc',spore:'mist',bind:'coil',wind:'gust',heal:'thread',shield:'thread',haste:'sight',
  drain:'siphon',sun:'ballistic',seed:'sprout'
};
const clamped=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamped(t);return t*t*(3-2*t);};
function holoRail(dx,dy,mode,action){
  const length=Math.hypot(dx,dy),den=Math.max(1,length),nx=-dy/den,ny=dx/den;
  const viewHeight=Math.min(50,length*.125),bend=Math.min(14,length*.12);
  const ratios=[0,.17,.35,.52,.73,.87,1];
  const pattern=mode==='crystal'?[0,-.50,.45,-.75,.53,-.20,0]:[0,.41,-.70,.95,-.84,.55,0];
  const node=(t)=>{
    let crest=0,sway=0;
    const envelope=4*t*(1-t);
    if(mode==='ballistic')crest=envelope*viewHeight*(action==='sun'?.72:1.18);
    else if(mode==='pod'||mode==='cinder')crest=envelope*viewHeight*(mode==='pod'?.36:.78);
    else if(mode==='thread'||mode==='mist'||mode==='siphon'){
      crest=envelope*viewHeight*.40;sway=Math.sin(Math.PI*2*t)*envelope*bend*(mode==='thread'?.72:1.04);
    }else if(mode==='gust'||mode==='coil')sway=Math.sin(Math.PI*3*t)*envelope*bend*(mode==='gust'?.42:.72);
    else if(mode==='arc'||mode==='crystal'){
      let i=1;while(i<ratios.length-1 && t>ratios[i])i++;
      const local=clamped((t-ratios[i-1])/(ratios[i]-ratios[i-1]));
      sway=(pattern[i-1]+(pattern[i]-pattern[i-1])*local)*bend;
      if(mode==='crystal')crest=-envelope*Math.min(9,length*.1);
    }else if(mode==='lance'&&action==='slice')sway=-bend*Math.sin(t*Math.PI)*t;
    else if(mode==='sprout')crest=envelope*10;
    return [dx*t+nx*sway,dy*t+ny*sway+crest];
  };
  function sample(t){
    const p=node(t),v=node(Math.min(1,t+.003)),u=t>.997?node(t-.003):p,dir=t>.997?p:v;
    const h=Math.hypot(dir[0]-u[0],dir[1]-u[1]);
    return {x:p[0],y:p[1],ux:h>.01?(dir[0]-u[0])/h:1,uy:h>.01?(dir[1]-u[1])/h:0};
  }
  return {length,mode,node,sample};
}
function traceGlass(cc,g,rail,rgb,rank){
  const {length,mode}=rail;
  if(length<24){
    for(const [r,col,alpha] of [[12,glassShadow,95],[11,rgb,130],[8,glassLight,93]]){
      g.strokeColor=fxColor(cc,col,alpha);g.lineWidth=1.05;g.ellipse(0,-2,r,3.2);g.stroke();
    }return;
  }
  const count=Math.max(3,Math.min(11,Math.ceil(length/37)));
  const dotted=mode==='sight'||mode==='sprout', wide=mode==='lance'||mode==='prism',organic=['thread','mist','siphon'].includes(mode);
  function point(t,offset=0,drop=0){const p=rail.sample(t);return [p.x-p.uy*offset,p.y+p.ux*offset+drop];}
  function segment(a,b,offset=0,drop=0){
    return [point(a,offset,drop),point((a+b)*.5,offset,drop),point(b,offset,drop)];
  }
  for(let i=0;i<count;i++){
    const a=(i+.12)/count,b=(i+(dotted?.54:.88))/count,depth=Math.sin(Math.PI*(i+.5)/count);
    const join=i%3,opacity=85+Math.round(depth*55);
    // Short translucent panels have a contact shadow and a bright leading edge; no solid full-lane stripe.
    holoStroke(g,cc,segment(a,b,0,-1.1),glassShadow,112,2.9);
    holoStroke(g,cc,segment(a,b),rgb,opacity+30,1.8);
    if(join===0||wide){
      const width=wide?3.4:2.6,end=a+(b-a)*.70;
      holoFacet(g,cc,[point(a,0),point(end,width),point(b,width*.30),point(a+.008,-.6)],rgb,wide?42:28);
      holoStroke(g,cc,segment(a,end,width),glassLight,opacity,1.0);
    }
    if(organic){
      const a2=(i+.38)/count,b2=(i+.93)/count;
      const rib=t=>point(t,Math.sin(Math.PI*3*t)*3.9);
      holoStroke(g,cc,[rib(a2),rib((a2+b2)*.5),rib(b2)],rgb,104,1.1);
    }
    if((join===1||dotted)&&length>65){
      const t=(i+.88)/count,p=rail.sample(t),d=dotted?3:2;
      holoStroke(g,cc,[[p.x-p.uy*d,p.y+p.ux*d],[p.x+p.uy*d,p.y-p.ux*d]],glassLight,dotted?175:128,1.05);
    }
  }
  if(mode==='arc'||mode==='crystal'){
    for(const [t,side] of [[.35,1],[.73,-1]]){
      const p=rail.sample(t),size=Math.min(12,length*.05);
      holoStroke(g,cc,[[p.x,p.y],[p.x+p.ux*size*.4-p.uy*size*side,p.y+p.uy*size*.4+p.ux*size*side],
        point(Math.min(1,t+.06),size*.88*side)],rgb,175,1.3);
    }
  }
}
function drawEmitter(cc,g,rgb,mode){
  const support=['thread','sprout','mist','siphon'].includes(mode);
  const side=support?7:6;
  for(const sign of [-1,1]){
    const pts=[[-5,side*sign],[-1,(side+2)*sign],[4,side*sign]];
    holoStroke(g,cc,pts,glassShadow,170,2.7);holoStroke(g,cc,pts,rgb,225,1.35);
    holoStroke(g,cc,[[-8,(side-1)*sign],[-6,(side+1)*sign]],glassLight,180,1.15);
  }
  holoFacet(g,cc,[[0,0],[-3,2.5],[-6,0],[-3,-2.5]],rgb,218);
}
function drawMote(cc,g,rgb,mode){
  const blade=['lance','prism','arc','sight'].includes(mode);
  const soft=['thread','mist','sprout','siphon'].includes(mode);
  const head=blade?9:soft?5.5:7,tail=blade?22:soft?12:16,h=soft?4.2:3.8;
  const art=blade?[[head,0],[-3,h],[-tail,1],[-8,-1],[-3,-h*.64]]:
    [[head,0],[1,h],[-tail,h*.43],[-5,-.45],[-tail*.72,-h*.45],[1,-h]];
  holoFacet(g,cc,art,glassShadow,193);holoStroke(g,cc,art,rgb,245,1.55,true);
  holoFacet(g,cc,[[head-1,0],[0,h*.52],[-tail*.64,.5],[-1,-h*.37]],rgb,240);
  holoStroke(g,cc,[[-tail*.62,.55],[-1,1.05],[head-.6,0]],glassLight,255,1.55);
  if(soft){g.fillColor=fxColor(cc,glassLight,230);g.circle(-4.7,2.0,1.55);g.fill();}
  if(mode==='crystal'){
    holoFacet(g,cc,[[-3,2],[-9,8],[-10,3],[-5,0]],rgb,205);
    holoStroke(g,cc,[[-10,3],[-9,8],[-5,2]],glassLight,190,1);
  }
}
function drawScanner(cc,g,rgb,mode){
  if(mode==='arc'||mode==='crystal'){
    holoStroke(g,cc,[[-10,-2],[-4,3],[0,-1],[6,3]],rgb,220,1.55);
  }else{
    for(const sign of [-1,1]){
      holoStroke(g,cc,[[-5,sign*3],[0,sign*5],[4,sign*3.6]],rgb,208,1.25);
    }
  }
  g.fillColor=fxColor(cc,glassLight,230);g.circle(0,0,1.8);g.fill();
}
function discardArt(node){
  if(node?.isValid){node.active=false;node.destroy();}
}
function clearGardenArt(state){
  if(!state)return;
  if(state.artFrame){cancelAnimationFrame(state.artFrame);state.artFrame=0;}
  if(state.visuals){for(const art of state.visuals)discardArt(art.root);state.visuals.clear();}
  if(state.lockBadges){for(const n of state.lockBadges.values())discardArt(n);state.lockBadges.clear();}
}
function drawGardenFx(cc,origin,targetNode,targetCell,action,rank,state,sourceNode=null,sourcePlant=null){
  if(state.fxSettings?.enabled===false || !cc?.Graphics || typeof requestAnimationFrame!=='function')return;
  const family=visualFamily[action]||'shot',rgb=fxPalette[family],mode=flightMode[family];
  const nativeLaunch=sourcePlant?.peaSpawnpoint||sourcePlant?.peaSpawnPoint||sourcePlant?.cabbageSpawnPoint||
    sourcePlant?.boomerangSpawnpoint||sourcePlant?.shootPoint||sourcePlant?.ShootPoint||sourcePlant?.sunSpawnpoint;
  const nozzle=nativeLaunch?.isValid && nativeLaunch.activeInHierarchy?nativeLaunch:null;
  const sourceAnchor=sourceNode||nozzle||sourcePlant?.node||origin?.cell?.plantPoint||origin?.cell?.node;
  const destination=targetNode||targetCell?.plantPoint||targetCell?.node||sourceAnchor;
  const parent=origin?.cell?.inLane?.prjLayer||origin?.cell?.plantPoint||sourceAnchor?.parent;
  if(!parent?.isValid||!sourceAnchor?.isValid||!destination?.isValid)return;
  const active=state.visuals||=new Set();
  if(active.size>=18)return;
  let root;
  try{
    const a=parent.inverseTransformPoint(new cc.Vec3(),sourceAnchor.worldPosition);
    const b=parent.inverseTransformPoint(new cc.Vec3(),destination.worldPosition);
    if(!nozzle||sourceNode)a.y+=action==='seed'?10:sourceNode?29:31;
    b.y+=targetNode?31:action==='seed'?12:23;
    const dx=b.x-a.x,dy=b.y-a.y,rail=holoRail(dx,dy,mode,action);
    root=addFxNode(cc,parent,'GardenRankFX/'+family+'/'+action);root.setPosition(a.x,a.y,0);
    const layer=(name)=>{const n=addFxNode(cc,root,name);return {n,g:n.addComponent(cc.Graphics),op:n.addComponent(cc.UIOpacity)};};
    const trail=layer('Trail'),mote=layer('Mote'),emitter=layer('Launch'),scan=layer('Scan'),impact=layer('Impact');
    traceGlass(cc,trail.g,rail,rgb,rank);drawEmitter(cc,emitter.g,rgb,mode);drawMote(cc,mote.g,rgb,mode);drawScanner(cc,scan.g,rgb,mode);
    const start=rail.sample(0),heading=Math.atan2(start.uy,start.ux)*180/Math.PI;
    emitter.n.angle=heading;impact.n.setPosition(dx,dy,0);
    const touchdown=(typeof gardenHoloImpact==='function')?gardenHoloImpact(cc,impact.n,family,rank,rgb,action):null;
    // This open footlight grounds the projected symbol and also renders standalone when the art pack is absent.
    for(const [x,sign] of [[-12,1],[12,-1]]){
      const pts=[[x-3*sign,-14],[x,-16],[x+5*sign,-16]];
      holoStroke(impact.g,cc,pts,glassShadow,134,2.7);holoStroke(impact.g,cc,pts,rgb,186,1.2);
    }
    if(!touchdown){
      holoStroke(impact.g,cc,[[-6,0],[0,7],[6,0],[0,-7],[-6,0]],rgb,240,1.8);
      holoStroke(impact.g,cc,[[-3,0],[0,3],[3,0]],glassLight,220,1.2);
    }
    const ray=mode==='lance'||mode==='prism'||mode==='arc',heavy=mode==='ballistic'||mode==='crystal',quiet=mode==='thread'||mode==='sprout'||mode==='mist'||mode==='siphon';
    const duration=quiet?960:heavy?900:ray?705:810,charge=quiet?.09:.07,arrival=ray?.34:heavy?.47:quiet?.50:.42;
    const born=performance.now(),rootOpacity=root.addComponent(cc.UIOpacity);
    const anchorAt=new cc.Vec3(),drift={x:0,y:0};
    function flight(n,t,follow,reverse=false){
      const p=rail.sample(clamped(t));n.setPosition(p.x+drift.x*follow,p.y+drift.y*follow,0);
      n.angle=Math.atan2(p.uy,p.ux)*180/Math.PI+(reverse?180:0);
    }
    const visual={root,update(now){
      if(!root.isValid || !root.activeInHierarchy || state.fxSettings?.enabled===false){discardArt(root);return false;}
      const t=clamped((now-born)/duration);if(t>=1){discardArt(root);return false;}
      const travel=clamped((t-charge)/(arrival-charge)),hitTime=clamped((t-arrival)/(1-arrival));
      const lead=ray?1-(1-travel)*(1-travel):smooth(travel), hitFade=smooth(hitTime/.15);
      if(targetNode?.isValid&&targetNode.activeInHierarchy&&rail.length>25){
        parent.inverseTransformPoint(anchorAt,targetNode.worldPosition);
        const ox=anchorAt.x-b.x,oy=anchorAt.y+31-b.y;
        // Ignore pool teleports; a walking target can carry the projection a short distance with it.
        if(Math.hypot(ox,oy)<48){drift.x=ox;drift.y=oy;}
      }
      emitter.op.opacity=Math.round(245*(1-smooth((t-.07)/.29)));
      const aperture=.62+.45*smooth(t/.15);emitter.n.setScale(aperture,aperture,1);
      trail.op.opacity=Math.round(245*smooth(t/.12)*(1-smooth((t-arrival+.01)/.35)));
      mote.n.active=travel>0&&travel<1;
      if(mote.n.active){flight(mote.n,lead,lead*lead);mote.op.opacity=Math.round(255*smooth(travel/.07));}
      const back=mode==='siphon'&&hitTime>.15&&hitTime<.70;
      const scanner=back?1-smooth((hitTime-.15)/.55):Math.max(0,lead-.10);
      scan.n.active=(travel>.15&&travel<1&&rail.length>42)||back;
      if(scan.n.active){flight(scan.n,scanner,scanner*scanner,back);scan.op.opacity=back?200:177;}
      impact.n.setPosition(dx+drift.x*lead,dy+drift.y*lead,0);
      impact.op.opacity=Math.round(255*hitFade);
      const imprint=.84+.16*smooth(hitTime/.22);impact.n.setScale(imprint,imprint,1);
      if(touchdown&&hitTime>0)touchdown(hitTime);
      rootOpacity.opacity=Math.round(255*(1-smooth((t-.76)/.24)));return true;
    }};
    visual.update(born);active.add(visual);
    if(!state.artFrame){
      const render=now=>{
        state.artFrame=0;
        for(const v of active)if(!v.update(now))active.delete(v);
        if(active.size)state.artFrame=requestAnimationFrame(render);
      };
      state.artFrame=requestAnimationFrame(render);
    }
  }catch(error){discardArt(root);if(!state.artWarning){state.artWarning=true;console.warn('[Garden Research] combat ornament',error);}}
}

export async function install(ctx, getRank) {
  if (typeof getRank !== 'function') throw new TypeError('A rank reader is required');
  const load = ctx?.load || (name => globalThis.System.import('chunks:///_virtual/'+name+'.ts'));
  const [plantData, grid, cm, level, clock, sunflower, sq, cc] = await Promise.all([
    load('Plants'),load('LnC'),load('CharacterManager'),load('levelController'),load('KeyListener'),
    load('Sunflower'),load('Square'),ctx?.cc || globalThis.System?.import('cc')
  ]);
  const plantClass=plantData.plants, LnC=grid.LnC, Manager=cm.CharacterManager, levelPlay=level.LevelPlay;
  const laserGuard=ctx?.laserShield || (typeof gardenLaserShield!=='undefined'?gardenLaserShield:{all:()=>null,allows:()=>true,draw:()=>false});
  const baseStats=ctx?.baseStats || (typeof gardenBaseStats==='function'?gardenBaseStats:rank=>({damage:1+.05*rank}));
  const eventMethods={peashooter:'_shootAnmEvent', repeater:'repeater_shoot_event', sunflower:'_produce', twinsunflower:'_produce', wallnut:'dealNormalDamage',potatomine:'explodeAction',cabbagepult:'LobEvent',bloomerang:'catchPrj',iceburg:'freezeZombie',bonkchoy:'animationListener',gravebuster:'animationListener'};
  const attached=new WeakMap();
  const already=activeInstalls.get(Manager);
  if(already) return already;
  const originalSpawn=LnC.prototype.SpawnPlant, originalStep=Manager.prototype.characterManagerUpdate;
  const modes=ctx?.modes || (typeof gardenModes!=='undefined'?gardenModes:null);
  const readMode=ctx?.getMode || (id=>(typeof gardenChallenge!=='undefined'?gardenChallenge.equippedMode(id):null)??(typeof gardenEconomy!=='undefined'?gardenEconomy.mode(id):0));
  const masteryEngine=ctx?.mastery || (typeof gardenModeMastery!=='undefined'?gardenModeMastery:null);
  const readMastery=ctx?.getMastery || ((id,index)=>(typeof gardenChallenge!=='undefined'?gardenChallenge.mastery?.(id,index):null)??(typeof gardenEconomy!=='undefined'?gardenEconomy.mastery(id,index):0));
  const selectedMode=ref=>ref?.rank===6&&modes?modes.options(ref.plan.id)[readMode(ref.plan.id)]:null;
  if(typeof originalSpawn!=='function'||typeof originalStep!=='function') throw new Error('Unsupported game build');
  const worldStates=new WeakMap(), generations=new WeakMap(), marks=new WeakMap();
  const originalRegister=cm.PlantPool.registerPlant, originalZombieRegister=cm.ZombiePool.registerZombie;
  const fxSettings=ctx?.fxSettings || (typeof gardenFxSettings!=='undefined'?gardenFxSettings:null);
  let currentArtState=null;
  fxSettings?.subscribe?.(enabled=>{if(!enabled)clearGardenArt(currentArtState);});
  if(cc?.Director?.EVENT_BEFORE_SCENE_LAUNCH){
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,()=>{clearGardenArt(currentArtState);currentArtState=null;});
  }
  function stateFor(manager) {
    let s=worldStates.get(manager);
    if(!s||s.level!==levelPlay.component) {
      clearGardenArt(currentArtState);
      s={level:levelPlay.component,age:0,plants:new Map(),seen:new WeakMap(),later:[],frame:null,fxSettings};
      worldStates.set(manager,s);
    }
    currentArtState=s;
    return s;
  }
  if(typeof gardenCombatStats!=='undefined')gardenCombatStats.onReconClock?.((manager,body,ratio)=>{
    const s=worldStates.get(manager),ref=s?.plants.get(body);
    if(ref&&ref.next>s.age)ref.next=s.age+(ref.next-s.age)*ratio;
  });
  const real = ref => alive(ref.body) && (generations.get(ref.body)||0)===ref.generation;
  // These plants emit their genuine action from an animation that can run after die() marks the body dead.
  const finalActions=new Set(['iceburg','potatomine','gravebuster']);
  const awaitingFinalAction=ref=>ref.event && !ref.once && finalActions.has(ref.plan.id) &&
    ref.body.node?.isValid && ref.body.node.activeInHierarchy && !ref.body.displayed &&
    (generations.get(ref.body)||0)===ref.generation;
  function hit(target,n,kind=0,pierce=false,state,owner) {
    if(!alive(target)||target.invincible) return false;
    const multiplier = (marks.get(target)||0)>state.age?1+.18*mechanismWeight:1;
    const before=target.health+(target.armors||[]).reduce((v,a)=>v+(Number(a.health)||0),0);
    const packet=new cm.ZombieDamageDetails(n*multiplier,!pierce,false,false,null,kind,true);
    if(typeof gardenPlantCritical!=='undefined')gardenPlantCritical.mark(packet,owner);
    target.dealDamage(packet);
    const after=target.health+(target.armors||[]).reduce((v,a)=>v+(Number(a.health)||0),0);
    return after<before || target.dead;
  }
  function showMark(target,state){
    if(state.fxSettings?.enabled===false||!cc?.Graphics||!target.node?.isValid)return;
    const badges=state.lockBadges||=new Map();
    if(badges.get(target)?.isValid||badges.size>=10)return;
    try{
      const n=addFxNode(cc,target.node,'GardenRankStatus/lock');badges.set(target,n);
      n.setPosition(0,55,0);
      const g=n.addComponent(cc.Graphics);
      const gold=fxPalette.lock;
      for(const sx of [-1,1])for(const sy of [-1,1]){
        const bracket=[[sx*6,sy*8],[sx*9,sy*8],[sx*11,sy*6],[sx*11,sy*3]];
        holoStroke(g,cc,bracket,glassShadow,220,3.15);holoStroke(g,cc,bracket,gold,248,1.5);
      }
      const rotor=addFxNode(cc,n,'Azimuth'),gg=rotor.addComponent(cc.Graphics);n._gardenRotor=rotor;
      for(const angle of [0,Math.PI]){
        const a=angle+.35,b=angle+.95;
        const ticks=[[6*Math.cos(a),6*Math.sin(a)],[6*Math.cos(b),6*Math.sin(b)]];
        holoStroke(gg,cc,ticks,glassLight,229,1.15);
      }
      holoFacet(g,cc,[[0,-2],[2,0],[0,2],[-2,0]],gold,245);
    }catch(error){
      const n=badges.get(target);if(n?.isValid)n.destroy();badges.delete(target);
      if(!state.artWarning){state.artWarning=true;console.warn('[Garden Research] combat ornament',error);}
    }
  }
  function effectOn(ref, effect, target, loc, power, state, snap) {
    const home = !target || target.isResearchCell;
    const cell = home? loc.cell : (target.plantInLnC || target.inLnC || loc.cell);
    const actual = target && !home;
    const magnitude=power*mechanismWeight;
    const potency=baseStats(ref.rank).damage;
    const attack=magnitude*potency;
    const owner=ref.simulationOrigin?.code||ref.plan.id;
    function dmg(n,type=0,through=false){return actual && hit(target,n*attack,type,through,state,owner);}
    if(effect==='sun'){
      const at=actual?target.worldPosition:sq.Square.getSquareWorldPosition(loc.r,loc.c,.5,.5);
      if(typeof gardenFunctional!=='undefined'){
        // The native pickup can retain a fractional face value. Settle it for
        // this caster now instead of giving the remainder to the next caster.
        const solar=typeof gardenModes!=='undefined'?gardenModes.solarFactor(ref.rank,ref.plan.id):1;
        gardenFunctional.sun({_gardenSunYield:potency,_gardenSolarFactor:solar,_gardenSimulationId:owner},
          sunflower.sunflower,15*magnitude,at,28,true,false,false);
      }else{
        const total=15*magnitude+(state.sunCarry||0),drop=5*Math.floor((total+1e-8)/5);
        state.sunCarry=Math.max(0,total-drop);
        if(drop>0)sunflower.sunflower.produceSun(drop*potency,at,28,true,false,false);
      }
    } else if(!actual || !alive(target)) return false;
    else switch(effect) {
      case 'mark':{
        dmg(14);
        if(alive(target)){
          marks.set(target,Math.max(marks.get(target)||0,state.age+7*power));
          showMark(target,state);
        }
        break;
      }
      case 'dart':dmg(32);break; case 'slice':dmg(ratio(target)<.5?48:36);break;
      case 'pierce':dmg(26,0,true);break;case 'beam':dmg(40,4);break;case 'ember':dmg(35,1);break;
      case 'shatter':dmg(iced(target)?65:22);break;case 'shatterPoison':dmg(target.poisoned?65:22);break;
      case 'execute':dmg(ratio(target)<1/3?76:24);break;case 'crack':dmg(target.armors?.length?66:22);break;
      case 'burst':case 'blast':case 'spark': {
        const origin=fixedPosition(target), isShock=effect==='spark', big=effect==='blast';
        dmg(isShock?22:big?38:28,isShock?2:0);
        const next=snap.foes.filter(other=>other!==target&&alive(other)&&range(origin,other)<=1).sort((a,b)=>range(origin,a)-range(origin,b));
        for(const other of next.slice(0,isShock?1:2)){
          hit(other,(isShock?15:big?16:12)*attack,isShock?2:0,false,state,owner);
          const from=fixedPosition(target);from.cell=cell;
          drawGardenFx(cc,from,other.node,other.inLnC,isShock?'spark':'burst',ref.rank,state,target.node);
        }
        break;
      }
      case 'venom':case 'spore':{
        const args=effect==='venom'?[7*attack,4]:[4*attack,4,true];
        if(typeof gardenPlantCritical!=='undefined')gardenPlantCritical.poison(target,owner,args);else target.setPoison(...args);break;
      }
      case 'burntrail':{
        dmg(12,1);
        const identity=target.existTime, spawnLevel=target.spawnedWave, currentGeneration=generations.get(target);
        state.later.push({at:state.age+1.5,run:()=>{
          if(alive(target)&&generations.get(target)===currentGeneration&&target.existTime>=identity&&target.spawnedWave===spawnLevel){
            hit(target,18*attack,1,false,state,owner);
            drawGardenFx(cc,loc,target.node,target.inLnC,'ember',ref.rank,state);
          }
        }});break;
      }
      case 'stagger':target.setStun(.85*attack);break;case 'butter':target.setButter(1.25*attack);break;
      case 'slow':target.setChill(3*attack);break;
      case 'freeze':{
        const duration=1.4*attack,remaining=Math.max(0,Number(target.freeze)||0);
        // Propagate fresh ice first. On a previously frozen foe, a fissure can only bank 15 seconds.
        const next=ref.plan.id==='iceburg'?Math.max(remaining,Math.min(15,remaining+duration)):duration;
        target.setFreeze(next);break;
      }
      case 'shove':target.knockBackBy(new cc.Vec2(.45*attack,0),false,.22,false);break;
      case 'drain':if(dmg(22,0,true)&&real(ref))ref.body.heal(20*attack);break;
      case 'guardEnemy':target.setButter(1.15*attack);break;case 'wardEnemy':target.setStun(1.1*attack);break;
      case 'mend':target.heal(40*attack);break;
      case 'ward':target.setCountDownInvincible(.75*attack);break;
      case 'guard':target.setCountDownInvincibleGlitter(1.15*attack);break;
      case 'haste':target.plantCDScaleSetter(1-.18*mechanismWeight,4*power*potency);break;
      case 'cleanse':target.stunned=Math.max(0,(target.stunned||0)-3*attack);target.boomboxCD=Math.max(0,(target.boomboxCD||0)-3*attack);target.heal(15*attack);break;
      default:throw new Error('Unknown battle effect '+effect);
    }
    const sourcePlant=real(ref)&&ref.body.plantInLnC===loc.cell?ref.body:null;
    drawGardenFx(cc,loc,actual?target.node:null,cell,effect,ref.rank,state,null,sourcePlant);
    return true;
  }
  function tileAt(r,c) {
    if(r<0||c<0||r>sq.Square.MaxLaneIndex||c>sq.Square.MaxColumnIndex) return null;
    const cell=sq.Square.getLnC(r,c);
    return cell?{r,c,cell}:null;
  }
  const bountyWatches=new WeakMap(),bountyHooked=new WeakSet();
  function watchBounty(target,onKill,seconds,state){
    let pending=bountyWatches.get(target);
    if(!pending){pending=new Set();bountyWatches.set(target,pending);}
    const watch={onKill,identity:generations.get(target)};
    pending.add(watch);
    state.later.push({at:state.age+seconds,run:()=>pending.delete(watch)});
    if(bountyHooked.has(target)||typeof target.dealDamage!=='function')return;
    bountyHooked.add(target);
    const original=target.dealDamage;
    target.dealDamage=function(...args){
      const wasAlive=!this.dead&&this.health>0,identity=generations.get(this);
      const value=original.apply(this,args);
      if(wasAlive&&generations.get(this)===identity&&(this.health<=0||this.dead)){
        const active=bountyWatches.get(this);
        if(active)for(const observer of active){active.delete(observer);if(observer.identity===identity)observer.onKill();}
      }
      return value;
    };
  }
  function sixthMode(ref,loc,state,manager) {
    const option=selectedMode(ref);
    if(!option)return;
    const specialization=masteryEngine?readMastery(ref.plan.id,readMode(ref.plan.id)):0;
    if(option.route==='laser'&&!specialization)return;
    const snap=()=>state.frame||=(snapshot(manager));
    const amountFactor=baseStats(ref.rank).damage;
    const env={
      loc,body:ref.body,level:levelPlay.component,row,col,ratio,live:alive,generation:b=>generations.get(b)||0,
      time:()=>state.age,after:(delay,run)=>state.later.push({at:state.age+delay,run}),
      onKilled:(target,fn,seconds)=>watchBounty(target,fn,seconds,state),
      foes:()=>snap().foes,allies:()=>snap().friends,density:b=>snap().density(b),tile:pos=>tileAt(pos.r,pos.c),
      effect:(action,target,power,at)=>effectOn(ref,action,target,at,power,state,snap()),
      flash:(action,target)=>drawGardenFx(cc,loc,target.node,target.plantInLnC,action,ref.rank,state),
      beacon:pos=>{const at=tileAt(pos.r,pos.c);if(at)drawGardenFx(cc,at,null,at.cell,'seed',ref.rank,state);},
      sun:(amount,art=state)=>{
        const at=sq.Square.getSquareWorldPosition(loc.r,loc.c,.5,.5);
        if(typeof gardenFunctional!=='undefined'){
          gardenFunctional.sun({_gardenSunYield:amountFactor,_gardenSolarFactor:modes?.solarFactor?.(ref.rank,ref.plan.id),_gardenSimulationId:ref.simulationOrigin?.code||ref.plan.id},sunflower.sunflower,amount,at,28,true,false,false);
        }else{
          const total=amount*amountFactor+(state.sunCarry||0),drop=5*Math.floor((total+1e-8)/5);
          state.sunCarry=Math.max(0,total-drop);if(drop>0)sunflower.sunflower.produceSun(drop,at,28,true,false,false);
        }
        drawGardenFx(cc,loc,null,loc.cell,'sun',ref.rank,art);
      }
    };
    modes.cast(option,env);
    if(!specialization)return;
    // Specialization art shares the scene's budget and cleanup while its switch
    // can mute just those emissions, including delayed effects.
    if(!state.masteryView){
      const settings={get enabled(){return state.fxSettings?.enabled!==false&&masteryEngine.fx;}};
      state.masteryView=new Proxy(state,{get:(target,k)=>k==='fxSettings'?settings:target[k]});
    }
    const art=state.masteryView;
    const targets=()=>{
      const all=snap();
      if(option.route!=='laser'||!real(ref))return all;
      const limits=laserGuard.all(ref.body);
      return limits?{...all,foes:all.foes.filter(z=>laserGuard.allows(limits,z))}:all;
    };
    masteryEngine.cast(option,{...env,foes:()=>targets().foes,sun:amount=>env.sun(amount,art),
      flash:(action,target)=>drawGardenFx(cc,loc,target.node,target.plantInLnC,action,ref.rank,art),
      beacon:pos=>{const at=tileAt(pos.r,pos.c);if(at)drawGardenFx(cc,at,null,at.cell,'ward',ref.rank,art);},
      effect:(action,target,power,at)=>effectOn(ref,action,target,at,power,art,targets())},specialization);
  }
  const laserBound=new WeakSet();
  function bindLaser(body){
    if(laserBound.has(body)||typeof body._shoot!=='function'||typeof body.detectEnemies!=='function')return;
    laserBound.add(body);
    const originalShot=body._shoot,originalDetect=body.detectEnemies,originalUpdate=body.specialPlantUpdate;
    function config(plant){
      if(!levelPlay.gaming||plant._gardenCombatRank!==6)return null;
      const manager=cm.PlantPool.cm, state=manager&&stateFor(manager),ref=state?.plants.get(plant);
      if(!ref||!real(ref))return null;
      const option=selectedMode(ref);
      if(!option||option.route!=='laser')return null;
      return {manager,state,ref,mode:option.effect};
    }
    function line(plant,r,limits=null){
      const cell=sq.Square.getLnC(r,plant.cIndex),origin=plant.plantInLnC,point=plant.beamPoint.worldPosition;
      if(!cell?.inLane||!origin?.plantPoint)return null;
      const y=point.y+cell.plantPoint.worldPosition.y-origin.plantPoint.worldPosition.y;
      const rect=cm.Rectangle.createRectangleSide(new cc.Vec2(point.x,y),50*sq.Square.SquareWidth,sq.Square.SquareHeight/2);
      const enemies=cell.inLane.zombiePool().filter(z=>rect.judgeCrossRec(z.bodyRecForShooter)&&laserGuard.allows(limits,z,r));
      const tombs=cell.inLane.tombPool().filter(t=>rect.judgeCrossRec(t.bodyRec)&&laserGuard.allows(limits,t,r));
      return {cell,enemies,tombs};
    }
    function sideRows(plant){return [plant.lIndex-1,plant.lIndex+1].filter(r=>r>=0&&r<=sq.Square.MaxLaneIndex);}
    body.detectEnemies=function(...args){
      if(originalDetect.apply(this,args))return true;
      if(config(this)?.mode!=='triple')return false;
      return sideRows(this).some(r=>{const l=line(this,r);return l&&(l.enemies.length||l.tombs.length);});
    };
    body.specialPlantUpdate=function(...args){
      const conf=config(this);
      if(conf?.mode!=='rapid')return originalUpdate.apply(this,args);
      // Native shots discard a frame's elapsed time whenever the cooldown is reset.
      // Run its ordinary firing cycle once, then spread five additional native beams
      // across that same cycle. This keeps the 6:1 ratio even at low render rates.
      const props=this._objdataOwn,interval=props.ShootInterval,spread=props.ShootIntervalAdditional;
      const wasReady=this.shootCD<=0;
      let result;
      try{
        props.ShootInterval=6*interval;props.ShootIntervalAdditional=6*spread;
        result=originalUpdate.apply(this,args);
      }finally{props.ShootInterval=interval;props.ShootIntervalAdditional=spread;}
      if(wasReady&&this.shootCD>0&&!this.fooding&&!this.switching){
        const {ref,state}=conf,period=this.shootCD,source=this;
        for(let n=1;n<=5;n++)state.later.push({at:state.age+period*n/6,run:()=>{
          if(!real(ref)||selectedMode(ref)?.effect!=='rapid'||!levelPlay.gaming||source.fooding||source.stunned>0)return;
          if(!source.objdataOwn.AlwaysShoots&&!originalDetect.call(source))return;
          const pool=globalThis.System?.get('chunks:///_virtual/NodePools.ts');
          if(state.fxSettings?.enabled!==false&&pool?.instantiatePooly&&source.beamParticle&&!laserGuard.draw(source,source.lIndex)){
            const beam=pool.instantiatePooly(source.beamParticle);beam.parent=source.inLane.prjLayer;
            beam.worldPosition=source.beamPoint.worldPosition;
          }
          source._shoot();
        }});
      }
      return result;
    };
    body._shoot=function(...args){
      const conf=config(this);
      if(!conf||conf.mode==='rapid')return originalShot.apply(this,args);
      const {state,manager,ref,mode}=conf,props=this._objdataOwn;
      const amount=props.Damage*((this.MintBoosted&&props.MintDamageFactor>0)?props.MintDamageFactor:1)*(this._dmgScale||1);
      // Remember the impact cell before the native beam can kill or recycle its first victim.
      const limits=laserGuard.all(this);
      let impact=null;
      if(mode==='explosion'){
        const center=line(this,this.lIndex,limits),first=center&&[...center.enemies,...center.tombs].sort((a,b)=>a.worldPosition.x-b.worldPosition.x)[0];
        if(first){const c=first.inLnC?.cIndex??first.cIndex??sq.Square.judgeCIndex(first.worldPosition.x);impact=tileAt(this.lIndex,c);}
      }
      const result=originalShot.apply(this,args);
      if(mode==='triple'){
        for(const r of sideRows(this)){
          const l=line(this,r,limits);if(!l)continue;
          const dmg=new cm.ZombieDamageDetails(amount,true,false,true);
          if(typeof gardenPlantCritical!=='undefined')gardenPlantCritical.mark(dmg,ref.simulationOrigin?.code||ref.plan.id);
          for(const target of [...l.enemies,...l.tombs])target.dealDamage(dmg);
          const origin=tileAt(r,this.cIndex),end=tileAt(r,sq.Square.MaxColumnIndex);
          if(origin&&end&&!laserGuard.draw(this,r,limits))drawGardenFx(cc,origin,null,end.cell,'beam',6,state);
        }
      }else if(impact){
        const dmg=new cm.ZombieDamageDetails(amount,true,false,true);
        if(typeof gardenPlantCritical!=='undefined')gardenPlantCritical.mark(dmg,ref.simulationOrigin?.code||ref.plan.id);
        for(const z of snapshot(manager).foes.filter(z=>range(impact,z)<=1&&laserGuard.allows(limits,z)))z.dealDamage(dmg);
        drawGardenFx(cc,impact,null,impact.cell,'blast',6,state);
      }
      return result;
    };
  }
  function cast(ref, slot, loc, force, state, manager, skip=new Set()) {
    if(!loc) return [];
    const [area,action]=ref.plan[slot];
    const snap=state.frame||=(snapshot(manager));
    const body=real(ref)?ref.body:null;
    let targets=targetList(snap,loc,body,area,marks,state.age);
    if(ref.plan.id==='laser_bean'&&body){
      const limits=laserGuard.all(body);
      if(limits)targets=targets.filter(target=>laserGuard.allows(limits,target));
    }
    if(slot==='primary' && ref.plan.id==='iceburg'){
      const frozen=b=>Number(b.freeze>0||!!b.iceblocked);
      targets.sort((a,b)=>frozen(a)-frozen(b));
    }
    if(area==='home'&&action==='sun') targets=[loc.cell];
    else if(area==='home'&&!targets.length) return [];
    if(area==='home'&&action==='sun') {
      if(skip.has(loc.cell)) return [];
      return effectOn(ref,action,null,loc,force*strength(ref.rank),state,snap)?[loc.cell]:[];
    }
    const first=targets.find(b=>!skip.has(b)&&effectOn(ref,action,b,loc,force*strength(ref.rank),state,snap));
    return first?[first]:[];
  }
  function pulse(ref,loc,state,manager) {
    const p=ref.plan;
    if(!p.cycle){
      drawGardenFx(cc,loc,null,loc.cell,'seed',ref.rank,state);
    }
    const first=cast(ref,'primary',loc,1,state,manager);
    if(ref.rank>=3)cast(ref,'secondary',loc,1,state,manager);
    if(ref.rank>=4&&first.length){
      if(p.primary[0]==='home'){
        const snap=state.frame||=(snapshot(manager));
        const friend=snap.friends.filter(b=>alive(b)&&b!==ref.body&&range(loc,b)<=2&&(row(b)!==loc.r||col(b)!==loc.c))
          .sort((a,b)=>range(loc,a)-range(loc,b))[0];
        if(friend)cast(ref,'primary',tileAt(row(friend),col(friend)),.45,state,manager);
      }else cast(ref,'primary',loc,.45,state,manager,new Set(first));
    }
    if(ref.rank>=5){
      const delay=!p.cycle?4:p.id==='sunflower'||p.id==='twinsunflower'?2:0;
      if(delay)state.later.push({at:state.age+delay,run:()=>cast(ref,'secondary',loc,.55,state,manager)});
    }
    if(ref.rank===6)sixthMode(ref,loc,state,manager);
  }
  function track(manager, cell, body, match) {
    if(!manager || !body || !match || !cell) return;
    const state=stateFor(manager), gen=generations.get(body)||0;
    if(state.seen.get(body)===gen) return;
    state.seen.set(body,gen);
    const {rank,plan}=match;
    const ref={body,generation:gen,rank,plan,loc:{r:cell.lIndex,c:cell.cIndex,cell},next:state.age+(plan.cycle?2/(body._gardenCombatStats?.actionSpeed||1):0)};
    if(typeof gardenPlantSimulation!=='undefined')ref.simulationOrigin=gardenPlantSimulation.capture(body);
    state.plants.set(body,ref);
    if(plan.id==='laser_bean')bindLaser(body);
    const method = eventMethods[plan.id];
    if(method && typeof body[method]==='function'){
      ref.event=method; ref.charges=0; ref.side=0; ref.lastSignal=-Infinity; ref.once=false;
      let set=attached.get(body);if(!set){set=new Set();attached.set(body,set);}
      if(!set.has(method)){
        set.add(method);const base=body[method];
        body[method]=function(...args){
          const managerNow=cm.PlantPool.cm;
          const stateNow=managerNow && stateFor(managerNow), rec=stateNow?.plants.get(this);
          if(!rec||rec.event!==method||!levelPlay.gaming||(!real(rec)&&!awaitingFinalAction(rec)))return base.apply(this,args);
          const id=rec.plan.id;
          const hasTomb=id==='gravebuster' && args[0]?.name==='finish' && !!this.inLnC?.tombstone;
          const isCatch=id==='bloomerang' && args[0]?.master===this && args[0]?.returned && this.boomerangsShot?.includes(args[0]);
          const strike=id==='bonkchoy' && ['attackGoal','attackHeavy'].includes(args[0]?.name) && this.detectEnemy();
          const frozen=id==='iceburg' && !args[0]?.invincible;
          const before=(this.health||0)+Math.max(0,this.armorHealth||0);
          const wasFeeding=this.fooding;
          const result=base.apply(this,args);
          try {
            let fire=false;
            if(id==='gravebuster')fire=hasTomb&&!rec.once;
            else if(id==='iceburg')fire=frozen && (iced(args[0])) && !rec.once;
            else if(id==='potatomine')fire=!rec.once;
            else if(id==='sunflower'||id==='twinsunflower')fire=!wasFeeding;
            else if(id==='wallnut'){
              const after=(this.health||0)+Math.max(0,this.armorHealth||0);
              rec.charges+=Math.max(0,before-after);
              const threshold=this.toughness*(rec.rank>=5?.10:.12);
              if(rec.charges>=threshold&&threshold>0){rec.charges%=threshold;fire=true;}
            } else if(id==='bonkchoy' && strike){
              const side=this.plantScale<0?-1:1;
              const turned=rec.side!==0&&rec.side!==side;rec.side=side;rec.charges++;
              fire=(turned||rec.charges>=(rec.rank>=5?3:4))&&stateNow.age-rec.lastSignal>=1.5;
            } else if (!wasFeeding) {
              const threshold=id==='peashooter'?(rec.rank>=5?4:5):id==='repeater'?(rec.rank>=5?4:6):(rec.rank>=5?2:3);
              if(['peashooter','repeater','cabbagepult'].includes(id)||isCatch)fire=++rec.charges>=threshold;
            }
            if(fire){
              if(id!=='wallnut')rec.charges=0;
              rec.once=true;rec.lastSignal=stateNow.age;stateNow.frame=null;
              const point=rec.body.plantInLnC;
              const origin=point?{r:point.lIndex,c:point.cIndex,cell:point}:rec.loc;
              pulse(rec,origin,stateNow,managerNow);
            }
          }catch(e){if(!rec.eventWarning){rec.eventWarning=true;console.error('[Garden Research] native plant action',e);}}
          return result;
        };
      }
    }
  }
  function step(manager) {
    const state=stateFor(manager);
    if(!levelPlay.gaming || !clock.KeyListener.runLogic) return;
    const dt=clock.KeyListener.logicDt;
    if(!Number.isFinite(dt)||dt<=0) return;
    state.age+=dt;state.frame=null;
    if(state.lockBadges){
      for(const [target,node] of state.lockBadges){
        if((marks.get(target)||0)>state.age&&alive(target)&&node.isValid){
          if(node._gardenRotor?.isValid)node._gardenRotor.angle=(state.age*21)%360;
          continue;
        }
        if(node.isValid)node.destroy();state.lockBadges.delete(target);
      }
    }
    const due=state.later.filter(item=>item.at<=state.age);
    if(due.length){state.later=state.later.filter(item=>item.at>state.age);for(const job of due)job.run();}
    for(const [body,ref] of state.plants){
      const live=real(ref),instant=!ref.plan.cycle;
      if((!instant||ref.event)&&!live){
        if(!awaitingFinalAction(ref))state.plants.delete(body);
        continue;
      }
      const loc=live&&body.plantInLnC?{...fixedPosition(body),cell:body.plantInLnC}:ref.loc;
      if(!ref.event && state.age>=ref.next) {
        pulse(ref,loc,state,manager);
        if(instant){state.plants.delete(body);continue;}
        ref.next=state.age+pulseDuration(ref.plan,ref.rank)/(body._gardenCombatStats?.actionSpeed||1);
      }
      if(!live)continue;
    }
  }
  cm.PlantPool.registerPlant=function(body){generations.set(body,(generations.get(body)||0)+1);return originalRegister.apply(this,arguments);};
  cm.ZombiePool.registerZombie=function(body){generations.set(body,(generations.get(body)||0)+1);marks.delete(body);bountyWatches.delete(body);return originalZombieRegister.apply(this,arguments);};
  LnC.prototype.SpawnPlant=function(...args) {
    const id=args[0];
    // The first call animates the white Imitater shell; the second spawns the resolved native plant.
    const match=args[5]?null:resolve(args[8],id,false,getRank);
    if(match?.rank>=2 && match.plan.nativeStat) {
      const base=args[7]||plantClass.getPlantProps(id);
      const key=match.plan.nativeStat, v=base?.[key];
      if(Number.isFinite(v)&&v>0) {
        const rate=match.rank>=5?.08:.04;
        args[7]=Object.assign(Object.create(Object.getPrototypeOf(base)),base,{[key]:v*(1+(match.plan.nativeDown?-rate:rate))});
      }
    }
    const owner=cm.PlantPool.cm;
    return originalSpawn.apply(this,args).then(body=>{
      if(body && match && owner===cm.PlantPool.cm)track(owner,this,body,match);
      return body;
    });
  };
  Manager.prototype.characterManagerUpdate=function(dt){
    const result=originalStep.call(this,dt);
    try{step(this);}catch(error){const s=stateFor(this);if(!s.error){s.error=true;console.error('[Garden Research] battle step',error);}}
    return result;
  };
  const binding=Object.freeze({ready:true,roster:catalogue.length});
  activeInstalls.set(Manager,binding);
  return binding;
}
