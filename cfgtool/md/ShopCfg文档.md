# ShopCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**ShopCfg.json** 是游戏的商店配置文件，定义了商店中所有可购买商品的属性、价格、解锁条件等。

- **加载路径**: `Cfgs/{语言}/ShopCfg`
- **存储位置**: `Cfg.ShopCfgMap` (Dictionary<int, ShopCfg>)
- **用途**: 配置商店商品的基础信息、价格、解锁条件、库存等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 商品唯一ID | `1001`, `2001` |
| `group` | int | 商品分组ID | `0`=不分组, `1`=同组商品 |
| `price` | float | 基础价格 | `15.0`, `50.5` |
| `next` | int | 下一个商品ID | `1002`, `0`=无 |
| `time` | int | 解锁时间 | `2001`=第1年第1回合 |
| `discountRound` | int | 可议价回合数 | `5`=第5回合后可议价 |
| `disappearTime` | int | 消失时间 | `2012`=第1年第12回合消失 |
| `type` | int | 商品类型 | `1`=消耗品, `2`=装备, `3`=书籍, `4`=持有物, `6`=服装, `7`=发型 |
| `maxcount` | int | 最大库存数量 | `10`, `-1`=无限 |
| `limcount` | int | 购买限制次数 | `1`=限购1次, `0`=不限 |
| `precondition` | List<List<double>> | 前置条件 | `[[4.0,1.0,100.0]]` |
| `probability` | float | 出现概率 | `1.0`=100%, `0.5`=50% |
| `buyTalk` | string | 购买时NPC对话 | `"谢谢惠顾！"` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 商品的唯一标识符

**说明**: 用于在游戏中唯一标识一个商品

---

### 3.2 group

**类型**: `int`

**功能**: 商品分组ID

| 值 | 含义 |
|----|------|
| `0` | 不分组，独立商品 |
| `>0` | 同组商品会一起出现，互斥选择 |

**说明**: 同组商品通常是一类商品的不同选项，如不同款式的衣服

---

### 3.3 price

**类型**: `float`

**功能**: 商品基础价格

**示例**:
```json
"price": 15.0
"price": 50.5
```

**说明**: 实际售价会受通货膨胀影响而逐年上涨

---

### 3.4 next

**类型**: `int`

**功能**: 购买此商品后解锁的下一个商品ID

| 值 | 含义 |
|----|------|
| `0` | 无后续商品 |
| `>0` | 购买后解锁对应ID的商品 |

**说明**: 用于实现商品的递进解锁，如先买初级装备才能买高级装备

---

### 3.5 time

**类型**: `int`

**功能**: 商品解锁的时间点

**格式**: `YYYYMM` 或回合数

**示例**:
```json
"time": 2001    // 第1年第1回合解锁
"time": 2009    // 第1年第9回合解锁
"time": 3001    // 第2年第1回合解锁
```

---

### 3.6 discountRound

**类型**: `int`

**功能**: 从第几回合开始可以议价

**示例**:
```json
"discountRound": 0    // 随时可以议价
"discountRound": 5    // 第5回合后才能议价
```

---

### 3.7 disappearTime

**类型**: `int`

**功能**: 商品消失的时间点

**示例**:
```json
"disappearTime": 0     // 不会消失
"disappearTime": 2012  // 第1年第12回合后消失
```

---

### 3.8 type ⭐重要

**类型**: `int`

**功能**: 商品类型

| type值 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `1` | **消耗品** | 使用后消失 | 食物、水果、划炮 |
| `2` | **装备/玩具** | 可装备使用 | 悠悠球、电子宠物、游戏机 |
| `3` | **书籍** | 阅读学习 | 教辅、名著、漫画 |
| `4` | **持有物/家具** | 放置在房间 | 书包、书架、台灯 |
| `6` | **服装** | 改变外观 | 衣服、鞋子、配饰 |
| `7` | **发型** | 改变发型 | 短发、长发、染发 |

