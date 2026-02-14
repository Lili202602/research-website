import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const DailyInsight: React.FC = () => {
  // 只显示最新的1篇文章
  const latestArticle = ARTICLES_DATA.slice(0, 1);

  // 如果没有文章，显示空状态
  if (latestArticle.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#95A5A6'
      }}>
        <p>暂无文章</p>
      </div>
    );
  }

  return (
    <div>
      {latestArticle.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default DailyInsight;
