'use client';

import React, { useCallback, useMemo, useState } from 'react';
// Importamos format de date-fns
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
// Importamos todos los iconos necesarios, incluyendo Plus
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

// --- FUNCIONES AUXILIARES DE TIPADO ---
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function';
}

function convertToDate(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    return isTimestamp(date) ? date.toDate() : date;
}
// --------------------------------------

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
		return query(collection(firestore, 'menus'), orderBy('date' as any, 'desc'));
	}, [firestore]);

	const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
	const { data: menus, isLoading: isLoadingMenus } = useCollection<Menu>(menusQuery);

	const handleEditUser = useCallback((user: User) => {
		setEditingUser(user);
		setIsUserFormOpen(true);
	}, []);

	const handleDeleteUser = useCallback(async (user: User) => {
        if (!firestore || !user.id || !window.confirm(`¿Eliminar a ${user.name}?`)) return;
        try {
            await deleteDoc(doc(firestore, 'users', user.id));
        } catch (e) { console.error(e); }
    }, [firestore]);
    
    const handleEditMenu = useCallback((menu: Menu) => {
        setEditingMenu(menu);
        setIsMenuFormOpen(true);
    }, []);

    const handleDeleteMenu = useCallback(async (menu: Menu) => {
        if (!firestore || !menu.id || !window.confirm('¿Eliminar menú?')) return;
        try {
            await deleteDoc(doc(firestore, 'menus', menu.id));
        } catch (e) { console.error(e); }
    }, [firestore]);

	const handleUserFormClose = () => { setIsUserFormOpen(false); setEditingUser(null); };
    const handleMenuFormClose = () => { setIsMenuFormOpen(false); setEditingMenu(null); };

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="font-headline text-2xl font-bold md:text-3xl flex items-center gap-2">
                <Settings className="h-6 w-6" /> Configuración General
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold">Usuarios</CardTitle>
                        <Button onClick={() => setIsUserFormOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                            <UserPlus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingUsers ? <div>Cargando...</div> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Rol</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {users && users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{(user as any).name || (user as any).displayName}</TableCell>
                                            <TableCell>{(user as any).role || (user as any).rol}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditUser(user)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteUser(user)}><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
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
                        <CardTitle className="text-lg font-semibold">Historial Menús</CardTitle>
                        <Button onClick={() => setIsMenuFormOpen(true)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMenus ? <div>Cargando...</div> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Platillo</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {menus && menus.map((menu) => (
                                        <TableRow key={menu.id}>
                                            <TableCell>
                                                {format(convertToDate((menu as any).date as Date | Timestamp)!, 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>{(menu as any).name}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditMenu(menu)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteMenu(menu)}><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
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
            </div>

            <UserForm isOpen={isUserFormOpen} onOpenChange={handleUserFormClose} editingUser={editingUser} />
            <MenuForm isOpen={isMenuFormOpen} onOpenChange={handleMenuFormClose} editingMenu={editingMenu} />
		</div>
	);
}
    
    
