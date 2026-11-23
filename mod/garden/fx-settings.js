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
  return Object.freeze({get enabled(){return enabled},setEnabled,subscribe,warm});
})();
