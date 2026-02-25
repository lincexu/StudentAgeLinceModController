# HonorShopCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**HonorShopCfg.json** 是游戏的"荣誉商店"配置文件，定义了所有可用荣誉点数解锁的商品。

- **加载路径**: `Cfgs/{语言}/HonorShopCfg.json`
- **存储位置**: `Cfg.HonorShopCfgMap` (Dictionary<int, HonorShopCfg>)
- **数据存储**: `GlobalModel.honors` (已解锁商品)

---

## 二、核心属性

| 属性 | 类型 | 功能说明 |
|------|------|----------|
| `id` | int | 商品唯一标识符 |
| `name` | string | 商品名称（如"转变心态"、"细腻的小雅"） |
| `order` | int | 显示排序顺序（越小越靠前） |
| `desc` | string | 商品功能描述 |
| `cost` | int | 解锁所需的荣誉点数 |
| `type` | int | **商品类型**：<br>• `0` = 普通道具/机制<br>• `1` = 天赋点数<br>• `2` = 服装解锁 |
| `group` | int | **分组ID**（同组商品互斥激活，0=不分组） |
| `dlc` | int | **DLC标识**：<br>• `0` = 基础游戏<br>• `1` = DLC1 |
| `effect` | List<List<float>> | **效果参数**（根据type不同格式不同） |

---

## 三、effect 格式详解

### 3.1 type=0（普通道具/机制）

**角色特质解锁格式**:
```json
"effect": [[20.0, 60.0, 角色ID, 效果ID]]
```
- `[20.0, 60.0, 105.0, 10503.0]` = 解锁肖清雅(105)的特质(10503)

**跳过小游戏格式**:
```json
"effect": [[100.0, 30.0, 1.0]]
```

**百合剧情解锁格式**:
```json
"effect": [[999.0, 剧情ID]]
```

### 3.2 type=1（天赋点数）

**格式**:
```json
"effect": [[100.0, 2.0, 增加点数]]
```

**示例**:
```json
"effect": [[100.0, 2.0, 2.0]]  // 天赋点数+2
```

### 3.3 type=2（服装解锁）

**格式**:
```json
"effect": [[60.0, 8.0, 11.0, 角色ID, 服装ID]]
```

**示例**:
```json
"effect": [[60.0, 8.0, 11.0, 105.0, 2501.0]]  // 解锁肖清雅(105)的演出服(2501)
```

---

## 四、商品ID分段规律

| ID范围 | 类型 | 说明 |
|--------|------|------|
| 201-204 | 人格机制 | 转变心态、哲学思辨等 |
| 301-304 | 商店商品 | 解锁商店特殊商品 |
| 601-610 | 角色特质 | 解锁角色特殊特质 |
| 701-702 | 游戏机制 | 跳过小游戏、铁人三项 |
| 801-833 | 服装 | 角色服装解锁（含DLC） |
| 901-903 | 剧情 | 百合剧情解锁 |
| 949-950 | 难度 | 露一手、动真格 |
| 1001-1010 | 天赋 | 天赋点数购买 |
| 1101-1106 | 属性 | 初始属性加成 |

---

## 五、系统核心代码

### 5.1 解锁商品（购买）

```csharp
public void UnlockHonor(int _id)
{
    HonorShopCfg honorShopCfg = Cfg.HonorShopCfgMap[_id];
    
    // 检查荣誉点数
    if ((ulong)this.model.honor < (ulong)((long)honorShopCfg.cost))
        return;
    
    // 检查是否已解锁
    if (this.model.honors.ContainsKey(_id))
        return;
    
    // 扣除荣誉点数
    this.UpdateHonor((float)(-(float)honorShopCfg.cost));
    
    // 添加到已解锁列表
    this.model.honors.Add(_id, new GlobalHonorData
    {
        activated = false,
        version = 1
    });
    
    // 自动激活
    this.ActivateHonor(_id);
}
```

### 5.2 激活/取消激活

```csharp
public void ActivateHonor(int _id)
{
    // 切换激活状态
    this.model.honors[_id].activated = !this.model.honors[_id].activated;
    
    HonorShopCfg honorShopCfg = Cfg.HonorShopCfgMap[_id];
    
    // 处理互斥分组
    if (this.model.honors[_id].activated && honorShopCfg.group > 0)
    {
        foreach (var pair in Cfg.HonorShopCfgMap)
        {
            // 同组其他商品取消激活
            if (pair.Value.group == honorShopCfg.group 
                && pair.Key != _id 
                && this.model.honors.ContainsKey(pair.Key))
            {
                this.model.honors[pair.Key].activated = false;
            }
        }
    }
}
```

### 5.3 获取商品状态

