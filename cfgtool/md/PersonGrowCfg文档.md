# PersonGrowCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**PersonGrowCfg.json** 是游戏的角色成长配置文件，定义了角色的初始属性、成长曲线、性格倾向、特长等。

- **加载路径**: `Cfgs/{语言}/PersonGrowCfg`
- **存储位置**: `Cfg.PersonGrowCfgMap` (Dictionary<int, PersonGrowCfg>)
- **用途**: 配置角色的成长属性、性格、特长、学业排名等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 角色ID | `3`, `101` |
| `attr` | List<float> | 初始属性 [智商,情商,体魄] | `[15.0, 22.0, 10.0]` |
| `grow` | List<List<float>> | 成长值 [12阶段×3属性] | `[[2.0,3.0,1.0],...]` |
| `personalitys` | List<float> | 性格倾向 [8个值] | `[10.0,0.0,10.0,0.0,...]` |
| `focusAttrId` | int | 专注属性ID | `1`=智商, `2`=情商, `4`=体魄 |
| `speciality` | int | 特长ID | `301` |
| `trait` | int | 特性ID | `300` |
| `className` | List<int> | 班级名称 [小,初,高,特殊] | `[1,1,9,3]` |
| `studyRank` | List<int> | 学业排名 [4学段] | `[4,16,26,27]` |
| `items` | List<int> | 初始物品 | `[20320, 3901]` |
| `ItemPref` | List<List<int>> | 物品偏好 | `[[2,2],[8,1],...]` |
| `minigame` | int | 小游戏ID | `20` |
| `state` | List<int> | 初始状态 | `[]` |
| `order` | int | 排序 | `5` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 角色的唯一标识符

**说明**: 与 PersonCfg.json 中的 id 对应

---

### 3.2 attr ⭐重要

**类型**: `List<float>`

**功能**: 角色的初始三维属性值

**格式**: `[智商, 情商, 体魄]`

**示例**:
```json
"attr": [15.0, 22.0, 10.0]
```

**说明**:
- 索引 0: 智商（属性ID 1）
- 索引 1: 情商（属性ID 2）
- 索引 2: 体魄（属性ID 4）

**代码应用**:
```csharp
// 初始化角色属性
Role role = new Role();
role.SetAttr(1, personGrowCfg.attr[0], 0f);  // 智商
role.SetAttr(2, personGrowCfg.attr[1], 0f);  // 情商
role.SetAttr(4, personGrowCfg.attr[2], 0f);  // 体魄
```

---

### 3.3 grow ⭐重要

**类型**: `List<List<float>>`

**功能**: 每回合自动成长的属性值

**格式**: 12个阶段 × 3个属性 `[智商成长, 情商成长, 体魄成长]`

**示例**:
```json
"grow": [
    [2.0, 3.0, 1.0],    // 1年级
    [3.0, 4.0, 2.0],    // 2年级
    [4.0, 5.0, 3.0],    // 3年级
    [5.0, 6.0, 4.0],    // 4年级
    [6.0, 7.0, 5.0],    // 5年级
    [8.0, 8.0, 6.0],    // 6年级
    [12.0, 12.0, 7.0],  // 初一
    [14.0, 14.0, 8.0],  // 初二
    [16.0, 16.0, 9.0],  // 初三
    [18.0, 18.0, 12.0], // 高一
    [22.0, 22.0, 15.0], // 高二
    [25.0, 25.0, 18.0]  // 高三
]
```

**代码应用**:
```csharp
// 获取当前年级的成长值
int gradeIndex = Singleton<RoleMgr>.Ins.GetRole().Grade - 1;
List<List<float>> grow = personGrowCfg.grow;
int index = Mathf.Min(grow.Count - 1, gradeIndex);

float iqGrowth = grow[index][0];      // 智商成长
float eqGrowth = grow[index][1];      // 情商成长
float bodyGrowth = grow[index][2];    // 体魄成长
```

---

### 3.4 personalitys ⭐重要

**类型**: `List<float>`

**功能**: 角色的性格倾向值（8个值，对应4组性格）

**性格映射表**:

