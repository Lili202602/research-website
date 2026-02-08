import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '每日洞察' },
    { path: '/archive', label: '往期回看' }
  ];

  return (
    <nav style={{
      width: '220px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px 12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: '24px'
    }}>
      <div style={{
        fontSize: '1rem',
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: '20px',
        paddingLeft: '12px',
        letterSpacing: '-0.01em'
      }}>
        导航
      </div>
      
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '8px',
              border: 'none',
              borderRadius: '10px',
              background: isActive 
                ? 'rgba(45, 52, 54, 0.9)'
                : 'transparent',
              color: isActive ? '#ffffff' : '#636E72',
              fontSize: '0.95rem',
              fontWeight: isActive ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(45, 52, 54, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default Sidebar;

