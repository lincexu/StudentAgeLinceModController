# KZoneCommentCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**KZoneCommentCfg.json** 是游戏的 KZone（类似QQ空间）系统的评论配置文件，用于配置说说、日志等内容的评论和回复。

- **加载路径**: `Cfgs/{语言}/KZoneCommentCfg`
- **存储位置**: `Cfg.KZoneCommentCfgMap` (Dictionary<int, KZoneCommentCfg>)
- **用途**: 配置 KZone 评论内容、回复链、交互选项等

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 评论唯一ID | `30101`, `30102` |
| `roles` | List<int> | 角色列表 [发言者, 被回复者] | `[201]`, `[3, 201]` |
| `parent` | int | 父评论ID | `0`=根评论, `30101`=回复30101 |
| `content` | string | 评论内容 | `"好看吗？"` |
| `comments` | List<List<int>> | 后续评论链 | `[[30102, 5]]` |
| `options` | List<int> | 玩家回复选项 | `[30103, 30104]` |
| `effect` | List<List<float>> | 触发效果 | `[[1.0, 1.0, 3.0, 5.0]]` |
| `condition` | List<List<double>> | 触发条件 | `[[1.0, 100.0]]` |
| `personality` | List<int> | 性格要求 | `[1, 50]` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 评论的唯一标识符

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8000, 8969, Required = true)]
public int id;
```

**ID范围**: 通常以 301xx 开头

---

### 3.2 roles ⭐重要

**类型**: `List<int>`

**功能**: 定义评论的发言者和被回复者

**格式**: `[发言者角色ID, 被回复者角色ID]`

| 格式 | 含义 |
|------|------|
| `[201]` | 角色201发言（根评论，无特定回复对象） |
| `[3, 201]` | 角色3回复角色201的评论 |
| `[201, -1]` | 角色201回复给空间主人 |

**代码应用**:
```csharp
// 获取发言者
int speakerId = commentCfg.roles[0];

// 获取被回复者（如果有）
int replyToId = commentCfg.roles.Count > 1 ? commentCfg.roles[1] : -1;
```

---

### 3.3 parent ⭐重要

**类型**: `int`

**功能**: 定义评论的层级关系

| parent值 | 含义 |
|----------|------|
| `0` | 根评论（直接评论说说/日志） |
| `30101` | 回复ID为30101的评论 |

**代码应用**:
```csharp
// 判断是否为根评论
bool isRootComment = commentCfg.parent == 0;

// 获取父评论
if (commentCfg.parent > 0 && 
    Cfg.KZoneCommentCfgMap.TryGetValue(commentCfg.parent, out parentCfg))
{
    // 处理回复逻辑
}
```

---

### 3.4 content

**类型**: `string`

**功能**: 评论的文本内容

**支持格式**:
- 普通文本: `"好看吗？"`
- 表情符号: `"<sprite=1>真不错<sprite=2>"`

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8038, 0, Required = true)]
public string content;
```

---

### 3.5 comments ⭐重要

**类型**: `List<List<int>>`

**功能**: 该评论触发后，后续自动出现的评论链

**格式**: `[[评论ID, 延迟秒数], ...]`

**示例**:
```json
"comments": [
    [30102, 5],    // 5秒后出现评论30102
    [30103, 10]    // 10秒后出现评论30103
]
```

**代码应用**:
```csharp
// 自动触发后续评论
foreach (var commentInfo in commentCfg.comments)
{
    int nextCommentId = commentInfo[0];
    int delaySeconds = commentInfo[1];
    
    // 延迟执行
    StartCoroutine(DelayAddComment(nextCommentId, delaySeconds));
}
```

---

### 3.6 options

**类型**: `List<int>`

**功能**: 玩家可以选择的回复选项评论ID列表

**示例**:
```json
"options": [30103, 30104, 30105]
```

**代码应用**:
```csharp
// 显示回复选项按钮
foreach (int optionId in commentCfg.options)
{
    if (Cfg.KZoneCommentCfgMap.TryGetValue(optionId, out optionCfg))
    {
        CreateReplyButton(optionCfg.content, () => SelectReply(optionId));
    }
}
```

---

### 3.7 effect

**类型**: `List<List<float>>`

