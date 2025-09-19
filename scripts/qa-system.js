// 引入安全工具函数
if (typeof safeCommonUtils === "undefined") {
    function safeCommonUtils() {
        return typeof window.commonUtils !== "undefined" ? window.commonUtils : {
            showToast: function(m,t) { console.log(`[${t}] ${m}`); },
            navigateTo: function(u) { window.location.href = u; },
            mockApiRequest: function() { return Promise.resolve({success:true,data:[]}); }
        };
    }
}
// 问答系统页面JavaScript功能

let currentFilter = 'all';
let currentSort = 'latest';
let questionList = [];

document.addEventListener('DOMContentLoaded', function() {
    initCategoryTabs();
    initFilterAndSort();
    initQuestionList();
    initHotQuestions();
    initAskModal();
    initActionSheet();
    loadQuestions();
    initBookmarkStatus();
});

// 初始化分类标签
function initCategoryTabs() {
    const tabItems = document.querySelectorAll('.tab-item');

    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active状态
            tabItems.forEach(item => item.classList.remove('active'));

            // 添加当前标签的active状态
            this.classList.add('active');

            // 获取选中的分类
            const category = this.dataset.category;

            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 切换分类内容
            switchCategoryContent(category);

            // 显示加载状态
            showTabLoading();

            // 模拟加载延迟
            setTimeout(() => {
                hideTabLoading();
                safeCommonUtils().showToast(`已切换到${this.textContent}`, 'success');
            }, 800);
        });
    });
}

// 初始化筛选和排序
function initFilterAndSort() {
    const filterSelect = document.querySelector('.filter-select');
    const sortSelect = document.querySelector('.sort-select');

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            currentFilter = this.value;
            applyFilterAndSort();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            applyFilterAndSort();
        });
    }
}

// 切换分类内容
function switchCategoryContent(category) {
    const questionItems = document.querySelectorAll('.question-item');
    const hotQuestionItems = document.querySelectorAll('.hot-question-item');

    // 添加切换动画
    const questionList = document.querySelector('.question-list');
    const hotQuestions = document.querySelector('.hot-question-list');

    if (questionList) {
        questionList.style.opacity = '0.5';
        questionList.style.transform = 'translateY(10px)';
    }

    if (hotQuestions) {
        hotQuestions.style.opacity = '0.5';
        hotQuestions.style.transform = 'translateY(10px)';
    }

    // 根据分类筛选内容
    setTimeout(() => {
        filterByCategory(category);

        // 恢复动画
        if (questionList) {
            questionList.style.opacity = '';
            questionList.style.transform = '';
        }

        if (hotQuestions) {
            hotQuestions.style.opacity = '';
            hotQuestions.style.transform = '';
        }
    }, 300);
}

// 根据分类筛选
function filterByCategory(category) {
    const questionItems = document.querySelectorAll('.question-item');
    const hotQuestionItems = document.querySelectorAll('.hot-question-item');

    questionItems.forEach(item => {
        const itemCategory = item.dataset.category;
        const shouldShow = category === 'all' || itemCategory === category;

        if (shouldShow) {
            item.style.display = 'block';
            item.style.animation = 'fadeInUp 0.3s ease forwards';
        } else {
            item.style.display = 'none';
        }
    });

    hotQuestionItems.forEach(item => {
        const itemCategory = item.dataset.category;
        const shouldShow = category === 'all' || itemCategory === category;

        if (shouldShow) {
            item.style.display = 'flex';
            item.style.animation = 'fadeInUp 0.3s ease forwards';
        } else {
            item.style.display = 'none';
        }
    });
}

// 应用筛选和排序
function applyFilterAndSort() {
    const questionItems = Array.from(document.querySelectorAll('.question-item'));
    const questionList = document.querySelector('.question-list');

    if (!questionList) return;

    // 筛选
    let filteredItems = questionItems.filter(item => {
        const status = item.dataset.status;
        return currentFilter === 'all' || status === currentFilter;
    });

    // 排序
    filteredItems.sort((a, b) => {
        switch(currentSort) {
            case 'latest':
                return compareByTime(a, b);
            case 'hot':
                return compareByHotness(a, b);
            case 'urgent':
                return compareByUrgency(a, b);
            default:
                return 0;
        }
    });

    // 重新排列DOM元素
    filteredItems.forEach(item => {
        questionList.appendChild(item);
        item.style.display = 'block';
        item.style.animation = 'fadeInUp 0.3s ease forwards';
    });

    // 隐藏不匹配的项
    questionItems.forEach(item => {
        if (!filteredItems.includes(item)) {
            item.style.display = 'none';
        }
    });

    // 更新计数
    updateQuestionCount(filteredItems.length);

    safeCommonUtils().showToast(`已应用筛选：${getFilterName(currentFilter)} | 排序：${getSortName(currentSort)}`, 'success');
}

// 比较时间
function compareByTime(a, b) {
    const timeA = getTimeValue(a.querySelector('.question-time').textContent);
    const timeB = getTimeValue(b.querySelector('.question-time').textContent);
    return timeB - timeA; // 最新的在前
}

// 比较热度
function compareByHotness(a, b) {
    const viewsA = getViewCount(a);
    const viewsB = getViewCount(b);
    return viewsB - viewsA; // 浏览量高的在前
}

// 比较紧急程度
function compareByUrgency(a, b) {
    const urgencyA = getUrgencyValue(a);
    const urgencyB = getUrgencyValue(b);
    return urgencyB - urgencyA; // 紧急的在前
}

