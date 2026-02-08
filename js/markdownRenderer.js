/**
 * Markdown渲染器
 * 将Markdown格式转换为HTML
 */

class MarkdownRenderer {
    constructor() {
        // 代码块缓存
        this.codeBlocks = [];
    }

    /**
     * 将Markdown转换为HTML
     * @param {string} markdown Markdown文本
     * @returns {string} HTML文本
     */
    render(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // 转义HTML特殊字符
        html = this.escapeHtml(html);
        
        // 处理代码块（保留内容不被其他规则处理）
        html = this.extractCodeBlocks(html);
        
        // 处理标题
        html = this.renderHeaders(html);
        
        // 处理粗体和斜体
        html = this.renderEmphasis(html);
        
        // 处理删除线
        html = this.renderStrikethrough(html);
        
        // 处理行内代码
        html = this.renderInlineCode(html);
        
        // 处理链接
        html = this.renderLinks(html);
        
        // 处理图片
        html = this.renderImages(html);
        
        // 处理无序列表
        html = this.renderUnorderedLists(html);
        
        // 处理有序列表
        html = this.renderOrderedLists(html);
        
        // 处理引用块
        html = this.renderBlockquotes(html);
        
        // 处理水平分割线
        html = this.renderHorizontalRules(html);
        
        // 处理表格
        html = this.renderTables(html);
        
        // 处理段落和换行
        html = this.renderParagraphs(html);
        
        // 恢复代码块
        html = this.restoreCodeBlocks(html);
        
        return html;
    }

    /**
     * 转义HTML特殊字符
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * 提取代码块，防止被其他规则处理
     */
    extractCodeBlocks(text) {
        this.codeBlocks = [];
        return text.replace(/```([\s\S]*?)```/g, (match, code) => {
            this.codeBlocks.push(code);
            return `\n<!--CODE_BLOCK_${this.codeBlocks.length - 1}-->\n`;
        });
    }

    /**
     * 恢复代码块
     */
    restoreCodeBlocks(text) {
        return text.replace(/<!--CODE_BLOCK_(\d+)-->/g, (match, index) => {
            const code = this.codeBlocks[parseInt(index)];
            return `<pre><code>${code}</code></pre>`;
        });
    }

    /**
     * 渲染标题
     */
    renderHeaders(text) {
        return text
            .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>');
    }

    /**
     * 渲染粗体和斜体
     */
    renderEmphasis(text) {
        // 粗体 (**text** 或 __text__)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 斜体 (*text* 或 _text_)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.*?)_/g, '<em>$1</em>');
        
        return text;
    }

    /**
     * 渲染删除线
     */
    renderStrikethrough(text) {
        return text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    }

