
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
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

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
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const role = currentUser?.rol;
  const isAdmin = role === 'admin' || role === 'superadmin';

  const usersCollectionRef = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'users') : null),
    [firestore, isAdmin]
  );
  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef, {
    disabled: !isAdmin,
  });

  const getAreaName = (areaId: string) => areas.find((a) => a.id === areaId)?.nombre || 'N/A';
  const getUserInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('') : '';

  const usersToDisplay = isAdmin ? allUsers : (currentUser ? [currentUser] : []);
  const isLoading = isAuthLoading || isProfileLoading || (isAdmin && isLoadingUsers);

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
                            {isAdmin && <DropdownMenuItem>Editar</DropdownMenuItem>}
                            {isAdmin && <DropdownMenuItem>Desactivar</DropdownMenuItem>}
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
    </div>
  );
}
