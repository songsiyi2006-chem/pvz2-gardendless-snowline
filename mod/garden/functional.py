"""Attach role-specific stats to native timers, pickups, planting and packet cooldowns."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent


def change(text, old, new, expected=1):
    if text.count(old) != expected:
        raise ValueError(f'Functional stat anchor {old[:85]!r}: {text.count(old)}, expected {expected}')
    return text.replace(old, new)


def apply(source):
    # Class fields are reset by stats.readPlant at each spawn, including pooled actors.
    source=change(source,"return perHit(key) ? 'damage' : '';",
                  "return gardenFunctional.kind(key) || (perHit(key) ? 'damage' : '');")
    source=change(source,'function scaleValue(n, key, stats) {',
        'function scaleValue(n, key, stats,body) {\n    const mapped=gardenFunctional.property(n,key,stats,body.Plant_Type);\n    if(mapped!==undefined)return mapped;')
    source=change(source,'scaleValue(raw,key,stats)','scaleValue(raw,key,stats,body)')
    source=change(source,'body._gardenFreshBody = true;','body._gardenFreshBody = true;gardenFunctional.reset(body);')
    source=change(source,'/i.test(name) ? factor : 1;', '/i.test(name) || gardenFunctional.castAnimation(body,name) ? factor : 1;')
    edits={}
    def edit(module,a,b,count=1):
        edits.setdefault(module,[]).append((a,b,count))
    edit('Plant','this.specialPlantUpdate(i*s,i,s),this.plantHeat(i)',
                'gardenFunctional.tick(this,i*s),this.specialPlantUpdate(i*s,i,s),this.plantHeat(i)')
    edit('LnC','W.judgeInLnC(),this.deadPlantType=void 0,','W.judgeInLnC(),gardenFunctional.deploy(W),this.deadPlantType=void 0,')
    edit('CardFeature','this.Cooldown=n.Cooldown,','this.Cooldown=gardenTalents.cardTime(gardenFunctional.cardTime(n.Cooldown,this.Type),n.Cooldown),')
    # Preserve the original number and appearance of each sun. Multiplying the nominal
    # spawn total would break 50 => 65 into three different pickups, losing fractions.
    edit('Sunflower','SunProduceAdd:n}', 'SunProduceAdd:n*gardenFunctional.sunScale}')
    edit('Sunflower','for(var d=0;d<s.length;d++){var h=s[d],P=s.length;',
        'var changeDue=n%5;if(n>0&&!s.length){s.push(S.instantiatePooly(x.SunTiny));changeDue=n-5;}for(var d=0;d<s.length;d++){var h=s[d],P=s.length;')
    edit('Sunflower','b.push(n.getComponent(g))','b.push(gardenFunctional.priceDrop(n.getComponent(g),b.length?0:changeDue))')
    edit('sun','r.specialDroppingOnEnable=function(){this.absorber=null',
        'r.specialDroppingOnEnable=function(){gardenFunctional.resetDrop(this);this.absorber=null')
    edit('SunCount','o=e>0?Math.ceil(o):Math.floor(o),this.ShownValue+=o,this.ValueLabel.string=Math.round(this.ShownValue).toString()',
        'o=e>0?Math.min(e,Math.ceil(o)):Math.max(e,Math.floor(o)),this.ShownValue=o===e?this.TargetValue:this.ShownValue+o,this.ValueLabel.string=(this.ShownValue===this.TargetValue?+this.ShownValue.toFixed(2):Math.round(this.ShownValue)).toString()')
    for name,alias,count in [('Sunflower','Q',1),('GoldBloom','f',1),('Moonflower','p',1),('MariGoldYellow','a',1),('Toadstool','L',1),('EnlightenMint','h',1)]:
        edit(name,alias+'.produceSun(','gardenFunctional.sun(this,'+alias+',',count)
    edit('SolarTomato','f.produceSun(n,o.worldPosition','gardenFunctional.sun(t,f,n,o.worldPosition')
    edit('ShineVine','n.forEach((function(t){y.produceSun(i,t.worldPosition','const owner=this;n.forEach((function(t){gardenFunctional.sun(owner,y,i,t.worldPosition',2)
    edit('ShineVine','y.produceSun(n*this.objdataOwn.ProduceSunValue','gardenFunctional.sun(this,y,n*this.objdataOwn.ProduceSunValue')
    # Parent-child links carry their original summoner, even when a new plant is later
    # planted on the tile or a sunlight effect runs after its creator disappears.
    edit('GoldLeaf','l.place=function(){this.die','l.place=function(){const stats=this._gardenCombatStats;this.die')
    edit('GoldLeaf','e.SpawnTile(t,{},!0)','e.SpawnTile(t,{},!0).then(tile=>{if(tile)tile._gardenCombatStats=stats})')
    edit('goldTile','i.specialTileOnEnable=function(){this._stage=-1','i.specialTileOnEnable=function(){this._gardenCombatStats=null;this._stage=-1')
    edit('goldTile','o.produceSun(50,','gardenFunctional.sun(this,o,50,')
    edit('goldTile','this.produceCD-=t','this.produceCD-=t*(this._gardenCombatStats?.attackSpeed||1)')
    edit('SolarSage','n.SunValue=i*this.objdataOwn.EnlightenSunValue','n._gardenCombatStats=this._gardenCombatStats,n.SunValue=i*this.objdataOwn.EnlightenSunValue')
    edit('solarsageEnlighten','i.WalkSPS=this.WalkSPS','i._gardenCombatStats=this._gardenCombatStats,i.SunValue=this.SunValue,i.WalkSPS=this.WalkSPS')
    edit('solarsageEnlighten','p.produceSun(this.SunValue','gardenFunctional.sun(this,p,this.SunValue')
    edit('MoonBean','a.sunbombProps=n,a.height=70','a._gardenCombatStats=this._gardenCombatStats,a.sunbombProps=n,a.height=70')
    edit('sunbomb','a.specialDroppingOnEnable=function(){this.fadingStarted','a.specialDroppingOnEnable=function(){this._gardenCombatStats=null;this.fadingStarted')
    edit('sunbomb','P.produceSun(50,this.worldPosition','gardenFunctional.sun(this,P,50,this.worldPosition')
    edit('SunBean','t.setSunBeanSunPerHitpoint(a*this._objdataOwn.SunPerHitpoint)',
         't._gardenSunYield=Math.max(t._gardenSunYield||1,gardenFunctional.sunYield(this)),t.setSunBeanSunPerHitpoint(a*this._objdataOwn.SunPerHitpoint)')
    edit('Zombie','this.tangled=!1,this.sunbeanSunPerHitpoint=0,','this.tangled=!1,this._gardenSunYield=1,this.sunbeanSunPerHitpoint=0,')
    edit('Zombie','J.produceSun(i,this.worldPosition,this.zombieHeight/2,!0)','gardenFunctional.sun(this,J,i,this.worldPosition,this.zombieHeight/2,!0)')
    edit('ZoybeanPod','f.onSpawnedByZoybeanPod(this),','f.onSpawnedByZoybeanPod(this),f.dealDamageScale.push(this._gardenCombatStats?.damage||1),')
    edit('BananaLauncher','h.throwOneBananaOnNode(','gardenCombatStats.launch(this,h,"throwOneBananaOnNode",',2)
    edit('Sunflower','Q.dropOneCoin(new y(this.worldPositionX,this.worldPositionY),Math.random()>.1?0:1).height',
        'gardenFunctional.coin(this,Q.dropOneCoin(new y(this.worldPositionX,this.worldPositionY),Math.random()>.1?0:1)).height')
    edit('coin','c.specialDroppingOnEnable=function(){var n,o;','c.specialDroppingOnEnable=function(){gardenFunctional.resetDrop(this);var n,o;')
    edit('CurrencyCount','i=n>0?Math.ceil(i):Math.floor(i),this.shownValue+=i',
        'i=n>0?Math.min(n,Math.ceil(i)):Math.max(n,Math.floor(i)),this.shownValue=i===n?this.value:this.shownValue+i')
    edit('PowerLily','for(var t=0;t<this._objdataOwn.ProduceCount;t++)',
        'for(var t=0,earned=gardenFunctional.foodCount(this,this._objdataOwn.ProduceCount);t<earned;t++)')
    parts=re.split(r'(?=System\.register\("chunks:///_virtual/)',source)
    for i,part in enumerate(parts):
        match=re.match(r'System\.register\("chunks:///_virtual/([^"]+)\.ts"',part)
        if not match:continue
        for a,b,count in edits.pop(match[1],[]):part=change(part,a,b,count)
        # A content extension may introduce its own plant class while still paying
        # out sunlight via the game's shared Sunflower producer.
        if match[1] not in ('Sunflower','ShineVine','SolarTomato') and re.search(r'\w+\("[\w$]*Plant",',part):
            for alias in re.findall(r'\b([\w$]+)=[\w$]+\.sunflower\b',part.partition('execute:function()')[0]):
                part=re.sub(r'(?<![\w$.])'+re.escape(alias)+r'\.produceSun\(','gardenFunctional.nativeSun(this,'+alias+',',part)
        parts[i]=part
    if edits:raise ValueError(f'Functional stat modules missing: {list(edits)}')
    return (HERE/'functional.js').read_text(encoding='utf8')+'\n'+''.join(parts)
