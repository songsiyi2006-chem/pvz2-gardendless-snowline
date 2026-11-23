function mountGardenOperations(root,tell){
  const ui=document.createElement('div');root.append(ui);
  const emblems={
    shop:'<path d="M3 17.5 12 22l9-4.5M3 13l9 4.5 9-4.5M3 8.5 12 4l9 4.5-9 4.5z"/><path d="M12 12V5"/>',
    flake:'<path d="M12 2v20 M3.4 7l17.2 10 M3.4 17l17.2-10 M9 4l3 3 3-3 M9 20l3-3 3 3 M4 10l4-1-1-4 M17 19l-1-4 4-1 M4 14l4 1-1 4 M17 5l-1 4 4 1"/>',
    gem:'<path d="m3 8 4-5h10l4 5-9 13z M3 8h18 M8 8l4 13 4-13-4-5z"/>',
    x:'<path d="m6 6 12 12M18 6 6 18"/>',
    cross:'<circle cx="12" cy="12" r="7"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/>',
    dice:'<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="currentColor" stroke="none"><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/></g>',
    owl:'<path d="m2 3 6 4 4-2 4 2 6-4-2 8 1 3-9 7-9-7 1-3z"/><path d="m5 10 4 1 2 3-4-1zm14 0-4 1-2 3 4-1zM11 16l1 2 1-2"/>'
  };
  const icon=(key,size=18)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+emblems[key]+'</svg>';
  ui.innerHTML='<button type="button" class="ops-launch ops-shop" hidden>'+icon('shop')+'庭院工坊</button><button type="button" class="ops-launch ops-intel" hidden>挑战图鉴</button><button type="button" class="ops-launch ops-expedition" hidden>'+icon('flake')+'雪线挑战</button><div class="ops-battery" role="group" aria-label="重装部署"></div><div class="ops-shade" hidden><section class="ops-book" role="dialog" aria-modal="true" aria-labelledby="ops-heading"><header class="ops-head"><i></i><h1 id="ops-heading"></h1><span class="ops-wallet"></span><button type="button" class="ops-close" aria-label="关闭">'+icon('x',21)+'</button></header><div class="ops-content"></div></section></div>';
  const $=s=>ui.querySelector(s), content=$('.ops-content'),shade=$('.ops-shade'),book=$('.ops-book');
  const tyrantNames=['雪线挑战','铁血枭雄','铁血枭雄（噩梦）'];
  const battlefield=document.createElement('div');battlefield.className='ops-tyrant-field';battlefield.hidden=true;
  const battleLabel=document.createElement('span');battleLabel.className='ops-tyrant-label';
  battleLabel.innerHTML=icon('owl',19)+'<b></b>';battlefield.append(battleLabel);shade.before(battlefield);
  function theme(node,tier){
    if(tier){if(node.dataset.tyrant!==String(tier))node.dataset.tyrant=String(tier);}
    else if(node.hasAttribute('data-tyrant'))node.removeAttribute('data-tyrant');
  }
  gardenStarterGift.mount(root,tell);
  const loadoutButton=document.createElement('button');loadoutButton.type='button';loadoutButton.className='ops-launch ops-loadout';loadoutButton.hidden=true;
  loadoutButton.innerHTML=icon('shop',16)+'战前装备';shade.before(loadoutButton);
  const talentTab=document.createElement('button');talentTab.type='button';talentTab.className='ops-talent-tab';talentTab.hidden=true;$('.ops-wallet').before(talentTab);
  const simLaunch=document.createElement('button');simLaunch.type='button';simLaunch.className='ops-launch ops-map-simulation';
  simLaunch.hidden=true;simLaunch.innerHTML=icon('cross',16)+'植物模拟';shade.before(simLaunch);
  const catalog=gardenArsenal.catalog, byId=new Map(catalog.map(i=>[i.id,i])),plantById=gardenCompatible;
  const atlas=new Image();atlas.src=gardenArt.src;const thumbs=new Map(),portraits=new Map();
  let page='',owner=null,scene=null,filter='全部',selected='sniper',viewTier=0,viewForm='',plant='',busy=false,lastTrigger=null;
  let extraCount=0,extraDraft=['',''],trainingDraft={},tacticDraft={};
  let simulationDraft=null,mapPlant='',talent='nursery';
  const system=()=>window.System, get=n=>system()?.get('chunks:///_virtual/'+n+'.ts');
  const currentScene=()=>system()?.get(system().resolve('cc'))?.director?.getScene?.();
  const actual=()=>gardenChallenge.active(),config=()=>gardenChallenge.canConfigure();
  function gearImage(gear,tier,form=tier>=5?(gear.id==='sniper'?gardenArmory.sniperForm():gear.id==='rotary'?gardenArmory.rotaryForm():''):''){
    const key=gear.id+'/'+tier+form;
    if(!thumbs.has(key)){const c=document.createElement('canvas');drawGardenEquipment(c,gear,true,tier,form);thumbs.set(key,c.toDataURL());}
    return thumbs.get(key);
  }
  function portrait(id){
    if(!portraits.has(id)&&atlas.complete&&atlas.naturalWidth&&gardenArt.rects[id]){
      const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),r=gardenArt.rects[id],s=81/Math.max(r[2],r[3]);
      g.drawImage(atlas,...r,(96-r[2]*s)/2,(96-r[3]*s)/2,r[2]*s,r[3]*s);portraits.set(id,c.toDataURL());
    }
    return portraits.get(id)||'';
  }
  function close(){
    shade.hidden=true;theme(shade,0);page='';owner=null;scene=null;if(lastTrigger?.isConnected&&!lastTrigger.hidden)lastTrigger.focus({preventScroll:true});
  }
  function open(next,trigger){
    gardenCompatible.refresh();
    if(busy)return;
    lastTrigger=trigger;scene=currentScene();owner=gardenEconomy.profile();if(!owner)return;
    theme(shade,0);
    page=next;shade.hidden=false;book.classList.toggle('ops-ice',page==='challenge');book.classList.toggle('ops-simulation-book',page==='simulation');book.classList.toggle('ops-talents-book',page==='talents');book.classList.toggle('ops-loadout-book',page==='loadout');
    $('.ops-head i').innerHTML=icon(['shop','talents','loadout'].includes(page)?'shop':page==='simulation'?'cross':'flake',25);
    talentTab.hidden=!['shop','talents'].includes(page);talentTab.textContent=page==='talents'?'返回工坊':'植物天赋树';
    $('#ops-heading').textContent=page==='shop'?'庭院工坊':page==='loadout'?'战前装备':page==='intel'?'挑战图鉴':page==='simulation'?'植物模拟':page==='talents'?'植物天赋树':'雪线挑战';
    if(page==='loadout')loadout();else if(page==='shop')shop();else if(page==='talents')talents();else if(page==='intel')openIntel();else if(page==='simulation'){
      simulationDraft=gardenChallenge.mapSimulation();mapPlant='';simulationPage();
    }else {
      simulationDraft=gardenChallenge.draftSimulation();tacticDraft={};
      const extras=gardenChallenge.extras();extraCount=extras.length;extraDraft=[extras[0]||'',extras[1]||''];trainingDraft=gardenChallenge.training();challenge();
    }
    $('.ops-close').focus({preventScroll:true});
  }
  function inventory(){return gardenArmory.inventory();}
  function loadout(){
    const level=get('levelController')?.LevelPlay?.component,inv=inventory(),restricted=gardenFixed.noSunProduction(level);
    const using=gardenFixed.equipment(level,inv.equipped);
    $('.ops-wallet').textContent=actual()?'雪线挑战':'普通冒险';
    const body=document.createElement('div');body.className='ops-prep-list';
    if(restricted){const p=document.createElement('p');p.className='ops-prep-note';p.textContent='本关默认架设狙击塔，航空禁用。地面重装的调整仅对本局生效。';body.append(p);}
    const owned=catalog.filter(g=>inv.owned.includes(g.id)||(restricted&&g.id==='sniper'));
    if(!owned.length){const p=document.createElement('p');p.textContent='尚无装备。可在主界面或地图的庭院工坊购买。';body.append(p);}
    for(const [slot,title] of [['heavy','地面重装'],['aviation','航空'],['interceptor','拦截'],['support','支援工事']]){
      const items=owned.filter(g=>g.slot===slot);if(!items.length)continue;
      const group=document.createElement('section'),h=document.createElement('h2'),grid=document.createElement('div');h.textContent=title;grid.className='ops-prep-grid';group.append(h,grid);body.append(group);
      for(const g of items){
        const b=document.createElement('button');b.type='button';b.dataset.prepGear=g.id;
        const checked=using.includes(g.id),banned=restricted&&slot==='aviation',ownedLevel=inv.levels[g.id]||1;
        const rank=!actual()&&['heavy','aviation'].includes(slot)?Math.min(4,ownedLevel):ownedLevel;
        b.disabled=banned;b.setAttribute('aria-pressed',String(checked));b.title=g.name;
        const pic=document.createElement('img');pic.src=gearImage(g,rank);pic.alt='';
        const label=document.createElement('span'),name=document.createElement('b'),status=document.createElement('small');
        name.textContent=g.name;status.textContent=banned?'本关禁飞':!inv.owned.includes(g.id)?'本关借用 · 1 级':rank+' 级'+(checked?' · 已装备':'');
        label.append(name,status);b.append(pic,label);grid.append(b);
      }
    }
    const modes=document.createElement('div');modes.className='ops-prep-modes';
    function choice(id,key,label,on){
      const b=document.createElement('button');b.type='button';b.dataset.prepSetting=id;b.dataset.value=key;b.textContent=label;
      b.setAttribute('aria-pressed',String(on));modes.append(b);
    }
    if(actual()&&using.includes('sniper')&&inv.levels.sniper>=5)for(const [key,name] of [['precision','精准狙击'],['mk14','MK14']])choice('sniper',key,name,gardenArmory.sniperForm()===key);
    if(actual()&&using.includes('rotary')&&inv.levels.rotary>=5)for(const [key,name] of [['he','高爆机炮'],['ap','穿甲机炮']])choice('rotary',key,name,gardenArmory.rotaryForm()===key);
    if(using.some(id=>id.startsWith('intercept_')))for(const [key,name] of [['all','全场拦截'],['output','保护输出植物']])choice('intercept',key,name,gardenArmory.interceptMode()===key);
    if(modes.childElementCount)body.append(modes);content.replaceChildren(body);
  }
  function talents(){
    if(page!=='talents'||owner!==gardenEconomy.profile())return;
    const money=gardenChallengeRewards.wallet(owner);$('.ops-wallet').textContent=gardenEconomy.read(owner).points+' 升阶点 · '+money.coin+' 金币';
    gardenTalentView(content,owner,talent,id=>{talent=id;talents();$('[data-talent="'+id+'"]').focus({preventScroll:true});},
      (id,expected)=>{
        try{if(gardenTalents.buy(id,expected,owner))tell(gardenTalents.byId.get(id).name,'已研究至 '+(expected+1)+' 级');}
        catch(error){tell('天赋未保存','请重新打开天赋树再试。');console.error('[Garden Talents]',error);}
        talents();$('[data-talent="'+id+'"]')?.focus({preventScroll:true});
      });
  }
  function simulationPanel(map=false){
    return gardenSimulationControls(simulationDraft,{plant:map?mapPlant:plant,roster:gardenCatalogue,busy,map,
      chooseSpecies:id=>{mapPlant=id;},onChange:focus=>{
        const scroll=content.scrollTop;if(map)simulationPage();else challenge();
        content.scrollTop=scroll;$(focus)?.focus({preventScroll:true});
      }});
  }
  function simulationPage(){
    $('.ops-wallet').textContent='雪线挑战';
    const body=document.createElement('div');body.className='ops-sim-map';
    const intro=document.createElement('p');intro.textContent='为七株远征和自选增援设置默认倍率。进入最高难度自选关卡后，在挑战阵容中还能单独调整。';
    const actions=document.createElement('footer');actions.className='ops-command';
    const save=document.createElement('button');save.type='button';save.className='ops-confirm';save.dataset.simSave='';save.textContent='保存设置';
    actions.append(save);body.append(intro,simulationPanel(true),actions);content.replaceChildren(body);
  }
  function visible(gear,inv){return filter==='全部'||(filter==='重装'&&gear.slot==='heavy')||(filter==='已购'&&inv.owned.includes(gear.id))||filter===gear.category;}
  function shop(){
    if(page!=='shop'||!owner)return;
    const inv=inventory(),wallet=gardenChallengeRewards.wallet(owner);
    $('.ops-wallet').innerHTML=icon('gem',16)+'<b>'+wallet.gem+'</b> 钻石';
    const items=catalog.filter(i=>visible(i,inv));
    if(!items.some(i=>i.id===selected)){selected=items[0]?.id||'';viewTier=0;}
    if(!content.querySelector('.ops-layout')){
      content.innerHTML='<div class="ops-layout"><aside class="ops-inventory"><nav class="ops-filters" aria-label="装备分类"></nav><div class="ops-items"></div></aside><section class="ops-detail" aria-live="polite"></section></div>';
      const filters=['全部','重装','航空','拦截','地形','养护','补给','阵列','已购'];
      for(const k of filters){const b=document.createElement('button');b.type='button';b.dataset.filter=k;b.textContent=k;$('.ops-filters').append(b);}
    }
    for(const b of ui.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(filter===b.dataset.filter));
    const list=$('.ops-items'),frag=document.createDocumentFragment();
    for(const gear of items){
      const b=document.createElement('button');b.type='button';b.dataset.equipment=gear.id;b.className='ops-item';b.setAttribute('aria-pressed',String(selected===gear.id));
      b.innerHTML='<img alt=""><span><b></b><small></small></span>';
      const gearTier=inv.levels[gear.id]||0;
      b.querySelector('img').src=gearImage(gear,gearTier||1);b.querySelector('b').textContent=gear.name;
      const on=inv.equipped.includes(gear.id);
      b.querySelector('small').textContent=gearTier?gearTier+' 级 · '+(on?'已装备':'已购'):gear.cost+' 钻';
      if(on)b.classList.add('equipped');frag.append(b);
    }
    if(!items.length){const p=document.createElement('p');p.className='ops-empty';p.textContent='尚未购买装备。';frag.append(p);}
    list.replaceChildren(frag);
    const gear=byId.get(selected),panel=$('.ops-detail');
    if(!gear){panel.innerHTML='';return;}
    const own=inv.owned.includes(selected),on=inv.equipped.includes(selected);
    const level=inv.levels[selected]||0,display=viewTier||level||1,max=gardenArmory.limit(selected);
    const canSwitch=display>=5&&(selected==='sniper'||selected==='rotary');
    const form=canSwitch?(level>=5?(selected==='sniper'?gardenArmory.sniperForm():gardenArmory.rotaryForm()):viewForm||(selected==='sniper'?'mk14':'he')):'';
    const show=gardenEquipmentUpgrades.preview(selected,display,form);
    const swap=gardenArmory.exclusive(gear)&&inv.equipped.map(id=>byId.get(id)).find(i=>i.slot===gear.slot&&i.id!==selected);
    panel.innerHTML='<div class="ops-illustration"><canvas></canvas><span></span></div><div class="ops-copy"><div class="ops-spec-type"></div><h2></h2><div class="ops-tier-tabs" role="group" aria-label="查看各等级效果"></div><dl class="ops-stats"><div><dt>频率</dt><dd></dd></div><div><dt>效力</dt><dd></dd></div></dl><p class="ops-desc"></p><div class="ops-terms"></div><footer><span class="ops-equiphint"></span><div class="ops-actions"><button type="button" class="ops-use"></button><button type="button" class="ops-upgrade" hidden></button></div></footer></div>';
    drawGardenEquipment(panel.querySelector('canvas'),gear,false,display,form);
    panel.querySelector('.ops-illustration span').textContent=(gear.slot==='heavy'?'重型装备':'庭院装备')+' / '+display+' 级';
    $('.ops-spec-type').textContent=gear.category+(gear.slot==='aviation'||gear.activeCost?'  /  主动支援':show.activeCost?'  /  自动炮位＋主动支援':'  /  自动生效');
    panel.querySelector('h2').textContent=gear.name;
    const tabs=$('.ops-tier-tabs');
    for(let i=1;i<=max;i++){const tab=document.createElement('button');tab.type='button';tab.dataset.gearTier=i;tab.setAttribute('aria-pressed',String(display===i));tab.textContent=i+' 级';if(i===level)tab.setAttribute('aria-label',i+' 级，当前等级');tabs.append(tab);}
    if(form){
      const sniper=selected==='sniper',choices=sniper?[['precision','精准狙击'],['mk14','MK14 连射']]:[['he','高爆扫射'],['ap','穿甲点射']];
      const modes=document.createElement('div');modes.className='ops-forms';modes.setAttribute('role','group');modes.setAttribute('aria-label',level>=5?'选择作战模式':'预览作战模式');
      for(const [id,name] of choices){const b=document.createElement('button');b.type='button';b.dataset[sniper?'sniperForm':'rotaryForm']=id;b.textContent=name;b.setAttribute('aria-pressed',String(id===form));modes.append(b);}
      tabs.after(modes);
    }
    const values=panel.querySelectorAll('dd');values[0].textContent=show.frequency;values[1].textContent=show.power;
    if(gear.slot==='interceptor'){
      const strategies=document.createElement('div');strategies.className='ops-forms';strategies.setAttribute('aria-label','自动拦截策略');
      for(const [id,label] of [['all','全场拦截'],['output','仅保护输出植物']]){
        const b=document.createElement('button');b.type='button';b.dataset.interceptMode=id;b.textContent=label;
        b.disabled=!own;b.setAttribute('aria-pressed',String(gardenArmory.interceptMode()===id));strategies.append(b);
      }
      tabs.after(strategies);
    }
    $('.ops-desc').textContent=(display>1?'保留前级效果。':'')+show.mechanic;
    const terms=$('.ops-terms');
    const cost=show.activeCost??gear.activeCost;
    const info=gear.id==='rotary'?[['开局报价',cost+' 阳光'],['每次部署','下台 +250'],['每 25 秒','报价 −50，最低 1000'],['同时在场','最多 5 台 · 无冷却']]:cost?[['每次部署',cost+' 阳光'],['支援','可叠加 · 无冷却']]:[];
    if(gear.id==='sniper')info.push(['每次开火','0 阳光']);
    if(gardenArmory.heavySlot(gear))info.push(['本关重装','四选一']);
    if(gear.slot==='interceptor')info.push(['独立拦截位','三选一，可与重装同装']);
    if(gear.slot==='aviation'){
      const fortress=gardenAirWing.types.fortress;
      info.push(['航空位','可与任一地面重装同装'],['F22 长空卫士','5000 阳光 · 每秒 25'],['F35 临时增援','10000 阳光 · 40 秒'],
        ['普通关航空','每局限派一架 F22。F35 和空中堡垒仅在雪线挑战开放。'],
        ['挑战空中堡垒','每局限 2 次，首次 '+fortress.prices[0]+'、第二次 '+fortress.prices[1]+' 阳光，每次 '+fortress.duration+' 秒']);
    }
    if(gear.slot==='heavy'||gear.slot==='aviation')info.push(['出战等级','普通关最高 Ⅳ 级，雪线挑战使用已购买的等级。']);
    for(const [k,v] of info){const bit=document.createElement('span');bit.innerHTML='<small></small><b></b>';bit.firstChild.textContent=k;bit.lastChild.textContent=v;terms.append(bit);}
    $('.ops-equiphint').textContent=swap?'装备后替换「'+swap.name+'」':level===max?'已满级 · 永久拥有':own?'已拥有 · '+level+' 级':'一次购买，永久拥有';
    const action=$('.ops-use');action.dataset.action=!own?'buy':on?'remove':'equip';action.disabled=!own&&wallet.gem<gear.cost;
    action.textContent=own?(on?'卸下装备':'装备'):action.disabled?'还差 '+(gear.cost-wallet.gem)+' 钻':'购买并装备 · '+gear.cost+' 钻';
    if(own&&level<max){
      const nextCost=gardenArmory.upgradeCost(selected);
      const up=$('.ops-upgrade');up.hidden=false;up.dataset.action='upgrade';up.dataset.expected=String(level);up.disabled=wallet.gem<nextCost;
      up.textContent=(display>level+1?'先升至 ':'升至 ')+(level+1)+' 级 · '+nextCost+' 钻';if(up.disabled)up.title='还差 '+(nextCost-wallet.gem)+' 钻石';
    }
  }
  const speciesNames=new Map(gardenWorldSpecies.map(([id,world,name])=>[id,name]));
  function worldGuide(preferred,expanded=false){
    const guide=document.createElement('details');guide.className='ops-foes ops-world-guide';guide.open=expanded;
    const caption=document.createElement('summary');caption.textContent='世界僵尸 · 挑战招式';guide.append(caption);
    const selector=document.createElement('select');selector.className='ops-world-select';selector.setAttribute('aria-label','选择僵尸所属世界');
    const worlds=gardenWorldVeterans.worlds;
    for(const world of worlds){const opt=document.createElement('option');opt.value=world.id;opt.textContent=world.name;selector.append(opt);}
    if(worlds.some(w=>w.id===preferred))selector.value=preferred;
    const line=document.createElement('div');line.className='ops-world-nav';line.append(selector);
    const intro=document.createElement('span');intro.textContent='本世界专属挑战生效';line.append(intro);guide.append(line);
    const body=document.createElement('div');body.className='ops-world-entries';guide.append(body);
    function render(){
      const frag=document.createDocumentFragment();
      for(const e of gardenWorldVeterans.forWorld(selector.value)){
        const card=document.createElement('article'),heading=document.createElement('h3');heading.textContent=e.name;card.append(heading);
        const who=document.createElement('small');who.textContent=e.types.map(id=>speciesNames.get(id)||id).filter((n,i,a)=>n&&a.indexOf(n)===i).join('、');card.append(who);
        const rules=document.createElement('p');rules.textContent=e.trigger+'，'+e.effect;card.append(rules);
        const counter=document.createElement('p'),label=document.createElement('b');label.textContent='应对　';counter.append(label,document.createTextNode(e.counter));card.append(counter);frag.append(card);
      }
      body.replaceChildren(frag);body.scrollTop=0;
    }
    selector.addEventListener('change',render);render();return guide;
  }
  function reinforcementPicker(fields,options,i,favorites){
    const wrap=document.createElement('div');wrap.className='ops-pick-slot';fields.append(wrap);
    const label=document.createElement('label');label.textContent='增援 '+(i+1);wrap.append(label);
    const select=document.createElement('select');select.dataset.extraSlot=i;select.disabled=busy;label.append(select);
    select.add(new Option('选择已拥有的植物',''));
    const groups=[['超级植物',options.filter(id=>gardenChallenge.superPlant(id))],
      ['我的收藏',options.filter(id=>!gardenChallenge.superPlant(id)&&favorites.includes(id))],
      ['其他植物',options.filter(id=>!gardenChallenge.superPlant(id)&&!favorites.includes(id))]];
    const unavailable=id=>extraCount===2&&extraDraft[1-i]===id;
    for(const [heading,ids] of groups){
      if(!ids.length)continue;
      const group=document.createElement('optgroup');group.label=heading;select.append(group);
      for(const id of ids){
        const name=plantById.get(id)?.name||id;
        const o=new Option(name+' · '+(id==='imitater'?'复制前一卡':gardenEconomy.rank(id)+' 阶')+(favorites.includes(id)?' ★':''),id);
        o.disabled=unavailable(id);group.append(o);
      }
    }
    const current=extraDraft[i];select.value=current;
    const star=document.createElement('button');star.type='button';star.className='ops-star';star.dataset.favoriteSlot=i;
    const marked=favorites.includes(current);star.textContent=marked?'★':'☆';star.setAttribute('aria-pressed',String(marked));
    star.title=star.ariaLabel=(marked?'取消收藏':'收藏')+(plantById.get(current)?.name||'此植物');star.disabled=busy||!current;
    wrap.append(star);
    const available=favorites.filter(id=>options.includes(id)&&!unavailable(id));
    if(available.length){
      const quick=document.createElement('details');quick.className='ops-favorites';wrap.append(quick);
      const title=document.createElement('summary');title.textContent='收藏快选 · '+available.length;quick.append(title);
      for(const id of available.sort((a,b)=>Number(!!gardenChallenge.superPlant(b))-Number(!!gardenChallenge.superPlant(a)))){
        const b=document.createElement('button');b.type='button';b.dataset.quickSlot=i;b.dataset.pickPlant=id;
        b.textContent=plantById.get(id)?.name||id;b.disabled=busy;b.setAttribute('aria-pressed',String(id===current));quick.append(b);
      }
    }
  }
  function armorGuide(collapsed,tier=0){
    const box=document.createElement(collapsed?'details':'section');box.className=collapsed?'ops-foes ops-armor-table':'ops-armor-table';
    const heading=document.createElement(collapsed?'summary':'h3');heading.textContent='装甲敌潮 · 防护与弱点';box.append(heading);
    const camouflage=document.createElement('p');camouflage.textContent='挑战中每十名敌人，有一名穿林地迷彩。所有兵种都可能出现。迷彩头盔和背心的耐久、减伤与额外生命降至同档七成。地面重装与航空无法锁定迷彩目标，爆炸波及它时只结算两成伤害。植物和普通支援工事可以照常攻击。';box.append(camouflage);
    const table=document.createElement('table');
    table.innerHTML='<thead><tr><th scope="col">装甲</th><th scope="col">普通减伤</th><th scope="col">爆炸减伤</th><th scope="col">额外生命</th></tr></thead>';
    const body=table.createTBody(),profiles=gardenChallengeArmor.profiles;
    for(const [name,p] of [['轻装',profiles.light],['重装',profiles.heavy],['曜纹精英',profiles.elite]]){
      for(const [part,armor] of [['头盔',p.helmet],['背心',p.vest]]){
        const row=body.insertRow(),label=document.createElement('th');label.scope='row';label.textContent=name+' · '+part;row.append(label);
        const blast=tier?Math.min(.999,1-(1-armor.blastReduction)*(.8**tier)*(tier===2?.60:1)):armor.blastReduction;
        const direct=tier===2?1-(1-armor.reduction)*.70:armor.reduction;
        for(const value of [Number((100*direct).toFixed(2))+'%',Number((100*blast).toFixed(3))+'%','+'+armor.extraHealth*(2**tier)])row.insertCell().textContent=value;
      }
    }
    const layers=document.createElement('p');layers.textContent='头盔和背心依次抵挡剩余伤害。破甲后该部件失去减伤，已增加的生命上限保留。';
    const counters=document.createElement('p');counters.textContent='穿甲机炮只受头盔原减伤的 4%、背心原减伤的 6%，并磨损铁网门与原生护具。抛射、溅射和背后攻击可绕开铁网门。携物雪人开始修甲时，击退它能打断修复。';
    if(tier){
      counters.textContent=tier===2?'噩梦头盔、背心的耐久再乘 1.75、2。每件护具的直击漏伤再乘 0.70，爆炸漏伤再乘 0.60。穿甲与直接碎甲作用于这两件时再乘 0.60。盾牌和铁网门有各自的规则。腐蚀真伤可以穿过护具。':'枭雄防具的爆炸漏伤乘 0.8，削甲与穿甲效力保留 75%。腐蚀真伤可以穿过护具。';
    }
    box.append(table,layers,counters);return box;
  }
  function specialGuide(tier=0){
    const brief=document.createElement('details');brief.className='ops-foes';
    const caption=document.createElement('summary');caption.textContent='敌情手册 · 高压植物与特战僵尸';brief.append(caption);
    const alert=document.createElement('p');alert.textContent='第一面旗后重型盾卫率先登场，普通特战与九种植物僵尸分批进场，导弹开始锁定草坪。第二面旗起，曜纹精英盾卫、迫击炮与棱镜草加入增援。十种植物僵尸的生命额外提高 80%。';brief.append(alert);
    if(tier)alert.append(' 下表列出常规挑战的基础招式。当前植物僵尸起手与攻击间隔乘 '+(tier===1?'0.5':'0.25')+'，自选增援的生命再乘 '+(2**tier)+'。本档防爆数值见装甲表。');
    const guide=document.createElement('dl');brief.append(guide);
    const specials=[['冰西瓜僵尸','高压型。蓄力 0.78 秒后投出冰瓜，砸向密植区，向外两格溅射并压制行动。中心格承受最重的冲击和眩晕。'],['狂暴机枪豌豆僵尸','高压型。通常预热 0.27 秒，每 0.075 秒一发，共六发。生命降至六成或每第三轮进入狂暴，预热 0.15 秒，每 0.045 秒一发，共十发并扫向邻行。'],['棱镜草僵尸','高压型。每 1.6 秒抽取 60 阳光并发射满功率光束，余额可以降为负数。充能期间打断可追回本轮阳光，收集阳光会抵还欠额。'],
      ...gardenHybridRoster.entries.map(e=>[e.name,e.description+' 起手 '+e.windup+' 秒，收招后 '+e.cooldown+' 秒可再次出手。']),['掷弹僵尸','手榴弹会在标记格延迟爆炸。'],['冲锋枪僵尸','进入短射程后连续点射，提前打断可以截停它。'],['重型盾卫','七株远征实际生命 9800，自选增援 13800，盾耐久 24000。首旗后可重复增援，第二面旗起最多三名普通盾卫同时在场。完整盾面截下 96% 正面直击和 98.5% 爆炸，保护盾后同排。穿甲机炮的首击有 60% 穿盾伤及本体，盾耐久按所挡伤害的六倍磨损；绕后或远程炮击可越盾。'],['曜纹精英盾卫','紫盾金徽，七株远征实际生命 16000，自选增援 22500，盾耐久 48000。第二面旗起最多两名精英盾卫同时在场。正面直击减伤 98.5%，爆炸减伤 99.5%。除同排外，还为相邻两行、身后两格内的友军挡下正面爆炸。穿甲机炮首击有 48% 穿盾伤及本体；两种完整重盾都会让穿向后排的机炮弹伤害再减半。破盾后失去掩护。']];
    specials.unshift(['超级重装巨人','每场挑战至少六只。背部发射器轮射高爆、液氮、神经毒素和燃烧火箭；液氮会减慢植物行动，拦截装备能防御四种火箭。超重盾、反应装甲、液体护甲与智能头盔共同抵御爆炸和穿透，完整防具吸收 99% 此类伤害。巨人不投掷小鬼。可用直击、破甲和腐蚀配合拦截。']);
    for(const e of gardenChallengeMortar.entries)specials.push([e.name,e.description]);
    for(const [name,description] of specials){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=description;row.append(dt,dd);guide.append(row);}
    return brief;
  }
  function enemyBonus(stat){return Math.round((gardenChallenge.modifiers[stat]-1)*100)+'%';}
  function masteryPanel(option,level){
    const section=document.createElement('section');section.className='ops-skill-summary';section.setAttribute('aria-label','专精效果');
    const header=document.createElement('header'),title=document.createElement('h4'),count=document.createElement('span');
    title.textContent='专精效果';count.textContent='本关生效 '+level+' / 4';header.append(title,count);section.append(header);
    const list=document.createElement('ol');
    for(let n=1;n<=4;n++){
      const effect=gardenModeMastery.describe(option,n),item=document.createElement('li');
      const name=document.createElement('strong'),state=document.createElement('small'),detail=document.createElement('span');
      item.dataset.masteryLevel=n;item.dataset.active=String(n<=level);
      name.textContent=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][n-1]+'　'+effect.name;state.textContent=n<=level?'生效':'预览';detail.textContent=effect.description;
      item.append(name,state,detail);list.append(item);
    }
    section.append(list);return section;
  }
  function openIntel(){
    const selected=get('Almanac')?.Almanac?.component?.almanacZombie?.currentZombieCF?.ID;
    const code=selected==null?null:get('Zombies')?.zombies?.getZombieFeature(selected)?.CODENAME;
    const current=code&&gardenWorldVeterans.forType(code);
    $('.ops-wallet').textContent='雪线挑战';
    const stack=document.createElement('div');stack.className='ops-intel-pages';
    const base=document.createElement('p');base.textContent=`挑战僵尸的生命提高 ${enemyBonus('health')}，伤害提高 ${enemyBonus('damage')}，移速提高 ${enemyBonus('speed')}。第二面旗起，增援随波进场。场上敌人太多时，下一批增援会缩减。`;
    const ordinary=document.createElement('p');ordinary.textContent='普通关Ⅰ至Ⅳ均会出现植物僵尸、迫击炮手和装甲敌人。随难度递增，每百名敌人有 6 / 12 / 20 / 30 名同时佩戴头盔与背心。Ⅳ每五套再发一面网盾，并派少量高危植物僵尸。头盔拦 22% 直击、30% 爆炸，背心拦 30% 和 40%；普通网盾拦 55% 正面直击。Ⅳ的常规短关一只宝藏雪人，16 波及以上两只。';
    stack.append(base,armorGuide(false),ordinary,worldGuide(current?.world,true),specialGuide());content.replaceChildren(stack);
  }
  function challenge(){
    if(page!=='challenge')return;
    const active=actual(),baseDeck=gardenChallenge.baseDeck(),extras=extraDraft.slice(0,extraCount),ids=[...baseDeck,...extras.filter(Boolean)];
    const configured=gardenChallenge.extras(),dirty=JSON.stringify(extras)!==JSON.stringify(configured);
    const tier=gardenChallenge.tyrantTier(extras,baseDeck);
    const trainingOK=tier===2||gardenChallenge.validTraining(baseDeck,trainingDraft);
    const simChanged=JSON.stringify(gardenChallenge.simulationSettings(simulationDraft))!==JSON.stringify(gardenChallenge.draftSimulation());
    const terms=gardenChallengeRewards.terms(tier),quote=gardenChallenge.entryQuote(tier);
    const factors=gardenChallenge.profileModifiers(extras,baseDeck),opening=gardenChallenge.openingFor(tier);
    theme(shade,tier);
    $('.ops-head i').innerHTML=icon(tier?'owl':'flake',25);
    $('#ops-heading').textContent=tier?'挑战阵容':'雪线挑战';
    if(!ids.includes(plant))plant=ids[0];
    $('.ops-wallet').textContent='难度 Ⅳ';
    content.innerHTML=`<div class="ops-brief"><div class="ops-brief-title"><span>古怪雪人来袭</span><h2>雪线远征</h2><p>七株六阶植物出战。开局额外获得 1,000 阳光，种子包冷却减半，可自由花费阳光。开战 ${opening} 秒后出现第一波，首旗前仅有原关敌潮。第二面旗起增援随波进场，旗帜波最密。</p></div><div class="ops-threat"><span>敌方移速<b>+${enemyBonus('speed')}</b></span><span>敌方伤害<b>+${enemyBonus('damage')}</b></span><span>敌方生命<b>+${enemyBonus('health')}</b></span></div></div><div class="ops-orders"><div class="ops-deck" role="group" aria-label="挑战阵容"></div><div class="ops-tactics"></div><div class="ops-pay"><b>挑战奖励</b><p>金币掉落权重 ×10 · 钻石掉落权重 ×20 · 升阶点 ×5。阳光、叶绿素及战利品自动收集。</p><p>通关另得 10,000 金币、20 钻石和一株随机新植物。图鉴收齐后改为随机升一阶。</p></div><footer class="ops-command"><button type="button" class="ops-cancel"></button><button type="button" class="ops-confirm"></button></footer></div>`;
    const armorInfo=armorGuide(true,tier);
    const picker=document.createElement('section');picker.className='ops-reinforcement';
    const branchTabs=document.createElement('div');branchTabs.className='ops-forms';picker.append(branchTabs);
    for(const [n,id,label] of [[0,'standard','七株远征'],[1,'solo','增援一株'],[2,'reinforced','增援两株']]){
      const b=document.createElement('button');b.type='button';b.dataset.branch=id;b.textContent=label;
      b.dataset.extraCount=n;b.setAttribute('aria-pressed',String(extraCount===n));b.disabled=busy;branchTabs.append(b);
    }
    $('.ops-deck').before(picker);
    if(extraCount){
      $('.ops-brief-title h2').textContent=extraCount===1?'单株增援':'双株增援';
      $('.ops-brief-title p').textContent='自选增援保留原有阶数和专精。波数为七株远征的 1.5 倍，首波准备 '+opening+' 秒。自选超级机枪豌豆、瓷砖萝卜、充能柚子中的一类开启枭雄，两类开启噩梦。';
      const options=gardenChallenge.extraOptions(),fields=document.createElement('div');fields.className='ops-extra-fields';picker.append(fields);
      const favorites=gardenEconomy.read(owner).favoriteReinforcements;
      for(let i=0;i<extraCount;i++)reinforcementPicker(fields,options,i,Array.isArray(favorites)?favorites:[]);
    }
    if(tier){
      $('.ops-wallet').textContent='挑战奖励 ×'+terms.weight;
      $('.ops-brief-title>span').textContent='自选增援 · '+(tier===1?'单株触发':'双株触发');
      $('.ops-brief-title h2').textContent=tyrantNames[tier];
      $('.ops-brief-title p').textContent='准备 '+opening+' 秒。植物僵尸起手与攻击间隔缩至 '+(tier===1?'1/2':'1/4')+'。入场时全队获得爆发。'+(tier===2?'全队临时六阶，所选专精升到四级。':'固定七株沿用战前专精分配。');
      $('.ops-pay').innerHTML='<b>挑战奖励 ×'+terms.weight+'</b><p>战利品按 '+terms.weight+' 倍权重发放。通关获得 '+terms.coin.toLocaleString('zh-CN')+' 金币、'+terms.gem+' 钻石和 '+terms.points+' 升阶点。</p><p>'+ (tier===1?'随机植物奖励一次，有 50% 概率再抽一次。':'随机植物奖励抽取两次。')+'优先解锁新植物，收齐后随机升阶。</p>';
    }
    $('.ops-threat').querySelectorAll('b').forEach((b,i)=>b.textContent='×'+Number([factors.speed,factors.damage,factors.health][i].toFixed(5)));
    $('.ops-pay').before(armorInfo);
    armorInfo.after(worldGuide(gardenWorldVeterans.identify(get('levelController')?.LevelPlay?.component)),specialGuide(tier));
    if(!gardenEconomy.canChallenge(get('levelController')?.LevelPlay)){
      $('.ops-pay').innerHTML='<b>练习挑战</b><p>可体验完整敌潮和七株六阶植物。正式存档奖励在正式关卡发放。</p>';
    }
    if(tier){
      const fee=document.createElement('p');fee.className='ops-entry-fee';
      fee.textContent=quote.practice?'练习免票':('开战扣 '+quote.cost+' 钻石 · 当前 '+quote.balance+' 钻石'+(quote.affordable?'':' · 余额不足'));
      $('.ops-brief-title').append(fee);
    }
    const banner=document.createElement('canvas');banner.setAttribute('aria-hidden','true');$('.ops-brief').prepend(banner);
    if(tier)drawGardenTyrant(banner,tier);else drawGardenSnow(banner);
    const deck=$('.ops-deck');
    for(const id of ids){const p=plantById.get(id);if(!p)continue;const b=document.createElement('button');b.type='button';b.dataset.team=id;b.setAttribute('aria-pressed',String(id===plant));b.innerHTML='<img alt=""><b></b>';const src=portrait(id);if(src)b.firstChild.src=src;else b.firstChild.hidden=true;b.lastChild.textContent=p.name;deck.append(b);}
    deck.classList.toggle('ops-nine',extraCount===2);deck.classList.toggle('ops-eight',extraCount===1);
    for(const b of deck.children){const id=b.dataset.team,support=extras.includes(id),rank=support?gardenEconomy.rank(id):6;
      const marker=document.createElement('small');marker.textContent=id==='imitater'?'复制前一卡':tier===2?(gardenCompatible.numeric(id)?'六阶 · 数值加成':'六阶 · 专精 4'):support?'自有 '+rank+' 阶':'六阶 · 专精 '+trainingDraft[id];b.append(marker);}
    const skillPlant=plant==='imitater'?ids[ids.indexOf(plant)-1]:plant;
    const rank=tier===2||baseDeck.includes(skillPlant)?6:gardenEconomy.rank(skillPlant);
    const modes=skillPlant&&rank===6?gardenModes.options(skillPlant):[],slot=tacticDraft[skillPlant]??gardenChallenge.mode(skillPlant);
    const choices=$('.ops-tactics');if(modes.length){
      const title=document.createElement('h3');title.textContent=(plant==='imitater'?'模仿者 · 复制':'')+(plantById.get(skillPlant)?.name||'')+' · 六阶模式';choices.append(title);
      const tabs=document.createElement('div');tabs.className='ops-mode-tabs';choices.append(tabs);
      for(let i=0;i<modes.length;i++){const b=document.createElement('button');b.type='button';b.dataset.tactic=i;b.dataset.skillPlant=skillPlant;b.setAttribute('aria-pressed',String(i===slot));b.textContent=modes[i].name;b.disabled=busy;tabs.append(b);}
      const detail=document.createElement('p');detail.textContent=modes[slot]?.description||'';choices.append(detail);
      const level=tier===2?4:baseDeck.includes(skillPlant)?trainingDraft[skillPlant]:gardenEconomy.mastery(skillPlant,slot);
      choices.append(masteryPanel(modes[slot],level));
    }else if(skillPlant){
      const note=document.createElement('p');note.textContent=(plant==='imitater'?'模仿者复制的':'')+(plantById.get(skillPlant)?.name||'')+'为 '+rank+' 阶。'+(gardenCompatible.numeric(skillPlant)?'每阶提高 10% 伤害、10% 行动速度和 200% 生命。':'升到六阶后可使用技能专精。');choices.append(note);
    }
    const loadout=document.createElement('div');loadout.className='ops-training-allocation';
    const caption=document.createElement('b');caption.textContent=tier===2?'全队专精四级':'七株专精名额';loadout.append(caption);
    const roll=document.createElement('button');roll.type='button';roll.className='ops-dice';roll.disabled=busy;
    roll.innerHTML=icon('dice',17)+'掷骰子';roll.setAttribute('aria-label','掷骰子，随机分配七株给定植物的技能和专精');roll.title='随机分配七株给定植物的技能和专精';loadout.append(roll);
    if(tier===2){roll.title=roll.ariaLabel='随机选择全队六阶技能';}
    const levels=baseDeck.map(id=>trainingDraft[id]);
    for(const [n,max] of (tier===2?[]:[[1,4],[3,2],[4,1]])){
      const count=levels.filter(v=>v===n).length,tag=document.createElement('span');
      tag.textContent=n+' 级　'+count+'/'+max;tag.dataset.filled=String(count===max);loadout.append(tag);
    }
    if(tier!==2&&baseDeck.includes(plant)){
      const field=document.createElement('label');field.append((plantById.get(plant)?.name||'')+'　');
      const sel=document.createElement('select');sel.dataset.trainingPlant=plant;sel.disabled=busy;
      for(const n of [1,3,4]){const o=document.createElement('option');o.value=n;o.textContent='专精 '+n+' 级';sel.append(o);}
      sel.value=String(trainingDraft[plant]);field.append(sel);loadout.append(field);
    }
    if(!trainingOK){
      const hint=document.createElement('small');hint.textContent='再点一张固定植物卡，调换等级后即可确认。';loadout.append(hint);
    }
    choices.before(loadout);
    loadout.after(simulationPanel());
    if(simulationDraft.enabled){
      for(const card of deck.children){
        const factor=gardenChallenge.simulationValue(simulationDraft,card.dataset.team,ids);
        if(factor>1){const tag=document.createElement('i');tag.className='ops-sim-factor';tag.textContent='×'+factor;
          tag.title='植物模拟 ×'+factor;card.append(tag);}
      }
    }
    $('.ops-cancel').textContent=active?'退出挑战':'返回';$('.ops-confirm').textContent=active?'完成配置，返回战场':'启用挑战并配置技能';
    for(const b of ui.querySelectorAll('.ops-command button'))b.disabled=busy;
    if(active&&dirty)$('.ops-confirm').textContent='应用新阵容';
    else if(active&&simChanged)$('.ops-confirm').textContent='应用模拟倍率';
    if(extras.some(id=>!id)){$('.ops-confirm').disabled=true;$('.ops-confirm').textContent=extraCount===1?'请选择一株增援植物':'请选择两株增援植物';}
    if(tier&&!quote.affordable){$('.ops-confirm').disabled=true;$('.ops-confirm').textContent='入场需要 '+quote.cost+' 钻石';}
    if(!trainingOK){$('.ops-confirm').disabled=true;$('.ops-confirm').textContent='请配齐专精名额';}
  }
  ui.addEventListener('change',e=>{
    if(!busy&&page==='challenge'&&e.target.matches('select[data-training-plant]')){
      trainingDraft[e.target.dataset.trainingPlant]=Number(e.target.value);challenge();
      ui.querySelector('.ops-training-allocation select')?.focus({preventScroll:true});return;
    }
    if(!busy&&page==='challenge'&&e.target.matches('select[data-extra-slot]')){
      const i=Number(e.target.dataset.extraSlot);extraDraft[i]=e.target.value;
      if(extraCount===1&&extraDraft[0]===extraDraft[1])extraDraft[1]='';
      challenge();
      ui.querySelector('select[data-extra-slot="'+i+'"]')?.focus({preventScroll:true});
    }
  });
  ui.addEventListener('click',async e=>{
    const b=e.target.closest('button');
    if(e.target===shade&&!busy){close();return;}if(!b||b.disabled||busy)return;
    if(b.matches('.ops-intel')){open('intel',b);return;}
    if(b===simLaunch){open('simulation',b);return;}
    if(b===loadoutButton){open('loadout',b);return;}
    if(b.matches('.ops-shop')){open('shop',b);return;}
    if(b===talentTab){open(page==='talents'?'shop':'talents',lastTrigger);talentTab.focus({preventScroll:true});return;}
    if(b.matches('.ops-expedition')){open('challenge',b);return;}
    if(b.dataset.aircraft){gardenAirWing.call(b.dataset.aircraft);sync();return;}
    if(b.matches('.ops-fire')){if(gardenArsenal.act(b.dataset.weapon)){b.getAnimations?.().forEach(a=>a.cancel());if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)b.animate?.([{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:260});}sync();return;}
    if(b.matches('.ops-close')){close();return;}
    if(owner!==gardenEconomy.profile()||scene!==currentScene()){close();return;}
    if(page==='simulation'&&b.hasAttribute('data-sim-save')){
      if(gardenEconomy.saveSimulationDefaults(owner,simulationDraft)){close();sync();}
      else tell('模拟设置未保存','请重新打开当前账号的设置。');
      return;
    }
    if(page==='loadout'&&b.dataset.prepSetting){
      const setters={sniper:gardenArmory.setSniperForm,rotary:gardenArmory.setRotaryForm,intercept:gardenArmory.setInterceptMode};
      setters[b.dataset.prepSetting]?.(b.dataset.value,owner);loadout();return;
    }
    if(page==='loadout'&&b.dataset.prepGear){
      const l=get('levelController')?.LevelPlay?.component,id=b.dataset.prepGear,gear=byId.get(id),inv=inventory();
      if(!l||l.gameStarted||!gear||b.disabled)return;
      if(gardenFixed.noSunProduction(l)&&gear.slot==='heavy'){
        gardenFixed.chooseHeavy(l,gardenFixed.equipment(l,inv.equipped).includes(id)?null:id);
      }else if(!(gardenFixed.noSunProduction(l)&&gear.slot==='aviation')){
        gardenArmory.change(id,inv.equipped.includes(id)?'remove':'equip',owner);
      }
      loadout();$('[data-prep-gear="'+id+'"]')?.focus({preventScroll:true});return;
    }
    if(page==='shop'){
      if(b.dataset.interceptMode){gardenArmory.setInterceptMode(b.dataset.interceptMode,owner);shop();return;}
      if(b.dataset.filter){filter=b.dataset.filter;shop();return;}
      if(b.dataset.equipment){selected=b.dataset.equipment;viewTier=0;viewForm='';shop();$('.ops-detail').scrollTop=0;$('.ops-item[aria-pressed=true]')?.focus({preventScroll:true});return;}
      if(b.dataset.gearTier){viewTier=Number(b.dataset.gearTier);shop();$('.ops-tier-tabs [aria-pressed=true]')?.focus({preventScroll:true});return;}
      if(b.dataset.sniperForm||b.dataset.rotaryForm){
        const choice=b.dataset.sniperForm||b.dataset.rotaryForm;
        if(gardenArmory.level(selected)>=5){
          if(selected==='sniper')gardenArmory.setSniperForm(choice,owner);else gardenArmory.setRotaryForm(choice,owner);
        }else viewForm=choice;
        shop();return;
      }
      if(b.dataset.action){
        try{
          if(b.dataset.action==='upgrade'&&e.detail>1)return;
          if(!gardenArmory.change(selected,b.dataset.action,owner,Number(b.dataset.expected)))tell('装备状态已刷新','请检查当前钻石与装备状态。');
          else viewTier=0;
        }
        catch(err){tell('装备未保存','请重试。');console.error('[Garden Workshop]',err);}
        shop();return;
      }
    }
    if(page==='challenge'){
      if(!gardenChallenge.eligible()&&!config()){close();return;}
      if(b.dataset.favoriteSlot!==undefined){
        const id=extraDraft[Number(b.dataset.favoriteSlot)],state=gardenEconomy.read(owner);
        if(!id)return;
        const old=Array.isArray(state.favoriteReinforcements)?state.favoriteReinforcements:[];
        const next=old.includes(id)?old.filter(v=>v!==id):[...old,id];
        try{
          if(!gardenChallengeRewards.saveBundle(owner,{gardendlessGreenhouseV1:{...state,favoriteReinforcements:next}}))tell('收藏未保存','请在正式玩家档案中设置收藏。');
        }catch(err){tell('收藏未保存','请重试。');}
        const scroll=content.scrollTop;challenge();content.scrollTop=scroll;
        ui.querySelector('[data-favorite-slot="'+b.dataset.favoriteSlot+'"]')?.focus({preventScroll:true});return;
      }
      if(b.dataset.quickSlot!==undefined){
        const i=Number(b.dataset.quickSlot),id=b.dataset.pickPlant;
        if(!gardenChallenge.extraOptions().includes(id)||(extraCount===2&&extraDraft[1-i]===id))return;
        extraDraft[i]=id;const scroll=content.scrollTop;challenge();content.scrollTop=scroll;
        ui.querySelector('[data-extra-slot="'+i+'"]')?.focus({preventScroll:true});return;
      }
      if(b.dataset.branch){extraCount=Number(b.dataset.extraCount);challenge();$('.ops-forms [aria-pressed="true"]')?.focus({preventScroll:true});return;}
      if(b.matches('.ops-dice')){
        const rolled=gardenChallenge.rollTactics();if(!rolled)return;
        const scroll=content.scrollTop;
        const nightmare=gardenChallenge.tyrantTier(extraDraft.slice(0,extraCount),gardenChallenge.baseDeck())===2;
        if(!nightmare)trainingDraft=rolled.training;
        Object.assign(tacticDraft,rolled.modes);
        if(nightmare)for(const id of extraDraft.slice(0,extraCount)){const modes=gardenModes.options(id);if(id!=='imitater'&&modes.length)tacticDraft[id]=Math.floor(Math.random()*modes.length);}
        challenge();content.scrollTop=scroll;$('.ops-dice')?.focus({preventScroll:true});
        const msg=document.createElement('span');msg.setAttribute('role','status');msg.className='ops-dice-result';
        msg.textContent=nightmare?'已重掷全队技能 · 专精四级':'已重掷七株 · 四级专精 '+(plantById.get(Object.keys(trainingDraft).find(id=>trainingDraft[id]===4))?.name||'');
        $('.ops-training-allocation').append(msg);return;
      }
      if(b.dataset.team){plant=b.dataset.team;challenge();return;}
      if(b.dataset.tactic!==undefined){
        const id=b.dataset.skillPlant,index=Number(b.dataset.tactic);tacticDraft[id]=index;
        if(config())gardenChallenge.setMode(id,index);
        challenge();$('.ops-mode-tabs [aria-pressed="true"]')?.focus({preventScroll:true});return;
      }
      if(b.matches('.ops-confirm,.ops-cancel')){
        const confirming=b.matches('.ops-confirm');
        const extras=extraDraft.slice(0,extraCount);
        if(confirming&&gardenChallenge.tyrantTier(extras,gardenChallenge.baseDeck())!==2&&!gardenChallenge.validTraining(gardenChallenge.baseDeck(),trainingDraft))return;
        const sameSimulation=JSON.stringify(gardenChallenge.simulationSettings(simulationDraft))===JSON.stringify(gardenChallenge.draftSimulation());
        if(confirming&&actual()&&sameSimulation&&JSON.stringify(gardenChallenge.extras())===JSON.stringify(extras)){
          if(gardenChallenge.setTraining(trainingDraft)){
            for(const [id,index] of Object.entries(tacticDraft))if(gardenChallenge.mode(id)!==index)gardenChallenge.setMode(id,index);
            close();
          }return;
        }
        if(!confirming&&!actual()){close();return;}
        busy=true;challenge();
        try{
          if(!confirming){await gardenChallenge.disable();close();}
          else {
            const enabled=await gardenChallenge.enable(extras,trainingDraft,simulationDraft);
            if(enabled&&gardenEconomy.profile()===owner){
              scene=currentScene();
              for(const [id,index] of Object.entries(tacticDraft))if(gardenChallenge.mode(id)!==index)gardenChallenge.setMode(id,index);
            }
            else tell('当前关卡无法开启挑战','请确认已选择最高难度与自由选卡关卡。');
          }
        }catch(err){tell('挑战阵容未就绪','请重新打开战前配置。');console.error('[Garden Challenge]',err);}
        finally{busy=false;if(page==='challenge')challenge();sync();}
      }
    }
  });
  window.addEventListener('keydown',e=>{
    if(shade.hidden)return;e.stopImmediatePropagation();
    if(e.key==='Escape'&&!busy){e.preventDefault();close();}
    if(e.key==='Tab'){const buttons=[...book.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),summary')].filter(b=>b.offsetWidth);
      if(e.shiftKey&&root.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}
      if(!e.shiftKey&&root.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}
  },true);
  window.addEventListener('keyup',e=>{if(!shade.hidden)e.stopImmediatePropagation();},true);
  function sync(){
    const level=get('levelController')?.LevelPlay?.component,sceneNow=currentScene(),outside=sceneNow&&sceneNow.name!=='inGameScene';
    const hasProfile=!!gardenEconomy.profile(),showChallenge=hasProfile&&!outside&&(config()||gardenChallenge.eligible());
    const inAlmanac=!!get('Almanac')?.Almanac?.component?.almanacZombie?.node?.activeInHierarchy;
    $('.ops-intel').hidden=!hasProfile||!inAlmanac;
    $('.ops-shop').hidden=!outside||!hasProfile||inAlmanac;
    const chooser=get('Cards')?.Cards?.component,prepping=hasProfile&&!outside&&level&&level.node?.scene===sceneNow&&
      !level.gameStarted&&!level.rocked&&(chooser?.seedChooser?.node?.activeInHierarchy||config()||level.lastStand);
    loadoutButton.hidden=!prepping;
    if(page==='loadout'&&!prepping)close();
    const map=sceneNow?.name==='worldMapScene'&&get('worldMapScene')?.worldMapScene?.component;
    simLaunch.hidden=!hasProfile||!map?.currentWMPrefab||!!map.wmSwitchingTween||map.isBusy()||inAlmanac;
    if(!simLaunch.hidden)simLaunch.dataset.on=String(gardenEconomy.profile()?.gardendlessGreenhouseV1?.simulationDefaults?.enabled===true);
    if(page==='simulation'&&simLaunch.hidden&&!busy)close();
    const b=$('.ops-expedition');b.hidden=!showChallenge;
    const liveTier=outside?0:gardenChallenge.activeTyrant(level);
    if(!b.hidden){const on=actual();if(b.dataset.on!==String(on)||Number(b.dataset.tyrant||0)!==liveTier){
      b.dataset.on=String(on);theme(b,liveTier);b.innerHTML=icon(liveTier?'owl':'flake')+(liveTier?tyrantNames[liveTier]:on?'挑战配置':'雪线挑战');}}
    if(!shade.hidden&&!busy&&(sceneNow!==scene||gardenEconomy.profile()!==owner||(page==='challenge'&&!showChallenge)||(['shop','talents'].includes(page)&&(!outside||inAlmanac))||(page==='intel'&&!inAlmanac)))close();
    const visible=hasProfile&&!outside&&level?.gameStarted&&!level.gameLost&&!level.gameWon&&!get('UI')?.UIInGame?.component?.paused;
    battlefield.hidden=!(visible&&liveTier);
    if(!battlefield.hidden&&Number(battlefield.dataset.tyrant||0)!==liveTier){
      theme(battlefield,liveTier);battleLabel.querySelector('b').textContent=tyrantNames[liveTier];
    }
    const guard=visible&&gardenInterceptors.status(level);interceptHUD.hidden=!guard;
    let showAir=false;
    for(const [type,btn] of airButtons){
      const info=visible&&gardenAirWing.status(type);
      if(!info)continue;showAir=true;btn.disabled=!info.available;
      const left=info.usesLeft;
      const quote=info.forbidden?'仅雪线挑战可用':left===0?'本局次数已用完':info.cost+' 阳光'+(left===null?'':' · 余 '+left+' 次');
      btn.querySelector('small').textContent=quote;
      const text=info.count?(type==='f22'?info.powered+'/'+info.count+' 供能':info.count+' 架 · '+Math.ceil(info.remaining)+' 秒'):'';
      btn.lastChild.textContent=text;btn.lastChild.hidden=!text;btn.dataset.count=String(info.count);
      const grade=info.capped?' · 工坊 '+info.ownedLevel+' 级，本关 '+info.level+' 级':'';
      const aura=type==='f22'?gardenAirWing.plantAura():null;
      const boost=aura?.count?' · 全园伤害 +'+(2*aura.count)+'% / 暴击倍率 +'+aura.critBonus.toFixed(2)+' / 碎甲 +'+Number((100*aura.shred).toFixed(1))+'%':'';
      btn.title=(info.reason||quote)+grade+boost;btn.setAttribute('aria-label',info.name+'，'+quote+grade+(info.reason?'，'+info.reason:'')+(text?'，'+text:'')+boost);
    }
    airBar.hidden=!showAir;
    if(guard){
      const count=guard.stopped+guard.diverted;interceptHUD.dataset.interceptorBlocks=String(count);
      interceptHUD.textContent=byId.get(guard.id).name+' · '+(guard.id==='intercept_mirror'?'已偏转 ':'已拦截 ')+count;
      interceptHUD.title=guard.charges!==null?'剩余 '+guard.charges+' 枚':guard.open?'护幕已展开':guard.remaining?'充能中':'就绪';
    }
    let hasGroundHeavy=false;
    for(const [id,hud] of buttons){
      const s=visible&&gardenArsenal.status(id);
      if(s?.equipped)hasGroundHeavy=true;
      hud.hidden=!s?.equipped||!s.cost;
      if(hud.hidden)continue;
      const label=s.actionName||byId.get(id).name,mode=id==='rotary'&&s.level>=5?(s.form==='ap'?'穿甲':'高爆'):'';
      hud.querySelector('b').textContent=mode?'机炮 · '+mode:label;
      hud.querySelector('small').textContent=s.cost+' 阳光';
      const quote=hud.querySelector('.ops-quote');quote.hidden=id!=='rotary';
      if(id==='rotary')quote.textContent=s.discountIn?Math.ceil(s.discountIn)+' 秒后降 50':'已至最低价';
      const count=hud.querySelector('.ops-live');count.textContent=id==='rotary'?s.count+'/5 台':s.count?'×'+s.count:'';
      count.hidden=id!=='rotary'&&!s.count;hud.dataset.full=String(id==='rotary'&&s.count>=5);
      hud.dataset.count=String(s.count);hud.disabled=!s.available;
      hud.setAttribute('aria-label',label+'，消耗 '+s.cost+' 阳光，'+(s.available?'可以部署':s.reason)+(s.count?'，生效中 '+s.count+' 组':''));
      hud.title=(s.available?'部署':s.reason)+' · '+s.cost+' 阳光'+(s.capped?' · 工坊 '+s.ownedLevel+' 级，本关 '+s.level+' 级':'')+(s.count?' · '+s.count+' 组生效中':'');
      const picture=s.level+'/'+(s.form||'');
      if(hud.dataset.picture!==picture){hud.querySelector('img').src=gearImage(byId.get(id),s.level,s.form||'');hud.dataset.picture=picture;}
    }
    limitHUD.hidden=!visible||actual()||(!showAir&&!hasGroundHeavy);
  }
  const buttons=new Map(),rail=$('.ops-battery');
  const airBar=document.createElement('div');airBar.className='ops-air-rail';airBar.setAttribute('role','group');airBar.setAttribute('aria-label','航空支援');airBar.hidden=true;rail.append(airBar);
  const airButtons=new Map();
  for(const [type,label] of [['f22','F22 卫士'],['f35','F35 增援'],['fortress','空中堡垒']]){
    const b=document.createElement('button');b.type='button';b.dataset.aircraft=type;
    b.innerHTML='<canvas aria-hidden="true"></canvas><span><b>'+label+'</b><small></small></span><em hidden></em>';
    gardenAirArt.drawBadge(b.firstChild,type);
    airBar.append(b);airButtons.set(type,b);
  }
  const interceptHUD=document.createElement('span');interceptHUD.className='ops-interceptor-status';interceptHUD.dataset.interceptorBlocks='0';interceptHUD.hidden=true;rail.append(interceptHUD);
  const limitHUD=document.createElement('span');limitHUD.className='ops-interceptor-status';limitHUD.textContent='普通关 · 重装最高 Ⅳ 级';limitHUD.hidden=true;rail.append(limitHUD);
  for(const id of ['rotary','bombard','sniper','prism']){
    const b=document.createElement('button');b.type='button';b.className='ops-fire';b.dataset.weapon=id;b.hidden=true;
    b.innerHTML='<img alt=""><span class="ops-fire-label"><b></b><small></small><span class="ops-quote" hidden></span></span><span class="ops-live" hidden></span>';
    buttons.set(id,b);rail.append(b);
  }
  atlas.onload=()=>{if(page==='challenge')challenge()};
  sync();setInterval(sync,250);
}

