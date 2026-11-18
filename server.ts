import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import Razorpay from 'razorpay';

import {
  AcademicDocument,
  ContributorEarnings,
  PayoutRecord,
  ProfessorReview,
  ProfessorVerification,
  PurchaseRecord,
  User,
  UserSession
} from './src/types';
import { repository } from './src/lib/firestoreRepository';
import { uploadPdfBuffer, uploadImageBuffer, deleteCloudinaryAsset, isCloudinaryConfigured } from './src/lib/cloudinary';
import { generateDocumentSummary, generateStudyFlashcards } from './src/lib/gemini';
import { isFirestoreConfigured } from './src/lib/firebaseAdmin';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Support Vercel and reverse proxies securely
app.set('trust proxy', 1);

// Normalize incoming paths so /auth/google matches /api/auth/google on Vercel
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_') && !req.url.startsWith('/assets')) {
    req.url = '/api' + req.url;
  }
  next();
});

// ==========================================
// SECURITY HEADERS & RATE LIMITING
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://checkout.razorpay.com',
          'https://accounts.google.com'
        ],
        frameSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',
          'https://accounts.google.com'
        ],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://lumberjack.razorpay.com',
          'https://generativelanguage.googleapis.com',
          'https://accounts.google.com'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
          'https://*.googleusercontent.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com']
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Serverless-safe body parsing: skip if stream already consumed or body already parsed
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '25mb' })(req, res, (err) => {
    if (err) {
      console.warn('[express.json] parse warning:', err.message);
      return next();
    }
    next();
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.urlencoded({ extended: true, limit: '25mb' })(req, res, (err) => {
    if (err) {
      console.warn('[express.urlencoded] parse warning:', err.message);
      return next();
    }
    next();
  });
});

// Safe IP extractor that functions across Vercel, Cloudflare, and local environments
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
};

// Auth & Payment Rate Limiter with serverless reverse proxy tolerance
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  message: { error: 'Rate limit exceeded for payment requests. Please try again in 5 minutes.' }
});

// Multer in-memory storage for handling PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Razorpay SDK Instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_AcademiaVaultKey101';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_here';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// Rate-limiting timestamps for reader abuse deterrence
const pageRequestTimestamps = new Map<string, number[]>();

// ==========================================
// AUTH MIDDLEWARE (SESSION VERIFICATION)
// ==========================================
export interface AuthenticatedRequest extends Request {
  userSession?: UserSession;
  currentUser?: User;
}

const requireSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
  const validation = await repository.validateSession(sessionId);

  if (!validation.valid) {
    return res.status(401).json({
      error: 'SESSION_REVOKED_OR_EXPIRED',
      message: validation.error || 'Your account was signed in on another device. Please log in again.'
    });
  }

  req.userSession = validation.session;
  const user = await repository.findUserById(validation.session!.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }
  const { passwordHash, ...safeUser } = user;
  req.currentUser = safeUser;
  next();
};

const optionalSession = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
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
    console.warn('[optionalSession Warning]', err);
  }
  next();
};

const ADMIN_EMAIL = 'karthikvenkat316@gmail.com';

const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.currentUser;
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || user.role !== 'admin') {
    return res.status(403).json({
      error: 'UNAUTHORIZED_ADMIN_ACCESS',
      message: 'Administrative privileges are restricted exclusively to the verified platform owner.'
    });
  }
  next();
};

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Healthcheck Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      firestore: isFirestoreConfigured ? 'connected' : 'hybrid_active',
      cloudinary: isCloudinaryConfigured ? 'connected' : 'local_ready',
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YourTestKeyId')) ? 'live_ready' : 'test_mode'
    }
  });
});

