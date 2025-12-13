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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef, { disabled: !user });

  const signOut = async () => {
    await auth.signOut();
  };

  const isUserLoading = isAuthLoading || (!!user && isProfileLoading);

  return { 
    user, 
    // Devuelve el perfil solo cuando la carga ha terminado y el perfil existe.
    // Esto evita estados intermedios donde `profile` es `null` durante la carga.
    profile: isUserLoading ? null : profile, 
    isUserLoading, 
    signOut 
  };
}