**功能**: 评论触发时的效果

**格式**: `[[效果类型, 子类型, 属性ID, 数值], ...]`

**示例**:
```json
"effect": [
    [1.0, 1.0, 3.0, 5.0],    // 亲密值+5
    [1.0, 1.0, 7.0, -10.0]   // 金钱-10
]
```

---

### 3.8 condition

**类型**: `List<List<double>>`

**功能**: 评论显示或触发的条件

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"condition": [
    [1.0, 100.0],       // 属性1≥100
    [14.0, 1.0, 201.0]  // 与角色201是恋人关系
]
```

---

### 3.9 personality

**类型**: `List<int>`

**功能**: 角色性格要求

**格式**: `[性格类型, 性格值]`

**示例**:
```json
"personality": [1, 50]    // 性格类型1的值≥50
```

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/KZoneCommentCfg.cs`

```csharp
[CfgClass(25060302UL, 8505)]
public class KZoneCommentCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8969, Required = true)]
    public int id;
    
    [CfgProperty(CfgPropertyType.Default, 8036, 8968, Required = true)]
    public List<int> roles;
    
    [CfgProperty(CfgPropertyType.Default, 8037, 8967, Required = true)]
    public int parent;
    
    [CfgProperty(CfgPropertyType.Default, 8038, 0, Required = true)]
    public string content;
    
    [CfgProperty(CfgPropertyType.Default, 8039, 8966)]
    public List<List<int>> comments;
    
    [CfgProperty(CfgPropertyType.Default, 8040, 8965)]
    public List<int> options;
    
    [CfgProperty(CfgPropertyType.Effect, 8002, 8964)]
    public List<List<float>> effect;
    
    [CfgProperty(CfgPropertyType.Condition, 8025, 8963)]
    public List<List<double>> condition;
    
    public List<int> personality;
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, KZoneCommentCfg> KZoneCommentCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadKZoneCommentCfgMap()
{
    CfgMgr.LoadAsync<KZoneCommentCfg>("Cfgs/" + LocalizationMgr.Lang + "/KZoneCommentCfg", 
        delegate(Dictionary<int, KZoneCommentCfg> _t)
    {
        Cfg.KZoneCommentCfgMap = _t;
    });
}
```

### 4.3 使用场景

#### ① 评论显示（KZoneCommon.cs）
```csharp
public void OnRenderComment(KZoneCommentData _data)
{
    if (Cfg.KZoneCommentCfgMap.TryGetValue(_data.commentId, out commentCfg))
    {
        // 显示评论内容
        contentText.text = commentCfg.content;
        
        // 获取发言者名称
        int speakerId = commentCfg.roles[0];
        speakerName.text = Cfg.PersonCfgMap[speakerId].name;
        
        // 判断是否为回复
        if (commentCfg.parent > 0)
        {
            int replyToId = commentCfg.roles[1];
            replyText.text = "回复 " + Cfg.PersonCfgMap[replyToId].name;
        }
    }
}
```

#### ② 评论添加（KZoneContentData.cs）
```csharp
public void AddComment(int _commentId)
{
    if (!Cfg.KZoneCommentCfgMap.TryGetValue(_commentId, out commentCfg))
        return;
    
    // 检查条件
    if (!CheckCondition(commentCfg.condition))
        return;
    
    // 创建评论数据
    KZoneCommentData commentData = new KZoneCommentData
    {
        commentId = _commentId,
        postTime = DateTime.Now,
        roleId = commentCfg.roles[0]
    };
    
    this.comments.Add(commentData);
    
    // 触发效果
    if (commentCfg.effect.NotEmpty())
    {
        EffectorCtrl.DoEffect(commentCfg.effect);
    }
    
    // 自动触发后续评论
    if (commentCfg.comments.NotEmpty())
    {
        foreach (var nextComment in commentCfg.comments)
        {
            StartCoroutine(DelayAddComment(nextComment[0], nextComment[1]));
        }
    }
}
```

