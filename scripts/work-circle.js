// 工作圈页面JavaScript功能

// 当前工作圈信息
let currentCircleData = null;

document.addEventListener('DOMContentLoaded', function() {
    initCircleTabs();
    initCircleList();
    initActivityList();
    initQuickActions();
    initFloatingActionButton();
    loadCircleData();
});

// 初始化圈子切换标签
function initCircleTabs() {
    const tabItems = document.querySelectorAll('.tab-item');

    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active状态
            tabItems.forEach(item => item.classList.remove('active'));

            // 添加当前标签的active状态
            this.classList.add('active');

            // 获取选中的圈子类型
            const circleType = this.dataset.circle;

            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 切换圈子内容
            switchCircleContent(circleType);

            // 显示加载状态
            showTabLoading();

            // 模拟加载延迟
            setTimeout(() => {
                hideTabLoading();
                commonUtils.showToast(`已切换到${this.textContent}`, 'success');
            }, 800);
        });
    });
}

// 切换圈子内容
function switchCircleContent(circleType) {
    const circleList = document.querySelector('.circle-list');
    const activityList = document.querySelector('.activity-list');

    // 添加切换动画
    if (circleList) {
        circleList.style.opacity = '0.5';
        circleList.style.transform = 'translateY(10px)';
    }

    if (activityList) {
        activityList.style.opacity = '0.5';
        activityList.style.transform = 'translateY(10px)';
    }

    // 根据圈子类型加载不同内容
    setTimeout(() => {
        loadCirclesByType(circleType);
        loadActivitiesByType(circleType);

        // 恢复动画
        if (circleList) {
            circleList.style.opacity = '';
            circleList.style.transform = '';
        }

        if (activityList) {
            activityList.style.opacity = '';
            activityList.style.transform = '';
        }
    }, 300);
}

// 显示标签加载状态
function showTabLoading() {
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        activeTab.style.opacity = '0.7';
        activeTab.style.pointerEvents = 'none';
    }
}

// 隐藏标签加载状态
function hideTabLoading() {
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        activeTab.style.opacity = '';
        activeTab.style.pointerEvents = '';
    }
}

// 根据类型加载圈子
function loadCirclesByType(circleType) {
    const circles = document.querySelectorAll('.circle-item');

    circles.forEach(circle => {
        const shouldShow = circleType === 'all' ||
                          circle.dataset.circleType === circleType ||
                          circle.classList.contains(circleType);

        if (shouldShow) {
            circle.style.display = 'flex';
            circle.style.animation = 'fadeInUp 0.3s ease forwards';
        } else {
            circle.style.display = 'none';
        }
    });
}

// 根据类型加载活动
function loadActivitiesByType(circleType) {
    const activities = document.querySelectorAll('.activity-item');

    activities.forEach(activity => {
        const shouldShow = circleType === 'all' ||
                          activity.dataset.circleType === circleType ||
                          activity.classList.contains(circleType);

        if (shouldShow) {
            activity.style.display = 'flex';
            activity.style.animation = 'fadeInUp 0.3s ease forwards';
        } else {
            activity.style.display = 'none';
        }
    });
}

// 初始化圈子列表
function initCircleList() {
    const circleItems = document.querySelectorAll('.circle-item');

    circleItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他圈子的active状态
            circleItems.forEach(circle => circle.classList.remove('active'));

            // 添加当前圈子的active状态
            this.classList.add('active');

            // 获取圈子信息（兼容没有 .circle-name 的结构）
            const circleNameEl = this.querySelector('.circle-name') || this.querySelector('h4');
            const circleName = circleNameEl ? circleNameEl.textContent : (this.dataset.circleId || 'work-circle');
            const circleId = this.dataset.circleId || circleName;

            // 进入圈子（跳转到群聊）
            enterCircle(circleId);

            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 统计点击事件
            trackCircleClick(circleId);
        });
    });

    // 查看全部按钮
    const viewAllBtn = document.querySelector('.view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            commonUtils.navigateTo('circle-list.html');
        });
    }
}

