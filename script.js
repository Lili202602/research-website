// ===== 行研精选网站 - 主JavaScript文件 =====
// 版本：2024.03.21 - 动态加载版本
// ===========================================

// 强制缓存控制 - 每次加载都生成新版本号
const CACHE_BUSTER = 'v=' + Date.now();
console.log('🚀 行研精选网站已加载 | 缓存控制版本：' + CACHE_BUSTER);

// 清除任何可能的Service Worker缓存
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        console.log('清理Service Worker注册：', registrations.length);
        registrations.forEach(function(registration) {
            registration.unregister();
            console.log('已注销Service Worker');
        });
    });
}

// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('zh-CN', options);
    }
}

// 设置当前年份
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// 文章数据常量 - 直接定义在代码中
const ARTICLES_DATA = [
    {
        id: 7,
        title: "益普索中国智能家电市场趋势洞察",
        date: "2026年02月07日",
        coreViewpoints: "<div class=\"insight-item\">【<strong>消费趋势转型</strong>】：中国家电市场正从规模扩张转向品质升级，Z世代成为消费主力，推动需求向情感化、个性化、智能便捷和颜值追求等多层次体验演变。</div><div class=\"insight-item\">【<strong>设计美学革新</strong>】：家电设计追求与家居环境无缝融合，通过嵌入式设计和家具化质感实现视觉消隐，平嵌成为新基准，强调美学与和谐。</div><div class=\"insight-item\">【<strong>空间优化创新</strong>】：面对紧凑居住空间，家电设计转向"小而精"，通过尺寸缩减和复合功能实现空间扩容，技术堆叠提升功能价值。</div>",
        comments: "<div class=\"insight-item\">【<strong>供应链敏捷性提升</strong>】：报告指出品类微细分浪潮（如个人洗衣机需求达52%）和设计美学革新（平嵌成为新基准），要求供应链从业者增强敏捷响应能力。</div>",
        pdfUrl: "pdfs/【益普索(中国)咨询】中国智能家电市场趋势洞察.pdf",
        fileSize: "7.7 MB",
        postUrl: "posts/20260207-益普索中国智能家电市场趋势洞察.html"
    },
    {
        id: 6,
        title: "中国服饰鞋类企业如何在东南亚实现海外品牌和渠道落地",
        date: "2026年02月06日",
        coreViewpoints: "<div class=\"insight-item\">【<strong>战略出海定位</strong>】：报告强调企业需明确出海定位，战略出海以全球为目标市场，战术出海则聚焦供应链迁移。</div>",
        comments: "<div class=\"insight-item\">【<strong>供应链网络重构</strong>】：报告指出中国服饰鞋类企业出海需从战术迁移转向战略布局。</div>",
        pdfUrl: "pdfs/【海通国际】中国服饰鞋类企业如何在东南亚实现海外品牌和渠道落地.pdf",
        fileSize: "4.5 MB",
        postUrl: "posts/20260206-中国服饰鞋类企业如何在东南亚实现海外品牌和渠道落地.html"
    },
    {
        id: 5,
        title: "2025中国成人健康管理洞察",
        date: "2026年02月06日",
        coreViewpoints: "健康意识普遍提升，全民关注成为常态，平均关注度达8.84分（10分制）。",
        comments: "从供应链从业者视角看，这份报告揭示了健康管理市场的显著趋势。",
        pdfUrl: "pdfs/【益普索Ipsos】成人健康行业：2025中国成人健康管理洞察【洞见研报DJyanbao.com】 (1).pdf",
        fileSize: "4.8 MB",
        postUrl: "posts/20260206-2025中国成人健康管理洞察.html"
    }
];