#### ③ 回复选项（KZonePageHomeView.cs）
```csharp
public void OnComment(KZoneCommentCfg _cfg)
{
    if (_cfg.options.NotEmpty())
    {
        // 显示选项面板
        optionPanel.SetActive(true);
        
        foreach (int optionId in _cfg.options)
        {
            if (Cfg.KZoneCommentCfgMap.TryGetValue(optionId, out optionCfg))
            {
                CreateOptionButton(optionCfg.content, optionId);
            }
        }
    }
}
```

---

## 五、配置示例

### 示例1: 简单评论链

```json
{
    "30101": {
        "id": 30101,
        "roles": [201],
        "parent": 0,
        "content": "今天天气真好！",
        "comments": [[30102, 3]],
        "options": [],
        "effect": [],
        "condition": [],
        "personality": []
    },
    "30102": {
        "id": 30102,
        "roles": [3, 201],
        "parent": 30101,
        "content": "是啊，适合出去玩",
        "comments": [],
        "options": [],
        "effect": [[1.0, 1.0, 3.0, 2.0]],
        "condition": [],
        "personality": []
    }
}
```

**流程**:
1. 角色201发表说说
2. 3秒后角色3自动回复
3. 亲密值+2

---

### 示例2: 带玩家选项的评论

```json
{
    "30201": {
        "id": 30201,
        "roles": [202],
        "parent": 0,
        "content": "你觉得我这件衣服怎么样？",
        "comments": [],
        "options": [30202, 30203],
        "effect": [],
        "condition": [],
        "personality": []
    },
    "30202": {
        "id": 30202,
        "roles": [-1, 202],
        "parent": 30201,
        "content": "很好看，很适合你！",
        "comments": [[30204, 2]],
        "options": [],
        "effect": [[1.0, 1.0, 3.0, 5.0]],
        "condition": [],
        "personality": []
    },
    "30203": {
        "id": 30203,
        "roles": [-1, 202],
        "parent": 30201,
        "content": "还行吧",
        "comments": [],
        "options": [],
        "effect": [[1.0, 1.0, 3.0, 1.0]],
        "condition": [],
        "personality": []
    },
    "30204": {
        "id": 30204,
        "roles": [202, -1],
        "parent": 30202,
        "content": "谢谢你的夸奖！",
        "comments": [],
        "options": [],
        "effect": [],
        "condition": []
    }
}
```

**流程**:
1. 角色202提问
2. 玩家选择回复选项（-1表示玩家）
   - 选项30202: 夸奖 → 亲密值+5 → 2秒后角色202感谢
   - 选项30203: 一般 → 亲密值+1

---

### 示例3: 带条件的评论

```json
{
    "30301": {
        "id": 30301,
        "roles": [201],
        "parent": 0,
        "content": "有人想一起去图书馆吗？",
        "comments": [],
        "options": [],
        "effect": [],
        "condition": [],
        "personality": []
    },
    "30302": {
        "id": 30302,
        "roles": [3, 201],
        "parent": 30301,
        "content": "我想去！",
        "comments": [],
        "options": [],
        "effect": [[1.0, 1.0, 3.0, 3.0]],
        "condition": [[14.0, 1.0, 201.0]],
        "personality": []
    }
}
```

**条件说明**:
- `condition: [[14.0, 1.0, 201.0]]` = 与角色201是恋人关系时才显示此评论

---

## 六、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/KZoneCommentCfg.cs` | 配置类定义 |
| `Assembly-CSharp/KZoneContentData.cs` | KZone内容数据管理 |
| `Assembly-CSharp/View/Common/KZoneCommon.cs` | 评论显示组件 |
| `Assembly-CSharp/View/TheAction/KZonePagePageHomeView.cs` | KZone主页界面 |
| `TextAsset/KZoneCommentCfg.json` | 配置文件 |

---

## 七、快速参考

| 用途 | 配置示例 |
|------|----------|
| 根评论 | `{"id": 30101, "roles": [201], "parent": 0, "content": "内容"}` |
| 回复评论 | `{"id": 30102, "roles": [3, 201], "parent": 30101, "content": "回复内容"}` |
| 自动评论链 | `"comments": [[30102, 5], [30103, 10]]` |
| 玩家选项 | `"options": [30102, 30103]` |
| 效果触发 | `"effect": [[1.0, 1.0, 3.0, 5.0]]` |
| 条件限制 | `"condition": [[14.0, 1.0, 201.0]]` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
