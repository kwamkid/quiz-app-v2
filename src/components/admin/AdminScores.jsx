// src/components/admin/AdminScores.jsx - ปิด Firebase ชั่วคราว
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Target, Calendar, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
// import FirebaseService from '../../services/firebase'; // ปิดชั่วคราว
import { formatDate } from '../../utils/helpers';

const AdminScores = ({ onBack }) => {
  const [allAttempts, setAllAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
    topScore: 0
  });

  // Mock data for testing
  const MOCK_ATTEMPTS = [
    {
      id: 'mock-1',
      studentName: 'นักเรียน A',
      quizTitle: 'คณิตศาสตร์ ป.6',
      quizId: 'quiz-1',
      score: 80,
      totalQuestions: 10,
      percentage: 80,
      totalTime: 120,
      timestamp: { seconds: Date.now() / 1000 }
    },
    {
      id: 'mock-2', 
      studentName: 'นักเรียน B',
      quizTitle: 'วิทยาศาสตร์',
      quizId: 'quiz-2',
      score: 90,
      totalQuestions: 10,
      percentage: 90,
      totalTime: 100,
      timestamp: { seconds: (Date.now() / 1000) - 3600 }
    }
  ];

  const MOCK_QUIZZES = [
    { id: 'quiz-1', title: 'คณิตศาสตร์ ป.6', emoji: '🧮' },
    { id: 'quiz-2', title: 'วิทยาศาสตร์', emoji: '🔬' }
  ];

  // โหลดข้อมูล Mock แทน Firebase
  useEffect(() => {
    console.log('🧪 AdminScores useEffect - MOCK MODE');
    
    const loadMockData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading MOCK admin scores data...');
        
        // จำลอง delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ตั้งค่า Mock Data
        setAllAttempts(MOCK_ATTEMPTS);
        setFilteredAttempts(MOCK_ATTEMPTS);
        setQuizzes(MOCK_QUIZZES);
        
        // Calculate mock stats
        const uniqueStudents = new Set(MOCK_ATTEMPTS.map(attempt => attempt.studentName)).size;
        const totalScore = MOCK_ATTEMPTS.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
        const averageScore = Math.round(totalScore / MOCK_ATTEMPTS.length);
        const topScore = Math.max(...MOCK_ATTEMPTS.map(attempt => attempt.percentage || 0));
        
        setStats({
          totalStudents: uniqueStudents,
          totalAttempts: MOCK_ATTEMPTS.length,
          averageScore,
          topScore
        });
        
        console.log('✅ MOCK admin scores loaded');
      } catch (error) {
        console.error('❌ Error loading MOCK admin scores:', error);
      } finally {
        setLoading(false);
        console.log('🏁 MOCK loading completed');
      }
    };

    loadMockData();
  }, []); // Empty dependency - โหลดครั้งเดียว

  // Filter function - แยกออกมา
  const filterAttempts = () => {
    console.log('🔍 Filtering attempts - searchTerm:', searchTerm, 'selectedQuiz:', selectedQuiz);
    let filtered = [...allAttempts];
    
    // Filter by search term (student name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(attempt => 
        attempt.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by quiz
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(attempt => attempt.quizId === selectedQuiz);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
      const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
      return dateB - dateA;
    });
    
    setFilteredAttempts(filtered);
    console.log('✅ Filtered:', filtered.length, 'attempts');
  };

  // Filter เมื่อ search/filter เปลี่ยน
  useEffect(() => {
    console.log('🔄 Filter useEffect triggered');
    filterAttempts();
  }, [searchTerm, selectedQuiz]); // ไม่ใส่ allAttempts ใน dependency

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

  console.log('🔄 AdminScores render - loading:', loading, 'attempts:', allAttempts.length);

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูลคะแนน... (Mock)" />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Debug Info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        zIndex: 1000
      }}>
        🧪 Admin Mock Mode | Attempts: {allAttempts.length} | Filtered: {filteredAttempts.length}
      </div>

      <div style={{
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
                📊 ระบบดูคะแนนนักเรียน (Mock)
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem'
              }}>
                ติดตามผลการเรียนรู้ของนักเรียนทุกคน
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
            >
              <ArrowLeft size={18} />
              กลับ
            </button>
          </div>

          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <input
                type="text"
                placeholder="🔍 ค้นหาชื่อนักเรียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Filter size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="all" style={{ background: '#374151', color: 'white' }}>
                  📚 ข้อสอบทั้งหมด
                </option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id} style={{ background: '#374151', color: 'white' }}>
                    {quiz.emoji} {quiz.title}
                  </option>
                ))}
              </select>
            </div>
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
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Users size={32} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalStudents}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>นักเรียนทั้งหมด</div>
          </div>

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
              {stats.topScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนสูงสุด</div>
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
              {stats.averageScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนเฉลี่ย</div>
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
              {stats.totalAttempts}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>การทำข้อสอบทั้งหมด</div>
          </div>
        </div>

        {/* Scores Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
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
            📋 รายการคะแนนล่าสุด ({filteredAttempts.length} รายการ)
          </h2>

          {filteredAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                {searchTerm || selectedQuiz !== 'all' ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลคะแนน'}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {searchTerm || selectedQuiz !== 'all' ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' : 'รอนักเรียนทำข้อสอบก่อน'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {filteredAttempts.map((attempt, index) => (
                <div 
                  key={attempt.id || index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Student Info */}
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
                        👤 {attempt.studentName}
                      </h4>
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

                    {/* Quiz Info */}
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {getGradeEmoji(attempt.percentage || 0)} {attempt.quizTitle}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {attempt.totalQuestions} คำถาม
                      </div>
                    </div>

                    {/* Score */}
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
                        <Target size={14} />
                        เวลาที่ใช้
                      </div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>
                        {Math.floor((attempt.totalTime || 0) / 60)}:{((attempt.totalTime || 0) % 60).toString().padStart(2, '0')}
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

export default AdminScores;