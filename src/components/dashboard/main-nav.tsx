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
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSkeleton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  visibleForRoles?: ('admin' | 'superadmin')[];
}

export function MainNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef, {
    disabled: !authUser
  });

  const isLoading = isAuthLoading || isProfileLoading;
  
  const allNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { href: '/users', label: 'Gestión de Usuarios', icon: <Users />, visibleForRoles: ['admin', 'superadmin'] },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  const navItems = allNavItems.filter(item => {
    // If item has no specific roles, it's visible to everyone
    if (!item.visibleForRoles) {
        return true; 
    }
    // If item has roles, check if the current user's role is included
    if (currentUser?.role && item.visibleForRoles.includes(currentUser.role)) {
        return true;
    }
    // Otherwise, hide it
    return false;
  });

  if (isLoading) {
    return (
      <SidebarMenu>
        {allNavItems.map((item, i) => (
          <SidebarSkeleton key={i} showIcon={true} />
        ))}
      </SidebarMenu>
    );
  }
  
  if (!authUser) {
    return null; // Don't show nav items if user is not logged in
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
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
