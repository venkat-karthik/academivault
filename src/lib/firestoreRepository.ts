import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { firestoreDb, isFirestoreConfigured } from './firebaseAdmin';
import {
  AcademicDocument,
  College,
  ContributorEarnings,
  PayoutRecord,
  ProfessorReview,
  ProfessorVerification,
  PurchaseRecord,
  SecurityEventLog,
  StudentReview,
  User,
  UserSession
} from '../types';
import {
  INITIAL_COLLEGES,
  INITIAL_DOCUMENTS,
  INITIAL_PROFESSOR_REVIEWS,
  INITIAL_STUDENT_REVIEWS,
  INITIAL_USERS
} from '../data/mockData';

// User with private hashed password
export interface StoredUser extends User {
  passwordHash?: string;
}

export interface SitePhoto {
  id: string;
  url: string;
  publicId: string;
  name: string;
  bytes: number;
  uploadedAt: string;
}

export class FirestoreRepository {
  // Local fallback cache for speed and when Firestore credentials are being configured
  private localUsers = new Map<string, StoredUser>();
  private localSessions = new Map<string, UserSession>();
  private localActiveSessions = new Map<string, string>(); // userId -> sessionId
  private localColleges = new Map<string, College>();
  private localDocuments = new Map<string, AcademicDocument>();
  private localReviews = new Map<string, StudentReview>();
  private localProfReviews = new Map<string, ProfessorReview>();
  private localProfVerifications = new Map<string, ProfessorVerification>();
  private localPurchases = new Map<string, PurchaseRecord>();
  private localEntitlements = new Set<string>(); // "userId:docId"
  private localPayouts = new Map<string, PayoutRecord>();
  private localSecurityLogs: SecurityEventLog[] = [];
  private localPhotos: SitePhoto[] = [
    {
      id: 'photo_1',
      name: 'Library Aesthetic Reading',
      url: 'https://res.cloudinary.com/mcjwmthb/image/upload/v1794988399/academivault/site-assets/library_aesthetic_reading_1793904179717.jpg',
      publicId: 'academivault/site-assets/library_aesthetic_reading_1793904179717',
      bytes: 980992,
      uploadedAt: '2026-11-18T13:23:00Z'
    },
    {
      id: 'photo_2',
      name: 'Academic Campus Quadrangle',
      url: 'https://res.cloudinary.com/mcjwmthb/image/upload/v1794988401/academivault/site-assets/academic_campus_quad_1793904181259.jpg',
      publicId: 'academivault/site-assets/academic_campus_quad_1793904181259',
      bytes: 1048576,
      uploadedAt: '2026-11-18T13:23:00Z'
    },
    {
      id: 'photo_3',
      name: 'Study Essentials Flatlay',
      url: 'https://res.cloudinary.com/mcjwmthb/image/upload/v1794988398/academivault/site-assets/study_essentials_flatlay_1793904181267.jpg',
      publicId: 'academivault/site-assets/study_essentials_flatlay_1793904181267',
      bytes: 831488,
      uploadedAt: '2026-11-18T13:23:00Z'
    },
    {
      id: 'photo_4',
      name: 'Cozy Study Desk & Notes',
      url: 'https://res.cloudinary.com/mcjwmthb/image/upload/v1794988400/academivault/site-assets/hero_cozy_study_desk_1793904180995.jpg',
      publicId: 'academivault/site-assets/hero_cozy_study_desk_1793904180995',
      bytes: 791552,
      uploadedAt: '2026-11-18T13:23:00Z'
    }
  ];

  constructor() {
    this.seedBaselineData();
  }