    /**
     * 渲染行内代码
     */
    renderInlineCode(text) {
        return text.replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    /**
     * 渲染链接
     */
    renderLinks(text) {
        // [text](url)
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    /**
     * 渲染图片
     */
    renderImages(text) {
        // ![alt](url)
        return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">');
    }

    /**
     * 渲染无序列表
     */
    renderUnorderedLists(text) {
        const lines = text.split('\n');
        let result = [];
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^(\s*)[-*+] (.*)$/);
            
            if (match) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(match[2]);
            } else {
                if (inList) {
                    // 结束列表
                    result.push('<ul>');
                    listItems.forEach(item => {
                        result.push(`<li>${item}</li>`);
                    });
                    result.push('</ul>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        // 处理文件末尾的列表
        if (inList) {
            result.push('<ul>');
            listItems.forEach(item => {
                result.push(`<li>${item}</li>`);
            });
            result.push('</ul>');
        }
        
        return result.join('\n');
    }

    /**
     * 渲染有序列表
     */
    renderOrderedLists(text) {
        const lines = text.split('\n');
        let result = [];
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^(\s*)\d+\. (.*)$/);
            
            if (match) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(match[2]);
            } else {
                if (inList) {
                    // 结束列表
                    result.push('<ol>');
                    listItems.forEach(item => {
                        result.push(`<li>${item}</li>`);
                    });
                    result.push('</ol>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        // 处理文件末尾的列表
        if (inList) {
            result.push('<ol>');
            listItems.forEach(item => {
                result.push(`<li>${item}</li>`);
            });
            result.push('</ol>');
        }
        
        return result.join('\n');
    }

    /**
     * 渲染引用块
     */
    renderBlockquotes(text) {
        const lines = text.split('\n');
        let result = [];
        let inQuote = false;
        let quoteLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^> (.*)$/);
            
            if (match) {
                if (!inQuote) {
                    inQuote = true;
                    quoteLines = [];
                }
                quoteLines.push(match[1]);
            } else {
                if (inQuote) {
                    // 结束引用
                    result.push('<blockquote>');
                    result.push(quoteLines.join('<br>'));
                    result.push('</blockquote>');
                    inQuote = false;
                }
                result.push(line);
            }
        }
        
        // 处理文件末尾的引用
        if (inQuote) {
            result.push('<blockquote>');
            result.push(quoteLines.join('<br>'));
            result.push('</blockquote>');
        }
        
        return result.join('\n');
    }

    /**
     * 渲染水平分割线
     */
    renderHorizontalRules(text) {
        return text.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
    }

    /**
     * 渲染表格
     */
    renderTables(text) {
        const lines = text.split('\n');
        let result = [];
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i];
            
            // 检查是否是表格行
            if (line.includes('|')) {
                const tableLines = [];
                
                // 收集表格的所有行
                while (i < lines.length && lines[i].includes('|')) {
                    tableLines.push(lines[i]);
                    i++;
                }
                
                // 至少需要两行（表头和分隔符）
                if (tableLines.length >= 2) {
                    // 检查第二行是否是分隔符
                    const separatorLine = tableLines[1];
                    if (/^\|?[-:|\s]+\|?$/.test(separatorLine)) {
                        // 渲染表格
                        result.push(this.renderTableContent(tableLines));
                        continue;
                    }
                }
                
                // 不是有效表格，原样输出
                result.push(...tableLines);
            } else {
                result.push(line);
                i++;
            }
        }
        
        return result.join('\n');
    }

    /**
     * 渲染表格内容
     */
    renderTableContent(lines) {
        // 移除分隔符行
        const contentLines = [lines[0], ...lines.slice(2)];
        
        let html = '<table class="markdown-table">';
        
        contentLines.forEach((line, index) => {
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            
            if (index === 0) {
                // 表头
                html += '<thead><tr>';
                cells.forEach(cell => {
                    html += `<th>${cell.trim()}</th>`;
                });
                html += '</tr></thead><tbody>';
            } else {
                // 数据行
                html += '<tr>';
                cells.forEach(cell => {
                    html += `<td>${cell.trim()}</td>`;
                });
                html += '</tr>';
            }
        });
        
        html += '</tbody></table>';
        return html;
    }

    /**
     * 渲染段落和换行
     */
    renderParagraphs(text) {
        const lines = text.split('\n');
        let result = [];
        let inParagraph = false;
        let paragraphLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 跳过空行
            if (line.trim() === '') {
                if (inParagraph) {
                    result.push('<p>' + paragraphLines.join('<br>') + '</p>');
                    inParagraph = false;
                    paragraphLines = [];
                }
                continue;
            }
            
            // 跳过已渲染的HTML标签行
            if (line.match(/^<[a-zA-Z][^>]*>/)) {
                if (inParagraph) {
                    result.push('<p>' + paragraphLines.join('<br>') + '</p>');
                    inParagraph = false;
                    paragraphLines = [];
                }
                result.push(line);
                continue;
            }
            
            // 普通文本行
            if (!inParagraph) {
                inParagraph = true;
                paragraphLines = [];
            }
            paragraphLines.push(line);
        }
        
        // 处理末尾的段落
        if (inParagraph) {
            result.push('<p>' + paragraphLines.join('<br>') + '</p>');
        }
        
        return result.join('\n');
    }
}

// 创建全局实例
window.markdownRenderer = new MarkdownRenderer();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
