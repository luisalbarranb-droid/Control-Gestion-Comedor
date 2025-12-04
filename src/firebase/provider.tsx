'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User as AuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { User as FirestoreUser } from '@/lib/types';

// --- SIMULACIÓN PARA DESARROLLO ---
const MOCK_USER: AuthUser = {
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
  getIdTokenResult: async () => ({ 
    token: 'mock-token', 
    claims: {}, 
    signInProvider: null, 
    expirationTime: '' 
  }),
  reload: async () => {},
  toJSON: () => ({})
} as any;

const MOCK_PROFILE: FirestoreUser = {
  id: 'dev-superadmin-uid-123',
  userId: 'dev-superadmin-uid-123',
  email: 'superadmin@restaurante.com',
  name: 'Super Administrador',
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

interface FirebaseProviderProps extends FirebaseServices {
  children: ReactNode;
}

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
  // EN DESARROLLO: Siempre devolvemos el usuario mock para forzar el rol de superadmin
  const [userAuthState] = useState<UserAuthState>({
    user: MOCK_USER,
    profile: MOCK_PROFILE,
    isUserLoading: false,
    userError: null,
  });

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user: userAuthState.user,
    profile: userAuthState.profile,
    isUserLoading: userAuthState.isUserLoading,
    userError: userAuthState.userError,
  }), [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {process.env.NODE_ENV === 'production' ? <FirebaseErrorListener /> : null}
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
  // En el modo simulado, la memoización estricta no es necesaria, pero mantenemos el hook
  // para consistencia de la API.
  return useMemo(factory, deps);
}

// HOOK ESPECIAL PARA MainNav (Simulado)
export const useDoc = <T,>(docRef: any): { data: T | null, isLoading: boolean, error: Error | null } => {
  // Devuelve el perfil simulado para cualquier llamada a useDoc
  return {
    data: MOCK_PROFILE as T,
    isLoading: false,
    error: null
  };
};
