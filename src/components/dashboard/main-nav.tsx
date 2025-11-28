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

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton href="/" isActive={pathname === '/'} tooltip="Dashboard">
          <Home />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/tasks" isActive={pathname.startsWith('/tasks')} tooltip="Tareas">
          <ClipboardList />
          <span>Tareas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/users" isActive={pathname.startsWith('/users')} tooltip="Usuarios">
          <Users />
          <span>Usuarios</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/stats" isActive={pathname.startsWith('/stats')} tooltip="Estadísticas">
          <AreaChart />
          <span>Estadísticas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="/settings" isActive={pathname.startsWith('/settings')} tooltip="Configuración">
          <Settings />
          <span>Configuración</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
