
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { PanelLeft, LogOut, User as UserIcon } from 'lucide-react';
import { MainNav } from './main-nav';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export function Header() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      
      {/* Menú Móvil */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <MainNav />
        </SheetContent>
      </Sheet>

      {/* Espaciador central */}
      <div className="relative ml-auto flex-1 md:grow-0">
      </div>

      {/* --- SECCIÓN DE USUARIO DEMO --- */}
      <div className="flex items-center gap-3">
        {/* Nombre y Rol */}
        <div className="hidden md:flex flex-col items-end mr-1">
            <span className="text-sm font-semibold text-gray-900">Admin Comedor</span>
            <span className="text-xs text-gray-500">Super Administrador</span>
        </div>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
            <UserIcon className="h-5 w-5 text-blue-700" />
        </div>

        {/* Botón Salir */}
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 ml-1"
            onClick={handleLogout}
        >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
        </Button>
      </div>

    </header>
  );
}