// 初始化活动列表
function initActivityList() {
    const activityItems = document.querySelectorAll('.activity-item');

    activityItems.forEach(item => {
        // 整卡点击打开详情
        item.addEventListener('click', function() {
            openActivityDetail(item);
        });

        // 点赞
        const likeBtn = item.querySelector('.action-btn[data-action="like"], .like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleLike(this);
            });
        }

        // 评论/消息
        const commentBtn = item.querySelector('.action-btn[data-action="comment"], .comment-btn');
        if (commentBtn) {
            commentBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showCommentDialog(item);
            });
        }

        // 分享
        const shareBtn = item.querySelector('.action-btn[data-action="share"], .share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                shareActivity(item);
            });
        }

        // 回答
        const answerBtn = item.querySelector('.action-btn[data-action="answer"], .answer-btn');
        if (answerBtn) {
            answerBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                answerQuestion(item);
            });
        }

        // 关注
        const followBtn = item.querySelector('.action-btn[data-action="follow"], .follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFollowQuestion(this);
            });
        }

        // 报名
        const joinBtn = item.querySelector('.event-join-btn, [data-action="join"]');
        if (joinBtn) {
            joinBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                joinEvent(item, this);
            });
        }

        // 附件点击
        const attachment = item.querySelector('.activity-attachment');
        if (attachment) {
            attachment.addEventListener('click', function(e) {
                e.stopPropagation();
                openAttachment(this);
            });
        }

        // 用户头像点击
        const userAvatar = item.querySelector('.activity-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', function(e) {
                e.stopPropagation();
                const userId = this.dataset.userId;
                showUserProfile(userId);
            });
        }
    });
}

// 初始化快速功能
function initQuickActions() {
    const functionItems = document.querySelectorAll('.function-item');

    functionItems.forEach(item => {
        item.addEventListener('click', function() {
            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // 获取功能名称
            const functionName = this.querySelector('span').textContent;

            // 处理快速功能
            handleQuickFunction(functionName, this);

            // 添加涟漪效果
            addRippleEffect(this);
        });

        // 添加悬停效果
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('hover-disabled')) {
                this.style.transform = 'translateY(-2px)';
            }
        });

        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('hover-disabled')) {
                this.style.transform = '';
            }
        });
    });
}

// 处理快速功能点击
function handleQuickFunction(functionName, element) {
    switch(functionName) {
        case '专家问答':
            commonUtils.showToast('正在进入专家问答...', 'info');
            setTimeout(() => {
                commonUtils.navigateTo('qa-system.html');
            }, 500);
            break;

        case '即时通讯':
            commonUtils.showToast('正在进入工作圈群聊...', 'info');
            setTimeout(() => {
                // 根据当前工作圈跳转到对应的群聊
                const currentCircle = getCurrentCircle();
                if (currentCircle) {
                    commonUtils.navigateTo(`chat.html?group=${currentCircle.id}&name=${encodeURIComponent(currentCircle.name)}`);
                } else {
                    // 如果没有当前工作圈，跳转到默认群聊
                    commonUtils.navigateTo('chat.html?group=group_1&name=华东区5G专网交流群');
                }
            }, 500);
            break;

        case '知识分享':
            showKnowledgeShareDialog();
            break;

        case '经验总结':
            showExperienceSummaryDialog();
            break;

        default:
            commonUtils.showToast('功能开发中...', 'info');
    }

    // 统计功能使用
    trackFunctionUsage(functionName);
}

// 添加涟漪效果
function addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 显示知识分享对话框
function showKnowledgeShareDialog() {
    const options = [
        { text: '📄 分享文档', action: 'share-document' },
        { text: '🎥 分享视频', action: 'share-video' },
        { text: '💡 分享经验', action: 'share-experience' },
        { text: '🔗 分享链接', action: 'share-link' }
    ];

    showActionSheet('知识分享', options, function(action) {
        switch(action) {
            case 'share-document':
                commonUtils.showToast('正在打开文档分享...', 'info');
                setTimeout(() => {
                    commonUtils.navigateTo('share-document.html');
                }, 500);
                break;
            case 'share-video':
                commonUtils.showToast('正在打开视频分享...', 'info');
                break;
            case 'share-experience':
                showCreatePostDialog('experience');
                break;
            case 'share-link':
                showLinkShareDialog();
                break;
        }
    });
}

