// src/App.jsx - แก้ไขการบันทึกคะแนน และเพิ่ม Category
import React, { useState, useEffect } from 'react';
import LandingPage from './components/layout/LandingPage';
import StudentLogin from './components/student/StudentLogin';
import CategorySelection from './components/student/CategorySelection';
import QuizList from './components/student/QuizList';
import QuizTaking from './components/student/QuizTaking';
import ScoreHistory from './components/student/ScoreHistory';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminScores from './components/admin/AdminScores';
import QuizEditor from './components/admin/QuizEditor';
import LoadingSpinner from './components/common/LoadingSpinner';
import FirebaseService from './services/firebase';
import { loadFromLocalStorage, saveToLocalStorage, clearLocalStorage } from './utils/helpers';
import CategoryManager from './components/admin/CategoryManager';


function App() {
  const [view, setView] = useState('landing');
  const [studentName, setStudentName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved student name on mount
  useEffect(() => {
    const savedName = loadFromLocalStorage('studentName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const handleSelectRole = (role) => {
    if (role === 'student') {
      if (studentName) {
        setView('categorySelection');
      } else {
        setView('studentLogin');
      }
    } else {
      setView('adminLogin');
    }
  };

  const handleManageCategories = () => {
    setView('categoryManager');
  };

  const handleBackFromCategories = () => {
    setView('adminDashboard');
  };

  const handleNameSubmit = (name) => {
    setStudentName(name);
    saveToLocalStorage('studentName', name);
    setView('categorySelection');
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
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

  // 🔥 แก้ไขหลัก: ปรับการบันทึกคะแนน
  const handleQuizEnd = async (results) => {
    try {
      setLoading(true);
      
      console.log("🎯 Quiz completed with results:", results);
      
      // เตรียมข้อมูลสำหรับบันทึก
      const attemptData = {
        studentName: studentName,
        quizTitle: results.quizTitle,
        quizId: results.quizId || currentQuiz?.id || 'unknown',
        score: results.score,
        totalQuestions: results.totalQuestions,
        totalTime: results.totalTime,
        percentage: results.percentage,
        selectedQuestionCount: results.selectedQuestionCount || results.totalQuestions,
        originalTotalQuestions: results.originalTotalQuestions || results.totalQuestions,
        answers: results.answers || []
      };
      
      console.log("💾 Saving attempt data:", attemptData);
      
      // บันทึกลง Firebase
      const savedId = await FirebaseService.saveStudentAttempt(attemptData);
      
      console.log("✅ Quiz result saved successfully with ID:", savedId);
      
      // แสดงผลลัพธ์
      setQuizResults(results);
      setView('quizResult');
      
    } catch (error) {
      console.error("❌ Error saving quiz result:", error);
      
      // แสดง error message ให้ผู้ใช้ทราบ
      alert(`⚠️ บันทึกคะแนนไม่สำเร็จ: ${error.message}\n\nแต่คุณยังสามารถดูผลลัพธ์ได้`);
      
      // แสดงผลลัพธ์แม้ว่าจะบันทึกไม่สำเร็จ
      setQuizResults(results);
      setView('quizResult');
    } finally {
      setLoading(false);
    }
  };

  // ✅ เพิ่ม handler สำหรับดูประวัติคะแนนของนักเรียน
  const handleViewHistory = () => {
    setView('scoreHistory');
  };

  const handleLogout = () => {
    setStudentName('');
    clearLocalStorage('studentName');
    setCurrentQuiz(null);
    setQuizResults(null);
    setSelectedCategory(null);
    setView('landing');
  };

  const handleBack = () => {
    setView('landing');
  };

  const handleBackToCategories = () => {
    setCurrentQuiz(null);
    setView('categorySelection');
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

  // ✅ เพิ่ม handler สำหรับกลับจากหน้าประวัติคะแนน
  const handleBackFromHistory = () => {
    setView('quizList');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setView('adminDashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setView('landing');
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setView('quizEditor');
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setView('quizEditor');
  };

  // ✅ เพิ่ม handler สำหรับดูคะแนนของครู
  const handleAdminViewScores = () => {
    setView('adminScores');
  };

  const handleQuizSaved = (savedQuiz) => {
    setEditingQuiz(null);
    setView('adminDashboard');
  };

  const handleBackToAdmin = () => {
    setEditingQuiz(null);
    setView('adminDashboard');
  };

  // ✅ เพิ่ม handler สำหรับกลับจากหน้าดูคะแนนของครู
  const handleBackFromAdminScores = () => {
    setView('adminDashboard');
  };

  // Show loading spinner when loading
  if (loading) {
    return <LoadingSpinner message="กำลังบันทึกข้อมูล..." />;
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif' }}>
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
      
      {view === 'categorySelection' && (
        <CategorySelection
          studentName={studentName}
          onSelectCategory={handleSelectCategory}
          onLogout={handleLogout}
        />
      )}
      
      {view === 'quizList' && (
        <QuizList
          studentName={studentName}
          categoryId={selectedCategory?.id}
          categoryName={selectedCategory?.name}
          onStartQuiz={handleStartQuiz}
          onViewHistory={handleViewHistory}
          onBackToCategories={handleBackToCategories}
          onLogout={handleLogout}
        />
      )}

      {/* ✅ เพิ่มหน้าประวัติคะแนนของนักเรียน */}
      {view === 'scoreHistory' && (
        <ScoreHistory
          studentName={studentName}
          onBack={handleBackFromHistory}
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
      
      {view === 'adminDashboard' && isAdminLoggedIn && (
        <AdminDashboard
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={() => {}}
          onViewScores={handleAdminViewScores}
          onManageCategories={handleManageCategories} // เพิ่มบรรทัดนี้
          onBack={handleBack}
          onLogout={handleAdminLogout}
        />
      )}

      {/* ✅ เพิ่มหน้าดูคะแนนของครู */}
      {view === 'adminScores' && isAdminLoggedIn && (
        <AdminScores
          onBack={handleBackFromAdminScores}
        />
      )}

      {view === 'categoryManager' && isAdminLoggedIn && (
        <CategoryManager
          onBack={handleBackFromCategories}
        />
      )}

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
          width: '100vw',
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
            
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBackToHome}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '16px 24px',
                  fontSize: '1.1rem',
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

              <button
                onClick={handleViewHistory}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '16px 24px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
                }}
              >
                🏆 ดูประวัติคะแนน
              </button>
            </div>
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