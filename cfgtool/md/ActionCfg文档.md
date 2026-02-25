# ActionCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**ActionCfg.json** 是游戏的核心配置文件之一，定义了所有可执行行动的属性。

- **加载路径**: `Cfgs/{语言}/ActionCfg.json`
- **加载方式**: Addressables + MessagePack 序列化
- **存储位置**: `Cfg.ActionCfgMap` (Dictionary<int, ActionCfg>)

---

## 二、核心属性

| 属性 | 类型 | 代码特性 | 功能说明 |
|------|------|----------|----------|
| `id` | int | `[CfgProperty(8000)]` | 行动唯一标识符 |
| `name` | string | `[CfgProperty(8001)]` | 行动显示名称 |
| `cnt` | int | `[CfgProperty(8007)]` | **次数限制**：<br>• `0` = 无限次<br>• `>0` = 每回合限制次数<br>• `<0` = 冷却回合数（如-3=每3回合1次） |
| `map` | int | `[CfgProperty(8006)]` | **所属地图ID**：<br>• `0` = 家/卧室<br>• `1` = 卧室<br>• `2` = 学校<br>• `3` = 体育馆<br>• `4` = 商店<br>• `5` = 游戏厅<br>• `6` = 书店<br>• `8` = 电影院 |
| `funcId` | int | - | **功能ID**：点击行动时打开的功能界面 |
| `type` | int | `[CfgProperty(8003)]` | **行动类型**：<br>• `0` = 普通行动<br>• `1` = 打开功能界面<br>• `2` = 家内功能<br>• `3` = **恋爱行动**<br>• `4` = 打工 |
| `icon` | string | `[CfgProperty(8004)]` | 图标资源路径 |

---

## 三、消耗与效果

### 3.1 cost（消耗资源）

**类型**: `List<List<float>>`

**格式**: `[[属性ID, 数值], ...]`

**示例**:
```json
"cost": [[7.0, 10.0]]  // 消耗10点属性7（金钱）
```

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8005, 8996)]
public List<List<float>> cost;
```

### 3.2 effect（行动效果）

**类型**: `List<List<float>>`

**格式**: `[[效果类型, 子类型, 参数...], ...]`

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Effect, 8002, 0)]
public List<List<float>> effect;
```

### 3.3 attrs（属性标签）

**类型**: `List<string>`

**功能**: 用于分类或筛选行动

---

## 四、事件与交互

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `evtId` | int | **关联事件ID**，执行行动时触发该事件 |
| `evtType` | int | **事件类型**（仅当 `type=3` 恋爱行动时有效） |
| `minigameId` | int | **小游戏ID**（如祈福的小游戏ID=31） |
| `bg` | int | **背景图片ID**（0=无背景） |

---

## 五、解锁与精通系统

### 5.1 unlock（解锁条件）

