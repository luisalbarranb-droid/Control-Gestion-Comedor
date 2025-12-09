
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit } from 'lucide-react';
import type { InventoryItem, Menu, MenuItem, MenuItemCategory } from '@/lib/types';
import { MealComponentForm } from './meal-component-form';

const categoryOrder: MenuItemCategory[] = ['entrada', 'proteico', 'acompanante1', 'acompanante2', 'acompanante3', 'bebida', 'postre'];

const formSchema = z.object({
  pax: z.coerce.number().int().min(1, "El número de comensales es obligatorio."),
  items: z.array(z.any()).min(7, "Debes definir los 7 componentes del menú."),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyMenuFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Menu, 'id' | 'date'>) => void;
  menu: Omit<Menu, 'id' | 'date'> | null;
  inventory: InventoryItem[];
}

export function DailyMenuForm({ isOpen, onOpenChange, onSave, menu, inventory }: DailyMenuFormProps) {
  const [editingComponent, setEditingComponent] = useState<{ category: MenuItemCategory, component: Partial<MenuItem> } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pax: 150, items: [] },
  });

  useEffect(() => {
    if (menu) {
      form.reset({
        pax: menu.pax,
        items: menu.items,
      });
    } else {
      const initialItems = categoryOrder.map(cat => ({ id: uuidv4(), name: '', category: cat, ingredients: [] }));
      form.reset({ pax: 150, items: initialItems });
    }
  }, [menu, isOpen, form]);

  const handleSaveComponent = (componentData: Omit<MenuItem, 'id' | 'category'>) => {
    if (!editingComponent) return;
    const { category } = editingComponent;
    const currentItems = form.getValues('items');
    const itemIndex = currentItems.findIndex(item => item.category === category);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...componentData };
      form.setValue('items', updatedItems, { shouldValidate: true });
    }
  };
  
  const onSubmit = (values: FormValues) => {
    onSave(values as Omit<Menu, 'id' | 'date'>);
    onOpenChange(false);
  };

  const menuItems = form.watch('items');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{menu ? 'Editar' : 'Crear'} Menú Diario</DialogTitle>
            <DialogDescription>Define los comensales y cada uno de los 7 componentes del menú.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField
                control={form.control}
                name="pax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Comensales (PAX)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <div className="space-y-2">
                <FormLabel>Componentes del Menú</FormLabel>
                {menuItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex flex-col">
                        <span className="font-semibold capitalize text-sm">{item.category.replace('acompanante', 'Acomp. ')}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.name || 'Sin definir'}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingComponent({ category: item.category, component: item })}
                    >
                      <Edit className="mr-2 h-3 w-3" /> {item.name ? 'Editar' : 'Agregar'}
                    </Button>
                  </div>
                ))}
                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Guardar Menú</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {editingComponent && (
         <MealComponentForm 
            isOpen={!!editingComponent}
            onOpenChange={() => setEditingComponent(null)}
            onSave={handleSaveComponent}
            inventory={inventory}
            component={editingComponent.component}
            category={editingComponent.category}
         />
      )}
    </>
  );
}
