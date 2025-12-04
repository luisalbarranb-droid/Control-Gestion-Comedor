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
  const [user, setUser] = useState<FirebaseAuthUser | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Memoize the document reference
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef, { disabled: !user });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const signOut = async () => {
    await auth.signOut();
    // Reset state on sign-out
    setUser(null);
  };

  const isUserLoading = isAuthLoading || (!!user && isProfileLoading);

  return { user, profile: profile || null, isUserLoading, signOut };
}