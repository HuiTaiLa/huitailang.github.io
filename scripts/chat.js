// 聊天页面JavaScript功能

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
        },
        formatTime: function(timestamp, format) {
            const date = new Date(timestamp);
            if (format === 'HH:mm') {
                return date.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return date.toLocaleString('zh-CN');
        },
        mockApiRequest: function(url, options) {
            console.log(`[API] ${url}`, options);
            return Promise.resolve({
                success: true,
                data: []
            });
        },
        callDeepSeekAPI: function(userMessage, conversationHistory) {
            console.warn('DeepSeek API不可用，返回模拟响应');
            return Promise.resolve({
                success: false,
                error: 'API服务不可用',
                fallbackMessage: '抱歉，AI助手暂时无法响应，请稍后再试。'
            });
        },
        AIConversationManager: {
            conversations: new Map(),
            getHistory: function(chatId) {
                return this.conversations.get(chatId) || [];
            },
            addMessage: function(chatId, role, content) {
                if (!this.conversations.has(chatId)) {
                    this.conversations.set(chatId, []);
                }
                const history = this.conversations.get(chatId);
                history.push({ role, content });
                if (history.length > 20) {
                    history.splice(0, history.length - 20);
                }
                this.conversations.set(chatId, history);
            },
            clearHistory: function(chatId) {
                this.conversations.delete(chatId);
            }
        }
    };
}

let isTyping = false;
let typingTimer = null;
let messageHistory = [];
let currentChatId = 'group-001';
let currentChatInfo = {
    name: '华东区5G专网交流群',
    onlineCount: 10,
    type: 'group'
};

// 将currentChatInfo暴露到全局作用域，供HTML中的JavaScript使用
window.currentChatInfo = currentChatInfo;

// 流式传输状态管理
let currentStreamingState = {
    isStreaming: false,
    messageId: null,
    userMessage: '',
    botId: null,
    abortController: null
};

// 页面可见性处理的防抖定时器
let visibilityChangeTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    initChatFromURL();
    initChatInterface();
    initMessageInput();
    initToolbar();
    loadChatHistory();
    setupAutoScroll();
    setupPageVisibilityHandler();
});

// 设置页面可见性处理
function setupPageVisibilityHandler() {
    document.addEventListener('visibilitychange', function() {
        // 清除之前的定时器
        if (visibilityChangeTimeout) {
            clearTimeout(visibilityChangeTimeout);
        }

        if (document.visibilityState === 'visible') {
            // 页面重新可见时，延迟检查以避免快速切换
            visibilityChangeTimeout = setTimeout(() => {
                handlePageVisible();
            }, 200);
        } else {
            // 页面隐藏时，立即中断流式传输
            handlePageHidden();
        }
    });
}

// 页面重新可见时的处理
function handlePageVisible() {
    console.log('页面重新可见，检查流式传输状态');
    console.log('当前流式传输状态:', currentStreamingState);

    // 确保当前页面是AI聊天页面
    if (currentChatInfo.type !== 'ai_bot') {
        console.log('当前不是AI聊天页面，跳过流式传输恢复');
        return;
    }

    // 检查是否有正在进行的流式传输
    if (currentStreamingState.isStreaming && currentStreamingState.messageId) {
        console.log('检测到中断的流式传输，尝试恢复');
        resumeStreamingIfNeeded();
    } else {
        // 检查聊天历史中是否有未完成的流式消息
        checkIncompleteStreamingMessages();
    }
}

// 页面隐藏时的处理
function handlePageHidden() {
    console.log('页面隐藏，中断流式传输');

    // 中断当前的流式传输
    if (currentStreamingState.abortController) {
        currentStreamingState.abortController.abort();
        console.log('已中断流式传输');

        // 清除已中断的AbortController，但保持其他状态用于恢复
        currentStreamingState.abortController = null;
    }
}

// 恢复流式传输（如果需要）
function resumeStreamingIfNeeded() {
    if (!currentStreamingState.isStreaming || !currentStreamingState.messageId) {
        return;
    }

    console.log('尝试恢复流式传输:', currentStreamingState);

    // 创建新的AbortController用于恢复的流式传输
    currentStreamingState.abortController = new AbortController();

    // 重新开始流式传输
    handleAIBotReply(currentStreamingState.userMessage, currentStreamingState.botId, currentStreamingState.messageId);
}

// 检查未完成的流式消息
function checkIncompleteStreamingMessages() {
    // 检查消息历史中是否有标记为正在流式传输的消息
    const incompleteMessages = messageHistory.filter(msg => msg.isStreaming === true);

    if (incompleteMessages.length > 0) {
        console.log('发现未完成的流式消息:', incompleteMessages);

        incompleteMessages.forEach(msg => {
            // 尝试恢复这些消息的流式传输
            if (msg.isAI && msg.type === 'ai_reply') {
                console.log('尝试恢复消息:', msg.id);

                // 查找对应的用户消息
                const userMessageIndex = messageHistory.findIndex(m => m.id === msg.id) - 1;
                if (userMessageIndex >= 0) {
                    const userMessage = messageHistory[userMessageIndex];
                    if (userMessage && !userMessage.isAI) {
                        // 重新开始流式传输
                        currentStreamingState.isStreaming = true;
                        currentStreamingState.messageId = msg.id;
                        currentStreamingState.userMessage = userMessage.content;
                        currentStreamingState.botId = currentChatId;
                        currentStreamingState.abortController = new AbortController();

                        handleAIBotReply(userMessage.content, currentChatId, msg.id);
                    }
                }
            }
        });
    }
}

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

        currentChatInfo.onlineCount = Math.floor(Math.random() * 6) + 8; // 随机在线人数 8-13人

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

        console.log('🤖 AI聊天初始化:');
        console.log('  aiBotId:', aiBotId);
        console.log('  currentChatId:', currentChatId);
        console.log('  chatName:', chatName);

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

    // 同步更新全局变量
    window.currentChatInfo = currentChatInfo;

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
        safeCommonUtils().showToast('请输入消息内容', 'error');
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
    } else {
        // 其他类型聊天才使用模拟AI回复
        setTimeout(() => {
            simulateAIResponse(message);
        }, 2000);
    }

    // 发送到服务器
    sendMessageToServer(messageData);

    // 滚动到底部
    scrollToBottom();
}

