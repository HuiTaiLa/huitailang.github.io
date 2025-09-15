// 资源库页面JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    initSearchFunctionality();
    initCategoryTabs();
    initDocumentList();
    initFilterOptions();
    initScrollLoading();
    loadResourceData();

    // 检查URL参数并自动选中对应分类
    checkUrlCategoryParameter();
});

// 初始化搜索功能
function initSearchFunctionality() {
    const searchBtn = document.querySelector('.search-btn');
    const searchSection = document.querySelector('.search-section');
    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit-btn');
    
    // 切换搜索框显示
    if (searchBtn) {
        searchBtn.addEventListener('click', toggleSearch);
    }
    
    // 搜索提交
    if (searchSubmit) {
        searchSubmit.addEventListener('click', performSearch);
    }
    
    // 搜索输入框回车
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 实时搜索建议
        const debouncedSearch = commonUtils.debounce(function(query) {
            if (query.length > 2) {
                showSearchSuggestions(query);
            }
        }, 300);
        
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value);
        });
    }
}

// 切换搜索框
function toggleSearch() {
    const searchSection = document.querySelector('.search-section');
    const searchInput = document.querySelector('.search-input');

    if (searchSection) {
        const isVisible = searchSection.classList.contains('active');

        if (isVisible) {
            // 当前可见，需要隐藏
            searchSection.classList.remove('active');
            commonUtils.showToast('搜索框已隐藏', 'info');
        } else {
            // 当前隐藏，需要显示
            searchSection.classList.add('active');
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
            commonUtils.showToast('搜索框已展开', 'info');
        }
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        commonUtils.showToast('请输入搜索关键词', 'error');
        return;
    }
    
    // 保存搜索历史
    saveSearchHistory(query);
    
    // 执行搜索
    searchDocuments(query);
}

// 显示搜索建议
function showSearchSuggestions(query) {
    commonUtils.mockApiRequest(`/api/documents/suggestions?q=${query}`)
        .then(response => {
            if (response.success) {
                // 这里可以显示搜索建议下拉框
                console.log('搜索建议:', response.data);
            }
        });
}

// 保存搜索历史
function saveSearchHistory(query) {
    let history = commonUtils.storage.get('documentSearchHistory', []);
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    commonUtils.storage.set('documentSearchHistory', history);
}

// 搜索文档
function searchDocuments(query) {
    commonUtils.showLoading('搜索中...');
    
    commonUtils.mockApiRequest(`/api/documents/search?q=${query}`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                updateDocumentList(response.data.results);
                commonUtils.showToast(`找到 ${response.data.total} 个相关结果`, 'success');
            }
        });
}

// 检查URL参数并自动选中分类
function checkUrlCategoryParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        // 找到对应的分类标签
        const targetTab = document.querySelector(`.tab-item[data-category="${category}"]`);

        if (targetTab) {
            // 移除所有标签的active状态
            const allTabs = document.querySelectorAll('.tab-item');
            allTabs.forEach(tab => tab.classList.remove('active'));

            // 激活目标标签
            targetTab.classList.add('active');

            // 加载对应分类的文档
            loadDocumentsByCategory(category);

            // 显示提示信息
            const categoryNames = {
                'training': '培训资料',
                'case': '客户案例',
                'manual': '产品手册',
                'solution': '解决方案',
                'all': '全部'
            };

            const categoryName = categoryNames[category] || category;
            commonUtils.showToast(`已切换到：${categoryName}`, 'success');

            // 滚动到分类导航区域
            const categoryNav = document.querySelector('.category-nav');
            if (categoryNav) {
                categoryNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
}

// 初始化分类标签
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.tab-item');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除其他标签的active状态
            categoryTabs.forEach(t => t.classList.remove('active'));

            // 添加当前标签的active状态
            this.classList.add('active');

            // 获取分类
            const category = this.dataset.category;

            // 加载对应分类的文档
            loadDocumentsByCategory(category);

            // 显示筛选反馈
            const categoryNames = {
                'training': '培训资料',
                'case': '客户案例',
                'manual': '产品手册',
                'solution': '解决方案',
                'all': '全部'
            };

            const categoryName = categoryNames[category] || category;
            commonUtils.showToast(`已切换到：${categoryName}`, 'info');

            // 统计分类点击
            trackCategoryClick(category);
        });
    });
}

