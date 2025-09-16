// 清空聊天记录功能调试脚本
// 在浏览器控制台中运行此脚本来测试和调试清空聊天记录功能

console.log('🗑️ 清空聊天记录功能调试工具');
console.log('=====================================');

// 检查当前页面状态
function checkCurrentState() {
    console.log('📊 当前页面状态:');
    
    // 检查聊天ID和类型
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('ai_bot') || urlParams.get('group_id') || urlParams.get('user_id');
    const chatType = urlParams.get('ai_bot') ? 'ai_bot' : (urlParams.get('group_id') ? 'group' : 'private');
    
    console.log('  聊天ID:', chatId);
    console.log('  聊天类型:', chatType);
    console.log('  当前聊天信息:', window.currentChatInfo);
    
    // 检查消息历史
    if (window.messageHistory) {
        console.log('  内存中的消息数量:', window.messageHistory.length);
        if (window.messageHistory.length > 0) {
            console.log('  最新消息:', window.messageHistory[window.messageHistory.length - 1]);
        }
    } else {
        console.log('  ⚠️ messageHistory 不存在');
    }
    
    // 检查流式传输状态
    if (window.currentStreamingState) {
        console.log('  流式传输状态:', window.currentStreamingState);
    } else {
        console.log('  ⚠️ currentStreamingState 不存在');
    }
}

// 检查localStorage中的数据
function checkLocalStorageData() {
    console.log('🗄️ localStorage中的聊天数据:');
    
    let chatHistoryCount = 0;
    let totalMessages = 0;
    const chatHistories = [];
    
    // 检查聊天历史数据
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chatHistory_')) {
            chatHistoryCount++;
            try {
                const messages = JSON.parse(localStorage.getItem(key) || '[]');
                totalMessages += messages.length;
                chatHistories.push({
                    key: key,
                    messageCount: messages.length,
                    lastMessage: messages.length > 0 ? messages[messages.length - 1] : null
                });
                console.log(`  ${key}: ${messages.length} 条消息`);
            } catch (error) {
                console.log(`  ${key}: 数据格式错误`);
            }
        }
    }
    
    console.log(`  总计: ${chatHistoryCount} 个聊天历史，${totalMessages} 条消息`);
    
    // 检查聊天列表数据
    const chatListData = localStorage.getItem('chatListData');
    if (chatListData) {
        try {
            const listData = JSON.parse(chatListData);
            console.log('  聊天列表数据:', listData.length, '个聊天');
            listData.forEach(chat => {
                console.log(`    ${chat.name}: ${chat.lastMessage}`);
            });
        } catch (error) {
            console.log('  聊天列表数据格式错误');
        }
    } else {
        console.log('  没有聊天列表数据');
    }
    
    // 检查更新时间戳
    const currentUpdate = localStorage.getItem('chatListCurrentUpdate');
    const lastUpdate = localStorage.getItem('chatListLastUpdate');
    console.log('  聊天列表更新时间戳:');
    console.log('    当前:', currentUpdate ? new Date(parseInt(currentUpdate)).toLocaleString() : '无');
    console.log('    上次:', lastUpdate ? new Date(parseInt(lastUpdate)).toLocaleString() : '无');
    
    return chatHistories;
}

// 检查DOM中的消息元素
function checkDOMMessages() {
    console.log('🎨 DOM中的消息元素:');
    
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) {
        console.log('  ⚠️ 找不到消息容器');
        return;
    }
    
    const messageElements = messagesContainer.querySelectorAll('.message-item');
    console.log('  消息元素数量:', messageElements.length);
    
    messageElements.forEach((element, index) => {
        const messageId = element.getAttribute('data-message-id');
        const messageType = element.classList.contains('ai-message') ? 'AI' : 
                           element.classList.contains('system-message') ? '系统' : '用户';
        const messageText = element.querySelector('.message-text');
        const content = messageText ? messageText.textContent.substring(0, 50) + '...' : '无内容';
        
        console.log(`    ${index + 1}. ID: ${messageId}, 类型: ${messageType}, 内容: ${content}`);
    });
    
    // 检查是否有空聊天提示
    const emptyChat = messagesContainer.querySelector('.empty-chat');
    if (emptyChat) {
        console.log('  📝 发现空聊天提示:', emptyChat.textContent);
    }
}

