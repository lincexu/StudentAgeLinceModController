# EvtCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**EvtCfg.json** 是游戏的事件配置文件，定义了所有游戏事件的触发条件、效果和显示方式。

- **加载路径**: `Cfgs/{语言}/EvtCfg.json`
- **存储位置**: `Cfg.EvtCfgMap` (Dictionary<int, EvtCfg>)
- **核心管理类**: `CommonEvtMgr` - 事件系统的核心管理器

---

## 二、核心属性

### 2.1 基础标识

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | **事件唯一ID** | `2201` |
| `title` | string | **事件标题** | `"女尸"`, `"星河影院倒闭"` |
| `type` | int | **事件类型** | `0`=普通事件, `1`=通知, `2`=场景事件, `50`=静默效果, `51`=立即执行效果 |

### 2.2 触发控制

| Key | 类型 | 含义 | 格式/示例 |
|-----|------|------|-----------|
| `condition` | List<List<double>> | **触发条件** | `[[条件类型, 参数...], ...]` |
| `rate` | float | **基础概率** | `1.0`=100%, `0.5`=50% |
| `probability` | List<float> | **概率权重** | 用于复杂概率计算 |
| `maxcount` | int | **最大触发次数** | `1`=只触发1次, `-1`=无限次 |
| `weight` | int | **事件权重** | 用于排序，默认`10`，`-1`=强制优先 |

### 2.3 关联内容

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `talkId` | List<int> | **关联对话ID列表** | `[2201001, 2201002]` |
| `npc` | int | **关联NPC ID** | `3`=特定NPC, `0`=无 |
| `mapId` | int | **关联地图ID** | `2`=学校, `0`=通用 |
| `miniGame` | List<double> | **关联小游戏** | 事件后跳转的小游戏 |

### 2.4 效果与选项

| Key | 类型 | 含义 | 格式/示例 |
|-----|------|------|-----------|
| `effect` | List<List<float>> | **事件效果** | `[[效果类型, 子类型, 参数...], ...]` |
| `options` | List<int> | **选项列表** | 事件的可选选项ID |
| `maxoptions` | int | **最大选项数** | 限制显示选项数量 |

### 2.5 显示控制

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `content` | string | **事件内容文本** | 显示在通知中的详细描述 |
| `desc` | string | **事件描述** | 额外描述信息 |
| `displayType` | int | **显示类型** | `0`=默认, `1`=状态事件显示 |
| `replace` | List<int> | **文本替换ID列表** | 动态替换`{0}`、`{1}`等标记，见下文详解 |

---

## 三、核心属性详解

### 3.1 probability - 决定事件**会不会发生**

**类型**: `List<float>`

**作用**: 控制事件触发的概率，与 `rate` 字段配合使用

**优先级**:
```
rate > 0 时：优先使用 rate 字段
rate = 0 时：使用 probability 列表
```

**代码实现**:
```csharp
public static bool IsMatchProbability(List<float> _conditions, float _rate)
{
    // rate > 0 时优先使用 rate
    if (_rate > 0f)
        return UnityEngine.Random.Range(0f, 1f) <= _rate;
    
    // 否则使用 probability 列表
    if (_conditions == null || _conditions.Count == 0)
        return false;
    
    if (_conditions.Count == 1)
    {
        // [1.0] = 必定触发
        // [0.5] = 50%概率触发
        return _conditions[0] == 1f || UnityEngine.Random.Range(0f, 1f) <= _conditions[0];
    }
    
    return _conditions.Count == 2 && _conditions[0] == 1f 
        && UnityEngine.Random.Range(0f, 1f) <= _conditions[1];
}
```

**常见值**:

| probability值 | 含义 |
|---------------|------|
| `[]` 或 null | 不触发 |
| `[1.0]` | **必定触发**（100%） |
| `[0.5]` | 50%概率触发 |
| `[0.0]` | 不触发 |
| `[1.0, 0.3]` | 特殊条件：第一个为1且随机数≤0.3时触发 |

---

### 3.2 replace - 决定事件文本**显示什么内容**

**类型**: `List<int>`

**作用**: 定义事件文本中的动态替换内容，将 `{0}`、`{1}` 等标记替换为实际值

**工作流程**:
```
1. 事件配置中定义 replace: [101, 102, 103]
                        ↓
2. 事件文本中使用标记: "你考了{0}分，排名{1}，{2}表扬了你"
                        ↓
3. 系统根据 replace ID 获取实际值
   - 101 → 获取当前考试分数
   - 102 → 获取当前排名
   - 103 → 获取老师名字
                        ↓
4. 最终显示: "你考了95分，排名第3，王老师表扬了你"
```