```csharp
public int GetHonorState(int _id)
{
    if (!this.model.honors.ContainsKey(_id))
        return 0;  // 未解锁
    if (this.model.honors[_id].activated)
        return 2;  // 已激活
    return 1;      // 已解锁未激活
}
```

### 5.4 计算天赋点数

```csharp
public uint GetTalent()
{
    float num = 0f;
    foreach (var pair in this.model.honors)
    {
        // 只计算已激活且type=1的商品
        if (pair.Value.activated 
            && Cfg.HonorShopCfgMap[pair.Key].type == 1)
        {
            var effect = Cfg.HonorShopCfgMap[pair.Key].effect;
            if (effect[0][0] == 100f && effect[0][1] == 2f)
            {
                num += effect[0][2];  // 累加天赋点数
            }
        }
    }
    return (uint)num;
}
```

---

## 六、完整配置示例

### 示例1：人格机制（转变心态）

```json
{
    "201": {
        "id": 201,
        "name": "转变心态",
        "order": 1,
        "desc": "解锁转变心态功能",
        "cost": 50,
        "type": 0,
        "group": 0,
        "dlc": 0,
        "effect": []
    }
}
```

### 示例2：角色特质（细腻的小雅）

```json
{
    "601": {
        "id": 601,
        "name": "细腻的小雅",
        "order": 10,
        "desc": "肖清雅初始拥有细腻特质",
        "cost": 100,
        "type": 0,
        "group": 0,
        "dlc": 0,
        "effect": [[20.0, 60.0, 105.0, 10503.0]]
    }
}
```

### 示例3：天赋点数

```json
{
    "1001": {
        "id": 1001,
        "name": "天赋异禀",
        "order": 50,
        "desc": "初始天赋点数+2",
        "cost": 200,
        "type": 1,
        "group": 0,
        "dlc": 0,
        "effect": [[100.0, 2.0, 2.0]]
    }
}
```

### 示例4：服装解锁

```json
{
    "801": {
        "id": 801,
        "name": "演出服-小雅",
        "order": 100,
        "desc": "解锁肖清雅的演出服",
        "cost": 150,
        "type": 2,
        "group": 0,
        "dlc": 0,
        "effect": [[60.0, 8.0, 11.0, 105.0, 2501.0]]
    }
}
```

### 示例5：互斥分组（难度选择）

```json
{
    "949": {
        "id": 949,
        "name": "露一手",
        "order": 200,
        "desc": "游戏难度降低",
        "cost": 0,
        "type": 0,
        "group": 1,          // 分组1
        "dlc": 0,
        "effect": []
    },
    "950": {
        "id": 950,
        "name": "动真格",
        "order": 201,
        "desc": "游戏难度增加",
        "cost": 0,
        "type": 0,
        "group": 1,          // 同分组1，互斥
        "dlc": 0,
        "effect": []
    }
}
```

### 示例6：DLC商品

```json
{
    "831": {
        "id": 831,
        "name": "DLC专属服装",
        "order": 150,
        "desc": "DLC专属服装解锁",
        "cost": 200,
        "type": 2,
        "group": 0,
        "dlc": 1,            // 需要DLC1
        "effect": [[60.0, 8.0, 11.0, 105.0, 2601.0]]
    }
}
```

---

## 七、数据存储结构

### GlobalHonorData（已解锁商品数据）

```csharp
public class GlobalHonorData
{
    public bool activated;   // 是否已激活
    public int version;      // 数据版本号（当前为1）
}
```

### GlobalModel（全局数据）

```csharp
public class GlobalModel : BaseModel
{
    public uint honor;                           // 当前荣誉点数
    public uint maxScore;                        // 最高分数
    public Dictionary<int, GlobalHonorData> honors;  // 已解锁商品
}
```

---

## 八、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/HonorShopCfg.cs` | HonorShopCfg 类定义 |
| `Assembly-CSharp/GlobalMgr.cs` | 荣誉商店核心逻辑 |
| `Assembly-CSharp/GlobalHonorData.cs` | 已解锁商品数据 |
| `Assembly-CSharp/GlobalModel.cs` | 全局数据模型 |
| `Assembly-CSharp/View/Main/HonorShopView.cs` | 荣誉商店UI |
| `TextAsset/HonorShopCfg.json` | 配置文件 |

---

## 九、使用流程

```
1. 玩家完成游戏 → 获得荣誉点数
        ↓
2. 进入荣誉商店 → 查看所有商品
        ↓
3. 点击购买 → 扣除荣誉点数 → 解锁商品
        ↓
4. 激活/取消激活 → 同组商品互斥
        ↓
5. 新建游戏 → 已激活的效果生效
```

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
