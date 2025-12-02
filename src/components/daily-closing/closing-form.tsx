
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Menu, DailyClosing, MenuItemCategory } from '@/lib/types';
import { categoryDisplay } from './category-display';

const formSchema = z.object({
  executedPax: z.coerce.number().int().min(0, 'El número de comensales debe ser no negativo.'),
  executedItems: z.array(z.object({
    name: z.string().min(1, 'El nombre es obligatorio.'),
    category: z.string({ required_error: 'La categoría es obligatoria.' }),
  })).min(1, 'Debe haber al menos un plato ejecutado.'),
  variations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClosingFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<DailyClosing, 'closingId' | 'plannedMenu' | 'closedBy' | 'date'>) => void;
  plannedMenu: Menu | null;
  existingClosing?: DailyClosing | null;
}

export function ClosingForm({ isOpen, onOpenChange, onSave, plannedMenu, existingClosing }: ClosingFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      executedPax: 0,
      executedItems: [{ name: '', category: '' }],
      variations: '',
    },
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'executedItems',
  });

  useEffect(() => {
    if (isOpen) {
      if (existingClosing) {
        // Edit existing closing
        form.reset({
          executedPax: existingClosing.executedPax,
          executedItems: existingClosing.executedItems.map(item => ({ name: item.name, category: item.category })),
          variations: existingClosing.variations,
        });
      } else if (plannedMenu) {
        // Create new closing based on plan
         form.reset({
            executedPax: plannedMenu.pax,
            executedItems: plannedMenu.items.map(item => ({ name: item.name, category: item.category })),
            variations: '',
        });
      } else {
        // Create new from scratch
         form.reset({
            executedPax: 0,
            executedItems: [{ name: '', category: '' }],
            variations: '',
        });
      }
    }
  }, [isOpen, plannedMenu, existingClosing, form]);


  const onSubmit = (values: FormValues) => {
    const castedValues = {
        ...values,
        executedItems: values.executedItems.map(item => ({ ...item, category: item.category as MenuItemCategory }))
    };
    onSave(castedValues);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existingClosing ? 'Editar' : 'Registrar'} Cierre Diario</DialogTitle>
          <DialogDescription>
            Registra los datos reales del servicio del día para compararlos con la planificación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="executedPax"
              render={({ field }) => (
                <FormItem className="w-48">
                  <FormLabel>Comensales Reales (PAX)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Menú Realmente Ejecutado</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`executedItems.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? 'sr-only' : ''}>Nombre del Plato</FormLabel>
                          <Input placeholder="Ej: Pollo Frito" {...field} />
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`executedItems.${index}.category`}
                      render={({ field }) => (
                        <FormItem className="w-48">
                          <FormLabel className={index !== 0 ? 'sr-only' : ''}>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(categoryDisplay).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', category: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Plato
              </Button>
            </div>
            
            <Separator />

             <FormField
              control={form.control}
              name="variations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variaciones y Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe cualquier cambio o imprevisto, ej: 'No había pescado, se sustituyó por pollo...'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar Cierre</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
