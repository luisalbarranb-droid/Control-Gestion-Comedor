'use client';
import { useFirebase } from '@/firebase/provider';

// This file is DEPRECATED and will be removed in a future version.
// Please use the `useUser` hook exported from `/firebase/provider.tsx` instead.

/**
 * @deprecated Please use the `useUser` hook exported from `@/firebase/provider` instead.
 */
export const useUser = () => {
    // This hook simply re-exports the user-related state from the main useFirebase hook.
    // It exists for convenience and backward compatibility.
    const { user, isUserLoading, userError, auth } = useFirebase();

    return { user, isUserLoading, userError, auth };
};
