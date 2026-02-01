// 工具函数模块
class Utils {
    /**
     * 读取文件内容
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('读取文件失败'));
            reader.readAsText(file, 'utf-8');
        });
    }
    
    /**
     * 获取事件标题
     * @param {Object} data - 事件数据
     * @returns {string} 事件标题
     */
    static getEventTitle(data) {
        return data.title || data.name || '-';
    }
    
    /**
     * 将驼峰命名转换为蛇形命名
     * @param {string} str - 驼峰命名的字符串
     * @returns {string} 蛇形命名的字符串
     */
    static toSnakeCase(str) {
        return str.replace(/([A-Z])/g, (match) => '_' + match.toLowerCase()).replace(/^_/, '');
    }
    
    /**
     * 匹配文件名，支持通配符
     * @param {string} fileName - 实际文件名
     * @param {string} pattern - 匹配模式，支持*通配符
     * @returns {boolean} 是否匹配
     */
    static matchFileName(fileName, pattern) {
        // 将通配符转换为正则表达式
        const regexPattern = pattern
            .replace(/\./g, '\\.')  // 转义点号
            .replace(/\*/g, '.*');   // 将*替换为.*
        
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(fileName);
    }
    
    /**
     * 从目录内容中提取文件名
     * @param {string} dirContent - 目录内容
     * @returns {string[]} 文件名列表
     */
    static extractFileNamesFromDirContent(dirContent) {
        // 简单的正则表达式，从HTML目录列表中提取文件名
        const fileNameRegex = /href="([^"]+\.json)"/g;
        const fileNames = [];
        let match;
        while ((match = fileNameRegex.exec(dirContent)) !== null) {
            fileNames.push(match[1]);
        }
        return fileNames;
    }
    
    /**
     * 深度克隆对象
     * @param {Object} obj - 要克隆的对象
     * @returns {Object} 克隆后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    /**
     * 格式化数字，添加千位分隔符
     * @param {number} num - 要格式化的数字
     * @returns {string} 格式化后的数字字符串
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * 延迟函数
     * @param {number} ms - 延迟时间（毫秒）
     * @returns {Promise} Promise对象
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 导出Utils类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
