"""Attach edition-wide basic stats to native plant properties and native shot construction."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
MODULE = re.compile(r'(?=System\.register\("chunks:///_virtual/)')


def edit(text, old, new):
    if text.count(old) != 1:
        raise ValueError('Unexpected native plant stat anchor: '+old[:100])
    return text.replace(old,new)


def apply(source):
    source=edit(source,'W.Plant_Type=h||D.CODENAME,W.Plant_Type_Data=f,u&&(W.objdata=u)',
        'W.Plant_Type=h||D.CODENAME,W.Plant_Type_Data=f,gardenCombatStats.setPlant(W,W.Plant_Type,e),u&&(W.objdata=u)')
    source=edit(source,'Object.getOwnPropertyNames(this._objdataOwn).forEach((function(i){null!=t[i]&&(n._objdataOwn[i]=t[i])}))',
        'gardenCombatStats.readPlant(this,t)')
    source=edit(source,'this.anmControl.fixTimeScale(s*this.extraAnmTimeScale())',
        'this.anmControl.fixTimeScale(s*this.extraAnmTimeScale()*gardenCombatStats.attackAnimation(this,this.anmControl))')
    source=edit(source,'getProjectile=function(){var e=n(i().mark((function e(o,t,a){var r,n,s,l,_,p,c,u,b,m,f,w,v;',
        'getProjectile=function(){var e=n(i().mark((function e(o,t,a){const sourceRank=gardenCombatStats.launchingRank;var r,n,s,l,_,p,c,u,b,m,f,w,v;')
    source=edit(source,'(v=w.getComponent("commonShot")).objdata=m',
        '(v=w.getComponent("commonShot"))._gardenCombatRank=sourceRank,v.objdata=gardenCombatStats.projectile(m,sourceRank,v._objdataOrg)')
    # Capture the actor on the native call site before an asynchronous asset load.
    # Leave the launcher's own internal delegation intact to avoid reapplying a parent's bonus.
    parts=MODULE.split(source)
    calls=0
    for i,part in enumerate(parts):
        if not part.startswith('System.register("chunks:///_virtual/') or part.startswith('System.register("chunks:///_virtual/Projectiles.ts"'):
            continue
        header=part.partition('execute:function()')[0]
        aliases=re.findall(r'\b([\w$]+)=[\w$]+\.(?:PrjFunctions|projectileRes)\b',header)
        if not aliases:
            continue
        actors='|'.join(re.escape(alias) for alias in aliases)
        pattern=r'(?<![\w$.])('+actors+r')\.(shootOnePea|lobOneCabbageOn(?:Zombie|Tomb|TNTSpark|Plant|Node|Pos)|getProjectile)\('
        part,n=re.subn(pattern,lambda m:'gardenCombatStats.launch(this,'+m[1]+',"'+m[2]+'",',part)
        parts[i]=part
        calls+=n
    if calls < 100:
        raise ValueError(f'Expected native plant/child shot bindings, got {calls}')
    return (HERE/'stats.js').read_text(encoding='utf8')+'\n'+''.join(parts)
