# OptionCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**OptionCfg.json** 是游戏的选项配置文件，用于配置对话、事件中的玩家选项。

- **加载路径**: `Cfgs/{语言}/OptionCfg`
- **存储位置**: `Cfg.OptionCfgMap` (Dictionary<int, OptionCfg>)
- **用途**: 配置对话选项、事件选项的显示文本、条件、效果等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 选项唯一ID | `1`, `501`, `1001` |
| `content` | string | 选项显示文本 | `"确定"`, `"打篮球"` |
| `precondition` | List<List<double>> | 前置条件（控制显示） | `[[1.0, 50.0]]` |
| `pressure` | List<List<float>> | 性格匹配配置 | `[[1.0, 50.0]]` |
| `effect` | List<List<float>> | 主要效果 | `[[1.0, 1.0, 3.0, 5.0]]` |
| `effect2` | List<List<float>> | 次要效果 | `[[1.0, 1.0, 7.0, -10.0]]` |
| `talkId` | List<int> | 主要对话ID列表 | `[1001, 1002]` |
| `talkId2` | List<int> | 次要对话ID列表 | `[2001]` |
| `check` | List<List<double>> | 检查条件（控制分支） | `[[14.0, 1.0, 201.0]]` |
| `showTxt` | string | 检查结果提示文本 | `"x"`, `"1"`, `"条件满足"` |
| `miniGame` | List<double> | 小游戏配置 | `[2.0, 1.0]` |
| `nextEvtId` | int | 下一个事件ID | `1001`, `0` |
| `stateCond` | List<List<double>> | 状态条件（预留） | `[]` |
| `tag` | string | 选项标签（记录标记） | `"choice_1"` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 选项的唯一标识符

**说明**: 用于在对话、事件中引用该选项

---

### 3.2 content ⭐重要

**类型**: `string`

**功能**: 选项显示的文本内容

**示例**:
```json
"content": "确定"
"content": "打篮球"
"content": "去图书馆"
```

**说明**: 这是玩家在游戏中看到的选项按钮文字

---

### 3.3 precondition ⭐重要

**类型**: `List<List<double>>`

**功能**: 选项显示的前置条件

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"precondition": [
    [1.0, 50.0],          // 属性1≥50
    [14.0, 1.0, 201.0]    // 与角色201是恋人
]
```

**说明**: 只有满足所有条件，该选项才会显示给玩家

**代码逻辑**:
```csharp
// 检查前置条件，不满足则不显示选项
if (CheckPrecondition(optionCfg.precondition))
{
    CreateOptionButton(optionCfg.content);
}
```

---

### 3.4 pressure ⭐重要

**类型**: `List<List<float>>`

**功能**: 性格匹配配置，影响选项UI显示和精力消耗

**格式**: `[[性格属性ID, 数值], ...]`

**示例**:
```json
"pressure": [
    [1.0, 50.0]    // 性格属性1的值≥50
]
```

**作用机制**:

1. **UI显示颜色**（CommonOptionItem.cs）:
```csharp
// 检查角色主要性格是否匹配
bool isMatch = true;
foreach (List<float> list in optionCfg.pressure)
{
    if (!role.IsMainPersonality((int)list[0]))
    {
        isMatch = false;
        break;
    }
}