**代码实现**:
```csharp
// 文本替换处理
public static string Replace(string _content)
{
    // 匹配 {数字} 或 {变量名} 模式
    string pattern = "(\\{|｛)(.*?)(\\}|｝)";
    MatchCollection matches = Regex.Matches(_content, pattern);
    
    string result = _content;
    foreach (Match match in matches)
    {
        string key = match.Value.Substring(1, match.Value.Length - 2);
        string newValue = GetReplaceValue(int.Parse(key));
        result = result.Replace(match.Value, newValue);
    }
    return result;
}
```

**常见替换ID**:

| replace ID | 含义 | 示例 |
|------------|------|------|
| `101` | 角色名 | `{0}` → "小明" |
| `102` | 属性值 | `{0}` → "95" |
| `103` | NPC名 | `{0}` → "王老师" |
| `104` | 恋人名 | `{0}` → "小红" |
| `201` | 考试分数 | `{0}` → "88" |
| `202` | 排名 | `{0}` → "第5名" |

**配置示例**:
```json
{
    "id": 10001,
    "title": "考试成绩",
    "content": "你考了{0}分，{1}，{2}在全班表扬了你！",
    "replace": [201, 202, 103],    // 分别替换为：分数、评价、老师名
    "type": 1,
    "rate": 1.0
}
```

---

## 四、事件类型 (type) 详解

| type值 | 含义 | 处理方式 |
|--------|------|----------|
| `0` | **普通事件** | 显示对话，可能带选项 |
| `1` | **通知事件** | 右上角弹出通知 |
| `2` | **场景事件** | 地图场景触发的事件 |
| `10` | **状态事件** | 显示在状态栏的持续事件 |
| `50` | **静默效果** | 不显示，直接执行效果 |
| `51` | **立即执行** | 立即执行效果，无显示 |
| `60` | **状态显示** | 仅显示状态图标 |
| `70-71` | **电话事件** | 电话对话事件 |
| `80` | **社交事件** | 社交相关事件 |
| `90` | **派对事件** | 派对相关事件 |

---

## 四、condition 条件格式

### 4.1 常见条件类型

| 条件类型 | 格式 | 含义 |
|----------|------|------|
| `1.0` | `[1.0, attrID, op, value]` | 属性条件，如 `[1.0, 12.0, 101.0, 1.0, 6.0]` = 属性12≥1且回合=6 |
| `2.0` | `[2.0, op, year, month]` | 时间条件，如 `[2.0, 11.0, 2001.0, 3.0]` = 2001年3月 |
| `3.0` | `[3.0, op, evtID]` | 事件条件，检查某事件是否触发 |
| `7.0` | `[7.0, op, npcID, value]` | NPC属性条件 |
| `10.0` | `[10.0, op, round]` | 回合数条件 |
| `15.0` | `[15.0, op, funcID]` | 功能解锁条件 |
| `101.0` | `[101.0, op, value]` | 特殊条件检查 |

### 4.2 操作符 (op)

| op值 | 含义 |
|------|------|
| `1.0` | 等于 |
| `2.0` | 不等于 |
| `3.0` | 大于 |
| `4.0` | 小于 |
| `8.0` | 大于等于 |
| `11.0` | 小于等于 |
| `-1.0` | 小于 |
| `-3.0` | 不等于（反向） |

---

## 五、effect 效果格式

### 5.1 常见效果类型

| 效果类型 | 格式 | 含义 |
|----------|------|------|
| `1.0` | `[1.0, target, attrID, value]` | 改变属性 |
| `23.0` | `[23.0, op, itemID]` | 添加/移除物品 |
| `40.0` | `[40.0, op, evtID, param]` | 触发/关闭事件 |
| `100.0` | `[100.0, value, attrID]` | 设置属性值 |
| `101.0` | `[101.0, op, mapID]` | 开启/关闭地图 |

### 5.2 效果目标 (target)

| target值 | 含义 |
|----------|------|
| `1.0` | 主角 |
| `2.0` | 当前交互NPC |
| `99.0` | 全局 |

---

## 六、完整示例解析

### 示例1: 静默效果事件 (type=50)

```json
{
    "id": 1124,
    "title": "星河影院倒闭",
    "content": "受达万影城影响，星河影院流水大降，入不敷出，已宣布停止营业",
    "condition": [
        [2.0, 11.0, 2008.0, 6.0]    // 2008年6月触发
    ],
    "rate": 1.0,                     // 100%触发
    "effect": [
        [101.0, -4.0, 8.0],          // 关闭地图8（星河影院）
        [100.0, 10.0, 42.0]          // 设置属性42=10
    ],
    "type": 50,                      // 静默执行
    "maxcount": 1                    // 只触发1次
}
```

**效果**: 2008年6月自动触发，关闭星河影院地图，无界面显示。

---

### 示例2: 场景事件 (type=2)

