// src/components/student/StudentHistoryPage.jsx - หน้าดูประวัติคะแนนจริง
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, Calendar, Clock, Target, Award, TrendingUp, BarChart } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import FirebaseService from '../../services/firebase';
import audioService from '../../services/simpleAudio';

const StudentHistoryPage = ({ studentName, onBack }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    recentStreak: 0
  });

  useEffect(() => {
    loadStudentResults();
  }, [studentName]);

  const loadStudentResults = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading results for:', studentName);
      
      const studentResults = await FirebaseService.getStudentResults(studentName);
      setResults(studentResults);
      
      // คำนวณสถิติ
      if (studentResults.length > 0) {
        const totalQuizzes = studentResults.length;
        const totalScore = studentResults.reduce((sum, result) => sum + (result.score || 0), 0);
        const totalPossibleScore = studentResults.reduce((sum, result) => sum + (result.totalQuestions * 10), 0);
        const averageScore = Math.round((totalScore / totalPossibleScore) * 100);
        const bestScore = Math.max(...studentResults.map(result => 
          Math.round((result.score / (result.totalQuestions * 10)) * 100)
        ));
        const totalTime = studentResults.reduce((sum, result) => sum + (result.totalTime || 0), 0);
        
        setStats({
          totalQuizzes,
          averageScore,
          bestScore,
          totalTime: Math.round(totalTime / 60), // แปลงเป็นนาที
          recentStreak: calculateStreak(studentResults)
        });
      }
      
      console.log('✅ Results loaded:', studentResults.length);
    } catch (error) {
      console.error('❌ Error loading student results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (results) => {
    if (results.length === 0) return 0;
    
    let streak = 0;
    for (const result of results) {
      const percentage = (result.score / (result.totalQuestions * 10)) * 100;
      if (percentage >= 70) { // ถือว่าผ่านถ้าได้ 70% ขึ้นไป
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📚';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'from-yellow-400 to-orange-400';
    if (percentage >= 80) return 'from-green-400 to-emerald-400';
    if (percentage >= 70) return 'from-blue-400 to-cyan-400';
    if (percentage >= 60) return 'from-purple-400 to-pink-400';
    return 'from-gray-400 to-gray-500';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'ไม่ทราบวันที่';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดประวัติคะแนน..." />;
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
      }}>📊</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '2%',
        fontSize: '4rem',
        opacity: '0.15',
        animation: 'pulse 5s infinite 1s'
      }}>⭐</div>

      <div style={{
        padding: '20px',
        maxWidth: '1400px',
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
            gap: '20px',
            marginBottom: '24px'
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
                ประวัติคะแนน {studentName}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                ดูผลงานและความก้าวหน้าของคุณ 📈
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
                e.target.style.color = 'white';
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ArrowLeft size={16} />
              กลับ
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '60px 40px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📊</div>
              <h3 style={{
                fontSize: '2rem',
                color: 'white',
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                ยังไม่มีประวัติการทำข้อสอบ
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.2rem'
              }}>
                ลองทำข้อสอบสักข้อแล้วกลับมาดูกันนะ! 🎯
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
              animation: 'slideUp 0.8s ease-out 0.2s both'
            }}>
              {/* Total Quizzes */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <Trophy size={40} color="#60a5fa" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>
                  {stats.totalQuizzes}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ข้อสอบที่ทำ</p>
              </div>

              {/* Average Score */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <Target size={40} color="#34d399" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>
                  {stats.averageScore}%
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนเฉลี่ย</p>
              </div>

              {/* Best Score */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <Award size={40} color="#fbbf24" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>
                  {stats.bestScore}%
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนที่ดีที่สุด</p>
              </div>

              {/* Recent Streak */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3))',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <TrendingUp size={40} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>
                  {stats.recentStreak}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ครั้งที่ผ่านติดต่อกัน</p>
              </div>
            </div>

            {/* Results List */}
            <div style={{
              animation: 'slideUp 0.8s ease-out 0.4s both'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '20px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <BarChart size={24} />
                ประวัติการทำข้อสอบทั้งหมด
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {results.map((result, index) => {
                  const percentage = Math.round((result.score / (result.totalQuestions * 10)) * 100);
                  const gradeEmoji = getGradeEmoji(percentage);
                  const gradeColor = getGradeColor(percentage);
                  
                  return (
                    <div
                      key={result.id || index}
                      style={{
                        background: `linear-gradient(135deg, ${gradeColor.split(' ').map(c => c.replace('from-', 'rgba(').replace('to-', 'rgba(').replace('-400', ', 0.3)')).join(', ')})`,
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }}>
                        {/* Grade & Quiz Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            fontSize: '3rem',
                            animation: `bounce 3s infinite ${index * 0.2}s`
                          }}>
                            {gradeEmoji}
                          </div>
                          <div>
                            <h3 style={{
                              color: 'white',
                              fontSize: '1.3rem',
                              fontWeight: 'bold',
                              margin: '0 0 4px 0'
                            }}>
                              {result.quizTitle}
                            </h3>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <Calendar size={14} />
                              {formatDate(result.timestamp)}
                            </p>
                          </div>
                        </div>

                        {/* Score Info */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: '16px',
                          textAlign: 'center'
                        }}>
                          <div>
                            <div style={{
                              color: 'white',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            }}>
                              {result.score}
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem'
                            }}>
                              คะแนน
                            </div>
                          </div>
                          
                          <div>
                            <div style={{
                              color: 'white',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            }}>
                              {percentage}%
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem'
                            }}>
                              เปอร์เซ็นต์
                            </div>
                          </div>
                          
                          <div>
                            <div style={{
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={16} />
                              {formatTime(result.totalTime || 0)}
                            </div>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem'
                            }}>
                              เวลาที่ใช้
                            </div>
                          </div>
                        </div>

                        {/* Question Count */}
                        <div style={{
                          textAlign: 'center',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px'
                        }}>
                          <div style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            {result.totalQuestions}
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.8rem'
                          }}>
                            ข้อ
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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
      `}</style>
    </div>
  );
};

export default StudentHistoryPage;