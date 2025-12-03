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
import { MoreHorizontal, SquareCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { areas } from '@/lib/placeholder-data';
import type { User, Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { UserForm } from '@/components/users/user-form';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const roleVariant: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  comun: 'bg-gray-100 text-gray-800',
};

const statusVariant: Record<boolean, string> = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-red-100 text-red-800',
};

export default function UsersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const getAreaName = (areaId: string) => areas.find((a) => a.id === areaId)?.nombre || 'N/A';
  const getUserInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('') : '';

  const handleSaveUser = (userData: Omit<User, 'userId'> | User) => {
    if (!firestore) return;

    const isEditing = 'userId' in userData;
    const userToSave = {
      ...userData,
      // In a real app, you'd get the current user's ID
      creadoPor: 'userId' in userData ? userData.creadoPor : 'user-superadmin-1', 
      ultimoAcceso: serverTimestamp(),
      avatarUrl: 'avatarUrl' in userData ? userData.avatarUrl : `https://i.pravatar.cc/150?u=${userData.email}`
    };

    const docRef = isEditing
      ? doc(firestore, 'users', (userData as User).userId)
      : doc(collection(firestore, 'users'));
    
    const finalData = { ...userToSave, userId: docRef.id };

    setDocumentNonBlocking(docRef, finalData, { merge: isEditing });

    toast({
      title: `Usuario ${isEditing ? 'actualizado' : 'creado'}`,
      description: `El usuario ${userData.nombre} ha sido guardado.`,
    });
  };

  const openForm = (user: User | null) => {
    setSelectedUser(user);
    setFormOpen(true);
  }

  if (isLoading) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <p>Cargando usuarios...</p>
        </div>
    )
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
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Gestión de Usuarios
            </h1>
            <Button onClick={() => openForm(null)}>
              Crear Usuario
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios del sistema, sus roles y permisos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="hidden sm:table-cell">Área</TableHead>
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                         <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                            <AvatarFallback>
                              {getUserInitials(user.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.nombre}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(roleVariant[user.rol], 'capitalize')}>
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getAreaName(user.area)}
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className={cn(statusVariant[user.activo], 'capitalize')}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild><Link href={`/users/${user.id}`}>Ver Perfil</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openForm(user)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Desactivar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
}
