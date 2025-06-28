// src/components/admin/QuizEditor.jsx - ปรับปรุง UI และรองรับ 2 ภาษา
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Upload, Globe } from 'lucide-react';
import QuizImport from './QuizImport';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import { t } from '../../translations';

const QuizEditor = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // รับ quiz id จาก URL
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBilingualFields, setShowBilingualFields] = useState(true);
  
  // Quiz data - รองรับ 2 ภาษา
  const [quizData, setQuizData] = useState({
    title: '',
    titleTh: '',
    titleEn: '',
    emoji: '📚',
    difficulty: 'ง่าย',
    categoryId: 'uncategorized',
    questions: [
      {
        question: '',
        questionTh: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsTh: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }
    ]
  });

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  // Load quiz if editing
  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await FirebaseService.getQuiz(id);
      if (quizData) {
        setQuiz(quizData);
        // Set quizData state from loaded quiz
        setQuizData({
          title: quizData.title || '',
          titleTh: quizData.titleTh || quizData.title || '',
          titleEn: quizData.titleEn || '',
          emoji: quizData.emoji || '📚',
          difficulty: quizData.difficulty || 'ง่าย',
          categoryId: quizData.categoryId || 'uncategorized',
          questions: quizData.questions?.length > 0 ? quizData.questions.map(q => ({
            ...q,
            question: q.question || '',
            questionTh: q.questionTh || q.question || '',
            questionEn: q.questionEn || '',
            options: q.options || ['', '', '', ''],
            optionsTh: q.optionsTh || q.options || ['', '', '', ''],
            optionsEn: q.optionsEn || ['', '', '', '']
          })) : [
            {
              question: '',
              questionTh: '',
              questionEn: '',
              options: ['', '', '', ''],
              optionsTh: ['', '', '', ''],
              optionsEn: ['', '', '', ''],
              correctAnswer: 0,
              points: 10
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('ไม่สามารถโหลดข้อสอบได้');
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await FirebaseService.getAllCategories();
      setCategories(categoriesData);
      console.log('✅ Categories loaded:', categoriesData.length);
    } catch (error) {
      console.error('Error loading categories:', error);
      // ใช้ default categories หากโหลดไม่สำเร็จ
      setCategories([
        { id: 'math', name: '🧮 คณิตศาสตร์' },
        { id: 'science', name: '🔬 วิทยาศาสตร์' },
        { id: 'thai', name: '📚 ภาษาไทย' },
        { id: 'english', name: '🇬🇧 ภาษาอังกฤษ' },
        { id: 'art', name: '🎨 ศิลปะ' },
        { id: 'music', name: '🎵 ดนตรี' },
        { id: 'pe', name: '⚽ พลศึกษา' },
        { id: 'uncategorized', name: '📖 อื่นๆ' }
      ]);
    }
  };

  // Validation
  const validateQuiz = (quizToValidate) => {
    const validationErrors = [];
    
    // ตรวจสอบว่ามีชื่อข้อสอบอย่างน้อยภาษาใดภาษาหนึ่ง
    if (!quizToValidate.titleTh?.trim() && !quizToValidate.titleEn?.trim()) {
      validationErrors.push(t('pleaseEnterQuizName', currentLanguage));
    }
    
    if (!quizToValidate.questions || quizToValidate.questions.length === 0) {
      validationErrors.push(t('pleaseAddQuestion', currentLanguage));
    }
    
    quizToValidate.questions?.forEach((question, index) => {
      // ตรวจสอบว่ามีคำถามอย่างน้อยภาษาใดภาษาหนึ่ง
      if (!question.questionTh?.trim() && !question.questionEn?.trim()) {
        validationErrors.push(`${t('question', currentLanguage)} ${index + 1}: ${t('pleaseEnterQuestion', currentLanguage)}`);
      }
      
      // ตรวจสอบตัวเลือก (อย่างน้อย 2 ตัวเลือกในภาษาใดภาษาหนึ่ง)
      const filledOptionsTh = question.optionsTh?.filter(opt => opt?.trim()).length || 0;
      const filledOptionsEn = question.optionsEn?.filter(opt => opt?.trim()).length || 0;
      
      if (filledOptionsTh < 2 && filledOptionsEn < 2) {
        validationErrors.push(`${t('question', currentLanguage)} ${index + 1}: ${t('pleaseEnter2Options', currentLanguage)}`);
      }
    });
    
    return validationErrors;
  };

  const handleQuizInfoChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
    setErrors([]);
  };

  const handleOptionChange = (questionIndex, optionIndex, value, lang = 'th') => {
    const field = lang === 'th' ? 'optionsTh' : 'optionsEn';
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          [field]: q[field].map((opt, j) => j === optionIndex ? value : opt)
        } : q
      )
    }));
    setErrors([]);
  };

  const addQuestion = async () => {
    await audioService.buttonClick();
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        questionTh: '',
        questionEn: '',
        options: ['', '', '', ''],
        optionsTh: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }]
    }));
  };

  const removeQuestion = async (questionIndex) => {
    await audioService.wrongAnswer();
    
    if (quizData.questions.length <= 1) {
      alert(t('mustHaveOneQuestion', currentLanguage));
      return;
    }
    
    const confirmed = confirm(t('confirmDeleteQuestion', currentLanguage));
    if (confirmed) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== questionIndex)
      }));
    }
  };

  const handleImportQuestions = (importedQuestions) => {
    setQuizData(prev => ({
      ...prev,
      questions: importedQuestions
    }));
    setShowImportModal(false);
    alert(`${t('importSuccess', currentLanguage)} ${importedQuestions.length} ${t('questions', currentLanguage)}`);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors([]);
    
    await audioService.buttonClick();
    
    const validationErrors = validateQuiz(quizData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      await audioService.wrongAnswer();
      return;
    }
    
    try {
      // เตรียมข้อมูลสำหรับบันทึก
      const dataToSave = {
        ...quizData,
        title: quizData.titleTh || quizData.titleEn || quizData.title,
        // แปลงคำถามให้รองรับ format เก่า
        questions: quizData.questions.map(q => ({
          ...q,
          question: q.questionTh || q.questionEn || q.question,
          options: q.optionsTh?.some(opt => opt.trim()) ? q.optionsTh : q.optionsEn
        }))
      };
      
      let savedQuizId;
      
      if (quiz && quiz.id) {
        await FirebaseService.updateQuiz(quiz.id, dataToSave);
        savedQuizId = quiz.id;
        await audioService.correctAnswer();
        alert(t('saveSuccess', currentLanguage));
      } else {
        savedQuizId = await FirebaseService.createQuiz(dataToSave);
        await audioService.achievement();
        alert(t('createQuizSuccess', currentLanguage));
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      await audioService.wrongAnswer();
      alert(t('errorOccurred', currentLanguage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    navigate('/admin/dashboard');
  };

  const emojiOptions = ['📚', '🧮', '🔬', '🌟', '🇬🇧', '🎯', '💡', '🎨'];
  const difficultyOptions = currentLanguage === 'th' 
    ? ['ง่าย', 'ปานกลาง', 'ยาก']
    : ['Easy', 'Medium', 'Hard'];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
      paddingTop: '60px',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
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
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {quiz ? '✏️ ' + t('editQuiz', currentLanguage) : '✨ ' + t('createQuiz', currentLanguage)}
            </h1>
            
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <ArrowLeft size={16} />
              {t('back', currentLanguage)}
            </button>
          </div>
          
          {/* Import & Bilingual Toggle Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Upload size={16} />
              📊 {t('importFromExcel', currentLanguage)}
            </button>

            {/* Toggle Bilingual Fields */}
            <button
              onClick={() => setShowBilingualFields(!showBilingualFields)}
              style={{
                background: showBilingualFields 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: showBilingualFields
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Globe size={16} />
              {showBilingualFields 
                ? currentLanguage === 'th' ? '🌐 คำถาม 2 ภาษา' : '🌐 Bilingual Questions'
                : currentLanguage === 'th' ? '🇹🇭 คำถามภาษาเดียว' : '🇹🇭 Single Language'
              }
            </button>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <h3 style={{
              color: '#fca5a5',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}>
              ❌ {t('pleaseFixErrors', currentLanguage)}
            </h3>
            <ul style={{ color: '#fca5a5', paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quiz Basic Info */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            📝 {t('quizBasicInfo', currentLanguage)}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Quiz Title Thai */}
            <div style={{ gridColumn: showBilingualFields ? 'span 1' : 'span 2' }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                {t('quizTitleTh', currentLanguage)} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={quizData.titleTh}
                onChange={(e) => handleQuizInfoChange('titleTh', e.target.value)}
                placeholder={currentLanguage === 'th' ? "เช่น คณิตศาสตร์ ป.6" : "e.g. Mathematics Grade 6"}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Quiz Title English */}
            {showBilingualFields && (
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('quizTitleEn', currentLanguage)}
                </label>
                <input
                  type="text"
                  value={quizData.titleEn}
                  onChange={(e) => handleQuizInfoChange('titleEn', e.target.value)}
                  placeholder="e.g. Mathematics Grade 6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            )}

            {/* Emoji Selection */}
            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                {t('emoji', currentLanguage)}
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuizInfoChange('emoji', emoji)}
                    style={{
                      background: quizData.emoji === emoji 
                        ? 'rgba(139, 92, 246, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      border: quizData.emoji === emoji 
                        ? '2px solid #8b5cf6' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                {t('difficulty', currentLanguage)}
              </label>
              <select
                value={quizData.difficulty}
                onChange={(e) => handleQuizInfoChange('difficulty', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {difficultyOptions.map((level) => (
                  <option key={level} value={level} style={{ background: '#374151', color: 'white' }}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                {t('subjectCategory', currentLanguage)} <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>*</span>
              </label>
              <select
                value={quizData.categoryId}
                onChange={(e) => handleQuizInfoChange('categoryId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} style={{ background: '#374151', color: 'white' }}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            🎯 {t('questions', currentLanguage)} ({quizData.questions.length} {t('questions', currentLanguage).toLowerCase()})
          </h2>

          {quizData.questions.map((question, questionIndex) => (
            <div 
              key={questionIndex}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {t('question', currentLanguage)} {questionIndex + 1}
                </h3>
                
                {quizData.questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Trash2 size={14} />
                    {t('delete', currentLanguage)}
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: showBilingualFields ? 'repeat(2, 1fr)' : '1fr',
                  gap: '16px'
                }}>
                  {/* Thai Question */}
                  <div>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      {t('questionTextTh', currentLanguage)} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      value={question.questionTh}
                      onChange={(e) => handleQuestionChange(questionIndex, 'questionTh', e.target.value)}
                      placeholder={currentLanguage === 'th' ? "ใส่คำถามภาษาไทยที่นี่..." : "Enter Thai question here..."}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* English Question */}
                  {showBilingualFields && (
                    <div>
                      <label style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        {t('questionTextEn', currentLanguage)}
                      </label>
                      <textarea
                        value={question.questionEn}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionEn', e.target.value)}
                        placeholder="Enter English question here..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '1rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '12px',
                  display: 'block'
                }}>
                  {t('optionsInfo', currentLanguage)}
                </label>
                
                {['A', 'B', 'C', 'D'].map((letter, optionIndex) => (
                  <div key={optionIndex} style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: question.correctAnswer === optionIndex ? '#22c55e' : 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        minWidth: '30px'
                      }}>
                        {letter}.
                      </span>
                      <div style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: showBilingualFields ? 'repeat(2, 1fr)' : '1fr',
                        gap: '12px'
                      }}>
                        {/* Thai Option */}
                        <input
                          type="text"
                          value={question.optionsTh[optionIndex]}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value, 'th')}
                          placeholder={`${t('option', currentLanguage)} ${letter} (${t('thai', currentLanguage)})${optionIndex < 2 ? ' *' : ''}`}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: question.correctAnswer === optionIndex 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            border: question.correctAnswer === optionIndex 
                              ? '2px solid #22c55e' 
                              : '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                        
                        {/* English Option */}
                        {showBilingualFields && (
                          <input
                            type="text"
                            value={question.optionsEn[optionIndex]}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value, 'en')}
                            placeholder={`Option ${letter} (English)`}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: question.correctAnswer === optionIndex 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'rgba(255, 255, 255, 0.1)',
                              border: question.correctAnswer === optionIndex 
                                ? '2px solid #22c55e' 
                                : '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '10px',
                              color: 'white',
                              fontSize: '0.9rem',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Correct Answer and Points */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t('correctAnswer', currentLanguage)} <span style={{ color: '#10b981' }}>*</span>
                  </label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '2px solid #22c55e',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {['A', 'B', 'C', 'D'].map((letter, index) => {
                      const hasThai = question.optionsTh[index]?.trim();
                      const hasEnglish = question.optionsEn[index]?.trim();
                      if (hasThai || hasEnglish) {
                        return (
                          <option 
                            key={index} 
                            value={index}
                            style={{ background: '#374151', color: 'white' }}
                          >
                            {letter}
                          </option>
                        );
                      }
                      return null;
                    })}
                  </select>
                </div>

                <div>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    {t('points', currentLanguage)}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value) || 10)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={addQuestion}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: '0 auto',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={20} />
              ➕ {t('addQuestion', currentLanguage)}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          marginBottom: '32px'
        }}>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              background: isLoading 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: isLoading ? 'rgba(255, 255, 255, 0.5)' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '20px 48px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '0 auto',
              boxShadow: isLoading ? 'none' : '0 12px 30px rgba(16, 185, 129, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(16, 185, 129, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>{t('saving', currentLanguage)}</span>
              </>
            ) : (
              <>
                <Save size={24} />
                <span>{quiz ? '💾 ' + t('save', currentLanguage) : '🎉 ' + t('createQuiz', currentLanguage)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <QuizImport
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportQuestions}
          existingQuestions={quizData.questions}
          supportBilingual={showBilingualFields}
          currentLanguage={currentLanguage}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default QuizEditor;