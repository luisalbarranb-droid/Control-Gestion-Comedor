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
import { useToast } from '@/components/ui/toast';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { User, Role } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';

const userSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  email: z.string().email('Email no válido.'),
  role: z.enum(['comun', 'admin', 'superadmin']),
  area: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
}

export function UserForm({ isOpen, onOpenChange, editingUser }: UserFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'comun',
      area: undefined,
    },
  });

  const selectedRole = form.watch('role');
  const isSuperAdmin = selectedRole === 'superadmin';

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'comun',
        area: editingUser.role === 'superadmin' ? undefined : editingUser.area || undefined,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'comun',
        area: undefined,
      });
    }
  }, [editingUser, isOpen, form]);
  
  useEffect(() => {
    if (isSuperAdmin) {
      form.setValue('area', undefined);
    }
  }, [isSuperAdmin, form]);

  const onSubmit = async (values: UserFormValues) => {
    if (!firestore) return;
    
    const dataToSave = {
        ...values,
        area: isSuperAdmin ? undefined : values.area,
    };

    try {
      if (editingUser) {
        // Update
        const userRef = doc(firestore, 'users', editingUser.id);
        updateDocumentNonBlocking(userRef, dataToSave);
        toast({ title: 'Usuario actualizado', description: `${values.name} ha sido actualizado.` });
      } else {
        // Create
        const collectionRef = collection(firestore, 'users');
        const newUserData = {
          ...dataToSave,
          isActive: true,
          creationDate: serverTimestamp(),
        };
        addDocumentNonBlocking(collectionRef, newUserData);
        toast({ title: 'Usuario creado', description: `${values.name} ha sido agregado.` });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el usuario.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Actualiza los datos del usuario.' : 'Completa el formulario para registrar un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
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
                 <Select onValueChange={field.onChange} value={field.value} disabled={isSuperAdmin}>
                  <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={isSuperAdmin ? "Acceso a todas las áreas" : "Seleccionar área..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
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