```json
{
    "id": 2201,
    "title": "女尸",
    "npc": 3,                        // 关联NPC 3
    "weight": 0,                     // 权重0（普通）
    "condition": [
        [2.0, 8.0, -1.0]             // 时间条件（任意时间）
    ],
    "probability": [1.0],            // 概率权重
    "maxcount": 1,
    "talkId": [2201001],             // 对话ID
    "type": 2,                       // 场景事件
    "desc": null,
    "mapId": 2,                      // 学校地图
    "content": null,
    "options": [],                   // 无选项
    "maxoptions": 0,
    "effect": [],
    "miniGame": [],
    "rate": 0
}
```

**效果**: 在学校地图随机触发，显示对话2201001。

---

### 示例3: 普通事件 (type=0)

```json
{
    "id": 215003,
    "title": "没交作业",
    "npc": 0,
    "weight": -1,                    // 权重-1（强制优先）
    "condition": [
        [10.0, -33.0, 6.0],          // 回合条件
        [1.0, 12.0, 101.0, 1.0, 6.0] // 属性条件
    ],
    "probability": [1.0],
    "maxcount": 1,
    "talkId": [315003001],           // 对话ID
    "type": 0,                       // 普通事件
    "desc": null,
    "mapId": 0,
    "content": null,
    "options": [],
    "maxoptions": 0,
    "effect": [],
    "replace": [],
    "miniGame": [],
    "displayType": 0,
    "rate": 0
}
```

**效果**: 满足条件时触发对话事件。

---

### 示例4: 立即执行效果 (type=51)

```json
{
    "id": 3,
    "condition": [
        [2.0, 11.0, 2001.0, 9.0]     // 2001年9月
    ],
    "rate": 1.0,
    "effect": [
        [1.0, 1.0, 8.0, 20.0],       // 主角属性8+20
        [23.0, 99.0, 311.0],         // 全局添加物品311
        [23.0, 99.0, 312.0],         // 全局添加物品312
        [1.0, 1.0, 0.0, 20.0]        // 主角属性0+20
    ],
    "type": 51,                      // 立即执行
    "maxcount": 1
}
```

**效果**: 2001年9月自动执行效果，无界面显示。

---

## 七、核心代码实现

### 7.1 事件触发检查 (CommonEvtMgr.cs)

```csharp
// 检查事件是否可以触发
public bool CanTriggerEvt(int evtId)
{
    EvtCfg evtCfg = Cfg.EvtCfgMap[evtId];
    
    // 检查触发次数
    if (evtCfg.maxcount > 0 && 已触发次数 >= evtCfg.maxcount)
        return false;
    
    // 检查触发条件
    foreach (var condition in evtCfg.condition)
    {
        if (!IsMatchCondition(condition))
            return false;
    }
    
    // 检查概率
    if (UnityEngine.Random.value > evtCfg.rate)
        return false;
    
    return true;
}
```

### 7.2 事件显示 (CommonEvtMgr.cs)

```csharp
// 根据类型显示事件
public void ShowEvt(int evtId)
{
    EvtCfg evtCfg = Cfg.EvtCfgMap[evtId];
    
    switch (evtCfg.type)
    {
        case 0:  // 普通事件
            ShowTalk(evtCfg.talkId);
            break;
        case 1:  // 通知
            ShowNotification(evtCfg.title, evtCfg.content);
            break;
        case 50: // 静默效果
        case 51: // 立即执行
            ExecuteEffect(evtCfg.effect);
            break;
    }
}
```

### 7.3 条件判断 (CommonEvtMgr.cs)

```csharp
// 解析并判断条件
public bool IsMatchCondition(List<double> condition)
{
    int type = (int)condition[0];
    switch (type)
    {
        case 2:  // 时间条件
            int year = (int)condition[2];
            int month = (int)condition[3];
            return CheckTime(year, month);
        case 1:  // 属性条件
            int attrId = (int)condition[1];
            float value = (float)condition[2];
            return CheckAttr(attrId, value);
        // ... 其他条件类型
    }
    return false;
}
```

---

## 八、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/EvtCfg.cs` | EvtCfg 类定义 |
| `Assembly-CSharp/CommonEvtMgr.cs` | 事件系统核心管理 |
| `Assembly-CSharp/View/Evt/NewTalkView.cs` | 对话显示界面 |
| `Assembly-CSharp/View/Evt/StateEvtView.cs` | 状态事件显示 |
| `TextAsset/EvtCfg.json` | 事件配置文件 |
| `TextAsset/TalkCfg.json` | 对话配置文件 |

---

## 九、注意事项

1. **type=50/51** 的事件无界面显示，直接执行效果
2. **weight=-1** 的事件强制优先触发
3. **maxcount=1** 的事件只触发一次，适合剧情事件
4. **condition** 数组中所有条件必须同时满足（AND关系）
5. **talkId** 对应的对话需在 TalkCfg.json 中定义

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