// 获取时间值
function getTimeValue(timeText) {
    if (timeText.includes('分钟前')) {
        return parseInt(timeText) || 0;
    } else if (timeText.includes('小时前')) {
        return (parseInt(timeText) || 0) * 60;
    } else if (timeText.includes('天前')) {
        return (parseInt(timeText) || 0) * 24 * 60;
    }
    return 0;
}

// 获取浏览量
function getViewCount(item) {
    const viewText = item.querySelector('.question-stats-left span').textContent;
    const match = viewText.match(/(\d+)次浏览/);
    return match ? parseInt(match[1]) : 0;
}

// 获取紧急程度值
function getUrgencyValue(item) {
    const priority = item.querySelector('.question-priority');
    if (!priority) return 0;

    const priorityClass = priority.className;
    if (priorityClass.includes('high')) return 3;
    if (priorityClass.includes('medium')) return 2;
    if (priorityClass.includes('low')) return 1;
    return 0;
}

// 更新问题计数
function updateQuestionCount(count) {
    const questionCount = document.querySelector('.question-count');
    if (questionCount) {
        questionCount.textContent = `共 ${count} 个问题`;
    }
}

// 获取筛选名称
function getFilterName(filter) {
    const names = {
        'all': '全部状态',
        'pending': '待解答',
        'answered': '已解答',
        'solved': '已解决'
    };
    return names[filter] || filter;
}

// 获取排序名称
function getSortName(sort) {
    const names = {
        'latest': '最新发布',
        'hot': '热门问题',
        'urgent': '紧急程度'
    };
    return names[sort] || sort;
}

// 显示标签加载状态
function showTabLoading() {
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        activeTab.style.opacity = '0.7';
        activeTab.style.pointerEvents = 'none';
    }
}

// 隐藏标签加载状态
function hideTabLoading() {
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        activeTab.style.opacity = '';
        activeTab.style.pointerEvents = '';
    }
}

// 初始化热门问题
function initHotQuestions() {
    const hotQuestionItems = document.querySelectorAll('.hot-question-item');

    hotQuestionItems.forEach(item => {
        item.addEventListener('click', function() {
            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            const questionId = this.onclick.toString().match(/'([^']+)'/)?.[1];
            if (questionId) {
                viewQuestion(questionId);
            }
        });
    });
}

// 初始化问题列表
function initQuestionList() {
    const questionItems = document.querySelectorAll('.question-item');
    
    questionItems.forEach(item => {
        // 问题点击事件
        item.addEventListener('click', function() {
            const questionId = this.dataset.questionId;
            
            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 打开问题详情
            openQuestionDetail(questionId);
        });
        
        // 点赞按钮事件
        const likeBtn = item.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const questionId = item.dataset.questionId;
                toggleQuestionLike(questionId, this);
            });
        }
        
        // 收藏按钮事件
        const favoriteBtn = item.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const questionId = item.dataset.questionId;
                toggleQuestionFavorite(questionId, this);
            });
        }
        
        // 分享按钮事件
        const shareBtn = item.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const questionId = item.dataset.questionId;
                shareQuestion(questionId);
            });
        }
        
        // 用户头像点击事件
        const userAvatar = item.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', function(e) {
                e.stopPropagation();
                const userId = this.dataset.userId;
                showUserProfile(userId);
            });
        }
    });
}

// 初始化操作菜单
function initActionSheet() {
    const actionSheet = document.getElementById('questionActionSheet');
    if (!actionSheet) return;

    // 点击遮罩关闭
    actionSheet.addEventListener('click', function(e) {
        if (e.target === actionSheet) {
            hideQuestionActions();
        }
    });

    // 添加操作项点击动画
    const actionItems = actionSheet.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// 初始化提问模态框
function initAskModal() {
    const modal = document.getElementById('askModal');
    if (!modal) return;

    const submitBtn = modal.querySelector('.submit-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const closeBtn = modal.querySelector('.close-btn');

    // 点击遮罩关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideAskQuestion();
        }
    });

    // 表单验证
    const formInputs = modal.querySelectorAll('.form-input, .form-textarea, .form-select');
    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });
}

// 显示问题操作菜单
function showQuestionActions() {
    const actionSheet = document.getElementById('questionActionSheet');
    actionSheet.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        actionSheet.classList.add('show');
    }, 10);
}

// 隐藏问题操作菜单
function hideQuestionActions() {
    const actionSheet = document.getElementById('questionActionSheet');
    actionSheet.classList.remove('show');

    setTimeout(() => {
        actionSheet.style.display = 'none';
    }, 300);
}

// 显示提问对话框
function showAskQuestion() {
    const modal = document.getElementById('askModal');
    modal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // 聚焦到第一个输入框
    const firstInput = modal.querySelector('.form-input');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 300);
    }
}

// 隐藏提问对话框
function hideAskQuestion() {
    const modal = document.getElementById('askModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        clearForm();
    }, 300);
}

// 清空表单
function clearForm() {
    const modal = document.getElementById('askModal');
    const inputs = modal.querySelectorAll('.form-input, .form-textarea, .form-select');
    const radios = modal.querySelectorAll('input[type="radio"]');
    
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
    
    radios.forEach(radio => {
        radio.checked = false;
    });
}

// 验证表单
function validateForm() {
    const modal = document.getElementById('askModal');
    const title = modal.querySelector('.form-input').value.trim();
    const description = modal.querySelector('.form-textarea').value.trim();
    const category = modal.querySelector('.form-select').value;
    const urgency = modal.querySelector('input[name="urgency"]:checked');
    const submitBtn = modal.querySelector('.submit-btn');
    
    let isValid = true;
    
    // 验证标题
    if (!title) {
        isValid = false;
    }
    
    // 验证描述
    if (!description || description.length < 10) {
        isValid = false;
    }
    
    // 验证分类
    if (!category) {
        isValid = false;
    }
    
    // 验证紧急程度
    if (!urgency) {
        isValid = false;
    }
    
    // 更新提交按钮状态
    submitBtn.disabled = !isValid;
    submitBtn.style.opacity = isValid ? '1' : '0.5';
    
    return isValid;
}

