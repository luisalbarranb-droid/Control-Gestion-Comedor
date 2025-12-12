
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { inventoryCategories } from '@/lib/placeholder-data';
import type { InventoryItem, InventoryCategoryId, UnitOfMeasure } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  codigo: z.string().min(1, 'El código es obligatorio.'),
  descripcion: z.string().optional(),
  categoriaId: z.string({ required_error: 'Debes seleccionar una categoría.' }),
  subCategoria: z.string().optional(),
  cantidad: z.coerce.number().min(0, 'La cantidad no puede ser negativa.'),
  unidadReceta: z.string({ required_error: 'La unidad de receta es obligatoria.' }),
  unidadCompra: z.string().optional(),
  factorConversion: z.coerce.number().optional(),
  stockMinimo: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo.'),
  proveedor: z.string().optional(),
  costoUnitario: z.coerce.number().optional(),
});


type FormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (item: any, isNew: boolean) => void;
  item: InventoryItem | null;
}

const unitsOfMeasure: UnitOfMeasure[] = ['kg', 'g', 'lt', 'ml', 'unidad', 'paquete', 'caja'];

export function InventoryForm({ isOpen, onOpenChange, onSave, item }: InventoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      cantidad: 0,
      stockMinimo: 0,
      proveedor: '',
      costoUnitario: 0,
      subCategoria: '',
      factorConversion: 1,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        ...item,
        costoUnitario: item.costoUnitario || 0,
        factorConversion: item.factorConversion || 1,
      });
    } else {
      form.reset({
        nombre: '',
        codigo: '',
        descripcion: '',
        categoriaId: undefined,
        subCategoria: '',
        cantidad: 0,
        unidadReceta: undefined,
        unidadCompra: undefined,
        factorConversion: 1,
        stockMinimo: 0,
        proveedor: '',
        costoUnitario: 0,
      });
    }
  }, [item, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    const dataToSave = {
      ...values,
      categoriaId: values.categoriaId as InventoryCategoryId,
      unidadReceta: values.unidadReceta as UnitOfMeasure,
      unidadCompra: values.unidadCompra as UnitOfMeasure | undefined,
    };
    onSave(dataToSave, !item);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Artículo' : 'Crear Nuevo Artículo'}</DialogTitle>
          <DialogDescription>
            {item ? 'Actualiza los detalles del artículo.' : 'Completa los detalles del nuevo artículo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                        <FormItem className="sm:col-span-1">
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: VIV-001" {...field} disabled={!!item} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Pechuga de Pollo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventoryCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aves" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles adicionales del artículo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unidadCompra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Compra</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Ej: caja" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {unitsOfMeasure.map(unit => (<SelectItem key={unit} value={unit} className="uppercase">{unit}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidadReceta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Receta</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Ej: kg" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {unitsOfMeasure.map(unit => (<SelectItem key={unit} value={unit} className="uppercase">{unit}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="factorConversion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor Conversión</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Actual (en Un. Receta)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="stockMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="proveedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del proveedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="costoUnitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo por Unidad de Compra</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
