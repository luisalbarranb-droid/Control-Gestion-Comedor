'use client';

import React, { createContext, useContext, ReactNode, DependencyList, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { User as FirestoreUser } from '@/lib/types';

// DATOS DE PRUEBA - SIMULAN UN SUPER ADMIN
const MOCK_USER = {
  uid: 'dev-superadmin-123',
  email: 'superadmin@restaurante.com',
  displayName: 'Super Administrador'
};

const MOCK_PROFILE: FirestoreUser = {
  id: 'dev-superadmin-123',
  email: 'superadmin@restaurante.com',
  name: 'Super Administrador',
  role: 'superadmin' as const,
  creationDate: new Date(),
  lastAccess: new Date(),
  isActive: true,
  area: 'administracion',
  createdBy: 'system'
};

interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: any;
  profile: any;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {
  
  const contextValue: FirebaseContextType = {
    firebaseApp,
    firestore,
    auth,
    user: MOCK_USER,
    profile: MOCK_PROFILE,
    isUserLoading: false  // No hay loading en desarrollo
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

// HOOKS SIMPLIFICADOS
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
};

export const useUser = () => {
  const { user, profile, isUserLoading, auth } = useFirebase();
  return { 
    user, 
    profile, 
    isUserLoading, 
    userError: null, 
    auth 
  };
};

export const useFirestore = (): Firestore => useFirebase().firestore;
export const useAuth = (): Auth => useFirebase().auth;
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;

// SIMULACIÓN DE useDoc (para MainNav)
export const useDoc = <T,>(docRef: any) => {
  return {
    data: MOCK_PROFILE as T,
    isLoading: false,
    error: null
  };
};

type MemoFirebase<T> = T & { __memo?: boolean };

// SIMULACIÓN DE useMemoFirebase
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
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