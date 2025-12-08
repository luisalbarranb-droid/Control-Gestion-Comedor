'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search,
  MoreVertical,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/lib/types';


// --- COMPONENTE PRINCIPAL ---
export default function UsersManagementPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  // Estado para el buscador y el modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados del formulario
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('comun');

  // 1. Obtener usuarios reales de Firebase
  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

  // 2. Función para crear el usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSaving(true);

    try {
      const newUser = {
        name: newName,
        email: newEmail,
        role: newRole,
        isActive: true,
        creationDate: serverTimestamp(),
        lastAccess: serverTimestamp(),
        createdBy: 'system' // Placeholder
      };

      await addDocumentNonBlocking(collection(firestore, 'users'), newUser);

      toast({
        title: "Usuario Creado",
        description: `${newName} ha sido añadido al sistema correctamente.`,
      });

      // Limpiar y cerrar
      setNewName('');
      setNewEmail('');
      setNewRole('comun');
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creando usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar usuarios por búsqueda
  const filteredUsers = users?.filter((user) => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) || [];

  const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios, roles y permisos del sistema.</p>
        </div>
        
        {/* BOTÓN MANUAL PARA ABRIR EL MODAL */}
        <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>

        {/* VENTANA MODAL (DIALOG) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo empleado. Se guardará en la base de datos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                    <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input id="name" placeholder="Ej. Juan Pérez" className="pl-9" required value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input id="email" type="email" placeholder="juan@comedor.com" className="pl-9" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol / Cargo</Label>
                <Select onValueChange={setNewRole} defaultValue="comun" value={newRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comun">Personal (Común)</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Usuario"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador */}
      <div className="flex items-center bg-white p-2 rounded-lg border shadow-sm max-w-md">
        <Search className="h-4 w-4 text-gray-500 ml-2" />
        <Input 
            placeholder="Buscar por nombre o correo..." 
            className="border-0 focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingUsers ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando usuarios...</td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                ) : (
                    filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                        {getUserInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-gray-900">{user.name || "Sin Nombre"}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <Badge variant="outline" className={user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200 capitalize' : 'bg-gray-100 text-gray-700 capitalize'}>
                                {user.role || 'Sin Rol'}
                            </Badge>
                        </td>
                        <td className="p-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
}

    