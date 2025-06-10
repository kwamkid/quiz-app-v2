// src/components/admin/SchoolManager.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, School, Users, MapPin } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';
import { t } from '../../translations';

const SchoolManager = ({ onBack, currentLanguage = 'th' }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchool, setNewSchool] = useState({
    nameTh: '',
    nameEn: '',
    province: '',
    district: '',
    studentCount: 0
  });

  // รายชื่อจังหวัดในประเทศไทย (ตัวอย่าง)
  const provinces = [
    'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'สมุทรสงคราม',
    'นครปฐม', 'ราชบุรี', 'กาญจนบุรี', 'สุพรรณบุรี', 'เชียงใหม่', 'เชียงราย', 'ลำปาง',
    'ภูเก็ต', 'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'สงขลา', 'ขอนแก่น', 'อุดรธานี', 'นครราชสีมา'
  ].sort();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const schoolsData = await FirebaseService.getAllSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.nameTh.trim()) {
      await audioService.wrongAnswer();
      alert(t('pleaseEnterSchoolName', currentLanguage));
      return;
    }

    try {
      setLoading(true);
      await audioService.correctAnswer();
      
      const schoolData = {
        ...newSchool,
        id: newSchool.nameTh.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, ''),
        createdAt: new Date()
      };

      await FirebaseService.createSchool(schoolData);
      
      setShowAddForm(false);
      setNewSchool({
        nameTh: '',
        nameEn: '',
        province: '',
        district: '',
        studentCount: 0
      });
      
      await loadSchools();
      alert(t('saveSuccess', currentLanguage));
    } catch (error) {
      console.error('Error adding school:', error);
      alert(t('errorOccurred', currentLanguage));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool.nameTh.trim()) {
      await audioService.wrongAnswer();
      alert(t('pleaseEnterSchoolName', currentLanguage));
      return;
    }

    try {
      setLoading(true);
      await audioService.correctAnswer();
      
      await FirebaseService.updateSchool(editingSchool.id, {
        nameTh: editingSchool.nameTh,
        nameEn: editingSchool.nameEn,
        province: editingSchool.province,
        district: editingSchool.district,
        studentCount: editingSchool.studentCount
      });
      
      setEditingSchool(null);
      await loadSchools();
      alert(t('saveSuccess', currentLanguage));
    } catch (error) {
      console.error('Error updating school:', error);
      alert(t('errorOccurred', currentLanguage));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (school) => {
    const confirmMsg = t('confirmDelete', currentLanguage, { item: school.nameTh });
    const confirmed = confirm(`🗑️ ${confirmMsg}`);
    
    if (confirmed) {
      try {
        setLoading(true);
        await audioService.wrongAnswer();
        await FirebaseService.deleteSchool(school.id);
        await loadSchools();
        alert(t('deleteSuccess', currentLanguage));
      } catch (error) {
        console.error('Error deleting school:', error);
        alert(t('errorOccurred', currentLanguage));
      } finally {
        setLoading(false);
      }
    }
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
      background: 'linear-gradient(135deg, #1f2937 0%, #4c1d95 50%, #7c2d12 100%)',
      paddingTop: '60px', // เพิ่มที่ว่างสำหรับ GlobalHeader
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
    }}>
      <div style={{
        padding: '20px',
        maxWidth: '1200px',
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
                <span style={{ fontSize: '3rem' }}>🏫</span>
                {t('schoolManagement', currentLanguage)}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.2rem'
              }}>
                {t('manageSchoolsDesc', currentLanguage)}
              </p>
            </div>
            
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
                gap: '8px'
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
              {t('back', currentLanguage)}
            </button>
          </div>
          
          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => {
                audioService.buttonClick();
                setShowAddForm(true);
              }}
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
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Plus size={20} />
              ✨ {t('addSchool', currentLanguage)}
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
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
              ➕ {t('addSchool', currentLanguage)}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Thai Name */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('schoolNameTh', currentLanguage)} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newSchool.nameTh}
                  onChange={(e) => setNewSchool({...newSchool, nameTh: e.target.value})}
                  placeholder="เช่น โรงเรียนสุขศึกษา"
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

              {/* English Name */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('schoolNameEn', currentLanguage)}
                </label>
                <input
                  type="text"
                  value={newSchool.nameEn}
                  onChange={(e) => setNewSchool({...newSchool, nameEn: e.target.value})}
                  placeholder="e.g. Suksuksa School"
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

              {/* Province */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('province', currentLanguage)}
                </label>
                <select
                  value={newSchool.province}
                  onChange={(e) => setNewSchool({...newSchool, province: e.target.value})}
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
                  <option value="" style={{ background: '#374151', color: 'white' }}>
                    -- {t('selectProvince', currentLanguage)} --
                  </option>
                  {provinces.map((province) => (
                    <option key={province} value={province} style={{ background: '#374151', color: 'white' }}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('district', currentLanguage)}
                </label>
                <input
                  type="text"
                  value={newSchool.district}
                  onChange={(e) => setNewSchool({...newSchool, district: e.target.value})}
                  placeholder="เช่น เมือง"
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

              {/* Student Count */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  {t('studentCount', currentLanguage)}
                </label>
                <input
                  type="number"
                  value={newSchool.studentCount}
                  onChange={(e) => setNewSchool({...newSchool, studentCount: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  min="0"
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
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddSchool}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                {t('save', currentLanguage)}
              </button>
              
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSchool({
                    nameTh: '',
                    nameEn: '',
                    province: '',
                    district: '',
                    studentCount: 0
                  });
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {t('cancel', currentLanguage)}
              </button>
            </div>
          </div>
        )}

        {/* Schools List */}
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {schools.map((school) => (
            <div 
              key={school.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {editingSchool?.id === school.id ? (
                // Edit Mode
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <input
                      type="text"
                      value={editingSchool.nameTh}
                      onChange={(e) => setEditingSchool({...editingSchool, nameTh: e.target.value})}
                      placeholder={t('schoolNameTh', currentLanguage)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    
                    <input
                      type="text"
                      value={editingSchool.nameEn}
                      onChange={(e) => setEditingSchool({...editingSchool, nameEn: e.target.value})}
                      placeholder={t('schoolNameEn', currentLanguage)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />

                    <select
                      value={editingSchool.province}
                      onChange={(e) => setEditingSchool({...editingSchool, province: e.target.value})}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{ background: '#374151' }}>
                        -- {t('selectProvince', currentLanguage)} --
                      </option>
                      {provinces.map((province) => (
                        <option key={province} value={province} style={{ background: '#374151' }}>
                          {province}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={editingSchool.district}
                      onChange={(e) => setEditingSchool({...editingSchool, district: e.target.value})}
                      placeholder={t('district', currentLanguage)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />

                    <input
                      type="number"
                      value={editingSchool.studentCount}
                      onChange={(e) => setEditingSchool({...editingSchool, studentCount: parseInt(e.target.value) || 0})}
                      placeholder={t('studentCount', currentLanguage)}
                      min="0"
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleUpdateSchool}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Save size={14} />
                      {t('save', currentLanguage)}
                    </button>
                    
                    <button
                      onClick={() => setEditingSchool(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('cancel', currentLanguage)}
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flex: 1
                  }}>
                    <div style={{ 
                      fontSize: '3rem',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))',
                      padding: '16px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '80px',
                      minHeight: '80px'
                    }}>
                      🏫
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '8px'
                      }}>
                        {currentLanguage === 'th' 
                          ? school.nameTh 
                          : (school.nameEn || school.nameTh)}
                      </h3>
                      {school.nameEn && currentLanguage === 'th' && (
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.9rem',
                          marginBottom: '8px'
                        }}>
                          {school.nameEn}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap'
                      }}>
                        {(school.province || school.district) && (
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.9rem'
                          }}>
                            <MapPin size={14} />
                            {[school.district, school.province].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem'
                        }}>
                          <Users size={14} />
                          {school.studentCount || 0} {t('students', currentLanguage)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => {
                        audioService.buttonClick();
                        setEditingSchool(school);
                      }}
                      style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        color: '#fbbf24',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(251, 191, 36, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                      }}
                    >
                      <Edit size={14} />
                      {t('edit', currentLanguage)}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSchool(school)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                      }}
                    >
                      <Trash2 size={14} />
                      {t('delete', currentLanguage)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {schools.length === 0 && !showAddForm && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🏫</div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              {t('noSchoolsYet', currentLanguage)}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              {t('startAddingSchool', currentLanguage)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolManager;