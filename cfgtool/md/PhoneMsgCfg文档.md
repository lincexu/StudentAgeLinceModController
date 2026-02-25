# PhoneMsgCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**PhoneMsgCfg.json** 是游戏的手机短信/聊天配置文件，定义了角色之间通过手机发送的消息内容、对话流程、触发条件和效果。

- **加载路径**: `Cfgs/{语言}/PhoneMsgCfg`
- **存储位置**: `Cfg.PhoneMsgCfgMap` (Dictionary<int, PhoneMsgCfg>)
- **用途**: 配置手机短信对话、聊天选项、触发条件和效果

---

## 二、属性列表

| Key | 类型 | 含义 | 示例 |
|-----|------|------|------|
| `id` | int | 消息唯一ID | `301001`, `301002` |
| `role` | int | 发送者角色ID | `0`=玩家, `3`=梁超杰 |
| `content` | string | 消息内容 | `"在干嘛呢？"` |
| `option` | string | 选项文本 | `"在看书"` |
| `next` | List<int> | 下一跳消息ID | `[301002, 301003]` |
| `cond` | List<List<double>> | 触发条件 | `[[7.0,1.0,3.0,150.0]]` |
| `effect` | List<List<float>> | 效果列表 | `[[1.0,1.0,3.0,5.0]]` |

---

## 三、属性详解

### 3.1 id

**类型**: `int`

**功能**: 消息的唯一标识符

**编码规则**: 6位数字
- 前3位: 角色/剧情组标识
- 后3位: 消息序号

**示例**:
```json
"id": 301001  // 角色3的第1条消息
"id": 301002  // 角色3的第2条消息
```

---

### 3.2 role ⭐重要

**类型**: `int`

**功能**: 消息发送者的角色ID

| 值 | 含义 |
|----|------|
| `0` | 玩家自己（主角） |
| `>0` | NPC角色ID，对应 PersonCfg.id |

**示例**:
```json
"role": 0     // 玩家发送
"role": 3     // 梁超杰发送
"role": 101   // 小纯发送
```

**说明**:
- 当 `role = 0` 时，`option` 显示为玩家的回复选项
- 当 `role > 0` 时，`content` 显示为NPC发送的消息内容

---

### 3.3 content

**类型**: `string`

**功能**: 消息文本内容

**示例**:
```json
"content": "在干嘛呢？"
"content": "今天天气真好，要不要一起去图书馆？"
```

**说明**:
- 支持变量替换（通过 RecordMgr.Replace）
- 支持表情符号 `<sprite=X>`

---

### 3.4 option ⭐重要

**类型**: `string`

**功能**: 选项文本

**示例**:
```json
"option": "在看书"
"option": "好啊，一起去"
"option": "不好意思，我有事"
```

**说明**:
- 仅当 `role = 0`（玩家发送）时有效
- 显示为玩家可以选择的回复选项
- 多个选项对应不同的 `next` 分支

---

### 3.5 next ⭐重要

**类型**: `List<int>`

**功能**: 下一跳消息ID列表

**示例**:
```json
"next": [301002]           // 单线对话
"next": [301002, 301003]   // 分支选项
"next": []                  // 对话结束
```

**说明**:
- 单线对话: 只有一个下一跳ID
- 分支对话: 多个下一跳ID对应不同选项
- 空数组: 表示对话结束

**对话流程示例**:
```
301001 (NPC: 在干嘛呢？)
    ↓
301002 (玩家选项1: 在看书) → next: [301003]
301006 (玩家选项2: 在玩游戏) → next: [301007]
    ↓
301003 (NPC: 真勤奋！)
    ↓
next: [] (对话结束)
```

---

### 3.6 cond ⭐重要

**类型**: `List<List<double>>`

**功能**: 消息触发条件

**格式**: `[[条件类型, 参数1, 参数2, ...], ...]`

**条件类型代码**:

| 代码 | 条件类 | 说明 |
|------|--------|------|
| `0` | ConditionerRandom | 随机条件 |
| `1` | ConditionerAge | 年龄条件 |
| `2` | ConditionerDate | 日期条件 [年,月] |
| `3` | ConditionerEvent | 事件条件 |
| `4` | ConditionerAttr | 属性条件 [属性ID,数值] |
| `5` | ConditionerSkill | 技能条件 |
| `6` | ConditionerCharacter | 性格条件 |
| `7` | ConditionerRelation | 关系条件 [操作符,角色ID,数值] |
| `8` | ConditionerStatus | 状态条件 |
| `10` | ConditionerKnowledge | 知识条件 |
| `11` | ConditionerLove | 恋爱条件 |
| `12` | ConditionerAction | 行动条件 |
| `22` | ConditionerNpc | NPC条件 |
| `60` | ConditionerItem | 物品条件 |
| `100` | ConditionerOtherAttr | 其他属性条件 |

**示例**:
```json
"cond": [
    [7.0, 1.0, 3.0, 150.0],    // 与角色3的关系≥150
    [2.0, 3.0, 2013.0, 6.0],   // 2013年6月
    [4.0, 1.0, 100.0]          // 智商≥100
]
```

**代码应用**:
```csharp
// 检查消息是否可以触发
bool canTrigger = true;
foreach (var condition in phoneMsgCfg.cond)
{
    if (!CheckCondition(condition))
    {
        canTrigger = false;
        break;
    }
}
```

---

### 3.7 effect ⭐重要

**类型**: `List<List<float>>`

**功能**: 消息触发后的效果

**格式**: `[[效果类型, 子类型, 属性ID, 数值], ...]`

**效果类型代码**:

| 代码 | 效果类 | 说明 |
|------|--------|------|
| `1` | EffectorChangeAttr | 改变属性 [子类型,属性ID,数值] |
| `2` | EffectorWorldview | 改变世界观 |
| `3` | EffectorChangeSkill | 改变技能 |
| `4` | EffectorChangeKnowledge | 改变知识 |
| `5` | EffectorChangeAction | 改变行动 |
| `6` | EffectorChangeRelation | 改变关系 [子类型,角色ID,数值] |
| `7` | EffectorChangeItem | 改变物品 |
| `20` | EffectorChangeState | 改变状态 |
| `21` | EffectorChangeCharacter | 改变性格 |
| `22` | EffectorChangeHobby | 改变爱好 |
| `52` | EffectorLove | 恋爱相关 |
| `999` | EffectorSpecial | 特殊效果 |

**示例**:
```json
"effect": [
    [1.0, 1.0, 3.0, 5.0],     // 亲密值+5
    [6.0, 1.0, 3.0, 10.0],    // 与角色3的关系+10
    [7.0, 1.0, 1001.0, 1.0]   // 获得物品1001
]
```

---

## 四、代码实现

### 4.1 类定义

**文件**: `Assembly-CSharp/Config/PhoneMsgCfg.cs`

```csharp
public class PhoneMsgCfg
{
    public List<List<double>> cond;   // 触发条件
    public string content;             // 消息内容
    public List<List<float>> effect;   // 效果列表
    public int id;                     // 消息ID
    public List<int> next;             // 下一跳消息ID
    public string option;              // 选项文本
    public int role;                   // 发送者角色ID
}
```

### 4.2 加载接口

**文件**: `Assembly-CSharp/Config/Cfg.cs`

```csharp
public static Dictionary<int, PhoneMsgCfg> PhoneMsgCfgMap { get; private set; }

[CfgMethod(CfgMethodAttributeType.Async)]
public static void LoadPhoneMsgCfgMap()
{
    CfgMgr.LoadAsync<PhoneMsgCfg>("Cfgs/" + LocalizationMgr.Lang + "/PhoneMsgCfg", 
        delegate(Dictionary<int, PhoneMsgCfg> _t)
    {
        Cfg.PhoneMsgCfgMap = _t;
    });
}
```

### 4.3 消息触发检查

**文件**: `Assembly-CSharp/PhoneData.cs`

```csharp
public void CheckMsgs()
{
    foreach (var phoneMsgCfg in Cfg.PhoneMsgCfgMap.Values)
    {
        // 检查条件
        bool canTrigger = true;
        foreach (var condition in phoneMsgCfg.cond)
        {
            if (!CommonEvtMgr.IsMatchCondition(condition, true))
            {
                canTrigger = false;
                break;
            }
        }
        
        if (canTrigger)
        {
            // 发送消息
            PostMsg(phoneMsgCfg);
        }
    }
}
```

### 4.4 发送消息

**文件**: `Assembly-CSharp/PhoneData.cs`

```csharp
public void PostMsg(PhoneMsgCfg _cfg)
{
    // 创建消息数据
    PhoneMsgData msgData = new PhoneMsgData
    {
        id = _cfg.id,
        roleId = _cfg.role,
        content = _cfg.content,
        postTime = DateTime.Now,
        isRead = false
    };
    
    // 添加到消息列表
    this.msgs.Add(msgData);
    
    // 触发效果
    if (_cfg.effect.NotEmpty())
    {
        EffectorCtrl.DoEffect(_cfg.effect);
    }
}
```

### 4.5 玩家选择回复

**文件**: `Assembly-CSharp/View/Main/PhonePageMsgView.cs`

```csharp
public void SelectOption(int _optionIndex)
{
    PhoneMsgCfg currentCfg = Cfg.PhoneMsgCfgMap[this.currentMsgId];
    
    // 获取选择的下一跳ID
    int nextId = currentCfg.next[_optionIndex];
    
    if (nextId > 0)
    {
        // 继续对话
        ShowMsg(nextId);
    }
    else
    {
        // 对话结束
        CloseChat();
    }
}
```

### 4.6 效果触发

**文件**: `Assembly-CSharp/Effect/EffectSocialMedia.cs`

```csharp
// type=200 的效果触发发送手机消息
if (this.type == 200)
{
    Singleton<RoleMgr>.Ins.GetPhoneData(false).PostMsg(
        Cfg.PhoneMsgCfgMap[this.id]
    );
}
```

