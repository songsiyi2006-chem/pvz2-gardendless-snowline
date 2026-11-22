"""Route hybrid reinforcements, life identity and interrupted campaigns through native Cocos."""
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent

def helper():
    return (HERE/'challenge-hybrids.js').read_text(encoding='utf8')

def apply(source):
    from fairplay import once
    edits=[
        ('this.CurrentValue=Math.max(this.CurrentValue-t,0),this.JudgeCardAffordable()',
         'this.CurrentValue=arguments[3]===true?this.CurrentValue-t:Math.max(this.CurrentValue-t,Math.min(0,this.CurrentValue)),this.JudgeCardAffordable()'),
        ('gardenChallenge.stats(B,G,B.objdataOwn),gardenChallenge.stats(B,z,B.objdataOwnOrg)',
         'gardenChallenge.stats(B,gardenChallengeHybrids.baseProps(G,t,B),B.objdataOwn),gardenChallenge.stats(B,gardenChallengeHybrids.baseProps(z,t),B.objdataOwnOrg)'),
        ('l.characterOnDisable=function(){gardenChallengeArmor.release(this);',
         'l.characterOnDisable=function(){if(typeof gardenHybridArt!=="undefined")gardenHybridArt.departBody?.(this);gardenChallengeHybrids.release(this);gardenChallengeArmor.release(this);'),
        ('this._hypnotized=t,n&&gardenChallengeArmor.ready(this)',
         'this._hypnotized=t,n&&gardenChallenge.allegianceStats(this,t),n&&gardenChallengeHybrids.allegiance(this,t),n&&gardenChallengeArmor.ready(this)'),
        ('?gardenChallenge.reinforce(this,t.objdata.index):e.apply(this,arguments)',
         '?(gardenChallengeHybrids.wave(this,t.objdata.index),gardenChallenge.reinforce(this,t.objdata.index)):e.apply(this,arguments)'),
        ('c.victory=function(e,t){var n,r,a,i=this;',
         'c.victory=function(e,t){if(gardenChallengeHybrids.holdVictory(this,e,t))return;var n,r,a,i=this;'),
        ('this.camelUpdate(e,P),this.judgeVictory()', 'this.camelUpdate(e,P),gardenChallengeHybrids.judgeWaves(this)'),
    ]
    for before,after in edits:source=once(source,before,after)
    methods={'LnC':['explodeCherry3x3','explodeSpudow3x3','explodeSqudow1x1'],
             'DoomShroom':['explode'],'AtomBomb':['explode'],'GhostPepper':['_explode']}
    parts=re.split(r'(?=System\.register\("chunks:///_virtual/)',source)
    expected=set(methods)|{'GroundFiresManager','Jalapeno','Zombie'}
    for i,part in enumerate(parts):
        module=re.match(r'System\.register\("chunks:///_virtual/([\w]+)\.ts"',part)
        if not module or module[1] not in expected:continue
        name=module[1]
        expected.remove(name)
        for method in methods.get(name,[]):
            pattern=r'([\w$]+(?:\.prototype)?)\.'+method+r'=function\(([^)]*)\)\{'
            m=re.search(pattern,part)
            if not m:raise ValueError('Missing '+name+'.'+method)
            ref=m[1]+'._gardenBlast_'+method
            wrapper=m[1]+'.'+method+'=function(){return gardenChallengeTroopers.blast(this,'+ref+',arguments)},'+ref+'=function('+m[2]+'){'
            part=once(part,m[0],wrapper)
        if name=='Jalapeno':
            part=once(part,'v.groundFires=g,v.damage=t','v._gardenOrigin=n,v._gardenBlast=gardenChallengeTroopers.snapshot(n,t),v.groundFires=g,v.damage=t')
        if name=='GroundFiresManager':
            part=once(part,'jalapenoFires.concat().forEach((function(i){if(i.duration',
                      'jalapenoFires.concat().forEach((function(i){if(i.isDPS&&i._gardenOrigin)i._gardenBlast=gardenChallengeTroopers.snapshot(i._gardenOrigin,i.damage*n);if(i.duration')
            part=once(part,'f=new r(i.damage*(i.isDPS?n:1),i.armorProtection,!1,!1,null,s.fire,!0,!0);if(h.concat()',
                      'f=new r(i.damage*(i.isDPS?n:1),i.armorProtection,!1,!1,null,s.fire,!0,!0);f._gardenBlast=i._gardenBlast;if(h.concat()')
        if name=='Zombie':
            for head in ['l.playAsh=function(t,e){','l.playDie=function(t,e,i,n,o,a,s){']:
                part=once(part,head,head+'if(gardenChallengeTroopers.direct(this))return null;')
        parts[i]=part
    if expected:raise ValueError('Missing native explosion surface '+str(expected))
    return ''.join(parts)

