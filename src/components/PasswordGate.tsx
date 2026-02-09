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

// 正确密码的哈希值
const PASSWORD_HASHES = {
  main: '91b898b6148b0a29d76124072b92f03dae440e17bebdb671bffafeaeb828b3e7', // lili2026
  test: '7997237f84ee2b94d404fb9e1f4ba3f86c52e12aac1de0f9e5685051293ffb68'  // test2026
};

const AUTH_KEY = 'LILI_AUTH_TOKEN';
const DEVICE_ID_KEY = 'LILI_DEVICE_ID';
const ATTEMPTS_KEY = 'LILI_AUTH_ATTEMPTS';
const LOCK_TIME_KEY = 'LILI_LOCK_TIME';

// 生成设备指纹
const generateDeviceFingerprint = (): string => {
  const nav = navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage
  ].join('|');
  
  // 简单哈希
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否已授权
    const authToken = localStorage.getItem(AUTH_KEY);
    const deviceId = localStorage.getItem(DEVICE_ID_KEY);
    const currentDeviceId = generateDeviceFingerprint();
    const lockTime = localStorage.getItem(LOCK_TIME_KEY);
    const storedAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');

    // 检查锁定状态
    if (lockTime) {
      const lockTimestamp = parseInt(lockTime);
      const now = Date.now();
      const timeDiff = now - lockTimestamp;
      
      if (timeDiff < 60000) { // 1分钟内
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil((60000 - timeDiff) / 1000));
        setIsLoading(false);
        return;
      } else {
        // 超过1分钟，自动解锁
        localStorage.removeItem(LOCK_TIME_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }

    if (authToken) {
      // 验证 token 和设备绑定
      const isValidToken = Object.values(PASSWORD_HASHES).includes(authToken);
      
      if (isValidToken) {
        if (deviceId && deviceId !== currentDeviceId) {
          // 设备不匹配
          setError('该口令已在其他设备激活，请联系管理员');
          setIsLoading(false);
          return;
        }
        
        // 保存当前设备ID
        if (!deviceId) {
          localStorage.setItem(DEVICE_ID_KEY, currentDeviceId);
        }
        
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    } else {
      setAttempts(storedAttempts);
      setIsLoading(false);
    }
  }, []);

  // 倒计时效果
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            // 倒计时结束，解锁
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem(LOCK_TIME_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;

    const hash = await hashPassword(password.trim());
    
    // 检查是否是有效密码
    const isValidPassword = Object.values(PASSWORD_HASHES).includes(hash);
    
    if (isValidPassword) {
      // 密码正确
      const currentDeviceId = generateDeviceFingerprint();
      const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      
      // 检查设备绑定
      if (storedDeviceId && storedDeviceId !== currentDeviceId) {
        setError('该口令已在其他设备激活，请联系管理员');
        setPassword('');
        return;
      }
      
      // 保存授权信息
      localStorage.setItem(AUTH_KEY, hash);
      localStorage.setItem(DEVICE_ID_KEY, currentDeviceId);
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCK_TIME_KEY);
      setIsAuthenticated(true);
      setError('');
    } else {
      // 密码错误
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
      
      if (newAttempts >= 3) {
        // 锁定1分钟
        setIsLocked(true);
        setLockTimeRemaining(60);
        localStorage.setItem(LOCK_TIME_KEY, Date.now().toString());
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
              ⏱️
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2D3436',
              marginBottom: '16px'
            }}>
              访问已暂时锁定
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#636E72',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              尝试次数过多，请稍后再试
            </p>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2D3436',
              marginBottom: '8px'
            }}>
              {lockTimeRemaining}s
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: '#95A5A6'
            }}>
              倒计时结束后自动恢复
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
                剩余尝试次数：{3 - attempts} / 3
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordGate;