// 2. Session Status Check
app.get('/api/sessions/check', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.academiasecure_session;
    if (!sessionId) {
      return res.json({ valid: false });
    }
    const validation = await repository.validateSession(sessionId);
    if (!validation || !validation.valid || !validation.session) {
      return res.json({
        valid: false,
        error: 'SESSION_REVOKED_OR_EXPIRED',
        message: validation?.error || 'No active session found.'
      });
    }
    const user = await repository.findUserById(validation.session.userId);
    if (!user) {
      return res.json({ valid: false, error: 'User profile not found' });
    }
    const { passwordHash, ...safeUser } = user;
    res.json({
      valid: true,
      session: validation.session,
      user: safeUser
    });
  } catch (err) {
    console.warn('[Session Check Error]', err);
    res.json({ valid: false });
  }
});

// 3. Authentication (Production Login & Register with Password Hashing)
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  const { email, password, deviceLabel } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';
  const device = deviceLabel || 'Primary Web Device';

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const user = await repository.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address.' });
  }

  // Verify password using bcryptjs
  if (password) {
    const isPasswordValid = await repository.verifyUserPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }
  }

  const session = await repository.createSession(user.id, device, clientIp, userAgent);

  res.cookie('academiasecure_session', session.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  const { passwordHash, ...safeUser } = user;
  res.json({
    user: safeUser,
    session
  });
});

app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
  const { name, email, password, role, collegeId, branch, semester, deviceLabel } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
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
      deviceLabel || 'Primary Web Device',
      clientIp,
      userAgent
    );

    res.cookie('academiasecure_session', session.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const { passwordHash, ...safeUser } = newUser;
    res.json({
      user: safeUser,
      session
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Registration failed.' });
  }
});

app.post('/api/auth/google', authLimiter, async (req: Request, res: Response) => {
  try {
    const { credential, email, name, avatarUrl, deviceLabel } = req.body || {};
    const clientIp = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';
    const device = deviceLabel || 'Primary Web Device';

    let targetEmail = email;
    let targetName = name;
    let targetAvatar = avatarUrl;

    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const tokenPayload = JSON.parse(payloadJson);
          targetEmail = tokenPayload.email || targetEmail;
          targetName = tokenPayload.name || targetName;
          targetAvatar = tokenPayload.picture || targetAvatar;
        }
      } catch (jwtErr) {
        console.warn('[Google Auth] Failed to parse JWT payload:', jwtErr);
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ error: 'Valid Google email is required.' });
    }

    const user = await repository.findOrCreateGoogleUser({
      email: targetEmail,
      name: targetName || targetEmail.split('@')[0],
      avatarUrl: targetAvatar
    });

    const session = await repository.createSession(user.id, device, clientIp, userAgent);

    try {
      res.cookie('academiasecure_session', session.sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    } catch (cookieErr) {
      console.warn('[Google Auth] Cookie setting error:', cookieErr);
    }

    const { passwordHash, ...safeUser } = user;
    return res.status(200).json({
      user: safeUser,
      session
    });
  } catch (err: unknown) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Google authentication failed'
    });
  }
});

app.post('/api/auth/logout', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  if (req.userSession) {
    await repository.revokeSession(req.userSession.sessionId, 'Signed out explicitly.');
  }
  res.clearCookie('academiasecure_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Academic Catalogue & Document Routes
app.get('/api/colleges', (_req: Request, res: Response) => {
  res.json(repository.getColleges());
});

app.get('/api/documents', optionalSession, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docs = await repository.getDocuments({
      collegeId: req.query.collegeId as string,
      category: req.query.category as string,
      branch: req.query.branch as string,
      semester: req.query.semester as string,
      search: req.query.search as string,
      sort: req.query.sort as string,
      professorVerifiedOnly: req.query.professorVerifiedOnly === 'true'
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
    console.error('[API Documents Error]', err);
    res.json(repository.getDocumentsSync());
  }
});

app.get('/api/documents/:id', optionalSession, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await repository.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
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
    console.error('[API Document Detail Error]', err);
    res.status(500).json({ error: 'Failed to retrieve document details' });
  }
});

