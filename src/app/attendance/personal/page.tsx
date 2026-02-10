
'use client';

import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Search, Upload, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { EmployeeList } from '@/components/attendance/employee-list';
import { EmployeeForm } from '@/components/attendance/employee-form';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where, writeBatch, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { EmployeeImportDialog } from '@/components/attendance/employee-import-dialog';
import { useToast } from '@/components/ui/toast';
import { BirthdayCalendar } from '@/components/attendance/birthday-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMultiTenant } from '@/providers/multi-tenant-provider';

export default function PersonalManagementPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const firestore = useFirestore();
    const { activeComedorId, isSuperAdmin } = useMultiTenant();
    const { toast } = useToast();
    const { isUserLoading, profile } = useUser();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const usersRef = collection(firestore, 'users');

        if (activeComedorId) {
            return query(usersRef, where('comedorId', '==', activeComedorId), orderBy('name', 'asc'));
        } else if (isSuperAdmin) {
            return query(usersRef, orderBy('name', 'asc'));
        }

        return null;
    }, [firestore, activeComedorId, isSuperAdmin]);

    const { data: employees, isLoading } = useCollection<User>(usersQuery, { disabled: isUserLoading });

    const filteredEmployees = React.useMemo(() => {
        if (!employees) return [];
        return employees.filter(emp =>
            (emp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (emp.cedula?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);


    const handleEdit = (employee: User) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingEmployee(null);
    }

    const handleImport = async (importedData: any[]) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo conectar a la base de datos.' });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            let importedCount = 0;
            const targetComedorId = activeComedorId || profile?.comedorId;

            if (!targetComedorId) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se ha seleccionado un comedor de destino.' });
                return;
            }

            importedData.forEach((row: any) => {
                if (row.name && row.cedula && row.email && row.role) {
                    const newEmployeeRef = doc(collection(firestore, 'users'));
                    const newEmployee: Partial<User> = {
                        id: newEmployeeRef.id,
                        userId: newEmployeeRef.id,
                        name: String(row.name),
                        cedula: String(row.cedula),
                        rif: row.rif ? String(row.rif) : undefined,
                        email: String(row.email),
                        phone: String(row.phone || ''),
                        address: String(row.address || ''),
                        role: row.role as User['role'],
                        area: row.area as User['area'],
                        comedorId: targetComedorId,
                        workerType: row.workerType as User['workerType'],
                        contractType: row.contractType as User['contractType'],
                        position: row.position ? String(row.position) : undefined,
                        isActive: true,
                        creationDate: serverTimestamp(),
                        fechaIngreso: row.fechaIngreso ? Timestamp.fromDate(new Date(row.fechaIngreso)) : undefined,
                        diasContrato: row.diasContrato ? Number(row.diasContrato) : 0,
                        fechaNacimiento: row.fechaNacimiento ? Timestamp.fromDate(new Date(row.fechaNacimiento)) : undefined,

                        // Personal
                        gender: row.gender,
                        civilStatus: row.civilStatus,
                        nationality: row.nationality,

                        // Dotación
                        shirtSize: row.shirtSize ? String(row.shirtSize) : undefined,
                        pantsSize: row.pantsSize ? String(row.pantsSize) : undefined,
                        shoeSize: row.shoeSize ? String(row.shoeSize) : undefined,

                        // Medical
                        bloodType: row.bloodType,
                        allergies: row.allergies,
                        diseases: row.diseases,

                        // Emergency
                        emergencyContactName: row.emergencyContactName,
                        emergencyContactPhone: row.emergencyContactPhone ? String(row.emergencyContactPhone) : undefined,
                        emergencyContactRelation: row.emergencyContactRelation,

                        // Financial
                        bankName: row.bankName,
                        bankAccountNumber: row.bankAccountNumber ? String(row.bankAccountNumber) : undefined,
                        bankAccountType: row.bankAccountType,
                    };
                    batch.set(newEmployeeRef, newEmployee);
                    importedCount++;
                }
            });

            if (importedCount > 0) {
                await batch.commit();
                toast({
                    title: "Importación Exitosa",
                    description: `${importedCount} empleados han sido añadidos al sistema.`
                });
            } else {
                toast({ variant: 'destructive', title: 'Sin Datos Válidos', description: 'No se encontraron filas con datos válidos para importar.' });
            }

        } catch (e) {
            console.error("Error al importar empleados:", e);
            toast({ variant: 'destructive', title: 'Error de Importación', description: 'Ocurrió un error al guardar los datos. Revisa el formato de las fechas.' });
        } finally {
            setIsImportOpen(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/attendance">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold md:text-2xl">Gestión de Personal</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Cumpleaños del Mes
                    </CardTitle>
                    <CardDescription>Un vistazo a los próximos cumpleaños del equipo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BirthdayCalendar users={employees || []} isLoading={isLoading || isUserLoading} />
                </CardContent>
            </Card>


            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <div className="relative w-full md:w-auto md:flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre, cédula o email..."
                        className="pl-8 w-full md:w-[300px] lg:w-[400px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)} className="flex-1 md:flex-none">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Empleados
                    </Button>
                    <Button onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }} className="flex-1 md:flex-none">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Agregar Empleado
                    </Button>
                </div>
            </div>

            <EmployeeList
                employees={filteredEmployees}
                isLoading={isLoading || isUserLoading}
                onEdit={handleEdit}
            />

            <EmployeeForm
                isOpen={isFormOpen}
                onOpenChange={handleCloseForm}
                employee={editingEmployee}
            />

            <EmployeeImportDialog
                isOpen={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={handleImport}
            />
        </main>
    );
}
