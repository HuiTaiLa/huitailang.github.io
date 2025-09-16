// 安全的commonUtils包装函数
function safeCommonUtils() {
    if (typeof window.commonUtils !== "undefined") {
        return window.commonUtils;
    }
    return {
        showToast: function(m,t) { console.log(`[${t}] ${m}`); if(t==="error") alert(m); },
        navigateTo: function(u) { window.location.href = u; },
        mockApiRequest: function() { return Promise.resolve({success:true,data:[]}); },
        formatTime: function(ts,fmt) { return new Date(ts).toLocaleString("zh-CN"); }
    };
}
// 个人中心页面JavaScript功能

let userProfile = {
    id: 'user-001',
    name: '张明',
    title: '高级网络工程师',
    department: '技术部',
    email: 'zhangming@example.com',
    phone: '138****8888',
    joinDate: '2020-03-15',
    avatar: 'images/my-avatar.png',
    stats: {
        answers: 156,
        posts: 128,
        followers: 256,
        following: 89
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
    initMenuItems();
    initSettingsModal();
    loadUserProfile();
});

// 初始化个人中心页面
function initProfilePage() {
    // 初始化用户头像点击事件
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', showAvatarOptions);
    }
    
    // 初始化头像编辑按钮
    const avatarEdit = document.querySelector('.avatar-edit');
    if (avatarEdit) {
        avatarEdit.addEventListener('click', function(e) {
            e.stopPropagation();
            changeAvatar();
        });
    }
    
    // 初始化统计数据点击事件
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('click', function() {
            const statType = this.dataset.stat;
            showStatDetails(statType);
        });
    });
}

// 初始化菜单项
function initMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 处理菜单点击
            handleMenuClick(action, this);
        });
    });
    
    // 初始化开关
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(switchInput => {
        switchInput.addEventListener('change', function() {
            const setting = this.dataset.setting;
            handleSettingToggle(setting, this.checked);
        });
    });

    // 初始化退出登录按钮
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleMenuClick(action, this);
        });
    }
}

// 初始化设置模态框
function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const closeBtn = modal.querySelector('.close-btn');
    
    // 点击遮罩关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideSettingsModal();
        }
    });
    
    // 点击关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', hideSettingsModal);
    }
}

// 加载用户资料
function loadUserProfile() {
    safeCommonUtils().mockApiRequest('/api/user/profile')
        .then(response => {
            if (response.success) {
                userProfile = { ...userProfile, ...response.data };
                updateProfileDisplay();
            }
        });
}

// 更新资料显示
function updateProfileDisplay() {
    // 更新用户信息
    const userName = document.querySelector('.user-name');
    const userTitle = document.querySelector('.user-title');
    const userAvatar = document.querySelector('.user-avatar img');
    
    if (userName) userName.textContent = userProfile.name;
    if (userTitle) userTitle.textContent = userProfile.title;
    if (userAvatar) userAvatar.src = userProfile.avatar;
    
    // 更新统计数据
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = userProfile.stats.answers;
        statNumbers[1].textContent = userProfile.stats.posts;
        statNumbers[2].textContent = userProfile.stats.followers;
        statNumbers[3].textContent = userProfile.stats.following;
    }
}

// 处理菜单点击
function handleMenuClick(action, menuItem) {
    switch(action) {
        case 'edit-profile':
            showEditProfileModal();
            break;
        case 'my-questions':
            safeCommonUtils().navigateTo('my-questions.html');
            break;
        case 'my-answers':
            safeCommonUtils().navigateTo('my-answers.html');
            break;
        case 'my-favorites':
            safeCommonUtils().navigateTo('my-favorites.html');
            break;
        case 'my-downloads':
            safeCommonUtils().navigateTo('my-downloads.html');
            break;
        case 'my-circles':
            safeCommonUtils().navigateTo('my-circles.html');
            break;
        case 'learning-progress':
            safeCommonUtils().navigateTo('learning-progress.html');
            break;
        case 'my-certificates':
            safeCommonUtils().navigateTo('my-certificates.html');
            break;
        case 'skill-assessment':
            safeCommonUtils().navigateTo('skill-assessment.html');
            break;
        case 'settings':
            showSettingsModal();
            break;
        case 'notifications':
            showNotificationSettings();
            break;
        case 'privacy':
            showPrivacySettings();
            break;
        case 'help':
            showHelpCenter();
            break;
        case 'feedback':
            showFeedbackForm();
            break;
        case 'about':
            showAboutInfo();
            break;
        case 'logout':
            confirmLogout();
            break;
        default:
            safeCommonUtils().showToast('功能开发中...', 'info');
    }
    
    // 统计菜单点击
    trackMenuClick(action);
}

