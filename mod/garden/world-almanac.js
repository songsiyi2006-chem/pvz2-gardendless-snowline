function gardenAlmanacVeteranText(original,type,known){
  if(!known||!type)return original;
  const entries=gardenWorldVeterans.matchesForType(type);
  const text=entries.map(e=>'<color=#356454>雪线挑战 · '+(entries.length>1?e.worldName+' / ':'')+e.name+'</color>　'+e.trigger+'，'+e.effect+' '+e.counter);
  return [original,...text].filter(Boolean).join('\n');
}
