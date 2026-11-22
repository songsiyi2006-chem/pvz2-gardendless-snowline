from pathlib import Path

def helper():
    return Path(__file__).with_name('laser-shield.js').read_text(encoding='utf8')

def apply(source):
    from fairplay import once
    start=source.index('System.register("chunks:///_virtual/LaserBean.ts"')
    end=source.index('System.register(',start+15)
    s=source[start:end]
    s=once(s,'var t=new b(o,!0,!1,!0),i=','var blocks=this.isAirRaidPlant?gardenLaserShield.all(this):gardenLaserShield.capture(this,[this.lIndex]),lineRow=this.lIndex,t=new b(o,!0,!1,!0),i=')
    s=once(s,'i.judgeCrossRec(o.bodyRecForShooter)&&o.dealDamage(t)','i.judgeCrossRec(o.bodyRecForShooter)&&gardenLaserShield.allows(blocks,o,o.lIndex??lineRow)&&o.dealDamage(t)')
    s=once(s,'i.judgeCrossRec(o.bodyRec)&&o.dealDamage(t)','i.judgeCrossRec(o.bodyRec)&&gardenLaserShield.allows(blocks,o,lineRow)&&o.dealDamage(t)')
    visual='var n=y(this.beamParticle);n.parent=this.inLane.prjLayer,n.worldPosition=this.beamPoint.worldPosition,this.shooting=!0'
    s=once(s,visual,'if(!gardenLaserShield.draw(this,this.lIndex)){var n=y(this.beamParticle);n.parent=this.inLane.prjLayer,n.worldPosition=this.beamPoint.worldPosition}this.shooting=!0')
    s=once(s,'s.specialPlantFood=function(o){this.foodShooting=!1','s.specialPlantFood=function(o){gardenLaserShield.foodVisibility(this,false);this._gardenFoodWall=null;this.foodShooting=!1')
    s=once(s,'var n=this.foodHitPoint.worldPosition.x,a=P.judgeCIndex(n)',
        'var tip=this.foodHitPoint.worldPosition.x,wall=this._gardenFoodWall??gardenLaserShield.capture(this,[this.lIndex]),limit=wall?.get(this.lIndex),n=limit?Math.min(tip,limit.x):tip;'
        'if(limit&&tip>=limit.x)this._gardenFoodWall=wall;gardenLaserShield.foodVisibility(this,!!limit&&tip>limit.x);var a=P.judgeCIndex(n)')
    s=once(s,'h.judgeCrossRec(o.bodyRecReal)&&(-1==e.foodShotZombies','h.judgeCrossRec(o.bodyRecReal)&&gardenLaserShield.allows(wall,o,e.lIndex)&&(-1==e.foodShotZombies')
    s=once(s,'h.judgeCrossRec(o.bodyRec)&&(-1==e.foodShotTombs','h.judgeCrossRec(o.bodyRec)&&gardenLaserShield.allows(wall,o,e.lIndex)&&(-1==e.foodShotTombs')
    s=once(s,'case"foodEnd":this.foodEnd()','case"foodEnd":gardenLaserShield.foodVisibility(this,false),this._gardenFoodWall=null,this.foodEnd()')
    s=once(s,'s.specialPlantOnEnable=function(){this.switching','s.specialPlantOnEnable=function(){gardenLaserShield.foodVisibility(this,false);this._gardenFoodWall=null;this.switching')
    return source[:start]+s+source[end:]
