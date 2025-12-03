
'use client';

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
import { format, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, UserX, Clock, CalendarDays, CalendarOff, ShieldAlert } from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800', icon: UserCheck },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800', icon: UserX },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-gray-100 text-gray-800', icon: Clock },
    'justificado': { label: 'Justificado', className: 'bg-blue-100 text-blue-800', icon: ShieldAlert },
    'no-justificado': { label: 'No Justificado', className: 'bg-orange-100 text-orange-800', icon: UserX },
    'vacaciones': { label: 'Vacaciones', className: 'bg-purple-100 text-purple-800', icon: CalendarDays },
    'dia-libre': { label: 'Día Libre', className: 'bg-sky-100 text-sky-800', icon: CalendarOff },
};

interface AttendanceTableProps {
    allUsers: User[];
    currentUser: User | null;
    isAdmin: boolean;
    records: AttendanceRecord[];
    daysOff: DayOff[];
    isLoading: boolean;
agregue los cambios en el modelo de inventario, para agregar el costo unitario, asi como también en los detalles del pedido, para que se guarden con el costo real del momento en el que se hizo el pedido
    date: Date;
}

export function AttendanceTable({ allUsers, currentUser, isAdmin, records, daysOff, isLoading, date }: AttendanceTableProps) {
    
    const getUserInitials = (name: string | undefined) => name ? name.split(' ').map((n) => n[0]).join('') : '';
    const dayOfWeek = (getDay(date) + 6) % 7; // Monday is 0, Sunday is 6

    const usersToDisplay = isAdmin ? allUsers : (currentUser ? [currentUser] : []);

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Asistencia del Día</CardTitle>
                    <CardDescription>
                        Cargando registros...
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Cargando datos de asistencia...
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Asistencia del Día</CardTitle>
                <CardDescription>
                    Registro de entradas y salidas del personal para el {format(date, 'dd MMMM, yyyy', { locale: es })}.
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
                {usersToDisplay.map(user => {
                    if (!user) return null;
                    const record = records?.find(r => r.userId === user.id);
                    const userDayOff = daysOff?.find(d => d.userId === user.id);
                    const isSunday = dayOfWeek === 6;
                    
                    let statusKey: keyof typeof statusConfig = 'ausente';

                    if (isSunday || (userDayOff && userDayOff.dayOff === dayOfWeek)) {
                        statusKey = 'dia-libre';
                    } else if (record) {
                        statusKey = record.status;
                    }

                    const config = statusConfig[statusKey];
                    const checkIn = record?.checkIn?.toDate ? record.checkIn.toDate() : record?.checkIn ? new Date(record.checkIn as any) : null;
                    const checkOut = record?.checkOut?.toDate ? record.checkOut.toDate() : record?.checkOut ? new Date(record.checkOut as any) : null;
                    

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
                                {checkIn ? format(checkIn, 'HH:mm:ss') : '--:--'}
                            </TableCell>
                                <TableCell className="font-mono">
                                {checkOut ? format(checkOut, 'HH:mm:ss') : '--:--'}
                            </TableCell>
                            <TableCell>
                                {config ? (
                                    <Badge variant="secondary" className={cn(config.className, 'capitalize')}>
                                        <config.icon className="w-3 h-3 mr-1.5" />
                                        {config.label}
                                    </Badge>
                                ) : (
                                    <Badge>
                                        {statusKey}
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
                {usersToDisplay.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No hay usuarios para mostrar.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    );
}
