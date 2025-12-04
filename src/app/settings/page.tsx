
'use client';

import { ProfileCard } from '@/components/settings/profile-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <h1 className="font-headline text-2xl font-bold md:text-3xl">
        Configuración
      </h1>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileCard />
        </TabsContent>
        <TabsContent value="areas">
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Áreas</CardTitle>
                    <CardDescription>
                        Administra las áreas de trabajo del comedor. (Visible solo para administradores)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="appearance">
             <Card>
                <CardHeader>
                    <CardTitle>Apariencia</CardTitle>
                    <CardDescription>
                       Personaliza la apariencia de la aplicación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>
                        Gestiona tus preferencias de notificación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Funcionalidad en construcción.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
