"""Compose narrowly anchored 0.16.24 asset edits with the other game modifications."""
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
MAIN = 'assets/main/index.js'
BOOT = 'assets/game-Bs1KMMRZ.js'
PRELOAD = 'assets/preload-BF2KZbod.js'
TRAINER = 'assets/tab-cheats-kPydL2j3.js'
GP = 'assets/gp-next-CZsH-xy2.js'
SHORTCUTS = 'assets/trainer-shortcuts-1T096G6P.js'
CLOUD = 'cloud.html'
ASSETS = (MAIN, BOOT, PRELOAD, TRAINER, GP, SHORTCUTS, CLOUD)


def once(source, old, new):
    if source.count(old) != 1:
        raise ValueError(f'0.16.24 anchor is missing or ambiguous: {old[:100]}')
    return source.replace(old, new, 1)


def core(source):
    manifest = json.loads((HERE / 'egypt-manifest.json').read_text(encoding='utf8'))
    seed = (HERE / 'fair-play.js').read_text(encoding='utf8')
    seed = seed.replace('EGYPT_LEVELS', json.dumps(manifest['levels'])).replace(
        'EGYPT_PLANTS', json.dumps(manifest['plants']))
    # Seed only after the native code has migrated old arrays and built the world records.
    source = once(source, 'var u=new Date;return this.currentPlayer.time=u.getTime()',
                  seed + '\nseedAncientEgypt(e.currentPlayer);var u=new Date;return this.currentPlayer.time=u.getTime()')
    # Settings contain the selected save slot. Import the previous selection once and
    # keep later slot selection, settings and input preferences local to this edition.
    source = once(source, 'var Bi="PvZ2_Settings"', 'var Bi="PvZ2_Greenhouse_Settings_v1"')
    source = once(source, 'var e=w.localStorage.getItem(Bi),i=JSON.parse(e);return i||new Ei',
        'var e=w.localStorage.getItem(Bi);if(e==null){e=w.localStorage.getItem("PvZ2_Settings");'
        'if(e!=null)w.localStorage.setItem(Bi,e)}var i=JSON.parse(e);return i||new Ei')
    source = once(source,
        'r>k.locked&&(S.getLevelProgressByID("tutorial1").progress=S.getLevelProgressByID("tutorial2").progress=S.getLevelProgressByID("tutorial3").progress=S.getLevelProgressByID("tutorial4").progress=k.unlocked_willbeFinished,n.feature_coins=!0)',
        'r>k.locked&&(n.feature_coins=!0)')
    # Remove obsolete shortcuts without granting unrelated rewards from the save-repair dialog.
    source = once(source, 'return r.levelProps[e].progress>=d.unlocked_willbeFinished',
                  'return !r.ancientEgyptStart?.pending?.includes(e)&&r.levelProps[e].progress>=d.unlocked_willbeFinished')
    # Use the original drop and its native save path. Clearing the flag before instantiating the
    # drop lets the same synchronous save persist both the item and its redemption.
    source = once(source, 'if(this.levelDefinition.FirstRewardType&&this.levelDefinition.FirstRewardParam&&r.progress<ve.finished){var a=!1;',
        'const pending=me.currentPlayer.ancientEgyptStart?.pending;'
        'const earned=ta.GitHubLevelName||ta.sandBoxModeOn||me.practiceProfile?-1:'
        '(pending?.findIndex(id=>ta.thisLevelsID.includes(id))??-1);'
        'if(this.levelDefinition.FirstRewardType&&this.levelDefinition.FirstRewardParam&&(r.progress<ve.finished||earned>=0)){'
        'if(earned>=0)pending.splice(earned,1);var a=!1;')
    # Backing handlers and stored preferences are neutralized as well as their buttons.
    source = once(source, 'Ai.allowCheat=!0', 'Object.defineProperty(Ai,"allowCheat",{get(){return false},set(){}})')
    source = once(source, 'i.allowCheat=e.AllowCheats', 'i.allowCheat=false')
    source = once(source, 'AllowCheats:_i.allowCheat', 'AllowCheats:false')
    source = once(source, 'a.setAllowCheat=function(){i.allowCheat=!i.allowCheat,this.allowCheatSprite.color=i.allowCheat?i.GREEN:i.RED,Wi.saveSettings()}',
                  'a.setAllowCheat=function(){}')
    source = once(source, 'this.AllowCheat.string=N.getString(N.lyrics.SettingLyrics.AllowCheat,!1)',
                  'this.AllowCheat.node.active=false')
    source = once(source, 'this.allowCheatSprite.color=i.allowCheat?i.GREEN:i.RED',
                  '(function(node){while(node&&node.name!=="AllowCheat")node=node.parent;if(node)node.active=false})(this.allowCheatSprite.node)')
    source = once(source, 'u.onAddDown=function(t){t.preventSwallow=!0,t.getButton()==d.BUTTON_LEFT?(9900!=this.CurrentValue&&(y.playCheatAdd(),y.playArray(this.addSound,1,0)),this.SunAdd(1e3)):t.getButton()==d.BUTTON_RIGHT&&this.SunDec(1e3),this.TargetValue=this.CurrentValue}',
                  'u.onAddDown=function(){}')
    source = once(source, 'a.onAddMouseDown=function(o){if(o.preventSwallow=!0,o.getButton()==y.BUTTON_LEFT){var t=this.plantFoodNum;this.plantFoodAdd(),t<this.plantFoodNum&&b.playCheatAdd(),T.LawnMowersRelease()}}',
                  'a.onAddMouseDown=function(){}')
    # Historical free HUD grant handlers are distinct from the store's priced purchase path.
    for method, grant in [('buyCoin','this.addCoinCount(1e4)'),('buyGem','this.addGemCount(1)'),
                          ('buyKey','this.addKeyCount(1e4)'),('buyTicket','this.addTicketCount(100)')]:
        source = once(source, method+'=function(){'+grant+'}', method+'=function(){}')
    source = once(source, 'case g.F10:Y.component&&(Y.component.showDebug=!Y.component.showDebug)', 'case g.F10:break')
    source = once(source, 'case M.KEY_P:L.ctrlDown&&L.shiftDown&&L.altDown&&G();break;', 'case M.KEY_P:break;')
    source = once(source, 't("shortenFullTime",(function(){t("ZenGardenFastGrowth",!0)}))', 't("shortenFullTime",(function(){}))')
    source = once(source, 'case w.KEY_P:T.ctrlDown&&T.shiftDown&&T.altDown&&console.log(this.CodePlants)', 'case w.KEY_P:break')
    source = once(source, 'u.openDevTools=function(){var n;null==(n=s())||n.toggleDevTools()}', 'u.openDevTools=function(){}')
    source = once(source, 'me=e("importPP",m((function(e){var t;e&&(f.allPlayers.push(e),f.savePP(),null==(t=ve.cp)||t.restartPlayerLabels())})))',
                  'me=e("importPP",null)')
    source = once(source, 'o.importPP=function(){null==me||me.click()}', 'o.importPP=function(){}')
    source = once(source, 'this.Import.string=S.getString(S.lyrics.PlayerListLyrics.Import,!1)',
                  '(function(node){while(node&&node.name!=="Import")node=node.parent;if(node)node.active=false})(this.Import.node)')
    # Arbitrary community or sandbox content is playable against an in-memory copy. This guards
    # all native inventory/coin/progress writes, including direct writes during combat.
    source = once(source, 'e.savePP=function(){var r=e.allPlayers.concat()',
        'e.beginPractice=function(){if(e.practiceProfile||!e.currentPlayer)return;'
        'const index=e.allPlayers.indexOf(e.currentPlayer);if(index<0)return;'
        'const clone=JSON.parse(JSON.stringify(e.currentPlayer));'
        'e.practiceProfile={players:e.allPlayers,player:e.currentPlayer};'
        'e.allPlayers=e.allPlayers.slice();e.currentPlayer=clone;e.allPlayers[index]=clone},'
        'e.endPractice=function(){if(!e.practiceProfile)return;e.allPlayers=e.practiceProfile.players;'
        'e.currentPlayer=e.practiceProfile.player;e.practiceProfile=null},'
        'e.savePP=function(){if(e.practiceProfile)return;var r=e.allPlayers.concat()')
    source = once(source, 'e.getPlayer=function(r,n){var a;', 'e.getPlayer=function(r,n){e.endPractice();var a;')
    source = once(source, 'x.levelData=i.objects,x.thisLevelsID=[]', 'E.beginPractice(),x.levelData=i.objects,x.thisLevelsID=[]')
    for value in ('i', 's'):
        anchor = 'ht.GitHubOnStartUp=!0,ta.levelData=' + value + ',ta.thisLevelsID=[]'
        source = once(source, anchor, 'me.beginPractice(),'+anchor)
    source = once(source, 't.SandBoxMode&&(ta.sandBoxModeOn=!0)', 't.SandBoxMode&&(ta.sandBoxModeOn=false)')
    source = once(source, 'return function(n,t,r){return e.apply(this,arguments)}}(),r.GoToLastScene=',
        'return function(n,t,r){'
        'if(n?.some(objects=>P.getLevelDefinition(objects)?.objdata?.SandBoxMode))'
        'return this.GoToWorldmap().then(()=>this.gameTipString("此版本已关闭沙盒指令。",3));'
        'return e.apply(this,arguments)}}(),r.GoToLastScene=')
    # A shipped fan-made level starts with no campaign IDs; isolate it in the same manner.
    source = once(source,'m.levelData=t.json.objects,m.thisLevelsID=[]','L.beginPractice(),m.levelData=t.json.objects,m.thisLevelsID=[]')
    source = once(source,'r.GoToWorldmap=function(){var e=', 'r.beginPractice=function(){N.beginPractice()},r.GoToWorldmap=function(){var e=')
    source = once(source,'r.GoToScene=function(){var e=n(t().mark((function e(n,a){var s,o,i=this;',
        'r.GoToScene=function(){var e=n(t().mark((function e(n,a){if(n==="mainScene"||n==="worldMapScene")N.endPractice();var s,o,i=this;')
    return source


