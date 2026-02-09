
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import { Building2, Users, Package, CheckSquare, ArrowRight, Loader2 } from 'lucide-react';
import type { Comedor } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function GlobalComedoresSummary() {
    const firestore = useFirestore();
    const { setManualComedorId } = useMultiTenant();

    const comedoresQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'comedores');
    }, [firestore]);

    const { data: comedores, isLoading } = useCollection<Comedor>(comedoresQuery);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!comedores || comedores.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900">No hay comedores registrados</h3>
                    <p className="text-slate-500">Comience por crear un comedor en la sección de administración.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comedores.map((comedor) => (
                <ComedorSummaryCard
                    key={comedor.id}
                    comedor={comedor}
                    onSelect={() => setManualComedorId(comedor.id)}
                />
            ))}
        </div>
    );
}

function ComedorSummaryCard({ comedor, onSelect }: { comedor: Comedor; onSelect: () => void }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${comedor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {comedor.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <CardTitle className="mt-4 text-xl">{comedor.nombre}</CardTitle>
                <CardDescription className="line-clamp-1">{comedor.direccion || 'Sin dirección'}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">Personal: --</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">Inventario: --</span>
                    </div>
                </div>

                <Button
                    onClick={onSelect}
                    className="w-full group bg-primary/90 hover:bg-primary"
                >
                    Gestionar Comedor
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
