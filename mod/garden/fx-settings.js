const gardenFxSettings = (() => {
  const key = "PvZ2_Greenhouse_SkillEffects_v1";
  const listeners = new Set();
  let enabled = true;
  try { enabled = localStorage.getItem(key) !== "0"; } catch {}
  function setEnabled(value) {
    value = Boolean(value);
    if (value === enabled) return;
    enabled = value;
    try { localStorage.setItem(key, value ? "1" : "0"); } catch {}
    for (const update of listeners) update(value);
    if(value) warm();
  }
  function subscribe(update) {
    listeners.add(update);
    return () => listeners.delete(update);
  }
  const engine = () => window.System.get(window.System.resolve("cc"));
  function warm() {
    if(!enabled || typeof gardenWarmHolo!=="function")return;
    const cc=engine();
    if(cc?.Texture2D)gardenWarmHolo(cc,()=>enabled);
  }
  function caption() {
    const lang = window.System.get("chunks:///_virtual/MultiLanguage.ts");
    return lang?.MultiLanguage?.currentLanguage === lang?.LanguageEnum?.ZH ? "升阶技能特效" : "Rank Skill FX";
  }
  function color(cc,hex) {
    const c = new cc.Color();cc.Color.fromHEX(c,hex);return c;
  }
  function drawSwitch(cc,g,x,y,scale) {
    const w=55*scale,h=26*scale,r=h/2;
    g.fillColor=color(cc, enabled ? "#87d8b4" : "#808b89");
    g.roundRect(x-w/2,y-h/2,w,h,r);g.fill();
    g.strokeColor=color(cc,enabled ? "#d7f1cb" : "#b2bab2");
    g.lineWidth=Math.max(1,scale);g.roundRect(x-w/2,y-h/2,w,h,r);g.stroke();
    const knob=x+(enabled ? 1 : -1)*(w/2-r);
    g.fillColor=color(cc,enabled ? "#224d41" : "#32413e");g.circle(knob,y,r-3*scale);g.fill();
    g.strokeColor=color(cc,"#eef2d4");g.lineWidth=1.6*scale;
    if(enabled){g.moveTo(knob-4*scale,y);g.lineTo(knob-scale,y-3*scale);g.lineTo(knob+5*scale,y+4*scale);}
    else{g.moveTo(knob-3.5*scale,y);g.lineTo(knob+3.5*scale,y);}
    g.stroke();
  }
  function paintMain(view) {
    const sprite=view.allowCheatSprite, buttonNode=sprite?.node;
    if(!buttonNode?.isValid || !view.gardenSwitchInk) return;
    const cc=engine();
    view.tooltips.AllowCheat.string=caption();
    sprite.color=color(cc, enabled ? "#689879" : "#818a80");
    const ink=view.gardenSwitchInk;ink.clear();drawSwitch(cc,ink,0,0,1.6);
  }
  function setupMain(view) {
    const cc=engine(), root=view.allowCheatSprite.node;
    root.name="GardenSkillEffects";root.active=true;
    view.tooltips.AllowCheat.node.active=true;
    const button=root.getComponent(cc.Button);
    for(const event of button?.clickEvents||[])if(event.handler==="setAllowCheat")event.handler="toggleSkillEffects";
    if(!view.gardenSwitchInk) {
      const art = new cc.Node("SkillEffectsSwitch");art.layer=root.layer;art.parent=root;
      const width=root.getComponent(cc.UITransform)?.width || 968;
      art.setPosition(width*.5-82,0,0);
      view.gardenSwitchInk=art.addComponent(cc.Graphics);
    }
    paintMain(view);
  }
  function paintPause(view) {
    if(!view.gardenFxButton?.isValid) return;
    const cc=engine(), ink=view.gardenFxButton.getComponent(cc.Graphics);
    ink.clear();ink.fillColor=color(cc,"#233b35ed");ink.roundRect(-133,-23,266,46,15);ink.fill();
    ink.lineWidth=1.8;ink.strokeColor=color(cc,enabled?"#adc6a0":"#99a79c");ink.roundRect(-133,-23,266,46,15);ink.stroke();
    drawSwitch(cc,ink,91,0,1.0);
    view.gardenFxCaption.string=caption();
  }
  function setupPause(view) {
    const cc=engine(), original=view.autoPauseToggle?.node;
    if(!original?.parent || view.gardenFxButton?.isValid){paintPause(view);return}
    const node=new cc.Node("GardenSkillEffects");
    node.layer=original.layer;node.parent=original.parent;
    node.setPosition(original.position.x+870,original.position.y,original.position.z);
    node.addComponent(cc.UITransform).setContentSize(266,46);
    node.addComponent(cc.Graphics);node.addComponent(cc.Button);
    const text=new cc.Node("Caption");text.layer=node.layer;text.parent=node;text.setPosition(-32,0,0);
    const label=text.addComponent(cc.Label);
    label.useSystemFont=true;label.fontFamily="Microsoft YaHei UI";label.fontSize=22;label.lineHeight=29;
    label.isBold=true;label.color=color(cc,"#f4f1d7");
    view.gardenFxButton=node;view.gardenFxCaption=label;
    node.on(cc.Button.EventType.CLICK,()=>{setEnabled(!enabled);paintPause(view)});
    paintPause(view);
  }
  return Object.freeze({get enabled(){return enabled},setEnabled,subscribe,warm,setupMain,paintMain,setupPause,paintPause});
})();
