// 事件分析模块
class EventAnalyzer {
    constructor() {
        // 事件相关
        this.modEventIds = new Map(); // modName => Set(eventIds)
        this.allEventIds = new Map(); // eventId => Set(modNames)
        this.totalEvents = 0;
        
        // 物品相关
        this.modItemIds = new Map(); // modName => Set(itemIds)
        this.allItemIds = new Map(); // itemId => Set(modNames)
        this.totalItems = 0;
        
        // 书籍相关
        this.modBookIds = new Map(); // modName => Set(bookIds)
        this.allBookIds = new Map(); // bookId => Set(modNames)
        this.totalBooks = 0;
        
        // 行动相关
        this.modActionIds = new Map(); // modName => Set(actionIds)
        this.allActionIds = new Map(); // actionId => Set(modNames)
        this.totalActions = 0;
        
        // 模组详情
        this.modDetails = new Map(); // modName => { path, events: [], items: [], books: [], actions: [] }
        this.totalMods = 0;
        this.processedMods = 0;
        
        this.onProgressUpdate = null;
    }

    /**
     * 开始分析模组事件、物品和书籍
     * @param {Object[]} folders - 选中的文件夹列表
     * @param {File[]} allFiles - 所有文件列表
     * @returns {Promise<Object>} 分析结果
     */
    async analyze(folders, allFiles) {
        // 重置状态
        // 事件相关
        this.modEventIds.clear();
        this.allEventIds.clear();
        this.totalEvents = 0;
        
        // 物品相关
        this.modItemIds.clear();
        this.allItemIds.clear();
        this.totalItems = 0;
        
        // 书籍相关
        this.modBookIds.clear();
        this.allBookIds.clear();
        this.totalBooks = 0;
        
        // 行动相关
        this.modActionIds.clear();
        this.allActionIds.clear();
        this.totalActions = 0;
        
        // 模组详情
        this.modDetails.clear();
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
     * 处理单个文件夹
     * @param {Object} folder - 文件夹信息
     * @param {File[]} allFiles - 所有文件列表
     */
    async processFolder(folder, allFiles) {
        // 调试：打印所有文件路径，方便排查问题
        console.log(`=== 处理文件夹: ${folder.name} ===`);
        console.log(`文件夹完整路径: ${folder.fullPath}`);
        console.log(`找到的文件总数: ${allFiles.length}`);
        console.log(`所有文件路径:`);
        allFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.webkitRelativePath}`);
        });
        
        // 使用相对路径检测，位置为 模组文件夹/Cfgs/zh-cn/EvtCfg.json
        console.log(`=== 开始文件匹配调试 ===`);
        console.log(`当前处理的文件夹: ${folder.name}`);
        console.log(`需要匹配的文件名: EvtCfg.json`);
        
        // 只处理当前文件夹的文件
        const folderFiles = allFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            // 兼容不同操作系统的路径分隔符
            const separator = relativePath.includes('/') ? '/' : '\\';
            const parts = relativePath.split(separator);
            
            // 检查文件是否属于当前文件夹
            // 支持直接选择模组文件夹或选择TestMod文件夹的情况
            let isCurrentFolder = false;
            if (parts.length >= 2 && parts[0] === 'TestMod') {
                // 选择了TestMod文件夹，检查第二级文件夹是否为当前模组
                isCurrentFolder = parts[1] === folder.name;
                console.log(`文件路径: ${relativePath}, 检查TestMod子文件夹: ${parts[1]} === ${folder.name} => ${isCurrentFolder}`);
            } else {
                // 直接选择了模组文件夹，检查第一级文件夹是否为当前模组
                isCurrentFolder = parts[0] === folder.name;
                console.log(`文件路径: ${relativePath}, 检查顶级文件夹: ${parts[0]} === ${folder.name} => ${isCurrentFolder}`);
            }
            
            return isCurrentFolder;
        });
        
        console.log(`当前文件夹下的文件数: ${folderFiles.length}`);
        
        const evtCfgFiles = folderFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            const fileName = file.name;
            
            console.log(`\n检查文件:`);
            console.log(`- 文件名: ${fileName}`);
            console.log(`- 相对路径: ${relativePath}`);
            console.log(`- 文件名匹配: ${fileName === 'EvtCfg.json'}`);
            
            // 严格匹配规则：只匹配 Cfgs/zh-cn 目录下的 EvtCfg.json 文件
            const isEvtCfgFile = fileName === 'EvtCfg.json';
            const isInCorrectPath = relativePath.includes('Cfgs/zh-cn/EvtCfg.json') || 
                                   relativePath.includes('Cfgs\\zh-cn\\EvtCfg.json');
            
            console.log(`- 包含完整路径: ${isInCorrectPath}`);
            
            const matches = isEvtCfgFile && isInCorrectPath;
            console.log(`- 最终匹配结果: ${matches}`);
            
            return matches;
        });
        
        console.log(`=== 匹配结果 ===`);
        console.log(`找到匹配的EvtCfg.json文件数量: ${evtCfgFiles.length}`);
        evtCfgFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.webkitRelativePath}`);
        });
        
        // 处理EvtCfg.json文件
        if (evtCfgFiles.length > 0) {
            if (evtCfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个 EvtCfg.json 文件，仅处理第一个`);
            }
            // 仅处理第一个找到的EvtCfg.json文件
            await this.processEvtCfgFile(folder, evtCfgFiles[0]);
        } else {
            // 没有找到EvtCfg.json文件
            console.warn(`文件夹 ${folder.name} 中未找到 EvtCfg.json 文件`);
            console.warn(`请确保文件位于以下路径之一：`);
            console.warn(`- ${folder.name}\\Cfgs\\zh-cn\\EvtCfg.json`);
            console.warn(`- ${folder.name}/Cfgs/zh-cn/EvtCfg.json`);
            console.warn(`EvtCfg.json 是文件名，不是目录`);
        }
        
        // 处理ItemCfg.json文件
        console.log(`\n=== 开始匹配ItemCfg.json文件 ===`);
        const itemCfgFiles = folderFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            const fileName = file.name;
            
            console.log(`\n检查文件:`);
            console.log(`- 文件名: ${fileName}`);
            console.log(`- 相对路径: ${relativePath}`);
            
            // 严格匹配规则：只匹配 Cfgs/zh-cn 目录下的 ItemCfg.json 文件
            const isItemCfgFile = fileName === 'ItemCfg.json';
            const isInCorrectPath = relativePath.includes('Cfgs/zh-cn/ItemCfg.json') || 
                                   relativePath.includes('Cfgs\\zh-cn\\ItemCfg.json');
            
            console.log(`- 文件名匹配: ${isItemCfgFile}`);
            console.log(`- 路径匹配: ${isInCorrectPath}`);
            
            const matches = isItemCfgFile && isInCorrectPath;
            console.log(`- 最终匹配结果: ${matches}`);
            
            return matches;
        });
        
        console.log(`=== ItemCfg.json匹配结果 ===`);
        console.log(`找到匹配的ItemCfg.json文件数量: ${itemCfgFiles.length}`);
        itemCfgFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.webkitRelativePath}`);
        });
        
        if (itemCfgFiles.length > 0) {
            if (itemCfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个 ItemCfg.json 文件，仅处理第一个`);
            }
            // 仅处理第一个找到的ItemCfg.json文件
            await this.processItemCfgFile(folder, itemCfgFiles[0]);
        } else {
            // 没有找到ItemCfg.json文件
            console.warn(`文件夹 ${folder.name} 中未找到 ItemCfg.json 文件`);
            console.warn(`请确保文件位于以下路径之一：`);
            console.warn(`- ${folder.name}\\Cfgs\\zh-cn\\ItemCfg.json`);
            console.warn(`- ${folder.name}/Cfgs/zh-cn/ItemCfg.json`);
            console.warn(`ItemCfg.json 是文件名，不是目录`);
        }
        
        // 处理BookCfg.json文件
        console.log(`\n=== 开始匹配BookCfg.json文件 ===`);
        const bookCfgFiles = folderFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            const fileName = file.name;
            
            console.log(`\n检查文件:`);
            console.log(`- 文件名: ${fileName}`);
            console.log(`- 相对路径: ${relativePath}`);
            
            // 严格匹配规则：只匹配 Cfgs/zh-cn 目录下的 BookCfg.json 文件
            const isBookCfgFile = fileName === 'BookCfg.json';
            const isInCorrectPath = relativePath.includes('Cfgs/zh-cn/BookCfg.json') || 
                                   relativePath.includes('Cfgs\\zh-cn\\BookCfg.json');
            
            console.log(`- 文件名匹配: ${isBookCfgFile}`);
            console.log(`- 路径匹配: ${isInCorrectPath}`);
            
            const matches = isBookCfgFile && isInCorrectPath;
            console.log(`- 最终匹配结果: ${matches}`);
            
            return matches;
        });
        
        console.log(`=== BookCfg.json匹配结果 ===`);
        console.log(`找到匹配的BookCfg.json文件数量: ${bookCfgFiles.length}`);
        bookCfgFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.webkitRelativePath}`);
        });
        
        if (bookCfgFiles.length > 0) {
            if (bookCfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个 BookCfg.json 文件，仅处理第一个`);
            }
            // 仅处理第一个找到的BookCfg.json文件
            await this.processBookCfgFile(folder, bookCfgFiles[0]);
        } else {
            // 没有找到BookCfg.json文件
            console.warn(`文件夹 ${folder.name} 中未找到 BookCfg.json 文件`);
            console.warn(`请确保文件位于以下路径之一：`);
            console.warn(`- ${folder.name}\\Cfgs\\zh-cn\\BookCfg.json`);
            console.warn(`- ${folder.name}/Cfgs/zh-cn/BookCfg.json`);
            console.warn(`BookCfg.json 是文件名，不是目录`);
        }
        
        // 处理ActionCfg.json文件
        console.log(`\n=== 开始匹配ActionCfg.json文件 ===`);
        const actionCfgFiles = folderFiles.filter(file => {
            const relativePath = file.webkitRelativePath;
            const fileName = file.name;
            
            console.log(`\n检查文件:`);
            console.log(`- 文件名: ${fileName}`);
            console.log(`- 相对路径: ${relativePath}`);
            
            // 严格匹配规则：只匹配 Cfgs/zh-cn 目录下的 ActionCfg.json 文件
            const isActionCfgFile = fileName === 'ActionCfg.json';
            const isInCorrectPath = relativePath.includes('Cfgs/zh-cn/ActionCfg.json') || 
                                   relativePath.includes('Cfgs\\zh-cn\\ActionCfg.json');
            
            console.log(`- 文件名匹配: ${isActionCfgFile}`);
            console.log(`- 路径匹配: ${isInCorrectPath}`);
            
            const matches = isActionCfgFile && isInCorrectPath;
            console.log(`- 最终匹配结果: ${matches}`);
            
            return matches;
        });
        
        console.log(`=== ActionCfg.json匹配结果 ===`);
        console.log(`找到匹配的ActionCfg.json文件数量: ${actionCfgFiles.length}`);
        actionCfgFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file.webkitRelativePath}`);
        });
        
        if (actionCfgFiles.length > 0) {
            if (actionCfgFiles.length > 1) {
                console.warn(`文件夹 ${folder.name} 中找到多个 ActionCfg.json 文件，仅处理第一个`);
            }
            // 仅处理第一个找到的ActionCfg.json文件
            await this.processActionCfgFile(folder, actionCfgFiles[0]);
        } else {
            // 没有找到ActionCfg.json文件
            console.warn(`文件夹 ${folder.name} 中未找到 ActionCfg.json 文件`);
            console.warn(`请确保文件位于以下路径之一：`);
            console.warn(`- ${folder.name}\\Cfgs\\zh-cn\\ActionCfg.json`);
            console.warn(`- ${folder.name}/Cfgs/zh-cn/ActionCfg.json`);
            console.warn(`ActionCfg.json 是文件名，不是目录`);
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
        
        console.log(`=== 处理完成: ${folder.name} ===`);
    }

    /**
     * 处理单个EvtCfg.json文件
     * @param {Object} folder - 文件夹信息
     * @param {File} file - EvtCfg.json文件
     */
    async processEvtCfgFile(folder, file) {
        try {
            const content = await Utils.readFile(file);
            const jsonData = JSON.parse(content);
            
            // 为当前模组初始化数据结构
            if (!this.modEventIds.has(folder.name)) {
                this.modEventIds.set(folder.name, new Set());
                this.modItemIds.set(folder.name, new Set());
                this.modBookIds.set(folder.name, new Set());
                this.modActionIds.set(folder.name, new Set());
                this.modDetails.set(folder.name, {
                    path: folder.fullPath,
                    events: [],
                    items: [],
                    books: [],
                    actions: []
                });
            }
            
            const eventSet = this.modEventIds.get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取事件ID
            for (const [key, eventData] of Object.entries(jsonData)) {
                // 确保是有效的事件对象
                if (eventData && typeof eventData === 'object' && eventData.id) {
                    const eventId = eventData.id;
                    
                    // 添加到当前模组的事件ID集合
                    eventSet.add(eventId);
                    
                    // 添加到所有事件ID的映射中
                    if (!this.allEventIds.has(eventId)) {
                        this.allEventIds.set(eventId, new Set());
                    }
                    this.allEventIds.get(eventId).add(folder.name);
                    
                    // 保存事件详情
                    modDetail.events.push({
                        id: eventId,
                        title: Utils.getEventTitle(eventData),
                        data: eventData
                    });
                    
                    this.totalEvents++;
                }
            }
        } catch (error) {
            console.error(`处理文件 ${file.name} 出错:`, error);
        }
    }
    
    /**
     * 处理单个ItemCfg.json文件
     * @param {Object} folder - 文件夹信息
     * @param {File} file - ItemCfg.json文件
     */
    async processItemCfgFile(folder, file) {
        try {
            const content = await Utils.readFile(file);
            const jsonData = JSON.parse(content);
            
            // 为当前模组初始化数据结构
            if (!this.modItemIds.has(folder.name)) {
                this.modEventIds.set(folder.name, new Set());
                this.modItemIds.set(folder.name, new Set());
                this.modBookIds.set(folder.name, new Set());
                this.modActionIds.set(folder.name, new Set());
                this.modDetails.set(folder.name, {
                    path: folder.fullPath,
                    events: [],
                    items: [],
                    books: [],
                    actions: []
                });
            }
            
            const itemSet = this.modItemIds.get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取物品ID
            for (const [key, itemData] of Object.entries(jsonData)) {
                // 确保是有效的物品对象
                if (itemData && typeof itemData === 'object' && itemData.id) {
                    const itemId = itemData.id;
                    
                    // 添加到当前模组的物品ID集合
                    itemSet.add(itemId);
                    
                    // 添加到所有物品ID的映射中
                    if (!this.allItemIds.has(itemId)) {
                        this.allItemIds.set(itemId, new Set());
                    }
                    this.allItemIds.get(itemId).add(folder.name);
                    
                    // 保存物品详情
                    modDetail.items.push({
                        id: itemId,
                        name: itemData.name || '未知物品',
                        data: itemData
                    });
                    
                    this.totalItems++;
                }
            }
        } catch (error) {
            console.error(`处理文件 ${file.name} 出错:`, error);
        }
    }
    
    /**
     * 处理单个BookCfg.json文件
     * @param {Object} folder - 文件夹信息
     * @param {File} file - BookCfg.json文件
     */
    async processBookCfgFile(folder, file) {
        try {
            const content = await Utils.readFile(file);
            const jsonData = JSON.parse(content);
            
            // 为当前模组初始化数据结构
            if (!this.modBookIds.has(folder.name)) {
                this.modEventIds.set(folder.name, new Set());
                this.modItemIds.set(folder.name, new Set());
                this.modBookIds.set(folder.name, new Set());
                this.modActionIds.set(folder.name, new Set());
                this.modDetails.set(folder.name, {
                    path: folder.fullPath,
                    events: [],
                    items: [],
                    books: [],
                    actions: []
                });
            }
            
            const bookSet = this.modBookIds.get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取书籍ID
            for (const [key, bookData] of Object.entries(jsonData)) {
                // 确保是有效的书籍对象
                if (bookData && typeof bookData === 'object' && bookData.id) {
                    const bookId = bookData.id;
                    
                    // 添加到当前模组的书籍ID集合
                    bookSet.add(bookId);
                    
                    // 添加到所有书籍ID的映射中
                    if (!this.allBookIds.has(bookId)) {
                        this.allBookIds.set(bookId, new Set());
                    }
                    this.allBookIds.get(bookId).add(folder.name);
                    
                    // 保存书籍详情
                    modDetail.books.push({
                        id: bookId,
                        name: bookData.name || '未知书籍',
                        data: bookData
                    });
                    
                    this.totalBooks++;
                }
            }
        } catch (error) {
            console.error(`处理文件 ${file.name} 出错:`, error);
        }
    }
    
    /**
     * 处理单个ActionCfg.json文件
     * @param {Object} folder - 文件夹信息
     * @param {File} file - ActionCfg.json文件
     */
    async processActionCfgFile(folder, file) {
        try {
            const content = await Utils.readFile(file);
            const jsonData = JSON.parse(content);
            
            // 为当前模组初始化数据结构
            if (!this.modActionIds.has(folder.name)) {
                this.modEventIds.set(folder.name, new Set());
                this.modItemIds.set(folder.name, new Set());
                this.modBookIds.set(folder.name, new Set());
                this.modActionIds.set(folder.name, new Set());
                this.modDetails.set(folder.name, {
                    path: folder.fullPath,
                    events: [],
                    items: [],
                    books: [],
                    actions: []
                });
            }
            
            const actionSet = this.modActionIds.get(folder.name);
            const modDetail = this.modDetails.get(folder.name);
            
            // 提取行动ID
            for (const [key, actionData] of Object.entries(jsonData)) {
                // 确保是有效的行动对象
                if (actionData && typeof actionData === 'object' && actionData.id) {
                    const actionId = actionData.id;
                    
                    // 添加到当前模组的行动ID集合
                    actionSet.add(actionId);
                    
                    // 添加到所有行动ID的映射中
                    if (!this.allActionIds.has(actionId)) {
                        this.allActionIds.set(actionId, new Set());
                    }
                    this.allActionIds.get(actionId).add(folder.name);
                    
                    // 保存行动详情
                    modDetail.actions.push({
                        id: actionId,
                        name: actionData.name || '未知行动',
                        data: actionData
                    });
                    
                    this.totalActions++;
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
        // 找出重复的事件ID
        const duplicateEventIds = Array.from(this.allEventIds.entries())
                                 .filter(([id, modNames]) => modNames.size > 1)
                                 .sort((a, b) => a[0] - b[0]);
        
        // 找出重复的物品ID
        const duplicateItemIds = Array.from(this.allItemIds.entries())
                                .filter(([id, modNames]) => modNames.size > 1)
                                .sort((a, b) => a[0] - b[0]);
        
        // 找出重复的书籍ID
        const duplicateBookIds = Array.from(this.allBookIds.entries())
                                .filter(([id, modNames]) => modNames.size > 1)
                                .sort((a, b) => a[0] - b[0]);
        
        // 找出重复的行动ID
        const duplicateActionIds = Array.from(this.allActionIds.entries())
                                 .filter(([id, modNames]) => modNames.size > 1)
                                 .sort((a, b) => a[0] - b[0]);

        return {
            // 基本统计
            totalMods: this.totalMods,
            
            // 事件相关
            totalEvents: this.totalEvents,
            uniqueEventIds: this.allEventIds.size,
            duplicateEventIds: duplicateEventIds,
            modEventIds: this.modEventIds,
            allEventIds: this.allEventIds,
            
            // 物品相关
            totalItems: this.totalItems,
            uniqueItemIds: this.allItemIds.size,
            duplicateItemIds: duplicateItemIds,
            modItemIds: this.modItemIds,
            allItemIds: this.allItemIds,
            
            // 书籍相关
            totalBooks: this.totalBooks,
            uniqueBookIds: this.allBookIds.size,
            duplicateBookIds: duplicateBookIds,
            modBookIds: this.modBookIds,
            allBookIds: this.allBookIds,
            
            // 行动相关
            totalActions: this.totalActions,
            uniqueActionIds: this.allActionIds.size,
            duplicateActionIds: duplicateActionIds,
            modActionIds: this.modActionIds,
            allActionIds: this.allActionIds,
            
            // 模组详情
            modDetails: this.modDetails
        };
    }

    /**
     * 设置进度更新回调
     * @param {Function} callback - 回调函数
     */
    setOnProgressUpdate(callback) {
        this.onProgressUpdate = callback;
    }
}
