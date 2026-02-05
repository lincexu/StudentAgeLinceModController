/**
 * Wiki页面功能模块
 * 根据idTypelib中allType对象的wiki属性动态生成表格内容
 */

class WikiManager {
    constructor() {
        this.idTypelib = null;
        this.wikiTypes = []; // 存储wiki属性为true的类型
        this.conditionRules = null; // 前提规则
        this.effectRules = null; // 效果规则
        this.currentType = null;
        this.currentData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = 50;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchKeyword = '';
        this.currentSection = 'idTypes'; // 当前板块：idTypes, conditions, effects
        
        this.init();
    }
    
    async init() {
        try {
            console.log('[Wiki] 开始初始化...');
            
            // 等待数据库初始化完成
            console.log('[Wiki] 等待数据库初始化...');
            await this.waitForDatabase();
            console.log('[Wiki] 数据库初始化完成');
            
            // 加载idTypelib配置
            console.log('[Wiki] 加载idTypelib配置...');
            await this.loadIdTypelib();
            
            // 加载规则和效果配置
            console.log('[Wiki] 加载规则和效果配置...');
            await this.loadRules();
            
            // 筛选wiki属性为true的类型
            this.filterWikiTypes();
            
            // 渲染导航
            this.renderNavigation();
            
            // 绑定事件
            this.bindEvents();
            
            // 检查URL hash，自动跳转到对应类型
            this.handleUrlHash();
            
        } catch (error) {
            console.error('[Wiki] 初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }
    
    /**
     * 处理URL hash，自动跳转到对应类型
     */
    handleUrlHash() {
        const hash = window.location.hash.slice(1); // 去掉开头的#
        console.log('[Wiki] URL hash:', hash);
        
        if (!hash) {
            // 没有hash，默认加载第一个类型
            if (this.wikiTypes.length > 0) {
                this.loadType(this.wikiTypes[0].key);
            }
            return;
        }
        
        // 检查是否是ID类型
        const wikiType = this.wikiTypes.find(t => t.key === hash);
        if (wikiType) {
            console.log('[Wiki] 跳转到ID类型:', hash);
            this.loadType(hash, 'idTypes');
            return;
        }
        
        // 检查是否是前提条件或效果
        if (hash === 'conditions') {
            console.log('[Wiki] 跳转到前提条件');
            this.loadType('conditions', 'conditions');
            return;
        }
        
        if (hash === 'effects') {
            console.log('[Wiki] 跳转到效果');
            this.loadType('effects', 'effects');
            return;
        }
        
        // 检查是否是精灵图
        if (hash === 'sprites-emoji' || hash === 'emoji') {
            console.log('[Wiki] 跳转到Emoji表情');
            this.loadType('emoji', 'sprites');
            return;
        }
        
        if (hash === 'sprites-icon' || hash === 'icon') {
            console.log('[Wiki] 跳转到系统图标');
            this.loadType('icon', 'sprites');
            return;
        }
        
        // 如果找不到对应类型，默认加载第一个
        console.warn('[Wiki] 找不到对应类型:', hash);
        if (this.wikiTypes.length > 0) {
            this.loadType(this.wikiTypes[0].key);
        }
    }
    
    /**
     * 等待数据库初始化完成
     */
    async waitForDatabase() {
        // 等待configManager可用
        let attempts = 0;
        while (!window.configManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.configManager) {
            console.warn('[Wiki] configManager不可用，继续初始化数据库');
        }
        
        // 检查数据库是否已存在且已初始化
        if (window.idDatabase && window.idDatabase.initialized) {
            console.log('[Wiki] 数据库已初始化，直接使用');
            return;
        }
        
        // 如果数据库不存在，创建新实例
        if (!window.idDatabase) {
            console.log('[Wiki] 创建新的数据库实例');
            window.idDatabase = new IdDatabase();
        }
        
        // 如果数据库未初始化，执行初始化
        if (!window.idDatabase.initialized) {
            console.log('[Wiki] 初始化数据库...');
            await window.idDatabase.initialize();
            console.log('[Wiki] 数据库初始化完成');
        }
    }
    
    /**
     * 加载idTypelib配置
     */
    async loadIdTypelib() {
        try {
            const response = await fetch('lib/idTypelib.json', {
                cache: 'no-cache'
            });
            if (response.ok) {
                this.idTypelib = await response.json();
            } else {
                throw new Error('无法加载idTypelib.json');
            }
        } catch (error) {
            console.error('[Wiki] 加载idTypelib失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载规则和效果配置
     */
    async loadRules() {
        try {
            // 加载前提规则
            const conditionResponse = await fetch('lib/rules/conditionRules.json', {
                cache: 'no-cache'
            });
            if (conditionResponse.ok) {
                this.conditionRules = await conditionResponse.json();
            }
            
            // 加载效果规则
            const effectResponse = await fetch('lib/rules/effectRules.json', {
                cache: 'no-cache'
            });
            if (effectResponse.ok) {
                this.effectRules = await effectResponse.json();
            }
        } catch (error) {
            console.error('[Wiki] 加载规则失败:', error);
        }
    }
    
    /**
     * 将camelCase转换为snake_case
     */
    toSnakeCase(str) {
        return str.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
    }
    
    /**
     * 筛选wiki属性为true的类型
     */
    filterWikiTypes() {
        if (!this.idTypelib || !this.idTypelib.allType) {
            this.wikiTypes = [];
            return;
        }
        
        this.wikiTypes = Object.entries(this.idTypelib.allType)
            .filter(([key, config]) => config.wiki === true)
            .map(([key, config]) => ({
                key,
                dbKey: this.toSnakeCase(key.replace('Id', '')),
                ...config
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        
        console.log('[Wiki] Wiki类型:', this.wikiTypes.map(t => ({ name: t.name, key: t.key, dbKey: t.dbKey })));
    }
    
    /**
     * 渲染导航
     */
    renderNavigation() {
        const navContainer = document.getElementById('wikiNav');
        if (!navContainer) return;
        
        let navHtml = '';
        
        // ID类型板块
        if (this.wikiTypes.length > 0) {
            navHtml += `
                <div class="nav-section">
                    <div class="nav-section-title">ID类型</div>
                    <div class="nav-section-content">
                        ${this.wikiTypes.map(type => {
                            const count = this.getTypeCount(type.key);
                            return `
                                <a href="#${type.key}" class="nav-link" data-type="${type.key}" data-section="idTypes">
                                    <span class="type-name">${type.name}【${type.key}】</span>
                                    <span class="type-count">(${count})</span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // 精灵图板块
        navHtml += `
            <div class="nav-section">
                <div class="nav-section-title">精灵图</div>
                <div class="nav-section-content">
                    <a href="#sprites-emoji" class="nav-link" data-section="sprites" data-type="emoji">
                        <span class="type-name">Emoji表情</span>
                        <span class="type-count">(0-118)</span>
                    </a>
                    <a href="#sprites-icon" class="nav-link" data-section="sprites" data-type="icon">
                        <span class="type-name">本系统图标【注意不适用游戏内使用】</span>
                        <span class="type-count">(200-231)</span>
                    </a>
                </div>
            </div>
        `;
        
        // 效果和前提板块
        navHtml += `
            <div class="nav-section">
                <div class="nav-section-title">效果和前提</div>
                <div class="nav-section-content">
                    <a href="#conditions" class="nav-link" data-section="conditions" data-type="conditions">
                        <span class="type-name">前提条件</span>
                        <span class="type-count">(${this.conditionRules ? Object.keys(this.conditionRules).length : 0}类)</span>
                    </a>
                    <a href="#effects" class="nav-link" data-section="effects" data-type="effects">
                        <span class="type-name">效果</span>
                        <span class="type-count">(${this.effectRules ? Object.keys(this.effectRules).length : 0}类)</span>
                    </a>
                </div>
            </div>
        `;
        
        navContainer.innerHTML = navHtml;
    }
    
    /**
     * 获取类型的记录数量
     */
    getTypeCount(typeKey) {
        if (!window.idDatabase || !window.idDatabase.database) return 0;
        // 将camelCase key转换为snake_case dbKey
        const dbKey = this.toSnakeCase(typeKey.replace('Id', ''));
        const typeData = window.idDatabase.database.get(dbKey);
        return typeData ? typeData.size : 0;
    }
    
    /**
     * 加载指定类型的数据
     */
    async loadType(typeKey, section = 'idTypes') {
        this.currentType = typeKey;
        this.currentSection = section;
        this.currentPage = 1;
        this.searchKeyword = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        // 更新导航激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.type === typeKey);
        });
        
        // 显示加载状态
        this.showLoading(true);
        
        try {
            if (section === 'conditions') {
                // 加载前提条件数据
                await this.loadConditionsData();
            } else if (section === 'effects') {
                // 加载效果数据
                await this.loadEffectsData();
            } else if (section === 'sprites') {
                // 加载精灵图数据
                await this.loadSpritesData(typeKey);
            } else {
                // 加载ID类型数据
                const typeConfig = this.wikiTypes.find(t => t.key === typeKey);
                
                // 更新标题
                const titleElement = document.getElementById('currentTypeTitle');
                if (titleElement && typeConfig) {
                    titleElement.textContent = typeConfig.name;
                }
                
                // 获取数据（使用dbKey访问数据库）
                const dbKey = typeConfig ? typeConfig.dbKey : this.toSnakeCase(typeKey.replace('Id', ''));
                await this.fetchData(dbKey);
            }
            
            // 应用搜索过滤
            this.applyFilter();
            
            // 渲染表格
            this.renderTable();
            
            // 更新分页
            this.updatePagination();
            
            // 更新记录数显示
            this.updateRecordCount();
            
        } catch (error) {
            console.error('[Wiki] 加载数据失败:', error);
            this.showError('加载数据失败');
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * 加载前提条件数据
     */
    async loadConditionsData() {
        // 更新标题
        const titleElement = document.getElementById('currentTypeTitle');
        if (titleElement) {
            titleElement.textContent = '前提条件';
        }
        
        if (!this.conditionRules) {
            this.currentData = [];
            return;
        }
        
        // 将规则转换为表格数据
        this.currentData = [];
        Object.entries(this.conditionRules).forEach(([category, categoryData]) => {
            if (categoryData.type) {
                // 获取分类的name属性，如果没有则使用category作为id
                const categoryName = categoryData.name || category;
                Object.entries(categoryData.type).forEach(([typeName, typeConfig]) => {
                    this.currentData.push({
                        id: categoryName,
                        type: typeName,
                        rule: JSON.stringify(typeConfig.rule),
                        desc: typeConfig.desc || ''
                    });
                });
            }
        });
        
        console.log(`[Wiki] 前提条件加载了 ${this.currentData.length} 条记录`);
    }
    
    /**
     * 加载效果数据
     */
    async loadEffectsData() {
        // 更新标题
        const titleElement = document.getElementById('currentTypeTitle');
        if (titleElement) {
            titleElement.textContent = '效果';
        }
        
        if (!this.effectRules) {
            this.currentData = [];
            return;
        }
        
        // 将规则转换为表格数据
        this.currentData = [];
        Object.entries(this.effectRules).forEach(([category, categoryData]) => {
            if (categoryData.type) {
                // 获取分类的name属性，如果没有则使用category作为id
                const categoryName = categoryData.name || category;
                Object.entries(categoryData.type).forEach(([typeName, typeConfig]) => {
                    this.currentData.push({
                        id: categoryName,
                        type: typeName,
                        rule: JSON.stringify(typeConfig.rule),
                        desc: typeConfig.desc || ''
                    });
                });
            }
        });
        
        console.log(`[Wiki] 效果加载了 ${this.currentData.length} 条记录`);
    }
    
    /**
     * 加载精灵图数据
     * @param {string} spriteType 精灵图类型（emoji/icon）
     */
    async loadSpritesData(spriteType) {
        console.log(`[Wiki] 开始加载精灵图数据: ${spriteType}`);
        
        // 更新标题
        const titleElement = document.getElementById('currentTypeTitle');
        if (titleElement) {
            titleElement.textContent = spriteType === 'emoji' ? 'Emoji表情' : '本系统图标';
        }
        
        // 从spriteManager获取数据
        if (window.spriteManager) {
            console.log('[Wiki] spriteManager存在，调用getAllEmojis');
            this.currentData = window.spriteManager.getAllEmojis(spriteType);
            console.log('[Wiki] 获取到的数据:', this.currentData);
        } else {
            console.warn('[Wiki] spriteManager不存在');
            this.currentData = [];
        }
        
        console.log(`[Wiki] 精灵图 ${spriteType} 加载了 ${this.currentData.length} 条记录`);
    }
    
    /**
     * 获取数据
     */
    async fetchData(typeKey) {
        console.log(`[Wiki] 开始获取数据: ${typeKey}`);
        
        if (!window.idDatabase) {
            console.error('[Wiki] idDatabase不存在');
            this.currentData = [];
            return;
        }
        
        console.log('[Wiki] idDatabase状态:', {
            initialized: window.idDatabase.initialized,
            hasDatabase: !!window.idDatabase.database
        });
        
        if (!window.idDatabase.database) {
            console.error('[Wiki] idDatabase.database不存在');
            this.currentData = [];
            return;
        }
        
        const typeData = window.idDatabase.database.get(typeKey);
        console.log(`[Wiki] ${typeKey} 数据:`, typeData);
        
        if (!typeData) {
            console.warn(`[Wiki] ${typeKey} 在数据库中不存在`);
            this.currentData = [];
            return;
        }
        
        // 转换为数组
        this.currentData = Array.from(typeData.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
        
        console.log(`[Wiki] ${typeKey} 加载了 ${this.currentData.length} 条记录`);
    }
    
    /**
     * 应用搜索过滤
     */
    applyFilter() {
        if (!this.searchKeyword) {
            this.filteredData = [...this.currentData];
            return;
        }
        
        const keyword = this.searchKeyword.toLowerCase();
        this.filteredData = this.currentData.filter(item => {
            return Object.entries(item).some(([key, value]) => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(keyword);
            });
        });
        
        this.currentPage = 1;
    }
    
    /**
     * 渲染表格
     */
    renderTable() {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tableHead || !tableBody) return;
        
        // 检查是否有数据
        if (this.filteredData.length === 0) {
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 获取所有可能的列
        const columns = this.getColumns();
        
        // 渲染表头
        this.renderTableHead(tableHead, columns);
        
        // 渲染表体
        this.renderTableBody(tableBody, columns);
    }
    
    /**
     * 获取所有列
     */
    getColumns() {
        const columnSet = new Set();
        
        // 始终包含id列
        columnSet.add('id');
        
        // 收集所有数据中的键
        this.filteredData.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'id') {
                    columnSet.add(key);
                }
            });
        });
        
        // 转换为数组
        const columns = Array.from(columnSet);
        
        // 确保id在第一列，name在第二列，其他字段按字母顺序排列
        columns.sort((a, b) => {
            // id始终排在第一位
            if (a === 'id') return -1;
            if (b === 'id') return 1;
            
            // name始终排在第二位
            if (a === 'name') return -1;
            if (b === 'name') return 1;
            
            // 其他字段按字母顺序排列
            return a.localeCompare(b);
        });
        
        return columns;
    }
    
    /**
     * 渲染表头
     */
    renderTableHead(tableHead, columns) {
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = this.getColumnName(column);
            th.dataset.column = column;
            
            // 添加排序图标
            if (this.sortColumn === column) {
                const sortIcon = this.sortDirection === 'asc' ? '▲' : '▼';
                th.innerHTML += ` <span class="sort-icon">${sortIcon}</span>`;
            }
            
            // 绑定排序事件
            th.addEventListener('click', () => this.handleSort(column));
            
            headerRow.appendChild(th);
        });
        
        tableHead.innerHTML = '';
        tableHead.appendChild(headerRow);
    }
    
    /**
     * 渲染表体
     */
    renderTableBody(tableBody, columns) {
        // 排序数据
        let displayData = [...this.filteredData];
        if (this.sortColumn) {
            displayData.sort((a, b) => {
                let aVal = a[this.sortColumn];
                let bVal = b[this.sortColumn];
                
                // 处理null/undefined
                if (aVal === null || aVal === undefined) aVal = '';
                if (bVal === null || bVal === undefined) bVal = '';
                
                // 数字比较
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                // 字符串比较
                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                
                if (this.sortDirection === 'asc') {
                    return aStr.localeCompare(bStr, 'zh-CN');
                } else {
                    return bStr.localeCompare(aStr, 'zh-CN');
                }
            });
        }
        
        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = displayData.slice(startIndex, endIndex);
        
        // 渲染行
        const fragment = document.createDocumentFragment();
        
        pageData.forEach(item => {
            const tr = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                let value = item[column];
                
                // 处理ID列
                if (column === 'id') {
                    td.className = 'cell-id';
                    // 精灵图板块显示表情
                    if (this.currentSection === 'sprites' && window.spriteManager) {
                        const emoji = window.spriteManager.createEmoji(value);
                        if (emoji) {
                            td.appendChild(emoji);
                            td.appendChild(document.createTextNode(` ${value}`));
                        } else {
                            td.textContent = value;
                        }
                    } else {
                        td.textContent = value;
                    }
                } else {
                    // 格式化其他值
                    td.innerHTML = this.formatCellValue(value);
                }
                
                tr.appendChild(td);
            });
            
            fragment.appendChild(tr);
        });
        
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);
    }
    