**类型**: `List<List<double>>`

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"unlock": [
    [10.0, -100.0],           // 条件1
    [2.0, -4.0, 501.0]        // 属性2≥-4且拥有501
]
```

### 5.2 精通相关

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `needExp` | int | **精通所需经验值** |
| `expReward` | `List<List<float>>` | **精通奖励效果** |
| `next` | int | **精通后解锁的下一个行动ID**（0=无） |

---

## 六、时间限制

| 属性 | 类型 | 格式 | 功能说明 |
|------|------|------|----------|
| `beginTime` | `List<float>` | `[年, 月]` | **开放起始时间** |
| `endTime` | `List<float>` | `[年, 月]` | **开放结束时间** |

---

## 七、其他属性

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `anime` | string | 动画名称 |
| `audio` | int | 音效ID |
| `disableTxt` | `List<string>` | 禁用提示文本 |
| `interactable` | `List<List<double>>` | 可交互条件 |
| `label` | int | 标签ID（用于成就或统计分类） |
| `tag` | string | 标签文本前缀 |

---

## 八、代码实现详解

### 8.1 行动执行逻辑（ActionData.cs）

```csharp
public void Action(ActionSubData _data, ...)
{
    ActionCfg actionCfg = Cfg.ActionCfgMap[_data.id];
    
    // 类型 1 或 2：打开功能界面或小游戏
    if (actionCfg.type == 1 || actionCfg.type == 2)
    {
        if (actionCfg.minigameId > 0)
            Singleton<FuncMgr>.Ins.OpenMiniGame(actionCfg.minigameId, ...);
        else
            Singleton<FuncMgr>.Ins.OpenFuncView(actionCfg.funcId);
        return;
    }
    
    // 类型 3：恋爱行动
    if (actionCfg.type == 3)
    {
        this.HelpLoveAction(_data, ...);
        return;
    }
    
    // 普通行动
    this.HelpAction(_data, ...);
}
```

### 8.2 次数计算（CfgExtension.cs）

```csharp
public static int Cnt(this ActionCfg _cfg)
{
    Role role = Singleton<RoleMgr>.Ins.GetRole();
    if (role != null)
    {
        // 检查是否有增益效果影响次数
        BaseIncreaser baseIncreaser = role.IncCtrl.Get(RoleIncType.ActionCnt, _cfg.id);
        if (baseIncreaser != null)
            return (int)baseIncreaser.GetValue();
    }
    return _cfg.cnt;
}
```

### 8.3 冷却计算（ActionSubData.cs）

```csharp
public int GetRestRound()
{
    int num = Cfg.ActionCfgMap[this.id].Cnt();
    if (num < 0 && this.round != 0)
        return Mathf.Abs(num) - (Singleton<RoundMgr>.Ins.GetRound() - this.round);
    return 0;
}
```

---

## 九、示例解析

### 示例1：买东西（ID: 2001）

```json
{
    "id": 2001,
    "name": "买东西",
    "cnt": 0,              // 无限次
    "map": 4,              // 商店地图
    "funcId": 6,           // 商店功能
    "type": 1,             // 打开功能
    "icon": "shop",
    "cost": [],            // 无消耗
    "effect": [],
    "unlock": []
}
```

### 示例2：祈福（ID: 2011）

```json
{
    "id": 2011,
    "name": "祈福",
    "cnt": -3,             // 每3回合1次
    "map": 17002,
    "cost": [[7.0, 10.0]], // 消耗10金钱
    "type": 0,             // 普通行动
    "effect": [[1.0, 1.0, 3.0, 5.0]],
    "attrs": ["3"],
    "minigameId": 31,      // 小游戏ID
    "needExp": 5,          // 需5经验精通
    "expReward": [[1.0, 1.0, 3.0, 10.0]],
    "label": 30099
}
```

### 示例3：上课（ID: 2012）

```json
{
    "id": 2012,
    "name": "上课",
    "map": 2,              // 学校
    "funcId": 58,
    "type": 1,
    "bg": 202011,          // 特定背景
    "unlock": [
        [10.0, -100.0],
        [2.0, -4.0, 501.0]  // 属性2≥-4且拥有501
    ]
}
```

---

## 十、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/ActionCfg.cs` | ActionCfg 类定义 |
| `Assembly-CSharp/ActionData.cs` | 行动系统核心逻辑 |
| `Assembly-CSharp/ActionSubData.cs` | 玩家行动数据 |
| `Assembly-CSharp/CfgExtension.cs` | 扩展方法 |
| `TextAsset/ActionCfg.json` | 配置文件 |

---

## 十一、参考代码

### 加载接口（CfgMgr.cs）

```csharp
public static Dictionary<int, T> Load<T>(string _path)
{
    // 使用 Addressables 加载
    AsyncOperationHandle<TextAsset> handle = 
        Addressables.LoadAssetAsync<TextAsset>(ResPath.ToAAUrl(_path));
    handle.WaitForCompletion();
    
    // MessagePack 反序列化
    return MessagePackSerializer.Deserialize<Dictionary<string, T>>(...);
}
```

### 配置管理（Cfg.cs）

```csharp
public static Dictionary<int, ActionCfg> ActionCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadActionCfgMap()
{
    CfgMgr.LoadAsync<ActionCfg>("Cfgs/" + LocalizationMgr.Lang + "/ActionCfg", 
        delegate(Dictionary<int, ActionCfg> _t)
    {
        Cfg.ActionCfgMap = _t;
    });
}
```

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
