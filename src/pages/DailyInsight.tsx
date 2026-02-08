import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const DailyInsight: React.FC = () => {
  // 只显示最新的1篇文章
  const latestArticle = ARTICLES_DATA.slice(0, 1);

  return (
    <div>
      {latestArticle.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default DailyInsight;
