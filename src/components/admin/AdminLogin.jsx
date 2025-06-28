// src/components/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff, Settings, Volume2, VolumeX } from 'lucide-react';
import Button from '../common/Button';
import audioService from '../../services/simpleAudio';
import musicService from '../../services/musicService';
import { DEFAULT_ADMIN } from '../../constants';

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // ตรวจสอบสถานะเพลงเมื่อ component mount
  useEffect(() => {
    const initializeMusic = async () => {
      await musicService.initialize();
      const isPlaying = musicService.isCurrentlyPlaying();
      setMusicEnabled(isPlaying);
    };
    
    initializeMusic();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await audioService.buttonClick();
    
    // Simulate loading delay
    setTimeout(() => {
      if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
        audioService.correctAnswer();
        onLoginSuccess();
      } else {
        audioService.wrongAnswer();
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = async () => {
    await audioService.navigation();
    window.history.back(); // หรือใช้ navigate('/') ถ้าต้องการกลับหน้าแรกเสมอ
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleMusic = async () => {
    await audioService.buttonClick();
    
    if (musicEnabled) {
      // หยุดเพลง
      musicService.stop();
      setMusicEnabled(false);
      console.log('🔇 Music stopped by user');
    } else {
      // เริ่มเพลง
      const fileExists = await musicService.checkMusicFile();
      
      if (!fileExists) {
        alert(`🎵 ไม่พบไฟล์เพลง!

กรุณาทำดังนี้:
1. เปลี่ยนชื่อไฟล์เพลงเป็น "quiz-music.mp3"
2. วางไฟล์ในโฟลเดอร์ public/
3. รีเฟรชหน้าใหม่

โครงสร้างที่ถูกต้อง:
public/
  quiz-music.mp3`);
        return;
      }
      
      const success = await musicService.playMenuMusic();
      if (success) {
        setMusicEnabled(true);
        console.log('🎵 Music started successfully');
      } else {
        alert(`🎵 ไม่สามารถเล่นเพลงได้

สาเหตุที่เป็นไปได้:
- เบราว์เซอร์บล็อกการเล่นเพลงอัตโนมัติ
- รูปแบบไฟล์ไม่รองรับ
- ไฟล์เสียหาย

ลองกดปุ่มเพลงอีกครั้ง`);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '4rem',
        opacity: '0.1',
        animation: 'pulse 3s infinite'
      }}>🔒</div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        fontSize: '3rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite'
      }}>⚙️</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        fontSize: '5rem',
        opacity: '0.15'
      }}>👨‍🏫</div>

      {/* Music Toggle Button - Fixed Position */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: musicEnabled 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: '12px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          if (!musicEnabled) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          if (!musicEnabled) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        title={musicEnabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
      >
        {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        <span style={{ fontSize: '0.9rem' }}>
          {musicEnabled ? 'ปิดเพลง' : 'เปิดเพลง'}
        </span>
      </button>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '32px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              position: 'relative',
              marginBottom: '24px',
              display: 'inline-block'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                boxShadow: '0 15px 30px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}>
                <Lock size={32} color="white" />
              </div>
              
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '1.5rem',
                animation: 'spin 3s linear infinite'
              }}>
                <Settings size={24} color="#fbbf24" />
              </div>
            </div>
            
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              🔐 เข้าสู่ระบบครู
            </h2>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem'
            }}>
              กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleLogin} style={{ marginBottom: '32px' }}>
            <div style={{
              marginBottom: '24px'
            }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="👤 ชื่อผู้ใช้"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{
              position: 'relative',
              marginBottom: '24px'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="🔑 รหัสผ่าน"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  paddingRight: '60px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username.trim() && password.trim() && !isLoading) {
                    handleLogin(e);
                  }
                }}
              />
              
              <button
                type="button"
                onClick={togglePassword}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                color: '#fca5a5',
                textAlign: 'center',
                animation: 'shake 0.5s ease-in-out'
              }}>
                ❌ {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={!username.trim() || !password.trim() || isLoading}
              style={{
                width: '100%',
                background: (!username.trim() || !password.trim() || isLoading) 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: (!username.trim() || !password.trim() || isLoading) 
                  ? 'rgba(255, 255, 255, 0.5)' 
                  : 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: (!username.trim() || !password.trim() || isLoading) 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: (!username.trim() || !password.trim() || isLoading) 
                  ? 'none' 
                  : '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!(!username.trim() || !password.trim() || isLoading)) {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!username.trim() || !password.trim() || isLoading)) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>🚀 เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>
          
          {/* Back Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleBack}
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                padding: '8px 16px',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'white';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                e.target.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              กลับหน้าหลัก
            </button>
          </div>
          
          {/* Music Status */}
          {musicEnabled && (
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Volume2 size={14} />
              กำลังเล่นเพลง
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-15px,0);
          }
          70% {
            transform: translate3d(0,-7px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 15px 30px rgba(139, 92, 246, 0.3);
          }
          to {
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;