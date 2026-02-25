# TraitsCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 文件概述

**TraitsCfg.json** 是游戏中**角色特性(Traits)**系统的核心配置文件，定义了所有角色可以拥有的特性（特质）及其效果。特性系统为角色提供被动属性加成、行为改变或特殊能力，是角色个性化和差异化的重要机制。

特性分为**主要特性(Trait)**和**次要特性(Trait2)**两种，每个角色可以拥有一个主要特性和一个次要特性。

---

## 属性说明

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `id` | int | 特性唯一标识ID |
| `name` | string | 特性名称（显示用） |
| `effect` | List<List<float>> | 特性效果列表 |

---

## 详细属性解析

### 1. id - 特性ID

- **类型**: `int`
- **说明**: 特性的唯一标识符，用于在代码中引用特定特性
- **ID范围规律**:
  - `300-399`: 通用特性（如社牛、书迷、花痴等）
  - `10100-10199`: 角色专属特性（如怀旧、单纯、巧手等）
  - `20100-20199`: 进阶/高级特性（如学霸、腹黑等）
  - `10400+`: 特殊特性（如活力等）

### 2. name - 特性名称

- **类型**: `string`
- **说明**: 特性的显示名称，在游戏中展示给玩家
- **示例值**:
  - `"社牛"` - 社交能力强的特性
  - `"书迷"` - 喜欢读书的特性
  - `"学霸"` - 学习能力强的特性
  - `"腹黑"` - 性格阴险的特性

### 3. effect - 特性效果列表

- **类型**: `List<List<float>>`
- **说明**: 特性触发的所有效果，是一个二维数组
- **格式**: 每个子数组代表一个独立的效果，格式为 `[效果类型, 参数1, 参数2, ...]`

#### 效果类型说明

| 效果类型值 | 效果类型 | 说明 | 参数格式 |
|-----------|---------|------|---------|
| `1.0` | 改变属性 | 修改角色基础属性 | `[1.0, 1.0, 属性ID, 数值]` |
| `4.0` | 学习效果 | 影响学习效率 | `[4.0, ...]` |
| `11.0` | 改变倾向 | 修改角色行为倾向 | `[11.0, 倾向ID, 数值]` |
| `20.0` | 改变技能 | 修改技能等级 | `[20.0, 技能ID, 数值]` |
| `60.0` | 商店效果 | 影响商店相关 | `[60.0, 商店类型, 效果值]` |

#### 常见效果参数详解

**1.0 - 改变属性效果**:
```
[1.0, 1.0, 属性ID, 数值]
```
- 第2个`1.0`: 固定值，表示直接修改
- `属性ID`: 要修改的属性（如11=社交，8=精力，9=心情等）
- `数值`: 修改量（正数增加，负数减少）

**11.0 - 改变倾向效果**:
```
[1.0, 11.0, 倾向ID, 数值]
```
- `倾向ID`: 如520=好感度相关，502=叛逆，504=心机
- `数值`: 倾向变化量

**20.0 - 改变技能效果**:
```
[20.0, 技能ID, 数值]
```
- `技能ID`: 技能标识
- `数值`: 技能等级变化

**60.0 - 商店效果**:
```
[60.0, 商店类型, 效果值]
```
- `商店类型`: 如10=玩具店，98=特殊商店
- `效果值`: 效果强度

---

## 代码使用示例

### 特性配置类定义

```csharp
// 文件路径: Assembly-CSharp/Config/TraitsCfg.cs
[CfgClass(25112900UL, 8500)]
public class TraitsCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999, Required = true)]
    public int id;

    [CfgProperty(CfgPropertyType.Default, 8001, 0, Required = true)]
    public string name;

    [CfgProperty(CfgPropertyType.Effect, 8002, 0, Required = true)]
    public List<List<float>> effect;
}
```

### 加载特性配置

```csharp
// 文件路径: Assembly-CSharp/Config/Cfg.cs
public static Dictionary<int, TraitsCfg> TraitsCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadTraitsCfgMap()
{
    CfgMgr.LoadAsync<TraitsCfg>("Cfgs/" + LocalizationMgr.Lang + "/TraitsCfg", 
        delegate(Dictionary<int, TraitsCfg> _t)
    {
        Cfg.TraitsCfgMap = _t;
    });
}
```

### 设置角色主要特性

```csharp
// 文件路径: Assembly-CSharp/TheEntity/Role.cs
public void SetTrait(int _trait, bool _isFirstMet = false)
{
    TraitsCfg traitsCfg;
    if (!Cfg.TraitsCfgMap.TryGetValue(_trait, out traitsCfg))
    {
        Debug.LogError(string.Format("找不到特性：{0}", _trait));
        return;
    }
    
    // 添加到可选特性列表
    this.AddSelectableTrait(_trait, false, _isFirstMet);
    
    // 设置当前特性
    this.Trait = _trait;
    
    // 清除旧特性的效果
    if (this.traitUids != null)
    {
        Singleton<RoleMgr>.Ins.RemoveEffect(this.traitUids);
        this.traitUids = null;
    }
    
    // 根据特性配置生成效果器
    Effector effector = CommonEvtMgr.GenEffector(traitsCfg.effect, null, 0, this.id);
    if (effector != null)
    {
        effector.SetIsInc(true);
        effector.SetTag(DescCtrl.GetTxt<string>(535, new string[]
        {
            this.Name,
            traitsCfg.name
        }));
        effector.SetRateType(10001);
        effector.Run(1f, false);
        this.traitUids = effector.GetBaseIncreaserUids();
    }
    
    EventMgr.Send(401);  // 发送特性变更事件
}
```

