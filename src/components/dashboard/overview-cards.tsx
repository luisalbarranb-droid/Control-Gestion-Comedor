
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardList, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function OverviewCards() {
  const [isClient, setIsClient] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery, { disabled: !user });

  const stats = useMemo(() => {
    if (!tasks) {
      return { total: 0, completadas: 0, pendientes: 0, eficiencia: 0 };
    }
    const total = tasks.length;
    const completadas = tasks.filter(t => t.estado === 'completada' || t.estado === 'verificada').length;
    const pendientes = total - completadas;
    const eficiencia = total > 0 ? (completadas / total) * 100 : 0;
    
    return {
      total,
      completadas,
      pendientes,
      eficiencia: Math.round(eficiencia),
    };
  }, [tasks]);

  const isLoading = isLoadingTasks || !isClient;

  const cardData = [
    { title: "Total de Tareas", value: stats.total, icon: ClipboardList, description: "en el último mes" },
    { title: "Tareas Completadas", value: stats.completadas, icon: CheckCircle, description: `de ${stats.total} tareas` },
    { title: "Tareas Pendientes", value: stats.pendientes, icon: Clock, description: "para esta semana" },
    { title: "Eficiencia", value: `${stats.eficiencia}%`, icon: TrendingUp, description: "+2.1% desde el mes pasado" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {cardData.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
