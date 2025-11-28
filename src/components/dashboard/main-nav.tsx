'use client';

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

// In a real app, you'd get the user's role from an auth context
const userRole = 'admin'; // 'superadmin', 'admin', or 'comun'

export function MainNav() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton href="#" isActive tooltip="Dashboard">
          <Home />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton href="#" tooltip="Tareas">
          <ClipboardList />
          <span>Tareas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {(userRole === 'admin' || userRole === 'superadmin') && (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Usuarios">
              <Users />
              <span>Usuarios</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Estadísticas">
              <AreaChart />
              <span>Estadísticas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      )}

      {userRole === 'superadmin' && (
        <SidebarMenuItem>
          <SidebarMenuButton href="#" tooltip="Configuración">
            <Settings />
            <span>Configuración</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