// 提交问题
function submitQuestion() {
    if (!validateForm()) {
        safeCommonUtils().showToast('请完善问题信息', 'error');
        return;
    }
    
    const modal = document.getElementById('askModal');
    const title = modal.querySelector('.form-input').value.trim();
    const description = modal.querySelector('.form-textarea').value.trim();
    const category = modal.querySelector('.form-select').value;
    const urgency = modal.querySelector('input[name="urgency"]:checked').value;
    
    const questionData = {
        title: title,
        description: description,
        category: category,
        urgency: urgency,
        timestamp: Date.now()
    };
    
    safeCommonUtils().showLoading('发布问题中...');
    
    // 模拟提交问题
    safeCommonUtils().mockApiRequest('/api/questions/create', {
        method: 'POST',
        body: JSON.stringify(questionData)
    }).then(response => {
        safeCommonUtils().hideLoading();
        
        if (response.success) {
            safeCommonUtils().showToast('问题发布成功！', 'success');
            hideAskQuestion();
            
            // 刷新问题列表
            setTimeout(() => {
                loadQuestions();
            }, 1000);
            
            // 统计提问
            trackQuestionSubmit(questionData);
        } else {
            safeCommonUtils().showToast('发布失败，请重试', 'error');
        }
    });
}

// 应用筛选
function applyFilter() {
    safeCommonUtils().showLoading('筛选中...');
    
    safeCommonUtils().mockApiRequest(`/api/questions/filter?type=${currentFilter}&sort=${currentSort}`)
        .then(response => {
            safeCommonUtils().hideLoading();
            if (response.success) {
                updateQuestionList(response.data.questions);
            }
        });
}

// 加载问题列表
function loadQuestions() {
    safeCommonUtils().mockApiRequest('/api/questions/list')
        .then(response => {
            if (response.success) {
                questionList = response.data.questions || [];
                updateQuestionList(questionList);
            }
        });
}

// 更新问题列表
function updateQuestionList(questions) {
    const questionContainer = document.querySelector('.question-list');
    if (!questionContainer || !questions) return;
    
    // 这里可以动态更新问题列表
    console.log('更新问题列表:', questions);
    
    // 重新初始化问题列表事件
    setTimeout(() => {
        initQuestionList();
    }, 100);
}

// 打开问题详情
function openQuestionDetail(questionId) {
    // 记录问题查看
    trackQuestionView(questionId);
    
    // 跳转到问题详情页面
    safeCommonUtils().navigateTo(`question-detail.html?id=${questionId}`);
}

// 切换问题点赞
function toggleQuestionLike(questionId, likeBtn) {
    const isLiked = likeBtn.classList.contains('liked');
    const countSpan = likeBtn.querySelector('.like-count');
    let count = parseInt(countSpan.textContent) || 0;
    
    safeCommonUtils().mockApiRequest(`/api/questions/${questionId}/like`, {
        method: 'POST',
        body: JSON.stringify({
            liked: !isLiked
        })
    }).then(response => {
        if (response.success) {
            if (isLiked) {
                likeBtn.classList.remove('liked');
                count = Math.max(0, count - 1);
                countSpan.textContent = count;
                safeCommonUtils().showToast('已取消点赞', 'info');
            } else {
                likeBtn.classList.add('liked');
                count += 1;
                countSpan.textContent = count;
                safeCommonUtils().showToast('点赞成功', 'success');
                
                // 添加点赞动画
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    likeBtn.style.transform = '';
                }, 200);
            }
        }
    });
}

// 切换问题收藏
function toggleQuestionFavorite(questionId, favoriteBtn) {
    const isFavorited = favoriteBtn.classList.contains('favorited');
    
    safeCommonUtils().mockApiRequest(`/api/questions/${questionId}/favorite`, {
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
                safeCommonUtils().showToast('收藏成功', 'success');
                
                // 添加收藏动画
                favoriteBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    favoriteBtn.style.transform = '';
                }, 200);
            }
        }
    });
}

// 分享问题
function shareQuestion(questionId) {
    const shareUrl = `${window.location.origin}/question-detail.html?id=${questionId}`;
    
    if (navigator.share) {
        navigator.share({
            title: '问答分享',
            text: '推荐一个技术问题',
            url: shareUrl
        });
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(shareUrl).then(() => {
            safeCommonUtils().showToast('链接已复制到剪贴板', 'success');
        });
    }
}

// 显示用户资料
function showUserProfile(userId) {
    safeCommonUtils().showToast('查看用户资料...', 'info');
    setTimeout(() => {
        safeCommonUtils().navigateTo(`user-profile.html?userId=${userId}`);
    }, 500);
}

// 排序问题
function sortQuestions(sortType) {
    currentSort = sortType;
    applyFilter();
}

