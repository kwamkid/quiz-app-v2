// src/services/firebase.js - เพิ่มระบบจัดการโรงเรียนและรองรับ 2 ภาษา
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
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
    titleTh: "คณิตศาสตร์ ป.6",
    titleEn: "Mathematics Grade 6",
    emoji: "🧮",
    difficulty: "ง่าย",
    questions: [
      {
        question: "5 + 3 = ?",
        questionTh: "5 + 3 = ?",
        questionEn: "5 + 3 = ?",
        options: ["6", "7", "8", "9"],
        optionsTh: ["6", "7", "8", "9"],
        optionsEn: ["6", "7", "8", "9"],
        correctAnswer: 2,
        points: 10,
      },
      {
        question: "12 ÷ 4 = ?",
        questionTh: "12 ÷ 4 = ?",
        questionEn: "12 ÷ 4 = ?",
        options: ["2", "3", "4", "6"],
        optionsTh: ["2", "3", "4", "6"],
        optionsEn: ["2", "3", "4", "6"],
        correctAnswer: 1,
        points: 10,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class FirebaseService {
  // ✅ Get all quizzes (รองรับ 2 ภาษา)
  static async getQuizzes(categoryId = null) {
    if (!isFirebaseConfigValid || !db) {
      console.log("📝 Using mock data - Firebase not configured");
      return mockQuizzes;
    }

    try {
      console.log("🔍 Getting quizzes from Firestore...");

      let q;
      if (categoryId && categoryId !== "all") {
        q = query(
          collection(db, "quizzes"),
          where("categoryId", "==", categoryId)
        );
      } else {
        q = collection(db, "quizzes");
      }

      const querySnapshot = await getDocs(q);
      const quizzes = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quizzes.push({
          id: doc.id,
          ...data,
          // รองรับทั้ง format เก่าและใหม่
          titleTh: data.titleTh || data.title,
          titleEn: data.titleEn || data.title,
        });
      });

      console.log(
        `✅ Quizzes loaded from Firestore: ${quizzes.length} ${
          categoryId ? `(category: ${categoryId})` : "(all)"
        }`
      );

      return quizzes;
    } catch (error) {
      console.error("❌ Error getting quizzes:", error);
      return mockQuizzes;
    }
  }

  // ✅ Get single quiz
  static async getQuiz(quizId) {
    try {
      console.log("🔍 Getting quiz:", quizId);

      const docRef = doc(db, "quizzes", quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          titleTh: data.titleTh || data.title,
          titleEn: data.titleEn || data.title,
        };
      } else {
        console.log("❌ Quiz not found:", quizId);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting quiz:", error);
      return null;
    }
  }

  // ✅ Create new quiz (รองรับ 2 ภาษา)
  static async createQuiz(quizData) {
    try {
      console.log("➕ Creating quiz:", quizData.titleTh || quizData.title);

      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizData,
        titleTh: quizData.titleTh || quizData.title,
        titleEn: quizData.titleEn || quizData.title,
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

  // ✅ Update quiz (รองรับ 2 ภาษา)
  static async updateQuiz(quizId, quizData) {
    try {
      console.log("📝 Updating quiz:", quizId);

      const docRef = doc(db, "quizzes", quizId);
      await updateDoc(docRef, {
        ...quizData,
        titleTh: quizData.titleTh || quizData.title,
        titleEn: quizData.titleEn || quizData.title,
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

  // ✅ School Management Functions
  static async getAllSchools() {
    if (!isFirebaseConfigValid || !db) {
      console.log("📝 Using mock schools - Firebase not configured");
      return [
        {
          id: "codelab-rama2",
          nameTh: "CodeLab พระราม 2",
          nameEn: "CodeLab Rama 2",
          province: "กรุงเทพมหานคร",
          district: "บางขุนเทียน",
          studentCount: 100,
        },
        {
          id: "codelab-muangthong",
          nameTh: "CodeLab เมืองทอง",
          nameEn: "CodeLab Muang Thong",
          province: "นนทบุรี",
          district: "ปากเกร็ด",
          studentCount: 150,
        },
        {
          id: "dbs",
          nameTh: "โรงเรียนนานาชาติ DBS",
          nameEn: "DBS International School",
          province: "กรุงเทพมหานคร",
          district: "บางนา",
          studentCount: 500,
        },
        {
          id: "shrewsbury",
          nameTh: "โรงเรียนนานาชาติชรูสเบอรี",
          nameEn: "Shrewsbury International School",
          province: "กรุงเทพมหานคร",
          district: "วัฒนา",
          studentCount: 800,
        },
      ];
    }

    try {
      console.log("🔍 Getting all schools...");
      const schoolsSnapshot = await getDocs(collection(db, "schools"));
      const schools = [];

      schoolsSnapshot.forEach((doc) => {
        schools.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Schools loaded:", schools.length);
      return schools;
    } catch (error) {
      console.error("❌ Error getting schools:", error);
      return [];
    }
  }

  static async createSchool(schoolData) {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - school creation skipped");
      return "mock-school-id";
    }

    try {
      console.log("➕ Creating school:", schoolData.nameTh);

      const schoolId =
        schoolData.id ||
        schoolData.nameTh.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, "");
      const docRef = doc(db, "schools", schoolId);

      await setDoc(docRef, {
        ...schoolData,
        id: schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ School created with ID:", schoolId);
      return schoolId;
    } catch (error) {
      console.error("❌ Error creating school:", error);
      throw error;
    }
  }

  static async updateSchool(schoolId, schoolData) {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - school update skipped");
      return true;
    }

    try {
      console.log("📝 Updating school:", schoolId);

      const docRef = doc(db, "schools", schoolId);
      await updateDoc(docRef, {
        ...schoolData,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ School updated successfully");
      return true;
    } catch (error) {
      console.error("❌ Error updating school:", error);
      throw error;
    }
  }

  static async deleteSchool(schoolId) {
    try {
      console.log("🗑️ Deleting school:", schoolId);

      // ตรวจสอบว่ามีนักเรียนในโรงเรียนนี้หรือไม่
      const q = query(
        collection(db, "quiz_results"),
        where("schoolId", "==", schoolId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("Cannot delete school with existing students");
      }

      await deleteDoc(doc(db, "schools", schoolId));

      console.log("✅ School deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error deleting school:", error);
      throw error;
    }
  }

  // ✅ อัพเดท saveStudentAttempt เพื่อเก็บข้อมูลโรงเรียน
  static async saveStudentAttempt(attemptData) {
    if (!isFirebaseConfigValid || !db) {
      console.log("💾 Mock save student attempt:", attemptData);
      console.log("⚠️ Firebase not configured - data not actually saved");
      return "mock-id-" + Date.now();
    }

    try {
      console.log("💾 Saving student attempt:", attemptData);

      const docRef = await addDoc(collection(db, "quiz_results"), {
        studentName: attemptData.studentName,
        studentSchool: attemptData.studentSchool || null, // เก็บข้อมูลโรงเรียนแบบ object
        schoolId: attemptData.studentSchool?.id || attemptData.schoolId || null, // เก็บ schoolId แยก
        schoolName: attemptData.studentSchool?.nameTh || null, // เก็บชื่อโรงเรียนแยก
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
        difficulty: attemptData.difficulty || null,
        emoji: attemptData.emoji || null,
      });

      console.log("✅ Student attempt saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving student attempt:", error);
      console.error("Attempt data:", attemptData);
      console.log("🔄 Returning mock ID for app continuity");
      return "error-mock-id-" + Date.now();
    }
  }

  // ✅ ดึงผลคะแนนของนักเรียน (รองรับการกรองตามโรงเรียน)
  static async getStudentAttempts(studentName, schoolId = null) {
    try {
      console.log(
        "📊 Getting attempts for student:",
        studentName,
        "School:",
        schoolId
      );

      let q;
      if (schoolId) {
        // ถ้าระบุโรงเรียน ให้ดึงเฉพาะของโรงเรียนนั้น
        q = query(
          collection(db, "quiz_results"),
          where("studentName", "==", studentName),
          where("schoolId", "==", schoolId)
        );
      } else {
        // ถ้าไม่ระบุโรงเรียน ให้ดึงทั้งหมดของชื่อนี้
        q = query(
          collection(db, "quiz_results"),
          where("studentName", "==", studentName)
        );
      }

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
        const timeA = a.timestamp?.toDate
          ? a.timestamp.toDate()
          : new Date(a.timestamp || 0);
        const timeB = b.timestamp?.toDate
          ? b.timestamp.toDate()
          : new Date(b.timestamp || 0);
        return timeB - timeA;
      });

      console.log("✅ Student attempts loaded:", attempts.length);
      return attempts;
    } catch (error) {
      console.error("❌ Error getting student attempts:", error);
      return [];
    }
  }

  // ✅ ดึงผลคะแนนทั้งหมด (สำหรับครู - รองรับการกรองตามโรงเรียน)
  static async getAllStudentAttempts(schoolId = null) {
    try {
      console.log("📊 Getting all student attempts...");

      let q;
      if (schoolId) {
        q = query(
          collection(db, "quiz_results"),
          where("schoolId", "==", schoolId)
        );
      } else {
        q = collection(db, "quiz_results");
      }

      const querySnapshot = await getDocs(q);
      const attempts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attempts.push({
          id: doc.id,
          ...data,
          // เพิ่มการจัดการ school name สำหรับการแสดงผล
          displaySchoolName:
            data.schoolName || data.studentSchool?.nameTh || "-",
        });
      });

      // เรียงลำดับใน client
      attempts.sort((a, b) => {
        const timeA = a.timestamp?.toDate
          ? a.timestamp.toDate()
          : new Date(a.timestamp || 0);
        const timeB = b.timestamp?.toDate
          ? b.timestamp.toDate()
          : new Date(b.timestamp || 0);
        return timeB - timeA;
      });

      console.log("✅ All student attempts loaded:", attempts.length);
      return attempts;
    } catch (error) {
      console.error("❌ Error getting all student attempts:", error);
      return [];
    }
  }

  // ✅ สำหรับ backward compatibility
  static async saveQuizResult(resultData) {
    console.log(
      "⚠️ saveQuizResult is deprecated, use saveStudentAttempt instead"
    );
    return this.saveStudentAttempt(resultData);
  }

  static async getStudentResults(studentName, schoolId = null) {
    console.log(
      "⚠️ getStudentResults is deprecated, use getStudentAttempts instead"
    );
    return this.getStudentAttempts(studentName, schoolId);
  }

  // ✅ Get all categories (สำหรับการจัดการ)
  static async getAllCategories() {
    try {
      console.log("🔍 Getting all categories...");

      if (!isFirebaseConfigValid || !db) {
        return this.getDefaultCategories();
      }

      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categories = [];

      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📂 Category ${doc.id}:`, data);
        categories.push({
          id: doc.id,
          ...data,
        });
      });

      if (categories.length === 0) {
        console.log("📝 No categories found, creating defaults...");
        const defaults = this.getDefaultCategories();

        for (const category of defaults) {
          await this.createCategory(category);
        }

        return defaults;
      }

      // นับจำนวนข้อสอบในแต่ละหมวด
      const quizSnapshot = await getDocs(collection(db, "quizzes"));
      const categoryCounts = {};

      quizSnapshot.forEach((doc) => {
        const quiz = doc.data();
        const categoryId = quiz.categoryId || "uncategorized";
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });

      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        quizCount: categoryCounts[cat.id] || 0,
      }));

      console.log("✅ Categories loaded:", categoriesWithCount.length);
      console.log("📋 Categories data:", categoriesWithCount);
      return categoriesWithCount;
    } catch (error) {
      console.error("❌ Error getting categories:", error);
      return this.getDefaultCategories();
    }
  }

  // ✅ Get categories (สำหรับการแสดงผล)
  static async getCategories() {
    try {
      console.log("🔍 Getting categories...");

      if (!isFirebaseConfigValid || !db) {
        return this.getDefaultCategories();
      }

      const quizSnapshot = await getDocs(collection(db, "quizzes"));
      const categoryCounts = {};
      let totalQuizzes = 0;

      quizSnapshot.forEach((doc) => {
        const quiz = doc.data();
        const categoryId = quiz.categoryId || "uncategorized";
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        totalQuizzes++;
      });

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

  // ✅ Create new category
  static async createCategory(categoryData) {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - category creation skipped");
      return "mock-category-id";
    }

    try {
      console.log("➕ Creating category:", categoryData.name);

      const categoryId =
        categoryData.id ||
        categoryData.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const docRef = doc(db, "categories", categoryId);

      await setDoc(docRef, {
        ...categoryData,
        id: categoryId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Category created with ID:", categoryId);
      return categoryId;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      throw error;
    }
  }

  // ✅ Update category
  static async updateCategory(categoryId, categoryData) {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - category update skipped");
      return true;
    }

    try {
      console.log("📝 Updating category with ID:", categoryId);
      console.log("📝 Category data to update:", categoryData);

      const defaultCategories = [
        "math",
        "science",
        "thai",
        "english",
        "art",
        "music",
        "pe",
        "uncategorized",
      ];
      let actualDocId = categoryId;

      if (!defaultCategories.includes(categoryId)) {
        console.log(
          "🔍 Not a default category ID, searching by document ID..."
        );

        const docRef = doc(db, "categories", categoryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Found document with ID:", categoryId);
          await updateDoc(docRef, {
            name: categoryData.name,
            emoji: categoryData.emoji,
            description: categoryData.description,
            color: categoryData.color,
            iconType: categoryData.iconType || "default",
            updatedAt: serverTimestamp(),
          });
          console.log("✅ Category updated successfully");
          return true;
        } else {
          console.log("❌ Document not found with ID:", categoryId);
          throw new Error("Category not found");
        }
      } else {
        const docRef = doc(db, "categories", actualDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Updating existing default category");
          await updateDoc(docRef, {
            name: categoryData.name,
            emoji: categoryData.emoji,
            description: categoryData.description,
            color: categoryData.color,
            iconType: categoryData.iconType || "default",
            updatedAt: serverTimestamp(),
          });
        } else {
          console.log("📝 Creating default category that doesn't exist yet");
          await setDoc(docRef, {
            id: actualDocId,
            name: categoryData.name,
            emoji: categoryData.emoji,
            description: categoryData.description,
            color: categoryData.color,
            iconType: categoryData.iconType || "default",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        console.log("✅ Category updated/created successfully");
        return true;
      }
    } catch (error) {
      console.error("❌ Error updating category:", error);
      console.error("Category ID:", categoryId);
      console.error("Category data:", categoryData);
      throw error;
    }
  }

  // ✅ Delete category
  static async deleteCategory(categoryId) {
    try {
      console.log("🗑️ Deleting category:", categoryId);

      const q = query(
        collection(db, "quizzes"),
        where("categoryId", "==", categoryId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("Cannot delete category with existing quizzes");
      }

      await deleteDoc(doc(db, "categories", categoryId));

      console.log("✅ Category deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      throw error;
    }
  }

  // ✅ Helper: Get default categories
  static getDefaultCategories() {
    return [
      {
        id: "math",
        name: "🧮 คณิตศาสตร์",
        emoji: "🧮",
        description: "บวก ลบ คูณ หาร และอื่นๆ",
        color: "from-purple-400 to-pink-400",
        iconType: "math",
      },
      {
        id: "science",
        name: "🔬 วิทยาศาสตร์",
        emoji: "🔬",
        description: "สำรวจโลกและธรรมชาติ",
        color: "from-green-400 to-blue-400",
        iconType: "science",
      },
      {
        id: "thai",
        name: "📚 ภาษาไทย",
        emoji: "📚",
        description: "อ่าน เขียน และไวยากรณ์",
        color: "from-orange-400 to-red-400",
        iconType: "thai",
      },
      {
        id: "english",
        name: "🇬🇧 ภาษาอังกฤษ",
        emoji: "🇬🇧",
        description: "English vocabulary and grammar",
        color: "from-blue-400 to-cyan-400",
        iconType: "english",
      },
      {
        id: "uncategorized",
        name: "📖 อื่นๆ",
        emoji: "📖",
        description: "หมวดหมู่อื่นๆ",
        color: "from-gray-400 to-gray-500",
        iconType: "default",
      },
    ];
  }

  // ✅ Initialize default categories in Firestore
  static async initializeDefaultCategories() {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - cannot initialize categories");
      return;
    }

    try {
      console.log("🔄 Checking and initializing default categories...");

      const defaults = this.getDefaultCategories();
      let created = 0;

      for (const category of defaults) {
        const docRef = doc(db, "categories", category.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.log(
            `📝 Creating default category: ${category.name} with ID: ${category.id}`
          );
          await setDoc(docRef, {
            ...category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          created++;
        }
      }

      if (created > 0) {
        console.log(`✅ Created ${created} default categories`);
      } else {
        console.log("✅ All default categories already exist");
      }
    } catch (error) {
      console.error("❌ Error initializing categories:", error);
    }
  }

  // ✅ Initialize default schools in Firestore
  static async initializeDefaultSchools() {
    if (!isFirebaseConfigValid || !db) {
      console.log("⚠️ Firebase not configured - cannot initialize schools");
      return;
    }

    try {
      console.log("🔄 Checking and initializing default schools...");

      const defaultSchools = [
        {
          id: "codelab-rama2",
          nameTh: "CodeLab พระราม 2",
          nameEn: "CodeLab Rama 2",
          province: "กรุงเทพมหานคร",
          district: "บางขุนเทียน",
          studentCount: 0,
        },
        {
          id: "codelab-muangthong",
          nameTh: "CodeLab เมืองทอง",
          nameEn: "CodeLab Muang Thong",
          province: "นนทบุรี",
          district: "ปากเกร็ด",
          studentCount: 0,
        },
        {
          id: "dbs",
          nameTh: "โรงเรียนนานาชาติ DBS",
          nameEn: "DBS International School",
          province: "กรุงเทพมหานคร",
          district: "บางนา",
          studentCount: 0,
        },
        {
          id: "shrewsbury",
          nameTh: "โรงเรียนนานาชาติชรูสเบอรี",
          nameEn: "Shrewsbury International School",
          province: "กรุงเทพมหานคร",
          district: "วัฒนา",
          studentCount: 0,
        },
      ];

      let created = 0;

      for (const school of defaultSchools) {
        const docRef = doc(db, "schools", school.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.log(
            `📝 Creating default school: ${school.nameTh} with ID: ${school.id}`
          );
          await setDoc(docRef, {
            ...school,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          created++;
        }
      }

      if (created > 0) {
        console.log(`✅ Created ${created} default schools`);
      } else {
        console.log("✅ All default schools already exist");
      }
    } catch (error) {
      console.error("❌ Error initializing schools:", error);
    }
  }
}

// Initialize default categories and schools when the app starts
if (isFirebaseConfigValid && db) {
  FirebaseService.initializeDefaultCategories().catch(console.error);
  FirebaseService.initializeDefaultSchools().catch(console.error);
}

export default FirebaseService;
export { auth, db };