if (isMatch)
{
    // 匹配 - 显示正面颜色（绿色）
    txt_pesonality.color = 正面颜色;
}
else
{
    // 不匹配 - 显示负面颜色（红色）
    txt_pesonality.color = 负面颜色;
}
```

2. **精力消耗**（CommonEvtMgr.cs）:
```csharp
// 不符合性格时消耗额外精力
if (!isMatch)
{
    role.UpdateAttr(0, -Cfg.PersonConstCfgMap[1].value, 1f, null, 2);
}
```

**实际效果**:
- 符合性格：选项显示绿色，正常消耗精力
- 不符合性格：选项显示红色，额外消耗精力

---

### 3.5 effect ⭐重要

**类型**: `List<List<float>>`

**功能**: 选择该选项后的主要效果

**格式**: `[[效果类型, 子类型, 属性ID, 数值], ...]`

**示例**:
```json
"effect": [
    [1.0, 1.0, 3.0, 5.0],     // 亲密值+5
    [1.0, 1.0, 1.0, 10.0],    // 智力+10
    [1.0, 1.0, 7.0, -20.0]    // 金钱-20
]
```

---

### 3.6 effect2 ⭐重要

**类型**: `List<List<float>>`

**功能**: 选择该选项后的次要效果

**触发机制**: 当 `check` 条件不满足时，触发 `effect2` 而不是 `effect`

**代码逻辑**:
```csharp
bool checkResult = IsMatchCondition(optionCfg.check);
if (checkResult)
{
    // 执行主要效果
    EffectorCtrl.DoEffect(optionCfg.effect);
}
else
{
    // 执行次要效果
    EffectorCtrl.DoEffect(optionCfg.effect2);
}
```

---

### 3.7 talkId ⭐重要

**类型**: `List<int>`

**功能**: 选择选项后触发的主要对话ID列表

**示例**:
```json
"talkId": [1001, 1002, 1003]
```

**触发机制**: 按顺序播放这些对话

---

### 3.8 talkId2 ⭐重要

**类型**: `List<int>`

**功能**: 选择选项后触发的次要对话ID列表

**触发机制**: 当 `check` 条件不满足时，触发 `talkId2` 而不是 `talkId`

**代码逻辑**:
```csharp
if (checkResult && optionCfg.talkId.NotEmpty())
{
    // 播放主要对话
    foreach (int talkId in optionCfg.talkId)
        PlayTalk(talkId);
}
else if (!checkResult && optionCfg.talkId2.NotEmpty())
{
    // 播放次要对话
    foreach (int talkId in optionCfg.talkId2)
        PlayTalk(talkId);
}
```

---

### 3.9 check ⭐⭐⭐核心机制

**类型**: `List<List<double>>`

**功能**: 检查条件，决定选项的分支走向

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"check": [
    [14.0, 1.0, 201.0],   // 与角色201是恋人关系
    [1.0, 100.0]           // 属性1≥100
]
```

**核心作用机制**:

`check` 条件决定了选项的**分支逻辑**:

| check结果 | 触发效果 | 触发对话 |
|-----------|----------|----------|
| 满足 | `effect` | `talkId` |
| 不满足 | `effect2` | `talkId2` |

**代码实现**（CommonEvtMgr.cs）:
```csharp
public void SelectOption(OptionData _option)
{
    // 1. 检查check条件
    bool checkResult = IsMatchConditionThenToast(
        _option.cfg.check, 
        true, 
        _option.cfg.showTxt
    );
    
    // 2. 根据check结果执行不同效果
    if (checkResult)
    {
        // 执行主要效果
        if (_option.effector != null)
            _option.effector.Run(_option.rate, true);
    }
    else
    {
        // 执行次要效果
        if (_option.effector2 != null)
            _option.effector2.Run(_option.rate, true);
    }
    
    // 3. 根据check结果播放不同对话
    if (checkResult && _option.nextTalkId > 0)
    {
        ShowTalk(_option.nextTalkId, null, 0, true, false, null);
        return;
    }
    if (!checkResult && _option.nextTalkId2 > 0)
    {
        ShowTalk(_option.nextTalkId2, null, 0, true, false, null);
        return;
    }
}
```

**使用场景**:
- 根据玩家属性决定事件走向
- 根据关系状态触发不同对话
- 实现选项的成功/失败分支

---

### 3.10 showTxt ⭐重要

**类型**: `string`

**功能**: 显示 `check` 条件检查结果的提示文本

**特殊值**:

| 值 | 含义 |
|----|------|
| `null` 或 `""` | 显示默认条件提示 |
| `"x"` | 不显示任何提示 |
| `"1"` | 显示所有条件详细信息 |
| 其他文本 | 显示自定义文本，成功带√，失败带× |

