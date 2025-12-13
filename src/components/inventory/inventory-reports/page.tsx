
'use client';

import React from 'react';
// ELIMINADOS: Sidebar, Header, MainNav (Culpables de la duplicidad)
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  Users, 
  Package, 
  FileCheck,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ReportsPage() {
  // ESTRUCTURA LIMPIA:
  // Solo devolvemos el contenido principal.
  // El Layout Principal se encargará del menú y el encabezado.
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div>
        <h1 className="font-headline text-2xl font-bold md:text-3xl">Central de Reportes</h1>
        <p className="text-gray-500">Descarga informes detallados en PDF o Excel.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Reporte de Asistencia */}
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Reportes de Asistencia</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600"/> 
                    </div>
                </div>
                <CardDescription>Analiza la puntualidad, ausencias y retardos del personal.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/attendance/reports">Ir al Reporte</Link>
                </Button>
            </CardContent>
        </Card>

        {/* Reporte de Inventario */}
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Reportes de Inventario</CardTitle>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Package className="h-5 w-5 text-indigo-600"/> 
                    </div>
                </div>
                <CardDescription>Consulta el estado del stock, valor del inventario y rotación de artículos.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/inventory/reports">Ir al Reporte</Link>
                </Button>
            </CardContent>
        </Card>

        {/* Reporte de Cierres */}
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Reportes de Cierre Diario</CardTitle>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600"/> 
                    </div>
                </div>
                <CardDescription>Compara lo planificado vs. lo ejecutado y analiza las desviaciones.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/daily-closing">Ir al Reporte</Link>
                </Button>
            </CardContent>
        </Card>

        {/* Reporte de Menús */}
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Reportes de Menús</CardTitle>
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-orange-600"/> 
                    </div>
                </div>
                <CardDescription>Visualiza el detalle de ingredientes y requerimientos por menú.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/menus/report">Ir al Reporte</Link>
                </Button>
            </CardContent>
        </Card>

        {/* Estadísticas Generales */}
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Estadísticas Generales</CardTitle>
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-purple-600"/> 
                    </div>
                </div>
                <CardDescription>Visualiza gráficos sobre la eficiencia y carga de trabajo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/stats">Ir al Reporte</Link>
                </Button>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
