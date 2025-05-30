// src/components/student/QuizTaking.jsx - แก้ไขการส่งข้อมูลคะแนน
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Clock, Trophy } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import { getTimerColor, calculatePercentage } from '../../utils/helpers';
import { QUIZ_SETTINGS } from '../../constants';

const QuizTaking = ({ quiz, studentName, onQuizEnd, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SETTINGS.TIME_PER_QUESTION);
  const [quizStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState([]);

  // คำถามถูกสุ่มแล้วจาก QuizList
  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const originalTotalQuestions = quiz.originalTotalQuestions || totalQuestions;
  const selectedQuestionCount = quiz.selectedQuestionCount || totalQuestions;

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        
        if (newTime === 10) {
          audioService.timeWarning();
        }
        if (newTime <= 5 && newTime > 0) {
          audioService.timeWarning();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswerSubmit(null);
    }
  }, [timeLeft, showFeedback]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = async (answerIndex) => {
    if (showFeedback) return;
    
    await audioService.buttonClick();
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = async (answerIndex) => {
    if (showFeedback) return;

    const correct = answerIndex === currentQuestion.correctAnswer;
    const questionScore = correct ? (currentQuestion.points || QUIZ_SETTINGS.POINTS_PER_QUESTION) : 0;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const answerRecord = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.question,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: correct,
      points: questionScore,
      timeUsed: QUIZ_SETTINGS.TIME_PER_QUESTION - timeLeft
    };
    
    setAnswers(prev => [...prev, answerRecord]);

    if (correct) {
      await audioService.correctAnswer();
      setScore(score + questionScore);
    } else {
      await audioService.wrongAnswer();
    }
  };

  // 🔥 แก้ไขหลัก: ปรับการส่งข้อมูลผลลัพธ์
  const handleNextQuestion = async () => {
    await audioService.navigation();
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(QUIZ_SETTINGS.TIME_PER_QUESTION);
    } else {
      await audioService.quizComplete();
      
      const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
      const maxScore = totalQuestions * QUIZ_SETTINGS.POINTS_PER_QUESTION;
      const percentage = Math.round((score / maxScore) * 100);
      
      // 🔥 ข้อมูลที่ครบถ้วนสำหรับบันทึก
      const results = {
        // ข้อมูลพื้นฐาน
        quizId: quiz.id || 'unknown',
        quizTitle: quiz.title,
        studentName: studentName,
        
        // คะแนน
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        
        // เวลา
        totalTime: totalTime,
        completedAt: new Date(),
        
        // ข้อมูลการเลือกคำถาม
        selectedQuestionCount: selectedQuestionCount,
        originalTotalQuestions: originalTotalQuestions,
        
        // รายละเอียดคำตอบ
        answers: answers,
        
        // ข้อมูลเพิ่มเติม
        difficulty: quiz.difficulty || 'ง่าย',
        emoji: quiz.emoji || '📚'
      };
      
      console.log('🏆 Quiz completed with full results:', results);
      onQuizEnd(results);
    }
  };

  const handleBack = async () => {
    const confirmExit = confirm('🚪 คุณแน่ใจหรือไม่ว่าต้องการออกจากข้อสอบ? ผลคะแนนจะไม่ถูกบันทึก');
    if (confirmExit) {
      await audioService.navigation();
      onBack();
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  };

  if (questions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>ไม่พบคำถาม...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '3%',
        fontSize: '3rem',
        opacity: '0.1',
        animation: 'pulse 3s infinite'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite'
      }}>⚡</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '2%',
        fontSize: '4rem',
        opacity: '0.15',
        animation: 'pulse 5s infinite 1s'
      }}>🚀</div>

      <div style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px'
              }}>
                {quiz.emoji} {quiz.title}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem'
              }}>
                สวัสดี {studentName}! 🎮
              </p>
              {selectedQuestionCount < originalTotalQuestions && (
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  marginTop: '4px'
                }}>
                  📊 ทำ {selectedQuestionCount} ข้อ จากทั้งหมด {originalTotalQuestions} ข้อ (สุ่มแล้ว)
                </p>
              )}
            </div>
            
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '8px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'white';
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ArrowLeft size={14} />
              ออก
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem'
              }}>
                ข้อ {currentQuestionIndex + 1} จาก {totalQuestions}
              </span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem'
              }}>
                คะแนน: {score}
              </span>
            </div>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  height: '100%',
                  borderRadius: '10px',
                  transition: 'width 0.5s ease',
                  width: `${getProgressPercentage()}%`
                }}
              ></div>
            </div>
          </div>

          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: getTimerColor(timeLeft),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              animation: timeLeft <= 5 ? 'shake 0.5s infinite' : 'none'
            }}>
              <Clock size={32} className={timeLeft <= 10 ? 'animate-pulse' : ''} />
              <span className={timeLeft <= 5 ? 'animate-pulse' : ''}>{timeLeft}s</span>
            </div>
            {timeLeft <= 10 && (
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                marginTop: '8px',
                animation: 'pulse 1s infinite'
              }}>
                {timeLeft <= 5 ? '⚡ รีบตอบ!' : '⏳ เวลาใกล้หมดแล้ว'}
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.4'
            }}>
              {currentQuestion.question}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {currentQuestion.options.map((option, index) => {
              // ตรวจสอบว่าตัวเลือกมีข้อความหรือไม่
              if (option && option.trim() !== "") {
                let buttonStyle = {
                  width: '100%',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  cursor: showFeedback ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left'
                };
                
                if (showFeedback) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonStyle.background = 'rgba(34, 197, 94, 0.3)';
                    buttonStyle.borderColor = '#22c55e';
                    buttonStyle.color = '#22c55e';
                    buttonStyle.animation = 'pulse 1s infinite';
                  } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                    buttonStyle.background = 'rgba(239, 68, 68, 0.3)';
                    buttonStyle.borderColor = '#ef4444';
                    buttonStyle.color = '#ef4444';
                  } else {
                    buttonStyle.background = 'rgba(255, 255, 255, 0.05)';
                    buttonStyle.borderColor = 'rgba(255, 255, 255, 0.2)';
                    buttonStyle.color = 'rgba(255, 255, 255, 0.5)';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonStyle.background = 'rgba(59, 130, 246, 0.3)';
                    buttonStyle.borderColor = '#3b82f6';
                    buttonStyle.color = '#60a5fa';
                  } else {
                    buttonStyle.background = 'rgba(255, 255, 255, 0.1)';
                    buttonStyle.borderColor = 'rgba(255, 255, 255, 0.3)';
                    buttonStyle.color = 'white';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      if (!showFeedback && selectedAnswer !== index) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showFeedback && selectedAnswer !== index) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span style={{ flex: 1 }}>{option}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            {!showFeedback ? (
              <button
                onClick={() => handleAnswerSubmit(selectedAnswer)}
                disabled={selectedAnswer === null}
                style={{
                  background: selectedAnswer !== null 
                    ? 'linear-gradient(135deg, #ec4899, #be185d)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: selectedAnswer !== null ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  boxShadow: selectedAnswer !== null ? '0 8px 20px rgba(236, 72, 153, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedAnswer !== null) {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 25px rgba(236, 72, 153, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnswer !== null) {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)';
                  }
                }}
              >
                <Target size={20} />
                ตอบ!
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: isCorrect ? '#22c55e' : '#ef4444',
                  marginBottom: '24px',
                  animation: 'slideUp 0.5s ease-out'
                }}>
                  {isCorrect ? (
                    <>🎉 ถูกต้อง! +{currentQuestion.points || QUIZ_SETTINGS.POINTS_PER_QUESTION} คะแนน</>
                  ) : (
                    <>❌ ผิด! คำตอบที่ถูกคือ {String.fromCharCode(65 + currentQuestion.correctAnswer)}</>
                  )}
                </div>
                
                <button
                  onClick={handleNextQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    margin: '0 auto',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      <ArrowLeft style={{ transform: 'rotate(180deg)' }} size={20} />
                      ข้อถัดไป
                    </>
                  ) : (
                    <>
                      <Trophy size={20} />
                      เสร็จสิ้น!
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
            transform: scale(1.05);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        
        .animate-pulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default QuizTaking;