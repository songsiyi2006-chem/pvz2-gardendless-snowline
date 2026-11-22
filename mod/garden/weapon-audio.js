// The UUIDs refer to AudioClips on this game's plant and projectile prefabs.
// Load only the clips used by equipped gear, without loading their plant animations or textures.
const gardenWeaponAudio=(()=>{
  const ids={
    cannon:'2b13e512-ab0b-4012-9126-913506916317',coconutHit:'88e90c90-a4f9-4b3c-b318-bb5ce9923b1d',
    cannonReady:'74344ebd-8c4c-4ddc-8e56-a20c0e13ac09',pea:'d552833f-d03f-4f93-8377-c7ff7fbfcba4',
    spike:'41a119d4-c032-4365-8c2f-9cf550b09544',leaf:'8fdd7cd4-fb8b-423d-8ee1-30cf9514379b',
    zap:'c43dfc7b-6b98-4888-ae37-7f1b58cee746',laser:'83e27614-cced-42c5-b429-d3fbb65ba12d',
    frost:'120a7013-9012-4de9-a018-96dd2a27f68e',wind:'4bbb6941-c517-459f-81fd-7aea092cda37',
    squish:'c2eba0b8-4aaa-45ad-8703-0f0815ecfe53',drum:'6aa98844-065d-401a-9f88-da3cc3b62c7d',
    spore:'e13f8e9b-acba-4037-8e54-448d90f7ca4b',fruit:'688560cc-abe2-4ace-bc7e-a68a31533927',
    swish:'8323323b-ab5f-485d-9559-1e5045a0f666',smash:'af674cbd-fe83-4c4a-9ab6-dc1158e62fc0',
  };
  // clip, level at full user SFX volume, minimum real milliseconds between cues
  const cues={
    'air-strafe':['pea',.37,210],'air-guided':['cannon',.56,380],'air-cluster':['coconutHit',.50,290],
    'air-ember':['wind',.48,450],'air-fortress':['smash',.68,540],
    intercept_firefly:['zap',.38,220],intercept_dome:['wind',.45,390],intercept_mirror:['laser',.36,330],
    sniper:['cannon',.70,320],'precision-pierce':['cannon',.80,320],'precision-burst':['coconutHit',.54,260],
    'precision-cleave':['leaf',.59,260],'mk14-hit':['pea',.67,145],'mk14-miss':['swish',.42,220],
    'precision-fragment':['swish',.20,250],'precision-echo':['coconutHit',.30,160],
    'precision-blade':['leaf',.19,230],'precision-chain':['zap',.29,155],
    thorn:['spike',.34,500],spin:['cannonReady',.64,750],rotary:['pea',.59,130],
    'rotary-blast':['coconutHit',.42,320],'rotary-cleave':['swish',.35,310],'rotary-column':['zap',.31,420],
    'rotary-ap':['spike',.47,100],
    target:['swish',.29,580],shell:['cannon',.48,360],bombard:['coconutHit',.8,280],
    'bombard-heavy':['smash',.81,420],'bombard-satellite':['cannon',.44,460],'bombard-curtain':['wind',.33,900],
    'prism-lock':['zap',.44,420],'prism-fold':['laser',.23,650],
    prism:['laser',.49,350],sun:['laser',.21,600],growth:['leaf',.20,700],shield:['smash',.21,660],
    heal:['drum',.15,620],rain:['squish',.27,570],tempo:['drum',.44,400],frost:['frost',.43,480],
    wind:['wind',.39,640],mire:['squish',.37,500],arc:['zap',.45,230],shard:['leaf',.40,290],
    roost:['swish',.38,310],spore:['spore',.35,700],flare:['fruit',.44,570],
  };
  const gearCues={sniper:['sniper','mk14-hit','mk14-miss','precision-burst','precision-cleave','precision-chain'],thorns:['thorn','prism'],
    airwing:['air-strafe','air-guided','air-cluster','air-ember','air-fortress'],
    intercept_firefly:['intercept_firefly'],intercept_dome:['intercept_dome'],intercept_mirror:['intercept_mirror'],
    rotary:['spin','rotary','rotary-ap','rotary-blast','rotary-cleave','rotary-column'],bombard:['target','shell','bombard','bombard-heavy','bombard-satellite','bombard-curtain'],prism:['prism','prism-lock','prism-fold'],reservoir:['sun'],dew:['sun'],
    orchard:['growth','thorn','sun'],relay:['growth','arc'],bounty:['flare','sun'],infirmary:['heal','shard'],rain:['rain'],
    shell:['shield','shard'],detox:['heal','spore'],tempo:['tempo'],frost:['frost'],wind:['wind'],mire:['mire'],
    tripwire:['arc'],arc:['arc'],shard:['shard'],roost:['roost'],flare:['flare'],mycelium:['spore']};
  const clips=new Map(),pending=new Map(),runs=new WeakMap();
  const mod=name=>window.System.get('chunks:///_virtual/'+name+'.ts');
  function load(key){
    if(clips.has(key))return Promise.resolve(clips.get(key));
    if(pending.has(key))return pending.get(key);
    const C=window.System.get(window.System.resolve('cc'));
    if(!C?.assetManager)return Promise.resolve(null);
    const job=new Promise(resolve=>C.assetManager.loadAny({uuid:ids[key],bundle:'resources'},(err,clip)=>{
      pending.delete(key);if(clip instanceof C.AudioClip)clips.set(key,clip);resolve(clips.get(key)||null);
    }));pending.set(key,job);return job;
  }
  function prepare(equipped){
    const sounds=new Set();
    for(const id of equipped||[])for(const cue of gearCues[id]||[])sounds.add(cues[cue][0]);
    return Promise.all([...sounds].map(load));
  }
  function play(s,kind){
    if(!s||typeof kind!=='string'||s.level?.gameLost||s.level?.gameWon||mod('UI')?.UIInGame?.component?.paused)return false;
    const clean=kind.startsWith('mk14-hit')?'mk14-hit':kind.startsWith('mk14-miss')?'mk14-miss':kind;
    const cue=cues[clean];if(!cue||!(mod('SoundsController')?.SoundFXController?.SoundFXVolume>0))return false;
    const sounds=mod('SoundRescourses')?.sounds,clip=clips.get(cue[0]);if(!sounds?.sr)return false;
    if(!clip){load(cue[0]);return false;}
    let run=runs.get(s);if(!run){run={last:new Map(),recent:[]};runs.set(s,run);}
    const now=performance.now(),group=clean.startsWith('mk14-')?'mk14':clean;
    if(now-(run.last.get(group)??-Infinity)<cue[2])return false;
    run.recent=run.recent.filter(stamp=>now-stamp<210);
    if(run.recent.length>=(cue[1]>=.5?5:3))return false;
    run.last.set(group,now);run.recent.push(now);
    // The original mixer applies SoundFXVolume at playback and honors the user's master slider.
    sounds.playOneShot(clip,cue[1],.045,.5,false,true);return true;
  }
  return Object.freeze({prepare,play});
})();
