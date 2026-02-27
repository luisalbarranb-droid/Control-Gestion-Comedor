"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CalendarIcon, CheckCircle2, XCircle, Clock, Plane } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, Timestamp, addDoc, getDocs, writeBatch, doc } from "firebase/firestore";
import type { User, AttendanceRecord, DayOff } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
    { value: "presente", label: "Presente", icon: CheckCircle2, className: "text-green-600 bg-green-50" },
    { value: "ausente", label: "Ausente", icon: XCircle, className: "text-red-600 bg-red-50" },
    { value: "justificado", label: "Permiso Justificado", icon: Clock, className: "text-blue-600 bg-blue-50" },
    { value: "no-justificado", label: "Permiso Injustific.", icon: XCircle, className: "text-orange-600 bg-orange-50" },
    { value: "vacaciones", label: "Vacaciones", icon: Plane, className: "text-purple-600 bg-purple-50" },
    { value: "libre", label: "Día Libre", icon: CalendarIcon, className: "text-slate-600 bg-slate-100" },
] as const;

export default function ManualAttendancePage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { isUserLoading } = useUser();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isClient, setIsClient] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estado local para los registros que se están editando
    // Record<userId, status>
    const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
    const [existingRecords, setExistingRecords] = useState<Record<string, AttendanceRecord>>({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Traer todos los usuarios activos
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery, { disabled: isUserLoading });

    // Cargar la asistencia existente para la fecha seleccionada
    useEffect(() => {
        async function fetchExistingAttendance() {
            if (!firestore || !users || users.length === 0) return;

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            try {
                const q = query(
                    collection(firestore, "attendance"),
                    where("checkIn", ">=", Timestamp.fromDate(startOfDay)),
                    where("checkIn", "<=", Timestamp.fromDate(endOfDay))
                );

                const snapshot = await getDocs(q);
                const recordsMap: Record<string, AttendanceRecord> = {};
                const stateMap: Record<string, string> = {};

                snapshot.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() } as AttendanceRecord;
                    recordsMap[data.userId] = data;
                    stateMap[data.userId] = data.status || "presente";
                });

                setExistingRecords(recordsMap);
                setAttendanceState(prev => ({ ...prev, ...stateMap }));

            } catch (error) {
                console.error("Error fetching attendance:", error);
                toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la asistencia existente." });
            }
        }

        if (isClient) {
            fetchExistingAttendance();
        }
    }, [firestore, selectedDate, users, isClient, toast]);

    const handleStatusChange = (userId: string, status: string) => {
        setAttendanceState(prev => ({
            ...prev,
            [userId]: status
        }));
    };

    const handleSaveAll = async () => {
        if (!firestore || !users) return;
        setSaving(true);

        try {
            const batch = writeBatch(firestore);
            let changesCount = 0;

            const dateToSave = new Date(selectedDate);
            // Fijar la hora a algo estandar si no hay checkin previo. Ej: 8:00 AM para presente.
            dateToSave.setHours(8, 0, 0, 0);

            for (const user of users) {
                const status = attendanceState[user.id];
                const existingRecord = existingRecords[user.id];

                // Si no hay status seleccionado, lo ignoramos si tampoco existia.
                if (!status && !existingRecord) continue;

                // Si el status no cambió, no actualizamos
                if (existingRecord && existingRecord.status === status) continue;

                if (existingRecord) {
                    // Actualizar registro existente
                    const docRef = doc(firestore, "attendance", existingRecord.id);
                    batch.update(docRef, { status });
                    changesCount++;
                } else if (status) {
                    // Crear nuevo registro
                    const newDocRef = doc(collection(firestore, "attendance"));
                    batch.set(newDocRef, {
                        userId: user.id,
                        checkIn: Timestamp.fromDate(dateToSave),
                        status: status,
                        type: "manual",
                        createdAt: Timestamp.now()
                    });
                    changesCount++;
                }
            }

            if (changesCount > 0) {
                await batch.commit();
                toast({ title: "Asistencia guardada", description: `Se actualizaron ${changesCount} registros.` });

                // Recargar el estado para sincronizar `existingRecords`
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);
                const q = query(
                    collection(firestore, "attendance"),
                    where("checkIn", ">=", Timestamp.fromDate(startOfDay)),
                    where("checkIn", "<=", Timestamp.fromDate(endOfDay))
                );
                const snapshot = await getDocs(q);
                const recordsMap: Record<string, AttendanceRecord> = {};
                snapshot.forEach(d => {
                    const data = { id: d.id, ...d.data() } as AttendanceRecord;
                    recordsMap[data.userId] = data;
                });
                setExistingRecords(recordsMap);

            } else {
                toast({ description: "No hubo cambios para guardar." });
            }

        } catch (error) {
            console.error("Error saving attendance:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los cambios." });
        } finally {
            setSaving(false);
        }
    };

    // Marcar a todos los que no tienen valor seleccionado como la opcion indicada
    const handleSetAllMisingAs = (status: string) => {
        if (!users) return;
        const newState = { ...attendanceState };
        users.forEach(u => {
            if (!newState[u.id]) {
                newState[u.id] = status;
            }
        });
        setAttendanceState(newState);
    };

    if (!isClient || isLoadingUsers) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[400px] w-full mt-4" />
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Toma de Asistencia Manual</h1>
                        <p className="text-sm text-muted-foreground">
                            Registra rápidamente la asistencia de todo el personal por día.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elegir un día</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSaveAll} disabled={saving} className="min-w-[120px]">
                        {saving ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar Todos</>}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lista de Personal</CardTitle>
                            <CardDescription>
                                {isToday(selectedDate) ? "Hoy, " : ""}
                                {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2">Acciones rápidas:</span>
                            <Button variant="outline" size="sm" onClick={() => handleSetAllMisingAs("presente")}>
                                Marcar vacíos como Presente
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSetAllMisingAs("ausente")}>
                                Marcar vacíos como Ausente
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Empleado</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Estado Prev.</TableHead>
                                <TableHead className="w-[280px]">Estado Seleccionado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map(user => {
                                const currentState = attendanceState[user.id];
                                const currentOpt = STATUS_OPTIONS.find(o => o.value === currentState);
                                const existingRec = existingRecords[user.id];

                                return (
                                    <TableRow key={user.id} className={existingRec && currentState !== existingRec.status ? "bg-amber-50/50" : ""}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{(user as any).cargo || "Trabajador"}</TableCell>
                                        <TableCell>
                                            {existingRec ? (
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {existingRec.status}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">- Sin registro -</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={currentState || ""}
                                                onValueChange={(val) => handleStatusChange(user.id, val)}
                                            >
                                                <SelectTrigger className={cn("h-9 border-dashed w-[220px]", currentState && "border-solid font-medium", currentOpt?.className)}>
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <opt.icon className="h-4 w-4" />
                                                                <span>{opt.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
