'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User as AuthUser } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { User as FirestoreUser } from '@/lib/types';


// --- TYPE DEFINITIONS ---

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface FirebaseProviderProps extends FirebaseServices {
  children: ReactNode;
}

// Since login is removed, user state is simplified
interface UserAuthState {
  user: AuthUser | null;
  profile: FirestoreUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// The combined state for the entire context
type FirebaseContextState = FirebaseServices & UserAuthState;

// --- CONTEXT CREATION ---

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // Since login is removed, we can provide a default non-loading state.
  // The user will be null, and we can mock a superadmin profile to grant access to all sections.
  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user: null, // No authenticated user
    profile: { // Mock a superadmin profile to unlock all UI elements
      id: 'mock-superadmin',
      email: 'admin@local.host',
      name: 'Super Admin',
      role: 'superadmin',
      area: 'administracion',
      isActive: true,
      creationDate: new Date(),
      createdBy: 'system',
      lastAccess: new Date(),
    },
    isUserLoading: false, // Loading is always false
    userError: null,
  }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


// --- HOOKS ---

function useFirebaseContext(): FirebaseContextState {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
  }
  return context;
}

export const useFirebase = (): FirebaseServices & UserAuthState => {
  return useFirebaseContext();
};

export const useAuth = (): Auth => {
  return useFirebaseContext().auth;
};

export const useFirestore = (): Firestore => {
  return useFirebaseContext().firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  return useFirebaseContext().firebaseApp;
};

export const useUser = (): UserAuthState & { auth: Auth } => {
  const { user, profile, isUserLoading, userError, auth } = useFirebaseContext();
  return { user, profile, isUserLoading, userError, auth };
};

// --- UTILITY HOOKS ---

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null && !Object.isFrozen(memoized)) {
    try {
        (memoized as MemoFirebase<T>).__memo = true;
    } catch (e) {
        // This can happen if the object is not extensible
    }
  }
  return memoized;
}
