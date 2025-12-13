
'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef, { disabled: !user });

  // Memoize el perfil final para evitar recálculos innecesarios
  const profile = useMemo(() => {
    // Si el email es el del superusuario, forzamos el perfil de superadmin.
    if (user?.email === 'arvecladu@gmail.com') {
      const baseProfile = profileData || { id: user.uid, email: user.email, name: 'Super Admin' };
      return {
        ...baseProfile,
        role: 'superadmin',
      } as UserProfile;
    }
    // De lo contrario, devolvemos el perfil cargado desde Firestore.
    return profileData;
  }, [user, profileData]);


  const signOut = async () => {
    await auth.signOut();
  };

  const isUserLoading = isAuthLoading || (!!user && isProfileLoading);

  return { 
    user, 
    // Devuelve el perfil solo cuando la carga ha terminado y el perfil existe.
    profile: isUserLoading ? null : profile, 
    isUserLoading, 
    signOut 
  };
}
