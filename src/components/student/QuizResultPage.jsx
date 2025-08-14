// src/components/student/QuizResultPage.jsx - รองรับ 2 ภาษา
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Trophy, Zap, Target } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import AnswerReview from '../common/AnswerReview';
import { t } from '../../translations';


const QuizResultPage = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // รับ results จาก location.state
  const results = location.state?.results;

  // ถ้าไม่มี results ให้กลับไปหน้า categories
  useEffect(() => {
    if (!results) {
      navigate('/student/categories');
    }
  }, [results, navigate]);

  useEffect(() => {
    if (results) {
      playSound('success');
      saveResults();
    }
  }, [results]);

  const playSound = async (type) => {
    try {
      if (type === 'success') {
        await audioService.quizComplete();
      }
    } catch (error) {
      console.warn('Sound play failed:', error);
    }
  };

 const saveResults = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Saving quiz results:', results);
      
      // เพิ่มข้อมูล quiz ที่สุ่มแล้วเข้าไปด้วย
      const resultsWithQuiz = {
        ...results,
        // บันทึก quiz object ที่มีคำถามเรียงตามลำดับที่สุ่มแล้ว
        quizData: results.quiz
      };
      
      // Save to Firebase
      await FirebaseService.saveQuizResult(resultsWithQuiz);
      
      setSaved(true);
      console.log('✅ Results saved successfully with quiz data');
    } catch (error) {
      console.error('❌ Error saving results:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreMessage = () => {
    const percentage = results?.percentage || 0;
    
    if (percentage >= 90) return { 
      message: t('excellent', currentLanguage), 
      emoji: "🎉", 
      color: "text-yellow-300" 
    };
    if (percentage >= 80) return { 
      message: t('veryGood', currentLanguage), 
      emoji: "⭐", 
      color: "text-green-300" 
    };
    if (percentage >= 70) return { 
      message: t('good', currentLanguage), 
      emoji: "😊", 
      color: "text-blue-300" 
    };
    if (percentage >= 60) return { 
      message: t('keepTrying', currentLanguage), 
      emoji: "🤗", 
      color: "text-orange-300" 
    };
    return { 
      message: t('moreStudy', currentLanguage), 
      emoji: "💪", 
      color: "text-red-300" 
    };
  };

  const handleBackToHome = async () => {
    await audioService.buttonClick();
    navigate('/student/quizzes');
  };

  const handleViewHistory = async () => {
    await audioService.buttonClick();
    navigate('/student/history');
  };

  if (!results) {
    return null;
  }

  const scoreInfo = getScoreMessage();
  
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Celebration Background */}
      <div style={{ position: 'absolute', inset: '0', overflow: 'hidden' }}>
        <FloatingElement delay={0}>
          <div style={{ position: 'absolute', top: '20px', left: '10px', fontSize: '6rem', opacity: '0.3' }}>🎊</div>
        </FloatingElement>
        <FloatingElement delay={1}>
          <div style={{ position: 'absolute', top: '40px', right: '20px', fontSize: '4rem', opacity: '0.4' }}>🏆</div>
        </FloatingElement>
        <FloatingElement delay={2}>
          <div style={{ position: 'absolute', bottom: '40px', left: '20px', fontSize: '5rem', opacity: '0.35' }}>⭐</div>
        </FloatingElement>
        <FloatingElement delay={0.5}>
          <div style={{ position: 'absolute', bottom: '20px', right: '10px', fontSize: '4rem', opacity: '0.3' }}>🎉</div>
        </FloatingElement>
      </div>

      <div style={{ 
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '48px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Trophy Animation */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '8rem', 
              marginBottom: '16px',
              animation: 'bounce 1s ease-in-out'
            }}>
              {scoreInfo.emoji}
            </div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {t('completed', currentLanguage)}
            </h1>
            <p style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: scoreInfo.color,
              marginBottom: '8px'
            }}>
              {scoreInfo.message}
            </p>
          </div>

  {/* Score Card */}
  <div style={{
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {results.score}
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('scoreObtained', currentLanguage)}</div>
      </div>
      <div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {/* ✅ แก้ไข: ใช้ maxScore ที่คำนวณมาจาก QuizTaking แทน totalQuestions * 10 */}
          {results.maxScore || results.totalQuestions * 10}
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('fullScore', currentLanguage)}</div>
      </div>
      <div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {results.totalQuestions}
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('totalQuestions', currentLanguage)}</div>
      </div>
      <div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
          {Math.floor(results.totalTime / 60)}:{(results.totalTime % 60).toString().padStart(2, '0')}
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('timeUsed', currentLanguage)}</div>
      </div>
    </div>
  </div>

          {/* Percentage Display */}
          <div style={{
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {results.percentage}%
            </div>
          </div>

          {/* Quiz Info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
              📚 {results.quizTitle}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {t('by', currentLanguage)} {results.studentName}
            </p>
            {results.studentSchool && (
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '4px' }}>
                🏫 {currentLanguage === 'th' 
                  ? results.studentSchool.nameTh 
                  : (results.studentSchool.nameEn || results.studentSchool.nameTh)}
              </p>
            )}
          </div>

          {/* Save Status */}
          {isSaving && (
            <div style={{
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {t('savingScore', currentLanguage)}
            </div>
          )}
          
          {saved && (
            <div style={{
              marginBottom: '24px',
              color: '#10b981',
              fontWeight: 'bold'
            }}>
              ✅ {t('scoreSaved', currentLanguage)}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={handleBackToHome}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
            >
              <ArrowLeft size={20} />
              {t('backToHome', currentLanguage)}
            </button>
            
            <button
              onClick={handleViewHistory}
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
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Trophy size={20} />
              {t('viewAllScores', currentLanguage)}
            </button>

            <button
              onClick={() => setShowAnswerReview(true)}
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
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              📋 {t('viewAnswers', currentLanguage)}
            </button>


          </div>
        </div>
      </div>
      {/* Answer Review Modal */}
      <AnswerReview
        isOpen={showAnswerReview}
        onClose={() => setShowAnswerReview(false)}
        answers={results.answers || []}
        quiz={results.quiz} // เพิ่ม quiz object
        quizTitle={results.quizTitle}
        studentName={results.studentName}
        score={results.score}
        percentage={results.percentage}
        totalTime={results.totalTime}
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
      `}</style>
    </div>
  );
};

// Floating Element Component
const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
  <div 
    style={{ 
      animation: `bounce ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    {children}
  </div>
);

export default QuizResultPage;