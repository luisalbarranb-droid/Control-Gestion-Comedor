
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, SquareCheck } from 'lucide-react';
import { signInWithCustomToken } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un email válido.'),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Función para simular la obtención de un token personalizado desde un backend
// En un entorno real, esto sería una llamada a un endpoint seguro.
const getMockSuperAdminToken = async (auth: any, uid: string) => {
    // Esta es una simulación. En producción, NUNCA expongas tu clave de servicio.
    // Aquí solo simulamos que el backend nos da un token para el UID del superadmin.
    // Como no podemos generar un token real en el cliente, usamos un truco:
    // iniciamos sesión anónimamente para obtener un estado de auth válido y luego
    // navegamos, asumiendo que el perfil se cargará con el rol correcto.
    console.warn("MODO DE SIMULACIÓN: No se está generando un token de superadmin real.");
    
    // Para que el frontend se comporte como si tuviera el rol, lo "inyectamos"
    // en el perfil del usuario después del login.
    return { mockRole: 'superadmin' };
};


export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading, profile } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    
    // Contraseña por defecto para el superadmin en modo de prueba
    const superAdminPassword = 'password';

    if (values.email === 'arvecladu@gmail.com') {
      try {
        await initiateEmailSignIn(auth, values.email, values.password || superAdminPassword);
        
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          unsubscribe();
          if (firebaseUser) {
              toast({
                title: 'Inicio de Sesión de Superadmin',
                description: 'Has ingresado como Super Administrador.',
              });
              router.push('/');
          }
           setIsSubmitting(false);
        });

      } catch (error) {
        setIsSubmitting(false);
        toast({
            variant: 'destructive',
            title: 'Error de Superadmin',
            description: 'Credenciales incorrectas o el usuario no existe. La contraseña por defecto es "password".',
        });
        console.error(error);
      }
      return;
    }

    if (!values.password || values.password.length < 6) {
        form.setError('password', { message: 'La contraseña debe tener al menos 6 caracteres.' });
        setIsSubmitting(false);
        return;
    }
    
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      
      const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
        unsubscribe();
        setIsSubmitting(false);
        if (firebaseUser) {
          toast({
            title: 'Inicio de sesión exitoso',
            description: 'Bienvenido de vuelta.',
          });
           router.push('/');
        }
      });
      
    } catch (error: any) {
        setIsSubmitting(false);
        toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: 'Credenciales incorrectas. Por favor, inténtalo de nuevo.',
        });
        console.error(error);
    }
  };
  
   if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto flex items-center gap-2 mb-4">
               <SquareCheck className="size-10 text-primary" />
               <h1 className="font-headline text-3xl font-bold">Comedor</h1>
            </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta para gestionar el comedor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
