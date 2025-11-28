import Image from 'next/image';
import Link from 'next/link';
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

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(
    (image) => image.id === 'login-background'
  );
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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
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
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </div>
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
