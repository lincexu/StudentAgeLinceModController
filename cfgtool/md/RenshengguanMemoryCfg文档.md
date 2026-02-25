# RenshengguanMemoryCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**RenshengguanMemoryCfg.json** 是游戏的人生观记忆配置文件，定义了玩家在游戏中可以解锁的各种记忆，这些记忆会影响玩家的人生观类型和技能选择。

- **加载路径**: `Cfgs/{语言}/RenshengguanMemoryCfg`
- **存储位置**: `Cfg.RenshengguanMemoryCfgMap` (Dictionary<int, RenshengguanMemoryCfg>)
- **用途**: 配置人生观记忆的解锁条件、类型、描述、图片等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 记忆唯一ID | `1`, `2`, `1001` |
| `title` | string | 记忆标题 | `"天道酬勤"` |
| `type` | int | 记忆类型 | `1`=进步, `2`=陪伴, `3`=责任, `4`=洒脱 |
| `cond` | List<List<double>> | 解锁条件 | `[[3.0,3.0,1001.0]]` |
| `desc` | string | 记忆描述 | `"描述文本"` |
| `url` | List<string> | 图片路径 | `["memory/img_01"]` |
| `npcId` | List<int> | 关联NPC | `[3, 101]` |
| `sceneId` | int | 场景ID | `1001` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 记忆的唯一标识符

**说明**: 用于在游戏中唯一标识一个记忆

---

### 3.2 title

**类型**: `string`

**功能**: 记忆的标题名称

**示例**:
```json
"title": "天道酬勤"
"title": "蒂蒂猫手表"
"title": "第一次告白"
```

---

### 3.3 type ⭐重要

**类型**: `int`

**功能**: 记忆类型，关联到人生观类型

| type值 | 名称 | 描述 | 解锁效果 |
|--------|------|------|----------|
| `1` | **进步** | 持之以恒，万事皆成 | 可解锁额外的人格机制 |
| `2` | **陪伴** | 愿得一心人，白首不分离 | 可关注第五个同学，社交容量+5，热情+30 |
| `3` | **责任** | 此后如竟没有炬火，我便是唯一的光 | 获得额外的价值观和方法论 |
| `4` | **洒脱** | 生命诚可贵，爱情价更高，若为自由故，两者皆可抛 | 可获得第五项人格，并可强化人格1次 |

**说明**: 收集足够数量的某类型记忆可以解锁对应的人生观

---

### 3.4 cond ⭐重要

**类型**: `List<List<double>>`

**功能**: 解锁该记忆所需的条件

**格式**: `[[条件类型, 参数1, 参数2, ...], ...]`

**常见条件类型**:

| 代码 | 条件类 | 说明 | 示例 |
|------|--------|------|------|
| `3.0` | ConditionerEvent | 事件条件 | `[3.0, 3.0, 1001.0]` 触发事件1001 |
| `52.0` | ConditionerLove | 恋爱条件 | `[52.0, 2.0, 1.0, 3.0]` 与角色3建立恋爱关系 |
| `90.0` | ConditionerOther | 其他条件 | `[90.0, 4.0, 1.0, 选项值]` 事件中选择特定选项 |

**示例**:
```json
"cond": [
    [3.0, 3.0, 1001.0],           // 触发事件1001
    [52.0, 2.0, 1.0, 101.0],      // 与角色101建立恋爱关系
    [90.0, 4.0, 1.0, 1.0]         // 在事件中选择选项1
]
```

---

### 3.5 desc

**类型**: `string`

**功能**: 记忆的详细描述文本

**说明**: 解锁后在记忆界面显示的详细描述

---

### 3.6 url

**类型**: `List<string>`

**功能**: 记忆相关的图片资源路径

**示例**:
```json
"url": ["memory/img_tiandao"]
"url": ["memory/img_watch", "memory/img_watch2"]
```

---

### 3.7 npcId

**类型**: `List<int>`

**功能**: 与该记忆相关的NPC ID列表

| 值 | 含义 |
|----|------|
| `0` | 主角自己 |
| `>0` | NPC角色ID |

