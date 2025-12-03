
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
import type { DayOff, User } from '@/lib/types';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

export default function PlanningPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  
  const rol = currentUser?.rol;

  const [currentWeek, setCurrentWeek] = useState(new Date());

  const usersCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'users') : null),
    [firestore, authUser]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);
  
  const daysOffCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'daysOff') : null),
    [firestore, authUser]
  );
  const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffCollectionRef);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleSave = (newDaysOff: Omit<DayOff, 'id'>[]) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: "Error de conexión",
        description: "No se pudo conectar a la base de datos."
      });
      return;
    }
  
    const weekStartDate = newDaysOff[0]?.weekStartDate;
  
    const existingForWeek = daysOff?.filter(d => d.weekStartDate === weekStartDate) || [];
    existingForWeek.forEach(dayOffDoc => {
      const docRef = doc(firestore, 'daysOff', dayOffDoc.id);
      deleteDocumentNonBlocking(docRef);
    });
  
    newDaysOff.forEach(dayOff => {
      const docId = `${dayOff.userId}_${dayOff.weekStartDate}`;
      const docRef = doc(firestore, 'daysOff', docId);
      setDocumentNonBlocking(docRef, { ...dayOff, id: docId }, { merge: false });
    });
  
    toast({
        title: "Planificación Guardada",
        description: "Los días libres para la semana han sido actualizados."
    });
  };

  const isLoading = isAuthLoading || isProfileLoading || isLoadingUsers || isLoadingDaysOff;

  if (isAuthLoading || !currentUser) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <p>Cargando...</p>
        </div>
    )
  }

  if (rol !== 'admin' && rol !== 'superadmin') {
      return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <p>No tienes permiso para acceder a esta página.</p>
        </div>
      )
  }

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
              {isLoading ? (
                <p>Cargando datos de planificación...</p>
              ) : (
                <PlanningTable 
                    week={currentWeek} 
                    users={users || []} 
                    initialDaysOff={daysOff || []} 
                    onSave={handleSave}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
