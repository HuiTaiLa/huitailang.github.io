// 通用JavaScript功能

// 全局配置
const GlobalConfig = {
    // DeepSeek API配置
    DEEPSEEK_API_KEY: "sk-efa9847cabe74bad83d8e7ee2a4a5786",
    DEEPSEEK_API_URL: "https://api.deepseek.com/v1/chat/completions",

    // AI助手配置
    AI_MODEL: "deepseek-chat",
    AI_MAX_TOKENS: 1000,
    AI_TEMPERATURE: 0.7,

    // 系统提示词
    AI_SYSTEM_PROMPT: "你是移动云业务支撑平台的AI智能助手，专门为用户提供5G网络、云计算、边缘计算等技术领域的专业咨询和支持。请用专业、友好的语气回答用户问题，并在适当时推荐相关的技术资源。"
};

// 页面导航函数
function navigateTo(page) {
    // 在实际小程序中，这里会使用wx.navigateTo
    window.location.href = page;
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 样式
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#667eea',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 确认对话框
function showConfirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    
    modal.innerHTML = `
        <div class="confirm-content">
            <h3>确认</h3>
            <p>${message}</p>
            <div class="confirm-actions">
                <button class="confirm-cancel">取消</button>
                <button class="confirm-ok">确定</button>
            </div>
        </div>
    `;
    
    // 样式
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
    });
    
    Object.assign(modal.style, {
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px',
        maxWidth: '300px',
        width: '100%'
    });
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 事件处理
    modal.querySelector('.confirm-cancel').onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };
    
    modal.querySelector('.confirm-ok').onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        }
    };
}

// 加载状态管理
function showLoading(message = '加载中...') {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    Object.assign(loading.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
    });
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) {
        document.body.removeChild(loading);
    }
}

// 模拟API请求
function mockApiRequest(url, options = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟不同的响应
            if (url.includes('search')) {
                resolve({
                    success: true,
                    data: {
                        results: [
                            { id: 1, title: '5G专网部署指南', type: 'document' },
                            { id: 2, title: '云计算架构设计', type: 'document' }
                        ],
                        total: 2
                    }
                });
            } else if (url.includes('documents')) {
                resolve({
                    success: true,
                    data: {
                        documents: [
                            { id: 1, title: '移动云平台技术白皮书', size: '2.3MB' },
                            { id: 2, title: '5G网络优化实战培训', size: '45分钟' }
                        ]
                    }
                });
            } else {
                resolve({
                    success: true,
                    data: {}
                });
            }
        }, 1000 + Math.random() * 1000);
    });
}

// 格式化时间
function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) {
        return '刚刚';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    } else if (diff < 2592000000) {
        return Math.floor(diff / 86400000) + '天前';
    } else {
        return time.toLocaleDateString();
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
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
}

// 本地存储工具
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage remove error:', e);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Storage clear error:', e);
        }
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加全局样式
    const style = document.createElement('style');
    style.textContent = `
        .confirm-modal h3 {
            margin-bottom: 12px;
            font-size: 18px;
            color: #333;
        }
        
        .confirm-modal p {
            margin-bottom: 20px;
            color: #666;
            line-height: 1.5;
        }
        
        .confirm-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        
        .confirm-cancel, .confirm-ok {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .confirm-cancel {
            background: #f8f9fa;
            color: #666;
        }
        
        .confirm-ok {
            background: #667eea;
            color: white;
        }
        
        .loading-content {
            text-align: center;
            color: #666;
        }
        
        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }
    `;
    document.head.appendChild(style);
});

// AI助手对话历史管理
const AIConversationManager = {
    conversations: new Map(),

    // 获取对话历史
    getHistory(chatId) {
        return this.conversations.get(chatId) || [];
    },

    // 添加消息到历史
    addMessage(chatId, role, content) {
        if (!this.conversations.has(chatId)) {
            this.conversations.set(chatId, []);
        }

        const history = this.conversations.get(chatId);
        history.push({ role, content });

        // 限制历史长度，保留最近20条消息
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }

        this.conversations.set(chatId, history);
    },

    // 清空对话历史
    clearHistory(chatId) {
        this.conversations.delete(chatId);
    }
};