**示例**:
```json
"showTxt": "x"                    // 不显示提示
"showTxt": "1"                    // 显示详细条件
"showTxt": "条件满足"              // 显示自定义文本
```

**代码实现**（CommonEvtMgr.cs）:
```csharp
public static bool IsMatchConditionThenToast(
    List<List<double>> _conditions, 
    bool _emptyIsTrue = false, 
    string _txt = null)
{
    bool result = CheckConditions(_conditions);
    
    if (_txt.IsEmpty())
    {
        // 显示默认条件提示
        conditioner.Toast(ToastType.CfgParm);
    }
    else if (_txt == "1")
    {
        // 显示所有条件信息
        conditioner.Toast(ToastType.All);
    }
    else if (_txt == "x")
    {
        // 不显示任何提示
    }
    else
    {
        // 显示自定义文本
        if (result)
            ToastHelper.Toast("√ " + _txt, null, ToastUIType.Normal);
        else
            ToastHelper.Toast("× " + _txt, null, ToastUIType.Normal);
    }
    
    return result;
}
```

---

### 3.11 miniGame ⭐重要

**类型**: `List<double>`

**功能**: 关联的小游戏配置

**格式**: `[小游戏类型, 参数]`

**示例**:
```json
"miniGame": [2.0, 1.0]    // 类型2的小游戏，参数1
```

**说明**: 选择选项后进入小游戏

---

### 3.12 nextEvtId ⭐重要

**类型**: `int`

**功能**: 选择选项后跳转到的下一个事件ID

| 值 | 含义 |
|----|------|
| `0` | 不跳转，结束当前事件 |
| `>0` | 跳转到对应ID的事件 |

**示例**:
```json
"nextEvtId": 1001    // 跳转到事件1001
"nextEvtId": 0       // 结束事件
```

---

### 3.13 stateCond

**类型**: `List<List<double>>`

**功能**: 状态条件

**现状**: 
- **预留字段**，当前代码中未找到实际使用
- 所有配置中的 `stateCond` 都是空数组 `[]`
- 可能用于未来扩展角色状态判断

---

### 3.14 tag ⭐⭐⭐核心机制

**类型**: `string`

**功能**: 选项标签，用于**记录玩家选择历史**和**对话文本替换**

**作用机制**:

#### 1. 记录玩家选择（CommonEvtMgr.cs）
```csharp
public void SelectOption(OptionData _option)
{
    // ... 选项处理逻辑
    
    // 如果选项有tag，记录到系统中
    if (_option.cfg.tag.NotEmpty())
    {
        AddRecordTag(_option.cfg.tag, _option.cfg.content);
    }
}
```

#### 2. 存储到记录系统
```csharp
public void AddRecordTag(string _tag, string _value)
{
    if (_tag.IsEmpty())
        return;
    
    if (this.model.recordTags == null)
        this.model.recordTags = new Dictionary<string, string>();
    
    // 存储标签和选项内容
    this.model.recordTags[_tag] = _value;
}
```

#### 3. 对话文本替换（RecordMgr.cs）
```csharp
// 在对话中可以使用 {tagName} 占位符
// 系统会自动替换为玩家之前选择的选项内容

// 示例对话文本:
// "你之前选择了{choice_1}，这影响了后续剧情..."

// 替换逻辑:
string GetRecordTag(string _tag)
{
    if (this.model.recordTags.TryGetValue(_tag, out string value))
        return value;
    return "";
}
```

**实际应用示例**:

**配置**:
```json
{
    "id": 15201,
    "tag": "career_choice",
    "content": "我想成为科学家"
}
```

**后续对话中使用**:
```json
{
    "id": 20001,
    "content": "听说你之前说过'{career_choice}'，现在还在坚持吗？"
}
```

**效果**: 玩家看到的内容会根据之前的选择动态变化

