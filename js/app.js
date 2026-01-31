// 主应用模块
class ModEventApp {
    constructor() {
        this.uploader = null;
        this.analyzer = null;
        this.renderer = null;
        this.idDatabase = null;
        this.analyzeBtn = null;
        this.clearBtn = null;
        
        this.init();
    }

    async init() {
        // 加载配置文件
        await this.loadConfig();
        
        // 检测开发环境（file://协议）
        this.detectDevelopmentEnvironment();
        
        // 初始化各个模块
        this.uploader = new Uploader();
        this.analyzer = new EventAnalyzer();
        this.renderer = new ResultRenderer();
        
        // 获取DOM元素
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.clearBtn = document.getElementById('clear-selection');
        
        // 显示进度条，初始化数据库
        this.showProgressBar('初始化ID数据库...', 0);
        
        // 初始化ID类型实时数据库
        this.idDatabase = idDatabase;
        
        // 设置进度更新回调
        this.idDatabase.setOnProgressUpdate((status, progress) => {
            this.updateProgressBar(status, progress);
        });
        
        // 禁用分析按钮
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = true;
            this.analyzeBtn.style.opacity = '0.6';
            this.analyzeBtn.style.cursor = 'not-allowed';
        }
        
        // 初始化数据库
        await this.idDatabase.initialize();
        
        // 启用分析按钮
        if (this.analyzeBtn) {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.style.opacity = '1';
            this.analyzeBtn.style.cursor = 'pointer';
        }
        
        // 隐藏进度条
        this.hideProgressBar();
        
        // 设置主题模式
        this.setupThemeMode();
        
        // 应用透明度设置
        this.applyOpacity(this.config.opacity || 85);
        
        // 更新底部版本信息
        await this.updateFooterVersion();
        
        // 应用翻译
        this.applyTranslations();
        
        // 初始化语言切换按钮
        this.initLanguageToggle();
        
