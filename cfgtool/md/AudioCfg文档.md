# AudioCfg.json 属性说明文档

基于《学生时代》游戏官方源代码解析

---

## 一、文件概述

**AudioCfg.json** 是游戏的音频配置文件，定义了所有背景音乐(BGM)、音效(SFX)、场景音和NPC语音。

- **加载路径**: `Cfgs/{语言}/AudioCfg.json`
- **存储位置**: `Cfg.AudioCfgMap` (Dictionary<int, AudioCfg>)
- **音频资源路径**: `StudentAge_Data/StreamingAssets/Audio/`

---

## 二、核心属性

| Key | 含义 | 格式/示例 |
|-----|------|-----------|
| `id` | 音频唯一ID | `2`, `20101`, `520201` |
| `name` | 音频名称 | `"春日拂晓"`, `"点击"`, `"中学打招呼"` |
| `url` | 音频文件路径 | `"bgm/chunji"`, `"short/click"`, `"npc/lin_greeting_1"` |
| `type` | 音频类型 | `1`=BGM, `2`=音效, `3`=场景音 |
| `volumn` | 音量大小 | `0`=默认音量, `0.5`=50%音量, `1`=100%音量 |
| `group` | BGM分组 | `[1, 2, 3]` 用于分类播放 |
| `disable` | 是否禁用 | `0`=启用, `1`=禁用 |
| `uiType` | UI类型 | `0`=普通, `1`=默认解锁, `>1`=NPC专属 |
| `cond` | 播放条件 | `[[条件类型, 操作符, 值], ...]` |

---

## 三、音频类型 (type)

| type值 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `1` | BGM (背景音乐) | 循环播放的背景音乐 | 春日拂晓、晴空正好 |
| `2` | 音效 (SFX) | 点击、交互等短音效 | 点击声、答对声 |
| `3` | 场景音 | 环境音效 | 电话铃声、雨声 |

---

## 四、音频ID范围

| ID范围 | 类型 | 说明 |
|--------|------|------|
| `1-100` | 主题曲BGM | 春日拂晓、晴空正好、开学季等 |
| `101-200` | 扩展BGM | 新增的背景音乐 |
| `1000+` | 场景/情绪BGM | 律动节奏、哀伤、葬礼等 |
| `10000+` | 特殊BGM | 星河舞会、茶歇等 |
| `10300+` | 场景BGM | 商店、书店、交涉背景音乐 |
| `10500+` | 事件BGM | 胜利、滴答、打架等 |
| `20000+` | 基础音效 | 点击、电话、商店铃声 |
| `21000+` | 游戏音效 | 答对、答错、点亮等 |
| `30000+` | 场景环境音 | 餐馆、大街、雨声等 |
| `40000+` | UI音效 | 悬停、点击、菜单等 |
| `41000+` | 无边框UI音效 | 现代风格UI音效 |
| `43000+` | 小游戏音效 | 考试、砍价、打砖块等 |
| `500000+` | NPC语音 | 角色打招呼、闲聊、道别 |

---

## 五、BGM分组 (group)

用于将BGM分类，实现分组随机播放。一个BGM可以属于多个分组。

### 5.1 分组枚举定义 (AudioGroupDefine)

| 数字值 | 枚举名称 | 含义 | 使用场景 |
|--------|----------|------|----------|
| `0` | (无效) | 空分组 | 代码中判断为无效，不分组播放 |
| `1` | Default | 默认分组 | 基础BGM分组 |
| `2` | Evt | 事件BGM分组 | 剧情事件时播放 |
| `3` | Spring | 春季BGM分组 | 春季季节自动播放 |
| `4` | Summer | 夏季BGM分组 | 夏季季节自动播放 |
| `5` | Autumn | 秋季BGM分组 | 秋季季节自动播放 |
| `6` | Winter | 冬季BGM分组 | 冬季季节自动播放 |
| `7` | Gaokao | 高考BGM分组 | 高考/考试场景 |
| `8` | Custom | 自定义分组 | QQ空间歌曲/玩家自定义音乐 |

