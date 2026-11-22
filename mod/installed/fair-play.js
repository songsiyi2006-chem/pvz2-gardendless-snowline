function seedAncientEgypt(player) {
    if (player.ancientEgyptStart?.version === 1) return;

    // WorldmapFeatures is the source of the finite stage and plant lists in this build.
    const levels = EGYPT_LEVELS;
    const plants = EGYPT_PLANTS;
    // Preserve exclusive rewards that the player would otherwise lose when progress becomes 4.
    const exclusiveRewards = new Set([
        'egypt1', 'egypt4', 'egypt7', 'egypt8', 'egypt12', 'egypt17',
        'egypt21', 'egypt23', 'egypt25', 'egypt31'
    ]);
    const pending = [];
    for (const id of levels) {
        const record = player.levelProps[id] ?? (player.levelProps[id] = {});
        if ((Number(record.progress) || 0) < 3 && exclusiveRewards.has(id)) pending.push(id);
        record.progress = 4;
    }
    for (const id of plants) {
        const record = player.plantProps[id] ?? (player.plantProps[id] = {
            medal: false, tutorialLevel: 0, costume: -1, costumes: [], boost: 0
        });
        record.progress = 2;
    }
    // The three endless modes have an entrance on the Egypt map. Their runs still start at floor one.
    for (const id of ['egypt_dangerroom', 'egypt_dangerroom_minigame', 'egypt_dangerroom2']) {
        const record = player.levelProps[id] ?? (player.levelProps[id] = {});
        record.progress = Math.max(1, Number(record.progress) || 0);
    }
    player.worldProps[1].unlocked = true;
    player.ancientEgyptStart = {version: 1, pending};
}
