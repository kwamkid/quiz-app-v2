// src/components/layout/LandingPage.jsx - ปรับให้ responsive และพอดีหน้าจอ
import React, { useEffect, useState } from 'react';
import { Gamepad2, User, Settings, Sparkles, Star } from 'lucide-react';

// Floating Elements Animation Component
const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
  <div 
    style={{ 
      animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      position: 'absolute'
    }}
  >
    {children}
  </div>
);

const LandingPage = ({ onSelectRole }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initialize animations
    setIsAnimating(true);
  }, []);

  const handleRoleSelect = (role) => {
    onSelectRole(role);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Animated Background Elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <FloatingElement delay={0} duration={4}>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            opacity: 0.2
          }}>🎯</div>
        </FloatingElement>
        <FloatingElement delay={1} duration={5}>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            opacity: 0.3
          }}>⭐</div>
        </FloatingElement>
        <FloatingElement delay={2} duration={4.5}>
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            opacity: 0.25
          }}>🚀</div>
        </FloatingElement>
        <FloatingElement delay={0.5} duration={3.5}>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '5%',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            opacity: 0.2
          }}>🎉</div>
        </FloatingElement>
      </div>

      {/* Main Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: 'clamp(24px, 4vw, 48px)',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 10,
        transform: isAnimating ? 'scale(1)' : 'scale(0.9)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.5s ease-out'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <div className="logo-container" style={{
            background: 'linear-gradient(135deg, #ef4444, #f87171)',
            borderRadius: '50%',
            padding: 'clamp(12px, 2vw, 16px)',
            width: 'clamp(80px, 12vw, 100px)',
            height: 'clamp(80px, 12vw, 100px)',
            margin: '0 auto',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'logoGlow 2s ease-in-out infinite, bounce 3s ease-in-out infinite',
            transform: isAnimating ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.5s ease-out'
          }}>
            {/* Codelab Logo */}
            <img 
              src="/Logo-Horizontal-White.png" 
              alt="Codelab"
              style={{
                width: 'clamp(35px, 6vw, 50px)',
                height: 'auto',
                filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                position: 'relative',
                zIndex: 2
              }}
              onError={(e) => {
                // Fallback ถ้าไฟล์ไม่พบ ใช้ Gamepad2 icon แทน
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = `<svg style="width: clamp(30px, 5vw, 48px); height: clamp(30px, 5vw, 48px); color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="15" x2="15.01" y1="13" y2="13"></line><line x1="18" x2="18.01" y1="11" y2="11"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect></svg>`;
                e.target.parentNode.appendChild(fallback.firstChild);
              }}
            />
            
            {/* Sparkles around logo */}
            <div className="sparkle-1" style={{
              position: 'absolute',
              top: '-12px',
              right: '-12px',
              width: '12px',
              height: '12px',
              background: 'radial-gradient(circle, #fca5a5 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            <div className="sparkle-2" style={{
              position: 'absolute',
              bottom: '-8px',
              left: '-8px',
              width: '10px',
              height: '10px',
              background: 'radial-gradient(circle, #f87171 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            <div className="sparkle-3" style={{
              position: 'absolute',
              top: '50%',
              left: '-14px',
              width: '8px',
              height: '8px',
              background: 'radial-gradient(circle, #fca5a5 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px'
            }}>
              <Sparkles style={{
                width: 'clamp(20px, 3vw, 32px)',
                height: 'clamp(20px, 3vw, 32px)',
                color: '#fca5a5',
                animation: 'pulse 2s infinite, logoSpin 5s linear infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: 'clamp(8px, 1.5vw, 12px)',
          textShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          letterSpacing: '-0.025em',
          animation: isAnimating ? 'fadeInUp 0.6s ease-out 0.3s both' : 'none'
        }}>
          🎮 Quiz Quest
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          marginBottom: 'clamp(24px, 4vw, 40px)',
          animation: isAnimating ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none'
        }}>
          เกมทำข้อสอบสุดมันส์!
        </p>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          {/* Student Button */}
          <button
            onClick={() => handleRoleSelect('student')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: 'white',
              fontWeight: 'bold',
              padding: 'clamp(14px, 2.5vw, 20px) clamp(20px, 3vw, 32px)',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.125rem)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              animation: isAnimating ? 'slideInLeft 0.6s ease-out 0.5s both' : 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 35px -5px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'pulse 2s infinite'
            }}>
              <User style={{
                width: 'clamp(16px, 2.5vw, 20px)',
                height: 'clamp(16px, 2.5vw, 20px)'
              }} />
            </div>
            <span>🎓 ฉันเป็นนักเรียน</span>
          </button>
          
          {/* Teacher Button */}
          <button
            onClick={() => handleRoleSelect('admin')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              color: 'white',
              fontWeight: 'bold',
              padding: 'clamp(14px, 2.5vw, 20px) clamp(20px, 3vw, 32px)',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.125rem)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              animation: isAnimating ? 'slideInRight 0.6s ease-out 0.6s both' : 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 35px -5px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.3)';
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'pulse 2s infinite 0.5s'
            }}>
              <Settings style={{
                width: 'clamp(16px, 2.5vw, 20px)',
                height: 'clamp(16px, 2.5vw, 20px)'
              }} />
            </div>
            <span>⚙️ ฉันเป็นครู</span>
          </button>
        </div>
        
        {/* Animated Dots */}
        <div style={{
          marginTop: 'clamp(20px, 3vw, 32px)',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{
            width: '10px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            animationDelay: '0.3s'
          }}></div>
          <div style={{
            width: '10px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            animationDelay: '0.6s'
          }}></div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
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

        @keyframes logoSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes logoGlow {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 10px 40px -5px rgba(239, 68, 68, 0.7);
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

        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .logo-container:hover .logo-icon {
          animation: logoSpin 1s ease-in-out;
        }

        .sparkle-1 {
          animation: sparkle 3s ease-in-out infinite;
        }

        .sparkle-2 {
          animation: sparkle 3s ease-in-out infinite 0.5s;
        }

        .sparkle-3 {
          animation: sparkle 3s ease-in-out infinite 1s;
        }

        @media (max-height: 600px) {
          h1 {
            margin-bottom: 8px !important;
          }
          p {
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;