// 搜索问题
function searchQuestions(query) {
    if (!query.trim()) {
        loadQuestions();
        return;
    }
    
    safeCommonUtils().showLoading('搜索中...');
    
    safeCommonUtils().mockApiRequest(`/api/questions/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            safeCommonUtils().hideLoading();
            if (response.success) {
                updateQuestionList(response.data.questions);
                safeCommonUtils().showToast(`找到 ${response.data.total} 个相关问题`, 'success');
            }
        });
}

// 统计筛选点击
function trackFilterClick(filterType) {
    safeCommonUtils().mockApiRequest('/api/analytics/filter-click', {
        method: 'POST',
        body: JSON.stringify({
            filterType: filterType,
            page: 'qa-system',
            timestamp: Date.now()
        })
    });
}

// 统计问题查看
function trackQuestionView(questionId) {
    safeCommonUtils().mockApiRequest(`/api/questions/${questionId}/view`, {
        method: 'POST',
        body: JSON.stringify({
            timestamp: Date.now()
        })
    });
}

// 统计问题提交
function trackQuestionSubmit(questionData) {
    safeCommonUtils().mockApiRequest('/api/analytics/question-submit', {
        method: 'POST',
        body: JSON.stringify({
            category: questionData.category,
            urgency: questionData.urgency,
            timestamp: Date.now()
        })
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadQuestions();
    }
});

// 无限滚动加载
let isLoading = false;
let currentPage = 1;

window.addEventListener('scroll', function() {
    if (isLoading) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 距离底部100px时开始加载
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreQuestions();
    }
});

// 显示问题搜索
function showQuestionSearch() {
    // 创建搜索对话框
    const searchModal = document.createElement('div');
    searchModal.className = 'ask-modal';
    searchModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>搜索问题</h3>
                <button class="close-btn" onclick="this.closest('.ask-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>搜索关键词</label>
                    <input type="text" placeholder="输入问题关键词..." class="form-input search-input">
                </div>
                <div class="form-group">
                    <label>搜索范围</label>
                    <select class="form-select search-scope">
                        <option value="all">全部问题</option>
                        <option value="title">仅标题</option>
                        <option value="content">标题和内容</option>
                        <option value="tags">标签</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.ask-modal').remove()">取消</button>
                <button class="submit-btn" onclick="performSearch(this.closest('.ask-modal'))">搜索</button>
            </div>
        </div>
    `;

    document.body.appendChild(searchModal);
    searchModal.style.display = 'flex';

    // 聚焦搜索框
    setTimeout(() => {
        searchModal.querySelector('.search-input').focus();
    }, 100);
}

// 显示我的问题
function showMyQuestions() {
    // 筛选显示当前用户的问题
    const questionItems = document.querySelectorAll('.question-item');
    let myQuestionsCount = 0;

    questionItems.forEach(item => {
        const username = item.querySelector('.question-username')?.textContent;
        const isMyQuestion = username === '当前用户' || username === '我'; // 这里可以根据实际登录用户判断

        if (isMyQuestion) {
            item.style.display = 'block';
            item.style.border = '2px solid #667eea';
            myQuestionsCount++;
        } else {
            item.style.display = 'none';
        }
    });

    if (myQuestionsCount === 0) {
        safeCommonUtils().showToast('您还没有发布过问题', 'info');
        // 恢复显示所有问题
        questionItems.forEach(item => {
            item.style.display = 'block';
            item.style.border = '';
        });
    } else {
        safeCommonUtils().showToast(`找到 ${myQuestionsCount} 个您发布的问题`, 'success');

        // 3秒后恢复显示所有问题
        setTimeout(() => {
            questionItems.forEach(item => {
                item.style.display = 'block';
                item.style.border = '';
            });
        }, 3000);
    }
}

// 查看问题详情
function viewQuestion(questionId) {
    // 验证问题ID
    if (!questionId || questionId === 'undefined') {
        safeCommonUtils().showToast('问题ID无效', 'error');
        console.error('viewQuestion called with invalid questionId:', questionId);
        return;
    }

    // 添加点击动画
    const clickedElement = event.target.closest('.question-item, .hot-question-item');
    if (clickedElement) {
        clickedElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
            clickedElement.style.transform = '';
        }, 150);
    }

    // 检查是否存在问题数据
    const questionData = getQuestionData(questionId);
    if (!questionData) {
        safeCommonUtils().showToast('问题不存在', 'error');
        return;
    }

    // 跳转到问题详情页面
    console.log('跳转到问题详情页面，问题ID:', questionId);
    window.location.href = `question-detail.html?id=${questionId}`;
}

