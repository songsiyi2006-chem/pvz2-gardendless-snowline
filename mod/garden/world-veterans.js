// The field guide, reinforcement selector and actors all use the same entries.
const gardenWorldVeterans=(()=>{
  const regions=[
    ['frontyard','前院草坪','tutorial','tutorial_imp','stride','imp', '#94af6e'],
    ['egypt','神秘埃及','mummy','ra','dust','solar','#d7b456'],
    ['pirate','海盗港湾','pirate','swashbuckler','board','boarding','#63bfc0'],
    ['cowboy','狂野西部','cowboy','prospector','trail','dynamite','#d39e62'],
    ['future','遥远未来','future','future_jetpack','charge','arc','#81cfdf'],
    ['dark','黑暗时代','dark','dark_wizard','curse','bind','#af95d2'],
    ['beach','巨浪沙滩','beach','beach_surfer','wash','surf','#8acec3'],
    ['ice','冰河世界','iceage','iceage_hunter','rime','glacier','#a6d8ed'],
    ['lostcity','失落之城','lostcity','lostcity_excavator','steal','dig','#e6b95f'],
    ['kongfu','功夫世界','kongfu','kongfu_hammer','stance','gong','#ce866a'],
    ['eighties','摇滚年代','eighties','eighties_punk','tempo','drop','#e08bc2'],
    ['dino','侏罗纪沼泽','dino','dino_bully','hunt','stomp','#9bb575'],
    ['modern','摩登世界','tutorial','modern_newspaper','press','ink','#a2aed0'],
    ['sky','天空之城','sky','sky_electric','bursts','arc','#95c5dc'],
    ['birthday','生日派对','birthday','birthday_juggler','tempo','drop','#eba6be'],
    ['sportz','运动节','sportzball','sportzball_wizard','stride','bind','#b4c681'],
    ['foodfight','美食节','foodfight','foodfight_chefster','restore','sweep','#dbad72'],
    ['valentines','甜蜜情人节','valentines','valentines_imp','restore','imp','#dc93af'],
    ['stpatricks','幸运草节','stpatrick','stpatrick_dodo','steal','surf','#91bc76'],
    ['lunar','新春庆典','lunar','lunar_superfanimp','charge','dynamite','#e0a46e'],
    ['easter','春日彩蛋节','easter','easter_wizard','stride','bind','#d3aedb'],
    ['feastivus','冬日庆典','feastivus','feastivus_piano','rime','gong','#a7c7d3'],
    ['summer','仲夏夜','summer_basic','summer_bug','hunt','boarding','#9cc579'],
    ['halloween','万圣节','halloween','halloween_imp','curse','imp','#cd9a88']
  ];
  // A shared role has one published effect, even when several native variants
  // carry it. The different local tactics below have different targeting rules.
  const skills={
    stride:['压线步','同一行有本地同伴时','本体和最近的一名同伴提速 32%，持续 2.6 秒。','先清掉陪同行进的僵尸。',8],
    imp:['钻空步','进入前四列时','立即提速 65%，持续 1.8 秒；抵达前线的途中只发动一次。','提前拦在草坪中部。',20],
    dust:['埋沙','前方两格内有植物时','沙尘命中标记格，行动冷却延长 55%，持续 2.4 秒。','控制木乃伊，或暂时移开标记植物。',8],
    solar:['太阳税','阳光账户至少有 20 时','一次取走最多 35 阳光，并将实扣数量转为本体及一名附近伤员的治疗。','及时花掉阳光，或在祈祷中打断。',10],
    board:['抢滩','首次踏进第六列时','本体和同排最靠前的一名友军提速 48%，持续 2 秒。','在前半场分开船员与先头部队。',18],
    boarding:['索降钩袭','同排有前后两株植物时','分别钩击前后两端，各造成 78 伤害；后排停手 0.8 秒。','两端分行布防，或打断钩袭。',8],
    trail:['扬尘追击','同排植物进入三格内时','追向该株，自己提速 42% 持续 2 秒，并使其行动冷却延长 45% 持续 2 秒。','用靠前的植物引走追击。',8],
    dynamite:['矿坑回震','同排后方出现植物时','在最靠屋植物处落下一次 138 点震击；同排前后一格各受 66 点伤害。','看到标记后移开后排，或打断引信。',10],
    charge:['充能行进','自身或附近同伴的背心受损但未破时','给本体与至多两名附近同伴各修复 16% 背心耐久。','优先彻底击碎护具。',9],
    arc:['跨线导电','前方两行内出现植物时','电击标记植物 102 点，再跳向正交相邻的一株造成 66 点。','植物间留空一格，阻断弹跳。',9],
    curse:['暮色印','同排植物进入四格内时','标记最近植物，使其行动冷却加倍 2.2 秒。','把次要植物放在阵型前端。',9],
    bind:['沉默封印','同排存在后排植物时','让最靠屋的标记植物停手 2 秒；倒计时内可打断。','在封印落下前击退、冻住施法者。',10],
    wash:['回浪','前方两格内有植物时','横扫目标格和后面一格，各造成 60 伤害。','隔列种植，可使浪花只沾到一株。',8],
    surf:['破浪穿行','进入草坪第六列时','本体提速 60% 持续 2.8 秒，并将前方最近植物的行动冷却延长 70% 持续 2 秒。','单体控制能截断起浪。',9],
    rime:['霜印','近身两格内有植物时','在该地块留下 2.8 秒原生寒气；植物被更换后地块仍冷。','轮换输出行，避开仍有霜印的格子。',8],
    glacier:['横列封冻','同排四格内有植物时','令标记格及同排前后一格结霜 4 秒，中心受到 78 伤害。','把主要火力错开列，抢先打断猎手。',10],
    steal:['夺金','同排三格内有植物且存有阳光时','掠走最多 20 阳光；成功后本体提速 40% 持续 2.5 秒。','余额为 0 时，探宝家无法夺取阳光或加速。',8],
    dig:['遗迹掘进','前方同排有植物时','越过前线，使该排最后方植物受到 120 伤害，行动冷却延长 60% 持续 2.5 秒。','移开后方标记或打断发掘。',10],
    stance:['运气调息','本体生命低于 72% 时','回应伤势，恢复生命上限的 7%，并加速 28% 持续 2 秒。','控制其调息或集中输出。',9],
    gong:['战鼓齐鸣','邻近两行内有本地同伴时','至多三名同伴提速 45% 持续 3 秒；本体不分享这次冲锋。','先隔开鼓手与随队单位。',10],
    tempo:['踩拍','邻近有同伴且前方有植物时','一名近侧同伴提速 35% 持续 2.4 秒；标记植物的行动冷却延长 40% 持续 2 秒。','拆开同伴能让节拍无法成立。',8],
    drop:['低音断拍','两行内存在植物时','音波命中标记格与上下左右相邻格，各造成 66 伤害；中心短暂停手 0.8 秒。','斜向错开主阵，打断蓄势。',10],
    hunt:['狩猎本能','同排有生命不足 65% 的植物时','锁定最虚弱的目标，追加 90 点伤害；目标撤离后失效。','修复受伤植物或在预警后移走。',7],
    stomp:['化石重踏','两格内出现植物时','震击目标和相邻上下行同列，各造成 108 伤害，中心停手 1.2 秒。','把高价值植物错开列。',10],
    press:['街区躁动','本体生命低于 72% 时','本体提速 50% 持续 2.5 秒，并使同排最近的植物冷却延长 45% 持续 1.8 秒。','控制受伤僵尸，或用前排吸收标记。',9],
    ink:['油墨遮眼','前方两行内有植物时','向最靠屋的标记植物泼墨，造成 84 伤害并令其行动冷却加倍 3 秒。','打断甩报纸动作，或及时转移后排。',10],
    bursts:['空中掩护','前方两行内有植物时','标记前线一格并造成 66 点伤害，若该格仍有植物则延长其冷却 35% 持续 1.8 秒。','移开落点，或在蓄势时击退飞行员。',8],
    restore:['应急补给','身边的本地同伴受伤时','为生命比例最低的附近同伴恢复 9% 生命上限，并使其提速 20% 持续 2 秒。','先击倒受伤目标，切断补给。',9],
    plate:['整甲','自身背心未破且耐久不足 75% 时','将背心补回最多 28% 最大耐久。仅修复未被打碎的背心。','一次性击碎背心或打断整甲。',11],
    flag:['集结令','本地同伴出现在邻近一行时','让至多三名同伴提速 35%，持续 2.7 秒。','优先击败持旗者，旗手独行时无效。',9],
    heavy:['重压','前方两格内出现植物时','打击该格及前后邻格，分别造成 162 和 72 伤害。','从其他行输出，及时打断抬手。',11],
    sweep:['扇形压阵','同排三格内出现植物时','横扫目标格及上下相邻格，各受 78 伤害。','将主力错开列，避免同时受击。',8]
  };
  const overrides={
    egypt:{solar:'ra',dust:'camel_segment camel_onehump camel_segment_touch camel_onehump_touch',dynamite:'explorer explorer_veteran',dig:'tomb_raiser',restore:'pharaoh_inner pharaoh_weak pharaoh'},
    pirate:{boarding:'swashbuckler seagull pelican pirate_captain pirate_captain_parrot',dynamite:'barrelroller pirate_barrel cannon'},
    cowboy:{dynamite:'prospector',gong:'piano',hunt:'chicken_farmer chicken',surf:'west_bull west_bull_veteran west_bullrider',plate:'poncho poncho_plate'},
    future:{arc:'future_jetpack future_jetpack_veteran future_jetpack_disco mech_cone',charge:'future_protector',heavy:'football_mech',gong:'disco_mech'},
    dark:{bind:'dark_wizard dark_wizard_veteran',restore:'dark_king dark_king_veteran',sweep:'dark_juggler dark_imp_dragon'},
    beach:{surf:'beach_surfer beach_surfer_veteran beach_snorkel',bind:'beach_octopus',boarding:'beach_fisherman'},
    ice:{glacier:'iceage_hunter iceage_hunter_veteran iceage_troglobite iceage_troglobite_1block iceage_troglobite_2block iceage_troglobite_veteran',surf:'iceage_dodo',hunt:'iceage_weaselhoarder iceage_weasel'},
    lostcity:{dig:'lostcity_excavator lostcity_relichunter',boarding:'lostcity_lostpilot lostcity_lostpilot_veteran lostcity_bug',plate:'lostcity_jane',solar:'lostcity_impporter lostcity_crystalskull'},
    kongfu:{gong:'kongfu_hammer kongfu_gong',dynamite:'kongfu_bomb kongfu_rocket_imp kongfu_boss_explode',sweep:'monk_blade monk_nunchaku abbot_3section_staff kongfu_bronze_hook kongfu_boss_blade',bind:'kongfu_chi abbot_chi kongfu_bronze_chi kongfu_boss_chi',arc:'abbot_fan',heavy:'kongfu_bronze_strong'},
    eighties:{drop:'eighties_punk eighties_punk_veteran eighties_skunk eighties_mc eighties_boombox',gong:'eighties_glitter eighties_arcade',surf:'eighties_breakdancer'},
    dino:{stomp:'dino_bully dino_bully_veteran'},
    modern:{ink:'modern_newspaper newspaper_veteran',boarding:'modern_balloon',heavy:'modern_allstar catapult',dynamite:'modern_superfanimp',glacier:'zomboni',surf:'bobsled bobsled_team'},
    sky:{arc:'sky_electric sky_arbiterx sky_airraid_arbiterx sky_battery sky_battery_lower',gong:'sky_dronemaker sky_dropship',bursts:'sky_battleplane sky_drone sky_twin sky_airraid_twin sky_twin_lower sky_twin_upper'},
    frontyard:{imp:'tutorial_imp',surf:'duckytube'},birthday:{drop:'birthday_juggler',dynamite:'birthday_barrelroller birthday_barrel',arc:'birthday_jetpack'},
    sportz:{bind:'sportzball_wizard',boarding:'sportzball_balloon'},foodfight:{sweep:'foodfight_chefster',restore:'foodfight_gobbler_king',hunt:'foodfight_turkey'},
    valentines:{imp:'valentines_imp'},stpatricks:{surf:'stpatrick_dodo'},lunar:{dynamite:'lunar_superfanimp',board:'lunar_camel_onehump lunar_camel_segment'},
    easter:{bind:'easter_wizard',dynamite:'easter_egg'},feastivus:{gong:'feastivus_piano',boarding:'feastivus_swashbuckler',plate:'feastivus_poncho_plate'},
    summer:{boarding:'summer_bug',surf:'summer_bug_armor1 summer_bug_armor2'},halloween:{imp:'halloween_imp'}
  };
  const worlds=[],entries=[],regionMap=new Map(),species=new Map(),direct=new Map(),byRole=new Map();
  const auxiliary=new Set(['modern_moonflower_shield','future_protector_shield','future_infinut_shield','sky_twin_upper','sky_twin_lower','sky_battery_lower']);
  for(const [id,name,basic,featured,common,signature,color] of regions){
    const region={id,name,basic,featured,common,signature,color,entries:[]};
    worlds.push(region);regionMap.set(id,region);byRole.set(id,new Map());
  }
  for(const [id,world,zh] of gardenWorldSpecies)species.set(id,{id,world:world==='water'?'beach':world,name:zh});
  function add(region,id,shownName){
    const custom=Object.entries(overrides[region.id]||{}).find(([,types])=>types.split(' ').includes(id));
    const skill=custom?.[0]||(/gargantuar|zombossmech|_boss_/.test(id)?'heavy':/_flag/.test(id)?'flag':/_armor[1-4]$/.test(id)?'plate':/(?:^|_)imp$/.test(id)?'imp':region.common);
    const map=byRole.get(region.id);
    if(!map.has(skill)){
      const [name,trigger,effect,counter,interval]=skills[skill];
      const e={id:region.id+'/'+skill,world:region.id,worldName:region.name,name,trigger,effect,counter,interval,skill,types:[],units:[]};
      map.set(skill,e);region.entries.push(e);entries.push(e);
    }
    const entry=map.get(skill);entry.types.push(id);entry.units.push({id,name:shownName});direct.set(region.id+'/'+id,entry);
  }
  for(const s of species.values()){const r=regionMap.get(s.world);if(r&&!auxiliary.has(s.id))add(r,s.id,s.name);}
  // Modern Day intentionally reuses Front Yard infantry, with local street tactics.
  for(const s of species.values())if(s.world==='frontyard'&&s.id.startsWith('tutorial'))add(regionMap.get('modern'),s.id,s.name);
  function matchesForType(type){
    let id=String(type||'').trim().toLowerCase();
    if(id.startsWith('lawn'))id=id.replace(/^lawn/,'tutorial');
    return worlds.map(w=>direct.get(w.id+'/'+id)).filter(Boolean);
  }
  function forType(type,where){
    const all=matchesForType(type);
    if(where){const world=typeof where==='string'?where:identify(where);return all.find(entry=>entry.world===world)||null;}
    return all.find(entry=>entry.world===species.get(String(type||'').toLowerCase())?.world)||all[0]||null;
  }
  function forWorld(where){const id=typeof where==='string'?where:identify(where);return regionMap.get(id)?.entries||[];}
  const mod=id=>window.System.get('chunks:///_virtual/'+id+'.ts');
  const token=s=>String(s||'').replace(/^RTID\(([^@()]+)@[^)]+\)$/,'$1').toLowerCase();
  const stages=[
    [/^frontlawn|^tutorial/,'frontyard'],[/egypt/,'egypt'],[/pirate/,'pirate'],[/west/,'cowboy'],[/future/,'future'],[/dark/,'dark'],
    [/beach/,'beach'],[/iceage/,'ice'],[/lostcity/,'lostcity'],[/kongfu|monk|abbot/,'kongfu'],[/eighties/,'eighties'],
    [/dino/,'dino'],[/modern/,'modern'],[/sky|airraid/,'sky'],[/birthday/,'birthday'],[/sportz/,'sportz'],[/falls/,'foodfight'],
    [/valentin/,'valentines'],[/paddy/,'stpatricks'],[/lunar/,'lunar'],[/spring/,'easter'],[/feastivus/,'feastivus'],
    [/summer/,'summer'],[/halloween/,'halloween']
  ];
  const levelInfo=new WeakMap();
  function authored(level){
    const objects=level?.currentLevelObjects||[],aliases=new Map(),ids=new Set(),seen=new Set();
    for(const o of objects)for(const a of o.aliases||[])aliases.set(a.toLowerCase(),o);
    // Only descend through referenced waves. An unused off-world example in
    // CurrentLevel is not part of the level's authored wave population.
    function visit(o,depth){
      if(depth>9||o==null)return;
      if(typeof o==='string'){
        if(/^RTID\([^@]+@ZombieTypes\)$/i.test(o)){const id=token(o);if(species.has(id))ids.add(id);}
        else if(/^RTID\([^@]+@CurrentLevel\)$/i.test(o)){const ref=aliases.get(token(o));if(ref&&!seen.has(ref)){seen.add(ref);visit(ref.objdata,depth+1);}}
      }else if(typeof o==='object'){for(const v of Object.values(o))visit(v,depth+1);}
    }
    visit(level?.waveManagerProps?.Waves,0);
    const def=level?.levelDefinition?.objdata||level?.levelDefinition||{};
    if(def.IsDangerRoom)for(const m of def.Modules||[]){
      const room=aliases.get(token(m));
      if(room?.objclass==='DangerRoomModuleProperties')visit(room.objdata.LevelDesigners,0);
    }
    return {ids:[...ids],aliases};
  }
  function identify(level){
    if(!level)return null;
    if(levelInfo.has(level))return levelInfo.get(level).world;
    const def=level.levelDefinition?.objdata||level.levelDefinition||{},raw=token(def.StageModule),data=authored(level);
    const current=data.aliases.get(raw);
    const kinds=[raw,token(current?.objdata?.LawnBaseOn),token(level.lawnType?.LawnBaseOn)];
    let world=kinds.map(k=>stages.find(([match])=>match.test(k))?.[1]).find(Boolean);
    if(!world){
      // Mixed event lawns such as Arena, Farm and custom stages use the world most
      // represented in their own wave script. Generic lawn aliases have no vote.
      const votes=new Map();
      for(const id of data.ids){const w=species.get(id)?.world;if(regionMap.has(w))votes.set(w,1+(votes.get(w)||0));}
      world=[...votes].sort((a,b)=>b[1]-a[1])[0]?.[0];
    }
    if(!world){
      const id=token(mod('levelController')?.LevelPlay?.thisLevelsID?.[0]).replace(/[0-9_].*$/,'');
      world=regionMap.has(id)?id:stages.find(([match])=>match.test(id))?.[1]||'frontyard';
    }
    // Chooser and almanac may ask before the level's wave module has loaded.
    if(level.waveManagerProps?.Waves?.length||def.IsDangerRoom&&data.ids.length)levelInfo.set(level,{world,ids:data.ids});
    return world;
  }
  function reinforcement(level,index,slot,tile){
    if(!gardenChallenge.active(level))return null;
    const r=regionMap.get(identify(level));if(!r)return null;
    const authored=levelInfo.get(level)?.ids||[],safe=[r.basic,r.id==='pirate'?'pirate_captain':r.featured];
    // Ordinary infantry and independently spawned named specialists can stand
    // alone. Linked entities, boss mechanisms and prop children remain native wave-only.
    const extras=authored.filter(id=>direct.has(r.id+'/'+id)&&!safe.includes(id)&&
      (/_armor[12]$/.test(id)||/_flag$/.test(id)||['explorer','pirate_captain','prospector','dark_juggler','beach_snorkel',
        'lostcity_excavator','eighties_punk','dino_bully','iceage_hunter','kongfu_hammer','future_jetpack','sky_electric'].includes(id)));
    if(index%3===0&&slot===1)return safe[1];
    if((index+slot)%3===0||!extras.length)return safe[(index+slot)%2];
    return extras[(index+slot)%extras.length];
  }
  const life=new WeakMap(),runs=new WeakMap(),listeners=new Set();
  function reset(z,options){
    if(!z)return;
    life.set(z,{blocked:!!(options?.gardenHybrid||options?.gardenAlly||options?.gardenEventYeti),record:null});
  }
  function state(z){const r=life.get(z)?.record;return r&&foe(z)?r:null;}
  const foe=z=>z&&z.node?.activeInHierarchy&&!z.dead&&!z.hypnotized&&z.isAlive()&&z.isInLawn();
  const plant=p=>p&&p.node?.activeInHierarchy&&p.plantInLnC?.isInLawn()&&!p.dead&&p.health>0&&!p.invincible&&!p.fooding&&p.damagable!==false;
  const cell=u=>({r:u.plantInLnC?.lIndex??u.lIndex,c:u.plantInLnC?.cIndex??u.inLnC?.cIndex??u.cIndex});
  const distance=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.c-b.c));
  function resident(z,w){
    let id=String(z.Zombie_Type||'').toLowerCase();
    let match=direct.get(w+'/'+id);
    if(!match&&id.startsWith('lawn')){
      const trueId=mod('Zombies')?.zombies?.getZombieFeature?.(z.ID)?.CODENAME;
      if(trueId)match=direct.get(w+'/'+trueId);
      if(!match&&(w==='modern'||w==='frontyard')){id=id.replace(/^lawn/,'tutorial');match=direct.get(w+'/'+id);}
    }
    return match||null;
  }
  function notify(type,z,r){
    if(listeners.size)for(const fn of listeners)fn({type,z,entry:r.entry,aim:r.aim,phase:r.phase});
  }
  const D=(p,amount)=>{if(plant(p))p.dealDamage(amount*gardenChallenge.modifiers.damage,0);};
  const slow=(p,n,t)=>{if(plant(p))p.plantCDScaleSetter(n,t);};
  const boost=(z,m,t)=>{if(foe(z))z.pushSpeedStacked({SpeedMult:m,Duration:t});};
  const heal=(z,n)=>{if(foe(z))z.health=Math.min(z.toughness,z.health+n);};
  const vest=z=>typeof gardenChallengeArmor!=='undefined'?gardenChallengeArmor.state(z)?.vest:null;
  function mend(z,f){const v=vest(z);if(v?.hp>0)gardenChallengeArmor.repairVest(z,v.max*f);}
  function owned(s,z){return s.foes.filter(t=>t!==z&&life.get(t)?.record&&distance(cell(t),cell(z))<=2&&Math.abs(cell(t).r-cell(z).r)<=1);}
  function drawSignal(s,r){
    if(typeof gardenFxSettings!=='undefined'&&!gardenFxSettings.enabled)return;
    if(s.markers>=12||!r.aim)return;
    const cc=window.System.get(window.System.resolve('cc')),tile=mod('Square')?.Square?.getLnC(r.aim.r,r.aim.c),host=tile?.plantPoint;
    if(!host?.isValid||!cc?.Graphics)return;
    const n=new cc.Node('VeteranSignal');n.layer=host.layer;n.setParent(host);n.setPosition(0,2,0);
    const g=n.addComponent(cc.Graphics),color=new cc.Color().fromHEX(regionMap.get(r.entry.world).color);
    g.lineWidth=2.6;g.strokeColor=color;g.fillColor=new cc.Color(color.r,color.g,color.b,36);
    g.ellipse(0,0,25,10);g.fill();g.stroke();g.moveTo(-29,0);g.lineTo(-22,0);g.moveTo(22,0);g.lineTo(29,0);g.moveTo(0,-13);g.lineTo(0,-8);g.stroke();
    r.marker=n;s.markers++;
  }
  function clearSignal(s,r){if(r.marker){if(r.marker.isValid)r.marker.destroy();r.marker=null;s.markers--;}}
  function select(s,z,r){
    const skill=r.entry.skill,me=cell(z),partners=owned(s,z);
    const line=s.plants.filter(p=>cell(p).r===me.r&&cell(p).c<=me.c),last=line[line.length-1];
    const near=(range=3)=>line.find(p=>me.c-cell(p).c<=range);
    const wide=s.plants.filter(p=>Math.abs(cell(p).r-me.r)<=2&&cell(p).c<=me.c);
    const wallet=mod('SunCount')?.SunCount?.component?.CurrentValue||0;
    let target=null,ok=true;
    switch(skill){
      case 'imp':case 'board':ok=me.c<=(skill==='imp'?3:5)&&!r.spent;break;
      case 'stride':ok=partners.some(t=>cell(t).r===me.r);break;
      case 'flag':case 'gong':ok=partners.length>0;break;
      case 'restore':ok=partners.some(t=>t.health<t.toughness);break;
      case 'solar':ok=wallet>=20;break;
      case 'charge':ok=[z,...partners].some(t=>{const a=vest(t);return a&&a.hp>0&&a.hp<a.max;});break;
      case 'plate':{const a=vest(z);ok=!!a&&a.hp>0&&a.hp<a.max*.75;break;}
      case 'stance':ok=z.health<z.toughness*.72;break;
      case 'surf':target=line[0];ok=me.c<=5;break;
      case 'press':target=line[0];ok=z.health<z.toughness*.72;break;
      case 'tempo':target=line[0];ok=partners.length>0;break;
      case 'boarding':target=line[0];ok=line.length>=2;break;
      case 'dynamite':case 'dig':case 'bind':target=last;break;
      case 'ink':target=[...wide].sort((a,b)=>cell(a).c-cell(b).c)[0];break;
      case 'arc':case 'drop':case 'bursts':target=wide[0];break;
      case 'hunt':target=line.filter(p=>p.health<p.toughness*.65).sort((a,b)=>a.health/a.toughness-b.health/b.toughness)[0];break;
      case 'steal':target=near();ok=wallet>0;break;
      case 'dust':case 'rime':case 'wash':case 'heavy':case 'stomp':target=near(2);break;
      case 'curse':case 'glacier':target=near(4);break;
      default:target=near();break;
    }
    const targeted=!['imp','board','flag','stride','gong','restore','solar','charge','plate','stance'].includes(skill);
    if(!ok||targeted&&!target)return false;
    r.target=target;r.aim=target?cell(target):me;
    if(skill==='boarding')r.second=cell(last);
    return true;
  }
  function resolve(s,z,r){
    const a=r.aim,skill=r.entry.skill,all=s.plants.filter(plant),at=all.filter(p=>distance(cell(p),a)===0);
    const right=(n=1)=>all.filter(p=>cell(p).r===a.r&&Math.abs(cell(p).c-a.c)<=n);
    const column=()=>all.filter(p=>cell(p).c===a.c&&Math.abs(cell(p).r-a.r)<=1);
    const cross=()=>all.filter(p=>Math.abs(cell(p).r-a.r)+Math.abs(cell(p).c-a.c)<=1);
    const team=()=>owned(s,z).filter(foe).sort((x,y)=>distance(cell(x),cell(z))-distance(cell(y),cell(z)));
    const haste=(n,d,t)=>team().slice(0,n).forEach(u=>boost(u,d,t));
    const money=n=>{
      const wallet=mod('SunCount').SunCount.component,current=wallet?.CurrentValue||0,amount=Math.min(n,Math.max(0,current));
      if(amount)wallet.SunDec(amount,true,false);return Math.max(0,current-(wallet?.CurrentValue||0));
    };
    switch(skill){
      case 'stride':{const buddy=team().find(u=>cell(u).r===cell(z).r);if(buddy){boost(z,1.32,2.6);boost(buddy,1.32,2.6);}break;}
      case 'imp':boost(z,1.65,1.8);r.spent=true;break;
      case 'board':{boost(z,1.48,2);const front=team().filter(u=>cell(u).r===cell(z).r).sort((x,y)=>cell(x).c-cell(y).c)[0];if(front)boost(front,1.48,2);r.spent=true;break;}
      case 'dust':at.forEach(p=>slow(p,1.55,2.4));break;
      case 'solar':{const amount=money(35);if(amount){heal(z,amount);const patient=team().filter(u=>u.health<u.toughness).sort((x,y)=>x.health/x.toughness-y.health/y.toughness)[0];if(patient)heal(patient,amount);}break;}
      case 'boarding':for(const p of all){const where=cell(p);if(distance(where,a)===0||distance(where,r.second)===0){D(p,26);if(plant(p)&&distance(where,r.second)===0)p.setStun(.8);}}break;
      case 'trail':if(at.length){boost(z,1.42,2);at.forEach(p=>slow(p,1.45,2));}break;
      case 'dynamite':right().forEach(p=>D(p,distance(cell(p),a)===0?46:22));break;
      case 'charge':mend(z,.16);team().filter(u=>{const v=vest(u);return v?.hp>0&&v.hp<v.max;}).slice(0,2).forEach(u=>mend(u,.16));break;
      case 'arc':if(at.length){
        D(at[0],34);const second=cross().find(p=>cell(p).r!==a.r||cell(p).c!==a.c);
        if(second)D(second,22);
      }break;
      case 'curse':at.forEach(p=>slow(p,2,2.2));break;
      case 'bind':at.forEach(p=>p.setStun(2));break;
      case 'wash':all.filter(p=>cell(p).r===a.r&&[a.c,a.c-1].includes(cell(p).c)).forEach(p=>D(p,20));break;
      case 'surf':if(at.length){boost(z,1.6,2.8);at.forEach(p=>slow(p,1.7,2));}break;
      case 'rime':mod('Square').Square.getLnC(a.r,a.c)?.setPlantChillCD(2.8);break;
      case 'glacier':for(const c of [a.c-1,a.c,a.c+1]){
        if(c>=0&&c<=mod('Square').Square.MaxColumnIndex)mod('Square').Square.getLnC(a.r,c)?.setPlantChillCD(4);
      }at.forEach(p=>D(p,26));break;
      case 'steal':if(at.length&&money(20)>0)boost(z,1.4,2.5);break;
      case 'dig':at.forEach(p=>{D(p,40);slow(p,1.6,2.5);});break;
      case 'stance':heal(z,z.toughness*.07);boost(z,1.28,2);break;
      case 'gong':haste(3,1.45,3);break;
      case 'tempo':if(at.length&&team().length){haste(1,1.35,2.4);at.forEach(p=>slow(p,1.4,2));}break;
      case 'drop':cross().forEach(p=>{D(p,22);if(plant(p)&&distance(cell(p),a)===0)p.setStun(.8);});break;
      case 'hunt':if(plant(r.target)&&distance(cell(r.target),a)===0&&r.target.health<r.target.toughness*.65)D(r.target,30);break;
      case 'stomp':column().forEach(p=>{D(p,36);if(plant(p)&&distance(cell(p),a)===0)p.setStun(1.2);});break;
      case 'press':if(at.length){boost(z,1.5,2.5);at.forEach(p=>slow(p,1.45,1.8));}break;
      case 'ink':at.forEach(p=>{D(p,28);slow(p,2,3);});break;
      case 'bursts':at.forEach(p=>{D(p,22);slow(p,1.35,1.8);});break;
      case 'restore':{const injured=team().filter(t=>t.health<t.toughness).sort((x,y)=>x.health/x.toughness-y.health/y.toughness)[0];
        if(injured){heal(injured,injured.toughness*.09);boost(injured,1.20,2);}break;}
      case 'plate':mend(z,.28);break;
      case 'flag':haste(3,1.35,2.7);break;
      case 'heavy':right().forEach(p=>D(p,distance(cell(p),a)===0?54:24));break;
      case 'sweep':column().forEach(p=>D(p,26));break;
    }
  }
  function tick(level,dt){
    if(!(dt>0)||!level?.gaming||!gardenChallenge.active(level)||mod('UI').UIInGame.component?.paused)return;
    let s=runs.get(level);
    if(!s){s={world:identify(level),time:0,scan:0,serial:0,markers:0,watched:new Map(),plants:[],foes:[]};runs.set(level,s);}
    s.time+=dt;if(s.scan>s.time)return;s.scan=s.time+.16;
    const cm=mod('CharacterManager');
    s.foes=cm.ZombiePool.pool().filter(foe);
    s.plants=cm.PlantPool.pool().filter(plant).sort((a,b)=>cell(b).c-cell(a).c);
    const present=new Set(s.foes);
    for(const [z,r] of s.watched)if(!present.has(z)||life.get(z)?.record!==r){
      clearSignal(s,r);s.watched.delete(z);
      if(life.get(z)?.record===r)life.get(z).record=null;
    }
    for(const z of s.foes){
      const bind=life.get(z);if(!bind||bind.blocked||!z._gardenChallengeHostile||z._gardenHybridKind||z._gardenEventYeti)continue;
      let r=bind.record;
      if(!r){
        const e=resident(z,s.world);if(!e)continue;
        r={entry:e,phase:'ready',due:s.time+1.2+(s.serial++%9)*.16,aim:null,second:null,target:null,spent:false};
        bind.record=r;s.watched.set(z,r);
      }
      if(r.marker&&typeof gardenFxSettings!=='undefined'&&!gardenFxSettings.enabled)clearSignal(s,r);
      const disabled=z.freeze>0||z.stunned>0||z.butterStun>0||z.knockBackTween?.running||z.changeLaneTween?.running||z.hypnotized;
      if(disabled||z.invincible){
        if(r.phase==='windup'){clearSignal(s,r);r.phase='ready';r.due=s.time+1.8;notify('cancel',z,r);}
        continue;
      }
      if(r.due>s.time||r.spent)continue;
      if(r.phase==='windup'){
        clearSignal(s,r);r.phase='ready';r.due=s.time+r.entry.interval;
        if(r.row===cell(z).r){resolve(s,z,r);notify('impact',z,r);}else notify('cancel',z,r);
        r.target=null;r.second=null;r.aim=null;continue;
      }
      if(!select(s,z,r)){r.due=s.time+.54;continue;}
      r.phase='windup';r.row=cell(z).r;r.due=s.time+1.05;
      drawSignal(s,r);notify('windup',z,r);
    }
  }
  return Object.freeze({worlds,entries,forType,matchesForType,forWorld,identify,reinforcement,tick,reset,state,
    subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}});
})();
