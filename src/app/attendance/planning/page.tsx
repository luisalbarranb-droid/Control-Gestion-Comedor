'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Save, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  collection, 
  query, 
  where, 
  writeBatch, 
  doc,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { User, DayOff } from '@/lib/types';

const getUserName = (user: User): string => (user as any).name || (user as any).nombres || "Usuario";
const getUserInitials = (name?: string): string => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';

export default function PlanningPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Record<string, string[]>>({});

  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekStartStr = useMemo(() => format(weekStart, 'yyyy-MM-dd'), [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), orderBy('name', 'asc')) : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const daysOffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'daysOff'), 
      where('weekStartDate', '==', weekStartStr)
    );
  }, [firestore, weekStartStr]);
  const { data: existingDaysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

  useEffect(() => {
    if (existingDaysOff) {
      const initialSelection = existingDaysOff.reduce((acc, dayOff) => {
        if (!acc[dayOff.userId]) {
          acc[dayOff.userId] = [];
        }
        if (typeof dayOff.date === 'string') {
          acc[dayOff.userId].push(dayOff.date);
        }
        return acc;
      }, {} as Record<string, string[]>);
      setSelectedDays(initialSelection);
    }
  }, [existingDaysOff]);

  const handlePrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));

  const toggleDay = (userId: string, dateStr: string) => {
    setSelectedDays(prev => {
      const newSelection = { ...prev };
      const currentDays = newSelection[userId] || [];
      const isSelected = currentDays.includes(dateStr);
      
      newSelection[userId] = isSelected 
        ? currentDays.filter(d => d !== dateStr)
        : [...currentDays, dateStr];
        
      return newSelection;
    });
  };

  const handleSave = async () => {
    if (!firestore || !users) return;
    setIsSaving(true);

    try {
      const batch = writeBatch(firestore);
      
      const existingDocsQuery = query(collection(firestore, 'daysOff'), where('weekStartDate', '==', weekStartStr));
      const existingDocsSnapshot = await getDocs(existingDocsQuery);
      existingDocsSnapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      Object.entries(selectedDays).forEach(([userId, dates]) => {
        const user = users.find(u => u.id === userId);
        if (!user || dates.length === 0) return;

        dates.forEach(dateStr => {
          const newDocRef = doc(collection(firestore, 'daysOff'));
          batch.set(newDocRef, {
            userId: userId,
            userName: getUserName(user),
            date: dateStr,
            weekStartDate: weekStartStr,
            createdAt: serverTimestamp()
          });
        });
      });

      await batch.commit();
      
      toast({
        title: "Cambios guardados",
        description: "La planificación de días libres se ha actualizado.",
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingUsers || isLoadingDaysOff;

  if (isLoadingUsers) {
    return <div className="flex h-screen items-center justify-center">Cargando personal...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">Planificación de Libres</h1>
            <p className="text-muted-foreground text-sm">Gestiona los días de descanso del personal.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                <Button variant="ghost" size="icon" onClick={handlePrevWeek}><ArrowLeft className="h-4 w-4" /></Button>
                <div className="flex items-center gap-2 px-2 font-medium">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <span>{format(weekStart, "dd 'de' MMMM", { locale: es })} - {format(addDays(weekStart, 6), "dd 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleNextWeek}><ArrowRight className="h-4 w-4" /></Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-white"></div><span>Laborable</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500"></div><span>Día Libre</span></div>
            </div>
        </CardHeader>
        
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader><TableRow><TableHead className="w-[250px]">Empleado</TableHead>
                        {weekDays.map((day) => (
                            <TableHead key={day.toString()} className="text-center min-w-[100px]">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-normal text-muted-foreground uppercase">{format(day, 'EEE', { locale: es })}</span>
                                    <span className="font-bold text-lg">{format(day, 'dd')}</span>
                                </div>
                            </TableHead>
                        ))}
                    </TableRow></TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={8} className="h-24 text-center">Cargando planificación...</TableCell></TableRow>}
                        {!isLoading && users && users.map((user) => {
                            const userDays = selectedDays[user.id] || [];
                            const userName = getUserName(user);
                            const userInitials = getUserInitials(userName);
                            
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarFallback>{userInitials}</AvatarFallback></Avatar>
                                            <div className="flex flex-col"><span>{userName}</span><span className="text-xs text-muted-foreground capitalize">{user.role || 'Empleado'}</span></div>
                                        </div>
                                    </TableCell>
                                    
                                    {weekDays.map((day) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isSelected = userDays.includes(dateStr);
                                        
                                        return (
                                            <TableCell key={dateStr} className="p-0">
                                                <div onClick={() => toggleDay(user.id, dateStr)} className={`h-16 w-full cursor-pointer transition-all flex items-center justify-center hover:bg-blue-50 ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-transparent'}`}>
                                                    {isSelected && <span className="font-bold text-sm">LIBRE</span>}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                        {!isLoading && (!users || users.length === 0) && (
                            <TableRow><TableCell colSpan={8} className="h-24 text-center">No hay empleados registrados.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