// 显示问题详情模态框
function showQuestionDetail(questionData) {
    // 创建问题详情模态框
    const detailModal = document.createElement('div');
    detailModal.className = 'question-detail-modal';
    detailModal.innerHTML = `
        <div class="modal-content question-detail-content">
            <div class="modal-header">
                <h3>问题详情</h3>
                <button class="close-btn" onclick="this.closest('.question-detail-modal').remove()">×</button>
            </div>
            <div class="modal-body question-detail-body">
                <div class="question-detail-header">
                    <div class="question-detail-status ${questionData.status}">
                        ${getStatusText(questionData.status)}
                    </div>
                    <div class="question-detail-priority ${questionData.priority}">
                        ${getPriorityText(questionData.priority)}
                    </div>
                </div>

                <h2 class="question-detail-title">${questionData.title}</h2>

                <div class="question-detail-meta">
                    <div class="question-detail-user">
                        <img src="${questionData.avatar}" alt="提问者" class="user-avatar">
                        <div class="user-info">
                            <div class="user-name">${questionData.username}</div>
                            <div class="user-role">${questionData.role}</div>
                        </div>
                    </div>
                    <div class="question-detail-time">${questionData.time}</div>
                </div>

                <div class="question-detail-content">
                    <p>${questionData.content}</p>
                </div>

                <div class="question-detail-tags">
                    ${questionData.tags.map(tag => `<span class="question-tag">${tag}</span>`).join('')}
                </div>

                <div class="question-detail-stats">
                    <span>👁 ${questionData.views}次浏览</span>
                    <span>👥 ${questionData.followers}人关注</span>
                    <span>💬 ${questionData.answers}个回答</span>
                </div>

                ${questionData.answers > 0 ? `
                <div class="question-answers">
                    <h4>专家回答 (${questionData.answers})</h4>
                    ${generateAnswersHtml(questionData.answerList || [])}
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.question-detail-modal').remove()">关闭</button>
                <button class="submit-btn" onclick="answerQuestion('${questionData.id}')">💡 我来回答</button>
            </div>
        </div>
    `;

    document.body.appendChild(detailModal);
    detailModal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        detailModal.classList.add('show');
    }, 10);
}

// 生成回答列表HTML
function generateAnswersHtml(answers) {
    if (!answers || answers.length === 0) {
        return '<p class="no-answers">暂无专家回答</p>';
    }

    return answers.map(answer => `
        <div class="answer-item">
            <div class="answer-header">
                <img src="${answer.avatar}" alt="专家" class="expert-avatar">
                <div class="expert-info">
                    <div class="expert-name">${answer.expertName}</div>
                    <div class="expert-title">${answer.expertTitle}</div>
                </div>
                <div class="answer-time">${answer.time}</div>
            </div>
            <div class="answer-content">${answer.content}</div>
            <div class="answer-actions">
                <button class="like-btn">👍 ${answer.likes}</button>
                <button class="reply-btn">💬 回复</button>
            </div>
        </div>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待解答',
        'answered': '已解答',
        'solved': '已解决'
    };
    return statusMap[status] || status;
}

// 获取优先级文本
function getPriorityText(priority) {
    const priorityMap = {
        'low': '普通',
        'medium': '中等',
        'high': '紧急'
    };
    return priorityMap[priority] || priority;
}

// 获取问题数据
function getQuestionData(questionId) {
    const questionsData = {
        'q001': {
            id: 'q001',
            title: '智算一体机如何实现高效的资源调度？',
            content: '我们公司正在部署智算一体机，需要实现CPU、GPU、内存等资源的高效调度。目前考虑的方案包括静态分配和动态调度，但不确定哪种方案更适合我们的AI计算场景。我们的主要需求是：1. 确保计算资源充分利用；2. 保证任务执行性能不受影响；3. 便于后期扩展管理。请问各位专家有什么建议？',
            status: 'answered',
            priority: 'high',
            username: '张工程师',
            avatar: 'images/user1.png',
            time: '3天前',
            views: 234,
            followers: 12,
            answers: 3,
            tags: ['智算一体机', '资源调度', 'AI计算'],
            answerList: [
                {
                    expertName: '王专家',
                    expertTitle: '智算技术专家',
                    avatar: 'images/expert1.png',
                    time: '1小时前',
                    content: '建议采用混合调度方案：核心AI训练任务采用静态资源预留，推理任务采用动态调度。具体实施可以通过容器编排技术实现，既保证性能又兼顾资源利用率。',
                    likes: 15
                },
                {
                    expertName: '李专家',
                    expertTitle: 'AI架构专家',
                    avatar: 'images/expert2.png',
                    time: '30分钟前',
                    content: '从性能角度考虑，推荐基于负载预测的动态调度方案。虽然实现复杂度较高，但能够最大化资源利用效率。可以考虑分阶段实施，先对GPU资源进行智能调度。',
                    likes: 8
                }
            ]
        },
        'q002': {
            id: 'q002',
            title: '边缘计算节点的部署位置如何选择？',
            content: '我们计划在全国范围内部署边缘计算节点，但对于节点的具体部署位置选择还不够明确。需要考虑哪些因素？如何平衡成本和性能？',
            status: 'answered',
            priority: 'medium',
            username: '李工',
            avatar: 'images/user2.png',
            time: '4天前',
            views: 189,
            followers: 8,
            answers: 8,
            tags: ['边缘计算', '节点部署', '网络规划'],
            answerList: [
                {
                    expertName: '陈专家',
                    expertTitle: '边缘计算专家',
                    avatar: 'images/expert3.png',
                    time: '3小时前',
                    content: '节点部署需要综合考虑：1. 用户密度和业务需求；2. 网络延迟要求；3. 基础设施成本；4. 运维便利性。建议先在核心城市部署，再逐步扩展到二三线城市。',
                    likes: 12
                }
            ]
        },
        'q003': {
            id: 'q003',
            title: '云平台迁移过程中的数据安全如何保障？',
            content: '公司准备将现有业务系统迁移到云平台，担心迁移过程中的数据安全问题。请问有哪些最佳实践可以参考？',
            status: 'answered',
            priority: 'high',
            username: '王总',
            avatar: 'images/user3.png',
            time: '5天前',
            views: 156,
            followers: 15,
            answers: 15,
            tags: ['云计算', '数据安全', '系统迁移'],
            answerList: [
                {
                    expertName: '周专家',
                    expertTitle: '云安全专家',
                    avatar: 'images/expert4.png',
                    time: '20小时前',
                    content: '数据迁移安全要点：1. 数据加密传输；2. 分批次迁移验证；3. 建立回滚机制；4. 全程监控日志。建议制定详细的迁移计划和应急预案。',
                    likes: 20
                }
            ]
        },
        'q004': {
            id: 'q004',
            title: '云电脑大规模部署时的性能优化策略',
            content: '我们项目中需要部署1000+云桌面，目前响应延迟较高，请问有什么优化建议？包括资源配置调整和网络优化方面。具体需求：1. 支持高并发用户访问；2. 保证图形渲染性能；3. 优化网络传输延迟；4. 合理分配计算资源。希望各位专家提供实用的解决方案。',
            status: 'answered',
            priority: 'high',
            username: '刘工程师',
            avatar: 'images/user5.png',
            time: '2小时前',
            views: 145,
            followers: 18,
            answers: 2,
            tags: ['云电脑', '性能优化', '大规模部署'],
            answerList: [
                {
                    expertName: '赵专家',
                    expertTitle: '云桌面架构师',
                    avatar: 'images/expert3.png',
                    time: '1小时前',
                    content: '大规模云电脑部署优化建议：1. 资源池化管理，动态分配CPU/GPU资源；2. 就近部署，减少网络延迟；3. 使用SSD存储提升IO性能；4. 优化桌面协议，如PCoIP或HDX；5. 实施负载均衡和自动扩缩容。',
                    likes: 22
                },
                {
                    expertName: '孙专家',
                    expertTitle: '虚拟化专家',
                    avatar: 'images/expert4.png',
                    time: '30分钟前',
                    content: '从虚拟化角度补充：建议采用GPU虚拟化技术支持图形密集型应用，配置专用的存储网络避免IO瓶颈，同时要做好用户会话管理和资源监控告警。可以考虑分时段部署，逐步优化配置参数。',
                    likes: 15
                }
            ]
        },
        'q005': {
            id: 'q005',
            title: '云电脑在远程办公场景下的最佳实践',
            content: '随着远程办公需求增长，我们计划部署云电脑解决方案。想了解在不同办公场景下的最佳实践，包括：1. 移动办公的网络要求；2. 多媒体处理的性能配置；3. 数据安全和访问控制；4. 用户体验优化策略。希望能分享一些成功案例。',
            status: 'answered',
            priority: 'medium',
            username: '陈经理',
            avatar: 'images/user6.png',
            time: '5小时前',
            views: 189,
            followers: 15,
            answers: 3,
            tags: ['云电脑', '远程办公', '最佳实践'],
            answerList: [
                {
                    expertName: '王专家',
                    expertTitle: '云计算专家',
                    avatar: 'images/expert1.png',
                    time: '3小时前',
                    content: '云电脑远程办公最佳实践：1. 网络要求：建议上行带宽≥10Mbps，延迟<50ms；2. 性能配置：办公应用2核4G，设计类应用4核8G+GPU；3. 安全策略：多因子认证+数据不落地；4. 体验优化：就近接入+智能调度。',
                    likes: 25
                },
                {
                    expertName: '李专家',
                    expertTitle: '企业架构师',
                    avatar: 'images/expert2.png',
                    time: '2小时前',
                    content: '补充实际案例：某金融企业部署3000个云桌面，通过分级部署（核心业务优先）、统一管控平台、7x24运维支持，实现了95%的用户满意度。关键是要做好用户培训和技术支持。',
                    likes: 18
                }
            ]
        },
        'q006': {
            id: 'q006',
            title: '云服务器性能监控和告警配置',
            content: '需要建立完善的云服务器监控体系，包括CPU、内存、磁盘、网络等指标的监控和告警机制。',
            status: 'solved',
            priority: 'low',
            username: '赵主管',
            avatar: 'images/user7.png',
            time: '1天前',
            views: 156,
            followers: 15,
            answers: 7,
            tags: ['云计算', '性能监控', '告警配置'],
            answerList: [
                {
                    expertName: '孙专家',
                    expertTitle: '云运维专家',
                    avatar: 'images/expert5.png',
                    time: '18小时前',
                    content: '推荐使用云原生监控方案：1. 基础监控：CPU、内存、磁盘、网络；2. 应用监控：响应时间、错误率、吞吐量；3. 业务监控：关键业务指标。告警策略要分级设置，避免告警风暴。',
                    likes: 25
                }
            ]
        }
    };

    return questionsData[questionId] || null;
}

