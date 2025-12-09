'use client';

import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
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
import type { Task, TaskPriority, TaskStatus, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { CreateTaskForm, TaskFormValues } from '@/components/tasks/create-task-form';
import { TaskDetails } from '@/components/tasks/task-details';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, where, Timestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

const priorityVariant: Record<TaskPriority, string> = {
  baja: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  alta: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
  urgente: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};

const statusVariant: Record<TaskStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  'en-progreso': 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  verificada: 'bg-teal-100 text-teal-800',
  rechazada: 'bg-red-100 text-red-800',
};

// --- FUNCIONES CRÍTICAS PARA MANEJO DE FECHAS (Igual que en Menus/Settings) ---
function isTimestamp(value: any): value is Timestamp {
    return value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function';
}

function convertToDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Date && isValid(date)) return date;
    if (isTimestamp(date)) return date.toDate(); // Uso seguro de toDate()
    const parsed = new Date(date);
    return isValid(parsed) ? parsed : null;
}
// -----------------------------------------------------------------------------

const getUserName = (user?: User | null): string => {
    if (!user) return 'N/A';
    // Casting seguro para evitar errores si la propiedad no está en la interfaz base
    return (user as any).name || (user as any).nombres || 'Usuario';
}

const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}


export default function TasksPage() {
  const firestore = useFirestore();
  const { user: authUser, profile: currentUser, isUserLoading: isAuthLoading } = useUser();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const role = currentUser?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';
  const userId = authUser?.uid;

  const tasksQuery = useMemoFirebase(
    () => {
        if (!firestore || isAuthLoading) return null;
        
        const tasksCollection = collection(firestore, 'tasks');
        
        if (isAdmin) {
          return query(tasksCollection);
        }
        
        if (userId) {
          return query(tasksCollection, where('asignadoA', '==', userId));
        }

        return null; 
    },
    [firestore, isAdmin, isAuthLoading, userId] 
  );
  
  // Añadimos manejo seguro para cuando tasksQuery es null
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);
  const getUser = (userId: string) => users?.find((u) => u.id === userId);

  const handleTaskCreate = (newTaskData: TaskFormValues) => {
    if (!firestore || !currentUser?.id) return;
    
    const collectionRef = collection(firestore, 'tasks');
    
    const fullyNewTask = {
      ...newTaskData,
      creadoPor: currentUser.id,
      fechaCreacion: serverTimestamp(),
      estado: 'pendiente' as TaskStatus,
      checklist: [],
      evidencias: [],
      comentarios: [],
      tags: [],
      recurrente: false,
      fechaVencimiento: Timestamp.fromDate(newTaskData.fechaVencimiento),
      titulo: newTaskData.titulo,
      asignadoA: newTaskData.asignadoA
    };
    
    addDocumentNonBlocking(collectionRef, fullyNewTask);
    setFormOpen(false);
  };
  
  const handleTaskUpdate = (updatedTask: Partial<Task>) => {
    if (!firestore || !selectedTask) return;
    const taskRef = doc(firestore, 'tasks', selectedTask.id);
    updateDocumentNonBlocking(taskRef, updatedTask);
  };
  
   const handleTaskDelete = (taskId: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    if(selectedTask?.id === taskId) {
       setSelectedTask(null);
    }
  };

  const isLoading = isLoadingTasks || isLoadingUsers || isAuthLoading;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold md:text-3xl">
           Gestión de Tareas
          </h1>
          <Button onClick={() => setFormOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>

        <CreateTaskForm onTaskCreate={handleTaskCreate} users={users || []} isOpen={isFormOpen} onOpenChange={setFormOpen} />

        <Card>
          <CardHeader>
            <CardTitle>Todas las Tareas</CardTitle>
            <CardDescription>
              Visualiza y gestiona todas las tareas del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Cargando tareas...</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Prioridad</TableHead>
                  <TableHead className="hidden sm:table-cell">Área</TableHead>
                  <TableHead className="hidden lg:table-cell">Asignado a</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks && tasks.map((task) => {
                   const user = getUser(task.asignadoA);
                   const area = getArea(task.area);
                   // Uso de la función segura convertToDate
                   const fechaVencimiento = convertToDate(task.fechaVencimiento);

                   return (
                     <TableRow key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer hover:bg-gray-50">
                       <TableCell>
                         <div className="font-medium">{task.titulo}</div>
                         <div className="text-sm text-muted-foreground">
                           Vence: {fechaVencimiento ? format(fechaVencimiento, 'dd/MM/yyyy') : 'N/A'}
                         </div>
                        </TableCell>
                       <TableCell>
                         <Badge variant="secondary" className={cn(statusVariant[task.estado], 'capitalize')}>
                             {task.estado.replace('-', ' ')}
                           </Badge>
                       </TableCell>
                       <TableCell className="hidden md:table-cell">
                         <Badge variant="outline" className={cn(priorityVariant[task.prioridad], 'capitalize')}>
                             {task.prioridad}
                           </Badge>
                        </TableCell>
                       <TableCell className="hidden sm:table-cell">
                         {area?.nombre}
                       </TableCell>
                       <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={(user as any)?.avatarUrl} />
                               <AvatarFallback>
                                  {getUserInitials(getUserName(user))}
                               </AvatarFallback>
                             </Avatar>
                             <span>{getUserName(user)}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                         <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                   <MoreHorizontal className="h-4 w-4" />
                                   <span className="sr-only">Toggle menu</span>
                                 </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                               <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => setSelectedTask(task)}>Ver Detalles</DropdownMenuItem>
                               <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem>Marcar como completada</DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-red-600" onClick={() => handleTaskDelete(task.id)}>
                                  Eliminar
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                       </TableCell>
                     </TableRow>
                   );
                })}
                 {!isLoading && (!tasks || tasks.length === 0) && (
                     <TableRow>
                         <TableCell colSpan={6} className="text-center h-24">No se encontraron tareas.</TableCell>
                     </TableRow>
                 )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      
      <TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleTaskUpdate} />
    </div>
  );
}

    