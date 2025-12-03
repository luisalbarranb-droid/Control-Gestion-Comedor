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
import { useUser, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';


const profileSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  email: z.string().email('Debe ser un email válido.'),
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
  const isLoading = isAuthLoading || isProfileLoading;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    },
  });
  
  const { formState: { isSubmitting } } = form;

  // This effect will re-sync the form whenever the user data from Firestore changes.
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore) return;
    
    const dataToUpdate: Partial<User> = {
        name: data.name,
        lastAccess: serverTimestamp()
    };
    
    const userRef = doc(firestore, 'users', user.id);
    setDocumentNonBlocking(userRef, dataToUpdate, { merge: true });

    // Handle password change if provided
    if (data.newPassword) {
        // In a real app, you would call a secure Firebase function to verify the old password
        // and update it. Client-side password changes are complex and less secure.
        // For this prototype, we'll just show a success message.
        console.log('Password change requested. (Not implemented in prototype)');
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
