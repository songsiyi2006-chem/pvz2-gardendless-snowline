"""Identify the installed Gardendless scripts without relying on bundler filenames."""

from html.parser import HTMLParser
from base64 import b85decode
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import sys
import zlib


MAIN = "assets/main/index.js"
BOOT = "assets/game-Bs1KMMRZ.js"
PRELOAD = "assets/preload-BF2KZbod.js"
TRAINER = "assets/tab-cheats-kPydL2j3.js"
CONTROL_PANEL = "assets/gp-next-CZsH-xy2.js"
SHORTCUTS = "assets/trainer-shortcuts-1T096G6P.js"
CLOUD = "cloud.html"
ENGINE = "cocos-js/_virtual_cc-937a2166.js"


class ModuleScripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        fields = dict(attrs)
        if tag == "script" and fields.get("type") == "module" and fields.get("src"):
            self.sources.append(fields["src"].removeprefix("./").lstrip("/"))


def detect(table):
    """Return canonical -> installed paths. The assembler still validates every edit."""
    items = {key.lstrip("/") for key in table.items}
    cache = {}

    def read(key):
        if key not in items:
            raise ValueError("Missing game resource: " + key)
        if key not in cache:
            cache[key] = table.decompress("/" + key).decode("utf-8-sig")
        return cache[key]

    def find(role, paths, markers):
        matches = [key for key in paths if key in items and all(mark in read(key) for mark in markers)]
        if len(matches) != 1:
            raise ValueError("Could not uniquely identify " + role + " in game resources: " + repr(matches))
        return matches[0]

    classes = ModuleScripts()
    classes.feed(read("index.html"))
    boot = find("game bootstrap", classes.sources, ["importEngine:", "gp-next-"])
    identity_files = [key for key in items if re.fullmatch(r"assets/build-identity-[\w-]+\.js", key)]
    if boot == "assets/game-B8Kg8fgS.js" or any(
        "4d7a65b8f558edf650a044b5d3160f96c7e854fdf2e3a2fb27c670229dded011" in read(key)
        for key in identity_files
    ):
        raise ValueError("0.16.15 Standard is on hold after a desktop security alert. "
                         "此版暂缓发布，请使用 0.16.14 标准版或 0.16.24 标准版 / Lite。")
    main = find("native gameplay", [MAIN], ["PlayerProperties.ts", "PvZ2_PlayerProperties", "LevelDefinition"])
    engine_exports = read("cocos-js/cc.js")
    constructors = re.findall(r"""["']\./(_virtual_cc-[^/"']+\.js)["']""", engine_exports)
    engine = find("Cocos update loop", ["cocos-js/" + key for key in set(constructors)],
                  ["System.register(", "EVENT_BEFORE_UPDATE", "lateUpdatePhase"])
    cloud = find("cloud save window", [CLOUD], ["<html", "<script"])
    mapping = {MAIN: main, BOOT: boot, ENGINE: engine, CLOUD: cloud}
    direct = sorted(key for key in items if PurePosixPath(key).parent.as_posix() == "assets" and key.endswith(".js"))
    for canonical, prefix, markers in [
        (PRELOAD, "preload", ("open_devtools", "toggle_devtools")),
        (TRAINER, "tab-cheats", ("_isCheatAllowed", "createCheatsTab")),
        (CONTROL_PANEL, "gp-next", ("createCheatsTab", "tab-cheats-")),
        (SHORTCUTS, "trainer-shortcuts", ("ShiftLeft", "ShiftRight", "Escape")),
    ]:
        stems = [prefix, "tmpPatch"] if canonical == PRELOAD else [prefix]
        matching_names = [p for p in direct if any(
            re.fullmatch(re.escape(stem) + r"-[\w-]+\.js", PurePosixPath(p).name) for stem in stems)]
        actual = find(prefix, matching_names, markers)
        mapping[canonical] = actual
    if len(set(mapping.values())) != len(mapping):
        raise ValueError("Multiple script roles map to the same game resource")
    return mapping


