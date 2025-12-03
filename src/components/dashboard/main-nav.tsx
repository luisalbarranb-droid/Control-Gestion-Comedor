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
  SidebarSkeleton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
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

  // Memoize the document reference
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  // Fetch the user profile from Firestore
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef, {
    disabled: !authUser || isAuthLoading
  });
  
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

  // While auth state is resolving, or if auth is resolved but profile is still loading, show skeleton
  if (isAuthLoading || (authUser && isProfileLoading)) {
    return (
      <SidebarMenu>
        {Array(10).fill(0).map((_, i) => (
          <SidebarSkeleton key={i} showIcon={true} />
        ))}
      </SidebarMenu>
    );
  }

  // If auth is done and there's no user, render nothing
  if (!authUser) {
    return null; 
  }
  
  // Filter nav items based on the user's role
  const navItems = allNavItems.filter(item => {
    if (!item.visibleForRoles) {
      return true; // Visible to all authenticated users
    }
    // Check if the current user's role is in the visibleForRoles array
    return currentUser?.role && item.visibleForRoles.includes(currentUser.role);
  });

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