// 添加消息到聊天界面
function addMessageToChat(messageData) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageElement = createMessageElement(messageData);

    // 添加消息ID用于后续更新（支持流式输出）
    if (messageData.id) {
        messageElement.setAttribute('data-message-id', messageData.id);
    }

    // 移除正在输入指示器
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }

    chatMessages.appendChild(messageElement);

    // 添加消息到历史记录
    messageHistory.push(messageData);

    // 保存聊天历史到本地存储
    saveChatHistory();

    // 更新聊天列表中的最新消息
    updateChatListLastMessage(messageData);

    // 添加动画效果
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';

    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

// 更新聊天列表中的最新消息
function updateChatListLastMessage(messageData) {
    try {
        // 获取当前聊天的信息
        const chatId = currentChatId;
        const chatType = currentChatInfo.type;
        const chatName = currentChatInfo.name;

        // 格式化消息内容用于显示
        let displayContent = '';
        if (messageData.isOwn) {
            // 用户发送的消息
            if (messageData.type === 'text') {
                displayContent = messageData.content;
            } else if (messageData.type === 'image') {
                displayContent = '[图片]';
            } else if (messageData.type === 'file') {
                displayContent = '[文件]';
            } else {
                displayContent = messageData.content || '发送了一条消息';
            }
        } else {
            // 接收的消息
            if (messageData.type === 'ai_reply' || messageData.isAI) {
                displayContent = messageData.content || 'AI回复了一条消息';
            } else if (messageData.type === 'system') {
                displayContent = messageData.content;
            } else {
                const senderName = messageData.sender?.name || '对方';
                displayContent = `${senderName}: ${messageData.content || '发送了一条消息'}`;
            }
        }

        // 限制显示长度
        if (displayContent.length > 30) {
            displayContent = displayContent.substring(0, 30) + '...';
        }

        // 构建聊天列表项数据
        const chatListItem = {
            id: chatId,
            type: chatType,
            name: chatName,
            lastMessage: displayContent,
            timestamp: messageData.timestamp,
            isOwn: messageData.isOwn
        };

        // 存储到localStorage，供聊天列表页面使用
        const chatListData = JSON.parse(localStorage.getItem('chatListData') || '[]');

        // 查找现有项目或添加新项目
        const existingIndex = chatListData.findIndex(item => item.id === chatId);
        if (existingIndex >= 0) {
            // 更新现有项目
            chatListData[existingIndex] = { ...chatListData[existingIndex], ...chatListItem };
        } else {
            // 添加新项目
            chatListData.unshift(chatListItem);
        }

        // 保存更新后的数据
        localStorage.setItem('chatListData', JSON.stringify(chatListData));

        // 更新时间戳，用于检测变化
        localStorage.setItem('chatListCurrentUpdate', Date.now().toString());

        // 如果聊天列表页面在其他标签页中打开，通知更新
        if (typeof window.postMessage === 'function') {
            window.postMessage({
                type: 'chatListUpdate',
                data: chatListItem
            }, '*');
        }

        console.log('聊天列表已更新:', chatListItem);

    } catch (error) {
        console.error('更新聊天列表失败:', error);
    }
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
                <span class="message-time">${safeCommonUtils().formatTime(messageData.timestamp, 'HH:mm')}</span>
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
    // 安全检查sender属性
    const sender = messageData.sender || {
        name: '用户',
        avatar: 'images/default-avatar.png',
        role: '成员'
    };

    const avatarHTML = messageData.isOwn ? '' : `
        <div class="message-avatar">
            <img src="${sender.avatar}" alt="${sender.name}">
        </div>
    `;

    const bubbleClass = messageData.isOwn ? 'own-bubble' : '';
    const headerHTML = messageData.isOwn ? `
        <span class="message-time">${safeCommonUtils().formatTime(messageData.timestamp, 'HH:mm')}</span>
    ` : `
        <span class="sender-name">${sender.name}</span>
        <span class="sender-role">${sender.role || '成员'}</span>
        <span class="message-time">${safeCommonUtils().formatTime(messageData.timestamp, 'HH:mm')}</span>
    `;

    const contentHTML = getMessageContentHTML(messageData);

    const ownAvatarHTML = messageData.isOwn ? `
        <div class="message-avatar">
            <img src="${sender.avatar}" alt="${sender.name}">
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
    // 安全获取AI名称
    const aiName = messageData.sender?.name || messageData.aiName || 'AI智能助手';

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

    // API使用情况显示（仅在开发模式下显示）
    const apiUsageHTML = messageData.apiUsage && window.location.hostname === 'localhost' ? `
        <div class="ai-api-usage" style="font-size: 11px; color: #999; margin-top: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 4px;">
            Token使用: ${messageData.apiUsage.prompt_tokens}+${messageData.apiUsage.completion_tokens}=${messageData.apiUsage.total_tokens}
        </div>
    ` : '';

    // 错误状态样式
    const errorClass = messageData.isError ? ' ai-error' : '';
    const errorIcon = messageData.isError ? '⚠️' : '🤖';

    return `
        <div class="message-avatar">
            <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${messageData.isError ? '#dc3545' : '#667eea'} 0%, ${messageData.isError ? '#c82333' : '#764ba2'} 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: white;
            ">${errorIcon}</div>
        </div>
        <div class="message-bubble ai-bubble${errorClass}">
            <div class="message-header">
                <span class="sender-name">${aiName}</span>
                <span class="ai-badge">AI</span>
                <span class="message-time">${safeCommonUtils().formatTime(messageData.timestamp, 'HH:mm')}</span>
                ${messageData.isError ? '<span class="error-badge" style="background: #dc3545; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">错误</span>' : ''}
            </div>
            <div class="message-text" style="${messageData.isError ? 'color: #dc3545;' : ''}">${messageData.isStreaming ? '' : formatAIContent(messageData.content)}</div>
            ${capabilitiesHTML}
            ${attachmentsHTML}
            ${messageData.recommendations ? createRecommendationsHTML(messageData.recommendations) : ''}
            ${apiUsageHTML}
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
    safeCommonUtils().mockApiRequest('/api/chat/typing', {
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
    safeCommonUtils().mockApiRequest('/api/chat/typing', {
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
    try {
        // 从localStorage加载聊天历史
        const storageKey = `chatHistory_${currentChatId}`;
        console.log('📚 加载聊天历史:');
        console.log('  currentChatId:', currentChatId);
        console.log('  storageKey:', storageKey);

        const savedHistory = localStorage.getItem(storageKey);
        console.log('  savedHistory存在:', savedHistory !== null);
        console.log('  savedHistory长度:', savedHistory ? savedHistory.length : 0);

        if (savedHistory) {
            messageHistory = JSON.parse(savedHistory);
            console.log(`✅ 加载聊天历史: ${messageHistory.length} 条消息`);

            // 如果有历史消息，渲染历史消息而不是生成默认内容
            if (messageHistory.length > 0) {
                renderChatHistory();
                return;
            }
        }
    } catch (error) {
        console.error('加载聊天历史失败:', error);
        messageHistory = [];
    }

    // 如果没有历史消息，生成初始聊天内容
    if (messageHistory.length === 0) {
        console.log('🔍 loadChatHistory - 准备生成初始内容:');
        console.log('  currentChatInfo.type:', currentChatInfo.type);
        console.log('  currentChatId:', currentChatId);
        console.log('  currentChatInfo:', currentChatInfo);

        if (currentChatInfo.type !== 'ai_bot') {
            // 非AI聊天使用原有的生成方式
            console.log('📝 生成非AI聊天内容');
            generateChatContent();
        } else {
            console.log('🤖 AI聊天保持空白状态');
        }
        // AI聊天不自动创建欢迎消息，保持空白
    }

    // 模拟API请求（保留原有逻辑）
    safeCommonUtils().mockApiRequest(`/api/chat/${currentChatId}/history`)
        .then(response => {
            if (response.success) {
                const serverHistory = response.data.messages || [];
                // 如果服务器有更多消息，可以合并
                console.log('服务器聊天历史:', serverHistory);
            }
        });
}

// 渲染聊天历史
function renderChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // 清空现有内容
    chatMessages.innerHTML = '';

    // 渲染每条历史消息
    messageHistory.forEach(messageData => {
        const messageElement = createMessageElement(messageData);

        // 添加消息ID用于后续更新（支持流式输出恢复）
        if (messageData.id) {
            messageElement.setAttribute('data-message-id', messageData.id);
        }

        chatMessages.appendChild(messageElement);
    });

    // 滚动到底部
    scrollToBottom();

    // 检查是否有未完成的流式消息需要恢复
    setTimeout(() => {
        checkIncompleteStreamingMessages();
    }, 100);
}

// 保存聊天历史到本地存储
function saveChatHistory() {
    try {
        const storageKey = `chatHistory_${currentChatId}`;
        localStorage.setItem(storageKey, JSON.stringify(messageHistory));
        console.log(`保存聊天历史: ${messageHistory.length} 条消息`);
    } catch (error) {
        console.error('保存聊天历史失败:', error);
    }
}

// 创建AI欢迎消息
function createAIWelcomeMessage() {
    const welcomeMessage = {
        id: Date.now(),
        type: 'ai_reply',
        content: `您好！我是移动云智能助手，很高兴为您服务！🎉

我可以帮助您解答关于以下方面的问题：
• 5G网络技术与优化
• 云计算与边缘计算
• 网络部署与运维
• 技术方案与最佳实践

请随时向我提问，我会尽力为您提供专业的技术支持！💪`,
        recommendations: [
            { icon: '📋', title: '5G网络优化指南', url: '#' },
            { icon: '🔧', title: '故障排除手册', url: '#' },
            { icon: '📖', title: '最佳实践文档', url: '#' }
        ],
        sender: {
            name: '移动云智能助手',
            avatar: '🤖',
            role: 'AI助手'
        },
        timestamp: Date.now(),
        isOwn: false,
        isAI: true
    };

    // 添加到消息历史并渲染
    messageHistory.push(welcomeMessage);
    saveChatHistory();

    // 渲染消息
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        const messageElement = createMessageElement(welcomeMessage);
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
}

// 根据聊天类型生成聊天内容
function generateChatContent() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    console.log('🎨 generateChatContent被调用:');
    console.log('  currentChatInfo.type:', currentChatInfo.type);
    console.log('  currentChatId:', currentChatId);
    console.log('  currentChatInfo:', currentChatInfo);

    let content = '';

    if (currentChatInfo.type === 'group') {
        // 群聊内容
        console.log('📝 生成群聊内容');
        content = generateGroupChatContent();
    } else if (currentChatInfo.type === 'contact') {
        // 私聊内容
        console.log('📝 生成私聊内容');
        content = generateContactChatContent();
    } else if (currentChatInfo.type === 'ai_bot') {
        // AI助手内容
        console.log('📝 生成AI助手内容');
        content = generateAIChatContent();
    } else if (currentChatInfo.type === 'support') {
        // 客服内容
        console.log('📝 生成客服内容');
        content = generateSupportChatContent();
    }

    console.log('📝 设置chatMessages.innerHTML，内容长度:', content.length);
    chatMessages.innerHTML = content;
}

// 发送消息到服务器
function sendMessageToServer(messageData) {
    safeCommonUtils().mockApiRequest('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({
            chatId: currentChatId,
            message: messageData
        })
    }).then(response => {
        if (response.success) {
            console.log('消息发送成功');
        } else {
            safeCommonUtils().showToast('消息发送失败', 'error');
        }
    });
}

