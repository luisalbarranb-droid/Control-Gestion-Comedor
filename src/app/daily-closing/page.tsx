'use client';

import React from 'react';
import { ArrowLeft, FileCheck, Users, Clock, AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DailyClosingPage() {
  // ESTRUCTURA LIMPIA: Sin menús duplicados + Botón Volver
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            {/* Botón Volver a Reportes (Visible siempre) */}
            <Button variant="ghost" size="icon" asChild>
                <Link href="/reports">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">Cierres Diarios</h1>
                <p className="text-gray-500">Resumen operativo y cierre de jornada.</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Histórico
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <FileCheck className="h-4 w-4" />
                Realizar Cierre de Hoy
            </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen del Día Actual */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Comidas Servidas</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">145</div>
                <p className="text-xs text-muted-foreground mt-1">De 150 planificadas (96% de ejecución)</p>
            </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Hora Último Servicio</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">13:45</div>
                <p className="text-xs text-muted-foreground mt-1">Cierre de línea regular</p>
            </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Incidencias</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Sin reportes hoy</p>
            </CardContent>
        </Card>
      </div>

      {/* Sección de Cierres Recientes (Ejemplo Visual) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Cierres de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[
                        { dia: 'Ayer', fecha: '03 Dic', comidas: 142, estado: 'completado' },
                        { dia: 'Lunes', fecha: '02 Dic', comidas: 138, estado: 'completado' },
                        { dia: 'Viernes', fecha: '29 Nov', comidas: 155, estado: 'auditado' },
                    ].map((cierre, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center font-bold text-gray-600 text-xs shadow-sm">
                                    {cierre.fecha.split(' ')[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{cierre.dia}</p>
                                    <p className="text-xs text-gray-500">{cierre.comidas} platos servidos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {cierre.estado === 'completado' && <Badge variant="secondary" className="bg-green-100 text-green-700">Completado</Badge>}
                                {cierre.estado === 'auditado' && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Auditado</Badge>}
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Panel Informativo */}
        <Card className="col-span-3 bg-slate-50 border-dashed">
            <CardHeader>
                <CardTitle className="text-base text-slate-700">Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
                <p>• Recuerda realizar el cierre antes de las 16:00 horas para que se refleje en el reporte diario.</p>
                <p>• Si hubo incidencias con el inventario, deben registrarse primero en el módulo de Inventario antes de cerrar caja.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}