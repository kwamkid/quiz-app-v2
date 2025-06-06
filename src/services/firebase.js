// src/services/firebase.js - แก้ไขการบันทึกคะแนน
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is valid
const isFirebaseConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId;

console.log("🔥 Firebase Config Status:", {
  isValid: isFirebaseConfigValid,
  apiKey: firebaseConfig.apiKey ? "✅ Set" : "❌ Missing",
  authDomain: firebaseConfig.authDomain ? "✅ Set" : "❌ Missing",
  projectId: firebaseConfig.projectId ? "✅ Set" : "❌ Missing",
});

// Initialize Firebase only if config is valid
let app, db, auth;

if (isFirebaseConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase config invalid, running in mock mode");
}

// Environment check
const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";

console.log("🔥 Firebase initialized:", {
  environment: import.meta.env.VITE_NODE_ENV || "development",
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Mock data สำหรับ development
const mockQuizzes = [
  {
    id: "mock-1",
    title: "🧮 คณิตศาสตร์ ป.6",
    emoji: "🧮",
    difficulty: "ง่าย",
    questions: [
      {
        question: "5 + 3 = ?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 2,
        points: 10,
      },
      {
        question: "12 ÷ 4 = ?",
        options: ["2", "3", "4", "6"],
        correctAnswer: 1,
        points: 10,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class FirebaseService {
  // ✅ Get all quizzes
  // ✅ Get all quizzes
  static async getQuizzes(categoryId = null) {
    // If Firebase not configured, return mock data
    if (!isFirebaseConfigValid || !db) {
      console.log("📝 Using mock data - Firebase not configured");
      return mockQuizzes;
    }

    try {
      console.log("🔍 Getting quizzes from Firestore...");

      let q;
      if (categoryId && categoryId !== "all") {
        // Get quizzes by category
        q = query(
          collection(db, "quizzes"),
          where("categoryId", "==", categoryId)
        );
      } else {
        // Get all quizzes
        q = collection(db, "quizzes");
      }

      const querySnapshot = await getDocs(q);
      const quizzes = [];

      querySnapshot.forEach((doc) => {
        quizzes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(
        `✅ Quizzes loaded from Firestore: ${quizzes.length} ${
          categoryId ? `(category: ${categoryId})` : "(all)"
        }`
      );

      if (quizzes.length === 0 && categoryId) {
        console.log("📝 No quizzes found for category, returning empty array");
        return [];
      }

      return quizzes;
    } catch (error) {
      console.error("❌ Error getting quizzes:", error);
      console.log("🔄 Fallback to mock data");
      return mockQuizzes;
    }
  }

  // ✅ Get categories
  static async getCategories() {
    try {
      console.log("🔍 Getting categories...");

      // Get all quizzes to count per category
      const quizSnapshot = await getDocs(collection(db, "quizzes"));
      const categoryCounts = {};
      let totalQuizzes = 0;

      quizSnapshot.forEach((doc) => {
        const quiz = doc.data();
        const categoryId = quiz.categoryId || "uncategorized";
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        totalQuizzes++;
      });

      // Return predefined categories with counts
      const categories = [
        {
          id: "math",
          name: "🧮 คณิตศาสตร์",
          emoji: "🧮",
          description: "บวก ลบ คูณ หาร และอื่นๆ",
          color: "from-purple-400 to-pink-400",
          iconType: "math",
          quizCount: categoryCounts["math"] || 0,
        },
        {
          id: "science",
          name: "🔬 วิทยาศาสตร์",
          emoji: "🔬",
          description: "สำรวจโลกและธรรมชาติ",
          color: "from-green-400 to-blue-400",
          iconType: "science",
          quizCount: categoryCounts["science"] || 0,
        },
        {
          id: "thai",
          name: "📚 ภาษาไทย",
          emoji: "📚",
          description: "อ่าน เขียน และไวยากรณ์",
          color: "from-orange-400 to-red-400",
          iconType: "thai",
          quizCount: categoryCounts["thai"] || 0,
        },
        {
          id: "english",
          name: "🇬🇧 ภาษาอังกฤษ",
          emoji: "🇬🇧",
          description: "English vocabulary and grammar",
          color: "from-blue-400 to-cyan-400",
          iconType: "english",
          quizCount: categoryCounts["english"] || 0,
        },
        {
          id: "all",
          name: "📖 ทุกวิชา",
          emoji: "📖",
          description: "ดูข้อสอบทั้งหมด",
          color: "from-gray-400 to-gray-500",
          iconType: "default",
          quizCount: totalQuizzes,
        },
      ];

      return categories;
    } catch (error) {
      console.error("❌ Error getting categories:", error);
      // Return default categories
      return [
        {
          id: "all",
          name: "📖 ทุกวิชา",
          emoji: "📖",
          description: "ดูข้อสอบทั้งหมด",
          color: "from-gray-400 to-gray-500",
          iconType: "default",
          quizCount: 0,
        },
      ];
    }
  }

  // ✅ Get single quiz
  static async getQuiz(quizId) {
    try {
      console.log("🔍 Getting quiz:", quizId);

      const docRef = doc(db, "quizzes", quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("❌ Quiz not found:", quizId);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting quiz:", error);
      return null;
    }
  }

  // ✅ Create new quiz
  static async createQuiz(quizData) {
    try {
      console.log("➕ Creating quiz:", quizData.title);

      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Quiz created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error creating quiz:", error);
      throw error;
    }
  }

  // ✅ Update quiz
  static async updateQuiz(quizId, quizData) {
    try {
      console.log("📝 Updating quiz:", quizId);

      const docRef = doc(db, "quizzes", quizId);
      await updateDoc(docRef, {
        ...quizData,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Quiz updated successfully");
      return true;
    } catch (error) {
      console.error("❌ Error updating quiz:", error);
      throw error;
    }
  }

  // ✅ Delete quiz
  static async deleteQuiz(quizId) {
    try {
      console.log("🗑️ Deleting quiz:", quizId);

      await deleteDoc(doc(db, "quizzes", quizId));

      console.log("✅ Quiz deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error deleting quiz:", error);
      throw error;
    }
  }

  // 🔥 แก้ไขหลัก: บันทึกผลคะแนนของนักเรียน
  static async saveStudentAttempt(attemptData) {
    // If Firebase not configured, just log and return success
    if (!isFirebaseConfigValid || !db) {
      console.log("💾 Mock save student attempt:", attemptData);
      console.log("⚠️ Firebase not configured - data not actually saved");
      return "mock-id-" + Date.now();
    }

    try {
      console.log("💾 Saving student attempt:", attemptData);

      const docRef = await addDoc(collection(db, "quiz_results"), {
        studentName: attemptData.studentName,
        quizTitle: attemptData.quizTitle,
        quizId: attemptData.quizId,
        score: attemptData.score,
        totalQuestions: attemptData.totalQuestions,
        totalTime: attemptData.totalTime,
        percentage: attemptData.percentage,
        timestamp: serverTimestamp(),
        completedAt: new Date(),
        selectedQuestionCount:
          attemptData.selectedQuestionCount || attemptData.totalQuestions,
        originalTotalQuestions:
          attemptData.originalTotalQuestions || attemptData.totalQuestions,
        answers: attemptData.answers || [],
      });

      console.log("✅ Student attempt saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving student attempt:", error);
      console.error("Attempt data:", attemptData);

      // Return a mock ID so the app continues to work
      console.log("🔄 Returning mock ID for app continuity");
      return "error-mock-id-" + Date.now();
    }
  }

  // 🔥 แก้ไขหลัก: ดึงผลคะแนนของนักเรียน
  static async getStudentAttempts(studentName) {
    try {
      console.log("📊 Getting attempts for student:", studentName);

      const q = query(
        collection(db, "quiz_results"),
        where("studentName", "==", studentName),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const attempts = [];

      querySnapshot.forEach((doc) => {
        attempts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Student attempts loaded:", attempts.length);
      return attempts;
    } catch (error) {
      console.error("❌ Error getting student attempts:", error);

      // ถ้า error เรื่อง index ให้ลองไม่ใช้ orderBy
      try {
        console.log("🔄 Trying without orderBy...");
        const q = query(
          collection(db, "quiz_results"),
          where("studentName", "==", studentName)
        );

        const querySnapshot = await getDocs(q);
        const attempts = [];

        querySnapshot.forEach((doc) => {
          attempts.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // เรียงลำดับใน client
        attempts.sort((a, b) => {
          const timeA = a.timestamp?.toDate() || new Date(0);
          const timeB = b.timestamp?.toDate() || new Date(0);
          return timeB - timeA;
        });

        console.log(
          "✅ Student attempts loaded (no orderBy):",
          attempts.length
        );
        return attempts;
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        return [];
      }
    }
  }

  // 🔥 แก้ไขหลัก: ดึงผลคะแนนทั้งหมด (สำหรับครู)
  static async getAllStudentAttempts() {
    try {
      console.log("📊 Getting all student attempts...");

      const querySnapshot = await getDocs(collection(db, "quiz_results"));
      const attempts = [];

      querySnapshot.forEach((doc) => {
        attempts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // เรียงลำดับใน client
      attempts.sort((a, b) => {
        const timeA = a.timestamp?.toDate() || new Date(0);
        const timeB = b.timestamp?.toDate() || new Date(0);
        return timeB - timeA;
      });

      console.log("✅ All student attempts loaded:", attempts.length);
      return attempts;
    } catch (error) {
      console.error("❌ Error getting all student attempts:", error);
      return [];
    }
  }

  // เก็บไว้เพื่อ backward compatibility
  static async saveQuizResult(resultData) {
    console.log(
      "⚠️ saveQuizResult is deprecated, use saveStudentAttempt instead"
    );
    return this.saveStudentAttempt(resultData);
  }

  static async getStudentResults(studentName) {
    console.log(
      "⚠️ getStudentResults is deprecated, use getStudentAttempts instead"
    );
    return this.getStudentAttempts(studentName);
  }
}

export default FirebaseService;
export { auth, db };
