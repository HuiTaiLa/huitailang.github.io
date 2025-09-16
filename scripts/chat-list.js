// 聊天列表页面JavaScript功能

// 安全的commonUtils包装函数
function safeCommonUtils() {
    if (typeof window.commonUtils !== 'undefined') {
        return window.commonUtils;
    }

    // 如果commonUtils未加载，返回备用函数
    return {
        showToast: function(message, type) {
            console.log(`[Toast ${type}] ${message}`);
            if (type === 'error') {
                alert(message);
            }
        },
        navigateTo: function(url) {
            window.location.href = url;
        }
    };
}

let currentTab = 'all';
let chatData = [];

document.addEventListener('DOMContentLoaded', function() {
    initPage();
    loadChatData();
    initTabs();
    initSearch();

    // 监听页面可见性变化，当用户返回时刷新数据
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // 页面变为可见时，重新加载聊天数据
            const savedChatData = JSON.parse(localStorage.getItem('chatListData') || '[]');
            if (savedChatData.length > 0) {
                console.log('页面可见，刷新聊天列表数据');
                loadChatData();
            }
        }
    });

    // 定期检查localStorage更新（备用机制）
    setInterval(function() {
        const savedChatData = JSON.parse(localStorage.getItem('chatListData') || '[]');
        const lastUpdate = localStorage.getItem('chatListLastUpdate');
        const currentUpdate = localStorage.getItem('chatListCurrentUpdate') || '0';

        if (lastUpdate !== currentUpdate) {
            console.log('检测到聊天数据更新，刷新列表');
            loadChatData();
            localStorage.setItem('chatListLastUpdate', currentUpdate);
        }
    }, 2000); // 每2秒检查一次
});

// 初始化页面
function initPage() {
    console.log('聊天列表页面已加载');
    document.title = '即时通讯 - 移动云业务支撑';

    // 检查URL参数中的区域过滤
    const urlParams = new URLSearchParams(window.location.search);
    const regionFilter = urlParams.get('region');

    if (regionFilter && regionFilter !== 'all') {
        console.log('应用区域过滤:', regionFilter);
        applyRegionFilter(regionFilter);
    }
}

// 加载聊天数据
function loadChatData() {
    // 从localStorage加载最新的聊天数据
    const savedChatData = JSON.parse(localStorage.getItem('chatListData') || '[]');

    // 默认聊天数据
    const defaultChatData = [
        // 群组聊天
        {
            id: 'group_1',
            type: 'group',
            name: '沈阳5G专网交流群',
            region: 'east', // 对应工作圈的east标签
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
            name: '大连物联网应用圈',
            region: 'south', // 对应工作圈的south标签
            avatar: '🌊',
            lastMessage: '李经理: 物联网设备接入方案已更新',
            lastTime: '13:45',
            unreadCount: 2,
            memberCount: 89,
            isOnline: true
        },
        {
            id: 'group_3',
            type: 'group',
            name: '盘锦运维管理群',
            region: 'north', // 对应工作圈的north标签
            avatar: '🛠️',
            lastMessage: '赵主管: 系统维护计划已制定',
            lastTime: '12:20',
            unreadCount: 1,
            memberCount: 45,
            isOnline: true
        },
        {
            id: 'group_4',
            type: 'group',
            name: '葫芦岛技术交流群',
            region: 'west', // 对应工作圈的west标签
            avatar: '🏔️',
            lastMessage: '王工: 新技术培训资料已分享',
            lastTime: '11:50',
            unreadCount: 0,
            memberCount: 32,
            isOnline: true
        },
        {
            id: 'group_5',
            type: 'group',
            name: '移动云技术支持群',
            region: 'all', // 全局群组
            avatar: '☁️',
            lastMessage: '技术支持: 系统升级通知',
            lastTime: '10:30',
            unreadCount: 3,
            memberCount: 156,
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

    // 合并默认数据和保存的数据
    chatData = mergeChatsData(defaultChatData, savedChatData);

    // 监听来自聊天页面的更新消息
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'chatListUpdate') {
            updateChatItem(event.data.data);
        }
    });

    // 监听localStorage变化
    window.addEventListener('storage', function(event) {
        if (event.key === 'chatListData') {
            const newChatData = JSON.parse(event.newValue || '[]');
            chatData = mergeChatsData(defaultChatData, newChatData);
            renderChatList();
        }
    });

    renderChatList();
}

// 合并聊天数据
function mergeChatsData(defaultData, savedData) {
    const merged = [...defaultData];

    // 更新已存在的聊天项
    savedData.forEach(savedChat => {
        const existingIndex = merged.findIndex(chat => chat.id === savedChat.id);
        if (existingIndex >= 0) {
            // 更新现有项目，保留默认数据的其他属性
            merged[existingIndex] = {
                ...merged[existingIndex],
                lastMessage: savedChat.lastMessage,
                lastTime: formatChatTime(savedChat.timestamp),
                timestamp: savedChat.timestamp
            };
        } else {
            // 添加新的聊天项
            const newChatItem = createChatItemFromSaved(savedChat);
            if (newChatItem) {
                merged.unshift(newChatItem);
            }
        }
    });

    // 按时间戳排序，最新的在前面
    merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return merged;
}

