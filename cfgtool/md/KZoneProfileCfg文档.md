# KZoneProfileCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**KZoneProfileCfg.json** 是游戏的 KZone（类似QQ空间）系统的个人资料配置文件，用于配置角色的空间昵称、简介、感情状态、主题等信息。

- **加载路径**: `Cfgs/{语言}/KZoneProfileCfg`
- **存储位置**: `Cfg.KZoneProfileCfgMap` (Dictionary<int, KZoneProfileCfg>)
- **用途**: 配置 KZone 个人资料信息

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 配置ID（对应角色ID） | `0`, `101`, `201` |
| `name` | string | 空间昵称 | `"小纯"`, `null` |
| `desc` | string | 个人简介 | `"这个人很懒，什么都没有留下"` |
| `marriage` | List<string> | 感情状态选项 | `["单身", "恋爱中"]` |
| `hometown` | string | 家乡 | `"鹅城"` |
| `living` | string | 现居地 | `"鹅城"` |
| `job` | string | 职业 | `"学生"` |
| `school` | string | 学校/公司 | `"鹅城小学"` |
| `isVip` | int | VIP状态 | `0`=否, `1`=是 |
| `theme` | int | 主题配色ID | `1`（引用KZoneColorCfg） |
| `bgm` | int | 背景音乐ID | `0`=无 |
| `font` | int | 字体ID | `101`（范围101-108） |
| `fontColor` | int | 字体颜色ID | `201`（范围201-211） |
| `fontSize` | int | 字体大小 | `40`（默认） |
| `icon` | int | 头像ID | `8`（引用KZoneAvatarCfg） |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 配置唯一标识符，**对应角色ID**

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8000, 8957)]
public int id;
```

**说明**: 
- `id = 0` 为默认配置（主角或其他未配置角色）
- `id = 101, 201` 等对应具体角色

---

### 3.2 name

**类型**: `string`

**功能**: 空间显示的昵称/名称

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8046, 0)]
public string name;
```

**说明**:
- `null` 时使用角色默认名称（PersonCfg.name）
- 可自定义空间专属昵称

**代码应用**:
```csharp
kzoneProfileData.name = (kzoneProfileCfg.name ?? personCfg.name);
```

---

### 3.3 desc

**类型**: `string`

**功能**: 个人简介/签名

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8047, 0)]
public string desc;
```

**示例**:
```json
"desc": "每只小狗都该拥有自己的肉骨头"
```

---

### 3.4 marriage ⭐重要

**类型**: `List<string>`

**功能**: 感情状态选项列表

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8048, 8956)]
public List<string> marriage;
```

**示例**:
```json
"marriage": ["单身", "恋爱中"]
```

**说明**:
- 第一个元素为默认状态
- 游戏中可根据剧情变化切换

**代码应用**:
```csharp
kzoneProfileData.marriage = (kzoneProfileCfg.marriage.NotEmpty() ? 
    kzoneProfileCfg.marriage[0] : null);
```

---

### 3.5 hometown

**类型**: `string`

**功能**: 家乡/籍贯

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8049, 0)]
public string hometown;
```

---

### 3.6 living

**类型**: `string`

**功能**: 现居地

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Condition, 8050, 0)]
public string living;
```

---

### 3.7 job

**类型**: `string`

**功能**: 职业

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8051, 0)]
public string job;
```

---

### 3.8 school

**类型**: `string`

**功能**: 学校或公司名称

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8052, 0)]
public string school;
```

---

### 3.9 isVip

**类型**: `int`

**功能**: VIP状态标记

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8053, 8955)]
public int isVip;
```

| 值 | 含义 |
|----|------|
| `0` | 普通用户 |
| `1` | VIP用户 |

**代码应用**:
```csharp
kzoneProfileData.isVip = (kzoneProfileCfg.isVip == 1);
```

---

### 3.10 theme ⭐重要

**类型**: `int`

**功能**: 主题配色ID

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8054, 0)]
[CfgPropertyRange(typeof(KZoneColorCfg))]
public int theme;
```

**说明**: 引用 [KZoneColorCfg](file:///e:/steam/steamapps/common/StudentAge/datafanbianyi/Assembly-CSharp/Config/KZoneColorCfg.cs) 配置

**默认值**: `1`

**代码应用**:
```csharp
kzoneProfileData.themeId = ((kzoneProfileCfg.theme == 0) ? 1 : kzoneProfileCfg.theme);
```

---

### 3.11 bgm

**类型**: `int`

**功能**: 背景音乐ID

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8055, 0)]
public int bgm;
```

| 值 | 含义 |
|----|------|
| `0` | 无背景音乐 |
| `>0` | 对应音乐ID |

---

### 3.12 font ⭐重要

**类型**: `int`

**功能**: 字体ID

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8056, 0)]
[CfgPropertyRange(typeof(KZoneFontCfg), 101, 108)]
public int font;
```

