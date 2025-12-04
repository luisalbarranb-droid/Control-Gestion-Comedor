'use client';

import { usePathname } from 'next/navigation';
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
  FileSpreadsheet
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUser } from '@/firebase';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function MainNav() {
  const pathname = usePathname();
  
  // Usamos el hook simplificado
  const { profile: currentUser, isUserLoading } = useUser();
  
  // PARA DEBUG - Esto se verá en la consola del navegador
  console.log('🔍 DEBUG MainNav:', {
    currentUser,
    role: currentUser?.role,
    pathname
  });

  const isLoading = isUserLoading;
  
  // EN DESARROLLO: Siempre somos superadmin
  const role = currentUser?.role || 'superadmin';
  const isAdminOrHigher = role === 'admin' || role === 'superadmin';

  const allNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { 
      href: '/users', 
      label: 'GESTIÓN DE USUARIOS (TEST)', 
      icon: <Users />, 
      adminOnly: true 
    },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  // Filtrar items según permisos
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && !isAdminOrHigher) return false;
    return true;
  });

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <div className="flex items-center gap-2 p-2">
              <div className="h-6 w-6 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isUsersLink = item.href === '/users';
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="block">
              <SidebarMenuButton 
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                // Resaltar el link de usuarios para verificar
                className={isUsersLink ? 'bg-blue-50 border border-blue-200' : ''}
              >
                {item.icon}
                <span className={isUsersLink ? 'font-bold text-blue-600' : ''}>
                  {item.label}
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
