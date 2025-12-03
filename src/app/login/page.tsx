'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(
    (image) => image.id === 'login-background'
  );
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [email, setEmail] = useState('arvecladu@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error de configuración',
            description: 'El servicio de autenticación o base de datos no está disponible.',
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            const userDocRef = doc(firestore, 'users', newUser.uid);
            
            // CORRECTED: Use the exact field names from the User type
            setDocumentNonBlocking(userDocRef, {
                id: newUser.uid,
                userId: newUser.uid,
                email: email,
                name: 'Super Admin',
                role: 'superadmin', // CORRECTED from 'role'
                area: 'administracion',
                isActive: true,
                creationDate: serverTimestamp(),
                createdBy: 'system',
                lastAccess: serverTimestamp(),
            }, { merge: false });

            toast({
                title: 'Cuenta de Super Admin Creada',
                description: 'La cuenta de administrador inicial ha sido creada. Por favor, inicia sesión de nuevo.',
            });
            
        } catch (creationError: any) {
            console.error('User Creation Error:', creationError);
            let description = 'No se pudo crear la cuenta de administrador. Revisa la consola para más detalles.';
            if (creationError.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
            } else if (creationError.code === 'auth/email-already-in-use') {
                description = 'Este correo electrónico ya está en uso por otra cuenta.';
            }
            toast({
                variant: 'destructive',
                title: 'Error Crítico en la Creación',
                description: description,
            });
        }
      } else {
         console.error('Firebase Auth Error:', error);
         toast({
            variant: 'destructive',
            title: 'Credenciales Incorrectas',
            description: 'El correo o la contraseña no son válidos. Por favor, intenta de nuevo.',
         });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Comedor Control</h1>
            <p className="text-balance text-muted-foreground">
              Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="#" className="underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            data-ai-hint={loginBg.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>
    </div>
  );
}