**示例**:
```json
"npcId": [0]        // 与主角自己相关
"npcId": [3, 101]   // 与梁超杰和小纯相关
```

---

### 3.8 sceneId

**类型**: `int`

**功能**: 触发该记忆的场景ID

**说明**: 关联到 SceneCfg 配置

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/RenshengguanMemoryCfg.cs`

```csharp
[CfgClass(25042200UL, 8502)]
public class RenshengguanMemoryCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999, Required = true)]
    public int id;
    
    [CfgProperty(CfgPropertyType.Default, 8020, 0, Required = true)]
    public string title;
    
    [CfgProperty(CfgPropertyType.Default, 8059, 0, Required = true, DefaultValue = 1)]
    [CfgPropertyRange(typeof(RenshengguanTypeCfg))]
    public int type;
    
    [CfgProperty(CfgPropertyType.Condition, 8060, 0, Required = true)]
    public List<List<double>> cond;
    
    [CfgProperty(CfgPropertyType.Default, 8027, 0, Required = true)]
    public string desc;
    
    [CfgProperty(CfgPropertyType.Image, 8004, 0, Required = true)]
    public List<string> url;
    
    public List<int> npcId;
    public int sceneId;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, RenshengguanMemoryCfg> RenshengguanMemoryCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadRenshengguanMemoryCfgMap()
{
    CfgMgr.LoadAsync<RenshengguanMemoryCfg>("Cfgs/" + LocalizationMgr.Lang + "/RenshengguanMemoryCfg", 
        delegate(Dictionary<int, RenshengguanMemoryCfg> _t)
    {
        Cfg.RenshengguanMemoryCfgMap = _t;
    });
}
```

### 4.3 记忆数据管理

**文件**: `Assembly-CSharp/RenshengguanData.cs`

```csharp
public class RenshengguanData : BaseData
{
    // 记忆列表 (记忆ID, 解锁回合)
    public List<ValueTuple<int, int>> memories;
    
    // 各类型记忆点数
    private Dictionary<int, int> points;
    
    // 检查记忆解锁
    public void CheckMemoryUnlock()
    {
        foreach (var cfg in Cfg.RenshengguanMemoryCfgMap)
        {
            if (!this.HasMemory(cfg.Key) && 
                CommonEvtMgr.IsMatchCondition(cfg.Value.cond, false))
            {
                this.AddMemory(cfg.Key, true);
            }
        }
    }
    
    // 添加记忆
    public void AddMemory(int _id, bool _toast = true)
    {
        RenshengguanMemoryCfg cfg = Cfg.RenshengguanMemoryCfgMap[_id];
        
        // 记录记忆
        this.memories.Add(new ValueTuple<int, int>(_id, Singleton<RoundMgr>.Ins.GetRound()));
        
        // 增加对应类型点数
        this.AddPoint(cfg.type);
        
        // 显示提示
        if (_toast)
        {
            HintHelper.ShowMemory(_id);
        }
        
        // 检查是否解锁人生观
        this.CheckUnlock();
    }
    
