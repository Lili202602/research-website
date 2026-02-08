import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DailyInsight from './pages/DailyInsight';
import Archive from './pages/Archive';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{
        fontFamily: '"Inter", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.7',
        color: '#1f2933',
        background: '#F5F6FA',
        minHeight: '100vh',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          {/* 左侧导航栏 */}
          <Sidebar />
          
          {/* 主内容区域 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Hero 区域 */}
            <Hero />
            
            {/* 路由内容 */}
            <Routes>
              <Route path="/" element={<DailyInsight />} />
              <Route path="/archive" element={<Archive />} />
            </Routes>
          </div>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;

