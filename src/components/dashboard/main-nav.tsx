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
  const { profile: currentUser, isUserLoading } = useUser();

  const isAdminOrHigher = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const allNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { href: '/users', label: 'Gestión de Usuarios', icon: <Users />, adminOnly: true },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  // Since login is removed, we show all items. The check is kept for structure.
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) {
      return isAdminOrHigher;
    }
    return true;
  });

  if (isUserLoading) {
     return (
      <SidebarMenu>
        {Array.from({ length: 10 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <div className="flex items-center gap-2 p-2">
              <div className="h-6 w-6 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }


  return (
    <SidebarMenu>
      {allNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} className="block w-full">
            <SidebarMenuButton isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}>
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
