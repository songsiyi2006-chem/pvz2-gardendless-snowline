const gardenStarterGift = (() => {
  const field='gardendlessGreenhouseV1';
  const bundle=Object.freeze({worldkey:1,gem:1000,points:100,coin:200000,cards:1});
  const candidates=gardenCatalogue.filter(p=>!p.id.startsWith('powerplant_'));
  const byId=new Map(candidates.map(p=>[p.id,p]));
  const busy=new WeakSet();
  const mod=name=>window.System?.get('chunks:///_virtual/'+name+'.ts');
  function current(){
    const game=mod('PlayerProperties')?.AllPlayerProperties;
    return game&&!game.practiceProfile&&game.allPlayers?.includes(game.currentPlayer)?game.currentPlayer:null;
  }
  function completed(p){
    // Native victory sets progress=3 before the map's completion animation writes 4.
    return Number(p?.levelProps?.tutorial4?.progress)>=3;
  }
  function state(p=current()){
    const receipt=p?.[field]?.starterGift;
    const claimed=!!receipt;
    return {eligible:completed(p),claimed,cards:receipt?.version===1&&receipt.cards===1?1:0,
      redeemed:receipt?.redeemed||null};
  }
  function choices(p=current()){
    return p?candidates.filter(plant=>!gardenEconomy.owns(p,plant.id)):[];
  }
  function transact(p,build){
    if(!p||p!==current()||busy.has(p))return false;
    busy.add(p);
    try{
      const patch=build();
      return !!patch&&p===current()&&gardenChallengeRewards.saveBundle(p,patch);
    }finally{busy.delete(p);}
  }
  function claim(p=current()){
    return transact(p,()=>{
      if(!completed(p)||state(p).claimed)return null;
      const garden=gardenEconomy.read(p),patch={};
      for(const key of ['worldkey','gem','coin']){
        const prior=p[key]??0,result=prior+bundle[key];
        if(!Number.isSafeInteger(prior)||prior<0||!Number.isSafeInteger(result))return null;
        patch[key]=result;
      }
      const points=garden.points+bundle.points;
      if(!Number.isSafeInteger(points))return null;
      patch[field]={...garden,points,starterGift:{version:1,cards:bundle.cards,redeemed:null}};
      return patch;
    });
  }
  function redeem(id,p=current()){
    return transact(p,()=>{
      const plant=byId.get(id);
      if(!plant||state(p).cards!==1||gardenEconomy.owns(p,id))return null;
      const garden=gardenEconomy.read(p),props=p.plantProps||{};
      const old=props[id]??props[plant.nativeId];
      const record={costumes:[],costume:-1,tutorialLevel:0,boost:0,medal:false,...old,progress:2};
      return {plantProps:{...props,[id]:record},
        [field]:{...garden,starterGift:{...garden.starterGift,cards:0,redeemed:id}}};
    });
  }
  const styles=`
.gift-launch{position:fixed;z-index:940;left:50%;top:46px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;min-height:27px;padding:3px 12px;border-radius:16px;border:1px solid #d2cfac;background:#314d3f;color:#fff5ce;font:600 12px/1.5 "Microsoft YaHei UI",sans-serif;box-shadow:0 2px 6px #152b2740;white-space:nowrap}
.gift-launch[data-ready=true]{color:#412b13;background:#f3dc99;border-color:#f7ecc1}.gift-launch svg{width:16px;height:16px}
.gift-dim{position:fixed;inset:0;z-index:1250;background:#0b241dc2;backdrop-filter:blur(5px);display:grid;place-items:center;padding:12px}
.gift-book{width:min(450px,100%);max-height:calc(100vh - 24px);overflow:auto;border:1px solid #bbc6b3;border-radius:18px;color:#243e33;background:#f7f5e9;box-shadow:0 18px 70px #09291b6b}
.gift-head{display:flex;align-items:center;justify-content:space-between;padding:15px 22px;background:#23493d;color:#fff6db}.gift-head h2{font-size:20px;letter-spacing:.05em;margin:0}.gift-head button{display:grid;place-items:center;width:32px;height:32px;border:1px solid #b5c4a970;border-radius:50%;color:inherit;background:transparent}
.gift-body{padding:19px 22px 20px}.gift-body p{margin:0 0 14px;line-height:1.6;font-size:14px}.gift-body dl{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#cbd0bd;border:1px solid #cbd0bd;border-radius:10px;overflow:hidden;margin:0 0 17px}.gift-body dl>div{padding:8px 12px;background:#eeeedf}.gift-body dt{font-size:12px;color:#555f4b}.gift-body dd{font-size:19px;font-weight:700;margin:0;color:#254a39}.gift-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.gift-card-count{color:#3b5747;font-weight:600}.gift-action{background:#285641;color:#fbf7dd;border:0;border-radius:9px;padding:8px 16px;font-weight:650;line-height:1.5}.gift-action:disabled{color:#617060;background:#dae0ce;cursor:default}
.gift-picker{border-top:1px solid #ced1bc;padding-top:15px;margin-top:15px}.gift-picker label{display:block;font-size:13px;color:#48604c;margin-bottom:4px}.gift-picker input,.gift-picker select{display:block;border:1px solid #aebca6;color:#253e32;border-radius:7px;background:#fbfaef;width:100%;min-height:34px;padding:5px 8px}.gift-picker select{margin:6px 0 10px;max-height:112px}.gift-picker option{padding:2px 5px}.gift-choice{display:flex;align-items:center;gap:9px;min-height:40px}.gift-choice canvas{width:40px;height:40px}.gift-result{color:#355744;font-size:13px}.gift-result:empty{display:none}.gift-result:not(:empty){margin-top:10px}.gift-book button:focus-visible,.gift-book input:focus-visible,.gift-book select:focus-visible{outline:3px solid #ab742b;outline-offset:1px}
@media(max-height:480px){.gift-head{padding:7px 14px}.gift-body{padding:9px 14px}.gift-body dl{margin-bottom:7px}.gift-body dl>div{padding:3px 10px}.gift-picker{margin-top:7px;padding-top:7px}.gift-picker select{max-height:66px}}
`;
  const giftIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5h17v4h-17zM5.5 12.5v8h13v-8m-6.5-4v12"/><path d="M11.8 8.4c-4.5.1-6.4-1.8-5.4-3.7 1.3-2.5 4.9-.6 5.4 3.7zm.5 0c4.2.1 6.1-1.8 5.1-3.7-1.3-2.5-4.6-.6-5.1 3.7z"/></svg>';
  function mount(root,tell){
    if(root.querySelector('.gift-launch'))return;
    const style=document.createElement('style');style.textContent=styles;root.append(style);
    const ui=document.createElement('div');root.append(ui);
    ui.innerHTML='<button type="button" class="gift-launch" hidden>'+giftIcon+'<span>新手礼包</span></button>'+
      '<div class="gift-dim" hidden><section class="gift-book" role="dialog" aria-modal="true" aria-labelledby="gift-title"><header class="gift-head"><h2 id="gift-title">新手礼包</h2><button type="button" aria-label="关闭礼包" class="gift-close">✕</button></header><div class="gift-body"><p class="gift-note"></p><dl class="gift-items"><div><dt>时空钥匙</dt><dd>1</dd></div><div><dt>钻石</dt><dd>1,000</dd></div><div><dt>进阶点</dt><dd>100</dd></div><div><dt>金币</dt><dd>200,000</dd></div></dl><div class="gift-row"><span class="gift-card-count"></span><button type="button" class="gift-action gift-claim">领取礼包</button></div><div class="gift-picker" hidden><label for="gift-query">选择一株尚未拥有的植物</label><input id="gift-query" type="search" placeholder="搜索植物名"><select size="4" aria-label="可兑换植物"></select><div class="gift-row"><div class="gift-choice"><canvas width="80" height="80" aria-hidden="true"></canvas><span></span></div><button type="button" class="gift-action gift-redeem">确认兑换</button></div></div><div class="gift-result" role="status" aria-live="polite"></div></div></section></div>';
    const $=s=>ui.querySelector(s),launch=$('.gift-launch'),dim=$('.gift-dim'),card=$('.gift-card-count'),search=$('input'),select=$('select'),choose=$('.gift-redeem'),receipt=$('.gift-result'),canvas=$('canvas');
    const atlas=new Image();atlas.src=gardenArt.src;
    let viewer=null,openedAt=null,selected='',available=[];
    const scene=()=>window.System?.get(window.System.resolve('cc'))?.director?.getScene?.();
    const outside=s=>s?.name==='mainScene'||s?.name==='worldMapScene';
    function selection(){
      const picked=byId.get(selected),ctx=canvas.getContext('2d');ctx.clearRect(0,0,80,80);
      canvas.hidden=!picked;$('.gift-choice span').textContent=picked?.name||'尚未选择';choose.disabled=!picked;
      const rect=picked&&gardenArt.rects[picked.id];
      if(rect&&atlas.complete&&atlas.naturalWidth){const k=70/Math.max(rect[2],rect[3]);ctx.drawImage(atlas,...rect,(80-rect[2]*k)/2,(80-rect[3]*k)/2,rect[2]*k,rect[3]*k);}
    }
    function filter(){
      const q=search.value.trim().toLowerCase(),shown=available.filter(p=>!q||p.name.includes(q)||p.id.includes(q));
      select.replaceChildren(...shown.map(p=>new Option(p.name,p.id)));
      if(!shown.some(p=>p.id===selected))selected='';
      select.value=selected;selection();
    }
    function render(){
      const status=state(viewer);
      $('.gift-note').textContent=!status.claimed?(status.eligible?'引导已完成，欢迎来到庭院。':'完成第 4 个新手引导关即可领取。'):
        status.cards?'五项奖励已到账。自选卡可留到以后使用。':'五项奖励已到账。';
      $('.gift-items').hidden=status.claimed;
      card.textContent=status.claimed?'永久植物自选卡 × '+status.cards:'含永久植物自选卡 × 1';
      $('.gift-claim').hidden=status.claimed;$('.gift-claim').disabled=!status.eligible;
      available=status.cards?choices(viewer):[];
      $('.gift-picker').hidden=!available.length;
      if(status.cards&&!available.length)receipt.textContent='已拥有全部可选植物，自选卡将继续保留。';
      if(status.redeemed)receipt.textContent='已兑换 '+(byId.get(status.redeemed)?.name||status.redeemed)+'。';
      if(available.length)filter();
    }
    function close(){dim.hidden=true;viewer=null;openedAt=null;selected='';search.value='';receipt.textContent='';if(!launch.hidden)launch.focus({preventScroll:true});}
    function sync(){
      const p=current(),now=scene(),other=root.querySelector('.shade:not([hidden]),.ops-shade:not([hidden])');
      if(!dim.hidden&&(viewer!==p||openedAt!==now||!outside(now)||other))close();
      launch.hidden=!p||!outside(now)||!!other||!dim.hidden;
      if(!launch.hidden){const s=state(p);launch.dataset.ready=String(!s.claimed&&s.eligible);launch.querySelector('span').textContent=s.claimed&&s.cards?'植物自选卡':'新手礼包';}
    }
    launch.onclick=()=>{sync();if(launch.hidden)return;viewer=current();openedAt=scene();selected='';search.value='';receipt.textContent='';dim.hidden=false;launch.hidden=true;render();$('.gift-close').focus();};
    $('.gift-close').onclick=()=>{close();sync();launch.focus({preventScroll:true});};
    dim.onclick=e=>{if(e.target===dim){close();sync();}};
    function buy(action){
      if(!viewer||viewer!==current()||openedAt!==scene()){close();sync();return;}
      try{
        const ok=action==='claim'?claim(viewer):redeem(selected,viewer);
        receipt.textContent=ok?(action==='claim'?'礼包已保存。':'兑换已保存。'):'存档或植物状态已更新，请重新确认。';
      }catch(error){receipt.textContent='存档未能写入，奖励状态已恢复。请重试。';console.warn('[Greenhouse] starter gift',error);}
      render();
    }
    $('.gift-claim').onclick=()=>buy('claim');choose.onclick=()=>buy('redeem');
    search.oninput=filter;select.onchange=()=>{selected=select.value;selection();};
    atlas.addEventListener('load',()=>{if(!dim.hidden)selection();});
    function key(e){
      if(dim.hidden)return;e.stopImmediatePropagation();if(e.type!=='keydown')return;
      if(e.key==='Escape'){e.preventDefault();close();sync();launch.focus({preventScroll:true});}
      if(e.key==='Tab'){
        const items=[...dim.querySelectorAll('button:not(:disabled),input,select')].filter(el=>el.getClientRects().length);
        if(e.shiftKey&&root.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus();}
        if(!e.shiftKey&&root.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus();}
      }
    }
    window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);
    sync();setInterval(sync,450);
  }
  return Object.freeze({state,choices,claim,redeem,mount});
})();
