
'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { PlusCircle, Trash2, Camera, Loader2 } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';

const formSchema = z.object({
  proveedor: z.string().min(2, "El proveedor es obligatorio."),
  documento: z.string().min(1, "El número de documento es obligatorio."),
  fecha: z.date({ required_error: 'La fecha es obligatoria.'}),
  items: z.array(z.object({
    itemId: z.string({ required_error: 'Debes seleccionar un artículo.' }),
    quantity: z.coerce.number().min(0.1, "La cantidad debe ser mayor a 0."),
  })).min(1, "Debes añadir al menos un artículo."),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: FormValues) => void;
  inventoryItems: InventoryItem[];
}

export function InventoryEntryForm({ isOpen, onOpenChange, onSave, inventoryItems }: InventoryEntryFormProps) {
  const { toast } = useToast();
  const [isAiScanning, startAiTransition] = useTransition();
  const [showAiUploader, setShowAiUploader] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proveedor: '',
      documento: '',
      fecha: new Date(),
      items: [{ itemId: '', quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        proveedor: '',
        documento: '',
        fecha: new Date(),
        items: [{ itemId: '', quantity: 0 }],
      });
      setShowAiUploader(false);
    }
  }, [isOpen, form]);

  const handleFileScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUri = reader.result as string;
      
      startAiTransition(async () => {
        try {
          const result = await extractInvoiceData({ invoicePhoto: dataUri });
          
          form.setValue('proveedor', result.proveedor);
          form.setValue('fecha', new Date(result.fecha));

          const matchedItems = result.items.map(extractedItem => {
            const foundItem = inventoryItems.find(invItem => 
              invItem.nombre.toLowerCase().includes(extractedItem.nombre.toLowerCase()) ||
              extractedItem.nombre.toLowerCase().includes(invItem.nombre.toLowerCase())
            );
            return {
              itemId: foundItem?.id || '',
              quantity: extractedItem.quantity,
              // We don't map cost here as the form doesn't handle it directly
            };
          });

          // Replace the current items with the scanned ones
          form.setValue('items', matchedItems.length > 0 ? matchedItems : [{ itemId: '', quantity: 0 }]);
          
          toast({
            title: 'Factura Escaneada',
            description: 'Los datos se han cargado en el formulario. Por favor, verifica la información.',
          });

        } catch (error) {
          console.error("AI Scan failed:", error);
          toast({
            variant: 'destructive',
            title: 'Error de Escaneo',
            description: 'La IA no pudo procesar la imagen. Intenta con una foto más clara.'
          });
        }
      });
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Entrada de Inventario</DialogTitle>
          <DialogDescription>
            Añade nuevos artículos al stock a partir de una factura o nota de entrega.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            
            <Button type="button" variant="outline" onClick={() => setShowAiUploader(prev => !prev)} disabled={isAiScanning}>
              <Camera className="mr-2 h-4 w-4" />
              {showAiUploader ? 'Ocultar escáner' : 'Escanear Factura con IA'}
            </Button>

            {showAiUploader && (
              <div className="p-4 border-2 border-dashed rounded-lg">
                <FormItem>
                  <FormLabel>Subir Imagen de Factura</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleFileScan} disabled={isAiScanning} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
            
            {isAiScanning && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analizando factura... Esto puede tardar un momento.</span>
              </div>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="proveedor"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Avícola La Granja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>N° Factura / Nota</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: FAC-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:col-span-1">
                    <FormLabel>Fecha de Entrada</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Artículos</h3>
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
                                <SelectItem key={item.id} value={item.id}>{item.nombre}</SelectItem>
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
              <Button type="submit" disabled={isAiScanning}>
                {isAiScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Entrada
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
