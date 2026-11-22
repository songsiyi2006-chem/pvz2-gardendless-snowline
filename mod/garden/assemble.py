"""Assemble edition scripts against the extracted 0.16.24 game build."""
from pathlib import Path
import argparse
import json
import re
import sys
import subprocess

HERE = Path(__file__).resolve().parent
WORK = HERE.parent
sys.path.insert(0, str(WORK / 'installed'))
import fairplay
import speed
import badges
import fx_settings
import fixed_rank
import challenge_core
import challenge_simulation_cost
import challenge_nursery
import challenge_rewards
import challenge_armor
import world_veterans
import challenge_hybrids
import laser_shield

SOURCE = WORK/'format/original'
REPLACEMENTS = WORK/'format/replacements'
OLD_KEY = 'PvZ2_PlayerProperties'
NEW_KEY = 'PvZ2_Snowline_PublicBeta_01_Players'

def read(p):
    return p.read_text(encoding='utf8')

def read_json(p):
    return json.loads(read(p))

def literal(v):
    return json.dumps(v,ensure_ascii=False,separators=(',',':'))

def wrapper(battle):
    source = WORK/'sources'
    catalogue = read(source/'catalog.js').replace('export const catalogue', 'const catalogue')
    catalogue = catalogue.replace('期间受到的升阶技能的直接伤害','期间受到的升阶技能直接伤害').replace('适格目标','可选目标').replace('；','。')
    art = read_json(WORK/'format/portraits.json')
    if globals().get('portrait_source'):
        art['src']=portrait_source
    levels = read_json(SOURCE/'assets/resources/config.json')['paths'].values()
    stage_ids = sorted({r[0][7:] for r in levels if r[0].startswith('levels/')})
    egypt = read_json(WORK/'installed/egypt-manifest.json')
    homes = {p:'古埃及' for p in egypt['plants']}
    if battle:
        combat = read(source/'battle.js')
        combat = re.sub(r"""import\s*\{[^}]*\}\s*from\s*['"]\./catalog\.js['"];?""",'',combat)
        combat = re.sub(r'\bexport\s+(?=(?:async\s+)?function\s+install\b)', '', combat)
        if re.search(r'^\s*(import|export)\b',combat,re.M):raise ValueError('Unexpected module header in combat runtime')
    else:
        combat = 'async function install(){}'
    internals=read_json(source/'native-internals.json')
    return '\n'.join([read(HERE/'beta-notice.js'),catalogue,'const gardenCatalogue = [...catalogue];',
        'const gardenNativeIds = new Map(catalogue.map(p=>[p.id,p.nativeId]));',
        'const gardenPlantIds = new Set(gardenNativeIds.keys());',
        read(HERE/'compatible-plants.js').replace('/*NATIVE_INTERNALS*/[]',literal(internals)),
        'const gardenArt = '+literal(art)+';',
        'const gardenHome = '+literal(homes)+';',
        'const gardenLevelIds = new Set('+ literal(stage_ids) +');',
        'const gardenStyles = '+literal(read(HERE/'greenhouse.css')+'\n'+read(HERE/'operations.css'))+';',
        fixed_rank.helper(),challenge_core.helper(),challenge_simulation_cost.helper(),challenge_nursery.helper(),challenge_rewards.helper(),read(HERE/'adventure-fourth.js'),challenge_armor.helper(),
        world_veterans.helper(),read(HERE/'expedition-armor-paint.js'), read(HERE/'challenge-armor-art.js'),read(HERE/'challenge-field-support.js'),
        read(HERE/'hybrid-roster.js'),read(HERE/'challenge-troopers.js'),read(HERE/'mortar-art.js'),read(HERE/'challenge-mortar.js'),challenge_hybrids.helper(),laser_shield.helper(),read(HERE/'hybrid-native-shots.js'),read(HERE/'hybrid-heads.js'),read(HERE/'hybrid-art.js'),read(HERE/'challenge-air-raid.js'),
        read(HERE/'mode-mastery-advanced.js'),read(HERE/'mode-mastery.js'),read(HERE/'modes.js'),read(HERE/'economy.js'),read(HERE/'starter-gift.js'),read(HERE/'talents.js'),read(HERE/'talent-view.js'),read(HERE/'plant-critical.js'),read(HERE/'plate.js'),read(HERE/'view.js'),
        read(HERE/'speed-lock.js'),read(HERE/'armory.js'),read(HERE/'interceptors.js'),read(HERE/'equipment-apex.js'),read(HERE/'rotary-advanced.js'),read(HERE/'fire-support-advanced.js'),read(HERE/'sniper-watch.js'),read(HERE/'equipment-upgrades.js'),read(HERE/'weapon-audio.js'),read(HERE/'arsenal-art.js'),read(HERE/'arsenal.js'),
        read(HERE/'air-wing.js'),read(HERE/'air-impact-art.js'),read(HERE/'air-fire-art.js'),read(HERE/'air-wing-art.js'),read(HERE/'equipment-engraving.js'),read(HERE/'equipment-detail.js'),read(HERE/'equipment-tier-art.js'),read(HERE/'armory-art.js'),read(HERE/'challenge-banner.js'),read(HERE/'simulation-controls.js'),read(HERE/'operations-view.js'),read(HERE/'world-almanac.js'),
        read(HERE/'fx-settings.js'),read(HERE/'holo-impact.js'),combat])

