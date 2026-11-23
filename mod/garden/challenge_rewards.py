"""Bind challenge-only pickup and treasure behavior to the original Cocos routes."""
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent

def helper():
    return (HERE/'challenge_rewards.js').read_text(encoding='utf8')

def apply(src):
    edits={
        'dropping':[
            ('b.AutoCollectList.includes(this.DroppingType)&&this.collect()',
             '(gardenChallengeRewards.autoCollect(this)||b.AutoCollectList.includes(this.DroppingType))&&this.collect()')],
        'plantFood':[
            ('var n=!r.component.full()||p.freePF','var n=gardenChallengeRewards.enabled()||!r.component.full()||p.freePF'),
            ('i.specialGoToUI=function(n){r.component.plantFoodAdd()}','i.specialGoToUI=function(n){gardenChallengeRewards.collectGreen(r.component)}')],
        'PlantFoodCount':[
            ('this.plantFoodNum--,this.choose())','this.plantFoodNum--,this.choose(),gardenChallengeRewards.refill(this))')],
        'Zombie':[
            ('var e=U.ThreeTimesPrizes?3:1,i=Math.random();if(i<.003)',
             '''var e=U.ThreeTimesPrizes?3:1,i=Math.random(),challenged=gardenChallengeRewards.enabled(),kind=challenged?gardenChallengeRewards.category(i):null;if(challenged?kind==="gem":i<.003)'''),
            ('else if(i<.01)for(var o=0;o<e;o++)J.dropOneCoin(t,1)',
             'else if(challenged?kind==="gold":i<.01)for(var o=0;o<e;o++)J.dropOneCoin(t,1)'),
            ('else if(i<.025)for(var a=0;a<e;a++)J.dropOneCoin(t,0)',
             'else if(challenged?kind==="silver":i<.025)for(var a=0;a<e;a++)J.dropOneCoin(t,0)'),
            ('U.LeftTicket--;for(var s=0;s<e;s++)J.dropOneTicket(t)',
             'U.LeftTicket--;for(var s=0,tickets=gardenChallengeRewards.fieldCount(e);s<tickets;s++)J.dropOneTicket(t)'),
            ('l.dropSprout=function(t){Math.random()<.003&&J.dropOneSprout(t)}',
             'l.dropSprout=function(t){if(Math.random()<.003)for(var n=gardenChallengeRewards.fieldCount(1);n>0;n--)J.dropOneSprout(t)}'),
            ('U.DropCoins&&this.dropCoin(v)','(U.DropCoins||gardenChallengeRewards.enabled())&&this.dropCoin(v)'),
            ('var v=this.worldPosition;if(this.PickupCollectableTutorial)',
             'var v=this.worldPosition;gardenChallengeRewards.supplies(this,J);if(this.PickupCollectableTutorial)')],
        'YetiZombie':[
            ('return{weight:t.Weight,props:t.Prize}','return{weight:gardenChallengeRewards.yetiWeight(t.Prize?.Type,t.Weight),props:t.Prize}'),
            ('if(t)for(var e=+t.Count,o=0;o<e;o++)switch(t.Type)',
             'if(t)for(var e=gardenChallengeRewards.fieldCount(+t.Count),o=0;o<e;o++)switch(t.Type)')],
    }
    parts=re.split(r'(?=System\.register\("chunks:///_virtual/)',src)
    for i,part in enumerate(parts):
        m=re.match(r'System\.register\("chunks:///_virtual/([^"]+)\.ts"',part)
        if not m: continue
        for a,b in edits.pop(m[1],[]):
            if part.count(a)!=1:raise ValueError((m[1],a[:90],part.count(a)))
            part=part.replace(a,b)
        parts[i]=part
    if edits:raise ValueError(list(edits))
    return ''.join(parts)
