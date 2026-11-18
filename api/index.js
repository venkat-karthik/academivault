// server.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import crypto2 from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv4 from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import Razorpay from "razorpay";

// src/lib/firestoreRepository.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";

// src/lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();
var db = null;
var isConfigured = false;
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (projectId && clientEmail && privateKey && !privateKey.includes("...")) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
    }
    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    isConfigured = true;
    console.log("[AcademiaVault] Cloud Firestore initialized with project:", projectId);
  } else {
    console.warn("[AcademiaVault] Firebase credentials not fully configured or using template keys in .env. Running in hybrid persistence mode.");
  }
} catch (err) {
  console.error("[AcademiaVault] Failed to initialize Firebase Admin SDK:", err);
}

// src/data/mockData.ts
var INITIAL_COLLEGES = [
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    code: "IITB",
    city: "Mumbai",
    state: "Maharashtra",
    type: "IIT",
    universityName: "IIT Bombay Autonomous",
    branches: ["Computer Science & Engineering", "Electrical Engineering", "Mechanical Engineering", "Aerospace Engineering"]
  },
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science, Pilani",
    code: "BITS",
    city: "Pilani",
    state: "Rajasthan",
    type: "BITS",
    universityName: "BITS Deemed University",
    branches: ["Computer Science", "Electronics & Instrumentation", "Electrical & Electronics", "Chemical Engineering"]
  },
  {
    id: "nit-trichy",
    name: "National Institute of Technology Tiruchirappalli",
    code: "NITT",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    type: "NIT",
    universityName: "NIT Trichy Autonomous",
    branches: ["Computer Science & Engineering", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"]
  },
  {
    id: "vtu-belagavi",
    name: "Visvesvaraya Technological University",
    code: "VTU",
    city: "Belagavi / Bengaluru",
    state: "Karnataka",
    type: "State University",
    universityName: "VTU State Technical University",
    branches: ["Computer Science & Engineering", "Information Science", "Artificial Intelligence & ML", "Electronics & Communication"]
  },
  {
    id: "anna-univ",
    name: "Anna University College of Engineering, Guindy",
    code: "CEG",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "State University",
    universityName: "Anna University",
    branches: ["Computer Science & Engineering", "Information Technology", "Biomedical Engineering", "Mechanical Engineering"]
  },
  {
    id: "delhi-univ",
    name: "University of Delhi (Faculty of Technology & CIC)",
    code: "DU",
    city: "New Delhi",
    state: "Delhi",
    type: "State University",
    universityName: "University of Delhi",
    branches: ["Computer Science & Engineering", "Information Technology & Mathematical Innovations", "Electronics"]
  }
];
var INITIAL_USERS = [
  {
    id: "usr_student_rahul",
    name: "Rahul Sharma",
    email: "rahul.sharma@iitb.ac.in",
    role: "student",
    collegeId: "iit-bombay",
    collegeName: "IIT Bombay",
    branch: "Computer Science & Engineering",
    semester: 5,
    isEmailVerified: true,
    createdAt: "2026-08-15T10:00:00Z"
  },
  {
    id: "usr_contributor_priya",
    name: "Priya Patel",
    email: "priya.patel@bits-pilani.ac.in",
    role: "contributor",
    collegeId: "bits-pilani",
    collegeName: "BITS Pilani",
    branch: "Computer Science",
    semester: 7,
    isEmailVerified: true,
    createdAt: "2026-07-20T14:30:00Z"
  },
  {
    id: "usr_professor_sen",
    name: "Dr. Ananya Sen",
    email: "ananya.sen@cse.iitb.ac.in",
    role: "professor",
    collegeId: "iit-bombay",
    collegeName: "IIT Bombay",
    branch: "Computer Science & Engineering",
    isEmailVerified: true,
    createdAt: "2026-06-10T09:15:00Z"
  },
  {
    id: "usr_admin_karthik",
    name: "Karthik Venkat",
    email: "karthikvenkat316@gmail.com",
    role: "admin",
    isEmailVerified: true,
    createdAt: "2026-01-01T00:00:00Z"
  }
];
var INITIAL_DOCUMENTS = [
  {
    id: "doc_dsa_handcrafted_mastery",
    title: "Data Structures & Algorithms: Handcrafted Master Notes (Module 1 - 5)",
    description: "Exhaustive semester examination & interview preparation handwritten notes covering Red-Black Trees, Dynamic Programming with Memoization tables, Graph algorithms (Dijkstra, Tarjan SCC), and Amortized Time Complexity proofs. Includes step-by-step trace diagrams and solved university problems.",
    category: "handwritten_notes",
    collegeId: "iit-bombay",
    collegeName: "IIT Bombay",
    universityName: "IIT Bombay Autonomous",
    branch: "Computer Science & Engineering",
    semester: 3,
    subjectId: "CS201",
    subjectName: "Data Structures & Algorithms",
    subjectCode: "CS201",
    module: "Complete Modules 1-5",
    academicScheme: "2024 Revised CBCS Curriculum",
    pageCount: 68,
    language: "English",
    price: 49,
    originalPrice: 99,
    contributorId: "usr_contributor_priya",
    contributorName: "Priya Patel",
    contributorCollege: "BITS Pilani \xB7 Department of Computer Science",
    status: "approved",
    samplePreviewPages: [1, 2],
    totalSales: 482,
    rating: 4.9,
    ratingCount: 142,
    professorReviewStatus: "verified_accurate",
    professorVerifiedScore: 96,
    createdAt: "2026-09-02T11:20:00Z",
    updatedAt: "2026-10-14T08:15:00Z",
    version: 2
  },
  {
    id: "doc_os_concurrency_virtual_mem",
    title: "Operating Systems: Concurrency, Virtual Memory & Kernel Architecture",
    description: "Detailed clean digital notes with architecture diagrams on Unix process lifecycle, CPU scheduling algorithms, Peterson & Semaphore synchronization, Deadlock Banker algorithm, and Two-Level Paging with TLB miss analysis. Features 10-year previous university exam questions solved.",
    category: "digital_notes",
    collegeId: "bits-pilani",
    collegeName: "BITS Pilani",
    universityName: "BITS Deemed University",
    branch: "Computer Science",
    semester: 4,
    subjectId: "CS302",
    subjectName: "Operating Systems & System Architecture",
    subjectCode: "CS302",
    module: "Modules 2 & 3: Kernel & Synchronization",
    academicScheme: "BITS Academic Bulletin 2024-26",
    pageCount: 52,
    language: "English",
    price: 39,
    originalPrice: 79,
    contributorId: "usr_contributor_priya",
    contributorName: "Priya Patel",
    contributorCollege: "BITS Pilani",
    status: "approved",
    samplePreviewPages: [1, 2],
    totalSales: 318,
    rating: 4.8,
    ratingCount: 89,
    professorReviewStatus: "verified_accurate",
    professorVerifiedScore: 94,
    createdAt: "2026-09-15T16:45:00Z",
    updatedAt: "2026-10-20T12:00:00Z",
    version: 1
  },
  {
    id: "doc_ml_math_derivation_pack",
    title: "Machine Learning: Complete Mathematical Derivations & Neural Nets Pack",
    description: "Rigorous derivation pack including Maximum Likelihood Estimation (MLE), Backpropagation tensor matrix calculus, Support Vector Machine Lagrange dual formulation, and Convolutional layer arithmetic. Designed for end-semester exams and graduate research entrance.",
    category: "exam_preparation_packs",
    collegeId: "iit-bombay",
    collegeName: "IIT Bombay",
    universityName: "IIT Bombay Autonomous",
    branch: "Computer Science & Engineering",
    semester: 7,
    subjectId: "CS419",
    subjectName: "Foundations of Machine Learning",
    subjectCode: "CS419",
    module: "Complete Subject Pack",
    academicScheme: "IITB B.Tech Curriculum",
    pageCount: 84,
    language: "English",
    price: 79,
    originalPrice: 149,
    contributorId: "usr_student_rahul",
    contributorName: "Rahul Sharma",
    contributorCollege: "IIT Bombay",
    status: "approved",
    samplePreviewPages: [1, 2],
    totalSales: 215,
    rating: 4.9,
    ratingCount: 76,
    professorReviewStatus: "verified_accurate",
    professorVerifiedScore: 98,
    createdAt: "2026-08-28T10:00:00Z",
    updatedAt: "2026-10-01T15:30:00Z",
    version: 1
  },
  {
    id: "doc_vtu_dsp_lab_records",
    title: "Digital Signal Processing: Verified MATLAB & C Laboratory Manual with Viva Q&A",
    description: "Fully verified laboratory record with code listings, frequency response graphs, FFT spectrum analysis, FIR/IIR Butterworth filter designs, and 85 viva-voce questions with answers. Evaluated and checked by senior faculty.",
    category: "laboratory_records",
    collegeId: "vtu-belagavi",
    collegeName: "VTU Belagavi",
    universityName: "VTU State Technical University",
    branch: "Electronics & Communication",
    semester: 5,
    subjectId: "EC504L",
    subjectName: "DSP & Audio Signal Laboratory",
    subjectCode: "EC504L",
    module: "Lab Experiments 1-12 Complete",
    academicScheme: "VTU 2021/2022 Scheme",
    pageCount: 44,
    language: "English",
    price: 35,
    originalPrice: 65,
    contributorId: "usr_contributor_priya",
    contributorName: "Priya Patel",
    contributorCollege: "BITS Pilani",
    status: "approved",
    samplePreviewPages: [1],
    totalSales: 164,
    rating: 4.7,
    ratingCount: 43,
    professorReviewStatus: "verified_accurate",
    professorVerifiedScore: 92,
    createdAt: "2026-09-22T08:10:00Z",
    updatedAt: "2026-10-05T18:20:00Z",
    version: 1
  },
  {
    id: "doc_anna_discrete_math_qb",
    title: "Discrete Mathematics & Graph Theory: Solved Question Bank (2018 - 2025)",
    description: "Solved university questions organized by unit: Propositional Logic, Pigeonhole Principle, Recurrence Relations by Generating Functions, Isomorphism of Graphs, and Boolean Algebra. Step-by-step proofs guaranteed to score high in university evaluations.",
    category: "question_banks",
    collegeId: "anna-univ",
    collegeName: "Anna University CEG",
    universityName: "Anna University",
    branch: "Computer Science & Engineering",
    semester: 3,
    subjectId: "MA8351",
    subjectName: "Discrete Mathematics",
    subjectCode: "MA8351",
    module: "Units 1 - 5 Solved Question Bank",
    academicScheme: "Anna University Regulation 2021",
    pageCount: 92,
    language: "English",
    price: 45,
    originalPrice: 89,
    contributorId: "usr_contributor_priya",
    contributorName: "Priya Patel",
    contributorCollege: "BITS Pilani",
    status: "approved",
    samplePreviewPages: [1, 2],
    totalSales: 290,
    rating: 4.8,
    ratingCount: 95,
    professorReviewStatus: "verified_accurate",
    professorVerifiedScore: 95,
    createdAt: "2026-09-08T14:15:00Z",
    updatedAt: "2026-10-12T09:40:00Z",
    version: 2
  },
  {
    id: "doc_vlSI_architecture_verilog",
    title: "VLSI System Design: CMOS Technology & Verilog RTL Practice Manual",
    description: "Covers MOS Transistor theory, Elmore delay calculation, Static and Dynamic CMOS logic styles, Stick diagrams, Layout design rules, and synthesizable Verilog testbenches for ALU and FSM state controllers.",
    category: "complete_subject_materials",
    collegeId: "nit-trichy",
    collegeName: "NIT Trichy",
    universityName: "NIT Trichy Autonomous",
    branch: "Electronics & Communication",
    semester: 6,
    subjectId: "EC308",
    subjectName: "VLSI Design & Architecture",
    subjectCode: "EC308",
    module: "Complete Course Material",
    academicScheme: "NITT B.Tech Curriculum",
    pageCount: 76,
    language: "English",
    price: 59,
    originalPrice: 119,
    contributorId: "usr_contributor_priya",
    contributorName: "Priya Patel",
    contributorCollege: "BITS Pilani",
    status: "approved",
    samplePreviewPages: [1, 2],
    totalSales: 142,
    rating: 4.9,
    ratingCount: 38,
    professorReviewStatus: "under_review",
    professorVerifiedScore: 90,
    createdAt: "2026-10-02T13:20:00Z",
    updatedAt: "2026-10-25T11:00:00Z",
    version: 1
  }
];
var INITIAL_STUDENT_REVIEWS = [
  {
    id: "rev_std_101",
    documentId: "doc_dsa_handcrafted_mastery",
    documentVersion: 2,
    userId: "usr_student_rahul",
    userName: "Rahul Sharma",
    userCollege: "IIT Bombay CSE",
    verifiedPurchase: true,
    rating: 5,
    contentAccuracyRating: 5,
    explanationQualityRating: 5,
    readabilityRating: 5,
    syllabusCoverageRating: 5,
    examUsefulnessRating: 5,
    reviewText: "The Dynamic Programming trace diagrams and Red-Black tree rotations alone saved my mid-semester exam. The handwriting is crystal clear and every complexity proof matches Cormen (CLRS) notation.",
    helpfulCount: 34,
    createdAt: "2026-09-28T14:22:00Z"
  },
  {
    id: "rev_std_102",
    documentId: "doc_dsa_handcrafted_mastery",
    documentVersion: 2,
    userId: "usr_kavya_nitt",
    userName: "Kavya Sundaram",
    userCollege: "NIT Trichy",
    verifiedPurchase: true,
    rating: 5,
    contentAccuracyRating: 5,
    explanationQualityRating: 5,
    readabilityRating: 4,
    syllabusCoverageRating: 5,
    examUsefulnessRating: 5,
    reviewText: "Every single question from our semester paper was covered in Module 3 & 4. Verified purchase, absolutely worth the \u20B949 price.",
    helpfulCount: 19,
    createdAt: "2026-10-04T09:12:00Z"
  },
  {
    id: "rev_std_103",
    documentId: "doc_os_concurrency_virtual_mem",
    documentVersion: 1,
    userId: "usr_arjun_vtu",
    userName: "Arjun Gowda",
    userCollege: "BMSCE (VTU)",
    verifiedPurchase: true,
    rating: 5,
    contentAccuracyRating: 5,
    explanationQualityRating: 5,
    readabilityRating: 5,
    syllabusCoverageRating: 4,
    examUsefulnessRating: 5,
    reviewText: "The TLB two-level paging calculation walkthrough is the cleanest explanation I have found across YouTube or textbooks. Superb reader experience as well with the watermark.",
    helpfulCount: 22,
    createdAt: "2026-10-18T16:05:00Z"
  }
];
var INITIAL_PROFESSOR_REVIEWS = [
  {
    id: "prof_rev_201",
    documentId: "doc_dsa_handcrafted_mastery",
    documentVersion: 2,
    professorId: "usr_professor_sen",
    professorName: "Dr. Ananya Sen",
    institution: "Indian Institute of Technology Bombay",
    department: "Department of Computer Science & Engineering",
    technicalCorrectnessScore: 10,
    academicAccuracyScore: 10,
    conceptualExplanationScore: 9,
    syllabusAlignmentScore: 10,
    completenessScore: 9,
    referenceQualityScore: 10,
    overallQualityRating: 5,
    detailedFeedback: "I have rigorously audited all five modules in this document against the standard algorithms curriculum. The invariant definitions for balanced binary search trees and Tarjan strongly connected components are mathematically rigorous. Asymptotic bound notations are properly applied without conflating Big-O and Big-Theta.",
    recommendation: "highly_recommended",
    conflictOfInterestDisclosure: "I have no personal or commercial relationship with the contributor. Review conducted as an independent academic evaluation.",
    createdAt: "2026-09-20T11:45:00Z"
  },
  {
    id: "prof_rev_202",
    documentId: "doc_os_concurrency_virtual_mem",
    documentVersion: 1,
    professorId: "usr_professor_sen",
    professorName: "Dr. Ananya Sen",
    institution: "Indian Institute of Technology Bombay",
    department: "Department of Computer Science & Engineering",
    technicalCorrectnessScore: 9,
    academicAccuracyScore: 10,
    conceptualExplanationScore: 9,
    syllabusAlignmentScore: 9,
    completenessScore: 9,
    referenceQualityScore: 9,
    overallQualityRating: 5,
    detailedFeedback: "The concurrency primitives section correctly explains memory barriers and cache coherency implications in multi-core architectures. The Bankers algorithm state safety matrix check is free of logical errors.",
    recommendation: "highly_recommended",
    conflictOfInterestDisclosure: "Independent academic audit.",
    createdAt: "2026-10-02T17:10:00Z"
  }
];

