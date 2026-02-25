
'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Plus, Settings, Calendar as CalendarIcon, Upload, Users, Utensils, LayoutGrid, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, isToday, differenceInDays, addDays, subDays, isValid } from 'date-fns';
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
import type { Menu, User, MenuImportRow, InventoryItem, MenuItem as TMenuItem, MealType, MenuItemCategory } from '@/lib/types';
import { MenuImportDialog } from '@/components/menus/menu-import-dialog';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MenuSummaryCard } from '@/components/menus/menu-summary-card';
import { MenuCard } from '@/components/menus/menu-card';
import { cn } from '@/lib/utils';


function convertToDate(date: Date | Timestamp | undefined): Date | undefined {
    if (!date) return undefined;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date && isValid(date)) return date;
    const parsedDate = new Date(date as any);
    return isValid(parsedDate) ? parsedDate : undefined;
}

export default function MenusPage() {
    const { user: authUser, profile: currentUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [viewMode, setViewMode] = useState<'week' | 'day'>('day');
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());

    const { start, end } = useMemo(() => {
        const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
        return {
            start,
            end,
        };
    }, [currentWeek]);

    const menuQuery = useMemoFirebase(() => {
        if (!firestore || isUserLoading) return null;
        return query(
            collection(firestore, 'menus'),
            where('date', '>=', start),
            where('date', '<=', end),
            orderBy('date', 'asc'),
        );
    }, [firestore, isUserLoading, start, end]);


    const { data: menus, isLoading: isLoadingMenus } = useCollection<Menu>(menuQuery);

    const inventoryQuery = useMemoFirebase(() => {
        if (!firestore || isUserLoading) return null;
        return collection(firestore, 'inventory');
    }, [firestore, isUserLoading]);

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
                toast({ title: 'Menú eliminado correctamente' });
            } catch (e) {
                console.error('Error al eliminar menú:', e);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el menú.' });
            }
        },
        [firestore, toast],
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
            toast({ title: 'Menús copiados exitosamente a la próxima semana' });
            setCurrentWeek(nextWeekStart);
        } catch (e) {
            console.error('Error al copiar menús:', e);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron copiar los menús.' });
        }
    }, [firestore, menus, start, authUser?.uid, toast]);

    const handleImport = useCallback(async (data: MenuImportRow[]) => {
        if (!firestore || !inventoryItems || inventoryItems.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'El inventario no está cargado. Intenta de nuevo.' });
            return;
        }

        const batch = writeBatch(firestore);

        // Normalize category helper
        const normalizeCategory = (cat: string): MenuItemCategory => {
            const normalized = cat.toLowerCase().trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/\s+/g, '');

            // Handle Spanish labels: "1er Acompañante" -> "1eracompanante", "2do Acompañante" -> "2doacompanante", etc.
            if (normalized.includes('1er') && normalized.includes('acomp')) return 'acompanante1';
            if (normalized.includes('2do') && normalized.includes('acomp')) return 'acompanante2';
            if (normalized.includes('2da') && normalized.includes('acomp')) return 'acompanante2';
            if (normalized.includes('3er') && normalized.includes('acomp')) return 'acompanante3';
            if (normalized.includes('3ra') && normalized.includes('acomp')) return 'acompanante3';
            // Handle "Acompañante 1", "Acompañante 2", "Acompañante 3"
            if (normalized.includes('acomp') && normalized.includes('1')) return 'acompanante1';
            if (normalized.includes('acomp') && normalized.includes('2')) return 'acompanante2';
            if (normalized.includes('acomp') && normalized.includes('3')) return 'acompanante3';
            // Handle plain "acompañante" (no number)
            if (normalized === 'acompanante' || normalized === 'acomp') return 'acompanante1';

            const validCategories: MenuItemCategory[] = ['entrada', 'proteico', 'acompanante1', 'acompanante2', 'acompanante3', 'bebida', 'postre'];
            return validCategories.includes(normalized as MenuItemCategory) ? (normalized as MenuItemCategory) : 'entrada';
        };

        // Group by date and time
        const menusByDayAndTime = data.reduce((acc, row) => {
            const dateStr = format(new Date(row.date), 'yyyy-MM-dd');
            const key = `${dateStr}_${row.time}`;
            if (!acc[key]) {
                acc[key] = {
                    date: new Date(row.date),
                    pax: row.pax,
                    time: row.time,
                    items: {} as Record<string, TMenuItem>
                };
            }

            const itemCategory = normalizeCategory(row.itemCategory);

            if (!acc[key].items[row.itemName]) {
                acc[key].items[row.itemName] = {
                    id: crypto.randomUUID(),
                    name: row.itemName,
                    category: itemCategory,
                    ingredients: []
                };
            }

            const inventoryItem = inventoryItems.find(i =>
                i.nombre.toLowerCase().trim() === row.ingredientName.toLowerCase().trim()
            );

            if (inventoryItem) {
                acc[key].items[row.itemName].ingredients.push({
                    inventoryItemId: inventoryItem.id,
                    quantity: row.ingredientQuantity,
                    wasteFactor: row.ingredientWasteFactor,
                });
            } else {
                console.warn(`Ingrediente no encontrado en el inventario: ${row.ingredientName}`);
            }

            return acc;
        }, {} as Record<string, { date: Date, pax: number, time: MealType, items: Record<string, TMenuItem> }>);

        try {
            const comedorId = currentUser?.comedorId || '';

            for (const key in menusByDayAndTime) {
                const menuData = menusByDayAndTime[key];
                const dateStr = format(menuData.date, 'yyyy-MM-dd');

                // Deterministic ID for deduplication: [comedorId]_[date]_[time]
                const deterministicId = `${comedorId}_${dateStr}_${menuData.time}`.replace(/\s+/g, '_');
                const menuRef = doc(firestore, 'menus', deterministicId);

                const finalMenu: Menu = {
                    id: deterministicId,
                    comedorId: comedorId,
                    name: menuData.time,
                    date: Timestamp.fromDate(menuData.date),
                    pax: menuData.pax,
                    time: menuData.time,
                    items: Object.values(menuData.items),
                };

                batch.set(menuRef, {
                    ...finalMenu,
                    createdBy: authUser?.uid,
                    updatedAt: Timestamp.now(), // Use updatedAt for existing ones
                    createdAt: Timestamp.now(), // This will be overwritten if it already exists, unless we check docs
                }, { merge: true });
            }

            await batch.commit();
            toast({ title: 'Importación Exitosa', description: `${Object.keys(menusByDayAndTime).length} menús han sido procesados.` });
            setImportDialogOpen(false);
        } catch (e) {
            console.error('Error al importar menús:', e);
            toast({ variant: 'destructive', title: 'Error de Importación', description: 'Ocurrió un error al guardar los menús.' });
        }
    }, [firestore, authUser, inventoryItems, toast]);

    const weekDays = useMemo(() => {
        const days = [];
        let currentDate = start;
        for (let i = 0; i < 7; i++) {
            days.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }
        return days;
    }, [start]);

    const { menusByDay, weekStats } = useMemo(() => {
        if (!menus) return { menusByDay: [], weekStats: { totalMenus: 0, totalPax: 0 } };

        const dailyData = weekDays.map(day => {
            const dailyMenus = menus.filter(menu => {
                const menuDate = convertToDate(menu.date);
                return menuDate ? isSameDay(menuDate, day) : false;
            });
            return {
                date: day,
                menus: dailyMenus,
            };
        });

        const totalMenus = menus.length;
        const totalPax = menus.reduce((acc, menu) => acc + menu.pax, 0);

        return { menusByDay: dailyData, weekStats: { totalMenus, totalPax } };
    }, [menus, weekDays]);

    const isLoading = isUserLoading || isLoadingMenus || isLoadingInventory;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Planificación de Menús</h1>
                    <p className="text-muted-foreground">Define los menús de cada día y gestiona los platillos e ingredientes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/menus/calendar">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Vista Mensual
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={handleCopyWeek} disabled={!menus || menus.length === 0}>
                        Copiar Semana
                    </Button>
                    <Button onClick={() => { setEditingMenu(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Menú
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menús en la Semana</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? '...' : weekStats.totalMenus}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comensales (PAX)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? '...' : weekStats.totalPax}</div></CardContent>
                </Card>
            </div>

            {/* Week Navigation + View Toggle */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border">
                    <Button onClick={handlePrevWeek} variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold text-center text-lg">
                        Semana del {format(start, 'dd MMM', { locale: es })} al {' '}
                        {format(end, 'dd MMM, yyyy', { locale: es })}
                    </span>
                    <Button onClick={handleNextWeek} variant="ghost" size="icon">
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border bg-card p-1 gap-1">
                        <Button
                            variant={viewMode === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('week')}
                            className="gap-1.5"
                        >
                            <LayoutGrid className="h-4 w-4" /> Semana
                        </Button>
                        <Button
                            variant={viewMode === 'day' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('day')}
                            className="gap-1.5"
                        >
                            <CalendarDays className="h-4 w-4" /> Día
                        </Button>
                    </div>
                </div>
            </div>

            {/* Day Selector (visible in day mode) */}
            {viewMode === 'day' && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setSelectedDay(prev => subDays(prev, 1))}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex gap-1.5 overflow-x-auto flex-1 pb-1">
                        {weekDays.map((day, index) => {
                            const isSelected = isSameDay(day, selectedDay);
                            const dayIsToday = isToday(day);
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        'flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[70px] transition-all border text-sm font-medium',
                                        isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                            : dayIsToday
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                                : 'bg-card border-border hover:bg-muted/50'
                                    )}
                                >
                                    <span className="text-[10px] uppercase tracking-wider opacity-80">
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                    <span className="text-lg font-bold">{format(day, 'dd')}</span>
                                    <span className="text-[10px] opacity-70">
                                        {format(day, 'MMM', { locale: es })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setSelectedDay(prev => addDays(prev, 1))}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* WEEKLY VIEW */}
            {viewMode === 'week' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {isLoading && Array.from({ length: 7 }).map((_, i) => (
                        <Card key={i} className="h-64 animate-pulse bg-muted/50"></Card>
                    ))}
                    {!isLoading && menusByDay.map(({ date, menus: dayMenus }, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle
                                    className="text-base capitalize cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => { setSelectedDay(date); setViewMode('day'); }}
                                >
                                    {format(date, 'EEEE dd', { locale: es })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                {dayMenus.length > 0 ? (
                                    dayMenus.map(menu => (
                                        <div key={menu.id}>
                                            <MenuSummaryCard menu={menu} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-full mt-2 text-xs">
                                                        Acciones <MoreVertical className="ml-auto h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(menu)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(menu)} className="text-destructive">Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <Button variant="secondary" size="sm" onClick={() => { setEditingMenu(null); setDialogOpen(true); }}>
                                            <Plus className="mr-2 h-4 w-4" /> Crear
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* DAILY VIEW */}
            {viewMode === 'day' && (() => {
                const selectedDayData = menusByDay.find(d => isSameDay(d.date, selectedDay));
                const dayMenus = selectedDayData?.menus || [];
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold capitalize">
                                {format(selectedDay, 'EEEE, dd MMMM yyyy', { locale: es })}
                            </h2>
                            {dayMenus.length === 0 && (
                                <Button onClick={() => { setEditingMenu(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" /> Crear Menú para este día
                                </Button>
                            )}
                        </div>
                        {isLoading && (
                            <Card className="h-64 animate-pulse bg-muted/50"></Card>
                        )}
                        {!isLoading && dayMenus.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                {dayMenus.map(menu => (
                                    <div key={menu.id}>
                                        <MenuCard menu={menu} inventoryItems={inventoryItems || []} />
                                        <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(menu)}>Editar</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(menu)} className="text-destructive border-destructive/50 hover:bg-destructive/10">Eliminar</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !isLoading ? (
                            <Card className="flex items-center justify-center h-48 border-2 border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <Utensils className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                    <p className="font-medium">No hay menú planificado para este día</p>
                                    <p className="text-sm">Haz clic en "Crear Menú" para empezar</p>
                                </div>
                            </Card>
                        ) : null}
                    </div>
                );
            })()}

            <MenuDialog
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
                menu={editingMenu}
                setEditingMenu={setEditingMenu}
                currentWeekStart={start}
                inventoryItems={inventoryItems || []}
                isLoadingInventory={isLoadingInventory}
            />

            <MenuImportDialog
                isOpen={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onImport={handleImport}
            />
        </div>
    );
}
