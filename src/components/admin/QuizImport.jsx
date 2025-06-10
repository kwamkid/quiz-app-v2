// src/components/admin/QuizImport.jsx - รองรับ 2 ภาษา
import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Globe } from 'lucide-react';
import * as XLSX from 'xlsx';
import { t } from '../../translations';

const QuizImport = ({ isOpen, onClose, onImport, existingQuestions = [], supportBilingual = false, currentLanguage = 'th' }) => {
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Template สำหรับดาวน์โหลด
  const downloadTemplate = () => {
    let templateData;
    
    if (supportBilingual) {
      // Template 2 ภาษา
      templateData = [
        {
          'คำถาม (ไทย)': 'ตัวอย่างคำถาม: 2 + 2 = ?',
          'คำถาม (English)': 'Example: 2 + 2 = ?',
          'ตัวเลือก A (ไทย)': '3',
          'ตัวเลือก A (English)': '3',
          'ตัวเลือก B (ไทย)': '4',
          'ตัวเลือก B (English)': '4',
          'ตัวเลือก C (ไทย)': '5',
          'ตัวเลือก C (English)': '5',
          'ตัวเลือก D (ไทย)': '6',
          'ตัวเลือก D (English)': '6',
          'คำตอบที่ถูก': 'B',
          'คะแนน': 10
        },
        {
          'คำถาม (ไทย)': 'เมืองหลวงของไทยคือ?',
          'คำถาม (English)': 'What is the capital of Thailand?',
          'ตัวเลือก A (ไทย)': 'กรุงเทพฯ',
          'ตัวเลือก A (English)': 'Bangkok',
          'ตัวเลือก B (ไทย)': 'เชียงใหม่',
          'ตัวเลือก B (English)': 'Chiang Mai',
          'ตัวเลือก C (ไทย)': 'ภูเก็ต',
          'ตัวเลือก C (English)': 'Phuket',
          'ตัวเลือก D (ไทย)': 'พัทยา',
          'ตัวเลือก D (English)': 'Pattaya',
          'คำตอบที่ถูก': 'A',
          'คะแนน': 10
        }
      ];
    } else {
      // Template ภาษาเดียว
      templateData = [
        {
          'คำถาม': 'ตัวอย่างคำถาม: 2 + 2 = ?',
          'ตัวเลือก A': '3',
          'ตัวเลือก B': '4',
          'ตัวเลือก C': '5',
          'ตัวเลือก D': '6',
          'คำตอบที่ถูก': 'B',
          'คะแนน': 10
        },
        {
          'คำถาม': 'เมืองหลวงของไทยคือ?',
          'ตัวเลือก A': 'กรุงเทพฯ',
          'ตัวเลือก B': 'เชียงใหม่',
          'ตัวเลือก C': 'ภูเก็ต',
          'ตัวเลือก D': 'พัทยา',
          'คำตอบที่ถูก': 'A',
          'คะแนน': 10
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
    
    // ปรับขนาดคอลัมน์
    let colWidths;
    if (supportBilingual) {
      colWidths = [
        { wch: 40 }, // คำถาม (ไทย)
        { wch: 40 }, // คำถาม (English)
        { wch: 20 }, // ตัวเลือก A (ไทย)
        { wch: 20 }, // ตัวเลือก A (English)
        { wch: 20 }, // ตัวเลือก B (ไทย)
        { wch: 20 }, // ตัวเลือก B (English)
        { wch: 20 }, // ตัวเลือก C (ไทย)
        { wch: 20 }, // ตัวเลือก C (English)
        { wch: 20 }, // ตัวเลือก D (ไทย)
        { wch: 20 }, // ตัวเลือก D (English)
        { wch: 15 }, // คำตอบที่ถูก
        { wch: 10 }  // คะแนน
      ];
    } else {
      colWidths = [
        { wch: 50 }, // คำถาม
        { wch: 20 }, // ตัวเลือก A
        { wch: 20 }, // ตัวเลือก B
        { wch: 20 }, // ตัวเลือก C
        { wch: 20 }, // ตัวเลือก D
        { wch: 15 }, // คำตอบที่ถูก
        { wch: 10 }  // คะแนน
      ];
    }
    ws['!cols'] = colWidths;

    const filename = supportBilingual ? 'quiz-template-bilingual.xlsx' : 'quiz-template.xlsx';
    XLSX.writeFile(wb, filename);
  };

  // อ่านไฟล์ Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedQuestions = [];
      const validationErrors = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2; // Excel row (starts from 2 because of header)
        
        if (supportBilingual) {
          // ตรวจสอบข้อมูล 2 ภาษา
          if (!row['คำถาม (ไทย)'] && !row['คำถาม (English)']) {
            validationErrors.push(`แถว ${rowNum}: ต้องมีคำถามอย่างน้อยหนึ่งภาษา`);
            return;
          }

          if (!row['ตัวเลือก A (ไทย)'] && !row['ตัวเลือก A (English)']) {
            validationErrors.push(`แถว ${rowNum}: ต้องมีตัวเลือก A อย่างน้อยหนึ่งภาษา`);
            return;
          }

          if (!row['ตัวเลือก B (ไทย)'] && !row['ตัวเลือก B (English)']) {
            validationErrors.push(`แถว ${rowNum}: ต้องมีตัวเลือก B อย่างน้อยหนึ่งภาษา`);
            return;
          }

          if (!row['คำตอบที่ถูก']) {
            validationErrors.push(`แถว ${rowNum}: ไม่ได้ระบุคำตอบที่ถูกต้อง`);
            return;
          }

          // แปลงคำตอบที่ถูกต้อง
          const correctAnswerLetter = row['คำตอบที่ถูก'].toString().toUpperCase();
          let correctAnswer = -1;
          
          switch (correctAnswerLetter) {
            case 'A': correctAnswer = 0; break;
            case 'B': correctAnswer = 1; break;
            case 'C': correctAnswer = 2; break;
            case 'D': correctAnswer = 3; break;
            default:
              validationErrors.push(`แถว ${rowNum}: คำตอบที่ถูกต้องต้องเป็น A, B, C, หรือ D`);
              return;
          }

          // สร้างตัวเลือก
          const optionsTh = [
            row['ตัวเลือก A (ไทย)']?.toString() || '',
            row['ตัวเลือก B (ไทย)']?.toString() || '',
            row['ตัวเลือก C (ไทย)']?.toString() || '',
            row['ตัวเลือก D (ไทย)']?.toString() || ''
          ];

          const optionsEn = [
            row['ตัวเลือก A (English)']?.toString() || '',
            row['ตัวเลือก B (English)']?.toString() || '',
            row['ตัวเลือก C (English)']?.toString() || '',
            row['ตัวเลือก D (English)']?.toString() || ''
          ];

          const question = {
            question: row['คำถาม (ไทย)']?.toString() || row['คำถาม (English)']?.toString() || '',
            questionTh: row['คำถาม (ไทย)']?.toString() || '',
            questionEn: row['คำถาม (English)']?.toString() || '',
            options: optionsTh.some(opt => opt) ? optionsTh : optionsEn,
            optionsTh: optionsTh,
            optionsEn: optionsEn,
            correctAnswer: correctAnswer,
            points: parseInt(row['คะแนน']) || 10,
            imported: true,
            rowNumber: rowNum
          };

          processedQuestions.push(question);
          
        } else {
          // ตรวจสอบข้อมูลภาษาเดียว
          if (!row['คำถาม'] || !row['คำถาม'].toString().trim()) {
            validationErrors.push(`แถว ${rowNum}: ไม่มีคำถาม`);
            return;
          }

          if (!row['ตัวเลือก A'] || !row['ตัวเลือก B']) {
            validationErrors.push(`แถว ${rowNum}: ต้องมีตัวเลือก A และ B อย่างน้อย`);
            return;
          }

          if (!row['คำตอบที่ถูก']) {
            validationErrors.push(`แถว ${rowNum}: ไม่ได้ระบุคำตอบที่ถูกต้อง`);
            return;
          }

          // แปลงคำตอบที่ถูกต้อง
          const correctAnswerLetter = row['คำตอบที่ถูก'].toString().toUpperCase();
          let correctAnswer = -1;
          
          switch (correctAnswerLetter) {
            case 'A': correctAnswer = 0; break;
            case 'B': correctAnswer = 1; break;
            case 'C': correctAnswer = 2; break;
            case 'D': correctAnswer = 3; break;
            default:
              validationErrors.push(`แถว ${rowNum}: คำตอบที่ถูกต้องต้องเป็น A, B, C, หรือ D`);
              return;
          }

          // สร้างตัวเลือก
          const options = [
            row['ตัวเลือก A']?.toString() || '',
            row['ตัวเลือก B']?.toString() || '',
            row['ตัวเลือก C']?.toString() || '',
            row['ตัวเลือก D']?.toString() || ''
          ];

          // ตรวจสอบว่าคำตอบที่เลือกมีข้อความ
          if (!options[correctAnswer] || !options[correctAnswer].trim()) {
            validationErrors.push(`แถว ${rowNum}: คำตอบที่เลือก (${correctAnswerLetter}) ไม่มีข้อความ`);
            return;
          }

          const question = {
            question: row['คำถาม'].toString().trim(),
            questionTh: row['คำถาม'].toString().trim(),
            questionEn: '',
            options: options,
            optionsTh: options,
            optionsEn: ['', '', '', ''],
            correctAnswer: correctAnswer,
            points: parseInt(row['คะแนน']) || 10,
            imported: true,
            rowNumber: rowNum
          };

          processedQuestions.push(question);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setImportedQuestions(processedQuestions);
        setPreviewMode(true);
      }

    } catch (error) {
      setErrors(['ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์']);
      console.error('File read error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // นำเข้าคำถาม (append กับคำถามเดิม)
  const handleImport = () => {
    const allQuestions = [...existingQuestions, ...importedQuestions];
    onImport(allQuestions);
    handleClose();
  };

  const handleClose = () => {
    setImportedQuestions([]);
    setErrors([]);
    setPreviewMode(false);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'IBM Plex Sans Thai, Noto Sans Thai, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📊 {t('importFromExcel', currentLanguage)}
            {supportBilingual && (
              <span style={{
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Globe size={14} />
                2 ภาษา
              </span>
            )}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {!previewMode ? (
          <>
            {/* Download Template */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h3 style={{
                color: '#60a5fa',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileText size={20} />
                ขั้นตอนที่ 1: ดาวน์โหลด Template
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '16px'
              }}>
                ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบการจัดรูปแบบข้อมูล
                {supportBilingual && ' (รองรับ 2 ภาษา: ไทย และอังกฤษ)'}
              </p>
              <button
                onClick={downloadTemplate}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
              >
                <Download size={16} />
                ดาวน์โหลด Template {supportBilingual && '(2 ภาษา)'}
              </button>
            </div>

            {/* Upload File */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <h3 style={{
                color: '#4ade80',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={20} />
                ขั้นตอนที่ 2: อัพโหลดไฟล์
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '16px'
              }}>
                เลือกไฟล์ Excel (.xlsx) ที่มีคำถาม {existingQuestions.length > 0 && `(คำถามจะถูกเพิ่มต่อจากเดิม ${existingQuestions.length} ข้อ)`}
              </p>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Processing */}
            {isProcessing && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: 'white'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '4px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                กำลังประมวลผลไฟล์...
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <h3 style={{
                  color: '#f87171',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={20} />
                  พบข้อผิดพลาด
                </h3>
                <ul style={{
                  color: '#fca5a5',
                  paddingLeft: '20px'
                }}>
                  {errors.map((error, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* Preview Mode */
          <>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <h3 style={{
                color: '#4ade80',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={20} />
                ตรวจสอบคำถามที่นำเข้า
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '16px'
              }}>
                พบคำถาม {importedQuestions.length} ข้อ ที่พร้อมนำเข้า 
                {existingQuestions.length > 0 && ` (รวมกับเดิม ${existingQuestions.length} ข้อ = ${existingQuestions.length + importedQuestions.length} ข้อ)`}
              </p>
            </div>

            {/* Questions Preview */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '24px'
            }}>
              {importedQuestions.map((question, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}>
                    ข้อ {existingQuestions.length + index + 1}: 
                    {supportBilingual && (
                      <>
                        {question.questionTh && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            🇹🇭 {question.questionTh}
                          </span>
                        )}
                        {question.questionEn && (
                          <span style={{ display: 'block', marginTop: '4px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            🇬🇧 {question.questionEn}
                          </span>
                        )}
                      </>
                    )}
                    {!supportBilingual && question.question}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    {question.options.map((option, optIndex) => {
                      if (!option && !question.optionsEn[optIndex]) return null;
                      
                      return (
                        <div key={optIndex} style={{
                          padding: '8px 12px',
                          background: question.correctAnswer === optIndex 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: question.correctAnswer === optIndex ? '#4ade80' : 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.9rem',
                          border: question.correctAnswer === optIndex ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <strong>{String.fromCharCode(65 + optIndex)}.</strong>
                          {supportBilingual ? (
                            <>
                              {question.optionsTh[optIndex] && (
                                <div>🇹🇭 {question.optionsTh[optIndex]}</div>
                              )}
                              {question.optionsEn[optIndex] && (
                                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  🇬🇧 {question.optionsEn[optIndex]}
                                </div>
                              )}
                            </>
                          ) : (
                            <span> {option}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem'
                  }}>
                    คะแนน: {question.points} • คำตอบ: {String.fromCharCode(65 + question.correctAnswer)}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setPreviewMode(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                กลับไปแก้ไข
              </button>
              <button
                onClick={handleImport}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                นำเข้าคำถาม {importedQuestions.length} ข้อ
              </button>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizImport;