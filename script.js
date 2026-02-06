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
    
    // 生成文章HTML
    articles.forEach((article, index) => {
        const articleHTML = `
            <div class="article-card">
                <div class="article-header">
                    <div class="article-number">${index + 1}</div>
                    <h3 class="article-title">${article.title}</h3>
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
