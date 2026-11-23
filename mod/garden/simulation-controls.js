function gardenSimulationControls(settings,{plant,roster,busy,onChange,chooseSpecies,map=false}){
  const box=document.createElement('section');box.className='ops-simulation';
  const heading=document.createElement('label');heading.className='ops-sim-toggle';
  const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=settings.enabled;toggle.disabled=busy;
  toggle.dataset.simEnabled='';heading.append(toggle,document.createTextNode(map?'启用挑战植物模拟':'植物模拟'));box.append(heading);
  toggle.addEventListener('change',()=>{settings.enabled=toggle.checked;onChange('[data-sim-enabled]');});
  const explanation=document.createElement('p');explanation.textContent='种植费用、伤害、生命和产阳光量同步放大。产阳光植物最高 12 倍，瓷砖萝卜固定为 1 倍，其他植物最高 5 倍。';box.append(explanation);
  if(!settings.enabled)return box;
  const fields=document.createElement('div');fields.className='ops-sim-fields';box.append(fields);
  function field(title,select){
    const label=document.createElement('label');label.append(document.createTextNode(title),select);fields.append(label);
  }
  function scales(attr,inherit,current,save,limit=5){
    const sel=document.createElement('select');sel.setAttribute(attr,'');sel.disabled=busy||limit===1;
    if(limit===1){sel.add(new Option('固定 ×1','1'));return sel;}
    if(inherit)sel.add(new Option('跟随全队 ×'+settings.base,''));
    for(let n=1;n<=limit;n++)sel.add(new Option('×'+n,String(n)));
    sel.value=String(current??'');
    sel.onchange=()=>{save(sel.value);onChange('['+attr+']');};
    return sel;
  }
  field('全队默认',scales('data-sim-base',false,settings.base,value=>{settings.base=Number(value);}));
  if(map){
    const sel=document.createElement('select');sel.dataset.simSpecies='';sel.add(new Option('选择植物…',''));
    for(const p of roster)if(p.id!=='imitater')sel.add(new Option(p.name,p.id));
    sel.value=plant||'';sel.onchange=()=>{chooseSpecies(sel.value);onChange('[data-sim-species]');};
    field('单株设置',sel);
  }
  if(plant==='imitater'){
    const note=document.createElement('span');note.textContent='模仿者沿用所复制植物的倍率。';fields.append(note);
  }else if(plant){
    const name=roster.find(s=>s.id===plant)?.name||plant;
    field(map?'单株倍率':name,scales('data-sim-plant',true,settings.plants[plant],value=>{
      if(value==='')delete settings.plants[plant];else settings.plants[plant]=Number(value);
    },gardenChallenge.simulationLimit(plant)));
  }
  return box;
}
