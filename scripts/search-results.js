// 搜索结果页面JavaScript功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSearchResults();
    initFilterTabs();
    initSortOptions();
    initSearchInput();
    initScrollLoading();
    loadSearchResults();
});

// 初始化搜索结果页面
function initSearchResults() {
    console.log('搜索结果页面初始化');
    
    // 从URL参数获取搜索关键词
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || urlParams.get('query') || '5G专网';
    
    // 更新页面显示的搜索关键词
    updateSearchQuery(query);
    
    // 设置搜索输入框的值
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
    }
    
    // 初始化结果项点击事件
    initResultItemEvents();
}

// 更新搜索关键词显示
function updateSearchQuery(query) {
    const currentQueryElement = document.getElementById('currentQuery');
    if (currentQueryElement) {
        currentQueryElement.textContent = query;
    }
    
    // 更新AI推荐内容
    updateAIRecommendations(query);
}

// 更新AI推荐
function updateAIRecommendations(query) {
    const aiContent = document.querySelector('.ai-content p');
    if (aiContent) {
        aiContent.textContent = `基于您的搜索"${query}"，为您推荐以下相关内容：`;
    }
}

// 初始化筛选标签
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除其他标签的active状态
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前标签的active状态
            this.classList.add('active');
            
            // 获取筛选类型
            const filterType = this.dataset.type;
            
            // 执行筛选
            filterResults(filterType);
            
            // 显示筛选反馈
            if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
                commonUtils.showToast(`已筛选：${this.textContent}`, 'info');
            }
        });
    });
}

// 筛选结果
function filterResults(type) {
    const resultItems = document.querySelectorAll('.result-item');
    
    resultItems.forEach(item => {
        if (type === 'all') {
            item.style.display = 'block';
        } else {
            const itemType = getResultItemType(item);
            if (itemType === type) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
    
    // 更新结果统计
    updateResultStats();
}

// 获取结果项类型
function getResultItemType(item) {
    if (item.classList.contains('document-result')) return 'document';
    if (item.classList.contains('qa-result')) return 'qa';
    if (item.classList.contains('video-result')) return 'video';
    if (item.classList.contains('solution-result')) return 'document';
    return 'document';
}

// 初始化排序选项
function initSortOptions() {
    const sortSelect = document.querySelector('.sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortType = this.value;
            sortResults(sortType);
            
            // 显示排序反馈
            if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
                const sortText = this.options[this.selectedIndex].text;
                commonUtils.showToast(`已按${sortText}排序`, 'info');
            }
        });
    }
}

// 排序结果
function sortResults(sortType) {
    const resultsContainer = document.querySelector('.search-results');
    const resultItems = Array.from(document.querySelectorAll('.result-item'));
    
    // 根据排序类型排序
    resultItems.sort((a, b) => {
        switch (sortType) {
            case 'time':
                return sortByTime(a, b);
            case 'popularity':
                return sortByPopularity(a, b);
            case 'relevance':
            default:
                return sortByRelevance(a, b);
        }
    });
    
    // 重新排列DOM元素
    resultItems.forEach(item => {
        resultsContainer.appendChild(item);
    });
    
    // 添加排序动画
    resultItems.forEach((item, index) => {
        item.style.animation = 'none';
        setTimeout(() => {
            item.style.animation = `fadeInUp 0.3s ease ${index * 0.1}s both`;
        }, 10);
    });
}

// 按时间排序
function sortByTime(a, b) {
    const timeA = getResultTime(a);
    const timeB = getResultTime(b);
    return timeB - timeA; // 新的在前
}

// 按热度排序
function sortByPopularity(a, b) {
    const popularityA = getResultPopularity(a);
    const popularityB = getResultPopularity(b);
    return popularityB - popularityA; // 热度高的在前
}

// 按相关性排序
function sortByRelevance(a, b) {
    const relevanceA = getResultRelevance(a);
    const relevanceB = getResultRelevance(b);
    return relevanceB - relevanceA; // 相关性高的在前
}

