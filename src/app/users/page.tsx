// src/app/users/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSmartAuth } from '@/providers/SmartAuthProvider';
import { Environment } from '@/lib/environment';

// Tipos
interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'employee' | 'chef' | 'waiter';
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
  avatarColor: string;
}

// Datos de ejemplo
const SAMPLE_USERS: SystemUser[] = [
  {
    id: '1',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@comedor.com',
    role: 'superadmin',
    phone: '+52 55 1234 5678',
    department: 'Administración',
    position: 'Director General',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-03',
    avatarColor: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'María Fernández',
    email: 'maria.fernandez@comedor.com',
    role: 'admin',
    phone: '+52 55 2345 6789',
    department: 'Recursos Humanos',
    position: 'Gerente de RH',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-02',
    avatarColor: 'bg-purple-500'
  },
  {
    id: '3',
    name: 'José Martínez',
    email: 'jose.martinez@comedor.com',
    role: 'chef',
    phone: '+52 55 3456 7890',
    department: 'Cocina',
    position: 'Chef Principal',
    status: 'active',
    createdAt: '2024-03-10',
    lastLogin: '2024-12-01',
    avatarColor: 'bg-orange-500'
  },
  {
    id: '4',
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@comedor.com',
    role: 'waiter',
    phone: '+52 55 4567 8901',
    department: 'Servicio',
    position: 'Mesero Senior',
    status: 'active',
    createdAt: '2024-04-05',
    lastLogin: '2024-11-30',
    avatarColor: 'bg-green-500'
  },
  {
    id: '5',
    name: 'Luis Pérez',
    email: 'luis.perez@comedor.com',
    role: 'employee',
    phone: '+52 55 5678 9012',
    department: 'Limpieza',
    position: 'Supervisor',
    status: 'inactive',
    createdAt: '2024-05-12',
    lastLogin: '2024-11-15',
    avatarColor: 'bg-red-500'
  },
  {
    id: '6',
    name: 'Erika Esquivel',
    email: 'erika.esquivel@comedor.com',
    role: 'manager',
    phone: '+52 55 6789 0123',
    department: 'Operaciones',
    position: 'Gerente de Operaciones',
    status: 'active',
    createdAt: '2024-06-18',
    lastLogin: '2024-11-28',
    avatarColor: 'bg-pink-500'
  },
  {
    id: '7',
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@comedor.com',
    role: 'employee',
    phone: '+52 55 7890 1234',
    department: 'Almacén',
    position: 'Almacenista',
    status: 'pending',
    createdAt: '2024-07-22',
    lastLogin: '2024-11-10',
    avatarColor: 'bg-yellow-500'
  },
  {
    id: '8',
    name: 'Laura González',
    email: 'laura.gonzalez@comedor.com',
    role: 'waiter',
    phone: '+52 55 8901 2345',
    department: 'Servicio',
    position: 'Mesero',
    status: 'active',
    createdAt: '2024-08-30',
    lastLogin: '2024-11-25',
    avatarColor: 'bg-teal-500'
  }
];

// Configuración de roles
const ROLE_CONFIG = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: <Shield className="h-3 w-3" /> },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: <Shield className="h-3 w-3" /> },
  manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-800', icon: <Briefcase className="h-3 w-3" /> },
  chef: { label: 'Chef', color: 'bg-orange-100 text-orange-800', icon: <Briefcase className="h-3 w-3" /> },
  waiter: { label: 'Mesero', color: 'bg-yellow-100 text-yellow-800', icon: <User className="h-3 w-3" /> },
  employee: { label: 'Empleado', color: 'bg-green-100 text-green-800', icon: <User className="h-3 w-3" /> },
};

// Configuración de estados
const STATUS_CONFIG = {
  active: { label: 'Activo', color: 'text-green-600 bg-green-50', icon: <CheckCircle className="h-3 w-3" /> },
  inactive: { label: 'Inactivo', color: 'text-red-600 bg-red-50', icon: <XCircle className="h-3 w-3" /> },
  pending: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50', icon: <Calendar className="h-3 w-3" /> },
};

export default function UsersManagementPage() {
  const router = useRouter();
  const { user: currentUser, environment } = useSmartAuth();
  const isStudio = Environment.isFirebaseStudio();
  
  const [users, setUsers] = useState<SystemUser[]>(SAMPLE_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    thisMonth: users.filter(u => {
      const created = new Date(u.createdAt);
      const now = new Date();
      const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
      return diffMonths === 0;
    }).length,
  };

  // Departamentos únicos
  const departments = Array.from(new Set(users.map(u => u.department)));

  // Manejar eliminación
  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  // Manejar cambio de estado
  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h2 className="text-xl font-bold text-red-800">Acceso Denegado</h2>
                <p className="text-red-600">
                  No tienes permisos para acceder a la gestión de usuarios.
                  Contacta al administrador del sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Banner de entorno */}
      {isStudio && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">🔥</span>
              </div>
              <div>
                <h3 className="font-bold text-yellow-800">Modo Firebase Studio Activado</h3>
                <p className="text-sm text-yellow-700">
                  Los datos son de demostración. En producción se conectarán a Firebase real.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              Demo
            </Badge>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra los usuarios del sistema del comedor
            {isStudio && ' (Modo Demo)'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/users/import')}
            className="gap-2"
          >
            <span>📋</span>
            Importar
          </Button>
          <Button 
            onClick={() => router.push('/users/new')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-100 hover:border-blue-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.thisMonth} nuevos este mes
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 hover:border-green-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {Math.round((stats.active / stats.total) * 100)}% del total
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 hover:border-purple-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Acceso completo al sistema
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 hover:border-orange-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Departamentos</p>
                <p className="text-2xl font-bold text-orange-600">{departments.length}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {departments.slice(0, 2).join(', ')}...
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="px-4 py-2 border rounded-md text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                {Object.entries(ROLE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 border rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Más filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            <div className="text-sm text-gray-500">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${user.avatarColor} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ROLE_CONFIG[user.role].color} gap-1`}>
                        {ROLE_CONFIG[user.role].icon}
                        {ROLE_CONFIG[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-gray-400" />
                        <span>{user.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                        >
                          {STATUS_CONFIG[user.status].icon}
                          <span className={STATUS_CONFIG[user.status].color}>
                            {STATUS_CONFIG[user.status].label}
                          </span>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <div className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/users/edit/${user.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar usuario
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleStatus(user.id)}>
                            {user.status === 'active' ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sin resultados */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500 mb-6">
                No hay usuarios que coincidan con los filtros aplicados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del entorno */}
      <div className="mt-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isStudio ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span>
            Entorno: {isStudio ? 'Firebase Studio (Demo)' : 'Desarrollo Local'}
            {' • '}
            Usuarios: {filteredUsers.length} mostrados
            {' • '}
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
}
