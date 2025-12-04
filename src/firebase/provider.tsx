
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, DocumentReference, DocumentData, FirestoreError, DocumentSnapshot, CollectionReference, Query, QuerySnapshot, writeBatch, collection } from 'firebase/firestore';
import { Auth, User as AuthUser, onAuthStateChanged } from 'firebase/auth';
import type { User as FirestoreUser } from '@/lib/types';
import { UseDocResult, WithId, UseCollectionResult, InternalQuery } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { users as mockUsers, areas } from '@/lib/placeholder-data';
import { setDoc } from 'firebase/firestore';


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
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    profile: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileRef = doc(firestore, 'users', user.uid);
        const profileUnsub = onSnapshot(profileRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              setUserAuthState({ user, profile: snapshot.data() as FirestoreUser, isUserLoading: false, userError: null });
            } else {
              setUserAuthState({ user, profile: null, isUserLoading: false, userError: null });
            }
          },
          (error) => {
            setUserAuthState({ user, profile: null, isUserLoading: false, userError: error });
          }
        );
        return () => profileUnsub();
      } else {
        // No user is signed in. Check for test users.
         const usersCollectionRef = collection(firestore, 'users');
         onSnapshot(usersCollectionRef, (snapshot) => {
            if (snapshot.empty) {
                console.log("No users found. Creating mock users...");
                const batch = writeBatch(firestore);
                mockUsers.forEach(mockUser => {
                    const docRef = doc(firestore, "users", mockUser.id);
                    batch.set(docRef, mockUser);
                });
                batch.commit().then(() => {
                    console.log("Mock users created successfully!");
                }).catch(error => {
                    console.error("Error creating mock users:", error);
                });
            }
        });

        setUserAuthState({ user: null, profile: null, isUserLoading: false, userError: null });
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

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

  const contextValue: FirebaseContextState = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    // Switch between real auth state and mock state for development if needed
    // user: userAuthState.user,
    // profile: userAuthState.profile,
    // isUserLoading: userAuthState.isUserLoading,
    // userError: userAuthState.userError,
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
  const { user, profile, isUserLoading, userError, auth } = useFirebaseContext();
  return { user, profile, isUserLoading, userError, auth };
};

// --- UTILITY HOOKS ---
type MemoFirebase<T> = T & { __memo?: boolean };
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