### 设置角色次要特性

```csharp
// 文件路径: Assembly-CSharp/TheEntity/Role.cs
public void SetTrait2(int _trait)
{
    TraitsCfg traitsCfg;
    if (!Cfg.TraitsCfgMap.TryGetValue(_trait, out traitsCfg))
    {
        Debug.LogError(string.Format("找不到特性：{0}", _trait));
        return;
    }
    
    int oldTrait = this.Trait2;
    this.Trait2 = _trait;
    
    // 清除旧效果
    if (this.traitUids2 != null)
    {
        Singleton<RoleMgr>.Ins.RemoveEffect(this.traitUids2);
        this.traitUids2 = null;
    }
    
    // 应用新效果
    Effector effector = CommonEvtMgr.GenEffector(traitsCfg.effect, null, 0, this.id);
    if (effector != null)
    {
        effector.SetIsInc(true);
        effector.SetTag(DescCtrl.GetTxt<string>(1241, new string[]
        {
            this.Name,
            traitsCfg.name
        }));
        effector.SetRateType(10008);
        effector.Run(1f, false);
        this.traitUids2 = effector.GetBaseIncreaserUids();
    }
    
    EventMgr.Send(401);
    
    // 显示特性切换提示
    if (oldTrait != _trait)
    {
        // 显示切换提示...
    }
}
```

### 获取特性效果描述

```csharp
// 文件路径: Assembly-CSharp/ActionDescHelper.cs
public static DescData? Trait2(int _type, int _trait, int _roleId)
{
    TraitsCfg traitsCfg = Cfg.TraitsCfgMap[_trait];
    
    // 生成效果描述
    Effector effector = CommonEvtMgr.GenEffector(traitsCfg.effect, null, 0, 0);
    string effectDesc = (effector != null) ? effector.ToString(num2, 0) : null;
    
    return new DescData
    {
        txt = effectDesc,
        title = traitsCfg.name
    };
}
```

---

## 配置示例

### 示例1: 社牛（社交加成）

```json
{
    "id": 300,
    "name": "社牛",
    "effect": [
        [1.0, 1.0, 11.0, 20.0],    // 社交属性+20
        [20.0, 90.0, 10.0]          // 社交技能+10
    ]
}
```

### 示例2: 书迷（阅读加成）

```json
{
    "id": 301,
    "name": "书迷",
    "effect": [
        [1.0, 1.0, 331.0, 10.0]    // 阅读相关属性+10
    ]
}
```

### 示例3: 学霸（学习加成）

```json
{
    "id": 20101,
    "name": "学霸",
    "effect": [
        [1.0, 1.0, 302.0, 5.0]     // 学习效率+5
    ]
}
```

### 示例4: 腹黑（心机加成）

```json
{
    "id": 20202,
    "name": "腹黑",
    "effect": [
        [1.0, 11.0, 504.0, 5.0]    // 心机倾向+5
    ]
}
```

### 示例5: 活力（精力/心情加成）

```json
{
    "id": 10400,
    "name": "活力",
    "effect": [
        [1.0, 1.0, 8.0, 10.0],     // 精力+10
        [1.0, 1.0, 9.0, 30.0]      // 心情+30
    ]
}
```

### 示例6: 单纯（多效果特性）

```json
{
    "id": 10101,
    "name": "单纯",
    "effect": [
        [1.0, 11.0, 3.0, 4.0],     // 某种倾向+4
        [1.0, 11.0, 10.0, -2.0]    // 另一种倾向-2
    ]
}
```

---

## 系统流程

```
角色获得特性
    ↓
调用 SetTrait() / SetTrait2()
    ↓
从 Cfg.TraitsCfgMap 获取 TraitsCfg
    ↓
清除旧特性效果（如果有）
    ↓
使用 CommonEvtMgr.GenEffector() 解析 effect 列表
    ↓
生成 Effector 效果器
    ↓
效果器.Run() 执行效果
    ↓
保存效果UID用于后续移除
    ↓
发送事件 401 (特性变更)
    ↓
显示特性获得/切换提示
```

---

## 特性类型分类

### 按功能分类

| 类型 | 说明 | 示例 |
|------|------|------|
| **属性加成类** | 直接增加角色基础属性 | 社牛(+社交)、活力(+精力/心情) |
| **技能加成类** | 提升特定技能等级 | 书迷(+阅读技能) |
| **倾向改变类** | 改变角色行为倾向 | 腹黑(+心机)、桀骜(+叛逆) |
| **学习加成类** | 影响学习效率 | 学霸(+学习效率) |
| **商店类** | 影响商店购买 | 巧手(商店折扣) |

### 按等级分类

| 等级 | ID范围 | 说明 |
|------|--------|------|
| 通用特性 | 300-399 | 所有角色都可能获得的通用特质 |
| 专属特性 | 10100-10199 | 特定角色的专属特质 |
| 进阶特性 | 20100-20199 | 高级/稀有特质 |

---

## 注意事项

1. **效果叠加**: 多个特性的效果可以叠加，同名属性的加成会累计
2. **特性切换**: 更换特性时会先移除旧效果，再应用新效果
3. **效果持久性**: 特性效果是被动持续生效的，不需要主动触发
4. **显示格式**: 特性效果描述通过 `CommonEvtMgr.ToEffectorStr()` 生成
5. **MOD支持**: 特性配置支持MOD扩展，可在MOD中定义新特性

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
