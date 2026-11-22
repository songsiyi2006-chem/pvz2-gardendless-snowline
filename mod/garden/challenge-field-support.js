// An expedition Yeti can deploy the welding unit in its pack once per life.
const gardenFieldSupport=(()=>{
  const battles=new WeakMap();
  const windup=1.8, afterglow=.65, reach=3.5;
  const mod=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  const row=z=>z.lIndex;
  const alive=z=>!!z?.node?.activeInHierarchy && !z.hypnotized && z.health>0 && z.isAlive() && z.isInLawn();
  const mobile=z=>!z.Retreating && !z.knockBackTween && !z.changeLaneTween && !z.off_ground;
  const scanPool=()=>mod('CharacterManager').ZombiePool.pool();

  function setup(level){
    const square=mod('Square').Square,cc=window.System.get(window.System.resolve('cc'));
    const s={cc,square,clock:0,scan:0,used:new WeakSet(),charging:new Map(),bursts:[],art:null};
    const unsubscribe=gardenFxSettings.subscribe(on=>{if(!on)clearArt(s);});
    cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,unsubscribe);
    battles.set(level,s);return s;
  }
  function clearArt(s){
    if(s.art?.root.isValid){s.art.root.active=false;s.art.root.destroy();}
    s.art=null;s.bursts.length=0;
  }
  function targets(z,s,pool){
    const picked=[];
    for(const other of pool){
      if(other===z||row(other)!==row(z)||!alive(other))continue;
      const armor=gardenChallengeArmor.state(other),v=armor?.vest;
      if(!v||v.hp<=0||v.hp>=v.max)continue;
      const distance=Math.abs(z.worldPositionX-other.worldPositionX);
      if(distance<=reach*s.square.SquareWidth)picked.push({z:other,armor,ratio:v.hp/v.max,distance});
    }
    return picked.sort((a,b)=>a.ratio-b.ratio||a.distance-b.distance).slice(0,2);
  }
  function findRepairs(s){
    const pool=scanPool();
    for(const z of pool){
      if(!z._gardenEventYeti||!alive(z)||!mobile(z))continue;
      const armor=gardenChallengeArmor.state(z);
      if(!armor||s.used.has(armor))continue;
      const selected=targets(z,s,pool);
      if(!selected.length)continue;
      s.used.add(armor);
      s.charging.set(z,{z,armor,targets:selected,start:s.clock,row:row(z),x:z.worldPositionX});
    }
  }
  function advance(s){
    for(const [z,job] of s.charging){
      const valid=z._gardenEventYeti && alive(z) && mobile(z) && row(z)===job.row && gardenChallengeArmor.state(z)===job.armor;
      if(!valid||z.worldPositionX-job.x>s.square.SquareWidth*.10){s.charging.delete(z);continue;}
      job.x=z.worldPositionX;
      if(s.clock-job.start+1e-7<windup)continue;
      s.charging.delete(z);
      for(const t of job.targets){
        const other=t.z;
        if(!alive(other)||row(other)!==job.row||gardenChallengeArmor.state(other)!==t.armor||
          Math.abs(z.worldPositionX-other.worldPositionX)>reach*s.square.SquareWidth)continue;
        const amount=gardenChallengeArmor.repairVest(other,t.armor.vest.max*.20);
        if(amount>0&&gardenFxSettings.enabled)s.bursts.push({from:z.node.worldPosition.clone(),to:other.node.worldPosition.clone(),start:s.clock});
      }
    }
  }
  function art(s){
    if(s.art?.root.isValid)return s.art;
    const sq=s.square,base=sq.getLnC(0,0)?.plantPoint,next=sq.getLnC(0,1)?.plantPoint;
    const parent=sq.getLnC(sq.MaxLaneIndex,0)?.inLane?.prjLayer;
    if(!parent?.isValid||!base?.isValid||!next?.isValid)return null;
    const cc=s.cc,root=new cc.Node('GardenFieldSupport/Arc');
    root.setParent(parent);root.layer=parent.layer;
    const convert=p=>root.inverseTransformPoint(new cc.Vec3(),p);
    const unit=Math.abs(convert(next.worldPosition).x-convert(base.worldPosition).x);
    if(!(unit>0)){root.destroy();return null;}
    return s.art={root,g:root.addComponent(cc.Graphics),unit,convert};
  }
  const tau=Math.PI*2;
  function render(s){
    s.bursts=s.bursts.filter(b=>s.clock-b.start<afterglow);
    if(!gardenFxSettings.enabled||!s.charging.size&&!s.bursts.length){
      if(s.art)clearArt(s);return;
    }
    const a=art(s);if(!a)return;
    const {g,unit:u}=a, color=(r,green,b,alpha)=>new s.cc.Color(r,green,b,Math.round(255*Math.max(0,Math.min(1,alpha))));
    const cyan=k=>color(83,231,219,k),white=k=>color(255,242,188,k),navy=k=>color(20,63,77,k);
    const stroke=(ink,width)=>{g.strokeColor=ink;g.lineWidth=width*u;g.stroke();};
    const dot=(x,y,r,ink)=>{g.fillColor=ink;g.circle(x,y,r*u);g.fill();};
    g.clear();
    for(const job of s.charging.values()){
      const p=a.convert(job.z.node.worldPosition),x=p.x,y=p.y+u*.81,t=(s.clock-job.start)/windup;
      dot(x,y,.19,navy(.89));
      g.arc(x,y,.187*u,-Math.PI/2,-Math.PI/2+tau*Math.min(.999,t+.015),true);stroke(cyan(.97),.026);
      for(let i=0;i<4;i++){const angle=tau*i/4;g.moveTo(x+.21*u*Math.cos(angle),y+.21*u*Math.sin(angle));g.lineTo(x+.24*u*Math.cos(angle),y+.24*u*Math.sin(angle));}
      stroke(white(.8),.016);
      g.moveTo(x-.088*u,y);g.lineTo(x+.088*u,y);g.moveTo(x,y-.088*u);g.lineTo(x,y+.088*u);stroke(white(1),.038);
    }
    for(const b of s.bursts){
      const t=(s.clock-b.start)/afterglow,alpha=1-t*t,p=a.convert(b.from),q=a.convert(b.to);
      p.y+=u*.81;q.y+=u*.72;
      const dx=q.x-p.x,dy=q.y-p.y,h=u*(.13+Math.min(Math.abs(dx)/u,2)*.055);
      const x=f=>p.x+dx*f,y=f=>p.y+dy*f+h*4*f*(1-f);
      for(const [width,ink] of [[.105,navy(alpha*.65)],[.050,cyan(alpha*.95)],[.018,white(alpha)]]){
        g.moveTo(p.x,p.y);g.quadraticCurveTo((p.x+q.x)/2,(p.y+q.y)/2+h*2,q.x,q.y);stroke(ink,width);
      }
      for(let i=0;i<3;i++){const f=(t*1.5+i/3)%1;dot(x(f),y(f),.038,white(alpha));}
      g.circle(q.x,q.y,u*(.09+t*.22));stroke(cyan(alpha),.021);
    }
  }
  function tick(level,dt){
    if(!level||!(dt>0)||!level.gaming||!gardenChallenge.active(level))return;
    const s=battles.get(level)||setup(level);
    s.clock+=dt;
    advance(s);
    if(s.clock>=s.scan){s.scan=s.clock+.20;findRepairs(s);}
    render(s);
  }
  return {tick};
})();
