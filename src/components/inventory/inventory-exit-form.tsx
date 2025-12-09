
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { PlusCircle, Trash2, BookOpen } from 'lucide-react';
import type { InventoryItem, AreaId, Menu } from '@/lib/types';
import { Separator } from '../ui/separator';
import { areas, weeklyMenus } from '@/lib/placeholder-data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

const exitReasons = [
    { id: 'produccion', label: 'Uso en Producción' },
    { id: 'vencimiento', label: 'Vencimiento' },
    { id: 'mal-estado', label: 'Mal Estado / Daño' },
    { id: 'otro', label: 'Otro' },
];

const formSchema = z.object({
  reason: z.string({ required_error: 'Debes seleccionar un motivo.'}),
  destinationArea: z.string().optional(),
  date: z.date({ required_error: 'La fecha es obligatoria.'}),
  items: z.array(z.object({
    itemId: z.string({ required_error: 'Debes seleccionar un artículo.' }),
    quantity: z.coerce.number().min(0.1, "La cantidad debe ser mayor a 0."),
  })).min(1, "Debes añadir al menos un artículo."),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryExitFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: FormValues) => void;
  inventoryItems: InventoryItem[];
}

export function InventoryExitForm({ isOpen, onOpenChange, onSave, inventoryItems }: InventoryExitFormProps) {
  const { toast } = useToast();
  const [menuDate, setMenuDate] = useState<Date>();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      items: [{ itemId: '', quantity: 0 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const selectedReason = form.watch('reason');
  
  const menusByDate = useMemo(() => {
    return weeklyMenus.reduce((acc, menu) => {
      const dateKey = format(new Date(menu.date), 'yyyy-MM-dd');
      acc[dateKey] = menu;
      return acc;
    }, {} as Record<string, Menu>);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        reason: undefined,
        destinationArea: undefined,
        date: new Date(),
        items: [{ itemId: '', quantity: 0 }],
      });
      setMenuDate(undefined);
    }
  }, [isOpen, form]);
  
  useEffect(() => {
    if(selectedReason === 'produccion') {
        form.setValue('destinationArea', 'cocina');
    }
  }, [selectedReason, form]);
  
  useEffect(() => {
    if (menuDate) {
        const dateKey = format(menuDate, 'yyyy-MM-dd');
        const selectedMenu = menusByDate[dateKey];

        if (selectedMenu) {
            const ingredientMap = new Map<string, number>();
            selectedMenu.items.forEach(menuItem => {
                menuItem.ingredients.forEach(ingredient => {
                    const grossQuantity = ingredient.quantity / (1 - ingredient.wasteFactor);
                    const totalQuantity = grossQuantity * selectedMenu.pax;
                    const currentQuantity = ingredientMap.get(ingredient.inventoryItemId) || 0;
                    ingredientMap.set(ingredient.inventoryItemId, currentQuantity + totalQuantity);
                });
            });

            const newItems = Array.from(ingredientMap.entries()).map(([itemId, quantity]) => ({
                itemId,
                quantity: parseFloat(quantity.toFixed(2))
            }));

            if (newItems.length > 0) {
                replace(newItems);
            } else {
                replace([{ itemId: '', quantity: 0 }]);
            }
            
            form.setValue('reason', 'produccion');
            form.setValue('destinationArea', 'cocina');

            toast({
                title: "Menú Cargado",
                description: `Se han cargado los ingredientes para el menú de ${selectedMenu.pax} PAX.`
            });
        } else {
             toast({
                variant: 'destructive',
                title: "Sin Menú Planificado",
                description: `No se encontró un menú para la fecha seleccionada.`
            });
            replace([{ itemId: '', quantity: 0 }]);
        }
    }
  }, [menuDate, menusByDate, replace, toast, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar Salida de Inventario</DialogTitle>
          <DialogDescription>
            Descuenta artículos del stock por uso, vencimiento u otros motivos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de la Salida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exitReasons.map(reason => (
                          <SelectItem key={reason.id} value={reason.id}>{reason.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Salida</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
               {selectedReason === 'produccion' && (
                 <FormField
                    control={form.control}
                    name="destinationArea"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Área de Destino</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
              )}
            </div>

            <Separator />

             <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Cargar desde Menú Planificado
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={menuDate}
                        onSelect={setMenuDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>


            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Artículos a Retirar</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel className={index !== 0 ? "sr-only" : ""}>Artículo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un artículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>{item.nombre} ({item.cantidad} {item.unidad})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>Cantidad</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ itemId: '', quantity: 0 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Artículo
              </Button>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Confirmar Salida</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
