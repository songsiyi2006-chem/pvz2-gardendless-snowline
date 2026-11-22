// Equipment belongs to a player profile, next to its ranks and points.
const gardenArmory=(()=>{
  const item=id=>gardenArsenal.catalog.find(v=>v.id===id);
  const heavySlot=gear=>gear?.slot==='heavy';
  const exclusive=gear=>heavySlot(gear)||gear?.slot==='interceptor';
  const interceptMode=(save=currentSave())=>save?.armory?.interceptMode==='output'?'output':'all';
  function setInterceptMode(mode,profile){
    if(!['all','output'].includes(mode)||!profile||profile!==gardenEconomy.profile())return false;
    return gardenChallengeRewards.spendGems(0,save=>inventory(save).owned.some(id=>item(id)?.slot==='interceptor')?
      {...save,armory:{...save.armory,interceptMode:mode}}:null,profile);
  }
  const upgradeRates=[0,6,10,15,20];
  const limit=id=>{const gear=item(id);return gear?.slot==='heavy'||gear?.slot==='aviation'?7:gear?5:0;};
  function currentSave(){
    const p=gardenEconomy.profile();
    return p?gardenEconomy.read(p):null;
  }
  function ownedLevel(id,armory){
    const value=armory.levels?.[id];
    return Number.isInteger(value)&&value>=1&&value<=limit(id)?value:1;
  }
  function level(id,save=currentSave()){
    const a=save?.armory;
    return item(id)&&Array.isArray(a?.owned)&&a.owned.includes(id)?ownedLevel(id,a):0;
  }
  function upgradeCost(id,save=currentSave()){
    const rank=level(id,save);
    if(rank<1||rank>=limit(id))return null;
    return rank===5?1800:rank===6?4200:Math.ceil(item(id).cost*upgradeRates[rank]/10);
  }
  function sniperForm(save=currentSave()){return level('sniper',save)>=5&&save?.armory?.sniperForm!=='precision'?'mk14':'precision';}
  function setSniperForm(form,profile){
    if(!['precision','mk14'].includes(form)||!profile||profile!==gardenEconomy.profile())return false;
    return gardenChallengeRewards.spendGems(0,save=>level('sniper',save)>=5&&sniperForm(save)!==form?
      {...save,armory:{...save.armory,sniperForm:form}}:null,profile);
  }
  function rotaryForm(save=currentSave()){return level('rotary',save)>=5&&save?.armory?.rotaryForm==='ap'?'ap':'he';}
  function setRotaryForm(form,profile){
    if(!['he','ap'].includes(form)||!profile||profile!==gardenEconomy.profile())return false;
    return gardenChallengeRewards.spendGems(0,save=>level('rotary',save)>=5&&rotaryForm(save)!==form?
      {...save,armory:{...save.armory,rotaryForm:form}}:null,profile);
  }
  function inventory(save=currentSave()){
    const a=save?.armory;
    const valid=val=>Array.isArray(val)?[...new Set(val)].filter(id=>item(id)):[];
    const owned=valid(a?.owned);
    const levels=Object.fromEntries(owned.map(id=>[id,ownedLevel(id,a)]));
    // Equipping an item appends it. Recover the player's latest heavy choice
    // when loading an inventory that once allowed several simultaneous mounts.
    const chosen=valid(a?.equipped).filter(id=>owned.includes(id));
    const latest=new Map(chosen.filter(id=>exclusive(item(id))).map(id=>[item(id).slot,id]));
    const equipped=chosen.filter(id=>!exclusive(item(id))||latest.get(item(id).slot)===id);
    return {owned,equipped,levels};
  }
  function withItem(equipped,gear){
    return [...equipped.filter(id=>id!==gear.id&&!(exclusive(gear)&&gear.slot===item(id)?.slot)),gear.id];
  }
  function change(id,action,profile,expectedLevel){
    const gear=item(id);
    if(!gear||!profile||profile!==gardenEconomy.profile()||!['buy','equip','remove','upgrade'].includes(action))return false;
    const price=action==='upgrade'?upgradeCost(id):action==='buy'?gear.cost:0;
    if(price===null)return false;
    return gardenChallengeRewards.spendGems(price,old=>{
      const {owned,equipped,levels}=inventory(old),has=owned.includes(id),on=equipped.includes(id);
      if(action==='upgrade'){
        if(!has||levels[id]!==expectedLevel||upgradeCost(id,old)!==price)return null;
        levels[id]++;
        const armory={...old.armory,levels};if(id==='sniper'&&levels[id]===5)armory.sniperForm='mk14';
        return {...old,armory};
      }
      const armory={...old.armory,owned,equipped,levels};
      if(action==='buy'){
        if(has)return null;
        armory.owned.push(id);armory.equipped=withItem(equipped,gear);armory.levels[id]=1;
      }else{
        if(!has||(action==='equip')===on)return null;
        armory.equipped=on?equipped.filter(k=>k!==id):withItem(equipped,gear);
      }
      return {...old,armory};
    },profile);
  }
  return {inventory,level,limit,heavySlot,exclusive,interceptMode,setInterceptMode,sniperForm,setSniperForm,rotaryForm,setRotaryForm,upgradeCost,change,equipped:()=>inventory().equipped};
})();

