'use client';

import React from 'react';
import { format, startOfWeek } from 'date-fns';
import { FileSpreadsheet, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

// Importación por defecto (Sin llaves)
import AttendanceTable from '@/components/attendance/attendance-table';
import { ScannerCard } from '@/components/attendance/scanner-card';
import type { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function AttendancePage() {
  const { user: authUser, profile: currentUser } = useUser();
  const firestore = useFirestore();

  const role = (currentUser as any)?.role || (currentUser as any)?.rol;
  const isAdmin = role === 'admin' || role === 'superadmin'; 

  // 1. Obtener todos los usuarios
  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

  const usersToDisplay = isAdmin ? allUsers : (currentUser ? [currentUser] : allUsers);

  // 2. Obtener registros de HOY
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null; 
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return query(
        collection(firestore, 'attendance'), 
        where('checkIn', '>=', todayStart), 
        where('checkIn', '<=', todayEnd)
    );
  }, [firestore, authUser]);
  
  const { data: todayRecords, isLoading: isLoadingAttendance } = useCollection(attendanceQuery);

  // 3. Obtener Días Libres
  const weekStartDateString = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const daysOffQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'daysOff'), where('weekStartDate', '==', weekStartDateString));
  }, [firestore, authUser, weekStartDateString]);
  
  const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection(daysOffQuery);
  const isLoading = isLoadingUsers || isLoadingAttendance || isLoadingDaysOff;

  // --- VISTA PRINCIPAL ---
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Gestión de RRHH
                </h1>
                <p className="text-muted-foreground">Control de asistencia y personal.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {/* BOTÓN 1: GESTIÓN DE PERSONAL */}
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/attendance/personal"> {/* <-- RUTA CORREGIDA */}
                        <Users className="mr-2 h-4 w-4" />
                        Expedientes / Personal
                    </Link>
                </Button>

                {/* BOTÓN 2: PLANIFICAR DÍAS LIBRES */}
                <Button variant="outline" asChild>
                    <Link href="/attendance/planning">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Planificar Libres
                    </Link>
                </Button>
                
                {/* BOTÓN 3: REPORTES */}
                <Button variant="secondary" asChild>
                    <Link href="/attendance/reports">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Reportes
                    </Link>
                </Button>
            </div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <AttendanceTable 
                users={usersToDisplay || []}
                records={todayRecords || []} 
                daysOff={daysOff || []}
                isLoading={isLoading} 
                date={new Date()}
            />
        </div>

        <div>
            <ScannerCard />
        </div>
       </div>
    </div>
  );
}