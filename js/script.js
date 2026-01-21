class ModEventAnalyzer {
    constructor() {
        this.selectedFolders = [];
        this.modEventIds = new Map(); // modName => Set(eventIds)
        this.allEventIds = new Map(); // eventId => Set(modNames)
        this.modDetails = new Map(); // modName => { path, events: [] }
        this.totalMods = 0;
        this.processedMods = 0;
        this.totalEvents = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        const folderInput = document.getElementById('folder-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const uploadArea = document.getElementById('upload-area');
        
        folderInput.addEventListener('change', (e) => this.handleFolderSelection(e));
        analyzeBtn.addEventListener('click', () => this.startAnalysis());
        
        // 添加拖拽事件处理
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadArea = document.getElementById('upload-area');
        uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadArea = document.getElementById('upload-area');
        uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadArea = document.getElementById('upload-area');
        uploadArea.classList.remove('dragover');
        
        // 处理拖拽的文件夹
        const items = Array.from(e.dataTransfer.items);
        if (items.length > 0) {
            // 触发文件输入的change事件
            const folderInput = document.getElementById('folder-input');
            // 这里需要特殊处理，因为拖拽文件夹无法直接设置到input元素中
            // 我们可以提示用户使用点击方式选择文件夹
            alert('拖拽功能暂不支持直接选择文件夹，请使用点击方式选择。\n我们会在后续版本中优化此功能。');
        }
    }
    
    handleFolderSelection(e) {
        const files = Array.from(e.target.files);
        this.selectedFolders = files.filter(file => file.webkitRelativePath.includes('/'))
                                   .map(file => {
                                       const parts = file.webkitRelativePath.split('/');
                                       return {
                                           name: parts[0],
                                           fullPath: file.webkitRelativePath,
                                           file: file
                                       };
                                   })
                                   .filter((folder, index, self) => 
                                       index === self.findIndex(f => f.name === folder.name)
                                   );
        
        this.updateUI();
    }
    
    updateUI() {
        const analyzeBtn = document.getElementById('analyze-btn');
        analyzeBtn.disabled = this.selectedFolders.length === 0;
        
        // 更新统计信息
        const resultStats = document.getElementById('result-stats');
        resultStats.innerHTML = `
            <span class="stat-item">已选择 ${this.selectedFolders.length} 个文件夹</span>
        `;
    }
    
    async startAnalysis() {
        if (this.selectedFolders.length === 0) {
            alert('请先选择模组文件夹');
            return;
        }
        
        // 重置状态
        this.modEventIds.clear();
        this.allEventIds.clear();
        this.modDetails.clear();
        this.totalMods = this.selectedFolders.length;
        this.processedMods = 0;
        this.totalEvents = 0;
        
        // 显示进度条
        this.showProgress();
        
        try {
            // 遍历所有选中的文件夹，查找EvtCfg.json文件
            for (const folder of this.selectedFolders) {
                await this.processFolder(folder);
            }
            
            // 分析完成，显示结果
            this.showResults();
        } catch (error) {
            console.error('分析出错:', error);
            this.updateProgress('分析出错，请查看控制台', 100);
            alert('分析出错: ' + error.message);
        }
    }
    
    async processFolder(folder) {
        const folderInput = document.getElementById('folder-input');
        const files = Array.from(folderInput.files);
        
        // 查找当前文件夹下的EvtCfg.json文件
        const evtCfgFiles = files.filter(file => 
            file.webkitRelativePath === `${folder.name}/EvtCfg.json` ||
            file.webkitRelativePath.startsWith(`${folder.name}/`) && 
            file.name === 'EvtCfg.json'
        );
        
        if (evtCfgFiles.length > 0) {
            for (const evtFile of evtCfgFiles) {
                await this.processEvtCfgFile(folder, evtFile);
            }
        } else {
            // 没有找到EvtCfg.json文件
            console.warn(`文件夹 ${folder.name} 中未找到 EvtCfg.json 文件`);
        }
        
        // 更新进度
        this.processedMods++;
        const progress = Math.round((this.processedMods / this.totalMods) * 100);
        this.updateProgress(`正在分析: ${folder.name} (${this.processedMods}/${this.totalMods})`, progress);
    }
    
    async processEvtCfgFile(folder, file) {
        try {
            const content = await this.readFile(file);
            const jsonData = JSON.parse(content);
            
            // 为当前模组初始化数据结构
            if (!this.modEventIds.has(folder.name)) {
                this.modEventIds.set(folder.name, new Set());
                this.modDetails.set(folder.name, {
                    path: folder.fullPath,
                    events: []
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
                        title: this.getEventTitle(eventData),
                        data: eventData
                    });
                    
                    this.totalEvents++;
                }
            }
        } catch (error) {
            console.error(`处理文件 ${file.name} 出错:`, error);
        }
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    showProgress() {
        const progressSection = document.getElementById('progress-section');
        progressSection.style.display = 'block';
        this.updateProgress('准备分析...', 0);
    }
    
    updateProgress(text, percentage) {
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');
        
        progressText.textContent = text;
        progressFill.style.width = `${percentage}%`;
    }
    
    showResults() {
        // 隐藏进度条
        const progressSection = document.getElementById('progress-section');
        progressSection.style.display = 'none';
        
        // 显示重复ID
        this.displayDuplicateIds();
        
        // 显示统计摘要
        this.displaySummary();
    }
    
    displayDuplicateIds() {
        const duplicateSection = document.getElementById('duplicate-section');
        const duplicateList = document.getElementById('duplicate-list');
        
        // 找出重复的事件ID
        const duplicateIds = Array.from(this.allEventIds.entries())
                                 .filter(([id, mods]) => mods.size > 1)
                                 .sort((a, b) => a[0] - b[0]);
        
        if (duplicateIds.length > 0) {
            duplicateSection.style.display = 'block';
            duplicateList.innerHTML = `
                <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                    <strong>⚠️ 检测到 ${duplicateIds.length} 个重复事件ID</strong><br>
                    以下事件ID在多个模组中被使用，可能会导致游戏冲突：
                </div>
                ${duplicateIds.map(([id, modNames]) => `
                    <div class="duplicate-item">
                        <div class="duplicate-id">事件ID: ${id}</div>
                        <div style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">被 ${modNames.size} 个模组使用</div>
                        <div class="duplicate-modules">
                            ${Array.from(modNames).map(modName => {
                                const modDetail = this.modDetails.get(modName);
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
            duplicateSection.style.display = 'block';
            duplicateList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <div>未检测到重复事件ID</div>
                    <div style="margin-top: 10px; color: #666; font-size: 0.9rem;">所有模组事件ID都是唯一的</div>
                </div>
            `;
        }
    }
    
    displaySummary() {
        const summaryContent = document.getElementById('summary-content');
        const duplicateIds = Array.from(this.allEventIds.entries())
                                 .filter(([id, modNames]) => modNames.size > 1).length;
        
        summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${this.totalMods}</div>
                    <div class="summary-label">分析的模组数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${this.totalEvents}</div>
                    <div class="summary-label">总事件数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${this.allEventIds.size}</div>
                    <div class="summary-label">唯一事件ID数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${duplicateIds}</div>
                    <div class="summary-label">重复事件ID数</div>
                </div>
            </div>
            <div class="summary-text">
                <h4>分析详情：</h4>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>已分析 <strong>${this.totalMods}</strong> 个模组文件夹</li>
                    <li>共检测到 <strong>${this.totalEvents}</strong> 个事件</li>
                    <li>发现 <strong>${duplicateIds}</strong> 个重复事件ID</li>
                    <li>事件ID唯一率：<strong>${Math.round((this.allEventIds.size / this.totalEvents) * 100)}%</strong></li>
                </ul>
            </div>
            
            <div style="margin-top: 30px;">
                <h4>模组详情：</h4>
                <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    ${Array.from(this.modDetails.entries()).map(([modName, modDetail]) => {
                        // 找出当前模组的重复事件ID
                        const modEventIds = this.modEventIds.get(modName);
                        const duplicateInMod = Array.from(modEventIds).filter(id => 
                            this.allEventIds.get(id).size > 1
                        );
                        
                        return `
                            <div style="background: #f8f9ff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 15px;">
                                <h5 style="margin-bottom: 10px; color: #4f46e5;">${modName}</h5>
                                <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">路径：${modDetail.path}</p>
                                <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">事件数量：${modDetail.events.length}</p>
                                <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">重复事件ID：${duplicateInMod.length}</p>
                                ${duplicateInMod.length > 0 ? `
                                    <div style="margin-top: 10px;">
                                        <strong style="color: #dc3545; font-size: 0.9rem;">重复ID列表：</strong>
                                        <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                            ${duplicateInMod.map(id => `
                                                <span style="background: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem;">${id}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    getEventTitle(eventData) {
        if (!eventData) return '无标题';
        
        if (eventData.title) {
            // 移除颜色标签
            return eventData.title.replace(/<color=#([0-9A-Fa-f]+)>/g, '').replace(/<\/color>/g, '');
        }
        
        return `事件 ${eventData.id}`;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ModEventAnalyzer();
});