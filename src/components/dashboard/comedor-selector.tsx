
'use client';

import React, { useMemo } from 'react';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Comedor } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LayoutGrid, Loader2 } from 'lucide-react';

export function ComedorSelector() {
    const { activeComedorId, setManualComedorId, isSuperAdmin } = useMultiTenant();
    const firestore = useFirestore();

    // Suscribirse a todos los comedores (solo si es superadmin)
    const comedoresQuery = useMemoFirebase(() => isSuperAdmin ? collection(firestore, 'comedores') : null, [firestore, isSuperAdmin]);
    const { data: comedores, isLoading } = useCollection<Comedor>(comedoresQuery);

    if (!isSuperAdmin) return null;

    return (
        <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <Select
                value={activeComedorId || 'all'}
                onValueChange={(val) => setManualComedorId(val === 'all' ? null : val)}
            >
                <SelectTrigger className="w-[200px] h-9 bg-white/50 border-primary/20">
                    <SelectValue placeholder="Seleccionar Sede" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">🌏 Vista Global (Resumen)</SelectItem>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    ) : (
                        comedores?.map((comedor) => (
                            <SelectItem key={comedor.id} value={comedor.id}>
                                🏢 {comedor.nombre}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