    // 获取某类型记忆数量
    public int GetMemoryCnt(int _type = -1)
    {
        int count = 0;
        foreach (var memory in this.memories)
        {
            var cfg = Cfg.RenshengguanMemoryCfgMap[memory.Item1];
            if (cfg.type == _type || _type == -1)
            {
                count++;
            }
        }
        return count;
    }
}
```

### 4.4 检查人生观解锁

```csharp
public void CheckUnlock()
{
    // 检查各类型记忆数量是否达到阈值
    for (int type = 1; type <= 4; type++)
    {
        int count = this.GetMemoryCnt(type);
        int threshold = Cfg.RenshengguanTypeCfgMap[type].unlockCnt;
        
        if (count >= threshold && !this.IsUnlocked(type))
        {
            this.UnlockRenshengguan(type);
        }
    }
}
```

---

## 五、配置示例

### 示例1: 进步型记忆

```json
{
    "1": {
        "id": 1,
        "title": "天道酬勤",
        "type": 1,
        "cond": [[3.0, 3.0, 1001.0]],
        "desc": "通过不懈努力，终于取得了优异的成绩",
        "url": ["memory/img_tiandao"],
        "npcId": [0],
        "sceneId": 1001
    }
}
```

---

### 示例2: 陪伴型记忆

```json
{
    "101": {
        "id": 101,
        "title": "蒂蒂猫手表",
        "type": 2,
        "cond": [[52.0, 2.0, 1.0, 101.0]],
        "desc": "与小纯一起购买的纪念手表",
        "url": ["memory/img_watch"],
        "npcId": [101],
        "sceneId": 2001
    }
}
```

---

### 示例3: 责任型记忆

```json
{
    "201": {
        "id": 201,
        "title": "班长的担当",
        "type": 3,
        "cond": [[90.0, 4.0, 1.0, 1.0]],
        "desc": "在关键时刻挺身而出，承担了班级的责任",
        "url": ["memory/img_banzhang"],
        "npcId": [0, 3, 4],
        "sceneId": 3001
    }
}
```

---

### 示例4: 洒脱型记忆

```json
{
    "301": {
        "id": 301,
        "title": "说走就走的旅行",
        "type": 4,
        "cond": [[3.0, 3.0, 4001.0]],
        "desc": "放下一切束缚，追寻内心的自由",
        "url": ["memory/img_travel"],
        "npcId": [0],
        "sceneId": 4001
    }
}
```

---

## 六、人生观类型详解

### 进步型 (type=1)

**理念**: 持之以恒，万事皆成

**解锁条件**: 收集足够数量的进步型记忆

**效果**: 
- 可解锁额外的人格机制
- 增强属性成长

### 陪伴型 (type=2)

**理念**: 愿得一心人，白首不分离

**解锁条件**: 收集足够数量的陪伴型记忆

**效果**:
- 可关注第五个同学
- 社交容量+5
- 热情+30

### 责任型 (type=3)

**理念**: 此后如竟没有炬火，我便是唯一的光

**解锁条件**: 收集足够数量的责任型记忆

**效果**:
- 获得额外的价值观
- 获得额外的方法论

### 洒脱型 (type=4)

**理念**: 生命诚可贵，爱情价更高，若为自由故，两者皆可抛

**解锁条件**: 收集足够数量的洒脱型记忆

**效果**:
- 可获得第五项人格
- 可强化人格1次

---

## 七、系统流程

```
游戏进行
    ↓
触发事件/满足条件
    ↓
CheckMemoryUnlock() 检查记忆解锁
    ↓
条件满足 → AddMemory() 添加记忆
    ↓
增加对应类型点数
    ↓
CheckUnlock() 检查人生观解锁
    ↓
某类型记忆数量≥阈值 → 解锁人生观
    ↓
获得对应技能/效果
```

---

## 八、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/RenshengguanMemoryCfg.cs` | 记忆配置类 |
| `Assembly-CSharp/Config/RenshengguanTypeCfg.cs` | 人生观类型配置 |
| `Assembly-CSharp/RenshengguanData.cs` | 人生观数据管理 |
| `Assembly-CSharp/MemoryHintData.cs` | 记忆提示数据 |
| `TextAsset/RenshengguanMemoryCfg.json` | 记忆配置文件 |
| `TextAsset/RenshengguanTypeCfg.json` | 人生观类型配置 |

---

## 九、快速参考

| 用途 | 配置示例 |
|------|----------|
| 进步型记忆 | `{"id": 1, "type": 1, "title": "天道酬勤"}` |
| 陪伴型记忆 | `{"id": 101, "type": 2, "title": "蒂蒂猫手表"}` |
| 责任型记忆 | `{"id": 201, "type": 3, "title": "班长的担当"}` |
| 洒脱型记忆 | `{"id": 301, "type": 4, "title": "说走就走的旅行"}` |
| 事件条件 | `"cond": [[3.0, 3.0, 1001.0]]` |
| 恋爱条件 | `"cond": [[52.0, 2.0, 1.0, 101.0]]` |
| 多NPC关联 | `"npcId": [3, 101, 201]` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
