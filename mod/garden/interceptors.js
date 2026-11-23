const gardenInterceptors=(()=>{
  const battles=new WeakMap();
  const profiles={
    intercept_firefly:{reload:[8,7.2,6.3,5.5,4.8],power:[2,2,3,3,4]},
    intercept_dome:{reload:[18,16.5,15,13.5,12],power:[.85,1.05,1.25,1.55,1.9]},
    intercept_mirror:{reload:[11,9.8,8.5,7.4,6.5],power:[2,3,3,4,8]}
  };
  function spec(id,rank){
    const data=profiles[id];if(!data)return null;
    const level=Math.max(1,Math.min(5,Math.floor(rank)||1)),interval=data.reload[level-1],strength=data.power[level-1];
    const text=id==='intercept_firefly'?['每 '+interval+' 秒补 1 枚','储备 '+strength+' 枚',
      '开战时满仓。在炮弹飞到四成航程时放出一只萤火，每枚击落一发。逐枚补充，适合应对分散的来袭。']:
      id==='intercept_dome'?['每 '+interval+' 秒充能','脉冲持续 '+strength+' 秒',
      '首枚炮弹进入末段时启动穹顶。脉冲期间击落所有进入末段的迫击炮弹和重装巨人火箭，适合抵挡齐射。']:
      ['每 '+interval+' 秒重新校准','搜索半径 '+strength+' 格',
       '在四分之一航程投出假落点。扫描落点周围的草坪，综合中心和上下左右的植物选择损失较小的格子。炮弹仍会爆炸；找不到更安全的位置会保留本次充能。'];
    return {id,level,interval,strength,frequency:text[0],power:text[1],mechanic:text[2]};
  }
  function attach(s,paint){
    const id=[...s.gear].find(id=>profiles[id]);
    if(!id)return;
    const item=s.specs[id];
    battles.set(s.level,{s,paint,id,item,mode:gardenArmory.interceptMode(),charges:item.strength,
      reloadAt:Infinity,readyAt:0,openUntil:-1,tracked:new WeakSet(),settled:new WeakSet(),stopped:0,diverted:0});
  }
  function refresh(b,now){
    if(b.id!=='intercept_firefly'||b.reloadAt>now)return;
    const rounds=1+Math.floor((now-b.reloadAt)/b.item.interval);
    b.charges=Math.min(b.item.strength,b.charges+rounds);
    b.reloadAt=b.charges===b.item.strength?Infinity:b.reloadAt+rounds*b.item.interval;
  }
  function status(level){
    const b=battles.get(level);if(!b)return null;
    const now=b.s.time;refresh(b,now);
    const batch=b.id==='intercept_firefly',next=batch?b.reloadAt:b.readyAt;
    return {id:b.id,mode:b.mode,charges:batch?b.charges:null,remaining:Number.isFinite(next)?Math.max(0,next-now):0,
      open:b.openUntil>now,stopped:b.stopped,diverted:b.diverted};
  }
  function track(level,shell){battles.get(level)?.tracked.add(shell);}
  function saferCell(s,origin,reach){
    const square=s.square,weights=new Map();
    for(const p of s.manager.plantPool||[]){
      const cell=p.plantInLnC;
      if(!cell||!p.node?.activeInHierarchy||p.dead||p.health<=0||p.invincible)continue;
      const key=cell.lIndex*64+cell.cIndex;weights.set(key,(weights.get(key)||0)+1);
    }
    const risk=(r,c)=>{
      const key=r*64+c;
      return 105*(weights.get(key)||0)+40*((weights.get(key-64)||0)+(weights.get(key+64)||0)+(weights.get(key-1)||0)+(weights.get(key+1)||0));
    };
    let best=null,lowest=risk(origin.r,origin.c),distance=Infinity;
    if(!lowest)return null;
    for(let r=0;r<=square.MaxLaneIndex;r++)for(let c=0;c<=square.MaxColumnIndex;c++){
      const d=Math.abs(r-origin.r)+Math.abs(c-origin.c);
      if(!d||d>reach||!square.getLnC(r,c)?.isInLawn())continue;
      const score=risk(r,c);
      if(score<lowest||(best&&score===lowest&&d<distance)){best={r,c};lowest=score;distance=d;}
    }
    return best;
  }
  function step(level,shell,progress){
    if(typeof gardenModeMastery!=='undefined'&&gardenModeMastery.intercept(level,shell,progress))return true;
    const b=battles.get(level);
    if(!b||!b.tracked.has(shell)||b.settled.has(shell)||(b.mode==='output'&&!shell.priority))return false;
    const now=b.s.time,q=b.item;
    if(b.id==='intercept_firefly'){
      if(progress<.4)return false;
      refresh(b,now);if(!b.charges)return false;
      b.charges--;
      if(!Number.isFinite(b.reloadAt))b.reloadAt=now+q.interval;
    }else if(b.id==='intercept_dome'){
      if(progress<.72)return false;
      if(now>=b.openUntil){
        if(now<b.readyAt)return false;
        b.openUntil=now+q.strength;b.readyAt=now+q.interval;
      }
    }else{
      if(progress<.25||progress>.60||now<b.readyAt)return false;
      b.settled.add(shell);
      const next=saferCell(b.s,shell.target,q.strength);
      if(next){const old=shell.target;shell.target=next;b.diverted++;b.readyAt=now+q.interval;b.paint(b.s,b.id,old,next);}
      return false;
    }
    b.settled.add(shell);b.stopped++;
    const at=shell.position||shell.target;
    b.paint(b.s,b.id,shell.target,{r:at.r-(at.height||0),c:at.c});
    return true;
  }
  return Object.freeze({spec,attach,track,step,status});
})();
