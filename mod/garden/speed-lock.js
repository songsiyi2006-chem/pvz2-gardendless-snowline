const gardenSpeedLock=(()=>{
  const key='PvZ2_Greenhouse_SpeedLock_v1';
  let locked=false;
  try { locked=localStorage.getItem(key)==='1'; } catch {}
  function attach(view){
    const base=view.s2xButton.node;
    if(view._gardenLock?.isValid || !base?.isValid)return;
    const cc=System.get(System.resolve('cc')),tr=base.getComponent(cc.UITransform);
    const w=tr?.width||100,h=tr?.height||100;
    const node=new cc.Node('GardenSpeedLock');node.layer=base.layer;node.parent=base;
    node.setPosition(0,-h*.76,0);node.addComponent(cc.UITransform).setContentSize(w*1.02,h*.45);
    const ink=node.addComponent(cc.Graphics),btn=node.addComponent(cc.Button);
    const name=new cc.Node('Lock label');name.layer=node.layer;name.parent=node;name.setPosition(w*.095,0,0);
    const label=name.addComponent(cc.Label);label.fontSize=w*.20;label.lineHeight=w*.24;label.isBold=true;
    label.fontFamily='Microsoft YaHei UI';
    const color=s=>new cc.Color().fromHEX(s);
    function paint(){
      ink.clear();const rw=w*.96,rh=h*.38;
      ink.fillColor=color(locked?'#2f664f':'#243b38');ink.roundRect(-rw/2,-rh/2,rw,rh,rh*.42);ink.fill();
      ink.lineWidth=w*.016;ink.strokeColor=color(locked?'#e3d496':'#a4b5a6');ink.roundRect(-rw/2,-rh/2,rw,rh,rh*.42);ink.stroke();
      const x=-w*.279,u=w*.075;ink.strokeColor=color('#f1dfaa');ink.lineWidth=w*.02;
      ink.moveTo(x-u*.64,-u*.03);ink.lineTo(x-u*.64,u*.48);
      ink.bezierCurveTo(x-u*.64,u*1.45,x+u*.64,u*1.45,x+u*.64,u*.48);if(locked)ink.lineTo(x+u*.64,-u*.02);ink.stroke();
      ink.fillColor=color('#efda9c');ink.roundRect(x-u,-u*.91,u*2,u*1.05,u*.24);ink.fill();
      label.color=color('#faf2d6');label.string=locked?'已锁':'锁速';
    }
    node.on(cc.Button.EventType.CLICK,()=>{locked=!locked;try{localStorage.setItem(key,locked?'1':'0');}catch{}paint()});
    // Native fast-forward listens for mouse-down on the parent. A lock click
    // has its own hit box and must leave the selected speed alone.
    for(const type of [cc.Node.EventType.MOUSE_DOWN,cc.Node.EventType.MOUSE_UP,cc.Node.EventType.TOUCH_START,cc.Node.EventType.TOUCH_END])
      node.on(type,e=>{e.propagationStopped=true});
    btn.transition=cc.Button.Transition.NONE;view._gardenLock=node;paint();
  }
  return {attach,get locked(){return locked}};
})();
