// src/App.jsx - แก้ไขสมบูรณ์
import React, { useState } from 'react';
import LandingPage from './components/layout/LandingPage';
import StudentLogin from './components/student/StudentLogin';
import QuizList from './components/student/QuizList';
import QuizTaking from './components/student/QuizTaking';
import AdminLogin from './components/admin/AdminLogin';
import FirebaseService from './services/firebase';
import AdminDashboard from './components/admin/AdminDashboard';
import QuizEditor from './components/admin/QuizEditor';



function App() {
  const [view, setView] = useState('landing');
  const [studentName, setStudentName] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);


  const handleSelectRole = (role) => {
    if (role === 'student') {
      setView('studentLogin');
    } else {
      setView('adminLogin');
    }
  };

  const handleNameSubmit = (name) => {
    setStudentName(name);
    setView('quizList');
  };

  const handleStartQuiz = (quiz) => {
    if (quiz.questions?.length > 0) {
      setCurrentQuiz(quiz);
      setView('quizTaking');
    } else {
      alert('❌ ข้อสอบนี้ยังไม่มีคำถาม กรุณาติดต่อครูเพื่อเพิ่มคำถาม');
    }
  };

  const handleQuizEnd = async (results) => {
    try {
      // Save results to Firebase
      await FirebaseService.saveStudentAttempt({
        studentName: studentName,
        quizTitle: results.quizTitle,
        quizId: results.quizId,
        score: results.score,
        totalQuestions: results.totalQuestions,
        totalTime: results.totalTime,
        percentage: results.percentage
      });
      
      setQuizResults(results);
      setView('quizResult');
    } catch (error) {
      console.error('Error saving quiz result:', error);
      // Still show results even if save fails
      setQuizResults(results);
      setView('quizResult');
    }
  };

  const handleViewHistory = () => {
    alert('📊 ดูประวัติคะแนน\n(ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป)');
  };

  const handleLogout = () => {
    setStudentName('');
    setCurrentQuiz(null);
    setQuizResults(null);
    setView('landing');
  };

  const handleBack = () => {
    setView('landing');
  };

  const handleBackToQuizList = () => {
    setCurrentQuiz(null);
    setView('quizList');
  };

  const handleBackToHome = () => {
    setCurrentQuiz(null);
    setQuizResults(null);
    setView('quizList');
  };

// แก้ไข handleAdminLoginSuccess
const handleAdminLoginSuccess = () => {
  setIsAdminLoggedIn(true);
  setView('adminDashboard'); // เปลี่ยนจาก alert
};

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setView('landing');
  };

// แก้ไข handlers
const handleCreateQuiz = () => {
  setEditingQuiz(null); // สำหรับสร้างใหม่
  setView('quizEditor');
};

const handleEditQuiz = (quiz) => {
  setEditingQuiz(quiz); // สำหรับแก้ไข
  setView('quizEditor');
};

const handleAdminViewScores = () => {
  alert('📊 ดูคะแนนนักเรียน\n(ฟีเจอร์นี้จะพัฒนาในขั้นตอนถัดไป) 📈');
};

const handleQuizSaved = (savedQuiz) => {
  setEditingQuiz(null);
  setView('adminDashboard');
  // Reload dashboard data จะเกิดขึ้นเองใน AdminDashboard
};

const handleBackToAdmin = () => {
  setEditingQuiz(null);
  setView('adminDashboard');
};



  return (
    <div>
      {view === 'landing' && (
        <LandingPage onSelectRole={handleSelectRole} />
      )}
      
      {view === 'studentLogin' && (
        <StudentLogin 
          onNameSubmit={handleNameSubmit}
          onBack={handleBack}
        />
      )}
      
      {view === 'adminLogin' && (
        <AdminLogin 
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={handleBack}
        />
      )}
      
      {view === 'quizList' && (
        <QuizList
          studentName={studentName}
          onStartQuiz={handleStartQuiz}
          onViewHistory={handleViewHistory}
          onLogout={handleLogout}
        />
      )}
      
      {view === 'quizTaking' && currentQuiz && (
        <QuizTaking
          quiz={currentQuiz}
          studentName={studentName}
          onQuizEnd={handleQuizEnd}
          onBack={handleBackToQuizList}
        />
      )}
      
      // เพิ่มใน return
      {view === 'adminDashboard' && isAdminLoggedIn && (
        <AdminDashboard
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={() => {}} // จะใช้ฟังก์ชันใน component เอง
          onViewScores={handleAdminViewScores}
          onBack={handleBack}
          onLogout={handleAdminLogout}
        />
      )}

      // เพิ่มใน return
      {view === 'quizEditor' && isAdminLoggedIn && (
        <QuizEditor
          quiz={editingQuiz}
          onSave={handleQuizSaved}
          onBack={handleBackToAdmin}
        />
      )}

      {view === 'quizResult' && quizResults && (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              fontSize: '5rem',
              marginBottom: '24px',
              animation: 'bounce 2s infinite'
            }}>🎉</div>
            
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              เสร็จแล้ว!
            </h1>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>{quizResults.score}</div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem'
                  }}>คะแนนที่ได้</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>{quizResults.totalQuestions * 10}</div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem'
                  }}>คะแนนเต็ม</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>{quizResults.percentage}%</div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem'
                  }}>เปอร์เซ็นต์</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>{Math.floor(quizResults.totalTime / 60)}:{(quizResults.totalTime % 60).toString().padStart(2, '0')}</div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem'
                  }}>เวลาที่ใช้</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px'
              }}>📚 {quizResults.quizTitle}</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem'
              }}>โดย {quizResults.studentName}</p>
            </div>
            
            <button
              onClick={handleBackToHome}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '16px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
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
              🏠 กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
      
      {/* Global Styles */}
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
}

export default App;