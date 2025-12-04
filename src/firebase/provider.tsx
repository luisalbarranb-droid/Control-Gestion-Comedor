
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, DocumentReference, DocumentData, FirestoreError, DocumentSnapshot, CollectionReference, Query, QuerySnapshot } from 'firebase/firestore';
import { Auth, User as AuthUser } from 'firebase/auth';
import type { User as FirestoreUser } from '@/lib/types';
import { UseDocResult, WithId, UseCollectionResult, InternalQuery } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// --- MOCK DATA PARA FORZAR SUPERADMIN ---
const MOCK_AUTH_USER: AuthUser = {
  uid: 'dev-superadmin-uid-123',
  email: 'superadmin@restaurante.com',
  displayName: 'Super Admin DEV',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, signInProvider: null, expirationTime: '' }),
  reload: async () => {},
  toJSON: () => ({})
} as any;

const MOCK_PROFILE: FirestoreUser = {
  id: 'dev-superadmin-uid-123',
  userId: 'dev-superadmin-uid-123',
  name: 'Super Administrador',
  email: 'superadmin@restaurante.com',
  role: 'superadmin',
  area: 'administracion',
  isActive: true,
  creationDate: new Date(),
  createdBy: 'system',
  lastAccess: new Date(),
};

// --- TYPE DEFINITIONS ---
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: AuthUser | null;
  profile: FirestoreUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

type FirebaseContextState = FirebaseServices & UserAuthState;

// --- CONTEXT CREATION ---
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const FirebaseProvider: React.FC<{ children: ReactNode; firebaseApp: FirebaseApp; firestore: Firestore; auth: Auth; }> = ({ children, firebaseApp, firestore, auth }) => {
  const contextValue: FirebaseContextState = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    user: MOCK_AUTH_USER,
    profile: MOCK_PROFILE,
    isUserLoading: false,
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

export const useFirebase = (): FirebaseServices & UserAuthState => useFirebaseContext();
export const useAuth = (): Auth => useFirebaseContext().auth;
export const useFirestore = (): Firestore => useFirebaseContext().firestore;
export const useFirebaseApp = (): FirebaseApp => useFirebaseContext().firebaseApp;

export const useUser = (): UserAuthState & { auth: Auth } => {
  const { auth } = useFirebaseContext();
  return {
    user: MOCK_AUTH_USER,
    profile: MOCK_PROFILE,
    isUserLoading: false,
    userError: null,
    auth,
  };
};

// --- UTILITY HOOKS ---
type MemoFirebase<T> = T & { __memo?: boolean };
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

    