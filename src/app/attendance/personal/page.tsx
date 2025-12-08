'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, CalendarDays, PlusCircle, Search } from 'lucide-react';
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
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { EmployeeForm } from '@/components/attendance/employee-form';
import { useToast } from '@/hooks/use-toast';

// Helper to get a safe name from the user object
const getUserName = (user: User): string => {
  return (user as any).name || (user as any).nombres || 'Usuario sin nombre';
};

// Helper to get initials from a name string
const getUserInitials = (name: string): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};


export default function EmployeeListPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, profile: currentUser, isUserLoading } = useUser();
  
  const [isFormOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const role = currentUser?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), orderBy('name', 'asc')) : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const handleSaveEmployee = async (employeeData: Omit<User, 'id'>) => {
    if (!firestore || !authUser) return;

    const finalData = {
      ...employeeData,
      name: `${employeeData.nombres} ${employeeData.apellidos}`,
      email: `${employeeData.nombres?.split(' ')[0].toLowerCase()}.${employeeData.apellidos?.split(' ')[0].toLowerCase()}@example.com`,
      role: 'comun',
      isActive: true,
      createdBy: authUser.uid,
      creationDate: serverTimestamp(),
      lastAccess: serverTimestamp(),
    };
    
    addDocumentNonBlocking(collection(firestore, 'users'), finalData);

    toast({
      title: 'Expediente Guardado',
      description: `Los datos para ${finalData.name} han sido guardados.`,
    });
    setFormOpen(false);
  };
  
  const filteredUsers = users?.filter(user => 
    getUserName(user).toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const isLoading = isUserLoading || isLoadingUsers;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Gestión de Personal y Asistencia
                </h1>
                <p className="text-muted-foreground">Administra expedientes, planifica días libres y consulta reportes.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Expediente
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/attendance/planning">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Planificar Libres
                    </Link>
                </Button>
                <Button variant="secondary" asChild>
                    <Link href="/attendance/reports">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Reportes de Asistencia
                    </Link>
                </Button>
            </div>
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
                  <TableCell colSpan={4} className="text-center h-24">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUsers && filteredUsers.map((user) => {
                const userName = getUserName(user);
                const userInitials = getUserInitials(userName);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl} alt={userName} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{userName}</div>
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
                )
              })}
               {!isLoading && (!filteredUsers || filteredUsers.length === 0) && (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <EmployeeForm isOpen={isFormOpen} onOpenChange={setFormOpen} onSave={handleSaveEmployee} />
    </div>
  );
}
