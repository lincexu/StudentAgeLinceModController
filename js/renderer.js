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
        
        this.init();
    }

    init() {
        this.duplicateSection = document.getElementById('duplicate-section');
        this.duplicateList = document.getElementById('duplicate-list');
        this.summaryContent = document.getElementById('summary-content');
        this.resultStats = document.getElementById('result-stats');
        this.progressSection = document.getElementById('progress-section');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
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
                        const modEventIdsSet = result.modEventIds.get(modName);
                        const duplicateEventsInMod = Array.from(modEventIdsSet || []).filter(id => 
                            result.allEventIds.get(id).size > 1
                        );
                        
                        const modItemIdsSet = result.modItemIds.get(modName);
                        const duplicateItemsInMod = Array.from(modItemIdsSet || []).filter(id => 
                            result.allItemIds.get(id).size > 1
                        );
                        
                        const modBookIdsSet = result.modBookIds.get(modName);
                        const duplicateBooksInMod = Array.from(modBookIdsSet || []).filter(id => 
                            result.allBookIds.get(id).size > 1
                        );
                        
                        const modActionIdsSet = result.modActionIds.get(modName);
                        const duplicateActionsInMod = Array.from(modActionIdsSet || []).filter(id => 
                            result.allActionIds.get(id).size > 1
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
                                        
                                        // 收集所有唯一的key
                                        const allKeys = new Set();
                                        items.forEach(item => {
                                            if (typeof item === 'object' && item !== null) {
                                                Object.keys(item).forEach(key => allKeys.add(key));
                                            }
                                        });
                                        
                                        // 确保id和name（或title）在最前面，其余key按顺序排列
                                        const keysArray = Array.from(allKeys);
                                        const sortedKeys = [];
                                        
                                        // 1. 优先添加id（如果存在）
                                        if (keysArray.includes('id')) {
                                            sortedKeys.push('id');
                                        }
                                        
                                        // 2. 添加名称相关字段（只添加实际存在的一个）
                                        if (keysArray.includes('name')) {
                                            sortedKeys.push('name');
                                        } else if (keysArray.includes('title')) {
                                            sortedKeys.push('title');
                                        }
                                        
                                        // 3. 添加剩余的key（不包括已经添加的id和名称字段）
                                        keysArray.forEach(key => {
                                            if (key !== 'id' && key !== 'name' && key !== 'title' && !sortedKeys.includes(key)) {
                                                sortedKeys.push(key);
                                            }
                                        });
                                        
                                        // 获取当前表格布局配置
                                        const tableLayout = configManager.get().tableLayout || 'vertical';
                                        
                                        // 生成ID类型详情内容
                                        const idTypeContent = () => {
                                            // 渲染竖列式布局
                                            if (tableLayout === 'vertical') {
                                                return `
                                                <div class="vertical-table-container">
                                                    ${items.map((item, itemIndex) => {
                                                        const isDuplicate = result[allIdsKey] && result[allIdsKey].get(item.id).size > 1;
                                                        return `
                                                        <div class="vertical-table-card ${isDuplicate ? 'duplicate' : ''}">
                                                            <div class="card-header">
                                                                <div class="card-title">
                                                                    ${item.name || item.title || item.id}
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
                                                                        // 如果是名称相关列，且当前值为undefined，尝试使用另一个名称字段
                                                                        if (value === undefined && (key === 'name' || key === 'title')) {
                                                                            value = key === 'name' ? item.title : item.name;
                                                                        }
                                                                        if (value === undefined) return '';
                                                                        return `
                                                                        <div class="vertical-table-row">
                                                                            <div class="row-label">${configManager.getAttributeCN(type, key)}:</div>
                                                                            <div class="row-value" title="${JSON.stringify(value)}">
                                                                                ${typeof value === 'object' ? JSON.stringify(value).replace(/^"|"$/g, '') : value}
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
                                                `;
                                            } else {
                                                // 渲染横列式布局
                                                return `
                                                <div style="overflow-x: auto;">
                                                    <table class="horizontal-table" style="width: 100%; border-collapse: collapse; background: var(--bg-primary); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm); table-layout: auto; border: 1px solid var(--border-color);">
                                                        <thead style="background: var(--primary-gradient); color: white;">
                                                            <tr>
                                                                ${sortedKeys.map(key => `
                                                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: bold; white-space: nowrap; min-width: 100px;">${configManager.getAttributeCN(type, key)}</th>
                                                                `).join('')}
                                                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: bold; white-space: nowrap;">状态</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${items.map((item, itemIndex) => {
                                                                const isDuplicate = result[allIdsKey] && result[allIdsKey].get(item.id).size > 1;
                                                                return `
                                                                <tr style="${isDuplicate ? 'background: var(--danger-light);' : ''};">
                                                                    ${sortedKeys.map(key => {
                                                                        let value = item[key];
                                                                        // 如果是名称相关列，且当前值为undefined，尝试使用另一个名称字段
                                                                        if (value === undefined && (key === 'name' || key === 'title')) {
                                                                            value = key === 'name' ? item.title : item.name;
                                                                        }
                                                                        return `
                                                                        <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                                            ${typeof value === 'object' ? JSON.stringify(value).replace(/^"|"$/g, '') : value}
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
                                                ${idTypeContent()}
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
                    }
                });
            });
        }, 0);
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
                        const isDuplicate = result.allEventIds.get(event.id).size > 1;
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
                                            <div class="row-value" title="${JSON.stringify(value)}">
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