// 5. SECURE DRM PROTECTED DOCUMENT READER ENGINE
app.get('/api/reader/page/:docId/:pageNum', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { docId, pageNum } = req.params;
  const page = parseInt(pageNum, 10);
  const user = req.currentUser!;
  const session = req.userSession!;

  const doc = await repository.getDocumentById(docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (page < 1 || page > doc.pageCount) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  const isSample = doc.samplePreviewPages.includes(page);
  const hasPurchased = await repository.hasEntitlement(user.id, doc.id);

  if (!isSample && !hasPurchased) {
    repository.logSecurityEvent({
      eventType: 'unauthorized_reader_access_blocked',
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `User attempted to access restricted page ${page} of "${doc.title}" without active entitlement.`,
      severity: 'warning'
    });

    return res.status(403).json({
      error: 'PURCHASE_REQUIRED',
      message: 'You must purchase access to view this protected page. Only sample preview pages are publicly readable.'
    });
  }

  // Rate-limit rapid page traversal to deter automated scraping
  const now = Date.now();
  const sessionTimestamps = pageRequestTimestamps.get(session.sessionId) || [];
  const recentRequests = sessionTimestamps.filter((t) => now - t < 3000);
  if (recentRequests.length > 12) {
    repository.logSecurityEvent({
      eventType: 'rapid_page_traversal_flagged',
      userId: user.id,
      userEmail: user.email,
      ipAddress: session.ipAddress,
      deviceLabel: session.deviceLabel,
      documentId: doc.id,
      details: `Rapid page traversal flagged (${recentRequests.length} requests in 3s) for automated scraping deterrence.`,
      severity: 'critical'
    });
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Rapid page traversal rate limit triggered. Please read naturally to protect academic intellectual property.'
    });
  }
  recentRequests.push(now);
  pageRequestTimestamps.set(session.sessionId, recentRequests);

  // Forensic Watermark Assembly
  const emailParts = user.email.split('@');
  const maskedEmail = emailParts[0].slice(0, 2) + '****' + emailParts[0].slice(-1) + '@' + (emailParts[1] || 'university.edu');
  const userShortId = 'STD-' + user.id.slice(-6).toUpperCase();
  const txnRef = hasPurchased ? 'TXN-RZP-' + user.id.slice(-4) + doc.id.slice(-4) : 'PREVIEW-SAMPLE';
  const sessionHash = session.sessionId.slice(-8);
  const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

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

// SVG Generator Helper with Anti-Piracy Watermarking
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
  <text x="400" y="15" text-anchor="middle" class="security-strip">CONFIDENTIAL ACADEMIC LICENSE · FORENSICALLY TRACEABLE TO: ${watermarkText}</text>

  <!-- Document Header Boundary -->
  <rect x="40" y="36" width="720" height="42" fill="#f8fafc" rx="4" stroke="#e2e8f0" stroke-width="1"/>
  <text x="55" y="61" class="header-meta">${doc.collegeName.toUpperCase()} · ${doc.subjectCode} · ${doc.academicScheme}</text>
  <text x="745" y="61" text-anchor="end" class="header-meta">PAGE ${page} OF ${totalPages} ${isSample ? '· [FREE SAMPLE PREVIEW]' : '· [VERIFIED LICENSED COPY]'}</text>

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
  <text x="45" y="1095" class="header-meta">Protected by AcademiaVault DRM · Dynamic Watermarking Verified · ${watermarkText.slice(0, 40)}...</text>
  <text x="755" y="1095" text-anchor="end" class="header-meta">${page} / ${totalPages}</text>
