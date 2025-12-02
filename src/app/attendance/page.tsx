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
import { SquareCheck, MoreHorizontal, UserCheck, UserX, Clock, FileSpreadsheet } from 'lucide-react';
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
import { users, attendanceRecords } from '@/lib/placeholder-data';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScannerCard } from '@/components/attendance/scanner-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const statusConfig: Record<AttendanceStatus, { label: string, className: string, icon: React.ElementType }> = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800', icon: UserCheck },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800', icon: UserX },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-gray-100 text-gray-800', icon: Clock },
};


export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(attendanceRecords);

  const getUser = (userId: string) => users.find((u) => u.userId === userId);
  const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  const todayRecords = records.filter(r => format(r.checkIn, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));

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
                <Button variant="secondary" asChild>
                    <Link href="/attendance/reports">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Ver Reportes
                    </Link>
                </Button>
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
                        {users.map(user => {
                            const record = todayRecords.find(r => r.userId === user.userId);
                            const status = record?.status || 'ausente';
                            const config = statusConfig[status];

                            return (
                                <TableRow key={user.userId}>
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
                                        {record?.checkIn ? format(record.checkIn, 'HH:mm:ss') : '--:--'}
                                    </TableCell>
                                     <TableCell className="font-mono">
                                        {record?.checkOut ? format(record.checkOut, 'HH:mm:ss') : '--:--'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={cn(config.className, 'capitalize')}>
                                            <config.icon className="w-3 h-3 mr-1.5" />
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
            <div>
                <ScannerCard />
            </div>
           </div>
        </main>
      </SidebarInset>
    </div>
  );
}
