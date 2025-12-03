'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import { useToast } from '@/hooks/use-toast';
import { Menu } from '@/lib/types';

type CreateMenuFormProps = {
  onMenuCreate: (menu: Omit<Menu, 'id' | 'items'>) => void;
};

const formSchema = z.object({
  date: z.date({ required_error: 'La fecha es obligatoria.' }),
  pax: z.coerce.number().int().positive('El número de comensales debe ser positivo.'),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateMenuForm({ onMenuCreate }: CreateMenuFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      pax: 1,
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  function onSubmit(values: FormValues) {
    onMenuCreate(values);
    toast({
      title: 'Menú Creado',
      description: `El borrador del menú para el ${values.date.toLocaleDateString()} ha sido creado. Ahora puedes añadirle platos.`,
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Menú
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Menú</DialogTitle>
          <DialogDescription>
            Planifica un nuevo menú para una fecha y número de comensales específicos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Menú</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="pax"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>N° de Comensales (PAX)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            {/* Future: Add fields for menu items */}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Menú</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    