// Runs in the desktop shell before the game can create its default player.
function startSnowlineWithProgress(startGame) {
  const target = 'PvZ2_Snowline_PublicBeta_01_Players';
  const preferences = 'PvZ2_Snowline_PublicBeta_01_Settings';
  const sources = [
    {id:'greenhouse',players:'PvZ2_Greenhouse_PlayerProperties_v1',settings:'PvZ2_Greenhouse_Settings_v1',name:['上一版装甲雪线','Earlier Snowline edition']},
    {id:'original',players:'PvZ2_PlayerProperties',settings:'PvZ2_Settings',name:['Gardendless 原版','Original Gardendless']}
  ];
  const readObject = raw => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };
  const list = source => {
    const slots=readObject(localStorage.getItem(source.players));
    return Array.isArray(slots) && slots.length && slots.every(p=>p && typeof p==='object' && !Array.isArray(p) && typeof p.name==='string') ? slots : null;
  };
  if(localStorage.getItem(target)!==null)return startGame();
  const available=sources.filter(s=>list(s));
  if(!available.length)return startGame();
  const dialog=document.createElement('dialog');
  dialog.id='snowline-save-choice';dialog.setAttribute('aria-labelledby','snowline-save-title');
  dialog.innerHTML='<style>#snowline-save-choice{width:min(510px,83vw);padding:22px 27px;border:1px solid #79998b;border-radius:15px;background:#153831;color:#f1eddc;box-shadow:0 18px 72px #061b18aa;font:15px/1.5 "Microsoft YaHei",Segoe UI,sans-serif}#snowline-save-choice::backdrop{background:#0d211ef2}#snowline-save-choice header,#snowline-save-choice footer{display:flex;align-items:center;justify-content:space-between;gap:12px}#snowline-save-choice header{font-size:12px;color:#dfc692}#snowline-save-choice h2{margin:12px 0 4px;font-size:26px}#snowline-save-choice p{color:#c9d9ce;margin:8px 0 14px}#snowline-save-choice fieldset{border:0;padding:0;margin:12px 0}#snowline-save-choice label{display:flex;align-items:center;gap:10px;border:1px solid #608575;border-radius:8px;margin:8px 0;padding:9px 12px;cursor:pointer}#snowline-save-choice input{accent-color:#d7bf84}#snowline-save-choice label:has(:checked){border-color:#e4cc8b;background:#254a3c}#snowline-save-choice small{display:block;color:#c2d1bd}#snowline-save-choice button{cursor:pointer;font:inherit;border-radius:6px}#snowline-save-choice [data-action=inherit]{background:#e9cf8f;color:#193227;border:0;padding:8px 16px;font-weight:700}#snowline-save-choice [data-action=fresh],#snowline-save-choice [data-action=lang]{background:transparent;color:#dbdfcd;border:1px solid #759584;padding:5px 10px}#snowline-save-choice [role=alert]{color:#ffd3a8}</style><header><b>SNOWLINE · 0.1</b><button data-action="lang" type="button"></button></header><h2 id="snowline-save-title"></h2><p></p><fieldset></fieldset><p role="alert" hidden></p><footer><button data-action="fresh" type="button"></button><button data-action="inherit" type="button"></button></footer>';
  const q=sel=>dialog.querySelector(sel);
  let language=(navigator.language||'').toLowerCase().startsWith('zh')?0:1;
  let selected=available[0];
  let busy=false;
  let started=false;
  let confirming=false;
  const strings=[
    ['保留已有进度','复制此设备上所选版本的全部玩家栏位，继续关卡、植物和钱包进度。上一版的升阶、天赋和装备一并保留。原存档始终留在原处。','全新开始','继承所选进度','English','个玩家档','未能复制，原存档仍然完好。请检查可用存储空间后重试。'],
    ['Keep your progress','Copy every player slot from a local edition, including levels, plants and currency. Earlier Snowline ranks, talents and gear carry over. Your original saves stay in place.','Start fresh','Copy selected progress','简体中文','player slots','Copy failed. Your source save is intact. Check available storage and try again.']
  ];
  function paint(){
    const t=strings[language];dialog.lang=language?'en':'zh-CN';
    q('h2').textContent=t[0];q('p').textContent=t[1];q('[data-action=fresh]').textContent=t[2];q('[data-action=inherit]').textContent=t[3];q('[data-action=lang]').textContent=t[4];
    q('fieldset').replaceChildren();
    for(const s of available){
      const slots=list(s);if(!slots)continue;
      const label=document.createElement('label'),radio=document.createElement('input'),description=document.createElement('span'),title=document.createElement('b'),summary=document.createElement('small');
      radio.name='snowline-source';radio.type='radio';radio.dataset.source=s.id;radio.checked=s===selected;
      radio.onchange=()=>{selected=s};title.textContent=s.name[language];
      summary.textContent=slots.length+' '+t[5]+' · '+slots.slice(0,3).map(p=>p.name.slice(0,24)).join(' / ');
      description.append(title,summary);label.append(radio,description);q('fieldset').append(label);
    }
  }
  const confirmPanel=document.createElement('div');
  confirmPanel.hidden=true;
  confirmPanel.innerHTML='<p></p><button data-action="back" type="button"></button> <button data-action="confirm-fresh" type="button"></button>';
  dialog.append(confirmPanel);
  const confirmationStyle=document.createElement('style');
  confirmationStyle.textContent='#snowline-save-choice [hidden]{display:none!important}#snowline-save-choice [data-action=back]{padding:7px 14px;border:0;background:#e9cf8f;color:#193227;font-weight:700}#snowline-save-choice [data-action=confirm-fresh]{padding:6px 12px;background:transparent;color:#dbdfcd;border:1px solid #759584}';
  dialog.append(confirmationStyle);
  function confirmFresh(on){
    confirming=on;confirmPanel.hidden=!on;
    q('footer').hidden=on;q('fieldset').hidden=on;
    q('footer').style.display=on?'none':'flex';
    if(on){
      confirmPanel.querySelector('p').textContent=language?'Create a separate empty beta profile? Your original slots stay untouched.':'确认创建独立空档？现有旧版栏位仍留在原处。';
      q('[data-action=back]').textContent=language?'Back to my saves':'返回，保留进度';
      q('[data-action=confirm-fresh]').textContent=language?'Confirm new profile':'确认全新开始';
      q('[data-action=back]').focus();
    }else q('[data-action=inherit]').focus();
  }
  async function choose(inherit){
    if(busy)return;busy=true;
    async function finish(){
      if(started)return;
      if(localStorage.getItem(target)===null && inherit){
        const raw=localStorage.getItem(selected.players);
        if(!raw||!list(selected))throw Error('Source changed');
        const before=localStorage.getItem(preferences),options=readObject(localStorage.getItem(selected.settings));
        let wroteSettings=false;
        try{
          if(options && typeof options==='object' && !Array.isArray(options) && before===null){
            const index=Number(options.PlayerIndex);
            options.PlayerIndex=Number.isInteger(index)&&index>=0&&index<list(selected).length?index:0;
            localStorage.setItem(preferences,JSON.stringify(options));wroteSettings=true;
          }
          localStorage.setItem(target,raw);
        }catch(error){if(wroteSettings)localStorage.removeItem(preferences);throw error;}
      }
      started=true;dialog.close();dialog.remove();return startGame();
    }
    try{
      if(navigator.locks?.request)await navigator.locks.request('snowline-public-save-init',finish);
      else await finish();
    }catch(error){if(started)throw error;const msg=q('[role=alert]');msg.hidden=false;msg.textContent=strings[language][6];}
    finally{busy=false;}
  }
  q('[data-action=lang]').onclick=()=>{language=1-language;paint();if(confirming)confirmFresh(true)};
  q('[data-action=inherit]').onclick=()=>choose(true);
  q('[data-action=fresh]').onclick=()=>confirmFresh(true);
  q('[data-action=back]').onclick=()=>confirmFresh(false);
  q('[data-action=confirm-fresh]').onclick=()=>choose(false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(confirming)confirmFresh(false);else choose(true)});
  dialog.addEventListener('keydown',e=>{if(e.key==='Enter' && !confirming && e.target!==q('[data-action=lang]')){e.preventDefault();choose(true)}});
  paint();document.body.append(dialog);dialog.showModal();q('[data-action=inherit]').focus();
  if(available.length===1)choose(true);
}
