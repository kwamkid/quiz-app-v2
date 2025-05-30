// src/components/student/ScoreHistory.jsx - หน้าดูคะแนนของนักเรียน
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Calendar, Target, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import { formatDate } from '../../utils/helpers';

const ScoreHistory = ({ studentName, onBack }) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuizzes: 0
  });

  useEffect(() => {
    loadScoreHistory();
  }, [studentName]);

  const loadScoreHistory = async () => {
    try {
      setLoading(true);
      const studentAttempts = await FirebaseService.getStudentAttempts(studentName);
      setAttempts(studentAttempts);
      
      // Calculate stats
      if (studentAttempts.length > 0) {
        const totalScore = studentAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
        const averageScore = Math.round(totalScore / studentAttempts.length);
        const bestScore = Math.max(...studentAttempts.map(attempt => attempt.percentage || 0));
        const uniqueQuizzes = new Set(studentAttempts.map(attempt => attempt.quizId)).size;
        
        setStats({
          totalAttempts: studentAttempts.length,
          averageScore,
          bestScore,
          totalQuizzes: uniqueQuizzes
        });
      }
    } catch (error) {
      console.error('Error loading score history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    return '#ef4444';
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '💪';
    return '📚';
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
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                🏆 ประวัติคะแนนของ {studentName}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem'
              }}>
                ดูผลการทำข้อสอบทั้งหมด
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
                gap: '8px'
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
              <ArrowLeft size={18} />
              กลับ
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Trophy size={32} style={{ color: '#22c55e', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.bestScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนสูงสุด</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <TrendingUp size={32} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.averageScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนเฉลี่ย</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Target size={32} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalAttempts}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ครั้งที่ทำ</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Target size={32} style={{ color: '#ec4899', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalQuizzes}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ข้อสอบที่ทำ</div>
          </div>
        </div>

        {/* Score History */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 ประวัติการทำข้อสอบ
          </h2>

          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                ยังไม่มีประวัติการทำข้อสอบ
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                เริ่มทำข้อสอบเพื่อดูประวัติคะแนนของคุณ
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {attempts.map((attempt, index) => (
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
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {getGradeEmoji(attempt.percentage || 0)} {attempt.quizTitle}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        <Calendar size={14} />
                        {formatDate(attempt.timestamp)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: getScoreColor(attempt.percentage || 0),
                        marginBottom: '4px'
                      }}>
                        {attempt.percentage || 0}%
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {attempt.score}/{attempt.totalQuestions * 10} คะแนน
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      justifyContent: 'center'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '4px'
                        }}>
                          <Target size={14} />
                          คำถาม
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {attempt.totalQuestions} ข้อ
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '4px'
                        }}>
                          <Clock size={14} />
                          เวลา
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {Math.floor((attempt.totalTime || 0) / 60)}:{((attempt.totalTime || 0) % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreHistory;