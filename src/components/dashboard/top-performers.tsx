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
import { stats, users } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';

export function TopPerformers() {
  const topUsers = stats.chartData
    .map(stat => {
      const user = users.find(u => u.nombre.startsWith(stat.name.split(' ')[0]));
      return {
        ...stat,
        avatarUrl: user?.avatarUrl,
        nombreCompleto: user?.nombre || stat.name,
      };
    })
    .sort((a, b) => b.eficiencia - a.eficiencia)
    .slice(0, 3);

  const podiumColors = [
    'text-yellow-500', // Gold
    'text-slate-400',   // Silver
    'text-amber-700',   // Bronze
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 3 Usuarios</CardTitle>
        <CardDescription>
          Los miembros del equipo más eficientes del mes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topUsers.map((user, index) => (
            <li key={user.nombreCompleto} className="flex items-center gap-4">
              <Medal className={cn('h-6 w-6', podiumColors[index])} />
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.nombreCompleto} />
                <AvatarFallback>{user.nombreCompleto.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.nombreCompleto}</p>
                <p className="text-sm text-muted-foreground">Eficiencia</p>
              </div>
              <span className="text-lg font-bold">
                {user.eficiencia}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
