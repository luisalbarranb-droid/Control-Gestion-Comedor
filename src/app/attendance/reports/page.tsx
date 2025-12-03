
'use client';

import { useState, useMemo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, UserCheck, UserX, Clock, Download, Calendar as CalendarIcon, MoreHorizontal, Check, X, ShieldAlert, FileClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AttendanceRecord, AttendanceStatus, LeaveType, ConsolidatedRecord, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, differenceInHours, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useCurrentUser } from '@/hooks/use-current-user';

const statusConfig: Record<AttendanceStatus, { label: string, className: string, icon: React.ElementType }> = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800', icon: UserCheck },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800', icon: UserX },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-gray-100 text-gray-800', icon: Clock },
    'justificado': { label: 'Justificado', className: 'bg-blue-100 text-blue-800', icon: ShieldAlert },
    'no-justificado': { label: 'No Justificado', className: 'bg-orange-100 text-orange-800', icon: UserX },
    'vacaciones': { label: 'Vacaciones', className: 'bg-purple-100 text-purple-800', icon: CalendarIcon },
    'dia-libre': { label: 'Día Libre', className: 'bg-sky-100 text-sky-800', icon: CalendarIcon },
};


export default function AttendanceReportsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: currentUser, role, isLoading: isCurrentUserLoading } = useCurrentUser();
    const isAdmin = role === 'admin' || role === 'superadmin';
    const [activeTab, setActiveTab] = useState('general');
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    // --- Fetch Users ---
    const usersCollectionRef = useMemoFirebase(
        () => (firestore && isAdmin ? collection(firestore, 'users') : null),
        [firestore, isAdmin]
    );
    const { data: usersData, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);
    
    // For non-admins, the user list is just the current user
    const users = isAdmin ? usersData : (currentUser ? [currentUser] : []);

    // --- Fetch Attendance Records for date range ---
    const recordsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUser || !date?.from) return null;
        const from = new Date(date.from);
        from.setHours(0,0,0,0);
        const to = date.to ? new Date(date.to) : from;
        to.setHours(23,59,59,999);
        
        const baseQuery = query(
            collection(firestore, 'attendance'),
            where('checkIn', '>=', from),
            where('checkIn', '<=', to)
        );

        // If user is not admin, filter records by their own ID
        if (!isAdmin) {
             return query(baseQuery, where('userId', '==', currentUser.id));
        }

        return baseQuery;
    }, [firestore, date, currentUser, isAdmin]);
    const { data: filteredRecords, isLoading: isLoadingRecords } = useCollection<AttendanceRecord>(recordsQuery);

    const getUser = (userId: string) => users?.find((u) => u.id === userId);
    const getUserInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('') : '';
    
    const consolidatedData = useMemo(() => {
        if (!users || !filteredRecords) return [];

        const userStats: Record<string, ConsolidatedRecord> = users.reduce((acc, user) => {
            acc[user.id] = {
                userId: user.id,
                userName: user.nombre,
                attendedDays: 0,
                absentDays: 0,
                freeDays: 0,
                justifiedRestDays: 0,
                totalHours: 0,
            };
            return acc;
        }, {} as Record<string, ConsolidatedRecord>);

        filteredRecords.forEach(record => {
            const userStat = userStats[record.userId];
            if (!userStat) return;
            
            const checkInDate = record.checkIn.toDate ? record.checkIn.toDate() : new Date(record.checkIn);
            const checkOutDate = record.checkOut?.toDate ? record.checkOut.toDate() : record.checkOut ? new Date(record.checkOut) : null;

            switch (record.status) {
                case 'presente':
                case 'retardo':
                    userStat.attendedDays += 1;
                    if (checkInDate && checkOutDate) {
                        userStat.totalHours += differenceInHours(checkOutDate, checkInDate);
                    }
                    break;
                case 'ausente':
                case 'no-justificado':
                    userStat.absentDays += 1;
                    break;
                case 'justificado':
                    userStat.justifiedRestDays += 1;
                    break;
                case 'dia-libre':
                case 'vacaciones':
                    userStat.freeDays += 1;
                    break;
            }
        });

        return Object.values(userStats);
    }, [users, filteredRecords]);

    const absenceRecords = filteredRecords?.filter(r => r.status === 'ausente' || r.status === 'justificado' || r.status === 'no-justificado' || r.status === 'vacaciones') || [];
    const tardyRecords = filteredRecords?.filter(r => r.status === 'retardo') || [];

    const totalAbsences = absenceRecords.length;
    const totalTardies = tardyRecords.length;
    const totalAttendances = filteredRecords?.filter(r => r.status === 'presente' || r.status === 'retardo').length || 0;

    const kpiCards = [
        { title: 'Total Asistencias', value: totalAttendances, icon: UserCheck },
        { title: 'Total Retardos', value: totalTardies, icon: Clock, className: 'text-yellow-600' },
        { title: 'Total Ausencias', value: totalAbsences, icon: UserX, className: 'text-red-600' },
    ];
    
    const handleAbsenceClassification = (recordId: string, type: LeaveType) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'attendance', recordId);
        updateDocumentNonBlocking(docRef, { status: type, leaveType: type });
        toast({
            title: 'Ausencia Actualizada',
            description: `El registro ha sido clasificado como ${type}.`,
        });
    };

    const handleExport = () => {
        if (!filteredRecords) return;
        let dataToExport: any[] = [];
        let sheetName = 'Reporte';
        let fileName = `Reporte_Asistencia_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

        const baseMapping = (record: AttendanceRecord) => {
            const user = getUser(record.userId);
            const statusInfo = statusConfig[record.status];
            const checkInDate = record.checkIn.toDate ? record.checkIn.toDate() : new Date(record.checkIn);
            const checkOutDate = record.checkOut?.toDate ? record.checkOut.toDate() : record.checkOut ? new Date(record.checkOut) : null;
            return {
                'Empleado': user?.nombre || 'N/A',
                'Cédula': user?.cedula || 'N/A',
                'Fecha': format(checkInDate, 'dd/MM/yyyy'),
                'Hora Entrada': record.status !== 'ausente' ? format(checkInDate, 'HH:mm:ss') : 'N/A',
                'Hora Salida': checkOutDate ? format(checkOutDate, 'HH:mm:ss') : 'N/A',
                'Estado': statusInfo.label,
            };
        };

        if (activeTab === 'general') {
            dataToExport = filteredRecords.map(baseMapping);
            sheetName = 'Historial General';
            fileName = `Reporte_General_Asistencia_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        } else if (activeTab === 'absences') {
            dataToExport = absenceRecords.map(baseMapping);
            sheetName = 'Ausencias';
            fileName = `Reporte_Ausencias_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        } else if (activeTab === 'tardies') {
            dataToExport = tardyRecords.map(baseMapping);
            sheetName = 'Retardos';
            fileName = `Reporte_Retardos_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        } else if (activeTab === 'consolidated') {
             dataToExport = consolidatedData.map(d => ({
                'Empleado': d.userName,
                'Días Asistidos': d.attendedDays,
                'Días Ausente': d.absentDays,
                'Días Libres': d.freeDays,
                'Reposos Justificados': d.justifiedRestDays,
                'Horas Trabajadas': d.totalHours,
             }));
            sheetName = 'Consolidado Quincenal';
            fileName = `Reporte_Consolidado_Asistencia_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        }


        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        worksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, fileName);

        toast({
            title: 'Exportación Exitosa',
            description: `El ${sheetName} ha sido descargado.`,
        });
    };
    
    const renderTable = (recordsToRender: AttendanceRecord[], tableId: string, isAbsenceReport: boolean = false) => (
        <Table id={tableId}>
            <TableHeader>
                <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora Entrada</TableHead>
                    <TableHead>Hora Salida</TableHead>
                    <TableHead>Estado</TableHead>
                    {isAbsenceReport && isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
            {recordsToRender.map(record => {
                const user = getUser(record.userId);
                const statusInfo = statusConfig[record.status];
                if (!user) return null;

                const checkInDate = record.checkIn.toDate ? record.checkIn.toDate() : new Date(record.checkIn);
                const checkOutDate = record.checkOut?.toDate ? record.checkOut.toDate() : record.checkOut ? new Date(record.checkOut) : null;

                return (
                <TableRow key={record.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                <AvatarFallback>{getUserInitials(user.nombre)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.nombre}</div>
                        </div>
                    </TableCell>
                    <TableCell>{format(checkInDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-mono">
                        {record.status !== 'ausente' && record.status !== 'justificado' && record.status !== 'no-justificado' && record.status !== 'vacaciones' ? format(checkInDate, 'HH:mm:ss') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono">
                        {checkOutDate ? format(checkOutDate, 'HH:mm:ss') : '--:--'}
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className={cn(statusInfo.className, 'capitalize')}>
                            <statusInfo.icon className="w-3 h-3 mr-1.5" />
                            {statusInfo.label}
                        </Badge>
                    </TableCell>
                    {isAbsenceReport && isAdmin && (
                        <TableCell className="text-right">
                            {record.status === 'ausente' && (
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleAbsenceClassification(record.id, 'justificado')}>
                                            <Check className="mr-2 h-4 w-4" /> Marcar como Justificada
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAbsenceClassification(record.id, 'no-justificado')}>
                                            <X className="mr-2 h-4 w-4" /> Marcar como No Justificada
                                        </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => handleAbsenceClassification(record.id, 'vacaciones')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" /> Registrar Vacaciones
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </TableCell>
                    )}
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
    )

    const isLoading = isCurrentUserLoading || isLoadingRecords || (isAdmin && isLoadingUsers);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Cargando reportes...</div>;
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="font-headline text-2xl font-bold md:text-3xl">
                        Reportes de Asistencia
                        </h1>
                        <div className="flex items-center gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className={cn("w-full md:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? ( date.to ? ( <> {format(date.from, "LLL dd, y", {locale: es})} - {format(date.to, "LLL dd, y", {locale: es})} </> ) : ( format(date.from, "LLL dd, y") ) ) : ( <span>Selecciona un rango</span> )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} locale={es} />
                                </PopoverContent>
                            </Popover>
                            {isAdmin && (<Button onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar a Excel
                            </Button>)}
                             <Button asChild variant="outline">
                                <Link href="/attendance">Volver</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {kpiCards.map(kpi => (
                            <Card key={kpi.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <kpi.icon className={cn("h-4 w-4 text-muted-foreground", kpi.className)} />
                                </CardHeader>
                                <CardContent>
                                <div className={cn("text-2xl font-bold", kpi.className)}>{kpi.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className={cn("grid w-full", isAdmin ? "grid-cols-4" : "grid-cols-1")}>
                            <TabsTrigger value="general">Historial General</TabsTrigger>
                            {isAdmin && <TabsTrigger value="absences">Reporte de Ausencias</TabsTrigger>}
                            {isAdmin && <TabsTrigger value="tardies">Reporte de Retardos</TabsTrigger>}
                            {isAdmin && <TabsTrigger value="consolidated">Consolidado Quincenal</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Asistencia</CardTitle>
                                    <CardDescription>Detalle de todos los registros de asistencia para el período seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderTable(filteredRecords || [], 'general-table')}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="absences">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reporte de Ausencias</CardTitle>
                                    <CardDescription>Detalle de todos los empleados ausentes para el período seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderTable(absenceRecords, 'absences-table', true)}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="tardies">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reporte de Retardos</CardTitle>
                                    <CardDescription>Detalle de todos los empleados con retardo para el período seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderTable(tardyRecords, 'tardies-table')}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="consolidated">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileClock />Reporte Consolidado Quincenal</CardTitle>
                                    <CardDescription>Resumen de asistencia y horas trabajadas por empleado en el período seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Empleado</TableHead>
                                                <TableHead className="text-center">Días Asistidos</TableHead>
                                                <TableHead className="text-center">Días Ausente</TableHead>
                                                <TableHead className="text-center">Días Libres</TableHead>
                                                <TableHead className="text-center">Reposos</TableHead>
                                                <TableHead className="text-center">Total Horas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {consolidatedData.map(data => (
                                                <TableRow key={data.userId}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage src={getUser(data.userId)?.avatarUrl} alt={data.userName} />
                                                                <AvatarFallback>{getUserInitials(data.userName)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="font-medium">{data.userName}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono">{data.attendedDays}</TableCell>
                                                    <TableCell className="text-center font-mono">{data.absentDays}</TableCell>
                                                    <TableCell className="text-center font-mono">{data.freeDays}</TableCell>
                                                    <TableCell className="text-center font-mono">{data.justifiedRestDays}</TableCell>
                                                    <TableCell className="text-center font-mono">{data.totalHours.toFixed(1)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </SidebarInset>
        </div>
    );
}
