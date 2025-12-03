
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
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';


export function MainNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const role = currentUser?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';

  if (isAuthLoading || isProfileLoading) {
    return (
      <SidebarMenu>
         {/* You can show skeletons or a loader here while loading */}
      </SidebarMenu>
    )
  }

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
          <Link href="/attendance">
            <SidebarMenuButton isActive={pathname.startsWith('/attendance')}>
              <QrCode />
              <span>Asistencia</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/menus">
          <SidebarMenuButton isActive={pathname.startsWith('/menus')}>
            <BookOpen />
            <span>Menus</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/daily-closing">
          <SidebarMenuButton isActive={pathname.startsWith('/daily-closing')}>
            <ClipboardCheck />
            <span>Cierres Diarios</span>
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
          <SidebarMenuItem>
            <Link href="/users">
              <SidebarMenuButton isActive={pathname.startsWith('/users')}>
                <Users />
                <span>Gestión de Usuarios</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
      )}
      
       <SidebarMenuItem>
        <Link href="/reports">
          <SidebarMenuButton isActive={pathname.startsWith('/reports')}>
            <FileSpreadsheet />
            <span>Reportes</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      {isAdmin && (
        <SidebarMenuItem>
          <Link href="/stats">
            <SidebarMenuButton isActive={pathname.startsWith('/stats')}>
              <AreaChart />
              <span>Estadísticas</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
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

    