// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('en-US', options);
}

// 设置当前年份
function setCurrentYear() {
    document.getElementById('current-year').textContent = 
        new Date().getFullYear();
}

// 文章数据
const articles = [
    {
        id: 1,
        title: "新能源汽车行业分析",
        date: "2024年3月20日",
        coreViewpoints: "1. 上游资源供需趋稳<br>2. 中游电池技术创新加速<br>3. 下游整车竞争加剧<br>4. 建议关注核心技术企业",
        comments: "产业链分析全面，技术突破机会值得关注",
        pdfUrl: "#",
        fileSize: "2.4 MB"
    },
    {
        id: 2,
        title: "人工智能芯片行业报告",
        date: "2024年3月18日",
        coreViewpoints: "1. 市场规模快速增长<br>2. 边缘计算需求多元化<br>3. 国内厂商技术突破<br>4. 关注全栈解决方案",
        comments: "趋势把握准确，供应链分析可加强",
        pdfUrl: "#",
        fileSize: "3.1 MB"
    },
    {
        id: 3,
        title: "医疗设备政策影响",
        date: "2024年3月15日",
        coreViewpoints: "1. 集采政策范围扩大<br>2. 创新器械暂不纳入<br>3. 国产替代加速<br>4. 关注持续创新企业",
        comments: "政策分析到位，需关注地方执行差异",
        pdfUrl: "#",
        fileSize: "1.8 MB"
    }
];

// 显示文章
function displayArticles() {
    const container = document.getElementById('articles-container');
    
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = '<p>暂无报告</p>';
        return;
    }
    
    container.innerHTML = articles.map((article, index) => `
        <div class="article-card">
            <div class="article-header">
                <h3 class="article-title">${index + 1}. ${article.title}</h3>
                <div class="article-date">📅 ${article.date}</div>
            </div>
            
            <div class="section">
                <h4 class="section-title">🎯 核心观点</h4>
                <div class="section-content">${article.coreViewpoints}</div>
            </div>
            
            <div class="section">
                <h4 class="section-title">💬 专业点评</h4>
                <div class="section-content">${article.comments}</div>
            </div>
            
            <a href="${article.pdfUrl}" class="download-btn" target="_blank">
                📥 下载完整报告 (${article.fileSize})
            </a>
        </div>
    `).join('');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate();
    setCurrentYear();
    displayArticles();
    
    console.log('网站加载成功！');
});
