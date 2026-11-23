"""Keep plant identities across native projectiles, asynchronous bursts, and pickups."""
from pathlib import Path
import json
import re

HERE = Path(__file__).resolve().parent
EFFECTS = {
    'AtomBomb': 'atombomb_seedling', 'BambooShoots': 'bambooshoot', 'HollyBarrier': 'hollyknight',
    'MariGoldOrange': 'marigold', 'MariGoldRed': 'marigold', 'MurkadamiaNut': 'murkadamia',
    'PotatoMinePrimal': 'primalpotatomine', 'Seedling': 'atombomb_seedling',
    'duskSplat': 'dusklobber', 'electricblueberryCloud': 'electricblueberry',
    'grimroseFoot': 'grimrose', 'jackOLanternFoodFireParticle': 'jackolantern',
    'lightningCloud': 'lightningreed', 'noctarineBuffParticle': 'noctarine',
    'strawburstPFBerry': 'strawburst',
}
DEFERRED = {'sunbombExplosion','CranjellyTileLiquid','MoltenPoolTileLiquid','SnapDragonFoodPar'}


def apply(source):
    roster = json.loads((HERE.parent/'sources/roster.json').read_text(encoding='utf8'))
    codes = {p['id'].replace('_','').lower():p['id'] for p in roster}
    parts = re.split(r'(?=System\.register\("chunks:///_virtual/)',source)
    edits = {
        'Projectiles':[
            ('gardenCombatStats.projectile(m,sourceRank,v._objdataOrg)','gardenCombatStats.projectile(m,sourceRank,v._objdataOrg,plantCode)'),
            ('plantShot=gardenCombatStats.launchingPlant,hostile=', 'plantShot=gardenCombatStats.launchingPlant,plantCode=gardenCombatStats.launchingCode,hostile='),
            ('v._gardenPlantShot=plantShot&&!hostile,', 'v._gardenPlantShot=plantShot&&!hostile,v._gardenSimulationId=v._gardenPlantShot?plantCode:null,v._gardenAlliedPlantId=!hostile&&!plantShot?plantCode:null,v._gardenAlliedShot=!!v._gardenAlliedPlantId,')],
        'GroundFiresManager':[('gardenPlantCritical.sourceClass(r)', 'gardenPlantCritical.sourceClass(r,i._gardenPlantFire)')],
        'commonShot':[
            ('this._gardenPlantShot,[i.poison.DPS', '(this._gardenSimulationId||this._gardenPlantShot),[i.poison.DPS'),
            ('stackedPoison(i.poisonStacked,this._gardenPlantShot)', 'stackedPoison(i.poisonStacked,this._gardenSimulationId||this._gardenPlantShot)'),
            ('this.inLnC.SpawnTileLiquidWithDuration(this.tileLiquid,this.tileLiquidDuration)','this.inLnC.SpawnTileLiquidWithDuration(this.tileLiquid,this.tileLiquidDuration,this._gardenSimulationId)'),
            ('||(e.hypnotized=!0),!i.icebloomblock', '||(!e.hypnotized&&gardenPlantSimulation.recruit(e,this._gardenSimulationId),e.hypnotized=!0),!i.icebloomblock'),
            ('&&(e.CarriedSporeShroom=!0)', '&&(e._gardenSporeOwner=this._gardenSimulationId,e.CarriedSporeShroom=!0)'),
            ('h.SpawnPlant=function(){var e=r(l().mark((function e(t){var i,o=this;', 'h.SpawnPlant=function(){var e=r(l().mark((function e(t){var i,o=this;const parent=this._gardenSimulationId;'),
            ('(i=e.sent)&&i.onSpawnedByBamboozleShot()', '(i=e.sent)&&(gardenPlantSimulation.inherit(i,parent),i.onSpawnedByBamboozleShot())'),
            ('h.SpawnZombie=function(){var e=r(l().mark((function e(t){var i,o,n;', 'h.SpawnZombie=function(){var e=r(l().mark((function e(t){var i,o,n;const parent=this._gardenSimulationId;'),
            ('e.sent.concat(n).forEach((function(e){e.worldPositionVec3=o', 'e.sent.concat(n).forEach((function(e){if(!i)gardenPlantSimulation.recruit(e,parent);e.worldPositionVec3=o')],
        'SnapDragon':[('n.inLane=this.inLane,n.damage=this._objdataOwn.DamagePlantfood','n._gardenSimulationId=gardenPlantSimulation.owner(this),n.inLane=this.inLane,n.damage=this._objdataOwn.DamagePlantfood')],
        'sunbomb':[('i.getComponent(w).sunbombProps=this.sunbombProps','i.getComponent(w)._gardenSimulationId=gardenPlantSimulation.owner(this),i.getComponent(w).sunbombProps=this.sunbombProps')],
        'ChiliBean':[('new f(this.objdataOwn.MintPoisonDPS,a)', 'new f(this.objdataOwn.MintPoisonDPS*gardenPlantSimulation.factor(this),a)')],
        'goopeaFoodPrj':[
            ('e.setPoison(a.DPS,a.duration)', 'gardenPlantCritical.poison(e,t._gardenSimulationId||t._gardenPlantShot,[a.DPS,a.duration])'),
            ('t.SpawnTileLiquid(i,{})','t.SpawnTileLiquid(i,{_gardenSimulationId:this._gardenSimulationId})')],
        'GooTileLiquid':[('i.setPoison(t.objdataOwn.PoisonDPS,t.objdataOwn.SapflingDuration)','gardenPlantCritical.poison(i,t._gardenSimulationId,[t.objdataOwn.PoisonDPS,t.objdataOwn.SapflingDuration])')],
        'BuduhBoom':[('t.SpawnTileLiquid(e.objdataOwn.LiquidType,{})','t.SpawnTileLiquid(e.objdataOwn.LiquidType,{_gardenSimulationId:gardenPlantSimulation.owner(e)})')],
        'MariGoldPurple':[('t.setPoison(e,a._objdataOwn.PoisonDuration)','gardenPlantCritical.poison(t,gardenPlantSimulation.owner(a),[e,a._objdataOwn.PoisonDuration])')],
        'GargantuarZombie':[('h.hypnotized=u,this.impOnThrow(h)','h.hypnotized=u,u&&gardenPlantSimulation.recruit(h,this._gardenAlliedPlantId),this.impOnThrow(h)')],
        'Plant':[('h.transIntoAnotherPlant=function(){var t=s(l().mark((function t(n,i){var e,a,o,s,h;', 'h.transIntoAnotherPlant=function(){var t=s(l().mark((function t(n,i){var e,a,o,s,h;const parentCode=this._gardenSimulationId;'),
                 ('s.readKeptDataOnTrans(o),s.anmControl.switchCostume','gardenPlantSimulation.inherit(s,parentCode),s.readKeptDataOnTrans(o),s.anmControl.switchCostume')],
        'CeleryStalker':[('(e=t.sent)&&(e.hurting=60','(e=t.sent)&&(gardenPlantSimulation.inherit(e,u),e.hurting=60')],
        'PotatoMine':[('(d=t.sent)&&(d.worldPosition=s','(d=t.sent)&&(gardenPlantSimulation.inherit(d,this),d.worldPosition=s')],
        'Turnip':[('(c=t.sent)&&(c.worldPosition=a','(c=t.sent)&&(gardenPlantSimulation.inherit(c,this),c.worldPosition=a')],
        'Seedling':[('(n=e.sent)&&(n.endangered=t','(n=e.sent)&&(gardenPlantSimulation.inherit(n,this),n.endangered=t')],
        'DragonbruitBaby':[('e.sent.endangered=this.endangered','gardenPlantSimulation.inherit(e.sent,this).endangered=this.endangered')],
        'Dragonbruit':[('s.spawnBabies=function(){var n=i(r().mark((function n(){var t,o,e,a,i,s,u,c;', 's.spawnBabies=function(){var n=i(r().mark((function n(){var t,o,e,a,i,s,u,c;const parent=gardenPlantSimulation.owner(this,"dragonbruit");'),
                      ('(c=n.sent)&&(u.pushPlant(c)','(c=n.sent)&&(gardenPlantSimulation.inherit(c,parent),u.pushPlant(c)')],
        'MariGold':[('i._turn=function(n,t){var o=this;', 'i._turn=function(n,t){var o=this;const parent=gardenPlantSimulation.owner(this);'),
                    ('var e=n;if(e){var r;', 'var e=n;if(e){var r;gardenPlantSimulation.inherit(e,parent);')],
        'bamboozleShot':[('specialOnGroundHit=function(o){var t;','specialOnGroundHit=function(o){var t;const parent=this._gardenSimulationId;'),
                        ('o&&o.onSpawnedByBamboozleShot()', 'o&&(gardenPlantSimulation.inherit(o,parent),o.onSpawnedByBamboozleShot())')],
        'ZoybeanPod':[('f.onSpawnedByZoybeanPod(this),','gardenPlantSimulation.recruit(f,gardenPlantSimulation.owner(this)),f.onSpawnedByZoybeanPod(this),')],
        'HypnoShroom':[
            ('(h=d.value).hypnotized=!0,','(h=d.value).hypnotized=!0,gardenPlantSimulation.recruit(h,gardenPlantSimulation.owner(this)),'),
            ('o.hypnotized=!0,o.dealDamageScale.push','o.hypnotized=!0,gardenPlantSimulation.recruit(o,gardenPlantSimulation.owner(this)),o.dealDamageScale.push')],
        'WitchHazel':[('c.turnIntoSporeShroom(e,null,r)', 'c.turnIntoSporeShroom(e,null,r,gardenPlantSimulation.owner(t))')],
        'Zombie':[
            ('this.tangled=!1,this._gardenSunYield=1,','this.tangled=!1,this._gardenAlliedPlantId=null,this._gardenSporeOwner=null,this._gardenSunYield=1,'),
            ('this.turnIntoSporeShroom("sporeshroom")','this.turnIntoSporeShroom("sporeshroom",null,void 0,this._gardenSporeOwner)'),
            ('l.turnIntoSporeShroom=function(t,e,i){','l.turnIntoSporeShroom=function(t,e,i,parent){'),
            ('l.onSpawnedAsSporeShroom(),l.shovelDropSun', 'gardenPlantSimulation.inherit(l,parent),l.onSpawnedAsSporeShroom(),l.shovelDropSun'),
            ('(c=a.sent)&&(c.onSpawnedAsSporeShroom()','(c=a.sent)&&(gardenPlantSimulation.inherit(c,parent),c.onSpawnedAsSporeShroom()'),
            ('var r=new z(this.dps*t,!0,!1,!1,null);','var r=new (gardenPlantSimulation.alliedClass(z,this))(this.dps*t,!0,!1,!1,null);')],
        'cranjellyProjectile':[('n.inLnC.SpawnTileLiquidWithDuration(n.objdataOwn.LiquidType,30)','n.inLnC.SpawnTileLiquidWithDuration(n.objdataOwn.LiquidType,30,n._gardenSimulationId)')],
        'LavaGuava':[('t.SpawnTileLiquidWithDuration(e,this.objdataOwn.LavaLifeSpan)','t.SpawnTileLiquidWithDuration(e,this.objdataOwn.LavaLifeSpan,gardenPlantSimulation.owner(this))')],
        'LnC':[
            ('o.node.parent=this.inLane.tileLiquidLayer,o.inLnC=this','o._gardenSimulationId=n?._gardenSimulationId||null,o.node.parent=this.inLane.tileLiquidLayer,o.inLnC=this'),
            ('r.SpawnTileLiquidWithDuration=function(){var t=n(i().mark((function t(e,n){','r.SpawnTileLiquidWithDuration=function(){var t=n(i().mark((function t(e,n,plantCode){'),
            ('this.SpawnTileLiquid(e,{LifeSpan:n})','this.SpawnTileLiquid(e,{LifeSpan:n,_gardenSimulationId:plantCode})')],
    }
    for i,part in enumerate(parts):
        match=re.match(r'System\.register\("chunks:///_virtual/([\w$]+)\.ts"',part)
        if not match:continue
        name=match[1]
        for old,new in edits.pop(name,[]):
            count=part.count(old)
            if count!=1:raise ValueError(f'Unexpected simulation anchor {name} ({count}): {old}')
            part=part.replace(old,new)
        code=EFFECTS.get(name) or codes.get(name.lower())
        if name=='ArmaMint':
            part,n=re.subn(r'\bd\.throwOneBananaOnPos\(', 'gardenCombatStats.summonShot(this,d,"throwOneBananaOnPos",',part)
            if n!=3:raise ValueError('ArmaMint launch count '+str(n))
        if name in ('MagnetShroom','SnapPea','ShadowPeashooter'):
            part,n=re.subn(r'(\.(?:shootOnePea|lobOneCabbageOn(?:Zombie|Tomb|Pos|Node))AccCS\()([\w$]+),',r'\1gardenPlantSimulation.reuseShot(\2,this),',part)
            if not n:raise ValueError('Missing re-used attack '+name)
        if name in DEFERRED or code:
            # Within a native forEach callback “this” may be absent. A concrete
            # plant class provides its own fallback; shared effects carry the creator.
            owner='gardenPlantSimulation.owner(this'+(','+json.dumps(code) if code else '')+')'
            part=re.sub(r'gardenPlantCritical\.sourceClass\(([\w$]+)\)',lambda m:'gardenPlantCritical.sourceClass('+m[1]+','+owner+')',part)
            part=part.replace('gardenPlantCritical.shared(', 'gardenPlantCritical.sharedFrom('+owner+',')
            part=part.replace('gardenPlantCritical.plantPoison(', 'gardenPlantCritical.poisonFrom('+owner+',')
        if name.endswith('Zombie') and name!='Zombie':
            aliases=re.findall(r'\b([\w$]+)=[\w$]+\.ZombieDamageDetails\b',part.partition('execute:function()')[0])
            for alias in aliases:
                pattern=r'\bnew '+re.escape(alias)+r'\((?:([\w$]+)\.(?=dps\b|_?objdataOwn\b))?'
                def tag(m):
                    body=m[1] or 'this'
                    return 'new (gardenPlantSimulation.alliedClass('+alias+','+body+'))('+((m[1]+'.') if m[1] else '')
                part=re.sub(pattern,tag,part)
        parts[i]=part
    if edits:raise ValueError(f'Missing simulation modules {list(edits)}')
    return (HERE/'plant-simulation.js').read_text(encoding='utf8')+'\n'+''.join(parts)
