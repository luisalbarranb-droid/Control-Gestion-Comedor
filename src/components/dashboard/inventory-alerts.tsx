
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InventoryAlertsProps {
    items: InventoryItem[];
    isLoading: boolean;
}

export function InventoryAlerts({ items, isLoading }: InventoryAlertsProps) {
    const alerts = React.useMemo(() => {
        if (!items) return [];

        // Prioridad: 1. Agotados, 2. Debajo del mínimo
        return items
            .filter(item => item.cantidad <= item.stockMinimo)
            .sort((a, b) => {
                if (a.cantidad === 0 && b.cantidad > 0) return -1;
                if (a.cantidad > 0 && b.cantidad === 0) return 1;
                return a.cantidad - b.cantidad;
            })
            .slice(0, 5); // Mostrar solo las 5 más críticas
    }, [items]);

    if (isLoading) return null;
    if (alerts.length === 0) return null;

    return (
        <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    Stock Crítico
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="h-8 text-orange-700 hover:text-orange-800 hover:bg-orange-100">
                    <Link href="/inventory">Ver todo <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">{item.nombre}</span>
                                <span className="text-[10px] text-gray-500 uppercase">{item.unidadReceta}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "font-bold",
                                    item.cantidad === 0 ? "text-red-600" : "text-orange-600"
                                )}>
                                    {item.cantidad.toFixed(1)} / {item.stockMinimo}
                                </span>
                                {item.cantidad === 0 ? (
                                    <Badge variant="destructive" className="h-5 px-1.5 text-[9px] uppercase">Agotado</Badge>
                                ) : (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] uppercase border-orange-500 text-orange-600">Bajo</Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
