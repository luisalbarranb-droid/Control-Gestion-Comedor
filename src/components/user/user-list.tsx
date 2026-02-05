'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Shield, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

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

import { resetUserPassword } from '@/firebase/auth-operations';
import { useToast } from '@/components/ui/toast';

export function UserList({ users, isLoading, onEdit }: UserListProps) {
    const { toast } = useToast();
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
                                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => handleResetPassword(user.email)}>
                                    Restablecer Contraseña
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
