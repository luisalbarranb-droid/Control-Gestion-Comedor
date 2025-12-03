
'use client';

import { useEffect, useMemo } from 'react';
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
import type { InventoryItem, InventoryOrderItem } from '@/lib/types';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  proveedor: z.string().min(1, "El proveedor es obligatorio."),
  fechaPedido: z.date({ required_error: 'La fecha es obligatoria.'}),
  fechaEntregaEstimada: z.date({ required_error: 'La fecha de entrega es obligatoria.'}),
  estado: z.enum(['pendiente', 'completado', 'cancelado']),
  items: z.array(z.object({
    itemId: z.string({ required_error: 'Debes seleccionar un artículo.' }),
    quantity: z.coerce.number().min(0.1, "La cantidad debe ser mayor a 0."),
  })).min(1, "Debes añadir al menos un artículo."),
});

type FormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<FormValues, 'items'> & { items: { itemId: string; quantity: number }[] }) => void;
  inventoryItems: InventoryItem[];
}

export function OrderForm({ isOpen, onOpenChange, onSave, inventoryItems }: OrderFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proveedor: '',
      fechaPedido: new Date(),
      estado: 'pendiente',
      items: [{ itemId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const suppliers = useMemo(() => {
    const supplierSet = new Set(inventoryItems.map(item => item.proveedor).filter(Boolean));
    return Array.from(supplierSet) as string[];
  }, [inventoryItems]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        proveedor: '',
        fechaPedido: new Date(),
        fechaEntregaEstimada: undefined,
        estado: 'pendiente',
        items: [{ itemId: '', quantity: 1 }],
      });
    }
  }, [isOpen, form]);
  
  const handleSave = (values: FormValues) => {
    const orderData = {
      ...values,
      items: values.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
    };
    onSave(orderData);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>
            Genera una nueva orden de compra para un proveedor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="proveedor"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Proveedor</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un proveedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fechaPedido"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:col-span-1">
                    <FormLabel>Fecha del Pedido</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaEntregaEstimada"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:col-span-1">
                    <FormLabel>Fecha Entrega Estimada</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Artículos del Pedido</h3>
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
                                <SelectItem key={item.id} value={item.id}>
                                  {item.nombre} ({item.unidad})
                                </SelectItem>
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
                onClick={() => append({ itemId: '', quantity: 1 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Artículo
              </Button>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar Pedido</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
