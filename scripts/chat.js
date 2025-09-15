// 聊天页面JavaScript功能

let isTyping = false;
let typingTimer = null;
let messageHistory = [];
let currentChatId = 'group-001';
let currentChatInfo = {
    name: '华东区5G专网交流群',
    onlineCount: 156,
    type: 'group'
};

document.addEventListener('DOMContentLoaded', function() {
    initChatFromURL();
    initChatInterface();
    initMessageInput();
    initToolbar();
    loadChatHistory();
    setupAutoScroll();
});

// 从URL参数初始化聊天信息
function initChatFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('group');
    const contactId = urlParams.get('contact');
    const aiBotId = urlParams.get('ai_bot');
    const supportId = urlParams.get('support');
    const chatName = urlParams.get('name');

    if (groupId) {
        // 群组聊天
        currentChatId = groupId;
        currentChatInfo.type = 'group';

        if (chatName) {
            currentChatInfo.name = decodeURIComponent(chatName);
        } else {
            // 根据群组ID设置默认名称
            const groupNames = {
                'group_1': '华东区5G专网交流群',
                'group_2': '移动云技术支持群',
                'group_3': '边缘计算研讨群'
            };
            currentChatInfo.name = groupNames[groupId] || '工作圈交流群';
        }

        currentChatInfo.onlineCount = Math.floor(Math.random() * 200) + 50; // 随机在线人数

    } else if (contactId) {
        // 私聊
        currentChatId = contactId;
        currentChatInfo.type = 'contact';
        currentChatInfo.name = chatName ? decodeURIComponent(chatName) : '专家咨询';
        currentChatInfo.onlineCount = 1;

    } else if (aiBotId) {
        // AI机器人聊天
        currentChatId = aiBotId;
        currentChatInfo.type = 'ai_bot';
        currentChatInfo.name = chatName ? decodeURIComponent(chatName) : 'AI智能助手';
        currentChatInfo.onlineCount = 1;

    } else if (supportId) {
        // 客服聊天
        currentChatId = supportId;
        currentChatInfo.type = 'support';
        currentChatInfo.name = '技术支持';
        currentChatInfo.onlineCount = 1;
    }

    // 更新页面标题和在线人数
    updateChatHeader();
}

// 更新聊天头部信息
function updateChatHeader() {
    const chatTitle = document.getElementById('chatTitle');
    const onlineCount = document.getElementById('onlineCount');

    if (chatTitle) {
        chatTitle.textContent = currentChatInfo.name;
        document.title = `${currentChatInfo.name} - 即时通讯`;
    }

    if (onlineCount) {
        if (currentChatInfo.type === 'group') {
            onlineCount.textContent = `${currentChatInfo.onlineCount}人在线`;
        } else if (currentChatInfo.type === 'contact') {
            onlineCount.textContent = '专家在线';
        } else if (currentChatInfo.type === 'ai_bot') {
            onlineCount.textContent = '🤖 AI助手在线';
        } else if (currentChatInfo.type === 'support') {
            onlineCount.textContent = '客服在线';
        }
    }
}

// 初始化聊天界面
function initChatInterface() {
    const chatMessages = document.getElementById('chatMessages');
    
    // 滚动到底部
    scrollToBottom();
    
    // 监听新消息
    setupMessageListener();
    
    // 初始化消息项事件
    initMessageEvents();
}

// 初始化消息输入
function initMessageInput() {
    const messageInput = document.getElementById('messageInput');
    
    if (messageInput) {
        // 自动调整高度
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            
            // 显示正在输入状态
            showTypingStatus();
        });
        
        // 回车发送消息
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 失去焦点时隐藏正在输入状态
        messageInput.addEventListener('blur', function() {
            hideTypingStatus();
        });
    }
}

// 初始化工具栏
function initToolbar() {
    // 工具栏按钮已在HTML中定义onclick事件
    // 这里可以添加额外的初始化逻辑
}

// 发送消息
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        commonUtils.showToast('请输入消息内容', 'error');
        return;
    }
    
    // 创建消息对象
    const messageData = {
        id: Date.now(),
        type: 'text',
        content: message,
        sender: {
            id: 'current-user',
            name: '张明',
            avatar: 'images/my-avatar.png'
        },
        timestamp: Date.now(),
        isOwn: true
    };
    
    // 添加消息到界面
    addMessageToChat(messageData);

    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // 检测是否需要AI机器人回复
    if (currentChatInfo.type === 'group' && detectBotMention(message)) {
        // 群聊中@机器人
        handleAIBotReply(message);
    } else if (currentChatInfo.type === 'ai_bot') {
        // 与AI机器人私聊
        handleAIBotReply(message, currentChatId);
    }

    // 发送到服务器
    sendMessageToServer(messageData);
    
    // 滚动到底部
    scrollToBottom();
    
    // 模拟AI回复
    setTimeout(() => {
        simulateAIResponse(message);
    }, 2000);
}

