'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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

export function MainNav() {
  const pathname = usePathname();

  // TODOS los módulos VISIBLES - SIN filtros de permisos
  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { 
      href: '/users', 
      label: '👑 Gestión de Usuarios', // 👑 Icono para destacarlo
      icon: <Users /> 
    },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  return (
    <div className="w-64 bg-white border-r h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Comedor</h1>
            <p className="text-xs text-green-600">✅ Sistema Activo</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname?.startsWith(item.href));
          const isUsers = item.href === '/users';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50'}
                ${isUsers ? 'border-2 border-blue-400 bg-blue-50 shadow-sm font-semibold' : ''}
              `}
            >
              <div className={`${isUsers ? 'text-blue-600' : ''}`}>
                {item.icon}
              </div>
              <span className={`${isUsers ? 'text-blue-800' : ''}`}>
                {item.label}
              </span>
              
              {/* Badge especial para Usuarios */}
              {isUsers && (
                <span className="ml-auto">
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Nota de debug */}
      <div className="p-4 mt-8 border-t text-xs text-gray-500">
        <p>Módulos activos: <strong>10/10</strong></p>
        <p className="text-green-600">✓ Gestión de Usuarios: VISIBLE</p>
      </div>
    </div>
  );
}
