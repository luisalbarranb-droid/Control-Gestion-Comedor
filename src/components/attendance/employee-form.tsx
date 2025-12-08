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

// Esquema de validación con todos los campos solicitados
const employeeSchema = z.object({
  cedula: z.string().min(1, 'La cédula es obligatoria'),
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  tipo: z.enum(['empleado', 'obrero']),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  genero: z.enum(['masculino', 'femenino']),
  fechaIngreso: z.string().min(1, 'Fecha requerida'),
  departamento: z.string().min(1, 'Departamento requerido'),
  tipoContrato: z.enum(['determinado', 'indeterminado', 'prueba']),
  diasContrato: z.coerce.number().optional(),
  contratoUrl: z.string().optional(),
});

interface EmployeeFormProps {
  onSave: (data: any) => void;
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
      tipo: 'empleado',
      telefono: '',
      direccion: '',
      genero: 'masculino',
      fechaIngreso: new Date().toISOString().split('T')[0],
      departamento: '',
      tipoContrato: 'indeterminado',
      diasContrato: 0,
      contratoUrl: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof employeeSchema>) => {
    onSave(values);
    form.reset();
  };

  const tipoContrato = form.watch('tipoContrato');

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
            
            {/* Sección 1: Datos Personales */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="genero" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Género</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="femenino">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="04xx-..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="direccion" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Habitación..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Sección 2: Datos Laborales */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Contrato y Cargo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="tipo" render={({ field }) => (
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
                    <FormField control={form.control} name="departamento" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="cocina">Cocina</SelectItem>
                                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                    <SelectItem value="administracion">Administración</SelectItem>
                                    <SelectItem value="logistica">Logística</SelectItem>
                                    <SelectItem value="rrhh">RRHH</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField control={form.control} name="tipoContrato" render={({ field }) => (
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
                    
                    {(tipoContrato === 'determinado' || tipoContrato === 'prueba') && (
                        <FormField control={form.control} name="diasContrato" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duración (Días)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}

                    <FormField control={form.control} name="fechaIngreso" render={({ field }) => (
                        <FormItem><FormLabel>Fecha de Ingreso</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>

            {/* Sección 3: Documentos */}
            <div className="border-2 border-dashed rounded-lg p-6 bg-blue-50/50 flex flex-col items-center justify-center text-center mt-4">
                <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <FormLabel className="mb-1 cursor-pointer">Cargar Contrato Firmado (PDF)</FormLabel>
                <p className="text-xs text-gray-500 mb-3">Sube el documento digitalizado del contrato</p>
                <Input 
                    type="file" 
                    accept=".pdf" 
                    className="max-w-xs text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            form.setValue('contratoUrl', e.target.files[0].name);
                        }
                    }}
                />
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