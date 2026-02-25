# BgCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**BgCfg.json** 是游戏的背景配置文件，定义了所有场景背景的图片、音效、服装等信息。

- **加载路径**: `Cfgs/{语言}/BgCfg.json`
- **存储位置**: `Cfg.BgCfgMap` (Dictionary<int, BgCfg>)
- **主要用途**: 对话场景、地图场景的背景显示

---

## 二、属性详解

### 2.1 基础属性

| Key | 类型 | 代码特性 | 功能说明 |
|-----|------|----------|----------|
| `id` | int | `[CfgProperty(8000)]` | 背景唯一标识符 |
| `name` | string | `[CfgProperty(8001)]` | 背景名称（如"客厅"、"学校走廊"） |
| `url` | string | `[CfgProperty(8004)]` | **背景图片路径**（如 `bg/img_keting`） |

### 2.2 音效属性

| Key | 类型 | 功能说明 |
|-----|------|----------|
| `audio` | int | **场景音效ID**，进入该背景时播放（0=无音效） |

### 2.3 服装属性

| Key | 类型 | 功能说明 |
|-----|------|----------|
| `cloth` | `List<int>` | **适用的服装ID列表**，在该背景下角色可穿着的服装 |

### 2.4 学段切换属性

| Key | 类型 | 功能说明 |
|-----|------|----------|
| `gaozhongCond` | `List<List<double>>` | **高中背景切换条件**，满足条件时切换到高中背景 |
| `gaozhongUrl` | int | **高中背景ID**，指向另一个BgCfg的id（0=无高中背景） |

---

## 三、属性详细说明

### 3.1 url（背景图片路径）

**格式**: 资源路径字符串

**示例**:
```json
"url": "bg/img_keting"      // 客厅背景
"url": "bg/img_xxzoulang"   // 学校走廊背景
"url": "bg/img_zuqiuchang"  // 足球场背景
```

**代码获取**:
```csharp
// CfgExtension.cs
public static string GetBgUrl(this BgCfg _cfg, int _gradeState = -1)
{
    string url;
    // 高中学段且满足条件时，使用高中背景
    if (_gradeState > 0 && _cfg.gaozhongUrl > 0)
    {
        url = Cfg.BgCfgMap[_cfg.gaozhongUrl].url;
    }
    else
    {
        url = _cfg.url;
    }
    return url;
}
```

---

### 3.2 audio（场景音效）

**格式**: 音效ID整数

**示例**:
```json
"audio": 0        // 无音效
"audio": 30012    // 学校走廊音效
"audio": 30007    // 足球场音效
"audio": 30017    // 户外音效
```

**代码使用**:
```csharp
// StateEvtView.cs
if (Cfg.BgCfgMap[this.curBgId].audio > 0)
{
    AudioMgrEx.PlaySceneSound(Cfg.BgCfgMap[this.curBgId].audio, false, null, 1f);
}
```

---

### 3.3 cloth（适用服装列表）

**格式**: 服装ID数组

**示例**:
```json
"cloth": [0, 1101]    // 可穿默认服装(0)和特定服装(1101)
"cloth": [1]          // 只能穿校服(1)
"cloth": []           // 无特殊限制
```

**常见服装ID**:
| ID | 含义 |
|----|------|
| `0` | 默认服装 |
| `1` | 校服 |
| `1101` | 特定服装 |

---

### 3.4 gaozhongUrl 和 gaozhongCond（学段切换）

**功能**: 小学/初中阶段显示一个背景，高中阶段切换到另一个背景

**配置示例**:
```json
{
    "id": 101,
    "url": "bg/img_xxzoulang",      // 小学/初中走廊
    "gaozhongUrl": 202451,           // 高中走廊背景ID
    "gaozhongCond": [[10.0, 36.0]]   // 第36回合后切换到高中
}
```

**代码逻辑**:
```csharp
// 检查是否满足高中切换条件
if (role.GradeState > 0 && _cfg.gaozhongUrl > 0 
    && CommonEvtMgr.IsMatchCondition(_cfg.gaozhongCond, true))
{
    url = Cfg.BgCfgMap[_cfg.gaozhongUrl].url;  // 使用高中背景
}
else
{
    url = _cfg.url;  // 使用默认背景
}
```

---

## 四、bg 属性的使用场景

### 4.1 TalkCfg（对话配置）

```csharp
public class TalkCfg
{
    public int bg;  // 对话场景的背景ID
    // ...
}
```

