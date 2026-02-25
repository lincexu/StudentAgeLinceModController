# PersonCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**PersonCfg.json** 是游戏的角色配置文件，定义了所有NPC和主角的基础信息、立绘、Live2D模型等。

- **加载路径**: `Cfgs/{语言}/PersonCfg`
- **存储位置**: `Cfg.PersonCfgMap` (Dictionary<int, PersonCfg>)
- **用途**: 配置角色的基础信息、立绘资源、Live2D模型、气泡位置等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 角色唯一ID | `3`, `101`, `201` |
| `name` | string | 角色名称 | `"梁超杰"` |
| `nicknames` | List<string> | 昵称列表 | `["杰哥"]` |
| `gender` | int | 性别 | `1`=男, `2`=女 |
| `birthday` | List<int> | 生日 [年,月,日] | `[1995, 11, 14]` |
| `introduction` | string | 角色简介 | `"机灵却叛逆的游戏迷"` |
| `note` | string | 内部备注 | `"主要角色"` |
| `telephone` | string | 电话号码 | `null` |
| `clickAudio` | int | 点击音效ID | `0` |
| `kzoneHeadId` | int | KZone头像ID | `0` |
| `init` | List<int> | 初始出现配置 | `[2]` |
| `url` | List<string> | 小学立绘路径 | `["role_jiege"]` |
| `urlParm` | List<float> | 小学立绘参数 | `[35.0, 200.0, 0.56]` |
| `bubbleParm` | List<float> | 小学气泡位置 | `[930.0]` |
| `url2` | List<string> | 中学立绘路径 | `["role_jiege2"]` |
| `urlParm2` | List<float> | 中学立绘参数 | `[35.0, 200.0, 0.56]` |
| `bubbleParm2` | List<float> | 中学气泡位置 | `[980.0]` |
| `l2d` | List<string> | 小学Live2D模型 | `[]` |
| `l2dParm` | List<List<float>> | 小学Live2D参数 | `[]` |
| `l2d2` | List<string> | 中学Live2D模型 | `[]` |
| `l2dParm2` | List<List<float>> | 中学Live2D参数 | `[]` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 角色的唯一标识符

**说明**: 
- 主角通常为 `0`
- NPC从 `1` 开始编号
- 主要角色通常有固定ID范围

---

### 3.2 name

**类型**: `string`

**功能**: 角色的显示名称

**示例**:
```json
"name": "梁超杰"
```

---

### 3.3 nicknames

**类型**: `List<string>`

**功能**: 角色的昵称列表，用于亲密关系中的称呼

**示例**:
```json
"nicknames": ["杰哥", "阿杰"]
```

**说明**: 随着关系进展，可能会解锁不同的称呼方式

---

### 3.4 gender ⭐重要

**类型**: `int`

**功能**: 角色性别

| 值 | 含义 |
|----|------|
| `1` | 男性 |
| `2` | 女性 |

**代码应用**:
```csharp
public enum GenderDefine
{
    Unknown = 0,
    Male = 1,      // 男性
    Female = 2     // 女性
}
```

---

### 3.5 birthday

**类型**: `List<int>`

**功能**: 角色生日 [年, 月, 日]

**格式**: `[1995, 11, 14]`

**说明**: 用于计算年龄和触发生日事件

**代码应用**:
```csharp
// 计算年龄
public float Age
{
    get
    {
        if (Birthday == null || Birthday.Count < 3)
            return 0;
        
        DateTime birthday = new DateTime(Birthday[0], Birthday[1], Birthday[2]);
        return (DateTime.Now - birthday).Days / 365f;
    }
}
```

---

### 3.6 introduction

**类型**: `string`

**功能**: 角色简介/描述

**示例**:
```json
"introduction": "机灵却叛逆的游戏迷"
```

**用途**: 在角色图鉴、初次见面等场景显示

---

### 3.7 note

**类型**: `string`

**功能**: 内部备注/注释

**示例**:
```json
"note": "主要角色"
```

**说明**: 用于开发和配置管理，不显示给玩家

---

### 3.8 telephone

**类型**: `string`

**功能**: 角色电话号码

**说明**: 用于电话系统，可能为 `null`

---

### 3.9 clickAudio

**类型**: `int`

**功能**: 点击角色时播放的音效ID

| 值 | 含义 |
|----|------|
| `0` | 无特殊音效 |
| `>0` | 对应音效ID |

---

### 3.10 kzoneHeadId

**类型**: `int`

**功能**: KZone（社交空间）头像ID

**说明**: 引用 KZoneAvatarCfg 配置

---

### 3.11 init

**类型**: `List<int>`

**功能**: 角色初始出现配置

