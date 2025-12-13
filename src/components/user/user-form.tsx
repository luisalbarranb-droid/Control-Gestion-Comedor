'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import type { User, Role, ModuleId } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';
import { Checkbox } from '../ui/checkbox';
import { navItems } from '../dashboard/main-nav';
import { Separator } from '../ui/separator';

const userSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  email: z.string().email('Email no válido.'),
  role: z.enum(['comun', 'admin', 'superadmin']),
  area: z.string().optional(),
  areas: z.array(z.string()).optional(),
  modules: z.array(z.string()).optional(),
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
      areas: [],
      modules: [],
    },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'comun',
        area: editingUser.area || undefined,
        areas: editingUser.areas || [],
        modules: editingUser.modules || [],
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'comun',
        area: undefined,
        areas: [],
        modules: [],
      });
    }
  }, [editingUser, isOpen, form]);
  
  const onSubmit = async (values: UserFormValues) => {
    if (!firestore) return;
    
    let dataToSave: Partial<User> = {
        name: values.name,
        email: values.email,
        role: values.role,
        modules: values.modules,
    };

    if (values.role === 'admin') {
        dataToSave.areas = values.areas;
        dataToSave.area = undefined; // Clear single area field
    } else if (values.role === 'comun') {
        dataToSave.area = values.area;
        dataToSave.areas = undefined; // Clear multiple areas field
        dataToSave.modules = undefined; // Comun users don't need module access list
    } else { // superadmin
        dataToSave.area = undefined;
        dataToSave.areas = undefined;
        dataToSave.modules = undefined; // Superadmin has access to all
    }

    try {
      if (editingUser) {
        const userRef = doc(firestore, 'users', editingUser.id);
        updateDocumentNonBlocking(userRef, dataToSave);
        toast({ title: 'Usuario actualizado', description: `${values.name} ha sido actualizado.` });
      } else {
        const collectionRef = collection(firestore, 'users');
        const newUserData = {
          ...dataToSave,
          isActive: true,
          creationDate: serverTimestamp(),
        };
        addDocumentNonBlocking(collectionRef, newUserData as any);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Actualiza los datos y permisos del usuario.' : 'Completa el formulario para registrar un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
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

            {selectedRole === 'comun' && (
                 <FormField name="area" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Área de Trabajo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar área..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            )}

            {selectedRole === 'admin' && (
                <div className="space-y-4">
                    <Separator />
                    <FormField
                        control={form.control}
                        name="areas"
                        render={() => (
                            <FormItem>
                                <FormLabel className="text-base">Áreas de Trabajo Asignadas</FormLabel>
                                <div className="p-3 border rounded-md grid grid-cols-2 gap-2">
                                    {areas.map((area) => (
                                    <FormField
                                        key={area.id}
                                        control={form.control}
                                        name="areas"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={area.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(area.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), area.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== area.id
                                                            )
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {area.nombre}
                                            </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="modules"
                        render={() => (
                            <FormItem>
                                <FormLabel className="text-base">Acceso a Módulos</FormLabel>
                                <div className="p-3 border rounded-md grid grid-cols-2 gap-2">
                                    {navItems.filter(navItem => navItem.id).map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="modules"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id as ModuleId)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== item.id
                                                            )
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {item.label}
                                            </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {selectedRole === 'superadmin' && (
                 <FormItem>
                    <FormLabel>Permisos</FormLabel>
                    <FormControl>
                        <Input disabled value="Acceso total a todas las áreas y módulos" />
                    </FormControl>
                </FormItem>
            )}
            
            <DialogFooter className="pt-4">
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
