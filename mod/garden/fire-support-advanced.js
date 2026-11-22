// VI and VII change target geometry while keeping the level-V firing cadence.
const gardenFireSupportAdvanced=(()=>{
  const data={
    bombard:[
      [52530,3000,'侧翼校射','每 3 发炮弹额外向主爆范围外的密集敌群投下 55% 威力的穿甲副弹，波及三行三列，优先带甲目标。'],
      [54106,3000,'交叉封锁','末发在落点两格内铺设交叉封锁线，持续 3 秒。每个新踏上刀口的敌人首次受 34% 穿甲伤害并眩晕 1.2 秒，每组独立结算。']
    ],
    prism:[
      [3296,900,'架设双镜锁廊','被动侧束让带甲者眩晕 0.6 秒。主动锁定敌群所在行与列，4.8 秒内扫过四次，交点造成 150% 穿甲伤害；可叠加部署。'],
      [3395,1300,'架设巡天折光阵','被动每三轮向主交点两格内释放 35% 穿甲斜光。主动沿用双镜锁廊，每次脉冲另将 70% 穿甲斜光引向主锁廊外的敌群；可叠加部署。']
    ]
  };
  function spec(base,level){
    const line=data[base.id]?.[level-6];if(!line)return base;
    const [strength,activeCost,actionName,mechanic]=line,artillery=base.id==='bombard';
    const frequency=artillery?'每组 10 发 · '+activeCost+' 阳光':'每 2.2 秒自动 · 主动 '+activeCost+' 阳光';
    return Object.freeze({...base,level,strength,activeCost,actionName,mechanic,frequency,
      duration:artillery?base.duration:4.8,power:(artillery?'主爆 ':'主束 ')+strength+' 点'});
  }
  return Object.freeze({spec});
})();
