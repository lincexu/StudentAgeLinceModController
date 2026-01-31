// 结果渲染模块
class ResultRenderer {
    constructor() {
        this.duplicateSection = null;
        this.duplicateList = null;
        this.summaryContent = null;
        this.resultStats = null;
        this.progressSection = null;
        this.progressFill = null;
        this.progressText = null;
        
        // 规则文件缓存
        this.rulesCache = {};
        
        // 暴露为全局变量，以便在回调中使用
        window.resultRenderer = this;
        
        this.init();
        // 预加载规则文件
        this.preloadRules();
    }
    
    /**
     * 预加载所有规则文件
     */
    async preloadRules() {
        try {
            // 预加载effectRules
            const effectRules = await this.loadRuleFile('effectRules');
            if (effectRules) {
                this.rulesCache['effectRules'] = effectRules;
            }
            
            // 获取rule目录下的所有文件
            const ruleFiles = await this.getRuleFiles();
            
            // 预加载规则文件
            for (const ruleFile of ruleFiles) {
                const rules = await this.loadRuleFile(ruleFile);
                if (rules) {
                    this.rulesCache[ruleFile] = rules;
                }
            }
        } catch (error) {
            console.error('预加载规则文件出错:', error);
        }
    }
    
    /**
     * 获取rule目录下所有带Rules的文件
     * @returns {Promise<Array<string>>} 规则文件名称列表
     */
    async getRuleFiles() {
        try {
            // 发送请求获取目录内容
            const response = await fetch('lib/rules/');
            if (response.ok) {
                const dirContent = await response.text();
                
                // 提取文件名
                const fileNames = [];
                const regex = /href="([^"\/]+\.json)"/g;
                let match;
                
                while ((match = regex.exec(dirContent)) !== null) {
                    const fileName = match[1];
                    // 筛选出带Rules的文件
                    if (fileName.includes('Rules') || fileName.includes('Replace')) {
                        // 移除.json后缀
                        const ruleName = fileName.replace('.json', '');
                        fileNames.push(ruleName);
                    }
                }
                
                return fileNames;
            }
        } catch (error) {
            console.error('获取规则文件列表出错:', error);
        }
        
        // 失败时返回默认文件列表
        return ['conditionRules', 'itemTagRules', 'sexRules', 'costReplace', 'Replace', 'ruleReplace'];
    }
    
    /**
     * 异步加载规则文件
     * @param {string} ruleName 规则名称
     * @returns {Promise<Object>} 规则数据
     */
    async loadRuleFile(ruleName) {
        try {
            const response = await fetch(`lib/rules/${ruleName.toLowerCase()}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error(`加载规则文件 ${ruleName} 出错:`, error);
        }
        return null;
    }
    
    /**
     * 转义JSON字符串以便在HTML属性中使用
     * @param {Object} obj - 要转义的对象
     * @returns {string} 转义后的字符串
     */
    escapeJSONForHTML(obj) {
        const jsonString = JSON.stringify(obj);
        return jsonString
            .replace(/&/g, '&amp;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    /**
     * 从HTML属性中解析转义的JSON字符串
     * @param {string} str - 转义后的字符串
     * @returns {Object} 解析后的对象
     */
    unescapeJSONFromHTML(str) {
        let unescaped = str
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
        return JSON.parse(unescaped);
    }

    init() {
        this.duplicateSection = document.getElementById('duplicate-section');
        this.duplicateList = document.getElementById('duplicate-list');
        this.summaryContent = document.getElementById('summary-content');
        this.resultStats = document.getElementById('result-stats');
        this.progressSection = document.getElementById('progress-section');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        this.initCustomTooltip();
    }
    
    /**
     * 初始化自定义悬浮提示框
     */
    initCustomTooltip() {
        let tooltip = document.querySelector('.custom-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            document.body.appendChild(tooltip);
        }
        
        let tooltipTimeout = null;
        let currentElement = null;
        let isTooltipVisible = false;
        
        const showTooltip = (element) => {
            if (!element) return;
            
            let tooltipContent = '';
            let tooltipTitle = '';
            let tooltipRule = '';
            let tooltipValue = '';
            
            const rowLabel = element.classList.contains('row-label');
            const rowValue = element.classList.contains('row-value');
            const tableHeader = element.tagName === 'TH' && element.closest('.horizontal-table');
            const tableCell = element.tagName === 'TD' && element.closest('.horizontal-table');
            
            if (rowLabel || tableHeader) {
                const desc = element.getAttribute('data-desc');
                if (desc) {
                    tooltipTitle = desc;
                    tooltipContent = '属性描述';
                }
            } else if (rowValue || tableCell) {
                const original = element.getAttribute('data-original');
                const rule = element.getAttribute('data-rule');
                if (original) {
                    tooltipValue = original;
                    tooltipTitle = '原始值';
                }
                if (rule) {
                    tooltipRule = rule;
                }
            }
            
            if (!tooltipTitle && !tooltipContent && !tooltipRule && !tooltipValue) {
                return;
            }
            
            let html = '';
            if (tooltipTitle) {
                html += `<div class="tooltip-title">${tooltipTitle}</div>`;
            }
            if (tooltipContent) {
                html += `<div class="tooltip-content">${tooltipContent}</div>`;
            }
            if (tooltipRule) {
                html += `<div class="tooltip-rule">规则: ${tooltipRule}</div>`;
            }
            if (tooltipValue) {
                html += `<div class="tooltip-value">${tooltipValue}</div>`;
            }
            
            tooltip.innerHTML = html;
            tooltip.classList.add('visible');
            isTooltipVisible = true;
            
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            let top = rect.top - tooltipRect.height - 12;
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            
            if (top < 10) {
                top = rect.bottom + 12;
                tooltip.classList.add('top');
            } else {
                tooltip.classList.remove('top');
            }
            
            if (left < 10) {
                left = 10;
            } else if (left + tooltipRect.width > viewportWidth - 10) {
                left = viewportWidth - tooltipRect.width - 10;
            }
            
            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
        };
        
        const hideTooltip = () => {
            tooltip.classList.remove('visible');
            isTooltipVisible = false;
            
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            
            currentElement = null;
        };
        
        const handleMouseEnter = (e) => {
            const target = e.target.closest('[data-desc], [data-original]');
            if (!target) return;
            
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            
            currentElement = target;
            
            tooltipTimeout = setTimeout(() => {
                showTooltip(currentElement);
            }, 1000);
        };
        
        const handleMouseLeave = (e) => {
            const target = e.target.closest('[data-desc], [data-original]');
            if (target) {
                hideTooltip();
            }
        };
        
        const handleMouseMove = (e) => {
            if (!isTooltipVisible || !currentElement) return;
            
            const rect = currentElement.getBoundingClientRect();
            
            if (e.clientX < rect.left || e.clientX > rect.right || 
                e.clientY < rect.top || e.clientY > rect.bottom) {
                hideTooltip();
            }
        };
        
        document.addEventListener('mouseover', handleMouseEnter, true);
        document.addEventListener('mouseout', handleMouseLeave, true);
        document.addEventListener('mousemove', handleMouseMove, true);
        
        window.addEventListener('resize', () => {
            if (isTooltipVisible && currentElement) {
                showTooltip(currentElement);
            }
        });
        
        window.addEventListener('scroll', () => {
            if (isTooltipVisible) {
                hideTooltip();
            }
        }, true);
    }

    /**
     * 更新已选择文件夹的统计信息
     * @param {Object[]} folders - 选中的文件夹列表
     */
    updateFolderStats(folders) {
        // 更新统计数字
        this.resultStats.innerHTML = `
            <span class="stat-item">已选择 ${folders.length} 个文件夹</span>
            <div id="folder-icons-container" style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 15px;"></div>
        `;
        
        // 渲染文件夹图标
        const container = document.getElementById('folder-icons-container');
        container.innerHTML = folders.map((folder, index) => `
            <div class="folder-icon" style="
                position: relative;
                background: #f0f2ff;
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 15px;
                width: 150px;
                text-align: center;
                box-shadow: 0 4px 10px rgba(102, 126, 234, 0.2);
                transition: all 0.3s ease;
            ">
                <div class="folder-icon-content" style="font-size: 3rem; margin-bottom: 10px;">📁</div>
                <div class="folder-icon-name" style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${folder.name}</div>
                <button class="folder-remove-btn" data-index="${index}" style="
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #dc3545;
                    color: white;
                    border: 2px solid white;
                    border-radius: 50%;
                    width: 25px;
                    height: 25px;
                    font-size: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                ">×</button>
            </div>
        `).join('');
        
        // 添加移除按钮事件
        const removeBtns = container.querySelectorAll('.folder-remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                // 触发移除事件
                if (this.onFolderRemove) {
                    this.onFolderRemove(index);
                }
            });
        });
    }
    
    /**
     * 设置文件夹移除回调
     * @param {Function} callback - 回调函数
     */
    setOnFolderRemove(callback) {
        this.onFolderRemove = callback;
    }

    /**
     * 显示进度条
     */
    showProgress() {
        this.progressSection.style.display = 'block';
        this.updateProgress('准备分析...', 0);
    }

    /**
     * 更新进度条
     * @param {string} text - 进度文本
     * @param {number} percentage - 进度百分比
     */
    updateProgress(text, percentage) {
        this.progressText.textContent = text;
        this.progressFill.style.width = `${percentage}%`;
    }

    /**
     * 隐藏进度条
     */
    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    /**
     * 渲染分析结果
     * @param {Object} result - 分析结果
     */
    renderResults(result) {
        // 隐藏进度条
        this.hideProgress();
        
        // 显示重复ID（处理所有类型）
        this.renderDuplicateIds(result);
        
        // 显示统计摘要
        this.renderSummary(result);
    }
    
    /**
     * 渲染所有类型的重复ID
     * @param {Object} result - 分析结果
     */
    renderDuplicateIds(result) {
        const { idTypes, modDetails } = result;
        
        // 遍历所有ID类型
        for (const type in idTypes) {
            const typeConfig = idTypes[type];
            const duplicateKey = `duplicate${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
            const duplicateIds = result[duplicateKey] || [];
            
            // 如果没有重复ID，跳过
            if (duplicateIds.length === 0) continue;
            
            // 创建重复ID区域
            const duplicateSection = document.createElement('section');
            duplicateSection.className = 'duplicate-section';
            duplicateSection.innerHTML = `
                <h3>⚠️ 重复${typeConfig.displayName}ID检测</h3>
                <div class="duplicate-list">
                    <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                        <strong>⚠️ 检测到 ${duplicateIds.length} 个重复${typeConfig.displayName}ID</strong><br>
                        以下${typeConfig.displayName}ID在多个模组中被使用，可能会导致游戏冲突：
                    </div>
                    ${duplicateIds.map(([id, modNames]) => `
                        <div class="duplicate-item">
                            <div class="duplicate-id">${typeConfig.displayName}ID: ${id}</div>
                            <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                            <div class="duplicate-modules">
                                ${Array.from(modNames).map(modName => {
                                    const modDetail = modDetails.get(modName);
                                    const detailKey = `${type}s`;
                                    // 找到该模组中使用此ID的项
                                    const item = modDetail[detailKey] && modDetail[detailKey].find(e => e.id === id);
                                    return `
                                        <div class="module-item">
                                            <div>
                                                <div class="module-name">${modDetail.title || modName}</div>
                                                <div class="module-path">${modDetail.path}</div>
                                            </div>
                                            <div style="color: #666; font-size: 0.9rem;">${typeConfig.displayName}名称: ${item ? (item.name || item.title || '未知') : '未知'}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // 添加到结果区域
            this.duplicateSection.after(duplicateSection);
        }
        
        // 如果没有任何重复ID，显示提示
        const allDuplicateSections = document.querySelectorAll('.duplicate-section');
        if (allDuplicateSections.length === 1 && allDuplicateSections[0].querySelector('.duplicate-list').children.length === 0) {
            this.duplicateSection.style.display = 'block';
            this.duplicateList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <div>未检测到重复ID</div>
                    <div style="margin-top: 10px; color: #666; font-size: 0.9rem;">所有模组ID都是唯一的</div>
                </div>
            `;
        }
    }

    /**
     * 渲染重复事件ID
     * @param {Object} result - 分析结果
     */
    renderDuplicateEventIds(result) {
        const { duplicateEventIds, modDetails } = result;
        
        if (duplicateEventIds.length > 0) {
            this.duplicateSection.style.display = 'block';
            this.duplicateList.innerHTML = `
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                    <strong>⚠️ 检测到 ${duplicateEventIds.length} 个重复事件ID</strong><br>
                    以下事件ID在多个模组中被使用，可能会导致游戏冲突：
                </div>
                ${duplicateEventIds.map(([id, modNames]) => `
                    <div class="duplicate-item">
                        <div class="duplicate-id">事件ID: ${id}</div>
                        <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                        <div class="duplicate-modules">
                            ${Array.from(modNames).map(modName => {
                                const modDetail = modDetails.get(modName);
                                // 找到该模组中使用此ID的事件
                                const event = modDetail.events.find(e => e.id === id);
                                return `
                                    <div class="module-item">
                                        <div>
                                            <div class="module-name">${modName}</div>
                                            <div class="module-path">${modDetail.path}</div>
                                        </div>
                                        <div style="color: #666; font-size: 0.9rem;">事件标题: ${event.title}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            `;
        } else {
            this.duplicateSection.style.display = 'block';
            this.duplicateList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <div>未检测到重复事件ID</div>
                    <div style="margin-top: 10px; color: #666; font-size: 0.9rem;">所有模组事件ID都是唯一的</div>
                </div>
            `;
        }
    }
    
    /**
     * 渲染重复物品ID
     * @param {Object} result - 分析结果
     */
    renderDuplicateItemIds(result) {
        const { duplicateItemIds, modDetails } = result;
        
        // 如果没有重复物品ID，不显示
        if (duplicateItemIds.length === 0) return;
        
        // 创建物品重复ID区域
        const itemDuplicateSection = document.createElement('section');
        itemDuplicateSection.className = 'duplicate-section';
        itemDuplicateSection.innerHTML = `
            <h3>⚠️ 重复物品ID检测</h3>
            <div class="duplicate-list">
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                    <strong>⚠️ 检测到 ${duplicateItemIds.length} 个重复物品ID</strong><br>
                    以下物品ID在多个模组中被使用，可能会导致游戏冲突：
                </div>
                ${duplicateItemIds.map(([id, modNames]) => `
                    <div class="duplicate-item">
                        <div class="duplicate-id">物品ID: ${id}</div>
                        <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                        <div class="duplicate-modules">
                            ${Array.from(modNames).map(modName => {
                                const modDetail = modDetails.get(modName);
                                // 找到该模组中使用此ID的物品
                                const item = modDetail.items.find(e => e.id === id);
                                return `
                                    <div class="module-item">
                                        <div>
                                            <div class="module-name">${modName}</div>
                                            <div class="module-path">${modDetail.path}</div>
                                        </div>
                                        <div style="color: #666; font-size: 0.9rem;">物品名称: ${item.name}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 添加到结果区域
        this.duplicateSection.after(itemDuplicateSection);
    }
    
    /**
     * 渲染重复书籍ID
     * @param {Object} result - 分析结果
     */
    renderDuplicateBookIds(result) {
        const { duplicateBookIds, modDetails } = result;
        
        // 如果没有重复书籍ID，不显示
        if (duplicateBookIds.length === 0) return;
        
        // 创建书籍重复ID区域
        const bookDuplicateSection = document.createElement('section');
        bookDuplicateSection.className = 'duplicate-section';
        bookDuplicateSection.innerHTML = `
            <h3>⚠️ 重复书籍ID检测</h3>
            <div class="duplicate-list">
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                    <strong>⚠️ 检测到 ${duplicateBookIds.length} 个重复书籍ID</strong><br>
                    以下书籍ID在多个模组中被使用，可能会导致游戏冲突：
                </div>
                ${duplicateBookIds.map(([id, modNames]) => `
                    <div class="duplicate-item">
                        <div class="duplicate-id">书籍ID: ${id}</div>
                        <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                        <div class="duplicate-modules">
                            ${Array.from(modNames).map(modName => {
                                const modDetail = modDetails.get(modName);
                                // 找到该模组中使用此ID的书籍
                                const book = modDetail.books.find(e => e.id === id);
                                return `
                                    <div class="module-item">
                                        <div>
                                            <div class="module-name">${modName}</div>
                                            <div class="module-path">${modDetail.path}</div>
                                        </div>
                                        <div style="color: #666; font-size: 0.9rem;">书籍名称: ${book.name}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 添加到结果区域
        // 找到所有重复ID区域，添加到最后一个后面
        const duplicateSections = document.querySelectorAll('.duplicate-section');
        if (duplicateSections.length > 0) {
            duplicateSections[duplicateSections.length - 1].after(bookDuplicateSection);
        } else {
            this.duplicateSection.after(bookDuplicateSection);
        }
    }
    
    /**
     * 渲染重复行动ID
     * @param {Object} result - 分析结果
     */
    renderDuplicateActionIds(result) {
        const { duplicateActionIds, modDetails } = result;
        
        // 如果没有重复行动ID，不显示
        if (duplicateActionIds.length === 0) return;
        
        // 创建行动重复ID区域
        const actionDuplicateSection = document.createElement('section');
        actionDuplicateSection.className = 'duplicate-section';
        actionDuplicateSection.innerHTML = `
            <h3>⚠️ 重复行动ID检测</h3>
            <div class="duplicate-list">
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                    <strong>⚠️ 检测到 ${duplicateActionIds.length} 个重复行动ID</strong><br>
                    以下行动ID在多个模组中被使用，可能会导致游戏冲突：
                </div>
                ${duplicateActionIds.map(([id, modNames]) => `
                    <div class="duplicate-item">
                        <div class="duplicate-id">行动ID: ${id}</div>
                        <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                        <div class="duplicate-modules">
                            ${Array.from(modNames).map(modName => {
                                const modDetail = modDetails.get(modName);
                                // 找到该模组中使用此ID的行动
                                const action = modDetail.actions.find(e => e.id === id);
                                return `
                                    <div class="module-item">
                                        <div>
                                            <div class="module-name">${modName}</div>
                                            <div class="module-path">${modDetail.path}</div>
                                        </div>
                                        <div style="color: #666; font-size: 0.9rem;">行动名称: ${action.name}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 添加到结果区域
        // 找到所有重复ID区域，添加到最后一个后面
        const duplicateSections = document.querySelectorAll('.duplicate-section');
        if (duplicateSections.length > 0) {
            duplicateSections[duplicateSections.length - 1].after(actionDuplicateSection);
        } else {
            this.duplicateSection.after(actionDuplicateSection);
        }
    }

    /**
     * 渲染统计摘要
     * @param {Object} result - 分析结果
     */
    renderSummary(result) {
        this.currentResult = result;
        const { totalMods, idTypes, modDetails } = result;
        
        // 显示可视化区域
        const visualizationSection = document.getElementById('visualization-section');
        if (visualizationSection) {
            visualizationSection.style.display = 'block';
        }
        
        // 渲染图表
        this.renderCharts(result);
        
        // 计算所有ID类型的统计信息
        let totalAllIds = 0;
        let uniqueAllIds = 0;
        let duplicateAllIds = 0;
        const typeStats = {};
        
        for (const type in idTypes) {
            const typeConfig = idTypes[type];
            const totalKey = `total${type.charAt(0).toUpperCase() + type.slice(1)}s`;
            const uniqueKey = `unique${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
            const duplicateKey = `duplicate${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
            
            const total = result[totalKey] || 0;
            const unique = result[uniqueKey] || 0;
            const duplicate = (result[duplicateKey] || []).length;
            
            totalAllIds += total;
            uniqueAllIds += unique;
            duplicateAllIds += duplicate;
            
            typeStats[type] = {
                total,
                unique,
                duplicate,
                config: typeConfig
            };
        }
        
        this.summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-icon">📁</div>
                    <div class="summary-value">${totalMods}</div>
                    <div class="summary-label">分析的模组数</div>
                </div>
                ${Object.entries(typeStats).map(([type, stats]) => {
                    // 根据类型获取对应的图标
                    const icons = {
                        event: '📅',
                        item: '🎒',
                        book: '📚',
                        action: '⚡',
                        character: '👤',
                        location: '📍',
                        quest: '📜',
                        skill: '🎯',
                        achievement: '🏆',
                        effect: '✨',
                        dialogue: '💬',
                        cutscene: '🎬',
                        miniGame: '🎮',
                        collectible: '🔍',
                        upgrade: '📈',
                        unlockable: '🔓',
                        resource: '💎',
                        audio: '🔊',
                        bg: '🖼️',
                        c_g: '🎬',
                        intent: '🎯',
                        k_zone_avatar: '👤',
                        k_zone_comment: '💬',
                        k_zone_content: '📝',
                        k_zone_profile: '👤',
                        person: '👤',
                        person_grow: '📈',
                        renshengguan_memory: '📝',
                        shop: '🛒'
                    };
                    const icon = icons[type] || '📋';
                    return `
                <div class="summary-item">
                    <div class="summary-icon">${icon}</div>
                    <div class="summary-value">${stats.total}</div>
                    <div class="summary-label">总${stats.config.displayName}数</div>
                </div>
                `;
                }).join('')}
                <div class="summary-item">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-value">${Object.values(typeStats).reduce((sum, stats) => sum + stats.duplicate, 0)}</div>
                    <div class="summary-label">重复ID总数</div>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <h4>模组详情：</h4>
                <div style="margin-top: 15px;">
                    ${Array.from(modDetails.entries()).map(([modName, modDetail]) => {
                        // 找出当前模组的重复事件ID和重复物品ID
                        // 找出当前模组的所有重复ID
                        const duplicateIdsByType = {};
                        for (const type in result.idTypes) {
                            const typeConfig = result.idTypes[type];
                            const modIdsKey = `mod${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
                            const allIdsKey = `all${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
                            
                            const modIdsSet = result[modIdsKey].get(modName);
                            duplicateIdsByType[type] = Array.from(modIdsSet || []).filter(id => 
                                result[allIdsKey].get(id).size > 1
                            );
                        }
                        
                        // 获取事件、物品、书籍、行动的重复ID（兼容旧代码）
                        const modEventIdsSet = result.modEventIds ? result.modEventIds.get(modName) : null;
                        const duplicateEventsInMod = Array.from(modEventIdsSet || []).filter(id => 
                            result.allEventIds && result.allEventIds.get(id)?.size > 1
                        );
                        
                        const modItemIdsSet = result.modItemIds ? result.modItemIds.get(modName) : null;
                        const duplicateItemsInMod = Array.from(modItemIdsSet || []).filter(id => 
                            result.allItemIds && result.allItemIds.get(id)?.size > 1
                        );
                        
                        const modBookIdsSet = result.modBookIds ? result.modBookIds.get(modName) : null;
                        const duplicateBooksInMod = Array.from(modBookIdsSet || []).filter(id => 
                            result.allBookIds && result.allBookIds.get(id)?.size > 1
                        );
                        
                        const modActionIdsSet = result.modActionIds ? result.modActionIds.get(modName) : null;
                        const duplicateActionsInMod = Array.from(modActionIdsSet || []).filter(id => 
                            result.allActionIds && result.allActionIds.get(id)?.size > 1
                        );
                        
                        return `
                            <div style="margin-bottom: 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                <!-- 模组标题栏 -->
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="mod-header">
                                    <div>
                                        <h5 style="margin: 0; font-size: 1.1rem;">${modDetail.title || modName}</h5>
                                        <p style="margin: 5px 0 0 0; font-size: 0.8rem; opacity: 0.9;">${modName}</p>
                                    </div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                                        ${Object.entries(result.idTypes).map(([type, typeConfig]) => {
                                            const detailKey = `${type}s`;
                                            const count = modDetail[detailKey]?.length || 0;
                                            return count > 0 ? `
                                            <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">${typeConfig.displayName}: ${count}</div>
                                            ` : '';
                                        }).filter(Boolean).join('')}
                                        <div class="mod-toggle-icon">▼</div>
                                    </div>
                                </div>
                                
                                <!-- 模组详情内容，默认隐藏 -->
                                <div class="mod-content" style="display: none; padding: 20px;">
                                    <!-- 模组统计 -->
                                    <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
                                        <h6 style="margin: 0 0 10px 0; color: var(--text-primary);">模组统计</h6>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                                            ${Object.entries(result.idTypes).map(([type, typeConfig]) => {
                                                const detailKey = `${type}s`;
                                                const count = modDetail[detailKey]?.length || 0;
                                                const duplicateCount = duplicateIdsByType[type]?.length || 0;
                                                if (count === 0) return '';
                                                
                                                return `
                                                <div>
                                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${typeConfig.displayName}总数</div>
                                                    <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary);">${count}</div>
                                                </div>
                                                <div>
                                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">重复${typeConfig.displayName}ID</div>
                                                    <div style="font-size: 1.2rem; font-weight: 600; color: ${duplicateCount === 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${duplicateCount}</div>
                                                </div>
                                                `;
                                            }).filter(Boolean).join('')}
                                        </div>
                                        
                                        <!-- 动态生成所有类型的重复ID列表 -->
                                        ${Object.entries(duplicateIdsByType).map(([type, ids]) => {
                                            if (ids.length === 0) return '';
                                            const typeConfig = result.idTypes[type];
                                            return `
                                            <div style="margin-top: 15px;">
                                                <strong style="color: var(--danger-color); font-size: 0.9rem;">重复${typeConfig.displayName}ID列表：</strong>
                                                <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                                    ${ids.map(id => `
                                                        <span style="background: var(--danger-light); color: var(--danger-color); padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                            `;
                                        }).filter(Boolean).join('')}
                                    </div>
                                    
                                    <!-- 动态生成所有类型的详情表格 -->
                                    ${Object.entries(result.idTypes).map(([type, typeConfig]) => {
                                        const detailKey = `${type}s`;
                                        const items = modDetail[detailKey] || [];
                                        if (items.length === 0) return '';
                                        
                                        // 根据类型获取对应的图标
                                        const icons = {
                                            event: '📅',
                                            item: '🎒',
                                            book: '📚',
                                            action: '⚡',
                                            character: '👤',
                                            location: '📍',
                                            quest: '📜',
                                            skill: '🎯',
                                            achievement: '🏆',
                                            effect: '✨',
                                            dialogue: '💬',
                                            cutscene: '🎬',
                                            miniGame: '🎮',
                                            collectible: '🔍',
                                            upgrade: '📈',
                                            unlockable: '🔓',
                                            resource: '💎',
                                            audio: '🔊',
                                            bg: '🖼️',
                                            c_g: '🎬',
                                            intent: '🎯',
                                            k_zone_avatar: '👤',
                                            k_zone_comment: '💬',
                                            k_zone_content: '📝',
                                            k_zone_profile: '👤',
                                            person: '👤',
                                            person_grow: '📈',
                                            renshengguan_memory: '📝',
                                            shop: '🛒'
                                        };
                                        const icon = icons[type] || '📋';
                                        
                                        // 获取重复ID检查的方法
                                        const allIdsKey = `all${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
                                        
                                        // 直接使用typeConfig中的keyList
                                        let keyName = typeConfig.keyList;
                                        
                                        // 如果没有找到对应的keyList，使用默认命名规则
                                        if (!keyName) {
                                            // 处理带下划线的类型名称，生成正确的驼峰命名
                                            const camelCaseType = type.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
                                            keyName = `${camelCaseType.charAt(0).toUpperCase() + camelCaseType.slice(1)}Key`;
                                        }
                                        
                                        const idTypeKeyDef = configManager.idTypeKeys && configManager.idTypeKeys[keyName];
                                        
                                        // 收集所有唯一的key（用于验证）
                                        const allKeys = new Set();
                                        items.forEach(item => {
                                            if (typeof item === 'object' && item !== null) {
                                                Object.keys(item).forEach(key => allKeys.add(key));
                                            }
                                        });
                                        
                                        const sortedKeys = [];
                                        
                                        if (idTypeKeyDef) {
                                            // 严格按照idTypeKeys.json中定义的key和顺序，只渲染定义的key
                                            Object.keys(idTypeKeyDef).forEach(key => {
                                                sortedKeys.push(key);
                                            });
                                        } else {
                                            // 如果没有定义，则按照原始数据的属性顺序显示所有属性
                                            const keysArray = Array.from(allKeys);
                                            sortedKeys.push(...keysArray);
                                        }
                                        
                                        // 获取当前表格布局配置
                                        const tableLayout = configManager.get().tableLayout || 'vertical';
                                        
                                        // 生成ID类型详情内容
                                        const idTypeContent = () => {
                                            // 渲染竖列式布局
                if (tableLayout === 'vertical') {
                    const fullItems = items;
                    const itemsPerPage = configManager.get('verticalPageSize') || 50;
                    return `
                    <div class="virtual-scroll-container" style="max-height: 800px; overflow-y: auto; position: relative;" data-type="${type}" data-total="${fullItems.length}" data-page-size="${itemsPerPage}" data-current-page="1" data-items='${this.escapeJSONForHTML(fullItems)}'>
                                                    <div class="vertical-table-container" style="overflow-y: auto; max-height: 600px;">
                                                        ${fullItems.slice(0, itemsPerPage).map((item, itemIndex) => {
                                                            const isDuplicate = result[allIdsKey] && result[allIdsKey].get(item.id).size > 1;
                                                            return `
                                                            <div class="vertical-table-card ${isDuplicate ? 'duplicate' : ''}" data-index="${itemIndex}">
                                                                <div class="card-header">
                                                                    <div class="card-title">
                                                                        ${sortedKeys.length > 0 ? (() => {
                                                                            // 尝试从sortedKeys中获取第一个非空值作为标题
                                                                            for (const key of sortedKeys) {
                                                                                if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                                                                                    return item[key];
                                                                                }
                                                                            }
                                                                            return '-';
                                                                        })() : '-'}
                                                                    </div>
                                                                    <div class="card-status">
                                                                        <span class="status-badge ${isDuplicate ? 'duplicate' : 'unique'}">
                                                                            ${isDuplicate ? '重复' : '唯一'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div class="card-body">
                                                                    <div class="vertical-table-rows">
                                                                        ${sortedKeys.map((key, index) => {
                                                                            let value = item[key];
                                                                             
                                                                            // 保存原始值用于鼠标悬浮显示
                                                                            const originalValue = value;
                                                                             
                                                                            // 获取当前key对应的rule属性
                                                                            let rule = null;
                                                                            if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                                                rule = idTypeKeyDef[key].rule;
                                                                            }
                                                                             
                                                                            // 应用ID替换功能
                                                                            let displayValue = value;
                                                                            if (rule) {
                                                                                if (typeof value === 'object' && value !== null) {
                                                                                    // 如果是对象，尝试JSON.stringify后替换
                                                                                    try {
                                                                                        const jsonString = JSON.stringify(value);
                                                                                        displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                                                    } catch (e) {
                                                                                        // 忽略错误，使用原始值
                                                                                    }
                                                                                } else {
                                                                                    // 直接替换
                                                                                    displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                                                                }
                                                                            }
                                                                             
                                                                            // 获取属性的中文名称
                                                                            let attributeName = key;
                                                                            if (idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].name) {
                                                                                attributeName = idTypeKeyDef[key].name;
                                                                            } else {
                                                                                // 尝试使用configManager.getAttributeCN
                                                                                attributeName = configManager.getAttributeCN(type, key);
                                                                            }
                                                                             
                                                                            // 格式化显示值
                                                                            let formattedValue;
                                                                            if (displayValue === undefined || displayValue === null) {
                                                                                formattedValue = '-';
                                                                            } else if (typeof displayValue === 'object') {
                                                                                // 如果是对象或数组，格式化为JSON字符串
                                                                                formattedValue = JSON.stringify(displayValue, null, 2);
                                                                            } else {
                                                                                formattedValue = displayValue;
                                                                            }
                                                                             
                                                                            return `
                                                                            <div class="vertical-table-row">
                                                                                <div class="row-label" data-desc="${idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].desc ? idTypeKeyDef[key].desc : ''}">${attributeName}:</div>
                                                                                <div class="row-value" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                                                                    <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: inherit;">${formattedValue}</pre>
                                                                                </div>
                                                                            </div>
                                                                            `;
                                                                        }).join('')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            `;
                                                        }).join('')}
                                                    </div>
                                                    ${fullItems.length > itemsPerPage ? `
                                                    <div class="pagination-controls" style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; border-top: 2px solid #667eea; margin-top: 15px; background: #f8f9ff; border-radius: 0 0 8px 8px;">
                                                        <div style="color: #666; font-size: 1rem; font-weight: 500;">
                                                            共 ${fullItems.length} 项，每页 ${itemsPerPage} 项
                                                        </div>
                                                        <div style="display: flex; gap: 15px; align-items: center;">
                                                            <button class="page-btn" data-action="prev" style="padding: 8px 16px; border: 2px solid #667eea; border-radius: 6px; background: white; color: #667eea; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.3s ease;">
                                                                上一页
                                                            </button>
                                                            <span style="font-size: 1rem; font-weight: 600; color: #667eea; padding: 0 10px;">第 <span class="current-page">1</span> 页</span>
                                                            <button class="page-btn" data-action="next" style="padding: 8px 16px; border: 2px solid #667eea; border-radius: 6px; background: white; color: #667eea; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.3s ease;">
                                                                下一页
                                                            </button>
                                                        </div>
                                                    </div>
                                                    ` : ''}
                                                </div>
                                                `;
                                            } else {
                    // 渲染横列式布局
                    const fullItems = items;
                    const itemsPerPage = configManager.get('horizontalPageSize') || 50;
                    return `
                    <div class="virtual-scroll-container" style="max-height: 800px; overflow-y: auto; position: relative;" data-type="${type}" data-total="${fullItems.length}" data-page-size="${itemsPerPage}" data-current-page="1" data-items='${this.escapeJSONForHTML(fullItems)}'>
                                                    <div style="overflow-x: auto; overflow-y: auto; max-height: 600px;">
                                                        <table class="horizontal-table" style="width: 100%; border-collapse: collapse; background: var(--bg-primary); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm); table-layout: auto; border: 1px solid var(--border-color);">
                                                            <thead style="background: var(--primary-gradient); color: white; position: sticky; top: 0; z-index: 1;">
                                                                <tr>
                                                                    ${sortedKeys.map(key => {
                                                                        // 获取属性的中文名称
                                                                        let attributeName = key;
                                                                        let attributeDesc = '';
                                                                        if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                                            if (idTypeKeyDef[key].name) {
                                                                                attributeName = idTypeKeyDef[key].name;
                                                                            }
                                                                            if (idTypeKeyDef[key].desc) {
                                                                                attributeDesc = idTypeKeyDef[key].desc;
                                                                            }
                                                                        } else {
                                                                            // 尝试使用configManager.getAttributeCN
                                                                            attributeName = configManager.getAttributeCN(type, key);
                                                                        }
                                                                        return `
                                                                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: bold; white-space: nowrap; min-width: 100px;" data-desc="${attributeDesc}">${attributeName}</th>
                                                                        `;
                                                                    }).join('')}
                                                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: bold; white-space: nowrap;">状态</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${fullItems.slice(0, itemsPerPage).map((item, itemIndex) => {
                                                                    const isDuplicate = result[allIdsKey] && result[allIdsKey].get(item.id).size > 1;
                                                                    return `
                                                                    <tr style="${isDuplicate ? 'background: var(--danger-light);' : ''};" data-index="${itemIndex}">
                                                                        ${sortedKeys.map(key => {
                                                                            let value = item[key];
                                                                             
                                                                            // 保存原始值用于鼠标悬浮显示
                                                                            const originalValue = value;
                                                                             
                                                                            // 获取当前key对应的rule属性
                                                                            let rule = null;
                                                                            if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                                                rule = idTypeKeyDef[key].rule;
                                                                            }
                                                                             
                                                                            // 应用ID替换功能
                                                                            let displayValue = value;
                                                                            if (rule) {
                                                                                if (typeof value === 'object' && value !== null) {
                                                                                    // 如果是对象，尝试JSON.stringify后替换
                                                                                    try {
                                                                                        const jsonString = JSON.stringify(value);
                                                                                        displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                                                    } catch (e) {
                                                                                        // 忽略错误，使用原始值
                                                                                    }
                                                                                } else {
                                                                                    // 直接替换
                                                                                    displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                                                                }
                                                                            }
                                                                             
                                                                            // 格式化显示值
                                                                            let formattedValue;
                                                                            if (displayValue === undefined || displayValue === null) {
                                                                                formattedValue = '-';
                                                                            } else if (typeof displayValue === 'object') {
                                                                                // 如果是对象或数组，格式化为JSON字符串
                                                                                formattedValue = JSON.stringify(displayValue);
                                                                            } else {
                                                                                formattedValue = displayValue;
                                                                            }
                                                                             
                                                                            return `
                                                                            <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                                                                ${formattedValue}
                                                                            </td>
                                                                            `;
                                                                        }).join('')}
                                                                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                                                            <span class="status-badge ${isDuplicate ? 'duplicate' : 'unique'}">
                                                                                ${isDuplicate ? '重复' : '唯一'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    `;
                                                                }).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    ${fullItems.length > itemsPerPage ? `
                                                    <div class="pagination-controls" style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; border-top: 2px solid #667eea; margin-top: 15px; background: #f8f9ff; border-radius: 0 0 8px 8px;">
                                                        <div style="color: #666; font-size: 1rem; font-weight: 500;">
                                                            共 ${fullItems.length} 项，每页 ${itemsPerPage} 项
                                                        </div>
                                                        <div style="display: flex; gap: 15px; align-items: center;">
                                                            <button class="page-btn" data-action="prev" style="padding: 8px 16px; border: 2px solid #667eea; border-radius: 6px; background: white; color: #667eea; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.3s ease;">
                                                                上一页
                                                            </button>
                                                            <span style="font-size: 1rem; font-weight: 600; color: #667eea; padding: 0 10px;">第 <span class="current-page">1</span> 页</span>
                                                            <button class="page-btn" data-action="next" style="padding: 8px 16px; border: 2px solid #667eea; border-radius: 6px; background: white; color: #667eea; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.3s ease;">
                                                                下一页
                                                            </button>
                                                        </div>
                                                    </div>
                                                    ` : ''}
                                                </div>
                                                `;
                                            }
                                        };
                                        
                                        // 返回可折叠的ID类型详情容器
                                        return `
                                        <div style="margin-bottom: 20px;">
                                            <div class="id-type-header" style="margin: 0; background: #f8f9ff; border: 1px solid #e0e7ff; border-radius: 8px 8px 0 0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                                <h6 style="margin: 0; color: #495057; display: flex; align-items: center; gap: 5px;">
                                                    <span>${icon} ${typeConfig.displayName}详情</span>
                                                    <span style="font-size: 0.8rem; font-weight: normal; color: #6c757d;">(${items.length}个)</span>
                                                </h6>
                                                <div class="id-type-toggle" style="font-size: 0.8rem; color: #667eea; font-weight: bold; transition: transform 0.2s ease;">▶</div>
                                            </div>
                                            <div class="id-type-content" style="display: none; padding: 20px; background: #fff; border: 1px solid #e0e7ff; border-top: none; border-radius: 0 0 8px 8px;">
                                                <!-- 搜索输入框 -->
                                                <div style="margin-bottom: 20px; position: relative;">
                                                    <input type="text" placeholder="搜索${typeConfig.displayName}ID或名称..." 
                                                           class="search-input" 
                                                           data-type="${type}" 
                                                           style="width: 100%; padding: 10px 40px 10px 15px; border: 1px solid #ced4da; border-radius: 25px; font-size: 14px; outline: none; transition: all 0.3s ease;">
                                                    <div class="search-icon" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #6c757d;">🔍</div>
                                                </div>
                                                
                                                <!-- 搜索结果区域 -->
                                                <div class="search-results" data-type="${type}">
                                                    ${idTypeContent()}
                                                </div>
                                                
                                                <!-- 空状态提示 -->
                                                <div class="search-empty" data-type="${type}" style="display: none; text-align: center; padding: 40px; color: #6c757d;">
                                                    <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                                                    <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">未找到匹配项</div>
                                                    <div style="font-size: 14px;">请尝试使用其他关键词进行搜索</div>
                                                </div>
                                                
                                                <!-- 加载状态提示 -->
                                                <div class="search-loading" data-type="${type}" style="display: none; text-align: center; padding: 40px; color: #6c757d;">
                                                    <div style="font-size: 2rem; margin-bottom: 15px; animation: spin 1s linear infinite;">🔄</div>
                                                    <div style="font-size: 14px;">搜索中...</div>
                                                </div>
                                            </div>
                                        </div>
                                        `;
                                    }).filter(Boolean).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // 添加模组展开/折叠功能
        setTimeout(() => {
            const modHeaders = document.querySelectorAll('.mod-header');
            modHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    const icon = header.querySelector('.mod-toggle-icon');
                    
                    if (content.style.display === 'block') {
                        content.style.display = 'none';
                        icon.textContent = '▼';
                    } else {
                        content.style.display = 'block';
                        icon.textContent = '▲';
                    }
                });
            });
            
            // 添加ID类型详情展开/折叠功能
            const idTypeHeaders = document.querySelectorAll('.id-type-header');
            idTypeHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    const toggleIcon = header.querySelector('.id-type-toggle');
                    
                    if (content.style.display === 'block') {
                        content.style.display = 'none';
                        toggleIcon.textContent = '▶';
                        toggleIcon.style.transform = 'rotate(0deg)';
                    } else {
                        content.style.display = 'block';
                        toggleIcon.textContent = '▼';
                        toggleIcon.style.transform = 'rotate(90deg)';
                        
                        // 重新初始化虚拟滚动功能，确保分页按钮事件正确绑定
                        setTimeout(() => {
                            this.initVirtualScroll();
                        }, 50);
                    }
                });
            });
            
            // 初始化搜索功能，确保DOM元素完全加载
            setTimeout(() => {
                this.initSearchFunctionality();
                this.initVirtualScroll();
            }, 100);
        }, 0);
    }
    
    /**
     * 根据rule属性和文本内容进行ID检索和替换
     * @param {string} text 原始文本
     * @param {string} rule rule属性值
     * @returns {string} 替换后的文本
     */
    replaceIdWithName(text, rule) {
        // 检查rule是否为*Id类型
        if (rule && rule.endsWith('Id')) {
            // 检查idDatabase是否可用
            if (!window.idDatabase || !window.idDatabase.initialized) {
                return text;
            }
            
            // 提取类型名称（去掉Id后缀）
            const typeName = rule.replace('Id', '');
            // 转换为snake_case格式，与idDatabase中的类型名称一致
            const snakeCaseTypeName = typeName.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
            
            // 检查该类型是否存在于数据库中
            if (!window.idDatabase.idTypes || !window.idDatabase.idTypes[snakeCaseTypeName]) {
                return text;
            }
            
            // 处理不同格式的文本
            if (typeof text === 'string') {
                // 情况1: 纯数字文本
                if (/^\d+$/.test(text)) {
                    const id = parseInt(text);
                    const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                    return name || text;
                }
                
                // 情况2: [x]
                if (/^\[(\d+)\]$/.test(text)) {
                    const id = parseInt(text.match(/^\[(\d+)\]$/)[1]);
                    const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                    return name || text;
                }
                
                // 情况3: [x,y,……]
                if (/^\[(\d+(,\s*\d+)*)\]$/.test(text)) {
                    const ids = text.match(/^\[(\d+(,\s*\d+)*)\]$/)[1].split(',').map(id => parseInt(id.trim()));
                    const names = ids.map(id => {
                        const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                        return name || id;
                    });
                    return names.join(', ');
                }
                
                // 情况4: "x"
                if (/^"(\d+)"$/.test(text)) {
                    const id = parseInt(text.match(/^"(\d+)"$/)[1]);
                    const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                    return name || text;
                }
                
                // 情况5: ["x"]
                if (/^\["(\d+)"\]$/.test(text)) {
                    const id = parseInt(text.match(/^\["(\d+)"\]$/)[1]);
                    const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                    return name || text;
                }
                
                // 情况6: ["x","y",……]
                if (/^\[("\d+"(,\s*"\d+")*)\]$/.test(text)) {
                    const ids = text.match(/^\[("\d+"(,\s*"\d+")*)\]$/)[1].split(',').map(id => parseInt(id.trim().replace(/"/g, '')));
                    const names = ids.map(id => {
                        const name = window.idDatabase.getNameById(snakeCaseTypeName, id);
                        return name || id;
                    });
                    return names.join(', ');
                }
            } else if (typeof text === 'number') {
                // 纯数字情况
                const name = window.idDatabase.getNameById(snakeCaseTypeName, text);
                return name || text;
            }
            
            return text;
        } 
        // 检查rule是否为*Rules类型
        else if (rule && rule.endsWith('Rules')) {
            // 尝试从缓存中获取规则文件
            const rulesData = this.rulesCache[rule];
            if (rulesData) {
                return this.processRulesSync(text, rulesData);
            }
            
            // 如果缓存中没有，返回原始文本
            // 规则文件会在后台预加载，下次渲染时会使用缓存
            return text;
        }
        // 检查rule是否为*Replace类型
        else if (rule && rule.endsWith('Replace')) {
            // 直接调用processReplaceSync，传入null作为rulesData
            // processReplaceValues会从ruleReplace文件中获取规则配置
            return this.processReplaceSync(text, null, rule);
        }
        
        return text;
    }
    
    /**
     * 检查rule是否为*Replace类型
     * @param {string} rule rule属性值
     * @returns {boolean} 是否为*Replace类型
     */
    isReplaceRule(rule) {
        return rule && rule.endsWith('Replace');
    }
    
    /**
     * 同步处理*Replace类型的文本替换
     * @param {string|Array} text 原始文本
     * @param {Object} rulesData 规则数据
     * @param {string} ruleName 规则名称
     * @returns {string} 替换后的文本
     */
    processReplaceSync(text, rulesData, ruleName) {
        // 处理不同格式的文本
        if (typeof text === 'string') {
            // 情况1: [[x1,y1],[x2,y2],……] - 多个数组
            if (/^\[\[((-?\d+)(,\s*-?\d+)*)\](\s*,\s*\[((-?\d+)(,\s*-?\d+)*)\])*\]$/.test(text)) {
                // 提取所有内部数组
                const arrayMatches = text.match(/\[((-?\d+)(,\s*-?\d+)*)\]/g);
                if (arrayMatches) {
                    const replacedArrays = arrayMatches.map(arrayStr => {
                        const match = arrayStr.match(/\[((-?\d+)(,\s*-?\d+)*)\]/);
                        if (match) {
                            const values = match[1].split(',').map(v => parseFloat(v.trim()));
                            return this.processReplaceValues(values, rulesData, ruleName);
                        }
                        return arrayStr;
                    });
                    return replacedArrays.join('，');
                }
            }
            // 情况2: [[x,y]] - 单个数组被双层[]包含
            else if (/^\[\[((-?\d+)(,\s*-?\d+)*)\]\]$/.test(text)) {
                const match = text.match(/^\[\[((-?\d+)(,\s*-?\d+)*)\]\]$/);
                if (match) {
                    const values = match[1].split(',').map(v => parseFloat(v.trim()));
                    const replacedText = this.processReplaceValues(values, rulesData, ruleName);
                    return replacedText;
                }
            }
            // 情况3: [x,y] - 普通数组
            else if (/^\[((-?\d+)(,\s*-?\d+)*)\]$/.test(text)) {
                const match = text.match(/^\[((-?\d+)(,\s*-?\d+)*)\]$/);
                if (match) {
                    const values = match[1].split(',').map(v => parseFloat(v.trim()));
                    const replacedText = this.processReplaceValues(values, rulesData, ruleName);
                    return replacedText;
                }
            }
        }
        
        return text;
    }
    
    /**
     * 处理替换规则值数组，根据规则文件生成替换文本
     * @param {Array<number>} values 值数组
     * @param {Object} rulesData 规则数据
     * @param {string} ruleName 规则名称
     * @returns {string} 替换后的文本
     */
    processReplaceValues(values, rulesData, ruleName) {
        if (!values || values.length === 0) {
            return values.toString();
        }
        
        // 获取规则配置，优先从ruleReplace文件中获取
        let ruleConfig = null;
        if (this.rulesCache['ruleReplace'] && this.rulesCache['ruleReplace'][ruleName]) {
            ruleConfig = this.rulesCache['ruleReplace'][ruleName];
        } else if (rulesData && rulesData[ruleName]) {
            ruleConfig = rulesData[ruleName];
        }
        
        if (!ruleConfig || !ruleConfig.rule || !ruleConfig.desc) {
            return values.toString();
        }
        
        const ruleArray = ruleConfig.rule;
        const descTemplate = ruleConfig.desc;
        
        if (!ruleArray || ruleArray.length === 0) {
            return values.toString();
        }
        
        // 生成替换文本
        let desc = descTemplate;
        
        // 替换规则中的占位符
        ruleArray.forEach((ruleKey, index) => {
            if (index < values.length) {
                const value = values[index];
                
                // 如果是ID类型的规则，尝试从数据库中获取名称
                if (ruleKey.endsWith('Id')) {
                    const name = this.getNameByIdFromRule(ruleKey, value);
                    if (name) {
                        desc = desc.replace(`{${ruleKey}}`, name);
                    }
                } else {
                    // 直接替换占位符
                    desc = desc.replace(`{${ruleKey}}`, value);
                }
            }
        });
        
        return desc;
    }
    
    /**
     * 同步处理*Rules类型的文本替换
     * @param {string|Array} text 原始文本
     * @param {Object} rulesData 规则数据
     * @returns {string} 替换后的文本
     */
    processRulesSync(text, rulesData) {
        // 处理不同格式的文本
        if (typeof text === 'string') {
            // 情况1: [[a,b,c,……]] - 在普通规则数组基础上增加一层[]
            if (/^\[\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]\]$/.test(text)) {
                const match = text.match(/^\[\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]\]$/);
                if (match) {
                    const values = match[1].split(',').map(v => parseFloat(v.trim()));
                    const replacedText = this.processRuleValues(values, rulesData);
                    return replacedText;
                }
            }
            
            // 情况2: [[a,b,c,……],[a,b,c,……],……] - 多个普通规则数组用逗号隔开，再整体加上一层[]
            else if (/^\[\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\](\s*,\s*\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\])*\]$/.test(text)) {
                // 提取所有普通规则数组
                const arrayMatches = text.match(/\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]/g);
                if (arrayMatches) {
                    const replacedArrays = arrayMatches.map(arrayStr => {
                        const match = arrayStr.match(/\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]/);
                        if (match) {
                            const values = match[1].split(',').map(v => parseFloat(v.trim()));
                            const replacedText = this.processRuleValues(values, rulesData);
                            return replacedText;
                        }
                        return arrayStr;
                    });
                    return replacedArrays.join('，');
                }
            }
            
            // 情况3: [a,b,c,……] - 普通规则数组
            else if (/^\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]$/.test(text)) {
                const match = text.match(/^\[((-?\d+(\.\d+)?)(,\s*-?\d+(\.\d+)?)*)\]$/);
                if (match) {
                    const values = match[1].split(',').map(v => parseFloat(v.trim()));
                    const replacedText = this.processRuleValues(values, rulesData);
                    return replacedText;
                }
            }
        }
        
        return text;
    }
    
    /**
     * 处理规则值数组，根据规则文件生成替换文本
     * @param {Array<number>} values 值数组
     * @param {Object} rulesData 规则数据
     * @returns {string} 替换后的文本
     */
    processRuleValues(values, rulesData) {
        if (!values || values.length === 0) {
            return values.toString();
        }
        
        // 获取第一个数字作为规则ID
        const ruleId = values[0].toString();
        const ruleConfig = rulesData[ruleId];
        
        if (!ruleConfig || !ruleConfig.type) {
            return values.toString();
        }
        
        // 遍历所有可能的类型配置，找到匹配的规则
        for (const typeKey in ruleConfig.type) {
            const typeConfig = ruleConfig.type[typeKey];
            if (typeConfig.rule && typeConfig.desc) {
                // 检查规则是否匹配
                const ruleArray = typeConfig.rule;
                if (ruleArray.length <= values.length) {
                    // 检查前几个数字是否匹配
                    const match = ruleArray.slice(0, 2).every((ruleValue, index) => {
                        return ruleValue === values[index];
                    });
                    
                    if (match) {
                        // 生成替换文本
                        let desc = typeConfig.desc;
                        
                        // 替换{direction}（如果有）
                        if (desc.includes('{direction}')) {
                            // 找到value字段的位置
                            const valueIndex = ruleArray.indexOf('value');
                            if (valueIndex !== -1 && valueIndex < values.length) {
                                const value = values[valueIndex];
                                desc = desc.replace('{direction}', value >= 0 ? '+' : '-');
                            }
                        }
                        
                        // 替换其他字段
                        ruleArray.forEach((ruleValue, index) => {
                            if (typeof ruleValue === 'string' && index < values.length) {
                                const value = values[index];
                                
                                // 处理ID类型的字段（以Id结尾）
                                if (ruleValue.endsWith('Id')) {
                                    // 尝试从数据库中获取名称
                                    const name = this.getNameByIdFromRule(ruleValue, value);
                                    if (name) {
                                        desc = desc.replace(`{${ruleValue}}`, name);
                                    }
                                }
                                // 处理value相关字段（value, value1, value2等）
                                else if (ruleValue.startsWith('value')) {
                                    // 直接替换{valueX}占位符
                                    desc = desc.replace(`{${ruleValue}}`, value);
                                }
                                // 处理evtId相关字段（evtId1, evtId2等）
                                else if (ruleValue.startsWith('evtId')) {
                                    // 尝试从数据库中获取事件名称
                                    const name = this.getNameByIdFromRule('EvtId', value);
                                    if (name) {
                                        desc = desc.replace(`{${ruleValue}}`, name);
                                    }
                                }
                            }
                        });
                        
                        return desc;
                    }
                }
            }
        }
        
        return values.toString();
    }
    
    /**
     * 根据规则中的ID类型和ID值获取名称
     * @param {string} idType ID类型
     * @param {number} idValue ID值
     * @returns {string} 名称
     */
    getNameByIdFromRule(idType, idValue) {
        // 检查idDatabase是否可用
        if (!window.idDatabase || !window.idDatabase.initialized) {
            return null;
        }
        
        // 提取类型名称（去掉Id后缀）
        const typeName = idType.replace('Id', '');
        // 转换为snake_case格式，与idDatabase中的类型名称一致
        const snakeCaseTypeName = typeName.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
        
        // 检查该类型是否存在于数据库中
        if (!window.idDatabase.idTypes || !window.idDatabase.idTypes[snakeCaseTypeName]) {
            return null;
        }
        
        // 从数据库中获取名称
        return window.idDatabase.getNameById(snakeCaseTypeName, idValue);
    }
    
    /**
     * 初始化虚拟滚动功能
     */
    initVirtualScroll() {
        // 分页按钮点击事件处理函数
        const handlePageClick = (e) => {
            const button = e.target.closest('.page-btn');
            if (!button) return;
            
            const action = button.dataset.action;
            const container = button.closest('.virtual-scroll-container');
            const type = container.dataset.type;
            const totalItems = parseInt(container.dataset.total);
            
            // 从配置中重新读取每页数量，确保使用最新的配置值
            // 首先检查容器中实际渲染的布局类型
            const isVerticalLayout = container.querySelector('.vertical-table-container') !== null;
            const isHorizontalLayout = container.querySelector('table.horizontal-table') !== null;
            
            let pageSize;
            if (isVerticalLayout) {
                // 竖列式布局
                pageSize = configManager.get('verticalPageSize') || 50;
                console.log('[VirtualScroll] 竖列式布局，pageSize:', pageSize);
            } else if (isHorizontalLayout) {
                // 横列式布局
                pageSize = configManager.get('horizontalPageSize') || 50;
                console.log('[VirtualScroll] 横列式布局，pageSize:', pageSize);
            } else {
                // 默认值
                pageSize = 50;
                console.log('[VirtualScroll] 默认布局，pageSize:', pageSize);
            }
            
            // 更新data-page-size属性，确保下次使用最新值
            container.dataset.pageSize = pageSize;
            
            let currentPage = parseInt(container.dataset.currentPage) || 1;
            console.log('[VirtualScroll] 当前页:', currentPage, '总项数:', totalItems, 'pageSize:', pageSize);
            
            // 计算总页数
            const totalPages = Math.ceil(totalItems / pageSize);
            console.log('[VirtualScroll] 总页数:', totalPages);
            
            // 处理上一页和下一页
            if (action === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (action === 'next' && currentPage < totalPages) {
                currentPage++;
            }
            
            // 更新当前页码
            container.dataset.currentPage = currentPage;
            container.querySelector('.current-page').textContent = currentPage;
            
            // 计算数据范围
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalItems);
            
            // 显示加载提示
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.style.cssText = 'text-align: center; padding: 10px; color: #666; font-size: 0.9rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; z-index: 10;';
            loadingIndicator.textContent = '加载中...';
            container.appendChild(loadingIndicator);
            
            // 模拟加载延迟
            setTimeout(() => {
                try {
                    // 移除加载提示
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    
                    // 从data-items属性中获取完整的数据源
                    const itemsData = this.unescapeJSONFromHTML(container.dataset.items);
                    
                    // 计算需要加载的数据范围
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = Math.min(startIndex + pageSize, totalItems);
                    const pageItems = itemsData.slice(startIndex, endIndex);
                    
                    console.log(`加载第 ${currentPage} 页数据: ${type}类型，从${startIndex}到${endIndex}`);
                    
                    // 获取容器中的内容区域
                    let contentContainer;
                    if (container.querySelector('.vertical-table-container')) {
                        contentContainer = container.querySelector('.vertical-table-container');
                    } else if (container.querySelector('table.horizontal-table')) {
                        contentContainer = container.querySelector('table.horizontal-table tbody');
                    }
                    
                    if (contentContainer) {
                        // 清空当前容器内容
                        contentContainer.innerHTML = '';
                        
                        // 检查当前是哪种布局
                        if (contentContainer.classList.contains('vertical-table-container')) {
                            // 竖列式布局
                            const tableLayout = configManager.get().tableLayout || 'vertical';
                            const idTypeKeyDef = configManager.idTypeKeys && configManager.idTypeKeys[`${type.charAt(0).toUpperCase() + type.slice(1)}Key`];
                            const sortedKeys = [];
                            
                            if (idTypeKeyDef) {
                                // 严格按照idTypeKeys.json中定义的key和顺序，只渲染定义的key
                                Object.keys(idTypeKeyDef).forEach(key => {
                                    sortedKeys.push(key);
                                });
                            } else {
                                // 如果没有定义，则按照原始数据的属性顺序显示所有属性
                                // 收集所有唯一的key（用于验证）
                                const allKeys = new Set();
                                itemsData.forEach(item => {
                                    if (typeof item === 'object' && item !== null) {
                                        Object.keys(item).forEach(key => allKeys.add(key));
                                    }
                                });
                                
                                const keysArray = Array.from(allKeys);
                                sortedKeys.push(...keysArray);
                            }
                            
                            // 渲染新页的数据
                            contentContainer.innerHTML = pageItems.map((item, itemIndex) => {
                                const isDuplicate = false;
                                
                                return `
                                <div class="vertical-table-card ${isDuplicate ? 'duplicate' : ''}" data-index="${startIndex + itemIndex}">
                                    <div class="card-header">
                                        <div class="card-title">
                                            ${sortedKeys.length > 0 ? (() => {
                                                for (const key of sortedKeys) {
                                                    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                                                        return item[key];
                                                    }
                                                }
                                                return '-';
                                            })() : '-'}
                                        </div>
                                        <div class="card-status">
                                            <span class="status-badge ${isDuplicate ? 'duplicate' : 'unique'}">
                                                ${isDuplicate ? '重复' : '唯一'}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="vertical-table-rows">
                                            ${sortedKeys.map((key, index) => {
                                                let value = item[key];
                                                const originalValue = value;
                                                let rule = null;
                                                
                                                if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                    rule = idTypeKeyDef[key].rule;
                                                }
                                                
                                                // 应用ID替换功能
                                                let displayValue = value;
                                                if (rule) {
                                                    if (typeof value === 'object' && value !== null) {
                                                        try {
                                                            const jsonString = JSON.stringify(value);
                                                            displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                        } catch (e) {
                                                            // 忽略错误，使用原始值
                                                        }
                                                    } else {
                                                        displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                                    }
                                                }
                                                
                                                // 获取属性的中文名称
                                                let attributeName = key;
                                                if (idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].name) {
                                                    attributeName = idTypeKeyDef[key].name;
                                                } else {
                                                    attributeName = configManager.getAttributeCN(type, key);
                                                }
                                                
                                                return `
                                                <div class="vertical-table-row">
                                                    <div class="row-label" data-desc="${idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].desc ? idTypeKeyDef[key].desc : ''}">${attributeName}:</div>
                                                    <div class="row-value" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                                        ${displayValue === undefined || displayValue === null ? '-' : (typeof displayValue === 'object' ? JSON.stringify(displayValue).replace(/^"|"$/g, '') : displayValue)}
                                                    </div>
                                                </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('');
                        } else if (contentContainer.tagName === 'TBODY') {
                            // 横列式布局
                            const tableLayout = configManager.get().tableLayout || 'horizontal';
                            const idTypeKeyDef = configManager.idTypeKeys && configManager.idTypeKeys[`${type.charAt(0).toUpperCase() + type.slice(1)}Key`];
                            const sortedKeys = [];
                            
                            if (idTypeKeyDef) {
                                // 严格按照idTypeKeys.json中定义的key和顺序，只渲染定义的key
                                Object.keys(idTypeKeyDef).forEach(key => {
                                    sortedKeys.push(key);
                                });
                            } else {
                                // 如果没有定义，则按照原始数据的属性顺序显示所有属性
                                // 收集所有唯一的key（用于验证）
                                const allKeys = new Set();
                                itemsData.forEach(item => {
                                    if (typeof item === 'object' && item !== null) {
                                        Object.keys(item).forEach(key => allKeys.add(key));
                                    }
                                });
                                
                                const keysArray = Array.from(allKeys);
                                sortedKeys.push(...keysArray);
                            }
                            
                            // 渲染新页的数据
                            contentContainer.innerHTML = pageItems.map((item, itemIndex) => {
                                const isDuplicate = false;
                                
                                return `
                                <tr style="${isDuplicate ? 'background: var(--danger-light);' : ''};" data-index="${startIndex + itemIndex}">
                                    ${sortedKeys.map(key => {
                                        let value = item[key];
                                        const originalValue = value;
                                        let rule = null;
                                        
                                        if (idTypeKeyDef && idTypeKeyDef[key]) {
                                            rule = idTypeKeyDef[key].rule;
                                        }
                                        
                                        // 应用ID替换功能
                                        let displayValue = value;
                                        if (rule) {
                                            if (typeof value === 'object' && value !== null) {
                                                try {
                                                    const jsonString = JSON.stringify(value);
                                                    displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                } catch (e) {
                                                    // 忽略错误，使用原始值
                                                }
                                            } else {
                                                displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                            }
                                        }
                                        
                                        // 格式化显示值
                                        let formattedValue;
                                        if (displayValue === undefined || displayValue === null) {
                                            formattedValue = '-';
                                        } else if (typeof displayValue === 'object') {
                                            // 如果是对象或数组，格式化为JSON字符串
                                            formattedValue = JSON.stringify(displayValue);
                                        } else {
                                            formattedValue = displayValue;
                                        }
                                        
                                        return `
                                        <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                            ${formattedValue}
                                        </td>
                                        `;
                                    }).join('')}
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                        <span class="status-badge ${isDuplicate ? 'duplicate' : 'unique'}">
                                            ${isDuplicate ? '重复' : '唯一'}
                                        </span>
                                    </td>
                                </tr>
                                `;
                            }).join('');
                        }
                    }
                    
                } catch (error) {
                    console.error('加载数据时出错:', error);
                    // 确保加载指示器被移除
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                }
            }, 500);
        };
        
        // 为所有分页按钮添加点击事件监听
        const containers = document.querySelectorAll('.virtual-scroll-container');
        containers.forEach(container => {
            // 移除滚动事件监听（如果有）
            container.removeEventListener('scroll', container._scrollHandler);
            
            // 添加分页按钮点击事件监听
            const pageButtons = container.querySelectorAll('.page-btn');
            pageButtons.forEach(button => {
                // 检查是否已经绑定过事件
                if (button._pageClickHandler) {
                    // 已经绑定过，不再重复绑定
                    return;
                }
                // 添加新的事件监听器
                button.addEventListener('click', handlePageClick);
                // 保存事件处理函数引用，以便后续移除
                button._pageClickHandler = handlePageClick;
            });
        });
    }
    
    /**
     * 初始化搜索功能
     */
    initSearchFunctionality() {
        // 防抖函数
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        
        // 搜索函数
        const performSearch = (inputElement) => {
            const searchTerm = inputElement.value.trim().toLowerCase();
            const type = inputElement.dataset.type;
            const parentContent = inputElement.closest('.id-type-content');
            const resultsContainer = parentContent.querySelector('.search-results');
            const emptyState = parentContent.querySelector('.search-empty');
            const loadingState = parentContent.querySelector('.search-loading');
            
            // 显示加载状态
            loadingState.style.display = 'block';
            resultsContainer.style.display = 'none';
            emptyState.style.display = 'none';
            
            // 模拟搜索延迟（实际搜索是同步的，这里只是为了显示加载状态）
            setTimeout(() => {
                // 隐藏加载状态
                loadingState.style.display = 'none';
                
                // 获取虚拟滚动容器
                const virtualContainer = resultsContainer.querySelector('.virtual-scroll-container');
                
                if (searchTerm === '') {
                    // 搜索框为空，恢复虚拟滚动状态
                    // 获取容器中的内容区域
                    let contentContainer;
                    if (virtualContainer.querySelector('.vertical-table-container')) {
                        contentContainer = virtualContainer.querySelector('.vertical-table-container');
                    } else if (virtualContainer.querySelector('table.horizontal-table')) {
                        contentContainer = virtualContainer.querySelector('table.horizontal-table tbody');
                    }
                    
                    if (contentContainer) {
                        // 清空搜索结果容器，恢复原始内容
                        contentContainer.innerHTML = '';
                        
                        // 重新渲染第一页数据
                        // 从配置中读取每页数量
                        let itemsPerPage;
                        if (virtualContainer.querySelector('.vertical-table-container')) {
                            itemsPerPage = configManager.get('verticalPageSize') || 50;
                        } else if (virtualContainer.querySelector('table.horizontal-table')) {
                            itemsPerPage = configManager.get('horizontalPageSize') || 50;
                        } else {
                            itemsPerPage = 50;
                        }
                        
                        const itemsData = this.unescapeJSONFromHTML(virtualContainer.dataset.items);
                        const pageItems = itemsData.slice(0, itemsPerPage);
                        
                        // 生成sortedKeys
                        const tableLayout = configManager.get().tableLayout || 'vertical';
                        const idTypeKeyDef = configManager.idTypeKeys && configManager.idTypeKeys[`${type.charAt(0).toUpperCase() + type.slice(1)}Key`];
                        const sortedKeys = [];
                        
                        if (idTypeKeyDef) {
                            // 严格按照idTypeKeys.json中定义的key和顺序，只渲染定义的key
                            Object.keys(idTypeKeyDef).forEach(key => {
                                sortedKeys.push(key);
                            });
                        } else {
                            // 如果没有定义，则按照原始数据的属性顺序显示所有属性
                            // 收集所有唯一的key（用于验证）
                            const allKeys = new Set();
                            itemsData.forEach(item => {
                                if (typeof item === 'object' && item !== null) {
                                    Object.keys(item).forEach(key => allKeys.add(key));
                                }
                            });
                            
                            const keysArray = Array.from(allKeys);
                            sortedKeys.push(...keysArray);
                        }
                        
                        // 重新渲染数据
                        if (contentContainer.classList.contains('vertical-table-container')) {
                            // 竖列式布局
                            contentContainer.innerHTML = pageItems.map((item, itemIndex) => {
                                return `
                                <div class="vertical-table-card" data-index="${itemIndex}">
                                    <div class="card-header">
                                        <div class="card-title">
                                            ${sortedKeys.length > 0 ? (() => {
                                                for (const key of sortedKeys) {
                                                    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                                                        return item[key];
                                                    }
                                                }
                                                return '-';
                                            })() : '-'}
                                        </div>
                                        <div class="card-status">
                                            <span class="status-badge unique">唯一</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="vertical-table-rows">
                                            ${sortedKeys.map((key, index) => {
                                                let value = item[key];
                                                const originalValue = value;
                                                let rule = null;
                                                
                                                if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                    rule = idTypeKeyDef[key].rule;
                                                }
                                                
                                                let displayValue = value;
                                                if (rule) {
                                                    if (typeof value === 'object' && value !== null) {
                                                        try {
                                                            const jsonString = JSON.stringify(value);
                                                            displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                        } catch (e) {
                                                        }
                                                    } else {
                                                        displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                                    }
                                                }
                                                
                                                let attributeName = key;
                                                if (idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].name) {
                                                    attributeName = idTypeKeyDef[key].name;
                                                } else {
                                                    attributeName = configManager.getAttributeCN(type, key);
                                                }
                                                
                                                let formattedValue;
                                                if (displayValue === undefined || displayValue === null) {
                                                    formattedValue = '-';
                                                } else if (typeof displayValue === 'object') {
                                                    formattedValue = JSON.stringify(displayValue, null, 2);
                                                } else {
                                                    formattedValue = displayValue;
                                                }
                                                
                                                return `
                                                <div class="vertical-table-row">
                                                    <div class="row-label" data-desc="${idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].desc ? idTypeKeyDef[key].desc : ''}">${attributeName}:</div>
                                                    <div class="row-value" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                                        <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: inherit;">${formattedValue}</pre>
                                                    </div>
                                                </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('');
                        } else if (contentContainer.tagName === 'TBODY') {
                            // 横列式布局
                            contentContainer.innerHTML = pageItems.map((item, itemIndex) => {
                                return `
                                <tr style="" data-index="${itemIndex}">
                                    ${sortedKeys.map(key => {
                                        let value = item[key];
                                        const originalValue = value;
                                        let rule = null;
                                        
                                        if (idTypeKeyDef && idTypeKeyDef[key]) {
                                            rule = idTypeKeyDef[key].rule;
                                        }
                                        
                                        let displayValue = value;
                                        if (rule) {
                                            if (typeof value === 'object' && value !== null) {
                                                try {
                                                    const jsonString = JSON.stringify(value);
                                                    displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                } catch (e) {
                                                }
                                            } else {
                                                displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                            }
                                        }
                                        
                                        let formattedValue;
                                        if (displayValue === undefined || displayValue === null) {
                                            formattedValue = '-';
                                        } else if (typeof displayValue === 'object') {
                                            formattedValue = JSON.stringify(displayValue);
                                        } else {
                                            formattedValue = displayValue;
                                        }
                                        
                                        return `
                                        <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                            ${formattedValue}
                                        </td>
                                        `;
                                    }).join('')}
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                        <span class="status-badge unique">唯一</span>
                                    </td>
                                </tr>
                                `;
                            }).join('');
                        }
                        
                        // 恢复分页控件
                        const paginationControls = virtualContainer.querySelector('.pagination-controls');
                        if (paginationControls) {
                            paginationControls.style.display = 'flex';
                        }
                        
                        // 重置当前页码
                        virtualContainer.dataset.currentPage = 1;
                        const currentPageElement = virtualContainer.querySelector('.current-page');
                        if (currentPageElement) {
                            currentPageElement.textContent = 1;
                        }
                    }
                    
                    resultsContainer.style.display = 'block';
                    emptyState.style.display = 'none';
                } else {
                    // 从data-items属性中获取所有项的原始数据
                    const itemsData = this.unescapeJSONFromHTML(virtualContainer.dataset.items);
                    
                    // 基于原始数据进行搜索
                    const matchingItems = itemsData.filter(item => {
                        // 将item对象转换为字符串，然后搜索
                        const itemString = JSON.stringify(item).toLowerCase();
                        return itemString.includes(searchTerm);
                    });
                    
                    // 检查当前是哪种布局
                    const tableLayout = configManager.get().tableLayout || 'vertical';
                    const idTypeKeyDef = configManager.idTypeKeys && configManager.idTypeKeys[`${type.charAt(0).toUpperCase() + type.slice(1)}Key`];
                    const sortedKeys = [];
                    
                    if (idTypeKeyDef) {
                        // 严格按照idTypeKeys.json中定义的key和顺序，只渲染定义的key
                        Object.keys(idTypeKeyDef).forEach(key => {
                            sortedKeys.push(key);
                        });
                    } else {
                        // 如果没有定义，则按照原始数据的属性顺序显示所有属性
                        // 收集所有唯一的key（用于验证）
                        const allKeys = new Set();
                        itemsData.forEach(item => {
                            if (typeof item === 'object' && item !== null) {
                                Object.keys(item).forEach(key => allKeys.add(key));
                            }
                        });
                        
                        const keysArray = Array.from(allKeys);
                        sortedKeys.push(...keysArray);
                    }
                    
                    // 获取容器中的内容区域
                    let contentContainer;
                    if (virtualContainer.querySelector('.vertical-table-container')) {
                        contentContainer = virtualContainer.querySelector('.vertical-table-container');
                    } else if (virtualContainer.querySelector('table.horizontal-table')) {
                        contentContainer = virtualContainer.querySelector('table.horizontal-table tbody');
                    }
                    
                    if (contentContainer) {
                        // 清空当前容器内容
                        contentContainer.innerHTML = '';
                        
                        // 检查当前是哪种布局
                        if (contentContainer.classList.contains('vertical-table-container')) {
                            // 竖列式布局
                            contentContainer.innerHTML = matchingItems.map((item, itemIndex) => {
                                return `
                                <div class="vertical-table-card" data-index="${itemIndex}">
                                    <div class="card-header">
                                        <div class="card-title">
                                            ${sortedKeys.length > 0 ? (() => {
                                                for (const key of sortedKeys) {
                                                    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                                                        return item[key];
                                                    }
                                                }
                                                return '-';
                                            })() : '-'}
                                        </div>
                                        <div class="card-status">
                                            <span class="status-badge unique">唯一</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="vertical-table-rows">
                                            ${sortedKeys.map((key, index) => {
                                                let value = item[key];
                                                  
                                                // 保存原始值用于鼠标悬浮显示
                                                const originalValue = value;
                                                  
                                                // 获取当前key对应的rule属性
                                                let rule = null;
                                                if (idTypeKeyDef && idTypeKeyDef[key]) {
                                                    rule = idTypeKeyDef[key].rule;
                                                }
                                                  
                                                // 应用ID替换功能
                                                let displayValue = value;
                                                if (rule) {
                                                    if (typeof value === 'object' && value !== null) {
                                                        try {
                                                            const jsonString = JSON.stringify(value);
                                                            displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                        } catch (e) {
                                                            // 忽略错误，使用原始值
                                                        }
                                                    } else {
                                                        displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                                    }
                                                }
                                                  
                                                // 获取属性的中文名称
                                                let attributeName = key;
                                                if (idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].name) {
                                                    attributeName = idTypeKeyDef[key].name;
                                                } else {
                                                    attributeName = configManager.getAttributeCN(type, key);
                                                }
                                                  
                                                return `
                                                <div class="vertical-table-row">
                                                    <div class="row-label" data-desc="${idTypeKeyDef && idTypeKeyDef[key] && idTypeKeyDef[key].desc ? idTypeKeyDef[key].desc : ''}">${attributeName}:</div>
                                                    <div class="row-value" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                                        ${displayValue === undefined || displayValue === null ? '-' : (typeof displayValue === 'object' ? JSON.stringify(displayValue).replace(/^"|"$/g, '') : displayValue)}
                                                    </div>
                                                </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('');
                        } else if (contentContainer.tagName === 'TBODY') {
                            // 横列式布局
                            contentContainer.innerHTML = matchingItems.map((item, itemIndex) => {
                                return `
                                <tr data-index="${itemIndex}">
                                    ${sortedKeys.map(key => {
                                        let value = item[key];
                                        const originalValue = value;
                                        let rule = null;
                                        
                                        if (idTypeKeyDef && idTypeKeyDef[key]) {
                                            rule = idTypeKeyDef[key].rule;
                                        }
                                        
                                        // 应用ID替换功能
                                        let displayValue = value;
                                        if (rule) {
                                            if (typeof value === 'object' && value !== null) {
                                                try {
                                                    const jsonString = JSON.stringify(value);
                                                    displayValue = window.resultRenderer.replaceIdWithName(jsonString, rule);
                                                } catch (e) {
                                                    // 忽略错误，使用原始值
                                                }
                                            } else {
                                                displayValue = window.resultRenderer.replaceIdWithName(value, rule);
                                            }
                                        }
                                        
                                        return `
                                        <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-original="${originalValue !== undefined && originalValue !== null ? JSON.stringify(originalValue).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}" data-rule="${rule || ''}">
                                            ${displayValue === undefined || displayValue === null ? '-' : (typeof displayValue === 'object' ? JSON.stringify(displayValue).replace(/^"|"$/g, '') : displayValue)}
                                        </td>
                                        `;
                                    }).join('')}
                                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                        <span class="status-badge unique">唯一</span>
                                    </td>
                                </tr>
                                `;
                            }).join('');
                        }
                        
                        // 显示结果或空状态
                        resultsContainer.style.display = 'block';
                        emptyState.style.display = matchingItems.length > 0 ? 'none' : 'block';
                    }
                }
            }, 100); // 100ms延迟，模拟搜索过程
        };
        
        // 为所有搜索输入框添加事件监听
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            // 使用防抖处理输入事件
            const debouncedSearch = debounce(() => {
                performSearch(input);
            }, 300);
            
            // 输入事件
            input.addEventListener('input', debouncedSearch);
            
            // 键盘事件
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    performSearch(input);
                } else if (e.key === 'Escape') {
                    input.value = '';
                    performSearch(input);
                }
            });
        });
    }

    /**
     * 渲染事件详情表格
     * @param {Object} result - 分析结果
     * @param {HTMLElement} container - 容器元素
     */
    renderEventDetails(result, container) {
        const { modDetails } = result;
        
        // 事件详情竖列式卡片布局HTML
        const eventDetailsHTML = `
            <div class="vertical-table-container">
                ${Array.from(modDetails.entries()).map(([modName, modDetail]) => 
                    modDetail.events.map(event => {
                        // 检查事件ID是否重复
                        const isDuplicate = result.allEventIds && result.allEventIds.get(event.id)?.size > 1;
                        return `
                            <div class="vertical-table-card ${isDuplicate ? 'duplicate' : ''}">
                                <div class="card-header">
                                    <div class="card-title">
                                        ${event.title || event.id}
                                    </div>
                                    <div class="card-status">
                                        <span class="status-badge ${isDuplicate ? 'duplicate' : 'unique'}">
                                            ${isDuplicate ? '重复' : '唯一'}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="vertical-table-rows">
                                        <div class="vertical-table-row">
                                            <div class="row-label">模组名称:</div>
                                            <div class="row-value">${modName}</div>
                                        </div>
                                        <div class="vertical-table-row">
                                            <div class="row-label">事件ID:</div>
                                            <div class="row-value">${event.id}</div>
                                        </div>
                                        <div class="vertical-table-row">
                                            <div class="row-label">事件标题:</div>
                                            <div class="row-value">${event.title || '无'}</div>
                                        </div>
                                        ${Object.entries(event).filter(([key]) => !['id', 'title'].includes(key)).map(([key, value]) => `
                                        <div class="vertical-table-row">
                                            <div class="row-label">${configManager.getAttributeCN('event', key)}:</div>
                                            <div class="row-value" data-original="${JSON.stringify(value)}">
                                                ${typeof value === 'object' ? JSON.stringify(value).replace(/^"|"$/g, '') : value}
                                            </div>
                                        </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')
                ).join('')}
            </div>
        `;
        
        // 将事件详情添加到容器中
        container.innerHTML = eventDetailsHTML;
    }
    
    /**
     * 更新表格布局（热更新）
     */
    updateTableLayout() {
        if (this.currentResult) {
            this.renderSummary(this.currentResult);
        }
    }
    
    /**
     * 渲染数据可视化图表
     * @param {Object} result - 分析结果
     */
    renderCharts(result) {
        const { totalMods, idTypes } = result;
        
        // 计算所有ID类型的统计信息
        const typeStats = {};
        for (const type in idTypes) {
            const typeConfig = idTypes[type];
            const totalKey = `total${type.charAt(0).toUpperCase() + type.slice(1)}s`;
            const duplicateKey = `duplicate${type.charAt(0).toUpperCase() + type.slice(1)}Ids`;
            
            const total = result[totalKey] || 0;
            const duplicate = (result[duplicateKey] || []).length;
            
            typeStats[type] = {
                total,
                duplicate,
                config: typeConfig
            };
        }
        
        // 准备图表数据
        const labels = Object.values(typeStats).map(stats => stats.config.displayName);
        const totalData = Object.values(typeStats).map(stats => stats.total);
        const duplicateData = Object.values(typeStats).map(stats => stats.duplicate);
        
        // 图表颜色配置
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(23, 162, 184, 0.8)',
            'rgba(13, 110, 253, 0.8)',
            'rgba(220, 103, 69, 0.8)',
            'rgba(13, 150, 230, 0.8)',
            'rgba(103, 110, 253, 0.8)',
            'rgba(150, 103, 253, 0.8)',
            'rgba(253, 103, 200, 0.8)'
        ];
        
        // 渲染统计图表（柱状图）
        const statsChartCanvas = document.getElementById('statsChart');
        if (statsChartCanvas) {
            // 销毁现有图表
            if (this.statsChart) {
                this.statsChart.destroy();
            }
            
            this.statsChart = new Chart(statsChartCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'ID总数',
                        data: totalData,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('0.8', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '各类型ID统计',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '数量'
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
        
        // 渲染重复ID图表（饼图）
        const duplicateChartCanvas = document.getElementById('duplicateChart');
        if (duplicateChartCanvas) {
            // 只包含有重复ID的数据
            const filteredLabels = [];
            const filteredDuplicateData = [];
            const filteredColors = [];
            
            duplicateData.forEach((count, index) => {
                if (count > 0) {
                    filteredLabels.push(labels[index]);
                    filteredDuplicateData.push(count);
                    filteredColors.push(colors[index]);
                }
            });
            
            // 销毁现有图表
            if (this.duplicateChart) {
                this.duplicateChart.destroy();
            }
            
            this.duplicateChart = new Chart(duplicateChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: filteredLabels.length > 0 ? filteredLabels : ['无重复ID'],
                    datasets: [{
                        label: '重复ID数量',
                        data: filteredDuplicateData.length > 0 ? filteredDuplicateData : [1],
                        backgroundColor: filteredColors.length > 0 ? filteredColors : ['rgba(102, 126, 234, 0.8)'],
                        borderColor: filteredColors.length > 0 ? filteredColors.map(color => color.replace('0.8', '1')) : ['rgba(102, 126, 234, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '重复ID分布',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((sum, data) => sum + data, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }
}