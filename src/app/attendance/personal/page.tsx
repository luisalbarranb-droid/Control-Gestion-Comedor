'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { EmployeeForm } from '@/components/attendance/employee-form';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeListPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), orderBy('name', 'asc')) : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const handleSaveEmployee = (employeeData: any) => {
    console.log('Saving employee:', employeeData);
    // Aquí iría la lógica para guardar en Firestore
    toast({
      title: 'Expediente Guardado',
      description: `Los datos para ${employeeData.nombres} ${employeeData.apellidos} han sido guardados.`,
    });
    setFormOpen(false);
  };
  
  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserInitials = (name: string | undefined) => name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'U';

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Gestión de Expedientes
            </h1>
            <p className="text-muted-foreground">Administra la información de todo el personal.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Expediente
        </Button>
      </div>

       <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
            type="search"
            placeholder="Buscar por nombre o correo..."
            className="pl-8 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Personal</CardTitle>
          <CardDescription>
            Haz clic en un empleado para ver su expediente completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {filteredUsers && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.cedula || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/attendance/personal/${user.id}`}>Ver Expediente</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <EmployeeForm isOpen={isFormOpen} onOpenChange={setFormOpen} onSave={handleSaveEmployee} />
    </div>
  );
}
