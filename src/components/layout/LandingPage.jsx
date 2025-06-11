// src/components/layout/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { User, Settings, Sparkles, Star, Zap, Trophy } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import { t } from '../../translations';

const LandingPage = ({ onSelectRole, currentLanguage = 'th' }) => {
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    audioService.initialize();
    // Trigger star animation after component mounts
    setTimeout(() => setShowStars(true), 500);
  }, []);

  const handleRoleSelect = async (role) => {
    await audioService.buttonClick();
    onSelectRole(role);
  };

  // Generate random stars for background
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        size: `${Math.random() * 3 + 1}px`
      });
    }
    return stars;
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
      {/* Animated Stars Background */}
      {showStars && generateStars().map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            width: star.size,
            height: star.size,
            background: 'white',
            borderRadius: '50%',
            left: star.left,
            top: star.top,
            opacity: 0,
            animation: `twinkle 3s ${star.animationDelay} infinite`
          }}
        />
      ))}

      {/* Floating Game Elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '5%',
        fontSize: '5rem',
        opacity: '0.3',
        animation: 'float 6s ease-in-out infinite',
        filter: 'blur(1px)'
      }}>🎮</div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        fontSize: '4rem',
        opacity: '0.4',
        animation: 'float 8s ease-in-out infinite 1s'
      }}>🏆</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        fontSize: '4.5rem',
        opacity: '0.35',
        animation: 'float 7s ease-in-out infinite 2s'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '5%',
        fontSize: '3.5rem',
        opacity: '0.3',
        animation: 'float 9s ease-in-out infinite 3s'
      }}>⭐</div>

      <div style={{
        position: 'absolute',
        top: '40%',
        left: '3%',
        fontSize: '3rem',
        opacity: '0.25',
        animation: 'float 10s ease-in-out infinite 4s'
      }}>🎲</div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        fontSize: '3.5rem',
        opacity: '0.3',
        animation: 'float 8s ease-in-out infinite 2.5s'
      }}>🎈</div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 1
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
          animation: 'slideUp 1s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            animation: 'rotate 20s linear infinite'
          }}>
            <Star size={40} color="rgba(255,255,255,0.2)" />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-20px',
            animation: 'rotate 20s linear infinite reverse'
          }}>
            <Zap size={40} color="rgba(255,255,255,0.2)" />
          </div>

          {/* Logo and Title */}
          <div style={{ marginBottom: '40px' }}>
            {/* Logo with effects */}
            <div style={{
              position: 'relative',
              marginBottom: '32px',
              display: 'inline-block',
              animation: 'logoFloat 3s ease-in-out infinite'
            }}>
              {/* Red circular background with glow */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150px',
                height: '150px',
                background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
                borderRadius: '50%',
                boxShadow: '0 0 40px rgba(255, 82, 82, 0.5), 0 10px 30px rgba(255, 82, 82, 0.3)',
                animation: 'redGlow 2s ease-in-out infinite'
              }} />
              
              {/* Logo Image */}
              <img 
                src="/Logo-Horizontal-White.png" 
                alt="Quiz Quest Logo"
                onLoad={() => setIsLogoLoaded(true)}
                style={{
                  width: '100px',
                  height: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  opacity: isLogoLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in',
                  filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3))',
                  animation: isLogoLoaded ? 'logoReveal 1s ease-out' : 'none'
                }}
              />
              
              {/* Sparkles around logo */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '10px',
                animation: 'sparkle 2s ease-in-out infinite'
              }}>
                <Sparkles size={30} color="#fbbf24" />
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '5px',
                left: '0px',
                animation: 'sparkle 2s ease-in-out infinite 0.5s'
              }}>
                <Star size={25} color="#f59e0b" />
              </div>

              <div style={{
                position: 'absolute',
                top: '20px',
                left: '-15px',
                animation: 'sparkle 2s ease-in-out infinite 1s'
              }}>
                <Zap size={20} color="#fbbf24" />
              </div>
            </div>
            
            {/* Tagline */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.3rem',
              fontWeight: '500',
              marginTop: '16px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              animation: 'fadeInUp 1s ease-out 0.5s both'
            }}>
              {t('welcomeSubtitle', currentLanguage)} 🎉
            </p>
          </div>
          
          {/* Role Selection Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeInUp 1s ease-out 0.7s both'
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
              {/* Animated gradient overlay */}
              <div style={{
                position: 'absolute',
                top: '-100%',
                left: '-100%',
                width: '300%',
                height: '300%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite',
                pointerEvents: 'none'
              }} />
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'iconBounce 2s ease-in-out infinite'
              }}>
                <User size={24} />
              </div>
              <span style={{ position: 'relative', zIndex: 1 }}>🎓 {t('iAmStudent', currentLanguage)}</span>
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
              {/* Animated gradient overlay */}
              <div style={{
                position: 'absolute',
                top: '-100%',
                left: '-100%',
                width: '300%',
                height: '300%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite 0.5s',
                pointerEvents: 'none'
              }} />
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'iconBounce 2s ease-in-out infinite 0.5s'
              }}>
                <Settings size={24} />
              </div>
              <span style={{ position: 'relative', zIndex: 1 }}>⚙️ {t('iAmTeacher', currentLanguage)}</span>
            </button>
          </div>
          
          {/* Animated dots */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            animation: 'fadeInUp 1s ease-out 0.9s both'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite'
            }}></div>
            <div style={{
              width: '10px',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite 0.2s'
            }}></div>
            <div style={{
              width: '10px',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite 0.4s'
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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes logoReveal {
          from {
            transform: scale(0.8) rotate(-5deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes redGlow {
          0%, 100% {
            boxShadow: 0 0 40px rgba(255, 82, 82, 0.5), 0 10px 30px rgba(255, 82, 82, 0.3);
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            boxShadow: 0 0 60px rgba(255, 82, 82, 0.7), 0 15px 40px rgba(255, 82, 82, 0.5);
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }
        
        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes rotate {
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
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;