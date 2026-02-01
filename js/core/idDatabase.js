// ID类型实时数据库模块
// 直接使用全局的configManager，不重新声明
// 确保在config.js之后加载

class IdDatabase {
    constructor() {
        // 数据库存储结构: Map<type, Map<id, { id, name, ...otherProperties }>>
        this.database = new Map();
        // 数据来源记录: Map<type, Array<{ source, timestamp }>>
        this.sources = new Map();
        // ID类型配置
        this.idTypes = {};
        // 初始化标志
        this.initialized = false;
        // 加载状态
        this.loading = false;
        // 错误信息
        this.error = null;
        // 目录列表缓存
        this.directoryCache = new Map();
        // 缓存过期时间（毫秒）
        this.cacheExpiryTime = 5 * 60 * 1000; // 5分钟
        // 内存使用监控
        this.memoryUsage = {
            lastCheck: 0,
            thresholds: {
                warning: 80, // 内存使用警告阈值（%）
                critical: 90 // 内存使用临界阈值（%）
            }
        };
        // 进度更新回调
        this.onProgressUpdate = null;
    }
    
    /**
     * 设置进度更新回调
     * @param {Function} callback 进度更新回调函数
     */
    setOnProgressUpdate(callback) {
        this.onProgressUpdate = callback;
    }
    
    /**
     * 更新进度
     * @param {string} status 状态文本
     * @param {number} progress 进度值（0-100）
     */
    updateProgress(status, progress) {
        if (this.onProgressUpdate) {
            this.onProgressUpdate(status, progress);
        }
    }
    
    /**
     * 初始化数据库
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async initialize() {
        if (this.initialized) {
            return true;
        }
        
        this.loading = true;
        this.error = null;
        
        try {
            // 从idTypelib.json加载ID类型配置（总是重新加载以获取最新配置）
            this.updateProgress('加载ID类型配置...', 10);
            await this.loadIdTypeConfig();
            
            // 初始化数据库结构
            this.updateProgress('初始化数据库结构...', 20);
            this.initDatabaseStructure();
            
            // 检查是否需要自动加载默认数据
            const autoLoadDefaultData = window.configManager ? window.configManager.get('autoLoadDefaultData') : false;

            
            if (!autoLoadDefaultData) {
                // 尝试从存储中恢复数据
                this.updateProgress('恢复数据库数据...', 30);
                const restored = await this.restoreFromStorage();
                
                // 检查恢复的数据是否完整
                const missingTypes = [];
                for (const type in this.idTypes) {
                    const typeData = this.database.get(type);
                    if (!typeData || typeData.size === 0) {
                        missingTypes.push(type);
                    }
                }
                
                if (!restored || missingTypes.length > 0) {
                    // 恢复失败或数据不完整，重新加载数据
                    // 获取总类型数
                    const totalTypes = Object.keys(this.idTypes).length;
                    let processedTypes = 0;
                    
                    // 加载默认数据
                    this.updateProgress('加载默认数据...', 40);
                    await this.loadDefaultData();
                    processedTypes += Object.keys(this.idTypes).length;
                    
                    // 加载baseGame数据
                    this.updateProgress('加载baseGame数据...', 70);
                    await this.loadBaseGameData();
                    processedTypes += Object.keys(this.idTypes).length;
                }
            } else {
                // 自动加载默认数据，直接从源文件读取
                this.updateProgress('加载默认数据...', 40);
                await this.loadDefaultData();
                
                // 加载baseGame数据
                this.updateProgress('加载baseGame数据...', 70);
                await this.loadBaseGameData();
            }
            
            // 完成初始化
            this.updateProgress('数据库初始化完成...', 100);
            this.initialized = true;
            this.loading = false;
            
            // 初始化完成后持久化数据
            await this.persistToStorage();
            
            return true;
        } catch (error) {
            this.error = error;
            this.loading = false;
            console.error('[IdDatabase] 数据库初始化失败:', error);
            this.updateProgress('数据库初始化失败', 100);
            return false;
        }
    }
    
    /**
     * 从idTypelib.json加载ID类型配置
     */
    async loadIdTypeConfig() {
        try {
            const response = await fetch('lib/idTypelib.json');
            if (response.ok) {
                const idTypelib = await response.json();
                const allType = idTypelib.allType;
                
                // 构建ID类型配置
                for (const [typeId, typeConfig] of Object.entries(allType)) {
                    const typeName = this.toSnakeCase(typeId.replace('Id', ''));
                    
                    this.idTypes[typeName] = {
                        fileName: typeConfig.file,
                        displayName: typeConfig.name,
                        getIdField: 'id',
                        dataKey: typeConfig.dataKey || 'name',
                        description: typeConfig.name + 'ID',
                        keyList: typeConfig.keyList
                    };
                }
                
                return true;
            } else {
                console.error('[IdDatabase] 无法加载idTypelib.json，请检查文件是否存在');
                return false;
            }
        } catch (error) {
            console.error('[IdDatabase] 加载idTypelib.json出错:', error);
            console.error('[IdDatabase] 请检查idTypelib.json文件是否存在或格式是否正确');
            return false;
        }
    }
    
