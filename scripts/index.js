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
// 首页JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    initSearchFunctionality();
    initModuleCards();
    initQuickAccess();
    loadRecentUpdates();
});

// 初始化搜索功能
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', performSearch);
    
    // 搜索输入框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 搜索建议标签点击事件
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            searchInput.value = this.textContent;
            performSearch();
        });
    });
    
    // 搜索输入实时提示
    const debouncedSearch = safeCommonUtils().debounce(function(query) {
        if (query.length > 2) {
            showSearchSuggestions(query);
        }
    }, 300);
    
    searchInput.addEventListener('input', function() {
        debouncedSearch(this.value);
    });
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
    
    // 跳转到搜索结果页面
    safeCommonUtils().navigateTo(`search-results.html?q=${encodeURIComponent(query)}`);
}

// 显示搜索建议
function showSearchSuggestions(query) {
    // 模拟搜索建议API调用
    safeCommonUtils().mockApiRequest(`/api/search/suggestions?q=${query}`)
        .then(response => {
            if (response.success) {
                // 这里可以动态更新搜索建议
                console.log('搜索建议:', response.data);
            }
        });
}

// 保存搜索历史
function saveSearchHistory(query) {
    let history = safeCommonUtils().storage.get('searchHistory', []);
    
    // 移除重复项
    history = history.filter(item => item !== query);
    
    // 添加到开头
    history.unshift(query);
    
    // 限制历史记录数量
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    safeCommonUtils().storage.set('searchHistory', history);
}

// 初始化模块卡片
function initModuleCards() {
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach(card => {
        card.addEventListener('click', function() {
            // 添加点击动画效果
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 统计点击事件
            const moduleName = this.querySelector('h3').textContent;
            trackModuleClick(moduleName);
        });
    });
}

// 初始化快速入口
function initQuickAccess() {
    const quickItems = document.querySelectorAll('.quick-item');
    
    quickItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemName = this.querySelector('span').textContent;
            
            // 添加点击反馈
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 处理不同的快速入口
            handleQuickAccess(itemName);
        });
    });
}

// 处理快速入口点击
function handleQuickAccess(itemName) {
    switch(itemName) {
        case '专家问答':
            safeCommonUtils().navigateTo('qa-system.html');
            break;
        case '即时通讯':
            safeCommonUtils().navigateTo('chat-list.html');
            break;
        case '培训资料':
            safeCommonUtils().navigateTo('resource-library.html?category=training');
            break;
        case '客户案例':
            safeCommonUtils().navigateTo('resource-library.html?category=case');
            break;
        default:
            safeCommonUtils().showToast('功能开发中...', 'info');
    }
}

// 直接跳转到资源库指定分类
function navigateToResourceLibrary(category) {
    safeCommonUtils().showToast(`正在跳转到${category === 'training' ? '培训资料' : '客户案例'}...`, 'info');
    safeCommonUtils().navigateTo(`resource-library.html?category=${category}`);
}

// 加载最新动态
function loadRecentUpdates() {
    const updateList = document.querySelector('.update-list');
    
    // 模拟加载最新动态
    safeCommonUtils().mockApiRequest('/api/updates/recent')
        .then(response => {
            if (response.success) {
                // 这里可以动态更新最新动态列表
                console.log('最新动态:', response.data);
                
                // 添加点击事件到动态项
                const updateItems = updateList.querySelectorAll('.update-item');
                updateItems.forEach(item => {
                    item.addEventListener('click', function() {
                        const updateText = this.querySelector('p').textContent;
                        handleUpdateClick(updateText);
                    });
                });
            }
        });
}

// 处理动态项点击
function handleUpdateClick(updateText) {
    if (updateText.includes('文档')) {
        safeCommonUtils().navigateTo('resource-library.html');
    } else if (updateText.includes('问题') || updateText.includes('回复')) {
        safeCommonUtils().navigateTo('qa-system.html');
    } else if (updateText.includes('培训') || updateText.includes('课程')) {
        safeCommonUtils().navigateTo('resource-library.html?category=training');
    } else {
        safeCommonUtils().showToast('查看详情...', 'info');
    }
}

// 统计模块点击
function trackModuleClick(moduleName) {
    // 模拟统计API调用
    safeCommonUtils().mockApiRequest('/api/analytics/module-click', {
        method: 'POST',
        body: JSON.stringify({
            module: moduleName,
            timestamp: Date.now()
        })
    }).then(response => {
        console.log('模块点击统计:', moduleName);
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新最新动态
        loadRecentUpdates();
    }
});

// 下拉刷新模拟
let startY = 0;
let pullDistance = 0;
const pullThreshold = 80;

document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
    }
});

document.addEventListener('touchmove', function(e) {
    if (window.scrollY === 0 && startY > 0) {
        pullDistance = e.touches[0].clientY - startY;
        
        if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
            e.preventDefault();
            
            // 添加下拉视觉反馈
            const container = document.querySelector('.container');
            container.style.transform = `translateY(${Math.min(pullDistance * 0.5, pullThreshold)}px)`;
            container.style.transition = 'none';
        }
    }
});

document.addEventListener('touchend', function(e) {
    const container = document.querySelector('.container');
    container.style.transform = '';
    container.style.transition = 'transform 0.3s ease';
    
    if (pullDistance > pullThreshold) {
        // 触发刷新
        refreshPage();
    }
    
    startY = 0;
    pullDistance = 0;
});

// 刷新页面数据
function refreshPage() {
    safeCommonUtils().showToast('正在刷新...', 'info');
    
    // 模拟刷新延迟
    setTimeout(() => {
        loadRecentUpdates();
        safeCommonUtils().showToast('刷新完成', 'success');
    }, 1000);
}

// 显示用户菜单
function showUserMenu() {
    const modal = document.getElementById('userMenuModal');
    modal.style.display = 'flex';

    // 添加动画效果
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 关闭用户菜单
function closeUserMenu() {
    const modal = document.getElementById('userMenuModal');
    modal.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// 显示系统设置
function showSettings() {
    closeUserMenu();
    safeCommonUtils().showToast('系统设置功能开发中...', 'info');
}

// 显示消息通知
function showNotifications() {
    closeUserMenu();
    safeCommonUtils().showToast('您有3条未读消息', 'info');

    setTimeout(() => {
        safeCommonUtils().showToast('• 华东区5G专网交流群有新消息', 'info');
    }, 1000);

    setTimeout(() => {
        safeCommonUtils().showToast('• 移动云智能助手回复了您的问题', 'info');
    }, 2000);

    setTimeout(() => {
        safeCommonUtils().showToast('• 系统维护通知：今晚22:00-24:00', 'warning');
    }, 3000);
}

// 显示关于信息
function showAbout() {
    closeUserMenu();
    safeCommonUtils().showToast('移动云业务支撑平台 v2.1.0', 'info');

    setTimeout(() => {
        safeCommonUtils().showToast('技术支持：中国移动云能力中心', 'info');
    }, 1000);
}

// 退出登录
function logout() {
    closeUserMenu();

    if (confirm('确定要退出登录吗？')) {
        safeCommonUtils().showToast('正在退出登录...', 'info');

        setTimeout(() => {
            // 清除登录状态
            localStorage.removeItem('loginToken');
            localStorage.removeItem('currentUser');

            // 跳转到登录页面
            window.location.href = 'login.html';
        }, 1000);
    }
}

// 添加点击背景关闭模态框的功能
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        e.target.classList.remove('show');
    }
});