// 导出给其他脚本使用
window.commonUtils = {
    navigateTo,
    showToast,
    showConfirm,
    showLoading,
    hideLoading,
    mockApiRequest,
    formatTime,
    formatFileSize,
    debounce,
    throttle,
    storage,
    callDeepSeekAPI,
    callDeepSeekAPIStream,
    AIConversationManager
};

// DeepSeek API调用函数
async function callDeepSeekAPI(userMessage, conversationHistory = []) {
    try {
        // 构建消息历史
        const messages = [
            {
                role: "system",
                content: GlobalConfig.AI_SYSTEM_PROMPT
            }
        ];

        // 添加对话历史（最近5轮对话）
        const recentHistory = conversationHistory.slice(-10); // 取最近10条消息（5轮对话）
        messages.push(...recentHistory);

        // 添加当前用户消息
        messages.push({
            role: "user",
            content: userMessage
        });

        console.log('发送到DeepSeek API的消息:', messages);

        const response = await fetch(GlobalConfig.DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GlobalConfig.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: GlobalConfig.AI_MODEL,
                messages: messages,
                max_tokens: GlobalConfig.AI_MAX_TOKENS,
                temperature: GlobalConfig.AI_TEMPERATURE,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('DeepSeek API错误响应:', response.status, errorData);
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('DeepSeek API响应:', data);

        if (data.choices && data.choices.length > 0) {
            return {
                success: true,
                message: data.choices[0].message.content,
                usage: data.usage
            };
        } else {
            throw new Error('API响应格式异常');
        }

    } catch (error) {
        console.error('DeepSeek API调用失败:', error);
        return {
            success: false,
            error: error.message,
            fallbackMessage: "抱歉，AI助手暂时无法响应，请稍后再试。如需技术支持，请联系人工客服。"
        };
    }
}

// DeepSeek API流式调用函数
async function callDeepSeekAPIStream(userMessage, conversationHistory = [], onChunk = null, onComplete = null, onError = null, abortController = null) {
    try {
        // 构建消息历史
        const messages = [
            {
                role: "system",
                content: GlobalConfig.AI_SYSTEM_PROMPT
            }
        ];

        // 添加对话历史（最近5轮对话）
        const recentHistory = conversationHistory.slice(-10); // 取最近10条消息（5轮对话）
        messages.push(...recentHistory);

        // 添加当前用户消息
        messages.push({
            role: "user",
            content: userMessage
        });

        console.log('发送到DeepSeek API的流式消息:', messages);

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GlobalConfig.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: GlobalConfig.AI_MODEL,
                messages: messages,
                max_tokens: GlobalConfig.AI_MAX_TOKENS,
                temperature: GlobalConfig.AI_TEMPERATURE,
                stream: true
            })
        };

        // 如果提供了AbortController，添加signal
        if (abortController) {
            fetchOptions.signal = abortController.signal;
        }

        const response = await fetch(GlobalConfig.DEEPSEEK_API_URL, fetchOptions);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('DeepSeek API错误响应:', response.status, errorData);
            const error = new Error(`API请求失败: ${response.status} ${response.statusText}`);
            if (onError) onError(error);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一个不完整的行

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine === '' || trimmedLine === 'data: [DONE]') {
                        continue;
                    }

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6); // 移除 'data: ' 前缀
                            const data = JSON.parse(jsonStr);

                            if (data.choices && data.choices[0] && data.choices[0].delta) {
                                const delta = data.choices[0].delta;
                                if (delta.content) {
                                    fullContent += delta.content;
                                    if (onChunk) {
                                        onChunk(delta.content, fullContent);
                                    }
                                }
                            }
                        } catch (parseError) {
                            console.warn('解析流式数据失败:', parseError, trimmedLine);
                        }
                    }
                }
            }

            // 流式传输完成
            if (onComplete) {
                onComplete(fullContent);
            }

            console.log('DeepSeek API流式调用完成，完整内容:', fullContent);

        } catch (streamError) {
            console.error('流式读取失败:', streamError);
            if (onError) onError(streamError);
        } finally {
            reader.releaseLock();
        }

    } catch (error) {
        console.error('DeepSeek API流式调用失败:', error);
        if (onError) {
            onError(error);
        }
    }
}