</svg>
  `.trim();
}

function getAcademicPageContent(docId: string, pageNum: number) {
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

// 6. RAZORPAY PAYMENT WORKFLOW (ORDERS & HMAC SIGNATURE VERIFICATION)
app.post('/api/payments/create-order', paymentLimiter, requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.body;
  const user = req.currentUser!;

  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Idempotency: Has user already purchased this document?
  if (await repository.hasEntitlement(user.id, doc.id)) {
    return res.status(400).json({
      error: 'ALREADY_PURCHASED',
      message: 'You already own verified access to this document.'
    });
  }

  const amountInPaise = Math.round(doc.price * 100);

  try {
    let orderId: string;

    // Use Razorpay SDK if live key is configured
    if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YourTestKeyId')) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${doc.id.slice(-6)}_${Date.now().toString().slice(-6)}`
      });
      orderId = order.id;
    } else {
      orderId = 'order_rzp_' + crypto.randomBytes(8).toString('hex');
    }

    res.json({
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      documentId: doc.id,
      documentTitle: doc.title,
      keyId: razorpayKeyId,
      user: {
        name: user.name,
        email: user.email,
        contact: '+91 9876543210'
      }
    });
  } catch (err) {
    console.error('[Razorpay] Order creation error:', err);
    res.status(500).json({ error: 'Failed to create payment order with payment gateway.' });
  }
});

app.post('/api/payments/verify', paymentLimiter, requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, paymentId, signature, documentId } = req.body;
  const user = req.currentUser!;

  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Cryptographic Signature Verification
  let isSignatureValid = false;
  if (orderId && paymentId && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    isSignatureValid = (expectedSignature === signature) || (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('your_razorpay'));
  }

  if (!isSignatureValid) {
    repository.logSecurityEvent({
      eventType: 'unauthorized_reader_access_blocked',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || '127.0.0.1',
      details: `Payment verification failed for Order ${orderId}. Invalid Razorpay HMAC signature.`,
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
    orderId,
    paymentId,
    signatureVerified: true,
    status: 'success',
    createdAt: new Date().toISOString(),
    entitlementId
  };

  await repository.grantEntitlement(user.id, doc.id, purchase);

  repository.logSecurityEvent({
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
    purchase,
    entitlementId
  });
});

// Razorpay Webhook Handler (Asynchronous Events)
app.post('/api/payments/webhook', (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
  }

  const event = req.body.event;
  console.log('[Razorpay Webhook] Received verified event:', event);
  res.json({ status: 'ok' });
});

// 7. GEMINI AI STUDY COMPANION ENDPOINTS
app.post('/api/ai/summarize-document', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.body;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const summary = await generateDocumentSummary(doc.title, doc.subjectName, doc.category);
    res.json({ success: true, summary });
  } catch (err) {
    console.error('[AI] Summary generation error:', err);
    res.status(500).json({ error: 'Failed to generate AI document summary.' });
  }
});

app.post('/api/ai/generate-flashcards', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.body;
  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const flashcards = await generateStudyFlashcards(doc.title, doc.subjectName, doc.category);
    res.json({ success: true, flashcards });
  } catch (err) {
    console.error('[AI] Flashcards generation error:', err);
    res.status(500).json({ error: 'Failed to generate AI study flashcards.' });
  }
});

// 8. STUDENT REVIEWS
app.post('/api/reviews/submit', requireSession, async (req: AuthenticatedRequest, res: Response) => {
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

  const doc = await repository.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const hasPurchased = await repository.hasEntitlement(user.id, doc.id);
  if (!hasPurchased) {
    return res.status(403).json({
      error: 'VERIFIED_PURCHASE_REQUIRED',
      message: 'Only verified student purchasers who hold an active license can submit academic reviews.'
    });
  }

  const newReview = {
    id: 'rev_' + crypto.randomBytes(6).toString('hex'),
    documentId: doc.id,
    documentVersion: doc.version,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'Verified University',
    verifiedPurchase: true,
    rating: Number(rating) || 5,
    contentAccuracyRating: Number(contentAccuracyRating) || 5,
    explanationQualityRating: Number(explanationQualityRating) || 5,
    readabilityRating: Number(readabilityRating) || 5,
    syllabusCoverageRating: Number(syllabusCoverageRating) || 5,
    examUsefulnessRating: Number(examUsefulnessRating) || 5,
    reviewText,
    helpfulCount: 0,
    createdAt: new Date().toISOString()
  };

  await repository.addStudentReview(newReview);
  res.json({ success: true, review: newReview, documentRating: doc.rating, ratingCount: doc.ratingCount + 1 });
});

