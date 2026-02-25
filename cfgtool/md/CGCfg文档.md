# CGCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**CGCfg.json** 是游戏的CG（插画/结局图）配置文件。

- **加载路径**: `Cfgs/{语言}/CGCfg.json`
- **加载方式**: Addressables + MessagePack 序列化
- **存储位置**: `Cfg.CGCfgMap` (Dictionary<int, CGCfg>)

---

## 二、Key 详细说明

### 基础属性

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | CG唯一标识符 | `1`, `1001`, `990001` |
| `name` | string | CG显示名称 | `"你：上大学"`, `"孟怀安：结局1"` |
| `urls` | List<string> | 图片资源路径列表 | `["cg/cg_end_daxue_1", "cg/cg_end_daxue_2"]` |
| `group` | int | CG分组分类 | `0`=主线, `1`=个人结局, `2`=活动, `3`=其他, `4`=隐藏 |
| `idx` | int | 排序索引 | `1`, `2`, `3`... 用于图库排序 |

### 漫画模式属性

| Key | 类型 | 含义 | 格式/示例 |
|-----|------|------|-----------|
| `comic` | List<int> | 漫画分页配置 | `[2, 1, 3]` 表示每页显示的格子数 |
| `move` | List<int> | 翻页动画效果 | `[1, 2, 3]` 对应每页的动画方向 |

### 对话回放属性

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `startTalks` | List<int> | 关联对话ID列表 | `[1001, 1002]` CG回放时触发这些对话 |

---

## 三、核心属性详解

### 1. urls（图片路径）

**类型**: `List<string>`

**功能**: 
- 存储CG图片的资源路径
- **支持性别适配**: 索引0为男性版本，索引1为女性版本

**代码实现**:
```csharp
public static string GetImgUrl(this CGCfg _cfg, GenderDefine _gender = GenderDefine.Unknown)
{
    bool isFemale = _gender == GenderDefine.Female || 
                    (_gender == GenderDefine.Unknown && !Singleton<RoleMgr>.Ins.IsMale());
    
    if (_cfg.urls.Count > 1 && isFemale)
        return _cfg.urls[1];  // 返回女性版本
    
    return _cfg.urls[0];      // 返回男性版本
}
```

**配置示例**:
```json
"urls": [
    "cg/cg_end_daxue_1",    // 男性版本
    "cg/cg_end_daxue_2"     // 女性版本
]
```

**单图CG**:
```json
"urls": [
    "cg/cg_end_huoxing"     // 只有一张图，男女通用
]
```

---

### 2. group（分组）

**类型**: `int`

**功能**: 对CG进行分类，用于图库筛选和显示

**分组定义**:

| group值 | 含义 | 说明 |
|---------|------|------|
| `0` | 主线CG | 游戏主线剧情CG |
| `1` | 个人CG | 角色个人结局CG |
| `2` | 活动CG | 特殊活动/事件CG |
| `3` | 其他CG | 杂项CG（默认值） |
| `4` | 隐藏CG | 隐藏/秘密CG |

**代码定义**:
```csharp
[CfgProperty(CfgPropertyType.Default, 8013, 0, Hide = true, DefaultValue = 3)]
public int group;  // 默认值为3（其他）
```

**配置示例**:
```json
"group": 1  // 个人结局CG
```

---

### 3. idx（排序索引）

**类型**: `int`

**功能**: 控制CG在图库中的显示顺序

**特点**:
- 格式化为3位数字显示（如 `001`, `002`）
- 同一分组内按idx排序

**配置示例**:
```json
"idx": 1   // 显示为 "001"
"idx": 10  // 显示为 "010"
"idx": 99  // 显示为 "099"
```

---

### 4. comic（漫画分页）

**类型**: `List<int>`

**功能**: 漫画模式下，每页显示的漫画格子数量

**工作原理**:
- 数组长度 = 漫画总页数
- 每个值 = 该页显示的格子数

**配置示例**:
```json
"comic": [2, 1, 3]
```
**含义**:
- 第1页：显示2个格子
- 第2页：显示1个格子
- 第3页：显示3个格子

**实际配置**:
```json
{
    "id": 990001,
    "name": "书店情书",
    "urls": ["shudianqingshu"],
    "comic": [2, 1, 3],    // 3页，分别显示2/1/3个格子
    "move": [1, 2, 3]      // 对应每页的动画效果
}
```

---

### 5. move（动画效果）

**类型**: `List<int>`

**功能**: 漫画翻页时的动画移动方向

**动画类型**:

| move值 | 效果 | 说明 |
|--------|------|------|
| `1` | 左入 | 从左侧滑入 |
| `2` | 右入 | 从右侧滑入 |
| `3` | 下入 | 从下方滑入 |
| `4` | 上入 | 从上方滑入 |

