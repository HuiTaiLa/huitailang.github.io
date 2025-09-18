// 引入安全工具函数
if (typeof safeCommonUtils === "undefined") {
    function safeCommonUtils() {
        return typeof window.commonUtils !== "undefined" ? window.commonUtils : {
            showToast: function(m,t) { console.log(`[${t}] ${m}`); },
            navigateTo: function(u) { window.location.href = u; },
            mockApiRequest: function() { return Promise.resolve({success:true,data:[]}); },
            showLoading: function(m) { console.log(`Loading: ${m}`); },
            hideLoading: function() { console.log('Loading hidden'); },
            storage: {
                get: function(key, defaultValue) {
                    try {
                        const value = localStorage.getItem(key);
                        return value ? JSON.parse(value) : defaultValue;
                    } catch {
                        return defaultValue;
                    }
                },
                set: function(key, value) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                    } catch {}
                }
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
            }
        };
    }
}
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
        const debouncedSearch = safeCommonUtils().debounce(function(query) {
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
    const searchFilters = document.querySelector('.search-filters');

    if (searchSection) {
        const isVisible = searchSection.classList.contains('active');

        if (isVisible) {
            // 当前可见，需要隐藏
            searchSection.classList.remove('active');
        } else {
            // 当前隐藏，需要显示
            searchSection.classList.add('active');

            // 隐藏筛选器，只显示搜索输入框
            if (searchFilters) {
                searchFilters.style.display = 'none';
            }

            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        safeCommonUtils().showToast('请输入搜索关键词', 'error');
        return;
    }
    
    // 保存搜索历史
    saveSearchHistory(query);
    
    // 执行搜索
    searchDocuments(query);
}

// 显示搜索建议
function showSearchSuggestions(query) {
    safeCommonUtils().mockApiRequest(`/api/documents/suggestions?q=${query}`)
        .then(response => {
            if (response.success) {
                // 这里可以显示搜索建议下拉框
                console.log('搜索建议:', response.data);
            }
        });
}

// 保存搜索历史
function saveSearchHistory(query) {
    let history = safeCommonUtils().storage.get('documentSearchHistory', []);
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    safeCommonUtils().storage.set('documentSearchHistory', history);
}

// 搜索文档
function searchDocuments(query) {
    safeCommonUtils().showLoading('搜索中...');

    // 模拟搜索延迟
    setTimeout(() => {
        safeCommonUtils().hideLoading();

        // 在真实文件中搜索
        const searchResults = window.REAL_FILES_DATA.filter(file => {
            const searchText = `${file.title} ${file.description} ${file.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        // 更新文档列表
        updateDocumentListWithFilteredFiles(searchResults);

        // 显示搜索结果
        safeCommonUtils().showToast(`找到 ${searchResults.length} 个相关结果`, 'success');

        // 重置显示的文件列表
        displayedFiles = [...searchResults];
    }, 800);
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

            // 统计分类点击
            trackCategoryClick(category);
        });
    });
}

// 按分类加载文档
function loadDocumentsByCategory(category) {
    safeCommonUtils().showLoading('加载中...');

    // 模拟加载延迟
    setTimeout(() => {
        safeCommonUtils().hideLoading();

        // 根据分类筛选真实文件
        let filteredFiles = window.REAL_FILES_DATA;
        if (category !== 'all') {
            filteredFiles = window.REAL_FILES_DATA.filter(file => file.category === category);
        }

        // 更新文档列表
        updateDocumentListWithFilteredFiles(filteredFiles);

        // 重置显示的文件列表
        displayedFiles = [...filteredFiles];
    }, 500);
}

// 更新文档列表（筛选后的文件）
function updateDocumentListWithFilteredFiles(files) {
    const documentItems = document.querySelector('.document-items');
    if (!documentItems) return;

    // 清空现有内容
    documentItems.innerHTML = '';

    // 重置显示的文件列表
    displayedFiles = [];

    // 添加筛选后的文件
    files.forEach((file, index) => {
        const docElement = createRealDocumentElement(file, index);
        documentItems.appendChild(docElement);
    });

    // 标记筛选后的文件为已显示
    displayedFiles = [...files];

    // 重新初始化文档列表事件
    setTimeout(() => {
        initDocumentList();
    }, 100);
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
    safeCommonUtils().navigateTo(`document-detail.html?id=${docId}&title=${encodeURIComponent(docTitle)}`);
}

// 下载文档
function downloadDocument(docId, docTitle) {
    safeCommonUtils().showLoading('准备下载...');
    
    safeCommonUtils().mockApiRequest(`/api/documents/${docId}/download`)
        .then(response => {
            safeCommonUtils().hideLoading();
            if (response.success) {
                // 模拟下载
                const link = document.createElement('a');
                link.href = response.data.downloadUrl || '#';
                link.download = docTitle + '.pdf';
                link.click();
                
                safeCommonUtils().showToast('下载开始', 'success');
                
                // 记录下载统计
                trackDocumentDownload(docId);
            } else {
                safeCommonUtils().showToast('下载失败，请重试', 'error');
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
    
    safeCommonUtils().mockApiRequest(`/api/documents/${docId}/favorite`, {
        method: 'POST',
        body: JSON.stringify({
            favorited: !isFavorited
        })
    }).then(response => {
        if (response.success) {
            if (isFavorited) {
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.innerHTML = '☆';
                safeCommonUtils().showToast('已取消收藏', 'info');
            } else {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '★';
                safeCommonUtils().showToast('已添加收藏', 'success');
                
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
            safeCommonUtils().showToast('链接已复制到剪贴板', 'success');
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
    safeCommonUtils().showLoading('排序中...');
    
    safeCommonUtils().mockApiRequest(`/api/documents/sort?by=${sortBy}`)
        .then(response => {
            safeCommonUtils().hideLoading();
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
}

// 应用筛选
function applyFilter(filterType) {
    safeCommonUtils().showLoading('筛选中...');
    
    safeCommonUtils().mockApiRequest(`/api/documents/filter?type=${filterType}`)
        .then(response => {
            safeCommonUtils().hideLoading();
            if (response.success) {
                updateDocumentList(response.data.documents);
            }
        });
}

// 真实文件数据 - 全局变量
window.REAL_FILES_DATA = [
    {
        filename: '云电脑教育场景解决方案.pptx',
        size: 25422197,
        type: 'pptx',
        title: '云电脑教育场景解决方案',
        description: '详细介绍云电脑在教育行业的应用场景、技术架构和实施方案',
        category: 'solution',
        tags: ['云电脑', '教育', '解决方案'],
        docType: '解决方案'
    },
    {
        filename: '智算一体机内部培训材料.pptx',
        size: 58290496,
        type: 'pptx',
        title: '智算一体机内部培训材料',
        description: '智算一体机产品的内部培训资料，包含产品特性、技术规格和应用指导',
        category: 'training',
        tags: ['智算一体机', '培训', '产品介绍'],
        docType: '培训资料'
    },
    {
        filename: '党政行业重点解决方案及案例.pptx',
        size: 1404128,
        type: 'pptx',
        title: '党政行业重点解决方案及案例',
        description: '党政行业数字化转型的重点解决方案和成功案例分析',
        category: 'case',
        tags: ['党政行业', '解决方案', '案例分析'],
        docType: '案例文档'
    },
    {
        filename: '辽宁省中小企业数字化转型政策.docx',
        size: 19423,
        type: 'docx',
        title: '辽宁省中小企业数字化转型政策',
        description: '辽宁省支持中小企业数字化转型的相关政策文件和实施细则',
        category: 'manual',
        tags: ['数字化转型', '政策文件', '中小企业'],
        docType: '政策文档'
    },
    {
        filename: '法库县公安局融智算项目标杆案例.docx',
        size: 16479,
        type: 'docx',
        title: '法库县公安局融智算项目标杆案例',
        description: '法库县公安局融智算项目的实施过程、技术方案和应用效果分析',
        category: 'case',
        tags: ['公安', '融智算', '标杆案例'],
        docType: '案例文档'
    },
    {
        filename: '移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx',
        size: 490617,
        type: 'pptx',
        title: '移动云分地市分行业分客群待拓清单及产品拓展方案',
        description: '移动云业务在不同地市、行业和客群的拓展策略和产品方案',
        category: 'solution',
        tags: ['移动云', '业务拓展', '产品方案'],
        docType: '业务方案'
    }
];

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 获取文件类型图标
function getFileTypeIcon(type) {
    const iconMap = {
        'pptx': { class: 'ppt-icon', text: 'PPT' },
        'docx': { class: 'doc-icon-type', text: 'DOC' },
        'pdf': { class: 'pdf-icon', text: 'PDF' },
        'xlsx': { class: 'excel-icon', text: 'XLS' },
        'mp4': { class: 'video-icon', text: 'MP4' }
    };
    return iconMap[type] || { class: 'doc-icon-type', text: 'DOC' };
}

// 加载资源数据
function loadResourceData() {
    // 加载真实文件数据
    loadRealFilesData();
}

// 加载真实文件数据
function loadRealFilesData() {
    // 更新热门推荐
    updateHotRecommendations();

    // 更新文档列表
    updateDocumentListWithRealFiles();
}

// 更新热门推荐
function updateHotRecommendations() {
    const hotList = document.querySelector('.hot-list');
    if (!hotList) return;

    // 随机选择2个文件作为热门推荐
    const shuffled = [...window.REAL_FILES_DATA].sort(() => 0.5 - Math.random());
    const hotFiles = shuffled.slice(0, 2);

    hotList.innerHTML = '';

    hotFiles.forEach((file, index) => {
        const hotItem = document.createElement('div');
        hotItem.className = 'hot-item';
        hotItem.dataset.docId = `hot_real_${index}`;
        hotItem.dataset.filename = file.filename;

        const icon = getFileTypeIcon(file.type);
        const iconEmoji = file.type === 'pptx' ? '📊' : '📋';

        hotItem.innerHTML = `
            <div class="hot-icon">${iconEmoji}</div>
            <div class="hot-content">
                <h4>${file.title}</h4>
                <p>${file.description}</p>
                <span class="hot-stats">📄 ${formatFileSize(file.size)} | 🗓 2025-09-18</span>
            </div>
        `;

        hotList.appendChild(hotItem);
    });

    // 重新初始化事件
    initDocumentList();
}

// 更新文档列表
function updateDocumentListWithRealFiles() {
    const documentItems = document.querySelector('.document-items');
    if (!documentItems) return;

    // 清空现有内容
    documentItems.innerHTML = '';

    // 重置显示的文件列表
    displayedFiles = [];

    // 添加真实文件
    window.REAL_FILES_DATA.forEach((file, index) => {
        const docElement = createRealDocumentElement(file, index);
        documentItems.appendChild(docElement);
    });

    // 标记所有文件为已显示
    displayedFiles = [...window.REAL_FILES_DATA];

    // 重新初始化文档列表事件
    setTimeout(() => {
        initDocumentList();
    }, 100);
}

// 创建真实文档元素
function createRealDocumentElement(file, index) {
    const docElement = document.createElement('div');
    docElement.className = 'doc-item';
    docElement.dataset.docId = `real_doc_${index}`;
    docElement.dataset.filename = file.filename;

    const icon = getFileTypeIcon(file.type);
    const formattedSize = formatFileSize(file.size);
    const fixedDate = '2025-09-18'; // 统一使用固定日期

    docElement.innerHTML = `
        <div class="doc-icon ${icon.class}">
            <span class="icon-text">${icon.text}</span>
        </div>
        <div class="doc-content">
            <h4>${file.title}</h4>
            <p class="doc-desc">${file.description}</p>
            <div class="doc-meta">
                <span class="doc-type">${file.docType}</span>
                <span class="doc-size">${formattedSize}</span>
                <span class="doc-date">${fixedDate}</span>
            </div>
            <div class="doc-tags">
                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        <div class="doc-actions">
            <button class="action-btn preview-btn">预览</button>
            <button class="action-btn download-btn">下载</button>
        </div>
    `;

    return docElement;
}

// 更新文档列表
function updateDocumentList(documents) {
    // 如果没有传入文档，使用真实文件数据
    if (!documents) {
        updateDocumentListWithRealFiles();
        return;
    }

    const documentList = document.querySelector('.document-list');
    if (!documentList) return;

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
    safeCommonUtils().mockApiRequest('/api/analytics/category-click', {
        method: 'POST',
        body: JSON.stringify({
            category: category,
            timestamp: Date.now()
        })
    });
}

// 统计文档查看
function trackDocumentView(docId) {
    safeCommonUtils().mockApiRequest(`/api/documents/${docId}/view`, {
        method: 'POST',
        body: JSON.stringify({
            timestamp: Date.now()
        })
    });
}

// 统计文档下载
function trackDocumentDownload(docId) {
    safeCommonUtils().mockApiRequest(`/api/documents/${docId}/download-stats`, {
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
let displayedFiles = [];

// 加载更多文档
function loadMoreDocuments() {
    return new Promise((resolve, reject) => {
        // 模拟API请求延迟
        setTimeout(() => {
            // 检查是否还有未显示的真实文件
            const startIndex = displayedFiles.length;
            const remainingFiles = window.REAL_FILES_DATA.slice(startIndex);

            if (remainingFiles.length > 0) {
                // 每次最多加载2个文件
                const filesToLoad = remainingFiles.slice(0, 2);
                appendRealDocuments(filesToLoad);
                displayedFiles.push(...filesToLoad);

                // 检查是否还有更多文件
                const hasMore = displayedFiles.length < window.REAL_FILES_DATA.length;
                resolve(hasMore);
            } else {
                // 没有更多数据
                safeCommonUtils().showToast('没有更多文档了', 'info');
                resolve(false);
            }
        }, 1000); // 模拟1秒加载时间
    });
}

// 追加真实文档到列表
function appendRealDocuments(files) {
    const documentItems = document.querySelector('.document-items');
    if (!documentItems) return;

    files.forEach((file, index) => {
        const docElement = createRealDocumentElement(file, displayedFiles.length + index);
        documentItems.appendChild(docElement);
    });

    // 重新初始化新添加的文档事件
    initDocumentList();
}

// 生成模拟文档数据 (已废弃，保留以防兼容性问题)
function generateMockDocuments(page) {
    // 不再生成模拟数据，返回空数组
    return [];
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
    safeCommonUtils().showToast('下载统计已记录', 'info');
}

function trackDocumentPreview(docId) {
    console.log('文档预览统计:', docId);
    // 这里可以发送预览统计数据到服务器
}

function trackCategoryClick(category) {
    console.log('分类点击统计:', category);
    // 这里可以发送分类点击统计数据到服务器
}
