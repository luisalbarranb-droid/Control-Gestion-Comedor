
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
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, SquareCheck } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { resetUserPassword } from '@/firebase/auth-operations';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un email válido.'),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;


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
    if (!auth) return;
    setIsSubmitting(true);

    const superAdminPassword = 'password';
    const password = values.email === 'arvecladu@gmail.com' ? (values.password || superAdminPassword) : values.password;

    if (!password || password.length < 6) {
      form.setError('password', { message: 'La contraseña debe tener al menos 6 caracteres.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, values.email, password);
      // El listener onAuthStateChanged en useUser se encargará de la redirección
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de vuelta.',
      });
      // No es necesario llamar a router.push('/') aquí, el useEffect lo maneja.

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'Credenciales incorrectas o el usuario no existe. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
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
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Card>
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
                <div className="text-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    type="button"
                    onClick={async () => {
                      const email = form.getValues('email');
                      if (!email) {
                        form.setError('email', { message: 'Introduce tu email para restablecer la contraseña.' });
                        return;
                      }
                      const result = await resetUserPassword(email);
                      if (result.success) {
                        toast({ title: 'Correo Enviado', description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.' });
                      } else {
                        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar el correo. Verifica el email.' });
                      }
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <footer className="text-center space-y-1">
          <p className="text-xs text-muted-foreground font-semibold">
            © {new Date().getFullYear()} VELCAR, C.A. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-muted-foreground opacity-70">
            Diseñado y desarrollado por <span className="font-bold text-primary/80">Luis E. Albarrán B.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