---

## 五、配置示例

### 示例1: 简单对话

```json
{
    "301001": {
        "id": 301001,
        "role": 3,
        "content": "在干嘛呢？",
        "option": null,
        "next": [301002],
        "cond": [[7.0, 1.0, 3.0, 100.0]],
        "effect": []
    },
    "301002": {
        "id": 301002,
        "role": 0,
        "content": null,
        "option": "在看书",
        "next": [301003],
        "cond": [],
        "effect": []
    },
    "301003": {
        "id": 301003,
        "role": 3,
        "content": "真勤奋啊！",
        "option": null,
        "next": [],
        "cond": [],
        "effect": [[1.0, 1.0, 3.0, 5.0]]
    }
}
```

**流程**:
1. 梁超杰(role=3)发送"在干嘛呢？"
2. 玩家选择"在看书"
3. 梁超杰回复"真勤奋啊！"
4. 亲密值+5

---

### 示例2: 分支对话

```json
{
    "302001": {
        "id": 302001,
        "role": 101,
        "content": "周末有空吗？",
        "option": null,
        "next": [302002],
        "cond": [[2.0, 3.0, 2013.0, 6.0]],
        "effect": []
    },
    "302002": {
        "id": 302002,
        "role": 0,
        "content": null,
        "option": "有空啊，怎么了？",
        "next": [302003],
        "cond": [],
        "effect": []
    },
    "302003": {
        "id": 302003,
        "role": 101,
        "content": "想约你一起去图书馆复习",
        "option": null,
        "next": [302004, 302005],
        "cond": [],
        "effect": []
    },
    "302004": {
        "id": 302004,
        "role": 0,
        "content": null,
        "option": "好啊，一起去",
        "next": [302006],
        "cond": [],
        "effect": [[1.0, 1.0, 3.0, 10.0]]
    },
    "302005": {
        "id": 302005,
        "role": 0,
        "content": null,
        "option": "不好意思，我有别的安排了",
        "next": [302007],
        "cond": [],
        "effect": []
    },
    "302006": {
        "id": 302006,
        "role": 101,
        "content": "太好了！那周六上午见",
        "option": null,
        "next": [],
        "cond": [],
        "effect": [[6.0, 1.0, 101.0, 15.0]]
    },
    "302007": {
        "id": 302007,
        "role": 101,
        "content": "好吧，那下次再约",
        "option": null,
        "next": [],
        "cond": [],
        "effect": []
    }
}
```

**流程**:
1. 小纯询问周末是否有空
2. 玩家回复"有空"
3. 小纯提出去图书馆
4. 玩家选择分支:
   - 选项1: 同意 → 亲密值+10，关系+15
   - 选项2: 拒绝 → 无效果

---

### 示例3: 带条件的消息

```json
{
    "303001": {
        "id": 303001,
        "role": 201,
        "content": "听说你最近学习很努力，加油！",
        "option": null,
        "next": [303002],
        "cond": [
            [4.0, 1.0, 1.0, 150.0],     // 智商≥150
            [7.0, 1.0, 201.0, 80.0]     // 与角色201关系≥80
        ],
        "effect": [[1.0, 1.0, 0.0, 10.0]]
    },
    "303002": {
        "id": 303002,
        "role": 0,
        "content": null,
        "option": "谢谢鼓励！",
        "next": [],
        "cond": [],
        "effect": [[1.0, 1.0, 3.0, 5.0]]
    }
}
```

**说明**: 只有智商≥150且与角色201关系≥80时才会触发此消息

---

## 六、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/PhoneMsgCfg.cs` | 配置类定义 |
| `Assembly-CSharp/Config/Cfg.cs` | 配置加载接口 |
| `Assembly-CSharp/PhoneData.cs` | 手机数据管理 |
| `Assembly-CSharp/PhoneMsgData.cs` | 消息数据类 |
| `Assembly-CSharp/View/Main/PhonePageMsgView.cs` | 手机聊天界面 |
| `Assembly-CSharp/Effect/EffectSocialMedia.cs` | 效果触发 |
| `TextAsset/PhoneMsgCfg.json` | 配置文件 |

---

## 七、快速参考

| 用途 | 配置示例 |
|------|----------|
| NPC发送消息 | `{"id": 301001, "role": 3, "content": "你好"}` |
| 玩家回复选项 | `{"id": 301002, "role": 0, "option": "你好"}` |
| 单线对话 | `"next": [301002]` |
| 分支对话 | `"next": [301003, 301004]` |
| 对话结束 | `"next": []` |
| 关系条件 | `"cond": [[7.0, 1.0, 3.0, 100.0]]` |
| 日期条件 | `"cond": [[2.0, 3.0, 2013.0, 6.0]]` |
| 属性效果 | `"effect": [[1.0, 1.0, 3.0, 5.0]]` |
| 关系效果 | `"effect": [[6.0, 1.0, 3.0, 10.0]]` |

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