// 显示经验总结对话框
function showExperienceSummaryDialog() {
    const options = [
        { text: '📊 项目总结', action: 'project-summary' },
        { text: '🛠 技术总结', action: 'tech-summary' },
        { text: '📈 业务总结', action: 'business-summary' },
        { text: '🎯 最佳实践', action: 'best-practice' }
    ];

    showActionSheet('经验总结', options, function(action) {
        switch(action) {
            case 'project-summary':
                showCreatePostDialog('project');
                break;
            case 'tech-summary':
                showCreatePostDialog('tech');
                break;
            case 'business-summary':
                showCreatePostDialog('business');
                break;
            case 'best-practice':
                showCreatePostDialog('practice');
                break;
        }
    });
}

// 统计功能使用
function trackFunctionUsage(functionName) {
    commonUtils.mockApiRequest('/api/analytics/function-usage', {
        method: 'POST',
        body: JSON.stringify({
            page: 'work-circle',
            function: functionName,
            timestamp: Date.now()
        })
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
            text-align: left;
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

// 显示链接分享对话框
function showLinkShareDialog() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
    `;

    content.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">分享链接</h3>
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">链接地址</label>
            <input type="url" placeholder="请输入要分享的链接" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">描述信息</label>
            <textarea placeholder="请输入链接描述..." rows="3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="this.closest('.modal').remove()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">取消</button>
            <button onclick="shareLinkSubmit(this)" style="padding: 10px 20px; border: none; background: #667eea; color: white; border-radius: 6px; cursor: pointer;">分享</button>
        </div>
    `;

    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// 提交链接分享
function shareLinkSubmit(button) {
    const modal = button.closest('.modal');
    const url = modal.querySelector('input[type="url"]').value;
    const description = modal.querySelector('textarea').value;

    if (!url) {
        alert('请输入链接地址');
        return;
    }

    commonUtils.showToast('正在分享链接...', 'info');

    // 模拟分享
    setTimeout(() => {
        commonUtils.showToast('链接分享成功！', 'success');
        document.body.removeChild(modal);
    }, 1000);
}

// 初始化浮动操作按钮
function initFloatingActionButton() {
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('click', function() {
            showCreatePostDialog();
        });
    }
}

// 加载圈子数据
function loadCircleData() {
    // 模拟加载圈子列表数据
    commonUtils.mockApiRequest('/api/circles/list')
        .then(response => {
            if (response.success) {
                updateCircleList(response.data);
            }
        });

    // 模拟加载活动数据
    commonUtils.mockApiRequest('/api/activities/recent')
        .then(response => {
            if (response.success) {
                updateActivityList(response.data);
            }
        });
}

// 加载圈子详情
function loadCircleDetails(circleId) {
    commonUtils.showLoading('加载圈子详情...');

    commonUtils.mockApiRequest(`/api/circles/${circleId}/details`)
        .then(response => {
            commonUtils.hideLoading();
            if (response.success) {
                // 这里可以更新圈子详情显示
                console.log('圈子详情:', response.data);

                // 可以跳转到圈子详情页面
                // commonUtils.navigateTo(`circle-detail.html?id=${circleId}`);
            }
        });
}

// 切换点赞状态
function toggleLike(likeBtn) {
    const isLiked = likeBtn.classList.contains('liked');
    const countSpan = likeBtn.querySelector('.like-count');
    let count = parseInt(countSpan.textContent) || 0;

    if (isLiked) {
        // 取消点赞
        likeBtn.classList.remove('liked');
        count = Math.max(0, count - 1);
        countSpan.textContent = count;

        // 添加取消点赞动画
        likeBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            likeBtn.style.transform = '';
        }, 200);
    } else {
        // 点赞
        likeBtn.classList.add('liked');
        count += 1;
        countSpan.textContent = count;

        // 添加点赞动画
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = '';
        }, 200);

        // 显示点赞提示
        showLikeAnimation(likeBtn);
    }

    // 发送点赞请求
    const activityId = likeBtn.closest('.activity-item').dataset.activityId;
    updateLikeStatus(activityId, !isLiked);
}

