// 文档解析器 - 客户端文档内容提取
// 支持 PDF、DOCX、PPTX 等格式的纯前端解析

// 文档解析器类
class DocumentParser {
    constructor() {
        this.parsers = {
            'pdf': this.parsePDF.bind(this),
            'docx': this.parseDOCX.bind(this),
            'pptx': this.parsePPTX.bind(this),
            'doc': this.parseDOC.bind(this),
            'ppt': this.parsePPT.bind(this)
        };
        this.loadExternalLibraries();
    }

    // 加载外部解析库
    async loadExternalLibraries() {
        try {
            // 加载 PDF.js
            if (!window.pdfjsLib) {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
            }

            // 加载 Mammoth.js (DOCX)
            if (!window.mammoth) {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
            }

            // 加载 JSZip (用于 PPTX 解析)
            if (!window.JSZip) {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            }

            console.log('文档解析库加载完成');
        } catch (error) {
            console.error('加载文档解析库失败:', error);
        }
    }

    // 动态加载脚本
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 获取文件扩展名
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // 主解析方法
    async parseDocument(filename) {
        try {
            const extension = this.getFileExtension(filename);
            const parser = this.parsers[extension];

            console.log(`开始解析文档: ${filename}, 格式: ${extension}`);

            if (!parser) {
                throw new Error(`不支持的文件格式: ${extension}`);
            }

            // 获取文件内容
            console.log(`正在加载文件: ${filename}`);
            const fileContent = await this.loadFile(filename);
            console.log(`文件加载完成, 大小: ${fileContent.byteLength} bytes`);

            // 解析文档
            console.log(`开始解析 ${extension.toUpperCase()} 内容`);
            const result = await parser(fileContent, filename);
            console.log(`解析完成, 页数: ${result.pageCount}, 文本长度: ${result.text ? result.text.length : 0}`);

            return {
                success: true,
                title: this.extractTitle(result.content, filename),
                htmlContent: result.html,
                textContent: result.text,
                extractedAt: new Date().toISOString(),
                fileSize: fileContent.byteLength,
                pageCount: result.pageCount || 1
            };
        } catch (error) {
            console.error('文档解析失败:', filename, error);
            return {
                success: false,
                error: error.message,
                title: filename,
                htmlContent: this.getErrorHTML(filename, error.message),
                extractedAt: new Date().toISOString()
            };
        }
    }

    // 加载文件
    async loadFile(filename) {
        // 优先尝试从在线 URL 加载
        const onlineUrl = `https://huitaila.github.io/huitailang.github.io/uploads/${encodeURIComponent(filename)}`;

        try {
            console.log(`尝试从在线 URL 加载文件: ${onlineUrl}`);
            const response = await fetch(onlineUrl);
            if (response.ok) {
                console.log(`✅ 成功从在线 URL 加载文件: ${filename}`);
                return await response.arrayBuffer();
            } else {
                console.log(`❌ 在线 URL 加载失败 (${response.status}), 尝试其他方式`);
            }
        } catch (error) {
            console.log(`❌ 在线 URL 加载出错: ${error.message}, 尝试其他方式`);
        }

        // 如果在线加载失败，检查是否为 file:// 协议
        if (window.fileProtocolAdapter && window.fileProtocolAdapter.isFileProtocolMode()) {
            // 使用文件协议适配器
            const cachedFile = window.fileProtocolAdapter.getCachedFile(filename);
            if (cachedFile) {
                console.log(`✅ 从文件协议缓存加载文件: ${filename}`);
                return cachedFile.data;
            } else {
                throw new Error(`文件未缓存且在线加载失败: ${filename}。请先选择文件。`);
            }
        } else {
            // 尝试本地 HTTP 协议
            try {
                const response = await fetch(`uploads/${filename}`);
                if (!response.ok) {
                    throw new Error(`本地文件加载失败: ${response.status} ${response.statusText}`);
                }
                console.log(`✅ 从本地路径加载文件: ${filename}`);
                return await response.arrayBuffer();
            } catch (error) {
                throw new Error(`所有加载方式都失败: ${error.message}`);
            }
        }
    }

