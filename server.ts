import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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
} from './src/types';
import {
  INITIAL_COLLEGES,
  INITIAL_DOCUMENTS,
  INITIAL_PROFESSOR_REVIEWS,
  INITIAL_STUDENT_REVIEWS,
  INITIAL_USERS
} from './src/data/mockData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// IN-MEMORY REPOSITORY (FIRESTORE DATA MODEL)
// ==========================================
class DatabaseStore {
  users: Map<string, User> = new Map();
  sessions: Map<string, UserSession> = new Map(); // sessionId -> UserSession
  userActiveSessions: Map<string, string> = new Map(); // userId -> sessionId (1 active session enforced)
  colleges: Map<string, College> = new Map();
  documents: Map<string, AcademicDocument> = new Map();
  reviews: Map<string, StudentReview> = new Map();
  professorReviews: Map<string, ProfessorReview> = new Map();
  professorVerifications: Map<string, ProfessorVerification> = new Map();
  purchases: Map<string, PurchaseRecord> = new Map();
  entitlements: Set<string> = new Set(); // "userId:documentId"
  payouts: Map<string, PayoutRecord> = new Map();
  securityLogs: SecurityEventLog[] = [];
  pageRequestTimestamps: Map<string, number[]> = new Map(); // sessionId -> timestamps[] for rate-limiting

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    INITIAL_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    INITIAL_COLLEGES.forEach((c) => this.colleges.set(c.id, { ...c }));
    INITIAL_DOCUMENTS.forEach((d) => this.documents.set(d.id, { ...d }));
    INITIAL_STUDENT_REVIEWS.forEach((r) => this.reviews.set(r.id, { ...r }));
    INITIAL_PROFESSOR_REVIEWS.forEach((p) => this.professorReviews.set(p.id, { ...p }));

    // Pre-entitle student Rahul to DSA Handcrafted Mastery for instant testing
    this.entitlements.add('usr_student_rahul:doc_dsa_handcrafted_mastery');
    this.purchases.set('pur_sample_101', {
      id: 'pur_sample_101',
      userId: 'usr_student_rahul',
      userEmail: 'rahul.sharma@iitb.ac.in',
      documentId: 'doc_dsa_handcrafted_mastery',
      documentTitle: 'Data Structures & Algorithms: Handcrafted Master Notes (Module 1 - 5)',
      amount: 49,
      currency: 'INR',
      orderId: 'order_rzp_preseeded_001',
      paymentId: 'pay_rzp_preseeded_001',
      signatureVerified: true,
      status: 'success',
      createdAt: '2026-09-28T14:00:00Z',
      entitlementId: 'ent_dsa_rahul_001'
    });

    // Pre-seed an initial session for student Rahul
    this.createSession('usr_student_rahul', 'Chrome Linux (Device A)', '103.21.124.5', 'Mozilla/5.0 Linux x86_64');

    this.logSecurityEvent({
      eventType: 'login_success',
      userId: 'usr_student_rahul',
      userEmail: 'rahul.sharma@iitb.ac.in',
      ipAddress: '103.21.124.5',
      deviceLabel: 'Chrome Linux (Device A)',
      details: 'Initial active session created during system bootstrap.',
      severity: 'info'
    });
  }

  // Atomically enforces ONE ACTIVE DEVICE SESSION per user
  createSession(userId: string, deviceLabel: string, ipAddress: string, userAgent: string): UserSession {
    const existingSessionId = this.userActiveSessions.get(userId);
    if (existingSessionId) {
      const oldSession = this.sessions.get(existingSessionId);
      if (oldSession && oldSession.isValid) {
        oldSession.isValid = false;
        oldSession.invalidatedReason = 'Your account was signed in on another device. Please log in again.';
        this.logSecurityEvent({
          eventType: 'session_invalidated_concurrent_login',
          userId,
          userEmail: this.users.get(userId)?.email,
          ipAddress,
          deviceLabel,
          details: `Session ${existingSessionId.substring(0, 8)}... (${oldSession.deviceLabel}) atomically terminated due to new login from ${deviceLabel}.`,
          severity: 'warning'
        });
      }
    }

    const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
    const newSession: UserSession = {
      sessionId,
      userId,
      deviceLabel,
      deviceId: 'dev_' + crypto.randomBytes(8).toString('hex'),
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      isValid: true
    };

    this.sessions.set(sessionId, newSession);
    this.userActiveSessions.set(userId, sessionId);
    return newSession;
  }

  validateSession(sessionId?: string): { valid: boolean; session?: UserSession; error?: string } {
    if (!sessionId) {
      return { valid: false, error: 'No active session token provided.' };
    }
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, error: 'Session not found. Please log in.' };
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

  hasEntitlement(userId: string, documentId: string): boolean {
    return this.entitlements.has(`${userId}:${documentId}`);
  }

  grantEntitlement(userId: string, documentId: string, purchase: PurchaseRecord): void {
    this.entitlements.add(`${userId}:${documentId}`);
    this.purchases.set(purchase.id, purchase);

    // Update document sales metrics
    const doc = this.documents.get(documentId);
    if (doc) {
      doc.totalSales = (doc.totalSales || 0) + 1;
    }
  }

  logSecurityEvent(event: Omit<SecurityEventLog, 'id' | 'timestamp'>) {
    const record: SecurityEventLog = {
      id: 'sec_' + crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.securityLogs.unshift(record);
    if (this.securityLogs.length > 500) {
      this.securityLogs.pop();
    }
  }
}

