// src/app/users/page.tsx - Página principal de Gestión de Usuarios
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
  XCircle
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

// Datos de ejemplo
const usuariosEjemplo = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    rol: 'superadmin',
    telefono: '+1234567890',
    departamento: 'Administración',
    puesto: 'Director General',
    estado: 'activo',
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-12-03',
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'maria.garcia@empresa.com',
    rol: 'admin',
    telefono: '+1234567891',
    departamento: 'Recursos Humanos',
    puesto: 'Gerente de RH',
    estado: 'activo',
    fechaCreacion: '2024-02-20',
    ultimoAcceso: '2024-12-02',
  },
  {
    id: '3',
    nombre: 'Carlos López',
    email: 'carlos.lopez@restaurante.com',
    rol: 'chef',
    telefono: '+1234567892',
    departamento: 'Cocina',
    puesto: 'Chef Principal',
    estado: 'activo',
    fechaCreacion: '2024-03-10',
    ultimoAcceso: '2024-12-01',
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    email: 'ana.rodriguez@restaurante.com',
    rol: 'mesero',
    telefono: '+1234567893',
    departamento: 'Servicio',
    puesto: 'Mesero Senior',
    estado: 'activo',
    fechaCreacion: '2024-04-05',
    ultimoAcceso: '2024-11-30',
  },
  {
    id: '5',
    nombre: 'Pedro Sánchez',
    email: 'pedro.sanchez@empresa.com',
    rol: 'empleado',
    telefono: '+1234567894',
    departamento: 'Operaciones',
    puesto: 'Operario',
    estado: 'inactivo',
    fechaCreacion: '2024-05-12',
    ultimoAcceso: '2024-11-15',
  },
];

const roles = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  chef: { label: 'Chef', color: 'bg-orange-100 text-orange-800' },
  mesero: { label: 'Mesero', color: 'bg-yellow-100 text-yellow-800' },
  empleado: { label: 'Empleado', color: 'bg-blue-100 text-blue-800' },
};

export default function GestionUsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState(usuariosEjemplo);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.telefono.includes(busqueda);
    
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    
    return coincideBusqueda && coincideRol;
  });

  // Estadísticas
  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    admins: usuarios.filter(u => u.rol === 'admin' || u.rol === 'superadmin').length,
    ultimaSemana: usuarios.filter(u => {
      const fecha = new Date(u.ultimoAcceso);
      const ahora = new Date();
      const diferenciaDias = (ahora.getTime() - fecha.getTime()) / (1000 * 3600 * 24);
      return diferenciaDias <= 7;
    }).length,
  };

  const eliminarUsuario = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios del sistema del comedor</p>
        </div>
        <Button onClick={() => router.push('/users/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.admins}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos (7 días)</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.ultimaSemana}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-md"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrador</option>
                <option value="chef">Chef</option>
                <option value="mesero">Mesero</option>
                <option value="empleado">Empleado</option>
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
          <CardTitle>Lista de Usuarios</CardTitle>
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
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-gray-500">{usuario.puesto}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{usuario.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{usuario.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roles[usuario.rol as keyof typeof roles]?.color}>
                        {roles[usuario.rol as keyof typeof roles]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{usuario.departamento}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {usuario.estado === 'activo' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Activo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">Inactivo</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/users/${usuario.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/users/edit/${usuario.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => eliminarUsuario(usuario.id)}
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

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron usuarios</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setBusqueda('');
                  setFiltroRol('todos');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