    /**
     * 格式化单元格值
     */
    formatCellValue(value) {
        if (value === null || value === undefined) {
            return '<span style="color: #999;">-</span>';
        }
        
        if (typeof value === 'boolean') {
            return value ? '✓' : '✗';
        }
        
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                if (value.length === 0) return '<span style="color: #999;">[]</span>';
                return `<span class="cell-content" title="${JSON.stringify(value)}">[${value.length}项]</span>`;
            }
            const jsonStr = JSON.stringify(value);
            return `<span class="cell-content" title="${jsonStr}">{...}</span>`;
        }
        
        // 搜索高亮
        let strValue = String(value);
        if (this.searchKeyword) {
            const regex = new RegExp(`(${this.escapeRegex(this.searchKeyword)})`, 'gi');
            strValue = strValue.replace(regex, '<span class="highlight">$1</span>');
        }
        
        // 解析<sprite=id>标签
        if (window.spriteManager && strValue.includes('<sprite=')) {
            strValue = window.spriteManager.parseText(strValue);
        }
        
        return `<span class="cell-content" title="${this.escapeHtml(String(value))}">${strValue}</span>`;
    }
    
    /**
     * 获取列名
     */
    getColumnName(column) {
        // 尝试从idTypeKeys获取中文名称
        if (window.configManager && window.configManager.idTypeKeys) {
            // 将currentType转换为idTypeKeys的key格式
            const typeConfig = this.wikiTypes.find(t => t.key === this.currentType);
            const currentTypeKey = typeConfig ? typeConfig.key : this.currentType;
            const typeKeys = window.configManager.idTypeKeys[currentTypeKey];
            if (typeKeys && typeKeys[column] && typeKeys[column].name) {
                return typeKeys[column].name;
            }
        }
        
        // 默认映射
        const defaultNames = {
            'id': 'ID',
            'name': '名称',
            'title': '标题',
            'desc': '描述',
            'content': '内容',
            'text': '文本'
        };
        
        return defaultNames[column] || column;
    }
    
    /**
     * 处理排序
     */
    handleSort(column) {
        if (this.sortColumn === column) {
            // 切换排序方向
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // 新列，默认升序
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // 重新渲染表格
        this.renderTable();
    }
    
    /**
     * 更新分页
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        
        // 更新分页文本
        const paginationText = document.getElementById('paginationText');
        if (paginationText) {
            paginationText.textContent = `第 ${this.currentPage} 页，共 ${totalPages} 页`;
        }
        
        // 更新总记录数
        const totalRecords = document.getElementById('totalRecords');
        if (totalRecords) {
            totalRecords.textContent = `共 ${this.filteredData.length} 条记录`;
        }
        
        // 更新页码输入框
        const pageInput = document.getElementById('pageInput');
        if (pageInput) {
            pageInput.value = this.currentPage;
            pageInput.max = totalPages;
        }
        
        // 更新按钮状态
        const firstPage = document.getElementById('firstPage');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const lastPage = document.getElementById('lastPage');
        
        if (firstPage) firstPage.disabled = this.currentPage === 1;
        if (prevPage) prevPage.disabled = this.currentPage === 1;
        if (nextPage) nextPage.disabled = this.currentPage >= totalPages;
        if (lastPage) lastPage.disabled = this.currentPage >= totalPages;
    }
    
    /**
     * 更新记录数显示
     */
    updateRecordCount() {
        const recordCount = document.getElementById('recordCount');
        if (recordCount) {
            const typeConfig = this.wikiTypes.find(t => t.key === this.currentType);
            if (typeConfig) {
                recordCount.textContent = `${typeConfig.desc} · ${this.filteredData.length} 条记录`;
            }
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航点击事件
        document.getElementById('wikiNav')?.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link) {
                e.preventDefault();
                const typeKey = link.dataset.type;
                const section = link.dataset.section || 'idTypes';
                if (typeKey) {
                    // 更新URL hash
                    window.location.hash = typeKey;
                    this.loadType(typeKey, section);
                }
            }
        });
        
        // 监听hash变化
        window.addEventListener('hashchange', () => {
            this.handleUrlHash();
        });
        
        // 搜索事件
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKeyword = e.target.value.trim();
                this.applyFilter();
                this.renderTable();
                this.updatePagination();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchKeyword = searchInput?.value.trim() || '';
                this.applyFilter();
                this.renderTable();
                this.updatePagination();
            });
        }
        
        // 每页显示条数变更
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTable();
                this.updatePagination();
            });
        }
        
        // 分页按钮事件
        document.getElementById('firstPage')?.addEventListener('click', () => this.goToPage(1));
        document.getElementById('prevPage')?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        document.getElementById('lastPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
            this.goToPage(totalPages);
        });
        
        // 页码跳转
        document.getElementById('goPage')?.addEventListener('click', () => {
            const pageInput = document.getElementById('pageInput');
            if (pageInput) {
                const page = parseInt(pageInput.value);
                if (page >= 1) {
                    this.goToPage(page);
                }
            }
        });
        
        document.getElementById('pageInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1) {
                    this.goToPage(page);
                }
            }
        });
        
        // 回到顶部按钮
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
            
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    /**
     * 跳转到指定页
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
        
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        
        this.currentPage = page;
        this.renderTable();
        this.updatePagination();
        
        // 滚动到表格顶部
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * 显示/隐藏加载状态
     */
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const tableWrapper = document.querySelector('.table-wrapper');
        
        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
        if (tableWrapper) {
            tableWrapper.style.display = show ? 'none' : 'block';
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.innerHTML = `
                <div class="empty-icon">⚠️</div>
                <p>${message}</p>
            `;
            emptyState.style.display = 'block';
        }
    }
    
    /**
     * 转义HTML特殊字符
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 转义正则表达式特殊字符
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    window.wikiManager = new WikiManager();
});