### 5.2 常见分组组合

| 分组值 | 说明 | 包含BGM |
|--------|------|---------|
| `[1, 2, 3]` | 默认+事件+春季 | 春日拂晓 |
| `[1, 2, 4]` | 默认+事件+夏季 | 晴空正好 |
| `[1, 2, 5]` | 默认+事件+秋季 | 开学季 |
| `[1, 2, 6]` | 默认+事件+冬季 | 初雪 |
| `[8]` | 自定义(QQ空间) | QQ空间背景音乐 |
| `[]` | 无分组 | 独立播放的BGM(如鹅城进行曲) |

### 5.3 分组使用说明

- **多分组**: 一个BGM可以属于多个分组，如 `[1, 2, 3]` 表示既是默认BGM，也是事件BGM，也是春季BGM
- **季节自动播放**: 游戏根据当前季节自动播放对应分组(3/4/5/6)的BGM
- **空分组 `[]`**: 不参与分组随机播放，只能单独指定ID播放

---

## 六、播放条件 (cond)

主要用于NPC语音，控制语音的播放条件。

**格式**: `[[条件类型, 操作符, 值], ...]`

**示例**:
```json
"cond": [
    [3.0, -1.0, 720510.0]  // 条件类型3，操作符-1(不等于)，值720510
]
```

**常见用法**:
- 控制特定剧情阶段的语音播放
- 根据玩家选择显示不同语音
- 限制某些语音的出现条件

---

## 七、完整配置示例

### 示例1: BGM配置 (春日拂晓)

```json
{
    "id": 2,
    "name": "春日拂晓",
    "url": "bgm/chunji",
    "type": 1,              // BGM
    "disable": 0,           // 启用
    "group": [1, 2, 3],     // 春日拂晓组
    "volumn": 0,            // 默认音量
    "uiType": 1             // 默认解锁
}
```

### 示例2: 音效配置 (点击)

```json
{
    "id": 20101,
    "name": "点击",
    "url": "short/click",
    "type": 2,              // 音效
    "disable": 0,
    "group": [],
    "volumn": 0,            // 默认音量
    "uiType": 0
}
```

### 示例3: 场景音配置 (电话铃声)

```json
{
    "id": 20211,
    "name": "电话铃声",
    "url": "telephone_ring",
    "type": 3,              // 场景音
    "disable": 0,
    "group": [],
    "volumn": 0.5,          // 50%音量
    "uiType": 0
}
```

### 示例4: NPC语音配置 (带条件)

```json
{
    "id": 520212,
    "name": null,
    "url": "npc/lin_talk_2",
    "type": 2,              // 音效(NPC语音)
    "volumn": 0,
    "cond": [
        [3.0, -1.0, 720510.0]  // 特定条件才播放
    ]
}
```

### 示例5: 小游戏音效 (考试)

```json
{
    "id": 43031,
    "name": "考试蓝格",
    "url": "ogg/MiniGame_Exam_Blue",
    "type": 2,
    "volumn": 0.5           // 50%音量
}
```

---

## 八、代码实现详解

### 8.1 音频配置类 (AudioCfg.cs)

```csharp
[CfgClass(25060100UL, 8513)]
public class AudioCfg
{
    [CfgProperty(CfgPropertyType.Default, 8000, 8999)]
    public int id;                    // 音频ID

    [CfgProperty(CfgPropertyType.Default, 8001, 0)]
    public string name;               // 音频名称

    [CfgProperty(CfgPropertyType.Audio, 8011, 8990)]
    public string url;                // 音频文件路径

    [CfgProperty(CfgPropertyType.Default, 8003, 0, DefaultValue = 1)]
    public int type;                  // 音频类型

    [CfgProperty(CfgPropertyType.Default, 8012, 0, DefaultValue = 0f)]
    public float volumn;              // 音量大小

    [CfgProperty(CfgPropertyType.Default, 8013, 8989)]
    public List<int> group;           // 音频分组

    public List<List<double>> cond;   // 播放条件
    public int disable;               // 是否禁用
    public int uiType;                // UI类型
}
```

