
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
import { MoreHorizontal, SquareCheck, PlusCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { UserForm } from '@/components/users/user-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const dynamic = 'force-dynamic';

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
  const { user: authUser, isUserLoading: isAuthLoading, auth } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const role = currentUser?.role;
  const isSuperAdmin = role === 'superadmin';
  const isAdminOrHigher = role === 'admin' || role === 'superadmin';

  const usersCollectionRef = useMemoFirebase(
    () => (firestore && isAdminOrHigher ? collection(firestore, 'users') : null),
    [firestore, isAdminOrHigher]
  );
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef, {
    disabled: !isAdminOrHigher,
  });
  
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setFormOpen(true);
  }

  const handleSaveUser = async (userData: Omit<User, 'id' | 'userId' | 'createdBy' | 'lastAccess' | 'creationDate'>, password?: string) => {
    if (!auth || !firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se ha podido autenticar la acción.' });
        return;
    }

    if (selectedUser) { // Editing existing user
        const userRef = doc(firestore, 'users', selectedUser.id);
        const dataToUpdate = { ...userData, lastAccess: serverTimestamp() };
        setDocumentNonBlocking(userRef, dataToUpdate, { merge: true });
        toast({ title: 'Usuario actualizado', description: `Los datos de ${userData.name} han sido guardados.` });
    } else { // Creating new user
        if (!password) {
            toast({ variant: 'destructive', title: 'Error', description: 'La contraseña es obligatoria para nuevos usuarios.' });
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const newAuthUser = userCredential.user;
            const newUserDocRef = doc(firestore, 'users', newAuthUser.uid);
            
            setDocumentNonBlocking(newUserDocRef, {
                ...userData,
                id: newAuthUser.uid,
                userId: newAuthUser.uid,
                createdBy: currentUser.id,
                creationDate: serverTimestamp(),
                lastAccess: serverTimestamp(),
            }, { merge: false });
            
            toast({ title: 'Usuario Creado', description: `${userData.name} ha sido añadido con éxito.` });
        } catch (error: any) {
             console.error("Error creating user:", error);
            let description = 'Ocurrió un error inesperado.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'Este correo electrónico ya está registrado.';
            } else if (error.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
            }
            toast({ variant: 'destructive', title: 'Error al crear usuario', description });
        }
    }
  };

  const getAreaName = (areaId: string) => areas.find((a) => a.id === areaId)?.nombre || 'N/A';
  const getUserInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('') : '';

  const usersToDisplay = isAdminOrHigher ? allUsers : (currentUser ? [currentUser] : []);
  const isLoading = isAuthLoading || isProfileLoading || (isAdminOrHigher && isLoadingUsers);

  if (isLoading) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Cargando usuarios...</p>
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
            {isSuperAdmin && (
              <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Usuario
              </Button>
            )}
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
                  {usersToDisplay && usersToDisplay.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                         <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.name}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(roleVariant[user.role], 'capitalize')}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getAreaName(user.area)}
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className={cn(statusVariant[user.isActive], 'capitalize')}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
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
                            {isSuperAdmin && <DropdownMenuItem onClick={() => handleOpenForm(user)}>Editar</DropdownMenuItem>}
                            {isSuperAdmin && <DropdownMenuItem>Desactivar</DropdownMenuItem>}
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
