/**
 * CfgTool Documentation Viewer
 * A modular, dynamic Markdown document viewer
 */

// Application configuration
const CONFIG = {
    fileExtension: '.md',
    directoryPath: './',
    cacheEnabled: true,
    animationDuration: 300
};

/**
 * Document Manager - Handles document discovery and loading
 */
class DocumentManager {
    constructor() {
        this.documents = [];
        this.currentIndex = 0;
        this.cache = new Map();
    }

    /**
     * Discover all Markdown files in the directory
     * @returns {Promise<Array>} Array of document objects
     */
    async discoverDocuments() {
        try {
            // In a real server environment, this would be an API call
            // For static file serving, we use a predefined list or directory listing
            const response = await fetch('file-list.json').catch(() => null);
            
            if (response && response.ok) {
                const fileList = await response.json();
                this.documents = fileList
                    .filter(file => file.endsWith(CONFIG.fileExtension))
                    .map(file => this.createDocumentObject(file));
            } else {
                // Fallback: scan common document files
                this.documents = await this.scanDocuments();
            }

            // Sort documents alphabetically
            this.documents.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
            
            return this.documents;
        } catch (error) {
            console.error('[DocumentManager] Failed to discover documents:', error);
            throw new Error('无法发现文档文件');
        }
    }

    /**
     * Scan for Markdown documents (fallback method)
     * Dynamically discovers all .md files in the directory
     * @returns {Promise<Array>} Array of document objects
     */
    async scanDocuments() {
        const documents = [];
        
        try {
            // Try to get directory listing from server
            // This works with servers that support directory listing
            const dirResponse = await fetch(CONFIG.directoryPath);
            
            if (dirResponse.ok) {
                const dirHtml = await dirResponse.text();
                
                // Parse HTML directory listing to extract .md files
                const parser = new DOMParser();
                const doc = parser.parseFromString(dirHtml, 'text/html');
                
                // Look for links in directory listing
                const links = doc.querySelectorAll('a');
                
                for (const link of links) {
                    const href = link.getAttribute('href');
                    if (href && href.endsWith(CONFIG.fileExtension)) {
                        const filename = decodeURIComponent(href);
                        documents.push(this.createDocumentObject(filename));
                    }
                }
            }
        } catch (error) {
            console.log('[DocumentManager] Directory listing not available, trying alternative method');
        }
        
        // If no documents found via directory listing, try file-list.json
        if (documents.length === 0) {
            try {
                const response = await fetch('file-list.json');
                if (response.ok) {
                    const fileList = await response.json();
                    for (const filename of fileList) {
                        if (filename.endsWith(CONFIG.fileExtension)) {
                            documents.push(this.createDocumentObject(filename));
                        }
                    }
                }
            } catch (error) {
                console.log('[DocumentManager] file-list.json not available');
            }
        }
        
        // If still no documents, show empty state
        if (documents.length === 0) {
            console.warn('[DocumentManager] No markdown files found');
        }

        return documents;
    }

    /**
     * Create a document object from filename
     * @param {string} filename - The filename
     * @returns {Object} Document object
     */
    createDocumentObject(filename) {
        const nameWithoutExt = filename.replace(CONFIG.fileExtension, '');
        return {
            id: this.generateId(nameWithoutExt),
            filename: filename,
            title: nameWithoutExt,
            path: CONFIG.directoryPath + filename
        };
    }

    /**
     * Generate a unique ID from string
     * @param {string} str - Input string
     * @returns {string} Unique ID
     */
    generateId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    /**
     * Load document content
     * @param {number} index - Document index
     * @returns {Promise<string>} Document content
     */
    async loadDocument(index) {
        const doc = this.documents[index];
        if (!doc) {
            throw new Error('文档不存在');
        }

        // Check cache
        if (CONFIG.cacheEnabled && this.cache.has(doc.id)) {
            return this.cache.get(doc.id);
        }

        try {
            const response = await fetch(doc.path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            
            // Cache the content
            if (CONFIG.cacheEnabled) {
                this.cache.set(doc.id, content);
            }

            return content;
        } catch (error) {
            console.error(`[DocumentManager] Failed to load ${doc.filename}:`, error);
            throw new Error(`无法加载文档: ${doc.title}`);
        }
    }

    /**
     * Get current document
     * @returns {Object} Current document object
     */
    getCurrentDocument() {
        return this.documents[this.currentIndex];
    }

    /**
     * Set current document index
     * @param {number} index - Document index
     */
    setCurrentIndex(index) {
        if (index >= 0 && index < this.documents.length) {
            this.currentIndex = index;
        }
    }
}

/**
 * UI Controller - Handles UI rendering and interactions
 */
class UIController {
    constructor(documentManager) {
        this.docManager = documentManager;
        this.elements = {
            navList: document.getElementById('navList'),
            contentTitle: document.getElementById('titleText'),
            contentBody: document.getElementById('contentBody')
        };
    }

