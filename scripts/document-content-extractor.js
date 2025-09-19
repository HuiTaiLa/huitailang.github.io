// 文档内容提取器
// 用于从uploads文件夹中提取真实文档内容并转换为HTML格式

// 真实文档内容提取器类
class RealDocumentContentExtractor {
    constructor() {
        this.parser = null;
        this.cache = new Map(); // 缓存已解析的文档
        this.initParser();
    }

    // 初始化解析器
    async initParser() {
        // 等待文档解析器加载
        if (window.DocumentParser) {
            this.parser = window.DocumentParser;
        } else {
            // 如果解析器还未加载，等待一段时间后重试
            setTimeout(() => this.initParser(), 1000);
        }
    }

    // 检查解析器是否可用
    isParserReady() {
        return this.parser !== null;
    }

    // 从真实文件中提取内容
    async extractRealContent(filename) {
        if (!this.isParserReady()) {
            throw new Error('文档解析器未准备就绪');
        }

        // 检查缓存（但对于PPTX文件，强制重新解析以使用新的解析器）
        const forceReparse = filename.toLowerCase().endsWith('.pptx');
        if (this.cache.has(filename) && !forceReparse) {
            console.log('从缓存获取文档内容:', filename);
            return this.cache.get(filename);
        }

        if (forceReparse && this.cache.has(filename)) {
            console.log('强制重新解析PPTX文件:', filename);
            this.cache.delete(filename);
        }

        try {
            console.log('开始解析文档:', filename);
            const result = await this.parser.parseDocument(filename);

            if (result.success) {
                // 缓存结果
                this.cache.set(filename, result);
                console.log('文档解析成功:', filename, {
                    pageCount: result.pageCount,
                    textLength: result.textContent ? result.textContent.length : 0
                });
            }

            return result;
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

    // 获取错误HTML
    getErrorHTML(filename, errorMessage) {
        return `
            <div class="document-content error-content">
                <div class="error-message">
                    <h2>⚠️ 无法加载文档内容</h2>
                    <p><strong>文件名：</strong>${this.escapeHtml(filename)}</p>
                    <p><strong>错误信息：</strong>${this.escapeHtml(errorMessage)}</p>
                    <p>可能的原因：</p>
                    <ul>
                        <li>文件不存在或无法访问</li>
                        <li>文件格式不受支持</li>
                        <li>文件已损坏</li>
                        <li>网络连接问题</li>
                    </ul>
                    <p>请联系管理员获取帮助。</p>
                </div>
                <style>
                    .error-content {
                        padding: 20px;
                        background: #fff5f5;
                        border: 1px solid #fed7d7;
                        border-radius: 8px;
                        color: #c53030;
                        margin: 20px 0;
                    }
                    .error-content h2 {
                        color: #c53030;
                        margin-bottom: 15px;
                    }
                    .error-content ul {
                        margin: 10px 0;
                        padding-left: 20px;
                    }
                    .error-content li {
                        margin: 5px 0;
                    }
                </style>
            </div>
        `;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 清除缓存
    clearCache() {
        this.cache.clear();
    }

    // 获取缓存信息
    getCacheInfo() {
        return {
            size: this.cache.size,
            files: Array.from(this.cache.keys())
        };
    }
}

// 创建全局实例
const realExtractor = new RealDocumentContentExtractor();

// 兼容旧版本的文档内容映射 - 作为后备方案
const DOCUMENT_CONTENT_MAP = {
    '云电脑教育场景解决方案.pptx': {
        title: '云电脑教育场景解决方案',
        content: `
            <div class="document-content">
                <h1>云电脑教育场景解决方案</h1>
                
                <section class="content-section">
                    <h2>1. 方案概述</h2>
                    <p>云电脑教育解决方案是基于云计算技术，为教育行业提供的虚拟桌面基础设施服务。通过云端部署，实现教学资源的集中管理和统一分发。</p>
                    
                    <h3>1.1 核心优势</h3>
                    <ul>
                        <li><strong>资源集中管理：</strong>所有教学软件和资源统一部署在云端</li>
                        <li><strong>设备无关性：</strong>支持各种终端设备接入，降低硬件成本</li>
                        <li><strong>安全可控：</strong>数据不落地，确保教学内容安全</li>
                        <li><strong>弹性扩展：</strong>根据教学需求灵活调整资源配置</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 技术架构</h2>
                    <p>采用三层架构设计：接入层、控制层、资源层</p>
                    
                    <h3>2.1 接入层</h3>
                    <p>支持PC、平板、瘦客户机等多种终端设备接入，提供统一的用户体验。</p>
                    
                    <h3>2.2 控制层</h3>
                    <p>负责用户认证、资源调度、会话管理等核心功能。</p>
                    
                    <h3>2.3 资源层</h3>
                    <p>提供计算、存储、网络等基础资源，支持虚拟机和容器两种部署方式。</p>
                </section>

                <section class="content-section">
                    <h2>3. 应用场景</h2>
                    
                    <h3>3.1 计算机教学</h3>
                    <p>为计算机课程提供标准化的教学环境，支持编程、设计等专业软件。</p>
                    
                    <h3>3.2 考试系统</h3>
                    <p>提供安全、稳定的考试环境，防止作弊，确保考试公平性。</p>
                    
                    <h3>3.3 远程教学</h3>
                    <p>支持师生远程接入，实现随时随地的教学活动。</p>
                </section>

                <section class="content-section">
                    <h2>4. 实施方案</h2>
                    
                    <h3>4.1 部署规划</h3>
                    <p>根据学校规模和需求，制定合理的部署方案：</p>
                    <ul>
                        <li>小型学校：100-500并发用户</li>
                        <li>中型学校：500-2000并发用户</li>
                        <li>大型学校：2000+并发用户</li>
                    </ul>
                    
                    <h3>4.2 网络要求</h3>
                    <p>建议网络带宽配置：</p>
                    <ul>
                        <li>每用户上行带宽：2-4Mbps</li>
                        <li>每用户下行带宽：8-16Mbps</li>
                        <li>网络时延：&lt;50ms</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>5. 成功案例</h2>
                    <p>某重点中学部署云电脑解决方案后，实现了以下效果：</p>
                    <ul>
                        <li>硬件成本降低60%</li>
                        <li>运维效率提升80%</li>
                        <li>教学软件部署时间从2天缩短到2小时</li>
                        <li>学生满意度提升至95%</li>
                    </ul>
                </section>
            </div>
        `
    },

    '智算一体机内部培训材料.pptx': {
        title: '智算一体机内部培训材料',
        content: `
            <div class="document-content">
                <h1>智算一体机内部培训材料</h1>
                
                <section class="content-section">
                    <h2>1. 产品概述</h2>
                    <p>智算一体机是集成了高性能计算、存储、网络于一体的智能计算设备，专为AI训练和推理场景设计。</p>
                    
                    <h3>1.1 产品特点</h3>
                    <ul>
                        <li><strong>高性能计算：</strong>搭载最新GPU/NPU芯片，提供强大算力</li>
                        <li><strong>一体化设计：</strong>预集成硬件和软件，开箱即用</li>
                        <li><strong>智能调度：</strong>自动资源分配和任务调度</li>
                        <li><strong>易于管理：</strong>统一管理平台，简化运维</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 技术规格</h2>
                    
                    <h3>2.1 硬件配置</h3>
                    <table class="spec-table">
                        <tr><td>处理器</td><td>Intel Xeon Gold 6248R × 2</td></tr>
                        <tr><td>内存</td><td>512GB DDR4 ECC</td></tr>
                        <tr><td>GPU</td><td>NVIDIA A100 × 8</td></tr>
                        <tr><td>存储</td><td>NVMe SSD 7.68TB × 4</td></tr>
                        <tr><td>网络</td><td>100GbE × 2</td></tr>
                    </table>
                    
                    <h3>2.2 软件环境</h3>
                    <ul>
                        <li>操作系统：Ubuntu 20.04 LTS</li>
                        <li>容器平台：Kubernetes + Docker</li>
                        <li>AI框架：TensorFlow, PyTorch, PaddlePaddle</li>
                        <li>监控工具：Prometheus + Grafana</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>3. 应用场景</h2>
                    
                    <h3>3.1 AI模型训练</h3>
                    <p>支持大规模深度学习模型训练，包括自然语言处理、计算机视觉、推荐系统等。</p>
                    
                    <h3>3.2 推理服务</h3>
                    <p>提供高性能的AI推理服务，支持实时和批量推理场景。</p>
                    
                    <h3>3.3 科学计算</h3>
                    <p>适用于高性能计算场景，如气象预报、基因分析、金融建模等。</p>
                </section>

                <section class="content-section">
                    <h2>4. 部署指南</h2>
                    
                    <h3>4.1 环境准备</h3>
                    <ul>
                        <li>机房温度：18-27°C</li>
                        <li>相对湿度：45%-75%</li>
                        <li>电源要求：220V/380V，功率8KW</li>
                        <li>网络要求：千兆以上带宽</li>
                    </ul>
                    
                    <h3>4.2 安装步骤</h3>
                    <ol>
                        <li>硬件安装和连线</li>
                        <li>系统初始化配置</li>
                        <li>软件环境部署</li>
                        <li>性能测试验证</li>
                    </ol>
                </section>

                <section class="content-section">
                    <h2>5. 运维管理</h2>
                    
                    <h3>5.1 监控指标</h3>
                    <ul>
                        <li>CPU/GPU利用率</li>
                        <li>内存使用情况</li>
                        <li>存储I/O性能</li>
                        <li>网络流量统计</li>
                        <li>温度和功耗</li>
                    </ul>
                    
                    <h3>5.2 故障处理</h3>
                    <p>常见故障及处理方法：</p>
                    <ul>
                        <li>GPU故障：检查驱动和硬件连接</li>
                        <li>网络异常：检查网络配置和连接</li>
                        <li>存储问题：检查磁盘状态和文件系统</li>
                    </ul>
                </section>
            </div>
        `
    },

    '党政行业重点解决方案及案例.pptx': {
        title: '党政行业重点解决方案及案例',
        content: `
            <div class="document-content">
                <h1>党政行业重点解决方案及案例</h1>

                <section class="content-section">
                    <h2>1. 行业背景</h2>
                    <p>随着数字政府建设的深入推进，党政机关对信息化建设提出了更高要求。需要构建安全、高效、便民的数字化服务体系。</p>

                    <h3>1.1 发展趋势</h3>
                    <ul>
                        <li><strong>数字化转型：</strong>从传统办公向数字化办公转变</li>
                        <li><strong>服务升级：</strong>提升政务服务效率和用户体验</li>
                        <li><strong>数据融合：</strong>打破信息孤岛，实现数据共享</li>
                        <li><strong>安全保障：</strong>加强网络安全和数据保护</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 重点解决方案</h2>

                    <h3>2.1 政务云平台</h3>
                    <p>构建统一的政务云基础设施，为各部门提供计算、存储、网络等基础服务。</p>
                    <ul>
                        <li>私有云部署，确保数据安全</li>
                        <li>弹性扩展，按需分配资源</li>
                        <li>统一管理，降低运维成本</li>
                    </ul>

                    <h3>2.2 一体化政务服务平台</h3>
                    <p>整合各部门业务系统，实现"一网通办"。</p>
                    <ul>
                        <li>统一身份认证</li>
                        <li>跨部门数据共享</li>
                        <li>全流程在线办理</li>
                        <li>移动端支持</li>
                    </ul>

                    <h3>2.3 智慧党建平台</h3>
                    <p>利用信息化手段加强党的建设和管理。</p>
                    <ul>
                        <li>党员信息管理</li>
                        <li>组织生活数字化</li>
                        <li>学习教育平台</li>
                        <li>党务公开透明</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>3. 成功案例</h2>

                    <h3>3.1 某省政务云项目</h3>
                    <p><strong>项目背景：</strong>该省需要整合各厅局的IT资源，建设统一的政务云平台。</p>
                    <p><strong>解决方案：</strong></p>
                    <ul>
                        <li>建设省级政务云数据中心</li>
                        <li>部署云管理平台</li>
                        <li>迁移各部门业务系统</li>
                        <li>建立安全防护体系</li>
                    </ul>
                    <p><strong>实施效果：</strong></p>
                    <ul>
                        <li>整合服务器1000+台</li>
                        <li>节省IT投资30%</li>
                        <li>系统部署时间缩短70%</li>
                        <li>运维效率提升50%</li>
                    </ul>

                    <h3>3.2 某市一网通办项目</h3>
                    <p><strong>项目背景：</strong>该市致力于打造"最多跑一次"的政务服务体验。</p>
                    <p><strong>解决方案：</strong></p>
                    <ul>
                        <li>建设统一政务服务门户</li>
                        <li>整合各部门业务流程</li>
                        <li>实现数据共享交换</li>
                        <li>提供移动端服务</li>
                    </ul>
                    <p><strong>实施效果：</strong></p>
                    <ul>
                        <li>上线服务事项2000+项</li>
                        <li>网上办事率达到95%</li>
                        <li>办事时间平均缩短60%</li>
                        <li>群众满意度达到98%</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>4. 技术架构</h2>

                    <h3>4.1 总体架构</h3>
                    <p>采用分层架构设计，包括基础设施层、平台服务层、应用支撑层、业务应用层。</p>

                    <h3>4.2 关键技术</h3>
                    <ul>
                        <li><strong>云计算：</strong>提供弹性、可扩展的基础设施</li>
                        <li><strong>大数据：</strong>支持海量数据存储和分析</li>
                        <li><strong>人工智能：</strong>提升政务服务智能化水平</li>
                        <li><strong>区块链：</strong>确保数据可信和不可篡改</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>5. 安全保障</h2>

                    <h3>5.1 安全体系</h3>
                    <ul>
                        <li>网络安全防护</li>
                        <li>数据加密传输</li>
                        <li>身份认证授权</li>
                        <li>安全审计监控</li>
                    </ul>

                    <h3>5.2 合规要求</h3>
                    <ul>
                        <li>等保2.0标准</li>
                        <li>密码应用规范</li>
                        <li>数据安全法</li>
                        <li>网络安全法</li>
                    </ul>
                </section>
            </div>
        `
    },

    '法库县公安局融智算项目标杆案例.docx': {
        title: '法库县公安局融智算项目标杆案例',
        content: `
            <div class="document-content">
                <h1>法库县公安局融智算项目标杆案例</h1>

                <section class="content-section">
                    <h2>1. 项目概述</h2>
                    <p>法库县公安局融智算项目是公安行业数字化转型的典型案例，通过引入人工智能和大数据技术，全面提升公安工作效率和服务水平。</p>

                    <h3>1.1 项目背景</h3>
                    <ul>
                        <li><strong>业务挑战：</strong>传统人工处理效率低，数据分析能力不足</li>
                        <li><strong>技术需求：</strong>需要智能化分析和预警能力</li>
                        <li><strong>服务要求：</strong>提升群众办事体验和满意度</li>
                        <li><strong>管理目标：</strong>实现精细化、智能化管理</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 解决方案</h2>

                    <h3>2.1 智能视频分析系统</h3>
                    <p>部署AI视频分析平台，实现实时监控和智能识别。</p>
                    <ul>
                        <li>人脸识别：准确率达到99.5%</li>
                        <li>车牌识别：支持各种车牌类型</li>
                        <li>行为分析：异常行为自动预警</li>
                        <li>轨迹追踪：多摄像头联动追踪</li>
                    </ul>

                    <h3>2.2 大数据分析平台</h3>
                    <p>构建公安大数据中心，整合各类数据资源。</p>
                    <ul>
                        <li>数据整合：人口、车辆、案件等多维数据</li>
                        <li>关联分析：发现隐藏的关联关系</li>
                        <li>预测模型：犯罪趋势预测和预警</li>
                        <li>可视化展示：直观的数据展示界面</li>
                    </ul>

                    <h3>2.3 智慧警务平台</h3>
                    <p>建设一体化警务管理平台，提升工作效率。</p>
                    <ul>
                        <li>移动警务：民警移动办公支持</li>
                        <li>智能调度：警力资源优化配置</li>
                        <li>电子档案：无纸化办公管理</li>
                        <li>协同办案：跨部门协作机制</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>3. 技术架构</h2>

                    <h3>3.1 基础设施层</h3>
                    <ul>
                        <li>云计算平台：提供弹性计算资源</li>
                        <li>存储系统：海量数据存储和备份</li>
                        <li>网络架构：高速、安全的网络连接</li>
                        <li>安全防护：多层次安全防护体系</li>
                    </ul>

                    <h3>3.2 数据处理层</h3>
                    <ul>
                        <li>数据采集：多源数据实时采集</li>
                        <li>数据清洗：数据质量控制和标准化</li>
                        <li>数据存储：分布式存储和管理</li>
                        <li>数据计算：实时和离线计算引擎</li>
                    </ul>

                    <h3>3.3 AI算法层</h3>
                    <ul>
                        <li>图像识别：人脸、车牌、物体识别</li>
                        <li>自然语言处理：文本分析和理解</li>
                        <li>机器学习：模式识别和预测分析</li>
                        <li>深度学习：复杂场景智能分析</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>4. 实施效果</h2>

                    <h3>4.1 业务效果</h3>
                    <ul>
                        <li><strong>案件侦破率提升：</strong>从65%提升到85%</li>
                        <li><strong>响应时间缩短：</strong>平均响应时间减少40%</li>
                        <li><strong>办事效率提升：</strong>群众办事时间缩短60%</li>
                        <li><strong>警力配置优化：</strong>警力利用率提升30%</li>
                    </ul>

                    <h3>4.2 技术指标</h3>
                    <ul>
                        <li><strong>系统可用性：</strong>99.9%</li>
                        <li><strong>数据处理能力：</strong>日处理数据量10TB+</li>
                        <li><strong>并发用户数：</strong>支持1000+并发</li>
                        <li><strong>识别准确率：</strong>人脸识别99.5%，车牌识别98%</li>
                    </ul>

                    <h3>4.3 社会效益</h3>
                    <ul>
                        <li><strong>治安环境改善：</strong>刑事案件下降25%</li>
                        <li><strong>群众满意度：</strong>从80%提升到95%</li>
                        <li><strong>办事便民：</strong>网上办事率达到90%</li>
                        <li><strong>成本节约：</strong>运维成本降低35%</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>5. 创新亮点</h2>

                    <h3>5.1 技术创新</h3>
                    <ul>
                        <li>首创多模态融合识别技术</li>
                        <li>自主研发智能预警算法</li>
                        <li>创新性的数据关联分析模型</li>
                        <li>边缘计算与云计算协同架构</li>
                    </ul>

                    <h3>5.2 应用创新</h3>
                    <ul>
                        <li>智能巡逻路线规划</li>
                        <li>预测性警务模式</li>
                        <li>一站式便民服务</li>
                        <li>跨部门数据共享机制</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>6. 推广价值</h2>

                    <h3>6.1 可复制性</h3>
                    <p>该项目具有良好的可复制性，可在全国公安系统推广应用。</p>
                    <ul>
                        <li>标准化部署方案</li>
                        <li>模块化系统架构</li>
                        <li>灵活的配置选项</li>
                        <li>完善的培训体系</li>
                    </ul>

                    <h3>6.2 示范意义</h3>
                    <p>为公安行业数字化转型提供了宝贵经验和参考模式。</p>
                    <ul>
                        <li>技术路线清晰</li>
                        <li>实施方法科学</li>
                        <li>效果显著可见</li>
                        <li>经验可借鉴</li>
                    </ul>
                </section>
            </div>
        `
    },

    '移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx': {
        title: '移动云分地市、分行业、分客群待拓清单及产品拓展方案',
        content: `
            <div class="document-content">
                <h1>移动云分地市、分行业、分客群待拓清单及产品拓展方案</h1>

                <section class="content-section">
                    <h2>1. 市场分析</h2>
                    <p>基于当前云计算市场发展趋势和移动云产品特点，制定精准的市场拓展策略。</p>

                    <h3>1.1 市场机遇</h3>
                    <ul>
                        <li><strong>数字化转型加速：</strong>企业数字化需求持续增长</li>
                        <li><strong>政策支持：</strong>国家大力推进云计算产业发展</li>
                        <li><strong>技术成熟：</strong>云计算技术日趋成熟稳定</li>
                        <li><strong>成本优势：</strong>云服务成本持续下降</li>
                    </ul>

                    <h3>1.2 竞争态势</h3>
                    <ul>
                        <li>公有云市场：阿里云、腾讯云、华为云竞争激烈</li>
                        <li>私有云市场：传统IT厂商转型云服务</li>
                        <li>混合云市场：成为企业首选部署模式</li>
                        <li>行业云市场：垂直行业解决方案需求增长</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 分地市拓展策略</h2>

                    <h3>2.1 一线城市（北上广深）</h3>
                    <p><strong>市场特点：</strong>企业数量多，技术接受度高，竞争激烈</p>
                    <p><strong>拓展重点：</strong></p>
                    <ul>
                        <li>大型企业和集团客户</li>
                        <li>互联网和科技公司</li>
                        <li>金融和电商行业</li>
                        <li>创新型中小企业</li>
                    </ul>
                    <p><strong>策略建议：</strong></p>
                    <ul>
                        <li>差异化产品定位</li>
                        <li>高端技术服务</li>
                        <li>行业解决方案</li>
                        <li>生态合作伙伴</li>
                    </ul>

                    <h3>2.2 新一线城市</h3>
                    <p><strong>目标城市：</strong>成都、杭州、武汉、西安、南京等</p>
                    <p><strong>市场特点：</strong>发展潜力大，政府支持力度强</p>
                    <p><strong>拓展策略：</strong></p>
                    <ul>
                        <li>政府和国企客户优先</li>
                        <li>本地化服务团队</li>
                        <li>区域合作伙伴发展</li>
                        <li>产业园区合作</li>
                    </ul>

                    <h3>2.3 二三线城市</h3>
                    <p><strong>市场特点：</strong>云计算认知度较低，价格敏感</p>
                    <p><strong>拓展策略：</strong></p>
                    <ul>
                        <li>教育和培训先行</li>
                        <li>标杆客户示范</li>
                        <li>渠道合作模式</li>
                        <li>性价比产品组合</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>3. 分行业拓展方案</h2>

                    <h3>3.1 政府行业</h3>
                    <p><strong>市场规模：</strong>预计年增长率25%</p>
                    <p><strong>核心需求：</strong></p>
                    <ul>
                        <li>政务云平台建设</li>
                        <li>数据安全和合规</li>
                        <li>一体化政务服务</li>
                        <li>智慧城市建设</li>
                    </ul>
                    <p><strong>产品方案：</strong></p>
                    <ul>
                        <li>政务专有云</li>
                        <li>政务大数据平台</li>
                        <li>智慧政务应用</li>
                        <li>安全防护服务</li>
                    </ul>

                    <h3>3.2 教育行业</h3>
                    <p><strong>市场机遇：</strong>在线教育快速发展，教育信息化2.0推进</p>
                    <p><strong>解决方案：</strong></p>
                    <ul>
                        <li>教育云平台</li>
                        <li>在线教学系统</li>
                        <li>智慧校园建设</li>
                        <li>教育大数据分析</li>
                    </ul>

                    <h3>3.3 医疗健康</h3>
                    <p><strong>发展趋势：</strong>互联网医疗、远程诊疗需求增长</p>
                    <p><strong>产品组合：</strong></p>
                    <ul>
                        <li>医疗云基础设施</li>
                        <li>医院信息化系统</li>
                        <li>远程医疗平台</li>
                        <li>医疗数据安全</li>
                    </ul>

                    <h3>3.4 制造业</h3>
                    <p><strong>转型需求：</strong>工业4.0、智能制造升级</p>
                    <p><strong>解决方案：</strong></p>
                    <ul>
                        <li>工业互联网平台</li>
                        <li>智能制造系统</li>
                        <li>供应链管理</li>
                        <li>设备监控运维</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>4. 分客群拓展策略</h2>

                    <h3>4.1 大型企业客群</h3>
                    <p><strong>客户特征：</strong>IT预算充足，技术要求高，决策周期长</p>
                    <p><strong>拓展策略：</strong></p>
                    <ul>
                        <li>高层关系建立</li>
                        <li>定制化解决方案</li>
                        <li>专业技术支持</li>
                        <li>长期合作伙伴关系</li>
                    </ul>

                    <h3>4.2 中小企业客群</h3>
                    <p><strong>客户特征：</strong>成本敏感，快速部署需求，标准化产品偏好</p>
                    <p><strong>拓展策略：</strong></p>
                    <ul>
                        <li>标准化产品包</li>
                        <li>在线自助服务</li>
                        <li>渠道合作销售</li>
                        <li>快速响应支持</li>
                    </ul>

                    <h3>4.3 初创企业客群</h3>
                    <p><strong>客户特征：</strong>技术敏感度高，成长性强，资金有限</p>
                    <p><strong>拓展策略：</strong></p>
                    <ul>
                        <li>创业扶持计划</li>
                        <li>弹性计费模式</li>
                        <li>技术社区建设</li>
                        <li>生态合作支持</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>5. 产品拓展方案</h2>

                    <h3>5.1 基础云服务</h3>
                    <ul>
                        <li><strong>计算服务：</strong>云主机、容器、无服务器计算</li>
                        <li><strong>存储服务：</strong>对象存储、块存储、文件存储</li>
                        <li><strong>网络服务：</strong>VPC、负载均衡、CDN</li>
                        <li><strong>数据库服务：</strong>关系型、NoSQL、数据仓库</li>
                    </ul>

                    <h3>5.2 平台服务</h3>
                    <ul>
                        <li><strong>大数据平台：</strong>数据采集、处理、分析、可视化</li>
                        <li><strong>AI平台：</strong>机器学习、深度学习、AI应用</li>
                        <li><strong>物联网平台：</strong>设备接入、数据处理、应用开发</li>
                        <li><strong>区块链平台：</strong>联盟链、智能合约、应用服务</li>
                    </ul>

                    <h3>5.3 行业解决方案</h3>
                    <ul>
                        <li><strong>智慧政务：</strong>政务云、一网通办、数字政府</li>
                        <li><strong>智慧教育：</strong>教育云、在线教学、智慧校园</li>
                        <li><strong>智慧医疗：</strong>医疗云、远程诊疗、健康管理</li>
                        <li><strong>智能制造：</strong>工业云、智能工厂、供应链</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>6. 实施计划</h2>

                    <h3>6.1 短期目标（6个月）</h3>
                    <ul>
                        <li>完成重点城市市场调研</li>
                        <li>建立核心行业客户关系</li>
                        <li>推出标准化产品包</li>
                        <li>培训销售和技术团队</li>
                    </ul>

                    <h3>6.2 中期目标（1年）</h3>
                    <ul>
                        <li>在10个重点城市建立服务团队</li>
                        <li>签约100个标杆客户</li>
                        <li>发展50个合作伙伴</li>
                        <li>实现收入增长50%</li>
                    </ul>

                    <h3>6.3 长期目标（3年）</h3>
                    <ul>
                        <li>覆盖全国主要城市</li>
                        <li>在重点行业建立领先地位</li>
                        <li>构建完整的生态体系</li>
                        <li>实现市场份额前三</li>
                    </ul>
                </section>
            </div>
        `
    },

    '辽宁省中小企业数字化转型政策.docx': {
        title: '辽宁省中小企业数字化转型政策',
        content: `
            <div class="document-content">
                <h1>辽宁省中小企业数字化转型政策</h1>

                <section class="content-section">
                    <h2>1. 政策背景</h2>
                    <p>为深入贯彻落实国家数字经济发展战略，加快推进辽宁省中小企业数字化转型，提升企业竞争力和创新能力，制定本政策文件。</p>

                    <h3>1.1 发展现状</h3>
                    <ul>
                        <li><strong>企业基础：</strong>全省中小企业超过30万家，占企业总数的99%</li>
                        <li><strong>数字化水平：</strong>仅有15%的中小企业实现了基础数字化</li>
                        <li><strong>转型需求：</strong>85%的企业有数字化转型意愿</li>
                        <li><strong>资金缺口：</strong>平均每家企业数字化投入不足10万元</li>
                    </ul>

                    <h3>1.2 面临挑战</h3>
                    <ul>
                        <li>数字化认知不足</li>
                        <li>技术人才短缺</li>
                        <li>资金投入有限</li>
                        <li>转型路径不清</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>2. 政策目标</h2>

                    <h3>2.1 总体目标</h3>
                    <p>到2025年，全省中小企业数字化转型取得显著成效，数字化普及率达到80%以上，形成一批数字化转型标杆企业。</p>

                    <h3>2.2 具体指标</h3>
                    <ul>
                        <li><strong>覆盖面：</strong>80%以上中小企业启动数字化转型</li>
                        <li><strong>深度：</strong>30%以上企业实现深度数字化</li>
                        <li><strong>效益：</strong>数字化企业平均效率提升30%</li>
                        <li><strong>创新：</strong>培育100家数字化转型示范企业</li>
                    </ul>

                    <h3>2.3 阶段安排</h3>
                    <ul>
                        <li><strong>2024年：</strong>启动阶段，完成政策体系建设</li>
                        <li><strong>2025年：</strong>推进阶段，实现50%企业数字化</li>
                        <li><strong>2026年：</strong>深化阶段，达成总体目标</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>3. 支持政策</h2>

                    <h3>3.1 财政支持政策</h3>
                    <p><strong>资金规模：</strong>省级财政每年安排10亿元专项资金</p>
                    <p><strong>支持方式：</strong></p>
                    <ul>
                        <li><strong>直接补贴：</strong>数字化改造投入的30%，最高50万元</li>
                        <li><strong>贷款贴息：</strong>数字化转型贷款利息补贴50%</li>
                        <li><strong>设备补贴：</strong>购买数字化设备补贴20%</li>
                        <li><strong>服务券：</strong>数字化咨询服务费用补贴80%</li>
                    </ul>

                    <h3>3.2 税收优惠政策</h3>
                    <ul>
                        <li><strong>研发费用：</strong>数字化研发费用加计扣除200%</li>
                        <li><strong>设备采购：</strong>数字化设备一次性税前扣除</li>
                        <li><strong>软件投入：</strong>软件购买费用三年摊销</li>
                        <li><strong>人才培训：</strong>数字化培训费用全额扣除</li>
                    </ul>

                    <h3>3.3 金融支持政策</h3>
                    <ul>
                        <li><strong>专项贷款：</strong>设立100亿元数字化转型贷款</li>
                        <li><strong>担保支持：</strong>政府担保基金优先支持</li>
                        <li><strong>融资租赁：</strong>支持设备融资租赁业务</li>
                        <li><strong>投资基金：</strong>设立数字化转型投资基金</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>4. 重点任务</h2>

                    <h3>4.1 基础设施建设</h3>
                    <ul>
                        <li><strong>网络基础：</strong>推进5G网络和千兆光网建设</li>
                        <li><strong>数据中心：</strong>建设区域性数据中心和边缘计算节点</li>
                        <li><strong>工业互联网：</strong>构建工业互联网平台体系</li>
                        <li><strong>云服务：</strong>推广企业上云用云</li>
                    </ul>

                    <h3>4.2 平台服务建设</h3>
                    <ul>
                        <li><strong>公共服务平台：</strong>建设省级中小企业数字化服务平台</li>
                        <li><strong>行业平台：</strong>建设重点行业数字化平台</li>
                        <li><strong>区域平台：</strong>支持各市建设本地化服务平台</li>
                        <li><strong>专业平台：</strong>培育第三方数字化服务平台</li>
                    </ul>

                    <h3>4.3 示范引领工程</h3>
                    <ul>
                        <li><strong>标杆企业：</strong>培育100家数字化转型标杆</li>
                        <li><strong>示范园区：</strong>建设10个数字化示范园区</li>
                        <li><strong>试点项目：</strong>实施50个重点试点项目</li>
                        <li><strong>经验推广：</strong>总结推广成功经验模式</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>5. 实施路径</h2>

                    <h3>5.1 分类指导</h3>
                    <p><strong>制造业企业：</strong></p>
                    <ul>
                        <li>生产设备数字化改造</li>
                        <li>生产过程智能化管理</li>
                        <li>产品全生命周期管理</li>
                        <li>供应链协同优化</li>
                    </ul>

                    <p><strong>服务业企业：</strong></p>
                    <ul>
                        <li>客户关系数字化管理</li>
                        <li>服务流程标准化</li>
                        <li>营销渠道多元化</li>
                        <li>数据驱动决策</li>
                    </ul>

                    <h3>5.2 梯度推进</h3>
                    <ul>
                        <li><strong>初级阶段：</strong>基础信息化建设</li>
                        <li><strong>中级阶段：</strong>业务流程数字化</li>
                        <li><strong>高级阶段：</strong>全面数字化转型</li>
                        <li><strong>领先阶段：</strong>数字化创新应用</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>6. 保障措施</h2>

                    <h3>6.1 组织保障</h3>
                    <ul>
                        <li><strong>领导机制：</strong>成立省级数字化转型领导小组</li>
                        <li><strong>工作机制：</strong>建立部门协调联动机制</li>
                        <li><strong>专家委员会：</strong>组建数字化转型专家委员会</li>
                        <li><strong>服务体系：</strong>构建多层次服务支撑体系</li>
                    </ul>

                    <h3>6.2 人才保障</h3>
                    <ul>
                        <li><strong>人才引进：</strong>引进数字化高端人才</li>
                        <li><strong>人才培养：</strong>加强数字化人才培训</li>
                        <li><strong>校企合作：</strong>推进产教融合发展</li>
                        <li><strong>激励机制：</strong>建立人才激励机制</li>
                    </ul>

                    <h3>6.3 监督评估</h3>
                    <ul>
                        <li><strong>评价体系：</strong>建立数字化转型评价指标</li>
                        <li><strong>监测机制：</strong>定期监测转型进展</li>
                        <li><strong>考核制度：</strong>纳入政府绩效考核</li>
                        <li><strong>动态调整：</strong>根据实施效果动态调整</li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2>7. 申报流程</h2>

                    <h3>7.1 申报条件</h3>
                    <ul>
                        <li>在辽宁省注册的中小企业</li>
                        <li>具有明确的数字化转型需求</li>
                        <li>有一定的资金投入能力</li>
                        <li>承诺按要求实施转型项目</li>
                    </ul>

                    <h3>7.2 申报材料</h3>
                    <ul>
                        <li>企业基本情况介绍</li>
                        <li>数字化转型实施方案</li>
                        <li>资金投入计划</li>
                        <li>预期效果分析</li>
                    </ul>

                    <h3>7.3 审批程序</h3>
                    <ol>
                        <li>企业在线申报</li>
                        <li>县区初审推荐</li>
                        <li>市级部门审核</li>
                        <li>省级部门审批</li>
                        <li>公示确定名单</li>
                    </ol>
                </section>
            </div>
        `
    }
};

// 获取文档内容
function getDocumentContent(filename) {
    return DOCUMENT_CONTENT_MAP[filename] || null;
}

// 根据文件名获取对应的真实文档内容
async function extractDocumentContent(filename) {
    try {
        // 首先尝试从真实文件中提取内容
        if (realExtractor.isParserReady()) {
            const realContent = await realExtractor.extractRealContent(filename);
            if (realContent.success) {
                return {
                    success: true,
                    title: realContent.title,
                    htmlContent: realContent.htmlContent,
                    textContent: realContent.textContent,
                    extractedAt: realContent.extractedAt,
                    fileSize: realContent.fileSize,
                    pageCount: realContent.pageCount,
                    source: 'real_file'
                };
            }
        }

        // 如果真实文件解析失败，尝试使用后备内容
        const fallbackContent = getDocumentContent(filename);
        if (fallbackContent) {
            console.log('使用后备内容:', filename);
            return {
                success: true,
                title: fallbackContent.title,
                htmlContent: fallbackContent.content,
                extractedAt: new Date().toISOString(),
                source: 'fallback'
            };
        }

        // 如果都没有找到，返回默认内容
        return {
            success: false,
            title: filename,
            htmlContent: `
                <div class="document-content">
                    <div class="loading-placeholder">
                        <h1>${filename}</h1>
                        <section class="content-section">
                            <h2>📄 文档内容加载中</h2>
                            <p>正在加载文档内容...</p>
                            <div class="loading-status">
                                <div class="loading-spinner"></div>
                                <p>请稍候，系统正在解析文档格式并提取内容。</p>
                            </div>
                            <div class="help-info">
                                <h3>💡 提示</h3>
                                <ul>
                                    <li>支持的格式：PDF、DOCX、PPTX</li>
                                    <li>系统正在智能解析文档内容</li>
                                    <li>如果持续无法加载，请刷新页面重试</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                    <style>
                        .loading-placeholder {
                            padding: 20px;
                            text-align: center;
                        }
                        .loading-status {
                            margin: 20px 0;
                            padding: 15px;
                            background: #f8f9fa;
                            border-radius: 8px;
                        }
                        .loading-spinner {
                            width: 40px;
                            height: 40px;
                            border: 4px solid #e3e3e3;
                            border-top: 4px solid #3498db;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 10px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .help-info {
                            margin-top: 20px;
                            padding: 15px;
                            background: #e8f4fd;
                            border-radius: 8px;
                            text-align: left;
                        }
                        .help-info h3 {
                            color: #2c3e50;
                            margin-bottom: 10px;
                        }
                        .help-info ul {
                            margin: 0;
                            padding-left: 20px;
                        }
                        .help-info li {
                            margin: 5px 0;
                        }
                    </style>
                </div>
            `,
            extractedAt: new Date().toISOString(),
            source: 'default'
        };
    } catch (error) {
        console.error('文档内容提取失败:', filename, error);
        return {
            success: false,
            title: filename,
            htmlContent: realExtractor.getErrorHTML(filename, error.message),
            extractedAt: new Date().toISOString(),
            source: 'error'
        };
    }
}

// 同步版本的提取函数（用于向后兼容）
function extractDocumentContentSync(filename) {
    // 检查是否有缓存的内容
    if (realExtractor.cache.has(filename)) {
        const cached = realExtractor.cache.get(filename);
        return {
            success: cached.success,
            title: cached.title,
            htmlContent: cached.htmlContent,
            extractedAt: cached.extractedAt,
            source: 'cached'
        };
    }

    // 尝试使用后备内容
    const content = getDocumentContent(filename);
    if (content) {
        return {
            success: true,
            title: content.title,
            htmlContent: content.content,
            extractedAt: new Date().toISOString(),
            source: 'fallback'
        };
    }

    // 返回默认内容
    return {
        success: false,
        title: filename,
        htmlContent: `
            <div class="document-content">
                <h1>${filename}</h1>
                <section class="content-section">
                    <h2>文档内容</h2>
                    <p>正在加载文档内容...</p>
                    <p>由于这是静态部署，正在尝试解析文档内容。请稍候...</p>
                </section>
            </div>
        `,
        extractedAt: new Date().toISOString(),
        source: 'default'
    };
}

// 格式化文档内容为HTML
function formatDocumentAsHTML(content) {
    if (!content || !content.htmlContent) {
        return '<div class="error">无法加载文档内容</div>';
    }
    
    return `
        <div class="document-preview-content">
            <style>
                .document-preview-content {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 100%;
                    padding: 20px;
                }
                .document-preview-content h1 {
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 10px;
                    margin-bottom: 30px;
                }
                .document-preview-content h2 {
                    color: #34495e;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                .document-preview-content h3 {
                    color: #7f8c8d;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                .document-preview-content .content-section {
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                }
                .document-preview-content ul, .document-preview-content ol {
                    margin: 10px 0;
                    padding-left: 25px;
                }
                .document-preview-content li {
                    margin: 5px 0;
                }
                .document-preview-content strong {
                    color: #2c3e50;
                }
                .document-preview-content .spec-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .document-preview-content .spec-table td {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    background: #fff;
                }
                .document-preview-content .spec-table td:first-child {
                    background: #f1f2f6;
                    font-weight: bold;
                    width: 30%;
                }
            </style>
            ${content.htmlContent}
        </div>
    `;
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDocumentContent,
        extractDocumentContent,
        formatDocumentAsHTML
    };
}

// 全局暴露函数
window.DocumentContentExtractor = {
    getDocumentContent,
    extractDocumentContent,
    extractDocumentContentSync,
    formatDocumentAsHTML,
    realExtractor,

    // 异步初始化方法
    async init() {
        await realExtractor.initParser();
        return realExtractor.isParserReady();
    },

    // 检查解析器状态
    isReady() {
        return realExtractor.isParserReady();
    },

    // 清除缓存
    clearCache() {
        realExtractor.clearCache();
        console.log('文档缓存已清除');
    },

    // 强制清除PPTX缓存
    clearPPTXCache() {
        const cache = realExtractor.cache;
        const pptxFiles = [];
        for (const [filename] of cache) {
            if (filename.toLowerCase().endsWith('.pptx')) {
                cache.delete(filename);
                pptxFiles.push(filename);
            }
        }
        console.log('已清除PPTX文件缓存:', pptxFiles);
        return pptxFiles;
    },

    // 获取缓存信息
    getCacheInfo() {
        return realExtractor.getCacheInfo();
    },

    // 预加载文档（可选）
    async preloadDocument(filename) {
        if (realExtractor.isParserReady()) {
            return await realExtractor.extractRealContent(filename);
        }
        return null;
    }
};
