
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, History, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

import { useMultiTenant } from '@/providers/multi-tenant-provider';

export default function InventoryHistoryPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { activeComedorId, isSuperAdmin } = useMultiTenant();
    const [searchTerm, setSearchTerm] = useState('');

    const transactionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const baseRef = collection(firestore, 'inventory_transactions');

        if (activeComedorId) {
            return query(baseRef, where('comedorId', '==', activeComedorId), orderBy('fecha', 'desc'));
        } else if (isSuperAdmin) {
            return query(baseRef, orderBy('fecha', 'desc'));
        }

        return null;
    }, [firestore, activeComedorId, isSuperAdmin]);

    const { data: transactions, isLoading } = useCollection<any>(transactionsQuery, { disabled: isUserLoading || !user });

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter(t =>
            (t.nombreItem || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.documento || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.usuario || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    if (isLoading || isUserLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Historial de Movimientos</h1>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por producto, factura o usuario..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Registro de Auditoría
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Artículo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Usuario</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-xs">
                                        {tx.fecha?.toDate ? format(tx.fecha.toDate(), 'dd MMM, HH:mm', { locale: es }) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium">{tx.nombreItem}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.tipo === 'entrada' ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                                            {tx.tipo === 'entrada' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {tx.tipo.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        {tx.cantidad} <span className="text-[10px] text-muted-foreground uppercase">{tx.unidad}</span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{tx.documento}</TableCell>
                                    <TableCell className="text-xs font-semibold">{tx.usuario.split('@')[0]}</TableCell>
                                </TableRow>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No se han registrado movimientos todavía.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
