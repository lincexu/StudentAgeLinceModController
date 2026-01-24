// 事件分析模块
class EventAnalyzer {
    constructor() {
        // 支持的ID类型配置（包含TestMod/SALMC/Cfgs/zh-cn/下的所有JSON文件）
        this.idTypes = {
            // 基础类型
            event: {
                fileName: 'EvtCfg.json',
                displayName: '事件',
                getIdField: 'id',
                getNameField: (data) => Utils.getEventTitle(data) || '未知事件',
                description: '事件ID'
            },
            item: {
                fileName: 'ItemCfg.json',
                displayName: '物品',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知物品',
                description: '物品ID'
            },
            book: {
                fileName: 'BookCfg.json',
                displayName: '书籍',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知书籍',
                description: '书籍ID'
            },
            action: {
                fileName: 'ActionCfg.json',
                displayName: '行动',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知行动',
                description: '行动ID'
            },
            
            // 从TestMod/SALMC/Cfgs/zh-cn/添加的新类型
            actionevt: {
                fileName: 'ActionEvtCfg.json',
                displayName: '行动事件',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知行动事件',
                description: '行动事件ID'
            },
            audio: {
                fileName: 'AudioCfg.json',
                displayName: '音乐',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知音乐',
                description: '音乐ID'
            },
            bg: {
                fileName: 'BgCfg.json',
                displayName: '背景',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知背景',
                description: '背景ID'
            },
            cg: {
                fileName: 'CGCfg.json',
                displayName: 'CG',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知CG',
                description: 'CGID'
            },
            intent: {
                fileName: 'IntentCfg.json',
                displayName: '目标',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知目标',
                description: '目标ID'
            },
            kzoneavatar: {
                fileName: 'KZoneAvatarCfg.json',
                displayName: '空间头像',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知空间头像',
                description: '空间头像ID'
            },
            kzonecomment: {
                fileName: 'KZoneCommentCfg.json',
                displayName: '空间评论',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知空间评论',
                description: '空间评论ID'
            },
            kzonecontent: {
                fileName: 'KZoneContentCfg.json',
                displayName: '空间动态',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知空间动态',
                description: '空间动态ID'
            },
            kzoneprofile: {
                fileName: 'KZoneProfileCfg.json',
                displayName: '空间主页',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知空间主页',
                description: '空间主页ID'
            },
            person: {
                fileName: 'PersonCfg.json',
                displayName: '人物',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知人物',
                description: '人物ID'
            },
            persongrow: {
                fileName: 'PersonGrowCfg.json',
                displayName: '个人成长',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知个人成长',
                description: '个人成长ID'
            },
            renshengguanmemory: {
                fileName: 'RenshengguanMemoryCfg.json',
                displayName: '回忆',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知回忆',
                description: '回忆ID'
            },
            shop: {
                fileName: 'ShopCfg.json',
                displayName: '商店',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知商店',
                description: '商店ID'
            }
        };
        
        // 初始化数据结构
        this.modIds = {}; // type => modName => Set(ids)
        this.allIds = {}; // type => id => Set(modNames)
        this.totalCounts = {}; // type => count
        
        // 模组详情
        this.modDetails = new Map(); // modName => { path, type1: [], type2: [], ... }
        this.totalMods = 0;
        this.processedMods = 0;
        
        this.onProgressUpdate = null;
        
        // 初始化数据结构
        this.initDataStructures();
    }
    
    /**
     * 初始化数据结构
     */
    initDataStructures() {
        for (const type in this.idTypes) {
            this.modIds[type] = new Map();
            this.allIds[type] = new Map();
            this.totalCounts[type] = 0;
        }
    }

    /**
     * 开始分析模组事件、物品和书籍
     * @param {Object[]} folders - 选中的文件夹列表
     * @param {File[]} allFiles - 所有文件列表
     * @returns {Promise<Object>} 分析结果
     */
    async analyze(folders, allFiles) {
        // 重置状态
        this.resetState();
        
        this.totalMods = folders.length;
        this.processedMods = 0;

        try {
            // 遍历所有选中的文件夹，查找配置文件
            for (const folder of folders) {
                await this.processFolder(folder, allFiles);
            }

            // 返回分析结果
            return this.getAnalysisResult();
        } catch (error) {
            console.error('分析出错:', error);
            throw error;
        }
    }
    
    /**
     * 重置状态
     */
    resetState() {
        // 重置数据结构
        this.initDataStructures();
        
        // 重置模组详情
        this.modDetails.clear();
    }