| 索引 | 性格A (ID) | 性格B (ID) | 说明 |
|------|------------|------------|------|
| 0-1 | 101 外向 | 102 内向 | 精力来源 |
| 2-3 | 103 直觉 | 104 感觉 | 信息获取 |
| 4-5 | 105 思维 | 106 情感 | 决策方式 |
| 6-7 | 109 判断 | 110 知觉 | 生活方式 |

**示例**:
```json
"personalitys": [10.0, 0.0, 10.0, 0.0, 0.0, 10.0, 20.0, 0.0]
```

**计算逻辑**:
```csharp
// 初始化性格
for (int i = 0; i < 4; i++)
{
    int idxA = i * 2;      // 性格A索引
    int idxB = i * 2 + 1;  // 性格B索引
    
    float valA = personGrowCfg.personalitys[idxA];
    float valB = personGrowCfg.personalitys[idxB];
    
    // 性格ID
    int idA = (idxA == 6) ? 109 : (101 + idxA);  // 特殊处理判断
    int idB = (idxB == 7) ? 110 : (101 + idxB);  // 特殊处理知觉
    
    // 主要性格取较大值
    int mainPersonality = (valA >= valB) ? idA : idB;
    role.MainPersonalitys.Add(mainPersonality);
    
    // 设置属性值
    role.SetAttr(idA, valA, 0f);
    role.SetAttr(idB, valB, 0f);
}
```

**结果**: 上述示例的性格为 **外向、直觉、情感、判断** (ENFJ)

---

### 3.5 focusAttrId

**类型**: `int`

**功能**: 角色的专注属性ID

| 值 | 含义 |
|----|------|
| `1` | 智商 |
| `2` | 情商 |
| `4` | 体魄 |

**说明**: 影响某些游戏机制，如学习效果等

---

### 3.6 speciality ⭐重要

**类型**: `int`

**功能**: 角色的**专长/初始特性**ID

**说明**: 
- 对应 TraitsCfg 配置
- 初始时加入角色的特性列表
- **在好友关系（关系等级5）时解锁**

**代码应用**:
```csharp
// 初始化时加入Traits列表
this.Traits = new List<int>
{
    personGrowCfg.speciality
};

// 好友关系时激活
if (relation == 5)
{
    role.SetTrait(role.Traits[0], true);
}
```

**特点**:
- 提供基础特性效果
- 如果 `Traits` 列表有多个，可以在其间切换
- 通过 `Role.Trait` 字段存储当前激活的特性

---

### 3.7 trait ⭐重要

**类型**: `int`

**功能**: 角色的**深层特质**ID

**说明**: 
- 对应 TraitsCfg 配置
- **在挚友关系（关系等级6）时解锁**
- 通常比 speciality 更强大

**代码应用**:
```csharp
// 挚友关系时解锁深层特质
if (relation == 6)
{
    role.SetTrait2(Cfg.PersonGrowCfgMap[role.id].trait);
}
```

**特点**:
- 提供深层/更强的特性效果
- 一旦解锁通常固定不变
- 通过 `Role.Trait2` 字段单独存储

---

### speciality 与 trait 的区别

| 对比项 | `speciality`（专长） | `trait`（深层特质） |
|--------|----------------------|---------------------|
| **中文含义** | 专长/初始特性 | 深层特质/隐藏天赋 |
| **解锁条件** | 好友关系（等级5） | 挚友关系（等级6） |
| **效果强度** | 基础效果 | 深层/更强效果 |
| **可切换性** | 可在多个特性间切换 | 通常固定不变 |
| **存储字段** | `Role.Trait` / `Role.Traits` | `Role.Trait2` |
| **配置位置** | `PersonGrowCfg.speciality` | `PersonGrowCfg.trait` |

**简单理解**:
- `speciality` = 角色的"**职业技能**"（较早解锁，可切换）
- `trait` = 角色的"**隐藏天赋**"（较晚解锁，更强大）

---

### 3.8 className ⭐重要

**类型**: `List<int>`

**功能**: 各阶段的班级编号

**格式**: `[小学班级, 初中班级, 高中分班前班级, 高中分班后班级]`

**示例**:
```json
"className": [1, 1, 9, 3]
```

**说明**:

