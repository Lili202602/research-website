import React, { useState, useEffect } from 'react';

// 使用 Web Crypto API 进行 SHA-256 哈希
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// 正确密码的哈希值（lili2026 的 SHA-256）
const CORRECT_PASSWORD_HASH = 'f8c3bf62a9aa3e6fc1619c250e48aba7f3367ef08f0ea4d8b1e3f8c3bf62a9aa';

const AUTH_KEY = 'LILI_AUTH_TOKEN';
const ATTEMPTS_KEY = 'LILI_AUTH_ATTEMPTS';
const LOCK_KEY = 'LILI_AUTH_LOCKED';

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否已授权
    const authToken = localStorage.getItem(AUTH_KEY);
    const locked = localStorage.getItem(LOCK_KEY);
    const storedAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');

    if (locked === 'true') {
      setIsLocked(true);
      setIsLoading(false);
      return;
    }

    if (authToken) {
      // 验证 token 是否有效
      hashPassword('lili2026').then(hash => {
        if (authToken === hash) {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      });
    } else {
      setAttempts(storedAttempts);
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;

    const hash = await hashPassword(password);
    
    if (hash === CORRECT_PASSWORD_HASH) {
      // 密码正确
      localStorage.setItem(AUTH_KEY, hash);
      localStorage.removeItem(ATTEMPTS_KEY);
      setIsAuthenticated(true);
      setError('');
    } else {
      // 密码错误
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
      
      if (newAttempts >= 3) {
        // 锁定
        setIsLocked(true);
        localStorage.setItem(LOCK_KEY, 'true');
        setError('');
      } else {
        setError(`密码错误，还剩 ${3 - newAttempts} 次机会`);
      }
      
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: '#ffffff', fontSize: '1.2rem' }}>加载中...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F6FA',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        {isLocked ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '24px'
            }}>
              🔒
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2D3436',
              marginBottom: '16px'
            }}>
              访问已锁定
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#636E72',
              lineHeight: '1.6'
            }}>
              尝试次数过多，请前往小红书获取访问口令
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '800',
                color: '#2D3436',
                marginBottom: '8px',
                letterSpacing: '-0.02em'
              }}>
                Lili的供应链AI Lab
              </h1>
              <p style={{
                fontSize: '0.95rem',
                color: '#95A5A6'
              }}>
                请输入访问口令
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入访问口令"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '1rem',
                  border: '2px solid rgba(45, 52, 54, 0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#2D3436',
                  marginBottom: '16px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(45, 52, 54, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(45, 52, 54, 0.1)';
                }}
              />

              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(231, 76, 60, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  color: '#e74c3c',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!password || isLocked}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '12px',
                  background: password && !isLocked 
                    ? 'rgba(45, 52, 54, 0.9)' 
                    : 'rgba(45, 52, 54, 0.3)',
                  color: '#ffffff',
                  cursor: password && !isLocked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (password && !isLocked) {
                    e.currentTarget.style.background = 'rgba(45, 52, 54, 1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (password && !isLocked) {
                    e.currentTarget.style.background = 'rgba(45, 52, 54, 0.9)';
                  }
                }}
              >
                进入
              </button>

              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#95A5A6'
              }}>
                剩余尝试次数：{3 - attempts}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordGate;

