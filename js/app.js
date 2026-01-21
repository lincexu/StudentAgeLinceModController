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
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 解析JSONC格式（带注释的JSON）
     * @param {string} jsoncString JSONC格式字符串
     * @returns {Object} 解析后的JSON对象
     */
    parseJSONC(jsoncString) {
        // 移除单行注释和多行注释
        let cleaned = jsoncString
            // 移除单行注释 // ...
            .replace(/\/\/.*$/gm, '')
            // 移除多行注释 /* ... */
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // 移除多余的空白字符
            .trim();
        
        try {
            // 尝试直接解析
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('JSON解析失败，尝试清理控制字符:', error);
            
            // 清理JSON字符串中的控制字符（保留必要的换行和制表符）
            cleaned = cleaned
                // 移除控制字符，但保留\n, \r, \t
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                // 移除多余的换行和空格
                .replace(/\s+/g, ' ');
            
            console.log('清理后的JSON字符串:', cleaned);
            
            // 再次尝试解析
            return JSON.parse(cleaned);
        }
    }

    /**
     * 加载配置
     */
    async loadConfig() {
        try {
            let config = null;
            
            // 1. 优先从localStorage加载配置
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                console.log('从localStorage加载配置');
                config = JSON.parse(savedConfig);
            } 
            // 2. 尝试从配置文件加载
            else {
                try {
                    console.log('尝试从配置文件加载配置');
                    const response = await fetch('config.jsonc', {
                        cache: 'no-cache'
                    });
                    if (response.ok) {
                        const jsoncText = await response.text();
                        config = this.parseJSONC(jsoncText);
                        localStorage.setItem('appConfig', JSON.stringify(config));
                        console.log('从配置文件加载配置成功:', config);
                    } else {
                        console.log('配置文件加载失败，使用默认配置');
                    }
                } catch (error) {
                    console.log('无法加载配置文件，使用默认配置:', error.message);
                }
            }
            
            // 3. 如果以上方法都失败，使用默认配置
            if (!config) {
                console.log('使用默认配置');
                config = {
                    projectName: "Student Age LMC",
                    author: "Lince",
                    version: "0.1.0",
                    description: "学生时代模组兼容分析工具，用于检测模组中的重复ID",
                    themeMode: 3
                };
            }
            
            this.config = config;
            console.log('配置加载成功:', this.config);
        } catch (error) {
            console.error('加载配置失败:', error);
            // 使用默认配置
            this.config = {
                projectName: "Student Age LMC",
                author: "Lince",
                version: "0.1.0",
                description: "学生时代模组兼容分析工具，用于检测模组中的重复ID",
                themeMode: 3
            };
            console.log('使用默认配置:', this.config);
        }
    }
    
    /**
     * 保存配置到localStorage
     */
    saveConfig() {
        localStorage.setItem('appConfig', JSON.stringify(this.config));
        console.log('配置已保存到localStorage:', this.config);
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
     * 添加清理按钮
     */
    addClearButton() {
        const uploadSection = document.querySelector('.upload-section');
        
        // 检查清理按钮是否已存在
        if (!document.getElementById('clear-btn')) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clear-btn';
            clearBtn.className = 'clear-btn';
            clearBtn.textContent = '清理已选择的文件夹';
            
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
                if (currentText === '简') {
                    languageToggle.textContent = '繁';
                    // 这里可以添加简繁切换的实现
                    // 由于简繁切换需要复杂的库支持，这里仅实现UI切换
                } else {
                    languageToggle.textContent = '简';
                }
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
    }
    
    /**
     * 导出报告为PNG图片
     */
    exportReport() {
        const container = document.body;
        if (!document.querySelector('.result-section')) {
            alert('请先进行分析，生成结果后再导出报告');
            return;
        }
        
        // 使用html2canvas将整个页面转换为图片
        html2canvas(container, {
            backgroundColor: document.body.classList.contains('dark-mode') ? '#1a1a1a' : '#ffffff',
            scale: 2, // 提高图片质量
            logging: false,
            // 只导出可见区域的内容，确保包含所有分析结果和底部信息
            y: 0,
            x: 0,
            width: container.scrollWidth,
            height: container.scrollHeight
        }).then(canvas => {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `模组分析报告_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('导出报告失败:', error);
            alert('导出报告失败，请查看控制台');
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
