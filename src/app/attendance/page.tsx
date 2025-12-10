
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Users, BarChart, ClipboardList, QrCode, ClipboardEdit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const attendanceModules = [
    {
        title: 'Dashboard de Asistencia',
        description: 'Visualiza un resumen de la asistencia, retardos y ausencias del día.',
        link: '/attendance/dashboard',
        icon: BarChart,
        cta: 'Ver Dashboard'
    },
    {
        title: 'Registro por QR',
        description: 'Abre el quiosco para que los empleados registren su entrada y salida.',
        link: '/attendance/scanner',
        icon: QrCode,
        cta: 'Abrir Escáner'
    },
    {
        title: 'Gestión de Personal',
        description: 'Consulta y gestiona la lista de empleados, sus horarios y registros.',
        link: '/attendance/personal',
        icon: Users,
        cta: 'Gestionar Personal'
    },
    {
        title: 'Planificación de Libres',
        description: 'Asigna y visualiza los días de descanso semanal para todo el personal.',
        link: '/attendance/planning',
        icon: Calendar,
        cta: 'Ir a Planificar'
    },
    {
        title: 'Matriz de Evaluación',
        description: 'Define y edita los criterios para la evaluación del rendimiento del personal.',
        link: '/settings/evaluation-matrix',
        icon: ClipboardEdit,
        cta: 'Configurar Matriz'
    },
    {
        title: 'Reportes de Asistencia',
        description: 'Genera y descarga reportes consolidados de asistencia por período.',
        link: '/attendance/reports',
        icon: ClipboardList,
        cta: 'Generar Reporte'
    },
]

export default function AttendancePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Gestión de RRHH y Asistencia
        </h1>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendanceModules.map((mod) => (
            <Card key={mod.title} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{mod.title}</CardTitle>
                  <div className="p-2 bg-muted rounded-md">
                      <mod.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={mod.link}>{mod.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
    </main>
  );
}