**特殊值**:
| bg值 | 含义 |
|------|------|
| `0` | 使用默认/初始背景 |
| `-1` | 保持当前背景不变（不切换） |
| `>0` | 切换到指定ID的背景 |

**代码示例**:
```csharp
// NewTalkView.cs
private int GetBgId()
{
    int bg = this.cfg.bg;
    if (bg == 0 && this.initBgId > 0)
    {
        bg = this.initBgId;  // 使用初始背景
    }
    else if (bg == -1 && this.curBgId > 0)
    {
        bg = this.curBgId;   // 保持当前背景
    }
    return bg;
}
```

---

### 4.2 MapCfg（地图配置）

```csharp
public class MapCfg
{
    public int bg;   // 主背景ID
    public int bg2;  // 副背景ID（用于场景切换）
}
```

**代码示例**:
```csharp
// MapSceneView.cs
this.bgId = (this.isOtherBg ? this.cfg.bg2 : this.cfg.bg);
this.bgUrl = Cfg.BgCfgMap[this.bgId].GetBgUrl(-1);
this.icon_bg.SetTextureUrl(this.bgUrl, true);
```

---

### 4.3 ActionCfg（行动配置）

```csharp
public class ActionCfg
{
    public int bg;  // 行动执行时的背景ID
}
```

---

## 五、完整配置示例

### 示例1：客厅背景

```json
{
    "100": {
        "id": 100,
        "name": "客厅",
        "url": "bg/img_keting",
        "audio": 0,
        "cloth": [0, 1101],
        "gaozhongUrl": 0,
        "gaozhongCond": []
    }
}
```

**说明**:
- 背景图片：`bg/img_keting`
- 无场景音效
- 可穿默认服装(0)和特定服装(1101)
- 无高中学段切换

---

### 示例2：学校走廊（带学段切换）

```json
{
    "101": {
        "id": 101,
        "name": "学校走廊",
        "url": "bg/img_xxzoulang",
        "audio": 30012,
        "cloth": [1],
        "gaozhongUrl": 202451,
        "gaozhongCond": [[10.0, 36.0]]
    }
}
```

**说明**:
- 背景图片：`bg/img_xxzoulang`
- 场景音效：30012
- 只能穿校服(1)
- 第36回合后切换到高中背景(202451)

---

### 示例3：足球场（带学段切换）

```json
{
    "103": {
        "id": 103,
        "name": "足球场",
        "url": "bg/img_zuqiuchang",
        "audio": 30007,
        "cloth": [1],
        "gaozhongUrl": 202471,
        "gaozhongCond": []
    }
}
```

**说明**:
- 背景图片：`bg/img_zuqiuchang`
- 场景音效：30007
- 只能穿校服(1)
- 高中学段自动切换到背景202471

---

## 六、背景切换流程

```
1. 触发对话/进入地图
   ↓
2. 获取bg值（从TalkCfg/MapCfg/ActionCfg）
   ↓
3. 查询BgCfg配置
   ↓
4. 检查学段状态
   ├─ 高中学段 + gaozhongUrl > 0 + 满足条件
   │   → 使用gaozhongUrl指向的背景
   └─ 其他情况
       → 使用默认url背景
   ↓
5. 加载背景图片
   ↓
6. 播放场景音效（audio > 0）
   ↓
7. 刷新角色服装（根据cloth列表）
```

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/BgCfg.cs` | BgCfg类定义 |
| `Assembly-CSharp/CfgExtension.cs` | GetBgUrl扩展方法 |
| `Assembly-CSharp/View/Evt/NewTalkView.cs` | 对话背景切换 |
| `Assembly-CSharp/View/Evt/StateEvtView.cs` | 状态事件背景 |
| `Assembly-CSharp/View/Main/MapSceneView.cs` | 地图场景背景 |
| `TextAsset/BgCfg.json` | 背景配置文件 |

---

## 八、Mod开发注意事项

1. **图片路径**: 使用 `bg/` 前缀，如 `bg/img_keting`
2. **音效ID**: 参考 AudioCfg.json 中的音效配置
3. **服装ID**: 参考 ClothCfg.json 中的服装配置
4. **学段切换**: 
   - `gaozhongUrl` 指向另一个BgCfg的id
   - `gaozhongCond` 使用条件数组格式
5. **特殊bg值**:
   - `0` = 使用默认背景
   - `-1` = 保持当前背景不变

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
