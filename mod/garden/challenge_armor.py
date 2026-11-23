"""Add challenge-only guard plates without changing shared zombie or projectile resources."""
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent


def helper():
    return (HERE/'challenge-armor.js').read_text(encoding='utf8')


def apply(source):
    from fairplay import once
    source=once(source,'key:"toughness",get:function(){return this.objdataOwn.Toughness}},{key:"sunBeanParticleCD"',
        'key:"toughness",get:function(){return gardenChallengeArmor.maxHealth(this,this.objdataOwn.Toughness)}},{key:"sunBeanParticleCD"')
    source=once(source,'this.canPlayAshNow()&&(t.damageType==x.ray||t.damageType==x.fire||t.damageType==x.electricity)&&this.zombieAshParticle_',
        'this.canPlayAshNow()&&(t._gardenAshDeath||t.damageType==x.ray||t.damageType==x.fire||t.damageType==x.electricity)&&this.zombieAshParticle_')
    source=once(source,'this.haveArm&&(t.damageType!=x.ray&&t.damageType!=x.fire&&t.damageType!=x.electricity||!(this.health<=0))',
        'this.haveArm&&(!t._gardenAshDeath&&t.damageType!=x.ray&&t.damageType!=x.fire&&t.damageType!=x.electricity||!(this.health<=0))')
    source=once(source,'B.setObjdata(gardenChallenge.stats(B,G,B.objdataOwn),gardenChallenge.stats(B,z,B.objdataOwnOrg)),T&&',
        'B.setObjdata(gardenChallenge.stats(B,G,B.objdataOwn),gardenChallenge.stats(B,z,B.objdataOwnOrg)),gardenChallengeArmor.create(B,t,r),T&&')
    source=once(source,'o=this.waveManagerProps.Waves[i],gardenChallenge.acceptWave(this,i,t)',
        'o=this.waveManagerProps.Waves[i],typeof gardenAdventureFourth!=="undefined"&&(o=gardenAdventureFourth.addCourier(this,i,o)),gardenChallenge.acceptWave(this,i,t)')
    source=once(source,'u.onLaneSpawnSettled(b,i),a.abrupt("return",u)',
        'u.onLaneSpawnSettled(b,i),gardenChallengeArmor.ready(u),a.abrupt("return",u)')
    source=once(source,'this.specialZombieOnEnable(),this._poison_stacked=[]',
        'this.specialZombieOnEnable(),gardenChallengeArmor.ready(this),this._poison_stacked=[]')
    source=once(source,'l.characterOnDisable=function(){var t,e,i,n,o;',
        'l.characterOnDisable=function(){gardenChallengeArmor.release(this);var t,e,i,n,o;')
    source=once(source,'this._hypnotized=t,t&&(this._usedToBeHypnotized=',
        'this._hypnotized=t,n&&gardenChallengeArmor.ready(this),t&&(this._usedToBeHypnotized=')
    source=once(source,'this.HighRed>0?c.shockRGB=1:this.TotalRGB>0&&(c.shockRGB=this.TotalRGB),this.balloonKiller',
        'gardenChallengeArmor.tagShot(c,e,this,t,i),this.HighRed>0?c.shockRGB=1:this.TotalRGB>0&&(c.shockRGB=this.TotalRGB),this.balloonKiller')
    source=once(source,'i.dealDamage(n,t.armorKnockSound)<=0&&(e.throwArmor',
        "i.dealDamage(t._gardenHitKind==='rotary-ap'?n*(1+gardenChallengeArmor.penetrationPower(e)):n,t.armorKnockSound)<=0&&(e.throwArmor")
    # These native items store durability on the zombie instead of in armors[].
    # Reuse paper destruction/enrage and the poncho/plate wear and drop callbacks.
    source=once(source,'if(this.havePaper&&e.armorProtection){var t=e.damage;t>0',
        "if(this.havePaper&&(e.armorProtection||e._gardenHitKind==='rotary-ap')){var t=e.damage*(e._gardenHitKind==='rotary-ap'?1+gardenChallengeArmor.penetrationPower(this):1);t>0")
    source=once(source,'Math.min(e.damage,this.paperHealth)),this.paperHealth-=t*',
        'Math.min(t,this.paperHealth)),this.paperHealth-=t*')
    source=once(source,'var a=-this._paperHealth,i=this.defaultDealDamage(e.replaceDamage(a>0?a:0))',
        "var a=-this._paperHealth,i=this.defaultDealDamage(e.replaceDamage(e._gardenHitKind==='rotary-ap'?e.damage:a>0?a:0))")
    source=once(source,'if(this.invincible)return this.health;var e=t.damage;if(t.damageType==u.fire',
        """if(this.invincible)return this.health;if(t._gardenHitKind==='rotary-ap'){
        var wear=(1+gardenChallengeArmor.penetrationPower(this))*t.damage*this.damageScale(t);
        if(this.ponchoHealth>0){var cloth=Math.min(this.ponchoHealth,wear);this.ponchoHealth-=cloth;this.pushSunBeanHealth(cloth);wear-=cloth;}
        if(this.plateHealth>0&&wear>0){var steel=Math.min(this.plateHealth,wear);this.plateHealth-=steel;this.pushSunBeanHealth(steel);if(this.plateHealth<=0)this.throwPlate(t.damageDirection);}
        return this.defaultDealDamage(t);}var e=t.damage;if(t.damageType==u.fire""")
    # These overrides absorb hits in their own native pools before forwarding overflow.
    # Bosses with invulnerable phases reach defaultDealDamage only when hittable.
    specialized={'CowboyPonchoZombie','EgyptCamelZombie','LostcityBasicZombie','ModernBalloonZombie',
                 'ModernNewspaperZombie','SkyBattlePlaneZombie'}
    expected=specialized|{'Zombie','CharacterManager'}
    parts=re.split(r'(?=System\.register\("chunks:///_virtual/)',source)
    for i,part in enumerate(parts):
        head=re.match(r'System\.register\("chunks:///_virtual/([\w]+)\.ts"',part)
        if not head or head[1] not in expected:continue
        name=head[1]
        expected.remove(name)
        if name=='CharacterManager':
            anchor='n.shockRGB=this.shockRGB,n.balloonKiller=this.balloonKiller,n.bugKiller=this.bugKiller,n'
            if part.count(anchor)!=3: raise ValueError('Unexpected number of native damage-copy methods')
            parts[i]=part.replace(anchor,'gardenChallengeArmor.copyFlags(this,n),'+anchor)
            continue
        method='defaultDealDamage' if name=='Zombie' else 'dealDamage'
        pattern=r'([\w$]+)\.'+method+r'=function\(([\w$]+)\)\{'
        m=re.search(pattern,part)
        if not m: raise ValueError('Missing native damage path for '+name)
        holder,arg=m.groups()
        native=holder+'._gardenArmor'+name+'Damage'
        wrapper=holder+'.'+method+'=function('+arg+'){return gardenChallengeArmor.route(this,'+arg+','+native+')},'+native+'=function('+arg+'){'
        parts[i]=once(part,m[0],wrapper)
    if expected: raise ValueError('Unbound native modules '+str(expected))
    return ''.join(parts)

