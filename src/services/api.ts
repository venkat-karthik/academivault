import {
  AcademicDocument,
  College,
  ContributorEarnings,
  DocumentPageContent,
  PayoutRecord,
  ProfessorReview,
  ProfessorVerification,
  PurchaseRecord,
  SecurityEventLog,
  StudentReview,
  User,
  UserSession
} from '../types';

let currentSessionId: string | null = null;
let onSessionRevokedCallback: ((message: string) => void) | null = null;

export const setSessionRevocationListener = (cb: (message: string) => void) => {
  onSessionRevokedCallback = cb;
};

export const setStoredSessionId = (id: string | null) => {
  currentSessionId = id;
  if (id) {
    sessionStorage.setItem('academiasecure_session_id', id);
  } else {
    sessionStorage.removeItem('academiasecure_session_id');
  }
};

export const getStoredSessionId = (): string | null => {
  if (!currentSessionId) {
    currentSessionId = sessionStorage.getItem('academiasecure_session_id');
  }
  return currentSessionId;
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const sid = getStoredSessionId();
  if (sid) {
    headers.set('x-session-id', sid);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401) {
    const errorJson = await response.json().catch(() => ({}));
    if (errorJson.error === 'SESSION_REVOKED_OR_EXPIRED') {
      if (onSessionRevokedCallback) {
        onSessionRevokedCallback(errorJson.message || 'Your account was signed in on another device. Please log in again.');
      }
    }
    throw new Error(errorJson.message || 'Session expired or revoked.');
  }

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || errorJson.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Session & Auth
  checkSession: async (): Promise<{ valid: boolean; session?: UserSession; user?: User; error?: string }> => {
    return apiFetch('/api/sessions/check');
  },

  simulateSecondDevice: async (userId: string, newDeviceLabel?: string) => {
    return apiFetch<{ message: string; newSessionId: string; newDeviceLabel: string }>('/api/sessions/simulate-second-device', {
      method: 'POST',
      body: JSON.stringify({ userId, newDeviceLabel })
    });
  },

  login: async (email: string, role?: string, deviceLabel?: string): Promise<{ user: User; session: UserSession }> => {
    const res = await apiFetch<{ user: User; session: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role, deviceLabel })
    });
    setStoredSessionId(res.session.sessionId);
    return res;
  },

  register: async (payload: {
    name: string;
    email: string;
    role: string;
    collegeId: string;
    branch?: string;
    semester?: number;
    deviceLabel?: string;
  }): Promise<{ user: User; session: UserSession }> => {
    const res = await apiFetch<{ user: User; session: UserSession }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStoredSessionId(res.session.sessionId);
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredSessionId(null);
    }
  },

  // Catalogue & Marketplace
  getColleges: async (): Promise<College[]> => {
    return apiFetch('/api/colleges');
  },

  getDocuments: async (filters: {
    collegeId?: string;
    category?: string;
    branch?: string;
    semester?: string;
    search?: string;
    sort?: string;
    professorVerifiedOnly?: boolean;
  } = {}): Promise<AcademicDocument[]> => {
    const params = new URLSearchParams();
    if (filters.collegeId) params.set('collegeId', filters.collegeId);
    if (filters.category) params.set('category', filters.category);
    if (filters.branch) params.set('branch', filters.branch);
    if (filters.semester) params.set('semester', filters.semester);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.professorVerifiedOnly) params.set('professorVerifiedOnly', 'true');

    return apiFetch(`/api/documents?${params.toString()}`);
  },

  getDocumentDetails: async (
    id: string
  ): Promise<{
    document: AcademicDocument;
    reviews: StudentReview[];
    professorReviews: ProfessorReview[];
  }> => {
    return apiFetch(`/api/documents/${id}`);
  },

  // DRM Reader Engine
  getReaderPage: async (
    docId: string,
    pageNum: number
  ): Promise<DocumentPageContent & { svgContent: string }> => {
    return apiFetch(`/api/reader/page/${docId}/${pageNum}`);
  },

  // Razorpay Checkout
  createPaymentOrder: async (
    documentId: string
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    documentId: string;
    documentTitle: string;
    keyId: string;
    user: { name: string; email: string; contact: string };
  }> => {
    return apiFetch('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ documentId })
    });
  },

  verifyPayment: async (payload: {
    orderId: string;
    paymentId: string;
    signature: string;
    documentId: string;
  }): Promise<{ success: boolean; purchase: PurchaseRecord; entitlementId: string }> => {
    return apiFetch('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Student Reviews
  submitStudentReview: async (payload: {
    documentId: string;
    rating: number;
    contentAccuracyRating: number;
    explanationQualityRating: number;
    readabilityRating: number;
    syllabusCoverageRating: number;
    examUsefulnessRating: number;
    reviewText: string;
  }): Promise<{ success: boolean; review: StudentReview; documentRating: number; ratingCount: number }> => {
    return apiFetch('/api/reviews/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Professor Portal
  applyProfessorVerification: async (payload: {
    institution: string;
    department: string;
    academicDesignation: string;
    officialEmail: string;
    credentialsDocName?: string;
  }): Promise<{ success: boolean; verification: ProfessorVerification }> => {
    return apiFetch('/api/professor/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  submitProfessorReview: async (payload: {
    documentId: string;
    technicalCorrectnessScore: number;
    academicAccuracyScore: number;
    conceptualExplanationScore: number;
    syllabusAlignmentScore: number;
    completenessScore: number;
    referenceQualityScore: number;
    overallQualityRating: number;
    detailedFeedback: string;
    recommendation: string;
    conflictOfInterestDisclosure: string;
  }): Promise<{ success: boolean; professorReview: ProfessorReview; document: AcademicDocument }> => {
    return apiFetch('/api/professor/submit-review', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Contributor
  getMyDocuments: async (): Promise<AcademicDocument[]> => {
    return apiFetch('/api/contributor/my-documents');
  },

  uploadDocument: async (payload: Partial<AcademicDocument> & { copyrightAgreed: boolean }): Promise<{
    success: boolean;
    document: AcademicDocument;
  }> => {
    return apiFetch('/api/contributor/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getContributorEarnings: async (): Promise<ContributorEarnings> => {
    return apiFetch('/api/contributor/earnings');
  },

  requestWithdrawal: async (payload: {
    amount: number;
    bankDetails: string;
  }): Promise<{ success: boolean; payout: PayoutRecord }> => {
    return apiFetch('/api/contributor/request-withdrawal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Student Library
  getStudentPurchases: async (): Promise<(AcademicDocument & { purchaseRecord: PurchaseRecord })[]> => {
    return apiFetch('/api/student/purchases');
  },

  // Admin
  getAdminOverview: async (): Promise<{
    totalUsers: number;
    totalDocuments: number;
    pendingModerationCount: number;
    totalPurchases: number;
    grossRevenue: number;
    platformEarnings: number;
    activeSessionsCount: number;
    verifiedProfessorsCount: number;
    pendingProfessorVerifications: number;
  }> => {
    return apiFetch('/api/admin/overview');
  },

  getAdminDocuments: async (): Promise<AcademicDocument[]> => {
    return apiFetch('/api/admin/documents');
  },

  updateAdminDocumentStatus: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; document: AcademicDocument }> => {
    return apiFetch(`/api/admin/documents/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },

  getAdminSessions: async (): Promise<UserSession[]> => {
    return apiFetch('/api/admin/sessions');
  },

  revokeAdminSession: async (sessionId: string): Promise<{ success: boolean }> => {
    return apiFetch(`/api/admin/sessions/${sessionId}/revoke`, {
      method: 'POST'
    });
  },

  getAdminSecurityLogs: async (): Promise<SecurityEventLog[]> => {
    return apiFetch('/api/admin/security-logs');
  }
};
