import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      textAlign: 'center',
      marginTop: '60px',
      padding: '40px 20px',
      color: '#95A5A6',
      fontSize: '0.85rem',
      fontWeight: '300',
      background: 'transparent'
    }}>
      <p style={{ margin: '0' }}>
        © {currentYear} Lili的供应链AI Lab
      </p>
    </footer>
  );
};

export default Footer;

