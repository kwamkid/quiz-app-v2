// src/translations/index.js

const translations = {
  th: {
    // Common
    back: "กลับ",
    save: "บันทึก",
    cancel: "ยกเลิก",
    delete: "ลบ",
    edit: "แก้ไข",
    loading: "กำลังโหลด...",
    confirm: "ยืนยัน",
    search: "ค้นหา",
    filter: "กรอง",
    all: "ทั้งหมด",

    // Categories
    allCategories: "ทุกวิชา",
    math: "คณิตศาสตร์",
    science: "วิทยาศาสตร์",
    thai: "ภาษาไทย",
    english: "ภาษาอังกฤษ",
    art: "ศิลปะ",
    music: "ดนตรี",
    pe: "พลศึกษา",
    other: "อื่นๆ",

    // Navigation
    studentRole: "ฉันเป็นนักเรียน",
    teacherRole: "ฉันเป็นครู",
    logout: "ออกจากระบบ",

    // Student
    hello: "สวัสดี",
    selectCategory: "เลือกหมวดหมู่วิชา",
    selectQuiz: "เลือกข้อสอบ",
    startQuiz: "เริ่มทำข้อสอบ",
    viewHistory: "ดูประวัติคะแนน",
    question: "คำถาม",
    correctAnswer: "คำตอบที่ถูกต้อง",
    score: "คะแนน",
    percentage: "เปอร์เซ็นต์",
    time: "เวลา",
    congratulations: "ยินดีด้วย!",
    quizCompleted: "ทำข้อสอบเสร็จแล้ว",
    yourScore: "คะแนนของคุณ",

    // Teacher/Admin
    adminDashboard: "แดชบอร์ดครู",
    createQuiz: "สร้างข้อสอบใหม่",
    editQuiz: "แก้ไขข้อสอบ",
    deleteQuiz: "ลบข้อสอบ",
    viewScores: "ดูคะแนนนักเรียน",
    manageCategories: "จัดการหมวดหมู่",
    quizTitle: "ชื่อข้อสอบ",
    quizTitleTh: "ชื่อข้อสอบ (ภาษาไทย)",
    quizTitleEn: "ชื่อข้อสอบ (ภาษาอังกฤษ)",
    difficulty: "ระดับความยาก",
    category: "หมวดหมู่",
    addQuestion: "เพิ่มคำถาม",
    questionText: "คำถาม",
    questionTextTh: "คำถาม (ภาษาไทย)",
    questionTextEn: "คำถาม (ภาษาอังกฤษ)",
    options: "ตัวเลือก",
    points: "คะแนน",

    // School
    selectSchool: "เลือกโรงเรียน",
    selectYourSchool: "เลือกโรงเรียนของคุณ",
    searchSchool: "ค้นหาชื่อโรงเรียน",
    schoolManagement: "จัดการโรงเรียน",
    addSchool: "เพิ่มโรงเรียน",
    schoolName: "ชื่อโรงเรียน",
    schoolNameTh: "ชื่อโรงเรียน (ภาษาไทย)",
    schoolNameEn: "ชื่อโรงเรียน (ภาษาอังกฤษ)",
    province: "จังหวัด",
    district: "อำเภอ",
    studentCount: "จำนวนนักเรียน",
    students: "นักเรียน",
    allProvinces: "ทุกจังหวัด",
    selectProvince: "เลือกจังหวัด",
    noSchoolFound: "ไม่พบโรงเรียนที่ค้นหา",
    tryDifferentSearch: "ลองค้นหาด้วยคำอื่น",
    selectThisSchool: "เลือกโรงเรียนนี้",
    manageSchoolsDesc: "จัดการข้อมูลโรงเรียนทั้งหมดในระบบ",

    // Import/Export
    importFromExcel: "นำเข้าจาก Excel",
    exportToExcel: "ส่งออกเป็น Excel",
    downloadTemplate: "ดาวน์โหลดเทมเพลต",

    // Messages
    saveSuccess: "บันทึกสำเร็จ",
    deleteSuccess: "ลบสำเร็จ",
    errorOccurred: "เกิดข้อผิดพลาด",
    pleaseEnterQuizName: "กรุณาใส่ชื่อข้อสอบ",
    pleaseEnterQuestion: "กรุณาใส่คำถาม",
    pleaseEnter2Options: "กรุณาใส่ตัวเลือกอย่างน้อย 2 ตัวเลือก",
    pleaseAddQuestion: "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ",
    confirmDelete: "คุณแน่ใจหรือไม่ที่จะลบ {{item}}?",
    saving: "กำลังบันทึก...",
    createQuizSuccess: "สร้างข้อสอบสำเร็จ",
    pleaseEnterSchoolName: "กรุณาใส่ชื่อโรงเรียน",
    noSchoolsYet: "ยังไม่มีโรงเรียนในระบบ",
    startAddingSchool: "เริ่มเพิ่มโรงเรียนแรกของคุณ!",
  },

  en: {
    // Common
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    confirm: "Confirm",
    search: "Search",
    filter: "Filter",
    all: "All",

    // Categories
    allCategories: "All Subjects",
    math: "Mathematics",
    science: "Science",
    thai: "Thai Language",
    english: "English",
    art: "Art",
    music: "Music",
    pe: "Physical Education",
    other: "Others",

    // Navigation
    studentRole: "I'm a Student",
    teacherRole: "I'm a Teacher",
    logout: "Logout",

    // Student
    hello: "Hello",
    selectCategory: "Select Subject Category",
    selectQuiz: "Select Quiz",
    startQuiz: "Start Quiz",
    viewHistory: "View Score History",
    question: "Question",
    correctAnswer: "Correct Answer",
    score: "Score",
    percentage: "Percentage",
    time: "Time",
    congratulations: "Congratulations!",
    quizCompleted: "Quiz Completed",
    yourScore: "Your Score",

    // Teacher/Admin
    adminDashboard: "Teacher Dashboard",
    createQuiz: "Create New Quiz",
    editQuiz: "Edit Quiz",
    deleteQuiz: "Delete Quiz",
    viewScores: "View Student Scores",
    manageCategories: "Manage Categories",
    quizTitle: "Quiz Title",
    quizTitleTh: "Quiz Title (Thai)",
    quizTitleEn: "Quiz Title (English)",
    difficulty: "Difficulty",
    category: "Category",
    addQuestion: "Add Question",
    questionText: "Question",
    questionTextTh: "Question (Thai)",
    questionTextEn: "Question (English)",
    options: "Options",
    points: "Points",

    // School
    selectSchool: "Select School",
    selectYourSchool: "Select Your School",
    searchSchool: "Search school name",
    schoolManagement: "School Management",
    addSchool: "Add School",
    schoolName: "School Name",
    schoolNameTh: "School Name (Thai)",
    schoolNameEn: "School Name (English)",
    province: "Province",
    district: "District",
    studentCount: "Student Count",
    students: "students",
    allProvinces: "All Provinces",
    selectProvince: "Select Province",
    noSchoolFound: "No schools found",
    tryDifferentSearch: "Try different search terms",
    selectThisSchool: "Select This School",
    manageSchoolsDesc: "Manage all schools in the system",

    // Import/Export
    importFromExcel: "Import from Excel",
    exportToExcel: "Export to Excel",
    downloadTemplate: "Download Template",

    // Messages
    saveSuccess: "Saved successfully",
    deleteSuccess: "Deleted successfully",
    errorOccurred: "An error occurred",
    pleaseEnterQuizName: "Please enter quiz name",
    pleaseEnterQuestion: "Please enter question",
    pleaseEnter2Options: "Please enter at least 2 options",
    pleaseAddQuestion: "Please add at least 1 question",
    confirmDelete: "Are you sure you want to delete {{item}}?",
    saving: "Saving...",
    createQuizSuccess: "Quiz created successfully",
    pleaseEnterSchoolName: "Please enter school name",
    noSchoolsYet: "No schools in the system yet",
    startAddingSchool: "Start adding your first school!",
  },
};

// Translation function
export const t = (key, language = "th", params = {}) => {
  const translation =
    translations[language]?.[key] || translations["th"][key] || key;

  // Replace parameters like {{item}}
  return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] || match;
  });
};

// Get localized field from object
export const getLocalizedField = (obj, fieldName, language = "th") => {
  if (!obj) return "";

  // Try language-specific field first
  const langField = `${fieldName}${language
    .charAt(0)
    .toUpperCase()}${language.slice(1)}`;
  if (obj[langField]) return obj[langField];

  // Fallback to default field
  return obj[fieldName] || "";
};

// Export translations object for direct access if needed
export { translations };
