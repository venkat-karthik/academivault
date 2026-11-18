# AcademiaVault — Secure College Notes & Academic Marketplace

AcademiaVault is a production-grade, full-stack digital academic marketplace where students can discover, purchase, and securely view verified college notes, study materials, handwritten notes, assignments, question banks, and laboratory records.

---

## 1. Core Architecture & Security Innovations

### 1. Single-Device Session Enforcement (`ONE ACCOUNT = ONE ACTIVE DEVICE`)
- **Session Registry Engine**: The platform maintains an atomic Firestore session registry where each authenticated user has at most one valid active device session token (`x-session-id`).
- **Atomic Invalidation**: When a user logs in on Device B, Device A's session is atomically invalidated on the backend with the reason:
  > *"Your account was signed in on another device. Please log in again."*
- **Real-Time Client Interception**:
  - Continuous session heartbeat automatically detects concurrent logins even when idle.
  - Any protected request or reader page request returns `HTTP 401 SESSION_REVOKED_OR_EXPIRED`, immediately displaying the revocation modal on the superseded device.

---

### 2. Multi-Tier DRM & Protected Document Reader
Students purchase permission to view high-value academic materials, **NOT** unrestricted raw PDF ownership.

1. **Private Cloud Storage & No Raw PDF Endpoints**:
   - Original PDF files are stored in Cloudinary's authenticated private tier and never exposed publicly to client browsers.
   - Reader requests require an active purchase entitlement and an authenticated device session.
2. **Dynamic Forensic Watermarking**:
   - Every page is rendered on the server with multi-tier diagonal forensic watermarks.
   - Watermark embeds:
     - Student masked email (`r****l@iitb.ac.in`)
     - Unique student identifier (`STD-RAHUL-782`)
     - Immutable purchase/transaction reference (`TXN-RZP-902341`)
     - Active session hash (`SESS-8f3a9b`)
     - Live UTC timestamp
   - Subtle repeating diagonal pattern (-26° rotation) prevents easy cropping and enables immediate forensic tracing in the event of camera captures.
3. **Capture & Print Deterrents**:
   - Text selection (`user-select: none`) and context menu disabled.
   - CSS `@media print` rules hide the document surface and render an unauthorized printing warning.
   - Rapid traversal detection flags and blocks automated page scraping.
4. **Gemini AI Academic Study Companion**:
   - Entitled students can access AI-generated chapter key concepts, syllabus summaries, and interactive revision flashcards powered by Google Gemini AI.

---

### 3. Razorpay Payment Gateway & Entitlement Workflow
1. Student clicks **Purchase Access**.
2. Frontend requests `/api/payments/create-order`.
3. Backend fetches the authentic document price from Firestore (never trusting client values) and generates the Razorpay Order.
4. Razorpay Checkout collects payment via UPI, Credit/Debit Cards, or NetBanking.
5. Backend verifies the cryptographic HMAC-SHA256 signature (`crypto.createHmac('sha256', secret)`).
6. Upon verified payment, the backend idempotently issues an immutable **Entitlement** in Firestore and credits the author with a 70% royalty share.
7. Asynchronous webhooks (`/api/payments/webhook`) handle payment state updates.

---

### 4. Academic Rigor & Peer Review System
- **Student Verified Reviews**: Only students with a verified purchase record can write reviews with multi-criteria scores (Content Accuracy, Explanation Quality, Readability, Syllabus Coverage, Exam Usefulness).
- **Professor Verification & Academic Audits**:
  - Faculty members submit institutional credentials and official university emails.
  - Verified professors conduct formal audits evaluating Technical Correctness, Asymptotic Proofs, and Syllabus Alignment.
  - Documents awarded the **Professor Verified** badge display complete score breakdowns on their product page.

---

### 5. Multi-Role Workspaces
- **Student Library**: View purchased notes, launch DRM reader, write verified reviews, monitor active device session.
- **Contributor Studio**: Upload original academic PDF documents, complete copyright declarations, calculate royalty splits (70% author / 30% platform), view sales analytics, request payouts.
- **Professor Portal**: Submit verification credentials, audit student documents across 6 formal criteria.
- **Administrator Governance**: Moderate uploaded documents, terminate active device sessions forcefully, inspect DRM security logs.

---

## 2. Production Deployment (Vercel)

AcademiaVault is configured for instant serverless deployment on Vercel:

1. **Vercel Build Command**: `bun run build` (or `npm run build`)
2. **Output Directory**: `dist`
3. **Serverless Functions**: Express API mounted at `/api/index.ts` via `vercel.json`.

### Environment Variables on Vercel

Configure these in **Vercel Project Settings > Environment Variables**:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment | `production` |
| `APP_URL` | Live production domain | `https://your-domain.vercel.app` |
| `FIREBASE_PROJECT_ID` | Cloud Firestore Project ID | Firebase Console |
| `FIREBASE_CLIENT_EMAIL`| Service Account Email | Firebase IAM |
| `FIREBASE_PRIVATE_KEY` | Service Account RSA Key | Firebase IAM |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Storage Cloud | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET`| Cloudinary Secret Key | Cloudinary Dashboard |
| `RAZORPAY_KEY_ID` | Razorpay Live Key ID | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay HMAC Secret | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET`| Webhook Signing Secret | Razorpay Webhooks |
| `GEMINI_API_KEY` | Google Gemini AI Key | Google AI Studio |
| `SESSION_SECRET` | Cryptographic JWT Secret | 64-char random hex |