        // 自动添加baseGame文件夹到待解析列表（如果配置启用）
        this.autoAddBaseGameFolder();
        // 自动添加DLC初阳文件夹到待解析列表（如果配置启用）
        this.autoAddDlcFolder();
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 显示进度条
     * @param {string} text 进度文本
     * @param {number} progress 进度值（0-100）
     */
    showProgressBar(text, progress) {
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressSection) {
            progressSection.style.display = 'block';
            progressSection.className = 'progress-section loading';
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `${progress}%`;
        }
    }
    
    /**
     * 更新进度条
     * @param {string} text 进度文本
     * @param {number} progress 进度值（0-100）
     */
    updateProgressBar(text, progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `${progress}%`;
        }
    }
    
    /**
     * 隐藏进度条
     */
    hideProgressBar() {
        const progressSection = document.getElementById('progress-section');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }
    
    /**
     * 显示成功状态的进度条
     * @param {string} text 成功文本
     */
    showSuccessProgressBar(text) {
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressSection) {
            progressSection.style.display = 'block';
            progressSection.className = 'progress-section success';
        }
        
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = '100%';
        }
        
        // 2秒后自动隐藏
        setTimeout(() => {
            this.hideProgressBar();
        }, 2000);
    }
    
    /**
     * 显示错误状态的进度条
     * @param {string} text 错误文本
     */
    showErrorProgressBar(text) {
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressSection) {
            progressSection.style.display = 'block';
            progressSection.className = 'progress-section error';
        }
        
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = '100%';
        }
    }
    
    /**
     * 根据配置自动添加baseGame文件夹到待解析列表
     */
    autoAddBaseGameFolder() {
        if (this.config.includeOfficialContent) {
            console.log('[App] 自动添加baseGame文件夹到待解析列表');
            // 检查baseGame文件夹是否存在
            fetch('baseGame/')
                .then(response => {
                    if (response.ok) {
                        console.log('[App] 检测到baseGame文件夹存在');
                        // 先检查是否已经有baseGame文件夹
                        const currentFolders = this.uploader.getSelectedFolders();
                        const hasBaseGame = currentFolders.some(folder => folder.name === 'baseGame');
                        if (!hasBaseGame) {
                            // 创建baseGame文件夹对象
                            const baseGameFolder = {
                                name: 'baseGame',
                                fullPath: 'baseGame',
                                file: null
                            };
                            // 手动添加到uploader的selectedFolders中
                            this.uploader.selectedFolders.set('baseGame', baseGameFolder);
                            // 更新UI显示
                            if (this.renderer) {
                                this.renderer.updateFolderStats(Array.from(this.uploader.selectedFolders.values()));
                            }
                            console.log('[App] baseGame文件夹已添加到待解析列表');
                        } else {
                            console.log('[App] baseGame文件夹已存在于待解析列表中');
                        }
                    } else {
                        console.log('[App] baseGame文件夹不存在');
                    }
                })
                .catch(error => {
                    console.log('[App] 检查baseGame文件夹时出错:', error.message);
                });
        } else {
            console.log('[App] 配置为不自动添加baseGame文件夹');
        }
    }

    /**
     * 根据配置自动添加DLC初阳文件夹到待解析列表
     */
    autoAddDlcFolder() {
        if (this.config.includeDlcContent) {
            console.log('[App] 自动添加DLC初阳文件夹到待解析列表');
            // 检查DLC初阳文件夹是否存在
            fetch('dlc/初阳/')
                .then(response => {
                    if (response.ok) {
                        console.log('[App] 检测到DLC初阳文件夹存在');
                        // 先检查是否已经有DLC初阳文件夹
                        const currentFolders = this.uploader.getSelectedFolders();
                        const hasDlc = currentFolders.some(folder => folder.name === '初阳');
                        if (!hasDlc) {
                            // 创建DLC初阳文件夹对象
                            const dlcFolder = {
                                name: '初阳',
                                fullPath: 'dlc/初阳',
                                file: null
                            };
                            // 手动添加到uploader的selectedFolders中
                            this.uploader.selectedFolders.set('初阳', dlcFolder);
                            // 更新UI显示
                            if (this.renderer) {
                                this.renderer.updateFolderStats(Array.from(this.uploader.selectedFolders.values()));
                            }
                            console.log('[App] DLC初阳文件夹已添加到待解析列表');
                        } else {
                            console.log('[App] DLC初阳文件夹已存在于待解析列表中');
                        }
                    } else {
                        console.log('[App] DLC初阳文件夹不存在');
                    }
                })
                .catch(error => {
                    console.log('[App] 检查DLC初阳文件夹时出错:', error.message);
                });
        } else {
            console.log('[App] 配置为不自动添加DLC初阳文件夹');
        }
    }

    /**
     * 加载配置
     */
    async loadConfig() {
        try {
            // 使用配置管理模块加载配置
            this.config = await configManager.loadConfig();
            console.log('配置加载成功:', this.config);
        } catch (error) {
            console.error('加载配置失败:', error);
            // 从配置管理模块获取默认配置
            this.config = configManager.get();
            console.log('使用默认配置:', this.config);
        }
    }
    
    /**
     * 保存配置到localStorage
     */
    saveConfig() {
        // 使用配置管理模块保存配置
        configManager.set(this.config);
        configManager.saveConfig();
    }
    
    /**
     * 检测开发环境（file://协议）
     */
    detectDevelopmentEnvironment() {
        if (window.location.protocol === 'file:') {
            const warningElement = document.getElementById('file-protocol-warning');
            if (warningElement) {
                warningElement.style.display = 'block';
                
                // 绑定关闭警告事件
                const closeBtn = document.getElementById('close-warning');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        warningElement.style.display = 'none';
                        // 保存用户关闭状态
                        localStorage.setItem('fileProtocolWarningDismissed', 'true');
                    });
                }
            }
        }
    }
    
    /**
     * 设置主题模式
     */
    setupThemeMode() {
        const themeMode = this.config.themeMode;
        const body = document.body;
        
        if (themeMode === 0) {
            // 永昼模式
            body.classList.remove('dark-mode');
        } else if (themeMode === 1) {
            // 永夜模式
            body.classList.add('dark-mode');
        } else if (themeMode === 3) {
            // 跟随系统
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
        }
    }
    
    /**
     * 初始化语言切换按钮
     */
    initLanguageToggle() {
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            // 根据当前配置设置初始文本
            const currentLanguage = this.config.language;
            languageToggle.textContent = currentLanguage === 'zh-tw' ? '繁' : '简';
        }
    }

    /**
     * 更新底部版本信息
     */
    async updateFooterVersion() {
        const versionElement = document.getElementById('footer-version');
        
        if (versionElement) {
            try {
                // 直接从config.jsonc文件读取最新版本号
                const response = await fetch('config.jsonc', { cache: 'no-cache' });
                if (response.ok) {
                    const jsoncText = await response.text();
                    // 简单解析JSONC，移除注释
                    const cleanedJson = jsoncText
                        .replace(/\/\/.*$/gm, '') // 移除单行注释
                        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
                        .trim();
                    const config = JSON.parse(cleanedJson);
                    const version = config.version || this.config.version || '0.2.0';
                    versionElement.textContent = `Student Age LMC v${version}`;

                    return;
                }
            } catch (error) {
                console.error('直接读取config.jsonc失败:', error);
            }
            
            //  fallback to current config
            const version = this.config.version || '0.2.0';
            versionElement.textContent = `Student Age LMC v${version}`;

        }
    }
    
    /**
     * 应用翻译
     */
    applyTranslations() {
        // 应用页面翻译
        const appTitle = document.querySelector('.toolbar-left h1');
        const uploadInstruction = document.querySelector('div[style*="text-align: center"] p');
        const uploadText = document.querySelector('.upload-text');
        const uploadHint = document.querySelector('.upload-hint');
        const analyzeBtn = document.getElementById('analyze-btn');
        const duplicateTitle = document.querySelector('.duplicate-section h3');
        const summaryTitle = document.querySelector('.summary-section h3');
        const clearBtn = document.getElementById('clear-btn');
        
        if (appTitle) appTitle.textContent = configManager.t('appTitle');
        if (uploadInstruction) uploadInstruction.textContent = configManager.t('uploadInstruction');
        if (uploadText) uploadText.textContent = configManager.t('uploadLabel.text');
        if (uploadHint) uploadHint.textContent = configManager.t('uploadLabel.hint');
        if (analyzeBtn) analyzeBtn.textContent = configManager.t('analyzeBtn');
        if (duplicateTitle) duplicateTitle.textContent = configManager.t('duplicateSection.title');
        if (summaryTitle) summaryTitle.textContent = configManager.t('summarySection.title');
        if (clearBtn) clearBtn.textContent = configManager.t('clearBtn');
    }
    
    /**
     * 设置面板相关功能
     */
    setupSettingsPanel() {
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsOverlay = document.getElementById('settings-overlay');
        const closeSettings = document.getElementById('close-settings');
        const saveSettings = document.getElementById('save-settings');
        const resetSettings = document.getElementById('reset-settings');
        
        // 显示设置面板
        const showSettings = () => {
            settingsPanel.style.display = 'flex';
            this.initSettingsForm();
        };
        
        // 隐藏设置面板
        const hideSettings = () => {
            settingsPanel.style.display = 'none';
        };
        
        // 绑定显示/隐藏事件
        if (settingsToggle) {
            settingsToggle.addEventListener('click', showSettings);
        }
        
        if (settingsOverlay) {
            settingsOverlay.addEventListener('click', hideSettings);
        }
        
        if (closeSettings) {
            closeSettings.addEventListener('click', hideSettings);
        }
        
        // 绑定保存设置事件
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
                hideSettings();
            });
        }
        
        // 绑定重置设置事件
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                if (confirm('确定要重置所有设置为默认值吗？')) {
                    this.resetSettings();
                    this.initSettingsForm();
                }
            });
        }
    }
    
    /**
     * 初始化设置表单
     */
    initSettingsForm() {
        // 主题模式
        const themeModeSelect = document.getElementById('theme-mode');
        if (themeModeSelect) {
            themeModeSelect.value = this.config.themeMode;
        }
        
        // 语言设置
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.value = this.config.language;
        }
        
        // 导出格式
        const exportFormatSelect = document.getElementById('export-format');
        if (exportFormatSelect) {
            exportFormatSelect.value = this.config.exportFormat;
        }
        
        // 表格布局
        const tableLayoutSelect = document.getElementById('table-layout');
        if (tableLayoutSelect) {
            tableLayoutSelect.value = this.config.tableLayout || 'vertical';
        }
        
        // 竖列表格每页数量
        const verticalPageSizeInput = document.getElementById('vertical-page-size');
        if (verticalPageSizeInput) {
            verticalPageSizeInput.value = this.config.verticalPageSize || 50;
        }
        
        // 横列表格每页数量
        const horizontalPageSizeInput = document.getElementById('horizontal-page-size');
        if (horizontalPageSizeInput) {
            horizontalPageSizeInput.value = this.config.horizontalPageSize || 50;
        }
        
        // 显示进度
        const showProgressCheckbox = document.getElementById('show-progress');
        if (showProgressCheckbox) {
            showProgressCheckbox.checked = this.config.showProgress;
        }
        
        // 生成详细报告
        const generateDetailedReportCheckbox = document.getElementById('generate-detailed-report');
        if (generateDetailedReportCheckbox) {
            generateDetailedReportCheckbox.checked = this.config.generateDetailedReport;
        }
        
        // 自动打开浏览器
        const autoOpenBrowserCheckbox = document.getElementById('auto-open-browser');
        if (autoOpenBrowserCheckbox) {
            autoOpenBrowserCheckbox.checked = this.config.autoOpenBrowser;
        }
        
        // 自动添加baseGame文件夹
        const includeOfficialContentCheckbox = document.getElementById('include-official-content');
        if (includeOfficialContentCheckbox) {
            includeOfficialContentCheckbox.checked = this.config.includeOfficialContent;
        }
        
        // 自动添加DLC初阳文件夹
        const includeDlcContentCheckbox = document.getElementById('include-dlc-content');
        if (includeDlcContentCheckbox) {
            includeDlcContentCheckbox.checked = this.config.includeDlcContent;
        }
        
        // 自动加载默认数据
        const autoLoadDefaultDataCheckbox = document.getElementById('auto-load-default-data');
        if (autoLoadDefaultDataCheckbox) {
            autoLoadDefaultDataCheckbox.checked = this.config.autoLoadDefaultData;
        }
        
        // 透明度设置
        const opacity = this.config.opacity || 85;
        const opacitySlider = document.getElementById('opacity-slider');
        const opacityInput = document.getElementById('opacity-input');
        if (opacitySlider) {
            opacitySlider.value = opacity;
        }
        if (opacityInput) {
            opacityInput.value = opacity;
        }
        
        // 绑定透明度滑块和输入框的联动事件
        this.bindOpacityControls();
        
        // 开发者模式
        const developerModeCheckbox = document.getElementById('developer-mode');
        if (developerModeCheckbox) {
            // 首先检查sessionStorage中的开发者模式状态
            const sessionDeveloperMode = sessionStorage.getItem('developerMode') === 'true';
            // 如果sessionStorage中有值，使用它；否则使用config中的值
            const isDeveloperMode = sessionDeveloperMode || this.config.developerMode;
            developerModeCheckbox.checked = isDeveloperMode;
            this.toggleAppInfoEditability(isDeveloperMode);
        }
        
        // 应用信息
        const appNameInput = document.getElementById('app-name');
        const appVersionInput = document.getElementById('app-version');
        const appAuthorInput = document.getElementById('app-author');
        const appDescriptionTextarea = document.getElementById('app-description');
        
        if (appNameInput) appNameInput.value = this.config.projectName;
        if (appVersionInput) appVersionInput.value = this.config.version;
        if (appAuthorInput) appAuthorInput.value = this.config.author;
        if (appDescriptionTextarea) appDescriptionTextarea.value = this.config.description;
        
        // 绑定开发者模式切换事件
        this.bindDeveloperModeToggle();
    }
    
    /**
     * 绑定开发者模式切换事件
     */
    bindDeveloperModeToggle() {
        const developerModeCheckbox = document.getElementById('developer-mode');
        if (developerModeCheckbox) {
            developerModeCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                
                // 如果是开启开发者模式，需要验证密码
                if (isChecked) {
                    // 使用自定义对话框替代prompt()
                    this.showDeveloperPasswordDialog()
                        .then(password => {
                            if (configManager.verifyDeveloperPassword(password)) {
                                this.toggleAppInfoEditability(true);
                                // 保存开发者模式状态到sessionStorage
                                sessionStorage.setItem('developerMode', 'true');
                            } else {
                                // 密码错误，恢复原状
                                e.target.checked = false;
                                this.showAlert('密码错误，无法开启开发者模式！');
                            }
                        })
                        .catch(() => {
                            // 用户取消，恢复原状
                            e.target.checked = false;
                        });
                } else {
                    // 关闭开发者模式，直接切换
                    this.toggleAppInfoEditability(false);
                    // 从sessionStorage中移除开发者模式状态
                    sessionStorage.removeItem('developerMode');
                }
            });
        }
    }
    
    /**
     * 绑定透明度控制事件
     */
    bindOpacityControls() {
        const opacitySlider = document.getElementById('opacity-slider');
        const opacityInput = document.getElementById('opacity-input');
        
        // 同步滑块和输入框的值
        const syncOpacityValues = (value) => {
            const opacity = parseInt(value);
            if (opacitySlider) {
                opacitySlider.value = opacity;
            }
            if (opacityInput) {
                opacityInput.value = opacity;
            }
            // 实时应用透明度变化
            this.applyOpacity(opacity);
        };
        
        // 滑块变化事件
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                syncOpacityValues(e.target.value);
            });
        }
        
        // 输入框变化事件
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                syncOpacityValues(e.target.value);
            });
        }
    }
    
    /**
     * 应用透明度变化
     * @param {number} opacity - 透明度值（0-100）
     */
    applyOpacity(opacity) {
        const main = document.querySelector('main');
        if (main) {
            main.style.opacity = opacity / 100;
        }
    }
    
    /**
     * 显示开发者密码对话框
     * @returns {Promise<string>} 用户输入的密码
     */
    showDeveloperPasswordDialog() {
        return new Promise((resolve, reject) => {
            // 先移除已存在的开发者密码对话框，防止重叠
            const existingDialogs = document.querySelectorAll('.developer-password-dialog');
            existingDialogs.forEach(dialog => {
                dialog.remove();
            });
            
            // 创建对话框元素
            const dialog = document.createElement('div');
            dialog.className = 'developer-password-dialog';
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;
            
            // 创建对话框内容
            const dialogContent = document.createElement('div');
            dialogContent.style.cssText = `
                background: var(--bg-primary);
                padding: 30px;
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-lg);
                width: 90%;
                max-width: 400px;
                border: 1px solid var(--border-color);
                animation: fadeInUp 0.3s ease-out;
            `;
            
            // 创建对话框HTML
            dialogContent.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 20px; color: var(--text-primary); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold);">开发者模式验证</h3>
                <div style="margin-bottom: 20px;">
                    <label for="dev-password" style="display: block; margin-bottom: 8px; font-weight: var(--font-weight-bold); color: var(--text-primary);">请输入开发者密码：</label>
                    <input type="password" id="dev-password" style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: var(--border-radius-md); font-size: 16px; background: var(--bg-primary); color: var(--text-primary); transition: all var(--transition-base); font-family: var(--font-family);">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="dev-cancel" style="padding: 12px 24px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); font-size: 16px; cursor: pointer; transition: all var(--transition-base); font-family: var(--font-family); font-weight: var(--font-weight-medium);">取消</button>
                    <button id="dev-confirm" style="padding: 12px 24px; background: var(--primary-gradient); color: white; border: none; border-radius: var(--border-radius-md); font-size: 16px; cursor: pointer; transition: all var(--transition-base); font-family: var(--font-family); font-weight: var(--font-weight-medium);">确定</button>
                </div>
            `;
            
            // 添加到对话框
            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);
            
            // 获取元素
            const passwordInput = dialogContent.querySelector('#dev-password');
            const cancelBtn = dialogContent.querySelector('#dev-cancel');
            const confirmBtn = dialogContent.querySelector('#dev-confirm');
            
            // 聚焦密码输入框
            passwordInput.focus();
            
            // 事件处理
            const handleCancel = () => {
                dialogContent.style.animation = 'fadeOutDown 0.3s ease-out forwards';
                setTimeout(() => {
                    document.body.removeChild(dialog);
                    reject(new Error('用户取消'));
                }, 300);
            };
            
            const handleConfirm = () => {
                const password = passwordInput.value;
                dialogContent.style.animation = 'fadeOutDown 0.3s ease-out forwards';
                setTimeout(() => {
                    document.body.removeChild(dialog);
                    resolve(password);
                }, 300);
            };
            
            // 添加交互效果
            passwordInput.addEventListener('focus', () => {
                passwordInput.style.borderColor = 'var(--primary-color)';
                passwordInput.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            });
            
            passwordInput.addEventListener('blur', () => {
                passwordInput.style.borderColor = 'var(--border-color)';
                passwordInput.style.boxShadow = 'none';
            });
            
            cancelBtn.addEventListener('mouseover', () => {
                cancelBtn.style.background = 'var(--bg-light)';
                cancelBtn.style.transform = 'translateY(-2px)';
                cancelBtn.style.boxShadow = 'var(--shadow-sm)';
            });
            
            cancelBtn.addEventListener('mouseout', () => {
                cancelBtn.style.background = 'var(--bg-secondary)';
                cancelBtn.style.transform = 'translateY(0)';
                cancelBtn.style.boxShadow = 'none';
            });
            
            confirmBtn.addEventListener('mouseover', () => {
                confirmBtn.style.transform = 'translateY(-2px)';
                confirmBtn.style.boxShadow = 'var(--shadow-md)';
            });
            
            confirmBtn.addEventListener('mouseout', () => {
                confirmBtn.style.transform = 'translateY(0)';
                confirmBtn.style.boxShadow = 'none';
            });
            
            // 绑定事件
            cancelBtn.addEventListener('click', handleCancel);
            confirmBtn.addEventListener('click', handleConfirm);
            
            // 回车键确认
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            // 点击对话框外部关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    handleCancel();
                }
            });
        });
    }
    
    /**
     * 显示警告消息
     * @param {string} message - 警告消息
     */
    showAlert(message) {
        // 创建警告元素
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            padding: 30px;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10001;
            max-width: 90%;
            text-align: center;
            border: 1px solid var(--border-color);
            animation: fadeInUp 0.3s ease-out;
        `;
        
        alert.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px; color: var(--text-primary);">${message}</div>
            <button id="alert-ok" style="padding: 12px 24px; background: var(--primary-gradient); color: white; border: none; border-radius: var(--border-radius-md); font-size: 16px; cursor: pointer; transition: all var(--transition-base); box-shadow: var(--shadow-sm);">确定</button>
        `;
        
        document.body.appendChild(alert);
        
        // 绑定事件
        const okBtn = alert.querySelector('#alert-ok');
        okBtn.addEventListener('click', () => {
            alert.style.animation = 'fadeOutDown 0.3s ease-out forwards';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        });
    }
    
    /**
     * 切换应用信息字段的可编辑性
     * @param {boolean} editable - 是否可编辑
     */
    toggleAppInfoEditability(editable) {
        const appNameInput = document.getElementById('app-name');
        const appVersionInput = document.getElementById('app-version');
        const appAuthorInput = document.getElementById('app-author');
        const appDescriptionTextarea = document.getElementById('app-description');
        const testDatabaseBtn = document.getElementById('open-test-database');
        
        if (appNameInput) appNameInput.disabled = !editable;
        if (appVersionInput) appVersionInput.disabled = !editable;
        if (appAuthorInput) appAuthorInput.disabled = !editable;
        if (appDescriptionTextarea) appDescriptionTextarea.disabled = !editable;
        
        // 控制测试数据库按钮的显示/隐藏
        if (testDatabaseBtn) {
            testDatabaseBtn.style.display = editable ? 'inline-block' : 'none';
        }
    }
    
    /**
     * 保存设置
     */
    saveSettings() {
        // 获取表单值
        const themeMode = parseInt(document.getElementById('theme-mode').value);
        const language = document.getElementById('language').value;
        const exportFormat = document.getElementById('export-format').value;
        const tableLayout = document.getElementById('table-layout').value;
        const showProgress = document.getElementById('show-progress').checked;
        const generateDetailedReport = document.getElementById('generate-detailed-report').checked;
        const autoOpenBrowser = document.getElementById('auto-open-browser').checked;
        const includeOfficialContent = document.getElementById('include-official-content').checked;
        const includeDlcContent = document.getElementById('include-dlc-content').checked;
        const autoLoadDefaultData = document.getElementById('auto-load-default-data').checked;
        const developerMode = document.getElementById('developer-mode').checked;
        const opacity = parseInt(document.getElementById('opacity-slider').value) || 85;
        const verticalPageSize = parseInt(document.getElementById('vertical-page-size').value) || 50;
        const horizontalPageSize = parseInt(document.getElementById('horizontal-page-size').value) || 50;
        
        // 应用信息
        const appName = document.getElementById('app-name').value;
        const appVersion = document.getElementById('app-version').value;
        const appAuthor = document.getElementById('app-author').value;
        const appDescription = document.getElementById('app-description').value;
        
        // 保存开发者模式状态到sessionStorage，只在当前浏览器会话中保持
        if (developerMode) {
            sessionStorage.setItem('developerMode', 'true');
        } else {
            sessionStorage.removeItem('developerMode');
        }
        
        // 更新配置（不包含developerMode，因为它应该只在会话中保持）
        const newConfig = {
            themeMode,
            language,
            exportFormat,
            tableLayout,
            showProgress,
            generateDetailedReport,
            autoOpenBrowser,
            includeOfficialContent,
            includeDlcContent,
            autoLoadDefaultData,
            opacity,
            verticalPageSize,
            horizontalPageSize,
            projectName: appName,
            version: appVersion,
            author: appAuthor,
            description: appDescription
        };
        
        // 应用主题变更
        this.config.themeMode = themeMode;
        this.setupThemeMode();
        
        // 应用语言变更
        this.config.language = language;
        this.applyTranslations();
        
        // 更新其他配置
        Object.assign(this.config, newConfig);
        
        // 保存配置
        this.saveConfig();
        
        // 触发表格布局热更新
        if (this.renderer && typeof this.renderer.updateTableLayout === 'function') {
            this.renderer.updateTableLayout();
        }
        
        // 根据新的includeOfficialContent设置重新处理baseGame文件夹
        if (this.config.includeOfficialContent) {
            this.autoAddBaseGameFolder();
        } else {
            // 如果关闭了自动添加，移除已添加的baseGame文件夹
            const currentFolders = this.uploader.getSelectedFolders();
            const baseGameIndex = currentFolders.findIndex(folder => folder.name === 'baseGame');
            if (baseGameIndex !== -1) {
                this.uploader.removeFolder(baseGameIndex);
            }
        }
        
        // 根据新的includeDlcContent设置重新处理DLC初阳文件夹
        if (this.config.includeDlcContent) {
            this.autoAddDlcFolder();
        } else {
            // 如果关闭了自动添加，移除已添加的DLC初阳文件夹
            const currentFolders = this.uploader.getSelectedFolders();
            const dlcIndex = currentFolders.findIndex(folder => folder.name === '初阳');
            if (dlcIndex !== -1) {
                this.uploader.removeFolder(dlcIndex);
            }
        }
        

    }
    
    /**
     * 重置设置
     */
    resetSettings() {
        // 重置配置为默认值
        this.config = configManager.get();
        
        // 应用主题变更
        this.setupThemeMode();
        
        // 应用语言变更
        this.applyTranslations();
        
        // 保存配置
        this.saveConfig();
        

    }

    /**
     * 添加清理按钮
     */
    addClearButton() {
        const uploadSection = document.querySelector('.upload-section');
        
        // 检查清理按钮是否已存在
        if (!document.getElementById('clear-btn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clear-btn';
            clearBtn.className = 'clear-btn';
            clearBtn.textContent = configManager.t('clearBtn');
            
            // 添加样式
            clearBtn.style.cssText = `
                margin-top: 10px;
                width: 100%;
                padding: 10px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            clearBtn.addEventListener('mouseover', () => {
                clearBtn.style.background = '#5a6268';
                clearBtn.style.transform = 'translateY(-2px)';
            });
            
            clearBtn.addEventListener('mouseout', () => {
                clearBtn.style.background = '#6c757d';
                clearBtn.style.transform = 'translateY(0)';
            });
            
            // 添加到上传区域
            uploadSection.appendChild(clearBtn);
            this.clearBtn = clearBtn;
        }
    }

    bindEvents() {
        // 分析按钮点击事件（兼容新旧按钮）
        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', () => this.startAnalysis());
        }
        
        // 清理按钮点击事件
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearFolders());
        }
        
        // 文件夹选择变化事件
        this.uploader.setOnFolderChange((folders) => {
            this.renderer.updateFolderStats(folders);
        });
        
        // 文件夹移除事件
        this.renderer.setOnFolderRemove((index) => {
            this.uploader.removeFolder(index);
        });
        
        // 进度更新事件
        this.analyzer.setOnProgressUpdate((progress) => {
            this.renderer.updateProgress(
                `正在分析: ${progress.currentMod} (${progress.processed}/${progress.total})`,
                progress.progress
            );
        });
        
        // 暗夜模式切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // 初始化图标状态
            const lightIcon = themeToggle.querySelector('.light-icon');
            const darkIcon = themeToggle.querySelector('.dark-icon');
            if (lightIcon && darkIcon) {
                if (document.body.classList.contains('dark-mode')) {
                    lightIcon.style.display = 'none';
                    darkIcon.style.display = 'inline';
                } else {
                    lightIcon.style.display = 'inline';
                    darkIcon.style.display = 'none';
                }
            }
            
            themeToggle.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark-mode');
                const newThemeMode = isDark ? 1 : 0; // 0-永昼，1-永夜
                
                // 更新配置
                this.config.themeMode = newThemeMode;
                
                // 保存完整配置到localStorage
                this.saveConfig();
                
                // 更新图标
                if (lightIcon && darkIcon) {
                    if (isDark) {
                        lightIcon.style.display = 'none';
                        darkIcon.style.display = 'inline';
                    } else {
                        lightIcon.style.display = 'inline';
                        darkIcon.style.display = 'none';
                    }
                }
                
                console.log('主题模式已切换为:', newThemeMode === 1 ? '永夜模式' : '永昼模式');
            });
        }
        
        // 简繁切换
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                // 获取当前按钮文本，并去除空格
                const currentText = languageToggle.textContent.trim();
                
                // 确定新语言和新文本，确保逻辑健壮性
                const isSimplified = currentText === '简';
                const newLanguage = isSimplified ? 'zh-tw' : 'zh-cn';
                const newText = isSimplified ? '繁' : '简';
                
                // 更新按钮文本
                languageToggle.textContent = newText;
                
                // 更新配置
                this.config.language = newLanguage;
                this.saveConfig();
                
                // 应用翻译
                this.applyTranslations();
                
                console.log('语言已切换为:', newLanguage, '按钮文本:', newText);
            });
        }
        
        // 导出报告
        const exportReport = document.getElementById('export-report');
        if (exportReport) {
            exportReport.addEventListener('click', () => {
                this.exportReport();
            });
        }
        
        // 设置面板相关事件
        this.setupSettingsPanel();
        
        // 绑定开发者工具事件
        this.bindDeveloperToolsEvents();
    }
    
    /**
     * 绑定开发者工具事件
     */
    bindDeveloperToolsEvents() {
        // 打开ID数据库测试页面按钮
        const openTestDatabaseBtn = document.getElementById('open-test-database');
        if (openTestDatabaseBtn) {
            openTestDatabaseBtn.addEventListener('click', () => {
                // 在新窗口打开测试页面
                window.open('test-database.html', '_blank', 'width=900,height=800,top=100,left=100');
            });
        }
    }
    
    /**
     * 导出报告
     */
    async exportReport() {
        // 检查是否已生成分析结果
        if (!document.querySelector('.result-section')) {
            alert('请先进行分析，生成结果后再导出报告');
            return;
        }
        
        // 显示导出格式选择对话框
        const exportFormat = await this.showExportFormatDialog();
        
        if (!exportFormat) {
            return; // 用户取消导出
        }
        
        // 根据选择的格式导出报告
        switch (exportFormat) {
            case 'json':
                this.exportAsJSON();
                break;
            case 'markdown':
            default:
                this.exportAsMarkdown();
                break;
        }
    }
    
    /**
     * 显示导出格式选择对话框
     * @returns {string|null} 选择的导出格式，取消则返回null
     */
    showExportFormatDialog() {
        // 创建对话框HTML
        const dialogHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: var(--font-family);
            ">
                <div style="
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--spacing-xl);
                    width: 90%;
                    max-width: 500px;
                    box-shadow: var(--shadow-lg);
                    animation: fadeIn 0.3s ease-out;
                ">
                    <h3 style="
                        color: var(--text-primary);
                        margin: 0 0 var(--spacing-lg) 0;
                        font-size: var(--font-size-xl);
                        text-align: center;
                    ">选择导出格式</h3>
                    <div style="
                        display: grid;
                        gap: var(--spacing-md);
                        margin-bottom: var(--spacing-xl);
                    ">
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: var(--spacing-md);
                            padding: var(--spacing-md);
                            border: 2px solid var(--border-color);
                            border-radius: var(--border-radius-md);
                            cursor: pointer;
                            transition: all var(--transition-base);
                        " data-format="markdown">
                            <input type="radio" name="export-format" value="markdown" style="
                                width: 20px;
                                height: 20px;
                                accent-color: var(--primary-color);
                            " checked>
                            <div style="flex: 1;">
                                <div style="font-weight: var(--font-weight-bold); color: var(--text-primary);">Markdown文档</div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">结构化的文本报告，适合编辑和分享</div>
                            </div>
                        </label>
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: var(--spacing-md);
                            padding: var(--spacing-md);
                            border: 2px solid var(--border-color);
                            border-radius: var(--border-radius-md);
                            cursor: pointer;
                            transition: all var(--transition-base);
                        " data-format="json">
                            <input type="radio" name="export-format" value="json" style="
                                width: 20px;
                                height: 20px;
                                accent-color: var(--primary-color);
                            ">
                            <div style="flex: 1;">
                                <div style="font-weight: var(--font-weight-bold); color: var(--text-primary);">JSON数据</div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">原始数据，适合进一步处理和分析</div>
                            </div>
                        </label>
                    </div>
                    <div style="
                        display: flex;
                        gap: var(--spacing-md);
                        justify-content: flex-end;
                    ">
                        <button id="cancel-export" style="
                            padding: var(--spacing-sm) var(--spacing-lg);
                            background: var(--bg-secondary);
                            color: var(--text-primary);
                            border: 1px solid var(--border-color);
                            border-radius: var(--border-radius-md);
                            cursor: pointer;
                            transition: all var(--transition-base);
                            font-weight: var(--font-weight-medium);
                        ">取消</button>
                        <button id="confirm-export" style="
                            padding: var(--spacing-sm) var(--spacing-lg);
                            background: var(--primary-gradient);
                            color: white;
                            border: none;
                            border-radius: var(--border-radius-md);
                            cursor: pointer;
                            transition: all var(--transition-base);
                            font-weight: var(--font-weight-medium);
                        ">导出</button>
                    </div>
                </div>
            </div>
        `;
        
        // 创建并添加对话框到DOM
        const dialog = document.createElement('div');
        dialog.innerHTML = dialogHTML;
        document.body.appendChild(dialog);
        
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            label[data-format]:hover {
                border-color: var(--primary-color);
                background: var(--bg-secondary);
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            button:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            button:active {
                transform: translateY(0);
            }
        `;
        dialog.appendChild(style);
        
        // 返回Promise，等待用户选择
        return new Promise((resolve) => {
            // 确认按钮事件
            const confirmBtn = dialog.querySelector('#confirm-export');
            confirmBtn.addEventListener('click', () => {
                const selectedFormat = dialog.querySelector('input[name="export-format"]:checked').value;
                document.body.removeChild(dialog);
                resolve(selectedFormat);
            });
            
            // 取消按钮事件
            const cancelBtn = dialog.querySelector('#cancel-export');
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(null);
            });
            
            // 点击外部关闭对话框
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    document.body.removeChild(dialog);
                    resolve(null);
                }
            });
        });
    }
    
    /**
     * 导出报告为JSON格式
     */
    exportAsJSON() {
        console.log('开始导出JSON报告');
        
        // 检查是否需要生成详细报告
        const generateDetailed = configManager.get('generateDetailedReport') !== false;
        console.log('生成详细报告设置:', generateDetailed);
        
        // 收集分析结果数据
        const analysisData = {
            timestamp: new Date().toISOString(),
            version: '0.2.0beta',
            summary: {
                totalMods: document.querySelector('.summary-value')?.textContent || '0',
                duplicateIds: document.querySelectorAll('.duplicate-item').length.toString() || '0'
            },
            duplicateIds: Array.from(document.querySelectorAll('.duplicate-item')).map((item, index) => {
                const id = item.querySelector('.duplicate-id')?.textContent || '';
                const modules = Array.from(item.querySelectorAll('.module-item')).map(module => ({
                    moduleName: module.querySelector('.module-name')?.textContent || '',
                    modulePath: module.querySelector('.module-path')?.textContent || ''
                }));
                return {
                    id: id.trim(),
                    modules: modules
                };
            })
        };
        
        // 如果需要生成详细报告，添加模组详情
        if (generateDetailed) {
            analysisData.modDetails = Array.from(document.querySelectorAll('.mod-header')).map((header, index) => {
                const modTitle = header.querySelector('h5')?.textContent || '';
                const modName = header.querySelector('p')?.textContent || '';
                
                // 获取模组详情内容
                const content = header.nextElementSibling;
                if (!content) {
                    console.warn('[Export] 模组详情内容不存在:', modTitle);
                    return null;
                }
                
                // 展开模组详情以便获取内容
                const wasExpanded = content.style.display === 'block';
                if (!wasExpanded) {
                    content.style.display = 'block';
                }
                
                // 收集模组统计信息
                const stats = {};
                // 注意：模组详情中的统计信息不是使用.summary-item类，而是直接在div中
                const statRows = content.querySelectorAll('div[style*="font-size: 1.2rem; font-weight: 600"]');
                statRows.forEach((valueElement, i) => {
                    // 找到对应的标签元素（在valueElement的前一个兄弟元素）
                    const labelElement = valueElement.previousElementSibling;
                    if (labelElement) {
                        const label = labelElement.textContent.replace(':', '');
                        const value = valueElement.textContent;
                        stats[label] = value;
                    }
                });
                
                // 收集重复ID信息
                const duplicateIds = [];
                // 注意：模组详情中的重复ID列表不是使用.duplicate-section类，而是直接在div中
                const duplicateIdSections = content.querySelectorAll('strong[style*="color: var(--danger-color)"]');
                duplicateIdSections.forEach(section => {
                    const idType = section.textContent.replace('重复', '').replace('ID列表：', '');
                    // 找到包含重复ID的容器
                    const idContainer = section.nextElementSibling;
                    if (idContainer) {
                        const idSpans = idContainer.querySelectorAll('span[style*="background: var(--danger-light)"]');
                        idSpans.forEach(span => {
                            duplicateIds.push({
                                type: idType,
                                id: span.textContent.trim()
                            });
                        });
                    }
                });
                
                // 恢复原始状态
                if (!wasExpanded) {
                    content.style.display = 'none';
                }
                
                console.log('[Export] 收集到的模组详情:', {
                    title: modTitle,
                    name: modName,
                    stats: stats,
                    duplicateIds: duplicateIds
                });
                
                return {
                    title: modTitle,
                    name: modName,
                    stats: stats,
                    duplicateIds: duplicateIds
                };
            }).filter(Boolean);
            
            console.log('[Export] 总模组详情数量:', analysisData.modDetails.length);
        }
        
        // 创建JSON字符串
        const jsonString = JSON.stringify(analysisData, null, 2);
        console.log('JSON内容生成成功，长度:', jsonString.length);
        
        // 创建下载链接
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `模组分析报告_${timestamp}.json`;
        link.href = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
        link.style.display = 'none';
        
        // 添加到DOM并触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 提示导出成功
        console.log('JSON报告导出成功');
        alert('JSON报告导出成功！');
    }
    
    /**
     * 导出报告为Markdown格式
     */
    exportAsMarkdown() {
        console.log('开始导出Markdown报告');
        
        // 检查是否需要生成详细报告
        const generateDetailed = configManager.get('generateDetailedReport') !== false;
        console.log('生成详细报告设置:', generateDetailed);
        
        // 收集分析结果数据
        const timestamp = new Date().toISOString();
        const totalMods = document.querySelector('.summary-value')?.textContent || '0';
        const duplicateIds = document.querySelectorAll('.duplicate-item').length.toString() || '0';
        
        // 创建Markdown内容
        let markdownContent = `# 学生时代模组兼容分析报告

**生成时间**: ${new Date(timestamp).toLocaleString('zh-CN')}
**报告版本**: 0.2.0beta

## 分析摘要

- **分析模组数量**: ${totalMods}
- **重复ID总数**: ${duplicateIds}

## 详细结果

### 重复ID检测

`;
        
        // 添加重复ID信息
        const duplicateItems = document.querySelectorAll('.duplicate-item');
        duplicateItems.forEach((item, index) => {
            const id = item.querySelector('.duplicate-id')?.textContent || '';
            const modules = item.querySelectorAll('.module-item');
            
            markdownContent += `#### ${index + 1}. ${id.trim()}\n\n`;
            markdownContent += `| 模组名称 | 文件路径 |\n|---------|---------|\n`;
            
            modules.forEach(module => {
                const moduleName = module.querySelector('.module-name')?.textContent || '';
                const modulePath = module.querySelector('.module-path')?.textContent || '';
                markdownContent += `| ${moduleName} | ${modulePath} |\n`;
            });
            
            markdownContent += `\n`;
        });
        
        // 如果需要生成详细报告，添加模组详情
        if (generateDetailed) {
            // 添加模组详情
            markdownContent += `## 模组详情\n\n`;
            
            // 获取模组详情
            const modHeaders = document.querySelectorAll('.mod-header');
            modHeaders.forEach((header, index) => {
                const modTitle = header.querySelector('h5')?.textContent || '';
                const modName = header.querySelector('p')?.textContent || '';
                
                markdownContent += `### ${index + 1}. ${modTitle}\n\n`;
                markdownContent += `**模组名称**: ${modName}\n\n`;
                
                // 获取模组详情内容
                const content = header.nextElementSibling;
                if (content) {
                    // 展开模组详情以便获取内容
                    const wasExpanded = content.style.display === 'block';
                    if (!wasExpanded) {
                        content.style.display = 'block';
                    }
                    
                    // 收集模组统计信息
                    markdownContent += `#### 模组统计\n\n`;
                    // 注意：模组详情中的统计信息不是使用.summary-item类，而是直接在div中
                    const statRows = content.querySelectorAll('div[style*="font-size: 1.2rem; font-weight: 600"]');
                    if (statRows.length > 0) {
                        markdownContent += `| 统计项 | 数值 |\n|-------|------|\n`;
                        statRows.forEach((valueElement, i) => {
                            // 找到对应的标签元素（在valueElement的前一个兄弟元素）
                            const labelElement = valueElement.previousElementSibling;
                            if (labelElement) {
                                const label = labelElement.textContent.replace(':', '');
                                const value = valueElement.textContent;
                                markdownContent += `| ${label} | ${value} |\n`;
                            }
                        });
                        markdownContent += `\n`;
                    } else {
                        markdownContent += `无统计信息\n\n`;
                    }
                    
                    // 收集重复ID信息
                    // 注意：模组详情中的重复ID列表不是使用.duplicate-section类，而是直接在div中
                    const duplicateIdSections = content.querySelectorAll('strong[style*="color: var(--danger-color)"]');
                    if (duplicateIdSections.length > 0) {
                        duplicateIdSections.forEach(section => {
                            const idType = section.textContent.replace('重复', '').replace('ID列表：', '');
                            // 找到包含重复ID的容器
                            const idContainer = section.nextElementSibling;
                            if (idContainer) {
                                const idSpans = idContainer.querySelectorAll('span[style*="background: var(--danger-light)"]');
                                if (idSpans.length > 0) {
                                    markdownContent += `#### 重复${idType}ID\n\n`;
                                    markdownContent += `| 重复ID |\n|-------|\n`;
                                    idSpans.forEach(span => {
                                        markdownContent += `| ${span.textContent.trim()} |\n`;
                                    });
                                    markdownContent += `\n`;
                                }
                            }
                        });
                    } else {
                        markdownContent += `无重复ID\n\n`;
                    }
                    
                    // 恢复原始状态
                    if (!wasExpanded) {
                        content.style.display = 'none';
                    }
                }
                
                markdownContent += `---\n\n`;
            });
        }
        
        console.log('Markdown内容生成成功，长度:', markdownContent.length);
        
        // 创建下载链接
        const link = document.createElement('a');
        const fileTimestamp = timestamp.slice(0, 19).replace(/:/g, '-');
        link.download = `模组分析报告_${fileTimestamp}.md`;
        link.href = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdownContent)}`;
        link.style.display = 'none';
        
        // 添加到DOM并触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 提示导出成功
        console.log('Markdown报告导出成功');
        alert('Markdown报告导出成功！');
    }

    /**
     * 开始分析
     */
    async startAnalysis() {
        const folders = this.uploader.getSelectedFolders();
        
        if (folders.length === 0) {
            alert('请先选择模组文件夹');
            return;
        }
        
        // 显示进度条
        this.showProgressBar('准备分析...', 0);
        
        try {
            // 从uploader中获取所有文件
            const allFiles = this.uploader.getAllFiles();
            
            console.log(`=== 开始分析 ===`);
            console.log(`文件夹数量: ${folders.length}`);
            console.log(`文件数量: ${allFiles.length}`);
            
            // 加载用户上传的文件到数据库
            this.updateProgressBar('加载用户上传文件到数据库...', 10);
            await this.loadUserFilesToDatabase(allFiles);
            
            // 开始分析
            this.updateProgressBar('开始分析...', 50);
            const result = await this.analyzer.analyze(folders, allFiles);
            
            // 显示成功进度条
            this.showSuccessProgressBar('分析完成！');
            
            // 渲染结果
            this.renderer.renderResults(result);
        } catch (error) {
            console.error('分析出错:', error);
            // 显示错误进度条
            this.showErrorProgressBar(`分析失败: ${error.message}`);
            alert('分析出错: ' + error.message);
        }
    }
    
    /**
     * 加载用户上传的文件到数据库
     * @param {File[]} files 用户上传的文件列表
     */
    async loadUserFilesToDatabase(files) {
        // 获取所有支持的ID类型
        const supportedTypes = this.idDatabase.getTypes();
        
        // 过滤出可能包含ID数据的文件
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            return;
        }
        
        let processedFiles = 0;
        const totalFiles = jsonFiles.length;
        
        // 并行处理文件，提高效率
        const loadPromises = jsonFiles.map(async (file) => {
            try {
                // 根据文件名确定文件类型
                for (const type of supportedTypes) {
                    const typeConfig = this.idDatabase.getTypeConfig(type);
                    if (typeConfig && this.matchFileName(file.name, typeConfig.fileName)) {
                        // 加载文件到数据库
                        await this.idDatabase.loadDataFromUserFile(file, type);
                        break;
                    }
                }
            } catch (error) {
                console.error(`加载文件 ${file.name} 时出错:`, error);
            } finally {
                processedFiles++;
                // 更新进度
                const progress = Math.min(40, Math.round((processedFiles / totalFiles) * 40));
                this.updateProgressBar(`加载用户文件: ${processedFiles}/${totalFiles}`, 10 + progress);
            }
        });
        
        // 等待所有文件加载完成
        await Promise.all(loadPromises);
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
            return regex.test(fileName);
        } catch (error) {
            console.error(`匹配文件名时出错:`, error);
            return false;
        }
    }

    /**
     * 清理已选择的文件夹
     */
    clearFolders() {
        if (confirm('确定要清理所有已选择的文件夹吗？')) {
            // 清空上传器中的文件夹
            this.uploader.clearFolders();
            
            // 重置文件输入
            this.uploader.folderInput.value = '';
            
            // 重置UI
            this.renderer.updateFolderStats([]);
            
            // 清空结果
            this.renderer.duplicateList.innerHTML = '';
            this.renderer.summaryContent.innerHTML = '';
            this.renderer.duplicateSection.style.display = 'none';
        }
    }
    
    /**
     * 等待所有资源就绪
     */
    async waitForAssetsReady() {
        // 等待图片加载完成
        const imgs = Array.from(document.querySelectorAll('img'));
        const imgPromises = imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // 即使图片加载失败也继续
            });
        });
        await Promise.all(imgPromises);
        
        // 等待字体加载完成
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        
        console.log('所有资源已就绪');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ModEventApp();
});
