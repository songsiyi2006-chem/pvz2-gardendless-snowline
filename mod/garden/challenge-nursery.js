const gardenChallengeNursery=(()=>{
  const credited=new WeakSet();
  function start(level,wallet){
    if(!wallet||credited.has(level)||!gardenChallenge.active(level)||!Number.isFinite(wallet.CurrentValue))return false;
    wallet.setSunCount(wallet.CurrentValue+1000);
    credited.add(level);
    return true;
  }
  function duration(seconds,level){
    return seconds>0&&gardenChallenge.active(level)?seconds*.5:seconds;
  }
  return Object.freeze({start,duration});
})();
