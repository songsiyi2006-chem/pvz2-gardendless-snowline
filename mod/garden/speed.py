from fairplay import once

ENGINE = 'cocos-js/_virtual_cc-937a2166.js'

def controls(source):
    source = once(source,'Ot>1&&this.speedUp(!1);for(var t=function()','Ot>1&&!gardenSpeedLock.locked&&this.speedUp(!1);for(var t=function()')
    # Internal false calls are threat/outro resets. Only player input cycles speeds.
    source = once(source,'1==Ot?1.5:1','t?({1:1.5,1.5:2,2:3,3:4,4:5,5:1}[Ot]||1):1')
    source = once(source,'this.s2xButton.hoverSprite=this.hover2x)},l.gameStart=',
        'this.s2xButton.hoverSprite=this.hover2x),this.greenhouseSpeedLabel(Ot)},l.gameStart=')
    label = """
    u.greenhouseSpeedLabel=function(rate){
        const button=this.s2xButton?.node;
        if(!button?.isValid)return;
        gardenSpeedLock.attach(this);
        let label=this._greenhouseRate;
        if(!label?.isValid){
            const engine=window.System.get(window.System.resolve("cc"));
            const frame=button.getComponent(P);
            const height=frame?.height||58;
            const width=frame?.width||58;
            const marker=new h("Battle speed");
            marker.layer=button.layer;
            marker.setParent(button);
            marker.setPosition(0,-height*.32,0);
            const bg=marker.addComponent(engine.Graphics);
            const bh=height*.29,bw=width*.65;
            bg.fillColor=new T(23,55,48,250);
            bg.roundRect(-bw/2,-bh/2,bw,bh,bh*.42);bg.fill();
            bg.lineWidth=Math.max(0.6,height*.014);
            bg.strokeColor=new T(202,210,157,255);
            bg.roundRect(-bw/2,-bh/2,bw,bh,bh*.42);bg.stroke();
            const lettering=new h("Rate");
            lettering.layer=button.layer;
            lettering.setParent(marker);
            label=lettering.addComponent(c);
            label.useSystemFont=true;label.fontFamily="Arial";
            label.fontSize=height*.228;label.lineHeight=height*.258;
            label.isBold=true;label.color=new T(252,244,207,255);
            this._greenhouseRate=label;
        }
        const text=rate+"×";
        if(label.string!==text)label.string=text;
    },
    """
    source=once(source,'l.oldTickReturn=function(){Ot=e("gamingSpeed",1),D.gameSpeed=1}',
        label+'l.oldTickReturn=function(){if(Ot!==1&&l.component?.gameStarted)l.component.greenhouseSpeedLabel(1);Ot=e("gamingSpeed",1),D.gameSpeed=1}')
    source=once(source,'this.plantKeyCool>0&&this.plantKeyCool--','!D.greenhouseSubstep&&this.plantKeyCool>0&&this.plantKeyCool--')
    source=once(source,'this.MouseClickCoolingDown>0&&this.MouseClickCoolingDown--','!D.greenhouseSubstep&&this.MouseClickCoolingDown>0&&this.MouseClickCoolingDown--')
    source=once(source,'var c=G.deltaTime;if(this.fpsCD>0&&(this.frameInSec++','var c=K.greenhouseSubstep?0:G.deltaTime;if(!K.greenhouseSubstep&&this.fpsCD>0&&(this.frameInSec++')
    source=once(source,'this.gameTipTime-=G.deltaTime','this.gameTipTime-=c')
    return once(source,'this.gameStarted=!0,this.s2xButton.getComponent(p).color=',
        'this.gameStarted=!0,this.greenhouseSpeedLabel(Ot),this.s2xButton.getComponent(p).color=')

def timestep(source):
    # Keep input, draw and frame submission at the refresh rate. The high-speed
    # modes advance the original gameplay update with normal-sized timesteps.
    head='i.tick=function(t){var i=t*this.gameSpeed;if(!this._invalid){'
    source=once(source,head,'i.tick=function(t){var rate=this.gameSpeed,i=t*rate;if(!this._invalid){')
    start='kw._frameDispatchEvents(),!this._paused){this.emit(e.EVENT_BEFORE_UPDATE)'
    source=once(source,start,'kw._frameDispatchEvents(),!this._paused){'
        'const steps=Number.isInteger(rate)&&rate>=2&&rate<=5?rate:1,delta=i/steps,scene=this._scene;'
        'let advanced=0;for(let step=0;step<steps;step++){'
        'if(step>0&&(this._invalid||this._paused||this.gameSpeed!==rate||this._scene!==scene))break;'
        'this.greenhouseSubstep=step;advanced+=delta;this.emit(e.EVENT_BEFORE_UPDATE)')
    core='this._compScheduler.updatePhase(i);for(var n=0;n<this._systems.length;++n)this._systems[n].update(i);this._compScheduler.lateUpdatePhase(i)'
    source=once(source,core,core.replace('(i)','(delta)'))
    tail='this._systems[r].postUpdate(i)}this.emit(e.EVENT_BEFORE_DRAW)'
    source=once(source,tail,'this._systems[r].postUpdate(delta)}this.greenhouseSubstep=0;i=advanced}this.emit(e.EVENT_BEFORE_DRAW)')
    source=once(source,'this._root.frameMove(i),this.emit(e.EVENT_AFTER_DRAW)','this._root.frameMove(i,rate>=2?t:i),this.emit(e.EVENT_AFTER_DRAW)')
    source=once(source,'hg.clearNodeArray(),xs.update(i)','hg.clearNodeArray(),xs.update(rate>=2?t:i)')
    return once(source,'.frameMove=function(t){var e;this._frameTime=t,++this._frameCount,this._cumulativeTime+=t,this._fpsTime+=t,',
        '.frameMove=function(t,wall=t){var e;this._frameTime=t,++this._frameCount,this._cumulativeTime+=t,this._fpsTime+=wall,')
