
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { Auth, User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import type { User as FirestoreUser } from '@/lib/types';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { users as mockUsers } from '@/lib/placeholder-data';
import { useDoc } from './firestore/use-doc';

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

// --- MOCK DATA AND CONFIG ---
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

const MOCK_AUTH_STATE: UserAuthState = {
  user: MOCK_AUTH_USER,
  profile: MOCK_PROFILE,
  isUserLoading: false,
  userError: null,
};


// --- PROVIDER COMPONENT ---
export const FirebaseProvider: React.FC<{ children: ReactNode; firebaseApp: FirebaseApp; firestore: Firestore; auth: Auth; }> = ({ children, firebaseApp, firestore, auth }) => {
  const useMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

  const [user, setUser] = useState<AuthUser | null>(useMockAuth ? MOCK_AUTH_USER : null);
  const [isUserLoading, setIsUserLoading] = useState(!useMockAuth);
  const [userError, setUserError] = useState<Error | null>(null);

  // Real-time listener for user's Firestore profile
  const userDocRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<FirestoreUser>(userDocRef, { disabled: useMockAuth });

  // Effect for populating test data in mock mode
  useEffect(() => {
    if (useMockAuth) {
      const populateTestData = async () => {
        try {
          const usersCollectionRef = collection(firestore, 'users');
          const existingUsersSnapshot = await getDocs(usersCollectionRef);
          if (existingUsersSnapshot.empty) {
              console.log("No users found. Creating mock users for development...");
              const batch = writeBatch(firestore);
              mockUsers.forEach(mockUser => {
                  const docRef = doc(firestore, "users", mockUser.id);
                  batch.set(docRef, mockUser);
              });
              await batch.commit();
              console.log("Mock users created successfully!");
          }
        } catch (error) {
          console.error("Error checking or creating mock users:", error);
        }
      };
      populateTestData();
    }
  }, [firestore, useMockAuth]);

  // Effect for real authentication
  useEffect(() => {
    if (useMockAuth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    }, (error) => {
      setUserError(error);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, useMockAuth]);


  const finalAuthState: UserAuthState = useMemo(() => {
    if (useMockAuth) {
      return MOCK_AUTH_STATE;
    }
    return {
      user,
      profile,
      isUserLoading: isUserLoading || (user && isProfileLoading),
      userError,
    };
  }, [useMockAuth, user, profile, isUserLoading, isProfileLoading, userError]);

  const contextValue: FirebaseContextState = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    ...finalAuthState,
  }), [firebaseApp, firestore, auth, finalAuthState]);

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
  const { user, profile, isUserLoading, userError, auth } = useFirebaseContext();
  return { user, profile, isUserLoading, userError, auth };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  (memoized as any).__memo = true;
  return memoized;
}
