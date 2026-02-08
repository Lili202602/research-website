import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isArchive = location.pathname === '/archive';

  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <header style={{
      textAlign: 'left',
      marginBottom: '32px',
      paddingBottom: '18px',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <h1 style={{
        fontSize: '2.2rem',
        color: '#111827',
        marginBottom: '8px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        🔬 Lili的供应链AI Lab
      </h1>
      <p style={{
        color: '#6b7280',
        fontSize: '0.98rem',
        marginBottom: '18px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        专业深度 · 核心观点 · 每周更新
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 'bold', color: '#2563eb' }}>
          {currentDate}
        </span>
        <button
          onClick={() => navigate(isArchive ? '/' : '/archive')}
          style={{
            background: '#111827',
            color: '#f9fafb',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          {isArchive ? '返回首页' : '查看往期'}
        </button>
      </div>
    </header>
  );
};

export default Header;

