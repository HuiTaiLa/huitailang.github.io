// 聊天列表页面JavaScript功能

let currentTab = 'all';
let chatData = [];

document.addEventListener('DOMContentLoaded', function() {
    initPage();
    loadChatData();
    initTabs();
    initSearch();
});

// 初始化页面
function initPage() {
    console.log('聊天列表页面已加载');
    document.title = '即时通讯 - 移动云业务支撑';
}

// 加载聊天数据
function loadChatData() {
    // 模拟聊天数据
    chatData = [
        // 群组聊天
        {
            id: 'group_1',
            type: 'group',
            name: '华东区5G专网交流群',
            avatar: '🌐',
            lastMessage: '张工程师: 新的网络切片配置方案已上传',
            lastTime: '14:30',
            unreadCount: 3,
            memberCount: 156,
            isOnline: true
        },
        {
            id: 'group_2',
            type: 'group',
            name: '移动云技术支持群',
            avatar: '☁️',
            lastMessage: '李专家: 关于API调用频率的问题已解决',
            lastTime: '13:45',
            unreadCount: 0,
            memberCount: 89,
            isOnline: true
        },
        {
            id: 'group_3',
            type: 'group',
            name: '边缘计算研讨群',
            avatar: '⚡',
            lastMessage: '王总监: 明天下午2点开会讨论MEC部署',
            lastTime: '12:20',
            unreadCount: 1,
            memberCount: 45,
            isOnline: true
        },
        
        // 联系人
        {
            id: 'contact_1',
            type: 'contact',
            name: '张工程师',
            avatar: '👨‍💼',
            lastMessage: '好的，我马上查看文档',
            lastTime: '15:20',
            unreadCount: 0,
            title: '5G网络专家',
            isOnline: true
        },
        {
            id: 'contact_2',
            type: 'contact',
            name: '李专家',
            avatar: '👩‍💻',
            lastMessage: '这个问题需要进一步分析',
            lastTime: '11:30',
            unreadCount: 2,
            title: '云计算架构师',
            isOnline: false
        },
        {
            id: 'contact_3',
            type: 'contact',
            name: '王总监',
            avatar: '👨‍💼',
            lastMessage: '会议资料已发送',
            lastTime: '昨天',
            unreadCount: 0,
            title: '技术总监',
            isOnline: true
        },
        
        // AI机器人
        {
            id: 'ai_bot_1',
            type: 'ai_bot',
            name: '移动云智能助手',
            avatar: '🤖',
            lastMessage: '我可以帮您解答技术问题、查找文档和分析数据',
            lastTime: '刚刚',
            unreadCount: 0,
            status: '24小时在线',
            isOnline: true,
            capabilities: ['技术问答', '文档检索', '数据分析', '代码生成']
        },
        {
            id: 'ai_bot_2',
            type: 'ai_bot',
            name: '5G专网助手',
            avatar: '📡',
            lastMessage: '专业解答5G专网相关问题',
            lastTime: '刚刚',
            unreadCount: 0,
            status: '24小时在线',
            isOnline: true,
            capabilities: ['5G技术', '网络配置', '故障诊断', '性能优化']
        },

        // 客服支持
        {
            id: 'support_1',
            type: 'support',
            name: '技术支持',
            avatar: '🛠️',
            lastMessage: '您好，有什么可以帮助您的吗？',
            lastTime: '16:00',
            unreadCount: 0,
            status: '在线',
            isOnline: true
        },
        {
            id: 'support_2',
            type: 'support',
            name: '客户服务',
            avatar: '💬',
            lastMessage: '感谢您的反馈，我们会及时处理',
            lastTime: '10:15',
            unreadCount: 0,
            status: '在线',
            isOnline: true
        }
    ];
    
    renderChatList();
}

// 渲染聊天列表
function renderChatList() {
    const chatList = document.getElementById('chatList');
    const filteredChats = filterChats();
    
    if (filteredChats.length === 0) {
        chatList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <div class="empty-title">暂无聊天</div>
                <div class="empty-desc">点击右上角按钮开始新的对话</div>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = filteredChats.map(chat => `
        <div class="chat-item" onclick="openChat('${chat.id}')">
            <div class="chat-avatar ${chat.type}">
                ${chat.avatar}
                ${chat.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="chat-content">
                <div class="chat-header">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-time">${chat.lastTime}</div>
                </div>
                <div class="chat-preview">${chat.lastMessage}</div>
            </div>
            <div class="chat-meta">
                ${chat.unreadCount > 0 ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
                ${getChatStatusInfo(chat)}
            </div>
        </div>
    `).join('');
}

// 筛选聊天
function filterChats() {
    switch (currentTab) {
        case 'groups':
            return chatData.filter(chat => chat.type === 'group');
        case 'contacts':
            return chatData.filter(chat => chat.type === 'contact');
        case 'ai_bot':
            return chatData.filter(chat => chat.type === 'ai_bot');
        case 'support':
            return chatData.filter(chat => chat.type === 'support');
        default:
            return chatData;
    }
}

// 获取聊天状态信息
function getChatStatusInfo(chat) {
    switch (chat.type) {
        case 'group':
            return `<div class="chat-status">${chat.memberCount}人</div>`;
        case 'contact':
            return `<div class="chat-status">${chat.title || ''}</div>`;
        case 'ai_bot':
            return `<div class="chat-status">🤖 AI助手</div>`;
        case 'support':
            return `<div class="chat-status">${chat.status}</div>`;
        default:
            return '';
    }
}

// 初始化标签页
function initTabs() {
    const tabs = document.querySelectorAll('.chat-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有active状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前active状态
            this.classList.add('active');
            
            // 更新当前标签
            currentTab = this.dataset.tab;
            
            // 重新渲染列表
            renderChatList();
            
            // 显示提示
            const tabText = this.textContent;
            commonUtils.showToast(`已切换到：${tabText}`, 'info');
        });
    });
}

