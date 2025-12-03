
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
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  const upsertUserData = async (firebaseUser: FirebaseAuthUser) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // User document doesn't exist, create it as superadmin
      const newUser: Omit<User, 'lastAccess' | 'creationDate'> = {
        id: firebaseUser.uid,
        userId: firebaseUser.uid,
        email: firebaseUser.email!,
        name: 'Super Admin',
        role: 'superadmin',
        area: 'administracion',
        isActive: true,
        createdBy: 'system',
      };
      await setDoc(userRef, {
        ...newUser,
        creationDate: new Date(),
        lastAccess: new Date(),
      });
      console.log('Super Admin user document created:', firebaseUser.uid);
    } else {
       // User exists, ensure lastAccess is updated.
       // This could be expanded to migrate old data structures if needed.
       await setDoc(userRef, { lastAccess: new Date() }, { merge: true });
    }
  };

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

    try {
      // 1. Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserData(userCredential.user);
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      router.push('/');

    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 2. If user does not exist, create the account as superadmin
        try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            await upsertUserData(newUserCredential.user);
            toast({
                title: 'Cuenta de Super Admin Creada',
                description: 'La cuenta de administrador inicial ha sido creada. ¡Bienvenido!',
            });
            router.push('/');
        } catch (creationError: any) {
            console.error('Super Admin Creation Error:', creationError);
            toast({
                variant: 'destructive',
                title: 'Error Crítico en la Creación',
                description: 'No se pudo crear la cuenta de administrador. Revisa la consola.',
            });
        }
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         // 3. Handle incorrect password
         toast({
            variant: 'destructive',
            title: 'Credenciales Incorrectas',
            description: 'El correo o la contraseña no son válidos. Por favor, intenta de nuevo.',
         });
      } else {
        // 4. Handle other potential Firebase errors
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