**示例**:
```json
"init": [2]
```

**说明**: 控制角色何时在游戏中出现，如 `[2]` 表示第2回合后出现

---

### 3.12 url ⭐重要

**类型**: `List<string>`

**功能**: 小学阶段立绘资源路径列表

**示例**:
```json
"url": ["role_jiege"]
```

**说明**: 
- 立绘图片路径，不需要扩展名
- 支持多服装，如 `["role_jiege_01", "role_jiege_02"]`
- 对应 GradeState = 0（小学）

---

### 3.13 urlParm ⭐重要

**类型**: `List<float>`

**功能**: 小学阶段立绘显示参数

**格式**: `[x偏移, y偏移, 缩放比例]`

**示例**:
```json
"urlParm": [35.0, 200.0, 0.56]
```

**说明**:
- `x偏移`: 水平位置调整
- `y偏移`: 垂直位置调整
- `缩放比例`: 立绘缩放大小

---

### 3.14 bubbleParm ⭐重要

**类型**: `List<float>`

**功能**: 小学阶段对话气泡Y轴位置

**示例**:
```json
"bubbleParm": [930.0]
```

**说明**: 控制对话气泡在立绘上方的显示位置

---

### 3.15 url2

**类型**: `List<string>`

**功能**: 中学阶段立绘资源路径列表（初中+高中共用）

**说明**: 
- 与 `url` 相同，用于中学阶段
- 对应 GradeState = 1（初中）或 GradeState = 2（高中）

---

### 3.16 urlParm2

**类型**: `List<float>`

**功能**: 中学阶段立绘显示参数

**说明**: 与 `urlParm` 相同，用于中学阶段

---

### 3.17 bubbleParm2

**类型**: `List<float>`

**功能**: 中学阶段对话气泡Y轴位置

**说明**: 与 `bubbleParm` 相同，用于中学阶段

---

### 3.18 l2d ⭐重要

**类型**: `List<string>`

**功能**: 小学阶段Live2D模型名称列表

**示例**:
```json
"l2d": ["xiaochun", "xiaochun_school"]
```

**说明**: 
- 如果为空数组 `[]`，则使用静态立绘（url）
- 如果配置，则使用Live2D动态模型
- 对应 GradeState = 0（小学）

---

### 3.19 l2dParm

**类型**: `List<List<float>>`

**功能**: 小学阶段Live2D模型参数

**格式**: `[[x, y, 缩放, 翻转], ...]`

**示例**:
```json
"l2dParm": [
    [0.0, -200.0, 0.8, 0.0],      // 模型1参数
    [50.0, -150.0, 0.75, 1.0]     // 模型2参数（翻转）
]
```

**说明**:
- `x`: X轴位置
- `y`: Y轴位置
- `缩放`: 模型缩放比例
- `翻转`: `0`=正常, `1`=水平翻转

---

### 3.20 l2d2

**类型**: `List<string>`

**功能**: 中学阶段Live2D模型名称列表（初中+高中共用）

**说明**: 
- 与 `l2d` 相同，用于中学阶段
- 对应 GradeState = 1（初中）或 GradeState = 2（高中）

---

### 3.21 l2dParm2

**类型**: `List<List<float>>`

**功能**: 中学阶段Live2D模型参数

**说明**: 与 `l2dParm` 相同，用于中学阶段

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/PersonCfg.cs`

```csharp
[CfgClass(25032700UL, 8515)]
public class PersonCfg
{
    public List<int> birthday;
    public List<float> bubbleParm;
    public List<float> bubbleParm2;
    public int clickAudio;
    public int gender;
    public int id;
    public List<int> init;
    public string introduction;
    public int kzoneHeadId;
    public List<string> l2d;
    public List<string> l2d2;
    public List<List<float>> l2dParm;
    public List<List<float>> l2dParm2;
    public string name;
    public List<string> nicknames;
    public string note;
    public string telephone;
    public List<string> url;
    public List<string> url2;
    public List<float> urlParm;
    public List<float> urlParm2;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, PersonCfg> PersonCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadPersonCfgMap()
{
    CfgMgr.LoadAsync<PersonCfg>("Cfgs/" + LocalizationMgr.Lang + "/PersonCfg", 
        delegate(Dictionary<int, PersonCfg> _t)
    {
        Cfg.PersonCfgMap = _t;
    });
}
```

### 4.3 扩展方法

**文件**: `Assembly-CSharp/CfgExtension.cs`

```csharp
// 获取角色立绘URL列表
public static List<string> GetRoleUrls(this PersonCfg _cfg, int _gradeState = -1)
{
    if (_gradeState == 1)
        return _cfg.url2;
    return _cfg.url;
}

// 获取完整立绘路径
public static string GetFullIcon(this PersonCfg _cfg, int _cloth = 0, 
    GenderDefine _gender = GenderDefine.Unknown, int _gradeState = -1)
{
    List<string> roleUrls = _cfg.GetRoleUrls(_gradeState);
    if (roleUrls.NotEmpty())
    {
        int index = Mathf.Clamp(_cloth, 0, roleUrls.Count - 1);
        return "role/" + roleUrls[index];
    }
    return null;
}

// 获取头像路径
public static string GetHeadIcon(this PersonCfg _cfg, GenderDefine _gender = GenderDefine.Unknown, 
    int _cloth = 0, int _gradeState = -1)
{
    string fullIcon = _cfg.GetFullIcon(_cloth, _gender, _gradeState);
    if (fullIcon.NotEmpty())
        return fullIcon + "_head";
    return null;
}

// 获取立绘参数
public static (float, float, float) GetUrlParm(this PersonCfg _cfg, int _gradeState, 
    GenderDefine _gender)
{
    List<float> list = (_gradeState == 1) ? _cfg.urlParm2 : _cfg.urlParm;
    if (list.NotEmpty())
    {
        return (list[0], list[1], list[2]);
    }
    return (0f, 0f, 1f);
}

// 获取气泡位置
public static Vector2 GetBubblePos(this PersonCfg _cfg, int _gradeState, GenderDefine _gender)
{
    List<float> list = (_gradeState == 1) ? _cfg.bubbleParm2 : _cfg.bubbleParm;
    if (list.NotEmpty())
    {
        return new Vector2(0f, list[0]);
    }
    return Vector2.zero;
}

// 判断是否使用图片（而非Live2D）
public static bool IsUseImg(this PersonCfg _cfg, int _gradeState, int _clothId = 0)
{
    List<string> list = (_gradeState == 1) ? _cfg.l2d2 : _cfg.l2d;
    return list.IsEmpty() || _clothId >= list.Count;
}

// 获取Live2D名称
public static string GetL2dName(this PersonCfg _cfg, int _gradeState, GenderDefine _gender)
{
    List<string> list = (_gradeState == 1) ? _cfg.l2d2 : _cfg.l2d;
    if (list.NotEmpty())
        return list[0];
    return null;
}
```

### 4.4 使用场景

#### ① 显示角色立绘
```csharp
PersonCfg personCfg = Cfg.PersonCfgMap[roleId];

// 获取立绘路径
string iconPath = personCfg.GetFullIcon(clothId, gender, gradeState);

// 获取立绘参数
(float x, float y, float scale) = personCfg.GetUrlParm(gradeState, gender);

// 显示立绘
roleImage.sprite = LoadSprite(iconPath);
roleImage.transform.position = new Vector3(x, y, 0);
roleImage.transform.localScale = Vector3.one * scale;
```

#### ② 显示Live2D模型
```csharp
PersonCfg personCfg = Cfg.PersonCfgMap[roleId];

// 判断是否使用Live2D
if (!personCfg.IsUseImg(gradeState, clothId))
{
    // 使用Live2D
    string l2dName = personCfg.GetL2dName(gradeState, gender);
    LoadLive2DModel(l2dName);
}
else
{
    // 使用静态立绘
    string iconPath = personCfg.GetFullIcon(clothId, gender, gradeState);
    LoadSprite(iconPath);
}
```

#### ③ 显示对话气泡
```csharp
PersonCfg personCfg = Cfg.PersonCfgMap[roleId];

// 获取气泡位置
Vector2 bubblePos = personCfg.GetBubblePos(gradeState, gender);

// 设置气泡位置
bubbleTransform.anchoredPosition = bubblePos;
```

---

## 五、配置示例

### 示例1: 静态立绘角色（初中+高中）

```json
{
    "3": {
        "id": 3,
        "note": "主要角色",
        "name": "梁超杰",
        "nicknames": ["杰哥"],
        "init": [2],
        "birthday": [1995, 11, 14],
        "gender": 1,
        "introduction": "机灵却叛逆的游戏迷",
        "telephone": null,
        "clickAudio": 0,
        "kzoneHeadId": 0,
        "url": ["role_jiege"],
        "urlParm": [],
        "bubbleParm": [930.0],
        "url2": ["role_jiege2"],
        "urlParm2": [35.0, 200.0, 0.56],
        "bubbleParm2": [980.0],
        "l2d": [],
        "l2dParm": [],
        "l2d2": [],
        "l2dParm2": []
    }
}
```

---

### 示例2: Live2D角色

```json
{
    "101": {
        "id": 101,
        "note": "主要角色",
        "name": "小纯",
        "nicknames": ["纯纯"],
        "init": [1],
        "birthday": [1996, 3, 8],
        "gender": 2,
        "introduction": "温柔善良的学霸",
        "telephone": "13800138000",
        "clickAudio": 101,
        "kzoneHeadId": 8,
        "url": [],
        "urlParm": [],
        "bubbleParm": [],
        "url2": [],
        "urlParm2": [],
        "bubbleParm2": [],
        "l2d": ["xiaochun"],
        "l2dParm": [
            [0.0, -200.0, 0.8, 0.0]
        ],
        "l2d2": ["xiaochun2"],
        "l2dParm2": [
            [0.0, -180.0, 0.85, 0.0]
        ]
    }
}
```

---

### 示例3: 多服装角色

```json
{
    "201": {
        "id": 201,
        "name": "主角",
        "nicknames": [],
        "gender": 1,
        "birthday": [1996, 1, 1],
        "introduction": "这就是你",
        "url": ["role_main_01", "role_main_02", "role_main_03"],
        "urlParm": [0.0, 100.0, 0.6],
        "bubbleParm": [900.0],
        "url2": ["role_main2_01", "role_main2_02", "role_main2_03"],
        "urlParm2": [0.0, 120.0, 0.65],
        "bubbleParm2": [950.0],
        "l2d": [],
        "l2d2": []
    }
}
```

---

## 六、学段切换机制

游戏分为**小学**、**初中**、**高中**三个学段，角色立绘和Live2D会根据学段自动切换：

### GradeState 定义

| GradeState | 学段 | 对应年级 | 立绘配置 |
|------------|------|----------|----------|
| `0` | 小学 | 1-6年级 | `url` / `l2d` |
| `1` | 初中 | 初一-初三 | `url2` / `l2d2` |
| `2` | 高中 | 高一-高三 | `url2` / `l2d2` |

### 代码实现

```csharp
public int GradeState { get; private set; }  // 0=小学, 1=初中, 2=高中

// 判断是否小学
public bool IsXiaoxue => this.GradeState == 0;

// 判断是否初中
public bool IsChuZhong => this.GradeState == 1;

// 判断是否高中
public bool IsGaoZhong => this.GradeState == 2;

// 判断是否中学（初中或高中）
public bool IsZhongXue => this.IsChuZhong || this.IsGaoZhong;

// 获取当前学段的立绘
public string GetCurrentIcon(PersonCfg _cfg)
{
    int gradeState = Singleton<RoleMgr>.Ins.GetRole().GradeState;
    
    if (gradeState == 0)
        return _cfg.GetFullIcon(clothId, gender, 0);  // 小学：使用 url
    else
        return _cfg.GetFullIcon(clothId, gender, 1);  // 中学（初中+高中）：使用 url2
}
```

### 说明

- **小学**使用 `url`/`urlParm`/`bubbleParm` 和 `l2d`/`l2dParm`
- **初中和高中**共用 `url2`/`urlParm2`/`bubbleParm2` 和 `l2d2`/`l2dParm2`
- 这种设计是因为初中和高中角色外观变化较小，可以共用同一套立绘资源

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/PersonCfg.cs` | 角色配置类 |
| `Assembly-CSharp/Config/PersonGrowCfg.cs` | 角色成长配置 |
| `Assembly-CSharp/Config/RelationCfg.cs` | 关系配置 |
| `Assembly-CSharp/TheEntity/Role.cs` | 角色实体类 |
| `Assembly-CSharp/RoleMgr.cs` | 角色管理器 |
| `Assembly-CSharp/CfgExtension.cs` | 扩展方法 |
| `TextAsset/PersonCfg.json` | 配置文件 |

---

## 八、快速参考

| 用途 | 配置示例 |
|------|----------|
| 基础信息 | `{"id": 101, "name": "小纯", "gender": 2}` |
| 生日 | `"birthday": [1996, 3, 8]` |
| 静态立绘（小学） | `"url": ["role_name"], "urlParm": [0.0, 100.0, 0.6]` |
| 静态立绘（中学） | `"url2": ["role_name2"], "urlParm2": [0.0, 100.0, 0.6]` |
| Live2D（小学） | `"l2d": ["model_name"], "l2dParm": [[0.0, -200.0, 0.8, 0.0]]` |
| Live2D（中学） | `"l2d2": ["model_name2"], "l2dParm2": [[0.0, -200.0, 0.8, 0.0]]` |
| 气泡位置（小学） | `"bubbleParm": [930.0]` |
| 气泡位置（中学） | `"bubbleParm2": [980.0]` |
| 多服装 | `"url": ["role_01", "role_02", "role_03"]` |
| KZone头像 | `"kzoneHeadId": 8` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
