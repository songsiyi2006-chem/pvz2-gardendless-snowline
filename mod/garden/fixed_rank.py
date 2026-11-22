"""Resolve rift levels from actual map nodes and bind the level's live loadout policy."""
import base64
import json
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / 'format' / 'web-test' / 'assets' / 'resources'


def nodes(value):
    yield value
    if isinstance(value, list):
        for child in value:
            yield from nodes(child)
    elif isinstance(value, dict):
        for child in value.values():
            yield from nodes(child)


def import_path(config, index):
    packed = config['uuids'][int(index)]
    key = str(uuid.UUID(packed[:2] + base64.b64decode(packed[2:]).hex()))
    return ASSETS / 'import' / key[:2] / (key + '.json')


def asset(config, index):
    path = import_path(config, index)
    if path.is_file():
        return json.loads(path.read_text(encoding='utf8'))
    for pack, members in config['packs'].items():
        if int(index) in members:
            path = ASSETS / 'import' / pack[:2] / (pack + '.json')
            return json.loads(path.read_text(encoding='utf8'))[-1][members.index(int(index))]
    raise FileNotFoundError(path)


def rift_ids():
    config = json.loads((ASSETS / 'config.json').read_text(encoding='utf8'))
    levels = {p[0][7:] for p in config['paths'].values() if p[0].startswith('levels/')}
    worlds = [(k, p[0]) for k, p in config['paths'].items() if p[0].startswith('worldmaps/epic/')]
    result = set()
    for index, name in worlds:
        prefab = asset(config, index)
        # Cocos serializes LevelIsland.levelJsonsID as an array of resource codenames.
        # Use each portal's real node list, including unnamed entry levels absent
        # from WorldmapFeatures.LEVELS.
        ids = {key for array in nodes(prefab) if isinstance(array, list) and array
               and all(isinstance(v, str) and v in levels for v in array) for key in array}
        if not ids:
            raise ValueError('Missing rift level nodes in ' + name)
        result.update(ids)
    if not worlds or 'squash0' not in result or 'egypt12' in result:
        raise ValueError('Unexpected rift portal mapping')
    return result


def helper():
    src = (HERE / 'fixed-rank.js').read_text(encoding='utf8')
    return src.replace('/*RIFT_LEVEL_IDS*/[]', json.dumps(sorted(rift_ids()), separators=(',', ':')))


def apply(src):
    from fairplay import once
    # InitialPlantProperties may appear before the seed-bank module. Resolve the
    # whole definition before any module spawns plants. Danger Room generators
    # may then change the module list, so resolve their produced bank once again.
    src = once(src, 'this.levelDefinition=t,null!=t&&t.SandBoxMode',
        'this.levelDefinition=t,gardenFixed.prepare(this,ta,t,Ue),null!=t&&t.SandBoxMode')
    return once(src, 'return e.next=41,this.readModules(null==t?void 0:t.Modules)',
        'return (this.isDangerroom||this.isDangerroomMiniGame)&&gardenFixed.prepare(this,ta,t,Ue),e.next=41,this.readModules(null==t?void 0:t.Modules)')
