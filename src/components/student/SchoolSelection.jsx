// src/components/student/SchoolSelection.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, School, Search, MapPin, Users } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import { t, getLocalizedField } from '../../translations';

const SchoolSelection = ({ studentName, currentLanguage = 'th', onSelectSchool, onBack }) => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [searchTerm, selectedProvince, schools, currentLanguage]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const schoolsData = await FirebaseService.getAllSchools();
      setSchools(schoolsData);
      setFilteredSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = [...schools];
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(school => {
        const schoolName = currentLanguage === 'th' 
          ? school.nameTh 
          : (school.nameEn || school.nameTh);
        return schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Filter by province
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(school => school.province === selectedProvince);
    }
    
    setFilteredSchools(filtered);
  };

  const getProvinces = () => {
    const provinces = [...new Set(schools.map(school => school.province).filter(Boolean))];
    return provinces.sort();
  };

  const handleSelectSchool = async (school) => {
    await audioService.buttonClick();
    onSelectSchool(school);
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  if (loading) {
    return <LoadingSpinner message={t('loading', currentLanguage)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      paddingTop: '60px', // เพิ่มที่ว่างสำหรับ GlobalHeader
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '3rem',
        opacity: '0.1',
        animation: 'pulse 3s infinite'
      }}>🏫</div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        fontSize: '2.5rem',
        opacity: '0.2',
        animation: 'bounce 4s infinite'
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
                }}>🏫</span>
                {t('selectSchool', currentLanguage)}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                {t('hello', currentLanguage)} {studentName}! {t('selectYourSchool', currentLanguage)} 🎯
              </p>
            </div>
            
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

          {/* Search and Filter */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                placeholder={`🔍 ${t('searchSchool', currentLanguage)}`}
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
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Province Filter */}
            <div style={{ position: 'relative' }}>
              <MapPin size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              >
                <option value="all" style={{ background: '#374151', color: 'white' }}>
                  📍 {t('allProvinces', currentLanguage)}
                </option>
                {getProvinces().map((province) => (
                  <option key={province} value={province} style={{ background: '#374151', color: 'white' }}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schools Grid */}
        {filteredSchools.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🏫</div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              {t('noSchoolFound', currentLanguage)}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              {t('tryDifferentSearch', currentLanguage)}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}>
            {filteredSchools.map((school, index) => (
              <div
                key={school.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                  animation: `slideUp 0.8s ease-out ${0.2 + index * 0.1}s both`
                }}
                onClick={() => handleSelectSchool(school)}
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
                  <School size={80} />
                </div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '16px',
                    animation: `bounce 3s infinite ${index * 0.5}s`
                  }}>
                    🏫
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '8px',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>
                    {currentLanguage === 'th' 
                      ? school.nameTh 
                      : (school.nameEn || school.nameTh)}
                  </h3>

                  {school.nameEn && currentLanguage === 'th' && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginBottom: '12px'
                    }}>
                      {school.nameEn}
                    </p>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '16px'
                  }}>
                    {(school.province || school.district) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.95rem'
                      }}>
                        <MapPin size={16} />
                        {[school.district, school.province].filter(Boolean).join(', ')}
                      </div>
                    )}
                    
                    {school.studentCount > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.95rem'
                      }}>
                        <Users size={16} />
                        {school.studentCount} {t('students', currentLanguage)}
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <div style={{
                    marginTop: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    ✅ {t('selectThisSchool', currentLanguage)}
                  </div>
                </div>
              </div>
            ))}
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

export default SchoolSelection;