// src/components/admin/AdminScores.jsx - เพิ่มการแสดงข้อมูลโรงเรียน
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Target, Calendar, Search, Filter, Clock, Download, School } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import AnswerReview from '../common/AnswerReview';
import { formatDate } from '../../utils/helpers';

const AdminScores = () => {
  const navigate = useNavigate();
  const [allAttempts, setAllAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [quizzes, setQuizzes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all'); // all, today, week, month, custom
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
              end.setHours(23, 59, 59, 999); // Include entire end day
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
      // Unique students (ต้องดูทั้งชื่อและโรงเรียน)
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
      // ถ้าไม่มีข้อมูลหลัง filter
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

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredAttempts.length === 0) {
      alert('ไม่มีข้อมูลให้ส่งออก');
      return;
    }

    // Prepare CSV headers
    const headers = ['ชื่อนักเรียน', 'โรงเรียน', 'ชื่อข้อสอบ', 'คะแนน', 'เปอร์เซ็นต์', 'จำนวนข้อ', 'เวลาที่ใช้ (วินาที)', 'วันที่ทำ'];
    
    // Prepare CSV rows
    const rows = filteredAttempts.map(attempt => [
      attempt.studentName,
      attempt.displaySchoolName || attempt.schoolName || '-',
      attempt.quizTitle,
      attempt.score,
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
    return <LoadingSpinner message="กำลังโหลดข้อมูลคะแนน..." />;
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                📊 ระบบดูคะแนนนักเรียน
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.1rem'
              }}>
                ติดตามผลการเรียนรู้ของนักเรียนทุกคน
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
                ส่งออก CSV
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
                กลับ
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
                placeholder="🔍 ค้นหาชื่อนักเรียน..."
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
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="all" style={{ background: '#374151', color: 'white' }}>
                  🏫 ทุกโรงเรียน
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id} style={{ background: '#374151', color: 'white' }}>
                    {school.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Filter */}
            <div style={{ position: 'relative' }}>
              <Filter size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="all" style={{ background: '#374151', color: 'white' }}>
                  📚 ข้อสอบทั้งหมด
                </option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id} style={{ background: '#374151', color: 'white' }}>
                    {quiz.emoji} {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div style={{ position: 'relative' }}>
              <Calendar size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <option value="all" style={{ background: '#374151', color: 'white' }}>
                  📅 ทุกช่วงเวลา
                </option>
                <option value="today" style={{ background: '#374151', color: 'white' }}>
                  📆 วันนี้
                </option>
                <option value="week" style={{ background: '#374151', color: 'white' }}>
                  📅 7 วันที่ผ่านมา
                </option>
                <option value="month" style={{ background: '#374151', color: 'white' }}>
                  📅 30 วันที่ผ่านมา
                </option>
                <option value="custom" style={{ background: '#374151', color: 'white' }}>
                  📅 กำหนดเอง
                </option>
              </select>
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
                  วันที่เริ่มต้น
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
                  วันที่สิ้นสุด
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
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>นักเรียนทั้งหมด</div>
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
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนสูงสุด</div>
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
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>คะแนนเฉลี่ย</div>
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
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>การทำข้อสอบทั้งหมด</div>
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
            📋 รายการคะแนน ({filteredAttempts.length} รายการ)
          </h2>

          {filteredAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                {searchTerm || selectedQuiz !== 'all' || selectedSchool !== 'all' || selectedDateRange !== 'all' ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลคะแนน'}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {searchTerm || selectedQuiz !== 'all' || selectedSchool !== 'all' || selectedDateRange !== 'all' ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' : 'รอนักเรียนทำข้อสอบก่อน'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {filteredAttempts.map((attempt, index) => (
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
                        {getGradeEmoji(attempt.percentage || 0)} {attempt.quizTitle}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {attempt.totalQuestions} คำถาม
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
                        {attempt.score}/{attempt.totalQuestions * 10} คะแนน
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
                        เวลาที่ใช้
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
                            setSelectedReview(attempt);
                            setShowAnswerReview(true);
                            audioService.buttonClick();
                          }}
                          style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                            color: '#a78bfa',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          📋 ดูรายละเอียด
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
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
          quiz={selectedReview.quiz} // อาจเป็น undefined สำหรับข้อมูลเก่า
          quizTitle={selectedReview.quizTitle}
          studentName={selectedReview.studentName}
          score={selectedReview.score}
          percentage={selectedReview.percentage}
          totalTime={selectedReview.totalTime}
          currentLanguage="th"
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminScores;