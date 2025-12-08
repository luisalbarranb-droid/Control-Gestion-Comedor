'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, addDays, isSameDay } from 'date-fns';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  doc,
  orderBy 
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { User, DayOff } from '@/lib/types';

export default function PlanningPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Estado para la semana actual
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isSaving, setIsSaving] = useState(false);

  // 1. Calcular rango de la semana (Lunes a Domingo)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd'); // Clave para agrupar en Firebase

  // Generar los 7 días de la semana
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // 2. Cargar Usuarios
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('name', 'asc'));
  }, [firestore]);
  
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  // 3. Cargar Días Libres Existentes para esta semana
  const daysOffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // IMPORTANTE: Filtramos por la cadena de texto de la semana para evitar problemas de Timestamp
    return query(
      collection(firestore, 'daysOff'), 
      where('weekStartDate', '==', weekStartStr)
    );
  }, [firestore, weekStartStr]);

  const { data: existingDaysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(daysOffQuery);

  // Estado local para manejar los cambios antes de guardar (Optimistic UI)
  // Mapeamos: userId -> array de fechas (strings YYYY-MM-DD) seleccionadas
  const [selectedDays, setSelectedDays] = useState<Record<string, string[]>>({});

  // Sincronizar estado local con datos de Firebase cuando cargan
  React.useEffect(() => {
    if (existingDaysOff) {
      const initialSelection: Record<string, string[]> = {};
      existingDaysOff.forEach(dayOff => {
        if (!initialSelection[dayOff.userId]) {
          initialSelection[dayOff.userId] = [];
        }
        // Asumimos que dayOff.date es un string YYYY-MM-DD
        initialSelection[dayOff.userId].push(dayOff.date);
      });
      setSelectedDays(initialSelection);
    }
  }, [existingDaysOff]);

  // Manejadores de Navegación
  const handlePrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));

  // Manejador de Toggle (Clic en una celda)
  const toggleDay = (userId: string, dateStr: string) => {
    setSelectedDays(prev => {
      const currentDays = prev[userId] || [];
      const isSelected = currentDays.includes(dateStr);
      
      let newDays;
      if (isSelected) {
        newDays = currentDays.filter(d => d !== dateStr);
      } else {
        newDays = [...currentDays, dateStr];
      }
      
      return { ...prev, [userId]: newDays };
    });
  };

  // Guardar Cambios en Firebase
  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);

    try {
      const batch = writeBatch(firestore);
      
      // 1. Eliminar todos los registros de esta semana (limpieza)
      if (existingDaysOff) {
        existingDaysOff.forEach(docSnap => {
            const docRef = doc(firestore, 'daysOff', docSnap.id);
            batch.delete(docRef);
        });
      }

      // 2. Crear los nuevos registros basados en el estado local
      Object.entries(selectedDays).forEach(([userId, dates]) => {
        const user = users?.find(u => u.id === userId);
        if (!user) return;

        dates.forEach(dateStr => {
          const newDocRef = doc(collection(firestore, 'daysOff'));
          batch.set(newDocRef, {
            id: newDocRef.id,
            userId: userId,
            userName: user.name || 'Sin Nombre',
            date: dateStr, // Guardamos fecha como STRING YYYY-MM-DD
            weekStartDate: weekStartStr, // Clave de agrupación
            createdAt: new Date() // Metadata
          });
        });
      });

      await batch.commit();
      
      toast({
        title: "Cambios guardados",
        description: "La planificación de días libres se ha actualizado.",
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

  const getUserInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'US';
  const getUserName = (user: User) => (user as any).name || (user as any).nombre || 'Usuario sin nombre';


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
            <Button variant="outline" onClick={handleSave} disabled={isSaving || isLoadingDaysOff}>
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
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border bg-white"></div>
                    <span>Laborable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span>Día Libre</span>
                </div>
            </div>
        </CardHeader>
        
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Empleado</TableHead>
                            {weekDays.map((day) => (
                                <TableHead key={day.toString()} className="text-center min-w-[100px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-normal text-muted-foreground uppercase">
                                            {format(day, 'EEE', { locale: es })}
                                        </span>
                                        <span className="font-bold text-lg">
                                            {format(day, 'dd')}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.map((user) => {
                            const userDays = selectedDays[user.id || ''] || [];
                            
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getUserInitials(getUserName(user))}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{getUserName(user)}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{user.role || 'Empleado'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    
                                    {weekDays.map((day) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isSelected = userDays.includes(dateStr);
                                        
                                        return (
                                            <TableCell key={dateStr} className="p-0">
                                                <div 
                                                    onClick={() => toggleDay(user.id || '', dateStr)}
                                                    className={`
                                                        h-16 w-full cursor-pointer transition-all flex items-center justify-center
                                                        hover:bg-blue-50
                                                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-transparent'}
                                                    `}
                                                >
                                                    {isSelected && <span className="font-bold text-sm">LIBRE</span>}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                        {(!users || users.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No hay empleados registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}