
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInBusinessDays, differenceInHours, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, CalendarDays, CalendarRange, CalendarCheck, Users, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { User, AttendanceRecord, DayOff } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/attendance/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// --- Types ---
type PeriodType = 'semanal' | 'quincenal' | 'mensual' | 'custom';

interface ConsolidatedReportRecord {
    userId: string;
    userName: string;
    cargo: string;
    diasTrabajados: number;
    diasLibres: number;
    permisosJustificados: number;
    permisosInjustificados: number;
    vacaciones: number;
    totalDiasNetos: number;
    totalHoras: number;
    porcentajeAsistencia: number;
}

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

function getPeriodLabel(period: PeriodType): string {
    switch (period) {
        case 'semanal': return 'Semanal';
        case 'quincenal': return 'Quincenal';
        case 'mensual': return 'Mensual';
        case 'custom': return 'Personalizado';
    }
}

export default function AttendanceReportPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { isUserLoading } = useUser();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isClient, setIsClient] = useState(false);
    const [periodType, setPeriodType] = useState<PeriodType>('mensual');

    useEffect(() => {
        setIsClient(true);
        applyPeriod('mensual');
    }, []);

    function applyPeriod(type: PeriodType) {
        const today = new Date();
        setPeriodType(type);
        switch (type) {
            case 'semanal':
                setDateRange({
                    from: startOfWeek(today, { weekStartsOn: 1 }),
                    to: endOfWeek(today, { weekStartsOn: 1 }),
                });
                break;
            case 'quincenal': {
                const currentDay = today.getDate();
                if (currentDay <= 15) {
                    setDateRange({
                        from: new Date(today.getFullYear(), today.getMonth(), 1),
                        to: new Date(today.getFullYear(), today.getMonth(), 15),
                    });
                } else {
                    setDateRange({
                        from: new Date(today.getFullYear(), today.getMonth(), 16),
                        to: endOfMonth(today),
                    });
                }
                break;
            }
            case 'mensual':
                setDateRange({
                    from: startOfMonth(today),
                    to: endOfMonth(today),
                });
                break;
            case 'custom':
                // Don't change dates, let user pick
                break;
        }
    }

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

    const consolidatedData: ConsolidatedReportRecord[] = useMemo(() => {
        if (!users || !attendance || !dateRange?.from || !dateRange?.to || !daysOff) return [];

        const businessDays = differenceInBusinessDays(dateRange.to, dateRange.from) + 1;

        return users.map(user => {
            const userAttendance = attendance.filter(rec => rec.userId === user.id);
            const userDaysOff = daysOff.filter(d => d.userId === user.id).length;

            const diasTrabajados = userAttendance.filter(r => ['presente', 'retardo'].includes(r.status)).length;
            const permisosJustificados = userAttendance.filter(r => r.status === 'justificado').length;
            const permisosInjustificados = userAttendance.filter(r => r.status === 'no-justificado' || r.status === 'ausente').length;
            const vacaciones = userAttendance.filter(r => r.status === 'vacaciones').length;

            const totalHours = userAttendance.reduce((acc, rec) => {
                const checkIn = convertToDate(rec.checkIn);
                const checkOut = convertToDate(rec.checkOut);
                if (checkIn && checkOut) {
                    return acc + differenceInHours(checkOut, checkIn);
                }
                return acc;
            }, 0);

            const totalDiasNetos = diasTrabajados;
            const totalDiasEnPeriodo = businessDays;
            const porcentajeAsistencia = totalDiasEnPeriodo > 0
                ? Math.round((diasTrabajados / totalDiasEnPeriodo) * 100)
                : 0;

            return {
                userId: user.id,
                userName: user.name,
                cargo: (user as any).cargo || (user as any).role || 'Trabajador',
                diasTrabajados,
                diasLibres: userDaysOff,
                permisosJustificados,
                permisosInjustificados,
                vacaciones,
                totalDiasNetos,
                totalHoras: Math.max(0, totalHours),
                porcentajeAsistencia,
            };
        });
    }, [users, attendance, daysOff, dateRange]);

    // --- Totals ---
    const totals = useMemo(() => {
        if (consolidatedData.length === 0) return null;
        return {
            diasTrabajados: consolidatedData.reduce((s, r) => s + r.diasTrabajados, 0),
            diasLibres: consolidatedData.reduce((s, r) => s + r.diasLibres, 0),
            permisosJustificados: consolidatedData.reduce((s, r) => s + r.permisosJustificados, 0),
            permisosInjustificados: consolidatedData.reduce((s, r) => s + r.permisosInjustificados, 0),
            vacaciones: consolidatedData.reduce((s, r) => s + r.vacaciones, 0),
            totalDiasNetos: consolidatedData.reduce((s, r) => s + r.totalDiasNetos, 0),
            totalHoras: consolidatedData.reduce((s, r) => s + r.totalHoras, 0),
            promedioAsistencia: Math.round(consolidatedData.reduce((s, r) => s + r.porcentajeAsistencia, 0) / consolidatedData.length),
        };
    }, [consolidatedData]);

    // --- KPI Cards ---
    const kpis = useMemo(() => {
        if (!totals || consolidatedData.length === 0) return null;
        return {
            totalEmpleados: consolidatedData.length,
            totalDiasTrabajados: totals.diasTrabajados,
            totalPermisos: totals.permisosJustificados + totals.permisosInjustificados,
            promedioAsistencia: totals.promedioAsistencia,
        };
    }, [totals, consolidatedData]);

    const handleExport = () => {
        if (consolidatedData.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay datos para exportar.' });
            return;
        }

        const periodLabel = getPeriodLabel(periodType);
        const fromStr = dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : '';
        const toStr = dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : '';

        // Summary header
        const summaryRows = [
            ['REPORTE CONSOLIDADO DE ASISTENCIA'],
            [`Período: ${periodLabel}`],
            [`Desde: ${fromStr}  -  Hasta: ${toStr}`],
            [`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
            [],
        ];

        const reportData = consolidatedData.map((record, index) => ({
            '#': index + 1,
            'Empleado': record.userName,
            'Cargo': record.cargo,
            'Días Trabajados': record.diasTrabajados,
            'Días Libres': record.diasLibres,
            'Permisos Justif.': record.permisosJustificados,
            'Permisos Injustif.': record.permisosInjustificados,
            'Vacaciones': record.vacaciones,
            'Total Días Netos': record.totalDiasNetos,
            'Horas Laboradas': record.totalHoras,
            '% Asistencia': `${record.porcentajeAsistencia}%`,
        }));

        // Totals row
        const totalsRow = {
            '#': '',
            'Empleado': 'TOTALES',
            'Cargo': '',
            'Días Trabajados': totals?.diasTrabajados || 0,
            'Días Libres': totals?.diasLibres || 0,
            'Permisos Justif.': totals?.permisosJustificados || 0,
            'Permisos Injustif.': totals?.permisosInjustificados || 0,
            'Vacaciones': totals?.vacaciones || 0,
            'Total Días Netos': totals?.totalDiasNetos || 0,
            'Horas Laboradas': totals?.totalHoras || 0,
            '% Asistencia': `${totals?.promedioAsistencia || 0}%`,
        };
        reportData.push(totalsRow as any);

        const workbook = XLSX.utils.book_new();

        // Create summary + data
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.sheet_add_json(summarySheet, reportData, { origin: 'A6' });

        // Adjust column widths
        summarySheet['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 13 },
            { wch: 18 }, { wch: 18 }, { wch: 13 }, { wch: 18 }, { wch: 16 }, { wch: 14 }
        ];

        XLSX.utils.book_append_sheet(workbook, summarySheet, `Asistencia ${periodLabel}`);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        const dateStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        saveAs(data, `Reporte_Asistencia_${periodLabel}_${dateStr}.xlsx`);

        toast({
            title: 'Exportación Exitosa',
            description: `El reporte ${periodLabel} ha sido descargado.`,
        });
    };

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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-64" />
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold md:text-2xl">Reporte Consolidado de Asistencia</h1>
                        <p className="text-sm text-muted-foreground">
                            Control de días trabajados, permisos y ausencias por período.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                    <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exportar Excel</Button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground mr-1">Período:</span>
                    <Button
                        size="sm"
                        variant={periodType === 'semanal' ? 'default' : 'outline'}
                        onClick={() => applyPeriod('semanal')}
                    >
                        <CalendarDays className="mr-1 h-3.5 w-3.5" /> Semanal
                    </Button>
                    <Button
                        size="sm"
                        variant={periodType === 'quincenal' ? 'default' : 'outline'}
                        onClick={() => applyPeriod('quincenal')}
                    >
                        <CalendarRange className="mr-1 h-3.5 w-3.5" /> Quincenal
                    </Button>
                    <Button
                        size="sm"
                        variant={periodType === 'mensual' ? 'default' : 'outline'}
                        onClick={() => applyPeriod('mensual')}
                    >
                        <CalendarCheck className="mr-1 h-3.5 w-3.5" /> Mensual
                    </Button>
                    <Button
                        size="sm"
                        variant={periodType === 'custom' ? 'default' : 'outline'}
                        onClick={() => applyPeriod('custom')}
                    >
                        Personalizado
                    </Button>
                </div>
                <DateRangePicker date={dateRange} setDate={(d) => { setDateRange(d); setPeriodType('custom'); }} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.totalEmpleados ?? '—'}</div>
                        <p className="text-xs text-muted-foreground">en este período</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Días Trabajados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{kpis?.totalDiasTrabajados ?? '—'}</div>
                        <p className="text-xs text-muted-foreground">acumulado del equipo</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Permisos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{kpis?.totalPermisos ?? '—'}</div>
                        <p className="text-xs text-muted-foreground">justificados + injustificados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">% Asistencia Prom.</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{kpis?.promedioAsistencia ?? '—'}%</div>
                        <p className="text-xs text-muted-foreground">promedio del equipo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Report Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle por Trabajador — Período {getPeriodLabel(periodType)}</CardTitle>
                    <CardDescription>
                        {dateRange?.from && dateRange.to ?
                            `Desde ${format(dateRange.from, "dd 'de' MMMM yyyy", { locale: es })} hasta ${format(dateRange.to, "dd 'de' MMMM yyyy", { locale: es })}`
                            : 'Seleccione un rango de fechas.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Trabajador</TableHead>
                                        <TableHead>Cargo</TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span>Días</span>
                                                <span className="text-[10px] text-green-600 font-normal">Trabajados</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span>Días</span>
                                                <span className="text-[10px] text-slate-500 font-normal">Libres</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span>Permisos</span>
                                                <span className="text-[10px] text-blue-600 font-normal">Justificados</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span>Permisos</span>
                                                <span className="text-[10px] text-red-500 font-normal">Injustificados</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span>Vacac.</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <div className="flex flex-col items-center font-bold">
                                                <span>Total Días</span>
                                                <span className="text-[10px] text-primary font-normal">Netos Trabaj.</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">Horas</TableHead>
                                        <TableHead className="text-center">% Asist.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consolidatedData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
                                                No hay datos de asistencia para el período seleccionado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {consolidatedData.map((record, index) => (
                                        <TableRow key={record.userId} className={index % 2 === 0 ? '' : 'bg-muted/30'}>
                                            <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{record.userName}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{record.cargo}</TableCell>
                                            <TableCell className="text-center font-semibold text-green-700">{record.diasTrabajados}</TableCell>
                                            <TableCell className="text-center text-slate-500">{record.diasLibres}</TableCell>
                                            <TableCell className="text-center text-blue-600">{record.permisosJustificados}</TableCell>
                                            <TableCell className="text-center font-semibold text-red-500">{record.permisosInjustificados}</TableCell>
                                            <TableCell className="text-center text-orange-500">{record.vacaciones}</TableCell>
                                            <TableCell className="text-center font-bold text-primary text-lg">{record.totalDiasNetos}</TableCell>
                                            <TableCell className="text-center font-mono text-sm">{record.totalHoras}h</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${record.porcentajeAsistencia >= 90 ? 'bg-green-100 text-green-700' :
                                                        record.porcentajeAsistencia >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {record.porcentajeAsistencia}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                {totals && consolidatedData.length > 0 && (
                                    <tfoot>
                                        <TableRow className="bg-muted font-bold border-t-2">
                                            <TableCell></TableCell>
                                            <TableCell>TOTALES</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-center text-green-700">{totals.diasTrabajados}</TableCell>
                                            <TableCell className="text-center">{totals.diasLibres}</TableCell>
                                            <TableCell className="text-center text-blue-600">{totals.permisosJustificados}</TableCell>
                                            <TableCell className="text-center text-red-500">{totals.permisosInjustificados}</TableCell>
                                            <TableCell className="text-center text-orange-500">{totals.vacaciones}</TableCell>
                                            <TableCell className="text-center text-primary text-lg">{totals.totalDiasNetos}</TableCell>
                                            <TableCell className="text-center font-mono">{totals.totalHoras}h</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${totals.promedioAsistencia >= 90 ? 'bg-green-100 text-green-700' :
                                                        totals.promedioAsistencia >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {totals.promedioAsistencia}% prom.
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Print View */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    main, main * { visibility: visible; }
                    main { position: absolute; left: 0; top: 0; width: 100%; }
                    button, .no-print { display: none !important; }
                    @page { size: landscape; margin: 1cm; }
                }
            `}</style>
        </main>
    );
}