---

### 3.9 maxcount

**类型**: `int`

**功能**: 商品最大库存数量

| 值 | 含义 |
|----|------|
| `-1` | 无限库存 |
| `0` | 不可购买 |
| `>0` | 具体库存数量 |

---

### 3.10 limcount

**类型**: `int`

**功能**: 玩家可购买的最大次数限制

| 值 | 含义 |
|----|------|
| `0` | 不限次数 |
| `>0` | 限购次数 |

**示例**:
```json
"limcount": 1    // 只能购买1次
"limcount": 3    // 最多购买3次
```

---

### 3.11 precondition ⭐重要

**类型**: `List<List<double>>`

**功能**: 购买前置条件

**格式**: `[[条件类型, 操作符, 值], ...]`

**常见条件类型**:

| 代码 | 条件类 | 说明 | 示例 |
|------|--------|------|------|
| `4.0` | ConditionerAttr | 属性条件 | `[4.0, 1.0, 100.0]` 智商≥100 |
| `7.0` | ConditionerRelation | 关系条件 | `[7.0, 1.0, 3.0, 50.0]` 与角色3关系≥50 |
| `14.0` | ConditionerLove | 恋爱条件 | `[14.0, 1.0, 101.0]` 与角色101是恋人 |

**示例**:
```json
"precondition": [
    [4.0, 1.0, 100.0],      // 智商≥100
    [7.0, 1.0, 3.0, 50.0]   // 与角色3关系≥50
]
```

---

### 3.12 probability

**类型**: `float`

**功能**: 商品出现的概率

| 值 | 含义 |
|----|------|
| `1.0` | 100%出现 |
| `0.5` | 50%概率出现 |
| `0.0` | 不出现 |

**说明**: 用于实现随机商品，如限时特卖、随机刷新商品

---

### 3.13 buyTalk

**类型**: `string`

**功能**: 购买时NPC的对话文本

**示例**:
```json
"buyTalk": "谢谢惠顾！"
"buyTalk": "这是本店的热销商品！"
```

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/ShopCfg.cs`

```csharp
public class ShopCfg
{
    public int id;                    // 商品ID
    public int group;                 // 分组ID
    public float price;               // 基础价格
    public int next;                  // 下一个商品ID
    public int time;                  // 解锁时间
    public int discountRound;         // 可议价回合
    public int disappearTime;         // 消失时间
    public int type;                  // 商品类型
    public int maxcount;              // 最大库存
    public int limcount;              // 购买限制
    public List<List<double>> precondition;  // 前置条件
    public float probability;         // 出现概率
    public string buyTalk;            // 购买对话
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, ShopCfg> ShopCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadShopCfgMap()
{
    CfgMgr.LoadAsync<ShopCfg>("Cfgs/" + LocalizationMgr.Lang + "/ShopCfg", 
        delegate(Dictionary<int, ShopCfg> _t)
    {
        Cfg.ShopCfgMap = _t;
    });
}
```

### 4.3 商店数据管理

**文件**: `Assembly-CSharp/ShopData.cs`

```csharp
public class ShopData : BagData
{
    public float FinalPrize
    {
        get
        {
            return this.Prize * Singleton<ShopMgr>.Ins.GetDiscount() * this.discount;
        }
    }

    public float Prize { get; private set; }
    public bool canBargin;
    public float discount = 1f;
    public bool showInThisYear;
    public bool canRemove = true;
    
    // 刷新价格（考虑通货膨胀）
    public void RefreshPrize()
    {
        ShopCfg shopCfg = Cfg.ShopCfgMap[this.id];
        float num = Mathf.Pow(1f + Singleton<ShopMgr>.Ins.Inflation, 
            (float)(Singleton<RoundMgr>.Ins.GetYear() - shopCfg.time));
        float num2 = shopCfg.price * num;
        float num3 = Mathf.Floor(num2);
        this.Prize = num3 + ((num2 - num3 < 0.5f) ? 0f : 0.5f);
        this.showInThisYear = true;
    }
}
```

### 4.4 商店管理器

**文件**: `Assembly-CSharp/ShopMgr.cs`

```csharp
public class ShopMgr : BaseMgr<ShopMgr>
{
    public ShopMgr()
    {
        // 从PersonConstCfg读取通货膨胀率 (ID=301)
        this.Inflation = Cfg.PersonConstCfgMap[301].value;
    }

    public float Inflation { get; private set; }
    
    // 刷新商店商品
    public void RefreshShopDatas(bool _init = false)
    {
        // 实际实现涉及复杂的分组、概率、条件检查逻辑
        // 最终会为每个符合条件的商品创建ShopData并调用RefreshPrize()
    }
    
    // 购买商品
    public bool Buy(int _shopId, int _count)
    {
        // 实际购买逻辑...
    }
    
