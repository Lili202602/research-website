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

// 动态加载文章数据
async function loadArticles() {
    try {
        console.log('开始从JSON加载文章数据...');
        
        // 使用缓存控制版本号强制重新加载
        const response = await fetch(`data/articles.json?${CACHE_BUSTER}`);
        
        if (!response.ok) {
            throw new Error(`加载失败! 状态码: ${response.status}`);
        }
        
        const articles = await response.json();
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
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
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
    
    // 保存全局数据（用于搜索）
    if (isArchivePage && allArticlesData.length === 0) {
        allArticlesData = articles;
    }
    
    // 生成文章HTML
    listToRender.forEach((article, index) => {
        // 生成标签HTML
        let tagsHTML = '';
        if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
            tagsHTML = `
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        // 为每篇文章生成不同的渐变色
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        ];
        const gradient = gradients[index % gradients.length];
        
        const articleHTML = `
            <div class="article-card">
                <div class="article-cover" style="background: ${gradient};"></div>
                
                <div class="article-header">
                    <div class="article-number">${index + 1}</div>
                    <h3 class="article-title">${
                        article.postUrl
                            ? `<a href="${article.postUrl}" style="color: inherit; text-decoration: none;">${article.title}</a>`
                            : `${article.title}`
                    }</h3>
                    <div class="article-date">📅 ${article.date}</div>
                    ${tagsHTML}
                </div>
                
                <div class="section">
                    <h4 class="section-title">🎯 核心观点</h4>
                    <div class="section-content">${article.coreViewpoints || '暂无核心观点'}</div>
                </div>
                
                <div class="section">
                    <h4 class="section-title">💬 专业点评</h4>
                    <div class="expert-comment">${article.comments || '暂无专业点评'}</div>
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
    
    // 初始化搜索功能（仅在归档页面）
    if (window.location.pathname.includes('archive')) {
        initializeSearch();
    }
    
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

// 全局变量存储所有文章数据
let allArticlesData = [];

// 初始化搜索功能
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    console.log('初始化搜索功能...');
    
    // 实时搜索（输入时触发）
    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.trim();
        filterArticles(keyword);
    });
    
    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = e.target.value.trim();
            filterArticles(keyword);
        }
    });
}

// 筛选文章
function filterArticles(keyword) {
    const container = document.getElementById('articles-container');
    const resultsInfo = document.getElementById('search-results-info');
    
    if (!container || allArticlesData.length === 0) return;
    
    // 如果关键词为空，显示所有文章
    if (!keyword) {
        displayArticles(allArticlesData);
        resultsInfo.textContent = '';
        resultsInfo.classList.remove('active');
        return;
    }
    
    // 转换为小写进行不区分大小写的搜索
    const lowerKeyword = keyword.toLowerCase();
    
    // 筛选匹配的文章
    const filteredArticles = allArticlesData.filter(article => {
        // 搜索标题
        const titleMatch = article.title && article.title.toLowerCase().includes(lowerKeyword);
        
        // 搜索标签
        const tagsMatch = article.tags && Array.isArray(article.tags) && 
            article.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
        
        // 搜索核心观点（去除HTML标签后搜索）
        const viewpointsText = article.coreViewpoints ? 
            article.coreViewpoints.replace(/<[^>]+>/g, '').toLowerCase() : '';
        const viewpointsMatch = viewpointsText.includes(lowerKeyword);
        
        // 搜索专业点评（去除HTML标签后搜索）
        const commentsText = article.comments ? 
            article.comments.replace(/<[^>]+>/g, '').toLowerCase() : '';
        const commentsMatch = commentsText.includes(lowerKeyword);
        
        return titleMatch || tagsMatch || viewpointsMatch || commentsMatch;
    });
    
    console.log(`搜索关键词: "${keyword}", 找到 ${filteredArticles.length} 篇报告`);
    
    // 显示筛选结果
    if (filteredArticles.length > 0) {
        displayArticles(filteredArticles);
        resultsInfo.textContent = `找到 ${filteredArticles.length} 篇相关报告`;
        resultsInfo.classList.add('active');
    } else {
        // 显示无结果提示
        container.innerHTML = `
            <div class="no-results">
                <h3>😔 未找到相关报告</h3>
                <p>没有找到包含 "<strong>${keyword}</strong>" 的报告</p>
                <button class="clear-search-btn" onclick="clearSearch()">清除搜索</button>
            </div>
        `;
        resultsInfo.textContent = '未找到匹配的报告';
        resultsInfo.classList.add('active');
    }
}

// 清除搜索
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsInfo = document.getElementById('search-results-info');
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    if (resultsInfo) {
        resultsInfo.textContent = '';
        resultsInfo.classList.remove('active');
    }
    
    displayArticles(allArticlesData);
}

// 导出函数供全局使用（如果需要）
window.reloadArticles = loadArticles;
window.refreshPage = function() {
    location.reload(true);
};
window.clearSearch = clearSearch;
