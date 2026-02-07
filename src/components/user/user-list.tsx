'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Shield, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
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
} from "@/components/ui/alert-dialog";
import { useFirestore, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { resetUserPassword } from '@/firebase/auth-operations';
import { useToast } from '@/components/ui/toast';

interface UserListProps {
    users: User[];
    isLoading: boolean;
    onEdit: (user: User) => void;
}

const roleDisplay: Record<string, { label: string; icon: React.ElementType, className: string }> = {
    comun: { label: 'Común', icon: UserIcon, className: 'bg-gray-100 text-gray-700' },
    admin: { label: 'Admin', icon: Shield, className: 'bg-purple-100 text-purple-700' },
    superadmin: { label: 'Superadmin', icon: Shield, className: 'bg-amber-100 text-amber-700' }
};

export function UserList({ users, isLoading, onEdit }: UserListProps) {
    const { toast } = useToast();
    const { user: authUser, profile } = useUser();
    const firestore = useFirestore();

    const isSuperAdmin = profile?.role === 'superadmin';

    const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const handleResetPassword = async (email: string) => {
        if (!email) return;
        const result = await resetUserPassword(email);
        if (result.success) {
            toast({
                title: 'Correo Enviado',
                description: `Se ha enviado un correo de recuperación a ${email}.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo enviar el correo de recuperación.',
            });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!firestore || !isSuperAdmin) return;

        // Evitar que el superadmin se elimine a sí mismo por error
        if (userId === authUser?.uid) {
            toast({
                variant: 'destructive',
                title: 'Operación denegada',
                description: 'No puedes eliminar tu propia cuenta de administrador.',
            });
            return;
        }

        try {
            const userRef = doc(firestore, 'users', userId);
            await deleteDocumentNonBlocking(userRef);
            toast({
                title: 'Usuario eliminado',
                description: `El perfil de ${userName} ha sido eliminado del sistema.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error al eliminar',
                description: error.message || 'No se pudo eliminar el usuario.',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <Skeleton className="h-5 w-full" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No se encontraron usuarios.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map(user => {
                const roleInfo = roleDisplay[user.role] || roleDisplay['comun'];
                return (
                    <Card key={user.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="text-lg bg-muted">{getUserInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-base leading-tight">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                <span className="text-sm text-muted-foreground">Rol del Sistema:</span>
                                <Badge variant="secondary" className={roleInfo.className}>
                                    <roleInfo.icon className="h-3 w-3 mr-1" />
                                    {roleInfo.label}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-2 mt-4">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Gestionar Rol
                                </Button>

                                {isSuperAdmin && (
                                    <div className="flex gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                    Eliminar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción eliminará el perfil de <strong>{user.name}</strong> del sistema.
                                                        El usuario perderá todo acceso de forma inmediata.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Confirmar Eliminación
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground" onClick={() => handleResetPassword(user.email)}>
                                            Recuperar Clave
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
