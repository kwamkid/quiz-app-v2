// src/components/admin/AdminScores.jsx - รองรับการแสดงผลตามภาษา
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Target, Calendar, Search, Filter, Clock, Download, School } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchableDropdown from '../common/SearchableDropdown';
import Pagination from '../common/Pagination';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import AnswerReview from '../common/AnswerReview';
import { formatDate } from '../../utils/helpers';
import { t, getLocalizedField } from '../../translations';

const AdminScores = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const [allAttempts, setAllAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [quizzes, setQuizzes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
    topScore: 0
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedAttempts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAttempts.slice(start, start + rowsPerPage);
  }, [filteredAttempts, currentPage, rowsPerPage]);

  // ใช้ useCallback เพื่อป้องกัน function ถูกสร้างใหม่
  const filterAttempts = useCallback(() => {
    console.log('🔍 Filtering attempts...');
    let filtered = [...allAttempts];

    // Filter by search term (student name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(attempt =>
        attempt.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by quiz
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(attempt => attempt.quizId === selectedQuiz);
    }

    // Filter by school
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(attempt => attempt.schoolId === selectedSchool);
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(attempt => {
        const attemptDate = attempt.timestamp ? new Date(attempt.timestamp.seconds * 1000) : new Date(0);

        switch (selectedDateRange) {
          case 'today':
            return attemptDate >= today;

          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return attemptDate >= weekAgo;
          }

          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return attemptDate >= monthAgo;
          }

          case 'custom':
            if (customStartDate && customEndDate) {
              const start = new Date(customStartDate);
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              return attemptDate >= start && attemptDate <= end;
            }
            return true;

          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
      const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
      return dateB - dateA;
    });

    setFilteredAttempts(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
    console.log('✅ Filtered:', filtered.length, 'attempts');
  }, [allAttempts, searchTerm, selectedQuiz, selectedSchool, selectedDateRange, customStartDate, customEndDate]);

  // โหลดข้อมูลครั้งเดียวตอน mount
  useEffect(() => {
    let mounted = true;

    const loadAllData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading admin scores data...');

        // Load all data in parallel
        const [attempts, quizzesData, schoolsData] = await Promise.all([
          FirebaseService.getAllStudentAttempts(),
          FirebaseService.getQuizzes(),
          FirebaseService.getAllSchools()
        ]);

        if (!mounted) return;

        setAllAttempts(attempts);
        setQuizzes(quizzesData);
        setSchools(schoolsData);

        console.log('✅ Admin scores loaded:', attempts.length, 'attempts,', quizzesData.length, 'quizzes,', schoolsData.length, 'schools');
      } catch (error) {
        console.error('❌ Error loading admin scores:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    filterAttempts();
  }, [filterAttempts]);

  // คำนวณ stats ตาม filtered data
  useEffect(() => {
    if (filteredAttempts.length > 0) {
      const uniqueStudents = new Set(
        filteredAttempts.map(attempt => `${attempt.studentName}_${attempt.schoolId || 'no-school'}`)
      ).size;

      const totalScore = filteredAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
      const averageScore = Math.round(totalScore / filteredAttempts.length);
      const topScore = Math.max(...filteredAttempts.map(attempt => attempt.percentage || 0));

      setStats({
        totalStudents: uniqueStudents,
        totalAttempts: filteredAttempts.length,
        averageScore,
        topScore
      });
    } else {
      setStats({
        totalStudents: 0,
        totalAttempts: 0,
        averageScore: 0,
        topScore: 0
      });
    }
  }, [filteredAttempts]);


  const handleBack = async () => {
    await audioService.navigation();
    navigate('/admin/dashboard');
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    return '#ef4444';
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '💪';
    return '📚';
  };

  // ฟังก์ชันโหลด quiz data และเปิด modal
  const handleViewAnswers = async (attempt) => {
    setLoadingQuiz(true);
    try {
      // ใช้ quizData ที่บันทึกไว้ก่อน ถ้าไม่มีค่อยโหลดจาก Firebase
      if (attempt.quizData) {
        console.log('📚 Using saved quiz data');
        setSelectedReview({
          ...attempt,
          quiz: attempt.quizData
        });
      } else if (!attempt.quiz && attempt.quizId) {
        console.log('📚 Loading quiz data from Firebase:', attempt.quizId);
        const quizData = await FirebaseService.getQuiz(attempt.quizId);
        setSelectedReview({
          ...attempt,
          quiz: quizData
        });
      } else {
        setSelectedReview(attempt);
      }
      setShowAnswerReview(true);
    } catch (error) {
      console.error('❌ Error loading quiz:', error);
      setSelectedReview(attempt);
      setShowAnswerReview(true);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const exportToCSV = () => {
  if (filteredAttempts.length === 0) {
    alert(t('noDataToExport', currentLanguage));
    return;
  }

  // Prepare CSV headers
  const headers = [
    t('studentName', currentLanguage),
    t('school', currentLanguage),
    t('quizName', currentLanguage),
    t('score', currentLanguage),
    t('maxScore', currentLanguage), // ✅ เพิ่ม header คะแนนเต็ม
    t('percentage', currentLanguage),
    t('totalQuestions', currentLanguage),
    t('timeUsedSeconds', currentLanguage),
    t('dateCompleted', currentLanguage)
  ];
  
  // Prepare CSV rows
  const rows = filteredAttempts.map(attempt => [
    attempt.studentName,
    attempt.displaySchoolName || attempt.schoolName || '-',
    getLocalizedField(attempt, 'quizTitle', currentLanguage),
    attempt.score,
    attempt.maxScore || attempt.totalQuestions * 10, // ✅ เพิ่มคะแนนเต็ม
    attempt.percentage + '%',
    attempt.totalQuestions,
    attempt.totalTime || 0,
    formatDate(attempt.timestamp)
  ]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `quiz-scores-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  if (loading) {
    return <LoadingSpinner message={t('loadingScores', currentLanguage)} />;
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
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          zIndex: 10,
          overflow: 'visible'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                📊 {t('scoreSystem', currentLanguage)}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem'
              }}>
                {t('trackStudentProgress', currentLanguage)}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={exportToCSV}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Download size={18} />
                {t('exportCSV', currentLanguage)}
              </button>

              <button
                onClick={handleBack}
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
                  gap: '8px'
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
                <ArrowLeft size={18} />
                {t('back', currentLanguage)}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <input
                type="text"
                placeholder={`🔍 ${t('searchStudent', currentLanguage)}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* School Filter */}
            <div style={{ position: 'relative' }}>
              <School size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                zIndex: 1
              }} />
              <SearchableDropdown
                value={selectedSchool}
                onChange={(val) => setSelectedSchool(val)}
                iconLeft
                options={[
                  { value: 'all', label: `🏫 ${t('allSchools', currentLanguage)}` },
                  ...schools.map((school) => ({
                    value: school.id,
                    label: getLocalizedField(school, 'name', currentLanguage)
                  }))
                ]}
              />
            </div>

            {/* Quiz Filter */}
            <div style={{ position: 'relative' }}>
              <Filter size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                zIndex: 1
              }} />
              <SearchableDropdown
                value={selectedQuiz}
                onChange={(val) => setSelectedQuiz(val)}
                iconLeft
                options={[
                  { value: 'all', label: `📚 ${t('allQuizzes', currentLanguage)}` },
                  ...quizzes.map((quiz) => ({
                    value: quiz.id,
                    label: `${quiz.emoji} ${getLocalizedField(quiz, 'title', currentLanguage)}`
                  }))
                ]}
              />
            </div>

            {/* Date Range Filter */}
            <div style={{ position: 'relative' }}>
              <Calendar size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                zIndex: 1
              }} />
              <SearchableDropdown
                value={selectedDateRange}
                onChange={(val) => {
                  setSelectedDateRange(val);
                  if (val !== 'custom') {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}
                iconLeft
                options={[
                  { value: 'all', label: `📅 ${t('allTime', currentLanguage)}` },
                  { value: 'today', label: `📆 ${t('today', currentLanguage)}` },
                  { value: 'week', label: `📅 ${t('last7Days', currentLanguage)}` },
                  { value: 'month', label: `📅 ${t('last30Days', currentLanguage)}` },
                  { value: 'custom', label: `📅 ${t('custom', currentLanguage)}` },
                ]}
              />
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedDateRange === 'custom' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('startDate', currentLanguage)}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('endDate', currentLanguage)}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Users size={32} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalStudents}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('totalStudents', currentLanguage)}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Trophy size={32} style={{ color: '#22c55e', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.topScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('topScore', currentLanguage)}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Target size={32} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.averageScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('averageScore', currentLanguage)}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <Target size={32} style={{ color: '#ec4899', marginBottom: '12px' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
              {stats.totalAttempts}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('totalAttempts', currentLanguage)}</div>
          </div>
        </div>

        {/* Scores Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 {t('scoreList', currentLanguage)} ({filteredAttempts.length} {t('items', currentLanguage)})
          </h2>

          {filteredAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                {searchTerm || selectedQuiz !== 'all' || selectedSchool !== 'all' || selectedDateRange !== 'all'
                  ? t('noSearchResults', currentLanguage)
                  : t('noScoreData', currentLanguage)}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {searchTerm || selectedQuiz !== 'all' || selectedSchool !== 'all' || selectedDateRange !== 'all'
                  ? t('tryDifferentFilter', currentLanguage)
                  : t('waitForStudents', currentLanguage)}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {paginatedAttempts.map((attempt, index) => (
                <div 
                  key={attempt.id || index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Student & School Info */}
                    <div>
                      <h4 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        👤 {attempt.studentName}
                      </h4>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <School size={12} />
                        {attempt.displaySchoolName || attempt.schoolName || '-'}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <Calendar size={12} />
                        {formatDate(attempt.timestamp)}
                      </div>
                    </div>

                    {/* Quiz Info */}
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {getGradeEmoji(attempt.percentage || 0)} {getLocalizedField(attempt, 'quizTitle', currentLanguage)}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {attempt.totalQuestions} {t('questions', currentLanguage)}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: getScoreColor(attempt.percentage || 0),
                        marginBottom: '4px'
                      }}>
                        {attempt.percentage || 0}%
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {/* ✅ แก้ไข: ใช้ maxScore ถ้ามี ถ้าไม่มีให้ใช้ totalQuestions * 10 */}
                        {attempt.score}/{attempt.maxScore || attempt.totalQuestions * 10} {t('score', currentLanguage)}
                      </div>
                    </div>

                    {/* Time */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        marginBottom: '4px'
                      }}>
                        <Clock size={14} />
                        {t('timeUsed', currentLanguage)}
                      </div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>
                        {Math.floor((attempt.totalTime || 0) / 60)}:{((attempt.totalTime || 0) % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* View Details Button */}
                    {attempt.answers && attempt.answers.length > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            handleViewAnswers(attempt);
                            audioService.buttonClick();
                          }}
                          disabled={loadingQuiz}
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            cursor: loadingQuiz ? 'wait' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            opacity: loadingQuiz ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            if (!loadingQuiz) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea, #7e22ce)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loadingQuiz) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                            }
                          }}
                        >
                          📋 {loadingQuiz ? t('loading', currentLanguage) : t('viewDetails', currentLanguage)}
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            totalItems={filteredAttempts.length}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
            lang={currentLanguage}
          />
        </div>
      </div>

      {/* Answer Review Modal */}
      {selectedReview && (
        <AnswerReview
          isOpen={showAnswerReview}
          onClose={() => {
            setShowAnswerReview(false);
            setSelectedReview(null);
          }}
          answers={selectedReview.answers || []}
          quiz={selectedReview.quiz}
          quizTitle={getLocalizedField(selectedReview, 'quizTitle', currentLanguage)}
          studentName={selectedReview.studentName}
          score={selectedReview.score}
          percentage={selectedReview.percentage}
          totalTime={selectedReview.totalTime}
          currentLanguage={currentLanguage}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminScores;