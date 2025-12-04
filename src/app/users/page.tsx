
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { users as sampleUsers, areas } from '@/lib/placeholder-data';
import type { User as SystemUser, Role, AreaId } from '@/lib/types';


// Configuración de roles
const ROLE_CONFIG: Record<Role, { label: string, color: string, icon: React.ReactElement }> = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: <Shield className="h-3 w-3" /> },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: <Shield className="h-3 w-3" /> },
  manager: { label: 'Gerente', color: 'bg-blue-100 text-blue-800', icon: <Briefcase className="h-3 w-3" /> },
  chef: { label: 'Chef', color: 'bg-orange-100 text-orange-800', icon: <Briefcase className="h-3 w-3" /> },
  waiter: { label: 'Mesero', color: 'bg-yellow-100 text-yellow-800', icon: <User className="h-3 w-3" /> },
  employee: { label: 'Empleado', color: 'bg-gray-100 text-gray-800', icon: <User className="h-3 w-3" /> },
  comun: { label: 'Común', color: 'bg-green-100 text-green-800', icon: <User className="h-3 w-3" /> },
};

// Configuración de estados
const STATUS_CONFIG: Record<'active' | 'inactive', { label: string, color: string, icon: React.ReactElement }> = {
  active: { label: 'Activo', color: 'text-green-600 bg-green-50', icon: <CheckCircle className="h-3 w-3" /> },
  inactive: { label: 'Inactivo', color: 'text-red-600 bg-red-50', icon: <XCircle className="h-3 w-3" /> },
};


export default function UsersManagementPage() {
  const router = useRouter();
  
  const [users, setUsers] = useState<SystemUser[]>(sampleUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (user.isActive ? 'active' : 'inactive') === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getAreaName = (areaId: AreaId | undefined) => {
    if (!areaId) return 'N/A';
    return areas.find(area => area.id === areaId)?.nombre || areaId;
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        return { ...user, isActive: !user.isActive };
      }
      return user;
    }));
  };

  return (
    <div className="p-4 md:p-6">
       <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">¡Gestión de Usuarios Activada!</h1>
              <p className="opacity-90">
                El módulo de Gestión de Usuarios está ahora disponible en el menú.
              </p>
            </div>
          </div>
        </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administra los usuarios, roles y permisos del sistema.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => {}}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
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
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="px-4 py-2 border rounded-md text-sm bg-background"
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
                className="px-4 py-2 border rounded-md text-sm bg-background"
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
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <p className="font-medium">{user.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ROLE_CONFIG[user.role].color} gap-1 capitalize`}>
                        {ROLE_CONFIG[user.role].icon}
                        {ROLE_CONFIG[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <p className="text-sm text-gray-600">{getAreaName(user.area)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <span className={`${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {STATUS_CONFIG[user.isActive ? 'active' : 'inactive'].label}
                          </span>
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
                          <DropdownMenuItem onClick={() => {}}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {}}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar usuario
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleStatus(user.id)}>
                            {user.isActive ? (
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
