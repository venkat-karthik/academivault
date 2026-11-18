import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

let db: Firestore | null = null;
let isConfigured = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey && !privateKey.includes('...')) {
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
    console.log('[AcademiaVault] Cloud Firestore initialized with project:', projectId);
  } else {
    console.warn('[AcademiaVault] Firebase credentials not fully configured or using template keys in .env. Running in hybrid persistence mode.');
  }
} catch (err) {
  console.error('[AcademiaVault] Failed to initialize Firebase Admin SDK:', err);
}

export { db as firestoreDb, isConfigured as isFirestoreConfigured };
