// src/components/student/StudentLogin.jsx
import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import { saveToLocalStorage } from '../../utils/helpers';
import { t } from '../../translations';

const StudentLogin = ({ onNameSubmit, onBack, currentLanguage = 'th' }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      await audioService.wrongAnswer();
      return;
    }

    setIsLoading(true);
    
    try {
      await audioService.achievement();
      
      // Save name to localStorage
      saveToLocalStorage('studentName', name.trim());
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        onNameSubmit(name.trim());
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error during name submission:', error);
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
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
        animation: 'bounce 3s infinite'
      }}>🌟</div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        fontSize: '3rem',
        opacity: '0.2',
        animation: 'pulse 2s infinite'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        fontSize: '5rem',
        opacity: '0.15',
        animation: 'bounce 4s infinite 1s'
      }}>🚀</div>

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
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                boxShadow: '0 15px 30px rgba(251, 191, 36, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}>
                <User size={32} color="white" />
              </div>
              
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '1.5rem',
                animation: 'spin 3s linear infinite'
              }}>⭐</div>
            </div>
            
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              🎉 {t('welcome', currentLanguage)}
            </h2>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem'
            }}>
              {t('enterNickname', currentLanguage)}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            <div style={{
              position: 'relative',
              marginBottom: '32px'
            }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`✨ ${t('yourNickname', currentLanguage)}`}
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
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && name.trim() && !isLoading) {
                    handleSubmit(e);
                  }
                }}
              />
              
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.5rem',
                color: 'rgba(255, 255, 255, 0.5)',
                pointerEvents: 'none'
              }}>
                ✨
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              style={{
                width: '100%',
                background: name.trim() && !isLoading
                  ? 'linear-gradient(135deg, #ec4899, #be185d)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: name.trim() && !isLoading ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: name.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: name.trim() && !isLoading 
                  ? '0 10px 25px rgba(236, 72, 153, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (name.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(236, 72, 153, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (name.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(236, 72, 153, 0.3)';
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
                  }} />
                  <span>{t('loading', currentLanguage)}...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>{t('letsStart', currentLanguage)}</span>
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
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              {t('backToHome', currentLanguage)}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
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
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default StudentLogin;