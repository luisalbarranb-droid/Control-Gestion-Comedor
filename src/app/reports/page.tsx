
'use client';

import { BarChart, FileSpreadsheet, Users, Package, BookOpen, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
  },
  {
    title: 'Reportes Automáticos',
    description: 'Configura el envío semanal de PDFs a tu correo electrónico todos los viernes.',
    link: '/reports/automation',
    icon: FileSpreadsheet,
    highlight: true
  }
]

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Central de Reportes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className={cn("flex flex-col", report.highlight && "border-primary bg-primary/5 shadow-md")}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {report.title}
                    {report.highlight && <Badge variant="default" className="text-[10px] h-4">NUEVO</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-1">{report.description}</CardDescription>
                </div>
                <div className={cn("p-2 rounded-md", report.highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <report.icon className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={report.highlight ? "default" : "outline"}>
                <Link href={report.link}>{report.highlight ? "Configurar Envío" : "Ir al Reporte"}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
