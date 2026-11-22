const gardenTalents=(()=>{
  const projects=[
    {id:'nursery',name:'循环苗床',effect:'所有植物的种子包冷却时间',step:-4,unit:'%',branch:'育种'},
    {id:'rotation',name:'长周期轮作',effect:'原始冷却至少 20 秒的种子包，冷却时间额外',step:-4,unit:'%',branch:'育种',needs:['nursery']},
    {id:'roots',name:'纤维根系',effect:'植物最大生命',step:8,unit:'%',branch:'生长'},
    {id:'rhythm',name:'生长节律',effect:'植物攻击和行动速度',step:3,unit:'%',branch:'生长',needs:['roots']},
    {id:'aim',name:'感光复眼',effect:'植物伤害暴击率',step:2,unit:' 个百分点',branch:'火力'},
    {id:'crown',name:'棱晶花冠',effect:'植物暴击伤害倍率',step:.1,unit:' 倍',branch:'火力',needs:['aim']},
    {id:'canopy',name:'冠层共生',effect:'植物对僵尸的命中伤害',step:4,unit:'%',branch:'联合研究',needs:['rotation','rhythm','crown']}
  ];
  const levels=3,byId=new Map(projects.map(p=>[p.id,p]));
  const points=[[8,14,22],[12,20,34],[24,40,60]],coins=[[1200,2500,5000],[3000,6000,11000],[8000,15000,25000]];
  const learned=(tree,id)=>Number.isInteger(tree?.[id])&&tree[id]>=1&&tree[id]<=levels?tree[id]:0;
  const tree=player=>player?.gardendlessGreenhouseV1?.talents;
  function quote(id,player){
    const p=byId.get(id);if(!p||!player)return null;
    const t=tree(player),rank=learned(t,id),tier=p.needs?.length===3?2:p.needs?1:0;
    const required=tier===2?1:2,missing=(p.needs||[]).filter(parent=>learned(t,parent)<required);
    const price=rank<levels?{points:points[tier][rank],coin:coins[tier][rank],gem:0}:null;
    return {rank,required,missing,price};
  }
  let saving=false;
  function buy(id,expected,p){
    if(saving||!p||p!==gardenEconomy.profile())return false;
    const q=quote(id,p);if(!q||q.rank!==expected||!q.price||q.missing.length)return false;
    const old=gardenEconomy.read(p);saving=true;
    try{return gardenChallengeRewards.spendTraining(q.price,{...old,talents:{...old.talents,[id]:expected+1}},p);}
    finally{saving=false;}
  }
  const empty=Object.freeze({cooldown:1,longCooldown:1,health:1,speed:1,crit:0,critPower:0,impact:1});
  const cache=new WeakMap();
  function bonuses(){
    const t=tree(gardenEconomy.profile());if(!t||typeof t!=='object')return empty;
    if(!cache.has(t))cache.set(t,Object.freeze({
      cooldown:1-.04*learned(t,'nursery'),longCooldown:1-.04*learned(t,'rotation'),
      health:1+.08*learned(t,'roots'),speed:1+.03*learned(t,'rhythm'),
      crit:.02*learned(t,'aim'),critPower:.1*learned(t,'crown'),impact:1+.04*learned(t,'canopy')
    }));
    return cache.get(t);
  }
  function cardTime(seconds,base){
    if(!(seconds>0))return seconds;
    const b=bonuses();return seconds*b.cooldown*(base>=20?b.longCooldown:1);
  }
  return Object.freeze({projects,byId,quote,buy,bonuses,cardTime,levels});
})();
