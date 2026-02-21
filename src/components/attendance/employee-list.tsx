'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmployeeIdCardDialog } from './employee-id-card-dialog';
import { useState } from 'react';
import { CreditCard, Edit } from 'lucide-react';
import type { User } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';

interface EmployeeListProps {
    employees: User[];
    isLoading: boolean;
    onEdit: (employee: User) => void;
}

const roleDisplay: Record<string, string> = {
    comun: 'Común',
    admin: 'Admin',
    superadmin: 'Superadmin'
};

const contractDisplay: Record<string, string> = {
    indeterminado: 'Indeterminado',
    determinado: 'Determinado',
    prueba: 'Prueba'
};

export function EmployeeList({ employees, isLoading, onEdit }: EmployeeListProps) {
    const [idCardEmployee, setIdCardEmployee] = useState<User | null>(null);

    const getAreaName = (areaId?: string) => {
        if (!areaId) return 'N/A';
        return areas.find(a => a.id === areaId)?.nombre || areaId;
    }
    const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    if (isLoading) {
        return <p>Cargando empleados...</p>;
    }

    if (!employees || employees.length === 0) {
        return <p>No se encontraron empleados.</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {employees.map(employee => (
                    <Card key={employee.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={employee.avatarUrl} />
                                    <AvatarFallback className="text-lg">{getUserInitials(employee.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-base leading-tight">{employee.name}</h3>
                                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cédula:</span>
                                    <span>{employee.cedula || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Área:</span>
                                    <span>{getAreaName(employee.area)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Rol:</span>
                                    <Badge variant="outline">{roleDisplay[employee.role] || employee.role}</Badge>
                                </div>
                                {employee.position && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Cargo:</span>
                                        <span className="font-medium">{employee.position}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Contrato:</span>
                                    <Badge variant="secondary" className="capitalize">{contractDisplay[employee.contractType || ''] || employee.contractType}</Badge>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <Link href={`/attendance/personal/details?id=${employee.id}`}>Expediente</Link>
                                </Button>
                                <Button variant="secondary" size="icon" className="h-9 w-9" onClick={() => setIdCardEmployee(employee)} title="Ver Carnet">
                                    <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(employee)} title="Editar">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {idCardEmployee && (
                <EmployeeIdCardDialog
                    employee={idCardEmployee}
                    isOpen={!!idCardEmployee}
                    onOpenChange={(open) => !open && setIdCardEmployee(null)}
                />
            )}
        </>
    );
}