// 从保存的数据创建聊天项
function createChatItemFromSaved(savedChat) {
    const avatarMap = {
        'ai_bot': '🤖',
        'group': '👥',
        'contact': '👨‍💼',
        'support': '🛠️'
    };

    return {
        id: savedChat.id,
        type: savedChat.type,
        name: savedChat.name,
        avatar: avatarMap[savedChat.type] || '💬',
        lastMessage: savedChat.lastMessage,
        lastTime: formatChatTime(savedChat.timestamp),
        timestamp: savedChat.timestamp,
        unreadCount: savedChat.isOwn ? 0 : 1, // 如果不是自己发的消息，显示未读
        status: '在线',
        isOnline: true,
        region: 'shenyang' // 默认区域
    };
}

// 格式化聊天时间
function formatChatTime(timestamp) {
    if (!timestamp) return '';

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return messageTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return messageTime.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
}

// 更新单个聊天项
function updateChatItem(chatData) {
    const existingIndex = window.chatData.findIndex(chat => chat.id === chatData.id);
    if (existingIndex >= 0) {
        // 更新现有项目
        window.chatData[existingIndex] = {
            ...window.chatData[existingIndex],
            lastMessage: chatData.lastMessage,
            lastTime: formatChatTime(chatData.timestamp),
            timestamp: chatData.timestamp,
            unreadCount: chatData.isOwn ? window.chatData[existingIndex].unreadCount : (window.chatData[existingIndex].unreadCount || 0) + 1
        };

        // 移动到列表顶部
        const updatedItem = window.chatData.splice(existingIndex, 1)[0];
        window.chatData.unshift(updatedItem);

        // 重新渲染列表
        renderChatList();

        console.log('聊天列表项已更新:', updatedItem);
    }
}

// 渲染聊天列表
function renderChatList(customData = null) {
    const chatList = document.getElementById('chatList');
    const filteredChats = customData || filterChats();
    
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

            // 不再显示切换提示
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
        safeCommonUtils().showToast(`正在打开与${chat.name}的聊天...`, 'info');
        
        setTimeout(() => {
            // 根据聊天类型跳转到不同页面
            if (chat.type === 'group') {
                // 群组聊天跳转到具体群聊页面
                safeCommonUtils().navigateTo(`chat.html?group=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'contact') {
                // 私聊跳转到私聊页面
                safeCommonUtils().navigateTo(`chat.html?contact=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'ai_bot') {
                // AI机器人聊天跳转到AI聊天页面
                safeCommonUtils().navigateTo(`chat.html?ai_bot=${chatId}&name=${encodeURIComponent(chat.name)}`);
            } else if (chat.type === 'support') {
                // 客服聊天跳转到客服页面
                safeCommonUtils().navigateTo(`chat.html?support=${chatId}&name=${encodeURIComponent(chat.name)}`);
            }
        }, 500);
    }
}

// 执行搜索
function performSearch() {
    const query = document.getElementById('chatSearch').value.trim();
    if (query) {
        safeCommonUtils().showToast(`搜索：${query}`, 'info');
    } else {
        safeCommonUtils().showToast('请输入搜索关键词', 'warning');
    }
}

// 显示在线专家
function showOnlineExperts() {
    const onlineExperts = chatData.filter(chat => 
        chat.type === 'contact' && chat.isOnline
    );
    
    safeCommonUtils().showToast(`当前有${onlineExperts.length}位专家在线`, 'info');
    
    // 切换到联系人标签
    currentTab = 'contacts';
    document.querySelector('[data-tab="contacts"]').click();
}

// 显示群组聊天
function showGroupChats() {
    const groups = chatData.filter(chat => chat.type === 'group');
    
    safeCommonUtils().showToast(`共有${groups.length}个群组`, 'info');
    
    // 切换到群组标签
    currentTab = 'groups';
    document.querySelector('[data-tab="groups"]').click();
}

// 显示AI助手
function showAIAssistants() {
    const aiAssistants = chatData.filter(chat => chat.type === 'ai_bot');

    safeCommonUtils().showToast(`当前有${aiAssistants.length}个AI助手在线`, 'info');

    // 切换到AI助手标签
    currentTab = 'ai_bot';
    document.querySelector('[data-tab="ai_bot"]').click();
}

// 显示技术支持
function showTechnicalSupport() {
    safeCommonUtils().showToast('连接技术支持...', 'info');

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
    safeCommonUtils().showToast('创建群聊功能开发中...', 'info');
}

// 添加联系人
function addContact() {
    closeChatOptions();
    safeCommonUtils().showToast('添加联系人功能开发中...', 'info');
}

// 扫码加群
function scanQRCode() {
    closeChatOptions();
    safeCommonUtils().showToast('扫码加群功能开发中...', 'info');
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

// 应用区域过滤
function applyRegionFilter(region) {
    // 区域映射
    const regionMap = {
        'east': '沈阳',
        'south': '大连',
        'north': '盘锦',
        'west': '葫芦岛'
    };

    const regionName = regionMap[region] || region;
    console.log(`过滤区域: ${region} (${regionName})`);

    // 过滤聊天数据
    const filteredData = chatData.filter(chat => {
        if (chat.type === 'group') {
            // 群组过滤：显示指定区域的群组和全局群组
            return chat.region === region || chat.region === 'all';
        }
        // 联系人和其他类型不过滤
        return true;
    });

    // 页面标题保持不变，统一显示"即时通讯"
    const headerTitle = document.querySelector('.page-header h1');
    if (headerTitle) {
        headerTitle.textContent = '即时通讯';
    }

    // 重新渲染聊天列表
    renderChatList(filteredData);

    // 显示过滤提示
    safeCommonUtils().showToast(`已切换到${regionName}区域`, 'success');
}