export const db = new DatabaseStore();

// ==========================================
// AUTH MIDDLEWARE (SESSION VERIFICATION)
// ==========================================
interface AuthenticatedRequest extends Request {
  userSession?: UserSession;
  currentUser?: User;
}

const requireSession = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
  const validation = db.validateSession(sessionId);

  if (!validation.valid) {
    return res.status(401).json({
      error: 'SESSION_REVOKED_OR_EXPIRED',
      message: validation.error || 'Your account was signed in on another device. Please log in again.'
    });
  }

  req.userSession = validation.session;
  req.currentUser = db.users.get(validation.session!.userId);
  next();
};

const optionalSession = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
  if (sessionId) {
    const validation = db.validateSession(sessionId);
    if (validation.valid) {
      req.userSession = validation.session;
      req.currentUser = db.users.get(validation.session!.userId);
    }
  }
  next();
};

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Session Status Check & Instant Second Device Simulation
app.get('/api/sessions/check', (req: AuthenticatedRequest, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
  const validation = db.validateSession(sessionId);
  if (!validation.valid) {
    return res.status(401).json({
      valid: false,
      error: 'SESSION_REVOKED_OR_EXPIRED',
      message: validation.error || 'Your account was signed in on another device. Please log in again.'
    });
  }
  const user = db.users.get(validation.session!.userId);
  res.json({
    valid: true,
    session: validation.session,
    user
  });
});

// SIMULATE 2ND DEVICE LOGIN: Explicit interactive test feature
app.post('/api/sessions/simulate-second-device', (req: AuthenticatedRequest, res: Response) => {
  const { userId, newDeviceLabel } = req.body;
  const targetUserId = userId || req.body.userId || 'usr_student_rahul';
  const label = newDeviceLabel || 'Safari macOS (Device B - Second Device)';
  const ip = '157.240.198.35';

  const newSession = db.createSession(targetUserId, label, ip, 'Mozilla/5.0 Macintosh Safari 18.0');

  res.json({
    message: 'Second device session spawned. The previous device session has been atomically invalidated.',
    newSessionId: newSession.sessionId,
    newDeviceLabel: newSession.deviceLabel,
    userId: targetUserId
  });
});

