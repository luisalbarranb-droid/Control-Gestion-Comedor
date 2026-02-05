
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
import { useToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, auth } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { updateCurrentUserPassword } from '@/firebase/auth-operations';


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

  const { data: user, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

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

    try {
      const dataToUpdate: Partial<User> = {
        name: data.name,
      };

      const userRef = doc(firestore, 'users', user.id);
      await updateDocumentNonBlocking(userRef, dataToUpdate);

      if (data.newPassword && data.currentPassword) {
        const result = await updateCurrentUserPassword(data.currentPassword, data.newPassword);
        if (!result.success) {
          toast({
            title: 'Error de Contraseña',
            description: result.error || 'No se pudo actualizar la contraseña.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Contraseña Actualizada',
          description: 'Tu contraseña ha sido cambiada correctamente.',
        });
      }

      toast({
        title: 'Perfil Actualizado',
        description: 'Tu información ha sido guardada correctamente.',
      });

      form.setValue('currentPassword', '');
      form.setValue('newPassword', '');

    } catch (e: any) {
      console.error("Error updating profile:", e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
      });
    }
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

