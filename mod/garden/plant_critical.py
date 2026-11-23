"""Bind critical hits at known player-plant origins and resolve before native armour."""
import re
from pathlib import Path
from fairplay import once
def apply(source):
    parts=re.split(r'(?=System\.register\("chunks:///_virtual/)',source)
    classified=0
    plant_effects={'MariGoldOrange','MariGoldRed','SnapDragonFoodPar','CranjellyTileLiquid','MoltenPoolTileLiquid',
                   'duskSplat','electricblueberryCloud','grimroseFoot','jackOLanternFoodFireParticle','lightningCloud',
                   'noctarineBuffParticle','strawburstPFBerry','sunbombExplosion'}
    for index,part in enumerate(parts):
        match=re.match(r'System\.register\("chunks:///_virtual/([\w$]+)\.ts"',part)
        if not match:continue
        name=match[1]
        if name=='Projectiles':
            part=once(part,'const sourceRank=gardenCombatStats.launchingRank,hostile=', 'const sourceRank=gardenCombatStats.launchingRank,plantShot=gardenCombatStats.launchingPlant,hostile=')
            part=once(part,'._gardenCombatRank=sourceRank,v._gardenChallengeHostile=hostile', '._gardenCombatRank=sourceRank,v._gardenPlantShot=plantShot&&!hostile,v._gardenChallengeHostile=hostile')
        # All module classes exporting an actual plant construct their own damage, e.g.
        # Bonk Choy's punches, Squash's landing, Laser Bean and Fume-shroom.
        plant=(bool(re.search(r'\w+\("[\w$]*Plant",',part)) or name in plant_effects) and name not in ('CharacterManager','LnC','Zombie')
        header=part.partition('execute:function()')[0]
        shot=name in ('commonShot','electricPea') or ('./commonShot.ts' in header and 'Zombie' not in name and 'ZombieDamageDetails' in header)
        if name=='CharacterManager':
            part=once(part,'stabOnZombie=function(t,n,o){null==n||n.dealDamage(new z(', 'stabOnZombie=function(t,n,o){null==n||n.dealDamage(new (gardenPlantCritical.commonClass(z))(')
            anchor='gardenChallengeArmor.copyFlags(this,n),'
            if part.count(anchor)!=3:raise ValueError('Expected three native damage copy methods')
            part=part.replace(anchor,'gardenPlantCritical.copy(this,n),'+anchor)
        if plant or shot or name=='LnC':
            aliases=re.findall(r'\b([\w$]+)=[\w$]+\.ZombieDamageDetails\b',part.partition('execute:function()')[0])
            for alias in aliases:
                if name=='cactusThorn':
                    part=part.replace('new '+alias+'(o.damage*o.damageScale','new (gardenPlantCritical.shotClass('+alias+',o))(o.damage*o.damageScale')
                if name=='shadowpeaPFLobbed':
                    part=part.replace('new '+alias+'(h.objdataOwn.RayDamage','new (gardenPlantCritical.shotClass('+alias+',h))(h.objdataOwn.RayDamage')
                mark=('gardenPlantCritical.sourceClass('+alias+')' if plant else 'gardenPlantCritical.shotClass('+alias+',this)' if shot else 'gardenPlantCritical.commonClass('+alias+')')
                part,n=re.subn(r'\bnew '+re.escape(alias)+r'\(', 'new ('+mark+')(',part);classified+=n
        if plant:
            part=re.sub(r'(?<![\w$.])([\w$.]+)\.(explode(?:Cherry3x3|Squdow1x1|Spudow3x3)|stabOnZombie|burnFromLnC)\(',lambda m:'gardenPlantCritical.shared('+m[1]+',"'+m[2]+'",',part)
            part=re.sub(r'(?<![\w$.])([\w$.]+)\.setPoison\(',lambda m:'gardenPlantCritical.plantPoison('+m[1]+',',part)
        if name=='Jalapeno':
            part=once(part,'v.groundFires=g,v.damage=t','v._gardenPlantFire=gardenPlantCritical.plantCall,v.groundFires=g,v.damage=t')
        if name=='GroundFiresManager':
            part=once(part,'new r(i.damage*','new (i._gardenPlantFire?gardenPlantCritical.sourceClass(r):r)(i.damage*')
        if name=='commonShot':
            part=once(part,'e.setPoison(i.poison.DPS,i.poison.duration)','gardenPlantCritical.poison(e,this._gardenPlantShot,[i.poison.DPS,i.poison.duration])')
            part=once(part,'e.pushPoisonStacked(i.poisonStacked)','e.pushPoisonStacked(gardenPlantCritical.stackedPoison(i.poisonStacked,this._gardenPlantShot))')
        if name=='Zombie':
            part=once(part,'if(this.dealDamage(a),this.poison.duration-=t,','if(this.poison._gardenPlantDamage&&gardenPlantCritical.mark(a),this.dealDamage(a),this.poison.duration-=t,')
            part=once(part,'t.setPoison(i.poison.DPS,i.poison.duration,!0)','gardenPlantCritical.poison(t,i.poison._gardenPlantDamage,[i.poison.DPS,i.poison.duration,true])')
            part=once(part,'i.dealDamage(r.replaceDamage(t*e.DPS))','i.dealDamage(gardenPlantCritical.poisonPacket(r.replaceDamage(t*e.DPS),e))')
            # These are the two orientations of Chili Bean's delayed mint poison.
            # The plant already scaled the DPS for its simulation before this tween.
            chili='n.isValid()&&i.setPoison(e.DPS,e.duration),i.setChiliStun(t)'
            if part.count(chili)!=2:raise ValueError('Expected both Chili Bean poison directions')
            part=part.replace(chili,'n.isValid()&&gardenPlantCritical.poison(i,true,[e.DPS,e.duration]),i.setChiliStun(t)')
        if name=='Square':
            # Only Electric Currant calls LnC.setElectricLine. The tile's reused
            # template is copied per victim, with its native use of the strongest line.
            part=once(part,'this.electricHitCD=.25;var a=new D(1,!0,!0,!0,null,F.electricity);',
                'this.electricHitCD=.25;var a=gardenPlantCritical.mark(new D(1,!0,!0,!0,null,F.electricity),"electriccurrant");')
        if name=='Tomb':
            part=once(part,'l.dealDamage=function(t){var e=this.health+0;','l.dealDamage=function(t){t=gardenPlantCritical.resolve(this,t);var e=this.health+0;')
        # The outermost damage pass rolls for this victim. Forwarded leftovers and
        # cloned packets retain the resolved flag, including specialized boss/armor paths.
        part=re.sub(r'gardenChallengeArmor\.route\(this,([\w$]+),',r'gardenChallengeArmor.route(this,gardenPlantCritical.resolve(this,\1),',part)
        parts[index]=part
    if classified<70:raise ValueError(f'Unexpected plant damage coverage: {classified}')
    return ''.join(parts)
