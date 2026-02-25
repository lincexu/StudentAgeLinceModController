# ActionEvtCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**ActionEvtCfg.json** 是游戏的**行动随机事件配置**文件，定义了执行行动时可能触发的随机事件。

- **文件作用**: 为行动添加随机事件触发机制
- **加载路径**: `Cfgs/{语言}/ActionEvtCfg.json`
- **存储位置**: `Cfg.ActionEvtCfgMap` (Dictionary<int, ActionEvtCfg>)
- **关联文件**: ActionCfg.json（通过 id 关联）

---

## 二、配置类定义

```csharp
// ActionEvtCfg.cs
[CfgClass(25050702UL, 8066)]
public class ActionEvtCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8993, Required = true)]
    public int id;                    // 行动ID

    [CfgProperty(CfgPropertyType.Default, 8008, 8992, Required = true)]
    public List<int> evts;            // 事件ID列表

    [CfgProperty(CfgPropertyType.Default, 8010, 8991, Required = true, DefaultValue = 1f)]
    public float rate;                // 触发概率
}
```

---

## 三、属性详解

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | `int` | 是 | - | **行动ID**，对应 ActionCfg 中的行动 |
| `evts` | `List<int>` | 是 | - | **事件ID列表**，可能触发的事件 |
| `rate` | `float` | 是 | `1.0` | **触发概率**，范围 0~1 |

---

## 四、属性详细说明

### 4.1 id（行动ID）

**功能**: 关联到 ActionCfg.json 中的行动配置

**填写规则**:
- 必须与 ActionCfg.json 中的某个 `id` 一致
- 一个行动ID只能有一个 ActionEvtCfg 配置

**示例**:
```json
"id": 2003   // 对应 ActionCfg 中的 "看电影" 行动
```

---

### 4.2 evts（事件ID列表）

**功能**: 存储可能触发的随机事件ID

**格式**: 整数数组，每个数字是 EvtCfg.json 中的事件ID

**示例**:
```json
// 单事件
"evts": [314051]

// 多事件（随机选择其一）
"evts": [
    314001, 314002, 314003, 314004, 314005,
    314008, 314009, 314010, 314438
]
```

---

### 4.3 rate（触发概率）

**功能**: 执行行动时触发随机事件的概率

**取值范围**: 0.0 ~ 1.0

| 值 | 含义 |
|----|------|
| `0.0` | 永不触发 |
| `0.15` | 15%概率触发 |
| `0.7` | 70%概率触发 |
| `1.0` | 必定触发（100%） |

**示例**:
```json
"rate": 0.15   // 15%概率触发随机事件
```

---

## 五、游戏中的使用逻辑

### 5.1 核心函数：GetActionLoadingEvt

**文件**: ActionData.cs (第673-717行)

```csharp
public ValueTuple<int, string> GetActionLoadingEvt(int _actionId, bool _skipEvt)
{
    ActionEvtCfg actionEvtCfg;
    
    // 1. 查找行动对应的随机事件配置
    if (Cfg.ActionEvtCfgMap.TryGetValue(_actionId, out actionEvtCfg) 
        && actionEvtCfg.evts.NotEmpty<int>() 
        && UnityEngine.Random.value <= actionEvtCfg.rate)  // 概率判定
    {
        List<int> list = new List<int>();
        
        // 2. 遍历事件列表，筛选符合条件的事件
        foreach (int num in actionEvtCfg.evts)
        {
            EvtCfg evtCfg;
            if (Cfg.EvtCfgMap.TryGetValue(num, out evtCfg) 
                && !Singleton<CommonEvtMgr>.Ins.HasEventHappended(num, 1)  // 未触发过
                && CommonEvtMgr.IsMatchCondition(evtCfg.condition, true)   // 满足条件
                && CommonEvtMgr.IsMatchProbability(evtCfg.probability, evtCfg.rate))  // 概率命中
            {
                list.Add(num);
            }
        }
        
        // 3. 从符合条件的事件中随机选择一个
        if (list.Count > 0)
        {
            return new ValueTuple<int, string>(
                list[UnityEngine.Random.Range(0, list.Count)], 
                null
            );
        }
    }
    
    // 4. 无事件触发时返回默认对话
    return new ValueTuple<int, string>(0, "默认对话文本");
}
```

### 5.2 事件筛选流程

```
执行行动
    ↓
查找 ActionEvtCfg（通过行动ID）
    ↓
概率判定（rate vs Random.value）
    ↓
遍历 evts 列表中的每个事件ID
    ↓
检查事件是否已触发过（HasEventHappended）
    ↓
检查是否满足触发条件（IsMatchCondition）
    ↓
检查事件自身概率（IsMatchProbability）
    ↓
将所有符合条件的事件加入候选列表
    ↓
从候选列表中随机选择一个事件触发
```

---

## 六、配置示例

### 示例1：看电影（单事件，低概率）

```json
{
    "2003": {
        "id": 2003,
        "evts": [314051],
        "rate": 0.15
    }
}
```

**说明**:
- 行动ID 2003 = 看电影
- 15%概率触发事件 314051
- 事件 314051 需在 EvtCfg.json 中定义

---

### 示例2：看电视（单事件，低概率）

```json
{
    "2701": {
        "id": 2701,
        "evts": [314046],
        "rate": 0.15
    }
}
```

---

### 示例3：多事件随机（高概率）

```json
{
    "3111": {
        "id": 3111,
        "evts": [
            314001, 314002, 314003, 314004, 314005,
            314008, 314009, 314010, 314438
        ],
        "rate": 0.7
    }
}
```

**说明**:
- 70%概率触发随机事件
- 从9个事件中随机选择一个（需满足条件）

---

### 示例4：必定触发（100%概率）

```json
{
    "3101": {
        "id": 3101,
        "evts": [314910],
        "rate": 1.0
    }
}
```

**说明**:
- 每次执行该行动必定尝试触发事件
- 但仍需满足事件自身的触发条件

---

## 七、使用场景

| 场景 | 文件 | 行号 | 说明 |
|------|------|------|------|
| 普通行动执行 | ActionData.cs | 609 | 执行行动时调用 |
| 看电影 | ActionData.cs | 1158 | 行动ID 2003 |
| 看电视 | ActionData.cs | 1265 | 行动ID 2701 |
| 做作业 | StudyData.cs | 2310 | 学习相关 |

---

## 八、与其他配置的关系

```
ActionCfg.json          EvtCfg.json
    ↓                       ↓
  行动定义               事件定义
    ↓                       ↓
    └──→ ActionEvtCfg.json ←──┘
              ↓
         行动-事件关联
              ↓
         游戏运行时触发
```

**关联说明**:
1. **ActionCfg** 定义行动的基本信息（名称、消耗、效果等）
2. **ActionEvtCfg** 定义行动可能触发的随机事件
3. **EvtCfg** 定义事件的具体内容（对话、选项、结果等）

---

## 九、注意事项

1. **id 必须唯一**: 一个行动ID只能对应一个 ActionEvtCfg
2. **事件ID必须存在**: evts 中的事件ID必须在 EvtCfg.json 中有定义
3. **概率叠加**: 
   - `rate` 是触发随机事件的总开关
   - 事件自身的 `probability` 是二次筛选
4. **条件判断**: 事件触发还需满足 EvtCfg 中定义的 `condition` 条件
5. **已触发检查**: 默认不会重复触发已发生过的事件

---

## 十、完整配置流程

### Step 1: 在 ActionCfg.json 中定义行动

```json
{
    "id": 5001,
    "name": "我的自定义行动",
    "cnt": 0,
    "map": 1,
    "type": 0,
    "icon": "action/img_custom"
}
```

### Step 2: 在 EvtCfg.json 中定义事件

```json
{
    "900001": {
        "id": 900001,
        "name": "随机遇到同学",
        "desc": "你在路上遇到了同学...",
        "condition": [],
        "probability": 1.0,
        "rate": 1.0
    }
}
```

### Step 3: 在 ActionEvtCfg.json 中关联

```json
{
    "5001": {
        "id": 5001,
        "evts": [900001],
        "rate": 0.3
    }
}
```

**效果**: 执行"我的自定义行动"时，30%概率触发"随机遇到同学"事件。

---

## 十一、参考代码

### 加载代码（Cfg.cs）

```csharp
public static Dictionary<int, ActionEvtCfg> ActionEvtCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadActionEvtCfgMap()
{
    CfgMgr.LoadAsync<ActionEvtCfg>(
        "Cfgs/" + LocalizationMgr.Lang + "/ActionEvtCfg", 
        delegate(Dictionary<int, ActionEvtCfg> _t)
        {
            Cfg.ActionEvtCfgMap = _t;
        }
    );
}
```

### 调用代码（ActionData.cs）

```csharp
// 执行行动时获取随机事件
var evtResult = GetActionLoadingEvt(actionId, false);
if (evtResult.Item1 > 0)
{
    // 触发事件
    Singleton<CommonEvtMgr>.Ins.ShowEvent(evtResult.Item1, 1f, null, 0, true, null);
}
```

---

## 十二、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/ActionEvtCfg.cs` | ActionEvtCfg 类定义 |
| `Assembly-CSharp/Config/EvtCfg.cs` | EvtCfg 事件配置类 |
| `Assembly-CSharp/ActionData.cs` | 行动系统核心逻辑 |
| `TextAsset/ActionEvtCfg.json` | 配置文件 |
| `TextAsset/EvtCfg.json` | 事件定义文件 |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
