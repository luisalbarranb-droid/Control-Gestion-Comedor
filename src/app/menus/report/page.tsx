'use client';

import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Menu } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MenusReport } from '@/components/menus/menus-report';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';


export default function MenuReportPage() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const menusCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'menus') : null),
    [firestore, authUser]
  );
  const { data: menus, isLoading } = useCollection<Menu>(menusCollectionRef);

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const filteredMenus = menus
    ?.filter((menu) => {
      if (!date?.from) return true;
      const menuDate = menu.date.toDate ? menu.date.toDate() : new Date(menu.date);
      menuDate.setMinutes(
        menuDate.getMinutes() + menuDate.getTimezoneOffset()
      );
      const from = new Date(date.from);
      from.setHours(0, 0, 0, 0);
      if (!date.to) {
        return (
          menuDate.getFullYear() === from.getFullYear() &&
          menuDate.getMonth() === from.getMonth() &&
          menuDate.getDate() === from.getDate()
        );
      }
      const to = new Date(date.to);
      to.setHours(23, 59, 59, 999);
      return menuDate >= from && menuDate <= to;
    })
    .sort((a, b) => (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) - (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime())) || [];

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
            <div>
              <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Reporte Consolidado de Menús
              </h1>
              <p className="text-muted-foreground">
                Análisis de menús y requerimiento de ingredientes por período.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-full md:w-[300px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y', { locale: es })} -{' '}
                          {format(date.to, 'LLL dd, y', { locale: es })}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y', { locale: es })
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
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <Button asChild variant="outline">
                <Link href="/menus">Volver a Planificación</Link>
              </Button>
            </div>
          </div>
          {isLoading ? <p>Cargando reporte...</p> : <MenusReport menus={filteredMenus} />}
        </main>
      </SidebarInset>
    </div>
  );
}
