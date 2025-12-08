'use client';

import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck, Save, User, Sun, Moon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Usamos la importación que funcionó en Asistencia
import { useUser } from '@/firebase';

export default function SettingsPage() {
  const { profile } = useUser();
  const [theme, setTheme] = useState('light');

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
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
            
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl text-gray-900">Configuración</h1>
                    <p className="text-gray-500">Administra tus preferencias y cuenta.</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                </Button>
            </div>

            {/* Tarjeta de Perfil */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Perfil de Usuario</h2>
                        <p className="text-sm text-gray-500">Información personal y de contacto</p>
                    </div>
                </div>
                <div className="p-6 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" placeholder="Tu nombre" defaultValue={profile?.displayName || "Usuario Demo"} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" defaultValue={profile?.email || "usuario@ejemplo.com"} disabled className="bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol del Sistema</Label>
                            <Input id="role" defaultValue={profile?.role || "Administrador"} disabled className="bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tarjeta de Apariencia */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <Sun className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Apariencia</h2>
                        <p className="text-sm text-gray-500">Personaliza cómo ves la aplicación</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-orange-100 text-orange-600' : 'bg-slate-800 text-white'}`}>
                                {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-medium">Modo {theme === 'light' ? 'Claro' : 'Oscuro'}</p>
                                <p className="text-sm text-gray-500">Alternar entre temas visuales</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
      </SidebarInset>
    </div>
  );
}