# 真实文档内容提取系统

## 概述

本系统实现了从 uploads 文件夹中真实提取文档内容并转换为 HTML 格式进行预览的功能。系统严格按照文档中提取的原始内容来展示，按照顺序提取，不擅自添加任何内容，更不会自己总结概述。

## 核心特性

### ✅ 真实内容提取
- 直接从 uploads 文件夹中的真实文档文件提取内容
- 支持 PDF、DOCX、PPTX 等主流格式
- 严格按照原始文档内容顺序展示
- 保持原有格式和结构

### ✅ 纯静态部署
- 不依赖任何 HTTP 服务器
- 使用客户端 JavaScript 库进行文档解析
- 所有处理都在浏览器端完成

### ✅ 多格式支持
- **PDF**: 使用 PDF.js 提取文本内容
- **DOCX**: 使用 Mammoth.js 转换为 HTML
- **PPTX**: 使用 JSZip 解析幻灯片内容

## 系统架构

### 1. 文档解析器 (`scripts/document-parsers.js`)
负责加载外部解析库并提供统一的文档解析接口：
- 动态加载 PDF.js、Mammoth.js、JSZip 等库
- 提供统一的 `parseDocument()` 方法
- 处理不同格式的文档解析逻辑

### 2. 文档内容提取器 (`scripts/document-content-extractor.js`)
提供高级的文档内容提取功能：
- 缓存已解析的文档内容
- 提供同步和异步的提取方法
- 处理错误和后备方案

### 3. 文档查看器 (`scripts/document-viewer.js`)
实现完整的文档查看功能：
- 异步加载文档内容
- 显示加载进度和状态
- 更新文档元信息

### 4. 资源库预览 (`scripts/resource-library.js`)
在资源库中提供文档预览功能：
- 模态框预览
- 异步内容加载
- 元信息显示

## 使用方法

### 基本用法

```javascript
// 异步提取文档内容
const result = await window.DocumentContentExtractor.extractDocumentContent('文档名.docx');

if (result.success) {
    console.log('标题:', result.title);
    console.log('HTML内容:', result.htmlContent);
    console.log('文件大小:', result.fileSize);
    console.log('页数:', result.pageCount);
}
```

### 在 HTML 中使用

```html
<!-- 引入必要的脚本 -->
<script src="scripts/document-parsers.js"></script>
<script src="scripts/document-content-extractor.js"></script>

<script>
// 等待系统初始化
document.addEventListener('DOMContentLoaded', async function() {
    await window.DocumentContentExtractor.init();
    
    // 现在可以使用文档提取功能
    const result = await window.DocumentContentExtractor.extractDocumentContent('示例文档.pdf');
    document.getElementById('content').innerHTML = result.htmlContent;
});
</script>
```

## 支持的文档格式

### PDF 文档
- 提取文本内容
- 保持页面结构
- 支持多页文档

### DOCX 文档
- 转换为语义化 HTML
- 保持格式和样式
- 支持标题、段落、列表等

### PPTX 文档
- 提取幻灯片内容
- 按幻灯片顺序组织
- 保持标题和内容结构

## 文件结构

```
uploads/                              # 文档文件存储目录
├── 云电脑教育场景解决方案.pptx
├── 智算一体机内部培训材料.pptx
├── 党政行业重点解决方案及案例.pptx
├── 法库县公安局融智算项目标杆案例.docx
├── 移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx
└── 辽宁省中小企业数字化转型政策.docx

scripts/                             # 脚本文件
├── document-parsers.js              # 文档解析器
├── document-content-extractor.js    # 内容提取器
├── document-viewer.js               # 文档查看器
└── resource-library.js              # 资源库功能

test-real-document-extraction.html   # 测试页面
document-viewer.html                 # 文档查看器页面
resource-library.html               # 资源库页面
```

## 测试和验证

### 测试页面
访问 `test-real-document-extraction.html` 进行功能测试：
- 系统状态检查
- 单个文档提取测试
- 批量提取测试
- 性能测试

### 功能验证
1. **内容准确性**: 确保提取的内容与原文档一致
2. **格式保持**: 验证 HTML 输出保持原有结构
3. **性能表现**: 测试不同大小文档的解析速度
4. **错误处理**: 验证异常情况的处理

## 注意事项

### 浏览器兼容性
- 需要现代浏览器支持 ES6+ 语法
- 需要支持 Fetch API 和 Promise
- 建议使用 Chrome、Firefox、Safari 等主流浏览器

### 文件访问限制
- 由于浏览器安全限制，需要通过 HTTP(S) 协议访问
- 本地文件协议 (file://) 可能有跨域限制
- 建议使用本地服务器进行测试

### 性能考虑
- 大文件解析可能需要较长时间
- 系统会自动缓存已解析的文档
- 建议对大文件进行分页或分块处理

## 错误处理

系统提供完善的错误处理机制：
- 文件不存在或无法访问
- 文档格式不支持
- 解析过程中的异常
- 网络连接问题

所有错误都会以用户友好的方式显示，并提供相应的解决建议。

## 扩展性

系统设计具有良好的扩展性：
- 可以轻松添加新的文档格式支持
- 可以自定义 HTML 输出格式
- 可以集成到其他系统中
- 支持插件化的解析器架构

## 总结

本系统实现了真正的文档内容提取功能，严格按照原始文档内容进行展示，不添加任何额外内容或进行总结。通过纯客户端技术实现，适合静态部署环境，为用户提供了高质量的文档预览体验。
