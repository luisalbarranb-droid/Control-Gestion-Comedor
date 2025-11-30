'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUp, PlusCircle } from 'lucide-react';
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
  FormDescription,
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
import type { Task, TaskPriority, AreaId, Evidence } from '@/lib/types';
import { cn } from '@/lib/utils';

const priorities: TaskPriority[] = ['baja', 'media', 'alta', 'urgente'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
  descripcion: z.string().optional(),
  area: z.string({ required_error: 'Debes seleccionar un área.' }),
  asignadoA: z.string({ required_error: 'Debes asignar la tarea a un usuario.' }),
  prioridad: z.string({ required_error: 'Debes seleccionar una prioridad.' }),
  fechaVencimiento: z.date({ required_error: 'Debes seleccionar una fecha de vencimiento.' }),
  tiempoEstimado: z.coerce.number().int().positive('El tiempo debe ser un número positivo.').optional(),
  evidencia: z.any()
    .refine((files) => files?.length <= 1, "Solo puedes subir un archivo.")
    .refine((files) => !files || files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo es de 5MB.`)
    .refine(
      (files) => !files || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Solo se aceptan formatos .jpg, .jpeg, .png y .webp."
    ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateTaskFormProps = {
    onTaskCreate: (task: Omit<Task, 'taskId' | 'creadoPor' | 'fechaCreacion' | 'estado' | 'checklist' | 'comentarios' | 'tags' | 'recurrente' | 'periodicidad'>) => void;
};


export function CreateTaskForm({ onTaskCreate }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      tiempoEstimado: undefined,
    },
  });

  const fileRef = form.register("evidencia");

  function onSubmit(values: FormValues) {
    let evidencias: Evidence[] = [];
    if (values.evidencia && values.evidencia.length > 0) {
      const file = values.evidencia[0];
      evidencias.push({
        url: URL.createObjectURL(file), // Create a temporary URL for preview
        nombreArchivo: file.name,
        fechaSubida: new Date(),
        usuario: 'user-superadmin-1', // Placeholder
        descripcion: 'Evidencia inicial'
      });
    }

    const taskData = {
        ...values,
        prioridad: values.prioridad as TaskPriority,
        area: values.area as AreaId,
        tiempoEstimado: values.tiempoEstimado || 0,
        descripcion: values.descripcion || '',
        evidencias,
    };
    onTaskCreate(taskData);
    
    toast({
      title: 'Tarea Creada',
      description: 'La nueva tarea ha sido añadida a la lista.',
    });
    setIsOpen(false);
    form.reset();
    setPreview(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        form.reset();
        setPreview(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Completa los detalles de la nueva tarea.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
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
              name="evidencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto de Evidencia (Opcional)</FormLabel>
                  <FormControl>
                    <div className="relative flex justify-center w-full px-6 py-10 border-2 border-dashed rounded-md border-input">
                       <Input
                        type="file"
                        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        {...fileRef}
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center gap-2 text-center">
                        {preview ? (
                          <img src={preview} alt="Vista previa" className="object-contain h-24 rounded-md" />
                        ) : (
                          <>
                            <FileUp className="w-10 h-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">Haz clic para subir</span> o arrastra y suelta
                            </p>
                             <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max. 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        </Trigger>
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
                        </Trigger>
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
            </div>
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
            <DialogFooter className='pt-4'>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar Tarea</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
