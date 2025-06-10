// src/App.jsx - ปรับให้กระชับ
import React, { useState, useEffect } from 'react';

// Components
import LandingPage from './components/layout/LandingPage';
import StudentLogin from './components/student/StudentLogin';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import QuizEditor from './components/admin/QuizEditor';
import AdminScores from './components/admin/AdminScores';
import CategoryManager from './components/admin/CategoryManager';
import SchoolManager from './components/admin/SchoolManager';
import CategorySelection from './components/student/CategorySelection';
import QuizList from './components/student/QuizList';
import QuizTaking from './components/student/QuizTaking';
import QuizResultPage from './components/student/QuizResultPage';
import StudentHistoryPage from './components/student/StudentHistoryPage';
import DirectQuizAccess from './components/student/DirectQuizAccess';
import GlobalHeader from './components/common/GlobalHeader';
import LoadingSpinner from './components/common/LoadingSpinner';

// Services
import musicService from './services/musicService';
import audioService from './services/simpleAudio';
import { getFromLocalStorage, saveToLocalStorage } from './utils/helpers';

function App() {
  // State Management
  const [userRole, setUserRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quizStartMethod, setQuizStartMethod] = useState('normal');
  const [view, setView] = useState('landing');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Language and Music State
  const [currentLanguage, setCurrentLanguage] = useState('th');
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Initialize app settings
  useEffect(() => {
    const initializeApp = async () => {
      // Load saved language
      const savedLanguage = getFromLocalStorage('appLanguage') || 'th';
      setCurrentLanguage(savedLanguage);
      
      // Load saved student name
      const savedName = getFromLocalStorage('studentName');
      if (savedName) {
        setStudentName(savedName);
      }
      
      // Initialize audio service
      await audioService.initialize();
      
      // Initialize music service
      await musicService.initialize();
      const isMusicPlaying = musicService.isCurrentlyPlaying();
      setMusicEnabled(isMusicPlaying);
      
      // Check for direct quiz access
      const urlParams = new URLSearchParams(window.location.search);
      const quizId = urlParams.get('quiz');
      if (quizId) {
        console.log('🎯 Direct quiz access detected:', quizId);
        setQuizStartMethod('direct');
        setCurrentQuiz({ id: quizId });
        setView('directQuiz');
      }
    };

    initializeApp();
  }, []);

  // Language change handler
  const handleLanguageChange = (newLanguage) => {
    console.log('🌐 Changing language to:', newLanguage);
    setCurrentLanguage(newLanguage);
    saveToLocalStorage('appLanguage', newLanguage);
    audioService.buttonClick();
  };

  // Music toggle handler
  const handleMusicToggle = async () => {
    console.log('🎵 Toggling music:', !musicEnabled);
    
    if (musicEnabled) {
      musicService.stop();
      setMusicEnabled(false);
      console.log('🔇 Music stopped');
    } else {
      const fileExists = await musicService.checkMusicFile();
      
      if (!fileExists) {
        alert(`🎵 ไม่พบไฟล์เพลง!

กรุณาทำดังนี้:
1. เปลี่ยนชื่อไฟล์เพลงเป็น "quiz-music.mp3"
2. วางไฟล์ในโฟลเดอร์ public/
3. รีเฟรชหน้าใหม่`);
        return;
      }
      
      const success = await musicService.playMenuMusic();
      if (success) {
        setMusicEnabled(true);
        console.log('🎵 Music started successfully');
      } else {
        alert(`🎵 ไม่สามารถเล่นเพลงได้`);
      }
    }
  };

  // Navigation handlers
  const handleSelectRole = (role) => {
    setUserRole(role);
    if (role === 'student') {
      setView(studentName ? 'categorySelection' : 'studentLogin');
    } else if (role === 'admin') {
      setView('adminLogin');
    }
  };

  const handleStudentNameSubmit = (name) => {
    setStudentName(name);
    saveToLocalStorage('studentName', name);
    
    if (quizStartMethod === 'direct' && currentQuiz?.id) {
      setView('directQuiz');
    } else {
      setView('categorySelection');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setView('adminDashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setUserRole(null);
    setView('landing');
    
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
      setMusicEnabled(false);
    }
  };

  const handleStudentLogout = () => {
    setStudentName('');
    setUserRole(null);
    setSelectedCategory(null);
    setCurrentQuiz(null);
    setQuizResults(null);
    setView('landing');
    localStorage.removeItem('studentName');
    
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
      setMusicEnabled(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setView('quizList');
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizResults(null);
    setView('quizTaking');
  };

  const handleQuizEnd = (results) => {
    setQuizResults(results);
    setCurrentQuiz(null);
    setView('quizResult');
  };

  const handleBackToQuizList = () => {
    setCurrentQuiz(null);
    setQuizResults(null);
    setView('quizList');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentQuiz(null);
    setQuizResults(null);
    setView('categorySelection');
  };

  const handleViewHistory = () => {
    setView('studentHistory');
  };

  const handleBackFromHistory = () => {
    setView('quizList');
  };

  // Admin handlers
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setView('quizEditor');
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setView('quizEditor');
  };

  const handleSaveQuiz = (quizData) => {
    setEditingQuiz(null);
    setView('adminDashboard');
  };

  const handleBackFromEditor = () => {
    setEditingQuiz(null);
    setView('adminDashboard');
  };

  const handleViewScores = () => {
    setView('adminScores');
  };

  const handleBackFromScores = () => {
    setView('adminDashboard');
  };

  const handleManageCategories = () => {
    setView('categoryManager');
  };

  const handleBackFromCategories = () => {
    setView('adminDashboard');
  };

  const handleManageSchools = () => {
    setView('schoolManager');
  };

  const handleBackFromSchools = () => {
    setView('adminDashboard');
  };

  // Direct quiz access handlers
  const handleDirectQuizStart = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizStartMethod('normal');
    setView('quizTaking');
  };

  const handleDirectQuizError = () => {
    setQuizStartMethod('normal');
    setCurrentQuiz(null);
    setView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  // Render logic based on view
  const renderView = () => {
    if (loading) {
      return <LoadingSpinner message="กำลังโหลด..." />;
    }

    switch (view) {
      case 'landing':
        return <LandingPage onSelectRole={handleSelectRole} currentLanguage={currentLanguage} />;

      case 'studentLogin':
        return (
          <StudentLogin 
            onNameSubmit={handleStudentNameSubmit} 
            onBack={() => {
              setUserRole(null);
              setView('landing');
            }}
            currentLanguage={currentLanguage}
          />
        );

      case 'categorySelection':
        return (
          <CategorySelection
            studentName={studentName}
            onSelectCategory={handleCategorySelect}
            onLogout={handleStudentLogout}
            currentLanguage={currentLanguage}
          />
        );

      case 'quizList':
        return (
          <QuizList
            studentName={studentName}
            categoryId={selectedCategory?.id}
            categoryName={selectedCategory?.name}
            onStartQuiz={handleStartQuiz}
            onLogout={handleStudentLogout}
            onViewHistory={handleViewHistory}
            onBackToCategories={handleBackToCategories}
            currentLanguage={currentLanguage}
          />
        );

      case 'quizTaking':
        return (
          <QuizTaking
            quiz={currentQuiz}
            studentName={studentName}
            onQuizEnd={handleQuizEnd}
            onBack={handleBackToQuizList}
            currentLanguage={currentLanguage}
          />
        );

      case 'quizResult':
        return (
          <QuizResultPage
            results={quizResults}
            onBackToHome={handleBackToQuizList}
            onViewHistory={handleViewHistory}
            currentLanguage={currentLanguage}
          />
        );

      case 'studentHistory':
        return (
          <StudentHistoryPage
            studentName={studentName}
            onBack={handleBackFromHistory}
            currentLanguage={currentLanguage}
          />
        );

      case 'directQuiz':
        return (
          <DirectQuizAccess
            quizId={currentQuiz?.id}
            studentName={studentName}
            onStartQuiz={handleDirectQuizStart}
            onError={handleDirectQuizError}
            currentLanguage={currentLanguage}
          />
        );

      case 'adminLogin':
        return (
          <AdminLogin 
            onLoginSuccess={handleAdminLoginSuccess} 
            onBack={() => {
              setUserRole(null);
              setView('landing');
            }} 
          />
        );

      case 'adminDashboard':
        return (
          <AdminDashboard
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={(id) => console.log('Delete quiz:', id)}
            onViewScores={handleViewScores}
            onManageCategories={handleManageCategories}
            onManageSchools={handleManageSchools}
            onBack={() => {
              setUserRole(null);
              setView('landing');
            }}
            onLogout={handleAdminLogout}
          />
        );

      case 'quizEditor':
        return (
          <QuizEditor
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onBack={handleBackFromEditor}
          />
        );

      case 'adminScores':
        return (
          <AdminScores
            onBack={handleBackFromScores}
          />
        );

      case 'categoryManager':
        return (
          <CategoryManager
            onBack={handleBackFromCategories}
          />
        );

      case 'schoolManager':
        return (
          <SchoolManager
            onBack={handleBackFromSchools}
          />
        );

      default:
        return <LandingPage onSelectRole={handleSelectRole} currentLanguage={currentLanguage} />;
    }
  };

  return (
    <div className="App" style={{ fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif' }}>
      {/* Global Header with language and music controls */}
      <GlobalHeader
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        musicEnabled={musicEnabled}
        onMusicToggle={handleMusicToggle}
        hideOnPages={[]}
      />
      
      {/* Main content */}
      {renderView()}
    </div>
  );
}

export default App;