// 显示点赞动画
function showLikeAnimation(element) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: absolute;
        font-size: 20px;
        pointer-events: none;
        animation: likeAnimation 1s ease-out forwards;
        z-index: 1000;
    `;

    const rect = element.getBoundingClientRect();
    heart.style.left = rect.left + rect.width / 2 + 'px';
    heart.style.top = rect.top + 'px';

    document.body.appendChild(heart);

    // 添加动画样式
    if (!document.getElementById('likeAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'likeAnimationStyle';
        style.textContent = `
            @keyframes likeAnimation {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-50px) scale(1.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        document.body.removeChild(heart);
    }, 1000);
}

// 显示评论对话框
function showCommentDialog(activityItem) {
    const activityId = activityItem.dataset.activityId;
    const activityTitle = activityItem.querySelector('.activity-text').textContent.substring(0, 50) + '...';

    commonUtils.showConfirm(
        `要对"${activityTitle}"发表评论吗？`,
        () => {
            // 这里可以打开评论页面或显示评论输入框
            commonUtils.navigateTo(`comment.html?activityId=${activityId}`);
        }
    );
}

// 分享活动
function shareActivity(activityItem) {
    const activityId = activityItem.dataset.activityId;
    const activityTitle = activityItem.querySelector('.activity-text').textContent;

    // 模拟分享功能
    if (navigator.share) {
        navigator.share({
            title: '工作圈分享',
            text: activityTitle,
            url: window.location.href + `?activityId=${activityId}`
        });
    } else {
        // 复制链接到剪贴板
        const shareUrl = window.location.href + `?activityId=${activityId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            commonUtils.showToast('链接已复制到剪贴板', 'success');
        });
    }
}

// 打开附件
function openAttachment(attachmentElement) {
    const nameEl = attachmentElement.querySelector('.attachment-name');
    let fileName = nameEl ? nameEl.textContent : (attachmentElement.textContent || '').trim() || '附件';
    const fileType = (fileName.split('.').pop() || '').toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        // 图片预览
        showImagePreview(attachmentElement.dataset.fileUrl || 'images/doc-thumb.png');
    } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileType)) {
        // 文档预览
        commonUtils.showToast('正在打开文档...', 'info');
        // 这里可以跳转到文档预览页面
        setTimeout(() => {
            commonUtils.navigateTo(`document-viewer.html?file=${encodeURIComponent(fileName)}`);
        }, 1000);
    } else {
        // 其他文件类型
        commonUtils.showToast('正在下载文件...', 'info');
    }
}

// 显示图片预览
function showImagePreview(imageUrl) {
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

// 显示用户资料
function showUserProfile(userId) {
    commonUtils.showToast('查看用户资料...', 'info');
    // 这里可以跳转到用户资料页面
    setTimeout(() => {
        commonUtils.navigateTo(`user-profile.html?userId=${userId}`);
    }, 500);
}

// 处理快速功能
function handleQuickAction(action) {
    switch(action) {
        case 'ask-expert':
            commonUtils.navigateTo('qa-system.html');
            break;
        case 'share-experience':
            showCreatePostDialog();
            break;
        case 'find-solution':
            commonUtils.navigateTo('resource-library.html');
            break;
        case 'join-discussion':
            showJoinDiscussionDialog();
            break;
        default:
            commonUtils.showToast('功能开发中...', 'info');
    }
}

// 显示创建帖子对话框
function showCreatePostDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        width: 100%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
    `;

    dialog.innerHTML = `
        <h3 style="margin-bottom: 16px; color: #333;">发布动态</h3>
        <textarea placeholder="分享你的想法..." style="width: 100%; height: 120px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; resize: none; font-family: inherit; font-size: 14px; outline: none;" id="postContent"></textarea>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button onclick="this.closest('.overlay').remove()" style="flex: 1; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; color: #666; cursor: pointer;">取消</button>
            <button onclick="publishPost()" style="flex: 1; padding: 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer;">发布</button>
        </div>
    `;

    overlay.className = 'overlay';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 聚焦到文本框
    setTimeout(() => {
        dialog.querySelector('#postContent').focus();
    }, 100);

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

// 发布帖子
function publishPost() {
    const content = document.getElementById('postContent').value.trim();

    if (!content) {
        commonUtils.showToast('请输入内容', 'error');
        return;
    }

    commonUtils.showLoading('发布中...');

    // 模拟发布请求
    commonUtils.mockApiRequest('/api/posts/create', {
        method: 'POST',
        body: JSON.stringify({
            content: content,
            timestamp: Date.now()
        })
    }).then(response => {
        commonUtils.hideLoading();

        if (response.success) {
            commonUtils.showToast('发布成功！', 'success');
            document.querySelector('.overlay').remove();

            // 刷新活动列表
            setTimeout(() => {
                loadCircleData();
            }, 1000);
        } else {
            commonUtils.showToast('发布失败，请重试', 'error');
        }
    });
}

// 显示加入讨论对话框
function showJoinDiscussionDialog() {
    commonUtils.showConfirm(
        '要加入当前热门讨论吗？',
        () => {
            commonUtils.navigateTo('discussion.html');
        }
    );
}

// 更新圈子列表
function updateCircleList(data) {
    // 这里可以动态更新圈子列表
    console.log('更新圈子列表:', data);
}

// 更新活动列表
function updateActivityList(data) {
    // 这里可以动态更新活动列表
    console.log('更新活动列表:', data);
}

// 更新点赞状态
function updateLikeStatus(activityId, isLiked) {
    commonUtils.mockApiRequest(`/api/activities/${activityId}/like`, {
        method: 'POST',
        body: JSON.stringify({
            liked: isLiked
        })
    }).then(response => {
        if (response.success) {
            console.log('点赞状态更新成功');
        }
    });
}

// 统计圈子点击
function trackCircleClick(circleId) {
    commonUtils.mockApiRequest('/api/analytics/circle-click', {
        method: 'POST',
        body: JSON.stringify({
            circleId: circleId,
            timestamp: Date.now()
        })
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadCircleData();
    }
});

// 下拉刷新
let startY = 0;
let pullDistance = 0;
const pullThreshold = 80;

document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
    }
});

