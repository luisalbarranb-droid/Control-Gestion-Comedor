
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
import { SquareCheck, UserCheck, UserX, Clock, Download, Calendar as CalendarIcon } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { attendanceRecords, users } from '@/lib/placeholder-data';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';

const statusConfig: Record<AttendanceStatus, { label: string, className: string, icon: React.ElementType }> = {
    presente: { label: 'Presente', className: 'bg-green-100 text-green-800', icon: UserCheck },
    ausente: { label: 'Ausente', className: 'bg-red-100 text-red-800', icon: UserX },
    retardo: { label: 'Retardo', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'fuera-de-horario': { label: 'Fuera de Horario', className: 'bg-gray-100 text-gray-800', icon: Clock },
};


export default function AttendanceReportsPage() {
    const { toast } = useToast();
    const [records] = useState<AttendanceRecord[]>(attendanceRecords);
    const [activeTab, setActiveTab] = useState('general');
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });

    const getUser = (userId: string) => users.find((u) => u.userId === userId);
    const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

    const filteredRecords = records.filter(record => {
        if (!date?.from) return true;
        const recordDate = new Date(record.checkIn);
        const from = new Date(date.from);
        from.setHours(0,0,0,0);
        if (!date.to) return recordDate >= from;
        const to = new Date(date.to);
        to.setHours(23,59,59,999);
        return recordDate >= from && recordDate <= to;
    });

    const absenceRecords = filteredRecords.filter(r => r.status === 'ausente');
    const tardyRecords = filteredRecords.filter(r => r.status === 'retardo');

    const totalAbsences = absenceRecords.length;
    const totalTardies = tardyRecords.length;
    const totalAttendances = filteredRecords.filter(r => r.status === 'presente' || r.status === 'retardo').length;

    const kpiCards = [
        { title: 'Total Asistencias', value: totalAttendances, icon: UserCheck },
        { title: 'Total Retardos', value: totalTardies, icon: Clock, className: 'text-yellow-600' },
        { title: 'Total Ausencias', value: totalAbsences, icon: UserX, className: 'text-red-600' },
    ];

    const handleExport = () => {
        let dataToExport: any[] = [];
        let sheetName = 'Reporte';
        let fileName = `Reporte_Asistencia_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

        const baseMapping = (record: AttendanceRecord) => {
            const user = getUser(record.userId);
            const statusInfo = statusConfig[record.status];
            return {
                'Empleado': user?.nombre || 'N/A',
                'Cédula': user?.cedula || 'N/A',
                'Fecha': format(record.checkIn, 'dd/MM/yyyy'),
                'Hora Entrada': record.status !== 'ausente' ? format(record.checkIn, 'HH:mm:ss') : 'N/A',
                'Hora Salida': record.checkOut ? format(record.checkOut, 'HH:mm:ss') : 'N/A',
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
    
    const renderTable = (recordsToRender: AttendanceRecord[], tableId: string) => (
        <Table id={tableId}>
            <TableHeader>
                <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora Entrada</TableHead>
                    <TableHead>Hora Salida</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {recordsToRender.map(record => {
                const user = getUser(record.userId);
                const statusInfo = statusConfig[record.status];
                if (!user) return null;
                return (
                <TableRow key={record.recordId}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                <AvatarFallback>{getUserInitials(user.nombre)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.nombre}</div>
                        </div>
                    </TableCell>
                    <TableCell>{format(record.checkIn, 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-mono">
                        {record.status !== 'ausente' ? format(record.checkIn, 'HH:mm:ss') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono">
                        {record.checkOut ? format(record.checkOut, 'HH:mm:ss') : '--:--'}
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className={cn(statusInfo.className, 'capitalize')}>
                            <statusInfo.icon className="w-3 h-3 mr-1.5" />
                            {statusInfo.label}
                        </Badge>
                    </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
    )


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
                            <Button onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar a Excel
                            </Button>
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
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="general">Historial General</TabsTrigger>
                            <TabsTrigger value="absences">Reporte de Ausencias</TabsTrigger>
                            <TabsTrigger value="tardies">Reporte de Retardos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Asistencia</CardTitle>
                                    <CardDescription>Detalle de todos los registros de asistencia para el período seleccionado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {renderTable(filteredRecords, 'general-table')}
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
                                    {renderTable(absenceRecords, 'absences-table')}
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
                    </Tabs>
                </main>
            </SidebarInset>
        </div>
    );
}
