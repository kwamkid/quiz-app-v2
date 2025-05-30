// src/components/student/QuizList.jsx - ใช้ Mock Data เพื่อ Debug
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Music, VolumeX } from 'lucide-react';
import QuizSelectionModal from './QuizSelectionModal';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
// import FirebaseService from '../../services/firebase'; // ปิดการใช้ Firebase ชั่วคราว

// Mock Data สำหรับทดสอบ
const MOCK_QUIZZES = [
  {
    id: 'mock-1',
    title: '🧮 คณิตศาสตร์ ป.6',
    emoji: '🧮',
    difficulty: 'ง่าย',
    questions: [
      { question: '5 + 3 = ?', options: ['6', '7', '8', '9'], correctAnswer: 2, points: 10 },
      { question: '12 ÷ 4 = ?', options: ['2', '3', '4', '6'], correctAnswer: 1, points: 10 },
      { question: '7 × 8 = ?', options: ['54', '56', '58', '60'], correctAnswer: 1, points: 10 }
    ]
  },
  {
    id: 'mock-2',
    title: '🌟 วิทยาศาสตร์',
    emoji: '🔬',
    difficulty: 'ปานกลาง',
    questions: [
      { question: 'โลกมีดวงจันทร์กี่ดวง?', options: ['1 ดวง', '2 ดวง', '3 ดวง', '4 ดวง'], correctAnswer: 0, points: 10 },
      { question: 'น้ำเดือดที่กี่องศาเซลเซียส?', options: ['90°C', '100°C', '110°C', '120°C'], correctAnswer: 1, points: 10 }
    ]
  },
  {
    id: 'mock-3',
    title: '🇬🇧 ภาษาอังกฤษ',
    emoji: '🇬🇧',
    difficulty: 'ยาก',
    questions: Array.from({ length: 25 }, (_, i) => ({
      question: `English Question ${i + 1}: What is the capital of Thailand?`,
      options: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
      correctAnswer: 0,
      points: 10
    }))
  },
  {
    id: 'mock-4',
    title: '🎨 ศิลปะ',
    emoji: '🎨',
    difficulty: 'ง่าย',
    questions: [] // Empty quiz for testing
  }
];

