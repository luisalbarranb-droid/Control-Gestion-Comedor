
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProfileCard } from '@/components/settings/profile-card';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';


export default function SettingsPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const role = currentUser?.rol;
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
          
          <Tabs defaultValue="profile" className="flex-1">
            <TabsList className={isAdmin ? "grid w-full grid-cols-4" : "grid w-full grid-cols-3"}>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="appearance">Apariencia</TabsTrigger>
              {isAdmin && <TabsTrigger value="areas">Áreas</TabsTrigger>}
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
                  </div>
                </CardContent>
                 <CardFooter>
                  <Button>Guardar Preferencias</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            {isAdmin && (
              <TabsContent value="areas">
                 <Card>
                  <CardHeader>
                    <CardTitle>Áreas de Trabajo</CardTitle>
                    <CardDescription>
                      Gestiona las áreas de trabajo de tu equipo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Aquí se mostrará la gestión de áreas.</p>
                  </CardContent>
                   <CardFooter>
                    <Button>Añadir Área</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>
                    Elige cómo quieres recibir notificaciones.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">Aquí se mostrará la configuración de notificaciones.</p>
                </CardContent>
                 <CardFooter>
                  <Button>Guardar Ajustes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  );
}
