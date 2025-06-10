// src/components/layout/LandingPage.jsx
import React, { useEffect } from 'react';
import { User, Settings, Gamepad2, Sparkles } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import { t } from '../../translations';

const LandingPage = ({ onSelectRole, currentLanguage = 'th' }) => {
  useEffect(() => {
    audioService.initialize();
  }, []);

  const handleRoleSelect = async (role) => {
    await audioService.buttonClick();
    onSelectRole(role);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '6rem',
        opacity: '0.2',
        animation: 'float 6s ease-in-out infinite'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '4rem',
        opacity: '0.3',
        animation: 'float 8s ease-in-out infinite 1s'
      }}>⭐</div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        fontSize: '5rem',
        opacity: '0.25',
        animation: 'float 7s ease-in-out infinite 2s'
      }}>🚀</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '5%',
        fontSize: '4rem',
        opacity: '0.2',
        animation: 'float 9s ease-in-out infinite 3s'
      }}>🎉</div>

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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'slideUp 1s ease-out'
        }}>
          {/* Logo and Title */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              position: 'relative',
              marginBottom: '24px',
              display: 'inline-block'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                boxShadow: '0 20px 40px rgba(251, 191, 36, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}>
                <Gamepad2 size={40} color="white" />
              </div>
              
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                animation: 'spin 3s linear infinite'
              }}>
                <Sparkles size={32} color="#fbbf24" />
              </div>
            </div>
            
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-1px'
            }}>
              🎮 {t('welcomeTitle', currentLanguage)}
            </h1>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
              fontWeight: '400'
            }}>
              {t('welcomeSubtitle', currentLanguage)}
            </p>
          </div>
          
          {/* Role Selection Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Student Button */}
            <button
              onClick={() => handleRoleSelect('student')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={24} />
              </div>
              <span>🎓 {t('iAmStudent', currentLanguage)}</span>
            </button>
            
            {/* Teacher Button */}
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)';
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Settings size={24} />
              </div>
              <span>⚙️ {t('iAmTeacher', currentLanguage)}</span>
            </button>
          </div>
          
          {/* Decorative Elements */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite 0.3s'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite 0.6s'
            }}></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          75% {
            transform: translateY(20px) rotate(-5deg);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 20px 40px rgba(251, 191, 36, 0.4);
          }
          to {
            box-shadow: 0 20px 50px rgba(251, 191, 36, 0.6);
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;