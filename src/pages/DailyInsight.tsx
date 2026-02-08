import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const DailyInsight: React.FC = () => {
  // 只显示最新的3篇文章
  const latestArticles = ARTICLES_DATA.slice(0, 3);

  return (
    <div>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: '24px',
        letterSpacing: '-0.02em'
      }}>
        每日洞察
      </div>

      {latestArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default DailyInsight;
