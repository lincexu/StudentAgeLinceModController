// 配置管理模块
class ConfigManager {
    constructor() {
        this.config = null;
        this.defaultConfig = null;
        this.listeners = [];
        this.translations = null;
        this.attributeCN = null;
        // 简繁映射表
        this.simplifiedToTraditional = {
            "学生时代模组兼容分析工具": "學生時代模組兼容分析工具",
            "切换暗夜模式": "切換暗夜模式",
            "切换简繁": "切換簡繁",
            "导出报告": "匯出報告",
            "设置": "設定",
            "上传多个模组文件夹进行分析，检测重复ID": "上傳多個模組資料夾進行分析，檢測重複ID",
            "点击或拖拽（某些浏览器暂不支持）选择模组文件夹": "點擊或拖拽（某些瀏覽器暫不支持）選擇模組資料夾",
            "支持选择多个文件夹": "支持選擇多個資料夾",
            "开始分析": "開始分析",
            "准备分析...": "準備分析...",
            "分析结果": "分析結果",
            "⚠️ 重复事件ID检测": "⚠️ 重複事件ID檢測",
            "📊 分析摘要": "📊 分析摘要",
            "警告": "警告",
            "您正在使用文件协议（file://）运行应用，部分功能可能受限。建议使用本地HTTP服务器运行以获得完整功能体验。": "您正在使用文件協議（file://）運行應用，部分功能可能受限。建議使用本地HTTP服務器運行以獲得完整功能體驗。",
            "推荐使用：python -m http.server 8000 或双击 start_server.bat（Windows）": "推薦使用：python -m http.server 8000 或雙擊 start_server.bat（Windows）",
            "清理已选择的文件夹": "清理已選擇的資料夾",
            "请先进行分析，生成结果后再导出报告": "請先進行分析，生成結果後再匯出報告",
            "确定要清理所有已选择的文件夹吗？": "確定要清理所有已選擇的資料夾嗎？"
        };
        this.init();
    }

    /**
     * 初始化配置管理器
     */
    init() {
        // 设置默认配置
        this.defaultConfig = {
            projectName: "Student Age LMC",
            author: "Lince",
            version: "1.0.0",
            description: "学生时代模组兼容分析工具，用于检测模组中的重复ID",
            themeMode: 3, // 0-永昼模式，1-永夜模式，3-跟随系统
            language: "zh-cn", // zh-cn-简体中文，zh-tw-繁体中文
            exportFormat: "markdown", // 默认导出格式
            showProgress: true, // 是否显示分析进度
            generateDetailedReport: true, // 是否生成详细报告
            autoOpenBrowser: true, // 是否自动打开浏览器
            developerMode: false, // 是否开启开发者模式
            developerPassword: "", // 开发者模式密码
            opacity: 85 // 页面透明度，默认85%
        };
        
        // 直接使用简体中文作为默认翻译
        this.translations = {
            "zh-cn": {
                "appTitle": "学生时代模组兼容分析工具",
                "toolbar.themeToggle": "切换暗夜模式",
                "toolbar.languageToggle": "切换简繁",
                "toolbar.exportReport": "导出报告",
                "toolbar.settings": "设置",
                "uploadInstruction": "上传多个模组文件夹进行分析，检测重复ID",
                "uploadLabel.text": "点击或拖拽（某些浏览器暂不支持）选择模组文件夹",
                "uploadLabel.hint": "支持选择多个文件夹",
                "analyzeBtn": "开始分析",
                "progress.preparing": "准备分析...",
                "resultHeader.title": "分析结果",
                "duplicateSection.title": "⚠️ 重复事件ID检测",
                "summarySection.title": "📊 分析摘要",
                "fileProtocolWarning.title": "警告",
                "fileProtocolWarning.message": "您正在使用文件协议（file://）运行应用，部分功能可能受限。建议使用本地HTTP服务器运行以获得完整功能体验。",
                "fileProtocolWarning.recommendation": "推荐使用：python -m http.server 8000 或双击 start_server.bat（Windows）",
                "clearBtn": "清理已选择的文件夹",
                "exportReport.ready": "请先进行分析，生成结果后再导出报告",
                "clearBtn.confirm": "确定要清理所有已选择的文件夹吗？"
            }
        };
        
        // 默认的属性中文映射
        this.attributeCN = {};
    }
    
