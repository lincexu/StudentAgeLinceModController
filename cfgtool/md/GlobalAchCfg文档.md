# GlobalAchCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**GlobalAchCfg.json** 是游戏的成就系统配置文件，定义了所有可解锁成就的属性。

- **加载路径**: `Cfgs/{语言}/GlobalAchCfg.json`
- **存储位置**: `Cfg.GlobalAchCfgMap` (Dictionary<int, GlobalAchCfg>)
- **数据持久化**: `GlobalModel.unlockAch` (List<int>)

---

## 二、核心属性

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 成就唯一ID | `1001`, `2001` |
| `name` | string | 成就名称 | `"学生时代"`, `"聪明伶俐"` |
| `desc` | string | 成就描述 | `"通关一周目"` |
| `cond` | `List<List<double>>` | **解锁条件** | `[[4.0, 30.0, 1.0, 8.0]]` |
| `effect` | `List<List<float>>` | **解锁奖励** | `[[1.0, 1.0, 1.0, 100.0]]` |
| `hide` | int | 是否隐藏 | `0`=显示, `1`=隐藏 |
| `icon` | string | 图标路径 | `"achieve/img_1001"` |
| `texture` | string | 纹理/头像路径 | `"head/head_104"` |
| `checkType` | int | 检查类型 | `0`=常规, `1`=特殊 |
| `impossible` | `List<List<double>>` | 排除条件 | 用于排除不可能情况 |

---

## 三、属性详解

### 3.1 cond（解锁条件）

**格式**: `[[条件类型, 参数1, 参数2, ...], ...]`

**常见条件类型**:

| 类型值 | 含义 | 参数说明 |
|--------|------|----------|
| `4.0` | 属性检查 | `[4.0, 属性ID, 操作符, 评级]` 如 `[4.0, 30.0, 1.0, 8.0]` = 智力评级≥S |
| `7.0` | 关系检查 | `[7.0, 0.0, 角色ID, 关系等级]` 如 `[7.0, 0.0, 104.0, 6.0]` = 与角色104关系≥至交 |
| `14.0` | 恋爱检查 | `[14.0, 1.0, 角色ID]` = 与指定角色成为恋人 |
| `52.0` | 恋爱检查2 | `[52.0, 1.0, 角色ID]` = 与指定角色成为恋人 |
| `200.0` | 结局检查 | `[200.0, 结局ID]` = 达成指定结局 |
| `999.0` | 特殊条件 | `[999.0, 特殊类型, ...]` |

**示例**:
```json
"cond": [
    [4.0, 30.0, 1.0, 8.0],      // 智力评级≥S
    [7.0, 0.0, 104.0, 6.0]      // 与角色104关系≥至交
]
```

### 3.2 effect（解锁奖励）

**格式**: `[[效果类型, 子类型, 参数...], ...]`

**常见效果**:

| 效果类型 | 含义 | 示例 |
|----------|------|------|
| `1.0` | 属性变化 | `[1.0, 1.0, 1.0, 100.0]` = 智力+100 |
| `2.0` | 添加物品 | `[2.0, 物品ID, 数量]` |
| `3.0` | 触发事件 | `[3.0, 事件ID]` |

**示例**:
```json
"effect": [
    [1.0, 1.0, 1.0, 100.0],     // 智力+100
    [1.0, 1.0, 3.0, 50.0]       // 心情+50
]
```

### 3.3 hide（隐藏成就）

| 值 | 效果 |
|----|------|
| `0` | 正常显示名称和描述 |
| `1` | 显示为"???"（隐藏名称和描述） |

**用途**: 用于隐藏剧透性成就，玩家解锁前看不到具体内容。

### 3.4 icon 与 texture

| 属性 | 用途 |
|------|------|
| `icon` | 成就列表中显示的图标 |
| `texture` | 社交/关系类成就的角色头像 |

**示例**:
```json
{
    "icon": "achieve/img_1001",
    "texture": "head/head_104"    // 角色104的头像
}
```

### 3.5 checkType（检查类型）

| 值 | 含义 |
|----|------|
| `0` | 常规检查（游戏过程中实时检查） |
| `1` | 特殊检查（如游戏结束时统一检查） |

**用途**: 结局类成就通常使用 `checkType=1`，在游戏结束时统一检查。

### 3.6 impossible（排除条件）

**格式**: 与 `cond` 相同

**用途**: 定义不可能达成成就的条件，用于排除某些情况。

**示例**:
```json
"impossible": [
    [200.0, 1001.0]    // 如果已达成结局1001，则此成就不可解锁
]
```

---

## 四、成就分类（ID范围）

| ID范围 | 分类 | 说明 |
|--------|------|------|
| 1-5 | 分类标题 | 基础、学习、社交、运动、成长 |
| 1001-1999 | 基础成就 | 游戏基础玩法相关 |
| 2001-2999 | 学习成就 | 学习成绩、智力相关 |
| 3001-3999 | 社交成就 | 人际关系、恋爱相关 |
| 4001-4999 | 运动成就 | 体育、体魄相关 |
| 5001-5999 | 成长成就 | 结局、职业发展相关 |

---

## 五、代码实现详解

### 5.1 成就检查逻辑（GlobalMgr.cs）

