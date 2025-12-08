'use client';

import React from 'react';
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
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, Clock, UserX, CalendarOff, ShieldAlert } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface AttendanceTableProps {
  users: User[];
  records: AttendanceRecord[];
  daysOff: DayOff[];
  isLoading: boolean;
  date: Date;
}

export default function AttendanceTable({ users, records, daysOff, isLoading, date }: AttendanceTableProps) {
  
  const getUserInitials = (name: string | undefined) => 
    name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const getStatusDetails = (status: string | undefined, isDayOff: boolean) => {
    if (isDayOff) return { label: 'Día Libre', className: 'bg-blue-100 text-blue-700', icon: CalendarOff };
    
    switch (status) {
      case 'presente': return { label: 'Presente', className: 'bg-green-100 text-green-700', icon: UserCheck };
      case 'retardo': return { label: 'Retardo', className: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'ausente': return { label: 'Ausente', className: 'bg-red-100 text-red-700', icon: UserX };
      case 'justificado': return { label: 'Justificado', className: 'bg-purple-100 text-purple-700', icon: ShieldAlert };
      default: return { label: 'Pendiente', className: 'bg-gray-100 text-gray-500', icon: Clock };
    }
  };
  
  const convertToDate = (date: any): Date | null => {
      if (!date) return null;
      if (date instanceof Date) return date;
      if (date instanceof Timestamp) return date.toDate();
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
  }

  const calculateHours = (checkIn: any, checkOut: any) => {
    const start = convertToDate(checkIn);
    const end = convertToDate(checkOut);
    
    if (!start || !end) return '--';
    
    const totalMinutes = differenceInMinutes(end, start);
    
    if (totalMinutes < 0) return '0h 0m';
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
      return (
        <Card>
            <CardHeader><CardTitle>Asistencia del Día</CardTitle></CardHeader>
            <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                Cargando datos...
            </CardContent>
        </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia del Día</CardTitle>
        <CardDescription>
          Registro del {format(date, "dd 'de' MMMM, yyyy", { locale: es })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead className="font-bold text-blue-700">Total Horas</TableHead>
                <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users && users.map((user) => {
                const record = records?.find((r) => r.userId === user.id);
                const isDayOff = daysOff?.some((d) => d.userId === user.id); 
                
                const checkInDate = convertToDate(record?.checkIn);
                const checkOutDate = convertToDate(record?.checkOut);
                
                const status = getStatusDetails(record?.status, !!isDayOff);
                const totalHours = calculateHours(checkInDate, checkOutDate);
                
                const userName = user.name || (user as any).nombre || 'Usuario';

                return (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={(user as any).avatarUrl} />
                            <AvatarFallback>{getUserInitials(userName)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{userName}</div>
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                        {checkInDate ? format(checkInDate, 'HH:mm:ss') : '--:--'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                        {checkOutDate ? format(checkOutDate, 'HH:mm:ss') : '--:--'}
                    </TableCell>
                    
                    <TableCell className="font-mono text-xs font-bold text-blue-600">
                        {totalHours}
                    </TableCell>
                    
                    <TableCell>
                        <Badge variant="secondary" className={`flex w-fit items-center gap-1 ${status.className}`}>
                            <status.icon className="h-3 w-3" />
                            {status.label}
                        </Badge>
                    </TableCell>
                    </TableRow>
                );
                })}
                {(!users || users.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            No hay usuarios registrados.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