def transform(path, source):
    key = str(path).replace('\\','/').lstrip('/')
    if key == MAIN:
        return core(source)
    if key == BOOT:
        # Cloud restores use the shared original profile key. A second launch of this edition
        # must neither read its restore journal nor apply changes to the original profile.
        source = once(source, 'function ee(){return v??=y(),v}', 'function ee(){return Promise.resolve(false)}')
        source = once(source, 'phases:Hr,importEngine:', 'phases:{},importEngine:')
        start = source.index('Wr(),ee().then(e=>{e||yr()||$(()=>import(`./gp-next-')
        end = source.index(';export{', start)
        guard = ('document.addEventListener("keydown",e=>{if(e.key==="F12"||'
                 '(e.ctrlKey&&e.shiftKey&&["KeyI","KeyJ","KeyC"].includes(e.code))){'
                 'e.preventDefault();e.stopImmediatePropagation()}},true);')
        return source[:start] + guard + 'Wr()' + source[end:]
    if key == PRELOAD:
        return once(once(source, 'openDevTools:()=>t(`open_devtools`)', 'openDevTools:async()=>{}'),
                    'toggleDevTools:()=>t(`toggle_devtools`)', 'toggleDevTools:async()=>{}')
    if key == TRAINER:
        return 'const no=()=>false;export {no as _isCheatAllowed,no as _refreshPlayerTools,no as _renderPlayerTools,no as createCheatsTab,no as initializeShortcuts,no as onActivate,no as onDeactivate,no as render};'
    if key == GP:
        return 'const no=()=>false, edition="fair-play";export {no as a,no as i,no as n,no as o,no as r,edition as s,no as t};'
    if key == SHORTCUTS:
        start=source.index('function y(')
        end=source.index('function b(',start)
        return source[:start] + 'function y(){return false}' + source[end:]
    if key == CLOUD:
        return '<!DOCTYPE html><html lang="zh-CN"><meta charset="utf-8"><title>本地存档</title><p>此版本的游戏进度保存在本机。</p></html>'
    return source
