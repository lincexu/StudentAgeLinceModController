# KZoneAvatarCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**KZoneAvatarCfg.json** 是游戏的 KZone（类似QQ空间）系统的头像配置文件。

- **加载路径**: `Cfgs/{语言}/KZoneAvatarCfg`
- **存储位置**: `Cfg.KZoneAvatarCfgMap` (Dictionary<int, KZoneAvatarCfg>)
- **用途**: 配置 KZone 个人资料中可选择的头像

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 头像唯一ID | `1`, `101`, `1001` |
| `icon` | string | 头像图片路径 | `"kzone_head/img_dog"` |
| `state` | int | 状态标记（预留） | `0` = 默认状态 |
| `type` | int | 头像类型 | `0`=普通, `1`=恋人/特殊 |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 头像的唯一标识符

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8000, 8999)]
public int id;
```

**注意**: ID 范围 1-1008，部分不连续

---

### 3.2 icon

**类型**: `string`

**功能**: 头像图片的资源路径

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Image, 8004, 8970)]
public string icon;
```

**格式**: `kzone_head/图片名`

**示例**:
| icon值 | 说明 |
|--------|------|
| `"kzone_head/img_dog"` | 小狗头像 |
| `"kzone_head/img_cat"` | 小猫头像 |
| `"kzone_head/img_food_sandwich"` | 三明治头像 |
| `"kzone_head/img_ghost"` | 幽灵头像 |

---

### 3.3 state

**类型**: `int`

**功能**: 状态标记（当前预留，所有条目均为0）

**可能用途**:
- `0` = 默认/可用
- `1` = 锁定
- `2` = 限时

---

### 3.4 type ⭐重要

**类型**: `int`

**功能**: 头像类型，决定头像的使用场景

| type值 | 含义 | 使用场景 |
|--------|------|----------|
| `0` | 普通系统头像 | 所有玩家可用 |
| `1` | 恋人/特殊头像 | 恋人系统专用 |

**代码中的应用**（KzoneProfileView.cs）:
```csharp
// 判断是否显示为情侣头像
if (kzoneAvatarCfg.type == 1)
{
    // 恋人专属头像处理
    ShowCoupleAvatarEffect();
}
```

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/KZoneAvatarCfg.cs`

```csharp
[CfgClass(25060401UL, 8506)]
public class KZoneAvatarCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999)]
    public int id;

    [CfgProperty(CfgPropertyType.Image, 8004, 8970)]
    public string icon;

    public int state;
    public int type;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, KZoneAvatarCfg> KZoneAvatarCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadKZoneAvatarCfgMap()
{
    CfgMgr.LoadAsync<KZoneAvatarCfg>("Cfgs/" + LocalizationMgr.Lang + "/KZoneAvatarCfg", 
        delegate(Dictionary<int, KZoneAvatarCfg> _t)
    {
        Cfg.KZoneAvatarCfgMap = _t;
    });
}
```

### 4.3 使用场景

#### ① 头像显示（KZoneData.cs）
```csharp
if (Cfg.PersonCfgMap.TryGetValue(_id, out personCfg) && 
    Cfg.KZoneAvatarCfgMap.TryGetValue(personCfg.kzoneHeadId, out kzoneAvatarCfg))
{
    _icon.SetTextureUrl(kzoneAvatarCfg.icon, true);
}
```

#### ② 个人资料设置（KzoneProfileView.cs）
```csharp
// 系统头像列表
foreach (var cfg in Cfg.KZoneAvatarCfgMap.Values)
{
    if (cfg.type == 0)  // 普通头像
        systemAvatarList.Add(cfg);
    else if (cfg.type == 1)  // 恋人头像
        coupleAvatarList.Add(cfg);
}
```

#### ③ 角色配置关联（PersonCfg.cs）
```csharp
public class PersonCfg
{
    public int kzoneHeadId;  // 关联到 KZoneAvatarCfg.id
}
```

#### ④ MOD编辑器支持（ModPersonEditView.cs）
```csharp
// 支持 MOD 自定义 KZone 头像配置
// 加载路径: {modRoot}/Cfgs/{语言}/KZoneAvatarCfg.json
```

---

## 五、配置示例

### 示例1: 普通头像

```json
{
    "1": {
        "id": 1,
        "type": 0,
        "state": 0,
        "icon": "kzone_head/img_dog"
    },
    "2": {
        "id": 2,
        "type": 0,
        "state": 0,
        "icon": "kzone_head/img_cat"
    }
}
```

### 示例2: 恋人专属头像

```json
{
    "101": {
        "id": 101,
        "type": 1,
        "state": 0,
        "icon": "kzone_head/img_food_sandwich"
    },
    "102": {
        "id": 102,
        "type": 1,
        "state": 0,
        "icon": "kzone_head/img_ghost"
    }
}
```

---

## 六、数据统计

- **总数**: 108 个头像配置
- **ID范围**: 1 - 1008（部分不连续）
- **type=0**: 普通头像（动物、风景、抽象图案等）
- **type=1**: 特殊头像（食物、宠物、幽灵等，主要用于恋人系统）

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/KZoneAvatarCfg.cs` | 配置类定义 |
| `Assembly-CSharp/KZoneData.cs` | KZone数据管理 |
| `Assembly-CSharp/View/TheAction/KzoneProfileView.cs` | 个人资料界面 |
| `Assembly-CSharp/Config/PersonCfg.cs` | 角色配置（关联kzoneHeadId） |
| `TextAsset/KZoneAvatarCfg.json` | 配置文件 |

---

## 八、快速参考

| 用途 | 配置示例 |
|------|----------|
| 添加普通头像 | `{"id": 1001, "type": 0, "state": 0, "icon": "kzone_head/img_new"}` |
| 添加恋人头像 | `{"id": 1002, "type": 1, "state": 0, "icon": "kzone_head/img_couple"}` |
| 图片路径格式 | `kzone_head/图片名`（不需要扩展名） |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
