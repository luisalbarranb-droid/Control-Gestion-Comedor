
// src/components/dashboard/main-nav.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Settings,
  ClipboardList,
  AreaChart,
  Archive,
  BookOpen,
  ClipboardCheck,
  QrCode,
  FileSpreadsheet,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { useSmartAuth } from '@/providers/SmartAuthProvider';
import { Environment } from '@/lib/environment';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';


export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, environment } = useSmartAuth();
  const isStudio = Environment.isFirebaseStudio();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home />, show: true },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList />, show: true },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode />, show: true },
    { href: '/menus', label: 'Menus', icon: <BookOpen />, show: true },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck />, show: true },
    { href: '/inventory', label: 'Inventario', icon: <Archive />, show: true },
    { 
      href: '/users', 
      label: 'Gestión de Usuarios', 
      icon: <Users />, 
      show: user?.role === 'superadmin' || user?.role === 'admin',
      highlight: isStudio
    },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet />, show: true },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart />, show: true },
    { href: '/settings', label: 'Configuración', icon: <Settings />, show: user?.role === 'superadmin' },
  ];

  const filteredItems = navItems.filter(item => item.show);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="h-full flex flex-col">
       <SidebarHeader className="p-4 justify-center flex items-center gap-2">
        <div className={'h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'}>
          <span className="text-white font-bold text-xl">🍽️</span>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <SidebarMenuItem key={item.href}>
                 <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                     isActive={isActive}
                     className={'w-full justify-start'}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <div className="p-4 border-t mt-auto">
          {!isStudio && user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          )}
           {isStudio && (
             <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Firebase Studio</span>
                </div>
                 <p className="text-xs mt-1">Auth simulada como <strong>{user?.role}</strong>.</p>
             </div>
           )}
      </div>
    </div>
  );
}
