// 主应用模块
class ModEventApp {
    constructor() {
        this.uploader = null;
        this.analyzer = null;
        this.renderer = null;
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
        
        // 添加清理按钮
        this.addClearButton();
        
        // 设置主题模式
        this.setupThemeMode();
        
        // 更新底部版本信息
        this.updateFooterVersion();
        
        // 应用翻译
        this.applyTranslations();
        
        // 绑定事件
        this.bindEvents();
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
     * 更新底部版本信息
     */
    updateFooterVersion() {
        const versionElement = document.getElementById('footer-version');
        console.log('更新版本信息:', {
            versionElement: versionElement,
            configVersion: this.config.version,
            currentContent: versionElement ? versionElement.textContent : '未找到元素'
        });
        
        if (versionElement) {
            // 直接设置完整文本，确保版本号正确显示
            versionElement.textContent = `Student Age LMC v${this.config.version}`;
            console.log('版本信息更新后:', versionElement.textContent);
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
        
        // 开发者模式
        const developerModeCheckbox = document.getElementById('developer-mode');
        if (developerModeCheckbox) {
            developerModeCheckbox.checked = this.config.developerMode;
            this.toggleAppInfoEditability(this.config.developerMode);
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
                }
            });
        }
    }
    
    /**
     * 显示开发者密码对话框
     * @returns {Promise<string>} 用户输入的密码
     */
    showDeveloperPasswordDialog() {
        return new Promise((resolve, reject) => {
            // 创建对话框元素
            const dialog = document.createElement('div');
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
            `;
            
            // 创建对话框内容
            const dialogContent = document.createElement('div');
            dialogContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 400px;
            `;
            
            // 创建对话框HTML
            dialogContent.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #333;">开发者模式验证</h3>
                <div style="margin-bottom: 20px;">
                    <label for="dev-password" style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">请输入开发者密码：</label>
                    <input type="password" id="dev-password" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;" placeholder="输入密码">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="dev-cancel" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">取消</button>
                    <button id="dev-confirm" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">确定</button>
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
                document.body.removeChild(dialog);
                reject(new Error('用户取消'));
            };
            
            const handleConfirm = () => {
                const password = passwordInput.value;
                document.body.removeChild(dialog);
                resolve(password);
            };
            
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
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            max-width: 90%;
            text-align: center;
        `;
        
        alert.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 16px; color: #333;">${message}</div>
            <button id="alert-ok" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;">确定</button>
        `;
        
        document.body.appendChild(alert);
        
        // 绑定事件
        const okBtn = alert.querySelector('#alert-ok');
        okBtn.addEventListener('click', () => {
            document.body.removeChild(alert);
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
        
        if (appNameInput) appNameInput.disabled = !editable;
        if (appVersionInput) appVersionInput.disabled = !editable;
        if (appAuthorInput) appAuthorInput.disabled = !editable;
        if (appDescriptionTextarea) appDescriptionTextarea.disabled = !editable;
    }
    
    /**
     * 保存设置
     */
    saveSettings() {
        // 获取表单值
        const themeMode = parseInt(document.getElementById('theme-mode').value);
        const language = document.getElementById('language').value;
        const exportFormat = document.getElementById('export-format').value;
        const showProgress = document.getElementById('show-progress').checked;
        const generateDetailedReport = document.getElementById('generate-detailed-report').checked;
        const autoOpenBrowser = document.getElementById('auto-open-browser').checked;
        const developerMode = document.getElementById('developer-mode').checked;
        
        // 应用信息
        const appName = document.getElementById('app-name').value;
        const appVersion = document.getElementById('app-version').value;
        const appAuthor = document.getElementById('app-author').value;
        const appDescription = document.getElementById('app-description').value;
        
        // 更新配置
        const newConfig = {
            themeMode,
            language,
            exportFormat,
            showProgress,
            generateDetailedReport,
            autoOpenBrowser,
            developerMode,
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
        
        console.log('设置已保存:', this.config);
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
        
        console.log('设置已重置为默认值:', this.config);
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
        // 分析按钮点击事件
        this.analyzeBtn.addEventListener('click', () => this.startAnalysis());
        
        // 清理按钮点击事件
        this.clearBtn.addEventListener('click', () => this.clearFolders());
        
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
                const currentText = languageToggle.textContent;
                const newLanguage = currentText === '简' ? 'zh-tw' : 'zh-cn';
                const newText = currentText === '简' ? '繁' : '简';
                
                languageToggle.textContent = newText;
                
                // 更新配置
                this.config.language = newLanguage;
                this.saveConfig();
                
                // 应用翻译
                this.applyTranslations();
                
                console.log('语言已切换为:', newLanguage);
            });
        }
        
        // 导出报告
        const exportReport = document.getElementById('export-report');
        if (exportReport) {
            exportReport.addEventListener('click', () => {
                // 检查是否已加载html2canvas库
                if (typeof html2canvas === 'undefined') {
                    // 动态加载html2canvas库
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => {
                        this.exportReport();
                    };
                    document.head.appendChild(script);
                } else {
                    this.exportReport();
                }
            });
        }
        
        // 设置面板相关事件
        this.setupSettingsPanel();
    }
    
    /**
     * 导出报告为PNG图片
     */
    exportReport() {
        // 检查是否已生成分析结果
        if (!document.querySelector('.result-section')) {
            alert('请先进行分析，生成结果后再导出报告');
            return;
        }
        
        // 增加用户确认程序
        const confirmExport = confirm('确定要导出报告吗？\n\n导出过程可能需要几秒钟时间，取决于报告大小。\n导出的报告将保存为PNG图片格式。');
        
        if (!confirmExport) {
            return; // 用户取消导出
        }
        
        // 显示导出进度提示
        const progressSection = document.getElementById('progress-section');
        const progressText = document.getElementById('progress-text');
        const originalProgressDisplay = progressSection.style.display;
        const originalProgressText = progressText.textContent;
        
        progressSection.style.display = 'block';
        progressText.textContent = '正在准备导出报告...';
        
        // 使用html2canvas将整个页面转换为图片
        html2canvas(document.body, {
            backgroundColor: document.body.classList.contains('dark-mode') ? '#1a1a1a' : '#ffffff',
            scale: 2, // 提高图片质量
            logging: false,
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
        }).then(canvas => {
            // 更新进度提示
            progressText.textContent = '正在生成图片...';
            
            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `模组分析报告_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // 更新进度提示
            progressText.textContent = '正在下载报告...';
            
            // 触发下载
            link.click();
            
            // 恢复原始进度显示
            setTimeout(() => {
                progressSection.style.display = originalProgressDisplay;
                progressText.textContent = originalProgressText;
            }, 1000);
            
            // 提示导出成功
            alert('报告导出成功！');
        }).catch(error => {
            console.error('导出报告失败:', error);
            
            // 恢复原始进度显示
            progressSection.style.display = originalProgressDisplay;
            progressText.textContent = originalProgressText;
            
            // 提示导出失败
            alert('导出报告失败，请查看控制台获取详细信息');
        });
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
        this.renderer.showProgress();
        
        try {
            // 从uploader中获取所有文件
            const allFiles = this.uploader.getAllFiles();
            
            console.log(`=== 开始分析 ===`);
            console.log(`文件夹数量: ${folders.length}`);
            console.log(`文件数量: ${allFiles.length}`);
            
            // 开始分析
            const result = await this.analyzer.analyze(folders, allFiles);
            
            // 渲染结果
            this.renderer.renderResults(result);
        } catch (error) {
            console.error('分析出错:', error);
            this.renderer.updateProgress('分析出错，请查看控制台', 100);
            alert('分析出错: ' + error.message);
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
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ModEventApp();
});