// 模拟AI回复
function simulateAIResponse(userMessage) {
    // 只在非AI聊天中模拟AI回复
    if (currentChatInfo.type === 'ai_bot') {
        return; // AI聊天使用handleAIBotReply，不使用模拟回复
    }

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
            content: '您好！我是移动云智能助手，很高兴为您服务！如果您有关于5G网络、云计算、边缘计算或其他相关技术的问题，欢迎随时向我咨询。无论是技术细节、应用场景还是最佳实践，我都会尽力为您提供专业、清晰的解答！',
            recommendations: [
                { icon: '📋', title: '5G网络优化指南', url: '#' },
                { icon: '🔧', title: '故障排除手册', url: '#' },
                { icon: '📖', title: '最佳实践文档', url: '#' }
            ]
        },
        {
            content: '根据您的问题，我为您整理了以下相关资源和建议。这些内容涵盖了当前最新的技术标准和实践经验，希望能帮助您更好地理解和解决技术问题。',
            recommendations: [
                { icon: '🎯', title: '案例分析报告', url: '#' },
                { icon: '📊', title: '技术规范文档', url: '#' },
                { icon: '🔍', title: '问题诊断工具', url: '#' }
            ]
        },
        {
            content: '感谢您的分享！您提到的经验对其他同事很有帮助。我已经将相关内容添加到知识库中，这样可以帮助更多的同事快速解决类似问题。',
            recommendations: [
                { icon: '💡', title: '经验分享库', url: '#' },
                { icon: '🤝', title: '团队协作指南', url: '#' }
            ]
        },
        {
            content: '基于您的描述，我建议从以下几个方面来分析和解决这个问题。每个方面都有对应的技术文档和实施指南，您可以根据实际情况选择合适的方案。',
            recommendations: [
                { icon: '⚙️', title: '配置优化指南', url: '#' },
                { icon: '🛠️', title: '运维工具集', url: '#' },
                { icon: '📈', title: '性能监控方案', url: '#' }
            ]
        }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
        id: Date.now(),
        type: 'ai_reply',
        content: randomResponse.content,
        recommendations: randomResponse.recommendations,
        timestamp: Date.now(),
        isOwn: false,
        isAI: true
    };
}

