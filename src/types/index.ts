export type UserRole = 'student' | 'contributor' | 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  collegeId?: string;
  collegeName?: string;
  branch?: string;
  semester?: number;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  deviceLabel: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivityAt: string;
  isValid: boolean;
  invalidatedReason?: string;
}

export type DocumentCategory =
  | 'handwritten_notes'
  | 'digital_notes'
  | 'question_banks'
  | 'previous_question_papers'
  | 'assignments'
  | 'laboratory_records'
  | 'practical_manuals'
  | 'projects_and_reports'
  | 'exam_preparation_packs'
  | 'complete_subject_materials';

export type DocumentStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended';
export type ProfessorReviewStatus = 'not_reviewed' | 'under_review' | 'verified_accurate' | 'needs_revision';

export interface AcademicDocument {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  collegeId: string;
  collegeName: string;
  universityName: string;
  branch: string;
  semester: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  module?: string;
  academicScheme: string;
  pageCount: number;
  language: string;
  price: number; // in INR
  originalPrice?: number;
  contributorId: string;
  contributorName: string;
  contributorCollege: string;
  coverImageUrl?: string;
  status: DocumentStatus;
  samplePreviewPages: number[]; // e.g. [1, 2]
  totalSales: number;
  rating: number; // e.g. 4.8
  ratingCount: number;
  professorReviewStatus: ProfessorReviewStatus;
  professorVerifiedScore?: number; // out of 100
  createdAt: string;
  updatedAt: string;
  version: number;
  // Private backend properties never sent directly in public views
  hasPurchased?: boolean;
}

export interface DocumentPageContent {
  pageNumber: number;
  totalPages: number;
  documentId: string;
  title: string;
  subject: string;
  college: string;
  watermark: {
    userEmailMasked: string;
    studentId: string;
    transactionRef: string;
    sessionHash: string;
    timestamp: string;
  };
  svgDataUri: string; // Dynamic rendered watermarked vector/graphic page representation
  isSample: boolean;
}

export interface StudentReview {
  id: string;
  documentId: string;
  documentVersion: number;
  userId: string;
  userName: string;
  userCollege: string;
  verifiedPurchase: boolean;
  rating: number;
  contentAccuracyRating: number;
  explanationQualityRating: number;
  readabilityRating: number;
  syllabusCoverageRating: number;
  examUsefulnessRating: number;
  reviewText: string;
  helpfulCount: number;
  createdAt: string;
}

export interface ProfessorVerification {
  id: string;
  userId: string;
  fullName: string;
  institution: string;
  department: string;
  academicDesignation: string;
  officialEmail: string;
  credentialsDocName: string;
  status: 'pending' | 'verified' | 'rejected';
  appliedAt: string;
  verifiedAt?: string;
  adminNotes?: string;
}

export interface ProfessorReview {
  id: string;
  documentId: string;
  documentVersion: number;
  professorId: string;
  professorName: string;
  institution: string;
  department: string;
  technicalCorrectnessScore: number; // 1-10
  academicAccuracyScore: number;     // 1-10
  conceptualExplanationScore: number;// 1-10
  syllabusAlignmentScore: number;    // 1-10
  completenessScore: number;         // 1-10
  referenceQualityScore: number;     // 1-10
  overallQualityRating: number;      // 1-5
  detailedFeedback: string;
  recommendation: 'highly_recommended' | 'recommended' | 'acceptable' | 'revision_needed';
  conflictOfInterestDisclosure: string;
  createdAt: string;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  userEmail: string;
  documentId: string;
  documentTitle: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  signatureVerified: boolean;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  entitlementId: string;
}

export interface ContributorEarnings {
  totalRevenue: number;
  contributorShare: number; // 70%
  availableBalance: number;
  withdrawnBalance: number;
  totalSalesCount: number;
  payouts: PayoutRecord[];
}

export interface PayoutRecord {
  id: string;
  contributorId: string;
  amount: number;
  bankDetailsMasked: string;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface SecurityEventLog {
  id: string;
  eventType:
    | 'login_success'
    | 'session_invalidated_concurrent_login'
    | 'unauthorized_reader_access_blocked'
    | 'rapid_page_traversal_flagged'
    | 'print_screen_attempt_deterred'
    | 'document_approved'
    | 'payout_requested'
    | 'professor_verified';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  deviceLabel?: string;
  documentId?: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  type: 'IIT' | 'NIT' | 'BITS' | 'State University' | 'Autonomous' | 'Affiliated';
  universityName: string;
  branches: string[];
}
