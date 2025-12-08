'use client';

import React, { useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { User, AttendanceRecord, DayOff } from '@/lib/types';
import { ArrowLeft, User as UserIcon, Mail, Phone, Briefcase, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';


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
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800 border-green-200' },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800 border-red-200' },
    justificado: { label: 'Justificado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    'dia-libre': { label: 'Día Libre', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    vacaciones: { label: 'Vacaciones', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
};

export default function EmployeeDetailPage() {
    const params = useParams();
    const employeeId = params.employeeId as string;
    const firestore = useFirestore();

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const employeeDocRef = useMemoFirebase(() => {
        if (!firestore || !employeeId) return null;
        return doc(firestore, 'users', employeeId);
    }, [firestore, employeeId]);
    const { data: employee, isLoading: isLoadingEmployee } = useDoc<User>(employeeDocRef);

    const start = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
    const end = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

    const attendanceQuery = useMemoFirebase(() => {
        if (!firestore || !employeeId) return null;
        return query(
            collection(firestore, 'attendance'),
            where('userId', '==', employeeId),
            where('checkIn', '>=', start),
            where('checkIn', '<=', end)
        );
    }, [firestore, employeeId, start, end]);
    
    const daysOffQuery = useMemoFirebase(() => {
         if (!firestore || !employeeId) return null;
        return query(
            collection(firestore, 'daysOff'),
            where('userId', '==', employeeId),
            where('date', '>=', format(start, 'yyyy-MM-dd')),
            where('date', '<=', format(end, 'yyyy-MM-dd'))
        );
    }, [firestore, employeeId, start, end]);

    const { data: attendance, isLoading: isLoadingAttendance } = useCollection<AttendanceRecord>(attendanceQuery);
    const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

    const calendarModifiers = useMemo(() => {
        const modifiers: Record<string, Date[]> = {
            presente: [], retardo: [], ausente: [], justificado: [], 'dia-libre': []
        };
        attendance?.forEach(rec => {
            const date = convertToDate(rec.checkIn);
            if(date && modifiers[rec.status]) {
                modifiers[rec.status].push(date);
            }
        });
        daysOff?.forEach(day => {
            const date = convertToDate(day.date);
            if (date) {
                modifiers['dia-libre'].push(date);
            }
        });
        return modifiers;
    }, [attendance, daysOff]);

    const calendarModifiersClassNames = {
        presente: 'bg-green-200 text-green-900 rounded-full',
        retardo: 'bg-yellow-200 text-yellow-900 rounded-full',
        ausente: 'bg-red-200 text-red-900 rounded-full',
        justificado: 'bg-blue-200 text-blue-900 rounded-full',
        'dia-libre': 'bg-gray-200 text-gray-900 rounded-full',
    };

    const isLoading = isLoadingEmployee || isLoadingAttendance || isLoadingDaysOff;
    const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Cargando expediente...</div>;
    }

    if (!employee) {
        notFound();
    }

    return (
         <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/attendance/personal">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold md:text-2xl">Expediente de Empleado</h1>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={employee.avatarUrl} />
                                    <AvatarFallback className="text-3xl">{getUserInitials(employee.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                                    <p className="text-muted-foreground">{employee.cedula}</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{employee.email}</span></div>
                                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{employee.phone || 'N/A'}</span></div>
                                <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /><span className="capitalize">{employee.role}</span></div>
                                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{employee.address || 'N/A'}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                         <CardHeader>
                             <CardTitle>Leyenda del Calendario</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-2">
                             {Object.entries(statusConfig).map(([status, {label, className}]) => (
                                <div key={status} className="flex items-center gap-2">
                                    <span className={cn('block h-4 w-4 rounded-full border', className.replace('text-', 'border-'))}></span>
                                    <span className="text-sm">{label}</span>
                                </div>
                             ))}
                         </CardContent>
                     </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Asistencia Mensual</CardTitle>
                            <CardDescription>Visualiza el historial de asistencia del empleado para el mes seleccionado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <CalendarComponent
                                mode="single"
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                selected={new Date()}
                                className="p-0"
                                classNames={{
                                    ...calendarModifiersClassNames,
                                    day_today: 'bg-accent text-accent-foreground',
                                }}
                                modifiers={calendarModifiers}
                                locale={es}
                            />
                        </CardContent>
                    </Card>
                </div>

            </div>
         </main>
    );
}
