// AI流式输出恢复功能调试脚本
// 在浏览器控制台中运行此脚本来测试和调试流式输出恢复功能

console.log('🔧 AI流式输出恢复功能调试工具');
console.log('=====================================');

// 检查当前页面是否为AI聊天页面
function checkAIChatPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const aiBotId = urlParams.get('ai_bot');
    
    if (!aiBotId) {
        console.warn('⚠️ 当前页面不是AI聊天页面，请在AI聊天页面运行此脚本');
        return false;
    }
    
    console.log('✅ 当前页面是AI聊天页面，AI Bot ID:', aiBotId);
    return true;
}

// 检查流式传输状态
function checkStreamingState() {
    console.log('📊 当前流式传输状态:');
    console.log('  isStreaming:', window.currentStreamingState?.isStreaming || false);
    console.log('  messageId:', window.currentStreamingState?.messageId || 'null');
    console.log('  userMessage:', window.currentStreamingState?.userMessage || 'null');
    console.log('  botId:', window.currentStreamingState?.botId || 'null');
    console.log('  abortController:', window.currentStreamingState?.abortController ? '存在' : '不存在');
}

// 检查消息历史中的流式消息
function checkStreamingMessages() {
    if (!window.messageHistory) {
        console.warn('⚠️ 消息历史不存在');
        return;
    }
    
    const streamingMessages = window.messageHistory.filter(msg => msg.isStreaming === true);
    console.log('📝 消息历史中的流式消息数量:', streamingMessages.length);
    
    if (streamingMessages.length > 0) {
        console.log('🔍 未完成的流式消息:');
        streamingMessages.forEach((msg, index) => {
            console.log(`  ${index + 1}. ID: ${msg.id}, 内容长度: ${msg.content?.length || 0}, 时间: ${new Date(msg.timestamp).toLocaleTimeString()}`);
        });
    } else {
        console.log('✅ 没有未完成的流式消息');
    }
}

// 检查DOM中的流式消息元素
function checkStreamingElements() {
    const streamingElements = document.querySelectorAll('[data-message-id]');
    console.log('🎨 DOM中的消息元素数量:', streamingElements.length);
    
    let streamingCount = 0;
    streamingElements.forEach(element => {
        const messageId = element.getAttribute('data-message-id');
        const messageText = element.querySelector('.message-text');
        const hasTypingCursor = messageText && messageText.innerHTML.includes('typing-cursor');
        
        if (hasTypingCursor) {
            streamingCount++;
            console.log(`  🔄 正在流式输出的消息 ID: ${messageId}`);
        }
    });
    
    if (streamingCount === 0) {
        console.log('✅ 没有正在流式输出的消息元素');
    }
}

// 模拟页面隐藏和显示
function simulatePageVisibilityChange() {
    console.log('🎭 模拟页面可见性变化...');
    
    // 模拟页面隐藏
    console.log('  📱 模拟页面隐藏');
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
    });
    
    setTimeout(() => {
        // 模拟页面重新可见
        console.log('  👁️ 模拟页面重新可见');
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            writable: true
        });
        document.dispatchEvent(new Event('visibilitychange'));
    }, 1000);
}

// 强制恢复流式传输
function forceResumeStreaming() {
    if (!window.currentStreamingState?.isStreaming) {
        console.warn('⚠️ 当前没有正在进行的流式传输');
        return;
    }
    
    console.log('🔄 强制恢复流式传输...');
    if (window.resumeStreamingIfNeeded) {
        window.resumeStreamingIfNeeded();
    } else {
        console.error('❌ resumeStreamingIfNeeded 函数不存在');
    }
}

// 清理流式传输状态
function clearStreamingState() {
    console.log('🧹 清理流式传输状态...');
    if (window.currentStreamingState) {
        window.currentStreamingState.isStreaming = false;
        window.currentStreamingState.messageId = null;
        window.currentStreamingState.userMessage = '';
        window.currentStreamingState.botId = null;
        if (window.currentStreamingState.abortController) {
            window.currentStreamingState.abortController.abort();
            window.currentStreamingState.abortController = null;
        }
        console.log('✅ 流式传输状态已清理');
    }
}

// 运行完整的诊断
function runFullDiagnostic() {
    console.log('🔍 运行完整诊断...');
    console.log('=====================================');
    
    checkAIChatPage();
    checkStreamingState();
    checkStreamingMessages();
    checkStreamingElements();
    
    console.log('=====================================');
    console.log('✅ 诊断完成');
}

// 导出调试函数到全局作用域
window.streamDebug = {
    checkAIChatPage,
    checkStreamingState,
    checkStreamingMessages,
    checkStreamingElements,
    simulatePageVisibilityChange,
    forceResumeStreaming,
    clearStreamingState,
    runFullDiagnostic
};

// 自动运行初始诊断
if (checkAIChatPage()) {
    console.log('🚀 自动运行初始诊断...');
    setTimeout(runFullDiagnostic, 1000);
}

console.log('=====================================');
console.log('💡 使用方法:');
console.log('  streamDebug.runFullDiagnostic() - 运行完整诊断');
console.log('  streamDebug.checkStreamingState() - 检查流式传输状态');
console.log('  streamDebug.simulatePageVisibilityChange() - 模拟页面切换');
console.log('  streamDebug.forceResumeStreaming() - 强制恢复流式传输');
console.log('  streamDebug.clearStreamingState() - 清理流式传输状态');
console.log('=====================================');
