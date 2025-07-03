// src/App.jsx - URL-based navigation version
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

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

// Protected Route Component
const ProtectedAdminRoute = ({ children, isAdminLoggedIn }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);
  
  return isAdminLoggedIn ? children : <LoadingSpinner message="กำลังตรวจสอบสิทธิ์..." />;
};

// Protected Student Route Component
const ProtectedStudentRoute = ({ children, studentName }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!studentName) {
      navigate('/student');
    }
  }, [studentName, navigate]);
  
  return studentName ? children : <LoadingSpinner message="กำลังตรวจสอบข้อมูล..." />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      
      // Load saved school  
      const savedSchool = getFromLocalStorage('studentSchool');
      if (savedSchool) {
        setStudentSchool(savedSchool);
      }
      
      // Load admin login status
      const adminLoggedIn = getFromLocalStorage('isAdminLoggedIn') || false;
      setIsAdminLoggedIn(adminLoggedIn);
      
      // Initialize audio service
      await audioService.initialize();
      
      // Initialize music service
      await musicService.initialize();
      const isMusicPlaying = musicService.isCurrentlyPlaying();
      setMusicEnabled(isMusicPlaying);
      
      // Check for direct quiz access
      const urlParams = new URLSearchParams(window.location.search);
      const quizId = urlParams.get('quiz');
      if (quizId && location.pathname === '/') {
        console.log('🎯 Direct quiz access detected:', quizId);
        setCurrentQuiz({ id: quizId });
        navigate(`/quiz/direct/${quizId}`);
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
    if (role === 'student') {
      navigate('/student');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  const handleStudentNameSubmit = (name, school) => {
    setStudentName(name);
    setStudentSchool(school);
    saveToLocalStorage('studentName', name);
    saveToLocalStorage('studentSchool', school);
    
    // Check if there's a quiz ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz');
    
    if (quizId) {
      navigate(`/quiz/direct/${quizId}`);
    } else {
      navigate('/student/categories');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    saveToLocalStorage('isAdminLoggedIn', true);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    saveToLocalStorage('isAdminLoggedIn', false);
    
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
      setMusicEnabled(false);
    }
    
    navigate('/');
  };

  const handleStudentLogout = () => {
    setStudentName('');
    setStudentSchool(null);
    setSelectedCategory(null);
    setCurrentQuiz(null);
    setQuizResults(null);
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentSchool');
    
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
      setMusicEnabled(false);
    }
    
    navigate('/');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/student/quizzes?category=${category.id}`);
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizResults(null);
    navigate(`/student/quiz/${quiz.id}/take`);
  };

  const handleQuizEnd = (results) => {
    const resultsWithSchool = {
      ...results,
      studentSchool: studentSchool
    };
    setQuizResults(resultsWithSchool);
    setCurrentQuiz(null);
    navigate('/student/quiz/result');
  };

  const handleViewHistory = () => {
    navigate('/student/history');
  };

  // Admin handlers for navigation
  const handleCreateQuiz = () => {
    navigate('/admin/quiz/new');
  };

  const handleEditQuiz = (quiz) => {
    navigate(`/admin/quiz/edit/${quiz.id}`);
  };

  const handleViewScores = () => {
    navigate('/admin/scores');
  };

  const handleManageCategories = () => {
    navigate('/admin/categories');
  };

  const handleManageSchools = () => {
    navigate('/admin/schools');
  };

  // Direct quiz access handlers
  const handleDirectQuizStart = (quiz) => {
    setCurrentQuiz(quiz);
    navigate(`/student/quiz/${quiz.id}/take`);
  };

  const handleDirectQuizError = () => {
    setCurrentQuiz(null);
    navigate('/');
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
      
      {/* Main Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <LandingPage 
            onSelectRole={handleSelectRole} 
            currentLanguage={currentLanguage} 
          />
        } />
        
        {/* Student Routes */}
        <Route path="/student" element={
          <StudentLogin 
            onNameSubmit={handleStudentNameSubmit}
            currentLanguage={currentLanguage}
          />
        } />
        
        <Route path="/student/categories" element={
          <ProtectedStudentRoute studentName={studentName}>
            <CategorySelection
              studentName={studentName}
              studentSchool={studentSchool}
              onSelectCategory={handleCategorySelect}
              onLogout={handleStudentLogout}
              currentLanguage={currentLanguage}
            />
          </ProtectedStudentRoute>
        } />
        
        <Route path="/student/quizzes" element={
          <ProtectedStudentRoute studentName={studentName}>
            <QuizList
              studentName={studentName}
              categoryId={selectedCategory?.id}
              categoryName={selectedCategory?.name}
              onStartQuiz={handleStartQuiz}
              onLogout={handleStudentLogout}
              onViewHistory={handleViewHistory}
              onBackToCategories={() => navigate('/student/categories')}
              currentLanguage={currentLanguage}
            />
          </ProtectedStudentRoute>
        } />
        
        <Route path="/student/quiz/:quizId/take" element={
          <ProtectedStudentRoute studentName={studentName}>
            <QuizTaking
              quiz={currentQuiz}
              studentName={studentName}
              onQuizEnd={handleQuizEnd}
              onBack={() => navigate(-1)}
              currentLanguage={currentLanguage}
            />
          </ProtectedStudentRoute>
        } />
        
        <Route path="/student/quiz/result" element={
          <ProtectedStudentRoute studentName={studentName}>
            <QuizResultPage
              results={quizResults}
              onBackToHome={() => navigate('/student/quizzes')}
              onViewHistory={handleViewHistory}
              currentLanguage={currentLanguage}
            />
          </ProtectedStudentRoute>
        } />
        
        <Route path="/student/history" element={
          <ProtectedStudentRoute studentName={studentName}>
            <StudentHistoryPage
              studentName={studentName}
              onBack={() => navigate(-1)}
              currentLanguage={currentLanguage}
            />
          </ProtectedStudentRoute>
        } />
        
        <Route path="/quiz/direct/:quizId" element={
          <DirectQuizAccess
            quizId={currentQuiz?.id}
            studentName={studentName}
            onStartQuiz={handleDirectQuizStart}
            onError={handleDirectQuizError}
            currentLanguage={currentLanguage}
          />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminLogin 
            onLoginSuccess={handleAdminLoginSuccess}
          />
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminDashboard
              onCreateQuiz={handleCreateQuiz}
              onEditQuiz={handleEditQuiz}
              onViewScores={handleViewScores}
              onManageCategories={handleManageCategories}
              onManageSchools={handleManageSchools}
              onLogout={handleAdminLogout}
            />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/quiz/new" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <QuizEditor
              onSave={() => navigate('/admin/dashboard')}
              onBack={() => navigate('/admin/dashboard')}
              currentLanguage={currentLanguage}
            />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/quiz/edit/:id" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <QuizEditor
              onSave={() => navigate('/admin/dashboard')}
              onBack={() => navigate('/admin/dashboard')}
              currentLanguage={currentLanguage}
            />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/scores" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminScores currentLanguage={currentLanguage} />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/categories" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <CategoryManager />
          </ProtectedAdminRoute>
        } />
        
        <Route path="/admin/schools" element={
          <ProtectedAdminRoute isAdminLoggedIn={isAdminLoggedIn}>
            <SchoolManager />
          </ProtectedAdminRoute>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;