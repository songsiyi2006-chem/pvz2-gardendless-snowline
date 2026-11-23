"""Hook the Snowline ultimates at successful food activation and actual projectile launch."""
from fairplay import once


def apply(source):
    edits = [
        # Plant.food() is the common entry point for manual food, boosts and scripted triggers.
        ('!this.fooding&&this.foodable&&!this.dead&&!this.leapTween&&!this.sheepend){var n,i;',
         '!this.fooding&&this.foodable&&!this.dead&&!this.leapTween&&!this.sheepend){if(!gardenUltimates.payFood(this))return false;var n,i;'),
        ('N.freePF?e.food()&&(i=!0)', 'N.freePF?gardenUltimates.feedLeaf(e)&&(i=!0)'),
        ('N.freePF?t.food()&&(e=!0)', 'N.freePF?gardenUltimates.feedLeaf(t)&&(e=!0)'),
        ('u.food(),null==(c=z.component)||c.plantFoodDec()', 'gardenUltimates.feedLeaf(u)&&(null==(c=z.component)||c.plantFoodDec())'),
        ('Math.random()<=this.ChanceToPlantfood?this.food()', 'gardenUltimates.autoFood(this,this.ChanceToPlantfood)?this.food()'),
        ('Math.random()<this._objdataOwn.MGPAutoShotsChanceToPlantfood?this.food()',
         'gardenUltimates.autoFood(this,this._objdataOwn.MGPAutoShotsChanceToPlantfood)?this.food()'),
        # MegaGatlingPeaPlant inherits PeashooterPlant directly. Its basic form and
        # the separate GatlingPeaPlant gun rig dispatch food shots from different methods.
        ('h.onFoodLeftPeaCountDec=function(t){this._shoot(!0,!0,this._objdataOwn.PeaTypePlantfood)}',
         'h.onFoodLeftPeaCountDec=function(t){var p=this._shoot(!0,!0,this._objdataOwn.PeaTypePlantfood);'
         'if(this.Plant_Type==="megagatling"){var owner=this;p.then(function(shot){gardenUltimates.markVolley(owner,shot)})}}'),
        ('s.onFoodLeftPeaCountDec=function(t){var n=this,e=y.getRandom(this._objdataOwn.PeaTypesPlantfood);',
         's.onFoodLeftPeaCountDec=function(t){var n=this,e=this.Plant_Type==="megagatling"?this._objdataOwn.PeaType:y.getRandom(this._objdataOwn.PeaTypesPlantfood);'),
        ('o*c/90),a).then((function(t){i&&n._cs_randomize(t)}))',
         'o*c/90),a).then((function(t){i&&n._cs_randomize(t),gardenUltimates.markVolley(n,t)}))'),
        ('return f.isBeghouled?n.BeghouledCost:n.SunCost}',
         'return f.isBeghouled?n.BeghouledCost:gardenUltimates.price(this,n.SunCost)}'),
        ('case"shoot":this._shoot(this._objdataOwn.PeaType);break;case"foodShoot":this._shoot(this._objdataOwn.PeaTypePlantfood)',
         'case"shoot":this._shoot(this._objdataOwn.PeaType),gardenUltimates.citronFired(this);break;case"foodShoot":this._shoot(this._objdataOwn.PeaTypePlantfood)'),
        ('o.setDamage(o.damage*this._dmgScale);case 7:case"end"',
         'o.setDamage(o.damage*this._dmgScale),gardenUltimates.markCitron(this,o,e===this._objdataOwn.PeaTypePlantfood);case 7:case"end"'),
        ('t.prototype.detectEnemy=function(e){var t=this;if(this.inLane&&this.detectEnemyOn){this.targetLocked',
         't.prototype.detectEnemy=function(e){if(gardenUltimates.specialFlight(this))return;var t=this;if(this.inLane&&this.detectEnemyOn){this.targetLocked'),
        ('h.detectEnemy=function(e){this.detectEnemyNormal(e)}',
         'h.detectEnemy=function(e){if(!gardenUltimates.specialFlight(this))this.detectEnemyNormal(e)}'),
        ('h.dealDamageToZombie=function(e,t,i,o){var n,a,s,r;',
         'h.dealDamageToZombie=function(e,t,i,o){if(t!==false&&gardenUltimates.impact(this,e))return;var n,a,s,r;'),
        ('h.characterOnDisable=function(){var e;this.locator', 'h.characterOnDisable=function(){gardenUltimates.clearShot(this);var e;this.locator'),
        ('o.characterManagerUpdate=function(t){var n=[];', 'o.characterManagerUpdate=function(t){gardenUltimates.updateFields();var n=[];'),
        ('if(!this.dead&&t.damage>0){var i=this.damageScale(t);',
         'if(!this.dead&&t.damage>0){var i=t._gardenTrueDamage?1:this.damageScale(t);'),
    ]
    for old,new in edits:
        source=once(source,old,new)
    return source
