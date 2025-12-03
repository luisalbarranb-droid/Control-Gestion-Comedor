'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';


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
            description: 'El servicio de autenticación no está disponible.',
        });
        setIsLoading(false);
        return;
    }
    
    const upsertSuperAdmin = async (firebaseUser: FirebaseAuthUser) => {
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      
      const userData: Partial<User> = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: 'Super Admin',
        role: 'superadmin',
        area: 'administracion',
        isActive: true,
        createdBy: 'system',
        creationDate: serverTimestamp(),
        lastAccess: serverTimestamp(),
      };
  
      // Use setDoc with merge:true to create or update.
      await setDoc(userRef, userData, { merge: true });
      console.log('Super Admin user document ensured:', firebaseUser.uid);
    };

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await upsertSuperAdmin(userCredential.user);
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      router.push('/');

    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
            // If user does not exist, or creds are wrong for an existing user but we want to bootstrap a superadmin...
            // We attempt to create it. If it already exists and pw is wrong, this will fail as 'auth/email-already-in-use'.
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            await upsertSuperAdmin(newUserCredential.user);
            toast({
                title: 'Cuenta de Super Admin Creada',
                description: 'La cuenta de administrador inicial ha sido creada. ¡Bienvenido!',
            });
            router.push('/');
        } catch (creationError: any) {
            console.error('Super Admin Creation/Login Error:', creationError);
            let description = 'Ocurrió un error inesperado.';
            if (creationError.code === 'auth/email-already-in-use') {
                description = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
            } else if (creationError.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
            }
            toast({
                variant: 'destructive',
                title: 'Error de Autenticación',
                description: description,
            });
        }
      } else {
        console.error('Firebase Auth Error:', error);
        toast({
            variant: 'destructive',
            title: 'Error de Autenticación',
            description: 'Ocurrió un error inesperado. Por favor, intenta más tarde.',
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
              Inicia sesión para gestionar tu comedor
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
                <Label htmlFor="password">Contraseña</Label>
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
