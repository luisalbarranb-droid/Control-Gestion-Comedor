'use client';

import { useMemo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Menu } from '@/lib/types';
import { getWeeksForMonth, cn } from '@/lib/utils';
import { MenuSummaryCard } from './menu-summary-card';
import { DateRange } from 'react-day-picker';

interface WeeklyPlannerProps {
  menus: Menu[];
  range?: DateRange;
}

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function WeeklyPlanner({ menus, range }: WeeklyPlannerProps) {
  const currentMonth = range?.from || new Date();

  const weeks = useMemo(() => getWeeksForMonth(currentMonth, 1), [currentMonth]);

  const menusByDate = useMemo(() => {
    return menus.reduce((acc, menu) => {
      const dateKey = format(new Date(menu.date), 'yyyy-MM-dd');
      acc[dateKey] = menu;
      return acc;
    }, {} as Record<string, Menu>);
  }, [menus]);

  return (
    <div className="bg-background rounded-lg border">
      <header className="grid grid-cols-7">
        {WEEK_DAYS.map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground border-b border-r last:border-r-0">
            {day}
          </div>
        ))}
      </header>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const menu = menusByDate[dateKey];
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={dateKey}
              className={cn(
                'relative min-h-[140px] p-2 border-b border-r',
                (index + 1) % 7 === 0 && 'border-r-0',
                !isCurrentMonth && 'bg-muted/50'
              )}
            >
              <time
                dateTime={dateKey}
                className={cn(
                  'absolute top-2 right-2 text-xs font-semibold rounded-full size-6 flex items-center justify-center',
                  isToday(day) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </time>
              {menu && <MenuSummaryCard menu={menu} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
