// Only import types during SSR, actual Firebase modules are imported dynamically
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAAAqq-js4-AhYSJal5H4iQnRZxDiqyfXU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'peppapp-e5a9d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'peppapp-e5a9d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'peppapp-e5a9d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '342675200577',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - lazy initialization for client-side only
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let initPromise: Promise<void> | null = null;

// Initialize Firebase only on client side
async function initializeFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  // Return existing initialization promise if already initializing
  if (initPromise) {
    return initPromise;
  }

  if (!app) {
    initPromise = (async () => {
      // Dynamic imports to avoid loading Firebase during SSR
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');

      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
      db = getFirestore(app);
    })();

    await initPromise;
  }
}

// Getter functions that ensure Firebase is initialized
export async function getFirebaseApp(): Promise<FirebaseApp | undefined> {
  await initializeFirebase();
  return app;
}

export async function getFirebaseAuth(): Promise<Auth | undefined> {
  await initializeFirebase();
  return auth;
}

export async function getFirebaseDb(): Promise<Firestore | undefined> {
  await initializeFirebase();
  return db;
}

// Legacy exports for backward compatibility (but these will be undefined until initialized)
export { app, auth, db };
