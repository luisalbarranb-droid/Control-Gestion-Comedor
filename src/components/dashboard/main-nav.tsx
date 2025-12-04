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
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean; // Para admin y superadmin
  superAdminOnly?: boolean; // Solo para superadmin
}

export function MainNav() {
  const pathname = usePathname();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isLoading = isAuthLoading || isProfileLoading || !isClient;
  const role = currentUser?.role;
  
  // Según tus reglas de Firestore:
  const isAdminOrHigher = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  const allNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    
    // IMPORTANTE: Según tus reglas, admin puede LISTAR usuarios, solo superadmin puede CREAR/ELIMINAR
    // Pero el menú debe ser visible para ambos roles (admin y superadmin)
    { href: '/users', label: 'Gestión de Usuarios', icon: <Users />, adminOnly: true },
    
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    
    // Configuración solo para superadmin según tus reglas
    { href: '/settings', label: 'Configuración', icon: <Settings />, superAdminOnly: true },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdminOrHigher) return false;
    return true;
  });

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 6 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
          <Link 
            href={item.href}
            className="block w-full"
            aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
          >
            <SidebarMenuButton 
              isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
              className="w-full justify-start"
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
