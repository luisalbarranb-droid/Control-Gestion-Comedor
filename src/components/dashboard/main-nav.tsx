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

// VERSIÓN MÁS SIMPLE POSIBLE - SIN FIREBASE
export function MainNav() {
  const pathname = usePathname();
  
  console.log('🚀 MainNav renderizado en:', pathname);

  // Array SIMPLE - SIN VERIFICACIONES
  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home />, show: true },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList />, show: true },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode />, show: true },
    { href: '/menus', label: 'Menus', icon: <BookOpen />, show: true },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck />, show: true },
    { href: '/inventory', label: 'Inventario', icon: <Archive />, show: true },
    { href: '/users', label: 'USUARIOS (FUNCIONA)', icon: <Users />, show: true }, // <-- ESTE ES EL IMPORTANTE
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet />, show: true },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart />, show: true },
    { href: '/settings', label: 'Configuración', icon: <Settings />, show: true },
  ];

  return (
    <SidebarMenu>
      {navItems
        .filter(item => item.show)
        .map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const isUsers = item.href === '/users';
          
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <SidebarMenuButton 
                  isActive={isActive}
                  style={{
                    backgroundColor: isUsers ? '#e8f4fd' : undefined,
                    border: isUsers ? '2px solid #3b82f6' : undefined,
                    fontWeight: isUsers ? 'bold' : undefined,
                  }}
                >
                  {item.icon}
                  <span style={{ color: isUsers ? '#1d4ed8' : undefined }}>
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
