'use client';

import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import type { User as FirestoreUser } from '@/lib/types';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Mock data para desarrollo
const MOCK_USER = {
  uid: 'dev-superadmin-uid',
  email: 'admin@dev.com',
  displayName: 'Administrador DEV'
};

const MOCK_PROFILE: FirestoreUser = {
  id: 'dev-superadmin-uid',
  email: 'arvecladu@gmail.com',
  name: 'Super Admin',
  role: 'superadmin' as const,
  creationDate: new Date(),
  lastAccess: new Date(),
  isActive: true,
  area: 'administracion',
  createdBy: 'system'
};

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: any; // Using 'any' for mock user flexibility
  profile: FirestoreUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

type FirebaseContextState = FirebaseServices & UserAuthState;

const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {
  const [isLoading] = useState(false); // No hay loading en desarrollo

  const contextValue: FirebaseContextState = {
    firebaseApp,
    firestore,
    auth,
    user: MOCK_USER,
    profile: MOCK_PROFILE,
    isUserLoading: isLoading,
    userError: null
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

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
  const { user, profile, isUserLoading, userError, auth } = useFirebase();
  return { 
    user, 
    profile, 
    isUserLoading, 
    userError, 
    auth,
  };
};


export const useDoc = <T,>(docRef: any) => {
  return {
    data: MOCK_PROFILE as T,
    isLoading: false,
    error: null
  };
};

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  return memoized;
};