| 索引 | 阶段 | ClassType | 说明 |
|------|------|-----------|------|
| 0 | 小学 | - | 小学班级 |
| 1 | 初中 | - | 初中班级 |
| 2 | 高中 | 0 (Default) | 高中分班前班级 |
| 3 | 高中 | 1/2 | 高中分班后班级 |

**ClassType 定义** (仅高中阶段有效):

| ClassType | 含义 |
|-----------|------|
| `0` | 分班前（默认） |
| `1` | 文科班 |
| `2` | 理科班 |

**代码应用**:
```csharp
// 获取班级名称
int classId;
if (role.ClassType == 0)
{
    // 分班前：使用 GradeState 索引
    classId = Cfg.PersonGrowCfgMap[roleId].className[role.GradeState];
}
else
{
    // 分班后（文科/理科）：使用索引 3
    classId = Cfg.PersonGrowCfgMap[roleId].className[3];
}
string className = Cfg.TextCfgMap[classId].text;
```

**判断方法**:
```csharp
// 是否高中分班前
public bool IsGaoZhongDefaultClassType => this.IsGaoZhong && this.ClassType == 0;

// 是否理科班
public bool IsLiKe => this.IsGaoZhong && this.ClassType == 2;

// 是否文科班
public bool IsWenKe => this.IsGaoZhong && this.ClassType == 1;
```

---

### 3.9 studyRank ⭐重要

**类型**: `List<int>`

**功能**: 各阶段的学业排名配置ID

**格式**: `[小学排名, 初中排名, 高中分班前排名, 高中分班后排名]`

**示例**:
```json
"studyRank": [4, 16, 26, 27]
```

**说明**:

| 索引 | 阶段 | ClassType | 说明 |
|------|------|-----------|------|
| 0 | 小学 | - | 小学学业排名 |
| 1 | 初中 | - | 初中学业排名 |
| 2 | 高中 | 0 (Default) | 高中分班前学业排名 |
| 3 | 高中 | 1/2 | 高中分班后学业排名 |

**与 className 相同的逻辑**:
- 索引 0-1: 小学和初中按 GradeState 取值
- 索引 2: 高中分班前（ClassType == 0）
- 索引 3: 高中分班后（ClassType == 1 或 2）

**代码应用**:
```csharp
int rankId;
if (role.ClassType == 0)
{
    // 分班前：使用 GradeState 索引（0=小学, 1=初中, 2=高中分班前）
    rankId = Cfg.PersonGrowCfgMap[role.id].studyRank[role.GradeState];
}
else
{
    // 分班后（文科/理科）：使用索引 3
    rankId = Cfg.PersonGrowCfgMap[role.id].studyRank[3];
}
string rankName = Cfg.StudyRankCfgMap[rankId].name;
```

---

### 3.10 items

**类型**: `List<int>`

**功能**: 角色初始拥有的物品ID列表

**示例**:
```json
"items": [20320, 3901]
```

---

### 3.11 ItemPref ⭐重要

**类型**: `List<List<int>>`

**功能**: 角色对不同物品类型的偏好程度

**格式**: `[[物品类型, 偏好值], ...]`

**偏好值**:

| 值 | 含义 |
|----|------|
| `2` | 最喜欢 |
| `1` | 喜欢 |
| `0` | 普通 |
| `-1` | 不喜欢 |

**物品类型**:

| 类型 | 说明 |
|------|------|
| `1` | 食品 |
| `2` | 书籍 |
| `3` | 玩具 |
| `4` | 电子产品 |
| `5` | 运动用品 |
| `6` | 化妆品 |
| `7` | 服饰 |
| `8` | 游戏 |
| `9` | 音乐 |
| `10` | 美术 |
| `11` | 其他 |

**示例**:
```json
"ItemPref": [
    [2, 2],     // 最喜欢书籍
    [8, 1],     // 喜欢游戏
    [9, 1],     // 喜欢音乐
    [3, 0],     // 普通玩具
    [4, 0],     // 普通电子产品
    [1, -1]     // 不喜欢食品
]
```

---

### 3.12 minigame

**类型**: `int`

**功能**: 角色关联的小游戏ID

**说明**: 某些角色有专属的小游戏

---

### 3.13 state

**类型**: `List<int>`

**功能**: 角色初始状态效果ID列表

**说明**: 状态效果对应 StateCfg 配置

---

### 3.14 order

**类型**: `int`

**功能**: 角色在UI中的显示顺序

**说明**: 数值越小，排序越靠前

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/PersonGrowCfg.cs`

```csharp
public class PersonGrowCfg
{
    public List<List<int>> ItemPref;    // 物品偏好
    public List<float> attr;            // 初始属性 [智商, 情商, 体魄]
    public List<int> className;         // 班级名称配置
    public int focusAttrId;             // 专注属性ID
    public List<List<float>> grow;      // 成长配置
    public int id;                      // 角色ID
    public List<int> items;             // 初始物品
    public int minigame;                // 小游戏ID
    public int order;                   // 排序
    public List<float> personalitys;    // 性格倾向
    public int speciality;              // 特长ID
    public List<int> state;             // 初始状态
    public List<int> studyRank;         // 学业排名
    public int trait;                   // 特性ID
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, PersonGrowCfg> PersonGrowCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadPersonGrowCfgMap()
{
    CfgMgr.LoadAsync<PersonGrowCfg>("Cfgs/" + LocalizationMgr.Lang + "/PersonGrowCfg", 
        delegate(Dictionary<int, PersonGrowCfg> _t)
    {
        Cfg.PersonGrowCfgMap = _t;
    });
}
```

### 4.3 角色初始化

**文件**: `Assembly-CSharp/TheEntity/Role.cs`

```csharp
public void Init(int _id)
{
    PersonGrowCfg personGrowCfg = Cfg.PersonGrowCfgMap[_id];
    
    // 1. 初始化基础属性
    this.SetAttr(1, personGrowCfg.attr[0], 0f);  // 智商
    this.SetAttr(2, personGrowCfg.attr[1], 0f);  // 情商
    this.SetAttr(4, personGrowCfg.attr[2], 0f);  // 体魄
    
    // 2. 初始化性格
    this.MainPersonalitys = new List<int>();
    for (int i = 0; i < 4; i++)
    {
        int idxA = i * 2;
        int idxB = i * 2 + 1;
        float valA = personGrowCfg.personalitys[idxA];
        float valB = personGrowCfg.personalitys[idxB];
        int idA = (idxA == 6) ? 109 : (101 + idxA);
        int idB = (idxB == 7) ? 110 : (101 + idxB);
        
        this.MainPersonalitys.Add((valA >= valB) ? idA : idB);
        this.SetAttr(idA, valA, 0f);
        this.SetAttr(idB, valB, 0f);
    }
    
    // 3. 初始化特长和特性
    this.Traits = new List<int> { personGrowCfg.speciality };
    this.Trait = personGrowCfg.trait;
    
    // 4. 初始化物品
    foreach (int itemId in personGrowCfg.items)
    {
        this.AddItem(itemId);
    }
}
```

### 4.4 成长值计算

**文件**: `Assembly-CSharp/Increase/IncreaserOther.cs`

```csharp
public override float GetValue()
{
    Role role = Singleton<RoleMgr>.Ins.GetRole();
    PersonGrowCfg personGrowCfg = Cfg.PersonGrowCfgMap[role.id];
    
    int gradeIndex = role.Grade - 1;
    List<List<float>> grow = personGrowCfg.grow;
    int index = Mathf.Min(grow.Count - 1, gradeIndex);
    
    return grow[index][this.id];  // this.id 对应属性索引
}
```

---

## 五、配置示例

### 示例1: 完整配置

```json
{
    "3": {
        "id": 3,
        "attr": [15.0, 22.0, 10.0],
        "items": [20320, 3901],
        "grow": [
            [2.0, 3.0, 1.0],
            [3.0, 4.0, 2.0],
            [4.0, 5.0, 3.0],
            [5.0, 6.0, 4.0],
            [6.0, 7.0, 5.0],
            [8.0, 8.0, 6.0],
            [12.0, 12.0, 7.0],
            [14.0, 14.0, 8.0],
            [16.0, 16.0, 9.0],
            [18.0, 18.0, 12.0],
            [22.0, 22.0, 15.0],
            [25.0, 25.0, 18.0]
        ],
        "personalitys": [10.0, 0.0, 10.0, 0.0, 0.0, 10.0, 20.0, 0.0],
        "speciality": 301,
        "trait": 300,
        "minigame": 20,
        "state": [],
        "focusAttrId": 1,
        "order": 5,
        "className": [1, 1, 9, 3],
        "studyRank": [4, 16, 26, 27],
        "ItemPref": [
            [2, 2], [8, 1], [9, 1], [3, 0],
            [4, 0], [5, 0], [6, 0], [7, 0],
            [10, 0], [11, 0], [1, -1]
        ]
    }
}
```

**解析**:
- 初始属性: 智商15、情商22、体魄10
- 性格: 外向(10)、直觉(10)、情感(10)、判断(20) → **ENFJ**
- 班级: 小学1班、初中1班、高中9班
- 物品偏好: 最喜欢书籍，喜欢游戏和音乐，不喜欢食品

---

### 示例2: 简单配置

```json
{
    "101": {
        "id": 101,
        "attr": [20.0, 15.0, 12.0],
        "grow": [
            [3.0, 2.0, 1.5],
            [4.0, 3.0, 2.0],
            [5.0, 4.0, 2.5],
            [6.0, 5.0, 3.0],
            [7.0, 6.0, 3.5],
            [9.0, 7.0, 4.0],
            [13.0, 10.0, 5.0],
            [15.0, 12.0, 6.0],
            [17.0, 14.0, 7.0],
            [20.0, 16.0, 10.0],
            [24.0, 20.0, 12.0],
            [28.0, 24.0, 15.0]
        ],
        "personalitys": [0.0, 10.0, 0.0, 10.0, 10.0, 0.0, 0.0, 10.0],
        "speciality": 302,
        "trait": 301,
        "focusAttrId": 1,
        "order": 10,
        "className": [2, 2, 1, 4],
        "studyRank": [3, 15, 25, 26],
        "items": [],
        "ItemPref": [[1, 1], [2, 2]],
        "state": []
    }
}
```

**解析**:
- 初始属性: 智商20、情商15、体魄12（高智商型）
- 性格: 内向(10)、感觉(10)、思维(10)、知觉(10) → **ISTP**

---

## 六、性格计算示例

### 示例: 计算性格类型

给定配置:
```json
"personalitys": [10.0, 0.0, 10.0, 0.0, 0.0, 10.0, 20.0, 0.0]
```

计算过程:

| 组 | 值A | 值B | 结果 |
|----|-----|-----|------|
| 外向/内向 | 10 | 0 | 外向 (E) |
| 直觉/感觉 | 10 | 0 | 直觉 (N) |
| 思维/情感 | 0 | 10 | 情感 (F) |
| 判断/知觉 | 20 | 0 | 判断 (J) |

**结果**: **ENFJ** (外向-直觉-情感-判断)

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/PersonGrowCfg.cs` | 配置类定义 |
| `Assembly-CSharp/Config/Cfg.cs` | 配置加载接口 |
| `Assembly-CSharp/TheEntity/Role.cs` | 角色实体类 |
| `Assembly-CSharp/RoleMgr.cs` | 角色管理器 |
| `Assembly-CSharp/Increase/IncreaserOther.cs` | 成长值计算 |
| `TextAsset/PersonGrowCfg.json` | 配置文件 |

---

## 八、快速参考

| 用途 | 配置示例 |
|------|----------|
| 初始属性 | `"attr": [15.0, 22.0, 10.0]` |
| 成长值 | `"grow": [[2.0,3.0,1.0], ...]` (12阶段) |
| 性格 | `"personalitys": [10.0,0.0,10.0,0.0,0.0,10.0,20.0,0.0]` |
| 班级 | `"className": [1,1,9,3]` [小,初,高(分班前),高(分班后)] |
| 学业排名 | `"studyRank": [4,16,26,27]` [小,初,高(分班前),高(分班后)] |
| 物品偏好 | `"ItemPref": [[2,2],[8,1],[1,-1]]` |
| 特长 | `"speciality": 301` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
