'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Settings,
  ClipboardList,
  AreaChart,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === '/'}
          tooltip="Dashboard"
        >
          <Link href="/">
            <Home />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith('/tasks')}
          tooltip="Tareas"
        >
          <Link href="/tasks">
            <ClipboardList />
            <span>Tareas</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith('/users')}
          tooltip="Usuarios"
        >
          <Link href="/users">
            <Users />
            <span>Usuarios</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith('/stats')}
          tooltip="Estadísticas"
        >
          <Link href="/stats">
            <AreaChart />
            <span>Estadísticas</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith('/settings')}
          tooltip="Configuración"
        >
          <Link href="/settings">
            <Settings />
            <span>Configuración</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
