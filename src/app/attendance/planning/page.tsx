'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlanningTable } from '@/components/attendance/planning-table';
import { users } from '@/lib/placeholder-data';
import type { DayOff } from '@/lib/types';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PlanningPage() {
  // Using a date to represent the current week
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [daysOff, setDaysOff] = useState<DayOff[]>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleSave = (newDaysOff: DayOff[]) => {
    // In a real app, you would save this to a database
    // For this prototype, we'll merge the new data with existing data
    setDaysOff(prev => {
        const otherWeeksData = prev.filter(d => d.weekStartDate !== newDaysOff[0]?.weekStartDate);
        return [...otherWeeksData, ...newDaysOff];
    })
  };

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
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Planificación de Días Libres
                </h1>
                <p className="text-muted-foreground">Asigna el día libre rotativo de la semana para cada empleado.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/attendance">Volver a Asistencia</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Planificador Semanal</CardTitle>
                    <CardDescription>
                        Semana del {format(weekStart, 'dd MMMM', { locale: es })} al {format(weekEnd, 'dd MMMM, yyyy', { locale: es })}
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PlanningTable 
                week={currentWeek} 
                users={users} 
                initialDaysOff={daysOff} 
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