  private seedBaselineData() {
    // Seed initial baseline reference data
    INITIAL_COLLEGES.forEach((c) => this.localColleges.set(c.id, { ...c }));
    INITIAL_DOCUMENTS.forEach((d) => this.localDocuments.set(d.id, { ...d }));
    INITIAL_STUDENT_REVIEWS.forEach((r) => this.localReviews.set(r.id, { ...r }));
    INITIAL_PROFESSOR_REVIEWS.forEach((p) => this.localProfReviews.set(p.id, { ...p }));

    // Seed production starter users with hashed baseline password 'AcademicSecure2026!'
    const salt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync('AcademicSecure2026!', salt);

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
  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirestoreConfigured && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('users').where('email', '==', cleanEmail).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() } as StoredUser;
        }
      } catch (err) {
        console.error('[Firestore] findUserByEmail error:', err);
      }
    }

    for (const u of this.localUsers.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<StoredUser | null> {
    if (isFirestoreConfigured && firestoreDb) {
      try {
        const doc = await firestoreDb.collection('users').doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() } as StoredUser;
        }
      } catch (err) {
        console.error('[Firestore] findUserById error:', err);
      }
    }
    return this.localUsers.get(id) || null;
  }

  async createUser(payload: {
    name: string;
    email: string;
    password?: string;
    role: string;
    collegeId: string;
    branch?: string;
    semester?: number;
  }): Promise<StoredUser> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this institutional email already exists.');
    }

    const college = this.localColleges.get(payload.collegeId);
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');

    const passwordHash = payload.password
      ? await bcrypt.hash(payload.password, 10)
      : await bcrypt.hash('AcademicSecure2026!', 10);

    const isAdmin = cleanEmail === 'karthikvenkat316@gmail.com';

    const newUser: StoredUser = {
      id: userId,
      name: payload.name.trim(),
      email: cleanEmail,
      role: isAdmin ? 'admin' : (payload.role === 'contributor' ? 'contributor' : 'student') as any,
      collegeId: payload.collegeId,
      collegeName: college?.name || 'Selected University',
      branch: payload.branch || 'Computer Science & Engineering',
      semester: Number(payload.semester) || 1,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      passwordHash
    };

    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('users').doc(userId).set(newUser);
      } catch (err) {
        console.error('[Firestore] createUser error:', err);
      }
    }

    this.localUsers.set(userId, newUser);
    return newUser;
  }

  async findOrCreateGoogleUser(payload: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<StoredUser> {
    const cleanEmail = payload.email.trim().toLowerCase();
    let user = await this.findUserByEmail(cleanEmail);
    const isAdmin = cleanEmail === 'karthikvenkat316@gmail.com';

    if (user) {
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
        if (isFirestoreConfigured && firestoreDb) {
          try {
            await firestoreDb.collection('users').doc(user.id).set({ role: 'admin' }, { merge: true });
          } catch (err) {
            console.error('[Firestore] Role update error:', err);
          }
        }
      }
      return user;
    }

    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const newUser: StoredUser = {
      id: userId,
      name: payload.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'student',
      avatarUrl: payload.avatarUrl,
      isEmailVerified: true,
      collegeId: 'iit-bombay',
      collegeName: 'Indian Institute of Technology Bombay',
      branch: 'Computer Science & Engineering',
      semester: 1,
      createdAt: new Date().toISOString()
    };

    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('users').doc(userId).set(newUser, { merge: true });
      } catch (err) {
        console.error('[Firestore] Google user creation error:', err);
      }
    }

    this.localUsers.set(userId, newUser);
    return newUser;
  }

  async verifyUserPassword(user: StoredUser, passwordInput: string): Promise<boolean> {
    if (!user.passwordHash) return true;
    return bcrypt.compare(passwordInput, user.passwordHash);
  }

  // -------------------------------------------------------------
  // SINGLE-DEVICE SESSION REGISTRY (ATOMIC REVOCATION)
  // -------------------------------------------------------------
  async createSession(
    userId: string,
    deviceLabel: string,
    ipAddress: string,
    userAgent: string
  ): Promise<UserSession> {
    const user = await this.findUserById(userId);
    const nowIso = new Date().toISOString();

    // 1. Invalidate any existing active session for this user atomically
    const existingSessionId = this.localActiveSessions.get(userId);
    if (existingSessionId) {
      const oldSession = this.localSessions.get(existingSessionId);
      if (oldSession && oldSession.isValid) {
        oldSession.isValid = false;
        oldSession.invalidatedReason = 'Your account was signed in on another device. Please log in again.';
        if (isFirestoreConfigured && firestoreDb) {
          try {
            await firestoreDb.collection('user_sessions').doc(existingSessionId).update({
              isValid: false,
              invalidatedReason: oldSession.invalidatedReason
            });
          } catch (err) {
            console.error('[Firestore] session invalidation error:', err);
          }
        }
      }
    }

    // 2. Generate new session token
    const sessionId = 'sess_' + crypto.randomBytes(24).toString('hex');
    const newSession: UserSession = {
      sessionId,
      userId,
      deviceLabel: deviceLabel || 'Primary Web Device',
      deviceId: 'dev_' + crypto.randomBytes(8).toString('hex'),
      ipAddress,
      userAgent,
      createdAt: nowIso,
      lastActivityAt: nowIso,
      isValid: true
    };

    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('user_sessions').doc(sessionId).set(newSession);
        await firestoreDb.collection('users').doc(userId).set({
          activeSessionId: sessionId,
          lastLoginAt: nowIso
        }, { merge: true });
      } catch (err) {
        console.error('[Firestore] createSession error:', err);
      }
    }

    this.localSessions.set(sessionId, newSession);
    this.localActiveSessions.set(userId, sessionId);

    this.logSecurityEvent({
      eventType: 'login_success',
      userId,
      userEmail: user?.email,
      ipAddress,
      deviceLabel,
      details: `Single-device authenticated session established: ${sessionId.substring(0, 10)}...`,
      severity: 'info'
    });

    return newSession;
  }

  async validateSession(sessionId?: string): Promise<{ valid: boolean; session?: UserSession; error?: string }> {
    if (!sessionId) {
      return { valid: false, error: 'No active session token provided.' };
    }

    let session = this.localSessions.get(sessionId);

    if (!session && isFirestoreConfigured && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('user_sessions').doc(sessionId).get();
        if (snap.exists) {
          session = snap.data() as UserSession;
          this.localSessions.set(sessionId, session);
        }
      } catch (err) {
        console.error('[Firestore] validateSession error:', err);
      }
    }

    if (!session) {
      return { valid: false, error: 'Session expired or not found. Please log in.' };
    }

    if (!session.isValid) {
      return {
        valid: false,
        session,
        error: session.invalidatedReason || 'Your account was signed in on another device. Please log in again.'
      };
    }

    session.lastActivityAt = new Date().toISOString();
    return { valid: true, session };
  }

  async revokeSession(sessionId: string, reason = 'Session terminated.'): Promise<void> {
    const session = this.localSessions.get(sessionId);
    if (session) {
      session.isValid = false;
      session.invalidatedReason = reason;
      this.localActiveSessions.delete(session.userId);
    }

    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('user_sessions').doc(sessionId).update({
          isValid: false,
          invalidatedReason: reason
        });
      } catch (err) {
        console.error('[Firestore] revokeSession error:', err);
      }
    }
  }

  // -------------------------------------------------------------
  // DOCUMENTS & CATALOGUE
  // -------------------------------------------------------------
  async getDocuments(filters: {
    collegeId?: string;
    category?: string;
    branch?: string;
    semester?: string;
    search?: string;
    sort?: string;
    professorVerifiedOnly?: boolean;
  } = {}): Promise<AcademicDocument[]> {
    let docs = Array.from(this.localDocuments.values());

    if (filters.collegeId && filters.collegeId !== 'all') {
      docs = docs.filter((d) => d.collegeId === filters.collegeId);
    }
    if (filters.category && filters.category !== 'all') {
      docs = docs.filter((d) => d.category === filters.category);
    }
    if (filters.branch && filters.branch !== 'all') {
      docs = docs.filter((d) => d.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.semester && filters.semester !== 'all') {
      docs = docs.filter((d) => d.semester === Number(filters.semester));
    }
    if (filters.professorVerifiedOnly) {
      docs = docs.filter((d) => d.professorReviewStatus === 'verified_accurate');
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.subjectName.toLowerCase().includes(q) ||
          d.subjectCode.toLowerCase().includes(q) ||
          d.collegeName.toLowerCase().includes(q) ||
          d.contributorName.toLowerCase().includes(q)
      );
    }

    if (filters.sort === 'rating') {
      docs.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'price_asc') {
      docs.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      docs.sort((a, b) => b.price - a.price);
    } else {
      docs.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    }

    return docs;
  }

  getDocumentsSync(): AcademicDocument[] {
    return Array.from(this.localDocuments.values());
  }

  async getDocumentById(id: string): Promise<AcademicDocument | null> {
    if (isFirestoreConfigured && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('documents').doc(id).get();
        if (snap.exists) {
          return { id: snap.id, ...snap.data() } as AcademicDocument;
        }
      } catch (err) {
        console.error('[Firestore] getDocumentById error:', err);
      }
    }
    return this.localDocuments.get(id) || null;
  }

  async saveDocument(doc: AcademicDocument): Promise<AcademicDocument> {
    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('documents').doc(doc.id).set(doc);
      } catch (err) {
        console.error('[Firestore] saveDocument error:', err);
      }
    }
    this.localDocuments.set(doc.id, doc);
    return doc;
  }

  // -------------------------------------------------------------
  // PURCHASES & DRM ENTITLEMENTS
  // -------------------------------------------------------------
  async hasEntitlement(userId: string, documentId: string): Promise<boolean> {
    const key = `${userId}:${documentId}`;
    if (this.localEntitlements.has(key)) return true;

    if (isFirestoreConfigured && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('entitlements')
          .where('userId', '==', userId)
          .where('documentId', '==', documentId)
          .limit(1)
          .get();
        if (!snap.empty) {
          this.localEntitlements.add(key);
          return true;
        }
      } catch (err) {
        console.error('[Firestore] hasEntitlement error:', err);
      }
    }
    return false;
  }

  async grantEntitlement(userId: string, documentId: string, purchase: PurchaseRecord): Promise<void> {
    const key = `${userId}:${documentId}`;
    this.localEntitlements.add(key);
    this.localPurchases.set(purchase.id, purchase);

    // Update document sales
    const doc = this.localDocuments.get(documentId);
    if (doc) {
      doc.totalSales = (doc.totalSales || 0) + 1;
    }

    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('purchases').doc(purchase.id).set(purchase);
        await firestoreDb.collection('entitlements').doc(`${userId}_${documentId}`).set({
          userId,
          documentId,
          purchaseId: purchase.id,
          createdAt: new Date().toISOString()
        });
        if (doc) {
          await firestoreDb.collection('documents').doc(doc.id).update({
            totalSales: doc.totalSales
          });
        }
      } catch (err) {
        console.error('[Firestore] grantEntitlement error:', err);
      }
    }
  }

  async getUserPurchases(userId: string): Promise<PurchaseRecord[]> {
    const results: PurchaseRecord[] = [];
    for (const p of this.localPurchases.values()) {
      if (p.userId === userId && p.status === 'success') {
        results.push(p);
      }
    }
    return results;
  }

  // -------------------------------------------------------------
  // REVIEWS & PROFESSOR AUDITS
  // -------------------------------------------------------------
  async getReviewsForDocument(docId: string): Promise<StudentReview[]> {
    return Array.from(this.localReviews.values()).filter((r) => r.documentId === docId);
  }

  async getProfessorReviewsForDocument(docId: string): Promise<ProfessorReview[]> {
    return Array.from(this.localProfReviews.values()).filter((p) => p.documentId === docId);
  }

  async addStudentReview(review: StudentReview): Promise<void> {
    this.localReviews.set(review.id, review);
    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('reviews').doc(review.id).set(review);
      } catch (err) {
        console.error('[Firestore] addStudentReview error:', err);
      }
    }
  }

  async addProfessorReview(review: ProfessorReview): Promise<void> {
    this.localProfReviews.set(review.id, review);
    if (isFirestoreConfigured && firestoreDb) {
      try {
        await firestoreDb.collection('professor_reviews').doc(review.id).set(review);
      } catch (err) {
        console.error('[Firestore] addProfessorReview error:', err);
      }
    }
  }

  // -------------------------------------------------------------
  // SECURITY EVENT LOGGING
  // -------------------------------------------------------------
  logSecurityEvent(event: Omit<SecurityEventLog, 'id' | 'timestamp'>) {
    const record: SecurityEventLog = {
      id: 'sec_' + crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.localSecurityLogs.unshift(record);
    if (this.localSecurityLogs.length > 500) {
      this.localSecurityLogs.pop();
    }

    if (isFirestoreConfigured && firestoreDb) {
      firestoreDb.collection('security_events').doc(record.id).set(record).catch(() => {});
    }
  }

  getSecurityLogs(): SecurityEventLog[] {
    return this.localSecurityLogs;
  }

  getColleges(): College[] {
    return Array.from(this.localColleges.values());
  }

  getAllSessions(): UserSession[] {
    return Array.from(this.localSessions.values());
  }

  getAllUsers(): User[] {
    return Array.from(this.localUsers.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  }

  getAllPurchases(): PurchaseRecord[] {
    return Array.from(this.localPurchases.values());
  }

  // -------------------------------------------------------------
  // SITE PHOTOS (CLOUDINARY)
  // -------------------------------------------------------------
  getSitePhotos(): SitePhoto[] {
    return this.localPhotos;
  }

  addSitePhoto(photo: SitePhoto): void {
    this.localPhotos.unshift(photo);
    if (isFirestoreConfigured && firestoreDb) {
      firestoreDb.collection('site_photos').doc(photo.id).set(photo).catch(() => {});
    }
  }

  deleteSitePhoto(id: string): void {
    this.localPhotos = this.localPhotos.filter((p) => p.id !== id);
    if (isFirestoreConfigured && firestoreDb) {
      firestoreDb.collection('site_photos').doc(id).delete().catch(() => {});
    }
  }
}

export const repository = new FirestoreRepository();

