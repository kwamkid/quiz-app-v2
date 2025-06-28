// src/components/student/QuizTaking.jsx - ใช้เวลารวมทั้งชุดข้อสอบ
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Trophy } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import musicService from '../../services/musicService';
import FirebaseService from '../../services/firebase';
import { getTimerColor, calculatePercentage, getFromLocalStorage } from '../../utils/helpers';
import { QUIZ_SETTINGS } from '../../constants';
import { t } from '../../translations';

const QuizTaking = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  // State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0); // เวลารวมทั้งหมด
  const [quizStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState([]);
  const [musicWasPlaying, setMusicWasPlaying] = useState(false);

  // ดึงข้อมูลจาก localStorage
  const studentName = getFromLocalStorage('studentName') || '';
  const studentSchool = getFromLocalStorage('studentSchool') || null;

  // ตรวจสอบว่ามีข้อมูล student หรือไม่
  useEffect(() => {
    if (!studentName) {
      navigate('/student');
    }
  }, [studentName, navigate]);

  // โหลด quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        
        // ลองดึงจาก sessionStorage ก่อน (จาก QuizList)
        const sessionQuiz = sessionStorage.getItem('currentQuiz');
        if (sessionQuiz) {
          const quizData = JSON.parse(sessionQuiz);
          if (quizData.id === quizId) {
            setQuiz(quizData);
            // คำนวณเวลารวม: 1 นาทีต่อข้อ
            const totalMinutes = quizData.questions.length * QUIZ_SETTINGS.MINUTES_PER_QUESTION;
            setTotalTimeLeft(totalMinutes * 60); // แปลงเป็นวินาที
            sessionStorage.removeItem('currentQuiz'); // ลบออกหลังใช้
            return;
          }
        }
        
        // ถ้าไม่มีใน sessionStorage ให้โหลดจาก Firebase
        const quizData = await FirebaseService.getQuiz(quizId);
        if (quizData) {
          setQuiz(quizData);
          // คำนวณเวลารวม: 1 นาทีต่อข้อ
          const totalMinutes = quizData.questions.length * QUIZ_SETTINGS.MINUTES_PER_QUESTION;
          setTotalTimeLeft(totalMinutes * 60); // แปลงเป็นวินาที
        } else {
          throw new Error('Quiz not found');
        }
        
      } catch (error) {
        console.error('Error loading quiz:', error);
        alert(t('errorLoadingQuiz', currentLanguage));
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, currentLanguage, navigate]);

  // คำถามถูกสุ่มแล้วจาก QuizList
  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;
  const originalTotalQuestions = quiz?.originalTotalQuestions || totalQuestions;
  const selectedQuestionCount = quiz?.selectedQuestionCount || totalQuestions;

  // Debug logs
  console.log('🌐 QuizTaking - currentLanguage:', currentLanguage);
  console.log('📝 Current quiz:', quiz);
  console.log('⏱️ Total time left:', totalTimeLeft);
  if (questions[currentQuestionIndex]) {
    console.log('📝 Current question:', questions[currentQuestionIndex]);
  }

  // ตรวจสอบและเล่นเพลงต่อจากที่เล่นอยู่
  useEffect(() => {
    const initializeMusic = async () => {
      const wasPlaying = musicService.isCurrentlyPlaying();
      setMusicWasPlaying(wasPlaying);
      
      console.log('🎵 Quiz started - Music was playing:', wasPlaying);
    };

    initializeMusic();
  }, []);

  // Timer countdown - นับถอยหลังเวลารวม
  useEffect(() => {
    if (totalTimeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => {
        const newTime = totalTimeLeft - 1;
        setTotalTimeLeft(newTime);
        
        // เตือนเมื่อเหลือเวลา 1 นาที
        if (newTime === 60) {
          audioService.timeWarning();
        }
        // เตือนเมื่อเหลือเวลา 30 วินาที
        if (newTime === 30) {
          audioService.timeWarning();
        }
        // เตือนทุกวินาทีเมื่อเหลือ 10 วินาทีสุดท้าย
        if (newTime <= 10 && newTime > 0) {
          audioService.timeWarning();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (totalTimeLeft === 0 && !showFeedback) {
      // หมดเวลาแล้ว - จบข้อสอบทันที
      handleTimeUp();
    }
  }, [totalTimeLeft, showFeedback]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = async (answerIndex) => {
    if (showFeedback) return;
    
    await audioService.buttonClick();
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = async (answerIndex) => {
    if (showFeedback) return;

    const correct = answerIndex === currentQuestion.correctAnswer;
    const questionScore = correct ? (currentQuestion.points || QUIZ_SETTINGS.POINTS_PER_QUESTION) : 0;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    const answerRecord = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.question,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: correct,
      points: questionScore,
      timeUsed: Math.round((Date.now() - quizStartTime) / 1000) // เวลาที่ใช้จากเริ่มต้น
    };
    
    setAnswers(prev => [...prev, answerRecord]);

    if (correct) {
      await audioService.correctAnswer();
      setScore(score + questionScore);
    } else {
      await audioService.wrongAnswer();
    }
  };

  const handleNextQuestion = async () => {
    await audioService.navigation();
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // จบข้อสอบแล้ว
      finishQuiz();
    }
  };

  const handleTimeUp = async () => {
    // หมดเวลา - บันทึกคำตอบปัจจุบัน (ถ้ามี) และจบข้อสอบ
    if (!showFeedback && selectedAnswer !== null) {
      await handleAnswerSubmit(selectedAnswer);
    }
    
    // รอสักครู่แล้วจบข้อสอบ
    setTimeout(() => {
      finishQuiz();
    }, 2000);
  };

  const finishQuiz = async () => {
    await audioService.quizComplete();
    
    console.log('🏆 Quiz completed - keeping music playing');
    
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    
    // คำนวณคะแนนรวมจาก answers ทั้งหมด
    const finalScore = answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
    
    // คำนวณคะแนนเต็มจากคะแนนจริงของแต่ละข้อ
    const maxScore = questions.reduce((sum, question) => 
      sum + (question.points || QUIZ_SETTINGS.POINTS_PER_QUESTION), 0
    );
    
    const percentage = Math.round((finalScore / maxScore) * 100);
    
    console.log('📊 Final score calculation:', {
      finalScore,
      maxScore,
      percentage,
      totalAnswered: answers.length,
      correctAnswers: answers.filter(a => a.isCorrect).length
    });
    
    const results = {
      quizId: quiz.id || 'unknown',
      quizTitle: quiz.title,
      studentName: studentName,
      studentSchool: studentSchool,
      score: finalScore,
      totalQuestions: totalQuestions,
      percentage: percentage,
      totalTime: totalTime,
      completedAt: new Date(),
      selectedQuestionCount: selectedQuestionCount,
      originalTotalQuestions: originalTotalQuestions,
      answers: answers,
      difficulty: quiz.difficulty || 'ง่าย',
      emoji: quiz.emoji || '📚'
    };
    
    console.log('🏆 Quiz completed with full results:', results);
    
    // Navigate to result page with state
    navigate('/student/quiz/result', { state: { results } });
  };

  const handleBack = async () => {
    const confirmExit = confirm(t('exitQuizConfirm', currentLanguage));
    if (confirmExit) {
      await audioService.navigation();
      
      if (!musicWasPlaying && musicService.isCurrentlyPlaying()) {
        console.log('🔇 Stopping music on quiz exit (was not playing before)');
        musicService.stop();
      } else {
        console.log('🎵 Keeping music playing on quiz exit (was playing before)');
      }
      
      navigate(-1);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  };

  // ฟังก์ชันแปลงวินาทีเป็น นาที:วินาที
  const formatTimeDisplay = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // ฟังก์ชันคำนวณสีของเวลา
  const getTimeColor = (seconds) => {
    const totalSeconds = totalQuestions * QUIZ_SETTINGS.MINUTES_PER_QUESTION * 60;
    const percentageLeft = (seconds / totalSeconds) * 100;
    
    if (percentageLeft > 50) return '#22c55e'; // Green
    if (percentageLeft > 25) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  if (loading) {
    return <LoadingSpinner message={t('loading', currentLanguage)} />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>{t('noQuestions', currentLanguage)}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Floating elements - ซ่อนบนมือถือ */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '3%',
        fontSize: window.innerWidth < 768 ? '2rem' : '3rem',
        opacity: '0.1',
        animation: 'pulse 3s infinite',
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: window.innerWidth < 768 ? '1.5rem' : '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite',
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>⚡</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '2%',
        fontSize: window.innerWidth < 768 ? '2.5rem' : '4rem',
        opacity: '0.15',
        animation: 'pulse 5s infinite 1s',
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>🚀</div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: window.innerWidth < 768 ? '10px' : '20px',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        {/* Header - ทำให้กะทัดรัดขึ้น */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: window.innerWidth < 768 ? '16px' : '24px',
          padding: window.innerWidth < 768 ? '12px' : '24px',
          marginBottom: window.innerWidth < 768 ? '12px' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: window.innerWidth < 768 ? '12px' : '20px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: window.innerWidth < 768 ? '1.2rem' : '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {quiz.emoji} {quiz.title}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '1rem',
                display: window.innerWidth < 768 ? 'none' : 'block'
              }}>
                {t('hello', currentLanguage)} {studentName}! 🎮 {musicService.isCurrentlyPlaying() && '🎵'}
              </p>
            </div>
            
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem',
                whiteSpace: 'nowrap'
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
              <ArrowLeft size={14} />
              {t('exit', currentLanguage)}
            </button>
          </div>

          {/* Progress และ Timer */}
          <div style={{ marginBottom: window.innerWidth < 768 ? '12px' : '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem'
              }}>
                {t('question', currentLanguage)} {currentQuestionIndex + 1}/{totalQuestions}
              </span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem'
              }}>
                {t('score', currentLanguage)}: {score}
              </span>
            </div>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  height: '100%',
                  borderRadius: '10px',
                  transition: 'width 0.5s ease',
                  width: `${getProgressPercentage()}%`
                }}
              ></div>
            </div>
          </div>

          {/* Timer Display - แสดงเวลารวม */}
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem',
              fontWeight: 'bold',
              color: getTimeColor(totalTimeLeft),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              animation: totalTimeLeft <= 60 ? 'shake 0.5s infinite' : 'none'
            }}>
              <Clock size={window.innerWidth < 768 ? 24 : 32} className={totalTimeLeft <= 60 ? 'animate-pulse' : ''} />
              <span className={totalTimeLeft <= 10 ? 'animate-pulse' : ''}>
                {formatTimeDisplay(totalTimeLeft)}
              </span>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: window.innerWidth < 768 ? '0.7rem' : '0.8rem',
              marginTop: '4px'
            }}>
              เวลารวมทั้งหมด
            </p>
          </div>
        </div>

        {/* Question Card - ปรับให้พอดีหน้าจอ */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: window.innerWidth < 768 ? '16px' : '24px',
          padding: window.innerWidth < 768 ? '16px' : '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* คำถาม */}
          <div style={{
            textAlign: 'center',
            marginBottom: window.innerWidth < 768 ? '20px' : '32px'
          }}>
            <h2 style={{
              fontSize: window.innerWidth < 768 ? '1.3rem' : '2rem',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.4'
            }}>
              {currentLanguage === 'th' 
                ? (currentQuestion.questionTh || currentQuestion.question)
                : (currentQuestion.questionEn || currentQuestion.question)}
            </h2>
          </div>

          {/* ตัวเลือก - ปรับขนาดให้พอดีหน้าจอ */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: window.innerWidth < 768 ? '10px' : '16px',
            marginBottom: window.innerWidth < 768 ? '20px' : '32px',
            overflowY: 'auto',
            maxHeight: window.innerWidth < 768 ? 'calc(100vh - 380px)' : 'auto'
          }}>
            {currentQuestion.options.map((option, index) => {
              // ตรวจสอบว่ามี optionsEn หรือไม่
              let optionText;
              if (currentLanguage === 'en' && currentQuestion.optionsEn && currentQuestion.optionsEn[index]) {
                optionText = currentQuestion.optionsEn[index];
              } else if (currentLanguage === 'th' && currentQuestion.options && currentQuestion.options[index]) {
                optionText = currentQuestion.options[index];
              } else {
                // fallback
                optionText = option;
              }
                
              if (optionText && optionText.toString().trim() !== "") {
                let buttonStyle = {
                  width: '100%',
                  padding: window.innerWidth < 768 ? '14px 16px' : '20px 24px',
                  borderRadius: window.innerWidth < 768 ? '12px' : '16px',
                  fontSize: window.innerWidth < 768 ? '0.95rem' : '1.1rem',
                  fontWeight: '500',
                  cursor: showFeedback ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: window.innerWidth < 768 ? '12px' : '16px',
                  textAlign: 'left',
                  minHeight: window.innerWidth < 768 ? '50px' : '60px'
                };
                
                if (showFeedback) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonStyle.background = 'rgba(34, 197, 94, 0.3)';
                    buttonStyle.borderColor = '#22c55e';
                    buttonStyle.color = '#22c55e';
                    buttonStyle.animation = 'pulse 1s infinite';
                  } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                    buttonStyle.background = 'rgba(239, 68, 68, 0.3)';
                    buttonStyle.borderColor = '#ef4444';
                    buttonStyle.color = '#ef4444';
                  } else {
                    buttonStyle.background = 'rgba(255, 255, 255, 0.05)';
                    buttonStyle.borderColor = 'rgba(255, 255, 255, 0.2)';
                    buttonStyle.color = 'rgba(255, 255, 255, 0.5)';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonStyle.background = 'rgba(59, 130, 246, 0.3)';
                    buttonStyle.borderColor = '#3b82f6';
                    buttonStyle.color = '#60a5fa';
                  } else {
                    buttonStyle.background = 'rgba(255, 255, 255, 0.1)';
                    buttonStyle.borderColor = 'rgba(255, 255, 255, 0.3)';
                    buttonStyle.color = 'white';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      if (!showFeedback && selectedAnswer !== index && window.innerWidth >= 768) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showFeedback && selectedAnswer !== index && window.innerWidth >= 768) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{
                      width: window.innerWidth < 768 ? '28px' : '32px',
                      height: window.innerWidth < 768 ? '28px' : '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem',
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span style={{ 
                      flex: 1,
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}>{optionText}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>

          {/* ปุ่มตอบ/ถัดไป */}
          <div style={{ textAlign: 'center' }}>
            {!showFeedback ? (
              <button
                onClick={() => handleAnswerSubmit(selectedAnswer)}
                disabled={selectedAnswer === null}
                style={{
                  background: selectedAnswer !== null 
                    ? 'linear-gradient(135deg, #ec4899, #be185d)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: selectedAnswer !== null ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  borderRadius: window.innerWidth < 768 ? '12px' : '16px',
                  padding: window.innerWidth < 768 ? '14px 28px' : '16px 32px',
                  fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
                  fontWeight: 'bold',
                  cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  boxShadow: selectedAnswer !== null ? '0 8px 20px rgba(236, 72, 153, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedAnswer !== null && window.innerWidth >= 768) {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 25px rgba(236, 72, 153, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnswer !== null && window.innerWidth >= 768) {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)';
                  }
                }}
              >
                <Target size={20} />
                {t('submit', currentLanguage)}
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: window.innerWidth < 768 ? '1.2rem' : '1.8rem',
                  fontWeight: 'bold',
                  color: isCorrect ? '#22c55e' : '#ef4444',
                  marginBottom: window.innerWidth < 768 ? '16px' : '24px',
                  animation: 'slideUp 0.5s ease-out'
                }}>
                  {isCorrect ? (
                    <>🎉 {t('correct', currentLanguage)} +{currentQuestion.points || QUIZ_SETTINGS.POINTS_PER_QUESTION} {t('score', currentLanguage)}</>
                  ) : (
                    <>❌ {t('incorrect', currentLanguage)} {String.fromCharCode(65 + currentQuestion.correctAnswer)}</>
                  )}
                </div>
                
                <button
                  onClick={handleNextQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: window.innerWidth < 768 ? '12px' : '16px',
                    padding: window.innerWidth < 768 ? '14px 28px' : '16px 32px',
                    fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    margin: '0 auto',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth >= 768) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      <ArrowLeft style={{ transform: 'rotate(180deg)' }} size={20} />
                      {t('next', currentLanguage)}
                    </>
                  ) : (
                    <>
                      <Trophy size={20} />
                      {t('finish', currentLanguage)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
            transform: scale(1.05);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        
        .animate-pulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default QuizTaking;