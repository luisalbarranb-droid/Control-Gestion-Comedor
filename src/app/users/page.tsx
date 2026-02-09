'use client';

import React, { useState } from 'react';
import {
    Users,
    Search,
    UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserList } from '@/components/user/user-list';
import { UserForm } from '@/components/user/user-form';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { User, Comedor } from '@/lib/types';
import { useMultiTenant } from '@/providers/multi-tenant-provider';


export default function UsersManagementPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useUser();
    const { activeComedorId, isSuperAdmin } = useMultiTenant();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        const usersCollection = collection(firestore, 'users');

        if (activeComedorId) {
            return query(usersCollection, where('comedorId', '==', activeComedorId), orderBy('name', 'asc'));
        } else if (isSuperAdmin) {
            return query(usersCollection, orderBy('name', 'asc'));
        }

        return null;
    }, [firestore, authUser, activeComedorId, isSuperAdmin]);

    const { data: users, isLoading } = useCollection<User>(usersQuery, { disabled: isUserLoading || !authUser });

    // Fetch comedores for display names
    const comedoresQuery = isSuperAdmin && firestore ? collection(firestore, 'comedores') : null;
    const { data: comedores } = useCollection<Comedor>(comedoresQuery as any, { disabled: !isSuperAdmin });

    const filteredUsers = React.useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);


    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Users className="h-6 w-6" />
                <h1 className="text-xl font-semibold md:text-2xl">Gestión de Usuarios del Sistema</h1>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-auto md:flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre o email..."
                        className="pl-8 w-full md:w-[300px] lg:w-[400px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar Usuario
                </Button>
            </div>

            <UserList
                users={filteredUsers}
                isLoading={isLoading || isUserLoading}
                onEdit={handleEdit}
                comedores={comedores}
            />

            <UserForm
                isOpen={isFormOpen}
                onOpenChange={handleCloseForm}
                editingUser={editingUser}
            />
        </main>
    );
}
