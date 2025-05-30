// src/components/admin/QuizEditor.jsx - เพิ่มฟีเจอร์ Import
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Upload } from 'lucide-react';
import QuizImport from './QuizImport';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';

const QuizEditor = ({ quiz = null, onSave, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Quiz data
  const [quizData, setQuizData] = useState({
    title: '',
    emoji: '📚',
    difficulty: 'ง่าย',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }
    ]
  });

  // Load quiz data if editing
  useEffect(() => {
    if (quiz) {
      setQuizData({
        title: quiz.title || '',
        emoji: quiz.emoji || '📚',
        difficulty: quiz.difficulty || 'ง่าย',
        questions: quiz.questions?.length > 0 ? quiz.questions.map(q => ({
          ...q,
          options: [...(q.options || []), '', '', '', ''].slice(0, 4)
        })) : [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 10
          }
        ]
      });
    }
  }, [quiz]);

  // Simple validation
  const validateQuiz = (quiz) => {
    const errors = [];
    
    if (!quiz.title?.trim()) {
      errors.push('กรุณาใส่ชื่อข้อสอบ');
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
      errors.push('กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ');
    }
    
    quiz.questions?.forEach((question, index) => {
      if (!question.question?.trim()) {
        errors.push(`คำถามข้อ ${index + 1}: กรุณาใส่คำถาม`);
      }
      
      const requiredOptions = question.options?.slice(0, 2).filter(opt => opt?.trim()).length || 0;
      if (requiredOptions < 2) {
        errors.push(`คำถามข้อ ${index + 1}: กรุณาใส่ตัวเลือก A และ B (บังคับ)`);
      }

      const filledOptions = question.options?.filter(opt => opt?.trim()) || [];
      if (question.correctAnswer >= filledOptions.length) {
        errors.push(`คำถามข้อ ${index + 1}: คำตอบที่เลือกไม่ถูกต้อง กรุณาเลือกจากตัวเลือกที่มีข้อความ`);
      }
    });
    
    return errors;
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

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => j === optionIndex ? value : opt)
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
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }]
    }));
  };

  const removeQuestion = async (questionIndex) => {
    await audioService.wrongAnswer();
    
    if (quizData.questions.length <= 1) {
      alert('❌ ต้องมีอย่างน้อย 1 คำถาม');
      return;
    }
    
    const confirmed = confirm('🗑️ คุณต้องการลบคำถามนี้หรือไม่?');
    if (confirmed) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== questionIndex)
      }));
    }
  };

  // ฟีเจอร์ใหม่: Import คำถาม
  const handleImportQuestions = (importedQuestions) => {
    setQuizData(prev => ({
      ...prev,
      questions: importedQuestions
    }));
    setShowImportModal(false);
    alert(`🎉 นำเข้าคำถามเรียบร้อยแล้ว! รวม ${importedQuestions.length} ข้อ`);
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
      let savedQuizId;
      
      if (quiz && quiz.id) {
        await FirebaseService.updateQuiz(quiz.id, quizData);
        savedQuizId = quiz.id;
        await audioService.correctAnswer();
        alert('✅ บันทึกการแก้ไขเรียบร้อยแล้ว!');
      } else {
        savedQuizId = await FirebaseService.createQuiz(quizData);
        await audioService.achievement();
        alert('🎉 สร้างข้อสอบใหม่เรียบร้อยแล้ว!');
      }
      
      onSave({ ...quizData, id: savedQuizId });
    } catch (error) {
      console.error('Error saving quiz:', error);
      await audioService.wrongAnswer();
      alert('❌ เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  const emojiOptions = ['📚', '🧮', '🔬', '🌟', '🇬🇧', '🎯', '💡', '🎨'];
  const difficultyOptions = ['ง่าย', 'ปานกลาง', 'ยาก'];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      <div style={{
        padding: '20px',
        maxWidth: '1000px',
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
            marginBottom: '24px'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {quiz ? '✏️ แก้ไขข้อสอบ' : '✨ สร้างข้อสอบใหม่'}
            </h1>
            
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '8px 16px',
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
              กลับ
            </button>
          </div>
          
          {/* Import Button */}
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
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Upload size={16} />
              📊 นำเข้าคำถามจาก Excel
            </button>
          </div>
          
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            💡 ปุ่มเพิ่มคำถามและปุ่มบันทึกอยู่ด้านล่างสุดของหน้า
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
            }}>❌ กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:</h3>
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
            📝 ข้อมูลพื้นฐานข้อสอบ
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Quiz Title */}
            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                ชื่อข้อสอบ *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                placeholder="เช่น คณิตศาสตร์ ป.6"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Emoji Selection */}
            <div>
              <label style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                อีโมจิ
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
                ระดับความยาก
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
            🎯 คำถาม ({quizData.questions.length} ข้อ)
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
                  คำถามข้อ {questionIndex + 1}
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
                    ลบ
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  คำถาม *
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                  placeholder="ใส่คำถามที่นี่..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Options */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '6px',
                      display: 'block'
                    }}>
                      ตัวเลือก {String.fromCharCode(65 + optionIndex)} 
                      {optionIndex < 2 ? (
                        <span style={{ color: '#ef4444' }}> *</span>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}> (ไม่บังคับ)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      placeholder={optionIndex < 2 
                        ? `ตัวเลือก ${String.fromCharCode(65 + optionIndex)} (บังคับ)` 
                        : `ตัวเลือก ${String.fromCharCode(65 + optionIndex)} (ไม่บังคับ)`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: question.correctAnswer === optionIndex 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        border: question.correctAnswer === optionIndex 
                          ? '2px solid #22c55e' 
                          : optionIndex < 2 
                            ? '2px solid rgba(239, 68, 68, 0.5)' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                    คำตอบที่ถูกต้อง *
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
                    {question.options.map((opt, optionIndex) => (
                      opt.trim() && (
                        <option 
                          key={optionIndex} 
                          value={optionIndex}
                          style={{ background: '#374151', color: 'white' }}
                        >
                          {String.fromCharCode(65 + optionIndex)} - {opt.substring(0, 20)}{opt.length > 20 ? '...' : ''}
                        </option>
                      )
                    ))}
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
                    คะแนน
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
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={20} />
              ➕ เพิ่มคำถามใหม่
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
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 16px 40px rgba(16, 185, 129, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
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
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save size={24} />
                <span>{quiz ? '💾 บันทึกการแก้ไข' : '🎉 สร้างข้อสอบ'}</span>
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