// 添加消息到聊天界面
function addMessageToChat(messageData) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = createMessageElement(messageData);
    
    // 移除正在输入指示器
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
    
    chatMessages.appendChild(messageElement);
    
    // 添加消息到历史记录
    messageHistory.push(messageData);
    
    // 添加动画效果
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

// 创建消息元素
function createMessageElement(messageData) {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${messageData.isOwn ? 'own-message' : ''}`;
    messageItem.dataset.messageId = messageData.id;

    if (messageData.type === 'system') {
        messageItem.classList.add('system-message');
        messageItem.innerHTML = `
            <div class="message-content">
                <span class="system-text">${messageData.content}</span>
                <span class="message-time">${commonUtils.formatTime(messageData.timestamp, 'HH:mm')}</span>
            </div>
        `;
    } else if (messageData.type === 'ai_reply' || messageData.isAI) {
        messageItem.classList.add('ai-message');
        messageItem.innerHTML = createAIMessageHTML(messageData);
    } else {
        messageItem.innerHTML = createNormalMessageHTML(messageData);
    }

    return messageItem;
}

// 创建普通消息HTML
function createNormalMessageHTML(messageData) {
    const avatarHTML = messageData.isOwn ? '' : `
        <div class="message-avatar">
            <img src="${messageData.sender.avatar}" alt="${messageData.sender.name}">
        </div>
    `;
    
    const bubbleClass = messageData.isOwn ? 'own-bubble' : '';
    const headerHTML = messageData.isOwn ? `
        <span class="message-time">${commonUtils.formatTime(messageData.timestamp, 'HH:mm')}</span>
    ` : `
        <span class="sender-name">${messageData.sender.name}</span>
        <span class="sender-role">${messageData.sender.role || '成员'}</span>
        <span class="message-time">${commonUtils.formatTime(messageData.timestamp, 'HH:mm')}</span>
    `;
    
    const contentHTML = getMessageContentHTML(messageData);
    
    const ownAvatarHTML = messageData.isOwn ? `
        <div class="message-avatar">
            <img src="${messageData.sender.avatar}" alt="${messageData.sender.name}">
        </div>
    ` : '';
    
    return `
        ${avatarHTML}
        <div class="message-bubble ${bubbleClass}">
            <div class="message-header">
                ${headerHTML}
            </div>
            ${contentHTML}
        </div>
        ${ownAvatarHTML}
    `;
}

// 创建AI消息HTML
function createAIMessageHTML(messageData) {
    const capabilitiesHTML = messageData.capabilities ? `
        <div class="ai-capabilities">
            ${messageData.capabilities.map(cap => `<span class="ai-capability-tag">${cap}</span>`).join('')}
        </div>
    ` : '';

    const attachmentsHTML = messageData.attachments && messageData.attachments.length > 0 ? `
        <div class="ai-attachments">
            ${messageData.attachments.map(attachment => `
                <div class="ai-attachment" onclick="downloadAIAttachment('${attachment.name}', '${attachment.type}')">
                    <div class="ai-attachment-icon">${getAttachmentIcon(attachment.type)}</div>
                    <div class="ai-attachment-info">
                        <div class="ai-attachment-name">${attachment.name}</div>
                        <div class="ai-attachment-size">${attachment.size}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '';

    return `
        <div class="message-avatar">
            <span class="avatar-text">${messageData.sender.avatar}</span>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="sender-name">${messageData.sender.name}</span>
                <span class="sender-role">🤖 ${messageData.sender.role}</span>
                <span class="message-time">${commonUtils.formatTime(messageData.timestamp, 'HH:mm')}</span>
            </div>
            <div class="message-text">${messageData.content}</div>
            ${capabilitiesHTML}
            ${attachmentsHTML}
            ${messageData.recommendations ? createRecommendationsHTML(messageData.recommendations) : ''}
        </div>
    `;
}

// 获取消息内容HTML
function getMessageContentHTML(messageData) {
    switch(messageData.type) {
        case 'text':
            return `<div class="message-text">${messageData.content}</div>`;
        case 'file':
            return createFileMessageHTML(messageData);
        case 'image':
            return createImageMessageHTML(messageData);
        default:
            return `<div class="message-text">${messageData.content}</div>`;
    }
}

// 创建文件消息HTML
function createFileMessageHTML(messageData) {
    return `
        <div class="message-text">${messageData.text || ''}</div>
        <div class="message-file">
            <div class="file-icon">${getFileIcon(messageData.fileName)}</div>
            <div class="file-info">
                <span class="file-name">${messageData.fileName}</span>
                <span class="file-size">${messageData.fileSize}</span>
            </div>
            <button class="file-download" onclick="downloadFile('${messageData.fileUrl}', '${messageData.fileName}')">下载</button>
        </div>
    `;
}

// 创建图片消息HTML
function createImageMessageHTML(messageData) {
    return `
        <div class="message-text">${messageData.text || ''}</div>
        <div class="message-image">
            <img src="${messageData.imageUrl}" alt="图片" onclick="previewImage('${messageData.imageUrl}')">
        </div>
    `;
}

// 创建推荐内容HTML
function createRecommendationsHTML(recommendations) {
    const items = recommendations.map(rec => `
        <div class="recommendation-item" onclick="openRecommendation('${rec.url}')">
            <span class="rec-icon">${rec.icon}</span>
            <span class="rec-title">${rec.title}</span>
        </div>
    `).join('');
    
    return `<div class="ai-recommendations">${items}</div>`;
}

// 获取文件图标
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'ppt': '📊',
        'pptx': '📊',
        'xls': '📈',
        'xlsx': '📈',
        'zip': '📦',
        'rar': '📦'
    };
    return iconMap[ext] || '📄';
}

// 显示正在输入状态
function showTypingStatus() {
    if (isTyping) return;
    
    isTyping = true;
    
    // 发送正在输入状态到服务器
    commonUtils.mockApiRequest('/api/chat/typing', {
        method: 'POST',
        body: JSON.stringify({
            chatId: currentChatId,
            typing: true
        })
    });
    
    // 设置定时器，3秒后自动隐藏
    if (typingTimer) {
        clearTimeout(typingTimer);
    }
    
    typingTimer = setTimeout(() => {
        hideTypingStatus();
    }, 3000);
}

// 隐藏正在输入状态
function hideTypingStatus() {
    if (!isTyping) return;
    
    isTyping = false;
    
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    
    // 发送停止输入状态到服务器
    commonUtils.mockApiRequest('/api/chat/typing', {
        method: 'POST',
        body: JSON.stringify({
            chatId: currentChatId,
            typing: false
        })
    });
}

// 滚动到底部
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

// 设置自动滚动
function setupAutoScroll() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // 监听滚动事件，判断是否需要自动滚动
    let isUserScrolling = false;
    let scrollTimer = null;
    
    chatMessages.addEventListener('scroll', function() {
        isUserScrolling = true;
        
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        
        scrollTimer = setTimeout(() => {
            isUserScrolling = false;
        }, 1000);
    });
    
    // 新消息时自动滚动到底部
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                if (!isUserScrolling) {
                    scrollToBottom();
                }
            }
        });
    });
    
    observer.observe(chatMessages, {
        childList: true
    });
}

// 加载聊天历史
function loadChatHistory() {
    commonUtils.mockApiRequest(`/api/chat/${currentChatId}/history`)
        .then(response => {
            if (response.success) {
                messageHistory = response.data.messages || [];
                // 这里可以渲染历史消息
                console.log('聊天历史:', messageHistory);
            }
        });
}

// 发送消息到服务器
function sendMessageToServer(messageData) {
    commonUtils.mockApiRequest('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({
            chatId: currentChatId,
            message: messageData
        })
    }).then(response => {
        if (response.success) {
            console.log('消息发送成功');
        } else {
            commonUtils.showToast('消息发送失败', 'error');
        }
    });
}

// 模拟AI回复
function simulateAIResponse(userMessage) {
    // 显示正在输入指示器
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }
    
    setTimeout(() => {
        const aiResponse = generateAIResponse(userMessage);
        addMessageToChat(aiResponse);
        scrollToBottom();
    }, 1500);
}

// 生成AI回复
function generateAIResponse(userMessage) {
    const responses = [
        {
            content: '我理解您的问题，让我为您查找相关的技术文档和解决方案。',
            recommendations: [
                { icon: '📋', title: '5G网络优化指南', url: '#' },
                { icon: '🔧', title: '故障排除手册', url: '#' }
            ]
        },
        {
            content: '根据您提到的技术问题，我推荐以下资源供您参考：',
            recommendations: [
                { icon: '📖', title: '最佳实践文档', url: '#' },
                { icon: '🎯', title: '案例分析报告', url: '#' }
            ]
        },
        {
            content: '感谢您的分享！这个经验对其他同事很有帮助。我已经将相关内容添加到知识库中。'
        }
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
        id: Date.now(),
        type: 'ai',
        content: randomResponse.content,
        recommendations: randomResponse.recommendations,
        timestamp: Date.now(),
        isOwn: false
    };
}

// 工具栏功能函数
function selectFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };
    
    input.click();
}

function selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file);
        }
    };
    
    input.click();
}

function showEmoji() {
    commonUtils.showToast('表情功能开发中...', 'info');
}

function showAIAssist() {
    const panel = document.getElementById('aiAssistPanel');
    if (panel) {
        panel.classList.add('show');
        panel.style.display = 'block';
    }
}

function hideAIAssist() {
    const panel = document.getElementById('aiAssistPanel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => {
            panel.style.display = 'none';
        }, 300);
    }
}

function insertSuggestion(text) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = text;
        messageInput.focus();
    }
    hideAIAssist();
}

function showChatMenu() {
    console.log('showChatMenu 被调用');

    let modal = document.getElementById('chatMenuModal');
    console.log('找到模态框:', modal);

    if (!modal) {
        console.log('模态框不存在，创建新的');
        // 直接创建完整的模态框
        modal = document.createElement('div');
        modal.id = 'chatMenuModal';
        modal.className = 'modal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 360px; width: 90%; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); max-height: 80vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">聊天菜单</h3>
                    <button class="close-btn" onclick="closeChatMenu()" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">👥</div>
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #333;">${currentChatInfo.name}</h4>
                            <p style="margin: 0; font-size: 14px; color: #666;">群成员 ${getGroupMemberCount()}人</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 8px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onclick="showGroupMembers()" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 18px; width: 24px; text-align: center;">👥</span>
                            <span>群成员列表</span>
                            <span style="margin-left: auto; background: #667eea; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-right: 8px;">${getGroupMemberCount()}</span>
                            <span style="color: #999; font-size: 16px;">›</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 8px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onclick="showGroupInfo()" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 18px; width: 24px; text-align: center;">ℹ️</span>
                            <span>群聊信息</span>
                            <span style="margin-left: auto; color: #999; font-size: 16px;">›</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 8px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onclick="showGroupFiles()" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 18px; width: 24px; text-align: center;">📁</span>
                            <span>群文件</span>
                            <span style="margin-left: auto; color: #999; font-size: 16px;">›</span>
                        </div>
                        <div style="height: 1px; background: #f0f0f0; margin: 8px 0;"></div>
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 8px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onclick="searchInChat()" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 18px; width: 24px; text-align: center;">🔍</span>
                            <span>聊天记录搜索</span>
                            <span style="margin-left: auto; color: #999; font-size: 16px;">›</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 8px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onclick="clearChatHistory()" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 18px; width: 24px; text-align: center;">🗑️</span>
                            <span>清空聊天记录</span>
                            <span style="margin-left: auto; color: #999; font-size: 16px;">›</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('创建并添加模态框到页面');

        // 添加点击背景关闭功能
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('点击背景关闭模态框');
                closeChatMenu();
            }
        });
    }

    console.log('显示模态框');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    // 添加动画效果
    setTimeout(() => {
        modal.classList.add('show');
        console.log('添加show类');
    }, 10);
}

// 关闭聊天菜单
function closeChatMenu() {
    console.log('closeChatMenu 被调用');
    const modal = document.getElementById('chatMenuModal');
    if (modal) {
        console.log('关闭模态框');
        modal.classList.remove('show');
        modal.style.display = 'none';
    } else {
        console.log('模态框不存在');
    }
}

// 更新聊天菜单内容
function updateChatMenuContent() {
    const menuBody = document.querySelector('#chatMenuModal .modal-body');
    if (!menuBody) return;

    let menuContent = '';

    if (currentChatInfo.type === 'group') {
        // 群聊菜单
        menuContent = `
            <div class="chat-info-section">
                <div class="chat-avatar-large">👥</div>
                <div class="chat-details">
                    <h4>${currentChatInfo.name}</h4>
                    <p>群成员 ${getGroupMemberCount()}人</p>
                </div>
            </div>
            <div class="menu-list">
                <div class="menu-item" onclick="showGroupMembers()">
                    <span class="menu-icon">👥</span>
                    <span>群成员列表</span>
                    <span class="menu-badge">${getGroupMemberCount()}</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showGroupInfo()">
                    <span class="menu-icon">ℹ️</span>
                    <span>群聊信息</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showGroupFiles()">
                    <span class="menu-icon">📁</span>
                    <span>群文件</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showGroupNotifications()">
                    <span class="menu-icon">🔔</span>
                    <span>消息通知</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showGroupSettings()">
                    <span class="menu-icon">⚙️</span>
                    <span>群聊设置</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item" onclick="searchInChat()">
                    <span class="menu-icon">🔍</span>
                    <span>聊天记录搜索</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="clearChatHistory()">
                    <span class="menu-icon">🗑️</span>
                    <span>清空聊天记录</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
        `;
    } else if (currentChatInfo.type === 'ai_bot') {
        // AI机器人菜单
        menuContent = `
            <div class="chat-info-section">
                <div class="chat-avatar-large ai-avatar">🤖</div>
                <div class="chat-details">
                    <h4>${currentChatInfo.name}</h4>
                    <p>AI智能助手</p>
                    <span class="ai-status online">在线</span>
                </div>
            </div>
            <div class="menu-list">
                <div class="menu-item" onclick="showAICapabilities()">
                    <span class="menu-icon">🧠</span>
                    <span>AI能力介绍</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showAIHistory()">
                    <span class="menu-icon">📝</span>
                    <span>对话历史</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="resetAIContext()">
                    <span class="menu-icon">🔄</span>
                    <span>重置对话上下文</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item" onclick="searchInChat()">
                    <span class="menu-icon">🔍</span>
                    <span>聊天记录搜索</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="clearChatHistory()">
                    <span class="menu-icon">🗑️</span>
                    <span>清空聊天记录</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
        `;
    } else {
        // 私聊菜单
        menuContent = `
            <div class="chat-info-section">
                <div class="chat-avatar-large">👤</div>
                <div class="chat-details">
                    <h4>${currentChatInfo.name}</h4>
                    <p>技术支持专家</p>
                    <span class="user-status online">在线</span>
                </div>
            </div>
            <div class="menu-list">
                <div class="menu-item" onclick="showUserProfile()">
                    <span class="menu-icon">👤</span>
                    <span>用户资料</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="showSharedFiles()">
                    <span class="menu-icon">📁</span>
                    <span>共享文件</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item" onclick="searchInChat()">
                    <span class="menu-icon">🔍</span>
                    <span>聊天记录搜索</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="menu-item" onclick="clearChatHistory()">
                    <span class="menu-icon">🗑️</span>
                    <span>清空聊天记录</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
        `;
    }

    menuBody.innerHTML = menuContent;
}

// 文件上传
function uploadFile(file) {
    commonUtils.showLoading('上传文件中...');
    
    // 模拟文件上传
    setTimeout(() => {
        commonUtils.hideLoading();
        
        const fileMessage = {
            id: Date.now(),
            type: 'file',
            text: '分享了一个文件：',
            fileName: file.name,
            fileSize: commonUtils.formatFileSize(file.size),
            fileUrl: '#',
            sender: {
                id: 'current-user',
                name: '张明',
                avatar: 'images/my-avatar.png'
            },
            timestamp: Date.now(),
            isOwn: true
        };
        
        addMessageToChat(fileMessage);
        scrollToBottom();
        
        commonUtils.showToast('文件上传成功', 'success');
    }, 2000);
}

// 图片上传
function uploadImage(file) {
    commonUtils.showLoading('上传图片中...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        commonUtils.hideLoading();
        
        const imageMessage = {
            id: Date.now(),
            type: 'image',
            text: '分享了一张图片：',
            imageUrl: e.target.result,
            sender: {
                id: 'current-user',
                name: '张明',
                avatar: 'images/my-avatar.png'
            },
            timestamp: Date.now(),
            isOwn: true
        };
        
        addMessageToChat(imageMessage);
        scrollToBottom();
        
        commonUtils.showToast('图片上传成功', 'success');
    };
    
    reader.readAsDataURL(file);
}

// 下载文件
function downloadFile(fileUrl, fileName) {
    commonUtils.showToast('开始下载文件...', 'info');
    
    // 模拟下载
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
}

// 预览图片
function previewImage(imageUrl) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    overlay.onclick = () => {
        document.body.removeChild(overlay);
    };
}

// 打开推荐内容
function openRecommendation(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        commonUtils.showToast('推荐内容功能开发中...', 'info');
    }
}

// 初始化消息事件
function initMessageEvents() {
    // 这里可以添加消息相关的事件监听
    // 比如长按消息显示菜单等
}

// 设置消息监听器
function setupMessageListener() {
    // 这里可以设置WebSocket或其他实时消息监听
    // 模拟接收新消息
    setInterval(() => {
        if (Math.random() < 0.1) { // 10%概率接收新消息
            receiveRandomMessage();
        }
    }, 10000);
}

// 接收随机消息
function receiveRandomMessage() {
    const messages = [
        '大家下午好！',
        '刚刚看到一个很有意思的技术方案',
        '有人遇到过网络延迟的问题吗？',
        '分享一个优化心得给大家'
    ];
    
    const senders = [
        { name: '李工', avatar: 'images/user2.png', role: '技术专家' },
        { name: '王经理', avatar: 'images/user3.png', role: '产品经理' },
        { name: '刘总', avatar: 'images/user4.png', role: '区域总监' }
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    
    const messageData = {
        id: Date.now(),
        type: 'text',
        content: randomMessage,
        sender: randomSender,
        timestamp: Date.now(),
        isOwn: false
    };
    
    addMessageToChat(messageData);
    scrollToBottom();
}

// AI机器人功能
const AI_BOTS = {
    'ai_bot_1': {
        name: '移动云智能助手',
        avatar: '🤖',
        capabilities: ['技术问答', '文档检索', '数据分析', '代码生成'],
        personality: 'professional'
    },
    'ai_bot_2': {
        name: '5G专网助手',
        avatar: '📡',
        capabilities: ['5G技术', '网络配置', '故障诊断', '性能优化'],
        personality: 'technical'
    }
};

// 检测@机器人消息
function detectBotMention(message) {
    const botNames = Object.values(AI_BOTS).map(bot => bot.name);
    const mentionPattern = /@(移动云智能助手|5G专网助手|智能助手|AI助手)/g;

    return mentionPattern.test(message);
}

// 处理AI机器人回复
function handleAIBotReply(userMessage, botId = null) {
    // 确定要回复的机器人
    let targetBot = null;

    if (botId && AI_BOTS[botId]) {
        targetBot = AI_BOTS[botId];
    } else if (currentChatInfo.type === 'ai_bot' && AI_BOTS[currentChatId]) {
        targetBot = AI_BOTS[currentChatId];
    } else {
        // 默认使用移动云智能助手
        targetBot = AI_BOTS['ai_bot_1'];
    }

    if (!targetBot) return;

    // 显示机器人正在输入状态
    showBotTyping(targetBot);

    // 模拟AI处理时间
    setTimeout(() => {
        hideBotTyping();

        // 生成AI回复
        const aiReply = generateAIReply(userMessage, targetBot);

        const messageData = {
            id: Date.now(),
            type: 'ai_reply',
            content: aiReply.content,
            sender: {
                name: targetBot.name,
                avatar: targetBot.avatar,
                role: 'AI助手'
            },
            timestamp: Date.now(),
            isOwn: false,
            isAI: true,
            capabilities: aiReply.capabilities,
            attachments: aiReply.attachments
        };

        addMessageToChat(messageData);
        scrollToBottom();

    }, Math.random() * 2000 + 1000); // 1-3秒随机延迟
}

// 生成AI回复内容
function generateAIReply(userMessage, bot) {
    const message = userMessage.toLowerCase();

    // 基于关键词生成回复
    if (message.includes('文档') || message.includes('资料') || message.includes('手册')) {
        return {
            content: `我为您找到了相关文档资料。根据您的问题，我推荐以下文档：\n\n📄 5G专网技术白皮书\n📄 移动云平台操作指南\n📄 网络配置最佳实践\n\n需要我详细解释某个文档的内容吗？`,
            capabilities: ['文档检索', '内容解析'],
            attachments: [
                { type: 'document', name: '5G专网技术白皮书.pdf', size: '2.3MB' },
                { type: 'document', name: '移动云平台操作指南.pdf', size: '1.8MB' }
            ]
        };
    }

    if (message.includes('故障') || message.includes('问题') || message.includes('错误')) {
        return {
            content: `我来帮您分析故障问题。请提供以下信息：\n\n🔍 具体的错误现象\n🔍 发生时间和频率\n🔍 相关的系统日志\n🔍 当前的网络配置\n\n我可以基于这些信息为您提供详细的故障诊断和解决方案。`,
            capabilities: ['故障诊断', '问题分析'],
            attachments: []
        };
    }

    if (message.includes('配置') || message.includes('设置') || message.includes('参数')) {
        return {
            content: `关于配置问题，我可以为您提供：\n\n⚙️ 标准配置模板\n⚙️ 参数优化建议\n⚙️ 配置验证方法\n⚙️ 常见配置错误排查\n\n请告诉我您需要配置的具体设备或系统类型。`,
            capabilities: ['配置指导', '参数优化'],
            attachments: [
                { type: 'config', name: '标准配置模板.json', size: '156KB' }
            ]
        };
    }

    if (message.includes('性能') || message.includes('优化') || message.includes('速度')) {
        return {
            content: `性能优化是我的专长！我可以帮您：\n\n📊 分析当前性能指标\n📊 识别性能瓶颈\n📊 提供优化建议\n📊 制定优化方案\n\n请分享您的性能监控数据，我来为您做详细分析。`,
            capabilities: ['性能分析', '优化建议'],
            attachments: []
        };
    }

    if (message.includes('代码') || message.includes('脚本') || message.includes('编程')) {
        return {
            content: `我可以帮您生成代码！支持的功能包括：\n\n💻 API调用示例\n💻 配置脚本生成\n💻 自动化脚本\n💻 数据处理代码\n\n请告诉我您需要什么类型的代码，我来为您生成。`,
            capabilities: ['代码生成', '脚本编写'],
            attachments: [
                { type: 'code', name: 'api_example.py', size: '2KB' }
            ]
        };
    }

    // 默认回复
    const defaultReplies = [
        `您好！我是${bot.name}，很高兴为您服务。我可以帮您解答技术问题、查找文档、分析数据等。请告诉我您需要什么帮助？`,
        `我理解您的问题。基于我的分析，建议您可以从以下几个方面入手：\n\n1. 检查系统配置\n2. 查看相关文档\n3. 分析日志信息\n\n需要我详细解释某个方面吗？`,
        `这是一个很好的问题！让我为您提供一些专业建议和相关资源。如果您需要更详细的信息，我可以为您查找相关文档或生成具体的解决方案。`
    ];

    return {
        content: defaultReplies[Math.floor(Math.random() * defaultReplies.length)],
        capabilities: bot.capabilities,
        attachments: []
    };
}

// 显示机器人正在输入
function showBotTyping(bot) {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'botTyping';
    typingIndicator.innerHTML = `
        <div class="message-item received">
            <div class="message-avatar">
                <span class="avatar-text">${bot.avatar}</span>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">${bot.name}</span>
                    <span class="message-time">正在输入...</span>
                </div>
                <div class="message-text">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
}

// 隐藏机器人正在输入
function hideBotTyping() {
    const typingIndicator = document.getElementById('botTyping');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 获取附件图标
function getAttachmentIcon(type) {
    const icons = {
        'document': '📄',
        'config': '⚙️',
        'code': '💻',
        'image': '🖼️',
        'video': '🎥',
        'audio': '🎵'
    };
    return icons[type] || '📎';
}

// 下载AI附件
function downloadAIAttachment(fileName, fileType) {
    commonUtils.showToast(`正在下载 ${fileName}...`, 'info');

    // 模拟下载过程
    setTimeout(() => {
        commonUtils.showToast(`${fileName} 下载完成`, 'success');
    }, 2000);
}

// 添加@机器人输入提示
function addBotMentionSuggestion() {
    const messageInput = document.getElementById('messageInput');
    const currentValue = messageInput.value;

    if (currentValue.includes('@') && currentChatInfo.type === 'group') {
        // 显示机器人提示
        showBotSuggestions();
    }
}

// 显示机器人建议
function showBotSuggestions() {
    const suggestions = [
        { name: '移动云智能助手', trigger: '@移动云智能助手' },
        { name: '5G专网助手', trigger: '@5G专网助手' },
        { name: 'AI助手', trigger: '@AI助手' }
    ];

    // 这里可以实现一个下拉建议框
    console.log('显示机器人建议:', suggestions);
}

// 创建聊天菜单模态框
function createChatMenuModal() {
    const modal = document.createElement('div');
    modal.id = 'chatMenuModal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="modal-content chat-menu-content">
            <div class="modal-header">
                <h3>聊天菜单</h3>
                <button class="close-btn" onclick="closeChatMenu()">&times;</button>
            </div>
            <div class="modal-body">
                <!-- 内容将由updateChatMenuContent动态生成 -->
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 立即显示
    setTimeout(() => {
        showChatMenu();
    }, 100);
}

// 获取群成员数量
function getGroupMemberCount() {
    // 根据不同群组返回不同的成员数量
    const memberCounts = {
        'group_1': 156,
        'group_2': 89,
        'group_3': 234,
        'default': 128
    };

    return memberCounts[currentChatId] || memberCounts.default;
}

// 显示群成员列表
function showGroupMembers() {
    closeChatMenu();

    const members = [
        { name: '张工程师', role: '群主', status: 'online', avatar: '👨‍💼' },
        { name: '李技术', role: '管理员', status: 'online', avatar: '👩‍💻' },
        { name: '王专家', role: '成员', status: 'away', avatar: '👨‍🔬' },
        { name: '移动云智能助手', role: 'AI助手', status: 'online', avatar: '🤖' },
        { name: '陈工', role: '成员', status: 'offline', avatar: '👨‍🔧' }
    ];

    let memberList = '群成员列表：\n\n';
    members.forEach(member => {
        const statusIcon = member.status === 'online' ? '🟢' : member.status === 'away' ? '🟡' : '⚫';
        memberList += `${member.avatar} ${member.name} (${member.role}) ${statusIcon}\n`;
    });

    commonUtils.showToast(memberList, 'info');
}

// 显示群聊信息
function showGroupInfo() {
    closeChatMenu();

    const groupInfo = `
群聊信息：
📝 群名称：${currentChatInfo.name}
👥 成员数量：${getGroupMemberCount()}人
📅 创建时间：2024年1月15日
👨‍💼 群主：张工程师
📋 群描述：华东区5G专网技术交流与支持
🔔 消息免打扰：关闭
    `.trim();

    commonUtils.showToast(groupInfo, 'info');
}

// 显示群文件
function showGroupFiles() {
    closeChatMenu();

    const files = [
        '📄 5G专网技术白皮书.pdf (2.3MB)',
        '📊 网络性能分析报告.xlsx (1.8MB)',
        '🎥 配置操作演示视频.mp4 (15.6MB)',
        '📝 故障排查手册.docx (856KB)',
        '📋 最佳实践指南.pdf (1.2MB)'
    ];

    let fileList = '群文件列表：\n\n';
    files.forEach(file => {
        fileList += `${file}\n`;
    });

    commonUtils.showToast(fileList, 'info');
}

// 显示AI能力介绍
function showAICapabilities() {
    closeChatMenu();

    const capabilities = `
${currentChatInfo.name} 能力介绍：

🧠 核心能力：
• 技术问答和故障诊断
• 文档检索和内容解析
• 代码生成和配置脚本
• 性能分析和优化建议

📚 知识领域：
• 5G专网技术
• 移动云平台
• 网络配置与优化
• 故障排查与解决

🔧 实用功能：
• 智能文档推荐
• 实时技术支持
• 自动化脚本生成
• 最佳实践建议
    `.trim();

    commonUtils.showToast(capabilities, 'info');
}

// 搜索聊天记录
function searchInChat() {
    closeChatMenu();

    const keyword = prompt('请输入搜索关键词：');
    if (keyword && keyword.trim()) {
        commonUtils.showToast(`正在搜索包含"${keyword}"的聊天记录...`, 'info');

        setTimeout(() => {
            commonUtils.showToast(`找到3条相关记录，关键词："${keyword}"`, 'success');
        }, 1000);
    }
}

// 清空聊天记录
function clearChatHistory() {
    closeChatMenu();

    if (confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
        commonUtils.showToast('正在清空聊天记录...', 'info');

        setTimeout(() => {
            // 清空消息容器
            const messagesContainer = document.querySelector('.chat-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '<div class="empty-chat">聊天记录已清空</div>';
            }

            commonUtils.showToast('聊天记录已清空', 'success');
        }, 1000);
    }
}

// 其他菜单功能的占位函数
function showGroupNotifications() {
    closeChatMenu();
    commonUtils.showToast('群消息通知设置功能开发中...', 'info');
}

function showGroupSettings() {
    closeChatMenu();
    commonUtils.showToast('群聊设置功能开发中...', 'info');
}

function showAIHistory() {
    closeChatMenu();
    commonUtils.showToast('AI对话历史功能开发中...', 'info');
}

function resetAIContext() {
    closeChatMenu();
    if (confirm('确定要重置AI对话上下文吗？')) {
        commonUtils.showToast('AI对话上下文已重置', 'success');
    }
}

function showUserProfile() {
    closeChatMenu();
    commonUtils.showToast('用户资料功能开发中...', 'info');
}

function showSharedFiles() {
    closeChatMenu();
    commonUtils.showToast('共享文件功能开发中...', 'info');
}

// 导航函数
function navigateTo(url) {
    window.location.href = url;
}

// 添加点击背景关闭模态框的功能
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        e.target.classList.remove('show');
    }
});
