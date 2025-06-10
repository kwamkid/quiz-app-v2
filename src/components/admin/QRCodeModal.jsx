// src/components/admin/QRCodeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Printer, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import audioService from '../../services/simpleAudio';

const QRCodeModal = ({ isOpen, quiz, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  
  // สร้าง URL สำหรับข้อสอบ
  const getQuizUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?quiz=${quiz?.id}`;
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getQuizUrl());
      await audioService.correctAnswer();
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('quiz-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = qrSize + 100; // เพิ่มขอบ
      canvas.height = qrSize + 160; // เพิ่มพื้นที่สำหรับข้อความ
      
      // พื้นหลังขาว
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // วาด QR Code
      ctx.drawImage(img, 50, 50, qrSize, qrSize);
      
      // เพิ่มข้อความ
      ctx.fillStyle = 'black';
      ctx.font = 'bold 24px IBM Plex Sans Thai';
      ctx.textAlign = 'center';
      ctx.fillText(quiz.title, canvas.width / 2, 40);
      
      ctx.font = '16px IBM Plex Sans Thai';
      ctx.fillText('สแกน QR Code เพื่อเริ่มทำข้อสอบ', canvas.width / 2, qrSize + 80);
      ctx.fillText(`รหัส: ${quiz.id}`, canvas.width / 2, qrSize + 105);
      
      // ดาวน์โหลด
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR-${quiz.title.replace(/[^a-z0-9]/gi, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    audioService.buttonClick();
  };

  const handlePrint = () => {
    audioService.buttonClick();
    const printWindow = window.open('', '_blank');
    const quizUrl = getQuizUrl();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${quiz.title}</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&display=swap");
            
            body {
              font-family: 'IBM Plex Sans Thai', sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e5e5;
              border-radius: 20px;
              background: white;
            }
            
            h1 {
              color: #333;
              margin-bottom: 10px;
              font-size: 2.5rem;
            }
            
            .emoji {
              font-size: 3rem;
              margin-bottom: 20px;
            }
            
            .qr-wrapper {
              margin: 30px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 15px;
              display: inline-block;
            }
            
            .info {
              margin-top: 30px;
              padding: 20px;
              background: #f0f9ff;
              border-radius: 10px;
              border: 1px solid #bae6fd;
            }
            
            .info p {
              margin: 5px 0;
              color: #0369a1;
              font-size: 1.1rem;
            }
            
            .url {
              margin-top: 20px;
              padding: 15px;
              background: #f3f4f6;
              border-radius: 8px;
              font-family: monospace;
              font-size: 0.9rem;
              color: #374151;
              word-break: break-all;
            }
            
            .instructions {
              margin-top: 30px;
              padding: 25px;
              background: #fef3c7;
              border-radius: 10px;
              border: 1px solid #fde68a;
            }
            
            .instructions h3 {
              color: #92400e;
              margin-bottom: 15px;
            }
            
            .instructions ol {
              text-align: left;
              color: #78350f;
              line-height: 1.8;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">${quiz.emoji}</div>
            <h1>${quiz.title}</h1>
            
            <div class="qr-wrapper">
              ${document.getElementById('quiz-qr-code').outerHTML}
            </div>
            
            <div class="info">
              <p><strong>📱 สแกน QR Code เพื่อเริ่มทำข้อสอบ</strong></p>
              <p>📝 จำนวน ${quiz.questions?.length || 0} ข้อ | 🎯 ระดับ${quiz.difficulty}</p>
            </div>
            
            <div class="url">
              <strong>URL:</strong> ${quizUrl}
            </div>
            
            <div class="instructions">
              <h3>📋 วิธีการใช้งาน:</h3>
              <ol>
                <li>เปิดกล้องโทรศัพท์มือถือ</li>
                <li>สแกน QR Code ด้านบน</li>
                <li>กดลิงก์ที่ปรากฏขึ้น</li>
                <li>ใส่ชื่อและเริ่มทำข้อสอบ</li>
              </ol>
            </div>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleShare = async () => {
    const shareData = {
      title: `ข้อสอบ: ${quiz.title}`,
      text: `สแกน QR Code หรือคลิกลิงก์เพื่อทำข้อสอบ "${quiz.title}"`,
      url: getQuizUrl()
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await audioService.correctAnswer();
      } else {
        // Fallback to copy
        await handleCopyLink();
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  if (!isOpen || !quiz) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            color: '#374151',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.color = '#374151';
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '16px',
            animation: 'bounce 2s infinite'
          }}>
            {quiz.emoji}
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {quiz.title}
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            สแกน QR Code เพื่อเข้าทำข้อสอบ
          </p>
        </div>

        {/* QR Code */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <QRCode
            id="quiz-qr-code"
            value={getQuizUrl()}
            size={qrSize}
            style={{ width: '100%', height: 'auto', maxWidth: `${qrSize}px` }}
            bgColor="#FFFFFF"
            fgColor="#1f2937"
            level="Q"
          />
          
          {/* QR Size Selector */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ขนาด:</span>
            {[128, 256, 512].map(size => (
              <button
                key={size}
                onClick={() => setQrSize(size)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: qrSize === size ? '#3b82f6' : '#e5e7eb',
                  color: qrSize === size ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* URL Display */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            color: '#374151',
            wordBreak: 'break-all',
            margin: 0,
            paddingRight: '40px'
          }}>
            {getQuizUrl()}
          </p>
          <button
            onClick={handleCopyLink}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: copied ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </button>
        </div>

        {/* Info */}
        <div style={{
          background: '#eff6ff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #dbeafe'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 4px 0' }}>
                จำนวนข้อ
              </p>
              <p style={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                {quiz.questions?.length || 0} คำถาม
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 4px 0' }}>
                ระดับ
              </p>
              <p style={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                {quiz.difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <button
            onClick={handleDownloadQR}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={18} />
            ดาวน์โหลด
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Printer size={18} />
            พิมพ์
          </button>

          {/* Share Button - Full Width */}
          {navigator.share && (
            <button
              onClick={handleShare}
              style={{
                gridColumn: 'span 2',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Share2 size={18} />
              แชร์
            </button>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fef3c7',
          borderRadius: '12px',
          border: '1px solid #fde68a'
        }}>
          <h4 style={{
            color: '#92400e',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 วิธีใช้งาน
          </h4>
          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#78350f',
            lineHeight: '1.8'
          }}>
            <li>ให้นักเรียนเปิดกล้องมือถือ</li>
            <li>สแกน QR Code หรือใช้ลิงก์ด้านบน</li>
            <li>ใส่ชื่อและเริ่มทำข้อสอบได้ทันที</li>
          </ol>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
      `}</style>
    </div>
  );
};

export default QRCodeModal;