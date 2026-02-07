
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import { CheckCircle, Clock, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import type { Task, InventoryItem } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';

export function OverviewCards() {
  const [isClient, setIsClient] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { activeComedorId } = useMultiTenant();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseRef = collection(firestore, 'tasks');
    return activeComedorId
      ? query(baseRef, where('comedorId', '==', activeComedorId))
      : baseRef;
  }, [firestore, activeComedorId]);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseRef = collection(firestore, 'inventory');
    return activeComedorId
      ? query(baseRef, where('comedorId', '==', activeComedorId))
      : baseRef;
  }, [firestore, activeComedorId]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery, { disabled: !user });
  const { data: inventory, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryQuery, { disabled: !user });

  const stats = useMemo(() => {
    if (!tasks) {
      return { total: 0, completadas: 0, pendientes: 0, eficiencia: 0 };
    }
    const total = tasks.length;
    const completadas = tasks.filter((t: Task) => t.estado === 'completada' || t.estado === 'verificada').length;
    const pendientes = total - completadas;
    const eficiencia = total > 0 ? (completadas / total) * 100 : 0;

    return {
      total,
      completadas,
      pendientes,
      eficiencia: Math.round(eficiencia),
    };
  }, [tasks]);

  const inventoryStats = useMemo(() => {
    if (!inventory) return { totalValue: 0 };
    const totalValue = inventory.reduce((sum: number, item: InventoryItem) => {
      const costPerRecipeUnit = (item.costoUnitario || 0) / (item.factorConversion || 1);
      return sum + (item.cantidad * costPerRecipeUnit);
    }, 0);
    return { totalValue };
  }, [inventory]);

  const isLoading = isLoadingTasks || isLoadingInventory || !isClient;

  const cardData = [
    { title: "Monto en Almacén", value: `$${inventoryStats.totalValue.toFixed(2)}`, icon: DollarSign, description: "Valor neto actual" },
    { title: "Tareas Completadas", value: stats.completadas, icon: CheckCircle, description: `de ${stats.total} tareas` },
    { title: "Tareas Pendientes", value: stats.pendientes, icon: Clock, description: "para esta semana" },
    { title: "Eficiencia General", value: `${stats.eficiencia}%`, icon: TrendingUp, description: "Rendimiento promedio" },
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