**常见用途**:
- 记录玩家的重要选择
- 在后续剧情中引用之前的选择
- 实现多周目或不同路线的差异化对话

---

## 四、核心机制流程图

```
玩家选择选项
    ↓
检查 precondition（是否显示）
    ↓
检查 pressure（性格匹配显示颜色）
    ↓
玩家点击选项
    ↓
检查 check 条件
    ↓
    ├─ 满足 ─┬─ 执行 effect
    │         ├─ 播放 talkId
    │         └─ 显示 showTxt（√）
    │
    └─ 不满足 ┬─ 执行 effect2
              ├─ 播放 talkId2
              └─ 显示 showTxt（×）
    ↓
记录 tag（如果有）
    ↓
检查 miniGame（进入小游戏）
    ↓
检查 nextEvtId（跳转事件或结束）
```

---

## 五、代码实现

### 5.1 类定义

**文件**: `Assembly-CSharp/Config/OptionCfg.cs`

```csharp
public class OptionCfg
{
    public List<List<double>> check;        // 检查条件
    public string content;                   // 选项显示文本
    public List<List<float>> effect;         // 主要效果
    public List<List<float>> effect2;        // 次要效果
    public int id;                           // 选项ID
    public List<double> miniGame;            // 关联小游戏
    public int nextEvtId;                    // 下一个事件ID
    public List<List<double>> precondition;  // 前置条件
    public List<List<float>> pressure;       // 性格匹配
    public string showTxt;                   // 提示文本
    public List<List<double>> stateCond;     // 状态条件（预留）
    public string tag;                       // 选项标签
    public List<int> talkId;                 // 主要对话ID
    public List<int> talkId2;                // 次要对话ID
}
```

