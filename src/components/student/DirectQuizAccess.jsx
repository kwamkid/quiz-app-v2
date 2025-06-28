// src/components/student/DirectQuizAccess.jsx - รองรับ 2 ภาษา
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, AlertCircle, Loader } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import QuizSelectionModal from './QuizSelectionModal';
import FirebaseService from '../../services/firebase';
import audioService from '../../services/simpleAudio';
import { t } from '../../translations';
import { getFromLocalStorage } from '../../utils/helpers';
import { QUIZ_SETTINGS } from '../../constants'; // เพิ่ม import

const DirectQuizAccess = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // ดึงข้อมูลจาก localStorage
  const studentName = getFromLocalStorage('studentName') || '';

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      console.log('🎯 Loading quiz directly:', quizId);
      
      const quizData = await FirebaseService.getQuiz(quizId);
      
      if (quizData) {
        setQuiz(quizData);
        console.log('✅ Quiz loaded:', quizData.title);
      } else {
        throw new Error(t('quizNotFound', currentLanguage));
      }
    } catch (error) {
      console.error('❌ Error loading quiz:', error);
      setError(error.message || t('errorLoadingQuiz', currentLanguage));
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (questionCount) => {
    if (quiz) {
      await audioService.correctAnswer();
      
      // สุ่มคำถามและเลือกจำนวนที่ต้องการ
      const shuffledQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);
      
      const quizWithSelectedQuestions = {
        ...quiz,
        questions: selectedQuestions,
        originalTotalQuestions: quiz.questions.length,
        selectedQuestionCount: questionCount
      };
      
      setShowQuizModal(false);
      
      // Save quiz data to sessionStorage for QuizTaking to use
      sessionStorage.setItem('currentQuiz', JSON.stringify(quizWithSelectedQuestions));
      
      navigate(`/student/quiz/${quiz.id}/take`);
    }
  };

  const handleQuickStart = async () => {
    if (quiz.questions?.length > 0) {
      await audioService.buttonClick();
      
      // ถ้ามีคำถามมากกว่า 20 ข้อ ให้แสดง modal
      if (quiz.questions.length > 20) {
        setShowQuizModal(true);
      } else {
        // ถ้าน้อยกว่าหรือเท่ากับ 20 ข้อ ให้เริ่มทันที
        handleStartQuiz(quiz.questions.length);
      }
    } else {
      await audioService.wrongAnswer();
      alert(t('noQuestionsAlert', currentLanguage));
    }
  };

  const handleGoToHome = async () => {
    await audioService.navigation();
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message={t('loading', currentLanguage)} />;
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '24px',
            animation: 'shake 0.5s ease-in-out'
          }}>😕</div>
          
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
          }}>
            {t('quizNotFound', currentLanguage)}
          </h2>
          
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <p style={{
              color: '#fca5a5',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} />
              {error}
            </p>
          </div>
          
          <button
            onClick={handleGoToHome}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
            }}
          >
            🏠 {t('backToHome', currentLanguage)}
          </button>
        </div>
      </div>
    );
  }

  // แสดงชื่อข้อสอบตามภาษา
  const quizTitle = currentLanguage === 'th' 
    ? (quiz.title || quiz.titleTh)
    : (quiz.titleEn || quiz.title);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Floating Background Elements */}
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
      }}>📱</div>

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
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Emoji and Title */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '24px',
            animation: 'bounce 3s infinite'
          }}>
            {quiz.emoji}
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {quizTitle}
          </h1>
          
          {studentName && (
            <p style={{
              fontSize: '1.3rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '32px'
            }}>
              👋 {t('hello', currentLanguage)} {studentName}!
            </p>
          )}

          {/* Quiz Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {quiz.questions?.length || 0}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem'
                }}>
                  {t('questions', currentLanguage)}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {(quiz.questions?.length || 0) * 10}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem'
                }}>
                  {t('fullScore', currentLanguage)}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {(quiz.questions?.length || 0) * QUIZ_SETTINGS.MINUTES_PER_QUESTION}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem'
                }}>
                  {currentLanguage === 'th' ? 'นาที' : 'Minutes'}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {t(quiz.difficulty?.toLowerCase() || 'easy', currentLanguage)}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem'
                }}>
                  {t('difficulty', currentLanguage)}
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          {quiz.questions?.length > 20 && (
            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              <p style={{
                color: '#fde68a',
                margin: 0,
                fontSize: '1rem'
              }}>
                💡 {t('quizHasMany', currentLanguage).replace('{count}', quiz.questions.length)}
              </p>
            </div>
          )}

          {/* Login Status Check */}
          {!studentName && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <p style={{
                color: '#93c5fd',
                margin: 0,
                fontSize: '1rem'
              }}>
                📝 กรุณาล็อกอินก่อนทำข้อสอบ
              </p>
            </div>
          )}

          {/* Start Button */}
          {studentName ? (
            <button
              onClick={handleQuickStart}
              disabled={!quiz.questions || quiz.questions.length === 0}
              style={{
                width: '100%',
                background: quiz.questions?.length > 0 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: quiz.questions?.length > 0 ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: quiz.questions?.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: quiz.questions?.length > 0 
                  ? '0 12px 30px rgba(16, 185, 129, 0.4)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (quiz.questions?.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (quiz.questions?.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              <Play size={24} />
              {quiz.questions?.length > 20 
                ? t('selectAndStart', currentLanguage) 
                : `🚀 ${t('startQuiz', currentLanguage)}`}
            </button>
          ) : (
            <button
              onClick={() => navigate('/student')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.4)';
              }}
            >
              🔐 ล็อกอินเพื่อทำข้อสอบ
            </button>
          )}

          {/* Alternative Actions */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <button
              onClick={handleGoToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                cursor: 'pointer',
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
              {t('goToQuizList', currentLanguage)}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Selection Modal */}
      <QuizSelectionModal
        isOpen={showQuizModal}
        quiz={quiz}
        allQuizzes={quiz ? [quiz] : []}
        onClose={() => setShowQuizModal(false)}
        onStart={handleStartQuiz}
        currentLanguage={currentLanguage}
      />

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
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default DirectQuizAccess;