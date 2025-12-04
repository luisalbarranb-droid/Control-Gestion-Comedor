
'use client';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { useMemo } from 'react';
import { User as AppUser } from '@/lib/types';
import { firebaseConfig } from './config';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).firebaseApp;
export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;


interface UserContextType {
  user: FirebaseUser | null;
  profile: AppUser | null;
  isUserLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return context;
};

// Custom hook for memoizing Firestore references
export const useMemoFirebase = <T>(factory: () => T, deps: React.DependencyList): T => {
    return useMemo(() => {
        const result = factory();
        if (result && typeof result === 'object') {
            (result as any).__memo = true;
        }
        return result;
    }, deps);
};


export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    const firestoreInstance = getFirestore(app);

    setFirebaseApp(app);
    setAuth(authInstance);
    setFirestore(firestoreInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      setIsUserLoading(true);
      setUser(user);
      if (user) {
        const userDocRef = doc(firestoreInstance, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() } as AppUser);
        } else {
            // Handle case where user is authenticated but has no profile doc
            const mockProfile: AppUser = {
              id: 'mock-user-id',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'comun'
            };
            setProfile(mockProfile);
        }
      } else {
        setProfile(null);
      }
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const { signInWithEmailAndPassword } = require('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const signUp = (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    if (!auth) throw new Error("Auth not initialized");
    const { signOut: firebaseSignOut } = require('firebase/auth');
    return firebaseSignOut(auth);
  };
  
  // Enforce auth on protected routes
   useEffect(() => {
    if (!isUserLoading && !user && !pathname.startsWith('/auth')) {
      //router.push('/auth/login');
    }
  }, [isUserLoading, user, pathname, router]);

  if (isUserLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      <UserContext.Provider value={{ user, profile, isUserLoading, signIn, signUp, signOut }}>
        {children}
      </UserContext.Provider>
    </FirebaseContext.Provider>
  );
}
