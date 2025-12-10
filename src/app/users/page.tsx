'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmployeeList } from '@/components/attendance/employee-list';
import { EmployeeForm } from '@/components/attendance/employee-form';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';


export default function UsersManagementPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), orderBy('name', 'asc'));
    }, [firestore]);

    const { data: employees, isLoading } = useCollection<User>(usersQuery);

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

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                 <Users className="h-6 w-6" />
                <h1 className="text-xl font-semibold md:text-2xl">Gestión de Personal</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                 <Button onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar Empleado
                </Button>
            </div>
            
            <EmployeeList 
                employees={filteredEmployees}
                isLoading={isLoading}
                onEdit={handleEdit}
            />

            <EmployeeForm
                isOpen={isFormOpen}
                onOpenChange={handleCloseForm}
                employee={editingEmployee}
            />
        </main>
    );
}
