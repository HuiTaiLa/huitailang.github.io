// 调试清空聊天记录问题的脚本
// 在AI聊天页面的浏览器控制台中运行

console.log('🔍 调试清空聊天记录问题');
console.log('=====================================');

// 检查当前页面的URL参数和聊天ID
function checkChatId() {
    console.log('📋 检查聊天ID和URL参数:');
    
    const url = window.location.href;
    console.log('  当前URL:', url);
    
    const urlParams = new URLSearchParams(window.location.search);
    const aiBotId = urlParams.get('ai_bot');
    const groupId = urlParams.get('group_id');
    const contactId = urlParams.get('contact_id');
    const supportId = urlParams.get('support');
    const chatName = urlParams.get('name');
    
    console.log('  URL参数:');
    console.log('    ai_bot:', aiBotId);
    console.log('    group_id:', groupId);
    console.log('    contact_id:', contactId);
    console.log('    support:', supportId);
    console.log('    name:', chatName);
    
    console.log('  全局变量:');
    console.log('    currentChatId:', window.currentChatId);
    console.log('    currentChatInfo:', window.currentChatInfo);
    
    return {
        url,
        urlParams: { aiBotId, groupId, contactId, supportId, chatName },
        currentChatId: window.currentChatId,
        currentChatInfo: window.currentChatInfo
    };
}

// 检查localStorage中的所有聊天相关数据
function checkAllChatStorage() {
    console.log('🗄️ 检查localStorage中的所有聊天数据:');
    
    const allKeys = [];
    const chatHistoryKeys = [];
    const otherChatKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allKeys.push(key);
        
        if (key.startsWith('chatHistory_')) {
            chatHistoryKeys.push(key);
        } else if (key.includes('chat') || key.includes('Chat')) {
            otherChatKeys.push(key);
        }
    }
    
    console.log('  所有localStorage键:', allKeys);
    console.log('  聊天历史键:', chatHistoryKeys);
    console.log('  其他聊天相关键:', otherChatKeys);
    
    // 详细检查每个聊天历史键
    chatHistoryKeys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            const messages = JSON.parse(data || '[]');
            console.log(`  ${key}:`, messages.length, '条消息');
            
            if (messages.length > 0) {
                console.log('    最新消息:', messages[messages.length - 1]);
            }
        } catch (error) {
            console.log(`  ${key}: 数据格式错误`);
        }
    });
    
    return { allKeys, chatHistoryKeys, otherChatKeys };
}

// 检查预期的存储键名
function checkExpectedStorageKey() {
    console.log('🔑 检查预期的存储键名:');
    
    const chatInfo = checkChatId();
    const expectedKey = `chatHistory_${chatInfo.currentChatId}`;
    
    console.log('  预期的存储键名:', expectedKey);
    
    const actualData = localStorage.getItem(expectedKey);
    console.log('  该键是否存在:', actualData !== null);
    
    if (actualData) {
        try {
            const messages = JSON.parse(actualData);
            console.log('  该键的消息数量:', messages.length);
        } catch (error) {
            console.log('  该键的数据格式错误');
        }
    }
    
    return expectedKey;
}

// 手动测试清空功能
function testClearFunction() {
    console.log('🧪 测试清空功能:');
    
    const beforeState = {
        memoryMessages: window.messageHistory ? window.messageHistory.length : 0,
        storageKeys: checkAllChatStorage().chatHistoryKeys.length
    };
    
    console.log('  清空前状态:');
    console.log('    内存消息数量:', beforeState.memoryMessages);
    console.log('    存储键数量:', beforeState.storageKeys);
    
    // 检查clearChatHistory函数是否存在
    if (typeof window.clearChatHistory === 'function') {
        console.log('  ✅ clearChatHistory函数存在');
        console.log('  ⚠️ 注意：调用此函数会弹出确认对话框');
        return true;
    } else {
        console.log('  ❌ clearChatHistory函数不存在');
        return false;
    }
}

// 手动清空特定键的数据
function manualClearSpecificKey(key) {
    console.log(`🧹 手动清空特定键: ${key}`);
    
    const beforeData = localStorage.getItem(key);
    if (beforeData) {
        localStorage.removeItem(key);
        console.log(`  ✅ 已删除键: ${key}`);
        
        // 验证删除
        const afterData = localStorage.getItem(key);
        if (afterData === null) {
            console.log('  ✅ 删除成功，键不存在');
        } else {
            console.log('  ❌ 删除失败，键仍然存在');
        }
    } else {
        console.log(`  ⚠️ 键不存在: ${key}`);
    }
}

// 清空所有聊天历史数据
function clearAllChatHistory() {
    console.log('🗑️ 清空所有聊天历史数据:');
    
    const { chatHistoryKeys } = checkAllChatStorage();
    
    if (chatHistoryKeys.length === 0) {
        console.log('  没有找到聊天历史数据');
        return;
    }
    
    console.log(`  找到 ${chatHistoryKeys.length} 个聊天历史键，准备清空...`);
    
    chatHistoryKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`  ✅ 已删除: ${key}`);
    });
    
    // 也清空内存中的消息历史
    if (window.messageHistory) {
        window.messageHistory = [];
        console.log('  ✅ 已清空内存中的消息历史');
    }
    
    // 清空DOM
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '<div class="empty-chat">聊天记录已清空</div>';
        console.log('  ✅ 已清空DOM消息容器');
    }
    
    console.log('  ✅ 所有聊天历史数据已清空');
}

// 运行完整的诊断
function runFullDiagnosis() {
    console.log('🔍 运行完整诊断...');
    console.log('=====================================');
    
    const chatInfo = checkChatId();
    const storageInfo = checkAllChatStorage();
    const expectedKey = checkExpectedStorageKey();
    const canTest = testClearFunction();
    
    console.log('=====================================');
    console.log('📊 诊断总结:');
    console.log('  当前聊天ID:', chatInfo.currentChatId);
    console.log('  预期存储键:', expectedKey);
    console.log('  实际存储键数量:', storageInfo.chatHistoryKeys.length);
    console.log('  清空函数可用:', canTest);
    
    if (storageInfo.chatHistoryKeys.length > 0) {
        console.log('  实际存储键列表:', storageInfo.chatHistoryKeys);
        
        // 检查是否有键名不匹配的情况
        const hasExpectedKey = storageInfo.chatHistoryKeys.includes(expectedKey);
        console.log('  预期键是否存在:', hasExpectedKey);
        
        if (!hasExpectedKey && storageInfo.chatHistoryKeys.length > 0) {
            console.log('  ⚠️ 警告：预期键不存在，但有其他聊天历史键');
            console.log('  可能的问题：chatId不匹配或键名格式错误');
        }
    }
    
    console.log('=====================================');
    
    return {
        chatInfo,
        storageInfo,
        expectedKey,
        canTest
    };
}

// 导出调试函数
window.clearDebugIssue = {
    checkChatId,
    checkAllChatStorage,
    checkExpectedStorageKey,
    testClearFunction,
    manualClearSpecificKey,
    clearAllChatHistory,
    runFullDiagnosis
};

// 自动运行诊断
console.log('🚀 自动运行诊断...');
setTimeout(() => {
    runFullDiagnosis();
}, 1000);

console.log('=====================================');
console.log('💡 使用方法:');
console.log('  clearDebugIssue.runFullDiagnosis() - 运行完整诊断');
console.log('  clearDebugIssue.checkChatId() - 检查聊天ID');
console.log('  clearDebugIssue.checkAllChatStorage() - 检查所有存储');
console.log('  clearDebugIssue.clearAllChatHistory() - 强制清空所有聊天历史');
console.log('  clearDebugIssue.manualClearSpecificKey("key") - 清空特定键');
console.log('=====================================');
