// src/components/student/QuizList.jsx - แก้ไขเพลงให้เล่นต่อเนื่อง
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Music, VolumeX, Volume2 } from 'lucide-react';
import QuizSelectionModal from './QuizSelectionModal';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import musicService from '../../services/musicService';
import FirebaseService from '../../services/firebase';

const QuizList = ({ studentName, onStartQuiz, onLogout, onViewHistory }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // ✅ ใช้ useEffect แบบที่ไม่ทำให้เกิด infinite loop
  useEffect(() => {
    let isMounted = true;
    
    const loadQuizzes = async () => {
      try {
        console.log('🔄 Loading quizzes...');
        setLoading(true);
        const quizzesData = await FirebaseService.getQuizzes();
        
        if (isMounted) {
          setQuizzes(quizzesData);
          console.log('✅ Quizzes loaded:', quizzesData.length);
        }
      } catch (error) {
        console.error('❌ Error loading quizzes:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ ตรวจสอบสถานะเพลงเมื่อ component mount
  useEffect(() => {
    const initializeMusic = async () => {
      await musicService.initialize();
      
      // ตรวจสอบว่าเพลงกำลังเล่นอยู่หรือไม่
      const isPlaying = musicService.isCurrentlyPlaying();
      setMusicEnabled(isPlaying);
      
      console.log('🎵 Music status on QuizList mount:', isPlaying);
    };
    
    initializeMusic();
  }, []);

  const handleQuizClick = async (quiz) => {
    if (quiz.questions?.length > 0) {
      await audioService.buttonClick();
      setSelectedQuiz(quiz);
      setShowQuizModal(true);
    } else {
      await audioService.wrongAnswer();
      alert('❌ ข้อสอบนี้ยังไม่มีคำถาม กรุณาติดต่อครูเพื่อเพิ่มคำถาม');
    }
  };

  const handleStartQuiz = async (questionCount) => {
    if (selectedQuiz) {
      await audioService.correctAnswer();
      
      // สุ่มคำถามและเลือกจำนวนที่ต้องการ
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
      
      // ✅ ไม่หยุดเพลงเมื่อเริ่มทำข้อสอบ
      console.log('🎮 Starting quiz - keeping music status:', musicService.isCurrentlyPlaying());
      
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
    
    // ✅ หยุดเพลงเมื่อออกจากระบบ
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
      console.log('🔇 Music stopped on logout');
    }
    
    onLogout();
  };

  const handleViewHistory = async () => {
    await audioService.buttonClick();
    onViewHistory();
  };

  // ✅ ปรับปรุงฟังก์ชันควบคุมเพลงให้ทำงานได้ดีขึ้น
  const toggleMusic = async () => {
    await audioService.buttonClick();
    
    if (musicEnabled) {
      // หยุดเพลง
      musicService.stop();
      setMusicEnabled(false);
      console.log('🔇 Music stopped by user');
    } else {
      // เริ่มเพลง
      console.log('🎵 Attempting to start music...');
      
      // ตรวจสอบไฟล์เพลงก่อน
      const fileExists = await musicService.checkMusicFile();
      
      if (!fileExists) {
        alert(`🎵 ไม่พบไฟล์เพลง!

กรุณาทำดังนี้:
1. เปลี่ยนชื่อไฟล์เพลงเป็น "quiz-music.mp3"
2. วางไฟล์ในโฟลเดอร์ public/
3. รีเฟรชหน้าใหม่

โครงสร้างที่ถูกต้อง:
public/
  quiz-music.mp3`);
        return;
      }
      
      const success = await musicService.playMenuMusic();
      if (success) {
        setMusicEnabled(true);
        console.log('🎵 Music started successfully');
      } else {
        console.log('❌ Failed to start music');
        alert(`🎵 ไม่สามารถเล่นเพลงได้

สาเหตุที่เป็นไปได้:
• เบราว์เซอร์บล็อกการเล่นเพลงอัตโนมัติ
• รูปแบบไฟล์ไม่รองรับ
• ไฟล์เสียหาย

ลองกดปุ่มเพลงอีกครั้งหลังจากมีการโต้ตอบกับหน้าเว็บ`);
      }
    }
  };

  // ✅ เพิ่มฟังก์ชันสำหรับอัพเดทสถานะเพลงแบบ real-time
  useEffect(() => {
    const checkMusicStatus = () => {
      const isPlaying = musicService.isCurrentlyPlaying();
      if (isPlaying !== musicEnabled) {
        setMusicEnabled(isPlaying);
        console.log('🎵 Music status updated:', isPlaying);
      }
    };

    // ตรวจสอบสถานะเพลงทุก 1 วินาที
    const interval = setInterval(checkMusicStatus, 1000);

    return () => clearInterval(interval);
  }, [musicEnabled]);

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อสอบ..." />;
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
                เลือกข้อสอบที่ต้องการทำ 🎮 {musicEnabled && '🎵'}
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
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                title={musicEnabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
              >
                {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
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
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
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
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
              }}
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
                    <>
                      ▶️ เลือกจำนวนข้อ
                    </>
                  ) : (
                    <>
                      🚫 ยังไม่มีคำถาม
                    </>
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
              ยังไม่มีข้อสอบให้ทำ
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              รอครูสร้างข้อสอบก่อนนะ! 🎓
            </p>
          </div>
        )}
      </div>

      {/* Quiz Selection Modal */}
      <QuizSelectionModal
        isOpen={showQuizModal}
        quiz={selectedQuiz}
        allQuizzes={quizzes}
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