    /**
     * 加载属性中文映射
     */
    async loadAttributeCN() {
        try {
            const response = await fetch('./localization/zh-cn/attributeCN.json', {
                cache: 'no-cache'
            });
            if (response.ok) {
                this.attributeCN = await response.json();
                console.log('[Config] 属性中文映射加载成功:', this.attributeCN);
            } else {
                console.log('[Config] 属性中文映射加载失败，使用默认映射，状态码:', response.status);
            }
        } catch (error) {
            console.log('[Config] 无法加载属性中文映射，使用默认映射:', error.message);
            // 手动设置默认映射，确保基本功能可用
            this.attributeCN = {
                "ItemKey": {
                    "id": "id",
                    "name": "名称",
                    "icon": "图标",
                    "type": "类型"
                },
                "EvtKey": {
                    "id": "id",
                    "title": "标题",
                    "type": "类型"
                },
                "BookKey": {
                    "id": "id",
                    "name": "名称",
                    "type": "类型"
                },
                "ActionKey": {
                    "id": "id",
                    "name": "名称",
                    "type": "类型"
                }
            };
        }
    }
    
    /**
     * 验证开发者模式密码
     * @param {string} password - 输入的密码
     * @returns {boolean} 是否验证通过
     */
    verifyDeveloperPassword(password) {
        // 开发者模式密码（可以通过配置文件修改）
        const devPassword = this.get('developerPassword') || "salmc-dev-2024";
        console.log('[Config] 验证开发者密码:', password, 'vs', devPassword);
        return password === devPassword;
    }
    
    /**
     * 获取翻译文本
     * @param {string} key 翻译键
     * @param {string} language 语言代码（可选）
     * @returns {string} 翻译后的文本
     */
    t(key, language = null) {
        const lang = language || this.config?.language || this.defaultConfig.language;
        // 获取简体中文文本
        const simplifiedText = this.translations["zh-cn"][key] || key;
        
        // 如果是繁体中文，进行映射转换
        if (lang === "zh-tw") {
            return this.simplifiedToTraditional[simplifiedText] || simplifiedText;
        }
        
        return simplifiedText;
    }

    /**
     * 解析JSONC格式（带注释的JSON）
     * @param {string} jsoncString JSONC格式字符串
     * @returns {Object} 解析后的JSON对象
     */
    parseJSONC(jsoncString) {
        // 移除单行注释和多行注释
        let cleaned = jsoncString
            // 移除单行注释 // ...
            .replace(/\/\/.*$/gm, '')
            // 移除多行注释 /* ... */
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // 移除多余的空白字符
            .trim();
        
        try {
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('JSON解析失败，尝试清理控制字符:', error);
            
            // 清理JSON字符串中的控制字符（保留必要的换行和制表符）
            cleaned = cleaned
                // 移除控制字符，但保留\n, \r, \t
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                // 移除多余的换行和空格
                .replace(/\s+/g, ' ');
            
            return JSON.parse(cleaned);
        }
    }

