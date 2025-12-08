'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlanningTable } from '@/components/attendance/planning-table';
import type { DayOff, User } from '@/lib/types';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

export default function PlanningPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const [localDaysOff, setLocalDaysOff] = useState<Omit<DayOff, 'id'>[]>([]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  
  const isAdmin = true; 

  const [currentWeek, setCurrentWeek] = useState(new Date());

  const usersCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'users') : null),
    [firestore, authUser]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);
  
  const weekStartDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekStartDateString = format(weekStartDate, 'yyyy-MM-dd');
  
  const daysOffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'daysOff'), where('weekStartDate', '==', weekStartDateString));
  }, [firestore, weekStartDateString]);
  
  const { data: remoteDaysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

  useState(() => {
    if (remoteDaysOff) {
      setLocalDaysOff(remoteDaysOff);
    }
  }, [remoteDaysOff]);

  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToggleDay = (userId: string, dateIso: string, isCurrentlyChecked: boolean) => {
    setLocalDaysOff(prev => {
        if (isCurrentlyChecked) {
            return prev.filter(d => !(d.userId === userId && d.date === dateIso));
        } else {
            return [...prev, { userId, date: dateIso, weekStartDate: weekStartDateString }];
        }
    });
  };
  
  const handleSave = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error de conexión' });
      return;
    }

    const batch = writeBatch(firestore);

    // First, delete all existing days off for the current week from Firestore
    remoteDaysOff?.forEach(dayOffDoc => {
      const docRef = doc(firestore, 'daysOff', dayOffDoc.id);
      batch.delete(docRef);
    });

    // Then, add all the current local days off to the batch
    localDaysOff.forEach(dayOff => {
      const docId = `${dayOff.userId}_${dayOff.date}`; // Use date for uniqueness
      const docRef = doc(firestore, 'daysOff', docId);
      batch.set(docRef, { ...dayOff, id: docId });
    });

    try {
      await batch.commit();
      toast({
        title: "Planificación Guardada",
        description: "Los días libres para la semana han sido actualizados."
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Error al guardar",
        description: "No se pudieron actualizar los días libres.",
      });
      console.error("Error saving days off:", error);
    }
  };

  const isLoading = isAuthLoading || isProfileLoading || isLoadingUsers || isLoadingDaysOff;

  if (isLoading && !users) {
    return <div className="flex items-center justify-center h-full p-8"><p>Cargando...</p></div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">Planificación de Días Libres</h1>
                <p className="text-muted-foreground">Asigna el día libre rotativo de la semana para cada empleado.</p>
            </div>
             <div className="flex items-center gap-2">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
                <Button asChild variant="outline">
                    <Link href="/attendance/personal">Volver a Personal</Link>
                </Button>
            </div>
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
            {isLoading && !users ? (
            <p>Cargando datos de planificación...</p>
            ) : (
            <PlanningTable 
                week={currentWeek} 
                users={users || []} 
                daysOff={localDaysOff || []} 
                onToggleDay={handleToggleDay}
            />
            )}
        </CardContent>
        </Card>
    </div>
  );
}
