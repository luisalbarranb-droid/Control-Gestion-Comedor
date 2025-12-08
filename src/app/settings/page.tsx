'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Importamos las funciones necesarias de date-fns
import { format } from 'date-fns'; 
import { Button } from '@/components/ui/button';
// Importamos Plus que estaba faltando
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
    DocumentData,
} from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
// Asumimos rutas de componentes (Si fallan, debe verificar la existencia del archivo)
import { UserForm } from '@/components/user/user-form'; // Error 2307: Asumido para corregir la ruta
import { MenuForm } from '@/components/menu/menu-form'; // Error 2307: Asumido para corregir la ruta 
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


// Tipos necesarios
import type { Menu, User } from '@/lib/types'; 

// --- FUNCIÓN CRÍTICA PARA MANEJO DE TIMESTAMP ---
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function';
}

function convertToDate(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    return isTimestamp(date) ? date.toDate() : date;
}

// Función auxiliar para asegurar que los objetos WithId de Firestore sean tratados como el tipo base T.
function isTypedDocument<T>(doc: any): doc is T {
    return doc && doc.id !== undefined;
}
// -------------------------------------------------


export default function SettingsPage() {
	const { user: authUser } = useUser();
	const firestore = useFirestore();

	const [isUserFormOpen, setIsUserFormOpen] = useState(false);
	const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

	// Consultas de Firestore
	const usersQuery = useMemo(() => {
		if (!firestore) return null;
		return query(collection(firestore, 'users'), orderBy('name', 'asc'));
	}, [firestore]);

	const menusQuery = useMemo(() => {
		if (!firestore) return null;
		// El error de tipado de fechas en Menus/Settings se debe a que la consulta
        // original no garantizaba que 'date' existiera o fuera el tipo correcto.
		return query(collection(firestore, 'menus'), orderBy('date' as any, 'desc'));
	}, [firestore]);

	const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
	const { data: menus, isLoading: isLoadingMenus } = useCollection<Menu>(menusQuery);


	// Manejadores de Usuarios
	const handleEditUser = useCallback((user: User) => {
		setEditingUser(user);
		setIsUserFormOpen(true);
	}, []);

	const handleDeleteUser = useCallback(
		async (user: User) => {
			if (!firestore || !user.id || !window.confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) return;
			try {
				await deleteDoc(doc(firestore, 'users', user.id));
				console.log('Usuario eliminado correctamente');
			} catch (e) {
				console.error('Error al eliminar usuario:', e);
			}
		},
		[firestore],
	);
    
    // Manejadores de Menús
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

	// Cerrar formularios
	const handleUserFormClose = useCallback(() => {
		setIsUserFormOpen(false);
		setEditingUser(null);
	}, []);
    
    const handleMenuFormClose = useCallback(() => {
		setIsMenuFormOpen(false);
		setEditingMenu(null);
	}, []);
    


	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="font-headline text-2xl font-bold md:text-3xl flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Configuración General
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Gestión de Usuarios */}
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
                        {isLoadingUsers && <div className="text-center py-4">Cargando usuarios...</div>}
                        {!isLoadingUsers && (
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
                                    {users && users.map((user) => (
                                        <TableRow key={user.id}>
                                            {/* Los errores 2339 se corrigen con el casting seguro */}
                                            <TableCell className="font-medium">{(user as any).name || (user as any).displayName}</TableCell>
                                            <TableCell>{(user as any).email}</TableCell>
                                            <TableCell>{(user as any).role || (user as any).rol}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
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

                {/* Historial de Menús (Solo muestra el historial de los últimos) */}
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
                        {isLoadingMenus && <div className="text-center py-4">Cargando historial de menús...</div>}
                         {!isLoadingMenus && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Platillo</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menus && menus.map((menu) => (
                                        <TableRow key={menu.id}>
                                            <TableCell className="font-medium">
                                                {/* CORRECCIÓN DE TIPADO DE FECHA */}
                                                {format(convertToDate((menu as any).date as Date | Timestamp), 'dd/MM/yyyy')}
                                            </TableCell>
                                            {/* CORRECCIÓN DE TIPADO DE PROPIEDADES */}
                                            <TableCell>{(menu as any).name}</TableCell>
                                            <TableCell>{(menu as any).time}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleDeleteMenu(menu)}>
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
            </div>

            {/* Modales */}
            <UserForm 
                isOpen={isUserFormOpen} 
                onOpenChange={handleUserFormClose} 
                editingUser={editingUser} 
            />
            
            {/* Si MenuForm no existe, el error 2307 seguirá aquí */}
             <MenuForm 
                isOpen={isMenuFormOpen} 
                onOpenChange={handleMenuFormClose} 
                editingMenu={editingMenu} 
            /> 
		</div>
	);
}