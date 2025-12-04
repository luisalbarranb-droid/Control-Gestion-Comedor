
'use client';

import { usePathname, useRouter } from 'next/navigation';
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

  // Módulos EXACTAMENTE como los tienes, pero con Gestión de Usuarios VISIBLE
  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home /> },
    { href: '/tasks', label: 'Tareas', icon: <ClipboardList /> },
    { href: '/attendance', label: 'Asistencia', icon: <QrCode /> },
    { href: '/menus', label: 'Menus', icon: <BookOpen /> },
    { href: '/daily-closing', label: 'Cierres Diarios', icon: <ClipboardCheck /> },
    { href: '/inventory', label: 'Inventario', icon: <Archive /> },
    { 
      href: '/users', 
      label: 'Gestión de Usuarios', 
      icon: <Users />,
      highlight: true  // ← ¡NUEVO: Esto lo hace visible!
    },
    { href: '/reports', label: 'Reportes', icon: <FileSpreadsheet /> },
    { href: '/stats', label: 'Estadísticas', icon: <AreaChart /> },
    { href: '/settings', label: 'Configuración', icon: <Settings /> },
  ];

  return (
    <nav className="w-64 bg-white border-r h-full p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Comedor</h1>
      </div>

      {/* Navegación */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname?.startsWith(item.href));
          const isHighlighted = item.href === '/users'; // ← Detecta Gestión de Usuarios
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50'}
                ${isHighlighted ? 'border-2 border-blue-400 bg-blue-50 shadow-sm' : ''}
              `}
            >
              <div className={`${isHighlighted ? 'text-blue-600' : ''}`}>
                {item.icon}
              </div>
              <span className={`font-medium ${isHighlighted ? 'text-blue-800 font-semibold' : ''}`}>
                {item.label}
              </span>
              
              {/* Badge especial para Gestión de Usuarios */}
              {isHighlighted && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  ¡Nuevo!
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
