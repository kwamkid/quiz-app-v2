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

  // Check if screen is desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      const categoryToUpdate = {
        name: editingCategory.name,
        emoji: editingCategory.emoji,
        description: editingCategory.description,
        color: editingCategory.color,
        iconType: editingCategory.iconType || 'default'
      };
      
      console.log('📝 Updating category:', editingCategory.id, categoryToUpdate);
      
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

  const containerPadding = isDesktop ? '20px' : '16px';
  const maxContainerWidth = '1400px';
  const headerPadding = isDesktop ? '32px' : '20px';
  const cardPadding = isDesktop ? '24px' : '16px';

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
        padding: containerPadding,
        maxWidth: maxContainerWidth,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: isDesktop ? '24px' : '20px',
          padding: headerPadding,
          marginBottom: isDesktop ? '32px' : '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isDesktop ? 'center' : 'flex-start',
            flexWrap: 'wrap',
            gap: isDesktop ? '20px' : '16px'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: isDesktop ? '2.5rem' : 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: isDesktop ? '16px' : '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: isDesktop ? '3rem' : '2rem' }}>📂</span>
                <span>จัดการหมวดหมู่วิชา</span>
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isDesktop ? '1.2rem' : '1rem'
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
                padding: isDesktop ? '12px 20px' : '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isDesktop ? '1rem' : '0.9rem',
                whiteSpace: 'nowrap'
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
                padding: isDesktop ? '16px 24px' : '14px 20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: isDesktop ? '12px' : '10px',
                fontSize: isDesktop ? '1.1rem' : '1rem',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                marginTop: isDesktop ? '24px' : '16px',
                width: isDesktop ? 'auto' : '100%',
                maxWidth: isDesktop ? 'none' : '300px',
                justifyContent: 'center'
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
            padding: cardPadding,
            marginBottom: isDesktop ? '24px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: isDesktop ? '1.5rem' : '1.3rem',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              ➕ เพิ่มหมวดหมู่ใหม่
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
              gap: isDesktop ? '20px' : '16px'
            }}>
              {/* Name */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isDesktop ? '1rem' : '0.9rem',
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

              {/* Color */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isDesktop ? '1rem' : '0.9rem',
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

              {/* Emoji */}
              <div>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isDesktop ? '1rem' : '0.9rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  อีโมจิ
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: isDesktop ? '10px' : '8px',
                  maxWidth: '280px'
                }}>
                  {emojiOptions.slice(0, 6).map((emoji) => (
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
                        padding: isDesktop ? '10px' : '8px',
                        fontSize: isDesktop ? '1.5rem' : '1.3rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        aspectRatio: '1'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isDesktop ? '1rem' : '0.9rem',
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

              {/* Additional emoji options for desktop */}
              {isDesktop && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: '10px',
                    marginTop: '-10px'
                  }}>
                    {emojiOptions.slice(6).map((emoji) => (
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
                          padding: '10px',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          aspectRatio: '1'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px',
              marginTop: '24px',
              flexWrap: 'wrap',
              justifyContent: isDesktop ? 'flex-start' : 'stretch'
            }}>
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
                  gap: '8px',
                  flex: isDesktop ? '0' : '1',
                  minWidth: isDesktop ? '140px' : '120px',
                  justifyContent: 'center'
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
                  cursor: 'pointer',
                  flex: isDesktop ? '0' : '1',
                  minWidth: isDesktop ? '140px' : '120px'
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
          gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(500px, 1fr))' : '1fr',
          gap: isDesktop ? '24px' : '16px'
        }}>
          {categories.map((category) => (
            <div 
              key={category.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: cardPadding,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {editingCategory?.id === category.id ? (
                // Edit Mode
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
                    gap: isDesktop ? '16px' : '12px',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      placeholder="ชื่อหมวดหมู่"
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        width: '100%'
                      }}
                    />
                    
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
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value} style={{ background: '#374151' }}>
                          {color.display}
                        </option>
                      ))}
                    </select>

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
                        cursor: 'pointer',
                        width: '100%',
                        gridColumn: isDesktop ? 'auto' : '1 / -1'
                      }}
                    >
                      {emojiOptions.map((emoji) => (
                        <option key={emoji} value={emoji} style={{ background: '#374151' }}>
                          {emoji}
                        </option>
                      ))}
                    </select>

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
                        gridColumn: '1 / -1'
                      }}
                    />
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
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
                        gap: '6px',
                        flex: '1',
                        minWidth: '100px',
                        justifyContent: 'center'
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
                        cursor: 'pointer',
                        flex: '1',
                        minWidth: '100px'
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isDesktop ? '20px' : '16px',
                    marginBottom: isDesktop ? '16px' : '12px'
                  }}>
                    <div style={{ 
                      fontSize: isDesktop ? '3rem' : '2.5rem',
                      background: `linear-gradient(135deg, ${category.color})`,
                      padding: isDesktop ? '16px' : '12px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isDesktop ? '80px' : '60px',
                      minHeight: isDesktop ? '80px' : '60px',
                      flexShrink: 0
                    }}>
                      {category.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: isDesktop ? '1.5rem' : '1.3rem',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: isDesktop ? 'normal' : 'nowrap'
                      }}>{category.name}</h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '4px',
                        fontSize: isDesktop ? '1rem' : '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: isDesktop ? 'normal' : 'nowrap'
                      }}>
                        {category.description}
                      </p>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: isDesktop ? '0.9rem' : '0.85rem'
                      }}>
                        📚 {category.quizCount || 0} ข้อสอบ
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: isDesktop ? '12px' : '8px',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap'
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
                        padding: isDesktop ? '10px 18px' : '8px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: isDesktop ? '1rem' : '0.9rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                      }}
                    >
                      <Edit size={isDesktop ? 16 : 14} />
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
                        padding: isDesktop ? '10px 18px' : '8px 14px',
                        borderRadius: '10px',
                        cursor: category.quizCount > 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: isDesktop ? '1rem' : '0.9rem',
                        fontWeight: '500',
                        opacity: category.quizCount > 0 ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (category.quizCount === 0) {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (category.quizCount === 0) {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }
                      }}
                    >
                      <Trash2 size={isDesktop ? 16 : 14} />
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
            padding: isDesktop ? '60px 20px' : '40px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: isDesktop ? '5rem' : '3rem', marginBottom: '20px' }}>📂</div>
            <h3 style={{
              fontSize: isDesktop ? '2rem' : '1.5rem',
              color: 'white',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              ยังไม่มีหมวดหมู่
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: isDesktop ? '1.2rem' : '1rem'
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