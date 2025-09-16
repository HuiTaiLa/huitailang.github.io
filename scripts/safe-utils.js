// 安全的commonUtils包装函数
// 用于解决commonUtils未定义的问题

function safeCommonUtils() {
    if (typeof window.commonUtils !== 'undefined') {
        return window.commonUtils;
    }
    
    // 如果commonUtils未加载，返回备用函数
    return {
        showToast: function(message, type) {
            console.log(`[Toast ${type}] ${message}`);
            // 简单的备用提示
            if (type === 'error') {
                alert(message);
            }
        },
        
        navigateTo: function(url) {
            window.location.href = url;
        },
        
        showConfirm: function(message, onConfirm, onCancel) {
            if (confirm(message)) {
                onConfirm && onConfirm();
            } else {
                onCancel && onCancel();
            }
        },
        
        showLoading: function(message) {
            console.log(`[Loading] ${message}`);
            // 可以在这里添加简单的加载指示器
        },
        
        hideLoading: function() {
            console.log('[Loading] Hidden');
        },
        
        mockApiRequest: function(url, options) {
            console.log(`[API] ${url}`, options);
            return Promise.resolve({
                success: true,
                data: [],
                message: '模拟API响应'
            });
        },
        
        formatTime: function(timestamp, format) {
            const date = new Date(timestamp);
            if (format === 'HH:mm') {
                return date.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            return date.toLocaleString('zh-CN');
        },
        
        formatFileSize: function(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        storage: {
            set: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn('localStorage不可用:', e);
                }
            },
            
            get: function(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.warn('localStorage读取失败:', e);
                    return null;
                }
            },
            
            remove: function(key) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('localStorage删除失败:', e);
                }
            }
        },
        
        callDeepSeekAPI: function(userMessage, conversationHistory) {
            console.warn('DeepSeek API不可用，返回模拟响应');
            return Promise.resolve({
                success: false,
                error: 'API服务不可用',
                fallbackMessage: '抱歉，AI助手暂时无法响应，请稍后再试。'
            });
        },
        
        AIConversationManager: {
            conversations: new Map(),
            
            getHistory: function(chatId) {
                return this.conversations.get(chatId) || [];
            },
            
            addMessage: function(chatId, role, content) {
                if (!this.conversations.has(chatId)) {
                    this.conversations.set(chatId, []);
                }
                
                const history = this.conversations.get(chatId);
                history.push({ role, content });
                
                if (history.length > 20) {
                    history.splice(0, history.length - 20);
                }
                
                this.conversations.set(chatId, history);
            },
            
            clearHistory: function(chatId) {
                this.conversations.delete(chatId);
            }
        }
    };
}

// 全局导出
if (typeof window !== 'undefined') {
    window.safeCommonUtils = safeCommonUtils;
}
