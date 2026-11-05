# AcademiaVault — Secure College Notes & Academic Marketplace

AcademiaVault is a production-grade, full-stack digital academic marketplace where students can discover, purchase, and securely view verified college notes, study materials, handwritten notes, assignments, question banks, and laboratory records.

---

## 1. Core Architecture & Security Innovations

### 1. Single-Device Session Enforcement (`ONE ACCOUNT = ONE ACTIVE DEVICE`)
- **Session Registry Engine**: The platform maintains a real-time session table where each user has at most one valid active session token (`x-session-id`).
- **Atomic Invalidation**: When a user logs in on Device B, Device A's session is atomically invalidated on the backend with the reason:
  > *"Your account was signed in on another device. Please log in again."*
- **Real-Time Client Interception**:
  - Continuous 4-second session heartbeat automatically detects concurrent logins even when idle.
  - Any protected request or reader page request returns `HTTP 401 SESSION_REVOKED_OR_EXPIRED`, immediately displaying the revocation modal on the superseded device.
- **Interactive Simulator**: The top security ribbon includes a **"Simulate 2nd Device Login"** button, allowing instant, hands-on demonstration of atomic device revocation.

---

### 2. Multi-Tier DRM & Protected Document Reader
Students purchase permission to view high-value academic materials, **NOT** unrestricted raw PDF ownership.

1. **Private Cloud Storage & No Raw PDF Endpoints**:
   - Original PDF files are never exposed publicly to client browsers.
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

---

### 3. Razorpay Payment Gateway & Entitlement Workflow
1. Student clicks **Purchase**.
2. Frontend requests `/api/payments/create-order`.
3. Backend fetches the authentic document price from the database (never trusts frontend values) and generates the Razorpay Order.
4. Razorpay Checkout collects payment.
5. Backend verifies the HMAC-SHA256 signature (`crypto.createHmac('sha256', secret)`).
6. Upon verified payment, the backend idempotently issues an immutable **Entitlement** and credits the author with a 70% royalty share.

---

### 4. Academic Rigor & Peer Review System
- **Student Verified Reviews**: Only students with a verified purchase record can write reviews with multi-criteria scores (Content Accuracy, Explanation Quality, Readability, Syllabus Coverage, Exam Usefulness).
- **Professor Verification & Academic Audits**:
  - Faculty members submit institutional credentials and official `.edu` emails.
  - Verified professors conduct formal audits evaluating Technical Correctness, Asymptotic Proofs, and Syllabus Alignment.
  - Documents awarded the **Professor Verified** badge display complete score breakdowns on their product page.

---

### 5. Multi-Role Workspaces
- **Student Library**: View purchased notes, launch DRM reader, write verified reviews, monitor active device session.
- **Contributor Studio**: Upload original academic documents, complete copyright ownership declarations, calculate royalty splits (70% author / 30% platform), view sales analytics, request payouts.
- **Professor Portal**: Submit verification credentials, audit student documents across 6 formal criteria.
- **Administrator Governance**: Moderate uploaded documents, terminate active device sessions forcefully, inspect DRM security logs.

---

## 2. Environment Variables (`.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Dev server port | `3000` |
| `APP_URL` | Application URL | `http://localhost:3000` |
| `FIREBASE_PROJECT_ID` | Cloud Firestore Project ID | `academiasecure-marketplace` |
| `CLOUDINARY_CLOUD_NAME` | Private asset storage | `academia-vault` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET`| Razorpay HMAC Secret | `...` |
| `SESSION_SECRET` | Token encryption secret | `...` |

---

## 3. Quick Test Guide

1. **Test Single-Device Revocation**:
   - Notice the top dark ribbon displaying: `Active Session: Chrome Linux (Device A)`.
   - Click the **"Simulate 2nd Device Login"** button.
   - Notice how Device A's session is immediately invalidated, bringing up the modal:
     *"Your account was signed in on another device. Please log in again."*
2. **Test DRM Document Reader**:
   - Click any document (e.g. *Data Structures & Algorithms*).
   - Click **"Open Free Sample"** or **"Read (Owned)"**.
   - Inspect the forensic watermark repeating across the page.
   - Try zooming, bookmarking, and flipping pages.
3. **Test Role Switching**:
   - Click **Student**, **Contributor**, **Professor**, or **Admin** in the top ribbon to inspect role-specific capabilities.
