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

// 智能返回功能
function goBackToResourceLibrary() {
    // 检查是否从资源库页面跳转过来
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);

    // 如果referrer包含resource-library或者URL参数表明来自资源库，则返回资源库
    if (referrer.includes('resource-library.html') ||
        urlParams.get('from') === 'resource-library' ||
        urlParams.has('id')) {
        safeCommonUtils().navigateTo('resource-library.html');
    } else {
        // 否则使用浏览器历史记录返回
        if (window.history.length > 1) {
            history.back();
        } else {
            // 如果没有历史记录，返回首页
            safeCommonUtils().navigateTo('index.html');
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('文档查看器页面加载完成');
    initDocumentViewer();
});



// 初始化文档查看器
function initDocumentViewer() {
    // 从URL参数获取文件信息
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    const docTitle = urlParams.get('title');
    const fileName = urlParams.get('file');

    // 确定要使用的文件名
    let finalFileName;
    if (fileName) {
        // 如果有file参数，直接使用
        finalFileName = fileName;
    } else if (docId && docTitle) {
        // 如果有id和title参数，尝试从真实文件数据中获取文件名
        finalFileName = getFileNameFromDocId(docId, docTitle);
    } else {
        // 默认文件
        finalFileName = '5G专网部署最佳实践.pdf';
    }

    // 更新页面标题和文档名称
    updateDocumentInfo(finalFileName, docTitle);

    // 加载文档内容
    loadDocumentContent(finalFileName);

    // 初始化事件监听器
    initEventListeners();

    // 记录文档访问
    trackDocumentView(finalFileName);

    console.log('文档查看器初始化完成，文件:', finalFileName, '标题:', docTitle);
}

// 加载文档内容
async function loadDocumentContent(fileName) {
    const contentContainer = document.getElementById('documentContent');
    if (!contentContainer) return;

    // 显示加载状态
    contentContainer.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>正在加载文档内容...</p>
            <div class="loading-details">
                <p>📄 文件名：${fileName}</p>
                <p>🔄 正在解析文档格式...</p>
            </div>
        </div>
    `;

    try {
        // 确保文档内容提取器已初始化
        if (window.DocumentContentExtractor) {
            // 等待解析器准备就绪
            if (!window.DocumentContentExtractor.isReady()) {
                contentContainer.innerHTML = `
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>正在初始化文档解析器...</p>
                        <div class="loading-details">
                            <p>📄 文件名：${fileName}</p>
                            <p>⚙️ 正在加载解析库...</p>
                        </div>
                    </div>
                `;

                await window.DocumentContentExtractor.init();
            }

            // 更新加载状态
            contentContainer.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>正在提取文档内容...</p>
                    <div class="loading-details">
                        <p>📄 文件名：${fileName}</p>
                        <p>📖 正在读取文档内容...</p>
                    </div>
                </div>
            `;

            // 异步提取文档内容
            const extractedContent = await window.DocumentContentExtractor.extractDocumentContent(fileName);

            if (extractedContent.success) {
                // 显示真实文档内容
                const htmlContent = window.DocumentContentExtractor.formatDocumentAsHTML(extractedContent);
                contentContainer.innerHTML = htmlContent;

                // 更新文档信息
                updateDocumentMetaInfo(extractedContent, fileName);

                console.log('文档内容加载成功:', {
                    fileName,
                    source: extractedContent.source,
                    title: extractedContent.title,
                    pageCount: extractedContent.pageCount,
                    fileSize: extractedContent.fileSize
                });
            } else {
                // 显示错误或默认内容
                contentContainer.innerHTML = extractedContent.htmlContent;
                console.warn('文档内容提取失败，显示默认内容:', fileName);
            }
        } else {
            // 如果没有文档内容提取器，显示错误信息
            contentContainer.innerHTML = `
                <div class="content-header">
                    <h2>${fileName}</h2>
                    <div class="content-meta">
                        <span class="author">系统</span>
                        <span class="version">版本 v1.0</span>
                        <span class="update-date">更新时间：${new Date().toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="content-body">
                    <section class="content-section">
                        <h3>⚠️ 系统错误</h3>
                        <p>文档内容提取器未正确加载，无法显示文档内容。</p>
                        <p>请刷新页面重试或联系技术支持。</p>
                        <div class="error-details">
                            <p><strong>错误类型：</strong>DocumentContentExtractor 未找到</p>
                            <p><strong>建议操作：</strong></p>
                            <ul>
                                <li>刷新页面重试</li>
                                <li>检查网络连接</li>
                                <li>联系技术支持</li>
                            </ul>
                        </div>
                    </section>
                </div>
            `;
        }
    } catch (error) {
        console.error('文档加载过程中发生错误:', error);
        contentContainer.innerHTML = `
            <div class="content-header">
                <h2>${fileName}</h2>
                <div class="content-meta">
                    <span class="author">系统</span>
                    <span class="version">版本 v1.0</span>
                    <span class="update-date">更新时间：${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            <div class="content-body">
                <section class="content-section">
                    <h3>❌ 加载失败</h3>
                    <p>文档内容加载过程中发生错误。</p>
                    <div class="error-details">
                        <p><strong>错误信息：</strong>${error.message}</p>
                        <p><strong>文件名：</strong>${fileName}</p>
                        <p><strong>建议操作：</strong></p>
                        <ul>
                            <li>确认文件格式是否受支持（PDF、DOCX、PPTX）</li>
                            <li>检查网络连接是否正常</li>
                            <li>刷新页面重试</li>
                        </ul>
                    </div>
                </section>
            </div>
        `;
    }
}

