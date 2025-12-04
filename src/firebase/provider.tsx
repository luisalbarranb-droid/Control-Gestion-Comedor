'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { User as FirestoreUser } from '@/lib/types';

// Mock data para desarrollo
const MOCK_USER = {
  uid: 'dev-superadmin-uid',
  email: 'arvecladu@gmail.com',
  displayName: 'Super Admin'
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
  const [isLoading] = useState(false); // No hay loading en desarrollo

  const contextValue: FirebaseContextType = {
    firebaseApp,
    firestore,
    auth,
    user: MOCK_USER,
    profile: MOCK_PROFILE,
    isUserLoading: isLoading
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
       <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

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
    auth,
    // Para compatibilidad
    data: profile
  };
};

export const useFirestore = (): Firestore => {
    const context = useContext(FirebaseContext);
    if (!context) throw new Error('useFirestore must be used within FirebaseProvider');
    return context.firestore;
};

export const useAuth = (): Auth => {
    const context = useContext(FirebaseContext);
    if (!context) throw new Error('useAuth must be used within FirebaseProvider');
    return context.auth;
};

export const useFirebaseApp = (): FirebaseApp => {
    const context = useContext(FirebaseContext);
    if (!context) throw new Error('useFirebaseApp must be used within FirebaseProvider');
    return context.firebaseApp;
};

// Mock para useDoc
export const useDoc = <T,>(docRef: any) => {
  return {
    data: MOCK_PROFILE as T,
    isLoading: false,
    error: null
  };
};

// Mock para useMemoFirebase
export const useMemoFirebase = <T,>(factory: () => T, deps: any[]): T => {
  // En este mock, simplemente re-ejecutamos la factory,
  // en una app real, usarías useMemo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps);
};
