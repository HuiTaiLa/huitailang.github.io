// File Protocol Adapter - 为 file:// 协议提供文件访问支持
// 解决浏览器 CORS 限制问题

class FileProtocolAdapter {
    constructor() {
        this.fileCache = new Map();
        this.isFileProtocol = window.location.protocol === 'file:';
        this.initFileInput();
    }

    // 初始化隐藏的文件输入元素
    initFileInput() {
        if (!this.isFileProtocol) return;

        // 创建隐藏的文件输入元素
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = true;
        this.fileInput.accept = '.pdf,.docx,.pptx,.doc,.ppt';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        // 监听文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
    }

    // 处理文件选择
    async handleFileSelection(files) {
        for (const file of files) {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            this.fileCache.set(file.name, {
                data: arrayBuffer,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
        }
        
        console.log(`已缓存 ${files.length} 个文件:`, Array.from(files).map(f => f.name));
        
        // 触发自定义事件通知文件已加载
        window.dispatchEvent(new CustomEvent('filesLoaded', {
            detail: { files: Array.from(files).map(f => f.name) }
        }));
    }

    // 读取文件为 ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 检查是否为 file:// 协议
    isFileProtocolMode() {
        return this.isFileProtocol;
    }

    // 获取缓存的文件
    getCachedFile(filename) {
        return this.fileCache.get(filename);
    }

    // 获取所有缓存的文件名
    getCachedFileNames() {
        return Array.from(this.fileCache.keys());
    }

    // 提示用户选择文件
    promptFileSelection() {
        if (!this.isFileProtocol) return false;
        
        // 显示文件选择对话框
        this.fileInput.click();
        return true;
    }

    // 检查文件是否已缓存
    isFileCached(filename) {
        return this.fileCache.has(filename);
    }

    // 清除缓存
    clearCache() {
        this.fileCache.clear();
    }

    // 获取缓存信息
    getCacheInfo() {
        return {
            isFileProtocol: this.isFileProtocol,
            cachedFiles: this.getCachedFileNames(),
            cacheSize: this.fileCache.size
        };
    }

    // 检查文件是否已缓存
    isFileCached(filename) {
        return this.fileCache.has(filename);
    }

    // 提示用户选择文件
    promptFileSelection() {
        const fileInput = document.getElementById('fileProtocolInput');
        if (fileInput) {
            fileInput.click();
        } else {
            alert('请在页面中找到文件选择按钮进行操作');
        }
    }

    // 创建文件选择界面
    createFileSelectionUI() {
        if (!this.isFileProtocol) return null;

        const ui = document.createElement('div');
        ui.className = 'file-protocol-ui';
        ui.innerHTML = `
            <div class="file-protocol-notice">
                <h3>📁 文件协议模式</h3>
                <p>由于您使用的是 file:// 协议访问，需要手动选择 uploads 文件夹中的文档文件。</p>
                <button class="select-files-btn" onclick="window.fileProtocolAdapter.promptFileSelection()">
                    📂 选择文档文件
                </button>
                <div class="cached-files" id="cachedFilesList">
                    <p>已选择的文件将显示在这里...</p>
                </div>
            </div>
            <style>
                .file-protocol-ui {
                    margin: 20px 0;
                    padding: 20px;
                    border: 2px dashed #3498db;
                    border-radius: 8px;
                    background: #f8f9fa;
                    text-align: center;
                }
                .file-protocol-notice h3 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .file-protocol-notice p {
                    color: #666;
                    margin-bottom: 15px;
                }
                .select-files-btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.3s ease;
                }
                .select-files-btn:hover {
                    background: #2980b9;
                }
                .cached-files {
                    margin-top: 15px;
                    padding: 10px;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                }
                .file-item {
                    display: inline-block;
                    margin: 5px;
                    padding: 5px 10px;
                    background: #e8f4fd;
                    border-radius: 4px;
                    font-size: 14px;
                    color: #2c3e50;
                }
            </style>
        `;

        // 监听文件加载事件
        window.addEventListener('filesLoaded', (e) => {
            this.updateCachedFilesList();
        });

        return ui;
    }

    // 更新缓存文件列表显示
    updateCachedFilesList() {
        const listElement = document.getElementById('cachedFilesList');
        if (!listElement) return;

        const cachedFiles = this.getCachedFileNames();
        if (cachedFiles.length === 0) {
            listElement.innerHTML = '<p>已选择的文件将显示在这里...</p>';
        } else {
            listElement.innerHTML = `
                <p><strong>已缓存 ${cachedFiles.length} 个文件：</strong></p>
                ${cachedFiles.map(name => `<span class="file-item">${name}</span>`).join('')}
            `;
        }
    }

    // 显示文件选择提示
    showFileSelectionPrompt(targetElement) {
        if (!this.isFileProtocol) return;

        const prompt = document.createElement('div');
        prompt.className = 'file-selection-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <h4>🔒 需要选择文件</h4>
                <p>由于浏览器安全限制，请先选择 uploads 文件夹中的文档文件。</p>
                <button onclick="window.fileProtocolAdapter.promptFileSelection()">选择文件</button>
            </div>
            <style>
                .file-selection-prompt {
                    padding: 20px;
                    text-align: center;
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    margin: 10px 0;
                }
                .file-selection-prompt h4 {
                    color: #856404;
                    margin-bottom: 10px;
                }
                .file-selection-prompt p {
                    color: #856404;
                    margin-bottom: 15px;
                }
                .file-selection-prompt button {
                    background: #ffc107;
                    color: #212529;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        `;

        if (targetElement) {
            targetElement.appendChild(prompt);
        }

        return prompt;
    }
}

// 创建全局实例
window.fileProtocolAdapter = new FileProtocolAdapter();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileProtocolAdapter;
}
