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
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
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
    
    // This function creates/updates the user document in Firestore.
    // It's designed to be called only when a user successfully signs in or is created.
    const upsertUserDocument = async (firebaseUser: FirebaseAuthUser) => {
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // User document does not exist, create it (this is the first login for this user)
        // We'll create a superadmin by default for the first user.
        const newUser: User = {
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
        // Use a blocking set here to ensure the doc exists before navigating
        await setDoc(userRef, newUser);
      } else {
        // User document exists, just update last access time
        await setDoc(userRef, { lastAccess: serverTimestamp() }, { merge: true });
      }
    };

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserDocument(userCredential.user);
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      router.push('/');

    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
            // Attempt to create the user if they don't exist.
            // This is specific logic for bootstrapping the first superadmin account.
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            await upsertUserDocument(newUserCredential.user);
            toast({
                title: 'Cuenta de Super Admin Creada',
                description: 'La cuenta de administrador inicial ha sido creada. ¡Bienvenido!',
            });
            router.push('/');
        } catch (creationError: any) {
            let description = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
            if (creationError.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
            } else if (creationError.code !== 'auth/email-already-in-use') {
                description = 'Ocurrió un error inesperado al intentar crear la cuenta.'
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
