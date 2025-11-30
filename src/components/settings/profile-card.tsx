'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ProfileCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
        <CardDescription>
          Gestiona la información de tu cuenta personal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" defaultValue="Carlos Ruiz" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue="carlos@comedor.com"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-password">Contraseña Actual</Label>
          <Input id="current-password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva Contraseña</Label>
          <Input id="new-password" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Guardar Cambios</Button>
      </CardFooter>
    </Card>
  );
};
