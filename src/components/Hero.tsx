import React from 'react';

const Hero: React.FC = () => {
  return (
    <div style={{
      padding: '48px 0 32px 0',
      marginBottom: '40px'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '900',
        color: '#2D3436',
        marginBottom: '12px',
        letterSpacing: '-0.03em',
        lineHeight: '1.2'
      }}>
        Lili的供应链AI Lab
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#636E72',
        fontWeight: '400',
        marginBottom: '8px'
      }}>
        行业洞察 + 专业点评
      </p>
      
      <p style={{
        fontSize: '0.95rem',
        color: '#95A5A6',
        fontWeight: '400'
      }}>
        每周一到周五早上 6 点更新
      </p>
    </div>
  );
};

export default Hero;

