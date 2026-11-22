// The catalogue, geometry, target choice and timing are shared by the UI and combat.
const gardenModes = (() => {
  const routes = {
    line:'贯穿本行前方最多六敌',
    fan:'从本行和相邻两行各选一名前方敌人',
    flank:'分别攻击上下相邻行中最靠近房屋的一敌',
    cross:'以近处敌人为中心，攻击与它同排或同列、两格内最多五敌',
    shell:'以三行内最密集的敌人为中心，攻击周围一格内最多四敌',
    net:'锁定三行内敌人最密集的一列，攻击该列各行最多五敌',
    chain:'从近敌起跳，每隔 0.35 秒跳向两格内另一敌，最多四段',
    focus:'锁定三行内体力最高者，在 0、0.8、1.6 秒各出手一次；目标倒下后转移火力',
    back:'锁定三行最后方的两敌，先击后一名，1 秒后折返攻击另一名',
    field:'在三行内敌群密集处留下 3 秒阵地，立即及每隔 1.5 秒攻击范围一格内最多三敌',
    trap:'守候脚下两格 6 秒，首敌进入后引发伏击，波及它周围一格内最多三敌',
    cull:'先攻三行内体力比例最低的一敌；若该目标死亡，立刻转攻下一敌，最多连续三名',
    cover:'为周围两格内生命比例最低的三株植物提供支援',
    relay:'沿本行向后接力，照顾同格与后方最多三株友军；同格优先宿主',
    rescue:'守望周围两格 6 秒，优先救助生命比例最低的受伤友株；2 秒后再次回访',
    escort:'打击三行最靠近房屋的一敌，同时为周围两格最需要照顾的友株恢复其最大生命的 5%',
    harvest:'按周围两格的友株数收成，基础 25 阳光，每株另加 10 点，最多计五株。产量受伤害加成影响。',
    yield:'从原格立即及 2、4 秒后各结出 20 点阳光。产量受伤害加成影响。',
    bounty:'瞄准三行内生命比例最低的一敌；3 秒内击杀它，另收获 65 点阳光。产量受伤害加成影响。'
  };
  const effects = {
    mark:'测距标记并放大后续升阶直伤',dart:'种针打击',slice:'割伤，残血目标受到额外伤害',
    pierce:'穿甲打击',beam:'射线伤害',ember:'火焰伤害',shatter:'对着凉或冻结者造成更高伤害',
    shatterPoison:'对中毒者造成更高伤害',execute:'对体力低于三分之一的目标追加伤害',
    crack:'优先破坏护甲',burst:'弹片溅射',blast:'爆炸溅射',spark:'附带一次近距离电弧传导',
    venom:'施加持续伤害的毒素',spore:'施加可传染孢毒',burntrail:'立即灼烧并在 1.5 秒后再次灼烧',
    stagger:'短暂眩晕',butter:'以黄油固定目标',slow:'施加寒冷减速',freeze:'冻结',
    shove:'击退',drain:'穿甲吸血',mend:'治疗并额外恢复受益者 5% 最大生命',
    ward:'短时无敌',guard:'闪光护盾',haste:'缩短受益者的原生攻击冷却',cleanse:'驱散部分眩晕和音箱干扰并治疗'
  };
  const laser = {
    explosion:'每发普通激光在本行首个命中点引爆。爆心周围一格内的敌人再受一次相当于本发激光的爆炸伤害。',
    triple:'每次普通射击同时贯穿本行和上下相邻行；只要三行任一行有可击中的僵尸或墓碑即可开火，每行均造成完整普通激光伤害。',
    rapid:'普通激光射速额外提高 500%，即原射速的 6 倍。此倍率与升阶、全园攻速相乘。'
  };
  const entries = new Map();
  for(const line of MODE_DATA.trim().split('\n')){
    const [id,...encoded]=line.trim().split(/\s+/);
    const options=encoded.map(item=>{
      const [name,route,effect]=item.split('/');
      const detail=effects[effect];
      const description=route==='laser'?laser[effect]:'随本株升阶主招发动。'+routes[route]+(detail?(route==='bounty'?'攻击效果为':'，效果为')+detail+'。':'');
      return Object.freeze({name,route,effect,description});
    });
    entries.set(id,Object.freeze(options));
  }
  const options=id=>entries.get(id)||[];
  function speedFactor(id,index){return id==='laser_bean'&&index===2?6:1;}
  function cast(option,env){
    if(!option||option.route==='laser')return;
    const {loc}=env;
    const {route,effect}=option;
    const foes=()=>env.foes().filter(a=>env.live(a));
    const allies=()=>env.allies().filter(a=>env.live(a));
    const coord=a=>({r:env.row(a),c:env.col(a)});
    const dx=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.c-b.c));
    const dist=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
    const near=(z,at=loc)=>dist(at,coord(z));
    const byNear=(a,b)=>near(a)-near(b)||env.col(a)-env.col(b)||env.row(a)-env.row(b);
    const three=()=>foes().filter(z=>Math.abs(env.row(z)-loc.r)<=1);
    const friendly=()=>allies().filter(z=>dx(loc,coord(z))<=2);
    const weakest=(a,b)=>env.ratio(a)-env.ratio(b)||byNear(a,b);
    const urgent=()=>friendly().filter(z=>z.health<z.toughness).sort(weakest);
    const act=(target,power=1,place=loc)=>{
      if(!target||!env.live(target))return;
      if(effect==='mend')target.heal(.05*target.toughness);
      env.effect(effect,target,power,place);
    };
    const groupAnchor=()=>{
      const available=three();let best=null,score=-Infinity;
      for(const z of available){
        const pos=coord(z),value=env.density(z)*1024-near(z);
        if(value>score){score=value;best=pos;}
      }
      return best||loc;
    };
    const zone=(at,max,power)=>{
      const hits=foes().filter(z=>dx(at,coord(z))<=1).sort((a,b)=>near(a,at)-near(b,at)||byNear(a,b));
      for(const z of hits.slice(0,max))act(z,power,env.tile(at)||loc);
    };
    switch(route){
      case 'line':{
        const line=foes().filter(z=>env.row(z)===loc.r&&env.col(z)>=loc.c).sort(byNear);
        line.slice(0,6).forEach(z=>act(z,.93));break;
      }
      case 'fan':case 'flank':{
        const all=foes();
        for(const r of (route==='fan'?[loc.r,loc.r-1,loc.r+1]:[loc.r-1,loc.r+1])){
          const z=all.filter(z=>env.row(z)===r&&(route==='flank'||env.col(z)>=loc.c)).sort((a,b)=>env.col(a)-env.col(b))[0];
          act(z,route==='flank'?1.22:1);
        }
        break;
      }
      case 'cross':{
        const z=three().sort(byNear)[0];if(!z)break;const at=coord(z);
        foes().filter(b=>(env.row(b)===at.r||env.col(b)===at.c)&&dx(at,coord(b))<=2)
          .sort((a,b)=>near(a,at)-near(b,at)).slice(0,5).forEach(b=>act(b,.98));break;
      }
      case 'shell':zone(groupAnchor(),4,1.15);break;
      case 'net':{
        const counts=new Map();for(const z of three())counts.set(env.col(z),(counts.get(env.col(z))||0)+1);
        const best=Array.from(counts).sort((a,b)=>b[1]-a[1]||Math.abs(a[0]-loc.c)-Math.abs(b[0]-loc.c))[0];
        if(best)foes().filter(z=>env.col(z)===best[0]).sort(byNear).slice(0,5).forEach(z=>act(z,1));break;
      }
      case 'chain':{
        const used=new Map();let from=loc;
        function jump(n){
          const z=(n===0?three():foes().filter(b=>dx(coord(b),from)<=2)).filter(b=>!used.has(b)||used.get(b)!==env.generation(b))
            .sort((a,b)=>near(a,from)-near(b,from)||byNear(a,b))[0];
          if(!z)return;
          used.set(z,env.generation(z));const point=coord(z);act(z,1.30-n*.13,env.tile(from)||loc);from=point;
          if(n<3)env.after(.35,()=>jump(n+1));
        }
        jump(0);break;
      }
      case 'focus':{
        let target,identity;
        const shoot=()=>{
          const pool=three();
          if(!target||env.generation(target)!==identity||!pool.includes(target)){target=pool.sort((a,b)=>b.health-a.health||byNear(a,b))[0];identity=target&&env.generation(target);}
          act(target,1.10);
        };
        shoot();env.after(.8,shoot);env.after(1.6,shoot);break;
      }
      case 'back':{
        const list=three().sort((a,b)=>env.col(b)-env.col(a)||byNear(a,b));
        const second=list[1],identity=second&&env.generation(second);act(list[0],1.55);
        if(second)env.after(1,()=>{if(identity===env.generation(second)&&three().includes(second))act(second,1.55);});break;
      }
      case 'field':{
        const at=groupAnchor(),pulse=()=>zone(at,3,.78);env.beacon(at);
        pulse();env.after(1.5,pulse);env.after(3,pulse);break;
      }
      case 'trap':{
        const expires=env.time()+6;env.beacon(loc);
        const watch=()=>{const z=foes().filter(z=>dx(loc,coord(z))<=2).sort(byNear)[0];
          if(z)zone(coord(z),3,1.65);else if(env.time()<expires)env.after(.25,watch);};
        watch();break;
      }
      case 'cull':{
        const used=new Set();
        for(let n=0;n<3;n++){
          const target=three().filter(z=>!used.has(z)).sort(weakest)[0];if(!target)break;
          used.add(target);act(target,1.85);if(env.live(target)&&target.health>0)break;
        }
        break;
      }
      case 'cover':friendly().sort(weakest).slice(0,3).forEach(z=>act(z,1.15));break;
      case 'relay':allies().filter(z=>env.row(z)===loc.r&&env.col(z)<=loc.c)
        .sort((a,b)=>env.col(b)-env.col(a)||Number(a===env.body)-Number(b===env.body))
        .slice(0,3).forEach(z=>act(z,1.35));break;
      case 'rescue':{
        const expiry=env.time()+6;
        const watch=()=>{
          const z=urgent()[0];
          if(!z){if(env.time()<expiry)env.after(.5,watch);return;}
          const identity=env.generation(z);act(z,1.65);
          env.after(2,()=>{if(env.generation(z)===identity&&friendly().includes(z))act(z,1);});
        };
        watch();break;
      }
      case 'escort':{
        const z=three().sort((a,b)=>env.col(a)-env.col(b)||byNear(a,b))[0];
        if(!z)break;act(z,1.35);
        const friend=urgent()[0];if(friend){friend.heal(.05*friend.toughness);env.flash('mend',friend);}
        break;
      }
      case 'harvest':env.sun(25+10*Math.min(5,friendly().length));break;
      case 'yield':env.sun(20);env.after(2,()=>env.sun(20));env.after(4,()=>env.sun(20));break;
      case 'bounty':{
        const target=three().sort(weakest)[0];if(!target)break;
        const identity=env.generation(target),ends=env.time()+3;
        let claimed=false;
        const pay=()=>{if(!claimed&&env.time()<=ends){claimed=true;env.sun(65);}};
        env.onKilled?.(target,pay,3);
        act(target,1.5);
        const claim=()=>{
          if(claimed||env.generation(target)!==identity)return;
          if(target.dead||target.health<=0){pay();return;}
          if(env.time()<ends)env.after(.25,claim);
        };
        claim();break;
      }
    }
  }
  return Object.freeze({options,speedFactor,cast});
})();

