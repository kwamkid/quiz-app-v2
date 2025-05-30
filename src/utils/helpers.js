// src/utils/helpers.js - แก้ไขแล้ว
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const calculatePercentage = (
  score,
  totalQuestions,
  pointsPerQuestion = 10
) => {
  const maxScore = totalQuestions * pointsPerQuestion;
  return Math.round((score / maxScore) * 100);
};

export const getScoreMessage = (percentage) => {
  if (percentage >= 90) {
    return {
      message: "🏆 เยี่ยมมาก! คุณเก่งจริงๆ!",
      emoji: "🎉",
      color: "text-yellow-300",
    };
  }
  if (percentage >= 80) {
    return {
      message: "🌟 ดีมาก! เก่งแล้ว!",
      emoji: "⭐",
      color: "text-green-300",
    };
  }
  if (percentage >= 70) {
    return {
      message: "👍 ดีแล้ว! พอใจ!",
      emoji: "😊",
      color: "text-blue-300",
    };
  }
  if (percentage >= 60) {
    return {
      message: "💪 ไม่เป็นไร ลองใหม่นะ!",
      emoji: "🤗",
      color: "text-orange-300",
    };
  }
  return {
    message: "📚 อย่าท้อ! ฝึกเพิ่มเติมนะ",
    emoji: "💪",
    color: "text-red-300",
  };
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getTimerColor = (timeLeft, maxTime = 30) => {
  const percentage = (timeLeft / maxTime) * 100;
  if (percentage > 66) return "text-green-400";
  if (percentage > 33) return "text-yellow-400";
  return "text-red-400";
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "วันที่ไม่ทราบ";

  let date;
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    // Regular date
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ลบฟังก์ชันซ้ำออก และรวมเป็นฟังก์ชันเดียว
export const validateQuiz = (quiz) => {
  const errors = [];

  if (!quiz.title?.trim()) {
    errors.push("กรุณาใส่ชื่อข้อสอบ");
  }

  if (!quiz.emoji?.trim()) {
    errors.push("กรุณาเลือก Emoji");
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push("กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ");
  }

  quiz.questions?.forEach((question, index) => {
    if (!question.question?.trim()) {
      errors.push(`คำถามข้อ ${index + 1}: กรุณาใส่คำถาม`);
    }

    if (!question.options || question.options.length < 2) {
      errors.push(
        `คำถามข้อ ${index + 1}: กรุณาใส่ตัวเลือกอย่างน้อย 2 ตัวเลือก`
      );
    }

    if (question.correctAnswer === undefined || question.correctAnswer < 0) {
      errors.push(`คำถามข้อ ${index + 1}: กรุณาเลือกคำตอบที่ถูกต้อง`);
    }

    question.options?.forEach((option, optionIndex) => {
      if (!option?.trim()) {
        errors.push(
          `คำถามข้อ ${index + 1}, ตัวเลือก ${String.fromCharCode(
            65 + optionIndex
          )}: กรุณาใส่ข้อความ`
        );
      }
    });
  });

  return errors;
};

export const generateQuizId = () => {
  return "quiz_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return defaultValue;
  }
};

export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};
