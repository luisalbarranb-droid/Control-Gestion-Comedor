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

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un email válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
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
    try {
      // We are not awaiting this, the useUser hook will handle the redirect
      initiateEmailSignIn(auth, values.email, values.password);
      
      // We add a listener to catch auth errors specifically for this form
      const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
        unsubscribe(); // Unsubscribe immediately after first trigger
        setIsSubmitting(false);
        if (firebaseUser) {
          toast({
            title: 'Inicio de sesión exitoso',
            description: 'Bienvenido de vuelta.',
          });
           router.push('/');
        } else {
          // This part might not be triggered if the error is caught by the catch block first.
          // It's a fallback.
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
