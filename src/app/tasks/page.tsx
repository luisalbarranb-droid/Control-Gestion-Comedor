'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tasks as initialTasks, users, areas } from '@/lib/placeholder-data';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CreateTaskForm } from '@/components/tasks/create-task-form';

const priorityVariant: Record<TaskPriority, string> = {
  baja: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  media:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  alta: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
  urgente:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};

const statusVariant: Record<TaskStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  'en-progreso': 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  verificada: 'bg-teal-100 text-teal-800',
  rechazada: 'bg-red-100 text-red-800',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const getUser = (userId: string) => users.find((u) => u.userId === userId);
  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);

  const handleTaskCreate = (newTask: Omit<Task, 'taskId' | 'creadoPor' | 'fechaCreacion' | 'estado' | 'checklist' | 'evidencias' | 'comentarios' | 'tags' | 'recurrente' | 'periodicidad'>) => {
    const fullyNewTask: Task = {
      ...newTask,
      taskId: `task-${Date.now()}`,
      creadoPor: 'user-superadmin-1', // Placeholder for current user
      fechaCreacion: new Date(),
      estado: 'pendiente',
      periodicidad: 'unica',
      checklist: [],
      evidencias: [],
      comentarios: [],
      tags: [],
      recurrente: false,
    };
    setTasks(prevTasks => [fullyNewTask, ...prevTasks]);
  };

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Gestión de Tareas
            </h1>
            <CreateTaskForm onTaskCreate={handleTaskCreate} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todas las Tareas</CardTitle>
              <CardDescription>
                Visualiza y gestiona todas las tareas del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Prioridad
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Área</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Asignado a
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const user = getUser(task.asignadoA);
                    const area = getArea(task.area);
                    return (
                      <TableRow key={task.taskId}>
                        <TableCell>
                          <div className="font-medium">{task.titulo}</div>
                          <div className="text-sm text-muted-foreground">
                            Vence:{' '}
                            {format(
                              new Date(task.fechaVencimiento),
                              'dd/MM/yyyy'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              statusVariant[task.estado],
                              'capitalize'
                            )}
                          >
                            {task.estado.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={cn(
                              priorityVariant[task.prioridad],
                              'capitalize'
                            )}
                          >
                            {task.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {area?.nombre}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.avatarUrl} />
                              <AvatarFallback>
                                {user?.nombre
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user?.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>
                                Marcar como completada
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