// 加载文章数据（现在直接使用内嵌数据）
function loadArticles() {
    try {
        console.log('开始加载文章数据...');
        
        // 直接使用内嵌的文章数据
        const articles = ARTICLES_DATA;
        console.log('成功加载文章数：', articles.length, '篇');
        
        // 显示文章
        displayArticles(articles);
        
        // 更新文章数量显示
        updateArticleCount(articles.length);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        showErrorMessage('加载报告失败，请刷新页面重试');
        
        // 显示错误信息
        const container = document.getElementById('articles-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <h3>数据加载失败</h3>
                    <p>${error.message || '请检查网络连接'}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        点击刷新页面
                    </button>
                </div>
            `;
        }
    }
}

// 显示文章
function displayArticles(articles) {
    const container = document.getElementById('articles-container');
    
    if (!container) {
        console.error('找不到文章容器元素');
        return;
    }
    
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #95a5a6; margin-bottom: 20px;"></i>
                <h3>暂无研究报告</h3>
                <p>当前没有可用的行业研究报告</p>
            </div>
        `;
        return;
    }
    
    console.log('开始渲染文章...');
    
    // 清空容器
    container.innerHTML = '';
    
    // 首页只展示最新 3 篇；archive.html 展示全部
    const isArchivePage = window.location.pathname.includes('archive');
    const listToRender = isArchivePage ? articles : articles.slice(0, 3);
    
    // 生成文章HTML
    listToRender.forEach((article, index) => {
        const articleHTML = `
            <div class="article-card">
                <div class="article-header">
                    <div class="article-number">${index + 1}</div>
                    <h3 class="article-title">${
                        article.postUrl
                            ? `<a href="${article.postUrl}" style="color: inherit; text-decoration: none;">${article.title}</a>`
                            : `${article.title}`
                    }</h3>
                    <div class="article-date">📅 ${article.date}</div>
                </div>
                
                <div class="section">
                    <h4 class="section-title">🎯 核心观点</h4>
                    <div class="section-content">${article.coreViewpoints || '暂无核心观点'}</div>
                </div>
                
                <div class="section">
                    <h4 class="section-title">💬 专业点评</h4>
                    <div class="section-content">${article.comments || '暂无专业点评'}</div>
                </div>
                
                <a href="${article.pdfUrl || '#'}" class="download-btn" target="_blank" rel="noopener noreferrer">
                    📥 下载完整报告 (${article.fileSize || '未知大小'})
                </a>
            </div>
        `;
        
        container.innerHTML += articleHTML;
    });
    
    console.log('文章渲染完成');
}

// 更新文章数量显示
function updateArticleCount(count) {
    // 可以在这里更新页面上的文章数量统计
    console.log(`当前显示 ${count} 篇研究报告`);
}

// 显示错误信息
function showErrorMessage(message) {
    console.error('网站错误:', message);
    
    // 可以在页面顶部显示错误提示
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ 数据加载异常</strong>
        <p style="margin: 5px 0 0; font-size: 0.9em;">${message}</p>
    `;
    document.body.appendChild(errorDiv);
    
    // 5秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化网站...');
    
    // 设置日期和年份
    setCurrentDate();
    setCurrentYear();
    
    // 加载文章数据
    loadArticles();
    
    // 添加简单的访问统计
    try {
        const visitCount = localStorage.getItem('visitCount') || 0;
        const newCount = parseInt(visitCount) + 1;
        localStorage.setItem('visitCount', newCount);
        console.log(`网站访问次数：${newCount}`);
    } catch (e) {
        console.log('访问统计保存失败（可能是隐私模式）');
    }
    
    // 添加页面性能监控
    window.addEventListener('load', function() {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`页面总加载时间：${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.log('提示：页面加载较慢，建议优化');
        }
    });
    
    // 添加错误监听
    window.addEventListener('error', function(e) {
        console.error('页面JavaScript错误:', e.message, e.filename, e.lineno);
    });
    
    console.log('网站初始化完成 ✅');
});

// 导出函数供全局使用（如果需要）
window.reloadArticles = loadArticles;
window.refreshPage = function() {
    location.reload(true);
};
