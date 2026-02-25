# IntentCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**IntentCfg.json** 是游戏的意图/目标配置文件，定义了玩家在游戏中可选择的各种意图（如学习、社交、恋爱等目标）。

- **加载路径**: `Cfgs/{语言}/IntentCfg.json`
- **加载方式**: Addressables + MessagePack 序列化
- **存储位置**: `Cfg.IntentCfgMap` (Dictionary<int, IntentCfg>)

---

## 二、核心属性

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `id` | 意图唯一ID | `101` |
| `name` | 意图名称 | `"购买玩具"` |
| `desc` | 意图描述 | `"去小卖部购买一个玩具"` |
| `group` | 意图分组 | `0`=默认分组 |

---

## 三、完成条件

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `demand` | 完成需求条件 | `[[条件类型, 参数...], ...]` |
| `condition` | 额外条件判断 | `[[条件类型, 操作符, 值], ...]` |
| `finishType` | 完成类型 | `0`=默认 |
| `round` | 持续回合数 | `0`=无限制 |
| `targetRound` | 目标回合 | 在指定回合前完成 |

**demand 格式说明**:
```json
"demand": [
    [60.0, 3.0, 1.0],      // 类型60, 参数3, 数量1
    [10.0, 12.0, 1.0],     // 类型10, 参数12, 数量1
    [4.0, 1.0, 1.0, 25.0]  // 类型4, 参数1, 操作符1, 值25
]
```

---

## 四、奖励与惩罚

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `reward` | 完成奖励 | `[[效果类型, 目标, 属性ID, 数值], ...]` |
| `fail` | 失败惩罚 | `[[效果类型, 目标, 属性ID, 数值], ...]` |
| `finishTalk` | 完成时触发的对话ID列表 | `[1001, 1002]` |
| `failTalk` | 失败时触发的对话ID列表 | `[2001, 2002]` |

**reward 格式说明**:
```json
"reward": [
    [1.0, 1.0, 8.0, 5.0],      // 效果类型1, 目标1, 属性8+5
    [1.0, 11.0, 1.0, 1.0],     // 效果类型1, 目标11, 属性1+1
    [1.0, 1.0, 302.0, 2.0]     // 效果类型1, 目标1, 属性302+2
]
```

---

## 五、关联与流程

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `npc` | 关联NPC ID | `319`=小卖部老板, `5`=默认 |
| `before` | 前置意图ID | `0`=无前置, `101`=需先完成意图101 |
| `next` | 后续解锁意图ID | `0`=无后续, `102`=完成后解锁意图102 |
| `tag` | 意图标签 | `1`=普通, 用于分类筛选 |
| `weight` | 权重/优先级 | `5.0`=普通, `10.0`=高优先级 |

---

## 六、人生观属性

### 6.1 renshengguan 属性定义

**类型**: `int`

**含义**: 该意图关联的人生观类型

| 值 | 含义 |
|----|------|
| `0` | 不关联任何人生观（默认值） |
| `1` | 关联"**进步**"人生观 |
| `2` | 关联"**陪伴**"人生观 |
| `3` | 关联"**责任**"人生观 |
| `4` | 关联"**洒脱**"人生观 |

### 6.2 四种人生观类型

| ID | 类型 | 描述 | 主题色 |
|----|------|------|--------|
| `1` | **进步** | 持之以恒，万事皆成 | 绿色 #76ff64 |
| `2` | **陪伴** | 愿得一心人，白首不分离 | 粉色 #ff8fc9 |
| `3` | **责任** | 此后如竟没有炬火，我便是唯一的光 | 蓝色 #72dcfe |
| `4` | **洒脱** | 生命诚可贵，爱情价更高，若为自由故，两者皆可抛 | 紫色 #be89ff |

### 6.3 实际用途

```csharp
// 检查意图是否与玩家当前人生观匹配
bool flag = intentCfg.renshengguan > 0 
    && Singleton<RoleMgr>.Ins.GetRenshengguanData().Type == intentCfg.renshengguan;

// 如果匹配，显示对应的人生观图标
if (flag)
{
    cell_IntentSelectItemUI.icon_item.SetAtlasUrl(
        "renshengguan/icon_" + Cfg.RenshengguanTypeCfgMap[intentCfg.renshengguan].img, 
        true
    );
}
```

### 6.4 当前数据状态

目前 IntentCfg.json 中所有意图的 `renshengguan` 值都为 **0**，表示当前没有意图与特定的人生观类型绑定。

---

## 七、完整示例

### 示例1: 购买玩具

