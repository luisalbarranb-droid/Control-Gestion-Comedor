'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, User as UserIcon, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User, Role } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';


const roles: Record<Role, { label: string, color: string }> = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  comun: { label: 'Común', color: 'bg-blue-100 text-blue-800' },
};

export default function GestionUsuariosPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('all');

  const usersCollectionRef = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: usuarios, isLoading } = useCollection<User>(usersCollectionRef, { disabled: !authUser });


  const usuariosFiltrados = usuarios?.filter(usuario => {
    const coincideBusqueda = 
      usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideRol = filtroRol === 'all' || usuario.role === filtroRol;
    
    return coincideBusqueda && coincideRol;
  }) || [];

  const estadisticas = {
    total: usuarios?.length || 0,
    activos: usuarios?.filter(u => u.isActive).length || 0,
    admins: usuarios?.filter(u => u.role === 'admin' || u.role === 'superadmin').length || 0,
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-500" />
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
              <UserIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
           <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="w-full md:w-auto px-4 py-2 border rounded-md bg-background"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                {Object.entries(roles).map(([key, {label}]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
              </select>
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando usuarios...</TableCell></TableRow>}
                {!isLoading && usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="font-medium">{usuario.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{usuario.email}</span>
                        </div>
                        {usuario.phone && <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{usuario.phone}</span>
                        </div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roles[usuario.role as Role]?.color}>
                        {roles[usuario.role as Role]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {usuario.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={usuario.isActive ? "text-green-600" : "text-red-600"}>
                           {usuario.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {usuario.lastAccess ? new Date((usuario.lastAccess as any).toDate()).toLocaleDateString() : 'Nunca'}
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
        </CardContent>
      </Card>
    </div>
  );
}
