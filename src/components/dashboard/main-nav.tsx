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
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';


interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export function MainNav() {
  const pathname = usePathname();
  const { profile: currentUser, isUserLoading } = useUser();

  const role = currentUser?.role;
  const isAdminOrHigher = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  const allNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { href: '/users', label: 'Gestión de Usuarios', icon: <Users />, adminOnly: true },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart />, adminOnly: true },
    { href: '/settings', label: 'Configuración', icon: <Settings />, superAdminOnly: true },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdminOrHigher) return false;
    return true;
  });

  if (isUserLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 8 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="block w-full">
              <SidebarMenuButton 
                isActive={isActive}
                className="w-full justify-start"
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
