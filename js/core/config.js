// 配置管理模块
class ConfigManager {
    constructor() {
        this.config = null;
        this.defaultConfig = null;
        this.listeners = [];
        this.translations = null;
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
            exportFormat: "png", // 默认导出格式
            showProgress: true, // 是否显示分析进度
            generateDetailedReport: true, // 是否生成详细报告
            autoOpenBrowser: true, // 是否自动打开浏览器
            developerMode: false, // 是否开启开发者模式
            developerPassword: "" // 开发者模式密码
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
            
            // 1. 优先从localStorage加载配置
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                console.log('[Config] 从localStorage加载配置');
                config = JSON.parse(savedConfig);
            } 
            // 2. 尝试从配置文件加载
            else {
                try {
                    console.log('[Config] 尝试从配置文件加载配置');
                    const response = await fetch('config.jsonc', {
                        cache: 'no-cache'
                    });
                    if (response.ok) {
                        const jsoncText = await response.text();
                        config = this.parseJSONC(jsoncText);
                        localStorage.setItem('appConfig', JSON.stringify(config));
                        console.log('[Config] 从配置文件加载配置成功:', config);
                    } else {
                        console.log('[Config] 配置文件加载失败，使用默认配置');
                    }
                } catch (error) {
                    console.log('[Config] 无法加载配置文件，使用默认配置:', error.message);
                }
            }
            
            // 3. 合并配置（默认配置 + 加载的配置）
            this.config = this.mergeConfig(this.defaultConfig, config);
            
            // 4. 验证配置
            this.validateConfig();
            
            console.log('[Config] 配置加载成功:', this.config);
            return this.config;
        } catch (error) {
            console.error('[Config] 加载配置失败:', error);
            // 使用默认配置
            this.config = { ...this.defaultConfig };
            console.log('[Config] 使用默认配置:', this.config);
            return this.config;
        }
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
        
        // 递归合并配置
        for (const key in customConfig) {
            if (customConfig.hasOwnProperty(key)) {
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
        if (!['png', 'json', 'markdown'].includes(this.config.exportFormat)) {
            console.warn('[Config] exportFormat值无效，使用默认值png');
            this.config.exportFormat = 'png';
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
                console.error('[Config] 无法同步配置到服务器:', response.statusText);
            }
        })
        .catch(error => {
            console.error('[Config] 同步配置到服务器时发生错误:', error);
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
