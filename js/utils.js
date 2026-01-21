// 工具函数模块
class Utils {
    /**
     * 读取文件内容
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * 提取事件标题，移除颜色标签
     * @param {Object} eventData - 事件数据
     * @returns {string} 处理后的标题
     */
    static getEventTitle(eventData) {
        if (!eventData) return '无标题';
        
        if (eventData.title) {
            // 移除颜色标签
            return eventData.title.replace(/<color=#([0-9A-Fa-f]+)>/g, '').replace(/<\/color>/g, '');
        }
        
        return `事件 ${eventData.id}`;
    }

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 防抖处理后的函数
     */
    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}