document.addEventListener('touchmove', function(e) {
    if (window.scrollY === 0 && startY > 0) {
        pullDistance = e.touches[0].clientY - startY;

        if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
            e.preventDefault();

            const container = document.querySelector('.container');
            container.style.transform = `translateY(${Math.min(pullDistance * 0.5, pullThreshold)}px)`;
            container.style.transition = 'none';
        }
    }
});

document.addEventListener('touchend', function(e) {
    const container = document.querySelector('.container');
    container.style.transform = '';
    container.style.transition = 'transform 0.3s ease';

    if (pullDistance > pullThreshold) {
        commonUtils.showToast('正在刷新...', 'info');
        loadCircleData();
    }

    startY = 0;
    pullDistance = 0;
});

// 显示创建工作圈模态框
function showCreateCircle() {
    // 添加点击动画
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addBtn.style.transform = '';
        }, 150);
    }

    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'create-circle-modal';
    modal.innerHTML = `
        <div class="modal-content create-circle-content">
            <div class="modal-header">
                <h3>创建工作圈</h3>
                <button class="close-btn" onclick="this.closest('.create-circle-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="create-options">
                    <div class="create-option" onclick="showCreateForm('circle')">
                        <div class="option-icon">🏢</div>
                        <div class="option-info">
                            <div class="option-title">创建工作圈</div>
                            <div class="option-desc">建立新的区域工作协作圈</div>
                        </div>
                        <div class="option-arrow">›</div>
                    </div>

                    <div class="create-option" onclick="showCreateForm('project')">
                        <div class="option-icon">📋</div>
                        <div class="option-info">
                            <div class="option-title">创建项目</div>
                            <div class="option-desc">发起新的协作项目</div>
                        </div>
                        <div class="option-arrow">›</div>
                    </div>

                    <div class="create-option" onclick="showCreateForm('activity')">
                        <div class="option-icon">🎯</div>
                        <div class="option-info">
                            <div class="option-title">发布活动</div>
                            <div class="option-desc">组织团队活动或会议</div>
                        </div>
                        <div class="option-arrow">›</div>
                    </div>

                    <div class="create-option" onclick="showCreateForm('announcement')">
                        <div class="option-icon">📢</div>
                        <div class="option-info">
                            <div class="option-title">发布公告</div>
                            <div class="option-desc">发布重要通知或公告</div>
                        </div>
                        <div class="option-arrow">›</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // 添加显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 显示创建表单
function showCreateForm(type) {
    // 关闭选项模态框
    const optionsModal = document.querySelector('.create-circle-modal');
    if (optionsModal) {
        optionsModal.remove();
    }

    // 根据类型显示不同的表单
    switch(type) {
        case 'circle':
            showCreateCircleForm();
            break;
        case 'project':
            showCreateProjectForm();
            break;
        case 'activity':
            showCreateActivityForm();
            break;
        case 'announcement':
            showCreateAnnouncementForm();
            break;
    }
}

// 显示创建工作圈表单
function showCreateCircleForm() {
    const modal = document.createElement('div');
    modal.className = 'create-form-modal';
    modal.innerHTML = `
        <div class="modal-content create-form-content">
            <div class="modal-header">
                <h3>🏢 创建工作圈</h3>
                <button class="close-btn" onclick="this.closest('.create-form-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form class="create-circle-form">
                    <div class="form-group">
                        <label>工作圈名称 *</label>
                        <input type="text" class="form-input" placeholder="请输入工作圈名称" required>
                    </div>

                    <div class="form-group">
                        <label>工作圈描述</label>
                        <textarea class="form-textarea" placeholder="请描述工作圈的目标和职能" rows="3"></textarea>
                    </div>

                    <div class="form-group">
                        <label>所属区域</label>
                        <select class="form-select">
                            <option value="unlimited">不限区域</option>
                            <option value="east">华东区</option>
                            <option value="south">华南区</option>
                            <option value="north">华北区</option>
                            <option value="west">华西区</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>工作圈类型 *</label>
                        <select class="form-select" required>
                            <option value="">请选择类型</option>
                            <option value="5g">5G网络</option>
                            <option value="cloud">云计算</option>
                            <option value="edge">边缘计算</option>
                            <option value="iot">物联网</option>
                            <option value="security">网络安全</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>访问权限</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="privacy" value="public" checked>
                                <span class="radio-text">公开 - 所有人可见</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="privacy" value="private">
                                <span class="radio-text">私有 - 仅邀请成员</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.create-form-modal').remove()">取消</button>
                <button class="submit-btn" onclick="submitCreateCircle()">创建工作圈</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 显示创建项目表单
