
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2
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
import { useCollection, useFirestore, useUser as useAuthUser, setDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { User as UserType, Role } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { UserForm } from '@/components/users/user-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const roles: Record<Role, { label: string, color: string }> = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
  comun: { label: 'Común', color: 'bg-blue-100 text-blue-800' },
  chef: { label: 'Chef', color: 'bg-orange-100 text-orange-800' },
  manager: { label: 'Gerente', color: 'bg-yellow-100 text-yellow-800' },
  employee: { label: 'Empleado', color: 'bg-green-100 text-green-800' },
  waiter: { label: 'Mesero', color: 'bg-indigo-100 text-indigo-800' },
};

export default function GestionUsuariosPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { auth, profile: creator } = useAuthUser();
  const { toast } = useToast();

  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading } = useCollection<UserType>(usersCollectionRef);

  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('all');

  const usuariosFiltrados = users?.filter(usuario => {
    const coincideBusqueda = 
      usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideRol = filtroRol === 'all' || usuario.role === filtroRol;
    
    return coincideBusqueda && coincideRol;
  }) || [];

  const estadisticas = {
    total: users?.length || 0,
    activos: users?.filter(u => u.isActive).length || 0,
    admins: users?.filter(u => u.role === 'admin' || u.role === 'superadmin').length || 0,
  };

  const handleOpenForm = (user: UserType | null = null) => {
    setSelectedUser(user);
    setFormOpen(true);
  };
  
  const handleSaveUser = async (userData: Omit<UserType, 'id' | 'createdBy' | 'creationDate' | 'lastAccess'>, password?: string) => {
    if (!firestore || !creator) return;

    if (selectedUser) { // UPDATE
      const docRef = doc(firestore, 'users', selectedUser.id);
      updateDocumentNonBlocking(docRef, userData);
      toast({ title: "Usuario actualizado", description: `Se ha actualizado la información de ${userData.name}.` });
    } else { // CREATE
      if (!password) {
        toast({ variant: 'destructive', title: 'Error', description: 'La contraseña es obligatoria para nuevos usuarios.' });
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const newUser = userCredential.user;
        const newUserProfile: UserType = {
          ...userData,
          id: newUser.uid,
          createdBy: creator.id,
          creationDate: serverTimestamp(),
          lastAccess: serverTimestamp(),
        };
        const docRef = doc(firestore, 'users', newUser.uid);
        setDocumentNonBlocking(docRef, newUserProfile);
        toast({ title: 'Usuario Creado', description: `${userData.name} ha sido añadido al sistema.` });
      } catch (error: any) {
        console.error("Error creating user:", error);
        toast({ variant: 'destructive', title: 'Error al crear usuario', description: error.message });
      }
    }
    setFormOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = (userToDelete: UserType) => {
    if (confirm(`¿Está seguro de eliminar a ${userToDelete.name}? Esta acción no se puede deshacer.`)) {
      if (!firestore) return;
      // Note: This only deletes the Firestore document, not the Firebase Auth user.
      // A complete solution would use a Cloud Function to delete the Auth user.
      const docRef = doc(firestore, 'users', userToDelete.id);
      deleteDocumentNonBlocking(docRef);
      toast({ title: 'Usuario Eliminado', description: `${userToDelete.name} ha sido eliminado de la base de datos.` });
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios del sistema del comedor</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
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
                <p className="text-2xl font-bold">{isLoading ? '...' : estadisticas.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{isLoading ? '...' : estadisticas.activos}</p>
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
                <p className="text-2xl font-bold text-purple-600">{isLoading ? '...' : estadisticas.admins}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
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
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                    </TableRow>
                ) : usuariosFiltrados.length > 0 ? usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
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
                      <Badge className={roles[usuario.role]?.color}>
                        {roles[usuario.role]?.label}
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
                      {usuario.lastAccess?.toDate ? usuario.lastAccess.toDate().toLocaleDateString() : 'Nunca'}
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
                          <DropdownMenuItem onClick={() => handleOpenForm(usuario)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(usuario)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No se encontraron usuarios.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <UserForm 
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
}

