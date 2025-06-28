// src/constants/index.js
export const VIEWS = {
  LANDING: "landing",
  STUDENT_LOGIN: "studentLogin",
  ADMIN_LOGIN: "adminLogin",
  QUIZ_LIST: "quizList",
  QUIZ_TAKING: "quizTaking",
  QUIZ_RESULT: "quizResult",
  QUIZ_HISTORY: "quizHistory",
  ADMIN_DASHBOARD: "adminDashboard",
  QUIZ_EDITOR: "quizEditor",
};

export const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
};

export const QUIZ_SETTINGS = {
  TIME_PER_QUESTION: 30, // เก็บไว้เพื่อ backward compatibility
  MINUTES_PER_QUESTION: 2, // 1 นาทีต่อข้อ
  POINTS_PER_QUESTION: 10,
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
};

export const DIFFICULTY_LEVELS = {
  EASY: "ง่าย",
  MEDIUM: "ปานกลาง",
  HARD: "ยาก",
};

export const DIFFICULTY_COLORS = {
  ง่าย: "bg-green-100 text-green-700 border-green-200",
  ปานกลาง: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ยาก: "bg-red-100 text-red-700 border-red-200",
};

export const QUIZ_COLORS = [
  "from-blue-400 to-purple-500",
  "from-green-400 to-blue-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-orange-500",
  "from-pink-400 to-red-500",
  "from-indigo-400 to-blue-500",
];
