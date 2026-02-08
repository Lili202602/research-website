import React from 'react';
import { ARTICLES_DATA } from '../data/articlesData';
import ArticleCard from '../components/ArticleCard';

const Archive: React.FC = () => {
  return (
    <div>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: '24px',
        letterSpacing: '-0.02em'
      }}>
        往期回看
      </div>

      {ARTICLES_DATA.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default Archive;

