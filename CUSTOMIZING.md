# 用 AI 定制 / Modding with AI

## 简体中文

先完整解压 Windows 补丁。运行补丁前，可以直接编辑旁边的 `mod`。保留好原始 0.16.24 EXE，每次改完都用补丁生成一个新文件。游戏会继续使用你本机的 0.1 存档。若要进行独立平衡测试，建议在另一个 Windows 用户中开始。

| 想改什么 | 从哪里读起 |
|---|---|
| 进阶价格、胜利给点、全队培养 | [economy.js](mod/garden/economy.js) |
| 每株植物的六阶模式和专精 | [modes.js](mod/garden/modes.js)、[mode-mastery.js](mod/garden/mode-mastery.js) |
| 天赋树和前置节点 | [talents.js](mod/garden/talents.js) |
| 挑战波次、旗距、增援名额 | [challenge-core.js](mod/garden/challenge-core.js) |
| 日常难度护具与增援预算 | [adventure-fourth.js](mod/garden/adventure-fourth.js) |
| 盾面、个人护具与迷彩 | [challenge-armor.js](mod/garden/challenge-armor.js) |
| 机炮、远程炮击、航空 | [arsenal.js](mod/garden/arsenal.js)、[air-wing.js](mod/garden/air-wing.js) |

给 AI 的一个具体任务可以是“只改普通Ⅱ的增援频率。解释新旧差异，并核对普通Ⅰ、普通Ⅳ和挑战的预算”。在同一个关卡记录首波时间、旗帜数量、资源花费和实际受击数。分享改动时附上游戏秒数和倍速。修改 `modes.menu` 或 `modes.runtime.js` 后可运行 `python mod/garden/modes_build.py` 生成生效的 `modes.js`。直接编辑已生成的 `modes.js` 则无需此步骤。

若希望手工构建，可在 Windows 安装 Python 3.11 或更高版本，然后执行下方命令。命令行与双击版读取同一套模块。输出文件名须尚未存在。

## English

Extract the whole patch archive. Edit the adjacent `mod` directory before running the patcher. Keep the original Gardendless executable and generate a new output after each change. New outputs share your local beta 0.1 save. A separate Windows user provides an independent profile for balance testing.

The table above links the implementation for progression, mastery, talents, wave budgets, armor and weapons. For a small experiment, ask an AI tool to adjust the ordinary difficulty-II reinforcement rate and explain how it verified the budgets on I, IV and expedition difficulty. Replay the same stage and record time to first wave, flags, resource spending and actual health lost. State the selected game speed. After editing the mode menu or runtime template, regenerate the active file with `python mod/garden/modes_build.py`. You can also edit `modes.js` directly.

### Source build / 源码构建

Use Windows and Python 3.11+. Choose a new output filename. The GUI patcher bundles its own runtime.

```powershell
python -m pip install -r requirements.txt
python patcher.py "D:\Games\pvzge-0.16.24.exe" "D:\Games\Snowline-custom.exe"
```

The official 0.1 game generated from the unmodified patch has SHA-256 `6bdb3dde41338f6b5b95d3c764d2f8f5bbc84435f7d8544abd663ef66da1b72f`. A customized build normally has a different hash.