// 格式化AI内容（支持Markdown等格式）
function formatAIContent(content) {
    if (!content) return '';

    // 简单的Markdown格式化
    let formatted = content
        // 处理换行
        .replace(/\n/g, '<br>')
        // 处理粗体
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // 处理斜体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 处理代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 处理行内代码
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // 处理列表项
        .replace(/^• (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>');

    // 包装列表项
    if (formatted.includes('<li>')) {
        formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }

    return formatted;
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
    safeCommonUtils().showToast('表情功能开发中...', 'info');
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
    safeCommonUtils().showLoading('上传文件中...');
    
    // 模拟文件上传
    setTimeout(() => {
        safeCommonUtils().hideLoading();
        
        const fileMessage = {
            id: Date.now(),
            type: 'file',
            text: '分享了一个文件：',
            fileName: file.name,
            fileSize: safeCommonUtils().formatFileSize(file.size),
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
        
        safeCommonUtils().showToast('文件上传成功', 'success');
    }, 2000);
}

// 图片上传
function uploadImage(file) {
    safeCommonUtils().showLoading('上传图片中...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        safeCommonUtils().hideLoading();
        
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
        
        safeCommonUtils().showToast('图片上传成功', 'success');
    };
    
    reader.readAsDataURL(file);
}

// 下载文件
function downloadFile(fileUrl, fileName) {
    safeCommonUtils().showToast('开始下载文件...', 'info');
    
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
        safeCommonUtils().showToast('推荐内容功能开发中...', 'info');
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
    // 只在群聊中生成随机消息
    if (currentChatInfo.type !== 'group') {
        return;
    }

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

// 处理AI机器人回复（流式输出）
async function handleAIBotReply(userMessage, botId = null, existingMessageId = null) {
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

    try {
        // 获取对话历史
        const conversationHistory = safeCommonUtils().AIConversationManager.getHistory(currentChatId);

        // 添加用户消息到历史
        safeCommonUtils().AIConversationManager.addMessage(currentChatId, 'user', userMessage);

        let streamMessageId;
        let messageElement;
        let contentElement;

        if (existingMessageId) {
            // 恢复现有消息的流式传输
            streamMessageId = existingMessageId;
            messageElement = document.querySelector(`[data-message-id="${streamMessageId}"]`);
            contentElement = messageElement ? messageElement.querySelector('.message-text') : null;

            if (contentElement) {
                // 清空现有内容，准备重新流式输出
                contentElement.innerHTML = '';
                console.log('恢复流式传输，消息ID:', streamMessageId);
            }
        } else {
            // 创建新的流式消息容器
            streamMessageId = Date.now();
            const streamMessageData = {
                id: streamMessageId,
                type: 'ai_reply',
                content: '',
                sender: {
                    name: targetBot.name,
                    avatar: targetBot.avatar,
                    role: 'AI助手'
                },
                timestamp: Date.now(),
                isOwn: false,
                isAI: true,
                isStreaming: true
            };

            // 添加空的流式消息到聊天
            addMessageToChat(streamMessageData);

            // 获取消息元素用于更新内容
            messageElement = document.querySelector(`[data-message-id="${streamMessageId}"]`);
            contentElement = messageElement ? messageElement.querySelector('.message-text') : null;
        }

        hideBotTyping();

        // 更新流式传输状态
        currentStreamingState.isStreaming = true;
        currentStreamingState.messageId = streamMessageId;
        currentStreamingState.userMessage = userMessage;
        currentStreamingState.botId = botId;

        // 只有在没有AbortController时才创建新的（避免覆盖恢复时创建的）
        if (!currentStreamingState.abortController) {
            currentStreamingState.abortController = new AbortController();
        }

        let fullContent = '';

        // 调用流式API
        await safeCommonUtils().callDeepSeekAPIStream(
            userMessage,
            conversationHistory,
            // onChunk: 处理每个文本块
            (chunk, currentFullContent) => {
                fullContent = currentFullContent;
                if (contentElement) {
                    // 使用打字机效果显示文本
                    contentElement.innerHTML = formatAIContent(fullContent) + '<span class="typing-cursor">|</span>';
                    scrollToBottom();
                }
            },
            // onComplete: 流式传输完成
            (finalContent) => {
                fullContent = finalContent;

                // 移除打字机光标
                if (contentElement) {
                    contentElement.innerHTML = formatAIContent(fullContent);
                }

                // 更新消息历史中的内容
                const messageIndex = messageHistory.findIndex(msg => msg.id === streamMessageId);
                if (messageIndex !== -1) {
                    messageHistory[messageIndex].content = fullContent;
                    messageHistory[messageIndex].isStreaming = false;
                    saveChatHistory();
                }

                // 添加AI回复到对话历史（只有新消息才添加）
                if (!existingMessageId) {
                    safeCommonUtils().AIConversationManager.addMessage(currentChatId, 'assistant', fullContent);
                }

                // 清除流式传输状态
                currentStreamingState.isStreaming = false;
                currentStreamingState.messageId = null;
                currentStreamingState.userMessage = '';
                currentStreamingState.botId = null;
                currentStreamingState.abortController = null;

                console.log('AI流式回复完成:', fullContent);
                scrollToBottom();
            },
            // onError: 处理错误
            (error) => {
                console.error('AI流式回复失败:', error);

                // 检查是否是用户主动中断（页面隐藏）
                if (error.name === 'AbortError') {
                    console.log('流式传输被用户中断（页面隐藏）');
                    // 不显示错误消息，保持当前状态用于后续恢复
                    // 但是要清除AbortController，避免重复使用已中断的控制器
                    if (currentStreamingState.abortController) {
                        currentStreamingState.abortController = null;
                    }
                    return;
                }

                // 显示错误消息
                if (contentElement) {
                    contentElement.innerHTML = '<span class="error-text">抱歉，AI助手暂时无法响应，请稍后再试。如需技术支持，请联系人工客服。</span>';
                }

                // 更新消息历史
                const messageIndex = messageHistory.findIndex(msg => msg.id === streamMessageId);
                if (messageIndex !== -1) {
                    messageHistory[messageIndex].content = "抱歉，AI助手暂时无法响应，请稍后再试。如需技术支持，请联系人工客服。";
                    messageHistory[messageIndex].isError = true;
                    messageHistory[messageIndex].isStreaming = false;
                    saveChatHistory();
                }

                // 清除流式传输状态
                currentStreamingState.isStreaming = false;
                currentStreamingState.messageId = null;
                currentStreamingState.userMessage = '';
                currentStreamingState.botId = null;
                currentStreamingState.abortController = null;

                scrollToBottom();
            },
            // abortController: 用于中断流式传输
            currentStreamingState.abortController
        );

    } catch (error) {
        hideBotTyping();
        console.error('AI回复处理失败:', error);

        // 显示错误消息
        const errorMessageData = {
            id: Date.now(),
            type: 'ai_reply',
            content: "抱歉，AI助手暂时无法响应，请稍后再试。如需技术支持，请联系人工客服。",
            sender: {
                name: targetBot.name,
                avatar: targetBot.avatar,
                role: 'AI助手'
            },
            timestamp: Date.now(),
            isOwn: false,
            isAI: true,
            isError: true
        };

        addMessageToChat(errorMessageData);
        scrollToBottom();
    }
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
    safeCommonUtils().showToast(`正在下载 ${fileName}...`, 'info');

    // 模拟下载过程
    setTimeout(() => {
        safeCommonUtils().showToast(`${fileName} 下载完成`, 'success');
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

    safeCommonUtils().showToast(memberList, 'info');
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
📋 群描述：沈阳5G专网技术交流与支持
🔔 消息免打扰：关闭
    `.trim();

    safeCommonUtils().showToast(groupInfo, 'info');
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

    safeCommonUtils().showToast(fileList, 'info');
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

    safeCommonUtils().showToast(capabilities, 'info');
}

// 搜索聊天记录
function searchInChat() {
    closeChatMenu();

    const keyword = prompt('请输入搜索关键词：');
    if (keyword && keyword.trim()) {
        safeCommonUtils().showToast(`正在搜索包含"${keyword}"的聊天记录...`, 'info');

        setTimeout(() => {
            safeCommonUtils().showToast(`找到3条相关记录，关键词："${keyword}"`, 'success');
        }, 1000);
    }
}

// 清空聊天记录
function clearChatHistory() {
    console.log('🚀 clearChatHistory函数被调用');
    closeChatMenu();

    const confirmResult = confirm('确定要清空所有聊天记录吗？此操作不可恢复。');
    console.log('📋 用户确认结果:', confirmResult);

    if (confirmResult) {
        safeCommonUtils().showToast('正在清空聊天记录...', 'info');

        setTimeout(() => {
            try {
                // 调试信息：显示当前状态
                console.log('🔍 清空聊天记录 - 调试信息:');
                console.log('  currentChatId:', currentChatId);
                console.log('  currentChatInfo:', currentChatInfo);
                console.log('  messageHistory长度:', messageHistory.length);

                // 检查localStorage中的所有聊天相关键
                const allChatKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('chatHistory_')) {
                        allChatKeys.push(key);
                    }
                }
                console.log('  localStorage中的聊天历史键:', allChatKeys);

                // 1. 清空内存中的消息历史
                messageHistory = [];
                console.log('✅ 已清空内存中的消息历史');

                // 2. 清空localStorage中的聊天历史
                const storageKey = `chatHistory_${currentChatId}`;
                console.log('  准备删除的存储键:', storageKey);

                // 检查键是否存在
                const existingData = localStorage.getItem(storageKey);
                if (existingData) {
                    console.log('  找到现有数据，长度:', existingData.length);
                    localStorage.removeItem(storageKey);

                    // 验证删除
                    const afterDelete = localStorage.getItem(storageKey);
                    if (afterDelete === null) {
                        console.log('✅ 已成功清空localStorage中的聊天历史:', storageKey);
                    } else {
                        console.log('❌ 删除失败，数据仍然存在');
                    }
                } else {
                    console.log('⚠️ 未找到对应的存储数据:', storageKey);

                    // 如果预期的键不存在，尝试清空所有聊天历史键
                    if (allChatKeys.length > 0) {
                        console.log('  尝试清空所有聊天历史键...');
                        allChatKeys.forEach(key => {
                            localStorage.removeItem(key);
                            console.log('  已删除:', key);
                        });
                    }
                }

                // 3. 更新聊天列表数据中的最新消息显示
                try {
                    const chatListData = JSON.parse(localStorage.getItem('chatListData') || '[]');
                    const existingIndex = chatListData.findIndex(item => item.id === currentChatId);

                    if (existingIndex >= 0) {
                        // 更新现有项目的最新消息为空状态
                        chatListData[existingIndex].lastMessage = '暂无消息';
                        chatListData[existingIndex].timestamp = Date.now();

                        localStorage.setItem('chatListData', JSON.stringify(chatListData));
                        console.log('✅ 已更新聊天列表中的最新消息显示');
                    }

                    // 更新聊天列表时间戳，触发其他页面刷新
                    localStorage.setItem('chatListCurrentUpdate', Date.now().toString());
                } catch (error) {
                    console.error('更新聊天列表数据时出错:', error);
                }

                // 4. 清空AI对话管理器中的历史记录
                try {
                    safeCommonUtils().AIConversationManager.clearHistory(currentChatId);
                    console.log('✅ 已清空AI对话管理器中的历史记录');
                } catch (error) {
                    console.error('清空AI对话历史时出错:', error);
                }

                // 5. 清空流式传输状态
                if (currentStreamingState.isStreaming) {
                    // 如果正在流式传输，先中断
                    if (currentStreamingState.abortController) {
                        currentStreamingState.abortController.abort();
                    }

                    // 重置流式传输状态
                    currentStreamingState.isStreaming = false;
                    currentStreamingState.messageId = null;
                    currentStreamingState.userMessage = '';
                    currentStreamingState.botId = null;
                    currentStreamingState.abortController = null;
                    console.log('已清空流式传输状态');
                }

                // 6. 清空消息容器UI
                const messagesContainer = document.querySelector('.chat-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = '<div class="empty-chat">聊天记录已清空</div>';
                }

                // 7. 清空后保持页面空白，不自动创建AI欢迎消息
                console.log('✅ 清空完成，保持页面空白状态');

                safeCommonUtils().showToast('聊天记录已清空', 'success');
                console.log('聊天记录清空完成');

            } catch (error) {
                console.error('清空聊天记录时发生错误:', error);
                safeCommonUtils().showToast('清空聊天记录时发生错误', 'error');
            }
        }, 1000);
    }
}



// 其他菜单功能的占位函数
function showGroupNotifications() {
    closeChatMenu();
    safeCommonUtils().showToast('群消息通知设置功能开发中...', 'info');
}

function showGroupSettings() {
    closeChatMenu();
    safeCommonUtils().showToast('群聊设置功能开发中...', 'info');
}

function showAIHistory() {
    closeChatMenu();
    safeCommonUtils().showToast('AI对话历史功能开发中...', 'info');
}

function resetAIContext() {
    closeChatMenu();
    if (confirm('确定要重置AI对话上下文吗？')) {
        safeCommonUtils().showToast('AI对话上下文已重置', 'success');
    }
}

function showUserProfile() {
    closeChatMenu();
    safeCommonUtils().showToast('用户资料功能开发中...', 'info');
}

function showSharedFiles() {
    closeChatMenu();
    safeCommonUtils().showToast('共享文件功能开发中...', 'info');
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

// 生成群聊内容
function generateGroupChatContent() {
    return `
        <!-- 系统消息 -->
        <div class="message-item system-message">
            <div class="message-content">
                <span class="system-text">张工 加入了群聊</span>
                <span class="message-time">14:30</span>
            </div>
        </div>

        <!-- 普通消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:32</span>
                </div>
                <div class="message-text">
                    大家好，我刚刚完成了一个5G专网的部署项目，想和大家分享一些经验。这次项目中遇到了一些网络优化的问题，通过调整参数配置成功解决了。
                </div>
            </div>
        </div>

        <!-- 文件消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:33</span>
                </div>
                <div class="message-file">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                        <span class="file-name">5G专网优化参数配置.pdf</span>
                        <span class="file-size">2.1MB</span>
                    </div>
                    <button class="file-download">下载</button>
                </div>
            </div>
        </div>

        <!-- 回复消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user2.png" alt="李经理">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">李经理</span>
                    <span class="sender-role">产品经理</span>
                    <span class="message-time">14:35</span>
                </div>
                <div class="message-text">
                    @张工 太棒了！这个配置文档正是我们需要的，我们华南区也有类似的项目，可以参考一下。
                </div>
            </div>
        </div>

        <!-- 自己的消息 -->
        <div class="message-item own-message">
            <div class="message-bubble own-bubble">
                <div class="message-header">
                    <span class="message-time">14:38</span>
                </div>
                <div class="message-text">
                    谢谢张工的分享！我们西部区最近也在规划5G专网项目，这个文档很有参考价值。
                </div>
            </div>
            <div class="message-avatar">
                <img src="images/my-avatar.png" alt="我">
            </div>
        </div>

        <!-- 图片消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user3.png" alt="王总">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">王总</span>
                    <span class="sender-role">区域总监</span>
                    <span class="message-time">14:40</span>
                </div>
                <div class="message-text">
                    这是我们最新的网络拓扑图，大家可以参考：
                </div>
                <div class="message-image">
                    <img src="images/network-topology.png" alt="网络拓扑图">
                </div>
            </div>
        </div>

        <!-- 正在输入指示器 -->
        <div class="typing-indicator" id="typingIndicator" style="display: none;">
            <div class="typing-avatar">
                <img src="images/user4.png" alt="用户">
            </div>
            <div class="typing-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
}

// 生成私聊内容
function generateContactChatContent() {
    return `
        <!-- 专家消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:32</span>
                </div>
                <div class="message-text">
                    大家好，我刚刚完成了一个5G专网的部署项目，想和大家分享一些经验。这次项目中遇到了一些网络优化的问题，通过调整参数配置成功解决了。
                </div>
            </div>
        </div>

        <!-- 文件分享 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:33</span>
                </div>
                <div class="message-file">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                        <span class="file-name">5G专网优化参数配置.pdf</span>
                        <span class="file-size">2.1MB</span>
                    </div>
                    <button class="file-download">下载</button>
                </div>
            </div>
        </div>

        <!-- 用户回复 -->
        <div class="message-item own-message">
            <div class="message-bubble own-bubble">
                <div class="message-header">
                    <span class="message-time">14:35</span>
                </div>
                <div class="message-text">
                    @张工 太棒了！这个配置文档正是我们需要的，我们华南区也有类似的项目，可以参考一下。
                </div>
            </div>
            <div class="message-avatar">
                <img src="images/my-avatar.png" alt="我">
            </div>
        </div>

        <!-- 专家回复 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:36</span>
                </div>
                <div class="message-text">
                    没问题！如果在实施过程中遇到任何技术问题，随时可以联系我。我这边还有一些实际案例可以分享。
                </div>
            </div>
        </div>

        <!-- 用户询问 -->
        <div class="message-item own-message">
            <div class="message-bubble own-bubble">
                <div class="message-header">
                    <span class="message-time">14:38</span>
                </div>
                <div class="message-text">
                    谢谢！我想了解一下关于网络切片的配置，有什么需要特别注意的地方吗？
                </div>
            </div>
            <div class="message-avatar">
                <img src="images/my-avatar.png" alt="我">
            </div>
        </div>

        <!-- 专家详细回复 -->
        <div class="message-item">
            <div class="message-avatar">
                <img src="images/user1.png" alt="张工">
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">张工</span>
                    <span class="sender-role">技术专家</span>
                    <span class="message-time">14:40</span>
                </div>
                <div class="message-text">
                    网络切片配置确实需要注意几个关键点：1. 切片隔离性要做好；2. QoS参数要根据业务需求精确配置；3. 资源分配要合理。我可以给你发一个详细的配置指南。
                </div>
            </div>
        </div>
    `;
}

// 生成AI助手内容
function generateAIChatContent() {
    return `
        <!-- AI助手欢迎消息 -->
        <div class="message-item ai-message">
            <div class="message-avatar">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                ">🤖</div>
            </div>
            <div class="message-bubble ai-bubble">
                <div class="message-header">
                    <span class="sender-name">移动云智能助手</span>
                    <span class="ai-badge">AI</span>
                    <span class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="message-text">
                    您好！我是移动云智能助手，很高兴为您服务！🎉<br><br>
                    我可以帮助您解答关于以下方面的问题：<br>
                    • 5G网络技术与优化<br>
                    • 云计算与边缘计算<br>
                    • 网络部署与运维<br>
                    • 技术方案与最佳实践<br><br>
                    请随时向我提问，我会尽力为您提供专业的技术支持！💪
                </div>
                <div class="ai-recommendations">
                    <div class="recommendation-item">
                        <span class="rec-icon">📋</span>
                        <span class="rec-title">5G网络优化指南</span>
                    </div>
                    <div class="recommendation-item">
                        <span class="rec-icon">🔧</span>
                        <span class="rec-title">故障排除手册</span>
                    </div>
                    <div class="recommendation-item">
                        <span class="rec-icon">📖</span>
                        <span class="rec-title">最佳实践文档</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 生成客服内容
function generateSupportChatContent() {
    return `
        <!-- 客服欢迎消息 -->
        <div class="message-item system-message">
            <div class="message-content">
                <span class="system-text">客服小助手为您服务</span>
                <span class="message-time">14:30</span>
            </div>
        </div>

        <!-- 客服消息 -->
        <div class="message-item">
            <div class="message-avatar">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                ">🛠️</div>
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">技术支持</span>
                    <span class="sender-role">客服专员</span>
                    <span class="message-time">14:32</span>
                </div>
                <div class="message-text">
                    您好！我是技术支持客服，很高兴为您服务。请问有什么技术问题需要帮助吗？
                </div>
            </div>
        </div>

        <!-- 用户询问 -->
        <div class="message-item own-message">
            <div class="message-bubble own-bubble">
                <div class="message-header">
                    <span class="message-time">14:35</span>
                </div>
                <div class="message-text">
                    你好，我在使用移动云平台时遇到了一些问题，API调用总是超时
                </div>
            </div>
            <div class="message-avatar">
                <img src="images/my-avatar.png" alt="我">
            </div>
        </div>

        <!-- 客服回复 -->
        <div class="message-item">
            <div class="message-avatar">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                ">🛠️</div>
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">技术支持</span>
                    <span class="sender-role">客服专员</span>
                    <span class="message-time">14:36</span>
                </div>
                <div class="message-text">
                    我来帮您排查这个问题。API调用超时可能有几个原因：<br>
                    1. 网络连接问题<br>
                    2. API服务器负载过高<br>
                    3. 请求参数配置不当<br><br>
                    请问您使用的是哪个API接口？我可以帮您详细检查。
                </div>
            </div>
        </div>

        <!-- 用户提供信息 -->
        <div class="message-item own-message">
            <div class="message-bubble own-bubble">
                <div class="message-header">
                    <span class="message-time">14:38</span>
                </div>
                <div class="message-text">
                    是云服务器管理的API，具体是创建实例的接口
                </div>
            </div>
            <div class="message-avatar">
                <img src="images/my-avatar.png" alt="我">
            </div>
        </div>

        <!-- 客服解决方案 -->
        <div class="message-item">
            <div class="message-avatar">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                ">🛠️</div>
            </div>
            <div class="message-bubble">
                <div class="message-header">
                    <span class="sender-name">技术支持</span>
                    <span class="sender-role">客服专员</span>
                    <span class="message-time">14:40</span>
                </div>
                <div class="message-text">
                    明白了！创建实例API确实可能因为资源分配需要较长时间。建议您：<br>
                    1. 将超时时间设置为60秒以上<br>
                    2. 使用异步调用方式<br>
                    3. 添加重试机制<br><br>
                    我已经为您记录了这个问题，技术团队会进一步优化API响应速度。
                </div>
            </div>
        </div>
    `;
}