// 查看解决方案
function viewSolution(questionId) {
    // 阻止事件冒泡，避免触发问题详情页面跳转
    if (event) {
        event.stopPropagation();
    }

    // 添加点击动画
    const clickedBtn = event.target;
    clickedBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickedBtn.style.transform = '';
    }, 150);

    // 显示加载状态
    safeCommonUtils().showLoading('正在加载解决方案...');

    // 模拟API调用
    setTimeout(() => {
        safeCommonUtils().hideLoading();

        const questionData = getQuestionData(questionId);
        if (questionData && questionData.status === 'solved') {
            showSolutionModal(questionData);
        } else if (questionData && questionData.answers > 0) {
            // 如果有回答但未标记为已解决，显示最佳回答
            showBestAnswerModal(questionData);
        } else {
            safeCommonUtils().showToast('该问题暂无解决方案', 'info');
        }
    }, 800);
}

// 显示解决方案模态框
function showSolutionModal(questionData) {
    const modal = document.createElement('div');
    modal.className = 'solution-modal';
    modal.innerHTML = `
        <div class="modal-content solution-modal-content">
            <div class="modal-header">
                <h3>💡 解决方案</h3>
                <button class="close-btn" onclick="this.closest('.solution-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="solution-question">
                    <h4>${questionData.title}</h4>
                    <div class="solution-status solved">✅ 已解决</div>
                </div>

                <div class="solution-content">
                    <h5>🎯 最佳解决方案</h5>
                    ${questionData.answerList && questionData.answerList.length > 0 ? `
                        <div class="best-solution">
                            <div class="solution-expert">
                                <img src="${questionData.answerList[0].avatar}" alt="专家" class="expert-avatar">
                                <div class="expert-info">
                                    <div class="expert-name">${questionData.answerList[0].expertName}</div>
                                    <div class="expert-title">${questionData.answerList[0].expertTitle}</div>
                                </div>
                                <div class="solution-badge">最佳方案</div>
                            </div>
                            <div class="solution-text">${questionData.answerList[0].content}</div>
                            <div class="solution-stats">
                                <span>👍 ${questionData.answerList[0].likes} 个赞</span>
                                <span>✅ 已验证有效</span>
                            </div>
                        </div>
                    ` : '<p>解决方案正在整理中...</p>'}
                </div>

                <div class="solution-actions">
                    <button class="action-btn" onclick="copySolution()">📋 复制方案</button>
                    <button class="action-btn" onclick="shareSolution()">🔗 分享方案</button>
                    <button class="action-btn" onclick="rateSolution()">⭐ 评价方案</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.solution-modal').remove()">关闭</button>
                <button class="submit-btn" onclick="viewQuestion('${questionData.id}')">查看完整讨论</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 显示最佳回答模态框
function showBestAnswerModal(questionData) {
    const modal = document.createElement('div');
    modal.className = 'solution-modal';
    modal.innerHTML = `
        <div class="modal-content solution-modal-content">
            <div class="modal-header">
                <h3>💬 专家回答</h3>
                <button class="close-btn" onclick="this.closest('.solution-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="solution-question">
                    <h4>${questionData.title}</h4>
                    <div class="solution-status answered">💬 已回答</div>
                </div>

                <div class="solution-content">
                    <h5>🔥 热门回答</h5>
                    ${questionData.answerList && questionData.answerList.length > 0 ? `
                        <div class="best-solution">
                            <div class="solution-expert">
                                <img src="${questionData.answerList[0].avatar}" alt="专家" class="expert-avatar">
                                <div class="expert-info">
                                    <div class="expert-name">${questionData.answerList[0].expertName}</div>
                                    <div class="expert-title">${questionData.answerList[0].expertTitle}</div>
                                </div>
                                <div class="solution-badge">热门回答</div>
                            </div>
                            <div class="solution-text">${questionData.answerList[0].content}</div>
                            <div class="solution-stats">
                                <span>👍 ${questionData.answerList[0].likes} 个赞</span>
                                <span>💬 ${questionData.answers} 个回答</span>
                            </div>
                        </div>
                    ` : '<p>回答正在加载中...</p>'}
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.solution-modal').remove()">关闭</button>
                <button class="submit-btn" onclick="viewQuestion('${questionData.id}')">查看所有回答</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 切换收藏状态
function toggleBookmark(questionId, buttonElement) {
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
    }

    // 添加点击动画
    buttonElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
        buttonElement.style.transform = '';
    }, 150);

    const isBookmarked = buttonElement.classList.contains('bookmarked');

    if (isBookmarked) {
        // 取消收藏
        buttonElement.classList.remove('bookmarked');
        buttonElement.innerHTML = '🔖 收藏';
        safeCommonUtils().showToast('已取消收藏', 'info');

        // 从本地存储中移除
        removeFromBookmarks(questionId);
    } else {
        // 添加收藏
        buttonElement.classList.add('bookmarked');
        buttonElement.innerHTML = '⭐ 已收藏';
        safeCommonUtils().showToast('收藏成功', 'success');

        // 添加到本地存储
        addToBookmarks(questionId);
    }
}

