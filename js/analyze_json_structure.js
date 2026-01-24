// 分析JSON文件结构的脚本
const fs = require('fs');
const path = require('path');

// 读取JSON文件的函数
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return null;
    }
}

// 写入JSON文件的函数
function writeJsonFile(filePath, data, indent = 2) {
    try {
        const content = JSON.stringify(data, null, indent);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error.message);
    }
}

// 主函数
function main() {
    // 配置路径
    const cfgsPath = path.join(__dirname, 'TestMod', 'SALMC', 'Cfgs', 'zh-cn');
    const localizationPath = path.join(__dirname, 'localization', 'zh-cn', 'attributeCN.json');
    
    // 读取当前的汉化数据
    const attributeCN = readJsonFile(localizationPath) || {};
    
    // 读取所有JSON文件
    const jsonFiles = fs.readdirSync(cfgsPath).filter(file => file.endsWith('.json'));
    
    // 分析每个JSON文件的结构
    const fileStructures = {};
    
    jsonFiles.forEach(file => {
        const filePath = path.join(cfgsPath, file);
        const data = readJsonFile(filePath);
        
        if (!data) return;
        
        // 文件名转类型名 (如EvtCfg.json -> event)
        const typeName = file.replace('Cfg.json', '').replace(/^[A-Z]/, char => char.toLowerCase()).replace(/[A-Z]/g, char => `_${char.toLowerCase()}`);
        
        // 收集所有key
        const allKeys = new Set();
        
        for (const id in data) {
            const item = data[id];
            if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(key => allKeys.add(key));
            }
        }
        
        fileStructures[typeName] = Array.from(allKeys).sort();
        console.log(`${file} (${typeName}) has keys:`, Array.from(allKeys).sort());
    });
    
    // 更新attributeCN.json文件
    for (const [type, keys] of Object.entries(fileStructures)) {
        // 生成key名（如event -> EventKey）
        const keyName = `${type.charAt(0).toUpperCase() + type.slice(1)}Key`;
        
        if (!attributeCN[keyName]) {
            attributeCN[keyName] = {};
        }
        
        // 为每个key添加默认汉化
        keys.forEach(key => {
            if (!attributeCN[keyName][key]) {
                // 生成默认汉化
                let cnValue = key;
                
                // 简单的驼峰转中文
                cnValue = cnValue.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
                
                // 常见术语翻译
                const translations = {
                    'id': 'id',
                    'name': '名称',
                    'icon': '图标',
                    'type': '类型',
                    'title': '标题',
                    'desc': '描述',
                    'effect': '效果',
                    'condition': '条件',
                    'value': '数值',
                    'sell': '售价',
                    'maxcount': '最大数量',
                    'precondition': '前置条件',
                    'usingeffect': '使用效果',
                    'usingEffect': '使用效果',
                    'itemtag': '物品标签',
                    'itemTag': '物品标签',
                    'talkid': '对话id',
                    'talkId': '对话id',
                    'mapid': '地图id',
                    'mapId': '地图id',
                    'npc': 'NPC',
                    'rate': '概率',
                    'weight': '权重',
                    'content': '内容',
                    'options': '选项',
                    'probability': '可能性',
                    'replace': '替换',
                    'displaytype': '显示类型',
                    'displayType': '显示类型',
                    'maxoptions': '最大选项数',
                    'maxOptions': '最大选项数',
                    'minigame': '小游戏',
                    'miniGame': '小游戏',
                    'capacity': '容量',
                    'need': '需求',
                    'interactable': '可交互',
                    'audio': '音频',
                    'beginTime': '开始时间',
                    'endTime': '结束时间',
                    'expReward': '经验奖励',
                    'funcId': '功能id',
                    'label': '标签',
                    'next': '下一个',
                    'tag': '标签',
                    'unlock': '解锁',
                    'clothType': '服饰类型',
                    'rarity': '稀有度',
                    'sex': '性别',
                    'subType': '子类型',
                    'anime': '动画',
                    'attrs': '属性',
                    'bg': '背景',
                    'disableTxt': '禁用文本',
                    'cnt': '计数',
                    'cost': '消耗'
                };
                
                if (translations[key.toLowerCase()]) {
                    cnValue = translations[key.toLowerCase()];
                }
                
                attributeCN[keyName][key] = cnValue;
            }
        });
    }
    
    // 写入更新后的汉化数据
    writeJsonFile(localizationPath, attributeCN, 4);
    
    console.log('\nAnalysis complete!');
    console.log('Generated file structures:', fileStructures);
    console.log('Updated localization data in attributeCN.json');
    
    // 生成代码修改建议
    console.log('\nCode modification suggestions:');
    console.log('1. Update the renderer.js to dynamically display all keys for each type');
    console.log('2. Ensure the localization data is loaded correctly');
    console.log('3. Use the attributeCN.json data to display Chinese labels for all keys');
}

// 运行主函数
main();