// 获取结果时间（模拟）
function getResultTime(item) {
    const dateText = item.querySelector('.result-date')?.textContent || '';
    if (dateText.includes('天前')) {
        const days = parseInt(dateText.match(/(\d+)天前/)?.[1] || '0');
        return Date.now() - days * 24 * 60 * 60 * 1000;
    } else if (dateText.includes('周前')) {
        const weeks = parseInt(dateText.match(/(\d+)周前/)?.[1] || '0');
        return Date.now() - weeks * 7 * 24 * 60 * 60 * 1000;
    } else {
        return Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // 随机30天内
    }
}

// 获取结果热度（模拟）
function getResultPopularity(item) {
    const viewsText = item.querySelector('.result-views')?.textContent || '';
    const downloadsText = item.querySelector('.result-downloads')?.textContent || '';
    
    let popularity = 0;
    
    // 从查看次数提取数字
    const viewsMatch = viewsText.match(/(\d+)/);
    if (viewsMatch) {
        popularity += parseInt(viewsMatch[1]);
    }
    
    // 从下载次数提取数字
    const downloadsMatch = downloadsText.match(/(\d+)/);
    if (downloadsMatch) {
        popularity += parseInt(downloadsMatch[1]) * 2; // 下载权重更高
    }
    
    return popularity;
}

// 获取结果相关性（模拟）
function getResultRelevance(item) {
    const scoreText = item.querySelector('.result-score')?.textContent || '';
    const match = scoreText.match(/(\d+)%/);
    return match ? parseInt(match[1]) : Math.floor(Math.random() * 100);
}

// 初始化搜索输入框
function initSearchInput() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // 回车搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 实时搜索建议（防抖）
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = this.value.trim();
                if (query.length > 1) {
                    showSearchSuggestions(query);
                }
            }, 300);
        });
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
            commonUtils.showToast('请输入搜索关键词', 'error');
        }
        return;
    }
    
    // 显示搜索中状态
    if (typeof commonUtils !== 'undefined' && commonUtils.showLoading) {
        commonUtils.showLoading('搜索中...');
    }
    
    // 更新URL
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
    window.history.pushState({}, '', newUrl);
    
    // 更新页面内容
    updateSearchQuery(query);
    
    // 模拟搜索请求
    setTimeout(() => {
        if (typeof commonUtils !== 'undefined' && commonUtils.hideLoading) {
            commonUtils.hideLoading();
        }
        
        // 重新加载搜索结果
        loadSearchResults(query);
        
        if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
            commonUtils.showToast(`搜索"${query}"完成`, 'success');
        }
    }, 1000);
}

// 加载搜索结果
function loadSearchResults(query) {
    const startTime = performance.now();

    // 获取当前查询词（从URL或输入框）
    const currentQuery = query || getSearchQuery();

    if (currentQuery) {
        // 生成与查询词相关的搜索结果
        const searchResults = generateRelevantResults(currentQuery);

        // 计算实际搜索用时
        const endTime = performance.now();
        const searchTime = ((endTime - startTime) / 1000).toFixed(3);

        // 更新搜索结果显示
        displaySearchResults(searchResults);

        // 更新统计信息 - 显示全量结果总数
        updateResultStats(searchResults.totalCount || searchResults.length, searchTime);

        console.log(`搜索"${currentQuery}"完成，找到${searchResults.length}个结果，用时${searchTime}秒`);
    } else {
        // 没有查询词时显示默认结果
        const defaultResults = generateDefaultResults();
        displaySearchResults(defaultResults);
        updateResultStats(defaultResults.totalCount || defaultResults.length, '0.001');
    }
}

// 获取搜索查询词
function getSearchQuery() {
    // 首先从URL参数获取
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');

    if (urlQuery) {
        // 更新搜索输入框
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !searchInput.value) {
            searchInput.value = urlQuery;
        }
        return urlQuery;
    }

    // 然后从搜索输入框获取
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        return searchInput.value.trim();
    }

    return '';
}

// 更新结果统计
function updateResultStats(count, time) {
    const resultCountElement = document.getElementById('resultCount');
    const searchTimeElement = document.querySelector('.search-time');

    if (resultCountElement) {
        if (count !== undefined) {
            resultCountElement.textContent = `找到 ${count} 个相关结果`;
        } else {
            // 重新计算当前显示的结果数量
            const visibleResults = document.querySelectorAll('.result-item[style*="block"], .result-item:not([style*="none"])').length;
            resultCountElement.textContent = `找到 ${visibleResults} 个相关结果`;
        }
    }

    if (searchTimeElement && time !== undefined) {
        searchTimeElement.textContent = `用时 ${time} 秒`;
    }
}

// 更新结果内容（已禁用高亮功能）
function updateResultsContent(query) {
    // 高亮功能已禁用，保留函数以防其他地方调用
    // 如需重新启用高亮，可以取消下面代码的注释
    /*
    const resultSnippets = document.querySelectorAll('.result-snippet');
    resultSnippets.forEach(snippet => {
        let content = snippet.innerHTML;
        // 移除现有的mark标签
        content = content.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
        // 添加新的高亮
        const regex = new RegExp(`(${query})`, 'gi');
        content = content.replace(regex, '<mark>$1</mark>');
        snippet.innerHTML = content;
    });
    */
}

// 初始化结果项事件
function initResultItemEvents() {
    // 结果项整体点击事件
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 如果点击的是按钮，不触发整体点击事件
            if (e.target.closest('.action-btn')) {
                return;
            }

            const resultId = this.dataset.resultId;
            const resultType = this.dataset.resultType || getResultItemType(this);
            const titleText = this.querySelector('.result-title').textContent;

            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 根据类型跳转到不同页面
            switch (resultType) {
                case 'document':
                case 'solution':
                    navigateToDocument(titleText, resultId);
                    break;
                case 'qa':
                    navigateToQA(titleText, resultId);
                    break;
                case 'video':
                    navigateToVideo(titleText, resultId);
                    break;
                default:
                    navigateToDocument(titleText, resultId);
            }
        });
    });

    // 结果标题点击事件（额外的点击区域）
    const resultTitles = document.querySelectorAll('.result-title');
    resultTitles.forEach(title => {
        title.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止重复触发
            const resultItem = this.closest('.result-item');
            resultItem.click(); // 触发整体点击事件
        });
    });

    // 操作按钮事件
    initActionButtons();
}

// 初始化操作按钮
function initActionButtons() {
    // 预览按钮
    const previewBtns = document.querySelectorAll('.preview-btn');
    previewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.result-item').querySelector('.result-title').textContent;
            previewDocument(title);
        });
    });
    
    // 下载按钮
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.result-item').querySelector('.result-title').textContent;
            downloadDocument(title);
        });
    });
    
    // 收藏按钮
    const collectBtns = document.querySelectorAll('.collect-btn');
    collectBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.result-item').querySelector('.result-title').textContent;
            collectDocument(title, this);
        });
    });
    
    // 播放按钮
    const playBtns = document.querySelectorAll('.play-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.result-item').querySelector('.result-title').textContent;
            playVideo(title);
        });
    });
    
    // 查看按钮
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.result-item').querySelector('.result-title').textContent;
            const resultType = getResultItemType(this.closest('.result-item'));
            
            if (resultType === 'qa') {
                navigateToQA(title);
            } else {
                navigateToDocument(title);
            }
        });
    });
    
    // 咨询专家按钮
    const consultBtns = document.querySelectorAll('.consult-btn');
    consultBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            consultExpert();
        });
    });
}

// 导航函数
function navigateToDocument(title, resultId) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`正在打开文档：${title}`, 'info');
    }

    // 跳转到文档详情页
    setTimeout(() => {
        const url = `resource-library.html?doc=${encodeURIComponent(resultId)}&title=${encodeURIComponent(title)}`;
        window.location.href = url;
    }, 500);
}

function navigateToQA(title, resultId) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`正在打开问答：${title}`, 'info');
    }

    // 跳转到问答详情页
    setTimeout(() => {
        const url = `qa-system.html?qa=${encodeURIComponent(resultId)}&title=${encodeURIComponent(title)}`;
        window.location.href = url;
    }, 500);
}

