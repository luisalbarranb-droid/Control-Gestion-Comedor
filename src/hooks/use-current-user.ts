'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import type { User, Role } from '@/lib/types';
import { doc } from 'firebase/firestore';

interface CurrentUser {
    user: User | null;
    role: Role | null;
    isLoading: boolean;
}

export function useCurrentUser(): CurrentUser {
    const { user: authUser, isLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

    const isLoading = isAuthLoading || isProfileLoading;

    if (isLoading || !userProfile) {
        return { 
            user: null,
            role: null,
            isLoading: true 
        };
    }
    
    return {
        user: userProfile,
        role: userProfile.rol,
        isLoading: false
    };
}
