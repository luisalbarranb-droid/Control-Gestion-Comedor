'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, MoreHorizontal, UserCheck, UserX, Clock, FileSpreadsheet, CalendarDays, CalendarOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AttendanceRecord, DayOff, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, getDay, startOfWeek, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScannerCard } from '@/components/attendance/scanner-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const statusConfig: Record<string, { label: string, className: string, icon: React.ElementType }> = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800', icon: UserCheck },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800', icon: UserX },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-gray-100 text-gray-800', icon: Clock },
    'justificado': { label: 'Justificado', className: 'bg-blue-100 text-blue-800', icon: UserCheck },
    'no-justificado': { label: 'No Justificado', className: 'bg-orange-100 text-orange-800', icon: UserX },
    'vacaciones': { label: 'Vacaciones', className: 'bg-purple-100 text-purple-800', icon: CalendarDays },
    'dia-libre': { label: 'Día Libre', className: 'bg-sky-100 text-sky-800', icon: CalendarOff },
};

export default function AttendancePage() {
  const { user: currentUser, role, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = role === 'admin' || role === 'superadmin';
  const firestore = useFirestore();

  // --- Fetch users ---
  const usersCollectionRef = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'users') : null),
    [firestore, isAdmin]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

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
  const { data: todayRecords, isLoading: isLoadingAttendance } = useCollection<AttendanceRecord>(attendanceQuery);

  // --- Fetch this week's days off ---
  const weekStartDateString = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const daysOffQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, 'daysOff'), where('weekStartDate', '==', weekStartDateString));
  }, [firestore, weekStartDateString, currentUser]);
  const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

  const getUserInitials = (name: string | undefined) => name ? name.split(' ').map((n) => n[0]).join('') : '';

  const today = new Date();
  const todayDayOfWeek = (getDay(today) + 6) % 7; // Monday is 0, Sunday is 6
  
  // If not admin, the displayed user is only the current user
  const displayedUsers = isAdmin ? users : (currentUser ? [currentUser] : []);

  const isLoading = isCurrentUserLoading || (isAdmin && isLoadingUsers) || isLoadingAttendance || isLoadingDaysOff;
  
  if (isLoading) {
      return (
          <div className="min-h-screen w-full flex items-center justify-center">
              <p>Cargando datos de asistencia...</p>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Asistencia del Día</CardTitle>
                        <CardDescription>
                            Registro de entradas y salidas del personal para el {format(new Date(), 'dd MMMM, yyyy', { locale: es })}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Hora Entrada</TableHead>
                            <TableHead>Hora Salida</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {displayedUsers?.map(user => {
                            if (!user) return null;
                            const record = todayRecords?.find(r => r.userId === user.id);
                            const userDayOff = daysOff?.find(d => d.userId === user.id);
                            const isSunday = todayDayOfWeek === 6;
                            
                            let status: keyof typeof statusConfig = 'ausente';

                            if (isSunday || (userDayOff && userDayOff.dayOff === todayDayOfWeek)) {
                                status = 'dia-libre';
                            } else if (record) {
                                status = record.status;
                            }

                            const config = statusConfig[status];
                            const checkInDate = record?.checkIn instanceof Date ? record.checkIn : record?.checkIn?.toDate();
                            const checkOutDate = record?.checkOut instanceof Date ? record.checkOut : record?.checkOut?.toDate();

                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                            <AvatarFallback>
                                            {getUserInitials(user.nombre)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{user.nombre}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {checkInDate ? format(checkInDate, 'HH:mm:ss') : '--:--'}
                                    </TableCell>
                                     <TableCell className="font-mono">
                                        {checkOutDate ? format(checkOutDate, 'HH:mm:ss') : '--:--'}
                                    </TableCell>
                                    <TableCell>
                                        {config ? (
                                            <Badge variant="secondary" className={cn(config.className, 'capitalize')}>
                                                <config.icon className="w-3 h-3 mr-1.5" />
                                                {config.label}
                                            </Badge>
                                        ) : (
                                            <Badge>
                                                {status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
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
