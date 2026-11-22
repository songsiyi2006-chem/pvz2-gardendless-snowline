// The native registry can include plants from another Gardendless content build.
// Keep their numeric progression separate from the hand-authored combat catalogue.
const gardenCompatible = (() => {
  const byId=new Map(gardenCatalogue.map(p=>[p.id,p]));
  const codes=new Map(gardenCatalogue.map(p=>[p.nativeId,p.id]));
  const internal=new Set(/*NATIVE_INTERNALS*/[]);
  for(const p of gardenCatalogue)for(const [code] of p.variants||[])internal.add(code);
  const tiers=Array.from({length:6},(_,i)=>({
    name:['一','二','三','四','五','六'][i]+'阶 · 基础强化',
    description:'累计伤害和行动速度各提高 '+((i+1)*10)+'%，生命提高 '+((i+1)*200)+'%。产阳植物的单颗产量与生产速度同步提高。'
  }));
  let previous=null,count=-1;
  function refresh(){
    const rows=globalThis.System?.get?.('chunks:///_virtual/Plants.ts')?.plants?.plantRes?.PlantFeatures;
    if(!Array.isArray(rows)||rows===previous&&rows.length===count)return;
    previous=rows;count=rows.length;
    const children=new Set(rows.flatMap(p=>p?.SubPlantList||[]));
    rows.forEach((p,index)=>{
      const id=p?.CODENAME;
      if(typeof id!=='string'||!id||Object.hasOwn(Object.prototype,id)||byId.has(id)||internal.has(id)||children.has(id))return;
      if(!p.RES?.Plant||p.TAGS?.includes('potion'))return;
      const nativeId=Number.isSafeInteger(p.ID)?p.ID:index;
      const plan={id,nativeId,name:p.NAME?.zh||p.NAME?.en||id,world:p.OBTAINWORLD||'扩展植物',numericOnly:true,
        sunProducer:p.TAGS?.includes('sunProducer')===true,card:p._CARDSPRITENAME,tiers};
      gardenCatalogue.push(plan);gardenPlantIds.add(id);gardenNativeIds.set(id,nativeId);byId.set(id,plan);codes.set(nativeId,id);
    });
  }
  function code(value){
    if(value&&typeof value==='object')value=value.CODENAME??value.plantId??value.Plant_Type??value.ID;
    if(value==null||typeof value==='string'&&(gardenPlantIds.has(value)||internal.has(value)))return value;
    const numeric=typeof value==='number'||typeof value==='string'&&/^\d+$/.test(value);
    if(numeric&&codes.has(Number(value)))return codes.get(Number(value));
    refresh();
    return numeric?codes.get(Number(value)):value;
  }
  const get=id=>byId.get(code(id));
  return {refresh,code,get,numeric:id=>get(id)?.numericOnly===true};
})();
