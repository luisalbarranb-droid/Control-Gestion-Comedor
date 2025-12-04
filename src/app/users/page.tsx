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
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, createUserWithEmailAndPassword } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword as createUserAuth } from 'firebase/auth';
import type { User, Role } from '@/lib/types';
import { UserForm } from '@/components/users/user-form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  comun: 'bg-gray-100 text-gray-800',
  manager: 'bg-indigo-100 text-indigo-800',
  employee: 'bg-green-100 text-green-800',
  chef: 'bg-orange-100 text-orange-800',
  waiter: 'bg-yellow-100 text-yellow-800',
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
  const auth = getAuth();
  const { user: authUser } = useUser();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'users') : null),
    [firestore, authUser]
  );
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleCreate = async (userData: Omit<User, 'id' | 'createdBy'>, password?: string) => {
    if (!firestore || !authUser || !password) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el usuario.' });
        return;
    }
    
    try {
        const userCredential = await createUserAuth(auth, userData.email, password);
        const newUser = userCredential.user;

        const userDocRef = doc(firestore, 'users', newUser.uid);
        const fullUserData = {
            ...userData,
            id: newUser.uid,
            createdBy: authUser.uid,
        };

        setDocumentNonBlocking(userDocRef, fullUserData, { merge: false });
        toast({ title: 'Usuario Creado', description: `El usuario ${userData.name} ha sido creado.` });
        setFormOpen(false);

    } catch (error: any) {
        console.error("Error creating user:", error);
        toast({ variant: 'destructive', title: 'Error al crear usuario', description: error.message });
    }
  };
  
  const handleUpdate = (userData: User) => {
     if (!firestore) return;
     const docRef = doc(firestore, 'users', userData.id);
     setDocumentNonBlocking(docRef, userData, { merge: true });
     toast({ title: 'Usuario Actualizado', description: `El usuario ${userData.name} ha sido actualizado.` });
     setFormOpen(false);
     setSelectedUser(null);
  };

  const handleDelete = () => {
    if (!firestore || !userToDelete) return;
    const docRef = doc(firestore, 'users', userToDelete.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Usuario Eliminado', description: `El usuario ${userToDelete.name} ha sido eliminado.` });
    setUserToDelete(null);
  };
  
  const openForm = (user: User | null = null) => {
    setSelectedUser(user);
    setFormOpen(true);
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-500">Administra los usuarios del sistema</p>
          </div>
          <Button onClick={() => openForm()}>
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
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        {Object.entries(roleLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const lastAccessDate = user.lastAccess?.toDate ? user.lastAccess.toDate() : (user.lastAccess ? new Date(user.lastAccess as any) : null);
                    return (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge className={cn('capitalize', roleColors[user.role] || '')}>
                            {roleLabels[user.role] || user.role}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {lastAccessDate ? new Date(lastAccessDate).toLocaleDateString() : 'Nunca'}
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
                                <DropdownMenuItem onClick={() => openForm(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" onClick={() => setUserToDelete(user)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </Button>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <UserForm 
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={selectedUser ? handleUpdate : handleCreate}
        user={selectedUser}
      />
       <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
              <span className="font-bold"> {userToDelete?.name}</span> y borrará sus datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
