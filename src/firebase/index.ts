
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

export { firebaseApp, auth, firestore, onAuthStateChanged, getApps, getApp };
export type { User };

// --- Main Provider and Hooks ---
export * from './provider';

// --- Firestore Operations ---
export * from './firestore-operations';

// --- Real-time Firestore hooks ---
export * from './firestore/use-collection';
export * from './firestore/use-doc';

// --- Authentication hooks and logic ---
export * from './auth/use-user';
export * from './auth-operations';


// --- Error Handling ---
export * from './errors';
export * from './error-emitter';