    /**
     * 加载配置文件
     */
    async loadConfig() {
        try {
            let config = null;
            let fileConfig = null;
            
            // 1. 尝试从配置文件加载最新配置
            try {
                console.log('[Config] 尝试从配置文件加载最新配置');
                const response = await fetch('config.jsonc', {
                    cache: 'no-cache'
                });
                if (response.ok) {
                    const jsoncText = await response.text();
                    fileConfig = this.parseJSONC(jsoncText);
                    console.log('[Config] 从配置文件加载配置成功:', fileConfig);
                } else {
                    console.log('[Config] 配置文件加载失败');
                }
            } catch (error) {
                console.log('[Config] 无法加载配置文件:', error.message);
            }
            
            // 2. 从localStorage加载用户配置
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                console.log('[Config] 从localStorage加载用户配置');
                config = JSON.parse(savedConfig);
            }
            
            // 3. 合并配置
            // 先合并默认配置和用户配置
            let mergedConfig = this.mergeConfig(this.defaultConfig, config);
            
            // 然后单独合并文件配置中的应用信息（确保应用信息始终从文件配置中读取）
            if (fileConfig) {
                const appInfoKeys = ['projectName', 'author', 'version', 'description'];
                appInfoKeys.forEach(key => {
                    if (fileConfig.hasOwnProperty(key)) {
                        mergedConfig[key] = fileConfig[key];
                    }
                });
            }
            
            this.config = mergedConfig;
            
            // 4. 验证配置
            this.validateConfig();
            
            // 5. 保存合并后的配置到localStorage
            localStorage.setItem('appConfig', JSON.stringify(this.config));
            
            // 6. 加载属性中文映射
            await this.loadAttributeCN();
            
            console.log('[Config] 配置加载成功:', this.config);
            return this.config;
        } catch (error) {
            console.error('[Config] 加载配置失败:', error);
            // 使用默认配置
            this.config = { ...this.defaultConfig };
            console.log('[Config] 使用默认配置:', this.config);
            
            // 尝试加载属性中文映射
            try {
                await this.loadAttributeCN();
            } catch (e) {
                console.error('[Config] 加载属性中文映射失败:', e);
            }
            
            return this.config;
        }
    }
    
    /**
     * 获取属性的中文名称
     * @param {string} type - 类型名称（如event, item）
     * @param {string} key - 属性键名
     * @returns {string} 中文名称
     */
    getAttributeCN(type, key) {
        // 移除类型名称中的下划线，使其与映射表匹配
        const normalizedType = type.replace(/_/g, '');
        
        // 类型名称到attributeCN.json中keyName的映射表
        const typeToKeyNameMap = {
            // 基础类型
            'event': 'EvtKey',
            'item': 'ItemKey',
            'book': 'BookKey',
            'action': 'ActionKey',
            
            // 从analyzer.js中获取的正确类型名映射
            'actionevt': 'Action_evtKey', // 对应Action_evtKey
            'audio': 'AudioKey',
            'bg': 'BgKey',
            'cg': 'C_gKey', // 对应C_gKey
            'intent': 'IntentKey',
            'kzoneavatar': 'K_zone_avatarKey', // 对应K_zone_avatarKey
            'kzonecomment': 'K_zone_commentKey', // 对应K_zone_commentKey
            'kzonecontent': 'K_zone_contentKey', // 对应K_zone_contentKey
            'kzoneprofile': 'K_zone_profileKey', // 对应K_zone_profileKey
            'person': 'PersonKey',
            'persongrow': 'Person_growKey', // 对应Person_growKey
            'renshengguanmemory': 'Renshengguan_memoryKey', // 对应Renshengguan_memoryKey
            'shop': 'ShopKey'
        };
        
        const keyName = typeToKeyNameMap[normalizedType] || `${type.charAt(0).toUpperCase() + type.slice(1)}Key`;
        if (this.attributeCN && this.attributeCN[keyName] && this.attributeCN[keyName][key]) {
            return this.attributeCN[keyName][key];
        }
        return key;
    }

    /**
     * 合并配置
     * @param {Object} defaultConfig 默认配置
     * @param {Object} customConfig 自定义配置
     * @returns {Object} 合并后的配置
     */
    mergeConfig(defaultConfig, customConfig) {
        if (!customConfig) {
            return { ...defaultConfig };
        }
        
        const merged = { ...defaultConfig };
        
        // 定义哪些配置项是用户可配置的，哪些应该始终从文件配置中读取
        // 应用信息（projectName, author, version, description）应该始终从文件配置中读取
        const appInfoKeys = ['projectName', 'author', 'version', 'description'];
        
        // 递归合并配置
        for (const key in customConfig) {
            if (customConfig.hasOwnProperty(key)) {
                // 如果是应用信息键，且已经从文件配置中获取到了值，则跳过（不被用户配置覆盖）
                if (appInfoKeys.includes(key) && merged[key] !== this.defaultConfig[key]) {
                    // 应用信息已经从文件配置中读取到了，不需要被用户配置覆盖
                    continue;
                }
                
                if (typeof customConfig[key] === 'object' && customConfig[key] !== null && !Array.isArray(customConfig[key])) {
                    merged[key] = this.mergeConfig(defaultConfig[key] || {}, customConfig[key]);
                } else {
                    merged[key] = customConfig[key];
                }
            }
        }
        
        return merged;
    }

    /**
     * 验证配置
     */
    validateConfig() {
        // 验证themeMode
        if (![0, 1, 3].includes(this.config.themeMode)) {
            console.warn('[Config] themeMode值无效，使用默认值3');
            this.config.themeMode = 3;
        }
        
        // 验证language
        if (!['zh-cn', 'zh-tw'].includes(this.config.language)) {
            console.warn('[Config] language值无效，使用默认值zh-cn');
            this.config.language = 'zh-cn';
        }
        
        // 验证exportFormat
        if (!['json', 'markdown'].includes(this.config.exportFormat)) {
            console.warn('[Config] exportFormat值无效，使用默认值markdown');
            this.config.exportFormat = 'markdown';
        }
        
        // 验证opacity
        if (typeof this.config.opacity !== 'number' || this.config.opacity < 0 || this.config.opacity > 100) {
            console.warn('[Config] opacity值无效，使用默认值85');
            this.config.opacity = 85;
        }
        
        // 确保布尔值类型
        this.config.showProgress = Boolean(this.config.showProgress);
        this.config.generateDetailedReport = Boolean(this.config.generateDetailedReport);
        this.config.autoOpenBrowser = Boolean(this.config.autoOpenBrowser);
        this.config.developerMode = Boolean(this.config.developerMode);
    }

    /**
     * 保存配置到localStorage和服务器配置文件
     */
    saveConfig() {
        // 保存到localStorage
        localStorage.setItem('appConfig', JSON.stringify(this.config));
        console.log('[Config] 配置已保存到localStorage:', this.config);
        
        // 向服务器发送POST请求更新config.jsonc文件
        // 只在开发服务器上可用，普通HTTP服务器不支持
        fetch('/update-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.config),
        })
        .then(response => {
            if (response.ok) {
                console.log('[Config] 配置已同步到服务器config.jsonc');
            } else {
                // 忽略所有非200错误，因为普通HTTP服务器不支持此端点
                console.info('[Config] 服务器不支持配置同步，配置仅保存到本地');
            }
        })
        .catch(error => {
            // 忽略网络错误，因为普通HTTP服务器不支持此端点
            console.info('[Config] 无法连接到服务器或服务器不支持此请求，配置仅保存到本地:', error.message);
        });
        
        this.notifyListeners();
    }

    /**
     * 获取配置
     * @param {string} key 配置键名（可选）
     * @returns {*} 配置值或完整配置对象
     */
    get(key = null) {
        if (!this.config) {
            console.warn('[Config] 配置未加载，返回默认配置');
            return key ? this.defaultConfig[key] : this.defaultConfig;
        }
        
        return key ? this.config[key] : this.config;
    }

    /**
     * 设置配置
     * @param {string|Object} key 配置键名或配置对象
     * @param {*} value 配置值（可选）
     */
    set(key, value = null) {
        if (!this.config) {
            this.config = { ...this.defaultConfig };
        }
        
        if (typeof key === 'object') {
            // 批量设置配置
            Object.assign(this.config, key);
        } else {
            // 单个设置配置
            this.config[key] = value;
        }
        
        // 验证配置
        this.validateConfig();
        
        // 保存配置
        this.saveConfig();
    }

    /**
     * 重置配置为默认值
     */
    reset() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
        console.log('[Config] 配置已重置为默认值:', this.config);
    }

    /**
     * 添加配置变更监听器
     * @param {Function} listener 监听器函数
     */
    addListener(listener) {
        if (typeof listener === 'function' && !this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    /**
     * 移除配置变更监听器
     * @param {Function} listener 监听器函数
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 通知所有监听器配置已变更
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.config);
            } catch (error) {
                console.error('[Config] 通知监听器失败:', error);
            }
        });
    }
}

// 导出单例实例
const configManager = new ConfigManager();