// 初始化搜索
function initSearch() {
    const searchInput = document.getElementById('chatSearch');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query) {
            // 实时搜索
            const filteredData = chatData.filter(chat => 
                chat.name.toLowerCase().includes(query) ||
                chat.lastMessage.toLowerCase().includes(query)
            );
            
            renderFilteredChats(filteredData);
        } else {
            renderChatList();
        }
    });
}

// 渲染搜索结果
function renderFilteredChats(filteredData) {
    const chatList = document.getElementById('chatList');
    
    if (filteredData.length === 0) {
        chatList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">未找到相关聊天</div>
                <div class="empty-desc">尝试使用其他关键词搜索</div>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = filteredData.map(chat => `
        <div class="chat-item" onclick="openChat('${chat.id}')">
            <div class="chat-avatar ${chat.type}">
                ${chat.avatar}
                ${chat.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="chat-content">
                <div class="chat-header">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-time">${chat.lastTime}</div>
                </div>
                <div class="chat-preview">${chat.lastMessage}</div>
            </div>
            <div class="chat-meta">
                ${chat.unreadCount > 0 ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
                ${getChatStatusInfo(chat)}
            </div>
        </div>
    `).join('');
}

// 打开聊天
function openChat(chatId) {
    const chat = chatData.find(c => c.id === chatId);
    if (chat) {
        commonUtils.showToast(`正在打开与${chat.name}的聊天...`, 'info');
        
        setTimeout(() => {
            // 根据聊天类型跳转到不同页面
            if (chat.type === 'group') {
                // 群组聊天跳转到具体群聊页面
                commonUtils.navigateTo(`chat.html?group=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'contact') {
                // 私聊跳转到私聊页面
                commonUtils.navigateTo(`chat.html?contact=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'ai_bot') {
                // AI机器人聊天跳转到AI聊天页面
                commonUtils.navigateTo(`chat.html?ai_bot=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'support') {
                // 客服聊天跳转到客服页面
                commonUtils.navigateTo(`chat.html?support=${chatId}&name=${encodeURIComponent(chat.name)}`);
            }
        }, 500);
    }
}

// 执行搜索
function performSearch() {
    const query = document.getElementById('chatSearch').value.trim();
    if (query) {
        commonUtils.showToast(`搜索：${query}`, 'info');
    } else {
        commonUtils.showToast('请输入搜索关键词', 'warning');
    }
}

// 显示在线专家
function showOnlineExperts() {
    const onlineExperts = chatData.filter(chat => 
        chat.type === 'contact' && chat.isOnline
    );
    
    commonUtils.showToast(`当前有${onlineExperts.length}位专家在线`, 'info');
    
    // 切换到联系人标签
    currentTab = 'contacts';
    document.querySelector('[data-tab="contacts"]').click();
}

// 显示群组聊天
function showGroupChats() {
    const groups = chatData.filter(chat => chat.type === 'group');
    
    commonUtils.showToast(`共有${groups.length}个群组`, 'info');
    
    // 切换到群组标签
    currentTab = 'groups';
    document.querySelector('[data-tab="groups"]').click();
}

// 显示AI助手
function showAIAssistants() {
    const aiAssistants = chatData.filter(chat => chat.type === 'ai_bot');

    commonUtils.showToast(`当前有${aiAssistants.length}个AI助手在线`, 'info');

    // 切换到AI助手标签
    currentTab = 'ai_bot';
    document.querySelector('[data-tab="ai_bot"]').click();
}

// 显示技术支持
function showTechnicalSupport() {
    commonUtils.showToast('连接技术支持...', 'info');

    setTimeout(() => {
        openChat('support_1');
    }, 1000);
}

// 显示聊天选项
function showChatOptions() {
    const modal = document.getElementById('chatOptionsModal');
    modal.style.display = 'flex';
}

// 关闭聊天选项
function closeChatOptions() {
    const modal = document.getElementById('chatOptionsModal');
    modal.style.display = 'none';
}

// 创建群聊
function createGroupChat() {
    closeChatOptions();
    commonUtils.showToast('创建群聊功能开发中...', 'info');
}

// 添加联系人
function addContact() {
    closeChatOptions();
    commonUtils.showToast('添加联系人功能开发中...', 'info');
}

// 扫码加群
function scanQRCode() {
    closeChatOptions();
    commonUtils.showToast('扫码加群功能开发中...', 'info');
}

// 点击模态框背景关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('chatOptionsModal');
    if (e.target === modal) {
        closeChatOptions();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadChatData();
    }
});

// 导航函数
function navigateTo(url) {
    window.location.href = url;
}