    // 解析 PDF
    async parsePDF(fileContent, filename) {
        if (!window.pdfjsLib) {
            throw new Error('PDF.js 库未加载');
        }

        const pdf = await window.pdfjsLib.getDocument({ data: fileContent }).promise;
        let fullText = '';
        let fullHTML = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            let pageText = '';
            let pageHTML = `<div class="pdf-page" data-page="${i}">`;
            
            textContent.items.forEach(item => {
                pageText += item.str + ' ';
                pageHTML += `<span class="pdf-text-item">${this.escapeHtml(item.str)}</span> `;
            });
            
            pageHTML += '</div>';
            fullText += pageText + '\n';
            fullHTML += pageHTML;
        }

        return {
            text: fullText.trim(),
            html: this.formatPDFHTML(fullHTML),
            content: fullText.trim(),
            pageCount: pdf.numPages
        };
    }

    // 解析 DOCX
    async parseDOCX(fileContent, filename) {
        if (!window.mammoth) {
            throw new Error('Mammoth.js 库未加载');
        }

        const result = await window.mammoth.convertToHtml({ arrayBuffer: fileContent });
        const textResult = await window.mammoth.extractRawText({ arrayBuffer: fileContent });

        return {
            text: textResult.value,
            html: this.formatDOCXHTML(result.value),
            content: textResult.value,
            pageCount: 1
        };
    }

    // 解析 PPTX
    async parsePPTX(fileContent, filename) {
        if (!window.JSZip) {
            throw new Error('JSZip 库未加载');
        }

        const zip = await window.JSZip.loadAsync(fileContent);
        let slideTexts = [];
        let slideHTMLs = [];

        // 获取幻灯片文件并按数字顺序排序
        const slideFiles = Object.keys(zip.files)
            .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
            .sort((a, b) => {
                // 提取幻灯片编号进行数字排序
                const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || '0');
                const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || '0');
                return numA - numB;
            });

        console.log('找到幻灯片文件:', slideFiles);

        for (let i = 0; i < slideFiles.length; i++) {
            const slideFile = slideFiles[i];
            try {
                console.log(`正在解析幻灯片 ${i + 1}:`, slideFile);
                const slideXML = await zip.files[slideFile].async('text');

                // 使用改进的文本提取方法
                const slideContent = this.extractTextFromXML(slideXML);
                const slideNumber = i + 1;

                console.log(`幻灯片 ${slideNumber} 提取的内容:`, slideContent.substring(0, 200) + '...');

                slideTexts.push(slideContent);
                slideHTMLs.push(`<div class="pptx-slide" data-slide="${slideNumber}">
                    <div class="slide-header">
                        <h3>幻灯片 ${slideNumber}</h3>
                    </div>
                    <div class="slide-content">
                        ${this.formatSlideHTML(slideContent)}
                    </div>
                </div>`);
            } catch (error) {
                console.error(`解析幻灯片 ${slideFile} 失败:`, error);
                slideTexts.push(`[幻灯片 ${i + 1} 解析失败: ${error.message}]`);
                slideHTMLs.push(`<div class="pptx-slide error-slide" data-slide="${i + 1}">
                    <div class="slide-header">
                        <h3>幻灯片 ${i + 1} (解析失败)</h3>
                    </div>
                    <div class="slide-content">
                        <p class="error-message">解析失败: ${error.message}</p>
                    </div>
                </div>`);
            }
        }

        return {
            text: slideTexts.join('\n\n'),
            html: this.formatPPTXHTML(slideHTMLs.join('')),
            content: slideTexts.join('\n\n'),
            pageCount: slideTexts.length
        };
    }

    // 解析 DOC (旧格式，有限支持)
    async parseDOC(fileContent, filename) {
        // DOC 格式解析较复杂，这里提供基础支持
        throw new Error('DOC 格式暂不支持，请转换为 DOCX 格式');
    }

    // 解析 PPT (旧格式，有限支持)
    async parsePPT(fileContent, filename) {
        // PPT 格式解析较复杂，这里提供基础支持
        throw new Error('PPT 格式暂不支持，请转换为 PPTX 格式');
    }

    // 从 XML 中提取文本
    extractTextFromXML(xml) {
        try {
            // 创建DOM解析器
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');

            // 检查解析错误
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                console.warn('XML解析错误，使用简单文本提取:', parseError.textContent);
                return this.extractTextSimple(xml);
            }

            // 提取PPTX中的文本内容
            return this.extractPPTXTextFromDOM(xmlDoc);
        } catch (error) {
            console.warn('XML解析失败，使用简单文本提取:', error);
            return this.extractTextSimple(xml);
        }
    }

    // 简单的文本提取方法（作为后备）
    extractTextSimple(xml) {
        return xml.replace(/<[^>]*>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
    }

    // 从PPTX XML DOM中提取文本
    extractPPTXTextFromDOM(xmlDoc) {
        const textElements = [];

        try {
            // 方法1: 查找所有文本元素 - PPTX中文本通常在 a:t 元素中
            const textNodes = xmlDoc.querySelectorAll('a\\:t, t');
            textNodes.forEach(node => {
                const text = node.textContent.trim();
                if (text) {
                    textElements.push(text);
                }
            });

            // 方法2: 如果没有找到a:t元素，尝试其他可能的文本元素
            if (textElements.length === 0) {
                const alternativeSelectors = [
                    'p\\:txBody a\\:t',
                    'p\\:txBody t',
                    'a\\:p a\\:t',
                    'a\\:p t',
                    'p\\:sp p\\:txBody',
                    'txBody',
                    'bodyPr'
                ];

                for (const selector of alternativeSelectors) {
                    try {
                        const nodes = xmlDoc.querySelectorAll(selector);
                        nodes.forEach(node => {
                            const text = node.textContent.trim();
                            if (text) {
                                textElements.push(text);
                            }
                        });
                        if (textElements.length > 0) break;
                    } catch (e) {
                        // 忽略选择器错误，继续尝试下一个
                    }
                }
            }

            // 方法3: 使用正则表达式直接从XML中提取文本
            if (textElements.length === 0) {
                const xmlString = xmlDoc.documentElement.outerHTML || new XMLSerializer().serializeToString(xmlDoc);
                const textMatches = xmlString.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
                if (textMatches) {
                    textMatches.forEach(match => {
                        const text = match.replace(/<[^>]*>/g, '').trim();
                        if (text) {
                            textElements.push(text);
                        }
                    });
                }
            }

            // 方法4: 如果仍然没有找到文本，尝试提取所有可能的文本内容
            if (textElements.length === 0) {
                const xmlString = xmlDoc.documentElement.outerHTML || new XMLSerializer().serializeToString(xmlDoc);
                // 查找所有可能包含文本的标签
                const possibleTextTags = ['t>', 'text>', 'val>', 'v>'];
                for (const tag of possibleTextTags) {
                    const regex = new RegExp(`<[^>]*${tag}([^<]+)<`, 'g');
                    let match;
                    while ((match = regex.exec(xmlString)) !== null) {
                        const text = match[1].trim();
                        if (text && text.length > 1) {
                            textElements.push(text);
                        }
                    }
                    if (textElements.length > 0) break;
                }
            }

        } catch (error) {
            console.warn('DOM文本提取失败:', error);
        }

        // 如果仍然没有找到文本，使用简单提取
        if (textElements.length === 0) {
            const xmlString = xmlDoc.documentElement.outerHTML || new XMLSerializer().serializeToString(xmlDoc);
            return this.extractTextSimple(xmlString);
        }

        // 去重并连接文本
        const uniqueTexts = [...new Set(textElements)];
        return uniqueTexts.join(' ').trim();
    }

    // 提取文档标题
    extractTitle(content, filename) {
        // 尝试从内容中提取标题
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine.length > 0 && firstLine.length < 100) {
                return firstLine;
            }
        }
        
        // 如果无法提取，使用文件名
        return filename.replace(/\.[^/.]+$/, '');
    }

    // HTML 转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 格式化 PDF HTML
    formatPDFHTML(html) {
        return `
            <div class="document-content pdf-content">
                <style>
                    .pdf-content .pdf-page {
                        margin-bottom: 20px;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        background: white;
                    }
                    .pdf-content .pdf-text-item {
                        display: inline;
                    }
                </style>
                ${html}
            </div>
        `;
    }

    // 格式化 DOCX HTML
    formatDOCXHTML(html) {
        return `
            <div class="document-content docx-content">
                <style>
                    .docx-content {
                        line-height: 1.6;
                        font-family: 'Microsoft YaHei', Arial, sans-serif;
                    }
                    .docx-content p {
                        margin: 10px 0;
                    }
                    .docx-content h1, .docx-content h2, .docx-content h3 {
                        color: #2c3e50;
                        margin: 20px 0 10px 0;
                    }
                </style>
                ${html}
            </div>
        `;
    }

    // 格式化幻灯片 HTML
    formatSlideHTML(content) {
        if (!content || !content.trim()) {
            return '<p class="empty-slide">此幻灯片暂无内容</p>';
        }

        // 将内容按句子或段落分割
        const sentences = content.split(/[.。!！?？\n]/).filter(s => s.trim());
        let html = '';

        if (sentences.length === 0) {
            return `<p>${this.escapeHtml(content)}</p>`;
        }

        sentences.forEach((sentence, index) => {
            const trimmed = sentence.trim();
            if (!trimmed) return;

            // 第一句作为标题（如果比较短）
            if (index === 0 && trimmed.length < 80) {
                html += `<h4 class="slide-title">${this.escapeHtml(trimmed)}</h4>`;
            } else {
                // 检查是否是列表项
                if (trimmed.match(/^[\d\-\*•]\s*/) || trimmed.includes('：') || trimmed.includes(':')) {
                    html += `<div class="slide-item">${this.escapeHtml(trimmed)}</div>`;
                } else {
                    html += `<p class="slide-text">${this.escapeHtml(trimmed)}</p>`;
                }
            }
        });

        return html || `<p>${this.escapeHtml(content)}</p>`;
    }

    // 格式化 PPTX HTML
    formatPPTXHTML(html) {
        return `
            <div class="document-content pptx-content">
                <style>
                    .pptx-content .pptx-slide {
                        margin-bottom: 30px;
                        padding: 25px;
                        border: 2px solid #3498db;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        position: relative;
                    }
                    .pptx-content .slide-header {
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #3498db;
                    }
                    .pptx-content .slide-header h3 {
                        color: #2c3e50;
                        margin: 0;
                        font-size: 1.2em;
                        font-weight: 600;
                    }
                    .pptx-content .slide-content {
                        line-height: 1.6;
                    }
                    .pptx-content .slide-title {
                        color: #2c3e50;
                        font-size: 1.1em;
                        font-weight: 600;
                        margin: 0 0 15px 0;
                        padding: 8px 12px;
                        background: rgba(52, 152, 219, 0.1);
                        border-left: 4px solid #3498db;
                        border-radius: 4px;
                    }
                    .pptx-content .slide-text {
                        margin: 8px 0;
                        color: #34495e;
                        font-size: 0.95em;
                    }
                    .pptx-content .slide-item {
                        margin: 6px 0;
                        padding: 6px 12px;
                        background: rgba(46, 204, 113, 0.1);
                        border-left: 3px solid #2ecc71;
                        border-radius: 3px;
                        color: #27ae60;
                        font-size: 0.9em;
                    }
                    .pptx-content .empty-slide {
                        color: #95a5a6;
                        font-style: italic;
                        text-align: center;
                        padding: 20px;
                    }
                    .pptx-content .error-slide {
                        background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                        border-color: #e53e3e;
                    }
                    .pptx-content .error-message {
                        color: #c53030;
                        font-weight: 500;
                    }
                </style>
                ${html}
            </div>
        `;
    }

    // 获取错误 HTML
    getErrorHTML(filename, errorMessage) {
        return `
            <div class="document-content error-content">
                <div class="error-message">
                    <h2>⚠️ 文档解析失败</h2>
                    <p><strong>文件名：</strong>${this.escapeHtml(filename)}</p>
                    <p><strong>错误信息：</strong>${this.escapeHtml(errorMessage)}</p>
                    <p>请检查文件格式是否正确，或联系管理员获取帮助。</p>
                </div>
                <style>
                    .error-content {
                        padding: 20px;
                        background: #fff5f5;
                        border: 1px solid #fed7d7;
                        border-radius: 8px;
                        color: #c53030;
                    }
                    .error-content h2 {
                        color: #c53030;
                        margin-bottom: 15px;
                    }
                </style>
            </div>
        `;
    }
}

// 创建全局实例
window.DocumentParser = new DocumentParser();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentParser;
}
