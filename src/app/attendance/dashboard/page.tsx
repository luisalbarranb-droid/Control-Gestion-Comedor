'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { format, set, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock, UserCheck, UserX, AlertTriangle, CalendarCheck2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { AttendanceRecord, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


// --- Helper Functions ---
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function';
}

function convertToDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (isTimestamp(date)) return date.toDate();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
}

const statusConfig = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800' },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800' },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800' },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-purple-100 text-purple-800' },
    justificado: { label: 'Justificado', className: 'bg-blue-100 text-blue-800' },
    'no-justificado': { label: 'No Justificado', className: 'bg-orange-100 text-orange-800' },
    vacaciones: { label: 'Vacaciones', className: 'bg-indigo-100 text-indigo-800' },
    'dia-libre': { label: 'Día Libre', className: 'bg-gray-100 text-gray-800' },
};


export default function AttendanceDashboardPage() {
  const firestore = useFirestore();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  // CRITICAL FIX: Ensure client-side-only code runs after mount to prevent hydration mismatch.
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { startOfToday, endOfToday } = useMemo(() => {
    const start = set(currentDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = set(currentDate, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
    return { startOfToday: start, endOfToday: end };
  }, [currentDate]);


  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'attendance'),
      where('checkIn', '>=', Timestamp.fromDate(startOfToday)),
      where('checkIn', '<=', Timestamp.fromDate(endOfToday))
    );
  }, [firestore, startOfToday, endOfToday]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useCollection<AttendanceRecord>(attendanceQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const stats = useMemo(() => {
    if (!attendanceRecords || !users) return { present: 0, late: 0, absent: 0, recent: [] };
    
    const presentIds = new Set(attendanceRecords.filter(r => r.status === 'presente' || r.status === 'retardo').map(r => r.userId));
    const present = attendanceRecords.filter(r => r.status === 'presente').length;
    const late = attendanceRecords.filter(r => r.status === 'retardo').length;
    
    // An active user is one who should be working today (not on a day off, etc.)
    // For simplicity, we consider all users active for now.
    const absent = users.filter(u => u.isActive).length - presentIds.size;

    const recent = attendanceRecords
      .sort((a, b) => {
        const dateA = convertToDate(a.checkIn)?.getTime() || 0;
        const dateB = convertToDate(b.checkIn)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return { present, late, absent, recent };
  }, [attendanceRecords, users]);

  const isLoading = isLoadingAttendance || isLoadingUsers;

  const getUser = (userId: string) => users?.find(u => u.id === userId);
  const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  
  if (!isClient) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-full mt-2" /></CardContent></Card>
            </div>
             <Card>
                <CardHeader><CardTitle>Actividad Reciente</CardTitle><CardDescription>Últimos registros de entrada y salida del día de hoy.</CardDescription></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
        </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/attendance">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold md:text-2xl">Dashboard de Asistencia</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.present}</div>
            <p className="text-xs text-muted-foreground">Empleados que han registrado entrada.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retardos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{isLoading ? '...' : stats.late}</div>
            <p className="text-xs text-muted-foreground">Llegadas después de la hora.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{isLoading ? '...' : stats.absent < 0 ? 0 : stats.absent}</div>
            <p className="text-xs text-muted-foreground">Sin registro de entrada hoy.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos registros de entrada y salida del día de hoy.</CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? <p>Cargando actividad...</p> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Hora de Entrada</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.recent.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No hay actividad reciente.</TableCell></TableRow>}
                        {stats.recent.map(record => {
                            const user = getUser(record.userId);
                            const checkInTime = convertToDate(record.checkIn);
                            const statusInfo = statusConfig[record.status] || { label: record.status, className: 'bg-gray-100 text-gray-800' };
                            return (
                                <TableRow key={record.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={(user as any)?.avatarUrl} />
                                                <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user?.name || 'Desconocido'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{checkInTime ? format(checkInTime, 'hh:mm:ss a') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge className={cn('capitalize', statusInfo.className)}>{statusInfo.label}</Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
             )}
        </CardContent>
      </Card>
    </main>
  );
}
