# KZoneContentCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**KZoneContentCfg.json** 是游戏的 KZone（类似QQ空间）系统的内容配置文件，用于配置说说、博客等内容的发布、点赞、评论等。

- **加载路径**: `Cfgs/{语言}/KZoneContentCfg`
- **存储位置**: `Cfg.KZoneContentCfgMap` (Dictionary<int, KZoneContentCfg>)
- **用途**: 配置 KZone 说说/博客的内容、图片、点赞、评论等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 内容唯一ID | `20101`, `20102` |
| `role` | int | 发布者角色ID | `201`, `3` |
| `content` | string | 内容文本 | `"今天天气真好！"` |
| `imgs` | List<string> | 配图路径列表 | `["kzone/img_01"]` |
| `thumbs` | List<List<int>> | 点赞配置 | `[[3, 5], [4, 10]]` |
| `comments` | List<List<int>> | 评论配置 | `[[30101, 3], [30102, 6]]` |
| `options` | List<int> | 玩家选项 | `[30103, 30104]` |
| `cond` | List<List<double>> | 触发条件 | `[[14.0, 1.0, 201.0]]` |
| `thumbCnt` | int | 点赞数（运行时） | `5` |
| `title` | string | 标题（博客用） | `"我的第一篇博客"` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 内容的唯一标识符

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8000, 8999, Required = true)]
public int id;
```

**ID范围**: 通常以 201xx 开头

---

### 3.2 role

**类型**: `int`

**功能**: 发布此内容的角色ID

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8029, 8962, Required = true)]
public int role;
```

**说明**: 关联到 PersonCfg.id，定义谁发布了这条说说/博客

---

### 3.3 content

**类型**: `string`

**功能**: 说说/博客的文字内容

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8041, 0, Required = true)]
public string content;
```

**支持格式**:
- 普通文本: `"今天天气真好！"`
- 表情符号: `"<sprite=1>开心<sprite=2>"`
- 换行: 使用 `\n`

---

### 3.4 imgs

**类型**: `List<string>`

**功能**: 配图资源路径列表

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Image, 8042, 0)]
public List<string> imgs;
```

**格式**: `kzone/图片名`（不需要扩展名）

**示例**:
```json
"imgs": [
    "kzone/img_sunset",
    "kzone/img_food"
]
```

---

### 3.5 thumbs ⭐重要

**类型**: `List<List<int>>`

**功能**: 点赞配置，定义哪些角色会在多久后点赞

**格式**: `[[角色ID, 延迟秒数], ...]`

**示例**:
```json
"thumbs": [
    [3, 5],     // 角色3在5秒后点赞
    [4, 10],    // 角色4在10秒后点赞
    [5, 15]     // 角色5在15秒后点赞
]
```

**代码应用**:
```csharp
// 自动触发点赞
foreach (var thumbInfo in contentCfg.thumbs)
{
    int roleId = thumbInfo[0];
    int delaySeconds = thumbInfo[1];
    
    StartCoroutine(DelayAddThumb(roleId, delaySeconds));
}
```

---

### 3.6 comments ⭐重要

**类型**: `List<List<int>>`

**功能**: 评论配置，定义哪些评论会在多久后出现

**格式**: `[[评论ID, 延迟秒数], ...]`

**示例**:
```json
"comments": [
    [30101, 3],   // 3秒后出现评论30101
    [30102, 6],   // 6秒后出现评论30102
    [30103, 10]   // 10秒后出现评论30103
]
```

**说明**: 评论ID关联到 KZoneCommentCfg.json

---

### 3.7 options

**类型**: `List<int>`

**功能**: 玩家可以选择的回复/操作选项

**示例**:
```json
"options": [30104, 30105, 30106]
```

**说明**: 选项ID关联到 KZoneCommentCfg.json，通常 roles 包含 -1（表示玩家）

---

### 3.8 cond

**类型**: `List<List<double>>`

