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
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import type { Role } from '@/lib/types';
import { UserForm } from '@/components/users/user-form';
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import type { User } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const roleColors: Record<Role, string> = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  comun: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  chef: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  waiter: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

const roleLabels: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
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
  const { user: authUser } = useUser();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setFormOpen(true);
  };
  
  const handleSaveUser = (userData: Omit<User, 'id'>, password?: string) => {
    if (!firestore || !authUser) return;

    if (selectedUser) {
      // Update existing user
      const userDocRef = doc(firestore, 'users', selectedUser.id);
      setDocumentNonBlocking(userDocRef, userData, { merge: true });
      toast({ title: 'Usuario Actualizado', description: `Se ha actualizado a ${userData.name}.` });
    } else {
      // Create new user (requires a backend function in a real scenario)
      console.log("Creating user:", userData, "with password:", password);
      // This part is complex and needs a backend function to create a user in Firebase Auth
      // For this prototype, we'll just add to Firestore.
      addDocumentNonBlocking(collection(firestore, 'users'), userData);
       toast({ title: 'Usuario Creado', description: `Se ha creado a ${userData.name}. (Auth no implementado)` });
    }
  };


  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      deleteDocumentNonBlocking(doc(firestore, 'users', id));
      toast({ title: 'Usuario Eliminado', variant: 'destructive'});
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                <p className="text-gray-500">Administra los usuarios del sistema</p>
                </div>
                <Button onClick={() => handleOpenForm()}>
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
                        <option value="comun">Común</option>
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
                        <TableHead>Área</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último acceso</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Cargando usuarios...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge className={roleColors[user.role]}>
                            {roleLabels[user.role]}
                            </Badge>
                        </TableCell>
                        <TableCell>{user.area}</TableCell>
                        <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {user.lastAccess ? new Date(user.lastAccess as any).toLocaleDateString() : 'Nunca'}
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
                                <DropdownMenuItem onClick={() => handleOpenForm(user)}>
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
                    ))
                     ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            No se encontraron usuarios
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                </Table>
                
                </CardContent>
            </Card>
        </main>
      </SidebarInset>

      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
}
