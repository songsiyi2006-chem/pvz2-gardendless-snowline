const gardenModeMasteryAdvanced=(()=>{
  // Each pair is shown alongside its own level in the plant's specialization panel.
  const text={
    line:['逐敌穿签','沿本行从前向后依次点射，最多穿过三个不同目标。','回折弹道','穿签抵达末端后折入邻行，沿回程再击两敌。'],
    fan:['借翼','比较三个射向，在敌人最多的一行追加一次原招，并标记人数最少的有敌行。','合围转轴','主翼发射后，两侧火力向该列收拢，分别压制一个逼近交点的目标。'],
    flank:['钳口','在上下两翼各锁定一名先锋，封住它们朝向房屋的路线。','夹心截击','两翼锁定后，原招夹击本行位于两翼标记列之间的敌人。若本行空缺，改为截停一名侧翼先锋。'],
    cross:['旋转十字','以近敌为轴，先沿同列截击，再旋向对角线击中第二敌。','迁移交点','把交点移至命中的第二敌，在新交点的横、纵方向各施一次原招。'],
    shell:['追落引信','标记密集处的敌人，稍后按它所在的新格引爆。目标消失便在原格起爆。','错层余震','爆炸后，向落点上、下两行分别传出冲击，把邻行近敌向后推。'],
    net:['双列拦网','在最拥挤的一列与其靠屋侧一列布网，各捕捉一敌。','收紧网眼','延迟收网时先束缚网内新来的敌人，再牵制另一行的一敌。'],
    chain:['植株搭桥','电链从先锋接到两格内的一株友军，再从友军身边跳向另一敌。无友军时直接跳击。','双极放电','从跳跃终点向两边分流，点中不同列的至多两敌，同一敌人不重复受击。'],
    focus:['校射接替','标记三行中生命最高的目标，稍后再次校射。如果它已离场，立刻改瞄候补。','双准星','把另一列的强敌设为副目标加以减速。主目标离场或生命降至一半时，副目标再受一次原招。'],
    back:['后卫压阵','从最后方敌人向前寻找同排接应者，先标记后卫，再打击它的前一名同伴。','封住退路','截击前一名同伴后，从它所在列向邻行横切，分别压制两侧来敌。'],
    field:['游移阵地','阵地先打击原中心，随后朝当前最密集的敌群移动一格，再施一次原招。','交错守区','原中心与移动后的阵地再同时警戒一次，分别捕捉不同目标。'],
    trap:['双格绊线','在本株两侧相邻行的同列，各放置一枚持续四秒的独立绊线。触发者受到原招。','二段伏线','每条绊线触发后，向房屋方向再布一格伏线，两秒内进入的敌人会被短暂钉住。'],
    cull:['接棒猎手','在三行内选出生命比例最低的两敌，追击首位并标记候补，首位离场后改攻候补。','合围猎物','首个猎物在 2.4 秒内被击败，将触发一次伏击，波及它身边两敌。它若仍在场，1.65 秒后会被短暂定身。'],
    cover:['轮值护幕','先为前排最虚弱友株展开护幕，一秒后将原支援传给另一行的同伴。','受击移防','接力时检查首株。遭受新伤便回补治疗，否则将护幕转到第二株。'],
    relay:['三站接力','原支援从本株出发，经两株不同的邻近植物前传，每站优先选生命比例最低者。','回流净化','末站传回净化信号，沿来路清除中继株的干扰，再给出发株短时攻速。'],
    rescue:['观察病床','为伤势最重的友株建立观察。再次受伤则立即防护，否则转治另一名伤员。','后备病床','同时留出一个跨行床位，先净化第二株，再按复查时的伤势替两名伤员中较虚弱者加盾。'],
    escort:['护卫哨位','为友株设立哨位，并减速最靠近它的一敌。','反冲护卫','受护友株随后遭受新伤会从身边击退近敌。若未受伤，哨兵向前方施一次原招。'],
    harvest:['分畦灌溉','周围三格的不同种植行各贡献五点阳光，最多计三行，并护理一株友军。','新苗回访','稍后回访最初的种植区，新种下的植物优先获得护盾。没有新苗则为最虚弱的原有植株加快攻速。'],
    yield:['双点催熟','选择同排与相邻行各一株植苗，在两处错时催熟，各产五点阳光并治疗。','轮照余晖','第二处成熟后，重新检查两个地格，分别为当前的植株加速与净化，补种同样有效。'],
    bounty:['双份通缉','给两名最虚弱的敌人各挂一张三秒通缉令，期间每次实际击败悬赏目标再收五点阳光。','续签悬赏','首个兑现的通缉令转签给附近另一敌，短暂定身。三秒内击败续签目标再收十点阳光。'],
    explosion:['环状爆芯','从本行首个命中点向上下左右一格传递小型爆破，每个方向最多命中一名。','隔格殉爆','选择受波及邻敌中生命最高的一名作为第二爆芯，延迟从它的位置向外再震击两敌。'],
    triple:['错列三棱','三行副束依次发射，尽量让每束落在不同列。','合列折返','把三束的落点列记下，向其他射线行中占据这些列的至多两敌折射。'],
    rapid:['交替脉冲','连续三次快速点射，在本行先锋与后卫间切换，优先照到不同目标。','锁束终章','若三次只锁到同一敌，追加定身。若发生切换，从末次目标反向穿击另一名受照敌人。']
  };
  const key=op=>op.route==='laser'?op.effect:op.route;
  function describe(op,level){
    const pair=text[key(op)],at=2*(level-3);
    return pair&&(at===0||at===2)?{name:pair[at],description:pair[at+1]}:null;
  }
  function cast(op,e,level){
    const route=key(op);if(!text[route]||level<3||level>4)return;
    const fourth=level===4,loc=e.loc,at=z=>({r:e.row(z),c:e.col(z)});
    const distance=(p,q)=>Math.max(Math.abs(p.r-q.r),Math.abs(p.c-q.c));
    const near=(z,p,n)=>distance(at(z),p)<=n;
    const foes=()=>e.foes().filter(e.live),friends=()=>e.allies().filter(e.live);
    const first=(a,b)=>e.col(a)-e.col(b)||e.row(a)-e.row(b),last=(a,b)=>first(b,a);
    const weak=(a,b)=>e.ratio(a)-e.ratio(b)||first(a,b),strong=(a,b)=>b.health-a.health||first(a,b);
    const inBand=()=>foes().filter(z=>Math.abs(e.row(z)-loc.r)<=1);
    const lane=(r)=>foes().filter(z=>e.row(z)===r&&e.col(z)>=loc.c);
    const neighbor=(p,n=1)=>foes().filter(z=>near(z,p,n));
    const crew=(p=loc,n=3)=>friends().filter(z=>near(z,p,n));
    const front=group=>group.sort(first)[0],rear=group=>group.sort(last)[0];
    const lowest=group=>group.sort(weak)[0],highest=group=>group.sort(strong)[0];
    const dense=group=>group.sort((a,b)=>e.density(b)-e.density(a)||first(a,b))[0];
    const remember=z=>z&&{z,gen:e.generation(z),p:at(z)};
    const same=m=>m&&e.live(m.z)&&e.generation(m.z)===m.gen?m.z:null;
    const tracked=(m,z)=>m&&m.z===z&&m.gen===e.generation(z);
    const apply=(z,action=op.effect,power=.34,p=loc)=>{
      if(z&&e.live(z)&&(op.route!=='laser'||foes().includes(z)))e.effect(action,z,power,e.tile(p)||loc);
    };
    const owner=remember(e.body);
    const later=(time,fn)=>e.after(time,()=>{if(!owner||e.generation(owner.z)===owner.gen)fn();});
    const seen=(list,z)=>list.some(v=>tracked(v,z));
    switch(route){
    case 'line':{
      const struck=[];let lastPos=loc;
      for(let i=0;i<3;i++)later(i*.22,()=>{
        const z=front(lane(loc.r).filter(z=>e.col(z)>=lastPos.c&&!seen(struck,z)));if(!z)return;
        apply(z,op.effect,.26,lastPos);struck.push(remember(z));lastPos=at(z);
      });
      if(fourth)later(.85,()=>foes().filter(z=>Math.abs(e.row(z)-lastPos.r)===1&&e.col(z)<=lastPos.c&&near(z,lastPos,3))
        .sort(last).slice(0,2).forEach(z=>apply(z,op.effect,.29,lastPos)));
      break;}
    case 'fan':{
      const groups=[-1,0,1].map(n=>lane(loc.r+n).sort(first)).filter(g=>g.length).sort((a,b)=>b.length-a.length);
      if(!groups.length)break;const p=at(groups[0][0]);apply(groups[0][0]);apply(groups.at(-1)[0],'mark',.29);
      if(fourth)later(.58,()=>{for(const r of [p.r-1,p.r+1]){
        const z=front(foes().filter(z=>e.row(z)===r&&Math.abs(e.col(z)-p.c)<=2));apply(z,'stagger',.36,p);}});
      break;}
    case 'flank':{
      const zs=[front(lane(loc.r-1)),front(lane(loc.r+1))].filter(Boolean);if(!zs.length)break;
      const cols=zs.map(e.col);zs.forEach(z=>apply(z,'slow',.34));
      if(fourth)later(.65,()=>{const z=front(lane(loc.r).filter(z=>e.col(z)>=Math.min(...cols)&&e.col(z)<=Math.max(...cols)));
        if(z)apply(z);else apply(front(inBand().filter(z=>e.row(z)!==loc.r)),'stagger',.37);});break;}
    case 'cross':{
      const pivot=front(inBand());if(!pivot)break;const p=at(pivot);
      apply(front(neighbor(p,2).filter(z=>z!==pivot&&e.col(z)===p.c))||pivot,op.effect,.30,p);
      later(.42,()=>{const d=front(neighbor(p).filter(z=>e.row(z)!==p.r&&e.col(z)!==p.c));if(!d)return;
        const q=at(d),m=remember(d);apply(d,op.effect,.32,p);
        if(fourth)later(.4,()=>{const g=neighbor(q,2).filter(z=>!tracked(m,z));
          apply(front(g.filter(z=>e.row(z)===q.r)),op.effect,.28,q);apply(front(g.filter(z=>e.col(z)===q.c&&e.row(z)!==q.r)),op.effect,.28,q);});});break;}
    case 'shell':{
      const t=remember(dense(inBand()));if(!t)break;
      apply(t.z,'mark',.26);
      later(.65,()=>{const z=same(t),p=z?at(z):t.p;apply(z||front(neighbor(p)),op.effect,.36,p);
        if(fourth)later(.38,()=>{for(const r of [p.r-1,p.r+1])apply(front(neighbor(p,2).filter(v=>e.row(v)===r)),'shove',.34,p);});});break;}
    case 'net':{
      const counts=new Map();for(const z of inBand())counts.set(e.col(z),1+(counts.get(e.col(z))||0));
      const c=[...counts].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0]?.[0];if(c==null)break;
      const inside=()=>foes().filter(z=>e.col(z)===c||e.col(z)===c-1),arrived=inside().map(remember);
      for(const col of [c,c-1])apply(front(inside().filter(z=>e.col(z)===col)),'slow',.31,{r:loc.r,c:col});
      if(fourth)later(1.15,()=>{const g=inside().sort((a,b)=>Number(seen(arrived,a))-Number(seen(arrived,b))||first(a,b)),z=g[0];
        if(z){apply(z,'stagger',.45);apply(g.find(t=>e.row(t)!==e.row(z)),op.effect,.31);}});break;}
    case 'chain':{
      const z=front(inBand());if(!z)break;const start=at(z),bridge=lowest(crew(start,2)),p=bridge?at(bridge):start,visited=[remember(z)];
      const hop=front(neighbor(p,2).filter(b=>!seen(visited,b)));if(!hop)break;
      const end=at(hop);visited.push(remember(hop));apply(hop,op.effect,.34,p);
      if(fourth)later(.4,()=>{const g=neighbor(end,3).filter(v=>!seen(visited,v));for(const dir of [-1,1])
        apply(highest(g.filter(v=>(e.col(v)-end.c)*dir>0)),op.effect,.28,end);});break;}
    case 'focus':{
      const main=remember(highest(inBand()));if(!main)break;
      const other=remember(highest(inBand().filter(z=>e.col(z)!==main.p.c)));apply(main.z,'mark',.31);
      if(fourth)apply(same(other),'slow',.34);
      later(.8,()=>{const z=same(main);apply(z||same(other)||highest(inBand()),op.effect,.38);
        if(fourth&&(!z||e.ratio(z)<=.5))apply(same(other)||highest(inBand().filter(t=>t!==z)),op.effect,.31,main.p);});break;}
    case 'back':{
      const z=rear(inBand());if(!z)break;const p=at(z);apply(z,'mark',.27);
      later(.55,()=>{const next=rear(foes().filter(t=>e.row(t)===p.r&&e.col(t)<p.c));if(!next)return;
        const q=at(next);apply(next,op.effect,.35,p);
        if(fourth)for(const row of [q.r-1,q.r+1])apply(front(neighbor(q,1).filter(t=>e.row(t)===row)),'slow',.36,q);});break;}
    case 'field':{
      const start=dense(inBand());if(!start)break;const p=at(start);apply(start,op.effect,.27,p);
      later(.95,()=>{const next=dense(inBand());if(!next)return;const q={r:p.r+Math.sign(e.row(next)-p.r),c:p.c+Math.sign(e.col(next)-p.c)};
        apply(front(neighbor(q)),op.effect,.31,q);
        if(fourth)later(.85,()=>{const z=front(neighbor(p));apply(z,'slow',.31,p);apply(front(neighbor(q).filter(t=>t!==z)),op.effect,.32,q);});});break;}
    case 'trap':{
      const seek=(p,end,stage)=>{if(!e.tile(p))return;const z=front(foes().filter(v=>e.row(v)===p.r&&e.col(v)===p.c));
        if(z){apply(z,stage?'stagger':op.effect,stage?.42:.30,p);
          if(fourth&&!stage)later(.24,()=>seek({r:p.r,c:p.c-1},e.time()+2,1));}
        else if(e.time()<end)later(.4,()=>seek(p,end,stage));};
      for(const r of [loc.r-1,loc.r+1])seek({r,c:loc.c},e.time()+4,0);break;}
    case 'cull':{
      const g=inBand().sort(weak),leader=remember(g[0]),reserve=remember(g[1]);if(!leader)break;
      const ambush=()=>neighbor(leader.p,2).filter(z=>!tracked(leader,z)).sort(weak).slice(0,2).forEach(z=>apply(z,op.effect,.28,leader.p));
      if(fourth)e.onKilled?.(leader.z,ambush,2.4);
      apply(leader.z,op.effect,.3);apply(same(reserve),'mark',.25);
      later(.8,()=>apply(same(leader)||same(reserve)||lowest(inBand()),op.effect,.29));
      if(fourth)later(1.65,()=>apply(same(leader),'stagger',.39));break;}
    case 'cover':{
      const team=crew(),wounded=lowest(team.filter(z=>e.col(z)>=loc.c))||lowest(team),lead=remember(wounded);if(!lead)break;
      const hp=wounded.health;apply(wounded,'ward',.34);
      later(1,()=>{const second=lowest(crew().filter(z=>e.row(z)!==lead.p.r));apply(second,op.effect,.34,lead.p);
        if(fourth){const first=same(lead);if(first&&first.health<hp)apply(first,'mend',.41);else apply(second||first,'guard',.34);}});break;}
    case 'relay':{
      const source=remember(e.body),history=source?[source]:[];let p=loc;
      for(let i=0;i<2;i++)later(.36*(i+1),()=>{const next=lowest(crew(p,2).filter(z=>!seen(history,z)));if(!next)return;
        history.push(remember(next));apply(next,op.effect,.32,p);p=at(next);});
      if(fourth)later(1.12,()=>{apply(same(history[source?1:0]),'cleanse',.34,p);apply(same(source),'haste',.36,p);});break;}
    case 'rescue':{
      const team=crew().sort(weak),a=remember(team[0]);if(!a)break;const hp=a.z.health;
      const b=remember(team.find(z=>e.row(z)!==a.p.r));apply(a.z,'mend',.32);
      if(fourth)apply(same(b),'cleanse',.33);
      later(.9,()=>{const z=same(a);if(z&&z.health<hp)apply(z,'guard',.36);else apply(lowest(crew().filter(v=>!tracked(a,v)))||z,'mend',.32);
        if(fourth)apply(lowest([same(a),same(b)].filter(Boolean)),'ward',.37);});break;}
    case 'escort':{
      const a=remember(lowest(crew()));if(!a)break;const hp=a.z.health;apply(a.z,'ward',.31);
      const closest=p=>neighbor(p,3).sort((a,b)=>distance(at(a),p)-distance(at(b),p)||first(a,b))[0];
      apply(closest(a.p),'slow',.32,a.p);
      if(fourth)later(.9,()=>{const ally=same(a),p=ally?at(ally):a.p;
        if(ally&&ally.health<hp)apply(closest(p),'shove',.47,p);
        else apply(front(foes().filter(z=>e.row(z)===p.r&&e.col(z)>=p.c)),op.effect,.38,p);});break;}
    case 'harvest':{
      const beds=crew(),rows=new Set(beds.map(e.row)),before=beds.map(remember);if(rows.size)e.sun(5*Math.min(3,rows.size));
      apply(lowest(beds),'mend',.30);
      if(fourth)later(1.4,()=>{const now=crew(),plant=lowest(now.filter(z=>!seen(before,z)));
        if(plant)apply(plant,'guard',.40);else apply(lowest(now),'haste',.36);});break;}
    case 'yield':{
      const g=crew(),a=lowest(g.filter(z=>e.row(z)===loc.r)),b=lowest(g.filter(z=>e.row(z)!==loc.r));
      const p=a?at(a):null,q=b?at(b):null,occupant=cell=>cell&&lowest(crew(cell,0));
      for(const [pos,t] of [[p,.2],[q,.8]])if(pos)later(t,()=>{const z=occupant(pos);if(z){e.sun(5);apply(z,'mend',.26,pos);}});
      if(fourth)later(1.32,()=>{apply(occupant(p),'haste',.35);apply(occupant(q),'cleanse',.35);});break;}
    case 'bounty':{
      const pair=inBand().sort(weak).slice(0,2).map(remember);let signed=false;
      for(const m of pair){
        e.onKilled?.(m.z,()=>{e.sun(5);if(!fourth||signed)return;signed=true;
          const next=lowest(neighbor(m.p,3).filter(z=>!seen(pair,z)));if(!next)return;
          e.onKilled?.(next,()=>e.sun(10),3);apply(next,'stagger',.41,m.p);},3);
        apply(m.z,'mark',.26);
      }break;}
    case 'explosion':{
      const z=front(lane(loc.r));if(!z)break;const p=at(z),touched=[];
      for(const [r,c] of [[0,1],[0,-1],[-1,0],[1,0]]){
        const b=highest(foes().filter(t=>e.row(t)===p.r+r&&e.col(t)===p.c+c));if(b){touched.push(remember(b));apply(b,'blast',.24,p);}}
      if(fourth&&touched.length){const m=touched.sort((a,b)=>b.z.health-a.z.health)[0];
        later(.72,()=>{const t=same(m),q=t?at(t):m.p;neighbor(q,2).filter(b=>!tracked(m,b)).sort(first).slice(0,2).forEach(b=>apply(b,'blast',.29,q));});}break;}
    case 'triple':{
      const used=new Set(),spots=[];for(const [i,r] of [loc.r,loc.r-1,loc.r+1].entries())later(.18*i,()=>{
        const b=lane(r).sort((v,w)=>Number(used.has(e.col(v)))-Number(used.has(e.col(w)))||first(v,w))[0];
        if(b){used.add(e.col(b));spots.push(remember(b));apply(b,'beam',.28);}});
      if(fourth)later(.83,()=>inBand().filter(z=>!seen(spots,z)&&spots.some(m=>m.p.c===e.col(z)&&m.p.r!==e.row(z))).sort(first).slice(0,2).forEach(z=>apply(z,'beam',.33)));break;}
    case 'rapid':{
      const shots=[];for(let i=0;i<3;i++)later(i*.19,()=>{
        const candidates=lane(loc.r).sort(i===1?last:first);const z=candidates.find(v=>!tracked(shots.at(-1),v))||candidates[0];
        if(z){shots.push(remember(z));apply(z,'pierce',.23);}});
      if(fourth)later(.8,()=>{const end=shots.at(-1);if(!end)return;const alternate=shots.find(m=>!tracked(end,m.z)&&same(m));
        if(alternate)apply(same(alternate),'pierce',.39,end.p);else apply(same(end),'stagger',.43,end.p);});break;}
    }
  }
  return Object.freeze({describe,cast});
})();
