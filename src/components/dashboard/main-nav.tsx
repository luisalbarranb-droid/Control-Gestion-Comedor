

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Users,
  ClipboardList,
  AreaChart,
  Archive,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  Settings,
  CalendarDays,
  Award,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleId } from '@/lib/types';
import { useUser } from '@/firebase';


interface NavItem {
    id?: ModuleId;
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: ('superadmin' | 'admin' | 'comun')[];
}


export const navItems: NavItem[] = [
  { id: 'dashboard', href: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { id: 'tasks', href: '/tasks', label: 'Tareas', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 'menus', href: '/menus', label: 'Planificación de Menús', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'daily-closing', href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck className="h-5 w-5" /> },
  { id: 'inventory', href: '/inventory', label: 'Inventario', icon: <Archive className="h-5 w-5" /> },
  { id: 'attendance', href: '/attendance', label: 'Gestión de RRHH', icon: <Users className="h-5 w-5" /> },
  { id: 'recognition', href: '/recognition', label: 'Reconocimientos', icon: <Award className="h-5 w-5" /> },
  { id: 'reports', href: '/reports', label: 'Reportes', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { id: 'stats', href: '/stats', label: 'Estadísticas', icon: <AreaChart className="h-5 w-5" /> },
  { id: 'users', href: '/users', label: 'Gestión de Usuario', icon: <Users className="h-5 w-5" />, roles: ['superadmin'] },
  { id: 'share', href: '/share', label: 'Compartir App', icon: <Share2 className="h-5 w-5" /> },
  { id: 'settings', href: '/settings', label: 'Configuración', icon: <Settings className="h-5 w-5" /> },
];

export function MainNav() {
  const pathname = usePathname();
  const { profile, isUserLoading } = useUser();

  const userRole = profile?.role;
  const userModules = profile?.modules || [];

  const filteredNavItems = React.useMemo(() => {
    if (!userRole) return [];
    
    return navItems.filter(item => {
        // Superadmin sees everything except what's explicitly restricted from them
        if (userRole === 'superadmin') {
            return !item.roles || item.roles.includes('superadmin');
        }
        
        // Admin sees what's in their modules list
        if (userRole === 'admin') {
            if (!item.id) return true; // Items without an ID are public (like settings)
            return userModules.includes(item.id);
        }
        
        // Comun user sees a very limited set
        if (userRole === 'comun') {
            const comunModules: (ModuleId | undefined)[] = ['dashboard', 'tasks', 'share', 'settings'];
            return comunModules.includes(item.id);
        }
        
        return false;
    });
  }, [userRole, userModules]);
  
  if (isUserLoading) {
      return (
          <div className="flex flex-col gap-2 py-4">
              {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2">
                      <div className="h-5 w-5 bg-muted rounded-md animate-pulse"></div>
                      <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
                  </div>
              ))}
          </div>
      );
  }

  return (
    <nav className="flex flex-col gap-2 py-4">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
        )
      })}
    </nav>
  );
}
