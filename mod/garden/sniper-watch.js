const gardenSniperWatch=(()=>{
  function spec(base,level){
    const precision=base.form==='precision',advanced=level===7;
    const strength=precision?(advanced?1225:1190):(advanced?122:118);
    const secondaryTotal=advanced?4200:3700,secondaryPerTarget=advanced?920:820;
    const actionName=advanced?'交叉封锁':'前沿警戒';
    const mechanic='自动射击优先拦截先锋一格内的重甲或特种僵尸，最后两列优先救场。'+
      (precision?'主弹引爆七列五行椭圆并打出三格双对角爆斩，最多四片三刃、两跳闪爆及三跳连斩。副伤受盾墙掩护，护甲结算前每发最多 '+secondaryTotal+' 点、单体最多 '+secondaryPerTarget+' 点。':'保留六种元素弹和原有连射速度。')+
      (advanced?'封锁两行，每两秒拦住各行最前敌人；闯入房前四列时再将其击退 0.8 格。':'警戒一行，每两秒瞄准先锋并眩晕 0.9 秒。')+
      '警戒持续 12 秒，多次部署优先覆盖其他路线。';
    return Object.freeze({...base,level,strength,...(precision?{secondaryTotal,secondaryPerTarget}:{}),activeCost:advanced?900:600,duration:12,actionName,mechanic,
      power:'主弹 '+strength+' 点 · '+actionName,frequency:base.frequency+' · 自动射击免费'});
  }
  function acquire(s,list,env){
    const front=list[0],edge=env.col(front);
    if(edge<=1)return front;
    return list.find(z=>env.col(z)<=edge+1&&(z._gardenHybridKind||env.armored(z)))||front;
  }
  function deploy(s,env){
    const q=s.specs.sniper,coverage=s.watchCoverage??=Array(s.square.LaneCount).fill(0);
    const rows=coverage.map((n,r)=>({n,r,lead:Infinity}));
    for(const z of env.foes(s)){
      const line=rows[env.row(z)];if(line)line.lead=Math.min(line.lead,env.col(z));
    }
    rows.sort((a,b)=>a.n-b.n||a.lead-b.lead||Math.abs(a.r-s.home.r)-Math.abs(b.r-s.home.r));
    const lanes=rows.slice(0,q.level===7?2:1).map(v=>v.r);
    for(const r of lanes)coverage[r]++;
    const intercept=()=>{
      const enemies=env.foes(s).sort(env.byHouse);
      for(const r of lanes){
        const p={r,c:3},z=enemies.find(z=>env.row(z)===r&&!(z.stunned>0))||enemies.find(z=>env.row(z)===r);
        env.paint(s,'watch-line',p,z?env.point(z):{r,c:s.square.MaxColumnIndex});
        if(!z)continue;
        env.stun(z,.9);
        if(q.level===7&&env.col(z)<=3)env.push(z,.8);
      }
    };
    intercept();
    for(let t=2;t<q.duration;t+=2)env.wait(s,t,intercept);
    env.wait(s,q.duration,()=>{for(const r of lanes)coverage[r]--;});
  }
  return Object.freeze({spec,acquire,deploy});
})();
