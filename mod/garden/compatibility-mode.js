// A mode switch reloads the game so a board never mixes two combat runtimes.
const gardenCompatibilitySettings = (() => {
  const key = /*MODE_KEY*/null;
  const classic = /*CLASSIC*/false;
  const cc = () => window.System.get(window.System.resolve("cc"));
  const isChinese = () => {
    const language = window.System.get("chunks:///_virtual/MultiLanguage.ts");
    return language?.MultiLanguage?.currentLanguage === language?.LanguageEnum?.ZH;
  };
  const translate = (zh, en) => isChinese() ? zh : en;
  const caption = () => translate("改版与兼容设置", "Mod & Compatibility");
  let dialog;

  function open(inBattle) {
    if (dialog?.open) return;
    dialog = document.createElement("dialog");
    dialog.id = "snowline-compatibility-settings";
    dialog.setAttribute("aria-labelledby", "snowline-compatibility-title");
    dialog.innerHTML = `<style>
      #snowline-compatibility-settings{box-sizing:border-box;width:min(480px,90vw);padding:24px;border:1px solid #85a395;border-radius:14px;background:#15362e;color:#f1f0df;font:15px/1.55 Georgia,"Microsoft YaHei UI",sans-serif;box-shadow:0 18px 58px #0a1d17b0}
      #snowline-compatibility-settings::backdrop{background:#081a17b8}
      #snowline-compatibility-settings h2{margin:0 0 10px;font:700 23px/1.3 "Microsoft YaHei UI",sans-serif}
      #snowline-compatibility-settings p{margin:8px 0 14px;color:#d0e0d7}
      #snowline-compatibility-settings label{display:flex;gap:8px;align-items:center;margin:12px 0 18px}
      #snowline-compatibility-settings input{accent-color:#e6cd89}
      #snowline-compatibility-settings footer{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}
      #snowline-compatibility-settings button{font:inherit;border:1px solid #8caa9c;border-radius:6px;padding:7px 12px;cursor:pointer;background:#244639;color:#edf2e5}
      #snowline-compatibility-settings button[data-mode]{color:#19352b;background:#e6cd89;border-color:#e6cd89}
      #snowline-compatibility-settings [role=alert]{color:#ffcfac}
    </style><h2 id="snowline-compatibility-title"></h2><p data-current></p><p data-description></p>
    <label><input type="checkbox"><span></span></label><p role="alert" hidden></p>
    <footer><button type="button" data-cancel></button><button type="button" data-mode></button></footer>`;
    const at = selector => dialog.querySelector(selector);
    at("h2").textContent = caption();
    at("[data-current]").textContent = classic
      ? translate("当前：兼容模式", "Current mode: Compatibility")
      : translate("当前：装甲雪线改版", "Current mode: Snowline Garden");
    at("[data-description]").textContent = classic
      ? translate("恢复升阶、挑战、重装和改版特效。", "Restore ranks, expeditions, equipment and mod effects.")
      : translate("临时使用原关卡的战斗规则，关闭进阶、挑战、重装和改版特效。", "Use the original level rules with ranks, expeditions, equipment and mod effects disabled.");
    const checkbox = at("input");
    checkbox.closest("label").hidden = classic;
    if (classic) checkbox.closest("label").style.display = "none";
    else {
      checkbox.checked = gardenFxSettings.enabled;
      at("label span").textContent = translate("升阶技能特效", "Rank skill effects");
      checkbox.onchange = () => gardenFxSettings.setEnabled(checkbox.checked);
    }
    const cancel = at("[data-cancel]");
    cancel.textContent = translate("返回", "Back");
    cancel.onclick = () => dialog.close();
    const change = at("[data-mode]");
    const action = classic ? translate("恢复改版", "Restore mod") : translate("启用兼容模式", "Enable compatibility");
    change.textContent = action;
    change.onclick = () => {
      if (change.textContent === action) {
        at("[data-description]").textContent = inBattle
          ? translate("切换后将结束本局并返回主菜单，已保存的进度保留。", "Switching ends the current attempt and returns to the main menu. Saved progress is kept.")
          : translate("切换后将重新载入并返回主菜单，已保存的进度保留。", "Switching reloads the game and returns to the main menu. Saved progress is kept.");
        change.textContent = translate("确认切换", "Confirm switch");
        cancel.focus();
        return;
      }
      try {
        localStorage.setItem(key, classic ? "0" : "1");
      } catch {
        at("[role=alert]").hidden = false;
        at("[role=alert]").textContent = translate("无法写入设置。请检查本机存储。", "Could not save the setting. Check local storage.");
        return;
      }
      location.reload();
    };
    const panel = dialog;
    panel.addEventListener("close", () => panel.remove(), {once:true});
    panel.addEventListener("keydown", event => event.stopPropagation());
    document.body.append(panel);
    panel.showModal();
    cancel.focus();
  }

  function paintMain(view) {
    const sprite = view.allowCheatSprite;
    const label = view.tooltips.AllowCheat;
    label.string = caption();
    label.node.active = true;
    sprite.color = new (cc().Color)(83, 143, 119);
  }

  function setupMain(view) {
    const engine = cc();
    const node = view.allowCheatSprite.node;
    node.name = "GardenCompatibility";
    node.active = true;
    for (const event of node.getComponent(engine.Button)?.clickEvents || []) {
      if (event.handler === "setAllowCheat") event.handler = "openGardenSettings";
    }
    paintMain(view);
  }

  function setupPause(view) {
    const engine = cc();
    const original = view.autoPauseToggle?.node;
    if (!original?.parent) return;
    if (!view.gardenCompatibilityButton?.isValid) {
      const node = new engine.Node("GardenCompatibility");
      node.layer = original.layer;
      node.parent = original.parent;
      node.setPosition(original.position.x+870,original.position.y,original.position.z);
      node.addComponent(engine.UITransform).setContentSize(266,46);
      const ink = node.addComponent(engine.Graphics);
      ink.fillColor = new engine.Color(35,59,53,237);
      ink.roundRect(-133,-23,266,46,15);
      ink.fill();
      ink.strokeColor = new engine.Color(173,198,160);
      ink.lineWidth = 1.8;
      ink.roundRect(-133,-23,266,46,15);
      ink.stroke();
      node.addComponent(engine.Button);
      const text = new engine.Node("Caption");
      text.layer = node.layer;
      text.parent = node;
      const label = text.addComponent(engine.Label);
      label.fontFamily = "Microsoft YaHei UI";
      label.fontSize = 22;
      label.lineHeight = 29;
      label.isBold = true;
      label.color = new engine.Color(244,241,215);
      view.gardenCompatibilityButton = node;
      view.gardenCompatibilityCaption = label;
      node.on(engine.Button.EventType.CLICK, () => open(true));
    }
    view.gardenCompatibilityCaption.string = caption();
  }

  return {open,setupMain,paintMain,setupPause};
})();