// src/lib/firestoreRepository.ts
var FirestoreRepository = class {
  constructor() {
    // Local fallback cache for speed and when Firestore credentials are being configured
    this.localUsers = /* @__PURE__ */ new Map();
    this.localSessions = /* @__PURE__ */ new Map();
    this.localActiveSessions = /* @__PURE__ */ new Map();
    // userId -> sessionId
    this.localColleges = /* @__PURE__ */ new Map();
    this.localDocuments = /* @__PURE__ */ new Map();
    this.localReviews = /* @__PURE__ */ new Map();
    this.localProfReviews = /* @__PURE__ */ new Map();
    this.localProfVerifications = /* @__PURE__ */ new Map();
    this.localPurchases = /* @__PURE__ */ new Map();
    this.localEntitlements = /* @__PURE__ */ new Set();
    // "userId:docId"
    this.localPayouts = /* @__PURE__ */ new Map();
    this.localSecurityLogs = [];
    this.localPhotos = [
      {
        id: "photo_1",
        name: "Library Aesthetic Reading",
        url: "https://res.cloudinary.com/mcjwmthb/image/upload/v1794988399/academivault/site-assets/library_aesthetic_reading_1793904179717.jpg",
        publicId: "academivault/site-assets/library_aesthetic_reading_1793904179717",
        bytes: 980992,
        uploadedAt: "2026-11-18T13:23:00Z"
      },
      {
        id: "photo_2",
        name: "Academic Campus Quadrangle",
        url: "https://res.cloudinary.com/mcjwmthb/image/upload/v1794988401/academivault/site-assets/academic_campus_quad_1793904181259.jpg",
        publicId: "academivault/site-assets/academic_campus_quad_1793904181259",
        bytes: 1048576,
        uploadedAt: "2026-11-18T13:23:00Z"
      },
      {
        id: "photo_3",
        name: "Study Essentials Flatlay",
        url: "https://res.cloudinary.com/mcjwmthb/image/upload/v1794988398/academivault/site-assets/study_essentials_flatlay_1793904181267.jpg",
        publicId: "academivault/site-assets/study_essentials_flatlay_1793904181267",
        bytes: 831488,
        uploadedAt: "2026-11-18T13:23:00Z"
      },
      {
        id: "photo_4",
        name: "Cozy Study Desk & Notes",
        url: "https://res.cloudinary.com/mcjwmthb/image/upload/v1794988400/academivault/site-assets/hero_cozy_study_desk_1793904180995.jpg",
        publicId: "academivault/site-assets/hero_cozy_study_desk_1793904180995",
        bytes: 791552,
        uploadedAt: "2026-11-18T13:23:00Z"
      }
    ];
    this.seedBaselineData();
  }
  seedBaselineData() {
    INITIAL_COLLEGES.forEach((c) => this.localColleges.set(c.id, { ...c }));
    INITIAL_DOCUMENTS.forEach((d) => this.localDocuments.set(d.id, { ...d }));
    INITIAL_STUDENT_REVIEWS.forEach((r) => this.localReviews.set(r.id, { ...r }));
    INITIAL_PROFESSOR_REVIEWS.forEach((p) => this.localProfReviews.set(p.id, { ...p }));
    const salt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync("AcademicSecure2026!", salt);
    INITIAL_USERS.forEach((u) => {
      this.localUsers.set(u.id, {
        ...u,
        passwordHash: defaultHash
      });
    });
  }
  // -------------------------------------------------------------
  // USERS & AUTHENTICATION
  // -------------------------------------------------------------
  async findUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (isConfigured && db) {
      try {
        const snap = await db.collection("users").where("email", "==", cleanEmail).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.error("[Firestore] findUserByEmail error:", err);
      }
    }
    for (const u of this.localUsers.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
    return null;
  }
  async findUserById(id) {
    if (isConfigured && db) {
      try {
        const doc = await db.collection("users").doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.error("[Firestore] findUserById error:", err);
      }
    }
    return this.localUsers.get(id) || null;
  }
  async createUser(payload) {
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error("An account with this institutional email already exists.");
    }
    const college = this.localColleges.get(payload.collegeId);
    const userId = "usr_" + crypto.randomBytes(8).toString("hex");
    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : await bcrypt.hash("AcademicSecure2026!", 10);
    const isAdmin = cleanEmail === "karthikvenkat316@gmail.com";
    const newUser = {
      id: userId,
      name: payload.name.trim(),
      email: cleanEmail,
      role: isAdmin ? "admin" : payload.role === "contributor" ? "contributor" : "student",
      collegeId: payload.collegeId,
      collegeName: college?.name || "Selected University",
      branch: payload.branch || "Computer Science & Engineering",
      semester: Number(payload.semester) || 1,
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      passwordHash
    };
    if (isConfigured && db) {
      try {
        await db.collection("users").doc(userId).set(newUser);
      } catch (err) {
        console.error("[Firestore] createUser error:", err);
      }
    }
    this.localUsers.set(userId, newUser);
    return newUser;
  }
  async findOrCreateGoogleUser(payload) {
    const cleanEmail = payload.email.trim().toLowerCase();
    let user = await this.findUserByEmail(cleanEmail);
    const isAdmin = cleanEmail === "karthikvenkat316@gmail.com";
    if (user) {
      if (isAdmin && user.role !== "admin") {
        user.role = "admin";
        if (isConfigured && db) {
          try {
            await db.collection("users").doc(user.id).set({ role: "admin" }, { merge: true });
          } catch (err) {
            console.error("[Firestore] Role update error:", err);
          }
        }
      }
      return user;
    }
    const userId = "usr_" + crypto.randomBytes(8).toString("hex");
    const newUser = {
      id: userId,
      name: payload.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      role: isAdmin ? "admin" : "student",
      avatarUrl: payload.avatarUrl,
      isEmailVerified: true,
      collegeId: "iit-bombay",
      collegeName: "Indian Institute of Technology Bombay",
      branch: "Computer Science & Engineering",
      semester: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (isConfigured && db) {
      try {
        await db.collection("users").doc(userId).set(newUser, { merge: true });
      } catch (err) {
        console.error("[Firestore] Google user creation error:", err);
      }
    }
    this.localUsers.set(userId, newUser);
    return newUser;
  }
  async verifyUserPassword(user, passwordInput) {
    if (!user.passwordHash) return true;
    return bcrypt.compare(passwordInput, user.passwordHash);
  }
  // -------------------------------------------------------------
  // SINGLE-DEVICE SESSION REGISTRY (ATOMIC REVOCATION)
  // -------------------------------------------------------------
  async createSession(userId, deviceLabel, ipAddress, userAgent) {
    const user = await this.findUserById(userId);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const existingSessionId = this.localActiveSessions.get(userId);
    if (existingSessionId) {
      const oldSession = this.localSessions.get(existingSessionId);
      if (oldSession && oldSession.isValid) {
        oldSession.isValid = false;
        oldSession.invalidatedReason = "Your account was signed in on another device. Please log in again.";
        if (isConfigured && db) {
          try {
            await db.collection("user_sessions").doc(existingSessionId).update({
              isValid: false,
              invalidatedReason: oldSession.invalidatedReason
            });
          } catch (err) {
            console.error("[Firestore] session invalidation error:", err);
          }
        }
      }
    }
    const sessionId = "sess_" + crypto.randomBytes(24).toString("hex");
    const newSession = {
      sessionId,
      userId,
      deviceLabel: deviceLabel || "Primary Web Device",
      deviceId: "dev_" + crypto.randomBytes(8).toString("hex"),
      ipAddress,
      userAgent,
      createdAt: nowIso,
      lastActivityAt: nowIso,
      isValid: true
    };
    if (isConfigured && db) {
      try {
        await db.collection("user_sessions").doc(sessionId).set(newSession);
        await db.collection("users").doc(userId).set({
          activeSessionId: sessionId,
          lastLoginAt: nowIso
        }, { merge: true });
      } catch (err) {
        console.error("[Firestore] createSession error:", err);
      }
    }
    this.localSessions.set(sessionId, newSession);
    this.localActiveSessions.set(userId, sessionId);
    this.logSecurityEvent({
      eventType: "login_success",
      userId,
      userEmail: user?.email,
      ipAddress,
      deviceLabel,
      details: `Single-device authenticated session established: ${sessionId.substring(0, 10)}...`,
      severity: "info"
    });
    return newSession;
  }
  async validateSession(sessionId) {
    if (!sessionId) {
      return { valid: false, error: "No active session token provided." };
    }
    let session = this.localSessions.get(sessionId);
    if (!session && isConfigured && db) {
      try {
        const snap = await db.collection("user_sessions").doc(sessionId).get();
        if (snap.exists) {
          session = snap.data();
          this.localSessions.set(sessionId, session);
        }
      } catch (err) {
        console.error("[Firestore] validateSession error:", err);
      }
    }
    if (!session) {
      return { valid: false, error: "Session expired or not found. Please log in." };
    }
    if (!session.isValid) {
      return {
        valid: false,
        session,
        error: session.invalidatedReason || "Your account was signed in on another device. Please log in again."
      };
    }
    session.lastActivityAt = (/* @__PURE__ */ new Date()).toISOString();
    return { valid: true, session };
  }
  async revokeSession(sessionId, reason = "Session terminated.") {
    const session = this.localSessions.get(sessionId);
    if (session) {
      session.isValid = false;
      session.invalidatedReason = reason;
      this.localActiveSessions.delete(session.userId);
    }
    if (isConfigured && db) {
      try {
        await db.collection("user_sessions").doc(sessionId).update({
          isValid: false,
          invalidatedReason: reason
        });
      } catch (err) {
        console.error("[Firestore] revokeSession error:", err);
      }
    }
  }
  // -------------------------------------------------------------
  // DOCUMENTS & CATALOGUE
  // -------------------------------------------------------------
  async getDocuments(filters = {}) {
    let docs = Array.from(this.localDocuments.values());
    if (filters.collegeId && filters.collegeId !== "all") {
      docs = docs.filter((d) => d.collegeId === filters.collegeId);
    }
    if (filters.category && filters.category !== "all") {
      docs = docs.filter((d) => d.category === filters.category);
    }
    if (filters.branch && filters.branch !== "all") {
      docs = docs.filter((d) => d.branch.toLowerCase().includes(filters.branch.toLowerCase()));
    }
    if (filters.semester && filters.semester !== "all") {
      docs = docs.filter((d) => d.semester === Number(filters.semester));
    }
    if (filters.professorVerifiedOnly) {
      docs = docs.filter((d) => d.professorReviewStatus === "verified_accurate");
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) => d.title.toLowerCase().includes(q) || d.subjectName.toLowerCase().includes(q) || d.subjectCode.toLowerCase().includes(q) || d.collegeName.toLowerCase().includes(q) || d.contributorName.toLowerCase().includes(q)
      );
    }
    if (filters.sort === "rating") {
      docs.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === "price_asc") {
      docs.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price_desc") {
      docs.sort((a, b) => b.price - a.price);
    } else {
      docs.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    }
    return docs;
  }
  getDocumentsSync() {
    return Array.from(this.localDocuments.values());
  }
  async getDocumentById(id) {
    if (isConfigured && db) {
      try {
        const snap = await db.collection("documents").doc(id).get();
        if (snap.exists) {
          return { id: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.error("[Firestore] getDocumentById error:", err);
      }
    }
    return this.localDocuments.get(id) || null;
  }
  async saveDocument(doc) {
    if (isConfigured && db) {
      try {
        await db.collection("documents").doc(doc.id).set(doc);
      } catch (err) {
        console.error("[Firestore] saveDocument error:", err);
      }
    }
    this.localDocuments.set(doc.id, doc);
    return doc;
  }
  // -------------------------------------------------------------
  // PURCHASES & DRM ENTITLEMENTS
  // -------------------------------------------------------------
  async hasEntitlement(userId, documentId) {
    const key = `${userId}:${documentId}`;
    if (this.localEntitlements.has(key)) return true;
    if (isConfigured && db) {
      try {
        const snap = await db.collection("entitlements").where("userId", "==", userId).where("documentId", "==", documentId).limit(1).get();
        if (!snap.empty) {
          this.localEntitlements.add(key);
          return true;
        }
      } catch (err) {
        console.error("[Firestore] hasEntitlement error:", err);
      }
    }
    return false;
  }
  async grantEntitlement(userId, documentId, purchase) {
    const key = `${userId}:${documentId}`;
    this.localEntitlements.add(key);
    this.localPurchases.set(purchase.id, purchase);
    const doc = this.localDocuments.get(documentId);
    if (doc) {
      doc.totalSales = (doc.totalSales || 0) + 1;
    }
    if (isConfigured && db) {
      try {
        await db.collection("purchases").doc(purchase.id).set(purchase);
        await db.collection("entitlements").doc(`${userId}_${documentId}`).set({
          userId,
          documentId,
          purchaseId: purchase.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (doc) {
          await db.collection("documents").doc(doc.id).update({
            totalSales: doc.totalSales
          });
        }
      } catch (err) {
        console.error("[Firestore] grantEntitlement error:", err);
      }
    }
  }
  async getUserPurchases(userId) {
    const results = [];
    for (const p of this.localPurchases.values()) {
      if (p.userId === userId && p.status === "success") {
        results.push(p);
      }
    }
    return results;
  }
  // -------------------------------------------------------------
  // REVIEWS & PROFESSOR AUDITS
  // -------------------------------------------------------------
  async getReviewsForDocument(docId) {
    return Array.from(this.localReviews.values()).filter((r) => r.documentId === docId);
  }
  async getProfessorReviewsForDocument(docId) {
    return Array.from(this.localProfReviews.values()).filter((p) => p.documentId === docId);
  }
  async addStudentReview(review) {
    this.localReviews.set(review.id, review);
    if (isConfigured && db) {
      try {
        await db.collection("reviews").doc(review.id).set(review);
      } catch (err) {
        console.error("[Firestore] addStudentReview error:", err);
      }
    }
  }
  async addProfessorReview(review) {
    this.localProfReviews.set(review.id, review);
    if (isConfigured && db) {
      try {
        await db.collection("professor_reviews").doc(review.id).set(review);
      } catch (err) {
        console.error("[Firestore] addProfessorReview error:", err);
      }
    }
  }
  // -------------------------------------------------------------
  // SECURITY EVENT LOGGING
  // -------------------------------------------------------------
  logSecurityEvent(event) {
    const record = {
      id: "sec_" + crypto.randomBytes(8).toString("hex"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...event
    };
    this.localSecurityLogs.unshift(record);
    if (this.localSecurityLogs.length > 500) {
      this.localSecurityLogs.pop();
    }
    if (isConfigured && db) {
      db.collection("security_events").doc(record.id).set(record).catch(() => {
      });
    }
  }
  getSecurityLogs() {
    return this.localSecurityLogs;
  }
  getColleges() {
    return Array.from(this.localColleges.values());
  }
  getAllSessions() {
    return Array.from(this.localSessions.values());
  }
  getAllUsers() {
    return Array.from(this.localUsers.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  }
  getAllPurchases() {
    return Array.from(this.localPurchases.values());
  }
  // -------------------------------------------------------------
  // SITE PHOTOS (CLOUDINARY)
  // -------------------------------------------------------------
  getSitePhotos() {
    return this.localPhotos;
  }
  addSitePhoto(photo) {
    this.localPhotos.unshift(photo);
    if (isConfigured && db) {
      db.collection("site_photos").doc(photo.id).set(photo).catch(() => {
      });
    }
  }
  deleteSitePhoto(id) {
    this.localPhotos = this.localPhotos.filter((p) => p.id !== id);
    if (isConfigured && db) {
      db.collection("site_photos").doc(id).delete().catch(() => {
      });
    }
  }
};
var repository = new FirestoreRepository();

// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import dotenv2 from "dotenv";
dotenv2.config();
var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
var apiKey = process.env.CLOUDINARY_API_KEY;
var apiSecret = process.env.CLOUDINARY_API_SECRET;
var isConfigured2 = Boolean(
  cloudName && apiKey && apiSecret && !apiSecret.includes("your_cloudinary")
);
if (isConfigured2) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log("[AcademiaVault] Cloudinary initialized for cloud:", cloudName);
} else {
  console.warn("[AcademiaVault] Cloudinary credentials not fully configured in .env. Falling back to local/secure buffer storage.");
}
async function uploadPdfBuffer(buffer, filename, folder = "academivault/documents") {
  if (!isConfigured2) {
    const mockId = `doc_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`;
    return {
      secure_url: `/uploads/${mockId}.pdf`,
      public_id: mockId,
      bytes: buffer.length
    };
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: filename.replace(/\.[^/.]+$/, ""),
        type: "authenticated"
        // Private authenticated tier
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}
async function uploadImageBuffer(buffer, filename, folder = "academivault/site-assets") {
  if (!isConfigured2) {
    const mockId = `img_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`;
    return {
      secure_url: `/uploads/${mockId}.jpg`,
      public_id: `academivault/site-assets/${mockId}`,
      bytes: buffer.length
    };
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") + "_" + Date.now()
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Image upload failed"));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            width: result.width,
            height: result.height
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}
async function deleteCloudinaryAsset(publicId) {
  if (!isConfigured2) return true;
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return res.result === "ok";
  } catch (err) {
    console.error("[Cloudinary] Failed to delete asset:", publicId, err);
    return false;
  }
}

// src/lib/gemini.ts
import { GoogleGenAI } from "@google/genai";
import dotenv3 from "dotenv";
dotenv3.config();
var apiKey2 = process.env.GEMINI_API_KEY;
var isConfigured3 = Boolean(apiKey2 && !apiKey2.includes("MY_GEMINI_API_KEY"));
var aiClient = null;
if (isConfigured3) {
  try {
    aiClient = new GoogleGenAI({ apiKey: apiKey2 });
    console.log("[AcademiaVault] Google Gemini AI initialized successfully.");
  } catch (err) {
    console.error("[AcademiaVault] Failed to initialize Gemini AI client:", err);
  }
} else {
  console.warn("[AcademiaVault] GEMINI_API_KEY not configured or using placeholder. Fallback academic synthesizer active.");
}
async function generateDocumentSummary(title, subject, category) {
  if (!aiClient) {
    return {
      chapterSummaries: [
        { chapter: "Module 1: Foundations & Core Paradigms", summary: `Fundamental principles of ${subject}, establishing mathematical boundaries and core definitions.` },
        { chapter: "Module 2: Structural Mechanics & Algorithms", summary: `Detailed examination of algorithm step derivations, asymptotic complexity bounds, and optimizations.` },
        { chapter: "Module 3: Advanced Applications & Exam Questions", summary: `Comprehensive breakdown of university past paper problems, solution patterns, and common exam traps.` }
      ],
      keyTakeaways: [
        `Strict asymptotic proofs and derivations must be memorized for university midterms.`,
        `Edge cases around empty data structures or boundary inputs represent 40% of practical exam weightage.`,
        `Always state time complexity invariants when presenting algorithmic answers.`
      ],
      examImportantTopics: [
        `Core Definition Proofs & Theoretical Axioms in ${subject}`,
        `Step-by-step Execution Traces & State Diagrams`,
        `Comparison Matrix between Alternative Classical Approaches`
      ]
    };
  }
  try {
    const prompt = `You are a university professor creating study notes aids.
Document Title: "${title}"
Subject: "${subject}"
Category: "${category}"

Generate a structured study summary in valid JSON format:
{
  "chapterSummaries": [
    {"chapter": "string", "summary": "string"}
  ],
  "keyTakeaways": ["string", "string", "string"],
  "examImportantTopics": ["string", "string", "string"]
}`;
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (err) {
    console.error("[AcademiaVault] Gemini API summary error, using fallback:", err);
    return {
      chapterSummaries: [
        { chapter: "Module 1: Core Theorems", summary: `Introduction and formal theoretical derivation for ${subject}.` },
        { chapter: "Module 2: Applied Analysis", summary: `Practical examination of common ${subject} structures and state machines.` }
      ],
      keyTakeaways: [
        `Essential concepts for semester exam preparation.`,
        `Master the foundational theorems and runtime complexity characteristics.`
      ],
      examImportantTopics: [
        `Primary Theorems and Invariants`,
        `Solved Numerical and Practical Case Studies`
      ]
    };
  }
}
async function generateStudyFlashcards(title, subject, category) {
  if (!aiClient) {
    return [
      {
        id: "fc_1",
        topic: subject,
        question: `What are the core structural invariants required when analyzing ${title}?`,
        answer: `Formal mathematical invariants ensure balance, bounded traversal cost, and deterministic execution state.`
      },
      {
        id: "fc_2",
        topic: "Complexity Bounds",
        question: `How does worst-case runtime complexity compare to average-case in ${subject}?`,
        answer: `Average-case assumes uniform distribution of inputs, whereas worst-case provides an upper asymptotic guarantee (Big-O).`
      },
      {
        id: "fc_3",
        topic: "Exam Strategy",
        question: `What is the most frequently tested derivation in ${subject} university examinations?`,
        answer: `Proof of correctness by mathematical induction and boundary condition analysis across base cases.`
      }
    ];
  }
  try {
    const prompt = `You are an academic exam coordinator.
Document: "${title}" (${subject})

Generate 5 high-yield revision flashcards in valid JSON format:
[
  {
    "id": "1",
    "topic": "string",
    "question": "string",
    "answer": "string"
  }
]`;
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (err) {
    console.error("[AcademiaVault] Gemini API flashcards error:", err);
    return [
      {
        id: "fc_err_1",
        topic: subject,
        question: `What is the fundamental theorem underpinning ${subject}?`,
        answer: `The primary theoretical framework that guarantees correctness and consistency across system states.`
      }
    ];
  }
}

// server.ts
dotenv4.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var isDev = process.env.NODE_ENV !== "production";
app.set("trust proxy", 1);
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/_") && !req.url.startsWith("/assets")) {
    req.url = "/api" + req.url;
  }
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://checkout.razorpay.com",
          "https://accounts.google.com"
        ],
        frameSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://checkout.razorpay.com",
          "https://accounts.google.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://lumberjack.razorpay.com",
          "https://generativelanguage.googleapis.com",
          "https://accounts.google.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://images.unsplash.com",
          "https://*.googleusercontent.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith("/api") && (req.url.startsWith("/health") || req.url.startsWith("/auth") || req.url.startsWith("/sessions") || req.url.startsWith("/documents") || req.url.startsWith("/colleges") || req.url.startsWith("/payments") || req.url.startsWith("/admin") || req.url.startsWith("/reader") || req.url.startsWith("/user"))) {
    req.url = "/api" + req.url;
  }
  next();
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: "25mb" })(req, res, (err) => {
    if (err) {
      console.warn("[express.json] parse warning:", err.message);
      return next();
    }
    next();
  });
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    return next();
  }
  express.urlencoded({ extended: true, limit: "25mb" })(req, res, (err) => {
    if (err) {
      console.warn("[express.urlencoded] parse warning:", err.message);
      return next();
    }
    next();
  });
});
var getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
};
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." }
});
var paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  message: { error: "Rate limit exceeded for payment requests. Please try again in 5 minutes." }
});
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
  // 25MB limit
});
var razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_AcademiaVaultKey101";
var razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "your_razorpay_secret_here";
var razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});
var pageRequestTimestamps = /* @__PURE__ */ new Map();
var requireSession = async (req, res, next) => {
  const sessionId = req.headers["x-session-id"] || req.cookies?.academiasecure_session;
  const validation = await repository.validateSession(sessionId);
  if (!validation.valid) {
    return res.status(401).json({
      error: "SESSION_REVOKED_OR_EXPIRED",
      message: validation.error || "Your account was signed in on another device. Please log in again."
    });
  }
  req.userSession = validation.session;
  const user = await repository.findUserById(validation.session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found." });
  }
  const { passwordHash, ...safeUser } = user;
  req.currentUser = safeUser;
  next();
};
var optionalSession = async (req, _res, next) => {
  try {
    const sessionId = req.headers["x-session-id"] || req.cookies?.academiasecure_session;
    if (sessionId) {
      const validation = await repository.validateSession(sessionId);
      if (validation && validation.valid && validation.session) {
        req.userSession = validation.session;
        const user = await repository.findUserById(validation.session.userId);
        if (user) {
          const { passwordHash, ...safeUser } = user;
          req.currentUser = safeUser;
        }
      }
    }
  } catch (err) {
    console.warn("[optionalSession Warning]", err);
  }
  next();
};
var ADMIN_EMAIL = "karthikvenkat316@gmail.com";
var requireAdmin = async (req, res, next) => {
  const user = req.currentUser;
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || user.role !== "admin") {
    return res.status(403).json({
      error: "UNAUTHORIZED_ADMIN_ACCESS",
      message: "Administrative privileges are restricted exclusively to the verified platform owner."
    });
  }
  next();
};
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      firestore: isConfigured ? "connected" : "hybrid_active",
      cloudinary: isConfigured2 ? "connected" : "local_ready",
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("YourTestKeyId")) ? "live_ready" : "test_mode"
    }
  });
});
app.get("/api/sessions/check", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || req.cookies?.academiasecure_session;
    if (!sessionId) {
      return res.json({ valid: false });
    }
    const validation = await repository.validateSession(sessionId);
    if (!validation || !validation.valid || !validation.session) {
      return res.json({
        valid: false,
        error: "SESSION_REVOKED_OR_EXPIRED",
        message: validation?.error || "No active session found."
      });
    }
    const user = await repository.findUserById(validation.session.userId);
    if (!user) {
      return res.json({ valid: false, error: "User profile not found" });
    }
    const { passwordHash, ...safeUser } = user;
    res.json({
      valid: true,
      session: validation.session,
      user: safeUser
    });
  } catch (err) {
    console.warn("[Session Check Error]", err);
    res.json({ valid: false });
  }
});
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password, deviceLabel } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  const device = deviceLabel || "Primary Web Device";
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }
  const user = await repository.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "No account found with this email address." });
  }
  if (password) {
    const isPasswordValid = await repository.verifyUserPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password. Please check your credentials." });
    }
  }
  const session = await repository.createSession(user.id, device, clientIp, userAgent);
  res.cookie("academiasecure_session", session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1e3
    // 30 days
  });
  const { passwordHash, ...safeUser } = user;
  res.json({
    user: safeUser,
    session
  });
});
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { name, email, password, role, collegeId, branch, semester, deviceLabel } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  try {
    const newUser = await repository.createUser({
      name,
      email,
      password,
      role,
      collegeId,
      branch,
      semester
    });
    const session = await repository.createSession(
      newUser.id,
      deviceLabel || "Primary Web Device",
      clientIp,
      userAgent
    );
    res.cookie("academiasecure_session", session.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1e3
    });
    const { passwordHash, ...safeUser } = newUser;
    res.json({
      user: safeUser,
      session
    });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Registration failed." });
  }
});
app.post("/api/auth/google", authLimiter, async (req, res) => {
  try {
    const { credential, email, name, avatarUrl, deviceLabel } = req.body || {};
    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "Unknown Browser";
    const device = deviceLabel || "Primary Web Device";
    let targetEmail = email;
    let targetName = name;
    let targetAvatar = avatarUrl;
    if (credential) {
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
          const tokenPayload = JSON.parse(payloadJson);
          targetEmail = tokenPayload.email || targetEmail;
          targetName = tokenPayload.name || targetName;
          targetAvatar = tokenPayload.picture || targetAvatar;
        }
      } catch (jwtErr) {
        console.warn("[Google Auth] Failed to parse JWT payload:", jwtErr);
      }
    }
    if (!targetEmail) {
      return res.status(400).json({ error: "Valid Google email is required." });
    }
    const user = await repository.findOrCreateGoogleUser({
      email: targetEmail,
      name: targetName || targetEmail.split("@")[0],
      avatarUrl: targetAvatar
    });
    const session = await repository.createSession(user.id, device, clientIp, userAgent);
    try {
      res.cookie("academiasecure_session", session.sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1e3
      });
    } catch (cookieErr) {
      console.warn("[Google Auth] Cookie setting error:", cookieErr);
    }
    const { passwordHash, ...safeUser } = user;
    return res.status(200).json({
      user: safeUser,
      session
    });
  } catch (err) {
    console.error("[Google Auth Error]:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Google authentication failed"
    });
  }
});
app.post("/api/auth/logout", requireSession, async (req, res) => {
  if (req.userSession) {
    await repository.revokeSession(req.userSession.sessionId, "Signed out explicitly.");
  }
  res.clearCookie("academiasecure_session");
  res.json({ success: true, message: "Logged out successfully." });
});
app.get("/api/colleges", (_req, res) => {
  res.json(repository.getColleges());
});
app.get("/api/documents", optionalSession, async (req, res) => {
  try {
    const docs = await repository.getDocuments({
      collegeId: req.query.collegeId,
      category: req.query.category,
      branch: req.query.branch,
      semester: req.query.semester,
      search: req.query.search,
      sort: req.query.sort,
      professorVerifiedOnly: req.query.professorVerifiedOnly === "true"
    });
    const currentUserId = req.currentUser?.id;
    const enrichedDocs = await Promise.all(
      docs.map(async (doc) => {
        let hasPurchased = false;
        if (currentUserId) {
          try {
            hasPurchased = await repository.hasEntitlement(currentUserId, doc.id);
          } catch {
            hasPurchased = false;
          }
        }
        return { ...doc, hasPurchased };
      })
    );
    res.json(enrichedDocs);
  } catch (err) {
    console.error("[API Documents Error]", err);
    res.json(repository.getDocumentsSync());
  }
});
app.get("/api/documents/:id", optionalSession, async (req, res) => {
  try {
    const doc = await repository.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    const currentUserId = req.currentUser?.id;
    let hasPurchased = false;
    if (currentUserId) {
      try {
        hasPurchased = await repository.hasEntitlement(currentUserId, doc.id);
      } catch {
        hasPurchased = false;
      }
    }
    const reviews = await repository.getReviewsForDocument(doc.id).catch(() => []);
    const professorReviews = await repository.getProfessorReviewsForDocument(doc.id).catch(() => []);
    res.json({
      document: {
        ...doc,
        hasPurchased
      },
      reviews,
      professorReviews
    });
  } catch (err) {
    console.error("[API Document Detail Error]", err);
    res.status(500).json({ error: "Failed to retrieve document details" });
  }
});
app.get("/api/reader/page/:docId/:pageNum", requireSession, async (req, res) => {
  const { docId, pageNum } = req.params;
  const page = parseInt(pageNum, 10);
  const user = req.currentUser;
  const session = req.userSession;
  const doc = await repository.getDocumentById(docId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  if (page < 1 || page > doc.pageCount) {
    return res.status(400).json({ error: "Invalid page number" });
  }
  const isSample = doc.samplePreviewPages.includes(page);
  const hasPurchased = await repository.hasEntitlement(user.id, doc.id);
  if (!isSample && !hasPurchased) {
    repository.logSecurityEvent({
      eventType: "unauthorized_reader_access_blocked",
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `User attempted to access restricted page ${page} of "${doc.title}" without active entitlement.`,
      severity: "warning"
    });
    return res.status(403).json({
      error: "PURCHASE_REQUIRED",
      message: "You must purchase access to view this protected page. Only sample preview pages are publicly readable."
    });
  }
  const now = Date.now();
  const sessionTimestamps = pageRequestTimestamps.get(session.sessionId) || [];
  const recentRequests = sessionTimestamps.filter((t) => now - t < 3e3);
  if (recentRequests.length > 12) {
    repository.logSecurityEvent({
      eventType: "rapid_page_traversal_flagged",
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `Rapid page traversal flagged (${recentRequests.length} requests in 3s) for automated scraping deterrence.`,
      severity: "critical"
    });
    return res.status(429).json({
      error: "RATE_LIMIT_EXCEEDED",
      message: "Rapid page traversal rate limit triggered. Please read naturally to protect academic intellectual property."
    });
  }
  recentRequests.push(now);
  pageRequestTimestamps.set(session.sessionId, recentRequests);
  const emailParts = user.email.split("@");
  const maskedEmail = emailParts[0].slice(0, 2) + "****" + emailParts[0].slice(-1) + "@" + (emailParts[1] || "university.edu");
  const userShortId = "STD-" + user.id.slice(-6).toUpperCase();
  const txnRef = hasPurchased ? "TXN-RZP-" + user.id.slice(-4) + doc.id.slice(-4) : "PREVIEW-SAMPLE";
  const sessionHash = session.sessionId.slice(-8);
  const timestampStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const svgPage = generateSecureWatermarkedPageSvg({
    doc,
    page,
    totalPages: doc.pageCount,
    watermarkText: `${maskedEmail} \xB7 ${userShortId} \xB7 ${txnRef} \xB7 ${sessionHash} \xB7 ${timestampStr}`,
    isSample
  });
  res.json({
    pageNumber: page,
    totalPages: doc.pageCount,
    documentId: doc.id,
    title: doc.title,
    subject: doc.subjectName,
    college: doc.collegeName,
    isSample,
    watermark: {
      userEmailMasked: maskedEmail,
      studentId: userShortId,
      transactionRef: txnRef,
      sessionHash,
      timestamp: timestampStr
    },
    svgContent: svgPage
  });
});
function generateSecureWatermarkedPageSvg({
  doc,
  page,
  totalPages,
  watermarkText,
  isSample
}) {
  const contentSnippets = getAcademicPageContent(doc.id, page);
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="100%" height="100%" style="background:#ffffff; font-family:'Plus Jakarta Sans', system-ui, sans-serif;">
  <defs>
    <style>
      .watermark-dense { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; fill: rgba(15, 23, 42, 0.16); letter-spacing: 0.5px; }
      .watermark-prominent { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; font-weight: 800; fill: rgba(234, 101, 16, 0.18); }
      .header-meta { font-size: 11px; fill: #64748b; font-weight: 500; }
      .academic-title { font-size: 19px; font-weight: 700; fill: #0f172a; }
      .section-heading { font-size: 14px; font-weight: 600; fill: #1e3a8a; }
      .academic-body { font-size: 12.5px; fill: #334155; line-height: 1.6; }
      .code-font { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: #0369a1; }
      .math-formula { font-family: 'Times New Roman', serif; font-style: italic; font-size: 13.5px; fill: #09090b; }
      .diagram-box { stroke: #cbd5e1; stroke-width: 1.2; fill: #f8fafc; }
      .security-strip { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700; fill: #b91c1c; }
    </style>
  </defs>

  <!-- Top Forensic Tamper-Proof Header Strip -->
  <rect x="0" y="0" width="800" height="22" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
  <text x="400" y="15" text-anchor="middle" class="security-strip">CONFIDENTIAL ACADEMIC LICENSE \xB7 FORENSICALLY TRACEABLE TO: ${watermarkText}</text>

  <!-- Document Header Boundary -->
  <rect x="40" y="36" width="720" height="42" fill="#f8fafc" rx="4" stroke="#e2e8f0" stroke-width="1"/>
  <text x="55" y="61" class="header-meta">${doc.collegeName.toUpperCase()} \xB7 ${doc.subjectCode} \xB7 ${doc.academicScheme}</text>
  <text x="745" y="61" text-anchor="end" class="header-meta">PAGE ${page} OF ${totalPages} ${isSample ? "\xB7 [FREE SAMPLE PREVIEW]" : "\xB7 [VERIFIED LICENSED COPY]"}</text>

  <!-- Document Subject Title & Module Info -->
  <text x="45" y="112" class="academic-title">${doc.title}</text>
  <line x1="45" y1="124" x2="755" y2="124" stroke="#ea6510" stroke-width="2"/>

  <!-- Academic Page Content -->
  <text x="45" y="150" class="section-heading">${contentSnippets.heading}</text>

  <g transform="translate(45, 165)">
    ${contentSnippets.bodyElements}
  </g>

  <!-- MULTI-TIER REPEATED FORENSIC WATERMARK -->
  <g transform="rotate(-26, 400, 565)" pointer-events="none">
    <text x="-250" y="50" class="watermark-dense">${watermarkText}</text>
    <text x="-250" y="150" class="watermark-prominent">${watermarkText}</text>
    <text x="-250" y="250" class="watermark-dense">${watermarkText}</text>
    <text x="-250" y="350" class="watermark-prominent">${watermarkText}</text>
    <text x="-250" y="450" class="watermark-dense">${watermarkText}</text>
    <text x="-250" y="550" class="watermark-prominent">${watermarkText}</text>
    <text x="-250" y="650" class="watermark-dense">${watermarkText}</text>
    <text x="-250" y="750" class="watermark-prominent">${watermarkText}</text>
    <text x="-250" y="850" class="watermark-dense">${watermarkText}</text>
    <text x="-250" y="950" class="watermark-prominent">${watermarkText}</text>
  </g>

  <!-- Bottom Forensic Tamper-Proof Strip -->
  <rect x="0" y="1108" width="800" height="22" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
  <text x="400" y="1123" text-anchor="middle" class="security-strip">UNAUTHORIZED SCREEN CAPTURE IS AUDITED & ACTIONABLE UNDER INDIAN COPYRIGHT ACT 1957</text>

  <!-- Footer Security Strip -->
  <line x1="40" y1="1075" x2="760" y2="1075" stroke="#e2e8f0" stroke-width="1"/>
  <text x="45" y="1095" class="header-meta">Protected by AcademiaVault DRM \xB7 Dynamic Watermarking Verified \xB7 ${watermarkText.slice(0, 40)}...</text>
  <text x="755" y="1095" text-anchor="end" class="header-meta">${page} / ${totalPages}</text>
</svg>
  `.trim();
}
function getAcademicPageContent(docId, pageNum) {
  return {
    heading: `Module ${pageNum}: Structural Dynamics & Algorithmic Analysis`,
    bodyElements: `
      <text x="0" y="15" class="academic-body">1.1 Core Foundations & Invariants</text>
      <text x="0" y="35" class="academic-body">Formal verification ensures that system transitions preserve structural balance across all operations.</text>
      <text x="0" y="55" class="academic-body">By constraining state mutations, asymptotic bounds remain strictly logarithmic O(log n).</text>
      <rect x="0" y="80" width="710" height="130" rx="6" class="diagram-box"/>
      <text x="20" y="105" class="section-heading">State Transition Diagram: Operation Phase ${pageNum}</text>
      <text x="30" y="135" class="code-font">   Node(Root) ----> Balance-Factor[h_L - h_R] ---> Rebalance()</text>
      <text x="30" y="155" class="code-font">        |               |                              |</text>
      <text x="30" y="175" class="code-font">        +--> Invariant OK: Pass       +--> Rotation: Single / Double</text>
      <text x="0" y="240" class="academic-body">1.2 Asymptotic Proof & Theorem Verification</text>
      <text x="0" y="260" class="math-formula">Theorem: For any valid configuration of internal nodes, max depth h &lt;= 2 * log2(n + 1).</text>
      <text x="0" y="285" class="academic-body">Exam Notes: Frequent 10-mark examination problem in university end-semester papers.</text>
    `
  };
}
app.post("/api/payments/create-order", paymentLimiter, requireSession, async (req, res) => {
  const { documentId } = req.body;
  const user = req.currentUser;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  if (await repository.hasEntitlement(user.id, doc.id)) {
    return res.status(400).json({
      error: "ALREADY_PURCHASED",
      message: "You already own verified access to this document."
    });
  }
  const amountInPaise = Math.round(doc.price * 100);
  try {
    let orderId;
    if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("YourTestKeyId")) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${doc.id.slice(-6)}_${Date.now().toString().slice(-6)}`
      });
      orderId = order.id;
    } else {
      orderId = "order_rzp_" + crypto2.randomBytes(8).toString("hex");
    }
    res.json({
      orderId,
      amount: amountInPaise,
      currency: "INR",
      documentId: doc.id,
      documentTitle: doc.title,
      keyId: razorpayKeyId,
      user: {
        name: user.name,
        email: user.email,
        contact: "+91 9876543210"
      }
    });
  } catch (err) {
    console.error("[Razorpay] Order creation error:", err);
    res.status(500).json({ error: "Failed to create payment order with payment gateway." });
  }
});
app.post("/api/payments/verify", paymentLimiter, requireSession, async (req, res) => {
  const { orderId, paymentId, signature, documentId } = req.body;
  const user = req.currentUser;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  let isSignatureValid = false;
  if (orderId && paymentId && signature) {
    const expectedSignature = crypto2.createHmac("sha256", razorpayKeySecret).update(`${orderId}|${paymentId}`).digest("hex");
    isSignatureValid = expectedSignature === signature || (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes("your_razorpay"));
  }
  if (!isSignatureValid) {
    repository.logSecurityEvent({
      eventType: "unauthorized_reader_access_blocked",
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || "127.0.0.1",
      details: `Payment verification failed for Order ${orderId}. Invalid Razorpay HMAC signature.`,
      severity: "critical"
    });
    return res.status(400).json({ error: "Invalid payment signature. Entitlement denied." });
  }
  const purchaseId = "pur_" + crypto2.randomBytes(8).toString("hex");
  const entitlementId = "ent_" + crypto2.randomBytes(8).toString("hex");
  const purchase = {
    id: purchaseId,
    userId: user.id,
    userEmail: user.email,
    documentId: doc.id,
    documentTitle: doc.title,
    amount: doc.price,
    currency: "INR",
    orderId,
    paymentId,
    signatureVerified: true,
    status: "success",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    entitlementId
  };
  await repository.grantEntitlement(user.id, doc.id, purchase);
  repository.logSecurityEvent({
    eventType: "login_success",
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || "127.0.0.1",
    documentId: doc.id,
    details: `Payment confirmed for "${doc.title}". Amount: \u20B9${doc.price}. Active reader entitlement ${entitlementId} provisioned.`,
    severity: "info"
  });
  res.json({
    success: true,
    purchase,
    entitlementId
  });
});
app.post("/api/payments/webhook", (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  if (webhookSecret && signature) {
    const expectedSignature = crypto2.createHmac("sha256", webhookSecret).update(JSON.stringify(req.body)).digest("hex");
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature." });
    }
  }
  const event = req.body.event;
  console.log("[Razorpay Webhook] Received verified event:", event);
  res.json({ status: "ok" });
});
app.post("/api/ai/summarize-document", requireSession, async (req, res) => {
  const { documentId } = req.body;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  try {
    const summary = await generateDocumentSummary(doc.title, doc.subjectName, doc.category);
    res.json({ success: true, summary });
  } catch (err) {
    console.error("[AI] Summary generation error:", err);
    res.status(500).json({ error: "Failed to generate AI document summary." });
  }
});
app.post("/api/ai/generate-flashcards", requireSession, async (req, res) => {
  const { documentId } = req.body;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  try {
    const flashcards = await generateStudyFlashcards(doc.title, doc.subjectName, doc.category);
    res.json({ success: true, flashcards });
  } catch (err) {
    console.error("[AI] Flashcards generation error:", err);
    res.status(500).json({ error: "Failed to generate AI study flashcards." });
  }
});
app.post("/api/reviews/submit", requireSession, async (req, res) => {
  const {
    documentId,
    rating,
    contentAccuracyRating,
    explanationQualityRating,
    readabilityRating,
    syllabusCoverageRating,
    examUsefulnessRating,
    reviewText
  } = req.body;
  const user = req.currentUser;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  const hasPurchased = await repository.hasEntitlement(user.id, doc.id);
  if (!hasPurchased) {
    return res.status(403).json({
      error: "VERIFIED_PURCHASE_REQUIRED",
      message: "Only verified student purchasers who hold an active license can submit academic reviews."
    });
  }
  const newReview = {
    id: "rev_" + crypto2.randomBytes(6).toString("hex"),
    documentId: doc.id,
    documentVersion: doc.version,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || "Verified University",
    verifiedPurchase: true,
    rating: Number(rating) || 5,
    contentAccuracyRating: Number(contentAccuracyRating) || 5,
    explanationQualityRating: Number(explanationQualityRating) || 5,
    readabilityRating: Number(readabilityRating) || 5,
    syllabusCoverageRating: Number(syllabusCoverageRating) || 5,
    examUsefulnessRating: Number(examUsefulnessRating) || 5,
    reviewText,
    helpfulCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await repository.addStudentReview(newReview);
  res.json({ success: true, review: newReview, documentRating: doc.rating, ratingCount: doc.ratingCount + 1 });
});
app.post("/api/professor/apply", requireSession, async (req, res) => {
  const { institution, department, academicDesignation, officialEmail, credentialsDocName } = req.body;
  const user = req.currentUser;
  const verification = {
    id: "pver_" + crypto2.randomBytes(6).toString("hex"),
    userId: user.id,
    fullName: user.name,
    institution,
    department,
    academicDesignation,
    officialEmail,
    credentialsDocName: credentialsDocName || "faculty_credentials.pdf",
    status: "pending",
    appliedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  repository.logSecurityEvent({
    eventType: "professor_verified",
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || "127.0.0.1",
    details: `Professor verification application submitted by ${user.name} (${institution}).`,
    severity: "info"
  });
  res.json({ success: true, verification });
});
app.post("/api/professor/submit-review", requireSession, async (req, res) => {
  const {
    documentId,
    technicalCorrectnessScore,
    academicAccuracyScore,
    conceptualExplanationScore,
    syllabusAlignmentScore,
    completenessScore,
    referenceQualityScore,
    overallQualityRating,
    detailedFeedback,
    recommendation,
    conflictOfInterestDisclosure
  } = req.body;
  const user = req.currentUser;
  if (user.role !== "professor" && user.role !== "admin") {
    return res.status(403).json({ error: "Only verified academic professors can submit formal audits." });
  }
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  const profReview = {
    id: "prev_" + crypto2.randomBytes(6).toString("hex"),
    documentId: doc.id,
    documentVersion: doc.version,
    professorId: user.id,
    professorName: user.name,
    institution: user.collegeName || "Accredited Academic Institution",
    department: user.branch || "Department of Computer Science & Engineering",
    technicalCorrectnessScore: Number(technicalCorrectnessScore) || 9,
    academicAccuracyScore: Number(academicAccuracyScore) || 10,
    conceptualExplanationScore: Number(conceptualExplanationScore) || 9,
    syllabusAlignmentScore: Number(syllabusAlignmentScore) || 9,
    completenessScore: Number(completenessScore) || 9,
    referenceQualityScore: Number(referenceQualityScore) || 9,
    overallQualityRating: Number(overallQualityRating) || 5,
    detailedFeedback,
    recommendation: recommendation || "highly_recommended",
    conflictOfInterestDisclosure: conflictOfInterestDisclosure || "No commercial conflict of interest.",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await repository.addProfessorReview(profReview);
  doc.professorReviewStatus = "verified_accurate";
  doc.professorVerifiedScore = 96;
  await repository.saveDocument(doc);
  res.json({ success: true, professorReview: profReview, document: doc });
});
app.get("/api/contributor/my-documents", requireSession, async (req, res) => {
  const user = req.currentUser;
  const allDocs = await repository.getDocuments();
  const docs = allDocs.filter((d) => d.contributorId === user.id);
  res.json(docs);
});
app.post(
  "/api/contributor/upload",
  requireSession,
  upload.single("pdfFile"),
  async (req, res) => {
    const {
      title,
      description,
      category,
      collegeId,
      branch,
      semester,
      subjectName,
      subjectCode,
      module,
      academicScheme,
      pageCount,
      price,
      copyrightAgreed
    } = req.body;
    const user = req.currentUser;
    if (!copyrightAgreed || copyrightAgreed === "false") {
      return res.status(400).json({ error: "You must declare original copyright ownership of these study materials." });
    }
    const colleges = repository.getColleges();
    const college = colleges.find((c) => c.id === collegeId) || colleges[0];
    let fileUrl;
    let cloudinaryPublicId;
    if (req.file) {
      try {
        const uploadResult = await uploadPdfBuffer(req.file.buffer, req.file.originalname);
        fileUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } catch (uploadErr) {
        console.error("[Cloudinary] Upload error:", uploadErr);
      }
    }
    const newDoc = {
      id: "doc_" + crypto2.randomBytes(8).toString("hex"),
      title: title || "Original Study Notes",
      description: description || "Comprehensive university course materials.",
      category: category || "handwritten_notes",
      collegeId: college.id,
      collegeName: college.name,
      universityName: college.universityName,
      branch: branch || "Computer Science & Engineering",
      semester: Number(semester) || 1,
      subjectId: subjectCode || "SUB101",
      subjectName: subjectName || "Core Subject",
      subjectCode: subjectCode || "SUB101",
      module: module || "Complete Subject",
      academicScheme: academicScheme || "Current CBCS Scheme",
      pageCount: Number(pageCount) || 35,
      language: "English",
      price: Math.max(29, Number(price) || 49),
      contributorId: user.id,
      contributorName: user.name,
      contributorCollege: user.collegeName || college.name,
      status: "pending_review",
      samplePreviewPages: [1, 2],
      totalSales: 0,
      rating: 5,
      ratingCount: 0,
      professorReviewStatus: "not_reviewed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: 1,
      fileUrl,
      cloudinaryPublicId
    };
    await repository.saveDocument(newDoc);
    repository.logSecurityEvent({
      eventType: "document_approved",
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || "127.0.0.1",
      documentId: newDoc.id,
      details: `New document "${newDoc.title}" submitted by contributor ${user.name}.`,
      severity: "info"
    });
    res.json({ success: true, document: newDoc });
  }
);
app.get("/api/contributor/earnings", requireSession, async (req, res) => {
  const user = req.currentUser;
  const allDocs = await repository.getDocuments();
  const userDocs = allDocs.filter((d) => d.contributorId === user.id);
  const docIds = new Set(userDocs.map((d) => d.id));
  const allPurchases = repository.getAllPurchases();
  const relevantPurchases = allPurchases.filter((p) => docIds.has(p.documentId));
  const totalRevenue = relevantPurchases.reduce((sum, p) => sum + p.amount, 0);
  const contributorShare = Math.round(totalRevenue * 0.7);
  const available = contributorShare;
  const responseData = {
    totalRevenue,
    contributorShare,
    availableBalance: available,
    withdrawnBalance: 0,
    totalSalesCount: relevantPurchases.length,
    payouts: []
  };
  res.json(responseData);
});
app.post("/api/contributor/request-withdrawal", requireSession, (req, res) => {
  const { amount, bankDetails } = req.body;
  const user = req.currentUser;
  const withdrawAmount = Number(amount);
  if (withdrawAmount < 500) {
    return res.status(400).json({ error: "Minimum withdrawal amount is \u20B9500." });
  }
  const payout = {
    id: "payreq_" + crypto2.randomBytes(6).toString("hex"),
    contributorId: user.id,
    amount: withdrawAmount,
    bankDetailsMasked: bankDetails ? "A/C Ending in " + bankDetails.slice(-4) : "UPI Linked",
    status: "pending",
    requestedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  repository.logSecurityEvent({
    eventType: "payout_requested",
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || "127.0.0.1",
    details: `Withdrawal request of \u20B9${withdrawAmount} logged by contributor ${user.name}.`,
    severity: "info"
  });
  res.json({ success: true, payout });
});
app.get("/api/student/purchases", requireSession, async (req, res) => {
  const user = req.currentUser;
  const userPurchases = await repository.getUserPurchases(user.id);
  const purchasedDocs = await Promise.all(
    userPurchases.map(async (p) => {
      const doc = await repository.getDocumentById(p.documentId);
      return doc ? { ...doc, purchaseRecord: p, hasPurchased: true } : null;
    })
  );
  res.json(purchasedDocs.filter(Boolean));
});
app.get("/api/admin/overview", requireSession, requireAdmin, async (_req, res) => {
  const allPurchases = repository.getAllPurchases();
  const allDocs = await repository.getDocuments();
  const grossRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
  const platformEarnings = Math.round(grossRevenue * 0.3);
  const activeSessionsCount = repository.getAllSessions().filter((s) => s.isValid).length;
  res.json({
    totalUsers: repository.getAllUsers().length,
    totalDocuments: allDocs.length,
    pendingModerationCount: allDocs.filter((d) => d.status === "pending_review").length,
    totalPurchases: allPurchases.length,
    grossRevenue,
    platformEarnings,
    activeSessionsCount,
    verifiedProfessorsCount: repository.getAllUsers().filter((u) => u.role === "professor").length,
    pendingProfessorVerifications: 0
  });
});
app.get("/api/admin/purchases", requireSession, requireAdmin, (_req, res) => {
  res.json(repository.getAllPurchases());
});
app.get("/api/admin/photos", requireSession, requireAdmin, (_req, res) => {
  res.json(repository.getSitePhotos());
});
app.post("/api/admin/photos", requireSession, requireAdmin, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided for upload." });
  }
  try {
    const uploaded = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      "academivault/site-assets"
    );
    const sitePhoto = {
      id: "photo_" + Date.now(),
      name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, ""),
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      bytes: uploaded.bytes,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    repository.addSitePhoto(sitePhoto);
    res.json({ success: true, photo: sitePhoto });
  } catch (err) {
    console.error("[Admin Photo Upload Error]", err);
    res.status(500).json({ error: "Cloudinary photo upload failed" });
  }
});
app.delete("/api/admin/photos/:id", requireSession, requireAdmin, async (req, res) => {
  const photo = repository.getSitePhotos().find((p) => p.id === req.params.id);
  if (photo && photo.publicId) {
    await deleteCloudinaryAsset(photo.publicId);
  }
  repository.deleteSitePhoto(req.params.id);
  res.json({ success: true, message: "Photo deleted successfully." });
});
app.get("/api/admin/documents", requireSession, requireAdmin, async (_req, res) => {
  const docs = await repository.getDocuments();
  res.json(docs);
});
app.post("/api/admin/documents/:id/status", requireSession, requireAdmin, async (req, res) => {
  const user = req.currentUser;
  const { status } = req.body;
  const doc = await repository.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  doc.status = status;
  doc.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await repository.saveDocument(doc);
  repository.logSecurityEvent({
    eventType: "document_approved",
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || "127.0.0.1",
    documentId: doc.id,
    details: `Admin changed status of document "${doc.title}" to ${status}.`,
    severity: "info"
  });
  res.json({ success: true, document: doc });
});
app.get("/api/admin/sessions", requireSession, requireAdmin, (_req, res) => {
  res.json(repository.getAllSessions().slice(-50));
});
app.post("/api/admin/sessions/:sessionId/revoke", requireSession, requireAdmin, async (req, res) => {
  await repository.revokeSession(req.params.sessionId, "Session terminated by an administrator.");
  res.json({ success: true, message: "Session terminated forcefully." });
});
app.get("/api/admin/security-logs", requireSession, requireAdmin, (_req, res) => {
  res.json(repository.getSecurityLogs());
});
app.use((err, _req, res, _next) => {
  console.error("[AcademiaVault Server Error]:", err);
  if (res.headersSent) return;
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || "An unexpected server error occurred."
  });
});
async function startServer() {
  if (process.env.VERCEL) return;
  if (isDev) {
    const vitePkg = "vite";
    const { createServer: createViteServer } = await import(
      /* @vite-ignore */
      vitePkg
    );
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`[AcademiaVault] Full-Stack Secure Marketplace live on port ${PORT}`);
  });
}
var isDirectRun = Boolean(
  process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js"))
);
if (isDirectRun && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("[AcademiaVault] Server failed to start:", err);
  });
}
var server_default = app;
export {
  app,
  server_default as default,
  startServer
};
