"""Keep plant simulation pricing on the native seed packet and lawn placement paths."""
from pathlib import Path

def helper():
    return Path(__file__).with_name('challenge-simulation-cost.js').read_text(encoding='utf8')

def apply(source):
    from fairplay import once
    edits = [
        ('key:"SUNCOST",get:function(){var t,e=this,n=this.Prop;',
         'key:"gardenNativeCardCost",value:function(){var t,e=this,n=this.Prop;'),
        ('return f.isBeghouled?n.BeghouledCost:n.SunCost},set:function(t){this._SUNCOST=t',
         'return f.isBeghouled?n.BeghouledCost:n.SunCost}},{key:"SUNCOST",get:function(){return gardenSimulationCost.price(this,this.gardenNativeCardCost())},set:function(t){this._SUNCOST=t'),
        ('c.setPlantType=function(e){this.cf.cardGrouperByType(e,!1)}',
         'c.setPlantType=function(e){this.cf._gardenFallingPacket=true;this.cf.cardGrouperByType(e,!1)}'),
        ('if(a.spawnPlantCost(),a.plantKeyCool=2,a.index=-1,',
         'if(!gardenSimulationCost.canPlace(a,o))return;if(a.spawnPlantCost(),a.plantKeyCool=2,a.index=-1,'),
    ]
    for old,new in edits:
        source=once(source,old,new)
    return source
