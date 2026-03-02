import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK (server-side only)
const apps = getApps();
console.log("Apps count before:", apps.length);

let isInitialized = false;
try {
    if (!apps.length) {
        if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {

            // Fix double escaped newlines just in case
            let pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
            pk = pk.replace(/\\n/g, '\n').replace(/"/g, '');

            console.log("Attempting to initialize app with:", {
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                // Check if key is correctly formatted
                pkPreview: pk.substring(0, 30) + '...'
            });

            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID?.replace(/"/g, ''),
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/"/g, ''),
                    privateKey: pk,
                }),
            });
            isInitialized = true;
            console.log("App initialized successfully!");
        } else {
            console.error("No private key found in env");
        }
    } else {
        isInitialized = true;
    }
} catch (error) {
    console.warn('Firebase Admin SDK failed to initialize.', error);
}

const db = isInitialized ? getFirestore() : null;
console.log("DB generated:", db !== null);
