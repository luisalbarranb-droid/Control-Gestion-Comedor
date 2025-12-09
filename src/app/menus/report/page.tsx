'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Menu } from '@/lib/types';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { MenusReport } from '@/components/menus/menus-report';

export default function MenuReportsPage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // CRITICAL FIX: Initialize date state in useEffect to prevent hydration mismatch.
  useEffect(() => {
    const today = new Date();
    setDateRange({
      from: startOfWeek(today, { weekStartsOn: 1 }),
      to: endOfWeek(today, { weekStartsOn: 1 }),
    });
  }, []);

  const menuQuery = useMemoFirebase(() => {
    if (!firestore || !dateRange?.from || !dateRange?.to) return null;
    return query(
      collection(firestore, 'menus'),
      where('date', '>=', Timestamp.fromDate(dateRange.from)),
      where('date', '<=', Timestamp.fromDate(dateRange.to)),
      orderBy('date', 'asc')
    );
  }, [firestore, dateRange]);

  const { data: menus, isLoading } = useCollection<Menu>(menuQuery);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Reporte Semanal de Menús
          </h1>
          <p className="text-muted-foreground">
            Analiza los requerimientos de ingredientes para el período
            seleccionado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[260px] justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y', { locale: es })} -{' '}
                      {format(dateRange.to, 'LLL dd, y', { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y', { locale: es })
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
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <MenusReport menus={menus || []} />

    </div>
  );
}