// 按分类加载文档
function loadDocumentsByCategory(category) {
    commonUtils.showLoading('加载中...');
    
    commonUtils.mockApiRequest(`/api/documents/category/${category}`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
}

// 初始化文档列表
function initDocumentList() {
    const documentItems = document.querySelectorAll('.doc-item, .hot-item');
    
    documentItems.forEach(item => {
        // 文档点击事件
        item.addEventListener('click', function() {
            const docId = this.dataset.docId || `doc_${Date.now()}`;
            const docTitle = this.querySelector('h4').textContent;

            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 打开文档详情
            openDocumentDetail(docId, docTitle);
        });
        
        // 预览按钮事件
        const previewBtn = item.querySelector('.preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const docId = item.dataset.docId || `doc_${Date.now()}`;
                const docTitle = item.querySelector('h4').textContent;
                previewDocument(docId, docTitle);
            });
        }

        // 下载按钮事件
        const downloadBtn = item.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const docId = item.dataset.docId || `doc_${Date.now()}`;
                const docTitle = item.querySelector('h4').textContent;
                downloadDocument(docId, docTitle);
            });
        }

        // 收藏按钮事件
        const favoriteBtn = item.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const docId = item.dataset.docId || `doc_${Date.now()}`;
                toggleFavorite(docId, this);
            });
        }

        // 分享按钮事件
        const shareBtn = item.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const docId = item.dataset.docId || `doc_${Date.now()}`;
                const docTitle = item.querySelector('h4').textContent;
                shareDocument(docId, docTitle);
            });
        }
    });
}

// 打开文档详情
function openDocumentDetail(docId, docTitle) {
    // 记录文档访问
    trackDocumentView(docId);
    
    // 跳转到文档详情页面
    commonUtils.navigateTo(`document-detail.html?id=${docId}&title=${encodeURIComponent(docTitle)}`);
}

// 下载文档
function downloadDocument(docId, docTitle) {
    commonUtils.showLoading('准备下载...');
    
    commonUtils.mockApiRequest(`/api/documents/${docId}/download`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                // 模拟下载
                const link = document.createElement('a');
                link.href = response.data.downloadUrl || '#';
                link.download = docTitle + '.pdf';
                link.click();
                
                commonUtils.showToast('下载开始', 'success');
                
                // 记录下载统计
                trackDocumentDownload(docId);
            } else {
                commonUtils.showToast('下载失败，请重试', 'error');
            }
        });
}

// 预览文档
function previewDocument(docId, docTitle) {
    // 显示预览模态框
    showDocumentPreview(docId, docTitle);

    // 记录预览统计
    trackDocumentPreview(docId);
}

