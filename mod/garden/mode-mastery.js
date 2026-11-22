// Six-star specializations use the original mode's effect and the simulation clock.
const gardenModeMastery=(()=>{
  const price=Object.freeze([{points:26,gem:20,coin:3000},{points:48,gem:45,coin:8000},
    {points:76,gem:75,coin:16000},{points:110,gem:120,coin:30000}].map(Object.freeze));
  const tactics={
    line:['穿线测距','标记同排最远的前方敌人。','末端折射','从该敌向相邻行一格内的两敌传递原招。'],
    fan:['护翼齐射','两侧行各补击一名位于第二顺位的敌人。','合扇','从两翼之间标记本行最后方敌人。'],
    flank:['逆翼','对临近房屋的侧行先锋施加减速。','回剪','0.8 秒后从另一侧行背后再打一次原招。'],
    cross:['对角分叉','十字交点新增两条斜支，打击对角一格两敌。','交点钉扎','定住交点上最靠近房屋的一敌。'],
    shell:['破片外环','从爆心向原爆区外两格以内的两敌投射原招。','延时雷帽','0.7 秒后在原落点施放一次定身，打中届时最靠屋的一敌。'],
    net:['侧网','在最密列相邻的一列补捉一名先锋。','收网','0.8 秒后定住原锁定列中最靠屋的两敌。'],
    chain:['隔列导体','创建一次额外跳跃，优先把原招引到邻行。','反向导通','从该落点再跳向三格内生命最多的另一敌，施加减速。'],
    focus:['破壳测距','集火前标记三行中生命最高者。','副准星','0.8 秒后另用原招打击与主目标相邻、生命最低的一敌。'],
    back:['后排绊索','减速三行内走在最后的敌人。','返程切线','0.75 秒后原招从后向前经过同排，击中另一敌。'],
    field:['警戒边界','在阵地外沿两格内标记最靠屋的敌人。','撤场震荡','阵地结束后在原中心一格内定住至多两名敌人。'],
    trap:['前哨','在脚下三格内侦测 6 秒，首个接近的敌人被减速。','双点引信','触发后 1 秒在触发格以原招补击另一名邻敌。'],
    cull:['追猎标记','标记三行内生命比例最低者。','转移猎物','0.6 秒后转攻另一名生命比例最低者，保留原招效果。'],
    cover:['掩护前伸','优先向三格内前线最远的一株友军传递原支援。','应急搭档','为其周围一格最虚弱的另一株友军提供短时防护。'],
    relay:['旁路分流','从同排最后方友株横向转送原支援给相邻行的一株友军。','接力净化','0.8 秒后再净化接力点周围一格干扰最重的友株。'],
    rescue:['急救净化','净化三格内受干扰最重的友株并治疗。','分诊','1 秒后优先将原支援传给另一株受伤友军。'],
    escort:['贴身警卫','为最需要援助的友株加短盾。','近身反击','以该株为中心反击两格内最靠屋的一敌，沿用原招。'],
    harvest:['育苗回馈','收成时恢复附近最虚弱友株的生命。','轮作','1 秒后为相邻的另一友株提供短时攻速加成。'],
    yield:['暖光护苗','结果时给同排最虚弱的友株加短盾。','遮阴照料','2 秒后净化相邻行干扰最重的一株植物并治疗。'],
    bounty:['追缴标记','标记三行内当前最虚弱的悬赏目标。','缉捕订金','0.8 秒后定住另一名弱敌，并掉落 10 点阳光。'],
    explosion:['破片回声','升阶主招向本行前方最近敌人引爆一次小型爆破。','压力环','0.65 秒后对爆心两格内的外环一敌施加减速。'],
    triple:['侧束定位','升阶主招标记上下两条邻行各一名先锋。','交叉脉冲','向本行与两翼目标在同一列的最多两敌折射副束。'],
    rapid:['脉冲刹车','升阶主招减速本行先锋。','冷却分流','0.45 秒后对先锋后一格的另一敌射出穿甲副束。']
  };
  for(const v of Object.values(tactics))Object.freeze(v);Object.freeze(tactics);
  const key=op=>op.route==='laser'?op.effect:op.route;
  const describe=(op,level)=>{if(level===3||level===4)return gardenModeMasteryAdvanced.describe(op,level);
    const t=tactics[key(op)];const i=(level-1)*2;return t&&level>=1&&level<=2?{name:t[i],description:t[i+1]}:null;};
  const setting='PvZ2_Greenhouse_MasteryFX_v1';let fx=true;
  try{fx=localStorage.getItem(setting)!=='0';}catch{}
  function setFX(value){fx=!!value;try{localStorage.setItem(setting,fx?'1':'0');}catch{}}
  function basic(op,e,level){
    if(!op||!(level===1||level===2))return;
    const two=level===2,loc=e.loc,route=key(op),enemies=()=>e.foes().filter(e.live),friends=()=>e.allies().filter(e.live);
    const pt=b=>({r:e.row(b),c:e.col(b)}),d=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.c-b.c));
    const local=(b,p,n)=>d(pt(b),p)<=n;
    const first=(a,b)=>e.col(a)-e.col(b)||e.row(a)-e.row(b),last=(a,b)=>first(b,a);
    const weak=(a,b)=>e.ratio(a)-e.ratio(b)||first(a,b),strong=(a,b)=>b.health-a.health||first(a,b);
    const noise=b=>(b.stunned||0)+(b.boomboxCD||0);
    const interfered=(a,b)=>noise(b)-noise(a)||weak(a,b);
    const row=(r)=>enemies().filter(z=>e.row(z)===r&&e.col(z)>=loc.c);
    const front=()=>enemies().filter(z=>Math.abs(e.row(z)-loc.r)<=1);
    const localFriends=()=>friends().filter(z=>local(z,loc,3));
    const center=()=>front().sort((a,b)=>e.density(b)-e.density(a)||first(a,b))[0];
    const use=(z,action=op.effect,weight=.42,from=loc)=>{if(z&&e.live(z))e.effect(action,z,weight,e.tile(from)||loc);};
    const guard=z=>use(z,'ward',.44);
    const later=(delay,fn)=>e.after(delay,fn);
    switch(route){
    case 'line':{const z=row(loc.r).sort(last)[0];if(!z)return;use(z,'mark');
      if(two)enemies().filter(v=>Math.abs(e.row(v)-e.row(z))===1&&local(v,pt(z),1)).sort(first).slice(0,2).forEach(v=>use(v,op.effect,.43,pt(z)));break;}
    case 'fan':for(const r of [loc.r-1,loc.r+1])use(row(r).sort(first)[1]);if(two)use(row(loc.r).sort(last)[0],'mark');break;
    case 'flank':{const v=front().filter(z=>e.row(z)!==loc.r).sort(first)[0];if(!v)return;const opposite=2*loc.r-e.row(v);use(v,'slow');
      if(two)later(.8,()=>use(enemies().filter(z=>e.row(z)===opposite).sort(last)[0]));break;}
    case 'cross':{const z=front().sort((a,b)=>d(pt(a),loc)-d(pt(b),loc)||first(a,b))[0];if(!z)return;const p=pt(z);
      enemies().filter(v=>Math.abs(e.row(v)-p.r)===1&&Math.abs(e.col(v)-p.c)===1).sort(first).slice(0,2).forEach(v=>use(v,op.effect,.42,p));if(two)use(z,'stagger');break;}
    case 'shell':case 'field':{const z=center();if(!z)return;const p=pt(z);
      const ring=enemies().filter(v=>d(pt(v),p)===2).sort(first);
      if(route==='shell'){ring.slice(0,2).forEach(v=>use(v,op.effect,.42,p));if(two)later(.7,()=>use(enemies().filter(v=>local(v,p,1)).sort(first)[0],'stagger',.46,p));}
      else{use(ring[0],'mark');if(two)later(3.2,()=>enemies().filter(v=>local(v,p,1)).sort(first).slice(0,2).forEach(v=>use(v,'stagger',.38,p)));}break;}
    case 'net':{const counts=new Map();for(const z of front())counts.set(e.col(z),(counts.get(e.col(z))||0)+1);const best=[...counts].sort((a,b)=>b[1]-a[1]||Math.abs(a[0]-loc.c)-Math.abs(b[0]-loc.c))[0];if(!best)return;const c=best[0];
      use(enemies().filter(z=>Math.abs(e.col(z)-c)===1).sort(first)[0]);if(two)later(.8,()=>enemies().filter(z=>e.col(z)===c).sort(first).slice(0,2).forEach(z=>use(z,'stagger')));break;}
    case 'chain':{const v=front().sort(first)[0];if(!v)return;const p=pt(v),hop=enemies().filter(z=>z!==v&&local(z,p,2)).sort((a,b)=>Number(e.row(a)===p.r)-Number(e.row(b)===p.r)||first(a,b))[0];if(!hop)return;
      const end=pt(hop);use(hop,op.effect,.46,p);if(two)later(.35,()=>use(enemies().filter(z=>z!==hop&&local(z,end,3)).sort(strong)[0],'slow',.48,end));break;}
    case 'focus':case 'cull':case 'bounty':{const z=front().sort(route==='focus'?strong:weak)[0];if(!z)return;const p=pt(z);use(z,'mark');
      if(two)later(route==='cull'?.6:.8,()=>{const target=front().filter(v=>v!==z&&(route!=='focus'||local(v,p,1))).sort(weak)[0];
        if(target){use(target,route==='bounty'?'stagger':op.effect,.48,p);if(route==='bounty')e.sun(10);}});break;}
    case 'back':{const z=front().sort(last)[0];if(!z)return;const p=pt(z);use(z,'slow');if(two)later(.75,()=>use(enemies().filter(v=>e.row(v)===p.r&&e.col(v)<p.c).sort(last)[0],op.effect,.48,p));break;}
    case 'trap':{const end=e.time()+6;const seek=()=>{const z=enemies().filter(v=>local(v,loc,3)).sort(first)[0];
      if(!z){if(e.time()<end)later(.4,seek);return;}const p=pt(z);use(z,'slow');if(two)later(1,()=>use(enemies().filter(v=>v!==z&&local(v,p,1)).sort(first)[0],op.effect,.48,p));};seek();break;}
    case 'cover':{const v=localFriends().sort(last)[0];if(!v)return;use(v);if(two)guard(friends().filter(z=>z!==v&&local(z,pt(v),1)).sort(weak)[0]);break;}
    case 'relay':{const anchor=localFriends().filter(v=>e.row(v)===loc.r&&e.col(v)<=loc.c).sort(first)[0];if(!anchor)return;const p=pt(anchor);
      const v=friends().filter(z=>Math.abs(e.row(z)-p.r)===1&&Math.abs(e.col(z)-p.c)<=1).sort(weak)[0];if(!v)return;const end=pt(v);use(v,op.effect,.48,p);
      if(two)later(.8,()=>use(friends().filter(z=>local(z,end,1)).sort(interfered)[0],'cleanse',.48,end));break;}
    case 'rescue':case 'escort':case 'harvest':case 'yield':{const group=localFriends().filter(z=>route!=='yield'||e.row(z)===loc.r);
      const v=group.sort(route==='rescue'?interfered:weak)[0];if(!v)return;const p=pt(v);
      if(route==='escort'||route==='yield')guard(v);else use(v,route==='rescue'?'cleanse':'mend');
      if(two){if(route==='escort')use(enemies().filter(z=>local(z,p,2)).sort(first)[0],op.effect,.46,p);
        else later(route==='yield'?2:1,()=>{const others=localFriends().filter(z=>z!==v&&(route==='harvest'?local(z,p,1):route==='yield'?Math.abs(e.row(z)-p.r)===1:z.health<z.toughness));
          use(others.sort(route==='yield'?interfered:weak)[0],route==='harvest'?'haste':route==='yield'?'cleanse':op.effect,.42,p);});}break;}
    case 'explosion':{const z=row(loc.r).sort(first)[0];if(!z)return;const p=pt(z);use(z,'blast',.50);if(two)later(.65,()=>use(enemies().filter(v=>d(pt(v),p)===2).sort(first)[0],'slow',.48,p));break;}
    case 'triple':{const side=[row(loc.r-1).sort(first)[0],row(loc.r+1).sort(first)[0]].filter(Boolean);for(const v of side)use(v,'mark');
      if(two){const cols=new Set(side.map(e.col));row(loc.r).filter(v=>cols.has(e.col(v))).sort(first).slice(0,2).forEach(v=>use(v,'beam',.5));}break;}
    case 'rapid':{const z=row(loc.r).sort(first)[0];if(!z)return;const p=pt(z);use(z,'slow',.45);if(two)later(.45,()=>use(row(loc.r).filter(v=>v!==z&&e.col(v)===p.c+1).sort(weak)[0],'pierce',.5,p));break;}
    }
  }
  function cast(op,e,level){
    if(!op||!Number.isInteger(level)||level<=0||level>4)return;
    basic(op,e,Math.min(2,level));
    if(level>=3)gardenModeMasteryAdvanced.cast(op,e,level);
  }
  return Object.freeze({price,describe,cast,get fx(){return fx;},setFX});
})();
