'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// --- TYPE DEFINITIONS ---

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface FirebaseProviderProps extends FirebaseServices {
  children: ReactNode;
}

interface UserAuthState {
  user: User | null;
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
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: auth.currentUser, // Initialize with current user, might be null
    isUserLoading: true,      // Start loading until first check is complete
    userError: null,
  });

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserAuthState({ user, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: Auth state error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run effect if the auth instance changes

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user: userAuthState.user,
    isUserLoading: userAuthState.isUserLoading,
    userError: userAuthState.userError,
  }), [firebaseApp, firestore, auth, userAuthState]);

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
  const { user, isUserLoading, userError, auth } = useFirebaseContext();
  return { user, isUserLoading, userError, auth };
};

// --- UTILITY HOOKS ---

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as MemoFirebase<T>).__memo = true;
  }
  return memoized;
}
