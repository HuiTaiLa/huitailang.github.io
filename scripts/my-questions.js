// 我的提问页面JavaScript功能

let currentFilter = 'all';
let questions = [];

document.addEventListener('DOMContentLoaded', function() {
    initPage();
    loadQuestions();
    initFilterTabs();
});

// 初始化页面
function initPage() {
    console.log('我的提问页面已加载');
    
    // 设置页面标题
    document.title = '我的提问 - 移动云业务支撑';
}

// 加载问题数据
function loadQuestions() {
    // 模拟问题数据
    questions = [
        {
            id: 1,
            title: '5G专网部署时如何配置QoS参数？',
            content: '在部署5G专网时，需要为不同业务配置相应的QoS参数，请问具体的配置方法和注意事项有哪些？',
            status: 'answered',
            tags: ['5G专网', 'QoS', '网络配置'],
            answers: 3,
            views: 156,
            likes: 8,
            createTime: '2024-01-15 14:30',
            lastActivity: '2024-01-16 09:15'
        },
        {
            id: 2,
            title: '移动云平台API调用频率限制问题',
            content: '使用移动云平台API时遇到频率限制，请问如何申请更高的调用频率？',
            status: 'solved',
            tags: ['API', '频率限制', '移动云'],
            answers: 2,
            views: 89,
            likes: 5,
            createTime: '2024-01-12 10:20',
            lastActivity: '2024-01-13 16:45'
        },
        {
            id: 3,
            title: '网络切片在工业互联网中的应用场景',
            content: '想了解网络切片技术在工业互联网场景下的具体应用案例和实施方案。',
            status: 'pending',
            tags: ['网络切片', '工业互联网', '应用场景'],
            answers: 0,
            views: 45,
            likes: 2,
            createTime: '2024-01-18 16:45',
            lastActivity: '2024-01-18 16:45'
        },
        {
            id: 4,
            title: 'MEC边缘计算节点部署位置选择',
            content: '在规划MEC边缘计算节点时，如何选择最优的部署位置？有哪些关键因素需要考虑？',
            status: 'answered',
            tags: ['MEC', '边缘计算', '部署规划'],
            answers: 4,
            views: 203,
            likes: 12,
            createTime: '2024-01-10 11:30',
            lastActivity: '2024-01-14 14:20'
        },
        {
            id: 5,
            title: '专网安全防护策略咨询',
            content: '企业专网的安全防护应该采用什么策略？需要部署哪些安全设备和软件？',
            status: 'pending',
            tags: ['网络安全', '专网', '防护策略'],
            answers: 1,
            views: 67,
            likes: 3,
            createTime: '2024-01-17 09:15',
            lastActivity: '2024-01-17 15:30'
        },
        {
            id: 6,
            title: '云原生应用迁移最佳实践',
            content: '传统应用向云原生架构迁移的最佳实践是什么？有哪些工具可以辅助迁移？',
            status: 'closed',
            tags: ['云原生', '应用迁移', '最佳实践'],
            answers: 1,
            views: 34,
            likes: 1,
            createTime: '2024-01-08 13:45',
            lastActivity: '2024-01-09 10:20'
        }
    ];
    
    renderQuestions();
    updateStats();
}

