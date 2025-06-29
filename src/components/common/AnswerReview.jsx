// src/components/common/AnswerReview.jsx
import React from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { t } from '../../translations';

const AnswerReview = ({ 
  isOpen, 
  onClose, 
  answers, 
  quiz, // เพิ่ม quiz object เพื่อเข้าถึงข้อมูลคำถาม-ตัวเลือก
  quizTitle, 
  studentName,
  score,
  percentage,
  totalTime,
  currentLanguage = 'th',
  isAdmin = false 
}) => {
  if (!isOpen || !answers) return null;

  // ใช้ currentLanguage จาก props โดยตรง
  const displayLanguage = currentLanguage;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ฟังก์ชันดึงคำถามตามภาษา
  const getQuestionText = (answer, questionData, language) => {
    // ถ้ามี questionData (quiz object) ให้ใช้ก่อนเสมอ
    if (questionData) {
      if (language === 'en' && questionData.questionEn) {
        return questionData.questionEn;
      } else if (language === 'th' && questionData.questionTh) {
        return questionData.questionTh;
      } else if (questionData.question) {
        return questionData.question;
      }
    }
    
    // ถ้าไม่มี questionData ค่อยใช้จาก answer
    if (language === 'en' && answer.questionEn) {
      return answer.questionEn;
    } else if (language === 'th' && answer.questionTh) {
      return answer.questionTh;
    }
    
    // Fallback
    return answer.question || '';
  };

  // ฟังก์ชันดึงตัวเลือกตามภาษา
  const getOptionText = (answer, questionData, optionIndex, isCorrectAnswer = false, language) => {
    // ถ้ามี questionData ให้ใช้ก่อน
    if (questionData) {
      if (language === 'en' && questionData.optionsEn && questionData.optionsEn[optionIndex]) {
        return questionData.optionsEn[optionIndex];
      } else if (questionData.options && questionData.options[optionIndex]) {
        return questionData.options[optionIndex];
      }
    }
    
    // ถ้าไม่มี questionData ใช้จาก answer
    if (language === 'en') {
      if (isCorrectAnswer && answer.correctOptionEn) {
        return answer.correctOptionEn;
      } else if (!isCorrectAnswer && answer.selectedOptionEn) {
        return answer.selectedOptionEn;
      }
    }
    
    // Fallback to Thai or original
    if (isCorrectAnswer) {
      return answer.correctOptionTh || answer.correctOption || '';
    } else {
      return answer.selectedOptionTh || answer.selectedOption || '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📋 {t('answerReview', displayLanguage)}
              </h2>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <div style={{ marginBottom: '4px' }}>
                  📚 {quizTitle}
                </div>
                {isAdmin && (
                  <div style={{ marginBottom: '4px' }}>
                    👤 {studentName}
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <span>💯 {score} {t('score', displayLanguage)} ({percentage}%)</span>
                  <span>⏱️ {formatTime(totalTime)}</span>
                  <span>✅ {t('correctCount', displayLanguage)} {answers.filter(a => a.isCorrect).length}/{answers.length} {t('ofQuestions', displayLanguage)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={t('close', displayLanguage)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {answers.map((answer, index) => {
              // ดึงข้อมูลคำถามจาก quiz object (ถ้ามี)
              const questionData = quiz?.questions?.[answer.questionIndex] || null;
              
              return (
                <div
                  key={index}
                  style={{
                    background: answer.isCorrect 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: `1px solid ${answer.isCorrect 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  {/* Question Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {getQuestionText(answer, questionData, displayLanguage)}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: answer.isCorrect ? '#22c55e' : '#ef4444'
                      }}>
                        {answer.isCorrect ? (
                          <>
                            <CheckCircle size={16} />
                            <span>{t('correct', displayLanguage)}</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            <span>{t('incorrect', displayLanguage).split('!')[0]}</span>
                          </>
                        )}
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          (+{answer.points || 0} {t('points', displayLanguage)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginLeft: '44px'
                  }}>
                    {/* คำตอบที่เลือก */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: answer.isCorrect 
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        marginBottom: '4px'
                      }}>
                        {t('yourAnswer', displayLanguage)}
                      </div>
                      <div style={{
                        color: answer.isCorrect ? '#22c55e' : '#ef4444',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          {String.fromCharCode(65 + answer.selectedAnswer)}
                        </span>
                        <span style={{ flex: 1 }}>
                          {getOptionText(answer, questionData, answer.selectedAnswer, false, displayLanguage)}
                        </span>
                      </div>
                    </div>

                    {/* คำตอบที่ถูก (ถ้าตอบผิด) */}
                    {!answer.isCorrect && (
                      <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem',
                          marginBottom: '4px'
                        }}>
                          {t('correctAnswer', displayLanguage)}
                        </div>
                        <div style={{
                          color: '#22c55e',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <span style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                            {String.fromCharCode(65 + answer.correctAnswer)}
                          </span>
                          <span style={{ flex: 1 }}>
                            {getOptionText(answer, questionData, answer.correctAnswer, true, displayLanguage)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* เวลาที่ใช้ */}
                    {answer.timeUsed && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '4px'
                      }}>
                        <Clock size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span style={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.85rem'
                        }}>
                          {t('timeUsedPerQuestion', displayLanguage)}: {answer.timeUsed} {t('secondsUnit', displayLanguage)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            {t('close', displayLanguage)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerReview;