// src/components/student/QuizSelectionModal.jsx - รองรับ 2 ภาษา
import React, { useState, useEffect } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import { t } from '../../translations';

const QuizSelectionModal = ({ isOpen, quiz, allQuizzes, onClose, onStart, currentLanguage = 'th' }) => {
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(20);
  const [isStarting, setIsStarting] = useState(false);

  // ใช้ allQuizzes ที่ส่งมาจาก props แทนการโหลดเอง
  const quizzes = allQuizzes || [];

  // Reset selected count when quiz changes
  useEffect(() => {
    if (quiz && quiz.questions) {
      const totalQuestions = quiz.questions.length;
      if (totalQuestions < 20) {
        // ถ้าน้อยกว่า 20 ข้อ ให้เลือกทำหมดเลย
        setSelectedQuestionCount(totalQuestions);
      } else {
        // ถ้ามี 20 ข้อขึ้นไป ให้เริ่มต้นที่ 20 ข้อ
        setSelectedQuestionCount(20);
      }
    }
  }, [quiz]);

  // Reset starting state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsStarting(false);
    }
  }, [isOpen]);

  const handleStart = async () => {
    if (!selectedQuestionCount || selectedQuestionCount < 1) {
      await audioService.wrongAnswer();
      alert('กรุณาเลือกจำนวนข้อสอบ');
      return;
    }

    setIsStarting(true);
    await audioService.correctAnswer();
    
    // Delay เล็กน้อยเพื่อให้ animation ทำงาน
    setTimeout(() => {
      onStart(selectedQuestionCount);
    }, 300);
  };

  const handleClose = async () => {
    await audioService.navigation();
    onClose();
  };

  const getQuestionCountOptions = () => {
    if (!quiz?.questions) return [];
    
    const totalQuestions = quiz.questions.length;
    const options = [];
    
    // ถ้ามีคำถามน้อยกว่า 20 ข้อ ให้ทำหมดเลย
    if (totalQuestions < 20) {
      options.push(totalQuestions);
    } else {
      // ถ้ามี 20 ข้อขึ้นไป ให้เลือกได้ 20, 30, 40, 50
      const fixedOptions = [20, 30, 40, 50];
      
      fixedOptions.forEach(option => {
        if (option <= totalQuestions) {
          options.push(option);
        }
      });
    }
    
    return options;
  };

  if (!isOpen || !quiz) return null;

  const questionCountOptions = getQuestionCountOptions();
  const totalQuestions = quiz.questions?.length || 0;

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
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
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
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {quiz.title}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem'
          }}>
            📚 {totalQuestions} {t('questions', currentLanguage)}
          </p>
        </div>

        {/* Question Count Selection */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            🎯 {totalQuestions < 20 ? t('questionCountNote', currentLanguage) : t('selectQuestionCountTitle', currentLanguage)}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: totalQuestions < 20 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {questionCountOptions.map((count) => (
              <button
                key={count}
                onClick={async () => {
                  await audioService.buttonClick();
                  setSelectedQuestionCount(count);
                }}
                disabled={totalQuestions < 20} // ถ้าน้อยกว่า 20 ให้ปิดการเลือก
                style={{
                  background: selectedQuestionCount === count
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: selectedQuestionCount === count
                    ? '2px solid #60a5fa'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '16px 12px',
                  borderRadius: '16px',
                  cursor: totalQuestions < 20 ? 'default' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  opacity: totalQuestions < 20 ? 0.8 : 1
                }}
                onMouseEnter={(e) => {
                  if (selectedQuestionCount !== count && totalQuestions >= 20) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedQuestionCount !== count && totalQuestions >= 20) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {count} {currentLanguage === 'th' ? 'ข้อ' : count === 1 ? 'question' : 'questions'}
                {totalQuestions < 20 && (
                  <div style={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    ({t('allQuestions', currentLanguage)})
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} color="#60a5fa" />
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
              {totalQuestions < 20 ? (
                <>
                  <strong>📝 {t('noteQuizHasOnly', currentLanguage)}</strong> {totalQuestions} {t('questionsOnly', currentLanguage)}
                </>
              ) : (
                <>
                  <strong>💡 {t('tip', currentLanguage)}:</strong> {t('questionsWillBeRandomized', currentLanguage)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '16px 24px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            {t('cancel', currentLanguage)}
          </button>

          <button
            onClick={handleStart}
            disabled={isStarting || !selectedQuestionCount}
            style={{
              flex: 2,
              background: isStarting 
                ? 'rgba(34, 197, 94, 0.6)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '16px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              opacity: isStarting ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isStarting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isStarting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            {isStarting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {t('loading', currentLanguage)}...
              </>
            ) : (
              <>
                <Play size={20} />
                <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
                  <div>🚀 {t('startQuiz', currentLanguage)}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    ({selectedQuestionCount} {currentLanguage === 'th' ? 'ข้อ' : selectedQuestionCount === 1 ? 'question' : 'questions'})
                  </div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Selected Quiz Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            🎯 {t('fullScore', currentLanguage)}: <strong style={{ color: 'white' }}>{selectedQuestionCount * 10}</strong> {t('score', currentLanguage)}
            <br />
            ⏱️ {t('timeEstimate', currentLanguage)}: <strong style={{ color: 'white' }}>{selectedQuestionCount * 30}</strong> {t('seconds', currentLanguage)}
            {totalQuestions >= 20 && (
              <>
                <br />
                📊 {t('randomFrom', currentLanguage)}: <strong style={{ color: 'white' }}>{totalQuestions}</strong> {t('questions', currentLanguage)}
              </>
            )}
          </p>
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
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuizSelectionModal;