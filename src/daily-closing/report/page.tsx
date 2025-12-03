'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, AlertTriangle, ArrowUp, ArrowDown, Minus, Download } from 'lucide-react';
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
import { weeklyMenus, dailyClosings, inventoryItems } from '@/lib/placeholder-data';
import type { Menu, MenuItem, Ingredient, DailyClosingItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type IngredientConsumption = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  planned: number;
  executed: number;
  difference: number;
};

function ReportContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const { toast } = useToast();

  if (!dateParam) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Fecha no especificada. Por favor, vuelve y selecciona una fecha.</p>
      </div>
    );
  }
  
  const closingDate = new Date(dateParam);
  closingDate.setMinutes(closingDate.getMinutes() + closingDate.getTimezoneOffset())

  const selectedClosing = dailyClosings.find(c => format(c.date, 'yyyy-MM-dd') === format(closingDate, 'yyyy-MM-dd'));

  if (!selectedClosing || !selectedClosing.plannedMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">No se encontraron datos de cierre</h2>
        <p className="text-muted-foreground max-w-md mt-2">
          No pudimos encontrar un cierre diario o un menú planificado para la fecha seleccionada ({format(closingDate, 'PPP', { locale: es })}).
        </p>
         <Button asChild className="mt-4">
            <Link href="/daily-closing">Volver a Cierres</Link>
        </Button>
      </div>
    );
  }

  const { plannedMenu, executedPax, executedItems, variations } = selectedClosing;
  const plannedPax = plannedMenu.pax;
  
  const getIngredientConsumptionMap = (): Map<string, IngredientConsumption> => {
    const consumptionMap = new Map<string, IngredientConsumption>();

    const processIngredients = (menuItems: (MenuItem[] | DailyClosingItem[]), pax: number, type: 'planned' | 'executed') => {
        for (const item of menuItems) {
            // Find the full MenuItem from the planned menu to get ingredient details
            const fullMenuItem = plannedMenu.items.find(i => i.name === item.name);
            if (!fullMenuItem || !fullMenuItem.ingredients) continue;

            for (const ingredient of fullMenuItem.ingredients) {
                const invItem = inventoryItems.find(i => i.id === ingredient.inventoryItemId);
                if (!invItem) continue;

                const grossQuantity = ingredient.quantity / (1 - ingredient.wasteFactor);
                const totalQuantity = grossQuantity * pax;

                let entry = consumptionMap.get(invItem.id);
                if (!entry) {
                    entry = { 
                        ingredientId: invItem.id, 
                        ingredientName: invItem.nombre, 
                        unit: invItem.unidad,
                        planned: 0, 
                        executed: 0, 
                        difference: 0 
                    };
                }

                entry[type] += totalQuantity;
                consumptionMap.set(invItem.id, entry);
            }
        }
    };
    
    processIngredients(plannedMenu.items, plannedPax, 'planned');
    processIngredients(executedItems, executedPax, 'executed');

    // Calculate difference
    for (const entry of consumptionMap.values()) {
        entry.difference = entry.executed - entry.planned;
    }

    return consumptionMap;
  };

  const ingredientConsumption = Array.from(getIngredientConsumptionMap().values());

  const plannedOnlyItems = plannedMenu.items.filter(pItem => !executedItems.some(eItem => eItem.name === pItem.name));
  const executedOnlyItems = executedItems.filter(eItem => !plannedMenu.items.some(pItem => pItem.name === eItem.name));
  
  const handleExport = () => {
    const summaryData = [
      { Reporte: 'Cierre Diario', Fecha: format(closingDate, 'yyyy-MM-dd') },
      {},
      { Criterio: 'PAX Planificado', Valor: plannedPax },
      { Criterio: 'PAX Ejecutado', Valor: executedPax },
      { Criterio: 'Desviación PAX', Valor: `${((executedPax - plannedPax) / plannedPax * 100).toFixed(1)}%` },
      {},
      { Criterio: 'Platos No Servidos (Planificados)', Valor: plannedOnlyItems.map(i => i.name).join(', ') || 'Ninguno' },
      { Criterio: 'Platos Extras (No Planificados)', Valor: executedOnlyItems.map(i => i.name).join(', ') || 'Ninguno' },
      {},
      { Criterio: 'Observaciones', Valor: variations },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 50 }];
    
    const consumptionData = ingredientConsumption.map(item => ({
        'ID Ingrediente': item.ingredientId,
        'Ingrediente': item.ingredientName,
        'Unidad': item.unit,
        'Consumo Planificado': item.planned.toFixed(2),
        'Consumo Ejecutado': item.executed.toFixed(2),
        'Desviación': item.difference.toFixed(2),
    }));
    const consumptionWs = XLSX.utils.json_to_sheet(consumptionData);
    consumptionWs['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
    XLSX.utils.book_append_sheet(wb, consumptionWs, 'Consumo Ingredientes');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Reporte_Cierre_Diario_${format(closingDate, 'yyyy-MM-dd')}.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El reporte de cierre ha sido descargado.',
    });
  }

  return (
     <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Reporte Comparativo de Cierre
            </h1>
            <p className="text-muted-foreground">
                Análisis de desviaciones para el {format(closingDate, 'EEEE, dd MMMM, yyyy', { locale: es })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar a Excel
            </Button>
            <Button asChild variant="outline">
                <Link href="/daily-closing">Volver</Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
                <CardTitle>Resumen de Desviaciones</CardTitle>
                <CardDescription>Diferencias clave entre lo planificado y lo ejecutado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                    <span className="font-medium">PAX (Comensales)</span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Plan: {plannedPax}</span>
                        <span className="font-bold">Ejec: {executedPax}</span>
                        <Badge variant={executedPax > plannedPax ? 'destructive' : 'secondary'}>
                            {((executedPax - plannedPax) / plannedPax * 100).toFixed(1)}%
                        </Badge>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2">Platos No Servidos (Planificados)</h4>
                    {plannedOnlyItems.length > 0 ? (
                        plannedOnlyItems.map(item => <Badge key={item.id} variant="destructive" className="mr-1">{item.name}</Badge>)
                    ) : <p className="text-xs text-muted-foreground">Ninguno</p>}
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2">Platos Extras (No Planificados)</h4>
                    {executedOnlyItems.length > 0 ? (
                        executedOnlyItems.map(item => <Badge key={item.name} variant="secondary" className="mr-1">{item.name}</Badge>)
                    ) : <p className="text-xs text-muted-foreground">Ninguno</p>}
                </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Observaciones del Cierre</CardTitle>
                 <CardDescription>Notas sobre las variaciones ocurridas durante el servicio.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic">"{variations}"</p>
            </CardContent>
         </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Análisis de Consumo de Ingredientes</CardTitle>
                <CardDescription>Comparación detallada del consumo de materia prima planificado vs. el real.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className="text-right">Planificado</TableHead>
                    <TableHead className="text-right">Ejecutado</TableHead>
                    <TableHead className="text-right">Desviación</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {ingredientConsumption.map(ing => (
                    <TableRow key={ing.ingredientId} className={cn(ing.difference > 0 ? 'bg-red-50 dark:bg-red-900/20' : ing.difference < 0 ? 'bg-green-50 dark:bg-green-900/20' : '')}>
                        <TableCell className="font-medium">{ing.ingredientName}</TableCell>
                        <TableCell className="text-right font-mono">{ing.planned.toFixed(2)} {ing.unit}</TableCell>
                        <TableCell className="text-right font-mono">{ing.executed.toFixed(2)} {ing.unit}</TableCell>
                        <TableCell className={cn("text-right font-mono font-bold", ing.difference > 0 ? 'text-red-600' : ing.difference < 0 ? 'text-green-600' : 'text-muted-foreground')}>
                           <div className="flex items-center justify-end gap-2">
                             {ing.difference > 0.01 ? <ArrowUp className="h-4 w-4" /> : ing.difference < -0.01 ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            <span>{ing.difference.toFixed(2)} {ing.unit}</span>
                           </div>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </main>
  );
}


export default function DailyClosingReportPage() {
  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p>Cargando reporte...</p></div>}>
          <ReportContent />
        </Suspense>
      </SidebarInset>
    </div>
  );
}