// 显示文档预览模态框
function showDocumentPreview(docId, docTitle) {
    const modal = document.createElement('div');
    modal.className = 'document-preview-modal';
    modal.innerHTML = `
        <div class="modal-content preview-content">
            <div class="modal-header">
                <h3>📄 文档预览</h3>
                <button class="close-btn" onclick="this.closest('.document-preview-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="preview-info">
                    <h4>${docTitle}</h4>
                    <div class="preview-meta">
                        <span class="doc-id">文档ID: ${docId}</span>
                        <span class="preview-time">预览时间: ${new Date().toLocaleString()}</span>
                    </div>
                </div>

                <div class="preview-content-area">
                    <div class="preview-placeholder">
                        <div class="preview-icon">📄</div>
                        <h4>文档预览</h4>
                        <p>这里将显示文档的预览内容</p>
                        <div class="preview-pages">
                            <div class="page-preview">
                                <div class="page-content">
                                    <div class="page-header">移动云平台技术文档</div>
                                    <div class="page-text">
                                        <div class="text-line"></div>
                                        <div class="text-line short"></div>
                                        <div class="text-line"></div>
                                        <div class="text-line medium"></div>
                                        <div class="text-line"></div>
                                        <div class="text-line short"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn secondary" onclick="this.closest('.document-preview-modal').remove()">关闭</button>
                <button class="btn primary" onclick="downloadDocument('${docId}', '${docTitle}')">下载文档</button>
                <button class="btn primary" onclick="openDocumentDetail('${docId}', '${docTitle}')">查看详情</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // 模拟加载预览内容
    setTimeout(() => {
        const placeholder = modal.querySelector('.preview-placeholder');
        if (placeholder) {
            placeholder.classList.add('loaded');
        }
    }, 1000);
}

// 切换收藏状态
function toggleFavorite(docId, favoriteBtn) {
    const isFavorited = favoriteBtn.classList.contains('favorited');
    
    commonUtils.mockApiRequest(`/api/documents/${docId}/favorite`, {
        method: 'POST',
        body: JSON.stringify({
            favorited: !isFavorited
        })
    }).then(response => {
        if (response.success) {
            if (isFavorited) {
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.innerHTML = '☆';
                commonUtils.showToast('已取消收藏', 'info');
            } else {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '★';
                commonUtils.showToast('已添加收藏', 'success');
                
                // 添加收藏动画
                favoriteBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    favoriteBtn.style.transform = '';
                }, 200);
            }
        }
    });
}

// 分享文档
function shareDocument(docId, docTitle) {
    const shareUrl = `${window.location.origin}/document-detail.html?id=${docId}`;
    
    if (navigator.share) {
        navigator.share({
            title: docTitle,
            text: `推荐一个文档：${docTitle}`,
            url: shareUrl
        });
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(shareUrl).then(() => {
            commonUtils.showToast('链接已复制到剪贴板', 'success');
        });
    }
}

// 初始化筛选选项
function initFilterOptions() {
    const sortSelect = document.querySelector('.sort-select');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // 排序选择
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortDocuments(sortBy);
        });
    }
    
    // 筛选按钮
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            applyFilter(filterType);
        });
    });
}

// 初始化滚动加载
function initScrollLoading() {
    let isLoading = false;
    let hasMoreData = true;
    const scrollLoadingElement = document.getElementById('scrollLoading');

    // 监听滚动事件
    window.addEventListener('scroll', function() {
        // 如果正在加载或没有更多数据，则不执行
        if (isLoading || !hasMoreData) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 距离底部100px时开始加载
        if (scrollTop + windowHeight >= documentHeight - 100) {
            isLoading = true;

            // 显示加载提示
            if (scrollLoadingElement) {
                scrollLoadingElement.style.display = 'flex';
            }

            // 执行加载更多
            loadMoreDocuments().then((hasMore) => {
                isLoading = false;
                hasMoreData = hasMore;

                // 隐藏加载提示
                if (scrollLoadingElement) {
                    scrollLoadingElement.style.display = 'none';
                }
            }).catch(() => {
                isLoading = false;

                // 隐藏加载提示
                if (scrollLoadingElement) {
                    scrollLoadingElement.style.display = 'none';
                }
            });
        }
    });
}

// 排序文档
function sortDocuments(sortBy) {
    commonUtils.showLoading('排序中...');
    
    commonUtils.mockApiRequest(`/api/documents/sort?by=${sortBy}`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
}

// 应用筛选
function applyFilter(filterType) {
    commonUtils.showLoading('筛选中...');
    
    commonUtils.mockApiRequest(`/api/documents/filter?type=${filterType}`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
}

// 加载资源数据
function loadResourceData() {
    // 加载热门文档
    commonUtils.mockApiRequest('/api/documents/popular')
        .then(response => {
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
    
    // 加载分类统计
    commonUtils.mockApiRequest('/api/documents/categories/stats')
        .then(response => {
            if (response.success) {
                updateCategoryStats(response.data);
            }
        });
}

// 更新文档列表
function updateDocumentList(documents) {
    const documentList = document.querySelector('.document-list');
    if (!documentList || !documents) return;
    
    // 这里可以动态更新文档列表
    console.log('更新文档列表:', documents);
    
    // 重新初始化文档列表事件
    setTimeout(() => {
        initDocumentList();
    }, 100);
}

// 更新分类统计
function updateCategoryStats(stats) {
    const categoryTabs = document.querySelectorAll('.category-tab');
    
    categoryTabs.forEach(tab => {
        const category = tab.dataset.category;
        const count = stats[category] || 0;
        
        // 更新分类数量显示
        const countElement = tab.querySelector('.category-count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// 统计分类点击
function trackCategoryClick(category) {
    commonUtils.mockApiRequest('/api/analytics/category-click', {
        method: 'POST',
        body: JSON.stringify({
            category: category,
            timestamp: Date.now()
        })
    });
}

// 统计文档查看
function trackDocumentView(docId) {
    commonUtils.mockApiRequest(`/api/documents/${docId}/view`, {
        method: 'POST',
        body: JSON.stringify({
            timestamp: Date.now()
        })
    });
}

// 统计文档下载
function trackDocumentDownload(docId) {
    commonUtils.mockApiRequest(`/api/documents/${docId}/download-stats`, {
        method: 'POST',
        body: JSON.stringify({
            timestamp: Date.now()
        })
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadResourceData();
    }
});

// 全局变量
let currentPage = 1;

// 加载更多文档
function loadMoreDocuments() {
    return new Promise((resolve, reject) => {
        // 模拟API请求延迟
        setTimeout(() => {
            // 模拟数据
            const mockDocuments = generateMockDocuments(currentPage);

            if (mockDocuments.length > 0) {
                appendDocuments(mockDocuments);
                currentPage++;

                // 模拟最多加载5页数据
                const hasMore = currentPage < 5;
                resolve(hasMore);
            } else {
                // 没有更多数据
                commonUtils.showToast('没有更多文档了', 'info');
                resolve(false);
            }
        }, 1000); // 模拟1秒加载时间
    });
}

// 生成模拟文档数据
function generateMockDocuments(page) {
    if (page >= 5) return []; // 最多5页数据

    const documentTypes = [
        { type: 'pdf', icon: 'pdf-icon', text: 'PDF' },
        { type: 'video', icon: 'video-icon', text: 'MP4' },
        { type: 'doc', icon: 'doc-icon-type', text: 'DOC' },
        { type: 'ppt', icon: 'ppt-icon', text: 'PPT' },
        { type: 'excel', icon: 'excel-icon', text: 'XLS' }
    ];

    const titles = [
        '云原生架构设计指南',
        '微服务治理最佳实践',
        '容器化部署实战手册',
        'DevOps流程优化方案',
        '数据库性能调优指南',
        '网络安全防护策略',
        '移动应用开发规范',
        '大数据分析平台搭建'
    ];

    const descriptions = [
        '详细介绍云原生架构的设计原则和实施方法',
        '涵盖微服务治理的各个方面，包括服务发现、配置管理等',
        '从基础概念到实际部署的完整容器化指南',
        '优化开发运维流程，提升团队协作效率',
        '数据库性能优化的实用技巧和工具推荐',
        '全面的网络安全防护体系建设方案',
        '移动应用开发的标准化流程和规范要求',
        '构建企业级大数据分析平台的技术方案'
    ];

    const mockDocs = [];
    for (let i = 0; i < 3; i++) { // 每页3个文档
        const typeInfo = documentTypes[Math.floor(Math.random() * documentTypes.length)];
        const titleIndex = (page * 3 + i) % titles.length;

        mockDocs.push({
            id: `doc_${page}_${i}`,
            title: titles[titleIndex],
            description: descriptions[titleIndex],
            type: typeInfo.type,
            iconClass: typeInfo.icon,
            iconText: typeInfo.text,
            size: `${(Math.random() * 5 + 0.5).toFixed(1)}MB`,
            date: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            docType: ['技术文档', '培训资料', '案例分析', '产品手册'][Math.floor(Math.random() * 4)],
            tags: [
                ['云计算', '架构设计'],
                ['微服务', '治理'],
                ['容器', '部署'],
                ['DevOps', '流程优化'],
                ['数据库', '性能调优']
            ][Math.floor(Math.random() * 5)]
        });
    }

    return mockDocs;
}

// 追加文档到列表
function appendDocuments(documents) {
    const documentItems = document.querySelector('.document-items');
    if (!documentItems) return;

    documents.forEach(doc => {
        const docElement = createDocumentElement(doc);
        documentItems.appendChild(docElement);
    });

    // 重新初始化新添加的文档事件
    initDocumentList();
}

// 创建文档元素
function createDocumentElement(doc) {
    const docElement = document.createElement('div');
    docElement.className = 'doc-item';
    docElement.dataset.docId = doc.id;

    // 使用传入的图标信息或默认值
    const iconClass = doc.iconClass || 'doc-icon-type';
    const iconText = doc.iconText || 'DOC';
    const docType = doc.docType || '技术文档';
    const tags = doc.tags || [];

    docElement.innerHTML = `
        <div class="doc-icon ${iconClass}">
            <span class="icon-text">${iconText}</span>
        </div>
        <div class="doc-content">
            <h4>${doc.title}</h4>
            <p class="doc-desc">${doc.description}</p>
            <div class="doc-meta">
                <span class="doc-type">${docType}</span>
                <span class="doc-size">${doc.size}</span>
                <span class="doc-date">${doc.date}</span>
            </div>
            <div class="doc-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        <div class="doc-actions">
            <button class="action-btn preview-btn">预览</button>
            <button class="action-btn download-btn">下载</button>
        </div>
    `;

    return docElement;
}

// 统计函数
function trackDocumentView(docId) {
    console.log('文档查看统计:', docId);
    // 这里可以发送统计数据到服务器
}

function trackDocumentDownload(docId) {
    console.log('文档下载统计:', docId);
    commonUtils.showToast('下载统计已记录', 'info');
}

function trackDocumentPreview(docId) {
    console.log('文档预览统计:', docId);
    // 这里可以发送预览统计数据到服务器
}

function trackCategoryClick(category) {
    console.log('分类点击统计:', category);
    // 这里可以发送分类点击统计数据到服务器
}