const QuizList = ({ studentName, onStartQuiz, onLogout, onViewHistory }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    console.log('🧪 QuizList useEffect triggered');
    
    // จำลองการโหลดข้อมูล
    const mockLoadQuizzes = async () => {
      try {
        setLoading(true);
        console.log('📚 Mock loading quizzes...');
        
        // จำลอง delay การโหลด
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setQuizzes(MOCK_QUIZZES);
        console.log('✅ Mock quizzes loaded:', MOCK_QUIZZES.length, 'items');
      } catch (error) {
        console.error('❌ Mock loading error:', error);
      } finally {
        setLoading(false);
        console.log('🏁 Mock loading completed');
      }
    };

    mockLoadQuizzes();
  }, []); // Empty dependency

  const handleQuizClick = async (quiz) => {
    console.log('🎯 Quiz clicked:', quiz.title);
    
    if (quiz.questions?.length > 0) {
      await audioService.buttonClick();
      
      if (quiz.questions.length <= 20) {
        const quizWithAllQuestions = {
          ...quiz,
          questions: [...quiz.questions].sort(() => Math.random() - 0.5),
          originalTotalQuestions: quiz.questions.length,
          selectedQuestionCount: quiz.questions.length
        };
        onStartQuiz(quizWithAllQuestions);
      } else {
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
      }
    } else {
      await audioService.wrongAnswer();
      alert('❌ ข้อสอบนี้ยังไม่มีคำถาม กรุณาติดต่อครูเพื่อเพิ่มคำถาม');
    }
  };

  const handleStartQuiz = async (questionCount) => {
    if (selectedQuiz) {
      await audioService.correctAnswer();
      
      const shuffledQuestions = [...selectedQuiz.questions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);
      
      const quizWithSelectedQuestions = {
        ...selectedQuiz,
        questions: selectedQuestions,
        originalTotalQuestions: selectedQuiz.questions.length,
        selectedQuestionCount: questionCount
      };
      
      setShowQuizModal(false);
      setSelectedQuiz(null);
      onStartQuiz(quizWithSelectedQuestions);
    }
  };

  const handleCloseModal = async () => {
    await audioService.navigation();
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const handleLogout = async () => {
    await audioService.navigation();
    audioService.stopBackgroundMusic();
    onLogout();
  };

  const handleViewHistory = async () => {
    await audioService.buttonClick();
    console.log('🏆 Navigating to score history...');
    onViewHistory();
  };

  const toggleMusic = async () => {
    await audioService.buttonClick();
    await audioService.initialize();
    const newState = audioService.toggleBackgroundMusic();
    setMusicEnabled(newState);
    console.log('🎵 Music toggled:', newState ? 'ON' : 'OFF');
  };

  console.log('🔄 QuizList render - quizzes:', quizzes.length, 'loading:', loading);

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อสอบ... (Mock)" />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)',
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
        🧪 Mock Mode | Quizzes: {quizzes.length}
      </div>

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
        position: 'absolute',
        bottom: '10%',
        left: '2%',
        fontSize: '4rem',
        opacity: '0.15',
        animation: 'pulse 5s infinite 1s'
      }}>🎯</div>

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
                }}>👋</span>
                สวัสดี {studentName}!
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                เลือกข้อสอบที่ต้องการทำ 🎮 (Mock Data)
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* Music Toggle */}
              <button
                onClick={toggleMusic}
                style={{
                  background: musicEnabled 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                title={musicEnabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
              >
                {musicEnabled ? <Music size={20} /> : <VolumeX size={20} />}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
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
              >
                <ArrowLeft size={16} />
                ออก
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleViewHistory}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Trophy size={18} />
              🏆 ดูคะแนนของฉัน
            </button>
          </div>
        </div>
        
        {/* Quiz Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          animation: 'slideUp 0.8s ease-out 0.2s both'
        }}>
          {quizzes.map((quiz, index) => (
            <div 
              key={quiz.id}
              style={{
                background: `linear-gradient(135deg, ${getQuizColor(index)})`,
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                animation: `slideUp 0.8s ease-out ${0.2 + index * 0.1}s both`
              }}
              onClick={() => handleQuizClick(quiz)}
            >
              {/* Background Emoji */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '5rem',
                opacity: '0.1'
              }}>
                {quiz.emoji}
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '12px',
                    animation: `bounce 3s infinite ${index * 0.5}s`
                  }}>
                    {quiz.emoji}
                  </div>
                  <span style={{
                    background: getDifficultyColor(quiz.difficulty),
                    padding: '6px 16px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {quiz.difficulty || 'ง่าย'}
                  </span>
                </div>
                
                {/* Content */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '12px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  {quiz.title}
                </h3>
                
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.1rem'
                }}>
                  🎯 {quiz.questions?.length || 0} คำถาม
                  {quiz.questions?.length > 20 && (
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      เลือกได้
                    </span>
                  )}
                </p>
                
                {/* Action Button */}
                <div style={{
                  background: quiz.questions?.length > 0 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: quiz.questions?.length > 0 
                    ? 'white' 
                    : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 'bold',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}>
                  {quiz.questions?.length > 0 ? (
                    quiz.questions.length <= 20 ? (
                      <>▶️ ทำข้อสอบ ({quiz.questions.length} ข้อ)</>
                    ) : (
                      <>🎯 ทำข้อสอบ (เลือกจำนวนข้อ)</>
                    )
                  ) : (
                    <>🚫 ยังไม่มีคำถาม</>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {quizzes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📚</div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              ไม่มี Mock Data
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              ตรวจสอบ MOCK_QUIZZES array
            </p>
          </div>
        )}
      </div>

      {/* Quiz Selection Modal */}
      <QuizSelectionModal
        isOpen={showQuizModal}
        quiz={selectedQuiz}
        onClose={handleCloseModal}
        onStart={handleStartQuiz}
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

// Helper functions
const getQuizColor = (index) => {
  const colors = [
    'rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3)',
    'rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3)',
    'rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3)',
    'rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3)',
    'rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3)',
    'rgba(99, 102, 241, 0.3), rgba(59, 130, 246, 0.3)'
  ];
  return colors[index % colors.length];
};

const getDifficultyColor = (difficulty) => {
  const colors = {
    'ง่าย': 'rgba(34, 197, 94, 0.2)',
    'ปานกลาง': 'rgba(251, 191, 36, 0.2)',
    'ยาก': 'rgba(239, 68, 68, 0.2)'
  };
  return colors[difficulty] || colors['ง่าย'];
};

export default QuizList;