    // 议价
    public void Bargin(int _shopId)
    {
        // 议价逻辑...
    }
}
```

### 4.5 通货膨胀机制

**实现原理**:

```
实际价格 = 基础价格 × (1 + 通货膨胀率)^(当前年份 - 解锁年份)

其中：
- 通货膨胀率从 PersonConstCfgMap[301].value 读取
- 年份计算基于 ShopCfg.time 字段
```

**真实代码** (`ShopData.cs`):

```csharp
public void RefreshPrize()
{
    ShopCfg shopCfg = Cfg.ShopCfgMap[this.id];
    
    // 计算通货膨胀倍数
    float num = Mathf.Pow(1f + Singleton<ShopMgr>.Ins.Inflation, 
        (float)(Singleton<RoundMgr>.Ins.GetYear() - shopCfg.time));
    
    // 应用通货膨胀
    float num2 = shopCfg.price * num;
    
    // 向下取整
    float num3 = Mathf.Floor(num2);
    
    // 小数部分四舍五入到0.5
    this.Prize = num3 + ((num2 - num3 < 0.5f) ? 0f : 0.5f);
    
    this.showInThisYear = true;
}
```

**通货膨胀率来源** (`ShopMgr.cs`):

```csharp
public ShopMgr()
{
    // ID 301 是通货膨胀率的常量定义
    this.Inflation = Cfg.PersonConstCfgMap[301].value;
}

public float Inflation { get; private set; }
```

**PersonConstDefine.cs** 中的常量定义:

```csharp
public const int Inflation = 301;  // 通货膨胀率配置ID
```

---

## 五、配置示例

### 示例1: 基础消耗品

```json
{
    "1001": {
        "id": 1001,
        "group": 0,
        "price": 5.0,
        "next": 0,
        "time": 2001,
        "discountRound": 0,
        "disappearTime": 0,
        "type": 1,
        "maxcount": 99,
        "limcount": 0,
        "precondition": [],
        "probability": 1.0,
        "buyTalk": "谢谢惠顾！"
    }
}
```

---

### 示例2: 递进解锁装备

```json
{
    "2001": {
        "id": 2001,
        "group": 0,
        "price": 50.0,
        "next": 2002,
        "time": 2005,
        "discountRound": 3,
        "disappearTime": 0,
        "type": 2,
        "maxcount": 1,
        "limcount": 1,
        "precondition": [[4.0, 1.0, 50.0]],
        "probability": 1.0,
        "buyTalk": "这是初级装备，升级后更强大！"
    },
    "2002": {
        "id": 2002,
        "group": 0,
        "price": 150.0,
        "next": 0,
        "time": 9999,
        "discountRound": 5,
        "disappearTime": 0,
        "type": 2,
        "maxcount": 1,
        "limcount": 1,
        "precondition": [],
        "probability": 1.0,
        "buyTalk": "这是高级装备！"
    }
}
```

**说明**: 购买2001后解锁2002，2002初始时间为9999（不可购买），只有购买2001后才解锁

---

### 示例3: 分组服装

```json
{
    "6001": {
        "id": 6001,
        "group": 6,
        "price": 80.0,
        "next": 0,
        "time": 3001,
        "discountRound": 0,
        "disappearTime": 0,
        "type": 6,
        "maxcount": 1,
        "limcount": 1,
        "precondition": [],
        "probability": 1.0,
        "buyTalk": "这件衣服很适合你！"
    },
    "6002": {
        "id": 6002,
        "group": 6,
        "price": 85.0,
        "next": 0,
        "time": 3001,
        "discountRound": 0,
        "disappearTime": 0,
        "type": 6,
        "maxcount": 1,
        "limcount": 1,
        "precondition": [],
        "probability": 1.0,
        "buyTalk": "这件衣服很时尚！"
    }
}
```

**说明**: 6001和6002同组，玩家只能选择购买其中一件

---

### 示例4: 限时特卖商品

```json
{
    "3001": {
        "id": 3001,
        "group": 0,
        "price": 100.0,
        "next": 0,
        "time": 2010,
        "discountRound": 0,
        "disappearTime": 2015,
        "type": 3,
        "maxcount": 5,
        "limcount": 2,
        "precondition": [],
        "probability": 0.8,
        "buyTalk": "这是限时特卖商品！"
    }
}
```

**说明**: 第10回合出现，第15回合后消失，80%概率出现，限购2次

---

### 示例5: 关系限定商品

```json
{
    "4001": {
        "id": 4001,
        "group": 0,
        "price": 200.0,
        "next": 0,
        "time": 2001,
        "discountRound": 5,
        "disappearTime": 0,
        "type": 4,
        "maxcount": 1,
        "limcount": 1,
        "precondition": [[7.0, 1.0, 101.0, 80.0]],
        "probability": 1.0,
        "buyTalk": "这是小纯推荐的好物！"
    }
}
```

**说明**: 只有与小纯关系≥80时才会出现

---

## 六、价格计算机制

### 通货膨胀公式

```
实际价格 = 基础价格 × (1 + 通货膨胀率)^年数

其中：
- 通货膨胀率 = 5% (0.05)
- 年数 = 当前年份 - 解锁年份
```

**示例**:
```
基础价格: 100元
解锁时间: 第1年 (2001)
当前时间: 第3年 (3001)
通货膨胀率: 5%

实际价格 = 100 × (1 + 0.05)^2
         = 100 × 1.1025
         = 110.25
         ≈ 110.5 (四舍五入到0.5)
```

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/ShopCfg.cs` | 商店配置类 |
| `Assembly-CSharp/Config/Cfg.cs` | 配置加载接口 |
| `Assembly-CSharp/ShopMgr.cs` | 商店管理器 |
| `Assembly-CSharp/ShopData.cs` | 商店数据类 |
| `Assembly-CSharp/View/Shop/ShopView.cs` | 商店界面 |
| `Assembly-CSharp/View/Shop/ClothShopView.cs` | 服装店界面 |
| `Assembly-CSharp/View/Shop/HairShopView.cs` | 理发店界面 |
| `TextAsset/ShopCfg.json` | 商店配置文件 |

---

## 八、快速参考

| 用途 | 配置示例 |
|------|----------|
| 基础商品 | `{"id": 1001, "price": 10.0, "type": 1}` |
| 递进解锁 | `"next": 1002` |
| 分组商品 | `"group": 6` |
| 限时商品 | `"time": 2010, "disappearTime": 2015` |
| 可议价 | `"discountRound": 5` |
| 属性条件 | `"precondition": [[4.0, 1.0, 100.0]]` |
| 关系条件 | `"precondition": [[7.0, 1.0, 3.0, 50.0]]` |
| 随机出现 | `"probability": 0.5` |
| 限购 | `"limcount": 1` |
| 服装 | `"type": 6` |
| 发型 | `"type": 7` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
