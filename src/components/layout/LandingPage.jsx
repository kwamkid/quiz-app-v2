// src/components/layout/LandingPage.jsx - ปรับให้พอดีจอมือถือ
import React, { useEffect, useState } from 'react';
import { User, Settings } from 'lucide-react';
import Button from '../common/Button';
import audioService from '../../services/audioService';

const LandingPage = ({ onSelectRole }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initialize audio when component mounts
    audioService.initialize();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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

  // Dynamic styles based on screen size
  const styles = {
    container: {
      minHeight: '100dvh', // ใช้แค่ dvh อย่างเดียว
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
        
    contentWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      padding: isMobile ? '16px' : '20px'
    },
    
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: isMobile ? '24px' : '32px',
      padding: isMobile ? '24px 20px' : '48px',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'slideUp 0.8s ease-out',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '24px' : '32px'
    },
    
    logoContainer: {
      position: 'relative',
      display: 'inline-block'
    },
    
    logoCircle: {
      background: 'linear-gradient(135deg, #ff4757, #ff3742)',
      borderRadius: '50%',
      padding: isMobile ? '20px' : '30px',
      width: isMobile ? '80px' : '120px',
      height: isMobile ? '80px' : '120px',
      margin: '0 auto',
      boxShadow: '0 20px 40px rgba(255, 71, 87, 0.4)',
      animation: 'glow 2s ease-in-out infinite alternate',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    title: {
      fontSize: isMobile ? '2.2rem' : '3rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: isMobile ? '6px' : '12px',
      textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.8s ease-out 0.2s both'
    },
    
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: isMobile ? '1rem' : '1.3rem',
      animation: 'slideUp 0.8s ease-out 0.4s both'
    },
    
    button: {
      background: '',
      color: 'white',
      border: 'none',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '16px 24px' : '20px 32px',
      fontSize: isMobile ? '1rem' : '1.2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '12px' : '16px',
      animation: '',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    },
    
    iconWrapper: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: isMobile ? '8px' : '12px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      {/* Floating Background Elements - ซ่อนใน mobile เพื่อประหยัดพื้นที่ */}
      {!isMobile && (
        <>
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
        </>
      )}

      {/* Main Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          {/* Header Section */}
          <div>
            {/* Logo */}
            <div style={styles.logoContainer}>
              <div style={styles.logoCircle}>
                <img 
                  src="/Logo-Horizontal-White.png" 
                  alt="Codelab"
                  style={{
                    width: isMobile ? '35px' : '60px',
                    height: 'auto',
                    filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                    animation: 'bounce 2s infinite'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div style="color: white; font-size: ${isMobile ? '1.5rem' : '2.5rem'}; font-weight: bold; animation: bounce 2s infinite;">CL</div>`;
                  }}
                />
              </div>
              
              <div style={{
                position: 'absolute',
                top: isMobile ? '-4px' : '-8px',
                right: isMobile ? '-4px' : '-8px',
                fontSize: isMobile ? '1.5rem' : '2.5rem',
                animation: 'spin 3s linear infinite'
              }}>✨</div>
            </div>
            
            {/* Title */}
            <h1 style={styles.title}>
              🎮 Quiz Quest
            </h1>
            
            <p style={styles.subtitle}>
              เกมทำข้อสอบสุดมันส์!
            </p>
          </div>
          
          {/* Buttons Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '20px'
          }}>
            <button
              onClick={() => handleRoleSelect('student')}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                animation: 'slideUp 0.8s ease-out 0.6s both'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              <div style={styles.iconWrapper}>
                <User size={isMobile ? 18 : 24} />
              </div>
              <span>🎓 ฉันเป็นนักเรียน</span>
            </button>
            
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
                animation: 'slideUp 0.8s ease-out 0.8s both'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              <div style={styles.iconWrapper}>
                <Settings size={isMobile ? 18 : 24} />
              </div>
              <span>⚙️ ฉันเป็นครูคนดี</span>
            </button>
          </div>
          
          {/* Footer Section */}
          <div>
            {/* Decorative Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              animation: 'slideUp 0.8s ease-out 1s both',
              marginBottom: isMobile ? '12px' : '20px'
            }}>
              <div style={{
                width: isMobile ? '8px' : '12px',
                height: isMobile ? '8px' : '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                width: isMobile ? '8px' : '12px',
                height: isMobile ? '8px' : '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite 0.2s'
              }}></div>
              <div style={{
                width: isMobile ? '8px' : '12px',
                height: isMobile ? '8px' : '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite 0.4s'
              }}></div>
            </div>

            {/* Powered by Codelab */}
            <div style={{
              textAlign: 'center',
              animation: 'slideUp 0.8s ease-out 1.2s both'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: isMobile ? '0.75rem' : '0.9rem',
                marginBottom: '4px'
              }}>
                Powered by
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <img 
                  src="/Logo-Horizontal-White.png" 
                  alt="Codelab"
                  style={{
                    height: isMobile ? '18px' : '24px',
                    width: 'auto',
                    opacity: 0.8,
                    filter: 'brightness(1.2)'
                  }}
                  onError={(e) => {
                    e.target.parentNode.innerHTML = '<span style="color: rgba(255, 255, 255, 0.6); font-weight: 600; font-size: ' + (isMobile ? '0.8rem' : '1rem') + ';">CODELAB</span>';
                  }}
                />
              </div>
            </div>
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
            box-shadow: 0 20px 40px rgba(255, 71, 87, 0.4);
          }
          to {
            box-shadow: 0 25px 50px rgba(255, 71, 87, 0.7);
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
        
        /* Support for iOS Safari */
        @supports (-webkit-touch-callout: none) {
          .dvh-container {
            min-height: -webkit-fill-available;
          }
        }
        
        /* Prevent overscroll on iOS */
        html, body {
          overscroll-behavior: none;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;