// 模拟清空聊天记录
function simulateClearChat() {
    console.log('🧪 模拟清空聊天记录...');
    
    if (typeof window.clearChatHistory === 'function') {
        console.log('  找到clearChatHistory函数，准备调用...');
        // 注意：这会弹出确认对话框
        console.log('  ⚠️ 注意：这将弹出确认对话框');
        return true;
    } else {
        console.log('  ❌ 找不到clearChatHistory函数');
        return false;
    }
}

// 手动清空数据（用于测试）
function manualClearData() {
    console.log('🧹 手动清空聊天数据...');
    
    try {
        // 清空内存中的消息历史
        if (window.messageHistory) {
            window.messageHistory = [];
            console.log('  ✅ 已清空内存中的消息历史');
        }
        
        // 清空localStorage中的聊天历史
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('ai_bot') || urlParams.get('group_id') || urlParams.get('user_id');
        if (chatId) {
            const storageKey = `chatHistory_${chatId}`;
            localStorage.removeItem(storageKey);
            console.log(`  ✅ 已清空localStorage: ${storageKey}`);
        }
        
        // 清空流式传输状态
        if (window.currentStreamingState) {
            if (window.currentStreamingState.abortController) {
                window.currentStreamingState.abortController.abort();
            }
            window.currentStreamingState.isStreaming = false;
            window.currentStreamingState.messageId = null;
            window.currentStreamingState.userMessage = '';
            window.currentStreamingState.botId = null;
            window.currentStreamingState.abortController = null;
            console.log('  ✅ 已清空流式传输状态');
        }
        
        // 清空DOM
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '<div class="empty-chat">聊天记录已清空</div>';
            console.log('  ✅ 已清空DOM消息容器');
        }
        
        console.log('✅ 手动清空完成');
        
    } catch (error) {
        console.error('❌ 手动清空失败:', error);
    }
}

// 运行完整的诊断
function runFullDiagnostic() {
    console.log('🔍 运行完整诊断...');
    console.log('=====================================');
    
    checkCurrentState();
    console.log('');
    checkLocalStorageData();
    console.log('');
    checkDOMMessages();
    
    console.log('=====================================');
    console.log('✅ 诊断完成');
}

// 测试清空前后的对比
function testClearComparison() {
    console.log('📊 清空前后对比测试...');
    
    console.log('📋 清空前状态:');
    const beforeState = {
        memoryMessages: window.messageHistory ? window.messageHistory.length : 0,
        localStorageData: checkLocalStorageData(),
        domMessages: document.querySelectorAll('.chat-messages .message-item').length,
        streamingState: window.currentStreamingState ? { ...window.currentStreamingState } : null
    };
    
    console.log('  内存消息数量:', beforeState.memoryMessages);
    console.log('  DOM消息数量:', beforeState.domMessages);
    console.log('  流式传输状态:', beforeState.streamingState);
    
    return beforeState;
}

// 导出调试函数到全局作用域
window.clearDebug = {
    checkCurrentState,
    checkLocalStorageData,
    checkDOMMessages,
    simulateClearChat,
    manualClearData,
    runFullDiagnostic,
    testClearComparison
};

// 自动运行初始诊断
console.log('🚀 自动运行初始诊断...');
setTimeout(runFullDiagnostic, 1000);

console.log('=====================================');
console.log('💡 使用方法:');
console.log('  clearDebug.runFullDiagnostic() - 运行完整诊断');
console.log('  clearDebug.checkCurrentState() - 检查当前状态');
console.log('  clearDebug.checkLocalStorageData() - 检查存储数据');
console.log('  clearDebug.checkDOMMessages() - 检查DOM消息');
console.log('  clearDebug.simulateClearChat() - 模拟清空操作');
console.log('  clearDebug.manualClearData() - 手动清空数据');
console.log('  clearDebug.testClearComparison() - 清空前后对比');
console.log('=====================================');
