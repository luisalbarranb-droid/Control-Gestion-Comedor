'use client';

// CORRECCIÓN: Agregamos useMemo a la importación
import React, { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar as CalendarIcon,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

// Datos simulados para evitar errores de conexión por ahora
const MOCK_DATA = [
    { id: 1, item: 'Pollo', unit: 'kg', planned: 20, used: 22, difference: -2, cost: 150 },
    { id: 2, item: 'Arroz', unit: 'kg', planned: 10, used: 10, difference: 0, cost: 20 },
    { id: 3, item: 'Aceite', unit: 'lt', planned: 5, used: 4, difference: 1, cost: 80 },
];

export default function DailyClosingReportPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  const [reportType, setReportType] = useState('full');

  // CORRECCIÓN: useMemo ahora está correctamente importado y usado
  const reportData = useMemo(() => {
    // Aquí iría la lógica real de filtrado con Firebase
    return MOCK_DATA; 
  }, [selectedDate]);

  const totalCost = useMemo(() => {
    return reportData.reduce((acc, curr) => acc + (curr.used * curr.cost), 0);
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/daily-closing">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Reporte de Cierre Diario
                </h1>
                <p className="text-muted-foreground">
                    Análisis de consumo y costos.
                </p>
            </div>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Configuración del Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha del Reporte</label>
                    <div className="p-2 border rounded-md flex items-center gap-2 bg-slate-50">
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                        <span>{format(new Date(), 'dd MMMM yyyy', { locale: es })}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Vista</label>
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full">Detallado (Ingredientes)</SelectItem>
                            <SelectItem value="summary">Resumen por Categoría</SelectItem>
                            <SelectItem value="variance">Solo Desviaciones</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Resumen de Costos y Consumo</CardTitle>
                <CardDescription>Comparativa Planificado vs. Real</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Insumo</TableHead>
                            <TableHead className="text-right">Planificado</TableHead>
                            <TableHead className="text-right">Utilizado</TableHead>
                            <TableHead className="text-right">Dif.</TableHead>
                            <TableHead className="text-right">Costo Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((item: any) => ( // CORRECCIÓN: Tipado explícito 'any' para evitar error 7006
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.item}</TableCell>
                                <TableCell className="text-right">{item.planned} {item.unit}</TableCell>
                                <TableCell className="text-right">{item.used} {item.unit}</TableCell>
                                <TableCell className={`text-right font-bold ${item.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {item.difference > 0 ? '+' : ''}{item.difference} {item.unit}
                                </TableCell>
                                <TableCell className="text-right">
                                    ${(item.used * item.cost).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={4} className="text-right font-bold text-lg">Total del Día:</TableCell>
                            <TableCell className="text-right font-bold text-lg text-blue-600">
                                ${totalCost.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
