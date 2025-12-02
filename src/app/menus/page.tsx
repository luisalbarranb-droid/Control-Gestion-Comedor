'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, Calendar as CalendarIcon } from 'lucide-react';
import { CreateMenuForm } from '@/components/menus/create-menu-form';
import { weeklyMenus } from '@/lib/placeholder-data';
import type { Menu } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { WeeklyPlanner } from '@/components/menus/weekly-planner';

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>(weeklyMenus);
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
              Planificación Semanal de Menús
            </h1>
            <div className="flex items-center gap-2">
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
                 <Button asChild variant="outline">
                    <Link href="/">Volver</Link>
                </Button>
            </div>
          </div>
          <WeeklyPlanner menus={filteredMenus} range={date} />
        </main>
      </SidebarInset>
    </div>
  );
}