    /**
     * 处理单个文件夹
     * @param {Object} folder - 文件夹信息
     * @param {File[]} allFiles - 所有文件列表
     */
    async processFolder(folder, allFiles) {
        // 只处理当前文件夹的文件
        const folderFiles = allFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            // 兼容不同操作系统的路径分隔符
            const separator = relativePath.includes('/') ? '/' : '\\';
            const parts = relativePath.split(separator);
            
            // 检查文件是否属于当前文件夹
            return parts[0] === folder.name;
        });
        
        // 初始化模组数据
        this.initModData(folder.name, folder.fullPath);
        
        // 检查并读取manifest.json文件
        const manifestFile = folderFiles.find(file => file.name === 'manifest.json');
        if (manifestFile) {
            try {
                const content = await Utils.readFile(manifestFile);
                const manifestData = JSON.parse(content);
                if (manifestData.title) {
                    const modDetail = this.modDetails.get(folder.name);
                    modDetail.title = manifestData.title;
                }
            } catch (error) {
                console.warn(`读取 ${folder.name}/manifest.json 时出错:`, error);
            }
        }
        
        // 遍历所有支持的ID类型，处理对应文件
        for (const type in this.idTypes) {
            const typeConfig = this.idTypes[type];
            await this.processCfgFileByType(folder, folderFiles, type, typeConfig);
        }
        
        // 更新进度
        this.processedMods++;
        const progress = Math.round((this.processedMods / this.totalMods) * 100);
        
        if (this.onProgressUpdate) {
            this.onProgressUpdate({
                progress: progress,
                currentMod: folder.name,
                processed: this.processedMods,
                total: this.totalMods
            });
        }
    }
    
    /**
     * 初始化模组数据
     * @param {string} modName - 模组名称
     * @param {string} fullPath - 模组完整路径
     */
    initModData(modName, fullPath) {
        // 初始化ID集合
        for (const type in this.idTypes) {
            if (!this.modIds[type].has(modName)) {
                this.modIds[type].set(modName, new Set());
            }
        }
        
        // 初始化模组详情
        if (!this.modDetails.has(modName)) {
            const modDetail = { path: fullPath };
            for (const type in this.idTypes) {
                modDetail[type + 's'] = [];
            }
            this.modDetails.set(modName, modDetail);
        }
    }
    
    /**
     * 根据类型处理配置文件
     * @param {Object} folder - 文件夹信息
     * @param {File[]} folderFiles - 当前文件夹的文件列表
     * @param {string} type - ID类型
     * @param {Object} typeConfig - 类型配置
     */
    async processCfgFileByType(folder, folderFiles, type, typeConfig) {
        const cfgFiles = folderFiles.filter(file => {
            const fileName = file.name;
            const relativePath = file.webkitRelativePath;
            
            // 宽松匹配规则：匹配文件名，且路径中包含Cfgs/zh-cn或Cfgs\zh-cn
            const isCfgFile = fileName === typeConfig.fileName;
            const isInCorrectPath = relativePath.includes('Cfgs/zh-cn') || relativePath.includes('Cfgs\\zh-cn');
            
            return isCfgFile && isInCorrectPath;
        });
        
        if (cfgFiles.length > 0) {
            if (cfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个 ${typeConfig.fileName} 文件，仅处理第一个`);
            }
            // 仅处理第一个找到的配置文件
            await this.processCfgFile(folder, cfgFiles[0], type, typeConfig);
        }
    }
    
    /**
     * 处理单个配置文件
     * @param {Object} folder - 文件夹信息
     * @param {File} file - 配置文件
     * @param {string} type - ID类型
     * @param {Object} typeConfig - 类型配置
     */
    async processCfgFile(folder, file, type, typeConfig) {
        try {
            const content = await Utils.readFile(file);
            const jsonData = JSON.parse(content);
            
            const idSet = this.modIds[type].get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取ID
            for (const [key, data] of Object.entries(jsonData)) {
                // 确保是有效的对象且包含ID字段
                if (data && typeof data === 'object') {
                    const idField = typeConfig.getIdField;
                    const id = typeof idField === 'function' ? idField(data) : data[idField];
                    
                    if (id) {
                        // 添加到当前模组的ID集合
                        idSet.add(id);
                        
                        // 添加到所有ID的映射中
                        if (!this.allIds[type].has(id)) {
                            this.allIds[type].set(id, new Set());
                        }
                        this.allIds[type].get(id).add(folder.name);
                        
                        // 保存详情，创建一个新的对象，只包含数据属性，不包含getter函数
                        const detailArray = modDetail[type + 's'];
                        // 创建一个新对象，确保只包含可枚举的数据属性
                        const dataCopy = JSON.parse(JSON.stringify(data));
                        // 添加name属性，确保显示名称可用
                        const itemWithName = {
                            ...dataCopy,
                            name: typeConfig.getNameField(data)
                        };
                        detailArray.push(itemWithName);
                        
                        // 更新总数
                        this.totalCounts[type]++;
                    }
                }
            }
        } catch (error) {
            console.error(`处理文件 ${file.name} 出错:`, error);
        }
    }

    /**
     * 获取分析结果
     * @returns {Object} 分析结果
     */
    getAnalysisResult() {
        const result = {
            // 基本统计
            totalMods: this.totalMods,
            // 模组详情
            modDetails: this.modDetails,
            // ID类型配置
            idTypes: this.idTypes
        };
        
        // 为每种类型生成分析结果
        for (const type in this.idTypes) {
            const typeConfig = this.idTypes[type];
            
            // 找出重复的ID
            const duplicateIds = Array.from(this.allIds[type].entries())
                                   .filter(([id, modNames]) => modNames.size > 1)
                                   .sort((a, b) => a[0] - b[0]);
            
            // 生成类型相关的结果
            result[`total${type.charAt(0).toUpperCase() + type.slice(1)}s`] = this.totalCounts[type];
            result[`unique${type.charAt(0).toUpperCase() + type.slice(1)}Ids`] = this.allIds[type].size;
            result[`duplicate${type.charAt(0).toUpperCase() + type.slice(1)}Ids`] = duplicateIds;
            result[`mod${type.charAt(0).toUpperCase() + type.slice(1)}Ids`] = this.modIds[type];
            result[`all${type.charAt(0).toUpperCase() + type.slice(1)}Ids`] = this.allIds[type];
        }

        return result;
    }

    /**
     * 设置进度更新回调
     * @param {Function} callback - 回调函数
     */
    setOnProgressUpdate(callback) {
        this.onProgressUpdate = callback;
    }
}
