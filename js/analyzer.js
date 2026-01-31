// 事件分析模块
class EventAnalyzer {
    constructor() {
        // 支持的ID类型配置，将从idTypelib.json加载
        this.idTypes = {};
        
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
     * 从idTypelib.json加载ID类型配置
     */
    async loadIdTypeConfig() {
        try {
            const response = await fetch('lib/idTypelib.json');
            if (response.ok) {
                const idTypelib = await response.json();
                const listType = idTypelib.listType;
                
                // 清空现有配置
                this.idTypes = {};
                
                // 基于listType构建ID类型配置
                for (const [typeId, typeConfig] of Object.entries(listType)) {
                    // 生成小写的类型名（用于内部使用）
                    const typeName = Utils.toSnakeCase(typeId.replace('Id', ''));
                    
                    this.idTypes[typeName] = {
                        fileName: typeConfig.file,
                        displayName: typeConfig.name,
                        getIdField: 'id',
                        getNameField: (data) => {
                            // 优先使用name属性，然后尝试其他常见的名称字段
                            return data.name || data.title || '未知' + typeConfig.name;
                        },
                        description: typeConfig.name + 'ID',
                        keyList: typeConfig.keyList
                    };
                }
                
                // 调试信息
                
                
                // 重新初始化数据结构
                this.initDataStructures();
                return true;
            } else {
                console.warn('[Analyzer] 无法加载idTypelib.json，使用默认配置');
                this.useDefaultIdTypeConfig();
                return false;
            }
        } catch (error) {
            console.error('[Analyzer] 加载idTypelib.json出错:', error);
            this.useDefaultIdTypeConfig();
            return false;
        }
    }
    
    /**
     * 从idTypeKeys.json加载属性定义
     */
    async loadIdTypeKeys() {
        try {
            const response = await fetch('lib/idTypeKeys.json');
            if (response.ok) {
                this.idTypeKeys = await response.json();

                return true;
            } else {
                console.warn('[Analyzer] 无法加载idTypeKeys.json，使用默认属性定义');
                this.idTypeKeys = {};
                return false;
            }
        } catch (error) {
            console.error('[Analyzer] 加载idTypeKeys.json出错:', error);
            this.idTypeKeys = {};
            return false;
        }
    }
    
    /**
     * 获取类型对应的属性定义
     * @param {string} type - ID类型
     * @returns {Object|null} 属性定义对象
     */
    getTypeAttributes(type) {
        const typeConfig = this.idTypes[type];
        if (!typeConfig || !typeConfig.keyList) {
            return null;
        }
        
        const keyList = typeConfig.keyList;
        return this.idTypeKeys[keyList] || null;
    }
    
    /**
     * 根据类型和数据提取关键属性
     * @param {string} type - ID类型
     * @param {Object} data - 数据对象
     * @returns {Object} 提取的关键属性
     */
    extractKeyAttributes(type, data) {
        const attributes = this.getTypeAttributes(type);
        const result = {};
        
        // 基于属性定义提取关键属性
        if (attributes) {
            for (const [key, attrConfig] of Object.entries(attributes)) {
                if (data[key] !== undefined) {
                    result[key] = data[key];
                }
            }
        }
        
        return result;
    }
    
    /**
     * 使用默认ID类型配置（当无法加载idTypelib.json时）
     */
    useDefaultIdTypeConfig() {
        // 默认ID类型配置
        this.idTypes = {
            // 基础类型
            event: {
                fileName: 'EvtCfg.json',
                displayName: '事件',
                getIdField: 'id',
                getNameField: (data) => data.name || data.title || '未知事件',
                description: '事件ID',
                keyList: 'EvtKey'
            },
            item: {
                fileName: 'ItemCfg.json',
                displayName: '物品',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知物品',
                description: '物品ID',
                keyList: 'ItemKey'
            },
            book: {
                fileName: 'BookCfg.json',
                displayName: '书籍',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知书籍',
                description: '书籍ID',
                keyList: 'BookKey'
            },
            action: {
                fileName: 'ActionCfg.json',
                displayName: '行动',
                getIdField: 'id',
                getNameField: (data) => data.name || '未知行动',
                description: '行动ID',
                keyList: 'ActionKey'
            }
        };
        

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
            // 加载ID类型配置
            await this.loadIdTypeConfig();
            
            // 加载属性定义
            await this.loadIdTypeKeys();
            
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
        
        // 如果是baseGame文件夹且没有找到文件，尝试通过fetch API读取
        if (folder.name === 'baseGame' && folderFiles.length === 0) {
            console.log('[Analyzer] 尝试通过fetch API读取baseGame文件夹中的文件');
            await this.processBaseGameFolder(folder);
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
     * 处理baseGame文件夹（通过fetch API）
     * @param {Object} folder - 文件夹信息
     */
    async processBaseGameFolder(folder) {
        // 尝试读取baseGame/Cfgs/zh-cn/目录下的所有文件
        const cfgDir = 'baseGame/Cfgs/zh-cn/';
        
        try {
            // 首先尝试列出目录内容
            console.log(`[Analyzer] 尝试列出 ${cfgDir} 目录内容`);
            const dirResponse = await fetch(cfgDir);
            if (dirResponse.ok) {
                const dirContent = await dirResponse.text();
                // 从目录内容中提取文件名
                const fileNames = Utils.extractFileNamesFromDirContent(dirContent);
                console.log(`[Analyzer] 找到 ${fileNames.length} 个文件:`, fileNames);
                
                // 遍历所有支持的ID类型，尝试读取对应文件
                for (const type in this.idTypes) {
                    const typeConfig = this.idTypes[type];
                    try {
                        // 尝试获取文件名模式
                        const filePattern = typeConfig.fileName;
                        
                        // 查找匹配当前类型的文件
                        const matchingFiles = fileNames.filter(name => {
                            return Utils.matchFileName(name, filePattern);
                        });
                        
                        if (matchingFiles.length > 0) {
                            // 处理所有匹配的文件
                            for (const matchingFile of matchingFiles) {
                                console.log(`[Analyzer] 找到匹配文件: ${matchingFile} 对应类型: ${type}`);
                                const fileResponse = await fetch(`${cfgDir}${matchingFile}`);
                                if (fileResponse.ok) {
                                    const content = await fileResponse.text();
                                    const jsonData = JSON.parse(content);
                                    await this.processBaseGameFileData(folder, type, typeConfig, jsonData);
                                } else {
                                    console.warn(`[Analyzer] 无法读取文件 ${matchingFile}，状态码: ${fileResponse.status}`);
                                }
                            }
                        } else {
                            console.warn(`[Analyzer] 未找到匹配 ${filePattern} 的文件`);
                        }
                    } catch (error) {
                        console.warn(`[Analyzer] 处理类型 ${type} 时出错:`, error);
                    }
                }
            } else {
                console.warn(`[Analyzer] 无法列出目录内容，状态码: ${dirResponse.status}`);
            }
        } catch (error) {
            console.warn(`[Analyzer] 处理baseGame文件夹时出错:`, error);
        }
    }
    
    /**
     * 处理baseGame文件数据
     * @param {Object} folder - 文件夹信息
     * @param {string} type - ID类型
     * @param {Object} typeConfig - 类型配置
     * @param {Object} jsonData - JSON数据
     */
    async processBaseGameFileData(folder, type, typeConfig, jsonData) {
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
                    
                    // 保存详情，使用新的extractKeyAttributes方法提取关键属性
                    const detailArray = modDetail[type + 's'];
                    // 提取关键属性
                    const itemWithAttributes = this.extractKeyAttributes(type, data);
                    // 确保添加name属性
                    if (!itemWithAttributes.name) {
                        itemWithAttributes.name = typeConfig.getNameField(data);
                    }
                    detailArray.push(itemWithAttributes);
                    
                    // 更新总数
                    this.totalCounts[type]++;
                }
            }
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
                
                // 检查路径是否包含Cfgs/zh-cn或Cfgs\zh-cn
                const isInCorrectPath = relativePath.includes('Cfgs/zh-cn') || relativePath.includes('Cfgs\\zh-cn');
                
                if (!isInCorrectPath) {
                    return false;
                }
                
                // 处理文件名匹配，支持通配符
                const filePattern = typeConfig.fileName;
                const isCfgFile = Utils.matchFileName(fileName, filePattern);
                
                return isCfgFile;
            });
        
        if (cfgFiles.length > 0) {
            if (cfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个匹配 ${typeConfig.fileName} 的文件，仅处理第一个`);
            }
            // 处理所有找到的配置文件
            for (const cfgFile of cfgFiles) {
                await this.processCfgFile(folder, cfgFile, type, typeConfig);
            }
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
            // 读取文件内容
            const content = await Utils.readFile(file);
            // 解析JSON数据
            const jsonData = JSON.parse(content);
            
            // 获取当前模组的ID集合和详情
            const idSet = this.modIds[type].get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取ID和属性
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
                        
                        // 保存详情，使用extractKeyAttributes方法提取关键属性
                        const detailArray = modDetail[type + 's'];
                        // 提取关键属性
                        const itemWithAttributes = this.extractKeyAttributes(type, data);
                        // 确保添加name属性
                        if (!itemWithAttributes.name) {
                            itemWithAttributes.name = typeConfig.getNameField(data);
                        }
                        detailArray.push(itemWithAttributes);
                        
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