// 添加到收藏夹
function addToBookmarks(questionId) {
    let bookmarks = JSON.parse(localStorage.getItem('qa_bookmarks') || '[]');
    if (!bookmarks.includes(questionId)) {
        bookmarks.push(questionId);
        localStorage.setItem('qa_bookmarks', JSON.stringify(bookmarks));
    }
}

// 从收藏夹移除
function removeFromBookmarks(questionId) {
    let bookmarks = JSON.parse(localStorage.getItem('qa_bookmarks') || '[]');
    bookmarks = bookmarks.filter(id => id !== questionId);
    localStorage.setItem('qa_bookmarks', JSON.stringify(bookmarks));
}

// 检查是否已收藏
function isBookmarked(questionId) {
    const bookmarks = JSON.parse(localStorage.getItem('qa_bookmarks') || '[]');
    return bookmarks.includes(questionId);
}

// 解决方案相关功能
function copySolution() {
    const solutionText = document.querySelector('.solution-text')?.textContent;
    if (solutionText && navigator.clipboard) {
        navigator.clipboard.writeText(solutionText).then(() => {
            safeCommonUtils().showToast('方案已复制到剪贴板', 'success');
        }).catch(() => {
            safeCommonUtils().showToast('复制失败，请手动复制', 'error');
        });
    } else {
        safeCommonUtils().showToast('复制功能不可用', 'error');
    }
}

function shareSolution() {
    if (navigator.share) {
        navigator.share({
            title: '技术解决方案',
            text: '查看这个技术问题的解决方案',
            url: window.location.href
        }).catch(console.error);
    } else {
        safeCommonUtils().showToast('分享功能开发中', 'info');
    }
}

function rateSolution() {
    safeCommonUtils().showToast('评价功能开发中', 'info');
}

// 回答问题
function answerQuestion(questionId) {
    safeCommonUtils().showToast('跳转到回答页面...', 'info');
    // 这里可以跳转到回答页面或显示回答表单
    setTimeout(() => {
        alert(`功能开发中：回答问题 ${questionId}`);
    }, 500);
}