```json
{
    "id": 101,
    "name": "购买玩具",
    "group": 0,
    "reward": [
        [1.0, 1.0, 8.0, 5.0]   // 金钱+5
    ],
    "before": 0,
    "condition": [],
    "desc": "去小卖部购买一个玩具",
    "demand": [
        [60.0, 3.0, 1.0]        // 购买类型60, 物品3, 数量1
    ],
    "weight": 5.0,
    "next": 0,
    "round": 0,
    "fail": [],
    "finishTalk": [],
    "failTalk": [],
    "tag": 1,
    "finishType": 0,
    "npc": 319,                 // 小卖部老板
    "targetRound": 0,
    "renshengguan": 0
}
```

### 示例2: 学习知识点

```json
{
    "id": 102,
    "name": "学习知识点",
    "group": 0,
    "reward": [
        [1.0, 11.0, 1.0, 1.0]   // 经验+1
    ],
    "before": 0,
    "condition": [],
    "desc": "学习一次知识点",
    "demand": [
        [10.0, 12.0, 1.0]       // 行动类型10, 参数12, 次数1
    ],
    "weight": 5.0,
    "next": 0,
    "round": 0,
    "fail": [],
    "finishTalk": [],
    "failTalk": [],
    "tag": 1,
    "finishType": 0,
    "npc": 5,
    "targetRound": 0,
    "renshengguan": 0
}
```

### 示例3: 提升智力

```json
{
    "id": 103,
    "name": "提升智力",
    "group": 0,
    "reward": [
        [1.0, 1.0, 302.0, 2.0]  // 属性302+2
    ],
    "before": 0,
    "condition": [],
    "desc": "提高智力以掌握方法论",
    "demand": [
        [4.0, 1.0, 1.0, 25.0]   // 属性4≥25
    ],
    "weight": 5.0,
    "next": 0,
    "round": 0,
    "fail": [],
    "finishTalk": [],
    "failTalk": [],
    "tag": 1,
    "finishType": 0,
    "npc": 5,
    "targetRound": 0,
    "renshengguan": 0
}
```

---

## 八、代码实现

### 类定义 (IntentCfg.cs)

```csharp
[CfgClass(25042704UL, 8508)]
public class IntentCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999, Required = true)]
    public int id;                          // 意图ID
    
    [CfgProperty(CfgPropertyType.Default, 8020, 0, Required = true)]
    public string name;                     // 意图名称
    
    [CfgProperty(CfgPropertyType.Default, 8013, 0, Hide = true, DefaultValue = 999)]
    public int group;                       // 意图分组
    
    [CfgProperty(CfgPropertyType.Effect, 8026, 8980)]
    public List<List<float>> reward;        // 完成奖励
    
    [CfgProperty(CfgPropertyType.Default, 8027, 0)]
    public string desc;                     // 意图描述
    
    [CfgProperty(CfgPropertyType.Condition, 8028, 8979)]
    public List<List<double>> demand;       // 完成需求
    
    [CfgProperty(CfgPropertyType.Other, 8029, 8978)]
    public int npc;                         // 关联NPC
    
    [CfgProperty(CfgPropertyType.Default, 8030, 8977)]
    public int finishType;                  // 完成类型
    
    [CfgProperty(CfgPropertyType.Default, 8031, 8976)]
    public int round;                       // 持续回合
    
    public int before;                      // 前置意图
    public List<List<double>> condition;    // 额外条件
    public List<List<float>> fail;          // 失败惩罚
    public List<int> failTalk;              // 失败对话
    public List<int> finishTalk;            // 完成对话
    public int next;                        // 后续意图
    public int renshengguan;                // 人生观类型
    public int tag;                         // 意图标签
    public int targetRound;                 // 目标回合
    public float weight;                    // 权重
}
```

### 加载接口 (Cfg.cs)

```csharp
public static Dictionary<int, IntentCfg> IntentCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadIntentCfgMap()
{
    CfgMgr.LoadAsync<IntentCfg>("Cfgs/" + LocalizationMgr.Lang + "/IntentCfg", 
        delegate(Dictionary<int, IntentCfg> _t)
    {
        Cfg.IntentCfgMap = _t;
    });
}
```

---

## 九、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/IntentCfg.cs` | IntentCfg 类定义 |
| `Assembly-CSharp/View/TheAction/IntentSelectView.cs` | 意图选择界面 |
| `TextAsset/IntentCfg.json` | 意图配置文件 |
| `TextAsset/RenshengguanTypeCfg.json` | 人生观类型配置 |
| `TextAsset/RenshengguanSkillCfg.json` | 人生观技能配置 |

---

## 十、注意事项

1. **renshengguan 值范围**: 只能是 0-4，其中 0 表示不关联人生观
2. **demand 条件类型**: 不同类型对应不同的完成条件判断逻辑
3. **weight 权重**: 影响意图在列表中的排序优先级
4. **before/next**: 用于构建意图链，形成任务线
5. **当前数据**: 目前所有意图的 renshengguan 都为 0，该功能可能尚未完全启用

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
