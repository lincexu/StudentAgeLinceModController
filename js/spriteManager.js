/**
 * 精灵图管理模块
 * 用于管理和渲染CSS精灵图表情
 * 配置文件: lib/data/sprite.json
 */

class SpriteManager {
    constructor() {
        // 默认配置（加载失败时使用）
        this.sprites = {};
        this.configLoaded = false;
        
        // 初始化CSS样式
        this.initStyles();
        
        // 加载配置
        this.loadConfig();
    }
    
    /**
     * 加载精灵图配置
     */
    async loadConfig() {
        try {
            const response = await fetch('lib/data/sprite.json', {
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.sprites) {
                    this.sprites = data.sprites;
                    // 将字符串ID的names转换为数字ID
                    for (const key in this.sprites) {
                        const sprite = this.sprites[key];
                        if (sprite.names) {
                            const numericNames = {};
                            for (const idStr in sprite.names) {
                                numericNames[parseInt(idStr, 10)] = sprite.names[idStr];
                            }
                            sprite.names = numericNames;
                        }
                    }
                    this.configLoaded = true;
                    console.log('[SpriteManager] 配置加载成功');
                    
                    // 配置加载完成后处理页面
                    this.processPage();
                }
            } else {
                throw new Error('无法加载sprite.json');
            }
        } catch (error) {
            console.error('[SpriteManager] 加载配置失败:', error);
            // 使用默认空配置
            this.sprites = {};
        }
    }
    