def rewrite_boot(source, save_choice):
    """Keep each supported edition's native start routine and its own rendering options."""
    import fairplay

    guard = ('document.addEventListener("keydown",e=>{if(e.key==="F12"||'
             '(e.ctrlKey&&e.shiftKey&&["KeyI","KeyJ","KeyC"].includes(e.code))){'
             'e.preventDefault();e.stopImmediatePropagation()}},true);')
    if "function v(){return g??=_(),g}" in source:
        legacy = re.compile(r"(?P<run>fe|se)\(\),v\(\)\.then\(e=>\{e\|\|[NP]\(\)\|\|\((?P<load>[Aj])\(\(\)=>import\(`\./gp-next-[\w-]+\.js`\),__vite__mapDeps\(\[[\d,]+\]\)\),(?P=load)\(\(\)=>import\(`(?P<bridge>\./tmpPatch-[\w-]+\.js)`\),__vite__mapDeps\(\[[\d,]+\]\)\)\)\}\);(?=export\{)")
        matches = list(legacy.finditer(source))
        if len(matches) != 1:
            raise ValueError("Could not identify the original Gardendless bridge and gameplay bootstrap")
        match = matches[0]
        before, after = source[:match.start()], source[match.end():]
        before = fairplay.once(before, "function v(){return g??=_(),g}", "function v(){return Promise.resolve(false)}")
        phase = "de" if match["run"] == "fe" else "oe"
        before = fairplay.once(before, "phases:" + phase + ",importEngine:", "phases:{},importEngine:")
        # Earlier versions installed the native desktop API from an independent import.
        # Keep the bridge for sound, input and window functions. The trainer is omitted.
        before += guard
        launch = "async()=>{await import(" + json.dumps(match["bridge"]) + ");return " + match["run"] + "()}"
    elif "async function Yr(){if(!await ee()&&!await P()){S(`lite-bootstrap-start`)" in source:
        # The Lite build uses an instrumented startup. Preserve its render scale and
        # timing markers while removing the optional mods' pre-engine callbacks.
        source = fairplay.once(source, "function ee(){return v??=y(),v}", "function ee(){return Promise.resolve(false)}")
        old = "phases:{...Ur,beforeEngineInit:()=>S(`cocos-game-init-start`),beforeRun:async()=>{await Ur.beforeRun(),S(`cocos-game-init-complete`)}}"
        new = "phases:{beforeEngineInit:()=>S(`cocos-game-init-start`),beforeRun:()=>S(`cocos-game-init-complete`)}"
        source = fairplay.once(source, old, new)
        pattern = r"Yr\(\),ee\(\)\.then\(e=>\{e\|\|re\(\)\|\|k\(\(\)=>import\(`\./gp-next-[\w-]+\.js`\)\.then\(e=>e\.t\),__vite__mapDeps\(\[[\d,]+\]\)\)\}\);(?=export\{)"
        matches = list(re.finditer(pattern, source))
        if len(matches) != 1:
            raise ValueError("Lite bootstrap and optional trainer launcher could not be identified unambiguously")
        match = matches[0]
        before = source[:match.start()] + guard
        after = source[match.end():]
        launch = "Yr"
    else:
        converted = fairplay.transform(fairplay.BOOT, source)
        marker = "Wr();export{"
        if converted.count(marker) != 1:
            raise ValueError("Missing or ambiguous game entry after fair-play shell setup")
        index = converted.index(marker)
        before, after = converted[:index], converted[index + len("Wr();"):]
        launch = "Wr"

    def public_keys(code):
        return code.replace("PvZ2_PlayerProperties", "PvZ2_Snowline_PublicBeta_01_Players").replace(
            "PvZ2_Greenhouse_", "PvZ2_Snowline_PublicBeta_01_")

    return public_keys(before) + save_choice + "\nstartSnowlineWithProgress(" + launch + ");" + public_keys(after)


def prepare_preload(source):
    legacy = "openDevTools:async()=>t(`open_devtools`)"
    if legacy in source:
        import fairplay
        # The shared adapter replaces this entire bridge function with an async no-op.
        return fairplay.once(source, legacy, "openDevTools:()=>t(`open_devtools`)")
    return source


def _apply_native_edits(source, encoded):
    stream = iter(zlib.decompress(b85decode(encoded)))
    def number(first):
        value, shift, byte = 0, 0, first
        while True:
            value |= (byte & 127) << shift
            if not byte & 128:
                return value
            shift += 7
            byte = next(stream)
    output = bytearray()
    cursor = 0
    for head in stream:
        token = number(head)
        count = token >> 1
        if token & 1:
            output.extend(next(stream) for _ in range(count))
        else:
            distance = number(next(stream))
            cursor += -(distance // 2 + 1) if distance & 1 else distance // 2
            if cursor < 0 or cursor + count > len(source):
                raise ValueError("Invalid native compatibility range")
            output.extend(source[cursor:cursor+count])
            cursor += count
    return bytes(output)


def prepare_main(raw):
    """Adapt the hashed old native hooks and the high-speed plant lifecycle."""
    if "t.SandBoxMode&&(Qr.sandBoxModeOn=!0)" not in raw:
        return raw
    base = Path(sys.executable if getattr(sys, "frozen", False) else __file__).resolve().parent
    entries = json.loads((base / "compatibility-data.json").read_text(encoding="utf-8"))
    tokens = re.split(r'(System\.register\("chunks:///_virtual/([^"\n]+)",)', raw.replace("\r\n", "\n"))
    adapted = set()
    for pos in range(2, len(tokens), 3):
        name = tokens[pos]
        if name not in entries:
            continue
        original = tokens[pos+1].encode("utf-8")
        entry = entries[name]
        if name in adapted or hashlib.sha256(original).hexdigest() != entry["source"]:
            raise ValueError("Unsupported changes in the native compatibility module: " + name)
        result = _apply_native_edits(original, entry["delta"])
        if hashlib.sha256(result).hexdigest() != entry["result"]:
            raise ValueError("Native compatibility output mismatch: " + name)
        tokens[pos+1] = result.decode("utf-8")
        adapted.add(name)
    if adapted != entries.keys():
        raise ValueError("The older game is missing a required native compatibility module")
    return tokens[0] + "".join(tokens[i] + tokens[i+2] for i in range(1, len(tokens), 3))
