// 通用JavaScript功能

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
    storage
};
