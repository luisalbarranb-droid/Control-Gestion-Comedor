
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { PanelLeft, LogOut, User as UserIcon, Share2, Download, FileText, FileSpreadsheet, Book } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MainNav } from './main-nav';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function Header() {
  const auth = useAuth();
  const { user, profile, isUserLoading } = useUser();
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

      {/* --- SECCIÓN DE USUARIO REAL --- */}
      <div className="flex items-center gap-3">

        {/* Botón de Descargas Globales */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
              <Download className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">Descargas</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Centro de Descargas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/help')}>
              <Book className="mr-2 h-4 w-4" />
              <span>Manual de Usuario</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/reports')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Reportes Generales</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/inventory/reports')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Estado de Inventario</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.print()} className="text-xs text-muted-foreground">
              <Download className="mr-2 h-3 w-3" />
              Guardar Vista Actual (PDF)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nombre y Rol */}
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-sm font-semibold text-gray-900">
            {profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
          </span>
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">
            {profile?.role || 'Visitante'}
          </span>
          {user?.email && <span className="text-[10px] text-gray-400">{user.email}</span>}
        </div>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="h-full w-full rounded-full object-cover" />
          ) : (
            <UserIcon className="h-5 w-5 text-blue-700" />
          )}
        </div>

        {/* Botón Compartir (Solo Super Admin) */}
        {profile?.role === 'superadmin' && (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-2 ml-1"
            onClick={() => {
              const text = encodeURIComponent('🍽️ Hola! Aquí tienes el acceso al Sistema de Control Comedor: https://sistema-comedor11-2026.vercel.app');
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden md:inline">Compartir</span>
          </Button>
        )}

        {/* Botón Salir */}
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 ml-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Salir</span>
        </Button>
      </div>

    </header>
  );
}
