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
  show?: boolean;
}

export function MainNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  // En desarrollo, forzamos el rol superadmin
  const role = profile?.role || 'superadmin';
  const isAdminOrHigher = role === 'admin' || role === 'superadmin';

  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { 
      href: '/users', 
      label: 'Gestión de Usuarios', 
      icon: <Users />,
      show: isAdminOrHigher 
    },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // Si tiene condición de visibilidad, verificar
        if ('show' in item && !item.show) return null;
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="w-full block">
              <SidebarMenuButton 
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
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
