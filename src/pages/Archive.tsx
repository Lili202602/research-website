import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const Archive: React.FC = () => {
  // 显示除了最新一篇以外的所有历史文章
  const archiveArticles = ARTICLES_DATA.slice(1);

  // 如果没有文章，显示空状态
  if (archiveArticles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#95A5A6'
      }}>
        <p>暂无历史文章</p>
      </div>
    );
  }

  return (
    <div>
      {archiveArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default Archive;

