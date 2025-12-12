
'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Download, AlertCircle, Package, DollarSign, BarChart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryCategories } from '@/lib/placeholder-data';
import type { InventoryItem, InventoryReportData, InventoryCategoryId, InventoryTransaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function InventoryReportsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'inventory'), orderBy('nombre', 'asc'));
  }, [firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'inventoryTransactions'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: items, isLoading: isLoadingItems } = useCollection<InventoryItem>(inventoryQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<InventoryTransaction>(transactionsQuery);

  const getCategoryName = (categoryId: InventoryCategoryId) => {
    return inventoryCategories.find(cat => cat.id === categoryId)?.nombre || 'Categoría Desconocida';
  };

  const reportStats = useMemo(() => {
    if (!items) return { lowStockItems: [], totalInventoryValue: 0, lowStockValue: 0 };
    const lowStockItems = items.filter(item => item.cantidad <= item.stockMinimo);
    const totalInventoryValue = items.reduce((acc, item) => acc + (item.cantidad * (item.costoUnitario || 0)), 0);
    const lowStockValue = lowStockItems.reduce((acc, item) => acc + (item.cantidad * (item.costoUnitario || 0)), 0);
    return { lowStockItems, totalInventoryValue, lowStockValue };
  }, [items]);

  const top10Rotation = useMemo(() => {
    if (!transactions || !items) return [];
    
    const rotationData = transactions
      .filter(t => t.type === 'salida')
      .reduce((acc, t) => {
        acc[t.itemId] = (acc[t.itemId] || 0) + t.quantity;
        return acc;
      }, {} as Record<string, number>);
  
    return Object.entries(rotationData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return {
          name: item?.nombre || 'Desconocido',
          quantity,
          unit: item?.unidadReceta || 'unidad'
        };
      });
  }, [transactions, items]);


  const handleExport = () => {
    if (!items) {
      toast({ variant: 'destructive', title: 'Error', description: 'No hay datos de inventario para exportar.'});
      return;
    }
    const reportData: InventoryReportData[] = items.map(item => ({
      'ID de Artículo': item.id,
      'Nombre': item.nombre,
      'Categoría': getCategoryName(item.categoriaId),
      'Cantidad Actual': item.cantidad,
      'Unidad': item.unidadReceta,
      'Stock Mínimo': item.stockMinimo,
      'Costo Unitario': item.costoUnitario || 0,
      'Valor Total': item.cantidad * (item.costoUnitario || 0),
      'Estado': item.cantidad <= item.stockMinimo ? 'Bajo Stock' : 'OK',
      'Última Actualización': item.ultimaActualizacion ? format(item.ultimaActualizacion instanceof Date ? item.ultimaActualizacion : item.ultimaActualizacion.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    const max_width = reportData.reduce((w, r) => Math.max(w, r['Nombre'].length), 10);
    worksheet["!cols"] = [ { wch: 20 }, { wch: max_width }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, {wch: 15}, {wch: 20} ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    saveAs(data, `Reporte_Inventario_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El reporte de inventario ha sido descargado.',
    });
  };
  
  const isLoading = isLoadingItems || isLoadingTransactions;

  const KPI_CARDS = [
    { title: 'Valor Total del Inventario', value: `$${reportStats.totalInventoryValue.toFixed(2)}`, icon: DollarSign },
    { title: 'Artículos Totales', value: items?.length || 0, icon: Package },
    { title: 'Artículos con Bajo Stock', value: reportStats.lowStockItems.length, icon: AlertCircle, className: 'text-red-500' },
    { title: 'Valor en Bajo Stock', value: `$${reportStats.lowStockValue.toFixed(2)}`, icon: DollarSign, className: 'text-red-500' },
  ];

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Reportes de Inventario
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} disabled={isLoading || !items}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Exportar a Excel
            </Button>
            <Button asChild variant="outline">
              <Link href="/inventory">Volver</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(kpi => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className={cn("h-4 w-4 text-muted-foreground", kpi.className)} />
              </CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className={cn("text-2xl font-bold", kpi.className)}>{kpi.value}</div>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2">
              <Card>
                  <CardHeader>
                      <CardTitle>Estado Actual del Inventario</CardTitle>
                      <CardDescription>Un resumen detallado de todos los artículos en stock.</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead>Artículo</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Stock Mínimo</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead>Estado</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading && (
                            <TableRow><TableCell colSpan={6} className="h-48 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                        )}
                        {!isLoading && items && items.map(item => {
                          const factor = item.factorConversion || 1;
                          const quantityInPurchaseUnit = item.cantidad / factor;
                          const minStockInPurchaseUnit = item.stockMinimo / factor;
                          const isLowStock = quantityInPurchaseUnit <= minStockInPurchaseUnit;
                          const itemValue = item.cantidad * (item.costoUnitario || 0);
                          return (
                          <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.nombre}</TableCell>
                              <TableCell>
                              <Badge variant="outline">{getCategoryName(item.categoriaId)}</Badge>
                              </TableCell>
                              <TableCell className={cn("text-right font-mono", isLowStock && "text-red-500")}>
                                {quantityInPurchaseUnit.toFixed(2)} <span className="text-xs uppercase">{item.unidadCompra}</span>
                              </TableCell>
                              <TableCell className="text-right font-mono">{minStockInPurchaseUnit.toFixed(2)} <span className="text-xs uppercase">{item.unidadCompra}</span></TableCell>
                              <TableCell className="text-right font-mono">${itemValue.toFixed(2)}</TableCell>
                              <TableCell>
                              <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                                  {isLowStock ? 'Bajo Stock' : 'OK'}
                              </Badge>
                              </TableCell>
                          </TableRow>
                          );
                        })}
                         {!isLoading && (!items || items.length === 0) && (
                            <TableRow><TableCell colSpan={6} className="h-48 text-center">No hay artículos en el inventario.</TableCell></TableRow>
                        )}
                      </TableBody>
                  </Table>
                  </CardContent>
              </Card>
          </div>
          <div>
                <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          Top 10 Artículos con Mayor Rotación
                      </CardTitle>
                      <CardDescription>Artículos con más salidas en el período actual.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Artículo</TableHead>
                                  <TableHead className="text-right">Unidades</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {isLoading && (
                                <TableRow><TableCell colSpan={2} className="h-48 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                              )}
                              {!isLoading && top10Rotation.map((item, index) => (
                                  <TableRow key={index}>
                                      <TableCell className="font-medium">{item.name}</TableCell>
                                      <TableCell className="text-right font-mono">{item.quantity.toFixed(2)} <span className="text-muted-foreground uppercase">{item.unit}</span></TableCell>
                                  </TableRow>
                              ))}
                              {!isLoading && top10Rotation.length === 0 && (
                                <TableRow><TableCell colSpan={2} className="h-48 text-center">No hay datos de transacciones de salida.</TableCell></TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
        </div>
      </main>
  );
}

    