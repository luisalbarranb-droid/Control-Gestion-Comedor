'use client';

import React from 'react';
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
import { SquareCheck, AlertTriangle, Download, Users, Soup, Drumstick, Salad } from 'lucide-react';
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
import { weeklyMenus, inventoryItems } from '@/lib/placeholder-data';
import type { Menu, MenuItem, Ingredient, MenuReportData } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { categoryDisplay } from '@/components/daily-closing/category-display';

const categoryIcons: Record<string, React.ElementType> = {
    entrada: Soup,
    proteico: Drumstick,
    acompanante1: Salad,
    acompanante2: Salad,
    acompanante3: Salad,
}

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
  
  const reportDate = new Date(dateParam);
  reportDate.setMinutes(reportDate.getMinutes() + reportDate.getTimezoneOffset())

  const selectedMenu = weeklyMenus.find(c => format(c.date, 'yyyy-MM-dd') === format(reportDate, 'yyyy-MM-dd'));

  if (!selectedMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">No se encontró el menú</h2>
        <p className="text-muted-foreground max-w-md mt-2">
          No pudimos encontrar un menú planificado para la fecha seleccionada ({format(reportDate, 'PPP', { locale: es })}).
        </p>
         <Button asChild className="mt-4">
            <Link href="/menus">Volver a Planificación</Link>
        </Button>
      </div>
    );
  }

  const handleExport = () => {
    const reportData: MenuReportData[] = [];
    
    selectedMenu.items.forEach(item => {
        item.ingredients.forEach(ingredient => {
            const invItem = inventoryItems.find(i => i.itemId === ingredient.inventoryItemId);
            if (!invItem) return;

            const netPerPax = ingredient.quantity;
            const grossPerPax = netPerPax / (1 - ingredient.wasteFactor);
            const totalRequired = grossPerPax * selectedMenu.pax;

            reportData.push({
                'Fecha Menú': format(selectedMenu.date, 'yyyy-MM-dd'),
                'Plato': item.name,
                'Categoría': categoryDisplay[item.category]?.label || item.category,
                'PAX': selectedMenu.pax,
                'Ingrediente': invItem.nombre,
                'Cant. Neta / Persona': netPerPax,
                'Cant. Bruta / Persona': grossPerPax,
                'Total Requerido': totalRequired,
                'Unidad': invItem.unidad,
            });
        });

        // Add row for items without ingredients
        if (item.ingredients.length === 0) {
             reportData.push({
                'Fecha Menú': format(selectedMenu.date, 'yyyy-MM-dd'),
                'Plato': item.name,
                'Categoría': categoryDisplay[item.category]?.label || item.category,
                'PAX': selectedMenu.pax,
                'Ingrediente': 'N/A',
                'Cant. Neta / Persona': 0,
                'Cant. Bruta / Persona': 0,
                'Total Requerido': 0,
                'Unidad': 'N/A',
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    worksheet["!cols"] = [
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 25 }, 
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'Reporte Menú');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Reporte_Menu_${format(reportDate, 'yyyy-MM-dd')}.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El reporte del menú ha sido descargado.',
    });
  }

  return (
     <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Reporte de Menú Diario
            </h1>
            <p className="text-muted-foreground">
                Detalle para el {format(reportDate, 'EEEE, dd MMMM, yyyy', { locale: es })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar a Excel
            </Button>
            <Button asChild variant="outline">
                <Link href="/menus">Volver</Link>
            </Button>
        </div>
      </div>

       <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Detalle de Platos e Ingredientes</CardTitle>
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span>{selectedMenu.pax} PAX</span>
                    </div>
                </div>
                <CardDescription>Análisis completo de todos los componentes del menú y la materia prima necesaria.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Plato</TableHead>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead className="text-right">Cant. Neta / Persona</TableHead>
                        <TableHead className="text-right">Cant. Bruta / Persona</TableHead>
                        <TableHead className="text-right">Total Requerido</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {selectedMenu.items.map(item => (
                    <React.Fragment key={item.menuItemId}>
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={5}>
                               <div className="flex items-center gap-3 font-bold">
                                 {React.createElement(categoryIcons[item.category] || SquareCheck, { className: 'w-5 h-5'})}
                                 <span>{item.name}</span>
                                 <Badge variant="outline" className={cn(categoryDisplay[item.category]?.className, 'ml-auto')}>{categoryDisplay[item.category]?.label}</Badge>
                               </div>
                            </TableCell>
                        </TableRow>
                        {item.ingredients.length > 0 ? item.ingredients.map(ingredient => {
                            const invItem = inventoryItems.find(i => i.itemId === ingredient.inventoryItemId);
                            if (!invItem) return null;
                            const netPerPax = ingredient.quantity;
                            const grossPerPax = netPerPax / (1 - ingredient.wasteFactor);
                            const totalRequired = grossPerPax * selectedMenu.pax;

                            return (
                                <TableRow key={ingredient.inventoryItemId}>
                                    <TableCell></TableCell>
                                    <TableCell>{invItem.nombre}</TableCell>
                                    <TableCell className="text-right font-mono">{netPerPax.toFixed(3)} {invItem.unidad}</TableCell>
                                    <TableCell className="text-right font-mono">{grossPerPax.toFixed(3)} {invItem.unidad}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">{totalRequired.toFixed(2)} {invItem.unidad}</TableCell>
                                </TableRow>
                            )
                        }) : (
                             <TableRow>
                                <TableCell></TableCell>
                                <TableCell colSpan={4} className="text-sm text-muted-foreground itaic">Este plato no tiene ingredientes detallados.</TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </main>
  );
}


export default function MenuReportPage() {
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
