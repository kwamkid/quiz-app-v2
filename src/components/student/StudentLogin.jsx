// src/components/student/StudentLogin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, School, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import { saveToLocalStorage } from '../../utils/helpers';
import { t } from '../../translations';

const StudentLogin = ({ currentLanguage = 'th' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  
  // States for dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadSchools();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter schools based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school => {
        const searchLower = searchTerm.toLowerCase();
        return (
          school.nameTh?.toLowerCase().includes(searchLower) ||
          school.nameEn?.toLowerCase().includes(searchLower) ||
          school.province?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredSchools(filtered);
    }
  }, [searchTerm, schools]);

  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      const schoolsData = await FirebaseService.getAllSchools();
      setSchools(schoolsData);
      setFilteredSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
      // ถ้าโหลดไม่ได้ ใช้ default schools
      const defaultSchools = [
        { id: 'codelab-rama2', nameTh: 'CodeLab พระราม 2', nameEn: 'CodeLab Rama 2', province: 'กรุงเทพมหานคร' },
        { id: 'codelab-muangthong', nameTh: 'CodeLab เมืองทอง', nameEn: 'CodeLab Muang Thong', province: 'นนทบุรี' },
        { id: 'dbs', nameTh: 'โรงเรียนนานาชาติ DBS', nameEn: 'DBS International School', province: 'กรุงเทพมหานคร' },
        { id: 'shrewsbury', nameTh: 'โรงเรียนนานาชาติชรูสเบอรี', nameEn: 'Shrewsbury International School', province: 'กรุงเทพมหานคร' }
      ];
      setSchools(defaultSchools);
      setFilteredSchools(defaultSchools);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSelectSchool = (school) => {
    audioService.buttonClick();
    setSelectedSchool(school);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      await audioService.wrongAnswer();
      alert(currentLanguage === 'th' ? 'กรุณาใส่ชื่อเล่น' : 'Please enter your nickname');
      return;
    }

    if (!selectedSchool) {
      await audioService.wrongAnswer();
      alert(currentLanguage === 'th' ? 'กรุณาเลือกโรงเรียน' : 'Please select your school');
      return;
    }

    setIsLoading(true);
    
    try {
      await audioService.achievement();
      
      // Save name and school to localStorage
      saveToLocalStorage('studentName', name.trim());
      saveToLocalStorage('studentSchool', selectedSchool);
      
      // Check if there's a quiz ID in the URL
      const urlParams = new URLSearchParams(location.search);
      const quizId = urlParams.get('quiz');
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        if (quizId) {
          navigate(`/quiz/direct/${quizId}`);
        } else {
          navigate('/student/categories');
        }
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error during submission:', error);
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await audioService.navigation();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '4rem',
        opacity: '0.1',
        animation: 'bounce 3s infinite'
      }}>🌟</div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        fontSize: '3rem',
        opacity: '0.2',
        animation: 'pulse 2s infinite'
      }}>🎯</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        fontSize: '5rem',
        opacity: '0.15',
        animation: 'bounce 4s infinite 1s'
      }}>🚀</div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '32px',
          padding: '48px',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.8s ease-out'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              position: 'relative',
              marginBottom: '24px',
              display: 'inline-block'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                boxShadow: '0 15px 30px rgba(251, 191, 36, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}>
                <User size={32} color="white" />
              </div>
              
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '1.5rem',
                animation: 'spin 3s linear infinite'
              }}>⭐</div>
            </div>
            
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}>
              🎉 {t('welcome', currentLanguage)}
            </h2>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem'
            }}>
              {t('enterInfoToStart', currentLanguage)}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            {/* Name Input */}
            <div style={{
              position: 'relative',
              marginBottom: '24px'
            }}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '8px',
                display: 'block'
              }}>
                👤 {t('yourNickname', currentLanguage)}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`✨ ${t('enterYourNickname', currentLanguage)}`}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  paddingRight: '50px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <div style={{
                position: 'absolute',
                right: '16px',
                bottom: '14px',
                fontSize: '1.3rem',
                color: 'rgba(255, 255, 255, 0.5)',
                pointerEvents: 'none'
              }}>
                ✨
              </div>
            </div>

            {/* School Selection - Dropdown Style */}
            <div style={{
              marginBottom: '32px',
              position: 'relative'
            }} ref={dropdownRef}>
              <label style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <School size={20} />
                {t('selectYourSchool', currentLanguage)}
              </label>
              
              {loadingSchools ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {t('loadingSchools', currentLanguage)}...
                </div>
              ) : (
                <>
                  {/* Selected School Display / Search Input */}
                  <div style={{ position: 'relative' }}>
                    {selectedSchool ? (
                      // Show selected school
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(!showDropdown);
                          setSearchTerm('');
                        }}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: '2px solid rgba(255, 255, 255, 0.5)',
                          borderRadius: '16px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: 'white',
                          outline: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.3s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span style={{ fontSize: '1.2rem' }}>🏫</span>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {currentLanguage === 'th' ? selectedSchool.nameTh : (selectedSchool.nameEn || selectedSchool.nameTh)}
                            </div>
                            {selectedSchool.province && (
                              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                📍 {selectedSchool.province}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Check size={18} color="#10b981" />
                          <ChevronDown size={20} style={{
                            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.3s'
                          }} />
                        </div>
                      </button>
                    ) : (
                      // Show search input
                      <div style={{ position: 'relative' }}>
                        <Search size={20} style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }} />
                        <input
                          type="text"
                          placeholder={currentLanguage === 'th' ? "🔍 ค้นหาหรือเลือกโรงเรียน..." : "🔍 Search or select school..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setShowDropdown(true)}
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '16px 20px 16px 48px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: 'white',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(5px)',
                            fontFamily: 'inherit'
                          }}
                          onFocusCapture={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                            e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <ChevronDown size={20} style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: `translateY(-50%) ${showDropdown ? 'rotate(180deg)' : 'rotate(0)'}`,
                          color: 'rgba(255, 255, 255, 0.5)',
                          transition: 'transform 0.3s',
                          cursor: 'pointer'
                        }} onClick={() => setShowDropdown(!showDropdown)} />
                      </div>
                    )}
                  </div>

                  {/* Dropdown List */}
                  {showDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '8px',
                      background: 'rgba(30, 30, 30, 0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      maxHeight: '280px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                      animation: 'dropdownSlide 0.3s ease-out'
                    }}>
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school, index) => (
                          <div
                            key={school.id}
                            onClick={() => handleSelectSchool(school)}
                            style={{
                              padding: '16px 20px',
                              cursor: 'pointer',
                              borderBottom: index < filteredSchools.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>🏫</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                color: 'white', 
                                fontWeight: '500',
                                fontSize: '1rem'
                              }}>
                                {currentLanguage === 'th' ? school.nameTh : (school.nameEn || school.nameTh)}
                              </div>
                              {school.province && (
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.6)', 
                                  fontSize: '0.85rem',
                                  marginTop: '2px'
                                }}>
                                  📍 {school.province}
                                </div>
                              )}
                            </div>
                            {selectedSchool?.id === school.id && (
                              <Check size={18} color="#10b981" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          {currentLanguage === 'th' ? 'ไม่พบโรงเรียนที่ค้นหา' : 'No schools found'}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!name.trim() || !selectedSchool || isLoading}
              style={{
                width: '100%',
                background: name.trim() && selectedSchool && !isLoading
                  ? 'linear-gradient(135deg, #ec4899, #be185d)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: name.trim() && selectedSchool && !isLoading ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                borderRadius: '20px',
                padding: '20px 32px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: name.trim() && selectedSchool && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: name.trim() && selectedSchool && !isLoading 
                  ? '0 10px 25px rgba(236, 72, 153, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (name.trim() && selectedSchool && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(236, 72, 153, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (name.trim() && selectedSchool && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(236, 72, 153, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>{t('loading', currentLanguage)}...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>{t('letsStart', currentLanguage)}</span>
                </>
              )}
            </button>
          </form>
          
          {/* Back Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleBack}
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                padding: '8px 16px',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              {t('backToHome', currentLanguage)}
            </button>
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
        
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 15px 30px rgba(251, 191, 36, 0.3);
          }
          to {
            box-shadow: 0 15px 40px rgba(251, 191, 36, 0.6);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Custom scrollbar for dropdown */
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default StudentLogin;