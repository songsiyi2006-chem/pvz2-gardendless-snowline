/* The native card prefab places its portrait under Plant, above the background
   and below the original price, cooldown, lock and selection decorations. */
let gardenBadgeAtlas;

function gardenBadgeFrames(cc) {
  if (gardenBadgeAtlas) return gardenBadgeAtlas;
  const w = 76, h = 32, scale = 3, gutter = 2;
  const canvas = document.createElement("canvas");
  canvas.width = (w + gutter * 2) * scale;
  const labels = ["0阶","1阶","2阶","3阶","4阶","5阶","6阶","随目标"];
  canvas.height = (h + gutter * 2) * labels.length * scale;
  const paint = canvas.getContext("2d");
  const fills = ["#3c4742","#174d3c","#20573e","#285c4c","#285368","#544b69","#694319","#414650"];
  const trims = ["#b5bcac","#b5d455","#c5df75","#d5e196","#a9d8db","#dfc5e4","#f5d282","#e2d7ec"];

  for (let rank = 0; rank < labels.length; rank++) {
    paint.save();
    paint.scale(scale, scale);
    paint.translate(gutter, rank * (h + 2 * gutter) + gutter);
    paint.beginPath();
    paint.moveTo(8, 1.5); paint.lineTo(w-8, 1.5);
    paint.quadraticCurveTo(w-1.5, 1.5, w-1.5, 8);
    paint.lineTo(w-1.5, h-8); paint.quadraticCurveTo(w-1.5,h-1.5,w-8,h-1.5);
    paint.lineTo(8,h-1.5); paint.quadraticCurveTo(1.5,h-1.5,1.5,h-8);
    paint.lineTo(1.5,8); paint.quadraticCurveTo(1.5,1.5,8,1.5);
    paint.closePath();
    paint.fillStyle = fills[rank]; paint.fill();
    paint.lineWidth = 2.6; paint.strokeStyle = trims[rank]; paint.stroke();
    const numbered = rank <= 6;
    if (numbered) {
      // A sprouting leaf identifies the greenhouse rank even on a moving belt.
      paint.fillStyle = trims[rank]; paint.beginPath();
      paint.moveTo(10,22); paint.bezierCurveTo(7,13,13,8,23,8);
      paint.bezierCurveTo(23,17,19,23,10,22); paint.closePath(); paint.fill();
      paint.beginPath(); paint.moveTo(9,25); paint.lineTo(19,13);
      paint.lineWidth = 1.7; paint.strokeStyle = fills[rank]; paint.stroke();
    }
    paint.fillStyle = "#fff8e6";
    paint.textAlign = "center"; paint.textBaseline = "middle";
    paint.font = 'bold 23px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
    paint.fillText(labels[rank], numbered ? 47.5 : w/2, 16.7, numbered ? 45 : w-11);
    paint.restore();
  }

  const texture = new cc.Texture2D();
  texture.image = new cc.ImageAsset(canvas);
  const frames = [];
  for (let rank = 0; rank < labels.length; rank++) {
    const frame = new cc.SpriteFrame();
    frame.texture = texture;
    frame.rect = new cc.Rect(gutter * scale, (rank * (h + gutter * 2) + gutter) * scale, w * scale, h * scale);
    frame.originalSize = new cc.Size(w * scale, h * scale);
    frame.packable = false;
    frame.name = "greenhouse-rank-" + (rank <= 6 ? rank : "inherited");
    frame.addRef();
    frames.push(frame);
  }
  gardenBadgeAtlas = frames;
  return frames;
}

function gardenUpdateSeedBadge(card) {
  if (!card.node?.isValid) return;
  const stage = card.node.scene;
  const portrait = card.node.getChildByName("Plant");
  if (!portrait) return;
  let badge = portrait.getChildByName("GreenhouseRank");
  if (stage?.name !== "inGameScene" || !card.PF?.CODENAME) {
    if (badge) badge.active = false;
    return;
  }
  const cc = window.System.get(window.System.resolve("cc"));
  let type = card.Type || card.PF.CODENAME;
  if (type === "imitater" && card.isImitater && Number.isInteger(card.ID)) {
    const plants = window.System.get("chunks:///_virtual/Plants.ts")?.plants;
    type = plants?.getPlantFeature(card.ID)?.CODENAME || type;
  }
  // A chosen copy's native Type, ID and portrait are the target's. A raw packet
  // has no target, so its badge explains the inheritance instead of showing a number.
  const pending = type === "imitater";
  const rank = gardenFixed.inLevel() ? 5 : pending ? 7 : typeof resolve === "function"
    ? (resolve(type,card.ID,card.isImitater,gardenBattleRank)?.rank ?? gardenBattleRank(type))
    : gardenBattleRank(type);
  if (!badge) {
    badge = new cc.Node("GreenhouseRank");
    badge.setParent(portrait);
    badge.addComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
  }
  const sprite = badge.getComponent(cc.Sprite);
  const frame = gardenBadgeFrames(cc)[rank];
  if (sprite.spriteFrame !== frame) sprite.spriteFrame = frame;
  const face = card.node.getComponent(cc.UITransform);
  const w = face?.width || 239, h = face?.height || 151;
  const width = w * .32, height = width * (32/76);
  badge.getComponent(cc.UITransform).setContentSize(width,height);
  badge.layer = portrait.layer;
  // The vertical conveyor puts native hotkeys in the upper right. Conveyor
  // packets are free and their price is hidden, so the lower right is clear.
  const belt = window.System.get("chunks:///_virtual/Conveyor.ts")?.Conveyor?.component;
  const onBelt = belt && (card.node.parent === belt.cardsVert || card.node.parent === belt.cards);
  const y = h * .5 - height * .5 - h * .085;
  badge.setPosition(w * .5 - width * .5 - w * .039, onBelt ? -y : y, 0);
  badge.active = true;
}
