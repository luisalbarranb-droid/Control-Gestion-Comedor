'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { useToast } from '@/hooks/use-toast';
import { users, areas } from '@/lib/placeholder-data';
import type { Task, TaskPriority, AreaId } from '@/lib/types';

const priorities: TaskPriority[] = ['baja', 'media', 'alta', 'urgente'];

const formSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  descripcion: z.string().optional(),
  area: z.string({ required_error: 'Debes seleccionar un área.' }),
  asignadoA: z.string({ required_error: 'Debes asignar la tarea a un usuario.' }),
  prioridad: z.string({ required_error: 'Debes seleccionar una prioridad.' }),
  fechaVencimiento: z.date({ required_error: 'Debes seleccionar una fecha de vencimiento.' }),
  tiempoEstimado: z.coerce.number().int().positive('El tiempo debe ser un número positivo.').optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateTaskFormProps = {
    onTaskCreate: (task: Omit<Task, 'taskId' | 'creadoPor' | 'fechaCreacion' | 'estado' | 'checklist' | 'evidencias' | 'comentarios' | 'tags' | 'recurrente' | 'periodicidad'>) => void;
};


export function CreateTaskForm({ onTaskCreate }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      tiempoEstimado: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    const taskData = {
        ...values,
        prioridad: values.prioridad as TaskPriority,
        area: values.area as AreaId,
        tiempoEstimado: values.tiempoEstimado || 0,
        descripcion: values.descripcion || '',
    };
    onTaskCreate(taskData);
    
    toast({
      title: 'Tarea Creada',
      description: 'La nueva tarea ha sido añadida a la lista.',
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Completa los detalles de la nueva tarea.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Limpiar el comedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade una descripción detallada de la tarea..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map(area => (
                        <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="asignadoA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignado a</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.userId} value={user.userId}>{user.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="prioridad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaVencimiento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tiempoEstimado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo Estimado (minutos)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 60" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar Tarea</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
