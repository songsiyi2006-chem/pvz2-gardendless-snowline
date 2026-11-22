// Level V extends the level-IV operator with a second, item-specific response.
// Durations, cooldowns and delayed work run on the battle's simulation clock.
const gardenEquipmentApex=(()=>{
  const rows={
    thorns:[.52,34,'每 0.52 秒','每刺 34 点','每第四轮让前线荆根横穿一整列，造成 90 点穿甲伤害并缠足 1.5 秒。'],
    rotary:[0,140,'每秒 32 轮 · 30 秒 960 轮','每轮 140 点 · 爆心 126 · 刃心 168','每二十轮沿落点列上下两格追击最多两名旁敌，各受到 63 点伤害。保留穿甲、震撼弹、镜像扫射与双对角爆斩。两种弹型首台 1000 阳光，每部署一台报价增加 250，每 25 秒回落 50，最低 1000，最多五台同时开火。'],
    bombard:[0,51000,'每组 10 发 · 3000 阳光','主爆 51000 点 / 发','末发炸开中心及左右两列，整条火带保留 3 秒，每 0.5 秒对带内敌人各造成 9000 点炮击伤害。'],
    prism:[2.2,3200,'每 2.2 秒 · 零阳光','主束 3200 点','第三面棱镜追加一行 55% 威力的侧光；主列及相邻两列依次折返，各列另受 1920 点穿甲伤害。'],
    reservoir:[22,320,'开局＋每 22 秒','开局 320 · 循环 65 阳光','独立的应急阀每 35 秒待命一次。账户跌破 100 阳光时立即补入 120，并对最近的敌人反冲。',60],
    dew:[7.5,72,'每 7.5 秒','主露 72 阳光','两片侧翼各放下一颗 25 阳光露珠，同时冷凝最靠前的两只敌人 1.2 秒。',50],
    orchard:[14,78,'新波次＋每 14 秒','整果 78 阳光','每两次整波收获结出一枚叶绿素果。储格已满时改产 60 阳光。',55],
    relay:[22,72,'每 22 秒','1–2 格叶绿素 · 72 阳光','放电后启动三座副线圈，从房前向最靠前的三名敌人依次施加 75 点电伤和 0.65 秒眩晕。',85],
    bounty:[2,88,'每 2 次击败','88 阳光','每第三次结赏补一格叶绿素，并为全场植物恢复 35 点。绿叶已满则改掉 55 阳光。',72],
    infirmary:[2.6,190,'每 2.6 秒','主诊恢复 190','每轮另派两个巡诊小队，分赴两个不同的受伤行，各为最虚弱的一株恢复 90 点并解除眩晕。',56],
    rain:[7.5,110,'每 7.5 秒','每株恢复 110','暖雨结束时触发光合脉冲，全场植物的原生行动冷却缩至 72%，持续 2.6 秒。',80],
    shell:[8,56,'每 8 秒','低于 45% 触发 · 回 56% · 保护 3 秒','救治后再封住危急植物所在一列，同列友军获得 2.3 秒保护，同列敌人后退一格。',90],
    detox:[2.2,78,'每 2.2 秒','全场净化 · 每株恢复 78','将滤下的干扰制成反制孢雾，使最靠前的两只敌人中毒 4 秒，每秒损失 30 点。',55],
    tempo:[4.4,45,'每 4.4 秒','主行冷却缩至 45% · 持续 4.5 秒','每两次起奏发动轮唱。主行之外的防线全部加入，攻击冷却缩至 78%，持续 2.1 秒。',63],
    frost:[4.4,3,'每 4.4 秒','冻结 3 秒 · 冰伤 68 点','发射后 1.3 秒引爆两格内残留的冰晶。仍冻结或减速的敌人各受 115 点寒冰伤害。',0,68],
    wind:[5.5,1.45,'每 5.5 秒','5 个目标 · 后退 1.45 格 · 冲击 62 点','0.85 秒后高空出现逆卷风，场上所有飞行敌人再后退 1.1 格并受 75 点冲击。',0,62],
    mire:[3.9,1.5,'每 3.9 秒','减速 1.5 秒 · 胶池 6.5 秒 · 腐蚀 15 点','琥珀向上下相邻行溢流。3 秒内每半秒灼蚀那两行落点前后一格，造成 14 点伤害并刷新减速。',0,15],
    tripwire:[8.5,4.1,'每行重设 8.5 秒','眩晕 4.1 秒 · 电伤 88 点','绊索触发时弹起植械闸板，将触发这一行、房前三列的敌人向后抛 1.2 格。',0,88],
    arc:[3.6,185,'每 3.6 秒','首击 185 点 · 4 段电击','远端闭合第二条回路，从草坪右端选三名敌人反向放电，每段各造成 78 点电伤。'],
    shard:[3.6,195,'每 3.6 秒','主针 195 点 · 锁定 5 名','在一个护甲目标脚下留驻磁巢。2.4 秒内每 0.6 秒对周围一格仍带甲的敌人造成 90 点穿甲伤害。'],
    roost:[2.5,300,'每 2.5 秒','拦截 3 名 · 每击 300 点','燕群追随最前的空中目标，天空无敌时追随地面目标。0.7 秒后俯冲其所在格及周围一格，各造成 86 点伤害。'],
    flare:[14,150,'新波次＋每 14 秒','主闪 150 点','每波主闪在敌群最密处挂起日冕，2.4 秒内每 0.6 秒对周围一格的敌群造成 62 点火伤。'],
    mycelium:[5,52,'每 5 秒','每秒 52 点 · 孢毒持续 5.5 秒','抽取前三个感染格的菌丝，打击其中毒宿主周围一格的敌人 72 点，并为邻近植物恢复 42 点。每轮每名单位只结算一次。']
  };
  const seen=new Map();
  function spec(id,base){
    const v=rows[id];if(!v||!base)return null;if(seen.has(id))return seen.get(id);
    const [interval,strength,frequency,summary,mechanic,responsePower=0,contact=0]=v,power=summary+(responsePower?' · 反击 '+responsePower+' 点':'');
    const result=Object.freeze({...base,level:5,interval,strength,frequency,power,mechanic,responsePower,contact,
      ...(id==='bombard'?gardenEquipmentUpgrades.barrage(5):{})});
    seen.set(id,result);return result;
  }
  function trigger(s,id,env,anchor){
    if(s.levels[id]<5)return;
    const {foes,plants,hit,paint,wait,area,dense,point,row,col,nearby,byHouse,byHurt,armored,flying,
      heal,chill,stun,push,shield,enemy,damaged,sun,food,deposit,feedback}=env;
    const enemies=()=>foes(s),allies=()=>plants(s),origin=()=>anchor||dense(enemies());
    const later=(delay,fn)=>wait(s,delay,fn);
    function leafOrSun(amount){const tank=food();if(tank&&!tank.full())tank.plantFoodAdd();else sun(s,amount,anchor||{r:2,c:0});}
    switch(id){
      case 'thorns':{
        if(s.thornPulses%4)break;
        const first=enemies().filter(z=>!flying(z)).sort(byHouse)[0];if(!first)break;const c=col(first);
        paint(s,'prism',{r:0,c},{r:s.square.MaxLaneIndex,c});
        for(const z of enemies())if(col(z)===c&&!flying(z)){hit(z,90,0,'pierce');chill(z,1.5);}break;
      }
      case 'bombard':{
        const struck=new Set(),seal=s.levels.bombard===7;
        const checkSeal=()=>{
          for(const z of area(s,anchor,2,2)){
            if(struck.has(z)||Math.abs(row(z)-anchor.r)!==Math.abs(col(z)-anchor.c))continue;
            struck.add(z);hit(z,Math.round(s.specs.bombard.strength*.34),0,'pierce',true);stun(z,1.2);
          }
        };
        if(seal)checkSeal();
        for(let i=1;i<=6;i++)later(Math.max(0,(anchor.impactAt??s.time)+i*.5-s.time),()=>{
          const left=Math.max(0,anchor.c-1),right=Math.min(s.square.MaxColumnIndex,anchor.c+1);
          if(i===1||i===4)paint(s,'bombard-curtain',{r:0,c:left},{r:s.square.MaxLaneIndex,c:right});
          for(const z of enemies())if(col(z)>=left&&col(z)<=right)hit(z,9000,1,'splash',true);
          if(seal){if(i===1||i===4)paint(s,'bombard-seal',anchor);checkSeal();}
        });break;
      }
      case 'prism':{
        const p=s.prismAnchor;if(!p)break;
        for(const [i,c] of [p.c,p.c-1,p.c+1].entries())if(c>=0&&c<=s.square.MaxColumnIndex)later(.18+i*.18,()=>{
          paint(s,'prism-fold',{r:0,c},{r:s.square.MaxLaneIndex,c});for(const z of enemies())if(col(z)===c)hit(z,1920,4,'pierce');
        });break;
      }
      case 'reservoir':deposit(120);feedback(s,id);break;
      case 'dew':{
        for(const r of [0,s.square.MaxLaneIndex])sun(s,25,{r,c:1});
        for(const z of enemies().sort(byHouse).slice(0,2))chill(z,1.2);break;
      }
      case 'orchard':if(s.harvests%2===0)leafOrSun(60);break;
      case 'relay':{
        const group=enemies().sort(byHouse).slice(0,3);group.forEach((z,i)=>later(.13*i,()=>{
          if(enemy(z)){paint(s,'arc',{r:row(z),c:0},point(z));hit(z,75,2,'electric');stun(z,.65);}
        }));break;
      }
      case 'bounty':if(s.payouts%3===0){leafOrSun(55);for(const p of allies())heal(p,35);}break;
      case 'infirmary':{
        const picked=new Set();
        for(const p of allies().filter(damaged).sort(byHurt)){
          if(picked.has(row(p)))continue;picked.add(row(p));heal(p,90);p.stunned=0;paint(s,'heal',point(p));if(picked.size===2)break;
        }break;
      }
      case 'rain':for(const p of allies())p.plantCDScaleSetter(.72,2.6);break;
      case 'shell':{
        const c=anchor.c;for(const p of allies())if(col(p)===c)shield(p,2.3);for(const z of enemies())if(col(z)===c)push(z,1);
        paint(s,'shield',anchor);break;
      }
      case 'detox':for(const z of enemies().sort(byHouse).slice(0,2)){paint(s,'spore',point(z));z.setPoison(30,4,true);}break;
      case 'tempo':
        s.apexBeats=(s.apexBeats||0)+1;
        if(s.apexBeats%2===0)for(const p of allies())if(row(p)!==s.tempo)p.plantCDScaleSetter(.78,2.1);
        break;
      case 'frost':{
        const p=origin();if(!p)break;
        later(1.3,()=>{paint(s,'frost',p);for(const z of area(s,p,2,2))if(z.freeze>0||z.chill>0)hit(z,115,0,'ice');});break;
      }
      case 'wind':later(.85,()=>{for(const z of enemies().filter(flying)){paint(s,'wind',point(z));hit(z,75);push(z,1.1);}});break;
      case 'mire':{
        const p=origin();if(!p)break;
        for(let i=0;i<6;i++)later(i*.5,()=>{
          for(const z of area(s,p,1,1))if(row(z)!==p.r){hit(z,14);chill(z,1.1);}
          if(!i)for(const r of [p.r-1,p.r+1])if(r>=0&&r<=s.square.MaxLaneIndex)paint(s,'mire',{r,c:p.c});
        });break;
      }
      case 'tripwire':for(const z of enemies())if(row(z)===anchor.r&&col(z)<=2)push(z,1.2);break;
      case 'arc':{
        const edge=enemies().sort((a,b)=>byHouse(b,a)).slice(0,3);let origin={r:edge.length?row(edge[0]):0,c:s.square.MaxColumnIndex};
        for(const z of edge){paint(s,'arc',origin,point(z));hit(z,78,2,'electric');origin=point(z);}break;
      }
      case 'shard':{
        const z=enemies().filter(armored).sort(byHouse)[0];if(!z)break;
        const p=point(z);for(let i=1;i<=4;i++)later(i*.6,()=>{paint(s,'shard',p);for(const t of area(s,p,1,1))if(armored(t))hit(t,90,0,'pierce');});break;
      }
      case 'roost':{
        const all=enemies().sort(byHouse),bird=all.find(flying)||all[0];if(!bird)break;
        const last=point(bird);later(.7,()=>{const at=enemy(bird)?point(bird):last;paint(s,'roost',at);for(const t of area(s,at,1,1))hit(t,86,0,'splash');});break;
      }
      case 'flare':{
        const at=origin();if(!at)break;for(let i=1;i<=4;i++)later(.6*i,()=>{
          paint(s,'flare',at);for(const t of area(s,at,1,1))hit(t,62,1,'splash');});break;
      }
      case 'mycelium':{
        const beds=[],locations=new Set();for(const z of enemies().filter(z=>z.poisoned)){
          const p=point(z),key=p.r*32+p.c;if(!locations.has(key)){locations.add(key);beds.push(p);}if(beds.length===3)break;
        }
        for(const p of beds)paint(s,'spore',p);
        for(const z of enemies())if(beds.some(p=>nearby(z,p)))hit(z,72);
        for(const t of allies())if(beds.some(p=>nearby(t,p)))heal(t,42);break;
      }
    }
  }
  return Object.freeze({spec,trigger});
})();
