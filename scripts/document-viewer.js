// 安全的commonUtils包装函数
function safeCommonUtils() {
    if (typeof window.commonUtils !== "undefined") {
        return window.commonUtils;
    }
    return {
        showToast: function(m,t) { console.log(`[${t}] ${m}`); if(t==="error") alert(m); },
        navigateTo: function(u) { window.location.href = u; },
        mockApiRequest: function() { return Promise.resolve({success:true,data:[]}); },
        formatTime: function(ts,fmt) { return new Date(ts).toLocaleString("zh-CN"); }
    };
}
// 文档查看器脚本

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initDocumentViewer();
});

// 初始化文档查看器
function initDocumentViewer() {
    // 从URL参数获取文件信息
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file') || '5G专网部署最佳实践.pdf';
    
    // 更新页面标题和文档名称
    updateDocumentInfo(fileName);
    
    // 初始化事件监听器
    initEventListeners();
    
    // 记录文档访问
    trackDocumentView(fileName);
    
    console.log('文档查看器初始化完成，文件:', fileName);
}

// 更新文档信息
function updateDocumentInfo(fileName) {
    // 更新页面标题
    document.title = fileName + ' - 文档查看器';
    
    // 更新头部标题
    const headerTitle = document.getElementById('documentTitle');
    if (headerTitle) {
        headerTitle.textContent = fileName;
    }
    
    // 更新文档名称
    const docName = document.getElementById('docName');
    if (docName) {
        docName.textContent = fileName;
    }
    
    // 根据文件名更新相关信息
    updateDocumentMeta(fileName);
}

// 更新文档元数据
function updateDocumentMeta(fileName) {
    const documentData = getDocumentData(fileName);
    
    if (documentData) {
        // 更新文档大小
        const docSize = document.querySelector('.doc-size');
        if (docSize) {
            docSize.textContent = documentData.size;
        }
        
        // 更新文档日期
        const docDate = document.querySelector('.doc-date');
        if (docDate) {
            docDate.textContent = documentData.date;
        }
        
        // 更新标签
        const docTags = document.querySelector('.doc-tags');
        if (docTags && documentData.tags) {
            docTags.innerHTML = documentData.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
    }
}

// 获取文档数据
function getDocumentData(fileName) {
    const documentsData = {
        '5G专网部署最佳实践.pdf': {
            size: '2.3MB',
            date: '2024-01-15',
            tags: ['5G网络', '专网部署', '最佳实践', '技术指南'],
            author: '技术专家组',
            version: 'v2.1'
        },
        '5G网络规划指南.pdf': {
            size: '1.8MB',
            date: '2024-01-10',
            tags: ['5G网络', '网络规划', '设计指南'],
            author: '网络规划部',
            version: 'v1.5'
        },
        '专网安全配置手册.pdf': {
            size: '1.2MB',
            date: '2024-01-08',
            tags: ['网络安全', '配置手册', '专网'],
            author: '安全专家组',
            version: 'v1.3'
        },
        '网络优化案例集.pdf': {
            size: '3.1MB',
            date: '2024-01-12',
            tags: ['网络优化', '案例分析', '经验分享'],
            author: '优化专家组',
            version: 'v2.0'
        }
    };
    
    return documentsData[fileName] || documentsData['5G专网部署最佳实践.pdf'];
}

// 初始化事件监听器
function initEventListeners() {
    // 返回按钮
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            history.back();
        });
    }
    
    // 下载按钮
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadDocument);
    }
    
    // 分享按钮
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareDocument);
    }
    
    // 相关文档点击事件
    const relatedItems = document.querySelectorAll('.related-item');
    relatedItems.forEach(item => {
        item.addEventListener('click', function() {
            const fileName = this.querySelector('h4').textContent + '.pdf';
            openRelatedDoc(fileName);
        });
    });
    
    // 底部导航事件
    initBottomNavigation();
}

