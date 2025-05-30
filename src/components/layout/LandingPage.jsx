// src/components/layout/LandingPage.jsx
import React, { useEffect } from 'react';
import { User, Settings } from 'lucide-react';
import Button from '../common/Button';
import audioService from '../../services/audioService';

const LandingPage = ({ onSelectRole }) => {
  useEffect(() => {
    // Initialize audio when component mounts
    audioService.initialize();
  }, []);

  const handleRoleSelect = async (role) => {
    try {
      await audioService.buttonClick();
      onSelectRole(role);
    } catch (error) {
      console.warn('Audio failed:', error);
      onSelectRole(role);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        animation: 'float 6s ease-in-out infinite'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '3rem',
        opacity: '0.2',
        animation: 'bounce 2s infinite'
      }}>⭐</div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        fontSize: '5rem',
        opacity: '0.15',
        animation: 'float 8s ease-in-out infinite reverse'
      }}>🚀</div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        fontSize: '3rem',
        opacity: '0.1',
        animation: 'bounce 3s infinite 1s'
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
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
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
                boxShadow: '0 15px 30px rgba(251, 191, 36, 0.3)',
                animation: 'glow 2s ease-in-out infinite alternate',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: '2rem',
                  animation: 'bounce 2s infinite'
                }}>🎮</div>
              </div>
              
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                fontSize: '2rem',
                animation: 'spin 3s linear infinite'
              }}>✨</div>
            </div>
            
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.8s ease-out 0.2s both'
            }}>
              🎮 Quiz Quest
            </h1>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.3rem',
              animation: 'slideUp 0.8s ease-out 0.4s both'
            }}>
              เกมทำข้อสอบสุดมันส์!
            </p>
          </div>
          
          {/* Role Selection Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => handleRoleSelect('student')}
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
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
                gap: '16px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                animation: 'slideUp 0.8s ease-out 0.6s both',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}>
                <User size={24} />
              </div>
              <span>🎓 ฉันเป็นนักเรียน</span>
            </button>
            
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
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
                gap: '16px',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                animation: 'slideUp 0.8s ease-out 0.8s both',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)';
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}>
                <Settings size={24} />
              </div>
              <span>⚙️ ฉันเป็นครู</span>
            </button>
          </div>
          
          {/* Decorative Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            animation: 'slideUp 0.8s ease-out 1s both'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite 0.2s'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite 0.4s'
            }}></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
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
            box-shadow: 0 15px 30px rgba(251, 191, 36, 0.3);
          }
          to {
            box-shadow: 0 15px 40px rgba(251, 191, 36, 0.6);
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