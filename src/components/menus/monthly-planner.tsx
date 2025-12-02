'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getWeeksForMonth } from '@/lib/utils';
import type { Menu } from '@/lib/types';
import { MenuSummaryCard } from './menu-summary-card';

interface MonthlyPlannerProps {
  menus: Menu[];
}

export function MonthlyPlanner({ menus }: MonthlyPlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const menusByDate = menus.reduce((acc, menu) => {
    const dateKey = format(new Date(menu.date), 'yyyy-MM-dd');
    acc[dateKey] = menu;
    return acc;
  }, {} as Record<string, Menu>);

  const weeks = getWeeksForMonth(currentDate.getMonth(), currentDate.getFullYear());
  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl md:text-2xl font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-t border-l">
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center font-semibold border-b border-r bg-muted/50">
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.substring(0, 3)}</span>
          </div>
        ))}
        
        {weeks.flat().map(day => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dateKey = format(day, 'yyyy-MM-dd');
          const menu = menusByDate[dateKey];
          return (
            <div
              key={day.toString()}
              className={cn(
                'relative h-40 md:h-48 border-b border-r p-2 flex flex-col',
                isCurrentMonth ? 'bg-background' : 'bg-muted/30'
              )}
            >
              <span className={cn('font-semibold', !isCurrentMonth && 'text-muted-foreground/50')}>
                {format(day, 'd')}
              </span>
              {menu && (
                <div className="mt-1 flex-grow">
                    <MenuSummaryCard menu={menu} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