// 渲染问题列表
function renderQuestions() {
    const questionList = document.getElementById('questionList');
    const filteredQuestions = filterQuestions();
    
    if (filteredQuestions.length === 0) {
        questionList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❓</div>
                <div class="empty-title">暂无问题</div>
                <div class="empty-desc">您还没有发布任何问题<br>点击右下角按钮发布第一个问题吧</div>
            </div>
        `;
        return;
    }
    
    questionList.innerHTML = filteredQuestions.map(question => `
        <div class="question-item" onclick="viewQuestion(${question.id})">
            <div class="question-header">
                <div class="question-title">${question.title}</div>
                <div class="question-status ${getStatusClass(question.status)}">${getStatusText(question.status)}</div>
            </div>
            <div class="question-content">${question.content}</div>
            <div class="question-tags">
                ${question.tags.map(tag => `<span class="question-tag">${tag}</span>`).join('')}
            </div>
            <div class="question-meta">
                <div class="question-stats">
                    <div class="stat-item">
                        <span>💬</span>
                        <span>${question.answers}</span>
                    </div>
                    <div class="stat-item">
                        <span>👁️</span>
                        <span>${question.views}</span>
                    </div>
                    <div class="stat-item">
                        <span>👍</span>
                        <span>${question.likes}</span>
                    </div>
                </div>
                <div class="question-time">${question.lastActivity}</div>
            </div>
        </div>
    `).join('');
}

// 筛选问题
function filterQuestions() {
    if (currentFilter === 'all') {
        return questions;
    }
    return questions.filter(question => question.status === currentFilter);
}

// 获取状态样式类
function getStatusClass(status) {
    const statusClasses = {
        'answered': 'status-answered',
        'pending': 'status-pending',
        'solved': 'status-solved',
        'closed': 'status-closed'
    };
    return statusClasses[status] || '';
}

// 获取状态文本
function getStatusText(status) {
    const statusTexts = {
        'answered': '已回答',
        'pending': '待回答',
        'solved': '已解决',
        'closed': '已关闭'
    };
    return statusTexts[status] || status;
}

// 更新统计信息
function updateStats() {
    const stats = {
        total: questions.length,
        answered: questions.filter(q => q.status === 'answered').length,
        pending: questions.filter(q => q.status === 'pending').length,
        solved: questions.filter(q => q.status === 'solved').length,
        closed: questions.filter(q => q.status === 'closed').length
    };
    
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-number').textContent = stats.total;
        statCards[1].querySelector('.stat-number').textContent = stats.answered + stats.solved;
        statCards[2].querySelector('.stat-number').textContent = stats.pending;
        statCards[3].querySelector('.stat-number').textContent = stats.closed;
    }
}

// 初始化筛选标签
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有active状态
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前active状态
            this.classList.add('active');
            
            // 更新筛选条件
            currentFilter = this.dataset.filter;
            
            // 重新渲染列表
            renderQuestions();
            
            // 显示提示
            const filterText = this.textContent;
            commonUtils.showToast(`已切换到：${filterText}`, 'info');
        });
    });
}

// 查看问题详情
function viewQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        commonUtils.showToast(`查看问题：${question.title}`, 'info');
        
        // 这里可以跳转到问题详情页面
        setTimeout(() => {
            // commonUtils.navigateTo(`question-detail.html?id=${questionId}`);
            commonUtils.showToast('问题详情页面开发中...', 'info');
        }, 1000);
    }
}

// 创建新问题
function createNewQuestion() {
    commonUtils.showToast('跳转到提问页面...', 'info');
    
    setTimeout(() => {
        // commonUtils.navigateTo('create-question.html');
        commonUtils.showToast('提问页面开发中...', 'info');
    }, 1000);
}

// 显示筛选选项
function showFilterOptions() {
    const modal = document.getElementById('filterModal');
    modal.style.display = 'flex';
    
    // 添加动画效果
    setTimeout(() => {
        modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.3s ease';
    }, 10);
}

// 关闭筛选模态框
function closeFilterModal() {
    const modal = document.getElementById('filterModal');
    modal.style.display = 'none';
}

// 重置筛选条件
function resetFilters() {
    const checkboxes = document.querySelectorAll('#filterModal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    const timeFilter = document.querySelector('.time-filter');
    timeFilter.value = 'all';
    
    commonUtils.showToast('筛选条件已重置', 'success');
}

// 应用筛选条件
function applyFilters() {
    const checkedStatuses = Array.from(document.querySelectorAll('#filterModal input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const timeFilter = document.querySelector('.time-filter').value;
    
    // 这里可以实现更复杂的筛选逻辑
    commonUtils.showToast('筛选条件已应用', 'success');
    closeFilterModal();
    
    // 重新渲染列表（这里简化处理）
    renderQuestions();
}

// 点击模态框背景关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('filterModal');
    if (e.target === modal) {
        closeFilterModal();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadQuestions();
    }
});
