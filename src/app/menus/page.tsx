'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Plus, Settings, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, isToday, differenceInDays, addDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import {
	collection,
	query,
	where,
	orderBy,
	deleteDoc,
	doc,
	writeBatch,
	Timestamp,
    getDocs,
    DocumentData,
} from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import MenuDialog from '@/components/menu/menu-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import type { Menu, User, MenuImportRow, InventoryItem, MenuItem as TMenuItem, Ingredient } from '@/lib/types';
import { MenuImportDialog } from '@/components/menus/menu-import-dialog';
import { useToast } from '@/components/ui/toast';


function convertToDate(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date && isValid(date)) return date;
    // Attempt to parse if it's a string or number, but only return if valid.
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? parsedDate : undefined;
}

export default function MenusPage() {
	const { user: authUser, profile: currentUser } = useUser();
	const firestore = useFirestore();
    const { toast } = useToast();

	const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

	// CRITICAL FIX: Initialize date state in useEffect to prevent hydration mismatch.
	useEffect(() => {
		setSelectedDate(new Date());
	}, []);

	const { start, end, startTime, endTime } = useMemo(() => {
		const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
		const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
		return { 
			start, 
			end,
			startTime: start.getTime(), // ✅ Timestamps numéricos estables
			endTime: end.getTime()
		};
	}, [currentWeek]);

	const menuQuery = useMemoFirebase(() => {
		if (!firestore) return null;
		return query(
			collection(firestore, 'menus'),
			where('date', '>=', start),
			where('date', '<=', end),
			orderBy('date', 'asc'),
		);
	}, [firestore, startTime, endTime]); // ✅ Usa timestamps en vez de objetos Date


	const { data: menus, isLoading } = useCollection<Menu>(menuQuery);

	const usersQuery = useMemoFirebase(() => {
		if (!firestore) return null;
		return collection(firestore, 'users'); // Simplificado
	}, [firestore]);
    
    const inventoryQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'inventory');
    }, [firestore]);


	const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
    const { data: inventoryItems, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryQuery);

	const handleNextWeek = useCallback(() => {
		setCurrentWeek(prev => addWeeks(prev, 1));
	}, []);

	const handlePrevWeek = useCallback(() => {
		setCurrentWeek(prev => subWeeks(prev, 1));
	}, []);

	const handleEdit = useCallback((menu: Menu) => {
		setEditingMenu(menu);
		setDialogOpen(true);
	}, []);

	const handleDelete = useCallback(
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

	const handleCopyWeek = useCallback(async () => {
		if (!firestore || !menus || menus.length === 0 || !window.confirm('¿Estás seguro de copiar los menús de esta semana a la siguiente?'))
			return;

		const batch = writeBatch(firestore);
		const nextWeekStart = addWeeks(start, 1);
		const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

		try {
			const nextWeekQuery = query(
				collection(firestore, 'menus'),
				where('date', '>=', nextWeekStart),
				where('date', '<=', nextWeekEnd),
			);
			
			const existingDocsSnapshot = await getDocs(nextWeekQuery);
			existingDocsSnapshot.forEach(doc => {
				batch.delete(doc.ref);
			});

			menus.forEach(menu => {
				const oldDate = convertToDate(menu.date);
				if (!oldDate) return;

				const daysDifference = differenceInDays(oldDate, start);
				const newDate = addDays(nextWeekStart, daysDifference);

				const newMenuRef = doc(collection(firestore, 'menus'));
				const { id, ...menuData } = menu; 
				batch.set(newMenuRef, {
					...menuData,
					date: Timestamp.fromDate(newDate),
					createdBy: authUser?.uid,
					createdAt: Timestamp.now(),
				});
			});

			await batch.commit();
			console.log('Menús copiados exitosamente a la próxima semana');
			setCurrentWeek(nextWeekStart);
		} catch (e) {
			console.error('Error al copiar menús:', e);
		}
	}, [firestore, menus, start, authUser?.uid]);


	const weekDays = useMemo(() => {
		const days = [];
		let currentDate = start;
		for (let i = 0; i < 7; i++) {
			days.push(currentDate);
			currentDate = addDays(currentDate, 1);
		}
		return days;
	}, [start]);

	const menusByDay = useMemo(() => {
        if (!menus) return [];

		return weekDays.map(day => {
			const dailyMenus = menus.filter(menu => {
				const menuDate = convertToDate(menu.date);
				return menuDate ? isSameDay(menuDate, day) : false;
			});

			return {
				date: day,
				menus: dailyMenus,
			};
		});
	}, [menus, weekDays]);

	const selectedDayData = useMemo(() => {
		if (!selectedDate) return null;
		return menusByDay.find(item => isSameDay(item.date, selectedDate));
	}, [menusByDay, selectedDate]);


	const formatTime = (time: string) => {
		if (!time || !time.includes(':')) return time;
		try {
			const [hour, minute] = time.split(':').map(Number);
			const date = new Date();
			date.setHours(hour);
			date.setMinutes(minute);
			return format(date, 'hh:mm a');
		} catch {
			return time;
		}
	};

	const getUserName = (uid?: string) => {
        if (!users || !uid) return 'Desconocido';
		const user = users.find(u => u.id === uid);
		return user ? (user.name || (user as any).nombres) : 'Desconocido';
	};
    
    const handleImport = async (data: MenuImportRow[]) => {
        if (!firestore || !inventoryItems) {
            toast({ variant: 'destructive', title: 'Error', description: 'La base de datos o el inventario no están listos.' });
            return;
        }

        const menusByDate = new Map<string, Partial<Menu>>();
        const inventoryNameMap = new Map(inventoryItems.map(item => [item.nombre.toLowerCase(), item.id]));

        for (const row of data) {
            const dateStr = format(new Date(row.date), 'yyyy-MM-dd');
            if (!menusByDate.has(dateStr)) {
                menusByDate.set(dateStr, {
                    date: Timestamp.fromDate(new Date(row.date)),
                    pax: row.pax,
                    items: [],
                    createdBy: authUser?.uid,
                    createdAt: Timestamp.now(),
                });
            }

            const menu = menusByDate.get(dateStr)!;
            let menuItem = menu.items?.find(item => item.name === row.itemName && item.category === row.itemCategory);
            
            if (!menuItem) {
                menuItem = {
                    id: `${row.itemCategory}-${Date.now()}`,
                    name: row.itemName,
                    category: row.itemCategory as any,
                    ingredients: [],
                };
                menu.items?.push(menuItem);
            }

            const inventoryItemId = inventoryNameMap.get(row.ingredientName.toLowerCase());
            if (inventoryItemId) {
                const ingredient: Ingredient = {
                    inventoryItemId,
                    quantity: row.ingredientQuantity,
                    wasteFactor: row.ingredientWasteFactor,
                };
                menuItem.ingredients.push(ingredient);
            } else {
                 toast({ variant: 'destructive', title: 'Ingrediente no encontrado', description: `El ingrediente "${row.ingredientName}" no se encontró en el inventario.` });
            }
        }

        try {
            const batch = writeBatch(firestore);
            for (const menuData of menusByDate.values()) {
                const newMenuRef = doc(collection(firestore, 'menus'));
                batch.set(newMenuRef, menuData);
            }
            await batch.commit();
            toast({ title: 'Importación Exitosa', description: `${menusByDate.size} menús han sido creados.` });
            setImportDialogOpen(false);
        } catch (error) {
            console.error('Error al importar menús:', error);
            toast({ variant: 'destructive', title: 'Error de Importación', description: 'No se pudieron guardar los menús.' });
        }
    };


	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div className="flex items-center justify-between">
				<h1 className="font-headline text-2xl font-bold md:text-3xl">Planificación de Menús</h1>
				<div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
						<Upload className="mr-2 h-4 w-4" /> Importar Menús
					</Button>
					<Button variant="outline" asChild>
						<Link href="/menus/calendar">
							<CalendarIcon className="mr-2 h-4 w-4" />
							Vista Mensual
						</Link>
					</Button>
					<Button variant="outline" onClick={handleCopyWeek} disabled={!menus || menus.length === 0}>
						Copiar Menús a Próxima Semana
					</Button>
					<Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
						<Plus className="mr-2 h-4 w-4" /> Nuevo Menú
					</Button>
				</div>
			</div>
			
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				<div className="lg:col-span-1 space-y-4">
					<div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border">
						<Button onClick={handlePrevWeek} variant="ghost" size="icon">
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<span className="font-semibold text-center">
							{format(start, 'dd MMM', { locale: es })} -{' '}
							{format(end, 'dd MMM yyyy', { locale: es })}
						</span>
						<Button onClick={handleNextWeek} variant="ghost" size="icon">
							<ArrowRight className="h-5 w-5" />
						</Button>
					</div>

					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={setSelectedDate}
						initialFocus
						locale={es}
						className="rounded-xl border shadow-lg bg-white"
						modifiers={{
							menu: menusByDay.filter(d => d.menus.length > 0).map(d => d.date),
						}}
						modifiersStyles={{
							menu: { fontWeight: 'bold', color: 'var(--color-primary)' },
							today: { border: '2px solid hsl(var(--primary))' },
						}}
					/>
				</div>

				<div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border">
					<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
						<span>
							Menús para el día:{' '}
							<span className="text-blue-600">
								{selectedDate ? format(selectedDate, 'EEEE, dd MMMM', { locale: es }) : 'Seleccione una fecha'}
							</span>
						</span>
						<Link href="/menus/report" passHref>
							<Button variant="secondary" size="sm">
								<FileSpreadsheet className="mr-2 h-4 w-4" /> Reporte Semanal
							</Button>
						</Link>
					</h2>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Hora</TableHead>
								<TableHead>Platillo</TableHead>
								<TableHead>Ingredientes Clave</TableHead>
								<TableHead>Preparado Por</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando menús...</TableCell></TableRow>}
							{!isLoading && selectedDayData?.menus.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8 text-gray-500">
										No hay menús programados para este día.
									</TableCell>
								</TableRow>
							)}
							{!isLoading && selectedDayData?.menus.map(menu => (
								<TableRow key={menu.id}>
									<TableCell className="font-semibold text-gray-800">
										{formatTime((menu as any).time)}
									</TableCell>
									<TableCell>{(menu as any).name || 'Menú sin nombre'}</TableCell>
									<TableCell className="text-sm text-gray-600">
										{(menu.items?.[0]?.ingredients?.map(i => i.inventoryItemId).join(', ')) || 'N/A'}
									</TableCell>
									<TableCell className="text-sm text-gray-500">
										{getUserName((menu as any).createdBy)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Acciones de Menú</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={() => handleEdit(menu)}>
													<Edit className="mr-2 h-4 w-4" /> Editar
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleDelete(menu)} className="text-destructive">
													<Trash className="mr-2 h-4 w-4" /> Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
			
			<MenuDialog 
				isOpen={dialogOpen} 
				onOpenChange={setDialogOpen} 
				menu={editingMenu} 
				setEditingMenu={setEditingMenu}
				currentWeekStart={start}
			/>

            <MenuImportDialog
                isOpen={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onImport={handleImport}
            />
		</div>
	);
}
    