// src/App.jsx - เพิ่มระบบภาษาและโรงเรียน
import React, { useState, useEffect } from 'react';
import GlobalHeader from './components/common/GlobalHeader';
import LandingPage from './components/layout/LandingPage';
import StudentLogin from './components/student/StudentLogin';
import SchoolSelection from './components/student/SchoolSelection';
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
import SchoolManager from './components/admin/SchoolManager';
import DirectQuizAccess from './components/student/DirectQuizAccess';
import musicService from './services/musicService';

function App() {
  const [view, setView] = useState('landing');
  const [studentName, setStudentName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [directQuizId, setDirectQuizId] = useState(null);
  
  // 🌐 State สำหรับภาษาและเพลง
  const [currentLanguage, setCurrentLanguage] = useState('th');
  const [musicEnabled, setMusicEnabled] = useState(false);

  // 🎯 ตรวจสอบ URL Parameter สำหรับ Direct Quiz Access
  useEffect(() => {
    const checkUrlParams = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const quizId = urlParams.get('quiz');
      
      if (quizId) {
        console.log('🎯 Direct quiz access detected:', quizId);
        setDirectQuizId(quizId);
        
        // ตรวจสอบว่ามีชื่อนักเรียนหรือยัง
        const savedName = loadFromLocalStorage('studentName');
        if (savedName) {
          setStudentName(savedName);
          setView('directQuizAccess');
        } else {
          setView('studentLogin');
        }
        
        // ล้าง URL parameter หลังจากอ่านแล้ว
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkUrlParams();
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const savedName = loadFromLocalStorage('studentName');
    const savedSchool = loadFromLocalStorage('selectedSchool');
    const savedLanguage = loadFromLocalStorage('language') || 'th';
    const savedMusicEnabled = loadFromLocalStorage('musicEnabled') || false;
    
    if (savedName && !directQuizId) {
      setStudentName(savedName);
    }
    if (savedSchool) {
      setSelectedSchool(savedSchool);
    }
    setCurrentLanguage(savedLanguage);
    setMusicEnabled(savedMusicEnabled);
    
    // Initialize music service
    musicService.initialize();
  }, [directQuizId]);

  // จัดการการเปลี่ยนภาษา
  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    saveToLocalStorage('language', lang);
    console.log('🌐 Language changed to:', lang);
  };

  // จัดการเพลง
  const handleMusicToggle = async () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    saveToLocalStorage('musicEnabled', newState);
    
    if (newState) {
      const success = await musicService.playMenuMusic();
      if (!success) {
        setMusicEnabled(false);
        saveToLocalStorage('musicEnabled', false);
      }
    } else {
      musicService.stop();
    }
  };

  const handleSelectRole = (role) => {
    if (role === 'student') {
      if (studentName) {
        if (selectedSchool) {
          setView('categorySelection');
        } else {
          setView('schoolSelection');
        }
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

  const handleManageSchools = () => {
    setView('schoolManager');
  };

  const handleBackFromCategories = () => {
    setView('adminDashboard');
  };

  const handleBackFromSchools = () => {
    setView('adminDashboard');
  };

  const handleNameSubmit = (name) => {
    setStudentName(name);
    saveToLocalStorage('studentName', name);
    
    // ถ้ามี directQuizId ให้ไปหน้า directQuizAccess
    if (directQuizId) {
      setView('directQuizAccess');
    } else {
      setView('schoolSelection');
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    saveToLocalStorage('selectedSchool', school);
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

  // 🎯 Handle Direct Quiz Start
  const handleDirectQuizStart = (quiz) => {
    setDirectQuizId(null); // Clear direct quiz ID
    handleStartQuiz(quiz);
  };

  // 🎯 Handle Direct Quiz Error
  const handleDirectQuizError = () => {
    setDirectQuizId(null);
    setView('categorySelection');
  };

  const handleQuizEnd = async (results) => {
    try {
      setLoading(true);
      
      console.log("🎯 Quiz completed with results:", results);
      
      const attemptData = {
        studentName: studentName,
        schoolId: selectedSchool?.id || null,
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
      
      const savedId = await FirebaseService.saveStudentAttempt(attemptData);
      
      console.log("✅ Quiz result saved successfully with ID:", savedId);
      
      setQuizResults(results);
      setView('quizResult');
      
    } catch (error) {
      console.error("❌ Error saving quiz result:", error);
      
      alert(`⚠️ บันทึกคะแนนไม่สำเร็จ: ${error.message}\n\nแต่คุณยังสามารถดูผลลัพธ์ได้`);
      
      setQuizResults(results);
      setView('quizResult');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = () => {
    setView('scoreHistory');
  };

  const handleLogout = () => {
    setStudentName('');
    setSelectedSchool(null);
    clearLocalStorage('studentName');
    clearLocalStorage('selectedSchool');
    setCurrentQuiz(null);
    setQuizResults(null);
    setSelectedCategory(null);
    setDirectQuizId(null);
    setView('landing');
  };

  const handleBack = () => {
    setView('landing');
  };

  const handleBackToSchoolSelection = () => {
    setSelectedCategory(null);
    setView('schoolSelection');
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
    
    // ถ้ามาจาก direct quiz ให้กลับไป category selection
    if (!selectedCategory) {
      setView('categorySelection');
    } else {
      setView('quizList');
    }
  };

  const handleBackFromHistory = () => {
    if (!selectedCategory) {
      setView('categorySelection');
    } else {
      setView('quizList');
    }
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

  const handleBackFromAdminScores = () => {
    setView('adminScores');
  };

  if (loading) {
    return <LoadingSpinner message="กำลังบันทึกข้อมูล..." />;
  }

  // หน้าที่ไม่ต้องการแสดง header
  const hideHeaderOnPages = [];

  return (
    <div style={{ fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif' }}>
      {/* Global Header */}
      <GlobalHeader
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        musicEnabled={musicEnabled}
        onMusicToggle={handleMusicToggle}
        hideOnPages={hideHeaderOnPages}
      />
      
      {view === 'landing' && (
        <LandingPage 
          onSelectRole={handleSelectRole}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'studentLogin' && (
        <StudentLogin 
          onNameSubmit={handleNameSubmit}
          onBack={handleBack}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'schoolSelection' && (
        <SchoolSelection
          studentName={studentName}
          onSelectSchool={handleSchoolSelect}
          onBack={handleBack}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'adminLogin' && (
        <AdminLogin 
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={handleBack}
          currentLanguage={currentLanguage}
        />
      )}

      {/* 🎯 Direct Quiz Access */}
      {view === 'directQuizAccess' && directQuizId && (
        <DirectQuizAccess
          quizId={directQuizId}
          studentName={studentName}
          onStartQuiz={handleDirectQuizStart}
          onError={handleDirectQuizError}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'categorySelection' && (
        <CategorySelection
          studentName={studentName}
          onSelectCategory={handleSelectCategory}
          onLogout={handleLogout}
          onBackToSchoolSelection={handleBackToSchoolSelection}
          currentLanguage={currentLanguage}
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
          currentLanguage={currentLanguage}
        />
      )}

      {view === 'scoreHistory' && (
        <ScoreHistory
          studentName={studentName}
          schoolId={selectedSchool?.id}
          onBack={handleBackFromHistory}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'quizTaking' && currentQuiz && (
        <QuizTaking
          quiz={currentQuiz}
          studentName={studentName}
          onQuizEnd={handleQuizEnd}
          onBack={handleBackToQuizList}
          currentLanguage={currentLanguage}
        />
      )}
      
      {view === 'adminDashboard' && isAdminLoggedIn && (
        <AdminDashboard
          onCreateQuiz={handleCreateQuiz}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={() => {}}
          onViewScores={handleAdminViewScores}
          onManageCategories={handleManageCategories}
          onManageSchools={handleManageSchools}
          onBack={handleBack}
          onLogout={handleAdminLogout}
          currentLanguage={currentLanguage}
        />
      )}

      {view === 'adminScores' && isAdminLoggedIn && (
        <AdminScores
          onBack={handleBackFromAdminScores}
          currentLanguage={currentLanguage}
        />
      )}

      {view === 'categoryManager' && isAdminLoggedIn && (
        <CategoryManager
          onBack={handleBackFromCategories}
          currentLanguage={currentLanguage}
        />
      )}

      {view === 'schoolManager' && isAdminLoggedIn && (
        <SchoolManager
          onBack={handleBackFromSchools}
          currentLanguage={currentLanguage}
        />
      )}

      {view === 'quizEditor' && isAdminLoggedIn && (
        <QuizEditor
          quiz={editingQuiz}
          onSave={handleQuizSaved}
          onBack={handleBackToAdmin}
          currentLanguage={currentLanguage}
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
          paddingTop: '80px', // เพิ่มเพื่อหลีก header
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
              {currentLanguage === 'th' ? 'เสร็จแล้ว!' : 'Completed!'}
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
                  }}>{currentLanguage === 'th' ? 'คะแนนที่ได้' : 'Your Score'}</div>
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
                  }}>{currentLanguage === 'th' ? 'คะแนนเต็ม' : 'Total Score'}</div>
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
                  }}>{currentLanguage === 'th' ? 'เปอร์เซ็นต์' : 'Percentage'}</div>
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
                  }}>{currentLanguage === 'th' ? 'เวลาที่ใช้' : 'Time Used'}</div>
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
              }}>
                {currentLanguage === 'th' ? 'โดย' : 'by'} {quizResults.studentName}
              </p>
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
                🏠 {currentLanguage === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
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
                🏆 {currentLanguage === 'th' ? 'ดูประวัติคะแนน' : 'View Score History'}
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