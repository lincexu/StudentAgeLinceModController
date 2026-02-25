# BookCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**BookCfg.json** 是游戏书籍系统的核心配置文件，定义了所有可阅读书籍的属性。

- **加载路径**: `Cfgs/{语言}/BookCfg.json`
- **存储位置**: `Cfg.BookCfgMap` (Dictionary<int, BookCfg>)
- **运行时数据**: `BookData` 类存储玩家的阅读进度

---

## 二、核心属性

| 属性 | 类型 | 代码特性 | 功能说明 |
|------|------|----------|----------|
| `id` | int | `[CfgProperty(8000)]` | 书籍唯一标识符 |
| `name` | string | `[CfgProperty(8001)]` | 书籍显示名称，如"《小夫子》" |
| `type` | int | `[CfgProperty(8003)]` | **书籍类型**：<br>• `3001` = 故事书（娱乐类）<br>• `3002` = 知识书（学习类） |
| `icon` | string | `[CfgProperty(8004)]` | 书籍图标路径，如 `"book/img_laofuzi"` |
| `capacity` | int | `[CfgProperty(8015)]` | **阅读容量（页数）**，如 40、80、150 |

---

## 三、效果与属性

### 3.1 effect（阅读效果）

**类型**: `List<List<float>>`

**格式**: `[[效果类型, 操作, 属性ID, 数值], ...]`

**示例**:
```json
"effect": [
    [1.0, 1.0, 0.0, 10.0]    // 效果类型1, 操作1, 属性0(精力), +10
]
```

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Effect, 8002, 0)]
public List<List<float>> effect;
```

### 3.2 itemTag（物品标签）

**类型**: `List<int>`

**功能**: 用于分类和筛选书籍

**常见值**:
| 值 | 含义 |
|----|------|
| `1` | 练习册 |
| `8` | 知识类 |
| `9` | 故事类 |

**示例**:
```json
"itemTag": [9]    // 故事类书籍
```

### 3.3 themes（主题标签）

**类型**: `List<int>`

**功能**: 用于**主题阅读分析**，相同主题的书籍可以组合分析获得额外效果

**示例**:
```json
"themes": [2, 5]    // 该书籍属于主题2和主题5
```

**相关配置**: `BookThemeCfg.json` 定义了各主题的效果

---

## 四、经济与交易

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `value` | float | **书籍价值**，用于送礼时计算好感度增加值 |
| `sell` | float | **出售价格**，在商店出售可获得的金币 |

**示例**:
```json
{
    "value": 1.0,    // 送礼价值
    "sell": 2.0      // 出售价格2金币
}
```

---

## 五、阅读条件

### 5.1 need（阅读需求）

**类型**: `List<float>`

**格式**: `[属性ID, 数值]`

**功能**: 阅读需要的属性条件

**示例**:
```json
"need": [1.0, 50.0]    // 需要属性1（智力）≥50
```

### 5.2 precondition（前置条件）

**类型**: `List<List<double>>`

**格式**: `[[条件类型, 操作符, 值], ...]`

**功能**: 解锁阅读的条件判定

**示例**:
```json
"precondition": [
    [10.0, -100.0],        // 回合限制
    [2.0, -4.0, 501.0]     // 属性2≥-4且拥有501
]
```

---

## 六、描述与对话

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `desc` | string | **书籍描述**，显示在物品详情中 |
| `talk` | string | **阅读完成对话**，读完后触发的角色对话 |

**示例**:
```json
{
    "desc": "一人购买，全班借阅",
    "talk": "挺好笑的，就是短了点"
}
```

---

## 七、预留属性

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `usingEffect` | `List<List<float>>` | **使用效果**（预留字段，当前未使用） |

---

## 八、代码实现详解

### 8.1 书籍数据创建（BagMgr.cs）

```csharp
public BookData AddBook(int _id, int _cnt = 1, bool _new = true, bool _record = true)
{
    BookCfg bookCfg = Cfg.BookCfgMap[_id];
    BookData bookData = new BookData
    {
        id = _id,
        cfgId = _id,
        cnt = _cnt,
        cur = 0f,                    // 当前阅读进度
        max = bookCfg.capacity,      // 最大进度来自BookCfg
        state = BookState.Normal,
        readEffector = new Effector(bookCfg.effect),  // 阅读效果
        precondtion = new Conditioner(bookCfg.precondition)  // 前置条件
    };
    // ...
    return bookData;
}
```

### 8.2 阅读效果获取（BagMgr.cs）

```csharp
public List<Effector> GetBookEffectors()
{
    List<Effector> list = new List<Effector>();
    foreach (KeyValuePair<int, BookData> keyValuePair in this.bookMap)
    {
        BookData value = keyValuePair.Value;
        BookCfg bookCfg = Cfg.BookCfgMap[value.id];
        
        // 根据书籍类型获取效果
        if (bookCfg.type == 3001)  // 故事书
        {
            // 娱乐类效果
        }
        else if (bookCfg.type == 3002)  // 知识书
        {
            // 学习类效果
        }
        
        if (value.readEffector != null)
        {
            list.Add(value.readEffector);
        }
    }
    return list;
}
```

### 8.3 主题分析（BookThemeView.cs）

```csharp
public void OnClickTheme(int _themeId)
{
    // 统计该主题下所有已读完的书籍
    List<BookData> list = new List<BookData>();
    foreach (KeyValuePair<int, BookData> keyValuePair in bagMgr.bookMap)
    {
        BookCfg bookCfg = Cfg.BookCfgMap[keyValuePair.Value.id];
        if (bookCfg.themes != null && bookCfg.themes.Contains(_themeId))
        {
            if (keyValuePair.Value.cur >= keyValuePair.Value.max)  // 已读完
            {
                list.Add(keyValuePair.Value);
            }
        }
    }
    // 根据收集的书籍数量给予奖励
}
```

### 8.4 出售书籍（BagMgr.cs）

```csharp
public int SellBook(int _id, int _cnt)
{
    BookCfg bookCfg = Cfg.BookCfgMap[_id];
    int num = (int)(bookCfg.sell * (float)_cnt);  // 使用BookCfg.sell计算价格
    this.AddItem(7, num);  // 添加金币
    this.DelBook(_id, _cnt);
    return num;
}
```

---

## 九、完整示例

### 示例1：故事书（《小夫子》）

```json
{
    "id": 3005,
    "name": "《小夫子》",
    "themes": [2, 5],              // 属于主题2和5
    "type": 3001,                  // 故事书
    "itemTag": [9],                // 故事类
    "capacity": 40,                // 40页
    "effect": [
        [1.0, 1.0, 0.0, 10.0]      // 精力+10
    ],
    "value": 1.0,                  // 送礼价值1
    "sell": 2.0,                   // 出售价格2
    "desc": "一人购买，全班借阅",
    "talk": "挺好笑的，就是短了点",
    "need": [],                    // 无阅读需求
    "precondition": [],            // 无前置条件
    "icon": "book/img_laofuzi",
    "usingEffect": []
}
```

### 示例2：知识书（《一万个为什么》）

```json
{
    "id": 3011,
    "name": "《一万个为什么》",
    "themes": [1, 5, 6],           // 多主题
    "type": 3002,                  // 知识书
    "itemTag": [8],                // 知识类
    "capacity": 40,
    "effect": [
        [1.0, 1.0, 1.0, 5.0]       // 智力+5
    ],
    "value": 1.0,
    "sell": 2.0,
    "desc": "数过了，没有1万个那么多",
    "talk": "原来是黑色素让头发变黑...",
    "need": [],
    "precondition": [],
    "icon": "book/img_yiwange"
}
```

### 示例3：练习册（《课后一练》）

```json
{
    "id": 3014,
    "name": "《课后一练》",
    "themes": [],                  // 无主题
    "type": 3002,                  // 知识书
    "itemTag": [1],                // 练习册
    "capacity": 40,
    "effect": [
        [1.0, 1.0, 302.0, 1.0]     // 属性302+1（可能是知识点）
    ],
    "value": 1.0,
    "sell": 2.0,
    "desc": "有英文版，英国学生都在用",
    "talk": "简单简单，难度一般~",
    "need": [],
    "icon": "book/img_kehouyilian"
}
```

---

## 十、相关配置

### 10.1 BookThemeCfg.json（主题配置）

```csharp
public class BookThemeCfg
{
    public int id;                    // 主题ID
    public string name;               // 主题名称
    public string desc;               // 主题描述
    public float page;                // 主题所需页数
    public List<List<float>> effect;  // 主题分析效果
}
```

### 10.2 BookData（运行时数据）

```csharp
public class BookData : BagData
{
    public float cur;                 // 当前阅读进度
    public float max;                 // 最大进度（来自BookCfg.capacity）
    public BookState state;           // 阅读状态
    public Effector readEffector;     // 阅读效果器
    public Conditioner precondtion;   // 前置条件
    public long lastReadTime;         // 最后阅读时间
}
```

---

## 十一、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/BookCfg.cs` | BookCfg 类定义 |
| `Assembly-CSharp/Config/BookThemeCfg.cs` | 主题配置类 |
| `Assembly-CSharp/BookData.cs` | 运行时书籍数据 |
| `Assembly-CSharp/BagMgr.cs` | 背包管理（书籍增删改查） |
| `Assembly-CSharp/View/TheAction/BookThemeView.cs` | 主题分析界面 |
| `TextAsset/BookCfg.json` | 书籍配置文件 |
| `TextAsset/BookThemeCfg.json` | 主题配置文件 |

---

## 十二、参考代码

### 加载接口（Cfg.cs）

```csharp
public static Dictionary<int, BookCfg> BookCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadBookCfgMap()
{
    CfgMgr.LoadAsync<BookCfg>("Cfgs/" + LocalizationMgr.Lang + "/BookCfg", 
        delegate(Dictionary<int, BookCfg> _t)
    {
        Cfg.BookCfgMap = _t;
    });
}
```

### 获取默认图标（CfgExtension.cs）

```csharp
public static string Icon(this BookCfg _cfg)
{
    if (_cfg.icon.NotEmpty())
        return _cfg.icon;
    return "book/img_star";  // 默认图标
}
```

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
