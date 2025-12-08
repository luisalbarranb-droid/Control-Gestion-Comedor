'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { User, AttendanceRecord, DayOff } from '@/lib/types';
import AttendanceTable from '@/components/attendance/attendance-table';
import { DatePicker } from '@/components/ui/datepicker';
import { Card } from '@/components/ui/card';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function AttendanceDashboardPage() {
  const firestore = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // **CORRECCIÓN CRÍTICA**: Inicializar la fecha en `useEffect` para evitar errores de hidratación.
  useEffect(() => {
    setSelectedDate(startOfDay(new Date()));
  }, []);

  const dateQueryStart = selectedDate ? Timestamp.fromDate(selectedDate) : null;
  const dateQueryEnd = selectedDate ? Timestamp.fromDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000 - 1)) : null;

  // Cargar usuarios
  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users'), orderBy('name', 'asc')) : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  // Cargar registros de asistencia para la fecha seleccionada
  const recordsQuery = useMemoFirebase(() => {
    if (!firestore || !dateQueryStart || !dateQueryEnd) return null;
    return query(
      collection(firestore, 'attendance'),
      where('checkIn', '>=', dateQueryStart),
      where('checkIn', '<=', dateQueryEnd)
    );
  }, [firestore, dateQueryStart, dateQueryEnd]);
  const { data: records, isLoading: isLoadingRecords } = useCollection<AttendanceRecord>(recordsQuery);

  // Cargar días libres para la fecha seleccionada
  const dayOffQuery = useMemoFirebase(() => {
    if (!firestore || !selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return query(collection(firestore, 'daysOff'), where('date', '==', dateStr));
  }, [firestore, selectedDate]);
  const { data: daysOff, isLoading: isLoadingDaysOff } = useCollection<DayOff>(dayOffQuery);

  const isLoading = isLoadingUsers || isLoadingRecords || isLoadingDaysOff;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Panel de Asistencia Diaria
          </h1>
          <p className="text-gray-500">
            Visualiza el estado de la asistencia del personal en tiempo real.
          </p>
        </div>
        <div className="w-full md:w-72">
          <DatePicker date={selectedDate} setDate={setSelectedDate} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          {selectedDate && (
            <AttendanceTable
              users={users || []}
              records={records || []}
              daysOff={daysOff || []}
              isLoading={isLoading}
              date={selectedDate}
            />
          )}
        </Card>
      </div>
    </main>
  );
}
