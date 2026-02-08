import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const Archive: React.FC = () => {
  // 显示除了最新一篇以外的所有历史文章
  const archiveArticles = ARTICLES_DATA.slice(1);

  return (
    <div>
      {archiveArticles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default Archive;

