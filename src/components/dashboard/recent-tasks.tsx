
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskPriority, TaskStatus, User, Area } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { areas } from '@/lib/placeholder-data';
import { Loader2 } from 'lucide-react';


const priorityVariant: Record<TaskPriority, string> = {
    baja: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    alta: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
    urgente: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
}

const statusVariant: Record<TaskStatus, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    'en-progreso': 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    verificada: 'bg-teal-100 text-teal-800',
    rechazada: 'bg-red-100 text-red-800'
}

export function RecentTasks() {
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

  const recentTasks = tasks
    ?.sort((a, b) => {
        const dateA = a.fechaCreacion as any;
        const dateB = b.fechaCreacion as any;
        return (dateB?.toDate?.().getTime() || 0) - (dateA?.toDate?.().getTime() || 0);
    })
    .slice(0, 5) || [];

  const getUser = (userId: string) => users?.find(u => u.id === userId);
  const getArea = (areaId: string) => areas.find(a => a.id === areaId);

  const isLoading = isLoadingUsers || isLoadingTasks;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Recientes</CardTitle>
        <CardDescription>Un vistazo rápido a las últimas tareas asignadas y su estado.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead className="hidden sm:table-cell">Área</TableHead>
                <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="text-right">Asignado a</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No hay tareas recientes.</TableCell>
                </TableRow>
              )}
              {recentTasks.map((task) => {
                  const user = getUser(task.asignadoA);
                  const area = getArea(task.area);
                  const fechaVencimientoObj = task.fechaVencimiento?.toDate ? task.fechaVencimiento.toDate() : new Date(task.fechaVencimiento as any);

                  return (
                      <TableRow key={task.id}>
                          <TableCell>
                              <div className="font-medium">{task.titulo}</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                  Vence: {format(fechaVencimientoObj, 'dd/MM/yyyy')}
                              </div>
                          </TableCell>
                           <TableCell className="hidden sm:table-cell">{area?.nombre}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className={cn(priorityVariant[task.prioridad], 'capitalize')}>
                                  {task.prioridad}
                              </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                               <Badge variant="secondary" className={cn(statusVariant[task.estado], 'capitalize')}>
                                  {task.estado.replace('-', ' ')}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-2">
                               <span className="hidden lg:inline">{user?.name}</span>
                               <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.avatarUrl} />
                                  <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                               </Avatar>
                             </div>
                          </TableCell>
                      </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
