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
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, useUser, useCollection, createUserAccount } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { User, ModuleId, AreaId, Comedor } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';
import { Checkbox } from '../ui/checkbox';
import { navItems } from '../dashboard/main-nav';
import { useMultiTenant } from '@/providers/multi-tenant-provider';

const userSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  email: z.string().email('Email no válido.'),
  role: z.enum(['comun', 'admin', 'superadmin']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional(),
  comedorId: z.string().optional(),
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
  const { user: authUser } = useUser();
  const { activeComedorId, isSuperAdmin } = useMultiTenant();
  const { toast } = useToast();

  // Fetch comedores list for SuperAdmin assignment
  const comedoresQuery = isSuperAdmin && firestore ? collection(firestore, 'comedores') : null;
  const { data: comedoresList } = useCollection<Comedor>(comedoresQuery as any, { disabled: !isSuperAdmin || !firestore });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'comun',
      comedorId: activeComedorId || '',
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
        comedorId: editingUser.comedorId || '',
        area: editingUser.area || undefined,
        areas: editingUser.areas || [],
        modules: editingUser.modules || [],
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'comun',
        comedorId: activeComedorId || '',
        area: undefined,
        areas: [],
        modules: [],
      });
    }
  }, [editingUser, isOpen, form, activeComedorId]);

  const onSubmit = async (values: UserFormValues) => {
    if (!firestore || !authUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'No autenticado o sin conexión a la base de datos.' });
      return;
    }

    let dataToSave: any = {
      name: values.name,
      email: values.email,
      role: values.role,
      comedorId: values.comedorId || activeComedorId || null,
    };

    if (values.role === 'admin') {
      dataToSave.areas = values.areas as AreaId[] || [];
      dataToSave.modules = values.modules as ModuleId[] || [];
    } else if (values.role === 'comun') {
      if (values.area) {
        dataToSave.area = values.area as AreaId;
      }
    }

    try {
      if (editingUser) {
        const userRef = doc(firestore, 'users', editingUser.id);
        await updateDocumentNonBlocking(userRef, dataToSave);
        toast({ title: 'Usuario actualizado', description: `${values.name} ha sido actualizado.` });
      } else {
        const isSelfCreation = values.email === authUser.email;

        // 1. Create the Auth account first if not self-creation
        let finalUserId: string;

        if (!isSelfCreation) {
          if (!values.password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes asignar una contraseña para el nuevo usuario.' });
            return;
          }

          const { user: newUserAuth, error: authError } = await createUserAccount(values.email, values.password);

          if (authError) {
            // Si el error es que ya existe en Auth, intentamos proceder de todas formas
            // para recrear el documento en Firestore si es que falta.
            if (authError.includes('ya está en uso')) {
              console.log('El usuario ya existe en Auth, procediendo a intentar crear el perfil en Firestore...');
              // Nota: En este estado no tenemos el UID directamente del 'createUserAccount' fallido
              // pero como es una situación excepcional, informamos al usuario.
              toast({
                variant: 'default',
                title: 'Cuenta existente detectada',
                description: 'La cuenta de acceso ya existe. Intentaremos vincular el perfil de datos.'
              });

              // Intentamos obtener el ID de alguna manera o simplemente lanzamos error con guía
              throw new Error('El usuario ya tiene una cuenta de seguridad. Por favor, elimínalo primero de la Consola de Firebase o contacta a soporte para sincronizar el ID.');
            }
            throw new Error(authError || 'No se pudo crear la cuenta de autenticación.');
          }
          finalUserId = newUserAuth!.user.uid;
        } else {
          finalUserId = authUser.uid;
        }

        // 2. Create the Firestore document
        const userRef = doc(firestore, 'users', finalUserId);

        const newUserData: Partial<User> = {
          ...dataToSave,
          id: finalUserId,
          userId: finalUserId,
          isActive: true,
          creationDate: serverTimestamp(),
          createdBy: authUser.uid
        };

        await setDocumentNonBlocking(userRef, newUserData);

        let toastDescription = `Se ha creado una cuenta para ${values.name}.`;
        if (!isSelfCreation) {
          toastDescription += ` Ya puede ingresar con su correo y la clave asignada.`;
        }

        toast({ title: 'Usuario creado', description: toastDescription });
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({ variant: 'destructive', title: 'Error al procesar', description: error.message || 'No se pudo completar el registro.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario del Sistema'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Actualiza los datos y permisos del usuario.' : 'Completa el formulario para registrar un nuevo usuario y su rol.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!editingUser} /></FormControl><FormMessage /></FormItem>
            )} />
            {!editingUser && (
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Inicial</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <p className="text-[10px] text-muted-foreground">Esta será la clave con la que el usuario ingresará por primera vez.</p>
                  <FormMessage />
                </FormItem>
              )} />
            )}
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

            {isSuperAdmin && (
              <FormField
                name="comedorId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sede / Comedor Asignado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar comedor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {comedoresList?.map((comedor) => (
                          <SelectItem key={comedor.id} value={comedor.id}>
                            {comedor.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-semibold">Permisos de Administrador</h3>
                <FormField
                  control={form.control}
                  name="areas"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Áreas Asignadas</FormLabel>
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
                        {navItems.filter(navItem => navItem.id && navItem.id !== 'users').map((item) => (
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
              <div className="space-y-4 rounded-md border p-4 bg-amber-50 border-amber-200">
                <p className="text-sm text-amber-800">
                  El rol de <strong>Superadmin</strong> tiene acceso completo a todas las áreas y módulos por defecto. No se requiere configuración de permisos.
                </p>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
