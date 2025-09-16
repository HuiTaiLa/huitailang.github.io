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
// 分享文档页面脚本
(function() {
    'use strict';

    // DOM 元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const filePreview = document.getElementById('filePreview');
    const publishBtn = document.getElementById('publishBtn');
    const tagInput = document.getElementById('tagInput');
    const tagsList = document.getElementById('tagsList');

    // 状态变量
    let selectedFile = null;
    let tags = [];

    // 初始化
    function init() {
        bindEvents();
        updatePublishButton();
    }

    // 绑定事件
    function bindEvents() {
        // 上传区域点击
        uploadArea.addEventListener('click', () => {
            if (!selectedFile) {
                fileInput.click();
            }
        });

        // 文件选择
        fileInput.addEventListener('change', handleFileSelect);

        // 拖拽上传
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);

        // 标签输入
        tagInput.addEventListener('keydown', handleTagInput);

        // 发布按钮
        publishBtn.addEventListener('click', handlePublish);

        // 表单变化监听
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('input', updatePublishButton);
        });
    }

    // 处理文件选择
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    }

    // 处理拖拽
    function handleDragOver(event) {
        event.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(event) {
        event.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    // 处理文件
    function processFile(file) {
        // 验证文件类型
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            safeCommonUtils().showToast('不支持的文件格式', 'error');
            return;
        }

        // 验证文件大小（50MB）
        if (file.size > 50 * 1024 * 1024) {
            safeCommonUtils().showToast('文件大小不能超过50MB', 'error');
            return;
        }

        selectedFile = file;
        showFilePreview(file);
        
        // 自动填充标题
        if (!document.getElementById('docTitle').value) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('docTitle').value = fileName;
        }

        updatePublishButton();
    }

    // 显示文件预览
    function showFilePreview(file) {
        const fileIcon = getFileIcon(file.type);
        const fileSize = formatFileSize(file.size);
        
        filePreview.innerHTML = `
            <div class="file-icon">${fileIcon}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
            <button class="file-remove" onclick="removeFile()">移除</button>
        `;
        
        uploadPlaceholder.style.display = 'none';
        filePreview.style.display = 'flex';
    }

    // 移除文件
    window.removeFile = function() {
        selectedFile = null;
        fileInput.value = '';
        uploadPlaceholder.style.display = 'flex';
        filePreview.style.display = 'none';
        updatePublishButton();
    };

    // 获取文件图标
    function getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.ms-powerpoint': '📊',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
            'application/vnd.ms-excel': '📈',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📈'
        };
        return iconMap[mimeType] || '📄';
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 处理标签输入
    function handleTagInput(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const tag = tagInput.value.trim();
            if (tag && !tags.includes(tag)) {
                addTag(tag);
                tagInput.value = '';
            }
        }
    }

    // 添加标签
    function addTag(tag) {
        tags.push(tag);
        renderTags();
    }

    // 移除标签
    function removeTag(index) {
        tags.splice(index, 1);
        renderTags();
    }

    // 渲染标签
    function renderTags() {
        tagsList.innerHTML = tags.map((tag, index) => `
            <div class="tag-item">
                ${tag}
                <button class="tag-remove" onclick="removeTag(${index})">×</button>
            </div>
        `).join('');
    }

    // 全局函数
    window.removeTag = removeTag;

    // 更新发布按钮状态
    function updatePublishButton() {
        const title = document.getElementById('docTitle').value.trim();
        const description = document.getElementById('docDescription').value.trim();
        const category = document.getElementById('docCategory').value;
        
        const isValid = selectedFile && title && description && category;
        publishBtn.disabled = !isValid;
    }

    // 处理发布
    function handlePublish() {
        if (!selectedFile) {
            safeCommonUtils().showToast('请选择要分享的文档', 'error');
            return;
        }

        const formData = {
            file: selectedFile,
            title: document.getElementById('docTitle').value.trim(),
            description: document.getElementById('docDescription').value.trim(),
            category: document.getElementById('docCategory').value,
            tags: tags,
            allowDownload: document.getElementById('allowDownload').checked,
            allowComment: document.getElementById('allowComment').checked,
            notifyUpdate: document.getElementById('notifyUpdate').checked,
            shareScope: document.getElementById('shareScope').value
        };

        // 显示上传进度
        showUploadProgress();

        // 模拟上传过程
        simulateUpload(formData);
    }

    // 显示上传进度
    function showUploadProgress() {
        uploadArea.classList.add('uploading');
        publishBtn.disabled = true;
        publishBtn.textContent = '发布中...';

        // 添加进度条
        const progressHTML = `
            <div class="upload-progress">
                <div class="upload-progress-bar" id="progressBar"></div>
            </div>
        `;
        filePreview.insertAdjacentHTML('afterend', progressHTML);
    }

    // 模拟上传
    function simulateUpload(formData) {
        const progressBar = document.getElementById('progressBar');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    handleUploadSuccess(formData);
                }, 500);
            }
        }, 200);
    }

    // 上传成功处理
    function handleUploadSuccess(formData) {
        safeCommonUtils().showToast('文档分享成功！', 'success');
        
        // 重置表单
        setTimeout(() => {
            resetForm();
            // 返回工作圈页面
            safeCommonUtils().navigateTo('work-circle.html');
        }, 1500);
    }

    // 重置表单
    function resetForm() {
        selectedFile = null;
        tags = [];
        fileInput.value = '';
        document.getElementById('docTitle').value = '';
        document.getElementById('docDescription').value = '';
        document.getElementById('docCategory').value = '';
        document.getElementById('tagInput').value = '';
        document.getElementById('allowDownload').checked = true;
        document.getElementById('allowComment').checked = true;
        document.getElementById('notifyUpdate').checked = false;
        document.getElementById('shareScope').value = 'current-circle';
        
        uploadPlaceholder.style.display = 'flex';
        filePreview.style.display = 'none';
        uploadArea.classList.remove('uploading');
        publishBtn.disabled = true;
        publishBtn.textContent = '发布';
        
        // 移除进度条
        const progressElement = document.querySelector('.upload-progress');
        if (progressElement) {
            progressElement.remove();
        }
        
        renderTags();
        updatePublishButton();
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);

})();
