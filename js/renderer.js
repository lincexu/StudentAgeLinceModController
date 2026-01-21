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
        
        // 显示重复事件ID
        this.renderDuplicateEventIds(result);
        
        // 显示重复物品ID
        this.renderDuplicateItemIds(result);
        
        // 显示重复书籍ID
        this.renderDuplicateBookIds(result);
        
        // 显示重复行动ID
        this.renderDuplicateActionIds(result);
        
        // 显示统计摘要
        this.renderSummary(result);
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
        const { totalMods, totalEvents, uniqueEventIds, duplicateEventIds, 
                totalItems, uniqueItemIds, duplicateItemIds, 
                totalBooks, uniqueBookIds, duplicateBookIds, 
                totalActions, uniqueActionIds, duplicateActionIds, 
                modDetails, modEventIds, allEventIds, modItemIds, allItemIds, modBookIds, allBookIds, modActionIds, allActionIds } = result;
        
        this.summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${totalMods}</div>
                    <div class="summary-label">分析的模组数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalEvents}</div>
                    <div class="summary-label">总事件数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalItems}</div>
                    <div class="summary-label">总物品数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalBooks}</div>
                    <div class="summary-label">总书籍数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalActions}</div>
                    <div class="summary-label">总行动数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${duplicateEventIds.length + duplicateItemIds.length + duplicateBookIds.length + duplicateActionIds.length}</div>
                    <div class="summary-label">重复ID总数</div>
                </div>
            </div>
            <div class="summary-text">
                <h4>分析详情：</h4>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>已分析 <strong>${totalMods}</strong> 个模组文件夹</li>
                    <li>共检测到 <strong>${totalEvents}</strong> 个事件，其中 <strong>${duplicateEventIds.length}</strong> 个重复事件ID</li>
                    <li>共检测到 <strong>${totalItems}</strong> 个物品，其中 <strong>${duplicateItemIds.length}</strong> 个重复物品ID</li>
                    <li>共检测到 <strong>${totalBooks}</strong> 个书籍，其中 <strong>${duplicateBookIds.length}</strong> 个重复书籍ID</li>
                    <li>共检测到 <strong>${totalActions}</strong> 个行动，其中 <strong>${duplicateActionIds.length}</strong> 个重复行动ID</li>
                    <li>事件ID唯一率：<strong>${totalEvents > 0 ? Math.round((uniqueEventIds / totalEvents) * 100) : 0}%</strong></li>
                    <li>物品ID唯一率：<strong>${totalItems > 0 ? Math.round((uniqueItemIds / totalItems) * 100) : 0}%</strong></li>
                    <li>书籍ID唯一率：<strong>${totalBooks > 0 ? Math.round((uniqueBookIds / totalBooks) * 100) : 0}%</strong></li>
                    <li>行动ID唯一率：<strong>${totalActions > 0 ? Math.round((uniqueActionIds / totalActions) * 100) : 0}%</strong></li>
                </ul>
            </div>
            
            <div style="margin-top: 30px;">
                <h4>模组详情：</h4>
                <div style="margin-top: 15px;">
                    ${Array.from(modDetails.entries()).map(([modName, modDetail]) => {
                        // 找出当前模组的重复事件ID和重复物品ID
                        const modEventIdsSet = modEventIds.get(modName);
                        const duplicateEventsInMod = Array.from(modEventIdsSet || []).filter(id => 
                            allEventIds.get(id).size > 1
                        );
                        
                        const modItemIdsSet = modItemIds.get(modName);
                        const duplicateItemsInMod = Array.from(modItemIdsSet || []).filter(id => 
                            allItemIds.get(id).size > 1
                        );
                        
                        const modBookIdsSet = modBookIds.get(modName);
                        const duplicateBooksInMod = Array.from(modBookIdsSet || []).filter(id => 
                            allBookIds.get(id).size > 1
                        );
                        
                        const modActionIdsSet = modActionIds.get(modName);
                        const duplicateActionsInMod = Array.from(modActionIdsSet || []).filter(id => 
                            allActionIds.get(id).size > 1
                        );
                        
                        return `
                            <div style="margin-bottom: 20px; background: #f8f9ff; border: 1px solid #e0e7ff; border-radius: 8px; overflow: hidden;">
                                <!-- 模组标题栏 -->
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="mod-header">
                                    <div>
                                        <h5 style="margin: 0; font-size: 1.1rem;">${modName}</h5>
                                        <p style="margin: 5px 0 0 0; font-size: 0.8rem; opacity: 0.9;">${modDetail.path}</p>
                                    </div>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">事件: ${modDetail.events.length}</div>
                                        <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">物品: ${modDetail.items.length}</div>
                                        <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">书籍: ${modDetail.books.length}</div>
                                        <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">行动: ${modDetail.actions.length}</div>
                                        <div class="mod-toggle-icon">▼</div>
                                    </div>
                                </div>
                                
                                <!-- 模组详情内容，默认隐藏 -->
                                <div class="mod-content" style="display: none; padding: 20px;">
                                    <!-- 模组统计 -->
                                    <div style="margin-bottom: 20px; padding: 15px; background: #fff; border: 1px solid #e9ecef; border-radius: 8px;">
                                        <h6 style="margin: 0 0 10px 0; color: #495057;">模组统计</h6>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">事件总数</div>
                                                <div style="font-size: 1.2rem; font-weight: 600;">${modDetail.events.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">重复事件ID</div>
                                                <div style="font-size: 1.2rem; font-weight: 600; color: #dc3545;">${duplicateEventsInMod.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">物品总数</div>
                                                <div style="font-size: 1.2rem; font-weight: 600;">${modDetail.items.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">重复物品ID</div>
                                                <div style="font-size: 1.2rem; font-weight: 600; color: #dc3545;">${duplicateItemsInMod.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">书籍总数</div>
                                                <div style="font-size: 1.2rem; font-weight: 600;">${modDetail.books.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">重复书籍ID</div>
                                                <div style="font-size: 1.2rem; font-weight: 600; color: #dc3545;">${duplicateBooksInMod.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">行动总数</div>
                                                <div style="font-size: 1.2rem; font-weight: 600;">${modDetail.actions.length}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8rem; color: #6c757d;">重复行动ID</div>
                                                <div style="font-size: 1.2rem; font-weight: 600; color: #dc3545;">${duplicateActionsInMod.length}</div>
                                            </div>
                                        </div>
                                        
                                        ${duplicateEventsInMod.length > 0 ? `
                                            <div style="margin-top: 15px;">
                                                <strong style="color: #dc3545; font-size: 0.9rem;">重复事件ID列表：</strong>
                                                <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                                    ${duplicateEventsInMod.map(id => `
                                                        <span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${duplicateItemsInMod.length > 0 ? `
                                            <div style="margin-top: 10px;">
                                                <strong style="color: #dc3545; font-size: 0.9rem;">重复物品ID列表：</strong>
                                                <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                                    ${duplicateItemsInMod.map(id => `
                                                        <span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${duplicateBooksInMod.length > 0 ? `
                                            <div style="margin-top: 10px;">
                                                <strong style="color: #dc3545; font-size: 0.9rem;">重复书籍ID列表：</strong>
                                                <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                                    ${duplicateBooksInMod.map(id => `
                                                        <span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${duplicateActionsInMod.length > 0 ? `
                                            <div style="margin-top: 10px;">
                                                <strong style="color: #dc3545; font-size: 0.9rem;">重复行动ID列表：</strong>
                                                <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                                    ${duplicateActionsInMod.map(id => `
                                                        <span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    <!-- 事件详情 -->
                                    ${modDetail.events.length > 0 ? `
                                        <div style="margin-bottom: 20px;">
                                            <h6 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 5px;">
                                                <span>📅 事件详情</span>
                                                <span style="font-size: 0.8rem; font-weight: normal; color: #6c757d;">(${modDetail.events.length}个)</span>
                                            </h6>
                                            <div style="overflow-x: auto;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                    <thead style="background: #f8f9fa; color: #495057;">
                                                        <tr>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">事件ID</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">标题</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">状态</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${modDetail.events.map(event => {
                                                            const isDuplicate = allEventIds.get(event.id).size > 1;
                                                            return `
                                                                <tr style="${isDuplicate ? 'background: #fff5f5;' : ''}">
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${event.id}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${event.title}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                                                        <span style="padding: 3px 6px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; ${isDuplicate ? 'background: #ffebee; color: #c62828;' : 'background: #e8f5e8; color: #2e7d32;'}">
                                                                            ${isDuplicate ? '重复' : '唯一'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            `;
                                                        }).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <!-- 物品详情 -->
                                    ${modDetail.items.length > 0 ? `
                                        <div style="margin-bottom: 20px;">
                                            <h6 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 5px;">
                                                <span>🎒 物品详情</span>
                                                <span style="font-size: 0.8rem; font-weight: normal; color: #6c757d;">(${modDetail.items.length}个)</span>
                                            </h6>
                                            <div style="overflow-x: auto;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                    <thead style="background: #f8f9fa; color: #495057;">
                                                        <tr>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">物品ID</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">名称</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">类型</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">状态</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${modDetail.items.map(item => {
                                                            const isDuplicate = allItemIds.get(item.id).size > 1;
                                                            return `
                                                                <tr style="${isDuplicate ? 'background: #fff5f5;' : ''}">
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${item.id}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${item.name}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${item.data.type || 0}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                                                        <span style="padding: 3px 6px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; ${isDuplicate ? 'background: #ffebee; color: #c62828;' : 'background: #e8f5e8; color: #2e7d32;'}">
                                                                            ${isDuplicate ? '重复' : '唯一'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            `;
                                                        }).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <!-- 书籍详情 -->
                                    ${modDetail.books.length > 0 ? `
                                        <div style="margin-bottom: 20px;">
                                            <h6 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 5px;">
                                                <span>📚 书籍详情</span>
                                                <span style="font-size: 0.8rem; font-weight: normal; color: #6c757d;">(${modDetail.books.length}个)</span>
                                            </h6>
                                            <div style="overflow-x: auto;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                    <thead style="background: #f8f9fa; color: #495057;">
                                                        <tr>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">书籍ID</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">名称</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">类型</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">状态</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${modDetail.books.map(book => {
                                                            const isDuplicate = allBookIds.get(book.id).size > 1;
                                                            return `
                                                                <tr style="${isDuplicate ? 'background: #fff5f5;' : ''}">
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${book.id}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${book.name}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${book.data.type || 0}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                                                        <span style="padding: 3px 6px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; ${isDuplicate ? 'background: #ffebee; color: #c62828;' : 'background: #e8f5e8; color: #2e7d32;'}">
                                                                            ${isDuplicate ? '重复' : '唯一'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            `;
                                                        }).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <!-- 行动详情 -->
                                    ${modDetail.actions.length > 0 ? `
                                        <div>
                                            <h6 style="margin: 0 0 15px 0; color: #495057; display: flex; align-items: center; gap: 5px;">
                                                <span>⚡ 行动详情</span>
                                                <span style="font-size: 0.8rem; font-weight: normal; color: #6c757d;">(${modDetail.actions.length}个)</span>
                                            </h6>
                                            <div style="overflow-x: auto;">
                                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                    <thead style="background: #f8f9fa; color: #495057;">
                                                        <tr>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">行动ID</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">名称</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">类型</th>
                                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">状态</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${modDetail.actions.map(action => {
                                                            const isDuplicate = allActionIds.get(action.id).size > 1;
                                                            return `
                                                                <tr style="${isDuplicate ? 'background: #fff5f5;' : ''}">
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${action.id}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${action.name}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${action.data.type || 0}</td>
                                                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                                                        <span style="padding: 3px 6px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; ${isDuplicate ? 'background: #ffebee; color: #c62828;' : 'background: #e8f5e8; color: #2e7d32;'}">
                                                                            ${isDuplicate ? '重复' : '唯一'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            `;
                                                        }).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ` : ''}
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
        }, 0);
    }

    /**
     * 渲染事件详情表格
     * @param {Object} result - 分析结果
     * @param {HTMLElement} container - 容器元素
     */
    renderEventDetails(result, container) {
        const { modDetails } = result;
        
        // 事件详情表格HTML
        const eventDetailsHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <tr>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">模组名称</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">事件ID</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">事件标题</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Array.from(modDetails.entries()).map(([modName, modDetail]) => 
                            modDetail.events.map(event => {
                                // 检查事件ID是否重复
                                const isDuplicate = result.allEventIds.get(event.id).size > 1;
                                return `
                                    <tr style="${isDuplicate ? 'background: #fff5f5;' : ''}">
                                        <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">${modName}</td>
                                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${event.id}</td>
                                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${event.title}</td>
                                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; ${isDuplicate ? 'background: #ffebee; color: #c62828;' : 'background: #e8f5e8; color: #2e7d32;'}">
                                                ${isDuplicate ? '重复' : '唯一'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // 将事件详情添加到容器中
        container.innerHTML = eventDetailsHTML;
    }
}
