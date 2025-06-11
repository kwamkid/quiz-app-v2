// src/components/admin/SchoolManager.jsx - ปรับให้เรียบง่ายขึ้น
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, School, Search, Save, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';

const SchoolManager = ({ onBack }) => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nameTh: '',
    nameEn: '',
    province: ''
  });
  
  // State for transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [searchTerm, schools]);

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
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(school => {
        const searchLower = searchTerm.toLowerCase();
        return (
          school.nameTh?.toLowerCase().includes(searchLower) ||
          school.nameEn?.toLowerCase().includes(searchLower) ||
          school.province?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredSchools(filtered);
  };

  const handleBack = async () => {
    await audioService.navigation();
    onBack();
  };

  const handleAddSchool = async () => {
    await audioService.buttonClick();
    setEditingSchool(null);
    setFormData({
      nameTh: '',
      nameEn: '',
      province: ''
    });
    setShowForm(true);
  };

  const handleEditSchool = async (school) => {
    await audioService.buttonClick();
    setEditingSchool(school);
    setFormData({
      nameTh: school.nameTh || '',
      nameEn: school.nameEn || '',
      province: school.province || ''
    });
    setShowForm(true);
  };

  const handleDeleteSchool = async (school) => {
    await audioService.wrongAnswer();
    
    try {
      const hasStudents = await FirebaseService.checkSchoolHasStudents(school.id);
      
      if (hasStudents) {
        // ถ้ามีนักเรียน แสดง modal ให้เลือกโรงเรียนที่จะย้ายไป
        const otherSchools = schools.filter(s => s.id !== school.id);
        
        if (otherSchools.length === 0) {
          alert('❌ ไม่สามารถลบโรงเรียนนี้ได้ เนื่องจากมีนักเรียนอยู่และไม่มีโรงเรียนอื่นให้ย้าย');
          return;
        }
        
        setSchoolToDelete(school);
        setTargetSchoolId('');
        setShowTransferModal(true);
        
      } else {
        // ถ้าไม่มีนักเรียน ลบได้เลย
        const confirmed = confirm(`คุณต้องการลบ "${school.nameTh}" ใช่หรือไม่?`);
        
        if (confirmed) {
          setLoading(true);
          await FirebaseService.deleteSchool(school.id);
          await audioService.correctAnswer();
          alert('✅ ลบเรียบร้อยแล้ว');
          await loadSchools();
        }
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferAndDelete = async () => {
    if (!targetSchoolId) {
      alert('กรุณาเลือกโรงเรียนที่ต้องการย้ายนักเรียนไป');
      return;
    }
    
    setTransferring(true);
    
    try {
      await FirebaseService.transferStudentsAndDeleteSchool(schoolToDelete.id, targetSchoolId);
      await audioService.correctAnswer();
      
      const targetSchool = schools.find(s => s.id === targetSchoolId);
      alert(`✅ ย้ายนักเรียนไปที่ ${targetSchool.nameTh} และลบโรงเรียนเรียบร้อยแล้ว`);
      
      setShowTransferModal(false);
      setSchoolToDelete(null);
      setTargetSchoolId('');
      await loadSchools();
      
    } catch (error) {
      console.error('Error transferring students:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    
    if (!formData.nameTh.trim()) {
      alert('กรุณาใส่ชื่อโรงเรียน (ภาษาไทย)');
      return;
    }
    
    try {
      setLoading(true);
      
      const schoolData = {
        nameTh: formData.nameTh.trim(),
        nameEn: formData.nameEn.trim() || null,
        province: formData.province.trim() || null
      };
      
      if (editingSchool) {
        await FirebaseService.updateSchool(editingSchool.id, schoolData);
      } else {
        await FirebaseService.createSchool(schoolData);
      }
      
      await audioService.correctAnswer();
      alert('✅ บันทึกเรียบร้อยแล้ว');
      setShowForm(false);
      await loadSchools();
      
    } catch (error) {
      console.error('Error saving school:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = async () => {
    await audioService.navigation();
    setShowForm(false);
    setEditingSchool(null);
    setFormData({
      nameTh: '',
      nameEn: '',
      province: ''
    });
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลด..." />;
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
      <div style={{
        padding: '20px',
        maxWidth: '1200px',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                <School size={40} />
                จัดการโรงเรียน
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem'
              }}>
                เพิ่ม แก้ไข หรือลบข้อมูลโรงเรียน
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
              <ArrowLeft size={16} />
              กลับ
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleAddSchool}
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
              gap: '8px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            <Plus size={20} />
            เพิ่มโรงเรียน
          </button>

          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '300px'
          }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="text"
              placeholder="ค้นหาโรงเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: 'white',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Schools List */}
        {filteredSchools.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <School size={80} style={{ color: 'rgba(255, 255, 255, 0.5)', margin: '0 auto 24px' }} />
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px'
            }}>
              {searchTerm ? 'ไม่พบโรงเรียนที่ค้นหา' : 'ยังไม่มีข้อมูลโรงเรียน'}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มเพิ่มโรงเรียนแรก!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '8px'
                    }}>
                      {school.nameTh}
                    </h3>
                    {school.nameEn && (
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        marginBottom: '8px'
                      }}>
                        {school.nameEn}
                      </p>
                    )}
                    {school.province && (
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem'
                      }}>
                        📍 {school.province}
                      </p>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => handleEditSchool(school)}
                      style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        color: '#fbbf24',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                      }}
                    >
                      <Edit size={16} />
                      แก้ไข
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSchool(school)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      }}
                    >
                      <Trash2 size={16} />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <School size={28} />
                {editingSchool ? 'แก้ไขโรงเรียน' : 'เพิ่มโรงเรียนใหม่'}
              </h2>

              <form onSubmit={handleSaveSchool}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    ชื่อโรงเรียน (ภาษาไทย) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameTh}
                    onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                    placeholder="เช่น โรงเรียนวัดดอนเมือง"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    ชื่อโรงเรียน (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="เช่น Wat Don Mueang School"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="เช่น กรุงเทพมหานคร"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px'
                }}>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 'bold'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <X size={20} />
                    ยกเลิก
                  </button>
                  
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: 'white',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <Save size={20} />
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                ⚠️ ย้ายนักเรียนก่อนลบโรงเรียน
              </h2>

              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  โรงเรียน <strong>"{schoolToDelete?.nameTh}"</strong> มีนักเรียนลงทะเบียนอยู่ 
                  กรุณาเลือกโรงเรียนที่ต้องการย้ายนักเรียนไป
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  เลือกโรงเรียนปลายทาง
                </label>
                <select
                  value={targetSchoolId}
                  onChange={(e) => setTargetSchoolId(e.target.value)}
                  disabled={transferring}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#374151', color: 'white' }}>
                    -- เลือกโรงเรียน --
                  </option>
                  {schools.filter(s => s.id !== schoolToDelete?.id).map(school => (
                    <option key={school.id} value={school.id} style={{ background: '#374151', color: 'white' }}>
                      {school.nameTh} {school.province ? `(${school.province})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setSchoolToDelete(null);
                    setTargetSchoolId('');
                  }}
                  disabled={transferring}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    cursor: transferring ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold',
                    opacity: transferring ? 0.5 : 1
                  }}
                >
                  ยกเลิก
                </button>
                
                <button
                  onClick={handleTransferAndDelete}
                  disabled={!targetSchoolId || transferring}
                  style={{
                    flex: 1,
                    background: !targetSchoolId || transferring
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    cursor: !targetSchoolId || transferring ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold',
                    opacity: !targetSchoolId || transferring ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {transferring ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      กำลังย้ายข้อมูล...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      ย้ายและลบ
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SchoolManager;