**功能**: 内容的触发条件

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"cond": [
    [14.0, 1.0, 201.0],   // 与角色201是恋人关系
    [1.0, 100.0]           // 属性1≥100
]
```

**代码应用**:
```csharp
// 检查内容是否满足显示条件
if (CheckCondition(contentCfg.cond))
{
    ShowContent(contentCfg);
}
```

---

### 3.9 thumbCnt

**类型**: `int`

**功能**: 点赞数量（运行时计算，配置中通常不填）

---

### 3.10 title

**类型**: `string`

**功能**: 标题（主要用于博客类型）

**示例**:
```json
"title": "我的暑假计划"
```

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/KZoneContentCfg.cs`

```csharp
[CfgClass(25060301UL, 8504)]
public class KZoneContentCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999, Required = true)]
    public int id;

    [CfgProperty(CfgPropertyType.Default, 8029, 8962, Required = true)]
    public int role;

    [CfgProperty(CfgPropertyType.Default, 8041, 0, Required = true)]
    public string content;

    [CfgProperty(CfgPropertyType.Image, 8042, 0)]
    public List<string> imgs;

    [CfgProperty(CfgPropertyType.Default, 8043, 8961)]
    public List<List<int>> thumbs;

    [CfgProperty(CfgPropertyType.Default, 8044, 8960)]
    public List<List<int>> comments;

    [CfgProperty(CfgPropertyType.Default, 8045, 8959)]
    public List<int> options;

    [CfgProperty(CfgPropertyType.Condition, 8025, 8958)]
    public List<List<double>> cond;

    public int thumbCnt;
    public string title;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, KZoneContentCfg> KZoneContentCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadKZoneContentCfgMap()
{
    CfgMgr.LoadAsync<KZoneContentCfg>("Cfgs/" + LocalizationMgr.Lang + "/KZoneContentCfg", 
        delegate(Dictionary<int, KZoneContentCfg> _t)
    {
        Cfg.KZoneContentCfgMap = _t;
    });
}
```

### 4.3 使用场景

#### ① 内容显示（KZonePageTalkView.cs）
```csharp
public void OnRenderContent(KZoneContentData _data)
{
    if (Cfg.KZoneContentCfgMap.TryGetValue(_data.contentId, out contentCfg))
    {
        // 显示发布者
        roleName.text = Cfg.PersonCfgMap[contentCfg.role].name;
        
        // 显示内容
        contentText.text = contentCfg.content;
        
        // 显示图片
        if (contentCfg.imgs.NotEmpty())
        {
            foreach (string imgPath in contentCfg.imgs)
            {
                CreateImage(imgPath);
            }
        }
        
        // 显示点赞数
        thumbCount.text = _data.thumbCnt.ToString();
    }
}
```

#### ② 自动点赞（KZoneContentData.cs）
```csharp
public void AddThumbs(KZoneContentCfg _cfg)
{
    if (_cfg.thumbs.NotEmpty())
    {
        foreach (var thumbInfo in _cfg.thumbs)
        {
            int roleId = thumbInfo[0];
            int delay = thumbInfo[1];
            
            StartCoroutine(DelayAddThumb(roleId, delay));
        }
    }
}
```

#### ③ 自动评论（KZoneContentData.cs）
```csharp
public void AddComments(KZoneContentCfg _cfg)
{
    if (_cfg.comments.NotEmpty())
    {
        foreach (var commentInfo in _cfg.comments)
        {
            int commentId = commentInfo[0];
            int delay = commentInfo[1];
            
            StartCoroutine(DelayAddComment(commentId, delay));
        }
    }
}
```

#### ④ 条件检查（KZoneData.cs）
```csharp
public bool CheckContentCond(KZoneContentCfg _cfg)
{
    if (_cfg.cond.NotEmpty())
    {
        return CommonEvtMgr.IsMatchCondition(_cfg.cond, true);
    }
    return true;
}
```

---

## 五、配置示例

### 示例1: 简单说说

```json
{
    "20101": {
        "id": 20101,
        "role": 201,
        "content": "今天天气真好！",
        "imgs": [],
        "thumbs": [
            [3, 5],
            [4, 10]
        ],
        "comments": [
            [30101, 3],
            [30102, 6]
        ],
        "options": [],
        "cond": [],
        "thumbCnt": 0,
        "title": ""
    }
}
```

**流程**:
1. 角色201发布说说
2. 3秒后出现评论30101
3. 5秒后角色3点赞
4. 6秒后出现评论30102
5. 10秒后角色4点赞

---

### 示例2: 带图片的说说

```json
{
    "20102": {
        "id": 20102,
        "role": 202,
        "content": "今天的午餐<sprite=1>",
        "imgs": [
            "kzone/img_lunch_01",
            "kzone/img_lunch_02"
        ],
        "thumbs": [
            [3, 3],
            [4, 5],
            [5, 8]
        ],
        "comments": [
            [30103, 5]
        ],
        "options": [],
        "cond": [],
        "thumbCnt": 0,
        "title": ""
    }
}
```

---

### 示例3: 带玩家选项的说说

```json
{
    "20103": {
        "id": 20103,
        "role": 203,
        "content": "大家觉得这道题怎么做？",
        "imgs": ["kzone/img_question"],
        "thumbs": [],
        "comments": [],
        "options": [30104, 30105, 30106],
        "cond": [],
        "thumbCnt": 0,
        "title": ""
    }
}
```

**说明**: 玩家可以从选项 30104、30105、30106 中选择回复

---

### 示例4: 带条件的博客

```json
{
    "20104": {
        "id": 20104,
        "role": 201,
        "content": "今天和TA一起去了公园...",
        "imgs": [
            "kzone/img_park_01",
            "kzone/img_park_02",
            "kzone/img_park_03"
        ],
        "thumbs": [
            [3, 5],
            [4, 10]
        ],
        "comments": [
            [30107, 8],
            [30108, 15]
        ],
        "options": [],
        "cond": [
            [14.0, 1.0, 201.0]   // 与角色201是恋人关系才显示
        ],
        "thumbCnt": 0,
        "title": "美好的一天"
    }
}
```

**说明**: 只有与角色201是恋人关系时，这条博客才会显示

---

## 六、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/KZoneContentCfg.cs` | 配置类定义 |
| `Assembly-CSharp/KZoneContentData.cs` | KZone内容运行时数据 |
| `Assembly-CSharp/KZoneData.cs` | KZone数据管理 |
| `Assembly-CSharp/View/TheAction/KZonePageTalkView.cs` | 说说界面 |
| `Assembly-CSharp/View/TheAction/KZonePageBlogView.cs` | 博客界面 |
| `TextAsset/KZoneContentCfg.json` | 配置文件 |
| `TextAsset/KZoneCommentCfg.json` | 评论配置（关联） |

---

## 七、快速参考

| 用途 | 配置示例 |
|------|----------|
| 纯文字说说 | `{"id": 20101, "role": 201, "content": "内容"}` |
| 带图说说 | `"imgs": ["kzone/img_01", "kzone/img_02"]` |
| 自动点赞 | `"thumbs": [[3, 5], [4, 10]]` |
| 自动评论 | `"comments": [[30101, 3], [30102, 6]]` |
| 玩家选项 | `"options": [30103, 30104]` |
| 条件限制 | `"cond": [[14.0, 1.0, 201.0]]` |
| 博客标题 | `"title": "博客标题"` |

---

## 八、数据结构关系

```
KZoneContentCfg (说说/博客配置)
    ├── role → PersonCfg (发布者)
    ├── thumbs → 自动点赞角色列表
    ├── comments → KZoneCommentCfg (评论配置)
    └── options → KZoneCommentCfg (玩家选项配置)
```

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
