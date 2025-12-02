'use client';

import { useState, useEffect } from 'react';
import { startOfWeek, addDays, format, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User, DayOff, DayOfWeek } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlanningTableProps {
  week: Date;
  users: User[];
  initialDaysOff: DayOff[];
  onSave: (daysOff: DayOff[]) => void;
}

export function PlanningTable({ week, users, initialDaysOff, onSave }: PlanningTableProps) {
  const { toast } = useToast();
  const [daysOffMap, setDaysOffMap] = useState<Record<string, DayOfWeek | undefined>>({});

  const weekStartDate = startOfWeek(week, { weekStartsOn: 1 });
  const weekStartDateString = format(weekStartDate, 'yyyy-MM-dd');

  useEffect(() => {
    const weeklyData = initialDaysOff.filter(d => d.weekStartDate === weekStartDateString);
    const initialMap = weeklyData.reduce((acc, curr) => {
      acc[curr.userId] = curr.dayOff;
      return acc;
    }, {} as Record<string, DayOfWeek | undefined>);
    setDaysOffMap(initialMap);
  }, [week, initialDaysOff, weekStartDateString]);

  const handleDayClick = (userId: string, dayIndex: DayOfWeek) => {
    // Sunday is day 0 from getDay, but we consider it day 6 for our 0-6 week starting Monday
    if (dayIndex === 0) return; // Cannot change Sunday

    const adjustedDayIndex = (dayIndex === 0 ? 6 : dayIndex - 1) as DayOfWeek;

    setDaysOffMap(prev => {
      const newMap = { ...prev };
      if (newMap[userId] === adjustedDayIndex) {
        // Deselect if clicking the same day
        delete newMap[userId];
      } else {
        // Select new day
        newMap[userId] = adjustedDayIndex;
      }
      return newMap;
    });
  };

  const handleSave = () => {
    const newDaysOff: DayOff[] = Object.entries(daysOffMap).map(([userId, dayOff]) => ({
      userId,
      weekStartDate: weekStartDateString,
      dayOff: dayOff as DayOfWeek,
    }));
    
    onSave(newDaysOff);
    toast({
        title: "Planificación Guardada",
        description: "Los días libres para la semana han sido actualizados."
    });
  };

  const weekdays = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStartDate, i);
    // getDay() returns 0 for Sunday, 1 for Monday... We want Sunday to be at the end.
    const dayIndex = getDay(day);
    return { 
        date: day, 
        name: format(day, 'eee', { locale: es }), 
        dayNumber: format(day, 'd'),
        isSunday: dayIndex === 0
    };
  });

  const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  return (
    <div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[250px]">Empleado</TableHead>
                    {weekdays.map(({ name, dayNumber, isSunday }) => (
                        <TableHead key={name} className={cn("text-center", isSunday && "bg-muted/50")}>
                            <div className="capitalize">{name}</div>
                            <div className="text-xs text-muted-foreground">{dayNumber}</div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => {
                    const userDayOffIndex = daysOffMap[user.userId];
                    return (
                        <TableRow key={user.userId}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                        <AvatarFallback>{getUserInitials(user.nombre)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{user.nombre}</div>
                                </div>
                            </TableCell>
                            {weekdays.map((day, index) => {
                                // `index` here is 0-6 from Monday to Sunday
                                const isSelected = userDayOffIndex === index;
                                return (
                                <TableCell 
                                    key={day.name} 
                                    className={cn(
                                        "text-center p-2", 
                                        day.isSunday ? 'bg-muted/50 font-bold text-primary cursor-not-allowed' : 'cursor-pointer hover:bg-accent',
                                        isSelected && 'bg-primary/20 border-2 border-primary'
                                    )}
                                    onClick={() => handleDayClick(user.userId, getDay(day.date) as DayOfWeek)}
                                >
                                    {day.isSunday && <span>L</span>}
                                    {isSelected && <span className="font-bold text-primary">L</span>}
                                </TableCell>
                            )})}
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
        <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Guardar Planificación</Button>
        </div>
    </div>
  );
}
