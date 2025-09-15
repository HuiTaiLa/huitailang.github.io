// 登录页面JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    initLoginForm();
    initQuickLogin();
    checkAutoLogin();
});

// 初始化登录表单
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // 表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        if (validateForm(username, password)) {
            performLogin(username, password, rememberMe);
        }
    });

    // 输入框焦点效果
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // 实时验证
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });

    // 回车键快速登录
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}

// 初始化快速登录
function initQuickLogin() {
    // 演示登录按钮已在HTML中定义onclick
    // 访客登录按钮已在HTML中定义onclick
}

// 检查自动登录
function checkAutoLogin() {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
    
    // 检查是否有有效的登录状态
    const loginToken = localStorage.getItem('loginToken');
    if (loginToken) {
        showMessage('检测到已登录状态，正在跳转...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// 表单验证
function validateForm(username, password) {
    let isValid = true;

    // 验证用户名
    if (!username) {
        showFieldError('username', '请输入用户名');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', '用户名至少3个字符');
        isValid = false;
    }

    // 验证密码
    if (!password) {
        showFieldError('password', '请输入密码');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', '密码至少6个字符');
        isValid = false;
    }

    return isValid;
}

// 显示字段错误
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.parentElement;
    
    // 移除现有错误
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加错误样式
    field.style.borderColor = '#dc3545';
    
    // 添加错误消息
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
}

// 清除字段错误
function clearFieldError(field) {
    const formGroup = field.parentElement;
    const errorElement = formGroup.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '#e1e5e9';
}

// 执行登录
function performLogin(username, password, rememberMe) {
    const loginBtn = document.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    // 显示加载状态
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    // 模拟登录API请求
    setTimeout(() => {
        // 模拟登录验证
        const isValidLogin = validateCredentials(username, password);
        
        if (isValidLogin) {
            // 登录成功
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberedPassword');
            }
            
            // 保存登录状态
            localStorage.setItem('loginToken', 'demo_token_' + Date.now());
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                name: getDisplayName(username),
                role: 'user',
                loginTime: new Date().toISOString()
            }));
            
            showMessage('登录成功！正在跳转...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // 登录失败
            showMessage('用户名或密码错误', 'error');
            
            // 恢复按钮状态
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }, 2000);
}

// 验证登录凭据
function validateCredentials(username, password) {
    // 演示用的简单验证逻辑
    const validCredentials = [
        { username: 'admin', password: '123456' },
        { username: 'demo', password: 'demo123' },
        { username: 'test', password: 'test123' },
        { username: 'user', password: 'user123' }
    ];
    
    return validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
}

// 获取显示名称
function getDisplayName(username) {
    const displayNames = {
        'admin': '系统管理员',
        'demo': '演示用户',
        'test': '测试用户',
        'user': '普通用户'
    };
    
    return displayNames[username] || username;
}

// 演示登录
function demoLogin() {
    document.getElementById('username').value = 'demo';
    document.getElementById('password').value = 'demo123';
    document.getElementById('rememberMe').checked = true;
    
    showMessage('已填入演示账号，点击登录按钮继续', 'info');
}

// 访客登录
function guestLogin() {
    showMessage('正在以访客身份登录...', 'info');
    
    // 设置访客登录状态
    localStorage.setItem('loginToken', 'guest_token_' + Date.now());
    localStorage.setItem('currentUser', JSON.stringify({
        username: 'guest',
        name: '访客用户',
        role: 'guest',
        loginTime: new Date().toISOString()
    }));
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// 切换密码显示
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// 显示忘记密码
function showForgotPassword() {
    showMessage('请联系系统管理员重置密码', 'info');
}

// 显示帮助
function showHelp() {
    const helpInfo = `
登录帮助：

1. 演示账号：
   - 用户名：demo，密码：demo123
   - 用户名：admin，密码：123456

2. 如果忘记密码，请联系系统管理员

3. 支持访客模式体验基本功能

4. 建议使用现代浏览器以获得最佳体验
    `;
    
    alert(helpInfo);
}

// 显示联系我们
function showContact() {
    const contactInfo = `
联系我们：

技术支持：400-123-4567
邮箱：support@chinamobile.com
工作时间：周一至周五 9:00-18:00

地址：北京市西城区金融大街28号
中国移动云能力中心
    `;
    
    alert(contactInfo);
}

// 显示隐私政策
function showPrivacy() {
    const privacyInfo = `
隐私政策要点：

1. 我们重视您的隐私保护
2. 登录信息仅用于身份验证
3. 不会收集不必要的个人信息
4. 数据传输采用加密保护
5. 遵守相关法律法规要求

详细政策请访问官方网站查看。
    `;
    
    alert(privacyInfo);
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const toast = document.getElementById('messageToast');
    const icon = toast.querySelector('.message-icon');
    const text = toast.querySelector('.message-text');
    
    // 设置图标
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    icon.textContent = icons[type] || icons.info;
    text.textContent = message;
    
    // 设置样式
    toast.className = `message-toast ${type}`;
    toast.style.display = 'flex';
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时检查登录状态
        checkAutoLogin();
    }
});

// 防止表单自动填充的安全处理
window.addEventListener('load', function() {
    // 延迟清除可能的浏览器自动填充
    setTimeout(() => {
        const inputs = document.querySelectorAll('input[autocomplete="off"]');
        inputs.forEach(input => {
            if (input.value && !localStorage.getItem('rememberedUsername')) {
                input.value = '';
            }
        });
    }, 100);
});
