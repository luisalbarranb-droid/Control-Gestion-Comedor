'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { weeklyMenus, dailyClosings } from '@/lib/placeholder-data';
import type { DailyClosing, DailyClosingItem } from '@/lib/types';
import { ClosingForm } from '@/components/daily-closing/closing-form';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { categoryDisplay } from '@/components/daily-closing/category-display';
import Link from 'next/link';

export default function DailyClosingPage() {
  const [date, setDate] = useState<Date>(subDays(new Date(),1));
  const [closings, setClosings] = useState<DailyClosing[]>(dailyClosings);
  const [isFormOpen, setFormOpen] = useState(false);

  const selectedClosing = closings.find(c => format(c.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  const plannedMenuForDay = weeklyMenus.find(m => format(m.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

  const handleSaveClosing = (data: Omit<DailyClosing, 'closingId' | 'plannedMenu' | 'closedBy' | 'date'>) => {
    const newClosing: DailyClosing = {
      ...data,
      closingId: `closing-${Date.now()}`,
      date: date,
      plannedMenu: plannedMenuForDay || null,
      closedBy: 'user-superadmin-1', // Placeholder
    };
    
    // Replace if exists, otherwise add
    setClosings(prev => {
        const existingIndex = prev.findIndex(c => format(c.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = newClosing;
            return updated;
        }
        return [...prev, newClosing];
    });

    setFormOpen(false);
  }

  const renderMenuList = (title: string, pax: number | undefined, items: (DailyClosingItem | {name: string, category: any})[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {pax !== undefined && <CardDescription>{pax} Comensales</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length > 0 ? items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <span className="font-medium text-sm">{item.name}</span>
            <Badge variant="outline" className={cn(categoryDisplay[item.category]?.className)}>
              {categoryDisplay[item.category]?.label || 'Otro'}
            </Badge>
          </div>
        )) : <p className="text-sm text-muted-foreground text-center py-4">No se definió menú para este día.</p>}
      </CardContent>
    </Card>
  );

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Cierre Diario: Planificado vs. Ejecutado
            </h1>
            <div className="flex items-center gap-2">
              <DatePicker date={date} setDate={(d) => setDate(d || new Date())} />
               {selectedClosing && (
                <Button variant="secondary" asChild>
                  <Link href={`/daily-closing/report?date=${format(date, 'yyyy-MM-dd')}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Reporte Detallado
                  </Link>
                </Button>
              )}
              <Button onClick={() => setFormOpen(true)} disabled={!plannedMenuForDay}>
                {selectedClosing ? 'Editar Cierre' : 'Realizar Cierre'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderMenuList('Menú Planificado', plannedMenuForDay?.pax, plannedMenuForDay?.items || [])}
            {selectedClosing 
              ? renderMenuList('Menú Ejecutado', selectedClosing.executedPax, selectedClosing.executedItems)
              : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aún no se ha realizado el cierre para este día.</p>
                </div>
              )
            }
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Variaciones y Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {selectedClosing ? selectedClosing.variations : 'No hay observaciones para este día.'}
              </p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <ClosingForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveClosing}
        plannedMenu={plannedMenuForDay || null}
        existingClosing={selectedClosing}
      />
    </div>
  );
}
