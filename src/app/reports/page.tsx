
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, BarChart, FileSpreadsheet, Users, Package, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const reportCards = [
    {
        title: 'Reportes de Asistencia',
        description: 'Analiza la puntualidad, ausencias y retardos del personal.',
        link: '/attendance/reports',
        icon: Users
    },
    {
        title: 'Reportes de Inventario',
        description: 'Consulta el estado del stock, valor del inventario y rotación de artículos.',
        link: '/inventory/reports',
        icon: Package
    },
    {
        title: 'Reportes de Cierre Diario',
        description: 'Compara lo planificado vs. lo ejecutado y analiza las desviaciones.',
        link: '/daily-closing', // Link to main page to select a date first
        icon: FileSpreadsheet
    },
    {
        title: 'Reportes de Menús',
        description: 'Visualiza el detalle de ingredientes y requerimientos por menú.',
        link: '/menus', // Link to main page to select a menu first
        icon: BookOpen
    },
     {
        title: 'Estadísticas Generales',
        description: 'Visualiza gráficos sobre la eficiencia y carga de trabajo.',
        link: '/stats',
        icon: BarChart
    }
]

export default function ReportsPage() {
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Central de Reportes
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map((report, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{report.title}</CardTitle>
                    <div className="p-2 bg-muted rounded-md">
                        <report.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {/* Content can be added here if needed in the future */}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={report.link}>Ir al Reporte</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

        </main>
      </SidebarInset>
    </div>
  );
}
