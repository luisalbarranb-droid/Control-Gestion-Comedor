'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useCollection, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { User, Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UserForm } from '@/components/users/user-form';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  comun: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  chef: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  waiter: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

const roleLabels: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  comun: 'Común',
  manager: 'Gerente',
  employee: 'Empleado',
  chef: 'Chef',
  waiter: 'Mesero',
};

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, profile: currentUserProfile, auth } = useUser();

  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);

  const handleSaveUser = async (userData: Omit<User, 'id'>, password?: string) => {
    if (!firestore || !currentUserProfile) return;

    if (selectedUser) {
      // Editar usuario
      const userRef = doc(firestore, 'users', selectedUser.id);
      updateDocumentNonBlocking(userRef, userData);
      toast({ title: 'Usuario Actualizado', description: `Se guardaron los cambios para ${userData.name}.` });
    } else {
      // Crear usuario
      if (!password) {
        toast({ variant: 'destructive', title: 'Error', description: 'La contraseña es obligatoria para nuevos usuarios.' });
        return;
      }
      try {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const newAuthUser = userCredential.user;

        // 2. Crear documento en Firestore
        const userRef = doc(firestore, 'users', newAuthUser.uid);
        const newUserDoc: User = {
          ...userData,
          id: newAuthUser.uid,
          userId: newAuthUser.uid,
          createdBy: currentUserProfile.id,
          creationDate: serverTimestamp(),
          lastAccess: serverTimestamp(),
        };
        setDocumentNonBlocking(userRef, newUserDoc);
        toast({ title: 'Usuario Creado', description: `${userData.name} ha sido registrado.` });
      } catch (error: any) {
        console.error("Error creating user:", error);
        toast({ variant: 'destructive', title: 'Error al crear usuario', description: error.message });
      }
    }
    setFormOpen(false);
    setSelectedUser(null);
  };

  const openForm = (user: User | null) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDelete = (userToDelete: User) => {
    if (!firestore) return;
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${userToDelete.name}? Esta acción no se puede deshacer.`)) {
      // Note: This only deletes the Firestore document, not the Auth user.
      // A production app would need a Cloud Function to handle full user deletion.
      const userRef = doc(firestore, 'users', userToDelete.id);
      deleteDocumentNonBlocking(userRef);
      toast({ title: 'Usuario Eliminado', description: `${userToDelete.name} ha sido eliminado de la base de datos.` });
    }
  };

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => openForm(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        <div className="flex justify-center items-center">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin"/> Cargando usuarios...
                        </div>
                    </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', roleColors[user.role])}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastAccess ? new Date((user.lastAccess as any).seconds * 1000).toLocaleDateString() : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openForm(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(user)}
                          className="text-red-500"
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
          
          {!isLoading && filteredUsers?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          )}
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
