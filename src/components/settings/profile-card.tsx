'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';


const profileSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: 'Debes ingresar tu contraseña actual para cambiarla.',
    path: ['currentPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileCard() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: user, isLoading: isProfileLoading } = useDoc<User>(userDocRef, {
      disabled: !authUser || isAuthLoading
  });
  
  const isLoading = isAuthLoading || (authUser && isProfileLoading);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '',
        currentPassword: '',
        newPassword: '',
    }
  });
  
  const { formState: { isSubmitting } } = form;

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore) return;
    
    const dataToUpdate: Partial<User> = {
        name: data.name,
    };
    
    const userRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userRef, dataToUpdate);

    if (data.newPassword) {
        // In a real app, this should trigger a Firebase Auth function to reauthenticate and update the password.
        console.log('Password change requested. (Not implemented in prototype)');
        toast({
          title: 'Cambio de Contraseña',
          description: 'La funcionalidad de cambio de contraseña no está implementada en este prototipo.',
          variant: 'destructive',
        });
    }

    toast({
      title: 'Perfil Actualizado',
      description: 'Tu información ha sido guardada correctamente.',
    });
  };

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Perfil de Usuario</CardTitle>
                  <CardDescription>Cargando información de tu cuenta...</CardDescription>
              </CardHeader>
              <CardContent>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>
              Gestiona la información de tu cuenta personal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" disabled value={user?.email || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual</FormLabel>
                   <FormControl>
                    <Input {...field} type="password" placeholder="Deja en blanco para no cambiar" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                   <FormControl>
                    <Input {...field} type="password" placeholder="Deja en blanco para no cambiar" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