    /**
     * 初始化数据库结构
     */
    initDatabaseStructure() {
        for (const type in this.idTypes) {
            this.database.set(type, new Map());
            this.sources.set(type, []);
        }
    }
    
    /**
     * 加载默认数据（lib/Cfg目录）
     */
    async loadDefaultData() {
        // 并行加载所有类型的数据
        const loadPromises = [];
        for (const type in this.idTypes) {
            const typeConfig = this.idTypes[type];
            loadPromises.push(this.loadDataFromLibCfg(type, typeConfig));
        }
        
        // 等待所有加载完成
        await Promise.all(loadPromises);
    }
    
    /**
     * 从lib/Cfg目录加载数据
     * @param {string} type ID类型
     * @param {Object} typeConfig 类型配置
     */
    async loadDataFromLibCfg(type, typeConfig) {
        try {
            // 构建文件路径模式
            const filePattern = typeConfig.fileName;
            
            // 尝试获取lib/Cfg目录下的文件列表
            const cfgDir = 'lib/Cfg/';
            const fileNames = await this.getDirectoryContents(cfgDir);
            
            if (fileNames && fileNames.length > 0) {
                // 查找匹配当前类型的文件
                const matchingFiles = fileNames.filter(name => {
                    return this.matchFileName(name, filePattern);
                });
                
                if (matchingFiles.length > 0) {
                    // 处理所有匹配的文件
                    for (const matchingFile of matchingFiles) {
                        try {
                            const fileUrl = `${cfgDir}${matchingFile}`;
                            const fileResponse = await fetch(fileUrl);
                            if (fileResponse.ok) {
                                const content = await fileResponse.text();
                                const jsonData = this.parseJson(content);
                                
                                // 处理数据
                                await this.processData(type, jsonData, { 
                                    source: `lib/Cfg/${matchingFile}`,
                                    type: 'default'
                                });
                            }
                        } catch (error) {
                            // 静默处理错误，仅在开发模式下记录
                        }
                    }
                }
            } else {
                // 尝试直接加载常见文件
                this.tryLoadCommonFiles(type, typeConfig);
            }
        } catch (error) {
            // 尝试直接加载常见文件
            this.tryLoadCommonFiles(type, typeConfig);
        }
    }
    