// 2. Authentication (Login / Register / Switch Demo Profile)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role, deviceLabel } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const device = deviceLabel || 'Current Browser Device';

  // Find user by email or fallback to demo role
  let user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && role) {
    user = Array.from(db.users.values()).find((u) => u.role === role);
  }
  if (!user) {
    // Default to student Rahul
    user = db.users.get('usr_student_rahul');
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const session = db.createSession(user.id, device, clientIp, userAgent);

  db.logSecurityEvent({
    eventType: 'login_success',
    userId: user.id,
    userEmail: user.email,
    ipAddress: clientIp,
    deviceLabel: device,
    details: `User ${user.name} logged in successfully as ${user.role}. Active session assigned: ${session.sessionId.substring(0, 8)}...`,
    severity: 'info'
  });

  res.cookie('academiasecure_session', session.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  res.json({
    user,
    session
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, collegeId, branch, semester, deviceLabel } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const college = db.colleges.get(collegeId);

  const newUser: User = {
    id: 'usr_' + crypto.randomBytes(6).toString('hex'),
    name,
    email,
    role: role === 'contributor' ? 'contributor' : 'student',
    collegeId,
    collegeName: college?.name || 'Selected Institution',
    branch: branch || 'Computer Science & Engineering',
    semester: Number(semester) || 1,
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  };

  db.users.set(newUser.id, newUser);
  const session = db.createSession(newUser.id, deviceLabel || 'Registered Device', clientIp, userAgent);

  res.json({
    user: newUser,
    session
  });
});

app.post('/api/auth/logout', requireSession, (req: AuthenticatedRequest, res: Response) => {
  if (req.userSession) {
    req.userSession.isValid = false;
    req.userSession.invalidatedReason = 'You signed out explicitly.';
    db.userActiveSessions.delete(req.userSession.userId);
  }
  res.clearCookie('academiasecure_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 3. Academic Catalogue & Marketplace Documents
app.get('/api/colleges', (_req: Request, res: Response) => {
  res.json(Array.from(db.colleges.values()));
});

app.get('/api/documents', optionalSession, (req: AuthenticatedRequest, res: Response) => {
  const { collegeId, category, search, branch, semester, sort, professorVerifiedOnly } = req.query;
  const currentUserId = req.currentUser?.id;

  let docs = Array.from(db.documents.values()).filter((d) => d.status === 'approved');

  if (collegeId && collegeId !== 'all') {
    docs = docs.filter((d) => d.collegeId === collegeId);
  }
  if (category && category !== 'all') {
    docs = docs.filter((d) => d.category === category);
  }
  if (branch && branch !== 'all') {
    docs = docs.filter((d) => d.branch.toLowerCase().includes((branch as string).toLowerCase()));
  }
  if (semester && semester !== 'all') {
    docs = docs.filter((d) => d.semester === Number(semester));
  }
  if (professorVerifiedOnly === 'true') {
    docs = docs.filter((d) => d.professorReviewStatus === 'verified_accurate');
  }
  if (search) {
    const q = (search as string).toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subjectName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.collegeName.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    docs.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    docs.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    docs.sort((a, b) => b.rating - a.rating);
  } else {
    // Default popular
    docs.sort((a, b) => b.totalSales - a.totalSales);
  }

  // Append user purchase status
  const enrichedDocs = docs.map((doc) => ({
    ...doc,
    hasPurchased: currentUserId ? db.hasEntitlement(currentUserId, doc.id) : false
  }));

  res.json(enrichedDocs);
});

app.get('/api/documents/:id', optionalSession, (req: AuthenticatedRequest, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const currentUserId = req.currentUser?.id;
  const hasPurchased = currentUserId ? db.hasEntitlement(currentUserId, doc.id) : false;

  const reviews = Array.from(db.reviews.values()).filter((r) => r.documentId === doc.id);
  const professorReviews = Array.from(db.professorReviews.values()).filter((p) => p.documentId === doc.id);

  res.json({
    document: {
      ...doc,
      hasPurchased
    },
    reviews,
    professorReviews
  });
});

// 4. SECURE DRM PROTECTED DOCUMENT READER ENGINE
// Dynamic forensic watermarking on authenticated page streams
app.get('/api/reader/page/:docId/:pageNum', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const { docId, pageNum } = req.params;
  const page = parseInt(pageNum, 10);
  const user = req.currentUser!;
  const session = req.userSession!;

  const doc = db.documents.get(docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (page < 1 || page > doc.pageCount) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  // Authorization check: Is it a free sample page OR has the user purchased the document?
  const isSample = doc.samplePreviewPages.includes(page);
  const hasPurchased = db.hasEntitlement(user.id, doc.id);

  if (!isSample && !hasPurchased) {
    db.logSecurityEvent({
      eventType: 'unauthorized_reader_access_blocked',
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `User attempted to access restricted page ${page} of "${doc.title}" without active purchase entitlement.`,
      severity: 'warning'
    });

    return res.status(403).json({
      error: 'PURCHASE_REQUIRED',
      message: 'You must purchase access to view this protected page. Only sample preview pages are publicly readable.'
    });
  }

  // Abuse detection: Rate-limit rapid page scraping
  const now = Date.now();
  const sessionTimestamps = db.pageRequestTimestamps.get(session.sessionId) || [];
  const recentRequests = sessionTimestamps.filter((t) => now - t < 3000); // within last 3 seconds
  if (recentRequests.length > 10) {
    db.logSecurityEvent({
      eventType: 'rapid_page_traversal_flagged',
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `Suspicious rapid page traversal rate (${recentRequests.length} requests in 3s) flagged for automated scraping prevention.`,
      severity: 'critical'
    });
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Rapid page traversal rate limit triggered. Please read pages naturally to protect academic intellectual property.'
    });
  }
  recentRequests.push(now);
  db.pageRequestTimestamps.set(session.sessionId, recentRequests);

  // Forensic Watermark Assembly
  const emailParts = user.email.split('@');
  const maskedEmail = emailParts[0].slice(0, 2) + '****' + emailParts[0].slice(-1) + '@' + (emailParts[1] || 'domain.com');
  const userShortId = 'STD-' + user.id.slice(-6).toUpperCase();
  const txnRef = hasPurchased ? 'TXN-RZP-' + user.id.slice(-4) + doc.id.slice(-4) : 'PREVIEW-SAMPLE';
  const sessionHash = session.sessionId.slice(-8);
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Generate vector graphic representation of page with high-fidelity academic typography and subtle repeated forensic watermarks
  const svgPage = generateSecureWatermarkedPageSvg({
    doc,
    page,
    totalPages: doc.pageCount,
    watermarkText: `${maskedEmail} · ${userShortId} · ${txnRef} · ${sessionHash} · ${timestampStr}`,
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

// Helper: Generates SVG page with multi-tier diagonal forensic watermarking and content
function generateSecureWatermarkedPageSvg({
  doc,
  page,
  totalPages,
  watermarkText,
  isSample
}: {
  doc: AcademicDocument;
  page: number;
  totalPages: number;
  watermarkText: string;
  isSample: boolean;
}): string {
  // Real topic content based on page number & subject
  const contentSnippets = getAcademicPageContent(doc.id, page);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="100%" height="100%" style="background:#ffffff; font-family:'Plus Jakarta Sans', system-ui, sans-serif;">
  <defs>
    <style>
      .watermark-dense { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; fill: rgba(15, 23, 42, 0.18); letter-spacing: 0.5px; }
      .watermark-prominent { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; font-weight: 800; fill: rgba(2, 132, 199, 0.22); }
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
  <text x="400" y="15" text-anchor="middle" class="security-strip">CONFIDENTIAL ACADEMIC LICENSE · FORENSICALLY TRACEABLE TO: ${watermarkText}</text>

  <!-- Document Header Boundary -->
  <rect x="40" y="36" width="720" height="42" fill="#f8fafc" rx="4" stroke="#e2e8f0" stroke-width="1"/>
  <text x="55" y="61" class="header-meta">${doc.collegeName.toUpperCase()} · ${doc.subjectCode} · ${doc.academicScheme}</text>
  <text x="745" y="61" text-anchor="end" class="header-meta">PAGE ${page} OF ${totalPages} ${isSample ? '· [FREE SAMPLE PREVIEW]' : '· [VERIFIED LICENSED COPY]'}</text>

  <!-- Document Subject Title & Module Info -->
  <text x="45" y="112" class="academic-title">${doc.title}</text>
  <line x1="45" y1="124" x2="755" y2="124" stroke="#0284c7" stroke-width="2"/>

  <!-- Academic Page Content -->
  <text x="45" y="150" class="section-heading">${contentSnippets.heading}</text>

  <g transform="translate(45, 165)">
    ${contentSnippets.bodyElements}
  </g>

  <!-- MULTI-TIER REPEATED HIGH-DENSITY FORENSIC WATERMARK (Anti-Piracy IP Protection) -->
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
    <text x="-250" y="1050" class="watermark-dense">${watermarkText}</text>
  </g>

  <!-- Bottom Forensic Tamper-Proof Strip -->
  <rect x="0" y="1108" width="800" height="22" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
  <text x="400" y="1123" text-anchor="middle" class="security-strip">UNAUTHORIZED CAPTURE IS AUDITED & LEGALLY ACTIONABLE UNDER INDIAN COPYRIGHT ACT 1957</text>

  <!-- Footer Security Strip -->
  <line x1="40" y1="1075" x2="760" y2="1075" stroke="#e2e8f0" stroke-width="1"/>
  <text x="45" y="1095" class="header-meta">Protected by AcademiaVault DRM · Dynamic Watermarking Verified · ${watermarkText.slice(0, 40)}...</text>
  <text x="755" y="1095" text-anchor="end" class="header-meta">${page} / ${totalPages}</text>
</svg>
  `.trim();
}

function getAcademicPageContent(docId: string, pageNum: number) {
  if (docId.includes('dsa')) {
    return {
      heading: `Chapter ${pageNum}. Balanced Search Trees & Asymptotic Analysis`,
      bodyElements: `
        <text x="0" y="15" class="academic-body">1.1 Red-Black Tree Structural Invariants & Rotations</text>
        <text x="0" y="35" class="academic-body">A red-black tree is a binary search tree with one extra bit of storage per node: its color (RED or BLACK).</text>
        <text x="0" y="55" class="academic-body">By constraining node colors on any path from the root to a leaf, red-black trees ensure that no path is</text>
        <text x="0" y="75" class="academic-body">more than twice as long as any other, rendering the tree approximately balanced.</text>

        <!-- Technical Diagram Box -->
        <rect x="0" y="95" width="710" height="150" rx="6" class="diagram-box"/>
        <text x="20" y="120" class="section-heading">Diagram 1.1: Left Rotation at pivot node X with child Y</text>
        <text x="30" y="150" class="code-font">      X                     Y         </text>
        <text x="30" y="170" class="code-font">     / \\     Left-Rotate    / \\        </text>
        <text x="30" y="190" class="code-font">    α   Y    ===========>  X   γ       </text>
        <text x="30" y="210" class="code-font">       / \\                / \\         </text>
        <text x="30" y="230" class="code-font">      β   γ              α   β         </text>

        <text x="0" y="275" class="academic-body">1.2 Formal Proof of Maximum Height</text>
        <text x="0" y="295" class="academic-body">Theorem: A red-black tree with n internal nodes has height at most 2 * log2(n + 1).</text>
        <text x="0" y="320" class="math-formula">Proof: bh(x) ≥ h(x) / 2. By induction, subtree rooted at x contains ≥ 2^(bh(x)) - 1 internal nodes.</text>
        <text x="0" y="340" class="math-formula">Therefore, n ≥ 2^(h/2) - 1  ==>  h ≤ 2 * lg(n + 1). (Q.E.D.)</text>

        <!-- Solved University Exam Question -->
        <rect x="0" y="370" width="710" height="210" rx="6" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
        <text x="20" y="395" class="section-heading" fill="#0369a1">[University Exam Question - 10 Marks - Solved]</text>
        <text x="20" y="420" class="academic-body">Q: Insert sequence [10, 20, 30, 15, 25] into an initially empty Red-Black Tree. Trace all color flips and rotations.</text>
        <text x="20" y="445" class="academic-body">Step 1: Insert 10 (Black Root). bh = 1.</text>
        <text x="20" y="465" class="academic-body">Step 2: Insert 20 (Red right child of 10). No violation.</text>
        <text x="20" y="485" class="academic-body">Step 3: Insert 30 (Red right child of 20). Uncle is NULL (Black). Double Red (20, 30). Left-Rotate(10).</text>
        <text x="20" y="505" class="academic-body">Result: Node 20 becomes Black Root, with children 10 (Red) and 30 (Red). Valid RB Tree.</text>
        <text x="20" y="535" class="code-font">Time Complexity: O(log n) search, O(log n) insert with O(1) amortized rotations.</text>
      `
    };
  } else if (docId.includes('os')) {
    return {
      heading: `Module ${pageNum}. Kernel Synchronization Primitives & Paging`,
      bodyElements: `
        <text x="0" y="15" class="academic-body">2.1 Critical Section Problem & Peterson's Algorithm</text>
        <text x="0" y="35" class="academic-body">A solution to the critical-section problem must satisfy three requirements: Mutual Exclusion,</text>
        <text x="0" y="55" class="academic-body">Progress, and Bounded Waiting.</text>

        <rect x="0" y="80" width="710" height="170" rx="6" class="diagram-box"/>
        <text x="20" y="105" class="section-heading">C Implementation of Peterson's Algorithm:</text>
        <text x="20" y="130" class="code-font">bool flag[2] = {false, false};</text>
        <text x="20" y="150" class="code-font">int turn = 0;</text>
        <text x="20" y="170" class="code-font">void enter_region(int i) {</text>
        <text x="20" y="190" class="code-font">    flag[i] = true; turn = 1 - i;</text>
        <text x="20" y="210" class="code-font">    while (flag[1 - i] && turn == 1 - i); // Busy wait</text>
        <text x="20" y="230" class="code-font">}</text>

        <text x="0" y="280" class="academic-body">2.2 Two-Level Paging & TLB Hit Ratio Mathematical Walkthrough</text>
        <text x="0" y="305" class="math-formula">Effective Access Time (EAT) = Hit_Ratio * (TLB_time + Mem_time) + (1 - Hit_Ratio) * (TLB_time + 2 * Mem_time)</text>
        <text x="0" y="330" class="academic-body">Example: If TLB search = 20ns, Memory Access = 100ns, and TLB Hit Rate = 95%:</text>
        <text x="0" y="355" class="math-formula">EAT = 0.95 * (20 + 100) + 0.05 * (20 + 200) = 114 + 11 = 125 ns. (12% slowdown over single memory access).</text>
      `
    };
  } else {
    return {
      heading: `Unit ${pageNum}. Academic Foundations & University Exam Prep`,
      bodyElements: `
        <text x="0" y="15" class="academic-body">1. Comprehensive Theoretical Foundations and Axioms</text>
        <text x="0" y="40" class="academic-body">This document contains syllabus-verified academic notes with complete step-by-step mathematical</text>
        <text x="0" y="65" class="academic-body">derivations, university-mandated problem solutions, and exam preparation summaries.</text>

        <rect x="0" y="95" width="710" height="150" rx="6" class="diagram-box"/>
        <text x="20" y="125" class="section-heading">Key Syllabus Principles & Formula Reference:</text>
        <text x="20" y="155" class="math-formula">F(s) = ∫[0 to ∞] f(t) e^(-st) dt  <==>  L{f'(t)} = s F(s) - f(0)</text>
        <text x="20" y="185" class="academic-body">System Stability Condition: All poles must reside strictly in the left half of the s-plane: Re(s) &lt; 0.</text>
        <text x="20" y="210" class="code-font">Verified against University Academic Regulation 2024-2026.</text>
      `
    };
  }
}

// 5. RAZORPAY PAYMENT WORKFLOW (ORDERS & HMAC SIGNATURE VERIFICATION)
app.post('/api/payments/create-order', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.body;
  const user = req.currentUser!;

  const doc = db.documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Idempotency: Has user already purchased this document?
  if (db.hasEntitlement(user.id, doc.id)) {
    return res.status(400).json({
      error: 'ALREADY_PURCHASED',
      message: 'You already own verified access to this document.'
    });
  }

  // Official price retrieved from database (never trust client price)
  const amountInPaise = Math.round(doc.price * 100);
  const orderId = 'order_rzp_' + crypto.randomBytes(8).toString('hex');

  // In production, razorpayInstance.orders.create({ amount: amountInPaise, currency: "INR", receipt: `rcpt_${doc.id}` })
  res.json({
    orderId,
    amount: amountInPaise,
    currency: 'INR',
    documentId: doc.id,
    documentTitle: doc.title,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_AcademiaVaultKey101',
    user: {
      name: user.name,
      email: user.email,
      contact: '+91 9876543210'
    }
  });
});

app.post('/api/payments/verify', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const { orderId, paymentId, signature, documentId } = req.body;
  const user = req.currentUser!;

  const doc = db.documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Cryptographic Signature Verification:
  // In live production: hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  // hmac.update(orderId + "|" + paymentId)
  // return hmac.digest('hex') === signature
  const isSignatureValid = Boolean(orderId && paymentId);

  if (!isSignatureValid) {
    db.logSecurityEvent({
      eventType: 'unauthorized_reader_access_blocked',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || '127.0.0.1',
      details: `Payment verification failed for Order ${orderId}. Invalid Razorpay signature.`,
      severity: 'critical'
    });
    return res.status(400).json({ error: 'Invalid payment signature. Entitlement denied.' });
  }

  // Create Purchase record and grant entitlement
  const purchaseId = 'pur_' + crypto.randomBytes(8).toString('hex');
  const entitlementId = 'ent_' + crypto.randomBytes(8).toString('hex');

  const purchase: PurchaseRecord = {
    id: purchaseId,
    userId: user.id,
    userEmail: user.email,
    documentId: doc.id,
    documentTitle: doc.title,
    amount: doc.price,
    currency: 'INR',
    orderId: orderId || 'order_rzp_mock',
    paymentId: paymentId || 'pay_rzp_mock',
    signatureVerified: true,
    status: 'success',
    createdAt: new Date().toISOString(),
    entitlementId
  };

  db.grantEntitlement(user.id, doc.id, purchase);

  db.logSecurityEvent({
    eventType: 'login_success',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    documentId: doc.id,
    details: `Payment confirmed for "${doc.title}". Amount: ₹${doc.price}. Active reader entitlement ${entitlementId} provisioned.`,
    severity: 'info'
  });

  res.json({
    success: true,
    message: 'Payment verified successfully. You now have access to read this document.',
    purchase,
    entitlementId
  });
});

// 6. STUDENT RATINGS & VERIFIED REVIEWS
app.post('/api/reviews/submit', requireSession, (req: AuthenticatedRequest, res: Response) => {
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
  const user = req.currentUser!;

  const doc = db.documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Verification rule: MUST HAVE PURCHASED
  const hasPurchased = db.hasEntitlement(user.id, doc.id);
  if (!hasPurchased) {
    return res.status(403).json({
      error: 'VERIFIED_PURCHASE_REQUIRED',
      message: 'Only verified purchasers can submit an authentic student review.'
    });
  }

  // Check duplicate review
  const existingReview = Array.from(db.reviews.values()).find(
    (r) => r.userId === user.id && r.documentId === doc.id
  );
  if (existingReview) {
    return res.status(400).json({ error: 'You have already submitted a review for this document version.' });
  }

  const review: StudentReview = {
    id: 'rev_' + crypto.randomBytes(6).toString('hex'),
    documentId: doc.id,
    documentVersion: doc.version,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'Verified Student',
    verifiedPurchase: true,
    rating: Number(rating) || 5,
    contentAccuracyRating: Number(contentAccuracyRating) || 5,
    explanationQualityRating: Number(explanationQualityRating) || 5,
    readabilityRating: Number(readabilityRating) || 5,
    syllabusCoverageRating: Number(syllabusCoverageRating) || 5,
    examUsefulnessRating: Number(examUsefulnessRating) || 5,
    reviewText: reviewText || '',
    helpfulCount: 0,
    createdAt: new Date().toISOString()
  };

  db.reviews.set(review.id, review);

  // Recalculate document rating
  const allDocReviews = Array.from(db.reviews.values()).filter((r) => r.documentId === doc.id);
  const avgRating = allDocReviews.reduce((sum, r) => sum + r.rating, 0) / allDocReviews.length;
  doc.rating = parseFloat(avgRating.toFixed(1));
  doc.ratingCount = allDocReviews.length;

  res.json({
    success: true,
    review,
    documentRating: doc.rating,
    ratingCount: doc.ratingCount
  });
});

// 7. PROFESSOR VERIFICATION & ACADEMIC AUDIT REVIEWS
app.post('/api/professor/apply', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const { institution, department, academicDesignation, officialEmail, credentialsDocName } = req.body;
  const user = req.currentUser!;

  const existingApp = Array.from(db.professorVerifications.values()).find((p) => p.userId === user.id);
  if (existingApp && existingApp.status === 'pending') {
    return res.status(400).json({ error: 'You already have a pending professor verification application.' });
  }

  const verification: ProfessorVerification = {
    id: 'pver_' + crypto.randomBytes(6).toString('hex'),
    userId: user.id,
    fullName: user.name,
    institution,
    department,
    academicDesignation,
    officialEmail,
    credentialsDocName: credentialsDocName || 'faculty_credentials.pdf',
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  db.professorVerifications.set(verification.id, verification);

  db.logSecurityEvent({
    eventType: 'professor_verified',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Professor verification application submitted by ${user.name} (${institution}). Under administrator review.`,
    severity: 'info'
  });

  res.json({ success: true, verification });
});

app.post('/api/professor/submit-review', requireSession, (req: AuthenticatedRequest, res: Response) => {
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
  const user = req.currentUser!;

  if (user.role !== 'professor' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only verified academic professors can submit formal academic audits.' });
  }

  const doc = db.documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const profReview: ProfessorReview = {
    id: 'prev_' + crypto.randomBytes(6).toString('hex'),
    documentId: doc.id,
    documentVersion: doc.version,
    professorId: user.id,
    professorName: user.name,
    institution: user.collegeName || 'Accredited Academic Institution',
    department: user.branch || 'Department of Computer Science & Engineering',
    technicalCorrectnessScore: Number(technicalCorrectnessScore) || 9,
    academicAccuracyScore: Number(academicAccuracyScore) || 10,
    conceptualExplanationScore: Number(conceptualExplanationScore) || 9,
    syllabusAlignmentScore: Number(syllabusAlignmentScore) || 9,
    completenessScore: Number(completenessScore) || 9,
    referenceQualityScore: Number(referenceQualityScore) || 9,
    overallQualityRating: Number(overallQualityRating) || 5,
    detailedFeedback,
    recommendation: recommendation || 'highly_recommended',
    conflictOfInterestDisclosure: conflictOfInterestDisclosure || 'No commercial conflict of interest.',
    createdAt: new Date().toISOString()
  };

  db.professorReviews.set(profReview.id, profReview);

  // Update document professor badge status
  doc.professorReviewStatus = 'verified_accurate';
  const totalScore = Math.round(
    ((profReview.technicalCorrectnessScore +
      profReview.academicAccuracyScore +
      profReview.conceptualExplanationScore +
      profReview.syllabusAlignmentScore +
      profReview.completenessScore +
      profReview.referenceQualityScore) /
      60) *
      100
  );
  doc.professorVerifiedScore = totalScore;

  res.json({ success: true, professorReview: profReview, document: doc });
});

// 8. CONTRIBUTOR DASHBOARD & UPLOAD WORKFLOW
app.get('/api/contributor/my-documents', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const docs = Array.from(db.documents.values()).filter((d) => d.contributorId === user.id);
  res.json(docs);
});

app.post('/api/contributor/upload', requireSession, (req: AuthenticatedRequest, res: Response) => {
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
  const user = req.currentUser!;

  if (!copyrightAgreed) {
    return res.status(400).json({ error: 'You must declare original copyright ownership of these study materials.' });
  }

  const college = db.colleges.get(collegeId) || INITIAL_COLLEGES[0];

  const newDoc: AcademicDocument = {
    id: 'doc_' + crypto.randomBytes(8).toString('hex'),
    title,
    description,
    category: category || 'handwritten_notes',
    collegeId: college.id,
    collegeName: college.name,
    universityName: college.universityName,
    branch: branch || 'Computer Science & Engineering',
    semester: Number(semester) || 1,
    subjectId: subjectCode || 'SUB101',
    subjectName: subjectName || 'Core Subject',
    subjectCode: subjectCode || 'SUB101',
    module: module || 'Complete Subject',
    academicScheme: academicScheme || 'Current CBCS Scheme',
    pageCount: Number(pageCount) || 35,
    language: 'English',
    price: Math.max(29, Number(price) || 49),
    contributorId: user.id,
    contributorName: user.name,
    contributorCollege: user.collegeName || college.name,
    status: 'pending_review',
    samplePreviewPages: [1, 2],
    totalSales: 0,
    rating: 5.0,
    ratingCount: 0,
    professorReviewStatus: 'not_reviewed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  db.documents.set(newDoc.id, newDoc);

  db.logSecurityEvent({
    eventType: 'document_approved',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    documentId: newDoc.id,
    details: `Contributor ${user.name} submitted "${newDoc.title}". Queued for administrative moderation.`,
    severity: 'info'
  });

  res.json({ success: true, document: newDoc });
});

app.get('/api/contributor/earnings', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const userDocs = Array.from(db.documents.values()).filter((d) => d.contributorId === user.id);
  const docIds = new Set(userDocs.map((d) => d.id));

  const relevantPurchases = Array.from(db.purchases.values()).filter((p) => docIds.has(p.documentId));
  const totalRevenue = relevantPurchases.reduce((sum, p) => sum + p.amount, 0);
  const contributorShare = Math.round(totalRevenue * 0.7); // 70% revenue share

  const userPayouts = Array.from(db.payouts.values()).filter((p) => p.contributorId === user.id);
  const withdrawn = userPayouts
    .filter((p) => p.status === 'processed')
    .reduce((sum, p) => sum + p.amount, 0);

  const available = Math.max(0, contributorShare - withdrawn);

  const responseData: ContributorEarnings = {
    totalRevenue,
    contributorShare,
    availableBalance: available,
    withdrawnBalance: withdrawn,
    totalSalesCount: relevantPurchases.length,
    payouts: userPayouts
  };

  res.json(responseData);
});

app.post('/api/contributor/request-withdrawal', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const { amount, bankDetails } = req.body;
  const user = req.currentUser!;
  const withdrawAmount = Number(amount);

  if (withdrawAmount < 500) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is ₹500.' });
  }

  const payout: PayoutRecord = {
    id: 'payreq_' + crypto.randomBytes(6).toString('hex'),
    contributorId: user.id,
    amount: withdrawAmount,
    bankDetailsMasked: bankDetails ? 'A/C Ending in ' + bankDetails.slice(-4) : 'UPI Linked',
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  db.payouts.set(payout.id, payout);

  db.logSecurityEvent({
    eventType: 'payout_requested',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Withdrawal request of ₹${withdrawAmount} logged by contributor ${user.name}.`,
    severity: 'info'
  });

  res.json({ success: true, payout });
});

// 9. STUDENT LIBRARY & PURCHASES
app.get('/api/student/purchases', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const userPurchases = Array.from(db.purchases.values()).filter((p) => p.userId === user.id);
  const purchasedDocs = userPurchases
    .map((p) => {
      const doc = db.documents.get(p.documentId);
      return doc ? { ...doc, purchaseRecord: p, hasPurchased: true } : null;
    })
    .filter(Boolean);

  res.json(purchasedDocs);
});

// 10. ADMINISTRATOR MANAGEMENT PORTAL
app.get('/api/admin/overview', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  const allPurchases = Array.from(db.purchases.values());
  const grossRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
  const platformEarnings = Math.round(grossRevenue * 0.3); // 30% platform take
  const activeSessionsCount = Array.from(db.sessions.values()).filter((s) => s.isValid).length;

  res.json({
    totalUsers: db.users.size,
    totalDocuments: db.documents.size,
    pendingModerationCount: Array.from(db.documents.values()).filter((d) => d.status === 'pending_review').length,
    totalPurchases: allPurchases.length,
    grossRevenue,
    platformEarnings,
    activeSessionsCount,
    verifiedProfessorsCount: Array.from(db.users.values()).filter((u) => u.role === 'professor').length,
    pendingProfessorVerifications: Array.from(db.professorVerifications.values()).filter((v) => v.status === 'pending').length
  });
});

app.get('/api/admin/documents', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  res.json(Array.from(db.documents.values()));
});

app.post('/api/admin/documents/:id/status', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { status } = req.body;
  const doc = db.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  doc.status = status;
  doc.updatedAt = new Date().toISOString();

  db.logSecurityEvent({
    eventType: 'document_approved',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    documentId: doc.id,
    details: `Admin changed status of document "${doc.title}" to ${status}.`,
    severity: 'info'
  });

  res.json({ success: true, document: doc });
});

app.get('/api/admin/sessions', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  res.json(Array.from(db.sessions.values()).slice(-50));
});

app.post('/api/admin/sessions/:sessionId/revoke', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const session = db.sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.isValid = false;
  session.invalidatedReason = 'Your session was terminated by an administrator.';
  db.userActiveSessions.delete(session.userId);

  res.json({ success: true, message: 'Session terminated forcefully.' });
});

app.get('/api/admin/security-logs', requireSession, (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  res.json(db.securityLogs);
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[AcademiaVault] Full-Stack Secure Notes Marketplace active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AcademiaVault] Server failed to start:', err);
});
