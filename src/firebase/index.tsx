
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

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

// --- Context and Provider ---
interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const value = useMemo(() => ({ firebaseApp, auth, firestore }), []);

  return (
    <FirebaseContext.Provider value= { value } >
    { children }
    < FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

// --- Status Hooks ---
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp => {
  return useFirebase().firebaseApp;
}

export const useAuth = (): Auth => {
  return useFirebase().auth;
};

export const useFirestore = (): Firestore => {
  return useFirebase().firestore;
};

export const useMemoFirebase = <T,>(
  factory: () => T,
  deps: React.DependencyList | undefined
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  if (memoized && typeof memoized === 'object' && !('__memo' in memoized)) {
    try {
      (memoized as any).__memo = true
    } catch {
      // ignore, this is a best effort
    }
  }
  return memoized;
}

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
