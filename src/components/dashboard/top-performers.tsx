'use client';

import { Medal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Task, User } from '@/lib/types';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export function TopPerformers() {
  const firestore = useFirestore();
  const { user } = useUser();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery, { disabled: !user });
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery, { disabled: !user });

  const topUsers = useMemo(() => {
    if (!users || !tasks) return [];
    
    const userStats: Record<string, { completed: number, total: number }> = {};

    tasks.forEach(task => {
      if (!userStats[task.asignadoA]) {
        userStats[task.asignadoA] = { completed: 0, total: 0 };
      }
      userStats[task.asignadoA].total++;
      if (task.estado === 'completada' || task.estado === 'verificada') {
        userStats[task.asignadoA].completed++;
      }
    });

    return Object.entries(userStats)
      .map(([userId, stats]) => {
        const user = users.find(u => u.id === userId);
        const efficiency = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        return {
          id: userId,
          name: user?.name || 'Usuario Desconocido',
          avatarUrl: user?.avatarUrl,
          efficiency: Math.round(efficiency),
        };
      })
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);

  }, [users, tasks]);

  const podiumColors = [
    'text-yellow-500', // Gold
    'text-slate-400',   // Silver
    'text-amber-700',   // Bronze
  ];

  const isLoading = isLoadingUsers || isLoadingTasks;

  const getUserInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('') : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 3 Usuarios</CardTitle>
        <CardDescription>
          Los miembros del equipo más eficientes del mes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-4">
            {topUsers.length === 0 && <p className="text-sm text-muted-foreground text-center">No hay datos de eficiencia para mostrar.</p>}
            {topUsers.map((user, index) => (
              <li key={user.id} className="flex items-center gap-4">
                <Medal className={cn('h-6 w-6', podiumColors[index])} />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">Eficiencia</p>
                </div>
                <span className="text-lg font-bold">
                  {user.efficiency}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
