// 验证搜索"行业"关键词的逻辑
console.log('开始验证搜索逻辑...');

// 模拟 REAL_FILES_DATA
const REAL_FILES_DATA = [
    {
        filename: '云电脑教育场景解决方案.pptx',
        size: 25422197,
        type: 'pptx',
        title: '云电脑教育场景解决方案',
        description: '详细介绍云电脑在教育行业的应用场景、技术架构和实施方案',
        category: 'solution',
        tags: ['云电脑', '教育', '解决方案'],
        docType: '解决方案'
    },
    {
        filename: '智算一体机内部培训材料.pptx',
        size: 58290496,
        type: 'pptx',
        title: '智算一体机内部培训材料',
        description: '智算一体机产品的内部培训资料，包含产品特性、技术规格和应用指导',
        category: 'training',
        tags: ['智算一体机', '培训', '产品介绍'],
        docType: '培训资料'
    },
    {
        filename: '党政行业重点解决方案及案例.pptx',
        size: 1404128,
        type: 'pptx',
        title: '党政行业重点解决方案及案例',
        description: '党政行业数字化转型的重点解决方案和成功案例分析',
        category: 'case',
        tags: ['党政行业', '解决方案', '案例分析'],
        docType: '案例文档'
    },
    {
        filename: '辽宁省中小企业数字化转型政策.docx',
        size: 19423,
        type: 'docx',
        title: '辽宁省中小企业数字化转型政策',
        description: '辽宁省支持中小企业数字化转型的相关政策文件和实施细则',
        category: 'manual',
        tags: ['数字化转型', '政策文件', '中小企业'],
        docType: '政策文档'
    },
    {
        filename: '法库县公安局融智算项目标杆案例.docx',
        size: 16479,
        type: 'docx',
        title: '法库县公安局融智算项目标杆案例',
        description: '法库县公安局融智算项目的实施过程、技术方案和应用效果分析',
        category: 'case',
        tags: ['公安', '融智算', '标杆案例'],
        docType: '案例文档'
    },
    {
        filename: '移动云分地市、分行业、分客群待拓清单及产品拓展方案.pptx',
        size: 490617,
        type: 'pptx',
        title: '移动云分地市分行业分客群待拓清单及产品拓展方案',
        description: '移动云业务在不同地市、行业和客群的拓展策略和产品方案',
        category: 'solution',
        tags: ['移动云', '业务拓展', '产品方案'],
        docType: '业务方案'
    }
];

// 测试搜索逻辑
function testSearchLogic(query) {
    console.log(`\n=== 测试搜索关键词: "${query}" ===`);
    
    const searchResults = REAL_FILES_DATA.filter(file => {
        const searchText = `${file.title} ${file.description} ${file.tags.join(' ')}`.toLowerCase();
        const matches = searchText.includes(query.toLowerCase());
        
        console.log(`文件: ${file.title}`);
        console.log(`  搜索文本: ${searchText}`);
        console.log(`  匹配结果: ${matches ? '✅' : '❌'}`);
        
        return matches;
    });
    
    console.log(`\n搜索结果: 找到 ${searchResults.length} 个匹配文档`);
    searchResults.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.title} (${file.category})`);
    });
    
    return searchResults;
}

// 测试热门推荐逻辑
function testHotRecommendationLogic(searchQuery, searchResults) {
    console.log(`\n=== 测试热门推荐逻辑 ===`);
    console.log(`搜索关键词: "${searchQuery}"`);
    console.log(`搜索结果数量: ${searchResults.length}`);
    
    let hotFiles = [];
    
    if (searchQuery === '行业') {
        // 特殊处理：搜索"行业"时只显示党政行业文档
        const targetFile = REAL_FILES_DATA.find(f => f.filename === '党政行业重点解决方案及案例.pptx');
        if (targetFile && searchResults.includes(targetFile)) {
            hotFiles = [targetFile];
            console.log('✅ 应用特殊规则：只显示党政行业文档');
        } else {
            console.log('❌ 党政行业文档不在搜索结果中');
        }
    } else {
        // 其他搜索关键词：从搜索结果中选择热门推荐
        const priorityOrder = ['case', 'solution', 'manual', 'training'];
        
        for (const category of priorityOrder) {
            const categoryFiles = searchResults.filter(f => f.category === category);
            if (categoryFiles.length > 0) {
                hotFiles = categoryFiles.slice(0, 2);
                console.log(`✅ 按优先级选择 ${category} 分类的文档`);
                break;
            }
        }
        
        if (hotFiles.length === 0 && searchResults.length > 0) {
            hotFiles = searchResults.slice(0, 2);
            console.log('✅ 使用前2个搜索结果作为热门推荐');
        }
    }
    
    console.log(`热门推荐结果: ${hotFiles.length} 个文档`);
    hotFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.title}`);
    });
    
    return hotFiles;
}

// 执行测试
console.log('开始测试...\n');

// 测试1: 搜索"行业"
const industryResults = testSearchLogic('行业');
const industryHotRecommendations = testHotRecommendationLogic('行业', industryResults);

// 测试2: 搜索"云计算"
const cloudResults = testSearchLogic('云计算');
const cloudHotRecommendations = testHotRecommendationLogic('云计算', cloudResults);

// 测试3: 搜索"教育"
const educationResults = testSearchLogic('教育');
const educationHotRecommendations = testHotRecommendationLogic('教育', educationResults);

console.log('\n=== 测试总结 ===');
console.log(`搜索"行业": ${industryResults.length}个结果, ${industryHotRecommendations.length}个热门推荐`);
console.log(`搜索"云计算": ${cloudResults.length}个结果, ${cloudHotRecommendations.length}个热门推荐`);
console.log(`搜索"教育": ${educationResults.length}个结果, ${educationHotRecommendations.length}个热门推荐`);

// 验证需求
console.log('\n=== 需求验证 ===');
if (industryResults.length > 0 && industryHotRecommendations.length === 1 && 
    industryHotRecommendations[0].title === '党政行业重点解决方案及案例') {
    console.log('✅ 需求满足：搜索"行业"时，热门推荐只显示"党政行业重点解决方案及案例"');
} else {
    console.log('❌ 需求不满足：搜索"行业"时的热门推荐不符合要求');
    console.log(`  期望: 只显示"党政行业重点解决方案及案例"`);
    console.log(`  实际: ${industryHotRecommendations.map(f => f.title).join(', ')}`);
}
