"""Bind the edition's tier emblem to the existing Cocos plant seed-packet prefab."""
from pathlib import Path
from fairplay import once

def apply(source):
    # Enter CardFeature's module scope. The sprite atlas is shared across every
    # seed slot, conveyor belt, and chooser in this game instance.
    start = 'execute:function(){var C;o._RF.push({},"2b2467iSk9C2LG6t86WKIEe","CardFeature",void 0);'
    helper = Path(__file__).with_name('card-badges.js').read_text(encoding='utf-8-sig')
    source = once(source, start, start + helper)
    # Direct ID binds (e.g. a preset) and code-name binds (the chooser, plant
    # variants and conveyors) both reach this native rendering routine.
    source = once(source,
        'o._plantDB.playAnimation(this.PF._CARDSPRITENAME)},r.cardGrouper=',
        'o._plantDB.playAnimation(this.PF._CARDSPRITENAME),gardenUpdateSeedBadge(this)},r.cardGrouper=')
    source = once(source,
        'this.cardGrouperPlant(n.id,e,n.prop,n.spf,n.filled_type),this.Type=t},r.cardGrouperPlant=',
        'this.cardGrouperPlant(n.id,e,n.prop,n.spf,n.filled_type),this.Type=t,gardenUpdateSeedBadge(this)},r.cardGrouperPlant=')
    source = once(source,
        'this.ca._plantDB.customMaterial=t?m.greyMaterial:null,this._isImitator=t}',
        'this.ca._plantDB.customMaterial=t?m.greyMaterial:null,this._isImitator=t,gardenUpdateSeedBadge(this)}')
    return source
