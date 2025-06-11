// src/components/common/GlobalHeader.jsx
import React from 'react';
import { Globe, Volume2, VolumeX } from 'lucide-react';
import audioService from '../../services/simpleAudio';

const GlobalHeader = ({ 
  currentLanguage, 
  onLanguageChange, 
  musicEnabled, 
  onMusicToggle,
  hideOnPages = []
}) => {
  
  // ตรวจสอบว่าอยู่ในหน้าที่ต้องการซ่อน header หรือไม่
  if (hideOnPages.includes(window.location.pathname)) {
    return null;
  }

  const handleLanguageToggle = async () => {
    console.log('🔵 Language button clicked! Current:', currentLanguage);
    await audioService.buttonClick();
    const newLang = currentLanguage === 'th' ? 'en' : 'th';
    console.log('🔵 Switching to:', newLang);
    onLanguageChange(newLang);
  };

  const handleMusicToggle = async () => {
    await audioService.buttonClick();
    onMusicToggle();
  };

  return (
    <>
      {/* Spacer div เพื่อไม่ให้ content ถูกทับ */}
      <div style={{ height: '60px' }} />
      
      {/* Header Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '100%',
          padding: '0 20px',
          gap: '12px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={currentLanguage === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            <Globe size={16} />
            <span style={{ fontWeight: 'bold' }}>
              {currentLanguage === 'th' ? 'TH' : 'EN'}
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              ({currentLanguage === 'th' ? '→ EN' : '→ TH'})
            </span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={handleMusicToggle}
            style={{
              background: musicEnabled 
                ? 'rgba(103, 236, 156, 0.67)'
                : 'rgba(255, 255, 255, 0.1)',
              border: musicEnabled
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '13px 15px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              if (!musicEnabled) {
                e.currentTarget.style.background = 'rgba(103, 236, 156, 0.67)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              if (!musicEnabled) {
                e.currentTarget.style.background = 'rgba(219, 34, 34, 0.62)';
              }
            }}
            title={musicEnabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
          >
            {musicEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default GlobalHeader;