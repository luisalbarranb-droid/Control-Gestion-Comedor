
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { href: '/tasks', label: 'Tareas', icon: <ClipboardList className="h-5 w-5" /> },
  { href: '/menus', label: 'Planificación de Menús', icon: <BookOpen className="h-5 w-5" /> },
  { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck className="h-5 w-5" /> },
  { href: '/inventory', label: 'Inventario', icon: <Archive className="h-5 w-5" /> },
  { href: '/attendance', label: 'Gestión de RRHH', icon: <Users className="h-5 w-5" /> },
  { href: '/recognition', label: 'Reconocimientos', icon: <Award className="h-5 w-5" /> },
  { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet className="h-5 w-5" /> },
  { href: '/stats', label: 'Estadísticas', icon: <AreaChart className="h-5 w-5" /> },
  { href: '/settings', label: 'Configuración', icon: <Settings className="h-5 w-5" /> },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 py-4">
      {navItems.map((item) => {
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
