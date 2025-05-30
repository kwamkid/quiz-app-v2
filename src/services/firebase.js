// src/services/firebase.js - เพิ่ม Debug Trace เพื่อหาตัวการ
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

// Firebase Configuration
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
      return { uid: "demo-user-" + Date.now() };
    }
  }

  // Get all quizzes - เพิ่ม Debug Trace
  static async getQuizzes() {
    // 🔍 DEBUG: ดูว่าใครเรียกมา
    console.log("🚨 getQuizzes() CALLED!");
    console.log("📍 Call Stack:");
    console.trace("🔍 WHO IS CALLING getQuizzes?");

    // แสดง Error stack เพื่อดูชื่อไฟล์ที่เรียก
    const error = new Error("Debug trace");
    console.log("📂 Caller details:", error.stack);

    console.log("🚫 Firebase getQuizzes() DISABLED - returning mock data only");

    // Return mock data immediately
    return [
      {
        id: "firebase-disabled-1",
        title: "🧮 คณิตศาสตร์ ป.6 (Mock)",
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
        createdAt: { seconds: Date.now() / 1000 },
      },
    ];

    /* ORIGINAL CODE - DISABLED
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
    */
  }

  // Demo data for testing
  static getDemoQuizzes() {
    console.log("🚨 getDemoQuizzes() CALLED!");
    console.trace("🔍 WHO IS CALLING getDemoQuizzes?");

    return [
      {
        id: "demo-1",
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
        createdAt: { seconds: Date.now() / 1000 },
      },
    ];
  }

  // Create new quiz - ปิดการทำงาน
  static async createQuiz(quizData) {
    console.log("🚨 createQuiz() CALLED!");
    console.trace("🔍 WHO IS CALLING createQuiz?");
    console.log("🚫 Firebase createQuiz() DISABLED");
    return "mock-quiz-id-" + Date.now();
  }

  // Update quiz - ปิดการทำงาน
  static async updateQuiz(quizId, quizData) {
    console.log("🚨 updateQuiz() CALLED!");
    console.trace("🔍 WHO IS CALLING updateQuiz?");
    console.log("🚫 Firebase updateQuiz() DISABLED");
  }

  // Delete quiz - ปิดการทำงาน
  static async deleteQuiz(quizId) {
    console.log("🚨 deleteQuiz() CALLED!");
    console.trace("🔍 WHO IS CALLING deleteQuiz?");
    console.log("🚫 Firebase deleteQuiz() DISABLED");
  }

  // Save student attempt - ปิดการทำงาน
  static async saveStudentAttempt(attemptData) {
    console.log("🚨 saveStudentAttempt() CALLED!");
    console.trace("🔍 WHO IS CALLING saveStudentAttempt?");
    console.log("🚫 Firebase saveStudentAttempt() DISABLED");
  }

  // Get student attempts - ปิดการทำงาน
  static async getStudentAttempts(studentName) {
    console.log("🚨 getStudentAttempts() CALLED!");
    console.trace("🔍 WHO IS CALLING getStudentAttempts?");
    console.log("🚫 Firebase getStudentAttempts() DISABLED");
    return [];
  }

  // Get all student attempts - ปิดการทำงาน
  static async getAllStudentAttempts() {
    console.log("🚨 getAllStudentAttempts() CALLED!");
    console.trace("🔍 WHO IS CALLING getAllStudentAttempts?");
    console.log("🚫 Firebase getAllStudentAttempts() DISABLED");
    return [];
  }
}

export default FirebaseService;
