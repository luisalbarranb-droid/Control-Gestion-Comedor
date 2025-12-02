'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, Calendar as CalendarIcon, FileSpreadsheet, View, Upload } from 'lucide-react';
import { CreateMenuForm } from '@/components/menus/create-menu-form';
import { weeklyMenus, inventoryItems } from '@/lib/placeholder-data';
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


export default function MenusPage() {
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>(weeklyMenus);
  const [isImportOpen, setImportOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handleCreateMenu = (newMenuData: Omit<Menu, 'menuId' | 'items'>) => {
     const newMenu: Menu = {
        ...newMenuData,
        menuId: `menu-${Date.now()}`,
        items: [], // Start with an empty menu, to be edited later
     }
     setMenus(prev => [...prev, newMenu]);
  };
  
  const handleImportMenus = (data: MenuImportRow[]) => {
    const menusByDate: Record<string, Menu> = {};

    data.forEach(row => {
        const dateKey = format(new Date(row.date), 'yyyy-MM-dd');
        
        // Find inventory item to get its ID and waste factor (if any)
        const inventoryItem = inventoryItems.find(i => i.nombre.toLowerCase() === row.ingredientName.toLowerCase());
        
        if (!menusByDate[dateKey]) {
            menusByDate[dateKey] = {
                menuId: `menu-${dateKey}-${Math.random()}`,
                date: new Date(row.date),
                pax: row.pax,
                items: [],
            };
        }

        let menuItem = menusByDate[dateKey].items.find(item => item.name === row.itemName);
        
        if (!menuItem) {
            menuItem = {
                menuItemId: `item-${dateKey}-${row.itemName}-${Math.random()}`,
                name: row.itemName,
                category: row.itemCategory as MenuItemCategory,
                ingredients: [],
            };
            menusByDate[dateKey].items.push(menuItem);
        }

        if (inventoryItem && row.ingredientName) {
            menuItem.ingredients.push({
                inventoryItemId: inventoryItem.itemId,
                quantity: row.ingredientQuantity,
                wasteFactor: row.ingredientWasteFactor || 0,
            });
        }
    });

    const newMenus = Object.values(menusByDate);
    
    setMenus(prev => {
        const existingMenuDates = new Set(prev.map(m => format(new Date(m.date), 'yyyy-MM-dd')));
        const incomingMenus = newMenus.filter(nm => !existingMenuDates.has(format(new Date(nm.date), 'yyyy-MM-dd')));
        return [...prev, ...incomingMenus];
    });

    toast({
      title: 'Importación Exitosa',
      description: `${newMenus.length} días de menús han sido importados.`,
    });
    setImportOpen(false);
};


  const filteredMenus = menus.filter(menu => {
    if (!date?.from) return true;
    const menuDate = new Date(menu.date);
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
  }).sort((a,b) => a.date.getTime() - b.date.getTime());

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Planificacion de Menus
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
                        Ver Reporte Consolidado
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/menus/calendar">
                        <View className="mr-2 h-4 w-4" />
                        Ver Calendario Mensual
                    </Link>
                </Button>
            </div>
          </div>
          <div className="space-y-8">
            {filteredMenus.length > 0 ? (
                filteredMenus.map(menu => <MenuCard key={menu.menuId} menu={menu} />)
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-lg font-semibold text-muted-foreground">No hay menus para el período seleccionado.</p>
                    <p className="text-sm text-muted-foreground mt-2">Intenta ajustar el rango de fechas o crea un nuevo menú.</p>
                </div>
            )}
          </div>
        </main>
      </SidebarInset>
       <MenuImportDialog
        isOpen={isImportOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportMenus}
      />
    </div>
  );
}
