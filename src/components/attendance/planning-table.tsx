'use client';

import { useState, useMemo } from 'react';
import { startOfWeek, addDays, format, getDay, isSunday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { User, DayOff } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlanningTableProps {
  week: Date;
  users: User[];
  daysOff: Omit<DayOff, 'id'>[]; // Accepts local state without ID
  onToggleDay: (userId: string, dateIso: string, currentStatus: boolean) => void;
}

export function PlanningTable({ week, users, daysOff, onToggleDay }: PlanningTableProps) {
  
  const weekStartDate = startOfWeek(week, { weekStartsOn: 1 });

  const weekdays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(weekStartDate, i);
      return { 
        date: day, 
        isoDate: format(day, 'yyyy-MM-dd'),
        name: format(day, 'EEEE', { locale: es }), 
        dayNumber: format(day, 'dd'),
        isSunday: isSunday(day)
      };
    });
  }, [weekStartDate]);

  const isDayChecked = (userId: string, dateIso: string) => {
      return daysOff.some(d => d.userId === userId && d.date === dateIso);
  };

  const getDaysOffCount = (userId: string) => {
      const manual = daysOff.filter(d => d.userId === userId).length;
      return manual + 1; // +1 for the fixed Sunday
  };

  const getUserInitials = (name: string | undefined) => name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const getUserName = (user: User) => (user as any).name || (user as any).nombre || 'Usuario sin nombre';
  const getUserRole = (user: User) => (user as any).role || 'comun';

  return (
    <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50">
                    <TableHead className="w-[250px] sticky left-0 bg-gray-50 z-10 shadow-sm">Empleado</TableHead>
                    {weekdays.map(({ name, dayNumber, isSunday }) => (
                        <TableHead key={name} className={cn("text-center border-l min-w-[100px]", isSunday && "bg-orange-50 text-orange-700")}>
                            <div className="capitalize font-bold">{name}</div>
                            <div className="text-xs font-normal opacity-70">{dayNumber}</div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => {
                    const count = getDaysOffCount(user.id);
                    const isComplete = count === 2;
                    const isOver = count > 2;

                    return (
                        <TableRow key={user.id} className="hover:bg-gray-50 group">
                            <TableCell className="sticky left-0 bg-white z-10 group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={(user as any).avatarUrl} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                                {getUserInitials(getUserName(user))}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-900">{getUserName(user)}</div>
                                            <div className="text-[10px] text-gray-500 capitalize">{getUserRole(user)}</div>
                                        </div>
                                    </div>
                                    
                                    <Badge variant="outline" className={cn("whitespace-nowrap ml-2", 
                                        isComplete ? "bg-green-50 text-green-700 border-green-200" : 
                                        isOver ? "bg-red-50 text-red-700 border-red-200" : 
                                        "bg-gray-100 text-gray-500"
                                    )}>
                                        {isComplete && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {isOver && <AlertCircle className="h-3 w-3 mr-1" />}
                                        {count}/2
                                    </Badge>
                                </div>
                            </TableCell>

                            {weekdays.map((day) => {
                                const checked = isDayChecked(user.id, day.isoDate);

                                if (day.isSunday) {
                                    return (
                                        <TableCell key={day.isoDate} className="p-2 text-center border-l bg-orange-50/30">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <Checkbox checked disabled className="data-[state=checked]:bg-orange-400 opacity-50" />
                                                <span className="text-[9px] text-orange-600 font-bold uppercase">Fijo</span>
                                            </div>
                                        </TableCell>
                                    );
                                }

                                return (
                                    <TableCell key={day.isoDate} className={cn("p-2 text-center border-l transition-colors", checked && "bg-blue-50/50")}>
                                        <div className="flex justify-center">
                                            <Checkbox 
                                                checked={checked} 
                                                onCheckedChange={() => onToggleDay(user.id, day.isoDate, !!checked)}
                                                className="h-5 w-5 data-[state=checked]:bg-blue-600"
                                            />
                                        </div>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>
  );
}