// 显示头像选项
function showAvatarOptions() {
    const options = [
        { text: '查看头像', action: 'view' },
        { text: '更换头像', action: 'change' },
        { text: '拍照', action: 'camera' }
    ];
    
    showActionSheet('头像操作', options, function(action) {
        switch(action) {
            case 'view':
                previewAvatar();
                break;
            case 'change':
                changeAvatar();
                break;
            case 'camera':
                takePhoto();
                break;
        }
    });
}

// 更换头像
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadAvatar(file);
        }
    };
    
    input.click();
}

// 上传头像
function uploadAvatar(file) {
    if (file.size > 5 * 1024 * 1024) {
        safeCommonUtils().showToast('图片大小不能超过5MB', 'error');
        return;
    }
    
    safeCommonUtils().showLoading('上传头像中...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // 模拟上传
        setTimeout(() => {
            safeCommonUtils().hideLoading();
            
            // 更新头像显示
            const avatarImg = document.querySelector('.user-avatar img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
                userProfile.avatar = e.target.result;
            }
            
            safeCommonUtils().showToast('头像更新成功', 'success');
            
            // 保存到服务器
            saveAvatarToServer(e.target.result);
        }, 2000);
    };
    
    reader.readAsDataURL(file);
}

// 保存头像到服务器
function saveAvatarToServer(avatarData) {
    safeCommonUtils().mockApiRequest('/api/user/avatar', {
        method: 'POST',
        body: JSON.stringify({
            avatar: avatarData
        })
    }).then(response => {
        if (response.success) {
            console.log('头像保存成功');
        }
    });
}

// 预览头像
function previewAvatar() {
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
    img.src = userProfile.avatar;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 12px;
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    overlay.onclick = () => {
        document.body.removeChild(overlay);
    };
}

// 拍照
function takePhoto() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        safeCommonUtils().showToast('启动相机功能...', 'info');
        // 这里可以实现相机功能
    } else {
        safeCommonUtils().showToast('设备不支持相机功能', 'error');
    }
}

// 显示编辑资料模态框
function showEditProfileModal() {
    const modal = createEditProfileModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 创建编辑资料模态框
function createEditProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>编辑个人资料</h3>
                <button class="close-btn" onclick="closeEditModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form class="profile-edit-form" onsubmit="saveProfile(event)">
                    <div class="form-group">
                        <label class="form-label">姓名</label>
                        <input type="text" class="form-input" name="name" value="${userProfile.name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">职位</label>
                        <input type="text" class="form-input" name="title" value="${userProfile.title}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">部门</label>
                        <input type="text" class="form-input" name="department" value="${userProfile.department}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">邮箱</label>
                        <input type="email" class="form-input" name="email" value="${userProfile.email}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">手机号</label>
                        <input type="tel" class="form-input" name="phone" value="${userProfile.phone}">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeEditModal(this)">取消</button>
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modal;
}