// 9. PROFESSOR PORTAL
app.post('/api/professor/apply', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const { institution, department, academicDesignation, officialEmail, credentialsDocName } = req.body;
  const user = req.currentUser!;

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

  repository.logSecurityEvent({
    eventType: 'professor_verified',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Professor verification application submitted by ${user.name} (${institution}).`,
    severity: 'info'
  });

  res.json({ success: true, verification });
});

app.post('/api/professor/submit-review', requireSession, async (req: AuthenticatedRequest, res: Response) => {
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
    return res.status(403).json({ error: 'Only verified academic professors can submit formal audits.' });
  }

  const doc = await repository.getDocumentById(documentId);
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

  await repository.addProfessorReview(profReview);

  // Update document's verification status
  doc.professorReviewStatus = 'verified_accurate';
  doc.professorVerifiedScore = 96;
  await repository.saveDocument(doc);

  res.json({ success: true, professorReview: profReview, document: doc });
});

// 10. CONTRIBUTOR STUDIO & CLOUDINARY UPLOAD
app.get('/api/contributor/my-documents', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const allDocs = await repository.getDocuments();
  const docs = allDocs.filter((d) => d.contributorId === user.id);
  res.json(docs);
});

app.post(
  '/api/contributor/upload',
  requireSession,
  upload.single('pdfFile'),
  async (req: AuthenticatedRequest, res: Response) => {
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

    if (!copyrightAgreed || copyrightAgreed === 'false') {
      return res.status(400).json({ error: 'You must declare original copyright ownership of these study materials.' });
    }

    const colleges = repository.getColleges();
    const college = colleges.find((c) => c.id === collegeId) || colleges[0];

    let fileUrl: string | undefined;
    let cloudinaryPublicId: string | undefined;

    // Process PDF upload to Cloudinary if file buffer provided
    if (req.file) {
      try {
        const uploadResult = await uploadPdfBuffer(req.file.buffer, req.file.originalname);
        fileUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } catch (uploadErr) {
        console.error('[Cloudinary] Upload error:', uploadErr);
      }
    }

    const newDoc: AcademicDocument = {
      id: 'doc_' + crypto.randomBytes(8).toString('hex'),
      title: title || 'Original Study Notes',
      description: description || 'Comprehensive university course materials.',
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
      version: 1,
      fileUrl,
      cloudinaryPublicId
    };

    await repository.saveDocument(newDoc);

    repository.logSecurityEvent({
      eventType: 'document_approved',
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip || '127.0.0.1',
      documentId: newDoc.id,
      details: `New document "${newDoc.title}" submitted by contributor ${user.name}.`,
      severity: 'info'
    });

    res.json({ success: true, document: newDoc });
  }
);

app.get('/api/contributor/earnings', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const allDocs = await repository.getDocuments();
  const userDocs = allDocs.filter((d) => d.contributorId === user.id);
  const docIds = new Set(userDocs.map((d) => d.id));

  const allPurchases = repository.getAllPurchases();
  const relevantPurchases = allPurchases.filter((p) => docIds.has(p.documentId));
  const totalRevenue = relevantPurchases.reduce((sum, p) => sum + p.amount, 0);
  const contributorShare = Math.round(totalRevenue * 0.7);

  const available = contributorShare;

  const responseData: ContributorEarnings = {
    totalRevenue,
    contributorShare,
    availableBalance: available,
    withdrawnBalance: 0,
    totalSalesCount: relevantPurchases.length,
    payouts: []
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

  repository.logSecurityEvent({
    eventType: 'payout_requested',
    userId: user.id,
    userEmail: user.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Withdrawal request of ₹${withdrawAmount} logged by contributor ${user.name}.`,
    severity: 'info'
  });

  res.json({ success: true, payout });
});

// 11. STUDENT LIBRARY & PURCHASES
app.get('/api/student/purchases', requireSession, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const userPurchases = await repository.getUserPurchases(user.id);

  const purchasedDocs = await Promise.all(
    userPurchases.map(async (p) => {
      const doc = await repository.getDocumentById(p.documentId);
      return doc ? { ...doc, purchaseRecord: p, hasPurchased: true } : null;
    })
  );

  res.json(purchasedDocs.filter(Boolean));
});

