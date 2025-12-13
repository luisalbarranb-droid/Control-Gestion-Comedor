'use client';

import { useEffect, useState } from 'react';
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
import { useAuth, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { createUserAccount } from '@/firebase/auth-operations';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';
import { DatePicker } from '../ui/datepicker';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { uploadProfilePicture } from '@/actions/upload-actions';


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
  fechaIngreso: z.date().optional(),
  fechaNacimiento: z.date().optional(),
  diasContrato: z.coerce.number().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
}

const convertToDate = (date: any): Date | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date;
    if (date instanceof Timestamp) return date.toDate();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? undefined : parsed;
}

const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';


export function EmployeeForm({ isOpen, onOpenChange, employee }: EmployeeFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
      fechaIngreso: undefined,
      fechaNacimiento: undefined,
      diasContrato: 0,
      avatarUrl: '',
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
        fechaIngreso: convertToDate(employee.fechaIngreso),
        fechaNacimiento: convertToDate(employee.fechaNacimiento),
        diasContrato: employee.diasContrato || 0,
        avatarUrl: employee.avatarUrl || '',
      });
      setPreviewUrl(employee.avatarUrl || null);
    } else {
      form.reset({
        name: '',
        cedula: '',
        email: '',
        phone: '',
        address: '',
        role: 'comun',
        area: undefined,
        workerType: 'obrero',
        contractType: 'indeterminado',
        fechaIngreso: new Date(),
        fechaNacimiento: undefined,
        diasContrato: 0,
        avatarUrl: '',
      });
      setPreviewUrl(null);
    }
    setPhotoFile(null);
  }, [employee, isOpen, form]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }


  const onSubmit = async (values: EmployeeFormValues) => {
    if (!firestore || !auth) return;
    setIsUploading(true);
    
    try {
      let docId: string;
      let finalAvatarUrl = values.avatarUrl;

      if (employee) { // --- UPDATE EXISTING USER ---
        docId = employee.id;
        if (photoFile) {
          const { url, error } = await uploadProfilePicture(docId, photoFile);
          if (error || !url) throw new Error(error || "No se pudo obtener la URL de la imagen.");
          finalAvatarUrl = url;
        }

        const dataToUpdate = { ...values, avatarUrl: finalAvatarUrl };
        const employeeRef = doc(firestore, 'users', docId);
        await updateDocumentNonBlocking(employeeRef, dataToUpdate);
        
        toast({ title: 'Empleado actualizado', description: `${values.name} ha sido actualizado.` });

      } else { // --- CREATE NEW USER ---
        // 1. Create authentication account first
        const { user: newUserAuth, error: authError } = await createUserAccount(values.email);
        if (authError || !newUserAuth) {
            throw new Error(authError || 'No se pudo crear la cuenta de autenticación.');
        }
        docId = newUserAuth.uid;

        // 2. Upload photo if it exists
        if (photoFile) {
          const { url, error } = await uploadProfilePicture(docId, photoFile);
          if (error || !url) throw new Error(error || "No se pudo obtener la URL de la imagen.");
          finalAvatarUrl = url;
        }

        // 3. Prepare Firestore document data
        const newEmployeeData: User = {
          ...values,
          id: docId,
          userId: docId,
          avatarUrl: finalAvatarUrl,
          isActive: true, 
          creationDate: serverTimestamp(),
          createdBy: auth.currentUser?.uid || 'system',
        };

        // 4. Save Firestore document
        const employeeRef = doc(firestore, 'users', docId);
        await setDocumentNonBlocking(employeeRef, newEmployeeData);
        
        toast({ 
            title: 'Empleado Creado Exitosamente', 
            description: `${values.name} ha sido agregado. La contraseña temporal es "password".`
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({ variant: 'destructive', title: 'Error al Guardar', description: error.message || 'No se pudo completar la operación.' });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Actualiza los datos del empleado.' : 'Completa el formulario para registrar un nuevo empleado en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-2 border-dashed">
                    <AvatarImage src={previewUrl || undefined} alt={form.getValues('name')} />
                    <AvatarFallback className="text-3xl">
                        {getUserInitials(form.getValues('name'))}
                    </AvatarFallback>
                </Avatar>
                <div className="flex gap-4 items-center">
                    <Button type="button" variant="outline" asChild>
                        <label htmlFor="photo-upload" className="cursor-pointer">
                            <Camera className="mr-2 h-4 w-4" />
                            Subir Foto
                            <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </Button>
                    <FormField
                        name="avatarUrl"
                        control={form.control}
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field} placeholder="O pega una URL de imagen" className="w-64"/>
                            </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

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
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!employee} /></FormControl><FormMessage /></FormItem>
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
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField name="fechaIngreso" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Fecha de Ingreso</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>
              )} />
               <FormField name="fechaNacimiento" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>
              )} />
               <FormField name="diasContrato" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Días de Contrato</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
