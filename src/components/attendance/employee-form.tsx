'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { User, Role, AreaId, WorkerType, ContractType } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';

const employeeSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  cedula: z.string().min(6, 'La cédula es requerida.'),
  email: z.string().email('Email no válido.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['comun', 'admin', 'superadmin']),
  area: z.string().optional(),
  workerType: z.enum(['obrero', 'empleado']),
  contractType: z.enum(['determinado', 'indeterminado', 'prueba']),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
}

export function EmployeeForm({ isOpen, onOpenChange, employee }: EmployeeFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      cedula: '',
      email: '',
      phone: '',
      address: '',
      role: 'comun',
      area: undefined,
      workerType: 'obrero',
      contractType: 'indeterminado',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name || '',
        cedula: employee.cedula || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        role: employee.role || 'comun',
        area: employee.area || undefined,
        workerType: employee.workerType || 'obrero',
        contractType: employee.contractType || 'indeterminado',
      });
    } else {
      form.reset();
    }
  }, [employee, isOpen, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    if (!firestore) return;
    try {
      if (employee) {
        // Update
        const employeeRef = doc(firestore, 'users', employee.id);
        updateDocumentNonBlocking(employeeRef, values);
        toast({ title: 'Empleado actualizado', description: `${values.name} ha sido actualizado.` });
      } else {
        // Create
        const collectionRef = collection(firestore, 'users');
        const newEmployeeData = {
          ...values,
          isActive: true,
          creationDate: serverTimestamp(),
        };
        addDocumentNonBlocking(collectionRef, newEmployeeData);
        toast({ title: 'Empleado creado', description: `${values.name} ha sido agregado.` });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el empleado.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Actualiza los datos del empleado.' : 'Completa el formulario para registrar un nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="cedula" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Cédula</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="role" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol en el Sistema</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="comun">Común</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="area" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Trabajo</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar área..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="workerType" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Trabajador</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="obrero">Obrero</SelectItem>
                      <SelectItem value="empleado">Empleado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="contractType" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="indeterminado">Indeterminado</SelectItem>
                      <SelectItem value="determinado">Determinado</SelectItem>
                      <SelectItem value="prueba">Prueba</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
