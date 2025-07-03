// src/components/student/StudentHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Calendar, Clock, TrendingUp, Award, Zap } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import AnswerReview from '../common/AnswerReview';
import { formatDate, getGradeInfo, getFromLocalStorage } from '../../utils/helpers';
import { t, getLocalizedField } from '../../translations';

const StudentHistoryPage = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    passingCount: 0,
    streak: 0
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // ดึงข้อมูลจาก localStorage
  const studentName = getFromLocalStorage('studentName') || '';
  const studentSchool = getFromLocalStorage('studentSchool');
  const schoolId = studentSchool?.id || null;

  // ตรวจสอบว่ามีข้อมูล student หรือไม่
  useEffect(() => {
    if (!studentName) {
      navigate('/student');
    }
  }, [studentName, navigate]);

  useEffect(() => {
    if (studentName) {
      loadStudentHistory();
    }
  }, [studentName]);

  const loadStudentHistory = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading history for:', studentName, 'School:', schoolId);
      
      // ส่ง schoolId ไปด้วยเพื่อกรองเฉพาะโรงเรียน
      const history = await FirebaseService.getStudentAttempts(studentName, schoolId);
      
      if (history.length > 0) {
        // คำนวณสถิติ
        const totalScore = history.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
        const avgScore = Math.round(totalScore / history.length);
        const bestScore = Math.max(...history.map(attempt => attempt.percentage || 0));
        const totalTime = history.reduce((sum, attempt) => sum + (attempt.totalTime || 0), 0);
        const passingCount = history.filter(attempt => (attempt.percentage || 0) >= 60).length;
        
        // คำนวณ streak (จำนวนครั้งที่ผ่านติดต่อกัน)
        let currentStreak = 0;
        for (const attempt of history) {
          if ((attempt.percentage || 0) >= 60) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        setStats({
          totalQuizzes: history.length,
          averageScore: avgScore,
          bestScore: bestScore,
          totalTime: totalTime,
          passingCount: passingCount,
          streak: currentStreak
        });
      }
      
      setAttempts(history);
      console.log('✅ History loaded:', history.length, 'attempts');
      
    } catch (error) {
      console.error('❌ Error loading student history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    navigate(-1);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    return '#ef4444';
  };

  // ฟังก์ชันโหลด quiz data และเปิด modal
  const handleViewAnswers = async (attempt) => {
    setLoadingQuiz(true);
    try {
      // โหลด quiz data จาก Firebase ถ้ายังไม่มี
      if (!attempt.quiz && attempt.quizId) {
        console.log('📚 Loading quiz data for:', attempt.quizId);
        const quizData = await FirebaseService.getQuiz(attempt.quizId);
        setSelectedReview({
          ...attempt,
          quiz: quizData // เพิ่ม quiz object
        });
      } else {
        setSelectedReview(attempt);
      }
      setShowAnswerReview(true);
    } catch (error) {
      console.error('❌ Error loading quiz:', error);
      // ถ้าโหลดไม่ได้ก็แสดงเฉพาะข้อมูลที่มี
      setSelectedReview(attempt);
      setShowAnswerReview(true);
    } finally {
      setLoadingQuiz(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={t('loading', currentLanguage)} />;
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
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '3%',
        fontSize: '3rem',
        opacity: '0.1',
        animation: 'pulse 3s infinite'
      }}>🏆</div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite'
      }}>⭐</div>

      <div style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{
                  fontSize: '3rem',
                  animation: 'bounce 3s infinite'
                }}>🏆</span>
                {t('scoreHistory', currentLanguage)}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                {studentName} - {studentSchool ? getLocalizedField(studentSchool, 'name', currentLanguage) : t('allSchools', currentLanguage)}
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem'
              }}>
                {t('viewProgressHistory', currentLanguage)} 📈
              </p>
            </div>
            
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ArrowLeft size={16} />
              {t('back', currentLanguage)}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Total Quizzes */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            <Trophy size={32} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalQuizzes}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('quizzesDone', currentLanguage)}</div>
          </div>

          {/* Average Score */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            animation: 'slideUp 0.8s ease-out 0.3s both'
          }}>
            <Target size={32} style={{ color: '#22c55e', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.averageScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('averageScore', currentLanguage)}</div>
          </div>

          {/* Best Score */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}>
            <Award size={32} style={{ color: '#fbbf24', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.bestScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('bestScore', currentLanguage)}</div>
          </div>

          {/* Streak */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.3))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            animation: 'slideUp 0.8s ease-out 0.5s both'
          }}>
            <Zap size={32} style={{ color: '#ec4899', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.streak}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('streakCount', currentLanguage)}</div>
          </div>
        </div>

        {/* History List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'slideUp 0.8s ease-out 0.6s both'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📋 {t('allQuizHistory', currentLanguage)}
          </h2>

          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                {t('noHistoryYet', currentLanguage)}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('tryQuizFirst', currentLanguage)}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {attempts.map((attempt, index) => {
                const gradeInfo = getGradeInfo(attempt.percentage || 0);
                
                return (
                  <div 
                    key={attempt.id || index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      {/* Quiz Info */}
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {attempt.emoji || '📝'} {getLocalizedField(attempt, 'quizTitle', currentLanguage)}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Calendar size={14} />
                          {formatDate(attempt.timestamp)}
                        </div>
                      </div>

                      {/* Score */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: gradeInfo.color,
                          marginBottom: '4px'
                        }}>
                          {gradeInfo.emoji} {attempt.percentage || 0}%
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem'
                        }}>
                          {attempt.score}/{attempt.totalQuestions * 10} {t('score', currentLanguage)}
                        </div>
                      </div>

                      {/* Time */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '4px'
                        }}>
                          <Clock size={14} />
                          {t('timeUsed', currentLanguage)}
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {Math.floor((attempt.totalTime || 0) / 60)}:{((attempt.totalTime || 0) % 60).toString().padStart(2, '0')}
                        </div>
                      </div>

                      {/* Questions */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '4px'
                        }}>
                          {t('totalQuestions', currentLanguage)}
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {attempt.selectedQuestionCount || attempt.totalQuestions} {t('questions', currentLanguage)}
                        </div>
                      </div>
                      
                      {/* View Answers Button */}
                      {attempt.answers && attempt.answers.length > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnswers(attempt);
                              audioService.buttonClick();
                            }}
                            disabled={loadingQuiz}
                             style={{
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                              border: 'none',
                              color: 'white',
                              padding: '10px 20px',
                              borderRadius: '12px',
                              cursor: loadingQuiz ? 'wait' : 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              opacity: loadingQuiz ? 0.7 : 1,
                              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                              if (!loadingQuiz) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea, #7e22ce)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loadingQuiz) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                              }
                            }}
                          >
                            📋 {loadingQuiz ? t('loading', currentLanguage) : t('viewAnswers', currentLanguage)}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Answer Review Modal */}
      {selectedReview && (
        <AnswerReview
          isOpen={showAnswerReview}
          onClose={() => {
            setShowAnswerReview(false);
            setSelectedReview(null);
          }}
          answers={selectedReview.answers || []}
          quiz={selectedReview.quiz}
          quizTitle={getLocalizedField(selectedReview, 'quizTitle', currentLanguage)}
          studentName={selectedReview.studentName}
          score={selectedReview.score}
          percentage={selectedReview.percentage}
          totalTime={selectedReview.totalTime}
          currentLanguage={currentLanguage}
        />
      )}

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
      `}</style>
    </div>
  );
};

export default StudentHistoryPage;