// 关闭编辑模态框
function closeEditModal(btn) {
    const modal = btn.closest('.settings-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// 保存个人资料
function saveProfile(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        name: formData.get('name'),
        title: formData.get('title'),
        department: formData.get('department'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    safeCommonUtils().showLoading('保存中...');
    
    safeCommonUtils().mockApiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    }).then(response => {
        safeCommonUtils().hideLoading();
        
        if (response.success) {
            // 更新本地数据
            Object.assign(userProfile, profileData);
            updateProfileDisplay();
            
            safeCommonUtils().showToast('资料保存成功', 'success');
            closeEditModal(event.target.querySelector('.btn-secondary'));
        } else {
            safeCommonUtils().showToast('保存失败，请重试', 'error');
        }
    });
}

// 显示设置模态框
function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// 隐藏设置模态框
function hideSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 处理设置开关
function handleSettingToggle(setting, enabled) {
    const settings = {
        notifications: enabled,
        sound: enabled,
        vibration: enabled,
        autoUpdate: enabled
    };
    
    // 保存设置
    safeCommonUtils().storage.set(`setting_${setting}`, enabled);
    
    // 发送到服务器
    safeCommonUtils().mockApiRequest('/api/user/settings', {
        method: 'POST',
        body: JSON.stringify({
            [setting]: enabled
        })
    });
    
    safeCommonUtils().showToast(
        `${getSettingName(setting)}已${enabled ? '开启' : '关闭'}`, 
        'success'
    );
}

// 获取设置名称
function getSettingName(setting) {
    const names = {
        notifications: '消息通知',
        sound: '声音提醒',
        vibration: '震动反馈',
        autoUpdate: '自动更新'
    };
    return names[setting] || setting;
}

// 显示统计详情
function showStatDetails(statType) {
    const mapping = {
        answers: { title: '我的回答', url: 'my-answers.html' },
        posts: { title: '我的提问', url: 'my-questions.html' },
        followers: { title: '我的粉丝', url: 'followers.html' },
        following: { title: '我的关注', url: 'following.html' }
    };

    const info = mapping[statType];
    if (!info) {
        safeCommonUtils().showToast('暂不支持的统计项', 'error');
        return;
    }

    safeCommonUtils().showToast(`查看${info.title}...`, 'info');
    setTimeout(() => {
        safeCommonUtils().navigateTo(info.url);
    }, 500);
}

// 显示通知设置
function showNotificationSettings() {
    safeCommonUtils().showToast('通知设置功能开发中...', 'info');
}

// 显示隐私设置
function showPrivacySettings() {
    safeCommonUtils().showToast('隐私设置功能开发中...', 'info');
}

// 显示帮助中心
function showHelpCenter() {
    safeCommonUtils().navigateTo('help.html');
}

// 显示反馈表单
function showFeedbackForm() {
    safeCommonUtils().showConfirm(
        '要提交意见反馈吗？',
        () => {
            safeCommonUtils().navigateTo('feedback.html');
        }
    );
}

// 显示关于信息
function showAboutInfo() {
    const aboutInfo = `
        <div style="text-align: center; padding: 20px;">
            <h3 style="color: #667eea; margin-bottom: 16px;">移动云业务支撑</h3>
            <p style="color: #666; margin-bottom: 8px;">版本 1.0.0</p>
            <p style="color: #666; margin-bottom: 16px;">构建号 20240101</p>
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
                © 2024 中国移动通信集团<br>
                保留所有权利
            </p>
        </div>
    `;
    
    safeCommonUtils().showAlert('关于应用', aboutInfo);
}

// 确认退出登录
function confirmLogout() {
    safeCommonUtils().showConfirm(
        '确定要退出登录吗？',
        () => {
            performLogout();
        }
    );
}

// 执行退出登录
function performLogout() {
    safeCommonUtils().showLoading('退出中...');
    
    // 清除本地存储
    safeCommonUtils().storage.clear();
    
    // 发送退出请求
    safeCommonUtils().mockApiRequest('/api/auth/logout', {
        method: 'POST'
    }).then(response => {
        safeCommonUtils().hideLoading();
        
        if (response.success) {
            safeCommonUtils().showToast('已退出登录', 'success');
            
            setTimeout(() => {
                // 跳转到登录页面
                window.location.href = 'login.html';
            }, 1000);
        }
    });
}

// 显示操作表单
function showActionSheet(title, options, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;
    
    const sheet = document.createElement('div');
    sheet.style.cssText = `
        background: white;
        border-radius: 16px 16px 0 0;
        width: 100%;
        max-width: 400px;
        padding: 20px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    `;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        text-align: center;
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
    `;
    
    sheet.appendChild(titleElement);
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.style.cssText = `
            width: 100%;
            padding: 16px;
            border: none;
            background: #f8f9fa;
            margin-bottom: 8px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s;
        `;
        
        button.onclick = () => {
            callback(option.action);
            document.body.removeChild(overlay);
        };
        
        button.onmouseover = () => {
            button.style.background = '#e9ecef';
        };
        
        button.onmouseout = () => {
            button.style.background = '#f8f9fa';
        };
        
        sheet.appendChild(button);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        width: 100%;
        padding: 16px;
        border: none;
        background: #e9ecef;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 8px;
    `;
    
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    sheet.appendChild(cancelButton);
    
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
    
    setTimeout(() => {
        sheet.style.transform = 'translateY(0)';
    }, 10);
}

// 统计菜单点击
function trackMenuClick(action) {
    safeCommonUtils().mockApiRequest('/api/analytics/menu-click', {
        method: 'POST',
        body: JSON.stringify({
            page: 'profile',
            action: action,
            timestamp: Date.now()
        })
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新用户资料
        loadUserProfile();
    }
});
