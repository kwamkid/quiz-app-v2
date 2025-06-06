// src/components/admin/CategoryManager.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Palette } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import audioService from '../../services/simpleAudio';
import FirebaseService from '../../services/firebase';

const CategoryManager = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '📚',
    description: '',
    color: 'from-gray-400 to-gray-500'
  });

  const emojiOptions = ['📚', '🧮', '🔬', '🌍', '🎨', '🎵', '⚽', '💻', '🧪', '📖', '🎯', '🌟'];
  
  const colorOptions = [
    { value: 'from-purple-400 to-pink-400', display: 'บทเรียนเด่น' },
    { value: 'from-green-400 to-blue-400', display: 'ธรรมชาติ' },
    { value: 'from-orange-400 to-red-400', display: 'พลังงาน' },
    { value: 'from-blue-400 to-cyan-400', display: 'ท้องฟ้า' },
    { value: 'from-yellow-400 to-orange-400', display: 'แสงแดด' },
    { value: 'from-pink-400 to-purple-400', display: 'หวานแหวว' },
    { value: 'from-green-400 to-emerald-400', display: 'ใบไม้' },
    { value: 'from-amber-400 to-orange-400', display: 'ทองคำ' },
    { value: 'from-indigo-400 to-purple-400', display: 'กลางคืน' },
    { value: 'from-gray-400 to-gray-500', display: 'คลาสสิค' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await FirebaseService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      await audioService.wrongAnswer();
      alert('กรุณาใส่ชื่อหมวดหมู่');
      return;
    }

    try {
      setLoading(true);
      await audioService.correctAnswer();
      
      const categoryData = {
        ...newCategory,
        id: newCategory.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        iconType: 'default'
      };

      await FirebaseService.createCategory(categoryData);
      
      setShowAddForm(false);
      setNewCategory({
        name: '',
        emoji: '📚',
        description: '',
        color: 'from-gray-400 to-gray-500'
      });
      
      await loadCategories();
      alert('✅ เพิ่มหมวดหมู่เรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('❌ เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory.name.trim()) {
      await audioService.wrongAnswer();
      alert('กรุณาใส่ชื่อหมวดหมู่');
      return;
    }

    try {
      setLoading(true);
      await audioService.correctAnswer();
      
      // ถ้าเป็น default category ให้บันทึกด้วย ID เดิม
      const categoryToUpdate = {
        id: editingCategory.id,
        name: editingCategory.name,
        emoji: editingCategory.emoji,
        description: editingCategory.description,
        color: editingCategory.color,
        iconType: editingCategory.iconType || 'default'
      };
      
      await FirebaseService.updateCategory(editingCategory.id, categoryToUpdate);
      
      setEditingCategory(null);
      await loadCategories();
      alert('✅ แก้ไขหมวดหมู่เรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating category:', error);
      alert(`❌ เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่\n\n${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    // ตรวจสอบว่ามีข้อสอบในหมวดนี้หรือไม่
    if (category.quizCount > 0) {
      alert(`❌ ไม่สามารถลบหมวดหมู่ได้\nเนื่องจากมีข้อสอบ ${category.quizCount} ชุดในหมวดนี้`);
      return;
    }

    const confirmed = confirm(`🗑️ คุณต้องการลบหมวดหมู่ "${category.name}" จริงหรือไม่?`);
    
    if (confirmed) {
      try {
        setLoading(true);
        await audioService.wrongAnswer();
        await FirebaseService.deleteCategory(category.id);
        await loadCategories();
        alert('✅ ลบหมวดหมู่เรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('❌ เกิดข้อผิดพลาดในการลบหมวดหมู่');
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
    return <LoadingSpinner message="กำลังโหลดหมวดหมู่..." />;
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
                <span style={{ fontSize: '3rem' }}>📂</span>
                จัดการหมวดหมู่วิชา
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.2rem'
              }}>
                เพิ่ม แก้ไข หรือลบหมวดหมู่วิชา
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
              กลับ
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
              ✨ เพิ่มหมวดหมู่ใหม่
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
              ➕ เพิ่มหมวดหมู่ใหม่
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Name */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  ชื่อหมวดหมู่ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="เช่น สังคมศึกษา"
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

              {/* Emoji */}
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
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px'
                }}>
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, emoji})}
                      style={{
                        background: newCategory.emoji === emoji 
                          ? 'rgba(139, 92, 246, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        border: newCategory.emoji === emoji 
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

              {/* Color */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  สีธีม
                </label>
                <select
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
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
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value} style={{ background: '#374151', color: 'white' }}>
                      {color.display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ gridColumn: 'span 3' }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  คำอธิบาย
                </label>
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="เช่น ประวัติศาสตร์ ภูมิศาสตร์ และสังคม"
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
                onClick={handleAddCategory}
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
                บันทึก
              </button>
              
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory({
                    name: '',
                    emoji: '📚',
                    description: '',
                    color: 'from-gray-400 to-gray-500'
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
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {categories.map((category) => (
            <div 
              key={category.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {editingCategory?.id === category.id ? (
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
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
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
                      value={editingCategory.emoji}
                      onChange={(e) => setEditingCategory({...editingCategory, emoji: e.target.value})}
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
                      {emojiOptions.map((emoji) => (
                        <option key={emoji} value={emoji} style={{ background: '#374151' }}>
                          {emoji}
                        </option>
                      ))}
                    </select>

                    <select
                      value={editingCategory.color}
                      onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
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
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value} style={{ background: '#374151' }}>
                          {color.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                    placeholder="คำอธิบาย"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      marginBottom: '16px'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleUpdateCategory}
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
                      บันทึก
                    </button>
                    
                    <button
                      onClick={() => setEditingCategory(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        cursor: 'pointer'
                      }}
                    >
                      ยกเลิก
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
                      background: `linear-gradient(135deg, ${category.color})`,
                      padding: '16px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '80px',
                      minHeight: '80px'
                    }}>
                      {category.emoji}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '8px'
                      }}>{category.name}</h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '4px'
                      }}>
                        {category.description}
                      </p>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem'
                      }}>
                        📚 {category.quizCount || 0} ข้อสอบ
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => {
                        audioService.buttonClick();
                        setEditingCategory(category);
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
                      แก้ไข
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      disabled={category.quizCount > 0}
                      style={{
                        background: category.quizCount > 0 
                          ? 'rgba(107, 114, 128, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        border: category.quizCount > 0
                          ? '1px solid rgba(107, 114, 128, 0.3)'
                          : '1px solid rgba(239, 68, 68, 0.3)',
                        color: category.quizCount > 0 ? '#6b7280' : '#ef4444',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        cursor: category.quizCount > 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        opacity: category.quizCount > 0 ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (category.quizCount === 0) {
                          e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (category.quizCount === 0) {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                        }
                      }}
                    >
                      <Trash2 size={14} />
                      ลบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && !showAddForm && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📂</div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              ยังไม่มีหมวดหมู่
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.2rem'
            }}>
              เริ่มสร้างหมวดหมู่แรกกันเลย!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;