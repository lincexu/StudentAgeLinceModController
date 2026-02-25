# TalkCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**TalkCfg.json** 是游戏的对话配置文件，定义了游戏中所有对话的文本内容、角色、背景、选项、效果等。

- **加载路径**: `Cfgs/{语言}/TalkCfg`
- **存储位置**: `Cfg.TalkCfgMap` (Dictionary<int, TalkCfg>)
- **用途**: 配置对话文本、角色显示、背景、选项分支、效果等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 对话唯一ID | `1001`, `1002` |
| `content` | string | 对话文本内容 | `"你好！"` |
| `roleIds` | List<int> | 说话角色ID列表 | `[3]`, `[-1]`, `[3, 101]` |
| `roleName` | string | 角色名称覆盖 | `"老师"` |
| `bg` | int | 背景图ID | `113`, `0`=无变化, `-1`=保持, `-2`=黑屏 |
| `audio` | int | 音频/音效ID | `1001` |
| `nextTalk` | List<int> | 下一段对话ID | `[1002]`, `[1002, 1003]` |
| `nextTalk2` | List<int> | 备选下一段对话 | `[1003]` |
| `option` | List<int> | 选项ID列表 | `[501, 502]` |
| `maxoptions` | int | 最大显示选项数 | `3` |
| `check` | List<List<double>> | 条件检查 | `[[4.0, 1.0, 100.0]]` |
| `effect` | List<List<float>> | 主要效果 | `[[1.0, 1.0, 3.0, 5.0]]` |
| `effect2` | List<List<float>> | 备选效果 | `[[1.0, 1.0, 3.0, -5.0]]` |
| `showTxt` | string | 条件提示文本 | `"条件满足"` |
| `replace` | List<int> | 替换对话ID | `[2001]` |
| `highlights` | List<int> | 高亮角色索引 | `[0]`, `[0, 1]` |
| `roles` | List<List<float>> | 角色显示配置 | `[[312.0, 1002.0, 1.0, 3.0]]` |
| `screenEffect` | List<float> | 屏幕特效 | `[1.0, 0.5, 1.0]` |
| `miniGame` | List<double> | 小游戏ID | `[2.0, 1.0]` |
| `time` | int | 选项倒计时(秒) | `10`, `0`=无倒计时 |
| `vocals` | List<float> | 配音参数 | `[1.0, 0.0]` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 对话的唯一标识符

**说明**: 用于在游戏中唯一标识一段对话

---

### 3.2 content

**类型**: `string`

**功能**: 对话文本内容

**示例**:
```json
"content": "你好！我是新来的转学生。"
"content": "思想品德课上，老师讲起了周总理年轻时的格言：为中华之崛起而读书。"
```

**说明**:
- 支持变量替换（通过 RecordMgr.Replace）
- 支持富文本标签（颜色、大小等）
- 支持换行符 `\n`

---

### 3.3 roleIds ⭐重要

**类型**: `List<int>`

**功能**: 说话角色ID列表

| 值 | 含义 |
|----|------|
| `-1` | 旁白/系统/老师 |
| `-2` | 主角内心独白 |
| `0` | 主角自己 |
| `>0` | NPC角色ID |

**示例**:
```json
"roleIds": [-1]          // 旁白
"roleIds": [0]           // 主角
"roleIds": [3]           // 梁超杰
"roleIds": [3, 101]      // 梁超杰和小纯同时出现
```

---

### 3.4 roleName

**类型**: `string`

**功能**: 角色名称覆盖

**示例**:
```json
"roleName": "老师"
"roleName": "神秘人"
```

**说明**: 用于临时改变角色显示名称，不修改 PersonCfg 中的默认名称

---

### 3.5 bg ⭐重要

**类型**: `int`

**功能**: 背景图ID

| 值 | 含义 |
|----|------|
| `0` | 无变化，保持当前背景 |
| `-1` | 保持当前背景（同0） |
| `-2` | 黑屏 |
| `>0` | 切换到指定背景图ID |

**示例**:
```json
"bg": 113     // 切换到背景113
"bg": -2      // 黑屏
```

---

### 3.6 audio

**类型**: `int`

**功能**: 音频/音效ID

**说明**: 播放指定的音效或背景音乐

---

### 3.7 nextTalk ⭐重要

**类型**: `List<int>`

**功能**: 下一段对话ID列表

**示例**:
```json
"nextTalk": [1002]           // 单线对话
"nextTalk": [1002, 1003]     // 男女分支（索引0=男，索引1=女）
```

**说明**:
- 单线对话: 只有一个下一跳ID
- 男女分支: 两个ID，根据主角性别选择
- 空数组: 对话结束

**代码应用**:
```csharp
public static int GetNextTalk(this TalkCfg _cfg)
{
    if (_cfg.nextTalk.NotEmpty())
    {
        // 根据性别选择
        GenderDefine sex = Singleton<RoleMgr>.Ins.GetRole().Sex;
        int index = (sex == GenderDefine.Female) ? 1 : 0;
        return _cfg.nextTalk[Mathf.Min(index, _cfg.nextTalk.Count - 1)];
    }
    return 0;
}
```

---

### 3.8 nextTalk2

**类型**: `List<int>`

**功能**: 备选下一段对话（条件不满足时）

**说明**: 当 `check` 条件不满足时，使用 `nextTalk2` 而不是 `nextTalk`

---

### 3.9 option ⭐重要

**类型**: `List<int>`

**功能**: 选项ID列表

**示例**:
```json
"option": [501, 502, 503]
```

**说明**: 选项ID对应 OptionCfg.json 中的配置

---

### 3.10 maxoptions

**类型**: `int`

**功能**: 最大显示选项数量

**说明**: 限制同时显示的选项数量，超出部分可能需要滚动或其他方式显示

---

### 3.11 check ⭐重要

**类型**: `List<List<double>>`

**功能**: 条件检查，决定是否走 `nextTalk2`

**格式**: `[[条件类型, 参数1, 参数2, ...], ...]`

**示例**:
```json
"check": [
    [4.0, 1.0, 100.0],      // 智商≥100
    [7.0, 1.0, 3.0, 50.0]   // 与角色3关系≥50
]
```

**代码逻辑**:
```csharp
bool checkResult = CommonEvtMgr.IsMatchCondition(talkCfg.check, true);
if (checkResult)
{
    nextId = talkCfg.GetNextTalk();   // 条件满足
}
else
{
    nextId = talkCfg.GetNextTalk2();  // 条件不满足
}
```

---

### 3.12 effect ⭐重要

**类型**: `List<List<float>>`

**功能**: 条件满足时执行的效果

**格式**: `[[效果类型, 子类型, 属性ID, 数值], ...]`

**示例**:
```json
"effect": [
    [1.0, 1.0, 3.0, 5.0],     // 亲密值+5
    [1.0, 1.0, 1.0, 10.0]     // 智商+10
]
```

---

### 3.13 effect2

**类型**: `List<List<float>>`

**功能**: 条件不满足时执行的效果

**说明**: 当 `check` 条件不满足时，执行 `effect2` 而不是 `effect`

---

### 3.14 showTxt

**类型**: `string`

**功能**: 条件检查时显示的提示文本

**特殊值**:
- `"x"` - 不显示提示
- `"1"` - 显示详细条件
- 其他文本 - 自定义提示

---

### 3.15 replace

**类型**: `List<int>`

**功能**: 替换对话ID列表

**说明**: 用于动态替换对话内容，如根据之前的选择显示不同文本

---

### 3.16 highlights

**类型**: `List<int>`

**功能**: 高亮显示的角色索引

**示例**:
```json
"roleIds": [3, 101],
"highlights": [0]      // 高亮第一个角色（梁超杰）
```

---

### 3.17 roles ⭐重要

**类型**: `List<List<float>>`

**功能**: 角色显示配置

**格式**: `[[x位置, y位置, 缩放, 立绘ID], ...]`

**示例**:

```json
"roles": [
    [312.0, 1002.0, 1.0, 3.0],    // 角色1配置
    [500.0, 1002.0, 1.0, 101.0]   // 角色2配置
]
```

**说明**:
- `x位置`: 水平位置
- `y位置`: 垂直位置
- `缩放`: 立绘缩放比例
- `立绘ID`: 使用的立绘/服装ID

---

### 3.18 screenEffect

**类型**: `List<float>`

**功能**: 屏幕特效参数

**说明**: 用于实现震动、模糊、变色等屏幕效果

---

### 3.19 miniGame

**类型**: `List<double>`

**功能**: 关联的小游戏ID

**示例**:
```json
"miniGame": [2.0, 1.0]
```

**说明**: 对话后进入小游戏

---

### 3.20 time

**类型**: `int`

**功能**: 选项倒计时时间（秒）

| 值 | 含义 |
|----|------|
| `0` | 无倒计时 |
| `>0` | 倒计时秒数 |

**说明**: 用于限时选择场景

---

### 3.21 vocals

**类型**: `List<float>`

**功能**: 配音相关参数

**说明**: 控制配音的播放、音量等

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/TalkCfg.cs`

```csharp
public class TalkCfg
{
    public int id;                           // 对话ID
    public string content;                   // 对话内容
    public List<int> roleIds;                // 角色ID列表
    public string roleName;                  // 角色名称覆盖
    public int bg;                           // 背景ID
    public int audio;                        // 音频ID
    public List<int> nextTalk;               // 下一段对话
    public List<int> nextTalk2;              // 备选下一段
    public List<int> option;                 // 选项ID列表
    public int maxoptions;                   // 最大选项数
    public List<List<double>> check;         // 条件检查
    public List<List<float>> effect;         // 主要效果
    public List<List<float>> effect2;        // 备选效果
    public string showTxt;                   // 提示文本
    public List<int> replace;                // 替换对话ID
    public List<int> highlights;             // 高亮角色
    public List<List<float>> roles;          // 角色显示配置
    public List<float> screenEffect;         // 屏幕特效
    public List<double> miniGame;            // 小游戏ID
    public int time;                         // 倒计时
    public List<float> vocals;               // 配音参数
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, TalkCfg> TalkCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadTalkCfgMap()
{
    CfgMgr.LoadAsync<TalkCfg>("Cfgs/" + LocalizationMgr.Lang + "/TalkCfg", 
        delegate(Dictionary<int, TalkCfg> _t)
    {
        Cfg.TalkCfgMap = _t;
    });
}
```

### 4.3 对话显示

**文件**: `Assembly-CSharp/View/Evt/NewTalkView.cs`

```csharp
public void RefreshTalk(int _talkId, bool _firstOpen)
{
    TalkCfg talkCfg = Cfg.TalkCfgMap[_talkId];
    
    // 1. 显示文本
    this.contentText.text = talkCfg.content;
    
    // 2. 显示角色
    if (talkCfg.roleIds.NotEmpty())
    {
        for (int i = 0; i < talkCfg.roleIds.Count; i++)
        {
            int roleId = talkCfg.roleIds[i];
            ShowRole(roleId, i, talkCfg.roles);
        }
    }
    
    // 3. 切换背景
    if (talkCfg.bg != 0 && talkCfg.bg != -1)
    {
        ChangeBackground(talkCfg.bg);
    }
    
    // 4. 播放音频
    if (talkCfg.audio > 0)
    {
        AudioMgr.PlaySound(talkCfg.audio);
    }
    
    // 5. 执行效果
    if (talkCfg.effect.NotEmpty())
    {
        EffectorCtrl.DoEffect(talkCfg.effect);
    }
    
    // 6. 显示选项或下一段
    if (talkCfg.option.NotEmpty())
    {
        ShowOptions(talkCfg.option);
    }
}
```

### 4.4 进入下一段对话

**文件**: `Assembly-CSharp/CommonEvtMgr.cs`

```csharp
public void NextTalk()
{
    TalkCfg currentCfg = Cfg.TalkCfgMap[this.currentTalkId];
    
    // 检查条件
    bool checkResult = true;
    if (currentCfg.check.NotEmpty())
    {
        checkResult = IsMatchCondition(currentCfg.check, true);
    }
    
    // 获取下一段ID
    int nextId;
    if (checkResult)
    {
        nextId = currentCfg.GetNextTalk();
    }
    else
    {
        nextId = currentCfg.GetNextTalk2();
    }
    
    if (nextId > 0)
    {
        // 继续对话
        ShowTalk(nextId);
    }
    else
    {
        // 对话结束
        TalkFinish(this.currentTalkId);
    }
}
```

### 4.5 扩展方法

**文件**: `Assembly-CSharp/CfgExtension.cs`

```csharp
// 获取下一段对话（支持男女分支）
public static int GetNextTalk(this TalkCfg _cfg)
{
    if (_cfg.nextTalk.NotEmpty())
    {
        GenderDefine sex = Singleton<RoleMgr>.Ins.GetRole().Sex;
        int index = (sex == GenderDefine.Female) ? 1 : 0;
        return _cfg.nextTalk[Mathf.Min(index, _cfg.nextTalk.Count - 1)];
    }
    return 0;
}

// 获取备选下一段
public static int GetNextTalk2(this TalkCfg _cfg)
{
    if (_cfg.nextTalk2.NotEmpty())
    {
        GenderDefine sex = Singleton<RoleMgr>.Ins.GetRole().Sex;
        int index = (sex == GenderDefine.Female) ? 1 : 0;
        return _cfg.nextTalk2[Mathf.Min(index, _cfg.nextTalk2.Count - 1)];
    }
    return 0;
}
```

---

## 五、配置示例

### 示例1: 基础对话

```json
{
    "1001": {
        "id": 1001,
        "content": "你好！我是新来的转学生。",
        "roleIds": [0],
        "bg": 0,
        "nextTalk": [1002],
        "option": [],
        "check": [],
        "effect": [],
        "time": 0
    },
    "1002": {
        "id": 1002,
        "content": "欢迎欢迎！我是班长，有什么需要帮助的可以找我。",
        "roleIds": [3],
        "bg": 0,
        "nextTalk": [],
        "option": [],
        "check": [],
        "effect": [[1.0, 1.0, 3.0, 5.0]],
        "time": 0
    }
}
```

---

### 示例2: 旁白+背景切换

```json
{
    "2001": {
        "id": 2001,
        "content": "思想品德课上，老师讲起了周总理年轻时的格言：为中华之崛起而读书。",
        "roleIds": [-1],
        "bg": 113,
        "audio": 1001,
        "nextTalk": [2002],
        "option": [],
        "check": [],
        "effect": [],
        "roles": [[312.0, 1002.0, 1.0, 3.0]],
        "time": 0
    }
}
```

---

### 示例3: 带选项的对话

```json
{
    "3001": {
        "id": 3001,
        "content": "你愿意帮我一个忙吗？",
        "roleIds": [101],
        "bg": 0,
        "nextTalk": [],
        "option": [501, 502],
        "check": [],
        "effect": [],
        "time": 10
    }
}
```

**说明**: 显示选项501和502，限时10秒选择

---

### 示例4: 条件分支对话

```json
{
    "4001": {
        "id": 4001,
        "content": "你觉得这道题怎么做？",
        "roleIds": [3],
        "bg": 0,
        "nextTalk": [4002],
        "nextTalk2": [4003],
        "option": [],
        "check": [[4.0, 1.0, 100.0]],
        "effect": [[1.0, 1.0, 1.0, 10.0]],
        "effect2": [[1.0, 1.0, 1.0, 5.0]],
        "showTxt": "智商达标",
        "time": 0
    },
    "4002": {
        "id": 4002,
        "content": "你的思路很清晰，完全正确！",
        "roleIds": [3],
        "bg": 0,
        "nextTalk": [],
        "option": [],
        "check": [],
        "effect": [[1.0, 1.0, 3.0, 10.0]],
        "time": 0
    },
    "4003": {
        "id": 4003,
        "content": "这个...还需要再想想。",
        "roleIds": [3],
        "bg": 0,
        "nextTalk": [],
        "option": [],
        "check": [],
        "effect": [[1.0, 1.0, 3.0, 3.0]],
        "time": 0
    }
}
```

**说明**: 
- 智商≥100: 走 nextTalk → 4002，执行 effect（智商+10）
- 智商<100: 走 nextTalk2 → 4003，执行 effect2（智商+5）

---

### 示例5: 男女分支对话

```json
{
    "5001": {
        "id": 5001,
        "content": "你觉得我今天的打扮怎么样？",
        "roleIds": [101],
        "bg": 0,
        "nextTalk": [5002, 5003],
        "option": [],
        "check": [],
        "effect": [],
        "time": 0
    },
    "5002": {
        "id": 5002,
        "content": "（男角色回应）很适合你，很漂亮！",
        "roleIds": [0],
        "bg": 0,
        "nextTalk": [],
        "option": [],
        "check": [],
        "effect": [[1.0, 1.0, 3.0, 8.0]],
        "time": 0
    },
    "5003": {
        "id": 5003,
        "content": "（女角色回应）很好看，我也想试试这种风格！",
        "roleIds": [0],
        "bg": 0,
        "nextTalk": [],
        "option": [],
        "check": [],
        "effect": [[1.0, 1.0, 3.0, 8.0]],
        "time": 0
    }
}
```

**说明**: 
- 男主角: 走 nextTalk[0] → 5002
- 女主角: 走 nextTalk[1] → 5003

---

## 六、对话系统流程

```
触发对话
    ↓
ShowTalk(talkId)
    ↓
RefreshTalk(talkId)
    ↓
显示文本、角色、背景
    ↓
执行 effect
    ↓
有选项？
    ├─ 是 → 显示选项 → 玩家选择 → 执行选项效果
    └─ 否 → 点击继续
    ↓
检查 check 条件
    ↓
    ├─ 满足 → 走 nextTalk
    └─ 不满足 → 走 nextTalk2
    ↓
有下一段？
    ├─ 是 → NextTalk() → 继续对话
    └─ 否 → TalkFinish() → 结束
```

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/TalkCfg.cs` | 对话配置类 |
| `Assembly-CSharp/Config/Cfg.cs` | 配置加载接口 |
| `Assembly-CSharp/View/Evt/NewTalkView.cs` | 对话界面 |
| `Assembly-CSharp/CommonEvtMgr.cs` | 对话管理 |
| `Assembly-CSharp/CfgExtension.cs` | 扩展方法 |
| `TextAsset/TalkCfg.json` | 对话配置文件 |

---

## 八、快速参考

| 用途 | 配置示例 |
|------|----------|
| 基础对话 | `{"id": 1001, "content": "文本", "roleIds": [0]}` |
| 旁白 | `"roleIds": [-1]` |
| 背景切换 | `"bg": 113` |
| 单线对话 | `"nextTalk": [1002]` |
| 男女分支 | `"nextTalk": [1002, 1003]` |
| 条件分支 | `"check": [[4.0, 1.0, 100.0]], "nextTalk": [1002], "nextTalk2": [1003]` |
| 带选项 | `"option": [501, 502]` |
| 限时选择 | `"time": 10` |
| 多角色 | `"roleIds": [3, 101]` |
| 属性效果 | `"effect": [[1.0, 1.0, 3.0, 5.0]]` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
