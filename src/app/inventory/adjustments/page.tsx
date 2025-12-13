
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import type { InventoryItem } from '@/lib/types';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { inventoryCategories } from '@/lib/placeholder-data';


export default function InventoryAdjustmentsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [isSaving, setIsSaving] = useState(false);

    const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({});

    const inventoryQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'inventory');
    }, [firestore]);

    const { data: items, isLoading: isLoadingItems } = useCollection<InventoryItem>(inventoryQuery, { disabled: isUserLoading || !user });
    
    const isLoading = isLoadingItems || isUserLoading;

    const handleCountChange = (itemId: string, value: string) => {
        setPhysicalCounts(prev => ({
            ...prev,
            [itemId]: value,
        }));
    };
    
    const handleSaveAdjustments = async () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error de conexión' });
            return;
        }

        const itemsToAdjust = Object.entries(physicalCounts)
            .map(([itemId, countStr]) => {
                const physicalCount = parseFloat(countStr);
                if (isNaN(physicalCount)) return null;

                const item = items?.find(i => i.id === itemId);
                if (!item || item.cantidad === physicalCount) return null;

                return { item, physicalCount };
            })
            .filter(Boolean);

        if (itemsToAdjust.length === 0) {
            toast({ title: 'Sin cambios', description: 'No se han introducido ajustes.' });
            return;
        }

        setIsSaving(true);
        try {
            const batch = writeBatch(firestore);
            const transactionsCollection = collection(firestore, 'inventoryTransactions');

            for (const adjustment of itemsToAdjust) {
                if (adjustment) {
                    const { item, physicalCount } = adjustment;
                    const difference = physicalCount - item.cantidad;
                    
                    const itemRef = doc(firestore, 'inventory', item.id);
                    batch.update(itemRef, { 
                        cantidad: physicalCount,
                        ultimaActualizacion: serverTimestamp(),
                    });

                    const transactionData = {
                        itemId: item.id,
                        quantity: Math.abs(difference),
                        type: difference > 0 ? 'ajuste-positivo' : 'ajuste-negativo',
                        date: serverTimestamp(),
                        reason: 'Ajuste por conteo físico',
                    };
                    
                    // Since addDoc cannot be used in a batch, we create a ref and set it.
                    const transactionRef = doc(transactionsCollection);
                    batch.set(transactionRef, transactionData);
                }
            }

            await batch.commit();
            toast({
                title: 'Ajuste Guardado',
                description: `Se han actualizado ${itemsToAdjust.length} artículo(s).`,
            });
            setPhysicalCounts({});

        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los ajustes.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const getCategoryName = (categoryId: string) => {
        return inventoryCategories.find(c => c.id === categoryId)?.nombre || categoryId;
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                        <Link href="/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver a Inventario</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-headline text-2xl font-bold md:text-3xl flex items-center gap-2">
                            <Wrench className="h-6 w-6" />
                            Ajustes y Conteo de Inventario
                        </h1>
                        <p className="text-muted-foreground">Realiza el conteo físico y ajusta el stock del sistema.</p>
                    </div>
                </div>
                 <Button onClick={handleSaveAdjustments} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Ajustes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Hoja de Conteo Físico</CardTitle>
                    <CardDescription>
                        Introduce la cantidad física contada para cada artículo. El sistema calculará la diferencia y te permitirá guardar el ajuste. Solo se procesarán las filas donde introduzcas un valor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-center">Stock (Sistema)</TableHead>
                                <TableHead className="w-[150px] text-center">Conteo Físico</TableHead>
                                <TableHead className="text-center">Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></TableCell>
                                </TableRow>
                            )}
                            {!isLoading && items?.map(item => {
                                const physicalCountStr = physicalCounts[item.id];
                                const physicalCount = parseFloat(physicalCountStr);
                                const systemCount = item.cantidad;
                                let difference: number | null = null;
                                if (physicalCountStr !== undefined && physicalCountStr !== '' && !isNaN(physicalCount)) {
                                    difference = physicalCount - systemCount;
                                }

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nombre}</TableCell>
                                        <TableCell>{getCategoryName(item.categoriaId)}</TableCell>
                                        <TableCell className="text-center font-mono">
                                            {systemCount.toFixed(2)} <span className="text-xs uppercase text-muted-foreground">{item.unidadReceta}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input 
                                                type="number" 
                                                placeholder="0.00"
                                                className="text-center font-mono"
                                                value={physicalCounts[item.id] || ''}
                                                onChange={(e) => handleCountChange(item.id, e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-center font-bold font-mono",
                                            difference === null ? 'text-muted-foreground' :
                                            difference > 0 ? 'text-green-600' :
                                            difference < 0 ? 'text-red-600' : 'text-muted-foreground'
                                        )}>
                                            {difference === null ? '-' : 
                                             `${difference > 0 ? '+' : ''}${difference.toFixed(2)}`
                                            }
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
