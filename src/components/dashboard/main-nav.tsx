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
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUserRole } from '@/hooks/use-user-role'; // Import the new hook

export function MainNav() {
  const pathname = usePathname();
  const { role } = useUserRole(); // Get the user's role
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/">
          <SidebarMenuButton isActive={pathname === '/'}>
            <Home />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/tasks">
          <SidebarMenuButton isActive={pathname.startsWith('/tasks')}>
            <ClipboardList />
            <span>Tareas</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/menus">
          <SidebarMenuButton isActive={pathname.startsWith('/menus')}>
            <BookOpen />
            <span>Menús</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <Link href="/inventory">
          <SidebarMenuButton isActive={pathname.startsWith('/inventory')}>
            <Archive />
            <span>Inventario</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      {isAdmin && (
        <>
          <SidebarMenuItem>
            <Link href="/users">
              <SidebarMenuButton isActive={pathname.startsWith('/users')}>
                <Users />
                <span>Usuarios</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/stats">
              <SidebarMenuButton isActive={pathname.startsWith('/stats')}>
                <AreaChart />
                <span>Estadísticas</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </>
      )}
      <SidebarMenuItem>
        <Link href="/settings">
          <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
            <Settings />
            <span>Configuración</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
