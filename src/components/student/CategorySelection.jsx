// src/components/student/CategorySelection.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Brain, Calculator, Globe, Palette, Music2, Dumbbell, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import musicService from '../../services/musicService';
import FirebaseService from '../../services/firebase';
import { t } from '../../translations';

// Icon mapping for categories
const categoryIcons = {
  'math': Calculator,
  'science': Brain,
  'thai': BookOpen,
  'english': Globe,
  'art': Palette,
  'music': Music2,
  'pe': Dumbbell,
  'default': BookOpen
};

const CategorySelection = ({ studentName, onSelectCategory, onLogout, currentLanguage = 'th' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // ตรวจสอบสถานะเพลงเมื่อ component mount
  useEffect(() => {
    const initializeMusic = async () => {
      await musicService.initialize();
      const isPlaying = musicService.isCurrentlyPlaying();
      setMusicEnabled(isPlaying);
    };
    
    initializeMusic();
  }, []);

  useEffect(() => {
    loadCategoriesWithQuizCount();
  }, []);

  const loadCategoriesWithQuizCount = async () => {
    try {
      setLoading(true);
      
      // ดึงหมวดหมู่จาก Firebase
      const categoriesData = await FirebaseService.getAllCategories();
      
      // ดึงข้อสอบทั้งหมดเพื่อนับจำนวน
      const allQuizzes = await FirebaseService.getQuizzes();
      
      // นับจำนวนข้อสอบในแต่ละหมวด
      const categoryCounts = {};
      allQuizzes.forEach(quiz => {
        const categoryId = quiz.categoryId || 'uncategorized';
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });
      
      // อัพเดทจำนวนข้อสอบในแต่ละหมวด
      const categoriesWithCount = categoriesData.map(category => ({
        ...category,
        quizCount: categoryCounts[category.id] || 0
      }));
      
      // กรองเฉพาะหมวดที่มีข้อสอบ
      const categoriesWithQuizzes = categoriesWithCount.filter(category => category.quizCount > 0);
      
      // เพิ่มหมวด "ทุกวิชา" ถ้ามีข้อสอบ
      if (allQuizzes.length > 0) {
        categoriesWithQuizzes.push({
          id: 'all',
          name: t('allSubjects', currentLanguage),
          emoji: '📖',
          description: t('viewAllQuizzes', currentLanguage),
          color: 'from-gray-400 to-gray-500',
          iconType: 'default',
          quizCount: allQuizzes.length
        });
      }
      
      setCategories(categoriesWithQuizzes);
      
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        {
          id: 'all',
          name: t('allSubjects', currentLanguage),
          emoji: '📖',
          description: t('viewAllQuizzes', currentLanguage),
          color: 'from-gray-400 to-gray-500',
          iconType: 'default',
          quizCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    await audioService.buttonClick();
    onSelectCategory(category);
  };

  const handleLogout = async () => {
    await audioService.navigation();
    
    if (musicService.isCurrentlyPlaying()) {
      musicService.stop();
    }
    
    onLogout();
  };

  const toggleMusic = async () => {
    await audioService.buttonClick();
    
    if (musicEnabled) {
      musicService.stop();
      setMusicEnabled(false);
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
      }
    }
  };

  // เพิ่มฟังก์ชันสำหรับอัพเดทสถานะเพลงแบบ real-time
  useEffect(() => {
    const checkMusicStatus = () => {
      const isPlaying = musicService.isCurrentlyPlaying();
      if (isPlaying !== musicEnabled) {
        setMusicEnabled(isPlaying);
      }
    };

    const interval = setInterval(checkMusicStatus, 1000);
    return () => clearInterval(interval);
  }, [musicEnabled]);

  if (loading) {
    return <LoadingSpinner message={t('loading', currentLanguage)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
        animation: 'pulse 3s infinite',
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>📚</div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite',
        display: window.innerWidth < 768 ? 'none' : 'block'
      }}>🎓</div>

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
            gap: '20px'
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
                }}>📚</span>
                {t('selectCategory', currentLanguage)}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                {t('hello', currentLanguage)} {studentName}! {t('selectSubjectMessage', currentLanguage)} 🎯
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
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
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <ArrowLeft size={16} />
                {t('exit', currentLanguage)}
              </button>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📚</div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              {t('noQuizAvailable', currentLanguage)}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              {t('waitForTeacher', currentLanguage)} 🎓
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.iconType] || categoryIcons.default;
              
              return (
                <div
                  key={category.id}
                  style={{
                    background: `linear-gradient(135deg, ${category.color})`,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '28px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    animation: `slideUp 0.8s ease-out ${0.2 + index * 0.1}s both`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px'
                  }}
                  onClick={() => handleCategorySelect(category)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Background Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    opacity: '0.1'
                  }}>
                    <IconComponent size={80} />
                  </div>

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '16px',
                      animation: `bounce 3s infinite ${index * 0.5}s`
                    }}>
                      {category.emoji}
                    </div>
                    
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '8px',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      {category.name}
                    </h3>
                    
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      marginBottom: '16px'
                    }}>
                      {category.description}
                    </p>
                  </div>

                  {/* Quiz Count and Arrow */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px'
                  }}>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {category.quizCount} {t('quizCount', currentLanguage)}
                    </span>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ChevronRight size={20} color="white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

export default CategorySelection;