def attach(source, helpers):
    import stats, functional
    once = fairplay.once
    source=once(source,'Math.min(this.CurrentValue+t,9900)','Math.min(this.CurrentValue+t,99999)')
    source=once(source,'isNaN(t)&&(t=50),this.CurrentValue=t,this.TargetValue=t,this.ShownValue=t','isNaN(t)&&(t=50),t=Math.min(t,99999),this.CurrentValue=t,this.TargetValue=t,this.ShownValue=t')
    source=once(source,'this.ShownValue=this.TargetValue=this.CurrentValue=this.InitialValue','this.ShownValue=this.TargetValue=this.CurrentValue=Math.min(this.InitialValue,99999)')
    source=speed.controls(source)
    source=stats.apply(source)
    source=functional.apply(source)
    source=fixed_rank.apply(source)
    source=challenge_core.apply(source)
    source=challenge_simulation_cost.apply(source)
    source=challenge_nursery.apply(source)
    source=world_veterans.apply(source)
    source=challenge_rewards.apply(source)
    source=challenge_armor.apply(source)
    source=challenge_hybrids.apply(source)
    source=laser_shield.apply(source)
    import plant_critical
    source=plant_critical.apply(source)
    import plant_simulation
    source=plant_simulation.apply(source)
    source=once(source,'r=this.getSpecial(n,i),this.specialLabel.string=r',
        'r=this.getSpecial(n,i),r=gardenAlmanacVeteranText(r,F.getZombieFeature(t)?.CODENAME,i.progress>=v.known),this.specialLabel.string=r')
    source=badges.apply(source)
    source=fx_settings.apply(source)
    source=once(source,'const record = player.plantProps[id] ?? (player.plantProps[id] = {',
        'const legacy = player.plantProps[gardenNativeIds.get(id)];'
        'if(!player.plantProps[id] && legacy) player.plantProps[id]=legacy;'
        'const record = player.plantProps[id] ?? (player.plantProps[id] = {')
    source=once(source,'Z.gameStart(),this.gameStarted=!0,A.component.gameStart()',
                'Z.gameStart(),this.gameStarted=!0,gardenEconomy.start(this,ta,me.currentPlayer),A.component.gameStart()')
    source=once(source,'this.saveDangerroomMiniGamePlayerProperties(!0),me.savePP()}},c.spawnPrize',
                'this.saveDangerroomMiniGamePlayerProperties(!0),me.savePP(),gardenEconomy.win(this)}},c.spawnPrize')
    # The desktop save chooser inherits players and settings together before Cocos starts.
    source=once(source,'var e=w.localStorage.getItem(Bi);if(e==null){e=w.localStorage.getItem("PvZ2_Settings");if(e!=null)w.localStorage.setItem(Bi,e)}var i=JSON.parse(e);',
                'var e=w.localStorage.getItem(Bi),i=JSON.parse(e);')
    source=source.replace('PvZ2_Greenhouse_Settings_v1','PvZ2_Snowline_PublicBeta_01_Settings')
    start=source.index('t.showUpdates=function()')
    stop=source.index(',l.updates=function()',start)
    source=source[:start]+'t.showUpdates=async function(){gardenBetaNotice.open(B.currentLanguage===W.ZH)}'+source[stop:]
    start=source.index('t.fetchForUpdate=function()')
    stop=source.index(',l.start=function()',start)
    source=source[:start]+'t.fetchForUpdate=function(){gardenBetaNotice.first(B.currentLanguage===W.ZH)}'+source[stop:]
    bootstrap="""
    let launched=false;
    const greenhouseInit=setInterval(async()=>{
      if(launched||!window.System?.get?.('chunks:///_virtual/Plant.ts')?.Plant ||
         !window.System?.get?.('chunks:///_virtual/PlayerProperties.ts')?.AllPlayerProperties)return;
      launched=true;
      clearInterval(greenhouseInit);
      try{
        gardenCompatible.refresh();
        await install(null,gardenBattleRank);
        await gardenArsenal.install();
        gardenChallengeArmorArt.install();
        gardenHybridArt.install();
        mountGarden();
        gardenFxSettings.warm();
      }catch(error){console.error('[Greenhouse] startup',error);const report=document.createElement('div');
        report.textContent='升阶温室加载失败：'+(error?.message||error);report.style.cssText='z-index:10000;position:fixed;top:0;background:#ffeecb;color:#57331a;padding:6px';document.body.append(report)}
    },150);
    """
    return '(function(){\n'+helpers+'\n'+source+'\n'+bootstrap+'\n})();'

def build(preview=False, regenerate=True):
    target=WORK/'qa'/'preview' if preview else REPLACEMENTS
    if regenerate:
        subprocess.run([sys.executable,'-X','utf8',str(HERE/'modes_build.py')],check=True)
        subprocess.run([sys.executable,'-X','utf8',str(WORK/'sources/compile_catalog.py')],check=True)
    changes=set(fairplay.ASSETS)|{speed.ENGINE}
    for f in (SOURCE/'assets').glob('*.js'):
        if OLD_KEY in read(f):changes.add(f.relative_to(SOURCE).as_posix())
    helpers=wrapper(not preview)
    for path in sorted(changes):
        raw=read(SOURCE/path)
        if path==fairplay.BOOT and globals().get('compat_boot'):
            dst=target/path
            dst.parent.mkdir(parents=True,exist_ok=True)
            dst.write_text(compat_boot(raw,read(HERE/'save-choice.js')),encoding='utf8',newline='\n')
            continue
        code=fairplay.transform(path,raw).replace(OLD_KEY,NEW_KEY)
        if path==fairplay.MAIN:code=attach(code,helpers)
        if path==speed.ENGINE:code=speed.timestep(code)
        code=code.replace('PvZ2_Greenhouse_', 'PvZ2_Snowline_PublicBeta_01_')
        if path==fairplay.BOOT:
            code=fairplay.once(code,'Wr();export{',read(HERE/'save-choice.js')+'\nstartSnowlineWithProgress(Wr);export{')
        dst=target/path
        dst.parent.mkdir(parents=True,exist_ok=True)
        dst.write_text(code,encoding='utf8',newline='\n')
    return target

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--preview',action='store_true')
    a=p.parse_args()
    print(build(a.preview))