### 8.2 音频管理器 (AudioMgrEx.cs)

```csharp
// 播放背景音乐
public static void PlayMusic(int _channel, int _id, bool _isLoop, Action _callback)
{
    AudioCfg audioCfg = Cfg.AudioCfgMap[_id];
    PlayMusic(_channel, audioCfg.url, audioCfg.volumn, _isLoop, _callback);
}

// 播放音效
public static void PlaySoundOneShot(int _channel, int _id, float _pitch = 1f)
{
    AudioCfg audioCfg = Cfg.AudioCfgMap[_id];
    // 播放一次性音效
}

// 播放分组BGM
public static void PlayGroupBgm(AudioGroupDefine _group, bool _random, Action _callback = null)
{
    // 从指定分组中随机选择BGM播放
}

// 播放NPC语音
public static void PlayNpcSoundOneShot(int _id)
{
    AudioCfg audioCfg = Cfg.AudioCfgMap[_id];
    // 检查cond条件后播放
}
```

### 8.3 音频通道常量

```csharp
public const int CHANNEL_SOUND_UI = 0;      // UI音效通道
public const int CHANNEL_BGM = 1;           // 背景音乐通道
public const int CHANNEL_SOUND_SCENE = 2;   // 场景音效通道
public const int CHANNEL_SOUND_NPC = 3;     // NPC语音通道
```

---

## 九、使用场景

### 9.1 播放BGM

```csharp
// 播放指定BGM
AudioMgrEx.PlayMusic(AudioMgrEx.CHANNEL_BGM, 2, true, null);

// 播放分组BGM（随机）
AudioMgrEx.PlayGroupBgm(AudioGroupDefine.Spring, true);
```

### 9.2 播放音效

```csharp
// UI点击音效
AudioMgrEx.PlayUISound(20101);

// 场景音效
AudioMgrEx.PlaySceneSound(20211, true, null, 1f);
```

### 9.3 播放NPC语音

```csharp
// 播放NPC语音（自动检查cond条件）
AudioMgrEx.PlayNpcSoundOneShot(520201);
```

---

## 十、相关文件

| 文件路径 | 说明 |
|----------|------|
| `Assembly-CSharp/Config/AudioCfg.cs` | AudioCfg 类定义 |
| `Assembly-CSharp/AudioMgrEx.cs` | 音频管理器扩展 |
| `Assembly-CSharp/Config/Cfg.cs` | 配置加载管理 |
| `TextAsset/AudioCfg.json` | 音频配置文件 |
| `StreamingAssets/Audio/` | 音频资源目录 |

---

## 十一、音频资源路径说明

| 路径前缀 | 说明 | 示例 |
|----------|------|------|
| `bgm/` | 背景音乐 | `bgm/chunji` |
| `bgm2/` | 场景BGM | `bgm2/shangdianBgm` |
| `short/` | 短音效 | `short/click` |
| `ogg/` | UI/游戏音效 | `ogg/UI_Hover` |
| `npc/` | NPC语音 | `npc/lin_greeting_1` |
| `scene/` | 场景音效 | `scene/dajia` |
| `telephone_ring` | 电话铃声 | 根目录音效 |

---

## 十二、注意事项

1. **音频格式**: 游戏使用 OGG 和 WAV 格式
2. **音量设置**: `volumn=0` 表示使用默认音量，而非静音
3. **分组播放**: 同一组的BGM会循环随机播放
4. **条件判断**: NPC语音的 `cond` 条件在播放时自动检查
5. **资源路径**: `url` 路径相对于 `StreamingAssets/Audio/` 目录

---

*文档生成时间: 2026-02-24*  
*基于游戏版本: 学生时代的官方源代码*
