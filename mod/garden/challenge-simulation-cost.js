// Preserve native level overrides and escalating costs before applying the selected plant's simulation.
const gardenSimulationCost=(()=>{
  function factor(card){
    if(!card?.Type||card._gardenFallingPacket||card.ca?.free)return 1;
    return gardenChallenge.simulation(card.Type);
  }
  function price(card,nativeCost){
    return Number.isFinite(nativeCost)&&nativeCost>0?nativeCost*factor(card):nativeCost;
  }
  function canPlace(ui,card){
    // Free drops also use index eight in the native UI. Only a packet actually in the seed bank is a purchase.
    if(ui.cards?.CFs?.[ui.index]!==card||factor(card)<=1)return true;
    const cost=card.SUNCOST,bank=window.System.get('chunks:///_virtual/SunCount.ts').SunCount.component;
    card.SUNCOST=cost;
    if(cost>0&&bank.CurrentValue<cost){
      card.ca.affordable=false;
      bank.playWarn();
      return false;
    }
    ui.willCostSun=cost;
    return true;
  }
  return Object.freeze({price,canPlace});
})();
