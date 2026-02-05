// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('zh-CN', options);
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
        title: "新能源汽车产业链投资策略",
        date: "2024年3月20日",
        coreViewpoints: "1. 上游资源供需趋稳，价格进入合理区间<br>2. 中游电池技术创新加速，关注固态电池进展<br>3. 下游整车竞争加剧，智能化成为关键<br>4. 建议关注具备核心技术及成本优势的龙头企业",
        comments: "报告对产业链各环节分析全面，但对海外政策风险提及较少。技术突破带来的结构性机会值得重点关注。",
        pdfUrl: "#",
        fileSize: "2.4 MB"
    },
    {
        id: 2,
        title: "人工智能芯片行业深度分析",
        date: "2024年3月18日",
        coreViewpoints: "1. 全球AI芯片市场规模年复合增长率超35%<br>2. 边缘计算推动AI芯片需求多元化<br>3. 国内厂商在特定领域实现技术突破<br>4. 投资建议：关注具备全栈解决方案能力的公司",
        comments: "准确捕捉行业发展趋势，但对供应链安全分析深度不足。AI芯片国产替代逻辑需要进一步深入研究。",
        pdfUrl: "#",
        fileSize: "3.1 MB"
    },
    {
        id: 3,
        title: "医疗设备集采政策影响评估",
        date: "2024年3月15日",
        coreViewpoints: "1. 集采政策从药品向医疗器械全面延伸<br>2. 创新器械暂不纳入集采范围<br>3. 国产替代进程显著加速<br>4. 建议布局具备持续创新能力的企业",
        comments: "政策分析到位，需关注各省市执行差异。对集采后企业应对策略的分析较为充分。",
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
    
    console.log('行研精选网站加载成功！');
    
    // 添加简单的访问统计
    const visitCount = localStorage.getItem('visitCount') || 0;
    localStorage.setItem('visitCount', parseInt(visitCount) + 1);
    console.log('访问次数：' + (parseInt(visitCount) + 1));
});
