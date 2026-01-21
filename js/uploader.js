// 文件上传模块
class Uploader {
    constructor() {
        this.selectedFolders = new Map(); // modName => folderInfo
        this.allFiles = []; // 保存所有选中的文件
        this.folderInput = null;
        this.uploadArea = null;
        this.onFolderChange = null;
        
        this.init();
    }

    init() {
        this.folderInput = document.getElementById('folder-input');
        this.uploadArea = document.getElementById('upload-area');
        this.bindEvents();
    }

    bindEvents() {
        // 文件选择事件
        this.folderInput.addEventListener('change', (e) => this.handleFolderSelection(e));
        
        // 拖拽事件
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    }

    /**
     * 处理文件夹选择
     * @param {Event} e - 事件对象
     */
    handleFolderSelection(e) {
        const files = Array.from(e.target.files);
        
        // 保存所有文件，用于后续分析
        this.allFiles = this.allFiles.concat(files);
        
        const newFolders = this.parseFiles(files);
        
        // 合并新选择的文件夹，防止覆盖
        this.mergeFolders(newFolders);
        
        // 触发回调
        if (this.onFolderChange) {
            this.onFolderChange(Array.from(this.selectedFolders.values()));
        }
        
        // 重置文件输入，允许重复选择相同文件夹
        e.target.value = '';
    }

    /**
     * 解析文件列表，提取文件夹信息
     * @param {File[]} files - 文件列表
     * @returns {Map<string, Object>} 解析后的文件夹映射
     */
    parseFiles(files) {
        const folders = new Map();
        
        console.log('=== 解析文件列表 ===');
        console.log(`总文件数: ${files.length}`);
        
        files.forEach(file => {
            console.log(`文件: ${file.name}, 相对路径: ${file.webkitRelativePath}`);
            
            // 检查是否是文件夹中的文件
            if (file.webkitRelativePath.includes('/') || file.webkitRelativePath.includes('\\')) {
                // 兼容不同操作系统的路径分隔符
                const separator = file.webkitRelativePath.includes('/') ? '/' : '\\';
                const parts = file.webkitRelativePath.split(separator);
                
                // 如果有TestMod文件夹，将其中的子文件夹作为模组
                let folderName;
                if (parts[0] === 'TestMod' && parts.length > 1) {
                    // TestMod文件夹中的子文件夹作为模组
                    folderName = parts[1];
                    console.log(`检测到TestMod文件夹，使用子文件夹 ${folderName} 作为模组`);
                } else {
                    // 直接使用顶级文件夹作为模组
                    folderName = parts[0];
                }
                
                if (!folders.has(folderName)) {
                    folders.set(folderName, {
                        name: folderName,
                        fullPath: folderName, // 只使用文件夹名称作为路径
                        file: file
                    });
                    console.log(`添加文件夹: ${folderName}`);
                }
            }
        });
        
        console.log(`解析完成，找到 ${folders.size} 个文件夹`);
        return folders;
    }

    /**
     * 合并文件夹，防止覆盖已选择的文件夹
     * @param {Map<string, Object>} newFolders - 新选择的文件夹
     */
    mergeFolders(newFolders) {
        for (const [folderName, folderInfo] of newFolders.entries()) {
            // 只有当文件夹不存在时才添加，防止覆盖
            if (!this.selectedFolders.has(folderName)) {
                this.selectedFolders.set(folderName, folderInfo);
            }
        }
    }

    /**
     * 清空已选择的文件夹
     */
    clearFolders() {
        this.selectedFolders.clear();
        this.allFiles = []; // 同时清空文件列表
        if (this.onFolderChange) {
            this.onFolderChange(Array.from(this.selectedFolders.values()));
        }
    }
    
    /**
     * 移除单个文件夹
     * @param {number} index - 文件夹索引
     */
    removeFolder(index) {
        const folders = Array.from(this.selectedFolders.values());
        if (index >= 0 && index < folders.length) {
            const folderToRemove = folders[index];
            this.selectedFolders.delete(folderToRemove.name);
            if (this.onFolderChange) {
                this.onFolderChange(Array.from(this.selectedFolders.values()));
            }
        }
    }

    /**
     * 获取已选择的文件夹列表
     * @returns {Object[]} 文件夹列表
     */
    getSelectedFolders() {
        return Array.from(this.selectedFolders.values());
    }
    
    /**
     * 获取所有选中的文件
     * @returns {File[]} 文件列表
     */
    getAllFiles() {
        return this.allFiles;
    }

    /**
     * 设置文件夹变化回调
     * @param {Function} callback - 回调函数
     */
    setOnFolderChange(callback) {
        this.onFolderChange = callback;
    }

    // 拖拽事件处理
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
        
        // 处理拖拽的文件夹
        const items = Array.from(e.dataTransfer.items);
        if (items.length > 0) {
            // 拖拽文件夹需要特殊处理，这里提示用户使用点击方式
            alert('拖拽功能暂不支持直接选择文件夹，请使用点击方式选择。\n我们会在后续版本中优化此功能。');
        }
    }
}
