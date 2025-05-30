// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase Configuration - ใส่ config ของคุณตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyBl0DIY-zL87ML70QQahY9vre9dniL5G2g",
  authDomain: "quizwhiz-225ab.firebaseapp.com",
  projectId: "quizwhiz-225ab",
  storageBucket: "quizwhiz-225ab.firebasestorage.app",
  messagingSenderId: "401259195294",
  appId: "1:401259195294:web:f874034945cd0fd8bdc48f",
  measurementId: "G-BV2Y0P6GRP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Firebase Service Class
export class FirebaseService {
  // Authentication
  static async signInAnonymously() {
    try {
      console.log("🔐 Attempting anonymous sign-in...");
      const result = await signInAnonymously(auth);
      console.log("✅ Anonymous sign-in successful, UID:", result.user.uid);
      return result.user;
    } catch (error) {
      console.error("❌ Error signing in anonymously:", error);
      // Fallback for demo
      return { uid: "demo-user-" + Date.now() };
    }
  }

  // Get all quizzes
  static async getQuizzes() {
    try {
      console.log("📚 Loading quizzes from Firebase...");
      const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const quizzes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("📊 Loaded quizzes:", quizzes.length, "items");

      // ถ้าไม่มีข้อสอบใน Firebase ให้ใช้ Demo data
      if (quizzes.length === 0) {
        console.log("⚠️ No quizzes in Firebase, using demo data");
        return this.getDemoQuizzes();
      }

      return quizzes;
    } catch (error) {
      console.error("❌ Error getting quizzes:", error);
      console.log("🔄 Falling back to demo data");
      return this.getDemoQuizzes();
    }
  }

  // Demo data for testing
  static getDemoQuizzes() {
    return [
      {
        id: "1",
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
          {
            question: "7 × 8 = ?",
            options: ["54", "56", "58", "60"],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "15 - 6 = ?",
            options: ["8", "9", "10", "11"],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "100 ÷ 5 = ?",
            options: ["15", "20", "25", "30"],
            correctAnswer: 1,
            points: 10,
          },
        ],
        createdAt: { seconds: Date.now() / 1000 },
      },
      {
        id: "2",
        title: "🌟 วิทยาศาสตร์",
        emoji: "🔬",
        difficulty: "ปานกลาง",
        questions: [
          {
            question: "โลกมีดวงจันทร์กี่ดวง?",
            options: ["1 ดวง", "2 ดวง", "3 ดวง", "4 ดวง"],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: "น้ำเดือดที่กี่องศาเซลเซียส?",
            options: ["90°C", "100°C", "110°C", "120°C"],
            correctAnswer: 1,
            points: 10,
          },
          {
            question: "แสงอาทิตย์เดินทางมาถึงโลกใช้เวลากี่นาที?",
            options: ["6 นาที", "8 นาที", "10 นาที", "12 นาที"],
            correctAnswer: 1,
            points: 10,
          },
        ],
        createdAt: { seconds: Date.now() / 1000 },
      },
      {
        id: "3",
        title: "🇬🇧 ภาษาอังกฤษ",
        emoji: "🇬🇧",
        difficulty: "ยาก",
        questions: [
          {
            question: "What is the capital of Thailand?",
            options: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
            correctAnswer: 0,
            points: 10,
          },
          {
            question: 'How do you say "สวัสดี" in English?',
            options: ["Goodbye", "Hello", "Thank you", "Sorry"],
            correctAnswer: 1,
            points: 10,
          },
        ],
        createdAt: { seconds: Date.now() / 1000 },
      },
    ];
  }

  // Create new quiz
  static async createQuiz(quizData) {
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Quiz created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  }

  // Update quiz
  static async updateQuiz(quizId, quizData) {
    try {
      const quizRef = doc(db, "quizzes", quizId);
      await updateDoc(quizRef, {
        ...quizData,
        updatedAt: new Date(),
      });
      console.log("✅ Quiz updated:", quizId);
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw error;
    }
  }

  // Delete quiz
  static async deleteQuiz(quizId) {
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
      console.log("✅ Quiz deleted:", quizId);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      throw error;
    }
  }

  // Save student attempt
  static async saveStudentAttempt(attemptData) {
    try {
      await addDoc(collection(db, "studentAttempts"), {
        ...attemptData,
        timestamp: new Date(),
      });
      console.log("✅ Student attempt saved");
    } catch (error) {
      console.error("Error saving student attempt:", error);
      // ไม่ throw error เพราะไม่อยากให้ขัดขวางการทำงาน
    }
  }

  // Get student attempts (for history)
  static async getStudentAttempts(studentName) {
    try {
      const q = query(
        collection(db, "studentAttempts"),
        where("studentName", "==", studentName),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting student attempts:", error);
      return [];
    }
  }

  // Get all student attempts (for admin)
  static async getAllStudentAttempts() {
    try {
      const q = query(
        collection(db, "studentAttempts"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting all student attempts:", error);
      return [];
    }
  }
}

export default FirebaseService;