function navigateToVideo(title, resultId) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`正在打开视频：${title}`, 'info');
    }

    // 跳转到视频播放页（这里暂时跳转到资源库）
    setTimeout(() => {
        const url = `resource-library.html?video=${encodeURIComponent(resultId)}&title=${encodeURIComponent(title)}`;
        window.location.href = url;
    }, 500);
}

// 功能函数
function previewDocument(title) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`预览文档：${title}`, 'info');
    }
}

function downloadDocument(title) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`下载文档：${title}`, 'success');
    }
}

function collectDocument(title, button) {
    const isCollected = button.textContent === '已收藏';
    
    if (isCollected) {
        button.textContent = '收藏';
        button.style.background = '#ffc107';
        if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
            commonUtils.showToast(`已取消收藏：${title}`, 'info');
        }
    } else {
        button.textContent = '已收藏';
        button.style.background = '#28a745';
        if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
            commonUtils.showToast(`已收藏：${title}`, 'success');
        }
    }
}

function playVideo(title) {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast(`播放视频：${title}`, 'info');
    }
}

function consultExpert() {
    if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
        commonUtils.showToast('正在为您联系专家...', 'info');
    }
}

// AI建议和相关搜索
function searchSuggestion(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        performSearch();
    }
}

function searchRelated(query) {
    searchSuggestion(query);
}

// 显示搜索建议
function showSearchSuggestions(query) {
    // 这里可以实现搜索建议功能
    console.log('搜索建议:', query);
}

// 初始化滚动加载
function initScrollLoading() {
    let isLoading = false;
    let hasMoreData = true;
    let currentPage = 1;

    window.addEventListener('scroll', function() {
        if (isLoading || !hasMoreData) return;

        // 检查是否接近页面底部
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 100) {
            loadMoreResults();
        }
    });

    function loadMoreResults() {
        if (isLoading) return;

        isLoading = true;
        currentPage++;

        // 显示加载提示
        const scrollLoading = document.getElementById('scrollLoading');
        if (scrollLoading) {
            scrollLoading.style.display = 'flex';
        }

        // 模拟API请求
        setTimeout(() => {
            // 获取当前查询词并生成更多相关结果
            const currentQuery = getSearchQuery();
            const moreResults = currentQuery ?
                generateRelevantResults(currentQuery).slice(0, 5) :
                generateDefaultResults().slice(0, 3);

            appendResults(moreResults);

            // 隐藏加载提示
            if (scrollLoading) {
                scrollLoading.style.display = 'none';
            }

            isLoading = false;

            // 模拟数据加载完毕
            if (currentPage >= 5) {
                hasMoreData = false;
                if (scrollLoading) {
                    scrollLoading.innerHTML = '<span style="color: #999;">已加载全部结果</span>';
                    scrollLoading.style.display = 'flex';
                }
            }

            // 更新结果统计
            const currentCount = document.querySelectorAll('.result-item').length;
            updateResultStats(currentCount);

            if (typeof commonUtils !== 'undefined' && commonUtils.showToast) {
                commonUtils.showToast('已加载更多结果', 'success');
            }
        }, 1000);
    }
}

