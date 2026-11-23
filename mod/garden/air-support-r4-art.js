// Board-space aviation cues. Reuse the painted impact flipbooks and add distinct
// fracture, ground and high-altitude silhouettes. The renderer never resolves damage.
const gardenAirR4Art = (() => {
  const battles=new WeakMap(), atlases=new Map();
  const tau=Math.PI*2, frames=14, pixels=160;
  const limit=24;
  const kinds={
    coax:{type:'f22',life:.41,delay:.095,span:1.48},
    shatter:{type:'f35',life:.68,delay:.24,span:2.26},
    'f35-guided':{type:'f35',life:.92,delay:.26,span:3.35},
    'fort-guided':{type:'fortress',life:1.05,delay:.23,span:4.7},
    'fort-bunker':{type:'fortress',life:1.26,delay:.29,span:5.2},
    'fort-airburst':{type:'fortress',life:1.18,delay:.24,span:5.6}
  };
  const enabled=()=>typeof gardenFxSettings==='undefined'||gardenFxSettings.enabled;
  const clamp=t=>Math.max(0,Math.min(1,t));
  const noise=n=>Math.sin(n*76.33+17.15)*43758.5%1;
  const ease=t=>1-(1-clamp(t))**3;
  function oval(g,x,y,rx,ry,fill,stroke,width=1){
    if(rx<=.1||ry<=.1)return;
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,tau);
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function line(g,points,color,width){
    g.beginPath();g.moveTo(points[0],points[1]);
    for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
    g.strokeStyle=color;g.lineWidth=width;g.stroke();
  }
  function glow(g,x,y,r,center,edge){
    const v=g.createRadialGradient(x,y,0,x,y,r);
    v.addColorStop(0,center);v.addColorStop(.44,edge);v.addColorStop(1,edge.slice(0,7)+'00');oval(g,x,y,r,r,v);
  }
  function shards(g,t,n,colors,reach,ground){
    for(let i=0;i<n;i++){
      const angle=(i+.34*noise(i+32))*tau/n, speed=reach*(.65+.31*Math.abs(noise(i+6)));
      const x=Math.cos(angle)*speed*ease(t),y=Math.sin(angle)*speed*.58*ease(t)-(ground?45:15)*t*(1-t)+22*t*t;
      const k=(1-t*.68)*(3.2+2*Math.abs(noise(i+16)));g.save();g.translate(x,y);
      g.rotate(angle+t*(2+noise(i)*3));g.beginPath();g.moveTo(-k*1.5,0);g.lineTo(-k*.5,-k*.4);
      g.lineTo(k*.93,-k*.28);g.lineTo(k*1.35,k*.08);g.lineTo(-k*.45,k*.36);g.closePath();
      g.fillStyle=colors[i%colors.length];g.fill();
      line(g,[-k*1.35,0,-k*.45,-k*.35,k*.95,-k*.24],colors[(i+1)%colors.length],.9);g.restore();
    }
  }
  function draw(g,kind,t){
    const bloom=ease(t*2.1),tail=1-clamp((t-.45)/.55);
    g.save();g.lineCap='round';g.lineJoin='round';g.globalAlpha=tail;
    if(kind==='f35-guided'){
      // A cold glass ring gives way to a hot central flash and lifted alloy scales.
      const radius=61*ease(t),rim=clamp(1-t);
      oval(g,0,12,radius,radius*.37,'#89e8ec19','#adf3f6',2.3*rim+.3);
      oval(g,0,12,radius*.8,radius*.29,null,'#72bed6',1.1);
      for(let i=0;i<8;i++){
        const angle=i*tau/8+t*.25,dx=Math.cos(angle),dy=Math.sin(angle)*.4;
        line(g,[dx*(radius-7),12+dy*(radius-7),dx*radius,12+dy*radius],'#f0ffeb',1.6);
      }
      g.save();g.translate(0,3);g.scale(.62,.67);
      if(typeof gardenAirImpactArt!=='undefined')gardenAirImpactArt.draw(g,'guided',t);
      g.restore();
      glow(g,0,2,22*(1-t)+1,'#fffef2','#fba558a3');
      shards(g,t,16,['#7edddf','#e1f6e6','#a7a6bc','#eca774'],69,true);
    }else if(kind==='coax'||kind==='shatter'){
      const coax=kind==='coax';
      glow(g,0,0,(coax?38:52)*bloom+1,coax?'#fff8d9':'#fae0ff',coax?'#faac5eac':'#be7ee25a');
      g.save();g.rotate(-.3);
      for(let i=0;i<(coax?2:3);i++){
        const radius=(15+i*9)*bloom+1;g.beginPath();
        g.ellipse(0,0,radius,radius*.79,.34,(i+1)*1.7+t,(i+1)*1.7+t+4.2);
        g.strokeStyle=(coax?['#ffd78f','#72e4df']:['#e7b7ff','#fff3ce','#81dedc'])[i];g.lineWidth=1.7;g.stroke();
      }g.restore();
      if(!coax)for(let i=0;i<5;i++){
        const a0=tau*i/5,x=Math.cos(a0),y=Math.sin(a0),l=(18+15*bloom);
        line(g,[x*3,y*3,x*l*.49-y*2,y*l*.49+x*2,x*l*.67+y*2,y*l*.67-x*2,x*l,y*l],'#faf1e8',1.4);
      }
      shards(g,t,coax?12:18,coax?['#ffaf5b','#f8db97','#a0f5ed']:['#4b546e','#a69bb5','#ffdfae','#e4e9e2'],coax?70:82,false);
    }else{
      const air=kind==='fort-airburst',bunker=kind==='fort-bunker',raise=air?-17:8;
      const p=bunker?['#e99848','#ffe6ad','#603d42']:air?['#86dbe3','#fbf7d1','#65597e']:['#71e0bf','#fff6b6','#485b5a'];
      // A surface wave expands in perspective below the column or the airborne flower.
      const radius=66*ease(t);
      oval(g,0,22,radius,radius*.26,p[0]+'15',p[1],2.2);
      oval(g,0,22,radius*.86,radius*.22,null,p[0],1.1);
      // Segmented pressure fronts above the turf keep the crater and nearby lanes legible.
      for(let i=0;i<4;i++){
        const angle=(i+.15)*tau/4,rx=radius*(.92+.06*(i%2));
        g.beginPath();g.ellipse(0,18,rx+.3,rx*.27+.3,0,angle,angle+.66);
        g.strokeStyle=p[i%2];g.lineWidth=1.35;g.stroke();
      }
      if(bunker){
        for(let i=0;i<7;i++){
          const a=tau*i/7+.11,x=Math.cos(a),y=Math.sin(a)*.36,L=(32+25*Math.abs(noise(i)))*bloom;
          const points=[0,18,x*L*.24-y*4,18+y*L*.24,x*L*.46+y*4,18+y*L*.46-3,x*L,18+y*L];
          line(g,points,'#443735',3.4);line(g,points,p[0],1.3);
        }
      }
      g.save();g.translate(0,raise);g.scale(air?.65:.79,air?.45:bunker?.87:.70);
      if(typeof gardenAirImpactArt!=='undefined')gardenAirImpactArt.draw(g,bunker?'fortress':air?'cluster':'guided',t);
      g.restore();
      if(air){
        const blast=clamp(t*1.8);
        for(let i=0;i<15;i++){
          const a=tau*i/15+.06*noise(i),dx=Math.cos(a),dy=Math.sin(a)*.71,r=(34+31*Math.abs(noise(i+20)))*ease(blast);
          const x=dx*r,y=raise+dy*r+12*t*t;
          line(g,[x-dx*11,y-dy*11,x,y],p[0],2);oval(g,x,y,1.9,1.4,p[1]);
        }
        glow(g,0,raise,17*(1-clamp(t))+.2,'#ffffff','#d9fcea9a');
      }else{
        g.save();g.translate(0,raise+3);shards(g,t,bunker?14:10,bunker?['#76604f','#9d937a','#ffe7a8']:['#866b62','#b3f3d8','#ffe5a6'],67,true);g.restore();
      }
    }
    g.restore();
  }
  function atlas(cc,kind){
    if(atlases.has(kind))return atlases.get(kind);
    const cols=7,canvas=document.createElement('canvas');canvas.width=pixels*cols;canvas.height=pixels*2;
    const g=canvas.getContext('2d');
    for(let i=0;i<frames;i++){
      const x=i%cols*pixels,y=Math.floor(i/cols)*pixels;g.save();g.beginPath();g.rect(x,y,pixels,pixels);g.clip();
      g.translate(x+pixels*.5,y+pixels*.54);g.scale(.91,.91);draw(g,kind,(i+.28)/frames);g.restore();
    }
    const texture=new cc.Texture2D();texture.image=new cc.ImageAsset(canvas);
    const row=Array.from({length:frames},(_,i)=>{
      const frame=new cc.SpriteFrame();frame.texture=texture;
      frame.rect=new cc.Rect(i%cols*pixels,Math.floor(i/cols)*pixels,pixels,pixels);
      if(cc.Size)frame.originalSize=new cc.Size(pixels,pixels);
      frame.packable=false;frame.addRef?.();return frame;
    });
    atlases.set(kind,row);return row;
  }
  function view(s){
    let a=battles.get(s);if(a?.root.isValid)return a;
    const sq=s.square,base=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;
    const o0=sq.getLnC(0,0)?.plantPoint,x0=sq.getLnC(0,1)?.plantPoint,y0=sq.getLnC(1,0)?.plantPoint;
    if(!base?.isValid||!o0||!x0||!y0)return null;
    const cc=window.System.get(window.System.resolve('cc')),root=new cc.Node('GardenAir/R4Ordnance');
    root.setParent(base);root.layer=base.layer;
    const atNode=p=>root.inverseTransformPoint(new cc.Vec3(),p.worldPosition);
    const o=atNode(o0),xx=atNode(x0),yy=atNode(y0),w=Math.abs(xx.x-o.x),h=Math.abs(yy.y-o.y);
    if(!(w>0&&h>0)){root.destroy();return null;}
    const ink=new cc.Node('FlightPaths');ink.setParent(root);ink.layer=root.layer;
    const pen=ink.addComponent(cc.Graphics),colors=new Map();
    a={cc,root,base,pen,w,h,cues:[],free:[],origins:new Map(),colors,last:null,
      at(r,c,up=0){return {x:o.x+c*(xx.x-o.x)+r*(yy.x-o.x),y:o.y+c*(xx.y-o.y)+r*(yy.y-o.y)+up*h};}};
    cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,()=>reset(s));
    if(typeof gardenFxSettings!=='undefined'&&gardenFxSettings.subscribe)a.unsub=gardenFxSettings.subscribe(on=>{if(!on)clearEffects(a);});
    battles.set(s,a);return a;
  }
  function color(a,hex){
    let v=a.colors.get(hex);
    if(!v){const rgb=parseInt(hex,16);v=new a.cc.Color(rgb>>16,(rgb>>8)&255,rgb&255);a.colors.set(hex,v);}
    return v;
  }
  function sprite(a,key){
    let part=a.free.pop();
    if(!part){
      const node=new a.cc.Node('Impact');node.setParent(a.root);node.layer=a.root.layer;
      const image=node.addComponent(a.cc.Sprite);image.sizeMode=a.cc.Sprite.SizeMode.CUSTOM;part={node,image,layout:node.getComponent(a.cc.UITransform)};
    }
    part.node.active=false;part.image.spriteFrame=atlas(a.cc,key)[0];return part;
  }
  function recycle(a,event){
    if(event.part.node.isValid){event.part.node.active=false;a.free.push(event.part);}
  }
  function clearEffects(a){
    for(const e of a.cues)recycle(a,e);a.cues.length=0;a.pen.clear();
  }
  function cue(s,kind,target,contacts=[],flightId){
    if(!enabled()||!kinds[kind]||!Number.isFinite(target?.r)||!Number.isFinite(target?.c))return;
    const a=view(s);if(!a)return;
    const signature=[s.time,kind,target.r,target.c,flightId].join('/');
    if(a.last===signature)return;
    a.last=signature;
    const k=kinds[kind],at=a.at(target.r,target.c,.15);
    const ship=a.base.getChildByName('GardenAir/Wing')?.getChildByName('GardenAir/Flight/'+k.type);
    const origin=a.origins.get(flightId)||(ship?.isValid?{x:ship.position.x,y:ship.position.y}:a.at(target.r+.65,target.c-2.4,1.55));
    const links=[];
    for(const p of contacts||[]){
      if(links.length===4)break;
      if(Number.isFinite(p?.r)&&Number.isFinite(p?.c)&&(p.r!==target.r||p.c!==target.c)){
        const q=a.at(p.r,p.c,.21);if(!links.some(b=>b.x===q.x&&b.y===q.y))links.push(q);
      }
    }
    if(a.cues.length>=limit){
      const prior=a.cues.findIndex(e=>e.kind==='coax'||e.kind==='shatter');
      recycle(a,a.cues.splice(prior<0?0:prior,1)[0]);
    }
    const part=sprite(a,kind);
    part.node.setPosition(at.x,at.y,0);part.layout.setContentSize(a.w*k.span,a.h*k.span);
    a.cues.push({kind,k,at,origin,links,part,age:0});
  }
  function trace(a,x,y,u,v,hex,width){
    a.pen.moveTo(x,y);a.pen.lineTo(u,v);a.pen.strokeColor=color(a,hex);a.pen.lineWidth=width*a.w;a.pen.stroke();
  }
  function render(a,e){
    const {age,at,origin,k,kind}=e,w=a.w,h=a.h;
    const pre=age/k.delay;
    if(kind==='coax'){
      if(pre<1.6){
        const dx=at.x-origin.x,dy=at.y-origin.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len*w*.055,ny=dx/len*w*.055;
        for(const channel of [-1,1]){
          const t=clamp(pre*(channel===1?1.30:1.05)),tail=Math.max(0,t-.33);
          if(t===1&&pre>1.08)continue;
          const x=origin.x+nx*channel,y=origin.y+ny*channel;
          trace(a,x+dx*tail,y+dy*tail,x+dx*t,y+dy*t,channel===1?'61e9ed':'ffa649',channel===1?.038:.047);
          trace(a,x+dx*tail,y+dy*tail,x+dx*t,y+dy*t,channel===1?'e5ffff':'fff2b7',.012);
        }
      }
      if(pre>.85&&age<.27){
        let last=at;
        for(const p of e.links){
          const mid={x:(last.x+p.x)*.5,y:(last.y+p.y)*.5+.1*h};
          trace(a,last.x,last.y,mid.x,mid.y,'ffb75c',.021);trace(a,mid.x,mid.y,p.x,p.y,'ffeeaa',.014);last=p;
        }
      }
    }else if(kind!=='shatter'&&pre<=1){
      const t=clamp(pre);
      const dive=kind==='fort-bunker',air=kind==='fort-airburst';
      const from=dive?{x:at.x-.2*w,y:at.y+2.3*h}:origin;
      const x=from.x+(at.x-from.x)*t,y=from.y+(at.y-from.y)*t+Math.sin(t*Math.PI)*.25*h+(air?.62*h*t:0);
      const last=Math.max(0,t-.23),px=from.x+(at.x-from.x)*last,py=from.y+(at.y-from.y)*last+Math.sin(last*Math.PI)*.25*h+(air?.62*h*last:0);
      trace(a,px,py,x,y,dive?'e79a69':air?'9fd9f2':'93edc9',.055);
      trace(a,px+(x-px)*.55,py+(y-py)*.55,x,y,'fff9ce',.025);
      if(kind==='fort-guided'||kind==='f35-guided'){
        const g=a.pen,width=w*(.52-.24*t),height=h*(.3-.13*t);
        for(const sign of [-1,1])for(const side of [-1,1]){
          const rx=at.x+width*sign,ry=at.y+height*side;
          g.moveTo(rx-sign*w*.105,ry);g.lineTo(rx,ry);g.lineTo(rx,ry-side*h*.07);
        }
        g.lineWidth=w*.012;g.strokeColor=color(a,'b5fff0');g.stroke();
      }
    }
    if(pre<1)return;
    const t=clamp((age-k.delay)/(k.life-k.delay));e.part.node.active=true;
    const frame=Math.min(frames-1,Math.floor(t*frames));
    if(e.frame!==frame){e.part.image.spriteFrame=atlas(a.cc,kind)[frame];e.frame=frame;}
    if(kind.startsWith('fort-')&&t<.65){
      const ink=kind==='fort-bunker'?'f2af76':kind==='fort-airburst'?'a9edf1':'9feaca';
      for(let i=0;i<e.links.length;i++){
        const site=e.links[i],beat=clamp((t-i*.035)*2.55);
        if(beat<=0||beat>=1)continue;
        const width=w*(.09+.49*ease(beat)),height=h*(.06+.2*ease(beat));
        a.pen.ellipse(site.x,site.y,width,height);a.pen.strokeColor=color(a,ink);a.pen.lineWidth=(.025-.016*beat)*w;a.pen.stroke();
        for(let j=0;j<3;j++){
          const dx=Math.cos((j*2+i)*1.7),dy=Math.sin((j*2+i)*1.7);
          const x=site.x+dx*width*.88,y=site.y+dy*height*.65+Math.sin(beat*Math.PI)*.23*h;
          trace(a,x,y,x-dx*.048*w,y-.028*h,ink,.013);
        }
      }
    }
  }
  function tick(s,dt,flights){
    const a=battles.get(s);if(!a)return;
    if(!enabled()){if(a.cues.length)clearEffects(a);return;}
    const group=a.base.getChildByName('GardenAir/Wing');
    a.origins.clear();
    if(group?.isValid){
      const emitted={f22:0,f35:0,fortress:0};
      const ships={f22:[],f35:[],fortress:[]};
      for(const n of group.children){
        if(n.name.startsWith('GardenAir/Flight/')){
          const type=n.name.slice('GardenAir/Flight/'.length);if(ships[type])ships[type].push(n);
        }
      }
      let remaining=ships.f22.length+ships.f35.length+ships.fortress.length;
      for(const f of flights||[]){
        if(!remaining)break;
        if(!(f.type in emitted)||emitted[f.type]>=ships[f.type].length)continue;
        const craft=ships[f.type][emitted[f.type]++];remaining--;
        if(craft?.isValid&&f.enabled!==false){const p=craft.position;a.origins.set(f.id,{x:p.x,y:p.y});}
      }
    }
    a.pen.clear();
    for(let i=a.cues.length-1;i>=0;i--){
      const e=a.cues[i];e.age+=Math.max(0,dt||0);
      if(e.age>=e.k.life){recycle(a,e);a.cues.splice(i,1);}else render(a,e);
    }
  }
  function reset(s){
    const a=battles.get(s);if(!a)return;
    a.unsub?.();if(a.root.isValid)a.root.destroy();battles.delete(s);
  }
  return Object.freeze({cue,tick,reset});
})();
