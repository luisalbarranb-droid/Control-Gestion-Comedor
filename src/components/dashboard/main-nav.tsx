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
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
      label: isStudio ? '👑 Gestión de Usuarios' : 'Gestión de Usuarios', 
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
      {/* Logo */}
       <SidebarHeader className="p-4 justify-center flex items-center gap-2">
        <div className={`${isStudio ? 'h-10 w-10' : 'h-8 w-8'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-xl">🍽️</span>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`h-2 w-2 rounded-full ${isStudio ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-xs text-muted-foreground">
              {isStudio ? 'Firebase Studio' : 'Desarrollo Local'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navegación */}
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
                     className={`w-full justify-start ${item.highlight ? 'border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                     {item.highlight && (
                        <span className="ml-auto">
                          <span className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></span>
                        </span>
                      )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Perfil y logout */}
      <div className="p-4 border-t">
        <div className="space-y-4">
          {/* Perfil del usuario */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            </div>
          )}

          {/* Botón de logout */}
          {!isStudio && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
       <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
