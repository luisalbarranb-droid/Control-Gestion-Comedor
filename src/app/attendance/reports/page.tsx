
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, differenceInBusinessDays, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { User, AttendanceRecord, ConsolidatedRecord, DayOff } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/attendance/date-range-picker';
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

export default function AttendanceReportPage() {
    const firestore = useFirestore();
    const { isUserLoading } = useUser();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isClient, setIsClient] = useState(false);

    // Soluciona el error de hidratación asegurando que el código del lado del cliente se ejecute después del montaje.
    useEffect(() => {
        setIsClient(true);
        setDateRange({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        });
    }, []);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const attendanceQuery = useMemoFirebase(() => {
        if (!firestore || !dateRange?.from || !dateRange?.to) return null;
        return query(
            collection(firestore, 'attendance'),
            where('checkIn', '>=', Timestamp.fromDate(dateRange.from)),
            where('checkIn', '<=', Timestamp.fromDate(dateRange.to))
        );
    }, [firestore, dateRange]);
    
    const daysOffQuery = useMemoFirebase(() => {
        if (!firestore || !dateRange?.from || !dateRange?.to) return null;
         return query(
            collection(firestore, 'daysOff'),
            where('date', '>=', format(dateRange.from, 'yyyy-MM-dd')),
            where('date', '<=', format(dateRange.to, 'yyyy-MM-dd'))
        );
    }, [firestore, dateRange]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery, { disabled: isUserLoading });
    const { data: attendance, isLoading: isLoadingAttendance } = useCollection<AttendanceRecord>(attendanceQuery);
    const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

    const consolidatedData: ConsolidatedRecord[] = useMemo(() => {
        if (!users || !attendance || !dateRange?.from || !dateRange?.to || !daysOff) return [];
        
        const businessDays = differenceInBusinessDays(dateRange.to, dateRange.from) + 1;

        return users.map(user => {
            const userAttendance = attendance.filter(rec => rec.userId === user.id);
            const userDaysOff = daysOff.filter(d => d.userId === user.id).length;
            
            const attendedDays = userAttendance.filter(r => ['presente', 'retardo'].includes(r.status)).length;
            const justifiedAbsences = userAttendance.filter(r => r.status === 'justificado' || r.status === 'vacaciones').length;
            
            const totalHours = userAttendance.reduce((acc, rec) => {
                const checkIn = convertToDate(rec.checkIn);
                const checkOut = convertToDate(rec.checkOut);
                if (checkIn && checkOut) {
                    return acc + differenceInHours(checkOut, checkIn);
                }
                return acc;
            }, 0);

            const totalDaysInPeriod = businessDays;
            const absentDays = totalDaysInPeriod - attendedDays - justifiedAbsences - userDaysOff;

            return {
                userId: user.id,
                userName: user.name,
                attendedDays,
                absentDays: Math.max(0, absentDays), // Evitar negativos
                freeDays: userDaysOff,
                justifiedRestDays: justifiedAbsences,
                totalHours: Math.max(0, totalHours),
            };
        });
    }, [users, attendance, daysOff, dateRange]);

    const isLoading = !isClient || isLoadingUsers || isLoadingAttendance || isLoadingDaysOff || !dateRange;

    if (!isClient) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-7 w-7" />
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-[300px]" />
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </main>
        );
    }


    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold md:text-2xl">Reporte de Asistencia</h1>
                        <p className="text-sm text-muted-foreground">Consolidado de asistencia por rango de fechas.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <DateRangePicker date={dateRange} setDate={setDateRange} />
                    <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                    <Button><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen del Período</CardTitle>
                    <CardDescription>
                        {dateRange?.from && dateRange.to ? 
                        `Mostrando datos desde ${format(dateRange.from, 'dd/MM/yyyy')} hasta ${format(dateRange.to, 'dd/MM/yyyy')}`
                        : 'Seleccione un rango de fechas.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Generando reporte...</p> : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead className="text-center">Días Asistidos</TableHead>
                                    <TableHead className="text-center">Días Libres</TableHead>
                                    <TableHead className="text-center">Reposos Justif.</TableHead>
                                    <TableHead className="text-center">Ausencias</TableHead>
                                    <TableHead className="text-right">Horas Laboradas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consolidatedData.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24">No hay datos para el período seleccionado.</TableCell></TableRow>}
                                {consolidatedData.map(record => (
                                    <TableRow key={record.userId}>
                                        <TableCell className="font-medium">{record.userName}</TableCell>
                                        <TableCell className="text-center">{record.attendedDays}</TableCell>
                                        <TableCell className="text-center">{record.freeDays}</TableCell>
                                        <TableCell className="text-center">{record.justifiedRestDays}</TableCell>
                                        <TableCell className="text-center font-bold text-red-500">{record.absentDays}</TableCell>
                                        <TableCell className="text-right font-mono">{record.totalHours} hrs</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
