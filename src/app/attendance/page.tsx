
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, FileSpreadsheet, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { AttendanceTable } from '@/components/attendance/attendance-table';
import { ScannerCard } from '@/components/attendance/scanner-card';
import { format, startOfDay, endOfDay, startOfWeek } from 'date-fns';

export default function AttendancePage() {
  const { user: currentUser, role, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = !!(currentUser && (role === 'admin' || role === 'superadmin'));
  const firestore = useFirestore();

  // --- Fetch users (Only for admins) ---
  const usersCollectionRef = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'users') : null),
    [firestore, isAdmin]
  );
  const { data: usersData, isLoading: isLoadingUsers } = useCollection(usersCollectionRef);

  // --- Fetch today's attendance records ---
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return query(
        collection(firestore, 'attendance'), 
        where('checkIn', '>=', todayStart), 
        where('checkIn', '<=', todayEnd)
    );
  }, [firestore, currentUser]);
  const { data: todayRecords, isLoading: isLoadingAttendance } = useCollection(attendanceQuery);

  // --- Fetch this week's days off ---
  const weekStartDateString = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const daysOffQuery = useMemoFirebase(() => {
      if (!firestore || !currentUser) return null;
      return query(collection(firestore, 'daysOff'), where('weekStartDate', '==', weekStartDateString));
  }, [firestore, weekStartDateString, currentUser]);
  const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection(daysOffQuery);

  // Correctly determine the overall loading state.
  // We must wait for the current user to be loaded before knowing if we need to load all users.
  const isLoading = isCurrentUserLoading || isLoadingAttendance || isLoadingDaysOff || (isAdmin && isLoadingUsers);

  // Determine which users to display. Wait until loading is complete.
  // This logic runs only when isLoading is false.
  const displayedUsers = isLoading 
    ? [] 
    : (isAdmin ? usersData : (currentUser ? [currentUser] : []));

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
                Asistencia Diaria
                </h1>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                      <Button variant="outline" asChild>
                          <Link href="/attendance/planning">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              Planificar Días Libres
                          </Link>
                      </Button>
                      <Button variant="secondary" asChild>
                          <Link href="/attendance/reports">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Ver Reportes
                          </Link>
                      </Button>
                  </div>
                )}
            </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <AttendanceTable 
                    users={displayedUsers || []} 
                    records={todayRecords || []} 
                    daysOff={daysOff || []}
                    isLoading={isLoading} 
                    date={new Date()}
                />
            </div>
            {isAdmin && (
                <div>
                    <ScannerCard />
                </div>
            )}
           </div>
        </main>
      </SidebarInset>
    </div>
  );
}