// 生成与查询词相关的搜索结果
function generateRelevantResults(query) {
    const results = [];
    const queryLower = query.toLowerCase();

    // 定义知识库数据
    const knowledgeBase = [
        // 产品手册相关
        { keywords: ['产品手册', '手册', '产品', '说明书', '指南'], type: 'document', category: '产品手册',
          titles: ['5G专网产品手册', '移动云产品使用指南', '专网设备安装手册', '产品功能说明书', '技术规格手册'] },

        // 故障排查相关
        { keywords: ['故障排查', '故障', '排查', '问题', '错误', '异常', '修复'], type: 'qa', category: '故障排查',
          titles: ['网络连接故障排查指南', '5G信号异常处理方案', '设备故障诊断手册', '常见问题解决方案', '系统错误排查流程'] },

        // 客户案例相关
        { keywords: ['客户案例', '案例', '客户', '成功案例', '应用案例', '实施案例'], type: 'solution', category: '客户案例',
          titles: ['某大型企业5G专网部署案例', '工业互联网应用成功案例', '智慧工厂网络改造案例', '医院专网建设案例', '教育行业网络升级案例'] },

        // 5G专网相关
        { keywords: ['5g', '专网', '5g专网', '网络', '通信'], type: 'document', category: '技术文档',
          titles: ['5G专网技术深度解析', '专网安全防护最佳实践', '5G网络切片技术应用', '专网部署实施指南', '5G专网性能优化'] },

        // 培训资料相关
        { keywords: ['培训', '培训资料', '学习', '教程', '课程'], type: 'video', category: '培训资料',
          titles: ['5G专网技术培训课程', '网络运维培训教程', '产品操作培训视频', '技术认证培训资料', '专业技能培训指南'] },

        // 解决方案相关
        { keywords: ['解决方案', '方案', '解决', '实施', '部署'], type: 'solution', category: '解决方案',
          titles: ['企业专网解决方案', '工业互联网整体方案', '智慧城市网络方案', '医疗专网建设方案', '教育网络升级方案'] }
    ];

    // 查找匹配的类别
    const matchedCategories = [];
    knowledgeBase.forEach(category => {
        const matchScore = calculateCategoryMatch(queryLower, category.keywords);
        if (matchScore > 0) {
            matchedCategories.push({ ...category, matchScore });
        }
    });

    // 按匹配度排序
    matchedCategories.sort((a, b) => b.matchScore - a.matchScore);

    // 生成搜索结果
    let resultId = 1;
    matchedCategories.forEach(category => {
        category.titles.forEach(title => {
            const titleMatchScore = calculateTitleMatch(queryLower, title.toLowerCase());
            const finalScore = Math.max(category.matchScore, titleMatchScore);

            if (finalScore > 0) {
                results.push({
                    id: `result_${Date.now()}_${resultId++}`,
                    type: category.type,
                    category: category.category,
                    title: title,
                    snippet: generateRelevantSnippet(query, title, category.category),
                    score: Math.min(99, Math.max(60, Math.round(finalScore * 100))),
                    date: `${Math.floor(Math.random() * 30) + 1}天前`,
                    matchScore: finalScore
                });
            }
        });
    });

    // 按匹配度排序
    results.sort((a, b) => b.matchScore - a.matchScore);

    // 模拟全量搜索结果总数（实际项目中这应该来自后端API）
    const totalCount = results.length + Math.floor(Math.random() * 200) + 50; // 模拟更多结果

    // 返回分页结果，但保留总数信息
    const pagedResults = results.slice(0, Math.min(15, results.length));
    pagedResults.totalCount = totalCount; // 添加总数属性

    return pagedResults;
}

// 计算类别匹配度
function calculateCategoryMatch(query, keywords) {
    let maxScore = 0;
    keywords.forEach(keyword => {
        const score = calculateStringMatch(query, keyword.toLowerCase());
        maxScore = Math.max(maxScore, score);
    });
    return maxScore;
}

// 计算标题匹配度
function calculateTitleMatch(query, title) {
    return calculateStringMatch(query, title);
}

// 计算字符串匹配度
function calculateStringMatch(query, target) {
    if (!query || !target) return 0;

    // 完全匹配
    if (target.includes(query)) {
        return query.length / target.length;
    }

    // 分词匹配
    const queryWords = query.split(/\s+/);
    const targetWords = target.split(/\s+/);
    let matchedWords = 0;

    queryWords.forEach(queryWord => {
        if (queryWord.length > 0) {
            targetWords.forEach(targetWord => {
                if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) {
                    matchedWords++;
                }
            });
        }
    });

    return matchedWords / Math.max(queryWords.length, targetWords.length);
}