**配置示例**:
```json
"move": [1, 2, 3]
```
**含义**:
- 第1页：从左侧滑入
- 第2页：从右侧滑入
- 第3页：从下方滑入

**与comic配合使用**:
```json
{
    "comic": [3, 2, 3],    // 3页，格子数分别为3/2/3
    "move": [1, 3, 2]      // 动画：左入/下入/右入
}
```

---

### 6. startTalks（关联对话）

**类型**: `List<int>`

**功能**: CG回放时触发的对话ID列表

**使用场景**:
- 在CG图库中查看CG时，可以回放相关剧情对话
- 点击CG后触发对应的对话事件

**配置示例**:
```json
"startTalks": [1001, 1002, 1003]
```
**含义**: 回放CG时，依次触发对话1001、1002、1003

**空数组表示无对话**:
```json
"startTalks": []
```

---

## 四、完整配置示例

### 示例1：普通结局CG（双版本）

```json
{
    "id": 1,
    "name": "你：上大学",
    "urls": [
        "cg/cg_end_daxue_1",    // 男性版本
        "cg/cg_end_daxue_2"     // 女性版本
    ],
    "group": 1,                 // 个人结局
    "idx": 1,                   // 排序001
    "startTalks": []            // 无关联对话
}
```

---

### 示例2：单图结局CG

```json
{
    "id": 13,
    "name": "你：太空任务",
    "urls": [
        "cg/cg_end_taikong"     // 单图，男女通用
    ],
    "group": 1,
    "idx": 13,
    "startTalks": []
}
```

---

### 示例3：漫画模式CG

```json
{
    "id": 990001,
    "name": "书店情书",
    "urls": [
        "shudianqingshu"
    ],
    "group": 3,
    "idx": 9001,
    "comic": [2, 1, 3],         // 3页，格子数：2/1/3
    "move": [1, 2, 3],          // 动画：左入/右入/下入
    "startTalks": []
}
```

---

### 示例4：带对话回放的CG

```json
{
    "id": 990005,
    "name": "游戏开场",
    "urls": [
        "youxikaichang"
    ],
    "group": 0,                 // 主线CG
    "idx": 9005,
    "comic": [2, 2, 2, 2],      // 4页，每页2格
    "move": [1, 2, 3, 4],       // 动画：左/右/下/上
    "startTalks": [1001, 1002]  // 回放时触发对话
}
```

---

## 五、代码加载流程

### 1. 配置加载（Cfg.cs）

```csharp
public static Dictionary<int, CGCfg> CGCfgMap { get; private set; }

// 异步加载
public static void LoadCGCfgMap()
{
    CfgMgr.LoadAsync<CGCfg>("Cfgs/" + LocalizationMgr.Lang + "/CGCfg", 
        delegate(Dictionary<int, CGCfg> _t)
    {
        Cfg.CGCfgMap = _t;
    });
}

// 同步加载
public static void LoadCGCfgMapAsync()
{
    Cfg.CGCfgMap = CfgMgr.Load<CGCfg>("Cfgs/" + LocalizationMgr.Lang + "/CGCfg");
}
```

### 2. 数据结构（CGCfg.cs）

```csharp
[CfgClass(25041001UL, 8510)]
public class CGCfg
{
    [CfgProperty(8000)]
    public int id;
    
    [CfgProperty(8001)]
    public string name;
    
    [CfgProperty(8004)]
    public List<string> urls;
    
    [CfgProperty(8013, DefaultValue = 3)]
    public int group;
    
    public int idx;
    public List<int> comic;
    public List<int> move;
    public List<int> startTalks;
}
```

### 3. 运行时数据结构（CGLibData.cs）

```csharp
public struct CGLibData
{
    public int id;              // CG ID
    public List<string> urls;   // 已解锁的URL列表
    public List<string> allUrls;// 所有URL列表
    public int group;           // 分组
    public int npc;             // 关联的NPC ID
}
```

---

## 六、使用场景

| 场景 | 相关View | 说明 |
|------|----------|------|
| 单CG展示 | CGView | 显示单张CG图片 |
| CG图库 | CG2View, CGLibraryView | 多图翻页、分组筛选 |
| 事件CG | CG3View | 带对话的CG展示 |
| 漫画模式 | ComicView | 分页动画效果 |
| 结局展示 | EndingView | 结局CG展示 |

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/CGCfg.cs` | CGCfg 类定义 |
| `Assembly-CSharp/View/Main/CGLibData.cs` | 运行时数据结构 |
| `Assembly-CSharp/CfgExtension.cs` | 扩展方法（GetImgUrl） |
| `TextAsset/CGCfg.json` | 配置文件 |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
