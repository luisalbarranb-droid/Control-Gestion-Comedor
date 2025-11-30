'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUserRole } from '@/hooks/use-user-role';
import { ProfileCard } from '@/components/settings/profile-card';

export default function SettingsPage() {
  const { role } = useUserRole();
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Configuración
            </h1>
          </div>
          
          {isAdmin ? (
            <Tabs defaultValue="profile" className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="appearance">Apariencia</TabsTrigger>
                <TabsTrigger value="areas">Áreas</TabsTrigger>
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileCard />
              </TabsContent>
              <TabsContent value="appearance">
                 <Card>
                  <CardHeader>
                    <CardTitle>Apariencia</CardTitle>
                    <CardDescription>
                      Personaliza el aspecto de la aplicación.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                       <p className="text-sm text-muted-foreground">Selecciona el tema para el dashboard.</p>
                       {/* Aquí irá el selector de tema (claro/oscuro) */}
                    </div>
                  </CardContent>
                   <CardFooter>
                    <Button>Guardar Preferencias</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="areas">
                 <Card>
                  <CardHeader>
                    <CardTitle>Áreas de Trabajo</CardTitle>
                    <CardDescription>
                      Gestiona las áreas de trabajo de tu equipo. (Solo Admins)
                    </CardDescription>
                  </Header>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Aquí se mostrará la gestión de áreas.</p>
                  </CardContent>
                   <CardFooter>
                    <Button>Añadir Área</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>
                      Elige cómo quieres recibir notificaciones.
                    </CardDescription>
                  </Header>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">Aquí se mostrará la configuración de notificaciones.</p>
                  </CardContent>
                   <CardFooter>
                    <Button>Guardar Ajustes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
             <ProfileCard />
          )}

        </main>
      </SidebarInset>
    </div>
  );
}