    /**
     * Render navigation menu
     */
    renderNavigation() {
        const { navList } = this.elements;
        navList.innerHTML = '';

        this.docManager.documents.forEach((doc, index) => {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';

            const navBtn = document.createElement('button');
            navBtn.className = 'nav-btn';
            navBtn.innerHTML = `
                <span class="file-icon">📄</span>
                <span>${doc.title}</span>
            `;
            navBtn.onclick = () => this.switchDocument(index);

            if (index === this.docManager.currentIndex) {
                navBtn.classList.add('active');
            }

            navItem.appendChild(navBtn);
            navList.appendChild(navItem);
        });
    }

    /**
     * Render document content
     * @param {string} content - Markdown content
     */
    renderContent(content) {
        const { contentTitle, contentBody } = this.elements;
        const currentDoc = this.docManager.getCurrentDocument();

        // Update title
        contentTitle.textContent = currentDoc.title;

        // Render markdown using existing MarkdownRenderer
        const markdownRenderer = window.markdownRenderer;
        let htmlContent;
        
        if (markdownRenderer) {
            htmlContent = markdownRenderer.render(content);
        } else {
            // Fallback to marked.js if MarkdownRenderer is not available
            htmlContent = marked.parse(content);
        }
        
        contentBody.innerHTML = `<div class="markdown-content fade-in">${htmlContent}</div>`;

        // Process sprite tags if spriteManager is available
        if (window.spriteManager) {
            window.spriteManager.processElement(contentBody);
        }

        // Apply syntax highlighting with highlight.js
        if (window.hljs) {
            contentBody.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.contentBody.innerHTML = `
            <div class="state-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">正在加载文档...</p>
            </div>
        `;
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.contentBody.innerHTML = `
            <div class="state-container">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">加载失败</h3>
                <p class="error-message">${message}</p>
                <button class="retry-btn" onclick="location.reload()">重新加载</button>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmpty() {
        this.elements.contentBody.innerHTML = `
            <div class="state-container">
                <div class="empty-icon">📂</div>
                <h3 class="empty-title">暂无文档</h3>
                <p class="empty-description">未找到任何 Markdown 文档文件</p>
            </div>
        `;
    }

    /**
     * Switch to a different document
     * @param {number} index - Document index
     */
    async switchDocument(index) {
        if (index === this.docManager.currentIndex) return;

        this.docManager.setCurrentIndex(index);
        this.renderNavigation();
        this.showLoading();

        try {
            const content = await this.docManager.loadDocument(index);
            this.renderContent(content);
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Update active navigation item
     */
    updateActiveNav() {
        const navBtns = this.elements.navList.querySelectorAll('.nav-btn');
        navBtns.forEach((btn, index) => {
            btn.classList.toggle('active', index === this.docManager.currentIndex);
        });
    }
}

/**
 * Application initialization
 */
async function initApp() {
    const docManager = new DocumentManager();
    const uiController = new UIController(docManager);

    try {
        // Discover documents
        const documents = await docManager.discoverDocuments();

        if (documents.length === 0) {
            uiController.showEmpty();
            return;
        }

        // Render navigation
        uiController.renderNavigation();

        // Load first document
        uiController.showLoading();
        const content = await docManager.loadDocument(0);
        uiController.renderContent(content);

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.index !== undefined) {
                uiController.switchDocument(e.state.index);
            }
        });

    } catch (error) {
        console.error('[App] Initialization failed:', error);
        uiController.showError('应用初始化失败: ' + error.message);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
