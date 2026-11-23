"""Bind challenge runs to the original level, seed chooser, wave and combat lifecycles."""
from pathlib import Path

HERE = Path(__file__).resolve().parent


def helper():
    return (HERE / 'challenge-core.js').read_text(encoding='utf8')


def apply(source):
    from fairplay import once
    edits = [
        ('c.letsRock=function(){if(!this.rocked&&A.component.GameStartable()){',
         'c.letsRock=function(){if(!this.rocked&&A.component.GameStartable()&&gardenChallenge.admit(this)){'),
        ('c.gameStart=function(){if(!this.gameStarted){var e,t,n,r;if(this.IsLOD)',
         'c.gameStart=function(){if(!this.gameStarted&&gardenChallenge.admit(this)){var e,t,n,r;if(this.IsLOD)'),
        # The native card renderer and placement code both consult BOOSTED.
        # Keep this virtual, including for profiles already holding a paid boost.
        ('key:"BOOSTED",get:function(){return this._FORCE_BOOSTED||this._PP_BOOSTED}',
         'key:"BOOSTED",get:function(){return this._FORCE_BOOSTED||this._PP_BOOSTED||gardenChallenge.activeTyrant()>0}'),
        ('if(!r.BOOSTED&&"imitater"==r.Type&&this.CFs[a-1])',
         'if((!r.BOOSTED||gardenChallenge.activeTyrant()>0)&&"imitater"==r.Type&&this.CFs[a-1])'),
        ('W.getPlantProgressByID(o).boost>0||(a=!0,e=this.CFs[n-1].Type)',
         'W.getPlantProgressByID(o).boost>0&&!gardenChallenge.activeTyrant()||(a=!0,e=this.CFs[n-1].Type)'),
        ('u=o.BOOSTED,c=o.FORCE_BOOSTED,h=o.isImitater',
         'u=o.BOOSTED,c=o.FORCE_BOOSTED||gardenChallenge.activeTyrant()>0,h=o.isImitater'),
        ('o.PF.BOOST>0&&m.food(),c||B.BoostedPlantsUsed.includes(s)',
         '(o.PF.BOOST>0||gardenChallenge.activeTyrant()>0)&&m.food(),c||B.BoostedPlantsUsed.includes(s)'),
        ('i=e.boost,r=i>0,a=!n;if(a){var l=I.getStringByProps("SeedChooser","BoostCount")',
         'i=e.boost,r=i>0||gardenChallenge.activeTyrant()>0,a=!n;if(a){var l=I.getStringByProps("SeedChooser","BoostCount")'),
        ('this.boostCountLabel.string=l,this.boostGemLabel.string=o.BOOST.toString()',
         'this.boostCountLabel.string=gardenChallenge.activeTyrant()?"本局爆发 / Boost active":l,this.boostGemLabel.string=o.BOOST.toString()'),
        ('s.boost=function(){var t=this.current_id,e=O.getPlantFeature(t)',
         's.boost=function(){if(gardenChallenge.activeTyrant())return;var t=this.current_id,e=O.getPlantFeature(t)'),
        # The native Imitater remembers a placement boost until its transformation.
        # Its pool checkout must clear it before the next planting.
        ('this.invincible=!0,this.played=!1,this.willImitateType=void 0,this.foodable=!1',
         'this.invincible=!0,this.played=!1,this.boosted=!1,this.willImitateType=void 0,this.foodable=!1'),
        ('this.currentSniperPlant=null),e){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:if(this.cards.CFs[e])',
         'this.currentSniperPlant=null),e===8&&this.cards?.CFs[8]&&!arguments[2]?7:e){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:if(this.cards.CFs[e])'),
        ('n.tryChangingIndex(8),this.willKeychooseCard=t','n.tryChangingIndex(8,false,true),this.willKeychooseCard=t'),
        ('t.tryChangingIndex(8)):(t.index=-1,this.unchoose()', 't.tryChangingIndex(8,false,true)):(t.index=-1,this.unchoose()'),
        ('u.spawnPlantCost=function(){var e;8==this.index&&','u.spawnPlantCost=function(){var e;const ninth=this.index===8&&!!this.cards.CFs[8]&&this.currentCF===this.cards.CFs[8];8==this.index&&!ninth&&'),
        ('this.index>=0&&this.index<=7&&this.cards.CoolStart(this.index)','(this.index>=0&&this.index<=7||ninth)&&this.cards.CoolStart(this.index)'),
        ('ee.component.judgeUIIndex(),8!=this.index)','ee.component.judgeUIIndex(),8!=this.index||!!this.cards.CFs[8]&&this.currentCF===this.cards.CFs[8])'),
        ('Math.min(8,A.component.plantsCanBeChosen.length,A.component.overrideSeedSlotsCount)',
         'Math.min(gardenChallenge.isReinforced(this)?9:8,A.component.plantsCanBeChosen.length,A.component.overrideSeedSlotsCount)'),
        ('for(var t=Math.floor(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval),n=1',
         'for(var t=(gardenChallenge.isReinforced(this)?Math.ceil:Math.floor)(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval),n=1'),
        ('n=Math.max(1,Math.floor(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval))*this.waveManagerProps.FlagWaveInterval,i=this.currentWave',
         'n=gardenChallenge.isReinforced(this)?this.waveManagerProps.Waves.length:Math.max(1,Math.floor(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval))*this.waveManagerProps.FlagWaveInterval,i=this.currentWave'),
        ('s=n==Math.floor(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval)*this.waveManagerProps.FlagWaveInterval',
         's=n==(gardenChallenge.isReinforced(this)?this.waveManagerProps.Waves.length:Math.floor(this.waveManagerProps.Waves.length/this.waveManagerProps.FlagWaveInterval)*this.waveManagerProps.FlagWaveInterval)'),
        ('h=n/this.waveManagerProps.FlagWaveInterval-1,this.hugeWave(s)',
         'h=Math.ceil(n/this.waveManagerProps.FlagWaveInterval)-1,this.hugeWave(s)'),
        ('this.currentLevelObjects=JSON.parse(JSON.stringify(n)),this.levelNameString',
         'this.currentLevelObjects=JSON.parse(JSON.stringify(gardenChallenge.definition(this,ta,n))),this.levelNameString'),
        ('this.levelDefinition=t,gardenFixed.prepare(this,ta,t,Ue),',
         'this.levelDefinition=t,gardenFixed.prepare(this,ta,t,Ue),gardenChallenge.prepare(this,ta,t,Ue),'),
        ('(this.isDangerroom||this.isDangerroomMiniGame)&&gardenFixed.prepare(this,ta,t,Ue),e.next=41',
         '(this.isDangerroom||this.isDangerroomMiniGame)&&(gardenFixed.prepare(this,ta,t,Ue),gardenChallenge.generated(this,ta,t,Ue)),e.next=41'),
        ('if(t=Y.GitHubLevelName,le.pool()', 'if(gardenChallenge.remember(Y.component),t=Y.GitHubLevelName,le.pool()'),
        ('if(n==="mainScene"||n==="worldMapScene")N.endPractice();',
         'if(n==="mainScene"||n==="worldMapScene"){gardenChallenge.clearPending();N.endPractice()}'),
        ('c.module_SetSeedBank=function(e){var t,n,r,a,i=this;', 'c.module_SetSeedBank=function(e){e=gardenChallenge.seedBank(this,e);var t,n,r,a,i=this;'),
        ('c.module_SetSunUsedLimitProps=function(e){', 'c.module_SetSunUsedLimitProps=function(e){if(gardenChallenge.active(this))return;'),
        ('c.module_SetSpendSunHoldoutProps=function(e){', 'c.module_SetSpendSunHoldoutProps=function(e){if(gardenChallenge.active(this))return;'),
        ('r.judgeCardCanbeChosen=function(e,t){return', 'r.judgeCardCanbeChosen=function(e,t){if(gardenChallenge.active(L.component))return gardenChallenge.hasCard(L.component,e.Type);return'),
        ('r.readMemoryCards=function(){var e;L.component.CardDeck_ChallengingLocked||',
         'r.readMemoryCards=function(){var e;L.component.CardDeck_ChallengingLocked||gardenChallenge.restoreCards(L.component,this)||'),
        ('W.currentPlayer.memoryPlantChoose=n,W.savePP()', 'gardenChallenge.active(L.component)||(W.currentPlayer.memoryPlantChoose=n,W.savePP())'),
        ('c.preMoveCamera=function(){var e,t=', 'c.preMoveCamera=function(){gardenChallenge.beforeChooser(this,ta,A.component);var e,t='),
        ('this.preMoveCamera(),null!=(r=null==Qe?', 'this.preMoveCamera(),!gardenChallenge.replay(this)&&null!=(r=null==Qe?'),
        ('c.judgeMoveCamera=function(){this.levelDescriptionLabel', 'c.judgeMoveCamera=function(){if(gardenChallenge.replay(this)||this.isDangerroom&&gardenChallenge.active(this))return this.moveCamera();this.levelDescriptionLabel'),
        ('E.currentPlayer.difficulty=e,this.readDifficulty(e),E.savePP()', 'E.currentPlayer.difficulty=e,this.readDifficulty(e),E.savePP(),gardenChallenge.difficultyEdited()'),
        ('onDisable=function(){K.closeMusicPackManager()}', 'onDisable=function(){K.closeMusicPackManager(),gardenChallenge.settingsClosed()}'),
        ('n=this.currentWave+t.DeltaWaveIndex,this.waveManagerProps.Waves[n]', 't=gardenChallenge.jump(this,t),n=this.currentWave+t.DeltaWaveIndex,this.waveManagerProps.Waves[n]'),
        ('return function(t){return e.apply(this,arguments)}}(),c.readWave_FogEvent',
         'return function(t){return t?.objclass==="GardenChallengeSurge"?gardenChallenge.reinforce(this,t.objdata.index):e.apply(this,arguments)}}(),c.readWave_FogEvent'),
        ('c.judgeNextWave=function(){return!this.Tutorial_Wave_Stuck',
         'c.judgeNextWave=function(){if(this.currentWave>=0&&this.gamedTime<gardenChallenge.openingSeconds&&gardenChallenge.active(this))return false;return!this.Tutorial_Wave_Stuck'),
        ('this.NextWaveCountdown=i,this.WaveZombieDamageCountdown=i,this.currentWave=0',
         'gardenChallenge.active(this)&&(i=Math.max(0,gardenChallenge.openingSeconds-this.gamedTime)),this.NextWaveCountdown=i,this.WaveZombieDamageCountdown=i,this.currentWave=0'),
        ('i=this.currentWave,o=this.waveManagerProps.Waves[i],this.currentWave++',
         'i=this.currentWave,o=this.waveManagerProps.Waves[i],gardenChallenge.acceptWave(this,i,t),this.currentWave++'),
        ('&&(this.NextWaveCountdown+=10),l=Promise.all(o.map(', '&&(this.NextWaveCountdown+=10),this.NextWaveCountdown=gardenChallenge.waveDelay(this,this.NextWaveCountdown,false),l=Promise.all(o.map('),
        ('this.WaveZombieDamageCountdown=this.isCowboyMinigame?0:Math.random()+4;case 18',
         'this.WaveZombieDamageCountdown=this.isCowboyMinigame?0:gardenChallenge.waveDelay(this,Math.random()+4,true);case 18'),
        ('e.getZombieCompByID(r,!1,t,m,c)', 'e.getZombieCompByID(r,!1,s?Object.assign({},t,{gardenAlly:true}):t,m,c)'),
        ('(B=k.getComponent(d)).onZombiesGot(f,t),B.ID=f', '(B=k.getComponent(d)).onZombiesGot(f,t),gardenChallenge.resetBody(B,t),B.ID=f'),
        ('B.setObjdata(G,z),T&&', 'B.setObjdata(gardenChallenge.stats(B,G,B.objdataOwn),gardenChallenge.stats(B,z,B.objdataOwnOrg)),T&&'),
        ('key:"toughness",get:function(){return this.props.Toughness}', 'key:"toughness",get:function(){return this.props.Toughness*(this.owner?._gardenChallengeHostile&&!this.owner.hypnotized?gardenChallenge.modifiers.health:1)}'),
        ('this.walkSPSAtRoute=F.transFrom_ow_To_gw(i)/F.SquareWidth', 'this.walkSPSAtRoute=F.transFrom_ow_To_gw(i)/F.SquareWidth*gardenChallenge.routeSpeed(this)'),
        ('this.walkSPSAtRoute=L.getRandomFromRange(t.Speed)', 'this.walkSPSAtRoute=L.getRandomFromRange(t.Speed)*gardenChallenge.routeSpeed(this)'),
        ('const sourceRank=gardenCombatStats.launchingRank;', 'const sourceRank=gardenCombatStats.launchingRank,hostile=gardenChallenge.projectileOwner;'),
        ('v.objdata=gardenCombatStats.projectile(m,sourceRank,v._objdataOrg)',
         'v._gardenChallengeHostile=hostile,v.objdata=gardenChallenge.projectile(gardenCombatStats.projectile(m,sourceRank,v._objdataOrg),v._objdataOrg,hostile)'),
    ]
    for a,b in edits:
        source=once(source,a,b)
    if source.count('gardenCombatStats.launch(this,') < 50:
        raise ValueError('Missing native projectile launch paths')
    return source.replace('gardenCombatStats.launch(this,','gardenChallenge.launch(this,gardenCombatStats.launch,')

