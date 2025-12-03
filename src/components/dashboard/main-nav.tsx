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
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function MainNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isLoading = isAuthLoading || isProfileLoading;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

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

  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 8 }).map((_, i) => (
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
