import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// Initialize Firebase
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

export { firebaseApp, auth, firestore, onAuthStateChanged };
export type { User };

// --- Main Provider and Hooks ---
export * from './provider';

// --- Non-blocking Firestore updates ---
export * from './non-blocking-updates';

// --- Real-time Firestore hooks ---
export * from './firestore/use-collection';
export * from './firestore/use-doc';

// --- Authentication hooks and logic ---
export * from './auth/use-user';
export * from './non-blocking-login';

// --- Error Handling ---
export * from './errors';
export * from './error-emitter';