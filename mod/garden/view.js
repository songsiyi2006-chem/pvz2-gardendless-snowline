function mountGarden() {
  const host=document.createElement("div");
  host.id="pvz-greenhouse";
  document.body.append(host);
  const root=host.attachShadow({mode:"open"});
  const icon=(path,n=18)=>'<svg width="'+n+'" height="'+n+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const sprig=icon('<path d="M5 20c0-6 6-11 13-15M8 15C4 14 3 11 3 8c5 0 7 2 7 5M11 11c-1-6 3-9 10-9 0 7-3 11-10 9Z"/>');
  const seed=icon('<path d="M12 3c1 4 6 5 6 10 0 4-3 7-6 8-4-1-6-4-6-8 0-5 4-6 6-10Z"/><path d="M12 10v8"/>',15);
  const searchIcon=icon('<circle cx="10.5" cy="10.5" r="6.3"/><path d="m16 16 5 5"/>',15);
  const lock=icon('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',12);
  const roman=["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ"], words=["零","一","二","三","四","五","六"];
  const worlds={frontyard:"初始草坪",egypt:"古埃及",pirate:"海盗港湾",cowboy:"狂野西部",future:"遥远未来",dark:"黑暗时代",water:"水生植物",beach:"巨浪沙滩",ice:"冰河世界",lostcity:"失落之城",eighties:"炫光魔音游",dino:"侏罗纪沼泽",modern:"摩登世界",kongfu:"功夫世界",sky:"天空之城",epic:"史诗任务",market:"商店",mint:"薄荷家族",lod:"每日关卡"};
  const css=document.createElement("style");css.textContent=gardenStyles;root.append(css);
  const view=document.createElement("div"); root.append(view);
  view.innerHTML='<button class="entry" type="button" hidden>'+sprig+'升阶温室</button>'+
    '<div class="shade" hidden><section class="book" role="dialog" aria-modal="true" aria-label="升阶温室"><header class="top"><div class="emblem">'+sprig+'</div><h1>升阶温室</h1><div class="balance"><button type="button" title="查看通关点数规则" aria-expanded="false">'+seed+'升阶点 <strong>0</strong></button><div class="rule" hidden><b>通关奖励</b><div class="rewardgrid"></div><p>内置关卡每次正常获胜，按开局难度结算。重玩可再得点。</p></div></div><button type="button" class="close" aria-label="关闭温室">'+icon('<path d="m6 6 12 12M18 6 6 18"/>',20)+'</button></header>'+
    '<div class="body"><aside class="side"><label class="find">'+searchIcon+'<input type="search" aria-label="搜索植物" placeholder="搜索植物"></label><div class="filter"><button type="button" data-owned="1">已拥有</button><button type="button" data-owned="0">全部</button></div><div class="list" aria-label="植物列表"></div></aside>'+
    '<section class="detail"><div class="plate"><canvas aria-label="温室植物绘图"></canvas></div><div class="copy"><div class="plant-title"><div><span class="origin"></span><h2></h2></div><span class="rank"></span></div><div class="steps" aria-label="查看各阶效果"></div><div class="base-stats"><span class="stat-caption"></span><span>伤害 <b data-stat="damage"></b></span><span>攻速 <b data-stat="attackSpeed"></b></span><span>生命 <b data-stat="health"></b></span></div><div class="stage"><h3></h3><p></p></div><div class="actions"><span class="hint"></span><button type="button" class="buy"></button></div></div></section></div></section></div><div class="toast" role="status" aria-live="polite" hidden><b></b><small></small></div>';
  const $=s=>root.querySelector(s);
  const skillValues=document.createElement("details");
  skillValues.className="skill-values";
  skillValues.innerHTML='<summary>本阶招式数值</summary><dl><dt>主招</dt><dd></dd><dt>副招</dt><dd></dd></dl>';
  $(".stage").append(skillValues);
  const modeBox=document.createElement("section");
  modeBox.className="mode-box";modeBox.hidden=true;
  modeBox.innerHTML='<div class="mode-tabs" role="group" aria-label="六阶模式"></div><p class="mode-description" aria-live="polite"></p>';
  $(".stage").append(modeBox);
  const masteryBox=document.createElement('section');masteryBox.className='mastery-panel';
  masteryBox.innerHTML='<header><b>技能专精</b><span class="mastery-level"></span><label><input type="checkbox" class="mastery-fx"> 专精光效</label></header><ol></ol><div class="mastery-shop"><span></span><button type="button">解锁专精</button></div>';
  modeBox.append(masteryBox);
  const masteryFx=masteryBox.querySelector('input');masteryFx.checked=gardenModeMastery.fx;
  masteryFx.onchange=()=>gardenModeMastery.setFX(masteryFx.checked);
  let masteryQuote=null,lastMastery=-Infinity;
  function showMastery(p,index,opt,rank){
    const held=gardenEconomy.mastery(p.id,index,owner),home=gardenEconomy.read(owner),wallet=gardenChallengeRewards.wallet(owner);
    masteryBox.querySelector('.mastery-level').textContent=held+'/4';
    masteryFx.checked=gardenModeMastery.fx;
    masteryBox.querySelector('ol').replaceChildren(...[1,2,3,4].map(n=>{
      const detail=gardenModeMastery.describe(opt,n),li=document.createElement('li'),title=document.createElement('strong'),note=document.createElement('span');
      title.textContent=['Ⅰ ','Ⅱ ','Ⅲ ','Ⅳ '][n-1]+detail.name;note.textContent=detail.description;li.dataset.owned=String(n<=held);
      li.append(title,note);return li;
    }));
    const shop=masteryBox.querySelector('.mastery-shop'),btn=shop.querySelector('button'),cost=gardenModeMastery.price[held];
    shop.hidden=!cost;masteryQuote=null;
    if(!cost)return;
    const affordable=home.points>=cost.points&&wallet.gem>=cost.gem&&wallet.coin>=cost.coin;
    shop.querySelector('span').textContent=cost.points+' 升阶点 · '+cost.gem+' 钻石 · '+cost.coin+' 金币';
    btn.disabled=rank!==6||!affordable;
    btn.textContent=rank!==6?'需自有六阶':affordable?'研习 '+['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][held]:'资源不足';
    btn.title='当前拥有 '+home.points+' 升阶点、'+wallet.gem+' 钻石、'+wallet.coin+' 金币';
    masteryQuote={id:p.id,index,held,owner};
  }
  masteryBox.querySelector('.mastery-shop button').onclick=e=>{
    e.stopPropagation();
    const q=masteryQuote;
    if(!q||e.currentTarget.disabled||performance.now()-lastMastery<450||!available()||q.owner!==gardenEconomy.profile()||
       q.id!==selected?.id||q.index!==gardenEconomy.mode(q.id))return;
    try{
      if(gardenEconomy.buyMastery(q.id,q.index,q.held,q.owner)){
        lastMastery=performance.now();tell(gardenModes.options(q.id)[q.index].name+' · 专精 '+['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][q.held],'已保存，模仿者继承目标的专精。');
      }
      paintDetail();
    }catch(err){tell('专精未保存','三种资源已恢复，可重新研习。');console.error('[Greenhouse] mastery',err);}
  };
  const critLine=document.createElement("span");critLine.className="crit-stat";$(".base-stats").append(critLine);
  const training=document.createElement("p");
  training.className="training";$(".rewardgrid").after(training);
  const totalBadge=document.createElement("span");
  totalBadge.className="layer-count";$(".balance").before(totalBadge);
  const convert=document.createElement('p');
  convert.className='conversion';$(".base-stats").after(convert);
  let current,owner,ownedOnly=true,selected,preview=0,previewMode=0,toastTimer,displayedRank,displayedLayers,focusBefore,lastPurchase=-Infinity,chooser=false;
  const atlas=new Image();atlas.src=gardenArt.src;
  let visibleRows=[];
  const cache=new Map();
  function thumb(id) {
    const plan=gardenCompatible.get(id);
    if(plan?.numericOnly&&!gardenArt.rects[id]&&!cache.has(id)){
      if(plan.card!==id&&gardenArt.rects[plan.card])return thumb(plan.card);
      const c=document.createElement('canvas');c.width=c.height=76;
      const t=c.getContext('2d'),g=t.createLinearGradient(12,62,62,12);g.addColorStop(0,'#327255');g.addColorStop(1,'#a6cc76');
      t.fillStyle=g;t.beginPath();t.moveTo(16,61);t.bezierCurveTo(8,30,37,18,64,13);t.bezierCurveTo(61,42,46,68,16,61);t.fill();
      t.strokeStyle='#d0deb2';t.lineWidth=2;t.beginPath();t.moveTo(12,66);t.quadraticCurveTo(35,45,53,24);t.moveTo(27,51);t.lineTo(26,36);t.moveTo(36,41);t.lineTo(48,39);t.stroke();cache.set(id,c.toDataURL());
    }
    if(!cache.has(id)&&atlas.complete&&atlas.naturalWidth){
      const c=document.createElement("canvas"),r=gardenArt.rects[id];if(!r)return "";
      c.width=c.height=76;const t=c.getContext("2d"),f=Math.min(72/r[2],72/r[3]);const w=f*r[2],h=f*r[3];t.drawImage(atlas,...r,(76-w)/2,(76-h)/2,w,h);cache.set(id,c.toDataURL());
    }
    return cache.get(id)||"";
  }
  const displayName=p=>{
    const variant={alpha:"α",beta:"β",gamma:"γ",delta:"δ",epsilon:"ε"}[p.id.split("powerplant_")[1]];
    return p.name+(variant&&!p.name.includes(variant)?" · "+variant:"");
  };
  function tell(title,body) {
    $(".toast b").textContent=title;$(".toast small").textContent=body;
    $(".toast").hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$(".toast").hidden=true,3300);
  }
  gardenEconomy.onNotice(tell);
  function filterRows() {
    gardenCompatible.refresh();
    const q=$(".find input").value.trim().toLowerCase();
    return gardenCatalogue.filter(p=>(!chooser||eligible(p.id))&&(!ownedOnly||gardenEconomy.owns(owner,p.id))&&
      (!q||[displayName(p),p.id,worlds[p.world],gardenHome[p.id]].filter(Boolean).some(v=>v.toLowerCase().includes(q))));
  }
  function choose(id) {
    selected=gardenCatalogue.find(p=>p.id===id);
    preview=selected?Math.min(5,gardenEconomy.rank(id)):0;
    previewMode=selected?gardenEconomy.mode(id):0;
    for(const n of $(".list").querySelectorAll("button"))n.setAttribute("aria-current",String(n.dataset.id===id));
    paintDetail();
  }
  function paintList() {
    visibleRows=filterRows();
    const list=$(".list");const fragment=document.createDocumentFragment();
    $(".filter").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.owned==="1")===ownedOnly)));
    for(const p of visibleRows){
      const unlocked=gardenEconomy.owns(owner,p.id),rank=gardenEconomy.rank(p.id),b=document.createElement("button");
      const copiesRank=p.id==="imitater";
      b.type="button";b.className="item"+(unlocked?"":" locked");b.dataset.id=p.id;b.setAttribute("aria-current",String(p.id===selected?.id));b.setAttribute("aria-label",displayName(p)+(unlocked?(copiesRank?"，继承目标阶数":"，"+words[rank]+"阶"):"，未解锁"));
      const img=document.createElement("img");img.className="art";img.alt="";const src=thumb(p.id);if(src)img.src=src;
      const name=document.createElement("span");name.className="pname";name.textContent=displayName(p);
      const tag=document.createElement("span");tag.className="mark";if(unlocked)tag.textContent=copiesRank?"随目标":rank?roman[rank-1]:"";else tag.innerHTML=lock;
      b.append(img,name,tag);fragment.append(b);
    }
    if(!visibleRows.length){const e=document.createElement("p");e.className="missing";e.textContent=$(".find input").value?"没有找到这株植物。":"当前存档还没有可升阶的植物。";fragment.append(e)}
    list.replaceChildren(fragment);
    if(!visibleRows.some(p=>p.id===selected?.id))choose(visibleRows[0]?.id);else paintDetail();
  }
  function paintDetail() {
    const p=selected;
    $(".detail").hidden=!p;
    $(".balance strong").textContent=String(gardenEconomy.read(owner).points);
    const layers=gardenEconomy.trainingCount(owner);
    displayedLayers=layers;
    const pct=n=>Number((n*100).toFixed(2))+'%';
    totalBadge.textContent='全队培养 '+layers+' 层';totalBadge.hidden=chooser;
    training.textContent='全队培养 '+layers+' 层 · 攻速 +'+pct(layers*gardenTrainingSpeed)+' · 生命 +'+pct(layers*.03);
    if(!p)return;
    const rank=gardenEconomy.rank(p.id), has=gardenEconomy.owns(owner,p.id), points=gardenEconomy.read(owner).points;
    displayedRank=rank;
    $(".plant-title h2").textContent=displayName(p);$(".origin").textContent=gardenHome[p.id]||worlds[p.world]||p.world;
    const copiesRank=p.id==="imitater";
    $(".detail").classList.toggle('with-modes',preview===5&&!copiesRank&&!p.numericOnly);
    $(".rank").textContent=has?(copiesRank?"随目标":rank?words[rank]+"阶":"未升阶"):"未解锁";
    for(const selector of [".steps",".base-stats",".actions"])$(selector).hidden=copiesRank||chooser;
    modeBox.hidden=copiesRank||p.numericOnly||preview!==5;
    convert.hidden=true;
    if(copiesRank){
      skillValues.open=false;skillValues.hidden=true;
      $(".stage h3").textContent="复制目标的阶数";
      $(".stage p").textContent="选卡时指定目标。模仿者继承目标的有效阶数、属性、招式、六阶模式及对应技能专精。";
      $(".buy").disabled=true;
      drawGardenPlate($(".plate canvas"),null,p,0,atlas,gardenArt.rects);
      return;
    }
    const stages=document.createDocumentFragment();
    roman.forEach((num,i)=>{const b=document.createElement("button");b.type="button";b.dataset.stage=i;b.className=i<rank?"done":"";b.setAttribute("aria-pressed",String(i===preview));b.setAttribute("aria-label","查看第"+words[i+1]+"阶");b.textContent=num;stages.append(b)});
    $(".steps").replaceChildren(stages);
    const bonuses=gardenEffectiveStats(preview+1,p.id,rank===6?undefined:previewMode);
    const labels=typeof gardenFunctional!=='undefined'?gardenFunctional.statLabels?.(p.id):null;
    $(".stat-caption").textContent=words[preview+1]+"阶 · 含全队加成";
    for(const stat of root.querySelectorAll("[data-stat]")){
      const key=stat.dataset.stat;
      stat.parentNode.firstChild.textContent=(labels?.[key]||{damage:'伤害',attackSpeed:'攻速',health:'生命'}[key])+' ';
      stat.textContent="+"+pct(bonuses[stat.dataset.stat]-1);
    }
    critLine.textContent='伤害暴击 '+Math.round((bonuses.critChance??.05)*100)+'% ×'+(bonuses.critMultiplier??1.5).toFixed(1);
    critLine.title='植物的伤害命中可暴击。F-22 供能侦察使暴击率增加 12 个百分点，攻击及行动速度提高 15%。';
    const notes=typeof gardenFunctional!=='undefined' ? gardenFunctional.summary(p.id) : '';
    convert.textContent=notes||'';convert.hidden=chooser||!notes;
    const tier=p.tiers[preview];
    $(".stage h3").textContent=tier.name;$(".stage p").textContent=tier.description;
    const numbers=p.previews?.[preview];
    skillValues.hidden=preview<2||preview===5||!numbers;
    skillValues.open=false;
    if(numbers){
      const [primary,secondary]=skillValues.querySelectorAll("dd");
      primary.textContent=numbers.primary;secondary.textContent=numbers.secondary;
    }
    if(!modeBox.hidden){
      const choices=gardenModes.options(p.id);
      const active=rank===6?gardenEconomy.mode(p.id):previewMode;
      const tabset=modeBox.querySelector('.mode-tabs');
      $(".stage h3").textContent=chooser?'选择战斗模式':'六阶 · 自选模式';
      $(".stage p").textContent=rank===6?'选择后立即保存，模仿者随目标使用同一模式。':'升至六阶后可以启用其中一种模式。';
      tabset.replaceChildren(...choices.map((opt,i)=>{
        const b=document.createElement('button');b.type='button';b.dataset.mode=i;
        b.textContent=opt.name;b.setAttribute('aria-pressed',String(active===i));return b;
      }));
      modeBox.querySelector('.mode-description').textContent=choices[active].description;
      showMastery(p,active,choices[active],rank);
    }
    const cost=gardenEconomy.prices[rank], buy=$(".buy"), hint=$(".hint");
    buy.disabled=!has||rank===6||preview!==rank||points<cost;
    if(!has){buy.textContent="尚未解锁";hint.textContent="获得这株植物后可以升阶。"}
    else if(rank===6&&preview===5){
      const cost=gardenEconomy.prices[5];
      buy.textContent="继续培养 · "+cost+" 点";buy.disabled=points<cost;
      hint.textContent="每次增加一层全队加成，可重复培养。";
    }
    else if(rank===6){buy.textContent="已掌握";hint.textContent=p.numericOnly?"六阶基础强化已生效。":"当前模式 · "+gardenModes.options(p.id)[gardenEconomy.mode(p.id)].name}
    else if(preview<rank){buy.textContent="已掌握";hint.textContent="该阶效果已生效。"}
    else if(preview>rank){buy.textContent="需逐阶解锁";hint.textContent="下一次可升至"+words[rank+1]+"阶。"}
    else{buy.textContent="升至"+words[rank+1]+"阶 · "+cost+" 点";hint.textContent=points<cost?"还差 "+(cost-points)+" 点":"升阶后保留之前各阶效果。"}
    drawGardenPlate($(".plate canvas"),null,p,rank,atlas,gardenArt.rects);
  }
  const rewardBox=$(".rewardgrid");
  gardenEconomy.rewards.forEach((val,i)=>{const s=document.createElement("span");s.append("难度 "+roman[i]);const b=document.createElement("b");b.textContent="+"+val;s.append(b);rewardBox.append(s)});
  function chooserCards() {
    if(gardenChallenge.active())return null;
    const get=n=>window.System?.get?.('chunks:///_virtual/'+n+'.ts');
    const l=get('levelController')?.LevelPlay?.component,c=get('Cards')?.Cards?.component;
    return !l?.gameStarted&&c?.laid&&c.seedChooser?.node?.activeInHierarchy&&!gardenFixed.inLevel()?c:null;
  }
  function eligible(id){
    if(gardenCompatible.numeric(id)||gardenEconomy.rank(id)!==6)return false;
    const cards=chooserCards();
    return !!cards?.seedChooser?.CFs?.some(f=>!f.ca?.disallowed&&f.Type===id);
  }
  function available() {
    const p=gardenEconomy.profile(),cc=window.System?.get?.(window.System.resolve("cc"));
    const scene=cc?.director?.getScene?.()?.name;
    if(!p||!scene)return null;
    if(scene!=="inGameScene")return 'outside';
    const c=chooserCards();
    return c?.seedChooser.CFs?.some(f=>!f.ca?.disallowed&&!gardenCompatible.numeric(f.Type)&&gardenEconomy.rank(f.Type)===6)?'chooser':null;
  }
  function close() {$(".shade").hidden=true;$(".rule").hidden=true;$(".balance button").setAttribute("aria-expanded","false");if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});if(!$(".entry").hidden)$(".entry").focus({preventScroll:true})}
  function sync() {
    const context=available(),now=context?gardenEconomy.profile():null,b=$(".entry");
    b.hidden=!now;
    const picking=context==='chooser';
    if(!$(".shade").hidden && (owner!==now||!now||chooser!==picking))close();
    if(chooser!==picking||!b.dataset.bound){
      chooser=picking;b.dataset.bound="1";b.classList.toggle('at-chooser',chooser);
      b.innerHTML=sprig+(chooser?'六阶模式':'升阶温室');
      $(".book").classList.toggle('at-chooser',chooser);
      $(".top h1").textContent=chooser?'六阶模式':'升阶温室';
      $(".balance").hidden=chooser;$(".filter").hidden=chooser;
    }
    if(now&&current!==now)gardenEconomy.read(now);
    current=now;
  }
  $(".entry").addEventListener("click",()=>{
    sync();if(!current)return;
    owner=current;ownedOnly=true;$(".find input").value="";focusBefore=document.activeElement;
    const kept=selected&&gardenEconomy.owns(owner,selected.id)&&(!chooser||eligible(selected.id));
    if(!kept)selected=gardenCatalogue.find(p=>p.id==="cabbagepult"&&gardenEconomy.owns(owner,p.id));
    if(chooser&&!eligible(selected?.id))selected=gardenCatalogue.find(p=>eligible(p.id));
    preview=selected?Math.min(5,gardenEconomy.rank(selected.id)):0;
    previewMode=selected?gardenEconomy.mode(selected.id):0;
    $(".shade").hidden=false;paintList();$(".close").focus({preventScroll:true});
  });
  $(".shade").addEventListener("click",e=>{if(e.target===$(".shade"))close()});
  $(".close").onclick=close;
  $(".balance button").onclick=()=>{const r=$(".rule");r.hidden=!r.hidden;$(".balance button").setAttribute("aria-expanded",String(!r.hidden))};
  $(".filter").onclick=e=>{const b=e.target.closest("button");if(b){ownedOnly=b.dataset.owned==="1";paintList()}};
  $(".find input").oninput=paintList;
  $(".list").onclick=e=>{const b=e.target.closest("button");if(b)choose(b.dataset.id)};
  $(".steps").onclick=e=>{const b=e.target.closest("button");if(b){preview=Number(b.dataset.stage);paintDetail();$(".steps [aria-pressed=true]").focus({preventScroll:true})}};
  modeBox.onclick=e=>{
    const b=e.target.closest('[data-mode]');if(!b||!selected||!available()||gardenEconomy.profile()!==owner)return;
    const index=Number(b.dataset.mode);
    try {
      if(displayedRank===6){
        if(!gardenEconomy.chooseMode(selected.id,index))return;
        if(chooser)gardenCombatStats.refreshMode(selected.id);
      }
      previewMode=index;paintDetail();
      modeBox.querySelector('[data-mode="'+index+'"]')?.focus({preventScroll:true});
    } catch(err){tell("模式未保存","请重试。");console.error("[Greenhouse]",err)}
  };
  $(".buy").onclick=()=>{
    if(!selected||available()!=='outside'||gardenEconomy.profile()!==owner||$(".buy").disabled||performance.now()-lastPurchase<450)return;
    if(displayedRank===6&&preview===5){
      try{
        if(gardenEconomy.trainAgain(selected.id,displayedLayers)){
          lastPurchase=performance.now();paintDetail();tell("全队培养 +1 层",training.textContent);
        }
      }catch(e){tell("培养未保存","请检查磁盘空间后重试。");console.error("[Greenhouse]",e)}
      return;
    }
    if(displayedRank!==preview)return;
    try{if(gardenEconomy.buy(selected.id,displayedRank)){
      lastPurchase=performance.now();
      tell(displayName(selected)+" · "+words[displayedRank+1]+"阶",selected.tiers[preview].name);
      preview=Math.min(5,displayedRank+1);paintList();
    }}catch(e){tell("升阶未保存","请检查磁盘空间后重试。");console.error("[Greenhouse]",e)}
  };
  function modalKey(e) {
    if($(".shade").hidden)return;
    const active=root.activeElement;
    e.stopImmediatePropagation();
    if(e.type!=="keydown")return;
    if(e.key==="Escape"){e.preventDefault();if(!$(".rule").hidden){$(".rule").hidden=true;$(".balance button").setAttribute("aria-expanded","false")}else close()}
    if(e.key==="Tab"){
      const tabStops=[...root.querySelectorAll(".shade button:not(:disabled),.shade input,.shade summary")].filter(x=>x.getClientRects().length);
      if(!tabStops.length)return;
      if(e.shiftKey&&active===tabStops[0]){e.preventDefault();tabStops.at(-1).focus()}
      else if(!e.shiftKey&&active===tabStops.at(-1)){e.preventDefault();tabStops[0].focus()}
    }
  }
  window.addEventListener("keydown",modalKey,true);window.addEventListener("keyup",modalKey,true);
  atlas.addEventListener("load",()=>{if(!$(".shade").hidden)paintList()});
  new ResizeObserver(()=>{if(!$(".shade").hidden&&selected)drawGardenPlate($(".plate canvas"),null,selected,gardenEconomy.rank(selected.id),atlas,gardenArt.rects)}).observe($(".plate"));
  sync();setInterval(sync,450);mountGardenOperations(root,tell);
}