```csharp
// 检查特定条件类型的成就
public void CheckAchievement(int _condType, int _checkType = 0)
{
    foreach (var pair in Cfg.GlobalAchCfgMap)
    {
        // 检查类型匹配且未解锁
        if (pair.Value.checkType == _checkType 
            && !this.HasAchievement(pair.Key) 
            && pair.Value.cond != null)
        {
            // 查找是否包含指定条件类型
            if (pair.Value.cond.Find(c => c[0] == _condType) != null 
                && CommonEvtMgr.IsMatchCondition(pair.Value.cond, false))
            {
                this.AddAchievement(pair.Key);
            }
        }
    }
}

// 检查所有成就（游戏结束时）
public void CheckAllAchievement(int _checkType = 0)
{
    foreach (var pair in Cfg.GlobalAchCfgMap)
    {
        if (!this.HasAchievement(pair.Key) 
            && pair.Value.checkType == _checkType 
            && pair.Value.cond != null 
            && CommonEvtMgr.IsMatchCondition(pair.Value.cond, false))
        {
            this.AddAchievement(pair.Key);
        }
    }
}
```

### 5.2 添加成就（GlobalMgr.cs）

```csharp
public void AddAchievement(int _id)
{
    // 记录到本地存档
    Singleton<RecordMgr>.Ins.AddAchievement(_id);
    
    // 添加到全局模型
    if (this.model.unlockAch == null)
        this.model.unlockAch = new List<int> { _id };
    else
    {
        if (this.model.unlockAch.Contains(_id)) return;
        this.model.unlockAch.Add(_id);
    }
    
    Debug.Log("成就解锁：" + _id);
    
    // 同步到Steam
    Platform.Current.SetAchievement(_id.ToString());
    Platform.Current.StoreStat();
    
    // 执行奖励效果
    Effector effector = CommonEvtMgr.GenEffector(
        Cfg.GlobalAchCfgMap[_id].effect, null, 0, 0);
    if (effector != null)
        effector.Run(1f, false);
    
    // 显示解锁提示
    Singleton<ToastCtrl>.Ins.ToastGlobalAch(_id);
    
    // 保存全局数据
    SaveMgrEx.SaveGlobal();
}
```

### 5.3 条件判断（CommonEvtMgr.cs）

```csharp
public static bool IsMatchCondition(List<List<double>> _conditions, bool _emptyIsTrue = false)
{
    if (_conditions.IsEmpty())
        return _emptyIsTrue;
    
    Conditioner conditioner = CommonEvtMgr.GenConditioner(_conditions, null);
    if (conditioner != null)
        return conditioner.IsMatch();
    return false;
}
```

---

## 六、配置示例

### 示例1：基础成就（通关）

```json
{
    "id": 1001,
    "name": "学生时代",
    "desc": "通关一周目",
    "cond": [[200.0, 1001.0]],      // 达成结局1001
    "effect": [[1.0, 1.0, 1.0, 100.0]],  // 智力+100
    "hide": 0,
    "icon": "achieve/img_1001",
    "checkType": 1                   // 游戏结束时检查
}
```

### 示例2：学习成就（智力评级）

```json
{
    "id": 2001,
    "name": "聪明伶俐",
    "desc": "智力评级达到S",
    "cond": [[4.0, 30.0, 1.0, 8.0]],  // 属性30(智力)评级≥8(S)
    "effect": [[1.0, 1.0, 1.0, 50.0]],
    "hide": 0,
    "icon": "achieve/img_2001",
    "checkType": 0                    // 实时检查
}
```

### 示例3：社交成就（恋爱）

```json
{
    "id": 3001,
    "name": "初恋",
    "desc": "与任意角色成为恋人",
    "cond": [[14.0, 1.0, 0.0]],       // 与任意角色成为恋人
    "effect": [[1.0, 1.0, 3.0, 30.0]], // 心情+30
    "hide": 0,
    "icon": "achieve/img_3001",
    "checkType": 0
}
```

### 示例4：隐藏成就

```json
{
    "id": 5001,
    "name": "隐藏结局",
    "desc": "达成隐藏结局",
    "cond": [[200.0, 9999.0]],        // 达成特殊结局
    "effect": [],
    "hide": 1,                        // 隐藏成就
    "icon": "achieve/img_secret",
    "checkType": 1
}
```

### 示例5：带排除条件的成就

```json
{
    "id": 4001,
    "name": "运动健将",
    "desc": "体魄评级达到S且未达成体育生结局",
    "cond": [[4.0, 32.0, 1.0, 8.0]],  // 体魄评级≥S
    "impossible": [[200.0, 4001.0]],  // 排除：已达成体育生结局
    "effect": [[1.0, 1.0, 32.0, 50.0]],
    "hide": 0,
    "icon": "achieve/img_4001",
    "checkType": 0
}
```

---

## 七、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Config/GlobalAchCfg.cs` | 成就配置类定义 |
| `GlobalMgr.cs` | 成就系统核心逻辑 |
| `GlobalModel.cs` | 成就数据存储 |
| `CommonEvtMgr.cs` | 条件判断系统 |
| `View/Main/GlobalAchView.cs` | 成就列表界面 |
| `View/Common/ToastView.cs` | 成就解锁提示 |
| `TextAsset/GlobalAchCfg.json` | 成就配置文件 |

---

## 八、快速参考

### 条件类型速查表

| 类型 | 用途 | 格式 |
|------|------|------|
| `4` | 属性评级 | `[4, 属性ID, 操作符, 评级]` |
| `7` | 关系等级 | `[7, 0, 角色ID, 等级]` |
| `14` | 成为恋人 | `[14, 1, 角色ID]` |
| `52` | 成为恋人2 | `[52, 1, 角色ID]` |
| `200` | 结局达成 | `[200, 结局ID]` |
| `999` | 特殊条件 | `[999, 子类型, ...]` |

### 评级对照表

| 评级值 | 等级 |
|--------|------|
| `1` | D |
| `2` | C |
| `3` | B |
| `4` | A |
| `5` | S |
| `6` | SS |
| `7` | SSS |
| `8` | EX |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
