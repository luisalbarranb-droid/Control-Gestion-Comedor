'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';

// Datos de ejemplo para desarrollo
const mockUsers = [
  {
    id: '1',
    email: 'superadmin@empresa.com',
    name: 'Juan Pérez',
    role: 'superadmin' as Role,
    department: 'Administración',
    position: 'Director General',
    active: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-12-03'
  },
  {
    id: '2',
    email: 'admin@empresa.com',
    name: 'María García',
    role: 'admin' as Role,
    department: 'Recursos Humanos',
    position: 'Gerente de RH',
    active: true,
    createdAt: '2024-02-20',
    lastLogin: '2024-12-02'
  },
  {
    id: '3',
    email: 'chef@restaurante.com',
    name: 'Carlos López',
    role: 'chef' as Role,
    department: 'Cocina',
    position: 'Chef Principal',
    active: true,
    createdAt: '2024-03-10',
    lastLogin: '2024-12-01'
  },
  {
    id: '4',
    email: 'mesero@restaurante.com',
    name: 'Ana Rodríguez',
    role: 'waiter' as Role,
    department: 'Servicio',
    position: 'Mesero',
    active: true,
    createdAt: '2024-04-05',
    lastLogin: '2024-11-30'
  },
  {
    id: '5',
    email: 'empleado@empresa.com',
    name: 'Pedro Sánchez',
    role: 'employee' as Role,
    department: 'Operaciones',
    position: 'Operario',
    active: false,
    createdAt: '2024-05-12',
    lastLogin: '2024-11-15'
  },
];

const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  chef: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  waiter: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  comun: 'bg-gray-100 text-gray-800'
};

const roleLabels: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Empleado',
  chef: 'Chef',
  waiter: 'Mesero',
  comun: 'Común',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => router.push('/users/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md bg-background text-foreground"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="employee">Empleado</option>
                <option value="chef">Chef</option>
                <option value="waiter">Mesero</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "secondary"}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
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
                        <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/users/${user.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
