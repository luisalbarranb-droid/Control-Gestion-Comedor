'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Download, Soup, Drumstick, Salad, SquareCheck } from 'lucide-react';
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
import { inventoryItems } from '@/lib/placeholder-data';
import type { Menu, MenuReportData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { categoryDisplay } from '@/components/daily-closing/category-display';

interface MenusReportProps {
  menus: Menu[];
}

const categoryIcons: Record<string, React.ElementType> = {
  entrada: Soup,
  proteico: Drumstick,
  acompanante1: Salad,
  acompanante2: Salad,
  acompanante3: Salad,
};

export function MenusReport({ menus }: MenusReportProps) {
  const { toast } = useToast();

  const handleExport = () => {
    const reportData: MenuReportData[] = [];

    menus.forEach((selectedMenu) => {
      selectedMenu.items.forEach((item) => {
        if (item.ingredients.length > 0) {
          item.ingredients.forEach((ingredient) => {
            const invItem = inventoryItems.find(
              (i) => i.itemId === ingredient.inventoryItemId
            );
            if (!invItem) return;

            const netPerPax = ingredient.quantity;
            const grossPerPax = netPerPax / (1 - ingredient.wasteFactor);
            const totalRequired = grossPerPax * selectedMenu.pax;

            reportData.push({
              'Fecha Menú': format(selectedMenu.date, 'yyyy-MM-dd'),
              Plato: item.name,
              Categoría: categoryDisplay[item.category]?.label || item.category,
              PAX: selectedMenu.pax,
              Ingrediente: invItem.nombre,
              'Cant. Neta / Persona': netPerPax,
              'Cant. Bruta / Persona': grossPerPax,
              'Total Requerido': totalRequired,
              Unidad: invItem.unidad,
            });
          });
        } else {
          reportData.push({
            'Fecha Menú': format(selectedMenu.date, 'yyyy-MM-dd'),
            Plato: item.name,
            Categoría: categoryDisplay[item.category]?.label || item.category,
            PAX: selectedMenu.pax,
            Ingrediente: 'N/A',
            'Cant. Neta / Persona': 0,
            'Cant. Bruta / Persona': 0,
            'Total Requerido': 0,
            Unidad: 'N/A',
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 8 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'Reporte Menú');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `Reporte_Consolidado_Menu.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El reporte consolidado de menús ha sido descargado.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Detalle de Platos e Ingredientes</CardTitle>
            <CardDescription>
              Análisis completo de todos los componentes de los menús y la
              materia prima necesaria.
            </CardDescription>
          </div>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {menus.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Fecha</TableHead>
                <TableHead className="w-[200px]">Plato</TableHead>
                <TableHead>Ingrediente</TableHead>
                <TableHead className="text-right">Cant. Neta / Pax</TableHead>
                <TableHead className="text-right">Cant. Bruta / Pax</TableHead>
                <TableHead className="text-right">Total Requerido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) =>
                menu.items.map((item) => (
                  <React.Fragment key={`${menu.menuId}-${item.menuItemId}`}>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">
                        {format(new Date(menu.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell colSpan={5}>
                        <div className="flex items-center gap-3 font-bold">
                          {React.createElement(
                            categoryIcons[item.category] || SquareCheck,
                            { className: 'w-5 h-5' }
                          )}
                          <span>{item.name}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              categoryDisplay[item.category]?.className,
                              'ml-auto'
                            )}
                          >
                            {categoryDisplay[item.category]?.label}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    {item.ingredients.length > 0 ? (
                      item.ingredients.map((ingredient) => {
                        const invItem = inventoryItems.find(
                          (i) => i.itemId === ingredient.inventoryItemId
                        );
                        if (!invItem) return null;
                        const netPerPax = ingredient.quantity;
                        const grossPerPax =
                          netPerPax / (1 - ingredient.wasteFactor);
                        const totalRequired = grossPerPax * menu.pax;

                        return (
                          <TableRow key={ingredient.inventoryItemId}>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{invItem.nombre}</TableCell>
                            <TableCell className="text-right font-mono">
                              {netPerPax.toFixed(3)} {invItem.unidad}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {grossPerPax.toFixed(3)} {invItem.unidad}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {totalRequired.toFixed(2)} {invItem.unidad}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell
                          colSpan={4}
                          className="text-sm text-muted-foreground itaic"
                        >
                          Este plato no tiene ingredientes detallados.
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold text-muted-foreground">
              No hay menús para el período seleccionado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta ajustar el rango de fechas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
