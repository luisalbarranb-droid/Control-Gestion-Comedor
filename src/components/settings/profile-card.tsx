'use client';

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
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido.'),
  email: z.string().email(),
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
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: '',
      email: '',
      currentPassword: '',
      newPassword: '',
    },
  });
  
  const { formState: { isSubmitting } } = form;

  // Set form values once user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        nombre: user.nombre,
        email: user.email,
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Updating profile:', data);

    toast({
      title: 'Perfil Actualizado',
      description: 'Tu información ha sido guardada correctamente.',
    });
  };

  if (isUserLoading) {
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
              name="nombre"
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