    /**
     * 尝试直接加载常见文件
     * @param {string} type ID类型
     * @param {Object} typeConfig 类型配置
     */
    async tryLoadCommonFiles(type, typeConfig) {
        try {
            const cfgDir = 'lib/Cfg/';
            
            // 获取目录下所有文件
            const fileNames = await this.getDirectoryContents(cfgDir);
            
            if (fileNames && fileNames.length > 0) {
                // 过滤出符合当前类型配置的文件
                const matchingFiles = fileNames.filter(name => {
                    return this.matchFileName(name, typeConfig.fileName);
                });
                
                if (matchingFiles.length > 0) {
                    // 对匹配的文件进行排序，优先加载无后缀的文件，然后按照编号顺序加载
                    matchingFiles.sort((a, b) => {
                        // 检查是否有 # 后缀
                        const aHasSuffix = a.includes(' #');
                        const bHasSuffix = b.includes(' #');
                        
                        // 无后缀的文件排在前面
                        if (!aHasSuffix && bHasSuffix) return -1;
                        if (aHasSuffix && !bHasSuffix) return 1;
                        
                        // 都有后缀，按照编号排序
                        if (aHasSuffix && bHasSuffix) {
                            const aNum = parseInt(a.match(/#(\d+)/)?.[1] || '0');
                            const bNum = parseInt(b.match(/#(\d+)/)?.[1] || '0');
                            return aNum - bNum;
                        }
                        
                        // 都无后缀，按原顺序
                        return 0;
                    });
                    
                    // 尝试加载匹配的文件，直到成功为止
                    for (const fileName of matchingFiles) {
                        try {
                            const filePath = `${cfgDir}${fileName}`;
                            const fileResponse = await fetch(filePath);
                            if (fileResponse.ok) {
                                const content = await fileResponse.text();
                                const jsonData = this.parseJson(content);
                                
                                // 处理数据
                                await this.processData(type, jsonData, { 
                                    source: filePath,
                                    type: 'default'
                                });
                                break; // 成功加载一个文件后停止尝试
                            }
                        } catch (error) {
                            // 静默处理错误
                        }
                    }
                }
            }
        } catch (error) {
            // 静默处理错误
        }
    }
    
    /**
     * 加载baseGame数据
     */
    async loadBaseGameData() {
        // 尝试读取baseGame/Cfgs/zh-cn/目录下的所有文件
        const cfgDir = 'baseGame/Cfgs/zh-cn/';
        
        try {
            // 首先尝试列出目录内容（使用缓存）
            const fileNames = await this.getDirectoryContents(cfgDir);
            
            if (fileNames && fileNames.length > 0) {
                // 遍历所有ID类型，尝试读取对应文件
                for (const type in this.idTypes) {
                    const typeConfig = this.idTypes[type];
                    
                    // 查找匹配当前类型的文件
                    const matchingFiles = fileNames.filter(name => {
                        return this.matchFileName(name, typeConfig.fileName);
                    });
                    
                    if (matchingFiles.length > 0) {
                        // 处理所有匹配的文件
                        for (const matchingFile of matchingFiles) {
                            try {
                                const fileResponse = await fetch(`${cfgDir}${matchingFile}`);
                                if (fileResponse.ok) {
                                    const content = await fileResponse.text();
                                    const jsonData = this.parseJson(content);
                                    
                                    // 处理数据
                                    await this.processData(type, jsonData, { 
                                        source: `baseGame/Cfgs/zh-cn/${matchingFile}`,
                                        type: 'baseGame'
                                    });
                                }
                            } catch (error) {
                                // 静默处理错误
                            }
                        }
                    }
                }
            }
        } catch (error) {
            // 静默处理错误
        }
    }
    
    /**
     * 从用户上传的文件加载数据
     * @param {File} file 用户上传的文件
     * @param {string} type ID类型
     * @returns {Promise<boolean>} 加载是否成功
     */
    async loadDataFromUserFile(file, type) {
        try {
            // 验证类型是否支持
            if (!this.idTypes[type]) {
                return false;
            }
            
            // 读取文件内容
            const content = await this.readFile(file);
            const jsonData = this.parseJson(content);
            
            // 处理数据
            await this.processData(type, jsonData, { 
                source: `user_upload/${file.name}`,
                type: 'user'
            });
            
            return true;
        } catch (error) {
            console.error(`[IdDatabase] 加载用户上传文件时出错:`, error);
            this.error = error.message;
            return false;
        }
    }
    
    /**
     * 处理数据并添加到数据库
     * @param {string} type ID类型
     * @param {Object} jsonData JSON数据
     * @param {Object} sourceInfo 数据来源信息
     */
    async processData(type, jsonData, sourceInfo) {
        const typeConfig = this.idTypes[type];
        const idMap = this.database.get(type);
        const sourceList = this.sources.get(type);
        
        // 记录数据来源
        sourceList.push({
            ...sourceInfo,
            timestamp: new Date().toISOString()
        });
        
        // 批量处理数据，减少Map操作开销
        const batchSize = 1000; // 每批次处理1000条数据
        let batch = [];
        
        for (const [key, data] of Object.entries(jsonData)) {
            if (data && typeof data === 'object') {
                const idField = typeConfig.getIdField;
                const id = typeof idField === 'function' ? idField(data) : data[idField];
                
                // 检查id是否为undefined或null，而不是简单的if(id)，因为id=0时会被评估为false
                if (id !== undefined && id !== null) {
                    let nameValue = data[typeConfig.dataKey];
                    if (Array.isArray(nameValue) && nameValue.length > 0) {
                        nameValue = nameValue[0];
                    }
                    const item = {
                        id: id,
                        name: nameValue || typeConfig.displayName
                    };
                    
                    // 提取其他属性
                    if (data.icon) {
                        item.icon = data.icon;
                    }
                    if (data.type) {
                        item.type = data.type;
                    }
                    
                    batch.push(item);
                    
                    // 当批次达到指定大小时，批量处理
                    if (batch.length >= batchSize) {
                        this.batchAddToMap(idMap, batch);
                        batch = [];
                    }
                }
            }
        }
        
        // 处理剩余数据
        if (batch.length > 0) {
            this.batchAddToMap(idMap, batch);
        }
        
        // 数据更新后持久化到存储
        await this.persistToStorage();
    }
    
    /**
     * 将数据库数据持久化到localStorage
     */
    async persistToStorage() {
        try {
            // 转换Map为可序列化的对象
            const serializedDatabase = {};
            for (const [type, idMap] of this.database.entries()) {
                serializedDatabase[type] = Array.from(idMap.entries());
            }
            
            const serializedSources = {};
            for (const [type, sourceList] of this.sources.entries()) {
                serializedSources[type] = sourceList;
            }
            
            const dataToStore = {
                database: serializedDatabase,
                sources: serializedSources,
                initialized: this.initialized
                // 不再存储idTypes，因为它包含不可序列化的函数
                // idTypes会在每次初始化时从idTypelib.json重新加载
            };
            
            // 优先存储到IndexedDB
            const indexedDbSuccess = await this.storeToIndexedDB('idDatabase_data', dataToStore);
            
            if (!indexedDbSuccess) {
                // IndexedDB存储失败，回退到localStorage
                try {
                    localStorage.setItem('idDatabase_data', JSON.stringify(dataToStore));
                } catch (localStorageError) {
                    console.error('[IdDatabase] 存储到localStorage失败:', localStorageError);
                }
            }
        } catch (error) {
            console.error('[IdDatabase] 持久化数据失败:', error);
        }
    }
    
    /**
     * 打开IndexedDB数据库
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    async openIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB not supported'));
                return;
            }
            
            const request = indexedDB.open('IdDatabase', 1);
            
            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('idDatabase')) {
                    db.createObjectStore('idDatabase');
                }
            };
        });
    }
    
    /**
     * 存储数据到IndexedDB
     * @param {string} key 存储键
     * @param {any} value 存储值
     * @returns {Promise<boolean>} 存储是否成功
     */
    async storeToIndexedDB(key, value) {
        try {
            const db = await this.openIndexedDB();
            return new Promise((resolve) => {
                const transaction = db.transaction('idDatabase', 'readwrite');
                const store = transaction.objectStore('idDatabase');
                const request = store.put(value, key);
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = () => {
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('[IdDatabase] 存储到IndexedDB失败:', error);
            return false;
        }
    }
    
    /**
     * 从IndexedDB读取数据
     * @param {string} key 存储键
     * @returns {Promise<any>} 存储的值
     */
    async getFromIndexedDB(key) {
        try {
            const db = await this.openIndexedDB();
            return new Promise((resolve) => {
                const transaction = db.transaction('idDatabase', 'readonly');
                const store = transaction.objectStore('idDatabase');
                const request = store.get(key);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    resolve(null);
                };
            });
        } catch (error) {
            console.error('[IdDatabase] 从IndexedDB读取失败:', error);
            return null;
        }
    }
    
    /**
     * 从存储中恢复数据库数据（优先使用IndexedDB）
     */
    async restoreFromStorage() {
        try {
            // 优先从IndexedDB恢复数据
            const indexedDbRestored = await this.restoreFromIndexedDB();
            if (indexedDbRestored) {
                return true;
            }
            
            // IndexedDB恢复失败，回退到localStorage
            try {
                const storedData = localStorage.getItem('idDatabase_data');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    
                    // 恢复数据库数据
                    if (parsedData.database) {
                        for (const [type, entries] of Object.entries(parsedData.database)) {
                            // 只恢复当前已加载类型的数据
                            if (this.idTypes[type]) {
                                const idMap = new Map(entries);
                                this.database.set(type, idMap);
                            }
                        }
                    }
                    
                    // 恢复来源数据
                    if (parsedData.sources) {
                        for (const [type, sourceList] of Object.entries(parsedData.sources)) {
                            // 只恢复当前已加载类型的来源数据
                            if (this.idTypes[type]) {
                                this.sources.set(type, sourceList);
                            }
                        }
                    }
                    
                    // 恢复初始化状态
                    if (parsedData.initialized) {
                        this.initialized = true;
                    }
                    
                    // 不再恢复ID类型配置，使用最新加载的配置
                    
                    return true;
                }
            } catch (localStorageError) {
                console.error('[IdDatabase] 从localStorage恢复数据失败:', localStorageError);
            }
        } catch (error) {
            console.error('[IdDatabase] 恢复数据失败:', error);
        }
        return false;
    }
    
    /**
     * 从IndexedDB恢复数据库数据
     */
    async restoreFromIndexedDB() {
        try {
            const storedData = await this.getFromIndexedDB('idDatabase_data');
            if (storedData) {
                // 恢复数据库数据
                if (storedData.database) {
                    for (const [type, entries] of Object.entries(storedData.database)) {
                        // 只恢复当前已加载类型的数据
                        if (this.idTypes[type]) {
                            const idMap = new Map(entries);
                            this.database.set(type, idMap);
                        }
                    }
                }
                
                // 恢复来源数据
                if (storedData.sources) {
                    for (const [type, sourceList] of Object.entries(storedData.sources)) {
                        // 只恢复当前已加载类型的来源数据
                        if (this.idTypes[type]) {
                            this.sources.set(type, sourceList);
                        }
                    }
                }
                
                // 恢复初始化状态
                if (storedData.initialized) {
                    this.initialized = true;
                }
                
                // 不再恢复ID类型配置，使用最新加载的配置
                
                return true;
            }
        } catch (error) {
            console.error('[IdDatabase] 从IndexedDB恢复数据失败:', error);
        }
        return false;
    }
    
    /**
     * 批量添加数据到Map，减少Map操作开销
     * @param {Map} map 目标Map
     * @param {Array<Object>} items 数据项数组
     */
    batchAddToMap(map, items) {
        // 检查内存使用情况
        this.checkMemoryUsage();
        
        // 直接遍历添加，避免多次Map操作的开销
        for (const item of items) {
            map.set(item.id, item);
        }
    }
    
    /**
     * 检查内存使用情况
     */
    checkMemoryUsage() {
        const now = Date.now();
        // 每10秒检查一次内存使用情况
        if (now - this.memoryUsage.lastCheck < 10000) {
            return;
        }
        
        this.memoryUsage.lastCheck = now;
        
        // 检查是否支持内存监控
        if (performance && performance.memory) {
            const memory = performance.memory;
            const usedHeapSize = memory.usedJSHeapSize;
            const totalHeapSize = memory.totalJSHeapSize;
            const heapSizeLimit = memory.jsHeapSizeLimit;
            
            const usagePercent = (usedHeapSize / heapSizeLimit) * 100;
            
            // 检查内存使用阈值
            if (usagePercent >= this.memoryUsage.thresholds.critical) {
                console.warn('[IdDatabase] 内存使用临界:', usagePercent.toFixed(2) + '%');
                // 可以在这里添加内存释放策略
                this.clearOldCache();
            } else if (usagePercent >= this.memoryUsage.thresholds.warning) {
                console.warn('[IdDatabase] 内存使用警告:', usagePercent.toFixed(2) + '%');
            }
        }
    }
    
    /**
     * 清理旧缓存，释放内存
     */
    clearOldCache() {
        const now = Date.now();
        const expiredEntries = [];
        
        // 清理过期的目录缓存
        for (const [directory, cached] of this.directoryCache.entries()) {
            if ((now - cached.timestamp) > this.cacheExpiryTime) {
                expiredEntries.push(directory);
            }
        }
        
        for (const directory of expiredEntries) {
            this.directoryCache.delete(directory);
        }
        
        if (expiredEntries.length > 0) {

        }
    }
    
    /**
     * 查询数据库
     * @param {string} type ID类型
     * @param {*} id ID值（可选）
     * @returns {Object|Map|null} 查询结果
     */
    query(type, id = null) {
        try {
            if (!this.database.has(type)) {
                return null;
            }
            
            const idMap = this.database.get(type);
            
            if (id === null) {
                // 返回整个类型的所有数据
                return idMap;
            } else {
                // 特殊处理id=0的情况
                if (id === 0 || id === '0') {
                    // 遍历所有键，找到值为0或'0'的键
                    for (const key of idMap.keys()) {
                        if (key === 0 || key === '0') {
                            return idMap.get(key);
                        }
                    }
                }
                
                // 尝试不同类型的ID转换
                const idStr = String(id);
                const idNum = parseInt(id);
                
                // 尝试直接获取
                let result = idMap.get(id);
                if (result) {
                    return result;
                }
                
                // 尝试字符串形式
                if (typeof id !== 'string') {
                    result = idMap.get(idStr);
                    if (result) {
                        return result;
                    }
                }
                
                // 尝试数字形式
                if (!isNaN(idNum)) {
                    result = idMap.get(idNum);
                    if (result) {
                        return result;
                    }
                }
                
                // 尝试数字字符串形式
                const idNumStr = String(idNum);
                if (idNumStr !== idStr) {
                    result = idMap.get(idNumStr);
                    if (result) {
                        return result;
                    }
                }
                
                // 未找到
                return null;
            }
        } catch (error) {
            console.error(`[IdDatabase] 查询出错:`, error);
            return null;
        }
    }
    
    /**
     * 获取所有ID类型
     * @returns {Array<string>} ID类型列表
     */
    getTypes() {
        return Object.keys(this.idTypes);
    }
    
    /**
     * 获取类型配置
     * @param {string} type ID类型
     * @returns {Object|null} 类型配置
     */
    getTypeConfig(type) {
        return this.idTypes[type] || null;
    }
    
    /**
     * 获取数据统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const stats = {};
        
        for (const type in this.idTypes) {
            const idMap = this.database.get(type);
            const sourceList = this.sources.get(type);
            
            stats[type] = {
                count: idMap.size,
                sources: sourceList.length,
                displayName: this.idTypes[type].displayName
            };
        }
        
        return stats;
    }
    
    /**
     * 清空数据库
     * @param {string} type ID类型（可选，不指定则清空所有）
     */
    clear(type = null) {
        if (type) {
            // 清空特定类型
            if (this.database.has(type)) {
                this.database.set(type, new Map());
                this.sources.set(type, []);

            }
        } else {
            // 清空所有类型
            this.initDatabaseStructure();

        }
    }
    
    /**
     * 读取文件内容
     * @param {File} file 文件对象
     * @returns {Promise<string>} 文件内容
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }
    
    /**
     * 解析JSON数据（优化版）
     * @param {string} jsonString JSON字符串
     * @returns {Object} 解析后的对象
     */
    parseJson(jsonString) {
        try {
            // 对于大文件，考虑使用Web Worker或其他优化
            // 这里使用基本的JSON.parse，但添加了错误处理
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('[IdDatabase] JSON解析失败:', error);
            throw error;
        }
    }
    
    /**
     * 批量处理数据
     * @param {string} type ID类型
     * @param {Array<Object>} items 数据项数组
     * @param {Object} sourceInfo 数据来源信息
     */
    batchProcessData(type, items, sourceInfo) {
        const typeConfig = this.idTypes[type];
        const idMap = this.database.get(type);
        const sourceList = this.sources.get(type);
        
        // 记录数据来源
        sourceList.push({
            ...sourceInfo,
            timestamp: new Date().toISOString()
        });
        
        // 批量处理数据
        for (const item of items) {
            if (item && typeof item === 'object') {
                const idField = typeConfig.getIdField;
                const id = typeof idField === 'function' ? idField(item) : item[idField];
                
                if (id !== undefined && id !== null) {
                    let nameValue = item[typeConfig.dataKey];
                    if (Array.isArray(nameValue) && nameValue.length > 0) {
                        nameValue = nameValue[0];
                    }
                    const dataItem = {
                        id: id,
                        name: nameValue || typeConfig.displayName
                    };
                    
                    if (item.icon) {
                        dataItem.icon = item.icon;
                    }
                    if (item.type) {
                        dataItem.type = item.type;
                    }
                    
                    idMap.set(id, dataItem);
                }
            }
        }
    }
    
    /**
     * 获取目录内容并缓存
     * @param {string} directory 目录路径
     * @returns {Promise<Array<string>|null>} 文件名列表或null
     */
    async getDirectoryContents(directory) {
        try {
            // 检查缓存
            const cached = this.directoryCache.get(directory);
            const now = Date.now();
            
            if (cached && (now - cached.timestamp) < this.cacheExpiryTime) {
                return cached.fileNames;
            }
            
            // 发送请求获取目录内容
            const dirResponse = await fetch(directory);
            if (dirResponse.ok) {
                const dirContent = await dirResponse.text();
                const fileNames = this.extractFileNamesFromDirContent(dirContent);
                
                // 更新缓存
                this.directoryCache.set(directory, {
                    fileNames,
                    timestamp: now
                });
                
                return fileNames;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 从目录内容中提取文件名
     * @param {string} dirContent 目录内容
     * @returns {Array<string>} 文件名列表
     */
    extractFileNamesFromDirContent(dirContent) {
        // 简单的文件名提取逻辑
        const fileNames = [];
        const regex = /href="([^"]+)"/g;
        let match;
        
        while ((match = regex.exec(dirContent)) !== null) {
            const fileName = match[1];
            // 过滤目录和特殊文件
            if (!fileName.startsWith('.') && !fileName.endsWith('/') && fileName.includes('.')) {
                fileNames.push(fileName);
            }
        }
        
        return fileNames;
    }
    
    /**
     * 匹配文件名
     * @param {string} fileName 文件名
     * @param {string} pattern 模式
     * @returns {boolean} 是否匹配
     */
    matchFileName(fileName, pattern) {
        try {
            // 简单的通配符匹配
            // 处理特殊字符，确保正则表达式正确
            let regexPattern = pattern;
            // 转义除了*之外的特殊字符
            regexPattern = regexPattern.replace(/([.+?^${}()|[\]\\])/g, '\\$1');
            // 将*替换为.*
            regexPattern = regexPattern.replace(/\*/g, '.*');
            // 创建正则表达式，忽略大小写
            const regex = new RegExp(`^${regexPattern}$`, 'i');
            const result = regex.test(fileName);

            return result;
        } catch (error) {
            console.error(`[IdDatabase] 匹配文件名出错:`, error);
            return false;
        }
    }
    
    /**
     * 根据类型和ID获取名称
     * @param {string} type 类型名称
     * @param {number} id ID值
     * @returns {string} 名称
     */
    getNameById(type, id) {
        if (!this.database || !this.database.has(type)) {
            return null;
        }
        
        const typeData = this.database.get(type);
        if (!typeData) {
            return null;
        }
        
        const item = typeData.get(id);
        return item ? item.name : null;
    }
    
    /**
     * 转换为蛇形命名
     * @param {string} str 字符串
     * @returns {string} 蛇形命名的字符串
     */
    toSnakeCase(str) {
        return str.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
    }
}

// 导出单例实例
const idDatabase = new IdDatabase();

// 暴露为全局变量，以便在renderer.js中使用
if (typeof window !== 'undefined') {
    window.idDatabase = idDatabase;
}
