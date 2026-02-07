
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Comedor } from '@/lib/types';

interface MultiTenantContextValue {
    activeComedorId: string | null;
    activeComedor: Comedor | null;
    isLoadingComedor: boolean;
    setManualComedorId: (id: string | null) => void;
    isSuperAdmin: boolean;
}

const MultiTenantContext = createContext<MultiTenantContextValue | null>(null);

export function MultiTenantProvider({ children }: { children: ReactNode }) {
    const { profile, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [manualComedorId, setManualComedorId] = useState<string | null>(null);

    const isSuperAdmin = profile?.role === 'superadmin';

    // Determine the effective Comedor ID
    // 1. If superadmin and manual ID is set, use manual ID
    // 2. Otherwise, use the ID from the profile
    const effectiveComedorId = (isSuperAdmin && manualComedorId)
        ? manualComedorId
        : (profile?.comedorId || null);

    const comedorRef = effectiveComedorId ? doc(firestore, 'comedores', effectiveComedorId) : null;
    const { data: activeComedor, isLoading: isLoadingComedor } = useDoc<Comedor>(comedorRef, { disabled: !effectiveComedorId });

    const value: MultiTenantContextValue = {
        activeComedorId: effectiveComedorId,
        activeComedor,
        isLoadingComedor: isLoadingComedor || isUserLoading,
        setManualComedorId,
        isSuperAdmin
    };

    return (
        <MultiTenantContext.Provider value={value}>
            {children}
        </MultiTenantContext.Provider>
    );
}

export const useMultiTenant = () => {
    const context = useContext(MultiTenantContext);
    if (!context) {
        throw new Error('useMultiTenant must be used within a MultiTenantProvider');
    }
    return context;
};