// 执行搜索
function performSearch(modal) {
    const keyword = modal.querySelector('.search-input').value.trim();
    const scope = modal.querySelector('.search-scope').value;

    if (!keyword) {
        safeCommonUtils().showToast('请输入搜索关键词', 'error');
        return;
    }

    // 执行搜索逻辑
    const questionItems = document.querySelectorAll('.question-item');
    let matchCount = 0;

    questionItems.forEach(item => {
        const title = item.querySelector('.question-title')?.textContent || '';
        const content = item.querySelector('.question-content')?.textContent || '';
        const tags = Array.from(item.querySelectorAll('.question-tag')).map(tag => tag.textContent).join(' ');

        let shouldShow = false;

        switch(scope) {
            case 'title':
                shouldShow = title.toLowerCase().includes(keyword.toLowerCase());
                break;
            case 'content':
                shouldShow = title.toLowerCase().includes(keyword.toLowerCase()) ||
                           content.toLowerCase().includes(keyword.toLowerCase());
                break;
            case 'tags':
                shouldShow = tags.toLowerCase().includes(keyword.toLowerCase());
                break;
            default:
                shouldShow = title.toLowerCase().includes(keyword.toLowerCase()) ||
                           content.toLowerCase().includes(keyword.toLowerCase()) ||
                           tags.toLowerCase().includes(keyword.toLowerCase());
        }

        if (shouldShow) {
            item.style.display = 'block';
            item.style.backgroundColor = '#fff9e6';
            matchCount++;
        } else {
            item.style.display = 'none';
        }
    });

    modal.remove();

    if (matchCount === 0) {
        safeCommonUtils().showToast('没有找到相关问题', 'info');
        // 恢复显示所有问题
        questionItems.forEach(item => {
            item.style.display = 'block';
            item.style.backgroundColor = '';
        });
    } else {
        safeCommonUtils().showToast(`找到 ${matchCount} 个相关问题`, 'success');

        // 5秒后恢复显示所有问题
        setTimeout(() => {
            questionItems.forEach(item => {
                item.style.display = 'block';
                item.style.backgroundColor = '';
            });
        }, 5000);
    }
}

// 加载更多问题
function loadMoreQuestions() {
    if (isLoading) return;

    isLoading = true;
    currentPage++;

    // 静默加载，不显示加载提示
    safeCommonUtils().mockApiRequest(`/api/questions/list?page=${currentPage}&filter=${currentFilter}&sort=${currentSort}`)
        .then(response => {
            isLoading = false;

            if (response.success && response.data.questions.length > 0) {
                appendQuestions(response.data.questions);
                // 静默加载成功，不显示提示
            } else {
                // 没有更多数据时也不显示提示
                console.log('没有更多问题了');
            }
        })
        .catch(() => {
            isLoading = false;
            currentPage--; // 回退页码
            // 加载失败时不显示错误提示，静默处理
            console.log('加载失败，已静默处理');
        });
}

// 追加问题到列表
function appendQuestions(questions) {
    const questionContainer = document.querySelector('.question-list');
    if (!questionContainer) return;
    
    questions.forEach(question => {
        const questionElement = createQuestionElement(question);
        questionContainer.appendChild(questionElement);
    });
    
    // 重新初始化新添加的问题事件
    initQuestionList();
}

// 创建问题元素
function createQuestionElement(question) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';
    questionElement.dataset.questionId = question.id;
    
    const urgencyClass = {
        'low': 'normal',
        'medium': 'urgent',
        'high': 'critical'
    }[question.urgency] || 'normal';
    
    const statusClass = question.status === 'solved' ? 'solved' : '';
    
    questionElement.innerHTML = `
        <div class="question-header">
            <div class="user-info">
                <div class="user-avatar" data-user-id="${question.author.id}">
                    <img src="${question.author.avatar}" alt="${question.author.name}">
                </div>
                <div class="user-details">
                    <span class="user-name">${question.author.name}</span>
                    <span class="user-role">${question.author.role}</span>
                </div>
            </div>
            <div class="question-meta">
                <span class="question-time">${safeCommonUtils().formatTime(question.createdAt)}</span>
                <span class="urgency-badge ${urgencyClass}">${getUrgencyText(question.urgency)}</span>
            </div>
        </div>
        <div class="question-content">
            <h3 class="question-title ${statusClass}">${question.title}</h3>
            <p class="question-desc">${question.description}</p>
            <div class="question-tags">
                <span class="category-tag">${getCategoryText(question.category)}</span>
            </div>
        </div>
        <div class="question-stats">
            <div class="stat-item">
                <span class="stat-icon">👁</span>
                <span class="stat-count">${question.viewCount || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">💬</span>
                <span class="stat-count">${question.answerCount || 0}</span>
            </div>
            <div class="question-actions">
                <button class="like-btn ${question.liked ? 'liked' : ''}" data-question-id="${question.id}">
                    <span class="like-icon">${question.liked ? '❤️' : '🤍'}</span>
                    <span class="like-count">${question.likeCount || 0}</span>
                </button>
                <button class="favorite-btn ${question.favorited ? 'favorited' : ''}" data-question-id="${question.id}">
                    ${question.favorited ? '★' : '☆'}
                </button>
                <button class="share-btn" data-question-id="${question.id}">分享</button>
            </div>
        </div>
    `;
    
    return questionElement;
}

// 获取紧急程度文本
function getUrgencyText(urgency) {
    const urgencyMap = {
        'low': '一般',
        'medium': '较急',
        'high': '紧急'
    };
    return urgencyMap[urgency] || '一般';
}

// 获取分类文本
function getCategoryText(category) {
    const categoryMap = {
        'ai-compute': '智算一体机',
        'cloud': '云计算',
        'edge': '边缘计算',
        'cloud-pc': '云电脑',
        'security': '网络安全'
    };
    return categoryMap[category] || category;
}
