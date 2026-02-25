# ItemCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**ItemCfg.json** 是游戏的物品配置文件，定义了所有物品的属性和效果。

- **加载路径**: `Cfgs/{语言}/ItemCfg.json`
- **加载方式**: Addressables + MessagePack 序列化
- **存储位置**: `Cfg.ItemCfgMap` (Dictionary<int, ItemCfg>)

---

## 二、物品类型 (type)

| type值 | 类型 | 说明 |
|--------|------|------|
| `1` | 消耗品 | 可使用的物品，如食物、道具 |
| `2` | 珍视物品 | 可装备的物品，提供属性加成 |
| `3` | 书籍 | 可阅读的物品 |
| `4` | 工具 | 持有即可生效的物品 |

---

## 三、核心属性

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `id` | 物品唯一ID | `2101` |
| `name` | 物品名称 | `"七巧板"` |
| `type` | 物品类型 | `1`=消耗品, `2`=珍视物品, `3`=书籍, `4`=工具 |
| `icon` | 图标路径 | `"item/img_qqb"` |
| `desc` | 物品描述 | `"看我来给你拼个狐狸"` |

---

## 四、效果属性

### 4.1 effect（装备效果）

**适用类型**: `type = 2` (珍视物品) 或 `type = 4` (工具)

**格式**: `[[效果类型, 目标, 属性ID, 数值], ...]`

**示例**:
```json
"effect": [
    [1.0, 11.0, 1.0, 0.5]   // 效果类型1, 目标11, 属性1+0.5
]
```

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Effect, 8032, 0)]
[CfgPropertyDependency("type", new object[] { 2, 4 })]
public List<List<float>> effect;
```

### 4.2 usingEffect（使用效果）

**适用类型**: `type = 1` (消耗品)

**格式**: `[[效果类型, 目标, 属性ID, 数值], ...]`

**示例**:
```json
"usingEffect": [
    [1.0, 1.0, 0.0, 7.0]    // 效果类型1, 目标1, 属性0+7
]
```

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Effect, 8033, 0)]
[CfgPropertyDependency("type", new object[] { 1 })]
public List<List<float>> usingEffect;
```

---

## 五、经济属性

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `value` | 购买价格 | `-1.0`=不可购买, `1.0`=价格1 |
| `sell` | 出售价格 | `-1.0`=不可出售, `2.0`=价格2 |

---

## 六、堆叠与操作

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `maxcount` | 最大堆叠数量 | `1`=不可堆叠, `10`=最大10个, `99`=最大99个 |
| `btn` | 操作按钮文本 | `"吃"`, `"分享"`, `"刮开"`, `"打碎"`, `null`=无按钮 |

---

## 七、分类与标签

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `subType` | 子类型 | `0`=默认, `1001`=食物类 |
| `itemTag` | 物品标签ID列表 | `[1, 2]` 用于NPC喜好分类 |

**常见 itemTag 值**:
| Tag值 | 含义 |
|-------|------|
| `1` | 智力类 |
| `2` | 娱乐类 |
| `5` | 日记/记录类 |
| `6` | 创意类 |
| `7` | 工具类 |
| `41-44` | 四季水果 |

---

## 八、解锁条件

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `precondition` | 前置解锁条件 | `[[条件类型, 操作符, 值], ...]` |

**示例**:
```json
"precondition": [
    [1.0, 250.0],        // 属性1≥250
    [7.0, 0.0]           // 属性7>0
]
```

---

## 九、其他属性

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `talkId` | 关联对话/事件ID | `0`=无, `10001011`=特定对话 |
| `rarity` | 稀有度 | 数值越高越稀有 |
| `sex` | 性别限制 | `0`=通用, `1`=男, `2`=女 |
| `needDLC` | 所需DLC | `0`=基础版, `1`=DLC1 |
| `clothType` | 服装类型 | 用于服装类物品 |

---

## 十、完整示例

### 示例1: 珍视物品（七巧板）

```json
{
    "id": 2101,
    "name": "七巧板",
    "type": 2,                  // 珍视物品
    "btn": null,                // 无操作按钮
    "subType": 0,
    "itemTag": [1, 2],          // 智力+娱乐标签
    "maxcount": 1,              // 不可堆叠
    "effect": [
        [1.0, 11.0, 1.0, 0.5]   // 装备效果：属性1+0.5
    ],
    "usingEffect": [],          // 无使用效果
    "value": 1.0,               // 购买价格1
    "sell": 2.0,                // 出售价格2
    "precondition": [],         // 无解锁条件
    "icon": "item/img_qqb",
    "desc": "看我来给你拼个狐狸",
    "talkId": 0
}
```

### 示例2: 消耗品（一盒草莓）

```json
{
    "id": 41,
    "name": "一盒草莓",
    "type": 1,                  // 消耗品
    "btn": "吃",               // 操作按钮"吃"
    "subType": 1001,            // 食物子类型
    "itemTag": [41],            // 春季水果标签
    "maxcount": 2,              // 最大堆叠2个
    "effect": [],               // 无装备效果
    "usingEffect": [
        [1.0, 1.0, 0.0, 7.0]    // 使用效果：属性0+7
    ],
    "value": 1.0,
    "sell": 2.5,
    "precondition": [],
    "icon": "item/img_caomei",
    "desc": "新鲜的草莓，春季佳果，换季时会腐烂",
    "talkId": 0
}
```

### 示例3: 工具（工具箱）

```json
{
    "id": 2,
    "name": "工具箱",
    "type": 4,                  // 工具
    "btn": null,
    "subType": 0,
    "itemTag": [7],             // 工具标签
    "maxcount": 1,
    "effect": [],               // 工具通常无effect，持有即生效
    "usingEffect": [],
    "value": -1.0,              // 不可购买
    "sell": -1.0,               // 不可出售
    "precondition": [],
    "icon": "item/img_gjx",
    "desc": null,
    "talkId": 0
}
```

### 示例4: 消耗品带对话（存钱罐）

```json
{
    "id": 1001,
    "name": "存钱罐",
    "type": 1,
    "btn": "打碎",             // 操作按钮"打碎"
    "subType": 0,
    "itemTag": [],
    "maxcount": 1,
    "effect": [],
    "usingEffect": [],          // 效果在talkId关联的对话中定义
    "value": 3.0,
    "sell": 4.0,
    "precondition": [],
    "icon": "item/img_cqg",
    "desc": "从来就没装满过",
    "talkId": 10009001          // 关联对话ID
}
```

---

## 十一、代码实现

### 加载接口 (Cfg.cs)

```csharp
public static Dictionary<int, ItemCfg> ItemCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadItemCfgMap()
{
    CfgMgr.LoadAsync<ItemCfg>("Cfgs/" + LocalizationMgr.Lang + "/ItemCfg", 
        delegate(Dictionary<int, ItemCfg> _t)
    {
        Cfg.ItemCfgMap = _t;
    });
}
```

### 运行时数据 (ItemData.cs)

```csharp
public class ItemData : BagData
{
    public Effector useEffector;        // 使用效果器
    public Effector equipEffector;      // 装备效果器
    public bool equiped;                // 是否已装备
    public List<ulong> effectUids;      // 效果UID列表
    public int cd;                      // 冷却时间
    public EquipType equipType;         // 装备类型
    
    public bool IsEquipItem() => this.type == 2;
    public bool IsUsableItem() => this.type == 1;
}
```

### 扩展方法 (CfgExtension.cs)

```csharp
public static string GetItemIcon(this ItemCfg _cfg)
{
    if (string.IsNullOrEmpty(_cfg.icon))
        return "item/img_item";  // 默认图标
    return _cfg.icon;
}
```

---

## 十二、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/ItemCfg.cs` | ItemCfg 类定义 |
| `Assembly-CSharp/ItemData.cs` | 物品运行时数据 |
| `Assembly-CSharp/ItemTypeCfg.json` | 物品类型配置 |
| `TextAsset/ItemCfg.json` | 物品配置文件 |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
