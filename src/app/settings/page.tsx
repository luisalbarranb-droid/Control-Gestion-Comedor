'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Settings, UserPlus, Trash, Edit, MoreVertical, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  collection,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { UserForm } from '@/components/user/user-form';
import { MenuForm } from '@/components/menu/menu-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Menu, User } from '@/lib/types';

function convertToDate(date: Date | Timestamp | undefined | string): Date | undefined {
  if (!date) return undefined;
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return undefined;
    return parsedDate;
  } catch (e) {
    return undefined;
  }
}

export default function SettingsPage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('name', 'asc'));
  }, [firestore]);

  const menusQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'menus'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: menus, isLoading: isLoadingMenus } = useCollection<Menu>(menusQuery);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    async (user: User) => {
      const userName = (user as any).name || (user as any).nombre || "este usuario";
      if (!firestore || !user.id || !window.confirm(`¿Estás seguro de eliminar a ${userName}?`)) return;
      try {
        await deleteDoc(doc(firestore, 'users', user.id));
        console.log('Usuario eliminado correctamente');
      } catch (e) {
        console.error('Error al eliminar usuario:', e);
      }
    },
    [firestore],
  );

  const handleEditMenu = useCallback((menu: Menu) => {
    setEditingMenu(menu);
    setIsMenuFormOpen(true);
  }, []);

  const handleDeleteMenu = useCallback(
    async (menu: Menu) => {
      if (!firestore || !menu.id || !window.confirm('¿Estás seguro de eliminar este menú?')) return;
      try {
        await deleteDoc(doc(firestore, 'menus', menu.id));
        console.log('Menú eliminado correctamente');
      } catch (e) {
        console.error('Error al eliminar menú:', e);
      }
    },
    [firestore],
  );

  const handleUserFormClose = useCallback(() => {
    setIsUserFormOpen(false);
    setEditingUser(null);
  }, []);

  const handleMenuFormClose = useCallback(() => {
    setIsMenuFormOpen(false);
    setEditingMenu(null);
  }, []);

  // Helper to safely get user properties
  const getUserName = (user: User) => (user as any).name || (user as any).nombre || 'Usuario sin nombre';
  const getUserEmail = (user: User) => (user as any).email || 'Sin email';
  const getUserRole = (user: User) => (user as any).role || 'Sin rol';

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="font-headline text-2xl font-bold md:text-3xl flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Configuración General
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Usuarios Registrados</CardTitle>
            <Button
              onClick={() => setIsUserFormOpen(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="text-center py-4">Cargando usuarios...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{getUserName(user)}</TableCell>
                      <TableCell>{getUserEmail(user)}</TableCell>
                      <TableCell className="capitalize">{getUserRole(user)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Historial de Menús</CardTitle>
            <Button
              onClick={() => setIsMenuFormOpen(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Menú
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingMenus ? (
              <div className="text-center py-4">Cargando historial de menús...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Platillo Principal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus?.slice(0, 5).map((menu) => {
                    const menuDate = convertToDate(menu.date);
                    const mainDish = menu.items?.find(item => item.category === 'proteico');
                    return (
                      <TableRow key={menu.id}>
                        <TableCell className="font-medium">
                          {menuDate ? format(menuDate, 'dd/MM/yyyy') : 'Fecha inválida'}
                        </TableCell>
                        <TableCell>{mainDish?.name || menu.items?.[0]?.name || 'Menú sin platos'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditMenu(menu)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteMenu(menu)} className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <UserForm
        isOpen={isUserFormOpen}
        onOpenChange={handleUserFormClose}
        editingUser={editingUser}
      />

      <MenuForm
        isOpen={isMenuFormOpen}
        onOpenChange={handleMenuFormClose}
        editingMenu={editingMenu}
      />
    </div>
  );
}
