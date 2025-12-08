'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
// IMPORTANTE: Hemos quitado los imports de Sidebar y Header para evitar duplicados
import { Calendar as CalendarIcon, FileSpreadsheet, View, Upload } from 'lucide-react';
import { CreateMenuForm } from '@/components/menus/create-menu-form';
import type { Menu, MenuItem, MenuImportRow, MenuItemCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MenuCard } from '@/components/menus/menu-card';
import { MenuImportDialog } from '@/components/menus/menu-import-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { inventoryItems } from '@/lib/placeholder-data';

export default function MenusPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const menusCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'menus') : null),
    [firestore, authUser]
  );
  const { data: menus, isLoading } = useCollection<Menu>(menusCollectionRef);

  const [isImportOpen, setImportOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handleCreateMenu = (newMenuData: Omit<Menu, 'id' | 'items'>) => {
     if (!firestore) return;
     const docRef = doc(collection(firestore, 'menus'));
     const newMenu = {
        ...newMenuData,
        id: docRef.id,
        items: [],
     }
     addDocumentNonBlocking(collection(firestore, 'menus'), newMenu);
  };
  
  const handleImportMenus = (data: MenuImportRow[]) => {
    // Lógica de importación conservada...
    const menusByDate: Record<string, Menu> = {};
    data.forEach(row => {
        const dateKey = format(new Date(row.date), 'yyyy-MM-dd');
        const inventoryItem = inventoryItems.find(i => i.nombre.toLowerCase() === row.ingredientName.toLowerCase());
        
        if (!menusByDate[dateKey]) {
            menusByDate[dateKey] = {
                id: `menu-${dateKey}-${Math.random()}`,
                date: new Date(row.date),
                pax: row.pax,
                items: [],
            };
        }
        let menuItem = menusByDate[dateKey].items.find(item => item.name === row.itemName);
        if (!menuItem) {
            menuItem = {
                id: `item-${dateKey}-${row.itemName}-${Math.random()}`,
                name: row.itemName,
                category: row.itemCategory as MenuItemCategory,
                ingredients: [],
            };
            menusByDate[dateKey].items.push(menuItem);
        }
        if (inventoryItem && row.ingredientName) {
            menuItem.ingredients.push({
                inventoryItemId: inventoryItem.id,
                quantity: row.ingredientQuantity,
                wasteFactor: row.ingredientWasteFactor || 0,
            });
        }
    });
    const newMenus = Object.values(menusByDate);
    console.log("Importing menus:", newMenus);
    newMenus.forEach(menu => {
      addDocumentNonBlocking(collection(firestore, 'menus'), menu);
    });
    toast({
      title: 'Importación Exitosa',
      description: `${newMenus.length} días de menús han sido importados.`,
    });
    setImportOpen(false);
  };

  const filteredMenus = menus?.filter(menu => {
    if (!date?.from) return true;
    const menuDate = menu.date.toDate ? menu.date.toDate() : new Date(menu.date);
    const from = new Date(date.from);
    from.setHours(0,0,0,0);
    
    if (!date.to) {
        const singleDay = new Date(date.from);
        return menuDate.getFullYear() === singleDay.getFullYear() &&
               menuDate.getMonth() === singleDay.getMonth() &&
               menuDate.getDate() === singleDay.getDate();
    }
    const to = new Date(date.to);
    to.setHours(23,59,59,999);
    return menuDate >= from && menuDate <= to;
  }).sort((a,b) => (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) - (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime())) || [];

  if (isLoading) {
    return (
        <div className="flex flex-1 items-center justify-center h-full p-8">
            <p>Cargando menús...</p>
        </div>
    )
  }

  // --- SOLUCIÓN: Quitamos <Sidebar> y <Header> ---
  // Ahora la página se renderizará dentro del Layout principal sin duplicar nada.
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Planificación de Menús
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={"outline"}
                className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? (
                    <>
                        {format(date.from, "LLLL yyyy", { locale: es })}
                    </>
                    ) : (
                    format(date.from, "LLL dd, y", { locale: es })
                    )
                ) : (
                    <span>Selecciona un rango</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                locale={es}
                />
            </PopoverContent>
            </Popover>
                <CreateMenuForm onMenuCreate={handleCreateMenu}/>
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importar Menús
            </Button>
                <Button asChild variant="secondary">
                <Link href="/menus/report">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Reporte Consolidado
                </Link>
            </Button>
                <Button asChild variant="secondary">
                <Link href="/menus/calendar">
                    <View className="mr-2 h-4 w-4" />
                    Calendario Mensual
                </Link>
            </Button>
        </div>
        </div>
        <div className="space-y-8">
        {filteredMenus.length > 0 ? (
            filteredMenus.map(menu => <MenuCard key={menu.id} menu={menu} />)
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-lg font-semibold text-muted-foreground">No hay menús para el período seleccionado.</p>
                <p className="text-sm text-muted-foreground mt-2">Intenta ajustar el rango de fechas o crea un nuevo menú.</p>
            </div>
        )}
        </div>
        <MenuImportDialog
        isOpen={isImportOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportMenus}
        />
    </div>
  );
}