// 下载文档
function downloadDocument() {
    const fileName = document.getElementById('docName').textContent;
    
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().showToast(`正在下载 ${fileName}...`, 'info');
        
        // 模拟下载过程
        setTimeout(() => {
            safeCommonUtils().showToast('下载完成！', 'success');
        }, 2000);
    } else {
        alert(`正在下载 ${fileName}...`);
    }
    
    // 记录下载统计
    trackDocumentDownload(fileName);
}

// 分享文档
function shareDocument() {
    const fileName = document.getElementById('docName').textContent;
    const currentUrl = window.location.href;
    
    if (navigator.share) {
        // 使用原生分享API
        navigator.share({
            title: fileName,
            text: `查看文档：${fileName}`,
            url: currentUrl
        }).then(() => {
            console.log('分享成功');
        }).catch((error) => {
            console.log('分享失败:', error);
            fallbackShare(fileName, currentUrl);
        });
    } else {
        // 降级分享方案
        fallbackShare(fileName, currentUrl);
    }
    
    // 记录分享统计
    trackDocumentShare(fileName);
}

// 降级分享方案
function fallbackShare(fileName, url) {
    // 复制链接到剪贴板
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            if (typeof commonUtils !== 'undefined') {
                safeCommonUtils().showToast('链接已复制到剪贴板', 'success');
            } else {
                alert('链接已复制到剪贴板');
            }
        });
    } else {
        // 显示分享对话框
        const shareText = `文档链接：${url}`;
        if (typeof commonUtils !== 'undefined') {
            safeCommonUtils().showToast(shareText, 'info');
        } else {
            prompt('复制链接:', url);
        }
    }
}

// 打开相关文档
function openRelatedDoc(fileName) {
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().showToast(`正在打开 ${fileName}...`, 'info');
        
        setTimeout(() => {
            const url = `document-viewer.html?file=${encodeURIComponent(fileName)}`;
            window.location.href = url;
        }, 500);
    } else {
        const url = `document-viewer.html?file=${encodeURIComponent(fileName)}`;
        window.location.href = url;
    }
}

// 初始化底部导航
function initBottomNavigation() {
    // 导航到不同页面的函数
    window.navigateTo = function(url) {
        if (typeof commonUtils !== 'undefined' && safeCommonUtils().navigateTo) {
            safeCommonUtils().navigateTo(url);
        } else {
            window.location.href = url;
        }
    };
}

// 统计函数
function trackDocumentView(fileName) {
    console.log('文档查看统计:', fileName);
    
    // 模拟API调用
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().mockApiRequest('/api/documents/view', {
            method: 'POST',
            body: JSON.stringify({
                fileName: fileName,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            })
        }).then(response => {
            console.log('查看统计记录成功');
        }).catch(error => {
            console.log('查看统计记录失败:', error);
        });
    }
}

function trackDocumentDownload(fileName) {
    console.log('文档下载统计:', fileName);
    
    // 模拟API调用
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().mockApiRequest('/api/documents/download', {
            method: 'POST',
            body: JSON.stringify({
                fileName: fileName,
                timestamp: Date.now()
            })
        });
    }
}

function trackDocumentShare(fileName) {
    console.log('文档分享统计:', fileName);
    
    // 模拟API调用
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().mockApiRequest('/api/documents/share', {
            method: 'POST',
            body: JSON.stringify({
                fileName: fileName,
                timestamp: Date.now()
            })
        });
    }
}

// 页面滚动优化
function initScrollOptimization() {
    let ticking = false;
    
    function updateScrollPosition() {
        const scrollTop = window.pageYOffset;
        const header = document.querySelector('.header');
        
        if (header) {
            if (scrollTop > 100) {
                header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// 初始化滚动优化
document.addEventListener('DOMContentLoaded', function() {
    initScrollOptimization();
});

// 错误处理
window.addEventListener('error', function(event) {
    console.error('文档查看器错误:', event.error);
    
    if (typeof commonUtils !== 'undefined') {
        safeCommonUtils().showToast('页面加载出现问题，请刷新重试', 'error');
    }
});

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDocumentViewer,
        updateDocumentInfo,
        downloadDocument,
        shareDocument,
        openRelatedDoc
    };
}
