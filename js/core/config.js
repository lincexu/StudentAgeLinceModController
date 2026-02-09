// 配置管理模块
class ConfigManager {
    constructor() {
        this.config = null;
        this.defaultConfig = null;
        this.listeners = [];
        this.translations = null;
        this.idTypeKeys = null;
        this.idTypelib = null;
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
            "确定要清理所有已选择的文件夹吗？": "確定要清理所有已選擇的資料夾嗎？",
            "初始化ID数据库...": "初始化ID資料庫...",
            "加载ID类型配置...": "載入ID類型配置...",
            "初始化数据库结构...": "初始化資料庫結構...",
            "加载默认数据...": "載入默認數據...",
            "加载baseGame数据...": "載入baseGame數據...",
            "数据库初始化完成...": "資料庫初始化完成...",
            "数据库初始化失败": "資料庫初始化失敗",
            "分析完成！": "分析完成！",
            "分析失败": "分析失敗"
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
            opacity: 85, // 页面透明度，默认85%
            includeOfficialContent: true, // 是否自动添加baseGame文件夹到待解析列表
            includeDlcContent: true, // 是否自动添加dlc/初阳文件夹到待解析列表
            autoLoadDefaultData: false, // 是否每次启动自动加载默认数据
            verticalPageSize: 50, // 竖列表格每页数量
            horizontalPageSize: 50 // 横列表格每页数量
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
        
        // 初始化idTypeKeys
        this.idTypeKeys = {};
    }
    
    /**
     * 加载idTypeKeys.json文件
     */
    async loadIdTypeKeys() {
        try {
            const response = await fetch('lib/idTypeKeys.json', {
                cache: 'no-cache'
            });
            if (response.ok) {
                this.idTypeKeys = await response.json();
                return true;
            } else {
                console.warn('[Config] 无法加载idTypeKeys.json，使用默认属性定义');
                this.idTypeKeys = {};
                return false;
            }
        } catch (error) {
            console.error('[Config] 加载idTypeKeys.json出错:', error);
            this.idTypeKeys = {};
            return false;
        }
    }
    
    /**
     * 加载idTypelib.json文件
     */
    async loadIdTypelib() {
        try {
            const response = await fetch('lib/idTypelib.json', {
                cache: 'no-cache'
            });
            if (response.ok) {
                this.idTypelib = await response.json();
                return true;
            } else {
                console.warn('[Config] 无法加载idTypelib.json，使用默认配置');
                this.idTypelib = {};
                return false;
            }
        } catch (error) {
            console.error('[Config] 加载idTypelib.json出错:', error);
            this.idTypelib = {};
            return false;
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
                const response = await fetch('config.jsonc', {
                    cache: 'no-cache'
                });
                if (response.ok) {
                    const jsoncText = await response.text();
                    fileConfig = this.parseJSONC(jsoncText);
                }
            } catch (error) {
                console.error('[ConfigManager] config.jsonc加载出错:', error);
            }
            
            // 2. 从localStorage加载用户配置
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                config = JSON.parse(savedConfig);
            }
            
            // 3. 合并配置
            // 先合并默认配置和用户配置（localStorage）
            let mergedConfig = this.mergeConfig(this.defaultConfig, config);
            
            // 然后文件配置（config.jsonc）覆盖所有配置，确保实时读取本地配置
            if (fileConfig) {
                mergedConfig = this.mergeConfig(mergedConfig, fileConfig);
            }
            
            this.config = mergedConfig;
            
            // 4. 验证配置
            this.validateConfig();
            
            // 5. 保存合并后的配置到localStorage
            localStorage.setItem('appConfig', JSON.stringify(this.config));
            
            // 6. 加载idTypeKeys.json文件
            await this.loadIdTypeKeys();
            
            // 7. 加载idTypelib.json文件
            await this.loadIdTypelib();
            

            return this.config;
        } catch (error) {
            console.error('[Config] 加载配置失败:', error);
            // 使用默认配置
            this.config = { ...this.defaultConfig };

            
            // 尝试加载idTypeKeys.json文件
            try {
                await this.loadIdTypeKeys();
            } catch (e) {
                console.error('[Config] 加载idTypeKeys.json失败:', e);
            }
            
            // 尝试加载idTypelib.json文件
            try {
                await this.loadIdTypelib();
            } catch (e) {
                console.error('[Config] 加载idTypelib.json失败:', e);
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
        let keyName = null;
        
        // 尝试从idTypelib中动态查找keyList
        if (this.idTypelib && this.idTypelib.listType) {
            // 遍历idTypelib.listType，查找匹配的类型
            for (const [typeId, typeConfig] of Object.entries(this.idTypelib.listType)) {
                // 生成与输入type匹配的类型名（移除Id后缀并转换为蛇形命名）
                const typeNameWithoutId = typeId.replace('Id', '');
                const snakeCaseTypeName = typeNameWithoutId.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
                
                // 直接比较蛇形命名的类型名
                if (snakeCaseTypeName === type) {
                    keyName = typeConfig.keyList;
                    break;
                }
                
                // 如果没有匹配，尝试移除下划线后比较
                const normalizedSnakeCase = snakeCaseTypeName.replace(/_/g, '');
                const normalizedInputType = type.replace(/_/g, '');
                
                if (normalizedSnakeCase === normalizedInputType) {
                    keyName = typeConfig.keyList;
                    break;
                }
            }
        }
        
        // 如果没有找到，使用默认的命名规则
        if (!keyName) {
            // 移除下划线并转换为驼峰命名
            const camelCaseType = type.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            keyName = `${camelCaseType.charAt(0).toUpperCase() + camelCaseType.slice(1)}Key`;
        }
        
        // 从idTypeKeys中获取属性名称
        if (this.idTypeKeys && this.idTypeKeys[keyName] && this.idTypeKeys[keyName][key] && this.idTypeKeys[keyName][key].name) {
            return this.idTypeKeys[keyName][key].name;
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
        this.config.includeOfficialContent = Boolean(this.config.includeOfficialContent);
        this.config.includeDlcContent = Boolean(this.config.includeDlcContent);
        this.config.autoLoadDefaultData = Boolean(this.config.autoLoadDefaultData);
        
        // 验证分页配置
        if (typeof this.config.verticalPageSize !== 'number' || this.config.verticalPageSize < 1 || this.config.verticalPageSize > 1000) {
            console.warn('[Config] verticalPageSize值无效，使用默认值50');
            this.config.verticalPageSize = 50;
        }
        if (typeof this.config.horizontalPageSize !== 'number' || this.config.horizontalPageSize < 1 || this.config.horizontalPageSize > 1000) {
            console.warn('[Config] horizontalPageSize值无效，使用默认值50');
            this.config.horizontalPageSize = 50;
        }
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

// 暴露为全局变量，以便其他模块使用
if (typeof window !== 'undefined') {
    window.configManager = configManager;
}
