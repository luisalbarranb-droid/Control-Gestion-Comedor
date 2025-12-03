
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
import { MoreHorizontal, SquareCheck } from 'lucide-react';
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
import { areas } from '@/lib/placeholder-data';
import type { Task, TaskPriority, TaskStatus, AreaId, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CreateTaskForm } from '@/components/tasks/create-task-form';
import { TaskDetails } from '@/components/tasks/task-details';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';


export const dynamic = 'force-dynamic';

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
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const role = currentUser?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';

  const tasksQuery = useMemoFirebase(
    () => {
        if (!firestore || !authUser) return null;
        // Admins can see all tasks, common users only see tasks assigned to them
        return isAdmin 
            ? collection(firestore, 'tasks')
            : query(collection(firestore, 'tasks'), where('asignadoA', '==', authUser.uid));
    },
    [firestore, authUser, isAdmin]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const usersQuery = useMemoFirebase(
    () => {
      // Only fetch all users if the current user is an admin
      if (!firestore || !isAdmin) return null;
      return collection(firestore, 'users');
    },
    [firestore, isAdmin]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);
  const getUser = (userId: string) => users?.find((u) => u.id === userId);

  const handleTaskCreate = (newTaskData: Omit<Task, 'id' | 'creadoPor' | 'fechaCreacion' | 'estado' | 'checklist' | 'comentarios' | 'tags' | 'recurrente' | 'evidencias'>) => {
    if (!firestore || !currentUser) return;
    
    const collectionRef = collection(firestore, 'tasks');
    const docRef = doc(collectionRef);

    const fullyNewTask = {
      ...newTaskData,
      id: docRef.id,
      creadoPor: currentUser.id,
      fechaCreacion: serverTimestamp(),
      estado: 'pendiente',
      periodicidad: 'unica',
      checklist: [],
      evidencias: [],
      comentarios: [],
      tags: [],
      recurrente: false,
    };
    
    addDocumentNonBlocking(collectionRef, fullyNewTask);
  };

  const isLoading = isLoadingTasks || (isAdmin && isLoadingUsers) || isAuthLoading || isProfileLoading;

  if (isLoading) {
      return (
          <div className="min-h-screen w-full flex items-center justify-center">
              <p>Cargando tareas...</p>
          </div>
      )
  }

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
        <main className="flex flex-1">
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
              <h1 className="font-headline text-2xl font-bold md:text-3xl">
                Gestión de Tareas
              </h1>
              <CreateTaskForm onTaskCreate={handleTaskCreate} users={users || []}/>
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
                    {tasks && tasks.map((task) => {
                      const user = getUser(task.asignadoA);
                      const area = getArea(task.area);
                      
                      // Handle Firestore Timestamp
                      const fechaVencimiento = task.fechaVencimiento?.toDate ? task.fechaVencimiento.toDate() : new Date(task.fechaVencimiento as any);

                      return (
                        <TableRow key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer">
                          <TableCell>
                            <div className="font-medium">{task.titulo}</div>
                            <div className="text-sm text-muted-foreground">
                              Vence:{' '}
                              {format(fechaVencimiento, 'dd/MM/yyyy')}
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
                                  {user?.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
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
          </div>
          <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} />
        </main>
      </SidebarInset>
    </div>
  );
}
