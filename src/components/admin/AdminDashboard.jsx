// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BarChart3, ArrowLeft, Target, Calendar, Users, BookOpen, Filter, Tag, Volume2, VolumeX } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import musicService from '../../services/musicService';
import FirebaseService from '../../services/firebase';
import { formatDate } from '../../utils/helpers';

const AdminDashboard = ({ onCreateQuiz, onEditQuiz, onDeleteQuiz, onViewScores, onManageCategories, onBack, onLogout }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0
  });
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    loadData();
    initializeMusic();
  }, []);

  const initializeMusic = async () => {
    await musicService.initialize();
    const isPlaying = musicService.isCurrentlyPlaying();
    setMusicEnabled(isPlaying);
  };

  // Filter quizzes เมื่อ category หรือ quizzes เปลี่ยน
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz => quiz.categoryId === selectedCategory);
      setFilteredQuizzes(filtered);
    }
  }, [selectedCategory, quizzes]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesData = await FirebaseService.getAllCategories();
      setCategories(categoriesData);
      
      // Load quizzes
      const quizzesData = await FirebaseService.getQuizzes();
      
      // ✅ เรียงตามวันที่แก้ไขล่าสุด (updatedAt หรือ createdAt)
      const sortedQuizzes = quizzesData.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        
        // แปลง Firestore timestamp เป็น Date object ถ้าจำเป็น
        const timestampA = dateA.toDate ? dateA.toDate() : new Date(dateA);
        const timestampB = dateB.toDate ? dateB.toDate() : new Date(dateB);
        
        return timestampB - timestampA; // เรียงจากใหม่ไปเก่า
      });
      
      setQuizzes(sortedQuizzes);
      setFilteredQuizzes(sortedQuizzes);
      
      // Calculate stats
      const totalQuestions = sortedQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);
      
      // Load attempts for stats (simplified for demo)
      let totalAttempts = 0;
      try {
        const attempts = await FirebaseService.getAllStudentAttempts();
        totalAttempts = attempts.length;
      } catch (error) {
        console.warn('Could not load attempts:', error);
      }
      
      setStats({
        totalQuizzes: sortedQuizzes.length,
        totalQuestions,
        totalAttempts
      });
      
      console.log('✅ Quizzes loaded and sorted by last modified:', sortedQuizzes.length);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    await audioService.buttonClick();
    setSelectedCategory(categoryId);
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return {
        name: category.name,
        emoji: category.emoji,
        color: category.color
      };
    }
    return {
      name: '📖 อื่นๆ',
      emoji: '📖',
      color: 'from-gray-400 to-gray-500'
    };
  };

  const handleCreateQuiz = async () => {
    await audioService.buttonClick();
    onCreateQuiz();
  };

  const handleEditQuiz = async (quiz) => {
    await audioService.buttonClick();
    onEditQuiz(quiz);
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    await audioService.wrongAnswer();
    
    const confirmed = confirm(`🗑️ คุณต้องการลบข้อสอบ "${quizTitle}" จริงหรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`);
    
    if (confirmed) {
      try {
        setLoading(true);
        await FirebaseService.deleteQuiz(quizId);
        await audioService.correctAnswer();
        
        // Update local state
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        
        // Recalculate stats
        const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
        const totalQuestions = updatedQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);
        setStats(prev => ({
          ...prev,
          totalQuizzes: updatedQuizzes.length,
          totalQuestions
        }));
        
        alert('✅ ลบข้อสอบเรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('❌ เกิดข้อผิดพลาดในการลบข้อสอบ');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewScores = async () => {
    await audioService.buttonClick();
    onViewScores();
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  const handleLogout = async () => {
    await audioService.navigation();
    
    const confirmed = confirm('🚪 คุณต้องการออกจากระบบหรือไม่?');
    if (confirmed) {
      // หยุดเพลงเมื่อออกจากระบบ
      if (musicService.isCurrentlyPlaying()) {
        musicService.stop();
      }
      onLogout();
    }
  };

  const toggleMusic = async () => {
    await audioService.buttonClick();
    
    if (musicEnabled) {
      // หยุดเพลง
      musicService.stop();
      setMusicEnabled(false);
      console.log('🔇 Music stopped by admin');
    } else {
      // เริ่มเพลง
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
        alert(`🎵 ไม่สามารถเล่นเพลงได้

สาเหตุที่เป็นไปได้:
- เบราว์เซอร์บล็อกการเล่นเพลงอัตโนมัติ
- รูปแบบไฟล์ไม่รองรับ
- ไฟล์เสียหาย

ลองกดปุ่มเพลงอีกครั้ง`);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
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
      }}>📊</div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        fontSize: '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite'
      }}>👨‍🏫</div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '2%',
        fontSize: '4rem',
        opacity: '0.15',
        animation: 'pulse 5s infinite 1s'
      }}>📚</div>

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
                }}>👨‍🏫</span>
                แดชบอร์ดครู
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.2rem'
              }}>
                จัดการข้อสอบและติดตามความก้าวหน้า {musicEnabled && '🎵'}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* Music Toggle Button */}
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
                  e.currentTarget.style.transform = 'scale(1.05)';
                  if (!musicEnabled) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  if (!musicEnabled) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                title={musicEnabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}
              >
                {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <button
                onClick={handleLogout}
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
                🚪 ออกจากระบบ
              </button>

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
                กลับ
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
              onClick={handleCreateQuiz}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1.1rem',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Plus size={20} />
              ✨ สร้างข้อสอบใหม่
            </button>
            
            <button
              onClick={handleViewScores}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1.1rem',
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
              <BarChart3 size={20} />
              📊 ดูคะแนนนักเรียน
            </button>

            {onManageCategories && (
              <button
                onClick={onManageCategories}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
                }}
              >
                <BookOpen size={20} />
                📂 จัดการหมวดหมู่
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Total Quizzes */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                background: 'rgba(139, 92, 246, 0.3)',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <BookOpen size={24} color="white" />
              </div>
              <h3 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>ข้อสอบทั้งหมด</h3>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>{stats.totalQuizzes}</div>
          </div>

          {/* Total Questions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.3)',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <Target size={24} color="white" />
              </div>
              <h3 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>คำถามทั้งหมด</h3>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>{stats.totalQuestions}</div>
          </div>

          {/* Total Attempts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.8s ease-out 0.6s both'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.3)',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <Users size={24} color="white" />
              </div>
              <h3 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>ครั้งที่ทำข้อสอบ</h3>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>{stats.totalAttempts}</div>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'slideUp 0.8s ease-out 0.7s both'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Filter size={20} color="white" />
            <h3 style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              กรองตามหมวดหมู่
            </h3>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* All Categories Button */}
            <button
              onClick={() => handleCategoryFilter('all')}
              style={{
                background: selectedCategory === 'all' 
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: selectedCategory === 'all'
                  ? '2px solid #60a5fa'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'all') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'all') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              📚 ทั้งหมด ({quizzes.length})
            </button>

            {/* Category Buttons */}
            {categories.map((category) => {
              const quizCount = quizzes.filter(q => q.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  style={{
                    background: selectedCategory === category.id 
                      ? `linear-gradient(135deg, ${category.color})`
                      : 'rgba(255, 255, 255, 0.1)',
                    border: selectedCategory === category.id
                      ? '2px solid rgba(255, 255, 255, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {category.emoji} {category.name} ({quizCount})
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Quiz List */}
        <div style={{
          animation: 'slideUp 0.8s ease-out 0.8s both'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📚 ข้อสอบ{selectedCategory !== 'all' && `ในหมวด ${getCategoryInfo(selectedCategory).name}`} ({filteredQuizzes.length} ชุด)
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {filteredQuizzes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📝</div>
                <h3 style={{
                  fontSize: '2rem',
                  color: 'white',
                  marginBottom: '12px',
                  fontWeight: 'bold'
                }}>
                  {selectedCategory === 'all' ? 'ยังไม่มีข้อสอบ' : `ยังไม่มีข้อสอบในหมวด ${getCategoryInfo(selectedCategory).name}`}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1.2rem',
                  marginBottom: '24px'
                }}>
                  เริ่มสร้างข้อสอบแรกกันเลย!
                </p>
                <button
                  onClick={handleCreateQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 32px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Plus size={20} />
                  ✨ สร้างข้อสอบใหม่
                </button>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => {
                const categoryInfo = getCategoryInfo(quiz.categoryId);
                return (
                  <div 
                    key={quiz.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      padding: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flex: 1,
                        minWidth: '300px'
                      }}>
                        <div style={{ 
                          fontSize: '3rem',
                          animation: 'bounce 3s infinite'
                        }}>{quiz.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px'
                          }}>{quiz.title}</h3>
                          
                          {/* Category Badge */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: `linear-gradient(135deg, ${categoryInfo.color})`,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            marginBottom: '8px'
                          }}>
                            <Tag size={14} color="white" />
                            <span style={{
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              {categoryInfo.name}
                            </span>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Target size={16} />
                              {quiz.questions?.length || 0} คำถาม
                            </span>
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Calendar size={16} />
                              {formatDate(quiz.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          style={{
                            background: 'rgba(251, 191, 36, 0.2)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Edit size={16} />
                          แก้ไข
                        </button>
                        
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Trash2 size={16} />
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
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

export default AdminDashboard;