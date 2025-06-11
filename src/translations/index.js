// src/translations/index.js - Student translations only

const translations = {
  th: {
    // Common
    back: "กลับ",
    loading: "กำลังโหลด...",
    exit: "ออก",

    // Landing Page
    welcomeTitle: "Quiz Quest",
    welcomeSubtitle: "เกมทำข้อสอบสุดมันส์!",
    iAmStudent: "ฉันเป็นนักเรียน",
    iAmTeacher: "ฉันเป็นครู",

    // Student Login
    welcome: "ยินดีต้อนรับ!",
    enterNickname: "บอกชื่อเล่นของคุณหน่อยสิ",
    yourNickname: "ชื่อเล่นของคุณ",
    letsStart: "เริ่มเลย!",
    backToHome: "กลับหน้าหลัก",

    // Category Selection
    selectCategory: "เลือกหมวดหมู่วิชา",
    hello: "สวัสดี",
    selectSubjectMessage: "เลือกวิชาที่ต้องการทำข้อสอบ",
    allSubjects: "ทุกวิชา",
    viewAllQuizzes: "ดูข้อสอบทั้งหมด",
    noQuizAvailable: "ยังไม่มีข้อสอบให้ทำ",
    waitForTeacher: "รอครูสร้างข้อสอบก่อนนะ!",
    quizCount: "ข้อสอบ",

    // Quiz List
    selectQuiz: "เลือกข้อสอบที่ต้องการทำ",
    myScoreHistory: "ดูคะแนนของฉัน",
    questions: "คำถาม",
    canSelect: "เลือกได้",
    selectQuestionCount: "เลือกจำนวนข้อ",
    noQuestions: "ยังไม่มีคำถาม",
    backToCategories: "หมวดหมู่",

    // Quiz Selection Modal
    selectQuestionCountTitle: "เลือกจำนวนข้อที่ต้องการทำ",
    questionCountNote: "จำนวนข้อสอบ",
    allQuestions: "ทั้งหมด",
    tip: "เคล็ดลับ",
    questionsWillBeRandomized:
      "คำถามจะถูกสุ่มใหม่ทุกครั้ง แต่ละข้อได้ 10 คะแนน",
    noteQuizHasOnly: "หมายเหตุ: ข้อสอบนี้มี",
    questionsOnly: "ข้อ จึงต้องทำทั้งหมด",
    cancel: "ยกเลิก",
    startQuiz: "เริ่มทำข้อสอบ",
    fullScore: "คะแนนเต็ม",
    timeEstimate: "เวลาทำ",
    seconds: "วินาที",
    randomFrom: "สุ่มจาก",

    // Quiz Taking
    question: "ข้อ",
    score: "คะแนน",
    submit: "ตอบ!",
    correct: "ถูกต้อง!",
    incorrect: "ผิด! คำตอบคือ",
    next: "ข้อถัดไป",
    finish: "เสร็จสิ้น!",
    exitQuizConfirm:
      "คุณแน่ใจหรือไม่ว่าต้องการออกจากข้อสอบ? ผลคะแนนจะไม่ถูกบันทึก",

    // Quiz Result
    completed: "เสร็จแล้ว!",
    excellent: "เยี่ยมมาก! คุณเก่งจริงๆ!",
    veryGood: "ดีมาก! เก่งแล้ว!",
    good: "ดีแล้ว! พอใจ!",
    keepTrying: "ไม่เป็นไร ลองใหม่นะ!",
    moreStudy: "อย่าท้อ! ฝึกเพิ่มเติมนะ",
    scoreObtained: "คะแนนที่ได้",
    totalQuestions: "จำนวนข้อ",
    timeUsed: "เวลาที่ใช้",
    by: "โดย",
    savingScore: "กำลังบันทึกผลคะแนน...",
    scoreSaved: "บันทึกผลคะแนนเรียบร้อย",
    viewAllScores: "ดูประวัติคะแนนทั้งหมด",

    // Score History
    scoreHistory: "ประวัติคะแนน",
    viewProgressHistory: "ดูผลงานและความก้าวหน้าของคุณ",
    noHistoryYet: "ยังไม่มีประวัติการทำข้อสอบ",
    tryQuizFirst: "ลองทำข้อสอบสักข้อแล้วกลับมาดูกันนะ!",
    quizzesDone: "ข้อสอบที่ทำ",
    averageScore: "คะแนนเฉลี่ย",
    bestScore: "คะแนนที่ดีที่สุด",
    streakCount: "ครั้งที่ผ่านติดต่อกัน",
    allQuizHistory: "ประวัติการทำข้อสอบทั้งหมด",

    // Direct Quiz Access
    quizNotFound: "ไม่พบข้อสอบ",
    errorLoadingQuiz: "เกิดข้อผิดพลาดในการโหลดข้อสอบ",
    noQuestionsAlert: "ข้อสอบนี้ยังไม่มีคำถาม กรุณาติดต่อครูเพื่อเพิ่มคำถาม",
    difficulty: "ระดับ",
    quizHasMany:
      "ข้อสอบนี้มี {count} ข้อ คุณสามารถเลือกจำนวนข้อที่ต้องการทำได้",
    selectAndStart: "เลือกจำนวนข้อและเริ่ม",
    goToQuizList: "ไปหน้าเลือกข้อสอบอื่น",

    // Difficulty
    easy: "ง่าย",
    medium: "ปานกลาง",
    hard: "ยาก",
  },

  en: {
    // Common
    back: "Back",
    loading: "Loading...",
    exit: "Exit",

    // Landing Page
    welcomeTitle: "Quiz Quest",
    welcomeSubtitle: "The Ultimate Quiz Game!",
    iAmStudent: "I'm a Student",
    iAmTeacher: "I'm a Teacher",

    // Student Login
    welcome: "Welcome!",
    enterNickname: "Please tell us your nickname",
    yourNickname: "Your nickname",
    letsStart: "Let's Start!",
    backToHome: "Back to Home",

    // Category Selection
    selectCategory: "Select Subject Category",
    hello: "Hello",
    selectSubjectMessage: "Select the subject you want to take quiz",
    allSubjects: "All Subjects",
    viewAllQuizzes: "View all quizzes",
    noQuizAvailable: "No quiz available yet",
    waitForTeacher: "Wait for teacher to create quiz!",
    quizCount: "quizzes",

    // Quiz List
    selectQuiz: "Select the quiz you want to take",
    myScoreHistory: "View My Scores",
    questions: "questions",
    canSelect: "selectable",
    selectQuestionCount: "Select questions",
    noQuestions: "No questions yet",
    backToCategories: "Categories",

    // Quiz Selection Modal
    selectQuestionCountTitle: "Select number of questions",
    questionCountNote: "Question count",
    allQuestions: "All",
    tip: "Tip",
    questionsWillBeRandomized:
      "Questions will be randomized. Each question worth 10 points",
    noteQuizHasOnly: "Note: This quiz has",
    questionsOnly: "questions, so you must do all",
    cancel: "Cancel",
    startQuiz: "Start Quiz",
    fullScore: "Full Score",
    timeEstimate: "Time",
    seconds: "seconds",
    randomFrom: "Random from",

    // Quiz Taking
    question: "Question",
    score: "Score",
    submit: "Submit!",
    correct: "Correct!",
    incorrect: "Wrong! The answer is",
    next: "Next",
    finish: "Finish!",
    exitQuizConfirm:
      "Are you sure you want to exit? Your score will not be saved",

    // Quiz Result
    completed: "Completed!",
    excellent: "Excellent! You're amazing!",
    veryGood: "Very good! Well done!",
    good: "Good! Satisfied!",
    keepTrying: "It's okay, try again!",
    moreStudy: "Don't give up! Keep practicing!",
    scoreObtained: "Score",
    totalQuestions: "Questions",
    timeUsed: "Time Used",
    by: "by",
    savingScore: "Saving score...",
    scoreSaved: "Score saved successfully",
    viewAllScores: "View All Score History",

    // Score History
    scoreHistory: "Score History",
    viewProgressHistory: "View your achievements and progress",
    noHistoryYet: "No quiz history yet",
    tryQuizFirst: "Try taking a quiz first!",
    quizzesDone: "Quizzes Done",
    averageScore: "Average Score",
    bestScore: "Best Score",
    streakCount: "Pass Streak",
    allQuizHistory: "All Quiz History",

    // Direct Quiz Access
    quizNotFound: "Quiz not found",
    errorLoadingQuiz: "Error loading quiz",
    noQuestionsAlert:
      "This quiz has no questions yet. Please contact teacher to add questions",
    difficulty: "Difficulty",
    quizHasMany:
      "This quiz has {count} questions. You can select how many to take",
    selectAndStart: "Select amount and start",
    goToQuizList: "Go to other quizzes",

    // Difficulty
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  },
};

// Translation function
export const t = (key, language = "th") => {
  return translations[language]?.[key] || translations["th"][key] || key;
};

// Export translations object for direct access if needed
export { translations };
