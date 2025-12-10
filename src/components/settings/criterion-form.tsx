'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { EvaluationCriterion } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  description: z.string().min(10, 'La descripción es muy corta.'),
  maxPoints: z.coerce.number().int().min(1, 'Los puntos deben ser al menos 1.'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CriterionFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<EvaluationCriterion, 'id'>) => void;
  criterion: EvaluationCriterion | null;
}

export function CriterionForm({ isOpen, onOpenChange, onSave, criterion }: CriterionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      maxPoints: 10,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (criterion) {
        form.reset(criterion);
      } else {
        form.reset({
          name: '',
          description: '',
          maxPoints: 10,
          isActive: true,
        });
      }
    }
  }, [isOpen, criterion, form]);

  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{criterion ? 'Editar' : 'Nuevo'} Criterio de Evaluación</DialogTitle>
          <DialogDescription>
            {criterion ? 'Actualiza los detalles de este criterio.' : 'Crea un nuevo parámetro para la matriz de evaluación.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Criterio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Puntualidad y Asistencia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explica qué mide este criterio y cómo se evalúa." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="maxPoints"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Puntuación Máxima</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-col rounded-lg border p-3">
                        <FormLabel>Estado</FormLabel>
                        <div className="flex items-center space-x-2">
                             <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <span className="text-sm text-muted-foreground">
                                {field.value ? 'Activo (se usará en evaluaciones)' : 'Inactivo (no se usará)'}
                            </span>
                        </div>
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Criterio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
