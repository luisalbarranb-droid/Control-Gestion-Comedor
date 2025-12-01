'use client';

import { useEffect } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import type { InventoryItem, AreaId } from '@/lib/types';
import { Separator } from '../ui/separator';
import { areas } from '@/lib/placeholder-data';

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      items: [{ itemId: '', quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const selectedReason = form.watch('reason');

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        reason: undefined,
        destinationArea: undefined,
        date: new Date(),
        items: [{ itemId: '', quantity: 0 }],
      });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Salida de Inventario</DialogTitle>
          <DialogDescription>
            Descuenta artículos del stock por uso, vencimiento u otros motivos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de la Salida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              {selectedReason === 'produccion' && (
                 <FormField
                    control={form.control}
                    name="destinationArea"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Área de Destino</FormLabel>
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
              )}
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
            </div>

            <Separator />

            <div>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un artículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryItems.map(item => (
                                <SelectItem key={item.itemId} value={item.itemId}>{item.nombre} ({item.cantidad} {item.unidad})</SelectItem>
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
