import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (server-side only)
const apps = getApps();

let isInitialized = false;
try {
    if (!apps.length) {
        if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            isInitialized = true;
        }
    } else {
        isInitialized = true;
    }
} catch (error) {
    console.warn('Firebase Admin SDK failed to initialize (likely missing config).', error);
}

// Return null or undefined if uninitialized so we can safely check
export const adminDb = isInitialized ? getFirestore() : null;
export const adminAuth = isInitialized ? getAuth() : null;

if (adminDb) {
    try {
        // Set Firestore settings — must be called before any other Firestore method
        // Wrapped in try-catch because Next.js hot reload can re-evaluate this module
        // while the Firestore instance persists, causing "already initialized" errors
        adminDb.settings({ ignoreUndefinedProperties: true });
    } catch {
        // Already initialized — safe to ignore
    }
}