function showCreateProjectForm() {
    const modal = document.createElement('div');
    modal.className = 'create-form-modal';
    modal.innerHTML = `
        <div class="modal-content create-form-content">
            <div class="modal-header">
                <h3>📋 创建项目</h3>
                <button class="close-btn" onclick="this.closest('.create-form-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form class="create-project-form">
                    <div class="form-group">
                        <label>项目名称 *</label>
                        <input type="text" class="form-input" placeholder="请输入项目名称" required>
                    </div>

                    <div class="form-group">
                        <label>项目描述 *</label>
                        <textarea class="form-textarea" placeholder="请详细描述项目目标和内容" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>项目类型</label>
                        <select class="form-select">
                            <option value="development">技术开发</option>
                            <option value="deployment">部署实施</option>
                            <option value="maintenance">运维保障</option>
                            <option value="research">技术研究</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>预计完成时间</label>
                        <input type="date" class="form-input">
                    </div>

                    <div class="form-group">
                        <label>优先级</label>
                        <select class="form-select">
                            <option value="low">普通</option>
                            <option value="medium">中等</option>
                            <option value="high">紧急</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.create-form-modal').remove()">取消</button>
                <button class="submit-btn" onclick="submitCreateProject()">创建项目</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 显示创建活动表单
function showCreateActivityForm() {
    const modal = document.createElement('div');
    modal.className = 'create-form-modal';
    modal.innerHTML = `
        <div class="modal-content create-form-content">
            <div class="modal-header">
                <h3>🎯 发布活动</h3>
                <button class="close-btn" onclick="this.closest('.create-form-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form class="create-activity-form">
                    <div class="form-group">
                        <label>活动标题 *</label>
                        <input type="text" class="form-input" placeholder="请输入活动标题" required>
                    </div>

                    <div class="form-group">
                        <label>活动描述 *</label>
                        <textarea class="form-textarea" placeholder="请描述活动内容和安排" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>活动时间 *</label>
                        <input type="datetime-local" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label>活动地点</label>
                        <input type="text" class="form-input" placeholder="请输入活动地点">
                    </div>

                    <div class="form-group">
                        <label>参与人数限制</label>
                        <input type="number" class="form-input" placeholder="不限制请留空" min="1">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.create-form-modal').remove()">取消</button>
                <button class="submit-btn" onclick="submitCreateActivity()">发布活动</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 显示创建公告表单
function showCreateAnnouncementForm() {
    const modal = document.createElement('div');
    modal.className = 'create-form-modal';
    modal.innerHTML = `
        <div class="modal-content create-form-content">
            <div class="modal-header">
                <h3>📢 发布公告</h3>
                <button class="close-btn" onclick="this.closest('.create-form-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form class="create-announcement-form">
                    <div class="form-group">
                        <label>公告标题 *</label>
                        <input type="text" class="form-input" placeholder="请输入公告标题" required>
                    </div>

                    <div class="form-group">
                        <label>公告内容 *</label>
                        <textarea class="form-textarea" placeholder="请输入公告详细内容" rows="5" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>公告类型</label>
                        <select class="form-select">
                            <option value="general">一般通知</option>
                            <option value="urgent">紧急通知</option>
                            <option value="system">系统公告</option>
                            <option value="policy">政策通知</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>生效时间</label>
                        <input type="datetime-local" class="form-input">
                    </div>

                    <div class="form-group">
                        <label>发布范围</label>
                        <div class="checkbox-group">
                            <label class="checkbox-option">
                                <input type="checkbox" value="east" checked>
                                <span class="checkbox-text">华东区</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" value="south">
                                <span class="checkbox-text">华南区</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" value="north">
                                <span class="checkbox-text">华北区</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" value="west">
                                <span class="checkbox-text">华西区</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" onclick="this.closest('.create-form-modal').remove()">取消</button>
                <button class="submit-btn" onclick="submitCreateAnnouncement()">发布公告</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 提交创建工作圈
function submitCreateCircle() {
    const form = document.querySelector('.create-circle-form');
    const formData = new FormData(form);

    // 表单验证
    const name = form.querySelector('input[type="text"]').value.trim();
    const type = form.querySelector('.form-select:nth-of-type(2)').value; // 工作圈类型

    if (!name) {
        commonUtils.showToast('请输入工作圈名称', 'error');
        return;
    }

    if (!type) {
        commonUtils.showToast('请选择工作圈类型', 'error');
        return;
    }

    // 显示加载状态
    commonUtils.showLoading('正在创建工作圈...');

    // 模拟API调用
    setTimeout(() => {
        commonUtils.hideLoading();
        commonUtils.showToast('工作圈创建成功！', 'success');

        // 关闭模态框
        document.querySelector('.create-form-modal').remove();

        // 刷新页面数据
        loadCircleData();
    }, 1500);
}

// 提交创建项目
function submitCreateProject() {
    const form = document.querySelector('.create-project-form');
    const name = form.querySelector('input[type="text"]').value.trim();
    const description = form.querySelector('textarea').value.trim();

    if (!name || !description) {
        commonUtils.showToast('请填写项目名称和描述', 'error');
        return;
    }

    commonUtils.showLoading('正在创建项目...');

    setTimeout(() => {
        commonUtils.hideLoading();
        commonUtils.showToast('项目创建成功！', 'success');
        document.querySelector('.create-form-modal').remove();
        loadCircleData();
    }, 1500);
}

// 提交创建活动
function submitCreateActivity() {
    const form = document.querySelector('.create-activity-form');
    const title = form.querySelector('input[type="text"]').value.trim();
    const description = form.querySelector('textarea').value.trim();
    const datetime = form.querySelector('input[type="datetime-local"]').value;

    if (!title || !description || !datetime) {
        commonUtils.showToast('请填写活动标题、描述和时间', 'error');
        return;
    }

    commonUtils.showLoading('正在发布活动...');

    setTimeout(() => {
        commonUtils.hideLoading();
        commonUtils.showToast('活动发布成功！', 'success');
        document.querySelector('.create-form-modal').remove();
        loadCircleData();
    }, 1500);
}

// 提交创建公告
function submitCreateAnnouncement() {
    const form = document.querySelector('.create-announcement-form');
    const title = form.querySelector('input[type="text"]').value.trim();
    const content = form.querySelector('textarea').value.trim();

    if (!title || !content) {
        commonUtils.showToast('请填写公告标题和内容', 'error');
        return;
    }

    commonUtils.showLoading('正在发布公告...');

    setTimeout(() => {
        commonUtils.hideLoading();
        commonUtils.showToast('公告发布成功！', 'success');
        document.querySelector('.create-form-modal').remove();
        loadCircleData();
    }, 1500);
}

// 获取当前工作圈信息
function getCurrentCircle() {
    // 如果有设置当前工作圈数据，返回它
    if (currentCircleData) {
        return currentCircleData;
    }

    // 否则返回默认的工作圈信息
    return {
        id: 'group_1',
        name: '华东区5G专网交流群',
        type: 'technical'
    };
}

// 设置当前工作圈
function setCurrentCircle(circleData) {
    currentCircleData = circleData;
}


// 进入圈子（跳转到对应群聊）
function enterCircle(key) {
    const mapping = {
        'east-5g': { id: 'group_1', name: '华东区5G专网交流群', type: 'technical' },
        'cloud-expert': { id: 'group_expert', name: '云计算专家咨询组', type: 'expert' },
        'south-iot': { id: 'group_south_iot', name: '华南区物联网应用圈', type: 'iot' }
    };
    const target = mapping[key] || mapping['east-5g'];
    try { setCurrentCircle(target); } catch (e) {}
    const url = `chat.html?group=${encodeURIComponent(target.id)}&name=${encodeURIComponent(target.name)}`;
    if (window.commonUtils && commonUtils.navigateTo) {
        commonUtils.navigateTo(url);
    } else {
        window.location.href = url;
    }
}

// 回答问题（跳转到专家问答）
function answerQuestion(activityItem) {
    if (window.commonUtils && commonUtils.showToast) {
        commonUtils.showToast('跳转到专家问答...', 'info');
        setTimeout(() => commonUtils.navigateTo('qa-system.html'), 400);
    } else {
        window.location.href = 'qa-system.html';
    }
}

// 关注/取消关注 问题
function toggleFollowQuestion(btn) {
    const followed = btn.classList.toggle('followed');
    btn.textContent = followed ? '✔ 已关注' : '👁 关注';
    if (window.commonUtils && commonUtils.showToast) {
        commonUtils.showToast(followed ? '已关注该问题' : '已取消关注', 'success');
    }
}

// 活动报名
function joinEvent(activityItem, btn) {
    if (btn.classList.contains('joined')) return;
    btn.classList.add('joined');
    btn.textContent = '已报名';
    btn.disabled = true;
    if (window.commonUtils && commonUtils.showToast) {
        commonUtils.showToast('报名成功，已加入活动', 'success');
    }
}

// 打开动态详情（示例：可跳转详情页或弹出详情）
function openActivityDetail(item) {
    const id = item && item.dataset ? (item.dataset.activityId || '') : '';
    if (window.commonUtils && commonUtils.showToast) {
        commonUtils.showToast('打开动态详情...', 'info');
    }
}