// 生成相关的摘要内容
function generateRelevantSnippet(query, title, category) {
    const snippetTemplates = {
        '产品手册': `本${title}详细介绍了与"${query}"相关的产品功能、技术规格和使用方法，包含完整的操作指南和最佳实践建议。`,
        '故障排查': `针对"${query}"相关问题，本文档提供了详细的故障诊断流程、常见问题解决方案和预防措施，帮助快速定位和解决问题。`,
        '客户案例': `本案例展示了"${query}"在实际项目中的成功应用，包含详细的实施过程、技术方案和效果评估，为类似项目提供参考。`,
        '技术文档': `深入解析"${query}"的核心技术原理、实现方案和应用场景，提供专业的技术指导和实践经验分享。`,
        '培训资料': `系统性的"${query}"培训内容，涵盖基础理论、实操演练和案例分析，适合不同层次的学习需求。`,
        '解决方案': `针对"${query}"需求设计的完整解决方案，包含技术架构、实施计划和成本分析，确保项目成功交付。`
    };

    return snippetTemplates[category] || `关于"${query}"的详细内容，包含相关的技术要点、实施方案和最佳实践建议。`;
}

// 生成默认结果（无查询词时）
function generateDefaultResults() {
    const defaultResults = [
        {
            id: 'default_1',
            type: 'document',
            category: '热门文档',
            title: '5G专网技术概述',
            snippet: '全面介绍5G专网的核心技术、应用场景和发展趋势，为技术人员提供专业指导。',
            score: 95,
            date: '2天前',
            matchScore: 0.9
        },
        {
            id: 'default_2',
            type: 'solution',
            category: '推荐方案',
            title: '企业专网建设指南',
            snippet: '详细的企业专网规划、设计和实施指南，包含最佳实践和案例分析。',
            score: 92,
            date: '5天前',
            matchScore: 0.85
        },
        {
            id: 'default_3',
            type: 'qa',
            category: '常见问题',
            title: '网络连接问题解决方案',
            snippet: '汇总了常见的网络连接问题及其解决方法，帮助快速排查和修复网络故障。',
            score: 88,
            date: '1周前',
            matchScore: 0.8
        }
    ];

    // 为默认结果也添加总数信息
    defaultResults.totalCount = 156; // 模拟全量默认结果总数

    return defaultResults;
}

// 显示搜索结果
function displaySearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    if (!searchResults) return;

    // 清空现有结果
    searchResults.innerHTML = '';

    // 添加新结果
    results.forEach(result => {
        const resultElement = createResultElement(result);
        searchResults.appendChild(resultElement);
    });

    // 重新初始化结果项事件
    initResultItemEvents();
}

// 添加结果到页面（用于滚动加载）
function appendResults(results) {
    const searchResults = document.querySelector('.search-results');

    results.forEach(result => {
        const resultElement = createResultElement(result);
        searchResults.appendChild(resultElement);
    });

    // 重新初始化新添加的结果项事件
    initResultItemEvents();
}

// 创建结果元素
function createResultElement(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `result-item ${result.type}-result`;
    resultDiv.dataset.resultId = result.id;
    resultDiv.dataset.resultType = result.type;

    const typeIcons = {
        document: '📄',
        qa: '❓',
        video: '🎥',
        solution: '💡'
    };

    const typeNames = {
        document: '技术文档',
        qa: '专家问答',
        video: '培训视频',
        solution: '解决方案'
    };

    resultDiv.innerHTML = `
        <div class="result-header">
            <span class="result-type">${typeIcons[result.type]} ${typeNames[result.type]}</span>
            <span class="result-score">相关度: ${result.score}%</span>
        </div>
        <h3 class="result-title">${result.title}</h3>
        <p class="result-snippet">${result.snippet}</p>
        <div class="result-meta">
            <span class="result-date">📅 ${result.date}</span>
            <span class="result-views">👁 ${Math.floor(Math.random() * 1000) + 100}次查看</span>
        </div>
        <div class="result-actions">
            <button class="action-btn view-btn">查看详情</button>
            <button class="action-btn collect-btn">收藏</button>
        </div>
    `;

    return resultDiv;
}

// 导航函数
function navigateTo(page) {
    if (typeof commonUtils !== 'undefined' && commonUtils.navigateTo) {
        commonUtils.navigateTo(page);
    } else {
        window.location.href = page;
    }
}