// 更新文档元信息
function updateDocumentMetaInfo(extractedContent, fileName) {
    // 更新文档大小信息
    const docSizeElement = document.getElementById('docSize');
    if (docSizeElement && extractedContent.fileSize) {
        docSizeElement.textContent = formatFileSize(extractedContent.fileSize);
    }

    // 更新页数信息（如果有）
    const docMetaElement = document.querySelector('.doc-meta');
    if (docMetaElement && extractedContent.pageCount) {
        const pageInfo = document.createElement('span');
        pageInfo.className = 'doc-pages';
        pageInfo.textContent = `${extractedContent.pageCount} 页`;
        docMetaElement.appendChild(pageInfo);
    }

    // 更新提取时间
    const docDateElement = document.getElementById('docDate');
    if (docDateElement && extractedContent.extractedAt) {
        const extractDate = new Date(extractedContent.extractedAt);
        docDateElement.textContent = extractDate.toLocaleDateString();
    }

    // 如果有真实文件数据，确保标签信息正确
    if (window.REAL_FILES_DATA) {
        const realFileData = window.REAL_FILES_DATA.find(file => file.filename === fileName);
        if (realFileData) {
            const docTags = document.getElementById('docTags');
            if (docTags && realFileData.tags) {
                docTags.innerHTML = realFileData.tags.map(tag =>
                    `<span class="tag">${tag}</span>`
                ).join('');
            }
        }
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 从文档ID获取文件名
function getFileNameFromDocId(docId, docTitle) {
    // 如果有全局的真实文件数据，从中查找
    if (typeof window !== 'undefined' && window.REAL_FILES_DATA) {
        // 尝试从docId中提取索引
        let fileIndex = -1;
        if (docId.startsWith('real_doc_')) {
            fileIndex = parseInt(docId.replace('real_doc_', ''));
        } else if (docId.startsWith('hot_real_')) {
            fileIndex = parseInt(docId.replace('hot_real_', ''));
        }

        if (fileIndex >= 0 && fileIndex < window.REAL_FILES_DATA.length) {
            return window.REAL_FILES_DATA[fileIndex].filename;
        }
    }

    // 如果标题包含扩展名，直接使用
    if (docTitle && docTitle.includes('.')) {
        return docTitle;
    }

    // 尝试从已知文档列表匹配
    const knownDocs = [
        '云电脑教育场景解决方案.pptx',
        '智算一体机内部培训材料.pptx',
        '党政行业重点解决方案及案例.pptx',
        '法库县公安局融智算项目标杆案例.docx',
        '移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx',
        '辽宁省中小企业数字化转型政策.docx'
    ];

    if (docTitle) {
        const matchedDoc = knownDocs.find(doc =>
            doc.includes(docTitle) || docTitle.includes(doc.split('.')[0])
        );
        if (matchedDoc) {
            return matchedDoc;
        }
    }

    // 默认返回第一个文档
    return knownDocs[0];
}

// 更新文档信息
function updateDocumentInfo(fileName, docTitle) {
    // 使用传入的标题或从文件名提取标题
    const displayTitle = docTitle || fileName.split('.')[0];

    // 更新页面标题
    document.title = displayTitle + ' - 文档查看器';

    // 更新头部标题
    const headerTitle = document.getElementById('documentTitle');
    if (headerTitle) {
        headerTitle.textContent = displayTitle;
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
        const docSize = document.getElementById('docSize');
        if (docSize) {
            docSize.textContent = documentData.size;
        }

        // 更新文档日期
        const docDate = document.getElementById('docDate');
        if (docDate) {
            docDate.textContent = documentData.date;
        }

        // 更新标签
        const docTags = document.getElementById('docTags');
        if (docTags && documentData.tags) {
            docTags.innerHTML = documentData.tags.map(tag =>
                `<span class="tag">${tag}</span>`
            ).join('');
        }
    }
}

// 获取文档数据
function getDocumentData(fileName) {
    // 首先尝试从全局真实文件数据中获取
    if (window.REAL_FILES_DATA) {
        const realFileData = window.REAL_FILES_DATA.find(file => file.filename === fileName);
        if (realFileData) {
            return {
                size: formatFileSize(realFileData.size),
                date: '2024-01-20', // 可以从文件元数据中获取
                tags: realFileData.tags,
                author: '解决方案专家组',
                version: 'v1.0',
                docType: realFileData.docType
            };
        }
    }

    // 后备数据
    const documentsData = {
        '云电脑教育场景解决方案.pptx': {
            size: '24.2MB',
            date: '2024-01-20',
            tags: ['云电脑', '教育', '解决方案'],
            author: '解决方案专家组',
            version: 'v1.0'
        },
        '智算一体机内部培训材料.pptx': {
            size: '55.6MB',
            date: '2024-01-18',
            tags: ['智算一体机', '培训', '产品介绍', '技术规格'],
            author: '产品培训部',
            version: 'v2.0'
        },
        '党政行业重点解决方案及案例.pptx': {
            size: '1.3MB',
            date: '2024-01-16',
            tags: ['党政行业', '解决方案', '案例分析', '数字化转型'],
            author: '行业解决方案部',
            version: 'v1.5'
        },
        '法库县公安局融智算项目标杆案例.docx': {
            size: '2.8MB',
            date: '2024-01-14',
            tags: ['公安', '融智算', '标杆案例', '项目实施'],
            author: '案例分析组',
            version: 'v1.0'
        },
        '移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx': {
            size: '8.5MB',
            date: '2024-01-12',
            tags: ['移动云', '市场拓展', '产品方案', '客群分析'],
            author: '市场拓展部',
            version: 'v1.2'
        },
        '辽宁省中小企业数字化转型政策.docx': {
            size: '1.8MB',
            date: '2024-01-10',
            tags: ['数字化转型', '政策解读', '中小企业', '辽宁省'],
            author: '政策研究组',
            version: 'v1.0'
        },
        '智算一体机内部培训材料.pptx': {
            size: '3.2MB',
            date: '2024-01-18',
            tags: ['智算一体机', '培训材料', '技术培训', '产品介绍'],
            author: '技术培训部',
            version: 'v1.0'
        },
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

    return documentsData[fileName] || documentsData['云电脑教育场景解决方案.pptx'];
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
    } else {
        alert(`正在下载 ${fileName}...`);
    }

    // 构建文件下载路径
    const downloadUrl = `uploads/${encodeURIComponent(fileName)}`;

    // 创建下载链接
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = 'none';

    // 添加到页面并触发下载
    document.body.appendChild(link);

    // 由于本地文件访问的CORS限制，直接尝试下载
    setTimeout(() => {
        try {
            // 直接触发下载
            link.click();
            if (typeof commonUtils !== 'undefined') {
                safeCommonUtils().showToast(`正在下载 ${fileName}`, 'success');

                // 提示用户
                setTimeout(() => {
                    safeCommonUtils().showToast('如果下载没有开始，请检查浏览器的下载设置', 'info');
                }, 2000);
            } else {
                alert(`正在下载 ${fileName}`);
            }

            // 记录下载统计
            trackDocumentDownload(fileName);

        } catch (error) {
            console.error('下载失败:', error);
            if (typeof commonUtils !== 'undefined') {
                safeCommonUtils().showToast('下载失败，请重试', 'error');
            } else {
                alert('下载失败，请重试');
            }
        }

        // 清理下载链接
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 1000);
    }, 500);
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
