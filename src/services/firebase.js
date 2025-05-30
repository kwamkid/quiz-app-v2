// src/services/firebase.js - Production Ready
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Environment check
const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
const isProduction = import.meta.env.VITE_NODE_ENV === "production";

console.log("🔥 Firebase initialized:", {
  environment: import.meta.env.VITE_NODE_ENV || "development",
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Mock data สำหรับ development (ถ้าต้องการ)
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
  static async getQuizzes() {
    try {
      console.log("🔍 Getting quizzes from Firestore...");

      const querySnapshot = await getDocs(collection(db, "quizzes"));
      const quizzes = [];

      querySnapshot.forEach((doc) => {
        quizzes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Quizzes loaded from Firestore:", quizzes.length);

      // ถ้าไม่มีข้อมูลใน production และเป็น development ให้ใช้ mock
      if (quizzes.length === 0 && isDevelopment) {
        console.log(
          "📝 No quizzes found in Firestore, using mock data for development"
        );
        return mockQuizzes;
      }

      return quizzes;
    } catch (error) {
      console.error("❌ Error getting quizzes:", error);

      // ถ้า error ใน development ให้ใช้ mock data
      if (isDevelopment) {
        console.log("🔄 Fallback to mock data in development");
        return mockQuizzes;
      }

      // ใน production ให้ return empty array
      return [];
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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

  // ✅ Save quiz result
  static async saveQuizResult(resultData) {
    try {
      console.log("💾 Saving quiz result...");

      const docRef = await addDoc(collection(db, "quiz_results"), {
        ...resultData,
        timestamp: new Date(),
      });

      console.log("✅ Quiz result saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving quiz result:", error);
      throw error;
    }
  }

  // ✅ Get quiz results for student
  static async getStudentResults(studentName) {
    try {
      console.log("📊 Getting results for student:", studentName);

      const querySnapshot = await getDocs(collection(db, "quiz_results"));
      const results = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentName === studentName) {
          results.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // เรียงลำดับตามวันที่ล่าสุด
      results.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

      console.log("✅ Results loaded:", results.length);
      return results;
    } catch (error) {
      console.error("❌ Error getting student results:", error);
      return [];
    }
  }
}

export default FirebaseService;
export { auth, db };
