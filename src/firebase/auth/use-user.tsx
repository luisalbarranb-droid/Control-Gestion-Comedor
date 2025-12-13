'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserProfile } from '@/lib/types';

interface UseUserResult {
  user: FirebaseAuthUser | null;
  profile: UserProfile | null;
  isUserLoading: boolean;
  signOut: () => Promise<void>;
}

export function useUser(): UseUserResult {
  const auth = useAuth();
  const firestore = useFirestore();
  // Ensure the initial state for auth loading is true on both server and client
  const [isAuthLoading, setIsAuthLoading] = useState(true); 
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);
  
  // Memoize the document reference
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // The profile query is disabled if there's no authenticated user.
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef, { disabled: !user });


  const signOut = async () => {
    await auth.signOut();
    // User state will be updated by onAuthStateChanged listener
  };

  // The overall loading state depends on auth loading AND profile loading if a user is present
  const isUserLoading = isAuthLoading || (!!user && isProfileLoading);

  return { user, profile: profile || null, isUserLoading, signOut };
}