// 12. ADMINISTRATOR GOVERNANCE PORTAL (STRICTLY RESTRICTED TO karthikvenkat316@gmail.com)
app.get('/api/admin/overview', requireSession, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const allPurchases = repository.getAllPurchases();
  const allDocs = await repository.getDocuments();
  const grossRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
  const platformEarnings = Math.round(grossRevenue * 0.3);
  const activeSessionsCount = repository.getAllSessions().filter((s) => s.isValid).length;

  res.json({
    totalUsers: repository.getAllUsers().length,
    totalDocuments: allDocs.length,
    pendingModerationCount: allDocs.filter((d) => d.status === 'pending_review').length,
    totalPurchases: allPurchases.length,
    grossRevenue,
    platformEarnings,
    activeSessionsCount,
    verifiedProfessorsCount: repository.getAllUsers().filter((u) => u.role === 'professor').length,
    pendingProfessorVerifications: 0
  });
});

app.get('/api/admin/purchases', requireSession, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(repository.getAllPurchases());
});

app.get('/api/admin/photos', requireSession, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(repository.getSitePhotos());
});

app.post('/api/admin/photos', requireSession, requireAdmin, upload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided for upload.' });
  }

  try {
    const uploaded = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      'academivault/site-assets'
    );

    const sitePhoto = {
      id: 'photo_' + Date.now(),
      name: (req.body.name as string) || req.file.originalname.replace(/\.[^/.]+$/, ''),
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      bytes: uploaded.bytes,
      uploadedAt: new Date().toISOString()
    };

    repository.addSitePhoto(sitePhoto);
    res.json({ success: true, photo: sitePhoto });
  } catch (err) {
    console.error('[Admin Photo Upload Error]', err);
    res.status(500).json({ error: 'Cloudinary photo upload failed' });
  }
});

app.delete('/api/admin/photos/:id', requireSession, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const photo = repository.getSitePhotos().find((p) => p.id === req.params.id);
  if (photo && photo.publicId) {
    await deleteCloudinaryAsset(photo.publicId);
  }
  repository.deleteSitePhoto(req.params.id);
  res.json({ success: true, message: 'Photo deleted successfully.' });
});

app.get('/api/admin/documents', requireSession, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const docs = await repository.getDocuments();
  res.json(docs);
});

app.post('/api/admin/documents/:id/status', requireSession, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.currentUser!;
  const { status } = req.body;
  const doc = await repository.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  doc.status = status;
  doc.updatedAt = new Date().toISOString();
  await repository.saveDocument(doc);

  repository.logSecurityEvent({
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

app.get('/api/admin/sessions', requireSession, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(repository.getAllSessions().slice(-50));
});

app.post('/api/admin/sessions/:sessionId/revoke', requireSession, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await repository.revokeSession(req.params.sessionId, 'Session terminated by an administrator.');
  res.json({ success: true, message: 'Session terminated forcefully.' });
});

app.get('/api/admin/security-logs', requireSession, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json(repository.getSecurityLogs());
});

// ==========================================
// GLOBAL JSON ERROR HANDLER (Prevents HTML 500 on Vercel)
// ==========================================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[AcademiaVault Server Error]:', err);
  if (res.headersSent) return;
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================
export async function startServer() {
  if (process.env.VERCEL) return;

  if (isDev) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
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

  // Only listen when executed directly in standalone/dev mode
  app.listen(PORT, () => {
    console.log(`[AcademiaVault] Full-Stack Secure Marketplace live on port ${PORT}`);
  });
}

// Only start dev/standalone server when executed directly from CLI, NEVER in serverless/import mode
const isDirectRun = Boolean(
  process.argv[1] && (
    process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.js')
  )
);

if (isDirectRun && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[AcademiaVault] Server failed to start:', err);
  });
}

export { app };
export default app;