**说明**: 
- 引用 [KZoneFontCfg](file:///e:/steam/steamapps/common/StudentAge/datafanbianyi/Assembly-CSharp/Config/KZoneFontCfg.cs)
- **有效范围**: 101-108

---

### 3.13 fontColor ⭐重要

**类型**: `int`

**功能**: 字体颜色ID

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8057, 0)]
[CfgPropertyRange(typeof(KZoneFontCfg), 201, 211)]
public int fontColor;
```

**说明**: 
- 引用 KZoneFontCfg
- **有效范围**: 201-211

---

### 3.14 fontSize

**类型**: `int`

**功能**: 字体大小

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8058, 0, DefaultValue = 40)]
public int fontSize;
```

**默认值**: `40`

---

### 3.15 icon

**类型**: `int`

**功能**: 头像ID

**说明**: 引用 [KZoneAvatarCfg](file:///e:/steam/steamapps/common/StudentAge/datafanbianyi/Assembly-CSharp/Config/KZoneAvatarCfg.cs) 配置

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/KZoneProfileCfg.cs`

```csharp
[CfgClass(25060402UL, 8503)]
public class KZoneProfileCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8957)]
    public int id;

    [CfgProperty(CfgPropertyType.Default, 8046, 0)]
    public string name;

    [CfgProperty(CfgPropertyType.Default, 8047, 0)]
    public string desc;

    [CfgProperty(CfgPropertyType.Default, 8048, 8956)]
    public List<string> marriage;

    [CfgProperty(CfgPropertyType.Default, 8049, 0)]
    public string hometown;

    [CfgProperty(CfgPropertyType.Condition, 8050, 0)]
    public string living;

    [CfgProperty(CfgPropertyType.Default, 8051, 0)]
    public string job;

    [CfgProperty(CfgPropertyType.Default, 8052, 0)]
    public string school;

    [CfgProperty(CfgPropertyType.Default, 8053, 8955)]
    public int isVip;

    [CfgProperty(CfgPropertyType.Default, 8054, 0)]
    [CfgPropertyRange(typeof(KZoneColorCfg))]
    public int theme;

    [CfgProperty(CfgPropertyType.Default, 8055, 0)]
    public int bgm;

    [CfgProperty(CfgPropertyType.Default, 8056, 0)]
    [CfgPropertyRange(typeof(KZoneFontCfg), 101, 108)]
    public int font;

    [CfgProperty(CfgPropertyType.Default, 8057, 0)]
    [CfgPropertyRange(typeof(KZoneFontCfg), 201, 211)]
    public int fontColor;

    [CfgProperty(CfgPropertyType.Default, 8058, 0, DefaultValue = 40)]
    public int fontSize;

    public int icon;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, KZoneProfileCfg> KZoneProfileCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadKZoneProfileCfgMap()
{
    CfgMgr.LoadAsync<KZoneProfileCfg>("Cfgs/" + LocalizationMgr.Lang + "/KZoneProfileCfg", 
        delegate(Dictionary<int, KZoneProfileCfg> _t)
    {
        Cfg.KZoneProfileCfgMap = _t;
    });
}
```

### 4.3 运行时数据转换

**文件**: `Assembly-CSharp/KZoneData.cs`

```csharp
public KZoneProfileData GetProfile(int _id)
{
    KZoneProfileCfg kzoneProfileCfg;
    if (!Cfg.KZoneProfileCfgMap.TryGetValue(_id, out kzoneProfileCfg))
    {
        return null;
    }
    
    KZoneProfileData kzoneProfileData = new KZoneProfileData();
    
    // 基础信息
    kzoneProfileData.id = _id;
    kzoneProfileData.name = (kzoneProfileCfg.name ?? personCfg.name);
    kzoneProfileData.desc = kzoneProfileCfg.desc;
    
    // 感情状态
    kzoneProfileData.marriage = (kzoneProfileCfg.marriage.NotEmpty() ? 
        kzoneProfileCfg.marriage[0] : null);
    
    // 个人信息
    kzoneProfileData.living = kzoneProfileCfg.living;
    kzoneProfileData.job = kzoneProfileCfg.job;
    kzoneProfileData.hometown = kzoneProfileCfg.hometown;
    kzoneProfileData.schoolOrCompany = kzoneProfileCfg.school;
    
    // 外观设置
    kzoneProfileData.themeId = ((kzoneProfileCfg.theme == 0) ? 1 : kzoneProfileCfg.theme);
    kzoneProfileData.bgmId = kzoneProfileCfg.bgm;
    kzoneProfileData.fontId = kzoneProfileCfg.font;
    kzoneProfileData.fontColorId = kzoneProfileCfg.fontColor;
    kzoneProfileData.fontSize = kzoneProfileCfg.fontSize;
    kzoneProfileData.isVip = (kzoneProfileCfg.isVip == 1);
    
    return kzoneProfileData;
}
```

---

## 五、配置示例

### 示例1: 默认配置

```json
{
    "0": {
        "id": 0,
        "name": null,
        "icon": 0,
        "desc": "这个人很懒，什么都没有留下",
        "marriage": [],
        "hometown": "鹅城",
        "living": "鹅城",
        "job": "学生",
        "school": "鹅城小学",
        "isVip": 0,
        "theme": 1,
        "bgm": 0,
        "font": 101,
        "fontColor": 201,
        "fontSize": 40
    }
}
```

---

### 示例2: 角色配置（小纯）

```json
{
    "101": {
        "id": 101,
        "name": "小纯",
        "icon": 8,
        "desc": "每只小狗都该拥有自己的肉骨头",
        "marriage": ["单身", "恋爱中"],
        "hometown": "鹅城",
        "living": "鹅城",
        "job": "学生",
        "school": "鹅城小学",
        "isVip": 0,
        "theme": 1,
        "bgm": 0,
        "font": 101,
        "fontColor": 201,
        "fontSize": 40
    }
}
```

---

### 示例3: VIP用户配置

```json
{
    "201": {
        "id": 201,
        "name": "VIP用户",
        "icon": 15,
        "desc": "享受生活的每一天",
        "marriage": ["恋爱中"],
        "hometown": "鹅城",
        "living": "鹅城",
        "job": "学生",
        "school": "鹅城一中",
        "isVip": 1,
        "theme": 3,
        "bgm": 101,
        "font": 105,
        "fontColor": 205,
        "fontSize": 42
    }
}
```

---

### 示例4: 自定义主题配置

```json
{
    "301": {
        "id": 301,
        "name": "文艺青年",
        "icon": 20,
        "desc": "诗和远方",
        "marriage": ["单身"],
        "hometown": "江南",
        "living": "鹅城",
        "job": "学生",
        "school": "鹅城一中",
        "isVip": 0,
        "theme": 5,
        "bgm": 0,
        "font": 103,
        "fontColor": 208,
        "fontSize": 38
    }
}
```

---

## 六、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/KZoneProfileCfg.cs` | 配置类定义 |
| `Assembly-CSharp/KZoneProfileData.cs` | 运行时数据类 |
| `Assembly-CSharp/KZoneData.cs` | KZone数据管理 |
| `Assembly-CSharp/Config/KZoneColorCfg.cs` | 主题配色配置 |
| `Assembly-CSharp/Config/KZoneFontCfg.cs` | 字体配置 |
| `Assembly-CSharp/Config/KZoneAvatarCfg.cs` | 头像配置 |
| `TextAsset/KZoneProfileCfg.json` | 配置文件 |

---

## 七、快速参考

| 用途 | 配置示例 |
|------|----------|
| 基础信息 | `{"id": 101, "name": "昵称", "desc": "简介"}` |
| 感情状态 | `"marriage": ["单身", "恋爱中"]` |
| VIP设置 | `"isVip": 1` |
| 主题配色 | `"theme": 3`（引用KZoneColorCfg） |
| 字体设置 | `"font": 101, "fontColor": 201, "fontSize": 40` |
| 背景音乐 | `"bgm": 101` |
| 头像设置 | `"icon": 8`（引用KZoneAvatarCfg） |

---

## 八、数据结构关系

```
KZoneProfileCfg (个人资料配置)
    ├── id → 角色ID
    ├── name → 空间昵称（可覆盖角色名）
    ├── marriage → 感情状态选项
    ├── theme → KZoneColorCfg (主题配色)
    ├── font/fontColor → KZoneFontCfg (字体配置)
    └── icon → KZoneAvatarCfg (头像配置)
```

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
