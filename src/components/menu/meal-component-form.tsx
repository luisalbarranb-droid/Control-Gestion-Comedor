
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { InventoryItem, MenuItem } from '@/lib/types';
import { useEffect } from 'react';

const ingredientSchema = z.object({
  inventoryItemId: z.string().min(1, "Selecciona un ingrediente."),
  quantity: z.coerce.number().min(0.001, "La cantidad debe ser positiva."),
  wasteFactor: z.coerce.number().min(0).max(1, "El factor debe estar entre 0 y 1."),
});

const formSchema = z.object({
  name: z.string().min(1, "El nombre del plato es obligatorio."),
  ingredients: z.array(ingredientSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface MealComponentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<MenuItem, 'id' | 'category'>) => void;
  inventory: InventoryItem[];
  component?: Partial<MenuItem>;
  category: string;
}

export function MealComponentForm({ isOpen, onOpenChange, onSave, inventory, component, category }: MealComponentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ingredients: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  
  useEffect(() => {
    if (component) {
      form.reset({
        name: component.name || '',
        ingredients: component.ingredients || []
      });
    } else {
      form.reset({
        name: '',
        ingredients: []
      });
    }
  }, [component, form, isOpen]);

  const onSubmit = (values: FormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Componente: <span className="capitalize text-primary">{category.replace('acompanante', 'Acomp. ')}</span></DialogTitle>
          <DialogDescription>Define el nombre del plato y los ingredientes necesarios por persona.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Platillo</FormLabel>
                  <FormControl><Input placeholder="Ej: Arroz con Pollo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div>
              <h3 className="text-md font-medium mb-2">Ingredientes</h3>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.inventoryItemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Ingrediente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                            <SelectContent><>{inventory.map(item => <SelectItem key={item.id} value={item.id}>{item.nombre}</SelectItem>)}</></SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Cant. Neta/Pax</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.wasteFactor`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel className={index > 0 ? "sr-only" : ""}>Factor Desecho</FormLabel>
                          <FormControl><Input type="number" step="0.01" placeholder="Ej: 0.1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ inventoryItemId: '', quantity: 0.1, wasteFactor: 0.1 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ingrediente
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar Componente</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
