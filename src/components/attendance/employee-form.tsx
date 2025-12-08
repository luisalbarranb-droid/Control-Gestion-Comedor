'use client';

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
import { FileText } from 'lucide-react';
import type { User } from '@/lib/types';


const employeeSchema = z.object({
  cedula: z.string().min(1, 'La cédula es obligatoria'),
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  workerType: z.enum(['empleado', 'obrero']),
  phone: z.string().optional(),
  address: z.string().optional(),
  // genero: z.enum(['masculino', 'femenino']),
  creationDate: z.string().min(1, 'Fecha requerida'),
  area: z.string().min(1, 'Departamento requerido'),
  contractType: z.enum(['determinado', 'indeterminado', 'prueba']),
  // diasContrato: z.coerce.number().optional(),
  // contratoUrl: z.string().optional(),
});

interface EmployeeFormProps {
  onSave: (data: Omit<User, 'id'>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeForm({ onSave, isOpen, onOpenChange }: EmployeeFormProps) {
  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      cedula: '',
      nombres: '',
      apellidos: '',
      workerType: 'empleado',
      phone: '',
      address: '',
      creationDate: new Date().toISOString().split('T')[0],
      area: 'cocina',
      contractType: 'indeterminado',
    },
  });

  const handleSubmit = (values: z.infer<typeof employeeSchema>) => {
    // We cast to any because the form has a subset of the User type.
    // The parent component (`personal/page.tsx`) will add the missing fields.
    onSave(values as any);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ficha de Empleado</DialogTitle>
          <DialogDescription>
            Registra los datos personales y contractuales del trabajador.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Datos Personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="cedula" render={({ field }) => (
                        <FormItem><FormLabel>Nº Cédula</FormLabel><FormControl><Input placeholder="V-..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="nombres" render={({ field }) => (
                        <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="apellidos" render={({ field }) => (
                        <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="04xx-..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Habitación..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Contrato y Cargo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="workerType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Personal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="empleado">Empleado</SelectItem>
                                    <SelectItem value="obrero">Obrero</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="area" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Área/Departamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="cocina">Cocina</SelectItem>
                                    <SelectItem value="servicio">Servicio</SelectItem>
                                    <SelectItem value="limpieza">Limpieza</SelectItem>
                                    <SelectItem value="almacen">Almacén</SelectItem>
                                    <SelectItem value="equipos">Equipos</SelectItem>
                                    <SelectItem value="administracion">Administración</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FormField control={form.control} name="contractType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Contrato</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="indeterminado">Tiempo Indeterminado</SelectItem>
                                    <SelectItem value="determinado">Tiempo Determinado</SelectItem>
                                    <SelectItem value="prueba">Periodo de Prueba</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="creationDate" render={({ field }) => (
                        <FormItem><FormLabel>Fecha de Ingreso</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar Expediente</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
