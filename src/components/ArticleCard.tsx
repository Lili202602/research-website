import React from 'react';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    date: string;
    coreViewpoints: string;
    comments: string;
    pdfUrl: string;
    fileSize: string;
    postUrl?: string;
    tags?: string[];
    industry_tags?: string[];
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
    }}
    >
      {/* 笔刷纹理背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
        pointerEvents: 'none'
      }} />

      {/* 头部：标题 + 下载按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        gap: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#2D3436',
            marginBottom: '8px',
            lineHeight: '1.4'
          }}>
            {article.postUrl ? (
              <a 
                href={article.postUrl} 
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'none'
                }}
              >
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h3>
          
          <div style={{
            fontSize: '0.85rem',
            color: '#95A5A6',
            marginBottom: '8px'
          }}>
            {article.date}
          </div>
          
          {/* 行业标签 */}
          {article.industry_tags && article.industry_tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {article.industry_tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '3px 10px',
                    background: 'rgba(149, 165, 166, 0.15)',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#7F8C8D',
                    fontWeight: '400'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 下载按钮和文件大小 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              background: 'rgba(45, 52, 54, 0.85)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(45, 52, 54, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(45, 52, 54, 0.85)';
            }}
          >
            下载报告
          </a>
          
          {/* 文件大小 - 放在按钮下方 */}
          <span style={{
            fontSize: '0.75rem',
            color: '#a0aec0',
            fontWeight: '400'
          }}>
            {article.fileSize}
          </span>
        </div>
      </div>

      {/* 核心观点 */}
      <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: '#2D3436',
          marginBottom: '10px'
        }}>
          核心观点
        </h4>
        <div
          style={{
            color: '#636E72',
            lineHeight: '1.8',
            padding: '0'
          }}
          dangerouslySetInnerHTML={{ __html: article.coreViewpoints }}
        />
      </div>

      {/* 专业点评 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: '#2D3436',
          marginBottom: '10px'
        }}>
          专业点评
        </h4>
        <div
          style={{
            color: '#636E72',
            lineHeight: '1.8',
            padding: '0'
          }}
          dangerouslySetInnerHTML={{ __html: article.comments }}
        />
      </div>
    </div>
  );
};

export default ArticleCard;