    /**
     * 初始化CSS样式
     */
    initStyles() {
        if (document.getElementById('sprite-manager-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'sprite-manager-styles';
        style.textContent = `
            .sprite-emoji {
                display: inline-block;
                background-repeat: no-repeat;
                vertical-align: middle;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }
            
            /* 表情精灵图尺寸 */
            .sprite-emoji-mini {
                width: 18px;
                height: 18px;
            }
            .sprite-emoji-small {
                width: 24px;
                height: 24px;
            }
            .sprite-emoji-medium {
                width: 36px;
                height: 36px;
            }
            .sprite-emoji-large {
                width: 72px;
                height: 72px;
            }
            
            /* 系统图标尺寸 */
            .sprite-icon-mini {
                width: 24px;
                height: 24px;
            }
            .sprite-icon-small {
                width: 32px;
                height: 32px;
            }
            .sprite-icon-medium {
                width: 64px;
                height: 64px;
            }
            .sprite-icon-large {
                width: 128px;
                height: 128px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 根据ID获取精灵图配置
     * @param {number} id 表情ID
     * @returns {Object|null} 精灵图配置和本地ID
     */
    getSpriteConfig(id) {
        for (const [key, config] of Object.entries(this.sprites)) {
            if (id >= config.idStart && id <= config.idEnd) {
                return {
                    type: key,
                    config: config,
                    localId: id - config.idStart
                };
            }
        }
        return null;
    }
    
    /**
     * 计算精灵图背景位置
     * @param {number} id 表情ID
     * @returns {Object|null} 背景位置信息
     */
    calculatePosition(id) {
        const spriteInfo = this.getSpriteConfig(id);
        if (!spriteInfo) {
            console.warn(`[SpriteManager] 表情ID ${id} 超出范围`);
            return null;
        }
        
        const { config, localId } = spriteInfo;
        const row = Math.floor(localId / config.cols);
        const col = localId % config.cols;
        
        return {
            x: -(col * config.itemWidth),
            y: -(row * config.itemHeight),
            row,
            col,
            spriteUrl: config.spriteUrl,
            itemWidth: config.itemWidth,
            itemHeight: config.itemHeight,
            spriteWidth: config.spriteWidth,
            spriteHeight: config.spriteHeight,
            type: spriteInfo.type
        };
    }
    
    /**
     * 创建表情元素
     * @param {number} id 表情ID
     * @param {Object} options 选项 {size: 'mini'|'small'|'medium'|'large', className: string, title: string}
     * @returns {HTMLElement|null} 表情元素
     */
    createEmoji(id, options = {}) {
        const position = this.calculatePosition(id);
        if (!position) {
            return null;
        }
        
        const { size = 'mini', className = '', title = '' } = options;
        
        // 根据类型确定尺寸类名和缩放比例
        const isIcon = position.type === 'icon';
        const sizeClass = isIcon ? `sprite-icon-${size}` : `sprite-emoji-${size}`;
        const scaleMap = {
            'mini': isIcon ? 24 / position.itemWidth : 18 / position.itemWidth,
            'small': isIcon ? 32 / position.itemWidth : 24 / position.itemWidth,
            'medium': isIcon ? 64 / position.itemWidth : 36 / position.itemWidth,
            'large': isIcon ? 128 / position.itemWidth : 72 / position.itemWidth
        };
        const scale = scaleMap[size] || (isIcon ? 24 / position.itemWidth : 18 / position.itemWidth);
        
        const span = document.createElement('span');
        span.className = `sprite-emoji ${sizeClass} ${className}`;
        span.style.backgroundImage = `url('${position.spriteUrl}')`;
        span.style.backgroundPosition = `${position.x * scale}px ${position.y * scale}px`;
        span.style.backgroundSize = `${position.spriteWidth * scale}px ${position.spriteHeight * scale}px`;
        
        // 设置标题
        const name = this.getEmojiName(id);
        span.title = title || name;
        span.dataset.spriteId = id;
        span.dataset.spriteName = name;
        
        return span;
    }
    
    /**
     * 解析文本中的<sprite=id>标签
     * @param {string} text 原始文本
     * @param {Object} options 选项 {size: 'mini'|'small'|'medium'|'large'}
     * @returns {string} 替换后的HTML
     */
    parseText(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        
        const { size = 'mini' } = options;
        const regex = /<sprite\s*=\s*(\d+)>/gi;
        
        return text.replace(regex, (match, id) => {
            const spriteId = parseInt(id, 10);
            const position = this.calculatePosition(spriteId);
            
            if (!position) {
                return match;
            }
            
            const isIcon = position.type === 'icon';
            const sizeClass = isIcon ? `sprite-icon-${size}` : `sprite-emoji-${size}`;
            const scaleMap = {
                'mini': isIcon ? 24 / position.itemWidth : 18 / position.itemWidth,
                'small': isIcon ? 32 / position.itemWidth : 24 / position.itemWidth,
                'medium': isIcon ? 64 / position.itemWidth : 36 / position.itemWidth,
                'large': isIcon ? 128 / position.itemWidth : 72 / position.itemWidth
            };
            const scale = scaleMap[size] || (isIcon ? 24 / position.itemWidth : 18 / position.itemWidth);
            
            const name = this.getEmojiName(spriteId);
            return `<span class="sprite-emoji ${sizeClass}" style="background-image: url('${position.spriteUrl}'); background-position: ${position.x * scale}px ${position.y * scale}px; background-size: ${position.spriteWidth * scale}px ${position.spriteHeight * scale}px;" title="${name}" data-sprite-id="${spriteId}"></span>`;
        });
    }
    
    /**
     * 处理DOM元素中的sprite标签
     * @param {HTMLElement} element 要处理的元素
     * @param {Object} options 选项 {size: 'mini'|'small'|'medium'|'large'}
     */
    processElement(element = document.body, options = {}) {
        if (!element) return;
        
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('<sprite=')) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            const text = textNode.textContent;
            
            if (parent.classList && parent.classList.contains('sprite-emoji')) {
                return;
            }
            
            const html = this.parseText(text, options);
            if (html !== text) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = html;
                parent.replaceChild(wrapper, textNode);
            }
        });
    }
    
    /**
     * 自动处理整个页面
     */
    processPage() {
        if (!this.configLoaded) {
            // 配置未加载完成，等待加载完成后再处理
            return;
        }
        
        this.processElement(document.body);
    }
    
    /**
     * 获取表情名称
     * @param {number} id 表情ID
     * @returns {string} 表情名称
     */
    getEmojiName(id) {
        const spriteInfo = this.getSpriteConfig(id);
        if (spriteInfo && spriteInfo.config.names && spriteInfo.config.names[id]) {
            return spriteInfo.config.names[id];
        }
        return `表情 ${id}`;
    }
    
    /**
     * 获取所有表情列表
     * @param {string} type 精灵图类型（emoji/icon）
     * @returns {Array} 表情列表
     */
    getAllEmojis(type = null) {
        const list = [];
        
        for (const [key, config] of Object.entries(this.sprites)) {
            if (type && key !== type) continue;
            
            for (let i = config.idStart; i <= config.idEnd; i++) {
                list.push({
                    id: i,
                    name: config.names && config.names[i] ? config.names[i] : `表情 ${i}`,
                    type: key
                });
            }
        }
        
        return list;
    }
    
    /**
     * 获取精灵图统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const stats = {};
        for (const [key, config] of Object.entries(this.sprites)) {
            stats[key] = {
                count: config.idEnd - config.idStart + 1,
                range: `${config.idStart}-${config.idEnd}`
            };
        }
        return stats;
    }
}

// 创建全局实例
window.spriteManager = new SpriteManager();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteManager;
}
