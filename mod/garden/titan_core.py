"""Connect titan spawn identity, native death handling and encyclopedia text."""
from pathlib import Path
from fairplay import once

HERE = Path(__file__).resolve().parent


def helper():
    return '\n'.join((HERE / name).read_text(encoding='utf8')
                     for name in ('titan-art.js', 'titan-core.js'))


def apply(source):
    def edit(old, new):
        nonlocal source
        source = once(source, old, new)

    edit('gardenChallenge.resetBody(B,t),',
         'gardenChallenge.resetBody(B,t),gardenTitan.birth(B,t),')
    edit('gardenChallengeArmor.release(this);var t,e,i,n,o;',
         'gardenTitan.release(this);gardenChallengeArmor.release(this);var t,e,i,n,o;')
    edit('this.haveImp=!0,this.specialGargantuarOnEnable()',
         'this.haveImp=!gardenTitan.is(this),this.specialGargantuarOnEnable()')
    edit('u.throwImp=function(){this._throwImp()}','u.throwImp=function(){if(!gardenTitan.is(this))this._throwImp()}')
    edit('if(e.objdata.CannotBeTossedByCitron)', 'if(gardenTitan.is(e)||e.objdata.CannotBeTossedByCitron)')
    edit('if(gardenChallengeHybrids.holdVictory(this,e,t))',
         'if(gardenTitan.holdVictory(this,arguments)||gardenChallengeHybrids.holdVictory(this,e,t))')
    text=('超重装巨人 · 挑战专属。每场至少六只，不携带小鬼；原生柚子无法将其击飞处决。'
          '盾面、液体反应装甲和 AI 头盔共担伤害，装甲完好时吸收 99% 爆炸及穿透伤害。'
          '核爆可穿透部分防爆层，护甲破损后失去保护。头盔每 5.5 秒可拦一次高伤直击。'
          '背架依次轮射高爆、液氮、毒素、燃烧弹。关注预警格，利用拦截工事或移栽分散火力。')
    edit('this.specialLabel.string=r',
         "this.specialLabel.string=r+(F.getZombieFeature(t)?.CODENAME==='tutorial_gargantuar'&&i.progress>=v.known?'\\n\\n"+text+"':'')")
    return source