### 5.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, OptionCfg> OptionCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadOptionCfgMap()
{
    CfgMgr.LoadAsync<OptionCfg>("Cfgs/" + LocalizationMgr.Lang + "/OptionCfg", 
        delegate(Dictionary<int, OptionCfg> _t)
    {
        Cfg.OptionCfgMap = _t;
    });
}
```

### 5.3 核心选择逻辑

**文件**: `Assembly-CSharp/CommonEvtMgr.cs`

```csharp
public void SelectOption(OptionData _option)
{
    // 1. 记录tag
    if (_option.cfg.tag.NotEmpty())
    {
        AddRecordTag(_option.cfg.tag, _option.cfg.content);
    }
    
    // 2. 检查check条件
    bool checkResult = IsMatchConditionThenToast(
        _option.cfg.check, 
        true, 
        _option.cfg.showTxt
    );
    
    // 3. 执行效果
    if (checkResult)
    {
        if (_option.effector != null)
            _option.effector.Run(_option.rate, true);
    }
    else
    {
        if (_option.effector2 != null)
            _option.effector2.Run(_option.rate, true);
    }
    
    // 4. 播放对话
    if (checkResult && _option.nextTalkId > 0)
    {
        ShowTalk(_option.nextTalkId, null, 0, true, false, null);
        return;
    }
    if (!checkResult && _option.nextTalkId2 > 0)
    {
        ShowTalk(_option.nextTalkId2, null, 0, true, false, null);
        return;
    }
    
    // 5. 检查小游戏
    if (_option.cfg.miniGame.NotEmpty())
    {
        int miniGameType = (int)_option.cfg.miniGame[0];
        OpenMiniGame(miniGameType);
        return;
    }
    
    // 6. 跳转事件
    if (_option.cfg.nextEvtId > 0)
    {
        StartEvt(_option.cfg.nextEvtId);
    }
    else
    {
        CloseEvtView();
    }
}
```

---

## 六、配置示例

### 示例1: 简单选项

```json
{
    "1": {
        "id": 1,
        "content": "确定",
        "precondition": [],
        "pressure": [],
        "effect": [],
        "talkId": [],
        "effect2": [],
        "talkId2": [],
        "check": [],
        "showTxt": null,
        "miniGame": [],
        "nextEvtId": 0,
        "stateCond": [],
        "tag": null
    }
}
```

---

### 示例2: 带分支的选项

```json
{
    "501": {
        "id": 501,
        "content": "向TA表白",
        "precondition": [
            [14.0, 1.0, 201.0]    // 需要是恋人关系才能显示
        ],
        "pressure": [],
        "check": [
            [3.0, 80.0]           // 检查亲密值≥80
        ],
        "showTxt": "表白成功",
        "effect": [
            [1.0, 1.0, 3.0, 10.0]     // 成功：亲密值+10
        ],
        "effect2": [
            [1.0, 1.0, 3.0, -5.0]     // 失败：亲密值-5
        ],
        "talkId": [1001],         // 成功对话
        "talkId2": [1002],        // 失败对话
        "tag": "confession_result",
        "miniGame": [],
        "nextEvtId": 0,
        "stateCond": []
    }
}
```

**机制说明**:
- `precondition`: 只有恋人关系才显示此选项
- `check`: 检查亲密值是否≥80
- 满足条件：执行 `effect` + 播放 `talkId` + 显示"√ 表白成功"
- 不满足条件：执行 `effect2` + 播放 `talkId2` + 显示"× 表白成功"
- `tag`: 记录结果供后续对话引用

---

### 示例3: 带性格匹配的选项

```json
{
    "1001": {
        "id": 1001,
        "content": "独自思考",
        "precondition": [],
        "pressure": [
            [1.0, 50.0]           // 性格属性1（内向）≥50
        ],
        "effect": [
            [1.0, 1.0, 1.0, 5.0]      // 智力+5
        ],
        "talkId": [2001],
        "check": [],
        "showTxt": null,
        "miniGame": [],
        "nextEvtId": 0,
        "tag": null
    }
}
```

**机制说明**:
- 如果角色主要性格是"内向"（属性1≥50）：选项显示绿色，正常消耗精力
- 如果角色主要性格不是"内向"：选项显示红色，额外消耗精力

---

### 示例4: 带标签记录的选项

```json
{
    "2001": {
        "id": 2001,
        "content": "我想成为科学家",
        "precondition": [],
        "effect": [],
        "talkId": [3001],
        "tag": "career_choice"
    }
}
```

**后续对话中使用**:
```json
{
    "id": 3001,
    "content": "你选择了'{career_choice}'，这是一个很好的目标！"
}
```

**效果**: 玩家看到："你选择了'我想成为科学家'，这是一个很好的目标！"

---

### 示例5: 带小游戏的选项

```json
{
    "3001": {
        "id": 3001,
        "content": "开始挑战",
        "precondition": [],
        "effect": [],
        "miniGame": [2.0, 1.0],
        "nextEvtId": 0
    }
}
```

---

## 七、属性对比表

| 属性 | 触发时机 | 作用 |
|------|----------|------|
| `precondition` | 显示选项前 | 控制选项是否显示 |
| `pressure` | 显示选项时 | 影响UI颜色和精力消耗 |
| `check` | 选择选项后 | 控制effect/talkId的分支 |
| `showTxt` | check检查时 | 显示条件检查结果 |
| `effect` | check满足时 | 执行主要属性变化 |
| `effect2` | check不满足时 | 执行次要属性变化 |
| `talkId` | check满足时 | 播放主要对话 |
| `talkId2` | check不满足时 | 播放次要对话 |
| `tag` | 选择选项后 | 记录选择供后续使用 |
| `miniGame` | 选择选项后 | 进入小游戏 |
| `nextEvtId` | 选择选项后 | 跳转事件 |

---

## 八、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/OptionCfg.cs` | 配置类定义 |
| `Assembly-CSharp/CommonEvtMgr.cs` | 选项核心逻辑 |
| `Assembly-CSharp/View/Common/CommonOptionItem.cs` | 选项UI显示 |
| `Assembly-CSharp/RecordMgr.cs` | 标签记录系统 |
| `TextAsset/OptionCfg.json` | 配置文件 |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
