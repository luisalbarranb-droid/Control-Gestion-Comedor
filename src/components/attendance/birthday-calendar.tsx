'use client';

import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, getWeeksForMonth } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface BirthdayCalendarProps {
  users: User[];
  isLoading: boolean;
}

const convertToDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (date instanceof Timestamp) return date.toDate();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

export function BirthdayCalendar({ users, isLoading }: BirthdayCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const birthdaysByDay = useMemo(() => {
    const map = new Map<number, User[]>();
    users.forEach(user => {
        const birthDate = convertToDate(user.fechaNacimiento);
        if (birthDate && birthDate.getMonth() === currentDate.getMonth()) {
            const day = birthDate.getDate();
            if (!map.has(day)) {
                map.set(day, []);
            }
            map.get(day)?.push(user);
        }
    });
    return map;
  }, [users, currentDate]);

  const weeks = getWeeksForMonth(currentDate.getMonth(), currentDate.getFullYear());
  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64 border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l">
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground border-b border-r bg-muted/50">
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.substring(0, 1)}</span>
          </div>
        ))}
        
        {weeks.flat().map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayNumber = day.getDate();
          const birthdayUsers = birthdaysByDay.get(dayNumber) || [];
          
          return (
            <div
              key={index}
              className={cn(
                'relative h-20 md:h-28 border-b border-r p-1.5 flex flex-col',
                isCurrentMonth ? 'bg-background' : 'bg-muted/30'
              )}
            >
              <span className={cn('text-xs font-semibold', !isCurrentMonth && 'text-muted-foreground/50')}>
                {dayNumber}
              </span>
               {isCurrentMonth && birthdayUsers.length > 0 && (
                 <TooltipProvider>
                    <div className="mt-1 flex-grow flex items-center justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-12 w-12 border-2 border-pink-400 cursor-pointer">
                                    <AvatarImage src={birthdayUsers[0].avatarUrl} />
                                    <AvatarFallback className="text-xs bg-pink-100 text-pink-700">{getUserInitials(birthdayUsers[0].name)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{birthdayUsers[0].name}</p>
                                <p className="text-sm text-muted-foreground">Cumple el {dayNumber} de {format(currentDate, 'MMMM', { locale: es })}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
