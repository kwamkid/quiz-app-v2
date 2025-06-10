// src/translations/index.js
const translations = {
  th: {
    // Common
    back: "กลับ",
    save: "บันทึก",
    cancel: "ยกเลิก",
    delete: "ลบ",
    edit: "แก้ไข",
    create: "สร้าง",
    start: "เริ่ม",
    next: "ถัดไป",
    finish: "เสร็จสิ้น",
    logout: "ออกจากระบบ",
    loading: "กำลังโหลด...",

    // Landing Page
    appTitle: "Quiz Quest",
    appSubtitle: "เกมทำข้อสอบสุดมันส์!",
    iAmStudent: "ฉันเป็นนักเรียน",
    iAmTeacher: "ฉันเป็นครูคนดี",

    // Student Login
    welcome: "ยินดีต้อนรับ!",
    enterNickname: "บอกชื่อเล่นของคุณหน่อยสิ",
    nickname: "ชื่อเล่น",
    letsStart: "เริ่มเลย!",

    // School Selection
    selectSchool: "เลือกโรงเรียน",
    searchSchool: "ค้นหาโรงเรียน...",
    noSchoolFound: "ไม่พบโรงเรียน",
    allSchools: "ทุกโรงเรียน",

    // Category Selection
    selectCategory: "เลือกหมวดหมู่วิชา",
    allCategories: "ทุกวิชา",
    noQuizAvailable: "ยังไม่มีข้อสอบให้ทำ",
    waitForTeacher: "รอครูสร้างข้อสอบก่อนนะ!",

    // Quiz List
    hello: "สวัสดี",
    selectQuizToPlay: "เลือกข้อสอบที่ต้องการทำ",
    viewMyScores: "ดูคะแนนของฉัน",
    questions: "คำถาม",
    difficulty: "ความยาก",
    easy: "ง่าย",
    medium: "ปานกลาง",
    hard: "ยาก",

    // Quiz Taking
    question: "ข้อ",
    of: "จาก",
    score: "คะแนน",
    timeLeft: "เวลาเหลือ",
    answer: "ตอบ!",
    correct: "ถูกต้อง!",
    incorrect: "ผิด!",
    correctAnswerIs: "คำตอบที่ถูกคือ",
    points: "คะแนน",

    // Quiz Result
    completed: "เสร็จแล้ว!",
    yourScore: "คะแนนที่ได้",
    totalScore: "คะแนนเต็ม",
    percentage: "เปอร์เซ็นต์",
    timeUsed: "เวลาที่ใช้",
    backToHome: "กลับหน้าหลัก",
    viewHistory: "ดูประวัติคะแนน",

    // Score History
    scoreHistory: "ประวัติคะแนน",
    totalAttempts: "ครั้งที่ทำ",
    averageScore: "คะแนนเฉลี่ย",
    bestScore: "คะแนนสูงสุด",
    noHistory: "ยังไม่มีประวัติการทำข้อสอบ",

    // Admin Login
    adminLogin: "เข้าสู่ระบบครู",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    login: "เข้าสู่ระบบ",
    invalidCredentials: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",

    // Admin Dashboard
    teacherDashboard: "แดชบอร์ดครู",
    manageQuizzes: "จัดการข้อสอบและติดตามความก้าวหน้า",
    createNewQuiz: "สร้างข้อสอบใหม่",
    viewStudentScores: "ดูคะแนนนักเรียน",
    manageCategories: "จัดการหมวดหมู่",
    manageSchools: "จัดการโรงเรียน",
    totalQuizzes: "ข้อสอบทั้งหมด",
    totalQuestions: "คำถามทั้งหมด",
    totalAttempts: "การทำข้อสอบทั้งหมด",

    // School Management
    schoolManagement: "จัดการโรงเรียน",
    addSchool: "เพิ่มโรงเรียน",
    schoolName: "ชื่อโรงเรียน",
    schoolNameTh: "ชื่อโรงเรียน (ไทย)",
    schoolNameEn: "ชื่อโรงเรียน (อังกฤษ)",
    province: "จังหวัด",
    district: "อำเภอ/เขต",
    studentCount: "จำนวนนักเรียน",

    // Quiz Editor
    createQuiz: "สร้างข้อสอบใหม่",
    editQuiz: "แก้ไขข้อสอบ",
    quizTitle: "ชื่อข้อสอบ",
    quizTitleTh: "ชื่อข้อสอบ (ไทย)",
    quizTitleEn: "ชื่อข้อสอบ (อังกฤษ)",
    addQuestion: "เพิ่มคำถาม",
    questionText: "คำถาม",
    questionTextTh: "คำถาม (ไทย)",
    questionTextEn: "คำถาม (อังกฤษ)",
    option: "ตัวเลือก",
    optionTh: "ตัวเลือก (ไทย)",
    optionEn: "ตัวเลือก (อังกฤษ)",
    correctAnswer: "คำตอบที่ถูกต้อง",
    importFromExcel: "นำเข้าคำถามจาก Excel",

    // Messages
    confirmDelete: "คุณต้องการลบ {item} นี้หรือไม่?",
    saveSuccess: "บันทึกเรียบร้อยแล้ว",
    deleteSuccess: "ลบเรียบร้อยแล้ว",
    errorOccurred: "เกิดข้อผิดพลาด",
    pleaseSelectSchool: "กรุณาเลือกโรงเรียน",

    // Score Messages
    excellentScore: "เยี่ยมมาก! คุณเก่งจริงๆ!",
    veryGoodScore: "ดีมาก! เก่งแล้ว!",
    goodScore: "ดีแล้ว! พอใจ!",
    fairScore: "ไม่เป็นไร ลองใหม่นะ!",
    needImprovement: "อย่าท้อ! ฝึกเพิ่มเติมนะ",
  },

  en: {
    // Common
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    start: "Start",
    next: "Next",
    finish: "Finish",
    logout: "Logout",
    loading: "Loading...",

    // Landing Page
    appTitle: "Quiz Quest",
    appSubtitle: "Fun Quiz Game!",
    iAmStudent: "I'm a Student",
    iAmTeacher: "I'm a Teacher",

    // Student Login
    welcome: "Welcome!",
    enterNickname: "Please tell us your nickname",
    nickname: "Nickname",
    letsStart: "Let's Start!",

    // School Selection
    selectSchool: "Select School",
    searchSchool: "Search school...",
    noSchoolFound: "No school found",
    allSchools: "All Schools",

    // Category Selection
    selectCategory: "Select Subject Category",
    allCategories: "All Subjects",
    noQuizAvailable: "No quiz available",
    waitForTeacher: "Wait for teacher to create quiz!",

    // Quiz List
    hello: "Hello",
    selectQuizToPlay: "Select quiz to play",
    viewMyScores: "View My Scores",
    questions: "Questions",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",

    // Quiz Taking
    question: "Question",
    of: "of",
    score: "Score",
    timeLeft: "Time Left",
    answer: "Answer!",
    correct: "Correct!",
    incorrect: "Wrong!",
    correctAnswerIs: "The correct answer is",
    points: "points",

    // Quiz Result
    completed: "Completed!",
    yourScore: "Your Score",
    totalScore: "Total Score",
    percentage: "Percentage",
    timeUsed: "Time Used",
    backToHome: "Back to Home",
    viewHistory: "View Score History",

    // Score History
    scoreHistory: "Score History",
    totalAttempts: "Total Attempts",
    averageScore: "Average Score",
    bestScore: "Best Score",
    noHistory: "No quiz history yet",

    // Admin Login
    adminLogin: "Teacher Login",
    username: "Username",
    password: "Password",
    login: "Login",
    invalidCredentials: "Invalid username or password",

    // Admin Dashboard
    teacherDashboard: "Teacher Dashboard",
    manageQuizzes: "Manage quizzes and track progress",
    createNewQuiz: "Create New Quiz",
    viewStudentScores: "View Student Scores",
    manageCategories: "Manage Categories",
    manageSchools: "Manage Schools",
    totalQuizzes: "Total Quizzes",
    totalQuestions: "Total Questions",
    totalAttempts: "Total Attempts",

    // School Management
    schoolManagement: "School Management",
    addSchool: "Add School",
    schoolName: "School Name",
    schoolNameTh: "School Name (Thai)",
    schoolNameEn: "School Name (English)",
    province: "Province",
    district: "District",
    studentCount: "Student Count",

    // Quiz Editor
    createQuiz: "Create New Quiz",
    editQuiz: "Edit Quiz",
    quizTitle: "Quiz Title",
    quizTitleTh: "Quiz Title (Thai)",
    quizTitleEn: "Quiz Title (English)",
    addQuestion: "Add Question",
    questionText: "Question",
    questionTextTh: "Question (Thai)",
    questionTextEn: "Question (English)",
    option: "Option",
    optionTh: "Option (Thai)",
    optionEn: "Option (English)",
    correctAnswer: "Correct Answer",
    importFromExcel: "Import Questions from Excel",

    // Messages
    confirmDelete: "Are you sure you want to delete this {item}?",
    saveSuccess: "Saved successfully",
    deleteSuccess: "Deleted successfully",
    errorOccurred: "An error occurred",
    pleaseSelectSchool: "Please select a school",

    // Score Messages
    excellentScore: "Excellent! You are amazing!",
    veryGoodScore: "Very good! Well done!",
    goodScore: "Good! Satisfactory!",
    fairScore: "It's okay, try again!",
    needImprovement: "Don't give up! Keep practicing!",
  },
};

// Helper function to get translation
export const t = (key, lang = "th", params = {}) => {
  const keys = key.split(".");
  let value = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  if (!value) {
    // Fallback to Thai if English not available
    value = translations["th"];
    for (const k of keys) {
      value = value?.[k];
    }
  }

  if (!value) return key;

  // Replace parameters
  let result = value;
  Object.keys(params).forEach((param) => {
    result = result.replace(`{${param}}`, params[param]);
  });

  return result;
};

// Helper to get language-specific field
export const getLocalizedField = (obj, fieldName, lang = "th") => {
  if (!obj) return "";

  // Try to get language-specific field first
  const langField = `${fieldName}${
    lang.charAt(0).toUpperCase() + lang.slice(1)
  }`;
  if (obj[langField]) return obj[langField];

  // Fallback to default field
  if (obj[fieldName]) return obj[fieldName];

  // Fallback to Thai if English not available
  const thField = `${fieldName}Th`;
  if (obj[thField]) return obj[thField];

  return "";
};

export default translations;
